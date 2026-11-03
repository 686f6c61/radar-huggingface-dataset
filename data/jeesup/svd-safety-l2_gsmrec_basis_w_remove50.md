# Jeesup/svd-safety-l2_gsmrec_basis_w_remove50

## Resumen

`Jeesup/svd-safety-l2_gsmrec_basis_w_remove50` es un artefacto de investigación derivado de `meta-llama/Llama-2-7b-chat-hf`, comprimido mediante la técnica Basis Sharing (descomposición SVD con compartición de bases) con un 50 % de los parámetros eliminados. Sobre esa base comprimida se entrenó una LoRA de recuperación con el conjunto de entrenamiento de GSM8K (7.473 problemas en formato Alpaca, corte de 512 tokens, split de validación de 500) que posteriormente se fusionó en los pesos. Forma parte del proyecto `svd_safety` (script `jobs/gsmrec_slurm.sh`) del autor Jeesup.

El modelo conserva la arquitectura transformer decoder-only de Llama 2 con 6.738.415.616 parámetros reales en safetensors (frente a los ~6.740 millones nominales del checkpoint original) y un repositorio de 13,5 GB en formato safetensors. No es un asistente de propósito general: la model card advierte explícitamente que algunas celdas están deliberadamente degradadas en seguridad o sobre-rechazan peticiones, y que debe evaluarse antes de cualquier uso.

Su relevancia es metodológica más que práctica: sirve para estudiar el compromiso entre compresión agresiva, recuperación de capacidades específicas (GSM8K) y degradación de seguridad (ASR en AdvBench y StrongREJECT), con métricas publicadas de perplejidad, rendimiento zero-shot y sobre-rechazo. No hay información sobre idiomas soportados más allá de los heredados de Llama 2.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con Basis Sharing (SVD) |
| Parámetros totales | 6.738.415.616 (safetensors) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Llama 2; no confirmada) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Llama 2 Community License (incluye LICENSE.txt y USE_POLICY.md) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La base es un transformer decoder-only de Llama 2 con atención causal estándar, sometido a una compresión por Basis Sharing basada en SVD que elimina el 50 % de los parámetros. La calibración para la descomposición se realizó únicamente con WikiText-2 (configuración "W"), con semilla 42. Sobre el modelo comprimido se entrenó una LoRA de recuperación usando el split de entrenamiento de GSM8K (7.473 problemas, formato Alpaca, corte de 512, split de validación de 500) en lugar de alpaca-cleaned, y la LoRA se fusionó posteriormente en los pesos finales.

No se especifican en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset más allá de GSM8K y WikiText-2, ni si hubo RLHF o DPO adicionales sobre este artefacto. La innovación técnica destacable es la combinación de compresión SVD con compartición de bases y una recuperación selectiva mediante LoRA orientada a una tarea concreta (razonamiento matemático de GSM8K), lo que permite medir el efecto de la compresión sobre capacidades específicas y sobre el comportamiento de seguridad.

## Capacidades

- Generación de texto conversacional, heredada del checkpoint Llama-2-7b-chat.
- Razonamiento matemático de nivel GSM8K: la LoRA de recuperación se entrenó específicamente con ese dataset, aunque el rendimiento medido es bajo (2,35 % estricto y 5,31 % flexible en 5-shot con plantilla de chat).
- Seguimiento de instrucciones: capacidad presente pero muy degradada según IFEval (8,32 % estricto a nivel de prompt).
- Razonamiento zero-shot general: media de 40,68 % en 7 tareas zero-shot.
- Comportamiento de seguridad alterado de forma deliberada: ASR de 18,08 % en AdvBench y 18,21 % en StrongREJECT (juez HarmBench), con sobre-rechazo medido en XSTest-safe (28,97 % / 58,00 % puntuado) y OR-Bench-Hard-1k (13,66 % / 53,30 % puntuado).
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (visión, audio, modo thinking): no disponibles.

## Casos de uso

- Investigación sobre compresión de modelos: el artefacto permite reproducir y analizar el efecto de eliminar el 50 % de parámetros con Basis Sharing sobre perplejidad (17,52 en WikiText-2) y rendimiento zero-shot (40,68 % de media en 7 tareas), sirviendo como punto de comparación frente a otras técnicas de poda y cuantización.
- Estudio de recuperación selectiva con LoRA: al haberse entrenado la recuperación solo con GSM8K, es útil para medir cuánto de una capacidad concreta se recupera tras una compresión agresiva y cuánto se pierde en el resto de tareas, con las métricas de GSM8K e IFEval ya publicadas.
- Evaluación de seguridad post-compresión: los valores de ASR en AdvBench y StrongREJECT y de sobre-rechazo en XSTest y OR-Bench permiten estudiar cómo la compresión y la recuperación con datos matemáticos afectan a los mecanismos de rechazo y alineación.
- Análisis de calibración con WikiText-2: la configuración "W" (calibración solo con WikiText-2) facilita experimentos controlados sobre el impacto del corpus de calibración en la calidad del modelo comprimido.
- Docencia y formación en técnicas SVD aplicadas a LLM: el repositorio y el script `jobs/gsmrec_slurm.sh` sirven como material didáctico para explicar descomposición en valores singulares, compartición de bases y fusión de LoRA.
- Reproducción de experimentos con semilla fija: la semilla 42 documentada permite replicar el pipeline de compresión y recuperación en entornos de investigación con resultados comparables.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| Perplejidad WikiText-2 | 17,52 |
| Media zero-shot en 7 tareas | 40,68 % |
| AdvBench ASR (juez HarmBench) | 18,08 % |
| StrongREJECT ASR (juez HarmBench) | 18,21 % |
| XSTest-safe sobre-rechazo (WildGuard) / puntuado | 28,97 % / 58,00 % |
| OR-Bench-Hard-1k sobre-rechazo / puntuado | 13,66 % / 53,30 % |
| GSM8K 5-shot estricto / flexible (plantilla de chat) | 2,35 % / 5,31 % |
| IFEval estricto a nivel de prompt | 8,32 % |

No se han publicado en la información disponible comparaciones directas con otros modelos en estos benchmarks.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 16-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB de pesos, más overhead; no confirmado por el autor.
- VRAM estimada en cuantización de 4 bits: en torno a 4-5 GB de pesos, más overhead; no confirmado por el autor.
- GPU recomendadas: A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para FP16; RTX 3090 (24 GB) también es viable en FP16 con margen ajustado.
- Cabe en GPU de consumo: sí, en RTX 4090 y RTX 3090 en FP16; en GPUs de 8-12 GB requeriría cuantización, cuya disponibilidad no está documentada.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference`), endpoints compatibles. No se documenta soporte explícito de vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeesup/svd-safety-l2_gsmrec_basis_w_remove50 | 6.738.415.616 | No disponible | PPL WikiText-2 17,52; zero-shot 40,68 %; GSM8K 5-shot 2,35 % estricto | Llama 2 Community | HuggingFace (0 descargas) |
| meta-llama/Llama-2-7b-chat-hf | ~6.740 millones | 4.096 tokens (modelo base) | No disponible en esta información | Llama 2 Community | HuggingFace (ampliamente distribuido) |
| Alternativas comprimidas de Llama 2 de 7B | No disponible | No disponible | No disponible | Variable | No disponible |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que la comparación cuantitativa de rendimiento no está disponible.

## Limitaciones y advertencias

- No es un asistente de propósito general: la propia model card lo califica de artefacto de investigación y desaconseja su uso sin evaluación previa.
- Algunas celdas están deliberadamente degradadas en seguridad: el ASR de 18,08 % en AdvBench y 18,21 % en StrongREJECT indica que el modelo puede producir contenido inseguro en una fracción relevante de casos.
- Sobre-rechazo elevado: 28,97 % en XSTest-safe y 13,66 % en OR-Bench-Hard-1k, lo que implica que rechazará peticiones legítimas con frecuencia.
- Seguimiento de instrucciones muy degradado: IFEval estricto de 8,32 %, insuficiente para tareas de producción que requieran obediencia precisa a formatos y restricciones.
- Razonamiento matemático limitado pese a la recuperación con GSM8K: 2,35 % estricto y 5,31 % flexible en 5-shot, muy por debajo de lo esperable en un modelo de 7B sin comprimir.
- Riesgo de alucinación: no cuantificado en la información disponible, pero previsible en un modelo comprimido al 50 % con recuperación limitada a una sola tarea.
- Idiomas soportados no documentados: no hay garantía de comportamiento multilingüe más allá de lo heredado de Llama 2.
- Restricciones de licencia: Llama 2 Community License, que impone condiciones de uso (incluida la política de uso aceptable en USE_POLICY.md) y obligaciones de atribución ("Built with Llama 2"); debe revisarse antes de cualquier uso comercial.
- Longitud de contexto no confirmada para este artefacto concreto.
- Disponibilidad mínima: 0 descargas y 0 likes en el momento de la consulta, sin garantía de mantenimiento o soporte por parte del autor.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2_gsmrec_basis_w_remove50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-7b-chat-hf
- Licencia Llama 2: https://ai.meta.com/llama/license/
- Política de uso aceptable de Llama 2: https://ai.meta.com/llama/use-policy/
- Proyecto svd_safety (referenciado en la model card, sin URL pública en la información disponible): no disponible
- Paper o blog del método Basis Sharing: no disponible en la información proporcionada
