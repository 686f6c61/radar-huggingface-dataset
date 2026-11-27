# mohiitm11011/whisper-small-hi-disfluency

## Resumen

`mohiitm11011/whisper-small-hi-disfluency` es un modelo de reconocimiento automatico del habla (ASR) publicado en Hugging Face por el usuario `mohiitm11011`. Se trata de un ajuste fino (fine-tuning) del conocido modelo Whisper Small de OpenAI, orientado, segun se deduce del identificador, al idioma hindi ("hi") y al tratamiento de disfluencias en el habla. El modelo cuenta con 241.734.912 parametros (aproximadamente 242 millones) en formato safetensors y un repositorio de 1,0 GB.

La relevancia de este modelo radica en su especializacion: frente a un Whisper Small generico, un ajuste orientado a disfluencias busca manejar de forma mas robusta las pausas, repeticiones, muletillas y correcciones propias del habla espontanea, un problema recurrente cuando se transcriben conversaciones reales en lugar de audio leido. El identificador del modelo sugiere ademas una orientacion al hindi, aunque la model card no lo confirma explicitamente.

Conviene senalar que la model card es la plantilla autogenerada por Hugging Face y no contiene informacion sustantiva: no hay datos sobre datos de entrenamiento, licencia, idiomas oficiales, evaluacion ni uso previsto. Por tanto, esta ficha se basa en los metadatos del repositorio, en la arquitectura conocida de Whisper Small y en las inferencias razonables a partir del nombre del modelo, indicando explicitamente cuando un dato no esta disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (familia Whisper de OpenAI) |
| Parametros totales | 241.734.912 (~242 M) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (Whisper Small opera sobre ventanas de audio de 30 segundos; el dato no se confirma en la model card) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/ONNX) |
| Idiomas soportados | no disponible oficialmente; el identificador "hi" sugiere hindi |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Libreria | transformers |
| Pipeline | automatic-speech-recognition |
| Tamano del repositorio | 1,0 GB |
| Compatibilidad | endpoints_compatible |

## Arquitectura y entrenamiento

El modelo pertenece a la familia Whisper, una arquitectura transformer encoder-decoder disenada para reconocimiento automatico del habla a partir de espectrogramas log-Mel. Whisper Small es la variante intermedia de la familia original de OpenAI, con aproximadamente 244 millones de parametros, y procesa audio en ventanas de 30 segundos. El modelo base esta descrito en el paper de referencia citado en los tags del repositorio (arXiv:1910.09700), aunque conviene precisar que ese identificador corresponde al articulo sobre el impacto ambiental del aprendizaje automatico (Lacoste et al., 2019) que aparece en la plantilla de la model card, y no al paper original de Whisper.

No se dispone de informacion sobre el proceso de ajuste fino: no se documentan el conjunto de datos utilizado, el numero de horas de audio, la composicion del corpus, si se aplico alguna tecnica de aumento de datos o si se realizo un proceso de limpieza especifico de disfluencias. Tampoco se detallan hiperparametros de entrenamiento ni la estrategia de evaluacion. El nombre del modelo sugiere un entrenamiento orientado a transcripciones con disfluencias en hindi, pero esta afirmacion no puede confirmarse con la informacion disponible.

## Capacidades

- Transcripcion de voz a texto (ASR) en el idioma o idiomas para los que fue ajustado, presumiblemente hindi.
- Manejo de habla espontanea con disfluencias (pausas, repeticiones y muletillas), segun indica el identificador del modelo.
- Integracion con la libreria `transformers` mediante el pipeline `automatic-speech-recognition`.
- Compatibilidad con endpoints de Hugging Face (`endpoints_compatible`).
- No se documentan capacidades de traduccion, deteccion de idioma, marcas de tiempo a nivel de palabra, tool calling ni agentes.
- No se documentan capacidades multimodales mas alla del audio de entrada y texto de salida.

## Casos de uso

- Transcripcion de entrevistas y conversaciones: el ajuste orientado a disfluencias lo hace adecuado para audio espontaneo donde los hablantes dudan, se repiten o corrigen, un escenario habitual en investigacion cualitativa y periodismo.
- Subtitulado de contenido informal en hindi: podcasts, videos divulgativos o retransmisiones donde el habla no es leida y abundan las muletillas.
- Generacion de actas de reuniones: transcripcion de reuniones en hindi para su posterior resumen, aprovechando la tolerancia a pausas y correcciones.
- Sistemas de accesibilidad: conversion de voz a texto para personas con dificultades auditivas en contextos de habla natural.
- Preprocesado para pipelines de NLP: obtencion de transcripciones que conservan o normalizan disfluencias como paso previo a tareas de analisis de sentimiento o extraccion de informacion.
- Prototipado rapido en entornos de investigacion: al ser un modelo pequeno (~242 M de parametros) y compatible con `transformers`, permite iterar con recursos modestos en experimentos de ASR en hindi.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 1 GB de pesos (242 M de parametros x 4 bytes); en FP16, en torno a 0,5 GB. El consumo real sera mayor por las activaciones y el procesamiento de audio, pero el modelo es muy ligero.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas RTX 3060, RTX 4060 o superiores; tambien funciona en CPU para cargas de trabajo moderadas.
- Cabe en GPU consumer: si, con amplia holgura, incluso en GPUs con 4-6 GB de VRAM.
- Opciones de despliegue: `transformers` (pipeline de ASR), servidores de inferencia compatibles con modelos de Hugging Face y endpoints de Hugging Face. No se documentan variantes GGUF para llama.cpp ni soporte explicito de vLLM o TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mohiitm11011/whisper-small-hi-disfluency | ~242 M | ventanas de 30 s (arquitectura Whisper) | no disponible (presumiblemente hindi) | no disponible | Hugging Face |
| openai/whisper-small | ~244 M | ventanas de 30 s | multilingue (99 idiomas) | MIT (modelo original) | Hugging Face, OpenAI |
| openai/whisper-base | ~74 M | ventanas de 30 s | multilingue | MIT | Hugging Face, OpenAI |
| openai/whisper-medium | ~769 M | ventanas de 30 s | multilingue | MIT | Hugging Face, OpenAI |

La comparativa se limita a la familia Whisper porque no se dispone de informacion sobre modelos especificos de ASR en hindi con tratamiento de disfluencias en la informacion proporcionada. El modelo aqui descrito se distingue por su ajuste especifico, pero carece de la documentacion de evaluacion y licencia que si acompanan a los modelos oficiales de OpenAI.

## Limitaciones y advertencias

- La model card es la plantilla autogenerada y no contiene informacion sobre sesgos, riesgos, datos de entrenamiento ni evaluacion; no es posible valorar su calidad de forma documentada.
- Licencia no disponible: no puede asumirse su uso comercial sin consultar al autor del repositorio.
- Idiomas soportados no confirmados oficialmente; el identificador sugiere hindi, pero no hay validacion publica.
- Riesgo de alucinacion y de errores de transcripcion inherente a los modelos Whisper, especialmente en audio con ruido, acentos marcados o vocabulario especializado.
- No se documentan sesgos conocidos; al ser un ajuste no evaluado publicamente, se desconoce su comportamiento en subgrupos de hablantes.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.
- Al ser un modelo de ~242 M de parametros, su precision sera inferior a la de variantes mayores de Whisper en condiciones dificiles.
- No se documentan limitaciones de contexto mas alla de las propias de Whisper (ventanas de 30 segundos).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mohiitm11011/whisper-small-hi-disfluency
- Paper de referencia citado en los tags (Lacoste et al., 2019, sobre impacto ambiental): https://arxiv.org/abs/1910.09700
- Repositorio de Whisper de OpenAI: https://github.com/openai/whisper
- Modelo base Whisper Small: https://huggingface.co/openai/whisper-small
- Documentacion de Whisper en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
- Calculadora de impacto ambiental ML: https://mlco2.github.io/impact
