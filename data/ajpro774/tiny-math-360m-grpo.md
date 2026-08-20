# AJpro774/tiny-math-360m-grpo

## Resumen

El modelo `AJpro774/tiny-math-360m-grpo` es un ajuste fino de `HuggingFaceTB/SmolLM2-360M-Instruct`, desarrollado por el usuario AJpro774, orientado a mejorar el razonamiento matemático mediante entrenamiento con GRPO (Group Relative Policy Optimization), técnica introducida en el paper de DeepSeekMath. Con solo 360 millones de parámetros, se presenta como una alternativa ligera para tareas de cálculo y resolución de problemas matemáticos en entornos con recursos limitados. Su relevancia radica en la aplicación de técnicas de aprendizaje por refuerzo a modelos pequeños, un campo activo en la investigación de eficiencia computacional. Aunque no se especifican detalles completos de arquitectura ni de rendimiento, su base SmolLM2 garantiza una arquitectura transformer estándar y un tamaño reducido que facilita su despliegue.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en SmolLM2) |
| Parametros totales | 360 millones |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura transformer de `SmolLM2-360M-Instruct`, que cuenta con una ventana de contexto de 4096 tokens en su versión base. El entrenamiento se realizó con GRPO, un método de optimización de políticas que agrupa respuestas para estimar ventajas sin necesidad de un crítico separado, tal como se describe en el paper de DeepSeekMath (arXiv:2402.03300). Según el repositorio de GitHub asociado, el entrenamiento combinó LoRA SFT (supervised fine-tuning) y GRPO sobre el dataset `Big-Math-RL-Verified`, con ejecución en Jupyter y Colab. No se han publicado detalles sobre el número de tokens, la composición exacta del dataset ni el número de pasos de entrenamiento.

## Capacidades

- Razonamiento matemático y resolución de problemas numéricos, gracias al entrenamiento con GRPO.
- Generación de texto de propósito general, heredada de la base instruct de SmolLM2.
- Capacidad multilingüe limitada por el modelo base (SmolLM2 soporta inglés, francés, alemán, español, etc.), aunque no se ha confirmado en este ajuste.
- No se han documentado capacidades específicas de tool calling, agentes o razonamiento multi-paso más allá de lo que el modelo base pueda ofrecer.

## Casos de uso

- **Resolución de problemas matemáticos en entornos educativos**: el modelo puede generar explicaciones paso a paso para ejercicios de álgebra o aritmética, aprovechando su entrenamiento en razonamiento matemático.
- **Asistente de cálculo en aplicaciones móviles**: por su tamaño reducido, es viable integrarlo en apps con requisitos de memoria bajos, ofreciendo respuestas a consultas numéricas.
- **Generación de datos sintéticos para entrenamiento**: puede usarse para crear ejemplos de problemas matemáticos con razonamiento, útiles para ampliar datasets en investigación.
- **Pruebas de técnicas de RL en modelos pequeños**: sirve como banco de pruebas para experimentar con GRPO y otras políticas de refuerzo en entornos académicos.
- **Automatización de tareas de verificación numérica**: en pipelines de datos, puede ayudar a validar cálculos simples o formatear resultados.
- **Prototipado rápido**: al ser ligero, es adecuado para prototipos en notebooks o aplicaciones en CPU antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este modelo.

## Requisitos de hardware

- **VRAM estimada**: al tratarse de un modelo de 360M parámetros, el peso en FP16 ocupa aproximadamente 720 MB, por lo que cabría en GPUs con 2 GB o más (por ejemplo, GTX 1650, RTX 3050, etc.).
- **GPU recomendadas**: cualquier GPU moderna con al menos 4 GB de VRAM para inferencia con cuantización, o incluso CPU para uso no interactivo.
- **Compatibilidad con GPU de consumo**: sí, es adecuado para tarjetas como RTX 3060, RTX 4060, o incluso para ejecución en Apple Silicon.
- **Opciones de despliegue**: puede desplegarse con frameworks como vLLM, llama.cpp (si se convierte a GGUF), Ollama o TGI, aunque el formato de pesos actual es safetensors y no se ha confirmado la conversión.
- **Latencia y throughput**: no se conocen datos concretos; en una GPU moderna, la generación de tokens debería ser de decenas de tokens por segundo, pero es una estimación no verificada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| tiny-math-360m-grpo (este) | 360M | No disponible | GRPO sobre SmolLM2 | No disponible |
| SmolLM2-360M-Instruct | 360M | 4K | Instruct-tuning | Apache 2.0 |
| TinyMathReason-1B-grpo | 1B | No disponible | GRPO | No disponible |

No se dispone de datos de rendimiento para comparar. La comparación se limita a características de arquitectura y tamaño. El modelo base SmolLM2 tiene una licencia Apache 2.0, pero la licencia del ajuste fino no se especifica, por lo que no se puede asumir la misma.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: al ser un modelo de 360M, es propenso a errores de cálculo y a generar respuestas plausibles pero incorrectas, especialmente con números grandes o problemas complejos.
- **Riesgo de razonamiento circular**: el entrenamiento con GRPO puede llevar a patrones repetitivos o a colapsos de modo, como se ha observado en modelos similares.
- **Idiomas no confirmados**: aunque SmolLM2 soporta varios idiomas, no se ha verificado que el fine-tuning mantenga esa capacidad en todos los idiomas.
- **Licencia incierta**: la ausencia de una licencia clara impide su uso comercial sin riesgo legal. Se recomienda contactar al autor o verificar los derechos de uso.
- **Limitaciones de contexto**: no se especifica la longitud de contexto del modelo ajustado; si se conserva la del base (4k), puede ser insuficiente para tareas de razonamiento largo.
- **Soporte de herramientas**: no se ha documentado la capacidad de tool calling o agentes, por lo que no es adecuado para aplicaciones que requieran integraciones externas.

## Enlaces

- Modelo en HuggingFace: [https://huggingface.co/AJpro774/tiny-math-360m-grpo](https://huggingface.co/AJpro774/tiny-math-360m-grpo)
- Repositorio GitHub: [https://github.com/AJpro774/tiny-math-20m](https://github.com/AJpro774/tiny-math-20m)
- Paper de GRPO (DeepSeekMath): [https://huggingface.co/papers/2402.03300](https://huggingface.co/papers/2402.03300)
- Documentación de TRL: [https://github.com/huggingface/trl](https://github.com/huggingface/trl)
- Modelo base: [https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct)
