# merkelmarrow/whisper-tiny-canadian_english-ft1

## Resumen

Whisper tiny Canadian English es un ajuste fino (fine-tuning) del modelo de reconocimiento automatico del habla `openai/whisper-tiny` de OpenAI, realizado por el usuario merkelmarrow. El objetivo declarado es adaptar el modelo base al ingles canadiense mediante entrenamiento supervisado sobre el conjunto de datos `naharte/canadian_english`. Se trata, por tanto, de un modelo especializado en transcripcion de audio a texto para esa variedad dialectal concreta, no de un modelo de proposito general.

El modelo conserva la arquitectura encoder-decoder de tipo transformer propia de la familia Whisper, con 37,76 millones de parametros totales, lo que lo situa en la gama mas ligera de la familia. Su ventana de contexto de audio es de 30 segundos por segmento, heredada del modelo base, y su unico idioma declarado es el ingles. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

Su relevancia es limitada y muy especifica: se publica como un experimento de ajuste dialectal sobre un modelo tiny, con un WER de 22,34 % en el split de test del dataset de entrenamiento. No cuenta con descargas ni interacciones en el momento de redactar esta ficha, y la model card esta generada automaticamente por el Trainer de Hugging Face, sin documentacion adicional sobre usos previstos o limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 30 segundos de audio por segmento (heredado de Whisper tiny); contexto de texto de 448 tokens |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion estandar de transformers, no documentada por el autor) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `openai/whisper-tiny`, un transformer encoder-decoder con atencion completa disenado para transcripcion de audio. El encoder procesa espectrogramas Mel de 80 canales correspondientes a ventanas de 30 segundos, y el decoder genera tokens de texto de forma autorregresiva. Con 37,76 millones de parametros, es la variante mas pequena de la familia Whisper.

El entrenamiento se realizo sobre el dataset `naharte/canadian_english` con los siguientes hiperparametros declarados: learning rate de 1e-05, batch de entrenamiento de 2, batch de evaluacion de 64, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup y 2000 pasos totales (dos epocas). La perdida de validacion paso de 0,4360 en la epoca 1 a 0,4341 en la epoca 2, y el WER de 23,68 % a 22,34 %. No se documenta el volumen de datos, la composicion del dataset ni si hubo etapas de RLHF o DPO (no aplicables en un modelo ASR de este tipo). El entrenamiento se ejecuto con Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Transcripcion de audio a texto en ingles, con especializacion en la variedad canadiense segun el dataset de ajuste.
- Reconocimiento de voz sobre segmentos de hasta 30 segundos, con la posibilidad de encadenar ventanas para audio mas largo mediante logica externa.
- Generacion de marcas de tiempo (timestamps) a nivel de palabra o segmento, heredada del modelo base Whisper.
- Deteccion de idioma y traduccion al ingles desde otros idiomas: capacidades presentes en el modelo base, aunque el ajuste fino se ha realizado solo con datos en ingles y puede haber degradado estas habilidades.
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni uso como agente.
- No dispone de modo thinking, vision ni audio mas alla de la transcripcion.
- Capacidad multilingue limitada en la practica: el unico idioma declarado es el ingles.

## Casos de uso

- Transcripcion de reuniones y notas de voz en ingles canadiense: el modelo puede convertir grabaciones cortas en texto para actas o resumenes posteriores, aprovechando su ajuste al acento y vocabulario de esa variedad.
- Subtitulado automatico de videos de baja latencia: al ser un modelo tiny, cabe en CPU y en GPUs de gama baja, lo que permite generar subtitulos en tiempo casi real para contenido en ingles.
- Prototipado de pipelines ASR: util como componente de bajo coste en pruebas de concepto donde se prioriza la velocidad de inferencia sobre la precision.
- Transcripcion de comandos de voz en aplicaciones embebidas: su reducido tamano (0,2 GB de repositorio) permite desplegarlo en dispositivos con recursos limitados.
- Generacion de datos etiquetados para entrenamiento: puede emplearse para pre-anotar audio en ingles canadiense y revisar manualmente las transcripciones.
- Investigacion sobre adaptacion dialectal: sirve como punto de partida para estudiar el efecto del fine-tuning en variedades del ingles con pocos recursos.
- Indexacion y busqueda de archivos de audio: transcripcion masiva de un corpus de audio para hacerlo consultable por texto.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | Canadian English (`naharte/canadian_english`, split test) | WER | 22,3446 % |
| Automatic Speech Recognition | Canadian English (validacion, epoca 1) | WER | 23,6821 % |
| Automatic Speech Recognition | Canadian English (validacion, epoca 2) | WER | 22,3446 % |

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | WER |
|---|---|---|---|---|
| 1,0 | 1000 | 0,3018 | 0,4360 | 23,6821 |
| 2,0 | 2000 | 0,1129 | 0,4341 | 22,3446 |

No se han publicado resultados en otros benchmarks estandar (LibriSpeech, Common Voice, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,15 GB solo para pesos; con activaciones y buffers, menos de 1 GB en la practica.
- VRAM estimada en fp16: aproximadamente 0,08 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; funciona en GTX 1050 Ti, RTX 3050, RTX 4090, A100 o H100 sin problema.
- Cabe holgadamente en GPU de consumo e incluso en CPU para inferencia en tiempo real o casi real.
- Opciones de despliegue: transformers (Pipeline de `automatic-speech-recognition`), vLLM no aplica para ASR, llama.cpp no soporta Whisper de forma nativa, whisper.cpp y faster-whisper requieren conversion de pesos, Ollama no es adecuado para este modelo, TGI no soporta Whisper.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | Idioma | Licencia | WER declarado |
|---|---|---|---|---|---|
| merkelmarrow/whisper-tiny-canadian_english-ft1 | 37,76 M | 30 s | en (canadiense) | Apache 2.0 | 22,34 % (dataset propio) |
| openai/whisper-tiny | 37,76 M | 30 s | multilingue | Apache 2.0 | no disponible en esta ficha |
| openai/whisper-base | 74,4 M | 30 s | multilingue | Apache 2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M | 30 s | multilingue | Apache 2.0 | no disponible en esta ficha |

La comparacion directa de WER no es posible porque los resultados del modelo ajustado se han medido sobre un dataset especifico (`naharte/canadian_english`) y no sobre benchmarks estandar como LibriSpeech o Common Voice. Los modelos base de OpenAI no publican WER en ese dataset.

## Limitaciones y advertencias

- El WER de 22,34 % es elevado para estandares de produccion; un modelo tiny ajustado con dos epocas y batch pequeno no alcanza la precision de variantes mayores como small o medium.
- El ajuste se ha realizado exclusivamente sobre `naharte/canadian_english`, por lo que el rendimiento fuera de esa distribucion (otros acentos, ruido de fondo, dominios tecnicos) puede degradarse de forma significativa.
- La model card esta generada automaticamente y no documenta sesgos, composicion del dataset ni limitaciones especificas.
- Riesgo de alucinacion: como todos los modelos Whisper, puede generar texto que no corresponde al audio, especialmente en silencios, ruido o segmentos musicales.
- El modelo base Whisper tiny tiene capacidad multilingue, pero este ajuste solo declara ingles; el uso en otros idiomas no esta validado.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha: no hay evidencia de uso en produccion ni validacion independiente.
- No se han publicado resultados en benchmarks estandar, lo que dificulta la comparacion objetiva con alternativas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/merkelmarrow/whisper-tiny-canadian_english-ft1
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/canadian_english
- Repositorio de Whisper (OpenAI): https://github.com/openai/whisper
- Paper de Whisper: https://arxiv.org/abs/2212.04356
