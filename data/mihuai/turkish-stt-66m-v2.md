# mihuai/turkish-stt-66m-v2

## Resumen

turkish-stt-66m-v2 es un modelo de reconocimiento automatico del habla (ASR) para turco, desarrollado por mihuai como segunda version de su modelo turkish-stt. Se trata de un transductor Zipformer en streaming de 66 millones de parametros, disenado especificamente para inferencia en tiempo real sobre CPU, sin necesidad de GPU ni de servicios en la nube. El modelo ocupa aproximadamente 68 MB en cuantizacion int8 y procesa audio mono a 16 kHz.

El modelo resuelve el problema de la transcripcion de voz en turco con baja latencia en dispositivos de borde: agentes de voz, centros de llamadas, subtitulado en directo y dictado. Frente a alternativas offline como Whisper, que requieren GPU y procesan el audio completo antes de emitir resultados, este modelo emite resultados parciales mientras el hablante sigue hablando, con fragmentos de unos 320 ms.

La version v2 mantiene la misma arquitectura y tamano que v1 pero se ha reentrenado, reduciendo la tasa de error de palabras (WER) en FLEURS-TR de 13,90 % a 10,06 % con normalizacion estandar (una mejora del 28 %) y de 9,38 % a 6,21 % con normalizacion Damga (34 %). El modelo se distribuye bajo la mihu-community-license y esta pensado para integrarse con sherpa-onnx y con la herramienta abierta Damga para la normalizacion de texto inversa (ITN).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transductor Zipformer en streaming |
| Parametros totales | 66 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa fragmentos de ~320 ms en streaming) |
| Tipos de cuantizacion | int8 (tamano publicado ~68 MB); otros tipos no disponibles |
| Idiomas soportados | turco (tr) |
| Licencia | mihu-community-license |
| Formato de pesos | ONNX (tag `onnx`, integracion sherpa-onnx) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transductor Zipformer, un diseno de transformer eficiente orientado a ASR en streaming. El transductor combina un encoder, un predictor y una red conjunta para emitir tokens de forma incremental, lo que permite generar hipotesis parciales mientras llega el audio. La inferencia se realiza en int8 sobre una sola hebra de CPU con decodificacion `modified_beam_search` de 4 rutas, segun la model card.

No se detalla en la informacion disponible el volumen de datos de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o ajuste supervisado adicional. La model card indica que v2 fue reentrenada respecto a v1 manteniendo arquitectura y tamano identicos, y que las cifras de WER se midieron internamente con el mismo audio y el mismo script de evaluacion (`eval/score.py`). El modelo se distribuye integrado con sherpa-onnx y se complementa con Damga, una herramienta abierta de normalizacion de texto inversa para turco (numeros, fechas, dinero y telefonos).

## Capacidades

- Transcripcion de voz a texto en turco en tiempo real, con resultados parciales durante el habla.
- Inferencia en streaming con fragmentos de aproximadamente 320 ms.
- Ejecucion sobre CPU, mas rapida que el tiempo real en una sola hebra de CPU.
- Despliegue en dispositivos de borde y clase Raspberry Pi gracias a su tamano (~68 MB int8).
- Integracion con sherpa-onnx para pipelines on-device.
- Normalizacion de texto de salida mediante Damga (ITN: numeros, fechas, importes, telefonos).
- No se documentan capacidades de tool calling, agentes, vision ni audio mas alla del propio ASR.
- Soporte multilingue: solo turco.

## Casos de uso

- Agentes de voz en tiempo real: el modelo emite hipotesis parciales con fragmentos de ~320 ms, lo que permite a un agente conversacional responder antes de que el usuario termine de hablar, manteniendo la latencia baja en CPU.
- Centros de llamadas y analitica de conversaciones: transcripcion continua de audio telefonico en servidores sin GPU, con coste de computo reducido y capacidad de procesar muchas llamadas concurrentes por maquina.
- Subtitulado en directo: generacion de subtitulos incrementales para retransmisiones o reuniones en turco, aprovechando el modo streaming y la ejecucion sobre CPU estandar.
- Dictado y notas de voz: transcripcion offline en aplicaciones de escritorio o moviles, con el modelo int8 de ~68 MB embebido y sin dependencia de la nube.
- Dispositivos IoT y de borde: despliegue en hardware tipo Raspberry Pi para asistentes locales o interfaces por voz en entornos sin conectividad.
- Preprocesado para LLM y voice agents: la salida se normaliza con Damga (numeros, fechas, telefonos en forma escrita) para alimentar directamente a un modelo de lenguaje o a un sistema de comandos.

## Benchmarks y rendimiento

Resultados medidos internamente por el autor sobre FLEURS-TR (743 clips de habla leida real). Whisper ejecutado con `transformers`, fp16, `language="turkish"`, greedy; turkish-stt-66m-v2 y v1 en int8, streaming, `modified_beam_search` (4 rutas), una hebra de CPU.

| Modelo | Clase | WER % (estandar) | WER % (Damga) | CER % (Damga) |
|---|---|---:|---:|---:|
| Whisper large-v3 | offline, GPU | 7,82 | 4,48 | 1,11 |
| Whisper large-v3-turbo | offline, GPU | 8,26 | 4,84 | 1,22 |
| turkish-stt-66m-v2 | streaming, CPU | 10,06 | 6,21 | 1,70 |
| turkish-stt (v1) | streaming, CPU | 13,90 | 9,38 | 2,50 |
| Whisper small | offline, GPU | 17,41 | 13,27 | 3,18 |

Con la regla de puntuacion mas laxa ("medium WER"), turkish-stt-66m-v2 obtiene 5,28 % WER en FLEURS-TR (CER 1,63 %). El servicio alojado mihu voice (no descargable) reporta 3,42 % WER bajo esa misma regla.

## Requisitos de hardware

- VRAM estimada: no aplica en el caso base; el modelo esta disenado para CPU. En int8 ocupa ~68 MB de memoria.
- GPU recomendadas: no necesarias; la model card no documenta requisitos de GPU.
- Cabe en GPU de consumo: si, aunque su objetivo es CPU; cualquier GPU consumer puede alojarlo sobradamente.
- Despliegue: sherpa-onnx (integracion principal, formato ONNX); no se documentan otras opciones como vLLM, llama.cpp o TGI.
- Latencia y throughput: mas rapido que el tiempo real en una sola hebra de CPU; fragmentos de ~320 ms; cifras concretas de throughput no disponibles.
- Dispositivos de borde: apto para hardware clase Raspberry Pi.

## Comparativa con modelos similares

| Modelo | Parametros | Modo | Contexto / chunk | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| turkish-stt-66m-v2 | 66 M | streaming, CPU | ~320 ms | mihu-community-license | Hugging Face, ONNX |
| Whisper small | ~244 M | offline, GPU | audio completo | MIT (Whisper) | Hugging Face |
| Whisper large-v3 | ~1,5 B | offline, GPU | audio completo | MIT (Whisper) | Hugging Face |
| Whisper large-v3-turbo | ~0,8 B | offline, GPU | audio completo | MIT (Whisper) | Hugging Face |

En precision sobre habla leida, Whisper large-v3 y turbo siguen por delante (4,48 % y 4,84 % WER con normalizacion Damga frente a 6,21 %), pero son entre 12 y 24 veces mas grandes, no hacen streaming y no alcanzan tiempo real en CPU. Frente a Whisper small, turkish-stt-66m-v2 es claramente mas preciso (6,21 % frente a 13,27 % con Damga) y mucho mas pequeno.

## Limitaciones y advertencias

- Solo soporta turco; no hay capacidades multilingues.
- Entrenado y evaluado principalmente sobre habla leida (FLEURS-TR); el rendimiento en audio telefonico de 8 kHz no esta soportado (esa funcion se reserva al servicio alojado mihu voice).
- Riesgo de alucinacion y de errores en nombres propios, siglas y terminos tecnicos, comun en modelos ASR pequenos.
- La licencia mihu-community-license no es una licencia open source estandar; es necesario revisar el fichero LICENSE para conocer las restricciones de uso comercial.
- Las cifras de WER son mediciones internas del autor con su propio script de evaluacion; la comparacion con terceros depende de la regla de normalizacion empleada (estandar, Damga o medium), por lo que no son directamente intercambiables.
- No se documentan sesgos especificos ni composicion del dataset de entrenamiento, lo que limita la evaluacion de robustez ante acentos o registros no representados.
- Para produccion con alta precision, el propio autor remite a su servicio alojado (3,42 % WER) en lugar de este modelo descargable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mihuai/turkish-stt-66m-v2
- Version anterior (v1): https://huggingface.co/mihuai/turkish-stt
- Servicio alojado mihu voice: https://voice.mihu.ai
- Damga (ITN/TN para turco): https://github.com/mihu-ai/damga
- Script de evaluacion: `eval/score.py` (incluido en el repositorio del modelo)
