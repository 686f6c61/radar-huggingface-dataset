# mahadev9/Qwen3.5-0.8B-fp8

## Resumen

El modelo `mahadev9/Qwen3.5-0.8B-fp8` es una cuantización en precisión FP8 (W8A8 dinámica) del modelo base `Qwen/Qwen3.5-0.8B`, desarrollado por el usuario mahadev9 y publicado en HuggingFace. El modelo original pertenece a la familia Qwen3.5 de Alibaba Cloud, una serie de modelos de lenguaje de última generación que, según fuentes web, incorpora arquitectura híbrida (combinación de atención lineal y transformadores clásicos), soporte multimodal nativo (texto, imagen y vídeo) y una ventana de contexto ampliada de hasta 262.000 tokens. Este modelo concreto, al ser la variante de 0.8B, está orientado a despliegues en entornos con recursos limitados, como dispositivos de borde o GPUs de consumo.

La cuantización FP8 se ha realizado con la herramienta `llm-compressor` del proyecto vLLM, manteniendo la capa `lm_head` en precisión original. El resultado es un modelo con 752.393.024 parámetros (el mismo número que el base, ya que la cuantización no reduce el número de parámetros, solo su representación) y un tamaño de repositorio de 1.0 GB, lo que permite inferencia eficiente en memoria. La relevancia de este modelo radica en que ofrece una versión ligera y optimizada de un modelo de última generación, facilitando su uso en producción con requisitos de hardware reducidos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida (atención lineal + transformadores) según fuentes web; no confirmado oficialmente para esta cuantización |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens (según fuentes web; no confirmado en la ficha de HuggingFace) |
| Tipos de cuantizacion | FP8 (W8A8 dinámica), con `lm_head` en precisión original |
| Idiomas soportados | No disponible (la familia Qwen es multilingüe, pero no se especifica la lista exacta para este modelo) |
| Licencia | No disponible en la ficha de HuggingFace; fuentes web indican Apache 2.0 para la familia Qwen3.5, pero no se confirma para esta cuantización |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura del modelo base Qwen3.5-0.8B se describe en fuentes web como una combinación híbrida de atención lineal y capas transformer tradicionales, una innovación que busca reducir el coste computacional del mecanismo de atención en secuencias largas manteniendo la calidad del modelo. Sin embargo, no se dispone de detalles técnicos oficiales sobre el diseño exacto de esta arquitectura, el número de capas, dimensiones de los tensores o la configuración de atención.

En cuanto al entrenamiento, no se han publicado datos específicos sobre el corpus utilizado, el número de tokens de entrenamiento o los métodos de alineación (RLHF, DPO, etc.) para este modelo. La cuantización FP8 se ha aplicado mediante `llm-compressor`, una herramienta que realiza una cuantización post-entrenamiento dinámica (W8A8), es decir, tanto pesos como activaciones se representan en FP8 durante la inferencia, con calibración de rangos dinámicos. La capa `lm_head` se ha dejado en precisión original para evitar pérdidas de precisión en la proyección de logits.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Qwen3.5-0.8B.
- Soporte multimodal nativo (texto, imagen y vídeo) según fuentes web, aunque no se ha verificado en esta cuantización específica.
- Capacidad de procesamiento de contextos muy largos (hasta 262K tokens), útil para documentos extensos o conversaciones multi-turno.
- Instrucción y seguimiento de instrucciones mejorado respecto a la generación anterior Qwen3, según la descripción de la familia.
- Capacidades multilingües, aunque no se especifica la lista de idiomas soportados.
- No se ha confirmado soporte para tool calling, function calling o modo agente en esta cuantización; se requiere consultar la documentación del modelo base.

## Casos de uso

- Despliegue en dispositivos de borde: al ser un modelo de 0.8B cuantizado en FP8, cabe en hardware con poca memoria (por ejemplo, Raspberry Pi con acelerador NPU o smartphones), permitiendo asistentes de voz o chatbots locales sin conexión.
- Procesamiento de documentos largos: gracias a su ventana de contexto de 262K tokens, puede resumir o extraer información de libros completos, informes extensos o transcripciones de reuniones.
- Filtrado y clasificación de texto: como modelo ligero, puede integrarse en pipelines de procesamiento de lenguaje natural para tareas de clasificación, análisis de sentimiento o extracción de entidades en tiempo real.
- Generación de respuestas en aplicaciones de atención al cliente: su tamaño reducido permite servir múltiples instancias en un solo servidor con GPU modesta, manejando conversaciones multi-turno con contexto amplio.
- Asistente de codificación básico: aunque las fuentes web advierten que la precisión en código es débil en el modelo de 0.8B, puede usarse para autocompletado simple o generación de fragmentos cortos en entornos con restricciones de memoria.
- Prototipado rápido: los desarrolladores pueden usar esta cuantización para validar ideas de aplicaciones de IA generativa sin necesidad de hardware de gama alta, migrando después a modelos mayores si es necesario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización FP8 en la información disponible. Las fuentes web mencionan que el modelo base Qwen3.5-0.8B tiene un rendimiento moderado en tareas de razonamiento, con buena capacidad de recuerdo pero precisión débil en tareas de código, aunque no se aportan cifras concretas. Tampoco se dispone de comparaciones cuantitativas con otros modelos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,5-2 GB en FP8 (752M parámetros × 1 byte por parámetro ≈ 0,75 GB, más overhead de activaciones y KV cache; con contexto largo puede aumentar).
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM, por ejemplo NVIDIA GTX 1650, RTX 3050, o integradas como Apple M1/M2 (con soporte de Metal). También puede ejecutarse en CPU con llama.cpp.
- Cabe en GPUs de consumo de gama baja y en dispositivos de borde con aceleradores NPU (como Qualcomm Hexagon).
- Opciones de despliegue: vLLM (recomendado por el autor, con `vllm serve`), transformers de HuggingFace, y potencialmente llama.cpp/Ollama si se convierte a GGUF.
- Latencia y throughput: no disponibles; al ser un modelo pequeño, se espera una latencia baja (del orden de decenas de milisegundos por token en GPU moderna), pero no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de datos comparativos fiables para esta cuantización concreta. Sin embargo, se puede contextualizar dentro de la familia Qwen3.5:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Qwen3.5-0.8B (base) | 0,8B | 262K | Apache 2.0 (según fuentes web) | Modelo original sin cuantizar |
| Qwen3.5-0.8B-fp8 (este) | 0,8B | 262K (presumiblemente) | No confirmada | Cuantización FP8 de mahadev9 |
| Qwen3.5-4B (base) | 4B | 262K | Apache 2.0 (según fuentes web) | Mejor rendimiento en código, mayor requisito de hardware |

No se incluyen otros modelos de otras familias (como Llama 3.2-1B) por falta de datos de comparación en la información proporcionada.

## Limitaciones y advertencias

- La cuantización FP8 puede introducir degradación de precisión en tareas sensibles a la exactitud numérica; se recomienda evaluar el modelo en el caso de uso concreto antes de producción.
- El modelo base de 0.8B tiene limitaciones conocidas en tareas de código y razonamiento complejo, según fuentes web; se recomienda usar modelos mayores para estos fines.
- No se ha confirmado el soporte multimodal en esta cuantización; si se requiere procesamiento de imágenes, es necesario verificar la compatibilidad con el pipeline de vLLM o transformers.
- La licencia no está especificada en la ficha de HuggingFace; aunque fuentes web indican Apache 2.0 para la familia Qwen3.5, no se puede garantizar que esta cuantización herede dicha licencia. Se debe contactar al autor o consultar la documentación del modelo base antes de uso comercial.
- La ventana de contexto de 262K tokens es un dato proveniente de fuentes web no oficiales; no se ha verificado en la implementación de esta cuantización, y el uso de contextos muy largos puede aumentar significativamente el consumo de memoria.
- El modelo puede presentar sesgos o alucinaciones inherentes a los modelos de lenguaje; no se ha realizado una evaluación de sesgos específica para esta versión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/mahadev9/Qwen3.5-0.8B-fp8
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Herramienta llm-compressor: https://github.com/vllm-project/llm-compressor
- Guía de la familia Qwen3.5 (fuente web): https://qwen-ai.com/qwen-3-5/
- Guía para desarrolladores de Qwen3.5 (fuente web): https://lushbinary.com/blog/qwen-3-5-developer-guide-benchmarks-architecture-integration-2026/
- Referencia en Qualcomm AI Hub: https://aihub.qualcomm.com/mobile/models/qwen3_5_0_8b
- Artículo sobre ejecución y benchmarks de Qwen3.5 0.8B: https://codersera.com/blog/run-and-benchmark-qwen35-08b/
