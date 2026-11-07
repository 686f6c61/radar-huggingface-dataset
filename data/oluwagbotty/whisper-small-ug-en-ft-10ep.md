# oluwagbotty/whisper-small-ug-en-ft-10ep

## Resumen

whisper-small-ug-en-ft-10ep es un modelo de reconocimiento automatico del habla (ASR) derivado de Whisper small de OpenAI, afinado por el usuario oluwagbotty sobre el split de entrenamiento del dataset CDLI Rwandan English non-standard speech v1.0. El punto de partida no es el Whisper original, sino un checkpoint intermedio de CDLI ya ajustado a ingles ugandes no estandar (cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0); este modelo anade un segundo afinamiento orientado a habla con tartamudeo. El objetivo declarado es un proyecto de investigacion sobre reconocimiento de voz de bajo coste para personas que tartamudean (Rwanda Innovation Sprint, CDLI).

La relevancia del modelo es acotada pero clara: el habla no estandar (repeticiones, bloqueos, prolongaciones) suele degradar fuertemente los ASR genericos, y este checkpoint documenta explicitamente su rendimiento en ese dominio con WER y CER desglosados por split. Se trata de un modelo pequeno (arquitectura Whisper small, en torno a 244 millones de parametros), con licencia "other" no confirmada por CDLI, y con un conjunto de evaluacion muy reducido (9 hablantes de test), lo que limita la solidez de sus cifras.

No hay informacion disponible sobre longitud de contexto en tokens ni sobre el proceso de tokenizacion mas alla de lo heredado de Whisper. El modelo se distribuye en formato safetensors dentro de la carpeta `best/` del repositorio, con un tamano de repo de 1,0 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Whisper small (transformer encoder-decoder para ASR) |
| Parametros totales | no disponible en la informacion proporcionada (Whisper small: ~244 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper small procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | other (terminos heredados del modelo base; CDLI no ha confirmado licencia) |
| Formato de pesos | safetensors (carpeta `best/`) |

## Arquitectura y entrenamiento

El modelo es un Whisper small estandar: un transformer encoder-decoder con atencion completa, entrenado originalmente por OpenAI para transcripcion multilingue y traduccion de voz. Sobre esa base, CDLI produjo un primer afinamiento para ingles ugandes no estandar y oluwagbotty aplico un segundo afinamiento sobre el split de entrenamiento del dataset CDLI Rwandan English non-standard speech v1.0, cuyos hablantes son mayoritariamente adultos jovenes que tartamudean. No se dispone de informacion sobre el numero de tokens de audio ni sobre la composicion exacta del corpus mas alla de la descripcion del dataset (grabaciones en interiores con bajo ruido, hechas en Ruanda en 2026 con una app de tableta, a partir de descripciones de imagenes y de frases leidas).

El entrenamiento uso hasta 10 epocas con parada temprana sobre el WER de dev (paciencia de 3 evaluaciones), semilla 42, learning rate 1e-5 y batch de 16. Solo se uso el split de train; el split de dev selecciono el checkpoint y el de test se puntuo una unica vez tras el entrenamiento; el split `extra` no se uso y ningun hablante aparece en mas de un split. No se documenta uso de RLHF ni DPO, algo esperable en un modelo ASR. La decodificacion reportada es greedy, una grabacion cada vez, con el normalizador de texto basico de Whisper. El codigo de los experimentos esta en `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto.

## Capacidades

- Transcripcion de voz a texto en ingles, con foco en habla no estandar y tartamudeo.
- Manejo de repeticiones propias del tartamudeo: los objetivos de entrenamiento escriben literalmente las repeticiones, aunque el modelo puede o no reproducirlas en la salida.
- Decodificacion greedy estable: en las evaluaciones reportadas no se observaron bucles de repeticion (0 loops en dev y test), un fallo tipico de Whisper.
- Salida con puntuacion y normalizacion de texto compatible con el normalizador basico de Whisper.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio adicional ni modo thinking.
- Capacidad multilingue limitada al ingles segun la metadata del modelo.

## Casos de uso

- Transcripcion asistida para personas que tartamudean: el modelo esta afinado sobre habla con repeticiones y puede generar borradores de transcripcion que el hablante revisa antes de usarlos, tal como recomienda la propia model card.
- Investigacion en ASR inclusivo: sirve como linea base reproducible para comparar tecnicas de adaptacion a habla no estandar, con metricas WER/CER documentadas por split.
- Prototipos de subtitulado en entornos controlados: grabaciones en interiores con bajo ruido y un solo hablante, el regimen en el que se recogio el dataset.
- Evaluacion de pipelines de normalizacion de texto: permite medir como afecta el normalizador de Whisper a transcripciones con repeticiones y comparar con modelos CTC, que no pueden entrar en bucles.
- Docencia y experimentacion con fine-tuning de Whisper: el repositorio incluye scripts y configuracion YAML para reproducir el ajuste con parada temprana sobre WER de dev.
- Analisis de errores en habla leida frente a habla espontanea: la model card separa el efecto de las frases leidas (presentes tambien en train) de las descripciones de imagenes, lo que permite estudiar el sobreajuste a prompts de texto.

## Benchmarks y rendimiento

Resultados reportados por el autor con decodificacion greedy, una grabacion cada vez y el normalizador de texto basico de Whisper. El WER agrupado cuenta todas las palabras juntas; el WER y el CER por enunciado son medias sobre grabaciones, cada una limitada al 100 %.

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 24,7 | 16,3 | 25,7 | 17,3 | 0 |
| dev (6 hablantes) | 33,7 | 23,6 | 31,6 | 22,0 | 0 |

El propio autor advierte que, con solo 9 hablantes de test, las diferencias inferiores a unos 3 puntos de WER entre dos modelos no pueden confirmarse. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano de Whisper small (~244 M de parametros) la inferencia en fp16 cabe holgadamente en GPUs de consumo, aunque no se aportan mediciones.
- GPU recomendadas: no disponible en la informacion proporcionada.
- GPU de consumo: previsiblemente compatible con tarjetas consumer de gama media por el tamano del modelo, si bien no se confirma en la documentacion.
- Opciones de despliegue: la libreria indicada es transformers; el tag `endpoints_compatible` sugiere compatibilidad con Hugging Face Inference Endpoints. No se documentan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oluwagbotty/whisper-small-ug-en-ft-10ep | ~244 M (Whisper small) | ventanas de 30 s (heredado) | en | other (pendiente de confirmar con CDLI) | Hugging Face, safetensors |
| openai/whisper-small | 0,2 B | ventanas de 30 s | multilingue | licencia de OpenAI (no detallada aqui) | Hugging Face, transformers |
| openai/whisper-small.en | ~244 M | ventanas de 30 s | en | licencia de OpenAI (no detallada aqui) | Hugging Face, transformers |
| cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0 | ~244 M | ventanas de 30 s | en | no confirmada | Hugging Face, modelo base de este checkpoint |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; las unicas cifras publicadas son las del modelo objeto de esta ficha.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes de test, mayoritariamente hombres jovenes, grabaciones en interiores silenciosos, habla leida y descrita a partir de imagenes, no conversacional. El rendimiento en ninos, otras discapacidades del habla, entornos ruidosos, audio telefonico o habla con cambio de codigo es desconocido.
- Objetivos literales: las repeticiones del tartamudeo estan escritas en las transcripciones y el modelo puede reproducirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Sesgo hacia prompts de texto: las frases leidas aparecen tambien en las transcripciones de entrenamiento, por lo que los resultados con descripcion de imagenes son la mejor guia para habla abierta.
- Prohibicion de uso para decisiones sobre personas: no debe emplearse para diagnosticar o evaluar condiciones del habla, identificar hablantes ni en contextos clinicos, legales o de aplicacion de la ley. Los terminos de CDLI prohiben reidentificar hablantes y construir voces que imiten a una persona.
- Riesgo de alucinacion y de cambio de significado: una transcripcion erronea puede alterar lo que dijo la persona; la model card recomienda mostrar el texto al hablante antes de actuar sobre el.
- Licencia sin confirmar: el modelo base no declara licencia y CDLI no la ha confirmado; deben verificarse los terminos antes de cualquier reutilizacion, incluido el uso comercial.
- Evaluacion fragil: con 9 hablantes de test, diferencias de menos de 3 puntos de WER no son concluyentes.
- Cobertura limitada al ingles: la metadata solo declara `en`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/whisper-small-ug-en-ft-10ep
- Modelo base: https://huggingface.co/cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0
- Dataset: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- Whisper small (OpenAI): https://huggingface.co/openai/whisper-small
- Whisper small.en (OpenAI): https://huggingface.co/openai/whisper-small.en
