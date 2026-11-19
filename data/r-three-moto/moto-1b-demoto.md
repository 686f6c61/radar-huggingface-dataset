# r-three-moto/moto-1b-demoto

## Resumen

MoTo 1B Demoto es un modelo de lenguaje de tipo decoder-only con arquitectura estilo Llama, desarrollado por el grupo de investigacion r-three-moto (autoria de Gul Sena Altintas y Colin Raffel, vinculado a la conferencia NeurIPS 2026). Se trata de un modelo base de 1.774 millones de parametros totales (1.28B no-embedding) entrenado desde cero sobre 21 idiomas. Su particularidad no reside en el rendimiento bruto, sino en que sirve como *baseline* controlado para estudiar el efecto de la tokenizacion en modelos multilingues: utiliza un unico tokenizador BPE monolitico resultante de fusionar los 21 tokenizadores por idioma del proyecto MoTo, sin enrutamiento por idioma.

El modelo resuelve un problema de investigacion concreto: aislar el impacto del diseno del tokenizador comparandolo con el modelo MoTo equivalente (`r3-moto/moto-1b`), que comparte exactamente el mismo transformer y los mismos datos de entrenamiento y solo difiere en el tokenizador y la tabla de embeddings. Esto permite a investigadores medir de forma limpia como afecta la tokenizacion por idioma frente a una tokenizacion monolitica en tareas multilingues.

Es relevante ahora porque forma parte de la release MoTo (NeurIPS 2026), que propone sustituir el tokenizador unico de los modelos multilingues por uno por idioma fusionados en un superconjunto de vocabulario. El modelo tiene una ventana de contexto de 4096 tokens, se distribuye en bfloat16 con pesos safetensors y licencia MIT, y esta pensado exclusivamente para investigacion y evaluacion comparativa, no para uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only estilo Llama, 25 capas, d_model 2048, 16 cabezas, embeddings de entrada/salida no atados |
| Parametros totales | 1.774.020.608 (1.77B); 1.28B no-embedding |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, ar, cs, zh, da, de, el, fa, fr, hu, id, it, ja, nl, pl, pt, ru, es, sv, tr, vi (21 idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo Llama con 25 capas, dimension de modelo 2048 y 16 cabezas de atencion, con embeddings de entrada y salida no atados (*untied*). La tabla de embeddings contiene 119.485 filas, correspondientes al vocabulario resultante de fusionar los 21 tokenizadores BPE de 8K del proyecto MoTo en un unico tokenizador monolitico (`flexitok/bpe_ltr_monolithic_moto`). El resto de la arquitectura es identica a la del modelo MoTo con enrutamiento, lo que permite comparaciones controladas.

El entrenamiento se realizo desde cero durante 100.000 pasos con el framework `lingua`, sobre una mezcla de datos compuesta por FineWeb-Edu (ingles, 40% de la mezcla) y FineWeb2-HQ (los 20 idiomas restantes); los pesos exactos de la mezcla estan en `training/config.yaml`. El numero total de tokens de entrenamiento no esta disponible en la informacion proporcionada (la model card lo deja como "TBD"). No se aplico instruction tuning ni alineamiento de seguridad, ni RLHF/DPO: es un modelo base puro. Una peculiaridad tecnica relevante es que el tokenizador carece de tokens BOS, EOS y PAD, y los documentos se codificaron como texto plano con los tokens especiales desactivados; la decodificacion es sin perdida (`clean_up_tokenization_spaces` a false).

## Capacidades

- Generacion de texto autoregresiva en 21 idiomas, incluyendo espanol, ingles, arabe, chino, japones, coreano no listado, ruso, hindi no listado, y lenguas europeas como aleman, frances, italiano, portugues, neerlandes, polaco, sueco, danes, checo, griego, hungaro, turco, persa e indonesio.
- Modelado de lenguaje base: continuacion de texto, puntuacion de secuencias y evaluacion de perplejidad multilingue.
- Soporte de tool calling / function calling: no disponible (modelo base sin instruction tuning).
- Soporte de agentes y razonamiento multi-paso: no disponible (no entrenado para ello).
- Capacidades multilingues: nucleo del diseno; el vocabulario fusionado cubre los 21 idiomas del entrenamiento.
- Capacidades especiales (thinking mode, vision, audio): no disponible.
- Contexto limitado a 4096 tokens, sin mecanismos de atencion lineal ni decodificacion especulativa documentados.

## Casos de uso

- Investigacion sobre tokenizacion multilingue: servir como baseline monolitico para comparar, con el mismo transformer y datos, el efecto de un tokenizador por idioma (MoTo) frente a uno fusionado. Es el uso principal y para el que fue disenado.
- Evaluacion de perplejidad por idioma: calcular perplejidad en los 21 idiomas del conjunto para estudiar como afecta la fusion de vocabularios a la eficiencia de codificacion (tokens por palabra) en lenguas con alfabetos no latinos.
- Experimentos de *fairness* linguistica: medir disparidades de rendimiento entre idiomas de altos y bajos recursos bajo un mismo vocabulario, aislando el sesgo introducido por la tokenizacion.
- Generacion de texto de continuacion en espanol y otros idiomas: usar el modelo para completar prompts y estudiar la calidad de la generacion base, sin esperar instrucciones ni formato conversacional.
- Reproduccion de resultados academicos: replicar los experimentos del paper MoTo (NeurIPS 2026) con los pesos y la configuracion publicados, incluyendo las metricas de entrenamiento en `training/metrics.jsonl`.
- Analisis de eficiencia de vocabulario: estudiar el impacto del tamano del vocabulario (119.485 filas de embedding) en el coste computacional y en la calidad, comparandolo con el modelo MoTo enrutado.
- Fine-tuning supervisado como punto de partida: al ser un modelo base de 1.77B con licencia MIT, puede servir de inicializacion para tareas posteriores de ajuste en investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni metricas comparativas; solo referencia las metricas de entrenamiento por paso en `training/metrics.jsonl` (loss, learning rate, throughput).

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos (1.77B parametros x 2 bytes), mas overhead de activaciones y cache KV; en la practica, entre 4 y 6 GB para contexto corto.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB (aunque no se documentan variantes cuantizadas oficiales).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 12 GB, RTX 4070, RTX 4090); A100 o H100 para entrenamiento o inferencia por lotes a gran escala.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bfloat16; con cuantizacion, en GPUs de 4-6 GB.
- Opciones de despliegue: transformers (soporte nativo, `AutoModelForCausalLM`), text-generation-inference (tag `text-generation-inference`), endpoints compatibles; llama.cpp/Ollama no estan documentados oficialmente para este modelo.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizador | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MoTo 1B Demoto (este) | 1.77B (1.28B no-embedding) | 4096 | Monolitico fusionado (21 BPE de 8K) | MIT | Hugging Face |
| MoTo 1B (`r3-moto/moto-1b`) | 1.77B (mismo transformer) | 4096 | 21 tokenizadores por idioma con enrutamiento | MIT (segun release MoTo) | Hugging Face |
| Alternativas de ~1B de proposito general | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion natural es con el modelo MoTo enrutado, que comparte arquitectura y datos y solo difiere en tokenizacion; es la comparacion que el propio autor propone. No se dispone de datos de benchmarks para comparar el rendimiento con otros modelos de ~1B.

## Limitaciones y advertencias

- Es un modelo base sin instruction tuning ni alineamiento de seguridad; no debe usarse como asistente conversacional ni en produccion sin ajuste previo.
- Riesgo de alucinacion y de generar contenido sesgado o inapropiado, ya que no ha pasado por RLHF/DPO ni filtros de seguridad.
- El tokenizador carece de tokens BOS, EOS y PAD: el primer token de cada texto no tiene contexto y el scoring empieza en el segundo token; para inferencia por lotes hay que asignar `tok.pad_token = tok.eos_token` y hacer padding a la izquierda.
- Ventana de contexto limitada a 4096 tokens; no apta para documentos largos sin tecnicas externas de troceado.
- Cobertura linguistica restringida a los 21 idiomas del entrenamiento; el rendimiento en idiomas no vistos no esta documentado.
- El numero total de tokens de entrenamiento no esta disponible, lo que limita la reproducibilidad exacta del coste computacional.
- Licencia MIT: permite uso comercial, pero el modelo es un artefacto de investigacion sin garantias de calidad ni de seguridad para entornos productivos.
- La configuracion de entrenamiento publicada esta reconstruida a partir de los ficheros de configuracion de lingua, no del volcado original de la ejecucion, por lo que puede haber discrepancias menores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/r-three-moto/moto-1b-demoto
- Modelo MoTo con enrutamiento: https://huggingface.co/r3-moto/moto-1b
- Paper (OpenReview, NeurIPS 2026): https://openreview.net/forum?id=avjeUhPuC6
- Preprint arXiv: https://arxiv.org/abs/2611.11027
- Codigo: https://github.com/r-three/moto
- Framework de entrenamiento lingua: https://github.com/r-three/lingua/tree/lingua
- Todos los modelos de la release MoTo: https://huggingface.co/r3-moto
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ
- Licencia MIT: https://opensource.org/license/mit
