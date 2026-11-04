# HarleyCooper/grid-policy-mlp-repaired

## Resumen

grid-policy-mlp-repaired es una política neuronal de refuerzo para el entorno grid Breakout, publicada por el usuario HarleyCooper en HuggingFace. No se trata de un modelo de lenguaje: es un perceptrón multicapa (MLP) de tres capas con activación tanh y arquitectura 500-32-32-5, con un total de 17.253 parámetros en float32. Su entrada es una representación del estado del juego en rejilla y su salida son cinco valores de acción (Q-values o logits de política, no especificado en la model card).

El interés del artefacto no reside en su tamaño ni en su rendimiento absoluto, sino en el método con el que se ha obtenido: cuatro ediciones de pesos en forma cerrada (closed-form weight edits) aplicadas secuencialmente sobre el modelo original grid-policy-mlp, sin ningún paso de gradiente ni reentrenamiento. Cada edición es una actualización de rango completo restringida a la matriz W2 que corrige un fallo diagnosticado previamente, minimizando el daño sobre un conjunto de estados de sonda, y solo se conserva si la media de retorno con compuerta no disminuye.

El resultado es un incremento de retorno medio de 8,16 a 9,83 en las semillas de compuerta y de 8,56 a 9,06 en semillas retenidas nunca usadas para la selección. El modelo se distribuye como un fichero NPZ de pesos y está pensado como demostración de la técnica de edición de pesos del proyecto KimiBrainSurgery, no como un componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MLP de 3 capas (500-32-32-5) con activación tanh |
| Parametros totales | 17.253 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (entorno de rejilla, sin contexto textual) |
| Tipos de cuantizacion | no disponible (pesos en float32) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | MIT |
| Formato de pesos | NPZ (`policy_weights.npz` con claves W1, b1, W2, b2, W3, b3, float32) |

## Arquitectura y entrenamiento

La red es un perceptrón multicapa totalmente conectado con capas de 500, 32, 32 y 5 neuronas, activación tanh y 17.253 parámetros en total. La entrada corresponde al estado del entorno grid Breakout y la salida son cinco valores, presumiblemente uno por acción disponible. No hay atención, recurrencia ni componentes tipo transformer; es una política pequeña diseñada para un entorno de control con observaciones de baja dimensionalidad.

El entrenamiento original del modelo base (grid-policy-mlp) no se detalla en la información disponible. Lo relevante es el proceso de reparación: cuatro ediciones secuenciales de pesos en forma cerrada sobre W2, cada una de rango completo y con una restricción de minimización de daño sobre estados de sonda. No se aplicaron pasos de gradiente ni reentrenamiento. La aceptación de cada edición se decide mediante una compuerta basada en el retorno medio con 64 semillas codiciosas: la edición se conserva solo si el retorno no decrece. Un quinto fallo minado quedó sin resolver porque su edición propuesta fue revertida al reducir el retorno.

## Capacidades

- Control de política en el entorno grid Breakout: selección de acción a partir del estado de rejilla.
- Inferencia determinista en modo codicioso (greedy) sobre 64 semillas evaluadas.
- Edición de pesos verificable: el repositorio documenta el efecto cuantificado de cada actualización sobre el retorno.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en el sentido de los LLM.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Investigación en edición de pesos: servir como caso de estudio reproducible de actualizaciones en forma cerrada sobre una red pequeña, con métricas antes y después publicadas.
- Reproducción de experimentos de reparación de fallos: el par de modelos (original y reparado) permite validar la metodología de KimiBrainSurgery sobre un entorno controlado.
- Benchmark de técnicas de cirugía de redes: comparar ediciones de rango completo restringidas a W2 frente a fine-tuning convencional en términos de retorno y daño colateral.
- Docencia en aprendizaje por refuerzo: ejemplo mínimo de 17.253 parámetros para ilustrar políticas MLP, evaluación con múltiples semillas y compuertas de aceptación.
- Pruebas de robustez de políticas: analizar el comportamiento en las semillas retenidas (9,06 de retorno) frente a las de compuerta (9,83) para estudiar sobreajuste a la selección.
- Integración en entornos de simulación ligeros: al ser un NPZ de pocos kilobytes, puede cargarse en scripts de Python para experimentos de agente en grid Breakout sin dependencias pesadas.

## Benchmarks y rendimiento

| Modelo | Retorno medio (greedy, 64 semillas de compuerta) | Retorno medio (semillas retenidas) |
|---|---|---|
| grid-policy-mlp (original) | 8,16 | 8,56 |
| grid-policy-mlp-repaired (este modelo) | 9,83 | 9,06 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que el modelo no es un LLM.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; los pesos en float32 ocupan aproximadamente 69 KB (17.253 parámetros × 4 bytes).
- GPU recomendadas: ninguna en particular; el modelo cabe en CPU y en cualquier GPU consumer.
- Cabe en cualquier GPU consumer y en entornos sin GPU.
- Opciones de despliegue: carga directa del NPZ con NumPy en Python; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explícita; por el tamaño, la inferencia es del orden de microsegundos por paso en CPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Retorno (greedy, 64 semillas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| grid-policy-mlp-repaired | 17.253 | no aplica | 9,83 (compuerta) / 9,06 (retenidas) | MIT | HuggingFace |
| grid-policy-mlp (original) | 17.253 | no aplica | 8,16 (compuerta) / 8,56 (retenidas) | no disponible | HuggingFace |
| Otras políticas para grid Breakout | no disponible | no aplica | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de terceros para este entorno concreto.

## Limitaciones y advertencias

- Ámbito muy restringido: solo válido para el entorno grid Breakout con la representación de estado concreta para la que fue entrenado.
- Un fallo minado permanece sin resolver; su edición propuesta fue revertida por reducir el retorno.
- Diferencia entre retorno de compuerta (9,83) y retenidas (9,06) sugiere cierta dependencia de las semillas usadas en la selección.
- No es un modelo de lenguaje: no genera texto, no razona en lenguaje natural y no admite instrucciones.
- Riesgo de alucinación no aplica; el riesgo relevante es de sobreajuste al conjunto de evaluación y de degradación fuera del entorno previsto.
- Licencia MIT, que permite uso comercial y modificación con atribución, pero el modelo no está pensado para producción.
- La model card no documenta sesgos, composición del dataset de entrenamiento original ni detalles del entorno de evaluación más allá de las 64 semillas.

## Enlaces

- HuggingFace: https://huggingface.co/HarleyCooper/grid-policy-mlp-repaired
- Modelo original: https://huggingface.co/HarleyCooper/grid-policy-mlp
- Repositorio KimiBrainSurgery: https://github.com/HarleyCoops/KimiBrainSurgery
