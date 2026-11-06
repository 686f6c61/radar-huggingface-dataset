# Oleks333/mountain-ner-bert

## Resumen

mountain-ner-bert es un modelo de reconocimiento de entidades nombradas (NER) especializado en detectar nombres de montañas en texto en inglés. Ha sido desarrollado por el usuario Oleks333 y publicado en Hugging Face como un fine-tuning del clásico `bert-base-cased` de Google, con etiquetado en formato BIO (etiquetas `O`, `B-MOUNTAIN` e `I-MOUNTAIN`). El modelo se entrena sobre un corpus sintético de aproximadamente 1.200 frases generadas con ayuda de un modelo de OpenAI, a partir de nombres de montañas extraídos de listas de Wikipedia.

Su relevancia es principalmente de nicho: resuelve una tarea muy específica (extracción de topónimos de tipo montaña) que los NER genéricos como los basados en CoNLL no cubren, y resulta útil como componente ligero en pipelines de extracción de información geográfica, indexación de contenido de montañismo o enriquecimiento de textos de viaje. Con unos 108 millones de parámetros y un tamaño de repositorio de 0,4 GB, es un modelo pequeño que puede ejecutarse en CPU sin dificultad, lo que lo hace accesible para integraciones sencillas.

Cabe destacar que se trata de un proyecto personal con muy poca tracción (18 descargas y 1 like en el momento de la ficha) y que sus métricas publicadas (F1 de 0,995) provienen de un conjunto de test sintético de la misma distribución que el entrenamiento, por lo que el rendimiento en texto real será notablemente inferior, según reconoce el propio autor en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BERT (encoder transformer) fine-tuned para token classification |
| Parametros totales | 107.721.987 |
| Parametros activos | no disponible (no es MoE; todos los parámetros están activos) |
| Longitud de contexto | 512 tokens (heredada de bert-base-cased; no confirmada en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-cased`, un encoder transformer de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, y añade una cabeza de clasificación de tokens para la tarea de NER con esquema BIO de tres etiquetas. Al ser un encoder, no genera texto: su salida son etiquetas por token con puntuaciones de confianza, que la librería `transformers` puede agregar a nivel de entidad mediante `aggregation_strategy`.

El entrenamiento se realizó sobre aproximadamente 1.000 frases sintéticas que contienen exactamente una montaña cada una (los nombres provienen de listas raspadas de Wikipedia y las frases fueron generadas con un modelo de OpenAI), más unas 200 frases negativas sin montañas. La división fue 80/10/10 para entrenamiento, validación y test. Los hiperparámetros publicados son: 3 épocas, tamaño de batch 16 y learning rate 3e-5. No se menciona el uso de técnicas como RLHF, DPO ni decodificación especulativa, algo esperable al tratarse de un encoder de clasificación.

## Capacidades

- Detección de nombres de montañas en texto en inglés mediante etiquetado BIO (`O`, `B-MOUNTAIN`, `I-MOUNTAIN`).
- Clasificación a nivel de token con puntuaciones de confianza por entidad.
- Compatible con el pipeline `token-classification` de Hugging Face `transformers`, con agregación de entidades (por ejemplo, `aggregation_strategy="first"`).
- Detección de nombres multi-palabra (aunque con fallos documentados en nombres no vistos, como "Fitz Roy" cortado a "Roy").
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni agentes: es un modelo discriminativo de NER.

## Casos de uso

- Enriquecimiento de contenido de blogs de montañismo y viajes: extraer automáticamente menciones de montañas en artículos para generar enlaces internos, etiquetas o fichas geográficas asociadas.
- Indexación y búsqueda semántica: etiquetar corpus documentales (guías de escalada, diarios de expediciones) para permitir búsquedas filtradas por montaña mencionada.
- Extracción de datos de redes sociales y foros: procesar publicaciones de comunidades de senderismo para detectar qué cumbres se mencionan y analizar tendencias o popularidad de rutas.
- Preparación de datos para sistemas de geocodificación: usar las entidades detectadas como entrada de un geocoder para obtener coordenadas y construir mapas a partir de texto libre.
- Asistentes de planificación de rutas: como componente NLU ligero que identifica la montaña objetivo en la petición del usuario antes de consultar APIs de meteorología o de rutas.
- Curación de datasets de dominio geográfico: anotación automática asistida de menciones orográficas como paso previo a la revisión humana en proyectos de NLI o extracción de información.

## Benchmarks y rendimiento

Resultados publicados por el autor, medidos a nivel de entidad con `seqeval` sobre el split de test (120 frases):

| Metrica | Valor |
|---|---|
| Precision | 0,990 |
| Recall | 1,000 |
| F1 | 0,995 |

Advertencia importante: el split de test proviene de la misma distribución sintética que el entrenamiento, por lo que estas cifras no son representativas del rendimiento en texto real. No hay comparación publicada con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en FP32 (el modelo pesa unos 0,4 GB en safetensors); puede ejecutarse íntegramente en CPU.
- GPU recomendadas: ninguna en particular; cualquier GPU moderna es más que suficiente. No se requiere A100, H100 ni similares.
- Consumer GPUs: cabe con holgura en cualquier GPU de consumo (incluso integradas o portátiles); la inferencia en CPU es perfectamente viable para volúmenes moderados.
- Opciones de despliegue: librería `transformers` de Hugging Face (pipeline `token-classification`); al ser un modelo BERT estándar, es compatible con ONNX Runtime, TorchScript y servidores como Text Embeddings/Inference genéricos. No hay evidencia de soporte específico en vLLM, llama.cpp u Ollama (orientados a modelos generativos).
- Latencia y throughput estimados: no disponible; al ser un modelo de 108M de parámetros, se esperan latencias de pocos milisegundos por frase en GPU y decenas de milisegundos en CPU.

## Comparativa con modelos similares

| Modelo | Base | Tarea | Parametros | Licencia | Notas |
|---|---|---|---|---|---|
| Oleks333/mountain-ner-bert | bert-base-cased | NER de montañas (EN) | 107,7M | MIT | Entrenado con datos sintéticos; F1 0,995 en test sintético |
| dslim/bert-base-NER | bert-base-cased | NER genérico (PER, ORG, LOC, MISC) | 107,7M | MIT | No etiqueta montañas como clase específica, pero cubre LOC genérico |
| Jean-Baptiste/roberta-large-ner-english | roberta-large | NER genérico (EN) | 355M | MIT | Mayor y más preciso en NER genérico; mayor coste de inferencia |

No hay modelos comparables publicados específicamente para NER de montañas; la alternativa habitual sería usar un NER genérico y filtrar entidades LOC con un gazetteer o geocoder.

## Limitaciones y advertencias

- Rendimiento en texto real inferior al publicado: el test proviene de la misma distribución sintética que el entrenamiento (el propio autor lo advierte), por lo que el F1 de 0,995 debe tomarse como cota superior optimista.
- Fallos documentados: la segunda montaña de una frase a veces se omite; nombres multi-palabra no vistos en entrenamiento pueden truncarse ("Fitz Roy" detectado como "Roy"); nombres cortos como "K2" reciben baja confianza.
- Dataset muy pequeño (~1.200 frases) y sintético: la cobertura de nombres de montañas, estilos de escritura y dominios (noticias, redes sociales, texto técnico) es limitada.
- Solo inglés: no está diseñado para otros idiomas, pese a que muchos nombres de montañas aparecen en textos en castellano u otras lenguas.
- Contexto limitado a la longitud de BERT (típicamente 512 tokens), insuficiente para documentos largos sin fragmentación.
- Licencia MIT: sin restricciones para uso comercial, pero al ser un proyecto personal con mínima adopción (18 descargas), no hay garantías de mantenimiento, actualizaciones ni soporte.
- Riesgo de alucinación no aplicable (no es generativo), pero sí hay riesgo de falsos positivos/negativos en NER, especialmente fuera de dominio; se recomienda evaluación propia sobre datos reales antes de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Oleks333/mountain-ner-bert
- Código y datos (GitHub): https://github.com/Oleksandr190378/mountain-ner
- Modelo base: https://huggingface.co/google-bert/bert-base-cased
