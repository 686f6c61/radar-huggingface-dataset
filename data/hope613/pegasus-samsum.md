# hope613/pegasus-samsum

## Resumen

pegasus-samsum es un ajuste fino (fine-tuning) del modelo google/pegasus-cnn_dailymail, un transformer encoder-decoder especializado en resumen abstractivo. El autor, identificado en Hugging Face como hope613, lo ha entrenado sobre un conjunto de datos que la model card describe como "unknown dataset", aunque el nombre del repositorio sugiere el corpus SAMSum, habitual para resumen de diálogos. El modelo cuenta con 570.893.159 parámetros y un repositorio de 2,3 GB en formato safetensors.

La relevancia de este modelo es limitada: se trata de un artefacto derivado de un entrenamiento automático con `Trainer`, sin documentación sustantiva sobre datos, idiomas, licencia ni evaluación más allá de la pérdida de validación. No obstante, sirve como ejemplo de adaptación de PEGASUS a dominios conversacionales y puede resultar útil para experimentación controlada con resumen de diálogos.

Arquitectónicamente hereda el diseño PEGASUS (transformer encoder-decoder con preentrenamiento Gap Sentence Generation), pero no se dispone de información sobre el proceso de ajuste más allá de los hiperparámetros declarados. Cualquier uso en producción requiere validación propia, dado el vacío documental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (PEGASUS) |
| Parametros totales | 570.893.159 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de google/pegasus-cnn_dailymail, típicamente 1024 tokens de entrada; no confirmado en la información proporcionada) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de google/pegasus-cnn_dailymail, un transformer encoder-decoder basado en PEGASUS. La innovación característica de la familia PEGASUS es el preentrenamiento con Gap Sentence Generation (GSG), que enmascara oraciones completas seleccionadas por relevancia y entrena al modelo para reconstruirlas, lo que lo orienta hacia tareas de resumen abstractivo. El modelo base fue preentrenado originalmente sobre el corpus C4 y ajustado sobre CNN/DailyMail.

El ajuste fino se realizó con el `Trainer` de Transformers, con los siguientes hiperparámetros declarados: learning rate 5e-5, batch size de entrenamiento 1 con acumulación de gradientes de 16 (batch efectivo 16), optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 500 pasos de warmup, semilla 42 y 1 época. El entrenamiento consta de 921 pasos y dos puntos de evaluación: en el paso 500 (epoch 0,5431) la pérdida de validación fue 1,5041 y en el paso 921 (epoch 1,0) fue 1,4366. La pérdida de entrenamiento registrada fue 26,0252 y 23,6327 respectivamente. No se documenta la composición del dataset de entrenamiento ni si hubo RLHF, DPO u otras fases de alineamiento.

## Capacidades

- Generación de texto abstractivo orientado a resumen de documentos y, presumiblemente, diálogos.
- Resumen encoder-decoder condicionado a una entrada de texto (pipeline `text2text-generation`).
- Capacidad multilingüe: no disponible; los idiomas no están declarados y dependen del modelo base, predominantemente inglés.
- Tool calling / function calling: no soportado de forma nativa.
- Razonamiento multi-paso y agentes: no soportado; el modelo no está diseñado para ello.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- Generación con control de longitud mediante `max_length`, `min_length` y `length_penalty` propios de la generación seq2seq.

## Casos de uso

- Resumen de conversaciones de atención al cliente: el modelo puede condensar hilos de chat o tickets en un párrafo breve, aprovechando el ajuste sobre un corpus tipo SAMSum (diálogos). Adecuado para preprocesar colas de soporte antes de la revisión humana.
- Generación de actas de reuniones: transcripciones cortas pueden resumirse en puntos clave, siempre que se respete la ventana de entrada del modelo base (habitualmente 1024 tokens) y se trocee el texto en consecuencia.
- Resumen de correos electrónicos en bandejas compartidas: útil para producir resúmenes de una o dos frases por mensaje y priorizar la revisión.
- Prototipado de investigación en resumen abstractivo: sirve como baseline ajustado para comparar con modelos más recientes en tareas de diálogo.
- Enriquecimiento de metadatos en pipelines de datos: generar descripciones cortas de documentos para índices de búsqueda o etiquetado automático.
- Evaluación comparativa de fine-tunings de PEGASUS: al ser un artefacto reproducible con hiperparámetros documentados, permite estudiar el efecto del ajuste sobre SAMSum frente al modelo base.

## Benchmarks y rendimiento

El model-index declarado por el autor no contiene resultados (`results: []`). El único dato de evaluación disponible es la pérdida de validación reportada en la model card.

| Metrica | Valor |
|---|---|
| Validation loss (epoch 0,5431, step 500) | 1,5041 |
| Validation loss (epoch 1,0, step 921) | 1,4366 |
| Training loss (step 500) | 26,0252 |
| Training loss (step 921) | 23,6327 |

No se han publicado resultados de benchmarks (ROUGE, MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 2,3 GB solo para pesos, más overhead de activaciones y caché; en la práctica, entre 3 y 4 GB para secuencias cortas.
- VRAM estimada en fp16/bf16: alrededor de 1,2 GB para pesos, con 2-3 GB totales según longitud de entrada.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (GTX 1650, RTX 3050, T4). Para mayor throughput, A10, L4, RTX 4090 o A100.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más, incluidas RTX 3060, RTX 4060 y superiores.
- Opciones de despliegue: `transformers` con pipeline `text2text-generation`, `text-generation-inference` (TGI) para servir el modelo, y conversión a ONNX para inferencia optimizada. No se dispone de pesos GGUF publicados, por lo que llama.cpp y Ollama requerirían conversión propia.
- Latencia y throughput: no disponibles; dependen del hardware y de la longitud de entrada/salida. En una T4 se puede esperar del orden de decenas de milisegundos por resumen corto, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hope613/pegasus-samsum | 570,9 M | no disponible | Resumen abstractivo (diálogos) | no disponible | Hugging Face |
| google/pegasus-cnn_dailymail | ~568 M | 1024 tokens (entrada) | Resumen de noticias | Apache 2.0 (según el modelo base original) | Hugging Face |
| google/pegasus-xsum | ~568 M | 512 tokens (entrada) | Resumen extremo | Apache 2.0 (según el modelo base original) | Hugging Face |
| philschmid/bart-large-cnn-samsum | ~406 M | 1024 tokens | Resumen de diálogos | no verificada en esta ficha | Hugging Face |

La comparación con alternativas se basa en la familia PEGASUS y en fine-tunings conocidos para SAMSum; no se dispone de métricas ROUGE de este modelo para establecer una comparación cuantitativa. La licencia del modelo base original de Google es Apache 2.0, pero la licencia de este fine-tuning no está declarada por el autor.

## Limitaciones y advertencias

- Documentación insuficiente: la model card indica explícitamente "More information needed" en descripción, usos previstos, limitaciones y datos de entrenamiento.
- Dataset de entrenamiento no identificado: aunque el nombre sugiere SAMSum, el autor declara "unknown dataset", lo que impide conocer la distribución, el idioma y la calidad de los datos.
- Licencia no declarada: no se puede asumir uso comercial sin verificar los términos; el modelo base original es Apache 2.0, pero el autor no confirma la licencia del derivado.
- Riesgo de alucinación: como todo modelo abstractivo, puede generar contenido no presente en la fuente, especialmente con entradas largas o fuera de dominio.
- Limitación de contexto: hereda la ventana del modelo base (habitualmente 1024 tokens); entradas más largas deben trocearse, con riesgo de perder coherencia global.
- Idiomas: no declarados; el modelo base está orientado al inglés, por lo que el rendimiento en castellano es incierto y probablemente deficiente.
- Sin evaluación cualitativa publicada: no hay métricas ROUGE ni ejemplos de salida, lo que impide estimar su calidad real frente al modelo base.
- Entrenamiento de una sola época y batch pequeño: la pérdida de entrenamiento elevada (23,6) frente a la de validación (1,44) sugiere posible inestabilidad o diferencias de escala; conviene validar antes de usar en producción.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso comunitario ni de validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hope613/pegasus-samsum
- Modelo base: https://huggingface.co/google/pegasus-cnn_dailymail
- Paper de PEGASUS (Zhang et al., 2020): https://arxiv.org/abs/1912.08777
- Dataset SAMSum (referencia por el nombre del repositorio): https://arxiv.org/abs/1911.12237
- Documentación de Transformers para `text2text-generation`: https://huggingface.co/docs/transformers/main_classes/pipelines#transformers.Text2TextGenerationPipeline
