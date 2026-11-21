# Epode/Lyric-135M

## Resumen

Lyric 135M es un modelo de lenguaje denso de 134.515.008 parámetros con arquitectura estilo Llama, desarrollado por Epode como experimento de preentrenamiento y ajuste fino sobre una única GPU NVIDIA L20. No forma parte de la familia base MoE de Epode (Note 0.5B, Verse 1B, Canto 3.3B, Saga 7B), sino que es una línea anterior y separada centrada en demostrar que es posible completar un pipeline íntegro de preentrenamiento, curación de datos, evaluación, SFT y publicación con un presupuesto de cómputo muy reducido.

El checkpoint publicado por defecto es la release "Stage 4 anti-forgetting": una mezcla del 87,5% de los pesos SFT con un 12,5% de los pesos base de Stage 4, seleccionada mediante compuertas de regresión sobre seis tareas de benchmark. El modelo parte de un preentrenamiento inicial de 10.001.252.352 tokens de FineWeb-Edu y añade una continuación curada de 3.000.000.965 tokens, sumando aproximadamente 13.000 millones de tokens totales. Esta cifra representa en torno al 2,2% del presupuesto de tokens reportado por SmolLM-135M (600B) y aproximadamente el 0,65% del de SmolLM2-135M (2T).

La relevancia del modelo es metodológica más que de rendimiento absoluto: documenta de forma reproducible el proceso de deduplicación, descontaminación de benchmarks, selección de checkpoints e interpolación anti-olvido, con artefactos de evaluación incluidos en el repositorio. Está pensado como modelo de investigación para estudiar preentrenamiento de modelos pequeños, curación de datos y ajuste fino posterior, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso estilo Llama |
| Parametros totales | 134.515.008 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 8.192 tokens (continuación Stage 4) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer denso de tipo Llama con 134,5 millones de parámetros, entrenado desde cero sobre un único dispositivo NVIDIA L20. El preentrenamiento inicial consumió 10.001.252.352 tokens de FineWeb-Edu, con un rendimiento medio de 38,5k tokens/s tras el warmup. Sobre esa base se aplicó una continuación de preentrenamiento (Stage 4) con 3.000.000.965 tokens de una mezcla curada de contenido educativo, código y razonamiento, con una longitud de contexto de 8.192 tokens. El checkpoint base seleccionado de Stage 4 corresponde al paso 2500, con una pérdida de validación de 2,9263725876808167.

El pipeline de datos incluye deduplicación cruzada entre fuentes mediante MinHash de 64 permutaciones con búsqueda de candidatos LSH, deduplicación a nivel de frase y párrafo, descontaminación de benchmarks y eliminación de solapamiento por LCS. La compuerta de datos reporta 4.194.398 tokens de validación, 3.312.229 documentos indexados en Stage 4, 34.852.069 segmentos indexados y 23 documentos eliminados por contaminación de benchmark, con auditoría sobre ARC-Challenge, ARC-Easy, HellaSwag, PIQA, LAMBADA OpenAI y WinoGrande, usando candidatos de 13 gramos y eliminación por solapamiento LCS de tokens mayor o igual a 0,60.

El ajuste supervisado (SFT) se realizó sobre 426.842 filas de datos filtrados de estilo HuggingFaceTB/smol-smoltalk. Para mitigar el olvido catastrófico se aplicó una interpolación tipo model soup entre pesos SFT y base, seleccionando el candidato que superaba las compuertas de regresión de seis tareas. La evaluación se realizó con `lm-evaluation-harness`, semilla fija y conjuntos completos zero-shot, con artefactos en `eval_results/stage4_release/model_comparison/`.

## Capacidades

- Generación de texto en inglés con contexto de hasta 8.192 tokens.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por su tamaño.
- Capacidad incipiente de código y razonamiento matemático, derivada de la mezcla de datos de Stage 4 (educativo, código y razonamiento).
- Ajuste a formato conversacional mediante SFT sobre datos de estilo smol-smoltalk.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: solo inglés declarado.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Investigación en preentrenamiento de modelos pequeños: sirve como referencia reproducible para estudiar el efecto del presupuesto de tokens, la curación de datos y la selección de checkpoints en modelos de ~135M de parámetros, con artefactos de evaluación incluidos.
- Experimentos de curación de datos: el pipeline documentado (MinHash/LSH, deduplicación por frase y párrafo, descontaminación por 13-gramas y LCS) puede replicarse o compararse sobre nuevos corpus educativos.
- Estudio de olvido catastrófico y model soup: la interpolación 87,5% SFT / 12,5% base con compuertas de regresión es un caso práctico para investigar técnicas anti-olvido en modelos pequeños.
- Fine-tuning downstream ligero: al ser un modelo de 134,5M en safetensors y licencia Apache 2.0, es adecuado como base para tareas específicas de clasificación, extracción o generación controlada en inglés con recursos limitados.
- Prototipado educativo y demos: permite desplegar un modelo de generación de texto en una sola GPU consumer para pruebas de concepto, docencia o validación de pipelines de inferencia (TGI, transformers) sin infraestructura dedicada.
- Evaluación comparativa de metodologías: útil como baseline de bajo presupuesto frente a SmolLM-135M y SmolLM2-135M en estudios sobre eficiencia de tokens y cómputo.

## Benchmarks y rendimiento

Resultados zero-shot reportados por el autor sobre el checkpoint publicado (seleccionado, mezcla SFT/interpolado):

| Tarea | Métrica | Puntuación |
|---|---|---:|
| ARC-Challenge | acc_norm,none | 0.2867 |
| ARC-Easy | acc_norm,none | 0.4958 |
| HellaSwag | acc_norm,none | 0.3240 |
| LAMBADA OpenAI | acc,none | 0.2602 |
| PIQA | acc_norm,none | 0.6148 |
| WinoGrande | acc,none | 0.5083 |
| Media (6 tareas) | promedio de métricas seleccionadas | 0.4150 |

Resultados del checkpoint base de Stage 4 (sin mezcla SFT):

| Tarea | Métrica | Puntuación |
|---|---|---:|
| ARC-Challenge | acc_norm,none | 0.2833 |
| ARC-Easy | acc_norm,none | 0.5046 |
| HellaSwag | acc_norm,none | 0.3243 |
| LAMBADA OpenAI | acc,none | 0.2482 |
| PIQA | acc_norm,none | 0.6181 |
| WinoGrande | acc,none | 0.5059 |

Comparativa de medias de seis tareas reportada por el autor (mismo protocolo, checkpoints publicados):

| Modelo | Parámetros | Tokens reportados | Hardware reportado | Media 6 tareas |
|---|---:|---|---|---:|
| Lyric 135M (Stage 4) | 134,5M | ~13B | 1x NVIDIA L20 | 0.4150 |
| SmolLM-135M | 135M | 600B | 64x H100 | 0.4767 |
| SmolLM2-135M | 135M | 2T | 64x H100 | 0.4917 |
| Qwen2.5-0.5B | 0,49B | no reportado en la card de HF | no reportado en la card de HF | 0.5363 |
| OLMo-1B | 1B | 3T | no listado en la card de HF | 0.5681 |

La diferencia frente a SmolLM-135M es de 0,0617 puntos de media con aproximadamente el 2,2% de su presupuesto de tokens. Qwen2.5-0.5B y OLMo-1B se incluyen como referencias de mayor tamaño, no como baselines del mismo tamaño.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 134,5M de parámetros, en fp16 los pesos ocupan aproximadamente 269 MB; en fp32, unos 538 MB. La memoria adicional depende de la longitud de contexto y del runtime.
- GPU recomendadas: el autor reporta entrenamiento en una única NVIDIA L20. Para inferencia, cualquier GPU con al menos unos pocos GB de VRAM libre es suficiente en la práctica; no se especifican modelos concretos en la card.
- Cabe en GPU consumer: sí, por tamaño de parámetros; no se detallan modelos concretos ni requisitos de VRAM en la información disponible.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). Otras opciones como llama.cpp, Ollama o vLLM no se mencionan en la información proporcionada.
- Latencia y throughput: no se reportan cifras de inferencia. El único dato de rendimiento es el del entrenamiento inicial: 38,5k tokens/s de media tras el warmup en una L20.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media 6 tareas | Tokens de preentrenamiento | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|---|
| Lyric 135M (Stage 4) | 134,5M | 8.192 | 0.4150 | ~13B | Apache 2.0 | Hugging Face (Epode/Lyric-135M) |
| SmolLM-135M | 135M | no disponible en la información proporcionada | 0.4767 | 600B | no disponible en la información proporcionada | Hugging Face (HuggingFaceTB) |
| SmolLM2-135M | 135M | no disponible en la información proporcionada | 0.4917 | 2T | no disponible en la información proporcionada | Hugging Face (HuggingFaceTB) |
| Qwen2.5-0.5B | 0,49B | no disponible en la información proporcionada | 0.5363 | no reportado en la card | no disponible en la información proporcionada | Hugging Face (Qwen) |

La comparación directa por tamaño es con SmolLM-135M y SmolLM2-135M. Lyric 135M queda por debajo en media de seis tareas, pero con un presupuesto de tokens y cómputo drásticamente menor. Qwen2.5-0.5B y OLMo-1B son referencias de mayor tamaño y no constituyen baselines equivalentes.

## Limitaciones y advertencias

- Modelo de investigación: el autor lo declara explícitamente como modelo para experimentos de preentrenamiento, curación, continuación y fine-tuning, no para despliegue en producción sin validación independiente.
- Riesgo de alucinación: con 134,5M de parámetros y ~13B tokens de entrenamiento, la factualidad es limitada; el autor recomienda validar hechos, seguridad y adecuación a la tarea antes de cualquier uso real.
- Idiomas: solo se declara inglés; no hay soporte multilingüe documentado.
- Contexto: 8.192 tokens en la continuación Stage 4; no se documenta comportamiento más allá de esa ventana.
- Rendimiento absoluto modesto: media de 0.4150 en seis tareas, por debajo de SmolLM-135M (0.4767) y SmolLM2-135M (0.4917) en el mismo protocolo reportado por el autor.
- Sesgos: no se documentan análisis de sesgo en la información proporcionada.
- Licencia: Apache 2.0 permite uso comercial, pero el autor no garantiza idoneidad para producción; la responsabilidad de validación recae en el usuario.
- Tool calling, agentes y capacidades multimodales: no documentadas; no deben asumirse.
- Cuantizaciones: no se publican formatos GGUF ni cuantizaciones listas para usar en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Epode/Lyric-135M
- Página de la familia Epode (modelos MoE base): https://huggingface.co/spaces/Epode/README
- Artefactos de evaluación en el repositorio: `eval_results/stage4_release/model_comparison/summary.md`, `summary.csv`, `summary.json` (incluidos en el repo del modelo)
- Referencia SmolLM-135M: https://huggingface.co/HuggingFaceTB/SmolLM-135M
- Referencia SmolLM2-135M: https://huggingface.co/HuggingFaceTB/SmolLM2-135M
- Referencia Qwen2.5-0.5B: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Referencia OLMo-1B: https://huggingface.co/allenai/OLMo-1B
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset smol-smoltalk: https://huggingface.co/datasets/HuggingFaceTB/smol-smoltalk
- lm-evaluation-harness: https://github.com/EleutherAI/lm-evaluation-harness
