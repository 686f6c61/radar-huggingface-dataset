# bloomer010/Ling-3.0-flash-REAP384-94B-A5B-GGUF

## Resumen

Ling-3.0-flash REAP384 es una versión podada del modelo Ling-3.0-flash de inclusionAI, un modelo de lenguaje de arquitectura MoE (Mixture of Experts) con 512 expertos enrutados por capa. La poda se realiza mediante el método REAP (Router-weighted Expert Activation Pruning), que elimina el 25% de los expertos (de 512 a 384 por capa) basándose en la activación ponderada por el router sobre datos de calibración. El resultado es un modelo con 96.5B parámetros totales (según safetensors) y 5.1B activos por token, lo que lo hace especialmente eficiente para inferencia en hardware con recursos limitados.

El modelo se distribuye en formato GGUF, con cuantizaciones MXFP4, Q4_K_M y Q2_K, pensadas para su uso con llama.cpp y servidores compatibles. La poda se realiza sin fine-tuning ni entrenamiento de recuperación, lo que implica una posible pérdida de calidad que no se documenta en la información disponible. Su principal atractivo es la reducción de parámetros totales (de 124B a 96.5B) manteniendo los mismos parámetros activos, lo que facilita el despliegue en CPU con offload de expertos a RAM.

La relevancia actual radica en la tendencia hacia modelos MoE más eficientes y en la disponibilidad de técnicas de poda como REAP, que permiten reducir el tamaño de modelos existentes sin necesidad de reentrenamiento. Sin embargo, al ser un modelo derivado y sin benchmarks publicados, su adopción en producción requiere evaluación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 384 expertos enrutados por capa (originalmente 512) |
| Parametros totales | 96.519.001.952 (96.5B) según safetensors; el autor indica 94B |
| Parametros activos | 5.1B (por token) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea 65536 tokens, pero no se confirma como máximo) |
| Tipos de cuantizacion | MXFP4, Q4_K_M, Q2_K (formato GGUF) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (con safetensors como master de precisión completa) |

## Arquitectura y entrenamiento

El modelo base, Ling-3.0-flash de inclusionAI, es un MoE con 512 expertos enrutados por capa y 5.1B parámetros activos. La versión REAP384 aplica una poda one-shot de expertos utilizando el método REAP (arxiv:2510.13999), que puntúa cada experto según el producto del valor de la puerta del router y la norma L2 de su salida sobre datos de calibración. Los expertos con menor puntuación se eliminan, reduciendo el total a 384 por capa. La calibración se realizó con 1M tokens del dataset ultrachat, exclusivamente con datos de chat. No se realizó fine-tuning ni entrenamiento de recuperación posterior a la poda.

No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO, etc.). La poda no altera los parámetros activos, por lo que la latencia por token se mantiene similar al modelo original, pero el tamaño total en memoria se reduce aproximadamente un 22%.

## Capacidades

- Generación de texto y conversación: al ser un modelo de lenguaje de propósito general, se espera que mantenga las capacidades del modelo base, aunque la poda puede afectar a tareas que dependen de expertos eliminados.
- Razonamiento y conocimiento: no se especifican capacidades concretas en la información disponible; se asume que hereda las del modelo Ling-3.0-flash, pero sin datos verificables.
- Soporte de tool calling y agentes: no se menciona en la documentación; se desconoce si el modelo base los soporta.
- Multilingüismo: no se indica qué idiomas cubre.
- Eficiencia en inferencia: gracias a la poda, el modelo requiere menos memoria total, lo que permite ejecutarlo en hardware con menos VRAM o con offload de expertos a CPU.

## Casos de uso

- Despliegue en CPU con offload de expertos: el autor recomienda usar el quant MXFP4 y cargar los expertos en RAM mientras la atención se ejecuta en GPU. Esto permite servir el modelo en máquinas con GPU de gama media y abundante RAM, útil para entornos de desarrollo o prototipado.
- Evaluación de técnicas de poda: investigadores pueden comparar el rendimiento de Ling-3.0-flash original frente a la versión podada para estudiar el impacto de REAP en tareas específicas.
- Inferencia de bajo coste en entornos con restricciones de memoria: al reducir los parámetros totales, se puede ejecutar en GPUs con 24 GB de VRAM (dependiendo del quant) o incluso en CPU pura con suficiente RAM.
- Servicio de chat en tiempo real con contexto largo: el ejemplo de uso emplea una ventana de 64K tokens, lo que sugiere que puede manejar conversaciones extensas, aunque no se confirma el límite real.
- Pruebas de compatibilidad con llama.cpp: el modelo sirve como caso de prueba para la implementación de bailingmoe3 en llama.cpp (PR #26608), útil para desarrolladores que trabajan con esa arquitectura.
- Fine-tuning o adaptación posterior: aunque la poda no incluye entrenamiento, el modelo puede servir como punto de partida para fine-tuning específico, aprovechando su menor tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan métricas como MMLU, HumanEval o GSM8K, ni comparaciones con el modelo original o alternativas.

## Requisitos de hardware

- VRAM estimada: no se especifica. El tamaño del repo es 58.3 GB, que incluye varios quants. El quant MXFP4 (expertos en MXFP4, resto en Q8_0) es el recomendado para CPU-offload, pero su tamaño exacto no se indica.
- GPU recomendadas: no se detallan. Dado que los expertos pueden residir en RAM, una GPU con al menos 8-12 GB de VRAM para la atención podría ser suficiente, pero es una estimación no confirmada.
- Compatibilidad con consumer GPU: probablemente sí, especialmente con offload de expertos a CPU, pero no hay datos concretos.
- Opciones de despliegue: llama.cpp (con el fork que soporta bailingmoe3 hasta que se fusione el PR #26608), llama-server, y cualquier servidor compatible con GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (MoE podados o modelos de tamaño similar). El modelo base Ling-3.0-flash podría compararse con otros MoE como Mixtral 8x7B o Qwen MoE, pero no se proporcionan datos de rendimiento.

## Limitaciones y advertencias

- La poda se realizó sin fine-tuning, por lo que es probable que el rendimiento en ciertas tareas se degrade respecto al modelo original, aunque no se cuantifica.
- La calibración se hizo únicamente con datos de chat (ultrachat), lo que puede sesgar la poda hacia tareas conversacionales y perjudicar otras capacidades.
- No se especifica la licencia del modelo, lo que impide conocer restricciones de uso comercial.
- La compatibilidad con llama.cpp depende de un PR pendiente de fusión; hasta entonces, se requiere usar un fork específico, lo que puede limitar su integración en entornos de producción.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma.
- El contexto máximo no está confirmado; el ejemplo usa 64K, pero podría ser inferior o superior.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/bloomer010/Ling-3.0-flash-REAP384-94B-A5B-GGUF
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.0-flash
- Paper REAP: https://arxiv.org/abs/2510.13999
- PR de llama.cpp para bailingmoe3: https://github.com/ggml-org/llama.cpp/pull/26608
- Fork con soporte bailingmoe3: https://github.com/aetherbird/llama.cpp/tree/bailingmoe3-support
