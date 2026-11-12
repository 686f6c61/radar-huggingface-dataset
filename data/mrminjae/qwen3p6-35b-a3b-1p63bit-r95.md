# mrminjae/qwen3p6-35b-a3b-1p63bit-r95

## Resumen

Qwen3.6-35B-A3B (r95) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B mediante una cuantización selectiva de los expertos enrutados (routed experts) a una media de 1,63 bits. Se trata de un modelo de arquitectura Mixture-of-Experts (MoE) con 35.107.181.936 parámetros totales, orientado a generación de texto y tareas imagen-texto, según los tags del repositorio (qwen3_5_moe, image-text-to-text).

La particularidad técnica del checkpoint es que solo los expertos enrutados han sido comprimidos a 1,63 bits de media, mientras que el resto de pesos se mantienen en BF16. Los pesos se almacenan ya descomprimidos en tensores BF16, de modo que cargan directamente con transformers estándar o vLLM sin necesidad de kernels de cuantización específicos. El repositorio ocupa 70,2 GB.

Este checkpoint es relevante para investigadores interesados en técnicas de compresión extrema de modelos MoE y en evaluar el impacto de cuantizaciones sub-2-bit sobre los expertos enrutados. No obstante, se trata de un artefacto de investigación interna sin benchmarks publicados, sin licencia declarada explícitamente en el repositorio y sin información sobre idiomas soportados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE), familia Qwen3.5/Qwen3.6 (tag qwen3_5_moe) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3 B activos, dato no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos enrutados a 1,63 bits de media; resto de pesos en BF16; pesos almacenados descomprimidos en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible en el repositorio; la model card indica que sigue la licencia del modelo base (Qwen/Qwen3.6-35B-A3B) |
| Formato de pesos | safetensors (BF16), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es Qwen/Qwen3.6-35B-A3B, un transformer con arquitectura Mixture-of-Experts de la familia Qwen3.5/Qwen3.6, según el tag qwen3_5_moe del repositorio. El checkpoint derivado mantiene la topología del modelo original, pero aplica una cuantización agresiva únicamente a los expertos enrutados, que quedan con una media de 1,63 bits por peso. El resto de componentes (atención, embeddings, capas densas y router) permanece en BF16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO, ya que la model card no los detalla. La innovación técnica destacable es el esquema de compresión selectiva: los pesos se almacenan descomprimidos en BF16, lo que evita dependencias de kernels de cuantización de baja precisión y permite cargar el modelo con transformers estándar o vLLM. El identificador interno "r95" sugiere una iteración de investigación dentro de una serie de experimentos de compresión.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno, según el pipeline declarado (text-generation).
- Procesamiento imagen-texto: el tag image-text-to-text indica soporte de entrada multimodal, aunque no se detallan las capacidades exactas.
- Razonamiento y matemáticas: no disponible información específica en la model card.
- Generación de código: no disponible información específica en la model card.
- Tool calling / function calling: no disponible información específica.
- Soporte de agentes y razonamiento multi-paso: no disponible información específica.
- Capacidades multilingües: no disponible (idiomas no declarados).
- Modo thinking, visión o audio: no disponible información específica más allá del tag image-text-to-text.

## Casos de uso

- Investigación en compresión de modelos MoE: el checkpoint permite estudiar cómo afecta una cuantización media de 1,63 bits en los expertos enrutados a la calidad de las respuestas, comparándolo con el modelo base en BF16.
- Evaluación de robustez de cuantizaciones sub-2-bit: útil para medir degradación en tareas de razonamiento, generación libre y multimodalidad frente al original.
- Despliegue experimental con transformers y vLLM: al almacenarse en BF16 descomprimido, puede cargarse con las herramientas estándar sin kernels personalizados, lo que facilita pruebas de integración en pipelines existentes.
- Análisis de eficiencia memoria-calidad: permite cuantificar el ahorro de almacenamiento (70,2 GB de repositorio) frente a la pérdida de precisión en benchmarks propios.
- Prototipado de asistentes conversacionales con entrada de imagen: el tag image-text-to-text sugiere uso en tareas de descripción o diálogo sobre imágenes, siempre en contexto de investigación.
- Estudio de la interacción entre router y expertos comprimidos: útil para analizar si la selección de expertos se degrada cuando estos operan a muy baja precisión.
- Base para experimentos de destilación o recuperación de precisión: el checkpoint puede servir como punto de partida para técnicas de recuperación de pesos o ajuste fino posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 70,2 GB en safetensors BF16; se requiere al menos esa cantidad de memoria para cargar los pesos completos, más overhead de activaciones y caché KV.
- GPU recomendadas: A100 80 GB o H100 80 GB para carga completa en una sola GPU; configuraciones multi-GPU para mayor margen de contexto.
- GPU de consumo: no cabe en GPUs consumer de 24 GB (RTX 4090) ni de 48 GB en su formato BF16 completo; sería necesario sharding multi-GPU o conversión a formatos de menor precisión no documentados.
- Opciones de despliegue: transformers estándar y vLLM, según indica la model card; no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-1p63bit-r95 | 35,1 B | no disponible | no disponible (sigue la del base) | safetensors BF16 | Expertos enrutados a 1,63 bits de media |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1 B | no disponible | no disponible en la informacion | safetensors | Modelo original sin cuantización selectiva |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación interna ("internal research checkpoint"): no está pensado como modelo de producción y carece de validación publicada.
- Sin benchmarks: no hay datos que cuantifiquen la degradación frente al modelo base, por lo que el impacto de la cuantización a 1,63 bits en los expertos es desconocido.
- Riesgo de alucinación: no evaluado; la compresión extrema de expertos puede agravar comportamientos erráticos en generación.
- Licencia no declarada explícitamente en el repositorio: la model card remite a la licencia del modelo base, que debe verificarse antes de cualquier uso comercial.
- Idiomas no declarados: no se puede garantizar cobertura multilingüe ni calidad en castellano.
- Contexto no documentado: se desconoce la longitud máxima de contexto efectiva tras la cuantización.
- Requisitos de memoria elevados: 70,2 GB en BF16 impiden su uso en GPUs de consumo sin sharding.
- Repositorio sin descargas ni likes en el momento de la consulta: ausencia de validación comunitaria.
- Fecha de creación futura (2026-11-12) en los metadatos: conviene verificar la integridad y procedencia del artefacto.

## Enlaces

- Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-1p63bit-r95
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
