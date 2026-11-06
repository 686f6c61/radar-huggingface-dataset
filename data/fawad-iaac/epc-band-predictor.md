# fawad-iaac/epc-band-predictor

## Resumen

EPC Band Predictor es un clasificador tabular multiclase desarrollado por el usuario fawad-iaac que estima la banda de certificado de eficiencia energetica (EPC) de una vivienda a partir de su consumo anual de gas y electricidad, caracteristicas del inmueble y medidas de eficiencia energetica instaladas. No es un modelo de lenguaje ni una red neuronal: se trata de un pipeline de scikit-learn basado en Gradient Boosting con preprocesamiento integrado, serializado con joblib.

El modelo agrupa las siete bandas EPC originales (A a G) en cinco clases ordenadas (A/B, C, D, E, F/G), lo que simplifica el problema y reduce el desbalance entre categorias extremas. Resuelve un problema practico de analisis energetico de vivienda: predecir de forma aproximada la calificacion energetica cuando no se dispone de una evaluacion formal, por ejemplo en estudios exploratorios, segmentacion de cartera inmobiliaria o analisis de politicas publicas.

Es relevante por su simplicidad y bajo coste de despliegue (repo de 0.0 GB, sin GPU), pero tambien por sus limitaciones explicitas: una precision exacta del 59% y un macro F1 de 0.40 indican que sirve como herramienta exploratoria, no como sustituto de una certificacion energetica oficial. La model card restringe su uso a fines educativos y experimentales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient Boosting classifier (scikit-learn) con pipeline de preprocesamiento |
| Parametros totales | no disponible (modelo tabular; hiperparametros: learning_rate=0.1, max_leaf_nodes=31) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, sin entrada de texto) |
| Tipos de cuantizacion | no disponible (no aplica; serializacion joblib) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | other |
| Formato de pesos | joblib (serializacion de scikit-learn) |

## Arquitectura y entrenamiento

El modelo es un Gradient Boosting de scikit-learn integrado en un pipeline que aplica preprocesamiento a las variables de entrada antes de la clasificacion. La seleccion final fue un modelo sin ponderacion de clases con `learning_rate=0.1` y `max_leaf_nodes=31`. Durante el ajuste se probo una variante con pesos de clase que obtuvo un macro F1 ligeramente superior, pero fue descartada porque su precision exacta era menor y confundia con frecuencia la clase minoritaria F/G.

Las variables de entrada son: consumo anual de gas (`Gcons2024`), consumo anual de electricidad (`Econs2024`), banda de superficie (`FLOOR_AREA_BAND`), banda de antiguedad (`PROP_AGE_BAND`), tipo de propiedad (`PROP_TYPE`), region (`REGION`) y tres indicadores binarios de medidas de eficiencia: aislamiento de buhardilla (`LI_FLAG`), aislamiento de cavidades (`CWI_FLAG`) e instalacion fotovoltaica (`PV_FLAG`). La variable `MAIN_HEAT_FUEL` se excluyo porque todos los inmuebles del subconjunto de entrenamiento compartian el mismo valor, lo que la convertia en constante. El entrenamiento se realizo sobre un dataset residencial anonimizado; no se especifica en la informacion disponible el numero de muestras, el reparto train/test ni la composicion detallada del dataset.

## Capacidades

- Clasificacion multiclase de bandas EPC en cinco clases ordenadas: A/B, C, D, E, F/G.
- Prediccion a partir de consumo energetico anual (gas y electricidad) combinado con caracteristicas fisicas del inmueble.
- Incorporacion de indicadores binarios de medidas de eficiencia energetica (aislamiento de buhardilla, aislamiento de cavidades, fotovoltaica).
- Uso de variables categoricas de contexto: tipo de propiedad, region, banda de superficie y banda de antiguedad.
- Inferencia CPU-only mediante scikit-learn y joblib, sin requisitos de GPU.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues: es un clasificador tabular puro.

## Casos de uso

- Analisis exploratorio de cartera inmobiliaria: clasificar un conjunto de viviendas por banda EPC estimada para segmentar activos por eficiencia energetica y priorizar rehabilitaciones, usando consumo y caracteristicas fisicas como entradas.
- Estudios de politica energetica: estimar la distribucion aproximada de bandas EPC en una region a partir de datos de consumo agregados y caracteristicas de vivienda, con la cautela de que las predicciones son estimaciones.
- Priorizacion de auditorias energeticas: identificar viviendas con alta probabilidad de caer en bandas D o inferiores para dirigir evaluaciones EPC formales donde el coste de auditarlas todas seria prohibitivo.
- Simulacion de escenarios de mejora: evaluar como cambia la banda predicha al activar indicadores de medidas de eficiencia (por ejemplo, marcar `CWI_FLAG` o `PV_FLAG`) y comparar la clase resultante.
- Enriquecimiento de datasets inmobiliarios: generar una etiqueta EPC aproximada para registros que carecen de certificado oficial, util para modelos posteriores de valoracion o riesgo.
- Prototipado y docencia: servir como ejemplo reproducible de pipeline scikit-learn con preprocesamiento, seleccion de modelo y evaluacion con metricas macro en clases desbalanceadas.
- Filtrado preliminar en plataformas de eficiencia energetica: descartar candidatos claramente eficientes (A/B) antes de una evaluacion formal, reduciendo el volumen de certificaciones necesarias.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre el conjunto de test reservado:

| Metrica | Resultado |
|---|---:|
| Precision exacta de banda | 59% |
| Precision dentro de ±1 banda EPC | 98% |
| Macro F1 | 0.40 |

No se han publicado resultados de benchmarks comparativos con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; el modelo es tabular y se ejecuta en CPU.
- GPU recomendadas: ninguna; scikit-learn no requiere GPU para este pipeline.
- Cabe en cualquier consumer GPU de forma irrelevante (no la usa) y en cualquier CPU convencional; el repo ocupa 0.0 GB.
- Opciones de despliegue: carga directa con `joblib.load` en Python, integracion en servicios FastAPI o Flask, ejecucion por lotes con pandas, o exportacion del pipeline a otros runners compatibles con scikit-learn.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada; al ser Gradient Boosting tabular, la inferencia por muestra es de orden de microsegundos a milisegundos en CPU, aunque no se aporta una medicion concreta.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos alternativos de prediccion de bandas EPC ni resultados comparativos con otros clasificadores tabulares.

## Limitaciones y advertencias

- Las clases E y F/G son infrecuentes en el entrenamiento y a menudo se predicen como D; el macro F1 de 0.40 refleja este desbalance.
- El consumo de gas y electricidad por si solo es un predictor debil de la banda EPC; las caracteristicas del inmueble aportan informacion importante, pero el modelo sigue siendo aproximado.
- El consumo depende de ocupacion, habitos de calefaccion y meteorologia, factores no representados en el modelo.
- La importancia de variables no establece causalidad.
- Las predicciones son estimaciones y no sustituyen una evaluacion EPC formal; no deben usarse como base unica para decisiones relevantes sobre viviendas individuales.
- La licencia es "other": deben verificarse los terminos de redistribucion del dataset y del modelo antes de cualquier uso comercial.
- El uso previsto declarado por el autor es educativo y experimental.
- El modelo no procesa texto ni idiomas; cualquier expectativa de capacidades linguisticas o multimodales es inaplicable.
- No se documenta el tamano del dataset de entrenamiento ni el metodo de particion train/test, lo que limita la reproducibilidad de las metricas reportadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fawad-iaac/epc-band-predictor
- No se han encontrado en la informacion disponible papers, blogs, repositorios adicionales ni demos asociados al modelo.
