# FlatFootInternational/Qwen3.5-4B-mlx-bf16

## Resumen

FlatFootInternational/Qwen3.5-4B-mlx-bf16 es una conversión a formato MLX (Apple Silicon) del modelo Qwen/Qwen3.5-4B, un modelo de visión-lenguaje (image-text-to-text) de 4 mil millones de parámetros desarrollado por Alibaba Cloud. La conversión se realizó con mlx-vlm versión 0.6.17, lo que permite ejecutar el modelo de forma eficiente en hardware de Apple (chips M1/M2/M3/M4) mediante el framework MLX.

El modelo original Qwen3.5-4B es un modelo denso con una longitud de contexto nativa de 262.144 tokens, diseñado como base unificada para tareas multimodales y de agente. Aunque la model card de esta conversión no incluye detalles adicionales, se sabe por la información pública de Qwen3.5 que el modelo integra entrenamiento temprano en tokens multimodales, lo que le otorga capacidades de razonamiento, programación y comprensión visual comparables o superiores a modelos de la generación anterior. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

Esta ficha se centra en la versión MLX, que es la que se puede descargar directamente desde Hugging Face. Para información técnica más profunda del modelo original, se recomienda consultar la model card de Qwen/Qwen3.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (visión-lenguaje) |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | bf16 (formato original de esta conversión) |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es un transformer denso de 4B parámetros con arquitectura multimodal nativa: se entrena con tokens de imagen y texto desde el inicio (early fusion), lo que permite un entendimiento conjunto de ambas modalidades. Según la documentación de Qwen3.5, el modelo incorpora mejoras arquitectónicas como manejo eficiente de capas MoE (aunque este modelo concreto es denso) y un diseño orientado a agentes. La conversión a MLX no altera la arquitectura, solo adapta los pesos al formato de Apple. No se dispone de información detallada sobre el dataset de entrenamiento, el número de tokens procesados o el uso de RLHF/DPO en la model card de la conversión.

## Capacidades

- Procesamiento de imágenes y texto: el pipeline `image-text-to-text` permite entrada de imágenes junto con prompts de texto y genera respuestas textuales.
- Generación de texto: capacidad completa de generación autoregresiva, incluyendo razonamiento y respuesta a instrucciones.
- Soporte de tool calling y function calling: según las características de Qwen3.5, el modelo está diseñado para integrarse con herramientas externas y ejecutar acciones.
- Capacidades de agente: el modelo puede realizar razonamiento multi-paso y planificar acciones, especialmente relevante para tareas de automatización.
- Multilingüe: aunque los idiomas exactos no se especifican en la información proporcionada, los modelos Qwen suelen cubrir múltiples idiomas, incluyendo español, inglés, chino, etc.
- Longitud de contexto extensa: 262.144 tokens, adecuado para documentos largos, conversaciones extensas o análisis de múltiples imágenes.

## Casos de uso

- Análisis de documentos técnicos con imágenes: el modelo puede procesar manuales, diagramas o capturas de pantalla, extrayendo información relevante y respondiendo preguntas sobre el contenido, aprovechando su contexto de 262K tokens para documentos extensos.
- Asistente de programación multimodal: dado su soporte de tool calling, puede integrarse en entornos de desarrollo para generar código a partir de capturas de pantalla de interfaces o diagramas de arquitectura.
- Automatización de atención al cliente: con su capacidad de razonamiento y generación de texto, puede gestionar conversaciones multi-turno que incluyan imágenes (por ejemplo, fotos de productos o errores de software), manteniendo el contexto durante largas interacciones.
- Extracción de información de imágenes médicas o técnicas: aunque no es un modelo especializado, puede describir y analizar imágenes para pre-diagnóstico o documentación, siempre con supervisión humana.
- Generación de informes a partir de datos visuales: en entornos de investigación o negocio, puede resumir gráficos, tablas o figuras y producir texto estructurado en varios idiomas.
- Desarrollo de agentes autónomos: gracias a su diseño para agentes y su contexto largo, puede actuar como cerebro de un sistema que interactúa con APIs, navegadores o herramientas, tomando decisiones basadas en entrada multimodal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la conversión MLX no incluye métricas de rendimiento. Para datos de evaluación del modelo original, se debe consultar la documentación oficial de Qwen3.5 en el blog de Qwen (enlace en la sección de Enlaces), donde se reportan resultados en razonamiento, codificación y benchmarks de visión, pero no se reproducen aquí al no estar en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: el modelo en bf16 ocupa aproximadamente 9.1 GB (tamaño del repo). Para inferencia, se recomienda al menos 16 GB de RAM unificada en Apple Silicon (por ejemplo, M1 Pro/Max, M2 Pro/Max, M3 Pro/Max o M4 Pro/Max). Con cuantización a 8 bits o 4 bits (si se genera a partir del original), se podría reducir el requisito a 6-8 GB, pero esa conversión no está disponible en este repo.
- GPU recomendadas: específicamente diseñado para Apple Silicon (M1/M2/M3/M4). No es compatible con GPUs NVIDIA o AMD sin conversión adicional.
- Compatibilidad con hardware de consumo: sí, en Macs con al menos 16 GB de RAM unificada. Modelos con 8 GB podrían ejecutar versiones cuantizadas, pero no esta versión bf16 completa.
- Opciones de despliegue: a través de mlx-vlm (pip install -U mlx-vlm) y el comando `python -m mlx_vlm.generate`. También puede integrarse en aplicaciones que usen el framework MLX de Apple.
- Latencia y throughput: no se dispone de datos medidos. En general, MLX aprovecha la memoria unificada de Apple, logrando velocidades competitivas para modelos de 4B en chips M2/M3, pero los valores exactos dependen del hardware y de la cuantización.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B (MLX) | 4.5B | 262K | imagen+texto | Apache 2.0 | Hugging Face, Ollama |
| Qwen3.5-397B-A17B | 397B (17B activos) | 262K | imagen+texto | Apache 2.0 | Hugging Face, Qwen |
| Qwen3-4B (versión anterior) | 4B | 128K (aprox.) | texto | Apache 2.0 | Hugging Face, Ollama |

Nota: la comparación con Qwen3.5-397B-A17B es orientativa, ya que es un modelo MoE mucho mayor. No se dispone de resultados de benchmarks para comparar directamente en esta ficha. El modelo Qwen3.5-4B destaca por su contexto nativo de 262K tokens y su naturaleza multimodal, lo que lo diferencia de versiones de texto puro.

## Limitaciones y advertencias

- Esta conversión MLX no incluye cuantización; el formato bf16 requiere más memoria que versiones cuantizadas.
- No se ha verificado que el comportamiento del modelo convertido sea idéntico al original; es posible que existan pequeñas diferencias debido al proceso de conversión.
- La model card no especifica los idiomas soportados ni los sesgos potenciales del modelo. Se recomienda consultar la documentación de Qwen3.5 para conocer las limitaciones conocidas.
- Riesgo de alucinación inherente a los modelos generativos, especialmente en tareas multimodales donde la interpretación de imágenes puede ser incorrecta.
- Para uso en producción, es necesario validar el rendimiento en el caso de uso concreto, ya que no hay benchmarks disponibles para esta conversión.
- La licencia Apache 2.0 permite uso comercial, pero se debe respetar la atribución y las condiciones de la licencia.

## Enlaces

- [Modelo en Hugging Face (conversión MLX)](https://huggingface.co/FlatFootInternational/Qwen3.5-4B-mlx-bf16)
- [Modelo original Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- [Conversión alternativa de la comunidad MLX](https://huggingface.co/mlx-community/Qwen3.5-4B-MLX-bf16)
- [Página de Qwen3.5 en Ollama](https://ollama.com/library/qwen3.5:4b)
- [Ficha de Qwen3.5-4B en LM Studio](https://lmstudio.ai/models/qwen/qwen3.5-4b)
- [Blog oficial de Qwen3.5](https://qwen.ai/blog?id=qwen3.5)
