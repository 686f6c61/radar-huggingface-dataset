# codeShare/qwen35_image_captioning_adapter

## Resumen

El adaptador `codeShare/qwen35_image_captioning_adapter` es un ajuste fino mediante LoRA (PEFT) sobre el modelo multimodal Qwen 3.5 de 4B en su variante "abliterated" publicada por DreamFast. Su propósito es generar descripciones de imágenes en lenguaje natural de forma compacta y rápida, orientadas a la creación de datasets de entrenamiento para modelos de imagen-a-texto y de generación de imágenes. Lo desarrolla el usuario independiente codeShare y se distribuye con licencia Apache 2.0.

El problema que aborda es la preparación de datasets de captioning: en lugar de etiquetar manualmente miles de imágenes, el adaptador produce descripciones directas y sin preámbulos que pueden usarse como pares imagen-texto en pipelines de entrenamiento de LoRA. Según la model card, el adaptador se entrenó sobre 10 000 imágenes procedentes de Sankaku Complex y puede procesar lotes de unas 30-40 imágenes en una sola GPU T4 con un tiempo medio de 6-7 segundos por caption.

Es relevante por su enfoque práctico de "captioning on-the-fly": combina un modelo base de 4B parámetros con un adaptador ligero que cabe en GPUs de consumo y permite generar datasets dinámicamente. No obstante, se trata de un experimento inicial, con un dataset generado automáticamente mediante captioning y resumen por el propio modelo base, lo que limita la profundidad de las descripciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen 3.5 (modelo base: DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base es de 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA entrenado sobre el modelo base multimodal Qwen 3.5 de 4B en su variante abliterated de DreamFast. El entrenamiento se realizó sobre 10 000 imágenes procedentes de la base de datos de Sankaku Complex, con 13 000 pasos durante 24 horas en 2 GPUs NVIDIA T4 (Kaggle). La model card menciona también un conjunto inicial de 2 000 imágenes en la tabla de entrenamiento, lo que sugiere una ampliación posterior del dataset.

La metodología de preparación del dataset consistió en un proceso de captioning y resumen: primero el propio modelo base Qwen 3.5 generó descripciones de las imágenes y después el mismo modelo las resumió. El adaptador se entrenó sobre esos resúmenes en lugar de las respuestas originales, con el objetivo de eliminar preámbulos y texto introductorio verboso y producir descripciones en lenguaje natural más directas y compactas. La model card aclara explícitamente que este proceso no añade nueva comprensión visual al modelo subyacente, sino que le enseña a producir una versión más concisa de sus capacidades de captioning existentes. Los datos de entrenamiento combinan captions generados con Gemini Flash y JoyCaption beta, además de prompts de publicaciones de Civitai.

## Capacidades

- Generación de descripciones de imágenes en lenguaje natural conciso (image-to-text).
- Producción de captions sin preámbulos ni texto introductorio, orientados a entrenamiento.
- Procesamiento por lotes: según la model card, lotes de 30-40 imágenes en una T4.
- Generación de pares imagen-texto para datasets de entrenamiento de modelos de difusión y de image-to-text.
- Integración en pipelines de preparación de datasets on-the-fly.
- Capacidades multimodales heredadas del modelo base Qwen 3.5 4B.
- No se documenta soporte de tool calling, agentes, thinking mode ni audio en la información disponible.

## Casos de uso

- Preparación de datasets para entrenamiento de LoRA: el adaptador genera captions de imágenes descargadas de bases de datos como Sankaku y produce pares imagen-texto listos para entrenar adaptadores de generación de imágenes, reduciendo la necesidad de etiquetado manual.
- Captioning por lotes en GPU de consumo: con una T4 de 16 GB se pueden procesar lotes de 30-40 imágenes a 6-7 segundos por imagen, lo que permite etiquetar miles de imágenes en pocas horas en hardware asequible.
- Generación dinámica de datasets durante el entrenamiento: la model card propone integrar la generación de captions en la propia sesión de entrenamiento de un modelo de imagen, descargando imágenes candidatas, generando captions y entrenando un LoRA de forma iterativa.
- Enriquecimiento de metadatos de archivos de imágenes: generación automática de descripciones en lenguaje natural para catalogar y buscar imágenes en colecciones locales.
- Prototipado rápido de pipelines multimodal: al ser un adaptador ligero sobre un modelo de 4B, permite experimentar con captioning en notebooks de Colab (el repositorio incluye `qwen35_sankaku_captioning.ipynb`) sin infraestructura dedicada.
- Investigación en captioning compacto: sirve como punto de partida para estudiar la relación entre concisión y calidad de captions en datasets generados automáticamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento publicados son de inferencia: en una NVIDIA T4 (16 GB), aproximadamente 40 imágenes por lote con un tiempo medio de 6-7 segundos por imagen, según observaciones del autor que pueden variar según resolución, configuración de generación y memoria disponible.

## Requisitos de hardware

- VRAM estimada: el adaptador se ejecuta junto al modelo base de 4B; el autor reporta funcionamiento en una NVIDIA T4 de 16 GB con lotes de 30-40 imágenes.
- GPU recomendadas: NVIDIA T4 (16 GB) es el hardware de referencia documentado; el entrenamiento se realizó en 2 × T4 en Kaggle.
- GPU de consumo: no se documenta explícitamente el funcionamiento en GPUs consumer, pero un modelo base de 4B con cuantización podría caber en GPUs de 8-12 GB; no hay datos confirmados en la información disponible.
- Opciones de despliegue: la librería indicada es PEFT; el repositorio incluye un notebook de Colab (`qwen35_sankaku_captioning.ipynb`) para probar el adaptador. No se documentan opciones como vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: aproximadamente 6-7 segundos por caption en T4 con lotes de 30-40 imágenes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| codeShare/qwen35_image_captioning_adapter | LoRA sobre base de 4B | no disponible | Captioning conciso en lenguaje natural | apache-2.0 | Hugging Face (PEFT) |
| JoyCaption | no disponible | no disponible | Captioning de imágenes | no disponible | Usado como fuente de datos en este proyecto |
| Gemini Flash | no disponible (propietario) | no disponible | Captioning multimodal general | propietario | API de Google |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas. Las referencias a JoyCaption y Gemini Flash provienen únicamente de su uso como fuentes de captions en el dataset de entrenamiento de este adaptador.

## Limitaciones y advertencias

- Las descripciones generadas pueden carecer de detalle y profundidad, ya que el dataset se construyó mediante captioning y resumen automáticos; el propio autor lo señala como limitación principal.
- El adaptador no añade nueva comprensión visual al modelo base: solo enseña a producir versiones más concisas de sus captions existentes.
- El modelo base es una variante "abliterated" y "uncensored", lo que implica que puede generar contenido sin los filtros de seguridad habituales; el repositorio está marcado como `not-for-all-audiences`.
- El dataset de entrenamiento procede de Sankaku Complex y de publicaciones de Civitai, con posible presencia de contenido NSFW y sesgos asociados a esas fuentes.
- Idioma limitado al inglés (`en`); no se documenta soporte multilingüe.
- No se documentan datos sobre alucinaciones, sesgos específicos ni evaluación de calidad de los captions generados.
- Aunque la licencia es Apache 2.0, el uso comercial debe evaluarse junto con las condiciones del modelo base y de los datasets de origen.
- Proyecto en fase experimental inicial, con hoja de ruta que incluye la edición manual del dataset y un reentrenamiento previsto para noviembre de 2026.

## Enlaces

- Hugging Face: https://huggingface.co/codeShare/qwen35_image_captioning_adapter
- Notebook de prueba: https://huggingface.co/codeShare/qwen35_image_captioning_adapter/blob/main/qwen35_sankaku_captioning.ipynb
- Modelo base: https://huggingface.co/DreamFast/Qwen3.5-4B-Uncensored-HauhauCS-Aggressive-Safetensor-Benchmark
- Dataset Sankaku: https://huggingface.co/datasets/deepghs/sankaku-webp-4Mpixel
- Dataset de imágenes con captions: https://huggingface.co/datasets/codeShare/adcom_captioned_ai_images
- Dataset de prompts e imágenes de Civitai: https://huggingface.co/datasets/codeShare/civitai-natural-language-prompts-and-images
