# efe-T/nasa-bass-ii-model-a

## Resumen

NASA BASS-II model_a es un modelo de regresión tabular desarrollado por el usuario efe-T que estima la velocidad de propagación de llama (en mm/s) sobre losas de PMMA (polimetilmetacrilato) en condiciones de microgravedad con flujo opuesto, a partir de los datos del experimento BASS-II de la NASA. No es un modelo de lenguaje ni una red neuronal: se trata de un bosque aleatorio (random forest) de scikit-learn entrenado sobre un conjunto de datos muy reducido (18 muestras físicas, 39 segmentos de flujo de aire) extraído de la tabla 5.1 de un informe de la NASA. El modelo es explícitamente exploratorio y su autor advierte que no es apto para certificación, decisiones operativas de seguridad contra incendios ni afirmaciones sobre extinción.

El modelo resuelve un problema de ciencia de datos en régimen de "small data": predecir una magnitud física (velocidad de propagación de llama) a partir de cuatro variables de entrada (grosor en mm, anchura en cm, velocidad del flujo en cm/s y porcentaje volumétrico inicial de oxígeno). Su relevancia es metodológica más que práctica: documenta con rigor la procedencia de los datos, la validación con validación cruzada anidada agrupada por muestra física y un mecanismo de detección de fuera de distribución, lo que lo convierte en un ejemplo de buenas prácticas en machine learning científico con datos escasos.

La arquitectura es un ensemble de árboles de decisión (random forest con 200 árboles), empaquetado tanto en formato joblib de scikit-learn como en un JSON portable que permite inferencia solo con la biblioteca estándar de Python. El contexto, el número de parámetros y los idiomas soportados no aplican en el sentido habitual de los modelos generativos; el modelo opera sobre datos numéricos tabulares y su documentación está en inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Random forest (ensemble de árboles de decisión con splits de error cuadrático) |
| Parametros totales | 200 árboles; min_samples_leaf=3; número de parámetros no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, 4 variables de entrada) |
| Tipos de cuantizacion | no aplica; exportación en joblib y JSON portable |
| Idiomas soportados | en (documentación); entradas numéricas |
| Licencia | no disponible |
| Formato de pesos | joblib (pipeline completo de scikit-learn) y model.json (scaler y arrays del bosque) |

## Arquitectura y entrenamiento

El modelo es un random forest de scikit-learn con 200 árboles, `min_samples_leaf=3`, `random_state=42` y `n_jobs=2`, seleccionado entre siete candidatos (extra_trees, hist_gradient_boosting, inverse_thickness_ridge, media, random_forest, rbf_svr y ridge). La selección se realizó mediante validación cruzada anidada con cinco folds externos agrupados por muestra física y cuatro folds internos agrupados para elegir el modelo dentro de cada fold de entrenamiento, con peso de entrenamiento total igual por experimento y sin búsqueda de hiperparámetros. La métrica primaria es el MAE macro por experimento; las métricas secundarias (RMSE y R²) se calculan sobre las filas de segmento dentro de cada fold.

Los datos provienen de la tabla 5.1 del informe de la NASA (página impresa 57, página 65 del PDF), con 20 quemas de losas de PMMA, de las cuales M6 y M12 no tienen seguimiento ("Not tracked"). Los 39 segmentos de flujo de aire restantes pertenecen a 18 muestras físicas distintas, verificadas contra el CSV del experimento PSI. Las tasas reportadas fueron derivadas por los autores originales a partir de pendientes de posición/tiempo en vídeo; este proyecto no afirma haber re-seguido los vídeos. No se usaron datos sintéticos de entrenamiento. Las entradas son `thickness_mm`, `width_cm`, `velocity_cm_s` e `initial_o2_vol_pct`; se excluyen el número de caras en combustión, el oxígeno final y la duración de la quema. El oxígeno inicial es un proxy medido antes de la quema para el oxígeno cambiante durante la misma.

Como innovación destacable, el modelo incluye un mecanismo de cobertura fuera de distribución (`ood.json`) que almacena las 39 condiciones únicas de features, los identificadores de experimento/grupo y la media/desviación estándar poblacional de entrenamiento (ddof=0). La inferencia calcula la distancia euclídea estandarizada a la condición de entrenamiento más cercana de un grupo distinto y marca `out_of_distribution = true` si supera el umbral (máxima distancia de referencia). El autor advierte que este umbral se basa solo en 18 grupos y es una comprobación aproximada de cobertura, no una probabilidad calibrada de novedad ni un intervalo de incertidumbre predictiva.

## Capacidades

- Regresión tabular: estima la velocidad de propagación de llama en mm/s a partir de cuatro variables numéricas de entrada.
- Validación de entradas: lanza `ValueError` ante campos faltantes o extra, valores no finitos, unidades incorrectas, material no soportado o números fuera de rango.
- Detección de fuera de distribución: devuelve `out_of_distribution`, `nearest_distance`, `nearest_experiment_id` y una advertencia de cobertura cuando la entrada queda fuera del dominio observado.
- Salida estructurada: devuelve la estimación en mm/s junto con la versión del modelo, el dominio y advertencias.
- Inferencia sin dependencias de ML: el `model.json` portable reproduce la evaluación float32 de los árboles solo con la biblioteca estándar de Python, verificado contra scikit-learn en las 39 filas de origen.
- Reproducibilidad: descarga de ficheros fuente desde endpoints oficiales de la NASA con verificación de checksum, notebook de Colab ejecutado y scripts de reconstrucción (`python -m model_a.data`, `python -m model_a.train`, `python -m pytest -q tests`).
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto; su alcance es estrictamente la regresión tabular sobre PMMA en microgravedad.

## Casos de uso

- Análisis exploratorio de datos de combustión en microgravedad: el modelo permite obtener estimaciones rápidas de velocidad de propagación a partir de condiciones de experimento, útil para comparar con las tasas reportadas por la fuente y detectar discrepancias.
- Docencia y formación en ML científico con datos escasos: sirve como ejemplo completo de validación cruzada anidada agrupada, control de fuga de información por muestra física y documentación de procedencia de datos.
- Prototipado de pipelines de regresión tabular: su exportación a JSON portable y su inferencia solo con biblioteca estándar permiten integrarlo en entornos sin scikit-learn (por ejemplo, scripts de análisis o sistemas embebidos de laboratorio).
- Filtro de cobertura en experimentos de laboratorio: el chequeo de fuera de distribución puede usarse para descartar condiciones de entrada alejadas del dominio observado antes de aceptar una predicción como plausible.
- Auditoría de modelos científicos: el repositorio conserva el pipeline joblib original, las métricas por fold de todos los candidatos, las predicciones out-of-fold y los casos de fallo, lo que facilita revisiones metodológicas.
- Referencia para la comunidad de ciencia de datos espacial: documenta cómo extraer, verificar y modelar datos tabulares de informes de la NASA con trazabilidad completa, como base para futuros modelos sobre el mismo experimento.

## Benchmarks y rendimiento

Resultados de validación cruzada anidada agrupada (media ± desviación estándar poblacional por fold; MAE y RMSE en mm/s). Las filas de candidatos comparten los folds que seleccionan el modelo final, por lo que son resultados comparativos, no confirmación independiente de la selección.

| Candidato | MAE (mm/s) | RMSE (mm/s) | R² |
|---|---|---|---|
| extra_trees | 0,016862 ± 0,005360 | 0,020700 ± 0,008301 | 0,036937 ± 0,557532 |
| hist_gradient_boosting | 0,019006 ± 0,003805 | 0,025866 ± 0,010040 | -0,240459 ± 0,437544 |
| inverse_thickness_ridge | 0,015538 ± 0,006265 | 0,020783 ± 0,010625 | -0,068609 ± 1,069377 |
| mean | 0,021566 ± 0,007809 | 0,028435 ± 0,013943 | -0,331376 ± 0,328203 |
| nested_selection | 0,018556 ± 0,005184 | 0,026734 ± 0,010710 | -0,443989 ± 0,953252 |
| random_forest | 0,014971 ± 0,003429 | 0,019721 ± 0,007136 | 0,217304 ± 0,333606 |
| rbf_svr | 0,016651 ± 0,006614 | 0,025476 ± 0,011688 | -0,353513 ± 1,071644 |
| ridge | 0,017333 ± 0,004978 | 0,025616 ± 0,010743 | -0,226101 ± 0,439281 |

El modelo exportado con todos los datos es el random forest (200 árboles, `min_samples_leaf=3`, `random_state=42`, `n_jobs=2`), seleccionado por MAE agrupado y una regla de estabilidad de una desviación estándar por fold. El R² medio anidado negativo y las solo 18 muestras limitan sustancialmente la generalización. No hay intervalos de incertidumbre calibrados ni afirmaciones de significación estadística.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es de CPU y de tamaño despreciable (repositorio de 0,0 GB).
- GPU recomendadas: no aplica; el modelo se entrenó y evaluó en Google Colab CPU mediante el Colab CLI.
- Cabe en cualquier GPU de consumo y en CPU convencional; no requiere aceleración por hardware.
- Opciones de despliegue: inferencia con la biblioteca estándar de Python usando `model.json` (sin dependencias de ML), o carga del pipeline joblib con scikit-learn y paquetes fijados para auditoría.
- Latencia y throughput: no disponible en la información proporcionada; por la naturaleza del modelo (200 árboles, 4 features) se espera latencia de microsegundos a milisegundos por predicción en CPU, aunque no se han publicado medidas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo es específico de un experimento concreto (BASS-II) y un material concreto (PMMA en microgravedad), por lo que no existen alternativas públicas directamente comparables en parámetros, contexto, rendimiento, licencia y disponibilidad. La comparativa interna entre los siete candidatos de scikit-learn evaluados se recoge en la sección de benchmarks.

## Limitaciones y advertencias

- El autor declara explícitamente que el modelo no es apto para certificación, decisiones operativas de seguridad contra incendios, afirmaciones sobre extinción ni puntuaciones de peligro arbitrarias.
- Tamaño muestral muy reducido: 18 muestras físicas y 39 segmentos de flujo; el R² medio anidado es negativo, lo que indica que la generalización es muy limitada.
- La adaptatividad del investigador durante la selección de candidatos (de 5 a 7 tras inspeccionar fallos) no queda eliminada por la validación cruzada anidada; todos los resultados son exploratorios y no existe un conjunto de test final intacto.
- El umbral de fuera de distribución se basa solo en 18 grupos y es una comprobación aproximada de cobertura, no una probabilidad calibrada de novedad ni un intervalo de incertidumbre predictiva; pasar la comprobación no garantiza predicciones fiables.
- El oxígeno inicial es un proxy medido antes de la quema para el oxígeno cambiante durante la misma; la geometría e historia de combustión no modeladas confunden las estimaciones.
- Material restringido a losas de PMMA de colada transparente; no se soportan otros materiales.
- Las tasas reportadas por la fuente derivan de pendientes de posición/tiempo en vídeo; el proyecto no afirma haber re-seguido los vídeos.
- Licencia no disponible: no se puede confirmar si se permite uso comercial.
- Solo se documenta en inglés y opera sobre entradas numéricas; no hay soporte multilingüe ni de texto libre.
- Riesgo de alucinación no aplica en el sentido de modelos generativos, pero sí existe riesgo de extrapolación silenciosa fuera del dominio observado si se ignoran las advertencias de cobertura.
- Solo se deben cargar ficheros pickle/joblib de fuentes de confianza, por el riesgo inherente de deserialización.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/efe-T/nasa-bass-ii-model-a
- Repositorio del autor en Hugging Face (perfil): https://huggingface.co/efe-T
- No se han encontrado en la información proporcionada enlaces adicionales a papers, blogs, repositorios o demos.
