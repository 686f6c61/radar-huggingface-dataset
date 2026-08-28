# Oscilla/Qwen3.5-2B-mlx-8Bit

## Resumen

Oscilla/Qwen3.5-2B-mlx-8Bit es una conversión al formato MLX del modelo Qwen/Qwen3.5-2B, realizada por el usuario Oscilla mediante la librería mlx-lm en su versión 0.31.2. Se trata de un modelo multimodal (imagen-texto a texto) de la familia Qwen3.5, cuantizado a 8 bits, pensado para ejecutarse eficientemente en hardware Apple Silicon a través del ecosistema MLX. La conversión mantiene la licencia Apache 2.0 del modelo original y está diseñada para ser compatible con transformers y endpoints de inferencia.

El modelo base, Qwen3.5-2B, es una versión compacta de la serie Qwen3.5 que incorpora capacidades de visión y lenguaje, con una arquitectura que según los resultados de búsqueda incluye componentes MoE (mezcla de expertos) con capas de puerta y expertos compartidos, lo que explica el número de parámetros totales de aproximadamente 530 millones. La cuantización a 8 bits reduce el tamaño del repositorio a 2.0 GB, lo que lo hace adecuado para dispositivos con memoria unificada limitada. Su relevancia radica en ofrecer una alternativa ligera y de código abierto para tareas de visión-lenguaje en entornos locales, especialmente en equipos Apple.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) con componentes MoE (según información de conversión) |
| Parametros totales | 529.657.664 |
| Parametros activos | no disponible (probablemente menor por arquitectura MoE) |
| Longitud de contexto | no disponible (una fuente externa indica 4.096 tokens, sin confirmar) |
| Tipos de cuantizacion | 8 bits (MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base Qwen3.5-2B no se detalla en la información proporcionada, pero los resultados de búsqueda indican que la conversión MLX requirió correcciones específicas para manejar correctamente la cuantización de capas MoE, incluyendo capas de puerta, puertas de experto compartido y el casting de la variable A_log. Esto sugiere que el modelo emplea una arquitectura de mezcla de expertos (MoE) dentro de un framework transformer multimodal, con un codificador de visión y un decodificador de lenguaje. El entrenamiento del modelo original no está documentado en los datos disponibles; no se mencionan el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO. La conversión a MLX se realizó con mlx-lm 0.31.2 y mlx-vlm desde una rama específica que incluye correcciones para los predicados de cuantización de Qwen3.5.

## Capacidades

- Procesamiento de entradas multimodales: el pipeline es image-text-to-text, por lo que puede recibir imágenes y texto como entrada y generar texto.
- Generación de texto conversacional: soporta plantillas de chat mediante apply_chat_template, permitiendo interacciones multi-turno.
- Ejecución eficiente en Apple Silicon: gracias al formato MLX y la cuantización de 8 bits, está optimizado para GPUs unificadas de Apple (M1, M2, M3, etc.).
- Compatibilidad con transformers: al estar basado en la librería transformers, puede integrarse con pipelines estándar de HuggingFace.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no especificadas, aunque los modelos Qwen suelen ser multilingües; no se confirma para esta versión.

## Casos de uso

- Asistente de visión local en macOS: el modelo puede procesar capturas de pantalla o fotos y responder preguntas sobre ellas, ejecutándose completamente en un Mac con memoria unificada de 8 GB o más gracias a su cuantización de 8 bits y su tamaño compacto.
- Prototipado rápido de aplicaciones de visión-lenguaje: los desarrolladores pueden usar este modelo en entornos de desarrollo con MLX para validar ideas antes de escalar a modelos más grandes, sin necesidad de GPUs dedicadas.
- Automatización de documentación visual: extraer descripciones de diagramas, gráficos o imágenes técnicas para generar informes o documentación automatizada en entornos donde la privacidad exige procesamiento local.
- Chatbot multimodal para atención al cliente: integrado en un servidor local con transformers, puede responder consultas que incluyan imágenes (por ejemplo, fotos de productos) manteniendo los datos en infraestructura propia.
- Educación y experimentación: útil para investigadores que estudian modelos MoE pequeños o técnicas de cuantización en MLX, dado que el repositorio incluye el código de conversión y es fácilmente reproducible.
- Despliegue en edge computing: al ocupar solo 2 GB, puede desplegarse en dispositivos Apple TV o Mac mini para aplicaciones de visión por computador en tiempo real con baja latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos. La unica referencia externa (free2aitools.com) menciona un "Nexus Index" y una estimacion de VRAM de ~3 GB, pero no proporciona datos de evaluacion fiables.

## Requisitos de hardware

- VRAM estimada: ~3 GB según una fuente externa, aunque al ser MLX utiliza memoria unificada del sistema; se recomienda un Mac con al menos 8 GB de RAM para un uso fluido.
- GPU recomendadas: cualquier chip Apple Silicon (M1, M2, M3, M4) con al menos 8 GB de memoria unificada. No requiere GPU NVIDIA.
- Compatibilidad con consumer GPU: no es aplicable directamente, ya que MLX está diseñado para Apple Silicon; para GPUs NVIDIA se necesitaría una conversión a otro formato (por ejemplo, GGUF o GPTQ).
- Opciones de despliegue: mlx-lm (inferencia local), transformers (con adaptaciones), endpoints compatibles (según tags), y plataformas como FriendliAI que ofrecen API de inferencia.
- Latencia y throughput: no disponibles; depende del hardware específico, pero por su tamaño (2B, 8 bits) se espera una generación de decenas de tokens por segundo en un Mac moderno.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos de la misma categoría. El modelo base Qwen3.5-2B podría compararse con otros modelos pequeños de visión-lenguaje como Phi-3.5-vision o LLaVA-Phi, pero no se han encontrado datos de rendimiento ni especificaciones detalladas de estos en la información proporcionada. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La información sobre el modelo original (Qwen3.5-2B) es limitada: no se conocen detalles del entrenamiento, sesgos o limitaciones específicas.
- Al ser una conversión comunitaria, no hay garantía de que la cuantización de 8 bits mantenga la fidelidad completa del modelo original; se recomienda validar en casos de uso críticos.
- La longitud de contexto no está confirmada; una fuente externa sugiere 4.096 tokens, pero no es oficial.
- No se especifican los idiomas soportados; aunque los modelos Qwen suelen ser multilingües, esta versión concreta no lo documenta.
- El pipeline image-text-to-text implica que requiere un codificador de visión, lo que aumenta la complejidad de integración en comparación con modelos solo de texto.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución y las condiciones de la licencia del modelo base.
- Para producción, es recomendable evaluar el modelo en el dominio específico, ya que no hay benchmarks publicados que avalen su rendimiento.

## Enlaces

- Repositorio del modelo: https://huggingface.co/Oscilla/Qwen3.5-2B-mlx-8Bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Conversión similar de mlx-community: https://huggingface.co/mlx-community/Qwen3.5-2B-MLX-8bit
- ModelScope (copia de mlx-community): https://www.modelscope.cn/models/mlx-community/Qwen3.5-2B-MLX-8bit
- Página de análisis externo: https://free2aitools.com/model/mlx-community/qwen3.5-2b-8bit
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/Rishu11277/Qwen3.5-2B-mlx-8Bit
