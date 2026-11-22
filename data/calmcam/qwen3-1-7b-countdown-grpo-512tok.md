# calmcam/Qwen3-1.7B-Countdown-GRPO-512tok

## Resumen
Qwen3-1.7B-Countdown-GRPO-512tok es un ajuste fino del modelo Qwen/Qwen3-1.7B realizado por el usuario calmcam mediante aprendizaje por refuerzo con recompensa verificable (RLVR), concretamente con el algoritmo GRPO (Group Relative Policy Optimization) sin penalizacion KL. El modelo esta especializado en resolver el puzzle numerico Countdown: dado un conjunto de 3 o 4 numeros y un objetivo, debe construir una expresion aritmetica con `+`, `-`, `*` y `/` que use cada numero como maximo una vez y alcance el objetivo.

El ajuste se realizo durante 80 pasos sobre el conjunto de datos longphann/Countdown-Tasks-3to4, con un presupuesto de generacion de 512 tokens que incluye tanto el razonamiento (etiquetas `<think>`) como la respuesta final (`<answer>`). Forma parte de una familia de cuatro checkpoints que comparan GRPO frente a Dr.GRPO con presupuestos de 256 y 512 tokens, entrenados exactamente con la misma secuencia de prompts y semilla.

Su relevancia es doble: por un lado demuestra que el RL con recompensa verificable puede elevar drasticamente el rendimiento en tareas de razonamiento matematico acotado en modelos pequenos (de 15,7% a 61,7% en una muestra); por otro, sirve como referencia metodologica para estudiar el efecto del presupuesto de tokens y de la variante del algoritmo en el entrenamiento RLVR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3-1.7B; no se especifica en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible (pesos publicados en bfloat16; el repo no documenta cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento
El modelo parte de Qwen/Qwen3-1.7B, un transformer decoder-only de 1.720.574.976 parametros, y se somete a un ajuste fino de parametros completos (full-parameter fine-tuning) sin penalizacion KL. El algoritmo empleado es GRPO, con ventaja calculada como `(r − media del grupo) / desviacion estandar del grupo`, lo que evita la necesidad de un modelo critico separado. La recompensa es verificable: se comprueba si la expresion producida dentro de `<answer>` es aritmeticamente correcta y respeta las restricciones de uso de numeros y operadores.

El entrenamiento consta de 80 pasos sobre el dataset longphann/Countdown-Tasks-3to4, con un presupuesto de finalizacion de 512 tokens (razonamiento mas respuesta). El modelo se entreno y evaluo exclusivamente con una plantilla de prompt concreta (mensaje de sistema `You are a helpful assistant.` y un mensaje de usuario con instrucciones de formato `<think>`/`<answer>`), aplicando la plantilla de chat de Qwen3 con `add_generation_prompt=True` en modo thinking. No se documento el numero total de tokens de entrenamiento ni la composicion detallada del dataset mas alla de su procedencia.

## Capacidades
- Generacion de expresiones aritmeticas para el puzzle Countdown con 3 o 4 numeros y operadores `+ - * /`.
- Razonamiento explicito en modo thinking: produce cadenas de razonamiento dentro de `<think> </think>` antes de la respuesta final.
- Salida estructurada con etiquetas `<answer> </answer>`, lo que facilita el parseo automatico y la verificacion programatica.
- Generacion de multiples muestras por problema (evaluado con 4 muestras por problema), lo que permite estrategias de best-of-n y pass@k.
- Capacidad de detenerse en el token `</answer>` cuando se configura `stop_strings`, reduciendo generacion innecesaria.
- Soporte de inferencia con transformers y con vLLM mediante `SamplingParams` (temperatura 1.0, top-p 1.0, `stop=["</answer>"]`).
- Capacidades generales del modelo base Qwen3-1.7B potencialmente degradadas por el ajuste RL especifico; no se documenta tool calling, agentes ni vision en la informacion proporcionada.

## Casos de uso
- Evaluacion de tecnicas RLVR: el checkpoint sirve como referencia reproducible para comparar GRPO frente a Dr.GRPO con presupuestos de 256 y 512 tokens, ya que los cuatro modelos se entrenaron con la misma secuencia de prompts y semilla.
- Generacion de datos sinteticos de razonamiento matematico: el modelo produce trazas `<think>` y respuestas `<answer>` verificables que pueden filtrarse por correccion para construir datasets de entrenamiento supervisado.
- Investigacion sobre presupuesto de tokens: permite estudiar como el limite de 512 tokens afecta a la tasa de finalizacion (37% de muestras agotan el presupuesto) y a la precision en problemas de 3 y 4 numeros.
- Benchmark de juguete para pipelines de RL: su tarea acotada y su recompensa binaria verificable lo hacen adecuado como entorno de pruebas para infraestructura de entrenamiento con recompensas programaticas.
- Demostracion de ajuste fino eficiente en modelos pequenos: con 1.720 millones de parametros y 80 pasos de GRPO se obtiene una mejora de 15,7% a 61,7% en una muestra, lo que ilustra el potencial del RLVR en modelos que caben en hardware de consumo.
- Analisis de robustez de formato: util para medir hasta que punto el modelo depende de la plantilla exacta de prompt y de los parametros de muestreo (temperatura 1.0, top-p 1.0) documentados por el autor.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test de longphann/Countdown-Tasks-3to4 (1024 problemas: 490 con 3 numeros, 534 con 4), presupuesto de 512 tokens, muestreo con temperatura 1.0 y top-p 1.0, parada en `</answer>`.

| Metrica | Qwen3-1.7B (base) | Qwen3-1.7B-Countdown-GRPO-512tok |
|---|---|---|
| Precision, 1 muestra (%) | 15,7 | 61,7 |
| Precision, mean@4 (%) | 15,2 ± 0,5 | 61,5 ± 0,4 |
| pass@4 (%) | 34,5 | 71,6 |
| Problemas de 3 numeros, mean@4 (%) | 29,2 | 87,6 |
| Problemas de 4 numeros, mean@4 (%) | 2,4 | 37,5 |
| Muestras que agotan el presupuesto de tokens (%) | 81 | 37 |
| Longitud media de finalizacion (tokens) | 496 | 317 |

Comparativa de los cuatro checkpoints de la familia:

| Modelo | Metodo | Presupuesto | Precision, 1 muestra (%) | mean@4 (%) | pass@4 (%) |
|---|---|---|---|---|---|
| Qwen3-1.7B-Countdown-GRPO-256tok | GRPO | 256 | 55,6 | 56,6 | 69,1 |
| Qwen3-1.7B-Countdown-GRPO-512tok (este modelo) | GRPO | 512 | 61,7 | 61,5 | 71,6 |
| Qwen3-1.7B-Countdown-DrGRPO-256tok | Dr.GRPO | 256 | 48,7 | 50,5 | 64,0 |
| Qwen3-1.7B-Countdown-DrGRPO-512tok | Dr.GRPO | 512 | 57,5 | 56,3 | 66,1 |

Evolucion de la precision (1 muestra, split de test) durante el entrenamiento:

| Paso | 0 | 10 | 20 | 30 | 40 | 50 | 60 | 70 | 80 |
|---|---|---|---|---|---|---|---|---|---|
| Precision (%) | 15,1 | 49,7 | 53,9 | 57,3 | 57,5 | 58,0 | 59,3 | 60,6 | 61,7 |

Nota: el error estandar indicado corresponde al muestreo sobre las 4 muestras, no a variabilidad entre semillas de entrenamiento. El modelo base con presupuesto de 1024 tokens alcanza 39,0% en una muestra, segun el autor.

## Requisitos de hardware
- VRAM estimada para inferencia en bfloat16: aproximadamente 3,5 GB solo para pesos (1.720.574.976 parametros × 2 bytes), mas el coste de la cache KV; en la practica se recomienda reservar entre 5 y 8 GB para contexto moderado.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 1,8-2,5 GB; en 4 bits: alrededor de 1,0-1,5 GB (estimaciones teoricas, no verificadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para bfloat16 (RTX 3060 Ti, RTX 4060 Ti, RTX 3070 en adelante); A100, H100 o L40S para despliegues de mayor throughput.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bfloat16 y en tarjetas con 4-6 GB si se cuantiza (aunque el repo no publica pesos GGUF).
- Opciones de despliegue: transformers (ejemplo oficial en la model card), vLLM (con `SamplingParams(temperature=1.0, top_p=1.0, max_tokens=512, stop=["</answer>"], include_stop_str_in_output=True)`), text-generation-inference (el modelo esta etiquetado como `text-generation-inference` y `endpoints_compatible`). No se documentan pesos GGUF ni soporte explicito de llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. La longitud media de finalizacion de 317 tokens en evaluacion da una referencia del coste tipico por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Precision en Countdown (1 muestra) | Licencia |
|---|---|---|---|---|---|
| Qwen3-1.7B-Countdown-GRPO-512tok | 1,72 B | no disponible | GRPO, 512 tokens | 61,7% | apache-2.0 |
| Qwen3-1.7B-Countdown-GRPO-256tok | 1,72 B | no disponible | GRPO, 256 tokens | 55,6% | apache-2.0 |
| Qwen3-1.7B-Countdown-DrGRPO-512tok | 1,72 B | no disponible | Dr.GRPO, 512 tokens | 57,5% | apache-2.0 |
| Qwen3-1.7B (base) | 1,72 B | no disponible | preentrenamiento + post-entrenamiento Qwen | 15,7% (512 tokens) / 39,0% (1024 tokens) | apache-2.0 |

Las alternativas mas directamente comparables son los otros tres checkpoints de la misma familia, ya que comparten modelo base, datos y semilla. Frente a modelos de proposito general del mismo tamano (por ejemplo, otros modelos de la familia Qwen3-1.7B), este checkpoint esta especializado exclusivamente en Countdown y no se han publicado evaluaciones en benchmarks generales como MMLU o GSM8K en la informacion disponible.

## Limitaciones y advertencias
- Especializacion extrema: el modelo se entreno y evaluo solo con una plantilla de prompt concreta; otros formatos obtendran puntuaciones inferiores, segun el propio autor.
- Dependencia de parametros de muestreo: los resultados se midieron con temperatura 1.0, top-p 1.0 y parada en `</answer>`; el `generation_config.json` incluido es el de Qwen3 (temperatura 0,6, top-k 20, top-p 0,95) y no se uso en entrenamiento ni evaluacion, por lo que llamar a `generate()` sin argumentos produce un comportamiento distinto y no se detiene en `</answer>`.
- Rendimiento limitado en problemas de 4 numeros: solo 37,5% de precision mean@4 frente a 87,6% en problemas de 3 numeros, lo que indica dificultad con espacios de busqueda mayores.
- Agotamiento del presupuesto: el 37% de las muestras alcanzan el limite de 512 tokens, lo que puede truncar el razonamiento en casos complejos.
- Riesgo de alucinacion: aunque la recompensa es verificable, el modelo puede producir expresiones que parecen validas pero incumplen las restricciones de uso unico de numeros u operadores; se recomienda verificacion programatica de la salida.
- Idioma: solo se declara soporte de ingles (`en`); no hay evidencia de rendimiento en castellano ni en otros idiomas.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada; al derivar de Qwen3-1.7B, puede heredar sesgos del modelo base y de los datos de preentrenamiento.
- Uso comercial: la licencia apache-2.0 permite uso comercial, pero la utilidad practica del modelo esta restringida a la tarea Countdown y a la plantilla documentada.
- Sin datos de benchmarks generales: no se han publicado resultados en MMLU, HumanEval, GSM8K ni otras evaluaciones estandar, por lo que no se puede afirmar que las capacidades generales del modelo base se conserven tras el ajuste RL.
- Modelo con cero descargas y cero likes en el momento de la consulta: no hay evidencia de validacion independiente por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-GRPO-512tok
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/longphann/Countdown-Tasks-3to4
- Checkpoint GRPO 256 tokens: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-GRPO-256tok
- Checkpoint Dr.GRPO 256 tokens: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-DrGRPO-256tok
- Checkpoint Dr.GRPO 512 tokens: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-DrGRPO-512tok
