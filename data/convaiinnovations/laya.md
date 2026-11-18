# convaiinnovations/laya

## Resumen

Laya es un modelo de clasificación y enrutamiento de decisiones (text-classification) desarrollado por convaiinnovations. Se presenta como un "System 1 decision model" no autorregresivo: recibe un estado (texto, correo, ticket o JSON) junto con preguntas tipadas y devuelve respuestas tipadas con probabilidades calibradas matemáticamente en una sola pasada forward. No genera texto libre, por lo que no hay salida que parsear ni margen para alucinaciones en el sentido generativo habitual.

El modelo está orientado a tareas de guardrails, moderación, routing y scoring, y se entrena mediante aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD), de modo que reportar probabilidades honestas es la única vía de maximizar la recompensa. Según la model card, opera en más de 100 idiomas con una latencia declarada de aproximadamente 33 ms por inferencia.

Con 421.293.830 parámetros y un repo de 2,4 GB, Laya se posiciona como una alternativa ligera y desplegable frente a LLMs generativos para tareas de decisión acotadas. Su licencia Apache 2.0 y su compatibilidad con endpoints lo hacen apto para uso comercial, y la existencia de variantes (laya-multilingual, laya-typed-decisions) y de un flujo de fine-tuning publicado amplían su aplicabilidad en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer no autorregresivo (decision model, segun model card) |
| Parametros totales | 421.293.830 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens por defecto; hasta 8.192 tokens con `max_len=8192` en laya-multilingual |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 100+ idiomas (segun model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors; libreria transformers |

## Arquitectura y entrenamiento

La model card describe Laya como un modelo de decisión no autorregresivo de tipo System 1: en lugar de generar tokens secuencialmente, produce directamente respuestas tipadas (choice, score, noul) a partir de un estado y un conjunto de preguntas tipadas, en una única pasada forward. El checkpoint base tiene 421.293.830 parámetros y se distribuye en formato safetensors para transformers. Internamente se apoya en un Router que detecta script e idioma y enruta la entrada al checkpoint adecuado (english o multilingual).

El entrenamiento emplea aprendizaje por refuerzo contra reglas de puntuación estrictamente propias (RLCD, segun la model card), lo que incentiva la calibración de las probabilidades reportadas. El trabajo se documenta en el preprint "From Laya to Vega: Open Non-Autoregressive Decision Models with Calibrated Probabilities" (Preprints, 2026). Existe además un checkpoint afinado, laya-typed-decisions, entrenado sobre 2.000 decisiones de cuatro workflows; no se detalla en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

## Capacidades

- Clasificación y decisión tipada: respuestas de tipo choice (selección entre criterios), score (puntuación ordinal) y noul (probabilidad de sí/no).
- Calibración de probabilidades: entrenamiento RLCD orientado a que las probabilidades reportadas sean honestas y matemáticamente calibradas.
- Routing y scoring: enrutamiento a departamentos o categorías y puntuación de urgencia, riesgo, etc.
- Guardrails y moderación: evaluación de contenido y políticas mediante preguntas tipadas.
- Multilingüe: más de 100 idiomas, con detección automática de script e idioma por parte del Router.
- Documentos largos: lectura de hasta 8.192 tokens con `max_len=8192` en laya-multilingual.
- Sin generación de texto: la salida es estructurada, lo que elimina el parseo de texto libre.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente multi-step: no disponible en la información proporcionada.
- Modo thinking, vision o audio: no disponible en la información proporcionada.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un ticket, Laya responde a una pregunta choice con criterios (billing, technical, other) y devuelve la probabilidad asociada, integrándose en un sistema de asignación automática de colas.
- Detección de riesgo de churn: con una pregunta de tipo noul ("¿el usuario amenaza cancelar?"), el modelo devuelve la probabilidad de abandono para priorizar acciones de retención.
- Puntuación de urgencia: mediante preguntas score con criterios ordinales ("not urgent", "soon", "blocking"), permite clasificar la severidad de incidencias y correos entrantes.
- Moderación y guardrails: evaluación de contenido frente a políticas mediante preguntas tipadas, con probabilidades calibradas que facilitan fijar umbrales de bloqueo o revisión humana.
- Clasificación multilingüe de correos: el Router detecta el idioma y envía texto no inglés a laya-multilingual, permitiendo clasificar mensajes en decenas de idiomas con una sola llamada.
- Análisis de documentos largos: con `max_len=8192`, laya-multilingual puede responder preguntas sobre documentos de hasta aproximadamente 4.000 tokens con alta fiabilidad declarada (16-18 de 20 aciertos segun la model card).
- Fine-tuning por dominio: entrenar un checkpoint propio sobre decisiones de la empresa usando el notebook publicado para 2x T4 de Kaggle, elevando la precisión de 0,362 (base) a 0,766 (laya-typed-decisions) en el benchmark de decisiones tipadas.
- Despliegue como servidor: extras `laya[serve]`, `laya[mcp]` y `laya[langchain]` permiten exponer el modelo por HTTP, vía MCP o integrarlo en LangChain/LangGraph.

## Benchmarks y rendimiento

| Benchmark | Modelo | Resultado |
|---|---|---|
| Typed-decisions benchmark (2.000 decisiones, 4 workflows) | laya-typed-decisions (fine-tuned) | 0,766 accuracy |
| Typed-decisions benchmark (2.000 decisiones, 4 workflows) | Checkpoint base english | 0,362 accuracy |
| Long-context (laya-multilingual, 8.192 tokens) | Documentos de hasta ~4.000 tokens | 16-18 de 20 respuestas correctas |
| Long-context (laya-multilingual, 8.192 tokens) | Documentos más largos | 8-17 de 20 respuestas correctas |
| Latencia declarada | Inferencia single forward pass | ~33 ms |
| Latencia long-context (Apple GPU) | Entrada de 4.000 tokens | ~1,7 s |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 421,3 M parámetros, los pesos en fp32 ocuparían aproximadamente 1,7 GB y en fp16 unos 0,85 GB, aunque la model card no confirma tipos de cuantización.
- GPU recomendadas: no disponible; la model card menciona ejecución en Apple GPU para long-context y entrenamiento en 2x T4 de Kaggle.
- Consumer GPU: por tamaño de parámetros, es plausible en GPU consumer, pero no se confirma en la información disponible.
- Opciones de despliegue: librería `laya` (pip), `laya[serve]` (servidor HTTP), `laya[mcp]` (servidor MCP), `laya[langchain]` (LangChain/LangGraph), `laya[onnx]` (ONNX Runtime), `laya[fast]` (TileLang GPU fast path), además de endpoints compatibles y deploy en Azure.
- Latencia y throughput: ~33 ms por inferencia declarada; ~1,7 s para 4.000 tokens en Apple GPU. Throughput no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Laya | 421,3 M | 1.024 (hasta 8.192 en multilingual) | Decision/clasificacion tipada con probabilidades calibradas | Apache 2.0 | Hugging Face, pip, endpoints |
| laya-typed-decisions | no disponible | no disponible | Decision tipada afinada | no disponible | Hugging Face |
| Vega | no disponible | no disponible | Decision model (mismo preprint) | no disponible | studio.embedding.in |

No se dispone de datos suficientes sobre modelos de terceros comparables en la información proporcionada; por tanto, la comparativa con alternativas externas queda como no disponible.

## Limitaciones y advertencias

- No genera texto: solo responde a preguntas tipadas predefinidas; no sirve para generación libre, resumen o chat abierto.
- Calibración dependiente del dominio: la precisión del checkpoint base es baja (0,362) en el benchmark de decisiones tipadas; el fine-tuning por dominio es clave para resultados útiles.
- Contexto limitado por defecto: el límite de 1.024 tokens trunca documentos largos si no se pasa `max_len=8192`; incluso con 8.192, la fiabilidad decae en documentos muy largos (8-17 de 20 aciertos).
- Riesgo de enrutamiento incorrecto: textos mayoritariamente en inglés pueden dirigirse al checkpoint english aunque convenga el multilingual, si no se especifica `model="multilingual"`.
- Idiomas: se declaran 100+ idiomas, pero no se detalla cobertura ni calidad por idioma.
- Sesgos: no disponible en la información proporcionada.
- Alucinación: el modelo no genera texto, pero la probabilidad reportada puede estar mal calibrada fuera de la distribución de entrenamiento; conviene validar con datos propios.
- Licencia Apache 2.0: permite uso comercial con atribución y conservación de avisos; revisar términos del preprint y del servicio Studio.
- Dependencia de servicios externos: Studio (studio.embedding.in) para entrenar motores de decisión propios; crédito gratuito inicial de 10 USD, condiciones comerciales no detalladas.

## Enlaces

- [Hugging Face: convaiinnovations/laya](https://huggingface.co/convaiinnovations/laya)
- [Checkpoint afinado laya-typed-decisions](https://huggingface.co/convaiinnovations/laya-typed-decisions)
- [Preprint: From Laya to Vega](https://doi.org/10.20944/preprints202611.0781.v1)
- [GitHub: NandhaKishorM/laya](https://github.com/NandhaKishorM/laya)
- [README GitHub (instalacion)](https://github.com/NandhaKishorM/laya#installation-details)
- [README GitHub (fine-tuning)](https://github.com/NandhaKishorM/laya#fine-tuning)
- [Notebook de fine-tuning en Kaggle (2x T4)](https://github.com/NandhaKishorM/laya/blob/main/notebooks/laya_finetune_typed_decisions_2xT4_kaggle.ipynb)
- [Script de benchmark long-context](https://github.com/NandhaKishorM/laya/blob/main/research/scripts/bench_long_context.py)
- [Documentacion: nandhakishorm.github.io/laya](https://nandhakishorm.github.io/laya)
- [Studio de Embedding Space](https://studio.embedding.in)
