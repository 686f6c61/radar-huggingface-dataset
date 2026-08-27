# Oscilla/Qwen3.5-0.8B-mlx-4Bit

## Resumen

El modelo **Oscilla/Qwen3.5-0.8B-mlx-4Bit** es una conversión a formato MLX del modelo base **Qwen/Qwen3.5-0.8B**, cuantizado a 4 bits. El autor, Oscilla, ha adaptado el modelo original de Alibaba para su ejecución eficiente en hardware Apple Silicon mediante la librería `mlx-lm` (versión 0.31.2). Con solo 117,98 millones de parámetros, se enmarca en la categoría de *small language models* (SLM), priorizando baja latencia y mínimo consumo de memoria frente a capacidad de conocimiento masiva.

El modelo base Qwen3.5-0.8B pertenece a la familia Qwen3.5 de Alibaba, que incorpora una arquitectura unificada de visión-lenguaje con entrenamiento de fusión temprana en tokens multimodales. Esto le permite procesar tanto texto como imágenes, superando en benchmarks a modelos Qwen3-VL en tareas de razonamiento, codificación, agentes y comprensión visual. La versión cuantizada aquí presentada mantiene estas capacidades, aunque con posibles pérdidas de precisión inherentes a la cuantización 4-bit.

La relevancia de este modelo radica en su idoneidad para despliegues en entornos con recursos limitados, especialmente en dispositivos Apple con chips M-series, donde MLX ofrece un rendimiento optimizado. Su tamaño reducido y su formato de pesos en safetensors lo hacen accesible para prototipado rápido y aplicaciones de inferencia en el borde.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (presumiblemente transformer multimodal) |
| Parametros totales | 117.982.016 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Qwen3.5-0.8B en los datos proporcionados. Sin embargo, por su pertenencia a la familia Qwen3.5, se sabe que emplea una arquitectura transformer multimodal con fusión temprana de tokens de imagen y texto. El modelo original fue desarrollado por Alibaba y entrenado con un enfoque unificado de visión-lenguaje, aunque no se especifican el número de tokens de entrenamiento ni la composición del dataset.

La conversión a MLX realizada por Oscilla no modifica la arquitectura subyacente, sino que adapta los pesos al formato optimizado para Apple Silicon mediante la librería `mlx-lm`. La cuantización a 4 bits reduce el tamaño del modelo de aproximadamente 0.8 GB (en precisión completa) a 0.4 GB, facilitando su carga en memoria unificada de dispositivos Apple. No se menciona el uso de técnicas como RLHF o DPO en el proceso de conversión.

## Capacidades

- **Procesamiento multimodal**: al estar basado en Qwen3.5, el modelo puede procesar entradas de texto e imágenes, aunque no se han verificado estas capacidades en la versión cuantizada.
- **Generación de texto**: capacidad estándar de generación de lenguaje natural, con soporte para plantillas de chat mediante `apply_chat_template`.
- **Razonamiento y codificación**: el modelo base Qwen3.5 destaca en tareas de razonamiento lógico y generación de código, según la documentación de Alibaba.
- **Soporte para agentes**: el modelo base incluye capacidades para interacciones multi-paso y uso de herramientas, aunque no se confirma en esta versión.
- **Compatibilidad con MLX**: optimizado para ejecución en Apple Silicon mediante `mlx-lm`, con ejemplo de uso incluido en la model card.
- **Cuantización 4-bit**: reduce el consumo de memoria y acelera la inferencia en hardware compatible, a costa de una posible pérdida de precisión.

## Casos de uso

- **Inferencia en dispositivos Apple Silicon**: el modelo está diseñado para ejecutarse eficientemente en Macs con chips M1/M2/M3, aprovechando la memoria unificada. Se puede integrar en aplicaciones de escritorio o scripts de Python usando `mlx-lm`.
- **Prototipado rápido de chatbots**: su tamaño reducido permite cargarlo y probarlo en segundos, ideal para experimentar con plantillas de conversación y ajustes de prompt sin necesidad de infraestructura pesada.
- **Aplicaciones de visión-lenguaje en el borde**: si las capacidades multimodales se conservan, podría usarse para tareas como descripción de imágenes o respuesta a preguntas visuales en entornos con recursos limitados.
- **Asistentes personales ligeros**: su bajo consumo de memoria lo hace apto para integrarse en asistentes de voz o texto en dispositivos móviles o embebidos, siempre que se acepte la pérdida de calidad por cuantización.
- **Educación e investigación**: sirve como modelo de referencia para estudiar el impacto de la cuantización 4-bit en modelos pequeños, o para comparar el rendimiento de MLX frente a otros backends.
- **Desarrollo de plugins y extensiones**: al ser un modelo pequeño, puede empaquetarse en aplicaciones de escritorio o extensiones de navegador que requieran generación de texto local sin conexión a la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo es una conversión cuantizada de Qwen3.5-0.8B, y no se proporcionan métricas específicas para esta versión. Se recomienda consultar la documentación del modelo base para obtener referencias de rendimiento, aunque los resultados pueden variar debido a la cuantización.

## Requisitos de hardware

- **VRAM estimada**: al ser un modelo de 0.8B parámetros en 4-bit, el tamaño del repositorio es de 0.4 GB, por lo que cabe en cualquier GPU con al menos 1 GB de VRAM, e incluso en memoria unificada de Apple Silicon.
- **GPU recomendadas**: cualquier GPU moderna con soporte para MLX (Apple Silicon) o CUDA (si se convierte a otro formato). En Apple, los chips M1/M2/M3 son adecuados.
- **Compatibilidad con consumer GPU**: sí, cabe en GPUs de gama baja como NVIDIA GTX 1650 o superiores, y en todas las GPUs de Apple Silicon.
- **Opciones de despliegue**: `mlx-lm` para Apple Silicon; también puede ejecutarse con `transformers` si se convierte a otro formato, aunque no es el propósito de esta versión.
- **Latencia y throughput**: no se dispone de datos medidos. Dado el tamaño, se espera una latencia de decenas de milisegundos por token en hardware moderno, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Oscilla/Qwen3.5-0.8B-mlx-4Bit | 117,98 M | no disponible | Apache 2.0 | MLX 4-bit | Conversión cuantizada para Apple Silicon |
| mlx-community/Qwen3.5-0.8B-MLX-4bit | 117,98 M | no disponible | Apache 2.0 | MLX 4-bit | Versión comunitaria similar |
| mlx-community/Qwen3.5-0.8B-OptiQ-4bit | 117,98 M | no disponible | Apache 2.0 | MLX mixto | Cuantización con sensibilidad por capas |
| Qwen/Qwen3.5-0.8B (original) | 117,98 M | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar |

No se dispone de datos de rendimiento comparativo entre estas versiones. La elección entre ellas dependerá de la calidad de cuantización y del soporte específico de cada implementación.

## Limitaciones y advertencias

- **Pérdida de precisión por cuantización**: la conversión a 4-bit puede degradar la calidad de las respuestas, especialmente en tareas de razonamiento complejo o generación de código.
- **Tamaño reducido**: al ser un modelo de 0.8B parámetros, su capacidad de conocimiento y razonamiento es limitada en comparación con modelos más grandes. Puede producir respuestas incoherentes o alucinaciones en temas especializados.
- **Idiomas no especificados**: no se indica qué idiomas soporta el modelo. Aunque Qwen3.5 suele ser multilingüe, no hay confirmación para esta versión.
- **Contexto limitado**: no se conoce la longitud máxima de contexto, lo que puede afectar a tareas que requieran ventanas largas.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base original para posibles restricciones adicionales.
- **Dependencia de MLX**: el formato MLX está optimizado para Apple Silicon; su uso en otras plataformas requeriría conversión adicional, lo que podría introducir incompatibilidades.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Oscilla/Qwen3.5-0.8B-mlx-4Bit)
- [Modelo base Qwen/Qwen3.5-0.8B](https://huggingface.co/Qwen/Qwen3.5-0.8B)
- [Versión comunitaria mlx-community/Qwen3.5-0.8B-MLX-4bit](https://huggingface.co/mlx-community/Qwen3.5-0.8B-MLX-4bit)
- [Versión OptiQ mlx-community/Qwen3.5-0.8B-OptiQ-4bit](https://huggingface.co/mlx-community/Qwen3.5-0.8B-OptiQ-4bit)
- [Página de Qwen3.5 en Ollama](https://ollama.com/library/qwen3.5:0.8b)
- [Artículo sobre instalación de Qwen 3.5 en Apple Silicon](https://dev.to/thefalkonguy/installing-qwen-35-on-apple-silicon-using-mlx-for-2x-performance-37ma)
