# amandaodoo/clasificador-comentarios-transformers

## Resumen

El modelo `amandaodoo/clasificador-comentarios-transformers` es un clasificador de texto binario en español desarrollado por la usuaria de Hugging Face amandaodoo en el marco del Seminario de Actualización del IFTS N.º 18, con la docente Cynthia M. Villagra como responsable. Se trata de un BERT diminuto entrenado desde cero, no de un fine-tuning sobre un modelo preentrenado, con el objetivo de clasificar comentarios cortos sobre departamentos en las categorías `positivo` o `negativo`.

Su relevancia no es de rendimiento sino pedagógica: el modelo ilustra el conjunto completo de artefactos que se publican al compartir un modelo en Hugging Face (configuración, pesos en safetensors, tokenizer propio y scripts de entrenamiento e inferencia). Con 20.546 parámetros totales, 2 capas, 2 cabezas de atención y una dimensión oculta de 32, es uno de los transformers más pequeños publicables y sirve como ejemplo mínimo funcional del pipeline `text-classification` de la librería Transformers.

El modelo se entrenó sobre un dataset sintético de 368 comentarios generados a partir de 5 plantillas y 16 adjetivos, con un vocabulario a nivel de palabra de solo 37 tokens. Esta escala tan reducida lo hace inadecuado para producción, pero útil para demostraciones docentes sobre tokenización, publicación de artefactos y evaluación de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (BertForSequenceClassification), 2 capas, 2 cabezas de atención, dimensión oculta 32 |
| Parametros totales | 20.546 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | español (es) |
| Licencia | MIT |
| Formato de pesos | safetensors (model.safetensors); tokenizer en tokenizer.json y tokenizer_config.json |
| Tokenizer | WordLevel, 37 tokens, minúsculas y sin tildes |
| Etiquetas | `negativo` (0), `positivo` (1) |
| Pipeline | text-classification |
| Librería | transformers (compatible con Transformers 4 y 5) |

## Arquitectura y entrenamiento

El modelo es un transformer encoder de tipo BERT configurado como `BertForSequenceClassification` con dos capas de encoder, dos cabezas de atención y una dimensión oculta de 32. La cabeza de clasificación proyecta la representación del token `[CLS]` a dos logits correspondientes a las etiquetas `negativo` y `positivo`. El tokenizer es de tipo `WordLevel` con un vocabulario de 37 tokens, normaliza a minúsculas y elimina tildes, de modo que cualquier palabra fuera del vocabulario se mapea a `[UNK]`.

El entrenamiento se realizó desde cero (sin inicialización desde un checkpoint preentrenado) sobre un dataset sintético de 368 comentarios generados a partir de 5 plantillas de frases y 16 adjetivos (8 positivos y 8 negativos), con un split de 294 ejemplos de entrenamiento y 74 de evaluación. Se usó entropía cruzada como función de pérdida, optimizador AdamW con tasa de aprendizaje 0,001, 15 épocas y lotes de 16, sobre PyTorch y Hugging Face Transformers. No se aplicaron técnicas de RLHF, DPO ni decodificación especulativa; el modelo es exclusivamente de clasificación, no generativo.

## Capacidades

- Clasificación binaria de texto corto en español: asigna una de dos etiquetas (`positivo` o `negativo`) a un comentario.
- Inferencia mediante el pipeline `text-classification` de Transformers con una sola línea de código.
- Funciona con Transformers 4 y Transformers 5.
- Publicación autocontenida: incluye pesos, tokenizer y scripts (`train.py`, `predict.py`) en el mismo repositorio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: solo español y solo el vocabulario de 37 palabras.
- No dispone de modo thinking, visión, audio ni generación de texto.

## Casos de uso

- Docencia sobre el ciclo de vida de un modelo: el repositorio permite mostrar al alumnado los artefactos mínimos (config, safetensors, tokenizer, scripts) que se publican al compartir un modelo en Hugging Face, usando el propio modelo como ejemplo ejecutable.
- Demostración de tokenización a nivel de palabra: sirve para ilustrar cómo un vocabulario reducido convierte palabras desconocidas en `[UNK]` y cómo eso afecta a la predicción, con el ejemplo documentado de "tiene una vista increíble".
- Práctica de evaluación crítica: el accuracy de 1,000 sobre test permite discutir por qué una métrica perfecta no implica un modelo útil cuando train y test comparten plantillas y adjetivos.
- Ejercicio de fine-tuning comparativo: el propio autor sugiere partir de un modelo preentrenado en español y hacer fine-tuning con comentarios reales, usando este modelo como línea base ingenua.
- Prototipado de pipelines de clasificación en entornos educativos o de laboratorio, donde el coste computacional es irrelevante y se prioriza la claridad del código sobre el rendimiento.
- Prueba de integración con `text-embeddings-inference` y endpoints compatibles, ya que el repositorio incluye la etiqueta `endpoints_compatible` para verificar el despliegue en infraestructura de Inferencia de Hugging Face.

## Benchmarks y rendimiento

| Métrica | Resultado | Conjunto |
|---|---|---|
| Accuracy | 1,000 | 74 comentarios sintéticos de test |

El accuracy de 1,000 es optimista por construcción: los comentarios de test usan las mismas plantillas y los mismos adjetivos que los de entrenamiento. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, y no serían aplicables a un modelo de este tamaño y naturaleza.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el modelo pesa unos pocos cientos de kilobytes en safetensors y cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquiera, incluida una GTX 1050 o una iGPU; el cuello de botella no es el cómputo sino la latencia de carga.
- Cabe en GPU consumer sin problema, así como en CPU.
- Opciones de despliegue: pipeline de Transformers, `text-embeddings-inference` (etiqueta `endpoints_compatible`), y cualquier runtime que cargue safetensors con Transformers 4 o 5.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo, la inferencia es prácticamente instantánea en CPU y GPU.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amandaodoo/clasificador-comentarios-transformers | 20.546 | no disponible | es | MIT | Hugging Face |
| BERT-base multilingüe (referencia) | ~178 M | 512 | 104 idiomas | Apache 2.0 | Hugging Face |
| BETO (BERT español) | ~110 M | 512 | es | MIT | Hugging Face |

La comparación es asimétrica por diseño: este modelo es un ejemplo pedagógico de 20.546 parámetros frente a encoders preentrenados de cientos de millones. No se dispone de benchmarks comparables publicados en la información proporcionada para establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- Fines exclusivamente educativos; no está pensado para uso en producción.
- Solo conoce 37 palabras: cualquier término fuera del vocabulario se convierte en `[UNK]` y el modelo responde igualmente con seguridad alta, como documenta el autor con el ejemplo "tiene una vista increíble" → `negativo (1.00)`.
- No entiende negaciones ("no es luminoso") ni ironía, porque las frases de entrenamiento no las contienen.
- El accuracy de test es optimista: train y test comparten plantillas y adjetivos, por lo que la métrica no refleja generalización.
- Riesgo elevado de alucinación de etiqueta: el modelo siempre emite una de las dos clases con una puntuación de confianza, incluso ante entradas sin sentido.
- Restricciones de licencia: MIT permite uso comercial, pero el modelo no es funcionalmente apto para ello; la limitación es técnica, no legal.
- Sesgos conocidos: no disponibles en la información proporcionada, aunque el dataset sintético de 16 adjetivos no cubre el espacio léxico real del dominio.
- Para uso real, el propio autor recomienda hacer fine-tuning de un modelo preentrenado en español con comentarios reales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/amandaodoo/clasificador-comentarios-transformers
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Documentación del pipeline text-classification: https://huggingface.co/docs/transformers/main/en/main_classes/pipelines#transformers.TextClassificationPipeline
- Documentación de safetensors: https://huggingface.co/docs/safetensors
- No se han encontrado papers, blogs ni demos adicionales en la información proporcionada.
