# oluwagbotty/fastconformer-ctc-en-ft-10ep

## Resumen

fastconformer-ctc-en-ft-10ep es un modelo de reconocimiento automatico del habla (ASR) en ingles, desarrollado por el usuario oluwagbotty, que consiste en un ajuste fino de nvidia/stt_en_fastconformer_ctc_large sobre el split de entrenamiento del dataset CDLI Rwandan English Non-Standard Speech v1.0. Este dataset contiene grabaciones de hablantes de ingles ruandes, en su mayoria adultos jovenes que tartamudean, por lo que el modelo esta orientado especificamente a la transcripcion de habla no estandar. El proyecto se enmarca en el Rwanda Innovation Sprint del Centre for Digital Language Inclusion (UCL), con financiacion del programa AT2030 y apoyo de Google.org.

Arquitectonicamente se trata de un FastConformer con cabecera CTC, una variante del transformer de Conformer que incorpora atencion con convoluciones depthwise y submuestreo de la senal de entrada, con aproximadamente 115 millones de parametros en su version large. El modelo trabaja exclusivamente con audio en ingles y produce transcripciones en minusculas, sin soporte multilingue ni capacidades multimodales.

Su relevancia radica en abordar un caso de uso poco cubierto por los modelos ASR comerciales: el habla con disfluencias y tartamudeo, donde los sistemas convencionales suelen degradarse notablemente. El modelo alcanza un WER agrupado del 26,6 % en el split de test (9 hablantes) y del 33,0 % en dev (6 hablantes), con cero bucles de repeticion, un fallo tipico de los modelos basados en decodificacion autorregresiva como Whisper.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer con cabecera CTC (transformer con convoluciones depthwise) |
| Parametros totales | aproximadamente 115M (heredados del modelo base nvidia/stt_en_fastconformer_ctc_large) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | cc-by-4.0 |
| Formato de pesos | .nemo (NeMo) |

## Arquitectura y entrenamiento

El modelo parte de nvidia/stt_en_fastconformer_ctc_large, un FastConformer-CTC de tipo large con unos 115 millones de parametros que transcribe habla en ingles en alfabeto minusculas. FastConformer es una evolucion del Conformer que reduce el coste computacional mediante submuestreo de la secuencia de entrada y atencion con convoluciones depthwise, manteniendo la capacidad de modelar dependencias locales y globales. La cabecera CTC permite decodificacion greedy sin necesidad de un decodificador autorregresivo, lo que evita el modo de fallo de bucles repetitivos que afecta a modelos seq2seq como Whisper.

El ajuste fino se realizo exclusivamente sobre el split de train del dataset CDLI Rwandan English Non-Standard Speech v1.0, con el split de dev usado para seleccionar el checkpoint y el split de test puntuado una unica vez tras el entrenamiento. No se uso el split `extra` y ningun hablante aparece en mas de un split. El entrenamiento duro hasta 10 epocas con early stopping sobre WER de dev (paciencia de 3 evaluaciones), semilla 42, learning rate 1e-4 y precision bf16-mixed. El codigo de entrenamiento corresponde al experimento `fastconformer-ctc-en-ft-10ep` de los scripts `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto.

## Capacidades

- Reconocimiento automatico del habla en ingles con salida en minusculas.
- Transcripcion de habla no estandar, especificamente habla con tartamudeo (repeticiones, bloqueos y prolongaciones).
- Decodificacion CTC greedy, sin bucles de repeticion en la salida.
- Funcionamiento con grabaciones de baja latencia y ruido reducido (condiciones de interiores).
- Soporte de habla leida (frases de texto) y descripcion libre a partir de imagenes.
- No dispone de tool calling, function calling, agentes, vision, audio multimodal ni modo de razonamiento explicito.
- No soporta traduccion, resumen ni generacion de texto mas alla de la transcripcion.

## Casos de uso

- Transcripcion de habla con tartamudeo en entornos clinicos o de investigacion: el modelo esta ajustado sobre habla de personas que tartamudean, por lo que puede transcribir sesiones grabadas en interiores con bajo ruido, siempre que el texto se revise antes de tomar decisiones.
- Accesibilidad en aplicaciones de dictado: integrado en un teclado o app de voz para personas que tartamudean, aprovechando que la decodificacion CTC no genera bucles y produce salidas mas estables que modelos seq2seq.
- Investigacion en ASR para habla no estandar: sirve como punto de partida para experimentos sobre disfluencias, comparando WER agrupado y por emision frente a modelos base.
- Transcripcion de entrevistas o cuestionarios en ingles ruandes: util para proyectos de recogida de datos en Rwanda con hablantes jovenes y condiciones controladas de grabacion.
- Evaluacion de tecnicas de normalizacion de texto ASR: el modelo permite medir el impacto de distintas normalizaciones (por ejemplo, la de Whisper) sobre WER y CER en habla no estandar.
- Prototipado de pipelines ASR de bajo coste: al ser un modelo de 115M de parametros, puede desplegarse en hardware modesto para pruebas de concepto en contextos con recursos limitados.
- Analisis de disfluencias a nivel de transcripcion: dado que las repeticiones se escriben literalmente en los transcripts de entrenamiento, el modelo puede emplearse para estudiar como se representan las repeticiones en texto.

## Benchmarks y rendimiento

Resultados reportados por el autor con decodificacion greedy, una grabacion a la vez, y puntuados con el normalizador basico de texto de Whisper. El WER agrupado cuenta todas las palabras juntas; el WER y CER por emision son medias sobre grabaciones (cada una limitada al 100 %). Loops se refiere a grabaciones cuya salida se repite.

| Split | WER agrupado (%) | CER (%) | WER por emision (%) | CER por emision (%) | Loops |
|---|---|---|---|---|---|
| test (9 hablantes) | 26,6 | 17,0 | 29,3 | 18,7 | 0 |
| dev (6 hablantes) | 33,0 | 22,4 | 32,0 | 21,2 | 0 |

El autor advierte que, con solo 9 hablantes de test, no pueden confirmarse diferencias inferiores a unos 3 puntos de WER entre dos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, un modelo de 115M de parametros en precision FP16 ocupa aproximadamente 0,23 GB de pesos, por lo que la VRAM necesaria sera baja.
- GPU recomendadas: no disponible. Por tamano, cualquier GPU con al menos 2-4 GB de VRAM deberia ser suficiente.
- Cabe en GPU de consumo: previsiblemente si, en practicamente cualquier GPU consumer moderna, aunque no se especifica en la informacion disponible.
- Opciones de despliegue: NeMo (formato .nemo). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo ASR.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER en habla no estandar | Licencia | Formato |
|---|---|---|---|---|---|
| oluwagbotty/fastconformer-ctc-en-ft-10ep | aproximadamente 115M | no disponible | 26,6 % (test agrupado) | cc-by-4.0 | .nemo |
| nvidia/stt_en_fastconformer_ctc_large | aproximadamente 115M | no disponible | no disponible | no disponible | .nemo |
| Whisper (referencia de normalizacion) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos de otros modelos sobre el mismo dataset en la informacion proporcionada.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes de test, en su mayoria hombres adultos jovenes, grabaciones en interiores silenciosos, habla leida y descrita por imagenes, no conversacional. El rendimiento en ninos, otras discapacidades, entornos ruidosos, audio telefonico o habla con cambio de codigo es desconocido.
- Objetivos verbatim: las repeticiones del tartamudeo se escriben en los transcripts y los modelos entrenados con ellos pueden o no reproducirlas; los bloqueos y prolongaciones no son visibles en texto.
- Los prompts de texto son mas faciles: las frases leidas tambien aparecen en los transcripts de train, por lo que los resultados con prompts de imagen son la mejor guia para habla abierta.
- No usar para decisiones sobre personas: no debe emplearse para diagnosticar o evaluar ninguna condicion del habla, identificar hablantes ni en decisiones clinicas, legales o de aplicacion de la ley. Los terminos de CDLI prohiben reidentificar hablantes y construir voces que imiten a un hablante.
- Riesgo de transcripcion erronea: una transcripcion incorrecta puede cambiar el significado de lo que dijo una persona; debe mostrarse el texto al hablante antes de actuar sobre el.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero los terminos del dataset CDLI anaden restricciones sobre reidentificacion y sintesis de voz.
- El dataset de entrenamiento no se incluye en el repositorio y su acceso esta restringido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/fastconformer-ctc-en-ft-10ep
- Modelo base: https://huggingface.co/nvidia/stt_en_fastconformer_ctc_large
- Dataset: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- Documentacion de NeMo: no disponible como enlace directo en la informacion proporcionada
- Paper o blog del proyecto: no disponible en la informacion proporcionada
- Repositorio de codigo del proyecto: no disponible como URL en la informacion proporcionada
