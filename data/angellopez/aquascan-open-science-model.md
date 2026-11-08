# angellopez/aquascan-open-science-model

## Resumen

AquaScan Open Science Model (GeoAI Context v0) es un modelo de regresión tabular desarrollado por el autor angellopez dentro del proyecto AquaScan Open Science. Su tarea es predecir la profundidad al agua (`TARGET_DEPTH_TO_WATER`, en metros) a partir de 23 características documentales y contextuales de registros históricos de aguas subterráneas. Se distribuye como artefactos de scikit-learn (un `RandomForestRegressor` junto con su pipeline de preprocesamiento) bajo licencia Apache-2.0.

No se trata de un modelo de lenguaje ni de un sistema de visión: es un baseline de investigación GeoAI entrenado sobre 563 registros Ground Truth A/B procedentes de los registros del IGME en España (Islas Baleares). El autor lo presenta explícitamente como una referencia reproducible y como un prior para comparar contra mediciones físicas futuras (ERT, sísmica), no como un detector de aguas subterráneas.

Su relevancia actual es metodológica: el proyecto aplica validación leakage-safe, un firewall de fase 0 que excluye 10 emplazamientos sellados de San Antonio, e intervalos conformales de incertidumbre. Los resultados publicados muestran que el modelo no supera de forma significativa al baseline v2 sin fuga de datos, lo que convierte a esta ficha en un caso de estudio sobre los límites de la señal documental en prospección hídrica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RandomForestRegressor de scikit-learn (`max_depth=15`, `random_state=42`) con pipeline `ColumnTransformer` + `StandardScaler` + `OneHotEncoder(handle_unknown="ignore")` |
| Parametros totales | No disponible (no se publica el número de árboles ni el recuento de nodos u hojas) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (entrada tabular de 23 columnas, sin ventana de contexto) |
| Tipos de cuantizacion | No disponible (formato joblib, sin variantes cuantizadas publicadas) |
| Idiomas soportados | Inglés (metadatos y documentación); las categorías de entrada proceden de registros españoles |
| Licencia | Apache-2.0 (código y pesos) |
| Formato de pesos | joblib (`model.joblib`, `preprocessor.joblib`), más `feature_manifest.json` y `confidence_policy.json` |

## Arquitectura y entrenamiento

El modelo es un bosque aleatorio de regresión sobre datos tabulares, no una red neuronal. El preprocesamiento combina escalado estándar para las 9 variables numéricas (`elevation_m`, `latitude`, `longitude`, los cuatro indicadores `qa_*`, `qa_flag_count` y `total_depth_m`) y codificación one-hot con ignorancia de categorías desconocidas para las 14 variables categóricas restantes (`aquifer_system`, `construction_date`, `drilling_method`, `group_aquifer`, `group_domain`, `group_proximity_500m`, `group_spatial_cell`, `group_watershed`, `municipality`, `point_nature`, `province`, `pump_type`, `water_use`, `watershed`). Las filas deben contener las 23 columnas; si falta alguna, se lanza un error.

El entrenamiento se realizó sobre 563 registros Ground Truth A/B de profundidad, con un firewall de fase 0 activo que excluye 10 emplazamientos sellados de San Antonio para evitar fuga de información. La validación es leakage-safe y se organiza en tres regímenes: in-domain agrupado, holdout espacial y cross-domain. No se documentan en la información disponible datos de RLHF, DPO ni ajuste fino, algo esperable en un modelo de regresión tabular. La incertidumbre se cuantifica mediante intervalos conformales de residuo absoluto con `alpha = 0.1`, que producen un intervalo del 90 % de ±8,18 m (anchura total de 16,35 m), de naturaleza marginal y no garantizada por emplazamiento.

## Capacidades

- Regresión tabular: predice la profundidad al agua en metros a partir de 23 características documentales y contextuales.
- Manejo de variables mixtas: numéricas continuas (coordenadas, elevación, profundidad total) y categóricas de alta cardinalidad (municipio, provincia, cuenca, método de perforación).
- Robustez ante categorías no vistas: el `OneHotEncoder` con `handle_unknown="ignore"` asigna ceros a categorías desconocidas en lugar de fallar.
- Cuantificación de incertidumbre: intervalos conformales del 90 % (±8,18 m) y política de bandas de confianza GREEN/YELLOW/RED en `confidence_policy.json`.
- Contrato de entrada estricto: `feature_manifest.json` define las 23 columnas y sus tipos, lo que facilita la integración reproducible en pipelines.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento. No es un modelo generativo.

## Casos de uso

- Baseline de investigación reproducible: sirve para replicar la evaluación GeoAI Context v0 y comparar futuros modelos de prospección hídrica contra una referencia leakage-safe con métricas MAE publicadas por régimen de validación.
- Prior en experimentos multimodales: el proyecto AquaScan combina contexto documental con ERT, sísmica de onda P y GNSS RTK; este modelo aporta una estimación previa de profundidad que puede contrastarse con mediciones físicas.
- Auditoría metodológica de fuga de datos: el firewall de fase 0 y los tres regímenes de validación lo convierten en un ejemplo práctico para enseñar validación agrupada y espacial en datos geoespaciales.
- Exploración de señal documental: permite cuantificar cuánto poder predictivo aportan variables como el sistema acuífero, la cuenca o el método de perforación frente a un dummy de mediana (MAE in-domain de 21,5–24,4 m).
- Filtrado preliminar de registros históricos: con un intervalo de ±8,18 m, puede señalizar registros del IGME cuya profundidad documentada resulte anómala y merezca revisión manual.
- Docencia en GeoAI tabular: ilustra un flujo completo de scikit-learn con preprocesamiento mixto, contrato de features en JSON y evaluación con incertidumbre conformal.

## Benchmarks y rendimiento

Resultados canónicos sin fuga para `TARGET_DEPTH_TO_WATER` (MAE en metros):

| Regimen | Baseline v2 (RF) MAE | GeoAI Context v0 (RF) MAE |
|---|---:|---:|
| In-domain (agrupado) | ~10,00 m | ~9,94 m |
| Holdout espacial | ~9,45 m | ~9,54 m |
| Cross-domain | ~15,67 m | ~15,39 m |

Dummy de mediana in-domain: MAE de ~21,5–24,4 m según el fold. Intervalo conformal al 90 %: ±8,18 m (`interval_width_m = 16,35 m`). El modelo no supera de forma significativa al baseline v2; la cifra cross-domain agrega un fallo catastrófico en `Región de los arenales`.

## Requisitos de hardware

- VRAM: no aplica; la inferencia es en CPU. Un bosque aleatorio de 563 registros de entrenamiento y 23 features ocupa del orden de kilobytes a pocos megabytes en memoria.
- GPU recomendadas: ninguna. No se requiere aceleración por hardware.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y entornos sin GPU.
- Despliegue: Python con scikit-learn 1.9.0 y joblib; no aplican vLLM, llama.cpp, Ollama ni TGI. Puede servirse detrás de FastAPI o Flask cargando los artefactos joblib.
- Latencia y throughput: no publicados. Por la naturaleza del modelo (predicción de una fila mediante transformación y recorrido de árboles), la latencia esperada es de milisegundos por fila en CPU, aunque no se aporta una medición oficial.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | MAE in-domain | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| GeoAI Context v0 (AquaScan) | Random forest tabular | No disponible | No aplica | ~9,94 m | Apache-2.0 | Hugging Face |
| Baseline v2 (AquaScan) | Random forest tabular | No disponible | No aplica | ~10,00 m | No disponible en la información | Repositorio del proyecto |
| Dummy de mediana (AquaScan) | Estadístico | 0 | No aplica | ~21,5–24,4 m | No disponible en la información | Repositorio del proyecto |

No se conocen en la información proporcionada modelos públicos comparables de regresión tabular para profundidad al agua en España; la comparativa se limita a los baselines internos del propio proyecto.

## Limitaciones y advertencias

- Sin validación de campo: no se ha realizado validación con ERT ni sísmica de aguas subterráneas.
- Sin Ground Truth de pozos secos: los negativos confirmados son 0, por lo que no puede discriminar pozos secos.
- Objetivo histórico: `TARGET_DEPTH_TO_WATER` deriva de observaciones fechadas (mediana) y no representa el nivel actual del agua.
- Fallo OOD conocido en `Región de los arenales`: el dominio tiene soporte en entrenamiento pero una distribución de profundidad muy distinta (mediana ~7,8 m frente a ~36–48 m en el resto); el MAE cross-domain allí es mucho peor que el del dummy.
- Sin entradas físicas: no ingiere ERT, sísmica ni GNSS; solo features documentales y contextuales.
- Cambio de distribución: el rendimiento fuera de los dominios de entrenamiento y fuera de España no está establecido; el modelo solo se entrenó con registros del IGME en Baleares.
- Incertidumbre no calibrada por emplazamiento: el intervalo conformal de ±8,18 m es marginal.
- Uso fuera de alcance: no debe emplearse para afirmar descubrimientos de agua, sustituir un estudio hidrogeológico o una campaña de campo, ni para decisiones operativas, comerciales o de seguridad crítica.
- Licencia Apache-2.0: permite uso comercial del código y los pesos, pero ello no elimina las advertencias científicas anteriores.
- Idiomas: la documentación está en inglés y las categorías de entrada proceden de registros españoles; no hay soporte multilingüe.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/angellopez/aquascan-open-science-model
- Repositorio del proyecto: https://github.com/angelopezvpb/aquascan-open-science
- README del repositorio: https://github.com/angelopezvpb/aquascan-open-science/blob/main/README.md
- Resultados canónicos: https://github.com/angelopezvpb/aquascan-open-science/blob/main/docs/current-results.md
