# jsaigou/Haru-4B-bf16-radiance

## Resumen

Haru-4B-bf16-radiance es un contenedor de inferencia en formato `.rad` para el modelo de diálogo hablado full-duplex Haru-4B, desarrollado originalmente por higurashi-ai y convertido por jsaigou para el motor Radiance sobre hardware AMD Strix Halo. El modelo base Haru-4B es un sistema de voz a voz de baja latencia que escucha y habla simultáneamente, procesando tramas de audio de 133 ms. Su relevancia radica en que permite ejecutar conversación hablada full-duplex en una APU AMD (Ryzen AI MAX+ 395 con GPU Radeon 8060S, gfx1151), sin depender de GPUs NVIDIA ni de checkpoints PyTorch/transformers.

El contenedor es una conversión exacta a bfloat16 del checkpoint original (1022 tensores ya en bf16), sin cuantización, poda ni fine-tuning adicional. Incluye 4B parámetros, soporte para inglés y japonés, y una ventana de contexto de 14.500 posiciones configurable por lane. No es un modelo de chat textual: se opera mediante sesiones de audio streaming por WebSocket a 24 kHz.

La ficha describe tanto el modelo base como las particularidades del contenedor `.rad`, incluyendo requisitos de hardware, protocolo de sesión y limitaciones de fidelidad numérica medidas por el autor del contenedor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Full-duplex speech-to-speech (audio-to-audio), basada en Haru-4B; detalles internos de la arquitectura del modelo base no disponibles |
| Parametros totales | 4B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 14.500 posiciones (configurado en el despliegue de referencia) |
| Tipos de cuantizacion | bf16 (conversión exacta, sin cuantización); proyectores de audio, latent scale/bias, norms y cabeza MeanFlow en float32 |
| Idiomas soportados | inglés (en), japonés (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (contenedor propietario del motor Radiance); no compatible con safetensors, GGUF, PyTorch, transformers, MLX ni vLLM |
| Tamano del repositorio | 10,5 GB (fichero `haru-bf16.rad` de 10.549.928.384 bytes) |
| Pipeline | audio-to-audio |
| Libreria | radiance |

## Arquitectura y entrenamiento

El modelo base Haru-4B es un sistema de diálogo hablado full-duplex que procesa audio en tramas de 133 ms (7,5 tramas por segundo, 3.200 muestras por trama a 24 kHz), escuchando y hablando de forma simultánea. El contenedor `.rad` preserva la precisión original: los 1022 tensores del checkpoint de origen ya estaban en bfloat16, por lo que la conversión es un cast exacto. Los componentes declarados como float32 por los bloques del modelo (proyectores de audio, latent scale y bias, norms y la cabeza MeanFlow) se ensanchan exactamente de bf16 a float32 en el loader, permaneciendo en float32 dentro del contenedor.

La conversión se realizó el 20 de noviembre de 2026 desde la revisión `8d6e83bcd3701a76fc27a764965665da1df7da78` del modelo original, usando la herramienta `rad-convert` del fork y la receta `data/recipes/haru-bf16.recipe` con la regla `* cast dtype=bf16`. No se dispone de información sobre el dataset de entrenamiento, número de tokens, composición de datos ni procesos de RLHF/DPO del modelo base en la información proporcionada. El motor Radiance implementa decodificación con `--num-speculative-tokens` configurable (0 en el despliegue de referencia) y soporte multi-lane (`--duplex-max-lanes 2`).

## Capacidades

- Diálogo hablado full-duplex: escucha y habla simultáneamente, procesando audio en tramas de 133 ms.
- Speech-to-speech (audio-to-audio): entrada y salida de audio a 24 kHz mediante sesiones WebSocket.
- Conversación multi-turno natural en inglés y japonés.
- Clonación de voz a partir de un clip de referencia corto (el modelo imita la voz del clip; requiere derechos sobre la voz).
- Personalización mediante character card al abrir sesión (el modelo no incluye clips de voz por defecto).
- Soporte de múltiples lanes simultáneos (`--duplex-max-lanes 2` en el despliegue de referencia).
- No es un modelo de instrucciones tipo asistente: no sigue instrucciones como un LLM convencional ni es fiable como fuente de hechos.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de visión, código, matemáticas o razonamiento textual: no disponibles (modelo exclusivamente de voz).

## Casos de uso

- Atención al cliente por voz en tiempo real: el modelo mantiene conversaciones habladas multi-turno con latencia de paso de 68-81 ms, por debajo del presupuesto de 133 ms por trama, lo que permite interacción natural sin turnos rígidos.
- Asistentes conversacionales locales en hardware AMD: al ejecutarse en una APU Ryzen AI MAX+ 395 con 12,75 GiB de presupuesto de memoria para dos lanes, permite desplegar diálogo hablado en estaciones de trabajo sin GPU NVIDIA.
- Agentes de voz con personalidad: la apertura de sesión con character card y clip de referencia permite crear personajes conversacionales con voz clonada, útil en prototipos de experiencias interactivas.
- Investigación en diálogo full-duplex: el contenedor pasa la suite de conformidad Forge duplex (10 checks) y ofrece fidelidad medida frente a la referencia float32 (coseno 0,9999 en inglés en las primeras 120 tramas), sirviendo como base reproducible para experimentos de interacción hablada.
- Evaluación de motores de inferencia alternativos: permite comparar el rendimiento del motor Radiance frente a implementaciones PyTorch del mismo modelo en tareas de audio streaming.
- Sistemas de práctica de conversación en inglés y japonés: el soporte bilingüe y la naturaleza full-duplex permiten escenarios de aprendizaje de idiomas con interrupciones y solapamiento de habla.
- Despliegue en entornos con restricciones de licencia permisiva: la licencia Apache 2.0 facilita integración en productos comerciales, siempre que se respeten los derechos sobre las voces de referencia utilizadas.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Fidelidad vs referencia float32 (inglés, primeras 120 tramas) | coseno 0,9999; distancia log-mel 0,04 |
| Fidelidad vs referencia float32 (japonés) | coseno medio 0,988 |
| Latencia por paso de decodificación (mediana) | 68-78 ms |
| Latencia por paso de decodificación (percentil 95) | 77-81 ms |
| Presupuesto por trama | 133 ms |
| Apertura de sesión con voz de referencia de 70 tramas | ~0,8 s |
| Memoria del contenedor | 9,8 GiB |
| Memoria presupuestada (2 lanes, 14.500 posiciones) | 12,75 GiB |
| Conformidad Forge duplex | 10/10 checks superados |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible, ya que el modelo es de audio y no de texto. Las cifras de fidelidad corresponden a un clip fijo, no a una puntuación de calidad subjetiva; el autor indica que no ha medido calidad de voz más allá de escuchar salidas en inglés y japonés.

## Requisitos de hardware

- Hardware probado: AMD Strix Halo (Ryzen AI MAX+ 395, Radeon 8060S, gfx1151). Es el único hardware validado por el autor del contenedor.
- Sistema operativo: Linux con ROCm 10.1 (build TheRock) y parámetro de kernel `amdgpu.cwsr_enable=1` (requiere reinicio; el motor no arranca sin él).
- Toolchain de compilación: `git`, `cmake`, `ninja` y compilador C++.
- Compilación del motor: aproximadamente 10-20 minutos, con `-DRAD_GPU_TARGETS=gfx1151`.
- VRAM/memoria: contenedor de 9,8 GiB; 12,75 GiB presupuestados para dos lanes de 14.500 posiciones.
- GPU recomendadas: no disponible para NVIDIA; el autor solo valida gfx1151 (AMD Strix Halo). No se indica compatibilidad con A100, H100 ni RTX 4090.
- Compatibilidad con GPU de consumo: no disponible; el hardware validado es una APU AMD, no una GPU discreta de consumo.
- Opciones de despliegue: exclusivamente el motor Radiance (fork `jsaigou/radiance-strix`, rama `haru/main`, commit `3eafc24` probado). No funciona en llama.cpp, Ollama, vLLM, transformers ni MLX.
- Servicio: WebSocket en `127.0.0.1:8102`, con `--tp 1`, `--max-model-len 14500`, `--max-num-seqs 2`, `--num-speculative-tokens 0`, `--duplex-max-lanes 2`, `--duplex-max-ctx 14500`.
- Ajustes de sampler del autor: `--duplex-temperature 0.55 --duplex-eop-bias 1 --duplex-dry-multiplier 1.0` (preferencias, no requisitos).
- Latencia y throughput: pasos de 68-81 ms; dos lanes cumplen el presupuesto de 133 ms pero no un objetivo de percentil 95 de 100 ms. La línea base de la máquina derivó ~7 ms durante las mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Haru-4B-bf16-radiance (este) | 4B | 14.500 posiciones | Speech-to-speech full-duplex, contenedor `.rad` | Apache 2.0 | Solo motor Radiance en AMD gfx1151 |
| higurashi-ai/Haru-4B (original) | 4B | no disponible | Speech-to-speech full-duplex | Apache 2.0 | PyTorch/transformers (según model card original) |
| Alternativas de speech-to-speech en formato abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos comparativos de rendimiento frente a otros modelos de speech-to-speech. La comparación principal es con el checkpoint original Haru-4B, del que este contenedor es una conversión exacta sin cambios de precisión.

## Limitaciones y advertencias

- Modelo base preentrenado para investigación: mantiene conversaciones naturales pero no es una fuente fiable de hechos ni sigue instrucciones como un asistente.
- No es un checkpoint PyTorch, transformers, MLX ni vLLM: no carga en esas librerías ni en llama.cpp, Ollama o vLLM. Requiere el fork del motor Radiance.
- Compatibilidad hardware muy restringida: solo validado en AMD Strix Halo (gfx1151) con ROCm 10.1 y `amdgpu.cwsr_enable=1`. Otros hardware no están probados.
- Dependencia de un fork no oficial y de un commit concreto (`3eafc24`); commits posteriores de la rama no están testeados con este fichero.
- Fidelidad numérica degradada en tramas sensibles a diferencias numéricas pequeñas, tanto en inglés como en japonés; incluso la referencia float32 diverge caóticamente al realimentar su propia salida.
- Clonación de voz: el modelo imita la voz del clip de referencia; solo debe usarse con voces sobre las que se tengan derechos.
- El modelo no incluye clips de voz; cada sesión requiere character card y clip de referencia.
- Idiomas: solo inglés y japonés validados; el autor no reclama calidad en otros idiomas que el modelo original pudiera soportar.
- Rendimiento con dos lanes: cumple el presupuesto de 133 ms pero no un objetivo de percentil 95 de 100 ms.
- Licencia Apache 2.0 permite uso comercial, pero deben respetarse los derechos sobre voces de referencia y las condiciones del modelo base original.
- No se han medido métricas subjetivas de calidad de voz; las cifras de fidelidad son sobre un clip fijo y no constituyen una puntuación de calidad.

## Enlaces

- Contenedor en Hugging Face: https://huggingface.co/jsaigou/Haru-4B-bf16-radiance
- Modelo base original: https://huggingface.co/higurashi-ai/Haru-4B
- Fork del motor Radiance para Strix Halo: https://github.com/jsaigou/radiance-strix
- Protocolo de sesión del fork: https://github.com/jsaigou/radiance-strix/blob/haru/main/arch/haru_common/README.md
- Proyecto Radiance original: https://codeberg.org/StillDeadcode/radiance
