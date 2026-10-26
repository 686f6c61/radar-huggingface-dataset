# davidheineman/rlve-opd-teacher-R1Distill-094-WeightedLIS-20261025

## Resumen

`davidheineman/rlve-opd-teacher-R1Distill-094-WeightedLIS-20261025` es un ajuste fino de 1.777.088.000 parámetros (aproximadamente 1,78 B) derivado de `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B`. No es un modelo de propósito general: es el checkpoint final de un experimento de escalado de datos (data scaling) del proyecto RLVE, y su función declarada es la de "teacher" (profesor) dentro de un pipeline de generación de datos y destilación. El autor lo etiqueta como especialista entrenado con GRPO sobre un único entorno de entrenamiento, identificado como `94-WeightedLIS`.

El interés del modelo es metodológico más que de producto. Documenta de forma explícita un protocolo de entrenamiento con RL: 4.000 rollouts como tope, actualizaciones de validación cada 50 pasos con 32 prompts y 8 respuestas por prompt, y criterio de parada al alcanzar `pass@1 >= 0,98` en el conjunto de validación por identificador. El checkpoint publicado corresponde a la actualización 499 (indexada desde cero), es decir, el máximo de 4.000 rollouts consumido. Esto lo convierte en material útil para reproducir experimentos de RL y de escalado de datos, no en un asistente conversacional.

Arquitectura y tamaño vienen heredados íntegramente del modelo base: un transformer decoder-only de la familia Qwen2 (etiqueta `qwen2` en HuggingFace) destilado de DeepSeek-R1, con pesos en safetensors y un repositorio de 3,6 GB. La model card no publica licencia, idiomas soportados, longitud de contexto ni resultados de evaluación general, por lo que cualquier uso en producción exige verificar primero esas condiciones en el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2, etiqueta `qwen2`); derivado por destilación de DeepSeek-R1 |
| Parámetros totales | 1.777.088.000 (≈1,78 B), dato real de safetensors |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la model card; el entrenamiento usó 1.024 tokens iniciales más 128 tokens de continuación forzada de respuesta. Consultar la config del modelo base |
| Tipos de cuantización | No se distribuyen cuantizaciones. Los pesos publicados en safetensors (repo de 3,6 GB para 1,78 B de parámetros) son coherentes con precisión de 16 bits |
| Idiomas soportados | No disponible |
| Licencia | No disponible en la model card; debe comprobarse la licencia del modelo base `DeepSeek-R1-Distill-Qwen-1.5B` antes de cualquier uso comercial |
| Formato de pesos | `safetensors`, más tokenizer y ficheros de configuración. No se incluyen estados de optimizador ni de dataloader |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: un transformer decoder-only de Qwen2 con 1,78 B de parámetros, originalmente obtenido por destilación de razonamiento desde DeepSeek-R1. El ajuste realizado por el autor es un entrenamiento de RL con GRPO sobre un único entorno (`94-WeightedLIS`), con dificultad fija y equilibrada (etiquetas 0/1). Todos los actores se inicializaron desde cero a partir de `DeepSeek-R1-Distill-Qwen-1.5B`, sin reanudar pesos previos de otros experimentos.

El protocolo de entrenamiento está documentado con precisión inusual: tope de 4.000 rollouts, validación cada 50 actualizaciones con 32 prompts y 8 respuestas por prompt (las muestras de validación no computan contra el presupuesto de entrenamiento), y parada anticipada cuando el `pass@1` de validación por identificador alcanza 0,98 o se agota el presupuesto. La generación emplea 1.024 tokens iniciales más una continuación de 128 tokens forzando la respuesta. El checkpoint publicado es la actualización 499 (base cero), que corresponde al consumo completo de los 4.000 rollouts. El repositorio conserva `training_run.json` con la lista de entornos y los ajustes de la ejecución, y `training_config.yaml` con la configuración exacta. La etiqueta `opd-teacher` sugiere un rol de profesor dentro de un esquema de destilación on-policy, pero la model card no desarrolla el método ni aporta detalles adicionales sobre la composición del dataset.

## Capacidades

- Generación de texto autoregresiva en inglés (idioma de la model card; el resto de idiomas no está documentado).
- Razonamiento paso a paso con cadena de pensamiento, heredado de la destilación de DeepSeek-R1.
- Resolución especializada de tareas del entorno `94-WeightedLIS`, presumiblemente variantes del problema de la subsecuencia creciente más larga (LIS) con ponderación.
- Generación de rollouts y trayectorias de razonamiento utilizables como datos de entrenamiento para modelos alumnos (rol de teacher).
- Punto de partida reproducible para experimentos de RL con GRPO y de escalado de datos.
- Compatibilidad declarada con Text Generation Inference y con endpoints (`text-generation-inference`, `endpoints_compatible` en las etiquetas).
- No hay evidencia documentada de tool calling, function calling, soporte de agentes multi-paso, visión, audio ni modo "thinking" explícito con etiquetas separadas.

## Casos de uso

- Generación de datos sintéticos para destilación: el modelo actúa como teacher produciendo cadenas de razonamiento y respuestas finales sobre problemas algorítmicos; esas trazas se filtran por corrección y se usan para ajustar modelos alumnos más pequeños. Es exactamente el rol que declara la etiqueta `opd-teacher`.
- Reproducción de experimentos de escalado de datos: al conservar `training_run.json` y `training_config.yaml`, sirve como checkpoint de referencia para comparar curvas de `pass@1` frente a otros teachers del mismo grupo (`data-scaling-v1-n128-20261022-225839`).
- Ablación de algoritmos de RL: sirve como baseline GRPO ya entrenado contra el que medir variantes (DPO, PPO, GRPO con distintas recompensas) sobre el mismo entorno y el mismo modelo base.
- Validación de infraestructura de RL: su compatibilidad con TGI y endpoints permite montar un servidor de inferencia y probar bucles de rollout a escala antes de lanzar entrenamientos costosos.
- Docencia y demostración de razonamiento algorítmico: útil para ilustrar cadenas de pensamiento en problemas de optimización combinatoria, siempre con verificación humana de las respuestas.
- Investigación en sobreajuste de RL: con 4.000 rollouts sobre un solo entorno, es un caso de estudio práctico de especialización extrema y de olvido de capacidades generales.
- Fine-tuning de alumnos pequeños: al partir de un modelo de 1,78 B, las trazas generadas son asequibles de destilar en modelos de 0,5 B a 1,5 B en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el criterio de parada del entrenamiento (`pass@1 >= 0,98` en validación por identificador, con 32 prompts y 8 respuestas por prompt), sin reportar el valor final alcanzado ni métricas en MMLU, HumanEval, GSM8K o similares. Tampoco hay comparación con otros checkpoints del mismo grupo de experimentos.

| Benchmark | Resultado | Notas |
|---|---|---|
| MMLU | No disponible | No reportado |
| HumanEval | No disponible | No reportado |
| GSM8K | No disponible | No reportado |
| `pass@1` en validación del entorno `94-WeightedLIS` | No disponible (solo se conoce el umbral de parada: 0,98) | 32 prompts × 8 respuestas cada 50 actualizaciones |

## Requisitos de hardware

- VRAM estimada para inferencia a 16 bits: en torno a 3,6 GB solo de pesos, más caché KV; un presupuesto realista es de 5 a 8 GB para contextos moderados (estimación a partir del número de parámetros, no medida publicada).
- Cuantización a 8 bits: aproximadamente 1,8-2 GB de pesos; a 4 bits, en torno a 1-1,2 GB. Requiere convertir los pesos, ya que el repositorio solo publica safetensors.
- GPU recomendadas: cualquier GPU consumer con 8 GB o más (RTX 3060 Ti, 4060 Ti 16 GB, 4070, 4080, 4090) es suficiente para inferencia a 16 bits; A100 o H100 solo se justifican para servir muchas peticiones concurrentes o para reentrenar.
- Cabe en GPU consumer: sí, con holgura, dado el tamaño de 1,78 B.
- Opciones de despliegue: `transformers` (librería declarada), Text Generation Inference (etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM; llama.cpp y Ollama son viables previa conversión a GGUF, que el repositorio no incluye.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

Datos de los modelos comparados tomados de su documentación pública; no verificados en la información proporcionada para esta ficha.

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `rlve-opd-teacher-R1Distill-094-WeightedLIS` (este modelo) | 1,78 B | No disponible | Entorno único `94-WeightedLIS`, rol de teacher | No disponible | HuggingFace, 0 descargas, 0 likes |
| `deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B` (base) | 1,78 B | No disponible en esta ficha (consultar model card del base) | Razonamiento general destilado de DeepSeek-R1 | Según model card del base (verificar) | HuggingFace, ampliamente descargado |
| `Qwen/Qwen2.5-1.5B-Instruct` | ≈1,54 B | 32.768 tokens según documentación pública | Instrucciones generales, multilingüe | Apache 2.0 | HuggingFace, muy extendido |
| `Qwen/Qwen2.5-Math-1.5B` | ≈1,5 B | 32.768 tokens según documentación pública | Razonamiento matemático | Apache 2.0 | HuggingFace |

La comparación relevante es frente a su propio modelo base: este checkpoint intercambia capacidades generales por un ajuste fino agresivo sobre un solo entorno. Frente a un instruct generalista de tamaño similar, la diferencia esperable es de especialización, no de tamaño ni de coste de inferencia.

## Limitaciones y advertencias

- Especialización extrema: el entrenamiento se realizó sobre un único entorno (`94-WeightedLIS`) con dificultad fija. Es previsible un deterioro severo en tareas generales de conversación, código o matemáticas fuera de ese dominio, aunque no se han publicado evaluaciones que lo cuantifiquen.
- Licencia no declarada: la model card no indica licencia. No debe asumirse uso comercial permitido; hay que verificar la licencia del modelo base y la compatibilidad de los datos de entrenamiento.
- Idiomas no documentados: no hay lista de idiomas soportados. La model card está en inglés y no se declaran capacidades multilingües.
- Riesgo de alucinación en el razonamiento: al ser un modelo destilado de R1 y ajustado con RL sobre un entorno verificable, las cadenas de pensamiento pueden ser plausibles pero incorrectas fuera de la distribución de entrenamiento. La corrección debe comprobarse con un verificador externo.
- Contexto no documentado: se desconoce la ventana máxima efectiva. El entrenamiento usa 1.024 + 128 tokens, por lo que el rendimiento más allá de esa longitud no está validado.
- Estado del repositorio: sin estados de optimizador ni de dataloader, por lo que no es reanudable tal cual. Solo permite inferencia o un nuevo ajuste desde los pesos finales.
- Señales de validación débiles: 0 descargas y 0 likes, publicación el 2026-10-25 y actualización un minuto después. Es un artefacto de investigación sin revisión por la comunidad.
- Sesgos: no evaluados ni documentados. No hay información sobre composición del dataset más allá del entorno de RL.
- Riesgo de sobreajuste al criterio de parada: el entrenamiento se detiene al alcanzar `pass@1 >= 0,98` en 32 prompts de validación, una muestra pequeña que puede no generalizar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-094-WeightedLIS-20261025
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-1.5B
- Ejecución de entrenamiento en Weights & Biases: https://wandb.ai/david-heineman/rl-data-scaling-teachers-v1/runs/18f274de
- Configuración del entrenamiento (en el repo): https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-094-WeightedLIS-20261025/blob/main/training_config.yaml
- Registro de la ejecución (en el repo): https://huggingface.co/davidheineman/rlve-opd-teacher-R1Distill-094-WeightedLIS-20261025/blob/main/training_run.json
- Paper, blog o repositorio del método RLVE: no disponible en la información proporcionada.
