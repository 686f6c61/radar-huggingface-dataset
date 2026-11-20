# iapp/OpenThai2.0-ASR-Streaming

## Resumen

OpenThai2.0-ASR-Streaming es un modelo de reconocimiento automatico del habla (ASR) en tailandes con capacidad de transcripcion en tiempo real, desarrollado por iApp Technology en el marco del proyecto OpenThai (anteriormente OpenThaiGPT). Se trata de un fine-tune del modelo base de NVIDIA `nemotron-3.5-asr-streaming-0.6b`, adaptado especificamente para tailandes y publicado bajo licencia OpenMDW-1.1. El modelo es el motor detras del servicio alojado OpenThai ASR Realtime de iApp.

El modelo emplea una arquitectura de encoder FastConformer con atencion cacheada (cache-aware streaming) combinada con un decodificador RNN-Transducer y un mecanismo de prompts de idioma. Con 640,4 millones de parametros (0,64B), ofrece cuatro configuraciones de latencia (80, 320, 560 y 1120 ms) seleccionables en tiempo de decodificacion, lo que permite ajustar el equilibrio entre precision y retraso segun el caso de uso.

Su relevancia actual radica en que cubre una necesidad poco atendida: ASR en streaming de calidad para tailandes, un idioma con escasa representacion en modelos abiertos. Frente a la alternativa abierta principal (Typhoon ASR Streaming 0.6B, construida sobre la misma base de NVIDIA), OpenThai2.0 reporta mejor precision en habla leida, YouTube y reuniones, aunque cede en programas de television.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder FastConformer cache-aware streaming + decodificador RNN-Transducer, condicionado por prompt (NeMo `EncDecRNNTBPEModelWithPrompt`) |
| Parametros totales | 640,4 millones (0,64B): encoder 609,1M (24 capas FastConformer, dimension 1.024), capa de prompt de idioma 4,5M, decodificador RNN-T 16,2M (LSTM de 2 capas, 640 unidades), red conjunta 10,7M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Configurable en decodificacion via `att_context_size`: `[56,0]` (80 ms), `[56,3]` (320 ms), `[56,6]` (560 ms), `[56,13]` (1120 ms) |
| Tipos de cuantizacion | Pesos de 32 bits en los `.nemo` originales; exportacion ONNX en precision completa e int8 disponible en repo separado |
| Idiomas soportados | Tailandes (th) e ingles (en); prompts `th-TH` (todo en escritura tailandesa) y `th-mix` (palabras inglesas en alfabeto latino) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | `.nemo` (NeMo); exportacion ONNX disponible en `iapp/OpenThai2.0-ASR-Streaming-ONNX` |
| Tokenizer | 14.988 piezas: 13.087 multilingues de NVIDIA + 1.901 nuevas en tailandes |
| Entrada de audio | 16 kHz mono, 128 bandas log-mel; cualquier duracion si se corta en pausas |
| Tamano del repo | 10,3 GB (dos ficheros `.nemo` de 2,56 GB cada uno) |

## Arquitectura y entrenamiento

El modelo sigue el diseno de Nemotron 3.5 ASR Streaming de NVIDIA: un encoder FastConformer de 24 capas con atencion cacheada que permite procesar audio de forma incremental sin recalcular el pasado, acoplado a un decodificador RNN-Transducer (dos capas LSTM de 640 unidades) y una red conjunta. La innovacion clave respecto a un RNN-T convencional es la capa de prompt de idioma (4,5M de parametros), que condiciona la salida para que el modelo escriba todo en escritura tailandesa (`th-TH`) o preserve palabras inglesas en alfabeto latino (`th-mix`). El tokenizer se amplio con 1.901 piezas nuevas especificas de tailandes sobre las 13.087 multilingues originales.

El entrenamiento utilizo 12.373 horas de audio en tailandes y 961 horas en ingles (LibriSpeech). No se detalla en la informacion disponible la composicion exacta del corpus tailandes, si hubo etapas de RLHF/DPO (poco habituales en ASR) ni el esquema completo de aumentacion de datos. La informacion tampoco especifica el numero total de pasos de entrenamiento ni la estrategia exacta de congelacion de capas durante el fine-tuning.

## Capacidades

- Transcripcion de voz a texto en tailandes en tiempo real, con latencia configurable entre 80 y 1120 ms.
- Transcripcion de audio en ingles (heredada del entrenamiento con LibriSpeech del modelo base).
- Manejo de code-switching tailandes-ingles mediante prompts de idioma (`th-TH` frente a `th-mix`).
- Procesamiento de audio de cualquier duracion cuando se segmenta en pausas (comportamiento del servidor incluido).
- Decodificacion por lotes de ficheros completos o como flujo continuo en streaming.
- Reconocimiento de habla leida, YouTube, television, reuniones con microfono de conferencia y dialecto isan (con precision variable).
- Exportacion a ONNX (precision completa e int8) para despliegue fuera de NeMo.

## Casos de uso

- Subtitulado en directo de retransmisiones y videos en tailandes: con 560 ms de latencia el modelo puede generar subtitulos casi simultaneos al habla, adecuado para emisiones de television o streaming web donde el retraso perceptible debe ser minimo.
- Transcripcion de reuniones y actas automaticas: el rendimiento en LOTUSDIS (20,77% CER a 560 ms, frente a 28,91% de Typhoon) lo hace idoneo para grabar y transcribir reuniones con microfono de conferencia, generando actas o resumenes posteriores.
- Atencion al cliente por voz en tailandes: integrado en un pipeline de telefonia o VoIP, permite transcribir llamadas en tiempo real para enrutamiento, analitica o asistencia al agente, con el prompt `th-mix` para preservar terminos tecnicos en ingles.
- Indexacion y busqueda de archivos audiovisuales: procesando ficheros completos a 257x tiempo real en una H100, se puede transcribir un catalogo de videos o podcasts para hacerlo buscable por texto.
- Asistencia a la accesibilidad: generacion de subtitulos en vivo para personas con discapacidad auditiva en eventos, clases o videoconferencias en tailandes.
- Analisis de contenido en redes y medios: transcripcion masiva de clips de YouTube (GigaSpeech2, 15,35% CER) para monitorizacion de marca, moderacion o extraccion de temas.
- Despliegue en edge o servidores modestos: con unos 6,5 GB de RAM en CPU y capacidad de mantener un stream en tiempo real a 560/320 ms con 8 hilos, es viable en servidores sin GPU o en un Apple M3 Max con un solo hilo.

## Benchmarks y rendimiento

Resultados de tasa de error de caracteres (CER, %; menor es mejor) a 560 ms, comparados con Typhoon ASR Streaming 0.6B (con y sin su modelo de lenguaje de 4 gramos):

| Conjunto de prueba | Tamano | OpenThai2.0-ASR-Streaming | Typhoon ASR Streaming 0.6B | Typhoon + LM 4-gramos |
|---|---|---:|---:|---:|
| FLEURS test (habla leida) | 1.021 clips | **8,47** | 11,28 | 11,73 |
| GigaSpeech2 test (YouTube) | 8.823 clips, 32 grabaciones | **15,35** | 16,33 | 16,62 |
| TVSpeech (TV y YouTube talk) | 570 clips, 18 videos | 12,41 | **10,84** | 11,05 |
| LOTUSDIS (reuniones, micro de conferencia) | 5.516 turnos, 11 reuniones | **20,77** | 28,91 | 29,02 |
| Dialecto isan | 500 clips | 34,90 | **34,15** | 35,79 |

A 1120 ms (`att_context_size` `[56,13]`):

| Conjunto de prueba | Tamano | OpenThai2.0-ASR-Streaming | Typhoon ASR Streaming 0.6B | Typhoon + LM 4-gramos |
|---|---|---:|---:|---:|
| FLEURS test (habla leida) | 1.021 clips | **8,36** | 11,32 | 11,64 |

Los intervalos de confianza al 95% publicados en la model card indican diferencias significativas a favor de OpenThai2.0 en FLEURS (−2,82 [−3,15, −2,48]), GigaSpeech2 (−0,98 [−1,31, −0,58]) y LOTUSDIS (−8,15 [−8,88, −7,46]); a favor de Typhoon en TVSpeech (+1,57 [+0,90, +2,52]); y empate estadistico en isan (+0,75 [−0,21, +1,69]). No se han publicado resultados de benchmarks adicionales (por ejemplo, WER en ingles o MMLU) en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM para inferencia: aproximadamente 2,6 GB para los pesos; unos 6,5 GB de RAM total en CPU.
- GPU recomendadas: NVIDIA H100 (referencia de rendimiento del autor, ~257x tiempo real en ficheros y ~20 streams simultaneos a 560 ms). No se especifican requisitos para otras GPU, pero por tamano cabe holgadamente en cualquier GPU con 8 GB o mas (RTX 3070/4060 en adelante).
- Cabe en GPU de consumo: si, dado el tamano de 0,64B y 2,6 GB de pesos; una RTX 4090 o RTX 3090 lo ejecutaria con amplio margen.
- CPU: un servidor limitado a 8 hilos procesa ficheros a ~4x tiempo real y mantiene un stream en vivo a 560 y 320 ms.
- Apple Silicon: un M3 Max con 1 hilo procesa ficheros a ~3x tiempo real y mantiene un stream en vivo a 560 y 320 ms.
- Opciones de despliegue: NeMo (libreria nativa, ficheros `.nemo`); ONNX Runtime mediante la exportacion int8 o precision completa del repo `iapp/OpenThai2.0-ASR-Streaming-ONNX`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo ASR NeMo).
- Latencia y throughput: latencias de 80, 320, 560 y 1120 ms configurables; throughput de referencia de ~257x tiempo real en H100 y ~20 streams concurrentes a 560 ms.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Latencia streaming | CER medio (560 ms) | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| OpenThai2.0-ASR-Streaming | 0,64B | th, en | 80/320/560/1120 ms | 18,38 (media de 5 sets) | OpenMDW-1.1 | Hugging Face (NeMo + ONNX) |
| Typhoon ASR Streaming 0.6B | 0,6B | th, en | streaming (configurable) | No disponible como media; ver tabla de benchmarks | No disponible en la informacion | Hugging Face |
| Nemotron 3.5 ASR Streaming 0.6B (base) | 0,6B | multilingue (incluye en) | configurable | No disponible | OpenMDW-1.1 | Hugging Face (NVIDIA) |

Frente a Typhoon, el modelo de iApp es mas preciso en habla leida, YouTube y reuniones, y menos preciso en TV talk shows; en isan empatan. Frente a su base Nemotron, la diferencia principal es la adaptacion al tailandes (tokenizer ampliado, 12.373 horas de audio tailandes y prompts de idioma), aunque la model card no publica una comparacion numerica directa con el modelo base.

## Limitaciones y advertencias

- Al decodificar una grabacion completa como un unico stream, el modelo pierde palabras tras pausas silenciosas; es necesario cortar en pausas como hace el servidor incluido.
- El rendimiento en dialecto isan es bajo (34,90% CER), similar al de Typhoon pero muy superior al de habla estandar; no es fiable para ese dialecto en produccion.
- El rendimiento en TV talk shows es inferior al de Typhoon (12,41% frente a 10,84%), por lo que en ese dominio concreto la alternativa de Typhoon puede ser preferible.
- El modelo esta especializado en tailandes e ingles; no debe esperarse calidad en otros idiomas pese a la base multilingue de NVIDIA.
- La licencia OpenMDW-1.1 impone condiciones especificas; debe revisarse el texto completo (enlace en la model card) antes de uso comercial. La model card indica `license: other` con `license_name: openmdw-1.1`.
- Riesgo de alucinacion y errores de transcripcion en audio con ruido, solapamiento de hablantes o acentos no representados en el corpus de entrenamiento; no se documentan sesgos especificos.
- No se detalla la composicion del corpus de entrenamiento tailandes, lo que dificulta evaluar la cobertura de dominios y acentos.
- El modelo no realiza diarizacion de hablantes ni puntuacion automatica segun la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iapp/OpenThai2.0-ASR-Streaming
- Exportacion ONNX: https://huggingface.co/iapp/OpenThai2.0-ASR-Streaming-ONNX
- Modelo base NVIDIA: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Modelo comparable Typhoon: https://huggingface.co/typhoon-ai/typhoon-asr-streaming-nemotron-0.6b
- Servicio alojado OpenThai ASR Realtime: https://iapp.co.th/docs/speech/speech-to-text/realtime
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Paper de referencia (arXiv): https://arxiv.org/abs/2509.18722
