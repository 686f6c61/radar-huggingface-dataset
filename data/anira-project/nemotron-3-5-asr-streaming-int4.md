# anira-project/nemotron-3.5-asr-streaming-int4

## Resumen

Nemotron 3.5 ASR Streaming 0.6B es un modelo de reconocimiento automatico del habla (ASR) desarrollado originalmente por NVIDIA, disenado especificamente para transcripcion en streaming de baja latencia. Esta ficha describe la variante `anira-project/nemotron-3.5-asr-streaming-int4`, una exportacion a ONNX con cuantizacion int4 del modelo base de 0,6 mil millones de parametros, preparada por el proyecto anira para su uso con su propio runtime de inferencia.

El modelo emplea una arquitectura FastConformer con encoder cache-aware, un decodificador RNNT (Recurrent Neural Network Transducer) basado en LSTM y una red conjunta (joint network) que produce logits sobre un vocabulario de 13.088 tokens. El encoder procesa ventanas de audio de 560 ms (56 frames nuevos mas 9 frames de solape) manteniendo estado entre pasos, lo que permite transcripcion continua sin necesidad de reenviar todo el audio acumulado.

La relevancia de esta variante concreta radica en su empaquetado: los tres componentes ONNX (encoder, decoder, joint) junto con sus ficheros de datos externos, configuraciones de front-end y tokenizador, listos para integracion en el runtime anira. El repositorio ocupa 0,8 GB, lo que refleja el ahorro de la cuantizacion int4 frente a los pesos originales en precision completa. La licencia es OpenMDW 1.1, heredada del modelo base de NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder cache-aware) + RNNT decoder (LSTM) + joint network |
| Parametros totales | 0,6 mil millones (modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | streaming por ventanas de 560 ms con cache de 9 frames de solape |
| Tipos de cuantizacion | int4 (exportacion ONNX) |
| Idiomas soportados | 40 idiomas (segun model card del modelo base); lista concreta no disponible |
| Licencia | OpenMDW License Agreement 1.1 |
| Formato de pesos | ONNX (encoder.onnx, decoder.onnx, joint.onnx con ficheros `.data` externos) |

## Arquitectura y entrenamiento

El modelo base sigue el diseno FastConformer de NVIDIA, un encoder transformer convolucional optimizado para senal de audio. La variante streaming utiliza un esquema cache-aware: en cada paso el encoder recibe una senal de entrada de forma `[1, 65, 128]` (9 frames de arrastre mas 56 frames nuevos, equivalentes a 560 ms con un hop de 10 ms y 128 bins mel a 16 kHz), junto con las caches `cache_last_channel [1, 24, 56, 1024]` y `cache_last_time [1, 24, 1024, 8]`, y devuelve `outputs [1, 7, 1024]` junto con los valores actualizados de las caches. El decodificador RNNT es una red de prediccion LSTM con estado `h_in`/`c_in` de forma `[2, 1, 640]` que produce `decoder_output [1, 640, T]`. La red conjunta combina las salidas del encoder y del decodificador para generar logits sobre 13.088 clases (13.087 tokens mas blank).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO, ya que la model card de esta variante no los detalla y no se ha proporcionado la del modelo base. La innovacion tecnica destacable es el soporte de streaming nativo con estado persistente entre pasos, que evita recalcular el contexto acustico completo en cada inferencia. El front-end utiliza 16 kHz, 128 bins mel y hop de 10 ms, con un identificador de idioma (`lang_id`, int64) como entrada adicional al encoder, lo que sugiere capacidad multilingue condicionada por idioma.

## Capacidades

- Reconocimiento automatico del habla en streaming con latencia de ventana de 560 ms.
- Transcripcion multilingue: el modelo base declara soporte para 40 idiomas, seleccionables mediante la entrada `lang_id`.
- Procesamiento incremental con caches de encoder y estado LSTM del decodificador, adecuado para audio continuo.
- Salida token a token mediante decodificacion RNNT (greedy o beam search, segun implemente el runtime).
- Integracion con VAD externo: la variante anira excluye el `silero_vad.onnx` del repositorio original y delega en `anira-project/silero-vad`.
- No se ha documentado soporte de tool calling, agentes, vision ni audio mas alla del propio ASR.

## Casos de uso

- Transcripcion de reuniones en tiempo real: el modelo procesa audio en ventanas de 560 ms manteniendo caches de encoder y estado LSTM, lo que permite generar subtitulos conforme se habla sin acumular el audio completo en memoria.
- Subtitulado en directo de video o streaming: la latencia de una ventana y el bajo coste de la cuantizacion int4 lo hacen adecuado para pipelines de captioning en produccion con GPUs modestas.
- Asistentes de voz y dictado: la entrada `lang_id` permite seleccionar el idioma de reconocimiento, util en aplicaciones multilingues de dictado o comandos por voz.
- Analisis de llamadas de atencion al cliente: transcripcion por turnos con estado persistente, integrable en sistemas de analitica que necesitan texto alineado temporalmente con el audio.
- Despliegue en dispositivos con recursos limitados: el repositorio de 0,8 GB en int4 ONNX permite ejecucion en CPU o GPUs de gama baja mediante runtimes ONNX, sin depender de frameworks de deep learning pesados.
- Investigacion en ASR en streaming: los tres grafos ONNX separados (encoder, decoder, joint) facilitan experimentar con decodificacion, beam search o sustitucion de componentes sin reentrenar.
- Integracion en aplicaciones de accesibilidad: transcripcion en vivo de conversaciones presenciales o videollamadas con VAD de Silero para segmentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el repositorio completo ocupa 0,8 GB en int4, por lo que el modelo cabe holgadamente en GPUs consumer con 4 GB o mas.
- GPU recomendadas: cualquier GPU con soporte ONNX Runtime (RTX 3060 o superior, A100, H100); para CPU, un procesador moderno con AVX2 es suficiente para inferencia en tiempo real de un modelo de 0,6B.
- Cabe en GPU consumer: si, practicamente en cualquier GPU consumer actual gracias a la cuantizacion int4.
- Opciones de despliegue: runtime anira (libreria declarada), ONNX Runtime; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a ASR.
- Latencia y throughput estimados: no disponibles; la ventana de 560 ms define la granularidad minima de emision, pero no se han publicado cifras de RTF (real-time factor) ni de latencia extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| anira-project/nemotron-3.5-asr-streaming-int4 | 0,6B | streaming, 560 ms por paso | ONNX int4 | OpenMDW 1.1 | Hugging Face |
| onnx-community/nemotron-3.5-asr-streaming-0.6b-onnx-int4 | 0,6B | streaming, 560 ms por paso | ONNX int4 | metadatos inconsistentes (mit / NVIDIA Open Model License) | Hugging Face |
| nvidia/nemotron-3.5-asr-streaming-0.6b | 0,6B | streaming, 560 ms por paso | safetensors (presumiblemente) | OpenMDW 1.1 | Hugging Face |

Las tres variantes comparten el mismo modelo subyacente; las diferencias estan en el empaquetado (estructura de directorios `onnx/`, inclusion o no de VAD) y en la licencia declarada. No se dispone de datos de rendimiento comparativo entre ellas ni frente a otros modelos ASR de la misma categoria.

## Limitaciones y advertencias

- La model card de esta variante no documenta sesgos conocidos; al ser una exportacion del modelo de NVIDIA, hereda los sesgos acusticos y linguisticos de su dataset de entrenamiento, no disponible en la informacion proporcionada.
- Riesgo de alucinacion inherente a los modelos RNNT en audio con ruido o silencio prolongado; se recomienda VAD previo (el proyecto anira usa Silero VAD).
- La lista concreta de los 40 idiomas no esta disponible; el rendimiento puede variar significativamente entre idiomas y no se garantiza paridad.
- La licencia OpenMDW 1.1 debe revisarse antes de uso comercial; la model card advierte de que el repositorio de onnx-community declara "mit" y NVIDIA Open Model License en sus metadatos, mientras que este mirror sigue la licencia del modelo base.
- El modelo esta empaquetado para el runtime anira; su uso fuera de ese runtime requiere adaptar los grafos ONNX y las configuraciones de streaming.
- No se incluye `silero_vad.onnx` en este repositorio; es necesario obtenerlo por separado para pipelines con deteccion de actividad de voz.
- No hay informacion publicada sobre latencia, throughput ni calidad de transcripcion (WER) de esta variante cuantizada a int4.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/anira-project/nemotron-3.5-asr-streaming-int4
- Modelo base: https://huggingface.co/nvidia/nemotron-3.5-asr-streaming-0.6b
- Exportacion ONNX int4 de origen: https://huggingface.co/onnx-community/nemotron-3.5-asr-streaming-0.6b-onnx-int4
- Runtime anira: https://github.com/anira-project/anira
- Catalogo de modelos anira: https://github.com/anira-project/models
- VAD de anira: https://huggingface.co/anira-project/silero-vad
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
