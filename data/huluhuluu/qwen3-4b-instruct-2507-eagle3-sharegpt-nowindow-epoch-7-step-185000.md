# huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-7-step-185000

## Resumen

Este repositorio contiene un checkpoint concreto (epoch 7, paso 185000) de un modelo de borrador (draft model) EAGLE3 entrenado en línea con SpecForge para el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`. No es un modelo de chat independiente, sino un componente de decodificación especulativa que genera tokens candidatos para acelerar la inferencia del modelo base. El desarrollo lo realiza el usuario de HuggingFace `huluhuluu`, que publica 47 checkpoints de un mismo entrenamiento en una colección.

El modelo tiene 202.700.416 parámetros, una única capa de decoder con tamaño oculto 2560, y está diseñado para usarse exclusivamente con el backend SGLang mediante el algoritmo EAGLE3. Su relevancia radica en que permite reducir la latencia de generación del Qwen3-4B-Instruct-2507 sin modificar la calidad de las respuestas, ya que el modelo base es el que produce la salida final verificada. La licencia es Apache 2.0, lo que facilita su integración en entornos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLMEagle3 (una capa decoder, hidden size 2560, intermediate size 9728, 32 heads, 8 KV heads) |
| Parametros totales | 202.700.416 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 (maxima de entrenamiento, sin ventana deslizante configurada) |
| Tipos de cuantizacion | bfloat16 (pesos originales) |
| Idiomas soportados | No disponible (el modelo base Qwen3-4B-Instruct-2507 es multilingue, pero este draft no especifica) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (model.safetensors) |

## Arquitectura y entrenamiento

El modelo usa la arquitectura `LlamaForCausalLMEagle3`, una variante del diseño EAGLE3 para decodificación especulativa. Consta de una sola capa de transformer con tamaño oculto 2560, 32 cabezas de atención y 8 cabezas clave/valor, con un vocabulario de borrador de 32000 tokens frente a los 151936 del modelo objetivo. Los pesos están en bfloat16.

El entrenamiento se realizó en línea con SpecForge, un método que entrena el modelo de borrador mientras se sirve el modelo objetivo, usando datos ShareGPT limpios en formato JSONL. Se ejecutaron 10 épocas con 231810 pasos de optimización, un tamaño de batch efectivo de 4, tasa de aprendizaje 1e-4 con calentamiento lineal del 1,5% y posterior coseno, y una longitud máxima de secuencia de 2048. La atención del borrador usa `sdpa` (scaled dot-product attention) y el backend objetivo es SGLang con FlashInfer. No se estableció un límite de ventana deslizante en esta ejecución estándar.

## Capacidades

- Generación de tokens candidatos para decodificación especulativa: el modelo produce secuencias de borrador que el modelo objetivo verifica o rechaza, acelerando la inferencia.
- Aceleración de la generación del modelo Qwen3-4B-Instruct-2507: al proponer múltiples tokens por paso, reduce el número de iteraciones autoregresivas del modelo grande.
- Compatibilidad con SGLang: se integra como ruta de draft en el servidor SGLang mediante el algoritmo EAGLE3.
- No es un modelo de chat: no genera respuestas finales por sí mismo, no soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene modo de pensamiento (thinking mode) ni capacidades de visión o audio.

## Casos de uso

- Despliegue de inferencia de baja latencia para Qwen3-4B-Instruct-2507: el draft model se usa como componente en SGLang para servir el modelo base con menor tiempo de respuesta por token, adecuado para aplicaciones interactivas como chatbots o asistentes en tiempo real.
- Reducción de costes de cómputo en producción: al acelerar la generación, se puede mantener el mismo throughput con menos GPUs o procesar más peticiones por segundo, optimizando el uso de infraestructura.
- Optimización de APIs de chat internas: si una organización sirve Qwen3-4B-Instruct-2507 a través de una API, este draft model permite reducir la latencia sin cambiar el comportamiento del modelo principal.
- Experimentación con decodificación especulativa: los 47 checkpoints publicados permiten estudiar el efecto del número de pasos de entrenamiento en la calidad del draft y la tasa de aceptación.
- Benchmarking de configuraciones EAGLE3: los parámetros de árbol (num-steps, top-k, num-draft-tokens) pueden ajustarse y compararse usando este checkpoint como punto de partida.
- Investigación en eficiencia de inferencia: sirve como ejemplo de entrenamiento online de modelos de borrador con SpecForge, útil para equipos que desarrollan técnicas de aceleración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se registraron métricas de evaluación ni de seguridad para esta ejecución. No se proporcionan datos de MMLU, HumanEval, GSM8K ni tasas de aceptación del draft.

## Requisitos de hardware

- VRAM estimada para el draft model solo: aproximadamente 0,4 GB en bfloat16 (202,7M parámetros × 2 bytes), más overhead de activaciones y KV cache. En la práctica se ejecuta junto al modelo base de 4B, por lo que la VRAM total necesaria dependerá del despliegue conjunto.
- GPU recomendadas: cualquier GPU consumer con al menos 8 GB de VRAM para alojar el modelo base (Qwen3-4B) y el draft. Por ejemplo, RTX 3060/4060 o superiores. Para despliegues de alto throughput, se recomiendan GPUs de datacenter como A100 o H100, aunque no son imprescindibles.
- Compatibilidad con consumer GPU: sí, el draft model es muy ligero y el conjunto completo cabe en tarjetas de gama media.
- Opciones de despliegue: SGLang (backend recomendado con FlashInfer). No se mencionan alternativas como vLLM, llama.cpp u Ollama en la documentación.
- Latencia y throughput: no se proporcionan datos medidos. La eficiencia depende de la tasa de aceptación del draft, que debe evaluarse en la carga de trabajo específica.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar con otros modelos de borrador EAGLE3 o Medusa en términos de rendimiento, ya que no hay benchmarks publicados. Este checkpoint es específico para Qwen3-4B-Instruct-2507 y no es intercambiable con otros modelos base. Como alternativa, se podrían usar modelos de borrador entrenados con métodos como Medusa o EAGLE-2, pero no se dispone de datos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo de chat: intentar usarlo directamente para generar respuestas producirá resultados sin sentido. Debe emparejarse con el modelo objetivo `Qwen/Qwen3-4B-Instruct-2507`.
- Entrenado solo con datos ShareGPT: el dominio de entrenamiento se limita a conversaciones de ese dataset, lo que puede afectar la tasa de aceptación en otros dominios.
- Longitud de secuencia limitada: el entrenamiento usó un máximo de 2048 tokens; aunque no hay ventana deslizante, no se garantiza un buen comportamiento en secuencias más largas.
- Sin evaluación de seguridad ni sesgos: la model card indica que no se registraron métricas de seguridad. No se ha auditado el modelo para detectar sesgos o contenido dañino.
- Checkpoint intermedio: este es el paso 185000 de la época 7, no el final del entrenamiento. Otros checkpoints de la colección pueden ofrecer diferente rendimiento.
- Dependencia de SGLang: el uso práctico requiere el backend SGLang con FlashInfer; no se proporcionan instrucciones para otros frameworks.
- El archivo `training_state.pt` contiene estado de optimizador y debe deserializarse solo en entornos de confianza.

## Enlaces

- Repositorio del modelo: https://huggingface.co/huluhuluu/Qwen3-4B-Instruct-2507-EAGLE3-ShareGPT-NoWindow-epoch-7-step-185000
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Colección de checkpoints (referenciada en la model card, sin URL directa proporcionada)
- Información sobre Qwen3-4B-Instruct-2507 en Qualcomm AI Hub: https://aihub.qualcomm.com/models/qwen3_4b_instruct_2507
