# marafx2007/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF

## Resumen

El modelo `marafx2007/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF` es una versión cuantizada en formato GGUF del modelo `huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated`, que a su vez es una variante modificada de `Qwen3-Coder-30B-A3B-Instruct` desarrollada por Alibaba. La cuantización ha sido realizada por mradermacher y publicada en este repositorio por el usuario marafx2007; incluye cuantizaciones i1 con matrices de importancia (imatrix), orientadas a reducir la pérdida de calidad en modelos de mezcla de expertos. Con 30.532.122.624 parámetros totales y unos 3.000 millones de parámetros activos, la arquitectura MoE permite una inferencia comparativamente eficiente respecto a modelos densos del mismo tamaño. El modelo se distribuye bajo licencia Apache 2.0 y está etiquetado para inglés, con foco en tareas de código y conversación. La variante abliterated reduce los filtros de rechazo del modelo original, por lo que responde sin censura; no se proporcionan en la documentación datos de contexto ni benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) basada en Qwen3-Coder-30B-A3B-Instruct, cuantizada en GGUF |
| Parámetros totales | 30.532.122.624 (30,5B) |
| Parámetros activos | ~3.000.000.000 (3B) activos, según la nomenclatura A3B del modelo base |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M (lista parcial; el README se corta) |
| Idiomas soportados | inglés (según los metadatos del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 e imatrix; incluye además un archivo de imatrix de 0,2 GB) |

## Arquitectura y entrenamiento

El modelo es una cuantización GGUF de una variante abliterated de Qwen3-Coder-30B-A3B-Instruct. La arquitectura subyacente es un transformador de mezcla de expertos (MoE) con 30.500 millones de parámetros totales y alrededor de 3.000 millones de parámetros activos por token. La técnica de abliteración, aplicada por el autor huihui-ai, consiste en eliminar o debilitar en el espacio de activación las direcciones asociadas a comportamientos de rechazo o censura, dando lugar a un modelo «uncensored». Las cuantizaciones i1 fueron generadas por mradermacher utilizando un archivo de imatrix, destinado a guiar la cuantización hacia los pesos más importantes y reducir la pérdida de calidad. No se proporcionan datos sobre el dataset de entrenamiento ni sobre el proceso de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- Generación de código y razonamiento: el nombre del modelo indica Qwen3-Coder, una familia orientada a tareas de programación; sin embargo, la información disponible no incluye una lista oficial de capacidades.
- Conversación: la etiqueta «conversational» sugiere soporte de diálogo en formato instruct.
- Sin censura: la variante abliterated responde sin los filtros de rechazo habituales del modelo original; esto implica que puede generar contenido no deseado o potencialmente dañino.
- Tool calling: no se especifica en la información disponible; si se hereda del modelo base Qwen3-Coder, podría ser compatible, pero no está confirmado.
- Multilingüe: los metadatos indican únicamente inglés.
- Visión y audio: no disponible; el repositorio no incluye proyector multimodal (se menciona «skip_mmproj» en los comentarios de la configuración).

## Casos de uso

- Asistente de programación local sin restricciones: gracias al formato GGUF y a la cuantización Q4_K_M, el modelo puede ejecutarse en una estación de trabajo con GPU de 24 GB, proporcionando asistencia para escribir código, refactorizar funciones y generar pruebas unitarias. La variante abliterated no rechaza preguntas sobre temas controversiales ni propuestas de diseño poco convencionales.
- Revisión de código en CI/CD: el modelo puede integrarse en pipelines mediante llama.cpp u Ollama para revisar cambios y sugerir correcciones. Al ser una variante uncensored, puede criticar abiertamente el código sin los filtros habituales de modelos alineados.
- Automatización de documentación técnica: genera documentación de API, comentarios de código y README a partir de fragmentos de código. Su tamaño (30B con 3B activos) permite respuestas detalladas sin necesidad de un servidor de gran escala.
- Tutor de programación interactivo: en un entorno educativo, el modelo puede mantener conversaciones largas con estudiantes y adaptar explicaciones. La ausencia de rechazos por temas «sensibles» permite explorar conceptos avanzados sin cortapisas.
- Prototipado rápido de scripts: en laboratorios de datos, investigadores pueden usar el modelo para generar scripts de análisis, manipulación de datos y visualización en Python, con la ventaja de ser un modelo de código específico.
- Agentes de desarrollo en local: usando llama.cpp y el soporte de tool calling del modelo original (si se confirma), se puede construir un agente que lea archivos, ejecute comandos e itere sobre el código. El nombre «Instruct» y «Coder» sugiere esa posibilidad, aunque no está documentado en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README no incluye tablas de evaluación. El rendimiento depende del modelo base Qwen3-Coder-30B-A3B-Instruct, pero no se proporcionan mediciones de MMLU, HumanEval, GSM8K ni otros conjuntos en esta documentación. Tampoco se indican cifras de latencia o throughput.

## Requisitos de hardware

- VRAM estimada: para la cuantización Q4_K_M (18,7 GB) se necesitan aproximadamente 20-22 GB de VRAM, incluyendo el KV cache para contextos cortos. Para Q4_K_S (17,6 GB) unas 19-21 GB. Para Q3_K_M (14,8 GB) unas 16-18 GB.
- GPU recomendadas: RTX 3090 o RTX 4090 (24 GB) para Q4_K_M; RTX 4080 (16 GB) para Q3_K_M. No se recomienda para GPUs con menos de 16 GB de VRAM.
- Consumer GPU: sí, cabe en GPUs de consumo con 16 GB o más, dependiendo de la cuantización elegida. No cabe en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, KoboldCpp y otras herramientas compatibles con GGUF. El README remite a las instrucciones de TheBloke para usar los archivos concatenados.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF (este repo) | 30,5B totales, ~3B activos | no disponible | no disponible | Apache 2.0 | GGUF cuantizado en HuggingFace |
| Qwen/Qwen3-Coder-30B-A3B-Instruct (modelo original) | 30,5B totales, ~3B activos | no disponible | no disponible | Apache 2.0 | Pesos en safetensors en HuggingFace |
| huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated (variante base) | 30,5B totales, ~3B activos | no disponible | no disponible | Apache 2.0 | Pesos en safetensors en HuggingFace |
| mradermacher/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-GGUF (cuantización estática) | 30,5B totales, ~3B activos | no disponible | no disponible | Apache 2.0 | GGUF estático en HuggingFace |

La comparación se centra en la misma familia; la diferencia entre las cuatro entradas es el tipo de cuantización (i1 frente a estática) y la presencia o ausencia de abliteración en el modelo original.

## Limitaciones y advertencias

- Sesgos y seguridad: al ser un modelo abliterated/uncensored, los comportamientos de rechazo del modelo original han sido eliminados. Esto reduce la protección frente a la generación de contenido dañino, ilegal o no seguro. No se ha realizado ninguna evaluación de seguridad en la información disponible.
- Alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada. No se aportan datos de calidad ni verificación.
- Limitaciones de idioma y contexto: los metadatos indican únicamente inglés; no se especifica la longitud de contexto, por lo que para tareas con dependencias largas hay que verificar la documentación del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el modificador «abliterated» es una alteración del modelo original; es responsabilidad del usuario comprobar el cumplimiento de la licencia del modelo base Qwen y las condiciones de uso.
- Calidad de la cuantización: las cuantizaciones de baja precisión (IQ1, IQ2) degradan considerablemente la calidad del modelo. El README las describe como «para los desesperados» o «de muy baja calidad». Para producción se recomienda al menos Q4_K_M o Q4_K_S.
- Despliegue y soporte: el repositorio tiene pocas descargas y no hay información sobre pruebas de rendimiento; la comunidad no ha validado el modelo en producción.
- Dependencia de archivos de imatrix: las cuantizaciones i1 requieren el archivo de imatrix (0,2 GB) para crear nuevas cuantizaciones; no es necesario para usar los archivos GGUF pre-generados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/marafx2007/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF
- Modelo base abliterated: https://huggingface.co/huihui-ai/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Cuantizaciones estáticas del mismo modelo: https://huggingface.co/mradermacher/Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-GGUF
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct/blob/main/LICENSE
- Instrucciones de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Página de resumen del modelo (tst.eu): https://hf.tst.eu/model#Huihui-Qwen3-Coder-30B-A3B-Instruct-abliterated-i1-GGUF
