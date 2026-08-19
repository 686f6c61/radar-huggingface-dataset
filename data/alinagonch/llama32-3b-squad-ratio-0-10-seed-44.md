# AlinaGonch/llama32-3b-squad-ratio-0.10-seed-44

## Resumen

El modelo `AlinaGonch/llama32-3b-squad-ratio-0.10-seed-44` es un ajuste fino del modelo base Llama 3.2 3B sobre el dataset SQuAD 2.0, desarrollado por la autora AlinaGonch. Forma parte de una colección de experimentos cuyo objetivo es determinar la proporción óptima de preguntas sin respuesta (unanswerable) en el conjunto de entrenamiento para tareas de comprensión lectora extractiva. El nombre del repositorio indica que se usó un ratio de 0.10 (10% de muestras sin respuesta) y una semilla de 44 para la reproducibilidad.

Aunque la model card publicada es prácticamente vacía (solo contiene marcadores de "More Information Needed"), el contexto del proyecto sugiere que se trata de un modelo especializado en responder preguntas a partir de un contexto dado, con capacidad para detectar cuándo una pregunta no tiene respuesta en el texto. El tamaño del repositorio (0.1 GB) es notablemente pequeño para un modelo de 3B parámetros, lo que podría indicar que se trata de una versión cuantizada o de una submuestra de los pesos, aunque no se dispone de confirmación.

Actualmente el modelo no tiene descargas ni valoraciones, y no se han publicado resultados de evaluación. Su relevancia radica en ser parte de un estudio metodológico sobre el equilibrio de datos en SQuAD 2.0, más que en ser un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere Transformer decoder-only, basado en Llama 3.2 3B) |
| Parametros totales | no disponible (se infiere 3B por el nombre, no confirmado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (probablemente ingles, al ser SQuAD) |
| Licencia | no disponible |
| Formato de pesos | safetensors (según tags de Hugging Face) |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo. Por el nombre del repositorio, se deduce que parte de los pesos de Llama 3.2 3B, un modelo Transformer decoder-only con 3 mil millones de parámetros, publicados por Meta. El entrenamiento se realizó sobre el dataset SQuAD 2.0, que combina preguntas respondibles y no respondibles a partir de artículos de Wikipedia. El experimento controla la proporción de preguntas sin respuesta (ratio 0.10) y la semilla (44) para estudiar el efecto en el rendimiento final.

No se han publicado hiperparámetros de entrenamiento, número de épocas, tasa de aprendizaje ni detalles sobre el proceso de ajuste fino. Tampoco se menciona el uso de técnicas como RLHF o DPO. La model card no incluye información sobre el hardware utilizado ni el tiempo de entrenamiento.

## Capacidades

- Comprension lectora extractiva: el modelo está diseñado para responder preguntas a partir de un contexto dado, extrayendo el fragmento relevante del texto.
- Deteccion de preguntas sin respuesta: al entrenarse con SQuAD 2.0, debería ser capaz de identificar cuándo una pregunta no tiene respuesta en el contexto y devolver una señal de "no respondible".
- Generacion de texto: al derivar de Llama 3.2, conserva la capacidad generativa del modelo base, aunque no se ha evaluado su calidad en tareas abiertas.
- No se confirma soporte para tool calling, agentes, vision, audio u otras modalidades.

## Casos de uso

- Investigacion academica sobre datasets de QA: el modelo sirve como referencia para estudiar el impacto del ratio de preguntas sin respuesta en el rendimiento de modelos de comprension lectora. Se puede utilizar para reproducir experimentos y comparar con otros ratios (0.30, 0.50, etc.).
- Desarrollo de sistemas de QA extractivo en entornos controlados: para prototipos que necesiten responder preguntas sobre documentos especificos, aunque se recomienda validar primero su rendimiento.
- Benchmarking de tecnicas de fine-tuning: dado que es un experimento con semilla fija, puede usarse como punto de comparacion para otras estrategias de entrenamiento sobre SQuAD.
- Educacion y formacion en PLN: como ejemplo de ajuste fino de un modelo base sobre un dataset estandar, util para cursos de procesamiento de lenguaje natural.
- Analisis de sesgos en datos de entrenamiento: el experimento permite explorar como la proporcion de muestras negativas afecta al comportamiento del modelo, especialmente en la deteccion de preguntas no respondibles.
- Pruebas de cuantizacion y despliegue ligero: dado su tamano reducido (0.1 GB), podria probarse en entornos con recursos limitados, aunque se desconoce la calidad tras la cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de metricas como F1 o EM (Exact Match) sobre SQuAD 2.0, ni comparaciones con otros modelos. La model card no incluye ninguna tabla de evaluacion.

## Requisitos de hardware

- VRAM estimada: no disponible. Si se confirma que es un modelo de 3B parámetros, una cuantizacion de 4 bits requeriria aproximadamente 2-3 GB de VRAM, pero no hay datos oficiales.
- GPU recomendadas: no disponible. Un modelo de 3B puede ejecutarse en GPUs consumer como RTX 3060 (12 GB) o superiores, pero sin confirmacion.
- Compatibilidad con consumer GPU: probable, dado el tamano reducido del repositorio, pero no verificado.
- Opciones de despliegue: al estar en formato safetensors y ser compatible con transformers, puede cargarse con Hugging Face Transformers, vLLM o TGI. Para cuantizacion, se podria usar llama.cpp u Ollama, pero no hay archivos GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa. El modelo base Llama 3.2 3B es la referencia natural, pero no se han publicado resultados que permitan comparar el efecto del fine-tuning. Tampoco hay datos sobre otros modelos ajustados a SQuAD con diferentes ratios. Se recomienda consultar la coleccion de la autora para ver otras variantes del experimento.

## Limitaciones y advertencias

- Model card incompleta: la ausencia de informacion sobre licencia, arquitectura y entrenamiento impide conocer las condiciones de uso y las garantias de funcionamiento.
- Riesgo de sobreajuste: al ser un experimento con un solo dataset y un ratio especifico, el modelo puede no generalizar bien a dominios fuera de SQuAD.
- Sesgos potenciales: SQuAD 2.0 se basa en articulos de Wikipedia en ingles, por lo que el modelo puede reflejar sesgos presentes en ese corpus (culturales, de genero, etc.).
- Alucinaciones: como cualquier modelo generativo, puede producir respuestas incorrectas o inventadas, especialmente si la pregunta no tiene respuesta en el contexto.
- Uso comercial: al no especificarse la licencia, no se puede garantizar que sea apto para uso comercial. Se debe contactar con la autora o esperar a que se aclare.
- Produccion: no se recomienda su uso en entornos productivos sin una evaluacion exhaustiva previa, dado que no hay benchmarks publicados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AlinaGonch/llama32-3b-squad-ratio-0.10-seed-44
- Coleccion de experimentos SQuAD ratio: https://huggingface.co/collections/AlinaGonch/squad-dataset-ratio-experiment-llama32-llama31
- Modelo base Llama 3.2 3B en Ollama: https://ollama.com/library/llama3.2:3b
- Documentacion de Llama 3.2 de Meta: https://developer.meta.com/ai/docs/model-cards-and-prompt-formats/llama3_2/
