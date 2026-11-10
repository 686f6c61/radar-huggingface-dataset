# oluwagbotty/parakeet-ctc-en-ft-10ep

## Resumen

parakeet-ctc-en-ft-10ep es un modelo de reconocimiento automatico del habla (ASR) en ingles obtenido por fine-tuning del modelo NVIDIA parakeet-ctc-0.6b sobre el split de entrenamiento del dataset CDLI Rwandan English non-standard speech v1.0, cuyos hablantes son en su mayoria jovenes adultos con tartamudez. Lo publica el usuario oluwagbotty en Hugging Face como parte de un proyecto de investigacion del Rwanda Innovation Sprint impulsado por CDLI (Centre for Digital Language Inclusion, UCL), orientado a ASR de bajo coste para personas que tartamudean.

El modelo emplea una arquitectura CTC (Connectionist Temporal Classification) sobre el backbone de 0,6 mil millones de parametros de NVIDIA Parakeet, lo que implica decodificacion no autorregresiva y, por tanto, ausencia del modo de fallo de bucles repetitivos tipico de los modelos seq2seq como Whisper. El objetivo concreto es mejorar la transcripcion de habla no estandar (repeticiones, bloqueos y prolongaciones) en ingles ruandes, un dominio poco cubierto por los sistemas ASR comerciales.

Es relevante ahora porque demuestra un flujo de trabajo reproducible de adaptacion de un modelo ASR open source a una poblacion concreta con recursos limitados, y porque publica resultados desglosados (WER y CER agrupados y por enunciado) junto con advertencias explicitas sobre el alcance etico de su uso. El repositorio ocupa 2,4 GB y los pesos se distribuyen en formato `.nemo`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC sobre backbone Parakeet (transformer), decodificacion no autorregresiva |
| Parametros totales | 0,6 mil millones (heredados de nvidia/parakeet-ctc-0.6b) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | .nemo (checkpoint NeMo, `best.nemo`) |

## Arquitectura y entrenamiento

El modelo parte de nvidia/parakeet-ctc-0.6b, un sistema ASR con cabeza CTC que predice directamente la secuencia de tokens sin decodificador autorregresivo. El fine-tuning se realizo exclusivamente sobre el split de entrenamiento del dataset cdli/rwandan_english_nonstandard_speech_v1.0, con el split de desarrollo empleado para seleccion de checkpoint y el split de test evaluado una sola vez tras el entrenamiento. El split `extra` no se utilizo y ningun hablante aparece en mas de un split.

La configuracion de entrenamiento fue de hasta 10 epocas con early stopping sobre WER de desarrollo (paciencia de 3 evaluaciones), semilla 42, learning rate 1e-4 y precision bf16-mixed. El codigo de entrenamiento se encuentra en `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto, con el identificador de experimento `parakeet-ctc-en-ft-10ep`. Las grabaciones del dataset se realizaron en Ruanda en 2026, en interiores con bajo ruido, mediante una aplicacion de tableta, a partir de estimulos de imagen (descripciones libres) y de texto (frases leidas).

## Capacidades

- Reconocimiento automatico del habla en ingles mediante decodificacion CTC voraz (greedy).
- Transcripcion de habla no estandar, en particular habla con tartamudez (repeticiones reflejadas literalmente en las transcripciones de entrenamiento).
- Procesamiento de audio grabado en condiciones controladas de bajo ruido (interiores, tableta).
- Manejo de dos estilos de elicitacion: frases leidas y descripciones libres a partir de imagenes.
- Ausencia estructural de bucles de repeticion en la salida, por ser un modelo CTC (los modelos seq2seq como Whisper pueden entrar en ese modo de fallo).
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio generativo ni modo de pensamiento.

## Casos de uso

- Investigacion en ASR inclusivo: servir como linea base reproducible para estudiar el rendimiento de modelos CTC adaptados a habla con tartamudez, comparando WER agrupado y por enunciado frente a modelos genericos.
- Prototipado de herramientas de transcripcion para personas que tartamudean: el modelo puede transcribir descripciones libres de imagenes y frases leidas en entornos silenciosos, con la salvedad de mostrar siempre el texto al hablante antes de actuar sobre el.
- Evaluacion comparativa de arquitecturas CTC frente a seq2seq: al no poder entrar en bucles, resulta util para aislar el efecto de ese modo de fallo en las metricas de WER.
- Experimentos academicos sobre datos CDLI: uso dentro del marco de terminos del dataset para estudiar habla no estandar en ingles ruandes.
- Validacion de pipelines de fine-tuning con NeMo: el codigo y la configuracion publicados permiten replicar el proceso sobre otros splits o condiciones de grabacion.
- Analisis de sensibilidad a condiciones de grabacion: comparar el rendimiento en frases leidas (mas faciles, presentes en los transcripts de entrenamiento) frente a descripciones de imagenes (mejor guia para habla abierta).

## Benchmarks y rendimiento

Resultados publicados en la model card, con decodificacion greedy, una grabacion a la vez y normalizacion de texto basica de Whisper. El WER agrupado cuenta todas las palabras juntas; el WER y el CER por enunciado son medias sobre grabaciones, cada una limitada al 100 %.

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 26,2 | 16,9 | 28,5 | 18,4 | 0 |
| dev (6 hablantes) | 32,7 | 22,6 | 31,5 | 21,4 | 0 |

El autor advierte que, con solo 9 hablantes de test, no pueden confirmarse diferencias inferiores a unos 3 puntos de WER entre dos modelos. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, por no ser aplicables a un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 0,6 mil millones de parametros, la inferencia en bf16 requiere del orden de 1,2 GB solo para pesos, mas memoria para el frontend de audio y activaciones.
- GPU recomendadas: no especificadas por el autor; por tamano, el modelo es apto para GPU consumer modernas y para GPU de datacenter (A100, H100) sin problema de capacidad.
- Cabe en GPU consumer: previsiblemente si, dado el tamano de 0,6 B, aunque no se documentan pruebas concretas.
- Opciones de despliegue: NeMo (libreria declarada, `nemo`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oluwagbotty/parakeet-ctc-en-ft-10ep | 0,6 B | no disponible | CTC (Parakeet), fine-tune en habla con tartamudez | cc-by-4.0 | Hugging Face (44 descargas) |
| nvidia/parakeet-ctc-0.6b | 0,6 B | no disponible | CTC (Parakeet), modelo base | no disponible en la informacion proporcionada | Hugging Face |
| Whisper (familia OpenAI) | no disponible | no disponible | seq2seq, decodificacion autorregresiva | no disponible en la informacion proporcionada | Referenciado en la model card como normalizador de texto y por su modo de fallo de bucles |

La comparacion cuantitativa de rendimiento frente a estos modelos no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes de test, mayoritariamente hombres jovenes adultos, grabaciones en interiores silenciosos, habla leida y descrita por imagenes, no conversacional. Se desconoce el rendimiento en ninos, otras discapacidades, entornos ruidosos, audio telefonico o habla con cambio de codigo.
- Objetivos literales: las repeticiones por tartamudez aparecen escritas en las transcripciones, y los modelos entrenados con ellas pueden reproducirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Sesgo hacia frases leidas: las frases de los estimulos de texto tambien aparecen en las transcripciones de entrenamiento, por lo que los resultados con descripciones de imagenes son la mejor guia para habla abierta.
- No apto para decisiones sobre personas: no debe usarse para diagnosticar o evaluar ninguna condicion del habla, identificar hablantes ni en decisiones clinicas, legales o de aplicacion de la ley. Los terminos de CDLI prohiben reidentificar hablantes y construir voces que imiten a una persona.
- Riesgo de que una transcripcion erronea cambie el significado de lo dicho: debe mostrarse el texto al hablante antes de actuar sobre el.
- Restricciones de licencia: el modelo es cc-by-4.0, pero el dataset de origen tiene acceso restringido (gated) y sus terminos deben aceptarse por separado; los datos no se incluyen en el repositorio ni pueden compartirse desde el.
- Riesgo de alucinacion no documentado de forma especifica; el modo de fallo de bucles se reporta como inexistente en las evaluaciones publicadas (0 bucles en test y dev).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/parakeet-ctc-en-ft-10ep
- Modelo base: https://huggingface.co/nvidia/parakeet-ctc-0.6b
- Dataset: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- Repositorio del proyecto (codigo de entrenamiento): `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` (sin URL publica en la informacion proporcionada)
- Paper, blog o demo: no disponible en la informacion proporcionada
