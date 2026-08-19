# kerasformers/qwen3-30b-a3b-base

## Resumen

kerasformers/qwen3-30b-a3b-base es una conversión íntegra en Keras 3 del modelo Qwen3-30B-A3B-Base de Alibaba, publicada por el desarrollador kerasformers (IMvision12). El objetivo de esta conversión es ofrecer una única implementación que funcione sin modificaciones sobre los tres backends principales de Keras 3: TensorFlow, PyTorch y JAX. Se trata de un modelo de generación de texto con arquitectura Mixture-of-Experts (MoE), con aproximadamente 30.500 millones de parámetros totales y unos 3.300 millones de parámetros activos por token.

El modelo hereda todas las capacidades del Qwen3-30B-A3B-Base original, incluyendo una ventana de contexto de 32.768 tokens y los pesos almacenados en bfloat16. Al ser una versión base (sin ajuste por chat), está pensada para fine-tuning o para investigación, y no para uso conversacional directo. Su relevancia radica en que permite ejecutar un modelo MoE de gran tamaño dentro del ecosistema Keras 3, aprovechando la flexibilidad de cambiar de backend sin reescribir código. La licencia Apache 2.0 facilita su uso comercial y académico.

El repositorio ocupa 61,1 GB, lo que corresponde exactamente a los 30.500 millones de parámetros almacenados en bfloat16 (2 bytes por parámetro). El modelo referencia el informe técnico de Qwen3 (arXiv:2505.09388) para todos los detalles arquitectónicos y de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con Mixture-of-Experts (MoE) |
| Parametros totales | ~30,5 mil millones |
| Parametros activos | ~3,3 mil millones |
| Longitud de contexto | 32.768 tokens |
| Tipos de cuantizacion | bfloat16 (formato nativo del repositorio); no se proporcionan cuantizaciones adicionales |
| Idiomas soportados | ingles (segun model card; el modelo base soporta mas idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | Keras 3 (bfloat16) |

## Arquitectura y entrenamiento

El modelo es una conversión directa del Qwen3-30B-A3B-Base de Alibaba, que emplea una arquitectura transformer decoder-only con atención GQA (Grouped Query Attention) y capas MoE con múltiples expertos enrutados, de los cuales solo una fracción se activa por token. Esta configuración permite que, pese a tener 30.500 millones de parámetros totales, solo se ejecuten unos 3.300 millones por token, lo que reduce sustancialmente el coste computacional de inferencia respecto a un modelo denso de tamaño equivalente. El entrenamiento original del modelo base fue realizado por el equipo Qwen de Alibaba, tal y como se detalla en el informe técnico de Qwen3 (arXiv:2505.09388). Esta conversión en Keras 3 no modifica los pesos ni la arquitectura; únicamente reimplementa el modelo con la API nativa de Keras 3, permitiendo ejecutarlo sobre TensorFlow, PyTorch o JAX sin cambios en el código. Los pesos se almacenan en bfloat16, lo que explica el tamaño del repositorio de 61,1 GB.

## Capacidades

- Generación de texto autoregresiva: el modelo es capaz de generar texto coherente y de alta calidad en inglés, al ser una versión base del Qwen3-30B-A3B.
- Eficiencia computacional MoE: al activar solo ~3,3 mil millones de parámetros por token, ofrece un rendimiento de inferencia comparable a un modelo denso de ~3-4 mil millones de parámetros, pero con la capacidad de un modelo de 30 mil millones.
- Multi-backend: la implementación en Keras 3 permite ejecutar el modelo sobre TensorFlow, PyTorch o JAX sin modificar el código, lo que facilita la integración en entornos heterogéneos.
- Ventana de contexto amplia: soporta hasta 32.768 tokens, adecuado para tareas que requieren contexto largo.
- Fine-tuning: al ser un modelo base, está diseñado para ser ajustado con datos específicos de dominio o tarea.
- Sin capacidades de chat, tool calling
