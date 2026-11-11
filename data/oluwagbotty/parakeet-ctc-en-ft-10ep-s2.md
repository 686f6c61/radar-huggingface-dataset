# oluwagbotty/parakeet-ctc-en-ft-10ep-s2

## Resumen

parakeet-ctc-en-ft-10ep-s2 es un modelo de reconocimiento automatico del habla (ASR) en ingles obtenido mediante fine-tuning de nvidia/parakeet-ctc-0.6b, un modelo CTC de la familia Parakeet de NVIDIA con unos 600 millones de parametros. El autor, oluwagbotty, lo ha entrenado sobre la particion de entrenamiento del dataset CDLI Rwandan English non-standard speech v1.0, compuesto por grabaciones de hablantes, en su mayoria adultos jovenes, que tartamudean. El objetivo declarado es la investigacion en reconocimiento de voz de bajo coste para personas con disfluencias, en el marco del Rwanda Innovation Sprint impulsado por el Centre for Digital Language Inclusion (UCL).

El modelo resuelve un problema concreto: los sistemas ASR genericos rinden peor ante habla no estandar, y en particular ante repeticiones, bloqueos y prolongaciones propias de la tartamudez. Al partir de una arquitectura CTC, evita el modo de fallo de los modelos autorregresivos tipo Whisper que entran en bucles de repeticion, algo que el autor documenta explicitamente (cero bucles en test y dev). Los pesos se distribuyen en formato .nemo (2,4 GB) y la licencia es CC BY 4.0.

La relevancia actual es doble: por un lado, aporta una referencia empirica de WER sobre habla tartamuda en ingles ruandes, un dominio poco cubierto; por otro, sirve como ejemplo de adaptacion de un modelo ASR abierto a poblaciones infrarrepresentadas con recursos limitados (10 epocas, lr 1e-4, precision bf16-mixed). Su alcance es deliberadamente acotado: 9 hablantes en test, grabaciones interiores de baja contaminacion acustica y un unico idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | CTC (Connectionist Temporal Classification) sobre encoder transformer, familia NVIDIA Parakeet |
| Parametros totales | aproximadamente 0,6 mil millones (heredados de nvidia/parakeet-ctc-0.6b) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos distribuidos en .nemo sin variantes cuantizadas publicadas) |
| Idiomas soportados | en (ingles) |
| Licencia | cc-by-4.0 |
| Formato de pesos | .nemo (best.nemo), libreria NeMo |

## Arquitectura y entrenamiento

El modelo es un ASR CTC puro construido sobre el checkpoint nvidia/parakeet-ctc-0.6b, de aproximadamente 600 millones de parametros. La cabeza CTC permite alineamientos monotonos sin decodificacion autorregresiva, lo que elimina la posibilidad de bucles de repeticion, un fallo tipico de los modelos seq2seq en habla disfluente. El autor no detalla la composicion interna del encoder ni el preentrenamiento original, que corresponden a NVIDIA y no se documentan en esta ficha.

El fine-tuning se realizo exclusivamente sobre la particion de train del dataset cdli/rwandan_english_nonstandard_speech_v1.0, con la particion dev usada para seleccion de checkpoint y test puntuada una sola vez tras el entrenamiento; la particion `extra` no se utilizo y ningun hablante aparece en mas de una particion. Se entrenaron hasta 10 epocas con early stopping sobre WER de dev (paciencia de 3 evaluaciones), semilla 2, learning rate 1e-4 y precision bf16-mixed. El codigo corresponde a `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto (experimento `parakeet-ctc-en-ft-10ep-s2`). Las grabaciones se hicieron en Ruanda en 2026, en interiores con bajo ruido, mediante una app de tableta, a partir de estimulos de imagen (descripcion libre) y de texto (lectura de frases).

## Capacidades

- Transcripcion de voz a texto en ingles con salida CTC (greedy decoding), pensada para procesar una grabacion cada vez.
- Reconocimiento de habla no estandar, especificamente habla tartamuda con repeticiones transcitas de forma verbatim en los targets.
- Robustez frente a bucles de repeticion: al ser CTC, no puede generar el modo de fallo de repeticion infinita documentado en modelos autorregresivos.
- Manejo de dos modalidades de elicitacion: lectura de frases y descripcion libre a partir de imagenes.
- No dispone de tool calling, function calling, capacidades de agente, vision, audio de entrada mas alla del propio ASR ni modo de razonamiento extendido.
- Capacidad multilingue limitada al ingles; no se documenta soporte de code-switching.

## Casos de uso

- Investigacion en ASR inclusivo: el modelo sirve como linea base reproducible para medir WER y CER sobre habla tartamuda en ingles ruandes, con particiones dev y test separadas por hablante y semilla fija.
- Prototipado de subtitulado para personas que tartamudean: al no entrar en bucles, es adecuado para transcribir grabaciones de descripcion libre donde un modelo seq2seq podria degradarse; conviene validar el resultado con el hablante antes de actuar sobre el.
- Evaluacion comparativa de tecnicas de fine-tuning: con 10 epocas, lr 1e-4 y bf16-mixed documentados, permite reproducir el experimento y comparar variantes de entrenamiento sobre el mismo dataset.
- Sistemas de bajo coste en contextos con recursos limitados: el tamano de 0,6 B y la inferencia CTC son compatibles con despliegues modestos, alineados con el objetivo del Rwanda Innovation Sprint.
- Generacion de transcripciones verbatim para analisis linguistico de disfluencias: las repeticiones se escriben en los transcripts, lo que facilita estudiar su frecuencia, aunque bloqueos y prolongaciones no son visibles en texto.
- Docencia y divulgacion sobre ASR no estandar: sirve como ejemplo practico de adaptacion de un modelo abierto a una poblacion infrarrepresentada, con metricas y limitaciones explicitas.

## Benchmarks y rendimiento

Resultados publicados por el autor con decodificacion greedy, una grabacion cada vez y normalizador de texto basico de Whisper. El WER agrupado cuenta todas las palabras juntas; el WER y CER por enunciado son medias sobre grabaciones (cada una limitada al 100 %).

| Particion | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 25,4 | 16,5 | 27,5 | 17,8 | 0 |
| dev (6 hablantes) | 33,1 | 22,6 | 31,6 | 21,2 | 0 |

El autor advierte que, con solo 9 hablantes en test, las diferencias inferiores a unos 3 puntos de WER entre dos modelos no pueden confirmarse. No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; por el tamano del checkpoint (0,6 B de parametros, repo de 2,4 GB), es esperable que quepa en GPUs de consumo, pero no se confirma con datos del autor.
- GPU recomendadas: no disponible; no se documentan pruebas en A100, H100, RTX 4090 ni otras.
- Compatibilidad con GPU de consumo: no confirmada explicitamente; el tamano del modelo sugiere que es viable, pero debe validarse.
- Opciones de despliegue: NeMo (libreria declarada, pesos en .nemo). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a un modelo CTC de ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| parakeet-ctc-en-ft-10ep-s2 | ~0,6 B | no disponible | WER test 25,4 % (agrupado), CER 16,5 % | cc-by-4.0 | Hugging Face, formato .nemo |
| nvidia/parakeet-ctc-0.6b (base) | ~0,6 B | no disponible | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Whisper (familia, referencia del normalizador) | no disponible | no disponible | no disponible en esta ficha | no disponible en esta ficha | no disponible |

No se dispone de datos de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no es posible una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes en test, en su mayoria hombres adultos jovenes, grabaciones interiores silenciosas, habla leida y descrita por imagenes, no conversacional. El rendimiento en ninos, otras discapacidades, entornos ruidosos, audio telefonico o habla con code-switching es desconocido.
- Targets verbatim: las repeticiones de la tartamudez se escriben en los transcripts y el modelo puede o no reproducirlas; los bloqueos y prolongaciones no son visibles en texto.
- Sesgo hacia estimulos de texto: las frases leidas tambien aparecen en los transcripts de train, por lo que los resultados con estimulos de imagen son la mejor guia para habla abierta.
- Prohibido para decisiones sobre personas: no debe usarse para diagnosticar o evaluar ninguna condicion del habla, identificar hablantes ni en decisiones clinicas, legales o policiales. Los terminos de CDLI prohiben reidentificar hablantes y construir voces que imiten a una persona.
- Riesgo de alteracion de significado: una transcripcion erronea puede cambiar lo que dijo la persona; debe mostrarse el texto al hablante antes de actuar sobre el.
- Licencia CC BY 4.0: permite uso comercial con atribucion, pero las restricciones de los terminos del dataset CDLI (acceso restringido, prohibicion de reidentificacion y de sintesis de voz) condicionan el uso derivado.
- Dataset no incluido en el repositorio y no redistribuible desde el; el acceso esta restringido y requiere aceptar los terminos de CDLI.
- Sin datos publicados de cuantizacion, latencia ni despliegue en produccion; el autor no documenta pruebas fuera del entorno de evaluacion descrito.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/parakeet-ctc-en-ft-10ep-s2
- Modelo base: https://huggingface.co/nvidia/parakeet-ctc-0.6b
- Dataset: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- Centre for Digital Language Inclusion (UCL): no disponible como enlace en la informacion proporcionada
- Codigo del proyecto (`scripts/molab/run_experiments.py`, `experiments/finetune.yaml`): no disponible como enlace en la informacion proporcionada
