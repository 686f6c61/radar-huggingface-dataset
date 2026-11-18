# davidafrica/e2h-polaris-qwen3-4b-full-2k-all_rb

## Resumen

e2h-polaris-qwen3-4b-full-2k-all_rb es un checkpoint de ajuste fino del modelo Qwen3-4B de Alibaba, publicado por el usuario davidafrica en Hugging Face. Se trata de un experimento de investigación centrado en el razonamiento matemático, entrenado mediante GRPO (Group Relative Policy Optimization) sobre el conjunto Polaris-Dataset-53K, un corpus de problemas matemáticos. El objetivo del trabajo es estudiar la transición de dificultad "easy-to-hard" (E2H): los problemas se dividieron en bandas fácil y difícil según la tasa de acierto del propio Qwen3-4B base con 16 muestras por problema, y el entrenamiento incluyó todos los problemas de cada banda.

El modelo parte de la arquitectura transformer densa de Qwen3-4B, con 4.411.424.256 parámetros totales según los pesos en safetensors, y se ha entrenado con un fork de verl 0.4.1. El checkpoint publicado corresponde al paso 500 de 500 de una ronda de reentrenamiento con respuestas limitadas a 2.048 tokens (de ahí el sufijo "2k"), tras una primera ronda que usó 8.192 tokens por respuesta. Los pesos están en bf16, fusionados a partir de los shards FSDP de verl.

Su relevancia es acotada y experimental: no es un modelo de propósito general ni un lanzamiento de producto, sino un artefacto de investigación sobre entrenamiento por refuerzo para matemáticas con recompensa basada en reglas. Resulta útil para quienes estudian dinámicas de GRPO, currículos easy-to-hard y el efecto del límite de longitud de respuesta en el rendimiento matemático de modelos pequeños.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-4B) |
| Parametros totales | 4.411.424.256 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso respuestas de hasta 2.048 tokens) |
| Tipos de cuantizacion | no disponible; pesos publicados en bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16, fusionados desde shards FSDP de verl) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3-4B, un transformer denso de aproximadamente 4.400 millones de parámetros. El ajuste se realizó con GRPO, un algoritmo de optimización de política proximal por grupos que no requiere un modelo crítico separado y que estima la ventaja relativa dentro de un grupo de muestras generadas para el mismo prompt. La implementación empleó un fork de verl 0.4.1, con 64 prompts por paso y 8 muestras por prompt, tasa de aprendizaje de 1e-6, pérdida KL de 0.001 con la variante low_var_kl y respuestas de hasta 2.048 tokens.

La recompensa es puramente basada en reglas: se otorga si la respuesta final coincide con la respuesta de referencia. Los datos provienen de Polaris-Dataset-53K, dividido en bandas fácil y difícil según la tasa de acierto del Qwen3-4B base con 16 muestras por problema. El conjunto de entrenamiento `train_all` contiene 26.790 problemas (suma de `train_easy` y `train_hard`). Una particularidad relevante del checkpoint es que, al limitar las respuestas a 2.048 tokens en esta reentrenamiento, la mayoría de las generaciones se truncan; cuando una respuesta no contiene una caja `\boxed{}`, la puntuación se calcula sobre la última expresión del texto. La evaluación se realizó cada 50 pasos sobre `eval_all_small` (850 problemas, 50 por cada nivel de acierto del base de 0 a 16 sobre 16) y `eval_hard_small` (1.000 problemas que el base no resolvió ninguna vez en 16 intentos), con 8 muestras por problema.

## Capacidades

- Generación de texto y razonamiento matemático, con especial énfasis en problemas de competición y razonamiento de varios pasos.
- Producción de cadenas de razonamiento con respuesta final delimitada mediante `\boxed{}` (formato inducido por el entrenamiento con recompensa basada en reglas).
- Razonamiento multi-paso orientado a la resolución de problemas matemáticos.
- No se documenta soporte de tool calling ni function calling en la información disponible.
- No se documenta soporte de agentes ni de razonamiento multi-turno en la información disponible.
- Capacidades multilingües: no disponibles; no se especifican idiomas de entrenamiento ni de evaluación.
- No se documentan capacidades de visión, audio ni modo "thinking" explícito más allá de la cadena de razonamiento matemático.

## Casos de uso

- Investigación sobre GRPO: el checkpoint permite reproducir y analizar la dinámica de entrenamiento por refuerzo con recompensa basada en reglas, comparando curvas de evaluación cada 50 pasos sobre los conjuntos `eval_all_small` y `eval_hard_small`.
- Estudio de currículos easy-to-hard: al estar los datos separados por bandas de dificultad según la tasa de acierto del modelo base, sirve para analizar cómo el orden y la composición del currículo afectan al aprendizaje de problemas que el base no resuelve.
- Análisis del efecto del límite de longitud de respuesta: la comparación entre la ronda de 8.192 tokens y esta reentrenamiento de 2.048 tokens permite estudiar el impacto del truncamiento en la calidad del razonamiento y en la puntuación de recompensa.
- Evaluación de robustez de la recompensa basada en reglas: el mecanismo de puntuar la última expresión cuando falta `\boxed{}` es un caso de estudio sobre cómo los parsers de recompensa condicionan el comportamiento aprendido.
- Generación de soluciones matemáticas paso a paso en entornos de investigación: útil para construir datasets sintéticos de cadenas de razonamiento matemático con verificación automática contra respuesta de referencia.
- Fine-tuning posterior y experimentación con modelos pequeños: al ser un modelo de 4.400 millones de parámetros con licencia Apache 2.0, puede servir como punto de partida para ajustes adicionales en tareas matemáticas o como baseline en comparativas de RL para razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente describe la metodología de evaluación (evaluación cada 50 pasos sobre `eval_all_small` y `eval_hard_small`, con 8 muestras por problema) y advierte que la mayoría de las respuestas de este checkpoint superan los 2.048 tokens y se truncan, pero no se incluyen cifras numéricas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,8 GB solo para pesos (4.411.424.256 parámetros × 2 bytes), más memoria para el contexto y el estado de atención; en la práctica, entre 10 y 12 GB para secuencias moderadas.
- VRAM estimada en cuantización de 8 bits: alrededor de 4,5 a 5,5 GB para pesos; en 4 bits, alrededor de 2,5 a 3,5 GB. Estas cifras son estimaciones a partir del número de parámetros, no datos publicados por el autor.
- GPU recomendadas: A100 40 GB u H100 para servir con vLLM y concurrencia alta; RTX 4090 (24 GB) para inferencia en bf16 con margen; RTX 3090 (24 GB) igualmente viable.
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090, RTX 4080 (16 GB) en bf16 con contexto limitado, y en GPUs de 8 GB si se cuantiza a 4 bits.
- Opciones de despliegue: vLLM (el autor documenta `vllm.LLM` con `revision="step-500"`), transformers con `AutoModelForCausalLM.from_pretrained` y la revisión correspondiente, y previsiblemente llama.cpp u Ollama si se generan conversiones GGUF (no publicadas en el repositorio).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| e2h-polaris-qwen3-4b-full-2k-all_rb | 4.411.424.256 | no disponible | GRPO sobre Polaris-Dataset-53K (26.790 problemas) | Apache 2.0 | Hugging Face, revisiones por paso |
| Qwen/Qwen3-4B (base) | ~4.400 millones | no disponible en la información proporcionada | Preentrenamiento y postentrenamiento de Alibaba | Apache 2.0 | Hugging Face |
| Otros derivados de Qwen3-4B con RL para matemáticas | ~4.400 millones | variable | GRPO/PPO sobre datasets matemáticos | habitualmente Apache 2.0 | Hugging Face |

La comparación con alternativas de la misma categoría (modelos de ~4.000 millones de parámetros ajustados con RL para matemáticas) no puede completarse con datos de rendimiento porque el autor no publica cifras de benchmarks. La diferencia principal frente al Qwen3-4B base es el ajuste con GRPO y recompensa basada en reglas sobre problemas matemáticos filtrados por dificultad, no un cambio de arquitectura ni de tamaño.

## Limitaciones y advertencias

- Modelo experimental de investigación: no está pensado como modelo de producción generalista; su rendimiento fuera de matemáticas no está documentado.
- Truncamiento sistemático: la mayoría de las respuestas superan los 2.048 tokens y se cortan, lo que puede degradar la calidad de las soluciones y la fiabilidad de la respuesta final.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar razonamientos plausibles pero incorrectos; la verificación contra respuesta de referencia es imprescindible en cualquier uso real.
- Sesgos: no se documentan análisis de sesgo; al derivar de Qwen3-4B, hereda los sesgos del modelo base y de sus datos de preentrenamiento.
- Idiomas: no se especifican idiomas soportados ni evaluación multilingüe; el entrenamiento se centra en problemas matemáticos, presumiblemente en inglés, aunque esto no se confirma en la información disponible.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo no incluye garantías ni soporte; conviene revisar también las condiciones del modelo base Qwen3-4B.
- Repositorio de 88,2 GB con múltiples revisiones por paso: requiere descargar la revisión concreta (`step-500`) para evitar descargas masivas innecesarias.
- Sin descargas ni likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa del checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davidafrica/e2h-polaris-qwen3-4b-full-2k-all_rb
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Repositorio verl: https://github.com/volcengine/verl
- No se han encontrado en la información proporcionada enlaces a papers, blogs, demos ni repositorios adicionales del autor.
