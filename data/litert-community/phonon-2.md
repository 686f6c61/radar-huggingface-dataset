# litert-community/Phonon-2

## Resumen

Phonon-2 es un modelo de reconocimiento automático del habla (ASR) en inglés desarrollado por FermionResearch y convertido a LiteRT por la comunidad litert-community. Está basado en la arquitectura Parakeet con decodificación TDT (Token-and-Duration Transducer), un esquema que predice simultáneamente tokens y duraciones para acelerar la decodificación. El modelo original se ha cuantizado y compilado para ejecutarse en dispositivos móviles Android, con soporte para NPU, GPU y CPU.

La relevancia de esta versión radica en su rendimiento en hardware móvil: según la model card, transcribe 178 veces más rápido que tiempo real en la NPU de un Galaxy S26 y 26 veces más rápido en la GPU de un Pixel 11 Pro, con una tasa de error de palabra (WER) del 1,726 % en LibriSpeech test-clean, prácticamente idéntica al 1,736 % del modelo original en float32 con PyTorch.

El repositorio incluye codificadores en formato TFLite para ventanas de audio de 5, 7,5, 10, 15, 20, 25 y 30 segundos, en variantes f16 (GPU/NPU) e i8 (CPU), además de un front-end log-mel y un decodificador TDT. El modelo está pensado exclusivamente para inglés y se distribuye bajo licencia CC-BY-4.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Parakeet con decodificador TDT (Token-and-Duration Transducer); encoder transformer con subsampling y convoluciones depthwise |
| Parametros totales | no disponible (el repo ocupa 9,4 GB, pero incluye múltiples variantes y ventanas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | ventanas de audio de hasta 30 s (479.840 muestras a 16 kHz); ventanas adicionales de 5, 7,5, 10, 15, 20 y 25 s |
| Tipos de cuantizacion | float16 (f16) para GPU/NPU; int8 (i8) para CPU con escalas por canal de salida; float32 en capas depthwise y tablas de posición relativa |
| Idiomas soportados | inglés (en) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | TFLite (LiteRT); tokenizer en JSON |

## Arquitectura y entrenamiento

Phonon-2 sigue la arquitectura Parakeet, un modelo de ASR basado en transformer con decodificación TDT. El pipeline completo es: audio mono a 16 kHz → ventanas de 30 s → front-end log-mel → encoder → decodificación greedy TDT → texto. El encoder incorpora capas lineales, convoluciones 1×1 en el subsampling y convoluciones depthwise, además de 24 tablas de posición relativa. El decodificador TDT consta de una red de predicción (`predict`) y una red conjunta (`joint`), cuantizadas a int8.

La conversión a LiteRT se realizó con litert-torch 0.9.4 para LiteRT 2.3.0. Los archivos `all` agrupan las siete longitudes de ventana como firmas separadas (`enc5`, `enc7.5`, `enc10`, `enc15`, `enc20`, `enc25`, `enc30`), compartiendo pesos entre grafos para reducir el tamaño. La variante para NPU (`sm8850`) está compilada a priori con QAIRT 2.50.0.260828 para el chip Qualcomm SM8850. No se dispone de información sobre el dataset de entrenamiento original, número de tokens ni si hubo RLHF/DPO en la información proporcionada.

## Capacidades

- Transcripción de voz a texto en inglés con calidad cercana a estado del arte (WER 1,726 % en LibriSpeech test-clean en NPU).
- Procesamiento por ventanas de hasta 30 s, con ventanas más cortas (5, 7,5, 10, 15, 20, 25 s) para optimizar el cómputo en audios breves.
- Decodificación greedy TDT que predice tokens y duraciones de forma conjunta.
- Ejecución en NPU (Qualcomm SM8850), GPU y CPU dentro de LiteRT.
- Front-end log-mel integrado en TFLite para audio de 16 kHz mono.
- Tokenizer compatible con nvidia/parakeet-tdt-0.6b-v3.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio más allá de ASR.

## Casos de uso

- Transcripción en tiempo real en dispositivos Android: el modelo puede ejecutarse en la NPU de un Galaxy S26 a 178× tiempo real, lo que permite subtitulado en vivo o dictado por voz sin conexión.
- Aplicaciones de accesibilidad: conversión de voz a texto en el propio dispositivo para personas con discapacidad auditiva, con latencia baja y sin enviar audio a la nube.
- Asistentes de voz offline: integración en asistentes móviles que necesitan transcripción local para preservar la privacidad del usuario.
- Procesamiento por lotes de audio corto: uso de ventanas de 5 o 7,5 s para transcribir notas de voz, comandos o fragmentos breves con menor coste computacional.
- Anotación de reuniones y entrevistas: transcripción de audio de hasta 30 s por ventana, concatenando resultados con separación por espacios (con la advertencia de cortes en palabras).
- Investigación en ASR eficiente: base para experimentos de cuantización y despliegue en hardware móvil, gracias a la disponibilidad de variantes f16 e i8 y scripts de compilación.
- Integración en pipelines de CI/CD para generación de subtítulos: el runner de línea de comandos para Android (`ultra_asr_runner_p8`) permite automatizar la transcripción en pruebas.

## Benchmarks y rendimiento

| Benchmark | Resultado | Contexto |
|---|---|---|
| LibriSpeech test-clean (WER) | 1,726 % | NPU Galaxy S26 (f16) |
| LibriSpeech test-clean (WER) | 1,736 % | PyTorch float32 (referencia) |
| Velocidad en NPU Galaxy S26 | 178× tiempo real | 2026-11-08 |
| Velocidad en GPU Pixel 11 Pro | 26× tiempo real | no disponible fecha exacta |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible, dado que es un modelo especializado en ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible directamente; el encoder f16 para todas las ventanas ocupa 1,45 GB (GPU) y el i8 0,90 GB (CPU), más el decodificador i8 de 17,9 MB y el front-end mel de 1,6-2,9 MB.
- GPU recomendadas: Qualcomm Adreno (GPU del Pixel 11 Pro) para la variante f16; NPU Qualcomm SM8850 (Galaxy S26) para la variante compilada; CPU de escritorio para la variante i8.
- ¿Cabe en GPU consumer? No se especifican requisitos para GPUs de escritorio; el modelo está orientado a móvil. La variante f16 de 1,45 GB podría caber en GPUs con al menos 2 GB de VRAM, pero no se confirma.
- Opciones de despliegue: LiteRT (TFLite) con runners C++ para Android (`ultra_asr_runner_p8`, `ultra_asr_runner_p`); ejecución desde Python en CPU de escritorio; no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 178× tiempo real en NPU SM8850; 26× en GPU Pixel 11 Pro; no se proporcionan cifras de latencia absoluta ni throughput en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | WER LibriSpeech test-clean | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Phonon-2 (LiteRT) | no disponible | ventanas hasta 30 s | 1,726 % (NPU) | CC-BY-4.0 | Hugging Face (litert-community) |
| FermionResearch/Phonon-2 (original) | no disponible | no disponible | 1,736 % (float32) | no disponible | Hugging Face |
| nvidia/parakeet-tdt-0.6b-v3 | 0,6 B | no disponible | no disponible | no disponible | Hugging Face |
| litert-community/parakeet-ultra | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación se limita a la arquitectura y disponibilidad.

## Limitaciones y advertencias

- Solo soporta inglés; no se ha entrenado ni validado para otros idiomas.
- El corte de audio se realiza en puntos fijos de 30 s, no en pausas, por lo que una palabra que cruce un corte puede dividirse, perderse o repetirse.
- Ventanas de menos de 320 muestras (dos frames mel) se descartan sin texto.
- Riesgo de alucinación inherente a modelos ASR, especialmente en audio con ruido o acentos no representados.
- No se dispone de información sobre sesgos demográficos o acústicos del modelo original.
- La licencia CC-BY-4.0 permite uso comercial con atribución, pero se debe verificar la licencia del modelo base FermionResearch/Phonon-2.
- El modelo está optimizado para hardware móvil concreto (SM8850, Pixel 11 Pro); el rendimiento en otros dispositivos puede variar.
- No se proporcionan garantías de precisión en dominios especializados (médico, legal, técnico).

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/Phonon-2
- Modelo base: https://huggingface.co/FermionResearch/Phonon-2
- Repositorio parakeet-ultra (referencia de front-end mel): https://huggingface.co/litert-community/parakeet-ultra
- Repositorio parakeet-redux: https://huggingface.co/litert-community/parakeet-redux
- Tokenizer de referencia: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
