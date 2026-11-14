# raulgdp/xlmr-large-sarcasmo-spanish-2026-balanceado-16

## Resumen

`raulgdp/xlmr-large-sarcasmo-spanish-2026-balanceado-16` es un modelo de clasificación de texto en español especializado en la detección de sarcasmo, obtenido mediante fine-tuning de `FacebookAI/xlm-roberta-large`. Lo publica el usuario raulgdp en Hugging Face y sigue el formato estándar de `generated_from_trainer`: un checkpoint de clasificación con cabecera sobre el encoder multilingüe de XLM-RoBERTa en su variante large.

El modelo resuelve una tarea concreta y acotada: clasificar un texto en español como sarcástico o no sarcástico. No es un modelo generativo ni un asistente conversacional; es un clasificador de secuencias que devuelve una etiqueta y una distribución de probabilidad. Su relevancia radica en el dominio: el sarcasmo es un fenómeno pragmático difícil de detectar automáticamente, y los modelos específicos para español son escasos en comparación con el inglés.

Con 559.892.482 parámetros y un tamaño de repositorio de 33,6 GB, el checkpoint ocupa un orden de magnitud superior al de un modelo de 560M en fp32, lo que sugiere la presencia de múltiples artefactos de entrenamiento (estados del optimizador, checkpoints intermedios) además de los pesos finales. La model card es auto-generada y no documenta el dataset, los idiomas ni los usos previstos, por lo que buena parte de las especificaciones debe marcarse como no disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa large) con cabecera de clasificación de secuencias |
| Parametros totales | 559.892.482 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base XLM-RoBERTa large admite hasta 512 tokens, pero el autor no lo declara) |
| Tipos de cuantizacion | no disponible; el repo contiene safetensors en precision de entrenamiento |
| Idiomas soportados | no disponible en la model card; por el nombre y la tarea se orienta a espanol, pero el autor no lo declara |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria transformers) |
| Pipeline | text-classification |
| Modelo base | FacebookAI/xlm-roberta-large |
| Tamano del repositorio | 33,6 GB |
| Descargas | 114 |
| Likes | 0 |

## Arquitectura y entrenamiento

La arquitectura es la de XLM-RoBERTa large: un transformer encoder de tipo BERT con 24 capas, 1024 dimensiones ocultas y 16 cabezas de atención, preentrenado de forma multilingüe sobre corpus web filtrados. Sobre ese encoder, el autor ha añadido una cabecera de clasificación (una capa lineal sobre el token `[CLS]`) y ha realizado un fine-tuning supervisado para una tarea binaria o multiclase de sarcasmo. No hay innovaciones arquitectónicas propias: es un ajuste estándar de `AutoModelForSequenceClassification`.

Los hiperparámetros documentados en la model card son: learning rate 1e-5, batch de entrenamiento 16 con acumulación de gradiente de 4 (batch efectivo 64), optimizador AdamW fused con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal, 10 épocas, semilla 42 y entrenamiento con precisión mixta nativa (AMP). El dataset de entrenamiento aparece como `None` en la model card, de modo que no se puede verificar su composición, tamaño ni procedencia. El nombre del checkpoint (`balanceado-16`) sugiere un conjunto de datos balanceado y un tamaño de batch o de muestra asociado al número 16, pero es una inferencia a partir del nombre, no un dato documentado. No se menciona RLHF, DPO ni ninguna técnica de alineación, algo esperable en un clasificador.

## Capacidades

- Clasificación de texto: asigna una etiqueta de sarcasmo/no sarcasmo a una secuencia de entrada en español, con probabilidad asociada.
- Detección de sarcasmo en textos cortos: el caso de uso central declarado por el nombre del modelo.
- Extracción de embeddings de frase: al ser un encoder XLM-RoBERTa, puede usarse como extractor de representaciones (la model card no lo documenta, pero es una capacidad heredada del backbone).
- Soporte de tool calling / function calling: no disponible; no es un modelo generativo.
- Soporte de agentes y multi-step reasoning: no disponible; no es un modelo generativo.
- Capacidades multilingües: el backbone es multilingüe, pero el fine-tuning se orienta presumiblemente al español; el autor no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Moderación de comunidades en español: clasificar comentarios y mensajes de foros o redes como sarcásticos para ajustar la moderación automática y evitar falsos positivos en sistemas de toxicidad, donde el sarcasmo suele confundir a los clasificadores.
- Análisis de sentimiento en redes sociales: usar la etiqueta de sarcasmo como señal auxiliar que invierta o module la polaridad detectada por un modelo de sentimiento, mejorando la precisión en tuits y reseñas.
- Investigación en pragmática computacional: emplear el modelo como baseline o componente en estudios sobre ironía y sarcasmo en español, comparando su comportamiento con anotaciones humanas.
- Enrutado en atención al cliente: detectar mensajes sarcásticos o irónicos de clientes para escalarlos a agentes humanos o a un modelo generativo con instrucciones específicas de manejo de tono.
- Filtrado de reseñas de producto: identificar reseñas sarcásticas (por ejemplo, elogios aparentes que en realidad son críticas) antes de agregarlas en sistemas de reputación o dashboards de opinión.
- Anotación asistida de corpus: pre-etiquetar grandes volúmenes de texto en español para acelerar el etiquetado humano en proyectos de creación de datasets de sarcasmo.
- Señal auxiliar en pipelines de comprensión lectora o diálogo: incorporar la predicción como feature adicional en un sistema mayor que necesite interpretar el tono del usuario.

## Benchmarks y rendimiento

Los únicos datos disponibles son los de validación durante el entrenamiento, declarados por el autor en la model card. No hay comparación con otros modelos ni resultados en benchmarks estándar (MMLU, HumanEval, GSM8K no aplican a un clasificador).

| Epoca | Validation loss | Accuracy | F1 weighted | F1 macro | Precision weighted | Recall weighted |
|---|---|---|---|---|---|---|
| 1 | 0,3024 | 0,8808 | 0,8808 | 0,8808 | 0,8808 | 0,8808 |
| 2 | 0,2824 | 0,8917 | 0,8913 | 0,8913 | 0,8966 | 0,8917 |
| 3 | 0,2161 | 0,9200 | 0,9200 | 0,9200 | 0,9201 | 0,9200 |
| 4 | 0,2363 | 0,9160 | 0,9159 | 0,9159 | 0,9190 | 0,9160 |
| 5 | 0,2314 | 0,9309 | 0,9309 | 0,9309 | 0,9309 | 0,9309 |
| 6 | 0,2710 | 0,9266 | 0,9266 | 0,9266 | 0,9266 | 0,9266 |
| 7 | 0,3316 | 0,9299 | 0,9299 | 0,9299 | 0,9301 | 0,9299 |

El mejor checkpoint en validación es el de la época 5 (loss 0,2314, accuracy 0,9309). A partir de la época 6 la loss de validación sube mientras la accuracy se mantiene alta, señal de sobreajuste moderado. El modelo-index del autor está vacío (`results: []`), por lo que no hay resultados declarados fuera del conjunto de validación propio.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 2,2 GB solo para pesos (560M × 4 bytes); con activaciones y overhead de framework, unos 3-4 GB para batches pequeños.
- VRAM estimada en fp16/bf16: aproximadamente 1,1 GB para pesos, 2-3 GB en total con overhead.
- VRAM estimada en int8: alrededor de 0,6 GB para pesos; en int4, unos 0,3 GB.
- GPU recomendadas: cualquier GPU consumer moderna sirve. Una RTX 3060 (12 GB), RTX 4060 (8 GB) o RTX 4090 (24 GB) cubren holgadamente la inferencia. Para entrenamiento o fine-tuning, se recomienda al menos 16-24 GB (RTX 4090, A10, A100).
- Cabe en GPU consumer: sí, en todas las GPU con 4 GB o más para inferencia en fp16.
- Opciones de despliegue: transformers con pipeline `text-classification`, Text Embeddings Inference (el tag `text-embeddings-inference` está presente), endpoints compatibles, y exportación a ONNX para servir con ONNX Runtime. No se documenta soporte GGUF ni llama.cpp (no aplica a un encoder de clasificación de forma nativa).
- Latencia y throughput: no disponibles en la información proporcionada. Como referencia orientativa de la arquitectura, un encoder de 24 capas y 1024 dimensiones procesa secuencias cortas en decenas de milisegundos por batch en GPU moderna, pero el autor no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| raulgdp/xlmr-large-sarcasmo-spanish-2026-balanceado-16 | 559,9M | no disponible | Clasificacion de sarcasmo (es) | MIT | Hugging Face |
| FacebookAI/xlm-roberta-large | 559,9M | 512 tokens | Encoder multilingue base | MIT | Hugging Face |
| robertuito (pysentimiento) | ~110M | 128 tokens | Clasificacion de sentimiento/ironia en es | MIT | Hugging Face |
| BERT-base-spanish (BETO) | ~110M | 512 tokens | Encoder en espanol | MIT | Hugging Face |

La comparación directa de rendimiento no es posible: no hay resultados de benchmarks publicados por el autor ni evaluaciones independientes del checkpoint. Frente al backbone base, este modelo añade la especialización en sarcasmo a costa de perder generalidad. Frente a alternativas más ligeras como robertuito o BETO, el tamaño de 560M ofrece mayor capacidad representacional a cambio de más VRAM y latencia; la elección depende del presupuesto de cómputo y de si la tarea justifica el modelo grande. No se dispone de datos para afirmar que este checkpoint supere a esas alternativas en la tarea de sarcasmo.

## Limitaciones y advertencias

- Model card auto-generada e incompleta: el dataset de entrenamiento figura como `None`, no se documentan los usos previstos ni las limitaciones, y no se declaran los idiomas soportados.
- Riesgo de sobreajuste: la loss de validación sube a partir de la época 5 (de 0,2314 a 0,3316 en la época 7) mientras la accuracy se mantiene, lo que indica que el checkpoint final puede no ser el mejor en generalización.
- Métricas de validación únicamente: no hay evaluación en test independiente ni comparación con baselines, por lo que la accuracy de 0,9309 no está confirmada fuera del conjunto de validación del propio autor.
- Sesgos desconocidos: al no documentarse la composición del dataset, no se puede evaluar el sesgo por registro, variedad dialectal, género ni dominio.
- Riesgo de alucinación: no aplica en sentido generativo, pero sí existe riesgo de clasificaciones erróneas en textos ambiguos, irónicos sin marcadores léxicos o dependientes del contexto cultural.
- Dominio limitado: el sarcasmo es un fenómeno dependiente del contexto; un clasificador de secuencia corta puede fallar en conversaciones multi-turno o en textos que requieren contexto externo.
- Licencia MIT: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el rendimiento en producción ni sobre la procedencia de los datos de entrenamiento.
- Tamaño del repositorio (33,6 GB) muy superior al de los pesos del modelo: conviene revisar qué artefactos contiene antes de descargarlo completo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/raulgdp/xlmr-large-sarcasmo-spanish-2026-balanceado-16
- Modelo base XLM-RoBERTa large: https://huggingface.co/FacebookAI/xlm-roberta-large
- Repositorio de Transformers: https://github.com/huggingface/transformers
- Text Embeddings Inference: https://github.com/huggingface/text-embeddings-inference
