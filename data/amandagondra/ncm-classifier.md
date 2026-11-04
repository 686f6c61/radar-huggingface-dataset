# AmandaGondra/ncm-classifier

## Resumen

`AmandaGondra/ncm-classifier` es un clasificador de texto supervisado, desarrollado por Amanda Gondra y publicado en noviembre de 2026, que sugiere las tres posiciones NCM (Nomenclatura Común del Mercosur, a 4 dígitos) más probables para descripciones comerciales de productos agropecuarios en portugués. No es un modelo de lenguaje neuronal: es un pipeline clásico de scikit-learn que combina vectorización TF-IDF (palabras de 1 a 2 gramos y caracteres de 3 a 5 gramos) con una regresión logística de clases balanceadas, calibración por temperatura y una regla legal explícita sobre la posición 31.05.

El problema que aborda es concreto: quien vende al productor rural debe consignar la NCM en la factura, pero las descripciones comerciales rara vez emplean la terminología de la tabla oficial. El modelo devuelve el top-3 de posiciones junto con una confianza calibrada y deriva a revisión manual las predicciones por debajo de un umbral de 0,6525, lo que lo convierte en una herramienta de triaje y no en un sistema de decisión fiscal automática.

Su relevancia es doble: por un lado, cubre 37 posiciones del agronegocio brasileño con métricas de test publicadas e intervalos de confianza por bootstrap; por otro, es un ejemplo didáctico de ingeniería de ML rigurosa (tests congelados, control de casi-duplicados, calibración fuera de fold) en un dominio regulado donde la trazabilidad importa tanto como la precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF (palabras 1-2 gramos y caracteres 3-5 gramos) + regresión logística con clases balanceadas, calibración por temperatura y regla legal 31.05 |
| Parametros totales | no disponible (modelo lineal; el número de coeficientes depende del vocabulario TF-IDF, no publicado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica; entrada de texto corta, descripción comercial) |
| Tipos de cuantizacion | no aplica (modelo lineal serializado en skops) |
| Idiomas soportados | portugués (pt) |
| Licencia | MIT |
| Formato de pesos | `model.skops` (formato skops, sin pickle) |

## Arquitectura y entrenamiento

El modelo es un pipeline de scikit-learn 1.9.1 entrenado desde cero, sin modelo preentrenado. La representación del texto se obtiene mediante dos extractores TF-IDF en paralelo (n-gramas de palabra de 1 a 2 y n-gramas de carácter de 3 a 5) sobre un texto previamente normalizado: minúsculas, eliminación de acentos, estandarización de fórmulas NPK, unidades y abreviaturas. Sobre esa representación se ajusta una regresión logística con ponderación de clases, cuyo hiperparámetro C = 3.0 se seleccionó mediante validación cruzada estratificada en 5 folds sobre el conjunto de entrenamiento (macro F1 medio de 0,8638).

El conjunto de entrenamiento consta de 900 filas: 241 descripciones de marketplace, 359 de la tabla NCM oficial, 1 de referencia pública y 299 sintéticas generadas con un LLM y revisadas manualmente. La rotulación es manual y anota la regla legal aplicable en cada fila. Se eliminaron casi-duplicados respecto a los tests mediante Jaccard de 5-gramas de caracteres con umbral ≥ 0,8, y ninguna fuente de entrenamiento coincide con una fuente de test. La calibración por temperatura (`softmax(log p / T)`, T = 0,4012) y el umbral de revisión se ajustaron sobre probabilidades out-of-fold. Como innovación destacable, se incorpora una regla determinista derivada del texto legal: las mercancías del capítulo 31 en envases de hasta 10 kg se reasignan a la posición 31.05.

## Capacidades

- Clasificación de texto multietiqueta a nivel de posición NCM (4 dígitos): devuelve las tres posiciones más probables para una descripción comercial.
- Confianza calibrada por temperatura para la primera sugerencia, con ECE reducido de 0,45 a 0,06-0,08.
- Triaje automático: marca para revisión manual las predicciones con confianza inferior a 0,6525.
- Normalización de dominio específica para el agronegocio: fórmulas NPK, unidades de peso y volumen, abreviaturas comerciales.
- Aplicación de una regla legal codificada (posición 31.05 para envases de hasta 10 kg del capítulo 31).
- Cobertura de 37 posiciones en siete grupos: animales y productos de origen animal, semillas y granos, rações y suplementos, abonos, defensivos agrícolas, herramientas y cercas, y máquinas e implementos agrícolas.
- No soporta tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Multilingüismo limitado al portugués; no se ha evaluado en otros idiomas.

## Casos de uso

- Sugerencia de NCM en pantallas de alta de producto: el modelo se integra en el formulario de registro de una tienda o cooperativa y muestra el top-3 con la confianza de la primera opción, de modo que el operador elige o corrige sin consultar la tabla oficial.
- Triaje previo a revisión fiscal: las descripciones con confianza inferior a 0,6525 se enrutan automáticamente a un especialista, reduciendo la carga de revisión manual a entre el 11 % y el 14 % de los casos en los tests publicados.
- Enriquecimiento de catálogos de marketplace agropecuario: clasificación por lotes de descripciones de anuncios para poblar el campo NCM de fichas de producto existentes.
- Validación de consistencia en sistemas de facturación: comparación entre la NCM declarada por el proveedor y la sugerida por el modelo para detectar discrepancias antes de la emisión.
- Formación y soporte a equipos comerciales: herramienta de consulta interna que explica, mediante el top-3, por qué una descripción encaja en una posición determinada.
- Ejemplo de ingeniería de ML en dominios regulados: referencia reproducible (tests congelados con checksum, particiones documentadas, calibración out-of-fold) para proyectos de clasificación fiscal o de cumplimiento normativo.
- Preclasificación en pipelines ETL de datos maestros de producto: primera pasada automática sobre descripciones heredadas antes de una migración de ERP.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre dos tests congelados escritos a mano antes del entrenamiento (intervalos bootstrap al 95 %, 1000 remuestreos, semilla 0), con calibración y regla 31.05 aplicadas:

| Métrica | test_v1 (146 filas) | test_v2 (74 filas) |
|---|---|---|
| top-1 | 0,9452 [0,9041-0,9795] | 0,9459 [0,8919-0,9865] |
| top-3 | 0,9932 [0,9795-1,0000] | 1,0000 [1,0000-1,0000] |
| macro F1 | 0,9447 [0,8942-0,9782] | 0,9198 [0,8621-0,9867] |
| macro precisión | 0,9588 [0,9032-0,9858] | 0,9219 [0,8533-0,9929] |
| macro recall | 0,9488 [0,9122-0,9804] | 0,9271 [0,8822-0,9881] |
| ECE bruto → calibrado | 0,4502 → 0,0753 | 0,4554 → 0,0624 |
| Enviado a revisión | 0,1096 [0,0616-0,1644] | 0,1351 [0,0676-0,2162] |
| top-1 de los aceptados | 0,9846 [0,9615-1,0000] | 1,0000 [1,0000-1,0000] |

Validación cruzada en entrenamiento: macro F1 medio de 0,8638 con C = 3.0. Out-of-fold: 0,1489 [0,1267-0,1722] derivado a revisión y 0,9504 [0,9347-0,9648] de top-1 en los aceptados. Las métricas macro promedian sobre las posiciones presentes en cada test; el ECE se calcula sobre la confianza del top-1 en 10 intervalos. No se han publicado comparaciones con otros modelos en la información disponible.

## Requisitos de hardware

- Inferencia en CPU: el modelo es una regresión logística sobre TF-IDF y se ejecuta en CPU sin GPU; el coste dominante es la vectorización del texto.
- VRAM estimada: 0 GB (no requiere GPU).
- GPU recomendadas: no aplica; cualquier GPU sería infrautilizada.
- Cabe en cualquier equipo consumer, incluidos portátiles de gama baja y contenedores con poca memoria.
- Despliegue: carga directa con `skops` y `scikit-learn` en Python; integrable en servicios FastAPI, Flask o funciones serverless; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos neuronales.
- Latencia y throughput: no publicados; por la naturaleza del modelo (TF-IDF disperso y producto matriz-vector) se espera latencia de milisegundos por petición en CPU, aunque no hay cifras oficiales.

## Comparativa con modelos similares

No se han publicado comparaciones con modelos alternativos en la información disponible. Como referencias conceptuales de la misma categoría (clasificación de texto en portugués con scikit-learn), podrían citarse clasificadores TF-IDF + regresión logística genéricos o modelos neuronales multilingües tipo BERTimbau, pero no se dispone de datos comparativos de rendimiento, contexto ni licencia para establecer una tabla rigurosa.

| Criterio | ncm-classifier | Alternativas |
|---|---|---|
| Parámetros | no disponible (lineal) | no disponible |
| Contexto | no aplica | no disponible |
| Rendimiento | top-1 0,945-0,946 en tests propios | no disponible |
| Licencia | MIT | no disponible |
| Disponibilidad | HuggingFace + GitHub | no disponible |

## Limitaciones y advertencias

- El propio autor advierte que el modelo ofrece sugerencias, no decisiones fiscales; la responsabilidad de la clasificación recae en quien emite la factura.
- No debe usarse para decidir la NCM sin revisión humana.
- Cobertura limitada a 37 posiciones del agronegocio; los productos fuera de ese conjunto no están soportados.
- Clasifica únicamente a nivel de posición (4 dígitos), no de subpartida (8 dígitos).
- Entrenado exclusivamente en portugués; no se ha evaluado su comportamiento en castellano ni en otros idiomas.
- Riesgo de alucinación en sentido estricto bajo (es un clasificador, no un generador), pero puede asignar con alta confianza posiciones incorrectas en descripciones ambiguas o fuera de distribución.
- El conjunto de entrenamiento es pequeño (900 filas) y las descripciones sintéticas (299) se generaron después de crear test_v1, lo que motivó un segundo test independiente; el propio autor reconoce que en test_v2 el beneficio de los sintéticos fue menor.
- Las descripciones de anuncios de marketplace no se redistribuyen por restricciones de las fuentes originales, lo que limita la reproducibilidad completa del entrenamiento.
- Licencia MIT: permite uso comercial, pero no exime del cumplimiento de la normativa fiscal aplicable.
- No soporta tool calling, agentes ni razonamiento multi-paso; no debe plantearse como sustituto de un LLM en flujos conversacionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/AmandaGondra/ncm-classifier
- Dataset publicado: https://huggingface.co/datasets/AmandaGondra/ncm-classifier-dataset
- Repositorio de código: https://github.com/amanda-gondra/ncm-classifier (commit `a03a54f1d0973966b0babc8fb846e681197b07e2`)
- Documentación de skops (formato de serialización): https://skops.readthedocs.io/
- Documentación de scikit-learn: https://scikit-learn.org/
