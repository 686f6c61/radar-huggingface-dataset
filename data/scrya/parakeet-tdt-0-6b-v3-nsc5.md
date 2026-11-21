# Scrya/parakeet-tdt-0.6b-v3-nsc5

## Resumen

Parakeet-tdt-0.6b-v3-nsc5 es un modelo de reconocimiento automático del habla (ASR) desarrollado por el usuario Scrya, que parte del checkpoint NVIDIA Parakeet-TDT-0.6B-v3 y lo ajusta mediante fine-tuning sobre 1.386 horas de inglés de Singapur conversacional extraídas de cinco partes del IMDA National Speech Corpus (NSC). El objetivo es mejorar la transcripción en entornos de sala de reuniones, donde predominan el ruido de oficina, los hablantes de fondo y la reverberación.

El modelo emplea la arquitectura TDT (Token-and-Duration Transducer) propia de la familia Parakeet, con aproximadamente 627 millones de parámetros en fp32. Genera texto en inglés con puntuación, mayúsculas y números escritos con palabras ("twenty five" en lugar de "25"), lo que lo hace directamente utilizable en actas y transcripciones sin post-procesado intensivo.

Su relevancia actual radica en la combinación de un tamaño compacto (apto para despliegue en GPU de consumo), la disponibilidad de pesos en cuatro formatos (transformers fp32, NeMo fp32 y GGUF f16/q8_0) y un enfoque explícito en robustez frente a ruido y reverberación, condiciones habituales en la transcripción de reuniones reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TDT (Token-and-Duration Transducer), familia Parakeet |
| Parametros totales | 627.057.286 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (safetensors y NeMo), f16 (GGUF), q8_0 (GGUF) |
| Idiomas soportados | en (inglés, con foco en inglés de Singapur) |
| Licencia | cc-by-4.0 |
| Formato de pesos | safetensors, .nemo, GGUF |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de nvidia/parakeet-tdt-0.6b-v3, un transducer TDT que combina un encoder acústico con un decoder predictivo y un joint network que emite tokens y duraciones de forma conjunta. El checkpoint resultante mantiene los 725 tensores del modelo base, verificados como idénticos a los pesos ajustados en la comprobación con nemo_toolkit 2.7.3.

El entrenamiento se realizó sobre 1.386 horas de inglés de Singapur conversacional procedente de las partes 3 (Same Room y SDM), 4, 5 y 6.3 del NSC. Alrededor de la mitad del audio (702 horas) corresponde a dos personas hablando en una misma sala; se excluyó la parte 4 Different Room por tratarse de llamadas online. Se mezcló ruido de oficina (equipos, ventiladores, teclado, conversaciones de fondo singapurenses) en la mitad de los clips y se añadió eco sintético de sala al 30%. El parámetro `decoding.greedy.max_symbols` se redujo de 10 a 3 para evitar repeticiones degeneradas al final de los clips.

## Capacidades

- Reconocimiento automático del habla en inglés con salida puntuada y con mayúsculas.
- Normalización numérica: los números se escriben con palabras ("twenty five" en lugar de "25").
- Robustez frente a ruido de oficina, tecleo, hablantes de fondo y reverberación de sala.
- Transcripción de audio mono a 16 kHz.
- Adaptación específica al inglés de Singapur (singlish) y a conversaciones entre dos hablantes en una misma sala.
- Compatible con tres runtimes: transformers (`ParakeetForTDT`), NVIDIA NeMo y NeMo-Speech.cpp (GGUF).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de ASR.

## Casos de uso

- Actas de reuniones: el modelo transcribe conversaciones entre dos personas en una misma sala con ruido de fondo y reverberación, condiciones para las que fue entrenado específicamente (702 de 1.386 horas de ese tipo de audio).
- Subtitulado de reuniones corporativas en Singapur: su ajuste sobre NSC captura particularidades del inglés singapurense que los modelos genéricos suelen transcribir con mayor tasa de error.
- Transcripción de llamadas telefónicas en oficina: la parte 4 del NSC se grabó con micrófonos de teléfono a unos 2 m de los hablantes en una sala compartida, escenario cubierto por el entrenamiento.
- Despliegue en edge o en portátil: el GGUF q8_0 ocupa 0,71 GB y puede ejecutarse con NeMo-Speech.cpp 0.3.0 sin GPU dedicada de gran tamaño.
- Pipelines de transcripción con NeMo: el checkpoint `.nemo` se carga con `ASRModel.restore_from` y se integra en flujos existentes basados en nemo_toolkit.
- Integración en transformers: el formato safetensors permite usar `AutoProcessor` y `ParakeetForTDT` dentro de stacks PyTorch estándar.
- Generación de texto con puntuación para alimentar sistemas downstream (resúmenes, búsqueda, análisis) sin necesidad de un modelo de restauración de puntuación adicional.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados) sobre el IMDA National Speech Corpus:

| Conjunto de test | WER normalizado | WER formateado (mayúsculas y puntuación) |
|---|---|---|
| NSC Part 3 SDM | 10,01 | 16,68 |
| NSC Part 3 Same Room | 9,99 | 15,81 |
| NSC Part 4 | 14,48 | 22,92 |
| NSC Part 5 | 6,40 | 12,63 |
| NSC Part 6.3 | 6,26 | 13,82 |

El autor indica que también evaluó con ruido de oficina, tecleo, hablantes de fondo y eco de sala mezclados en el audio de test, además de audio limpio, pero los valores concretos de esas pruebas no se detallan en la información disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 2,4 GB en fp32 (safetensors), 2,51 GB en fp32 (.nemo), 1,30 GB en GGUF f16 y 0,71 GB en GGUF q8_0.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con al menos 3-4 GB de VRAM libre debería alojar el modelo en fp32.
- GPU de consumo: sí cabe en tarjetas de consumo con 4 GB o más de VRAM; en q8_0 el requisito baja a menos de 1 GB.
- Opciones de despliegue: transformers (`ParakeetForTDT`), NVIDIA NeMo (nemo_toolkit 2.7.3 verificado) y NeMo-Speech.cpp 0.3.0 para los GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Licencia | Formatos | Notas |
|---|---|---|---|---|---|
| Scrya/parakeet-tdt-0.6b-v3-nsc5 | 627 M | en (singlish) | cc-by-4.0 | safetensors, .nemo, GGUF | Fine-tuning sobre NSC para salas de reuniones |
| nvidia/parakeet-tdt-0.6b-v3 (base) | 0,6 B | en | no disponible en la información | no disponible en la información | Modelo base sin ajuste a singlish ni a ruido de sala |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos verificados en la información proporcionada |

## Limitaciones y advertencias

- Solo soporta inglés; el ajuste está orientado al inglés de Singapur, por lo que el rendimiento en otras variantes puede degradarse.
- Los benchmarks son declarados por el autor y figuran como no verificados (`verified: false`).
- El WER formateado es notablemente superior al normalizado (por ejemplo, 22,92 frente a 14,48 en la parte 4), lo que refleja errores en mayúsculas y puntuación.
- Escribe los números con palabras, lo que puede requerir post-procesado si el sistema downstream espera dígitos.
- Se excluyó del entrenamiento la parte 4 Different Room (llamadas online), por lo que el rendimiento en audio de videoconferencia puede ser inferior.
- El ajuste de `max_symbols` a 3 mitiga las repeticiones degeneradas, pero no se documenta su comportamiento en audio muy largo o con silencios prolongados.
- Licencia cc-by-4.0: permite uso comercial con atribución; conviene revisar los términos de la licencia del modelo base NVIDIA.
- Riesgo de alucinación en segmentos con ruido extremo o habla solapada no está cuantificado en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Hugging Face: https://huggingface.co/Scrya/parakeet-tdt-0.6b-v3-nsc5
- Modelo base: https://huggingface.co/nvidia/parakeet-tdt-0.6b-v3
