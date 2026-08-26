# dvader13/olmo2-1b-sft-s1-2664b

## Resumen

El modelo `dvader13/olmo2-1b-sft-s1-2664b` es un conjunto de checkpoints de fine-tuning supervisado (SFT) sobre el modelo base OLMo-2-1B, desarrollado por el usuario dvader13. Se trata de un modelo de lenguaje autoregresivo denso de 1B de parámetros, perteneciente a la familia OLMo 2 del Allen Institute for AI (Ai2). El objetivo de este repositorio es proporcionar 10 checkpoints intermedios del proceso de SFT, correspondientes a distintas fracciones de dosis de entrenamiento (del 10% al 100%), para facilitar el estudio del efecto de la cantidad de datos de fine-tuning en el rendimiento del modelo.

El modelo base fue preentrenado en una etapa de pretraining con 2664 mil millones de tokens (2664B), según la descripción del repositorio. Los checkpoints se publican en formato bf16, solo para inferencia, sin estado de optimizador. La relevancia de este modelo radica en su carácter de recurso de investigación abierto, que permite analizar la dinámica del fine-tuning y comparar la evolución del rendimiento a lo largo de las etapas de entrenamiento.

El repositorio tiene un tamaño de 29,7 GB, coherente con los 10 checkpoints de un modelo de 1B en bf16. No se especifican idiomas soportados ni pipeline concreto, y la licencia es Apache 2.0, lo que permite uso comercial con atribución.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso autoregresivo (familia OLMo 2) |
| Parametros totales | 1B (según el nombre del modelo) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (los checkpoints se proporcionan en bf16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base OLMo-2-1B es un transformer denso autoregresivo, parte de la familia OLMo 2 presentada en el paper técnico de Ai2. Según la descripción del repositorio, el pretraining se realizó en una etapa denominada `stage1-step1270000-tokens2664B`, es decir, con 2,664 millones de tokens. Sobre este base se aplicó un proceso de SFT (supervised fine-tuning) y se guardaron 10 checkpoints intermedios, correspondientes a fracciones de dosis del 10% al 100% (`checkpoint_pct010` a `checkpoint_pct100`). Estos checkpoints se proporcionan en formato bf16 y están destinados únicamente a inferencia, sin incluir el estado del optimizador.

No se dispone de detalles adicionales sobre el conjunto de datos de SFT ni sobre el método de entrenamiento específico. El repositorio no menciona técnicas como RLHF o DPO, por lo que se asume que solo se realizó SFT clásico.

## Capacidades

- Generación de texto y respuesta a preguntas, como modelo de lenguaje general.
- Razonamiento básico y comprensión del lenguaje, heredados del modelo base OLMo-2-1B.
- Capacidad de ejecutar tareas de código y matemáticas, si bien no se ha evaluado específicamente en este repositorio.
- No se indica soporte para tool calling, function calling, agentes o capacidades multimodales.
- Capacidades multilingües no documentadas en la información proporcionada.
- No se menciona un modo de razonamiento especial (thinking mode) ni procesamiento de audio o visión.

## Casos de uso

- Investigación académica sobre el efecto de la cantidad de datos de SFT en el rendimiento de modelos de lenguaje. Los checkpoints permiten comparar la evolución de métricas a medida que aumenta la dosis de fine-tuning.
- Análisis de la dinámica de entrenamiento: se puede estudiar cómo cambia la representación interna del modelo en diferentes etapas de SFT, útil para entender la transferencia de conocimiento.
- Experimentación con estrategias de early stopping: al tener checkpoints parciales, se puede determinar el punto óptimo de parada del entrenamiento supervisado.
- Evaluación de la robustez y sesgos en distintas fases de fine-tuning, para detectar cuándo aparecen ciertos comportamientos.
- Desarrollo de técnicas de regularización o adaptación de modelos: los checkpoints sirven como referencia para comparar con otros métodos de entrenamiento.
- Reproducción de experimentos científicos: permite a otros investigadores replicar estudios sobre SFT con un modelo abierto y trazable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para este modelo. El repositorio no incluye métricas de evaluación, y la búsqueda web no proporciona datos de rendimiento específicos para los checkpoints SFT.

## Requisitos de hardware

- Los checkpoints están en bf16, por lo que cada checkpoint ocupa aproximadamente 2 GB (para un modelo de 1B con 2 bytes por parámetro). El repositorio completo ocupa 29,7 GB.
- Para inferencia de un solo checkpoint, se requiere aproximadamente 2-3 GB de VRAM en bf16, lo que cabe en GPUs de consumo como RTX 3060 (12 GB) o RTX 4090 (24 GB) sin problemas.
- Para ejecutar los 10 checkpoints secuencialmente, se puede cargar cada uno por separado, por lo que la VRAM necesaria no supera la de un solo checkpoint.
- Opciones de despliegue: se puede usar el framework de Hugging Face Transformers, vLLM, llama.cpp o cualquier herramienta que soporte safetensors y modelos de la familia OLMo.
- La latencia y throughput dependerán de la GPU y de la implementación. Para un modelo de 1B, en una RTX 4090 se puede esperar una generación de alrededor de 50-100 tokens/s, aunque no hay datos oficiales.

## Comparativa con modelos similares

No se dispone de una comparativa directa con otros modelos de la misma categoría (1B) en términos de rendimiento, ya que no hay benchmarks publicados. Sin embargo, se puede comparar a nivel arquitectónico y de disponibilidad:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| OLMo-2-1B (base) | 1B | No disponible | Apache 2.0 | Hugging Face |
| dvader13/olmo2-1b-sft-26-2664b (este) | 1B | No disponible | Apache 2.0 | Hugging Face |
| Qwen2.5-1.5B | 1.5B | 32k | Apache 2.0 | Hugging Face |

La diferencia principal es que este modelo es un checkpoint de SFT intermedio, mientras que los otros son modelos finales. No hay datos de rendimiento para establecer comparaciones.

## Limitaciones y advertencias

- Los checkpoints son de solo inferencia y no incluyen el estado del optimizador, lo que impide continuar el entrenamiento desde esos puntos.
- No se proporciona información sobre el conjunto de datos de SFT, por lo que no se pueden evaluar posibles sesgos o desalineaciones.
- El modelo no ha sido evaluado en tareas específicas, por lo que no se garantiza su rendimiento en casos de uso reales.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario verificar que el uso cumpla con las condiciones de atribución.
- La longitud de contexto no está especificada, lo que puede limitar aplicaciones que requieran ventanas de contexto largas.
- No se han realizado pruebas de seguridad o de mitigación de contenido dañino, por lo que no se recomienda para aplicaciones sensibles sin evaluación adicional.

## Enlaces

- [Repositorio en Hugging Face](https://huggingface.co/dvader13/olmo2-1b-sft-s1-2664b)
- [Paper técnico de OLMo 2](https://arxiv.org/abs/2501.00656)
- [Página oficial de OLMo 2](https://allenai.org/olmo2)
