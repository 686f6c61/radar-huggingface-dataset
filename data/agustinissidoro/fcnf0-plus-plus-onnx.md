# agustinissidoro/fcnf0-plus-plus-onnx

## Resumen

FCNF0++ es un estimador neuronal de pitch (F0) y periodicidad desarrollado por el Interactive Audio Lab de la Universidad Northwestern (Morrison, Hsieh, Pruyne y Pardo), presentado en el articulo *Cross-domain Neural Pitch and Periodicity Estimation* (2023) y distribuido como parte del ecosistema PENN. El modelo resuelve la deteccion de frecuencia fundamental en senales de audio monofonico, una tarea basica en analisis musical, procesamiento de voz y entrenamiento de sistemas de sintesis.

Este repositorio concreto, `agustinissidoro/fcnf0-plus-plus-onnx`, es una conversion no oficial del modelo original `maxrmorrison/fcnf0-plus-plus` al formato ONNX (opset 18, float32). Los pesos de la red no se han modificado: la conversion incorpora dentro del grafo la logica de decodificacion de PENN, es decir, la seleccion del bin de pitch mas probable entre 1440 bins (de 5 cents cada uno, desde 31 Hz) refinada por el valor esperado de los 19 bins vecinos, junto con el calculo de periodicidad basado en entropia. El decodificador Viterbi por defecto de PENN no esta incluido.

La relevancia de esta ficha es doble: por un lado, documenta un modelo de referencia para estimacion de F0 con una arquitectura compacta y entrenada de forma cross-domain; por otro, describe una conversion ONNX orientada a despliegue ligero en pipelines de audio (por ejemplo, mediante `onnxruntime`) sin dependencia de PyTorch. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0.0 GB, lo que sugiere que el archivo de pesos no esta disponible publicamente o es de tamano despreciable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal convolucional (FCNF0++, segun el paper de PENN); detalles exactos de capas no disponibles en la informacion proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio); ventana de entrada fija de 1024 muestras a 8000 Hz |
| Tipos de cuantizacion | float32 (exportacion ONNX); no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible (modelo de audio, independiente del idioma) |
| Licencia | MIT |
| Formato de pesos | ONNX (opset 18, float32); archivo `onnx/pitch_model.onnx` |
| Frecuencia de muestreo de entrada | 8000 Hz, mono, ventanas de 1024 muestras |
| Rango de pitch | 31 Hz a 1984 Hz |
| Resolucion de bins | 1440 bins de 5 cents |
| Salidas | `pitch` (Hz) y `periodicity` (0..1) |

## Arquitectura y entrenamiento

La informacion disponible indica que FCNF0++ es la red de estimacion de pitch y periodicidad de PENN, descrita en el paper *Cross-domain Neural Pitch and Periodicity Estimation* (arXiv:2301.12258). El nombre sugiere una red totalmente convolucional (FCN, fully convolutional network), pero la informacion proporcionada no detalla el numero de capas, canales, funciones de activacion ni el esquema exacto de entrenamiento. Tampoco se especifican el numero de tokens de audio, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO (no aplicables a este tipo de modelo).

La innovacion tecnica destacable de esta conversion es que la decodificacion de PENN se ha integrado dentro del grafo ONNX: el modelo devuelve directamente el bin de pitch mas probable (argmax sobre 1440 bins) refinado mediante el valor esperado local de los 19 bins circundantes, junto con la periodicidad estimada a partir de entropia. La conversion se valido contra la misma red en PyTorch (penn 1.0.0, fcnf0++) obteniendo diferencias de 0.01 cents en pitch y 1e-4 en periodicidad sobre tonos, barridos, ruido y silencio. El decodificador Viterbi por defecto de PENN no esta incluido en el grafo.

## Capacidades

- Estimacion de frecuencia fundamental (F0) en senales de audio monofonico, con salida en Hz.
- Estimacion de periodicidad por ventana, con valores entre 0 y 1; valores bajos indican ausencia de pitch.
- Funcionamiento cross-domain: el modelo original esta disenado para trabajar sobre voz, musica e instrumentos, segun el enfoque del paper de PENN.
- Procesamiento ventana a ventana independiente: cualquier hop es valido, ya que la red evalua cada ventana de 1024 muestras de forma aislada.
- Exportacion ONNX que permite inferencia con `onnxruntime` sin PyTorch.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un modelo puramente de analisis de audio.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Analisis de entonacion en voz: extraer la curva de F0 de grabaciones de habla a 8 kHz para estudiar prosodia, entonacion o variaciones de tono en investigacion fonetica, aprovechando la resolucion de 5 cents por bin.
- Afinacion y correccion de pitch en produccion musical: detectar la frecuencia fundamental de pistas monofonicas (voz, instrumentos solistas) para alimentar herramientas de autotune o correccion tonal, usando la periodicidad como indicador de fiabilidad.
- Transcripcion melodica basica: convertir una melodia monofonica en una secuencia de notas MIDI a partir de la curva de pitch estimada, filtrando las ventanas con periodicidad baja.
- Preprocesado para sintesis de voz (TTS): generar contornos de F0 y etiquetas de sonoridad que alimenten modelos de sintesis o vocoders, con inferencia ligera via ONNX.
- Deteccion de voz y actividad sonora: usar la periodicidad como senal auxiliar para distinguir tramos sonoros de silencio o ruido en pipelines de segmentacion de audio.
- Despliegue en entornos con recursos limitados: al ser un modelo ONNX compacto y ejecutable con `onnxruntime`, puede integrarse en servicios de audio en contenedores ligeros o en el borde (edge), sin GPU dedicada.
- Analisis de cantos de animales o senales bioacusticas monofonicas: estimacion de F0 en grabaciones de campo muestreadas a 8 kHz para estudios de comportamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion numerica reportada es la comparacion de la conversion ONNX contra la implementacion en PyTorch: diferencias de 0.01 cents en pitch y 1e-4 en periodicidad sobre tonos, barridos, ruido y silencio. No se proporcionan metricas como MMLU, HumanEval o GSM8K (no aplicables) ni metricas especificas de estimacion de pitch (por ejemplo, error en cents sobre datasets de referencia).

## Requisitos de hardware

- VRAM estimada: no disponible con precision; al tratarse de un modelo convolucional de audio de tamano reducido y pesos float32, la huella de memoria es muy inferior a la de un LLM. El tamano del repositorio figura como 0.0 GB, por lo que no se puede estimar el numero de parametros a partir de esa cifra.
- GPU recomendadas: no se especifican; para inferencia por lotes de ventanas de 1024 muestras, cualquier GPU moderna (RTX 3060 en adelante) es sobradamente suficiente. Tambien es viable en CPU.
- Compatibilidad con GPU de consumo: si, previsiblemente en cualquier GPU de consumo con soporte CUDA o incluso en CPU, dado el caracter ligero del modelo.
- Opciones de despliegue: `onnxruntime` (CPU o GPU), integracion en pipelines Python; no se documentan soportes para vLLM, llama.cpp, Ollama o TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Salidas | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| fcnf0-plus-plus-onnx (este) | CNN de pitch (ONNX) | 1024 muestras a 8 kHz | pitch (Hz), periodicidad | MIT | ONNX opset 18 | Repositorio Hugging Face con 0 descargas |
| maxrmorrison/fcnf0-plus-plus | CNN de pitch (PyTorch) | Ventanas de audio | pitch, periodicidad | MIT (segun PENN) | PyTorch | Modelo base en Hugging Face |
| PENN (suite completa) | Suite de analisis de pitch | Audio a 8 kHz | pitch, periodicidad, decodificacion Viterbi | MIT | PyTorch | Repositorio GitHub `interactiveaudiolab/penn` |

No se dispone de informacion sobre otros estimadores de F0 comparables (por ejemplo, CREPE, pYIN o SWIPE) en la documentacion proporcionada, por lo que no se incluyen datos cuantitativos de comparacion.

## Limitaciones y advertencias

- Conversion no oficial: el modelo no esta hecho ni respaldado por los autores originales; todo el credito corresponde a Morrison, Hsieh, Pruyne y Pardo.
- El decodificador Viterbi por defecto de PENN no esta incluido en el grafo ONNX; solo se implementa el decodificador argmax con valor esperado local.
- La salida de pitch solo es significativa cuando la periodicidad es alta; en tramos con periodicidad baja el valor de pitch carece de sentido.
- Entrada restringida a audio mono a 8000 Hz con ventanas de 1024 muestras; no se documenta soporte para otras frecuencias de muestreo.
- Rango de pitch limitado a 31-1984 Hz; fuera de ese rango no hay estimacion valida.
- No se documentan sesgos especificos ni tasas de alucinacion (no aplica el concepto de alucinacion de texto), pero al ser un modelo cross-domain entrenado por los autores de PENN, su comportamiento puede degradarse en dominios alejados de los datos de entrenamiento originales, cuyo detalle no se especifica.
- Licencia MIT: permite uso comercial, pero se recomienda citar a los autores originales segun el BibTeX incluido en la model card.
- El repositorio figura con 0.0 GB de tamano y 0 descargas, lo que genera dudas sobre la disponibilidad efectiva del archivo `onnx/pitch_model.onnx`; conviene verificar su presencia antes de integrarlo en produccion.
- No se documentan limitaciones de idioma porque el modelo es independiente del idioma, pero tampoco se aportan evaluaciones por tipo de voz o instrumento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/agustinissidoro/fcnf0-plus-plus-onnx
- Modelo base: https://huggingface.co/maxrmorrison/fcnf0-plus-plus
- Paper: https://arxiv.org/abs/2301.12258
- Repositorio PENN: https://github.com/interactiveaudiolab/penn
- Script de conversion: https://github.com/agustinissidoro/bach-mcp/blob/main/py/bach_mcp/utilities/export_onnx.py
- Proyecto bach-mcp: https://github.com/agustinissidoro/bach-mcp
