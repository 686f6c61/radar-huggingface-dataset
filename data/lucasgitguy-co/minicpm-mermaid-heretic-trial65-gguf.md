# Lucasgitguy-co/minicpm-mermaid-heretic-trial65-gguf

## Resumen

MiniCPM-V 4.7 1B Mermaid Heretic — Trial 65 GGUF es una cuantización en formato GGUF de un checkpoint experimental derivado de la familia MiniCPM-V, publicada por el usuario Lucasgitguy-co. El modelo es un vision-language model (VLM) de tipo image-text-to-text especializado, según su denominación, en la conversión de diagramas a código Mermaid. El artefacto empaqueta un modelo de lenguaje de aproximadamente 1.780 millones de parámetros (1,78 B) junto con un proyector visual independiente, lo que permite inferencia local de entrada de imagen y salida de texto.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación de un autor individual, etiquetado como "trial 65", sin model card técnica con datos de entrenamiento, sin benchmarks publicados y sin documentación del procedimiento de modificación "Heretic". El repositorio contiene únicamente los pesos cuantizados, un proyector visual en F16 y un bundle de conveniencia, con instrucciones de ejecución sobre llama.cpp mediante `llama-mtmd-cli`.

Por tanto, debe evaluarse como un experimento reproducible y ligero (repo de 5,6 GB, licencia Apache 2.0) más que como un modelo listo para producción. Su interés práctico reside en el tamaño reducido, que permite ejecución en hardware de consumo, y en su orientación específica a diagramas Mermaid, un nicho poco cubierto por modelos generalistas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en transformer, con proyector visual independiente (mmproj); arquitectura MiniCPM-V 4.7 según la model card |
| Parametros totales | 1.780.767.040 (1,78 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M y F16 (pesos de lenguaje); proyector visual en F16 |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (`model-Q4_K_M.gguf`, `model-f16.gguf`, `mmproj-model-f16.gguf`, bundle `minicpm-mermaid-heretic-trial65-bundle.gguf`) |

## Arquitectura y entrenamiento

La información disponible describe el artefacto como un vision-language model con dos componentes separados: un modelo de lenguaje cuantizado en GGUF y un proyector visual (`mmproj-model-f16.gguf`) que debe cargarse conjuntamente para aceptar entrada de imagen. La model card indica que se basa en MiniCPM-V 4.7 y que ha sido modificado con la herramienta "Heretic", pero no documenta en qué consiste esa modificación, qué capas afecta ni con qué objetivo se aplicó.

No se han publicado datos sobre el corpus de entrenamiento (número de tokens, composición, proporción de pares imagen-texto), ni sobre el uso de RLHF, DPO u otras técnicas de alineamiento. Tampoco se documentan innovaciones técnicas propias más allá de la integración del proyector visual. La model card reconoce explícitamente que "detailed training data, training procedure, and benchmark results are not documented in the inspected artifacts". Los datasets enlazados (`mermaid-diagram-text-images` y `mermaid-text-en-nl`) se describen como recursos relacionados del proyecto, sin que se establezca que correspondan al split exacto de entrenamiento de este checkpoint.

## Capacidades

- Generación de texto a partir de imágenes: el pipeline declarado es `image-text-to-text`, con soporte de entrada visual mediante el proyector F16.
- Conversión de diagramas a código Mermaid: capacidad objetivo del modelo según su nombre y los ejemplos de la model card (`"Convert this diagram into Mermaid code."`).
- Comprensión de imágenes genérica: al derivar de MiniCPM-V, se presupone capacidad de descripción y respuesta sobre imágenes, aunque no se documenta su alcance.
- Generación de texto: el componente de lenguaje puede operar de forma autónoma, aunque la model card no detalla sus capacidades específicas.
- Soporte de tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Modo thinking, visión de alta resolución, audio: no disponible en la documentación.

## Casos de uso

- Conversión de diagramas de arquitectura a Mermaid: el caso de uso central. Se carga una imagen de un diagrama de flujo, arquitectura de software o esquema y se solicita la salida en sintaxis Mermaid, que puede insertarse directamente en documentación Markdown o wikis.
- Documentación técnica automatizada: integración en pipelines que reciben capturas de diagramas de diseño y generan bloques Mermaid versionables en repositorios Git, aprovechando el tamaño reducido del modelo para ejecución en CI.
- Digitalización de diagramas en papel o pizarras: con un modelo de 1,78 B en Q4_K_M (0,672 GB), es viable desplegarlo en portátiles sin GPU dedicada para digitalizar esquemas fotografiados.
- Prototipado local de asistentes visuales: uso como base para experimentar con pipelines VLM en llama.cpp sin depender de servicios en la nube, dado el bajo requisito de memoria.
- Generación de diagramas para educación: conversión de figuras de material didáctico a Mermaid para su reutilización en apuntes y presentaciones.
- Evaluación comparativa de cuantizaciones: el repositorio ofrece Q4_K_M y F16 del mismo checkpoint, lo que permite medir la pérdida de calidad por cuantización en tareas de imagen-a-texto dentro de un entorno controlado.
- Investigación sobre modificación de modelos: el etiquetado "Heretic" y la numeración "trial 65" sugieren un proceso iterativo de experimentación; el artefacto puede servir para estudiar el efecto de dichas modificaciones, aunque el autor no documenta la metodología.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se documentan resultados comparativos de calidad entre variantes y que los ejemplos de carga no constituyen una afirmación de calidad medida.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo de lenguaje en Q4_K_M ocupa 0,672 GB y el proyector F16 1,109 GB, lo que suma aproximadamente 1,8 GB de pesos; con overhead de contexto y runtime, se puede estimar un uso de memoria en torno a 2-4 GB, aunque el autor no publica mediciones.
- Variante F16: el modelo de lenguaje en F16 ocupa 2,024 GB, más 1,109 GB del proyector, lo que eleva el requisito de memoria por encima de 3 GB solo en pesos.
- GPU recomendadas: no disponible en la documentación; por tamaño, cualquier GPU con 4 GB o más de VRAM debería ser suficiente.
- Compatibilidad con GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060 y superiores, así como en equipos con gráfica integrada reciente; el autor no publica pruebas.
- Opciones de despliegue: llama.cpp mediante `llama-mtmd-cli` (soporte de MiniCPM-V 4.7 y su proyector requerido). La model card advierte que Ollama y LM Studio seleccionan los archivos separados y no el bundle, y que llama.cpp no puede ejecutar el bundle directamente porque necesita modelo y mmproj como dos archivos.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 1B Mermaid Heretic Trial 65 (este) | 1,78 B | no disponible | Apache 2.0 | GGUF (Q4_K_M, F16) | Especializado en Mermaid; sin benchmarks publicados |
| MiniCPM-V base (familia) | no disponible en la informacion | no disponible | no disponible en la informacion | safetensors / GGUF | Modelo upstream; este artefacto deriva de él con modificaciones no documentadas |
| Alternativas VLM de ~2 B | no disponible en la informacion | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada para establecer una comparación cuantitativa |

No se dispone de información suficiente para una comparación rigurosa con alternativas concretas de la misma categoría; los datos de rendimiento del modelo no están publicados.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad en tareas de conversión a Mermaid ni en comprensión visual general.
- Procedencia opaca: la modificación "Heretic" no está documentada; se desconoce qué cambió respecto al MiniCPM-V 4.7 original y con qué criterio se seleccionó el "trial 65".
- Riesgo de alucinación: en tareas de imagen-a-código, el modelo puede generar sintaxis Mermaid plausible pero incorrecta o inventar elementos del diagrama; requiere validación del resultado.
- Idioma: soporte declarado únicamente en inglés; el rendimiento en castellano no está verificado y probablemente sea degradado.
- Contexto: no se documenta la longitud de ventana, lo que impide planificar su uso con diagramas o prompts extensos.
- Licencia: Apache 2.0 permite uso comercial, pero la model card exige conservar la atribución upstream y los avisos de terceros; la licencia de la herramienta Heretic es independiente de la de los artefactos.
- Madurez: autor individual, 1 like y 662 descargas en el momento de la consulta; no hay evidencia de mantenimiento ni de soporte.
- Ejemplo de inferencia no probado: la propia model card advierte que el comando de ejemplo no fue verificado durante la actualización de la documentación.
- Bundle no ejecutable directamente: el archivo único requiere desempaquetado con `gguf_bundle.py` antes de usarse con llama.cpp.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-heretic-trial65-gguf
- Checkpoint relacionado: https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-heretic-trial65
- Colección de modelos Mermaid: https://huggingface.co/collections/Lucasgitguy-co/mermaid-models-6aec32e19fcffdc51361686e
- Dataset de diagramas texto-imagen: https://huggingface.co/datasets/Lucasgitguy-co/mermaid-diagram-text-images
- Dataset de texto inglés/neerlandés: https://huggingface.co/datasets/Lucasgitguy-co/mermaid-text-en-nl
- Informe técnico (referenciado en la model card): docs/paper.md, docs/paper.pdf, docs/citation.bib
- Guía de uso: docs/USAGE.md
- Estructura de archivos: docs/FILE_STRUCTURE.md
- Procedencia y reproducibilidad: docs/PROVENANCE.md
- Historial de versiones: CHANGELOG.md
- Índice de modelos: docs/MODEL_INDEX.md
