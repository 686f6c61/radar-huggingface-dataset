# calmcam/Qwen3-1.7B-Countdown-DrGRPO-256tok

## Resumen

Qwen3-1.7B-Countdown-DrGRPO-256tok es un ajuste fino del modelo Qwen/Qwen3-1.7B realizada por el usuario calmcam mediante aprendizaje por refuerzo con recompensa verificable (RLVR), concretamente con el algoritmo Dr.GRPO (variante de GRPO sin penalizacion KL). El modelo resuelve una tarea concreta y acotada: el juego numerico Countdown, en el que a partir de 3 o 4 numeros y un objetivo hay que construir una expresion aritmetica con suma, resta, multiplicacion y division que use cada numero como maximo una vez y alcance el objetivo.

El interes no esta en el modelo como asistente general, sino como experimento controlado de investigacion: forma parte de una familia de cuatro checkpoints que comparan GRPO frente a Dr.GRPO con presupuestos de generacion de 256 y 512 tokens, entrenados sobre la misma secuencia de prompts y con la misma semilla. El checkpoint aqui descrito obtuvo un 50,51 % de accuracy media@4 y un 63,96 % de pass@4 sobre 1024 problemas del split de test, frente a un 0,1 % de accuracy media@4 del modelo base en el mismo presupuesto.

La relevancia es metodologica: demuestra como un modelo de 1.700 millones de parametros puede pasar de practicamente cero a resolver la mitad de los problemas de Countdown con solo 80 pasos de RL y un presupuesto de 256 tokens, y ofrece un punto de comparacion reproducible sobre el efecto del algoritmo de optimizacion y del presupuesto de tokens en tareas de razonamiento matematico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3), ajuste fino de Qwen/Qwen3-1.7B |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; el autor no la declara) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-1.7B, un transformer decoder-only denso de 1.720 millones de parametros, y se somete a un ajuste fino de todos los parametros (full-parameter fine-tuning) sin penalizacion KL. El algoritmo empleado, Dr.GRPO, calcula la ventaja como la recompensa menos la media del grupo, sin el termino de divergencia KL respecto a la politica de referencia que incorpora GRPO. El entrenamiento consistio en 80 pasos sobre la tarea Countdown, con un presupuesto de completado de 256 tokens que incluye tanto el razonamiento dentro de las etiquetas `<think>` como la respuesta final dentro de `<answer>`.

Los datos de entrenamiento provienen del dataset longphann/Countdown-Tasks-3to4, con problemas de 3 o 4 numeros. La recompensa es verificable: se comprueba si la expresion aritmetica producida es valida y alcanza el objetivo. La evaluacion se realizo sobre el split de test de ese mismo dataset (1024 problemas: 490 con 3 numeros y 534 con 4), con muestreo a temperatura 1.0, top-p 1.0 y parada en `</answer>`. El modelo solo fue entrenado y evaluado con una plantilla de prompt concreta (mensaje de sistema "You are a helpful assistant." y plantilla de usuario especifica con `{max_tokens}` = 256); otros formatos obtienen puntuaciones inferiores segun el autor.

## Capacidades

- Generacion de texto y razonamiento aritmetico acotado a la tarea Countdown: construir expresiones con `+`, `-`, `*` y `/` a partir de 3 o 4 numeros y un objetivo.
- Modo thinking de Qwen3: produce razonamiento intermedio dentro de `<think> </think>` y la respuesta final dentro de `<answer> </answer>`.
- Razonamiento de un solo paso con presupuesto de tokens limitado (256 tokens para pensamiento y respuesta).
- Generacion con muestreo multiple: el modelo esta pensado para evaluarse con 4 muestras por problema (mean@4 y pass@4).
- Capacidades multilingues: solo ingles declarado.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Investigacion en RLVR: servir como checkpoint de referencia para estudiar el efecto del algoritmo (GRPO frente a Dr.GRPO) y del presupuesto de tokens (256 frente a 512) en tareas de razonamiento con recompensa verificable, comparando contra los otros tres checkpoints de la familia.
- Evaluacion de tecnicas de razonamiento con presupuesto limitado: medir cuanta capacidad de resolucion se conserva cuando el modelo debe razonar y responder en 256 tokens, util para disenar sistemas con restricciones de latencia y coste.
- Generacion de problemas y soluciones de Countdown para aumento de datos: el modelo puede producir expresiones candidatas que, tras verificacion automatica, alimenten datasets de entrenamiento o de evaluacion para otros modelos.
- Estudio de la longitud de completado y de la tasa de agotamiento del presupuesto: el autor reporta que el 48 % de las muestras agotan los 256 tokens, un dato relevante para analizar el equilibrio entre profundidad de razonamiento y coste computacional.
- Reproduccion de experimentos de RL: con la semilla y la secuencia de prompts documentadas, sirve para validar implementaciones de Dr.GRPO y comparar resultados de forma controlada.
- Docencia y divulgacion sobre RL con recompensas verificables: ejemplo concreto y de bajo coste (modelo de 1.7B) para explicar ventajas por grupo, verificacion de recompensas y el papel de la penalizacion KL.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de Countdown-Tasks-3to4 (1024 problemas), presupuesto de 256 tokens, temperatura 1.0, top-p 1.0, parada en `</answer>`:

| Metrica | Qwen3-1.7B (base) | Este modelo |
|---|---|---|
| Accuracy, 1 muestra (%) | 0,3 | 48,7 |
| Accuracy, mean@4 (%) | 0,1 ± 0,1 | 50,5 ± 0,4 |
| pass@4 (%) | 0,5 | 64,0 |
| Problemas de 3 numeros, mean@4 (%) | 0,3 | 78,7 |
| Problemas de 4 numeros, mean@4 (%) | 0,0 | 24,6 |
| Muestras que agotan el presupuesto de tokens (%) | 100 | 48 |
| Longitud media de completado (tokens) | 256 | 201 |

Comparativa de los cuatro checkpoints de la familia:

| Modelo | Metodo | Presupuesto | Accuracy, 1 muestra | mean@4 | pass@4 |
|---|---|---|---|---|---|
| Qwen3-1.7B-Countdown-GRPO-256tok | GRPO | 256 | 55,6 | 56,6 | 69,1 |
| Qwen3-1.7B-Countdown-GRPO-512tok | GRPO | 512 | 61,7 | 61,5 | 71,6 |
| Qwen3-1.7B-Countdown-DrGRPO-256tok (este modelo) | Dr.GRPO | 256 | 48,7 | 50,5 | 64,0 |
| Qwen3-1.7B-Countdown-DrGRPO-512tok | Dr.GRPO | 512 | 57,5 | 56,3 | 66,1 |

Evolucion de la accuracy (1 muestra) durante el entrenamiento sobre el split de test:

| Paso | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 |
|---|---|---|---|---|---|---|---|---|---|
| Accuracy (%) | 0,3 | 14,8 | 27,1 | 32,8 | 35,9 | 41,3 | 45,1 | 47,0 | 48,7 |

Nota: el autor senala que el modelo base con un presupuesto de 1024 tokens alcanza un 39,0 % (1 muestra), y que la mayoria de sus fallos con presupuestos pequenos se deben a quedarse sin tokens antes de escribir la respuesta. Los errores estandar indicados corresponden al muestreo (4 muestras), no a semillas de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3,5 GB en bfloat16 (coincide con el tamano del repositorio de 3,5 GB), mas el overhead de la cache KV; en cuantizacion de 8 bits o 4 bits el peso se reduce a alrededor de 1,8 GB y 0,9 GB respectivamente, aunque el autor no publica variantes cuantizadas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16; A100, H100, L40S o RTX 4090 para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas (por ejemplo RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090).
- Opciones de despliegue: transformers (ejemplo oficial del autor), vLLM (con `SamplingParams(temperature=1.0, top_p=1.0, max_tokens=256, stop=["</answer>"], include_stop_str_in_output=True)`), y text-generation-inference (el modelo esta etiquetado como compatible con endpoints). El autor no documenta llama.cpp, Ollama ni GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en Countdown (mean@4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Countdown-DrGRPO-256tok | 1,72B | no disponible | 50,5 % (256 tokens) | apache-2.0 | Hugging Face |
| Qwen3-1.7B-Countdown-GRPO-256tok | 1,72B | no disponible | 56,6 % (256 tokens) | apache-2.0 | Hugging Face |
| Qwen3-1.7B-Countdown-GRPO-512tok | 1,72B | no disponible | 61,5 % (512 tokens) | apache-2.0 | Hugging Face |
| Qwen3-1.7B-Countdown-DrGRPO-512tok | 1,72B | no disponible | 56,3 % (512 tokens) | apache-2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1,72B | no disponible | 0,1 % (256 tokens); 39,0 % con 1 muestra a 1024 tokens | apache-2.0 | Hugging Face |

Los cuatro checkpoints de la familia comparten arquitectura, tamano y licencia; las diferencias provienen del algoritmo de RL y del presupuesto de tokens. En esta comparativa, GRPO supera a Dr.GRPO en ambos presupuestos segun los datos del autor.

## Limitaciones y advertencias

- Modelo especializado: solo resuelve la tarea Countdown con el formato de prompt exacto documentado; fuera de ese formato o de esa tarea el rendimiento cae.
- Sensibilidad al prompt: el autor advierte explicitamente que otros formatos de prompt obtienen puntuaciones inferiores.
- Configuracion de generacion: `generation_config.json` conserva los valores propios de Qwen3 (temperatura 0,6, top-k 20, top-p 0,95), que no se usaron en entrenamiento ni evaluacion; llamar a `generate()` sin argumentos produce un muestreo distinto y no se detiene en `</answer>`.
- Dificultad con 4 numeros: la accuracy media@4 cae al 24,6 % frente al 78,7 % en problemas de 3 numeros.
- Agotamiento del presupuesto: el 48 % de las muestras alcanzan el limite de 256 tokens, lo que limita la fiabilidad en problemas que requieren razonamiento mas largo.
- Riesgo de alucinacion: en tareas abiertas el modelo puede producir razonamientos plausibles pero incorrectos; la verificacion de la expresion final es obligatoria en cualquier uso automatizado.
- Idiomas: solo ingles declarado; el castellano no esta soportado de forma explicita.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen3-1.7B hereda los sesgos del modelo base y de sus datos de preentrenamiento.
- Licencia: apache-2.0 permite uso comercial, pero el modelo esta pensado para investigacion en RL y no se ha validado en produccion.
- Escasez de validacion externa: los resultados son declarados por el autor (`verified: false`) y no se han replicado de forma independiente; el modelo tiene 0 descargas y 0 likes en el momento de la ficha.
- Entrenamiento corto: solo 80 pasos, por lo que el checkpoint representa un punto intermedio de la curva de aprendizaje y no un modelo convergido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-DrGRPO-256tok
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Checkpoint GRPO 256 tokens: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-GRPO-256tok
- Checkpoint GRPO 512 tokens: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-GRPO-512tok
- Checkpoint Dr.GRPO 512 tokens: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-DrGRPO-512tok
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/longphann/Countdown-Tasks-3to4
- Papers, blogs, repositorios y demos adicionales: no disponibles en la informacion proporcionada.
