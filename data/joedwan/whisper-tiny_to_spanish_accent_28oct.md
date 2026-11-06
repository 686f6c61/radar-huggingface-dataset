# JoeDwan/whisper-tiny_to_spanish_accent_28oct

## Resumen

Whisper tiny Spanish es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla openai/whisper-tiny, desarrollado por el usuario JoeDwan y publicado en Hugging Face. El objetivo declarado es adaptar el modelo base, originalmente entrenado por OpenAI sobre una gran diversidad de idiomas y acentos, a un dataset propio denominado Spanish_english, presumiblemente orientado a mejorar la transcripcion de habla en ingles con acento espanol. Se distribuye bajo licencia Apache 2.0 y emplea la libreria transformers.

Arquitectonicamente hereda integramente el diseno de Whisper tiny: un transformer encoder-decoder de tipo seq2seq orientado a tareas de speech-to-text, con 37.760.640 parametros totales (unos 37,8 millones). Es, por tanto, un modelo muy ligero, adecuado para prototipado rapido, despliegue en CPU o en GPUs de gama baja, y para experimentar con ajustes finos sobre dominio o acento especifico.

Su relevancia actual es limitada pero concreta: sirve como ejemplo de fine-tuning de bajo coste sobre Whisper para adaptacion de acento y como punto de partida reproducible para quienes quieran especializar un modelo ASR pequeno en un dominio concreto. El autor declara un WER de 10,6468 sobre el split de test del dataset Spanish_english, aunque la model card es practicamente un esqueleto autogenerado y no documenta la composicion del corpus ni las condiciones de evaluacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion via herramientas externas como llama.cpp/whisper.cpp, no documentada por el autor) |
| Idiomas soportados | en (declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, un transformer encoder-decoder con atencion completa disenado para transcripcion de audio. Whisper tiny constituye la variante mas pequena de la familia Whisper de OpenAI, con unos 37,8 millones de parametros, lo que lo situa en el rango de modelos desplegables en CPU y en GPUs de consumo. El ajuste fino se realizo con la libreria transformers (version 5.22.0.dev0) y PyTorch 2.11.0+cu130, sobre el dataset Spanish_english.

Los hiperparametros documentados son: learning rate de 1e-5, batch de entrenamiento de 2, batch de evaluacion de 1, semilla 42, optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup y un total de 2000 pasos de entrenamiento. El registro de resultados muestra dos puntos de control: en el paso 1000 (epoca 0,9728) la loss de validacion fue 0,2432 con WER de 12,0647; en el paso 2000 (epoca 1,9455) la loss de validacion bajo a 0,2290 y el WER a 10,6468. No se documenta el volumen de tokens de audio, la composicion del corpus, ni si se aplicaron tecnicas de aumento de datos o de RLHF/DPO (no aplicables en un ajuste fino ASR supervisado de este tipo).

## Capacidades

- Reconocimiento automatico del habla (ASR): transcripcion de audio a texto en ingles, con especializacion declarada en habla con acento espanol.
- Generacion de transcripciones con marcas de tiempo: al heredar la arquitectura Whisper, soporta potencialmente la salida de timestamps por segmento, aunque el autor no lo documenta explicitamente.
- Traduccion de audio a texto en ingles: capacidad heredada del modelo base Whisper, no verificada en este ajuste fino.
- Deteccion de idioma: capacidad heredada del modelo base, no verificada ni documentada por el autor.
- Procesamiento de audio de hasta 30 segundos por ventana: limite propio de la arquitectura Whisper tiny.
- No soporta tool calling ni function calling (no es un modelo de lenguaje conversacional).
- No soporta agentes ni razonamiento multi-paso.
- Capacidades multilingues limitadas: la model card declara unicamente ingles; el ajuste fino puede haber degradado el rendimiento en otros idiomas del modelo base.
- No dispone de modo thinking, vision ni audio generativo.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles con acento espanol: el ajuste fino esta orientado precisamente a este escenario, donde el modelo base Whisper tiny suele cometer mas errores por el acento; su tamano permite ejecutarlo en local sin infraestructura GPU dedicada.
- Prototipado rapido de pipelines ASR: con 37,8 millones de parametros y pesos en safetensors, se puede integrar en un pipeline de transformers en minutos para validar una idea de producto antes de invertir en modelos mayores.
- Subtitulado automatico de contenido audiovisual en ingles: la arquitectura Whisper permite generar transcripciones con marcas de tiempo que se pueden convertir en subtitulos SRT, aunque la calidad en audio ruidoso sera inferior a la de variantes mayores.
- Investigacion sobre adaptacion de acento: sirve como linea base reproducible (hiperparametros y semilla documentados) para estudiar tecnicas de fine-tuning de bajo coste sobre modelos ASR pequenos.
- Despliegue en dispositivos con recursos limitados: al ser un modelo tiny, es candidato para ejecucion en CPU, Raspberry Pi o moviles mediante whisper.cpp u ONNX Runtime, aunque la conversion no esta documentada por el autor.
- Preprocesado de datos de voz para anotacion semiautomatica: transcripcion masiva de audios en ingles con acento espanol para generar corpus etiquetados que alimenten modelos mayores.
- Educacion y demos interactivas: aplicaciones de dictado o practica de pronunciacion en ingles donde la latencia y el coste importan mas que la precision absoluta.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Metrica | Dataset | Split | Valor |
|---|---|---|---|
| WER | Spanish English | test | 10,6468 |
| Loss (validacion) | Spanish English | validacion | 0,2290 |

Evolucion durante el entrenamiento:

| Paso | Epoca | Training loss | Validation loss | WER |
|---|---|---|---|---|
| 1000 | 0,9728 | 0,2402 | 0,2432 | 12,0647 |
| 2000 | 1,9455 | 0,1272 | 0,2290 | 10,6468 |

No se han publicado en la informacion disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) ni evaluaciones sobre benchmarks ASR estandar como LibriSpeech o Common Voice.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en precision fp32 (37,8 millones de parametros, unos 151 MB de pesos) y en torno a 80-150 MB en fp16/int8, mas el overhead de activaciones y del procesador de audio.
- GPU recomendadas: cualquier GPU moderna sirve; una RTX 3060, RTX 4090, A100 o H100 estan sobredimensionadas para este modelo. Es perfectamente viable en CPU.
- Cabe en cualquier GPU de consumo, incluidas GTX 1050, RTX 2050 o iGPU modernas, y en dispositivos tipo Raspberry Pi 4/5 mediante whisper.cpp.
- Opciones de despliegue: transformers (pipeline automatic-speech-recognition), whisper.cpp (previa conversion a GGML/GGUF), ONNX Runtime, Faster-Whisper (CTranslate2), vLLM no es aplicable a ASR, TGI no soporta este pipeline de forma nativa.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoeDwan/whisper-tiny_to_spanish_accent_28oct | 37,8 M | 30 s por ventana | 10,6468 (Spanish English test) | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 37,8 M | 30 s por ventana | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-base | 74,4 M | 30 s por ventana | no disponible en esta ficha | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s por ventana | no disponible en esta ficha | Apache 2.0 | Hugging Face |

La comparacion directa de WER no es posible porque el autor solo reporta resultados sobre su propio dataset Spanish_english, sin evaluacion sobre benchmarks publicos estandar. La ventaja diferencial frente a openai/whisper-tiny es la especializacion en acento espanol dentro de habla inglesa; la desventaja es la perdida potencial de rendimiento en otros dominios e idiomas respecto al modelo base.

## Limitaciones y advertencias

- Model card practicamente vacia: las secciones de descripcion, usos previstos, limitaciones y datos de entrenamiento contienen "More information needed", por lo que no hay documentacion sobre el corpus, su procedencia ni su calidad.
- Resultados no verificados: el WER de 10,6468 esta marcado como `verified: false` en el model-index y se calcula sobre un dataset propio no publicado, lo que impide reproducir la evaluacion.
- Sesgos desconocidos: al no documentarse la composicion del dataset Spanish_english, no se puede evaluar el sesgo por genero, edad, origen regional o calidad de grabacion.
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente en silencios, ruido o habla no inglesa.
- Limitacion de idioma: la model card declara solo ingles; el ajuste fino puede haber degradado el rendimiento multilingue del modelo base y su capacidad de traduccion.
- Limitacion de contexto: ventanas de audio de 30 segundos, propias de Whisper tiny; audios mas largos requieren segmentacion externa.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; conviene validar el modelo sobre datos propios antes de produccion.
- Modelo experimental: 24 descargas y 0 likes en el momento de la consulta, sin senales de mantenimiento ni comunidad.
- Entrenamiento corto: solo 2000 pasos con batch de 2, lo que sugiere un ajuste fino ligero y posible infraajuste para dominios muy distintos al corpus de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JoeDwan/whisper-tiny_to_spanish_accent_28oct
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Repositorio oficial de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Documentacion de transformers para ASR: https://huggingface.co/docs/transformers/tasks/asr
