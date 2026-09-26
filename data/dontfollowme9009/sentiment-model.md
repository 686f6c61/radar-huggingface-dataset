# dontfollowme9009/sentiment-model

## Resumen

`sentiment-model` es un modelo de clasificación de secuencias publicado en HuggingFace por el usuario `dontfollowme9009`. Se trata de un fine-tuning de `distilbert-base-uncased`, el encoder transformer destilado de BERT-base, con 66.955.779 parámetros y pesos en formato safetensors. La model card está generada automáticamente por el `Trainer` de HuggingFace, no declara el conjunto de datos de entrenamiento, el dominio de aplicación ni los idiomas soportados.

El modelo resuelve una tarea de clasificación de texto de etiqueta única, presumiblemente análisis de sentimiento, con 512 tokens de contexto máximo heredados del modelo base. Su interés técnico es limitado: no aporta innovaciones de arquitectura, no publica benchmarks estándar (el campo `model-index` está vacío) y su rendimiento declarado es modesto, con una accuracy de 0,6598 y un F1 macro de 0,6493 sobre un conjunto de evaluación no especificado.

Es relevante únicamente como ejemplo de pipeline de fine-tuning reproducible con el ecosistema Transformers, o como punto de partida para experimentos propios. El repositorio acumula 0 descargas y 0 likes, no tiene documentación de uso previsto y la licencia Apache 2.0 permite reutilización comercial sin garantías de ningún tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder tipo BERT destilado (DistilBERT): 6 capas, 12 cabezas de atención, dimensión oculta 768, dimensión de FFN 3072, más cabeza de clasificación de secuencias (`pre_classifier` 768x768 + `classifier`) |
| Parametros totales | 66.955.779 (66,96 M): 66.953.472 en el encoder y 592.899 en la cabeza de clasificación |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens (límite de `max_position_embeddings` del modelo base `distilbert-base-uncased`; la model card no declara otro valor) |
| Tipos de cuantizacion | No disponible. El repositorio solo publica pesos en safetensors en precisión completa; no se declaran versiones GGUF, ONNX, INT8 ni FP16 |
| Idiomas soportados | No disponible. El modelo base es exclusivamente en inglés (`uncased`); se desconoce el idioma del conjunto de fine-tuning |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |
| Tarea (pipeline) | `text-classification` (clasificación de secuencia, etiqueta única) |
| Numero de clases | No declarado. El recuento de parámetros (66.953.472 + 769 x n = 66.955.779) es compatible con 3 clases; es una inferencia, no un dato de la model card |
| Modelo base | `distilbert/distilbert-base-uncased` |
| Tamano del repositorio | 0,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha declarada de creacion / actualizacion | 2026-09-26 / 2026-09-26 |

## Arquitectura y entrenamiento

La arquitectura es la de DistilBERT, descrita en el artículo de Sanh et al. (2019): un encoder transformer de 6 capas y 768 dimensiones ocultas obtenido por destilación del conocimiento de `bert-base-uncased` (12 capas), que conserva aproximadamente el 97 % del rendimiento de BERT en GLUE con un 40 % menos de parámetros y un 60 % más de velocidad. Sobre ese encoder, este repositorio añade la cabeza estándar de `DistilBertForSequenceClassification` (una capa densa intermedia de 768x768 más una capa de proyección a las etiquetas de salida). No hay innovaciones técnicas adicionales: ni atención lineal, ni decodificación especulativa (no genera texto), ni mezcla de expertos.

El entrenamiento se realizó con el `Trainer` de HuggingFace sobre un conjunto de datos no identificado. Los hiperparámetros declarados son: learning rate 2e-5, batch de entrenamiento y evaluación de 32, 3 épocas, optimizador AdamW (variante `torch_fused`, betas 0,9/0,999, epsilon 1e-8), scheduler lineal y semilla 42. El registro muestra 174 pasos totales, es decir 58 pasos por época; con batch 32 y sin acumulación de gradientes, esto implica aproximadamente 1.856 ejemplos por época y unos 5.568 ejemplos en total, una cifra muy reducida para un fine-tuning de clasificación. No se documenta ningún tipo de ajuste por preferencias (RLHF, DPO) ni aumentación de datos. Las versiones declaradas de framework son Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1.

## Capacidades

- Clasificación de texto de etiqueta única en una sola pasada (`text-classification`), sin generación de texto.
- Asigna una etiqueta de sentimiento y una puntuación de probabilidad por etiqueta; el número de etiquetas no está declarado (el recuento de parámetros sugiere 3).
- Procesa textos de hasta 512 tokens; los textos más largos deben truncarse o trocearse en el cliente.
- Inferencia muy rápida y barata en CPU y en GPU de gama baja, apta para procesamiento por lotes de alto volumen.
- Etiquetado previo (pre-labeling) para acelerar anotación humana o construir conjuntos de datos con active learning.
- No soporta tool calling ni function calling.
- No soporta uso agéntico, razonamiento multi-paso ni planificación.
- No dispone de modo "thinking", salida estructurada reasoning ni trazas intermedias.
- No dispone de capacidades de visión, audio, OCR ni multimodalidad.
- No es multilingüe de forma verificada: el modelo base está entrenado únicamente en inglés y no hay evidencia de fine-tuning en otros idiomas.
- No genera embeddings reutilizables como modelo de recuperación; su salida es una distribución sobre etiquetas.
- No se ha publicado ningún conjunto de evaluación estándar (MMLU, GLUE, SST-2) que permita situar su calidad.

## Casos de uso

- Triaje de tickets de soporte: clasificar el tono de cada incidencia entrante para priorizar las negativas antes de que las lea un agente humano. Es adecuado por su bajísimo coste por inferencia y su latencia de milisegundos, aunque con una accuracy de 0,66 debe usarse como señal auxiliar y no como decisión final.
- Monitorización de menciones de marca en redes sociales: procesar flujos continuos de comentarios cortos en lotes grandes sobre CPU o una GPU modesta, generando series temporales de sentimiento. El encaje es razonable para textos de registro informal solo si el dominio coincide con el del entrenamiento, dato que se desconoce.
- Análisis de encuestas NPS y preguntas abiertas: clasificar verbatims en categorías de sentimiento para agregar resultados por segmento. El modelo permite procesar decenas de miles de respuestas en minutos con `transformers` o ONNX Runtime.
- Pre-etiquetado para anotación humana: usar las predicciones como borrador en una herramienta de etiquetado y reservar la revisión humana para los casos de baja confianza, reduciendo el tiempo de anotación. Su accuracy limitada es tolerable en este escenario porque existe una fase de verificación posterior.
- Moderación asistida de comunidades: marcar comentarios con tono negativo para revisión manual. No debe automatizarse el bloqueo, porque un 34 % de error declarado produciría falsos positivos sistemáticos sobre usuarios legítimos.
- Análisis de clima laboral a partir de comentarios internos: agregar sentimiento por equipo o departamento en encuestas anónimas, siempre con revisión de privacidad y sin tomar decisiones sobre personas a partir de la salida del modelo.
- Baseline de referencia en un proyecto interno: establecer una cota inferior de rendimiento y coste antes de evaluar modelos mayores o específicos de dominio, dado que se puede desplegar en una GPU de 2 GB y sirve como comparación directa en latencia y coste por petición.

## Benchmarks y rendimiento

El campo `model-index` del repositorio no contiene ningún resultado, por lo que no hay benchmarks estándar (MMLU, GLUE, SST-2, HumanEval, GSM8K) publicados. Los únicos datos disponibles son las métricas de evaluación declaradas por el autor sobre un conjunto no especificado:

| Metrica | Valor | Conjunto de evaluacion |
|---|---|---|
| Loss | 0,7470 | No especificado |
| Accuracy | 0,6598 | No especificado |
| F1 weighted | 0,6493 | No especificado |
| F1 macro | 0,6493 | No especificado |

Evolución durante el entrenamiento (registro del `Trainer`):

| Epoca | Paso | Training loss | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0 | 58 | 1,0498 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 2,0 | 116 | 0,8304 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 3,0 | 174 | 0,6785 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

Observaciones sobre estos datos: el mejor resultado de validación se alcanzó en la época 2 (accuracy 0,6975, validation loss 0,7226), no en la época 3, lo que apunta a un sobreajuste leve y a que el checkpoint final no es el mejor del entrenamiento. La igualdad entre F1 weighted y F1 macro en las tres épocas es compatible con un conjunto de evaluación equilibrado entre clases (inferencia, no confirmada por el autor). Las métricas de la cabecera de la model card (loss 0,7470, accuracy 0,6598) no coinciden con las de la última época de validación, por lo que probablemente corresponden a una evaluación final separada cuyo conjunto no se documenta.

## Requisitos de hardware

- Peso de los parametros: 66,96 M parámetros equivalen a unos 268 MB en FP32, unos 134 MB en FP16 y unos 67 MB en INT8.
- VRAM para inferencia: del orden de 0,5 a 1 GB incluyendo activaciones y overhead del runtime con lotes pequeños; entre 2 y 4 GB con lotes grandes (64-256 secuencias de 512 tokens). Cifras orientativas, no medidas ni declaradas por el autor.
- GPU recomendadas para servicio: NVIDIA T4, L4 o A10G son suficientes y coste-eficientes. No se justifica el uso de A100 ni H100 salvo que se necesite throughput extremo con lotes muy grandes.
- GPU de consumo: cabe holgadamente en cualquier GPU con 2 GB o más de VRAM (GTX 1050 Ti, GTX 1650, RTX 3050, RTX 4090, etc.). También funciona en GPU integradas con soporte CUDA o ROCm.
- CPU: la inferencia en CPU es viable y habitual en este tamaño de modelo; con textos de hasta 128 tokens y ONNX Runtime se pueden procesar del orden de centenares de secuencias por segundo por núcleo moderno (estimación orientativa).
- Latencia: del orden de 5 a 20 ms por petición en GPU con lotes pequeños y de 20 a 100 ms en CPU, dependiendo de la longitud del texto. No hay mediciones publicadas por el autor.
- Opciones de despliegue: pipeline de `transformers`, HuggingFace Inference Endpoints (el repositorio está marcado como `endpoints_compatible`), ONNX Runtime mediante Optimum, TorchScript, NVIDIA Triton, TorchServe, KServe o un servicio FastAPI con batching dinámico. vLLM puede servir modelos de clasificación basados en pooling.
- llama.cpp y Ollama: no aplicables a clasificación de secuencias (solo cubren generación y embeddings), por lo que no son una vía de despliegue para este modelo.
- El repositorio ocupa 0,5 GB, aproximadamente el doble que los pesos en FP32; es probable que incluya artefactos adicionales del entrenamiento (por ejemplo, estados del optimizador), aunque no se ha verificado.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus repositorios públicos y no se han verificado en esta ficha; se indican como referencia.

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento declarado |
|---|---|---|---|---|---|
| `dontfollowme9009/sentiment-model` | 66,96 M | 512 | Clasificación de sentimiento, número de clases no declarado (3 según el recuento de parámetros) | Apache 2.0 | Accuracy 0,6598 y F1 macro 0,6493 sobre conjunto no especificado |
| `distilbert-base-uncased` | 66,36 M (encoder) | 512 | Modelo base enmascarado (MLM); no clasifica por sí solo | Apache 2.0 | No aplica (requiere fine-tuning) |
| `distilbert-base-uncased-finetuned-sst-2-english` | 66,96 M | 512 | Clasificación binaria de sentimiento (SST-2) | Apache 2.0 | En torno al 91 % de accuracy en SST-2 dev, según datos públicos del repositorio |
| `cardiffnlp/twitter-roberta-base-sentiment-latest` | ~125 M | 512 | Clasificación de sentimiento en 3 clases (negativo, neutro, positivo) sobre textos de Twitter | No verificada en esta ficha | Métricas no verificadas en esta ficha |

La comparación directa más informativa es con `distilbert-base-uncased-finetuned-sst-2-english`: misma arquitectura y mismo tamaño, pero entrenado sobre un conjunto público, documentado y con un rendimiento muy superior en su dominio. Para un caso de uso real de análisis de sentimiento en inglés, ese modelo o un RoBERTa afinado específicamente son opciones más fiables que `sentiment-model`, que no aporta ninguna ventaja medible.

## Limitaciones y advertencias

- Rendimiento bajo: una accuracy de 0,6598 sobre un conjunto no especificado es insuficiente para la mayoría de aplicaciones en producción. En un problema de 3 clases, el azar se sitúa en torno a 0,33, de modo que el modelo solo supera claramente la línea base trivial.
- Conjunto de evaluación desconocido: no se indica el dominio, el idioma, el tamaño ni la distribución de clases del conjunto sobre el que se calcularon las métricas, por lo que la cifra no es extrapolable a ningún escenario concreto.
- Conjunto de entrenamiento desconocido: la model card indica literalmente "unknown dataset". Esto impide evaluar la cobertura del dominio, la presencia de datos sensibles y la existencia de sesgos conocidos. Los sesgos del modelo son, por tanto, no caracterizados.
- Idiomas: el modelo base solo maneja inglés (`uncased`). Usarlo con castellano o cualquier otro idioma producirá resultados esencialmente aleatorios, y no hay ninguna evidencia de que se haya afinado con textos en otros idiomas.
- Sensibilidad al registro: los clasificadores basados en DistilBERT rinden de forma muy distinta según el tipo de texto (formal, coloquial, con abreviaturas, con errores ortográficos o con jerga). Sin conocer el dataset de entrenamiento no se puede prever este comportamiento.
- Posible sobreajuste: la pérdida de entrenamiento sigue bajando en la tercera época (0,6785) mientras la de validación se estanca (0,7226 a 0,7117), y el mejor resultado de validación corresponde a la época 2. El checkpoint publicado podría no ser el óptimo del entrenamiento.
- Riesgo de clasificación errónea confiada: al ser un clasificador, no "alucina" texto, pero sí puede asignar probabilidades altas a etiquetas incorrectas. Cualquier umbral de decisión debe calibrarse sobre datos propios.
- Sin mantenimiento ni validación comunitaria: 0 descargas y 0 likes, ausencia de issues o discusiones y ninguna garantía de que el autor responda a problemas.
- Documentación insuficiente: la model card es la plantilla autogenerada por el `Trainer`; las secciones de descripción del modelo, usos previstos y datos de entrenamiento contienen "More information needed". Las fechas de creación y actualización declaradas (septiembre de 2026) son anómalas.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero se distribuye "tal cual", sin garantías ni responsabilidad del autor. Debe conservarse el aviso de licencia y el archivo de atribución del modelo base.
- No apto para decisiones sensibles: no debe utilizarse para moderación automática irreversible, evaluación de personas, cribado de candidatos ni ninguna decisión con impacto legal o económico sobre individuos.
- Límite de 512 tokens: los documentos largos requieren truncado o división, lo que degrada el análisis de sentimiento global de un texto extenso.
- El repositorio no incluye tokenizador documentado aparte ni ejemplos de uso; hay que recurrir al tokenizador de `distilbert-base-uncased`, que aplica `uncased` y puede perder matices expresivos en mayúsculas y puntuación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dontfollowme9009/sentiment-model
- Modelo base `distilbert-base-uncased`: https://huggingface.co/distilbert-base-uncased
- Artículo de DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Referencia comparable afinada en SST-2: https://huggingface.co/distilbert-base-uncased-finetuned-sst-2-english
- Referencia comparable multilingüe y de 3 clases basada en RoBERTa: https://huggingface.co/cardiffnlp/twitter-roberta-base-sentiment-latest
- No se han encontrado paper, blog, repositorio de código ni demo asociados específicamente a este modelo.
