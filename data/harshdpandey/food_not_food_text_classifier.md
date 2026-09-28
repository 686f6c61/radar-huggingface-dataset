# harshdpandey/food_not_food_text_classifier

## Resumen

`harshdpandey/food_not_food_text_classifier` es un clasificador binario de texto que distingue si una frase trata sobre comida o no. Se trata de un fine-tuning de `distilbert/distilbert-base-uncased`, la versión destilada de BERT con 6 capas y 66.955.010 parámetros totales (cifra real extraída de los pesos en safetensors), publicado por el usuario harshdpandey bajo licencia Apache 2.0. El modelo se generó automáticamente con el `Trainer` de Hugging Face, por lo que la model card es una plantilla sin descripción funcional redactada por el autor.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un caso típico de clasificador de dominio muy estrecho (dos etiquetas, food / not food), entrenado sobre un conjunto de datos que la propia model card describe como desconocido ("unknown dataset"). Los resultados declarados en el registro de entrenamiento son de accuracy 1.0 y loss 0.0 desde la primera época, lo que apunta a un dataset muy pequeño y probablemente sintético, sin partición de validación representativa. No debe interpretarse como una métrica de generalización real.

El modelo se distribuye en formato safetensors y es compatible con `transformers` y con los endpoints de inferencia de Hugging Face. Dado su tamaño (0,3 GB de repositorio), es desplegable en CPU y en cualquier GPU de consumo, e incluso en dispositivos embebidos, lo que lo hace útil como componente auxiliar de filtrado o enrutado dentro de pipelines mayores, nunca como clasificador de producción sin una evaluación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilacion de BERT: 6 capas, 12 cabezas de atencion, hidden size 768) con cabeza de clasificacion de 2 etiquetas |
| Parametros totales | 66.955.010 (dato real de safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (heredada de `distilbert-base-uncased`; no confirmada explicitamente en la model card) |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos safetensors en el precision de entrenamiento) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el modelo base es `distilbert-base-uncased`, entrenado principalmente en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Tarea | text-classification (binaria: food / not food) |
| Modelo base | distilbert/distilbert-base-uncased |
| Tamano del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Etiquetas adicionales | endpoints_compatible, generated_from_trainer, region:us |

## Arquitectura y entrenamiento

La arquitectura es un DistilBERT estándar: un encoder transformer de 6 capas con 12 cabezas de atención, dimensión oculta de 768 y embeddings posicionales aprendidos hasta 512 tokens. DistilBERT se obtiene mediante destilación del conocimiento de BERT-base, conservando aproximadamente el 97 % del rendimiento del profesor con un 40 % menos de parámetros y siendo unas 1,6 veces más rápido en inferencia en GPU. Sobre el encoder se añade una cabeza lineal de clasificación para dos clases, que es la única parte entrenada desde cero en este fine-tuning.

El entrenamiento se realizó con el `Trainer` de Hugging Face durante 10 épocas completas, con un total de solo 70 pasos de optimización, learning rate 1e-4, batch size 32 (train y eval), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, y scheduler lineal. El número tan bajo de pasos implica que el conjunto de entrenamiento contiene un número muy reducido de ejemplos, coherente con la descripción de la demo asociada (una Space externa menciona 250 captions sintéticas de comida / no comida generadas por un LLM). No se documenta ninguna técnica de RLHF, DPO ni decodificación especulativa, ni tampoco la composición exacta del dataset, que la model card deja como "unknown dataset". Las versiones declaradas de framework son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 5.0.1 y Tokenizers 0.23.1.

## Capacidades

- Clasificación de texto binaria: asigna una de dos etiquetas (comida / no comida) a una frase o fragmento de texto corto.
- Inferencia rápida en CPU: con 67 M de parámetros, el coste por inferencia es de decenas de milisegundos en CPU moderna.
- Integración directa con `pipeline("text-classification")` de `transformers` y con los endpoints de Hugging Face.
- Salida con puntuación de confianza (logits normalizados) además de la etiqueta, explotable para umbrales de decisión personalizados.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni modo "thinking".
- No tiene capacidades de generación de texto, código, matemáticas, visión ni audio.
- Capacidades multilingües: no declaradas; el modelo base es un modelo uncased de dominio mayoritariamente inglés.

## Casos de uso

- Filtrado previo de contenidos en redes sociales o foros: clasificar comentarios cortos para etiquetar automáticamente hilos culinarios y separarlos de otros temas, con una latencia mínima al ser un modelo de 67 M de parámetros ejecutable en CPU.
- Enrutado en pipelines RAG: usar la etiqueta como señal para dirigir consultas de usuario hacia una base de conocimiento gastronómica o hacia otro índice, aprovechando que la inferencia cabe holgadamente dentro de un servicio de enrutado de baja latencia.
- Moderación de catálogos de imágenes con metadatos textuales: las captions o títulos asociados a imágenes se clasifican como relativas a comida, lo que permite prefiltrar datasets multimodales antes de aplicar modelos de visión mucho más costosos.
- Etiquetado asistido de datasets: generar etiquetas preliminares sobre grandes volúmenes de captions para revisión humana posterior, útil por su velocidad y por poder ejecutarse en local sin GPU.
- Prototipos docentes y demos de NLP: sirve como ejemplo mínimo de fine-tuning de DistilBERT con el `Trainer`, adecuado para ilustrar un pipeline completo de clasificación binaria en un curso o taller.
- Preclasificador en sistemas de recomendación de recetas: separar consultas o títulos relacionados con alimentación del resto del tráfico antes de invocar un motor de recomendación específico.
- Automatización de etiquetado en hojas de cálculo o bases de datos: proceso batch nocturno sobre columnas de texto libre para añadir una columna booleana `es_comida` sin coste de GPU.

## Benchmarks y rendimiento

El campo `model-index` de la model card está vacío (`results: []`), por lo que no hay benchmarks estándar (MMLU, GLUE, etc.) publicados. Los únicos datos disponibles son los del registro de entrenamiento, declarados por el propio autor:

| Epoca | Paso | Training loss | Validation loss | Accuracy |
|---|---|---|---|---|
| 1.0 | 7 | 0.0003 | 0.0000 | 1.0 |
| 2.0 | 14 | 0.0000 | 0.0000 | 1.0 |
| 3.0 | 21 | 0.0000 | 0.0000 | 1.0 |
| 4.0 | 28 | 0.0000 | 0.0000 | 1.0 |
| 5.0 | 35 | 0.0000 | 0.0000 | 1.0 |
| 6.0 | 42 | 0.0000 | 0.0000 | 1.0 |
| 7.0 | 49 | 0.0000 | 0.0000 | 1.0 |
| 8.0 | 56 | 0.0000 | 0.0000 | 1.0 |
| 9.0 | 63 | 0.0000 | 0.0000 | 1.0 |
| 10.0 | 70 | 0.0000 | 0.0000 | 1.0 |

Advertencia: una accuracy de 1.0 y una loss de 0.0000 desde la primera época, junto con solo 70 pasos de entrenamiento, indican un conjunto de evaluación diminuto o idéntico al de entrenamiento, y no un rendimiento generalizable. No se han publicado resultados de benchmarks independientes en la información disponible.

## Requisitos de hardware

- VRAM para inferencia: aproximadamente 0,27 GB en FP32 (67 M parámetros × 4 bytes), 0,13 GB en FP16/BF16 y unos 0,07 GB en INT8. Sumando activaciones y overhead del runtime, un presupuesto de 0,5-1 GB es más que suficiente.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; funciona en GTX 1050, GTX 1650, RTX 3060, RTX 4090, T4, A100 y H100. No requiere GPU dedicada.
- Cabe en GPU de consumo: sí, en todas las GPU de consumo de los últimos diez años, y también en CPU (x86 o ARM), Raspberry Pi 4/5 y dispositivos móviles mediante exportación a ONNX.
- Fine-tuning: viable en una única GPU de consumo con 6-8 GB de VRAM (por ejemplo RTX 3060 o RTX 4060) con batch size moderado, o incluso en CPU con paciencia dado el tamaño del dataset.
- Opciones de despliegue: `transformers` (PyTorch), `text-embeddings-inference` y endpoints de Hugging Face (el modelo está marcado como `endpoints_compatible`), ONNX Runtime, TorchScript, FastAPI + Uvicorn, y exportación a llama.cpp es inviable porque no es un modelo generativo. vLLM y TGI están orientados a modelos generativos y no aportan ventaja aquí.
- Latencia y throughput: no se han publicado mediciones. Por el tamaño del modelo, cabe esperar latencias del orden de unidades a decenas de milisegundos por lote en GPU y de decenas de milisegundos en CPU para frases cortas, pero son estimaciones, no datos verificados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| harshdpandey/food_not_food_text_classifier | 66,96 M | 512 tokens | Clasificacion binaria food / not food | Apache 2.0 | Hugging Face, 0 descargas |
| distilbert/distilbert-base-uncased | 66,36 M | 512 tokens | Modelo base (requiere fine-tuning) | Apache 2.0 | Hugging Face, muy difundido |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Modelo base (requiere fine-tuning) | Apache 2.0 | Hugging Face, muy difundido |
| Classifier de la Space adamNLP (`hf_food_not_food_text_classifier_with_distilbert_demo`) | no disponible | no disponible | Clasificacion binaria food / not food | no disponible | Hugging Face Spaces (demo) |
| gokulan006/Food-Not-Food-Not-Classifier | no disponible | no disponible | Clasificacion binaria food / not food | no disponible | GitHub (proyecto de codigo) |

El modelo es esencialmente un DistilBERT-base con una cabeza de dos clases, por lo que su comparación natural es contra el propio modelo base sin fine-tuning (que no resuelve la tarea) y contra BERT-base, que ofrece algo más de capacidad a cambio de un 64 % más de parámetros y mayor latencia. Frente a las otras implementaciones de la misma tarea food / not food, no hay métricas comparables publicadas ni pesos verificables en la información disponible.

## Limitaciones y advertencias

- Riesgo de alucinación no aplica en sentido generativo (el modelo no genera texto), pero sí existe riesgo de clasificaciones erróneas con alta confianza fuera de la distribución de entrenamiento.
- La accuracy de 1.0 declarada es sospechosa: 70 pasos de entrenamiento y loss 0.0000 sugieren un dataset sintético muy pequeño, probablemente sin separación real entre train y eval. No debe usarse como estimación de rendimiento en producción.
- La model card no documenta el dataset, la composición de clases, el preprocesamiento ni los criterios de etiquetado ("More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento).
- Sesgos conocidos: no documentados. Al derivar de `distilbert-base-uncased`, hereda los sesgos de su corpus de preentrenamiento (mayoritariamente inglés y de dominio web).
- Limitación de idioma: el autor no declara idiomas soportados; el modelo base está entrenado principalmente en inglés, por lo que el comportamiento en castellano u otros idiomas es desconocido y probablemente degradado.
- Limitación de contexto: 512 tokens. Frases o párrafos más largos se truncan, lo que puede eliminar la parte relevante del texto.
- Frontera de decisión difusa: expresiones como "me encanta el cine y las palomitas" pueden caer en cualquiera de las dos clases; el modelo es binario y no ofrece categorías intermedias.
- Licencia Apache 2.0: permite uso comercial y modificación con atribución, pero al ser un derivado de `distilbert-base-uncased` conviene verificar el cumplimiento de las condiciones del modelo base, también Apache 2.0.
- El repositorio tiene 0 descargas y 0 likes, sin validación por parte de la comunidad ni issues públicos; no hay garantía de mantenimiento.
- Las fechas de creación y actualización del repositorio aparecen como septiembre de 2026, posteriores a la fecha de otras referencias del ecosistema; conviene verificar la procedencia antes de integrarlo en un pipeline crítico.
- Para cualquier uso real se recomienda reentrenar con un dataset propio etiquetado y una partición de validación independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/harshdpandey/food_not_food_text_classifier
- Modelo base: https://huggingface.co/distilbert/distilbert-base-uncased
- Space de demostración (adamNLP): https://huggingface.co/spaces/adamNLP/hf_food_not_food_text_classifier_with_distilbert_demo
- README de la Space: https://huggingface.co/spaces/adamNLP/hf_food_not_food_text_classifier_with_distilbert_demo/blob/main/README.md
- Repositorio GitHub (gokulan006): https://github.com/gokulan006/Food-Not-Food-Not-Classifier
- Notebook en GitHub (turtlemb): https://github.com/turtlemb/Hugging-Face-food-not-food-text-classifier/blob/main/hugging_face_text_classification_AI_model.ipynb
- Ficha del autor (Peter Junior Andrew): https://peterjuniorandrew.com/food-not-food-classifier
