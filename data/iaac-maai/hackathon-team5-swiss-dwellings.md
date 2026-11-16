# iaac-maai/hackathon-team5-swiss-dwellings

## Resumen

Swiss Dwellings es un autoencoder denso para datos tabulares desarrollado por el equipo 5 del curso AI Methods I del máster MaAI del IAAC (Instituto de Arquitectura Avanzada de Cataluña) durante el curso 2026/27. El modelo detecta perfiles de vivienda atípicos a partir de 24 características ambientales y de distribución de apartamentos suizos, y genera además una huella latente de 8 dimensiones que permite búsquedas de similitud entre viviendas. Su aplicación práctica es doble: señalar inmuebles con condiciones acústicas o de soleamiento inusuales y servir como motor de un "Quiet Twin Finder" que sugiere alternativas potencialmente más silenciosas.

Técnicamente es un autoencoder de 7.904 parámetros con arquitectura 24 → 64 → 32 → 8 → 32 → 64 → 24, entrenado sobre 26.248 apartamentos residenciales del dataset Swiss Dwellings v3.0.0. El modelo se distribuye exclusivamente en formato ONNX (48.788 bytes) y se ejecuta con ONNX Runtime en CPU, sin necesidad de PyTorch. La puntuación de anomalía es el error cuadrático medio entre la entrada estandarizada y su reconstrucción, con un umbral fijado en 0,179895 (percentil 95 del error de validación normal).

Es relevante como ejemplo de pipeline completo y reproducible de detección de anomalías en dominio tabular aplicado al entorno construido, con métricas honestas sobre etiquetas proxy (ROC AUC 0,7418 sobre reglas de ruido) y una licencia permisiva (MIT para el código, CC BY 4.0 para los datos derivados). No es un modelo de lenguaje ni un sistema generativo: es una herramienta de scoring y similitud para analistas inmobiliarios y compradores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder denso tabular (encoder 24→64→32→8; decoder 8→32→64→24; ReLU entre capas ocultas, salida lineal) |
| Parámetros totales | 7.904 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada fija de 24 características tabulares) |
| Tipos de cuantización | No disponible (el modelo se distribuye en ONNX de 48.788 bytes; no se documentan variantes cuantizadas) |
| Idiomas soportados | No aplica (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | MIT (código del modelo); los datos derivados conservan CC BY 4.0 |
| Formato de pesos | ONNX (`anomaly_ae.onnx`); configuración en `anomaly_ae_config.json` |

## Arquitectura y entrenamiento

El modelo es un autoencoder completamente denso para datos tabulares. El encoder proyecta las 24 características de entrada a capas de 64 y 32 unidades con activación ReLU, hasta un cuello de botella latente de 8 dimensiones. El decoder invierte el camino (8 → 32 → 64 → 24) con salida lineal, adecuada para reconstruir variables estandarizadas continuas. Se compararon tres configuraciones con semilla 42, 35 épocas, batch de 256, optimizador Adam a 0,001 y pérdida MSE sobre la misma partición normal de entrenamiento y validación: DenseAE-4 (7.644 parámetros), DenseAE-8 (7.904 parámetros, seleccionado) y Conv1DAE-8 (7.033 parámetros). DenseAE-8 obtuvo el mejor equilibrio entre MSE de validación (0,0720) y ROC AUC de test (0,7418), con un tiempo de entrenamiento de 7,97 segundos.

Los datos provienen de Swiss Dwellings v3.0.0 (Standfest et al. / Archilyse AG, Zenodo 7788422, DOI 10.5281/zenodo.7788422), que describe 45.176 apartamentos y unos 370.000 espacios. El pipeline retuvo 44.195 apartamentos con al menos dos registros de área y características agregadas completas, y el conjunto de entrenamiento final quedó en 26.248 apartamentos normales con 24 características agrupadas en cuatro bloques: acústica (8 variables de tráfico diurno/nocturno y tren), soleamiento (6 variables de iluminancia en equinoccio, verano e invierno), vistas (5 variables de cielo, vegetación, edificios, isovista y calle) y distribución/centralidad (5 variables de área, número de registros, planta media, perímetro de ventanas y centralidad de cercanía). La estandarización se ajustó únicamente sobre apartamentos normales de entrenamiento y se exportó junto al modelo; no se debe reajustar un escalador alternativo en inferencia.

## Capacidades

- Detección de anomalías por error de reconstrucción: puntuación MSE media sobre las 24 características estandarizadas, con umbral predefinido de 0,179895 y salida booleana `is_anomaly`.
- Generación de huella latente de 8 dimensiones por apartamento, utilizable para búsqueda de similitud experimental entre viviendas.
- Descomposición del error por característica (errores cuadráticos individuales) para inspeccionar qué variables contribuyen más a la puntuación.
- Cálculo de la ratio `score / threshold` para priorizar casos según su grado de desviación respecto al umbral.
- Inferencia ligera en CPU mediante ONNX Runtime, sin dependencia de PyTorch ni GPU.
- Procesamiento por lotes: las salidas `reconstruction` y `latent` tienen formas `(batch, 24)` y `(batch, 8)` respectivamente.
- No soporta tool calling, agentes, razonamiento multi-paso, generación de texto, visión, audio ni capacidades multilingües; es un modelo puramente numérico-tabular.

## Casos de uso

- Triaje de carteras inmobiliarias: puntuar todos los apartamentos de un listado con el autoencoder y ordenar por `score / threshold` para que un analista revise primero los perfiles más atípicos antes de una visita o tasación.
- Búsqueda de alternativas más silenciosas: usar el vector latente de 8 dimensiones de un piso concreto como consulta de similitud sobre el catálogo y filtrar candidatos con menores medias de ruido de tráfico diurno y nocturno.
- Auditoría de calidad de datos: detectar registros de simulación con combinaciones de variables incoherentes (por ejemplo, iluminancia o isovista fuera de rango) antes de incorporarlos a un pipeline analítico, aprovechando que el error de reconstrucción señala entradas que el modelo no ha visto en la distribución normal.
- Informes de compra para particulares: generar una ficha automática que indique si el perfil acústico y de soleamiento del inmueble se desvía del percentil 95 de la población de referencia, con la contribución por característica como material de apoyo (no como explicación causal).
- Segmentación exploratoria de edificios: agrupar apartamentos por su huella latente para identificar tipologías ambientales (por ejemplo, orientaciones con alta insolación y bajo ruido frente a interiores ruidosos) y alimentar estudios urbanos comparativos.
- Enseñanza y reproducibilidad de pipelines: servir como caso de referencia completo (dataset público, notebook, exportación ONNX, configuración de escalador y umbral) para cursos de machine learning aplicado a arquitectura, con tiempos de entrenamiento por debajo de los 15 segundos.
- Prototipado de API de scoring: integrar el ONNX en un servicio mínimo (FastAPI, ONNX Runtime) que reciba las 24 características agregadas y devuelva score, umbral, flag de anomalía y latente, como base para un futuro buscador de "gemelos silenciosos".

## Benchmarks y rendimiento

Resultados de la comparación de configuraciones guardada en el notebook (semilla 42, 35 épocas, batch 256, Adam 0,001, MSE):

| Configuración | Latente | Parámetros | Tiempo de entrenamiento (s) | MSE validación (normal) | MSE test (normal) | Umbral | ROC AUC test | Precisión | Recall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| DenseAE-4 | 4 | 7.644 | 9,28 | 0,2174 | 0,2041 | 0,6154 | 0,7310 | 0,7797 | 0,1209 |
| **DenseAE-8 (seleccionado)** | **8** | **7.904** | **7,97** | **0,0720** | **0,0716** | **0,1799** | **0,7418** | **0,8138** | **0,2144** |
| Conv1DAE-8 | 8 | 7.033 | 14,57 | 0,0791 | 0,0819 | No disponible | No disponible | No disponible | No disponible |

El conjunto de evaluación contiene 5.648 apartamentos normales y 5.648 apartamentos etiquetados con reglas de ruido (conjunto balanceado). Las etiquetas son proxies basados en reglas de percentil (tráfico interior diurno por encima del percentil 90 del dataset completo, tráfico en ventana diurno por encima del 92 o ruido de tren interior diurno por encima del 95), que marcan 6.633 apartamentos (15%), y no constituyen límites regulatorios suizos ni anotaciones independientes. No se han publicado resultados frente a benchmarks estándar de machine learning en la información disponible.

## Requisitos de hardware

- VRAM: no aplica; la inferencia se ejecuta en CPU con ONNX Runtime.
- GPU recomendadas: ninguna; el modelo de 7.904 parámetros y 48.788 bytes no requiere aceleración por GPU.
- Cabe en cualquier GPU de consumo e incluso en entornos sin GPU (portátiles, contenedores pequeños, funciones serverless).
- Opciones de despliegue: ONNX Runtime (CPU) como vía documentada; cualquier servidor HTTP o framework de serving compatible con ONNX (FastAPI, BentoML, Triton) puede alojar el modelo, aunque no se documentan integraciones específicas.
- Latencia y throughput: no disponibles en la información proporcionada; por el tamaño del modelo se espera latencia de milisegundos por lote en CPU, pero no hay mediciones publicadas.
- Memoria y almacenamiento: el repositorio de Hugging Face ocupa 0,0 GB según la ficha, lo que confirma un artefacto de despliegue trivial.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto / entrada | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Swiss Dwellings DenseAE-8 | Autoencoder tabular | 7.904 | 24 características | ROC AUC 0,7418 (proxy de ruido) | MIT (código), CC BY 4.0 (datos) | Hugging Face + GitHub |
| DenseAE-4 (misma familia) | Autoencoder tabular | 7.644 | 24 características | ROC AUC 0,7310 | MIT | Incluido en el mismo notebook |
| Conv1DAE-8 (misma familia) | Autoencoder convolucional 1D | 7.033 | 24 características | Métricas de test no disponibles | MIT | Incluido en el mismo notebook |
| Alternativas externas de detección de anomalías tabulares | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de información sobre modelos comparables de otros autores en la documentación proporcionada; la comparación se limita a las tres configuraciones evaluadas por el propio equipo.

## Limitaciones y advertencias

- Las métricas de detección se calculan sobre etiquetas proxy basadas en reglas de percentil de ruido, no sobre anotaciones independientes ni sobre normativa acústica suiza; el recall de 0,2144 indica que el modelo pasa por alto la mayoría de los casos marcados por las reglas.
- El error de reconstrucción por característica no es una explicación causal ni una probabilidad de defecto; no debe presentarse como diagnóstico técnico del inmueble.
- La entrada debe ser exactamente el vector de 24 agregados a nivel de apartamento en el orden de `config["feature_names"]`, estandarizado con la media y escala exportadas; las filas crudas de habitaciones del CSV no son válidas y no debe reajustarse un escalador alternativo.
- Los valores faltantes o no finitos deben rechazarse; el modelo no está diseñado para imputación.
- Las medias de ruido son resúmenes aritméticos de dBA, no promedios acústicos equivalentes en energía; `apt_room_count` cuenta registros de área (incluidos espacios auxiliares) y el área sumada no es superficie neta habitacional verificada.
- Los vectores del escalador y las características de ejemplo fueron redondeados por el exportador, lo que puede introducir pequeñas discrepancias numéricas.
- La búsqueda de similitud por latente es experimental y no se han publicado evaluaciones de calidad de recuperación.
- La licencia MIT del modelo no sustituye la licencia CC BY 4.0 de los datos Swiss Dwellings y de los ejemplos derivados; cualquier uso comercial de datos derivados debe mantener la atribución.
- No hay servidor en vivo, API ni despliegue en Render en esta entrega; la página de model server y la API son entregables posteriores según la model card.
- El modelo está entrenado exclusivamente con viviendas suizas y no se ha validado su transferencia a otros parques inmobiliarios.
- Es un proyecto académico de hackatón con 0 descargas y 0 likes en el momento de la ficha; no hay evidencia de uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/iaac-maai/hackathon-team5-swiss-dwellings
- Repositorio de código: https://github.com/iaac-maai/hackathon-team5-swiss-dwellings
- Notebook de entrenamiento: https://github.com/iaac-maai/hackathon-team5-swiss-dwellings/blob/main/01_autoencoder/notebook/autoencoder.ipynb
- Dataset Swiss Dwellings v3.0.0 en Zenodo: https://zenodo.org/records/7788422
- DOI del dataset: 10.5281/zenodo.7788422
