# mimba/whisper-mimba-essai

## Resumen

Whisper-mimba-essai es un modelo de reconocimiento automatico del habla (ASR) publicado por el usuario mimba en HuggingFace, obtenido mediante fine-tuning del modelo openai/whisper-small. El modelo esta pensado para transcribir audio en cuatro idiomas: palauano (plt), criollo mauriciano (mfe), frances (fr) e ingles (en), una combinacion poco habitual que sugiere un enfoque en comunidades linguisticas minoritarias del Pacifico y del oceano Indico junto con los dos idiomas coloniales de referencia.

Tecnicamente se trata de un transformer encoder-decoder de tipo Whisper con 241.734.912 parametros totales, derivado de la variante "small" de OpenAI (aproximadamente 244 millones de parametros). El repositorio ocupa 14,5 GB, un tamano desproporcionado para el numero de parametros, lo que indica la presencia de multiples checkpoints o artefactos de entrenamiento ademas de los pesos finales en safetensors.

La relevancia de este modelo es limitada pero especifica: cubre dos idiomas de bajos recursos (palauano y criollo mauriciano) para los que existen muy pocos sistemas ASR publicos. El acceso esta restringido (gated) y la licencia es propietaria ("mimba-proprietary"), lo que condiciona fuertemente su uso en produccion o investigacion abierta. El nombre "essai" (prueba, en frances) sugiere que se trata de un experimento y no de un modelo consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 241.734.912 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (Whisper-small procesa ventanas de audio de 30 segundos) |
| Tipos de cuantizacion | no disponible (el repo solo publica safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | palauano (plt), criollo mauriciano (mfe), frances (fr), ingles (en) |
| Licencia | mimba-proprietary (licencia "other" en HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper de OpenAI en su variante small: un encoder que procesa espectrogramas mel logaritmicos de 80 canales sobre ventanas de 30 segundos y un decoder autorregresivo que genera tokens de transcripcion, con atencion multitarea (transcripcion, traduccion y deteccion de idioma) codificada mediante tokens especiales de tarea e idioma. Whisper-small dispone de 12 capas de encoder y 12 de decoder, con una dimension de modelo de 768 y 12 cabezas de atencion.

No se dispone de informacion sobre el proceso de fine-tuning: no se documentan el numero de horas de audio utilizadas, la composicion del dataset, si hubo aumentacion de datos, ni si se aplicaron tecnicas de destilacion, LoRA u otro tipo de adaptacion. Tampoco se especifica si se congelaron capas del modelo base ni que hiperparametros se emplearon. La unica informacion tecnica fiable es la derivacion desde openai/whisper-small y el numero exacto de parametros del checkpoint publicado.

## Capacidades

- Transcripcion de voz a texto (ASR) en palauano, criollo mauriciano, frances e ingles.
- Deteccion automatica del idioma de entrada mediante los tokens de idioma de Whisper (si el fine-tuning no los ha desactivado).
- Traduccion de voz al ingles, capacidad nativa de Whisper que puede o no haberse preservado tras el fine-tuning (no documentado).
- Procesamiento de audio en ventanas de 30 segundos con posible concatenacion de segmentos para audios mas largos.
- No se documenta soporte de tool calling, function calling ni comportamiento agentico; Whisper es un modelo puramente secuencial de ASR.
- No se documenta modo "thinking", vision, audio multimodal ni capacidades de razonamiento extendido.

## Casos de uso

- Transcripcion de archivos de audio en palauano: util para digitalizar grabaciones orales, entrevistas o material educativo en una lengua con practicamente nula representacion en sistemas ASR comerciales.
- Subtitulado de contenido audiovisual en criollo mauriciano: el modelo puede generar transcripciones base para subtitulos en producciones locales de Mauricio, que despues se revisarian manualmente.
- Investigacion linguistica de campo: transcripcion asistida de corpus orales en palauano y criollo mauriciano para analisis fonologico o lexicografico, reduciendo el tiempo de transcripcion manual.
- Preprocesamiento de datos para entrenar modelos de traduccion automatica: generar pares audio-texto en idiomas de bajos recursos que alimenten pipelines de MT o TTS.
- Transcripcion bilingue frances-ingles en entornos administrativos o educativos de comunidades francoparlanas del Pacifico o del Indico.
- Prototipado de asistentes de voz para servicios publicos en Mauricio: combinacion de transcripcion en mfe y fr para consultas ciudadanas, siempre que la licencia propietaria lo permita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de WER (word error rate) por idioma, ni comparaciones con whisper-small original u otras variantes, ni metricas de latencia o throughput.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 1 GB para los pesos (242 M de parametros x 4 bytes), mas el overhead del runtime y del buffer de audio.
- VRAM estimada en fp16/bf16: aproximadamente 0,5 GB para los pesos, mas overhead.
- Cabe holgadamente en cualquier GPU consumer: RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o CPU para inferencia por lotes pequenos.
- Despliegue recomendado: transformers con pipeline de automatic-speech-recognition, o faster-whisper / CTranslate2 para mayor throughput en CPU y GPU.
- Opciones de servido: vLLM no soporta Whisper de forma nativa; TGI tampoco es la via habitual. Se recomienda transformers, faster-whisper o whisper.cpp (previa conversion de pesos, no publicada).
- Latencia y throughput: no disponibles. Para whisper-small en GPU moderna se suele obtener velocidad mayor que tiempo real, pero no hay mediciones publicadas para este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto de audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mimba/whisper-mimba-essai | 241,7 M | plt, mfe, fr, en | ventanas de 30 s | mimba-proprietary | gated en HF |
| openai/whisper-small | 244 M | ~99 idiomas (sin plt ni mfe especificos) | ventanas de 30 s | Apache 2.0 | abierto en HF |
| openai/whisper-base | 74 M | ~99 idiomas | ventanas de 30 s | Apache 2.0 | abierto en HF |
| facebook/mms-1b-all | ~1 B (adaptadores por idioma) | 1100+ idiomas, incluye lenguas de bajos recursos | variable | CC-BY-NC 4.0 | abierto en HF |

La ventaja diferencial de whisper-mimba-essai es la cobertura especifica de palauano y criollo mauriciano, idiomas ausentes o muy debilmente representados en whisper-small original. Como contrapartida, la licencia propietaria y el acceso restringido lo hacen inviable para la mayoria de usos comerciales y de investigacion abierta, frente a las alternativas de OpenAI (Apache 2.0) o MMS de Meta (CC-BY-NC, solo uso no comercial pero acceso libre).

## Limitaciones y advertencias

- Licencia propietaria ("mimba-proprietary"): no se permite uso comercial ni redistribucion sin autorizacion explicita del autor; los terminos exactos deben consultarse en la model card de HuggingFace.
- Acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de descargar el modelo, lo que anade friccion a cualquier evaluacion o despliegue.
- Modelo marcado como "essai" (prueba): no hay evidencia de validacion en produccion ni de calidad consistente; el autor no publica metricas.
- Riesgo de alucinacion y de bucles de repeticion, inherente a los modelos Whisper, especialmente en segmentos con ruido o silencios largos.
- Cobertura limitada a cuatro idiomas; fuera de ellos el rendimiento sera degradado o inutilizable.
- No se documenta el dataset de entrenamiento, por lo que no se puede evaluar el sesgo demografico, dialectal ni de dominio (por ejemplo, rendimiento en audio telefonico frente a estudio).
- El repositorio de 14,5 GB para 242 M de parametros sugiere artefactos adicionales (checkpoints intermedios, optimizer states) que pueden confundir la seleccion de pesos para inferencia.
- Sin garantias de mantenimiento: creado y actualizado en noviembre de 2026, con cero descargas y cero likes en el momento de la consulta.
- No hay versiones cuantizadas publicadas (GGUF, ONNX), lo que limita el despliegue en entornos sin PyTorch.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mimba/whisper-mimba-essai
- Modelo base: https://huggingface.co/openai/whisper-small
- Paper de Whisper (Radford et al., 2022): https://arxiv.org/abs/2212.04356
- Repositorio oficial de Whisper en OpenAI: https://github.com/openai/whisper
- faster-whisper (CTranslate2): https://github.com/SYSTRAN/faster-whisper
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
