# leoncca/Qwen3.8-Flash-Next-AWQ-g32

## Resumen

El modelo `leoncca/Qwen3.8-Flash-Next-AWQ-g32` es una cuantización AWQ (W4A16, grupo 32) del modelo multimodal `Qwen/Qwen3.8-Flash-Next`, desarrollada por el usuario independiente leoncca. El modelo base es una vista previa de la arquitectura Qwen4, con 180.9 mil millones de parámetros totales (125B principales + 51B de embeddings N-gram) y solo 6B activos por token gracias a su diseño de mezcla de expertos (MoE). Incorpora una atención híbrida GDN + QSA, soporta entrada de imagen y texto, y ofrece una ventana de contexto nativa de un millón de tokens.

Esta cuantización reduce la huella de memoria de los pesos de los expertos enrutados a 4 bits, manteniendo el subsistema PLE (probablemente "Parallel Linear Experts") en FP8 y añadiendo escalas QSA FP8 E4M3 para la caché KV. El resultado es un checkpoint de 138 GB que requiere un runtime específico (1Cat-vLLM con tensor parallel 4) y no es compatible con vLLM estándar ni con Transformers genérico. Su relevancia radica en permitir ejecutar un modelo de última generación de Qwen con menor consumo de VRAM, aunque a costa de una compatibilidad restringida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE híbrido con atención GDN + QSA (Qwen4 experimental) |
| Parametros totales | 180.949.088.918 (según safetensors) |
| Parametros activos | 6B por token (según vLLM Recipes) |
| Longitud de contexto | 1.000.000 tokens (nativo, según QwenCloud) |
| Tipos de cuantizacion | AWQ W4A16 g32 (expertos enrutados), FP8 E4M3 (PLE y escalas KV) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | safetensors (44 shards, 138.2 GB) |

## Arquitectura y entrenamiento

El modelo base `Qwen3.8-Flash-Next` emplea una arquitectura MoE con 512 expertos distribuidos en 48 capas, donde cada token activa 10 expertos (top-10). La atención combina GDN (probablemente "Gated Delta Network") y QSA (posiblemente "Query-Selective Attention"), junto con atención lineal, hiperconexiones y un módulo MTP (Multi-Token Prediction). El sistema PLE se mantiene íntegro en FP8.

La cuantización AWQ se realizó únicamente sobre las proyecciones de los expertos enrutados (`gate_proj`, `up_proj`, `down_proj`), con calibración sobre 684 registros y 202.750 tokens activos. Se cubrió el 99,9674% de los pares capa-experto de forma natural, y los 93 pares restantes se aumentaron explícitamente. El grupo 32 se eligió para alinearse exactamente con la partición TP4 (cada rank posee 160 columnas, divisible por 32), evitando conversiones en tiempo de carga. No se realizó ningún entrenamiento adicional; es una cuantización post-entrenamiento.

## Capacidades

- Generación de texto multimodal: procesa imágenes y texto, con razonamiento y generación de lenguaje natural.
- Razonamiento y matemáticas: al ser un modelo Qwen de última generación, se espera un rendimiento sólido en tareas de razonamiento, aunque no se han publicado benchmarks específicos.
- Generación de código: soporta tareas de programación, aunque no se detalla tool calling en la información disponible.
- Contexto largo: ventana nativa de 1M tokens, adecuada para documentos extensos, codebases completos y conversaciones largas.
- Eficiencia MoE: solo 6B parámetros activos por token, lo que reduce el coste computacional en inferencia.
- Capacidades especiales: incluye visión (image-text-to-text) y posiblemente soporte de agentes, pero no se confirma en la documentación.

## Casos de uso

- Análisis de documentos extensos con imágenes: gracias a su contexto de 1M tokens y entrada multimodal, puede procesar informes largos con figuras, tablas y gráficos en una sola pasada, extrayendo información relevante para resúmenes o consultas.
- Asistente de programación sobre repositorios grandes: puede cargar un codebase completo y responder preguntas sobre arquitectura, bugs o refactorización, manteniendo el contexto de múltiples archivos.
- Agente conversacional con memoria prolongada: su ventana de 1M tokens permite mantener conversaciones de larga duración sin perder el hilo, ideal para soporte técnico o tutorías.
- Procesamiento de documentos legales o académicos: puede analizar contratos, artículos científicos o expedientes con anexos visuales, generando resúmenes o detectando cláusulas específicas.
- Generación de contenido multimodal: a partir de una imagen y una instrucción, puede crear descripciones, guiones o documentación técnica.
- Investigación en IA: al ser una vista previa de Qwen4, sirve para experimentar con arquitecturas híbridas de atención y MoE en entornos de investigación, siempre que se disponga del runtime adecuado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona una validación de calidad AWQ con FP16 KV que incluye "generación básica y log-probabilidades finitas", pero sin cifras concretas. Tampoco hay comparativas con otros modelos en la documentación del autor.

## Requisitos de hardware

- VRAM estimada: el checkpoint completo ocupa 138 GB en disco. Con cuantización AWQ 4-bit, se necesitan al menos 2 GPUs de 80 GB (A100, H100) o 4 GPUs de 48 GB (A6000, L40S) para cargar los pesos en memoria. La memoria de activaciones es reducida gracias a los 6B parámetros activos, pero el modelo completo debe residir en VRAM.
- GPU recomendadas: A100 80GB, H100 80GB, o equivalentes con soporte para FP8 y tensor parallel 4.
- No cabe en GPUs de consumo (RTX 4090, 3090) debido al tamaño total del checkpoint.
- Opciones de despliegue: exclusivamente 1Cat-vLLM con tensor parallel 4, MTP desactivado y activaciones FP16. No es compatible con vLLM estándar, Transformers, Ollama o llama.cpp.
- Latencia y throughput: no disponibles. Se espera que la inferencia sea eficiente por el bajo número de parámetros activos, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 180.9B (125B + 51B N-gram) | 6B | 1M | qwen-community-1.0 | HuggingFace |
| leoncca/Qwen3.8-Flash-Next-AWQ-g32 | 180.9B | 6B | 1M | qwen-community-1.0 | HuggingFace (cuantización) |
| Mixtral 8x7B | 46.7B | 12.9B | 32K | Apache 2.0 | HuggingFace |
| DeepSeek-V3 | 671B | 37B | 128K | MIT | HuggingFace |

No se dispone de datos de rendimiento comparativos. El modelo base es experimental y no tiene benchmarks públicos en la información recopilada.

## Limitaciones y advertencias

- Es una cuantización no oficial creada por un tercero; no hay garantía de calidad ni soporte por parte de Qwen.
- Requiere un runtime específico (1Cat-vLLM con TP4) y no funciona con vLLM estándar, Transformers ni otros frameworks comunes.
- No se soporta TP8, MTP, prefix caching ni despliegue en producción según la model card.
- El modelo base es una vista previa experimental (Qwen4), por lo que puede presentar comportamientos inesperados o inestabilidad.
- No se han publicado evaluaciones de sesgos, alucinaciones o robustez. Se recomienda validar en casos de uso reales.
- La licencia qwen-community-1.0 puede imponer restricciones de uso comercial; es necesario revisar los términos completos.
- El tamaño del checkpoint (138 GB) y la necesidad de múltiples GPUs limitan su uso a entornos con infraestructura de alto rendimiento.

## Enlaces

- Modelo cuantizado: https://huggingface.co/leoncca/Qwen3.8-Flash-Next-AWQ-g32
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio GitHub del modelo base: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Colección Qwen3.8-Flash-Next: https://huggingface.co/collections/Qwen/qwen38-flash-next
- vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- QwenCloud (información del modelo): https://www.qwencloud.com/models/qwen3.8-flash
