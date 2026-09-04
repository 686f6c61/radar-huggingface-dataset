# ayoubmatheux/sentiment-versioning-demo

## Resumen

`sentiment-versioning-demo` es un modelo de clasificación de sentimiento (text-classification) desarrollado por `ayoubmatheux`, obtenido mediante fine-tuning del modelo base `distilbert-base-uncased` sobre un conjunto de datos no especificado. Se trata de un proyecto de demostración, probablemente generado automáticamente a través de la librería `transformers` con el objeto `Trainer`, como indica la etiqueta `generated_from_trainer`. Su propósito es ofrecer una implementación sencilla y ligera para análisis de sentimiento, con un tamaño de 66.955.010 parámetros (unos 67 millones) y un peso total de 0,8 GB en formato `safetensors`.

La arquitectura corresponde a un transformer encoder (DistilBERT), una versión destilada de BERT que conserva la mayor parte de su capacidad con un coste computacional reducido. El modelo está diseñado para tareas de clasificación de texto, y hereda del modelo base una longitud de contexto de 512 tokens. La licencia es Apache 2.0, lo que permite uso comercial y modificación. Al ser un modelo pequeño, es adecuado para entornos con recursos limitados o para prototipado rápido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder) fine-tuned para clasificación de sentimiento |
| Parametros totales | 66.955.010 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens (heredado de `distilbert-base-uncased`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | No disponible; el modelo base `distilbert-base-uncased` está entrenado en inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `distilbert-base-uncased`, un transformer encoder de 6 capas, 768 dimensiones ocultas y 12 cabezas de atención, que fue destilado de BERT-base manteniendo aproximadamente el 97 % de su rendimiento con un 40 % menos de parámetros. Al ser un modelo encoder-only, no es apto para generación de texto libre, sino para tareas de clasificación o representaciones de texto.

El entrenamiento se realizó durante una única época con una tasa de aprendizaje de `2e-05`, tamaño de lote de 16 para entrenamiento y 32 para evaluación, optimizador AdamW con betas (0,9, 0,999) y programador de tasa lineal. Se utilizó la semilla 42. El conjunto de datos de entrenamiento y evaluación no está documentado en la model card. Según los resultados declarados por el autor, tras 125 pasos se obtuvo una pérdida de validación de `0.3502` y una exactitud de `0.854`. No se aplicaron técnicas de alineación como RLHF o DPO, ni se documentan innovaciones técnicas destacables.

## Capacidades

- Clasificación de sentimiento: el modelo asigna una etiqueta de sentimiento (probablemente positiva, negativa o neutral) a un texto de entrada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no declaradas; el modelo base está entrenado en inglés.
- Capacidades especiales (visión, audio, thinking mode): no disponibles.
- Inferencia rápida y ligera: al contar con solo 67 millones de parámetros, puede ejecutarse en CPU sin necesidad de GPU.

## Casos de uso

- Analisis de reseñas de productos: el modelo puede clasificar automáticamente miles de reseñas de comercio electrónico como positivas o negativas, permitiendo a los equipos de producto detectar problemas recurrentes.
- Monitorizacion de redes sociales: en un pipeline de scraping, el modelo puede etiquetar tweets o publicaciones por sentimiento para analizar la percepción de una marca en tiempo real.
- Clasificacion de tickets de soporte: los tickets de atención al cliente pueden preclasificarse según su tono, priorizando aquellos con sentimiento negativo para una respuesta rápida.
- Analisis de encuestas de satisfaccion: las respuestas abiertas de encuestas NPS o CSAT pueden clasificarse por sentimiento para cuantificar la satisfacción global.
- Deteccion de comentarios abusivos: en foros o secciones de comentarios, el modelo puede identificar mensajes con sentimiento extremadamente negativo como señal de posible toxicidad.
- Analisis de opiniones en noticias: para medios de comunicación, el modelo puede clasificar artículos o comentarios de lectores por tono, facilitando estudios de opinión pública.
- Prototipado de chatbots de soporte: el modelo puede integrarse como un componente de clasificación de intención emocional en un chatbot simple, aunque no genera texto por sí mismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los únicos datos declarados por el autor provienen del entrenamiento:

| Metrica | Valor |
|---|---|
| Pérdida de validación | 0,3502 |
| Exactitud | 0,854 |
| Épocas | 1 |
| Pasos | 125 |

Estos resultados corresponden a una sola ejecución de entrenamiento sobre un conjunto de datos no documentado. No se dispone de comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en FP32 se requieren aproximadamente 268 MB; en FP16, unos 134 MB. Para cargar el modelo con `transformers` en FP32, se necesita alrededor de 1 GB de memoria total contando activaciones.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluidas NVIDIA GTX 1650, RTX 3050, o GPUs integradas. También funciona en CPU.
- Soporte en GPU de consumo: sí, cabe en prácticamente cualquier tarjeta consumer moderna.
- Opciones de despliegue: puede servirse mediante la API de `transformers` (pipeline `text-classification`) en un entorno Python. No es compatible con `llama.cpp`, `Ollama` ni `vLLM`, ya que no es un modelo causal de lenguaje.
- Latencia estimada: en CPU, la inferencia para frases cortas suele estar en el rango de 5-20 ms por muestra; en GPU, por debajo de 1 ms. Estos valores son orientativos y dependen del hardware y del lote.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `distilbert-base-uncased` (base) | 66.955.010 | 512 | Apache 2.0 | HuggingFace |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66.955.010 | 512 | Apache 2.0 | HuggingFace |
| `cardiffnlp/twitter-roberta-base-sentiment` | ~125 M | 512 | MIT | HuggingFace |
| `ayoubmatheux/sentiment-versioning-demo` | 66.955.010 | 512 | Apache 2.0 | HuggingFace |

El modelo es comparable a otros fine-tunes de DistilBERT para sentimiento, como el fine-tune de SST-2. No se dispone de benchmarks públicos que permitan comparar su rendimiento real con estas alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo base `distilbert-base-uncased` hereda sesgos presentes en los datos de preentrenamiento de BERT, que pueden reflejarse en la clasificación de sentimiento.
- Riesgo de alucinacion: al ser un clasificador, no genera texto, por lo que el riesgo de alucinación se limita a la asignación incorrecta de etiquetas.
- Limitaciones de contexto: la ventana de 512 tokens restringe el análisis a fragmentos de texto cortos o medianos; no puede procesar documentos largos de una sola pasada.
- Limitaciones de idioma: el modelo está pensado para inglés; su rendimiento en otros idiomas es impredecible y probablemente deficiente.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación, pero requiere conservar el aviso de licencia y los archivos NOTICE si los hubiera.
- Dataset de entrenamiento no documentado: la falta de información sobre los datos de entrenamiento impide evaluar la generalización del modelo o su comportamiento en dominios específicos.
- Uso en producción: al ser una demo con una sola época de entrenamiento y sin evaluaciones externas, no se recomienda su uso directo en sistemas críticos sin una validación adicional.

## Enlaces

- HuggingFace: https://huggingface.co/ayoubmatheux/sentiment-versioning-demo
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Documentación de `transformers` para text-classification: https://huggingface.co/docs/transformers/training
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la información proporcionada.
