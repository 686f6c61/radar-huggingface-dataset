# Lucasgitguy-co/minicpm-mermaid-gguf

## Resumen

MiniCPM-V 4.7 1B Mermaid es una cuantización GGUF Q4_K_M de un modelo de visión-lenguaje de la familia MiniCPM-V, publicada por el usuario Lucasgitguy-co y orientada específicamente a la conversión de diagramas e imágenes en código Mermaid. El repositorio empaqueta dos artefactos separados: el modelo de lenguaje cuantizado en Q4_K_M (0,672 GB) y un proyector visual en F16 (1,109 GB), que deben cargarse conjuntamente para procesar entrada de imagen. El modelo declara 1.006.209.856 parámetros totales y una licencia Apache 2.0.

La relevancia de esta publicación es doble. Por un lado, demuestra el flujo de trabajo de despliegue local de un VLM de aproximadamente mil millones de parámetros en hardware de consumo mediante llama.cpp y su herramienta `llama-mtmd-cli`. Por otro, la especialización declarada en Mermaid apunta a un caso de uso muy concreto: la transcodificación de diagramas visuales a representación textual estructurada, una tarea útil en documentación técnica, ingeniería de software y pipelines de generación automática de diagramas.

Conviene señalar que la model card es explícita respecto a sus límites: no documenta datos de entrenamiento, procedimiento de entrenamiento ni resultados de benchmarks, y advierte que el ejemplo de ejecución no fue probado como parte de la actualización de la documentación. El autor remite a dos datasets relacionados del mismo perfil (uno de texto e imágenes de diagramas Mermaid y otro de texto en inglés y neerlandés), sin que ello establezca la partición exacta de entrenamiento de cada checkpoint.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language model basado en MiniCPM-V 4.7 (transformer multimodal con proyector visual); detalles internos no disponibles |
| Parámetros totales | 1.006.209.856 |
| Parámetros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q4_K_M para el modelo de lenguaje; F16 para el proyector visual (mmproj) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`model-Q4_K_M.gguf`, `mmproj-model-f16.gguf`) |

## Arquitectura y entrenamiento

El repositorio distribuye una cuantización GGUF de un modelo de la familia MiniCPM-V 4.7, etiquetado como vision-language-model y con pipeline `image-text-to-text`. La arquitectura subyacente es un transformer multimodal con un proyector visual independiente que se carga como artefacto separado (`mmproj-model-f16.gguf`), un patrón habitual en llama.cpp para modelos de visión. El tamaño total declarado, 1.006.209.856 parámetros, sitúa el modelo en el rango de mil millones de parámetros, coherente con una variante "1B" de la familia.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni sobre si se aplicaron técnicas de alineación como RLHF o DPO. La model card indica explícitamente que los datos detallados de entrenamiento, el procedimiento y los resultados de benchmarks no están documentados en los artefactos inspeccionados. El autor menciona dos datasets relacionados del mismo perfil —`Lucasgitguy-co/mermaid-diagram-text-images` y `Lucasgitguy-co/mermaid-text-en-nl`— que sugieren un ajuste orientado a diagramas y a texto en inglés y neerlandés, pero sin confirmar la partición exacta usada en cada checkpoint. No se declaran innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto e inferencia multimodal imagen-texto, según el pipeline declarado `image-text-to-text`.
- Conversión de diagramas e imágenes en código Mermaid, que es la especialización declarada en el nombre y en el ejemplo de uso de la model card.
- Procesamiento de entrada de imagen mediante el proyector visual F16 cargado junto al modelo de lenguaje.
- Soporte de conversación multi-turno (tag `conversational`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su integración en servicios de inferencia.
- Capacidades multilingües limitadas al inglés según el campo `language: en`; no se declara soporte adicional.
- No se declara soporte de tool calling, function calling, agentes ni modos de razonamiento extendido (thinking mode).
- No se declara soporte de audio ni de otras modalidades distintas de imagen y texto.

## Casos de uso

- Documentación técnica automatizada: el modelo recibe una captura de un diagrama de arquitectura o de flujo y devuelve el código Mermaid equivalente, que puede insertarse directamente en ficheros Markdown de documentación. Es adecuado por su especialización declarada y por el tamaño reducido, que permite ejecutarlo en local.
- Generación de diagramas en repositorios: integrado en un script de CI que detecte imágenes de diagramas en el repositorio y genere o actualice los bloques Mermaid correspondientes en los README, manteniendo la documentación sincronizada con los diagramas.
- Migración de diagramas heredados: conversión por lotes de diagramas exportados como PNG o JPEG desde herramientas ofimáticas a Mermaid versionable en Git, lo que facilita la revisión mediante diff.
- Asistencia en entornos con requisitos de privacidad: al ejecutarse localmente con llama.cpp, permite procesar diagramas internos de una organización sin enviar imágenes a servicios externos.
- Prototipado rápido de pipelines multimodales: sirve como modelo de referencia de bajo coste para validar una arquitectura de extracción de información visual antes de escalar a modelos mayores.
- Educación y demostraciones: ejemplo práctico de despliegue de un VLM de aproximadamente mil millones de parámetros en hardware de consumo, útil para talleres sobre cuantización GGUF y llama.cpp.
- Extracción de estructura de diagramas para herramientas de análisis: obtener una representación textual del diagrama que pueda parsearse posteriormente para construir grafos de dependencias o documentación navegable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que los resultados de benchmarks no están documentados en los artefactos inspeccionados y que el ejemplo de ejecución no fue probado como parte de la actualización de la documentación.

## Requisitos de hardware

- VRAM estimada para inferencia: el conjunto de artefactos suma aproximadamente 1,8 GB (0,672 GB del modelo Q4_K_M y 1,109 GB del proyector F16), por lo que el peso en memoria es inferior a 2 GB antes de considerar el contexto y los buffers de cómputo.
- GPU recomendadas: no se especifican en la documentación. Por tamaño, cualquier GPU con al menos 4 GB de VRAM debería poder alojar los pesos; no hay datos medidos de latencia ni throughput.
- Compatibilidad con GPU de consumo: sí, previsiblemente en tarjetas de gama media y alta con 4 GB o más de VRAM, así como en CPU mediante llama.cpp, aunque no se aportan cifras de rendimiento.
- Opciones de despliegue: llama.cpp mediante `llama-mtmd-cli` con los parámetros `-m` para el modelo y `--mmproj` para el proyector visual. Es necesario un build de llama.cpp que soporte MiniCPM-V 4.7 y su arquitectura de proyector; el autor advierte de que se verifique este soporte antes de la descarga.
- Descarga: `hf download Lucasgitguy-co/minicpm-mermaid-gguf --local-dir ./minicpm-mermaid-gguf` con `huggingface_hub`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones detalladas (contexto, rendimiento) de este modelo que permitan una comparación cuantitativa rigurosa con alternativas. La siguiente tabla recoge únicamente los datos verificables del repositorio frente a la información disponible de la familia de origen.

| Modelo | Parámetros | Contexto | Formato | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| MiniCPM-V 4.7 1B Mermaid (esta ficha) | 1.006.209.856 | no disponible | GGUF (Q4_K_M + mmproj F16) | Apache 2.0 | no disponibles |
| MiniCPM-V 4.7 (modelo base de referencia) | no disponible | no disponible | no disponible | no disponible | no disponibles |
| Alternativas VLM de ~1B para diagramas | no disponible | no disponible | no disponible | no disponible | no disponibles |

## Limitaciones y advertencias

- La model card no documenta datos de entrenamiento, procedimiento ni evaluación, lo que impide verificar la calidad real del ajuste a Mermaid más allá de la especialización declarada.
- El ejemplo de ejecución incluido en la model card no fue probado como parte de la actualización de la documentación, según admite el propio autor.
- El soporte de MiniCPM-V 4.7 y de su arquitectura de proyector depende del build de llama.cpp utilizado; sin esa compatibilidad, el modelo no cargará.
- El campo de idioma declara únicamente inglés, aunque uno de los datasets relacionados incluye neerlandés; el alcance multilingüe real no está verificado.
- Riesgo de alucinación inherente a los modelos generativos: la conversión de un diagrama a Mermaid puede omitir relaciones, inventar nodos o producir sintaxis inválida, por lo que requiere validación.
- No se declaran sesgos conocidos ni evaluaciones de seguridad; al ser un modelo de aproximadamente mil millones de parámetros, su capacidad de razonamiento complejo es limitada en comparación con modelos mayores.
- La licencia Apache 2.0 permite uso comercial, pero exige conservar el archivo LICENSE, el NOTICE y las atribuciones de terceros al redistribuir.
- El repositorio tiene un volumen de descargas bajo (158) y ningún "like", lo que sugiere poca validación por parte de la comunidad.
- No hay información sobre la longitud de contexto soportada, lo que dificulta planificar su uso en conversaciones o documentos largos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Lucasgitguy-co/minicpm-mermaid-gguf
- Dataset relacionado (texto e imágenes de diagramas): https://huggingface.co/datasets/Lucasgitguy-co/mermaid-diagram-text-images
- Dataset relacionado (texto en inglés y neerlandés): https://huggingface.co/datasets/Lucasgitguy-co/mermaid-text-en-nl
