# LisSanchez-DS/defender-servidor

## Resumen

Defender-servidor (v2, revisión C4) es un clasificador binario de tráfico de red entrenado sobre el conjunto de datos UNSW-NB15, orientado a distinguir conexiones normales (clase 0) de conexiones maliciosas (clase 1). No es un modelo de lenguaje ni una red neuronal: es un pipeline completo de scikit-learn que encapsula el preprocesamiento (codificación one-hot de variables categóricas) y un estimador XGBoost, empaquetado en un único artefacto `model.joblib` con un umbral de decisión calibrado a 0,66. Lo desarrolla LisSanchez-DS como proyecto académico del curso MLOps 2026-II de la Universidad Externado de Colombia, con un enfoque explícito en trazabilidad de datos, experimentos y modelos.

El modelo resuelve un problema clásico de detección de intrusiones en formato tabular: dado un vector de 42 variables de flujo de red, estimar la probabilidad de que la conexión sea un ataque. Su relevancia no está en el rendimiento bruto, sino en la disciplina metodológica que documenta: partición 70/30 con agrupación de entradas idénticas, umbral seleccionado solo con validación, evaluación única sobre test congelado, hashes SHA-256 de pesos y datos, versionado con DVC y MLflow, y una fe de erratas pública que corrige tamaños de partición en tarjetas anteriores.

Es, por tanto, un artefacto de referencia para prácticas MLOps y para evaluar cómo se documenta honestamente una degradación entre validación y test (precisión 0,9738 → 0,8596; tasa de falsos positivos 0,0548 → 0,1931). No debe interpretarse como un IDS listo para producción: el propio autor advierte que UNSW-NB15 es un benchmark de laboratorio de 2015.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline scikit-learn (preprocesamiento one-hot + estimador XGBoost) |
| Parametros totales | no disponible (no se documenta el numero de arboles ni de hojas del booster) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada tabular fija de 42 variables) |
| Tipos de cuantizacion | no disponible (artefacto joblib; no se publican variantes GGUF/ONNX) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | other (sin terminos concretos especificados en la model card) |
| Formato de pesos | joblib (`model.joblib`), SHA-256 `e7f7ddc749f2a22c66007031110f9658b1803b3f306f8e3c4e032c52cdac7ed4` |

## Arquitectura y entrenamiento

El artefacto es un pipeline serializado con joblib que integra dos etapas: un transformador de preprocesamiento que aplica codificación one-hot a las variables categóricas del dataset y un clasificador XGBoost como estimador final. La entrada son 42 variables de flujo de red derivadas de UNSW-NB15, excluyendo explícitamente `id`, `label` y `attack_cat`. La salida es una probabilidad de ataque (`predict_proba[:, 1]`) que se binariza con un umbral de 0,66: se predice ataque si `score_attack >= 0.66`.

El entrenamiento parte del archivo oficial `UNSW_NB15_training-set.csv` (175.341 filas, SHA-256 `bec7dd5ec88dc2a0ccc7a07879d338395ed7421750f675fd0339e07dfe0648fa`), dividido en 122.735 filas de entrenamiento y 52.605 de validación (70/30, semilla 42), manteniendo agrupadas las entradas idénticas para evitar fuga de información entre particiones. Los hiperparámetros y el umbral provienen de una búsqueda con Optuna ejecutada exclusivamente sobre el conjunto de entrenamiento. Respecto a v1, v2 modifica hiperparámetros y eleva el umbral de 0,5 a 0,66; según la propia tarjeta, la mejora en precisión se debe principalmente al umbral, no al reajuste de hiperparámetros (con umbral 0,5, v2 no supera a v1). Los datos están versionados con DVC y los experimentos con MLflow.

## Capacidades

- Clasificación binaria tabular de conexiones de red: normal (0) frente a ataque (1).
- Salida de probabilidad calibrada por umbral configurable (0,66 en v2; 0,5 en v1), lo que permite ajustar el compromiso entre recall y falsos positivos.
- Manejo de variables categóricas mediante one-hot encoding dentro del propio pipeline, sin preprocesamiento externo obligatorio más allá de eliminar `id`, `label` y `attack_cat`.
- Discriminación entre familias de ataque a nivel de recall: Analysis 0,947, Fuzzers 0,771, resto ≥ 0,977 en el conjunto de test.
- Ejecución por lotes mediante el script del repositorio de código (`python -m src.predecir v1|v2 entrada.csv salida.csv`).
- No soporta tool calling, agentes, razonamiento multi-turno, visión, audio ni capacidades multilingües: es un clasificador tabular puro.

## Casos de uso

- Detección de anomalías en flujos de red en entornos controlados: el modelo puntúa cada conexión con una probabilidad de ataque y permite umbralizar según la política de riesgo del operador, útil en laboratorios y ejercicios de simulación con tráfico etiquetado tipo UNSW-NB15.
- Filtro de segunda etapa tras un IDS basado en firmas: las conexiones que superan el umbral 0,66 se escalan a revisión humana, aprovechando el recall de 0,9649 en test para no dejar pasar ataques conocidos.
- Priorización de alertas en un SOC: con una tasa de falsos positivos de 0,1931 en test, el modelo sirve para ordenar la cola de triaje por `score_attack`, no para disparar bloqueos automáticos.
- Docencia y evaluación de pipelines MLOps: el repositorio documenta versionado de datos con DVC, seguimiento con MLflow, hashes de artefactos y evaluación única sobre test congelado, lo que lo convierte en un caso de estudio reproducible.
- Prueba de concepto de clasificación tabular con XGBoost y scikit-learn: sirve como plantilla para sustituir el dataset por telemetría propia y reentrenar el pipeline con el mismo esquema de partición agrupada.
- Auditoría de deriva entre validación y test: la comparación documentada (precisión 0,9738 → 0,8596) ejemplifica cómo detectar y comunicar sobreajuste a la partición de validación en proyectos de detección de intrusiones.
- Análisis de recall por familia de ataque: permite identificar qué clases (por ejemplo, Fuzzers con 0,771) necesitan datos adicionales o un modelo especializado antes de desplegar.

## Benchmarks y rendimiento

| Metrica | Validacion | Test |
|---|---|---|
| Recall | 0,9537 | 0,9649 |
| Precision | 0,9738 | 0,8596 |
| Tasa de falsos positivos | 0,0548 | 0,1931 |
| Macro-F1 | 0,9443 | 0,8908 |
| ROC-AUC | no disponible | 0,9819 |

Matriz de confusión en test: TN 29.856, FP 7.144, FN 1.589, TP 43.743, sobre 82.332 filas. Recall por familia de ataque en test: Fuzzers 0,771; Analysis 0,947; resto ≥ 0,977.

No se han publicado resultados comparativos con otros modelos sobre el mismo conjunto en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU. El artefacto es un booster de XGBoost dentro de un pipeline de scikit-learn, sin requisitos de GPU.
- GPU recomendadas: ninguna. No se documenta soporte GPU ni se justifica para este tamaño de modelo.
- GPU de consumo: irrelevante; el cuello de botella es el preprocesamiento one-hot y el número de filas a puntuar.
- Despliegue: carga directa con `joblib.load` y `huggingface_hub.hf_hub_download` fijando `revision`; script por lotes del repositorio de código. No se publican integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles en la información proporcionada. Dependen del número de árboles del booster (no documentado) y del tamaño del lote de entrada.
- Requisito crítico: replicar exactamente las versiones de `requirements.txt`, ya que el artefacto es un pickle de joblib y la compatibilidad de serialización no está garantizada entre versiones.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Defender-servidor v2 | XGBoost + pipeline sklearn sobre UNSW-NB15 | no disponible | no aplica (42 variables tabulares) | other | HuggingFace, revisiones inmutables v1/v2 |
| Alternativas de la misma categoría (IDS tabular sobre UNSW-NB15) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables publicados con métricas sobre la misma partición de UNSW-NB15 en la documentación proporcionada, por lo que no se establece una comparación numérica.

## Limitaciones y advertencias

- Dataset histórico de laboratorio (UNSW-NB15, 2015): el rendimiento no es extrapolable a redes actuales ni a tráfico real de producción.
- La validación es optimista por construcción: hay filas similares a ambos lados de la partición, y el 10 % de las filas de test tiene una entrada idéntica en entrenamiento (10,4 % según la tarjeta).
- Degradación documentada entre validación y test: la precisión cae de 0,9738 a 0,8596 y la tasa de falsos positivos se triplica (0,0548 → 0,1931). La causa no está demostrada; se hipotetiza una sesión de captura ausente del entrenamiento.
- El umbral 0,66 prioriza recall ≥ 0,95 a costa de falsas alarmas; con umbral 0,5 el modelo de v2 no supera a v1. La elección del umbral debe revisarse según el coste relativo de FN y FP en cada despliegue.
- Recall bajo en la familia Fuzzers (0,771): un 22,9 % de los ataques de ese tipo pasa sin detectar en test.
- Riesgo de seguridad en la cadena de suministro: `model.joblib` es un pickle de joblib y puede ejecutar código arbitrario al deserializarse; cargarlo solo desde la revisión fijada por SHA y con las versiones exactas de `requirements.txt`.
- Licencia "other" sin términos concretos publicados: no se puede confirmar el uso comercial sin contactar con el autor.
- Sin soporte multilingüe ni de texto: cualquier uso fuera de clasificación tabular con las 42 variables de UNSW-NB15 requiere reentrenamiento.
- Fe de erratas: las tarjetas de las revisiones v1 y v2 indican por error tamaños de partición de 140.271/35.069 filas (80/20); los correctos son 122.735/52.605 (70/30). Las métricas publicadas sí corresponden a la partición correcta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LisSanchez-DS/defender-servidor
- Revisión v1 (SHA completo): `053f3e62f144e78e055533f82bce14c9b54e3030`
- Revisión v2 (SHA completo, evaluada): `c521d5ccf41ad404998e3364c685363ffa620bbb`
- Repositorio de código: no disponible como URL en la información proporcionada (se referencia el commit Git `cb33d74015cbc76fd504ea4c38b15d63f9979fc5`)
- Dataset UNSW-NB15: no se incluye URL en la model card; hashes de referencia: training `bec7dd5ec88dc2a0ccc7a07879d338395ed7421750f675fd0339e07dfe0648fa`, testing `734fe6642edf758f7c94d7d9149426b49d202fe8e7bf0bef47392489c3c0a559`
- Artefactos de evidencia citados: `evidencias/auditoria.json`, `evidencias/experimentos.csv`, `evidencias/predicciones-test.csv`, `evidencias/metricas-test.json` (en el repositorio de código)
- Paper o blog adicional: no disponible
