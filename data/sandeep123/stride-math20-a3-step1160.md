# sandeep123/stride-math20-a3-step1160

## Resumen

El modelo `sandeep123/stride-math20-a3-step1160` es un fine-tuning de razonamiento matemático basado en `Qwen/Qwen2.5-Math-1.5B`, desarrollado mediante la técnica STRIDE (step-level diversity in RL exploration) sobre el conjunto de datos MATH. Este checkpoint, seleccionado como el mejor de su rama por validación, busca mejorar la precisión en problemas matemáticos mediante aprendizaje por refuerzo con GRPO y la biblioteca verl.

Con 1.675 millones de parámetros, el modelo mantiene la arquitectura decoder-only de Qwen2.5, pero con un entrenamiento específico que incorpora diversidad a nivel de paso para explorar más rutas de solución. Su relevancia radica en demostrar que un modelo pequeño puede alcanzar un rendimiento notable en matemáticas con técnicas de RL avanzadas, y en servir como referencia para la comparación de estrategias de diversidad en el entrenamiento.

La licencia Apache-2.0 permite su uso comercial, lo que lo hace atractivo para aplicaciones educativas o de asistencia matemática en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-Math-1.5B) |
| Parametros totales | 1.675.088.000 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo base entrenado en inglés y chino, pero sin confirmación) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura Qwen2.5-Math-1.5B, un transformer decoder con atención causal y aproximadamente 1.675 millones de parámetros. El entrenamiento se realizó con la metodología STRIDE, que introduce diversidad a nivel de paso en la exploración de RL, combinada con GRPO (Group Relative Policy Optimization) y el framework verl. Se utilizó el conjunto de datos MATH de lighteval como fuente de problemas.

El proceso de entrenamiento consistió en 20 épocas (~1160 pasos) con un batch de 128, 6 rollouts por muestra y una longitud máxima de respuesta de 1024 tokens. Se aplicó un coeficiente KL de 0.01 como parte de la recompensa. El checkpoint seleccionado corresponde al paso 1160, elegido por su mejor pass@1 en validación. No se proporcionan detalles sobre la composición exacta del dataset ni sobre técnicas de pre-entrenamiento adicionales.

## Capacidades

- Razonamiento matemático paso a paso, generando soluciones detalladas para problemas de álgebra, cálculo, probabilidad y otras áreas del conjunto MATH.
- Generación de texto con formato de respuesta estructurado (no se especifica si usa pensamiento encubierto, pero el entrenamiento en RL favorece cadenas de razonamiento).
- Soporte de tool calling y function calling: no disponible.
- Soporte de agentes y multi-step reasoning: no disponible, aunque el modelo puede encadenar pasos matemáticos.
- Capacidades multilingües: no disponible.
- Capacidades especiales: ninguna documentada más allá de la mejora en razonamiento matemático.

## Casos de uso

- **Tutoría matemática interactiva**: el modelo puede generar explicaciones paso a paso de problemas de matemáticas, lo que permite integrarlo en plataformas educativas para ofrecer ayuda a estudiantes. Su tamaño compacto facilita el despliegue en entornos con recursos limitados.
- **Resolución automática de ejercicios**: útil en sistemas de evaluación automática de problemas matemáticos, donde se requiere generar respuestas correctas y verificables. El alto pass@1 (0.7266) en validación sugiere buena fiabilidad.
- **Generación de problemas de práctica**: a partir de un tema dado, el modelo puede crear nuevos problemas matemáticos con soluciones, útil para aplicaciones de aprendizaje adaptativo.
- **Asistente en herramientas de cálculo simbólico**: integrado en entornos como Jupyter o calculadoras en línea para ofrecer explicaciones de pasos intermedios en derivadas, integrales o ecuaciones.
- **Validación de soluciones**: en pipelines de verificación de resultados matemáticos, el modelo puede comparar respuestas generadas con las suyas propias, ayudando a detectar errores en sistemas automatizados.
- **Investigación en RL y razonamiento**: sirve como referencia para estudiar la efectividad de STRIDE en modelos pequeños, permitiendo a investigadores reproducir y comparar técnicas de diversidad en el entrenamiento.

## Benchmarks y rendimiento

Los resultados de validación publicados por el autor son los siguientes (conjunto de validación pequeño: 128 prompts × 6 rollouts = 768 respuestas, error estándar ±4 puntos):

| Métrica | Valor |
|---|---|
| pass@1 | 0.7266 |
| pass@k (k=6) | 0.9375 |
| duplicate-opening rate | 0.008 |
| non-ASCII fraction | 0.01% |

Comparación con el modelo base (antes del entrenamiento):

| Métrica | Base (Qwen2.5-Math-1.5B) | STRIDE (checkpoint 1160) |
|---|---|---|
| pass@1 | 0.4805 | 0.7266 |
| pass@k (k=6) | 0.8672 | 0.9375 |

Estos datos indican una mejora sustancial en pass@1 (+0.2461) y una mejora menor en pass@k (+0.0703). No se han publicado resultados en benchmarks estándar como MMLU, GSM8K o HumanEval para este checkpoint.

## Requisitos de hardware

- **VRAM estimada para inferencia**: para el modelo de 1.5B en FP16, los pesos ocupan ~3.4 GB. Con cuantización a 8 bits (~0.9 GB) o 4 bits (~0.6 GB) se reduce notablemente. No se especifican cuantizaciones oficiales, pero es compatible con técnicas estándar.
- **GPU recomendadas**: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en FP16 (por ejemplo, NVIDIA GTX 1650, RTX 2060, RTX 3060). Para cuantización 4-bit, puede funcionar en GPUs con 2 GB o menos.
- **Compatibilidad con GPU consumer**: sí, es adecuado para GPUs de gama media (RTX 3060, RTX 4060) y de gama alta (RTX 4090) sin problemas.
- **Opciones de despliegue**: al estar en safetensors, se puede convertir a GGUF para usar con llama.cpp, Ollama, o cargar directamente con vLLM, TGI o transformers. También es compatible con frameworks de RL como verl para inferencia.
- **Latencia y throughput**: no disponible. Se estima que en una RTX 4090 puede generar alrededor de 100-200 tokens/s para respuestas de hasta 1024 tokens, pero no hay datos oficiales.

## Comparativa con modelos similares

Comparación con el modelo base y otra variante de STRIDE (no disponible en la información proporcionada):

| Modelo | Parámetros | Contexto | pass@1 (MATH) | Licencia |
|---|---|---|---|---|
| Qwen2.5-Math-1.5B (base) | 1.5B | no disponible | 0.4805 | Apache-2.0 |
| stride-math20-a3-step1160 | 1.5B | no disponible | 0.7266 | Apache-2.0 |
| Otros modelos de 1.5B (ej. Llama-3.2-1.5B) | 1.5B | no disponible | no disponible | no disponible |

La comparación directa con otros modelos de la misma categoría no está disponible en la información proporcionada. El modelo se distingue por su método de entrenamiento STRIDE, que no se ha aplicado en otros modelos conocidos de este tamaño.

## Limitaciones y advertencias

- **Conjunto de validación pequeño**: el autor advierte que la validación se hizo con 128 prompts × 6 rollouts, lo que implica un error estándar de ±4 puntos. Los resultados pueden no ser representativos a gran escala.
- **Riesgo de alucinación**: al ser un modelo de razonamiento matemático, puede generar pasos incorrectos o soluciones falsas si no se le aplica verificación externa.
- **Limitaciones de idioma**: no se especifican idiomas soportados, pero el modelo base Qwen2.5-Math está entrenado principalmente en inglés. Es posible que el rendimiento en español sea inferior.
- **Contexto limitado**: no se ha documentado la longitud de contexto, pero el modelo base tiene 32k tokens de contexto nativo, aunque este fine-tune puede haber restringido la generación a 1024 tokens de respuesta.
- **Restricciones de licencia**: Apache-2.0 permite uso comercial, pero no se garantiza que el modelo cumpla con requisitos específicos de precisión o seguridad en aplicaciones críticas.
- **Producción**: el modelo no ha sido probado en entornos de producción con alta carga; se recomienda realizar pruebas adicionales antes de desplegarlo en sistemas que requieran alta fiabilidad.

## Enlaces

- Modelo en HuggingFace: [sandeep123/stride-math20-a3-step1160](https://huggingface.co/sandeep123/stride-math20-a3-step1160)
- Modelo base: [Qwen/Qwen2.5-Math-1.5B](https://huggingface.co/Qwen/Qwen2.5-Math-1.5B)
- Framework verl: [verl](https://github.com/volcengine/verl) (no confirmado en la información, pero es una referencia habitual)
