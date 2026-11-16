# hyunlp-evateam3/20261116_prbench_legal_static_qwen3-4b_whole_rubric_s42

## Resumen

Este repositorio contiene un ajuste fino experimental del modelo Qwen3-4B-Instruct-2507, desarrollado por el equipo hyunlp-evateam3, orientado a tareas legales del benchmark PRBench. El modelo se ha entrenado mediante GRPO (Group Relative Policy Optimization) sobre el conjunto de datos ScaleAI/PRBench, empleando una estrategia de evaluación denominada "whole-rubric" en la que un juez local basado en Qwen3-32B puntúa las respuestas completas según una rúbrica. Se trata de un experimento de investigación reproducible, no de un modelo listo para producción.

El entrenamiento parte de pesos frescos del modelo base Qwen3-4B-Instruct-2507 (sin reutilizar estado del experimento previo de finanzas) y se configura con 188 actualizaciones, 32 prompts y 8 respuestas por actualización, con una tasa de aprendizaje de 1e-6. Las 500 tareas legales del benchmark se estratifican por temática en 450 de entrenamiento y 50 de validación con semilla 42. Cada actualización completada se exporta como checkpoint BF16 de solo modelo.

La relevancia de esta ficha es acotada: se trata de un artefacto de investigación con metadatos incompletos (sin licencia declarada, sin idiomas especificados, cero descargas) y sin resultados oficiales de PRBench. Resulta útil como referencia para quienes replican pipelines de RL con GRPO sobre dominios especializados, pero no debe confundirse con un modelo legal validado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4 mil millones (aproximado, segun modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoints exportados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoints BF16 de solo modelo) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3-4B-Instruct-2507, un transformer decoder-only de aproximadamente 4 mil millones de parámetros. Sobre esta base se aplica un ajuste fino con GRPO, un algoritmo de optimización por política que genera múltiples respuestas por prompt y las recompensa comparativamente. En este caso, la recompensa proviene de un juez local Qwen3-32B que evalúa la respuesta completa según una rúbrica ("whole-rubric"), en lugar de usar recompensas por componentes o verificadores programáticos.

La configuración reportada incluye 188 actualizaciones objetivo, con 32 prompts y 8 respuestas por actualización, tasa de aprendizaje de 1e-6 y exportación de checkpoints BF16 tras cada actualización completada. El conjunto de datos ScaleAI/PRBench se divide en 450 tareas de entrenamiento y 50 de validación, estratificadas por temática con semilla 42. La validación se realiza sobre el split reservado al inicio y cada 10 actualizaciones. No se especifican el número total de tokens de entrenamiento, la composición detallada del dataset ni si hubo etapas adicionales de RLHF o DPO más allá del propio GRPO.

## Capacidades

- Generación de texto y razonamiento en el dominio legal, condicionada al ajuste con PRBench.
- Respuesta a tareas legales del benchmark PRBench (450 de entrenamiento, 50 de validación).
- Razonamiento multi-paso implícito en las tareas legales evaluadas por rúbrica.
- Capacidades heredadas del modelo base Qwen3-4B-Instruct-2507 (generación, instrucciones, posible tool calling), aunque no se documentan explícitamente en esta model card.
- Soporte multilingüe: no disponible en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Investigación en RL para dominios especializados: el modelo sirve como referencia reproducible para estudiar cómo GRPO con un juez LLM (Qwen3-32B) afecta al rendimiento en tareas legales, comparando checkpoints intermedios exportados cada actualización.
- Replicación de pipelines de entrenamiento: los archivos experiment.json y data_split_manifest.json permiten reconstruir la configuración y la procedencia de los datos, útil para auditar experimentos de RL.
- Evaluación de estrategias de recompensa: permite comparar la estrategia "whole-rubric" frente a alternativas de recompensa por componentes en tareas de razonamiento legal.
- Estudio de estratificación de datos: la división 450/50 por temática con semilla 42 facilita analizar el efecto de la composición del dataset en el ajuste.
- Base para experimentos de ajuste legal: al partir de Qwen3-4B-Instruct-2507, puede servir como punto de partida para fine-tuning adicional en dominios jurídicos concretos, siempre que se verifique la licencia del modelo base.
- Docencia y formación: útil en cursos de posgrado sobre RLHF/GRPO y evaluación con jueces LLM, dado que el proceso está documentado de forma explícita.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que las recompensas de validación son locales y experimentales, no un resultado oficial del leaderboard de PRBench.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8 GB solo para pesos, más overhead de activaciones y KV cache (no confirmado en la información).
- VRAM estimada en cuantización de 8 bits: alrededor de 4-5 GB; en 4 bits: alrededor de 2.5-3 GB (estimaciones basadas en el tamaño de 4B, no verificadas para este checkpoint).
- GPU recomendadas: no disponible en la información. Por tamaño, cabría en GPUs consumer con al menos 8-12 GB de VRAM en BF16, aunque no se documenta.
- Opciones de despliegue: no disponible en la información. Al ser safetensors BF16, sería compatible con frameworks estándar (vLLM, TGI, transformers) si la arquitectura base lo permite, pero no se confirma.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Este modelo (PRBench Legal Qwen3-4B GRPO) | ~4B | no disponible | no disponible | Hugging Face, 0 descargas |
| Qwen/Qwen3-4B-Instruct-2507 (base) | ~4B | no disponible | no disponible en esta ficha | Hugging Face |
| Alternativas legales de 4B | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para comparar rendimiento con alternativas de la misma categoría. El modelo base Qwen3-4B-Instruct-2507 es el referente directo, pero no se han publicado métricas comparativas en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental: la propia model card lo etiqueta como "experimental"; no ha pasado por un proceso de validación para producción.
- Sin resultados oficiales: las recompensas de validación son locales y no equivalen al leaderboard de PRBench.
- Licencia no declarada: no se especifica licencia, lo que impide confirmar si el uso comercial está permitido. Además, la licencia del modelo base Qwen3-4B-Instruct-2507 debe verificarse por separado.
- Idiomas no especificados: se desconoce si el ajuste conserva el multilingüismo del modelo base o lo degrada hacia el inglés legal.
- Riesgo de alucinación: en dominios legales, las respuestas pueden contener referencias normativas inexactas o inventadas; no debe usarse como asesoramiento jurídico.
- Sesgos: no documentados, pero heredados del dataset PRBench y del juez Qwen3-32B utilizado para la recompensa, que puede introducir sesgos de evaluación.
- Contexto no documentado: se desconoce la longitud de contexto efectiva tras el ajuste.
- Cero descargas y cero likes: sin validación por parte de la comunidad.
- Repositorio de 24.1 GB: incluye múltiples checkpoints BF16, lo que requiere espacio de almacenamiento considerable.

## Enlaces

- Hugging Face: https://huggingface.co/hyunlp-evateam3/20261116_prbench_legal_static_qwen3-4b_whole_rubric_s42
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Dataset: https://huggingface.co/datasets/ScaleAI/PRBench
- Repositorio del autor: https://huggingface.co/hyunlp-evateam3
- Paper o blog de PRBench: no disponible en la información proporcionada.
- Paper de GRPO: no disponible en la información proporcionada.
