# Saravana30/sentiment-model

## Resumen

El modelo `Saravana30/sentiment-model` es un clasificador de texto obtenido por ajuste fino (*fine-tuning*) de `distilbert-base-uncased` para una tarea de análisis de sentimiento. Lo publica el usuario Saravana30 en Hugging Face bajo licencia Apache 2.0. Se trata de un transformer encoder de tipo DistilBERT, una versión destilada de BERT-base con 6 capas y 66.955.779 parámetros totales, lo que lo sitúa en la gama de modelos ligeros que pueden ejecutarse en CPU o en cualquier GPU consumer.

El problema que aborda es la clasificación de polaridad en textos, presumiblemente en inglés, aunque el autor no declara el idioma ni el conjunto de datos empleado. La model card está generada automáticamente por el `Trainer` de Hugging Face y no aporta descripción funcional, usos previstos ni composición del corpus de entrenamiento. El rendimiento declarado es modesto: 0,6598 de exactitud (*accuracy*) y 0,6493 de F1 macro y ponderado sobre el conjunto de evaluación.

Su relevancia actual es limitada: el repositorio acumula 0 descargas y 0 "likes", no se ha publicado ninguna entrada en el `model-index` de benchmarks y la propia model card indica que debe revisarse y completarse. Resulta útil, por tanto, como pieza de prototipado, como ejercicio docente de ajuste fino o como generador de pre-etiquetados, pero no como componente crítico de producción sin una validación adicional sobre datos propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DistilBERT: 6 capas, 768 de dimensión oculta, 12 cabezas de atención, destilado de BERT-base) con cabeza de clasificación de secuencia |
| Parametros totales | 66.955.779 (dato real de los pesos en safetensors) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la ficha del autor; la arquitectura base `distilbert-base-uncased` admite hasta 512 tokens |
| Tipos de cuantizacion | No disponible (el autor no publica versiones cuantizadas; al ser safetensors/PyTorch es cuantizable de forma externa a FP16, INT8 o INT4) |
| Idiomas soportados | No disponible (el modelo base está preentrenado en inglés; el autor no declara idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 0,3 GB), cargable con `transformers` |
| Tarea (pipeline) | text-classification |
| Modelo base | distilbert-base-uncased |
| Numero de etiquetas | No disponible |
| Tamano del repositorio | 0,3 GB |
| Fecha de creacion | 2026-09-26 |
| Fecha de ultima actualizacion | 2026-09-28 (actualizado: 2026-09-26T15:53:28Z) |

## Arquitectura y entrenamiento

La arquitectura es un encoder transformer de 6 capas idéntico en topología a `distilbert-base-uncased`, que a su vez es el resultado de destilar BERT-base conservando aproximadamente el 40 % de sus parámetros y manteniendo, según su publicación original, alrededor del 97 % del rendimiento de BERT en GLUE. Sobre ese backbone se ha añadido una cabeza de clasificación de secuencia cuya dimensionalidad de salida (número de clases) no se especifica en la información disponible. El uso del tokenizador `uncased` implica normalización a minúsculas y vocabulario WordPiece en inglés.

El entrenamiento se realizó con el `Trainer` de Hugging Face durante 3 épocas, con tasa de aprendizaje 2e-05, *batch size* de 32 en entrenamiento y evaluación, optimizador AdamW fusionado (`ADAMW_TORCH_FUSED`, betas 0,9/0,999, epsilon 1e-08), planificador lineal y semilla 42. El conjunto de datos se describe literalmente como "unknown dataset": el autor no documenta su origen, tamaño, composición ni número de clases. A partir del número de pasos registrados (58 por época, 174 en total) con *batch size* 32, puede inferirse un conjunto de entrenamiento del orden de 1.850 ejemplos, aunque esta cifra no está confirmada por el autor. No consta ningún proceso de RLHF, DPO ni ajuste por preferencias humanas, algo esperable en un clasificador supervisado de este tipo.

La evolución registrada muestra 1,0498 de pérdida de entrenamiento en la época 1, 0,8304 en la época 2 y 0,6785 en la época 3. La pérdida de validación, sin embargo, toca mínimo en la época 2 (0,7226) y repunta en la época 3 (0,7117 con 0,6821 de exactitud), lo que apunta a un ligero sobreajuste en el tramo final del entrenamiento. No se documenta ninguna innovación técnica adicional (decodificación especulativa, atención lineal, *flash attention*, etc.).

## Capacidades

- Clasificación de texto: asigna una etiqueta de sentimiento (polaridad) a una secuencia de entrada; es un modelo discriminativo, no generativo.
- Clasificación de secuencia de una sola etiqueta por texto (el número exacto de clases no está documentado).
- Ejecución sobre CPU: con 66,9 M de parámetros, la inferencia no requiere acelerador.
- Compatibilidad con el pipeline `text-classification` de `transformers` y con los *endpoints* de Hugging Face (etiqueta `endpoints_compatible` en el repositorio).
- Procesamiento por lotes (*batching*) mediante `Trainer`/`pipeline` para clasificar grandes volúmenes de textos cortos.
- No soporta *tool calling* ni *function calling*.
- No soporta uso como agente ni razonamiento multi-paso.
- No dispone de modo *thinking*, visión, audio ni generación de texto libre.
- Capacidades multilingües: no disponibles; el modelo base está preentrenado únicamente en inglés y el autor no declara otros idiomas.

## Casos de uso

- Prototipado rápido de un pipeline de análisis de sentimiento: sirve como primer *baseline* funcional en un proyecto, ya que se carga con `pipeline("text-classification", model="Saravana30/sentiment-model")` en pocas líneas y sin GPU, permitiendo validar la arquitectura completa del sistema antes de invertir en un modelo mejor.
- Pre-etiquetado de corpus para anotación humana: el modelo puede clasificar grandes volúmenes de reseñas o tuits y enviar los resultados a una herramienta de anotación para revisión y corrección, acelerando la construcción de un conjunto de datos propio, siempre que se asuma su exactitud declarada del 65,98 %.
- Filtrado y triaje de reseñas de producto a gran escala: al ser un modelo de 0,3 GB que corre en CPU, se puede desplegar en un contenedor ligero para separar reseñas negativas de positivas y priorizar la revisión manual de las primeras, usando el sentimiento como señal de priorización y no como decisión final.
- Enrutado de tickets de soporte: clasificar la polaridad de las incidencias entrantes para dirigir los casos negativos a un equipo de retención y los neutros a soporte estándar; se recomienda establecer umbrales de confianza y derivar a revisión aquellos casos con probabilidad cercana a 0,5.
- Monitorización de menciones de marca en redes sociales: procesamiento por lotes de textos cortos para construir series temporales de sentimiento. La ventana de hasta 512 tokens de la arquitectura base cubre con holgura publicaciones y comentarios típicos.
- Análisis de respuestas abiertas en encuestas: agregar el sentimiento de los comentarios libres de un formulario (NPS, satisfacción interna) para obtener un indicador cuantitativo complementario a las puntuaciones numéricas, presentando siempre los resultados como aproximación agregada.
- Componente de demostración docente: ejemplo reproducible de ajuste fino con `Trainer` para explicar el flujo completo (tokenización, entrenamiento, evaluación, publicación en el Hub), dado lo reducido de su tamaño y su tiempo de entrenamiento.
- Experimentos de A/B testing sobre textos de producto: comparar el sentimiento medio de dos variantes de descripciones, asuntos de correo o mensajes de marketing sobre muestras amplias, asumiendo el sesgo del clasificador de forma constante entre variantes.

## Benchmarks y rendimiento

El `model-index` oficial del repositorio no contiene resultados (`"results": []`), por lo que no hay benchmarks publicados por el autor. Los únicos datos disponibles son las métricas de evaluación y el historial de entrenamiento declarados en la model card, que se reproducen a continuación tal cual.

Resultados en el conjunto de evaluacion (declarados por el autor):

| Metrica | Valor |
|---|---|
| Loss | 0,7470 |
| Accuracy | 0,6598 |
| F1 weighted | 0,6493 |
| F1 macro | 0,6493 |

Historial de entrenamiento (declarado por el autor):

| Training loss | Epoca | Step | Validation loss | Accuracy | F1 weighted | F1 macro |
|---|---|---|---|---|---|---|
| 1,0498 | 1.0 | 58 | 0,8737 | 0,6080 | 0,5529 | 0,5529 |
| 0,8304 | 2.0 | 116 | 0,7226 | 0,6975 | 0,6881 | 0,6881 |
| 0,6785 | 3.0 | 174 | 0,7117 | 0,6821 | 0,6736 | 0,6736 |

No se dispone de resultados comparativos con otros modelos en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,27 GB de pesos, que con activaciones y *overhead* del entorno se traduce en menos de 1 GB; en FP16, aproximadamente 0,13 GB; en INT8, aproximadamente 0,07 GB. Cifras calculadas a partir de los 66.955.779 parámetros declarados.
- GPU recomendadas: cualquiera con al menos 2 GB de memoria sirve, incluidas GTX 1050 Ti, GTX 1650, RTX 3050 o superiores. Para lotes grandes y máxima latencia, una RTX 4090 o RTX A4000 quedan sobredimensionadas respecto a las necesidades reales del modelo.
- GPU de centro de datos: A100, H100 o L4 no aportan ventaja significativa frente a una GPU consumer para este tamaño; solo resultan razonables si el modelo se integra en un servicio que ya las utiliza.
- Cabe en cualquier GPU consumer y también en CPU: es viable ejecutarlo en un contenedor sin acelerador, con un consumo de memoria RAM inferior a 1 GB.
- Opciones de despliegue: `transformers` con el pipeline `text-classification`; exportación a ONNX Runtime o TorchScript para reducir latencia en CPU; FastAPI, Flask o Triton Inference Server para servir el modelo; Hugging Face Inference Endpoints (el repositorio lleva la etiqueta `endpoints_compatible`); vLLM, llama.cpp, Ollama y TGI no son aplicables, ya que no es un modelo generativo con pesos GGUF.
- Latencia y throughput estimados: no disponibles; no se han publicado mediciones en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de este modelo frente a alternativas y el autor no documenta métricas comparables. La comparación se limita, por tanto, a características estructurales y de licencia.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad | Rendimiento declarado |
|---|---|---|---|---|---|---|
| Saravana30/sentiment-model | 66.955.779 | No especificado (arquitectura base: 512 tokens) | Clasificación de sentimiento | Apache 2.0 | Hugging Face, 0 descargas | Accuracy 0,6598; F1 macro 0,6493 |
| distilbert-base-uncased | ~66 M | 512 tokens | Modelo base preentrenado (MLM) | Apache 2.0 | Hugging Face | No disponible en la informacion proporcionada |
| distilbert-base-uncased-finetuned-sst-2-english | ~67 M | 512 tokens | Clasificación de sentimiento (2 clases) | Apache 2.0 | Hugging Face | No disponible en la informacion proporcionada |
| bert-base-uncased ajustado para sentimiento | ~110 M | 512 tokens | Clasificación de sentimiento | Apache 2.0 | Hugging Face | No disponible en la informacion proporcionada |

## Limitaciones y advertencias

- Rendimiento bajo: la exactitud declarada es de 0,6598 y la pérdida de evaluación de 0,7470, valores propios de un modelo con margen de mejora amplio. No es adecuado para decisiones automatizadas sin supervisión humana.
- Conjunto de datos desconocido: la model card indica literalmente "unknown dataset" y "More information needed" en las secciones de descripción, usos previstos y datos de entrenamiento. Se desconoce el número de clases, el dominio y la composición del corpus.
- Ausencia de validación externa: 0 descargas y 0 "likes" en el momento de redactar esta ficha; no hay evidencia de uso por terceros ni evaluaciones independientes.
- Sin entradas en el `model-index`: no se han publicado resultados de benchmarks estándar (SST-2, IMDb, GLUE, etc.), por lo que no es posible comparar de forma fiable con alternativas.
- Posible sobreajuste: la pérdida de validación empeora en la tercera época (de 0,7226 a 0,7117) mientras la de entrenamiento sigue bajando (de 0,8304 a 0,6785), y la exactitud cae de 0,6975 a 0,6821. El mejor punto medido es la época 2, no la versión final publicada.
- Idiomas no declarados: el modelo base está preentrenado únicamente en inglés y el autor no especifica soporte para otras lenguas. Usarlo en castellano u otros idiomas produciría resultados no validados.
- Sesgo desconocido: al no documentarse el corpus de entrenamiento, no es posible evaluar sesgos demográficos, de dominio ni de estilo lingüístico. Un clasificador de sentimiento entrenado sobre datos no identificados puede heredar sesgos sistemáticos hacia determinados temas o registros.
- Riesgo de alucinación: no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es la clasificación errónea sistemática y la mala calibración de las probabilidades de salida.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial y modificación con atribución, pero el autor no documenta la procedencia ni la licencia del conjunto de datos de entrenamiento, lo que traslada al usuario el riesgo legal derivado de dichos datos.
- Cartel de aviso de la propia model card: el texto generado automáticamente por el `Trainer` recomienda revisar y completar la ficha antes de su uso, algo que no se ha hecho.
- No apto para dominios sensibles: por su precisión y su falta de documentación, no debería emplearse en decisiones sobre crédito, empleo, salud, moderación de contenido ni cualquier contexto con impacto legal o personal.
- Limitación de entrada: al ser un encoder con tokenizador `uncased`, pierde la información de mayúsculas y no está diseñado para entradas largas si se supera la ventana de la arquitectura base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Saravana30/sentiment-model
- Modelo base: https://huggingface.co/distilbert-base-uncased
- Artículo de referencia de la arquitectura DistilBERT (Sanh et al., 2019): https://arxiv.org/abs/1910.01108
- Documentación del pipeline de clasificación de texto de Hugging Face: https://huggingface.co/docs/transformers/main/en/tasks/sequence_classification
