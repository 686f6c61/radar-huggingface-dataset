# samjohnson11/sms-spam-distilbert

## Resumen

sms-spam-distilbert es un clasificador binario de mensajes SMS en inglés (ham/spam) obtenido mediante fine-tuning de `distilbert-base-uncased` sobre el conjunto de datos UCI SMS Spam Collection. Lo publica el usuario samjohnson11 como parte de un proyecto educativo de clasificación de spam, y su relevancia es limitada: no es un modelo de propósito general ni un filtro de producción, sino una demostración reproducible de un pipeline de clasificación con DistilBERT.

El checkpoint subido a Hugging Face corresponde a una ejecución de demostración con MLflow (1.000 mensajes de entrenamiento, una época, 300 mensajes de test), no al fine-tuning completo descrito en el proyecto. DistilBERT es un transformer encoder destilado de BERT, con 66,9 millones de parámetros, 6 capas y una ventana de entrada efectiva de 64 tokens en esta configuración.

Por su tamaño reducido y su licencia Apache-2.0, el modelo es adecuado para experimentación local, docencia y comparación de baselines, pero sus propios autores advierten que no debe usarse como filtro antispam en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT, destilado de BERT-base) |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 512 tokens arquitectónicos; truncado a 64 tokens en la inferencia de demo |
| Tipos de cuantizacion | no disponible (el repo solo contiene safetensors en fp32) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 0,3 GB) |

## Arquitectura y entrenamiento

La base es DistilBERT, un transformer encoder de 6 capas y 66,9 M de parámetros obtenido por destilación de BERT-base, con tokenizador WordPiece sin distinción de mayúsculas (`uncased`). Sobre esa base se añade una cabeza de clasificación de secuencia con dos etiquetas (`0 = ham`, `1 = spam`).

El checkpoint publicado proviene de la ejecución `2b09015f87d94c65870560c98e8346a3` del proyecto: 1.000 mensajes de entrenamiento, una sola época, split estratificado 80/20 seguido de submuestreo estratificado, longitud máxima de 64 tokens, batch size 16, learning rate 5e-5 y semilla 42. El autor indica que el fine-tuning completo (test de 1.115 mensajes, 99,3 % de accuracy y F1 de spam 0,973) se realizó en experimentos separados y que ese checkpoint no estaba disponible en los artefactos del proyecto, por lo que no se distribuye. No se documenta uso de RLHF, DPO ni aumentación de datos.

## Capacidades

- Clasificación binaria de texto corto en inglés: etiqueta cada mensaje como `ham` o `spam`.
- Salida de puntuaciones de confianza por clase mediante `pipeline("text-classification")`.
- Entrada de hasta 64 tokens en la configuración de demo (truncado automático con `truncation=True, max_length=64`).
- Integración directa con la librería `transformers` y con Text Embeddings Inference / endpoints compatibles (según los tags del repo).
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Multilingüismo: únicamente inglés; no hay evidencia de transferencia a otros idiomas.

## Casos de uso

- Docencia y prácticas de NLP: sirve como ejemplo mínimo y reproducible de fine-tuning de un encoder para clasificación binaria, con hiperparámetros y semilla documentados.
- Baseline en experimentos de detección de spam: permite comparar arquitecturas encoder pequeñas frente a baselines clásicos como regresión logística con TF-IDF (F1 de spam 0,912 en el proyecto).
- Prototipado rápido de filtros de texto: con 66,9 M de parámetros y 0,3 GB de pesos, se puede cargar en un portátil y ejecutar inference en CPU para validar una idea antes de invertir en un modelo mayor.
- Etiquetado asistido de corpus: usar las predicciones como preetiquetado de mensajes SMS para revisión humana posterior, dado el bajo coste computacional.
- Evaluación de LLM-as-judge: el proyecto incluye comparaciones con Claude Opus 4.6 y Claude Haiku 5.5 sobre el mismo conjunto de 300 mensajes, útiles como referencia metodológica para medir clasificadores generativos frente a encoders pequeños.
- Filtrado de baja latencia en entornos con recursos limitados: al ser un modelo de 6 capas, es viable en dispositivos edge o contenedores pequeños, siempre que el dominio sea SMS cortos en inglés.
- Smoke testing de pipelines de despliegue: su tamaño permite integrarlo en CI para verificar que el flujo de carga de modelos, tokenización y serving funciona antes de desplegar modelos mayores.

## Benchmarks y rendimiento

Resultados del checkpoint publicado (demo MLflow, 300 mensajes de test, 40 spam / 260 ham):

| Metrica | Valor |
|---|---|
| Accuracy | 0,98 |
| F1 de spam | 0,921 |
| Precision de spam | 0,972 |
| Recall de spam | 0,875 |

Resultados reportados del proyecto para el fine-tuning completo (test de 1.115 mensajes, checkpoint no publicado):

| Metrica | Valor |
|---|---|
| Accuracy | 0,993 |
| F1 de spam | 0,973 |
| Baseline TF-IDF + regresión logística (F1 de spam) | 0,912 |

Comparaciones independientes con LLM-as-judge sobre los mismos 300 mensajes (no miden estos pesos de DistilBERT):

| Juez | Correctos | Accuracy | Precision | Recall | F1 de spam | Coste |
|---|---|---|---|---|---|---|
| Claude Opus 4.6 (temperature 0) | 297/300 | 0,990 | 0,974 | 0,950 | 0,962 | ~0,63 USD |
| Claude Haiku 5.5 (effort low) | 299/300 | 0,997 | 1,000 | 0,975 | 0,987 | ~0,018 USD |

No se han publicado resultados de benchmarks estándar (MMLU, GLUE, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: en torno a 0,3-0,5 GB, incluyendo pesos y activaciones para secuencias de 64 tokens.
- Cabe en cualquier GPU consumer (GTX 1650, RTX 3060, RTX 4090) y también en CPU; no requiere GPU dedicada.
- GPU recomendadas para serving de alto throughput: T4, L4 o A10G son suficientes; A100/H100 no aportan ventaja significativa por el tamaño del modelo.
- Opciones de despliegue: `transformers` pipeline, Text Embeddings Inference (tag `text-embeddings-inference`), endpoints compatibles, y exportación a ONNX no documentada pero viable por la arquitectura estándar.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos en GPU y decenas de milisegundos en CPU, sin cifras verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| samjohnson11/sms-spam-distilbert | 66,9 M | 512 (64 en demo) | Apache-2.0 | Checkpoint de demo; F1 de spam 0,921 en 300 mensajes |
| dima806/sms-spam-detection-distilbert | no disponible | no disponible | Apache-2.0 | Fine-tuning de DistilBERT para la misma tarea; sin métricas verificadas en la información disponible |
| Baseline TF-IDF + regresión logística (proyecto) | no aplica | no aplica | no disponible | F1 de spam 0,912 en el test completo del proyecto |
| Claude Haiku 5.5 (LLM-as-judge) | no disponible | no disponible | propietaria | F1 de spam 0,987 en los mismos 300 mensajes; coste ~0,018 USD |

## Limitaciones y advertencias

- El autor declara explícitamente que es un benchmark/demo educativo y no un filtro antispam de producción.
- El checkpoint publicado es una ejecución de demo con 1.000 mensajes y una época; no corresponde a los resultados del fine-tuning completo (99,3 % de accuracy), que no se distribuye.
- Los SMS cortos en inglés del dataset UCI no representan estafas modernas, otros idiomas ni mensajes largos; la generalización fuera de dominio es incierta.
- El truncado a 64 tokens descarta información en mensajes más largos.
- Se producen falsos positivos y falsos negativos; las puntuaciones de confianza no están calibradas. El propio autor documenta un mensaje sintético de premio en efectivo clasificado erróneamente como ham.
- No debe enviarse información personal sensible a la demo pública.
- Licencia Apache-2.0 heredada del modelo base, lo que permite uso comercial de los pesos, pero el dataset UCI tiene sus propias condiciones de licencia y atribución que deben consultarse por separado.
- No hay datos publicados sobre sesgos demográficos o lingüísticos específicos; al entrenar solo con SMS en inglés, el rendimiento en variedades dialectales no está caracterizado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/samjohnson11/sms-spam-distilbert
- Repositorio del proyecto: https://github.com/samwjohnson/sms-spam-classifier
- Dataset UCI SMS Spam Collection: https://archive.ics.uci.edu/dataset/228/sms+spam+collection
- Documentación de DistilBERT en Transformers: https://huggingface.co/docs/transformers/model_doc/distilbert
- Modelo comparable en Hugging Face: https://huggingface.co/dima806/sms-spam-detection-distilbert
