# kerasformers/qwen3-1.7b

## Resumen

`kerasformers/qwen3-1.7b` es una conversión íntegra del modelo `Qwen/Qwen3-1.7B` realizada con Keras 3 y publicada bajo el proyecto KerasFormers. Su propósito es permitir ejecutar el modelo Qwen3 en cualquier backend compatible con Keras 3 (TensorFlow, PyTorch o JAX) sin modificar el código. Los pesos se almacenan en bfloat16 y el repositorio ocupa 3,5 GB. Se trata de una variante densa de Qwen3, tal y como indica la etiqueta `qwen3-dense`. Esta conversión resulta relevante para desarrolladores que trabajan con Keras y desean integrar un modelo de generación de texto de última generación en sus pipelines sin depender de librerías específicas de un solo framework. La model card remite al informe técnico de Qwen3 (arXiv:2505.09388) para los detalles del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3) |
| Parametros totales | 1,7 mil millones (según el nombre del modelo base) |
| Parametros activos | no disponible (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (pesos almacenados) |
| Idiomas soportados | en (según la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | bfloat16 (formato Keras, no se especifica safetensors) |

## Arquitectura y entrenamiento

La model card no proporciona detalles sobre la arquitectura interna ni sobre el proceso de entrenamiento, ya que se trata de una conversión de pesos del modelo original `Qwen/Qwen3-1.7B`. Se indica únicamente que es una variante densa de Qwen3 y que los pesos se almacenan en bfloat16. Para información sobre la arquitectura, los datos de entrenamiento y las técnicas de alineación (RLHF, DPO, etc.) se remite al informe técnico de Qwen3 (arXiv:2505.09388) y a la model card del modelo base. La conversión en sí no introduce cambios arquitectónicos; su valor reside en la portabilidad entre backends de Keras 3.

## Capacidades

- Generación de texto: la model card muestra un ejemplo de generación con `max_new_tokens=128`.
- Ejecución multiplataforma: la misma implementación funciona sin modificaciones en TensorFlow, PyTorch y JAX gracias a Keras 3.
- Carga de pesos desde Hugging Face mediante `from_weights`.
- Compatibilidad con el tokenizador Qwen3 incluido en KerasFormers.
- No se documentan capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio en la model card.

## Casos de uso

- Prototipado rápido en Keras: los desarrolladores que trabajan con Keras 3 pueden integrar Qwen3-1.7B en sus flujos de experimentación sin cambiar de framework.
- Investigación en multi-backend: permite comparar el rendimiento de inferencia entre TensorFlow, PyTorch y JAX usando exactamente el mismo modelo y código.
- Despliegue en entornos con restricciones de framework: si una infraestructura requiere JAX o TensorFlow, esta conversión ofrece una vía para usar Qwen3 sin depender de PyTorch.
- Educación y formación: sirve como ejemplo de cómo convertir y ejecutar un modelo LLM con Keras 3, útil para cursos o talleres.
- Integración en pipelines de generación de texto existentes basados en Keras: se puede sustituir un modelo más antiguo por Qwen3-1.7B manteniendo la interfaz de Keras.
- Evaluación de la calidad de la conversión: permite verificar que los pesos convertidos reproducen fielmente el comportamiento del modelo original, útil para auditorías de portabilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de rendimiento, latencia ni comparaciones con otros modelos. Se recomienda consultar el informe técnico de Qwen3 para los resultados del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio pesa 3,5 GB en bfloat16, lo que sugiere que se necesitan al menos 4 GB de VRAM para cargar los pesos, pero no hay datos oficiales.
- GPU recomendadas: no disponible. Al ser un modelo de 1,7 mil millones de parámetros, es probable que quepa en GPUs de consumo como la RTX 3060 o superiores, pero no se confirma.
- Opciones de despliegue: la model card muestra el uso mediante la librería KerasFormers, que depende de Keras 3. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3-1.7B (original) | 1,7B | no disponible | Apache 2.0 | Hugging Face (formato original) |
| kerasformers/qwen3-1.7b (esta conversión) | 1,7B | no disponible | Apache 2.0 | Hugging Face (formato Keras) |
| kerasformers/qwen3-0.6b | 0,6B | no disponible | Apache 2.0 | Hugging Face (formato Keras) |

La comparativa se limita a la familia Qwen3 convertida por KerasFormers, ya que no se dispone de datos de otros modelos comparables en la información proporcionada. La principal diferencia entre esta conversión y el modelo original es el formato de pesos y la portabilidad entre backends.

## Limitaciones y advertencias

- Conversión no oficial: se trata de un trabajo de la comunidad (kerasformers), no del equipo de Qwen. Aunque la licencia es Apache 2.0, el soporte y mantenimiento dependen del autor.
- Idiomas: la model card indica únicamente inglés. El modelo original puede soportar más idiomas, pero no se documenta en esta conversión.
- Sin información sobre sesgos o alucinaciones: no se proporcionan datos específicos. Se recomienda consultar la model card del modelo base para conocer las limitaciones conocidas de Qwen3.
- Requisitos de dependencias: es necesario instalar Keras 3 y el backend deseado (TensorFlow, PyTorch o JAX), lo que añade complejidad en entornos de producción.
- Rendimiento no validado: al no haber benchmarks publicados, no se puede garantizar que la conversión reproduzca exactamente el rendimiento del modelo original en todas las tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/kerasformers/qwen3-1.7b
- Repositorio de KerasFormers: https://github.com/IMvision12/KerasFormers
- Documentación de Qwen3 en KerasFormers: https://imvision12.github.io/KerasFormers/qwen3/
- Informe técnico de Qwen3 (arXiv): https://arxiv.org/abs/2505.09388
- Página del paper en HF: https://huggingface.co/papers/2505.09388
- Modelo base original: https://huggingface.co/Qwen/Qwen3-1.7B
