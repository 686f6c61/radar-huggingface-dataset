# sandeep123/sqa-grpo-entropy-step1200

## Resumen

`sandeep123/sqa-grpo-entropy-step1200` es un ajuste fino del modelo base `Qwen/Qwen2.5-Math-1.5B` (1.777 millones de parámetros) mediante **GRPO** (Group Relative Policy Optimization) con un **bonus de entropía** aplicado a la pérdida. El modelo está especializado en razonamiento científico sobre el dataset ScienceQA, donde alcanza un `pass@1` de 0.8613 y `pass@6` de 0.9414 en validación. Es un checkpoint intermedio (paso 1200) seleccionado por su mejor rendimiento en `pass@1` dentro de una serie de experimentos de RL.

El interés de este modelo no radica en su capacidad general, sino en que sirve como **baseline reproducible** para estudiar cómo el coeficiente de entropía afecta a la estabilidad del entrenamiento con GRPO en modelos pequeños. El autor advierte explícitamente que no se debe aplicar el chat template de Qwen2.5-Math en inferencia, ya que el entrenamiento se realizó sobre texto sin formato y hacerlo introduce una penalización de aproximadamente 19 puntos en `pass@1`. La licencia es Apache-2.0 y los pesos se distribuyen en formato `safetensors`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Math) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 32.000 tokens (base) / 512 prompt + 1024 respuesta (entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo base soporta inglés y chino, no confirmado para este fine-tune) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen2.5-Math-1.5B`, una arquitectura Transformer estándar con 1.5B parámetros y atención completa. El entrenamiento se realiza con **GRPO**, método de optimización de política relativa por grupos propuesto por DeepSeek, que evita la necesidad de un crítico entrenado y usa las ventajas relativas dentro de cada grupo de rollouts. Sobre la pérdida de política se añade un término de **bonus de entropía** `-entropy_coeff * H` con `entropy_coeff=1e-3`, aplicado únicamente a los tokens de respuesta. El autor señala que valores superiores (1e-2) colapsan la política (la entropía alcanza el 94% de ln|V|).

El dataset es **ScienceQA** (versión `scienceqa_boxfix`), con 25 épocas y 1250 pasos. Cada paso usa 128 prompts con K=6 rollouts, una tasa de aprendizaje constante de 1e-6, KL de 0.01 (incluida en la recompensa) y un premio de formato de 0.03 constante. El entrenamiento se ejecutó con `verl` y `RLHFDataset` con `apply_chat_template=False`, por lo que el modelo espera texto plano como entrada.

## Capacidades

- **Razonamiento matemático y científico**: resuelve preguntas de opción múltiple del dataset ScienceQA, generando respuestas con razonamiento explícito.
- **Formato de respuesta estructurado**: produce respuestas con `\boxed{}` para extraer la opción final (A-E). Si no hay `\boxed{}`, se toma el último token A-E.
- **Generación de múltiples respuestas**: el entrenamiento con K=6 permite muestreo con temperatura 1.0 para obtener varias respuestas y seleccionar la mejor (pass@6).
- **No soporta tool calling**, ni visión, ni audio, ni modo agente. Es un modelo de texto puro, especializado en una tarea concreta.
- **Multilingüe**: no se ha verificado; probablemente hereda el soporte de Qwen2.5-Math (inglés y chino), pero no está documentado en la model card.

## Casos de uso

- **Evaluación de algoritmos de RL**: el modelo sirve como baseline para comparar variantes de GRPO (por ejemplo, con diferentes coeficientes de entropía) en un entorno controlado y reproducible.
- **Investigación en optimización de política**: permite estudiar el efecto del bonus de entropía en la estabilidad del entrenamiento y la calidad de las respuestas, tal como se documenta en el repositorio.
- **Sistema de respuesta a preguntas de ciencia**: puede integrarse en una aplicación educativa que presente preguntas de opción múltiple sobre ciencias, generando explicaciones y la respuesta correcta.
- **Generación de explicaciones para estudiantes**: aunque el modelo no está optimizado para diálogo, puede generar pasos de razonamiento en formato de texto plano para complementar materiales didácticos.
- **Investigación en extracción de respuestas**: el método de extracción de `\boxed{}` puede servir como referencia para evaluar técnicas de parsing de respuestas en modelos de razonamiento.
- **Pruebas de infraestructura**: al ser un modelo pequeño (1.5B), es útil para probar pipelines de RL (verl, vLLM) en entornos con recursos limitados, antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El autor publica métricas de validación en el paso 1200, con 256 prompts held-out y K=6 rollouts, temperatura 1.0 y semilla 42:

| Metric | Valor |
|---|---|
| pass@1 | 0.8613 |
| pass@6 | 0.9414 |
| paso | 1200 |

No se han publicado resultados comparativos con otros modelos en la información disponible. El `pass@1` es la precisión de respuesta de opción múltiple (ScienceQA), calculada mediante extracción de `\boxed{}` o última token A-E; las respuestas sin extracción se consideran incorrectas.

## Requisitos de hardware

- **VRAM estimada**: en `bfloat16`, el modelo ocupa ~3.6 GB (1.777M × 2 bytes). Con cuantización de 4 bits (no disponible en la model card, pero posible con herramientas como llama.cpp) se reduciría a ~1 GB.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM para inferencia en bfloat16, por ejemplo NVIDIA RTX 3060, 4060, 4090, o GPUs de datacenter como A10, A100. Para entrenamiento RL, se necesita al menos 8 GB para el batch de 128 prompts con K=6.
- **Cabe en GPU de consumo**: sí, en la mayoría de GPUs modernas con 6 GB o más.
- **Opciones de despliegue**: se puede servir con `vLLM` (como sugiere el autor), `llama.cpp` (convirtiendo a GGUF), `Ollama` (si se genera un GGUF) o `TGI`. El autor recomienda `max_model_len=1536` para evitar desbordamiento del contexto.
- **Latencia y throughput**: no se han publicado datos. Para un modelo de 1.5B en una GPU moderna, se espera una generación de ~20-40 tokens/s en `bfloat16`, dependiendo del hardware.

## Comparativa con modelos similares

No se han publicado comparativas formales con otros modelos en la información disponible. El modelo se puede comparar conceptualmente con:

- **Qwen2.5-Math-1.5B (base)**: el modelo original sin RL, que no está especializado en ScienceQA y no incluye el bonus de entropía.
- **DeepSeek-R1-Distill-Qwen-1.5B**: otro modelo pequeño de razonamiento matemático, pero entrenado con destilación de R1, no con GRPO.
- **Otros fine-tunes de GRPO**: existen varios repositorios con el mismo esquema (por ejemplo, `sqa-grpo-*` del mismo autor), pero no se han publicado resultados comparativos.

No se dispone de datos numéricos de rendimiento para estos modelos en ScienceQA.

## Limitaciones y advertencias

- **No aplicar chat template**: el modelo fue entrenado con texto sin procesar; usar el chat template de Qwen2.5-Math degrada el rendimiento en ~19 puntos de `pass@1`. Es imprescindible usar `llm.generate()` con texto plano.
- **Alcance limitado**: solo está entrenado para preguntas de ScienceQA de opción múltiple. No generaliza a otras tareas de razonamiento o generación libre.
- **Riesgo de alucinación**: como todo modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos. La extracción de respuestas mediante `\boxed{}` reduce el error de formato, pero no garantiza la corrección del contenido.
- **Inestabilidad con coeficientes de entropía altos**: el autor documenta que `entropy_coeff=1e-2` colapsa la política; usar este valor en otros modelos no es recomendable sin ajustes.
- **Respuestas sin `\boxed{}` se puntúan como incorrectas**: esto puede penalizar respuestas válidas que no siguen el formato esperado.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo base Qwen2.5-Math tiene su propia licencia (Apache-2.0 también, aunque Qwen2.5-Math está bajo Apache-2.0, verificar para uso comercial).
- **Sesgos**: no se han evaluado sesgos en este modelo; el dataset ScienceQA puede contener sesgos de género, cultura o contexto.

## Enlaces

- HuggingFace: [sandeep123/sqa-grpo-entropy-step1200](https://huggingface.co/sandeep123/sqa-)
- Perfil del autor: [sandeep123 (Kumar)](https://huggingface.co/sandeep123)
- Referencia de GRPO: [RL Ch5 GRPO - Reinforcement Learning Crashcourse](https://finger-bone.github.io/rl-crashcourse/05/)
- Trabajo relacionado sobre entropía en GRPO: [E-GRPO - CVPR 2026](https://openaccess.thecvf.com/content/CVPR2026F/html/Zhang_E-GRPO_High_Entropy_Steps_Drive_Effective_Reinforcement_Learning_for_Flow_CVPRF_2026_paper.html)
