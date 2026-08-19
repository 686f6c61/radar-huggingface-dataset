# kerasformers/qwen3-4b

## Resumen

`kerasformers/qwen3-4b` es una conversión íntegra del modelo `Qwen/Qwen3-4B` al ecosistema Keras 3, desarrollada por el equipo de kerasformers (IMvision12). El objetivo es ofrecer una implementación unificada que se ejecute sin modificaciones en los tres backends principales de Keras 3: TensorFlow, PyTorch y JAX. Se trata de un modelo *dense* (no MoE) cuyos pesos se almacenan en bfloat16, con un tamaño de repositorio de 8,1 GB.

Esta conversión resuelve el problema de portabilidad para desarrolladores que trabajan con Keras y necesitan acceder a modelos de última generación como Qwen3 sin depender de frameworks específicos. Al mantener la misma arquitectura que el modelo original, conserva todas sus capacidades de generación de texto, razonamiento y código, pero con la ventaja de poder alternar entre backends según las necesidades de cada proyecto. Su relevancia actual radica en la creciente adopción de Keras 3 como capa de abstracción multi-framework y en la demanda de pesos listos para usar en entornos de investigación y producción.

La arquitectura subyacente es un transformer *dense* estándar de la familia Qwen3, con atención de múltiples cabezas y alimentación hacia adelante. Aunque la model card no especifica la longitud de contexto, el modelo base Qwen3-4B soporta hasta 32 768 tokens gracias a la técnica YaRN, mencionada en la documentación. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer *dense* (Qwen3) |
| Parametros totales | 4 000 millones (inferido del nombre del modelo; no confirmado en la model card) |
| Parametros activos | No aplica (modelo *dense*) |
| Longitud de contexto | No disponible en la model card; el modelo base Qwen3-4B soporta 32 768 tokens |
| Tipos de cuantizacion | Pesos en bfloat16 (sin cuantización adicional documentada) |
| Idiomas soportados | Inglés (según la model card; el modelo base soporta múltiples idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | No especificado (probablemente safetensors, pero no se indica) |

## Arquitectura y entrenamiento

La arquitectura es idéntica a la del `Qwen/Qwen3-4B` original: un transformer *dense* con normalización previa, atención de múltiples cabezas y capas de alimentación hacia adelante. No se trata de un modelo reentrenado, sino de una conversión de pesos desde el formato original de PyTorch a Keras 3. La implementación de kerasformers permite cargar los pesos con `from_weights` y ejecutar la generación de texto mediante la clase `Qwen3TextGenerate`. El uso de la técnica YaRN para extensión de contexto está referenciado en la documentación, lo que sugiere que la conversión mantiene la capacidad de manejar ventanas largas.

El entrenamiento original de Qwen3-4B fue realizado por Alibaba con un corpus multilingüe y técnicas de alineación como RLHF y DPO, pero estos detalles no se repiten en la model card de esta conversión. La innovación principal de esta versión no está en la arquitectura, sino en la portabilidad: una sola implementación en Keras 3 que funciona sin cambios en TensorFlow, PyTorch y JAX, facilitando la experimentación multi-framework.

## Capacidades

- Generación de texto en inglés, con capacidad de razonamiento y comprensión del lenguaje natural (heredadas del modelo base).
- Soporte de generación de código y resolución de problemas matemáticos, aunque no se detalla en la model card.
- Ejecución idéntica en los tres backends de Keras 3 (TensorFlow, PyTorch, JAX), lo que permite cambiar de backend sin modificar el código.
- Carga de pesos directa desde Hugging Face mediante `from_weights`, sin necesidad de conversión manual.
- Integración con el ecosistema Keras, incluyendo capas personalizadas y pipelines de entrenamiento.
- No se documentan capacidades específicas de tool calling, agentes o multimodalidad en esta conversión; habría que verificar el modelo base.

## Casos de uso

- **Investigación en eficiencia multi-backend**: comparar el rendimiento de Qwen3-4B en TensorFlow, PyTorch y JAX usando exactamente el mismo código, ideal para estudios de latencia y consumo de memoria.
- **Prototipado rápido en Keras**: desarrolladores que ya trabajan con Keras pueden integrar Qwen3-4B en sus pipelines de generación de texto sin salir de su framework habitual.
- **Despliegue en entornos con restricciones de dependencias**: si un proyecto exige TensorFlow o JAX, esta conversión evita tener que instalar PyTorch únicamente para el modelo.
- **Fine-tuning con Keras**: al estar disponible en formato Keras, se puede ajustar el modelo con las APIs nativas de Keras 3, aprovechando su integración con tf.data, callbacks y distribución.
- **Aplicaciones de generación de código asistida**: el modelo base Qwen3-4B es competente en tareas de programación, y esta conversión permite usarlo en entornos de desarrollo que ya usan Keras.
- **Educación y experimentación**: estudiantes e investigadores pueden explorar el comportamiento de un modelo de 4B parámetros en diferentes backends sin necesidad de configurar múltiples entornos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de MMLU, HumanEval ni otros estándares, y tampoco se comparan con el modelo original. Para obtener datos de rendimiento, se debe consultar la documentación del modelo base `Qwen/Qwen3-4B`.

## Requisitos de hardware

- **VRAM estimada**: con pesos en bfloat16, el modelo ocupa aproximadamente 8 GB (4 000 millones de parámetros × 2 bytes). Para inferencia con contexto moderado, se recomienda al menos 10-12 GB de VRAM para dejar margen a los estados intermedios y la caché de atención.
- **GPU recomendadas**: tarjetas con 12 GB o más, como RTX 3060 12 GB, RTX 4070, RTX 4080, A10, A100 o H100. En consumer, una RTX 3090 o 4090 funcionará sin problemas.
- **¿Cabe en GPU consumer?**: sí, en GPUs con 12 GB o más, siempre que se use bfloat16 y se limite la longitud de la secuencia. Con cuantización adicional (no documentada) podría caber en 8 GB, pero no se ofrece.
- **Opciones de despliegue**: al ser una conversión Keras, se puede ejecutar con los backends de TensorFlow, PyTorch o JAX. No se menciona compatibilidad con vLLM, llama.cpp u Ollama; esta conversión está pensada para el ecosistema Keras.
- **Latencia y throughput**: no se proporcionan datos. La latencia dependerá del backend y del hardware; en una GPU moderna se espera una generación de decenas de tokens por segundo, pero es una estimación sin base documentada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Backends |
|---|---|---|---|---|---|
| `kerasformers/qwen3-4b` (esta conversión) | 4B | 32K (base) | Apache 2.0 | Keras 3 (bfloat16) | TF, Torch, JAX |
| `Qwen/Qwen3-4B` (original) | 4B | 32K | Apache 2.0 | PyTorch | PyTorch |
| `Qwen/Qwen3-4B-GGUF` (cuantizado, de la comunidad) | 4B | 32K | Apache 2.0 | GGUF | llama.cpp, Ollama |

La principal diferencia frente al original es el formato de pesos y la portabilidad multi-backend. Frente a las versiones GGUF, esta conversión no está optimizada para CPU ni para despliegue ligero, pero ofrece integración nativa con Keras. La licencia es idéntica en todos los casos.

## Limitaciones y advertencias

- **Idioma**: la model card declara solo inglés, aunque el modelo base soporta más idiomas. Puede haber diferencias de comportamiento en otros idiomas.
- **Alucinación**: como cualquier LLM, puede generar contenido falso o inventado; se recomienda validación humana en aplicaciones críticas.
- **Contexto**: aunque el modelo base soporta 32K tokens, esta conversión no documenta explícitamente el manejo de contextos largos; es necesario probar.
- **Sesgos**: el modelo base puede contener sesgos derivados de sus datos de entrenamiento; no se ofrecen garantías de imparcialidad.
- **Formato de pesos**: no se especifica si los archivos son safetensors u otro formato, lo que puede afectar la interoperabilidad con herramientas externas.
- **Soporte limitado**: es una conversión de la comunidad, sin respaldo oficial de Alibaba. Los bugs deben reportarse en el repositorio de kerasformers.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero se deben respetar los términos del modelo base y de la conversión.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/kerasformers/qwen3-4b)
- [Repositorio GitHub de KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación de Qwen3 en KerasFormers](https://imvision12.github.io/KerasFormers/qwen3/)
- [Colección Qwen3 en Hugging Face](https://huggingface.co/collections/kerasformers/qwen3-6a7d3fcc4e56b32e86f5b2c4)
- [Qwen3 Technical Report (arXiv:2505.09388)](https://arxiv.org/abs/2505.09388)
- [YaRN: Efficient Context Window Extension (arXiv:2309.00071)](https://arxiv.org/abs/2309.00071)
- [Modelo original Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
