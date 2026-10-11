# bhedanikhilkumar234567/strands-decider-2B-hobson-v21

## Resumen

Strands decider 2B hobson v21 (strands-decider-2B-hobson-v21) es un modelo de decisión de aproximadamente 2.000 millones de parámetros desarrollado por Strands Labs. No es un LLM generativo al uso: en lugar de producir texto libre, responde preguntas tipadas sobre un estado — `noul` (sí/no), `choice` (una entre N opciones) y `score` (un nivel dentro de una escala ordenada) — y cada respuesta va acompañada de una confianza calibrada. Se distribuye como adaptador LoRA sobre Qwen/Qwen3.5-2B-Base más una pequeña cabeza de lectura, bajo licencia Apache-2.0.

El modelo cubre las decisiones repetitivas dentro de un flujo agéntico: enrutado de modelos, selección de herramientas, comprobación de argumentos, triaje, guardrails y evaluaciones, dejando las decisiones difíciles a un LLM de mayor tamaño. v21 es la receta de v19 más paráfrasis de preguntas verificadas y destilación desde Qwen/Qwen3.5-4B en los casos en que este coincide con la etiqueta gold. Es el seed publicado de seis, elegido mediante una regla fijada antes de clasificar los seeds.

Frente a un clasificador de texto convencional, su propuesta es unificar muchas tareas de clasificación y calibración en una única interfaz tipada y en un solo checkpoint pequeño. El repositorio de HuggingFace consultado (bhedanikhilkumar234567/strands-decider-2B-hobson-v21) ocupa 0,1 GB y no registra descargas ni likes; la versión de referencia del proyecto se publica en la organización StrandsAgents.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5) con adaptador LoRA y cabeza de lectura para decisiones tipadas; no es MoE |
| Parametros totales | ~2B en el modelo base (Qwen/Qwen3.5-2B-Base); numero de parametros del adaptador: no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la evaluacion JevBench se sirve a 4096 tokens, pero no se declara la ventana del modelo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (el inventario de entrenamiento incluye datasets multilingues, como mteb/amazon_massive_intent o papluca/language-identification, pero no se declara cobertura de idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA + cabeza de lectura) |
| Modelo base | Qwen/Qwen3.5-2B-Base (relacion: adapter) |
| Libreria de carga | peft |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 0,1 GB |
| Interfaz | CLI `strands-decider` (`ask`, `serve`) y servidor HTTP local |
| Modalidad extra | Vision opcional via `strands-decider[vision]` (transformers 5.18 o superior) |

## Arquitectura y entrenamiento

El checkpoint es un adaptador LoRA (PEFT) sobre Qwen/Qwen3.5-2B-Base, al que se añade una cabeza de lectura ligera que puntúa las opciones de una pregunta tipada. La salida no es texto generado, sino una distribución sobre las opciones (`choice`), una probabilidad (`noul`) o un valor escalar con confianza (`score`). El ajuste se realizó sobre un inventario amplio de datasets de clasificación, inferencia de lenguaje natural y preferencias humanas: arxiv-classification, clinc_oos, yahoo_answers_topics, emotion, ag_news, dbpedia_14, paws, boolq, civil_comments, banking77, amazon_massive_intent, GLUE, pavlick-formality-scores, language-identification, PubMedQA, Sarcasm_News_Headline, app_reviews, 20_newsgroups, sst5, subj, TREC-QC, vitaminc, ruletaker, measuring-hate-speech, sms_spam, yelp_review_full, HelpSteer2, Boardgame-QA y hotpot_qa.

La receta de v21 parte de v19 y añade dos elementos: paráfrasis de preguntas verificadas y destilación desde Qwen/Qwen3.5-4B restringida a los casos en que el profesor coincide con la etiqueta gold. El resultado se elige entre seis seeds mediante una regla de selección predefinida (descrita en la documentación del proyecto como "How this checkpoint was chosen"), lo que implica que v21 es un único checkpoint publicado y no un ensemble. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta de la mezcla ni si hubo etapas adicionales de RLHF o DPO más allá de la destilación.

## Capacidades

- Decisiones tipadas: preguntas de sí/no (`noul`), elección entre N opciones (`choice`) y puntuación en escalas ordenadas (`score`).
- Confianza calibrada por respuesta, con distribución completa sobre las opciones en los casos `choice` y `score`.
- Clasificación de texto en dominios muy diversos: temas de noticias, intención de usuario, emoción, formalidad, subjetividad, spam, sarcasmo y lenguaje de odio.
- Inferencia de lenguaje natural: entailment y verificación (BoolQ, PAWS, GLUE, VitaminC, RuleTaker, ContractNLI).
- Razonamiento multihop y soporte documental: evaluation sobre HotpotQA (held out) y MuSiQue, con variantes answerable y unanswerable.
- Evaluación de calidad de respuestas generadas: adecuación sobre HelpSteer2 y tareas de generación (gen:adequacy).
- Selección de herramientas y enrutado de modelos como decisión `choice` dentro de un agente.
- Capacidad multimodal opcional (imágenes) mediante `serve --vision` o `ask --image`, con el extra `strands-decider[vision]`.
- Capacidades multilingües: no declaradas explícitamente en la información disponible.
- Soporte de tool calling generativo y de razonamiento multi-paso en el sentido clásico: no aplica, ya que el modelo no genera texto ni llamadas a herramientas, solo puntúa opciones.

## Casos de uso

- Enrutado de modelos en pipelines multi-LLM: una pregunta `choice` con los modelos candidatos como opciones permite decidir qué LLM atiende cada petición, con una confianza que se puede usar como umbral para escalar al modelo mayor.
- Selección de herramientas en agentes: dado el estado de la conversación y el catálogo de herramientas, el modelo elige la herramienta adecuada sin gastar una llamada a un LLM generativo.
- Comprobación de argumentos y validación previa: antes de ejecutar una llamada a una herramienta, se verifica con preguntas `noul` que los argumentos cumplen las precondiciones, evitando ejecuciones erróneas.
- Triaje de tickets de soporte: el ejemplo del README con "Help! My payouts have been failing for 3 days!" asigna el ticket al equipo de billing con confianza 0,837 y estima la frustración del usuario en una escala `score`.
- Guardrails de entrada y salida: clasificación de comentarios (civil_comments, measuring-hate-speech) o spam (sms_spam) para bloquear contenido antes de que llegue al modelo generativo.
- Evaluaciones automáticas y jueces ligeros: puntuar adecuación de respuestas generadas con `score` sobre criterios tipo HelpSteer2, como cribado barato previo a una revisión humana.
- Detección de intención en asistentes conversacionales: clasificación con CLINC OOS, banking77 y MASSIVE para decidir la siguiente acción del diálogo.
- Verificación documental y QA extractivo: usar las decisiones sobre HotpotQA y MuSiQue (0,886 en answerable y 0,877 en unanswerable) para decidir si un fragmento responde a una pregunta antes de invocar un modelo mayor.
- Tareas de decisión sobre imágenes: con el extra de visión, clasificar capturas o documentos escaneados para enrutarlos o etiquetarlos dentro de un flujo automatizado.

## Benchmarks y rendimiento

Resultados declarados por el autor en el model-index de la model card. Ninguno está verificado de forma independiente (`verified: false`).

| Conjunto de evaluacion | Metrica | Valor | Muestra |
|---|---|---|---|
| JevBench public, served at 4096 (config w4096) | accuracy | 0,7619 | 176/231 |
| eval: held-out short tasks | accuracy | 0,650 | n=6000 |
| eval: boardgame | accuracy | 0,821 | n=900 |
| eval: contractnli | accuracy | 0,865 | n=1026 |
| eval: hotpotqa (held out) | accuracy | 0,746 | n=959 |
| eval: musique | accuracy | 0,882 | n=1199 |
| eval: musique, answerable | accuracy | 0,886 | n=599 |
| eval: musique, unanswerable | accuracy | 0,877 | n=600 |
| eval: [4] adequacy_hs2 | accuracy | 0,739 | n=234 |
| eval: [5] gen:adequacy | accuracy | 0,788 | n=302 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas contra los checkpoints v19 o v20.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación a partir de los ~2B parámetros del modelo base, no publicada por el autor): ~4-5 GB en bf16/fp16, ~2-3 GB en int8 y ~1,5-2 GB en 4 bits.
- El repositorio solo contiene el adaptador (0,1 GB); hay que descargar además los pesos base de Qwen/Qwen3.5-2B-Base, que dominan el consumo de memoria y de disco.
- GPU recomendadas: cualquier GPU con 6 GB o más de VRAM para bf16; RTX 3060 12 GB, RTX 4070, RTX 4090, A100 y H100 son suficientes con holgura para un modelo de este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas de gama media con 6-8 GB o más, y también en cuantizaciones de 4 bits en equipos con menos memoria.
- Dispositivos soportados por la CLI: `--device cuda`, `mps` y `cpu`; sin el flag se selecciona el mejor dispositivo disponible.
- Opciones de despliegue: CLI `strands-decider ask` y servidor HTTP con `strands-decider serve` (escucha en 127.0.0.1 y no tiene autenticación; está pensado para experimentos locales). Al usar PEFT sobre transformers, la integración con vLLM, TGI, Ollama o llama.cpp no está documentada ni confirmada.
- Latencia y throughput: no disponibles. El autor describe el modelo como "small, fast" y orientado a decisiones más rápidas que un LLM, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| strands-decider-2B-hobson-v21 | ~2B (LoRA sobre Qwen3.5-2B-Base) | no disponible | Decisiones tipadas y clasificacion con confianza calibrada | Apache-2.0 | HuggingFace (organizacion StrandsAgents y espejo de usuario) |
| Qwen/Qwen3.5-2B-Base | 2B | no disponible | Generacion de texto general | no disponible | HuggingFace |
| Qwen/Qwen3.5-4B | 4B | no disponible | Generacion de texto general; usado como profesor de destilacion de v21 | no disponible | HuggingFace |
| strands-decider-2B-hobson-v19 | ~2B | no disponible | Decisiones tipadas; receta predecesora de v21 | Apache-2.0 (segun el proyecto) | HuggingFace |

No hay datos publicados en la información disponible que comparen accuracy entre v19, v20 y v21, ni frente a clasificadores tipo encoders (BERT, DeBERTa) o a LLMs generativos usados como clasificadores.

## Limitaciones y advertencias

- Todos los resultados de benchmarks están marcados como no verificados (`verified: false`) y provienen del propio autor; no hay evaluaciones independientes.
- La accuracy en el conjunto "held-out short tasks" es 0,650, relativamente baja: conviene validar el comportamiento en el dominio concreto antes de usarlo en producción.
- Aunque se declara confianza calibrada, no se publican curvas de calibración (ECE, reliability diagrams) que lo respalden.
- No genera texto libre ni llamadas a herramientas: solo puntúa opciones predefinidas, lo que obliga a diseñar las preguntas y las alternativas de forma explícita.
- Los idiomas soportados no están declarados; parte del entrenamiento es multilingüe, pero la cobertura real por idioma es desconocida.
- Longitud de contexto no declarada, aunque las evaluaciones se sirven a 4096 tokens; no se garantiza comportamiento estable más allá de ese punto.
- La destilación desde Qwen3.5-4B puede heredar sesgos del modelo profesor, además de los sesgos propios de datasets sensibles como measuring-hate-speech, civil_comments o Yelp.
- El inventario de entrenamiento incluye datasets de moderación (hate speech, spam, civil comments): las etiquetas de estos conjuntos son ruidosas y culturalmente dependientes.
- La licencia Apache-2.0 permite uso comercial, pero el servidor HTTP incluido no tiene autenticación y está pensado solo para experimentos locales.
- El repositorio consultado no tiene descargas ni likes, y su ID de usuario (bhedanikhilkumar234567) no coincide con la organización del proyecto (StrandsAgents); conviene verificar la procedencia antes de desplegarlo.
- La fecha de creación registrada (2026-10-11) es inusual; conviene comprobar la procedencia y la versión exacta del checkpoint.
- El repositorio contiene únicamente el adaptador: es necesario descargar el modelo base, con la licencia y las condiciones que este imponga.

## Enlaces

- Modelo en HuggingFace (repositorio consultado): https://huggingface.co/bhedanikhilkumar234567/strands-decider-2B-hobson-v21
- Modelo en HuggingFace (organizacion del proyecto): https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v21
- Checkpoint predecesor v19: https://huggingface.co/StrandsAgents/strands-decider-2B-hobson-v19
- Repositorio de codigo, receta de entrenamiento, inventario de datos y evaluaciones: https://github.com/strands-labs/strands-decider
- Ejemplos de integracion con Strands: https://github.com/strands-labs/strands-decider/blob/main/examples/strands/README.md
- Documentacion de vision: docs/vision.md en el repositorio de codigo
- Anuncio del modelo: https://strandsagents.com/blog/introducing-strands-decider/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
