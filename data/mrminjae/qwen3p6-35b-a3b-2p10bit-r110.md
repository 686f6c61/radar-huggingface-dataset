# mrminjae/qwen3p6-35b-a3b-2p10bit-r110

## Resumen

El modelo `mrminjae/qwen3p6-35b-a3b-2p10bit-r110` es un checkpoint de investigación derivado de `Qwen/Qwen3.6-35B-A3B`, publicado por el usuario mrminjae en Hugging Face. Se trata de una cuantización selectiva del modelo base: los expertos enrutados (routed experts) de la arquitectura MoE se almacenan con una precisión media efectiva de 2,10 bits, mientras que el resto de pesos permanece en BF16. Los pesos se guardan de forma desquantizada en tensores BF16, de modo que cargan directamente con `transformers` y vLLM sin necesidad de kernels de cuantización especiales.

El modelo base, Qwen3.6-35B-A3B, es un modelo de lenguaje multimodal de tipo MoE (image-text-to-text y text-generation) desarrollado por el equipo Qwen de Alibaba. La variante aquí descrita conserva la arquitectura y el pipeline del original, pero reduce drásticamente el tamaño en disco de los expertos, lo que abarata el almacenamiento y el ancho de banda de memoria a costa de una pérdida de calidad aún no cuantificada públicamente.

La relevancia de este checkpoint es fundamentalmente práctica para investigación: permite estudiar el impacto de cuantizaciones extremas (por debajo de 3 bits) en los expertos de un MoE de gran tamaño manteniendo el resto de la red intacta en BF16. No obstante, al ser un checkpoint interno con cero descargas, sin model card detallada y sin licencia explícita, no debe considerarse un artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en transformer (Qwen3.5 MoE, tag `qwen3_5_moe`); multimodal image-text-to-text |
| Parametros totales | 45.844.600.176 (según safetensors); el nombre comercial indica 35B-A3B |
| Parametros activos | A3B (aproximadamente 3B activos, según la nomenclatura del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Routed experts a 2,10 bits de media (pesos almacenados desquantizados en BF16); resto de pesos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, sin especificarla) |
| Formato de pesos | safetensors (BF16 desquantizado) |
| Tamaño del repositorio | 91,7 GB |
| Librería | transformers |
| Pipeline | text-generation (con capacidad image-text-to-text) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.6-35B-A3B, una red de mezcla de expertos (MoE) de tipo transformer con capacidades multimodales de entrada imagen-texto. El tag `qwen3_5_moe` en Hugging Face sugiere una implementación basada en la familia Qwen3.5 MoE. La nomenclatura "35B-A3B" indica aproximadamente 35 mil millones de parámetros totales con unos 3 mil millones activos por token, aunque el recuento real de safetensors asciende a 45.844.600.176 parámetros, probablemente por la inclusión de componentes de visión y embeddings no contabilizados en la cifra comercial.

El proceso de "entrenamiento" de este checkpoint no es un entrenamiento convencional, sino una cuantización post-entrenamiento selectiva: únicamente los expertos enrutados se comprimen a una media de 2,10 bits, mientras que attention, embeddings, capas densas y router se mantienen en BF16. Los pesos resultantes se desquantizan y almacenan como tensores BF16, por lo que no se requiere ningún runtime de cuantización especial. No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si se aplicaron fases de RLHF o DPO. Tampoco hay datos sobre la metodología exacta de cuantización (algoritmo, calibración, granularidad por grupo) más allá de la precisión media declarada.

## Capacidades

- Generación de texto conversacional y de formato largo, heredada del modelo base Qwen3.6-35B-A3B.
- Procesamiento multimodal de entrada imagen-texto (`image-text-to-text`), según los tags del repositorio.
- Razonamiento y matemáticas: capacidades propias del modelo base, si bien la cuantización extrema de los expertos puede degradarlas de forma no medida.
- Generación de código: presumiblemente soportada por el modelo base, sin datos específicos de esta variante.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que sugiere despliegue en infraestructura de inferencia gestionada.
- Soporte de tool calling y function calling: no confirmado para esta variante.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para esta variante.
- Idiomas: no disponible.

## Casos de uso

- Investigación sobre cuantización extrema en MoE: este checkpoint permite medir la degradación de calidad al comprimir únicamente los expertos enrutados a 2,10 bits mientras el resto de la red permanece en BF16, aislando el efecto de la cuantización de expertos frente a la de attention o embeddings.
- Evaluación comparativa de robustez: comparar las salidas de este checkpoint con las del modelo base Qwen3.6-35B-A3B en tareas de razonamiento, código y matemáticas para cuantificar la pérdida introducida por la compresión.
- Despliegue en entornos con almacenamiento limitado: al reducir el tamaño de los expertos, el repositorio ocupa 91,7 GB frente a lo que ocuparía el modelo base en BF16 completo, lo que facilita su almacenamiento en nodos con discos de menor capacidad.
- Pruebas de compatibilidad con vLLM y transformers: la model card afirma que los pesos cargan con `transformers` y vLLM estándar, por lo que sirve como banco de pruebas de pipelines de inferencia sin kernels personalizados.
- Reproducción de experimentos internos: al estar etiquetado como checkpoint de investigación interno (r110), puede emplearse para replicar resultados de laboratorio sobre compresión de MoE.
- Análisis de multimodalidad tras cuantización: evaluar si las capacidades image-text-to-text del modelo base se preservan cuando solo los expertos han sido comprimidos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos desquantizados en BF16, el modelo requiere aproximadamente 2 bytes por parámetro, es decir, en torno a 91,7 GB solo para los pesos. A ello hay que sumar la caché KV y los buffers de activación, por lo que se necesitan del orden de 100-110 GB de VRAM para inferencia en BF16.
- GPU recomendadas: para cubrir los pesos en BF16 se requieren al menos dos A100 de 80 GB, dos H100 de 80 GB o una H200 de 141 GB. No cabe en una única GPU de 80 GB sin paralelismo de tensor.
- GPU de consumo: no cabe en RTX 4090 (24 GB), RTX 3090 (24 GB) ni en GPUs consumer de gama alta, dado que los pesos están en BF16 y no se distribuyen en formato GGUF cuantizado.
- Opciones de despliegue: `transformers` y vLLM según la model card; no se mencionan llama.cpp, Ollama ni TGI, y al no haber pesos GGUF no es desplegable directamente en llama.cpp u Ollama.
- Latencia y throughput: no disponibles. La naturaleza MoE con aproximadamente 3B parámetros activos sugiere un coste por token inferior al de un modelo denso de 35B, pero no hay mediciones publicadas para esta variante.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r110 | 45,8B totales, ~3B activos | no disponible | no disponible | safetensors BF16 desquantizado | 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | ~35B totales, ~3B activos | no disponible | no disponible | safetensors | modelo de referencia |
| Otras variantes cuantizadas de Qwen3.6-35B-A3B | ~35B totales, ~3B activos | no disponible | según variante | GGUF, AWQ, GPTQ, etc. | variable |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación interna (r110): no es una versión estable ni validada para producción.
- Cero descargas y cero likes en el momento de la consulta, lo que implica ausencia de validación comunitaria.
- La cuantización a 2,10 bits de media en los expertos enrutados puede degradar de forma significativa la calidad en tareas que dependan de la capacidad de los expertos, sin que existan benchmarks públicos que lo cuantifiquen.
- Licencia no especificada: la model card remite a la licencia del modelo base sin indicarla, lo que impide confirmar si el uso comercial está permitido.
- Idiomas soportados no documentados.
- Longitud de contexto no documentada.
- Riesgo de alucinación: no medido para esta variante; en cuantizaciones extremas suele aumentar.
- Sesgos: no documentados; heredados presumiblemente del modelo base.
- El tamaño en disco (91,7 GB) sigue siendo elevado pese a la compresión, porque los pesos se almacenan desquantizados en BF16.
- No se distribuyen pesos GGUF, por lo que no es desplegable en llama.cpp u Ollama sin conversión adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r110
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
