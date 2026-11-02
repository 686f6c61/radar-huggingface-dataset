# ateneaxvalac/checkpoints_e5_small

## Resumen

`checkpoints_e5_small` es un modelo de clasificación de texto obtenido mediante fine-tuning supervisado del encoder multilingüe `intfloat/multilingual-e5-small`. Lo publica el usuario de HuggingFace `ateneaxvalac` y está pensado para tareas de clasificación sobre representaciones densas de frases, no para generación de texto. Su relevancia es acotada: se trata de un checkpoint experimental, con cero descargas y cero likes en el momento de la consulta, y con una model card generada automáticamente por el `Trainer` de Transformers que no documenta el conjunto de datos ni el etiquetado utilizado.

Arquitectura BERT (familia E5-small), con 117.654.530 parámetros totales y pesos en formato safetensors. El modelo base, `multilingual-e5-small`, es un encoder de 12 capas y dimensión oculta 384 entrenado con objetivos de embeddings contrastivos multilingües; este checkpoint añade una cabeza de clasificación sobre esa representación. La longitud de contexto heredada del base es de 512 tokens.

El interés práctico es limitado pero identificable: sirve como ejemplo reproducible de fine-tuning de un E5-small para clasificación con `Trainer`, y podría reutilizarse como punto de partida si el dominio de etiquetas coincide. No obstante, la ausencia de información sobre el dataset, las clases y los idiomas reales de entrenamiento impide recomendarlo para producción sin una validación previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer, familia E5-small) |
| Parametros totales | 117.654.530 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (heredada del modelo base) |
| Tipos de cuantizacion | no disponible (pesos safetensors en fp32/fp16; cuantización no documentada) |
| Idiomas soportados | no disponible (el modelo base es multilingüe; el fine-tuning no declara idiomas) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT, base de la familia E5-small, con 117,65 millones de parámetros. Sobre la representación del token `[CLS]` (o pooling equivalente del base) se añade una cabeza de clasificación lineal para `text-classification`. El modelo base `intfloat/multilingual-e5-small` se entrena con objetivos contrastivos sobre pares de texto multilingües, lo que le confiere buenas propiedades de similitud semántica; este checkpoint reutiliza esos pesos y los ajusta para una tarea de clasificación concreta.

El entrenamiento se realizó con el `Trainer` de Transformers 4.57.1 sobre PyTorch 2.11.0+cu130, con `train_batch_size=64`, `eval_batch_size=128`, `learning_rate=2e-05`, scheduler lineal con `warmup_ratio=0.06`, 3 épocas, semilla 42, optimizador AdamW fused y precisión mixta nativa (AMP). El conjunto de datos de entrenamiento no está documentado (`None dataset` en la model card). La evolución de la pérdida de validación muestra un ligero sobreajuste a partir de la segunda época: 0,5094 en la época 1, 0,5087 en la 2 y 0,5258 en la 3, con la accuracy y F1 estabilizados en torno a 0,769 y 0,798 respectivamente.

## Capacidades

- Clasificación de texto: asigna una etiqueta a una secuencia de entrada mediante la cabeza de clasificación ajustada.
- Representaciones de frase: al derivar de E5-small, conserva la capacidad de producir embeddings densos útiles para similitud semántica, aunque el fine-tuning puede haber alterado esa propiedad.
- Multilingüismo potencial: el modelo base es multilingüe, pero el fine-tuning no declara idiomas ni se ha validado su comportamiento fuera del dominio de entrenamiento.
- No soporta generación de texto, tool calling, function calling, razonamiento multi-paso ni modo thinking.
- No dispone de capacidades de visión ni audio.
- No se documenta soporte de agentes.

## Casos de uso

- Clasificación de tickets de soporte: si el conjunto de etiquetas del fine-tuning coincide con categorías de incidencias, el modelo puede etiquetar tickets entrantes con un coste de inferencia muy bajo (117 M de parámetros, cabe en CPU).
- Filtrado de contenido en pipelines de datos: como clasificador binario o multiclase sobre textos cortos (hasta 512 tokens), útil para descartar o enrutar documentos antes de pasarlos a un modelo mayor.
- Enrutamiento de consultas en un sistema RAG: clasificar la intención de la consulta del usuario para dirigirla al índice o al subagente adecuado, aprovechando el reducido coste por inferencia.
- Moderación de comentarios en foros: clasificación de mensajes en categorías predefinidas, siempre que se valide el rendimiento en el dominio real y se revise el sesgo del dataset original.
- Etiquetado asistido en anotación de datos: usar el modelo como preanotador en un flujo de human-in-the-loop, con revisión humana posterior, dado su F1 de validación de 0,798.
- Prototipado y experimentación académica: servir de ejemplo reproducible de fine-tuning de E5-small con `Trainer`, útil para comparar hiperparámetros o como línea base en trabajos de clasificación multilingüe.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (conjunto de evaluación no documentado):

| Metrica | Epoca 1 | Epoca 2 | Epoca 3 |
|---|---|---|---|
| Validation loss | 0,5094 | 0,5087 | 0,5258 |
| Accuracy | 0,7580 | 0,7691 | 0,7690 |
| F1 | 0,7911 | 0,7993 | 0,7981 |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible, ni comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,5 GB en fp32 (117,65 M de parámetros) y en torno a 0,25 GB en fp16; con cuantización INT8 bajaría a unos 0,12 GB, aunque no se documentan pesos cuantizados.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, pero el modelo está claramente sobredimensionado para estas GPUs.
- Cabe en cualquier GPU de consumo e incluso en CPU: es viable ejecutarlo en un portátil o en un contenedor sin acelerador.
- Opciones de despliegue: `transformers` con `pipeline("text-classification")`, `optimum` para exportación a ONNX, `TGI` (Text Generation Inference no aplica a clasificación, pero `TEI` sí soporta encoders), y `llama.cpp` no es aplicable por no ser un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño, se espera un throughput alto en CPU y muy alto en GPU, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ateneaxvalac/checkpoints_e5_small` | 117,65 M | 512 | Clasificación de texto | MIT | HuggingFace |
| `intfloat/multilingual-e5-small` | 117,65 M | 512 | Embeddings multilingües | MIT | HuggingFace |
| `distilbert-base-multilingual-cased` | 135 M | 512 | Clasificación / embeddings | Apache 2.0 | HuggingFace |
| `bert-base-multilingual-cased` | 178 M | 512 | Clasificación / embeddings | Apache 2.0 | HuggingFace |

La comparación con alternativas es aproximada: no se dispone de resultados de benchmarks de este checkpoint frente a los modelos citados, por lo que la elección entre ellos debe basarse en validación propia sobre el dominio objetivo.

## Limitaciones y advertencias

- Dataset de entrenamiento no documentado: se desconoce el dominio, el número de clases, el idioma y la composición del conjunto, lo que impide evaluar su generalización.
- Sobreajuste incipiente: la pérdida de validación sube en la tercera época mientras accuracy y F1 se estancan, lo que sugiere que el checkpoint óptimo podría ser el de la época 2.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas con alta confianza en entradas fuera de distribución.
- Idiomas no declarados: aunque el base es multilingüe, no hay garantía de que el fine-tuning preserve el rendimiento en idiomas distintos del usado en entrenamiento.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías ni soporte; conviene conservar la atribución.
- Cero descargas y cero likes: no hay evidencia de uso en producción ni validación por terceros.
- Model card autogenerada: el propio autor indica que debe revisarse y completarse; la información sobre usos previstos y limitaciones está marcada como "More information needed".
- Contexto limitado a 512 tokens: no apto para documentos largos sin truncado o segmentación previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ateneaxvalac/checkpoints_e5_small
- Modelo base: https://huggingface.co/intfloat/multilingual-e5-small
- Paper de E5 (Multilingual E5 Text Embeddings): https://arxiv.org/abs/2402.05672
- Repositorio de referencia de E5: https://github.com/microsoft/unilm/tree/master/e5
- Documentación de Transformers para clasificación de texto: https://huggingface.co/docs/transformers/tasks/sequence_classification
