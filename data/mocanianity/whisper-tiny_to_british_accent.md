# Mocanianity/whisper-tiny_to_british_accent

## Resumen

Whisper tiny British es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por el usuario Mocanianity, orientado al reconocimiento automatico del habla (ASR) en ingles britanico. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, disenada originalmente por OpenAI para transcripcion multilingue y traduccion de voz, y se ha reentrenado sobre un conjunto de datos etiquetado como British English para adaptar la salida al acento y las particularidades lexicas de esa variante.

Con 37,7 millones de parametros, se trata de la variante mas pequena de la familia Whisper, lo que lo situa en la gama ultra-ligera: su interes principal no es competir en precision con modelos grandes, sino ofrecer transcripcion de bajo coste computacional que pueda ejecutarse en CPU o en GPUs de gama baja, con un consumo de memoria minimo.

El modelo es relevante ahora como ejemplo de especializacion por variante dialectal sobre una base abierta y con licencia permisiva (Apache 2.0), lo que permite su uso comercial sin restricciones adicionales. No obstante, la informacion publicada por el autor es escasa: la model card es autogenerada y no detalla la composicion del dataset, el numero de horas de audio ni el proceso de evaluacion, por lo que debe considerarse un modelo experimental mas que un sistema listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atención multi-cabeza estandar, entrenado originalmente por OpenAI sobre audio y texto emparejados a gran escala. Whisper procesa la entrada como espectrogramas log-Mel de 80 canales sobre ventanas de 30 segundos y genera la transcripcion de forma autoregresiva. La variante tiny cuenta con 4 capas en encoder y 4 en decoder, con una dimension de modelo de 384 y 6 cabezas de atencion.

El ajuste fino se realizo con los hiperparametros declarados en la model card: learning rate de 1e-5, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW con betas (0.9, 0.999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. Se registran dos puntos de evaluacion: en el paso 1000 (epoch 0,99) la perdida de validacion fue 0,3013 con un WER de 15,17; en el paso 2000 (epoch 1,98) la perdida bajo a 0,2952 y el WER a 13,35. No se documenta el volumen de datos, la procedencia exacta del corpus British English ni si se aplicaron tecnicas de augmentacion o regularizacion adicionales.

## Capacidades

- Transcripcion de voz a texto (ASR) en ingles, con adaptacion al acento britanico.
- Generacion de transcripciones con marcas de tiempo a nivel de segmento (capacidad heredada de Whisper, aunque no verificada en este ajuste).
- Procesamiento de audio de hasta 30 segundos por ventana, con posibilidad de encadenar ventanas para audios mas largos mediante pipelines de transformers.
- Soporte de inferencia por lotes a traves del pipeline `automatic-speech-recognition`.
- Capacidad multilingue limitada: el ajuste se ha realizado solo sobre ingles, por lo que el resto de idiomas originales de Whisper pueden degradarse.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (no aplicables a un modelo ASR).

## Casos de uso

- Transcripcion de reuniones y entrevistas en ingles britanico: el modelo puede procesar grabaciones divididas en ventanas de 30 segundos y generar texto con bajo coste computacional, adecuado para entornos donde no se dispone de GPU dedicada.
- Subtitulado automatico de contenido audiovisual con acento britanico: util para creadores o medios que necesiten una primera pasada de transcripcion y posterior revision humana, dado su WER moderado.
- Prototipado rapido de asistentes de voz: al ser un modelo de 37,7 M de parametros, permite iterar en local sobre pipelines de ASR antes de escalar a modelos mayores.
- Investigacion sobre adaptacion dialectal: sirve como punto de partida para estudiar como el fine-tuning sobre una variante concreta del ingles afecta al WER respecto al modelo base.
- Sistemas embebidos o de borde: su tamano reducido (repo de 0,3 GB) permite desplegarlo en dispositivos con recursos limitados para tareas de dictado o comandos de voz.
- Preprocesamiento de datos de audio para pipelines de NLP: transcripcion masiva de corpus de habla britanica para alimentar sistemas de analisis de sentimiento, resumen o busqueda sobre audio.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Modelo | Dataset | Metrica | Valor |
|---|---|---|---|
| Whisper tiny British | British English (split test) | WER | 13,3453 |
| Whisper tiny British (paso 1000) | Validacion | WER | 15,1708 |
| Whisper tiny British (paso 2000) | Validacion | WER | 13,3453 |
| Whisper tiny British (paso 2000) | Validacion | Loss | 0,2952 |

No se han publicado resultados comparativos con el modelo base openai/whisper-tiny ni con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (37,7 M de parametros, aproximadamente 150 MB de pesos), y menos de 500 MB en FP16.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona correctamente en GTX 1650, RTX 3050, RTX 4090, A100 o H100, aunque el modelo no aprovecha la capacidad de estas ultimas.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer moderna e incluso en iGPU con memoria compartida.
- Ejecucion en CPU: viable para transcripcion no interactiva; el modelo es lo suficientemente pequeno para correr en CPU sin cuantizacion agresiva.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), y conversion a otros formatos mediante herramientas estandar (por ejemplo, ONNX o CTranslate2) aunque no se documenta soporte oficial en la model card.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| Whisper tiny British (este modelo) | 37,7 M | 30 s por ventana | en | Apache 2.0 | 13,35 (British English) |
| openai/whisper-tiny | 37,7 M | 30 s por ventana | multilingue | Apache 2.0 | no disponible en esta ficha |
| openai/whisper-base | 74,4 M | 30 s por ventana | multilingue | Apache 2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | 30 s por ventana | multilingue | Apache 2.0 | no disponible en esta ficha |

La comparacion se limita a la familia Whisper porque no se dispone de datos de benchmarks de otros modelos ASR en la informacion proporcionada. El modelo base whisper-tiny es la referencia natural: el ajuste busca mejorar el rendimiento sobre ingles britanico a costa de especializar el modelo y potencialmente degradar otros idiomas.

## Limitaciones y advertencias

- La model card es autogenerada y no documenta la composicion del dataset, el numero de horas de audio ni la procedencia de los datos, lo que impide evaluar la representatividad del ajuste.
- El WER de 13,35 declarado por el autor no esta verificado de forma independiente y corresponde a un unico split de evaluacion; no hay datos sobre su comportamiento en dominios ruidosos o con hablantes no nativos.
- El ajuste solo cubre ingles, por lo que las capacidades multilingues originales de Whisper pueden haberse degradado.
- Riesgo de alucinacion en segmentos de silencio o audio de baja calidad, comportamiento conocido en la familia Whisper y no cuantificado en este ajuste.
- Posibles sesgos derivados del corpus British English utilizado, que no se describe; puede haber desequilibrios de genero, edad o registro.
- Licencia Apache 2.0: permite uso comercial sin restricciones adicionales, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que sugiere ausencia de validacion por parte de la comunidad.
- No se documentan limitaciones especificas de contexto mas alla de la ventana de 30 segundos inherente a Whisper.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mocanianity/whisper-tiny_to_british_accent
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio de Whisper en OpenAI: https://github.com/openai/whisper
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
