# FatimahEmadEldin/palmsat-paper

## Resumen

PalmSat es un artefacto de investigación publicado en HuggingFace (repositorio `FatimahEmadEldin/palmsat-paper`, etiquetado con `joblib`) que acompaña al artículo IEEE *PalmSat: Satellite-Only Machine Learning for Date-Palm Farm Intelligence*. No es un modelo de lenguaje ni una red neuronal generativa: es un conjunto de modelos de aprendizaje automático clásico (Ridge, Random Forest, Gradient Boosting, un MLP de PyTorch, K-Means e Isolation Forest) más el código, los datos derivados y los scripts que reproducen cada cifra del artículo. El problema que aborda es la monitorización de palmerales datileros en regiones áridas sin sensores de campo, pasarelas ni drones, usando exclusivamente imágenes gratuitas de Sentinel-2.

La propuesta consiste en una única representación derivada de satélite que alimenta tres tareas simultáneas sobre la misma parcela: estimar el rendimiento relativo (agrupamiento de años-cultivo), anticipar la evolución del dosel (predicción de NDVI a un paso) y detectar anomalías (triaje con Isolation Forest). El estudio se evalúa sobre diez explotaciones comerciales de Al Madinah (Arabia Saudí), con 1.835 adquisiciones filtradas por nubosidad entre enero de 2022 y diciembre de 2024, es decir, 30 años-cultivo completos con un NDVI medio de 0,437.

Su relevancia actual es metodológica y de alcance acotado: demuestra que una representación satelital compartida bate al baseline de persistencia en predicción de NDVI un 31,5 % (IC 95 %: 29,4–33,2 %) y en 10 de 10 fincas, pero también documenta con honestidad que el techo de rendimiento lo fija el ruido de medida y la nubosidad, no la capacidad del modelo. Es un estudio de viabilidad, no un benchmark generalizable. No hay información sobre licencia, idiomas ni pipeline en la ficha de HuggingFace, y la búsqueda web no devolvió enlaces relevantes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de ML clásico sobre series temporales satelitales: Ridge, Random Forest, Gradient Boosting, MLP (PyTorch), K-Means e Isolation Forest sobre una representación compartida |
| Parametros totales | no disponible (no aplica: no es un modelo neuronal único; los artefactos son modelos scikit-learn y un MLP de tamaño no especificado) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica; ventana autoregresiva de lags y estadísticos móviles sobre visitas de Sentinel-2 (cada ~5 días) |
| Tipos de cuantizacion | no disponible (no aplica) |
| Idiomas soportados | no disponible (no aplica: no procesa lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | joblib (etiqueta del repositorio); también código Python y datos asociados al artículo |
| Tarea | Prediccion de NDVI a un paso, agrupamiento de años-cultivo y deteccion de anomalias |
| Datos de entrada | Sentinel-2 L2A (10 m), reducidos por visita a NDVI, NDWI, SAVI y porcentaje de nubosidad de escena |
| Dominio | Agricultura de precisión en palmerales datileros (regiones áridas) |
| Tamaño del repositorio | 0,0 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-07-23 |
| Última actualización | 2026-09-20 |

## Arquitectura y entrenamiento

El sistema no emplea un transformer ni un modelo de secuencia profundo. Las escenas Sentinel-2 L2A se enmascaran por nubes y se reducen a un vector por visita con cuatro valores: NDVI, NDWI, SAVI y porcentaje de nubosidad de la escena. Una única pasada de ingeniería de características convierte esa serie en una representación compartida: lags autorregresivos, estadísticos móviles y codificaciones cíclicas de fecha para la vista por visita, y seis descriptores fenológicos por año-cultivo para la vista estacional. Sobre esa representación común leen tres módulos: K-Means sobre años-cultivo, un conjunto de cinco modelos de predicción (persistencia, MLP, Ridge, Random Forest y Gradient Boosting) y un Isolation Forest para triaje de anomalías.

El entrenamiento usa diez fincas comerciales de Al Madinah, con 1.835 adquisiciones filtradas por nubosidad entre enero de 2022 y diciembre de 2024 (30 años-cultivo, NDVI medio 0,437). Los modelos se entrenan con 2022–2023 y se evalúan sobre 2024 reservado, con hiperparámetros seleccionados mediante validación cruzada cronológica únicamente dentro de los años de entrenamiento; la búsqueda cubrió 132 configuraciones. No se menciona RLHF ni DPO (no aplica). Como innovación metodológica destaca el uso de una sola representación satelital para tres tareas y la cuantificación explícita del techo de rendimiento: el 58,6 % de la varianza del NDVI del año de test queda en un residuo irrecuperable por modelos basados en lags, lo que sitúa el techo indicativo de R² en torno a 0,41.

## Capacidades

- Predicción de NDVI a un paso en adelante a partir del histórico de visitas satelitales de una parcela.
- Predicción de NDVI con calidad dependiente de la nubosidad: R² = 0,276 en escenas casi claras (<5 % de nubes), con R² negativo en escenas más nubosas.
- Agrupamiento no supervisado de años-cultivo en tres grupos (silhouette 0,466 con k = 3; ARI bootstrap 0,87).
- Ordenación reproducible de fincas por verdor acumulado: Spearman ρ = 0,96 al cambiar la definición de año de cultivo y ρ = 0,67 entre los periodos 2022–23 y 2024.
- Triaje de anomalías con Isolation Forest: ROC-AUC 0,74 para eventos sintéticos de 1σ y 0,96 para 4σ.
- Cálculo y análisis conjunto de índices de vegetación (NDVI, SAVI, NDWI) con estudio de su colinealidad.
- No dispone de tool calling, function calling, capacidades de agente, razonamiento multi-paso, generación de texto, código, matemáticas, visión general ni audio.

## Casos de uso

- Priorización de inspecciones de campo: ordenar las parcelas de un conjunto por verdor acumulado (ρ = 0,67 entre periodos) permite dirigir los recursos de campo a las fincas con peor comportamiento relativo, sin necesidad de sensores instalados.
- Detección temprana de estrés en el dosel: el Isolation Forest genera avisos de inspección sobre observaciones concretas; al recuperar aproximadamente la mitad de los eventos de 4σ con un presupuesto del 5 %, funciona como disparador de visita, no como alarma automática.
- Planificación de riego y operaciones estacionales: el análisis de fenología documenta que el verdor del dosel alcanza su máximo en temporada fría (enero, 0,502) y su mínimo en verano (julio, 0,395), información útil para calendarizar labores.
- Sustitución de instrumentación en explotaciones pequeñas: al depender solo de Sentinel-2 (revisita ~5 días, 10 m, gratuito), permite monitorizar parcelas dispersas fuera de cobertura celular donde el coste de sondas y pasarelas supera el valor del cultivo.
- Evaluación comparativa de fincas para inversores o cooperativas: el pipeline produce una clasificación ordenada y reproducible de fincas, con la advertencia explícita de que las etiquetas Premium / Standard / Economy son nombres de grupos fenológicos y no grados económicos.
- Investigación agronómica y reproducción de resultados: el repositorio incluye código, datos y scripts que reproducen todas las cifras del artículo, por lo que sirve como base para replicar el estudio en otras regiones o cultivos.
- Control de calidad de series satelitales: el hallazgo de que el 46,7 % de las alertas cae en el decil superior de nubosidad justifica mostrar la fracción de nube junto a cada aviso y usar el sistema para auditar la calidad de la serie antes de cualquier análisis agronómico.

## Benchmarks y rendimiento

Predicción de NDVI a un paso sobre el año 2024 reservado, tras una búsqueda de 132 configuraciones:

| Modelo | RMSE (por defecto) | RMSE (ajustado) | R² (ajustado) | IC 95 % sobre RMSE |
|---|---|---|---|---|
| Persistencia (baseline) | 0,1381 | 0,1381 | −0,766 | [0,124, 0,150] |
| MLP (PyTorch) | 0,1150 | 0,1049 | −0,018 | [0,098, 0,112] |
| Ridge | 0,0970 | 0,0955 | 0,156 | [0,087, 0,102] |
| Random Forest | 0,0992 | 0,0950 | 0,165 | [0,086, 0,103] |
| Gradient Boosting | 0,0964 | 0,0946 | 0,172 | [0,087, 0,102] |

Métricas adicionales reportadas en la model card:

| Evaluación | Resultado |
|---|---|
| Ganancia de Gradient Boosting sobre persistencia | 31,5 % (IC 95 %: 29,4–33,2 %) |
| Fincas en las que el boosting bate a persistencia | 10/10 (test de signos p = 0,001) |
| Ganancia del boosting sobre Ridge | IC bootstrap [−0,4, +2,2] % (no significativa) |
| R² en escenas con <5 % de nube | 0,276 |
| Varianza de NDVI en el residuo (tendencia de 3 visitas + residuo) | 58,6 % |
| Techo indicativo de R² / porcentaje alcanzado | ~0,41 / ~42 % |
| Isolation Forest: ROC-AUC a 1σ / 4σ | 0,74 / 0,96 |
| Anomalías marcadas (presupuesto de inspección) | 92 observaciones (5,0 %) |
| Alertas en el decil superior de nubosidad | 46,7 % |
| Silhouette del clustering (k = 3) / ARI bootstrap | 0,466 / 0,87 |
| Correlación NDVI–SAVI / NDVI–NDWI | r = 1,000 / r = −0,979 |
| Varianza conjunta de índices explicada por un componente principal | 99,1 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; los artefactos en formato joblib (modelos scikit-learn y datos derivados) se ejecutan en CPU.
- GPU recomendadas: no se especifican en la documentación; el entrenamiento y la inferencia de los modelos tabulares descritos no requieren GPU.
- GPU de consumo: no aplica; no hay indicios de que el pipeline necesite acelerador gráfico.
- Opciones de despliegue: inferencia estándar de scikit-learn / joblib en Python; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no corresponden a este tipo de artefacto.
- Latencia y throughput: no disponibles en la información proporcionada.
- Requisito operativo relevante: acceso a imágenes Sentinel-2 L2A (Copernicus) y capacidad de ejecutar el enmascarado de nubes y la extracción de índices previa a la inferencia.

## Comparativa con modelos similares

La información proporcionada no incluye comparaciones con otros sistemas publicados de monitorización satelital de cultivos, por lo que la comparación externa es "no disponible". La model card sí compara internamente los cinco modelos de predicción evaluados, resumidos aquí:

| Modelo | RMSE (ajustado) | R² (ajustado) | Papel en el estudio |
|---|---|---|---|
| Persistencia | 0,1381 | −0,766 | Baseline de referencia |
| MLP (PyTorch) | 0,1049 | −0,018 | Alternativa neuronal, peor que los modelos lineales y de árboles |
| Ridge | 0,0955 | 0,156 | Alternativa operativa equivalente al boosting según el IC bootstrap |
| Random Forest | 0,0950 | 0,165 | Rendimiento intermedio-alto |
| Gradient Boosting | 0,0946 | 0,172 | Mejor RMSE y R², con ganancia significativa solo frente a persistencia |

## Limitaciones y advertencias

- Alcance muy reducido: diez fincas, una sola región, tres años y un único año de test reservado; los autores lo describen explícitamente como estudio de viabilidad y no como benchmark generalizable.
- Ausencia total de etiquetas de verdad terreno: no hay datos de rendimiento, ingresos ni etiquetas agronómicas en el conjunto de datos.
- El techo de rendimiento lo marca el ruido de medida y la nubosidad, no la capacidad del modelo: el 58,6 % de la varianza del NDVI queda en un residuo irrecuperable y el R² se vuelve negativo en escenas nubosas.
- Las diferencias entre modelos aprendidos no son fiables: el IC bootstrap de la ganancia del boosting sobre Ridge es [−0,4, +2,2] %, por lo que una regresión Ridge de doce características es una elección operativa igual de válida.
- La estructura de tres grupos (Premium / Standard / Economy) es una convención descriptiva, no una gradación económica: el silhouette es plano entre k = 2 y k = 4, el óptimo cambia a k = 2 con un año de cultivo septiembre–agosto y ninguna finca mantiene el mismo grupo en los tres años.
- La tasa de alertas no es un atributo estable de la finca (ρ = 0,10, p = 0,78) y nunca debe agregarse en una puntuación por finca; solo debe usarse como disparador de inspección sobre observaciones individuales.
- Riesgo de falsos positivos atmosféricos: el 46,7 % de las alertas cae en el decil superior de nubosidad, por lo que cerca de la mitad son probablemente atmosféricas y no agronómicas.
- NDWI no es una señal independiente de riego en este conjunto: correlaciona con NDVI a r = −0,979 y un único componente principal explica el 99,1 % de la varianza conjunta de los índices; separar el estado hídrico del verdor requiere un índice SWIR o radar.
- Licencia no disponible: no se puede confirmar si el uso comercial está permitido, lo que es un bloqueo para despliegues en producción.
- Advertencia de categoría: este repositorio no es un modelo de lenguaje; las expectativas asociadas a generación de texto, tool calling o agentes no aplican.
- La búsqueda web realizada no devolvió ninguna fuente relevante sobre el proyecto (los resultados obtenidos correspondían a portales de videojuegos), por lo que no hay verificación externa adicional.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/FatimahEmadEldin/palmsat-paper
- Artículo en el repositorio: `paper/main.pdf` (*PalmSat: Satellite-Only Machine Learning for Date-Palm Farm Intelligence*, IEEE)
- Figura de arquitectura: `paper/figs/architecture.png`
- Repositorio de resultados y código de análisis: no disponible como URL independiente (contenido dentro del propio repositorio de HuggingFace)
- Demo: no disponible
- Enlaces adicionales relevantes: no disponible (la búsqueda web no arrojó resultados pertinentes)
