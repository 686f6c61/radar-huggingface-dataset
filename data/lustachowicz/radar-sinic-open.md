# lustachowicz/radar-sinic-open

## Resumen

Radar Sinic (modelo abierto) es un conjunto de tres clasificadores LightGBM que estiman la probabilidad de que se declare un episodio de cianobacterias (floración de algas verdiazules) en una zona de baño vigilada, a partir exclusivamente de dos características derivadas de una imagen Sentinel-2 L2A. Lo desarrolla el autor de HuggingFace `lustachowicz` en el marco del proyecto "Radar Sinic" de análisis de datos espaciales. El problema que aborda es la predicción a corto plazo (hoy, mañana y a tres días) de un riesgo sanitario real, usando como etiqueta de entrenamiento las resoluciones oficiales de cierre de zonas de baño emitidas por la inspección sanitaria polaca (sanepid).

No es un modelo de lenguaje: es un modelo tabular de gradient boosting con dos únicas variables de entrada, `s2_ndci_p90` (percentil 90 del índice NDCI = (B5 − B4) / (B5 + B4) sobre píxeles de agua, que mide el verdor del agua) y `s2_scum_frac` (fracción de píxeles de agua con película superficial, según FVI = (B8 − B4) / (B8 + B4) > 0,2 y B8 > 0,03). Se publica en abierto con licencia MIT como contrapunto deliberadamente limitado a la versión cerrada del proyecto, que añade Sentinel-3, meteorología y posición del punto de baño.

Su relevancia es doble: por un lado, sirve de referencia reproducible para evaluar cuánto valor predictivo aporta Sentinel-2 por sí solo en un problema de etiqueta rara y muy desbalanceada; por otro, documenta de forma explícita su inferioridad frente al modelo completo y frente a una línea base trivial basada en el histórico de cierres, algo poco habitual en model cards.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting sobre árboles de decisión (LightGBM, `lgb.Booster`) |
| Parametros totales | No disponible (el autor no publica número de hojas ni nodos; los tres modelos tienen 28, 17 y 31 árboles respectivamente) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular; la entrada es un vector de 2 características numéricas) |
| Tipos de cuantizacion | No aplica (LightGBM no usa cuantización de pesos; los árboles se serializan en texto plano) |
| Idiomas soportados | Polaco (`pl`), únicamente a efectos de dominio y nomenclatura; las entradas son numéricas y no hay procesamiento de lenguaje |
| Licencia | MIT |
| Formato de pesos | Ficheros de texto de LightGBM: `model_y_cyano_0_open_S2.txt`, `model_y_cyano_1_open_S2.txt`, `model_y_cyano_3d_open_S2.txt` |
| Tarea (pipeline) | `tabular-classification` |
| Objetivos | `y_cyano_0` (hoy), `y_cyano_1` (mañana), `y_cyano_3d` (3 días) |
| Variables de entrada | `s2_ndci_p90`, `s2_scum_frac` (calculadas por `model/features.py` del proyecto) |
| Umbrales de decisión | 0,04 (`y_cyano_0`), 0,02 (`y_cyano_1`), 0,04 (`y_cyano_3d`) |

## Arquitectura y entrenamiento

Cada uno de los tres modelos es un booster LightGBM independiente, es decir, un ensamblado de árboles de decisión entrenados secuencialmente por descenso de gradiente sobre una función de pérdida binaria. La entrada es un vector bidimensional y la salida, una probabilidad calibrada de forma implícita por el boosting. El ajuste se realiza con un protocolo de validación "hacia delante" (walk-forward): entrenamiento con las temporadas 2023, 2024 y 2025 y prueba sobre la temporada 2026, tal como se describe en el `train.py` del proyecto. Los tamaños finales son pequeños (28 árboles para el objetivo de hoy, 17 para mañana y 31 para tres días), coherente con un espacio de características de solo dos dimensiones y un número de positivos reducido.

La etiqueta de entrenamiento son las evaluaciones de agua del sanepid, en la práctica los cierres de zonas de baño por floración de cianobacterias. Se trata de una etiqueta escasa (590, 587 y 763 positivos sobre aproximadamente 41.000 filas de prueba para cada horizonte) y registrada "a posteriori": las floraciones que nadie inspeccionó no aparecen en los datos, lo que introduce un sesgo de etiquetado que el propio autor señala. El modelo no incorpora meteorología, Sentinel-3, deriva de masas de agua ni coordenadas del punto de baño; esa restricción es intencionada y define el alcance de la versión abierta. El ROC-AUC medio en validación cruzada reportado por el autor es 0,729 (`y_cyano_0`), 0,708 (`y_cyano_1`) y 0,679 (`y_cyano_3d`).

## Capacidades

- Clasificación binaria tabular: estima la probabilidad de episodio de cianobacterias para tres horizontes temporales (día 0, día 1, día 3).
- Inferencia con dos únicas variables derivadas de Sentinel-2 L2A, lo que permite recalcular las predicciones con imágenes nuevas sin reentrenar.
- Funcionamiento en CPU, sin GPU, con un coste de inferencia despreciable por fila.
- Integración directa con el ecosistema Python de LightGBM (`lgb.Booster.predict`) y con la API C/CLI de LightGBM.
- Gestión implícita de valores ausentes: cuando no hay imagen sin nubes en los últimos 10 días, las características quedan vacías y el modelo predice esencialmente "sin datos".
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni generación de texto: no es un modelo generativo.
- Capacidad multilingüe: no aplica; el metadato de idioma (`pl`) refleja el dominio de aplicación, no un uso lingüístico.

## Casos de uso

- **Vigilancia semanal de zonas de baño**: recalcular `s2_ndci_p90` y `s2_scum_frac` sobre el recorte de 2 × 2 km de cada punto de baño con la última imagen Sentinel-2 L2A sin nubes y generar una lista priorizada por probabilidad, para que el gestor decida dónde enviar inspección.
- **Sistema de alerta temprana a 3 días**: usar el modelo `y_cyano_3d` para anticipar cierres y activar protocolos de comunicación pública o de muestreo adicional antes de que se confirme el episodio.
- **Triaje de laboratorio**: dado que la etiqueta del sanepid es escasa, emplear la probabilidad del modelo como criterio de priorización de muestras físicas, aumentando la tasa de detección por inspección respecto a un muestreo aleatorio (el autor reporta que el 18 % del top 10 son positivos frente al 3 % del azar para `y_cyano_0`).
- **Referencia reproducible en investigación**: servir de línea base pública y ligera para comparar nuevas propuestas de índices espectrales o de modelos espacio-temporales en un problema con etiqueta rara y desbalanceo extremo (prevalencia en torno al 1,4 %).
- **Docencia y prototipado de pipelines geoespaciales**: ejemplo completo y de bajo coste de extracción de características desde Sentinel-2 (NDCI, FVI), entrenamiento walk-forward y evaluación con PR-AUC y métricas de ranking.
- **Auditoría de valor añadido de fuentes de datos**: cuantificar cuánto aporta cada fuente adicional comparando esta versión abierta con la cerrada (Sentinel-3, meteorología, deriva) y con la línea base histórica; los informes del autor muestran que el histórico de cierres supera al modelo abierto.
- **Exploración de cobertura geográfica**: aplicar el modelo a puntos de baño fuera de Polonia con la cautela de que la etiqueta y las prácticas de inspección provienen del sanepid, por lo que la calibración no es transferible sin revalidación.

## Benchmarks y rendimiento

Datos del informe de entrenamiento publicado por el autor. Todos los resultados corresponden a prueba sobre la temporada 2026. La fila "azar" es la referencia aleatoria y "historia" es la línea base que ordena los puntos de baño por número de cierres en años anteriores. Las columnas "top 10/20/50" indican el porcentaje de positivos dentro de ese número de predicciones mejor puntuadas.

Objetivo `y_cyano_0` (hoy): 41.901 filas de prueba, 590 positivos, 28 árboles, umbral 0,04, ROC-AUC en validación cruzada 0,729.

| Variante | ROC-AUC | PR-AUC | Precision | Sensibilidad | F1 | top 10 | top 20 | top 50 |
|---|---|---|---|---|---|---|---|---|
| Azar | 0,496 | 0,014 | – | – | – | 3 % | 6 % | 11 % |
| Historia | 0,881 | 0,294 | – | – | – | 35 % | 42 % | 60 % |
| Abierto: S2 | 0,820 | 0,094 | 0,077 | 0,425 | 0,130 | 18 % | 28 % | 44 % |
| v1: S2 (cerrado) | 0,905 | 0,335 | 0,335 | 0,436 | 0,378 | 43 % | 53 % | 67 % |
| v3: S2 + S3 + deriva (cerrado) | 0,905 | 0,340 | 0,426 | 0,412 | 0,419 | 43 % | 55 % | 68 % |

Objetivo `y_cyano_1` (mañana): 41.305 filas de prueba, 587 positivos, 17 árboles, umbral 0,02, ROC-AUC en validación cruzada 0,708.

| Variante | ROC-AUC | PR-AUC | Precision | Sensibilidad | F1 | top 10 | top 20 | top 50 |
|---|---|---|---|---|---|---|---|---|
| Azar | 0,501 | 0,015 | – | – | – | 3 % | 6 % | 12 % |
| Historia | 0,881 | 0,294 | – | – | – | 35 % | 42 % | 60 % |
| Abierto: S2 | 0,817 | 0,103 | 0,052 | 0,678 | 0,097 | 21 % | 27 % | 48 % |
| v1: S2 (cerrado) | 0,904 | 0,340 | 0,518 | 0,342 | 0,412 | 43 % | 54 % | 69 % |
| v3: S2 + S3 + deriva (cerrado) | 0,905 | 0,336 | 0,494 | 0,373 | 0,425 | 44 % | 56 % | 67 % |

Objetivo `y_cyano_3d` (3 días): 41.305 filas de prueba, 763 positivos, 31 árboles, umbral 0,04, ROC-AUC en validación cruzada 0,679.

| Variante | ROC-AUC | PR-AUC | Precision | Sensibilidad | F1 | top 10 | top 20 | top 50 |
|---|---|---|---|---|---|---|---|---|
| Azar | 0,507 | 0,019 | – | – | – | 3 % | 5 % | 11 % |
| Historia | 0,874 | 0,277 | – | – | – | 29 % | 38 % | 57 % |
| Abierto: S2 | 0,777 | 0,090 | 0,079 | 0,515 | 0,137 | 16 % | 23 % | 41 % |
| v1: S2 (cerrado) | 0,884 | 0,317 | 0,495 | 0,312 | 0,383 | 35 % | 46 % | 62 % |
| v3: S2 + S3 + deriva (cerrado) | 0,880 | 0,325 | 0,486 | 0,303 | 0,373 | 35 % | 46 % | 62 % |

Lectura de los datos: el modelo abierto mejora claramente al azar en ROC-AUC y en precisión del top-k, pero queda muy por debajo de la línea base histórica en PR-AUC (0,094 frente a 0,294 en el horizonte de hoy) y por debajo de las variantes cerradas. El autor no publica intervalos de confianza ni testes de significación.

## Requisitos de hardware

- VRAM estimada para inferencia: 0 GB. El modelo es un conjunto de árboles serializado en texto de pocos kilobytes y se ejecuta íntegramente en CPU.
- GPU recomendadas: no aplica; no se requiere GPU. Funciona en cualquier CPU x86-64 o ARM moderna.
- Cabe en cualquier equipo: portátil básico, contenedor de 256 MB de RAM, instancia serverless de mínima capacidad o incluso un dispositivo edge.
- Opciones de despliegue: biblioteca LightGBM (Python, API C, CLI), servicio HTTP propio con FastAPI o Flask, tareas programadas por lotes sobre catálogos de puntos de baño. No aplica soporte en vLLM, TGI, llama.cpp u Ollama, al no ser un modelo de lenguaje.
- Latencia y throughput: no disponibles como medición publicada; por la naturaleza del modelo (dos características, entre 17 y 31 árboles) la inferencia es del orden de microsegundos a decenas de microsegundos por fila en una sola CPU, y el cuello de botella real del sistema es la descarga y el preprocesado de la imagen Sentinel-2, no el modelo.
- Requisito operativo relevante: disponer de acceso a Sentinel-2 L2A y de la lógica de `model/features.py` para calcular las dos características; sin imagen sin nubes de los últimos 10 días el modelo no aporta señal.

## Comparativa con modelos similares

No se dispone de modelos abiertos comparables en la información proporcionada. La comparación más informativa es interna al proyecto del autor: la versión abierta frente a las versiones cerradas y frente a la línea base histórica.

| Modelo | Entradas | ROC-AUC (`y_cyano_0`) | PR-AUC (`y_cyano_0`) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Radar Sinic abierto (S2) | NDCI p90 + fracción de película | 0,820 | 0,094 | MIT | Pesos abiertos en HuggingFace |
| v1 (cerrado) | Sentinel-2 | 0,905 | 0,335 | No disponible | No pública |
| v3 (cerrado) | Sentinel-2 + Sentinel-3 + deriva | 0,905 | 0,340 | No disponible | No pública |
| Línea base "historia" | Cierres históricos por punto de baño | 0,881 | 0,294 | No aplica (regla) | Reproducible a partir de los datos del sanepid |

Conclusiones de la comparativa: añadir Sentinel-3 y deriva no mejora el ROC-AUC respecto a v1 (0,905 en ambos) y aporta una mejora marginal en PR-AUC (0,340 frente a 0,335). La línea base histórica, sin ningún dato satelital, supera al modelo abierto en todas las métricas de ranking, lo que sugiere que la identidad del punto de baño concentra gran parte de la señal explotable.

## Limitaciones y advertencias

- **Inferioridad declarada por el autor**: el modelo abierto es peor que el modelo completo (satélites, meteorología, posición) y que la línea base histórica de cierres. No debe presentarse como un sistema de alerta autónomo.
- **Dependencia de imagen sin nubes**: sin una imagen Sentinel-2 L2A despejada en los últimos 10 días, las dos características quedan vacías y el modelo solo "ve" ausencia de datos; la predicción deja de ser informativa.
- **Ausencia de temperatura del agua**: fuera de temporada puede generar falsos positivos, ya que la temperatura es un factor determinante del crecimiento de cianobacterias y no está en la entrada.
- **Etiqueta escasa y "post factum"**: los positivos son cierres administrativos del sanepid; las floraciones no inspeccionadas no están en los datos, lo que sesga el entrenamiento y la evaluación hacia zonas y fechas con vigilancia activa.
- **Desbalanceo extremo**: prevalencia en torno al 1,4 % en prueba; la precisión del modelo abierto con umbral ajustado es baja (0,077 en `y_cyano_0`) y el F1 se sitúa en 0,13. Un uso operativo exige calibrar el umbral según el coste relativo de falsos positivos y falsos negativos.
- **Ámbito geográfico y administrativo**: entrenado con puntos de baño y criterios de inspección de Polonia; la transferencia a otras regiones requiere revalidación, ya que tanto la práctica de muestreo como la definición de cierre difieren.
- **Sin datos de calibración probabilística publicados**: el autor reporta ROC-AUC, PR-AUC y métricas de ranking, pero no curvas de fiabilidad ni Brier score; las probabilidades deben tratarse con cautela.
- **Sin intervalos de confianza ni tests de significación**: las diferencias entre variantes se presentan como puntos únicos sobre un solo año de prueba.
- **Licencia MIT**: permite uso comercial y modificación sin restricciones, pero no exime de las obligaciones de exactitud y de las normativas sanitarias aplicables.
- **No sustituye a las comunicaciones oficiales del sanepid**: el propio autor lo indica de forma explícita; cualquier uso público debe acompañarse de la advertencia correspondiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lustachowicz/radar-sinic-open
- No se han encontrado en la información proporcionada enlaces adicionales (paper, blog, repositorio del proyecto o demo).
