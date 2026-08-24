# sandeep123/sqa-grpo-temp12-step700

## Resumen

`sandeep123/sqa-grpo-temp12-step700` es un modelo de razonamiento matemático desarrollado por el usuario sandeep123 como parte de un estudio de líneas base para el entrenamiento con GRPO (Group Relative Policy Optimization) sobre el conjunto de datos ScienceQA. Se trata de un fine-tuning del modelo base `Qwen/Qwen2.5-Math-1.5B`, con 1.777 millones de parámetros, entrenado específicamente para responder preguntas de opción múltiple de ciencia con razonamiento explícito. El checkpoint corresponde al paso 700 de 1250, seleccionado por su mejor rendimiento en validación con pass@6 (0.9648), aunque el pass@1 es de 0.8145.

La relevancia de este modelo radica en que documenta un experimento controlado de RL: se entrena con temperatura de rollout 1.2 pero se valida a temperatura 1.0, manteniendo comparabilidad con otros brazos del estudio. Además, la model card advierte explícitamente que no se debe aplicar plantilla de chat, ya que el entrenamiento se realizó sobre texto crudo, y hacerlo introduce una discrepancia de aproximadamente 19 puntos de pass@1 en tareas similares. Es un modelo de investigación, no un producto listo para producción, pero sirve como referencia para estudiar el efecto de la temperatura de muestreo en el entrenamiento por refuerzo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 (1,78B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 1536 tokens (configuracion de inferencia recomendada: max prompt 512 + max response 1024) |
| Tipos de cuantizacion | bf16 (formato safetensors) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Math-1.5B`, un transformer decoder-only de 1.500 millones de parámetros (el checkpoint final tiene 1.777 millones, probablemente por embeddings o cabezas adicionales). Se entrena con GRPO, un algoritmo de optimización de política proximal adaptado a refuerzo con grupos, implementado en el framework verl. El dataset es ScienceQA en su versión `scienceqa_boxfix`, con 128 prompts por batch y 6 rollouts por prompt (K=6). Se usan 25 épocas equivalentes a 1250 pasos, con learning rate constante de 1e-6, coeficiente KL de 0.01 y una recompensa de formato fija de 0.03. La temperatura de rollout es 1.2, pero la validación se realiza a temperatura 1.0 con semilla 42 para mantener comparabilidad entre brazos.

Una innovación metodológica destacable es la decisión de no aplicar plantilla de chat: el modelo se entrena con texto crudo (raw prompt text) y así debe usarse en inferencia. La model card documenta que aplicar la plantilla de chat de Qwen2.5-Math produce una caída de aproximadamente 19 puntos en pass@1 en una tarea hermana, lo que subraya la sensibilidad del modelo al formato de entrada. Además, se publican dos checkpoints por brazo (uno optimizado para pass@1 y otro para pass@6) para evitar sesgos en la selección de resultados.

## Capacidades

- Razonamiento matemático y científico: responde preguntas de opción múltiple de ScienceQA con justificación explícita, extrayendo la respuesta final en formato `\boxed{}`.
- Generación de texto con razonamiento multi-paso: produce cadenas de pensamiento antes de dar la respuesta final.
- Soporte de muestreo múltiple: diseñado para funcionar con K rollouts (pass@6), aunque también se evalúa con pass@1.
- No soporta tool calling, ni visión, ni audio: es un modelo puramente textual de razonamiento.
- Capacidades multilingües: no documentadas; el entrenamiento se centra en ScienceQA, que es predominantemente inglés.
- Sin modo "thinking" explícito: el razonamiento se genera como texto normal, no como un modo separado.

## Casos de uso

- Investigación en métodos de RL: sirve como línea base para estudiar el efecto de la temperatura de muestreo en el entrenamiento GRPO, comparando con otros brazos del mismo estudio.
- Evaluación de estrategias de decodificación: al ser un checkpoint intermedio (paso 700), permite analizar la evolución del rendimiento durante el entrenamiento y la relación entre pass@1 y pass@6.
- Prototipado de agentes de razonamiento científico: puede integrarse en pipelines de preguntas-respuesta de opción múltiple donde se requiera una explicación previa a la respuesta, aunque su dominio está limitado a ScienceQA.
- Benchmark de razonamiento en modelos pequeños: con 1,78B parámetros, es útil para comparar técnicas de RL en entornos con recursos limitados.
- Estudio de robustez al formato de entrada: la advertencia sobre la plantilla de chat lo convierte en un caso de estudio para investigar la sensibilidad de los modelos entrenados con RL al preprocesado.
- Reproducibilidad experimental: al publicarse con configuración detallada (semilla, hiperparámetros, criterios de selección), permite replicar y extender los resultados en otros conjuntos de datos.

## Benchmarks y rendimiento

La model card reporta métricas de validación sobre 256 prompts retenidos, con K=6, temperatura 1.0 y semilla 42. No se proporcionan comparaciones con otros modelos en la información disponible.

| Metrica | Valor |
|---|---|
| pass@1 | 0.8145 |
| pass@6 | 0.9648 |
| Paso de entrenamiento | 700 |

No se han publicado resultados de benchmarks externos (MMLU, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, el modelo ocupa aproximadamente 3,5 GB (1,78B × 2 bytes). Con overhead de activaciones y KV cache, se recomienda al menos 6 GB de VRAM para una sesión de inferencia con contexto de 1536 tokens.
- GPU recomendadas: cualquier GPU con 8 GB o más de VRAM, como RTX 3060, RTX 4060, RTX 4090, o GPUs de datacenter como A10, A100. En cuantización de 4 bits (no documentada oficialmente, pero posible con herramientas como llama.cpp), cabría en GPUs de 4 GB.
- Si cabe en consumer GPU: sí, en GPUs de gama media y alta con 8 GB o más.
- Opciones de despliegue: vLLM (como se muestra en el ejemplo de la model card), llama.cpp, Ollama (si se convierte a GGUF), Hugging Face Transformers con carga en bf16.
- Latencia y throughput: no disponibles; al ser un modelo de 1,78B, en una RTX 4090 se espera una generación de 1024 tokens en unos pocos segundos, pero no hay datos medidos.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos con otros modelos en la informacion proporcionada. Estructuralmente, se puede comparar con:

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen2.5-Math-1.5B (base) | 1,5B | 32K (original) | Apache-2.0 | Modelo base sin fine-tuning RL |
| sandeep123/sqa-grpo-temp12-step700 | 1,78B | 1536 (configurado) | Apache-2.0 | Fine-tuning GRPO sobre ScienceQA |
| Otros fine-tunings de Qwen2.5-Math | no disponible | no disponible | no disponible | No hay datos en la informacion |

La comparativa se limita a aspectos estructurales; no hay benchmarks compartidos.

## Limitaciones y advertencias

- Sesgos conocidos: al entrenarse exclusivamente sobre ScienceQA, el modelo puede tener un rendimiento pobre fuera de ese dominio y reflejar los sesgos del dataset original.
- Riesgo de alucinacion: como todo modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos; la extracción de respuestas se basa en `\boxed{}` y respuestas sin ella se puntúan como incorrectas.
- Limitaciones de contexto: la configuración recomendada es de 1536 tokens (512 de prompt + 1024 de respuesta); superar ese límite puede degradar el rendimiento.
- Limitaciones de idioma: no se documentan idiomas soportados; el entrenamiento es en inglés (ScienceQA).
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero al ser un modelo de investigación, no se garantiza su idoneidad para producción.
- Caveat crítico: no aplicar plantilla de chat en inferencia; hacerlo reduce el pass@1 en aproximadamente 19 puntos en tareas similares.
- El checkpoint está seleccionado por pass@6, no por pass@1; para aplicaciones que requieran una sola respuesta, puede ser preferible el checkpoint de pass@1 (paso 1000-1200), que no se publica en este repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sandeep123/sqa-grpo-temp12-step700
- Perfil del autor en Hugging Face: https://huggingface.co/sandeep123
- Perfil del autor en GitHub: https://github.com/sandeep123 (no se confirma que sea el mismo autor)
