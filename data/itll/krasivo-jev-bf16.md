# ITLL/krasivo-jev-bf16

## Resumen

krasivo-jev-bf16 es un adaptador LoRA con cabeza pointer entrenado sobre el modelo base Qwen/Qwen3.5-2B-Base, publicado por el usuario ITLL en Hugging Face. No es un modelo generativo al uso: se trata de un clasificador de opciones multiple-choice que, en un único forward pass, devuelve una distribución de probabilidad sobre una lista arbitraria de opciones dada una pregunta y un contexto de estado. El autor lo describe como un modelo de "system one", pensado para clasificación, enrutamiento, comprobación de extracciones, NLI, guardrails y comprensión lectora, no para responder desde conocimiento del mundo.

La arquitectura combina el transformer de Qwen3.5-2B (con capas de atención lineal Gated DeltaNet) con un adaptador LoRA de rango 16 aplicado a todas las proyecciones de atención, atención lineal y MLP, más una cabeza pointer de 256 dimensiones. El modelo base tiene 1.882.874.176 parámetros; el repositorio ocupa 3,9 GB en safetensors. Soporta inglés y ruso, y su diseño permite cualquier número de opciones sin slots fijos.

Su relevancia radica en el enfoque: sustituye la generación de texto por una puntuación directa de opciones, lo que reduce latencia y facilita la calibración probabilística (ECE de 0,043 en el conjunto core). El autor advierte que esta versión concreta se entrenó incluyendo los splits de entrenamiento de 20 benchmarks, por lo que sus métricas miden ajuste a tareas vistas, no transferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Qwen3.5 con atención lineal Gated DeltaNet + adaptador LoRA (rango 16) + cabeza pointer de 256 dimensiones |
| Parametros totales | 1.882.874.176 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens (secuencias truncadas a este límite; un estado más largo pierde su parte central) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | inglés (en), ruso (ru) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | Qwen/Qwen3.5-2B-Base |
| Librería | peft |
| Pipeline | text-classification |
| Preguntas soportadas | noul (sí/no) y choice (cualquier número de opciones) |
| Temperatura de calibración | 0,626 |
| Pasos de optimización | 34.315 (2 épocas sobre 100 datasets) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B-Base, un transformer con capas de atención lineal Gated DeltaNet, y le superpone un adaptador LoRA de rango 16 en cada proyección de atención, atención lineal y MLP, junto con una cabeza pointer de 256 dimensiones. La muestra se serializa como una única secuencia causal con delimitadores que reutilizan tokens especiales poco usados de Qwen (sin añadir filas al vocabulario): `<state> state <q> question <opt> option 1 </opt> ... <decide>`. La cabeza proyecta el hidden state en `<decide>` y en cada `</opt>` a 256 dimensiones; el logit de cada opción es su producto escalar escalado, y un softmax a temperatura 0,626 produce las probabilidades. Al derivar el logit del texto de cada opción, el número de opciones es arbitrario y las etiquetas pueden ser cualesquiera.

El entrenamiento usó únicamente la etapa `ce`, con pérdida focal (γ = 2) sobre la distribución de opciones, que admite etiquetas suaves. Se realizaron 34.315 pasos de optimizador (2 pasadas sobre 100 datasets, muestreo `sized`), con batches de hasta 8.192 tokens con padding y 2 pasos de acumulación, learning rate 2e-4, 500 pasos de warmup y weight decay 0,01. La precisión fue bf16 para pesos base y autocast, con LoRA y cabeza en float32. Como aumento de datos, las opciones se rebarajan en cada muestra y, con p = 0,2, se eliminan algunas opciones incorrectas para que el modelo no aprenda un prior posicional. La atención es causal pura, de modo que una opción puede ver las anteriores y la salida puede depender algo del orden. El diseño está adaptado de kev.

## Capacidades

- Clasificación multiple-choice zero-shot sobre un número arbitrario de opciones, sin slots fijos.
- Preguntas de sí/no (`noul`) y de elección (`choice`).
- Enrutamiento y clasificación de intenciones en dominios de atención al cliente, banca, seguros, telco y soporte técnico.
- NLI y razonamiento sobre premisas dadas (MultiNLI, ANLI, LogicNLI, babi_nli, chaos-mnli-ambiguity).
- Comprensión lectora y question answering extractivo (SQuAD en ruso, RACE, DREAM, QASC, Quartz, ROPES, SciQ, boolq, hotpot_qa).
- Detección de contenido tóxico, jailbreak y prompt injection (toxic-chat, Aegis, safe-guard-prompt-injection, jailbreak-classification).
- Extracción de información y verificación en contratos (CUAD, VitaminC, NEREL).
- Clasificación de emociones y sentimiento (go_emotions, dair-ai/emotion, sst2, imdb, tweet_eval).
- Tareas de razonamiento lógico y matemático de opción múltiple (folio-refined, proofwriter, reclor, stepgame, ProverQA, RuleCollection-32K).
- Evaluación de calidad lingüística en ruso (RuBLiMP, RuCoLA, russian_super_glue, MERA).
- Generación condicionada por opciones en tareas de GEM (totto, web_nlg) mediante selección entre candidatos.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no disponible (el modelo es de un único forward pass, "system one").
- Capacidades multilingües limitadas a inglés y ruso.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de un ticket y una lista de categorías (facturación, incidencias técnicas, reclamaciones, etc.), el modelo devuelve la probabilidad de cada categoría en un solo paso, lo que permite umbrales de confianza calibrados (ECE 0,043) para derivar a revisión humana los casos ambiguos.
- Clasificación de intenciones en asistentes conversacionales: con datasets como CLINC150, Banking77 o Massive, se puede puntuar la intención del usuario entre las opciones definidas por el desarrollador, sin reentrenar el modelo para cada nueva taxonomía.
- Guardrails y moderación de contenido: al puntuar opciones como "seguro", "tóxico", "jailbreak" o "prompt injection" sobre un contexto, se integra en pipelines de filtrado previo a un LLM generativo, con la ventaja de que la decisión es una probabilidad explícita.
- Verificación de extracciones en contratos: dado un fragmento de contrato y opciones de cláusula, el modelo comprueba si una extracción es correcta, útil en pipelines de CUAD o VitaminC donde se necesita validar salidas de un extractor previo.
- NLI en pipelines de validación factual: comprobar si una afirmación se sigue de un contexto dado mediante opciones "entailment", "neutral" o "contradiction", como paso de verificación antes de publicar contenido generado.
- Clasificación de emociones y sentimiento en redes sociales: con tweet_eval o go_emotions, puntuar publicaciones entre etiquetas de emoción para monitorización de marca, aprovechando el soporte de inglés y ruso.
- Evaluación de calidad gramatical en ruso: usar RuBLiMP o RuCoLA para detectar si una frase es aceptable o no, como filtro en pipelines de generación en ruso.
- Triaje de issues en repositorios: con Tilakoid/vscode-bug-feature-triage, clasificar un issue entre bug, feature o pregunta, integrándolo en flujos de CI/CD para asignación automática.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a los splits de test de 80 datasets core y 20 datasets de benchmark. El autor advierte explícitamente que los splits de entrenamiento de los 20 benchmarks formaron parte del entrenamiento, por lo que las métricas de benchmark miden ajuste, no transferencia.

| Conjunto | Exactitud macro | NLL | ECE |
|---|---|---|---|
| 80 datasets core (test) | 0,877 | 0,359 | 0,043 |
| 20 datasets benchmark (test, vistos en entrenamiento) | 0,791 | 0,549 | 0,064 |

No se han publicado resultados desglosados por benchmark (MMLU, HumanEval, GSM8K u otros) en la información disponible. Para métricas de transferencia, el autor remite a la ejecución held-out `20261017-192041` (modelo bizhmans/krasivo-jev-no-bench-bf16), de la que no se proporcionan cifras en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base tiene 1.882.874.176 parámetros; en bf16 requiere aproximadamente 3,8 GB solo para pesos, más memoria para activaciones y la cabeza pointer. El repositorio ocupa 3,9 GB.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría en GPUs consumer con al menos 8 GB de VRAM en bf16, aunque el dato no está confirmado por el autor.
- ¿Cabe en GPU consumer? Por el tamaño de parámetros, previsiblemente sí en tarjetas de 8 GB o más, pero no hay confirmación oficial.
- Opciones de despliegue: la model card menciona la etiqueta `vllm` y la librería `peft`; no se detallan configuraciones para llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible. El diseño de un único forward pass sobre opciones sugiere menor latencia que la generación autoregresiva, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Idiomas |
|---|---|---|---|---|---|
| ITLL/krasivo-jev-bf16 | 1,88 B (base Qwen3.5-2B) | 8.192 tokens | Clasificación pointer multiple-choice | no disponible | en, ru |
| Qwen/Qwen3.5-2B-Base | ~2 B | no disponible | Generación autoregresiva | no disponible | multilingüe |
| bizhmans/krasivo-jev-no-bench-bf16 | mismo base | 8.192 tokens | Igual, sin benchmarks en entrenamiento | no disponible | en, ru |

No se dispone de datos de rendimiento comparables entre estas alternativas en la información proporcionada. La comparación con clasificadores dedicados tipo DeBERTa o modelos de NLI no está disponible en la documentación del autor.

## Limitaciones y advertencias

- El modelo no responde desde conocimiento del mundo: solo puntúa opciones a partir del estado y la pregunta proporcionados. Usarlo como generador produciría resultados incorrectos.
- Esta versión concreta se entrenó con los splits de entrenamiento de 20 benchmarks, por lo que sus métricas de benchmark están infladas y no reflejan transferencia a tareas nuevas.
- La atención es causal pura, por lo que la salida puede depender del orden de las opciones; el autor mitiga esto rebarajando durante el entrenamiento, pero no lo elimina.
- Las secuencias se truncan a 8.192 tokens y un estado más largo pierde su parte central, lo que puede eliminar información crítica en contextos largos.
- Solo soporta inglés y ruso; no hay evidencia de capacidades en castellano.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido. Es un riesgo importante para producción.
- Riesgo de alucinación: aunque el modelo no genera texto libre, puede asignar alta probabilidad a opciones incorrectas cuando el estado es ambiguo o está fuera de la distribución de entrenamiento.
- Sesgos: los datasets de entrenamiento incluyen fuentes diversas (redes sociales, soporte al cliente, contenido tóxico) cuyos sesgos pueden reflejarse en las puntuaciones; no se documentan análisis de sesgo.
- No se documentan capacidades de tool calling ni de razonamiento multi-step, por lo que no es adecuado para pipelines de agentes.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ITLL/krasivo-jev-bf16
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Repositorio de código krasivo-jev v0.1.0: https://github.com/SergeyBazhmin/krasivo-jev/tree/v0.1.0
- Ejecución de entrenamiento 20261018-160511: https://github.com/SergeyBazhmin/krasivo-jev/tree/v0.1.0/runs/pointer/20261018-160511
- Ejecución held-out 20261017-192041: https://github.com/SergeyBazhmin/krasivo-jev/tree/v0.1.0/runs/pointer/20261017-192041
- Modelo held-out sin benchmarks: https://huggingface.co/bizhmans/krasivo-jev-no-bench-bf16
- Código de la cabeza pointer: https://github.com/SergeyBazhmin/krasivo-jev/tree/v0.1.0/src/jev_model/pointer
- Diseño kev de referencia: https://github.com/jaredpalmer/kev
