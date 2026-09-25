# mradermacher/Suri-Qwen-3.8-27B-Uncensored-i1-GGUF

## Resumen

Suri-Qwen-3.8-27B-Uncensored-i1-GGUF es una publicación de cuantizaciones GGUF realizada por mradermacher sobre el modelo SpaceTimee/Suri-Qwen-3.8-27B-Uncensored. No se trata de un modelo entrenado desde cero, sino de una redistribución optimizada para inferencia local: el autor aplica cuantización con matriz de importancia (imatrix) sobre los pesos originales en safetensors, generando ficheros listos para llama.cpp y derivados. El modelo subyacente tiene 26.895.998.464 parámetros (aproximadamente 27B) y está etiquetado por su autor como "uncensored" y "unaligned", es decir, sin el alineamiento conversacional habitual orientado a rechazar peticiones.

La relevancia de esta ficha es doble. Por un lado, documenta una vía práctica para ejecutar un modelo de ~27B en hardware de consumo mediante cuantizaciones que van de 10,1 GB (i1-IQ2_M) a 22,2 GB (i1-Q6_K). Por otro, advierte de que se trata de un modelo sin alineamiento de seguridad, con licencia no declarada en el repositorio y con idiomas soportados limitados a chino (zh) e inglés (en), lo que condiciona por completo su uso en producción.

La model card indica además que el modelo original es multimodal ("This is a vision model"), si bien los ficheros mmproj —necesarios para procesar imágenes— se alojan en el repositorio hermano de cuantizaciones estáticas, no en este. No se dispone de información sobre la longitud de contexto, la composición del dataset de entrenamiento ni resultados de benchmarks publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible explícitamente; derivada de la familia Qwen (etiqueta "qwen3.8" en el repositorio) |
| Parametros totales | 26.895.998.464 (≈26,9 B) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_M, i1-Q3_K_M, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q6_K, más fichero imatrix |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base se distribuye en safetensors |
| Tamano del repositorio | 137,3 GB (agrega todas las cuantizaciones) |
| Modelo base | SpaceTimee/Suri-Qwen-3.8-27B-Uncensored |
| Cuantizador | mradermacher |
| Fecha de publicacion | 2026-09-24 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base en la información proporcionada. Las etiquetas del repositorio ("qwen", "qwen3.8", "27B") apuntan a que Suri-Qwen-3.8-27B-Uncensored es un modelo derivado o afinado de la familia Qwen, con aproximadamente 27.000 millones de parámetros. La model card del cuantizador no documenta si se trata de un transformer denso convencional, un MoE o una arquitectura híbrida, ni detalla el número de tokens de entrenamiento, la composición del dataset o si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. La etiqueta "unaligned" sugiere precisamente la ausencia de esas fases de alineamiento conversacional, aunque el proceso concreto no está documentado.

La innovación técnica de esta publicación concreta reside en el método de cuantización. mradermacher genera cuantizaciones ponderadas mediante una matriz de importancia (imatrix) calculada sobre el modelo, lo que permite asignar menos bits a los pesos menos relevantes para la perplejidad y preservar con más fidelidad los críticos. Se ofrecen variantes del tipo i1-* (IQ2_M, IQ3_XXS, IQ4_XS, Q4_K_M, Q6_K, etc.), que en tamaños equivalentes suelen superar a las cuantizaciones estáticas tradicionales. El repositorio incluye asimismo el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. La model card advierte de que el modelo base es multimodal, por lo que la capacidad de visión requeriría los ficheros mmproj alojados en el repositorio de cuantizaciones estáticas.

## Capacidades

- Generación de texto conversacional en chino e inglés, con plantilla de chat (etiqueta "conversational").
- Modo "uncensored"/"unaligned": el modelo no incorpora, según su denominación, los mecanismos habituales de rechazo de peticiones, lo que se traduce en respuestas sin filtros de seguridad preconfigurados.
- Capacidad multimodal potencial (visión): la model card del cuantizador describe el modelo base como "vision model", aunque los ficheros mmproj no están en este repositorio.
- Compatibilidad declarada con text-generation-inference (etiqueta "text-generation-inference") y con el ecosistema transformers.
- Inferencia local mediante llama.cpp y cualquier runtime compatible con GGUF.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo "thinking" explícito: no disponible en la información proporcionada.
- Capacidades de código y matemáticas: no disponibles en la información proporcionada.

## Casos de uso

- Despliegue local en estación de trabajo con GPU de consumo: las cuantizaciones i1-Q4_K_M (16,6 GB) e i1-IQ4_XS (15,2 GB) permiten ejecutar un modelo de ~27B en una GPU de 24 GB, algo inviable con los pesos en fp16 (~53,8 GB estimados). Es el escenario principal de esta publicación.
- Experimentación en investigación sobre alineamiento y seguridad: al tratarse de un modelo explícitamente "unaligned", resulta útil como línea base para estudiar diferencias de comportamiento (tasa de rechazo, sesgos, adherencia a instrucciones) frente a modelos alineados del mismo tamaño.
- Red-teaming y evaluación de robustez: permite generar respuestas adversarias o contenido que los modelos alineados rechazarían, para probar clasificadores de contenido y sistemas de moderación en pipelines propios.
- Traducción y procesamiento bilingüe chino-inglés: al ser los dos únicos idiomas declarados, encaja en tareas de traducción zh↔en, resumen de documentación técnica china o generación de contenido bilingüe.
- Escritura creativa sin restricciones temáticas: narrativa, guiones o roleplay donde los filtros de los modelos alineados interfieren con la trama; requiere revisión humana posterior.
- Anotación y generación de datos sintéticos sobre dominios sensibles: datos clínicos, jurídicos o de seguridad donde los modelos alineados se niegan a generar ejemplos, siempre dentro de un marco legal y ético definido por el equipo.
- Prototipado de asistentes conversacionales en local sin dependencia de API: al distribuirse en GGUF, puede ejecutarse en infraestructura propia sin enviar datos a terceros, útil cuando la confidencialidad es requisito.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece hasta diez variantes de la misma familia, lo que permite medir en primera persona el compromiso entre tamaño, velocidad y calidad (perplejidad) para el hardware disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del cuantizador no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, ni para el modelo base ni para las cuantizaciones. Tampoco se proporcionan datos de perplejidad medidos, más allá de una gráfica genérica de comparación entre tipos de cuantización enlazada por el autor, que no corresponde a este modelo concreto.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (solo pesos, sin caché KV): i1-IQ2_M ≈10,1 GB; i1-Q2_K_S ≈10,3 GB; i1-Q2_K ≈10,8 GB; i1-IQ3_XXS ≈11,3 GB; i1-IQ3_M ≈12,7 GB; i1-Q3_K_M ≈13,4 GB; i1-IQ4_XS ≈15,2 GB; i1-Q4_K_S ≈15,7 GB; i1-Q4_K_M ≈16,6 GB; i1-Q6_K ≈22,2 GB.
- Margen adicional: hay que sumar la caché KV (proporcional a la longitud de contexto, que no está documentada) y, si se activa la visión, el módulo mmproj. Conviene reservar entre 2 y 6 GB extra sobre el tamaño del fichero para contexto moderado.
- GPU de consumo: las cuantizaciones IQ2/IQ3 (10–13 GB) caben en tarjetas de 12–16 GB, como RTX 3060 12 GB, RTX 4070 Ti o RTX 4080. Las de 15–17 GB (IQ4_XS, Q4_K_S, Q4_K_M) requieren 24 GB (RTX 3090, RTX 4090) o reparto entre GPU y CPU. La variante Q6_K (22,2 GB) entra muy justa en 24 GB y depende del contexto.
- GPU profesional: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB permiten ejecutar cualquier cuantización con contexto amplio y lotes mayores.
- Configuraciones multi-GPU: dos RTX 3090 o 4090 con reparto por capas (offload parcial) son una alternativa habitual para las variantes de mayor tamaño.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. La etiqueta "endpoints_compatible" del repositorio sugiere compatibilidad con APIs de tipo OpenAI gestionadas por esos runtimes. vLLM y TGI no consumen GGUF de forma nativa, por lo que para esos motores habría que partir del modelo base en safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de alternativas de la misma categoría (modelos de ~27B sin alinear) en la información proporcionada, por lo que la comparación se limita a las distintas distribuciones del mismo modelo.

| Publicación | Formato | Parametros | Tamano | Contexto | Licencia | Notas |
|---|---|---|---|---|---|---|
| SpaceTimee/Suri-Qwen-3.8-27B-Uncensored | safetensors (fp16) | 26,9 B | ≈53,8 GB (estimado) | no disponible | no disponible | Modelo base; requiere ~54 GB de VRAM o cuantización en línea |
| mradermacher/Suri-Qwen-3.8-27B-Uncensored-GGUF | GGUF estático | 26,9 B | no disponible | no disponible | no disponible | Cuantizaciones sin imatrix; incluye ficheros mmproj de visión |
| mradermacher/Suri-Qwen-3.8-27B-Uncensored-i1-GGUF | GGUF i1 (imatrix) | 26,9 B | 10,1–22,2 GB según cuantización | no disponible | no disponible | Objeto de esta ficha; cuantización ponderada por importancia |

## Limitaciones y advertencias

- Modelo sin alineamiento de seguridad: las etiquetas "uncensored" y "unaligned" implican que no aplica los filtros conversacionales habituales. Puede generar contenido ofensivo, ilegal o dañino sin advertirlo.
- Licencia no declarada: el repositorio no especifica licencia. Esto impide determinar si el uso comercial está permitido; en la práctica, tratarlo como no apto para producción hasta que se aclare.
- Idiomas limitados: solo chino e inglés. El rendimiento en castellano no está documentado y previsiblemente será inferior.
- Longitud de contexto desconocida: al no documentarse, no se puede planificar el consumo de memoria ni garantizar el comportamiento en conversaciones largas.
- Riesgo de alucinación: inherente a los modelos de lenguaje sin datos de evaluación publicados; no hay métricas de fiabilidad que lo acoten.
- Trazabilidad del entrenamiento opaca: no se documentan dataset, número de tokens, ni procesos de ajuste. No es posible auditar sesgos ni procedencia de los datos.
- Cuantizaciones de baja precisión: las variantes i1-IQ2_M, i1-Q2_K_S y i1-Q2_K (10–11 GB) degradan notablemente la calidad. La propia model card califica IQ2_K_S como "very low quality" y recomienda IQ3_XXS frente a Q2_K.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación por parte de la comunidad y de informes independientes de calidad.
- Cumplimiento normativo: el uso de un modelo sin alineamiento en aplicaciones orientadas al usuario final exige moderación externa y revisión legal, especialmente en la UE bajo el AI Act.
- Fecha de publicación futura respecto a la fecha habitual de consulta (2026-09-24), dato aportado tal cual por el repositorio.

## Enlaces

- Repositorio HuggingFace de esta publicación: https://huggingface.co/mradermacher/Suri-Qwen-3.8-27B-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/SpaceTimee/Suri-Qwen-3.8-27B-Uncensored
- Cuantizaciones estáticas (incluye ficheros mmproj de visión): https://huggingface.co/mradermacher/Suri-Qwen-3.8-27B-Uncensored-GGUF
- Página de resumen y descargas del cuantizador: https://hf.tst.eu/model#Suri-Qwen-3.8-27B-Uncensored-i1-GGUF
- Preguntas frecuentes y solicitudes de cuantización de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guía de uso de GGUF de referencia (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantización: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- La búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos no guardan relación con él y se omiten.
