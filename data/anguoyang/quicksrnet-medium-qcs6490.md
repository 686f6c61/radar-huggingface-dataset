# anguoyang/quicksrnet-medium-qcs6490

## Resumen

QuickSRNet Medium es un modelo de superresolución de imagen (upscaling 4x) desarrollado originalmente por Qualcomm AI Research y distribuido a través del ecosistema `qai-hub-models`. La ficha que nos ocupa, publicada por el usuario `anguoyang`, no contiene los pesos del modelo, sino una medición independiente de su rendimiento de inferencia sobre el SoC Qualcomm QCS6490, integrado en el kit Dragonwing RB3 Gen 2 Vision Kit. El objetivo declarado es aportar un punto de referencia en fp32 bajo un protocolo uniforme, complementando las entradas cuantizadas que ya figuran en el `perf.yaml` upstream (versión 0.66.0).

El modelo resuelve la tarea de reescalado de imágenes de 128×128 a 512×512 píxeles mediante una red neuronal convolucional ligera, pensada para ejecutarse en dispositivos de borde con recursos limitados. Su relevancia actual reside en la creciente demanda de pipelines de visión por computador en tiempo real sobre hardware embebido (cámaras inteligentes, drones, IoT industrial), donde el coste energético y la latencia importan tanto como la calidad de la reconstrucción.

La medición reportada es de 12,9 ms por inferencia (12.928 µs) sobre QCS6490 con runtime QNN y precisión fp32 ONNX, usando las opciones de compilación por defecto de Qualcomm AI Hub sin cuantización explícita. Se trata de una estimación por grafo (`execution_summary.estimated_inference_time`), no de una latencia de aplicación de extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red convolucional ligera para superresolución (QuickSRNet, variante Medium); detalles de capas no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | fp32 medido en esta ficha; el `perf.yaml` upstream incluye variantes cuantizadas para RB3 (tipos concretos no disponibles) |
| Idiomas soportados | no aplica (modelo de imagen) |
| Licencia | BSD-3-Clause (licencia upstream del modelo original) |
| Formato de pesos | ONNX (exportado desde `qai-hub-models` 0.66.0, 248.942 bytes); no se publican pesos en esta ficha |

## Arquitectura y entrenamiento

QuickSRNet es una familia de redes convolucionales diseñadas por Qualcomm AI Research para superresolución eficiente en dispositivos de borde. La variante Medium se sitúa entre las versiones Small y Large en términos de coste computacional y calidad de reconstrucción. La arquitectura sigue el paradigma de superresolución de imagen única (SISR) con un factor de escala 4x, tomando como entrada tensores de 1×3×128×128 y produciendo salidas de 1×3×512×512.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se emplearon técnicas de alineación como RLHF o DPO (poco habituales en modelos de visión). Tampoco se especifican innovaciones técnicas concretas más allá de la propia optimización para hardware Qualcomm vía QNN y AI Hub. El modelo exportado en ONNX ocupa 248.942 bytes, lo que sugiere una red de muy baja huella en disco.

## Capacidades

- Superresolución de imagen única con factor de escala 4x: transforma entradas de 128×128 píxeles en salidas de 512×512.
- Procesamiento de imágenes RGB (3 canales) en formato tensorial NCHW.
- Inferencia optimizada para el SoC Qualcomm QCS6490 mediante el runtime QNN.
- Ejecución en dispositivos de borde del ecosistema Qualcomm AI Hub (compilación y perfilado vía API).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades multilingües ni de modo thinking (no aplica).
- No se documentan capacidades de visión más allá del upscaling (detección, segmentación, etc. no disponibles).

## Casos de uso

- Mejora de imágenes en cámaras embebidas: el modelo puede integrarse en el pipeline de captura de una cámara IoT para reescalar fotogramas de baja resolución (128×128) a 512×512 antes de enviarlos a un servicio de análisis, reduciendo el ancho de banda necesario en la transmisión.
- Preprocesado para modelos de visión downstream: en un sistema de inspección industrial con un SoC QCS6490, se puede aplicar QuickSRNet Medium para aumentar la resolución de parches recortados antes de pasarlos a un detector o clasificador que requiera entradas de mayor tamaño.
- Visión artificial en drones y robótica de bajo consumo: con 12,9 ms por inferencia en fp32 sobre QCS6490, el modelo es apto para pipelines que necesiten varios fotogramas por segundo en un dispositivo alimentado por batería, siempre que la latencia agregada del sistema lo permita.
- Restauración de miniaturas y previews en aplicaciones móviles: el modelo puede generar versiones ampliadas de imágenes de baja resolución almacenadas o transmitidas, con un coste computacional muy bajo (248.942 bytes de pesos ONNX).
- Prototipado rápido en Qualcomm AI Hub: al estar disponible en `qai-hub-models`, los desarrolladores pueden compilarlo y perfilarlo en la nube para validar latencias antes de comprometerse con hardware, usando los job IDs de referencia (`j5qdjnreg` para compilación, `jglqjd22p` para perfilado).
- Benchmarking de hardware de borde: la ficha sirve como punto de referencia fp32 reproducible para comparar el rendimiento de distintos SoCs o configuraciones de compilación dentro de un barrido uniforme de modelos (el autor reporta 28 modelos en 14 categorías).

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Tiempo de inferencia estimado | 12,9 ms (12.928 µs) |
| Entrada | 1 × 3 × 128 × 128 |
| Salida | 1 × 3 × 512 × 512 |
| Dispositivo | Dragonwing RB3 Gen 2 Vision Kit (QCS6490) |
| Runtime | QNN |
| Precision | fp32 ONNX, compilación por defecto de AI Hub (sin cuantización explícita) |
| Fecha de medición | 2026-11-20 |
| Metodo | Perfilado de grafo único vía API de Qualcomm AI Hub (`submit_inference_job(..., profile=True)`) |
| Job IDs | Compilación `j5qdjnreg`, perfilado `jglqjd22p` |

No se han publicado resultados de benchmarks de calidad de imagen (PSNR, SSIM, LPIPS) en la información disponible. La comparación con las entradas cuantizadas del `perf.yaml` upstream no es directa, según advierte el propio autor, debido a las diferencias de protocolo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el modelo está pensado para ejecutarse en el SoC QCS6490, que emplea memoria unificada y no GPU discreta.
- GPU recomendadas: Qualcomm QCS6490 (Dragonwing RB3 Gen 2 Vision Kit) es el hardware medido. No se documentan otras GPU.
- Compatibilidad con GPU de consumo: no disponible; el modelo está exportado a ONNX y compilado para QNN, por lo que su despliegue en GPUs NVIDIA/AMD requeriría una ruta de ejecución distinta (por ejemplo, ONNX Runtime) no validada en esta ficha.
- Opciones de despliegue: Qualcomm AI Hub (compilación y perfilado en la nube), runtime QNN en dispositivo. Otras opciones como vLLM, llama.cpp, Ollama o TGI no aplican (no es un modelo de lenguaje).
- Latencia y throughput estimados: 12,9 ms por inferencia de 128×128 a 512×512 en fp32 sobre QCS6490; el throughput teórico máximo sería de aproximadamente 77 inferencias por segundo en condiciones ideales, aunque el autor no reporta medidas de throughput sostenido ni latencia de extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QuickSRNet Medium (esta ficha) | no disponible | no aplica | 12,9 ms en QCS6490 (fp32 ONNX, QNN) | BSD-3-Clause | Pesos vía `qai-hub-models`; esta ficha solo publica mediciones |
| QuickSRNet Small | no disponible | no aplica | no disponible en esta ficha | BSD-3-Clause | `qai-hub-models` |
| QuickSRNet Large | no disponible | no aplica | no disponible en esta ficha | BSD-3-Clause | `qai-hub-models` |
| Otras variantes cuantizadas de QuickSRNet Medium | no disponible | no aplica | Entradas en `perf.yaml` 0.66.0 para RB3; no comparables directamente según el autor | BSD-3-Clause | `qai-hub-models` |

No se dispone de datos de rendimiento de las variantes Small, Large ni de las versiones cuantizadas en la información proporcionada, por lo que la comparativa cuantitativa queda limitada al punto de referencia fp32 reportado.

## Limitaciones y advertencias

- El autor advierte explícitamente que la medición fp32 no es directamente comparable con las entradas cuantizadas del `perf.yaml` upstream, debido a diferencias de protocolo (compilación por defecto, grafo único, sin cuantización explícita).
- La cifra de 12,9 ms es una estimación por grafo (`estimated_inference_time`), no una latencia de aplicación de extremo a extremo; en producción habrá que añadir costes de pre/postprocesado, transferencia de memoria y scheduling.
- Esta ficha no publica pesos ni artefactos compilados; solo números medidos y metodología. Quien quiera usar el modelo debe obtenerlo desde `qai-hub-models` 0.66.0.
- No se dispone de información sobre sesgos, calidad de reconstrucción (PSNR/SSIM), comportamiento en dominios fuera de distribución ni robustez ante imágenes ruidosas.
- La licencia BSD-3-Clause del modelo upstream permite uso comercial con atribución, pero conviene verificar los términos exactos del repositorio original antes de desplegarlo en producción.
- El modelo está optimizado para el ecosistema Qualcomm (QNN, AI Hub); su portabilidad a otros runtimes (ONNX Runtime, TensorRT) no está validada en esta ficha.
- No es un modelo de lenguaje: no soporta generación de texto, razonamiento, código, matemáticas ni tool calling. Cualquier uso en esos dominios requeriría otro modelo.
- La fecha de creación de la ficha (2026-11-19) y la de medición (2026-11-20) son posteriores a la fecha actual de referencia; conviene tratar los datos como procedentes de un entorno de publicación programada o de un repositorio con fechas adelantadas.

## Enlaces

- Ficha en Hugging Face: https://huggingface.co/anguoyang/quicksrnet-medium-qcs6490
- Repositorio qcs-model-zoo: https://github.com/anguoyang/qcs-model-zoo
- Repositorio qcs-bench: https://github.com/anguoyang/qcs-bench
- Qualcomm AI Hub (modelos y compilación): https://aihub.qualcomm.com/
- Repositorio `qai-hub-models`: https://github.com/quic/ai-hub-models
- Documentación de Qualcomm QCS6490: no disponible en la información proporcionada
