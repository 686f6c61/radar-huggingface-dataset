# danyloooah/sn92-generalist-m1-avg5

## Resumen

`danyloooah/sn92-generalist-m1-avg5` es un modelo de decisión (decision model) publicado en Hugging Face por el usuario danyloooah, resultado de una fusión en el espacio de pesos (weight-space merge) de cinco fine-tunes del modelo `baselabs/mammoth-1`. Este modelo base, a su vez, es un post-entrenamiento de Qwen3.5-27B con licencia Apache-2.0, adaptado a un formato de lectura conjunta (joint-readout) denominado REAX, con backbone `Qwen3_5Model`, atención completa no causal y un "readout" de código de respuesta que produce una letra de opción en la última posición.

El modelo resuelve una tarea muy específica: clasificación de decisiones sobre ítems de evaluación en formato REAX eval-v5.1, es decir, preguntas de opción múltiple y tareas de decisión (aritmética, lógica, código, conocimiento, abstención, etc.) donde el modelo debe emitir una letra correspondiente a la opción elegida. No es un modelo generativo de texto libre en el sentido habitual, sino un clasificador de decisión con 26.085.330.160 parámetros totales (aproximadamente 26 B) y un repositorio de 52,2 GB en safetensors.

Su relevancia es acotada pero concreta: demuestra una receta reproducible de fusión lineal de pesos (task arithmetic) sobre fine-tunes LoRA de un mismo backbone, con normalización del readout, y publica la composición exacta de datos permisivos empleados en el fine-tune propio. Es útil para investigadores que estudien merging de modelos, evaluación de decisiones y entrenamiento de clasificadores sobre backbones grandes, no tanto para aplicaciones de producto generales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer `Qwen3_5Model` (backbone de Qwen3.5-27B) con atención completa no causal y readout de letra en la última posición (layout REAX joint-readout) |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el fine-tune propio uso prompts de hasta 6.144 tokens) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; el autor no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (pytorch), con `readout.safetensors` separado |
| Pipeline declarado | text-classification |
| Tamano del repositorio | 52,2 GB |
| Modelo base | `baselabs/mammoth-1` (rev. `03007ab3c4481bf01c71ef63adbbbc4b2093d71a`), post-entrenado desde Qwen3.5-27B |
| Padres de la fusion | isomsom/sn92-gen-m87b (0.33), xflud/sn92-decider-1 (0.29), gurujustin/sn92-gen-m1b (0.28), edinlong83/sn92-generalist-h5 (0.22), danyloooah/sn92-generalist-m1-v3a (0.18) |

## Arquitectura y entrenamiento

El modelo es una fusión en el espacio de pesos de cinco fine-tunes del mismo backbone `mammoth-1`. La receta es aritmética de tareas lineal aplicada tensor a tensor: `base + lam * sum_i(w_i * (parent_i - base))` con `lam = 1.0`, calculada en float32 y redondeada una sola vez a bfloat16. Los pesos de cada padre son 0.33, 0.29, 0.28, 0.22 y 0.18 respectivamente. El readout (`readout.safetensors`) se obtiene como media de los readouts de los padres tras dividir cada uno por su escala relativa al readout de `mammoth-1`, ajustada sobre las filas de letras centradas por fila (un desplazamiento común de fila no altera el softmax de opciones). Los ficheros `config.json`, `joint_config.json`, tokenizer y `decision_config.json` (temperatura 1) siguen el paquete joint de `mammoth-1`.

El padre propio del autor, `danyloooah/sn92-generalist-m1-v3a`, se entrenó con LoRA de rango 16, alpha 32 y sin dropout sobre las proyecciones q/k/v/o de atención, las proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj` del Gated DeltaNet, y las proyecciones gate/up/down del MLP de las 64 capas del modelo de lenguaje, fusionadas después en los pesos bf16. El encoder de visión y el readout quedaron sin cambios. El entrenamiento se hizo a través del camino joint-readout de REAX (Qwen3_5Model, atención completa no causal, lectura de letra en la última posición), con entropía cruzada entre `softmax(letter logits / 2)` y la opción dorada con label smoothing de 0.1; para preguntas de conocimiento con opción "no lo sé", los objetivos conservan la respuesta solo cuando `mammoth-1` acertaba con probabilidad >= 0.5 y en caso contrario eligen "no lo sé". Se usó AdamW, learning rate 5e-5 con decaimiento coseno y 20 pasos de warm-up, batch efectivo de 32 filas, una época sobre 43.242 filas de pregunta de 58 tipos de tarea (unas 600-900 filas por tipo, 2.400 para abstención) y longitud máxima de prompt de 6.144 tokens.

Los datos del padre propio son exclusivamente fuentes permisivas: ítems generados proceduralmente (problemas aritméticos, causales sí/no, lógica, salida de código, ajedrez, acordes, políticas y tarifas, APIs/tool-calls), textos de Project Gutenberg, listas de POS de Moby, apellidos del censo de EE. UU. de 1990, CMU Pronouncing Dictionary, GeoNames, ContractNLI, HANS, MASSIVE 1.1, CLINC150+OOS, BANKING77, args.me, metadatos de arXiv, Wikidata, Aegis 2.0, PEPs de Python, índice de RFC de IETF, trabajos del gobierno de EE. UU. (NHTSA, openFDA, Federal Register, NOAA NCEI), WinoGrande, CommonsenseQA, StrategyQA, QASC, OpenBookQA y Amazon ESCI. No se distribuyen ficheros de dataset en el repositorio.

## Capacidades

- Clasificación de decisiones en formato REAX eval-v5.1: emite una letra de opción en la última posición para preguntas de opción múltiple y tareas de decisión.
- Razonamiento sobre ítems de aritmética, lógica, causales sí/no, salida de código, ajedrez y acordes, según los tipos de tarea del entrenamiento.
- Preguntas de conocimiento con opción explícita de abstención ("no lo sé"), calibrada contra el comportamiento de `mammoth-1`.
- Tareas de política y tarifas, APIs y tool-calls en formato de ítem de decisión (no como generación libre de llamadas a herramientas).
- Tareas de inferencia de lenguaje natural (NLI) y diagnóstico de sesgo tipo HANS, además de razonamiento de sentido común (WinoGrande, CommonsenseQA, StrategyQA, QASC, OpenBookQA).
- Clasificación de intenciones y dominios de asistentes conversacionales (MASSIVE, CLINC150+OOS, BANKING77).
- Argumentación (args.me) y verificación de contratos (ContractNLI) a nivel de ítem.
- No se documentan capacidades de visión funcionales en el uso publicado, pese a que el backbone contiene un encoder de visión sin modificar.
- No se documenta tool calling generativo, agentes multi-paso ni modo thinking; el pipeline declarado es text-classification.

## Casos de uso

- Evaluación de modelos de decisión: usar el modelo como referencia fusionada para comparar el efecto de distintas recetas de merging (pesos, `lam`, normalización de readout) sobre el mismo backbone Qwen3.5-27B.
- Investigación en aritmética de tareas: reproducir la receta `base + lam * sum(w_i * (parent_i - base))` con los cinco padres publicados y medir la degradación o mejora respecto a cada padre individual en los 58 tipos de tarea del conjunto REAX eval-v5.1.
- Clasificación de intenciones en asistentes: emplear el modelo para etiquetar utterances de dominios MASSIVE/CLINC150/BANKING77 en un pipeline de enrutamiento, aprovechando que fue entrenado sobre esos corpus en formato de decisión.
- Abstención calibrada en preguntas de conocimiento: desplegar el modelo en escenarios donde sea preferible responder "no lo sé" a alucinar, ya que el entrenamiento incluye objetivos de abstención derivados de la confianza de `mammoth-1`.
- Análisis de NLI y sesgos: utilizar el modelo como clasificador de pares de inferencia (HANS, ContractNLI) para auditar heurísticas léxicas en conjuntos de evaluación controlados.
- Razonamiento estructurado sobre ítems cerrados: aplicar el modelo a preguntas de lógica, aritmética o salida de código donde la respuesta es una letra entre varias opciones, integrándolo en un banco de evaluación interno.
- Estudio de linaje y atribución de pesos: analizar cómo se combinan los cambios aprendidos de cinco autores distintos y qué tensores dominan el comportamiento final, dado que la model card documenta pesos y revisiones exactas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni métricas del conjunto REAX eval-v5.1 para este merge ni para sus padres.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 52 GB solo para pesos (26,1 B de parámetros x 2 bytes), más overhead de activaciones y del readout; en la práctica se requiere al menos una GPU de 80 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GPUs con >= 80 GB de memoria. Para el backbone Qwen3.5-27B en bf16 se necesita al menos una A100/H100 de 80 GB o dos GPUs de 48 GB con tensor parallelism.
- No cabe en GPUs de consumo (RTX 4090 24 GB, RTX 3090 24 GB) en bf16 sin cuantización; no se publican pesos cuantizados oficiales, por lo que habría que cuantizar el usuario.
- Opciones de despliegue: el paquete es `pytorch` + safetensors con un camino joint-readout propio (Qwen3_5Model, atención no causal), por lo que no es directamente compatible con vLLM, llama.cpp, Ollama o TGI sin adaptación del readout y de la atención no causal. La vía realista es cargar los pesos con `transformers`/PyTorch y usar el `decision_config.json` y `joint_config.json` del paquete.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| danyloooah/sn92-generalist-m1-avg5 | 26,1 B | no disponible | Clasificacion de decisiones REAX | MIT | Hugging Face, 45 descargas |
| baselabs/mammoth-1 | no disponible (deriva de Qwen3.5-27B) | no disponible | Decision model REAX | MIT | Hugging Face |
| Qwen3.5-27B | ~27 B | no disponible | LLM generativo | Apache-2.0 | Hugging Face |
| Padres del merge (sn92-gen-m87b, sn92-decider-1, sn92-gen-m1b, sn92-generalist-h5, sn92-generalist-m1-v3a) | ~26 B cada uno | no disponible | Decision models REAX | MIT | Hugging Face |

La comparación cuantitativa de rendimiento entre este merge y sus padres no está disponible en la información proporcionada. La diferencia principal frente a Qwen3.5-27B es el formato de salida: el merge emite una letra de opción mediante un readout entrenado, mientras que Qwen3.5-27B genera texto libre.

## Limitaciones y advertencias

- Modelo especializado en clasificación de decisiones: no es un LLM generativo de propósito general y no debe usarse para generación de texto libre, chat o agentes.
- Sesgos: los datos de entrenamiento incluyen corpus con posibles sesgos (Aegis 2.0 con etiquetas parcialmente generadas por un jurado de LLMs, listas de apellidos del censo de EE. UU., GeoNames, textos de Gutenberg); no se documenta una auditoría de sesgos del merge.
- Riesgo de alucinación: mitigado parcialmente por la opción de abstención calibrada contra `mammoth-1`, pero el merge puede desviarse de ese comportamiento al combinar cinco padres con pesos distintos; no hay evaluación publicada de la tasa de abstención del merge.
- Limitaciones de contexto: el fine-tune propio usó prompts de hasta 6.144 tokens; no se documenta la longitud de contexto efectiva del backbone ni del merge.
- Idiomas: no disponibles; los corpus de entrenamiento son mayoritariamente en inglés (MASSIVE está localizado, pero el resto es inglés), por lo que el rendimiento multilingüe es incierto.
- Licencia MIT para los pesos del merge, pero los pesos derivan de `mammoth-1` (MIT) y de Qwen3.5-27B (Apache-2.0); conviene revisar las obligaciones de atribución de la cadena completa antes de uso comercial.
- El autor declara no estar afiliado a Base Labs/Baseten, al equipo de Qwen, a REAX ni a los autores de los padres; la autoría de los cambios aprendidos corresponde a cada padre.
- No se distribuyen ficheros de dataset, lo que dificulta la reproducibilidad exacta del fine-tune propio.
- El pipeline declarado (`text-classification`) y la atención no causal implican que las herramientas estándar de inferencia generativa no funcionarán sin adaptación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/danyloooah/sn92-generalist-m1-avg5
- Modelo base: https://huggingface.co/baselabs/mammoth-1
- Padre 1: https://huggingface.co/isomsom/sn92-gen-m87b
- Padre 2: https://huggingface.co/xflud/sn92-decider-1
- Padre 3: https://huggingface.co/gurujustin/sn92-gen-m1b
- Padre 4: https://huggingface.co/edinlong83/sn92-generalist-h5
- Padre 5 (propio): https://huggingface.co/danyloooah/sn92-generalist-m1-v3a
- Qwen3.5-27B (origen del backbone): no disponible en la informacion proporcionada
- Paper o blog de REAX: no disponible en la informacion proporcionada
- Repositorio de codigo: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
