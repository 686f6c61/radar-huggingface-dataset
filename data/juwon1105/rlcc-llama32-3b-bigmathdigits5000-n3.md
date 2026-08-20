# juwon1105/RLCC-llama32-3B-bigmathdigits5000-n3

## Resumen

RLCC-llama32-3B-bigmathdigits5000-n3 es un modelo de lenguaje de 3.2 mil millones de parámetros desarrollado por juwon1105, que parte del checkpoint base meta-llama/Llama-3.2-3B-Instruct y se entrena con RLCC (Reinforcement Learning with Confidence Curriculum), una variante de GRPO que utiliza la confianza calibrada de un modelo RLCR previo como señal de dificultad para ordenar los datos de entrenamiento de fácil a difícil. El objetivo es mejorar simultáneamente el razonamiento y la calibración de la incertidumbre en tareas matemáticas.

El modelo se entrena sobre el dataset mehuldamani/big-math-digits (5.000 muestras de entrenamiento y 1.000 de evaluación) y está pensado para investigación en métodos de aprendizaje por refuerzo, calibración de confianza y razonamiento matemático. Su relevancia radica en que introduce un currículo basado en confianza para entrenar modelos de razonamiento, una técnica novedosa que busca reducir la sobreconfianza y mejorar la fiabilidad de las predicciones. El checkpoint acompaña al artículo "Confidence as Curriculum: Reinforcement Learning for Joint Reasoning and Calibration", actualmente bajo revisión anónima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basada en Llama-3.2-3B-Instruct) |
| Parametros totales | 3.212.749.824 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other (no especificada) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es una adaptación de Llama-3.2-3B-Instruct, un transformer decoder-only con 3.2 mil millones de parámetros. El entrenamiento utiliza RLCC, que consiste en particionar el dataset en K=3 grupos barajados, ordenar cada grupo por confianza descendente (de fácil a difícil) y concatenarlos para formar un currículo. Se parte del modelo base (no del checkpoint RLCR) y se aplica GRPO con recompensa basada en reglas (exact match sobre la respuesta final extraída). El entrenamiento se realiza durante 1 época, con batch size por dispositivo de 1, KL penalty β=0, AdamW de 8 bits, learning rate 5e-6 con schedule lineal y warmup del 20%, y longitud máxima de respuesta de 1.024 tokens. Los rollouts se generan con vLLM a temperatura 0.7, con 32 generaciones por prompt y un rollout batch efectivo de 1.024. Se emplea LoRA con rank 16, alpha 32 y dropout 0.05, dirigido a los módulos q_proj y v_proj. El entrenamiento se ejecutó en una única RTX 3090 durante 16-36 horas GPU.

## Capacidades

- Generación de texto y razonamiento matemático: el modelo está especializado en resolver problemas aritméticos con dígitos grandes, gracias al entrenamiento sobre big-math-digits.
- Calibración de confianza: el entrenamiento con RLCC busca que el modelo produzca estimaciones de incertidumbre mejor calibradas, como indican las métricas ECE, PCE y Brier.
- Razonamiento multi-paso: al ser una variante de Llama-3.2-Instruct, conserva la capacidad de generar cadenas de razonamiento, aunque no se especifica un modo de pensamiento explícito.
- No se documentan capacidades de tool calling, agentes, visión ni audio en la información proporcionada.

## Casos de uso

- Investigación en calibración de modelos: el checkpoint es útil para estudiar cómo el currículo basado en confianza afecta a la calibración (ECE, PCE, Brier) y a la precisión en tareas de razonamiento matemático.
- Evaluación de métodos de RL: sirve como punto de comparación para otros algoritmos de aprendizaje por refuerzo como RLVR o RLCR, ya que comparte recompensa y optimización.
- Benchmark de razonamiento aritmético: puede emplearse como modelo de referencia en conjuntos de datos de matemáticas con dígitos grandes, donde se mide exactitud y fiabilidad de las respuestas.
- Análisis de incertidumbre en generación de texto: al estar entrenado para calibrar confianza, permite experimentos sobre detección de alucinaciones o selección de respuestas basada en la probabilidad asignada.
- Desarrollo de currículos automáticos: el enfoque RLCC puede replicarse o adaptarse en otros dominios, usando este modelo como ejemplo de implementación.
- Docencia y divulgación: sirve como caso práctico para explicar GRPO, LoRA y currículos basados en confianza en cursos de aprendizaje automático.

## Benchmarks y rendimiento

La model card reporta los siguientes resultados sobre el conjunto held-out (1.000 muestras):

| Metrica | Valor |
|---|---|
| Accuracy (held-out) | 0.313 |
| ECE (Expected Calibration Error) | 0.163 |
| PCE (Probability Calibration Error) | 0.156 |
| Brier score | 0.243 |
| AUROC | 0.586 |

No se proporcionan comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- El entrenamiento se realizó en una única RTX 3090 (16-36 horas GPU), lo que indica que el modelo es asequible para GPUs de consumo de gama alta.
- Para inferencia, el tamaño de los pesos en safetensors es de aproximadamente 6,4 GB (probablemente en FP16), por lo que se necesita al menos 8 GB de VRAM para cargar el modelo sin cuantización, y menos con cuantización (no especificada).
- Es compatible con librerías de inferencia como vLLM, llama.cpp, Ollama o TGI, aunque no se documentan configuraciones específicas.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

No se dispone de información comparativa con otros modelos en la documentación proporcionada. El modelo es una variante de Llama-3.2-3B-Instruct, por lo que podría compararse con otros checkpoints de la misma familia, pero no hay datos de rendimiento relativos.

## Limitaciones y advertencias

- La licencia es "other" sin especificar, lo que impide conocer las restricciones de uso comercial; se recomienda contactar al autor antes de cualquier despliegue productivo.
- El modelo está especializado en un dominio muy concreto (matemáticas con dígitos grandes) y su rendimiento en otras tareas no está evaluado.
- La precisión en el conjunto held-out es baja (0.313), lo que sugiere que no es adecuado para aplicaciones donde se requiera alta exactitud sin verificación humana.
- No se documentan sesgos específicos, pero al ser un modelo derivado de Llama-3.2-Instruct, puede heredar sesgos del modelo base.
- Existe riesgo de alucinación en respuestas abiertas, especialmente fuera del dominio matemático.
- El modelo se publica como checkpoint de investigación; no se garantiza su robustez en entornos de producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/juwon1105/RLCC-llama32-3B-bigmathdigits5000-n3
- Dataset de entrenamiento: https://huggingface.co/datasets/mehuldamani/big-math-digits
- Paper asociado (bajo revisión): "Confidence as Curriculum: Reinforcement Learning for Joint Reasoning and Calibration" (sin enlace público aún)
