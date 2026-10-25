# cpral/poziomka-ocena-jakosci-polskie-sprawy-v8

## Resumen

`cpral/poziomka-ocena-jakosci-polskie-sprawy-v8` no es un modelo de lenguaje: es un modelo de regresión tabular construido con AutoGluon 1.6.3 que predice, en una escala de 1 a 100, la utilidad de una conversación concreta del conjunto `polskie-sprawy v8` (versión `polskie_sprawy_v8_osedziowane`) como dato de ajuste supervisado (SFT) para Poziomka, un asistente polaco pequeño de unos 4B de parámetros totales y 1,15B activos. El modelo lo publica el usuario `cpral` y su función es añadir un campo `jakosc` a cada registro del corpus; el filtrado posterior se hace aplicando un umbral o conservando el mejor X% de las conversaciones.

La relevancia práctica está en sustituir un juicio humano o un LLM juez caro por un evaluador tabular rápido (del orden de 1000 conversaciones por segundo en una RTX 5080) y reproducible, entrenado a partir de 500 valoraciones hechas por un juez LLM con una rúbrica escrita. El modelo consume únicamente características tabulares derivadas de la conversación (puntuaciones del juez basal `magpie.judge_conv` 2.0, longitudes, estadísticas de texto y campos de metadatos), sin embeddings de texto.

El rendimiento declarado es notable para la categoría: Spearman de 0,711 en validación out-of-fold con 500 valoraciones y 0,744 en un conjunto de test retenido de 46 conversaciones, frente a 0,665 de CatBoost y 0,636 de XGBoost. El propio autor advierte que, como todo modelo de regresión, comprime las puntuaciones extremas hacia el centro, por lo que debe interpretarse principalmente como un ranking y no como una nota absoluta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Ensamble apilado de AutoGluon (`WeightedEnsemble_L2`) sobre modelos tabulares: NeuralNetTorch (peso 0,52), TabICL v2 (0,30) y RealMLP (0,18); preset `extreme_quality`, bagging 8 veces repetido 5 veces, sin Mitra |
| Parámetros totales | No disponible (el autor no publica recuento de parámetros de los submodelos) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: la entrada es un vector de características tabulares por conversación, no una secuencia de tokens; el alcance temporal lo fija el juez basal que calcula las features |
| Tipos de cuantización | No disponible; no se publican versiones cuantizadas (no hay GGUF ni safetensors) |
| Idiomas soportados | Polaco (`pl`); las características lingüísticas (proporción de caracteres polacos, etc.) están diseñadas para texto en polaco |
| Licencia | No disponible |
| Formato de pesos | Directorio de `TabularPredictor` de AutoGluon (`autogluon/`), más `schemat.json`, `cechy.py`, `predict.py`, `train.jsonl`, `raport.json` y `oof.jsonl`; tamaño del repositorio 0,9 GB |
| Librería / runtime | `autogluon.tabular[tabicl,tabdpt,realmlp,nori]==1.6.3` (con CatBoost y XGBoost instalados); requiere GPU con CUDA |
| Tarea (`pipeline_tag`) | `tabular-regression` |
| Entradas | Vector de features tabulares por conversación según `schemat.json` |
| Salida | Puntuación continua de calidad (1–100), emitida como `{"id": ..., "jakosc": 63.2}` |

## Arquitectura y entrenamiento

El modelo es un ensamble de AutoGluon 1.6.3 con el preset `extreme_quality`, ejecutado con el conjunto completo de modelos disponibles salvo Mitra y con bagging de 8 pliegues repetido 5 veces. El `WeightedEnsemble_L2` final combina tres aprendices con pesos fijados por el apilado: una red neuronal sobre torch (0,52), TabICL v2 (0,30) y RealMLP (0,18). No hay componente de lenguaje: toda la señal proviene de features tabulares calculadas por `cechy.py`.

Los datos de entrenamiento son 500 conversaciones muestreadas del corpus, el 80% de forma aleatoria y el 20% restante con un `dobry_przyklad_sft` basal en la banda límite 0,35–0,65 para forzar ejemplos cercanos al umbral de decisión. Cada conversación fue puntuada de 1 a 100 por un juez LLM siguiendo una rúbrica escrita (criterio benevolente, con penalizaciones proporcionales al daño; se permiten role-play y ficción). La distribución resultante tiene media 40,7, mediana 39 y un 20% de valoraciones ≥ 70. El archivo `train.jsonl` incluye el registro original más `ocena_reczna` (puntuación, justificación de una frase y tipo de muestra).

Las features se agrupan en cuatro bloques: (1) salidas del juez basal 2.0 de `magpie.judge_conv`, es decir, `ocena.*` con P(sí) para cada pregunta (`halucynacje`, `dobry_przyklad_sft`, `powtorzone_pytania`, `powtorzone_odpowiedzi`, `rozumowanie_sensowne`); (2) longitudes de turnos de asistente, usuario y sistema, respuesta más larga, más corta y media, longitud del razonamiento, ratio respuesta/pregunta y número de turnos de usuario; (3) estadísticas de superficie del texto (proporción de caracteres polacos, dígitos y mayúsculas, bloques de código, encabezados, listas, párrafos, respuestas vacías, presencia de `tools` y de system prompt); y (4) campos de metadatos de baja cardinalidad (`meta.thinking`, `meta.reasoning_effort`, `meta.persona`, `meta.model`, `meta.topic`, etc.), con las categorías vistas menos de 3 veces en entrenamiento agrupadas en «otros». Cada fila debe compartir la misma evaluación basal (mismas preguntas, basal 2.0 max); sin ella faltan las features más informativas.

## Capacidades

- Predicción de calidad de una conversación del corpus `polskie-sprawy v8` en escala 1–100, pensada para añadirse como campo `jakosc` a cada registro.
- Ranking de conversaciones por utilidad estimada como dato de SFT, adecuado para selección por umbral o por top-X%.
- Detección implícita de conversaciones problemáticas: el modelo aprende de features asociadas a alucinaciones, preguntas y respuestas repetidas y razonamiento poco sensato.
- Sensibilidad a la estructura del dato: codifica la presencia de bloques de código, listas, encabezados, respuestas vacías, uso de herramientas y de system prompt.
- Aprovechamiento de metadatos de generación (`meta.model`, `meta.thinking`, `meta.reasoning_effort`, `meta.persona`, `meta.topic`) para modular la estimación.
- Inferencia por lotes de alto rendimiento: alrededor de 1000 conversaciones por segundo en una RTX 5080.
- No soporta tool calling, function calling, razonamiento multi-paso, visión, audio ni generación de texto: es exclusivamente un regresor tabular.
- Multilingüismo: no aplica; el modelo está entrenado y ajustado para polaco.

## Casos de uso

- Curación de un corpus de SFT en polaco: ejecutar `predict.py` sobre el JSONL completo para obtener un `jakosc` por conversación y a continuación aplicar un umbral (por ejemplo ≥ 70) para descartar el material de baja calidad antes del entrenamiento de Poziomka.
- Selección por percentil en lugar de umbral absoluto: ordenar por `jakosc` y quedarse con el mejor 20–50%, una estrategia más robusta que el corte fijo dado que el modelo comprime los extremos hacia la media.
- Priorización del etiquetado humano: usar las predicciones para ordenar el corpus y enviar a revisión manual únicamente la franja dudosa (por ejemplo, predicciones entre 45 y 65), reduciendo el coste de anotación.
- Auditoría de lotes de generación sintética: comparar la distribución de `jakosc` entre lotes producidos con distintos `meta.model` o `meta.reasoning_effort` para detectar configuraciones que degradan la calidad media.
- Control de regresiones en el pipeline de datos: integrar el predictor como paso de validación que falla o alerta si la puntuación media de un lote nuevo cae por debajo de un valor de referencia (el corpus sin filtrar promedia 38,0).
- Detección de conversaciones degeneradas: las features de respuestas vacías, repetición de preguntas y respuestas y proporción de caracteres anómalos hacen que el modelo puntúe bajo en diálogos truncados o mal formados, útiles como filtro de sanidad previo.
- Experimentación con mezclas de datos: estimar la calidad media de distintas mezclas o subconjuntos antes de lanzar un entrenamiento costoso, dado el throughput de aproximadamente 1000 conversaciones por segundo.
- Estos casos quedan restringidos al corpus para el que el modelo fue entrenado; para un segundo conjunto de datos el autor indica que existe un modelo separado.

## Benchmarks y rendimiento

Conjunto de test retenido: 46 conversaciones de una segunda tanda de valoraciones, nunca vistas en entrenamiento. La receta evaluada se entrenó sobre 400 valoraciones (10 minutos, una pasada de bagging, con Mitra), por lo que es un pariente cercano del modelo publicado y no el modelo exacto:

| Modelo | Spearman | AUC ≥ 70 | AUC ≥ 50 | Puntuación media en el 50% superior |
|---|---|---|---|---|
| Basal `dobry_przyklad_sft` | 0,398 | 0,637 | 0,652 | 50,3 |
| CatBoost (parámetros fijos) | 0,743 | 0,844 | 0,836 | 57,9 |
| XGBoost (parámetros fijos) | 0,652 | 0,838 | 0,789 | 57,6 |
| AutoGluon | 0,744 | 0,868 | 0,828 | 55,3 |
| Sin filtrado | — | — | — | 38,0 |

El autor señala que, con unas 45 conversaciones de test, la incertidumbre del Spearman es de aproximadamente ±0,1.

Validación out-of-fold con las 500 valoraciones de este modelo (CatBoost y XGBoost con validación cruzada de 5 pliegues repetida 5 veces; AutoGluon a partir de su propio bagging, con resultado ligeramente optimista porque la selección de modelos y pesos usa los mismos pliegues):

| Modelo | Spearman | RMSE | AUC ≥ 70 | AUC ≥ 50 |
|---|---|---|---|---|
| Basal `dobry_przyklad_sft` | 0,370 | — | 0,644 | 0,663 |
| CatBoost | 0,665 | 20,5 | 0,815 | 0,827 |
| XGBoost | 0,636 | 21,2 | 0,800 | 0,815 |
| AutoGluon (este modelo) | 0,711 | 19,4 | 0,836 | 0,851 |

## Requisitos de hardware

- GPU con CUDA obligatoria: TabICL, TabDPT y las redes neuronales del ensamble se ejecutan en GPU según la model card.
- VRAM estimada: no publicada. Como referencia, el repositorio completo ocupa 0,9 GB, por lo que los artefactos del predictor son pequeños; una estimación prudente sitúa el pico de inferencia en el rango de 4–12 GB, pero es una estimación, no un dato del autor.
- Throughput declarado: aproximadamente 1000 conversaciones por segundo en una RTX 5080.
- Cabe en GPU de consumo: el autor cita explícitamente la RTX 5080; no se documentan pruebas en tarjetas de gama inferior ni en CPU.
- Despliegue: `TabularPredictor` de AutoGluon cargado desde `autogluon/` y ejecutado con `predict.py`; el flujo es por lotes (JSONL de entrada, JSONL de salida). No aplican vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- Instalación: `pip install "autogluon.tabular[tabicl,tabdpt,realmlp,nori]==1.6.3" catboost xgboost`.
- Latencia por petición individual no disponible; el rendimiento está caracterizado en régimen de lote.

## Comparativa con modelos similares

Comparación con las alternativas evaluadas por el propio autor sobre el mismo conjunto de test retenido de 46 conversaciones:

| Modelo | Tipo | Spearman (test) | AUC ≥ 70 | Media en top 50% | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (AutoGluon) | Ensamble tabular | 0,744 | 0,868 | 55,3 | No disponible | HuggingFace, 0,9 GB, 0 descargas |
| CatBoost | GBDT tabular | 0,743 | 0,844 | 57,9 | No disponible en esta ficha | Configuración reproducible con parámetros fijos |
| XGBoost | GBDT tabular | 0,652 | 0,838 | 57,6 | No disponible en esta ficha | Configuración reproducible con parámetros fijos |
| Basal `dobry_przyklad_sft` | Puntuación del juez LLM | 0,398 | 0,637 | 50,3 | No disponible | Feature incluida en el propio corpus |

Observación relevante: CatBoost iguala prácticamente a AutoGluon en Spearman sobre test (0,743 frente a 0,744) y lo supera en la puntuación media del 50% superior (57,9 frente a 55,3), con un coste de inferencia mucho menor al no necesitar GPU. La ventaja de AutoGluon se concentra en out-of-fold (0,711 frente a 0,665) y en el AUC ≥ 70 (0,836 frente a 0,815). No se dispone de comparaciones con modelos de juicio basados en LLM o cross-encoders en la información proporcionada.

## Limitaciones y advertencias

- Especialización estricta: el modelo solo es válido para el corpus `polskie-sprawy v8`; para un segundo conjunto de datos el autor indica que existe un modelo separado. Usarlo fuera de dominio produce puntuaciones sin significado.
- Dependencia dura de las features: cada fila necesita la misma evaluación basal 2.0 de `magpie.judge_conv` (mismas preguntas); sin ella faltan las features más predictivas y la predicción no es fiable.
- Compresión de extremos: como todo regresor, arrastra las puntuaciones hacia el centro. El autor recomienda tratarlo como ranking, no como nota absoluta; el valor `jakosc` no debe interpretarse como una calificación calibrada de 1 a 100.
- Incertidumbre de las métricas: el test retenido tiene solo 46 conversaciones (Spearman ±0,1) y el resultado out-of-fold está ligeramente inflado por el uso de los mismos pliegues en la selección de modelos y pesos del ensamble.
- Etiquetas derivadas de un juez LLM: el objetivo de regresión procede de valoraciones automáticas con una rúbrica que admite role-play y ficción y aplica un criterio descrito como benevolente; los sesgos del juez se propagan al regresor.
- Sesgos no documentados: no se publica análisis de sesgo por tema, persona, modelo generador ni longitud de conversación.
- Licencia no disponible: no se especifican términos de uso comercial, redistribución ni modificación; en producción esto es un bloqueo que debe resolverse con el autor antes de cualquier despliegue.
- Requiere GPU CUDA para una inferencia práctica; no se documenta funcionamiento en CPU ni en hardware sin CUDA.
- Advertencia sobre la información de referencia: la model card está en polaco y sus tablas de evaluación distinguen explícitamente entre un modelo "pariente cercano" (400 valoraciones, con Mitra) y el modelo publicado (500 valoraciones); no deben confundirse ambas cifras.
- Los resultados de búsqueda web asociados a esta consulta no contienen información técnica ni enlaces relevantes sobre el modelo; se han descartado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cpral/poziomka-ocena-jakosci-polskie-sprawy-v8
- No se han encontrado en la búsqueda web otros enlaces relevantes (papers, blogs, repositorios o demos) relacionados con este modelo.
