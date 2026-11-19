# markstanl/coherencerl-exp7-1_5b-lora

## Resumen

`markstanl/coherencerl-exp7-1_5b-lora` es un ajuste fino (LoRA) del modelo base Qwen/Qwen2.5-1.5B, desarrollado por el usuario markstanl y publicado en Hugging Face. El modelo se ha entrenado mediante GRPO (Group Relative Policy Optimization), la técnica de aprendizaje por refuerzo introducida en DeepSeekMath, utilizando la librería TRL de Hugging Face. El objetivo declarado por el nombre del repositorio es mejorar la "coherencia" de las respuestas del modelo base, aunque la model card no detalla la composición del dataset ni las recompensas utilizadas.

Se trata de un experimento de investigación (la nomenclatura "exp7" sugiere una serie de pruebas) más que de un modelo listo para producción. El repositorio ocupa 0,1 GB, lo que es coherente con un adaptador LoRA y no con los pesos completos del modelo. El modelo base Qwen2.5-1.5B es un transformer decoder-only de 1.500 millones de parámetros con 32.768 tokens de contexto, pero la model card no confirma que el adaptador preserve todas esas capacidades.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de aplicación de GRPO a un modelo pequeño; por otro, sirve de advertencia sobre las limitaciones de los adaptadores LoRA publicados sin documentación técnica suficiente (sin licencia, sin idiomas declarados, sin benchmarks).

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen2.5-1.5B); adaptador LoRA entrenado con GRPO |
| Parametros totales | 1.500 millones (modelo base Qwen2.5-1.5B); el adaptador LoRA no disponible en la información proporcionada |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-1.5B); no confirmada para el adaptador |
| Tipos de cuantizacion | No disponible (el repositorio contiene safetensors del adaptador; no se publican versiones GGUF ni cuantizadas) |
| Idiomas soportados | No disponible (la model card no declara idiomas; el modelo base Qwen2.5 soporta múltiples idiomas, pero el ajuste puede haber alterado esta capacidad) |
| Licencia | No disponible (la model card indica "licence: license" sin especificar; el modelo base Qwen2.5-1.5B usa Apache 2.0, pero el adaptador no declara licencia) |
| Formato de pesos | Safetensors (adaptador LoRA); requiere cargar el modelo base Qwen/Qwen2.5-1.5B |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA aplicado sobre Qwen2.5-1.5B, un transformer decoder-only con atención causal estándar, RoPE y normalización RMSNorm, tal como se describe en la familia Qwen2.5. El entrenamiento se realizó con GRPO, un algoritmo de optimización de política que estima la ventaja relativa dentro de un grupo de respuestas generadas para la misma consulta, eliminando la necesidad de un modelo crítico separado. La model card cita el paper de DeepSeekMath (arXiv:2402.03300) como referencia del método.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la función de recompensa utilizada ni los hiperparámetros del LoRA (rango, alpha, capas objetivo). La model card solo indica las versiones del framework: TRL 1.10.0, Transformers 5.15.0, PyTorch 2.11.0, Datasets 5.0.1 y Tokenizers 0.22.2. Se enlaza un run de Weights & Biases (RLCR/geat7qz0) que probablemente contiene las curvas de entrenamiento, pero no se ha verificado su contenido en esta ficha. No se documenta ninguna innovación técnica adicional más allá del uso de GRPO.

## Capacidades

- Generación de texto conversacional: el ejemplo de la model card muestra un pipeline de `text-generation` con formato de chat (`role: user`), lo que indica que el adaptador mantiene el formato de conversación de Qwen2.5.
- Razonamiento y coherencia: el nombre del experimento ("coherencerl") sugiere que el entrenamiento con GRPO buscaba mejorar la coherencia de las respuestas, pero no se aportan métricas que lo demuestren.
- Soporte de tool calling: no disponible en la información proporcionada (el modelo base Qwen2.5-1.5B lo soporta, pero no se confirma que el adaptador lo preserve).
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada (el modelo base es multilingüe, pero el adaptador no declara idiomas).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Experimentación con GRPO: el caso de uso principal es reproducir o extender el entrenamiento con GRPO sobre un modelo pequeño. El adaptador sirve como punto de partida para comparar curvas de recompensa y estudiar la estabilidad del algoritmo en modelos de 1.5B.
- Generación de respuestas conversacionales en prototipos: se puede integrar en un pipeline de `transformers` con `pipeline("text-generation")` para generar respuestas a preguntas abiertas, como el ejemplo de la máquina del tiempo de la model card. Adecuado para demos y pruebas de concepto, no para producción sin evaluación previa.
- Investigación sobre coherencia en LLM pequeños: útil para analizar si el ajuste con GRPO mejora la cohesión de respuestas largas en un modelo de 1.5B, comparando con el modelo base sin adaptador.
- Fine-tuning educativo: sirve como ejemplo didáctico de cómo se publica un adaptador LoRA entrenado con TRL y GRPO, incluyendo el enlace a W&B para inspeccionar el entrenamiento.
- Base para nuevos experimentos de RL: al ser un adaptador LoRA, se puede combinar con otros adaptadores o continuar el entrenamiento con distintas funciones de recompensa sin tocar los pesos completos.
- Evaluación de robustez de adaptadores: útil para estudiar cómo un adaptador LoRA sin documentación de licencia ni idiomas afecta a las capacidades del modelo base (por ejemplo, si degrada el multilingüismo o el tool calling).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador LoRA sobre Qwen2.5-1.5B, los requisitos son los del modelo base. En fp16, aproximadamente 3 GB de VRAM para los pesos (1.5B × 2 bytes) más overhead de activaciones y KV cache. En cuantización de 4 bits (si se aplica al modelo base, no incluida en el repositorio), alrededor de 1-1.5 GB.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para fp16 con contexto moderado (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100). Para contextos largos cercanos a 32.768 tokens, se necesita más VRAM por la KV cache.
- ¿Cabe en consumer GPU? Sí, en la mayoría de GPU consumer modernas con 8 GB o más, especialmente si se cuantiza el modelo base a 4 bits.
- Opciones de despliegue: `transformers` (pipeline nativo), `text-generation-inference` (el tag `text-generation-inference` está presente), vLLM (requiere fusionar el adaptador o cargarlo como LoRA), llama.cpp/Ollama (requiere convertir el modelo fusionado a GGUF, no incluido en el repositorio).
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| markstanl/coherencerl-exp7-1_5b-lora | 1.5B (base) + LoRA | 32.768 (base) | No disponible | Hugging Face, adaptador LoRA | Entrenado con GRPO; sin benchmarks |
| Qwen/Qwen2.5-1.5B | 1.5B | 32.768 | Apache 2.0 | Hugging Face, ampliamente disponible | Modelo base; soporta tool calling y multilingüismo |
| Qwen/Qwen2.5-1.5B-Instruct | 1.5B | 32.768 | Apache 2.0 | Hugging Face | Versión instruida oficial; benchmarks publicados |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | 1.7B | 8.192 | Apache 2.0 | Hugging Face | Alternativa pequeña con benchmarks y documentación completa |

## Limitaciones y advertencias

- Licencia no especificada: la model card indica "licence: license" sin detallar términos. No se puede asumir uso comercial permitido; hay que contactar con el autor o tratar el modelo como no licenciado para producción.
- Idiomas no declarados: aunque el modelo base Qwen2.5 es multilingüe, el ajuste con GRPO puede haber sesgado las respuestas hacia el idioma del dataset de entrenamiento (no documentado).
- Sin benchmarks: no hay evidencia publicada de que el adaptador mejore la coherencia ni de que no degrade otras capacidades del modelo base.
- Riesgo de alucinación: inherente a los modelos de 1.5B; el ajuste con RL no elimina este riesgo y puede amplificarlo si la recompensa prioriza fluidez sobre veracidad.
- Documentación insuficiente: no se detallan dataset, función de recompensa, hiperparámetros del LoRA ni criterios de selección del checkpoint. Esto dificulta la reproducibilidad y la evaluación de sesgos.
- Sesgos conocidos: no documentados; los sesgos del modelo base Qwen2.5-1.5B (derivados de sus datos de preentrenamiento) probablemente persisten o se modifican de forma no controlada.
- Uso en producción: no recomendado sin una evaluación exhaustiva previa, dado que se trata de un experimento de investigación sin garantías de calidad ni licencia clara.
- Fecha de creación inusual: la model card indica 2026-10-22, lo que puede ser un error de metadatos o una fecha futura; conviene verificar la procedencia del repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/markstanl/coherencerl-exp7-1_5b-lora
- Modelo base Qwen2.5-1.5B: https://huggingface.co/Qwen/Qwen2.5-1.5B
- Paper de GRPO (DeepSeekMath): https://huggingface.co/papers/2402.03300
- Repositorio TRL: https://github.com/huggingface/trl
- Run de Weights & Biases: https://wandb.ai/markgstanley1-nostomania-/RLCR/runs/geat7qz0
