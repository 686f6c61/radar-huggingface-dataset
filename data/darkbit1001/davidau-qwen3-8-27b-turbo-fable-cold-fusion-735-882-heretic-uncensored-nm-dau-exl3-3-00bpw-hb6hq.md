# darkbit1001/DavidAU-Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-EXL3-3.00bpw-HB6HQ

## Resumen

Este repositorio contiene una cuantización EXL3 de 3 bits del modelo `DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU`, subida por el usuario darkbit1001. Se trata de un modelo de generación de texto perteneciente a la familia Qwen, aunque la denominación «Qwen3.8» no corresponde a una arquitectura oficial confirmada. El modelo base es el resultado de un proceso de fine-tuning multi-etapa documentado de forma fragmentaria por su autor, que incluye fusiones, etapas de «COLD FUSION» y un paso final de des-censura («hereticing»).

La publicación solo contiene los pesos cuantizados en formato `exl3`, pensados para ejecutarse con ExLlamaV3, y no la fuente sin cuantizar. A pesar de que el nombre sugiere que el modelo tiene 27 mil millones de parámetros, el conteo de tensores del repositorio es de 6.734.157.184, una discrepancia que no se aclara en la documentación. Su interés práctico radica en ofrecer un modelo local con capacidades de razonamiento y sin alineamiento de seguridad, aunque la información técnica disponible es limitada y no hay evaluaciones independientes publicadas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (el modelo se identifica como Qwen3.8; no se especifica si es denso o MoE) |
| Parámetros totales | 6.734.157.184 (conteo de tensores del repositorio; el nombre sugiere 27B) |
| Parámetros activos | No indicado (no se especifica arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | EXL3 (3.00 bits por peso, head bits 6, codebook mul1) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | SAFETENSORS en formato exl3, 2 archivos sharded (13.5 GB en total) |

## Arquitectura y entrenamiento

El repositorio no proporciona información detallada sobre la arquitectura interna del modelo. Según el nombre, la base es un modelo de la familia Qwen, pero la etiqueta «Qwen3.8» no es una versión oficial conocida. El proceso de entrenamiento descrito por el autor en la model card es una cadena de varias etapas: un primer «hereticing» para eliminar alineamientos de seguridad, una fase de «healing» posterior y una serie de pruebas internas. Se mencionan técnicas como «COLD FUSION» y «Fable Fusion 711», así como un valor de divergencia KLD de 0.0025 en la des-censura. No se documentan datos concretos sobre el tamaño del dataset, el número de tokens de entrenamiento ni si se aplicó RLHF o DPO. Tampoco se describen innovaciones técnicas como decodificación especulativa o attention lineal.

## Capacidades

- Generación de texto y razonamiento: el autor afirma que el modelo mantiene un alto nivel de detalle en sus respuestas, con una reducción de los tokens de «overthinking» en comparación con Qwen base.
- Razonamiento analítico y multi-paso: según el autor, el modelo es especialmente fuerte en analítica y razonamiento complejo, citando una mejora de 141 puntos en ARC-C sobre el modelo base (afirmación no verificada).
- Tamaño de pensamiento variable: el autor menciona «auto-variable thinking sizes», es decir, que el modelo adapta la longitud de su razonamiento según el prompt o caso de uso.
- Des-censura explícita: el modelo está etiquetado como «Uncensored» y «Heretic», lo que implica que no aplica las alineaciones de seguridad habituales.
- No se indica soporte de tool calling, function calling, visión ni audio en la documentación disponible.

## Casos de uso

- Análisis de propuestas complejas: el autor menciona que el modelo produjo una analítica detallada de una propuesta de múltiples etapas. Puede usarse para generar informes de viabilidad, planes estratégicos o revisiones de documentación extensa.
- Simulación de personajes y narración sin filtros: al estar des-censurado, resulta adecuado para roleplay, escritura de ficción y diálogos que requieren evitar filtros de contenido.
- Asistencia de investigación local: la cuantización EXL3 permitiría ejecutar el modelo en una GPU local mediante ExLlamaV3, sin depender de servicios externos, lo que facilita pruebas privadas.
- Prototipado de agentes conversacionales: su capacidad de razonamiento y des-censura puede usarse para experimentar con asistentes que no estén limitados por políticas de contenido.
- Generación de informes analíticos: puede ser útil para obtener resúmenes y conclusiones a partir de entradas de texto largas, explotando el razonamiento multi-paso.
- Pruebas de alineación y comportamiento: el modelo es útil como referencia en entornos de investigación para comparar salidas de modelos alineados frente a versiones des-censuradas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor del modelo base afirma en la model card que el rendimiento a 4 bits se acerca al 99% del de 8 bits y que ARC-C supera en 141 puntos al modelo Qwen3.8 de 27B, pero no se aportan tablas de resultados, metodología ni comparativas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con exactitud. El repositorio pesa 13.5 GB, por lo que se necesitan al menos 13.5 GB de VRAM para los pesos, más caché KV y overhead; se estiman entre 16 y 24 GB según la longitud de contexto.
- GPU recomendadas: RTX 4090 (24 GB), A100 40/80 GB, H100 80 GB. La cuantización a 3.00 bits reduce la carga respecto a un modelo de 27B sin cuantizar.
- Compatibilidad con GPU de consumo: no se garantiza en tarjetas de 12 GB o menos debido al tamaño de los pesos; podría probarse en una RTX 3080 Ti (12 GB) con contexto reducido, pero no está confirmado.
- Opciones de despliegue: ExLlamaV3 (librería exllamav3). El formato EXL3 no es compatible de forma nativa con vLLM, llama.cpp ni Ollama. Se recomienda usar frontends basados en ExLlama, como TabbyAPI o ExUI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. El modelo es una fusión y fine-tuning no convencional sin publicaciones de referencia. No se dispone de datos que permitan compararlo con modelos estables como Qwen2.5-27B o Qwen3-27B, ni con otras versiones de la misma familia.

## Limitaciones y advertencias

- El modelo está intencionadamente des-censurado («heretic» / «uncensored»). No debe utilizarse en aplicaciones con requisitos de seguridad, moderación de contenido o cumplimiento normativo sin mecanismos externos de filtrado.
- Los datos de entrenamiento no están documentados. No se conoce la composición del dataset, lo que dificulta la evaluación de sesgos y riesgos.
- Riesgo de alucinación: no se ofrecen evaluaciones cuantitativas; la falta de alineamiento puede aumentar la generación de contenido falso o inapropiado.
- Discrepancia en el número de parámetros: el nombre sugiere 27B, pero el repositorio muestra 6.734.157.184 parámetros. Se recomienda verificar el contenido antes de hacer afirmaciones sobre el tamaño real.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base original podría tener condiciones de licencia de terceros que no se han indicado.
- El formato de pesos EXL3 solo es compatible con ExLlamaV3, lo que limita su integración en otras infraestructuras como vLLM o TGI.
- La fecha de creación del repositorio (2026-09-05) parece anómala y puede indicar un error en los metadatos.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/darkbit1001/DavidAU-Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU-EXL3-3.00bpw-HB6HQ
- Modelo base original: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Repositorio GGUF mencionado en el README: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NEO-CODER-MAX-MTP-GGUF
- Información adicional sobre el modelo: https://www.aimodels.fyi/models/huggingFace/qwen3.8-27b-turbo-fable-cold-fusion-735-882-heretic-uncensored-neo-coder-max-mtp-gguf-davidau
