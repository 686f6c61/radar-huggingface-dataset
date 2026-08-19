# laion/tt-x5_gradnorm-gn0p45-30-30B

## Resumen

El modelo `laion/tt-x5_gradnorm-gn0p45-30-30B` es un checkpoint intermedio de un experimento de aprendizaje por refuerzo (GRPO) realizado por LAION sobre el modelo base `Qwen/Qwen3-Coder-30B-A3B-Instruct`. Forma parte del barrido "TaskTrove X5" que explora diferentes valores de clipping de gradiente (en este caso, 0.45) para optimizar el entrenamiento de agentes de código con verificación de recompensa basada en pass ratio. El entrenamiento se ejecutó con SkyRL y el framework Terminus-2, sobre el dataset `DCAgent/exp_rpt_multifile`, y el checkpoint seleccionado corresponde al paso 30, elegido por su mayor EMA de recompensa (0.1972) dentro de la cadena de reinicios.

Este modelo no es un modelo generalista nuevo, sino un ajuste fino de refuerzo sobre un modelo de código ya existente. Su relevancia radica en que documenta un punto intermedio de un experimento metodológico sobre estabilidad del entrenamiento RL, útil para investigadores que estudian el efecto del clipping de gradiente en la convergencia y la calidad de los agentes de código. El entrenamiento se detuvo antes del horizonte previsto (paso 68 de 80) debido a una entropía elevada, por lo que este checkpoint no representa un resultado final sino una instantánea de un proceso en curso.

Arquitectónicamente hereda la estructura MoE del modelo base (30.532 millones de parámetros totales, con aproximadamente 3.000 millones activos), con una ventana de contexto que no se especifica en la documentación proporcionada. Los pesos se distribuyen en formato safetensors y el repositorio ocupa 61.1 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3-Coder-30B-A3B-Instruct |
| Parametros totales | 30.532.122.624 |
| Parametros activos | 3.000 millones (según nomenclatura del modelo base, no confirmado en la ficha) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | no disponible (heredados del modelo base, no especificados) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint de aprendizaje por refuerzo (GRPO) aplicado sobre `Qwen/Qwen3-Coder-30B-A3B-Instruct`, un modelo de lenguaje de arquitectura Mixture of Experts (MoE) con 30.000 millones de parámetros totales y 3.000 millones activos por token. La arquitectura subyacente es la del modelo base de Qwen3, que combina atención con mecanismos de ventana deslizante y full attention en capas alternas, aunque los detalles específicos no se documentan en la ficha del checkpoint.

El entrenamiento se realizó con el framework SkyRL y la librería Terminus-2, utilizando el dataset `DCAgent/exp_rpt_multifile` que contiene tareas de generación de código con múltiples archivos. La recompensa se calculó mediante un verificador de campaña basado en pass ratio shaping, que mide la fracción de pruebas superadas. El experimento forma parte del barrido "TaskTrove X5" que investiga el efecto del clipping de gradiente (grad norm) en la estabilidad del entrenamiento. En este caso, el valor de grad norm fue 0.45, y el checkpoint del paso 30 fue seleccionado como el mejor según la EMA de recompensa (trailing-5, alpha=1/3), con un valor de EMA de 0.1972, recompensa de paso 0.2188, pass@8 de 0.4219 y entropía de 0.257.

La ejecución se detuvo en el paso 68 de 80 porque la entropía se elevó a 0.69 (aproximadamente 5.6 veces la del paso 1), superando el umbral de parada definido (10x). Esto indica que el entrenamiento mostraba signos de inestabilidad hacia el final, y el checkpoint del paso 30 es el mejor guardado, pero no un resultado de convergencia final.

## Capacidades

- Generación de texto y código: al estar basado en Qwen3-Coder-30B-A3B-Instruct, hereda las capacidades de generación de código, razonamiento y comprensión de lenguaje del modelo base, aunque el entrenamiento RL se centró en tareas específicas de edición de múltiples archivos.
- Razonamiento y resolución de problemas: el entrenamiento con GRPO y verificación de pass ratio refuerza la capacidad de generar soluciones correctas en entornos de código, pero no hay evidencia de mejoras en razonamiento general.
- Soporte de tool calling y function calling: no se documenta explícitamente, pero el modelo base Qwen3-Coder soporta estas funcionalidades; sin embargo, el checkpoint no incluye información al respecto.
- Capacidades multilingües: no disponibles en la documentación; se asume que hereda las del modelo base, pero no se confirma.
- Modo thinking: el modelo base Qwen3-Coder incluye modos de razonamiento (thinking/non-thinking), pero no se menciona si este checkpoint los conserva o modifica.
- Capacidades especiales: ninguna adicional documentada.

## Casos de uso

- Investigación en RL para agentes de código: este checkpoint es útil para estudiar el impacto del clipping de gradiente en la estabilidad del entrenamiento GRPO. Los investigadores pueden comparar este checkpoint con otros del mismo barrido (gn0p9, gn1p8) para analizar curvas de recompensa, entropía y pass@8.
- Reproducción de experimentos de RL: al publicar los logs de entrenamiento (metrics.csv, reward_plot.png, rl_config.json), el modelo sirve como referencia para reproducir o extender experimentos con SkyRL y Terminus-2.
- Fine-tuning posterior: dado que es un checkpoint intermedio, puede usarse como punto de partida para continuar entrenamiento con otros hiperparámetros o datasets, aprovechando el conocimiento adquirido en la tarea de edición multifile.
- Evaluación de agentes de código en entornos controlados: aunque no es un modelo final, puede emplearse en entornos de evaluación para medir la capacidad de generación de código con verificación de pruebas, siempre teniendo en cuenta su naturaleza intermedia.
- Benchmarking de metodologías de verificación: el uso de pass ratio shaping como recompensa puede analizarse comparando este checkpoint con otros entrenados con diferentes funciones de recompensa.
- Estudio de dinámicas de entropía en RL: la elevación de entropía observada (de 0.12 a 0.69) ofrece material para investigar la relación entre clipping de gradiente y la exploración/explotación en modelos MoE.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta métricas de entrenamiento:

| Metrica | Valor (step 30) |
|---|---|
| EMA de recompensa (trailing-5) | 0.1972 |
| Recompensa de paso | 0.2188 |
| Pass@8 | 0.4219 |
| Entropía | 0.257 |

Estos valores corresponden al proceso de entrenamiento y no a evaluaciones externas. No se dispone de comparaciones con otros modelos en tareas estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 30.532 millones de parámetros. En precisión fp16, se necesitan aproximadamente 61 GB de VRAM (2 bytes por parámetro). Con cuantización a 4 bits, se reduciría a unos 15 GB, y a 8 bits a unos 30 GB. No se proporcionan cifras oficiales.
- GPU recomendadas: para inferencia en fp16 se requiere una GPU con al menos 64 GB de VRAM (por ejemplo, A100 80GB, H100 80GB). Con cuantización 4-bit, cabría en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB), aunque la velocidad sería limitada.
- Compatibilidad con GPUs de consumo: sí, si se usa cuantización (por ejemplo, GGUF o AWQ), aunque no se ofrecen archivos cuantizados en el repositorio. El usuario debería cuantizarlos manualmente.
- Opciones de despliegue: al ser un modelo de Transformers, se puede servir con vLLM, TGI, llama.cpp (tras conversión a GGUF) u Ollama (si se convierte). También es compatible con el pipeline estándar de Hugging Face Transformers.
- Latencia y throughput: no disponibles. Al ser un MoE con solo 3B parámetros activos, la latencia por token es menor que la de un modelo denso de 30B, pero depende del hardware y la implementación.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa cuantitativa con otros modelos. Sin embargo, se puede comparar cualitativamente con el modelo base y con otros checkpoints del mismo barrido:

| Modelo | Parametros | Contexto | Entrenamiento | Licencia |
|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct (base) | 30B totales, 3B activos | 256k (según documentación oficial de Qwen) | Instruct, RLHF | Apache 2.0 |
| laion/tt-x5_gradnorm-gn0p45-30-30B (este) | 30.532M totales | no disponible | GRPO sobre tarea específica | Apache 2.0 |
| laion/tt-x5_gradnorm-gn0p9 (otro checkpoint del barrido) | similar | no disponible | GRPO con grad norm 0.9 | Apache 2.0 |

No se conocen otros modelos comparables de la misma categoría (checkpoints intermedios de RL sobre Qwen3-Coder) fuera de este barrido.

## Limitaciones y advertencias

- Checkpoint intermedio: no es un modelo final. El entrenamiento se detuvo antes del horizonte (paso 68/80) debido a entropía elevada, lo que puede implicar inestabilidad o falta de convergencia. El paso 30 fue seleccionado por EMA, pero no garantiza un rendimiento óptimo.
- Sesgos y alucinaciones: al ser un modelo de código entrenado con RL, puede presentar alucinaciones en la generación de código, especialmente si la recompensa no cubre todos los casos. No se han evaluado sesgos específicos.
- Limitaciones de idioma: no se documentan los idiomas soportados. Se asume que hereda los del modelo base (principalmente inglés y chino), pero no hay confirmación.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base Qwen3-Coder también es Apache 2.0, por lo que no hay restricciones adicionales. Sin embargo, el dataset de entrenamiento `DCAgent/exp_rpt_multifile` puede tener sus propias condiciones.
- Producción: no se recomienda su uso en producción sin una evaluación exhaustiva, dado su carácter experimental y la falta de benchmarks estándar.
- Reproducibilidad: los logs de entrenamiento están disponibles, pero el dataset de entrenamiento no se enlaza directamente en la model card (solo se menciona el dataset de trazas `penfever/tt-x5_gradnorm-gn0p45`). Esto puede dificultar la reproducción exacta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/laion/tt-x5_gradnorm-gn0p45-30-30B
- Dataset de trazas de entrenamiento: https://huggingface.co/datasets/penfever/tt-x5_gradnorm-gn0p45
- Otros checkpoints del barrido: https://huggingface.co/laion/tt-x5_gradnorm-gn0p9 y https://huggingface.co/laion/tt-x5_gradnorm-gn1p8
- Organización LAION: https://laion.ai/ y https://github.com/LAION-AI
