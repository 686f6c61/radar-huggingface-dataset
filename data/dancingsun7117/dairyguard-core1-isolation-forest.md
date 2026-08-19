# dancingsun7117/dairyguard-core1-isolation-forest

## Resumen

DairyGuard Core 1 es un modelo de detección de anomalías basado en Isolation Forest, desarrollado por el equipo MoneyFollows.py como parte del sistema DairyGuard, un sistema de detección de fraude para la compra de leche en Maharashtra (India), construido para el Smart India Hackathon 2026. El modelo aborda un problema concreto: identificar transacciones fraudulentas en la adquisición de leche, como picos de volumen, dilución de grasa, desviaciones de la línea base histórica y anomalías de temperatura.

A diferencia de los modelos de lenguaje, se trata de un modelo clásico de aprendizaje automático no supervisado que opera sobre cuatro características numéricas normalizadas por especie animal (vaca, búfalo, cabra): volumen, porcentaje de grasa, pH y temperatura. La normalización por especie es clave porque los valores de grasa y rendimiento difieren sustancialmente entre especies (por ejemplo, la grasa de la leche de búfalo es del 6-7 % frente al 3,5 % de la vaca), y sin ella la variación natural enmascararía la señal de fraude.

El modelo se entrenó con datos sintéticos (~15.340 filas) calibrados contra fuentes reales del gobierno indio, ya que no existe un conjunto de datos público de transacciones de compra de leche a nivel de agricultor. Está diseñado como herramienta de diagnóstico y soporte para revisión humana, no para rechazo automático de transacciones, y se integra como uno de los tres componentes del motor de integridad de compras DairyGuard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Isolation Forest (ensemble de 200 árboles de aislamiento) |
| Parametros totales | No disponible (modelo clásico de scikit-learn, no neuronal) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo tabular, no lingüístico) |
| Tipos de cuantizacion | No aplica (modelo clásico, no requiere cuantizacion) |
| Idiomas soportados | No disponible (modelo tabular, sin capacidades lingüísticas) |
| Licencia | MIT |
| Formato de pesos | joblib |

## Arquitectura y entrenamiento

El modelo implementa el algoritmo Isolation Forest de scikit-learn, una técnica no supervisada que aísla las anomalías mediante la partición aleatoria recursiva del espacio de características. Con 200 estimadores y un valor de contaminación de 0,0127, calibrado según la tasa real de fraude numéricamente detectable en el conjunto de entrenamiento (no un valor por defecto arbitrario), el modelo opera sobre cuatro características normalizadas como puntuaciones z dentro de cada grupo de especie animal: volumen en litros, porcentaje de grasa, pH y temperatura.

El entrenamiento se realizó sobre un conjunto de datos sintético de ~15.340 transacciones, generado a partir de fuentes reales: volúmenes mensuales de compra del Departamento de Desarrollo Lácteo de Maharashtra (plataforma data.gov.in), datos del 18.º Censo Ganadero de Maharashtra para la distribución de especies por distrito, y rangos veterinarios estándar de grasa, pH y rendimiento por especie, basados en las estadísticas básicas de ganadería 2022 del Ministerio de Pesca, Ganadería y Lechería del Gobierno de India.

La elección de un enfoque no supervisado es deliberada: las cooperativas lácteas reales no disponen de grandes volúmenes de fraude confirmado y etiquetado para entrenar modelos supervisados, por lo que Isolation Forest permite un despliegue en frío sin necesidad de etiquetas. El autor señala que un clasificador supervisado alcanzó ~92 % de precisión y 78 % de recall en validación cruzada sobre los datos sintéticos, pero se descartó porque esos resultados reflejan los patrones de inyección sintética del propio autor y no generalizarían a tácticas de fraude reales no vistas.

## Capacidades

- Detección de anomalías multivariantes en transacciones de compra de leche: picos de volumen, dilución de grasa, desviaciones de la línea base histórica y anomalías de temperatura.
- Normalización por especie animal (vaca, búfalo, cabra) mediante puntuaciones z, lo que evita que la variación natural entre especies enmascare las señales de fraude.
- Inferencia rápida sobre datos tabulares con solo cuatro características numéricas.
- Puntuación de anomalía mediante la función decision_function, donde valores más bajos indican mayor anomalía.
- Clasificación binaria: -1 para anomalía, 1 para normal.
- No requiere etiquetas de fraude para el entrenamiento, lo que lo hace adecuado para escenarios de arranque en frío.
- No tiene capacidades lingüísticas, de visión ni de generación de texto: es exclusivamente un clasificador tabular.
- No detecta recibos duplicados ni errores de OCR/entrada manual: esos casos están fuera de su alcance por diseño y se gestionan con componentes separados (reglas y coincidencia semántica).

## Casos de uso

- Revisión de transacciones de compra de leche en cooperativas: el modelo puntúa cada transacción como normal o anómala, y las marcadas como anomalía se envían a revisión humana por parte del personal de aprovisionamiento. Es adecuado porque no requiere etiquetas históricas de fraude y opera con datos numéricos disponibles en cualquier sistema de registro.
- Detección de dilución de grasa en la leche: las desviaciones negativas en el porcentaje de grasa normalizado por especie pueden indicar adulteración con agua u otras sustancias. El modelo identifica estas desviaciones como anomalías y las señala para inspección.
- Monitorización de la cadena de frío: las anomalías de temperatura detectadas por el modelo pueden señalar fallos en el transporte o almacenamiento de la leche, permitiendo intervenciones correctivas antes de que la calidad se deteriore.
- Validación de datos en sistemas de registro agrícola: el modelo puede integrarse en pipelines de ingesta de datos para detectar errores de captura o entradas inconsistentes en los sistemas de gestión de compras.
- Auditoría de aprovisionamiento: los responsables de auditoría pueden usar las puntuaciones de anomalía para priorizar qué transacciones revisar manualmente, reduciendo el tiempo de inspección y centrando los recursos en los casos más sospechosos.
- Detección de colusión entre proveedores: aunque el modelo en sí no detecta redes de colusión, sus puntuaciones de anomalía pueden combinarse con análisis de red (NetworkX) y reconciliación de balance de masas para identificar patrones de comportamiento coordinado entre agricultores.
- Despliegue como componente de un sistema multi-capa: junto con la detección de duplicados basada en reglas, la coincidencia semántica de OCR y la reconciliación de balance de masas, el modelo actúa como una señal más en un sistema integral de integridad de compras, no como un mecanismo de decisión autónomo.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados, evaluados únicamente contra tipos de fraude numéricamente detectables (picos de volumen, dilución de calidad, desviación de la línea base y anomalías de temperatura). Los duplicados y errores de OCR se excluyen de la evaluación porque no alteran ninguna de las cuatro características de entrada y son gestionados por otras capas de detección.

| Punto de operación | Precision (fraude) | Recall (fraude) |
|---|---|---|
| Estricto/final (top 0,8 % más anómalo, re-puntuado tras inyectar todo el fraude) | 0,73 | 0,39 |
| Default anterior (contamination=0,0127, antes de añadir fraude por desajuste de capacidad) | 0,33 | 0,33 |

Soporte del conjunto final: 15.110 filas normales y 230 filas de fraude. El autor también menciona que un clasificador supervisado evaluado con validación cruzada de 5 pliegues alcanzó ~92 % de precisión y 78 % de recall sobre los mismos datos sintéticos, pero se descartó deliberadamente por su falta de generalización a fraude real no visto.

## Requisitos de hardware

- Inferencia en CPU: el modelo es extremadamente ligero (200 árboles de aislamiento sobre 4 características), por lo que no requiere GPU.
- RAM estimada: inferior a 100 MB para el modelo cargado en memoria.
- GPU: no requerida. Cualquier servidor básico o incluso un dispositivo embebido puede ejecutar la inferencia.
- Opciones de despliegue: integración directa en Python mediante joblib.load(), o exportación a ONNX para despliegue multiplataforma.
- Latencia: del orden de microsegundos por predicción en CPU moderna, dado el pequeño tamaño del modelo.
- Throughput: miles de predicciones por segundo en hardware estándar.

## Comparativa con modelos similares

| Modelo | Tipo | Precision | Recall | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DairyGuard Core 1 (Isolation Forest) | No supervisado | 0,73 | 0,39 | MIT | HuggingFace |
| Clasificador supervisado (benchmark interno del autor) | Supervisado | ~0,92 | ~0,78 | No especificada | No publicado |
| Isolation Forest con contaminación por defecto | No supervisado | 0,33 | 0,33 | MIT (scikit-learn) | scikit-learn |

La comparativa muestra la diferencia clave entre enfoques: el modelo supervisado obtiene mejores métricas sobre datos sintéticos, pero no es viable en producción real por la ausencia de datos etiquetados de fraude confirmado. El Isolation Forest calibrado con contaminación ajustada (0,0127) mejora sustancialmente sobre los valores por defecto de scikit-learn, aunque mantiene un recall limitado que refleja la dificultad intrínseca de separar fraude de la variación natural entre agricultores.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos: el despliegue en producción requiere recalibración sobre registros reales de compra.
- No detecta duplicados de recibos ni errores de OCR/entrada manual: estos casos están fuera del alcance del modelo por diseño y requieren componentes separados.
- La tasa de contaminación (0,0127) está ajustada a la tasa de inyección de fraude del conjunto sintético; debe reajustarse para datos de producción.
- Herramienta de diagnóstico únicamente: las predicciones requieren revisión humana, no acción automatizada ni rechazo automático de transacciones.
- Recall limitado (0,39 en el punto de operación estricto): la detección de anomalías sutiles imitadas por humanos es intrínsecamente difícil y el modelo puede no capturar todos los casos de fraude.
- Sin capacidades lingüísticas ni de texto: no puede procesar recibos, documentos ni conversaciones.
- No hay datos de rendimiento en entornos reales: las métricas reportadas provienen exclusivamente de la evaluación sobre datos sintéticos.
- El autor advierte explícitamente que el modelo es una señal entre varias en producción, no un mecanismo de decisión independiente.

## Enlaces

- HuggingFace: https://huggingface.co/dancingsun7117/dairyguard-core1-isolation-forest
- GitHub del autor: https://github.com/dancingsun7117/studio
- Documentación de IsolationForest de scikit-learn: https://scikit-learn.org/stable/modules/generated/sklearn.ensemble.IsolationForest.html
