# SamaGalagoda/threadcraft-measurement-predictor

## Resumen

ThreadCraft Measurement Predictor & Validator es un modelo de regresión tabular desarrollado por SamaGalagoda como parte de un proyecto final de grado en Ingeniería de Software para la plataforma ThreadCraft, un sistema de diseño y pedido de ropa a medida basado en IA. El modelo resuelve un problema concreto: los errores de medición auto-reportados por los clientes al introducir sus medidas corporales. En lugar de exigir al usuario que rellene todas las medidas, el modelo predice el conjunto completo de medidas de vestimenta a partir de un subconjunto parcial (por ejemplo, altura, peso, edad y sexo) y además valida las medidas introducidas, detectando valores que contradicen el resto del perfil (posibles erratas o confusiones de unidades).

El modelo se basa en la librería sklearn y se entrena con datos antropométricos del dataset ANSUR II (US Army, 2012), utilizando una estrategia de entrenamiento con máscaras aleatorias para manejar entradas parciales. No se trata de un modelo de lenguaje ni de visión: es un predictor numérico que genera 13 medidas de vestimenta (pecho, cintura, cadera, etc.) y un validador de consistencia. Su relevancia actual radica en su aplicación directa en comercio electrónico de moda, donde la precisión de las medidas es crítica para reducir devoluciones y mejorar la experiencia de compra. El repositorio tiene un tamaño de 0.0 GB (el modelo se distribuye como artefacto joblib) y no se han publicado detalles sobre la arquitectura interna más allá de su naturaleza tabular.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de regresión tabular basado en sklearn) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (modelo clásico de ML, no requiere cuantización) |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | us-government-public-domain |
| Formato de pesos | joblib |

## Arquitectura y entrenamiento

El modelo está implementado con la librería sklearn, pero la model card no especifica el algoritmo concreto (podría ser un ensemble de árboles, gradient boosting o una regresión regularizada). La innovación principal reside en el diseño de entrenamiento: cada regresor (uno por cada una de las 13 medidas objetivo) se entrena sobre copias de los datos con máscaras aleatorias, simulando la situación real en la que el cliente proporciona un subconjunto arbitrario de medidas. Este enfoque evita el desajuste entre entrenamiento y servicio (train/serve mismatch) y se comparó con una alternativa más simple que usaba solo características base (altura, peso, edad, sexo); el enmascarado ganó en los 13 objetivos incluso en el escenario más difícil. Los datos de entrenamiento provienen del dataset ANSUR II, compuesto por personal militar estadounidense (2012), con un total de 607 muestras en el conjunto de prueba retenido. No se mencionan técnicas de RLHF, DPO ni ajuste fino adicional.

## Capacidades

- Predicción de 13 medidas de vestimenta: ankle, calf, chest, collar, cuff, hip, inseam, outseam, shoulder, sleeve, thigh, total_length y waist.
- Manejo de entradas parciales: funciona con cualquier combinación de medidas disponibles, desde solo altura/peso/edad/sexo hasta un conjunto casi completo.
- Validación de consistencia: detecta valores que se desvían significativamente del perfil del usuario, con una tasa de falsos positivos del 2.2% (umbral al percentil 99) y una tasa de captura del 98.6% de valores corruptos (errores del 20%).
- Pre-relleno de formularios: puede sugerir valores editables en el paso 4 del asistente de diseño de ThreadCraft, reduciendo la carga de entrada manual.
- Detección de errores de unidades: al comparar las medidas introducidas con las predicciones, puede señalar confusiones entre centímetros y pulgadas.
- No soporta generación de texto, tool calling, agentes, visión ni audio (es un modelo puramente tabular).

## Casos de uso

- Pre-relleno de formularios en tiendas de ropa a medida: el modelo genera sugerencias automáticas para las medidas que el cliente no ha introducido, basándose en altura, peso, edad y sexo. Esto acelera el proceso de pedido y reduce la fricción en el asistente de diseño.
- Validación de medidas en tiempo real: cuando un usuario introduce una medida (por ejemplo, cintura de 120 cm con una altura de 170 cm), el modelo la compara con la predicción derivada del resto del perfil y alerta de posibles erratas o errores de unidades antes de confirmar el pedido.
- Detección de errores de unidades en plataformas de comercio electrónico: un cliente que confunde centímetros con pulgadas (p. ej., escribe 34 en lugar de 86 cm) recibirá una advertencia porque el valor queda fuera del rango esperado según las demás medidas.
- Asistencia en tallaje personalizado para catálogos digitales: el modelo puede estimar medidas completas a partir de datos parciales recogidos en encuestas, permitiendo recomendar tallas o ajustes sin exigir al usuario que mida todo su cuerpo.
- Integración en flujos de diseño de moda: los diseñadores pueden usar las predicciones para generar patrones base a partir de medidas parciales de clientes, agilizando la creación de prototipos personalizados.
- Control de calidad en bases de datos antropométricas: el validador puede usarse para limpiar conjuntos de datos de medidas, identificando registros inconsistentes antes de alimentar otros sistemas.

## Benchmarks y rendimiento

La model card reporta resultados sobre un conjunto de prueba retenido (n=607) en tres escenarios según la cantidad de medidas proporcionadas. No se incluyen comparaciones con otros modelos similares.

| Escenario | R² medio | MAE medio (cm) |
|---|---|---|
| A: solo altura + peso | 0.818 | 1.625 |
| B: + pecho y cintura | 0.820 | 1.325 |
| C: + pecho, cintura, cadera y hombro | 0.828 | 1.205 |

R² por campo en el escenario A (altura/peso/edad/sexo):

| Campo | R² |
|---|---|
| total_length | 0.983 |
| outseam | 0.897 |
| chest | 0.879 |
| hip | 0.872 |
| collar | 0.870 |
| waist | 0.859 |
| sleeve | 0.841 |
| thigh | 0.840 |
| inseam | 0.813 |
| cuff | 0.790 |
| shoulder | 0.759 |
| calf | 0.677 |
| ankle | 0.558 |

MAE por campo en el escenario A (cm):

| Campo | MAE (cm) |
|---|---|
| cuff | 0.46 |
| ankle | 0.78 |
| total_length | 0.92 |
| collar | 1.10 |
| shoulder | 1.15 |
| calf | 1.30 |
| outseam | 1.65 |
| thigh | 1.79 |
| sleeve | 1.84 |
| inseam | 1.91 |
| hip | 2.16 |
| chest | 2.73 |
| waist | 3.33 |

Para el validador, con un umbral al percentil 99 de los residuales, se obtiene una tasa de falsos positivos del 2.2% y una captura del 98.6% de valores corruptos.

## Requisitos de hardware

- El modelo es un artefacto joblib de sklearn, extremadamente ligero: no requiere GPU ni VRAM. Puede ejecutarse en cualquier CPU moderna.
- Inferencia en milisegundos (típico de modelos tabulares clásicos); sin datos de latencia específicos publicados.
- Despliegue sencillo: se puede cargar con `joblib.load()` en un servicio web (Flask, FastAPI) o integrarse en un pipeline de datos.
- No es compatible con vLLM, llama.cpp u Ollama (no es un modelo de lenguaje). Para producción, se recomienda un contenedor Docker con la dependencia de sklearn y un endpoint REST.
- El consumo de memoria es mínimo (inferior a 100 MB en la mayoría de casos, aunque no se especifica el tamaño exacto del artefacto).

## Comparativa con modelos similares

No se dispone de comparaciones con otros modelos de regresión tabular para antropometría en la información proporcionada. El autor no publica benchmarks frente a alternativas como regresión lineal, random forest o XGBoost. Por tanto, no se puede establecer una comparativa objetiva en este momento.

## Limitaciones y advertencias

- Sesgo de población: los datos de entrenamiento provienen de personal militar estadounidense (ANSUR II, 2012), que son más jóvenes, atléticos y con menor variabilidad de IMC que la población civil general. Las predicciones serán sistemáticamente inexactas para personas mayores, sedentarias o con IMC alto, y los extremos de la distribución civil están subrepresentados.
- Diferencias entre poblaciones: la plataforma ThreadCraft apunta al mercado de Sri Lanka, pero el modelo se entrenó con datos de EE. UU. Las proporciones corporales varían entre poblaciones, por lo que los valores predichos deben tratarse como un punto de partida que el cliente edita, nunca como un sustituto de la medición real.
- Sexo binario: el modelo modela el sexo como la variable binaria registrada en ANSUR II, lo que excluye a personas no binarias o transgénero. No debe presentarse como un sistema que cubre a todos los clientes.
- Riesgo de predicciones inexactas en casos extremos: para individuos con medidas fuera del rango típico del dataset, el modelo puede producir valores poco fiables. El validador ayuda a detectar inconsistencias, pero no garantiza precisión.
- Licencia: aunque la etiqueta indica "us-government-public-domain", la licencia real se declara como "other" con nombre "us-government-public-domain". Conviene verificar los términos exactos antes de un uso comercial, especialmente si se redistribuye el modelo.
- No es un modelo de lenguaje: no puede generar texto, razonar ni interactuar con herramientas. Su uso se limita a tareas de regresión numérica y validación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SamaGalagoda/threadcraft-measurement-predictor
- Repositorio de ThreadCraft: https://github.com/Samandee-Galagoda/threadcraft
- Dataset utilizado: https://huggingface.co/datasets/SamaGalagoda/threadcraft-measurements-cleaned
