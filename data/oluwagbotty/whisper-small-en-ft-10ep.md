# oluwagbotty/whisper-small-en-ft-10ep

## Resumen

whisper-small-en-ft-10ep es un ajuste fino de openai/whisper-small, el modelo de reconocimiento automatico del habla (ASR) de OpenAI de unos 242 millones de parametros, especializado en ingles hablado por personas que tartamudean. Lo desarrolla el usuario oluwagbotty en el marco del Rwanda Innovation Sprint del Centre for Digital Language Inclusion (CDLI, UCL), y se entrena sobre la particion de entrenamiento del dataset cdli/rwandan_english_nonstandard_speech_v1.0, compuesto principalmente por adultos jovenes ruandeses que tartamudean.

El modelo resuelve un problema concreto: los sistemas ASR comerciales y genericos rinden mal con habla no estandar, y en particular con disfluencias como repeticiones, bloqueos y prolongaciones. Este ajuste busca mejorar la transcripcion de ese tipo de habla en un contexto de bajo coste, y publica resultados medidos con WER y CER sobre los splits de desarrollo y test del propio dataset.

Es relevante ahora porque ejemplifica el ajuste fino de un modelo pequeno y abierto (licencia Apache 2.0) para poblaciones infrarrepresentadas en los corpus de ASR, con una evaluacion honesta de sus limites: pocos hablantes, condiciones de grabacion controladas y advertencias explicitas contra usos clinicos o de identificacion de hablantes. No es un modelo de proposito general, sino una herramienta de investigacion acotada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), segun el modelo base openai/whisper-small |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper-small procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers); pesos en la carpeta best/ |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper-small: un transformer encoder-decoder que recibe espectrogramas mel de audio y genera texto de forma autorregresiva, con capacidad multilingue en el modelo original pero orientado aqui exclusivamente al ingles. El ajuste fino parte de los pesos de openai/whisper-small y se realiza sobre la particion de entrenamiento del dataset CDLI de habla no estandar de Ruanda.

El entrenamiento usa hasta 10 epocas con parada temprana sobre el WER de desarrollo (paciencia de 3 evaluaciones), semilla 42, learning rate 1e-5 y batch de 16. Solo se emplea el split de train; el split de dev elige el checkpoint y el de test se evalua una unica vez tras el entrenamiento. El split `extra` no se usa y ningun hablante aparece en mas de un split. No se documenta en la informacion disponible el numero de tokens de audio ni si hubo tecnicas de RLHF o DPO (no aplicables de forma habitual en ASR). Las grabaciones se hicieron en Ruanda en 2026, en interiores con poco ruido, mediante una aplicacion de tablet, a partir de imagenes (descripcion libre) y de frases escritas (lectura).

## Capacidades

- Reconocimiento automatico del habla en ingles, con enfasis en habla no estandar y tartamudeo.
- Transcripcion de audio con repeticiones de tartamudeo escritas de forma literal en los objetivos de entrenamiento (verbatim).
- Manejo de dos modalidades de elicitacion: descripcion libre a partir de imagenes y lectura de frases.
- Decodificacion greedy de una grabacion cada vez, segun la evaluacion publicada.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multimodales mas alla del audio.
- Capacidad multilingue limitada al ingles; no se reporta soporte de otros idiomas.
- No se documentan modos especiales como thinking mode, vision o audio generation.

## Casos de uso

- Investigacion en ASR inclusivo: servir como punto de partida o linea base para estudiar como se comporta un modelo pequeno con disfluencias del habla, comparando WER y CER sobre el dataset CDLI y variantes.
- Transcripcion asistida de entrevistas con personas que tartamudean: en entornos de investigacion social o linguistica, el modelo puede generar un borrador de transcripcion que despues revise una persona, aprovechando su ajuste a repeticiones y habla pausada.
- Prototipos de accesibilidad de bajo coste: al tener 242 millones de parametros y licencia Apache 2.0, puede desplegarse en hardware modesto para probar interfaces de voz destinadas a usuarios con disfluencias.
- Evaluacion comparativa de modelos ASR: usar sus resultados publicados (WER agrupado del 25,6 % en test) como referencia frente a otros ajustes sobre el mismo corpus.
- Generacion de datos y anotacion semi-automatica: transcribir grabaciones del dominio para preanotar y acelerar el etiquetado humano, siempre con revision posterior del hablante.
- Docencia y demostraciones sobre sesgos en ASR: ilustrar de forma practica como un modelo entrenado con pocos hablantes y condiciones controladas se degrada fuera de ese dominio, con las advertencias eticas correspondientes.

## Benchmarks y rendimiento

Resultados publicados en la model card, con decodificacion greedy, una grabacion cada vez y normalizador de texto basico de Whisper. El WER agrupado cuenta todas las palabras juntas; el WER y CER por enunciado son medias sobre grabaciones (cada una limitada al 100 %). Los bucles se refieren a grabaciones cuya salida se repite.

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 25,6 | 16,9 | 27,0 | 18,0 | 0 |
| dev (6 hablantes) | 32,1 | 22,1 | 30,8 | 21,0 | 0 |

El autor advierte que, con solo 9 hablantes en test, las diferencias inferiores a unos 3 puntos de WER entre dos modelos no pueden confirmarse. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 242 millones de parametros, en FP32 los pesos ocupan aproximadamente 1 GB, y en FP16 alrededor de 0,5 GB, a lo que hay que sumar el coste de activaciones y del procesamiento de audio.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano, el modelo es manejable en GPUs de consumo, aunque no se documentan modelos concretos.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano, pero no se confirma en la informacion disponible.
- Opciones de despliegue: transformers (libreria indicada); el tag endpoints_compatible sugiere compatibilidad con endpoints de Hugging Face. No se documentan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Enfoque |
|---|---|---|---|---|---|
| oluwagbotty/whisper-small-en-ft-10ep | 241.734.912 | no disponible (ventanas de 30 s en Whisper) | en | apache-2.0 | ASR de habla no estandar y tartamudeo |
| openai/whisper-small | 0,2B (aprox. 242 M) | no disponible (ventanas de 30 s) | multilingue | apache-2.0 | ASR general |
| openai/whisper-small.en | no disponible en la informacion | no disponible | en | apache-2.0 | ASR general en ingles |

El ajuste parte de openai/whisper-small y comparte su tamano y licencia; la diferencia esta en el dominio de entrenamiento (habla no estandar de Ruanda) y en la evaluacion especifica sobre ese corpus. No se dispone de datos de rendimiento de los modelos base sobre el mismo test como para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes en test, en su mayoria hombres adultos jovenes, grabaciones en interiores silenciosos, habla leida y descrita a partir de imagenes, no conversacional. Se desconoce el rendimiento con ninos, otras discapacidades, entornos ruidosos, audio de telefono o habla con cambio de codigo.
- Objetivos verbatim: las repeticiones del tartamudeo se escriben en las transcripciones, y los modelos entrenados con ellas pueden reproducirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Las frases de los prompts de texto tambien aparecen en las transcripciones de entrenamiento, por lo que los resultados con prompts de imagen son la mejor guia para habla abierta.
- No debe usarse para diagnosticar o evaluar ninguna condicion del habla, identificar hablantes ni tomar decisiones clinicas, legales o policiales. Los terminos del CDLI prohiben reidentificar hablantes y crear voces que imiten a una persona.
- Riesgo de alucinacion y de errores de transcripcion: una transcripcion incorrecta puede cambiar el significado de lo dicho, por lo que debe mostrarse el texto al hablante antes de actuar sobre el.
- Sesgos conocidos: no se documentan de forma explicita, pero la composicion demografica y las condiciones de grabacion del dataset limitan la generalizacion.
- Restricciones de licencia: los pesos son Apache 2.0, pero el dataset esta sujeto a los terminos del CDLI (acceso restringido) y no se incluye en el repositorio ni puede compartirse desde el.
- El repositorio ocupa 43,5 GB, muy por encima del tamano de los pesos, lo que conviene tener en cuenta al descargarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/whisper-small-en-ft-10ep
- Modelo base: https://huggingface.co/openai/whisper-small
- Variante en ingles del modelo base: https://huggingface.co/openai/whisper-small.en
- Dataset: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
