# LemonBynon/defiende-el-servidor-unsw

## Resumen

Defiende el servidor - v2 (bosque_aleatorio) es un clasificador binario tabular entrenado para distinguir entre trafico de red normal (clase 0) y trafico de ataque (clase 1) sobre el dataset UNSW-NB15. Lo desarrolla LemonBynon como proyecto academico de MLOps de la Universidad Externado de Colombia, y se publica en HuggingFace como un artefacto reproducible con trazabilidad completa (commit de codigo, version de datos en DVC, run de MLflow y hash SHA-256 del modelo).

Tecnicamente no es un modelo de lenguaje ni una red neuronal: es un `RandomForestClassifier` de scikit-learn serializado con joblib, encapsulado en un `Pipeline` que incluye imputacion, escalado y one-hot encoding ajustados unicamente con el conjunto de entrenamiento. La decision de clasificacion se toma aplicando un umbral de 0.533862 sobre la probabilidad de ataque, elegido en validacion para maximizar el recall manteniendo una tasa de falsos positivos (FPR) igual o inferior al 5%.

Su relevancia es fundamentalmente educativa y metodologica: ilustra buenas practicas de trazabilidad, separacion por grupos para evitar fuga de datos y evaluacion unica sobre test. El propio autor advierte que no demuestra eficacia en redes actuales, ya que el dataset es de 2015 y de trafico sintetico de laboratorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RandomForestClassifier (scikit-learn) dentro de un Pipeline de preprocesamiento |
| Parametros totales | no disponible (no se documenta numero de arboles ni profundidad) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo tabular, no secuencial) |
| Tipos de cuantizacion | no aplica (modelo clasico serializado en joblib) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | other |
| Formato de pesos | joblib (`model.joblib`), acompanado de `config.json` y `requirements.txt` |

## Arquitectura y entrenamiento

El modelo es un bosque aleatorio (RandomForestClassifier) integrado en un `Pipeline` de scikit-learn que aplica imputacion, escalado y one-hot encoding sobre las columnas crudas del dataset. Todo el preprocesamiento se ajusta exclusivamente con el conjunto de entrenamiento y se persiste dentro del mismo objeto serializado, de modo que la inferencia reproduce exactamente las transformaciones vistas en entrenamiento. Las columnas `label`, `attack_cat` e `id` se excluyen como features.

El entrenamiento y la validacion se realizan unicamente sobre `UNSW_NB15_training-set.csv`, con una division por grupos de entradas identicas para evitar fuga entre ambos conjuntos. La semilla es 42 y el experimento corresponde a la ejecucion E4 registrada en MLflow (`1dce89df97e342fd9821e0646ce6b28e`). El umbral de decision se selecciona en validacion con la regla de maximizar el recall sujeto a FPR ≤ 5%, resultando en 0.533862. La evaluacion final sobre test se realiza una sola vez sobre 82.332 filas.

## Capacidades

- Clasificacion binaria tabular: distingue trafico normal (0) frente a ataque (1) a partir de features crudas del dataset UNSW-NB15.
- Salida de probabilidad calibrada mediante `predict_proba`, lo que permite ajustar el umbral segun el compromiso recall/FPR deseado.
- Preprocesamiento integrado: imputacion, escalado y codificacion one-hot incluidos en el propio pipeline.
- Reproducibilidad completa: trazabilidad de codigo, datos, experimento y pesos mediante hashes y versiones.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues, al no ser un modelo generativo.
- No dispone de modo thinking, vision ni audio.

## Casos de uso

- Docencia y practicas de MLOps: servir como ejemplo reproducible de pipeline completo (datos versionados con DVC, experimentos en MLflow, artefacto con hash) en asignaturas de ingenieria de datos o seguridad.
- Ejercicios de evaluacion de deteccion de intrusiones: usar el modelo como linea base para comparar con alternativas mas modernas sobre el mismo dataset y discutir el impacto del umbral en recall y FPR.
- Auditoria de fuga de datos: el repositorio permite estudiar como la division por grupos y la evaluacion unica en test afectan a las metricas reportadas frente a las de validacion.
- Simulacion de triaje en SOC: en un entorno controlado de laboratorio, emplear las probabilidades de ataque para practicar la priorizacion de alertas y el ajuste del umbral segun la tolerancia a falsos positivos.
- Analisis del compromiso precision/recall: utilizar la diferencia entre validacion (FPR 0.05) y test (FPR 0.1582) para discutir la generalizacion y el sobreajuste del umbral.
- Referencia para pipelines de clasificacion tabular: reutilizar la estructura de `Pipeline` + `config.json` + `requirements.txt` como plantilla para otros clasificadores tabulares con umbral configurable.

## Benchmarks y rendimiento

Metricas de validacion reportadas por el autor (clase positiva = ataque):

| Metrica | Valor |
|---|---|
| Recall (ataque) | 0.9429 |
| Precision (ataque) | 0.9757 |
| FPR | 0.0500 |
| Macro-F1 | 0.9381 |
| Accuracy (complemento) | 0.9452 |

Matriz de confusion en validacion: TN=10640, FP=560, FN=1362, TP=22507.

Evaluacion final en test (una sola vez, 82.332 filas, umbral 0.533862):

| Metrica | Valor |
|---|---|
| Recall (ataque) | 0.9673 |
| Precision (ataque) | 0.8822 |
| FPR | 0.1582 |
| Macro-F1 | 0.9087 |
| Accuracy | 0.9109 |

Matriz de confusion en test: TN=31145, FP=5855, FN=1484, TP=43848.

No se han publicado comparaciones con otros modelos en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica; es un modelo de scikit-learn que se ejecuta en CPU.
- GPU recomendadas: ninguna; no requiere aceleracion por GPU.
- Cabe en cualquier equipo de consumo: el repositorio ocupa 0.0 GB y el modelo se carga en memoria RAM convencional.
- Opciones de despliegue: carga directa con `joblib` en Python, servicio HTTP propio (por ejemplo FastAPI) o integracion en pipelines de scikit-learn. No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.
- Requisito critico: instalar las mismas versiones de scikit-learn indicadas en `requirements.txt` para garantizar la compatibilidad del objeto serializado.

## Comparativa con modelos similares

| Modelo | Tipo | Dataset | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Defiende el servidor - v2 (bosque_aleatorio) | RandomForest (scikit-learn) | UNSW-NB15 | no aplica | other | HuggingFace |
| Defiende el servidor - v1 | no disponible (version previa del mismo proyecto) | UNSW-NB15 | no aplica | no disponible | HuggingFace (referenciada en la model card) |
| Alternativas de deteccion de intrusiones sobre UNSW-NB15 | no disponible | UNSW-NB15 | no aplica | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Dataset historico (2015) y trafico sintetico de laboratorio: puede no generalizar a redes actuales.
- El conjunto de test publicado se solapa parcialmente con entrenamiento y validacion; el 10.4% de las filas de test repite entradas de train/val, segun el propio autor.
- Degradacion notable entre validacion y test: el FPR pasa de 0.05 a 0.1582 y la precision cae de 0.9757 a 0.8822, lo que indica que el umbral ajustado en validacion no se traslada bien.
- Se priorizo el recall de ataque con FPR ≤ 5% en validacion; conviene revisar FPR y recall por tipo de ataque antes de cualquier uso real.
- Modelo educativo: el autor lo declara no apto para produccion.
- Licencia "other": no se detallan los terminos, por lo que el uso comercial requiere consultar al autor.
- Riesgo de seguridad en la carga: `joblib` usa pickle, por lo que solo deben cargarse artefactos de fuentes confiables.
- No procesa texto ni dispone de capacidades generativas, de razonamiento o multilingues.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LemonBynon/defiende-el-servidor-unsw
- Repositorio de codigo (referenciado en la model card, commit `721c5ae0065a299464c22f215f07f756f76edb70`): no disponible como URL en la informacion proporcionada
- Run de MLflow `1dce89df97e342fd9821e0646ce6b28e`: no disponible como URL publica en la informacion proporcionada
- Dataset UNSW-NB15: no disponible como enlace en la informacion proporcionada
