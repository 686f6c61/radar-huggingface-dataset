# mrminjae/qwen3p6-35b-a3b-2p03bit-r106

## Resumen

Qwen3p6-35B-A3B-2p03bit-r106 es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face. Se trata de una versión cuantizada del modelo base Qwen/Qwen3.6-35B-A3B, un modelo de arquitectura MoE (mixture of experts) de la familia Qwen3.6 orientado a generación de texto e imagen-texto-a-texto. La particularidad de esta variante es que aplica una cuantización selectiva: los expertos enrutados se almacenan a una media de 2,03 bits, mientras que el resto de los pesos permanecen en BF16.

El modelo no es un lanzamiento oficial de Alibaba/Qwen, sino una modificación comunitaria con identificador interno "r106" y tan solo unas horas de antigüedad en el momento de la consulta (creado y actualizado el 13 de noviembre de 2026). No cuenta con descargas ni likes, y la model card es extremadamente escueta: no documenta licencia propia (remite a la del modelo base), idiomas soportados, datos de entrenamiento ni resultados de benchmarks.

Su relevancia es limitada pero técnica: demuestra una técnica de cuantización híbrida que reduce drásticamente el espacio ocupado por los expertos (los pesos con mayor volumen en un MoE) sin tocar el resto de la red, y publica los pesos ya de-cuantizados en tensores BF16 para que carguen con `transformers` y vLLM estándar sin necesidad de kernels personalizados. El repositorio ocupa 70,2 GB y declara 35.107.181.936 parámetros totales según safetensors.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) basada en Qwen3.6, tag `qwen3_5_moe`; transformer con expertos enrutados |
| Parámetros totales | 35.107.181.936 (~35,1 B) |
| Parámetros activos | no disponible (el modelo base es A3B, lo que sugiere ~3 B activos, pero no se confirma en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización selectiva: expertos enrutados a una media de 2,03 bits; resto de pesos en BF16. Pesos almacenados de-cuantizados en tensores BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base, Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors (compatible con `transformers` y vLLM estándar) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.6-35B-A3B, un transformer con mezcla de expertos (MoE) etiquetado con el tag `qwen3_5_moe`. La modificación introducida por mrminjae no altera la topología de la red: se limita a aplicar una cuantización post-entrenamiento sobre los pesos de los expertos enrutados, que quedan representados a una media de 2,03 bits, mientras que el resto de los pesos (atención, embeddings, capas densas, routers, etc.) se mantienen en BF16.

La innovación técnica destacable es el enfoque de almacenamiento: aunque los expertos se cuantizan a ~2 bits, los pesos se publican ya de-cuantizados en tensores BF16, de modo que el checkpoint carga con `transformers` y vLLM sin kernels especializados ni dependencias adicionales. El coste es que el repositorio no se beneficia de la reducción de tamaño en disco (70,2 GB), pero se gana en portabilidad de despliegue. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineamiento; tampoco se documenta el proceso exacto de calibración de la cuantización.

## Capacidades

- Generación de texto conversacional y de propósito general, heredada del modelo base Qwen3.6-35B-A3B.
- Procesamiento imagen-texto-a-texto (tag `image-text-to-text`), lo que implica capacidades multimodales de entrada visual.
- Razonamiento multi-paso y conversación multi-turno (tags `conversational` y `text-generation`).
- Compatibilidad con endpoints (`endpoints_compatible`), lo que facilita el despliegue como servicio.
- No se documentan explícitamente capacidades de tool calling, function calling, agentes, modo thinking ni soporte de audio en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Investigación en cuantización extrema de MoE: el checkpoint sirve para estudiar el impacto de comprimir los expertos enrutados a ~2 bits manteniendo el resto en BF16, comparando calidad frente al modelo base sin cuantizar en tareas de generación.
- Despliegue en entornos con `transformers` o vLLM estándar: al publicarse los pesos en BF16, puede cargarse sin parches ni kernels personalizados, lo que simplifica la integración en pipelines existentes de inferencia.
- Evaluación de modelos multimodales en investigación: el tag `image-text-to-text` permite emplearlo en experimentos de descripción de imágenes o respuesta a preguntas visuales, siempre que se valide su calidad frente al base.
- Generación de texto conversacional en prototipos: adecuado para entornos de desarrollo donde se quiere probar un modelo de ~35 B con arquitectura MoE antes de comprometerse con el modelo base completo.
- Reproducibilidad de experimentos de compresión: al ser un checkpoint "r106" con identificador interno, puede usarse para replicar resultados de una línea de investigación concreta sobre cuantización selectiva.
- Base para futuros fine-tunes comunitarios: al mantener la topología del modelo original, puede servir como punto de partida para ajustes posteriores, aunque su naturaleza de checkpoint de investigación y la ausencia de licencia clara lo hacen poco recomendable para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 70,2 GB en safetensors, lo que implica que la carga completa en BF16 requiere al menos ~70 GB de VRAM o memoria unificada.
- GPU recomendadas para carga completa: A100 80 GB, H100 80 GB, o configuraciones multi-GPU (por ejemplo, 2× A100 40 GB o 2× RTX 4090 24 GB con tensor parallelism).
- GPU de consumo: no cabe en una sola RTX 4090 (24 GB) ni en una RTX 3090 (24 GB) en BF16; sería necesario sharding multi-GPU o una cuantización adicional en el momento de la carga.
- Opciones de despliegue: `transformers` y vLLM estándar, según indica la model card; no se confirma soporte para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Qwen3p6-35B-A3B-2p03bit-r106 (este) | ~35,1 B totales | no disponible | no disponible (hereda del base) | Hugging Face, 0 descargas | Checkpoint de investigación, cuantización selectiva de expertos a ~2,03 bits |
| Qwen/Qwen3.6-35B-A3B (base) | ~35,1 B totales | no disponible | no disponible en la información | Hugging Face (oficial) | Modelo original sin cuantizar; referencia de calidad |
| Alternativas de ~30-35 B MoE | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación sin model card detallada: no documenta licencia propia, idiomas, datos de entrenamiento ni evaluación de calidad.
- La cuantización a ~2,03 bits en los expertos puede degradar la calidad frente al modelo base; no se aportan métricas que lo cuantifiquen.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado por la falta de evaluación publicada.
- Licencia no disponible: la model card remite a la del modelo base, pero no se especifica cuál es ni si permite uso comercial; verificar antes de cualquier despliegue en producción.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento adecuado en castellano u otros idiomas.
- Longitud de contexto no disponible, lo que impide planificar casos de uso con ventanas largas.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso real.
- El hecho de almacenar los pesos de-cuantizados en BF16 anula la ventaja de tamaño en disco de la cuantización a 2 bits; el ahorro solo se materializa si se re-cuantiza en el momento de la carga.
- No se confirma soporte de tool calling, agentes ni modo thinking, por lo que no debe asumirse para pipelines agénticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p03bit-r106
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
