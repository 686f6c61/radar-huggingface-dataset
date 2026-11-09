# jsaizant/bsc-edu-annotator

## Resumen

BSC-EDU Annotator es un modelo de regresión sobre embeddings de texto desarrollado por el Barcelona Supercomputing Center (BSC) en el marco del consorcio OpenEuroLLM, con financiación del programa ALIA del Ministerio para la Transformación Digital y de la Función Pública. Su función es asignar una puntuación continua de valor educativo, en el rango [0, 4], a documentos web, de modo que pueda usarse para filtrar y priorizar corpus según su calidad educativa. Publicado bajo licencia Apache 2.0 en Hugging Face con el identificador `jsaizant/bsc-edu-annotator`, es relevante en el contexto de la construcción de datasets de preentrenamiento de alta calidad para modelos en lenguas ibéricas.

Técnicamente no es un modelo generativo, sino un codificador de frases (pipeline `feature-extraction`) que parte de `Snowflake/snowflake-arctic-embed-l-v2.0` y añade una cabeza de regresión entrenada sobre 1,5 millones de ejemplos en castellano, catalán y euskera (500.000 por idioma). El checkpoint contiene 567.754.752 parámetros y ocupa 2,3 GB en el repositorio. La ventana efectiva de entrada durante el entrenamiento se limitó a los primeros 512 tokens de cada documento.

Su interés práctico reside en que convierte una tarea de anotación subjetiva (¿tiene este texto valor educativo?) en una señal numérica continua y umbralizable, lo que permite integrarlo en pipelines de curación de datos sin necesidad de un LLM generativo, con un coste computacional muy inferior.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa) con cabeza de regresión; fine-tune de `Snowflake/snowflake-arctic-embed-l-v2.0` |
| Parámetros totales | 567.754.752 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens utilizados en entrenamiento; la longitud máxima del modelo base no se especifica en la información disponible |
| Tipos de cuantización | No disponible (el repo contiene safetensors en precisión original; admite cuantización estándar de transformers/GGUF no documentada por el autor) |
| Idiomas soportados | 74 lenguas del modelo base; entrenamiento específico en castellano, catalán y euskera |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo es un codificador de la familia XLM-RoBERTa (según los tags del repositorio) inicializado desde el embedding multilingüe `snowflake-arctic-embed-l-v2.0`, al que se le incorpora una cabeza de regresión que produce un valor escalar continuo en el intervalo [0, 4]. No se trata de un clasificador de clases discretas: la salida es un score real que permite fijar umbrales arbitrarios aguas abajo y ordenar documentos por valor educativo predicho.

El entrenamiento se realizó con 500.000 ejemplos por idioma en castellano, catalán y euskera, es decir, 1,5 millones de ejemplos en total, tomando en cada caso los primeros 512 tokens del documento. La model card no detalla la composición exacta del corpus, el número total de tokens vistos, la función de pérdida concreta (aunque por la naturaleza del problema se infiere una regresión tipo MSE o similar), ni si hubo etapas de RLHF o DPO; todos esos apartados figuran como «More Information Needed». Tampoco se documentan hiperparámetros de entrenamiento, precisión mixta empleada ni infraestructura de cómputo.

La innovación principal es de planteamiento más que de arquitectura: reutilizar un encoder de embeddings ya entrenado y añadir una señal de calidad continua, lo que abarata enormemente el filtrado de corpus frente a soluciones basadas en LLM generativos.

## Capacidades

- Puntuación de calidad educativa: genera un score continuo en [0, 4] para un documento de texto, utilizable para ranking y filtrado.
- Multilingüismo: cubre las 74 lenguas del modelo base, con ajuste específico demostrado en castellano, catalán y euskera.
- Extracción de embeddings: al conservar la arquitectura del encoder, puede emplearse el pipeline `feature-extraction` para obtener representaciones vectoriales del texto.
- Compatibilidad con Text Embeddings Inference (TEI) y endpoints, según los tags del repositorio.
- Procesamiento por lotes: al ser un encoder de 568 M de parámetros, permite throughput alto en GPU frente a modelos generativos.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo thinking; no es un modelo generativo.

## Casos de uso

- Curación de corpus de preentrenamiento: puntuar millones de documentos web en castellano, catalán y euskera y conservar solo los que superan un umbral (por ejemplo, 2,5 sobre 4), reduciendo el ruido en el dataset de entrenamiento de un LLM.
- Construcción de datasets educativos para ALIA/OpenEuroLLM: priorizar material didáctico, académico o divulgativo frente a contenido comercial o de baja densidad informativa en las lenguas cooficiales de España.
- Filtrado en pipelines de Common Crawl: aplicar el modelo como etapa de scoring tras la deduplicación y antes del entrenamiento del tokenizador o del modelo final, con coste muy inferior a un clasificador basado en LLM.
- Enrutado y ranking en buscadores educativos: ordenar resultados de búsqueda o recursos de un repositorio docente por valor educativo estimado, usando el score como señal de re-ranking.
- Anotación asistida de datasets etiquetados: generar pre-etiquetas continuas que luego revisores humanos corrigen, acelerando la creación de corpus de calidad en euskera y catalán, donde escasean los anotadores.
- Investigación en calidad de datos multilingüe: analizar la distribución de scores por dominio, fuente o idioma para estudiar qué tipos de texto aportan más valor educativo.
- Moderación de contenido en plataformas educativas: descartar automáticamente textos con score muy bajo antes de indexarlos en un catálogo formativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (MAE, RMSE, correlación de Spearman, acuerdo con anotadores humanos), ni comparaciones con clasificadores de calidad previos. Tampoco se documentan datos de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo de pesos, más activaciones; en fp16/bf16 baja a unos 1,2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en lotes pequeños; A100, H100 o L40S para procesamiento masivo de corpus con lotes grandes.
- Cabe en GPU de consumo: sí, en RTX 3060 (12 GB), RTX 4060 Ti, RTX 4070, RTX 4090 y superiores; también en GPUs de 4-6 GB con lotes reducidos.
- Despliegue: transformers con pipeline `feature-extraction`, Text Embeddings Inference (TEI) por los tags del repo, y servidores de inferencia compatibles con endpoints. No se documenta soporte GGUF/Ollama ni vLLM.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del encoder se espera un throughput de cientos a miles de documentos por segundo en A100 con lotes grandes, pero es una estimación, no un dato publicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bsc-edu-annotator | 567,8 M | 512 tokens (entrenamiento) | Regresión de valor educativo [0, 4] | Apache 2.0 | Hugging Face |
| Snowflake/snowflake-arctic-embed-l-v2.0 | ~568 M (modelo base) | No especificado en la información disponible | Embeddings multilingües | Apache 2.0 | Hugging Face |
| Clasificadores de calidad tipo FineWeb-Edu | No disponible | No disponible | Clasificación de valor educativo (inglés) | No disponible | No disponible en la información proporcionada |

La comparación directa con FineWeb-Edu u otros clasificadores de calidad no puede establecerse con datos porque no se han publicado resultados comparativos. La diferencia principal frente al modelo base es la cabeza de regresión y el ajuste en castellano, catalán y euskera; frente a clasificadores basados en LLM, la ventaja es el coste y la latencia, y la desventaja es la falta de evaluación publicada.

## Limitaciones y advertencias

- No hay métricas de evaluación publicadas: se desconoce la fiabilidad del score frente a anotadores humanos o su calibración entre idiomas.
- Sesgo de idioma: el ajuste se hizo solo en castellano, catalán y euskera; en las otras 71 lenguas del modelo base el comportamiento es incierto.
- Ventana limitada: solo se usaron los primeros 512 tokens en entrenamiento, por lo que documentos largos pueden puntuarse a partir de un fragmento no representativo.
- Riesgo de alucinación no aplica en sentido estricto (no genera texto), pero sí de puntuaciones erróneas o mal calibradas en dominios no representados en el corpus de entrenamiento.
- Sesgos de dominio: si el corpus de entrenamiento sobrerrepresenta ciertos tipos de fuente (por ejemplo, Wikipedia o material académico), el modelo puede penalizar géneros legítimos como foros técnicos o documentación informal.
- Falta de transparencia: la model card deja sin documentar datos de entrenamiento, hiperparámetros, evaluación y huella ambiental, lo que dificulta la reproducibilidad.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantías ni soporte.
- Advertencia de producción: al no existir benchmarks, conviene validar el modelo contra un conjunto etiquetado propio antes de usarlo como filtro en un pipeline crítico.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/jsaizant/bsc-edu-annotator
- Modelo base: https://huggingface.co/Snowflake/snowflake-arctic-embed-l-v2.0
- Consorcio OpenEuroLLM: no disponible en la información proporcionada
- Proyecto ALIA: no disponible en la información proporcionada
- Paper, demo y repositorio de código: no disponibles en la información proporcionada
