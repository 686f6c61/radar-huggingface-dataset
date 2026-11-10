# ken11/decider-ja-0.5b-v1-2611

## Resumen

decider-ja-0.5b-v1-2611 es un modelo de decisión (decision model) para japonés desarrollado por ken11, construido como un adaptador LoRA más una cabeza de clasificación sobre el modelo base sbintuitions/sarashina2.2-0.5b. No es un modelo generativo: en lugar de producir texto, asigna probabilidades a un conjunto de opciones dadas por el usuario. Soporta tres modalidades de pregunta: `noul` (sí/no, devuelve la probabilidad de "sí"), `choice` (selección entre N opciones, devuelve la probabilidad de cada una) y `score` (escala ordinal, devuelve la probabilidad de cada nivel y el valor esperado).

El modelo está pensado para decisiones pequeñas dentro de agentes y flujos de trabajo: enrutamiento de consultas a departamentos, evaluación de urgencia o gravedad, verificación de condiciones. Con 793 millones de parámetros totales y un adaptador LoRA, el coste computacional es bajo y permite despliegue en CPU o en AWS Lambda. El autor lo entrenó con el código y la receta de Strands Decider, aunque aclara que no es el modelo oficial de dicho proyecto.

La relevancia actual radica en su enfoque: separar la clasificación probabilística del razonamiento generativo permite construir agentes con pasos de decisión baratos, deterministas en formato y desplegables en infraestructura mínima. La licencia MIT y la disponibilidad de pesos en safetensors y GGUF facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base: sbintuitions/sarashina2.2-0.5b) con adaptador LoRA y cabeza de decisión |
| Parametros totales | 793.048.320 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el autor reporta pruebas con entradas de hasta 2.006 tokens) |
| Tipos de cuantizacion | Q8_0 (GGUF publicado); cuantizaciones adicionales no disponibles |
| Idiomas soportados | japonés (ja) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA en `lora/` y cabeza en `head.safetensors`); GGUF (`gguf/decider-ja-0.5b-v1-2611-q8_0.gguf`) |

## Arquitectura y entrenamiento

El modelo se compone de tres piezas: el modelo base sarashina2.2-0.5b (transformer decoder de 0,5B parámetros), un adaptador LoRA entrenado sobre él y una cabeza de decisión (`head.safetensors`) que transforma los estados ocultos en probabilidades sobre las opciones. El repositorio no incluye los pesos del modelo base; estos se descargan del Hub en la primera carga. Para el despliegue sin torch se distribuye una versión GGUF Q8_0 con el adaptador integrado, que se combina con la cabeza y el tokenizador en `gguf/assets/`.

El entrenamiento utilizó una mezcla de datasets públicos y datos sintéticos generados con modelos locales; los datos en inglés se tradujeron al japonés. La lista de datasets cubre clasificación de intenciones (banking77, clinc_oos, amazon_massive_intent_ja-JP), análisis de sentimiento y opiniones (sst5, app_reviews, chABSA), moderación y toxicidad (civil_comments, multilingual_toxicity_dataset), inferencia en lenguaje natural (MNLI, WNLI, JNLI, JSNLI, auto-wiki-nli-reward), QA (boolq, PubMedQA, JaQuAD, JEMHopQA, Boardgame-QA), detección de spam, formalidad, razonamiento (ruletaker), preferencias (HelpSteer2, hh-rlhf-12k-ja) y otros conjuntos de JGLUE y JSNLI. El autor indica que los datos internos de evaluación no se incluyeron en el entrenamiento. No se detalla el número de tokens, la composición exacta ni si hubo RLHF/DPO más allá del uso de datasets de preferencias como datos de entrenamiento.

## Capacidades

- Clasificación binaria sí/no con probabilidad de "sí" (modo `noul`).
- Clasificación multiclase con probabilidad por opción (modo `choice`), incluyendo descripciones o criterios por opción que estabilizan la decisión.
- Evaluación ordinal con probabilidad por nivel y valor esperado (modo `score`).
- Enrutamiento de consultas y asignación de categorías en flujos de agentes.
- Evaluación de urgencia, gravedad, sentimiento, formalidad, toxicidad e intención.
- Verificación de condiciones y detección de spam o contenido inapropiado.
- Soporte de múltiples preguntas en una sola petición (ejemplo del autor con tres preguntas).
- Inferencia vía CLI, servidor HTTP compatible con endpoint `/v1/systemone`, API Python y ruta GGUF sin torch (`HiddenStateEngine`, `deploy/lambda`).
- No genera texto libre ni soporta tool calling generativo, visión, audio ni razonamiento multi-paso autónomo.

## Casos de uso

- Enrutamiento de consultas de atención al cliente: clasificar un mensaje entrante en departamentos (envíos, contabilidad, producto) usando el modo `choice` con criterios por opción; el ejemplo del autor muestra una confianza de 0,756 para "envíos" en una consulta de pedido no recibido.
- Priorización de tickets de soporte: aplicar el modo `score` sobre una escala de urgencia o gravedad para ordenar colas de trabajo; el autor reporta latencias de 0,38 s de mediana y 0,58 s p95 para publicaciones cortas de unos 220 tokens con una pregunta.
- Moderación de contenido en comunidades: usar `noul` o `score` sobre toxicidad y civilidad, apoyándose en los datasets de moderación empleados en el entrenamiento.
- Verificación de condiciones en flujos de aprobación: comprobar si una solicitud cumple un requisito mediante preguntas sí/no encadenadas, con la advertencia de que la comparación de cifras y fechas es un punto débil declarado.
- Clasificación de intención en asistentes conversacionales japoneses: mapear utterances a intenciones predefinidas con `choice`, útil para agentes que necesitan decidir la siguiente acción sin invocar un LLM generativo.
- Despliegue serverless en AWS Lambda: la variante GGUF Q8_0 con `HiddenStateEngine` permite servir decisiones en arm64 con 10.240 MB de memoria y 6 vCPU, con tiempos de 0,94 s para 224 tokens y 10,59 s para 2.006 tokens con tres preguntas.
- Análisis de reseñas y opiniones: evaluar sentimiento y aspectos concretos (por ejemplo, con chABSA) mediante `score` o `choice`.
- Filtrado previo en pipelines RAG o de agentes: decidir si una consulta requiere recuperación, escalado a un humano o respuesta directa antes de invocar modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta mediciones de latencia en AWS Lambda (arm64, 10.240 MB, 6 vCPU, Graviton2, GGUF Q8_0), con una petición secuencial y tres preguntas por petición:

| Entrada | Tiempo de inferencia (mediana) |
|---|---|
| 224 tokens | 0,94 s |
| 566 tokens | 2,32 s |
| 1.106 tokens | 4,98 s |
| 2.006 tokens | 10,59 s |

Para una publicación corta de unos 220 tokens con una sola pregunta: mediana de 0,38 s y p95 de 0,58 s. En japonés, el autor estima aproximadamente 2,4 caracteres por token. La diferencia máxima de probabilidad entre la ruta GGUF y la ruta torch es de aproximadamente 0,05.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 793 millones de parámetros, la carga en fp16 ronda 1,6 GB y en Q8_0 alrededor de 0,8 GB, aunque estas cifras son estimaciones a partir del tamaño y no datos publicados.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer con al menos 4 GB de VRAM debería alojar el modelo en Q8_0, y una RTX 4090 o A100/H100 ofrecen margen sobrado.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU con 4 GB o más en Q8_0; el autor demuestra funcionamiento en CPU.
- Opciones de despliegue: CLI `strands-decider`, servidor HTTP con `strands-decider serve`, API Python `strands_decider.infer.load_engine`, ruta GGUF con llama.cpp (`HiddenStateEngine`) y despliegue en AWS Lambda (`deploy/lambda`).
- Latencia y throughput: ver tabla de la sección anterior; el autor no publica throughput agregado ni métricas de concurrencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-ja-0.5b-v1-2611 | 793 M | no disponible | Decisión probabilística (sí/no, elección, escala) en japonés | MIT | Hugging Face (LoRA + GGUF) |
| sbintuitions/sarashina2.2-0.5b | ~0,5 B (modelo base) | no disponible | Generación de texto en japonés | no disponible en la información | Hugging Face |
| Strands Decider (modelos oficiales) | no disponible | no disponible | Decisión probabilística | no disponible en la información | Repositorio strands-labs/strands-decider |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Documentos largos: el autor advierte de más errores al contrastar normativas con solicitudes o al distinguir qué se resolvió en conversaciones extensas.
- Cálculo numérico y temporal: comparación de importes, cálculo de plazos y verificación contra límites son puntos débiles declarados.
- Sesgo hacia los extremos: en escalas de 3 o 5 niveles rara vez selecciona el nivel neutro.
- Sensibilidad a palabras superficiales: términos como "urgente" o "no aplica" pueden alterar la respuesta con independencia del contenido.
- Probabilidades sin calibrar (temperatura 1,0): si se usan como umbral de confianza, deben validarse con datos propios.
- Solo japonés: no hay soporte multilingüe declarado; los datos en inglés se tradujeron al japonés para el entrenamiento.
- No es un modelo generativo: no produce texto, no soporta tool calling generativo ni razonamiento multi-paso autónomo.
- Licencia MIT: permite uso comercial, pero el modelo base sarashina2.2-0.5b se descarga por separado y su licencia debe verificarse de forma independiente.
- El autor aclara que no es el modelo oficial de Strands Decider; la receta y el código provienen de ese proyecto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ken11/decider-ja-0.5b-v1-2611
- Modelo base: https://huggingface.co/sbintuitions/sarashina2.2-0.5b
- Repositorio Strands Decider: https://github.com/strands-labs/strands-decider
- JGLUE: https://github.com/yahoojapan/JGLUE
- Dataset tals/vitaminc: https://huggingface.co/datasets/tals/vitaminc
- Dataset legacy-datasets/banking77: https://huggingface.co/datasets/legacy-datasets/banking77
- Dataset clinc/clinc_oos: https://huggingface.co/datasets/clinc/clinc_oos
- Dataset google/civil_comments: https://huggingface.co/datasets/google/civil_comments
- Dataset SetFit/sst5: https://huggingface.co/datasets/SetFit/sst5
- Dataset nyu-mll/glue: https://huggingface.co/datasets/nyu-mll/glue
- Dataset sealuzh/app_reviews: https://huggingface.co/datasets/sealuzh/app_reviews
- Dataset google-research-datasets/paws: https://huggingface.co/datasets/google-research-datasets/paws
- Dataset ucirvine/sms_spam: https://huggingface.co/datasets/ucirvine/sms_spam
- Dataset osyvokon/pavlick-formality-scores: https://huggingface.co/datasets/osyvokon/pavlick-formality-scores
- Dataset tasksource/ruletaker: https://huggingface.co/datasets/tasksource/ruletaker
- Dataset google/boolq: https://huggingface.co/datasets/google/boolq
- Dataset fancyzhx/dbpedia_14: https://huggingface.co/datasets/fancyzhx/dbpedia_14
- Dataset qiaojin/PubMedQA: https://huggingface.co/datasets/qiaojin/PubMedQA
- Dataset tasksource/Boardgame-QA: https://huggingface.co/datasets/tasksource/Boardgame-QA
- Dataset nvidia/HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
- Dataset cl-nagoya/auto-wiki-nli-reward: https://huggingface.co/datasets/cl-nagoya/auto-wiki-nli-reward
- Dataset cl-nagoya/auto-wiki-qa: https://huggingface.co/datasets/cl-nagoya/auto-wiki-qa
- Dataset SkelterLabsInc/JaQuAD: https://huggingface.co/datasets/SkelterLabsInc/JaQuAD
- Dataset hitachi-nlp/JFLD: https://huggingface.co/datasets/hitachi-nlp/JFLD
- Dataset ku-nlp/jp-llm-evaluator-training: https://huggingface.co/datasets/ku-nlp/jp-llm-evaluator-training
- Dataset tokyotech-llm/JEMHopQA: https://huggingface.co/datasets/tokyotech-llm/JEMHopQA
- Dataset llm-jp/llm-jp-longbench-JEMHop: https://huggingface.co/datasets/llm-jp/llm-jp-longbench-JEMHop
- Dataset SetFit/amazon_massive_intent_ja-JP: https://huggingface.co/datasets/SetFit/amazon_massive_intent_ja-JP
- Dataset zenless-lab/chABSA: https://huggingface.co/datasets/zenless-lab/chABSA
- Dataset llm-jp/hh-rlhf-12k-ja: https://huggingface.co/datasets/llm-jp/hh-rlhf-12k-ja
- Dataset textdetox/multilingual_toxicity_dataset: https://huggingface.co/datasets/textdetox/multilingual_toxicity_dataset
