# shoemoney/Muse-Glimmer-30B-Abliterated-MLX-mxfp4

## Resumen

Muse-Glimmer-30B-Abliterated-MLX-mxfp4 es una cuantización en formato MXFP4 (4 bits) del modelo Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16, realizada con la librería `mlx-vlm` para ejecución en Apple Silicon. El modelo base es una versión "abliterated" (sin restricciones de seguridad) del modelo original Muse-Glimmer-30B de Meta, un modelo de visión y lenguaje (VLM) denso de aproximadamente 30.000 millones de parámetros, con un encoder ViT-G/14 y una ventana de contexto de 128.000 tokens, diseñado para ejecutarse en hardware local de consumo.

Esta conversión permite ejecutar un modelo de 30B en equipos Mac con memoria unificada, reduciendo el tamaño en disco a 18,6 GB y ofreciendo un rendimiento medido de 36,6 tokens por segundo en peticiones individuales y 86,7 tokens por segundo con 8 peticiones concurrentes en un Apple M3 Ultra de 96 GB. La cuantización se realizó sin fine-tuning ni realineamiento, manteniendo la licencia Apache-2.0 del modelo original.

La relevancia de este modelo radica en su capacidad para ejecutar un VLM de gran tamaño en hardware local de Apple, con soporte para razonamiento por canales y llamadas a herramientas en formato XML (ATEM), lo que lo hace adecuado para aplicaciones de agentes autónomos y asistentes locales sin depender de servicios en la nube.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language transformer (encoder ViT-G/14 + decoder denso) |
| Parametros totales | 30B (nominal; el safetensors reporta 7.089.517.568, posible error de metadata) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | MXFP4 (4 bits) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo original Muse-Glimmer-30B es un VLM denso de 29.6B parámetros desarrollado por Meta, con un encoder de visión ViT-G/14 y un decodificador de lenguaje. Fue destilado de Muse Spark para uso local y agéntico, y emite razonamiento por canales (channel-scoped reasoning) y llamadas a herramientas en formato XML (ATEM) en lugar de JSON, lo que requiere parsers específicos. La versión "abliterated" de Blackfrost-AI elimina las restricciones de seguridad del modelo original, permitiendo respuestas sin censura.

La cuantización MXFP4 se realizó con `mlx_vlm.convert` sobre los pesos BF16 del modelo abliterated, sin fine-tuning, merging ni realineamiento. El proceso mantiene el mismo tamaño de grupo para todos los escalones de la familia, de modo que la única variable entre ellos es el ancho de bits. No se dispone de información sobre el dataset de entrenamiento del modelo original ni sobre el proceso de destilación.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes y texto, con capacidad de razonamiento visual.
- Razonamiento por canales: emite razonamiento estructurado en canales separados, útil para tareas de agente.
- Llamadas a herramientas (tool calling) en formato XML (ATEM), no JSON, lo que requiere parsers dedicados.
- Soporte para agentes locales: diseñado para ejecutarse en un solo equipo y realizar tareas autónomas.
- Contexto largo: ventana de 128K tokens, adecuada para documentos extensos o conversaciones multi-turno.
- Multilingüismo: no especificado en la información disponible.

## Casos de uso

- Asistentes personales locales en Mac: el modelo puede ejecutarse en Apple Silicon con mlx-vlm, ofreciendo respuestas de texto y análisis de imágenes sin conexión a internet.
- Agentes autónomos con tool calling: gracias a su formato de llamadas a herramientas ATEM, puede integrarse en pipelines de automatización que requieran interacción con APIs o ejecución de acciones.
- Análisis de documentos visuales: con su encoder de visión y contexto de 128K, puede procesar documentos escaneados, capturas de pantalla o diagramas técnicos.
- Generación de código asistida por contexto visual: puede interpretar diagramas o esquemas y generar código correspondiente.
- Investigación en IA sin censura: al ser una versión abliterated, es útil para estudiar comportamientos del modelo sin restricciones de seguridad, aunque con precaución.
- Despliegue en entornos con recursos limitados: al cuantizar a 4 bits, cabe en equipos con 24-32 GB de RAM unificada, como MacBook Pro con chip M3 Pro o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card reporta las siguientes mediciones propias:

| Metrica | Valor |
|---|---|
| Perplexity (tulu-3-sft-mixture, 192 muestras de 512 tokens) | 7.545 |
| Throughput (1 peticion) | 36.6 tok/s |
| Throughput (8 peticiones concurrentes) | 86.7 tok/s |

Estas mediciones se realizaron en un Apple M3 Ultra con 96 GB de memoria unificada y macOS 27. La perplexity solo es comparable dentro de la misma familia de modelos, ya que los tokenizadores difieren entre familias.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 18.6 GB en disco; en memoria unificada se recomienda al menos 24 GB para cargar los pesos y dejar espacio para el contexto y las activaciones.
- GPU recomendadas: Apple Silicon con memoria unificada (M3, M3 Pro, M3 Max, M3 Ultra, o superiores). No es compatible con GPUs NVIDIA o AMD en este formato MLX.
- Si cabe en consumer GPU: no, el formato MLX es exclusivo de Apple Silicon. Para GPUs NVIDIA se necesitaría otra conversión (por ejemplo, GGUF o EXL2).
- Opciones de despliegue: `mlx-vlm` (librería de Python) para generación y conversión. No se mencionan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: 36.6 tok/s en petición individual y 86.7 tok/s con 8 concurrentes en M3 Ultra, según la model card.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos en la información proporcionada. El modelo base original (Muse-Glimmer-30B) podría compararse con otros VLM de tamaño similar como LLaVA-NeXT-34B o Qwen2-VL-32B, pero no hay métricas disponibles para esta cuantización específica. Se indica "no disponible".

## Limitaciones y advertencias

- Modelo "uncensored" (abliterated): puede generar contenido inapropiado, ofensivo o peligroso. No debe usarse en aplicaciones de producción sin supervisión humana.
- Cuantización MXFP4: la reducción a 4 bits puede degradar la calidad de las respuestas en comparación con el modelo BF16 original, especialmente en tareas de razonamiento complejo.
- Compatibilidad limitada: el formato MLX solo funciona en Apple Silicon; no es portable a otros entornos sin reconversión.
- Dependencia de parsers específicos: las llamadas a herramientas en formato ATEM requieren parsers dedicados, lo que complica la integración con frameworks estándar que esperan JSON.
- Sin información sobre sesgos: no se han publicado estudios de sesgos o alucinaciones para esta versión cuantizada.
- Fecha de creación futura: el modelo fue creado en agosto de 2026, lo que puede indicar que es una versión reciente o hipotética; verificar la disponibilidad real.

## Enlaces

- [HuggingFace - shoemoney/Muse-Glimmer-30B-Abliterated-MLX-mxfp4](https://huggingface.co/shoemoney/Muse-Glimmer-30B-Abliterated-MLX-mxfp4)
- [HuggingFace - Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16](https://huggingface.co/Blackfrost-AI/Muse-Glimmer-30B-Abliterated-BF16)
- [HuggingFace - meta-models/Muse-Glimmer-30B](https://huggingface.co/meta-models/Muse-Glimmer-30B)
- [Meta Developer - Muse Glimmer](https://developer.meta.com/ai/models/muse-glimmer/)
- [vLLM Recipes - Muse-Glimmer-30B](https://recipes.vllm.ai/meta-models/Muse-Glimmer-30B)
- [Sitio no oficial - museglimmer.site](https://museglimmer.site/)
