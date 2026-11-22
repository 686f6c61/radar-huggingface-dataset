# calmcam/Qwen3-1.7B-Countdown-GRPO-256tok

## Resumen

Qwen3-1.7B-Countdown-GRPO-256tok es un ajuste fino del modelo Qwen3-1.7B de Alibaba, desarrollado por el usuario calmcam, especializado en resolver el puzle aritmetico Countdown: dado un conjunto de tres o cuatro numeros y un objetivo, producir una expresion con `+ - * /` que use cada numero como maximo una vez y alcance el objetivo. El modelo se entrena mediante GRPO (Group Relative Policy Optimization) con recompensa verificable (RLVR) y sin penalizacion KL, durante 80 pasos y con un presupuesto de generacion de 256 tokens que cubre tanto el razonamiento como la respuesta final.

El interes de este checkpoint no reside en sus capacidades generales, sino en su valor como experimento controlado de aprendizaje por refuerzo: forma parte de una serie de cuatro modelos que comparan GRPO frente a Dr.GRPO con presupuestos de 256 y 512 tokens, entrenados sobre exactamente la misma secuencia de prompts y con la misma semilla. El resultado es un incremento dramatico de precision en una tarea concreta: pasa del 0,3 % de acierto con una muestra del modelo base al 55,6 %, y del 0,5 % al 69,1 % en pass@4.

Arquitectonicamente hereda la estructura transformer densa de Qwen3-1.7B, con 1.720.574.976 parametros y modo de pensamiento nativo (etiquetas `<think>`). Su licencia Apache 2.0 y su reducido tamano (3,5 GB en safetensors) lo hacen facil de desplegar, pero conviene subrayar que es un modelo de proposito muy especifico: fuera del formato de prompt de entrenamiento su rendimiento cae.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3-1.7B) con modo thinking nativo |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (pesos en bfloat16; el repositorio no publica GGUF) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-1.7B, un transformer denso de 1.720 millones de parametros con tokenizador y plantilla de chat propias de la familia Qwen3, incluyendo el modo de pensamiento por defecto que delimita el razonamiento con `<think> </think>` y la respuesta con `<answer> </answer>`. El ajuste fino es de parametros completos (full-parameter fine-tuning), no LoRA, y no emplea penalizacion KL.

El entrenamiento usa GRPO con recompensa verificable: la ventaja se calcula como (r − media del grupo) / desviacion tipica del grupo, y la recompensa depende de si la expresion producida es correcta segun el verificador de Countdown. Se ejecutan 80 pasos sobre el dataset longphann/Countdown-Tasks-3to4, con un presupuesto de completado de 256 tokens (razonamiento mas respuesta) y sampling a temperatura 1.0, top-p 1.0. La innovacion metodologica es la comparacion controlada: los cuatro checkpoints de la serie (GRPO y Dr.GRPO a 256 y 512 tokens) se entrenan sobre la misma secuencia de prompts y con la misma semilla, lo que permite aislar el efecto del algoritmo y del presupuesto de tokens.

## Capacidades

- Resolucion del puzle Countdown: genera expresiones aritmeticas con `+ - * /` que usan cada numero como maximo una vez y alcanzan el objetivo indicado.
- Razonamiento aritmetico de varios pasos dentro de las etiquetas `<think>`, con la ecuacion final encapsulada en `<answer>`.
- Ajuste al presupuesto de tokens: el modelo fue entrenado para mantener el razonamiento por debajo de un limite declarado (256 tokens), y de media consume 180 tokens por completado.
- Generacion muestreada con diversidad: pensado para evaluarse con multiple sampling (mean@4, pass@4) a temperatura 1.0.
- Capacidades generales de Qwen3-1.7B potencialmente presentes (generacion de texto conversacional, conocimiento general), aunque no evaluadas ni garantizadas tras el ajuste.
- No se documenta soporte de tool calling, function calling, uso de agentes, vision, audio ni capacidades multilingues mas alla del ingles.

## Casos de uso

- Evaluacion de algoritmos de RL: sirve como punto de comparacion reproducible frente a Dr.GRPO y a distintos presupuestos de tokens, gracias a que los cuatro checkpoints comparten prompts y semilla. Util para investigacion en RLVR.
- Generacion de datos sinteticos de razonamiento aritmetico: el modelo produce trazas `<think>` con expresiones verificables que pueden filtrarse por correccion y reutilizarse para entrenar modelos mayores.
- Verificacion de pipelines de recompensa: al ser una tarea con verificador determinista, permite validar implementaciones de GRPO, calculo de ventajas y funciones de recompensa antes de escalar a modelos grandes.
- Benchmark interno de inferencia: con 1,7 mil millones de parametros y generaciones de unos 180 tokens, es adecuado para medir latencia y throughput de frameworks (transformers, vLLM) en hardware modesto.
- Demostracion educativa de RLHF/RLVR: ilustra de forma tangible como el RL con recompensa verificable transforma un modelo base de 0,3 % a 55,6 % de acierto en una tarea acotada.
- Prototipado de asistentes de calculo acotado: en entornos donde se plantean problemas del tipo "con estos numeros, alcanza este objetivo", puede integrarse como componente especializado siempre que se respete estrictamente el formato de prompt de entrenamiento.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el split de test de longphann/Countdown-Tasks-3to4 (1024 problemas: 490 con 3 numeros, 534 con 4), presupuesto de 256 tokens, temperatura 1.0, top-p 1.0, parada en `</answer>`.

| Metrica | Qwen3-1.7B (base) | Este modelo |
|---|---|---|
| Precision, 1 muestra (%) | 0,3 | 55,6 |
| Precision, mean@4 (%) | 0,1 ± 0,1 | 56,6 ± 0,4 |
| pass@4 (%) | 0,5 | 69,1 |
| Problemas de 3 numeros, mean@4 (%) | 0,3 | 84,0 |
| Problemas de 4 numeros, mean@4 (%) | 0,0 | 31,5 |
| Muestras que agotan el presupuesto de tokens (%) | 100 | 42 |
| Longitud media de completado (tokens) | 256 | 180 |

Comparacion dentro de la serie de cuatro checkpoints:

| Modelo | Metodo | Presupuesto | Precision 1 muestra (%) | mean@4 (%) | pass@4 (%) |
|---|---|---|---|---|---|
| GRPO-256tok (este modelo) | GRPO | 256 | 55,6 | 56,6 | 69,1 |
| GRPO-512tok | GRPO | 512 | 61,7 | 61,5 | 71,6 |
| DrGRPO-256tok | Dr.GRPO | 256 | 48,7 | 50,5 | 64,0 |
| DrGRPO-512tok | Dr.GRPO | 512 | 57,5 | 56,3 | 66,1 |

Evolucion de la precision (1 muestra) durante el entrenamiento: paso 0: 0,3 %; 10: 21,1 %; 20: 34,0 %; 30: 40,8 %; 40: 48,6 %; 50: 51,2 %; 60: 53,1 %; 70: 54,7 %; 80: 55,6 %. Como referencia, el modelo base con presupuesto de 1024 tokens alcanza el 39,0 % con una muestra.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: en torno a 3,5 GB solo para los pesos, mas overhead de activaciones y cache KV; un presupuesto practico de 6-8 GB es razonable para secuencias cortas.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060 Ti/4060 Ti, RTX 4070, RTX 4090, L4, A10, A100, H100). Para mayor throughput, A100/H100 con vLLM.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas en bfloat16; con cuantizacion a 8 o 4 bits cabria en GPUs de 4-6 GB, aunque el autor no publica pesos cuantizados.
- Opciones de despliegue: transformers (codigo de ejemplo en la model card) y vLLM (se documentan `SamplingParams(temperature=1.0, top_p=1.0, max_tokens=256, stop=["</answer>"], include_stop_str_in_output=True)`). El repositorio es compatible con text-generation-inference y endpoints, pero no se publican pesos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia de coste, la generacion media es de 180 tokens por completado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-1.7B-Countdown-GRPO-256tok (este) | 1,72 B | no disponible | Countdown, presupuesto 256 tokens | Apache 2.0 | Hugging Face |
| Qwen3-1.7B-Countdown-GRPO-512tok | 1,72 B | no disponible | Countdown, presupuesto 512 tokens; 61,7 % precision 1 muestra | Apache 2.0 | Hugging Face |
| Qwen3-1.7B-Countdown-DrGRPO-256tok | 1,72 B | no disponible | Countdown con Dr.GRPO; 48,7 % precision 1 muestra | Apache 2.0 | Hugging Face |
| Qwen3-1.7B (base) | 1,72 B | no disponible | Proposito general; 0,3 % en Countdown a 256 tokens, 39,0 % a 1024 tokens | Apache 2.0 | Hugging Face |

No se dispone de comparaciones con modelos de otros autores sobre la misma tarea en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo solo fue entrenado y evaluado con el formato de prompt exacto de la model card; otros formatos obtienen puntuaciones inferiores.
- Dependencia del presupuesto de tokens: el 42 % de las muestras agota los 256 tokens, y el rendimiento en problemas de 4 numeros (31,5 % mean@4) es mucho menor que en los de 3 (84,0 %).
- Los valores de `generation_config.json` son los originales de Qwen3 (temperatura 0,6, top-k 20, top-p 0,95) y no se usaron en entrenamiento ni evaluacion; llamar a `generate()` sin argumentos produce un sampling distinto y no se detiene en `</answer>`.
- Riesgo de alucinacion aritmetica: aunque el verificador filtra las respuestas en entrenamiento, en produccion no hay garantia de correccion; es imprescindible validar la expresion con un verificador externo.
- Idioma: solo se declara ingles; no hay evidencia de comportamiento multilingue tras el ajuste.
- Sesgos: no se documentan evaluaciones de sesgo, toxicidad ni robustez fuera de la tarea Countdown.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3-1.7B conviene revisar las condiciones de la licencia del modelo base y de los datos de entrenamiento.
- Resultados no verificados: las metricas del model-index estan marcadas como `verified: false` y el autor advierte que los intervalos son error de muestreo, no de semillas de entrenamiento.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validacion independiente por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-GRPO-256tok
- Checkpoint GRPO 512 tokens: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-GRPO-512tok
- Checkpoint Dr.GRPO 256 tokens: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-DrGRPO-256tok
- Checkpoint Dr.GRPO 512 tokens: https://huggingface.co/calmcam/Qwen3-1.7B-Countdown-DrGRPO-512tok
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/longphann/Countdown-Tasks-3to4
