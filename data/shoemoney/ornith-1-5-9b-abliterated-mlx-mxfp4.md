# shoemoney/Ornith-1.5-9B-Abliterated-MLX-mxfp4

## Resumen

Ornith-1.5-9B-Abliterated-MLX-mxfp4 es una cuantización en formato MXFP4 del modelo Ornith-1.5-9B-Abliterated, realizada por el usuario shoemoney para su ejecución en hardware Apple Silicon mediante la librería MLX. El modelo base original, Ornith-1.5-9B, es un modelo denso de 9B parámetros desarrollado por ornith-ai, especializado en codificación agéntica y razonamiento, con licencia MIT. La versión "abliterated" (creada por huihui-ai) elimina las restricciones de censura del modelo original, lo que permite generar contenido sin filtros de seguridad.

Esta cuantización reduce el tamaño del modelo a 6,18 GB en disco, lo que facilita su despliegue en equipos Apple con memoria unificada limitada. El proceso de conversión se realizó con `mlx_vlm.convert` sin fine-tuning adicional, manteniendo las capacidades del modelo base. La relevancia de este modelo radica en combinar un rendimiento competitivo en tareas de codificación y razonamiento (70,6 en SWE-bench Verified y 86,4 en GPQA Diamond) con la portabilidad de MLX y una licencia permisiva MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5 según tags) |
| Parametros totales | 9B (modelo base); el archivo safetensors muestra 2.135.710.960, posiblemente por la cuantización o un error de metadatos |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP4 (este repo); el modelo base tiene otras cuantizaciones (MLX 4-bit, etc.) |
| Idiomas soportados | No disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso de 9B parámetros, diseñado para tareas de codificación y razonamiento agéntico. Según la documentación de ornith-ai, la familia Ornith-1.5 introduce un bucle de auto-mejora que extiende el concepto de "self-scaffolding" (auto-andamiaje) al entrenamiento, permitiendo que el modelo refine sus propias capacidades de razonamiento. No se dispone de detalles sobre el número de tokens de entrenamiento, la composición del dataset o el uso de técnicas como RLHF o DPO.

La versión abliterated, creada por huihui-ai, elimina los mecanismos de rechazo y censura del modelo original, manteniendo los pesos sin modificar. La cuantización MXFP4 de este repo es una conversión puramente técnica: los pesos BF16 se transforman a formato MXFP4 con un grupo de tamaño fijo, sin fine-tuning ni realineamiento. Esto implica que las capacidades del modelo base se conservan, aunque con una posible pérdida mínima de precisión (perplexity relativa 1,09× respecto al mejor escalón de la familia).

## Capacidades

- Generación de código y razonamiento: el modelo base obtiene 70,6 en SWE-bench Verified y 86,4 en GPQA Diamond, lo que indica una sólida capacidad para resolver problemas de ingeniería de software y razonamiento científico.
- Codificación agéntica: diseñado para tareas de auto-andamiaje, puede descomponer problemas complejos en subtareas y ejecutar acciones iterativas.
- Sin censura: al ser abliterated, no aplica filtros de contenido, lo que permite generar respuestas sin restricciones de seguridad (útil para investigación, pero con riesgos).
- Soporte de tool calling: no confirmado explícitamente, pero la naturaleza agéntica del modelo sugiere que puede integrarse con herramientas externas.
- Multilingüe: no hay información disponible sobre idiomas soportados.
- Despliegue en Apple Silicon: gracias a la cuantización MLX, puede ejecutarse en Macs con memoria unificada, con un throughput de 67,6 tok/s (1 petición) y 164,4 tok/s (8 concurrentes) en un M3 Ultra.

## Casos de uso

- Asistente de codificación en local: un desarrollador puede ejecutar el modelo en su MacBook Pro (Apple Silicon) para obtener sugerencias de código, refactorización y explicaciones de fragmentos, sin depender de servicios en la nube. Su tamaño reducido (6,18 GB) permite cargarlo en memoria con facilidad.
- Agente autónomo de resolución de issues: gracias a su rendimiento en SWE-bench, puede utilizarse como base para un agente que analice repositorios, identifique bugs y proponga parches, integrándose con APIs de GitHub o GitLab.
- Razonamiento científico asistido: con 86,4 en GPQA Diamond, es adecuado para ayudar en tareas de investigación que requieren razonamiento multidisciplinar, como formular hipótesis o interpretar resultados experimentales.
- Prototipado rápido de aplicaciones de IA: al ser MIT y sin censura, los desarrolladores pueden experimentar con generación de texto libre, chatbots sin filtros o sistemas de role-play, sin preocuparse por licencias restrictivas.
- Entrenamiento de modelos más pequeños: el modelo puede usarse como profesor (teacher) para destilar conocimiento en modelos más compactos, aprovechando su licencia permisiva.
- Evaluación de técnicas de cuantización: al ser una conversión MXFP4, sirve como caso de estudio para medir el impacto de la cuantización en modelos de codificación, comparando perplexity y rendimiento con otras precisiones.

## Benchmarks y rendimiento

Los siguientes datos corresponden al modelo base Ornith-1.5-9B (no a la cuantización, que no ha sido evaluada en estos benchmarks):

| Benchmark | Resultado |
|---|---|
| SWE-bench Verified | 70,6 |
| GPQA Diamond | 86,4 |

Para la cuantización MXFP4, el autor reporta una perplexity de 5,783 medida en `allenai/tulu-3-sft-mixture` (192 muestras de 512 tokens, seed 123). Esta métrica solo es comparable dentro de la misma familia de modelos, ya que los tokenizadores difieren entre familias. El throughput medido en un Apple M3 Ultra (96 GB) es de 67,6 tok/s con una petición y 164,4 tok/s con 8 peticiones concurrentes.

No se han publicado comparaciones directas con otros modelos en la información disponible.

## Requisitos de hardware

- Hardware: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra), ya que MLX no es compatible con GPUs NVIDIA o AMD.
- Memoria unificada: el modelo ocupa 6,18 GB en disco, por lo que se recomienda al menos 8 GB de RAM unificada para cargarlo; para contextos largos o mayor velocidad, se recomienda 16 GB o más.
- GPU recomendada: cualquier chip Apple Silicon con Neural Engine; el rendimiento mejora con chips de gama alta (M3 Ultra, M4 Max, etc.).
- Opciones de despliegue: `mlx-vlm` (librería específica para modelos multimodales y de lenguaje), con comandos como `mlx_vlm.generate`. No es compatible con vLLM, llama.cpp u Ollama en su versión estándar, aunque podría adaptarse.
- Latencia y throughput: en un M3 Ultra con 96 GB, se midió 67,6 tok/s (1 petición) y 164,4 tok/s (8 concurrentes). En chips más modestos (M1, M2), el rendimiento será menor.

## Comparativa con modelos similares

No se dispone de datos comparativos directos en la información proporcionada. Sin embargo, se puede establecer una comparación cualitativa con otros modelos de codificación de tamaño similar:

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Ornith-1.5-9B (base) | 9B | No disponible | MIT | Codificación agéntica, self-scaffolding |
| Qwen2.5-Coder-7B | 7B | 128K | Apache 2.0 | Codificación general |
| DeepSeek-Coder-7B | 7B | 16K | MIT | Codificación, soporte de proyectos |

Ornith-1.5-9B destaca por su enfoque en auto-mejora y su rendimiento en SWE-bench, pero carece de información pública sobre longitud de contexto. La versión abliterated añade la ventaja de no tener restricciones de censura, algo poco común en modelos de esta categoría.

## Limitaciones y advertencias

- Contenido sin censura: al ser abliterated, el modelo puede generar texto ofensivo, ilegal o peligroso. No debe usarse en aplicaciones orientadas al público sin un sistema de moderación externo.
- Pérdida de precisión por cuantización: la conversión a MXFP4 introduce una degradación mínima (perplexity relativa 1,09×), que podría afectar tareas de alta precisión como generación de código exacto.
- Solo Apple Silicon: no es desplegable en infraestructura GPU estándar (NVIDIA, AMD), lo que limita su uso en entornos de producción convencionales.
- Falta de documentación sobre contexto: no se especifica la longitud máxima de contexto, lo que dificulta planificar su uso en tareas que requieran ventanas largas.
- Sin garantía de tool calling: aunque el modelo base es agéntico, no hay confirmación oficial de soporte para function calling, por lo que su integración con APIs externas puede requerir adaptación.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar respuestas plausibles pero incorrectas, especialmente en dominios especializados.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/shoemoney/Ornith-1.5-9B-Abliterated-MLX-mxfp4
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Ornith-1.5-9B-abliterated
- Modelo original Ornith-1.5-9B: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Cuantización MLX 4-bit del modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX-4bit
- Blog de Ornith sobre Ornith-1.5: https://ornith.ai/ornith_1_5.html
- Ficha en AI/TLDR: https://ai-tldr.dev/models/ornith-1-5-9b/
- Sitio web de Ornith AI: https://ornith.online/
