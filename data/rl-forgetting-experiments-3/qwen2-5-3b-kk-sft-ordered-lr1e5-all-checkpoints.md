# RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-ordered-lr1e5-all-checkpoints

## Resumen

Este repositorio no es un modelo destinado a producción, sino un artefacto de investigación que agrupa diez checkpoints completos de un ajuste supervisado (SFT) sobre el modelo base Qwen2.5-3B. Lo publica el usuario RL-Forgetting-Experiments-3 y su nombre (`qwen2.5-3b-kk-sft-ordered-lr1e5-all-checkpoints`) indica una tasa de aprendizaje de 1e-5 y una ordenación concreta del flujo de datos de entrenamiento ("ordered"). Los checkpoints corresponden a los pasos 318, 635, 952, 1270, 1588, 1905, 2222, 2540, 2858 y 3175, y cada directorio `checkpoints/step_N/` es cargable directamente con la librería transformers.

El propósito declarado en la model card es el análisis de pérdida ("loss-analysis") y, por el nombre del autor y los artefactos asociados (`qwen2.5-3b-math-kk-sft-artifacts`), el estudio del olvido catastrófico durante el ajuste supervisado. Se trata, por tanto, de material pensado para reproducir y auditar la evolución del entrenamiento paso a paso, no para desplegarse como asistente final.

La relevancia es metodológica: permite comparar el comportamiento del modelo en diez puntos intermedios del mismo run de SFT y correlacionar la pérdida con el olvido de capacidades previas del modelo base. El repo ocupa 123,4 GB, coherente con almacenar diez copias íntegras de un modelo de aproximadamente 3 000 millones de parámetros. No registra descargas ni "likes", y su licencia es Apache 2.0, heredada del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen2.5), heredada del modelo base Qwen2.5-3B |
| Parámetros totales | ~3 000 millones (modelo base Qwen2.5-3B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible para este fine-tune (el modelo base Qwen2.5-3B soporta 32 768 tokens nativos según la documentación de Qwen) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (cargable con transformers) |

Otros datos del repositorio: tamaño de 123,4 GB, creado el 2026-09-26 y actualizado el 2026-09-26, pipeline no disponible, 0 descargas y 0 "likes".

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen2.5-3B, un transformer decoder-only denso de aproximadamente 3 000 millones de parámetros. Esta ficha no dispone de detalles propios del fine-tune sobre número de capas, dimensión oculta, cabezas de atención, vocabulario o uso de atención con query/key/value agrupadas (GQA); esos datos deben consultarse en la documentación oficial del modelo base. El ajuste no introduce cambios estructurales: se trata de un SFT estándar que produce pesos completos en cada checkpoint.

El entrenamiento se realizó con SFT y una tasa de aprendizaje de 1e-5, según el nombre del repositorio. La model card indica que se conservan diez checkpoints (pasos 318 a 3175) y que tanto el entrenamiento como la evaluación ya estaban completados en el momento de la publicación. Los resultados de evaluación por checkpoint están publicados aparte en el repositorio de datasets `RL-Forgetting-Experiments-3/qwen2.5-3b-math-kk-sft-artifacts`, bajo la ruta `runs/kk_ordered/eval`. No se detalla en la información proporcionada la composición del dataset, el número de tokens de entrenamiento, ni si hubo fases de RLHF o DPO posteriores; el sufijo "kk" y la referencia a "math" en los artefactos asociados no se explican en la model card y no deben interpretarse sin confirmación.

## Capacidades

- Generación de texto y modelado de lenguaje general, heredados del modelo base Qwen2.5-3B.
- Capacidad de razonamiento y matemáticas potencialmente reforzada por el SFT, dado que los artefactos asociados hacen referencia a tareas de matemáticas ("math"); sin confirmación explícita en la model card.
- Ejecución de inferencia estándar mediante transformers, cargando cada checkpoint de forma individual.
- No se documenta soporte de tool calling ni de function calling en la información disponible.
- No se documenta soporte de agentes ni de razonamiento multi-paso en la información disponible.
- Capacidades multilingües: no disponibles (los idiomas soportados no se especifican).
- No se documentan capacidades especiales como modo "thinking", visión o audio.

## Casos de uso

- Investigación sobre olvido catastrófico: comparar las diez instantáneas (pasos 318 a 3175) para medir cómo evoluciona la pérdida en tareas del modelo base frente al avance del entrenamiento, aislando el punto en que se degradan capacidades previas.
- Análisis de dinámica de entrenamiento: usar los checkpoints intermedios como serie temporal para estudiar la curva de pérdida y su relación con la tasa de aprendizaje de 1e-5 empleada.
- Estudios de curriculum learning: el nombre "ordered" sugiere una ordenación concreta del flujo de datos; estos checkpoints permiten replicar y auditar ese esquema frente a variantes desordenadas.
- Evaluación de checkpoints intermedios frente al final: determinar si el checkpoint del paso 3175 es realmente el mejor o si un punto anterior conserva más capacidades del modelo base, usando los resultados de evaluación publicados en el dataset de artefactos.
- Punto de partida para fine-tuning adicional: tomar uno o varios checkpoints como inicialización para experimentos posteriores de ajuste y comparar su comportamiento frente a partir del Qwen2.5-3B original.
- Reproducibilidad y auditoría de experimentos: al ser pesos completos cargables con transformers, permiten a terceros reproducir exactamente las condiciones de evaluación reportadas.
- Docencia y divulgación técnica: ilustrar con un caso real cómo se guardan y comparan checkpoints en un pipeline de SFT y cómo se publican los artefactos de evaluación por separado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente remite a los resultados de evaluación por checkpoint alojados en el repositorio de datasets `RL-Forgetting-Experiments-3/qwen2.5-3b-math-kk-sft-artifacts`, sin cifras concretas en el material proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: en precisión completa (FP32) en torno a 12 GB; en FP16/BF16 alrededor de 6 GB; en cuantización INT8 aproximadamente 3-4 GB; en INT4 aproximadamente 2-3 GB. Son estimaciones derivadas del tamaño de ~3 000 millones de parámetros, no cifras publicadas por el autor.
- GPU recomendadas: para FP16/BF16 basta una GPU con 8-12 GB (por ejemplo RTX 3060 12 GB, RTX 4070, RTX 4080); para FP32 conviene una GPU con 16-24 GB (RTX 4090, A5000, L4). Para servir en producción con lotes grandes son adecuadas A100 o H100.
- Cabe en GPU de consumo: sí, en cuantización INT4 o INT8 cabe en GPU con 8 GB o más; en FP16 cabe en GPU con 12 GB o más.
- Opciones de despliegue: transformers (nativo, ya que los pesos son safetensors), vLLM y TGI para servicio de alto rendimiento, llama.cpp y Ollama si se generan versiones GGUF (no incluidas en el repositorio).
- Almacenamiento: el repositorio completo ocupa 123,4 GB por contener diez checkpoints íntegros; para usar una sola instantánea basta con descargar el directorio `checkpoints/step_N/` correspondiente.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Naturaleza |
|---|---|---|---|---|
| Este repositorio (Qwen2.5-3B SFT, 10 checkpoints) | ~3 000 M | no disponible (base: 32 768) | apache-2.0 | Artefacto de investigación |
| Qwen/Qwen2.5-3B (base) | ~3 000 M | 32 768 (según documentación oficial) | apache-2.0 | Modelo base |
| Otros fine-tunes de Qwen2.5-3B | ~3 000 M | variable según el ajuste | variable | Modelo ajustado |

No se dispone de información suficiente para comparar el rendimiento (benchmarks) de este repositorio con alternativas, ya que no se han publicado cifras en el material proporcionado. La comparación útil se limita al modelo base y a otros ajustes de la misma familia, atendiendo a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo para producción: se trata de un repositorio de checkpoints de investigación orientado al análisis de pérdida y olvido, sin pipeline de inferencia declarado ni evaluación de calidad orientada a usuario final.
- Sesgos conocidos: no disponibles; no se documenta ninguna evaluación de sesgo, toxicidad o alineación.
- Riesgo de alucinación: no evaluado en la información disponible; el SFT sobre tareas de matemáticas puede no corregir el comportamiento generativo general del modelo base.
- Limitaciones de contexto e idioma: los idiomas soportados y la longitud de contexto efectiva de este fine-tune no están documentados; solo se conoce la del modelo base (32 768 tokens).
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero cualquier uso derivado debe respetar asimismo la licencia del modelo base Qwen2.5-3B y no hay garantía del autor sobre el comportamiento del ajuste.
- Ambigüedad del identificador: el sufijo "kk" y la referencia a "math" en los artefactos asociados no se explican en la model card; conviene confirmar con el autor antes de asumir el dominio o el idioma del ajuste.
- Reproducibilidad parcial: los datos de evaluación están en un repositorio de datasets separado, no incluidos en esta ficha.
- Fecha de publicación inusual (2026-09-26): puede indicar un experimento planificado o un error de metadatos; conviene verificarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/RL-Forgetting-Experiments-3/qwen2.5-3b-kk-sft-ordered-lr1e5-all-checkpoints
- Dataset de artefactos y evaluación por checkpoint: https://huggingface.co/datasets/RL-Forgetting-Experiments-3/qwen2.5-3b-math-kk-sft-artifacts/tree/main/runs/kk_ordered/eval
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B

Nota: los resultados de la búsqueda web proporcionada (Rocket League, Le Républicain Lorrain, Discord Rocket League France, entre otros) no guardan relación con este modelo y se han descartado por no ser fuentes pertinentes.
