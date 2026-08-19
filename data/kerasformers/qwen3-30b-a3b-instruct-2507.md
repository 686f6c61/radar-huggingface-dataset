# kerasformers/qwen3-30b-a3b-instruct-2507

## Resumen

`kerasformers/qwen3-30b-a3b-instruct-2507` es una conversión íntegra al framework **Keras 3** del modelo original `Qwen/Qwen3-30B-A3B-Instruct-2507`, desarrollada por el equipo de KerasFormers. Su objetivo es permitir ejecutar un modelo de la familia Qwen3 con arquitectura Mixture-of-Experts (MoE) utilizando cualquiera de los tres backends de Keras 3: TensorFlow, PyTorch o JAX, sin modificar el código. Esto resulta relevante para desarrolladores que trabajan en ecosistemas Keras o que necesitan portabilidad entre frameworks sin sacrificar el rendimiento del modelo original.

El modelo mantiene la arquitectura MoE del Qwen3, con un total de aproximadamente 30 mil millones de parámetros, de los cuales solo 3 mil millones se activan por token, lo que lo hace especialmente eficiente en cómputo e inferencia en comparación con modelos densos de tamaño similar. Los pesos se almacenan en **bfloat16** y el repositorio ocupa 61,1 GB. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. No se especifica la longitud de contexto en la información disponible, aunque el modelo base original soporta ventanas largas; se remite a la model card del modelo original para detalles técnicos completos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (Mixture-of-Experts) |
| Parametros totales | 30B (aprox., según nomenclatura del modelo) |
| Parametros activos | 3B (aprox., según nomenclatura del modelo) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos originales); no se documentan cuantizaciones adicionales |
| Idiomas soportados | en (según model card; el modelo original soporta múltiples idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 61,1 GB, pesos en bfloat16) |

## Arquitectura y entrenamiento

El modelo es una conversión directa de los pesos del `Qwen3-30B-A3B-Instruct-2507` original, por lo que hereda su arquitectura MoE: cada capa contiene múltiples expertos y un mecanismo de enrutamiento que activa solo un subconjunto de ellos por token. Esta conversión no modifica los pesos ni la topología, sino que reimplementa el modelo en Keras 3, permitiendo que la misma instancia se ejecute en TensorFlow, PyTorch o JAX. El entrenamiento original del modelo base se describe en el Qwen3 Technical Report (arXiv:2505.09388), aunque la información proporcionada no incluye detalles sobre el dataset, el número de tokens o el proceso de alineación (RLHF/DPO). La model card hace referencia a papers sobre escalado de contexto largo y aceleración de pre-filling, lo que sugiere que el modelo original incorpora técnicas de atención dispersa dinámica, pero no se confirma en esta conversión.

## Capacidades

- Generación de texto y seguimiento de instrucciones, al ser una variante instruct.
- Capacidades de razonamiento y generación de código propias del modelo Qwen3 original (según la documentación del modelo base, aunque no se detallan en la model card de esta conversión).
- Soporte multi-backend: la misma implementación funciona en TensorFlow, PyTorch y JAX, lo que facilita la integración en distintos entornos.
- No se documentan explícitamente en esta model card capacidades como tool calling, agentes, visión o audio; se remite a la model card del modelo original para una lista completa.

## Casos de uso

- Asistente conversacional: al ser un modelo instruct con 3B de parámetros activos, puede gestionar diálogos multi-turno con baja latencia en GPUs de centro de datos, siendo adecuado para chatbots empresariales o asistentes virtuales.
- Generación de contenido: útil para redactar artículos, informes o documentación técnica, aprovechando su capacidad de seguir instrucciones detalladas.
- Resumen de documentos largos: aunque la longitud de contexto no está especificada, el modelo base Qwen3 soporta ventanas largas; puede emplearse para resumir contratos, papers o informes extensos.
- Análisis de código y asistencia de programación: puede generar, explicar o depurar código en múltiples lenguajes, integrándose en IDEs o pipelines de desarrollo.
- Traducción automática: el modelo original soporta varios idiomas, por lo que esta conversión puede utilizarse para tareas de traducción, aunque la model card solo indica inglés como idioma principal.
- Prototipado rápido en investigación: gracias a su compatibilidad con JAX y TensorFlow, permite experimentar con técnicas de entrenamiento o fine-tuning en frameworks distintos a PyTorch sin cambiar de modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Para datos de rendimiento del modelo original, se recomienda consultar la model card de `Qwen/Qwen3-30B-A3B-Instruct-2507` o el Qwen3 Technical Report.

## Requisitos de hardware

- VRAM estimada: aproximadamente 60 GB en bfloat16 para cargar los 30B parámetros completos (61,1 GB de pesos), más overhead de activaciones y memoria intermedia.
- GPU recomendadas: NVIDIA A100 80GB, H100 80GB o similares con 80 GB de VRAM; también posible en configuraciones multi-GPU (por ejemplo, 2x RTX 6000 Ada o 2x A100 40GB).
- No cabe en GPUs de consumo (RTX 4090, 3090, etc.) sin cuantización, ya que estas disponen de 24 GB de VRAM como máximo.
- Opciones de despliegue: al ser Keras 3, se puede ejecutar con backend JAX, TensorFlow o PyTorch; no se documentan integraciones con vLLM, llama.cpp u Ollama en la model card.
- Latencia y throughput: no disponibles; dependen del backend, la GPU y la configuración de batch.

## Comparativa con modelos similares

No se dispone de datos comparativos en la información proporcionada. Como referencia cualitativa, este modelo es una conversión del Qwen3-30B-A3B-Instruct-2507, por lo que su rendimiento debería ser equivalente al del modelo original en formato PyTorch. Otras alternativas MoE de tamaño similar incluyen DeepSeek-V3 (671B totales, 37B activos) y Mixtral 8x7B (47B totales, 13B activos), pero no se han realizado comparaciones directas en esta documentación. Para una evaluación cuantitativa, se recomienda consultar los benchmarks publicados del modelo original.

## Limitaciones y advertencias

- La model card de esta conversión no documenta sesgos, alucinaciones ni limitaciones específicas; se heredan las del modelo original Qwen3.
- Requiere una cantidad elevada de VRAM (alrededor de 60 GB en bfloat16), lo que limita su uso a hardware de gama alta o configuraciones multi-GPU.
- La longitud de contexto no está especificada en la información disponible; es necesario verificar la model card del modelo original para conocer el límite real.
- Aunque la licencia Apache 2.0 permite uso comercial, el modelo puede generar contenido incorrecto o sesgado; se recomienda validación humana en aplicaciones de producción.
- La compatibilidad con herramientas estándar de inferencia (vLLM, TGI, llama.cpp) no está garantizada, ya que la implementación es específica de Keras 3.

## Enlaces

- HuggingFace: https://huggingface.co/kerasformers/qwen3-30b-a3b-instruct-2507
- Repositorio GitHub de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de Qwen3 en KerasFormers: https://imvision12.github.io/KerasFormers/qwen3/
- Colección de modelos Qwen3 MoE en HuggingFace: https://huggingface.co/collections/kerasformers/qwen3-moe-6a7f9b1eacaba9aba25a1d63
- Modelo original: https://huggingface.co/Qwen/Qwen3-30B-A3B-Instruct-2507
- Qwen3 Technical Report: https://arxiv.org/abs/2505.09388
- Qwen2.5-1M Technical Report: https://arxiv.org/abs/2501.15383
- MInference 1.0 (aceleración de pre-filling): https://arxiv.org/abs/2407.02490
- RULER (evaluación de contexto largo): https://arxiv.org/abs/2404.06654
- Training-Free Long-Context Scaling: https://arxiv.org/abs/2402.17463
