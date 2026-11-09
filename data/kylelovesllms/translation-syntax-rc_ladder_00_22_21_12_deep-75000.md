# kylelovesllms/translation-syntax-rc_ladder_00_22_21_12_deep-75000

## Resumen

Este repositorio contiene una colección de checkpoints de investigación entrenados desde cero con la arquitectura GPT-2, publicados por el usuario kylelovesllms como respaldo de los experimentos del proyecto tbd-syntax. No se trata de un modelo único listo para producción, sino de un artefacto de investigación que agrupa diez ejecuciones independientes de un experimento denominado `exp_rc_ladder_train_00_22_21_12_deep`, cada una con su propio checkpoint en formato Hugging Face (config.json, model.safetensors y tokenizer).

Las ejecuciones varían en profundidad y semilla: cinco configuraciones de 10 capas y cinco de 8 capas, todas con 8 cabezas de atención y dimensión de modelo de 256, con semillas que van de la 42 a la 46. El objetivo aparente del proyecto es estudiar el comportamiento de modelos pequeños en una tarea de traducción y sintaxis (por el nombre del dataset de entrenamiento, `english_zapanese_rc_ladder`), probablemente relacionada con relative clauses o estructuras sintácticas jerárquicas entre inglés y japonés.

El interés de este repositorio es fundamentalmente académico: sirve para reproducir y analizar curvas de entrenamiento, evaluaciones y análisis por paso, no como un modelo de uso general. No hay model card en sentido tradicional, ni información sobre licencia, idiomas o rendimiento final, por lo que cualquier evaluación de capacidades debe hacerse a partir de los artefactos incluidos (metrics.csv, evals/ y analysis/).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 |
| Parámetros totales | no disponible (depende de la ejecución; configuraciones de 8 y 10 capas, 8 cabezas, d_model 256) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantización posible vía herramientas externas, no documentada) |
| Idiomas soportados | no disponible (el dataset de entrenamiento se denomina english_zapanese, pero no se documenta el soporte final) |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoints en formato Hugging Face) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con la configuración clásica de GPT-2, pero con variantes reducidas: 8 u 10 capas, 8 cabezas de atención y dimensión de modelo de 256. Cada ejecución se identifica con el patrón `gpt2-{capas}l8h256d-s{semilla}`, con semillas 42 a 46 para cada profundidad. Los checkpoints se guardan por paso (`checkpoints/stepNNNNNN/`), lo que permite analizar la evolución del entrenamiento paso a paso.

El entrenamiento se realizó sobre el dataset `kylelovesllms/english_zapanese_rc_ladder_train_00_22_21_12-filled`, orientado a una tarea de traducción y sintaxis con estructuras de cláusulas relativas (rc ladder) entre inglés y japonés. No se documenta el número de tokens, la composición exacta del dataset, ni si hubo fases de RLHF o DPO; por el tamaño y la naturaleza del proyecto, es previsible que el entrenamiento sea supervisado desde cero. El repositorio incluye `run_config.json`, `metrics.csv`, `evals/` y `analysis/` por ejecución, que son la fuente principal para reconstruir los detalles del entrenamiento. El estado del optimizador (`resume/`) no se ha subido.

## Capacidades

- Generación de texto autoregresiva con arquitectura GPT-2, limitada por el tamaño reducido del modelo.
- Entrenamiento y evaluación orientados a traducción inglés-japonés en el dominio específico del dataset `english_zapanese_rc_ladder`.
- Modelado de estructuras sintácticas con cláusulas relativas (rc ladder), presumiblemente para estudiar generalización composicional.
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente ni de razonamiento multi-paso.
- Soporte multilingüe no documentado; el dataset sugiere inglés y japonés, pero no se especifica el alcance.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Reproducción de experimentos académicos: el repositorio permite reproducir las diez ejecuciones (8 y 10 capas, semillas 42-46) y comparar curvas de entrenamiento a partir de `metrics.csv` y los checkpoints por paso.
- Estudio de generalización sintáctica: los checkpoints intermedios permiten analizar cómo evoluciona la capacidad del modelo para manejar cláusulas relativas en inglés y japonés a lo largo del entrenamiento.
- Análisis de sensibilidad a la semilla: al incluir cinco semillas por configuración, se puede medir la varianza entre ejecuciones en las métricas de evaluación.
- Investigación sobre modelos pequeños: sirve como base para estudiar los límites de capacidad de transformers de 8-10 capas y 256 dimensiones en tareas de traducción restringida.
- Docencia y formación: útil como ejemplo práctico de entrenamiento desde cero, gestión de checkpoints y evaluación por pasos en un proyecto real.
- Desarrollo de pipelines de evaluación: los directorios `evals/` y `analysis/` pueden reutilizarse como plantilla para evaluar modelos pequeños en tareas de traducción y sintaxis.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio incluye `metrics.csv`, `evals/` y `analysis/` por ejecución, pero no se han proporcionado los valores numéricos en la información accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: muy baja, dado el tamaño reducido (8-10 capas, d_model 256); probablemente por debajo de 1 GB en fp32 para un único checkpoint, aunque no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090) es más que suficiente; también es viable en CPU.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: transformers (carga directa del checkpoint en formato HF), llama.cpp u Ollama si se convierte a GGUF, y vLLM/TGI para servir, aunque el tamaño no justifica infraestructura dedicada.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (GPT-2 8-10 capas, d_model 256) | no disponible (reducido) | no disponible | no disponible | no disponible | Hugging Face |
| GPT-2 small (OpenAI) | 124M | 1024 | benchmarks públicos | MIT | Hugging Face |
| DistilGPT-2 | 82M | 1024 | benchmarks públicos | Apache 2.0 | Hugging Face |
| Modelos de traducción especializados (p. ej. MarianMT) | variable | variable | benchmarks públicos | variable | Hugging Face |

La comparación es aproximada: este repositorio no es un modelo de propósito general, sino un conjunto de checkpoints de investigación con configuración reducida y sin benchmarks publicados. No se dispone de datos para comparar rendimiento de forma rigurosa.

## Limitaciones y advertencias

- No hay model card formal: faltan datos de licencia, idiomas, contexto y uso previsto, lo que impide garantizar condiciones de uso comercial.
- El modelo es de tamaño reducido y está entrenado en un dominio muy específico (traducción inglés-japonés con cláusulas relativas), por lo que su rendimiento fuera de ese dominio será limitado.
- Riesgo elevado de alucinación y de generar texto incoherente en tareas abiertas, dado el tamaño y la especialización del entrenamiento.
- No se documentan sesgos conocidos; al entrenarse sobre un dataset concreto, puede heredar sesgos de ese corpus.
- Los checkpoints están pensados para investigación; no se recomienda su uso en producción sin una evaluación exhaustiva previa.
- El estado del optimizador (`resume/`) no está incluido, lo que dificulta reanudar el entrenamiento exactamente desde el punto guardado.
- La fecha de creación indicada (2026-11-09) y el nombre del proyecto sugieren un contexto de investigación en curso; la información puede cambiar.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kylelovesllms/translation-syntax-rc_ladder_00_22_21_12_deep-75000
- Dataset de entrenamiento: https://huggingface.co/datasets/kylelovesllms/english_zapanese_rc_ladder_train_00_22_21_12-filled
- Repositorio del proyecto tbd-syntax: https://github.com/Ky-Ng/tbd-syntax/tree/backup/2026-11-08-working-tree/src/training/exp_rc_ladder_train_00_22_21_12_deep
