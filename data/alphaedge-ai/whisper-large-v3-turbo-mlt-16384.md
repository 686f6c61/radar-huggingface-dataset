# alphaedge-ai/whisper-large-v3-turbo-mlt-16384

## Resumen

whisper-large-v3-turbo-mlt-16384 es una variante "trimmed" (podada) del modelo de reconocimiento automatico del habla openai/whisper-large-v3-turbo, publicada por el usuario alphaedge-ai. La poda se ha realizado mediante reduccion del vocabulario del tokenizer, especializandolo para el idioma maltes (codigo ISO `mt`). El resultado es un modelo de 763.461.120 parametros (un 5,61% menos que el original de 808.878.080) con un vocabulario de 16.384 tokens frente a los 51.865 del modelo base, lo que supone una reduccion del 68,41% en el tamano del vocabulario.

El modelo mantiene la arquitectura encoder-decoder transformer propia de la familia Whisper, con el mismo mecanismo de atencion y el mismo preprocesado de audio (muestreo a 16 kHz, ventanas de 30 segundos). La unica modificacion respecto al modelo base es la eliminacion de los tokens del vocabulario que no son frecuentes en maltes, lo que reduce el tamano de la matriz de embeddings y de la capa de salida, y por tanto el consumo de memoria y el tamano del repositorio (1,5 GB).

Es relevante para desarrolladores que necesiten desplegar ASR en maltes con un footprint reducido, ya que el modelo conserva el rendimiento esperado del original para ese idioma segun el autor, pero pierde capacidad para transcribir otros idiomas. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s por segmento, segun arquitectura Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | maltes (`mt`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper large-v3-turbo: un encoder transformer que procesa espectrogramas mel de audio (ventanas de 30 segundos, 16 kHz) y un decoder autorregresivo que genera tokens de transcripcion. El modelo base large-v3-turbo reduce el numero de capas del decoder respecto a large-v3 para acelerar la inferencia. Este modelo derivado no ha sido reentrenado: se ha obtenido por poda del vocabulario (trimming), conservando los pesos del modelo original para los tokens retenidos.

El proceso de trimming, descrito en el blog de Hugging Face referenciado por el autor, selecciona los tokens mas frecuentes para el idioma objetivo a partir de un corpus de minado de 200.000 textos del dataset lbourdois/fineweb-2-trimming. El vocabulario resultante de 16.384 tokens elimina los tokens no usados en maltes. No se indica en la informacion disponible si hubo fine-tuning adicional, RLHF ni ajuste especifico sobre datos de audio en maltes; todo apunta a que el modelo conserva los pesos del base y solo cambia el vocabulario y las dimensiones de las capas de embedding y salida.

## Capacidades

- Reconocimiento automatico del habla (ASR) en maltes, con tarea de transcripcion.
- Transcripcion de audio con ventanas de 30 segundos, propio de la arquitectura Whisper.
- Capacidad multilingue limitada: el vocabulario podado elimina tokens de otros idiomas, por lo que el rendimiento fuera del maltes puede degradarse severamente.
- No se documenta soporte de tool calling, function calling ni capacidades de agente.
- No se documenta modo thinking, vision ni audio mas alla del propio ASR.
- No se documenta traduccion de voz a texto (task `translate`) en la informacion disponible, aunque la arquitectura Whisper la soporta en el modelo base; el uso recomendado en la model card es `task="transcribe"`.

## Casos de uso

- Transcripcion de reuniones y actas en maltes: el modelo puede procesar audio de reuniones en maltes con la ventana de 30 segundos de Whisper y un footprint de 1,5 GB, adecuado para despliegues en servidores modestos.
- Subtitulado automatico de contenido audiovisual en maltes: integrable en pipelines de postproduccion para generar subtitulos en formato SRT a partir de la salida del pipeline de transformers.
- Atencion al cliente en maltes: transcripcion de llamadas o mensajes de voz para su posterior procesamiento por un LLM, con un coste de memoria menor que el modelo base.
- Investigacion linguistica sobre maltes: generacion de transcripciones a gran escala para corpus orales, aprovechando el menor consumo de recursos frente al modelo completo.
- Despliegue en entornos con recursos limitados: al reducir el vocabulario y el tamano del repositorio, es viable en instancias con GPU de gama media o incluso en CPU para cargas por lotes no interactivas.
- Prototipado rapido de aplicaciones de voz en maltes: el pipeline de transformers permite integrar el modelo en pocas lineas de codigo, como muestra la model card, para validar productos de voz antes de escalar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de WER (word error rate) ni comparaciones cuantitativas con el modelo base para maltes.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 3 GB (763 M parametros x 4 bytes) mas el overhead del runtime y del feature extractor.
- VRAM estimada en fp16/bf16: aproximadamente 1,5-2 GB, adecuada para GPUs consumer.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3060, RTX 4060, T4); para cargas por lotes o mayor throughput, A100 o H100 no son necesarias dado el tamano del modelo.
- Cabe en GPU consumer: si, en la mayoria de GPUs modernas con 4 GB o mas de VRAM.
- Opciones de despliegue: pipeline de `transformers` (documentado en la model card), servidores compatibles con la API de endpoints (tag `endpoints_compatible`), y potencialmente llama.cpp/Ollama si se generan pesos GGUF, aunque no se documenta en la informacion disponible.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Vocabulario | Idiomas | Licencia | Contexto de audio |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-mlt-16384 | 763.461.120 | 16.384 | maltes | apache-2.0 | 30 s por segmento |
| openai/whisper-large-v3-turbo | 808.878.080 | 51.865 | multilingue (99 idiomas) | apache-2.0 | 30 s por segmento |
| openai/whisper-large-v3 | no disponible en la informacion | no disponible | multilingue | apache-2.0 | 30 s por segmento |

La comparativa se limita al modelo base y a la version large-v3 de la familia Whisper; no se dispone de datos de otros modelos ASR especializados en maltes en la informacion proporcionada.

## Limitaciones y advertencias

- El vocabulario podado elimina tokens de otros idiomas; el rendimiento fuera del maltes puede ser deficiente o directamente incorrecto, segun advierte el propio autor.
- No se han publicado metricas de WER para maltes, por lo que el rendimiento real frente al modelo base no esta cuantificado.
- Riesgo de alucinacion en audio con ruido, silencios largos o habla no maltesa, comportamiento comun en la familia Whisper.
- Sesgos inheridos del modelo base y de los datos de entrenamiento originales de Whisper, no documentados en esta ficha.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento en produccion.
- El modelo tiene solo 30 descargas y 0 likes en el momento de la consulta, lo que sugiere poca validacion por parte de la comunidad.
- No se documentan cuantizaciones oficiales ni pesos GGUF; el despliegue en CPU requeriria conversion manual.
- El tag `region:eu` sugiere un enfoque de cumplimiento europeo, pero no se detalla en la model card.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-mlt-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
