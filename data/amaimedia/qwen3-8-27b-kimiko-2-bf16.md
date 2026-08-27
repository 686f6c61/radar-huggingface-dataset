# AMAImedia/Qwen3.8-27B-Kimiko-2-BF16

## Resumen

AMAImedia/Qwen3.8-27B-Kimiko-2-BF16 es un modelo de lenguaje multimodal (imagen-texto) de 27 356 millones de parámetros, creado mediante la fusión de nueve modelos base derivados de la familia Qwen3.8-27B. El merge se realizó con la herramienta mergekit utilizando el método Karcher Mean, que combina los pesos de los modelos de forma geométrica. El modelo está publicado por AMAImedia como parte de su plataforma NOESIS de doblaje profesional multilingüe, aunque su uso no se limita a esa aplicación.

El modelo hereda las capacidades de sus componentes: razonamiento, generación de código, soporte de herramientas (tool calling) y procesamiento de imágenes. Al ser un merge, no ha sido entrenado desde cero, sino que combina las fortalezas de modelos como Qwen3.8-27B, Kiwen1.1-27B, Tess-4-27B y otros. La arquitectura es un transformer denso con 64 capas, atención por grupos (GQA) y un tamaño de contexto que no se especifica en la documentación disponible. El repositorio contiene los pesos en formato safetensors con precisión bfloat16, ocupando 54,7 GB.

La relevancia de este modelo radica en su enfoque de fusión: los benchmarks internos reportan mejoras significativas en tareas de razonamiento matemático (GSM8K) y en clasificación y routing de intenciones, aunque los resultados oficiales para el modelo fusionado aún no se han publicado (marcados como TBD). Es una opción interesante para desarrolladores que buscan un modelo multimodal de 27B con capacidades de agente, pero su licencia no está especificada, lo que limita su uso comercial sin verificación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (qwen3_5_text), 64 capas, hidden size 5120, 24 query heads, 4 key/value heads (GQA), feed-forward 17408 |
| Parametros totales | 27 356 728 560 (27,36 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (solo se publica BF16) |
| Idiomas soportados | No disponible (se infiere multilingüe por los modelos base, pero no se especifica) |
| Licencia | No disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un merge de nueve modelos pre-entrenados, todos ellos variantes de la familia Qwen3.8-27B o modelos derivados. La fusión se realizó con mergekit utilizando el método Karcher Mean, que calcula la media geométrica de los pesos en el espacio de matrices. La configuración YAML muestra que se fusionaron capas específicas: la capa de embedding, las 64 capas del transformer de lenguaje y las 27 capas del bloque visual. También se menciona una configuración alternativa con el método RAMPlus-TL, aunque la principal es Karcher.

No se dispone de información sobre el entrenamiento original de los modelos base (datos, número de tokens, técnicas de alineación como RLHF o DPO). El merge no implica entrenamiento adicional; simplemente combina los pesos existentes. Esto significa que las capacidades del modelo son una mezcla de las de sus componentes, sin garantía de coherencia total en todas las tareas.

## Capacidades

- Generación de texto y razonamiento: hereda las capacidades de Qwen3.8-27B, que destaca en tareas de razonamiento lógico y matemático.
- Generación de código: el modelo base Qwen3.8-27B está optimizado para coding, por lo que el merge mantiene esta habilidad.
- Procesamiento de imágenes: al ser un modelo image-text-to-text, puede recibir imágenes como entrada y generar texto relacionado (por ejemplo, descripciones, respuestas a preguntas visuales).
- Soporte de tool calling: el benchmark interno reporta una mejora de +15,1 en multi-turn tool calling, lo que indica que el modelo puede invocar funciones externas en conversaciones.
- Capacidades de agente: gracias al tool calling y al razonamiento multi-paso, puede usarse en flujos de trabajo agénticos.
- Multilingüismo: aunque no se especifican los idiomas, los modelos base (Qwen, Tess) son multilingües, por lo que se espera cobertura de varios idiomas, incluyendo vietnamita (por la mención de VMLU).
- Clasificación y routing de intenciones: el benchmark interno muestra mejoras de +20,9 y +20,7 en estas tareas, lo que lo hace útil para sistemas de diálogo.

## Casos de uso

- Atención al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con soporte de tool calling para consultar bases de datos o APIs, gracias a su capacidad de clasificar intenciones y rutar peticiones.
- Generación de código en producción: integrable en pipelines de CI/CD para autocompletar, revisar o documentar código, aprovechando su entrenamiento en coding y su capacidad de razonamiento.
- Automatización de oficina: el modelo base Qwen3.8-27B está diseñado para tareas de oficina (generación de informes, resúmenes, extracción de datos), y el merge conserva estas habilidades.
- Asistente visual para documentación técnica: al aceptar imágenes, puede describir diagramas, capturas de pantalla o esquemas, útil en soporte técnico o documentación.
- Traducción automática: el benchmark interno muestra una mejora de +22,9 en traducción, por lo que puede usarse para traducir textos entre idiomas, aunque no se especifica qué pares.
- Sistema de recomendación o routing de consultas: su capacidad de clasificar intenciones y rutar a la acción adecuada lo hace adecuado para motores de diálogo o asistentes virtuales.
- Análisis de sentimiento o clasificación de texto: gracias a su mejora en clasificación de intenciones, puede aplicarse a tareas de análisis de opiniones o categorización de contenido.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa de los modelos base, pero los resultados para Kimiko-2-27B (el modelo fusionado) están marcados como TBD (por determinar). No se han publicado resultados oficiales para este modelo específico. La tabla es la siguiente:

| Modelo | GSM8K strict | GSM8K flexible | IFEval prompt strict | IFEval inst strict | IFEval prompt loose | IFEval inst loose | VMLU val (744) |
|---|---:|---:|---:|---:|---:|---:|---:|
| Qwen3.8-27B | 67,4 | 74,9 | 80,4 | 82,5 | 83,2 | 84,3 | 83,5 |
| Kiwen-27B | 72,78 | 84,38 | 84,29 | 86,45 | 86,69 | 88,01 | 86,02 |
| Kiwen1.1-27B | 96,4 | 96,7 | 83,9 | 87,5 | 87,2 | 89,7 | 84,8 |
| Kimiko-2-27B | TBD | TBD | TBD | TBD | TBD | TBD | TBD |

Además, se reporta un benchmark interno de 20 tareas donde el modelo ganó 5, perdió 6 y empató 5, con una mediana de delta 0,0. Las mejoras más destacadas son:

| Tarea | Delta |
|---|---:|
| Traducción | +22,9 |
| Clasificación de intención | +20,9 |
| Routing de intención | +20,7 |
| Tool calling multi-turno | +15,1 |

Estos datos provienen de la model card y no han sido verificados de forma independiente.

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de hardware.
- El tamaño del repositorio es de 54,7 GB en BF16, lo que implica que la inferencia en esta precisión requiere al menos 60-70 GB de VRAM (considerando overhead). Esto supera la capacidad de GPUs de consumo como la RTX 4090 (24 GB) o la RTX 3090 (24 GB). Se necesitarían GPUs profesionales como A100 (80 GB) o H100 (80 GB) para ejecutar el modelo sin cuantización.
- No se mencionan cuantizaciones disponibles (GGUF, AWQ, etc.), por lo que no se puede reducir el requisito de VRAM sin convertirlo manualmente.
- Para despliegue, se podría usar vLLM, TGI o llama.cpp (si se convierte a GGUF), pero no hay instrucciones específicas en la documentación.
- Dado que el modelo tiene 0 descargas y 0 likes, no hay reportes de latencia o throughput.

## Comparativa con modelos similares

El modelo se puede comparar con sus componentes principales, todos de 27B de parámetros. La siguiente tabla resume las diferencias en rendimiento (valores de los modelos base, no del merge):

| Modelo | Parámetros | Contexto | GSM8K strict | IFEval inst strict | VMLU | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Qwen3.8-27B | 27,36 B | No disponible | 67,4 | 82,5 | 83,5 | Apache 2.0 (según Qwen) |
| Kiwen1.1-27B | 27,36 B | No disponible | 96,4 | 87,5 | 84,8 | No disponible |
| Kimiko-2-27B (este) | 27,36 B | No disponible | TBD | TBD | TBD | No disponible |

No se dispone de comparación con otros modelos de 27B fuera de la familia Qwen. La licencia de Qwen3.8-27B es Apache 2.0, pero la del merge no está especificada.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial del modelo no está garantizado sin una aclaración legal. Se recomienda contactar con AMAImedia antes de utilizarlo en producción.
- Resultados de benchmarks no publicados: los valores de rendimiento del modelo fusionado están marcados como TBD, por lo que no hay evidencia independiente de su calidad.
- Modelo sin adopción: con 0 descargas y 0 likes, no ha sido probado por la comunidad, lo que aumenta el riesgo de comportamientos inesperados.
- Sesgos y alucinaciones: al ser un merge de varios modelos, puede heredar sesgos de sus componentes. No hay información sobre mitigaciones.
- Limitaciones de contexto: se desconoce la longitud de contexto soportada, lo que puede afectar a tareas que requieran ventanas largas.
- Riesgo de incoherencia: la fusión de pesos puede degradar el rendimiento en tareas específicas si los modelos base difieren significativamente en sus distribuciones.
- Sin soporte oficial: al ser un proyecto de una organización pequeña, no hay garantía de mantenimiento o actualizaciones.

## Enlaces

- [HuggingFace: AMAImedia/Qwen3.8-27B-Kimiko-2-BF16](https://huggingface.co/AMAImedia/Qwen3.8-27B-Kimiko-2-BF16)
- [Repositorio original: nlpguy/Qwen3.8-27B-Kimiko-2](https://huggingface.co/nlpguy/Qwen3.8-27B-Kimiko-2)
- [Arquitectura en hfviewer](https://hfviewer.com/AMAImedia/Qwen3.8-27B-Kimiko-2-BF16)
- [Modelo base: Qwen/Qwen3.8-27B](https://huggingface.co/Qwen/Qwen3.8-27B)
- [Modelo base: Danielbrdz/Barcenas-Qwen3.8-27B-Fable](https://huggingface.co/Danielbrdz/Barcenas-Qwen3.8-27B-Fable)
- [Modelo base: empero-ai/Qwythos-27B-v1](https://huggingface.co/empero-ai/Qwythos-27B-v1)
- [Modelo base: bottlecapai/ThinkingCap-Qwen3.6-27B](https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.6-27B)
- [Modelo base: allenai/tmax-27b](https://huggingface.co/allenai/tmax-27b)
- [Modelo base: migtissera/Tess-4-27B](https://huggingface.co/migtissera/Tess-4-27B)
- [Modelo base: TeichAI/Qwen3.8-27B-Fable-Distill](https://huggingface.co/TeichAI/Qwen3.8-27B-Fable-Distill)
- [Modelo base: beyoru/Kiwen1.1-27B](https://huggingface.co/beyoru/Kiwen1.1-27B)
- [Modelo base: nlpguy/Qwen3.8-27B-Fimi-4](https://huggingface.co/nlpguy/Qwen3.8-27B-Fimi-4)
- [Guía local para Qwen3.8-27B](https://linas.substack.com/p/qwen3-8-27b-local-guide)
