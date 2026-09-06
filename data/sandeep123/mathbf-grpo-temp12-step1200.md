# sandeep123/mathbf-grpo-temp12-step1200

## Resumen

El modelo `sandeep123/mathbf-grpo-temp12-step1200` es un fine-tuning de `Qwen/Qwen2.5-Math-1.5B` realizado con GRPO (Group Relative Policy Optimization) sobre el conjunto de datos ScienceQA. Ha sido desarrollado por el usuario `sandeep123` como parte de una suite de experimentos de RL para razonamiento científico, y este checkpoint concreto fue seleccionado como el mejor en validación para `pass@6` dentro de su rama experimental (rank 2). El objetivo del trabajo es explorar cómo afecta la temperatura de rollout (1.2) al rendimiento en tareas de razonamiento de opción múltiple.

El modelo se entrenó bajo el protocolo "boxfix", que exige que la respuesta siga una estructura de razonamiento numerado (Step 1..n) y termine con `\boxed{X}` en una línea independiente. La arquitectura es un transformer decoder-only de 1.777 millones de parámetros, heredado de Qwen2.5-Math-1.5B, con una ventana de contexto efectiva limitada a 1536 tokens en inferencia según el ejemplo de vLLM proporcionado. La relevancia del modelo radica en ser un caso de estudio de RL con GRPO en modelos pequeños, con métricas de validación publicadas y una advertencia clara sobre el uso del chat template.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entrenado con max prompt 512 + max response 1024; en vLLM se usa max_model_len=1536) |
| Tipos de cuantizacion | no disponible (los pesos publicados estan en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen2.5-Math-1.5B`, un transformer decoder-only de 1.5B parametros. El entrenamiento se realizo con GRPO sobre el dataset ScienceQA (con la configuracion `scienceqa_boxfix`). El protocolo de entrenamiento incluye un formato de respuesta estricto: razonamiento numerado en pasos (Step 1..n) seguido de `\boxed{X}` en una linea propia y sin nada despues. El sistema de recompensa otorga 0.03 de recompensa por formato, constante y sin decaimiento. Se usaron 25 epochs (1250 steps), batch de 128 prompts con K=6 rollouts por prompt, learning rate 1e-6 constante, KL 0.01 y seed 42. La temperatura de rollout fue 1.2, aunque la validacion se realizo a temperatura 1.0. La model card indica que no se debe aplicar chat template en inferencia, ya que el modelo fue entrenado con texto de prompt crudo y aplicar el template de Qwen2.5-Math produce una perdida de alrededor de 19 puntos de pass@1 en una tarea hermana.

## Capacidades

- Razonamiento cientifico y matematico en formato de opcion multiple, con respuestas estructuradas en pasos numerados y resultado final en `\boxed{}`.
- Generacion de texto de razonamiento siguiendo un formato estricto (Step 1..n + `\boxed{X}`).
- Soporte de decodificacion con multiples muestras (pass@6) para mejorar la precision en tareas de opcion multiple.
- No se ha documentado soporte de tool calling, function calling, vision ni audio.
- Capacidades multilingues no disponibles en la informacion proporcionada.
- El modelo esta pensado para ser usado con texto de prompt crudo, sin chat template.

## Casos de uso

- Evaluacion de razonamiento cientifico en entornos educativos: el modelo puede responder preguntas de opcion multiple de ScienceQA, generando un razonamiento paso a paso que facilita la verificacion de la respuesta. Su tamano de 1.5B permite ejecutarlo en hardware modesto.
- Investigacion en RL y alineacion: sirve como checkpoint de referencia para comparar estrategias de GRPO, temperaturas de rollout o protocolos de recompensa. Las metricas de validacion publicadas (pass@1 y pass@6) permiten replicar o extender experimentos.
- Generacion de razonamiento explicable en dominios cientificos: el formato `\boxed{}` y los pasos numerados facilitan la extraccion automatica de la respuesta final, lo que es util en pipelines de evaluacion automatizada.
- Prototipado de agentes de razonamiento matematico: puede integrarse como modulo de razonamiento en sistemas que requieren respuestas con estructura verificable, siempre que se respete la restriccion de no aplicar chat template.
- Uso en entornos con restricciones de recursos: al ser un modelo de 1.5B, es adecuado para despliegue en CPU o GPUs de gama baja, especialmente si se cuantiza.
- Benchmarking de metodos de RL: el checkpoint esta publicado junto a otros pasos del mismo experimento (por ejemplo, `math-grpo-temp12-step200`), lo que permite comparar la evolucion del rendimiento a lo largo del entrenamiento.

## Benchmarks y rendimiento

Segun la model card, las metricas de validacion en este checkpoint (step 1200) sobre ScienceQA son las siguientes. La validacion se realizo con 256 prompts held-out, K=6, temperatura 1.0 y seed 42, con extraccion de respuesta pre-registrada: el contenido del ultimo `\boxed{}`, o el ultimo token A-E independiente si no hay caja; las respuestas sin respuesta extraible se puntuan como incorrectas.

| Metrica | Valor |
|---|---|
| pass@1 | 0.7780 |
| pass@6 | 0.9570 |
| step | 1200 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 de 1.777M parametros ocupan aproximadamente 3.5 GB. Con KV cache para 1536 tokens de contexto, se recomienda al menos 5-6 GB de VRAM para inferencia sin cuantizacion.
- GPU recomendadas: RTX 3060/4060 (12/8 GB), RTX 4090, A100, H100. Tambien puede ejecutarse en CPU con suficiente RAM.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM. Con cuantizacion 4-bit, podria caber en 4 GB.
- Opciones de despliegue: vLLM (ejemplo proporcionado por el autor), llama.cpp, Ollama, o cualquier framework que soporte safetensors y el modelo base Qwen2.5.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sandeep123/mathbf-grpo-temp12-step1200 | 1.777M | 1536 (efectivo en inferencia) | Apache-2.0 | Fine-tuning GRPO sobre ScienceQA, pass@1 0.778 |
| Qwen/Qwen2.5-Math-1.5B | 1.5B | 32k (base) | Apache-2.0 | Modelo base sin RL, no entrenado para el protocolo boxfix |
| sandeep123/math-grpo-temp12-step200 | 1.777M | no disponible | Apache-2.0 | Checkpoint anterior del mismo experimento, pass@1 0.7721, pass@6 0.9414 |

No se dispone de datos de benchmarks comparativos publicados para estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- No se debe aplicar chat template en inferencia. El modelo fue entrenado con texto de prompt crudo; aplicar el template de Qwen2.5-Math reduce el rendimiento en aproximadamente 19 puntos de pass@1 en una tarea hermana.
- La longitud de contexto efectiva esta limitada por el entrenamiento: max prompt 512 tokens y max response 1024 tokens. En vLLM se recomienda max_model_len=1536.
- El modelo solo ha sido validado en ScienceQA, una tarea de opcion multiple. No hay evidencia de generalizacion a otros dominios o formatos de pregunta.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar razonamientos incorrectos o respuestas sin sentido, especialmente fuera de la distribucion de entrenamiento.
- No se han documentado sesgos especificos, pero el modelo hereda los sesgos del modelo base Qwen2.5-Math-1.5B y del dataset ScienceQA.
- La licencia Apache-2.0 permite uso comercial, pero el autor no proporciona garantias de rendimiento ni soporte.
- El modelo no soporta tool calling, vision ni audio; su capacidad se limita a texto.

## Enlaces

- https://huggingface.co/sandeep123/mathbf-grpo-temp12-step1200
- https://huggingface.co/sandeep123/math-grpo-temp12-step200 (checkpoint hermano del mismo experimento)
- https://huggingface.co/sandeep123/math-grpo-temp12-step200/tree/main (archivos del checkpoint hermano)
