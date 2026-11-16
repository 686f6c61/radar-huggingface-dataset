# caio16dev/bertimbau-sentiment-ptbr

## Resumen

bertimbau-sentiment-ptbr es un modelo de clasificación de sentimiento binario para portugués brasileño, obtenido mediante fine-tuning del modelo BERTimbau Base (`neuralmind/bert-base-portuguese-cased`). Lo publica el usuario caio16dev en Hugging Face y su propósito es discriminar entre reseñas de comercio electrónico positivas y negativas. El modelo resuelve un problema acotado y bien definido: la polaridad de opiniones en portugués de Brasil, un idioma con menos recursos que el inglés pero con una base de usuarios enorme en plataformas de e-commerce.

Arquitectura transformer encoder de tipo BERT con 108,9 millones de parámetros totales, adaptada a `BertForSequenceClassification` con dos etiquetas de salida. La longitud de contexto efectiva de entrenamiento es de 128 tokens, coherente con la distribución de longitudes de las reseñas del corpus utilizado. El modelo se distribuye en formato safetensors con un tamaño de repositorio de 0,4 GB.

Su relevancia práctica radica en que ofrece una alternativa ligera y de licencia abierta (aunque la licencia no está declarada explícitamente) para tareas de análisis de opiniones en portugués, con métricas de validación y test publicadas por el autor. No es un modelo generativo ni un LLM: es un clasificador discriminativo especializado, lo que condiciona por completo sus casos de uso y requisitos de hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base), `BertForSequenceClassification` |
| Parametros totales | 108.924.674 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128 tokens (longitud de entrenamiento); límite arquitectónico de BERT base: 512 tokens |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones; al ser un modelo de 108 M de parámetros, es viable en FP32, FP16 y cuantización dinámica INT8 mediante herramientas estándar) |
| Idiomas soportados | portugués (pt), concretamente portugués brasileño (pt-BR) |
| Licencia | no disponible |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de BERTimbau Base, un BERT base entrenado específicamente para portugués por neuralmind, y se ajusta mediante fine-tuning supervisado sobre la tarea de clasificación binaria de sentimiento. La cabeza de clasificación es la estándar de `BertForSequenceClassification` con dos clases (`NEGATIVO`, `POSITIVO`). No se documenta ningún mecanismo de atención lineal, decodificación especulativa ni arquitectura híbrida: es un transformer encoder convencional con atención completa.

El dataset de entrenamiento es B2W-Reviews01, con 132.373 reseñas originales puntuadas de 1 a 5 estrellas. El autor aplica una conversión a binario eliminando las reseñas de 3 estrellas (región ambigua), mapeando 1-2 a negativo y 4-5 a positivo. Tras limpieza (reseñas sin texto, textos vacíos, duplicados y duplicados con etiquetas conflictivas), el corpus final queda en 110.881 reseñas con un desbalance de 70,60% positivos frente a 29,40% negativos. La división es estratificada: 88.704 de entrenamiento, 11.088 de validación y 11.089 de test, con el test reservado hasta la evaluación final. Los hiperparámetros son learning rate 2e-5, 2 épocas, batch de entrenamiento 16, batch de validación 32, weight decay 0,01, padding dinámico, `max_length = 128` y selección del mejor checkpoint por Macro F1. No se documenta uso de RLHF, DPO ni técnicas de aumento de datos.

## Capacidades

- Clasificación binaria de sentimiento (positivo/negativo) en textos en portugués brasileño.
- Análisis de opiniones de productos de e-commerce, dominio para el que fue entrenado específicamente.
- Procesamiento de textos cortos y medianos: la mediana de longitud del corpus es de 26 tokens y el percentil 99 de 179 tokens, con truncamiento a 128 tokens.
- Salida de etiqueta y puntuación de confianza mediante el pipeline `text-classification` de transformers.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades generativas, de código, matemáticas, visión ni audio.
- No dispone de modo thinking ni capacidades multimodales.
- El multilingüismo es nulo más allá del portugués: el vocabulario y el preentrenamiento son específicos de pt-BR.

## Casos de uso

- Moderación y análisis de reseñas en marketplaces: clasificar automáticamente las opiniones de producto en positivas y negativas para alimentar paneles de satisfacción y alertas de calidad, aprovechando que el modelo fue entrenado exactamente sobre el dominio B2W-Reviews01.
- Enrutamiento de tickets de atención al cliente: detectar el tono negativo de un mensaje entrante en portugués y priorizarlo o derivarlo a un agente humano, con la ventaja de que el modelo es ligero y puede ejecutarse en CPU con baja latencia.
- Monitorización de reputación de marca en redes sociales y foros brasileños: procesar grandes volúmenes de texto corto en pt-BR por lotes, dado el bajo coste computacional de un encoder de 108 M de parámetros.
- Extracción de señal de sentimiento para sistemas de recomendación: incorporar la polaridad de las reseñas como característica en un ranking de productos, filtrando reseñas negativas para calcular puntuaciones agregadas.
- Análisis de encuestas de satisfacción (NPS) con respuesta abierta: clasificar comentarios libres en portugués para segmentar detractores y promotores, con truncamiento a 128 tokens suficiente para la mayoría de respuestas breves.
- Filtrado previo en pipelines de datos: descartar o etiquetar automáticamente reseñas negativas antes de un análisis más costoso con un LLM generativo, reduciendo el coste total del pipeline.
- Investigación en NLP para portugués: servir como baseline de clasificación de sentimiento en pt-BR con métricas de test publicadas y reproducibles.

## Benchmarks y rendimiento

El autor publica métricas de validación y test sobre el dataset B2W-Reviews01. No se aportan comparaciones con otros modelos en la información disponible.

| Conjunto | Accuracy | Precision | Recall | F1 | Macro F1 |
|---|---:|---:|---:|---:|---:|
| Validación | 97,25% | 98,22% | 97,88% | 98,05% | 96,69% |
| Test | 96,92% | 97,95% | 97,68% | 97,81% | 96,29% |

Desempeño por clase en test:

| Clase | Precision | Recall | F1 |
|---|---:|---:|---:|
| NEGATIVO | 94,45% | 95,09% | 94,77% |
| POSITIVO | 97,95% | 97,68% | 97,81% |

Matriz de confusión en test: 3.100 negativas correctas, 160 negativas clasificadas como positivas, 182 positivas clasificadas como negativas y 7.647 positivas correctas.

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,44 GB solo para pesos (108,9 M de parámetros × 4 bytes), más activaciones y overhead del runtime; en la práctica, menos de 1 GB.
- VRAM estimada en FP16: aproximadamente 0,22 GB para pesos; en INT8, aproximadamente 0,11 GB.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM es suficiente; una RTX 3060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas GPU y se aprovecha mejor en lotes grandes.
- Cabe holgadamente en cualquier GPU de consumo, e incluso en CPU: es viable ejecutarlo en un portátil sin GPU dedicada para inferencia por lotes moderados.
- Opciones de despliegue: pipeline de transformers, Text Embeddings Inference (el repo está marcado como `text-embeddings-inference` y `endpoints_compatible`), ONNX Runtime, TorchScript y cuantización dinámica INT8 con PyTorch. No se documenta soporte GGUF ni llama.cpp, aunque la conversión sería técnicamente posible.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU y aceptable en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| caio16dev/bertimbau-sentiment-ptbr | 108,9 M | 128 tokens (entrenamiento) | Clasificación de sentimiento binaria pt-BR | no disponible | Hugging Face |
| neuralmind/bert-base-portuguese-cased | 108,9 M | 512 tokens | Modelo base de propósito general pt-BR (no clasificador) | no disponible en la información | Hugging Face |
| BERTimbau large (neuralmind/bert-large-portuguese-cased) | ~335 M | 512 tokens | Modelo base pt-BR, requiere fine-tuning para sentimiento | no disponible en la información | Hugging Face |
| Modelos de sentimiento pt-BR genéricos en Hugging Face | variable | variable | Clasificación de sentimiento pt-BR | variable | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y disponibilidad.

## Limitaciones y advertencias

- Dominio restringido: entrenado exclusivamente con reseñas de e-commerce de B2W; el rendimiento puede degradarse en otros dominios (noticias, redes sociales, texto jurídico) y en registros lingüísticos distintos.
- Clasificación binaria con eliminación de la clase neutra: las reseñas de 3 estrellas se descartaron, por lo que el modelo no tiene una categoría neutra y forzará una polaridad incluso en textos ambiguos.
- Desbalance de clases: el corpus es 70,60% positivo, lo que puede sesgar las predicciones hacia la clase positiva en casos límite; el Macro F1 (96,29% en test) refleja este efecto frente al F1 ponderado (97,81%).
- Truncamiento a 128 tokens: textos más largos se recortan y pueden perder información relevante; el percentil 99 del corpus es de 179 tokens, por lo que una fracción pequeña de reseñas se trunca.
- Riesgo de alucinación no aplica en sentido generativo, pero sí existe riesgo de clasificación errónea en textos irónicos, sarcásticos o con negaciones complejas, no documentado por el autor.
- Licencia no declarada: la ausencia de licencia explícita impide confirmar si el uso comercial está permitido; es un caveat importante para producción.
- Idiomas: solo portugués brasileño; no debe usarse con portugués europeo ni con otros idiomas sin validación previa.
- Sin métricas de calibración ni evaluación de sesgos demográficos o de género publicadas.
- Modelo con 0 descargas y 1 like en el momento de la ficha: no hay evidencia de uso en producción ni validación independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caio16dev/bertimbau-sentiment-ptbr
- Modelo base BERTimbau: https://huggingface.co/neuralmind/bert-base-portuguese-cased
- Dataset B2W-Reviews01: https://huggingface.co/datasets/ruanchaves/b2w-reviews01
- Paper de BERTimbau (Souza et al.): https://arxiv.org/abs/2009.07520
