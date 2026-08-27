# dvader13/smollm3-3b-sft-3p11t

## Resumen

Este modelo es un conjunto de checkpoints de ajuste fino supervisado (SFT) del modelo base SmolLM3-3B, desarrollado por Hugging Face. El repositorio `dvader13/smollm3-3b-sft-3p11t` contiene diez fracciones de dosis de SFT, denominadas `checkpoint_pct010` a `checkpoint_pct100`, que representan distintos grados de entrenamiento sobre el modelo preentrenado con 3,11 billones de tokens. La finalidad de estos checkpoints es permitir experimentar con la evolución del rendimiento del modelo a medida que se aplica SFT en diferentes proporciones, lo que resulta útil para estudiar la dinámica del ajuste fino y seleccionar el punto óptimo de entrenamiento.

El modelo base SmolLM3-3B es un modelo de lenguaje de 3 mil millones de parámetros, de tipo decoder-only, diseñado para ofrecer un rendimiento sólido en tareas de razonamiento, generación de texto y código, con soporte nativo para seis idiomas y una ventana de contexto de hasta 128 000 tokens. Al ser un checkpoint SFT, hereda estas características del modelo base, pero se ha sometido a un proceso de ajuste fino adicional que, según el autor, no incluye el estado del optimizador (solo inferencia). Este repositorio es de interés para desarrolladores que buscan estudiar el efecto de la dosis de SFT en la calidad del modelo y para aquellos que requieren un punto de control intermedio para tareas específicas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder-only transformer (SmolLM3-3B base) |
| Parametros totales | 3.000 millones |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128 000 tokens (según el modelo base) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en bf16) |
| Idiomas soportados | 6 idiomas (según el modelo base; no especificados en el repo) |
| Licencia | Apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors, pero no indicado) |

## Arquitectura y entrenamiento

El modelo base SmolLM3-3B es un transformer decoder-only con arquitectura Llama, preentrenado con un total de 3,11 billones de tokens. El checkpoint objeto de esta ficha es el resultado de aplicar un proceso de SFT sobre ese modelo base, con diez puntos de control correspondientes a diferentes fracciones de datos de entrenamiento (10 %, 20 %, ..., 100 %). No se proporcionan detalles sobre el dataset de SFT utilizado ni sobre si se aplicaron técnicas como RLHF o DPO; la model card solo indica que se trata de checkpoints de SFT, en precisión bf16 y que se conserva únicamente el estado de inferencia (sin estado de optimizador). Esta variación de dosis permite observar la evolución del rendimiento y la posible saturación o sobreajuste del modelo a medida que se incrementa la cantidad de datos de ajuste.

## Capacidades

- Generación de texto y razonamiento: al ser una variante SFT de SmolLM3-3B, mantiene las capacidades de generación coherente y razonamiento de la versión base, con un ajuste orientado a instrucciones.
- Soporte multilingüe: el modelo base soporta seis idiomas (no especificados en el repositorio, pero comúnmente incluyen inglés, francés, alemán, español, italiano y portugués, según documentación de Hugging Face).
- Ventana de contexto larga: hasta 128 000 tokens, lo que permite manejar documentos extensos o conversaciones de múltiples turnos.
- Modo de razonamiento dual: SmolLM3-3B incluye la capacidad de activar un modo de razonamiento paso a paso (dual-mode reasoning), que puede ser útil para tareas de lógica y matemáticas.
- No se indica soporte específico de tool calling o agentes para este checkpoint, pero el modelo base es compatible con estas funcionalidades según documentación oficial.
- Capacidad de procesamiento de código: el modelo base ha sido entrenado con una proporción significativa de datos de código, por lo que puede generar y entender código en varios lenguajes.

## Casos de uso

- Investigación en ajuste fino: los diez checkpoints permiten estudiar la relación entre la cantidad de datos de SFT y el rendimiento final, siendo útil para trabajos académicos o para optimizar el presupuesto de entrenamiento en proyectos de investigación.
- Desarrollo de asistentes conversacionales ligeros: con 3 000 millones de parámetros y una ventana de 128K, el modelo puede desplegarse en entornos con recursos limitados para chatbots de atención al cliente, manteniendo el contexto de conversaciones largas.
- Generación de código en entornos de producción: el modelo base es capaz de completar y generar código; el ajuste SFT puede mejorar la adherencia a instrucciones específicas, por lo que puede integrarse en pipelines de CI/CD para sugerencias de código o revisión automatizada.
- Análisis de documentos extensos: la ventana de contexto de 128K permite procesar informes, manuales o contratos completos sin truncamiento, facilitando tareas de extracción de información o resumen.
- Aplicaciones multilingües: al soportar seis idiomas, el modelo puede utilizarse en sistemas de traducción o generación de contenido en varios idiomas, aunque con limitaciones en comparación con modelos más grandes.
- Prototipado de agentes de razonamiento: el modo de razonamiento dual permite construir prototipos de agentes que necesitan explicar pasos intermedios, como asistentes de matemáticas o lógica, aunque no se garantiza el soporte completo de tool calling.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los checkpoints no incluyen métricas de evaluación (MMLU, HumanEval, GSM8K, etc.) ni comparaciones con el modelo base o con otras variantes. Se recomienda consultar la documentación del modelo SmolLM3-3B para obtener datos de rendimiento de la versión base, pero no se pueden atribuir estos resultados a este checkpoint específico.

## Requisitos de hardware

- El modelo tiene 3 000 millones de parámetros, lo que permite su ejecución en GPUs de consumo medio.
- En precisión bf16 (formato original del checkpoint), la VRAM requerida es de aproximadamente 6 GB para la carga del modelo, más memoria para los estados de activación y el contexto; con 128K de contexto puede necesitar más memoria.
- Con cuantización a 4 bits (por ejemplo, con `bitsandbytes` o `llama.cpp`), el uso de VRAM puede reducirse a alrededor de 2-3 GB, permitiendo su ejecución en GPUs como la RTX 3060 (12 GB) o RTX 4060 (8 GB).
- GPU recomendadas: RTX 3090, RTX 4090, A100 (para inferencia de alta velocidad), o incluso CPU con suficiente RAM para cuantizaciones agresivas.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (Text Generation Inference) y Transformers de Hugging Face.
- En una GPU A100 (80 GB), el modelo puede lograr un throughput de varias decenas de tokens por segundo, dependiendo de la longitud de la secuencia y del batch.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de este checkpoint específico para comparar con otros modelos. Sin embargo, a nivel del modelo base SmolLM3-3B, se puede comparar con alternativas de tamaño similar:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SmolLM3-3B (base) | 3B | 128K | Apache-2.0 | Hugging Face |
| Llama-3.2-3B | 3.2B | 128K | Llama 3.2 Community License | Hugging Face |
| Phi-3-mini (3.8B) | 3.8B | 128K | MIT | Hugging Face |

Estos modelos compiten en el rango de 3-4 mil millones de parámetros, con ventanas de contexto largas y licencias permisivas. El checkpoint SFT de este repositorio ofrece la particularidad de múltiples puntos de control para estudiar el ajuste fino, algo que no ofrecen los otros modelos.

## Limitaciones y advertencias

- No se dispone de información sobre los sesgos específicos de este checkpoint; al ser una variante de SmolLM3, se heredan los sesgos del modelo base, que pueden incluir estereotipos de género, raza o cultura presentes en los datos de entrenamiento.
- El riesgo de alucinación es inherente a los modelos de lenguaje; el ajuste fino no elimina este problema, y es necesario validar las salidas en aplicaciones de producción.
- El modelo está optimizado para seis idiomas, pero su rendimiento en otros idiomas puede ser inferior. No se especifica cuáles son esos idiomas, lo que puede limitar su uso en contextos multilingües concretos.
- La licencia Apache-2.0 permite uso comercial, pero se debe citar la procedencia y cumplir con las condiciones de la licencia.
- Los checkpoints están en formato bf16 y no incluyen el estado del optimizador, por lo que no son adecuados para continuar el entrenamiento sin conversión adicional.
- El tamaño del repositorio es de 0.0 GB, lo que sugiere que los archivos pueden no estar disponibles aún o que el repositorio está vacío; es necesario verificar la disponibilidad real antes de su uso.

## Enlaces

- Repositorio HuggingFace: [dvader13/smollm3-3b-sft-3p11t](https://huggingface.co/dvader13/smollm3-3b-sft-3p11t)
- Modelo base SmolLM3-3B: [HuggingFaceTB/SmolLM3-3B](https://huggingface.co/HuggingFaceTB/SmolLM3-3B)
- Curso de SmolLM3 (SFT): [Supervised Fine-Tuning with SmolLM3](https://huggingface.co/learn/smol-course/unit1/3)
- Recetas de entrenamiento (alignment-handbook): [alignment-handbook/recipes/smollm3](https://github.com/huggingface/alignment-handbook/blob/main/recipes/smollm3/README.md)
- GitHub de SmolLM3: [ArkS0001/SmolLM3-3B](https://github.com/ArkS0001/SmolLM3-3B)
