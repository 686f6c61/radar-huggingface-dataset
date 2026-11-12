# mrminjae/qwen3p6-35b-a3b-2p02bit-r90

## Resumen

Qwen3.6-35B-A3B-2p02bit-r90 es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B mediante una cuantización selectiva a 2,02 bits de media aplicada exclusivamente a los expertos enrutados (routed experts) de su arquitectura Mixture-of-Experts (MoE). El resto de pesos del modelo se mantiene en BF16. El checkpoint se distribuye con los pesos ya descomprimidos en tensores BF16, de modo que carga directamente con transformers o vLLM estándar sin necesidad de kernels de cuantización especiales.

El modelo hereda la arquitectura Qwen3.5 MoE del modelo base, con 35.107.181.936 parámetros totales según los safetensors del repositorio, y está orientado a generación de texto y a tareas image-text-to-text, según los tags del repositorio. Su relevancia radica en que demuestra una técnica de compresión agresiva sobre los parámetros que más pesan en un MoE (los expertos) manteniendo el resto en alta precisión, lo que reduce el tamaño del repositorio hasta 70,2 GB frente a lo que ocuparía el modelo completo en BF16.

Se trata de un checkpoint interno de investigación, sin model card detallada, sin datos de benchmarks publicados y sin información sobre licencia, idiomas o composición del entrenamiento más allá de lo indicado. Cualquier uso en producción debería tratarse con cautela y validarse empíricamente antes de adoptarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE), tag `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,02 bits de media; resto de pesos en BF16; pesos almacenados descomprimidos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors (carga con transformers y vLLM estándar) |

## Arquitectura y entrenamiento

El modelo es un derivado del Qwen3.6-35B-A3B, un transformer con arquitectura Mixture-of-Experts identificada por el tag `qwen3_5_moe`. La intervención realizada por el autor consiste en cuantizar a una media de 2,02 bits únicamente los pesos de los expertos enrutados, dejando el resto de la red (atención, embeddings, capas densas, routers, normalizaciones) en BF16. Los pesos resultantes se almacenan ya descomprimidos en tensores BF16, lo que significa que el checkpoint no requiere kernels de cuantización de bajo nivel en tiempo de inferencia: se carga como un modelo BF16 convencional.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo fases de RLHF, DPO u otras técnicas de alineación. Tampoco se documenta en la información proporcionada ninguna innovación adicional como decodificación especulativa, atención lineal o modos de razonamiento extendido. El identificador interno del checkpoint es "r90", sin más contexto sobre la metodología de cuantización empleada (algoritmo, calibración, granularidad por grupo o por canal).

## Capacidades

- Generación de texto conversacional, según el pipeline `text-generation` y los tags `conversational` y `text-generation`.
- Procesamiento image-text-to-text, según el tag del repositorio, lo que sugiere capacidades multimodales heredadas del modelo base.
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita su despliegue en infraestructuras de inferencia estándar.
- Carga directa con transformers y vLLM sin kernels especiales, al estar los pesos almacenados en BF16.
- Las capacidades concretas de razonamiento, código, matemáticas, tool calling, agentes o multilingüismo no están documentadas en la información disponible y deben validarse empíricamente.

## Casos de uso

- Investigación en cuantización de MoE: el checkpoint sirve como referencia para estudiar el impacto de comprimir expertos enrutados a ~2 bits manteniendo el resto en BF16, comparando su comportamiento con el modelo base completo.
- Evaluación comparativa de fidelidad: permite medir la degradación (o ausencia de ella) en tareas de generación de texto frente a Qwen3.6-35B-A3B, al compartir arquitectura y pesos no expertos.
- Despliegue en entornos con restricciones de almacenamiento: con 70,2 GB de repositorio, es más manejable que un checkpoint BF16 completo del mismo modelo, lo que facilita su distribución en clústeres internos.
- Prototipado de pipelines multimodales image-text-to-text, aprovechando el tag del repositorio para experimentar con entrada de imagen y texto.
- Integración en servicios compatibles con endpoints, usando transformers o vLLM como backend estándar sin adaptaciones de kernel.
- Base para experimentos de ajuste fino posterior (fine-tuning) sobre un modelo parcialmente comprimido, evaluando si la cuantización de expertos afecta al aprendizaje de nuevas tareas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud, el repositorio ocupa 70,2 GB en safetensors BF16, por lo que la carga completa requiere al menos esa cantidad de memoria más el overhead de activaciones y contexto.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un despliegue completo en BF16 encajaría en GPUs de 80 GB (A100 80 GB, H100 80 GB) o en configuraciones multi-GPU.
- Viabilidad en GPU de consumo: no confirmada. Un modelo de 35 B en BF16 no cabe en GPUs consumer de 24 GB (RTX 4090) sin técnicas adicionales de offloading o cuantización en tiempo de ejecución, que no están documentadas para este checkpoint.
- Opciones de despliegue: transformers y vLLM, según la model card. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p02bit-r90 | 35,1 B | no disponible | no disponible (sigue la del base) | safetensors BF16 con expertos a 2,02 bits | Checkpoint de investigación, sin benchmarks |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1 B | no disponible | no disponible en esta ficha | safetensors | Modelo original sin compresión de expertos |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificados en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación interno: no es un lanzamiento oficial de Qwen y no cuenta con model card detallada ni garantías de calidad.
- Sin benchmarks publicados: no hay evidencia empírica del impacto de la cuantización a 2,02 bits en los expertos sobre la calidad de las respuestas.
- Licencia no disponible de forma explícita: la model card remite a la licencia del modelo base, pero no se detalla en la información proporcionada, lo que introduce incertidumbre para uso comercial.
- Idiomas no documentados: no se puede confirmar el soporte multilingüe real del checkpoint.
- Contexto no documentado: se desconoce la longitud máxima de contexto soportada.
- Riesgo de alucinación y sesgos: no evaluados para este checkpoint; se heredan los del modelo base, que tampoco están documentados aquí.
- Distribución con pesos descomprimidos: aunque simplifica la carga, el repositorio de 70,2 GB no aprovecha las ventajas de tamaño de una cuantización real en disco, por lo que el ahorro solo se materializa si el autor aplica la compresión en el almacenamiento.
- Sin métricas de latencia ni throughput: difícil estimar costes de producción sin pruebas propias.
- Uso en producción desaconsejado sin validación previa: al tratarse de un experimento, conviene evaluar en el dominio objetivo antes de adoptarlo.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p02bit-r90
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
