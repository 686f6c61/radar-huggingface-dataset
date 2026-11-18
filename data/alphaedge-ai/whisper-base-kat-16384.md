# alphaedge-ai/whisper-base-kat-16384

## Resumen

whisper-base-kat-16384 es una variante podada (*trimmed*) de openai/whisper-base, el modelo de reconocimiento automatico del habla (ASR) publicado por OpenAI en 2022. Lo desarrolla el usuario alphaedge-ai y su objetivo es reducir el vocabulario del tokenizador de Whisper para especializarlo en georgiano (ka), eliminando los tokens que no se usan en ese idioma. El resultado es un modelo un 25,02 % mas pequeno en parametros (54.427.648 frente a 72.593.920) y con un vocabulario un 68,41 % menor (16.384 tokens frente a 51.865).

La arquitectura subyacente es la de Whisper: un transformer encoder-decoder entrenado con supervision debil a gran escala para transcripcion y traduccion de voz. El podado no altera la arquitectura ni el entrenamiento original, solo recorta las matrices de embedding y de proyeccion de salida asociadas al vocabulario, lo que reduce el uso de memoria y acelera ligeramente la decodificacion. Es relevante para despliegues en produccion orientados exclusivamente a georgiano, donde un modelo mas ligero y con menos parametros facilita la inferencia en hardware modesto sin renunciar a la calidad del modelo base en ese idioma.

El modelo se distribuye en formato safetensors, con licencia Apache 2.0, y se integra en el ecosistema transformers como pipeline de `automatic-speech-recognition`. Su tamano de repositorio es de aproximadamente 0,1 GB, lo que lo hace muy manejable para prototipos y servicios de transcripcion acotados a un solo idioma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 54.427.648 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s en Whisper; no se especifica en la model card) |
| Tipos de cuantizacion | no disponible (el repo solo incluye safetensors; no se documentan variantes GGUF u otras) |
| Idiomas soportados | georgiano (ka) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-base: un transformer encoder-decoder con atencion multi-cabeza estandar, entrenado originalmente por OpenAI con supervision debil sobre un corpus masivo y multilingue de audio y texto. La innovacion de esta variante es el proceso de *trimming* descrito en el blog de Hugging Face: se analiza un corpus de 200.000 textos del dataset lbourdois/fineweb-2-trimming para determinar que tokens del vocabulario original (51.865) se usan realmente en georgiano, y se conservan solo 16.384. Las matrices de embedding de entrada y la proyeccion de salida se recortan en consecuencia, reduciendo el numero de parametros en un 25,02 %.

No se ha realizado un reentrenamiento ni un ajuste fino especifico sobre datos de georgiano segun la informacion disponible; el modelo conserva los pesos del modelo base para las capas internas y solo se modifican las dimensiones del vocabulario. No se documentan etapas de RLHF, DPO ni tecnicas de decodificacion especulativa. La model card no detalla el numero de tokens de entrenamiento ni la composicion exacta del dataset original de Whisper, mas alla de la referencia al paper arXiv:2212.04356.

## Capacidades

- Transcripcion automatica del habla en georgiano (tarea `transcribe`).
- Traduccion de voz a texto hacia ingles (tarea `translate` heredada de Whisper, aunque el vocabulario podado puede degradar esta capacidad).
- Procesamiento de audio a 16 kHz, con ventana de contexto de 30 segundos por segmento (caracteristica estandar de Whisper).
- Deteccion de actividad de voz y marcas de tiempo a nivel de segmento (comportamiento estandar del pipeline de transformers).
- No soporta tool calling ni function calling.
- No esta disenado para razonamiento multi-paso ni uso como agente.
- Capacidades multilingues limitadas al georgiano; el resto de idiomas pierde tokens y probablemente rendimiento.

## Casos de uso

- Transcripcion de reuniones y entrevistas en georgiano: el modelo puede procesar audio de 16 kHz y generar transcripciones con marcas de tiempo, adecuado para actas automaticas en entornos empresariales georgianos.
- Subtitulado de contenido audiovisual: integrado en un pipeline de postproduccion, permite generar subtitulos en georgiano para videos, con la ventaja de un modelo de 0,1 GB que cabe en cualquier servidor.
- Atencion al cliente por voz en georgiano: sirve como capa ASR previa a un LLM o a un sistema de intenciones, transcribiendo llamadas de soporte con bajo coste de memoria.
- Archivado y busqueda de grabaciones: transcripcion por lotes de archivos de audio historicos para indexacion y busqueda textual en georgiano.
- Prototipado rapido en investigacion de ASR de bajo recurso: al ser un modelo pequeno y con licencia permisiva, es util como linea base para experimentos con idiomas de bajos recursos.
- Despliegue en dispositivos con recursos limitados: su tamano reducido (54 M de parametros) permite ejecucion en CPU o GPU de gama baja para aplicaciones de dictado o notas de voz.
- Accesibilidad: generacion de transcripciones en tiempo real para personas con discapacidad auditiva en contenido en georgiano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 0,22 GB solo para pesos (54,4 M de parametros x 4 bytes), mas overhead de activaciones y buffers de audio.
- VRAM estimada en fp16: aproximadamente 0,11 GB para pesos.
- GPU recomendadas: cualquier GPU moderna con al menos 2 GB de VRAM; funciona en RTX 3060, RTX 4090, A100, H100 sin problema.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU consumer e incluso en CPU para inferencia por lotes pequenos.
- Opciones de despliegue: transformers (pipeline de `automatic-speech-recognition`), potencialmente llama.cpp u Ollama no estan documentados para este modelo; vLLM y TGI no soportan Whisper de forma nativa segun la informacion disponible.
- Latencia y throughput: no disponibles en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-base-kat-16384 | 54,4 M | 30 s de audio (estandar Whisper) | georgiano | Apache 2.0 | Hugging Face |
| openai/whisper-base | 72,6 M | 30 s de audio | multilingue (99 idiomas) | Apache 2.0 | Hugging Face |
| openai/whisper-small | 244 M | 30 s de audio | multilingue | Apache 2.0 | Hugging Face |
| openai/whisper-tiny | 39 M | 30 s de audio | multilingue | Apache 2.0 | Hugging Face |

La comparativa se limita a variantes de la familia Whisper porque no se dispone de informacion sobre modelos ASR especializados en georgiano en la documentacion proporcionada. Frente a whisper-base, este modelo ofrece un 25 % menos de parametros y un vocabulario un 68 % menor, a costa de perder cobertura multilingue. Frente a whisper-tiny, es algo mayor en parametros pero conserva la calidad del modelo base en georgiano.

## Limitaciones y advertencias

- El vocabulario podado elimina tokens no usados en georgiano, por lo que el rendimiento en otros idiomas se degrada severamente; no debe usarse como modelo multilingue.
- Riesgo de alucinacion en audio con ruido, silencios largos o habla no georgiana, comportamiento comun en modelos Whisper.
- No se han publicado evaluaciones cuantitativas (WER, CER) en la model card, por lo que no hay evidencia empirica del rendimiento en georgiano mas alla de la afirmacion del autor de que "deberia comportarse de forma similar al original".
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las condiciones del modelo base y del dataset de minado.
- El modelo no incluye capacidades de diarizacion de hablantes ni puntuacion avanzada mas alla de lo que genera Whisper de forma nativa.
- La ventana de audio de 30 segundos obliga a segmentar audios largos, lo que puede introducir errores en las fronteras de segmento.
- Solo se ha validado para georgiano; el soporte de la tarea `translate` puede no funcionar correctamente tras el podado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-base-kat-16384
- Modelo base: https://huggingface.co/openai/whisper-base
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Blog de introduccion al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
