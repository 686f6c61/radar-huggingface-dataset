# MarkFangGH911/pi3x-onnx-deploy

## Resumen

Pi3X-ONNX-Deploy es un paquete de despliegue que convierte Pi3X, un modelo de inteligencia espacial desarrollado por OpenDriveLab, a un formato desplegable con ONNX Runtime y TensorRT. El modelo original (disponible en el repositorio GitHub de OpenDriveLab Pi3) reconstruye geometría 3D a partir de imágenes RGB: dado un conjunto de imágenes con sus intrínsecos y poses de cámara, produce nubes de puntos 3D, poses de cámara y mapas de confianza, sin necesidad de mapas de profundidad como entrada.

Este repositorio, publicado por el usuario MarkFangGH911 en Hugging Face, no es un modelo nuevo, sino un empaquetado de despliegue: incluye los pesos originales de Pi3X en safetensors (5,4 GB), un modelo ONNX preexportado en fp16 con pesos externos (2,1 GB de datos), el subconjunto del código fuente del modelo (incluido el backbone DINOv2) y un conjunto de scripts para benchmarking, verificación de precisión y reexportación. Es relevante porque resuelve un problema práctico habitual en visión por computador: llevar un modelo de investigación con operadores no estándar (SVD, RoPE dinámico, atención SDPA) a un runtime de inferencia optimizado para producción.

El paquete documenta una conversión con unas 20 transformaciones técnicas (control flow fijado, RoPE estático, atención eager, reescritura equivalente GroupNorm→LayerNorm, SVD externalizado) y ofrece mediciones en H100 que muestran una aceleración de aproximadamente 2x con TensorRT frente a la línea base en PyTorch.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de inteligencia espacial (reconstruccion 3D multi-vista) con backbone DINOv2; detalles completos no disponibles |
| Parametros totales | no disponible (pesos originales: 5,4 GB en safetensors; ONNX fp16: 2,1 GB de datos externos) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplicable (no es un modelo de lenguaje); entrada de N imagenes por pasada, ejemplo validado con N=8 a 448x560 |
| Tipos de cuantizacion | fp16 (ONNX exportado y motor TensorRT en fp16); baseline en bf16 |
| Idiomas soportados | no aplicable (modelo de vision) |
| Licencia | no disponible en el repositorio (los pesos originales provienen de OpenDriveLab Pi3X; consultar la licencia del proyecto fuente) |
| Formato de pesos | safetensors (pesos originales PyTorch) y ONNX con pesos externos (.onnx + .onnx.data) |

## Arquitectura y entrenamiento

Pi3X es un modelo de inteligencia espacial de OpenDriveLab cuyo funcionamiento se basa en recibir multiples imagenes RGB junto con los intrinsecos y las poses de las camaras, y devolver puntos 3D locales, poses de camara, un factor metrico, rayos y logits de confianza. El paquete de despliegue incluye el subconjunto del codigo de definicion del modelo, que incorpora DINOv2 como backbone visual. No hay informacion en el repositorio sobre el numero de parametros, los datos de entrenamiento ni el procedimiento de entrenamiento del modelo original.

La aportacion tecnica principal del repositorio esta en la exportacion a ONNX: el autor documento unas 20 conversiones necesarias para que el modelo sea compatible con ONNX Runtime y TensorRT. Entre ellas destacan la fijacion del control flow, la estaticizacion del RoPE (rotary position embedding), la sustitucion de la atencion SDPA por atencion eager, una reescritura equivalente de GroupNorm a LayerNorm, y la externalizacion de la ortogonalizacion por SVD de las poses de camara (ONNX carece de operador SVD), que se restaura con una linea de codigo en el postproceso.

## Capacidades

- Reconstruccion 3D multi-vista a partir de imagenes RGB con intrinsecos y poses de camara, sin necesidad de mapas de profundidad de entrada.
- Generacion de nubes de puntos 3D y poses de camara metricas.
- Salida de logits de confianza por punto (convertibles a probabilidad mediante sigmoid) para filtrar geometria poco fiable.
- Despliegue en ONNX Runtime con execution providers CUDA y TensorRT (fp16).
- Scripts de verificacion de precision tensor a tensor entre baseline PyTorch y version desplegada.
- Reexportacion opcional del ONNX desde los pesos originales (por ejemplo, para cambiar la resolucion de entrada), con un tiempo de exportacion de unos 82 segundos.
- No es un modelo de lenguaje: no tiene capacidades de generacion de texto, razonamiento, codigo, tool calling ni agentes.

## Casos de uso

- Reconstruccion 3D de interiores: con el ejemplo incluido (8 imagenes 448x560 de una habitacion mas un archivo condition.npz), se puede generar una nube de puntos densa de una escena para visualizacion o modelado.
- Pipelines de SLAM o reconstruccion asistida: al aceptar poses de camara como entrada, puede integrarse en sistemas que ya estiman odometria visual y necesitan geometria densa consistente.
- Despliegue en produccion con TensorRT: la inferencia de 0,26-0,32 s por lote de 8 imagenes en H100 lo hace viable para servicios de reconstruccion en tiempo casi real.
- Robustecimiento de sistemas de percepcion: el mapa de confianza permite descartar regiones de la reconstruccion con geometria poco fiable antes de fusionarla con otros sensores.
- Comparacion de precision en migraciones de modelos: el script compare_baseline_vs_deploy.py sirve como plantilla reutilizable para validar cualquier conversion PyTorch→ONNX con metricas de error relativo por tensor.
- Fotogrametria ligera sin sensores de profundidad: equipos con solo camaras RGB calibradas pueden obtener geometria metrica sin hardware LiDAR o RGB-D.

## Benchmarks y rendimiento

El repositorio incluye mediciones propias del autor (H100, 8 imagenes de 448x560). No se trata de benchmarks academicos estandar (MMLU, HumanEval, etc.), sino de comparaciones de precision y velocidad entre esquemas de inferencia:

| Esquema | Carga | Inferencia por pasada | Error relativo medio (points) | Notas |
|---|---|---|---|---|
| PyTorch baseline (bf16 autocast + SDPA) | 11,3 s | 0,584 s | referencia (0) | uso original del repositorio |
| ONNX CUDA EP (fp16) | 12,4 s | 0,73 s | 0,60% | diferencia inherente a fp16 |
| ONNX TensorRT EP (fp16) | 83 s (cache de motor) | 0,26-0,32 s | 2,3% | ~2x mas rapido; primera construccion del motor ~17 min |

Los errores son errores absolutos medios relativos `mean(|a-b|)/mean(|b|)` tomando el baseline bf16 como referencia. Para `conf` y `local_points` el error con TensorRT es de solo 0,2-0,3%. El tiempo de inferencia fluctua con la carga de la GPU (medido en tarjeta compartida). No se han publicado resultados de benchmarks academicos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: pico de 16-22 GB en la fase ONNX (sin contar otras tareas en la tarjeta); se recomiendan al menos 16 GB de VRAM.
- GPU de referencia para las mediciones: NVIDIA H100 (arquitectura sm90). No hay mediciones en otras tarjetas.
- El cache de motores TensorRT esta ligado a la arquitectura de GPU (por ejemplo, sm90); al cambiar de tarjeta o de version de TensorRT hay que borrar trt_cache/ y reconstruir.
- Es plausible que quepa en GPUs consumer de gama alta con 24 GB de VRAM (como una RTX 4090), pero no hay mediciones que lo confirmen; en tarjetas de 16 GB podria estar justo el pico de memoria.
- Software: CUDA >= 11.8, PyTorch 2.x, onnx 1.17.0, onnxruntime-gpu 1.19.2, onnxscript 0.2.7 (version obligatoria por cambios de serializacion), opcionalmente tensorrt-cu12 10.5.0.
- Despliegue: ONNX Runtime (CUDA EP o TensorRT EP). No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Truco documentado: si ONNX Runtime no encuentra cuDNN/cuBLAS, importar torch antes de crear la sesion (los scripts incluidos ya incorporan la precarga via ctypes).
- Latencia: 0,26-0,32 s por pasada (TensorRT, H100) o 0,73 s (CUDA EP); throughput no disponible.

## Comparativa con modelos similares

No se han identificado en la informacion disponible paquetes de despliegue ONNX directamente comparables de otros modelos de inteligencia espacial. Como referencia de categoria, el modelo fuente es Pi3X de OpenDriveLab; el propio Pi3 (sin la variante X) es la alternativa mas cercana documentada en el ecosistema:

| Aspecto | Pi3X-ONNX-Deploy (este repo) | Pi3X original (OpenDriveLab) |
|---|---|---|
| Formato | ONNX fp16 + safetensors | PyTorch (safetensors) |
| Runtimes | ONNX Runtime CUDA/TensorRT | PyTorch |
| Inferencia (H100, 8x448x560) | 0,26-0,32 s (TRT) | 0,584 s (bf16 + SDPA) |
| Precision | hasta 2,3% de error relativo (TRT) | referencia |
| Entrada | RGB + intrinsecos + poses | RGB + intrinsecos + poses |
| Licencia | no disponible | consultar repo fuente |

Comparativas con otros modelos de reconstruccion 3D (DUSt3R, VGGT, MASt3R y similares) no disponibles en la informacion proporcionada.

## Limitaciones y advertencias

- La licencia del repositorio no esta declarada en Hugging Face; antes de cualquier uso comercial hay que verificar la licencia de los pesos originales de OpenDriveLab Pi3X y la del repositorio GitHub fuente.
- El error de precision con TensorRT en la nube de puntos es de 2,3% respecto al baseline bf16 (aunque conf y local_points se quedan en 0,2-0,3%); para aplicaciones metricas criticas conviene validar con datos propios.
- Las formas de entrada estan fijadas en el ONNX preexportado (B=1, N=8, 448x560); cambiar resolucion o numero de imagenes exige reexportar con export_onnx.py.
- La primera construccion del motor TensorRT tarda unos 17 minutos, y el cache es invalido entre arquitecturas de GPU o versiones de TensorRT.
- Hay restricciones de versiones estrictas (onnxscript 0.2.7, onnxruntime-gpu 1.19.x) y la reexportacion aplica dos parches temporales para bugs conocidos, lo que anade fragilidad ante actualizaciones de dependencias.
- El repositorio tiene 0 descargas y 0 likes registrados, y la model card original esta en chino; no hay comunidad de soporte visible ni revision independiente de las mediciones.
- No hay informacion sobre sesgos del modelo ni sobre su comportamiento fuera de las condiciones de entrada validadas; al ser un modelo de reconstruccion geometrica, el riesgo relevante es geometria incorrecta en escenas con poca textura, oclusiones o calibracion erronea, mas que alucinacion en sentido textual.
- El README original parece truncarse en la tabla de especificaciones de entrada/salida; algunos detalles del contrato de I/O (por ejemplo, el campo de poses completo) deben confirmarse en el codigo de deploy/pi3x_deploy.py.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/MarkFangGH911/pi3x-onnx-deploy
- Proyecto original Pi3 / Pi3X (OpenDriveLab): https://github.com/OpenDriveLab/Pi3

No se han encontrado en la informacion disponible enlaces adicionales a papers, demos u otros repositorios relacionados.
