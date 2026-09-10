# jb10231/bitcoin-address-risk-model-v2

## Resumen

El modelo `jb10231/bitcoin-address-risk-model-v2` es un clasificador binario basado en LightGBM que estima la probabilidad de que una dirección de Bitcoin esté asociada a actividad de ransomware. Lo desarrolla el usuario de HuggingFace jb10231 y se entrena sobre el UCI BitcoinHeist Ransomware Address Dataset (ID 526), que contiene 2.916.697 observaciones diarias agregadas a una fila por dirección. La tarea es de clasificación tabular: `0` para direcciones blancas (benignas) y `1` para direcciones vinculadas a alguna familia de ransomware.

No se trata de un modelo generativo ni de una red neuronal: es un conjunto de árboles de decisión con boosting sobre nueve características de comportamiento de dirección (grado de entrada/salida, número de vecinos, ingresos, actividad temporal, etc.). Su relevancia es práctica dentro del análisis forense de cadenas de bloques: aporta una señal de riesgo cuantificable y reproducible que puede integrarse en procesos de investigación de delitos financieros, complementando el trazado on-chain y los datos de proveedores de análisis.

El autor lo describe explícitamente como una señal de investigación y no como un clasificador universal de fraudes modernos. El repositorio no incluye licencia, idiomas ni pipeline declarados, y registra 0 descargas y 0 likes en el momento de la consulta, por lo que no cuenta con validación externa de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre arboles de decision, clasificacion binaria) |
| Parametros totales | no disponible (no se documentan numero de arboles, hojas ni profundidad) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica |
| Idiomas soportados | no aplica (entrada tabular, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | Pickle de Python (`bitcoin_address_risk_model.pkl`) |
| Caracteristicas de entrada | length, weight, count, looped, neighbors, income, snapshot_count, active_span_days, avg_daily_income |
| Umbral de decision ajustado | 0.625 |
| Tamano del repositorio | 0.0 GB (metadato declarado) |
| Libreria | lightgbm |

## Arquitectura y entrenamiento

La arquitectura es un clasificador LightGBM, es decir, un ensamblado de arboles de decision entrenados secuencialmente mediante gradient boosting. LightGBM emplea crecimiento de arboles por hojas (leaf-wise) con histogramas de caracteristicas, lo que reduce coste de memoria y tiempo de entrenamiento frente a enfoques level-wise en conjuntos tabulares de millones de filas. No hay componentes de atencion, estados recurrentes ni decodificacion especulativa: el modelo produce una probabilidad escalar por direccion.

El entrenamiento usa el UCI BitcoinHeist Ransomware Address Dataset (Dataset ID 526), con 2.916.697 instancias brutas de observaciones diarias que se agregan a una fila por direccion Bitcoin. Las caracteristicas son nativas del dataset (comportamiento de grafo y agregados a nivel de direccion). La etiqueta es binaria: `0` para direcciones blancas y `1` para direcciones asociadas a familias de ransomware. No se documentan en la model card el numero de tokens equivalente, la particion train/validacion/test, los hiperparametros de LightGBM, ni si hubo ajuste de hiperparametros o validacion cruzada. Tampoco se especifica ninguna innovacion tecnica adicional mas alla del ajuste del umbral de decision a 0.625.

El repositorio incluye artefactos de diagnostico: `metrics_summary.json` con el resumen detallado de metricas y dataset, `confusion_matrix.png` con la matriz de confusion en test y `shap_summary.png` con la importancia de caracteristicas calculada mediante valores SHAP.

## Capacidades

- Clasificacion binaria de direcciones Bitcoin: devuelve una probabilidad de pertenencia a la clase ransomware y, aplicando el umbral 0.625, una etiqueta `0`/`1`.
- Puntuacion por lotes (batch scoring) sobre tablas de direcciones, apta para procesar grandes volumenes con pandas o integraciones de LightGBM.
- Interpretabilidad de caracteristicas mediante SHAP, util para justificar decisiones ante equipos de cumplimiento o peritaje forense.
- Deteccion orientada especificamente a ransomware, no a fraude generico ni a otros delitos financieros.
- No dispone de generacion de texto, razonamiento, codigo, matematicas ni capacidades de vision.
- No soporta tool calling, function calling ni flujos de agente multi-paso.
- No tiene capacidades multilingues: la entrada es exclusivamente numerica/tabular.
- No implementa modo de razonamiento explicito (thinking mode) ni procesamiento de audio.

## Casos de uso

- Senal de riesgo en plataformas de analisis on-chain: el modelo puntua direcciones y aporta un indicador cuantitativo que se agrega a las heuristicas de trazado ya existentes, ayudando a priorizar direcciones sospechosas antes de una revision manual.
- Triaje en investigaciones de ransomware: ante un incidente con pago de rescate, permite ordenar las direcciones vinculadas al flujo por probabilidad de riesgo y concentrar el analisis forense en las de mayor puntuacion.
- Enriquecimiento de alertas en CERT/CSIRT: el score puede incorporarse como campo adicional en alertas de seguridad para contextualizar si una direccion receptora tiene patrones compatibles con recaudacion de rescates.
- Revision previa en proveedores de servicios de activos virtuales (VASP): como filtro preliminar de bajo coste que marque direcciones antes de aplicar reglas manuales o listas de sanciones, reduciendo el volumen que llega a analistas humanos.
- Investigacion academica y reproducibilidad: sirve como linea base entrenada y documentada sobre BitcoinHeist, con metricas publicadas y graficos de confusion y SHAP, para comparar futuros enfoques (por ejemplo, modelos de grafos) bajo las mismas caracteristicas.
- Estudios retrospectivos de series historicas: permite puntuar conjuntos historicos de direcciones y analizar la evolucion temporal de la actividad asociada a familias de ransomware, siempre que las caracteristicas se reconstruyan con la misma definicion que en entrenamiento.
- Apoyo a unidades de recuperacion de fondos: al priorizar direcciones con alta probabilidad de pertenecer a infraestructura de ransomware, facilita la seleccion de objetivos para solicitudes de trazado o cooperacion con exchanges.
- Auditoria interna de modelos de riesgo: el resumen de metricas y el grafico SHAP permiten documentar el comportamiento del clasificador en procesos de validacion de modelos de delito financiero.

## Benchmarks y rendimiento

Resultados declarados por el autor en el conjunto de test, con umbral ajustado de 0.625:

| Metrica | Valor |
|---|---|
| Accuracy | 0.9288 |
| Precision | 0.6067 |
| Recall | 0.6990 |
| F1 Score | 0.6496 |
| AUC-ROC | 0.9346 |
| PR-AUC | 0.7127 |
| Umbral ajustado | 0.625 |

No se han publicado comparaciones con otros modelos ni resultados desglosados por familia de ransomware en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB; el modelo no requiere GPU.
- GPU recomendadas: no aplica. No hay soporte declarado de aceleracion por GPU para la inferencia de este artefacto.
- Compatibilidad con GPU de consumo: irrelevante, ya que la inferencia es en CPU.
- RAM estimada: no disponible (el tamano del fichero `.pkl` no se especifica; el repositorio declara 0.0 GB).
- Opciones de despliegue: carga directa con `pickle` y `lightgbm` en Python, servicio REST con FastAPI o Flask, trabajos por lotes con pandas, orquestacion con Airflow o Spark, y contenedores Docker para servir el modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada, aunque se trata de un modelo tabular de bajos requisitos computacionales en comparacion con modelos neuronales.
- Almacenamiento necesario: minimo, limitado al fichero del modelo y a los artefactos de metricas y graficos incluidos en el repositorio.

## Comparativa con modelos similares

No se dispone de datos comparativos publicados en la informacion proporcionada. La model card no incluye referencias a alternativas evaluadas sobre el mismo conjunto de datos ni cifras de otros clasificadores. Como categorias de alternativas cualitativas, sin datos numericos disponibles, cabria considerar clasificadores de gradient boosting equivalentes (XGBoost, CatBoost) sobre las mismas caracteristicas de BitcoinHeist, asi como enfoques basados en redes neuronales de grafos sobre datos de transacciones, pero no se aportan parametros, contexto, rendimiento ni licencia de esas alternativas en la documentacion consultada.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bitcoin-address-risk-model-v2 | no disponible | no aplica | Accuracy 0.9288, F1 0.6496, AUC-ROC 0.9346 | no disponible | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Precision moderada (0.6067) con umbral 0.625: una proporcion relevante de las direcciones marcadas como ransomware son falsos positivos, lo que exige revision humana antes de cualquier accion.
- Recall del 0.6990: aproximadamente un 30% de las direcciones positivas del test no se detectan, por lo que el modelo no debe usarse como unica fuente de decision.
- Alcance limitado a Bitcoin: no cubre otras cadenas, tokens, stablecoins ni pagos fuera de la red Bitcoin.
- Sesgo de dominio: el modelo aprende los patrones de las familias de ransomware presentes en el dataset BitcoinHeist, por lo que puede generalizar mal a tacticas de recaudacion posteriores o a otros tipos de delito financiero. El propio autor indica que no es un clasificador universal de fraudes modernos.
- Deriva temporal: la model card no especifica el periodo temporal cubierto por el entrenamiento ni se documenta una validacion out-of-time, de modo que el rendimiento en datos actuales no esta garantizado.
- Dependencia estricta del esquema de caracteristicas: cualquier variacion en la definicion de las nueve variables de entrada respecto a las del entrenamiento invalida las predicciones.
- Licencia no disponible: la ausencia de licencia explicita impide confirmar si se permite el uso comercial, la modificacion o la redistribucion del modelo. Es un riesgo juridico relevante para produccion.
- Ausencia de validacion externa: 0 descargas y 0 likes en el repositorio, sin evaluaciones independientes ni replicaciones conocidas.
- Riesgo de seguridad al deserializar: el modelo se distribuye como fichero `.pkl` que se carga con `pickle.load`, un formato que puede ejecutar codigo arbitrario; conviene verificar el origen y aislar la carga.
- No se documentan hiperparametros, particion de datos ni metodologia de ajuste del umbral, lo que dificulta auditar la reproducibilidad del resultado.
- Los metadatos del repositorio muestran fechas de creacion y actualizacion de 2026-09-10, con un intervalo de dos segundos entre ambas, lo que sugiere un registro automatizado o incompleto.
- En este modelo no aplica el concepto de alucinacion generativa; el riesgo equivalente son los falsos positivos y falsos negativos en la clasificacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jb10231/bitcoin-address-risk-model-v2
- Dataset UCI BitcoinHeist Ransomware Address Dataset (ID 526): https://archive.ics.uci.edu/dataset/526/bitcoinheist+ransomware+address+dataset
- Articulo del dataset: A. V. M. F. Ribeiro, A. H. C. Oliveira, L. C. R. de Souza, C. R. P. Souza y R. A. F. Lima, "BitcoinHeist Ransomware Address Dataset", IEEE Latin America Transactions, vol. 18, no. 12, pp. 2097-2104, diciembre de 2020, doi: 10.1109/TLA.2020.3045262
- Documentacion de LightGBM: https://lightgbm.readthedocs.io/
- Nota sobre la busqueda web: las consultas realizadas no devolvieron resultados relevantes sobre este modelo; los unicos resultados obtenidos correspondian al portal Seznam.cz y no guardan relacion con el contenido de esta ficha.
