# edoggy/sugarcane-classifier-v1

## Resumen

`sugarcane-classifier-v1` es un clasificador tabular binario publicado por el usuario edoggy en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda de gran escala: es un perceptrón multicapa (MLP) de dos capas (128→64) implementado con scikit-learn y serializado con joblib, que opera sobre los embeddings satelitales de 64 dimensiones de Google Satellite Embedding V1. Su tarea es determinar si un píxel de 30 m previamente identificado como cultivo es caña de azúcar o no.

El modelo se entrenó con datos de Luisiana, Florida y Texas (2018-2024) y de São Paulo (2020 y 2023), usando etiquetas de USDA CDL y MapBiomas Collection 10. Su relevancia es acotada pero práctica: ofrece un componente ligero y reproducible para pipelines de cartografía de cultivos que ya dispongan de los embeddings satelitales y de una máscara de tierras agrícolas.

El repositorio es de tamaño prácticamente nulo (0.0 GB), sin descargas ni likes en el momento de la consulta, y la model card es explícita sobre sus límites geográficos: el rendimiento se degrada gravemente fuera de las regiones de entrenamiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MLP de 2 capas (128→64) sobre embeddings de 64 dimensiones, implementado con scikit-learn |
| Parámetros totales | no disponible (el número exacto no se indica en la model card; por la topología 64→128→64→1 es del orden de decenas de miles de pesos) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (clasificación tabular por píxel, sin ventana de contexto) |
| Tipos de cuantización | no disponible (serializado en joblib; no se documentan variantes cuantizadas) |
| Idiomas soportados | no aplica (modelo tabular, sin procesamiento de lenguaje) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | joblib (`sugarcane_mlp_v1.joblib`) |

## Arquitectura y entrenamiento

La arquitectura es un perceptrón multicapa de dos capas ocultas (128 y 64 unidades) que recibe como entrada el vector de 64 dimensiones de Google Satellite Embedding V1 y produce una probabilidad de pertenencia a la clase "caña de azúcar". El modelo se entrena y se sirve con scikit-learn y joblib, lo que implica una huella de memoria mínima y una inferencia puramente CPU.

Los datos de entrenamiento combinan embeddings satelitales anuales con etiquetas de referencia: USDA CDL para Estados Unidos y MapBiomas Collection 10 para Brasil. La cobertura temporal es 2018-2024 en Luisiana, Florida y Texas, y 2020 y 2023 en São Paulo. La model card menciona una "curva de dosis" en `metrics.json` que documenta cómo mejora el rendimiento al añadir píxeles etiquetados de la región objetivo, lo que sugiere un proceso de ajuste incremental con datos locales. No se documentan técnicas de aumento de datos, búsqueda de hiperparámetros ni validación cruzada más allá de las particiones temporales y geográficas reportadas.

## Capacidades

- Clasificación binaria por píxel: distingue caña de azúcar frente a otros cultivos en píxeles de 30 m.
- Entrada tabular de 64 dimensiones: consume directamente los embeddings de Google Satellite Embedding V1 (anual).
- Salida probabilística: `predict_proba` devuelve la probabilidad de la clase caña, lo que permite umbralizar según la aplicación.
- Generalización temporal dentro de región: el modelo entrenado con datos hasta 2023 mantiene F1 de 0.949 en 2024 en EE. UU.
- Generalización geográfica limitada: F1 de 0.916 en São Paulo 2023 cuando se entrena con EE. UU. más São Paulo 2020.
- No soporta tool calling, agentes, razonamiento multi-paso, visión directa ni procesamiento de lenguaje: es un clasificador tabular puro.
- No procesa imágenes crudas; requiere que el usuario haya calculado previamente los embeddings satelitales.

## Casos de uso

- Cartografía de caña de azúcar a escala regional: aplicar el modelo sobre la máscara de cultivos (CDL en EE. UU., MapBiomas en Brasil) y los embeddings anuales para generar mapas binarios de caña con probabilidad asociada, útil para estimaciones de superficie sembrada.
- Seguimiento interanual de superficies: al mantener el rendimiento temporal dentro de las regiones entrenadas (F1 0.949 en EE. UU. 2024), permite comparar la extensión de caña entre campañas con la misma metodología.
- Filtrado previo en pipelines de teledetección: usar la probabilidad como paso de descarte antes de análisis más costosos (segmentación, clasificación multiespectral), reduciendo el volumen de píxeles a procesar.
- Monitorización de expansión agrícola en São Paulo: con el modelo ajustado a la región (F1 0.916 en 2023), detectar cambios en la huella de caña dentro del área cubierta por MapBiomas.
- Investigación reproducible en cartografía de cultivos: al ser un modelo ligero, serializado y con licencia CC-BY-SA-4.0, sirve como línea base comparable en experimentos sobre embeddings satelitales.
- Despliegue en entornos con recursos mínimos: la inferencia en CPU con scikit-learn permite ejecutarlo en servidores modestos o en lotes masivos sin GPU.
- Reentrenamiento local para nuevas regiones: la model card propone etiquetar unos miles de píxeles de cultivo locales (incluidos cultivos perennes arbóreos) y reajustar el modelo, un flujo viable para equipos con datos de campo propios.

## Benchmarks y rendimiento

Resultados reportados en la model card (F1 en la clase caña frente a otros cultivos, sobre datos retenidos):

| Prueba | F1 |
|---|---|
| EE. UU. 2024, entrenado con datos ≤2023 | 0.949 |
| São Paulo 2023, entrenado con EE. UU. + SP 2020 | 0.916 |
| Florida, entrenado solo con LA+TX (región no vista) | 0.794 (confusión con cítricos) |
| Brasil, entrenado solo con EE. UU. (hemisferio no visto) | 0.000 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible, ya que no aplican a un clasificador tabular de este tipo.

## Requisitos de hardware

- VRAM: no requiere GPU; la inferencia es en CPU con scikit-learn.
- GPU recomendadas: ninguna; no se documenta soporte GPU ni necesidad de él.
- GPU de consumo: irrelevante para este modelo; cabe en cualquier equipo por su tamaño mínimo (repositorio de 0.0 GB).
- Opciones de despliegue: carga directa con `joblib.load` en Python; integrable en scripts de procesamiento por lotes, servicios Flask/FastAPI o jobs de teledetección (Google Earth Engine export, Dask, etc.).
- Latencia y throughput: no disponibles en la información proporcionada; al ser un MLP de dos capas, la inferencia por píxel es del orden de microsegundos en CPU, pero no se aportan cifras medidas.

## Comparativa con modelos similares

| Modelo | Tipo | Entrada | Región de entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| edoggy/sugarcane-classifier-v1 | MLP tabular (scikit-learn) | Embeddings satelitales de 64 dim | EE. UU. (LA, FL, TX) y São Paulo | CC-BY-SA-4.0 | Hugging Face |
| bsdwin/Sugarcane-Classifier | Modelos de deep learning para clasificación y salud de caña | Imágenes (según repositorio) | no disponible | no disponible | GitHub |
| a64703/sugarcane-classifier-P | Clasificador de variedades (ROC10, ROC28, ROC29) | Imágenes de caña | no disponible | no disponible | Hugging Face Space |

Los dos proyectos comparables encontrados en la búsqueda abordan tareas distintas (clasificación de variedades o monitorización de salud a partir de imágenes) y no publican métricas comparables en la información disponible, por lo que no es posible establecer una comparación cuantitativa directa.

## Limitaciones y advertencias

- Fuerte dependencia geográfica: el F1 cae a 0.000 en Brasil cuando el modelo se entrena solo con datos de EE. UU.; no debe aplicarse fuera de las regiones de entrenamiento sin reentrenar.
- Confusión con cultivos perennes arbóreos: en Florida, con entrenamiento solo en LA y TX, los cítricos se clasifican erróneamente como caña (F1 0.794).
- Requiere una máscara de cultivo previa: no fue entrenado con agua, zonas urbanas ni bosque, por lo que aplicarlo fuera de píxeles agrícolas produce resultados sin validez.
- Dependencia de un proveedor externo: necesita los embeddings de Google Satellite Embedding V1 (anual); cambios en esa fuente afectan a la reproducibilidad.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribución y obliga a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integración en productos propietarios.
- Riesgo de falsos positivos y negativos en regiones con cultivos similares espectralmente; la model card recomienda etiquetar y reentrenar con datos locales.
- Sin métricas de calibración probabilística publicadas: el umbral de decisión debe validarse en cada aplicación.
- Modelo con cero descargas y cero likes en el momento de la consulta; no hay evidencia de validación independiente por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edoggy/sugarcane-classifier-v1
- Dataset de embeddings: https://huggingface.co/datasets/edoggy/sugarcane-satellite-embeddings
- Repositorio comparable en GitHub: https://github.com/bsdwin/Sugarcane-Classifier
- Space comparable en Hugging Face: https://huggingface.co/spaces/a64703/sugarcane-classifier-P
