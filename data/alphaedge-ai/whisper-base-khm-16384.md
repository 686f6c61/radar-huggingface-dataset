# alphaedge-ai/whisper-base-khm-16384

## Resumen

whisper-base-khm-16384 es una variante podada de openai/whisper-base especializada en jemer (khmer), desarrollada por alphaedge-ai. El modelo aplica la tecnica de trimming (reduccion de vocabulario) descrita por Loick Bourdois y colaboradores en el blog de Hugging Face, recortando el vocabulario original de Whisper de 51.865 a 16.384 tokens. El resultado es un modelo un 25,02 % mas pequeno en parametros (54,4 millones frente a 72,6 millones) y con una huella de memoria notablemente inferior.

La arquitectura subyacente es la de Whisper base: un transformer encoder-decoder de tipo seq2seq disenado para reconocimiento automatico del habla (ASR), con entrada de audio a 16 kHz y salida de texto autorregresiva. El modelo conserva la licencia Apache 2.0 del original y esta pensado para transcripcion de audio en jemer con requisitos de recursos reducidos.

Es relevante ahora porque demuestra una via practica de compresion de modelos ASR multilingues para dominios de un solo idioma: elimina los tokens de vocabulario no usados en jemer, manteniendo (segun el autor) un rendimiento similar al original para ese idioma, a costa de perder capacidad en otros. El repositorio ocupa 0,1 GB y es compatible con endpoints de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder seq2seq (Whisper base) |
| Parametros totales | 54.427.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | jemer (km) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de openai/whisper-base, un transformer encoder-decoder con atencion completa, entrenado originalmente por OpenAI mediante supervisao debil a gran escala (paper arXiv:2212.04356). Esta variante no reentrena el modelo: aplica trimming, es decir, reduce el vocabulario a 16.384 tokens seleccionados por frecuencia/minado sobre 200.000 textos del dataset lbourdois/fineweb-2-trimming, y ajusta las matrices de embedding y la capa de salida en consecuencia. El vocabulario se reduce un 68,41 % y el numero de parametros un 25,02 %.

No se documenta en la informacion disponible un proceso de fine-tuning adicional, RLHF ni DPO. La innovacion tecnica principal es la propia metodologia de trimming, que recorta el vocabulario multilingue de Whisper para un idioma concreto y reduce el coste de memoria e inferencia. La entrada de audio debe remuestrearse a 16 kHz, como exige Whisper.

## Capacidades

- Reconocimiento automatico del habla (transcripcion) en jemer.
- Generacion de texto a partir de audio (seq2seq encoder-decoder).
- Transcripcion con especificacion explicita de idioma y tarea (`language="khmer"`, `task="transcribe"`).
- Integracion como pipeline de `transformers` (`automatic-speech-recognition`).
- Uso como componente de ASR en flujos de subtitulado y transcripcion.
- No se documentan capacidades de traduccion, tool calling, agentes, vision ni audio mas alla de ASR.

## Casos de uso

- Transcripcion de audio en jemer: el modelo convierte grabaciones remuestreadas a 16 kHz en texto, siendo adecuado por estar podado especificamente para ese idioma.
- Subtitulado automatico de contenido en jemer: al ser un modelo base ligero, puede integrarse en pipelines de generacion de subtitulos con bajo coste de memoria.
- Procesamiento por lotes de archivos de audio: su menor huella (0,1 GB de repo) permite desplegar varias instancias en un mismo servidor para transcripcion masiva.
- Servicios de transcripcion en el borde o en contenedores pequenos: los 54,4 millones de parametros reducen los requisitos de memoria frente al Whisper base original.
- Preprocesamiento para analitica de voz: transcripcion de llamadas o entrevistas en jemer como paso previo a indexacion o busqueda de texto.
- Prototipado rapido de aplicaciones ASR en jemer: la API de pipeline de `transformers` simplifica la integracion en demos y pruebas de concepto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 54,4 millones de parametros el modelo es muy ligero y cabe en GPUs de consumo, aunque no se publican cifras concretas.
- GPU recomendadas: no disponible en la informacion proporcionada; por tamano, cualquier GPU consumer moderna es suficiente.
- Cabe en GPU consumer: si, por el reducido numero de parametros (54,4 millones).
- Opciones de despliegue: pipeline de `transformers` (documentado); vLLM, llama.cpp, Ollama y TGI no se documentan para este modelo.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| whisper-base-khm-16384 | 54,4 M | no disponible | jemer | apache-2.0 | Hugging Face |
| openai/whisper-base | 72,6 M | no disponible | multilingue | apache-2.0 | Hugging Face |
| openai/whisper-small | no disponible en la informacion | no disponible | multilingue | apache-2.0 | Hugging Face |

El modelo se diferencia de openai/whisper-base por un 25,02 % menos de parametros y vocabulario reducido a 16.384 tokens, a cambio de perder cobertura multilingue. No se dispone de datos de rendimiento comparativo en la informacion proporcionada.

## Limitaciones y advertencias

- Rendimiento degradado en idiomas distintos del jemer, ya que se eliminaron tokens no usados en ese idioma.
- Riesgo de alucinacion y errores de transcripcion inherentes a Whisper, no cuantificado en la informacion disponible.
- Solo se documenta soporte de jemer; no se garantiza calidad en otros idiomas.
- Requiere audio remuestreado a 16 kHz.
- No se publican benchmarks, por lo que el rendimiento real frente al original no esta verificado de forma independiente.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones y atribuciones del modelo base y del dataset de minado.
- Modelo con pocas descargas (57) y sin likes: menor validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-khm-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper Whisper: https://arxiv.org/abs/2212.04356
- Blog de trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
