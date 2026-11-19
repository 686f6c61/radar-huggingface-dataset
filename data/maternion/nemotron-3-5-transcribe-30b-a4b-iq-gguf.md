# maternion/Nemotron-3.5-Transcribe-30B-A4B-IQ-GGUF

## Resumen

Nemotron-3.5-Transcribe-30B-A4B es un modelo abierto de reconocimiento automatico del habla (ASR) y transcripcion de audio desarrollado originalmente por NVIDIA. El repositorio que nos ocupa, publicado por el usuario maternion, es una conversion a formato GGUF del modelo original `nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B`, pensada para su ejecucion local mediante llama.cpp. El modelo combina un decodificador de texto con arquitectura de mezcla de expertos (MoE) y un codificador de audio NeMo, lo que le permite transcribir grabaciones de hasta una hora en 40 idiomas con atribucion de hablantes.

La relevancia de esta conversion radica en que anade los niveles de cuantizacion IQ2_NL e IQ3_NL, que no estan disponibles en otras publicaciones publicas del mismo modelo. Estos tipos de cuantizacion, basados en bloques de 32 elementos con matriz de importancia, encajan de forma nativa con las anchuras de fila de las matrices de Nemotron-H (2688, 1856 y 3712), que no son divisibles por 256 y por tanto no admiten cuantizaciones K-quant clasicas sin degradacion silenciosa. El resultado es que IQ3_NL (14,90 GB) permite ejecutar el modelo en GPU de 16 GB, un hueco que ni Q2_0 (demasiado agresivo) ni IQ4_NL (demasiado grande) cubren con comodidad.

El modelo cuenta con 32.913.266.240 parametros totales y aproximadamente 4.300 millones de parametros activos (incluyendo el codificador de audio), una longitud de contexto de 65.536 tokens y soporte para etiquetado de hablantes y control de estilo de transcripcion mediante prompt. La licencia original OpenMDW-1.1 se mantiene sin cambios en la conversion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador de texto `nemotron_h_moe` (MoE hibrido, 53 bloques, bloque MTP/NextN incluido) + codificador de audio NeMo ParallelExpertEncoder (transformer ASR y modelo de diarizacion en streaming) |
| Parametros totales | 32.913.266.240 |
| Parametros activos | ~4.300 millones (incluye el codificador de audio) |
| Longitud de contexto | 65.536 tokens |
| Tipos de cuantizacion | Q8_0 (~8,5 bpw), IQ4_NL (~4,5 bpw), IQ3_NL (~3,6 bpw), IQ2_NL (~2,6 bpw), Q2_0 (~2,25 bpw); codificador de audio en F16, BF16 y Q8_0 |
| Idiomas soportados | 40 idiomas: cs, nl, en, fr, de, hi, it, ko, pl, pt, ru, sk, es, bg, hr, da, et, fi, hu, ja, lv, lt, ro, sl, sv, th, tr, uk, ar, bn, zh, el, he, id, mt, mr, tl, ta, te, vi |
| Licencia | OpenMDW-1.1 (openmdw.ai/license/1-1/) |
| Formato de pesos | GGUF (llama.cpp); el codificador de audio se distribuye como archivo `mmproj` separado |

## Arquitectura y entrenamiento

El modelo original de NVIDIA emplea un decodificador de texto con arquitectura de mezcla de expertos hibrida (`nemotron_h_moe`) de 53 bloques, incluyendo un bloque MTP (multi-token prediction) / NextN. El codificador de audio es un NeMo ParallelExpertEncoder que integra un transformer ASR y un modelo de diarizacion de hablantes en streaming, exportado como archivo `mmproj` independiente. Esta separacion permite cargar el codificador de audio de forma opcional junto a cualquier cuantizacion del decodificador de texto.

Los detalles concretos sobre volumen de datos de entrenamiento, composicion del dataset, uso de RLHF/DPO y otras innovaciones tecnicas no estan disponibles en la informacion proporcionada; se remite al informe tecnico de NVIDIA para esos datos. La conversion GGUF de maternion no altera el entrenamiento del modelo, solo el formato y la precision numerica de los pesos. Las cuantizaciones IQ4_NL, IQ3_NL e IQ2_NL se generaron con la matriz de importancia publicada por AtomicChat.

## Capacidades

- Transcripcion de voz a texto en 40 idiomas, incluyendo espanol, ingles, frances, aleman, chino, japones, arabe, hindi y portugues, entre otros.
- Procesamiento de grabaciones de hasta una hora de duracion en una sola pasada, gracias a la ventana de contexto de 65.536 tokens.
- Atribucion de hablantes (speaker diarization) integrada en el codificador de audio NeMo.
- Control del estilo de transcripcion mediante prompt de contexto (por ejemplo, indicaciones sobre formato o terminologia).
- Capacidades conversacionales derivadas del decodificador de texto subyacente.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Marcas de tiempo a nivel de palabra y transcripcion en streaming: fuera del alcance de la implementacion actual (PR #31471).

## Casos de uso

- Transcripcion de reuniones corporativas: el modelo puede procesar grabaciones de hasta una hora con contexto de 65.536 tokens y etiquetar automaticamente a los participantes, lo que simplifica la generacion de actas y la identificacion de intervenciones por hablante.
- Generacion de subtitulos para contenido audiovisual multilingue: con soporte para 40 idiomas, se puede transcribir material en espanol, frances, aleman o japones y producir texto base para subtitulado, aunque las marcas de tiempo por palabra quedan fuera del alcance actual.
- Documentacion clinica dictada: la transcripcion offline con control de estilo mediante prompt permite adaptar el vocabulario y el formato a terminologia medica, siempre que se cumplan los requisitos regulatorios y de privacidad aplicables.
- Analisis de llamadas de atencion al cliente: la diarizacion permite separar agente y cliente en conversaciones largas, facilitando la revision de calidad y la extraccion de metricas por interlocutor.
- Investigacion en linguistica y sociolinguistica: la cobertura de 40 idiomas y la atribucion de hablantes permiten construir corpus transcritos con identificacion de turnos para estudios comparativos.
- Despliegue en local para entornos con requisitos de privacidad: las cuantizaciones IQ3_NL (14,90 GB) e IQ2_NL (11,02 GB) permiten ejecutar el modelo en GPU de consumo (16 GB) sin enviar audio a servicios en la nube, lo que resulta adecuado para datos sensibles.
- Prototipado rapido en llama.cpp: la disponibilidad de cinco niveles de cuantizacion y tres variantes del codificador de audio permite ajustar el equilibrio entre calidad y memoria segun el hardware disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos del decodificador de texto, sin contar overhead de contexto y activaciones):
  - Q8_0: 35,00 GB
  - IQ4_NL: 18,73 GB
  - IQ3_NL: 14,90 GB
  - IQ2_NL: 11,02 GB
  - Q2_0: 9,72 GB
- Codificador de audio (`mmproj`) adicional: 1,47 GB (F16 o BF16) o 782 MB (Q8_0, experimental). Es obligatorio junto a cualquier cuantizacion de texto para transcribir.
- GPU recomendadas: A100 o H100 para Q8_0 e IQ4_NL sin restricciones; RTX 4090 (24 GB) para IQ4_NL; GPU de 16 GB para IQ3_NL; GPU de 12 GB o menos para IQ2_NL y Q2_0, segun el margen disponible para contexto y activaciones.
- Cabe en GPU de consumo: si, en RTX 4090 con IQ4_NL, en GPU de 16 GB con IQ3_NL y en GPU de 12 GB con IQ2_NL o Q2_0.
- Opciones de despliegue: llama.cpp para todas las cuantizaciones. Los archivos Q8_0, IQ4_NL y Q2_0 funcionan con compilaciones de llama.cpp master a partir del merge del PR #31471 (2026-11-03). Los archivos IQ2_NL e IQ3_NL requieren compilar desde la rama `nemo-transcribe-iq23nl` del fork de maternion, ya que el PR #27983 sigue abierto y no esta upstream. Ollama y LM Studio no pueden ejecutar IQ2_NL/IQ3_NL todavia.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nemotron-3.5-Transcribe-30B-A4B (este GGUF) | 32,9B totales / ~4,3B activos | 65.536 tokens | 40 | OpenMDW-1.1 | GGUF en este repo; pesos originales en nvidia/ |
| Whisper large-v3 | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |
| Otros GGUF de Nemotron-3.5-Transcribe (AtomicChat, sakasegawa) | mismos que el original | 65.536 tokens | 40 | OpenMDW-1.1 | IQ4_NL + Q8_0, sin IQ2_NL/IQ3_NL |

La comparativa con modelos ASR de referencia como Whisper no puede completarse con datos verificables a partir de la informacion proporcionada. La diferencia practica frente a otras publicaciones GGUF del mismo modelo es la disponibilidad de los niveles IQ2_NL e IQ3_NL, que cubren el hueco entre Q2_0 e IQ4_NL.

## Limitaciones y advertencias

- Los archivos IQ2_NL e IQ3_NL no funcionan con compilaciones estandar de llama.cpp, Ollama ni LM Studio; requieren la rama `nemo-transcribe-iq23nl` del fork de maternion. Esto limita su uso en produccion hasta que el PR #27983 se integre upstream.
- Las variantes BF16 y Q8_0 del codificador de audio son no estandar; conviene verificar que cargan correctamente en la compilacion mtmd antes de depender de ellas. La variante F16 es la recomendada.
- Las marcas de tiempo a nivel de palabra y la transcripcion en streaming no estan implementadas en la ruta de audio actual (PR #31471).
- Riesgo de alucinacion en pasajes de audio con ruido, silencios prolongados o solapamiento de hablantes: no disponible en la informacion proporcionada, pero es un riesgo habitual en modelos ASR y conviene validarlo con muestras representativas.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- La licencia OpenMDW-1.1 se mantiene desde el modelo original; conviene revisar sus terminos en openmdw.ai/license/1-1/ antes de un uso comercial, especialmente en lo relativo a atribucion y redistribucion.
- La cuantizacion Q2_0 (~2,25 bpw) es agresiva y puede degradar la calidad de transcripcion; IQ3_NL se presenta como el nivel minimo recomendado para uso en 16 GB.
- El modelo esta pensado para transcripcion offline; no debe asumirse latencia de tiempo real.

## Enlaces

- Repositorio GGUF: https://huggingface.co/maternion/Nemotron-3.5-Transcribe-30B-A4B-IQ-GGUF
- Modelo original de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B
- Informe tecnico de NVIDIA: https://research.nvidia.com/labs/nemotron/files/NVIDIA-Nemotron-3.5-Transcribe-Technical-Report.pdf
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- PR de llama.cpp con la ruta de audio (merged 2026-11-03): https://github.com/ggml-org/llama.cpp/pull/31471
- PR de llama.cpp con los tipos IQ2_NL/IQ3_NL (abierto): https://github.com/ggml-org/llama.cpp/pull/27983
- Rama del fork con soporte IQ2_NL/IQ3_NL: https://github.com/maternion/llama.cpp/tree/nemo-transcribe-iq23nl
- Matriz de importancia de AtomicChat: https://huggingface.co/AtomicChat/NVIDIA-Nemotron-3.5-Transcribe-30B-A4B-GGUF
