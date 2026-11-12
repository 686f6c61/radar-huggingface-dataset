# mrminjae/qwen3p6-35b-a3b-1p83bit-r94

## Resumen

Qwen3p6-35B-A3B-1p83bit-r94 es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B de Alibaba Qwen. Se trata de una cuantización selectiva: únicamente los expertos enrutados (routed experts) del componente MoE se almacenan con una precisión media de 1,83 bits, mientras que el resto de los pesos (atención, embeddings, capas densas, router) permanecen en BF16. El resultado es un modelo de 35.107.181.936 parámetros totales con un repositorio de 70,2 GB.

La relevancia de esta ficha es acotada: no es un modelo nuevo ni un fine-tuning, sino una compresión agresiva de un modelo existente que se distribuye con los pesos ya desquantizados en tensores BF16. Es decir, el ahorro de precisión se aplicó en el artefacto almacenado, pero el fichero final que descarga el usuario vuelve a ocupar el espacio de un modelo BF16 de 35B parámetros. El identificador interno "r94" y la etiqueta "internal research checkpoint" indican que se trata de un experimento de laboratorio sin garantías de estabilidad ni de calidad de salida.

El modelo hereda la arquitectura MoE del Qwen3.6-35B-A3B (concretamente el tipo `qwen3_5_moe` según los tags), su pipeline multimodal image-text-to-text y la compatibilidad con endpoints. No obstante, el autor no documenta evaluación alguna, no publica curvas de degradación por la cuantización ni especifica la licencia, remitiendo a la del modelo base. Para un desarrollador que evalúe modelos, esta ficha debe leerse como una advertencia: la cuantización a 1,83 bits de los expertos enrutados es una técnica extrema cuyo impacto en calidad no está cuantificado en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (tipo `qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 1,83 bits de media; resto de pesos en BF16. Pesos distribuidos desquantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la licencia del modelo base Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors (carga con transformers y vLLM estándar) |

## Arquitectura y entrenamiento

El modelo es una derivación del Qwen3.6-35B-A3B, un transformer con mezcla de expertos (MoE) y capacidad multimodal de entrada imagen-texto. La intervención del autor no consiste en un entrenamiento nuevo, sino en una cuantización post-entrenamiento selectiva: los expertos enrutados se comprimen a una media de 1,83 bits, mientras que el resto de los pesos (atención, embeddings, capas densas y router) se mantienen en BF16. Según la model card, los pesos se almacenan ya desquantizados en tensores BF16, de modo que la carga se realiza con transformers o vLLM sin kernels especiales.

No se dispone de información sobre el número de tokens de entrenamiento del modelo base, la composición del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se documenta la metodología exacta de cuantización (si fue GPTQ, AWQ, una variante de cuantización de bloques con escalas por grupo, o una técnica propietaria), ni el tamaño de bloque, ni el esquema de escalas. La única innovación declarada es el nivel de compresión aplicado a los expertos enrutados, que en un MoE son la mayor parte de los parámetros pero solo una fracción de los activos por token, lo que en teoría permite reducir el almacenamiento con un impacto acotado en el coste de cómputo por token.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.6-35B-A3B.
- Procesamiento multimodal image-text-to-text: acepta imágenes junto con texto según el pipeline declarado.
- Razonamiento y matemáticas: capacidades presumibles del modelo base, no verificadas en este checkpoint.
- Generación de código: presumible del modelo base, sin evaluación publicada para esta cuantización.
- Tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas; los idiomas del checkpoint no están listados.
- Modo thinking o razonamiento extendido: no documentado.

## Casos de uso

- Investigación sobre cuantización extrema de MoE: el checkpoint sirve para estudiar cómo afecta una compresión media de 1,83 bits en los expertos enrutados a la perplejidad y a las capacidades downstream, comparándolo con el modelo base en BF16.
- Evaluación de pipelines de carga estándar: al distribuirse desquantizado en BF16, permite comprobar que transformers y vLLM cargan el artefacto sin modificaciones, útil para validar tooling de despliegue.
- Pruebas de regresión de calidad: un equipo que planee cuantizar sus propios MoE puede usar este checkpoint como referencia de "peor caso" y medir la degradación frente al original.
- Experimentos académicos de eficiencia de memoria: aunque el fichero final ocupa 70,2 GB, el estudio del esquema de compresión de expertos informa sobre técnicas de reducción de almacenamiento en modelos de 35B parámetros.
- Prototipado de aplicaciones multimodales en entornos de investigación: el pipeline image-text-to-text permite probar flujos de descripción de imágenes o respuesta visual, siempre con validación manual por la falta de benchmarks.
- Docencia y divulgación: como ejemplo práctico de cuantización selectiva en arquitecturas MoE, ilustrando la diferencia entre parámetros totales y activos y el efecto de comprimir solo los expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al distribuirse los pesos en BF16, el modelo requiere aproximadamente 70 GB solo para pesos, más overhead de activaciones y caché KV. Con 35B parámetros en BF16, se necesitan del orden de 80-100 GB de VRAM para inferencia cómoda.
- GPU recomendadas: H100 80 GB, A100 80 GB, o configuraciones multi-GPU (2x A100 40 GB, 2x RTX 4090 24 GB con tensor parallelism).
- GPU consumer: no cabe en una sola RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) en BF16. Sería necesario recurrir a cuantización adicional del checkpoint ya distribuido, lo que anula el propósito del artefacto.
- Opciones de despliegue: transformers y vLLM según la model card; llama.cpp y Ollama no están documentados para este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3p6-35B-A3B-1p83bit-r94 | 35,1B totales (activos no disponibles) | no disponible | no disponible (hereda la del base) | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35B (activos no disponibles) | no disponible | la del modelo Qwen original | Hugging Face, modelo oficial |
| Alternativas MoE de tamano similar | no disponible | no disponible | no disponible | no disponible |

La comparación directa más relevante es con el modelo base Qwen/Qwen3.6-35B-A3B, del que este checkpoint es una cuantización. No se dispone de datos de rendimiento de ninguno de los dos en la información proporcionada, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Checkpoint de investigación interna: el autor lo etiqueta explícitamente como "internal research checkpoint", sin garantías de estabilidad, soporte ni calidad.
- Sin benchmarks: no hay ninguna evaluación publicada que cuantifique la degradación introducida por la cuantización a 1,83 bits de los expertos enrutados.
- Licencia ambigua: la model card indica que "la licencia sigue la del modelo base", pero no se especifica cuál es; verificar la licencia de Qwen/Qwen3.6-35B-A3B antes de cualquier uso comercial.
- Sin datos de idiomas: no se listan los idiomas soportados, lo que impide garantizar cobertura multilingüe.
- Riesgo de alucinación: no evaluado para este checkpoint; la compresión extrema de expertos puede amplificar errores en dominios de conocimiento específico.
- Tamaño del repositorio: 70,2 GB en BF16 desquantizado, lo que no aporta ahorro de almacenamiento frente al modelo base y complica el despliegue en hardware limitado.
- Cero tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusión que permitan validar su comportamiento.
- Sin documentación de tool calling, agentes ni modo thinking: no se puede asumir que estas capacidades del base se preserven tras la cuantización.
- Fecha de creación futura (2026-11-12): metadato atípico que conviene verificar antes de confiar en la procedencia del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-1p83bit-r94
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
