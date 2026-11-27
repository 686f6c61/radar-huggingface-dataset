# davanstrien/ultrabert-380m-curation

## Resumen

UltraBERT Curation es un modelo de decisión de 380 millones de parámetros especializado en tareas de curación de datos (data curation). Lo desarrolla davanstrien y se construye sobre el encoder `dmis-lab/UltraBERT-380M`, al que se le añade una cabeza de scoring GLiClass. En lugar de generar texto, el modelo recibe un estado (una página web, un prompt, un problema matemático, un registro bibliotecario) y un conjunto de preguntas tipadas con opciones nombradas, y devuelve una probabilidad para cada opción de cada pregunta. Habla la API de decisión Jev / System One (`choice`, `noul` para sí/no, `score` sobre niveles ordenados) y también funciona como clasificador zero-shot GLiClass convencional.

El interés principal del lanzamiento no es solo el modelo, sino que se publican tanto los datos de entrenamiento como la receta completa que los produjo: fuentes, etiquetadores, licencias y decisiones de datos. Es un ejemplo de transparencia en la construcción de datasets para modelos de decisión pequeños. El conjunto de entrenamiento tiene 535.730 filas, de las cuales se liberan 516.964 (se excluyen 18.766 sin licencia abierta verificada).

El modelo está pensado para preguntas de curación concretas (tema, formato, valor educativo, dificultad, tipo de tarea, validez, clase de catálogo) y no para decisiones generales como juzgar calidad de respuestas o seguridad. Su puntuación de curación es 0,705 (media de 16 unidades de test), frente a 0,500 de GLiClass Edge y 0,582 de d1-2B. En el índice de decisiones generales obtiene 22,1, muy por debajo de GLiClass Edge (47,5) y d1-2B (51,1): es un especialista, no un modelo de decisión general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder UltraBERT-380M + cabeza de scoring GLiClass |
| Parametros totales | 382.296.577 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Libreria | gliclass |
| Pipeline | zero-shot-classification |
| Modelo base | dmis-lab/UltraBERT-380M |
| Tamano del repo | 1,5 GB |

## Arquitectura y entrenamiento

El modelo combina un encoder transformer UltraBERT-380M con una cabeza de scoring GLiClass. No genera texto: produce una distribución de probabilidad sobre las opciones de cada pregunta tipada. Soporta tres tipos de pregunta: `choice` (selección entre opciones nombradas), `noul` (sí/no) y `score` (niveles ordenados). Esta interfaz se corresponde con la API de decisión Jev / System One.

El entrenamiento se realizó sobre el dataset `davanstrien/curation-decision-mix`, con 535.730 filas de las que se liberan 516.964 (se excluyen 18.766 sin licencia abierta verificada). Cada fila incluye fuente, etiquetador y licencia. Todo el cómputo se ejecutó en Hugging Face Jobs: una ejecución de entrenamiento dura aproximadamente una hora en una GPU (unos 3 dólares). La receta completa (construcción de datos, entrenamiento, evaluación e inferencia) está publicada en el repositorio `github.com/davanstrien/curation-decision-recipe`. No se detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF/DPO.

## Capacidades

- Clasificación zero-shot con etiquetas candidatas nombradas (pipeline GLiClass).
- Decisiones tipadas: `choice` (elección entre opciones), `noul` (sí/no) y `score` (niveles ordenados).
- Preguntas de curación sobre páginas web: tema, formato, valor educativo, dificultad, tipo de tarea, validez, clase de catálogo.
- Preguntas de curación sobre prompts, problemas matemáticos y registros bibliotecarios.
- Salida de probabilidades por opción, sin generación de texto.
- Scoring por lotes empaquetado en GPU (`fast_inference.py`).
- Script de un solo comando para Jobs (`curate.py`).
- Solo inglés.

## Casos de uso

- Curación de datasets web a gran escala: el modelo puntúa páginas de FineWeb con preguntas de tema, formato y valor educativo; el autor publicó 1.020.000 páginas puntuadas y un subconjunto de 63.788 páginas en `davanstrien/fineweb-curated-1m`. Es adecuado por su velocidad (~530 filas-pregunta/s en una RTX PRO 6000 con la ruta empaquetada) y por devolver probabilidades en lugar de texto.
- Filtrado de valor educativo: clasificar páginas como "not educational", "minimal educational value", "some educational value", "useful for education" o "highly educational" mediante la pregunta `score` ordenada, útil para construir corpus de entrenamiento.
- Clasificación de formato de documento: distinguir entre artículo de noticias, tutorial, página de producto, blog personal o spam/ads con la pregunta `choice`, para enrutar contenidos en pipelines de ingestión.
- Curación de registros bibliotecarios: asignar clase de catálogo y validez a registros, aprovechando que el modelo se entrenó también con ese tipo de estado.
- Evaluación de dificultad de problemas matemáticos: usar la pregunta `score` sobre niveles de dificultad para ordenar o estratificar problemas en un dataset de entrenamiento.
- Detección de spam y anuncios: pregunta `noul` de sí/no o `choice` con la etiqueta "Spam / Ads" para limpiar corpus antes del preentrenamiento.
- Enrutado de prompts: clasificar prompts por tipo de tarea antes de enviarlos a un modelo generativo, reduciendo coste al no invocar el modelo grande para decisiones simples.

## Benchmarks y rendimiento

| Metrica | UltraBERT Curation | GLiClass Edge | d1-2B |
|---|---|---|---|
| Curation score (media de 16 unidades de test) | 0,705 | 0,500 | 0,582 |
| Decision Index (decisiones generales) | 22,1 | 47,5 | 51,1 |
| Parametros | 380M | ~440M | 2B |

Velocidad: ~530 filas-pregunta/s en una RTX PRO 6000 con la ruta de inferencia empaquetada. No se detallan en la información disponible los resultados por benchmark individual (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 382M parámetros en safetensors (repo de 1,5 GB), la inferencia en fp16 requiere del orden de 1 GB de pesos, más overhead de activaciones y lote.
- GPU recomendadas: el autor reporta pruebas en una RTX PRO 6000; cualquier GPU con suficiente VRAM para el lote debería servir.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 4090, RTX 3090 y similares con VRAM suficiente; no se confirma en la información disponible.
- Opciones de despliegue: pipeline GLiClass, `jev_api.py` (API Jev / System One), `fast_inference.py` (scoring por lotes empaquetado en GPU) y `curate.py` (script de Jobs).
- Latencia y throughput: ~530 filas-pregunta/s en una RTX PRO 6000 con la ruta empaquetada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Curation score | Decision Index | Licencia |
|---|---|---|---|---|---|
| UltraBERT Curation | 380M | Especialista en curación | 0,705 | 22,1 | apache-2.0 |
| GLiClass Edge (Knowledgator) | ~440M | Decisión general pequeña | 0,500 | 47,5 | no disponible |
| d1-2B (Liquid AI) | 2B | Decisión general | 0,582 | 51,1 | no disponible |

UltraBERT Curation gana claramente en tareas de curación pero pierde frente a los modelos generales en el índice de decisiones generales. La comparación se hizo sobre las mismas entradas.

## Limitaciones y advertencias

- Es un especialista en curación: no debe usarse para decisiones generales como juzgar calidad de respuestas, predecir tasas de aprobados o seguridad.
- Solo soporta inglés.
- Riesgo de sesgo heredado de las fuentes y etiquetadores del dataset de entrenamiento; la model card no detalla sesgos concretos.
- Riesgo de alucinación no aplica en el sentido generativo (no produce texto), pero sí puede asignar probabilidades erróneas a opciones fuera de su dominio de entrenamiento.
- La longitud de contexto no está documentada; estados muy largos pueden truncarse.
- Licencia apache-2.0 permite uso comercial, pero conviene verificar las licencias de las fuentes del dataset de entrenamiento (el autor excluyó 18.766 filas sin licencia abierta verificada).
- No se han publicado detalles sobre cuantizaciones ni sobre el rendimiento en benchmarks estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/davanstrien/ultrabert-380m-curation
- Dataset de entrenamiento: https://huggingface.co/datasets/davanstrien/curation-decision-mix
- Receta (GitHub): https://github.com/davanstrien/curation-decision-recipe
- Salida de ejemplo (1M páginas FineWeb puntuadas): https://huggingface.co/datasets/davanstrien/fineweb-curated-1m
- Modelo base: https://huggingface.co/dmis-lab/UltraBERT-380M
- GLiClass Edge: https://huggingface.co/knowledgator/gliclass-v4-edge
- d1-2B: https://huggingface.co/LiquidAI/d1-2B
- Papers referenciados en tags: arxiv:2203.05482, arxiv:2502.10341, arxiv:2406.17557, arxiv:2506.14111, arxiv:1805.01042, arxiv:1803.02324
