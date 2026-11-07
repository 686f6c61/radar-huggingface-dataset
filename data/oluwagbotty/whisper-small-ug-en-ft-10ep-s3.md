# oluwagbotty/whisper-small-ug-en-ft-10ep-s3

## Resumen
`whisper-small-ug-en-ft-10ep-s3` es un modelo de reconocimiento automatico del habla (ASR) derivado de Whisper small, desarrollado por el usuario oluwagbotty en el marco del Rwanda Innovation Sprint del Centre for Digital Language Inclusion (CDLI, UCL). El modelo parte del checkpoint `cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0` y se afina sobre la particion de entrenamiento del corpus `cdli/rwandan_english_nonstandard_speech_v1.0`, compuesto mayoritariamente por hablantes jovenes adultos con tartamudez (stuttering). El objetivo es mejorar la transcripcion de habla no estandar en ingles ruandes, un escenario poco cubierto por los sistemas ASR comerciales.

Tecnicamente es un transformer encoder-decoder de la familia Whisper con 241.734.912 parametros (aproximadamente 0,24 B), licencia "other" y un unico idioma declarado, el ingles. La relevancia actual reside en su enfoque: ASR de bajo coste para poblaciones con trastornos del habla, evaluado con WER y CER sobre particiones dev y test separadas por hablante. El autor advierte explicitamente de que el modelo no debe usarse para diagnostico ni evaluacion clinica de condiciones del habla.

La ficha se basa exclusivamente en la model card y los metadatos publicados; no se dispone de informacion adicional sobre arquitectura interna, composicion exacta del dataset ni detalles del proceso de entrenamiento mas alla de los hiperparametros indicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper small) |
| Parametros totales | 241.734.912 (~0,24 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper small usa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | en (ingles) |
| Licencia | other (hereda los terminos del modelo base; CDLI no ha confirmado licencia) |
| Formato de pesos | safetensors (carpeta `best/`) |

## Arquitectura y entrenamiento
El modelo es un fine-tuning de Whisper small, un transformer encoder-decoder disenado para ASR que procesa audio en ventanas de 30 segundos y genera texto de forma autorregresiva. No se documentan modificaciones arquitectonicas respecto al modelo base; la innovacion es exclusivamente el ajuste sobre habla no estandar.

El entrenamiento usa unicamente la particion de train del dataset CDLI de ingles ruandes; la particion dev se empleo para seleccionar el checkpoint y la particion test se puntuo una sola vez tras el entrenamiento. La particion `extra` no se utilizo y ningun hablante aparece en mas de una particion. Se entrenaron hasta 10 epocas con early stopping sobre WER de dev (paciencia de 3 evaluaciones), semilla 3, learning rate 1e-5 y batch de 16. El codigo corresponde a `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto. Las grabaciones se realizaron en Ruanda en 2026, en interiores con bajo ruido, mediante una app de tablet, a partir de estimulos de imagen (descripciones libres) y de texto (frases leidas). No se documenta el numero de tokens de audio, la composicion exacta del corpus ni el uso de RLHF/DPO.

## Capacidades
- Reconocimiento automatico del habla en ingles, con enfasis en habla no estandar y tartamudez.
- Transcripcion de habla leida (frases a partir de prompt de texto) y de descripciones libres a partir de imagenes.
- Manejo de repeticiones de tartamudeo en la salida, ya que los targets de entrenamiento son verbatim y escriben las repeticiones.
- Decodificacion greedy, una grabacion cada vez (configuracion de evaluacion documentada).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio generativo ni modo de razonamiento.
- Capacidad multilingue limitada al ingles declarado; no se evalua code-switching.

## Casos de uso
- Transcripcion asistida de habla con tartamudez en contextos de investigacion: el modelo permite obtener borradores de transcripcion de grabaciones controladas en interiores, que el hablante revisa antes de usarse, dado el aviso del autor de mostrar el texto al hablante antes de actuar sobre el.
- Investigacion en ASR inclusivo: sirve como punto de partida para estudiar el rendimiento de Whisper small sobre habla no estandar y comparar variantes de fine-tuning con WER y CER como metricas.
- Prototipos de accesibilidad en entornos de bajo coste: al ser un modelo de 0,24 B, puede desplegarse en hardware modesto para experimentos de dictado o subtitulado en ingles dentro de proyectos de innovacion social.
- Evaluacion de modelos base frente a fine-tunings: el checkpoint permite reproducir la comparacion con `cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0` usando las particiones dev y test.
- Generacion de transcripciones para anotacion posterior: las salidas pueden servir como pre-anotacion de corpus de habla no estandar, siempre con revision humana.
- Docencia y demostraciones sobre ASR y sesgos: ilustra como un corpus pequeno y especifico (9 hablantes de test) condiciona la generalizacion y como se reportan metricas con intervalos de incertidumbre amplios.

## Benchmarks y rendimiento
Resultados publicados en la model card (decodificacion greedy, una grabacion cada vez, normalizador de texto basico de Whisper; WER agrupado cuenta todas las palabras, WER y CER por enunciado son medias con tope del 100 %):

| Particion | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 25,3 | 16,7 | 26,1 | 17,5 | 1 |
| dev (6 hablantes) | 32,2 | 22,7 | 30,3 | 21,2 | 0 |

El autor advierte de que, con solo 9 hablantes de test, no pueden confirmarse diferencias inferiores a unos 3 puntos de WER entre dos modelos. No se publican comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; con 241,7 M de parametros, en fp32 los pesos ocupan aproximadamente 0,9 GB y en fp16 alrededor de 0,5 GB, a lo que hay que sumar memoria para activaciones y audio.
- GPU recomendadas: no documentadas por el autor; por tamano, el modelo es apto para GPU consumer, aunque no se especifican modelos concretos.
- Cabe en GPU consumer: previsiblemente si, dado el tamano, aunque no hay confirmacion en la informacion disponible.
- Opciones de despliegue: transformers (libreria declarada) y endpoints compatibles; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Rendimiento en este dominio |
|---|---|---|---|---|---|
| oluwagbotty/whisper-small-ug-en-ft-10ep-s3 | 241,7 M | no disponible (ventanas de 30 s en Whisper small) | en | other | WER test 25,3 % (agrupado) |
| cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0 | no disponible en la informacion | no disponible | en | no disponible | no disponible (modelo base de partida) |
| openai/whisper-small | ~0,2 B | ventanas de 30 s | multilingue | no disponible en la informacion | no disponible en este dominio |
| openai/whisper-small.en | ~0,2 B | ventanas de 30 s | en | no disponible en la informacion | no disponible en este dominio |

No se dispone de resultados comparativos publicados entre estos modelos sobre el corpus CDLI en la informacion proporcionada.

## Limitaciones y advertencias
- Pocos hablantes y condiciones estrechas: 9 hablantes de test, mayoritariamente hombres jovenes adultos, grabaciones en interiores silenciosos y habla leida o descrita a partir de imagenes, no conversacional. Se desconoce el rendimiento con ninos, otras discapacidades, entornos ruidosos, audio telefonico o habla con cambio de codigo.
- Targets verbatim: las repeticiones por tartamudeo se escriben en las transcripciones y el modelo puede o no reproducirlas; los bloqueos y prolongaciones no son visibles en el texto.
- Sesgo hacia prompts de texto: las frases leidas tambien aparecen en las transcripciones de train, por lo que los resultados con prompts de imagen son la mejor guia para habla abierta.
- Prohibido para decisiones sobre personas: no debe usarse para diagnosticar o evaluar condiciones del habla, identificar hablantes ni en decisiones clinicas, legales o de aplicacion de la ley. Los terminos de CDLI prohiben reidentificar hablantes y crear voces que imiten a una persona.
- Riesgo de alucinacion y bucles: se documenta un bucle en la particion de test (modo de fallo tipico de Whisper); una transcripcion erronea puede cambiar el significado de lo dicho, por lo que debe mostrarse el texto al hablante antes de actuar sobre el.
- Licencia incierta: el modelo base no declara licencia y CDLI no ha confirmado una; deben verificarse los terminos con CDLI antes de cualquier reutilizacion, incluido el uso comercial.
- Incertidumbre estadistica: con 9 hablantes de test, diferencias inferiores a unos 3 puntos de WER no pueden confirmarse.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/whisper-small-ug-en-ft-10ep-s3
- Modelo base: https://huggingface.co/cdli/whisper-small_finetuned_ugandan_english_nonstandard_speech_v1.0
- Dataset: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- Whisper small (OpenAI): https://huggingface.co/openai/whisper-small
- Whisper small.en (OpenAI): https://huggingface.co/openai/whisper-small.en
