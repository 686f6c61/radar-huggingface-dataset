# mlsa-iai-msu-lab/sci-rus-base4

## Resumen

sci-rus-base4 es un modelo encoder multilingüe desarrollado por el laboratorio mlsa-iai-msu-lab (Universidad Estatal de Moscú) para generar embeddings de texto científico en ruso, inglés y chino. Está construido sobre la arquitectura ModernBERT y cuenta con aproximadamente 149 millones de parámetros, lo que lo sitúa en la categoría de modelos base compactos aptos para despliegue en entornos con recursos limitados.

El modelo se entrenó desde cero en dos fases: primero con el objetivo de Masked Language Modeling (MLM) sobre 31 millones de resúmenes científicos, y después con un entrenamiento conjunto de aprendizaje contrastivo y destilación de conocimiento, utilizando como profesor al modelo Qwen3-Embedding-8B. El resultado es un encoder especializado en similitud semántica de literatura científica con capacidad multilingüe y cross-lingüe.

Su relevancia actual radica en que aborda un nicho poco cubierto: embeddings científicos multilingües (ru-en-zh) en un formato compacto y con licencia MIT, lo que facilita su integración en sistemas de búsqueda semántica, recomendación de citas y organización de bibliotecas digitales académicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer) |
| Parametros totales | 148.940.544 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo safetensors en el repositorio) |
| Idiomas soportados | Ruso (ru), ingles (en), chino (zh) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura ModernBERT, un encoder transformer optimizado para eficiencia y manejo de contextos largos. Se entrenó desde cero en dos etapas. La primera consistió en Masked Language Modeling (MLM) sobre 31 millones de resúmenes científicos procedentes de Elibrary (Rusia), Semantic Scholar (EE. UU.) y ScienceChina (China). En la segunda etapa se combinaron aprendizaje contrastivo (loss InfoNCE) y destilación de conocimiento (divergencia KL) en un único entrenamiento conjunto, con un peso de destilación w = 0,7 y temperatura de softmax de 0,1. El profesor fue el modelo Qwen3-Embedding-8B, cuyos embeddings se precomputaron en modo offline para evitar ejecutar el profesor en línea durante el entrenamiento.

Además, se entrenó un tokenizador personalizado desde cero para manejar mejor la terminología científica en los tres idiomas. El dataset de la fase contrastiva incluyó 211 millones de pares (título-resumen, citas y co-citas) con un total de 108 mil millones de tokens, con sobremuestreo de pares cross-lingües (8x en pares ru-en y zh-en) para reforzar la alineación del espacio vectorial multilingüe.

## Capacidades

- Generación de embeddings semánticos para texto científico en ruso, inglés y chino.
- Similitud semántica cross-lingüe: relaciona documentos en distintos idiomas (p. ej., un título en ruso con un resumen en inglés).
- Extracción de características (feature extraction) para tareas de recuperación de información y búsqueda semántica.
- Integración con sentence-transformers y text-embeddings-inference para despliegue en producción.
- Alineación del espacio vectorial multilingüe reforzada mediante sobremuestreo de pares cross-lingües durante el entrenamiento.
- Compatible con HuggingFace Inference Endpoints (etiqueta endpoints_compatible).

## Casos de uso

- Búsqueda semántica en repositorios científicos: permite indexar y recuperar artículos académicos en ruso, inglés y chino mediante consultas en cualquiera de los tres idiomas, gracias a la alineación cross-lingüe del espacio vectorial.
- Sistemas de recomendación de citas: al generar embeddings de títulos y resúmenes, el modelo puede sugerir artículos relacionados o citables en función de la similitud semántica, aprovechando los pares de citas y co-citas usados en el entrenamiento.
- Clustering y organización de bibliotecas digitales: agrupa automáticamente colecciones de papers por temática, facilitando la navegación y exploración de grandes volúmenes de literatura científica.
- Detección de duplicados y similitud entre manuscritos: identifica documentos con contenido solapado o versiones duplicadas en distintos idiomas, útil en procesos de revisión editorial y gestión de repositorios.
- Recuperación cross-lingüe de literatura: un investigador puede consultar en inglés y recuperar artículos relevantes en ruso o chino, ampliando el alcance de las revisiones bibliográficas.
- Construcción de bases de conocimiento académicas: integración en pipelines de RAG (retrieval-augmented generation) para sistemas de pregunta-respuesta sobre literatura científica, donde el encoder actúa como componente de recuperación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El modelo tiene aproximadamente 149 millones de parámetros, con un tamaño de repositorio de 0,6 GB en safetensors.
- VRAM estimada para inferencia: alrededor de 0,6 GB en FP32 y 0,3 GB en FP16 (estimación basada en el número de parámetros; no se publican cifras oficiales).
- Cabe sin problemas en GPUs de consumo como RTX 3060, RTX 4090, e incluso en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: sentence-transformers, text-embeddings-inference, HuggingFace Inference Endpoints, y potencialmente vLLM o llama.cpp si se generan pesos en GGUF.
- Al ser un modelo compacto, la latencia es baja: en una GPU moderna se pueden procesar cientos de documentos por segundo, aunque no se publican cifras oficiales de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Licencia | Contexto | Enfoque |
|---|---|---|---|---|---|
| sci-rus-base4 | 149M | ru, en, zh | MIT | No disponible | Cientifico multilingue |
| BGE-base-en-v1.5 | 109M | en | MIT | 512 | Generico ingles |
| multilingual-e5-base | 278M | 100+ | MIT | 512 | Multilingue generico |
| ModernBERT-base | 149M | en | Apache 2.0 | 8192 | Generico ingles |

Nota: los datos de los modelos comparativos corresponden a sus respectivas fichas públicas. No se dispone de benchmarks comparativos directos con sci-rus-base4.

## Limitaciones y advertencias

- El modelo está especializado en dominio científico y puede tener un rendimiento subóptimo en textos generales o de otros dominios (legal, médico clínico, etc.).
- Solo cubre tres idiomas (ru, en, zh); no soporta otros idiomas como español, francés o alemán.
- La longitud de contexto no está documentada en la ficha del modelo, por lo que se desconoce el límite máximo de tokens por entrada.
- No se han publicado benchmarks ni evaluaciones comparativas, por lo que el rendimiento real en tareas estándar de retrieval (MTEB, BEIR, etc.) es desconocido.
- El modelo es muy reciente (creado en septiembre de 2026) y no tiene descargas ni validación comunitaria, lo que implica un riesgo de uso en producción sin verificación independiente.
- La destilación desde Qwen3-Embedding-8B puede heredar sesgos del profesor, aunque no se documentan sesgos específicos.
- La licencia MIT permite uso comercial sin restricciones, pero no se especifican limitaciones adicionales de uso.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mlsa-iai-msu-lab/sci-rus-base4
- Modelo profesor (Qwen3-Embedding-8B): https://huggingface.co/Qwen/Qwen3-Embedding-8B
