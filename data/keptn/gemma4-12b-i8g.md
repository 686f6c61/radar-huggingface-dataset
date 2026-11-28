# keptn/gemma4-12b-i8g

## Resumen

keptn/gemma4-12b-i8g es una cuantizacion int8 del modelo multimodal google/gemma-4-12B-it, empaquetada en un unico fichero de 13,79 GiB para el motor de inferencia radiance sobre GPUs AMD RDNA4. El trabajo lo publica el usuario keptn (StillDeadcode, autor de radiance) y no Google: el modelo base, la cabeza asistente de decodificacion especulativa, el torre de vision y el codificador de audio son de Google; el formato de pesos y el motor de ejecucion son del autor de la cuantizacion. Resuelve el problema de desplegar un modelo de 12B con entradas de texto, imagen y audio en hardware AMD consumer y profesional (RDNA4) sin recurrir a CUDA ni a pesos bf16.

La relevancia es doble. Por un lado, demuestra que el ecosistema AMD puede ejecutar modelos multimodales de 12B con contexto de 262.144 tokens a velocidades de 104,6 tokens/s en una sola Radeon AI PRO R9700 y hasta 250 tokens/s en cuatro tarjetas. Por otro, cuantifica con rigor la perdida de calidad de la cuantizacion int8 frente al original bf16 (KL medio de 0,00416 en MT-Bench, con un 98,1% de coincidencia en el token top). El repositorio esta archivado desde el 26 de noviembre de 2026 y el autor recomienda migrar a keptn/gemma4-12b-exl3, que ofrece menor tamano con la misma calidad y requiere radiance 2.3.0 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto, vision, audio) con cabeza asistente de decodificacion especulativa (MTP); detalles internos del modelo base no disponibles |
| Parametros totales | 12B (segun el nombre del modelo base google/gemma-4-12B-it) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | Pesos int8 con una escala bf16 por cada 128 pesos (round-to-nearest); activaciones int8 con una escala por token y 128 valores; KV cache en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (la del modelo base) |
| Formato de pesos | `.rad` (formato propietario de radiance), fichero unico de 13,79 GiB |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-12B-it es un transformer multimodal de Google que acepta texto, imagen y audio como entradas. Esta ficha no dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las fases de alineacion (RLHF, DPO) del modelo original. Lo que si documenta el autor de la cuantizacion es la arquitectura del empaquetado: los pesos del tronco se almacenan en int8 con una escala bf16 compartida por cada 128 pesos, redondeando al valor mas cercano sin datos de calibracion; las activaciones tambien se cuantizan a int8 con una escala por token y por bloque de 128 valores, mientras que la cache KV se mantiene en bf16.

La innovacion tecnica destacable es el uso de la cabeza asistente de Google (google/gemma-4-12B-it-assistant) para decodificacion especulativa con 3 tokens de borrador, integrada en el motor radiance. Esto permite acelerar la decodificacion sin cambiar la distribucion de salida. El autor reporta que la cuantizacion int8 introduce una divergencia medible pero pequena respecto al bf16: KL medio de 0,00416 y percentil 99 de 0,0535 sobre 42.283 tokens de respuesta en MT-Bench, con un 98,1% de coincidencia en el token top y un ratio de perplejidad de 1,004. Para comparar, el propio fichero bf16 de keptn obtiene KL medio de 0,00026 y 99,6% de coincidencia.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con plantilla de chat propia del modelo base.
- Procesamiento de imagenes (image-text-to-text): el pipeline declarado en Hugging Face es `image-text-to-text`.
- Procesamiento de audio: el autor valida la transcripcion sobre 12 clips de LibriSpeech test-clean, con una tasa de error de palabra del 6,81% frente al 6,68% del original bf16.
- Modo thinking opcional, activable por peticion mediante `chat_template_kwargs: {"enable_thinking": true}`; por defecto viene desactivado en la configuracion de ejemplo.
- Decodificacion especulativa con la cabeza asistente de Gemma 4 (3 tokens de borrador), configurable o desactivable (`num-speculative-tokens: 0`).
- Contexto largo de hasta 262.144 tokens compartido entre todas las secuencias del servidor.
- Servicio concurrente: la configuracion de ejemplo admite hasta 8 secuencias simultaneas (`max-num-seqs: 8`).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Cobertura multilingue: no disponible.

## Casos de uso

- Despliegue de un asistente multimodal en hardware AMD RDNA4: el fichero esta pensado para radiance sobre una, dos o cuatro tarjetas de 32 GB (probado en Radeon AI PRO R9700), lo que permite montar un servicio de chat con imagen y audio sin GPUs NVIDIA.
- Analisis de documentos con imagen: el modelo acepta imagenes y el autor valida la salida sobre DocVQA y AI2D con 20/20 respuestas identicas al bf16 y KL medio de 0,00184; es adecuado para extraccion de informacion de facturas, formularios o capturas.
- Transcripcion y comprension de audio: con una WER del 6,81% en LibriSpeech test-clean, sirve para prototipos de dictado, subtitulado o analisis de llamadas, siempre validando con datos propios porque la muestra del autor es de solo 12 clips.
- Procesamiento de contextos muy largos: los 262.144 tokens permiten resumir o consultar repositorios de documentacion, expedientes o historiales de conversacion completos en una sola ventana; el pool de KV admite hasta 1.792.432 tokens de contexto agregados con 4 tarjetas y 8 secuencias.
- Servicio de inferencia concurrente de bajo coste: con 4 tarjetas se miden 714 tokens/s agregados en 4 streams y 250 tokens/s en un solo stream, cifras utiles para atender varios usuarios simultaneos en una sola maquina.
- Evaluacion y benchmarking de cuantizaciones: el repositorio incluye metodologia reproducible (`--kld-ref`, MT-Bench, comparacion contra bf16 en transformers), lo que lo convierte en referencia para medir el impacto de int8 en modelos multimodales.
- Base para pipelines de investigacion en AMD: al estar disponible el codigo de radiance y el formato i8g, sirve para estudiar decodificacion especulativa y cuantizacion en ROCm sin depender de CUDA.

## Benchmarks y rendimiento

Rendimiento de decodificacion y prefill medido por el autor con BetterBench 0.6.1, temperatura 0,7, KV en bf16, 3 tokens de borrador y thinking desactivado, sobre Radeon AI PRO R9700 a 215 W:

| Metrica | 1 tarjeta | 2 tarjetas | 4 tarjetas |
|---|---|---|---|
| Decode, un stream (tokens/s) | 104,6 | 174,7 | 250,0 |
| Prefill a 24k tokens (tokens/s) | 3.597 | 5.883 | 7.069 |
| 4 streams, total (tokens/s) | 306 | 506 | 714 |

Calidad frente al original bf16 en transformers (MT-Bench, 80 preguntas, ambos turnos, 42.283 tokens de respuesta):

| Metrica | Este fichero (int8) | keptn/gemma4-12b-bf16 |
|---|---|---|
| KL medio | 0,00416 | 0,00026 |
| KL percentil 99 | 0,0535 | 0,00325 |
| Token top coincidente | 98,1% | 99,6% |
| Ratio de perplejidad | x1,004 | x1,000 |

Capacidades multimodales (greedy, thinking off, 2 tarjetas, medidas con el fichero bf16 `gemma4-12b-bf16.rad`):

| Entrada | Casos | Respuesta identica | KL medio | Token top coincidente |
|---|---|---|---|---|
| Imagenes (DocVQA y AI2D) | 20 | 20/20 | 0,00184 | 149/149 |
| Audio (LibriSpeech test-clean) | 12 | 11/12 | 0,00068 | 350/351 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el fichero pesa 13,79 GiB; el autor indica tarjetas de 32 GB (probado en Radeon AI PRO R9700) para 1, 2 o 4 GPUs, con margen para cache KV en bf16.
- GPUs soportadas: AMD RDNA4, con ROCm. El autor solo documenta pruebas en Radeon AI PRO R9700; no hay datos de otras tarjetas.
- GPUs NVIDIA: no soportadas por este formato; el motor radiance esta orientado a AMD.
- Cabe en GPU consumer: no disponible; el autor no publica pruebas en Radeon RX consumer de RDNA4.
- Despliegue: exclusivamente mediante el motor radiance (imagen Docker `stilldeadcode/radiance:2.0.0` o superior), con fichero de configuracion `radiance.yaml`. No hay versiones GGUF, ni soporte para vLLM, llama.cpp, Ollama o TGI.
- Configuracion de referencia: `tp: 1`, `tp: 2` o `tp: 4`; `p2p: on` con mas de una tarjeta; `max-model-len: 262144`; `max-num-seqs: 8`; `num-speculative-tokens: 3`.
- Latencia y throughput: segun la tabla de benchmarks (104,6 a 250 tokens/s en decode de un stream; 306 a 714 tokens/s agregados en 4 streams).
- Memoria de contexto: el pool de KV admite 524.336 tokens con 2 secuencias, 1.048.624 con 4 y hasta 1.792.432 con 8 secuencias en 4 tarjetas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Hardware | Licencia | Estado |
|---|---|---|---|---|---|---|
| keptn/gemma4-12b-i8g | 12B | 262.144 | `.rad` int8 | AMD RDNA4, radiance >= 2.0.0 | Apache 2.0 | Archivado (2026-11-26) |
| keptn/gemma4-12b-bf16 | 12B | 262.144 | `.rad` bf16 | AMD RDNA4, radiance | Apache 2.0 | Activo (referencia de calidad) |
| keptn/gemma4-12b-exl3 | 12B | no disponible | EXL3 | AMD RDNA4, radiance >= 2.3.0 | Apache 2.0 | Recomendado por el autor |
| google/gemma-4-12B-it | 12B | 262.144 | safetensors (bf16) | CUDA/ROCm con transformers | Apache 2.0 | Modelo base original |

El autor no publica comparaciones con modelos de otros fabricantes ni con cuantizaciones de otros motores. La comparativa mas relevante es interna: exl3 sustituye a i8g por menor tamano con la misma calidad, y bf16 sirve como referencia de maxima fidelidad.

## Limitaciones y advertencias

- Repositorio archivado: no recibira actualizaciones y el autor recomienda migrar a keptn/gemma4-12b-exl3.
- Cuantizacion sin calibracion: los pesos se redondean al valor mas cercano sin datos de calibracion, lo que introduce una divergencia medible (KL medio 0,00416) frente al bf16.
- Validacion multimodal incompleta: las pruebas de imagen y audio se hicieron con el fichero bf16, no con este fichero int8; el autor asume que comparten torre de vision y codificador de audio, pero no lo verifica.
- Muestra de audio muy pequena: solo 12 clips de LibriSpeech test-clean; no hay evidencia sobre acentos, ruido, musica o idiomas distintos del ingles.
- Dependencia de un unico motor: solo funciona con radiance, lo que limita la portabilidad y ata el despliegue a ROCm y a AMD RDNA4.
- Riesgo de alucinacion y sesgos: no documentados por el autor; son los inherentes al modelo base google/gemma-4-12B-it y no se han evaluado especificamente para esta cuantizacion.
- Idiomas soportados: no disponibles en la informacion proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar el fichero `LICENSE` del repositorio y los terminos del modelo base de Google.
- Sin soporte de tool calling ni de agentes documentado: no se puede asumir su disponibilidad en produccion sin probarlo.
- Contexto de 262.144 tokens: aunque el modelo lo declara, el rendimiento real en contextos muy largos no esta medido en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/keptn/gemma4-12b-i8g
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Version bf16 de referencia: https://huggingface.co/keptn/gemma4-12b-bf16
- Version recomendada (EXL3): https://huggingface.co/keptn/gemma4-12b-exl3
- Motor radiance (codigo): https://codeberg.org/StillDeadcode/radiance
- Guia Docker de radiance: https://codeberg.org/StillDeadcode/radiance/src/branch/main/docs/DOCKER.md#run-it
- Dataset MT-Bench: https://huggingface.co/datasets/lmsys/mt_bench_human_judgments
- Dataset LibriSpeech: https://huggingface.co/datasets/openslr/librispeech_asr
