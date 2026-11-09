# adambuttrick/ror-set-point-set-model-bge-reranker-v2-m3

## Resumen

ror-set-point-set-model-bge-reranker-v2-m3 es un modelo de reordenamiento (cross-encoder) especializado en la desambiguación de afiliaciones institucionales contra el registro ROR (Research Organization Registry). Lo desarrolla adambuttrick como parte de una colección de modelos para el emparejamiento de afiliaciones con identificadores ROR, y se construye mediante fine-tuning del modelo base BAAI/bge-reranker-v2-m3, un transformer de tipo XLM-RoBERTa con 567.754.752 parámetros.

El modelo resuelve un problema concreto: dada una cadena de afiliación (por ejemplo, "Dept. of Physics, University of Tokyo, Japan") y un conjunto de candidatos ROR recuperados previamente, asigna a cada candidato la probabilidad de que la cadena lo nombre. A diferencia de un reranker convencional que puntúa pares de forma independiente, este modelo lee la cadena y todos los candidatos en una sola entrada, lo que le permite aprender reglas comparativas entre candidatos (por ejemplo, distinguir el hospital de la universidad que aparece en su nombre).

Es relevante para pipelines de enriquecimiento de metadatos bibliográficos y científicos, donde la normalización de afiliaciones a ROR es un paso crítico para la trazabilidad institucional. El modelo se distribuye con licencia Apache 2.0, en formato safetensors, y reporta un throughput de 97 cadenas por segundo en una NVIDIA H200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer XLM-RoBERTa (cross-encoder con cabeza lineal de puntuación por candidato) |
| Parametros totales | 567.754.752 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el modelo base es multilingue; la model card no detalla idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de BAAI/bge-reranker-v2-m3, un cross-encoder basado en XLM-RoBERTa, y añade una cabeza lineal que asigna una puntuación a cada candidato a partir de la media de los estados de token de ese candidato. La entrada tiene el formato `[CLS] string [SEP] record 1 [SEP] record 2 [SEP] ...`, de modo que el modelo procesa conjuntamente la cadena y todos los candidatos. Una calibración fija transforma cada puntuación en probabilidad mediante p = 1 / (1 + exp(-(a × score + b))). La respuesta final son todos los candidatos con p ≥ 0,5; una respuesta vacía indica que la cadena no nombra ninguna organización.

El entrenamiento se organiza en dos etapas sobre el dataset adambuttrick/ror-set-point-matching-train-validation-test. La etapa 1 usa 167.533 cadenas de la configuración `teacher_judgments` (con candidatos del top 32 del retriever más los juzgados por el profesor hasta un máximo de 42) y 133.753 cadenas de `synthetic_non_latin`. La etapa 2 usa 16.448 cadenas de `affiliations_unseen_institutions` (top 32 del retriever más top 10 léxico). El proceso incluye una validación cruzada de cinco folds para obtener puntuaciones out-of-fold, sobre las que se ajusta la calibración, y un entrenamiento final sobre todas las filas etiquetadas partiendo de los pesos de la etapa 1. Los candidatos en tiempo de ejecución provienen de ror-set-point-retriever-e5-base-openalex-jev-distill; los datos de entrenamiento se construyeron sin `--strict`, y las etiquetas ausentes entre los candidatos se sustituyen por un candidato aleatorio no etiqueta (692 casos).

## Capacidades

- Puntuación de candidatos ROR: asigna una probabilidad calibrada a cada registro candidato para una cadena de afiliación dada.
- Razonamiento comparativo entre candidatos: al leer todos los candidatos en una sola entrada, aprende reglas de exclusión mutua (por ejemplo, etiquetar el hospital pero no la universidad presente en su nombre).
- Detección de ausencia de organización: devuelve una respuesta vacía cuando la cadena no nombra ninguna organización.
- Emparejamiento multilingüe: hereda las capacidades del modelo base XLM-RoBERTa y se entrenó con datos sintéticos no latinos (`synthetic_non_latin`).
- Integración en pipelines de recuperación: diseñado para operar sobre los candidatos de un retriever (top 32) más un índice léxico (top 10).
- No soporta tool calling, function calling, agentes ni modos de razonamiento extendido; es un modelo de extracción de características orientado a una tarea concreta.

## Casos de uso

- Normalización de afiliaciones en repositorios bibliográficos: dado un campo de afiliación de un artículo (por ejemplo, en Crossref, OpenAlex o PubMed), el modelo puntúa los candidatos ROR recuperados y permite asignar el identificador institucional correcto, mejorando la trazabilidad de la producción científica por institución.
- Enriquecimiento de metadatos en bases de datos de investigación: integrado en un pipeline ETL que procesa registros de publicaciones, el modelo resuelve ambigüedades como "University of Tokyo Hospital" frente a "University of Tokyo" y evita asignaciones erróneas.
- Desambiguación de instituciones homónimas: cuando una cadena de afiliación contiene varios nombres institucionales solapados, el modelo lee todos los candidatos conjuntamente y aplica reglas comparativas que un reranker de pares independiente no capturaría.
- Construcción de grafos de colaboración institucional: al mapear afiliaciones a ROR de forma fiable, se pueden generar redes de coautoría entre instituciones con identificadores estables y comparables entre fuentes.
- Evaluación de calidad de datos en agregadores científicos: el modelo puede usarse como filtro para detectar afiliaciones que no corresponden a ninguna organización conocida (respuesta vacía) o para medir la confianza de las asignaciones existentes.
- Procesamiento a escala en infraestructura GPU: con un throughput de 97 cadenas por segundo en una NVIDIA H200, es viable procesar lotes masivos de afiliaciones en pipelines de ingesta nocturna o bajo demanda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 567.754.752 parámetros en precisión completa (fp32) se requieren aproximadamente 2,3 GB solo para pesos, más memoria para activaciones y el lote de candidatos.
- GPU recomendadas: la model card reporta 97 cadenas por segundo en una NVIDIA H200; se recomienda GPU para velocidad, aunque la carga se hace con torch, transformers, safetensors y huggingface_hub.
- Cabe en GPU de consumo: no confirmado en la información disponible, pero por tamaño de parámetros es plausible en GPUs consumer con suficiente VRAM; no se especifican modelos concretos.
- Opciones de despliegue: carga mediante el script `set_model.py` del repositorio (solo requiere torch, transformers, safetensors y huggingface_hub); compatible con text-embeddings-inference y endpoints según los tags del repositorio.
- Latencia y throughput: 97 cadenas por segundo en una NVIDIA H200 (dato reportado por el autor).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ror-set-point-set-model-bge-reranker-v2-m3 | 567.754.752 | no disponible | Reranking ROR set point | Apache 2.0 | Hugging Face |
| ror-set-point-set-model-mmbert-base | no disponible | no disponible | Reranking ROR set point | no disponible | Hugging Face |
| BAAI/bge-reranker-v2-m3 | no disponible | no disponible | Reranking genérico multilingüe | no disponible | Hugging Face |

El modelo se diferencia de ror-set-point-set-model-mmbert-base únicamente en el modelo base utilizado, y de BAAI/bge-reranker-v2-m3 en que este último es un reranker genérico de pares, mientras que el modelo descrito lee conjuntamente la cadena y todos los candidatos con una cabeza de puntuación por candidato y calibración específica para ROR.

## Limitaciones y advertencias

- Dependencia del retriever: los candidatos en tiempo de ejecución provienen de ror-set-point-retriever-e5-base-openalex-jev-distill; si el retriever no incluye el registro correcto, el modelo no puede seleccionarlo.
- Sesgo de construcción de datos: las filas de entrenamiento se construyeron sin `--strict` y con candidatos de un retriever entrenado sobre los mismos datos, lo que puede inflar la presencia de etiquetas en las listas de candidatos respecto a cadenas nuevas.
- Sustitución de etiquetas ausentes: en 692 casos se reemplazó un candidato no etiqueta por una etiqueta ausente, lo que introduce una distribución de candidatos distinta a la de inferencia.
- Riesgo de alucinación: aunque el modelo devuelve una respuesta vacía cuando no hay organización, la calibración fija puede producir falsos positivos con p ≥ 0,5 en cadenas ambiguas.
- Idiomas: la model card no detalla los idiomas soportados; el entrenamiento incluye datos sintéticos no latinos, pero no se especifica cobertura lingüística.
- Contexto: no se documenta la longitud máxima de contexto, lo que limita la planificación para cadenas y listas de candidatos muy largas.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base BAAI/bge-reranker-v2-m3 y de los datasets de entrenamiento.
- Madurez: el repositorio tiene 57 descargas y 0 likes en el momento de la consulta, lo que sugiere una validación comunitaria limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/adambuttrick/ror-set-point-set-model-bge-reranker-v2-m3
- Colección ROR set point matching: https://huggingface.co/collections/adambuttrick/ror-set-point-matching-6ada8733c9e6fb018f382d0b
- Modelo base: https://huggingface.co/BAAI/bge-reranker-v2-m3
- Variante con base mmbert: https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base
- Variante con máscara: https://huggingface.co/adambuttrick/ror-set-point-set-model-mmbert-base-mask
- Retriever: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base-openalex-jev-distill
- Retriever alternativo: https://huggingface.co/adambuttrick/ror-set-point-retriever-e5-base
- Dataset de entrenamiento: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test
- Dataset de destilación: https://huggingface.co/datasets/adambuttrick/ror-set-point-matching-train-validation-test-openalex-jev-distill
