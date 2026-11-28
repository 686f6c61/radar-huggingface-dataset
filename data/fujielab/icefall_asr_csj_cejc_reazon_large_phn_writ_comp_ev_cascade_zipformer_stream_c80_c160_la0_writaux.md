# fujielab/icefall_asr_csj_cejc_reazon_large_phn_writ_comp_ev_cascade_zipformer_stream_c80_c160_la0_writaux

## Resumen

El modelo `fujielab/icefall_asr_csj_cejc_reazon_large_phn_writ_comp_ev_cascade_zipformer_stream_c80_c160_la0_writaux` es un sistema de reconocimiento automático del habla (ASR) en streaming para japones, desarrollado por el grupo Fujielab y construido sobre la infraestructura icefall, el toolkit de entrenamiento de k2-fsa. Emplea una arquitectura Zipformer en cascada con un encoder de dos escalas (chunks de 80 y 160 frames), pensada para transcripcion incremental de audio con latencia controlada.

El modelo combina datos de tres corpus japoneses (CSJ, CEJC y ReazonSpeech) y su nombre codifica decisiones de diseno concretas: normalizacion fonologica (`phn`), salida escrita (`writ`), composicion de datos (`comp`), evaluacion (`ev`), cascada de decodificadores (`cascade`) y un auxiliar de escritura (`writaux`). El repositorio pesa 0,3 GB y se distribuye como TorchScript, lo que permite inferencia directa sin depender del grafo de entrenamiento original.

Es relevante para quienes necesitan ASR japones en tiempo real con licencia de investigacion, en un ecosistema donde la mayoria de modelos streaming de calidad son propietarios o estan limitados a ingles. El acceso esta restringido (gated) y la licencia es exclusivamente de investigacion, lo que condiciona su uso en produccion comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Zipformer en cascada (streaming), encoder dual con chunks de 80 y 160 frames |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (streaming por chunks; ventana efectiva dependiente de `c80`/`c160`) |
| Tipos de cuantizacion | no disponible (pesos TorchScript; no se documentan variantes GGUF/INT8) |
| Idiomas soportados | japones (ja) |
| Licencia | research-only (acceso gated) |
| Formato de pesos | TorchScript |
| Tamano del repositorio | 0,3 GB |
| Datasets de entrenamiento | CSJ, CEJC, ReazonSpeech |
| Creado / actualizado | 2026-11-16 / 2026-11-28 |
| Descargas / likes | 7 / 0 |

## Arquitectura y entrenamiento

La arquitectura es un Zipformer en modo streaming, una variante de transformer eficiente que combina atencion con convoluciones y un esquema de downsampling multi-escala para reducir el coste computacional en secuencias largas. El sufijo `cascade` indica el uso de un decodificador en cascada, en el que un primer modelo (posiblemente fonologico, `phn`) alimenta a un segundo que produce la salida escrita (`writ`). Los parametros `c80` y `c160` definen dos tamanos de chunk para el encoder, lo que sugiere un esquema de atencion con historial limitado y latencia configurable. El sufijo `la0` probablemente desactiva el lookahead (latencia cero adicional), reforzando el caracter estrictamente streaming.

El entrenamiento se realizo con icefall sobre tres corpus japoneses: CSJ (Corpus of Spontaneous Japanese), CEJC (Corpus of Everyday Japanese Conversation) y ReazonSpeech. La inclusion de CEJC aporta habla conversacional espontanea, mientras que ReazonSpeech anade volumen y variedad de dominio. No se dispone de informacion sobre el numero de tokens, la composicion exacta del dataset, ni si se aplico RLHF o DPO (no aplicable en ASR). El modelo se exporto a TorchScript, lo que permite ejecutarlo con el runtime de k2/icefall sin necesidad del codigo de entrenamiento.

## Capacidades

- Reconocimiento automatico del habla en japones con salida en texto escrito (kanji y kana).
- Modo streaming: procesa audio por chunks con latencia controlada, adecuado para transcripcion en vivo.
- Decodificacion en cascada con etapa fonologica intermedia, que puede mejorar la robustez ante variacion acustica.
- Manejo de habla espontanea y conversacional gracias al entrenamiento con CEJC.
- Salida alineada con el estandar de icefall (tokens y, opcionalmente, marcas de tiempo).
- No soporta tool calling, function calling ni razonamiento multi-paso (es un modelo puramente ASR).
- Capacidad multilingue limitada al japones; no se documentan otros idiomas.
- No incluye vision, audio generativo ni modo "thinking".

## Casos de uso

- Transcripcion en vivo de reuniones y clases en japones: el modo streaming con chunks de 80/160 frames permite emitir texto incremental mientras se habla, sin esperar al final del audio.
- Subtitulado automatico de video en japones: la salida escrita (`writ`) y la etapa fonologica intermedia reducen errores en nombres propios y terminos tecnicos frecuentes en contenido audiovisual.
- Analisis de conversaciones espontaneas en investigacion linguistica: el entrenamiento con CEJC lo hace adecuado para corpus de habla natural con solapamientos y hesitaciones.
- Prototipado de asistentes de voz en japones: al ser TorchScript, se integra en pipelines Python con k2/icefall sin reentrenamiento.
- Indexacion y busqueda de archivos de audio japoneses: la transcripcion streaming permite generar indices searchables en grandes volumenes de grabaciones.
- Evaluacion comparativa de sistemas ASR en japones: sirve como baseline de investigacion para medir mejoras en modelos streaming con licencia abierta.
- Transcripcion de llamadas de atencion al cliente en japones: el modo streaming permite monitorizacion en tiempo real, aunque la licencia research-only limita su despliegue comercial directo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precision; el repositorio pesa 0,3 GB, por lo que en FP32 el modelo cabe holgadamente en GPUs consumer de 8 GB o menos.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA (RTX 3060 en adelante) es suficiente por tamano; para streaming de baja latencia se recomienda RTX 4090, A10 o superiores.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 4-8 GB de VRAM.
- Opciones de despliegue: runtime de icefall/k2 con TorchScript; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a ASR).
- Latencia y throughput estimados: no disponibles; dependen del chunk (`c80`/`c160`) y del hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idioma | Licencia | Formato |
|---|---|---|---|---|---|
| fujielab icefall zipformer streaming (este modelo) | no disponible | streaming por chunks | ja | research-only | TorchScript |
| Whisper large-v3 (OpenAI) | 1550 M | 30 s por ventana | multilingue (incl. ja) | MIT | safetensors, GGUF, etc. |
| ReazonSpeech k2 (Reazon) | no disponible | streaming/no streaming | ja | variable (ver repo) | TorchScript/ONNX |

Whisper large-v3 ofrece mejor cobertura multilingue y licencia permisiva, pero no es streaming nativo y requiere ventanas de 30 s. ReazonSpeech k2 comparte ecosistema (icefall/k2) y dominio japones, pero su licencia y modo de despliegue difieren. Este modelo se distingue por el modo estrictamente streaming y la decodificacion en cascada, a costa de una licencia restringida a investigacion.

## Limitaciones y advertencias

- Licencia research-only: no permite uso comercial sin autorizacion explicita; el acceso esta ademas restringido (gated) en Hugging Face.
- Solo japones: no soporta otros idiomas ni code-switching documentado.
- Riesgo de alucinacion y errores en habla con ruido, acentos marcados o solapamientos, comun en modelos ASR entrenados con corpus limitados.
- Sesgos potenciales derivados de la composicion de CSJ, CEJC y ReazonSpeech (dominios y hablantes concretos).
- No se documentan metricas de WER/CER, por lo que el rendimiento real debe validarse en el dominio objetivo.
- El formato TorchScript limita la portabilidad frente a GGUF/ONNX; requiere el runtime de icefall/k2.
- La decodificacion en cascada anade complejidad de despliegue y posibles errores propagados entre etapas.
- Sin soporte de tool calling ni agentes; no es un modelo de proposito general.

## Enlaces

- Hugging Face: https://huggingface.co/fujielab/icefall_asr_csj_cejc_reazon_large_phn_writ_comp_ev_cascade_zipformer_stream_c80_c160_la0_writaux
- icefall (k2-fsa): https://github.com/k2-fsa/icefall
- k2: https://github.com/k2-fsa/k2
- CSJ (Corpus of Spontaneous Japanese): https://clrd.ninjal.ac.jp/csj/en/
- CEJC (Corpus of Everyday Japanese Conversation): https://www2.ninjal.ac.jp/conversation/cejc.html
- ReazonSpeech: https://huggingface.co/reazon-research/reazonspeech
