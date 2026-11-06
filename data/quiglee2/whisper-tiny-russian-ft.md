# Quiglee2/whisper-tiny-russian-ft

## Resumen

Whisper tiny Russian accent es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, publicado por el usuario Quiglee2 en Hugging Face. Se trata de un modelo de reconocimiento automatico del habla (ASR) derivado de la arquitectura Whisper de OpenAI, en su variante mas pequena, con 37.760.640 parametros totales. El objetivo declarado del ajuste es mejorar el rendimiento sobre habla en ingles con acento ruso, empleando el dataset naharte/russian_english.

El modelo mantiene la arquitectura encoder-decoder transformer caracteristica de la familia Whisper, pero ha sido reentrenado con hiperparametros conservadores (learning rate de 1e-05, 2000 pasos de entrenamiento, batch size de 2) partiendo de los pesos originales de whisper-tiny. El resultado reportado por el autor es un WER de 10,1195 sobre el split de test del dataset de referencia, con una perdida de validacion de 0,2263.

Su relevancia es limitada pero concreta: cubre un nicho muy especifico (transcripcion de habla inglesa con acento ruso) con un modelo extremadamente ligero (0,3 GB de repositorio) que puede ejecutarse en hardware muy modesto, incluso en CPU. No obstante, la informacion publicada es escasa, el modelo no tiene descargas ni likes, y la model card esta generada automaticamente sin documentacion sustantiva sobre usos previstos o limitaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; compatible con cuantizacion via transformers/otros runners) |
| Idiomas soportados | en (segun metadatos); orientado a ingles con acento ruso |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de openai/whisper-tiny, un transformer encoder-decoder disenado para ASR. Whisper procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel, que el encoder transforma en representaciones y el decoder convierte en tokens de texto de forma autoregresiva. La variante tiny es la mas pequena de la familia, con 37,7 millones de parametros, lo que la hace apta para inferencia en dispositivos con recursos limitados.

El entrenamiento se realizo sobre el dataset naharte/russian_english con los siguientes hiperparametros: learning rate 1e-05, optimizador AdamW (betas 0,9/0,999, epsilon 1e-08), scheduler lineal con 500 pasos de warmup, batch size de entrenamiento 2, batch size de evaluacion 1, semilla 42 y 2000 pasos totales (aproximadamente 2,14 epocas). La perdida de entrenamiento descendio de 0,1726 (paso 1000) a 0,0781 (paso 2000), mientras que la perdida de validacion paso de 0,2409 a 0,2263 y el WER de 10,6280 a 10,1195. No se documenta el numero de tokens de audio, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no procede en un modelo ASR). Las versiones de framework empleadas fueron Transformers 5.23.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3.

## Capacidades

- Reconocimiento automatico del habla (transcripcion de audio a texto) en ingles, con especializacion en habla con acento ruso.
- Transcripcion de audio de hasta 30 segundos por ventana, con posibilidad de chunking para audio mas largo mediante pipelines de transformers.
- Salida de texto plano; no se documenta soporte de marcas de tiempo a nivel de palabra o segmento.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidad multilingue limitada: los metadatos solo declaran ingles; no hay evidencia de rendimiento en otros idiomas.
- No dispone de modo thinking, vision ni audio generativo; es exclusivamente ASR.

## Casos de uso

- Transcripcion de entrevistas o reuniones con hablantes nativos de ruso que se expresan en ingles: el ajuste esta orientado precisamente a este perfil de acento, por lo que deberia reducir errores frente al whisper-tiny original en ese dominio.
- Subtitulado de contenido audiovisual en ingles con acento ruso: al ser un modelo de 37,7 M de parametros, puede procesar audio en tiempo casi real en CPU y generar subtitulos para videos de duracion moderada.
- Prototipado rapido de pipelines ASR en entornos con recursos limitados: su tamano (0,3 GB de repositorio) permite desplegarlo en contenedores pequenos, Raspberry Pi o portatiles sin GPU.
- Preprocesamiento de datos de voz para investigacion en NLP: transcripcion masiva de corpus de habla inglesa con acento ruso para construir datasets de texto.
- Sistemas de dictado o notas de voz en aplicaciones moviles o de escritorio: la baja latencia esperada de un modelo tiny lo hace viable para transcripcion en el dispositivo.
- Filtrado y busqueda de contenido en archivos de audio: transcripcion previa para indexar y buscar por palabras clave en grabaciones donde los hablantes tienen acento ruso.
- Evaluacion comparativa de tecnicas de fine-tuning: sirve como caso de estudio reproducible (hiperparametros y curvas documentadas) para investigar el ajuste de modelos Whisper en acentos especificos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| Automatic Speech Recognition | naharte/russian_english (split test) | WER | 10,1195 |

Evolucion durante el entrenamiento:

| Epoca | Paso | Perdida de entrenamiento | Perdida de validacion | WER |
|---|---|---|---|---|
| 1,0707 | 1000 | 0,1726 | 0,2409 | 10,6280 |
| 2,1413 | 2000 | 0,0781 | 0,2263 | 10,1195 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32; aproximadamente 150-300 MB en fp16 o int8. El modelo es tan pequeno que cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; funciona en GTX 1050, RTX 2060, RTX 3060, RTX 4090, A100 o H100 sin problemas. Tambien es viable en CPU.
- Cabe en GPU consumer: si, en practicamente todas las GPU modernas e incluso en iGPU.
- Opciones de despliegue: transformers (pipeline `automatic-speech-recognition`), vLLM no aplica de forma estandar para ASR, llama.cpp no soporta Whisper de forma nativa (existe whisper.cpp como alternativa), Ollama no soporta ASR de Whisper directamente, TGI no esta orientado a ASR. La via principal es transformers; whisper.cpp o faster-whisper requeririan conversion de pesos.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Por el tamano del modelo, se espera latencia muy baja en GPU y aceptable en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto audio | Idiomas | Licencia | WER declarado |
|---|---|---|---|---|---|
| Quiglee2/whisper-tiny-russian-ft | 37,7 M | 30 s por ventana | en (acento ruso) | apache-2.0 | 10,1195 (dataset propio) |
| openai/whisper-tiny | 39 M (aprox.) | 30 s por ventana | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |
| openai/whisper-base | 74 M (aprox.) | 30 s por ventana | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |
| openai/whisper-small | 244 M (aprox.) | 30 s por ventana | multilingue (99 idiomas) | apache-2.0 | no disponible en esta ficha |

Nota: los recuentos de parametros de los modelos base de OpenAI son aproximados y no se han verificado en la informacion proporcionada. El WER del modelo ajustado no es directamente comparable con los originales porque se mide sobre un dataset especifico (naharte/russian_english) y no sobre benchmarks estandar como LibriSpeech o Common Voice.

## Limitaciones y advertencias

- La model card esta generada automaticamente y contiene secciones sin completar ("More information needed"); no hay documentacion sobre usos previstos, limitaciones ni sesgos.
- El WER declarado (10,1195) no esta verificado (`verified: false`) y se calcula sobre un unico dataset privado o de nicho; no hay validacion cruzada ni resultados en benchmarks estandar.
- El modelo solo declara soporte de ingles; no se ha evaluado su comportamiento en ruso ni en otros idiomas, a pesar del nombre "Russian".
- Riesgo de alucinacion: como todo modelo Whisper, puede generar texto plausible que no corresponde al audio, especialmente en segmentos con ruido, silencios o habla solapada.
- Sesgos conocidos: no documentados; los modelos Whisper heredan sesgos de sus datos de entrenamiento originales, que no se detallan.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte; el modelo base whisper-tiny tambien es apache-2.0.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en produccion ni validacion por parte de la comunidad.
- El fine-tuning con solo 2000 pasos y batch size 2 puede haber producido un ajuste limitado; no se documenta la composicion ni el tamano del dataset de entrenamiento.
- No se recomienda su uso en produccion critica sin una evaluacion propia sobre el dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Quiglee2/whisper-tiny-russian-ft
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Dataset de entrenamiento: https://huggingface.co/datasets/naharte/russian_english
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
