# ducvh5/looptrans-search3-ckpts

## Resumen

`ducvh5/looptrans-search3-ckpts` es un repositorio de checkpoints de entrenamiento derivados de Wan2.1-T2V-1.3B, el modelo de generación de vídeo a partir de texto desarrollado por Wan-AI (Alibaba). No se trata de un modelo publicado como artefacto de inferencia listo para usar, sino de un conjunto de pesos intermedios generados durante una búsqueda de selección de bloques (*block-selection search*) sobre la arquitectura del modelo base. El autor, `ducvh5`, lo sube explícitamente como respaldo antes de borrar los ficheros de su disco local, para poder restaurarlos en lugar de reentrenarlos.

El contenido sigue un esquema de directorios `to<leg>/<run>/step<k>.pt`, donde cada `run` se identifica por los bloques del transformer seleccionados y la semilla empleada (por ejemplo `m1-14x16_s0` corresponde a los bloques 1-14 y 16 con semilla 0). Junto a los checkpoints se incluyen registros JSON del entrenador (`rung1_<run>.json`) que documentan cada ejecución. El repositorio ocupa 8,7 GB y no incluye model card descriptiva más allá de la nota de layout, ni licencia, ni idiomas declarados.

Su relevancia es limitada para el usuario final: no es un modelo para producción ni para inferencia directa, sino material de investigación reproducible para quien quiera analizar el efecto de la selección de bloques en un modelo de difusión de vídeo. La información técnica disponible sobre el propio repositorio es escasa; los datos de arquitectura y entrenamiento que se detallan a continuación corresponden al modelo base Wan2.1-T2V-1.3B, del que este repositorio es un finetune/derivado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Derivado de Wan2.1-T2V-1.3B (modelo de difusión para texto-a-vídeo); checkpoints de búsqueda de bloques del transformer |
| Parametros totales | 1,3 mil millones (heredados del modelo base Wan2.1-T2V-1.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los checkpoints se distribuyen en formato `.pt` de PyTorch, sin cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pt` (checkpoints de PyTorch) y `.json` (registros del entrenador) |

## Arquitectura y entrenamiento

El repositorio contiene checkpoints de un proceso de búsqueda de selección de bloques sobre Wan2.1-T2V-1.3B, un modelo de difusión texto-a-vídeo de 1.300 millones de parámetros. La nomenclatura `m<block ids>_s<seed>` indica que cada ejecución entrena o evalúa el modelo con un subconjunto concreto de bloques del transformer (por ejemplo, bloques 1 a 14 y 16) y una semilla fija, lo que sugiere un estudio sistemático de qué bloques son prescindibles o críticos para la generación de vídeo. No se especifica en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO.

Tampoco se documentan innovaciones técnicas propias más allá del esquema de búsqueda por bloques. Los ficheros `rung1_<run>.json` parecen ser los registros del entrenador con métricas de cada rung de la búsqueda, pero su contenido no está descrito en la model card. Al ser checkpoints intermedios (`step<k>.pt`), no constituyen un modelo final consolidado ni un artefacto listo para `diffusers` sin conversión previa.

## Capacidades

- Generación de vídeo a partir de texto, heredada del modelo base Wan2.1-T2V-1.3B (capacidad del modelo del que derivan los checkpoints, no verificada en este repositorio).
- Los checkpoints corresponden a variantes con subconjuntos de bloques del transformer, por lo que su capacidad efectiva puede diferir de la del modelo base completo.
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingües ni modos especiales (thinking, visión, audio).
- No se documenta soporte de otras modalidades distintas de texto-a-vídeo.

## Casos de uso

- Reproducción de experimentos de selección de bloques: el repositorio permite restaurar los checkpoints exactos de cada ejecución (`m<block ids>_s<seed>`) para repetir o auditar la búsqueda sin reentrenar desde cero.
- Análisis de ablación de bloques en modelos de difusión de vídeo: comparar los checkpoints de distintas combinaciones de bloques para estudiar qué capas del transformer son críticas para la calidad del vídeo generado.
- Investigación sobre eficiencia de modelos texto-a-vídeo: usar las variantes con bloques podados como base para estudiar compromisos entre calidad y coste computacional.
- Recuperación de estado de entrenamiento: los ficheros `step<k>.pt` permiten reanudar un entrenamiento interrumpido o continuar el fine-tuning desde un punto concreto.
- Docencia y formación: servir como ejemplo práctico de organización de checkpoints y registros (`rung1_<run>.json`) en un pipeline de búsqueda de hiperparámetros estructurales.
- Auditoría de reproducibilidad: los registros JSON y la nomenclatura determinista (bloques + semilla) facilitan verificar resultados de terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para este repositorio; para el modelo base Wan2.1-T2V-1.3B se requiere habitualmente una GPU con al menos 8-12 GB en precisión reducida, aunque este dato no está confirmado en la información proporcionada.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; los checkpoints en `.pt` no son directamente cargables por `diffusers`, vLLM, llama.cpp, Ollama ni TGI sin conversión.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ducvh5/looptrans-search3-ckpts | 1,3 B (base) | no disponible | no disponible | no disponible | Hugging Face (checkpoints) |
| Wan-AI/Wan2.1-T2V-1.3B-Diffusers | 1,3 B | no disponible | no disponible en la información proporcionada | no disponible en la información proporcionada | Hugging Face (modelo base) |
| Otros modelos texto-a-vídeo de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas en la información proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- No es un modelo listo para producción: son checkpoints intermedios de entrenamiento, no un artefacto de inferencia consolidado.
- Ausencia de licencia declarada: no se puede asumir uso comercial permitido; hay que consultar la licencia del modelo base Wan2.1-T2V-1.3B y del autor.
- Ausencia de model card detallada: no hay información sobre dataset, sesgos, idiomas ni evaluación de calidad.
- Riesgo de alucinación y artefactos visuales: inherente a los modelos de difusión texto-a-vídeo, especialmente en variantes con bloques podados.
- Idiomas no declarados: se desconoce si las indicaciones en castellano funcionan correctamente.
- Formato `.pt` no estándar para `diffusers`: requiere conversión y conocimiento del esquema de bloques para su uso.
- Tamaño del repositorio (8,7 GB) y multiplicidad de checkpoints: la descarga completa puede ser costosa y difícil de gestionar.
- Repositorio con 0 descargas y 0 likes: sin validación por parte de la comunidad; tratar con cautela.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/ducvh5/looptrans-search3-ckpts
- Modelo base: https://huggingface.co/Wan-AI/Wan2.1-T2V-1.3B-Diffusers
