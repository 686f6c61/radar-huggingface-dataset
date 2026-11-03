# RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3b-code-replay-hard

## Resumen

`code-sft-rerun-20261102-qwen3b-code-replay-hard` es un artefacto de investigación publicado por la organización `RL-Forgettting-Exp4` dentro de una campaña de experimentos sobre olvido catastrófico (catastrophic forgetting) en ajuste supervisado (SFT) orientado a código. No se trata de un modelo de propósito general, sino de una unidad de entrenamiento concreta: un derivado de Qwen2.5-3B afinado con SFT sobre datos de código, con una configuración de *replay* (repetición de datos previos) con lambda 1.0 y una variante de datos etiquetada como "hard". El nombre codifica la fecha (2 de noviembre de 2026) y el brazo experimental dentro de una matriz de trece ejecuciones.

El repositorio contiene los pesos en formato safetensors (37 GB de tamaño total, lo que incluye checkpoints intermedios y estado de recuperación) junto con manifiestos de entrega, métricas y artefactos de procedencia. La model card describe la infraestructura de entrenamiento: learning rate 1e-5, una época, semilla 42, batch efectivo 256, micro-batch 1, 4 GPU H100, secuencia de 4096 tokens y 10 guardados de checkpoint por brazo. Las evaluaciones se realizan sobre MBPP+ con n=160 y temperatura 0.6.

Su relevancia es metodológica más que de producto: sirve para estudiar cómo el SFT sobre código afecta a las capacidades previas del modelo base y cómo el *replay* mitiga ese olvido. La licencia es "other" y los derechos derivan de la licencia upstream de Qwen2.5-3B (Qwen Research License), lo que condiciona fuertemente su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen2.5-3B; detalles internos no disponibles en la informacion proporcionada) |
| Parametros totales | 3B (aproximado, segun el nombre del modelo y el modelo base Qwen2.5-3B) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | 4096 tokens (longitud de entrenamiento; contexto nativo del modelo base no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | other (derivada de Qwen Research License para Qwen2.5-3B) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-3B, un transformer decoder-only con atención causal estándar (los detalles de capas, cabezas y dimensiones ocultas no se especifican en la información proporcionada). Sobre esta base se aplica un ajuste supervisado (SFT) con datos de código, sin que la model card mencione RLHF, DPO ni etapas de alineación adicionales. La innovación metodológica no está en la arquitectura sino en el protocolo experimental: se comparan variantes de ordenación de datos (ordered, shuffled, uniform, hard) y de función de pérdida (CE, cross-entropy), con y sin *replay* de datos previos.

La configuración de entrenamiento es explícita: learning rate 1e-5, una época, semilla 42, batch efectivo 256 (micro-batch 1 con acumulación), 4 GPU H100, secuencias de 4096 tokens y 10 checkpoints por brazo. El parámetro `replay lambda 1.0` indica que la pérdida de *replay* se pondera con el mismo peso que la pérdida sobre los datos nuevos de código, una elección agresiva orientada a preservar capacidades previas. El repositorio incluye el estado de recuperación retenido, las entradas exactas y las métricas, lo que permite reproducir o auditar el experimento. No se detalla el volumen total de tokens de entrenamiento ni la composición del dataset de código.

## Capacidades

- Generación de código: el ajuste SFT se orienta a tareas de programación, evaluadas con MBPP+ (n=160, temperatura 0.6).
- Razonamiento sobre código: al derivar de Qwen2.5-3B, hereda las capacidades de razonamiento del modelo base, aunque el alcance exacto tras el SFT no está documentado.
- Soporte de tool calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada (los idiomas no se listan).
- Capacidades especiales (thinking mode, visión, audio): no disponibles; el modelo es exclusivamente de texto según los artefactos publicados.

## Casos de uso

- Investigación sobre olvido catastrófico: el modelo sirve como brazo experimental para medir cuánto se degradan las capacidades del Qwen2.5-3B original tras un SFT intensivo en código, comparando la variante "hard" con las variantes ordered, shuffled y uniform del mismo estudio.
- Reproducción de experimentos de SFT: gracias a los manifiestos de entrega, los checkpoints y las métricas incluidas, un equipo de investigación puede replicar el entrenamiento con la misma semilla, learning rate y configuración de hardware (4x H100).
- Estudio de estrategias de replay: el parámetro lambda 1.0 permite analizar el equilibrio entre adquirir habilidad en código y retener conocimiento general, un problema central en pipelines de ajuste continuo.
- Evaluación comparativa de funciones de pérdida: la variante CE frente a otras permite aislar el efecto de la función de pérdida en el rendimiento sobre MBPP+.
- Generación de código en entornos controlados de investigación: el modelo puede usarse para generar soluciones a problemas tipo MBPP+ dentro de un banco de pruebas, siempre que se respete la Qwen Research License.
- Análisis de procedencia y trazabilidad de modelos: el repositorio ejemplifica un flujo de entrega con `delivery_manifest.json` y commits inmutables, útil como referencia para diseñar sistemas de auditoría de experimentos.

## Benchmarks y rendimiento

La model card menciona evaluaciones sobre `evaluations/mbppplus_n160_t0.6/delivery_manifest.json`, pero no se incluyen los resultados numéricos en la información proporcionada.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 3B parámetros en fp16, se requieren aproximadamente 6-7 GB de VRAM solo para los pesos, más overhead de activaciones y KV cache; en cuantización de 4 bits, alrededor de 2-3 GB. Estas cifras son estimaciones generales, no datos publicados por el autor.
- GPU recomendadas: el entrenamiento se realizó en 4x H100. Para inferencia, una GPU con al menos 8-16 GB de VRAM es suficiente en la mayoría de configuraciones.
- ¿Cabe en consumer GPU? Sí, previsiblemente en tarjetas como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4090 24 GB, especialmente con cuantización; no hay confirmación oficial en la información proporcionada.
- Opciones de despliegue: los pesos se publican en safetensors, por lo que son compatibles con frameworks estándar como vLLM, TGI o transformers. No se confirma soporte de GGUF ni Ollama.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| code-sft-rerun-20261102-qwen3b-code-replay-hard | ~3B | 4096 (entrenamiento) | other (Qwen Research License) | HuggingFace, 0 descargas | Brazo experimental de investigación |
| Qwen2.5-3B (base) | 3B | no disponible en esta ficha | Qwen Research License | HuggingFace | Modelo upstream del que deriva |
| Qwen3-1.7B-Base | 1.7B | no disponible en esta ficha | Apache 2.0 | HuggingFace | Usado como otra base en el mismo estudio |
| Llama-3.2-3B-Instruct | 3B | no disponible en esta ficha | Llama 3.2 Community License | HuggingFace | Tercera base del estudio, con variantes uniform/hard/CE |

La comparación directa de rendimiento entre estos modelos no está disponible en la información proporcionada; el estudio original los evalúa con el mismo protocolo (MBPP+ n=160, t=0.6), pero los resultados no se incluyen en la model card.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información proporcionada; al derivar de Qwen2.5-3B, hereda los sesgos del modelo base, no evaluados aquí.
- Riesgo de alucinación: no cuantificado; un SFT agresivo sobre código puede incrementar la generación de APIs o funciones inexistentes.
- Limitaciones de contexto: la longitud de entrenamiento es de 4096 tokens; no se garantiza un comportamiento correcto más allá de esa ventana.
- Idiomas: no se especifican los idiomas soportados, lo que impide garantizar calidad multilingüe.
- Restricciones de licencia: la licencia es "other" y los derechos derivan de la Qwen Research License; no se conceden derechos adicionales sobre el modelo upstream. El uso comercial puede estar restringido y debe verificarse en el archivo LICENSE/NOTICE del repositorio.
- Caveat de producción: es un artefacto de investigación con 0 descargas y 0 likes, sin pipeline declarado ni documentación de uso; no está pensado como modelo listo para producción.
- Trazabilidad: parte de los artefactos están en `RL-Forgetting-Experiments-3` y parte en `RL-Forgettting-Exp4` (nótese la errata en el nombre de la organización); es imprescindible consultar `delivery_manifest.json` para identificar qué unidades están verificadas.
- El repositorio incluye checkpoints intermedios y estado de recuperación, lo que infla el tamaño a 37 GB; no todos los archivos son pesos finales utilizables.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RL-Forgettting-Exp4/code-sft-rerun-20261102-qwen3b-code-replay-hard
- Repositorio de artefactos complementario: `RL-Forgetting-Experiments-3` (referenciado en la model card, sin URL directa en la información proporcionada)
- Manifiesto de entrega: `delivery_manifest.json` dentro del repositorio del modelo
- Manifiesto de evaluaciones: `evaluations/mbppplus_n160_t0.6/delivery_manifest.json` dentro del repositorio del modelo
- Modelo base: Qwen2.5-3B (HuggingFace, URL no incluida en la información proporcionada)
- Paper, blog o demo: no disponibles en la información proporcionada
