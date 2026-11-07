# caeher/mbert-toxicidad-sv-v2

## Resumen

`caeher/mbert-toxicidad-sv-v2` es un clasificador de toxicidad en español salvadoreño obtenido por ajuste fino (fine-tuning) de `google-bert/bert-base-multilingual-cased`. Lo desarrolla el usuario caeher en el marco del proyecto `cde-project-ml-2026` (rama `v3-cristian`) y resuelve una tarea de clasificación multiclase en cuatro categorías: no tóxico, lenguaje ofensivo, discurso de odio y amenazas/violencia. Es relevante porque aborda una variante dialectal del español poco cubierta por los sistemas de moderación genéricos, con un conjunto de datos propio y una receta de entrenamiento documentada.

El repositorio no contiene un único modelo, sino tres ajustes independientes (semillas 42, 1337 y 2026); el modelo reportado es el ensemble por promedio de probabilidades de las tres semillas. Se distribuye en formato safetensors, con un script de normalización (`normalization.py`, versión 1.2) que debe aplicarse antes de la tokenización, con `max_length` 128.

La arquitectura subyacente es un transformer encoder BERT base multilingüe, con 12 capas y 110 millones de parámetros aproximadamente (según la ficha del modelo base). El modelo está pensado explícitamente para uso de investigación: el autor advierte que no está validado para moderación automática y que las etiquetas de parte del conjunto de evaluación proceden de consenso de anotadores LLM sin validación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base multilingüe, fine-tuning) |
| Parametros totales | ~110 M (heredados de `bert-base-multilingual-cased`; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 128 tokens (max_length indicado para tokenización) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Español (variante salvadoreña; el modelo base es multilingüe) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Clases de salida | 0 No Tóxico, 1 Lenguaje Ofensivo, 2 Discurso de Odio, 3 Amenazas/Violencia |
| Tamaño del repo | 2,1 GB (incluye tres semillas) |
| Normalizador requerido | `normalization.py` v1.2, aplicar `normalizar()` antes de tokenizar |

## Arquitectura y entrenamiento

El modelo parte de `bert-base-multilingual-cased`, un encoder transformer bidireccional de 12 capas y ~110 M de parámetros, y se ajusta como clasificador de secuencias con cabeza de clasificación de cuatro clases. No se trata de un modelo generativo ni de una arquitectura MoE o híbrida: es un encoder clásico para clasificación de texto, con ventana de 128 tokens, suficiente para mensajes y publicaciones cortas propias de moderación de contenido.

El entrenamiento usa únicamente `train.csv` del dataset v2.0.0 (20.028 filas) con `--peso_nuevos 0`. La selección de hiperparámetros y el early stopping se hacen solo con val + val_hilos (2.773 filas). La receta ganadora (M2, receta B de Optuna) emplea learning rate 3,92e-5, batch 32, 4 épocas, weight decay 0,006, warmup 0,116, peso_hilos 1,53 y peso_clase_extra 1,91. Venció a la receta M1 (lr 2e-5, batch 16) por F1 de validación en la semilla 42: 0,7099 frente a 0,7008. Se entrenan tres semillas y se promedian sus probabilidades en inferencia. No se documenta uso de RLHF ni DPO (no aplica a un clasificador de este tipo).

## Capacidades

- Clasificación de texto en cuatro categorías de toxicidad: no tóxico, lenguaje ofensivo, discurso de odio y amenazas/violencia.
- Detección específica de español salvadoreño, con normalización previa de texto mediante `normalizar()` (v1.2).
- Salida probabilística por clase, apta para umbralización configurable en pipelines de moderación.
- Ensemble de tres semillas para reducir varianza en las predicciones.
- No soporta tool calling ni function calling (es un clasificador, no un modelo de instrucciones).
- No soporta agentes ni razonamiento multi-paso.
- Capacidad multilingüe limitada en la práctica: aunque el modelo base es multilingüe, el ajuste se ha realizado solo con datos en español salvadoreño.
- No dispone de modo thinking, visión ni audio.

## Casos de uso

- Moderación de comentarios en comunidades digitales salvadoreñas: el modelo clasifica mensajes cortos en cuatro niveles de toxicidad, lo que permite aplicar políticas escalonadas (avisar, ocultar, expulsar) según la clase predicha y la probabilidad asociada.
- Prefiltrado en pipelines de revisión humana: dado su bajo coste computacional (encoder de ~110 M de parámetros), puede procesar grandes volúmenes de texto y derivar solo los casos dudosos a moderadores humanos, reduciendo carga operativa.
- Investigación sociolingüística sobre discurso de odio en español salvadoreño: sirve como línea base reproducible para comparar con otros clasificadores y estudiar la distribución de las cuatro clases en corpus propios.
- Monitorización de reputación de marca en redes sociales: clasificación automática de menciones para detectar amenazas o discurso de odio dirigido a una organización, con umbrales ajustables según tolerancia al riesgo.
- Análisis de toxicidad en foros y chats de comunidades de videojuegos: el modelo está entrenado sobre hilos de conversación (`test_hilos`), lo que lo hace adecuado para mensajes encadenados de baja longitud.
- Evaluación comparativa de sistemas de moderación: el repositorio incluye `metricas.json`, `eleccion_receta.json` y scripts de evaluación (`src/evaluation/comparar_v2.py`), lo que facilita reproducir la comparación frente a otros clasificadores en el mismo banco de pruebas.
- Filtrado previo en datasets de entrenamiento de otros modelos: para excluir contenido tóxico antes de usar corpus en español salvadoreño en tareas posteriores.

## Benchmarks y rendimiento

Resultados reportados por el autor en la model card:

| Metrica | Valor |
|---|---|
| F1-macro, test principal (test_hilos + banco congelado) | 0,642 (IC 95 %: 0,618–0,664) |
| Recall No Tóxico | 0,84 |
| Recall Lenguaje Ofensivo | 0,70 |
| Recall Discurso de Odio | 0,52 |
| Recall Amenazas/Violencia | 0,63 |
| FPR sobre No Tóxico | 0,157 |
| F1 test_hilos | 0,602 |
| F1 banco congelado | 0,639 |
| F1 test oficial (Etapa I) | 0,808 |
| Batería adversarial (144 casos) | 124 aciertos |

No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 para una sola semilla (~110 M de parámetros); el ensemble de tres semillas requiere cargar tres copias, aproximadamente 1,3–1,5 GB en fp32.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una NVIDIA T4, RTX 3060 o superior es más que suficiente. Para lotes grandes, A100 o H100 no aportan ventaja significativa por el tamaño reducido del modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650 en adelante) e incluso en CPU para volúmenes moderados.
- Opciones de despliegue: `transformers` con `AutoModelForSequenceClassification`, ONNX Runtime, TorchScript, o servidores de inferencia como TGI o vLLM (aunque este último está orientado a modelos generativos; para clasificación es más eficiente usar `transformers` o un servidor ligero tipo FastAPI). El repositorio relacionado `caeher/test-prompt-ml` documenta un despliegue con Docker que descarga los pesos en el primer arranque.
- Latencia y throughput: no disponibles en la información proporcionada. Por el tamaño del modelo, se espera un throughput alto en GPU (miles de secuencias cortas por segundo) y decenas de secuencias por segundo en CPU, pero son estimaciones no verificadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `caeher/mbert-toxicidad-sv-v2` | ~110 M | 128 tokens | Clasificación de toxicidad en 4 clases (es-SV) | No disponible | Hugging Face |
| `caeher/mbert-sv` | No disponible | No disponible | Clasificación relacionada (proyecto del mismo autor) | No disponible | Hugging Face |
| `bert-base-multilingual-cased` (Google) | ~110 M | 512 tokens | Modelo base multilingüe, sin cabeza de clasificación | Apache 2.0 (según ficha del modelo base) | Hugging Face |

No se dispone de datos de benchmarks de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias

- El autor indica explícitamente que el modelo no está validado para moderación automática y que su uso previsto es la investigación.
- Las etiquetas de los hilos de evaluación son consenso de anotadores LLM sin validación humana, lo que introduce incertidumbre en las métricas reportadas.
- El recall en discurso de odio es bajo (0,52) y el FPR sobre no tóxico es alto (0,157): en producción esto implica tanto falsos negativos en la clase más sensible como falsos positivos sobre contenido legítimo.
- El F1-macro en el test principal (0,642) es moderado; el F1 de 0,808 corresponde al test oficial de la Etapa I, un conjunto distinto y presumiblemente más fácil, por lo que no debe tomarse como rendimiento global.
- Ventana de contexto de 128 tokens: no apta para documentos largos ni conversaciones extensas sin truncado o segmentación previa.
- Entrenado solo con datos en español salvadoreño; su comportamiento en otras variantes del español o en registros formales no está caracterizado.
- La licencia no está disponible en la información proporcionada, lo que impide confirmar si se permite uso comercial.
- El repositorio incluye tres semillas y el modelo reportado es el ensemble; usar una sola semilla puede degradar ligeramente el rendimiento respecto a las métricas publicadas.
- Requiere aplicar el normalizador `normalization.py` v1.2 antes de tokenizar; omitirlo puede alterar las predicciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/caeher/mbert-toxicidad-sv-v2
- Modelo relacionado del mismo autor: https://huggingface.co/caeher/mbert-sv
- Repositorio de la aplicación de pruebas: https://github.com/caeher/test-prompt-ml/tree/main
- Modelo base: https://huggingface.co/google-bert/bert-base-multilingual-cased
