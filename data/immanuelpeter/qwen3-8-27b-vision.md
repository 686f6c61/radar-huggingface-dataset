# immanuelpeter/Qwen3.8-27B-Vision

## Resumen

Este repositorio empaqueta el codificador de visión (Tower) y el "learned merger" del modelo Qwen3.8-27B de Qwen, extraídos y publicados de forma independiente por el usuario immanuelpeter. No se trata del modelo completo de lenguaje y visión, sino únicamente del componente de extracción de características de imagen, listo para usarse con la librería `transformers` mediante el pipeline `image-feature-extraction`.

El modelo resuelve un problema práctico: poder obtener representaciones visuales de alta calidad del encoder de Qwen3.8-27B sin necesidad de cargar los 27B parámetros del LLM completo. Esto permite integrar el extractor en pipelines de visión por computador, sistemas de búsqueda multimodal o como base para fine-tuning de cabezas específicas, con un coste computacional muy reducido (460M parámetros, 0,9 GB en BF16).

La relevancia actual radica en que Qwen3.8-27B es la generación más reciente de modelos densos de visión-lenguaje de Qwen, con mejoras en codificación y productividad de oficina. Este paquete facilita el acceso a su encoder de visión de forma aislada, algo que no ofrecen los checkpoints oficiales directamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Tower (ViT) de 27 capas + learned merger (config `Qwen3_5VisionConfig`) |
| Parametros totales | 460.730.096 (~460M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no aplica (extractor de vision, no modelo de lenguaje) |
| Tipos de cuantizacion | no disponible (solo pesos BF16 en safetensors) |
| Idiomas soportados | no aplica (no genera texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El repositorio contiene dos componentes extraídos del shard 1 del checkpoint `Qwen/Qwen3.8-27B`:

- **Tower**: un Vision Transformer de 27 capas, con 1152 dimensiones ocultas, 16 cabezas de atención, 4304 de dimensión intermedia y patch size de 16 píxeles. Produce los tokens visuales crudos en `last_hidden_state`.
- **Learned merger**: un módulo que comprime espacialmente los tokens con agrupación 2x2 y los proyecta al ancho del modelo de lenguaje (5120 dimensiones) mediante una secuencia `LayerNorm(1152)`, `Linear(4608, 4608)`, GELU y `Linear(4608, 5120)`. El resultado se expone en `pooler_output`.

El modelo base Qwen3.8-27B es un modelo denso de 27B parámetros entrenado por Qwen con capacidades nativas de imagen, vídeo y texto, con mejoras sobre la versión 3.6-27B en tareas de codificación y productividad de oficina. Este paquete no incluye el LLM ni los datos de entrenamiento; es una extracción directa de los pesos del encoder, validada bit-for-bit contra el checkpoint padre en CPU y en BF16 sobre NVIDIA A100.

## Capacidades

- Extracción de características de imagen: produce embeddings visuales de alta dimensión (5120) listos para consumir por un modelo de lenguaje.
- Salida dual: `last_hidden_state` con los tokens crudos de la torre (para tareas que requieren atención espacial) y `pooler_output` con las características fusionadas al ancho del LM.
- Compatible con el ecosistema `transformers` mediante `Qwen3_5VisionModel`.
- Preprocesamiento de imagen incluido en `preprocessor_config.json`.
- No genera texto, no responde preguntas ni realiza razonamiento multimodal por sí mismo.

## Casos de uso

- **Búsqueda semántica de imágenes**: extraer embeddings de un catálogo de imágenes y compararlos por similitud coseno para recuperación visual.
- **Fine-tuning de clasificadores visuales**: congelar la torre y entrenar una cabeza lineal o MLP sobre `pooler_output` para clasificación de imágenes en dominios específicos.
- **Preprocesamiento para modelos multimodales**: generar features visuales offline y alimentar un LLM separado que las consuma como entrada, reduciendo el coste de inferencia en producción.
- **Evaluación de encoders de visión**: comparar la calidad de las representaciones de Qwen3.8-27B frente a otros ViT (CLIP, SigLIP, DINOv2) en tareas de retrieval o few-shot.
- **Sistemas RAG multimodales**: indexar documentos con imágenes y recuperar fragmentos relevantes combinando embeddings de texto y visión.
- **Investigación en interpretabilidad visual**: analizar los tokens de la torre (`last_hidden_state`) para estudiar qué regiones de la imagen activan determinados canales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La única validación documentada es interna: los 333 tensores coinciden bit-for-bit con el checkpoint padre mediante `torch.equal`, tanto en CPU como en BF16 sobre NVIDIA A100, para imágenes fijas.

## Requisitos de hardware

- VRAM estimada: menos de 2 GB en BF16 (0,9 GB de pesos), por lo que cabe en cualquier GPU moderna e incluso en CPU con suficiente RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1650, RTX 3060, etc.). No requiere GPU de datacenter.
- Inferencia en CPU viable: 460M parámetros permiten extraer features de una imagen en pocos segundos en un procesador moderno.
- Opciones de despliegue: `transformers` estándar con `Qwen3_5VisionModel`; no hay soporte nativo para vLLM, llama.cpp u Ollama al ser un extractor, no un LLM generativo.
- Latencia estimada: no disponible, pero al ser un ViT de 27 capas con 460M parámetros, se espera una latencia de decenas de milisegundos por imagen en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-27B Vision (este repo) | 460M | 5120 dims | Apache 2.0 | HuggingFace |
| CLIP ViT-L/14 | 428M | 768 dims | MIT | HuggingFace |
| SigLIP ViT-L | 428M | 1024 dims | Apache 2.0 | HuggingFace |
| DINOv2 ViT-L | 307M | 1024 dims | Apache 2.0 | HuggingFace |

La comparativa es orientativa: este extractor produce embeddings de mayor dimensión (5120) que los ViT estándar, pero no hay benchmarks públicos que permitan comparar calidad de representación. Su ventaja principal es la compatibilidad directa con el ecosistema Qwen3.8.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no mantiene conversaciones ni realiza razonamiento multimodal por sí solo.
- Requiere el LLM completo de Qwen3.8-27B para tareas de visión-lenguaje integradas; este paquete solo proporciona el encoder.
- No hay información sobre sesgos o alucinaciones, al no ser un modelo generativo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un paquete reciente (agosto de 2026) con adopción limitada.
- La licencia Apache 2.0 permite uso comercial sin restricciones, pero se recomienda verificar la licencia del modelo base Qwen3.8-27B para usos que impliquen redistribución.
- No se proporcionan cuantizaciones alternativas (GGUF, INT8, etc.); solo pesos BF16 originales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/immanuelpeter/Qwen3.8-27B-Vision
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Script de exportación: https://github.com/immanuel-peter/vision-tower-bench/blob/main/scripts/export_qwen3_8_vision.py
- Artículo en dev.to: https://dev.to/mayu2008/qwen38-27b-a-deep-dive-into-qwens-newest-vision-language-powerhouse-2e7
- Guía en aimadetools: https://www.aimadetools.com/blog/qwen-3-8-27b-complete-guide/
- Página oficial en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Guía local en Substack: https://linas.substack.com/p/qwen3-8-27b-local-guide
- Imagen Docker para Vast.ai: https://github.com/gvonbergen/qwen3.8-27b
