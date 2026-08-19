# kerasformers/qwen2-1.5b-instruct

## Resumen

`kerasformers/qwen2-1.5b-instruct` es una conversión íntegra a Keras 3 del modelo `Qwen/Qwen2-1.5B-Instruct` de Alibaba, realizada por la comunidad de KerasFormers. El objetivo es ofrecer una implementación de Qwen2 que funcione sin modificaciones sobre TensorFlow, PyTorch y JAX, manteniendo los pesos originales y la plantilla de chat del checkpoint instruct. Es un modelo de generación de texto conversacional, con 1.500 millones de parámetros y arquitectura transformer decoder-only.

La relevancia de esta ficha radica en que permite a desarrolladores que trabajan con Keras 3 (o que necesitan portabilidad entre backends) utilizar un modelo Qwen2 instruct sin depender de la implementación oficial de Hugging Face Transformers. Al ser una conversión de pesos, no implica un reentrenamiento, por lo que las capacidades y limitaciones son las del modelo original, aunque la integración con el ecosistema Keras puede facilitar su despliegue en entornos que ya usan TensorFlow o JAX.

El modelo se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. El repositorio tiene un tamaño de 3,1 GB, lo que sugiere pesos en precisión completa (FP32) o en BF16, aunque se ofrecen opciones de cuantización a INT8 para reducir el consumo de memoria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con grouped-query attention, SwiGLU MLP, RMSNorm y rotary position embeddings |
| Parametros totales | 1.500 millones (1,5B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificado en la ficha) |
| Tipos de cuantizacion | FP32, BF16 (via `load_dtype="bfloat16"`), INT8 (via `quantization="int8"`) |
| Idiomas soportados | Ingles (segun la model card; el modelo base Qwen2 soporta mas idiomas, pero no se detallan) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (formato propio, cargado con `from_weights`); compatible con safetensors via prefijo `hf:` |

## Arquitectura y entrenamiento

El modelo es una conversión directa de los pesos de `Qwen/Qwen2-1.5B-Instruct` al formato de Keras 3, sin reentrenamiento. La arquitectura subyacente es la de Qwen2, descrita en el paper técnico de Qwen2 (arXiv:2407.10671): un transformer decoder-only con grouped-query attention (GQA) con sesgos en q/k/v, MLP con activación SwiGLU, normalización RMSNorm y embeddings posicionales rotatorios (RoPE). El checkpoint instruct ha sido ajustado para seguir instrucciones y mantener conversaciones multi-turno mediante una plantilla de chat.

No se proporcionan datos sobre el dataset de entrenamiento original ni sobre el proceso de ajuste fino (RLHF, DPO, etc.) en la información de esta conversión. Para esos detalles, se remite a la model card del modelo base. La implementación de KerasFormers permite ejecutar el mismo código en TensorFlow, PyTorch o JAX cambiando la variable de entorno `KERAS_BACKEND`, lo que facilita la experimentación multiplataforma.

## Capacidades

- Generación de texto conversacional: al ser un checkpoint instruct, responde a instrucciones y mantiene diálogos multi-turno usando la plantilla de chat de Qwen2.
- Portabilidad entre backends: el mismo código funciona en TensorFlow, PyTorch y JAX, gracias a la capa de abstracción de Keras 3.
- Carga de pesos flexible: permite cargar en FP32, BF16 o cuantización INT8 para ajustar el consumo de memoria.
- Compatibilidad con safetensors: se pueden cargar los pesos originales de Hugging Face mediante el prefijo `hf:` (ej. `hf:Qwen/Qwen2-1.5B-Instruct`).
- Integración con el ecosistema Keras: los modelos se pueden combinar con otras capas y utilidades de Keras 3, facilitando el fine-tuning o la extracción de características.

## Casos de uso

- Chatbots ligeros para entornos con recursos limitados: con 1,5B de parámetros y cuantización INT8, el modelo puede ejecutarse en GPUs consumer con menos de 2 GB de VRAM, lo que lo hace adecuado para asistentes conversacionales en aplicaciones de escritorio o servidores de baja capacidad.
- Prototipado rápido de aplicaciones de IA generativa: su facilidad de carga y la compatibilidad multi-backend permiten iterar rápidamente sobre ideas de producto sin necesidad de infraestructura grande.
- Fine-tuning específico para dominios: al ser un modelo pequeño, se puede ajustar con datasets reducidos en una sola GPU (por ejemplo, RTX 3090 o 4090) para tareas como clasificación de textos, generación de respuestas en dominios técnicos o resumen de documentos.
- Generación de texto en entornos edge: su tamaño reducido y la posibilidad de cuantización lo hacen viable para desplegar en dispositivos con aceleración de TensorFlow Lite o JAX en hardware embebido.
- Educación e investigación: sirve como ejemplo práctico de cómo portar un modelo transformer a Keras 3, y permite estudiar la arquitectura Qwen2 sin depender de la implementación de Transformers.
- Integración en pipelines de Keras 3: si un proyecto ya usa Keras para otras tareas (visión, tabular, etc.), este modelo se integra sin fricción, permitiendo construir sistemas multimodales o híbridos con un único framework.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Estimación de VRAM para inferencia (cálculo orientativo basado en 1,5B parámetros):
  - FP32: ~6 GB
  - BF16: ~3 GB
  - INT8: ~1,5 GB
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para BF16 (ej. RTX 3060, RTX 4060); para FP32 se recomienda 8 GB o más (RTX 3070, RTX 4070, A10). Con INT8 puede funcionar en GPUs de 2 GB (ej. Jetson Nano, GTX 1650).
- Opciones de despliegue: al ser una implementación de Keras 3, se puede servir mediante TensorFlow Serving, o exportar a SavedModel para producción. No se menciona compatibilidad con vLLM, llama.cpp u Ollama en la ficha.
- Latencia y throughput: no se proporcionan datos oficiales; dependerá del backend y del hardware. En una GPU moderna, se espera una generación de decenas de tokens por segundo para este tamaño.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Framework | Licencia | Notas |
|---|---|---|---|---|---|
| `kerasformers/qwen2-1.5b-instruct` | 1,5B | No disponible | Keras 3 (TF/Torch/JAX) | Apache 2.0 | Conversión a Keras 3, pesos del Qwen2 original |
| `Qwen/Qwen2-1.5B-Instruct` | 1,5B | No disponible (original) | Transformers | Apache 2.0 | Modelo oficial de Alibaba, más ecosistema de herramientas |
| `TinyLlama-1.1B-Chat` | 1,1B | 2k (aprox.) | Transformers | Apache 2.0 | Alternativa más pequeña, menos capaz en razonamiento |

La comparativa se limita a parámetros y licencia, ya que no se dispone de datos de rendimiento ni contexto confirmado para esta conversión. La principal diferencia con el modelo original es el framework: Keras 3 frente a Transformers, lo que afecta a la integración con otros componentes del ecosistema.

## Limitaciones y advertencias

- Al ser un modelo de 1,5B, su capacidad de razonamiento complejo, matemáticas avanzadas o generación de código extenso es limitada en comparación con modelos más grandes (7B o superiores).
- Puede presentar alucinaciones, especialmente en temas especializados o cuando se le pide información factual sin contexto suficiente.
- La ficha solo indica inglés como idioma soportado; aunque Qwen2 base es multilingüe, esta conversión no garantiza el mismo rendimiento en otros idiomas.
- No se especifica la longitud de contexto; se recomienda consultar la documentación del modelo base para conocer el límite real antes de usarlo en producción.
- La conversión a Keras 3 podría introducir pequeñas diferencias numéricas respecto al modelo original, aunque no se han documentado.
- Para uso comercial, la licencia Apache 2.0 es permisiva, pero se debe verificar el cumplimiento de las condiciones de atribución si se redistribuye el modelo.

## Enlaces

- [HuggingFace - kerasformers/qwen2-1.5b-instruct](https://huggingface.co/kerasformers/qwen2-1.5b-instruct)
- [Modelo base - Qwen/Qwen2-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2-1.5B-Instruct)
- [Paper Qwen2 (arXiv:2407.10671)](https://arxiv.org/abs/2407.10671)
- [HF Papers - Qwen2 Technical Report](https://huggingface.co/papers/2407.10671)
- [GitHub - KerasFormers](https://github.com/IMvision12/KerasFormers)
- [Documentación Qwen2 en KerasFormers](https://imvision12.github.io/KerasFormers/qwen2/)
- [Colección de modelos Qwen2 en KerasFormers](https://huggingface.co/collections/kerasformers/qwen2-6a69d274d16370be5d0221c8)
