# dvader13/smollm3-3b-traj-8p02t

## Resumen

Este repositorio contiene un conjunto de 31 checkpoints intermedios de entrenamiento por refuerzo (RL) del modelo SmolLM3-3B, correspondientes a la primera época de un proceso de ajuste. La base es el modelo SmolLM3-3B preentrenado con 8.02 billones de tokens (rung `8.02T`). Cada checkpoint se guarda en formato bf16 y está pensado exclusivamente para inferencia, no para continuar el entrenamiento. El propósito de este tipo de publicación es permitir el análisis de la trayectoria de aprendizaje: cómo evolucionan las representaciones, la coherencia y las capacidades a lo largo del proceso de RL.

El autor, `dvader13`, ha publicado estos checkpoints con licencia Apache 2.0, lo que facilita su uso académico y de investigación. No se proporciona información adicional sobre el algoritmo de RL concreto (PPO, GRPO, etc.), el conjunto de datos de recompensas ni las métricas de evaluación. La relevancia de este repositorio radica en que ofrece una ventana al comportamiento interno de un modelo de 3 mil millones de parámetros durante el entrenamiento, algo poco común en la comunidad open source.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (SmolLM3-3B) |
| Parametros totales | 3 mil millones (3B) |
| Parametros activos | No aplicable (modelo denso) |
| Longitud de contexto | No disponible en el repo; la base SmolLM3-3B soporta hasta 128K tokens |
| Tipos de cuantizacion | Solo bf16 (sin cuantizacion adicional) |
| Idiomas soportados | No disponible (depende del entrenamiento base) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo subyacente es SmolLM3-3B, un transformer decoder-only denso con 3 mil millones de parámetros. La arquitectura incorpora atención con ventanas de contexto extendidas (128K tokens) y un mecanismo de razonamiento dual que permite alternar entre modos de pensamiento estándar y razonamiento profundo. El entrenamiento base se realizó con 8.02 billones de tokens, lo que proporciona una base sólida de conocimientos lingüísticos y de razonamiento.

Los checkpoints aquí publicados provienen de una etapa de RL (probablemente RLHF o similar). El espaciado entre pasos (steps) aumenta a medida que avanza el entrenamiento: los primeros 20 pasos, luego 40, 80 y 120. Esto permite capturar la evolución temprana y las fases posteriores con menor frecuencia. No se ha especificado el algoritmo de RL utilizado, el dataset de preferencias ni las funciones de recompensa. El formato bf16 facilita la carga en GPUs con menor memoria que fp32, pero no se han aplicado cuantizaciones como int8 o int4.

## Capacidades

- Generación de texto: al ser un checkpoint del modelo base, conserva la capacidad de generar texto coherente en varios idiomas (el base soporta seis idiomas, aunque no se indica cuáles).
- Razonamiento: el modelo base tiene un modo de razonamiento dual; los checkpoints podrían reflejar mejoras o cambios en ese comportamiento.
- Código: SmolLM3-3B está entrenado con una proporción significativa de código, por lo que estos checkpoints también deberían manejar tareas de programación.
- Tool calling: no se confirma en el repo, pero el base lo soporta.
- Multilingüismo: el base soporta seis idiomas, aunque no se listan en el repo.
- Capacidades específicas: al ser checkpoints intermedios, no se garantiza la estabilidad de estas capacidades; pueden variar entre pasos.

## Casos de uso

- Análisis de la dinámica de entrenamiento por RL: investigadores pueden cargar cada checkpoint y medir cómo cambian las métricas (perplejidad, exactitud en tareas, etc.) a lo largo de los pasos, para entender la evolución del aprendizaje.
- Estudio de la estabilidad de representaciones: comparar las activaciones o los embeddings entre checkpoints consecutivos para detectar saltos o colapsos en la representación interna.
- Evaluación de la transferencia de habilidades: probar en tareas de razonamiento o código cada checkpoint para identificar en qué paso se alcanza un rendimiento máximo o se produce un sobreajuste.
- Depuración de pipelines de RL: si se está desarrollando un sistema de RL propio, estos checkpoints sirven como referencia de cómo debería comportarse un modelo intermedio.
- Fine-tuning adicional: aunque los checkpoints son de inferencia, se pueden usar como inicialización para un entrenamiento posterior (si se convierten a formato editable), aunque no es lo recomendado.
- Benchmark de modelos pequeños: comparar el rendimiento de estos checkpoints con otros modelos de 3B como Ministral 3 o Qwen3-3B para evaluar el impacto del RL en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otras métricas. Tampoco hay comparaciones con el modelo base o con otros modelos. Para obtener datos de rendimiento sería necesario ejecutar evaluaciones propias sobre cada checkpoint.

## Requisitos de hardware

- VRAM estimada: cada checkpoint de 3B parámetros en bf16 ocupa aproximadamente 6 GB de memoria (3B × 2 bytes). Para cargar un único checkpoint se necesita al menos 6 GB de VRAM.
- GPUs recomendadas: cualquier GPU con 8 GB o más de VRAM puede ejecutar un checkpoint (por ejemplo, RTX 3070, RTX 4060, A10, etc.). Para ejecutar varios checkpoints simultáneamente se requeriría más VRAM.
- Compatibilidad con GPUs de consumo: sí, un RTX 4090 (24 GB) puede cargar hasta 4 checkpoints a la vez.
- Opciones de despliegue: como son checkpoints de inferencia, se pueden servir con vLLM, llama.cpp, Ollama o TGI, siempre que se cargue un solo checkpoint a la vez. No se recomienda cargar todos los checkpoints en memoria.
- Latencia y throughput: no se proporcionan datos. Para un modelo de 3B en bf16, la latencia típica en una GPU moderna es del orden de decenas de milisegundos por token, pero depende de la implementación y del hardware.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Propósito |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache-2.0 | Modelo base para fine-tuning |
| Ministral 3 (3B) | 3B | no especificado | Apache-2.0 | Modelo denso para aplicaciones de memoria limitada |
| dvader13/smollm3-3b-traj-8p02t | 3B | no disponible (heredado) | Apache-2.0 | Checkpoints intermedios de RL para investigación |

La comparativa directa no es posible porque este repositorio no es un modelo final, sino un conjunto de artefactos de entrenamiento. No hay datos de rendimiento comparativo.

## Limitaciones y advertencias

- No es un modelo de producción: estos checkpoints son intermedios y pueden presentar comportamientos inestables, alucinaciones o fallos de coherencia.
- Sin información de entrenamiento: se desconoce el algoritmo de RL, los datos de recompensa y los hiperparámetros, lo que dificulta la interpretación de los resultados.
- Espaciado de pasos no uniforme: los primeros 200 pasos tienen un espaciado corto, pero luego se espacian, por lo que no se cubren todas las etapas por igual.
- Peso del repositorio: 190.7 GB en total, lo que requiere espacio de almacenamiento significativo si se descargan todos los checkpoints.
- Limitación de idiomas: no se indican los idiomas soportados, aunque el modelo base soporta seis.
- Sin cuantizaciones: solo bf16, lo que puede limitar el despliegue en GPUs de baja memoria.
- Riesgo de sesgos: al ser un modelo base preentrenado, puede heredar sesgos de los datos de entrenamiento originales.

## Enlaces

- Repositorio HuggingFace: [dvader13/smollm3-3b-traj-8p02t](https://huggingface.co/dvader13/smollm3-3b-traj-8p02t)
- Modelo base SmolLM3-3B: [HuggingFaceTB/SmolLM3-3B](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- Modelo base sin fine-tuning: [HuggingFaceTB/SmolLM3-3B-Base](https://huggingface.co/HuggingFaceTB/SmolLM3-3B-Base)
- Paper de Ministral 3 (modelo similar de 3B): [arXiv](https://arxiv.org/html/2601.08584v1)
