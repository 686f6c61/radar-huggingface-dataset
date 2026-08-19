# bloomer010/Ling-3.0-flash-REAP288-71B-A5B-GGUF

## Resumen

Ling-3.0-flash REAP288 es una variante podada del modelo de lenguaje de mezcla de expertos (MoE) Ling-3.0-flash, desarrollado por inclusionAI. El autor bloomer010 ha aplicado el método REAP (Router-weighted Expert Activation Pruning) para eliminar el 44% de los expertos del modelo original, reduciendo los parámetros totales de 124B a 71B, manteniendo los mismos 5.1B de parámetros activos por token. Esta poda se realiza en una sola pasada, sin fine-tuning ni entrenamiento de recuperación, utilizando una calibración de 1M de tokens (50% ultrachat, 25% wikitext, 25% código). El resultado se distribuye en formato GGUF, lo que permite su uso con llama.cpp y derivados.

La relevancia de este modelo radica en que ofrece una alternativa más ligera a Ling-3.0-flash, con una reducción significativa de memoria y requisitos de cómputo, manteniendo la misma capacidad de inferencia activa. Está pensado para entornos donde el despliegue de un modelo de 124B es inviable, pero se necesita un rendimiento cercano al original. La disponibilidad de cuantizaciones MXFP4, IQ3_XXS y Q4_K_M amplía las opciones de despliegue, incluyendo la posibilidad de servir los expertos desde RAM en CPU mientras la atención se ejecuta en GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) basada en Ling-3.0-flash |
| Parametros totales | 71B |
| Parametros activos | 5.1B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4, IQ3_XXS, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo parte de Ling-3.0-flash, un MoE con 512 expertos por capa y 5.1B de parámetros activos. La poda REAP asigna a cada experto una puntuación basada en el producto del valor de la puerta del router y la norma L2 de su salida, calculada sobre datos de calibración. Los expertos con menor puntuación se eliminan, conservando 288 de los 512 por capa. Este proceso es one-shot, sin entrenamiento adicional, lo que preserva las capacidades del modelo original en la medida de lo posible. La calibración se realizó con 1M de tokens mezclados de ultrachat, wikitext y código, en proporción 50/25/25.

No se dispone de información sobre el número total de capas, dimensiones ocultas, ni detalles del dataset de entrenamiento original de Ling-3.0-flash. Tampoco se especifica si el modelo base utilizó RLHF o DPO. La innovación principal es la aplicación de REAP para reducir el tamaño del modelo sin degradación severa, y su empaquetado en GGUF con soporte para la arquitectura `bailingmoe3` en llama.cpp, actualmente en proceso de integración.

## Capacidades

No se han especificado capacidades detalladas en la documentación proporcionada. Al ser una variante podada de Ling-3.0-flash, se espera que conserve las capacidades generales de generación de texto, razonamiento y posiblemente código del modelo original, aunque no se dispone de una lista oficial. La información disponible solo confirma que es un modelo de lenguaje MoE con 5.1B de parámetros activos, lo que sugiere un rendimiento similar al original en tareas de generación, pero sin datos concretos sobre tool calling, agentes o multimodalidad.

## Casos de uso

Dado que no hay casos de uso documentados, se proponen aplicaciones realistas basadas en las características técnicas del modelo (MoE con 5.1B activos, formato GGUF, posibilidad de offload de expertos a CPU):

- Despliegue de asistentes conversacionales en servidores con GPU limitada: al poder cargar los expertos en RAM y mantener la atención en GPU, el modelo puede ejecutarse en hardware con menos VRAM que el original, manteniendo una latencia aceptable para chatbots.
- Generación de código en entornos de desarrollo: con 5.1B activos, el modelo puede integrarse en editores o pipelines de CI/CD para autocompletar o generar fragmentos, siempre que se acepte la posible degradación por la poda.
- Procesamiento de texto a gran escala en CPU: gracias a las cuantizaciones IQ3_XXS y Q4_K_M, el modelo puede ejecutarse íntegramente en CPU para tareas de clasificación, resumen o extracción de información, con un throughput moderado.
- Prototipado rápido de aplicaciones de lenguaje: al ser un GGUF, se puede cargar con llama.cpp u Ollama para experimentar sin necesidad de infraestructura compleja.
- Investigación sobre poda de expertos: el modelo sirve como ejemplo práctico de REAP, permitiendo estudiar el impacto de la poda en el rendimiento y la calidad de generación.
- Inferencia en entornos edge con memoria unificada: en dispositivos con RAM amplia pero poca VRAM, el offload de expertos a CPU permite ejecutar el modelo en portátiles o estaciones de trabajo sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas estándar para este modelo podado. Tampoco se comparan con el modelo base Ling-3.0-flash ni con otras alternativas.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. Con 71B de parámetros totales, una cuantización Q4_K_M requeriría aproximadamente 40 GB de memoria si se cargara todo en GPU, pero el offload de expertos a RAM reduce la VRAM necesaria a la parte de atención (posiblemente unos pocos GB). Para MXFP4, los expertos se pueden mantener en RAM, dejando la atención en GPU.
- GPU recomendadas: no se especifican. Para el modo con offload, cualquier GPU con al menos 8-12 GB de VRAM podría ser suficiente, dependiendo de la longitud de contexto. Para carga completa, se necesitarían GPUs de 48 GB o más (A6000, A100, H100).
- Compatibilidad con consumer GPU: sí, si se utiliza el offload de expertos a CPU, una RTX 3090 o 4090 con 24 GB podría manejar la atención, mientras los expertos residen en RAM del sistema.
- Opciones de despliegue: llama.cpp (con el fork que soporta `bailingmoe3` hasta que se integre el PR), llama-server, y potencialmente Ollama si se añade soporte. También se puede usar vLLM si se adapta, aunque no está confirmado.
- Latencia y throughput: no disponibles. Dependen en gran medida de la configuración de hardware y del número de expertos activos por token (5.1B), que es fijo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.0-flash (base) | 124B | 5.1B | no disponible | no disponible | no disponible |
| Ling-3.0-flash REAP288 | 71B | 5.1B | no disponible | no disponible | GGUF |
| Mixtral 8x7B (referencia) | 46.7B | 12.9B | 32k | Apache 2.0 | safetensors, GGUF |

La comparativa se limita a aspectos estructurales, ya que no hay datos de rendimiento. El modelo podado reduce un 43% los parámetros totales respecto al base, manteniendo los activos, lo que implica menor huella de memoria sin cambiar la velocidad de inferencia por token. Frente a Mixtral 8x7B, tiene menos parámetros activos (5.1B vs 12.9B), lo que sugiere menor capacidad por token, pero también menor coste computacional. No se dispone de información sobre licencia ni contexto para una comparación completa.

## Limitaciones y advertencias

- La poda se realizó sin fine-tuning de recuperación, por lo que es probable que exista una degradación en la calidad de generación respecto al modelo original, especialmente en tareas que dependen de expertos eliminados.
- La compatibilidad con llama.cpp depende de la integración del soporte `bailingmoe3` (PR #26608), que aún no está fusionado. Hasta entonces, es necesario usar un fork específico.
- No se dispone de información sobre la licencia del modelo, por lo que no se puede garantizar su uso comercial. Se recomienda contactar con el autor o con inclusionAI antes de utilizarlo en producción.
- No se han publicado benchmarks ni evaluaciones de sesgos o alucinaciones. El modelo podría presentar los mismos sesgos que el base, pero no hay datos al respecto.
- La longitud de contexto no está especificada; se desconoce si la poda afecta a la capacidad de manejar contextos largos.
- El modelo solo está disponible en formato GGUF, lo que limita su uso a entornos compatibles con llama.cpp y no con frameworks como Transformers directamente.

## Enlaces

- [HuggingFace - Ling-3.0-flash-REAP288-71B-A5B-GGUF](https://huggingface.co/bloomer010/Ling-3.0-flash-REAP288-71B-A5B-GGUF)
- [Modelo base: inclusionAI/Ling-3.0-flash](https://huggingface.co/inclusionAI/Ling-3.0-flash)
- [Paper REAP (arXiv:2510.13999)](https://arxiv.org/abs/2510.13999)
- [PR #26608 en llama.cpp para soporte bailingmoe3](https://github.com/ggml-org/llama.cpp/pull/26608)
- [Fork de llama.cpp con soporte bailingmoe3](https://github.com/aetherbird/llama.cpp/tree/bailingmoe3-support)
