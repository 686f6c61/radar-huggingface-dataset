# mradermacher/Qwen3.8-27B-3MPER0RR-obliterated-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `Qwen3.8-27B-3MPER0RR-obliterated`, una variante "abliterada" (obliterated) del modelo Qwen3.8-27B de Alibaba, publicada por el usuario mradermacher. La abliteración es una técnica que elimina selectivamente las resistencias de seguridad aprendidas durante el entrenamiento, dando como resultado un modelo menos restrictivo en sus respuestas, orientado a usos como roleplay, escritura creativa o investigación en seguridad de IA. El autor ha aplicado además cuantización con matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precisión.

El modelo base Qwen3.8-27B es un transformer denso de 27 mil millones de parámetros (26.895.998.464 en este repo), con 64 capas, tamaño oculto de 5.120 y un vocabulario de 248.320 tokens. Emplea una arquitectura de atención híbrida que combina atención estándar con capas Gated DeltaNet, lo que reduce el coste de la caché KV y permite una ventana de contexto de 262.144 tokens. Este repo ofrece múltiples cuantizaciones GGUF (desde Q2_K hasta Q6_K) para adaptarse a diferentes capacidades de hardware, siendo especialmente útil para ejecución local en GPU de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (Gated DeltaNet + atención estándar) |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens (según modelo base) |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | No disponible (el modelo base es multilingüe, pero no se especifica en este repo) |
| Licencia | No disponible en el repo; el modelo base Qwen3.8-27B se publica bajo Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, desarrollado por Alibaba, es un transformer denso de 27B parámetros con 64 capas y tamaño oculto de 5.120. Su innovación principal es la atención híbrida: 48 de las 64 capas utilizan Gated DeltaNet, una variante de atención lineal que reduce la complejidad computacional y el uso de memoria de la caché KV, mientras que las 16 restantes emplean atención estándar. Esto permite mantener una ventana de contexto de 262.144 tokens con un coste de memoria razonable. El modelo fue entrenado con un gran corpus multilingüe y posteriormente ajustado con técnicas de RLHF/DPO para alineación.

La versión "obliterated" de este repo aplica abliteración, un proceso que identifica y elimina direcciones en el espacio de activaciones responsables de comportamientos de rechazo o censura. El resultado es un modelo que conserva la mayor parte de sus capacidades de razonamiento y generación, pero con una disposición mucho más permisiva ante solicitudes que el modelo original rechazaría. El autor mradermacher ha generado cuantizaciones GGUF con imatrix (matriz de importancia) para optimizar la distribución de errores de cuantización, especialmente en las versiones de baja precisión.

## Capacidades

- Generación de texto y conversación: mantiene las capacidades del modelo base para diálogo multirround, con un tono menos restrictivo.
- Razonamiento y matemáticas: el modelo base destaca en tareas de razonamiento complejo y resolución de problemas matemáticos.
- Generación de código: soporta lenguajes de programación comunes y puede asistir en tareas de desarrollo.
- Comprensión multilingüe: aunque no se especifica en el repo, el modelo base Qwen3.8-27B soporta múltiples idiomas, incluyendo español, inglés, chino, etc.
- Ventana de contexto larga: gracias a los 262k tokens de contexto, puede procesar documentos extensos o mantener conversaciones muy largas.
- Sin restricciones de contenido: la abliteración elimina la mayoría de los rechazos por contenido, permitiendo temas que el modelo original bloquearía (uso responsable recomendado).
- Soporte de tool calling y agentes: el modelo base incluye capacidades de function calling, aunque no se confirma explícitamente en esta variante.

## Casos de uso

- Roleplay y escritura creativa: el modelo abliterado permite explorar narrativas con contenido adulto o controvertido sin los rechazos típicos de los modelos alineados. Su ventana de 262k tokens permite mantener historias largas con coherencia.
- Investigación en seguridad de IA: útil para estudiar comportamientos de modelos sin alineación, probar técnicas de jailbreak o analizar sesgos latentes. Los investigadores pueden ejecutarlo localmente con cuantizaciones ligeras.
- Asistente de programación sin censura: puede generar código para fines legítimos pero que otros modelos rechazan, como scripts de pentesting o análisis de vulnerabilidades, siempre dentro de un marco legal.
- Procesamiento de documentos extensos: su contexto de 262k tokens permite resumir o extraer información de libros completos, informes anuales o expedientes judiciales en una sola pasada.
- Generación de diálogos para entrenamiento de otros modelos: al no tener restricciones, puede usarse para sintetizar datos conversacionales diversos que luego se filtran y alinean para modelos comerciales.
- Despliegue en entornos con recursos limitados: las cuantizaciones Q4_K_M o Q5_K_M (alrededor de 16-19 GB) permiten ejecutar el modelo en GPUs de consumo como RTX 3090/4090, posibilitando aplicaciones locales de chat o generación de texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización GGUF en la información disponible. El modelo base Qwen3.8-27B tiene benchmarks publicados por Alibaba (MMLU, HumanEval, GSM8K, etc.), pero no se incluyen en este repo ni en los resultados de búsqueda obtenidos. Se recomienda consultar la ficha del modelo base en Hugging Face para datos de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: según la cuantización, los tamaños de archivo varían. Por ejemplo, Q4_K_M ocupa aproximadamente 16,8 GB (según repos similares), Q5_K_M alrededor de 19 GB, y Q2_K alrededor de 10 GB. Se necesita VRAM adicional para la caché KV, que con 262k tokens puede ser considerable, aunque la atención híbrida reduce su huella.
- GPU recomendadas: para cuantizaciones Q4_K_M o superiores, se recomienda una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A5000). Para Q2_K o IQ2_M, una GPU de 12-16 GB (RTX 3060, RTX 4070) puede ser suficiente.
- Compatibilidad con GPU de consumo: sí, las cuantizaciones más ligeras (Q2_K, IQ2_M, IQ3_M) caben en GPUs de 8-12 GB, aunque con menor calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (con soporte GGUF), text-generation-webui, entre otros.
- Latencia y throughput: no se dispone de datos medidos para esta cuantización. En general, un modelo de 27B en Q4_K_M en una RTX 4090 puede generar entre 20 y 40 tokens por segundo, dependiendo de la implementación y la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | 262k | Apache 2.0 | safetensors | Modelo original de Alibaba, con alineación estándar |
| Qwen3.8-27B-OBLITERATED (mradermacher) | 27B | 262k | Apache 2.0 (base) | GGUF, safetensors | Versión abliterada sin imatrix, también disponible en este autor |
| Qwen3.8-27B-3MPER0RR-obliterated-i1 (este repo) | 27B | 262k | No especificada | GGUF | Variante con imatrix y cuantizaciones adicionales |
| Llama 3.1 8B (para comparar tamaño menor) | 8B | 128k | Llama 3.1 | GGUF | Menor capacidad pero más ligero, no abliterado |

La comparativa se centra en características, no en rendimiento, ya que no hay datos de benchmarks disponibles para esta cuantización. El modelo base Qwen3.8-27B es superior en capacidad a Llama 3.1 8B, pero requiere más recursos.

## Limitaciones y advertencias

- La abliteración elimina mecanismos de seguridad, lo que puede llevar a generar contenido dañino, ilegal o éticamente cuestionable. El uso debe ser responsable y en contextos legales.
- Riesgo de alucinaciones: como cualquier modelo de lenguaje, puede inventar información, especialmente en temas especializados. La cuantización de baja precisión (Q2, IQ2) puede aumentar este riesgo.
- Sesgos: el modelo base puede contener sesgos de género, raza o ideología presentes en sus datos de entrenamiento; la abliteración no los elimina.
- Limitaciones de idioma: aunque el modelo base es multilingüe, su rendimiento en español puede ser inferior al de modelos específicamente entrenados para este idioma.
- Restricciones de licencia: la licencia del repo no está especificada; el modelo base es Apache 2.0, pero el autor no confirma si las modificaciones mantienen esa licencia. Se recomienda contactar con el autor antes de uso comercial.
- Compatibilidad de contexto: aunque el modelo soporta 262k tokens, la memoria necesaria para la caché KV puede ser prohibitiva en GPUs de consumo; se recomienda usar contextos más cortos (8k-32k) en la práctica.
- Calidad de cuantización: las cuantizaciones extremas (Q2_K, IQ1) degradan notablemente la calidad de generación y pueden producir incoherencias.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-obliterated-i1-GGUF
- Repositorio del modelo base (Qwen3.8-27B): https://huggingface.co/Qwen/Qwen3.8-27B (referencia indirecta, no verificado)
- Repositorio de la versión abliterada sin imatrix: https://huggingface.co/mradermacher/Qwen3.8-27B-OBLITERATED-GGUF
- Artículo sobre ejecución local de Qwen3.8-27B: https://dev.to/purpledoubled/run-qwen-38-27b-locally-real-gguf-sizes-the-kv-cache-trick-and-the-template-trap-114j
- Especificaciones y requisitos de hardware: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Información del modelo en LLM Releases: https://www.llm-releases.com/models/qwen3-8-27b
