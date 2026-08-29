# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-140000

## Resumen

`huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-140000` es un modelo de borrador (draft model) para decodificación especulativa, entrenado con el método EAGLE3 sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente: su única función es acelerar la inferencia del modelo objetivo prediciendo secuencias de tokens que el modelo base verifica en paralelo. Este checkpoint concreto corresponde al paso 140.000 de la época 6 de un entrenamiento online de 10 épocas y 231.810 pasos totales, realizado con SpecForge y datos ShareGPT limpios.

La relevancia de este modelo reside en que permite reducir la latencia de Qwen3-4B-Instruct-2507 en entornos de producción sin modificar la calidad de las respuestas, ya que el modelo base actúa como verificador. Con solo 202,7 millones de parámetros y una única capa decoder, es lo suficientemente ligero como para ejecutarse junto al modelo objetivo en la misma GPU. El autor publica 47 checkpoints en una colección, y este en particular usa la variante "NoWindow", que no aplica límite de ventana deslizante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, intermediate 9728, 32 cabezas de atencion, 8 cabezas KV) |
| Parametros totales | 202.700.416 (~202 M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens (maximo de secuencia usado en entrenamiento; el modelo base soporta mas, pero el draft no se entreno mas alla) |
| Tipos de cuantizacion | bfloat16 (pesos originales) |
| Idiomas soportados | No disponible (el modelo base es multilingue, pero el draft model no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo es un draft model EAGLE3, una arquitectura de decodificacion especulativa que usa una capa decoder ligera para predecir los siguientes tokens del modelo base. La capa tiene hidden size de 2560, intermediate size de 9728, 32 cabezas de atencion y 8 cabezas clave/valor, con un vocabulario de borrador de 32.000 tokens frente a los 151.936 del modelo objetivo. La atencion usa `sdpa` (scaled dot-product attention) y no se configura ventana deslizante en esta variante.

El entrenamiento se realizo con el metodo "Online EAGLE3" implementado en SpecForge, sobre un dataset ShareGPT limpio en formato JSONL (la revision del dataset no se registro). Los hiperparametros incluyen 10 épocas, 231.810 pasos de optimizador, batch global efectivo de 4, tasa de aprendizaje 1e-4 con warmup lineal del 1,5% y decaimiento coseno, y longitud maxima de secuencia de 2048 tokens. La longitud TTT (test-time training) de EAGLE3 se fijo en 7, y el backend objetivo es SGLang con FlashInfer. El checkpoint `epoch_6_step_140000` es uno de los 47 publicados, cada uno en un repositorio separado.

## Capacidades

- Decodificacion especulativa: predice multiples tokens por paso para que el modelo base Qwen3-4B-Instruct-2507 los verifique en paralelo, reduciendo la latencia de generacion.
- Integracion con SGLang: se usa como ruta de borrador especulativo con el algoritmo EAGLE3, configurando `--speculative-num-steps`, `--speculative-eagle-topk` y `--speculative-num-draft-tokens`.
- No es un modelo generativo standalone: no produce texto util por si mismo, solo secuencias candidatas de tokens.
- No incluye capacidades de tool calling, agentes, vision ni audio; estas dependen exclusivamente del modelo base.
- No soporta thinking mode, ya que el modelo base Qwen3-4B-Instruct-2507 tampoco lo incluye (solo entrenamiento instruct).

## Casos de uso

- Servir Qwen3-4B-Instruct-2507 con baja latencia en SGLang: el draft model se carga como `--speculative-draft-model-path` y el servidor genera con EAGLE3, logrando un throughput mayor en cargas de chat interactivo.
- Chatbots de atencion al cliente: al reducir la latencia por token, las respuestas se perciben mas fluidas en conversaciones multi-turno, manteniendo la calidad del modelo base.
- Generacion de codigo asistida en editores: al usar el modelo base para completar fragmentos de codigo, el draft model acelera la autocompletacion sin cambiar la distribucion de salida.
- Clasificacion y extraccion de informacion en pipelines batch: cuando se procesan miles de prompts, la decodificacion especulativa reduce el tiempo total de procesamiento en la misma infraestructura.
- Evaluacion de multiples checkpoints: los 47 repositorios permiten probar diferentes puntos de entrenamiento (épocas 0 a 9) para encontrar el equilibrio optimo entre tasa de aceptacion y coste de computo.
- Despliegue en entornos con GPU limitada: al ser un modelo de 202 M, puede residir en la misma GPU que el modelo base sin requerir hardware adicional, aprovechando al maximo la VRAM disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que "No evaluation or safety metrics were recorded for this run". No se proporcionan datos de tasa de aceptacion, latencia ni throughput. Se recomienda al usuario medir estos valores para su carga de trabajo concreta, ajustando los parametros de arbol de EAGLE3 (`--speculative-num-steps 3`, `--speculative-eagle-topk 1`, `--speculative-num-draft-tokens 4` como valores iniciales).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,4 GB en bfloat16 (202 M parametros). En la practica, el draft model se ejecuta junto al modelo base Qwen3-4B-Instruct-2507 (~8 GB en bf16), por lo que se necesita VRAM total de al menos 10-12 GB.
- GPU recomendadas: cualquier GPU consumer con 12 GB o mas (RTX 3060, RTX 4070, RTX 4090) o GPUs de datacenter (A10, A100, H100). El draft model en si cabe en cualquier GPU con 1 GB libre.
- El modelo base Qwen3-4B-Instruct-2507 requiere GPU con al menos 8 GB para cuantizacion bf16; con cuantizacion de 4 bits podria caber en 6 GB, pero el draft model no esta cuantizado y debe mantenerse en bf16.
- Opciones de despliegue: SGLang (recomendado por el autor, con backend FlashInfer), vLLM (si soporta EAGLE3 en la version usada). No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles. Dependen de la tasa de aceptacion del draft, que no se ha medido publicamente para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-140000 | 202 M | Draft EAGLE3 para Qwen3-4B-Instruct-2507 | 2048 (entrenamiento) | Apache 2.0 | HuggingFace |
| huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-155000 | 202 M (estimado) | Draft EAGLE3 para el mismo base, con ventana estandar | 2048 (entrenamiento) | Apache 2.0 | HuggingFace |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4 B | Modelo instruct standalone | 32.768 (segun documentacion de Qwen) | Apache 2.0 | HuggingFace |

La comparativa directa con otros draft models de la misma categoria no esta disponible, ya que el autor no publica metricas de rendimiento. La diferencia principal entre los checkpoints de la coleccion es el punto de entrenamiento (época y paso) y la variante con o sin ventana deslizante. Frente al modelo base, este draft model es 20 veces mas pequeño y no es util por si solo, pero complementa al base en entornos de servicion.

## Limitaciones y advertencias

- No es un modelo de chat: usarlo de forma aislada produce salidas sin sentido. Debe emparejarse siempre con el modelo base Qwen3-4B-Instruct-2507 exacto.
- Sin metricas de evaluacion: el autor no registro ninguna metrica de calidad, seguridad ni tasa de aceptacion. El rendimiento en produccion es impredecible sin pruebas previas.
- Datos de entrenamiento: ShareGPT puede contener sesgos y contenido generado por usuarios; no se realizo filtrado de seguridad adicional al entrenamiento.
- Longitud de contexto limitada: el entrenamiento usa maximo 2048 tokens. Para secuencias mas largas, el draft model puede degradarse o fallar en la prediccion.
- Compatibilidad restringida: solo se ha probado con SGLang y FlashInfer. Otras infraestructuras (vLLM, TGI) pueden no soportar este formato de draft EAGLE3.
- Archivo `training_state.pt`: contiene estado de optimizador y argumentos de entrenamiento; debe deserializarse solo en entornos de confianza por riesgo de ejecucion de codigo arbitrario.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tambien es Apache 2.0, por lo que no hay restricciones adicionales conocidas.
- Sin garantias de seguridad: no se realizaron evaluaciones de sesgo, toxicidad ni alucinacion. En produccion, se recomienda implementar filtros de salida.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-6-step-140000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Checkpoint relacionado (epoch 6, step 155000, con ventana): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-155000
- Checkpoint relacionado (epoch 6, step 145000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-145000
