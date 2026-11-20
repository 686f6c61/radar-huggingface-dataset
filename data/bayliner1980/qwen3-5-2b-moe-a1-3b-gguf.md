# bayliner1980/Qwen3.5-2B-MoE-A1.3B-GGUF

## Resumen

Qwen3.5-2B-MoE-A1.3B es una conversión experimental del modelo denso Qwen/Qwen3.5-2B a una arquitectura de mezcla de expertos (MoE), realizada por el usuario bayliner1980 sin reentrenamiento previo. Cada capa MLP del modelo original se divide en 32 expertos de 192 neuronas y un router selecciona 12 por token, de modo que el modelo ejecuta solo el 37,5% del cómputo MLP original. El resultado es un modelo de 1.890 millones de parámetros totales con 1.320 millones de parámetros activos por token (813 millones excluyendo embeddings).

El modelo conserva las 24 capas, el tamaño oculto de 2048 y el vocabulario de 248.320 tokens del original, e introduce una arquitectura híbrida con Gated DeltaNet y atención completa con compuertas. Se distribuye en formato GGUF y carga como un `Qwen3_5MoeForCausalLM` estándar, funcionando en llama.cpp con el soporte `qwen35moe`.

Su relevancia es doble: por un lado, demuestra una técnica de "moeficación" (conversión denso a MoE) sin pretraining, que reduce el cómputo activo a costa de una degradación medible en perplejidad y en tareas de conocimiento factual; por otro, sirve como referencia práctica de hasta dónde llega este tipo de conversión sin un ciclo de entrenamiento posterior. No está pensado para uso en producción con cargas factuales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con Gated DeltaNet y atención completa con compuertas; MLP convertido a MoE (32 expertos, top-12) |
| Parámetros totales | 1.888.165.696 (1,89B) |
| Parámetros activos | 1.320 millones por token (813M excluyendo embeddings) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | BF16 y Q4_K_M (archivos GGUF publicados); otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B, un transformer denso de 24 capas que combina capas de Gated DeltaNet con capas de atención completa con compuertas, tamaño oculto de 2048 y embeddings atados con vocabulario de 248.320 tokens. La intervención consiste en sustituir cada MLP SwiGLU de 6144 neuronas por 32 expertos de 192 neuronas cada uno, con un router que activa 12 expertos por token. Esto mantiene el número total de parámetros prácticamente igual (de 1,88B a 1,89B) pero reduce los parámetros activos a 1,32B y el cómputo MLP activo al 37,5%.

No hubo pretraining ni entrenamiento posterior a la conversión: el autor indica explícitamente que el modelo no fue entrenado tras la moeficación, lo que explica la degradación en perplejidad y en recall factual. No se documentan datos de entrenamiento, composición del dataset, ni fases de RLHF o DPO, ya que se heredan del modelo base sin modificaciones. Tampoco se indica el modo thinking como capacidad entrenada: el autor recomienda mantenerlo desactivado porque no fue entrenado tras la conversión. El modelo requiere `transformers` 5.5.0 y el paquete `fla-core` para los kernels rápidos de DeltaNet.

## Capacidades

- Generación de texto conversacional en inglés, con plantilla de chat (`-cnv` en llama.cpp) y temperatura recomendada de 0,7 con top-p 0,8.
- Razonamiento básico y respuesta a preguntas de sentido común, con rendimiento degradado respecto al modelo denso original.
- Comprensión lectora y tareas de elección múltiple (HellaSwag, ARC, WinoGrande, OpenBookQA).
- Ejecución eficiente en CPU y GPU de gama baja gracias a la reducción del cómputo activo y a los archivos GGUF de 1,2 GB en Q4_K_M.
- Compatibilidad con endpoints y con el ecosistema llama.cpp (`qwen35moe`).
- Soporte de tool calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: solo inglés.
- Modo thinking: no entrenado tras la conversión; el autor recomienda desactivarlo.
- Visión y audio: no disponibles.

## Casos de uso

- Experimentación con técnicas de moeficación: el modelo sirve como banco de pruebas para estudiar la degradación que introduce la conversión denso a MoE sin pretraining, comparando perplejidad y tareas de conocimiento frente al modelo denso original.
- Inferencia en hardware de gama baja: con el archivo Q4_K_M de 1.277 MiB y un throughput de 177 t/s en generación sobre una RTX 4060, es adecuado para prototipos locales en equipos con poca VRAM o incluso en CPU.
- Generación de texto creativo y conversacional sin requisitos factuales: dado que el recall factual cae al 0,760 frente al 0,948 del original, encaja en tareas de redacción libre donde la exactitud de datos no es crítica.
- Evaluación comparativa de arquitecturas MoE: útil en investigación para medir el equilibrio entre parámetros activos, velocidad y calidad en un modelo de menos de 2B parámetros.
- Docencia y divulgación: ejemplo didáctico de cómo se estructura un router top-12 sobre expertos de 192 neuronas y de cómo se refleja en los archivos GGUF y en el soporte de llama.cpp.
- Pruebas de integración en pipelines llama.cpp: validación de compatibilidad con `llama-cli`, `llama-perplexity` y el tipo de modelo `qwen35moe` antes de desplegar modelos mayores de la misma familia.
- Clasificación y etiquetado de texto en inglés: tareas de elección múltiple y sentido común donde el modelo mantiene un rendimiento aceptable (media de tareas 0,487).

## Benchmarks y rendimiento

| Métrica | Qwen3.5-2B (denso) | Este modelo |
|---|---|---|
| Perplejidad Wikitext-2 (↓) | 13,60 | 14,68 (+7,9%) |
| Perplejidad C4 (↓) | 18,73 | 25,29 (+35%) |
| HellaSwag | 0,565 | 0,497 |
| ARC-Easy | 0,679 | 0,664 |
| ARC-Challenge | 0,413 | 0,370 |
| WinoGrande | 0,623 | 0,579 |
| OpenBookQA | 0,350 | 0,324 |
| Media de tareas | 0,526 | 0,487 |
| Recall factual (287 hechos) | 0,948 | 0,760 |

| Archivo GGUF | Tamaño | Perplejidad llama.cpp vs transformers | Velocidad en RTX 4060 (tg128 / pp512) |
|---|---|---|---|
| `q35-2b-k12h2-bbtm-bf16.gguf` | 3616 MiB | −0,24% | no medida |
| `q35-2b-k12h2-bbtm-Q4_K_M.gguf` | 1277 MiB | +3,17% | 177 / 6009 t/s |

La comparación de perplejidad se realizó con `llama-perplexity` sobre 40 secuencias de 512 tokens de wikitext-2.

## Requisitos de hardware

- VRAM estimada: aproximadamente 3,6 GB para el archivo BF16 (3616 MiB) y unos 1,3 GB para Q4_K_M (1277 MiB), sin contar el espacio de contexto y el estado de la caché KV.
- GPU recomendadas: RTX 4060 como referencia medida por el autor; cualquier GPU consumer con al menos 4 GB de VRAM para BF16 o 2 GB para Q4_K_M.
- Cabe en GPU consumer: sí, en tarjetas de gama de entrada y media; el archivo Q4_K_M también es viable en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-perplexity`), con soporte del tipo de modelo `qwen35moe`; en Python, `transformers` 5.5.0 con `fla-core`. vLLM, Ollama y TGI no están documentados para este modelo.
- Latencia y throughput: 177 t/s en generación (tg128) y 6009 t/s en prefill (pp512) con Q4_K_M sobre RTX 4060; el archivo BF16 no tiene medición publicada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-2B-MoE-A1.3B (este) | 1,89B | 1,32B | no disponible | Apache 2.0 | GGUF en Hugging Face |
| Qwen3.5-2B (denso, base) | 1,88B | 1,88B | no disponible | Apache 2.0 | Hugging Face |
| Alternativas MoE de menos de 3B | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el modelo denso del que deriva: este modelo reduce los parámetros activos un 30% y el cómputo MLP al 37,5%, a cambio de una media de tareas de 0,487 frente a 0,526 y un recall factual de 0,760 frente a 0,948. No se dispone de datos de otros modelos MoE comparables en la información proporcionada.

## Limitaciones y advertencias

- Degradación medible respecto al modelo denso: perplejidad en C4 un 35% peor y media de tareas 0,039 puntos inferior.
- Recall factual muy reducido (0,760 frente a 0,948): el autor recomienda explícitamente no confiar en el modelo para datos factuales.
- Modo thinking no entrenado tras la conversión: activarlo puede producir respuestas incoherentes o de peor calidad.
- Solo inglés: no hay soporte multilingüe documentado.
- Longitud de contexto no documentada: no se debe asumir la ventana del modelo base sin verificación.
- Conversión sin pretraining: la calidad es la de una prueba de concepto, no la de un modelo entrenado para producción.
- Riesgo de alucinación elevado en tareas de conocimiento, coherente con la caída de recall factual.
- Sin datos publicados sobre sesgos; al derivar del modelo base, hereda los sesgos de sus datos de entrenamiento originales.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento en producción.
- Repositorio con 0 descargas y 1 like en el momento de la consulta: ecosistema de validación muy limitado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bayliner1980/Qwen3.5-2B-MoE-A1.3B-GGUF
- Modelo base (MoE, safetensors): https://huggingface.co/bayliner1980/Qwen3.5-2B-MoE-A1.3B
- Modelo original denso: https://huggingface.co/Qwen/Qwen3.5-2B
- Apoyo al autor: https://ko-fi.com/bayliner1980
