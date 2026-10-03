# 12384-0ashntoi/Qwen3-4B-Think-GRPO-MLX

## Resumen

Qwen3-4B-Think-GRPO-MLX es un ajuste fino de la comunidad publicado por el usuario 12384-0ashntoi sobre Qwen/Qwen3-4B-Instruct-2507. El autor parte de un checkpoint SFT intermedio (con LoRA de razonamiento "furry/uwu") y lo optimiza mediante GRPO con LoRA sobre las cuatro ultimas capas del transformer, usando el conjunto de datos GSM8K de aritmetica de nivel escolar. El objetivo declarado es que el modelo emita siempre una traza de razonamiento explicita delimitada por las etiquetas `<think>` y `</think>` seguida de una respuesta final.

Se trata de un modelo denso de aproximadamente 4.022 millones de parametros (4B), distribuido en formato MLX y, por tanto, orientado a ejecucion local en Apple Silicon. El entrenamiento se realizo en un Apple M3 Pro con 36 GB de memoria unificada, con 256 iteraciones de GRPO de LoRA (rank 8, escala 16), batch size 1 y group size 2. Dos recompensas de regla de igual peso guiaron la optimizacion: correccion numerica y cumplimiento estricto del formato `<think>`.

Su relevancia es principalmente experimental: es un ejemplo reproducible y documentado de aplicacion de GRPO sobre un modelo pequeno en hardware de consumo, y muestra tanto el potencial como los riesgos del ajuste por recompensas basadas en reglas (por ejemplo, hacking de recompensa y colapso de formato cuando se alcanza el limite de tokens antes de cerrar la etiqueta). Los resultados publicados corresponden a una muestra reducida de GSM8K y no deben extrapolarse a un rendimiento general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3); no MoE |
| Parametros totales | 4.022.468.096 (dato real de safetensors) |
| Longitud de contexto | No especificada en la informacion proporcionada; heredada del modelo base Qwen3-4B-Instruct-2507 |
| Tipos de cuantizacion | Pesos en MLX (repo de 8.1 GB, compatible con precision de 16 bits); checkpoint base de referencia en 4-bit (`mlx-community/Qwen3-4B-Instruct-2507-4bit`) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato MLX) |
| Libreria de inferencia | mlx / mlx-lm |
| Modelo base | Qwen/Qwen3-4B-Instruct-2507 |
| Dataset de entrenamiento | openai/gsm8k |
| Metodo de ajuste | GRPO con LoRA sobre las cuatro ultimas capas |
| Fecha de creacion | 2026-10-02 |

## Arquitectura y entrenamiento

La arquitectura es la de Qwen3-4B, un transformer denso (no MoE) de aproximadamente 4B parametros. El autor no modifica la arquitectura: parte de Qwen/Qwen3-4B-Instruct-2507, pasa por una conversion a MLX (`mlx-community/Qwen3-4B-Instruct-2507-4bit`) y aplica un ajuste GRPO (Group Relative Policy Optimization) con adaptadores LoRA unicamente sobre las cuatro ultimas capas del transformer. Los hiperparametros documentados son rank 8, escala 16, dropout 0, batch size 1, group size 2, ratio de aprendizaje 1e-7 y 256 iteraciones, con una longitud maxima de rollout de 256 tokens mas una continuacion en dos fases. Se conserva un LoRA heredado de la fase SFT (embeddings y cabeza de salida) que permanece activo pero congelado durante el GRPO.

Los datos de entrenamiento son GSM8K, particionado en 512 registros de entrenamiento, 64 de validacion y 128 de prueba. Se emplearon exactamente dos recompensas de regla con el mismo peso: correccion numerica (1.0) y cumplimiento estricto del formato `<think>` (1.0). No hubo recompensa de longitud ni de estilo. En 512 rollouts de entrenamiento, la correccion numerica fue del 34,8 %, el cumplimiento estricto de formato del 100 % y los marcadores de estilo furry/uwu aparecieron en el 99,6 % de los casos (son estadisticas de rollout, no de exactitud sobre datos retenidos). Una innovacion destacable en terminos de ingenieria practica es el uso de un checkpoint de referencia cuantizado a 4 bits para ajustar tanto la politica como la referencia en memoria unificada, con el caveat declarado por el autor de que los valores de KL registrados no son comparables con una referencia exacta de la misma precision.

## Capacidades

- Generacion de texto conversacional en ingles.
- Razonamiento aritmetico de nivel escolar (GSM8K), con trazas explicitas.
- Emision estructurada de una traza de razonamiento dentro de `<think>...</think>` seguida de una respuesta final.
- Estilo de prosa marcadamente "furry/uwu" heredado de la fase SFT (marcadores presentes en el 100 % de las evaluaciones).
- Mantenimiento de coherencia basica en prompts fuera de dominio (el autor reporta un caso con un prompt inusual sobre un "moonlight-jar" que genero un bloque `<think>` valido y un procedimiento final util).
- Soporte de plantilla de chat mediante `tokenizer.apply_chat_template` en mlx-lm.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponible (no se documenta).
- Capacidades multilingues: no; solo ingles declarado.
- Modo de vision o audio: no disponible.
- Modo "thinking" explicito basado en etiquetas de texto, no en una fase interna separada.

## Casos de uso

- Investigacion en RLHF/GRPO a pequena escala: replicar el pipeline completo (SFT + GRPO con LoRA) en un portatil Apple Silicon para estudiar el efecto de recompensas basadas en reglas sobre el formato y la correccion numerica.
- Estudio de "reward hacking" y colapso de formato: el comportamiento documentado (fallos de formato por alcanzar el limite de tokens antes de cerrar `</think>`) lo convierte en un caso de analisis util para quienes investigan robustez de objetivos de recompensa.
- Experimentacion con MLX y cuantizacion: sirve como ejemplo de como convivir con politica y referencia en 4 bits dentro de memoria unificada limitada (36 GB), util para quienes desarrollan en el ecosistema MLX.
- Evaluacion de transferencia de estilo: permite medir hasta que punto un estilo SFT (aqui furry/uwu) persiste a traves de una fase RL, gracias a la tasa de marcadores reportada (99,6 % en rollouts, 100 % en evaluacion).
- Prototipado de razonamiento aritmetico con salida auditable: en entornos internos no criticos, la traza `<think>` explicita facilita inspeccionar el proceso intermedio, aunque no debe confundirse con razonamiento interno autentico.
- Demostraciones educativas sobre limites de los modelos pequenos: util para ilustrar en clase por que un 4B ajustado con 512 ejemplos sinteticos y GSM8K no es apto para tareas de produccion de alta fiabilidad.
- Analisis comparativo de ajustes comunitarios: como punto de referencia frente a otros fine-tunes de Qwen3-4B para medir el impacto de un ajuste GRPO con LoRA ligero.

## Benchmarks y rendimiento

Evaluacion sobre los primeros 32 ejemplos retenidos de GSM8K, con decodificacion voraz y limite de 768 tokens:

| Metrica | Resultado |
|---|---|
| Exactitud numerica | 59,4 % (19/32) |
| Cumplimiento estricto de formato | 59,4 % (19/32) |
| Tasa de marcadores furry/uwu | 100 % (32/32) |

Estadisticas de rollout durante el entrenamiento (512 rollouts, no son exactitud sobre datos retenidos):

| Metrica | Resultado |
|---|---|
| Correccion numerica | 34,8 % |
| Cumplimiento estricto de formato | 100 % |
| Presencia de marcadores furry/uwu | 99,6 % |

No se han publicado resultados de otros benchmarks (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- Entrenamiento documentado: Apple M3 Pro con 36 GB de memoria unificada (politica y referencia en memoria unificada, referencia en 4 bits).
- Inferencia en MLX: requiere Apple Silicon (serie M). El repo pesa 8,1 GB, coherente con pesos de 16 bits; se necesita memoria unificada suficiente para pesos + KV cache + overhead (orientativamente 10-12 GB para 16 bits; alrededor de 3-4 GB si se cuantiza a 4 bits).
- No se documenta soporte CUDA: este checkpoint esta en formato MLX y no incluye pesos GGUF ni safetensors para PyTorch/CUDA.
- GPU consumer NVIDIA (RTX 4090, etc.): no soportada directamente por MLX; requeriria convertir los pesos a otro runtime (por ejemplo GGUF + llama.cpp), conversion no incluida en el repositorio.
- Opciones de despliegue documentadas: mlx-lm (via `load` y `generate`) y LM Studio (instalando el modelo como modelo local separado y usando el system prompt indicado).
- No se documentan opciones de despliegue en vLLM, TGI u Ollama.
- Latencia y throughput: no disponible en la informacion proporcionada.
- Recomendacion de longitud de generacion: el autor advierte que las trazas largas pueden alcanzar el limite de tokens antes de cerrar `</think>`; recomienda aumentar `max_tokens` (la evaluacion uso 768) o anadir un control de parada/longitud.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Datos de rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| 12384-0ashntoi/Qwen3-4B-Think-GRPO-MLX | 4,02B | Denso, MLX | No especificado en la ficha | GSM8K: 59,4 % (19/32) exactitud numerica | Apache 2.0 | MLX / LM Studio |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B aprox. | Denso | No disponible en la busqueda | No disponible en la busqueda | Apache 2.0 | HF, LM Studio, Qualcomm AI Hub |
| Qwen/Qwen3-4B-Thinking-2507 | 4B aprox. | Denso, variante "thinking" | No disponible en la busqueda | No disponible en la busqueda | Apache 2.0 | HF |

Los datos de rendimiento de los modelos de comparacion no estan disponibles en la informacion proporcionada, por lo que no se incluyen cifras concretas. La diferencia funcional clave frente al modelo base es la especializacion en salida con etiquetas `<think>` mediante GRPO, a costa de un estilo de prosa sesgado (furry/uwu) y de una mayor fragilidad de formato.

## Limitaciones y advertencias

- Dataset de SFT pequeno y sintetico, y GSM8K como fuente estrecha de datos aritmeticos; el modelo no esta validado fuera de ese dominio.
- Las trazas largas pueden repetirse, entrar en bucle o alcanzar el limite de tokens antes de cerrar `</think>`; en la evaluacion, todos los fallos de formato estricto se debieron a este motivo.
- La optimizacion por reglas puede producir hacking de recompensa o formateo fragil.
- El modelo puede cometer errores aritmeticos, logicos y factuales.
- Las trazas explicitas son texto generado, no razonamiento interno autentico del modelo.
- Hereda sesgos y limitaciones de Qwen y de los datos de entrenamiento.
- Solo soporta ingles; no se documenta soporte multilingue.
- Licencia Apache 2.0: permite uso comercial segun los terminos de dicha licencia, pero el autor no ofrece garantias y recomienda no usarlo para orientacion medica, legal, financiera ni otras areas de alto riesgo.
- Estilo de prosa furry/uwu incorporado de forma sistematica (100 % de las evaluaciones), lo que puede ser inadecuado en contextos profesionales sin post-procesado o filtrado.
- Repositorio con 0 descargas y 0 "me gusta" en el momento de la consulta; no hay evidencia de uso ni validacion comunitaria independiente.
- El sistema de referencia usado para calcular KL no es una referencia exacta de la misma precision, segun el propio autor, lo que limita la interpretabilidad de esas metricas de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/12384-0ashntoi/Qwen3-4B-Think-GRPO-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint MLX base en 4 bits: https://huggingface.co/mlx-community/Qwen3-4B-Instruct-2507-4bit
- Variante oficial de razonamiento de la familia: https://huggingface.co/Qwen/Qwen3-4B-Thinking-2507
- Familia Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Ficha de Qwen3-4B en LM Studio: https://lmstudio.ai/models/qwen/qwen3-4b-2507
- Familia Qwen3 en LM Studio: https://lmstudio.ai/models/qwen3
- Qwen3-4B en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b
- Dataset GSM8K: https://huggingface.co/datasets/openai/gsm8k
- Artefactos del proyecto (ejemplos completos y `grpo-evaluation.md`): no disponible (el autor los menciona sin enlace publico en la informacion proporcionada)
