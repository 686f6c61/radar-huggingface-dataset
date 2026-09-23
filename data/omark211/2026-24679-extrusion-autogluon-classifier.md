# OmarK211/2026-24679-extrusion-autogluon-classifier

## Resumen

El modelo `OmarK211/2026-24679-extrusion-autogluon-classifier` es un clasificador binario tabular entrenado con AutoGluon Tabular, no un modelo generativo de lenguaje. Su objetivo es predecir si una pieza CAD es extruible a partir de características geométricas, usando como etiqueta la columna `extrudable` (1 = extruible, 0 = no extruible). Lo desarrolla y publica Omar Khan bajo licencia MIT y se distribuye como artefactos de AutoGluon, no como pesos de red neuronal.

El modelo se ha entrenado sobre el conjunto de datos `sunkaiwen/sketch2stl-parts-tabular`, combinando geometrías originales con variantes sintéticas filtradas de un solo padre. Su relevancia es metodológica: sirve como línea base reproducible para ingeniería de características y para estudiar la diferencia de rendimiento entre datos sintéticos (in-split) y datos originales (externos). No incorpora ventana de contexto, tokenizador ni cuantización, porque no es un transformer ni un modelo de lenguaje.

Las métricas declaradas son accuracy y F1 ponderado de 1.0 tanto en la partición aumentada como en la validación externa original; el propio autor advierte que el resultado es sospechoso y recomienda tratarlo como didáctico, con comprobaciones de calibración y notificación de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Ensamble AutoML de AutoGluon Tabular (preset `best_quality`), con familias seleccionadas por búsqueda: árboles potenciados, kNN, redes neuronales y stacking |
| Parametros totales | no aplicable (no es una red neuronal con recuento fijo de parámetros) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable (clasificación tabular, sin contexto de texto) |
| Tipos de cuantizacion | no aplicable (no se distribuyen pesos cuantizados) |
| Idiomas soportados | en (inglés, según la etiqueta del repositorio); las entradas son características numéricas, no texto libre |
| Licencia | MIT |
| Formato de pesos | `autogluon_predictor.pkl` (predictor serializado con cloudpickle) y `autogluon_predictor_dir.zip` (directorio nativo del predictor AutoGluon) |
| Columna objetivo | `extrudable` (1 = extruible, 0 = no extruible) |
| Tarea | clasificación binaria tabular (`pipeline_tag: tabular-classification`) |
| Libreria | `autogluon.tabular` |
| Tamano del repositorio | 0,0 GB según la ficha de HuggingFace |

## Arquitectura y entrenamiento

El modelo no define una arquitectura propia: AutoGluon Tabular explora y combina varios algoritmos de aprendizaje automático sobre datos tabulares, incluyendo árboles potenciados, kNN y redes neuronales, y construye un ensamble apilado con el preset `best_quality`. La familia concreta elegida se determina mediante búsqueda durante el entrenamiento, con un límite de tiempo de 300 segundos, `random_state` 42 y `problem_type` inferido automáticamente. La métrica de evaluación interna es la predeterminada de AutoGluon para clasificación (log_loss o accuracy según la familia).

Los datos de entrenamiento provienen del conjunto `sunkaiwen/sketch2stl-parts-tabular`. Se aplicó una división estratificada 80/20 sobre la partición aumentada con `random_state=24679`, y se eliminaron del entrenamiento las aumentaciones de doble padre. La validación externa se realizó sobre la partición original completa, que no se usó en el entrenamiento. No se documenta el número total de tokens (no aplicable), la composición exacta del dataset ni procesos de RLHF o DPO, que no corresponden a este tipo de modelo.

## Capacidades

- Clasificación binaria tabular: predice si una pieza CAD es extruible a partir de sus características geométricas.
- Salida de probabilidad: `predict_proba(X_test)[1]` devuelve la probabilidad estimada de ser extruible, además de la etiqueta binaria.
- Línea base para ingeniería de características: permite comparar variantes de features geométricos de forma reproducible.
- Comparación entre datos sintéticos y originales: facilita medir la brecha entre rendimiento in-split y rendimiento externo.
- Sin soporte de tool calling ni function calling.
- Sin soporte de agentes ni razonamiento multi-paso.
- Sin capacidades multilingües reales: la entrada es numérica y la etiqueta de idioma del repositorio es `en`.
- Sin capacidades especiales de visión, audio, modo de razonamiento ni generación de texto.

## Casos de uso

- Filtrado previo en flujos CAD/CAM: usar el clasificador para descartar piezas no extruibles antes de enviarlas a un proceso de extrusión, reduciendo iteraciones manuales.
- Línea base en investigación de features geométricos: servir como referencia fija frente a la que comparar nuevas representaciones de la geometría de la pieza.
- Estudio de aumentación de datos sintéticos: cuantificar la diferencia entre métricas in-split y externas para evaluar si la aumentación introduce sesgo optimista.
- Priorización de revisión manual en diseño paramétrico: ordenar diseños por probabilidad estimada de no ser extruibles y dirigir la revisión humana a los casos más dudosos.
- Docencia y experimentación con AutoML: ejemplo reproducible de entrenamiento tabular con AutoGluon, límite de tiempo y evaluación en dos particiones.
- Validación de pipelines de datos: comprobar de extremo a extremo la carga de un predictor serializado, la inferencia por lotes y la coherencia de probabilidades.
- Detección temprana en herramientas de diseño: integrar la predicción en un asistente que avise al diseñador cuando una modificación vuelve la pieza difícilmente extruible.

## Benchmarks y rendimiento

| Metrica | Test aumentado (20 por ciento retenido) | Validacion externa (particion original completa) |
|---|---|---|
| Accuracy | 1,0 | 1,0 |
| F1 ponderado | 1,0 | 1,0 |

Estos son los valores publicados por el autor en la model card. El propio autor indica que el resultado «parece sospechoso» y señala que las probabilidades asociadas a las decisiones no son del todo seguras, por lo que recomienda no tomarlos al pie de la letra. No se han publicado resultados adicionales de benchmarks en la información disponible.

## Requisitos de hardware

- No requiere GPU: al ser un modelo tabular de AutoGluon, la inferencia se ejecuta en CPU.
- VRAM estimada: 0 GB; el consumo relevante es de RAM del sistema, no documentado en la ficha.
- GPU recomendadas: no aplicable.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0,0 GB según la ficha y los artefactos son un predictor serializado y un directorio comprimido.
- Opciones de despliegue: carga con `TabularPredictor.load()` de AutoGluon; exposición mediante un servicio HTTP propio (por ejemplo FastAPI), ejecución por lotes o despliegue gestionado en Amazon SageMaker.
- No es compatible con vLLM, llama.cpp, Ollama ni TGI, que son servidores para modelos de lenguaje y no para predictores tabulares.
- Latencia y throughput: no disponible; no se publican mediciones en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tarea | Framework | Licencia | Metricas publicadas | Disponibilidad |
|---|---|---|---|---|---|
| OmarK211/2026-24679-extrusion-autogluon-classifier | Clasificación binaria de extruibilidad CAD | AutoGluon Tabular | MIT | Accuracy 1,0 y F1 ponderado 1,0 (aumentado y original) | HuggingFace, 0 descargas y 0 likes |
| yennik16/2026-24679-extrudability-autogluon-classifier | Clasificación de extruibilidad (según el identificador) | no disponible | no disponible | no disponible | HuggingFace |
| sunkaiwen/sketch2stl-parts-autogluon-predictor | Predictor AutoGluon sobre el mismo conjunto de datos (referido en el código de ejemplo del autor) | AutoGluon Tabular | no disponible | no disponible | HuggingFace |

Los tres artefactos parecen pertenecer al mismo linaje experimental en torno al conjunto `sunkaiwen/sketch2stl-parts-tabular`, pero no hay información pública suficiente para comparar parámetros, contexto o rendimiento de forma rigurosa.

## Limitaciones y advertencias

- Sesgo por datos sintéticos: el entrenamiento se apoya en datos aumentados, lo que puede inflar las puntuaciones in-split y no reflejar el comportamiento sobre geometrías reales.
- Cohorte pequeña y sesgada: la partición original es reducida, lo que limita la fiabilidad de la validación externa.
- Métricas no fiables: los valores de accuracy y F1 de 1,0 son anómalos según el propio autor y no deberían citarse como evidencia de calidad.
- Uso fuera de alcance: el autor desaconseja explícitamente el despliegue en producción o la toma de decisiones que afecten a personas reales.
- Ámbito restringido: solo clasifica extruibilidad de piezas CAD con las mismas características de entrada con las que fue entrenado; no generaliza a otras geometrías o etiquetas sin reentrenamiento.
- Sin contexto ni idioma: no procesa texto libre, no mantiene conversaciones y no tiene capacidades multilingües más allá de la etiqueta `en` del repositorio.
- Licencia permisiva, pero con ausencia de garantías: la licencia MIT permite uso comercial sin garantía de idoneidad; dado que el autor recomienda uso didáctico, conviene evaluar el riesgo antes de cualquier uso productivo.
- Reproducibilidad dependiente del entorno: la carga del predictor requiere la versión adecuada de AutoGluon y sus dependencias, por lo que la inferencia puede fallar si el entorno difiere del de entrenamiento.
- Sin calibración documentada: se recomienda comprobar la calibración y reportar confianza antes de usar las probabilidades como umbral de decisión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/OmarK211/2026-24679-extrusion-autogluon-classifier
- Conjunto de datos: https://huggingface.co/datasets/sunkaiwen/sketch2stl-parts-tabular
- Modelo relacionado (yennik16): https://huggingface.co/yennik16/2026-24679-extrudability-autogluon-classifier
- Predictor de referencia citado en la model card: https://huggingface.co/sunkaiwen/sketch2stl-parts-autogluon-predictor
- Documentación de AutoGluon: https://auto.gluon.ai/stable/index.html
- Tutorial de AutoGluon Tabular: https://auto.gluon.ai/stable/tutorials/tabular/index.html
- Repositorio de AutoGluon en GitHub: https://github.com/autogluon/autogluon
- AI Model Radar (rastreador de lanzamientos): https://aimodelradar.app/
