# cpral/poziomka-ocena-jakosci-fun-rp-v12

## Resumen

`cpral/poziomka-ocena-jakosci-fun-rp-v12` no es un modelo de lenguaje, sino un regresor tabular entrenado con AutoGluon 1.6.3 que predice, en una escala de 1 a 100, la utilidad de una conversación del conjunto `poziomka-fun-rp-v12-nothink` como dato de ajuste supervisado (SFT) para Poziomka, un asistente polaco pequeño de aproximadamente 4B parámetros totales y 1,15B activos. El modelo lo publica el usuario `cpral` en HuggingFace y su función es añadir un campo `jakosc` (calidad) a cada registro del corpus, de modo que el filtrado posterior se haga con un umbral o conservando el mejor X% de las conversaciones.

La relevancia práctica está en la curación de datos: en lugar de entrenar un juez generativo costoso por cada conversación, este modelo calcula características tabulares de la conversación (puntuaciones basal de `magpie.judge_conv`, longitudes, estadísticas de texto, presencia de herramientas y metadatos) y devuelve una puntuación calibrada contra un juez LLM. Está especializado en un único corpus: el autor indica explícitamente que para el segundo conjunto de datos hace falta un modelo distinto.

El modelo es deliberadamente ligero en inferencia (alrededor de 1000 conversaciones por segundo en una RTX 5080) y su valor se mide por correlación de ranking con el juez humano/LLM, no por métricas de generación. Su licencia no está declarada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensemble tabular de AutoGluon 1.6.3, preset `extreme_quality` sin Mitra; `WeightedEnsemble_L2` compuesto por NeuralNetTorch (peso 0,80), XGBoost (0,17) y TabM (0,03); bagging de 8 pliegues repetido 5 veces |
| Parametros totales | no disponible (ensemble tabular; el concepto de recuento de parámetros no aplica de forma directa) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: la entrada es un vector de características tabulares por conversación, no una secuencia de texto |
| Tipos de cuantizacion | no disponible (no se distribuyen pesos en formatos cuantizados tipo GGUF o GPTQ) |
| Idiomas soportados | pl (polaco); el modelo no procesa texto en bruto, sino características derivadas de conversaciones en polaco |
| Licencia | no disponible |
| Formato de pesos | Predictor `TabularPredictor` de AutoGluon en el directorio `autogluon/`; no hay safetensors ni GGUF. Se acompañan `schemat.json`, `cechy.py`, `predict.py`, `train.jsonl`, `raport.json` y `oof.jsonl` |

## Arquitectura y entrenamiento

El sistema es un pipeline de dos etapas. Primero, `cechy.py` calcula un conjunto de características tabulares por conversación: las puntuaciones basal 2.0 max de `magpie.judge_conv` (`halucynacje`, `dobry_przyklad_sft`, `odgrywanie_rol`, `powtorzone_pytania`, `powtorzone_odpowiedzi`), longitudes en caracteres de los turnos de asistente, usuario y sistema (máxima, mínima, media, longitud del razonamiento, ratio respuesta/pregunta, número de turnos de usuario), estadísticas de texto (proporción de caracteres polacos, dígitos y mayúsculas, bloques de código, encabezados, listas, párrafos, respuestas vacías, presencia de `tools` y de system prompt) y metadatos de baja cardinalidad (`source_dataset`, `category`, `reasoning_profile`, `hybrid_format`), con las categorías con menos de 3 apariciones en entrenamiento agrupadas en «inne». No se usan embeddings de texto. Después, AutoGluon entrena un `WeightedEnsemble_L2` sobre esas características con el preset `extreme_quality`, sin el modelo Mitra y con bagging de 8 pliegues repetido 5 veces.

El conjunto de entrenamiento son 500 conversaciones muestreadas del corpus: un 80% de forma prácticamente aleatoria y un 20% de la franja limítrofe del basal `dobry_przyklad_sft` entre 0,35 y 0,65. Cada conversación fue puntuada de 1 a 100 por un juez LLM siguiendo una instrucción escrita (criterio benevolente, con penalizaciones proporcionales al daño; se permiten roleplay y ficción). La distribución resultante tiene media 53,5, mediana 53 y un 32% de puntuaciones ≥ 70. Estas etiquetas se publican en `train.jsonl` junto con el registro original y el campo `ocena_reczna` (puntuación, justificación de una frase y tipo de muestra). No se han publicado datos sobre volumen total de tokens de entrenamiento ni sobre uso de RLHF o DPO, ya que no aplica a un regresor.

## Capacidades

- Predicción de una puntuación de calidad de 1 a 100 para conversaciones del corpus `poziomka-fun-rp-v12-nothink`.
- Ordenación (ranking) fiable de conversaciones por utilidad estimada para SFT, según la correlación de Spearman reportada.
- Clasificación implícita mediante umbrales: separación de muestras «buenas» (≥ 70) y «útiles» (≥ 50) con AUC reportado de 0,877 y 0,854 en validación out-of-fold.
- Filtrado por porcentaje: selección del mejor X% del corpus, o corte por umbral absoluto.
- Extracción de señal a partir de puntuaciones basal de `magpie.judge_conv`, por lo que requiere que cada fila tenga la misma evaluación basal 2.0 max con las mismas preguntas.
- Procesamiento por lotes de alto rendimiento: el autor reporta aproximadamente 1000 conversaciones por segundo en una RTX 5080.
- Integración como paso previo a un pipeline de entrenamiento (script `predict.py` que lee `sft.jsonl` y emite líneas `{"id": ..., "jakosc": ...}`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión ni audio; no genera texto.

## Casos de uso

- Curación de un corpus de SFT para Poziomka: ejecutar `predict.py` sobre el JSONL completo y añadir el campo `jakosc` a cada registro antes de construir el dataset de entrenamiento, aprovechando el rendimiento de ~1000 conversaciones/s para procesar corpus grandes en minutos.
- Filtrado por umbral absoluto: conservar únicamente las conversaciones con `jakosc` ≥ 70 (el 32% del corpus de referencia), reduciendo el ruido de ejemplos de baja calidad sin intervención manual.
- Selección del mejor X%: ordenar por `jakosc` y quedarse con el 25% o el 50% superior, una estrategia útil cuando se quiere mantener un volumen fijo de datos y maximizar la calidad media (el modelo reporta una media de 67,9 en el 50% superior frente a 52,3 sin filtro en su conjunto de prueba).
- Auditoría de la generación sintética: comparar la distribución de puntuaciones entre distintas configuraciones de generación (por ejemplo, distintos `reasoning_profile` o `hybrid_format`) y detectar qué configuración produce datos con mayor calidad media.
- Detección de regresiones en el pipeline de datos: puntuar un lote de conversaciones nuevas generadas tras un cambio de prompt o de modelo generador y comparar con la línea base almacenada en `oof.jsonl` y `raport.json`.
- Construcción de currículos de entrenamiento: usar el ranking continuo (no solo el umbral) para ordenar las muestras de menor a mayor dificultad o calidad y programar fases de entrenamiento progresivas.
- Priorización de revisión humana: enviar a anotación manual solo las conversaciones en la franja intermedia (por ejemplo, 45–65), donde la incertidumbre del modelo es mayor, en lugar de revisar el corpus completo.
- Investigación sobre calidad de datos: usar el modelo como aproximación reproducible y barata de un juez LLM para estudiar la relación entre características superficiales (longitud, estructura, presencia de herramientas) y calidad percibida.

## Benchmarks y rendimiento

El autor publica dos evaluaciones. La primera es sobre un conjunto de prueba retenido de 43 conversaciones de una segunda tanda de anotaciones, nunca vistas en entrenamiento, usando un modelo «cercano» entrenado con 400 puntuaciones (10 minutos, una pasada de bagging, con Mitra). La incertidumbre del Spearman con ~45 conversaciones es de aproximadamente ±0,1.

| Modelo | Spearman | AUC ≥ 70 | AUC ≥ 50 | Media de puntuación, 50% superior |
|---|---|---|---|---|
| Basal `dobry_przyklad_sft` | 0,512 | 0,713 | 0,741 | 64,0 |
| CatBoost (parámetros fijos) | 0,758 | 0,903 | 0,862 | 68,2 |
| XGBoost (parámetros fijos) | 0,695 | 0,874 | 0,807 | 64,6 |
| AutoGluon | 0,794 | 0,923 | 0,871 | 67,9 |
| Sin filtro | — | — | — | 52,3 |

La segunda es out-of-fold sobre las 500 puntuaciones, con CatBoost y XGBoost en validación cruzada de 5 pliegues repetida 5 veces y AutoGluon usando su propio bagging (el autor advierte que este resultado está ligeramente inflado, porque la selección de modelos y pesos del ensemble usa los mismos pliegues).

| Modelo | Spearman | RMSE | AUC ≥ 70 | AUC ≥ 50 |
|---|---|---|---|---|
| Basal `dobry_przyklad_sft` | 0,415 | no disponible | 0,675 | 0,729 |
| CatBoost | 0,614 | 21,8 | 0,836 | 0,831 |
| XGBoost | 0,601 | 22,2 | 0,828 | 0,821 |
| AutoGluon (este modelo) | 0,687 | 20,1 | 0,877 | 0,854 |

No se han publicado resultados de benchmarks estándar de LLM (MMLU, HumanEval, GSM8K) en la información disponible, ni tendrían sentido para un regresor tabular. El autor señala que, como todo modelo de regresión, comprime las puntuaciones extremas hacia el centro, por lo que el resultado debe interpretarse como un ranking más que como una puntuación absoluta.

## Requisitos de hardware

- VRAM estimada: no disponible en la información proporcionada; el tamaño del repositorio es de 0,9 GB, lo que da una cota superior aproximada del espacio en disco necesario para los artefactos del predictor.
- GPU: se requiere una GPU con CUDA, ya que TabICL, TabDPT y las redes neuronales del ensemble se calculan en ella. El autor cita una RTX 5080 como referencia, con ~1000 conversaciones/s.
- No se documenta si el modelo puede ejecutarse solo en CPU; la model card indica que se necesita GPU con CUDA.
- Despliegue: script `predict.py` sobre `TabularPredictor` de AutoGluon, con dependencias `autogluon.tabular[tabicl,tabdpt,realmlp,nori]==1.6.3`, `catboost` y `xgboost`. No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo generativo.
- Latencia y throughput: ~1000 conversaciones/s en RTX 5080 según el autor; no se publican latencias por lote ni curvas de escalado.

## Comparativa con modelos similares

Dentro de su categoría (regresores tabulares para puntuar calidad de datos), el autor compara con dos alternativas directas y con la heurística basal incluida en las características:

| Modelo | Tipo | Spearman (holdout, 43) | RMSE (OOF) | AUC ≥ 70 (OOF) | Licencia |
|---|---|---|---|---|---|
| AutoGluon (este modelo) | Ensemble (NeuralNetTorch + XGBoost + TabM) | 0,794 | 20,1 | 0,877 | no disponible |
| CatBoost | Gradient boosting | 0,758 | 21,8 | 0,836 | no disponible en la ficha (licencia propia de CatBoost) |
| XGBoost | Gradient boosting | 0,695 | 22,2 | 0,828 | no disponible en la ficha (licencia propia de XGBoost) |
| Basal `dobry_przyklad_sft` | Heurística de una sola característica | 0,512 | no disponible | 0,675 | no aplica |

No se dispone de comparación con jueces LLM generativos (por ejemplo, un LLM que puntúe conversaciones directamente) ni con otros filtradores de datos publicados, por lo que esa comparación figura como no disponible.

## Limitaciones y advertencias

- Especialización estricta: el modelo solo es válido para el corpus `poziomka-fun-rp-v12-nothink`; el propio autor indica que para el segundo conjunto de datos hace falta un modelo distinto. Aplicarlo fuera de ese dominio invalida las métricas reportadas.
- Dependencia de las características basal: cada fila debe llevar la misma evaluación basal 2.0 max de `magpie.judge_conv`, con las mismas preguntas. Sin ella faltan las características más informativas y la predicción deja de ser fiable.
- Compresión de extremos: como todo modelo de regresión, atrae las puntuaciones hacia la media; debe usarse como ranking y no como una nota absoluta comparable entre corpus.
- Etiquetas heredadas de un juez LLM: las 500 puntuaciones de entrenamiento provienen de un evaluador automático con una instrucción escrita concreta (criterio benevolente, penalizaciones proporcionales al daño, roleplay y ficción permitidos). Los sesgos de ese juez se transfieren al regresor.
- Riesgo de sobreajuste a artefactos superficiales: al no usar embeddings de texto, el modelo se apoya en longitudes, proporciones de caracteres, presencia de encabezados, listas, bloques de código y herramientas. Un filtrado agresivo puede favorecer estilos concretos y reducir la diversidad del corpus.
- Optimismo en las métricas: el autor advierte que el resultado out-of-fold de AutoGluon está ligeramente inflado porque la selección de modelos y pesos usa los mismos pliegues; además, la incertidumbre del Spearman en el conjunto retenido de 43 conversaciones es de aproximadamente ±0,1.
- Idiomas: solo polaco. No hay evidencia de comportamiento en otros idiomas.
- Licencia no declarada: no se especifican condiciones de uso comercial, redistribución ni atribución. Conviene contactar con el autor antes de integrarlo en un producto.
- Riesgo de bucle de realimentación: si se usa el modelo para filtrar datos que luego se emplean para regenerar el corpus con el mismo esquema, el filtro puede reforzar sesgos sistemáticos del juez original.
- Sin soporte de texto en bruto: no puede evaluar contenido semántico, veracidad factual ni coherencia narrativa más allá de lo capturado por las características basal y las estadísticas de superficie.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/cpral/poziomka-ocena-jakosci-fun-rp-v12
- Corpus de SFT asociado: https://huggingface.co/datasets/cpral/Polski_Polish_SFT_poziomka-fun-rp-v12
- Corpus de la versión anterior (v11): https://huggingface.co/datasets/cpral/poziomka-fun-rp-v11
- Perfil del autor: https://huggingface.co/cpral
