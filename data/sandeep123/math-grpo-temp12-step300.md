# sandeep123/math-grpo-temp12-step300

## Resumen

`sandeep123/math-grpo-temp12-step300` es un modelo de razonamiento matemático desarrollado por Kumar (usuario `sandeep123`) como parte de un estudio de líneas base (baseline) para entrenamiento con refuerzo. Se trata de un fine-tuning del modelo `Qwen/Qwen2.5-Math-1.5B` mediante el algoritmo GRPO (Group Relative Policy Optimization) implementado con el framework verl, utilizando el dataset ScienceQA. El modelo está diseñado para resolver preguntas de opción múltiple de ciencia, extrayendo la respuesta en formato `\boxed{}` o como una letra A-E.

La relevancia de este modelo radica en que documenta de forma explícita un experimento controlado sobre el efecto de la temperatura de rollout (1.2) en el entrenamiento con GRPO, y publica tanto el checkpoint óptimo para pass@1 como para pass@6, lo que permite analizar la relación entre calidad y diversidad en la generación. Con 1.777 millones de parámetros y una licencia Apache 2.0, es un modelo ligero y reproducible, pensado para investigación en métodos de refuerzo y evaluación de razonamiento.

El checkpoint seleccionado (step 300) es el mejor en validación pass@6 (0.9492) para su rama experimental, aunque el mejor pass@1 se encuentra en pasos posteriores (1000-1200). El modelo se distribuye en formato safetensors y no requiere plantilla de chat, ya que fue entrenado con texto plano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Qwen2.5-Math-1.5B) |
| Parametros totales | 1.777.088.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 1536 tokens (max_model_len usado en inferencia; el entrenamiento usa 512 prompt + 1024 response) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles y chino por el modelo base, pero no se especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-Math-1.5B, un transformer decoder-only con atención causal estándar, diseñado específicamente para razonamiento matemático. No se han publicado detalles adicionales sobre capas, dimensiones o mecanismos de atención más allá de los del modelo base.

El entrenamiento se realizó con GRPO sobre el dataset ScienceQA (versión `scienceqa_boxfix`), con 25 épocas y 1250 pasos, un batch de 128 prompts y 6 rollouts por prompt (K=6). Se usó una tasa de aprendizaje constante de 1e-6, un coeficiente KL de 0.01 incluido en la recompensa, y una recompensa de formato de 0.03 constante. La temperatura de rollout fue 1.2, aunque la validación se realizó a temperatura 1.0 para mantener comparabilidad con otras ramas. No se aplicó plantilla de chat durante el entrenamiento (raw prompt text), y se advierte que aplicarla en inferencia produce una degradación de aproximadamente 19 puntos de pass@1.

## Capacidades

- Razonamiento matemático y científico: resuelve preguntas de opción múltiple del dataset ScienceQA, que abarca temas de ciencias naturales y físicas.
- Extracción de respuestas estructuradas: genera respuestas con el contenido final en `\boxed{}` o, en su defecto, un token A-E independiente.
- Generación de texto plano: no requiere plantilla de chat, acepta prompts crudos directamente.
- Soporte de muestreo múltiple: diseñado para generar K=6 rollouts por prompt, lo que permite calcular pass@k.
- No soporta tool calling, agentes, visión ni audio (no se mencionan en la documentación).

## Casos de uso

- Evaluación de algoritmos de refuerzo: sirve como baseline reproducible para comparar variantes de GRPO (temperatura, coeficientes KL, recompensas) en tareas de razonamiento.
- Investigación en decodificación y diversidad: al publicar checkpoints óptimos para pass@1 y pass@6, permite estudiar el equilibrio entre precisión y variedad de respuestas.
- Generación de respuestas en exámenes de ciencias: puede integrarse en sistemas de tutoría automática que presenten preguntas de opción múltiple y requieran una letra como respuesta.
- Análisis de extracción de respuestas: su protocolo pre-registrado (contenido de `\boxed{}` o último token A-E) es útil para investigar métodos de parsing de salidas estructuradas.
- Benchmark de modelos pequeños: con 1.78B parámetros, sirve como referencia para comparar el rendimiento de modelos de tamaño similar en tareas de razonamiento científico.
- Estudio de transferencia de temperatura: al entrenar a temperatura 1.2 y validar a 1.0, permite analizar el impacto de la temperatura de muestreo en el entrenamiento por refuerzo.

## Benchmarks y rendimiento

Los únicos datos publicados son los de validación en ScienceQA, con 256 prompts held-out, K=6, temperatura 1.0 y seed 42:

| Metrica | Valor |
|---|---|
| pass@1 | 0.7227 |
| pass@6 | 0.9492 |
| step | 300 |

No se han publicado resultados comparativos con otros modelos en la informacion disponible. El autor indica que el mejor checkpoint para pass@1 se encuentra en pasos 1000-1200, mientras que el mejor para pass@6 está en pasos 200-500.

## Requisitos de hardware

- VRAM estimada para inferencia: con 1.78B parámetros en bfloat16, el modelo ocupa aproximadamente 3.5 GB de memoria, por lo que cabe en GPUs consumer con 6 GB o más (por ejemplo, RTX 2060, RTX 3060, RTX 4060).
- En cuantización int8 o int4 (si se generara), el consumo sería menor, pero no se proporcionan archivos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM, como RTX 3060, RTX 4070, o GPUs de datacenter como A10G o T4.
- Opciones de despliegue: vLLM (como se muestra en el ejemplo de la model card), llama.cpp, Ollama, TGI, o directamente con transformers.
- Latencia y throughput: no disponible; depende del hardware y del backend. Con vLLM en una GPU moderna, se espera una generación de decenas de tokens por segundo para un modelo de este tamaño.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos en la informacion proporcionada. El modelo es un fine-tuning de Qwen2.5-Math-1.5B, por lo que una comparación natural sería contra el modelo base, pero no se publican métricas de este último en la model card. Tampoco se mencionan alternativas como Llama-3.2-1B o Gemma-2-2B en el contexto de esta tarea. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- No aplicar plantilla de chat: el modelo fue entrenado con texto plano; usar `llm.chat()` o el template de Qwen2.5-Math degrada el rendimiento en aproximadamente 19 puntos de pass@1.
- Sesgos del dataset: entrenado exclusivamente en ScienceQA, por lo que su rendimiento fuera de ese dominio (por ejemplo, matemáticas puras o código) no está garantizado.
- Riesgo de alucinación: al ser un modelo de 1.5B, puede generar respuestas plausibles pero incorrectas, especialmente en problemas complejos o con múltiples pasos.
- Limitaciones de contexto: la ventana efectiva es de 1536 tokens (512 de prompt + 1024 de respuesta), insuficiente para tareas de contexto largo.
- Extracción de respuestas estricta: si no hay `\boxed{}` ni un token A-E final, la respuesta se considera incorrecta, lo que penaliza respuestas válidas pero mal formateadas.
- Uso comercial: la licencia Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigación y no se garantiza su robustez en producción.
- Sin soporte de idiomas explícito: aunque el modelo base soporta inglés y chino, no se especifica el rendimiento multilingüe de este fine-tuning.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sandeep123/math-grpo-temp12-step300
- Perfil del autor: https://huggingface.co/sandeep123
- Repositorio GitHub del autor: https://github.com/Sandeep123-lab-ai
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Math-1.5B
