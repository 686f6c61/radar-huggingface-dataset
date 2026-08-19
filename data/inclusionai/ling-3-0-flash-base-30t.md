# inclusionAI/Ling-3.0-flash-base-30T

## Resumen

Ling-3.0-flash-base-30T es un checkpoint de preentrenamiento de la familia Ling-3.0, desarrollado por inclusionAI (Ant Group). Se trata de un modelo de lenguaje de arquitectura híbrida lineal MoE (Mixture of Experts) con 127.486 millones de parámetros totales, de los cuales solo 5.100 millones se activan por token. Este checkpoint concreto corresponde a la fase de preentrenamiento completada con 30 billones de tokens, antes de las etapas de mid-training, merging WSM y post-entrenamiento.

El modelo destaca por su combinación de atención lineal híbrida nativa (KDA con Gated MLA) y una arquitectura MoE altamente dispersa (1/64), con 512 expertos enrutados de los que solo se activan 8 por token. Esta combinación permite procesar contextos largos de forma eficiente manteniendo un coste computacional reducido. Su relevancia actual radica en que es un checkpoint intermedio liberado para investigación, pensado para continuar preentrenamiento, fine-tuning y experimentación académica, no para despliegue directo en producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hybrid-linear MoE (KDA + Gated MLA) |
| Parametros totales | 127.486.405.600 |
| Parametros activos | 5.100 millones (non-emb) |
| Longitud de contexto | 256.000 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ling-3.0-flash-base-30T emplea una arquitectura híbrida lineal MoE que combina dos tipos de capas: 35 capas KDA (Kernel-based Dynamic Attention) y 7 capas Gated MLA (Multi-head Latent Attention), en proporción 5:1, más 2 capas densas. El modelo tiene 512 expertos enrutados y 1 experto compartido, activando únicamente 8 expertos enrutados por token, lo que resulta en 5.100 millones de parámetros activos. Esta dispersión extrema (1/64) permite un rendimiento por parámetro muy superior al de modelos densos equivalentes.

El entrenamiento siguió el enfoque Warmup-Stable and Merge (WSM), documentado en el paper arXiv:2507.17634, que sustituye el decay tradicional de learning rate por un merging ponderado de checkpoints. Este checkpoint concreto, denominado base-30T, es el resultado de la fase de preentrenamiento con 30 billones de tokens, sin mid-training ni post-entrenamiento. La decisión de liberar checkpoints intermedios responde a la necesidad de facilitar la investigación en continued pretraining, fine-tuning y experimentación con diferentes estrategias de decay sin necesidad de reentrenar desde cero.

## Capacidades

- Generación de texto base: como modelo de lenguaje preentrenado, genera texto coherente y contextualmente relevante en tareas generales de language modeling.
- Razonamiento y matemáticas: capacidades emergentes de razonamiento básico y resolución de problemas matemáticos, propias de un modelo de 124B entrenado con 30T tokens.
- Comprensión de código: capacidad de representar y generar código fuente en múltiples lenguajes de programación, aunque sin fine-tuning específico.
- Procesamiento de contexto largo: gracias a la atención lineal híbrida, puede procesar secuencias de hasta 256K tokens de forma nativa, extensible a 1M.
- Multilingüismo: capacidades multilingües generales derivadas del preentrenamiento, aunque los idiomas concretos no están documentados en la ficha.
- Investigación y fine-tuning: diseñado específicamente para ser la base de experimentos de continued pretraining, mid-training, SFT, RL y destilación.

## Casos de uso

- Continued pretraining: investigadores pueden continuar el preentrenamiento de este checkpoint con datos adicionales o dominios específicos, aprovechando que no ha pasado por decay de learning rate y es más receptivo a nuevo entrenamiento.
- Fine-tuning supervisado para dominios verticales: el modelo puede adaptarse mediante SFT a dominios como medicina, derecho o finanzas, partiendo de una base ya entrenada con 30T tokens.
- Investigación en sistemas MoE: al ser un checkpoint de preentrenamiento, es útil para estudiar el comportamiento de los expertos, el enrutamiento y la dispersión en arquitecturas MoE extremas.
- Investigación en atención lineal híbrida: la combinación de KDA y Gated MLA ofrece un banco de pruebas para estudiar el rendimiento de atención lineal en contextos largos.
- Experimentación con estrategias de merging y decay: el checkpoint permite probar diferentes perfiles de decay y estrategias de merging WSM sin necesidad de reentrenar, comparando resultados offline.
- Base para post-entrenamiento y alineación: organizaciones pueden aplicar técnicas de RLHF, DPO o preferencia optimization sobre este checkpoint para crear modelos alineados propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para el checkpoint base-30T en la información disponible. El modelo card indica que existe una suite de evaluación propia que cubre matemáticas, código, razonamiento, comprensión multilingüe y contexto largo, pero los resultados se muestran en imágenes no accesibles. El modelo post-entrenado Ling-3.0-flash (que sí está disponible) muestra un percentil 78 en velocidad entre modelos similares según Benchable, pero estos datos no son directamente aplicables a este checkpoint intermedio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero considerando 127B parámetros totales en FP16 se necesitarían aproximadamente 255 GB de VRAM. Con cuantización a 8 bits se reduciría a unos 128 GB, y a 4 bits a unos 64 GB.
- GPU recomendadas: no hay recomendaciones oficiales. Para inferencia con cuantización 4-bit serían necesarias 2x NVIDIA RTX 4090 (24 GB cada una) o 1x A100 80 GB. Para fine-tuning completo se requerirían clusters con 8x H100 o equivalente.
- Encaje en GPU de consumo: no cabe en una sola GPU de consumo sin cuantización agresiva. Con cuantización 4-bit podría ejecutarse en una configuración multi-GPU de gama alta.
- Opciones de despliegue: al ser un checkpoint base, no se recomienda desplegarlo directamente. Para experimentación, se puede usar con transformers, vLLM o llama.cpp si se convierte a GGUF.
- Latencia y throughput: no disponibles. El modelo post-entrenado Ling-3.0-flash es conocido por su velocidad, pero este checkpoint intermedio no tiene datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ling-3.0-flash-base-30T | 127B | 5,1B | 256K | MIT | Checkpoint base |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | Modelo completo |
| Mixtral 8x22B | 141B | 39B | 64K | Apache 2.0 | Modelo completo |
| Qwen2.5-72B | 72B | 72B | 128K | Apache 2.0 | Modelo completo |

La comparativa es limitada porque este checkpoint es intermedio y no está pensado para uso directo. Frente a alternativas como DeepSeek-V3 o Mixtral, Ling-3.0-flash-base-30T ofrece una dispersión mucho mayor (5,1B activos frente a 37B o 39B) y contexto nativo superior (256K frente a 64K-128K). Sin embargo, carece de post-entrenamiento y alineación, por lo que no es directamente comparable en rendimiento de tareas.

## Limitaciones y advertencias

- Checkpoint intermedio: no ha pasado por mid-training, merging WSM ni post-entrenamiento, por lo que su rendimiento en tareas reales es inferior al del modelo final.
- No apto para chat: no está alineado ni entrenado para conversación, por lo que no debe usarse directamente como chatbot.
- Sin alineación de seguridad: no ha pasado por procesos de RLHF o DPO, por lo que puede generar contenido dañino, sesgado o inapropiado.
- Riesgo de alucinación: como modelo base, tiende a alucinar y no tiene mecanismos de verificación de hechos.
- Idiomas no documentados: no se especifican los idiomas soportados ni la distribución lingüística del entrenamiento.
- Cuantización no documentada: no hay información sobre tipos de cuantización soportados oficialmente.
- Uso en producción no recomendado: el propio fabricante indica que no debe usarse directamente en producción sin post-entrenamiento y validación específica.
- Requisitos de hardware elevados: a pesar de los 5,1B activos, los 127B totales requieren infraestructura significativa para cualquier operación.

## Enlaces

- [HuggingFace: inclusionAI/Ling-3.0-flash-base-30T](https://huggingface.co/inclusionAI/Ling-3.0-flash-base-30T)
- [HuggingFace: inclusionAI/Ling-3.0-flash (modelo post-entrenado)](https://huggingface.co/inclusionAI/Ling-3.0-flash)
- [HuggingFace: inclusionAI (organización)](https://huggingface.co/inclusionAI)
- [ModelScope: inclusionAI](https://modelscope.cn/organization/inclusionAI)
- [OpenRouter: Ling-3.0-flash](https://openrouter.ai/inclusionai/ling-3.0-flash:free)
- [Paper WSM: arXiv:2507.17634](https://arxiv.org/abs/2507.17634)
- [Documentación oficial de Ling](https://developer.ant-ling.com/en/docs/models/ling/)
- [GitHub: ling-cookbook](https://github.com/inclusionAI/ling-cookbook/)
- [Benchable: Ling-3.0-flash](https://benchable.ai/models/inclusionai/ling-3.0-flash-20260723)
- [Guía completa de Ling 3.0 Flash](https://www.aimadetools.com/blog/ling-3-0-flash-complete-guide/)
