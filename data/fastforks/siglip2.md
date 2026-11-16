# fastforks/siglip2

## Resumen

SigLIP 2 es una familia de torres de visión (image towers) publicada por Google Research (Tschannen et al., 2025) como evolución del modelo SigLIP original. El repositorio `fastforks/siglip2` no contiene pesos: es una model card que actúa como catálogo de las diez variantes fijas de resolución de SigLIP 2 (ViT-B, ViT-L, So400m y ViT-g), con enlaces a los pesos originales alojados en Hugging Face bajo la organización `timm`, verificación de integridad mediante SHA-256 y metadatos de licencia.

El modelo resuelve el problema de extracción de características de imagen (image feature extraction): dado un único RGB de cualquier tamaño, produce un `last_hidden_state` con features densas por parche y un `pooler_output` con una representación global de la imagen. Es relevante porque ofrece un backbone de visión moderno, con licencia Apache-2.0 y compatible con uso comercial, que puede alimentar sistemas de recuperación multimodal, clasificación, segmentación o como codificador visual en pipelines de visión-lenguaje.

La integración se realiza a través de la librería `fastforks`, que descarga los pesos de los repositorios originales de `timm` y los valida contra los hashes SHA-256 documentados. Existen dos backends: `portable` (PyTorch/CUDA estándar) y `kernels` (kernels optimizados publicados en `fastforks/kernels`). El tamaño de contexto de texto no aplica: es un modelo puramente visual, sin torre de texto.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con patch tokens y attention-pool; variantes ViT-B, ViT-L, So400m y ViT-g; resolución fija por checkpoint |
| Parámetros totales | no disponible (no se publican recuentos por variante en la información proporcionada; los identificadores indican B, L, So400m y g) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión sin entrada de texto); entrada de imagen de cualquier H × W ≥ 1 |
| Tipos de cuantización | no disponible (la información solo menciona ejecución en fp16 para las pruebas de memoria) |
| Idiomas soportados | no disponible (los datos de entrenamiento WebLI son multilingües, pero el modelo no procesa texto) |
| Licencia | Apache-2.0 (código y pesos de las diez variantes; uso comercial permitido) |
| Formato de pesos | safetensors (alojados en los repositorios `timm` originales, no en este repo) |

## Arquitectura y entrenamiento

SigLIP 2 emplea una arquitectura transformer de visión con parches (patch size 14 o 16 según variante) y una cabeza de attention pooling que agrega los tokens de parche en un vector global. Las variantes cubren cuatro escalas: ViT-B (base), ViT-L (large), So400m (shape-optimized, 400M) y ViT-g (giant con optimizaciones). Cada checkpoint tiene una resolución nativa fija —224, 256, 378, 384 o 512 píxeles— codificada en el identificador (por ejemplo, `siglip2-so400m14-224` o `siglip2-l16-512`), aunque el modelo acepta entradas de cualquier tamaño redimensionando o rellenando internamente.

El entrenamiento se realizó sobre WebLI, un corpus propietario de pares imagen-texto multilingües de Google que no se ha publicado. La receta combina pérdida contrastiva sigmoidea (la innovación central de SigLIP frente al softmax estándar de CLIP), junto con objetivos de captioning, self-distillation y masked prediction descritos en el paper de SigLIP 2. No se documenta en la información disponible el número exacto de tokens de imagen vistos, la composición detallada del dataset ni si hubo etapas de RLHF o DPO (no aplicables a un codificador visual).

## Capacidades

- Extracción de features densas por parche (`last_hidden_state`) y features globales pooled (`pooler_output`), además de estados ocultos intermedios (`hidden_states`).
- Procesamiento de imágenes de resolución arbitraria (cualquier H × W ≥ 1), con redimensionado o padding interno; probado hasta 3000×4000 píxeles.
- Backbone reutilizable para tareas aguas abajo: clasificación, recuperación imagen-texto, segmentación o detección, al estilo de los modelos de la familia SigLIP/CLIP.
- Dos backends de ejecución: `portable` (PyTorch/CUDA) y `kernels` (kernels optimizados del proyecto fastforks).
- Verificación de integridad de pesos mediante SHA-256 documentado por variante.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generación de texto: es exclusivamente un codificador visual.
- Capacidades multilingües: no aplica a la inferencia (sin entrada de texto); el corpus de entrenamiento WebLI es multilingüe.
- No incluye modo thinking, visión generativa, audio ni salida textual.

## Casos de uso

- Búsqueda visual y recuperación multimodal: usar `pooler_output` como embedding de imagen para indexar un catálogo y hacer búsqueda por similitud; las variantes ViT-B y ViT-L ofrecen un buen equilibrio entre calidad y coste computacional.
- Clasificación de imágenes a gran escala: congelar la torre y entrenar una cabeza lineal sobre `pooler_output`; útil para etiquetado de productos, moderación de contenido o triaje médico preliminar.
- Segmentación semántica y detección: emplear `last_hidden_state` como mapa denso de features por parche, alimentando cabezas de segmentación o detectores tipo DETR.
- Preprocesamiento en pipelines de visión-lenguaje: usar SigLIP 2 como codificador visual de un VLM propio, con la ventaja de licencia Apache-2.0 y pesos verificables por hash.
- Deduplicación y clustering de imágenes: extraer embeddings pooled de un corpus y agrupar por similitud para eliminar duplicados o descubrir temáticas latentes.
- Análisis de imágenes de alta resolución: gracias a la aceptación de entradas arbitrarias (probado a 3000×4000), útil en teledetección, inspección industrial o digitalización de documentos donde el detalle importa.
- Control de calidad en tiempo real: las variantes ViT-B a 256 px caben en GPUs de consumo y permiten extracción de features en lote para sistemas de inspección.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo incluye mediciones de memoria y velocidad en hardware concreto, no métricas de calidad (ImageNet, retrieval, etc.).

Datos de memoria y velocidad documentados (fp16, RTX 5060 Ti 16 GB, imagen 3000×4000):

| Variante | Memoria pico asignada | Memoria reservada |
|---|---|---|
| siglip2-b16-256 | 1,7 GiB | 1,9 GiB |
| siglip2-b16-512 | 1,7 GiB | 1,8 GiB |
| siglip2-l16-256 | 2,5 GiB | 2,8 GiB |
| siglip2-l16-512 | 2,5 GiB | 2,7 GiB |
| siglip2-so400m14-224 | 3,2 GiB | 3,4 GiB |
| siglip2-so400m14-378 | 3,2 GiB | 3,4 GiB |
| siglip2-so400m16-256 | 2,8 GiB | 3,1 GiB |
| siglip2-so400m16-512 | 2,8 GiB | 3,1 GiB |
| siglip2-g16-256 | 4,7 GiB | 4,9 GiB |
| siglip2-g16-384 | 4,7 GiB | 4,9 GiB |

La tabla de tiempos por variante (features sintéticas 224×224, fp32) aparece truncada en la información disponible y no se reproduce.

## Requisitos de hardware

- VRAM estimada para inferencia (fp16, imagen 3000×4000): entre 1,7 GiB (ViT-B) y 4,7 GiB (ViT-g) de memoria pico asignada, según la tabla anterior.
- GPU recomendadas: cualquier GPU con al menos 6-8 GiB de VRAM para las variantes ViT-B y ViT-L; 12-16 GiB para So400m y ViT-g. Se documentan pruebas en RTX 5060 Ti 16 GB con backend `portable`.
- Cabe en GPU de consumo: sí. Las diez variantes se han validado en una RTX 5060 Ti de 16 GB con imágenes de hasta 3000×4000 píxeles; las variantes ViT-B deberían caber incluso en GPUs de 8 GiB.
- Opciones de despliegue: librería `fastforks` (backends `portable` y `kernels`); los pesos originales son compatibles con `timm` y PyTorch. No se documenta integración con vLLM, llama.cpp, Ollama o TGI (no aplicables a un codificador visual).
- Latencia y throughput estimados: no disponible (la tabla de tiempos está truncada en la información proporcionada).

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución de entrada | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SigLIP 2 (este catálogo) | B / L / So400m / g | 224, 256, 378, 384, 512 (fija por checkpoint) | Apache-2.0 | Pesos en `timm`, catálogo en `fastforks` | Attention pooling, entrada arbitraria probada hasta 3000×4000 |
| SigLIP original (Google) | B / L / So400m | 224, 384 | Apache-2.0 | Pesos en `timm` | Predecesor directo; sin attention pooling ni los objetivos adicionales de SigLIP 2 |
| CLIP (OpenAI) | B / L | 224, 336 | MIT (código), pesos con restricciones | Pesos en OpenAI y `timm` | Referencia clásica de contraste imagen-texto; pérdida softmax en lugar de sigmoidea |
| DINOv2 (Meta) | S / B / L / g | 224-518 | Apache-2.0 | Pesos en `timm` y Hugging Face | Solo visión, sin alineamiento texto; buena referencia para features densas |

No se dispone de datos de rendimiento comparativo en la información proporcionada para cuantificar diferencias de calidad entre estos modelos.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, código ni razonamiento; cualquier caso de uso que requiera salida lingüística necesita un modelo adicional.
- No se documentan evaluaciones de sesgo en la información disponible; al entrenarse sobre WebLI (datos web multilingües no publicados), es esperable heredar sesgos de representación de esa fuente.
- Riesgo de alucinación: no aplica en sentido estricto (no genera texto), pero los embeddings pueden producir similitudes espurias en tareas de recuperación si no se calibra el umbral.
- Datos de entrenamiento no liberados (WebLI), lo que dificulta auditorías de composición y sesgo.
- La resolución nativa es fija por checkpoint; usar una resolución distinta a la nativa implica redimensionado o padding interno, con posible pérdida de detalle o coste adicional.
- Aviso de licencia del autor: la model card original califica el paquete como "research-use package" y pide revisar las cadenas de licencia antes de cualquier otro uso, aunque las diez variantes figuran como Apache-2.0 y con uso comercial permitido.
- Este repositorio no aloja pesos: la disponibilidad depende de los repositorios `timm` enlazados y de la integridad de los SHA-256 documentados.
- No se documentan límites de idioma porque el modelo no procesa texto; el alineamiento imagen-texto subyacente está condicionado por el corpus multilingüe de entrenamiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/fastforks/siglip2
- Código de fastforks: https://github.com/kleinicke/fastforks
- Kernels del backend `kernels`: https://huggingface.co/fastforks/kernels
- Código original (pytorch-image-models, commit `0df212b369a5`): https://github.com/huggingface/pytorch-image-models
- Pesos ViT-B/16 256: https://huggingface.co/timm/vit_base_patch16_siglip_256.v2_webli
- Pesos ViT-B/16 512: https://huggingface.co/timm/vit_base_patch16_siglip_512.v2_webli
- Pesos ViT-g/16 256: https://huggingface.co/timm/vit_giantopt_patch16_siglip_256.v2_webli
- Pesos ViT-g/16 384: https://huggingface.co/timm/vit_giantopt_patch16_siglip_384.v2_webli
- Pesos ViT-L/16 256: https://huggingface.co/timm/vit_large_patch16_siglip_256.v2_webli
- Pesos ViT-L/16 512: https://huggingface.co/timm/vit_large_patch16_siglip_512.v2_webli
- Pesos So400m/14 224: https://huggingface.co/timm/vit_so400m_patch14_siglip_224.v2_webli
- Pesos So400m/14 378: https://huggingface.co/timm/vit_so400m_patch14_siglip_378.v2_webli
- Pesos So400m/16 256: https://huggingface.co/timm/vit_so400m_patch16_siglip_256.v2_webli
- Pesos So400m/16 512: https://huggingface.co/timm/vit_so400m_patch16_siglip_512.v2_webli
- Evidencia de licencia (README de timm): https://huggingface.co/timm/vit_base_patch16_siglip_256.v2_webli/blob/ac4cc431026674dcac29e34a00d3bd2048390eb3/README.md
- Hashes completos (card.toml): https://github.com/kleinicke/fastforks/blob/main/src/fastforks/features/models/siglip2/card.toml
