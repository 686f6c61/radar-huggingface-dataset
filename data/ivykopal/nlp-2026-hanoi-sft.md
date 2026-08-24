# ivykopal/nlp-2026-hanoi-sft

## Resumen

`ivykopal/nlp-2026-hanoi-sft` es un fine-tuning completo (full fine-tuning, FFT) del modelo `HuggingFaceTB/SmolLM2-135M-Instruct` diseñado exclusivamente para resolver el puzzle de la Torre de Hanoi en una sola generación, emitiendo un movimiento por línea en formato `A->C`. Lo desarrolla `ivykopal` como parte de un proyecto académico de NLP 2026 que compara estrategias de fine-tuning y reinforcement learning (RL), siendo este el baseline de SFT para el posterior entrenamiento GRPO.

El modelo es un experimento de investigación: con 134,5 millones de parámetros y una ventana de entrenamiento de 384 tokens, se entrena sobre trayectorias óptimas de puzzles de 2 a 5 discos (máximo 31 movimientos) con un 20% de demostraciones corruptas. Su relevancia radica en que documenta dos fenómenos críticos en fine-tuning de LLMs: la propagación de error por movimiento cuando las demostraciones contienen ruido, y el fallo de extrapolación de longitud (length prior), donde el modelo emite respuestas bien formadas pero de longitud incorrecta para puzzles más largos. No es un asistente general, sino una herramienta de investigación reproducible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (SmolLM2, familia Llama) |
| Parametros totales | 134.515.008 (135M) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 384 tokens (secuencia de entrenamiento); hasta ~507 tokens para 7 discos en inferencia |
| Tipos de cuantizacion | No disponible (solo safetensors originales) |
| Idiomas soportados | Ingles |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura transformer decoder-only de SmolLM2-135M-Instruct, una familia optimizada para dispositivos de bajos recursos. El entrenamiento es un full fine-tuning (FFT) de 300 pasos con batch efectivo de 16 (4 × 4 grad-accum), learning rate de 5e-5 con scheduler cosine y 5% de warmup, y longitud de secuencia de 384 tokens. Los datos provienen del dataset `ivykopal/nlp-2026-hanoi` e incluyen trayectorias óptimas de puzzles de 2 a 5 discos, de las cuales un 20% están corruptas (un movimiento intercambiado, reemplazado, eliminado o insertado). No se aplica RLHF ni DPO; el objetivo es únicamente imitar la distribución supervisada, por lo que el modelo hereda la tasa de error por movimiento de sus demostraciones.

## Capacidades

- Generacion de secuencias de movimientos optimos para Tower of Hanoi de 2 a 5 discos en formato `A->C` (una linea por movimiento).
- Resolucion de puzzles con permutaciones de picos no vistas en entrenamiento (heldout) con una tasa de exito del 0,58.
- Capacidad de seguir formato estricto: devuelve solo la secuencia de movimientos sin explicacion, como requiere el prompt de sistema.
- Soporte de chat multi-turno basico a traves de `apply_chat_template` de transformers.
- No dispone de tool calling, vision, audio ni capacidades de razonamiento general.

## Casos de uso

- **Estudio de propagacion de ruido en fine-tuning**: el modelo permite medir como el 20% de trayectorias corruptas en los datos de entrenamiento se traduce en una tasa de error por movimiento que se acumula en la cadena de generacion. Se usa en experimentos de laboratorio para cuantificar la sensibilidad del SFT al ruido de etiquetas.
- **Baseline SFT para entrenamiento RL (GRPO)**: sirve como punto de partida (cold start) para entrenar un modelo con reinforcement learning sobre la misma tarea, permitiendo comparar el rendimiento de SFT frente a RL en un entorno de razonamiento simbolico.
- **Estudio de extrapolacion de longitud**: el fallo sistematico en puzzles de 6 y 7 discos (tasa 0,00) documenta el fenomeno del "length prior" en modelos de lenguaje. Se usa como caso de estudio para investigar por que un modelo entrenado con secuencias cortas no generaliza a secuencias mas largas.
- **Investigacion de agentes simbolicos**: sirve como ejemplo de un modelo de lenguaje que actua como agente para resolver un puzzle discreto con restricciones (mover discos entre picos), permitiendo analizar la planificacion multi-paso en modelos pequenos.
- **Educacion en fine-tuning de LLMs**: por su tamano reducido y su licencia Apache-2.0, es un ejemplo reproducible de fine-tuning completo con datos de entrenamiento sinteticos, util en cursos de procesamiento del lenguaje natural para ilustrar el pipeline de SFT.
- **Benchmark de evaluacion de modelos**: puede usarse como tarea de referencia en la evaluacion de modelos de razonamiento algoritmico, ya que la solucion optima de la Torre de Hanoi tiene una longitud exacta y verificable (2^n - 1 movimientos).

## Benchmarks y rendimiento

Los datos de evaluacion se obtienen con decodificacion greedy, una generacion por puzzle, sobre puzzles heldout (3-5 discos) y de extrapolacion (6-7 discos). La tasa de solucion (`solved_rate`) indica que la trayectoria generada mueve todos los discos al pico objetivo; la tasa de optimalidad coincide con la de solucion en este problema.

| Discos | Heldout solved | Extrapolation solved |
|---|---|---|
| 3 | 0,75 | — |
| 4 | 0,17 | — |
| 5 | 0,83 | — |
| 6 | — | 0,00 |
| 7 | — | 0,00 |
| **Overall** | **0,58** | **0,00** |

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada**: el modelo tiene 134,5 millones de parametros, lo que supone aproximadamente 540 MB en FP32 y 270 MB en FP16. Con overhead de activaciones y tokens de entrada, se necesita menos de 1 GB de VRAM para inferencia.
- **GPUs recomendadas**: cabe en cualquier GPU consumer moderna (NVIDIA GTX 1060, RTX 3060, RTX 4090) e incluso en CPU con llama.cpp. No se requiere hardware especializado.
- **Opciones de despliegue**: compatible con `transformers` (Python), `llama.cpp`, `Ollama`, `vLLM` y `Text Generation Inference` (TGI) por su compatibilidad con el pipeline de text-generation.
- **Latencia y throughput**: no disponible. Dado su tamano, se espera una latencia de pocos milisegundos por token en GPU y de decenas en CPU, aunque no se han publicado mediciones concretas.

## Comparativa con modelos similares

No se ha encontrado ningun modelo publicamente comparable especializado en resolver Tower of Hanoi. La comparacion mas relevante es con el modelo base `SmolLM2-135M-Instruct`, del que hereda la arquitectura y el tokenizer:

| Modelo | Parametros | Contexto | Tarea | Resultado en Hanoi | Licencia |
|---|---|---|---|---|---|
| `ivykopal/nlp-2026-hanoi-sft` | 135M | 384 | Tower of Hanoi | 0,58 heldout, 0,00 extrapolacion | Apache-2.0 |
| `HuggingFaceTB/SmolLM2-135M-Instruct` | 135M | 2048 (estimado) | Chat general | No entrenado para Hanoi | Apache-2.0 |

Otras alternativas como `Qwen2.5-0.5B-Instruct` o `Llama-3.2-1B` son modelos generales de mayor tamano, pero no se ha verificado su rendimiento en esta tarea especifica, por lo que no se pueden comparar numericamente.

## Limitaciones y advertencias

- **No es un asistente general**: el modelo solo produce secuencias de movimientos de la Torre de Hanoi; cualquier otra consulta producira salidas sin sentido.
- **Fallo de extrapolacion**: entrenado con un maximo de 31 movimientos (5 discos), el modelo emite exactamente 31 movimientos para puzzles de 6 o 7 discos y se detiene, produciendo soluciones incorrectas (tasa de exito 0,00).
- **Herencia de ruido de entrenamiento**: el 20% de trayectorias corruptas en los datos de entrenamiento se refleja en una tasa de error por movimiento que se acumula en la cadena de generadas, reduciendo la fiabilidad en puzzles de 4 discos (0,17 de exito).
- **Dependencia del formato**: requiere el prompt de sistema exacto con instrucciones de formato; cambios en el prompt pueden degradar el rendimiento.
- **Idioma**: solo soporta ingles; no se ha evaluado en otros idiomas.
- **Uso en produccion**: no recomendado. Es un modelo de investigacion con 0 descargas y 0 likes, sin validacion externa.
- **Licencia**: Apache-2.0 permite uso comercial, pero el modelo no es util fuera del contexto de investigacion de la Torre de Hanoi.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/ivykopal/nlp-2026-hanoi-sft)
- [Dataset de entrenamiento](https://huggingface.co/datasets/ivykopal/nlp-2026-hanoi)
- [Modelo base: SmolLM2-135M-Instruct](https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct)
