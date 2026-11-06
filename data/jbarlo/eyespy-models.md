# jbarlo/eyespy-models

## Resumen

`jbarlo/eyespy-models` es un repositorio de artefactos de inferencia en formato ONNX que da soporte a la aplicación de escritorio [eyespy](https://github.com/jbarlo/eyespy). No se trata de un modelo entrenado por el autor, sino de una distribución empaquetada de pesos procedentes de dos familias de modelos: SAM 3 (Segment Anything Model 3, de Meta) para segmentación y detección guiada por texto, y DINOv2-small para clasificación de imágenes. El repositorio agrupa los ficheros que la aplicación descarga en tiempo de ejecución, fijados a un commit concreto y verificados mediante SHA-256.

La relevancia del repositorio es fundamentalmente práctica: ofrece los modelos ya convertidos a ONNX y optimizados en precisión (fp16 y fp32) para ejecutarse en el navegador o en entornos de escritorio basados en WebGPU, sin necesidad de infraestructura Python ni de pesos en formato nativo de PyTorch. Esto lo convierte en un punto de entrada útil para desarrolladores que quieran integrar segmentación y clasificación visual en aplicaciones cliente ligeras.

El tamaño total del repositorio es de 1,9 GB y la licencia del componente principal (SAM 3) es la SAM License, que no es una licencia de código abierto en sentido estricto. El componente DINOv2-small se distribuye bajo Apache-2.0. No se dispone de información sobre parámetros, contexto o idiomas, ya que el repositorio no documenta esos datos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (se distribuyen artefactos ONNX de SAM 3 y DINOv2-small; la arquitectura interna no se documenta en el repositorio) |
| Parametros totales | No disponible |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP16 (vision, text, detector) y FP32 (detector) |
| Idiomas soportados | No disponible |
| Licencia | SAM License para `sam3/` (no es open source); Apache-2.0 para `dinov2-small/` |
| Formato de pesos | ONNX (`vision_fp16.onnx`, `text_fp16.onnx`, `detector_fp32_nosign.onnx`, `detector_fp16_nosign.onnx`, `model_cls.onnx`) |

## Arquitectura y entrenamiento

El repositorio no contiene información sobre el entrenamiento de los modelos subyacentes, ya que el autor no los ha entrenado: se limita a redistribuir artefactos exportados. Los ficheros de `sam3/` corresponden a SAM 3, el modelo de segmentación de Meta que combina un codificador de visión y un codificador de texto para segmentación y detección guiada por prompts textuales; el repositorio incluye un `tokenizer.json` junto a los grafos `vision_fp16.onnx` y `text_fp16.onnx`, más dos variantes del detector (`fp32` y `fp16`, ambas con sufijo `nosign`, presumiblemente sin cabecera de firma o sin post-procesado de firma). Los ficheros de `dinov2-small/` corresponden a DINOv2-small de Meta, un transformer de visión auto-supervisado, exportado como `model_cls.onnx` para clasificación.

No se documentan en el repositorio ni el número de tokens de entrenamiento, ni la composición del dataset, ni si hubo RLHF/DPO, ni innovaciones técnicas específicas de la exportación (más allá de la conversión a ONNX y la reducción a FP16). Los detalles de procedencia y cambios respecto a los originales se indican en `sam3/NOTICE-SAM.txt` y `dinov2-small/NOTICE.txt`, que no se han incluido en la información proporcionada.

## Capacidades

- Segmentación de imágenes guiada por texto mediante SAM 3 (prompts textuales procesados por `text_fp16.onnx` y codificados visualmente por `vision_fp16.onnx`).
- Detección de objetos con los grafos `detector_fp32_nosign.onnx` y `detector_fp16_nosign.onnx`.
- Clasificación de imágenes con DINOv2-small (`model_cls.onnx`).
- Ejecución en WebGPU, según la etiqueta del repositorio, orientada a aplicaciones cliente.
- Verificación de integridad de los ficheros mediante SHA-256 y fijación a un commit concreto.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes ni multilingüismo.

## Casos de uso

- Segmentación interactiva en aplicaciones de escritorio: la app eyespy descarga `vision_fp16.onnx` y `text_fp16.onnx` para segmentar regiones de una imagen a partir de descripciones textuales, aprovechando la ejecución ONNX en WebGPU sin backend Python.
- Herramientas de anotación de datasets: el detector en FP16 permite pre-etiquetar objetos en lotes de imágenes, reduciendo el trabajo manual en pipelines de etiquetado.
- Edición fotográfica asistida: integración de la segmentación por texto para generar máscaras de recorte o sustitución de fondo en un editor de imágenes de escritorio.
- Búsqueda visual por descripción: combinación del codificador de texto de SAM 3 con el detector para localizar objetos descritos en lenguaje natural dentro de una biblioteca de imágenes local.
- Clasificación rápida de imágenes con DINOv2-small: uso de `model_cls.onnx` para tareas de clasificación o filtrado previo en aplicaciones cliente con recursos limitados, dado el reducido tamaño del modelo small.
- Distribución verificable de modelos en aplicaciones: el repositorio sirve como ejemplo de patrón de empaquetado (commit fijo, SHA-256 por fichero, NOTICE de licencias) para equipos que necesiten distribuir pesos de terceros de forma auditable.
- Pruebas de integración ONNX/WebGPU: validación de pipelines de inferencia en navegador usando los grafos FP16 frente a los FP32 del detector.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio ocupa 1,9 GB en disco, pero el consumo en memoria de cada grafo ONNX no se documenta.
- GPU recomendadas: no disponible. La etiqueta `webgpu` sugiere ejecución en GPU integradas o discretas a través de WebGPU, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada; la presencia de variantes FP16 apunta a que el autor busca reducir requisitos, pero no hay cifras.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio) y WebGPU; no se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de visión de este tipo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Contexto / parametros | Disponibilidad |
|---|---|---|---|---|---|
| `jbarlo/eyespy-models` (SAM 3 + DINOv2-small empaquetados) | Segmentación y clasificación de imágenes | ONNX (FP16/FP32) | SAM License + Apache-2.0 | No disponible | Hugging Face, 0 descargas |
| SAM 3 original (Meta) | Segmentación guiada por texto | PyTorch | SAM License | No disponible en la información proporcionada | Distribución oficial de Meta |
| DINOv2-small original (Meta) | Visión auto-supervisada | PyTorch | Apache-2.0 | No disponible en la información proporcionada | Hugging Face / repositorio de Meta |
| SAM 2 (Meta) | Segmentación de vídeo e imagen | PyTorch | Apache-2.0 (según versión) | No disponible | Hugging Face |

La comparativa se limita a señalar que este repositorio no aporta pesos nuevos, sino una conversión a ONNX de los modelos originales; cualquier comparación de rendimiento frente a los originales requeriría benchmarks que no se han publicado.

## Limitaciones y advertencias

- La licencia de `sam3/` es la SAM License, que el propio autor describe como "not an open-source licence"; el uso comercial requiere revisar los términos en `sam3/LICENSE-SAM.txt`.
- El repositorio no documenta sesgos, tasas de alucinación ni limitaciones de idioma de los modelos subyacentes.
- Al ser artefactos exportados, cualquier cambio en los pesos originales o en el proceso de exportación puede alterar el comportamiento; la app mitiga esto fijando un commit y verificando SHA-256.
- El sufijo `nosign` en los detectores sugiere que estos grafos pueden no incluir ciertas cabeceras o post-procesados; conviene validar la salida antes de usarlos en producción.
- No hay información sobre el rendimiento real en WebGPU ni sobre la latencia en hardware de consumo.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay evidencia de uso en producción ni de validación por la comunidad.
- No se especifican los idiomas soportados por el codificador de texto de SAM 3 en esta distribución.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/jbarlo/eyespy-models
- Aplicación eyespy: https://github.com/jbarlo/eyespy
- Licencia SAM: https://huggingface.co/jbarlo/eyespy-models/blob/main/sam3/LICENSE-SAM.txt
- Aviso de procedencia SAM: `sam3/NOTICE-SAM.txt` (en el repositorio)
- Aviso de procedencia DINOv2: `dinov2-small/NOTICE.txt` (en el repositorio)
- Licencia DINOv2-small: `dinov2-small/LICENSE.txt` (en el repositorio)
