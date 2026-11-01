# ernestchu/jetlink-diorama

## Resumen

Jetlink Diorama es un repositorio de modelos de percepción visual empaquetados para la aplicación Jetlink, una herramienta de anotación y visualización de datos de conducción autónoma compatible con openpilot. El repositorio lo publica el usuario ernestchu y contiene dos redes neuronales exportadas a ONNX y CoreML (fp16) que se ejecutan sobre el fotograma de cámara estrecha deformado (warped narrow camera frame) que proporciona comma.ai. No se trata de un modelo de lenguaje ni de un modelo generativo: es un paquete de inferencia visual con dos tareas concretas, segmentación panóptica y detección de profundidad 3D.

El primer componente es Mask2Former con backbone Swin-L, entrenado sobre el dataset Mapillary Vistas en su variante panóptica, que produce máscaras de segmentación semántica y de instancias sobre la escena de conducción. El segundo es DD3D con backbone VoVNet-99, entrenado sobre KITTI, que estima profundidad y cajas 3D de objetos. Ambos modelos reciben como entrada un tensor float16 de 6×128×256 en formato YUV empaquetado e incorporan su propio post-procesado dentro del grafo, de modo que la aplicación solo tiene que consumir la salida final.

La relevancia de este repositorio es práctica: sirve como distribución de pesos para la app de escritorio Jetlink en macOS, que descarga el manifiesto `diorama.json` y los grafos que este referencia. El tamaño del repo es de 2,1 GB, con 20 descargas y sin likes en el momento de la consulta, lo que indica un uso muy acotado dentro del ecosistema Jetlink/openpilot y no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Dos redes: Mask2Former (Swin-L) para segmentación panóptica y DD3D (VoVNet-99) para detección/profundidad 3D |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, entrada 6×128×256 YUV) |
| Tipos de cuantizacion | fp16 en los programas CoreML; ONNX exportado (precisión no especificada en la model card) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | Mixta: código MIT; pesos de segmentación sujetos a los términos de Mapillary Vistas; DD3D MIT (Toyota Research Institute); manifiesto `diorama.json` MIT |
| Formato de pesos | ONNX (`.onnx`) y CoreML (`.mlpackage`, fp16) |

## Arquitectura y entrenamiento

El repositorio no entrena modelos propios: redistribuye dos arquitecturas conocidas en formato de inferencia. El modelo de segmentación es Mask2Former con backbone Swin-L, una arquitectura transformer con decoder de consultas (queries) que realiza segmentación panóptica unificando semántica e instancias mediante attention enmascarada. Sus pesos provienen de `facebook/mask2former-swin-large-mapillary-vistas-panoptic`, entrenado sobre Mapillary Vistas, un dataset de imágenes de calle con anotaciones panópticas densas. El modelo de profundidad es DD3D con backbone VoVNet-99, del Toyota Research Institute, entrenado sobre KITTI para detección 3D y estimación de profundidad monocular.

La innovación del paquete no está en el entrenamiento sino en el empaquetado para despliegue: ambos modelos se exportan a ONNX mediante `python -m diorama export` desde el repositorio Jetlink, y también se distribuyen como programas CoreML nativos en fp16 para la app de macOS. La entrada está estandarizada como un fotograma YUV empaquetado de 6×128×256 en float16, y el post-procesado (umbrales, decodificación de máscaras y cajas) viaja dentro del propio grafo, lo que simplifica la integración en la app. El manifiesto `diorama.json` declara clases, umbrales, parámetros de cámara y los ficheros asociados.

## Capacidades

- Segmentación panóptica de escenas de conducción: máscaras semánticas y de instancias sobre el fotograma de cámara estrecha de openpilot.
- Detección 3D y estimación de profundidad monocular mediante DD3D sobre escenas tipo KITTI.
- Entrada estandarizada YUV 6×128×256 en float16, con post-procesado embebido en el grafo.
- Ejecución en dos runtimes: ONNX (multiplataforma) y CoreML nativo en fp16 (macOS).
- Integración con la app Jetlink mediante descarga automática del manifiesto `diorama.json`.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto ni capacidades multilingües: es un paquete de visión por computador.

## Casos de uso

- Visualización de percepción en Jetlink: la app de macOS descarga `diorama.json` y los grafos, y superpone las máscaras de segmentación y la profundidad DD3D sobre el fotograma de cámara para inspeccionar escenas de conducción.
- Anotación asistida de clips de openpilot: las máscaras panópticas de Mask2Former permiten pre-etiquetar carreteras, vehículos, peatones y vegetación antes de la revisión manual.
- Análisis de profundidad en revisiones de seguridad: DD3D aporta estimación de distancia monocular para comprobar si la percepción del vehículo detecta obstáculos a distancias coherentes.
- Depuración de fallos de percepción: al ejecutar los modelos sobre fotogramas concretos, un ingeniero puede aislar si el error está en la segmentación o en la estimación de profundidad.
- Prototipado en macOS sin GPU dedicada: los `.mlpackage` en fp16 se ejecutan con CoreML sobre la Neural Engine o la GPU integrada del Mac, lo que permite iterar localmente.
- Evaluación comparativa de backbones: al estar los dos modelos en ONNX, se pueden integrar en pipelines de validación propios para medir latencia y calidad frente a otras variantes de Mask2Former o DD3D.
- Demostraciones y formación: el paquete sirve para ilustrar cómo se empaquetan modelos de percepción para una app de escritorio con post-procesado embebido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la model card; el repo pesa 2,1 GB, lo que da una cota superior del tamaño conjunto de pesos.
- GPU recomendadas: no especificadas por el autor. La app Jetlink está orientada a macOS y ejecuta los `.mlpackage` mediante CoreML, por lo que se beneficia de Apple Silicon (Neural Engine/GPU integrada).
- ¿Cabe en GPU consumer? No hay datos de VRAM publicados; el tamaño del repo sugiere que sí es viable en GPUs consumer modernas, pero es una estimación, no un dato del autor.
- Opciones de despliegue: ONNX Runtime para los `.onnx`, CoreML para los `.mlpackage` en macOS, y la propia app Jetlink como cliente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tarea | Arquitectura | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jetlink Diorama (este repo) | Segmentación panóptica + profundidad 3D | Mask2Former Swin-L + DD3D VoVNet-99 | YUV 6×128×256 | Mixta (MIT + términos Mapillary Vistas) | ONNX y CoreML, 2,1 GB |
| facebook/mask2former-swin-large-mapillary-vistas-panoptic | Segmentación panóptica | Mask2Former Swin-L | Imagen RGB estándar | Términos de Mapillary Vistas | Pesos originales en HuggingFace |
| TRI-ML/dd3d | Detección 3D y profundidad | DD3D VoVNet-99 | Imagen RGB KITTI | MIT | Repositorio GitHub con pesos |
| Segment Anything (SAM) | Segmentación promptable | ViT | Imagen RGB | Apache 2.0 (versión original) | Pesos públicos |

La comparativa es limitada: Jetlink Diorama no aporta arquitecturas nuevas, sino una redistribución empaquetada de los dos primeros modelos con entrada YUV y post-procesado integrado. Frente a SAM, la diferencia clave es que Diorama está especializado en escenas de conducción y no admite prompts.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona y no soporta tool calling ni agentes.
- La licencia es mixta: el código es MIT, pero los pesos de segmentación están sujetos a los términos de Mapillary Vistas, que pueden restringir el uso comercial. Es imprescindible revisarlos antes de cualquier despliegue en producción.
- La entrada está fijada a 6×128×256 YUV del fotograma estrecho de openpilot; no admite imágenes RGB arbitrarias sin adaptación.
- Los modelos están entrenados para dominios concretos (Mapillary Vistas y KITTI), por lo que su generalización a otras cámaras, países o condiciones meteorológicas no está documentada.
- No hay datos publicados de precisión, latencia ni sesgos; cualquier evaluación de calidad debe hacerse por cuenta propia.
- El repo tiene 20 descargas y 0 likes, lo que sugiere poca validación comunitaria.
- El autor no documenta versiones ni changelog; los ficheros podrían cambiar sin aviso.
- La fecha de creación indicada (2026-10-31) es futura respecto a la información habitual de HuggingFace; conviene verificar la integridad del repo antes de confiar en él.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ernestchu/jetlink-diorama
- Repositorio Jetlink: https://github.com/zoompilot/jetlink
- Documentación de Diorama en Jetlink: `docs/diorama.md` del repositorio Jetlink
- Modelo de segmentación original: https://huggingface.co/facebook/mask2former-swin-large-mapillary-vistas-panoptic
- Repositorio DD3D: https://github.com/TRI-ML/dd3d
- Dataset Mapillary Vistas: https://www.mapillary.com/dataset/vistas
