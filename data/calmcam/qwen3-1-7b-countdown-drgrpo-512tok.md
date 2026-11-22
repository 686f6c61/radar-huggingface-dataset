# calmcam/Qwen3-1.7B-Countdown-DrGRPO-512tok

## Resumen

Qwen3-1.7B-Countdown-DrGRPO-512tok es un ajuste fino del modelo Qwen3-1.7B de Alibaba Qwen, publicado por el usuario calmcam en Hugging Face. El modelo ha sido entrenado con Dr.GRPO (una variante de GRPO sin penalizacion KL) mediante aprendizaje por refuerzo con recompensa verificable (RLVR) sobre el rompecabezas numerico Countdown, en el que se deben combinar 3 o 4 numeros con operaciones aritmeticas basicas para alcanzar un objetivo. El entrenamiento se realizo durante 80 pasos con un presupuesto de 512 tokens de finalizacion (razonamiento mas respuesta).

Se trata de un checkpoint de investigacion, no de un modelo de proposito general: forma parte de una serie de cuatro variantes que comparan GRPO frente a Dr.GRPO con presupuestos de 256 y 512 tokens, entrenadas sobre la misma secuencia de prompts y con la misma semilla. Su relevancia radica en que demuestra como el RL con recompensa verificable puede multiplicar la precision de un modelo de 1.700 millones de parametros en una tarea aritmetica acotada, pasando de un 15,7 % de acierto en una muestra con el modelo base a un 57,5 %.

La arquitectura subyacente es la de Qwen3-1.7B, un transformer decoder-only denso con modo de razonamiento explicito (thinking mode) mediante etiquetas `<think>`. El modelo solo esta entrenado y evaluado para el formato de prompt especifico de Countdown; fuera de ese dominio su utilidad es limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen3) con modo thinking |
| Parametros totales | 1.720.574.976 (1,72 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (heredada de Qwen3-1.7B; no especificada en la informacion) |
| Tipos de cuantizacion | No disponible en la informacion (pesos en bfloat16; el repo no publica variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Ingles (declarado en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only denso de 1,72 mil millones de parametros con soporte nativo de modo de razonamiento (thinking mode) mediante etiquetas `<think>...</think>`. El ajuste es de parametros completos (full-parameter fine-tuning) sobre el modelo base, sin penalizacion KL, empleando el algoritmo Dr.GRPO: la ventaja se calcula como la recompensa menos la media del grupo, con recompensa verificable binaria sobre la correccion de la ecuacion producida.

El entrenamiento consistio en 80 pasos de RL sobre el conjunto de datos longphann/Countdown-Tasks-3to4, con un presupuesto de finalizacion de 512 tokens que incluye tanto el razonamiento como la respuesta final. La evaluacion se realiza deteniendo la generacion en `</answer>`. Se trata de uno de cuatro checkpoints de un estudio controlado (GRPO frente a Dr.GRPO, con presupuestos de 256 y 512 tokens) entrenados sobre la misma secuencia de prompts y con la misma semilla, lo que permite aislar el efecto del algoritmo y del presupuesto de tokens. No se especifica en la informacion el numero total de problemas de entrenamiento ni la composicion exacta del dataset mas alla de su procedencia.

## Capacidades

- Generacion de texto y razonamiento aritmetico acotado: resuelve el rompecabezas Countdown combinando 3 o 4 numeros con `+ - * /` para alcanzar un objetivo.
- Razonamiento explicito en modo thinking: produce trazas internas dentro de `<think>...</think>` antes de emitir la ecuacion final en `<answer>...</answer>`.
- Generacion con muestreo estocastico: el modelo esta calibrado para temperatura 1.0 y top-p 1.0, lo que permite obtener multiples muestras por problema (util para mean@4 y pass@4).
- Formato de salida estructurado: la respuesta final se delimita con etiquetas XML, lo que facilita el parseo automatico en pipelines.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso general: no disponible; el modelo esta especializado en una unica tarea.
- Capacidades multilingues: solo ingles declarado.
- Capacidades de vision o audio: no disponibles.

## Casos de uso

- Evaluacion de algoritmos de RL: el modelo sirve como punto de comparacion controlado frente a las variantes GRPO-256tok, GRPO-512tok y DrGRPO-256tok, permitiendo medir el efecto del algoritmo y del presupuesto de tokens con la misma semilla y secuencia de prompts.
- Investigacion en RLVR (reinforcement learning with verifiable rewards): entorno reproducible para estudiar como una recompensa binaria verificable transforma el comportamiento de un modelo pequeno en tareas aritmeticas.
- Generacion de datos sinteticos de razonamiento: las trazas `<think>` producidas pueden filtrarse por correccion y reutilizarse como datos de entrenamiento para modelos mayores o para destilacion.
- Benchmark interno de parsing estructurado: las etiquetas `<answer>` permiten validar pipelines de extraccion y verificacion automatica de expresiones aritmeticas en produccion.
- Prototipado de sistemas de resolucion de puzzles numericos: util en entornos educativos o de ocio donde se requiera resolver variantes de Countdown con verificacion automatica de la solucion.
- Estudio de eficiencia de tokens: con una longitud media de 382 tokens y un 44 % de muestras que agotan el presupuesto, el modelo es un caso de estudio sobre como el presupuesto de finalizacion afecta a la precision en modelos pequenos.
- Pruebas de inferencia en hardware modesto: al ser un modelo de 1,72 B en bfloat16, permite experimentar con RL fine-tuning e inferencia en una unica GPU consumer.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de longphann/Countdown-Tasks-3to4 (1024 problemas: 490 con 3 numeros, 534 con 4), con presupuesto de 512 tokens, temperatura 1.0, top-p 1.0 y parada en `</answer>`. Los valores no estan verificados de forma independiente.

| Metrica | Qwen3-1.7B (base) | Este modelo |
|---|---|---|
| Precision, 1 muestra (%) | 15,7 | 57,5 |
| Precision, mean@4 (%) | 15,2 ± 0,5 | 56,3 ± 0,4 |
| pass@4 (%) | 34,5 | 66,1 |
| Problemas de 3 numeros, mean@4 (%) | 29,2 | 85,1 |
| Problemas de 4 numeros, mean@4 (%) | 2,4 | 29,9 |
| Muestras que agotan el presupuesto de tokens (%) | 81 | 44 |
| Longitud media de finalizacion (tokens) | 496 | 382 |

Comparativa de los cuatro checkpoints de la serie:

| Modelo | Metodo | Presupuesto | Precision 1 muestra (%) | mean@4 (%) | pass@4 (%) |
|---|---|---|---|---|---|
| Qwen3-1.7B-Countdown-GRPO-256tok | GRPO | 256 | 55,6 | 56,6 | 69,1 |
| Qwen3-1.7B-Countdown-GRPO-512tok | GRPO | 512 | 61,7 | 61,5 | 71,6 |
| Qwen3-1.7B-Countdown-DrGRPO-256tok | Dr.GRPO | 256 | 48,7 | 50,5 | 64,0 |
| Qwen3-1.7B-Countdown-DrGRPO-512tok (este modelo) | Dr.GRPO | 512 | 57,5 | 56,3 | 66,1 |

Evolucion de la precision (1 muestra, split de test) durante el entrenamiento:

| Paso | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 |
|---|---|---|---|---|---|---|---|---|---|
| Precision (%) | 15,1 | 45,2 | 53,4 | 53,8 | 55,4 | 54,7 | 54,4 | 56,2 | 57,5 |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos, mas overhead de activaciones y cache KV; en la practica, entre 5 y 7 GB para secuencias de 512 tokens.
- VRAM estimada en cuantizacion de 8 bits: en torno a 2 GB para pesos; en 4 bits, cerca de 1 GB. No se publican variantes cuantizadas oficiales en el repo.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090). Para despliegue en servidor, A100 o H100 no son necesarias pero ofrecen mayor throughput.
- Cabe en GPU consumer: si, en practicamente cualquier GPU consumer moderna con 8 GB o mas en bfloat16, y en GPUs de 4-6 GB con cuantizacion.
- Opciones de despliegue: transformers (referencia oficial), vLLM (el autor incluye `SamplingParams` de ejemplo), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible` en el repo). No se menciona soporte explicito de llama.cpp u Ollama al no publicarse GGUF.
- Latencia y throughput: no disponibles en la informacion. La longitud media de finalizacion de 382 tokens con un presupuesto de 512 da una idea del coste computacional por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Precision (mean@4) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3-1.7B-Countdown-DrGRPO-512tok | 1,72 B | No disponible | Countdown 3-4 numeros | 56,3 % | Apache 2.0 | Hugging Face |
| Qwen3-1.7B-Countdown-GRPO-512tok | 1,72 B | No disponible | Countdown 3-4 numeros | 61,5 % | Apache 2.0 | Hugging Face |
| Qwen3-1.7B-Countdown-GRPO-256tok | 1,72 B | No disponible | Countdown 3-4 numeros | 56,6 % | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1,72 B | No disponible | Proposito general | 15,2 % (en Countdown) | Apache 2.0 | Hugging Face |

Dentro de la misma serie, el checkpoint GRPO-512tok supera a este modelo en todas las metricas (61,5 % frente a 56,3 % en mean@4; 71,6 % frente a 66,1 % en pass@4), lo que sugiere que, en este regimen de 80 pasos y 512 tokens, GRPO con penalizacion KL rinde mejor que Dr.GRPO. No se dispone de comparaciones con modelos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion extrema: el modelo solo fue entrenado y evaluado con el formato de prompt de Countdown descrito; otros formatos obtendran puntuaciones inferiores. No es apto como asistente general.
- Idioma: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta evaluado y previsiblemente sera pobre.
- Dependencia del presupuesto de tokens: el 44 % de las muestras agotan el presupuesto de 512 tokens, y el modelo base falla mayoritariamente por falta de tokens. Presupuestos mas bajos degradan la precision.
- Configuracion de generacion: `generation_config.json` conserva los valores de Qwen3 (temperatura 0,6, top-k 20, top-p 0,95), que no se usaron en entrenamiento ni evaluacion; llamar a `generate()` sin argumentos produce un muestreo distinto y no se detiene en `</answer>`. Es imprescindible pasar los parametros del ejemplo.
- Alucinacion: aunque la tarea tiene recompensa verificable, el modelo puede producir expresiones aritmeticamente invalidas o que no usan cada numero exactamente una vez; la verificacion automatica de la ecuacion es obligatoria en produccion.
- Sesgos: no se documentan evaluaciones de sesgo; al derivar de Qwen3-1.7B hereda los sesgos del modelo base y de sus datos de preentrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo es un artefacto de investigacion sin garantias de calidad fuera de su dominio.
- Sin verificacion independiente: los resultados de benchmarks son declarados por el autor (`verified: false`) y no han sido replicados por terceros.
- Sin cuantizaciones oficiales publicadas: el repositorio solo contiene pesos safetensors en transformers; para llama.cpp u Ollama habria que convertir los pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-DrGRPO-512tok
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/longphann/Countdown-Tasks-3to4
- Checkpoint GRPO-256tok: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-GRPO-256tok
- Checkpoint GRPO-512tok: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-GRPO-512tok
- Checkpoint DrGRPO-256tok: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-DrGRPO-256tok
