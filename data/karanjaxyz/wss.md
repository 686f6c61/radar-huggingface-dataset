# karanjaxyz/wss

## Resumen

`karanjaxyz/wss` es un repositorio experimental publicado en Hugging Face que no contiene un modelo de lenguaje en el sentido convencional, sino un conjunto de experimentos sobre escritura directa de pesos de redes neuronales mediante razonamiento, sin entrenamiento basado en gradientes. El primer experimento documentado, denominado Titanic, consiste en un clasificador de supervivencia escrito a mano por un agente denominado Astra, con una arquitectura de 12 entradas, 18 unidades ocultas con activación ReLU y una salida sigmoide, sumando 253 parámetros incluyendo sesgos. El autor declara explícitamente que no se empleó optimizador, búsqueda automática de hiperparámetros ni conversión desde árboles de decisión.

La relevancia del artefacto es fundamentalmente metodológica: propone evaluar si un modelo de razonamiento puede generar pesos funcionales directamente, sin descenso de gradiente, y comparar el rendimiento resultante frente a un baseline trivial. Los resultados reportados sobre un split de test intacto de 446 pasajeros muestran una accuracy del 81,17 % en ambas versiones, con una mejora marginal en ROC AUC (0,8630 a 0,8651) y log loss (0,4412 a 0,4271) tras una única revisión manual de cuatro pesos, aunque con empeoramiento de F1 (0,7558 a 0,7308).

No se dispone de información sobre arquitectura de transformer, tamaño en parámetros de un modelo generativo, longitud de contexto, tokenizador ni pesos en formatos estándar. El repositorio contiene únicamente ficheros JSON de pesos (`v1/weights.json` y `v2/weights.json`) para un clasificador tabular. Cualquier uso en producción de NLP queda fuera del alcance de este artefacto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Perceptrón multicapa (MLP) tabular: 12 entradas → 18 unidades ReLU → 1 salida sigmoide |
| Parametros totales | 253 (incluyendo sesgos) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | JSON (`v1/weights.json`, `v2/weights.json`) |

## Arquitectura y entrenamiento

La arquitectura es una red neuronal feedforward de una sola capa oculta, con 12 entradas correspondientes a las features del dataset Titanic de seaborn, 18 neuronas ocultas con activación ReLU y una neurona de salida con activación sigmoide para clasificación binaria de supervivencia. El recuento de 253 parámetros es coherente con 12×18 pesos de la primera capa más 18 sesgos, y 18×1 pesos de la segunda capa más 1 sesgo.

El método de "entrenamiento" no es gradient-based: los pesos fueron escritos directamente por un agente de razonamiento (Astra), sin optimizador, sin búsqueda automática de hiperparámetros y sin conversión desde un árbol de decisión. Se documentan dos versiones: `v1`, congelada antes de cualquier predicción, y `v2`, que incorpora exactamente una revisión manuscrita de cuatro pesos a partir de un informe agregado sobre 445 pasajeros de validación, congelada antes del test final. El split se generó con un shuffle de Python con semilla `20261123`, usando las primeras 445 filas para validación y las 446 restantes para test. No se especifica el número de tokens ni composición de dataset de preentrenamiento del agente, aunque el autor advierte que el preentrenamiento de Astra podría contener conocimiento sobre el Titanic, lo que introduce un posible sesgo de contaminación.

## Capacidades

- Clasificación binaria tabular sobre el esquema de features del dataset Titanic de seaborn (12 entradas).
- Generación de probabilidades calibradas mediante salida sigmoide, evaluables con log loss y ROC AUC.
- Reproducibilidad de pesos mediante ficheros JSON versionados (`v1` y `v2`).
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso en inferencia.
- No tiene capacidades multilingües ni de generación de texto.
- No dispone de modo thinking, visión ni audio.
- No es un modelo de lenguaje: no procesa secuencias de tokens ni mantiene contexto conversacional.

## Casos de uso

- Investigación sobre weight-space learning: servir como referencia reproducible para estudiar si un modelo de razonamiento puede escribir pesos funcionales sin descenso de gradiente, comparando `v1` y `v2` sobre el mismo split de test.
- Docencia en fundamentos de redes neuronales: el fichero `weights.json` permite inspeccionar manualmente 253 parámetros y verificar el forward pass de un MLP mínimo sin dependencias de frameworks de entrenamiento.
- Baseline trivial para el dataset Titanic: con accuracy del 81,17 % y ROC AUC de 0,8651, puede usarse como cota inferior en comparativas frente a regresiones logísticas, random forests o gradient boosting.
- Auditoría de contaminación de benchmarks: el propio autor señala que el preentrenamiento del agente podría contener conocimiento del Titanic, lo que convierte este artefacto en un caso de estudio sobre fuga de datos en evaluaciones.
- Estudio de estabilidad de pesos: la revisión de solo cuatro pesos entre `v1` y `v2` permite analizar la sensibilidad de métricas de calibración (log loss, ROC AUC) frente a cambios mínimos en el espacio de parámetros.
- Reproducción de experimentos de escritura manual de redes: útil para grupos que investigan interpretabilidad y edición directa de pesos en redes pequeñas antes de escalar a modelos mayores.

## Benchmarks y rendimiento

Resultados reportados por el autor sobre un split de test intacto de 446 pasajeros del dataset Titanic de seaborn:

| Metrica | V1 | V2 |
|---|---:|---:|
| Accuracy | 81,17 % | 81,17 % |
| ROC AUC | 0,8630 | 0,8651 |
| Log loss (menor es mejor) | 0,4412 | 0,4271 |
| F1 | 0,7558 | 0,7308 |

No se han publicado resultados de benchmarks en la informacion disponible para tareas de NLP, código, matemáticas o visión, dado que el artefacto no es un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 MB; los 253 parámetros en float32 ocupan aproximadamente 1 KB, por lo que cabe en CPU sin GPU.
- GPU recomendadas: no aplica; cualquier CPU es suficiente.
- Cabe en cualquier GPU consumer e incluso en microcontroladores con memoria suficiente para cargar el JSON.
- Opciones de despliegue: carga directa del JSON con NumPy, PyTorch o cualquier framework que permita inicializar un MLP con los pesos dados; no requiere vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma oficial; para un MLP de 253 parámetros el forward pass es del orden de microsegundos por muestra en CPU.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables de la misma categoría (escritura directa de pesos sin entrenamiento por gradientes) ni se dispone de datos de otros artefactos del mismo autor para contrastar.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no procesa contexto, no soporta tool calling ni agentes.
- Licencia no especificada: no se puede garantizar uso comercial ni redistribución; conviene contactar con el autor antes de cualquier uso en producción.
- Posible contaminación del benchmark: el propio autor advierte que el preentrenamiento de Astra podría contener conocimiento del dataset Titanic, lo que invalida la evaluación como medida limpia de capacidad de generalización.
- El dataset Titanic es trivial y de baja dimensionalidad; los resultados no son extrapolables a tareas de mayor complejidad.
- La revisión de `v1` a `v2` empeoró F1 y recall pese a mejorar log loss y ROC AUC, lo que indica que la edición manual de pesos no produce mejoras uniformes y puede degradar métricas operativas.
- Sin pipeline declarado, sin tokenizador, sin model card estándar y con cero descargas y likes: el artefacto no ha sido validado por la comunidad.
- Riesgo de alucinación no aplica en el sentido de generación de texto, pero sí en cuanto a la fiabilidad de las métricas si no se reproduce el split con la semilla `20261123`.
- No hay información sobre sesgos demográficos del clasificador más allá de los inherentes al dataset Titanic (época, género, clase social).

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/karanjaxyz/wss
- Pesos v1: https://huggingface.co/karanjaxyz/wss/blob/main/v1/weights.json
- Pesos v2: https://huggingface.co/karanjaxyz/wss/blob/main/v2/weights.json
- Dataset Titanic de seaborn: https://github.com/mwaskom/seaborn-data/blob/master/titanic.csv
