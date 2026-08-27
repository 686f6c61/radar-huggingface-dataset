# mradermacher/Qwen3.8-27B-Opus-Abliterix-Reasoning-BF16-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con imatrix del modelo `timteh673/Qwen3.8-27B-Opus-Abliterix-Reasoning-BF16`, una versión modificada del Qwen3.8-27B de Alibaba que ha sido sometida a un proceso de "abliteración" (abliterix) para eliminar las negativas de seguridad y potenciar el razonamiento. El cuantizador es mradermacher, conocido por sus conversiones de alta calidad con importancia matrix (imatrix). El modelo resultante es un transformer denso de 27.320 millones de parámetros, con capacidades de visión-lenguaje y una ventana de contexto de 262.000 tokens según los datos del modelo base. Su relevancia radica en ofrecer una alternativa de código abierto con licencia Apache 2.0, ejecutable en hardware de consumo gracias a la cuantización, y sin restricciones de censura, lo que lo hace atractivo para investigación y desarrollo de agentes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) |
| Parámetros totales | 27.320.697.856 (27,3B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (según modelo base) |
| Tipos de cuantizacion | i1-Q2_K (11,0 GB), i1-IQ3_M (12,9 GB), i1-Q4_K_S (15,9 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.8-27B, un transformer denso de 27.300 millones de parámetros desarrollado por Alibaba, con capacidades multimodales (visión-lenguaje) y una ventana de contexto de 262.000 tokens. La versión "Opus-Abliterix-Reasoning" aplica una técnica de abliteración que elimina las capas de rechazo de contenido, manteniendo las capacidades de razonamiento y generación. El cuantizador mradermacher ha generado pesos GGUF con importancia matrix (imatrix) para optimizar la calidad de la cuantización, especialmente en los niveles bajos de precisión. No se dispone de detalles sobre el dataset de entrenamiento ni sobre el proceso de fine-tuning del modelo base en la información proporcionada.

## Capacidades

- Generación de texto y razonamiento multi-step, con modo de razonamiento explícito (reasoning).
- Procesamiento de imágenes (visión-lenguaje), aunque el proyector de visión (mmproj) se distribuye por separado en el repositorio estático.
- Soporte de tool calling y function calling, según las etiquetas del modelo.
- Capacidad conversacional para asistentes y chatbots.
- Multilingüe limitado al inglés, sin soporte confirmado para otros idiomas.
- Ausencia de censura (uncensored) debido a la abliteración, lo que permite respuestas sin restricciones de seguridad.

## Casos de uso

- Inferencia local en hardware de consumo: gracias a las cuantizaciones Q4_K_S (15,9 GB) o IQ3_M (12,9 GB), el modelo puede ejecutarse en GPUs con 16-24 GB de VRAM, como RTX 3090 o RTX 4090, mediante llama.cpp u Ollama.
- Prototipado de agentes autónomos: su capacidad de razonamiento y tool calling permite construir agentes que ejecutan tareas multi-paso, como búsqueda de información o automatización de procesos.
- Análisis de imágenes y descripción visual: al ser un modelo de visión-lenguaje, puede generar descripciones detalladas de imágenes, aunque requiere el archivo mmproj adicional.
- Generación de código en entornos de desarrollo: su rendimiento en tareas de programación (según benchmarks del modelo original) lo hace útil para asistentes de código y revisión de código.
- Investigación en seguridad y red-teaming: la ausencia de censura permite probar comportamientos extremos del modelo, aunque con las advertencias éticas correspondientes.
- Asistentes conversacionales personalizados: su naturaleza "uncensored" y su capacidad de razonamiento lo hacen adecuado para chatbots sin filtros, siempre que se respeten las normativas legales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta versión cuantizada y abliterada. Los datos de rendimiento del modelo original Qwen3.8-27B (publicados por Alibaba) indican puntuaciones como Terminal-Bench 2.1 (73,0), SWE-bench Pro (61,7), LiveCodeBench v6 (90,3) y OSWorld-Verified (84,3), pero estos resultados no son directamente aplicables a esta versión modificada y cuantizada. Se recomienda realizar evaluaciones propias antes de usar el modelo en producción.

## Requisitos de hardware

- VRAM estimada para inferencia: al menos el tamaño del archivo GGUF más overhead. Para Q4_K_S (15,9 GB) se necesitan ~16-18 GB de VRAM; para IQ3_M (12,9 GB) ~13-15 GB; para Q2_K (11,0 GB) ~11-13 GB.
- GPUs recomendadas: RTX 3090 (24 GB), RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB). En GPUs con 12-16 GB (RTX 3060, RTX 4070) solo es viable con cuantizaciones Q2_K o IQ3_M.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), LM Studio, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles. Dependen del hardware y de la cuantización elegida; en una RTX 4090 con Q4_K_S se espera una generación de 20-40 tokens/s, pero no hay mediciones oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (original) | 27,3B | 262K | Apache 2.0 | safetensors | Modelo base sin abliterar, con benchmarks oficiales |
| Qwen3.8-27B-Opus-Abliterix (BF16) | 27,3B | 262K | Apache 2.0 | safetensors | Versión abliterada, sin benchmarks publicados |
| Esta cuantización GGUF | 27,3B | 262K | Apache 2.0 | GGUF | Cuantización con imatrix, sin benchmarks |
| Qwen2.5-32B | 32,5B | 128K | Apache 2.0 | safetensors/GGUF | Modelo anterior de Alibaba, similar en tamaño |

No se dispone de comparativas de rendimiento directas entre estas versiones. La principal diferencia es la abliteración y la cuantización, que pueden afectar a la calidad de salida.

## Limitaciones y advertencias

- La abliteración elimina las salvaguardas de seguridad, lo que puede generar contenido ofensivo, ilegal o peligroso. El uso en producción debe contemplar medidas de moderación adicionales.
- La cuantización (especialmente Q2_K) puede degradar la calidad del texto y aumentar la tasa de alucinaciones.
- Solo soporta inglés; no se garantiza un rendimiento adecuado en otros idiomas.
- El modelo es una versión "personal" no oficial, sin respaldo de Alibaba ni de la comunidad principal de Qwen.
- No se han publicado evaluaciones de sesgos ni de robustez para esta versión.
- El archivo de proyector de visión (mmproj) no está incluido en este repositorio; debe descargarse por separado desde el repositorio estático.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de censura puede generar responsabilidades legales según el contexto de uso.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/mradermacher/Qwen3.8-27B-Opus-Abliterix-Reasoning-BF16-i1-GGUF
- Repositorio del modelo base (BF16): https://huggingface.co/timteh673/Qwen3.8-27B-Opus-Abliterix-Reasoning-BF16
- Repositorio estático con cuantizaciones y mmproj: https://huggingface.co/mradermacher/Qwen3.8-27B-Opus-Abliterix-Reasoning-BF16-GGUF
- Página de solicitudes de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Artículo sobre Qwen3.8-27B (explicación y comparativa): https://www.explainx.ai/blog/qwen-3-8-27b-open-weight-model-claude-opus-comparison-august-2026
- Guía para ejecutar Qwen3.8-27B con Ollama: https://tech-insider.org/how-to-run-qwen3-8-27b-locally-ollama-2026/
- Benchmarks del modelo original: https://www.orcarouter.ai/blog/qwen-3-8-27b-benchmarks
