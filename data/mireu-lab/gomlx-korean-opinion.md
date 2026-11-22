# Mireu-Lab/gomlx-korean-opinion

## Resumen

GoMLX Korean Opinion & Nuclear Feeling Models es una suite de seis checkpoints de clasificación multitarea para coreano, implementados íntegramente en Go (Go 1.27, GoMLX v0.28.38, onnx-gomlx v0.5.35, sin Python) por Mireu-Lab. El modelo resuelve tres tareas simultáneas sobre texto coreano: clasificación de temática periodística en 7 clases (basada en KLUE-YNAT), análisis de sentimiento binario (basado en NSMC) y una "checklist de sentimientos nucleares" de 16 categorías agrupadas en 8 familias de factores, además de un módulo de clustering semántico y de entidades entre dominios mediante HDBSCAN.

La suite no es un único transformer monolítico, sino un conjunto de arquitecturas comparadas sobre una misma cabeza multitarea: cinco modelos nativos de GoMLX (MLP con n-gramas, grafo de embeddings, CNN multiescala, transformer de 2 capas con RoPE y BiLSTM con atención) de entre 19M y 30M de parámetros, más un cabeza ReLU de 3,1M parámetros entrenada sobre embeddings congelados de 768 dimensiones de un RoBERTa coreano (leewaay/klue-roberta-base-klueNLI-klueSTS-MSL128) cargado vía ONNX. El checkpoint principal del repositorio es el transformer de 2 capas.

Su relevancia es doble: por un lado, demuestra que es posible entrenar y servir modelos de clasificación de texto coreano sin salir del ecosistema Go, con tiempos de entrenamiento de entre 15 segundos y 7 minutos en CPU (xla:cpu, 2 vCPU); por otro, introduce un esquema de anotación de sentimientos nucleares con validación de desambiguación de homónimos (por ejemplo, elimina el falso positivo de "ira" en titulares sobre pintura monocroma o exposiciones benéficas de mujeres artistas).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Suite de 6 arquitecturas: MLP ReLU con n-gramas de palabra y sílaba; grafo de embeddings con adaptador residual ReLU; CNN multiescala Conv1D [2,3,4] con AttentionPool; transformer de 2 capas con RoPE, RMSNorm y FFN ReLU; BiLSTM ragged con AttentionPool; cabeza ReLU sobre embeddings RoBERTa congelados (768d) vía onnx-gomlx |
| Parámetros totales | 19M (scratch_relu), 20M (ko_hub_graph), 29M (ko_hub_cnn_relu), 30M (ko_hub_transformer_relu), 29M (ko_hub_lstm_relu), 3,1M (cabeza onnx_backbone_relu) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (la model card no especifica longitud máxima de secuencia) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Coreano (ko) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | Checkpoints GoMLX nativos; pesos ONNX para el backbone externo; vocabulario en `vocab.json` (24.000 tokens con separación de partículas) |

## Arquitectura y entrenamiento

La suite se organiza en torno a un codificador estudiantil preentrenado de forma contrastiva (KO-Hub) sobre un grafo multilingüe de raíces léxicas de 74.578 nodos y 374.577 aristas, construido a partir de Unihan (hanja) y Open Multilingual WordNet para coreano, inglés, japonés y chino. El preentrenamiento usa Context-Aware Soft Edge InfoNCE con un margen de separación de homónimos durante 600 pasos, reduciendo la pérdida de 12,6445 a 5,8469 con una mediana de 16 ms por paso en xla:cpu. Sobre esta base se añade un tokenizador que separa partículas gramaticales coreanas (24.000 entradas de vocabulario) para preservar el orden de palabras.

Cada una de las cinco arquitecturas nativas se entrena durante 2.500 pasos (1.500 en el caso de BiLSTM y de la cabeza ONNX) con una cabeza multitarea y alineamiento CORAL para las etiquetas ordinales de la checklist de sentimientos. El modelo `onnx_backbone_relu` congela el RoBERTa base y entrena únicamente una cabeza ReLU de 3,1M parámetros sobre sus embeddings de 768 dimensiones, con un coste de codificación ONNX de 15m46s en CPU para el subconjunto de evaluación. La evaluación cubre el conjunto completo de validación de KLUE-YNAT (n=9.107), el test de NSMC (n=49.997) y la checklist NFC (26.461 supervisados / 19.650 activos) para los cinco modelos nativos, mientras que el modelo ONNX se evalúa sobre submuestras de 1.000 ejemplos por dominio (781/612 en NFC).

## Capacidades

- Clasificación de temática periodística en 7 clases (KLUE-YNAT): precisión del 75,91% y macro-F1 de 0,7575 en el mejor modelo (`ko_hub_cnn_relu`).
- Análisis de sentimiento binario (NSMC): exactitud del 83,60% y F1 de 0,8359 en `ko_hub_transformer_relu`.
- Checklist de sentimientos nucleares de 16 categorías en 8 familias de factores, con activación de 16/16 categorías en todos los modelos nativos.
- Detección de sentimiento activo (campo `nfc_activated`) para filtrar textos sin carga emocional relevante.
- Clustering semántico y de entidades entre dominios mediante HDBSCAN sobre espacios latentes reducidos con PCA (128d→24d).
- Desambiguación de homónimos validada en titulares con términos como "화가" (pintor frente a ira).
- Inferencia y entrenamiento en Go puro, sin dependencia de Python ni de PyTorch.
- No soporta tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido; es un modelo discriminativo de clasificación, no generativo.

## Casos de uso

- Monitorización de opinión pública: clasificación automática de titulares y artículos coreanos en 7 categorías temáticas y sentimiento binario, con umbrales de confianza por clase para alimentar paneles de medios.
- Análisis de sentimiento en reseñas de producto: el modelo `ko_hub_transformer_relu` alcanza 83,60% de exactitud en NSMC, adecuado para agregar sentimiento de comentarios de e-commerce con coste de inferencia de 180 ms por paso en CPU.
- Moderación de comunidades coreanas: uso del campo `nfc_activated` para priorizar mensajes con carga emocional alta (ira, tristeza, soledad) antes de la revisión humana.
- Investigación en humanidades digitales: la checklist de 16 sentimientos nucleares permite codificar corpus periodísticos con un esquema reproducible y validado contra falsos positivos de homónimos.
- Clustering de temas emergentes: agrupación HDBSCAN de 1.200 documentos (800 YNAT + 400 NSMC) con silhouette de 0,6938 y 62,5% de cobertura en el mejor modelo, útil para descubrir subtemas sin etiquetas.
- Despliegue en entornos sin Python: pipelines de datos en Go que necesitan clasificación de texto coreano dentro del mismo binario, sin contenedores de PyTorch ni servidores de inferencia adicionales.
- Prototipado rápido en hardware modesto: entrenamiento completo de un modelo en 15 segundos (scratch_relu) o 6m14s (transformer) en 2 vCPU, lo que permite iterar sobre el esquema de etiquetas en máquinas de desarrollo convencionales.

## Benchmarks y rendimiento

Resultados medidos en xla:cpu (2 vCPU / 3,8 GiB RAM) según la model card del autor:

| Modelo | YNAT Acc / Macro-F1 | NSMC Acc / F1 | NFC Recall@3 / Micro-F1 | Silhouette / Dunn_C |
|---|---:|---:|---:|---:|
| scratch_relu | 74,76% / 0,7462 | 83,39% / 0,8355 | 93,81% / 0,5438 | 0,6786 / 2,9383 |
| ko_hub_graph | 74,82% / 0,7474 | 83,52% / 0,8346 | 95,04% / 0,6487 | 0,4928 / 2,4043 |
| ko_hub_cnn_relu | 75,91% / 0,7575 | 83,58% / 0,8359 | 94,67% / 0,6311 | 0,6776 / 4,0664 |
| ko_hub_transformer_relu | 74,67% / 0,7461 | 83,60% / 0,8359 | 93,78% / 0,5711 | 0,6938 / 4,1647 |
| ko_hub_lstm_relu | 72,66% / 0,7272 | 82,84% / 0,8315 | 92,39% / 0,5316 | 0,6586 / 2,9131 |
| onnx_backbone_relu (submuestra n=1k) | 67,00% / 0,6738 | 80,70% / 0,8153 | 73,53% / 0,4297 (n=612) | 0,5357 / 2,1630 |

Tiempos de entrenamiento en xla:cpu: 15s (scratch_relu, 2.500 pasos a 4 ms), 17s (ko_hub_graph, 5 ms), 1m52s (ko_hub_cnn_relu, 17 ms), 6m14s (ko_hub_transformer_relu, 180 ms), 6m55s (ko_hub_lstm_relu, 237 ms) y 23s de cabeza más 15m46s de codificación ONNX (onnx_backbone_relu).

## Requisitos de hardware

- VRAM estimada: no disponible; el autor reporta ejecución en CPU con 3,8 GiB de RAM para todos los modelos.
- GPU recomendadas: no disponibles; las pruebas se realizaron exclusivamente en `xla:cpu`.
- Cabe en hardware de consumo: sí, con 2 vCPU y 3,8 GiB de RAM según las mediciones publicadas; no se han publicado pruebas en GPU de consumo.
- Opciones de despliegue: CLI `opinion-analyzer` del repositorio GitHub (Go), ejecutable con `go run ./cmd/opinion-analyzer analyze --backend xla:cpu --provider <modelo>`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia: 4-237 ms por paso de entrenamiento según arquitectura; codificación ONNX del backbone RoBERTa de 15m46s para el subconjunto de evaluación en CPU. Throughput de inferencia no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | YNAT | NSMC | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| goMLX ko_hub_cnn_relu | 29M | no disponible | 75,91% / 0,7575 | 83,58% / 0,8359 | CC BY-SA 4.0 | Hugging Face + GitHub |
| goMLX ko_hub_transformer_relu | 30M | no disponible | 74,67% / 0,7461 | 83,60% / 0,8359 | CC BY-SA 4.0 | Hugging Face + GitHub |
| leewaay/klue-roberta-base-klueNLI-klueSTS-MSL128 (modelo base) | no disponible | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| KLUE-RoBERTa-base (referencia del ecosistema KLUE) | ~110M | 512 tokens (típico) | no disponible en esta ficha | no disponible en esta ficha | no disponible | Hugging Face |

No se dispone de resultados de benchmarks de los modelos comparables en la información proporcionada; la comparación cuantitativa directa no está disponible.

## Limitaciones y advertencias

- Modelo discriminativo, no generativo: no produce texto, no razona de forma abierta ni soporta instrucciones en lenguaje natural.
- Solo coreano: no hay soporte multilingüe declarado pese a que el preentrenamiento KO-Hub usa recursos en KO/EN/JA/ZH.
- El modelo `onnx_backbone_relu` se evaluó sobre submuestras de 1.000 ejemplos, por lo que sus métricas no son directamente comparables con las de los modelos nativos evaluados sobre el conjunto completo.
- Riesgo de sesgo: los datos provienen de titulares periodísticos (YNAT) y reseñas de cine (NSMC), lo que puede introducir sesgos de dominio y de registro formal/informal.
- Riesgo de alucinación no aplica en sentido generativo, pero sí de clasificación errónea en textos ambiguos o fuera de dominio; el propio autor documenta falsos positivos residuales de "ira" en `scratch_relu` para titulares sobre arte.
- La licencia CC BY-SA 4.0 exige atribución y compartir igual las obras derivadas, lo que puede condicionar el uso comercial propietario.
- La longitud máxima de contexto no está documentada, lo que impide garantizar el comportamiento en documentos largos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y la librería GoMLX es poco común en producción, lo que reduce la comunidad de soporte.
- El pipeline de Hugging Face no está definido, por lo que la carga con `transformers` no está soportada de forma directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Mireu-Lab/gomlx-korean-opinion
- Dataset preprocesado: https://huggingface.co/datasets/Mireu-Lab/gomlx-korean-opinion-dataset
- Código fuente en GitHub: https://github.com/Mireu-Lab/gomlx-korean-opinion (rama `feature/ko-hub-multilingual-embedding`, issue #1)
- Borrador del paper (Google Docs): https://docs.google.com/document/d/1Lx5mZmT5xWHzr1CIL6H2AduXl7gQm07TCul_xntxR3c/edit
- Modelo base: https://huggingface.co/leewaay/klue-roberta-base-klueNLI-klueSTS-MSL128
- Contacto del proyecto: limmireu1214@gmail.com
