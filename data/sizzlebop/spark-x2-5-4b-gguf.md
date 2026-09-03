# sizzlebop/Spark-X2.5-4B-GGUF

## Resumen

Spark-X2.5-4B es un modelo de lenguaje compacto de propósito general desarrollado por XHToken, disponible en su versión GGUF convertida por sizzlebop (Pink Pixel). El modelo original, Spark-X2.5-4B, destaca por su arquitectura híbrida de atención que combina ventanas deslizantes con capas de atención completa, alcanzando una longitud de contexto nativa de hasta 1.048.576 tokens (1M). Está diseñado para ofrecer un rendimiento sólido en tareas cotidianas como conversación, escritura, traducción, razonamiento, generación de código, uso de herramientas y flujos de trabajo agénticos.

Esta ficha se centra en la versión GGUF, que permite ejecutar el modelo en entornos locales mediante llama.cpp, Ollama o LM Studio, con múltiples niveles de cuantización que van desde BF16 (7,66 GB) hasta Q2_K (1,66 GB). El modelo base tiene 4.112.079.360 parámetros (aproximadamente 4,1B) y una licencia Apache 2.0 que permite uso comercial sin restricciones. Su relevancia actual radica en combinar un tamaño compacto con una ventana de contexto extremadamente larga, algo poco habitual en modelos de este rango de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Spark 2.5 (`Spark2_5ForCausalLM`), híbrida con sliding-window attention y full attention |
| Parámetros totales | 4.112.079.360 (4,1B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K |
| Idiomas soportados | en, zh (según model card; la documentación oficial menciona más de 200 lenguas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

La arquitectura Spark 2.5 se basa en un transformer híbrido que intercala capas de atención con ventana deslizante (sliding-window attention) con capas de atención completa (full attention). Este diseño permite mantener un coste computacional subcuadrático en secuencias largas, lo que explica la capacidad de manejar hasta 1M de tokens de contexto de forma nativa. El vocabulario es de 131.072 tokens, lo que facilita la cobertura multilingüe y de dominios técnicos.

No se dispone de información detallada sobre el proceso de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO) en la documentación proporcionada. La model card del repositorio GGUF solo indica que los pesos se convirtieron a BF16 mediante una compilación personalizada de llama.cpp y luego se cuantizaron a k-quants estándar. La documentación oficial menciona que el modelo fue diseñado para ser eficiente y práctico en tareas de conversación, escritura, traducción, razonamiento, código y agentes, pero no se publican detalles adicionales sobre la metodología de entrenamiento.

## Capacidades

- Generación de texto general: conversación, escritura creativa, resúmenes, redacción de documentos.
- Razonamiento y matemáticas: resolución de problemas lógicos y aritméticos de nivel básico e intermedio.
- Generación de código: soporte para múltiples lenguajes de programación, completado y depuración.
- Traducción automática: cobertura de al menos inglés y chino según la model card, con posible soporte ampliado a más de 200 lenguas según la documentación oficial.
- Uso de herramientas (tool use): integración con APIs y funciones externas para tareas como búsqueda, cálculo o llamadas a servicios.
- Flujos de trabajo agénticos: capacidad de planificación multi-paso y ejecución de acciones encadenadas.
- Contexto largo: manejo nativo de hasta 1M tokens, útil para procesar documentos extensos, historiales de conversación largos o análisis de código fuente de gran tamaño.

## Casos de uso

- Atención al cliente automatizada: gracias a su ventana de contexto de 1M tokens, el modelo puede gestionar conversaciones multi-turno con historial completo, resolviendo incidencias sin perder el hilo de la interacción.
- Análisis de documentos extensos: lectura y resumen de contratos, informes anuales o expedientes judiciales de cientos de páginas, extrayendo información clave sin necesidad de dividir el texto.
- Asistente de programación en producción: integrado en IDE o pipelines de CI/CD, puede sugerir implementaciones, revisar código y explicar fragmentos complejos, aprovechando su soporte para tool use y su capacidad de razonamiento.
- Traducción de contenido técnico: traducción de documentación, manuales o interfaces de usuario entre inglés y chino (y potencialmente otros idiomas), con mantenimiento del contexto semántico en textos largos.
- Agentes autónomos de investigación: combinado con herramientas de búsqueda web, el modelo puede planificar pasos de investigación, consultar fuentes y sintetizar resultados en informes estructurados.
- Procesamiento de logs y telemetría: análisis de registros de sistemas con millones de líneas, detectando patrones de error o anomalías gracias a su contexto extendido.
- Generación de contenido multilingüe: creación de artículos, guiones o publicaciones en varios idiomas con coherencia estilística, aprovechando su capacidad multilingüe.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación oficial menciona que el modelo logra "resultados líderes entre modelos abiertos de su categoría", pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas. Se recomienda consultar el repositorio oficial de XHToken para futuras actualizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia (según cuantización):
  - Q2_K: ~2 GB (mínimo absoluto, calidad degradada)
  - Q3_K_M: ~2,5 GB
  - Q4_K_M: ~3 GB (recomendado para laptops y móviles)
  - Q5_K_M: ~3,5 GB
  - Q6_K: ~4 GB
  - Q8_0: ~5 GB (recomendado si se dispone de 6 GB o más)
  - BF16: ~8-9 GB (precisión completa)
- GPUs recomendadas: tarjetas consumer con 4-8 GB de VRAM (RTX 3060, RTX 4060, RTX 3070, etc.) para cuantizaciones Q4-Q6. Para BF16 o Q8_0 se recomienda al menos 8 GB (RTX 3070 Ti, RTX 4080, etc.).
- En CPUs con suficiente RAM (16 GB o más) también es viable, usando llama.cpp con offloading parcial.
- Opciones de despliegue: llama.cpp (CLI y servidor), Ollama (mediante Modelfile), LM Studio. No se confirma compatibilidad con vLLM o TGI debido a la arquitectura personalizada `Spark2_5ForCausalLM`.
- Latencia y throughput: no disponibles. Dependerán del hardware y de la cuantización; en una GPU consumer moderna con Q4_K_M se puede esperar una generación de 20-40 tokens/s, pero no hay datos oficiales.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Spark-X2.5-4B | 4,1B | 1M | Apache 2.0 | HuggingFace, ModelScope, Ollama |
| Qwen2.5-3B | 3,1B | 32K | Apache 2.0 | HuggingFace, Ollama |
| Llama-3.2-3B | 3,2B | 128K | Llama 3.2 Community License | HuggingFace, Ollama |
| Gemma-2-9B | 9B | 8K | Gemma License | HuggingFace, Ollama |

La principal ventaja de Spark-X2.5-4B frente a alternativas de tamaño similar es su contexto de 1M tokens, muy superior a los 32K de Qwen2.5-3B o los 128K de Llama-3.2-3B. Sin embargo, Gemma-2-9B ofrece más parámetros y un rendimiento potencialmente superior en tareas complejas, aunque con un contexto mucho menor. No se dispone de comparativas numéricas de benchmarks entre estos modelos.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo de 4B, puede generar información incorrecta o inventada, especialmente en dominios especializados. Se recomienda verificar las salidas críticas.
- Limitaciones de idioma: la model card indica soporte para inglés y chino, aunque la documentación oficial menciona más de 200 lenguas. El rendimiento en idiomas no confirmados puede ser inferior.
- Contexto largo: aunque el modelo soporta 1M tokens, el rendimiento en secuencias extremadamente largas puede degradarse en la práctica, y el coste computacional aumenta con la longitud.
- Compatibilidad de runtime: los archivos GGUF requieren una compilación de llama.cpp con soporte para la arquitectura `Spark2_5ForCausalLM`. Las versiones estándar de llama.cpp o vLLM podrían no reconocer el modelo sin parches específicos.
- Cuantizaciones agresivas: los formatos Q2_K y Q3_K_M presentan una pérdida de calidad notable y solo deben usarse en entornos con restricciones extremas de memoria.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el usuario debe asumir la responsabilidad de su uso, especialmente en aplicaciones de alto riesgo.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/sizzlebop/Spark-X2.5-4B-GGUF
- Modelo base en HuggingFace: https://huggingface.co/XHToken/Spark-X2.5-4B
- Repositorio oficial en GitHub: https://github.com/XHToken/Spark-X2.5
- Página en ModelScope: https://www.modelscope.cn/models/XHToken/Spark-X2.5-4B
- Página en Ollama: https://ollama.com/SparkLLM/Spark-X2.5-4B
- Conversor GGUF alternativo (abenzerps): https://huggingface.co/abenzerps/Spark-X2.5-4B-GGUF
