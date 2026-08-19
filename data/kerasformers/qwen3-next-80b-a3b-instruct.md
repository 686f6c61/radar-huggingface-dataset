# kerasformers/qwen3-next-80b-a3b-instruct

## Resumen

`kerasformers/qwen3-next-80b-a3b-instruct` es una conversión pura en Keras 3 del modelo `Qwen/Qwen3-Next-80B-A3B-Instruct`, desarrollada por el equipo de KerasFormers. Este modelo combina una arquitectura híbrida Gated-DeltaNet con mezcla de expertos (MoE), lo que le permite ofrecer un rendimiento de nivel 80B con solo 3B de parámetros activos por token, reduciendo drásticamente el coste computacional en inferencia. La conversión permite ejecutar el modelo sin modificaciones en los tres backends principales de Keras 3: TensorFlow, PyTorch y JAX, lo que facilita su integración en ecosistemas heterogéneos.

El modelo está pensado para generación de texto en inglés y hereda las capacidades del modelo base de Qwen, incluyendo razonamiento, generación de código y matemáticas. Su licencia Apache 2.0 permite uso comercial sin restricciones, y los pesos se almacenan en bfloat16, ocupando aproximadamente 159,5 GB en el repositorio. Esta conversión es relevante para desarrolladores que trabajan con Keras y necesitan un modelo de gran tamaño con inferencia eficiente gracias a su diseño MoE, sin depender de librerías específicas de un solo framework.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gated-DeltaNet + Mixture of Experts (MoE) |
| Parametros totales | 80 mil millones (80B) |
| Parametros activos | 3 mil millones (3B) |
| Longitud de contexto | 32 768 tokens (según el modelo base Qwen3-Next-80B-A3B-Instruct) |
| Tipos de cuantizacion | Pesos originales en bfloat16; no se especifican cuantizaciones adicionales en la conversión |
| Idiomas soportados | Inglés (según la model card; el modelo base soporta múltiples idiomas, pero esta conversión declara solo `en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras (formato no especificado, probablemente H5 o SavedModel) en bfloat16 |

## Arquitectura y entrenamiento

La arquitectura de Qwen3-Next combina un mecanismo de atención lineal basado en Gated-DeltaNet con una capa de mezcla de expertos (MoE). En lugar de la atención softmax tradicional, Gated-DeltaNet utiliza una recurrencia lineal con puertas que permite procesar secuencias largas con complejidad lineal, mientras que el componente MoE activa solo 3B de los 80B parámetros totales por token, lo que reduce el coste de inferencia a aproximadamente el de un modelo de 3B. Esta combinación es una innovación técnica destacable porque ofrece el conocimiento de un modelo grande con la velocidad de uno pequeño.

El entrenamiento del modelo base fue realizado por el equipo de Qwen en Alibaba, aunque la información proporcionada no detalla la composición del dataset ni el proceso de alineación (RLHF o DPO). Los papers referenciados en la model card (Qwen3 Technical Report, Qwen2.5-1M, RULER y YaRN) sugieren que se aplicaron técnicas de extensión de contexto y evaluación de longitudes largas, pero no se ofrecen cifras concretas de tokens de entrenamiento. La conversión a Keras 3 no modifica los pesos ni la arquitectura, solo adapta el formato para su ejecución multiplataforma.

## Capacidades

- Generación de texto en inglés con alta calidad, incluyendo razonamiento complejo, matemáticas y generación de código.
- Soporte de tool calling y function calling, heredado del modelo base, que permite integrar llamadas a APIs y herramientas externas.
- Capacidad para tareas de agente y razonamiento multi-paso, gracias a su ventana de contexto de 32K tokens y su arquitectura eficiente.
- Multilingüismo limitado en esta conversión: aunque el modelo base soporta varios idiomas, esta versión declara únicamente inglés en su model card.
- No incluye capacidades de visión ni audio; es exclusivamente un modelo de texto.
- Inferencia eficiente gracias a los 3B parámetros activos, lo que permite desplegarlo en hardware con VRAM moderada en comparación con modelos densos de 80B.

## Casos de uso

- Asistente de programación en producción: el modelo puede generar código, explicar fragmentos y autocompletar funciones. Su soporte de tool calling permite conectarlo a entornos de ejecución para pruebas automáticas. La inferencia eficiente (3B activos) lo hace viable en servidores con GPUs de gama media.
- Atención al cliente automatizada: con 32K tokens de contexto, puede gestionar conversaciones multi-turno largas, recordar información del usuario y resolver incidencias complejas. Su licencia Apache 2.0 facilita su integración en productos comerciales.
- Análisis de documentos técnicos: el modelo puede resumir informes extensos, extraer datos clave y responder preguntas sobre el contenido, gracias a su ventana de contexto amplia y su capacidad de razonamiento.
- Generación de documentación técnica: a partir de especificaciones o código fuente, puede redactar manuales, guías de API y comentarios de código coherentes.
- Razonamiento matemático y resolución de problemas: adecuado para plataformas educativas o herramientas de asistencia académica, donde se requieren explicaciones paso a paso.
- Desarrollo de agentes autónomos: su capacidad de razonamiento multi-paso y tool calling permite construir agentes que planifican, ejecutan acciones y verifican resultados, por ejemplo en automatización de tareas de oficina o investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta conversión en la información disponible. Los benchmarks del modelo base (Qwen3-Next-80B-A3B-Instruct) están disponibles en el reporte técnico de Qwen3, pero no se incluyen en esta ficha para evitar datos no verificados. Se recomienda consultar el paper original para comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 160 GB (80B × 2 bytes), lo que requiere GPUs de datacenter como A100 80GB (2 unidades) o H100 80GB (2 unidades) en configuración multi-GPU.
- Con cuantización a 8 bits (no incluida en esta conversión), la VRAM se reduciría a unos 80 GB, permitiendo una sola GPU A100 o H100.
- Con cuantización a 4 bits (tampoco incluida), cabría en una RTX 4090 (24 GB) o similar, pero no se proporcionan pesos cuantizados en el repositorio.
- El modelo puede ejecutarse en consumer GPUs solo si se aplica cuantización externa (por ejemplo, con herramientas como llama.cpp o vLLM), aunque la conversión original está pensada para Keras y backends de alto rendimiento.
- Opciones de despliegue: al ser Keras 3, se puede servir con TensorFlow Serving, TorchServe o JAX, además de frameworks de inferencia como vLLM si se exporta a ONNX o Safetensors.
- Latencia y throughput: no se proporcionan datos medidos en la información disponible. Dado que solo se activan 3B parámetros por token, se espera una velocidad de generación comparable a la de un modelo denso de 3B, aunque la memoria requerida sigue siendo alta por los 80B de pesos totales.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Next-80B-A3B-Instruct (base) | 80B | 3B | 32K | Apache 2.0 | HuggingFace |
| kerasformers/qwen3-next-80b-a3b-instruct | 80B | 3B | 32K | Apache 2.0 | HuggingFace |
| Mixtral 8x7B | 47B | 12.9B | 32K | Apache 2.0 | HuggingFace |
| Qwen3-30B-A3B-Instruct | 30B | 3B | 32K | Apache 2.0 | HuggingFace |

La conversión de KerasFormers no altera el rendimiento respecto al modelo base, pero ofrece la ventaja de ejecutarse en múltiples backends sin cambios. Comparado con Mixtral 8x7B, Qwen3-Next tiene menos parámetros activos (3B vs 12.9B), lo que lo hace más rápido en inferencia, aunque con un total de parámetros mayor (80B vs 47B), lo que implica más memoria para almacenar los pesos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar contenido incorrecto o inventado, especialmente en temas de actualidad o con información no presente en su entrenamiento. Se recomienda verificación humana en aplicaciones críticas.
- Idioma: la model card declara únicamente inglés, aunque el modelo base soporta otros idiomas. La conversión puede no estar optimizada para respuestas en español u otros idiomas.
- Contexto: la ventana de 32K tokens es amplia pero no infinita; secuencias más largas pueden degradar el rendimiento o fallar.
- Requisitos de memoria: los 80B parámetros en bfloat16 requieren al menos 160 GB de VRAM, lo que limita su uso a entornos con GPUs de datacenter o cuantización externa no incluida.
- Formato de pesos: al ser una conversión de Keras, no es directamente compatible con herramientas como llama.cpp o vLLM sin conversión adicional a Safetensors o GGUF.
- Sin soporte de visión ni audio: el modelo es exclusivamente de texto, lo que limita su uso en aplicaciones multimodales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/qwen3-next-80b-a3b-instruct
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3-Next-80B-A3B-Instruct
- Colección Qwen3-Next de KerasFormers: https://huggingface.co/collections/kerasformers/qwen3-next-6a7e551ff86ebf2cca455ef1
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de Qwen3-Next en KerasFormers: https://imvision12.github.io/KerasFormers/qwen3_next/
- Paper Qwen3 Technical Report: https://arxiv.org/abs/2505.09388
- Paper Qwen2.5-1M Technical Report: https://arxiv.org/abs/2501.15383
- Paper RULER (contexto largo): https://arxiv.org/abs/2404.06654
- Paper YaRN (extensión de contexto): https://arxiv.org/abs/2309.00071
