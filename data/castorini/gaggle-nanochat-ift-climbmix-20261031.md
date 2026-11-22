# castorini/gaggle-nanochat-ift-climbmix-20261031

## Resumen

gaggle-nanochat-ift-climbmix-20261031 es un modelo de lenguaje de tipo chat desarrollado por el grupo castorini (University of Waterloo). Se construye a partir del checkpoint preentrenado castorini/gaggle-nanochat-pretrained-climbmix-20260924 (paso 227.158) aplicando la receta de chat estandar de nanochat en dos etapas: midtraining y ajuste fino supervisado (SFT), sin refuerzo por RL. El modelo base Gaggle es una reproduccion del nanochat depth-34 de Karpathy entrenada sobre el dataset ClimbMix.

Arquitectonicamente es un transformer decoder-only de 34 capas con anchura 2.176, 17 cabezas de atencion de dimension 128 y una ventana de contexto de 2.048 tokens. Cuenta con 3.286.633.962 parametros totales, de los cuales 1.210 millones corresponden a consultas de embedding de valor (value-embedding lookups). El tokenizador es un BPE a nivel de byte con 32.768 entradas, heredado sin cambios del modelo base.

Su relevancia radica en que demuestra el ciclo completo de nanochat (preentrenamiento, midtraining y SFT) sobre datos de ClimbMix, con una mejora sustancial en tareas de conocimiento (MMLU 49,27 frente a 25,71 del nanochat d34 preentrenado) y un formato de chat propio compatible con transformers, vLLM y el codigo original de nanochat. Es un modelo pequeno, de licencia MIT, orientado a investigacion y a despliegues con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (nanochat depth-34) |
| Parametros totales | 3.286.633.962 (3,29B); 1,21B de ellos en value-embedding lookups |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (transformers), compatible con vLLM y con el codigo de nanochat |
| Capas | 34 |
| Anchura del modelo | 2.176 |
| Cabezas de atencion | 17, dimension 128 |
| Tokenizador | BPE a nivel de byte, 32.768 entradas |
| Formato de chat | `<\|bos\|>`, `<\|user_start\|>`...`<\|user_end\|>`, `<\|assistant_start\|>`...`<\|assistant_end\|>`; el mensaje de sistema se fusiona en el primer mensaje de usuario |
| Modelo base | castorini/gaggle-nanochat-pretrained-climbmix-20260924 |
| Tamano del repositorio | 31,7 GB |
| Descargas | 629 |
| Likes | 0 |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura nanochat depth-34, un transformer decoder-only con 34 capas, anchura de 2.176, 17 cabezas de atencion de dimension 128 y contexto de 2.048 tokens. El tokenizador y el codigo son los del modelo base, sin modificaciones; solo cambian los pesos. El mismo checkpoint se puede cargar de tres formas: con `transformers` usando `trust_remote_code=True`, con vLLM a traves del plugin del modelo base, o con el codigo propio de nanochat a partir de los ficheros del checkpoint original.

El entrenamiento sigue la receta de chat en dos etapas de nanochat (commit `348fbb3`), portada sobre el codigo `92d63d4` con el que se entreno el modelo base. La etapa de midtraining se ejecuto durante una epoca (816 pasos de 524.288 tokens, secuencias de 2.048 tokens con empaquetado best-fit alineado a BOS y perdida sobre todos los tokens) sobre 849.656 filas: smol-smoltalk train (460.341), MMLU auxiliary_train (99.842), GSM8K main train (7.473), conversaciones de identidad de nanochat (2.000, dos epocas), SimpleSpelling (200.000) y SpellingBee (80.000). La etapa de SFT se ejecuto durante una epoca (701 pasos de 32 conversaciones, perdida solo en tokens del asistente) sobre 22.443 filas: ARC-Easy train (2.251), ARC-Challenge train (1.119), GSM8K main train (7.473), smol-smoltalk (10.000 tras el shuffle con semilla 42), conversaciones de identidad (1.000), SimpleSpelling (300) y SpellingBee (300). Ninguna etapa reinyecta texto de preentrenamiento (ClimbMix).

Los hiperparametros mantienen los del recetario original: learning rates de 0,2 (embeddings), 0,004 (unembedding) y 0,02 (Muon, matrices de bloque), sin weight decay, constantes durante el primer 80 % del entrenamiento y con decaimiento lineal a cero despues; el momento de Muon va de 0,85 a 0,95 en los primeros 300 pasos. En SFT se escalan los learning rates por 0,02 con decaimiento lineal a cero. Ambas etapas arrancan con optimizador nuevo. El computo total fue de 3 h 10 min para midtraining y 25 min para SFT en una NVIDIA H100 de 80 GB, con acumulacion de gradiente sobre micro-lotes de 4 secuencias.

## Capacidades

- Generacion de texto conversacional en formato chat de nanochat, con turnos de usuario y asistente delimitados por tokens especiales.
- Razonamiento y conocimiento general: entrenado con MMLU y MMLU-Pro para responder preguntas de opcion multiple por letra.
- Razonamiento matematico basico: entrenado con GSM8K (7.473 ejemplos en cada etapa) y evaluado por generacion greedy.
- Generacion de codigo: evaluado en HumanEval por generacion greedy de hasta 512 tokens.
- Tareas de eleccion multiple cientificas: ARC-Easy y ARC-Challenge.
- Correccion ortografica y deletreo: SimpleSpelling y SpellingBee incluidos en ambas etapas de entrenamiento.
- Conversaciones de identidad: 1.000-2.000 ejemplos de identidad de nanochat inyectados en el entrenamiento.
- Capacidad multilingue: limitada al ingles (unico idioma declarado).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo thinking.

## Casos de uso

- Asistente conversacional ligero en ingles: el modelo gestiona dialogos multi-turno en el formato de chat de nanochat con contexto de 2.048 tokens, adecuado para chatbots de dominio acotado o prototipos.
- Evaluacion de recetas de entrenamiento: sirve como referencia reproducible para comparar midtraining + SFT frente a preentrenamiento puro, dado que el autor publica tanto el checkpoint de midtraining como el modelo final.
- Generacion de respuestas a preguntas de opcion multiple: su entrenamiento con MMLU, MMLU-Pro y ARC permite usarlo como clasificador generativo de letras de respuesta en pipelines de evaluacion academica.
- Resolucion de problemas matematicos elementales: los 7.473 ejemplos de GSM8K en midtraining y SFT le permiten abordar problemas aritmeticos de varios pasos por generacion greedy.
- Generacion de codigo en tareas acotadas: con HumanEval como referencia, puede emplearse para completar funciones simples en entornos de investigacion, no en produccion critica.
- Correccion ortografica y tareas de deletreo: los datasets SimpleSpelling y SpellingBee lo hacen util para normalizacion de texto o verificacion de escritura en ingles.
- Despliegue en hardware modesto: con 3,29B parametros y licencia MIT, es viable para experimentacion en una sola GPU consumer o en entornos de investigacion con presupuesto limitado.
- Servicio de inferencia con vLLM: el plugin del modelo base permite servirlo con vLLM para cargas concurrentes en ingles.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan cuatro configuraciones. Los modelos preentrenados se evaluan en formato few-shot sobre texto plano; los modelos con IFT, en formato chat zero-shot. Las filas de IFT se midieron con el mismo codigo para ambos modelos.

| Modelo | Etapa | Formato | MMLU | MMLU-Pro | ARC-Easy | ARC-Challenge | GSM8K | HumanEval | CORE | ChatCORE |
|---|---|---|---|---:|---:|---:|---:|---:|---:|---:|
| nanochat d34 | PT | few-shot, texto plano | 25,71 | 11,49 | 73,8 | 47,0 | — | — | 0,338 | — |
| nanochat d34 | PT + IFT | zero-shot, chat | 43,06 | 17,21 | 72,14 | 54,27 | 13,65 | 11,59 | — | 0,302 |
| Gaggle | PT | few-shot, texto plano | 49,27 | 17,76 | 83,4 | 59,0 | — | — | 0,458 | — |
| Gaggle | PT + IFT (este modelo) | zero-shot, chat | 44 (dato truncado en la model card) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

Nota: la model card proporcionada corta la fila del modelo final en MMLU = 44, sin completar el resto de columnas. No se dispone de los valores de MMLU-Pro, ARC-Easy, ARC-Challenge, GSM8K, HumanEval ni ChatCORE para este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia orientativa, un modelo de 3,29B parametros requiere aproximadamente 6,6 GB en precision FP16 solo para pesos, mas memoria para el contexto y el estado de atencion; estas cifras no las publica el autor.
- GPU recomendadas: no disponible. El entrenamiento se realizo en una NVIDIA H100 de 80 GB, pero no se documentan requisitos de inferencia.
- Cabida en GPU consumer: no confirmado por el autor. Por tamano, es plausible en GPUs con 8-12 GB de VRAM en cuantizaciones de 8 o 4 bits, pero no hay datos oficiales.
- Opciones de despliegue: `transformers` con `trust_remote_code=True`, vLLM mediante el plugin del modelo base, y el codigo propio de nanochat (commit `92d63d4`).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU (chat) | Licencia | Disponibilidad |
|---|---|---:|---:|---|---|
| gaggle-nanochat-ift-climbmix-20261031 (este modelo) | 3,29B | 2.048 | 44 (dato truncado) | MIT | Hugging Face |
| pankajmathur/nanochat-d34-finetuned | no disponible | no disponible | 43,06 | no disponible | Hugging Face |
| karpathy/nanochat-d34 | no disponible | no disponible | 25,71 (PT, few-shot) | no disponible | Hugging Face |
| castorini/gaggle-nanochat-pretrained-climbmix-20260924 | 3,29B (misma arquitectura) | 2.048 | 49,27 (PT, few-shot) | MIT | Hugging Face |

La comparativa directa con modelos de la misma categoria (transformers pequenos de ~3B) no esta disponible en la informacion proporcionada. Los unicos modelos comparables documentados son las variantes de nanochat d34 y el checkpoint preentrenado Gaggle, que comparten arquitectura y receta.

## Limitaciones y advertencias

- Idioma: solo se declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta documentado y probablemente sea deficiente.
- Contexto corto: 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinacion: es un modelo pequeno (3,29B) entrenado sin RL; los resultados en HumanEval (11,59 en nanochat d34 IFT) y GSM8K (13,65 en nanochat d34 IFT) son bajos, lo que indica poca fiabilidad en tareas de razonamiento complejo.
- Sesgos: no se documentan analisis de sesgo ni evaluaciones de seguridad en la model card.
- Datos de evaluacion incompletos: la model card trunca la fila de resultados del modelo final, por lo que no se pueden verificar sus metricas completas.
- Sin soporte documentado de tool calling, agentes, vision ni audio.
- Licencia MIT: permite uso comercial sin restricciones, pero el modelo se distribuye sin garantias y el autor no documenta condiciones adicionales.
- El modelo base se entreno con ClimbMix; las etapas de chat no reinyectan texto de preentrenamiento, lo que puede provocar olvido catastrofico en conocimiento general.
- Formato de chat especifico de nanochat: requiere usar los tokens especiales correctos; un uso incorrecto del formato degrada la calidad de las respuestas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/castorini/gaggle-nanochat-ift-climbmix-20261031
- Modelo base (preentrenado): https://huggingface.co/castorini/gaggle-nanochat-pretrained-climbmix-20260924
- nanochat d34 de Karpathy: https://huggingface.co/karpathy/nanochat-d34
- nanochat d34 finetuned (pankajmathur): https://huggingface.co/pankajmathur/nanochat-d34-finetuned
- Repositorio nanochat: https://github.com/karpathy/nanochat
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- Dataset ClimbMix-400b-shuffle: https://huggingface.co/datasets/karpathy/climbmix-400b-shuffle
- Tarea MMLU-Pro del autor: `code/tasks/mmlu_pro.py` (incluida en el repositorio del modelo)
