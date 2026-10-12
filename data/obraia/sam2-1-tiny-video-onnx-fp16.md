# obraia/sam2.1-tiny-video-onnx-fp16

## Resumen

SAM 2.1 tiny, video pipeline, ONNX fp16 es una redistribución en formato ONNX de los cuatro grafos que componen el pipeline promptable de vídeo y memoria del modelo facebook/sam2.1-hiera-tiny, publicado por Meta dentro de la familia SAM 2. El autor, obraia, no entrena ningún modelo nuevo: convierte a precisión fp16 el export fp32 de jax-image-tools y ajusta los grafos para que sean compatibles con onnxruntime-web sobre WebGPU, de modo que la propagación de máscaras en vídeo pueda ejecutarse íntegramente dentro del navegador.

El paquete está pensado para un caso de uso muy concreto: el enmascarado de sujeto de Gausify Orbit, una aplicación de vídeo a Gaussian Splatting. Consta de cuatro grafos separados (vision_encoder.onnx, mask_decoder.onnx, memory_attention.onnx y memory_encoder.onnx) más un fichero constants.json que describe la geometría del banco de memoria, que no forma parte de ningún grafo. El repositorio ocupa aproximadamente 0,1 GB y los pesos suman unos 83,5 MB en fp16.

Su relevancia es doble. Por un lado, demuestra que un modelo de segmentación de vídeo con memoria temporal puede ejecutarse en el navegador con latencias de menos de un segundo por fotograma, gracias a WebGPU y a la extensión shader-f16. Por otro, mantiene la interfaz de entrada y salida en fp32 (keep_io_types=True), lo que permite reutilizar sin cambios el código escrito para el export fp32 de origen. La licencia Apache-2.0 se hereda del modelo base de Meta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SAM 2.1 con codificador de imagen Hiera (transformer jerárquico) y pipeline de memoria para vídeo |
| Parametros totales | no disponible (variante tiny del modelo base facebook/sam2.1-hiera-tiny) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo de segmentación; el estado temporal lo gestiona el banco de memoria, no una ventana de contexto) |
| Tipos de cuantizacion | fp16 (única precisión publicada en este repo); fp32 en el export de origen |
| Idiomas soportados | no disponible (modelo de segmentación; las indicaciones son puntos, cajas o máscaras, no texto) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (grafos en fp16, entradas y salidas declaradas en fp32) |

## Arquitectura y entrenamiento

La arquitectura subyacente es SAM 2.1, la evolución del Segment Anything Model orientada a vídeo. El codificador de imagen es un Hiera, un transformer jerárquico que evita las operaciones de ventana y las convoluciones dispersas habituales en los ViT de segmentación. Sobre él se monta el pipeline promptable de vídeo, que en este export se descompone en cuatro grafos: el codificador de visión, el decodificador de máscaras, la atención de memoria y el codificador de memoria. El estado temporal no vive en un grafo, sino en el banco de memoria descrito por constants.json.

No hay entrenamiento propio en este repositorio. El autor parte del export fp32 jax-image-tools/sam21-tiny-video-onnx (commit 3cb090d9d0b4c897281fdcac7765c0f3a888c49f) y aplica dos cambios. Primero, en el codificador de visión sustituye los dos nodos If de la interpolación de embeddings posicionales de Hiera por la rama else (una Identity), dado que con la entrada fija de 1024×1024 esa rama es siempre la que se toma; la salida es idéntica (diferencia máxima de 0 sobre una entrada aleatoria) y se elimina una forma mal declarada en la rama then que onnxruntime-web 1.30 rechaza. Segundo, convierte a fp16 con onnxruntime.transformers.float16.convert_float_to_float16 usando keep_io_types=True, dejando en fp32 las operaciones Range, Resize, Sin, Cos y CumSum, que forman parte del cálculo del positional encoding, además de la lista de bloqueo por defecto del conversor. El script export_fp16.py del propio repositorio reproduce los ficheros byte a byte.

## Capacidades

- Segmentación de vídeo promptable: genera y propaga máscaras a lo largo de fotogramas a partir de indicaciones del usuario (puntos, cajas o máscaras previas).
- Propagación con memoria temporal: el banco de memoria mantiene información de fotogramas anteriores, lo que permite seguir objetos a lo largo de un vídeo sin reindicarlos en cada fotograma.
- Generación de máscaras de alta calidad por fotograma, con IoU medio de 0,996 frente al pipeline fp32 de PyTorch (propagate_in_video_iterator).
- Segmentación de sujeto orientada a posproducción: el caso de uso declarado es el enmascarado de sujeto para una aplicación de vídeo a Gaussian Splatting.
- Ejecución en navegador: compatible con onnxruntime-web sobre WebGPU con la extensión shader-f16.
- Interfaz compatible con el export fp32: nombres, formas y tipos de entradas y salidas se mantienen, con lo que el código cliente no requiere cambios.
- No soporta tool calling, function calling, agentes, generación de texto, razonamiento, código, matemáticas ni visión generalista: es exclusivamente un modelo de segmentación.

## Casos de uso

- Segmentación de sujeto para vídeo a Gaussian Splatting: reconstrucción 3D de escenas donde las máscaras por fotograma aíslan al sujeto del fondo antes de ajustar las gaussianas; es el escenario para el que se creó el paquete (Gausify Orbit).
- Rotoscopia asistida en navegador: un editor web puede ofrecer propagación de máscaras sobre un clip sin enviar el vídeo a un servidor, con latencias de ~0,78 s por fotograma en hardware Apple M4.
- Herramientas de edición de vídeo sin instalación: al ejecutarse sobre onnxruntime-web y WebGPU, la segmentación puede integrarse en aplicaciones web que solo requieren un navegador compatible con shader-f16.
- Preprocesado de datasets de vídeo: generación automática de máscaras de sujeto para entrenar otros modelos (por ejemplo, matting, seguimiento o restauración) en pipelines por lotes.
- Seguimiento de objetos en clips cortos: la memoria temporal permite mantener la máscara de un objeto entre fotogramas, útil en análisis deportivo o vigilancia con clips de decenas de fotogramas.
- Prototipado e investigación en segmentación de vídeo: el tamaño reducido del repo (0,1 GB) facilita su uso como referencia para comparar variantes fp16 y fp32 en términos de precisión y velocidad.
- Aplicaciones móviles o de escritorio con WebGPU: el reducido tamaño de los pesos (83,5 MB en fp16) permite desplegarlo en equipos con recursos limitados.
- Demostraciones interactivas en el navegador: permite publicar demos de segmentación de vídeo sin backend de GPU, reduciendo costes de infraestructura.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son las mediciones del propio autor, realizadas en Chrome headless sobre un Apple M4 con WebGPU y comparadas contra los grafos fp32 del export de origen.

| Metrica | Resultado | Condiciones |
|---|---|---|
| IoU por fotograma frente a fp32 | ≥ 0,993 | Dos vídeos de órbita, 48 y 60 fotogramas |
| IoU medio por fotograma frente a propagate_in_video_iterator de PyTorch (fp32) | 0,996 | Propagación completa |
| IoU frente a máscaras de referencia | sin cambios respecto a fp32 | Órbita sintética |
| Velocidad | ~0,78 s/fotograma (fp16) frente a ~1,15 s/fotograma (fp32) | Propagación completa con banco de memoria lleno, Apple M4, Chrome headless |
| Diferencia de salida del codificador de visión tras sustituir los nodos If | máximo 0 | Entrada aleatoria |

No se han publicado resultados de benchmarks estándar (por ejemplo, DAVIS, MOSE o SA-V) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja; los cuatro grafos suman unos 83,5 MB en fp16, por lo que el uso de memoria del runtime será del orden de unos cientos de MB incluyendo el banco de memoria y las activaciones, aunque no se especifica una cifra exacta.
- GPU recomendadas: cualquier GPU con soporte de WebGPU y shader-f16 (por ejemplo, Apple Silicon M-series, GPUs integradas recientes y GPUs dedicadas con drivers actualizados). No se requiere una A100 ni una H100.
- Cabe en GPU de consumo: sí, y también en muchos sistemas integrados y móviles con WebGPU; el autor valida el caso en un Apple M4.
- Opciones de despliegue: onnxruntime-web sobre WebGPU (ruta validada por el autor); en principio también ONNX Runtime nativo o cualquier runtime compatible con ONNX, aunque no se documenta en la información disponible. No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI, que son runtimes de modelos generativos.
- Latencia y throughput: ~0,78 s por fotograma en Apple M4 con Chrome headless y banco de memoria lleno, frente a ~1,15 s por fotograma en fp32. No se publican cifras de throughput agregado ni mediciones en otras GPU.
- Requisito de software: onnxruntime-web 1.30 o superior (la versión 1.30 rechaza el export fp32 original por la forma mal declarada en la rama then del codificador de visión).

## Comparativa con modelos similares

| Modelo | Parametros | Formato | Precision | Entorno de ejecucion | Licencia | Notas |
|---|---|---|---|---|---|---|
| obraia/sam2.1-tiny-video-onnx-fp16 | no disponible (variante tiny) | ONNX | fp16 (I/O fp32) | onnxruntime-web / WebGPU | Apache-2.0 | Este repositorio; ~0,78 s/fotograma en Apple M4 |
| jax-image-tools/sam21-tiny-video-onnx | no disponible (variante tiny) | ONNX | fp32 | ONNX Runtime | Apache-2.0 | Export de origen del que deriva este paquete; ~1,15 s/fotograma en Apple M4 |
| facebook/sam2.1-hiera-tiny | no disponible (variante tiny) | PyTorch (safetensors) | fp32 | PyTorch | Apache-2.0 | Modelo base de Meta con todo el pipeline de vídeo y banco de memoria en código Python |
| Otras variantes de SAM 2.1 (hiera-small, base-plus, large) | no disponible | PyTorch, ONNX | fp32 | PyTorch u ONNX Runtime | Apache-2.0 | Misma familia, mayor capacidad y coste; no se comparan aquí por falta de datos en la información disponible |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni razonamiento. Cualquier expectativa de uso como LLM o VLM es incorrecta.
- La calidad se ha medido contra el export fp32 de origen y contra máscaras de referencia en una órbita sintética, no sobre benchmarks estándar de segmentación de vídeo (DAVIS, MOSE, SA-V). El rendimiento en dominios distintos al vídeo de órbita no está documentado.
- La reducción a fp16 introduce un error pequeño pero no nulo: el IoU por fotograma frente a fp32 es ≥ 0,993, no 1,0, salvo en el codificador de visión, donde la diferencia es exactamente 0.
- Las operaciones de positional encoding (Range, Resize, Sin, Cos, CumSum) permanecen en fp32 por decisión de diseño; modificarlas podría degradar la precisión.
- El paquete solo incluye el pipeline de vídeo en su forma de cuatro grafos. El banco de memoria no es un grafo y debe gestionarse en código externo a partir de constants.json, lo que exige implementar la lógica de propagación.
- Requiere onnxruntime-web 1.30 o superior y WebGPU con shader-f16; sin esa extensión, el modelo no se ejecutará correctamente en el navegador.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado y actualizado el mismo día (11 de octubre de 2026). No hay validación comunitaria independiente.
- Licencia Apache-2.0, heredada de facebook/sam2.1-hiera-tiny: permite uso comercial, pero el redistribuidor debe conservar los avisos de licencia y de modificaciones. Conviene revisar los términos de SAM 2 de Meta para el modelo base.
- La búsqueda web asociada no devolvió enlaces relevantes sobre este modelo (solo resultados de YouTube sin relación), por lo que no hay documentación externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/obraia/sam2.1-tiny-video-onnx-fp16
- Modelo base: https://huggingface.co/facebook/sam2.1-hiera-tiny
- Export fp32 de origen: https://huggingface.co/jax-image-tools/sam21-tiny-video-onnx
- Script de conversión incluido en el repositorio: export_fp16.py
