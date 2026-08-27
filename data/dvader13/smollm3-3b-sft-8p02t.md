# dvader13/smollm3-3b-sft-8p02t

## Resumen

Este repositorio contiene diez checkpoints intermedios de supervisión fina (SFT) del modelo base SmolLM3-3B, generados durante un entrenamiento con 8,02 billones de tokens de pretraining. El autor, dvader13, publica las fracciones de dosis del 10% al 100% en formato bf16, permitiendo estudiar la dinámica del ajuste fino y seleccionar el punto óptimo de convergencia según la tarea objetivo. El modelo base pertenece a la familia SmolLM3 de Hugging Face, un transformer de 3.000 millones de parámetros con soporte para razonamiento en dos modos, seis idiomas nativos, llamada a herramientas y una ventana de contexto de 128.000 tokens.

La relevancia de esta publicación radica en que ofrece acceso transparente al proceso de SFT, algo poco habitual en la práctica. Cada checkpoint es un estado completo del modelo, listo para inferencia, lo que permite comparar el comportamiento del modelo en distintas etapas del entrenamiento sin necesidad de reentrenar desde cero. Además, al estar bajo licencia Apache 2.0, puede utilizarse comercialmente sin restricciones significativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (SmolLM3-3B base) |
| Parámetros totales | 3.000 millones (aprox., derivado de SmolLM3-3B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 128.000 tokens (según especificación de SmolLM3-3B) |
| Tipos de cuantización | No disponible (los checkpoints están en bf16) |
| Idiomas soportados | 6 idiomas nativos (según especificación de SmolLM3-3B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura SmolLM3-3B de Hugging Face, un transformer decoder-only denso de 3.000 millones de parámetros. El pretraining de la base se realizó con 8,02 trillones de tokens de texto general, seguido de un proceso de ajuste fino supervisado (SFT) sobre conjuntos de datos de instrucciones curadas, como SmolTalk2, y posterior alineación de preferencias mediante técnicas como APO (Anchored Preference Optimization). Este repositorio contiene los checkpoints intermedios del SFT, publicados en diez fracciones de dosis (del 10% al 100% del entrenamiento) en formato bf16, sin estado de optimizador, únicamente para inferencia.

La publicación de estos checkpoints intermedios es una práctica poco común que facilita el análisis de la curva de aprendizaje durante el ajuste fino. Permite identificar en qué punto el modelo alcanza su mejor rendimiento para una tarea concreta, evitando el sobreajuste o el olvido catastrófico que puede producirse en las fases finales del entrenamiento. Los pesos están almacenados en formato safetensors, lo que garantiza una carga segura y eficiente en memoria.

## Capacidades

- Generación de texto y razonamiento en dos modos (pensamiento directo y pensamiento reflexivo), heredadas de SmolLM3-3B.
- Soporte de llamada a herramientas (tool calling), lo que permite integrar el modelo en flujos de agentes que ejecutan funciones externas.
- Capacidades multilingües en seis idiomas nativos, aunque no se especifican cuáles en la información disponible.
- Razonamiento multi-paso y resolución de problemas complejos gracias a la arquitectura base.
- Generación de código y matemáticas, capacidades inherentes al modelo base SmolLM3.
- Los checkpoints intermedios pueden presentar variaciones en estas capacidades según la fracción de entrenamiento; el checkpoint al 100% debería ser el más cercano al comportamiento final del SFT.

## Casos de uso

- **Investigación sobre dinámica de SFT**: los diez checkpoints permiten a investigadores estudiar cómo evoluciona la capacidad de generalización, la aparición de sesgos y la degradación de habilidades durante el ajuste fino supervisado.
- **Selección de checkpoint óptimo para tareas concretas**: se puede evaluar cada fracción en un conjunto de validación específico y elegir la que mejor se comporte para la tarea objetivo, en lugar de usar el checkpoint final.
- **Despliegue en producción con restricciones de memoria**: al elegir un checkpoint intermedio, se puede reducir el riesgo de sobreajuste y obtener un modelo más robusto para dominios específicos, manteniendo los 3.000 millones de parámetros y la ventana de 128.000 tokens.
- **Fine-tuning adicional**: cada checkpoint puede servir como punto de partida para un ajuste posterior con datos propios, permitiendo una mayor flexibilidad en el proceso de entrenamiento.
- **Evaluación comparativa de estrategias de entrenamiento**: al tener acceso a los estados intermedios, se pueden comparar diferentes estrategias de regularización, tasas de aprendizaje o técnicas de alineación en un mismo punto de entrenamiento.
- **Análisis de alucinación y sesgo**: los checkpoints intermedios permiten identificar en qué fase del SFT aparecen o se mitigan determinados sesgos o tendencias a la alucinación, útil para la investigación de seguridad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Este repositorio no incluye datos de evaluación de los checkpoints, y no se han encontrado resultados de rendimiento específicos para esta variante. Los benchmarks del modelo base SmolLM3-3B (como MMLU, HumanEval o GSM8K) no son directamente aplicables a estos checkpoints intermedios, ya que el comportamiento puede variar según la fracción de entrenamiento.

## Requisitos de hardware

- **VRAM estimada para inferencia**: un checkpoint individual de 3.000 millones de parámetros en bf16 ocupa aproximadamente 6 GB. La inferencia requiere al menos 8 GB de VRAM para una secuencia de longitud moderada, y hasta 16 GB para aprovechar la ventana completa de 128.000 tokens.
- **GPU recomendadas**: tarjetas de consumo como NVIDIA RTX 3090, RTX 4090 o equivalentes con 16 GB de VRAM son suficientes para la mayoría de casos. Para despliegues concurrentes se recomiendan GPU de centro de datos como A100 o H100.
- **Almacenamiento**: el repositorio completo pesa 61,5 GB, por lo que se necesitan al menos 70 GB de espacio en disco para descargar los diez checkpoints. Si se desea solo un checkpoint, se puede descargar individualmente.
- **Opciones de despliegue**: se puede servir con vLLM, llama.cpp, Ollama o Hugging Face TGI, siempre que se seleccione un único checkpoint para cargar en memoria. El formato safetensors es compatible con la mayoría de frameworks.
- **Latencia y throughput**: para un modelo de 3B en una GPU consumer, la latencia de generación suele ser de 20-50 tokens por segundo en bf16, dependiendo de la longitud del contexto y la implementación. No se dispone de datos específicos de este checkpoint.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache 2.0 | Modelo base sin SFT, disponible en Hugging Face |
| SmolLM3-3B-Instruct | 3B | 128K | Apache 2.0 | Versión con SFT y alineación de preferencias completa |
| Este repositorio (dv2h13) | 3B | 128K | Apache 2.0 | Checkpoints intermedios de SFT, no el modelo final |
| Llama 3.2 3B | 3B | 128K | Llama 3.2 Community License | Alternativa comercial de Meta, con SFT y RLHF |

La comparación directa no está disponible porque no se han publicado benchmarks de este checkpoint. La principal diferencia frente a SmolLM3-3B-Instruct es que este repositorio ofrece estados intermedios, mientras que el Instruct es el resultado final del proceso de alineación. Llama 3.2 3B es una alternativa de Meta con licencia más restrictiva (uso comercial sujeto a condiciones).

## Limitaciones y advertencias

- **No es el modelo final**: estos checkpoints son estados intermedios del entrenamiento SFT. El checkpoint al 100% no es necesariamente el mejor para todas las tareas; puede presentar sobreajuste o degradación de ciertas capacidades.
- **Sin estado de optimizador**: los pesos están pensados para inferencia, no para continuar el entrenamiento directamente desde este repositorio.
- **Sin datos de evaluación**: no se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas específicas es desconocido.
- **Sesgos y alucinaciones**: como cualquier modelo de lenguaje, puede presentar sesgos derivados de los datos de entrenamiento y riesgo de alucinación, especialmente en checkpoints con menor entrenamiento.
- **Idiomas y dominio**: la información sobre los seis idiomas soportados no se detalla en el repositorio, por lo que no se puede confirmar la cobertura exacta.
- **Descargas y soporte**: el modelo tiene 0 descargas y 0 likes, lo que indica que no ha sido validado por la comunidad. No hay garantías de mantenimiento o soporte.
- **Uso comercial**: la licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base SmolLM3 para asegurar el cumplimiento de todas las condiciones.

## Enlaces

- [Repositorio del modelo en Hugging Face](https://huggingface.co/dvader13/smollm3-3b-sft-8p02t)
- [Página oficial de SmolLM3-3B](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- [Guía de Supervised Fine-Tuning con SmolLM3](https://huggingface.co/learn/smol-course/unit1/3)
- [Recetas de alineación para SmolLM3 (GitHub)](https://github.com/huggingface/alignment-handbook/blob/main/recipes/smollm3/README.md)
- [Curso de SmolLM3 en GitHub](https://github.com/huggingface/smol-course/blob/main/units/en/unit1/3.md)
