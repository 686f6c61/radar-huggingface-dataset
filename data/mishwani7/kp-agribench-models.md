# mishwani7/KP-AgriBench-Models

## Resumen

KP-AgriBench Models es una colección de artefactos de aprendizaje automático clásico publicada por el usuario mishwani7, entrenada y evaluada sobre el conjunto de datos mishwani7/KP-AgriBench, orientado a inteligencia agrícola. No se trata de un modelo de lenguaje ni de una red neuronal profunda: el repositorio agrupa tres pipelines serializados con joblib (un resolutor de topónimos, un predictor de demanda con predicción conforme y un detector de anomalías) más un fichero de métricas de evaluación reproducible. La librería declarada es scikit-learn y el tamaño del repositorio es de 0,0 GB en el momento de la consulta.

El paquete resuelve tres problemas operativos concretos dentro de un flujo agrícola: la normalización y resolución de nombres de lugar con variantes ortográficas, la previsión semanal de demanda por SKU con intervalos de cobertura calibrada al 90 %, y la detección de anomalías en ventas completadas y en retrasos de depósito. Su relevancia radica en que combina técnicas ligeras y bien conocidas (TF-IDF de n-gramas de caracteres, RapidFuzz, Ridge, LightGBM, Isolation Forest) con predicción conforme por split, lo que aporta garantías de cobertura estadística sin necesidad de infraestructura de GPU.

La información disponible es limitada: no hay pipeline declarado, no se especifican idiomas soportados y las métricas publicadas corresponden a conjuntos de evaluación pequeños (96 muestras etiquetadas en el resolutor, 152/48/56 en el panel de previsión). Cualquier uso en producción debe considerar ese tamaño muestral y la ausencia de validación externa independiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipelines de ML clásico: TF-IDF de n-gramas de caracteres + RapidFuzz + fonética (resolutor); Ridge y LightGBM sobre log1p con predicción conforme por split (previsor); Isolation Forest con RobustScaler (detector de anomalías) |
| Parametros totales | no disponible (no se publican recuentos de parámetros; son modelos tabulares y de recuperación léxica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelos tabulares y de resolución de entidades, sin ventana de contexto textual) |
| Tipos de cuantizacion | no disponible (artefactos joblib; no se documentan variantes cuantizadas) |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | joblib (artefactos serializados de scikit-learn y librerías afines) |

## Arquitectura y entrenamiento

El repositorio contiene tres artefactos independientes. El primero, `geo_resolver.joblib`, es un resolutor híbrido de topónimos que combina TF-IDF de n-gramas de caracteres con RapidFuzz y coincidencia fonética; se evaluó sobre 96 muestras etiquetadas, con una precisión Top-1 del 95,83 %, Top-3 del 98,96 % y MRR de 0,9740. El segundo, `conformal_forecaster.joblib`, es un previsor de demanda semanal por SKU a corto plazo construido sobre un panel de 32 semanas dividido en 152 muestras de entrenamiento, 48 de calibración y 56 de prueba, con predicción conforme por split al 90 %; se compararon tres predictores base (media móvil de 4 semanas, Ridge sobre log1p y LightGBM sobre log1p). El tercero, `audit_iforest.joblib`, es un detector de anomalías operativas y de retraso de depósito basado en Isolation Forest con escalado robusto.

No se documentan detalles sobre el origen, la composición ni el volumen del dataset de entrenamiento más allá de la referencia a mishwani7/KP-AgriBench, ni se indica si hubo ajuste fino, validación cruzada adicional o selección de hiperparámetros. Tampoco se describe ninguna innovación técnica más allá del uso de predicción conforme por split para calibrar los intervalos del previsor, que es la aportación metodológica más destacable del paquete.

## Capacidades

- Resolución de nombres de lugar con tolerancia a variantes ortográficas, errores tipográficos y similitud fonética, mediante combinación de TF-IDF de caracteres y RapidFuzz.
- Previsión de demanda semanal por SKU a horizonte corto, con intervalos de predicción calibrados al 90 % mediante predicción conforme por split.
- Detección de anomalías en ventas completadas y en retrasos de depósito, con Isolation Forest y escalado robusto.
- Evaluación reproducible: el repositorio incluye `benchmark_metrics.json` con el resumen completo de métricas.
- Integración con el ecosistema scikit-learn y joblib, lo que facilita su carga y uso dentro de pipelines de Python existentes.
- No soporta generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso: no es un modelo de lenguaje.
- No se documentan capacidades multilingües ni modos especiales de inferencia.

## Casos de uso

- Normalización de registros de explotaciones agrícolas: el resolutor puede unificar nombres de municipios, pedanías o fincas que llegan escritos de formas distintas en formularios y sistemas heredados, usando la combinación de TF-IDF de caracteres y RapidFuzz para asignar cada variante a su topónimo canónico.
- Planificación de compras y reposición de inventario: el previsor de demanda semanal por SKU permite generar previsiones a corto plazo con intervalos al 90 %, útiles para decidir pedidos a proveedores y niveles de stock de seguridad en función del ancho del intervalo.
- Ajuste de calendarios de producción y logística: al disponer de previsiones con cobertura calibrada, los equipos de operaciones pueden dimensionar turnos y rutas de reparto con una medida explícita del riesgo de quedarse cortos.
- Auditoría de ventas: el detector de anomalías sobre 222 ventas completadas (12 marcadas) sirve para revisar transacciones atípicas antes del cierre contable, priorizando la revisión manual sobre los casos señalados.
- Control de retrasos en depósitos: el análisis de 333 depósitos con mediana de retraso de 0,38 días y 79 casos de retraso elevado permite identificar patrones de demora y activar alertas sobre clientes o rutas con desviaciones recurrentes.
- Evaluación comparativa de modelos base en un dominio agrícola: el paquete incluye las métricas de tres predictores (media móvil, Ridge y LightGBM) sobre el mismo panel, lo que facilita reproducir la comparación y establecer una línea base antes de adoptar modelos más complejos.
- Prototipado rápido en un Space interactivo: la demo publicada en Hugging Face Spaces permite validar el comportamiento de los tres artefactos sin montar infraestructura propia.

## Benchmarks y rendimiento

| Artefacto | Metrica | Valor |
|---|---|---|
| geo_resolver.joblib | Top-1 accuracy (96 muestras etiquetadas) | 95,83 % |
| geo_resolver.joblib | Top-3 accuracy | 98,96 % |
| geo_resolver.joblib | MRR | 0,9740 |
| conformal_forecaster.joblib | MAE rolling_mean_4w | 1,821 |
| conformal_forecaster.joblib | MAE ridge (log1p) | 4,236 |
| conformal_forecaster.joblib | MAE lightgbm (log1p) | 9,975 |
| conformal_forecaster.joblib | Cobertura conforme al 90 % | 94,64 % (q_hat = 10,048 unidades, anchura media 19,349) |
| audit_iforest.joblib | Ventas completadas analizadas / marcadas | 222 / 12 |
| audit_iforest.joblib | Depositos analizados / marcados por retraso elevado | 333 / 79 (mediana de retraso 0,38 dias) |

No se han publicado comparaciones con modelos de referencia externos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; son modelos tabulares y de recuperación léxica que se ejecutan en CPU.
- GPU recomendadas: no se requiere GPU; cualquier CPU moderna es suficiente.
- Cabe en GPU de consumo: no aplica, el despliegue es en CPU.
- Opciones de despliegue: carga directa con joblib en Python, servicio HTTP envolviendo los pipelines (por ejemplo, con FastAPI o Flask) y ejecución dentro de un Hugging Face Space.
- Latencia y throughput estimados: no disponibles; no se publican mediciones de latencia ni de rendimiento por segundo.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KP-AgriBench Models | Pipelines de ML clasico (TF-IDF, Ridge, LightGBM, Isolation Forest) | no disponible | no aplica | MIT | Hugging Face (repo de artefactos joblib) |
| Alternativas de prevision tabular (p. ej. LightGBM o XGBoost como paquetes genericos) | Modelos de gradient boosting | no disponible | no aplica | MIT / Apache 2.0 segun implementacion | Amplia, via librerias estandar |
| Alternativas de resolucion de entidades (p. ej. deduplicacion con RapidFuzz o Splink) | Recuperacion lexica y entity resolution | no disponible | no aplica | MIT / otras | Amplia, via librerias estandar |

No se dispone de datos de benchmarks comparables con otros paquetes de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Los conjuntos de evaluacion son muy pequenos: 96 muestras etiquetadas en el resolutor y 56 muestras de prueba en el previsor. Las metricas publicadas tienen alta varianza y no garantizan el comportamiento en dominios distintos.
- El previsor se entrena sobre un panel de 32 semanas; no se documenta su robustez ante cambios estructurales de demanda, estacionalidad no observada o nuevos SKU sin historial.
- El detector de anomalias se ha analizado sobre 222 ventas y 333 depositos; no se publican tasas de falsos positivos ni validacion con etiquetas de anomalia confirmadas.
- No se documentan sesgos conocidos ni evaluaciones de equidad; al operar sobre datos agricolas y de ventas, puede heredar sesgos presentes en los registros de origen.
- No es un modelo de lenguaje: no genera texto, no razona y no admite tool calling; cualquier expectativa en ese sentido es incorrecta.
- No se especifican idiomas soportados, aunque el resolutor de toponimos y las etiquetas del dataset condicionan su utilidad al idioma y a la geografia de los datos de entrenamiento.
- Licencia MIT: permite uso comercial y modificacion con atribucion, pero el autor no ofrece garantias ni soporte.
- No se documentan procesos de validacion externa, pruebas de estres ni monitorizacion de deriva; en produccion seria necesario establecer ambos.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mishwani7/KP-AgriBench-Models
- Dataset: https://huggingface.co/datasets/mishwani7/KP-AgriBench
- Repositorio GitHub: https://github.com/abuzar-mishwani/KP-Agri-Intelligence
- Demo interactiva: https://huggingface.co/spaces/mishwani7/KP-AgriBench-Demo
