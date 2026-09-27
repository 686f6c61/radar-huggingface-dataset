# Pedro21613/realtime-multilingual-asr-light

## Resumen

Realtime Multilingual ASR — Light es un paquete de reconocimiento automatico del habla (ASR) en tiempo real publicado por el usuario Pedro21613 en HuggingFace. No se trata de un modelo entrenado desde cero, sino de un envoltorio de inferencia construido sobre el backbone `faster-whisper tiny` de OpenAI Whisper, con aproximadamente 39 millones de parametros y un peso de unos 75 MB en cuantizacion `int8`. El objetivo declarado es ofrecer transcripcion multilingue de baja latencia directamente en CPU, sin necesidad de GPU.

La propuesta del autor se centra en tres piezas: un filtro VAD integrado que evita transcribir silencios, deteccion automatica de idioma (con opcion `auto`) sobre los 99 idiomas cubiertos por Whisper, y un modo de streaming por fragmentos de 3 segundos con solapamiento que permite consumir audio de microfono de forma continua. El repositorio incluye tres puntos de entrada: `transcribe_file.py` para ficheros, `app_realtime.py` para demo con microfono y `app_gradio.py` para interfaz web.

Su relevancia practica es acotada pero clara: es una via rapida para prototipar dictado, subtitulado en vivo o asistentes de voz en maquinas sin GPU. Conviene senalar que el repositorio no tiene descargas ni likes, la licencia no esta declarada y la model card esta redactada en portugues, por lo que debe considerarse material no validado para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder de tipo Whisper (backbone `faster-whisper tiny`); no se detalla en la informacion proporcionada mas alla del backbone |
| Parametros totales | ~39 M (variante `tiny` por defecto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el pipeline procesa audio en fragmentos de 3 s con solapamiento (ventana nativa de Whisper de 30 s, no confirmada en la model card) |
| Tipos de cuantizacion | `int8` (por defecto); el autor menciona variantes `tiny`, `base` y `small` como alternativas de `model_size` |
| Idiomas soportados | multilingue, 99 idiomas de Whisper segun la model card; deteccion automatica (`auto`) |
| Licencia | no disponible |
| Formato de pesos | no disponible explicitamente; se ejecuta mediante `faster-whisper` (CTranslate2) |

## Arquitectura y entrenamiento

La model card identifica el backbone como `faster-whisper tiny`, es decir, la implementacion de Whisper sobre CTranslate2 con cuantizacion `int8`. Whisper es una arquitectura transformer encoder-decoder orientada a tareas de secuencia a secuencia sobre espectrogramas de audio, y la variante `tiny` es la mas pequena de la familia. Sobre ese backbone, el autor anade logica de aplicacion: filtro VAD, chunking con solapamiento y deteccion de idioma en cada transcripcion.

No se proporciona informacion sobre el proceso de entrenamiento: ni numero de tokens de audio, ni composicion del dataset, ni si hubo ajuste fino adicional sobre los pesos originales. Tampoco se documentan tecnicas de alineacion como RLHF o DPO, ni innovaciones de decodificacion (decodificacion especulativa, atencion lineal u otras). La unica innovacion practica descrita es de ingenieria de inferencia: streaming por chunks de 3 s con overlap y VAD embutido para no procesar silencio.

La model card ofrece una tabla de compromiso entre precision y coste segun la variante elegida:

| `model_size` | Parametros | Tamano | Latencia en CPU declarada |
|---|---|---|---|
| `tiny` (por defecto) | 39 M | ~75 MB | ~0,3-0,8 s por 3 s de audio |
| `base` | 74 M | ~145 MB | ~0,8-1,5 s por 3 s de audio |
| `small` | 244 M | ~490 MB | mas preciso, mas pesado (sin cifra) |

## Capacidades

- Transcripcion de voz a texto en modo fichero, con deteccion automatica de idioma y probabilidad asociada (`text, lang, prob`).
- Streaming de audio de microfono por fragmentos de 3 segundos configurables, con solapamiento entre chunks.
- Filtrado VAD integrado: no genera transcripciones sobre silencio.
- Cobertura multilingue heredada de Whisper (99 idiomas), con seleccion manual de idioma o modo `auto`.
- Seleccion de tamano de modelo en tiempo de ejecucion (`tiny`, `base`, `small`) sin modificar el codigo de la aplicacion.
- Interfaz Gradio incluida para demo web.
- No se documentan capacidades de tool calling, function calling, agentes, vision, audio generation ni modo de razonamiento explicito.

## Casos de uso

- Dictado por voz en local: el modelo transcribe microfono en fragmentos de 3 s con latencia declarada de 0,3-0,8 s, suficiente para escribir notas en un editor sin depender de servicios en la nube.
- Subtitulado en directo de baja exigencia: usando `stream_microphone()` se puede emitir texto por consola o sobre una retransmision, aceptando la menor precision del modelo `tiny` a cambio de latencia baja en CPU.
- Transcripcion de ficheros de audio ya grabados: `transcribe_file.py` con deteccion de idioma automatica permite procesar lotes de reuniones o notas de voz en maquinas sin GPU.
- Prototipado de asistentes de voz: el modo streaming y la deteccion de idioma sirven como capa ASR de un pipeline mayor (por ejemplo, ASR + LLM) antes de invertir en modelos mayores.
- Preprocesado de audio para pipelines de datos: el filtro VAD reduce el volumen de audio a transcribir y elimina tramos silenciosos en la fase de etiquetado.
- Despliegue en edge o en contenedores ligeros: al ser `int8` de ~75 MB, cabe en instancias pequenas o en dispositivos con CPU modesta, util para demos y entornos de desarrollo.
- Aplicacion educativa o de accesibilidad: transcripcion en vivo en el aula o subtitulado personal para personas con dificultades auditivas, ejecutable en un portatil sin GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye estimaciones de latencia en CPU por variante de modelo (0,3-0,8 s por 3 s de audio para `tiny`; 0,8-1,5 s para `base`), sin valores de WER, MMLU, HumanEval ni metricas equivalentes, y sin comparacion cuantitativa frente a otros sistemas ASR.

## Requisitos de hardware

- VRAM estimada: inferior a 1 GB con cuantizacion `int8`; los pesos de la variante `tiny` ocupan ~75 MB, ~145 MB para `base` y ~490 MB para `small`, mas el overhead del runtime de CTranslate2.
- GPU recomendadas: no son necesarias. Cualquier GPU CUDA con al menos 2 GB de memoria (GTX 1050 Ti, RTX 3050, RTX 4090, A100, H100) puede ejecutar la variante `tiny` con holgura, pero el diseno apunta a CPU.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo moderna; el caso de uso natural es CPU pura.
- Opciones de despliegue: `faster-whisper` (CTranslate2) como libreria base; scripts incluidos `transcribe_file.py`, `app_realtime.py` y `app_gradio.py`, con `requirements.txt` para instalacion via `pip`. No se documentan integraciones con vLLM, TGI, Ollama o llama.cpp.
- Latencia declarada: ~0,3-0,8 s por cada 3 s de audio en la variante `tiny`, y ~0,8-1,5 s en `base`, en CPU (hardware de referencia no especificado). No se proporcionan datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Ventana de proceso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| realtime-multilingual-asr-light (`tiny` int8) | ~39 M | 99 (heredados de Whisper) | chunks de 3 s con overlap | no disponible | HuggingFace, 0 descargas, 0 likes |
| OpenAI Whisper `tiny` | 39 M | 99 | ventana nativa de 30 s | MIT (modelo original) | ampliamente disponible |
| OpenAI Whisper `base` (via faster-whisper) | 74 M | 99 | ventana nativa de 30 s | MIT (modelo original) | ampliamente disponible |
| OpenAI Whisper `small` (via faster-whisper) | 244 M | 99 | ventana nativa de 30 s | MIT (modelo original) | ampliamente disponible |

Las tres alternativas comparten backbone con este repositorio; la diferencia relevante no es el modelo, sino la capa de aplicacion (VAD, streaming por chunks, deteccion de idioma por segmento) y la ausencia de una licencia declarada en el repositorio de Pedro21613. No se dispone de datos de rendimiento comparado (WER) en la informacion proporcionada.

## Limitaciones y advertencias

- Precision limitada: el propio autor advierte que la variante `tiny` es rapida pero menos precisa con acentos y ruido de fondo; recomienda `base` para mejorar sin cambiar el codigo.
- Idiomas: la model card afirma cobertura de 99 idiomas, pero no aporta evaluacion por idioma ni garantiza calidad homogenea; la documentacion esta escrita en portugues, lo que sugiere un foco practico en ese idioma junto con ingles y espanol.
- Licencia no declarada: sin licencia explicita no hay autorizacion clara para uso comercial ni para redistribucion; ademas, al derivar de Whisper, las condiciones del modelo original siguen siendo relevantes.
- Repositorio sin validacion: 0 descargas y 0 likes, creado y actualizado el mismo dia (2026-09-27), sin senales de mantenimiento ni de uso en produccion.
- Riesgo de alucinacion: los modelos ASR tipo Whisper pueden generar texto plausible en tramos con ruido, musica o silencio mal filtrado; el filtro VAD mitiga parte del problema, pero no lo elimina.
- Streaming aproximado: el procesado por chunks de 3 s con solapamiento no es decodificacion en streaming nativa, por lo que pueden aparecer cortes o duplicaciones en los limites de fragmento.
- Sin datos de entrenamiento ni de evaluacion: no se puede auditar el origen de los pesos, el dataset asociado ni el posible sesgo acustico (acentos, edad, genero, calidad de microfono).
- Sin garantias de rendimiento fuera del hardware de referencia del autor: las cifras de latencia de la model card no especifican CPU concreta ni numero de hilos.

## Enlaces

- HuggingFace: https://huggingface.co/Pedro21613/realtime-multilingual-asr-light
- No se han encontrado enlaces relevantes (papers, blogs, repositorios o demos) en los resultados de la busqueda web proporcionada; el resto de resultados no guardan relacion con el modelo.
