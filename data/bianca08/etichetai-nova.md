# Bianca08/etichetai-nova

## Resumen

EtichetAI Nova es un modelo de clasificación de texto en rumano desarrollado por el usuario Bianca08 y publicado en HuggingFace bajo licencia MIT. Su propósito es determinar el grado de procesamiento de alimentos según la clasificación NOVA, un sistema internacional que agrupa los alimentos en cuatro categorías en función de su nivel de procesamiento industrial (desde alimentos sin procesar hasta productos ultraprocesados).

A diferencia de los grandes modelos de lenguaje, no se trata de una red neuronal de tipo transformer, sino de un pipeline clásico de aprendizaje automático supervisado: vectorización TF-IDF a nivel de carácter con n-gramas de 2 a 5, seguida de una regresión logística implementada con scikit-learn 1.6.1. El autor reporta una precisión del 0,894 sobre el conjunto de test.

El modelo es relevante en el nicho de etiquetado nutricional automatizado en rumano, donde los recursos lingüísticos específicos son escasos. Su tamaño reducido y su naturaleza determinista lo hacen adecuado para integración ligera en aplicaciones de análisis de etiquetas o bases de datos de productos alimentarios, aunque su alcance es muy específico y no cubre tareas generativas ni multilingües.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF a nivel de carácter (n-gramas 2–5) + regresión logística |
| Parametros totales | no disponible (modelo lineal; el número de coeficientes depende del vocabulario de n-gramas) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no es un modelo de contexto; procesa cadenas de texto completas como vector de n-gramas) |
| Tipos de cuantizacion | no aplica (modelo lineal, no se cuantiza) |
| Idiomas soportados | rumano (ro) |
| Licencia | MIT |
| Formato de pesos | joblib (serialización de scikit-learn); el repo se distribuye con librería sklearn |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clásico de procesamiento de lenguaje natural: extracción de características mediante TF-IDF sobre n-gramas de caracteres de longitud 2 a 5 y clasificación con regresión logística. La elección de n-gramas de carácter (en lugar de palabra) suele aportar robustez frente a variaciones morfológicas y errores ortográficos, algo relevante en rumano por su riqueza flexiva y por la presencia de diacríticos que a menudo se omiten en etiquetas de productos.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus, el número de clases exactas ni si se aplicaron técnicas de validación cruzada o ajuste de hiperparámetros más allá de lo indicado en la model card. El autor reporta una precisión de 0,894 en test, pero no se detalla el tamaño ni la distribución de dicho conjunto de evaluación. Tampoco se documenta ningún proceso de RLHF, DPO ni ajuste fino adicional, dado que no es un modelo generativo.

## Capacidades

- Clasificación de texto en rumano orientada a determinar el grado de procesamiento NOVA de un alimento.
- Procesamiento de cadenas de texto cortas o medias típicas de etiquetas, descripciones o nombres de productos alimentarios.
- Robusteza parcial ante variaciones ortográficas y morfológicas gracias al uso de n-gramas de carácter.
- Inferencia determinista y de bajo coste computacional (modelo lineal, sin GPU).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No es multilingüe: está entrenado y orientado exclusivamente al rumano.
- No dispone de modo de razonamiento (thinking), visión, audio ni generación de texto libre.

## Casos de uso

- Etiquetado automático de bases de datos de productos alimentarios: dado el nombre o la descripción de un producto en rumano, el modelo asigna una categoría NOVA, lo que permite enriquecer catálogos de supermercados o bases de datos nutricionales de forma masiva y a bajo coste.
- Análisis de etiquetas en aplicaciones de nutrición: una app móvil puede enviar el texto de la etiqueta a un servicio que ejecute este modelo para advertir al usuario sobre el grado de ultraprocesamiento del producto.
- Filtrado y clasificación de reseñas o descripciones de alimentos en rumano: útil en plataformas de comercio electrónico que necesitan categorizar productos por nivel de procesamiento.
- Investigación en salud pública y nutrición: permite procesar corpus de encuestas dietéticas o registros de consumo en rumano y clasificar automáticamente los alimentos según NOVA para estudios epidemiológicos.
- Moderación y control de calidad en catálogos: detección de productos mal etiquetados o inconsistentes comparando la categoría NOVA declarada con la predicha por el modelo.
- Prototipado rápido y pruebas de concepto: al ser un modelo scikit-learn serializado con joblib, se puede desplegar en un endpoint ligero (por ejemplo, FastAPI) sin infraestructura GPU, lo que facilita validar la viabilidad de un producto antes de invertir en modelos mayores.
- Enriquecimiento de pipelines de datos en ciencia de datos: integración como paso de transformación dentro de flujos de preprocesamiento de datos tabulares o de texto en rumano.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto |
|---|---|---|
| Precisión (accuracy) | 0,894 | Test (tamaño no especificado) |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible, ni comparaciones con modelos alternativos.

## Requisitos de hardware

- Inferencia en CPU: suficiente para este modelo, al ser una regresión logística sobre vectores TF-IDF dispersos.
- VRAM estimada: no requiere GPU; 0 GB de VRAM.
- GPU recomendadas: no aplica; cualquier CPU moderna es suficiente.
- Cabe en cualquier GPU consumer, aunque no es necesario utilizarla.
- Opciones de despliegue: serialización con joblib y servicio mediante scikit-learn en Python; integrable en FastAPI, Flask, Ray Serve o como paso dentro de pipelines de datos (Apache Beam, Spark con UDFs de Python).
- Latencia y throughput: no disponibles en la información proporcionada; en la práctica, para un modelo lineal de este tipo se espera un throughput alto y latencias de milisegundos por muestra en CPU, aunque no se aportan cifras oficiales.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un modelo de nicho (clasificación NOVA en rumano) sin alternativas identificadas en la información disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| EtichetAI Nova | no disponible (lineal) | no aplica | accuracy 0,894 en test | MIT | HuggingFace |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos potenciales derivados del corpus de entrenamiento no documentado: si los datos provienen de una fuente concreta (por ejemplo, un único supermercado o una región), el modelo puede generalizar mal a otros contextos.
- Riesgo de error en productos ambiguos o con descripciones muy cortas, donde la información textual es insuficiente para determinar el grado NOVA.
- La precisión reportada (0,894) no especifica el tamaño del conjunto de test ni la distribución de clases, por lo que no se puede evaluar su significancia estadística ni el rendimiento por clase.
- Limitación idiomática estricta: solo rumano; no debe usarse con textos en otros idiomas.
- No es un modelo generativo: no puede explicar sus decisiones ni generar justificaciones; únicamente emite una etiqueta.
- Licencia MIT: permite uso comercial y modificación, pero se recomienda verificar la procedencia de los datos de entrenamiento, no documentada.
- El repo tiene 0 descargas y 0 likes, y fue creado en 2026; no hay evidencia de mantenimiento, validación externa ni comunidad que lo respalde.
- Para producción en dominios regulados (salud, etiquetado alimentario oficial), se recomienda validación independiente y revisión humana, dado que la clasificación NOVA tiene implicaciones sanitarias.

## Enlaces

- HuggingFace: https://huggingface.co/Bianca08/etichetai-nova
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la información disponible.
