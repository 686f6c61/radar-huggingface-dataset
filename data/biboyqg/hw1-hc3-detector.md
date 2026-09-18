# BiboyQG/hw1-hc3-detector

## Resumen

HW1 HC3 Detector es un clasificador binario de texto en inglés desarrollado por el usuario BiboyQG como entrega de la asignatura CS546. Se trata de un ajuste fino (fine-tuning) completo del encoder `sentence-transformers/all-MiniLM-L6-v2` sobre el corpus HC3 (Hello-SimpleAI/HC3), y su tarea es distinguir si una respuesta fue escrita por una persona (etiqueta 0) o generada por ChatGPT (etiqueta 1). El modelo tiene 22.713.986 parámetros y un peso en disco de aproximadamente 0,1 GB, por lo que es muy ligero.

El problema que aborda es la detección de texto generado por IA en el dominio concreto de respuestas a preguntas, un área relevante para la curación de datasets, la investigación sobre procedencia de contenido y la evaluación de la calidad de corpus sintéticos. Su relevancia es sobre todo metodológica y educativa: proporciona una referencia reproducible con particiones train/validation/test disjuntas por pregunta (37.334 / 4.666 / 4.668 ejemplos) y métricas verificables.

Arquitectónicamente es un transformer encoder de 6 capas heredado del modelo base, con una cabeza de clasificación de secuencias. No es un modelo generativo ni un modelo de razonamiento: únicamente emite una decisión de clasificación sobre los primeros 256 tokens del texto de entrada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (familia BERT, MiniLM-L6) con cabeza de clasificacion de secuencias |
| Parametros totales | 22.713.986 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 256 tokens (longitud maxima empleada en el entrenamiento; el modelo base esta configurado para 256) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en precision completa; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | ingles (en) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de `sentence-transformers/all-MiniLM-L6-v2` (revision `1110a243fdf4706b3f48f1d95db1a4f5529b4d41`) y anade una cabeza de clasificacion binaria. En el ajuste fino se actualizaron todos los parametros del transformer con AdamW (learning rate 2e-05, weight decay 0.01), batch size 32, longitud maxima de 256 tokens, 5 epocas completas y semilla 42. El entrenamiento se ejecuto en dispositivo MPS con PyTorch 2.8.0, Transformers 4.57.1, SentenceTransformers 5.1.2, Datasets 4.1.1 y scikit-learn 1.7.2. La perdida media por batch registrada fue de 0,022178 y la validacion se monitorizo tras cada epoca; el artefacto subido corresponde a la quinta y ultima epoca, sin usar el conjunto de test para seleccionar checkpoint ni hiperparametros.

Los datos provienen de la revision inglesa del corpus HC3 (`4d0ff18143b5a7e1b1e79beb540c04549d1e59d3`), tomando la primera respuesta no vacia de cada clase por pregunta. La preparacion excluye preguntas vacias, pares de respuesta ausentes o identicos y preguntas repetidas. La particion se realizo sobre preguntas normalizadas en proporcion 80/10/10 con semilla 42 antes de aplanar las respuestas, garantizando que ninguna pregunta aparece en mas de un split. No se documenta el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, dado que no es un modelo generativo.

## Capacidades

- Clasificacion binaria de texto en ingles: devuelve etiqueta 0 (humano) o 1 (ChatGPT) sobre el contenido de una respuesta.
- Deteccion de texto generado por IA en el dominio especifico de respuestas a preguntas del corpus HC3.
- Procesamiento de entradas de hasta 256 tokens, con truncado del resto.
- Ejecucion en CPU y en GPU de gama baja gracias a sus 22,7 millones de parametros.
- Integracion con la libreria transformers como pipeline de `text-classification`.
- Compatibilidad declarada con text-embeddings-inference y con endpoints (etiqueta `endpoints_compatible`).
- No dispone de tool calling, function calling, soporte de agentes, capacidades multimodales ni modo de razonamiento extendido.
- No soporta otros idiomas distintos del ingles ni otros dominios fuera del evaluado.

## Casos de uso

- Curación de datasets de instrucciones: filtrar pares pregunta-respuesta de origen sintetico antes de usar un corpus para entrenamiento, aprovechando que el modelo fue entrenado especificamente sobre el esquema de respuestas del corpus HC3.
- Auditoria de corpus historicos de PLN: replicar el experimento de deteccion de Guo et al. (2023) sobre la revision inglesa de HC3 con una particion reproducible por pregunta y semilla 42.
- Triage en revision academica: marcar respuestas sospechosas de generacion automatica para revision humana posterior, siempre como senal auxiliar y nunca como prueba concluyente.
- Control de calidad en plataformas de contenido colaborativo: detectar respuestas de aspecto sintetico en foros de preguntas y respuestas en ingles para priorizar moderacion manual.
- Investigacion sobre sesgos de detectores: usar las matrices de confusion publicadas (2265/69/0/2334 en el modelo ajustado) como punto de partida para estudiar falsos positivos en texto humano.
- Docencia y practicas de ingenieria de machine learning: servir como ejemplo reproducible de ajuste fino completo sobre un encoder pequeno, con particionado a nivel de pregunta para evitar filtraciones.
- Benchmark interno de tecnicas de clasificacion: comparar el ajuste fino completo frente a la linea base de embeddings congelados mas regresion logistica sobre el mismo split.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos sobre el conjunto de test de 4.668 ejemplos:

| Modelo | Exactitud en test | Precision macro | Recall macro | F1 macro |
|---|---:|---:|---:|---:|
| Embeddings congelados + regresion logistica | 0,844901 | 0,845073 | 0,844901 | 0,844882 |
| Clasificador ajustado (este modelo) | 0,985219 | 0,985643 | 0,985219 | 0,985215 |

Matrices de confusion (filas = etiqueta real, columnas = etiqueta predicha; humano, ChatGPT):

| Modelo | Matriz |
|---|---|
| Linea base | [[1946, 388], [336, 1998]] |
| Ajustado | [[2265, 69], [0, 2334]] |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni similares) en la informacion disponible, algo esperable al tratarse de un clasificador y no de un modelo generativo.

## Requisitos de hardware

- VRAM estimada: aproximadamente 90 MB en FP32 y unos 45 MB en FP16 para los 22,7 millones de parametros, mas el overhead del runtime. Cabe con holgura en cualquier GPU con 1 GB o mas de memoria.
- GPU recomendadas: cualquier GPU moderna sirve; no requiere A100 ni H100. Una NVIDIA T4, GTX 1650, RTX 3060 o superior es mas que suficiente. Tambien funciona en Apple Silicon mediante MPS, que es el dispositivo usado en el entrenamiento.
- Inferencia en CPU: viable sin GPU dedicada, dado el tamano del modelo y la longitud maxima de 256 tokens.
- Despliegue: pipeline de `transformers` para `text-classification`; la model card declara compatibilidad con text-embeddings-inference y con endpoints. No se documentan configuraciones para vLLM, llama.cpp u Ollama, y el formato safetensors no es directamente utilizable por llama.cpp sin conversion adicional (no disponible en el repositorio).
- Latencia y throughput: no disponibles. No se publican mediciones de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hw1-hc3-detector (BiboyQG) | 22.713.986 | 256 tokens | F1 macro 0,985215 en HC3 test | apache-2.0 | HuggingFace, 0 descargas |
| Embeddings congelados de all-MiniLM-L6-v2 + regresion logistica | 22.713.986 (encoder compartido) | 256 tokens | F1 macro 0,844882 en HC3 test | apache-2.0 | reproduccion descrita en la model card |
| Otros detectores de texto generado por IA (por ejemplo variantes basadas en RoBERTa o DeBERTa) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion proporcionada |

El unico punto de comparacion con datos medidos en el mismo conjunto de test es la linea base de embeddings congelados descrita por el propio autor; cualquier comparacion con detectores comerciales o academicos externos carece de datos verificables en la informacion disponible.

## Limitaciones y advertencias

- Se trata de un clasificador educativo evaluado sobre un benchmark historico y balanceado (HC3); el propio autor advierte que puede haber aprendido senales especificas del dataset, de la fuente o de la longitud de los textos.
- No esta validado frente a modelos de lenguaje actuales, otras lenguas ni otros dominios, por lo que su exactitud fuera de HC3 es desconocida.
- Puede producir falsos positivos: la matriz de confusion del modelo ajustado muestra 69 respuestas humanas clasificadas como ChatGPT.
- No debe usarse como evidencia fiable de que un estudiante haya empleado IA. La model card lo indica de forma explicita.
- Solo procesa ingles y trunca las entradas a 256 tokens, de modo que la informacion mas alla de ese limite se descarta.
- La tarea es binaria (humano frente a ChatGPT) y no cubre otros generadores, por lo que la clase "IA" esta definida por un unico modelo y una unica version del corpus.
- Licencia apache-2.0, que permite uso comercial y modificacion, pero el modelo base `sentence-transformers/all-MiniLM-L6-v2` tambien se distribuye bajo apache-2.0, sin restricciones adicionales conocidas.
- El repositorio registra 0 descargas y 0 likes, por lo que no existe validacion independiente por parte de la comunidad.
- La fecha de publicacion indicada (2026-09-17) y el contexto de la asignatura sugieren que es un artefacto academico sin mantenimiento previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/BiboyQG/hw1-hc3-detector
- Modelo base: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- Dataset: https://huggingface.co/datasets/Hello-SimpleAI/HC3
- Paper del corpus HC3 (Guo et al., 2023): https://arxiv.org/abs/2301.07597
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, al dataset ni al paper; los resultados devueltos corresponden a sitios de prevision meteorologica y no guardan relacion con esta ficha.
