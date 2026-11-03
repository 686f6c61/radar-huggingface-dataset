# merkelmarrow/whisper-tiny-american_english-ft1

## Resumen

Whisper tiny American English es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario merkelmarrow en HuggingFace. Se trata de un modelo de reconocimiento automatico del habla (ASR) basado en la arquitectura encoder-decoder transformer de Whisper, especializado en transcripcion de audio en ingles americano. El modelo parte de los pesos de whisper-tiny, la variante mas pequena de la familia Whisper de OpenAI, y se reentrena sobre el dataset naharte/american_english.

El modelo resuelve la tarea de transcripcion de voz a texto en ingles, con un enfoque especifico en el acento y las caracteristicas del ingles americano. Con 37,76 millones de parametros, es un modelo extremadamente ligero, disenado para entornos con recursos limitados o para inferencia en tiempo real en CPU. El repositorio ocupa 0,2 GB y los pesos estan en formato safetensors, compatible con la libreria transformers.

La relevancia de este modelo radica en su especializacion: al estar ajustado sobre un dataset concreto de ingles americano, puede ofrecer mejor rendimiento en ese dominio especifico que el modelo base, aunque a costa de perder generalidad. Es un ejemplo tipico de fine-tuning de bajo coste sobre un modelo ya pequeno, orientado a aplicaciones de nicho donde el vocabulario y el acento estan bien delimitados. El modelo declara un WER de 12,53% en el split de test del dataset de entrenamiento, un valor que debe interpretarse con cautela dado que no ha sido verificado de forma independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-tiny: un transformer encoder-decoder con atencion multi-cabeza estandar, disenado para procesar espectrogramas Mel de audio y generar transcripciones token a token. Whisper tiny es la variante mas pequena de la familia, con aproximadamente 39 millones de parametros en su configuracion original; este fine-tuning conserva 37.760.640 parametros segun los pesos safetensors publicados.

El entrenamiento se realizo sobre el dataset naharte/american_english, con un learning rate de 1e-05, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. El batch de entrenamiento fue de 2 y el de evaluacion de 64, con semilla 42. Segun la model card, se completaron aproximadamente 1,89 epocas. No se especifica el numero total de tokens de audio ni la composicion detallada del dataset. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales; se trata de un fine-tuning supervisado clasico con funcion de perdida de entropia cruzada sobre las transcripciones.

## Capacidades

- Transcripcion de voz a texto en ingles americano: convierte audio en texto con un WER declarado de 12,53% en el split de test del dataset de entrenamiento.
- Reconocimiento de habla en tiempo real o por lotes: al ser un modelo de 37,7 millones de parametros, puede ejecutarse en CPU y en dispositivos con recursos muy limitados.
- Procesamiento de audio de hasta 30 segundos por ventana, segun la arquitectura estandar de Whisper tiny.
- No soporta tool calling ni function calling: es un modelo puramente ASR, sin capacidades de agente ni razonamiento multi-paso.
- Capacidades multilingues limitadas: solo declara soporte para ingles; no se ha entrenado para otros idiomas.
- No dispone de modo thinking, vision ni audio generativo; su unica salida es texto transcrito.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles americano: el modelo puede convertir grabaciones cortas (hasta 30 segundos por segmento) en texto, adecuado para actas o resumenes posteriores en entornos donde el acento sea predominantemente americano.
- Subtitulado automatico de videos cortos: por su bajo coste computacional, puede integrarse en pipelines de generacion de subtitulos para contenido en ingles americano, procesando cada fragmento de audio de forma independiente.
- Asistentes de voz embebidos en dispositivos de bajo consumo: al caber en CPU y ocupar apenas 0,2 GB, es viable en raspberry pi u otros dispositivos edge para comandos de voz en ingles.
- Preprocesado de audio para pipelines de NLP: transcripcion de llamadas de atencion al cliente en ingles para su posterior analisis de sentimiento o extraccion de entidades, siempre que el volumen y la duracion de los audios sean moderados.
- Prototipado rapido de aplicaciones ASR: util para desarrolladores que necesitan un modelo ligero y de licencia permisiva (Apache 2.0) para validar ideas antes de escalar a modelos mayores.
- Investigacion en fine-tuning de ASR: sirve como caso de estudio de ajuste fino de whisper-tiny sobre un dataset especifico, con hiperparametros y resultados documentados en la model card.
- Transcripcion de podcasts o entrevistas en ingles americano con segmentacion manual: aunque limitado a ventanas de 30 segundos, puede usarse para transcribir contenido largo dividiendo el audio en fragmentos.

## Benchmarks y rendimiento

Los unicos datos disponibles son los declarados por el autor en la model card, no verificados de forma independiente.

| Benchmark | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | naharte/american_english (split test) | WER | 12,5323% |
| Validacion (epoca 1, paso 1000) | naharte/american_english | WER | 15,8593% |
| Validacion (epoca 2, paso 2000) | naharte/american_english | WER | 12,5323% |
| Validacion (epoca 2, paso 2000) | naharte/american_english | Loss | 0,1922 |

No se han publicado resultados de benchmarks en la informacion disponible para comparar con otros modelos en conjuntos estandar como LibriSpeech o Common Voice.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision FP32 (37,7 millones de parametros, ~150 MB de pesos); en FP16, aproximadamente 75 MB.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; tambien funciona en CPU sin GPU dedicada.
- Cabe en cualquier GPU consumer: GTX 1050, RTX 2060, RTX 3060, RTX 4090, e incluso en iGPU y CPU.
- Opciones de despliegue: transformers (pipeline de automatic-speech-recognition), vLLM no aplica para ASR, llama.cpp no soporta Whisper de forma nativa, Ollama no esta orientado a ASR; se puede usar el pipeline de transformers o ONNX Runtime para optimizacion.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; por el tamano del modelo, se espera latencia muy baja en GPU y aceptable en CPU para audios cortos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| merkelmarrow/whisper-tiny-american_english-ft1 | 37,76 M | 30 s de audio | 12,53% (dataset propio) | Apache 2.0 | HuggingFace |
| openai/whisper-tiny | ~39 M | 30 s de audio | no disponible en la informacion | Apache 2.0 | HuggingFace |
| openai/whisper-base | ~74 M | 30 s de audio | no disponible en la informacion | Apache 2.0 | HuggingFace |
| openai/whisper-small | ~244 M | 30 s de audio | no disponible en la informacion | Apache 2.0 | HuggingFace |

No se dispone de datos de benchmarks comparativos en la informacion proporcionada para establecer una comparacion cuantitativa con los modelos base de OpenAI.

## Limitaciones y advertencias

- El WER de 12,53% no ha sido verificado de forma independiente (verified: false en la model card) y se ha medido sobre el mismo dataset de entrenamiento, por lo que puede estar sobreestimado en su capacidad de generalizacion.
- El modelo solo soporta ingles; no es adecuado para otros idiomas ni para audio con acentos no americanos.
- La arquitectura Whisper tiny procesa ventanas de 30 segundos; audios mas largos requieren segmentacion manual o un pipeline externo.
- Riesgo de alucinacion en transcripciones: como todo modelo ASR generativo, puede producir texto plausible pero incorrecto en segmentos con ruido o silencio.
- No se dispone de informacion sobre sesgos especificos del dataset naharte/american_english ni sobre la demografia de los hablantes.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; la model card indica "More information needed" en secciones clave como usos previstos y limitaciones.
- El modelo fue creado en noviembre de 2026 y no tiene descargas ni likes, lo que sugiere que no ha sido validado por la comunidad.
- No se especifican los tipos de cuantizacion soportados ni el formato GGUF, lo que limita su uso en herramientas como llama.cpp u Ollama sin conversion previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/merkelmarrow/whisper-tiny-american_english-ft1
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/american_english
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
