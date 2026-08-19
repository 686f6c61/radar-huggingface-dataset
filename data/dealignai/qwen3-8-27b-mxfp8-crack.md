# dealignai/Qwen3.8-27B-MXFP8-CRACK

## Resumen

Qwen3.8-27B-MXFP8-CRACK es una variante cuantizada y modificada del modelo Qwen3.8-27B de Alibaba, publicada por el laboratorio dealignai. El modelo base es un transformer denso híbrido de 27 000 millones de parámetros que combina atención lineal GatedDeltaNet con atención completa, y está diseñado para tareas de visión-lenguaje (imagen y vídeo), razonamiento con niveles de esfuerzo, llamada a herramientas y generación multilingüe en inglés y chino.

Esta versión concreta aplica dos transformaciones sobre el original: una cuantización MXFP8 de 8 bits en formato MLX para Apple Silicon (que reduce el peso a unos 27 GB) y la técnica CRACK (Controlled Refusal Ablation via Calibrated Knockouts), que elimina a nivel de pesos el comportamiento de rechazo de instrucciones. Según el autor, esto se hace con fines de investigación, manteniendo intactas las capacidades de razonamiento, visión y herramientas. El modelo conserva además el cabezal nativo de predicción multi-token (MTP) para decodificación especulativa.

La relevancia de este lanzamiento radica en que ofrece un modelo de 27B con capacidades multimodales completas, ejecutable en hardware de Apple Silicon, y que elimina los rechazos de seguridad de forma controlada, lo que lo convierte en un objeto de estudio para la comunidad de alineación y seguridad de IA. No obstante, su uso conlleva riesgos importantes que se detallan en las secciones de limitaciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso híbrido: GatedDeltaNet (atención lineal) + atención completa con puerta, 64 capas |
| Parametros totales | 27B (declarado por el autor); el checkpoint safetensors contiene 7.906.597.552 parámetros |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | MXFP8 (8 bits, MLX); también existen variantes JANG 2D, 4D y 6D del mismo autor |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B emplea una arquitectura densa híbrida de 64 capas que intercala atención lineal GatedDeltaNet con atención completa con puerta. Esta combinación busca reducir el coste computacional del mecanismo de atención manteniendo la calidad en tareas de razonamiento y contexto largo. El modelo es multimodal: acepta entradas de imagen y vídeo, y produce texto. Incluye un cabezal nativo de predicción multi-token (MTP) que actúa como borrador para decodificación especulativa, lo que acelera la generación en entornos deterministas.

Sobre esta base, dealignai aplica dos modificaciones: la cuantización MXFP8 (8 bits) en formato MLX, optimizada para Apple Silicon, y la ablación CRACK, que elimina a nivel de pesos los patrones de rechazo de instrucciones. El autor indica que CRACK está calibrado por modelo y que preserva las capacidades generales, el razonamiento, la visión y las herramientas. No se proporcionan datos sobre el conjunto de entrenamiento original, el número de tokens, ni el proceso de alineación (RLHF/DPO) del modelo base; toda esa información se considera no disponible.

## Capacidades

- Generación de texto y razonamiento multinivel: el modelo activa el razonamiento por defecto en modo `xhigh`, con niveles `xhigh`, `medium` y `low` configurables mediante el parámetro `reasoning_effort` de la plantilla de chat. Se puede desactivar con `enable_thinking=False`.
- Comprensión de imágenes y vídeo: pipeline `image-text-to-text`, capaz de procesar entradas visuales y generar descripciones o respuestas basadas en ellas.
- Llamada a herramientas (tool calling): esquema nativo de llamada a funciones en formato XML, conservado tras la cuantización y la ablación.
- Decodificación especulativa con MTP: el cabezal de predicción multi-token se mantiene y se alinea con el modelo ablacionado; se activa automáticamente en muestreo determinista (temperatura 0).
- Multilingüismo: soporte de inglés y chino, tanto en entrada como en salida.
- Ausencia de rechazo: debido a CRACK, el modelo no rechaza instrucciones en ninguna categoría, lo que lo hace útil para investigación de seguridad pero también peligroso si se usa sin control.

## Casos de uso

- Análisis de documentos técnicos con imágenes: un desarrollador puede enviar capturas de pantalla de diagramas o gráficos junto con preguntas en inglés o chino, y el modelo generará explicaciones razonadas gracias a su modo de razonamiento `xhigh`.
- Generación de subtítulos y descripciones de vídeo: al aceptar entradas de vídeo, puede utilizarse para indexar contenido audiovisual, generar metadatos o resumir secuencias cortas.
- Asistente de programación con llamada a herramientas: integrado en un agente, el modelo puede invocar funciones externas (por ejemplo, ejecutar comandos o consultar APIs) mediante su esquema XML de tool calling, manteniendo un hilo de razonamiento multi-paso.
- Investigación en seguridad y alineación de IA: dado que el modelo ha sido ablacionado para no rechazar, sirve como banco de pruebas para estudiar comportamientos de cumplimiento, medir tasas de éxito en benchmarks como HarmBench o evaluar contramedidas de seguridad.
- Prototipado de aplicaciones multimodales en Apple Silicon: al estar cuantizado en MXFP8 y empaquetado para MLX, puede ejecutarse en un Mac con suficiente memoria unificada, permitiendo desarrollar demos locales de visión-lenguaje sin GPU dedicada.
- Traducción y generación de contenido bilingüe: con soporte nativo de inglés y chino, puede redactar o traducir textos técnicos, correos o documentación en ambos idiomas, aprovechando el razonamiento para mantener coherencia.

## Benchmarks y rendimiento

La model card del autor reporta resultados para MMLU (57 materias, modo logit) y HarmBench (harm-240, con clasificador estricto de cumplimiento). Se comparan el modelo base (sin CRACK) y la versión CRACK, así como las distintas cuantizaciones JANG. Los datos son los siguientes:

| Perfil | Tamaño | MMLU base | MMLU CRACK | Δ MMLU | HarmBench-240 |
|---|---:|---:|---:|---:|---:|
| JANG 2D | 11 GB | 80.0% | 76.84% | -3.16pp | 100.0% |
| JANG 4D | 17 GB | 88.77% | 87.72% | -1.05pp | 100.0% |
| JANG 6D | 24 GB | 88.77% | 89.12% | +0.35pp | 100.0% |
| MXFP8 (este modelo) | 27 GB | 86.67% | 86.67% | +0.0pp | 100.0% |

Según el autor, las cuatro variantes alcanzan un 100% de cumplimiento en HarmBench, mientras que MMLU se mantiene dentro de un margen de pocos puntos respecto al base. No se proporcionan resultados de otros benchmarks estándar (HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- El modelo está empaquetado para MLX, por lo que requiere un Mac con Apple Silicon (M1, M2, M3, M4 o posteriores).
- Tamaño del repositorio: 28.8 GB; la cuantización MXFP8 ocupa aproximadamente 27 GB en memoria.
- Se recomienda un Mac con al menos 32 GB de memoria unificada para cargar el modelo y dejar margen para el contexto y el procesamiento de imágenes. Para uso cómodo con vídeo y razonamiento largo, 64 GB o más es lo adecuado.
- No hay datos sobre despliegue en GPU NVIDIA; el formato MLX no es compatible directamente con CUDA.
- Para inferencia, se puede usar la librería `mlx_vlm` (como se muestra en el ejemplo de uso) o el motor vMLX, que añade cuantización de caché KV, reutilización de prefijo, llamada a herramientas y decodificación especulativa.
- No se proporcionan cifras de latencia o throughput en la información disponible.

## Comparativa con modelos similares

La comparación más directa es con el propio modelo base Qwen3.8-27B y con las otras variantes cuantizadas del mismo autor. No se dispone de datos comparativos con otros modelos de 27B como Gemma 3 27B o Qwen2.5-VL-27B.

| Modelo | Tamaño | Cuantización | MMLU (CRACK) | HarmBench | Licencia | Plataforma |
|---|---|---:|---|---|---|---|
| Qwen3.8-27B (base) | 27B | Original (no cuantizado) | 86.67% | Rechaza por diseño | Apache-2.0 | Multiplataforma |
| Qwen3.8-27B-MXFP8-CRACK | 27B | MXFP8 8-bit | 86.67% | 100% cumplimiento | Apache-2.0 | Apple Silicon (MLX) |
| Qwen3.8-27B-JANG_6D-CRACK | 27B | JANG 6D | 89.12% | 100% cumplimiento | Apache-2.0 | Apple Silicon (MLX) |
| Qwen3.8-27B-JANG_4D-CRACK | 27B | JANG 4D | 87.72% | 100% cumplimiento | Apache-2.0 | Apple Silicon (MLX) |
| Qwen3.8-27B-JANG_2D-CRACK | 27B | JANG 2D | 76.84% | 100% cumplimiento | Apache-2.0 | Apple Silicon (MLX) |

La variante MXFP8 mantiene el MMLU del base sin pérdida, mientras que la 6D incluso lo mejora ligeramente. La elección entre perfiles depende del presupuesto de memoria: 6D ofrece la mejor calidad, 4D es el equilibrio y 2D el más pequeño.

## Limitaciones y advertencias

- El modelo ha sido sometido a una ablación de rechazo (CRACK): no rechaza instrucciones en ninguna categoría. Esto lo hace inadecuado para despliegues sin supervisión y conlleva un riesgo elevado de uso malintencionado (generación de contenido dañino, químico, violento, etc.).
- Solo soporta inglés y chino; no hay evidencia de buen rendimiento en otros idiomas.
- La cuantización MXFP8 de 8 bits puede introducir ligeras degradaciones en tareas de precisión numérica o razonamiento complejo, aunque los benchmarks reportados muestran una pérdida nula en MMLU.
- No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MMMU, etc.), por lo que el rendimiento fuera de las tareas evaluadas es desconocido.
- El modelo está limitado a Apple Silicon; no se puede ejecutar directamente en GPUs NVIDIA o AMD sin una conversión previa.
- La longitud de contexto no está documentada en la información proporcionada; se desconoce el límite real de tokens de entrada.
- La licencia Apache-2.0 permite uso comercial, pero el autor incluye un descargo de responsabilidad: el usuario es el único responsable del uso que haga del modelo y de cumplir las leyes aplicables.
- Al ser una modificación no oficial del modelo Qwen, no hay garantía de soporte ni mantenimiento por parte de Alibaba.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/dealignai/Qwen3.8-27B-MXFP8-CRACK
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Variante JANG 2D: https://huggingface.co/dealignai/Qwen3.8-27B-JANG_2D-CRACK
- Variante JANG 4D: https://huggingface.co/dealignai/Qwen3.8-27B-JANG_4D-CRACK
- Variante JANG 6D: https://huggingface.co/dealignai/Qwen3.8-27B-JANG_6D-CRACK
- Motor vMLX: https://vmlx.net
- Sitio de dealignai: https://dealign.ai
- Soporte (Ko-fi): https://ko-fi.com/dealignai
- Perfil en X: https://x.com/dealignai
