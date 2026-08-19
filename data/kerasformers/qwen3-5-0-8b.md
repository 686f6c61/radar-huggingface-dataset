# kerasformers/qwen3.5-0.8b

## Resumen

Este repositorio aloja una conversión pura en Keras 3 del modelo Qwen/Qwen3.5-0.8B, realizada por el autor `kerasformers`. El objetivo es ofrecer los pesos del modelo en un formato nativo de Keras 3 (compatible con TensorFlow, JAX y PyTorch) para su uso con la librería KerasFormers. Se trata de una conversión de pesos y tokenizador, no de un nuevo entrenamiento.

La relevancia de esta publicación radica en la posibilidad de ejecutar un modelo de la familia Qwen (aproximadamente 0.8 mil millones de parámetros, según el nombre) dentro del ecosistema Keras, lo que facilita su integración en flujos de trabajo que ya usan esta librería. No se proporcionan detalles sobre arquitectura, contexto o capacidades específicas más allá de los del modelo base, que tampoco se documentan en esta ficha.

El repositorio tiene un tamaño de 1,5 GB, lo que sugiere que los pesos están almacenados en precisión bf16 (2 bytes por parámetro, consistente con ~0,8B parámetros). La licencia es Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el nombre sugiere ~0,8 mil millones, sin confirmar) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (según la descripción "Pure-Keras 3 conversion ... bf16") |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (probablemente archivos .keras o .h5, no especificado) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, el proceso de entrenamiento, los datos utilizados ni las técnicas de alineación (RLHF, DPO, etc.). El repositorio solo indica que se trata de una conversión de los pesos del modelo Qwen/Qwen3.5-0.8B a Keras 3, sin modificaciones adicionales. Por tanto, cualquier característica arquitectónica o de entrenamiento debería consultarse en la documentación del modelo original (Qwen/Qwen3.5-0.8B), que no está incluida en esta ficha.

## Capacidades

- No se han documentado capacidades específicas en la información proporcionada.
- Al ser una conversión de un modelo de lenguaje, se espera que pueda realizar tareas de generación de texto, pero no se confirma ni se detalla.
- No se menciona soporte para tool calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

No se han publicado casos de uso recomendados por el autor en la información disponible. Dado el tamaño reducido del modelo (0,8B), podría emplearse en escenarios con recursos limitados, como:

- Generación de texto ligera en dispositivos con poca memoria.
- Prototipado rápido de aplicaciones basadas en lenguaje natural usando Keras.
- Experimentación académica con modelos pequeños en el ecosistema Keras.
- Tareas de clasificación o extracción de información simple, siempre que se valide su rendimiento.
- Integración en pipelines de TensorFlow/JAX donde se requiera un modelo de lenguaje pequeño.
- Fine-tuning posterior con datos propios, aprovechando la licencia Apache 2.0.

Estos casos son inferencias razonables a partir del tamaño y la licencia, no afirmaciones documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: basándose en el tamaño del repositorio (1,5 GB en bf16), se estiman ~2-3 GB de VRAM para cargar los pesos y realizar inferencia, aunque no hay datos oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, etc.) podría ser suficiente, pero no hay confirmación.
- Al ser una conversión para Keras 3, es compatible con backend de TensorFlow, JAX o PyTorch, lo que permite ejecución en CPU o GPU.
- Opciones de despliegue: se puede usar directamente con KerasFormers, o exportar a otros formatos (p. ej., TensorFlow SavedModel) para servir con TensorFlow Serving. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de tamaño similar (p. ej., Qwen2.5-0.5B, TinyLlama-1.1B, Phi-2) en la información proporcionada. Se recomienda consultar benchmarks públicos para evaluar el rendimiento relativo.

## Limitaciones y advertencias

- Conversión no oficial: el repositorio es mantenido por un tercero (`kerasformers`), no por el equipo de Qwen. Puede haber diferencias en el comportamiento respecto al modelo original.
- Falta de documentación: no se especifican arquitectura, contexto, idiomas, ni capacidades, lo que dificulta su uso en producción sin validación previa.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede presentar sesgos y generar contenido incorrecto, pero no hay información específica sobre este modelo.
- Licencia: Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base (Qwen/Qwen3.5-0.8B) por si tuviera restricciones adicionales.
- Tamaño de contexto y rendimiento: al no conocerse el contexto máximo, no se puede garantizar su comportamiento en tareas que requieran ventanas largas.
- Formato de pesos: al ser específico de Keras, puede requerir conversión adicional para usarse con otras herramientas (p. ej., Transformers de HuggingFace).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/kerasformers/qwen3.5-0.8b
- Colección Qwen3.5 de kerasformers: https://huggingface.co/collections/kerasformers/qwen35-6a7e5421737d73e63669ebb9
- Repositorio de KerasFormers: https://github.com/IMvision12/KerasFormers
- Modelo base (referencia): https://huggingface.co/Qwen/Qwen3.5-0.8B
