# alphaedge-ai/whisper-large-v3-turbo-guj-16384

## Resumen

whisper-large-v3-turbo-guj-16384 es un modelo de reconocimiento automatico del habla (ASR) derivado de openai/whisper-large-v3-turbo, publicado por alphaedge-ai. Se trata de una version "trimmed" (podada) del modelo original de OpenAI, en la que se ha reducido el vocabulario del tokenizer de 51.865 a 16.384 tokens para optimizarlo especificamente para el idioma guyarati (gu). El modelo conserva la arquitectura transformer encoder-decoder propia de la familia Whisper y mantiene los mismos pesos del modelo base, pero con una capa de embeddings de tokens mas pequena.

La poda del vocabulario se realizo mediante la tecnica de trimming documentada por Hugging Face, utilizando 200.000 textos del dataset lbourdois/fineweb-2-trimming para identificar los tokens relevantes del guyarati y eliminar el resto. El resultado es una reduccion del 68,41% en el tamano del vocabulario y del 5,61% en el numero total de parametros (de 808.878.080 a 763.461.120), lo que se traduce en una huella de memoria notablemente menor (repo de 1,5 GB) y potencialmente en una inferencia mas rapida.

El modelo es relevante para desarrolladores que necesiten desplegar ASR en guyarati en entornos con recursos limitados, ya que reduce los requisitos de memoria sin renunciar (segun el autor) a un rendimiento similar al del modelo original en ese idioma. Su licencia Apache 2.0 facilita el uso comercial. No obstante, al haber eliminado tokens de otros idiomas, el modelo pierde capacidad multilingue y queda practicamente restringido al guyarati.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 763.461.120 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | guyarati (gu) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de openai/whisper-large-v3-turbo: un transformer encoder-decoder entrenado con supervision debil a gran escala para transcripcion y traduccion de voz, descrito en el paper "Robust Speech Recognition via Large-Scale Weak Supervision" (Radford et al., 2022). Whisper procesa audio remuestreado a 16 kHz y genera texto de forma autorregresiva. La variante turbo del modelo base reduce el numero de capas del decoder respecto a large-v3, lo que disminuye la latencia de decodificacion.

La innovacion principal de esta version es la poda del vocabulario (trimming). Partiendo de los 51.865 tokens del tokenizer original, se seleccionaron 16.384 tokens considerados relevantes para el guyarati mediante el analisis de 200.000 textos del dataset lbourdois/fineweb-2-trimming. Los embeddings correspondientes a los tokens eliminados se descartan, reduciendo el numero de parametros en un 5,61%. No se realizo un reentrenamiento completo del modelo: los pesos restantes se conservan del modelo base, por lo que el autor indica que el rendimiento deberia ser similar al original en guyarati, aunque advierte que puede degradarse en otros idiomas. No se dispone de informacion sobre el proceso de ajuste fino, RLHF o DPO especifico para este modelo.

## Capacidades

- Transcripcion automatica del habla (ASR) en guyarati, con soporte de la tarea `transcribe` mediante `generate_kwargs={"language": "gujarati", "task": "transcribe"}`.
- Procesamiento de audio remuestreado a 16 kHz, tal como exige la arquitectura Whisper.
- Pipeline compatible con `transformers` mediante `pipeline("automatic-speech-recognition")`.
- Integracion con `AutoProcessor`, `AutoModelForSpeechSeq2Seq` y `feature_extractor` estandar de Whisper.
- Capacidad multilingue muy limitada: el vocabulario podado elimina tokens de otros idiomas, por lo que el uso fuera del guyarati no esta garantizado.
- No se documentan capacidades de tool calling, agentes, vision, audio generativo ni modo "thinking".

## Casos de uso

- Transcripcion de reuniones y entrevistas en guyarati: el modelo puede convertir grabaciones de audio en texto para actas o resumenes, con una huella de memoria reducida que facilita su despliegue en servidores modestos.
- Subtitulado automatico de contenido audiovisual en guyarati: integrable en pipelines de postproduccion para generar subtitulos en formato SRT a partir de la salida de texto del pipeline de ASR.
- Atencion al cliente por voz en guyarati: combinado con un modulo de TTS y un LLM, permite construir asistentes telefonicos que transcriban la consulta del usuario antes de procesarla.
- Archivado y busqueda de audio historico: transcripcion masiva de archivos de audio en guyarati para indexacion y busqueda por texto en bibliotecas digitales o archivos administrativos.
- Accesibilidad: generacion de transcripciones en tiempo (casi) real para personas con discapacidad auditiva en entornos donde se hable guyarati, aprovechando el menor consumo de memoria del modelo podado.
- Investigacion en ASR de bajos recursos: servir como punto de partida para experimentos de ajuste fino o evaluacion de tecnicas de trimming en lenguas indoarias, dado su menor coste computacional frente al modelo original.
- Despliegue en el borde (edge): el reducido tamano del repo (1,5 GB) y la disminucion de parametros permiten ejecutar el modelo en dispositivos con VRAM limitada o en CPUs, algo mas complicado con el modelo base completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; el modelo tiene 763.461.120 parametros (aproximadamente 1,5 GB en safetensors en precision de 16 bits), por lo que en fp16 requeriria del orden de 1,5-2 GB de VRAM solo para los pesos, mas el overhead de activaciones y del feature extractor.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, deberia caber en GPUs consumer como RTX 3060, RTX 4060 o superiores; tambien en A100, H100 o L4 para despliegues de produccion.
- Cabe en GPU consumer: si, previsiblemente en la mayoria de GPUs con 4 GB o mas de VRAM, aunque no se confirma oficialmente.
- Opciones de despliegue: `transformers` (pipeline de `automatic-speech-recognition`), y por compatibilidad con el ecosistema Whisper, potencialmente llama.cpp, faster-whisper o servidores compatibles con endpoints; no se documentan opciones especificas en la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/whisper-large-v3-turbo-guj-16384 | 763.461.120 | ventana de 30 s (Whisper) | guyarati | apache-2.0 | Hugging Face (30 descargas) |
| openai/whisper-large-v3-turbo | 808.878.080 | ventana de 30 s (Whisper) | multilingue (99 idiomas) | apache-2.0 | Hugging Face (modelo base) |
| openai/whisper-large-v3 | no disponible en la informacion | ventana de 30 s (Whisper) | multilingue | apache-2.0 | Hugging Face |
| whisper-small | no disponible en la informacion | ventana de 30 s (Whisper) | multilingue | apache-2.0 | Hugging Face |

La comparativa se limita a la familia Whisper, ya que no se dispone de datos de rendimiento de este modelo frente a alternativas especializadas en guyarati. La diferencia clave frente al modelo base es la reduccion del vocabulario (68,41%) y de parametros (5,61%), a costa de perder cobertura multilingue.

## Limitaciones y advertencias

- El modelo solo esta optimizado para guyarati; el autor advierte explicitamente que puede no funcionar bien en otros idiomas porque se eliminaron tokens no usados en el idioma seleccionado.
- Al derivar de Whisper, hereda los sesgos y limitaciones del modelo base, incluyendo posibles errores en acentos, ruido de fondo, habla solapada y vocabulario tecnico o especializado.
- Riesgo de alucinacion: los modelos Whisper pueden generar texto plausible pero incorrecto en segmentos de audio ruidosos o silenciosos; no se documenta mitigacion especifica.
- No se han publicado benchmarks que confirmen que el rendimiento en guyarati se mantiene igual al del modelo base tras el trimming; la afirmacion del autor es una expectativa, no un resultado medido.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del dataset de mineria (lbourdois/fineweb-2-trimming) para cumplimiento.
- El modelo tiene un numero muy bajo de descargas (30) y ningun "like", lo que sugiere poca validacion por parte de la comunidad; conviene evaluarlo en el dominio concreto antes de usarlo en produccion.
- No se documentan opciones de cuantizacion ni formatos GGUF, lo que limita el despliegue en entornos sin `transformers`.
- La fecha de creacion indicada (2026-06-01) y la de actualizacion (2026-11-18) deben tomarse como metadatos del repositorio; no se dispone de informacion adicional sobre el proceso de publicacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/whisper-large-v3-turbo-guj-16384
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Dataset de mineria: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
- Blog sobre trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Paper de Whisper: https://arxiv.org/abs/2212.04356
- Imagen de estadisticas del trimming: https://raw.githubusercontent.com/lbourdois/blog/refs/heads/master/assets/images/Trimming/whisper-large-v3-turbo-16384.png
