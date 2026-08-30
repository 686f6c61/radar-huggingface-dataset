# immanuelpeter/MoonViT-K2.6

## Resumen

MoonViT-K2.6 es un extractor de características visuales (vision tower) derivado del modelo multimodal Kimi K2.6 de Moonshot AI, empaquetado por el usuario immanuelpeter como un modelo independiente de Transformers. Este repositorio aísla el codificador de visión MoonViT y su proyector, de modo que los desarrolladores pueden utilizar la parte visual del modelo sin descargar el checkpoint completo de 1 billón de parámetros ni depender de código externo en tiempo de ejecución.

El modelo consta de 416.866.032 parámetros en total, distribuidos en un tower de 27 capas con 1152 unidades ocultas, 16 cabezas de atención y tamaño de parche 14, más un proyector que mapea las características visuales a la dimensión del modelo de lenguaje (7168). Está pensado para tareas de extracción de características de imagen y su integración en pipelines de visión-lenguaje, ofreciendo una alternativa ligera y autocontenida frente a la carga del modelo completo.

Su relevancia radica en que permite experimentar con el encoder visual de Kimi K2.6, un modelo open-source con capacidades avanzadas de razonamiento y agentes, sin necesidad de gestionar los 64 shards del checkpoint original. La validación incluida confirma que los tensores coinciden bit-for-bit con los del checkpoint oficial en CPU y en BF16 sobre A100, lo que garantiza fidelidad en la reproducción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision Transformer (MoonViT) con 27 capas, 1152 hidden, 16 cabezas, 4304 intermediate, patch size 14 |
| Parametros totales | 416.866.032 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no procesa texto) |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | kimi-k2.6 (licencia propia de Moonshot AI) |
| Formato de pesos | safetensors (model.safetensors y projector.safetensors) |

## Arquitectura y entrenamiento

El modelo se compone de dos partes diferenciadas. El tower MoonViT es un Vision Transformer estándar con 27 capas, 1152 dimensiones ocultas, 16 cabezas de atención y un tamaño de parche de 14 píxeles. Incluye un mecanismo de compresión de tokens que combina reagrupamiento espacial 2x2 con pooling temporal, sin parámetros aprendidos, lo que reduce la cantidad de tokens generados por imagen. El proyector, por su parte, aplica una normalización de capa (LayerNorm) sobre 1152 dimensiones, aplana cuatro parches, y pasa por dos capas lineales: una de 4608 a 4608 con activación GELU y otra de 4608 a 7168, que es la anchura del modelo de lenguaje Kimi K2.6.

No se han publicado detalles específicos sobre el entrenamiento de este tower de forma aislada. Se sabe que forma parte del modelo Kimi K2.6, que fue entrenado por Moonshot AI con una arquitectura MoE de 1 billón de parámetros totales y 32 mil millones activos, con una ventana de contexto de 256K tokens. El checkpoint de visión fue publicado originalmente por exolabs en el repositorio `exolabs/Kimi-K2.6-vision`, y el script de exportación de este paquete divide esos pesos en los archivos de tower y proyector. No se menciona el uso de RLHF, DPO u otras técnicas de alineación específicas para el encoder visual.

## Capacidades

- Extracción de características de imagen: genera representaciones vectoriales de alta dimensión (7168) a partir de imágenes de entrada.
- Proyección a espacio del modelo de lenguaje: el proyector mapea las características visuales al espacio de embeddings de Kimi K2.6, permitiendo su uso directo en modelos multimodales.
- Compresión de tokens: reduce la cantidad de tokens visuales mediante reagrupamiento espacial y pooling temporal, lo que mejora la eficiencia en contextos largos.
- Compatibilidad con el procesador de imágenes de Kimi K2.6: incluye el preprocesador y utilidades de medios necesarios para preparar las imágenes.
- Integración con Transformers: se carga mediante `AutoModel.from_pretrained(..., trust_remote_code=True)`, lo que facilita su uso en pipelines existentes.
- Reproducibilidad: los tensores coinciden bit-for-bit con el checkpoint oficial en CPU y en BF16 sobre A100, garantizando resultados idénticos.

## Casos de uso

- Extracción de características para búsqueda visual: se puede utilizar el tower para generar embeddings de imágenes y construir índices de similitud para motores de búsqueda de contenido visual, aprovechando la alta dimensionalidad del espacio de salida.
- Fine-tuning de adaptadores multimodales: dado que el proyector ya mapea a la dimensión del LLM, es posible congelar el tower y entrenar solo capas adicionales para tareas específicas como respuesta a preguntas visuales o captioning.
- Evaluación de representaciones visuales: investigadores pueden comparar la calidad de las características extraídas con otros encoders como CLIP o SigLIP en tareas de clasificación o recuperación, usando el modelo como un extractor fijo.
- Integración en pipelines de agentes visuales: al ser parte de Kimi K2.6, el tower puede alimentar modelos agénticos que necesitan interpretar capturas de pantalla o imágenes de interfaces, sin cargar el modelo completo.
- Prototipado rápido de modelos visión-lenguaje: al ser un paquete autocontenido de solo 0.9 GB, permite a desarrolladores experimentar con la parte visual de Kimi K2.6 en entornos con recursos limitados.
- Investigación en compresión de tokens visuales: el mecanismo de reagrupamiento espacial y pooling temporal puede estudiarse de forma aislada para optimizar la eficiencia en modelos multimodales de contexto largo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo incluye validación de igualdad de tensores con el checkpoint original, pero no métricas de rendimiento en tareas como clasificación de imágenes, recuperación o razonamiento visual.

## Requisitos de hardware

- VRAM estimada: con 416 millones de parámetros en BF16, el modelo ocupa aproximadamente 0.83 GB en memoria. La inferencia de una sola imagen requiere menos de 2 GB de VRAM, por lo que cabe en cualquier GPU consumer moderna (RTX 3060, RTX 4060, etc.).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente. Para procesamiento por lotes o imágenes de alta resolución, se recomienda una GPU con 8 GB o más (RTX 3070, RTX 4070, A100, etc.).
- CPU: el modelo puede ejecutarse en CPU, aunque la latencia será mayor. Para uso interactivo se recomienda GPU.
- Opciones de despliegue: al ser un modelo de Transformers estándar, se puede cargar con `AutoModel.from_pretrained` en cualquier entorno que soporte la librería. No es aplicable vLLM, llama.cpp u Ollama, ya que no es un modelo generativo de texto.
- Latencia y throughput: no se han publicado mediciones oficiales. Dado el tamaño del modelo, se espera una latencia de decenas de milisegundos por imagen en una GPU moderna, pero no hay datos concretos.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Salida | Licencia |
|---|---|---|---|---|
| MoonViT-K2.6 | 416M | ViT 27 capas, patch 14 | 7168 dims | kimi-k2.6 |
| CLIP ViT-L/14 | 428M | ViT 24 capas, patch 14 | 768 dims | MIT |
| SigLIP ViT-L/16 | 428M | ViT 24 capas, patch 16 | 1024 dims | Apache 2.0 |

La comparativa se limita a parámetros y arquitectura, ya que no hay datos de rendimiento publicados para MoonViT-K2.6. CLIP y SigLIP son encoders visuales ampliamente utilizados, pero sus dimensiones de salida son menores y no están diseñados para proyectar directamente al espacio de un LLM específico. MoonViT-K2.6 ofrece una salida de 7168 dimensiones, alineada con Kimi K2.6, lo que lo hace especialmente adecuado para integrarse con ese modelo.

## Limitaciones y advertencias

- Es únicamente un extractor de características, no un modelo generativo. No puede producir texto ni responder preguntas por sí mismo.
- Requiere `trust_remote_code=True` al cargar, lo que implica ejecutar código arbitrario del repositorio. Se recomienda revisar el código antes de usarlo en entornos de producción.
- La licencia kimi-k2.6 puede imponer restricciones de uso comercial. Es necesario revisar el texto completo de la licencia antes de desplegar el modelo en aplicaciones comerciales.
- No se dispone de información sobre sesgos o alucinaciones, ya que no es un modelo de lenguaje. Sin embargo, las representaciones visuales pueden heredar sesgos del entrenamiento del modelo original.
- El modelo está pensado para imágenes de tamaño fijo (parche 14). Imágenes con resoluciones muy diferentes pueden requerir preprocesamiento adicional.
- No hay soporte oficial de Moonshot AI para este paquete independiente; es un trabajo de la comunidad y puede no recibir actualizaciones o correcciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/immanuelpeter/MoonViT-K2.6
- Modelo base Kimi K2.6: https://huggingface.co/moonshotai/Kimi-K2.6
- Checkpoint de visión de Exolabs: https://huggingface.co/exolabs/Kimi-K2.6-vision
- Script de exportación: https://github.com/immanuel-peter/vision-tower-bench/blob/main/scripts/export_moonvit_k26.py
- Página oficial de Kimi K2.6: https://www.kimi.ai/ai-models/kimi-k2-6
- Guía de Kimi K2.6: https://www.aimadetools.com/blog/kimi-k2-6-complete-guide/
