# budijuarto/was1264-sports-headline-models

## Resumen

WAS 2026 #1264 es un repositorio de clasificación de titulares deportivos publicado por el usuario budijuarto en Hugging Face. No se trata de un único modelo generativo, sino de dos clasificadores independientes que resuelven la misma tarea: asignar un titular deportivo en inglés a una de ocho etiquetas de deporte. Los dos artefactos son un clasificador lineal LexiStack (SVM con C = 16 sobre regresión logística base con C = 64, serializado en `joblib`) y un ajuste fino de DistilBERT base uncased (candidato 3, learning rate 5e-5), exportado también a ONNX.

El modelo parte de `distilbert/distilbert-base-uncased`, un transformer encoder de 6 capas y aproximadamente 66 millones de parámetros, con un tokenizador WordPiece en inglés. La tarea es de clasificación multiclase supervisada sobre titulares, no de generación de texto, por lo que no dispone de ventana de contexto conversacional ni de capacidades de razonamiento de múltiples pasos.

Su relevancia es acotada y experimental: el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y su interés principal es metodológico, ya que documenta un protocolo de selección de cinco candidatos con validación interna, refit sobre el fold externo de entrenamiento y verificación de exportaciones (ONNX y navegador) contra el checkpoint Python. La licencia del conjunto no está declarada de forma explícita; solo se reproduce la Apache 2.0 del checkpoint base de DistilBERT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas) y clasificador lineal LexiStack (TF-IDF + regresion logistica + SVM) |
| Parametros totales | no disponible (DistilBERT base ronda los 66 M; el repositorio no lo declara) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se distribuyen pesos completos y exportacion ONNX full-precision) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible para el conjunto; Apache 2.0 para los pesos base de DistilBERT segun la model card |
| Formato de pesos | safetensors, joblib, ONNX, JSON serializado para navegador |

## Arquitectura y entrenamiento

El componente DistilBERT es un transformer encoder destilado de BERT base, con 6 capas y tokenizador WordPiece en minúsculas, ajustado para una cabeza de clasificación de ocho clases sobre titulares deportivos. El componente LexiStack es un pipeline clásico de NLP: vectorización TF-IDF seguida de regresión logística como base y una SVM con C = 16 como clasificador final. Ambos checkpoints se seleccionaron mediante un protocolo de cinco candidatos evaluados en una partición de validación interna y posteriormente reajustados sobre el fold externo completo de entrenamiento, con semilla 42 y fold externo 1.

La model card indica que el benchmark reportado agrupa cinco folds para cada una de tres semillas, con instancias ajustadas de forma separada, y que existen registros de procedencia por modelo que documentan las comprobaciones sobre predicciones retenidas. También se verifica la paridad de las exportaciones: la implementación en navegador (parámetros TF-IDF y clasificador serializados en `lexistack-browser.json`) coincide con la etiqueta superior del checkpoint Python en las 2.833 filas del corpus, y la exportación ONNX full-precision de DistilBERT coincide con la etiqueta superior original en los 567 ejemplos retenidos del fold exportado. No se detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF o DPO, algo esperable en una tarea de clasificación supervisada.

## Capacidades

- Clasificación de titulares deportivos en inglés en una de ocho etiquetas definidas en el mapa de etiquetas del repositorio.
- Inferencia en navegador mediante el artefacto JSON serializado de LexiStack, sin dependencia de servidor.
- Inferencia con ONNX Runtime gracias a la exportación `distilbert/onnx/model.onnx`.
- Reutilización del tokenizador y de los pesos de DistilBERT para ajustes posteriores sobre dominios relacionados.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento de múltiples pasos.
- No dispone de modo thinking, visión ni audio.
- Capacidad multilingüe limitada al inglés; el propio autor advierte que el material de entrenamiento era predominantemente inglés.

## Casos de uso

- Etiquetado automático de titulares en un aggregador deportivo: el clasificador asigna cada titular a uno de los ocho deportes para enrutarlo a la sección correspondiente, con coste de inferencia mínimo al ser un modelo de 66 M de parámetros.
- Filtrado temático en un pipeline de noticias: antes de un modelo generativo costoso, el clasificador descarta titulares no deportivos o los segmenta por disciplina, reduciendo el volumen procesado por etapas posteriores.
- Moderación y organización de un foro o comunidad: clasificación de hilos y comentarios por deporte para facilitar la búsqueda y la moderación por categorías.
- Análisis de tendencias editoriales: agregación de titulares clasificados por deporte y fecha para medir la cobertura relativa de cada disciplina en distintos medios.
- Demo interactiva y material docente: el Space asociado compara en vivo las predicciones de LexiStack y DistilBERT sobre un mismo titular, útil para ilustrar las diferencias entre un modelo lineal con TF-IDF y un transformer ajustado.
- Baseline en experimentos de NLP: punto de partida reproducible (semilla 42, protocolo de cinco candidatos) para comparar nuevas aproximaciones de clasificación de texto corto en inglés.
- Inferencia en el cliente: el artefacto JSON permite clasificar titulares directamente en el navegador, sin enviar texto a un servidor, en escenarios con requisitos de privacidad o conectividad intermitente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona un benchmark agrupado de cinco folds por semilla, pero no incluye cifras de accuracy, F1 ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para DistilBERT en precisión completa: en torno a 250-300 MB de pesos, con un pico de inferencia por debajo de 1 GB para lotes pequeños; el repositorio no publica mediciones.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM sirve para DistilBERT; para el clasificador LexiStack la CPU es suficiente y no requiere GPU.
- Cabe en GPU de consumo: sí, en tarjetas como GTX 1650, RTX 3050, RTX 4060 o superiores, con margen amplio.
- Despliegue: ONNX Runtime para la exportación `distilbert/onnx/model.onnx`, `joblib` para LexiStack, y ejecución en navegador con el JSON serializado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a esta tarea de clasificación.
- Latencia y throughput: no disponibles; el autor solo confirma la coincidencia de etiquetas entre exportaciones y checkpoint Python, sin cifras de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WAS 2026 #1264 (este) | no disponible (DistilBERT ~66 M) | no disponible | Clasificacion de titulares deportivos, 8 clases | no disponible (base Apache 2.0) | Hugging Face, 0 descargas |
| distilbert-base-uncased | ~66 M | 512 tokens | Modelo base de propósito general | Apache 2.0 | Ampliamente disponible |
| bert-base-uncased | ~110 M | 512 tokens | Modelo base de propósito general | Apache 2.0 | Ampliamente disponible |
| Modelos de clasificación de texto en inglés de terceros | variable | variable | Clasificación genérica | variable | variable |

La comparación directa con alternativas específicas de clasificación de titulares deportivos no está disponible en la información proporcionada. Frente a los modelos base, la diferencia principal es el ajuste fino sobre ocho clases concretas y la inclusión de un clasificador lineal ligero como alternativa interpretable.

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes, sin evidencia de uso en producción ni validación externa por parte de la comunidad.
- La licencia del conjunto de artefactos no está declarada; solo se reproduce la Apache 2.0 del checkpoint base de DistilBERT, por lo que el uso comercial requiere verificación adicional con el autor.
- El entrenamiento se realizó predominantemente en inglés y cubre únicamente los ocho deportes del mapa de etiquetas; el rendimiento en otros idiomas, medios o períodos temporales requiere evaluación separada, según advierte el propio autor.
- Riesgo de alucinación no aplicable en sentido generativo, pero sí de clasificación errónea en titulares ambiguos, con deportes solapados o vocabulario fuera de dominio.
- No se documentan sesgos conocidos ni análisis de equidad sobre el corpus.
- No se publican métricas de accuracy, F1 ni matrices de confusión, lo que impide estimar la calidad real del clasificador.
- La ventana de contexto no está especificada; al tratarse de titulares, se asume texto corto, pero no hay confirmación del límite efectivo del tokenizador en este ajuste.
- El tamaño del repositorio (0,5 GB) incluye varias exportaciones duplicadas, lo que puede complicar la selección del artefacto adecuado en despliegues automatizados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/budijuarto/was1264-sports-headline-models
- Demo interactiva: https://huggingface.co/spaces/budijuarto/was1264-sports-headline-demo
- Repositorio fuente: https://github.com/SeedFlora/was1264-sports-headline-classification
- Checkpoint base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased/tree/12040accade4e8a0f71eabdb258fecc2e7e948be
