# Quiglee2/whisper-tiny-british-ft

## Resumen

Whisper tiny British accent es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por el usuario Quiglee2 y publicado en HuggingFace. Se trata de un modelo de reconocimiento automatico del habla (ASR) especializado en ingles britanico, entrenado sobre el dataset naharte/british_english. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37,76 millones de parametros totales, y mantiene la licencia Apache 2.0 del modelo original.

El problema que aborda es la adaptacion del reconocimiento de voz al acento britanico, un dominio donde los modelos genericos de Whisper (entrenados mayoritariamente con ingles estadounidense) pueden presentar tasas de error superiores. El ajuste se realizo con un learning rate bajo (1e-5), 2000 pasos de entrenamiento y un scheduler lineal con 500 pasos de calentamiento, lo que sugiere un refinamiento conservador para preservar las capacidades del modelo base.

Es relevante ahora porque demuestra el flujo tipico de especializacion de modelos ASR ligeros para dominios concretos, con un coste computacional muy bajo (repo de 0,3 GB) y resultados medibles en WER sobre el conjunto de evaluacion. No obstante, la model card esta generada automaticamente y carece de documentacion sobre composicion del dataset, condiciones de entrenamiento y limitaciones, lo que limita su uso en produccion sin una evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via transformers/bitsandbytes, no documentado por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura Whisper en su variante tiny: un transformer encoder-decoder con mecanismo de atencion multi-cabeza estandar, disenado para tareas de secuencia a secuencia sobre espectrogramas mel de audio. Whisper tiny es la variante mas pequena de la familia y esta pensada para inferencia rapida en entornos con recursos limitados, a costa de una precision inferior a las variantes medium o large.

El entrenamiento consistio en un fine-tuning supervisado sobre el dataset naharte/british_english, con los siguientes hiperparametros declarados en la model card: learning rate de 1e-5, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW (variante fused, betas 0,9/0,999, epsilon 1e-8), scheduler lineal con 500 pasos de calentamiento y 2000 pasos totales. No se documenta el numero de tokens de audio, la composicion del dataset ni si se aplicaron tecnicas de aumentacion de datos o regularizacion adicional. Tampoco se indica si hubo RLHF, DPO ni ninguna fase de alineacion posterior, algo esperable en un modelo ASR.

Las versiones de framework declaradas son Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. La evolucion del entrenamiento muestra una reduccion del WER de 15,07 en el paso 1000 a 13,51 en el paso 2000, con una perdida de validacion que baja de 0,3013 a 0,2951, lo que indica una mejora sostenida pero con margen de convergencia.

## Capacidades

- Reconocimiento automatico del habla (ASR) en ingles, con especializacion en acento britanico.
- Transcripcion de audio a texto en formato secuencia a secuencia, heredando la capacidad multitarea de Whisper (transcripcion y traduccion al ingles en el modelo base, aunque el fine-tuning se limita a transcripcion en ingles).
- Procesamiento de audio en ventanas de hasta 30 segundos, segun el diseno original de Whisper.
- No se documenta soporte de tool calling ni function calling (no aplicable a un modelo ASR).
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada: el modelo declara unicamente el idioma `en`; el fine-tuning puede haber degradado el rendimiento en otros idiomas del modelo base.
- No dispone de modo thinking, vision ni audio generativo; es exclusivamente un modelo de transcripcion.

## Casos de uso

- Transcripcion de reuniones y entrevistas con hablantes de ingles britanico: el modelo puede convertir audio en texto en entornos donde el acento britanico provoca errores en modelos genericos, gracias al ajuste especifico sobre el dataset naharte/british_english.
- Subtitulado automatico de contenido audiovisual britanico: adecuado para generar subtitulos en ingles de videos, podcasts o series con acento britanico, con un coste de inferencia muy bajo por su tamano reducido (37,76 M de parametros).
- Prototipado rapido de pipelines ASR: su tamano de 0,3 GB permite desplegarlo en entornos de desarrollo y maquinas sin GPU dedicada, lo que facilita la validacion de flujos de transcripcion antes de escalar a modelos mayores.
- Preprocesamiento de datos de voz para entrenamiento de otros modelos: util para transcribir corpus de audio britanico a gran escala con un modelo ligero y rapido, generando etiquetas iniciales que luego se revisan manualmente.
- Asistentes de voz locales y embebidos: al caber en dispositivos con recursos limitados, puede integrarse en aplicaciones de dictado o comandos de voz para usuarios con acento britanico.
- Investigacion sobre adaptacion de dominio en ASR: sirve como caso de estudio reproducible de fine-tuning de Whisper tiny con hiperparametros documentados, util para comparar estrategias de especializacion por acento.

## Benchmarks y rendimiento

Los resultados declarados por el autor en la model card (no verificados, `verified: false`) son los siguientes:

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | naharte/british_english (split test) | WER | 13,5113 |

Evolucion durante el entrenamiento:

| Epoca | Paso | Perdida de validacion | WER |
|---|---|---|---|
| 0,9901 | 1000 | 0,3013 | 15,0740 |
| 1,9802 | 2000 | 0,2951 | 13,5113 |

No se han publicado resultados de benchmarks adicionales (por ejemplo, LibriSpeech, Common Voice) en la informacion disponible, ni comparaciones con el modelo base openai/whisper-tiny en el mismo conjunto de evaluacion.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 para los 37,76 M de parametros; en la practica, el cuello de botella es el buffer de audio y el procesamiento de espectrogramas, no los pesos.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4090 o incluso una GPU integrada puede ejecutar el modelo con latencia baja. Tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer y en la mayoria de CPUs modernas.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), ademas de formatos derivados compatibles con llama.cpp/Ollama si se convierte a GGUF (no documentado por el autor), y servidores de inferencia como TGI o vLLM (soporte de Whisper variable segun version).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera una latencia muy baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| Quiglee2/whisper-tiny-british-ft | 37,76 M | ventanas de 30 s (Whisper) | en | apache-2.0 | 13,51 (naharte/british_english test) |
| openai/whisper-tiny | 37,76 M | ventanas de 30 s | multilingue | apache-2.0 | no disponible en esta comparativa |
| openai/whisper-base | 74,4 M | ventanas de 30 s | multilingue | apache-2.0 | no disponible en esta comparativa |
| openai/whisper-small | 244 M | ventanas de 30 s | multilingue | apache-2.0 | no disponible en esta comparativa |

No se dispone de resultados de benchmarks comparativos directos entre estos modelos en el conjunto naharte/british_english, por lo que la comparativa se limita a parametros, licencia e idiomas.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed") sobre descripcion, usos previstos, limitaciones y datos de entrenamiento.
- El WER de 13,51 esta marcado como no verificado (`verified: false`) y se ha medido unicamente sobre el dataset naharte/british_english; no hay evidencia de generalizacion a otros dominios o acentos.
- El modelo declara solo ingles; el fine-tuning puede haber degradado el rendimiento multilingue del modelo base openai/whisper-tiny.
- No se documenta la composicion del dataset de entrenamiento, lo que impide evaluar sesgos de hablantes, genero, edad o dominio.
- Riesgo de alucinacion en transcripciones: como todo modelo Whisper, puede generar texto plausible en segmentos de silencio o ruido; no se ha evaluado este comportamiento en el fine-tuning.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion por parte de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero al ser un fine-tuning de Whisper conviene revisar las condiciones del modelo base y de los datos de entrenamiento (naharte/british_english) antes de desplegarlo en produccion.
- No hay informacion sobre latencia, throughput ni requisitos de memoria medidos, por lo que las estimaciones de hardware son teoricas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Quiglee2/whisper-tiny-british-ft
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/british_english
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
