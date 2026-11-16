# mutkuoz/turkic-relevance-laya-multilingual

## Resumen

El modelo `turkic-relevance-laya-multilingual` es un clasificador de texto especializado que determina el grado de relación de un artículo de Wikipedia en turco con el mundo túrquico. Lo desarrolla el autor `mutkuoz` para el proyecto Turkipedia de la Turkic Blue Foundation, una enciclopedia comunitaria centrada en historia y cultura túrquicas. El modelo parte del encoder de Laya-multilingual (Convai Innovations, Apache-2.0), construido sobre mmBERT-base del JHU CLSP, y sustituye su cabeza de decisión por un pooling de media y una capa lineal de tres etiquetas.

La relevancia práctica del modelo es acotada pero clara: resuelve una tarea de clasificación concreta (etiquetar artículos como `core`, `modern` o `unrelated` respecto al legado túrquico) que, en modo zero-shot, el modelo base no resolvía en absoluto (20-45 % de precisión, equivalente al azar). El ajuste fino sobre 27.000 artículos etiquetados eleva la precisión a 0,858 en tres clases sobre un conjunto de evaluación manual.

Técnicamente es un encoder ModernBERT de 22 capas y 306.939.648 parámetros totales, con una ventana de entrada de 384 tokens. No es un modelo generativo: no admite preguntas abiertas ni la API de question-answering de Laya, sino únicamente la clasificación de un documento concreto. Su licencia Apache-2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (encoder transformer bidireccional), 22 capas, base mmBERT-base vía Laya-multilingual |
| Parametros totales | 306.939.648 (encoder 307M + cabeza lineal de 2.307 parámetros) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 384 tokens (truncado en la entrada del clasificador) |
| Tipos de cuantizacion | no disponible (pesos safetensors en bf16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | turco (`tr`); el modelo base Laya-multilingual es multilingüe, pero el ajuste fino se hizo solo con datos en turco |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (`model.safetensors` + `head.safetensors`) |

## Arquitectura y entrenamiento

La arquitectura es un encoder ModernBERT de 22 capas heredado de Laya-multilingual, que a su vez se apoya en mmBERT-base (JHU CLSP, licencia MIT). El autor conserva el encoder y descarta la cabeza de decisión original de Laya, reemplazándola por un mean pooling sobre los tokens de la secuencia y una capa lineal de tres salidas (`core`, `modern`, `unrelated`). La entrada se formatea como el título, una línea con hasta 15 categorías separadas por `; `, una línea en blanco y el texto de apertura del artículo, truncado a 384 tokens. Las categorías son opcionales: durante el entrenamiento se ocultaron en el 40 % de los ejemplos para que el modelo funcione sin ellas.

El ajuste fino se realizó sobre 27.000 artículos de Wikipedia en turco (volcado de finales de septiembre de 2026), 9.000 por etiqueta, extraídos en su mayoría del vecindario de enlaces de 150 artículos semilla túrquicos más artículos aleatorios. Las etiquetas se generaron con reglas escritas a mano sobre las categorías de Wikipedia, con una concordancia del 92,6 % respecto a las etiquetas manuales en el 78 % de artículos cubiertos. Se aplicaron dos refinamientos derivados del análisis de errores: los negativos se juzgan por categorías y no por menciones textuales de Turquía, y la vida pública y estatal de la era republicana se etiqueta como `modern` para evitar que el clasificador derivase hacia ella. El entrenamiento usó AdamW con learning rate 2e-5 para el encoder y 4e-4 para la cabeza, schedule one-cycle, batch 16, label smoothing 0,05, precisión bf16 y dos épocas en una RTX 5070 Ti (unos 8 minutos por época). Se publicó la primera época, la mejor puntuada sobre las etiquetas manuales.

## Capacidades

- Clasificación de relevancia en tres etiquetas (`core`, `modern`, `unrelated`) de artículos de Wikipedia en turco a partir de título, categorías y párrafos iniciales.
- Funciona con o sin categorías de Wikipedia como entrada.
- Extracción de características (`feature-extraction`) mediante `AutoModel.from_pretrained`, ya que el encoder es un `ModernBertModel` estándar.
- Compatible con text-embeddings-inference y endpoints compatibles según los tags del repositorio.
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No soporta la API general de question-answering de Laya-multilingual.
- Capacidad multilingüe no demostrada: entrenado y evaluado solo con texto en turco.

## Casos de uso

- Curación de enciclopedias temáticas: el modelo permite filtrar un volcado completo de Wikipedia en turco y seleccionar automáticamente los artículos con valor patrimonial túrquico. El autor lo aplicó a un crawl de 59.260 artículos y seleccionó 14.244 como `core`, lo que demuestra su viabilidad a esa escala.
- Construcción de bases de conocimiento especializadas: los artículos clasificados como `core` pueden alimentar un índice de recuperación o un corpus de entrenamiento para un asistente sobre historia y cultura túrquicas, con umbral de probabilidad ajustable (0,8-0,9) cuando prima la precisión.
- Enrutado de contenidos en portales culturales: integrado en un pipeline de ingestión, el clasificador decide si un artículo nuevo se publica en la sección de patrimonio, en la de actualidad o se descarta, reduciendo la revisión manual a los casos límite.
- Detección de deriva temática en corpus existentes: el modelo distingue el legado histórico (`core`) de la actualidad republicana (`modern`), lo que permite auditar colecciones que hayan acumulado contenido de actualidad no deseado.
- Etiquetado de conjuntos de datos para aprendizaje supervisado: sus salidas pueden usarse como preetiquetas en la anotación de corpus turcos, con revisión humana posterior, dado el 92,6 % de concordancia de las reglas de entrenamiento con las etiquetas manuales.
- Moderación y desambiguación léxica: distingue artículos sobre el pueblo túrquico de artículos sobre el ave (`turkey`), lo que resulta útil en tareas de desambiguación y en la limpieza de resultados de búsqueda.
- Filtrado previo en pipelines de recuperación aumentada: al ser un encoder de 307M parámetros, puede ejecutarse en CPU o en GPU de consumo para puntuar rápidamente candidatos antes de pasarlos a un modelo mayor.

## Benchmarks y rendimiento

| Conjunto de evaluacion | Exactitud (3 clases) | Precision / recall de `core` con p >= 0,5 | Precision / recall de `core` con p >= 0,9 |
|---|---|---|---|
| 296 artículos a un enlace de las semillas (`eval/labels.tsv`) | 0,858 | 0,859 / 0,915 | 0,891 / 0,856 |
| 69 artículos a dos o tres enlaces (`eval/drift_labels.tsv`)* | 0,884 | 0,889 / 0,930 | 0,902 / 0,860 |
| Mismos 296 artículos, Laya-multilingual zero-shot | 0,20-0,45 | aproximadamente la tasa base | no disponible |

\* Muestra no aleatoria: extraída de artículos que una versión anterior del modelo clasificó como `core`, para comprobar si esta versión corrigió su deriva.

En uso real, sobre un crawl de 59.260 artículos de Wikipedia en turco, una muestra aleatoria de 50 artículos seleccionados como `core` arrojó 39 claramente correctos, 4 límite y 7 incorrectos.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 0,6-1,2 GB en bf16 para los 307M parámetros del encoder, más el overhead de activaciones para secuencias de 384 tokens; cabe holgadamente en cualquier GPU de consumo moderna.
- GPU recomendadas: el autor entrenó en una RTX 5070 Ti; para inferencia sirven RTX 3060, RTX 4060, RTX 4090, A100 o H100, aunque estas últimas están sobredimensionadas para el tamaño del modelo.
- Cabe en GPU de consumo: sí, en cualquier tarjeta con 4 GB o más de VRAM; también funciona en CPU, ya que el script del autor selecciona GPU si está disponible y CPU en caso contrario.
- Opciones de despliegue: `transformers` (versión 5 o superior), text-embeddings-inference y endpoints compatibles según los tags; `AutoModel.from_pretrained` funciona directamente con el encoder. No se documentan pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponible. El autor solo reporta tiempos de entrenamiento (unos 8 minutos por época en una RTX 5070 Ti), no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `mutkuoz/turkic-relevance-laya-multilingual` | 306.939.648 | 384 tokens | Clasificación de relevancia túrquica en 3 etiquetas | Apache-2.0 | Hugging Face, 9 descargas |
| `convaiinnovations/laya-multilingual` (base) | no disponible | no disponible | Question-answering multilingüe general | Apache-2.0 | Hugging Face |
| `jhu-clsp/mmBERT-base` (base del base) | no disponible | no disponible | Encoder multilingüe de propósito general | MIT | Hugging Face |

No se dispone de datos de benchmarks comparativos con clasificadores alternativos de temática túrquica en la información proporcionada. La comparación relevante documentada es la del propio modelo frente a su base en modo zero-shot: 0,858 de exactitud frente a 0,20-0,45, lo que justifica el ajuste fino.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente con artículos de Wikipedia en turco; otros tipos de texto y otros idiomas no están cubiertos.
- El modelo no es generativo y no responde a preguntas abiertas; no debe esperarse de él el comportamiento de la API de question-answering de Laya-multilingual.
- La frontera entre `core` y `modern` es una decisión editorial del proyecto turkic.blue, no un criterio objetivo; otros proyectos pueden necesitar redefinirla y reentrenar.
- Las etiquetas de entrenamiento son ruidosas (provienen de reglas sobre categorías de Wikipedia, con 92,6 % de concordancia con las etiquetas manuales) y se aplicó label smoothing de 0,05 en consecuencia.
- Las etiquetas de los conjuntos de evaluación se generaron con un asistente de IA (Claude) y fueron revisadas por el responsable de contenido de turkic.blue; los juicios límite están marcados en los ficheros de `eval/`.
- El conjunto de 69 artículos de deriva no es una muestra aleatoria, por lo que su exactitud de 0,884 no debe interpretarse como una estimación insesgada del rendimiento general.
- En uso real, 7 de 50 artículos seleccionados como `core` eran incorrectos y 4 eran límite, lo que indica una tasa de error apreciable en producción si no se aplica un umbral más alto (0,8-0,9).
- Riesgo de alucinación no aplicable en el sentido generativo, pero sí riesgo de falsos positivos en la clasificación, especialmente en artículos que mencionan Turquía de pasada (etimología, traducciones).
- No se documentan sesgos conocidos más allá de los derivados de la composición del corpus de entrenamiento (vecindario de 150 artículos semilla túrquicos más muestras aleatorias).
- La licencia Apache-2.0 permite uso comercial sin restricciones adicionales, pero el texto de los artículos de Wikipedia usado para entrenar es CC BY-SA 4.0 y no se redistribuye en el repositorio.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mutkuoz/turkic-relevance-laya-multilingual)
- [Modelo base Laya-multilingual (Convai Innovations)](https://huggingface.co/convaiinnovations/laya-multilingual)
- [mmBERT-base (JHU CLSP)](https://huggingface.co/jhu-clsp/mmBERT-base)
- [Turkic Blue Foundation](https://www.turkicblue.org)
