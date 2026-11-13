# mrminjae/qwen3p6-35b-a3b-2p10bit-r103

## Resumen

Qwen3p6-35B-A3B-2p10bit-r103 es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una cuantización selectiva de los expertos enrutados del modelo original: dichos expertos se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) permanecen en BF16. Los pesos se guardan ya dequantizados en tensores BF16, de modo que cargan directamente con `transformers` o vLLM sin necesidad de kernels de cuantización especiales.

El modelo conserva la arquitectura del base: un transformer con mezcla de expertos (MoE) de 35.107.181.936 parámetros totales según los safetensors del repositorio, con la etiqueta `qwen3_5_moe` y soporte de pipeline image-text-to-text, lo que implica capacidades multimodales heredadas del modelo original. La relevancia de esta ficha radica en documentar una técnica de compresión agresiva (2,10 bits en expertos) que reduce el peso en disco del repositorio a 70,2 GB manteniendo compatibilidad con el stack estándar de inferencia.

Es importante señalar que se trata de un checkpoint interno de investigación (Internal ID r103), con 0 descargas y 0 likes en el momento de la consulta, sin model card detallada más allá de una tabla mínima. No se dispone de información sobre licencia específica, idiomas soportados ni resultados de evaluación. La licencia se hereda del modelo base según indica el autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tag `qwen3_5_moe` |
| Parámetros totales | 35.107.181.936 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Expertos enrutados a 2,10 bits de media; resto de pesos en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Heredada del modelo base (Qwen/Qwen3.6-35B-A3B); no especificada en el repo |
| Formato de pesos | safetensors (BF16 dequantizado) |
| Biblioteca | transformers |
| Pipeline | text-generation (con soporte image-text-to-text) |
| Tamaño del repositorio | 70,2 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| ID interno | r103 |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo Qwen3.6-35B-A3B: un transformer con mezcla de expertos (MoE) que, según el recuento de safetensors, suma 35.107.181.936 parámetros totales. El repositorio incluye la etiqueta de pipeline image-text-to-text, lo que indica que el modelo base incorpora un codificador visual y capacidad de procesamiento de imágenes junto con texto. No se dispone de información detallada sobre el número de expertos, la dimensión oculta, el número de capas ni el mecanismo de enrutamiento del modelo base en la información proporcionada.

El proceso de creación de este checkpoint consiste en una cuantización selectiva: los pesos de los expertos enrutados se comprimen a una precisión media de 2,10 bits, mientras que el resto de componentes (atención, embeddings, router, capas densas) se conservan en BF16. Los pesos se almacenan posteriormente dequantizados en tensores BF16, lo que significa que el ahorro se produce en el almacenamiento en disco (70,2 GB frente al tamaño del base en BF16), no necesariamente en la huella de VRAM durante la inferencia, que será la de un modelo BF16 equivalente una vez cargado. No se han publicado detalles sobre el dataset de entrenamiento, el proceso de alineación (RLHF/DPO) ni innovaciones técnicas adicionales.

## Capacidades

- Generación de texto conversacional y text-generation, según el pipeline declarado.
- Procesamiento image-text-to-text: capacidad multimodal heredada del modelo base, con entrada de imágenes y texto.
- Razonamiento y respuesta a instrucciones: presumiblemente heredado del base Qwen3.6-35B-A3B, aunque no se documenta explícitamente en el repo.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre cuantización extrema de MoE: el checkpoint sirve como material de estudio para analizar el impacto de comprimir expertos enrutados a 2,10 bits manteniendo el resto en BF16, comparando calidad frente al base sin cuantizar.
- Despliegue en entornos con almacenamiento limitado: al ocupar 70,2 GB y cargar con `transformers` o vLLM estándar, permite servir el modelo en nodos donde el base en BF16 no cabría en disco, a costa de la VRAM equivalente a BF16 tras la dequantización.
- Evaluación de pipelines multimodales: al declarar image-text-to-text, puede integrarse en flujos de descripción de imágenes, VQA o extracción de información de documentos, siempre que se valide la degradación introducida por la cuantización.
- Reproducción de experimentos académicos: útil para investigadores que necesiten replicar resultados con un modelo de 35B en hardware de una sola máquina con suficiente VRAM, evitando descargar el base completo.
- Prototipado de asistentes conversacionales: el pipeline text-generation permite montar demos de chat multi-turno con `transformers`, aunque la falta de datos de contexto limita la planificación.
- Base para futuras cuantizaciones: el checkpoint puede servir como punto de partida para técnicas de compresión adicionales o para comparar estrategias de cuantización selectiva por capas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al almacenarse los pesos dequantizados en BF16, la carga en memoria requiere aproximadamente el equivalente a 35.107 millones de parámetros en BF16, es decir, del orden de 70 GB de VRAM solo para pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: no hay datos del autor; por tamaño, se necesitan GPUs con 80 GB o más (A100 80GB, H100 80GB) o configuraciones multi-GPU para servir el modelo en BF16.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB (RTX 4090) ni de 48 GB en configuración BF16 estándar; requeriría sharding multi-GPU o reconvertir los pesos a un formato cuantizado en tiempo de carga.
- Opciones de despliegue: `transformers` y vLLM (según el autor), ya que los pesos cargan con el stack estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Cuantización | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3p6-35B-A3B-2p10bit-r103 | 35,1B | Expertos 2,10 bits, resto BF16 (pesos dequantizados) | no disponible | Heredada del base | Hugging Face, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1B | BF16 | no disponible | No disponible en esta ficha | Hugging Face |
| Alternativas de 30-40B MoE | no disponible | — | — | — | — |

No se dispone de datos de benchmarks ni de especificaciones completas del modelo base para establecer una comparación cuantitativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Checkpoint de investigación interna (Internal ID r103), sin validación pública, 0 descargas y 0 likes: no hay evidencia de calidad ni de reproducibilidad.
- Cuantización agresiva a 2,10 bits en expertos: cabe esperar degradación de calidad frente al base, no cuantificada en la información disponible.
- Aunque los pesos se almacenen dequantizados en BF16, la huella en VRAM tras la carga es la de un modelo BF16, por lo que el ahorro es fundamentalmente de disco.
- Licencia no especificada en el repo; el autor indica que sigue la del modelo base, pero no se detalla en la información proporcionada. Verificar antes de cualquier uso comercial.
- Idiomas soportados no declarados: riesgo de comportamiento deficiente fuera del inglés o chino sin validación previa.
- Riesgo de alucinación inherente a los modelos generativos; no se han publicado evaluaciones específicas.
- Sin datos sobre sesgos conocidos, contexto máximo ni capacidades de tool calling: no apto para producción sin evaluación propia.
- Fecha de creación futura respecto a la consulta (2026-11-13), lo que sugiere que puede tratarse de un artefacto de investigación no consolidado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r103
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
