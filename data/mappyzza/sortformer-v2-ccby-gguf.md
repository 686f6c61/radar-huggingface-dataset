# Mappyzza/sortformer-v2-ccby-gguf

## Resumen

Sortformer v2 CC-BY GGUF es una conversión al formato GGUF del modelo de diarización de hablantes `nvidia/diar_streaming_sortformer_4spk-v2` de NVIDIA, publicada por el usuario Mappyzza para el motor de inferencia [transcribe.cpp](https://github.com/handy-computer/transcribe.cpp). No se trata de un modelo nuevo ni reentrenado: los pesos son exactamente los del checkpoint original de NVIDIA, únicamente convertidos desde el formato `.nemo` a GGUF con precisión F16 en los pesos de cálculo y F32 en normalizaciones y sesgos. El objetivo es facilitar su ejecución en CPU mediante un runtime ligero en C++.

El modelo resuelve el problema de la diarización de hablantes en streaming: identificar quién habla y cuándo en un audio con hasta 4 interlocutores simultáneos. Con 117,7 millones de parámetros y un tamaño de repositorio de 0,2 GB, es un modelo compacto pensado para despliegues de bajo coste, no para generación de texto. Su relevancia radica en la disponibilidad de una versión GGUF con licencia CC BY 4.0, lo que permite uso comercial con atribución.

La conversión está etiquetada con idiomas francés e inglés, aunque la diarización es fundamentalmente independiente del idioma; las mediciones publicadas se realizaron sobre dos reuniones en francés del corpus SUMM-RE. No se han publicado resultados en otros idiomas ni con más de 4 hablantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sortformer (modelo de diarización de hablantes en streaming, derivado de la familia NeMo de NVIDIA; detalles internos de capas no disponibles en la informacion proporcionada) |
| Parametros totales | 117.711.368 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio en streaming; ventana y latencia no especificadas en la informacion proporcionada) |
| Tipos de cuantizacion | F16 (pesos de calculo) con F32 en normalizaciones y sesgos; se menciona una variante Q8_0 no publicada |
| Idiomas soportados | fr, en (segun etiquetas del autor; la diarizacion es en gran medida independiente del idioma) |
| Licencia | CC BY 4.0 |
| Formato de pesos | GGUF (`sortformer-v2-ccby-F16.gguf`, 236.173.824 bytes) |

## Arquitectura y entrenamiento

La arquitectura subyacente es Sortformer, el enfoque de diarizacion de NVIDIA integrado en su ecosistema NeMo, disenado para asignar hablantes en flujo continuo de audio con un maximo de 4 interlocutores. La informacion disponible no detalla el numero de capas, dimensiones ocultas ni el mecanismo interno exacto (atencion, capas recurrentes o hibridas); solo se confirma que el checkpoint original es `nvidia/diar_streaming_sortformer_4spk-v2` y que el modelo esta limitado a 4 hablantes.

No se ha realizado ningun reentrenamiento ni ajuste fino en esta conversion: los pesos son los de NVIDIA. La unica transformacion es la conversion de formato `.nemo` a GGUF mediante `scripts/convert-sortformer.py` de transcribe.cpp, manteniendo F16 en los pesos de calculo y F32 en normalizaciones y sesgos, y corrigiendo los metadatos de identidad y licencia. No se dispone de informacion sobre el dataset de entrenamiento original (numero de tokens, composicion, uso de RLHF) en la informacion proporcionada.

## Capacidades

- Diarizacion de hablantes en streaming con hasta 4 interlocutores simultaneos.
- Salida estructurada por turnos: intervalos temporales (`t0Ms`, `t1Ms`), identificador de hablante (`speakerId`) y probabilidad (`p`).
- Procesamiento de audio mono a 16 kHz (PCM16k mono en el ejemplo de uso).
- Ejecucion en CPU mediante el runtime transcribe.cpp, con backend configurable.
- Capacidades multilingues: etiquetado para frances e ingles; la tarea de diarizacion no depende estrictamente del idioma.
- No es un modelo generativo: no produce texto, no hace tool calling, no soporta agentes ni razonamiento multi-paso.

## Casos de uso

- Transcripcion de reuniones con atribucion de hablante: el modelo genera los turnos con `speakerId` que se combinan con un sistema ASR para producir actas etiquetadas por participante, aprovechando su bajo coste computacional en CPU.
- Analisis de llamadas de atencion al cliente: separar las intervenciones de agente y cliente en grabaciones de soporte telefonico para medir tiempos de habla, silencios y solapamientos.
- Investigacion cualitativa y ciencias sociales: procesar entrevistas o grupos focales de hasta 4 personas y segmentar automaticamente quien habla en cada momento antes de la transcripcion manual o automatica.
- Indexacion y busqueda de archivos de audio: enriquecer un archivo de reuniones o podcasts con metadatos de hablante para permitir busquedas del tipo "que dijo el participante 2 sobre X".
- Subtitulado y postproduccion: generar pistas de hablante para subtitulos con colores o etiquetas por interlocutor en videos de entrevistas y mesas redondas.
- Despliegue en entornos con recursos limitados: al ejecutarse en CPU (medido en un i5-13500H con RTF de 0,059 en F16), es adecuado para servidores sin GPU, portatiles o dispositivos edge donde no se puede asumir el coste de un modelo mayor.
- Preprocesado para pipelines de reconocimiento de voz: separar hablantes antes de aplicar modelos ASR especificos por interlocutor o para mejorar la puntuacion y el formateo de transcripciones.

## Benchmarks y rendimiento

Mediciones publicadas por el autor sobre dos reuniones en frances del corpus SUMM-RE (40 minutos en total, 4 hablantes cada una), ejecutadas solo en CPU (Intel i5-13500H):

| Metrica | F16 (este archivo) | Q8_0 (no publicado) |
|---|---|---|
| DER | 6,2 % | 7,0 % |
| DER sin solapamiento | 5,5 % | 6,4 % |
| JER | 9,6 % | 12,7 % |
| Hablantes encontrados | 4/4, 4/4 | 4/4, 4/4 |
| RTF | 0,059 | 0,062 |

No se han publicado resultados de benchmarks estandar (AMI, DIHARD, CALLHOME, etc.) ni comparaciones con otros modelos de diarizacion en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso medido; el modelo se ejecuta en CPU. El archivo GGUF ocupa 236.173.824 bytes (aproximadamente 0,22 GB), por lo que en GPU requeriria un orden de magnitud similar de memoria mas overhead del runtime.
- GPU recomendadas: no disponibles en la informacion proporcionada; el runtime transcribe.cpp se uso con `backend: 'cpu'`.
- Cabe en cualquier equipo consumer: el archivo es de ~0,22 GB y se ha validado en un Intel i5-13500H sin GPU.
- Opciones de despliegue: transcribe.cpp (runtime C++/Node.js); no se mencionan vLLM, llama.cpp, Ollama ni TGI para este modelo.
- Latencia y throughput: RTF de 0,059 en F16 y 0,062 en Q8_0 sobre i5-13500H, es decir, procesa audio aproximadamente 16-17 veces mas rapido que tiempo real en ese hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / limite | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Sortformer v2 CC-BY GGUF (este) | 117,7 M | max. 4 hablantes; ventana no disponible | CC BY 4.0 | GGUF (F16) | Conversion para transcribe.cpp, ejecucion en CPU |
| nvidia/diar_streaming_sortformer_4spk-v2 | 117,7 M (mismo checkpoint) | max. 4 hablantes | CC BY 4.0 | `.nemo` | Original de NVIDIA, ecosistema NeMo |
| pyannote/speaker-diarization-3.1 | no disponible en la informacion proporcionada | no disponible | no disponible | PyTorch | Alternativa ampliamente usada; datos no verificados aqui |

No se dispone de datos de rendimiento comparativos entre estos modelos en la informacion proporcionada; la comparativa se limita a formato, licencia y disponibilidad.

## Limitaciones y advertencias

- Limite estricto de 4 hablantes: el modelo esta disenado para un maximo de 4 interlocutores y no se ha medido su comportamiento con mas.
- Evaluacion muy limitada: las metricas publicadas provienen solo de dos reuniones en frances (40 minutos) del corpus SUMM-RE; no hay validacion en otros idiomas, dominios ni condiciones acusticas.
- Sin reentrenamiento ni ajuste: los pesos son los de NVIDIA; cualquier sesgo o limitacion del modelo original se hereda intacta.
- Riesgo de confusion en solapamientos: el DER sin solapamiento (5,5 %) es inferior al DER global (6,2 %), lo que indica que los tramos con habla simultanea son mas dificiles.
- Conversion no oficial: no esta aprobada ni respaldada por NVIDIA; para produccion conviene validar contra el checkpoint original.
- Licencia CC BY 4.0: permite uso comercial con atribucion obligatoria a NVIDIA y al autor de la conversion; debe conservarse la atribucion en los metadatos y en la documentacion del producto.
- No es un modelo generativo: no produce transcripciones ni texto; requiere un sistema ASR complementario para ese fin.
- Idiomas: solo se declaran fr y en; el comportamiento en castellano no esta validado en la informacion disponible, aunque la tarea de diarizacion sea en gran medida independiente del idioma.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mappyzza/sortformer-v2-ccby-gguf
- Modelo base de NVIDIA: https://huggingface.co/nvidia/diar_streaming_sortformer_4spk-v2
- Runtime transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Licencia CC BY 4.0: https://creativecommons.org/licenses/by/4.0/
