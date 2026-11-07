# oluwagbotty/parakeet-tdt-en-ft-10ep

## Resumen

`oluwagbotty/parakeet-tdt-en-ft-10ep` es un ajuste fino del modelo ASR `nvidia/parakeet-tdt-0.6b-v2` (600 millones de parametros, arquitectura Fast Conformer con decodificador TDT) realizado por el usuario oluwagbotty sobre la particion de entrenamiento del dataset CDLI Rwandan English non-standard speech v1.0. El objetivo del proyecto es la transcripcion de habla en ingles ruandes con tartamudez, en el marco del Rwanda Innovation Sprint impulsado por el Centre for Digital Language Inclusion (UCL) y financiado por UK International Development a traves del programa AT2030 con apoyo de Google.org.

El modelo resuelve un problema concreto de inclusion digital: los sistemas ASR comerciales rinden mal con hablantes que tartamudean, especialmente en variedades no estandar del ingles. Este ajuste proporciona un punto de partida reproducible (greedy decoding, evaluacion con el normalizador de texto de Whisper) para transcripcion de habla tartamudeante en condiciones controladas de grabacion. Es relevante por su caracter abierto (licencia CC-BY-4.0) y por documentar de forma transparente las metricas y limitaciones del ajuste.

Se distribuye como un unico fichero `best.nemo` (2,5 GB) y esta pensado exclusivamente para investigacion y evaluacion, no para diagnostico ni decisiones clinicas o legales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Fast Conformer + decodificador TDT (Token-and-Duration Transducer), familia NVIDIA NeMo Parakeet |
| Parametros totales | 600 millones (heredados del modelo base parakeet-tdt-0.6b-v2) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (distribucion en formato NeMo nativo, sin variantes GGUF ni cuantizadas publicadas) |
| Idiomas soportados | ingles (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | `.nemo` (checkpoint de NVIDIA NeMo; fichero `best.nemo`) |

## Arquitectura y entrenamiento

El modelo parte de `nvidia/parakeet-tdt-0.6b-v2`, un ASR de 600 millones de parametros que combina un encoder Fast Conformer con un decodificador TDT (Token-and-Duration Transducer). El ajuste fino se realizo sobre la particion de entrenamiento del dataset `cdli/rwandan_english_nonstandard_speech_v1.0`, compuesto por grabaciones de hablantes jovenes adultos con tartamudez, realizadas en Ruanda en 2026 en interiores con bajo ruido mediante una aplicacion de tableta, a partir de descripciones de imagenes y frases leidas.

La configuracion de entrenamiento documentada es: hasta 10 epocas con parada temprana sobre WER de dev (paciencia de 3 evaluaciones), semilla 42, `--lr 1e-4` y precision `bf16-mixed`. La particion de dev se uso para seleccionar el checkpoint y la de test se evaluo una sola vez tras el entrenamiento; la particion `extra` no se utilizo y ningun hablante aparece en mas de una particion. El codigo de entrenamiento esta en `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto (experimento `parakeet-tdt-en-ft-10ep`). No se documentan fases de RLHF ni DPO, ni el volumen de tokens de audio empleado.

## Capacidades

- Reconocimiento automatico de habla (ASR) en ingles, con salida de transcripcion verbatim.
- Transcripcion de habla tartamudeante, incluyendo repeticiones de sonido o silaba reflejadas en las transcripciones de entrenamiento.
- Manejo de dos modalidades de habla del dataset: frases leidas y descripciones libres de imagenes.
- Decodificacion greedy por grabacion, sin bucles de repeticion observados en la evaluacion (0 loops en dev y test).
- No se documenta soporte de tool calling, function calling, agentes, vision, audio de entrada mas alla del propio ASR, ni modo de razonamiento explicito.
- Capacidad multilingue limitada al ingles; no se ha validado el comportamiento en otras lenguas ni en code-switching.

## Casos de uso

- Investigacion sobre ASR inclusivo: servir como linea base reproducible para comparar tecnicas de ajuste fino orientadas a habla no estandar, con metricas WER y CER ya publicadas sobre dev y test.
- Prototipado de subtitulado para hablantes que tartamudean: el modelo transcribe frases leidas y descripciones libres en condiciones de interior silenciosas, adecuado para entornos de laboratorio o piloto controlado.
- Evaluacion comparativa de modelos ASR en variedades no estandar del ingles: permite contrastar el rendimiento de Parakeet frente a Whisper u otros sistemas sobre el mismo split del dataset CDLI.
- Herramientas de accesibilidad en contextos educativos o de investigacion de campo: transcripcion de grabaciones recogidas con tableta en entornos de bajo ruido, siempre con revision humana del texto antes de cualquier uso.
- Generacion de transcripciones verbatim para analisis linguistico: la inclusion de repeticiones en los targets permite estudiar patrones de disfluencia en el texto producido.
- Desarrollo de pipelines de post-procesado para habla disfluente: el modelo sirve como primer eslabon para experimentar con normalizacion, correccion o deteccion de repeticiones aguas abajo.
- Docencia y divulgacion sobre ajuste fino de modelos NeMo: el repositorio documenta hiperparametros, semilla y protocolo de evaluacion, lo que facilita su replicacion en cursos o talleres.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificacion greedy, una grabacion a la vez y el normalizador de texto basico de Whisper. El WER agrupado cuenta todas las palabras conjuntamente; el WER y CER por enunciado son medias sobre grabaciones, cada una limitada al 100%.

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 22,0 | 14,9 | 23,0 | 15,8 | 0 |
| dev (6 hablantes) | 30,2 | 22,2 | 28,6 | 20,9 | 0 |

El autor advierte que, con solo 9 hablantes en test, las diferencias inferiores a unos 3 puntos de WER entre dos modelos no pueden confirmarse. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del modelo (600 millones de parametros, fichero de 2,5 GB), es esperable que quepa en GPUs de consumo, aunque no se documentan cifras oficiales.
- GPU recomendadas: no disponible; el modelo base procede de NVIDIA NeMo y se ha entrenado con precision `bf16-mixed`, por lo que se beneficia de GPUs NVIDIA con soporte bf16.
- GPU de consumo: previsiblemente compatible con tarjetas de 8 GB o mas, si bien no se confirma en la model card.
- Opciones de despliegue: NVIDIA NeMo (formato `.nemo` nativo); no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| oluwagbotty/parakeet-tdt-en-ft-10ep | 600 M | en | no disponible | CC-BY-4.0 | `.nemo` | Ajuste fino sobre habla tartamudeante; WER test 22,0 % |
| nvidia/parakeet-tdt-0.6b-v2 | 600 M | en | no disponible | no disponible en la informacion | NeMo | Modelo base del ajuste; sin metricas comparables en esta ficha |
| nvidia/parakeet-tdt-0.6b-v3 | 600 M | 25 lenguas europeas | no disponible | no disponible en la informacion | NeMo | Version multilingue con deteccion automatica de idioma |

No se dispone de datos de benchmarks del modelo base ni de v3 en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes en test, mayoritariamente hombres jovenes adultos, grabaciones en interior silencioso, habla leida y descrita a partir de imagenes, no conversacional. El rendimiento en ninos, otras discapacidades, entornos ruidosos, audio telefonico o habla con cambio de codigo es desconocido.
- Objetivos verbatim: las repeticiones por tartamudeo aparecen escritas en las transcripciones y el modelo puede reproducirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Sesgo hacia frases leidas: las frases de los prompts de texto tambien aparecen en las transcripciones de entrenamiento, por lo que los resultados con descripcion de imagenes son la mejor guia para habla abierta.
- Prohibido para decisiones sobre personas: no debe usarse para diagnosticar o evaluar ninguna condicion del habla, identificar hablantes ni en decisiones clinicas, legales o de aplicacion de la ley. Los terminos de CDLI prohiben reidentificar hablantes y construir voces que imiten a una persona.
- Riesgo de que una transcripcion erronea cambie el significado de lo dicho: el autor recomienda mostrar el texto al hablante antes de actuar sobre el.
- Licencia CC-BY-4.0: permite uso comercial con atribucion, pero el acceso al dataset esta restringido y no se puede compartir desde el repositorio; conviene revisar los terminos de CDLI antes de cualquier uso derivado.
- Sin cuantizaciones publicadas ni soporte documentado en frameworks fuera de NeMo, lo que limita su despliegue en entornos de inferencia habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/parakeet-tdt-en-ft-10ep
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v2
- Version multilingue v3: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
- Documentacion de Parakeet en Transformers: https://huggingface.co/docs/transformers/v5.10.2/en/model_doc/parakeet
- Dataset CDLI Rwandan English non-standard speech v1.0: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
