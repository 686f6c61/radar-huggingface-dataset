# immanuelpeter/Muse-Glimmer-Vision

## Resumen

Muse Glimmer Vision es un paquete que aísla el codificador visual (Tower) y el proyector (Projector) del modelo multimodal Muse-Glimmer-30B de Meta, liberado por el usuario immanuelpeter en Hugging Face. Este componente permite extraer características de imagen de forma independiente, sin necesidad de cargar el modelo de lenguaje completo, lo que facilita su integración en pipelines de visión por computador o como encoder para modelos multimodales personalizados.

El modelo base, Muse-Glimmer-30B, es un modelo agéntico de 30 000 millones de parámetros desarrollado por Meta Superintelligence Labs, destilado de Muse Spark y optimizado para ejecución local en hardware de consumo. Muse Glimmer Vision conserva la arquitectura del encoder visual: un Vision Transformer (ViT) con 50 capas, 1536 unidades ocultas, 16 cabezas de atención y tamaño de parche 14, junto con un proyector MLP que mapea las representaciones al espacio de lenguaje de 6656 dimensiones. El paquete contiene 1 852 639 744 parámetros en total (1,85 mil millones), almacenados en formato safetensors con precisión BF16.

La relevancia de este lanzamiento radica en que permite reutilizar el encoder visual de un modelo de última generación de forma modular, con una licencia Apache 2.0 y una validación que garantiza la equivalencia bit a bit con el checkpoint original. Es una opción práctica para desarrolladores que necesitan un extractor de características de imagen robusto y ligero, sin asumir el coste computacional del modelo completo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (ViT) con 50 capas, 1536 hidden, 16 cabezas, 8960 intermediate, patch size 14, más proyector MLP |
| Parametros totales | 1 852 639 744 (1,85 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (modelo de visión, sin contexto de texto) |
| Tipos de cuantizacion | No disponible (pesos originales en BF16) |
| Idiomas soportados | No disponible (modelo de visión, no procesa texto) |
| Licencia | Apache 2.0 (incluye política de uso del modelo fuente) |
| Formato de pesos | safetensors (model.safetensors y projector.safetensors) |

## Arquitectura y entrenamiento

El componente de visión de Muse Glimmer está formado por dos partes diferenciadas. El Tower es un Vision Transformer con 50 capas, dimensión oculta de 1536, 16 cabezas de atención y una capa intermedia de 8960 unidades. Utiliza un tamaño de parche de 14 píxeles y aplica una compresión de tokens mediante pixel shuffle 2x2, que reduce la resolución espacial sin introducir parámetros aprendidos. La salida nativa del Tower son tokens de 6144 dimensiones.

El Projector es un MLP de tres capas lineales sin bias: `Linear(6144, 4096)`, GELU, `Linear(4096, 4096)`, GELU, `Linear(4096, 6656)`, seguido de una normalización RMSNorm sin escala. Este proyector mapea las representaciones de 6144 dimensiones al espacio de lenguaje de 6656 dimensiones, que es el que utiliza el modelo de lenguaje de Muse-Glimmer-30B. La implementación nativa `MuseGlimmerVisionModel` devuelve los tokens fusionados de 6144, mientras que `projector.py` los transforma a 6656.

No se proporcionan detalles sobre el entrenamiento específico de este encoder, pero se sabe que forma parte de Muse-Glimmer-30B, un modelo destilado de Muse Spark. El proceso de destilación y los datos de entrenamiento no están documentados en la información disponible. La validación del paquete confirma que los 806 tensores del Tower y los 3 del Projector coinciden exactamente con el checkpoint padre, y que las salidas son idénticas bit a bit en CPU y en BF16 sobre NVIDIA A100.

## Capacidades

- Extracción de características de imagen: genera embeddings de 6144 dimensiones (salida nativa) o 6656 dimensiones (proyectados al espacio de lenguaje).
- Compatible con el pipeline `image-feature-extraction` de la librería transformers.
- Diseñado como encoder visual para modelos multimodales, permitiendo conectar la salida del proyector directamente a un modelo de lenguaje.
- Compresión de tokens mediante pixel shuffle 2x2, que reduce el coste computacional sin pérdida de parámetros.
- Validado para reproducibilidad exacta con el modelo original, lo que garantiza consistencia en entornos de producción.
- No incluye capacidades de generación de texto, tool calling, razonamiento o agentes, ya que es exclusivamente un módulo de visión.

## Casos de uso

- Búsqueda de imágenes por similitud: extraer embeddings de 6144 o 6656 dimensiones para indexar y recuperar imágenes en bases de datos vectoriales, aprovechando la alta calidad del encoder de Meta.
- Preprocesamiento para modelos multimodales: usar el Tower y el Projector como encoder visual en un modelo propio que combine visión y lenguaje, evitando entrenar un encoder desde cero.
- Transfer learning en tareas de visión: fine-tuning del Tower para clasificación, detección o segmentación, partiendo de pesos preentrenados en un modelo de gran escala.
- Generación aumentada por recuperación (RAG) multimodal: integrar el encoder en un pipeline que recupere imágenes relevantes a partir de consultas visuales o textuales.
- Análisis de imágenes en tiempo real en dispositivos edge: con solo 1,85 mil millones de parámetros, el modelo puede ejecutarse en hardware de consumo, lo que lo hace adecuado para aplicaciones de visión en local.
- Evaluación de calidad de imágenes: utilizar las características extraídas para métricas de similitud perceptual o para entrenar modelos de puntuación de imágenes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre rendimiento en tareas como ImageNet, COCO u otros conjuntos de referencia para este encoder específico.

## Requisitos de hardware

- El tamaño del repositorio es de 3,8 GB, lo que sugiere que los pesos en BF16 ocupan aproximadamente 3,7 GB (1,85 B parámetros × 2 bytes). Para inferencia, se necesitaría al menos 4-6 GB de VRAM, dependiendo del tamaño de lote y la resolución de entrada.
- Es viable en GPUs de consumo como RTX 3090, RTX 4090 o similares con 24 GB de VRAM, así como en GPUs de gama media con 8-12 GB si se reduce el tamaño de lote.
- La validación oficial se realizó en una NVIDIA A100, pero no es un requisito para el uso normal.
- Opciones de despliegue: al ser un modelo de visión compatible con transformers, se puede cargar con la API estándar de Hugging Face. No se menciona soporte explícito para vLLM, llama.cpp u otros motores de inferencia, aunque al ser un modelo de visión puro, la integración con frameworks de visión es directa.
- No se proporcionan datos de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa con otros encoders de visión como CLIP, SigLIP o DINOv2. Los datos de rendimiento y características específicas de estos modelos no están disponibles en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Este paquete contiene únicamente el encoder visual y el proyector, no el modelo de lenguaje completo. No puede generar texto ni realizar tareas agénticas por sí solo.
- No hay información sobre sesgos o alucinaciones, ya que al ser un modelo de visión no produce texto. Sin embargo, los sesgos presentes en los datos de entrenamiento del modelo original podrían afectar a las representaciones visuales.
- La licencia Apache 2.0 permite uso comercial, pero se incluye una política de uso (USAGE_POLICY.md) del modelo fuente que debe revisarse antes de su implementación en producción.
- El empaquetado ha sido realizado por un tercero (immanuelpeter), no por Meta directamente. Aunque la validación confirma la equivalencia con el checkpoint oficial, se recomienda verificar la integridad de los archivos.
- No se especifican limitaciones de contexto o idioma, dado que el modelo no procesa texto.
- Para tareas que requieran comprensión multimodal completa, es necesario combinar este encoder con un modelo de lenguaje, lo que añade complejidad de integración.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/immanuelpeter/Muse-Glimmer-Vision
- Modelo base Muse-Glimmer-30B: https://huggingface.co/meta-models/Muse-Glimmer-30B
- Blog de Meta sobre Muse Glimmer: https://research.meta.ai/blog/introducing-muse-glimmer-open-agentic-model
- Página de desarrollador de Meta: https://developer.meta.com/ai/models/muse-glimmer/
- Documentación de la API: https://dev.meta.ai/docs/muse-glimmer
- Receta vLLM para Muse-Glimmer-30B: https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B
- Script de exportación del paquete: https://github.com/immanuel-peter/vision-tower-bench/blob/main/scripts/export_muse_glimmer_vision.py
