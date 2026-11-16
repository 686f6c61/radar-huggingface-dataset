# fastforks/perception-encoder

## Resumen

Perception Encoder (PE) es una familia de torres de visión (image towers) publicada por Meta en 2025 (Bolya et al.) y redistribuida en este repositorio por el proyecto fastforks. No se trata de un modelo generativo de texto, sino de un extractor de características visuales basado en Vision Transformer con RoPE 2D, diseñado para producir representaciones de imagen de alta calidad utilizables como backbone en tareas de visión por computador. El repositorio `fastforks/perception-encoder` es únicamente una model card: no aloja pesos, sino que documenta cómo descargar los pesos originales del autor desde Hugging Face (repositorios `timm/vit_pe_*`) y verificarlos mediante SHA-256.

La familia se divide en dos variantes funcionales. PE core está entrenada con objetivos contrastivos imagen-texto y produce un embedding global de imagen mediante attention pooling, lo que la hace adecuada para clasificación zero-shot, retrieval y tareas de alineación multimodal. PE spatial está destilada a partir de PE core con alineación de características de máscara de SAM 2, y ofrece características densas por parche orientadas a detección y segmentación, sin pooler aprendido (el `pooler_output` es la media de los tokens de parche, al estilo de timm).

El interés actual de esta ficha es doble: por un lado, documenta una familia de encoders visuales de referencia con licencia Apache-2.0 y uso comercial permitido; por otro lado, el repositorio en sí es un ejemplo de empaquetado ligero que separa la definición del modelo (código y metadatos) de los pesos, delegando la descarga y verificación en el runtime de fastforks. Existen diez variantes que cubren desde configuraciones tiny hasta gigantic, con resoluciones de parche y entrada que van de 224 a 512 píxeles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con RoPE 2D; PE core con attention pooling, PE spatial con pooler tipo timm (media de tokens de parche) |
| Parametros totales | no disponible (la model card no publica recuentos por variante; las variantes van de tiny a gigantic) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión); entrada de cualquier tamaño H x W >= 1, redimensionada o rellenada internamente |
| Tipos de cuantizacion | no disponible (la model card solo documenta ejecución en fp16 en las pruebas de memoria) |
| Idiomas soportados | no disponible (modelo de imagen; no procesa texto de forma nativa) |
| Licencia | Apache-2.0 (código y pesos; uso comercial permitido según la tabla de variantes) |
| Formato de pesos | safetensors (pesos originales del autor, no alojados en este repositorio) |

## Arquitectura y entrenamiento

La arquitectura es un Vision Transformer estándar con parches no solapados y codificación posicional mediante RoPE 2D, lo que permite procesar imágenes de cualquier resolución sin reentrenar el encoder posicional. PE core se entrena con un objetivo contrastivo sobre miles de millones de pares imagen-texto web curados con el pipeline MetaCLIP, seguido de un ajuste fino con pares vídeo-texto. PE spatial se obtiene por destilación desde PE core-G (la variante gigantic) alineando las características densas con las características de máscara de SAM 2, siguiendo el artículo original de Perception Encoder. Los datos de entrenamiento no están publicados.

La innovación técnica principal es la combinación de RoPE 2D con dos cabezas de salida diferenciadas: un embedding global por attention pooling para tareas de alineación semántica y un conjunto de características densas por parche para tareas de localización. El repositorio fastforks añade una capa de empaquetado que ofrece dos backends (`portable` y `kernels`) y verifica la integridad de los pesos descargados mediante SHA-256 contra los hashes registrados en `card.toml`. Las salidas expuestas son `last_hidden_state`, `pooler_output` y `hidden_states`.

## Capacidades

- Extracción de características globales de imagen (embedding de imagen) mediante PE core, útil para clasificación, retrieval y alineación con texto.
- Extracción de características densas por parche mediante PE spatial, orientadas a detección de objetos y segmentación.
- Procesamiento de imágenes de cualquier tamaño H x W >= 1, con redimensionado o padding interno; probado hasta 3000x4000 en varias variantes.
- Soporte de dos backends de ejecución: `portable` (PyTorch estándar) y `kernels` (kernels optimizados publicados en `fastforks/kernels`).
- Salidas múltiples (`last_hidden_state`, `pooler_output`, `hidden_states`) compatibles con el ecosistema timm.
- No soporta tool calling, agentes, razonamiento multi-step ni generación de texto: es exclusivamente un encoder visual.
- No dispone de capacidades multilingües ni de procesamiento de audio.

## Casos de uso

- Búsqueda visual y retrieval imagen-imagen o imagen-texto: el embedding global de PE core permite indexar un catálogo de imágenes y recuperar las más similares mediante similitud coseno, con la ventaja de que el modelo acepta resoluciones variables sin recodificar posiciones.
- Clasificación zero-shot de imágenes: usando PE core junto con prototipos textuales, se puede clasificar contenido visual sin entrenamiento específico, aprovechando el entrenamiento contrastivo con pares imagen-texto de MetaCLIP.
- Detección de objetos y segmentación: PE spatial proporciona características densas por parche alineadas con SAM 2, lo que permite conectarlo como backbone a cabezas de detección o segmentación existentes.
- Moderación de contenido visual: el encoder puede generar embeddings de imágenes para alimentar clasificadores ligeros de contenido sensible, con la ventaja de que la licencia Apache-2.0 permite uso comercial.
- Preprocesado en pipelines multimodales: PE core puede actuar como torre de visión de un sistema VLM, sustituyendo al encoder por defecto y aprovechando su robustez a resoluciones arbitrarias.
- Análisis de imágenes de alta resolución en medicina o industria: la capacidad de procesar entradas de hasta 3000x4000 con consumo moderado de memoria (por ejemplo, 1,2 GiB en `pe-core-s16-384`) permite analizar imágenes satelitales, radiografías o inspecciones industriales sin trocear en exceso.
- Extracción de características para clustering y deduplicación de imágenes a gran escala, usando las variantes tiny o small para maximizar throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye mediciones de tiempo y memoria de inferencia sobre imágenes sintéticas de 224x224, pero la tabla aparece truncada en la información proporcionada y no permite extraer cifras completas. Tampoco se incluyen resultados de MMLU, HumanEval, GSM8K ni métricas de detección o segmentación.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16 (mediciones de la model card, backend portable, RTX 5060 Ti 16 GB, entrada 3000x4000): `pe-core-t16-384` 0,8 GiB asignados (1,1 reservados); `pe-core-s16-384` 1,2 GiB (1,3); `pe-core-b16-224` 2,0 GiB (2,3); `pe-core-l14-336` 3,5 GiB (3,8); `pe-core-g14-448` 7,7 GiB (10,2); `pe-spatial-t16-512` 0,8 GiB (1,0); `pe-spatial-s16-512` 1,2 GiB (1,3); `pe-spatial-b16-512` 2,0 GiB (2,3); `pe-spatial-l14-448` 3,4 GiB (3,7); `pe-spatial-g14-448` 5,6 GiB (5,8) con entrada 1988x2880.
- GPU recomendadas: las variantes tiny y small caben en GPUs de consumo con 4-8 GB; base y large requieren 8-16 GB; la variante gigantic necesita al menos 12 GB para resoluciones altas y se recomienda A100 o H100 para producción.
- Cabe en GPU de consumo: sí, todas las variantes tiny, small y base en una RTX 3060/4060/5060 Ti de 8-16 GB; large en una RTX 4090; gigantic en una RTX 4090 con margen ajustado o en A100/H100.
- Opciones de despliegue: el paquete fastforks con backends `portable` y `kernels`; los pesos originales son compatibles con timm y PyTorch, por lo que pueden servirse con TorchServe o un servidor FastAPI propio. No se documenta soporte nativo para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo de texto.
- Latencia y throughput: la model card incluye una tabla de tiempos por modelo en fp32 y fp16, pero la información proporcionada está truncada y no permite reproducir las cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| Perception Encoder (esta ficha) | no disponible (tiny a gigantic) | cualquier H x W >= 1 | Apache-2.0 | Pesos en repos timm; card en fastforks |
| DINOv2 (Meta) | no disponible en la información | resolución fija por variante | Apache-2.0 | Pesos públicos en Hugging Face |
| SigLIP (Google) | no disponible en la información | resolución fija por variante | Apache-2.0 | Pesos públicos en Hugging Face |
| CLIP (OpenAI) | no disponible en la información | 224x224 típicamente | MIT | Pesos públicos en Hugging Face |

La comparación cuantitativa de rendimiento entre estos modelos no está disponible en la información proporcionada. La ventaja diferencial de Perception Encoder frente a DINOv2, SigLIP y CLIP es la combinación de RoPE 2D (resolución arbitraria) con dos variantes especializadas (core para embedding global y spatial para características densas), además de la alineación con SAM 2 en la variante spatial.

## Limitaciones y advertencias

- Este repositorio no contiene pesos: es solo una model card. Cualquier uso requiere descargar los pesos desde los repositorios `timm/vit_pe_*` y verificar su SHA-256.
- El modelo es exclusivamente un encoder visual: no genera texto, no razona, no soporta tool calling ni agentes. No debe evaluarse con benchmarks de lenguaje.
- Riesgo de sesgo: al entrenarse con miles de millones de pares imagen-texto web curados con MetaCLIP, puede heredar sesgos de representación demográficos, culturales y geográficos presentes en esos datos.
- Riesgo de alucinación: no aplica en el sentido generativo, pero las características densas pueden producir activaciones espurias en regiones sin objeto relevante.
- Limitaciones de idioma: no procesa texto de forma nativa; cualquier componente textual debe aportarlo otro modelo.
- Restricciones de licencia: la licencia Apache-2.0 permite uso comercial, pero la model card advierte que el paquete de código original se registra como "research-use package" y recomienda revisar las cadenas de licencia antes de cualquier otro uso.
- Los datos de entrenamiento no están publicados, lo que dificulta auditorías de sesgo y reproducibilidad.
- En producción, la variante gigantic a resoluciones altas puede superar los 10 GiB reservados, lo que exige planificación de memoria y posiblemente tensor parallelism o batch size 1.
- La tabla de tiempos y memoria de la model card está truncada en la información disponible; no se deben asumir cifras de latencia sin medirlas en el hardware objetivo.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/fastforks/perception-encoder
- Repositorio de código fastforks: https://github.com/kleinicke/fastforks
- Kernels para el backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original (pytorch-image-models, commit 0df212b369a5): https://github.com/huggingface/pytorch-image-models
- Pesos PE core base: https://huggingface.co/timm/vit_pe_core_base_patch16_224.fb
- Pesos PE core gigantic: https://huggingface.co/timm/vit_pe_core_gigantic_patch14_448.fb
- Pesos PE core large: https://huggingface.co/timm/vit_pe_core_large_patch14_336.fb
- Pesos PE core small: https://huggingface.co/timm/vit_pe_core_small_patch16_384.fb
- Pesos PE core tiny: https://huggingface.co/timm/vit_pe_core_tiny_patch16_384.fb
- Pesos PE spatial base: https://huggingface.co/timm/vit_pe_spatial_base_patch16_512.fb
- Pesos PE spatial gigantic: https://huggingface.co/timm/vit_pe_spatial_gigantic_patch14_448.fb
- Pesos PE spatial large: https://huggingface.co/timm/vit_pe_spatial_large_patch14_448.fb
- Pesos PE spatial small: https://huggingface.co/timm/vit_pe_spatial_small_patch16_512.fb
- Pesos PE spatial tiny: https://huggingface.co/timm/vit_pe_spatial_tiny_patch16_512.fb
- Evidencia de licencia (README de PE core small): https://huggingface.co/timm/vit_pe_core_small_patch16_384.fb/blob/255fa76e26fdf8daa47e0d607da46b7051879045/README.md
