# agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-vs30v11v

## Resumen

Este repositorio contiene un checkpoint de aprendizaje por refuerzo (RL) del modelo Qwen3-4B, generado mediante el algoritmo GRPO (Group Relative Policy Optimization) implementado en OpenRLHF. El autor, agurung, lo presenta como el mejor checkpoint por métrica pass@8 dentro de la ejecución de RL denominada `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp20_vs30v11v`, guardado en el paso global 4. El modelo está especializado en generación de código y se entrenó directamente sobre el modelo base Qwen3-4B-Instruct-2507, sin pasar por una fase previa de fine-tuning supervisado (SFT).

El objetivo del entrenamiento es mejorar la capacidad del modelo para resolver problemas de programación del conjunto de datos "cobalt-train", un subconjunto de problemas que el modelo base resolvía en como máximo 2 de 64 muestras bajo un escaneo de dureza. La señal de recompensa es binaria: 1.0 si el programa generado supera los tests del problema, 0.0 en caso contrario. Este checkpoint representa un experimento de RL aplicado directamente a un modelo base, sin semilla SFT, lo que lo hace relevante para investigaciones sobre los límites del RL puro en tareas de código.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B, decoder-only) |
| Parametros totales | 4.411.424.256 (4,4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-4B-Instruct-2507, no especificada en la model card) |
| Tipos de cuantizacion | no disponible (repo en safetensors, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen3-4B-Instruct-2507, un transformer decoder-only con atención causal estándar. No se especifican detalles adicionales sobre la arquitectura interna (número de capas, heads, etc.) en la información proporcionada.

El entrenamiento de RL se realizó con OpenRLHF usando el algoritmo GRPO con ventajas normalizadas por grupo y sin penalización KL. La receta incluye dos penalizaciones específicas: una penalización "stop-properly" que asigna recompensa -1.0 a las respuestas truncadas (estilo ProRL), y una penalización DAPO por respuestas demasiado largas, que aplica una penalización aditiva que rampa hasta -0.25 en los últimos 1024 tokens antes del límite. Se usaron 8 muestras por prompt, un tamaño de lote de rollout de 128, un lote de entrenamiento de 128, un máximo de 4096 tokens nuevos por rollout, 2 épocas y una tasa de aprendizaje del actor de 1e-06 con programación constante. El conjunto de entrenamiento consta de 1833 problemas y el de validación de 112 problemas retenidos, todos del subconjunto "cobalt-train ≤2/64 frontier".

## Capacidades

- Generación de código: el modelo está entrenado específicamente para producir programas que superen tests de problemas de programación competitiva.
- Razonamiento multi-paso: al estar basado en Qwen3-4B, hereda capacidades de razonamiento del modelo base, aunque el RL se centra en corrección de código.
- Generación de texto: pipeline de text-generation estándar, compatible con transformers y vLLM.
- Tool calling: no se menciona soporte específico en la model card; probablemente heredado del modelo base, pero no confirmado.
- Multilingüismo: no se especifican idiomas soportados; se asume herencia de Qwen3-4B-Instruct-2507, pero sin confirmación.
- Capacidades especiales: el checkpoint está optimizado para la tarea de generación de código con recompensa binaria de corrección; no se reportan modos de pensamiento explícitos ni capacidades multimodales.

## Casos de uso

- Evaluación de RL en generación de código: este checkpoint sirve como referencia para estudiar el efecto del RL directo sobre un modelo base sin SFT previo, comparando con checkpoints que sí usan semilla SFT.
- Investigación en optimización de recompensas: la receta con penalizaciones anti-truncación y anti-sobrelongitud permite analizar el impacto de estas técnicas en la calidad de las soluciones generadas.
- Generación de código en entornos de validación: puede usarse para generar múltiples soluciones (pass@k) en problemas de programación competitiva, aprovechando su entrenamiento en el frontier de dureza.
- Punto de partida para fine-tuning posterior: al ser un checkpoint intermedio de RL, puede servir como base para continuar entrenamiento con otros algoritmos o datasets.
- Benchmarking de infraestructura RL: el repositorio incluye logs de entrenamiento y referencias a Weights & Biases, útil para reproducir pipelines de OpenRLHF.
- Servicio de inferencia con vLLM: el modelo se puede desplegar con `vllm serve` para pruebas de generación de código en tiempo real, aunque su utilidad práctica en producción es limitada dado su estado experimental.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona que el checkpoint es el "mejor por pass@8" en la ejecución, pero no proporciona valores numéricos concretos de pass@8 ni de otras métricas (MMLU, HumanEval, GSM8K, etc.). Tampoco se comparan resultados con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 4,4B parámetros en precisión fp16/bf16, se requieren aproximadamente 9-10 GB de VRAM para carga completa. Con cuantización (no publicada en el repo) podría reducirse, pero no hay datos.
- GPU recomendadas: una GPU con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12GB, RTX 4070, RTX 4090) para inferencia en fp16. Para entrenamiento RL, se necesitarían GPUs de mayor capacidad (A100, H100) o múltiples GPUs.
- Compatibilidad con GPU de consumo: sí, cabe en GPUs de consumo con 12 GB o más, aunque el entrenamiento RL original probablemente usó hardware de datacenter.
- Opciones de despliegue: transformers (carga directa), vLLM (servicio), y por extensión cualquier framework compatible con safetensors (llama.cpp, Ollama, TGI) si se generan cuantizaciones GGUF, aunque no se proporcionan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo es un checkpoint experimental de RL sobre Qwen3-4B-Instruct-2507, sin benchmarks publicados. Como referencia, se puede comparar con el propio modelo base Qwen3-4B-Instruct-2507 (que sí tiene benchmarks públicos) y con otros checkpoints de RL de la misma familia (por ejemplo, los de la serie "cobalt" del mismo autor), pero no se dispone de datos numéricos de estos últimos. Se recomienda consultar la documentación de Qwen3-4B-Instruct-2507 para una comparativa con modelos de tamaño similar.

## Limitaciones y advertencias

- Estado experimental: es un checkpoint intermedio de RL (paso global 4), no un modelo final pulido. Su rendimiento en tareas generales puede ser inferior al del modelo base.
- Sin licencia especificada: la licencia no está disponible, lo que impide conocer las restricciones de uso comercial. Se debe contactar al autor antes de cualquier uso en producción.
- Sin datos de sesgos ni alucinación: no se han evaluado sesgos ni tasas de alucinación; al ser un modelo de código, el riesgo de generar código incorrecto o con vulnerabilidades es relevante.
- Limitaciones de contexto: la longitud de contexto no se especifica; se hereda de Qwen3-4B-Instruct-2507, pero el entrenamiento con máximo de 4096 tokens nuevos puede limitar la generación de soluciones largas.
- Sin soporte multilingüe confirmado: los idiomas no están documentados; probablemente el modelo base soporta varios idiomas, pero no hay garantía.
- Reproducibilidad: los logs de entrenamiento están en Weights & Biases y en un archivo local, pero no se incluyen en el repositorio; la reproducibilidad exacta puede requerir acceso a esos recursos.
- Sin cuantizaciones publicadas: no hay archivos GGUF ni otras cuantizaciones, lo que limita el despliegue en entornos con poca VRAM.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/agurung/cobalt-seeded-rl-base-ramp25-stoppen-gen4k-ep2-ncp20-vs30v11v
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Repositorio relacionado del autor (checkpoint SFT): https://huggingface.co/agurung/cobalt-ft-qwen3-4b-sft-iid-12-lora-r128-a32-lr2p5e-4-const-lr2p5e-4-qps8-gpuauto-ep2
- Weights & Biases (proyecto `eaiexp-paper-final`, run `seeded_rl_base_ramp25_stoppen_gen4k_ep2_ncp20_vs30v11v`): no se proporciona URL directa en la información disponible.
