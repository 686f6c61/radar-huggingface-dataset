# mickyba/Qwen3.8-27B-3bit-mlx

## Resumen

El modelo `mickyba/Qwen3.8-27B-3bit-mlx` es una versión cuantizada a 3 bits del modelo multimodal Qwen3.8-27B de Alibaba, convertida al formato nativo de MLX para ejecutarse en Apple Silicon. El modelo base es un transformer denso de 27 mil millones de parámetros con capacidades de visión y lenguaje, diseñado para tareas de codificación, flujos agénticos y automatización de oficina. Esta cuantización reduce el uso de memoria unificada a aproximadamente 11-12 GB, lo que permite ejecutarlo en Macs con 16 GB de RAM, a diferencia de los ~54 GB que requiere el modelo en FP16.

La relevancia de esta versión radica en que ofrece un equilibrio entre calidad de salida y requisitos de hardware: la cuantización a 2 bits produce artefactos graves, mientras que la de 4 bits requiere más memoria. La de 3 bits se presenta como un punto intermedio viable para equipos con memoria limitada. El repositorio incluye instrucciones para usar el modelo mediante CLI, servidor OpenAI-compatible e integración con herramientas como Continue.dev, Roo Code o Cline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language dense transformer (modelo base Qwen3.8-27B) |
| Parametros totales | 27B (modelo base); el archivo safetensors reporta 3.825.044.720, dato inconsistente con el tamaño declarado del modelo base |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens (según especificaciones del modelo base) |
| Tipos de cuantizacion | 3-bit uniforme (este repo); también disponibles 4-bit y 2-bit en otros repos |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX nativo (safetensors) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27 mil millones de parámetros con arquitectura multimodal que acepta entradas de imagen y texto. No se trata de un modelo de mezcla de expertos (MoE), sino de un modelo denso completo. El entrenamiento del modelo base incluye datos de imagen y texto, con capacidades nativas de entrada de vídeo e imagen, y ha sido optimizado para tareas de codificación, razonamiento agéntico y automatización de oficina. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el uso de RLHF o DPO en la información proporcionada.

La conversión a 3 bits se realizó con la herramienta `mlx_vlm.convert` de Apple, aplicando cuantización uniforme con `--q-bits 3`. Esta cuantización reduce el tamaño de los pesos de aproximadamente 54 GB en FP16 a unos 11 GB en disco, con un consumo de memoria unificada estimado de 11-12 GB. La cuantización a 3 bits se eligió como compromiso entre la degradación severa de la de 2 bits y el mayor consumo de la de 4 bits.

## Capacidades

- Generación de texto y razonamiento multimodal: procesa imágenes y texto, pudiendo describir imágenes, responder preguntas visuales y realizar tareas de razonamiento combinado.
- Generación de código: el modelo base destaca en tareas de programación, con soporte para múltiples lenguajes y generación de scripts.
- Flujos agénticos: soporta razonamiento multi-paso y puede integrarse en pipelines de agentes para automatización de tareas.
- Tool calling / function calling: el modelo base incluye capacidades de llamada a herramientas, aunque no se especifica si la versión cuantizada conserva esta funcionalidad completa.
- Multilingüe: soporta inglés y chino, con posible degradación en otros idiomas debido a la cuantización.
- Entrada de vídeo: el modelo base admite entrada de vídeo nativa, aunque la versión cuantizada puede tener limitaciones en este aspecto.
- Integración con servidor OpenAI-compatible: puede servirse mediante `mlx_vlm.server` para conectarse con clientes como Continue.dev, Roo Code o Cline.

## Casos de uso

- Asistente de programación local en Mac: un desarrollador puede ejecutar el modelo en su MacBook con 16 GB de RAM y usarlo para generar código, explicar fragmentos o depurar errores mediante el servidor OpenAI-compatible integrado con editores como VS Code.
- Automatización de oficina: el modelo puede procesar documentos con imágenes (capturas de pantalla, diagramas) y generar resúmenes o extraer información, aprovechando su capacidad multimodal.
- Chatbot de atención al cliente con contexto largo: con 262K tokens de contexto, puede mantener conversaciones extensas con historial completo, aunque la cuantización puede afectar la coherencia en diálogos muy largos.
- Análisis de imágenes en entornos sin GPU: al ejecutarse en Apple Silicon, permite tareas de visión por computador (clasificación, descripción) en equipos sin GPU dedicada.
- Prototipado de agentes autónomos: gracias a su soporte de razonamiento multi-paso y tool calling, puede usarse para experimentar con agentes que interactúan con APIs o ejecutan comandos.
- Educación y aprendizaje: estudiantes pueden usarlo como tutor de programación o para explicar conceptos técnicos a partir de capturas de pantalla o diagramas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para la versión cuantizada a 3 bits. Los datos disponibles corresponden al modelo base Qwen3.8-27B, según la búsqueda web:

| Benchmark | Resultado (modelo base) |
|---|---|
| DeepSWE | 42.2 |
| Terminal Bench | 73.0 |
| OSWorld | 84.3 |

Estos valores indican el rendimiento del modelo sin cuantizar. La cuantización a 3 bits puede degradar estas métricas, pero no se dispone de mediciones cuantitativas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada: 11-12 GB de memoria unificada (según la model card), frente a ~54 GB en FP16 y ~15 GB en 4-bit.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4) con 16 GB o más de memoria unificada. No requiere GPU dedicada.
- Compatibilidad con consumer GPU: solo Apple Silicon; no es compatible con GPUs NVIDIA o AMD en este formato MLX.
- Opciones de despliegue: `mlx_vlm.generate` para CLI, `mlx_vlm.server` para servidor OpenAI-compatible, integración con Continue.dev, Roo Code, Cline.
- Latencia y throughput: no se proporcionan datos específicos. La latencia dependerá del chip (M1 vs M4) y de la longitud de la secuencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | VRAM estimada | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262K | FP16 | ~60 GB | Apache 2.0 |
| Qwen3.8-27B-4bit-mlx | 27B | 262K | 4-bit | ~16 GB | Apache 2.0 |
| Qwen3.8-27B-3bit-mlx (este) | 27B | 262K | 3-bit | ~12 GB | Apache 2.0 |
| Qwen3.8-27B-2bit-mlx | 27B | 262K | 2-bit | ~8 GB | Apache 2.0 |

La comparativa se limita a las distintas cuantizaciones del mismo modelo base, ya que no se dispone de datos de otros modelos vision-language de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 3 bits puede degradar la coherencia y el razonamiento en comparación con el modelo FP16 o la versión de 4 bits. La model card indica una retención de calidad "moderada-alta", pero no cuantificada.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo o con entradas ambiguas.
- Limitaciones de idioma: solo se garantiza soporte para inglés y chino; otros idiomas pueden presentar un rendimiento inferior.
- Restricciones de hardware: el formato MLX solo funciona en Apple Silicon; no es portable a otras plataformas sin reconversión.
- El dato de parámetros totales en safetensors (3.8B) es inconsistente con el tamaño declarado del modelo base (27B); se recomienda verificar la integridad del archivo antes de su uso en producción.
- La licencia Apache 2.0 permite uso comercial, pero se debe mantener la atribución y las condiciones de la licencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mickyba/Qwen3.8-27B-3bit-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Blog de AMD sobre soporte de Qwen3.8-27B: https://www.amd.com/en/blogs/2026/run-qwen-3-8-27b-on-amd-ryzen-ai-max-and-radeon-graphics-cards-day-0.html
- Análisis de specs y benchmarks: https://kingy.ai/blog/qwen3-8-27b-specs-benchmarks-local-hardware/
- Guía completa de Qwen3.8-27B: https://lovableapp.org/blog/qwen3-8-27b
- Seguimiento de lanzamiento: https://aireleasetracker.com/model/qwen/qwen3.8-27b
