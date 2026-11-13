# mrminjae/qwen3p6-35b-a3b-2p10bit-r148

## Resumen

Qwen3.6-35B-A3B 2.10-bit (r148) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B mediante una cuantización selectiva de los expertos enrutados de su arquitectura Mixture-of-Experts (MoE). El modelo conserva los 35.107.181.936 parámetros del original, pero almacena los pesos de los expertos a una media de 2,10 bits por parámetro, mientras que el resto de componentes (atención, embeddings, router, capas densas) permanece en BF16. Los pesos se guardan de forma descuantizada en tensores BF16, de modo que cargan con `transformers` estándar y con vLLM sin necesidad de kernels personalizados.

La relevancia de esta variante radica en su enfoque de cuantización híbrida: en lugar de aplicar una cuantización uniforme de baja precisión a todo el modelo, se concentra la compresión en los expertos, que son la mayor parte del cómputo y de los parámetros. Esto permite reducir el tamaño del repositorio hasta 70,2 GB frente a los aproximadamente 70 GB que ocuparía el BF16 completo, manteniendo intactas las capas críticas para la estabilidad numérica.

Se trata de un checkpoint interno de investigación, sin model card detallada, sin licencia declarada explícitamente y sin resultados de benchmarks publicados. Su interés es principalmente experimental: sirve para estudiar el impacto de la cuantización extrema en modelos MoE y para evaluar la viabilidad de desplegar modelos de 35B con requisitos de memoria reducidos en infraestructura estándar. La etiqueta `image-text-to-text` en los tags sugiere capacidades multimodales heredadas del modelo base, aunque no se documentan en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), tag `qwen3_5_moe`; transformer con expertos enrutados |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible (el modelo base es A3B, pero no se detalla el número exacto de parámetros activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados descuantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors (BF16 descuantizado) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen/Qwen3.6-35B-A3B, un transformer con arquitectura Mixture-of-Experts identificado en Hugging Face con el tag `qwen3_5_moe`. La intervención de mrminjae consiste en cuantizar únicamente los pesos de los expertos enrutados a una media de 2,10 bits por parámetro, dejando el resto de la red (atención, embeddings, router y capas no expertas) en BF16. Los pesos resultantes se almacenan descuantizados en tensores BF16, por lo que el checkpoint no requiere kernels de cuantización especiales: se carga con `transformers` estándar o con vLLM.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) ni sobre el procedimiento exacto de cuantización empleado (algoritmo, calibración, granularidad por grupo o por canal). La model card se limita a indicar el identificador interno r148 y que la licencia sigue la del modelo base. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o modos de razonamiento explícito.

## Capacidades

- Generación de texto conversacional, según el pipeline declarado `text-generation` y la etiqueta `conversational`.
- Procesamiento de imagen y texto (`image-text-to-text`), capacidad heredada del modelo base según los tags, aunque no se detalla en la model card.
- Razonamiento y conocimiento general: presumiblemente heredados del modelo base Qwen3.6-35B-A3B, sin datos verificables en la información disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se declaran idiomas soportados.
- Modo thinking, visión o audio: no disponible; solo se infiere visión por el tag `image-text-to-text`.

## Casos de uso

- Investigación sobre cuantización extrema en MoE: el checkpoint permite medir la degradación de calidad al comprimir los expertos a 2,10 bits frente al modelo base en BF16, comparando perplejidad y precisión en tareas de generación.
- Despliegue con memoria reducida en GPUs de 80 GB: con un repositorio de 70,2 GB en BF16 descuantizado, el modelo puede cargarse en una A100 o H100 de 80 GB, algo imposible para un modelo denso de 35B en BF16 con margen para el KV cache.
- Evaluación de pipelines de inferencia estándar: al cargar con `transformers` y vLLM sin kernels personalizados, sirve para validar que los flujos de producción existentes aceptan checkpoints cuantizados descuantizados sin cambios en el código.
- Generación de texto conversacional en entornos de laboratorio: útil para prototipar asistentes conversacionales donde el coste de memoria es el factor limitante y se acepta una posible pérdida de calidad frente al BF16.
- Experimentos multimodales controlados: el tag `image-text-to-text` permite probar tareas de descripción de imágenes o respuesta a preguntas visuales, siempre que se valide empíricamente que la capacidad se conserva tras la cuantización.
- Benchmarking de robustez numérica: comparar las salidas del checkpoint r148 con las del modelo base para cuantificar el efecto de la cuantización en tareas de razonamiento, matemáticas y código.
- Base para futuras cuantizaciones más agresivas: el enfoque de mantener el router y la atención en BF16 puede servir de referencia para estudiar variantes a 1,5 o 2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 70,2 GB en safetensors BF16; se necesita al menos esa cantidad más el KV cache y overhead del runtime. En la práctica, una GPU de 80 GB es el mínimo razonable.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 141 GB. En GPUs de 48 GB (L40S, RTX A6000) no cabe el checkpoint completo sin offloading.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) sin técnicas de offloading a CPU o disco, que degradarían gravemente la latencia.
- Opciones de despliegue: `transformers` estándar y vLLM, según indica la model card. No se confirma compatibilidad con llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al mantener los pesos en BF16, el rendimiento de cómputo debería aproximarse al del modelo base, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r148 | 35,1B totales (MoE) | no disponible | Expertos a 2,10 bits, resto BF16 | no disponible (sigue la del base) | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1B totales (MoE) | no disponible | BF16 | la del modelo base Qwen | Hugging Face |
| Otras cuantizaciones del mismo base | 35,1B totales | no disponible | GPTQ, AWQ, GGUF (no confirmadas) | según autor | no disponible en la información proporcionada |

No se dispone de datos de rendimiento ni de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Checkpoint de investigación interna (r148) sin model card completa: no se documentan datos de entrenamiento, evaluación ni procedencia del proceso de cuantización.
- Licencia no declarada explícitamente: la model card remite a la licencia del modelo base Qwen/Qwen3.6-35B-A3B, que debe verificarse antes de cualquier uso comercial.
- Cuantización extrema a 2,10 bits en los expertos: es esperable una degradación de calidad frente al BF16, pero no se han publicado mediciones que la cuantifiquen.
- Sin resultados de benchmarks: no hay evidencia publicada sobre MMLU, HumanEval, GSM8K ni tareas multimodales.
- Idiomas no declarados: no se puede garantizar un rendimiento multilingüe adecuado.
- Riesgo de alucinación: inherente a los modelos generativos y potencialmente amplificado por la cuantización de baja precisión; no evaluado.
- Sesgos: no documentados; se heredan del modelo base, sin análisis disponible.
- Contexto máximo no disponible: impide planificar despliegues con ventanas largas.
- 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes de terceros.
- Requiere 80 GB de VRAM para carga completa: no apto para GPUs de consumo sin offloading.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r148
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
