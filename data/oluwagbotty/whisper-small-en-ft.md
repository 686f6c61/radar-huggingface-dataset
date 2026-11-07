# oluwagbotty/whisper-small-en-ft

## Resumen

whisper-small-en-ft es un ajuste fino de openai/whisper-small, el modelo de reconocimiento automatico del habla (ASR) de OpenAI de aproximadamente 0,2 mil millones de parametros, especializado en ingles con acento ruandes y habla con tartamudeo. Lo desarrolla el usuario oluwagbotty en el marco de un proyecto de investigacion del Rwanda Innovation Sprint, impulsado por el Centre for Digital Language Inclusion (CDLI) de la UCL, con financiacion del programa AT2030 (UK International Development) y apoyo de Google.org. El objetivo es disponer de un sistema de bajo coste que transcriba con precision el habla no estandar de personas que tartamudean, un colectivo habitualmente mal cubierto por los corpus de ASR convencionales.

El modelo conserva la arquitectura encoder-decoder transformer de Whisper y se ha entrenado sobre el split de entrenamiento del dataset CDLI Rwandan English Non-Standard Speech v1.0, compuesto mayoritariamente por adultos jovenes que tartamudean, grabado en interiores silenciosos con una aplicacion de tableta a partir de descripciones de imagenes y frases leidas. Los pesos se distribuyen en formato safetensors dentro de la carpeta `best/`, con licencia Apache 2.0 y un tamano de repositorio de 1,0 GB.

Su relevancia radica en que aborda un caso de habla no estandar poco representado: reporta un WER agrupado del 26,0 % y un CER del 17,5 % en el split de test (9 hablantes), sin bucles de repeticion, un fallo tipico de Whisper. No obstante, el alcance es deliberadamente acotado a un contexto de investigacion y el propio autor advierte de que no debe emplearse para diagnosticar ni evaluar condiciones del habla.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper, openai/whisper-small) |
| Parametros totales | aproximadamente 0,2 mil millones (modelo base whisper-small) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 segundos propia de Whisper) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion no documentada) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (carpeta `best/`) |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-small, un transformer encoder-decoder disenado para ASR que procesa audio en ventanas de 30 segundos y genera texto de forma autorregresiva. El ajuste fino se realizo exclusivamente sobre el split de entrenamiento del dataset cdli/rwandan_english_nonstandard_speech_v1.0, con el split de desarrollo empleado para seleccionar el checkpoint y el de test puntuado una unica vez tras el entrenamiento; el split `extra` no se utilizo y ningun hablante aparece en mas de un split, lo que evita fuga de datos entre particiones.

Los hiperparametros documentados son hasta 5 epocas con parada temprana sobre el WER de desarrollo (paciencia de 3 evaluaciones), semilla 42, learning rate de 1e-5 y batch de 16. El codigo de entrenamiento se encuentra en `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto (experimento `whisper-small-en-ft`). Las grabaciones se hicieron en Ruanda en 2026, en interiores con bajo ruido, mediante una aplicacion de tableta y a partir de estimulos de imagen (descripciones libres) y de texto (frases leidas). No se documenta el uso de RLHF ni de DPO.

## Capacidades

- Reconocimiento automatico del habla en ingles, con enfasis en habla no estandar y tartamudeo.
- Transcripcion de audio grabado en condiciones de interior con bajo ruido.
- Manejo de habla leida y de descripciones libres a partir de imagenes.
- Generacion de transcripciones literales que pueden incluir repeticiones propias del tartamudeo, segun como aparezcan en los targets de entrenamiento.
- Decodificacion greedy sobre una grabacion cada vez, tal como se evaluo.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio adicional ni modo de pensamiento.
- Capacidad multilingue limitada al ingles.

## Casos de uso

- Investigacion en ASR para habla no estandar: sirve como punto de partida y referencia para estudiar como se comportan los modelos Whisper con tartamudeo, comparando WER y CER frente a variantes base.
- Prototipos de accesibilidad para personas que tartamudean: el modelo puede transcribir grabaciones de voz en aplicaciones de apoyo, siempre mostrando el texto al hablante antes de actuar sobre el.
- Transcripcion de frases leidas en ingles con acento ruandes: util en entornos educativos o de documentacion linguistica donde se leen textos en voz alta en condiciones controladas.
- Descripcion de imagenes por voz: el modelo se entreno tambien con descripciones libres de imagenes, por lo que puede emplearse en tareas de anotacion o transcripcion de descripciones visuales.
- Evaluacion comparativa de tecnicas de ajuste fino: el repositorio documenta hiperparametros y particiones, lo que facilita reproducir experimentos y comparar estrategias de entrenamiento.
- Generacion de subtitulos en entornos silenciosos: para grabaciones de laboratorio o de aula con audio limpio y hablantes adultos, donde el modelo ofrece un WER agrupado del 26,0 % en test.
- Base para posteriores ajustes: al estar bajo licencia Apache 2.0 y en formato transformers, puede reentrenarse con otros corpus de habla no estandar o con datos adicionales.

## Benchmarks y rendimiento

Resultados reportados por el autor con decodificacion greedy, una grabacion cada vez y el normalizador de texto basico de Whisper. El WER agrupado cuenta todas las palabras juntas; el WER y el CER por enunciado son medias sobre grabaciones (cada una limitada al 100 %). Los bucles son grabaciones cuya salida se repite.

| Split | WER agrupado (%) | CER (%) | WER por enunciado (%) | CER por enunciado (%) | Bucles |
|---|---|---|---|---|---|
| test (9 hablantes) | 26,0 | 17,5 | 27,4 | 18,7 | 0 |
| dev (6 hablantes) | 33,7 | 23,8 | 32,0 | 22,6 | 0 |

El autor advierte de que, con solo 9 hablantes en test, no pueden confirmarse diferencias inferiores a unos 3 puntos de WER entre dos modelos. No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con aproximadamente 0,2 mil millones de parametros, el modelo es muy ligero y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: no documentadas por el autor; por tamano, cualquier GPU consumer reciente (por ejemplo, RTX 3060 o superior) deberia ser suficiente, aunque no se aportan medidas concretas.
- Cabe en GPU consumer: si, por el reducido numero de parametros, aunque no se especifican requisitos oficiales.
- Opciones de despliegue: transformers (libreria indicada en la model card); otras opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| oluwagbotty/whisper-small-en-ft | aproximadamente 0,2 B | no disponible (ventana de audio de 30 s) | en | Apache 2.0 | Hugging Face |
| openai/whisper-small | aproximadamente 0,2 B | no disponible (ventana de audio de 30 s) | multilingue | Apache 2.0 | Hugging Face |
| openai/whisper-small.en | aproximadamente 0,2 B | no disponible (ventana de audio de 30 s) | en | Apache 2.0 | Hugging Face |

El modelo ajustado comparte arquitectura y tamano con whisper-small y whisper-small.en, pero se especializa en habla no estandar de hablantes ruandeses que tartamudean. No se dispone de resultados de benchmarks de los modelos base en la informacion proporcionada, por lo que no es posible comparar rendimiento numerico entre ellos.

## Limitaciones y advertencias

- Pocos hablantes y condiciones estrechas: 9 hablantes en test, mayoritariamente hombres adultos jovenes, grabaciones en interiores silenciosos y habla leida o descrita a partir de imagenes, no conversacional. El rendimiento con ninos, otras discapacidades, entornos ruidosos, audio telefonico o habla con cambio de codigo es desconocido.
- Targets literales: las repeticiones del tartamudeo aparecen escritas en las transcripciones, y los modelos entrenados con ellas pueden reproducirlas o no; los bloqueos y prolongaciones no son visibles en el texto.
- Los estimulos de texto son mas faciles: las frases leidas tambien aparecen en las transcripciones de entrenamiento, por lo que los resultados con estimulos de imagen son la mejor guia para habla abierta.
- No debe usarse para tomar decisiones sobre personas: prohibido para diagnosticar o evaluar cualquier condicion del habla, identificar hablantes o en decisiones clinicas, legales o de aplicacion de la ley. Los terminos de CDLI prohiben reidentificar hablantes y crear voces que imiten a una persona.
- Riesgo de transcripciones erroneas que cambien el significado de lo dicho: debe mostrarse el texto al hablante antes de actuar sobre el.
- Riesgo de alucinacion y de bucles de repeticion, un modo de fallo conocido de Whisper; en la evaluacion reportada no se observaron bucles, pero el riesgo persiste en otras condiciones.
- Acceso a los datos restringido: el dataset no se incluye en el repositorio y su acceso esta condicionado a la aceptacion de los terminos de CDLI.
- Licencia Apache 2.0 para los pesos, con las restricciones adicionales de uso de los datos de CDLI indicadas por el autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/oluwagbotty/whisper-small-en-ft
- Modelo base openai/whisper-small: https://huggingface.co/openai/whisper-small
- Modelo openai/whisper-small.en: https://huggingface.co/openai/whisper-small.en
- Dataset CDLI Rwandan English Non-Standard Speech v1.0: https://huggingface.co/datasets/cdli/rwandan_english_nonstandard_speech_v1.0
- Codigo de entrenamiento: `scripts/molab/run_experiments.py` y `experiments/finetune.yaml` del repositorio del proyecto (no se proporciona URL en la informacion disponible)
