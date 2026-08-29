# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-3-step-90000

## Resumen

El modelo `huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-3-step-90000` es un modelo de borrador (draft model) diseñado para decodificación especulativa con el algoritmo EAGLE3, entrenado online con SpecForge sobre el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat autónomo: su única función es acelerar la inferencia del modelo base generando tokens candidatos que el modelo objetivo verifica en paralelo. Fue publicado por el usuario `huluhuluu` en agosto de 2026 como parte de una colección de 47 checkpoints correspondientes a distintas etapas del entrenamiento.

La relevancia de este modelo radica en su capacidad para reducir la latencia de inferencia de Qwen3-4B-Instruct-2507 en entornos de producción servidos con SGLang. Al ser un modelo de borrador con apenas 202,7 millones de parámetros, ocupa poco más de 0,4 GB y puede ejecutarse junto al modelo principal en la misma GPU sin un coste de memoria significativo. El checkpoint concreto corresponde a la época 3, paso 90000, y no aplica ventana deslizante (NoWindow), lo que significa que el modelo de borrador puede operar sobre secuencias completas sin restricciones de contexto adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560) |
| Parametros totales | 202.700.416 (según safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 (máximo de secuencia de entrenamiento; sin ventana deslizante) |
| Tipos de cuantizacion | Pesos en bfloat16; no se documentan cuantizaciones adicionales |
| Idiomas soportados | No disponible (modelo de borrador; hereda el vocabulario del modelo objetivo, 151936 tokens) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (model.safetensors, config.json, training_state.pt) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura EAGLE3, una variante de decodificación especulativa que entrena un modelo auxiliar ligero para predecir los features del modelo objetivo en lugar de tokens directamente. Concretamente, usa una única capa decoder con hidden size de 2560, tamaño intermedio de 9728, 32 cabezas de atención y 8 cabezas clave/valor. El vocabulario de borrador es de 32000 tokens, mientras que el vocabulario objetivo es de 151936 tokens. Los pesos están en bfloat16.

El entrenamiento se realizó con SpecForge, un framework de entrenamiento online para modelos de borrador. Los datos de entrenamiento provienen de un dataset ShareGPT limpio en formato JSONL, con 10 épocas y un total de 231810 pasos de optimizador. El checkpoint concreto corresponde a la época 3, paso 90000. Se usó un batch global efectivo de 4, learning rate de 1e-4 con warmup lineal del 1,5% y decaimiento coseno, sin weight decay y con gradiente máximo de 0,5. La longitud máxima de secuencia fue de 2048 tokens, con longitud TTT de EAGLE3 de 7. La atención del borrador usa `sdpa` y el backend objetivo es SGLang con FlashInfer. No se registraron métricas de evaluación ni de seguridad durante el entrenamiento.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: el modelo propone secuencias de tokens que el modelo objetivo Qwen3-4B-Instruct-2507 verifica, acelerando la inferencia.
- Compatibilidad exclusiva con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`: no funciona con otras variantes de Qwen3 ni con otros modelos.
- Integración nativa con SGLang mediante el algoritmo EAGLE3, con parámetros configurables como número de pasos especulativos, top-k y número de tokens de borrador.
- Soporte de atención sin ventana deslizante (NoWindow), lo que permite operar sobre la secuencia completa sin limitaciones de contexto adicionales.
- Tamaño reducido (202,7 M parámetros) que permite ejecutarse en la misma GPU que el modelo objetivo sin un coste de memoria relevante.
- No es un modelo de chat: no genera respuestas autónomas, no soporta tool calling, ni razonamiento, ni funciones multilingües propias.

## Casos de uso

- Aceleración de inferencia en servicios de chat con SGLang: integrar este modelo como ruta de borrador en `sglang.launch_server` permite reducir la latencia de respuesta de Qwen3-4B-Instruct-2507 en entornos de producción, especialmente útil para aplicaciones de asistente conversacional con alta concurrencia.
- Despliegue en infraestructura existente sin cambios de código: al ser un checkpoint compatible con SGLang, se puede sustituir el modelo de borrador por otro checkpoint de la misma colección sin modificar la configuración del servidor.
- Ajuste fino de la velocidad de decodificación para cargas de trabajo específicas: los parámetros de árbol especulativo (`--speculative-num-steps`, `--speculative-eagle-topk`, `--speculative-num-draft-tokens`) pueden ajustarse según el workload para maximizar el throughput.
- Evaluación de la relación coste-rendimiento de decodificación especulativa: investigadores pueden comparar distintos checkpoints de la colección (época 3 vs época 6, etc.) para determinar cuál ofrece mejor ratio de aceptación de tokens con el mínimo overhead.
- Reducción del coste de inferencia en GPU compartida: al requerir solo 0,4 GB adicionales, es viable ejecutar el borrador junto al modelo principal en GPUs con memoria limitada, como una RTX 4090 de 24 GB.
- Experimentación con SpecForge y EAGLE3: el archivo `training_state.pt` permite reanudar el entrenamiento o estudiar el comportamiento del optimizador, útil para quienes investigan métodos de entrenamiento online de modelos de borrador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad para este entrenamiento. El rendimiento de aceleración depende del workload, de la configuración del árbol especulativo y de la tasa de aceptación de tokens del modelo objetivo, que no se documenta. Tampoco se proporcionan mediciones de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: aproximadamente 0,4 GB para los pesos en bfloat16 (202,7 M parámetros), más overhead de activaciones y estados de atención. En la práctica, se ejecuta junto al modelo objetivo Qwen3-4B-Instruct-2507 (que ocupa unos 8 GB en bf16), por lo que la VRAM total necesaria ronda los 9-10 GB.
- GPU recomendadas: cualquier GPU con al menos 12 GB de VRAM puede alojar el par modelo objetivo + borrador. Ejemplos: RTX 3090, RTX 4090, A10, A100, H100. En GPUs con 8 GB (como RTX 3070) podría ser ajustado dependiendo del tamaño de batch y la longitud de secuencia.
- Sí cabe en GPUs de consumo: una RTX 4090 de 24 GB o una RTX 3090 de 24 GB son suficientes para inferencia con batch moderado.
- Opciones de despliegue: SGLang con backend FlashInfer es el destino principal. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El formato safetensors es compatible con transformers, pero el uso práctico requiere SGLang.
- Latencia y throughput: no disponibles. Dependen de la tasa de aceptación del borrador, que no se ha medido públicamente.

## Comparativa con modelos similares

No se dispone de modelos comparables directamente publicados en la información proporcionada. La colección de `huluhuluu` incluye otros checkpoints del mismo entrenamiento (por ejemplo, época 6 paso 155000, época 3 paso 75000), pero son variantes del mismo modelo en distintas etapas, no alternativas independientes. El modelo de borrador oficial de EAGLE3 para Qwen3-4B podría ser una alternativa, pero no se documenta en la información disponible. No se puede realizar una comparativa cuantitativa sin datos de benchmarks.

## Limitaciones y advertencias

- Es un modelo de borrador, no un modelo de chat: no debe usarse de forma independiente para generar respuestas. Su único propósito es la decodificación especulativa junto al modelo objetivo exacto `Qwen/Qwen3-4B-Instruct-2507`.
- No se registraron métricas de evaluación ni de seguridad durante el entrenamiento: se desconoce la calidad de los tokens generados en términos de sesgo, toxicidad o alucinación, aunque al ser solo un borrador, el modelo objetivo final es el responsable de la salida.
- El archivo `training_state.pt` contiene estado del optimizador y argumentos de entrenamiento; solo debe deserializarse en entornos confiables, ya que podría ejecutar código arbitrario.
- La longitud máxima de secuencia de entrenamiento es 2048 tokens; aunque el modelo no usa ventana deslizante, no se garantiza un comportamiento óptimo con secuencias más largas que las vistas durante el entrenamiento.
- Los datos de entrenamiento (ShareGPT limpio) no incluyen registro de revisión; puede haber sesgos inherentes al dataset original.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3-4B-Instruct-2507 tiene su propia licencia (Qwen Research License o Apache 2.0 según versión), que debe verificarse por separado para uso en producción.
- No se proporcionan garantías de rendimiento: la tasa de aceptación de tokens especulativos puede variar significativamente según el dominio de la conversación y la configuración del árbol.

## Enlaces

- Repositorio del checkpoint: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-3-step-90000
- Checkpoint de la misma colección (época 6 paso 155000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-6-step-155000
- Checkpoint de la misma colección (época 3 paso 75000): https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-epoch-3-step-75000
- Modelo objetivo en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
- Repositorio oficial de EAGLE para Qwen3: https://github.com/Yunhai-Hu/EAGLE-Qwen3
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
