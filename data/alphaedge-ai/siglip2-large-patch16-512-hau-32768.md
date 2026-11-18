# alphaedge-ai/siglip2-large-patch16-512-hau-32768

## Resumen

SigLIP 2 Large Patch16 512 Hau 32768 es una version podada (*trimmed*) del codificador vision-lenguaje google/siglip2-large-patch16-512, publicada por alphaedge-ai y optimizada especificamente para el idioma hausa. El modelo conserva la arquitectura original de SigLIP 2 (par de torres transformer, una visual y otra textual, entrenadas con perdida sigmoidea) pero reduce el vocabulario del tokenizador de 256.000 a 32.768 tokens, lo que elimina los tokens practicamente inexistentes en hausa y recorta el numero de parametros en un 25,91%.

La relevancia de esta variante es practica: el modelo original pesa 882.313.218 parametros y esta pensado para 109 idiomas, mientras que esta version baja a 653.723.650 parametros y 2,6 GB de repositorio, lo que reduce el consumo de memoria y acelera la inferencia en tareas de clasificacion zero-shot y similitud imagen-texto cuando el dominio linguistico es exclusivamente hausa. No es un modelo generativo: es un codificador de embeddings que produce representaciones conjuntas de imagenes y textos.

El modelo se distribuye bajo licencia Apache 2.0, con pesos en safetensors y compatibilidad con sentence-transformers y con el pipeline de transformers para zero-shot-image-classification. Su utilidad principal es la recuperacion multimodal y el etiquetado de imagenes en hausa, no la conversacion ni la generacion de codigo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SigLIP 2 (par de torres transformer vision-lenguaje, patch16 a 512 px) |
| Parametros totales | 653.723.650 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de embeddings, no generativo) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada; pesos en safetensors |
| Idiomas soportados | hausa (ha) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura SigLIP 2 descrita en el paper arXiv:2502.14786: dos torres transformer independientes, una para imagenes (con parches de 16x16 sobre entradas de 512x512) y otra para texto, alineadas mediante una funcion de perdida sigmoidea en lugar de softmax sobre el lote. Esta variante no reentrena el modelo desde cero: parte de google/siglip2-large-patch16-512 y aplica la tecnica de *trimming* documentada por Hugging Face, que consiste en identificar los tokens del vocabulario mas frecuentes en un corpus del idioma objetivo y descartar el resto, reindexando las matrices de embedding y la capa de salida de texto.

El corpus de minado empleado consta de 200.000 textos del dataset lbourdois/fineweb-2-trimming, orientado a hausa. La reduccion de vocabulario es del 87,20% (de 256.000 a 32.768 tokens) y la reduccion de parametros del 25,91%. No se documentan en la informacion disponible fases adicionales de RLHF, DPO ni ajuste fino supervisado sobre el modelo podado; la model card indica que el modelo podado deberia comportarse de forma similar al original para el idioma seleccionado.

## Capacidades

- Generacion de embeddings de imagen y de texto en un espacio vectorial compartido, aptos para similitud coseno.
- Clasificacion zero-shot de imagenes contra etiquetas candidatas redactadas en hausa.
- Recuperacion imagen-texto y texto-imagen (image retrieval, text retrieval).
- Calculo de matrices de similitud entre lotes de imagenes y lotes de textos.
- Capacidades densas de localizacion y segmentacion heredadas de SigLIP 2 (no verificadas en esta variante podada).
- Soporte multilingue limitado al hausa; el resto de idiomas del modelo original quedan fuera del vocabulario.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni generacion de texto libre, al no ser un modelo generativo.

## Casos de uso

- Etiquetado automatico de catalogos de imagenes en hausa: se pasan las imagenes y una lista de etiquetas candidatas en hausa al pipeline de zero-shot-image-classification y se obtiene la clase mas probable, util para digitalizar archivos fotograficos de medios hausaparlantes.
- Moderacion de contenido visual con taxonomia localizada: definir categorias en hausa y clasificar imagenes subidas por usuarios sin necesidad de traducir previamente al ingles.
- Busqueda semantica multimodal en aplicaciones de comercio electronico: indexar imagenes de producto y consultas textuales en hausa en el mismo espacio de embeddings para recuperacion por similitud.
- Filtrado y deduplicacion de datasets multimodales: calcular embeddings de imagenes y descripciones en hausa para detectar pares duplicados o mal alineados antes de entrenar otros modelos.
- Accesibilidad: generar descripciones alternativas o etiquetas en hausa para imagenes de sitios web, usando la clasificacion zero-shot como paso previo a la redaccion.
- Investigacion linguistica y de vision-lenguaje de bajo recurso: banco de pruebas para medir cuanto degrada el *trimming* de vocabulario el rendimiento de un codificador SigLIP 2 en un idioma africano de bajos recursos.
- Clasificacion de imagenes medicas o agricolas en contextos hausaparlantes: etiquetado rapido de capturas de campo contra categorias definidas manualmente en hausa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo aporta las metricas de compresion (vocabulario y parametros) y no incluye evaluaciones de precision en tareas como ImageNet zero-shot, retrieval o clasificacion en hausa.

## Requisitos de hardware

- VRAM estimada para inferencia en precision completa (fp32): en torno a 2,6 GB para los pesos, mas activaciones; con fp16/bf16 aproximadamente 1,3 GB de pesos.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 en lotes pequenos; A100, H100 o L40S para procesamiento por lotes a gran escala.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080 y RTX 4090, incluso con lotes moderados.
- Opciones de despliegue: transformers (pipeline zero-shot-image-classification), sentence-transformers, y exportacion a ONNX u otros runtimes compatibles con codificadores; no se documenta soporte GGUF ni llama.cpp en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada; dependen del hardware y del tamano de lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / entrada | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| alphaedge-ai/siglip2-large-patch16-512-hau-32768 | 653.723.650 | imagen 512x512, texto variable | hausa | Apache 2.0 | Hugging Face |
| google/siglip2-large-patch16-512 | 882.313.218 | imagen 512x512, texto variable | multilingue (109 idiomas) | Apache 2.0 | Hugging Face |
| google/siglip2-base-patch16-512 | no disponible en la informacion proporcionada | imagen 512x512 | multilingue | Apache 2.0 | Hugging Face |
| openai/clip-vit-large-patch14 | no disponible en la informacion proporcionada | imagen 224x224 | ingles principalmente | MIT | Hugging Face |

La comparativa se limita a la familia SigLIP 2 y a CLIP como referencia historica; no se dispone de datos de rendimiento comparado en benchmarks para esta variante podada.

## Limitaciones y advertencias

- El vocabulario reducido a 32.768 tokens elimina terminos no presentes en hausa; el modelo puede degradarse gravemente en cualquier otro idioma, incluido el ingles.
- Al ser un codificador y no un modelo generativo, no produce texto, codigo ni razonamiento; no debe evaluarse con benchmarks tipo MMLU o HumanEval.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de falsos positivos en clasificacion zero-shot cuando las etiquetas candidatas son linguisticamente ambiguas en hausa.
- No se han publicado evaluaciones cuantitativas que confirmen que el rendimiento en hausa se mantiene respecto al modelo original; la afirmacion de la model card es una expectativa, no un resultado medido.
- El modelo tiene 5 descargas y 0 likes en el momento de la ficha, lo que implica escasa validacion por parte de la comunidad.
- Aunque la licencia es Apache 2.0 y permite uso comercial, conviene verificar la procedencia del corpus de minado (fineweb-2) y las condiciones del modelo base de Google antes de desplegar en produccion.
- No se documentan sesgos especificos; al derivar de un modelo entrenado con datos web multilingues, puede arrastrar sesgos culturales y de representacion presentes en el corpus original.
- No se especifican requisitos de preprocesado de imagen mas alla del redimensionado a 512x512 con parches de 16.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/alphaedge-ai/siglip2-large-patch16-512-hau-32768
- Modelo base: https://huggingface.co/google/siglip2-large-patch16-512
- Paper SigLIP 2: https://arxiv.org/abs/2502.14786
- Blog de introduccion al trimming: https://huggingface.co/blog/lbourdois/introduction-to-trimming
- Dataset de minado: https://huggingface.co/datasets/lbourdois/fineweb-2-trimming
