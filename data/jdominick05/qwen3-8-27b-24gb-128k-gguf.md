# jdominick05/Qwen3.8-27B-24GB-128k-GGUF

## Resumen

Qwen3.8-27B-24GB-128k-GGUF es una cuantización mixta en formato GGUF del modelo Qwen/Qwen3.8-27B, publicada por el usuario jdominick05. Su objetivo es permitir ejecutar el modelo completo con su ventana de contexto nativa de 262.144 tokens íntegramente en VRAM en una única GPU de 24 GB (medido sobre una RX 7900 XTX con llama.cpp y ROCm en Windows), usando caché KV de 4 bits. El repositorio incluye dos variantes: `R3-mix` (17,0 GiB), orientada a agentes y precisión, sin capa MTP, y `R5-mix-MTP` (16,4 GiB), que conserva la cabeza de predicción multi-token (MTP) para decodificación especulativa y está pensada para chat y respuestas largas.

El modelo base tiene 26.895.998.464 parámetros (aproximadamente 26,9 mil millones) y es de tipo transformer con atención completa; la cuantización se ha diseñado con un enfoque de precisión mixta guiado por matrices de importancia (imatrix) para minimizar la divergencia KL respecto a la referencia Q8_0. La licencia es Apache 2.0, lo que facilita su uso comercial, y la relevancia actual radica en que demuestra que un modelo de ~27B con contexto de 256k puede desplegarse en hardware de consumo de gama alta sin recurrir a memoria del sistema.

La ficha se basa exclusivamente en la información publicada en la model card y en los metadatos de Hugging Face; los datos no disponibles se indican explícitamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.8-27B); cuantización GGUF de precisión mixta con imatrix |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens nativos; en la práctica 196.608–229.000 si la GPU también gestiona el escritorio |
| Tipos de cuantizacion | Cuantización mixta propietaria del autor (R3-mix y R5-mix-MTP); caché KV en q4_0; se comparan con Q8_0, UD-IQ4_XS e IQ3_S |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); repo de 68,2 GB con múltiples archivos |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen/Qwen3.8-27B, un transformer de ~26,9B parámetros. La model card no detalla la composición del dataset de entrenamiento, el número de tokens ni si hubo RLHF o DPO; esa información corresponde al modelo base y no se reproduce aquí. La innovación destacable de esta publicación no está en el entrenamiento, sino en la cuantización: se aplica precisión mixta guiada por imatrix, con el objetivo de preservar la fidelidad respecto a los pesos BF16 originales, medida mediante divergencia KL contra una referencia Q8_0 sobre 65.536 tokens de texto técnico (salida de descompilador, C, notas) intercalado con transcripciones de agentes de código.

La variante R5-mix-MTP conserva la cabeza de predicción multi-token (MTP) del modelo base, lo que habilita decodificación especulativa con aceptación de borradores del 72–79%. La variante R3-mix elimina esa capa. Ambas usan atención completa con `-fa on` y caché KV cuantizada en q4_0. El autor documenta además el uso de decodificación especulativa basada en n-gramas (`--spec-type ngram-mod`), que reutiliza repeticiones ya presentes en el contexto y acelera reescrituras de ficheros de ~37 a 131–146 tok/s sin afectar a la generación normal.

## Capacidades

- Generación de texto conversacional y de razonamiento, con modo de pensamiento configurable (`--reasoning-effort medium` en los comandos recomendados).
- Contexto largo real: recuperación verificada de 3 líneas plantadas al 10 %, 50 % y 90 % de 248.139 tokens (3/3 aciertos).
- Uso como agente con llamadas a herramientas: la variante R3-mix está optimizada para leer salidas de herramientas en cada turno (~890 tok/s en tokens añadidos sobre registros reales de Hermes).
- Decodificación especulativa MTP en la variante R5-mix-MTP (33–64 tok/s según contexto).
- Capacidad multimodal: no confirmada. El autor indica que el `mmproj-F16.gguf` de unsloth/Qwen3.8-27B-GGUF debería funcionar por compartir modelo base, pero no fue probado; ambas variantes publicadas son solo texto.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Integración con llama.cpp/llama-server y endpoints compatibles (etiqueta `endpoints_compatible`).

## Casos de uso

- Agentes de código autónomos (Hermes, Qwen Code): la variante R3-mix mantiene la precisión más alta medida y procesa salidas de herramientas a ~890 tok/s, lo que reduce la latencia por turno en bucles de agente que leen ficheros y resultados de comandos.
- Asistente conversacional de contexto largo: R5-mix-MTP genera a 64/56/33 tok/s a ~1k/~28k/~128k tokens, adecuado para sesiones de chat con respuestas extensas donde prima la velocidad de generación.
- Análisis de repositorios completos: con 262.144 tokens de contexto caben bases de código medianas o múltiples ficheros y transcripciones en una sola pasada, sin troceado ni recuperación externa.
- Reescritura y refactorización de ficheros: la decodificación especulativa por n-gramas acelera las reescrituras repetitivas de ~37 a 131–146 tok/s, útil en pipelines de migración de código.
- Despliegue en estación de trabajo con una sola GPU de 24 GB: permite servir el modelo completo en local (RX 7900 XTX con ROCm, o GPUs NVIDIA equivalentes) sin depender de la nube, con Apache 2.0 para uso comercial.
- Procesamiento de documentación técnica extensa: la evaluación de calidad se hizo sobre texto técnico y trazas de agentes, por lo que el perfil de cuantización está ajustado a ese dominio (descompiladores, C, notas).
- Evaluación e investigación de cuantizaciones: el repositorio incluye scripts y datos (`data/`, `scripts/paired.py`) para reproducir las mediciones de KLD y velocidad, útil para estudiar el impacto de la precisión mixta en contexto largo.

## Benchmarks y rendimiento

Calidad medida como divergencia KL frente a Q8_0 de los mismos pesos BF16 (65.536 tokens, texto técnico y transcripciones de agentes; valores menores son mejores):

| Modelo | Tamano (MiB) | KLD media | KLD mediana | Mismo token top-1 | PPL vs Q8_0 | KLD percentil 99,9 |
|---|---|---|---|---|---|---|
| R3-mix (este repo) | 17.390 | 0,0142 ± 0,0011 | 0,00074 | 96,10 % | +0,1 % | 1,91 |
| R5-mix-MTP (este repo) | 16.830 | 0,0165 ± 0,0014 | 0,00097 | 95,90 % | +0,3 % | 1,89 |
| R2-mix (retirado) | 14.677 | 0,0199 ± 0,0012 | 0,00131 | 95,08 % | +0,5 % | 2,46 |
| R1-mix (retirado) | 16.167 | 0,0191 ± 0,0015 | 0,00122 | 94,96 % | +0,8 % | 2,47 |
| Unsloth UD-IQ4_XS | 13.593 | 0,0273 ± 0,0017 | 0,00161 | 94,74 % | +1,0 % | 4,22 |
| IST-DASLab GSQ-RCO IQ3_S | 11.226 | 0,0645 ± 0,0028 | no disponible | 92,99 % | +5,2 % | 8,79 |

Velocidad y memoria (RX 7900 XTX, contexto 262.144, KV q4_0):

| Metrica | R3-mix | R5-mix-MTP (MTP activo) |
|---|---|---|
| VRAM dedicada | 23,1–23,3 GB | 23,5 GB (requiere `-ub 512`; con `-ub 2048` desborda ~3,4 GB) |
| Recuperación a 248.139 tokens | 3/3, 524 tok/s de media en el llenado | 3/3 con los mismos pesos sin MTP (526 tok/s) |
| Generación | 34,5 tok/s a ~28k; ~34 tok/s en carga de agente a 128k | 64 / 56 / 33 tok/s a ~1k / ~28k / ~128k (aceptación de borrador 72–79 %) |
| Prompt nuevo | 673–961 tok/s a ~26–28k; 524 tok/s sobre 248k | 920 / 613 tok/s a ~28k / ~128k |
| Tokens añadidos en uso real de agente | ~890 tok/s | ~186 tok/s (corregido: prueba controlada da 10–18 % más lento) |
| Añadidos, prueba controlada (14 turnos de ~4,5k tokens, de 5k a 60k de contexto) | 930 → 614 tok/s | 830 → 516 tok/s |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para contexto completo (262.144 tokens, R3-mix, incluyendo ~1 GB de memoria compartida normal): 24,4 GB con `-ub 2048`, 23,1 GB con `-ub 1024`, 22,5 GB con `-ub 512`.
- GPU medida: AMD RX 7900 XTX (24 GB) con ROCm y llama.cpp en Windows. La model card no confirma otras GPU; por capacidad de VRAM serían equivalentes tarjetas de 24 GB como RTX 4090 o RTX 3090, pero no se aportan mediciones.
- La GPU debe estar dedicada al modelo: si también gestiona el escritorio, el contexto práctico baja a ~196.000–229.000 tokens.
- La variante R5-mix-MTP necesita ~2 GB más de VRAM, lo que empuja contextos de 196k o más al desbordamiento a memoria del sistema.
- Despliegue: llama.cpp / llama-server (comandos recomendados en la model card), con `-ngl 99`, `-fa on`, `-ctk q4_0 -ctv q4_0`, `--cache-ram 0`, `-ctxcp 8`, `-cms 2048`. Decodificación especulativa con `--spec-type ngram-mod` (R3) o `--spec-type draft-mtp --spec-draft-n-max 2` (R5).
- Muestreo recomendado en modo pensamiento: `temperature=1.0`, `top_p=0.95`, `top_k=20`, `min_p=0`.
- Throughput: 34,5 tok/s de generación a ~28k con R3-mix; 64 tok/s a ~1k con R5-mix-MTP; 673–961 tok/s de procesamiento de prompt nuevo a ~26–28k.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad (KLD media vs Q8_0) | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| R3-mix (este repo) | ~26,9B | 262.144 | 0,0142 | 17,0 GiB | Apache 2.0 | Hugging Face |
| R5-mix-MTP (este repo) | ~26,9B | 262.144 | 0,0165 | 16,4 GiB | Apache 2.0 | Hugging Face |
| Unsloth UD-IQ4_XS | ~26,9B (mismo base) | no disponible | 0,0273 | 13.593 MiB | Apache 2.0 (modelo base) | Hugging Face |
| IST-DASLab GSQ-RCO IQ3_S | ~26,9B (mismo base) | no disponible | 0,0645 | 11.226 MiB | Apache 2.0 (modelo base) | Hugging Face |

Las tres alternativas son cuantizaciones del mismo modelo base Qwen/Qwen3.8-27B, por lo que la comparación relevante es de fidelidad y tamaño, no de capacidades. La model card no ofrece comparación con modelos de otros desarrolladores.

## Limitaciones y advertencias

- Solo texto: las variantes publicadas no incluyen proyector multimodal; el uso de visión requeriría un `mmproj` externo no probado.
- Idiomas soportados no documentados en esta ficha; la evaluación de calidad se limita a texto técnico en inglés (C, descompilador, notas, trazas de agentes).
- La cuantización introduce degradación medible: 96,10 % de coincidencia en el token top-1 (R3-mix) y una cola del percentil 99,9 de KLD de 1,91; los tokens raros son los que rompen llamadas a herramientas en agentes.
- MTP no es adecuado para agentes: 10–18 % más lento en tokens añadidos, la ganancia de generación se desvanece a partir de ~40–60k de contexto y requiere ~2 GB más de VRAM. Además, llama-server copia toda la KV de la capa MTP en cada checkpoint de contexto, por lo que los checkpoints crecen con el contexto.
- Con MTP y `-ub 2048` se desbordan ~3,4 GB a memoria del sistema, con la consiguiente caída de rendimiento; el autor documenta una medición de ~186 tok/s contaminada por un desbordamiento de 0,64 GB.
- Las mediciones son ejecuciones únicas sobre una sola GPU y un solo sistema (Windows/ROCm); no hay validación en otras plataformas.
- Riesgo de alucinación y sesgos: no evaluados en la información disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen/Qwen3.8-27B.
- El repositorio tiene 515 descargas y 0 likes; es una publicación de un autor individual, sin el respaldo de un equipo de cuantización establecido.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jdominick05/Qwen3.8-27B-24GB-128k-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Cuantizaciones de referencia de Unsloth: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
