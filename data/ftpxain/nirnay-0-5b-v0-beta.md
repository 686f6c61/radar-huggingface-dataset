# ftpxain/nirnay-0.5b-v0-beta

## Resumen

Nirnay 0.5B (v0-beta) es un modelo de decisión no autorregresivo desarrollado por el usuario ftpxain (con repositorio asociado en GitHub bajo el handle Ronak-jain-afk), construido sobre el backbone de Qwen2.5-0.5B. No es un modelo generativo de texto al uso: en lugar de producir cadenas de razonamiento token a token, extrae el estado oculto del último token y lo proyecta directamente sobre los pesos de las opciones candidatas, devolviendo una distribución de probabilidad calibrada en un único forward pass. Se enmarca en el paradigma cognitivo que el autor denomina "System One", en contraposición al "System Two" de los LLM autorregresivos convencionales.

El modelo resuelve el problema de latencia en tareas de decisión estructurada: verificación binaria, enrutamiento categórico, clasificación de intenciones y puntuación ordinal. Al eliminar la proyección sobre el vocabulario de 152k tokens y la caché KV, el autor reporta 35 o más decisiones por segundo con 1,4 GB de VRAM en BF16 y menos de 28 ms de latencia en una GPU de portátil (RTX 4050 de 6 GB). El checkpoint publicado corresponde al 48 % del entrenamiento (316.560 muestras), de ahí la etiqueta beta.

La relevancia actual del modelo radica en su enfoque de destilación de distribuciones de profesores grandes de razonamiento (`SargeDev/jev-distill-corpus-v3`) hacia un clasificador ligero y calibrado, evaluado sobre el conjunto completo de 137 tareas del System One Mosaic Benchmark (S1MB) en inglés. Con 494 millones de parámetros supera en ese benchmark a modelos publicados de 0,8B y compite con arquitecturas de 1,7B, aunque queda por debajo de los modelos laya de 421M y 322M.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) adaptado a decisión no autorregresiva con proyección lineal sobre opciones |
| Parametros totales | 494.032.768 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el autor reporta inferencia nativa en BF16) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del backbone Qwen2.5-0.5B, un transformer decoder-only de 494M parámetros, y sustituye el cabezal de lenguaje por una proyección lineal directa sobre los pesos de las opciones candidatas. El flujo es: se concatenan estado (contexto o texto), pregunta y lista de opciones; se ejecuta un único forward pass en BF16; se toma el estado oculto del último token (dimensión 896) y se proyecta sobre las representaciones de cada opción para obtener una distribución calibrada P(A), P(B), etc. Al prescindir de la proyección sobre el vocabulario de 152k tokens y de la caché KV, el coste computacional por decisión se reduce drásticamente frente a la generación autorregresiva.

El entrenamiento se basa en destilación con objetivos suaves (soft-target distillation) desde distribuciones de profesores grandes de razonamiento, sobre el corpus `SargeDev/jev-distill-corpus-v3`. El autor reporta que el checkpoint publicado corresponde al 48 % del progreso de entrenamiento, con 316.560 muestras procesadas. Para la primitiva de puntuación ordinal (escala 0..5) se emplea Ranked Probability Score (RPS) como función de pérdida, que penaliza la distancia respecto a la distribución objetivo. El modelo expone cuatro primitivas de decisión: `noul` (verificación binaria), `choice` (selección multiclase entre opciones dinámicas), `score` (puntuación ordinal 0..5) y probabilidades calibradas como salida transversal.

## Capacidades

- Verificación binaria (`noul`): devuelve `[P(false), P(true)]` para moderación de contenido, guardrails y comprobación de aserciones.
- Enrutamiento categórico (`choice`): selección multiclase entre un conjunto dinámico de opciones candidatas, útil para triaje de intenciones y selección de herramientas.
- Puntuación ordinal (`score`): valoración en escala discreta 0..5 entrenada con Ranked Probability Score, para criterios con granularidad fina.
- Calibración de probabilidades: las confianzas de salida reflejan la probabilidad real del ground truth gracias a la destilación con objetivos suaves, en lugar de predicciones one-hot sobreconfiadas.
- Clasificación de texto en inglés como pipeline principal (`text-classification`).
- No es un modelo generativo: no produce texto libre, no soporta tool calling conversacional ni razonamiento multi-paso autorregresivo.
- Sin capacidades de visión, audio ni modo "thinking" explícito.
- Multilingüismo limitado al inglés.

## Casos de uso

- Moderación de contenido y guardrails: usar la primitiva `noul` para clasificar cada mensaje o salida como seguro/inseguro con probabilidad calibrada, integrándolo como filtro previo a un LLM generativo. La latencia inferior a 28 ms permite evaluar cada turno sin cuello de botella.
- Triaje de intenciones en atención al cliente: con `choice` se enruta cada consulta entrante hacia el departamento o flujo correcto entre un conjunto dinámico de categorías, sin generar texto intermedio.
- Selección de herramientas en pipelines de agentes: dado el estado de la conversación y la lista de herramientas disponibles, el modelo devuelve la distribución sobre qué herramienta invocar, actuando como router rápido antes de un modelo mayor.
- Evaluación automática de respuestas: con `score` se puntúa en escala 0..5 la calidad de una respuesta generada según criterios definidos, útil en pipelines de evaluación y anotación.
- Filtrado de datos para entrenamiento: clasificación binaria o multiclase a gran escala de pares pregunta-respuesta o documentos, aprovechando el throughput de 35 o más decisiones por segundo en una GPU de consumo.
- Detección de alucinaciones o inconsistencias: verificación `noul` de si una afirmación está respaldada por el contexto proporcionado, como capa de control en sistemas RAG.
- Enrutamiento en sistemas de recomendación o búsqueda: selección entre candidatos predefinidos (categorías, filtros, acciones) con probabilidades calibradas para umbralizar decisiones.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre las particiones de test del corpus de destilación, en BF16 sobre una RTX 4050 Laptop (6 GB):

| Benchmark | Muestras | Top-1 accuracy | Brier score | Latencia media | Throughput |
|---|---|---|---|---|---|
| `test_set_30k` (in-distribution) | 1.000 | 99,60 % | 0,0001 | 27,45 ms | 36,4 dec/s |
| `ood` (out-of-distribution) | 1.000 | 73,00 % | 0,3359 | 40,27 ms | 24,8 dec/s |

Resultados en el System One Mosaic Benchmark (S1MB English v1, 137 tareas, 14.009 casos), con el checkpoint al 48 % del entrenamiento:

| Tipo de decisión | Tareas | Puntuación Nirnay-0.5B |
|---|---|---|
| Noul (juicios binarios) | 59 | 10,77 |
| Choice (selección de candidatos) | 57 | 10,26 |
| Score (puntuaciones ordinales) | 21 | 0,48 |
| Media oficial S1MB | 137 | 7,17 |

Comparativa con modelos publicados en el leaderboard S1MB (puntuaciones ajustadas por baseline):

| Modelo | Parámetros | Media S1MB | Noul | Choice | Score |
|---|---|---|---|---|---|
| `laya` | 421M | 13,36 | 20,19 | 16,31 | 3,58 |
| `laya-multilingual` | 322M | 9,28 | 14,01 | 13,03 | 0,79 |
| `minojev` | 1,72B | 7,93 | 8,57 | 14,56 | 0,67 |
| Nirnay-0.5B-v0-beta (48 %) | 494M | 7,17 | 10,77 | 10,26 | 0,48 |
| `JevForge-0.8B` | 854M | 1,92 | 0,00 | 5,75 | 0,00 |

Benchmarks destacados (habilidad ajustada por baseline): `open-jev--customer-control-v1` (Noul) 100,00 %; `open-jev--vizdoom-basic-v1` (Noul) 94,12 %; `open-jev--customer-control-v1` (Choice) 82,61 %; `laya--ag-news` (Choice) 76,12 % (84,0 % de accuracy bruta); `open-jev--mailroom-control-v1` (Choice) 58,33 %; `s1mb-generalization-contextual-choice` 52,36 %; `arc-choice` 8,82 % (38,0 % de accuracy bruta frente al 25 % de azar).

## Requisitos de hardware

- VRAM estimada: 1,4 GB en BF16 según el autor; el repo ocupa 1,0 GB en safetensors.
- GPU de referencia del autor: NVIDIA GeForce RTX 4050 Laptop (6 GB), con latencias de 27,45 ms en distribución y 40,27 ms fuera de distribución.
- Cabe holgadamente en cualquier GPU de consumo con 4 GB o más de VRAM (RTX 3050, 4050, 4060, 3060, etc.).
- GPU de datacenter (A100, H100) no son necesarias para inferencia; aportarían margen para batching masivo.
- Opciones de despliegue: transformers (librería declarada), text-embeddings-inference y endpoints compatibles según los tags del repo. No se documentan integraciones con vLLM, llama.cpp ni Ollama, y al no ser un modelo generativo estándar su encaje en esos servidores no está garantizado.
- Throughput reportado: 36,4 decisiones/s en in-distribution y 24,8 decisiones/s en OOD sobre la RTX 4050.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media S1MB | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nirnay-0.5B-v0-beta | 494M | no disponible | 7,17 | apache-2.0 | Hugging Face (beta, 48 % de entrenamiento) |
| `laya` | 421M | no disponible | 13,36 | no disponible | leaderboard S1MB |
| `laya-multilingual` | 322M | no disponible | 9,28 | no disponible | leaderboard S1MB |
| `minojev` | 1,72B | no disponible | 7,93 | no disponible | leaderboard S1MB |
| `JevForge-0.8B` | 854M | no disponible | 1,92 | no disponible | leaderboard S1MB |

Frente a los modelos laya, Nirnay obtiene peor media global (7,17 frente a 13,36 y 9,28) pero con un checkpoint incompleto al 48 %; frente a `minojev` (1,72B) y `JevForge-0.8B` (854M) queda por delante en media global pese a tener menos parámetros. La licencia apache-2.0 es una ventaja clara frente a alternativas cuya licencia no está documentada en la información disponible.

## Limitaciones y advertencias

- Checkpoint beta: publicado al 48 % del entrenamiento (316.560 muestras), por lo que el rendimiento final puede diferir sustancialmente.
- Brecha notable entre in-distribution (99,60 % top-1) y out-of-distribution (73,00 % top-1, Brier 0,3359): el modelo puede sobreajustar a la distribución del corpus de destilación.
- Solo inglés; no se documenta soporte multilingüe.
- No es un modelo generativo: no puede usarse para generar texto, mantener conversaciones ni razonar paso a paso de forma autorregresiva.
- La puntuación en la primitiva `score` es baja (0,48 en S1MB), lo que sugiere calibración ordinal todavía débil.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí de calibración defectuosa fuera de distribución: las probabilidades pueden no reflejar la incertidumbre real en dominios nuevos.
- Sin datos publicados sobre sesgos demográficos o lingüísticos; al ser un clasificador entrenado por destilación, puede heredar sesgos de los profesores y del corpus.
- Licencia apache-2.0 permite uso comercial, pero el estado beta y la ausencia de validación externa desaconsejan su despliegue en producción sin evaluación propia.
- Sin información sobre longitud de contexto soportada ni sobre cuantizaciones validadas más allá de BF16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ftpxain/nirnay-0.5b-v0-beta
- Repositorio GitHub: https://github.com/Ronak-jain-afk/Nirnay
- Modelo base Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- System One Mosaic Benchmark (blog de Yuichi Tateno): https://huggingface.co/blog/hotchpotch/system-one-mosaic-benchmark
- Corpus de destilación `SargeDev/jev-distill-corpus-v3`: https://huggingface.co/SargeDev/jev-distill-corpus-v3
- Licencia Apache 2.0: https://opensource.org/licenses/Apache-2.0
