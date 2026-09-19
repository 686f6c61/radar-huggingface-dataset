# minjaechoi/qwen36-35b-a3b-2p25bit-r15

## Resumen

Qwen3.6-35B-A3B-2p25bit-r15 es un checkpoint de investigación publicado por el usuario minjaechoi en HuggingFace. Se trata de una versión del modelo Qwen/Qwen3.6-35B-A3B en la que los expertos enrutados (routed experts) de la arquitectura Mixture-of-Experts se almacenan con una precisión media de 2,250 bits, mientras que el resto de los pesos permanece en BF16. El identificador interno del experimento es "r15".

El modelo declara 35.107.181.936 parámetros totales según los tensores safetensors, y la nomenclatura "A3B" del nombre sugiere del orden de 3.000 millones de parámetros activos por token, aunque este dato no se confirma en la documentación proporcionada. Los pesos se guardan ya desquantizados en tensores BF16, de modo que se cargan con `transformers` estándar y con vLLM sin necesidad de kernels de cuantización específicos.

Su relevancia es estrictamente experimental: es un artefacto para estudiar el efecto de la cuantización extrema de expertos enrutados sobre la calidad del modelo, no un modelo destinado a producción. Cuenta con 0 descargas y 0 "likes" en el momento de la consulta, no incluye resultados de benchmarks y la licencia no está especificada más allá de una remisión a la del modelo base. El repositorio ocupa 70,2 GB, coherente con el almacenamiento en BF16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (tag `qwen3_5_moe`), transformer con expertos enrutados |
| Parámetros totales | 35.107.181.936 (≈35,1 B), dato real de safetensors |
| Parámetros activos | no disponible (la nomenclatura "A3B" apunta a ≈3 B, sin confirmación documental) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,250 bits de media; resto de pesos en BF16; tensores servidos desquantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica "License follows the base model", sin texto de licencia del modelo base en la información proporcionada) |
| Formato de pesos | safetensors (BF16) |
| Tamaño del repositorio | 70,2 GB |
| Modalidad | Texto y imagen-texto-texto (tag `image-text-to-text`) |
| Pipeline | text-generation |
| Librería | transformers |

## Arquitectura y entrenamiento

La arquitectura es un transformer con capas Mixture-of-Experts, identificada por el tag `qwen3_5_moe` y derivada de Qwen/Qwen3.6-35B-A3B. La innovación técnica del checkpoint no está en la topología, sino en el esquema de compresión: únicamente los expertos enrutados se almacenan con una media de 2,250 bits por peso, mientras que el resto de los tensores (atención, embeddings, normalizaciones y presumiblemente el router) se mantienen en BF16. Según la model card, los pesos se guardan ya desquantizados en tensores BF16, por lo que no se requieren kernels de decuantización personalizados y el modelo carga con `transformers` y vLLM de serie.

No se proporciona información sobre el proceso de entrenamiento: no hay datos sobre número de tokens, composición del dataset, fases de ajuste (SFT, RLHF, DPO) ni sobre la metodología exacta de cuantización (algoritmo, calibración, granularidad por grupo o por canal). Tampoco se documenta si hubo destilación, recuperación de precisión posterior a la cuantización o ajuste del router. La única referencia disponible es el identificador interno "r15", que sugiere una iteración dentro de una serie de experimentos no publicada.

## Capacidades

- Generación de texto y uso conversacional, según los tags `text-generation` y `conversational`.
- Procesamiento de imagen y texto combinados (tag `image-text-to-text`), lo que implica componentes de visión y capacidad de responder a entradas multimodales. No se detalla el alcance exacto de esta capacidad.
- Razonamiento y generación de código: son capacidades esperables en la familia Qwen sobre la que se basa, pero no se documentan explícitamente para este checkpoint.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; no se declara lista de idiomas.
- Modo de pensamiento (thinking mode), audio u otras capacidades especiales: no disponible.
- Carga directa en vLLM y `transformers` sin kernels adicionales, gracias al almacenamiento desquantizado en BF16.

## Casos de uso

- Investigación sobre cuantización extrema de expertos enrutados: permite medir la degradación de calidad al comprimir solo los expertos a 2,250 bits frente al modelo base en BF16, manteniendo el resto de la red intacta como variable de control.
- Estudios de ablación del router: al conservar el enrutador y las capas densas en BF16, el checkpoint aísla el efecto de la compresión en los expertos, útil para analizar cambios en la distribución de carga entre expertos.
- Línea base para comparativas de precisión mixta: sirve como punto de referencia "2,25 bits" en una matriz de experimentos con otras precisiones (4 bits, 8 bits) sobre el mismo modelo base.
- Evaluación de pipelines multimodales bajo compresión: al declarar `image-text-to-text`, permite comprobar si las tareas de visión-lenguaje se degradan más o menos que las de texto puro cuando solo se comprimen los expertos.
- Validación de infraestructura de servicio: es útil para verificar que el modelo carga y se sirve correctamente en vLLM o `transformers` en nodos de 80 GB antes de desplegar variantes más grandes o más pequeñas.
- Reproducibilidad de checkpoints internos: al ser un checkpoint de investigación con identificador "r15", permite reproducir experimentos de una serie interna y comparar artefactos entre iteraciones.
- Docencia y experimentación académica sobre MoE: su formato BF16 desquantizado facilita inspeccionar los tensores y analizar la estructura de expertos sin herramientas de decuantización.

No se recomienda su uso en producción: no hay benchmarks, no hay licencia clara, no hay validación externa y el modelo tiene cero descargas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: los pesos en BF16 suman aproximadamente 70,2 GB, por lo que se necesita más de esa cifra solo para el modelo. Hay que añadir la caché KV y las activaciones, que dependen de la longitud de contexto y del número de secuencias concurrentes.
- GPU recomendadas: A100 80 GB o H100 80 GB para servicio en una sola GPU con contexto moderado. Para contextos largos o mayor concurrencia, conviene repartir el modelo en varias GPU.
- GPU de consumo: no cabe en una RTX 4090 (24 GB), RTX 5090 (32 GB) ni en ninguna GPU de consumo actual de forma holgada. Sería necesario repartir los pesos entre tres o cuatro GPU de 24 GB, una configuración que no está documentada ni validada por el autor.
- Nota importante sobre memoria: aunque los expertos se almacenen nominally a 2,250 bits, el repositorio ocupa 70,2 GB porque los tensores se sirven en BF16. Por tanto, este checkpoint no reduce el consumo de VRAM frente al modelo base; el ahorro es de almacenamiento conceptual, no de memoria en tiempo de inferencia.
- Opciones de despliegue: `transformers` y vLLM, según indica explícitamente la model card. No se mencionan TGI, SGLang ni TensorRT-LLM. No hay pesos GGUF, por lo que llama.cpp y Ollama no son compatibles con este repositorio tal cual.
- Latencia y throughput estimados: no disponible. Al estar los pesos en BF16, el rendimiento será esencialmente el de un modelo denso de 35 B en memoria, limitado por ancho de banda de memoria más que por cómputo.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Formato de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| minjaechoi/qwen36-35b-a3b-2p25bit-r15 | 35,1 B | no disponible | no disponible | safetensors BF16 | no disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | no disponible en la información aportada | no disponible | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas MoE de tamaño similar (por ejemplo Qwen3-30B-A3B o Mixtral 8x7B) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La única comparación sustentada por los datos aportados es con el propio modelo base Qwen/Qwen3.6-35B-A3B, del que este checkpoint es una derivación cuantizada. No se dispone de cifras verificadas de otras alternativas MoE en la información proporcionada, por lo que no se incluyen valores que no puedan contrastarse.

## Limitaciones y advertencias

- Checkpoint de investigación interna: la propia model card lo califica como "internal research checkpoint", sin validación externa ni resultados publicados.
- Sin benchmarks: no hay ninguna métrica de calidad, latencia o throughput que permita estimar la degradación introducida por la cuantización a 2,250 bits.
- Licencia ambigua: la model card remite a la licencia del modelo base, pero esa licencia no se especifica en la información disponible. Esto supone un riesgo legal para cualquier uso comercial.
- Idiomas no documentados: se desconoce la cobertura multilingüe real y si la cuantización afecta de forma desigual a idiomas distintos del inglés.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos o conversaciones multi-turno extensas.
- Riesgo de alucinación no cuantificado: al no existir evaluaciones, no hay forma de estimar la tasa de alucinación ni su desviación respecto al modelo base.
- Sesgos: no hay información sobre evaluación de sesgos ni sobre los datos de entrenamiento del modelo base.
- Cuantización agresiva: 2,250 bits por peso en los expertos es una precisión muy baja; es esperable cierta pérdida de calidad, especialmente en tareas que dependen de conocimiento factual fino, aunque no hay mediciones que lo confirmen.
- Sin ahorro de VRAM: los pesos se sirven en BF16, así que el requisito de memoria sigue siendo el de un modelo de 35 B.
- Sin soporte GGUF: no se puede ejecutar en llama.cpp ni Ollama con este repositorio.
- Metadatos temporales: la fecha de creación registrada es 2026-09-18, posterior a la fecha habitual de los modelos de la familia; conviene verificar la procedencia del checkpoint antes de reutilizarlo.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/minjaechoi/qwen36-35b-a3b-2p25bit-r15
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B

Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo ni sobre su modelo base; los enlaces obtenidos correspondían a sitios de contenido para adultos y agregadores de enlaces sin relación con el modelo, por lo que se han omitido. No se han encontrado papers, blogs técnicos, repositorios de código ni demos asociados a este checkpoint.
