# skyyyyks/cope-alfworld-qwen2.5-7b-seed1-step50

## Resumen

CoPE on ALFWorld: Qwen2.5-7B-Instruct, seed 1, step 50 es un ajuste fino de Qwen2.5-7B-Instruct publicado por el usuario skyyyyks. El modelo se ha entrenado sobre el entorno ALFWorld, un benchmark de agentes que requiere resolver tareas de manipulación de objetos mediante instrucciones en lenguaje natural dentro de un mundo textual. El entrenamiento emplea CoPE (del repositorio ulab-uiuc/CoPE), que en esta implementación equivale a GRPO (Group Relative Policy Optimization) más una pérdida auxiliar de predicción de acciones (action forecast).

Se trata de un checkpoint intermedio: concretamente el actor en el paso 50 de 264 (2 épocas) de la semilla 1. Los pesos se han fusionado desde el checkpoint FSDP de verl a un modelo bf16 de Hugging Face. No se incluye estado de optimizador ni de dataloader, por lo que no es posible reanudar exactamente esa ejecución. El modelo es relevante como artefacto de investigación para estudiar el efecto del RL con pérdida auxiliar sobre el razonamiento multi-paso en agentes, no como modelo de propósito general.

La arquitectura subyacente es la de Qwen2.5-7B-Instruct (transformer denso de 7.615.616.512 parámetros), con licencia Apache 2.0. El contexto, los idiomas y el resto de especificaciones heredan los del modelo base, aunque la model card no los detalla explícitamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), ajustado con GRPO + pérdida auxiliar de predicción de acciones (CoPE) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la model card (heredada de Qwen2.5-7B-Instruct) |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-7B-Instruct, un transformer decoder-only denso de 7.615.616.512 parámetros. Sobre esa base se aplica un ajuste con CoPE, que en esta configuración es GRPO (Group Relative Policy Optimization) más una pérdida auxiliar de action forecast con coeficiente 0.01, K=3, gate `wins`, normalización por grupo activada y skip de acciones inválidas activado. El entrenamiento se ejecuta con verl sobre 4 GPUs H20.

Los hiperparámetros documentados son: batch de 16 prompts × 8 rollouts, learning rate 1e-6, coeficiente KL 0.001 (low_var_kl) y coeficiente de entropía 0.002. Los rollouts permiten hasta 20 rondas de 512 tokens por turno. El checkpoint corresponde al paso 50 de 264 (2 épocas) de la semilla 1. La puntuación de entrenamiento en ese paso es 0.914 (media de los pasos 41-50: 0.903), medida como `critic/score/mean`, es decir, la tasa de éxito de ALFWorld sobre el batch de entrenamiento (16 tareas × 8 rollouts); no es una evaluación en held-out.

## Capacidades

- Generación de texto conversacional, heredada de Qwen2.5-7B-Instruct.
- Razonamiento multi-paso orientado a agentes: el ajuste con GRPO sobre ALFWorld entrena al modelo para emitir acciones secuenciales dentro de un entorno textual.
- Predicción de acciones (action forecast) como señal auxiliar durante el entrenamiento, no como capacidad de inferencia expuesta.
- Soporte de tool calling / function calling: no documentado específicamente para este checkpoint (el modelo base Qwen2.5-7B-Instruct lo soporta, pero la model card no lo confirma tras el ajuste).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Investigación en RL para agentes: reproducir o comparar el efecto de GRPO con pérdida auxiliar de action forecast frente a GRPO estándar sobre ALFWorld, usando este checkpoint como referencia intermedia del paso 50.
- Análisis de curvas de aprendizaje: al existir checkpoints en distintos pasos (step 50 de 264), sirve para estudiar la evolución de la tasa de éxito y el comportamiento del agente a lo largo del entrenamiento.
- Evaluación de robustez en entornos textuales: probar el modelo en tareas de ALFWorld no vistas o en variantes del entorno para medir generalización más allá del batch de entrenamiento.
- Baseline para ablaciones: comparar variantes de CoPE (con y sin action forecast, con distintos valores de K o coeficiente) contra este checkpoint fijo.
- Estudio de estabilidad del entrenamiento: analizar la diferencia entre la puntuación del paso 50 (0.914) y la media de los pasos 41-50 (0.903) como indicador de varianza entre lotes.
- Docencia y divulgación: ejemplo reproducible de un pipeline verl + FSDP + GRPO fusionado a Hugging Face para explicar el ciclo completo de entrenamiento de un agente.

## Benchmarks y rendimiento

| Metrica | Valor | Contexto |
|---|---|---|
| ALFWorld success rate (step 50) | 0.914 | `critic/score/mean` sobre 16 tareas × 8 rollouts del batch de entrenamiento |
| ALFWorld success rate (media steps 41-50) | 0.903 | Media de la tasa de éxito en esos pasos |

No se han publicado resultados de benchmarks en held-out (MMLU, HumanEval, GSM8K u otros) en la información disponible. La única métrica reportada es la tasa de éxito de entrenamiento, que no equivale a una evaluación independiente.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 15,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda al menos 24 GB para contextos moderados.
- GPU recomendadas: A100 40/80 GB, H100 80 GB o H20 (la misma familia usada en entrenamiento) para despliegue sin cuantizar.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con contextos cortos; en RTX 3090 (24 GB) también es viable con precaución. En GPUs de 16 GB requeriría cuantización, que el autor no publica.
- Opciones de despliegue: transformers (uso documentado en la model card), text-generation-inference (tag `text-generation-inference`), y potencialmente vLLM o llama.cpp si se generan cuantizaciones propias (no publicadas).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cope-alfworld-qwen2.5-7b-seed1-step50 | 7,6 B | no disponible | GRPO + action forecast sobre ALFWorld, step 50/264 | apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen2.5-7B-Instruct | 7,6 B | no disponible en esta ficha | SFT + RLHF de Qwen | apache-2.0 | Hugging Face (ampliamente usado) |
| Checkpoints CoPE en otros pasos (mismo autor) | 7,6 B | no disponible | Mismo pipeline, distinto step/seed | apache-2.0 | Hugging Face (si publicados) |

La comparación con otros modelos de la misma categoría (agentes entrenados con RL sobre ALFWorld) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint intermedio: corresponde al paso 50 de 264; no es el modelo final de la ejecución y su rendimiento puede mejorar o degradar en pasos posteriores.
- Métrica de entrenamiento, no de evaluación: la tasa 0.914 se calcula sobre el batch de entrenamiento (16 tareas × 8 rollouts) y no sobre un conjunto held-out, por lo que puede estar sobreestimada.
- No reanudable: solo se publican los pesos; no hay estado de optimizador ni de dataloader, por lo que no se puede continuar exactamente el entrenamiento original.
- `generation_config.json` es el del modelo base, no el del ajuste; puede no reflejar la configuración óptima de generación tras el RL.
- Especialización estrecha: el ajuste está orientado a ALFWorld; el comportamiento fuera de ese entorno no está documentado.
- Sesgos y alucinaciones: no documentados en la model card; al heredar de Qwen2.5-7B-Instruct, arrastra los sesgos del modelo base, no evaluados aquí.
- Idiomas: no se especifican; no se garantiza el multilingüismo tras el ajuste.
- Uso comercial: la licencia Apache 2.0 lo permite, pero la ausencia de evaluación held-out y de documentación de sesgos desaconseja su uso en producción sin validación adicional.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni reportes de terceros.

## Enlaces

- Hugging Face: https://huggingface.co/skyyyyks/cope-alfworld-qwen2.5-7b-seed1-step50
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Código CoPE: https://github.com/ulab-uiuc/CoPE
- Repositorio verl (framework de entrenamiento): no disponible en la información proporcionada
- Paper de ALFWorld: no disponible en la información proporcionada
- Demo: no disponible
