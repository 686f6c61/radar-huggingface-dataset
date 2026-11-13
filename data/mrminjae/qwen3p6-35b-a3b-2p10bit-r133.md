# mrminjae/qwen3p6-35b-a3b-2p10bit-r133

## Resumen

Qwen3.6-35B-A3B 2.10-bit (r133) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una cuantización selectiva: únicamente los expertos enrutados del modelo MoE se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, router, capas densas) permanece en BF16. Los pesos se guardan de forma desquantizada en tensores BF16, de modo que el modelo carga con `transformers` y vLLM estándar sin necesidad de kernels personalizados.

El modelo conserva la arquitectura del original: un transformer de tipo mixture-of-experts con 35.107.181.936 parámetros totales y una fracción activa por token (denominada A3B en el nombre, lo que sugiere aproximadamente 3 mil millones de parámetros activos, aunque este dato no se confirma en la información disponible). El pipeline declarado es text-generation, pero los tags incluyen image-text-to-text, lo que apunta a capacidades multimodales heredadas del modelo base.

Su relevancia es doble: por un lado, explora los límites prácticos de la cuantización extrema (2 bits) sobre los expertos de un MoE, una técnica que reduce drásticamente el espacio en disco y el ancho de banda de memoria frente al BF16; por otro, lo hace manteniendo la compatibilidad con el stack estándar de inferencia. No obstante, se trata de un checkpoint interno de investigación, sin métricas publicadas ni garantías de calidad, por lo que debe evaluarse con cautela antes de cualquier uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer mixture-of-experts (tag `qwen3_5_moe`); expertos enrutados cuantizados a 2,10 bits de media, resto de pesos en BF16 |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible (el nombre "A3B" sugiere ~3B activos, sin confirmar) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Cuantización selectiva de expertos a 2,10 bits de media; pesos almacenados desquantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card indica que sigue la licencia del modelo base) |
| Formato de pesos | safetensors (BF16 desquantizado) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen/Qwen3.6-35B-A3B, un transformer con mezcla de expertos. La innovación técnica reside en el esquema de compresión: solo los expertos enrutados se cuantizan, con una precisión media de 2,10 bits, mientras que el resto de componentes (atención, capas densas, router, embeddings) se mantienen en BF16. Los pesos resultantes se almacenan desquantizados en tensores BF16, lo que implica que el ahorro se produce en el artefacto distribuido (70,2 GB de repositorio) pero no necesariamente en la VRAM en tiempo de ejecución, ya que al cargarse se materializan en BF16.

No se dispone de información sobre el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO) ni sobre la metodología exacta de cuantización empleada (algoritmo, calibración, tratamiento de outliers). La model card únicamente identifica el checkpoint como "internal research checkpoint" con ID interno r133. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto y conversación multi-turno, según el pipeline declarado (text-generation) y el tag conversational.
- Procesamiento de imagen y texto (image-text-to-text), según los tags del repositorio, heredado presumiblemente del modelo base.
- Razonamiento y matemáticas: no confirmado explícitamente en la información disponible.
- Generación de código: no confirmado explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Investigación sobre cuantización extrema en MoE: el checkpoint permite estudiar el impacto de comprimir los expertos enrutados a 2,10 bits sobre la calidad de generación, comparando contra el modelo base en BF16 con el mismo prompt set.
- Evaluación de compatibilidad con el stack estándar: al cargar con `transformers` y vLLM sin kernels personalizados, sirve para validar pipelines de despliegue que asumen pesos BF16 convencionales.
- Experimentación académica con modelos de 35B en hardware limitado en disco: el repositorio de 70,2 GB facilita la distribución y el almacenamiento frente a un checkpoint BF16 completo, útil en entornos con cuotas de almacenamiento restrictivas.
- Pruebas de regresión de calidad: comparar las salidas del checkpoint cuantizado con las del modelo base para detectar degradaciones en tareas concretas (resumen, extracción de información, diálogo).
- Prototipado de asistentes conversacionales multimodales: los tags image-text-to-text permiten explorar flujos de imagen y texto en fase de prototipo, siempre con validación adicional.
- Benchmarking de latencia y throughput: medir el rendimiento real de un MoE de 35B con expertos comprimidos en GPUs de gama alta, para decidir si el ahorro de almacenamiento compensa en el despliegue.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta. Al almacenarse los pesos desquantizados en BF16, la carga en memoria se aproxima a la de un modelo de 35B en BF16 (del orden de 70 GB solo para pesos), salvo que el runtime aplique descompresión bajo demanda.
- GPU recomendadas: no confirmadas. Por tamaño, un modelo de 35B en BF16 requiere GPUs con 80 GB (A100, H100) o múltiples GPUs de menor capacidad.
- Cabe en consumer GPU: no disponible; un modelo de este tamaño en BF16 no cabe en una única GPU de consumo (RTX 4090 con 24 GB) sin técnicas adicionales de offloading o cuantización en runtime.
- Opciones de despliegue: `transformers` y vLLM, según la model card.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r133 | 35.107.181.936 | no disponible | no disponible | safetensors (BF16 desquantizado) | Checkpoint de investigación con expertos a 2,10 bits |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35.107.181.936 (presumiblemente) | no disponible | no disponible en esta ficha | safetensors | Referencia de calidad sin cuantización de expertos |
| Otras cuantizaciones del mismo base (GGUF, AWQ, etc.) | no disponible | no disponible | no disponible | no disponible | No se han identificado en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación interna: el autor lo etiqueta explícitamente como "internal research checkpoint", sin garantías de calidad ni soporte.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la degradación introducida por la cuantización a 2,10 bits en los expertos.
- Licencia no disponible: la model card indica que sigue la licencia del modelo base, pero esta no se detalla; verificar antes de cualquier uso comercial.
- Idiomas no declarados: no se puede confirmar el soporte multilingüe ni el rendimiento por idioma.
- Contexto no documentado: se desconoce la longitud máxima de contexto efectiva.
- Riesgo de alucinación: inherente a los modelos generativos y potencialmente agravado por la compresión extrema de los expertos; requiere evaluación empírica.
- Sesgos: no documentados; se heredan presumiblemente los del modelo base, sin información adicional.
- Almacenamiento desquantizado: aunque el repositorio ocupa 70,2 GB, la carga en BF16 puede requerir memoria equivalente a la del modelo sin comprimir, lo que limita el ahorro en VRAM.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni reportes de uso.
- Fecha de creación futura en los metadatos (2026-11-13): inconsistencia que conviene verificar antes de confiar en el artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r133
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
