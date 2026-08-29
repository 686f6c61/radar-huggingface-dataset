# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-3-step-75000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-3-step-75000` es un modelo auxiliar de decodificación especulativa (draft model) entrenado para acelerar la inferencia del modelo base `Qwen/Qwen3-4B-Instruct-2507`. Fue desarrollado por el usuario de HuggingFace `huluhuluu` mediante entrenamiento online con el método EAGLE3 y la herramienta SpecForge, y corresponde al checkpoint correspondiente a la época 3 y al paso 75000 de un total de 231810 pasos. No es un modelo de chat independiente, sino un componente que se empareja con el modelo objetivo para reducir la latencia de generación.

Con solo 202.700.416 parámetros (una única capa decoder), el modelo es extremadamente ligero y está diseñado para ejecutarse junto al modelo base de 4B. Su ventana de contexto de entrenamiento es de 2048 tokens, pero utiliza una ventana deslizante de atención de 512 tokens para el drenaje especulativo. La licencia Apache 2.0 permite uso comercial sin restricciones adicionales. Su relevancia radica en la creciente demanda de despliegue eficiente de modelos grandes en producción, donde la decodificación especulativa puede reducir significativamente el tiempo de respuesta sin sacrificar calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `LlamaForCausalLMEagle3` (una capa decoder, hidden size 2560, intermediate size 9728, 32 cabezas de atencion, 8 cabezas K/V) |
| Parametros totales | 202.700.416 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 2048 (entrenamiento), 512 (ventana deslizante de atencion) |
| Tipos de cuantizacion | no disponible (pesos en bfloat16, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible (el modelo base es multilingue, pero el dataset ShareGPT no esta especificado) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors), junto con config.json y training_state.pt |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, una variante de decodificación especulativa que utiliza una capa de transformador ligera para predecir tokens futuros a partir del contexto y de los tokens ya generados. En este caso, la arquitectura es `LlamaForCausalLMEagle3` con una sola capa decoder de 2560 dimensiones ocultas y 32 cabezas de atención, con 8 cabezas clave/valor. La atención es causal con ventana deslizante de 512 tokens (`sdpa`), lo que limita el alcance del contexto para el drenaje especulativo.

El entrenamiento se realizó de forma online (online EAGLE3) con SpecForge, utilizando datos ShareGPT limpios en formato JSONL (la revisión o fuente exacta no se registró). Los hiperparámetros incluyen 10 épocas, 231810 pasos de optimización, tamaño de lote efectivo de 4, learning rate de 1e-4 con warmup lineal del 1.5% y decaimiento coseno, sin weight decay, y longitud máxima de secuencia de 2048 tokens. El TTT (test-time training) de EAGLE3 se configuró con longitud 7. No se aplicaron técnicas de RLHF o DPO, ya que es un modelo auxiliar de drenaje, no un modelo de chat.

## Capacidades

- Es un modelo de drenaje especulativo (draft model) para decodificación especulativa con EAGLE3, no un modelo de generación autónoma.
- Acelera la inferencia del modelo base `Qwen/Qwen3-4B-Instruct-2507` prediciendo secuencias de tokens candidatos que el modelo base verifica en paralelo.
- Soporta configuraciones de árbol de especulación (tree settings) para ajustar el equilibrio entre velocidad y precisión.
- Compatible con el backend SGLang (con `flashinfer`), que implementa la verificación paralela de los tokens generados.
- No tiene capacidades de tool calling, agentes, visión ni audio propias; todas las capacidades funcionales pertenecen al modelo base.
- El modelo base es multilingüe e incluye instrucciones, razonamiento, matemáticas y código, pero el drenaje solo mejora el rendimiento de generación, no añade funcionalidades nuevas.

## Casos de uso

- Despliegue de Qwen3-4B-Instruct-2507 en producción con baja latencia: el drenaje EAGLE3 reduce el número de pasos de decodificación, lo que es crítico en APIs de chat o asistentes conversacionales donde cada milisegundo cuenta.
- Servicios de generación de código en tiempo real: al emparejar el modelo base con este drenaje en SGLang, se puede ofrecer autocompletado de código con menor latencia, manteniendo la calidad del modelo de 4B.
- Sistemas de atención al cliente automatizada: el modelo base gestiona conversaciones multilingües; el drenaje acelera las respuestas, permitiendo atender más peticiones concurrentes con la misma infraestructura.
- Prototipado de aplicaciones de IA generativa en entornos con recursos limitados: al ser un modelo de solo 202M parámetros, el drenaje ocupa poco espacio y VRAM adicional, facilitando pruebas en GPUs de consumo.
- Investigación en decodificación especulativa: sirve como referencia para estudiar el impacto de la ventana deslizante y la longitud TTT en la tasa de aceptación de tokens y el speedup real.
- Evaluación de configuraciones de árbol de especulación en SGLang: los 47 checkpoints de la colección permiten experimentar con diferentes puntos de entrenamiento y ajustar el rendimiento según la carga de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación ni de seguridad, y no se proporcionan datos de speedup, tasa de aceptación ni comparativas con otros métodos de decodificación especulativa. Se recomienda medir el rendimiento en el entorno de despliegue concreto.

## Requisitos de hardware

- VRAM estimada para el drenaje: aproximadamente 0.4 GB en bfloat16 (202M parámetros × 2 bytes), más overhead de activaciones y KV cache.
- VRAM total necesaria para el sistema completo (drenaje + modelo base de 4B en bf16): alrededor de 8-10 GB, dependiendo de la cuantización del modelo base y de la longitud de contexto.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, RTX 4090) para el sistema completo; el drenaje en sí funciona incluso en GPUs integradas o CPU.
- En GPUs de consumo (serie RTX 30/40) es viable ejecutar el modelo base con cuantización (por ejemplo, AWQ o GPTQ) y el drenaje en bf16.
- Opciones de despliegue: SGLang (con `flashinfer`), que es el backend objetivo; también puede integrarse con vLLM si soporta EAGLE3 (no confirmado en la documentación). No se menciona compatibilidad con llama.cpp u Ollama.
- Latencia y throughput: no disponibles, dependen del hardware, la configuración del árbol de especulación y la carga.

## Comparativa con modelos similares

No se dispone de comparativas directas con otros modelos de drenaje EAGLE3 para Qwen3-4B. La colección del autor incluye 47 checkpoints del mismo entrenamiento (pasos 5000 a 231810), pero no hay datos comparativos con otros métodos como Medusa, Lookahead o drenajes basados en Mamba. Tampoco se han publicado resultados frente a modelos de tamaño similar. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- Es un modelo de drenaje especulativo, no un modelo de chat autónomo; usarlo sin el modelo base no produce respuestas útiles.
- La ventana de atención del drenaje es de 512 tokens, lo que limita la predicción especulativa a contextos cortos; para contextos más largos, la tasa de aceptación puede degradarse.
- El entrenamiento se realizó con datos ShareGPT, que pueden contener sesgos lingüísticos y temáticos (probablemente predominio del inglés), lo que podría afectar al rendimiento del drenaje en otros idiomas.
- No se registraron métricas de evaluación ni de seguridad; no hay garantías sobre la calidad de los tokens generados en el drenaje.
- El archivo `training_state.pt` incluye estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos de confianza.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base `Qwen3-4B-Instruct-2507` tiene su propia licencia (Apache 2.0 también), por lo que no hay restricciones adicionales conocidas.
- Para producción, es imprescindible ajustar los parámetros del árbol de especulación (tree settings) y validar el speedup real, ya que puede variar según el hardware y la distribución de las peticiones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-SW512-epoch-3-step-75000
- Colección de checkpoints: https://huggingface.co/collections/huluhuluu/qwen3-4b-instruct-2507-eagle3-sharegpt-checkpoints
- Repositorio EAGLE-Qwen3 (implementación oficial): https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Página del modelo base en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Repositorio de ejemplo de ejecución en NPU: https://github.com/locomotive-works/npu-local-model-running
