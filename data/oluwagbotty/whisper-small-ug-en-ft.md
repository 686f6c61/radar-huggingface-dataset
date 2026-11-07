# oluwagbotty/whisper-small-ug-en-ft

## Resumen

whisper-small-ug-en-ft es un ajuste fino del modelo de reconocimiento automatico del habla (ASR) `cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0`, que a su vez deriva de la arquitectura Whisper small de OpenAI. Lo desarrolla el usuario oluwagbotty en el marco del Rwanda Innovation Sprint del Centre for Digital Language Inclusion (CDLI, UCL), un proyecto de investigacion sobre reconocimiento de voz de bajo coste para personas con tartamudez. El modelo se entrena sobre el split de entrenamiento del dataset CDLI Rwandan English non-standard speech v1.0, cuyos hablantes son en su mayoria adultos jovenes que tartamudean.

El problema que aborda es la baja robustez de los sistemas ASR convencionales ante habla no estandar: repeticiones, bloqueos y prolongaciones tipicas de la disfluencia degradan la transcripcion de los modelos genericos. Este ajuste busca mejorar la transcripcion de ese tipo de habla en ingles ruandes, un contexto linguistico y acustico poco representado en los corpus habituales de Whisper.

Se trata de un modelo de tamano pequeno (arquitectura Whisper small, aproximadamente 0,2 mil millones de parametros, segun la ficha del modelo base de OpenAI), con pesos en formato safetensors y licencia "other" sin terminos confirmados por CDLI. Su relevancia es fundamentalmente de investigacion: demuestra que un ajuste fino acotado (5 epocas sobre un unico split) puede reducir el WER en habla con tartamudez, aunque con un conjunto de evaluacion muy reducido (9 hablantes) que limita la solidez de las conclusiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper small (modelo base: `cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0`, derivado de `openai/whisper-small`) |
| Parametros totales | aproximadamente 0,2 mil millones (heredados de Whisper small; no se especifica en la model card) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper small trabaja con ventanas de audio de 30 segundos; no se detalla en la model card) |
| Tipos de cuantizacion | no disponible (los pesos se distribuyen en safetensors sin cuantizar; no se documentan variantes GGUF ni otras) |
| Idiomas soportados | en (ingles; entrenado especificamente con ingles ruandes) |
| Licencia | other (la model card indica que el modelo base no declara licencia y que CDLI no la ha confirmado; hay que consultar los terminos con CDLI antes de reutilizarlo) |
| Formato de pesos | safetensors (pesos en la carpeta `best/`) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Whisper small de OpenAI, un transformer encoder-decoder disenado para ASR y traduccion de voz, y hereda el ajuste fino previo del CDLI sobre ingles ugandes no estandar. Sobre esa base, se realiza un segundo ajuste fino con todos los pesos entrenables (no se congela ninguna capa) durante 5 epocas, con tasa de aprendizaje 1e-5, tamano de lote 16 y evaluacion del WER de desarrollo cada 200 pasos. Se conserva el checkpoint con el mejor WER en el split de desarrollo, sin parada temprana.

Los datos provienen exclusivamente del split de entrenamiento del dataset `cdli/rwandan_english_nonstandard_speech_v1.0`; el split de desarrollo se uso para seleccionar el checkpoint y el de test se evaluo una sola vez tras el entrenamiento. El split `extra` no se utilizo y ningun hablante aparece en mas de un split. Las grabaciones se realizaron en Ruanda en 2026, en interiores con poco ruido, mediante una aplicacion de tableta, a partir de estimulos de imagen (descripciones libres) y de texto (frases leidas). La model card no documenta el numero de tokens de audio ni el uso de RLHF o DPO; tampoco describe innovaciones tecnicas adicionales mas alla del ajuste fino supervisado con etiquetas verbatim, en las que las repeticiones del tartamudeo se escriben de forma literal.

## Capacidades

- Reconocimiento automatico del habla en ingles, con enfasis en habla no estandar de personas que tartamudean.
- Transcripcion de audio con ventanas de 30 segundos, heredadas de la arquitectura Whisper small.
- Manejo de habla leida (frases de texto) y de descripciones libres a partir de estimulos visuales.
- Salida de texto verbatim: el modelo puede reproducir repeticiones del tartamudeo tal como aparecen en las transcripciones de entrenamiento, aunque la model card advierte que puede escribirlas o no.
- Decodificacion greedy en la evaluacion publicada, con un unico fallo de bucle (repeticion patologica de la salida) en el split de test.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio de entrada mas alla del propio ASR, ni capacidades multilingues distintas del ingles.

## Casos de uso

- Transcripcion asistida para personas que tartamudean: el modelo puede generar un borrador de transcripcion de grabaciones de voz de personas con disfluencia, que el hablante revisa antes de usarlo, aprovechando su ajuste sobre habla no estandar.
- Investigacion en ASR inclusivo: sirve como punto de partida o linea base en estudios sobre reconocimiento de habla no estandar, dado que su codigo de ajuste fino y sus splits estan documentados.
- Prototipos de accesibilidad en aplicaciones de dictado: integrable mediante la libreria transformers en un pipeline de automatic-speech-recognition para probar interfaces de voz destinadas a usuarios con tartamudez.
- Evaluacion comparativa de modelos ASR: util para medir la degradacion de Whisper small frente a variantes ajustadas en condiciones de habla disfluente, con las metricas WER y CER ya publicadas.
- Docencia y experimentacion con ajuste fino de ASR: el repositorio incluye la receta de entrenamiento (epocas, tasa de aprendizaje, lote, seleccion de checkpoint), lo que facilita reproducir el proceso en entornos academicos.
- Procesamiento por lotes de grabaciones en entornos controlados: adecuado para audio en interiores con poco ruido y micrófono de tableta, el mismo dominio de los datos de entrenamiento; no se recomienda para audio telefonico ni entornos ruidosos segun las limitaciones declaradas.

## Benchmarks y rendimiento

Resultados publicados en la model card (decodificacion greedy, una grabacion a la vez, normalizador de texto basico de Whisper):

| Split | WER agrupado (%) | CER (%) | WER por emision (%) | CER por emision (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 24,7 | 16,3 | 25,7 | 17,2 | 1 |
| dev (6 hablantes) | 33,9 | 23,8 | 31,7 | 22,4 | 4 |

La propia model card advierte que, con solo 9 hablantes en test, no pueden confirmarse diferencias inferiores a unos 3 puntos de WER entre dos modelos. No se publican comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del modelo base (aproximadamente 0,2 mil millones de parametros), es esperable que quepa en GPUs de consumo, aunque no se aportan cifras concretas.
- GPU recomendadas: no disponible; la model card no especifica hardware de entrenamiento ni de inferencia.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: la model card indica la libreria transformers y el pipeline `automatic-speech-recognition`; no se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| oluwagbotty/whisper-small-ug-en-ft | aprox. 0,2 B | no disponible (ventanas de 30 s en Whisper) | en | other (sin confirmar) | WER 24,7 % en test (9 hablantes) | Hugging Face, 0 descargas |
| openai/whisper-small | aprox. 0,2 B | ventanas de 30 s | multilingue | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| openai/whisper-small.en | aprox. 0,2 B | ventanas de 30 s | en | no disponible en la informacion | no disponible en la informacion | Hugging Face |
| cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0 | aprox. 0,2 B | no disponible | en | no disponible en la informacion | no disponible en la informacion | Hugging Face (modelo base) |

No se dispone de resultados de benchmarks de los modelos comparables en la informacion proporcionada, por lo que la comparacion de rendimiento no puede completarse.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes en test, en su mayoria hombres adultos jovenes, grabaciones en interiores silenciosos, habla leida y descrita a partir de imagenes, no conversacional. El rendimiento en ninos, otras discapacidades, entornos ruidosos, audio telefonico o habla con cambio de codigo es desconocido.
- Objetivos verbatim: las repeticiones del tartamudeo se escriben literalmente en las transcripciones, y el modelo puede reproducirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Las frases leidas aparecen tambien en las transcripciones de entrenamiento, por lo que los resultados con estimulos de texto son mas faciles y los de descripcion de imagenes son la mejor guia para habla abierta.
- Riesgo de alucinacion y de bucles: se documenta un fallo de bucle en el split de test y cuatro en el de desarrollo, un modo de fallo tipico de Whisper.
- No apto para decisiones sobre personas: prohibido su uso para diagnosticar o evaluar condiciones del habla, identificar hablantes o en decisiones clinicas, legales o policiales. Los terminos de CDLI prohiben reidentificar hablantes y construir voces que imiten a una persona.
- Una transcripcion erronea puede cambiar el significado de lo dicho: debe mostrarse el texto al hablante antes de actuar sobre el.
- Licencia sin confirmar: el modelo base no declara licencia y CDLI no la ha confirmado; es necesario consultar los terminos antes de cualquier reutilizacion, incluido el uso comercial.
- Sesgos conocidos: no se documentan mas alla de la composicion demografica limitada del corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/whisper-small-ug-en-ft
- Modelo base: https://huggingface.co/cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0
- Dataset: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0 (acceso restringido; hay que aceptar los terminos de CDLI)
- Whisper small de OpenAI: https://huggingface.co/openai/whisper-small
- Whisper small.en de OpenAI: https://huggingface.co/openai/whisper-small.en
