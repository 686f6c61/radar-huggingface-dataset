# feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo_mini-Starlight

## Resumen

Qwen3.8-Flash-Next-iq3_xxs_turbo_mini-Starlight es una cuantización de un solo archivo del modelo de mezcla de expertos Qwen3.8-Flash-Next, publicada por el usuario feverdoingwork. El artefacto está empaquetado en un contenedor GGUF con extensiones propietarias (`.starlight.gguf`) y solo es compatible con el motor de inferencia Starlight; el propio autor advierte que no funciona con Transformers, llama.cpp, Ollama ni LM Studio. El modelo base es un MoE de 48 capas con 512 expertos por capa y 10 expertos activos por token.

La receta `iq3_xxs_turbo_mini` parte de la variante `iq3_xxs_turbo` y recodifica la tabla de tokens por capa con los formatos TQ2_T y TQP6, reduciendo el archivo de 54,68 GiB a 50,03 GiB. Los expertos enrutados se almacenan como bloques trellis-coded TQ2_T de 2,125 bits por peso (29,88 GiB), mientras que atención, atención lineal, experto compartido y router se mantienen en 6,58 bits por peso. El vocabulario se poda de 248.320 a 141.312 tokens.

La relevancia de esta ficha es acotada: se trata de un artefacto de nicho, con cero descargas y cero likes en el momento de la consulta, orientado a ejecutar un MoE de gran tamaño en una única GPU de 16 GB (RX 9070 XT o RTX 5070 Ti) gracias a una ventana de contexto medida de hasta 245.760 tokens en la RX 9070 XT. No es un checkpoint para uso general ni para producción convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer; 48 capas, 512 expertos por capa, 10 activos por token; incluye atención lineal y experto compartido |
| Parametros totales | no disponible (el modelo base se describe en una fuente secundaria como de 120B, dato no confirmado en la información oficial) |
| Parametros activos | no disponible |
| Longitud de contexto | 245.760 tokens medidos en RX 9070 XT; 131.072 tokens medidos en RTX 5070 Ti |
| Tipos de cuantizacion | `iq3_s_turbo` (64,78 GiB), `iq3_xxs_turbo` (54,68 GiB), `iq3_xxs_turbo_mini` (50,03 GiB); expertos TQ2_T de 2,125 bits por peso |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 (`qwen-community-1.0`) |
| Formato de pesos | GGUF con extensiones Starlight (`.starlight.gguf`), 53.714.922.144 bytes (50,03 GiB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer de mezcla de expertos con 48 capas, 512 expertos por capa y 10 expertos activos por token, e incorpora atención lineal junto con un experto compartido. Esta publicación no entrena ningún modelo: es una cuantización del checkpoint original, por lo que no aporta información sobre el corpus de entrenamiento, el número de tokens vistos ni las etapas de alineación (RLHF/DPO).

La innovación técnica del artefacto está en la compresión. Los expertos enrutados se codifican como bloques trellis-coded TQ2_T de 2,125 bits por peso (29,88 GiB), mientras que el bloque MTP conserva expertos IQ3_S e IQ4_NL. La tabla de tokens por capa (una fila por token, leída bajo demanda) se recodifica con TQP6 y TQ2_T, pasando de 20,30 a 15,65 GiB. El archivo incluye la cabeza de borrador para predicción multi-token (MTP, 1,21 GiB a 3,97 bits por peso), lo que habilita decodificación especulativa con 3 tokens de borrador. El vocabulario se poda eliminando 107.172 tokens, conservando el mismo texto para cada token restante.

## Capacidades

- Generación de texto autoregresiva con decodificación especulativa mediante la cabeza MTP integrada (3 tokens de borrador).
- Procesamiento de contextos muy largos: se verificaron prompts de 236.286 y 245.687 tokens en RX 9070 XT, y de 124.678 y 131.066 tokens en RTX 5070 Ti, con respuesta correcta a códigos plantados en el contexto.
- Conversación multi-turno sobre contexto masivo: el turno de seguimiento tras un prompt de ~236.000 tokens se resolvió en 0,8 s.
- Razonamiento y recuperación de información dentro de contexto (evaluado con códigos plantados, no con benchmarks estándar).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión y audio: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con una ventana medida de hasta 245.760 tokens, el modelo puede ingerir un árbol de código extenso y responder preguntas de seguimiento en menos de un segundo, útil para asistentes de revisión de código sobre una única GPU de 16 GB.
- Auditoría de documentación legal o contractual: la ventana larga permite cargar contratos o expedientes completos y hacer preguntas puntuales sobre cláusulas concretas sin fragmentación por recuperación.
- Procesamiento de transcripciones y actas extensas: lectura de prompts de más de 100.000 tokens en una RTX 5070 Ti (31 s para 124.678 tokens), adecuada para resumir o extraer acuerdos de reuniones largas.
- Investigación sobre decodificación especulativa: el archivo incluye la cabeza MTP y sirve como banco de pruebas para medir el impacto de la decodificación con borrador en un MoE cuantizado a 2 bits.
- Evaluación de cuantización extrema: el autor publica métricas de KLD, top-1 y perplejidad frente a logits BF16 de referencia, lo que permite estudiar la degradación de un MoE a ~2,12 bits por peso en expertos.
- Despliegue en estaciones de trabajo con GPU de 16 GB: pensado para RX 9070 XT o RTX 5070 Ti con 46 GiB de RAM bloqueada y toda la caché en la tarjeta, en escenarios de inferencia local de un solo usuario.
- Reproducción de experimentos de poda de vocabulario: la reducción de 248.320 a 141.312 tokens permite estudiar el efecto de la poda en la calidad y en el tamaño del archivo.

## Benchmarks y rendimiento

Calidad medida por el proyecto Starlight contra los logits BF16 de referencia del modelo base (12 casos de texto, 16.561 posiciones puntuadas, motor Starlight en RTX 5070 Ti, 2 de noviembre de 2026). Menor KLD y menor perplejidad son mejores; *top-1* indica la frecuencia con la que el token más probable del archivo coincide con el del modelo BF16.

| # | Archivo | KLD a BF16 | top-1 igual a BF16 | Perplejidad (BF16: 3,126) | Tamano total (GiB) |
|--:|---|--:|--:|--:|--:|
| 1 | ISTA-DASLab GSQ-RCO IQ3_S (referencia, no Starlight) | 0,193 | 86,71 % | 3,463 | 77,88 |
| 2 | `iq3_s_turbo` | 0,257 | 84,08 % | 3,593 | 64,78 |
| 3 | ISTA-DASLab GSQ-RCO IQ3_XXS (referencia, no Starlight) | 0,276 | 84,05 % | 3,657 | 70,63 |
| 4 | `iq3_xxs_turbo` | 0,310 | 83,56 % | 3,566 | 54,68 |
| 5 | `iq3_xxs_turbo_mini` | 0,318 | 83,78 % | 3,508 | 50,03 |

Rendimiento de decodificación medido en RX 9070 XT (2 de noviembre de 2026, build temprana del motor): `iq3_xxs_turbo` decodifica a 56,4 tokens por segundo frente a 59,6 de `iq3_s_turbo`, y lee prompts aproximadamente un 10 % más lento, con 10 GiB menos de RAM para los expertos. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM: el archivo completo ocupa 50,03 GiB, pero la tabla de tokens por capa (15,65 GiB) reside en RAM del sistema o en disco, por lo que el lado GPU es de 34,38 GiB; en la práctica se midió con 46 GiB de RAM bloqueada y toda la caché en la tarjeta.
- GPU verificadas: AMD RX 9070 XT y NVIDIA RTX 5070 Ti, ambas de 16 GB, con ventanas de contexto medidas de 245.760 y 131.072 tokens respectivamente.
- GPU recomendadas: no disponible más allá de las dos tarjetas medidas; el autor indica explícitamente "one 16 GB card".
- Cabe en GPU de consumo: sí, en RX 9070 XT y RTX 5070 Ti según las mediciones del autor.
- Despliegue: exclusivamente mediante el motor Starlight y su Launcher; no es compatible con vLLM, llama.cpp, Ollama, LM Studio, TGI ni Transformers.
- Latencia y throughput: 56,4 tokens/s de decodificación con `iq3_xxs_turbo` en RX 9070 XT; lectura de un prompt de 236.286 tokens en 67 s (RX 9070 XT) y de 124.678 tokens en 31 s (RTX 5070 Ti); turno de seguimiento en 0,8 s en ambos casos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD a BF16) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `iq3_xxs_turbo_mini` (esta ficha) | MoE 48 capas, 512 expertos, 10 activos | 245.760 tokens (RX 9070 XT) | 0,318; top-1 83,78 % | Qwen Community License 1.0 | Solo motor Starlight |
| `iq3_xxs_turbo` (misma familia) | idénticos | no disponible | 0,310; top-1 83,56 % | Qwen Community License 1.0 | Solo motor Starlight |
| `iq3_s_turbo` (misma familia) | idénticos | no disponible | 0,257; top-1 84,08 % | Qwen Community License 1.0 | Solo motor Starlight |
| ISTA-DASLab GSQ-RCO IQ3_S | no disponible | no disponible | 0,193; top-1 86,71 % | no disponible | GGUF de referencia |
| ISTA-DASLab GSQ-RCO IQ3_XXS | no disponible | no disponible | 0,276; top-1 84,05 % | no disponible | GGUF de referencia |

## Limitaciones y advertencias

- Compatibilidad restringida: el archivo solo funciona con el motor Starlight; no está soportado ni probado en llama.cpp, Ollama, LM Studio, Transformers u otros programas.
- Degradación de calidad frente a BF16: KLD de 0,318 y top-1 del 83,78 %, con expertos comprimidos a 2,125 bits por peso; la referencia IQ3_S queda 0,125 puntos de KLD por debajo.
- Poda de vocabulario: se eliminan 107.172 tokens del vocabulario original, lo que puede afectar a la cobertura de idiomas y dominios no representados en los 141.312 tokens conservados.
- Idiomas soportados no declarados: la model card no especifica cobertura lingüística, por lo que no puede garantizarse el rendimiento multilingüe.
- Sin datos de sesgos ni de alucinación: no se han publicado evaluaciones de sesgo, robustez o tasas de alucinación para este artefacto.
- Licencia Qwen Community License 1.0: es una licencia "other" con posibles restricciones para uso comercial; debe revisarse el texto íntegro antes de cualquier despliegue en producción.
- Madurez del ecosistema: cero descargas y cero likes en el momento de la consulta, y mediciones realizadas con una build temprana del motor (2 de noviembre de 2026), por lo que las cifras de rendimiento pueden variar.
- Requisito de memoria del sistema: la tabla de tokens por capa (15,65 GiB) debe residir en RAM o disco, lo que exige configuraciones con al menos 46 GiB de RAM bloqueada según las pruebas del autor.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/feverdoingwork/Qwen3.8-Flash-Next-iq3_xxs_turbo_mini-Starlight
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización de referencia: https://huggingface.co/ISTA-DASLab/Qwen3.8-Flash-Next-GSQ-RCO-GGUF
- Logits BF16 de referencia: https://huggingface.co/datasets/jyohukuchan/qwen38-flash-next-bf16-logits
- Variante no censurada de la comunidad (fuente secundaria): https://huggingface.co/DavidAU/Qwen3.8-Flash-Next-Abliterated-Uncensored-Turbo-Brilliance-50x-Reasoning-Instruct-GSQ-RCO-GGUF
