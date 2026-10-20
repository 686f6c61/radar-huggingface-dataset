# david-thrower/geofare-pipeline

## Resumen

GeoFare es un repositorio de demostración publicado por el usuario david-thrower en HuggingFace bajo el identificador `david-thrower/geofare-pipeline`. No es un modelo de lenguaje: se trata de un pipeline completo de clasificación binaria sobre datos tabulares cuyo objetivo es predecir si un trayecto (presumiblemente de taxi o VTC) será de tarifa alta a partir de la geolocalización de recogida y otros atributos del viaje. El autor indica explícitamente que entrena "un modelo Keras pequeño" sobre un conjunto de datos sintético generado de forma determinista mediante `scripts/generate_data.py`.

El interés técnico del repositorio no está en el modelo en sí, sino en el contrato que define entre el pipeline de features y el modelo: `features.py` transforma entradas continuas en índices enteros de bin y en un índice de celda de geolocalización cruzada, y `model.py` consume esos índices directamente en sus búsquedas de embedding, sin conversiones de tipo. El autor documenta con precisión las convenciones de binarización (equal-width con índices int32, quantile con índices int64) y advierte de que el `dtype_policy` desplegado es `"float64"` de forma intencional desde 2023.

A fecha de la consulta el repositorio acumula 0 descargas y 0 likes, no declara licencia, idiomas ni pipeline, y no publica resultados de benchmarks ni el valor de `num_params`. La búsqueda web realizada no devolvió ningún resultado relacionado con el proyecto. Por tanto, esta ficha debe leerse como una descripción del contrato y del código documentado, no como una evaluación de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo Keras de talla pequeña con capas de embedding que consumen índices enteros de bin y un índice de celda de geolocalización cruzada; el autor no especifica la topología completa (capas, profundidad, activaciones) |
| Parametros totales | no disponible (`train.py` escribe `num_params` en `metrics.json`, pero el valor no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular de clasificación binaria; no procesa secuencias de texto) |
| Tipos de cuantizacion | no disponible; el autor declara un `dtype_policy` de `"float64"` usado de extremo a extremo de forma intencional |
| Idiomas soportados | no disponible; las entradas son variables numéricas y geolocalización, no texto |
| Licencia | no disponible (no declarada en los metadatos del repositorio) |
| Formato de pesos | no disponible; el autor indica que el modelo es Keras, pero no se especifica el artefacto publicado (`.keras`, SavedModel u otro) |

## Arquitectura y entrenamiento

El repositorio define una separación estricta entre features y modelo. `features.py` convierte variables continuas en índices enteros mediante dos estrategias documentadas: binarización de igual anchura (`bin_equal_width`), donde el bin k cubre `[lo + k*width, lo + (k+1)*width)`, devuelve índices int32 en `0..n_bins-1` y recorta los valores fuera de rango al bin extremo más cercano; y binarización por cuantiles (`bin_quantile`), donde el bin i cubre `(edges[i-1], edges[i]]`, un valor exactamente igual a `edges[i]` pertenece al bin i, devuelve índices int64 en `0..len(edges)-1`, los valores en o por debajo de `edges[0]` van al bin 0 y los superiores a `edges[-1]` van al último bin. Los bordes ajustados de cuantiles se persisten en `features/edges.json` y se regeneran con el generador de datos.

`model.py` consume esos índices directamente en sus embedding lookups, y el contrato explícito es que el pipeline entrega índices enteros y el modelo no realiza ninguna conversión de dtype sobre sus entradas de índice. El entrenamiento se ejecuta con `python train.py`, que escribe un `metrics.json` con los campos `final_loss`, `num_params` y `embedding_delta`; no se publican los valores obtenidos. Los datos de entrenamiento son sintéticos y generados de forma determinista con semilla fija mediante `scripts/generate_data.py`, que produce `data/train.csv` y los bordes de cuantiles. No se documenta volumen de datos, número de epochs, composición de features, optimizador, función de pérdida ni si hubo algún tipo de ajuste posterior (RLHF, DPO u otro), algo por otra parte esperable en un clasificador tabular.

Como innovaciones destacables, el autor subraya dos decisiones de diseño: el uso de `float64` de extremo a extremo desde 2023 (marcado como no modificable sin ticket) y la separación limpia del contrato de tipos entre pipeline y modelo, verificada con tests unitarios ejecutables mediante `python -m pytest tests -q`.

## Capacidades

- Clasificación binaria tabular: predice si un trayecto es de tarifa alta a partir de geolocalización de recogida y atributos del viaje.
- Ingeniería de features integrada: binarización de igual anchura (int32) y por cuantiles (int64), con recorte documentado de valores fuera de rango.
- Features cruzadas de geolocalización: índice de celda cruzada consumido como embedding.
- Reproducibilidad determinista: generación de datos sintéticos con semilla y regeneración de `edges.json`.
- Verificación mediante tests: suite en `tests/` ejecutable con pytest.
- Serialización de métricas de entrenamiento en `metrics.json` (`final_loss`, `num_params`, `embedding_delta`).
- No soporta generación de texto, razonamiento, código, matemáticas, visión ni audio.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües: no procesa lenguaje natural.
- No dispone de modo "thinking", visión, audio ni ninguna capacidad multimodal.

## Casos de uso

- Clasificación de tarifa en plataformas de movilidad: el modelo recibe la celda geográfica de recogida y los atributos del viaje en forma de índices de bin y devuelve una probabilidad de tarifa alta, útil como señal previa al cálculo de precio dinámico.
- Segmentación analítica de demanda: ejecutando el pipeline sobre históricos de viajes se obtiene una etiqueta de tarifa alta por celda y franja, aprovechable para estudiar qué zonas concentran trayectos caros.
- Priorización en despacho de flota: la probabilidad de tarifa alta puede ordenar la cola de asignación hacia trayectos de mayor valor esperado, siempre que se valide con datos reales antes de production.
- Baseline reproducible en proyectos de MLOps: al generar datos sintéticos con semilla fija, el pipeline sirve como referencia estable para comparar versiones de modelos y detectar regresiones en el contrato de tipos.
- Material docente sobre contratos de features: el repositorio ejemplifica cómo documentar y testear la frontera entre el pipeline (índices enteros) y el modelo (embedding lookups sin conversión de dtype).
- Prueba de integración de infraestructura de inferencia: al ser un modelo Keras pequeño, es adecuado para validar extremo a extremo el empaquetado, el versionado de `edges.json` y el despliegue en CPU antes de mover cargas mayores.
- Detección de deriva en producción: monitorizando la distribución de índices de bin y de celdas geolocalizadas frente a los bordes de `edges.json` se pueden detectar cambios en el patrón de recogidas que invaliden el modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor define un `metrics.json` con los campos que se reportarían, pero los valores no están incluidos en la model card ni en los metadatos del repositorio:

| Metrica | Descripcion segun el autor | Valor publicado |
|---|---|---|
| `final_loss` | Pérdida final tras el entrenamiento | no publicado |
| `num_params` | Número de parámetros del modelo | no publicado |
| `embedding_delta` | Métrica interna de variación de embeddings | no publicado |
| Exactitud, precision, recall, F1, AUC | No mencionadas por el autor | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra; por la descripción del autor ("small Keras model") y la naturaleza tabular de las entradas, la huella es previsiblemente mínima y apta para CPU, aunque no se aporta medición.
- GPU recomendadas: no disponibles; no se justifica GPU para un modelo de este tipo según la información aportada.
- Compatibilidad con GPU de consumo: probable en RTX 4090 y gamas inferiores por el tamaño reducido descrito, sin datos verificados de memoria.
- Opciones de despliegue: no se documenta ninguna (ni vLLM, ni llama.cpp, ni Ollama, ni TGI). El flujo descrito se limita a ejecución local con `python train.py` y tests con `pytest`.
- Latencia y throughput: no disponibles.
- Nota operativa: el `dtype_policy` es `float64` de extremo a extremo, lo que duplica el uso de memoria frente a `float32` en pesos y activaciones; el autor prohíbe cambiarlo sin ticket.

## Comparativa con modelos similares

No hay resultados de benchmarks publicados que permitan una comparación cuantitativa con alternativas. La tabla siguiente recoge únicamente el encuadre cualitativo; las celdas de rendimiento y licencia de los alternativos no están verificadas en la información proporcionada.

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| geofare-pipeline | Clasificador tabular binario con embeddings sobre bins y celdas geográficas | no disponible | no aplica | no disponible | Repositorio HuggingFace, 0 descargas, 0 likes |
| XGBoost | Gradient boosting sobre tablas | no aplica | no aplica | no verificada en la informacion disponible | Ampliamente disponible |
| LightGBM | Gradient boosting sobre tablas | no aplica | no aplica | no verificada en la informacion disponible | Ampliamente disponible |
| TabNet | Red neuronal para datos tabulares con atención dispersa | no disponible | no aplica | no verificada en la informacion disponible | Disponible como implementación de referencia |

Criterio de comparación recomendado: al no existir métricas publicadas, cualquier elección frente a estas alternativas debe basarse en una evaluación propia sobre datos reales de trayectos, no en la model card.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no escribe código y no soporta tool calling ni agentes. Cualquier uso en ese sentido es un error de categoría.
- Datos de entrenamiento sintéticos: el modelo se entrena sobre un dataset generado determinísticamente, no sobre tráfico real, por lo que su validez predictiva en producción no está demostrada.
- Sin métricas publicadas: no se han divulgado `final_loss`, `num_params`, `embedding_delta` ni ninguna medida de calidad (exactitud, AUC, calibración), lo que impide evaluar si el modelo aprende una señal útil.
- Riesgo de alucinación no aplica como tal, pero sí riesgo de sobreajuste al generador sintético y de predicciones sin sentido fuera del dominio de las features sintéticas.
- Dependencia crítica de `features/edges.json`: si los bordes de cuantiles no se versionan junto al modelo, los índices de entrada dejan de ser coherentes y las predicciones se degradan en silencio.
- Contrato de tipos frágil: el modelo no convierte dtypes en sus entradas de índice; alimentarlo con `float` o con el tipo incorrecto (int32 frente a int64 según la estrategia de binarización) provoca fallos o resultados incorrectos.
- `dtype_policy` fijado a `float64` de forma intencional: penaliza memoria y velocidad, y el autor restringe su cambio sin ticket, lo que puede chocar con requisitos de eficiencia en producción.
- Licencia no declarada: sin licencia explícita no hay autorización clara para uso comercial; debe contactarse con el autor antes de cualquier despliegue.
- Idiomas no declarados y no aplicables: el modelo no procesa texto, por lo que no cabe esperar soporte multilingüe.
- Repositorio sin validación comunitaria: 0 descargas y 0 likes, sin pipeline declarado, lo que sugiere que el código no ha sido replicado por terceros.
- Anomalía en metadatos: la fecha de creación indicada (2026-10-19) es posterior a la fecha habitual de consulta y resulta inconsistente; conviene verificar la integridad de los metadatos antes de citar el repositorio.
- Sin información sobre sesgos: no se documenta ningún análisis de equidad por zona geográfica, lo que es relevante en un modelo que usa geolocalización como feature principal y podría producir trato diferencial por barrio.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/david-thrower/geofare-pipeline
- Paper, blog, repositorio de código adicional o demo: no disponible en la información proporcionada.
- Resultados de búsqueda web: no se encontró ningún enlace relevante sobre el proyecto; las búsquedas devolvieron únicamente páginas sin relación (artículos enciclopédicos y una película homónima), por lo que no se incluyen.
