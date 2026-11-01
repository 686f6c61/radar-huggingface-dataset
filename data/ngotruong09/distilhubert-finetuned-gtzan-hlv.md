# ngotruong09/distilhubert-finetuned-gtzan-hlv

## Resumen

`distilhubert-finetuned-gtzan-hlv` es un modelo de clasificación de audio obtenido mediante fine-tuning supervisado de `ntu-spml/distilhubert` sobre el conjunto de datos GTZAN, que contiene fragmentos musicales etiquetados por género. Lo publica el usuario `ngotruong09` en HuggingFace y su propósito concreto es la clasificación automática de géneros musicales (music genre classification) a partir de audio en bruto. Con 23,69 millones de parámetros, es un modelo compacto pensado para inferencia ligera y despliegue en entornos con recursos limitados.

El modelo parte de DistilHuBERT, una versión destilada de HuBERT (Hidden-Unit BERT for speech representation learning) que conserva la arquitectura transformer del modelo original pero reduce el número de capas y parámetros. El fine-tuning se realizó con el `Trainer` de HuggingFace y los hiperparámetros quedan documentados en la model card: 10 épocas, learning rate 5e-5, batch de 8 y precisión mixta nativa (AMP). El resultado declarado es una accuracy de 0,85 sobre el conjunto de evaluación de GTZAN y una pérdida de validación de 0,6077.

Es relevante ahora porque representa un ejemplo típico de modelo pequeño y especializado, con licencia Apache 2.0, que puede ejecutarse en CPU o en GPU de consumo para tareas de etiquetado musical, indexación de catálogos o sistemas de recomendación. No obstante, la información publicada es escasa: la model card está generada automáticamente y contiene secciones marcadas como "More information needed", por lo que muchos datos técnicos no están disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (HuBERT destilado, `distilhubert` de ntu-spml) |
| Parametros totales | 23.691.402 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; ventana de entrada definida por la longitud de las características acústicas, no documentada en la model card) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan cuantizaciones oficiales) |
| Idiomas soportados | no disponible (clasificación de audio musical, no texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer encoder basado en HuBERT y destilado por el equipo de ntu-spml. HuBERT aprende representaciones de audio mediante predicción de unidades discretas ocultas (hidden units) extraídas de características MFCC, y DistilHuBERT reduce el coste computacional manteniendo la capacidad representacional. Sobre esta base, el autor ha añadido una cabeza de clasificación para las 10 clases de género de GTZAN y ha realizado un fine-tuning supervisado con el `Trainer` de Transformers.

Los detalles del entrenamiento documentados son: learning rate 5e-5, `train_batch_size` y `eval_batch_size` de 8, semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-8, scheduler lineal con 100 pasos de warmup, 10 épocas y precisión mixta nativa (AMP). El entrenamiento se ejecutó con Transformers 5.20.2, PyTorch 2.11.0+cu130, Datasets 4.8.5 y Tokenizers 0.23.3. No se documenta el número de tokens de audio, la composición exacta del dataset más allá de GTZAN, ni si hubo técnicas de aumento de datos o regularización adicionales. Tampoco se indica si se aplicó RLHF, DPO o cualquier otro ajuste por preferencias, algo esperable en un modelo de clasificación y no de generación.

## Capacidades

- Clasificación de audio en 10 categorías de género musical, correspondientes a las etiquetas de GTZAN (blues, classical, country, disco, hiphop, jazz, metal, pop, reggae, rock).
- Procesamiento de audio en bruto mediante el extractor de características asociado a DistilHuBERT.
- Inferencia ligera: con 23,69 M de parámetros, el modelo puede ejecutarse en CPU y en GPU de consumo.
- Integración con la librería `transformers` mediante el pipeline `audio-classification`.
- Compatible con endpoints de HuggingFace (tag `endpoints_compatible`).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un clasificador, no un modelo generativo.
- No dispone de capacidades multilingües ni de texto; su dominio es exclusivamente acústico-musical.
- No se documentan capacidades de visión, audio a texto, thinking mode ni otras modalidades.

## Casos de uso

- Etiquetado automático de catálogos musicales: dado un archivo de audio, el modelo devuelve una de las 10 etiquetas de género de GTZAN, lo que permite clasificar bibliotecas musicales de forma masiva sin intervención manual y con un coste computacional muy bajo.
- Sistemas de recomendación musical: la etiqueta de género predicha puede alimentar un motor de recomendación basado en contenido, combinándola con metadatos del artista o con embeddings del propio modelo para calcular similitud entre pistas.
- Indexación y búsqueda por género: en plataformas de streaming o archivos personales, el modelo permite construir índices por género que habilitan búsquedas filtradas y navegación temática sin depender de metadatos externos.
- Moderación y organización de contenido generado por usuarios: en servicios donde los usuarios suben audio, el modelo puede clasificar automáticamente el género para organizar, filtrar o aplicar políticas de contenido según la categoría.
- Investigación en music information retrieval (MIR): sirve como baseline reproducible y ligero para experimentos de clasificación de género, comparación de arquitecturas destiladas o evaluación de técnicas de aumento de datos.
- Prototipado rápido y demos: al ser un modelo de 23,69 M de parámetros con licencia Apache 2.0, es adecuado para demos en notebooks, aplicaciones web ligeras o pruebas de concepto en entornos sin GPU dedicada.
- Análisis de tendencias musicales: agregando las predicciones sobre grandes volúmenes de audio, se pueden estudiar distribuciones de género por región, época o plataforma, siempre que se asuma la granularidad limitada de 10 clases.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados, `verified: false`):

| Tarea | Dataset | Métrica | Valor |
|---|---|---|---|
| Audio Classification | GTZAN (`marsyas/gtzan`) | Accuracy | 0,85 |
| Audio Classification | GTZAN (evaluación) | Loss | 0,6077 |

Evolución del entrenamiento declarada por el autor:

| Época | Training loss | Validation loss | Accuracy |
|---|---|---|---|
| 1 | 1,8606 | 1,8668 | 0,49 |
| 2 | 1,2705 | 1,2509 | 0,68 |
| 3 | 1,0827 | 1,0456 | 0,73 |
| 4 | 0,7267 | 0,8592 | 0,76 |
| 5 | 0,6331 | 0,7087 | 0,79 |
| 6 | 0,4329 | 0,6839 | 0,79 |
| 7 | 0,2621 | 0,5815 | 0,84 |
| 8 | 0,1294 | 0,6285 | 0,83 |
| 9 | 0,1263 | 0,6109 | 0,85 |
| 10 | 0,0958 | 0,6077 | 0,85 |

No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (23,69 M de parámetros, aproximadamente 95 MB de pesos) más el overhead de activaciones, que depende de la longitud del audio de entrada.
- GPU recomendadas: cualquier GPU moderna es suficiente; una RTX 4090, A100 o H100 queda sobredimensionada para este modelo. Una GPU de consumo básica (GTX 1650, RTX 3050) o incluso CPU es suficiente para inferencia en tiempo real o por lotes.
- Cabe en cualquier GPU de consumo y en la mayoría de entornos CPU; el cuello de botella será la extracción de características del audio, no el modelo.
- Opciones de despliegue: `transformers` con el pipeline `audio-classification`, HuggingFace Inference Endpoints (tag `endpoints_compatible`) y exportación a ONNX si se desea optimizar la latencia en CPU. No se documenta soporte específico para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos generativos de texto.
- Latencia y throughput estimados: no disponibles en la información proporcionada. Dado el tamaño del modelo, se espera una latencia de milisegundos por fragmento en GPU y de decenas a cientos de milisegundos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ngotruong09/distilhubert-finetuned-gtzan-hlv` | 23,69 M | Clasificación de género (GTZAN) | Audio; longitud no documentada | Accuracy 0,85 en GTZAN (declarado, no verificado) | Apache 2.0 | HuggingFace |
| `ntu-spml/distilhubert` | no disponible en la información | Representación de audio (modelo base) | Audio | No aplica (modelo base, sin cabeza de clasificación) | no disponible en la información | HuggingFace |
| `facebook/hubert-base-ls960` | no disponible en la información | Representación de audio / ASR | Audio | No disponible en la información | no disponible en la información | HuggingFace |

No se dispone de datos suficientes en la información proporcionada para comparar con alternativas específicas de clasificación de género musical (por ejemplo, otros fine-tunings de HuBERT o Wav2Vec2 sobre GTZAN). Los valores de parámetros y rendimiento de los modelos comparables no están documentados en la información disponible.

## Limitaciones y advertencias

- La model card está generada automáticamente y contiene secciones vacías ("More information needed"), por lo que faltan detalles sobre usos previstos, limitaciones y composición del dataset.
- El resultado de accuracy 0,85 está marcado como `verified: false`; no ha sido validado de forma independiente.
- GTZAN es un dataset conocido por problemas de etiquetado y por posibles fugas entre train y test (fragmentos del mismo artista o canción en ambos conjuntos), lo que puede inflar las métricas reportadas.
- El modelo solo distingue 10 géneros; no cubre subgéneros, fusiones ni categorías fuera de esa taxonomía, y puede asignar etiquetas erróneas a audio que no sea música occidental de esos géneros.
- Riesgo de sesgo: el rendimiento puede degradarse en grabaciones de baja calidad, audio en directo, fragmentos cortos o música no representada en GTZAN.
- No es un modelo generativo, por lo que no alucina texto, pero sí puede producir clasificaciones erróneas con alta confianza; conviene calibrar o umbralizar las probabilidades en producción.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se recomienda conservar el aviso de licencia y verificar las condiciones del modelo base `ntu-spml/distilhubert`.
- No se documentan limitaciones de idioma porque el modelo no procesa texto; la noción de "idioma" no aplica.
- Para producción, conviene validar el modelo sobre datos propios y considerar el reentrenamiento con un dataset más amplio y con particiones train/test libres de fuga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ngotruong09/distilhubert-finetuned-gtzan-hlv
- Modelo base: https://huggingface.co/ntu-spml/distilhubert
- Dataset GTZAN en HuggingFace: https://huggingface.co/datasets/marsyas/gtzan
- Documentación de Transformers para audio classification: https://huggingface.co/docs/transformers/tasks/audio_classification
- Paper de HuBERT: https://arxiv.org/abs/2106.07447
- Paper de DistilHuBERT: https://arxiv.org/abs/2110.01900
