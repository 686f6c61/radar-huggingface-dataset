# edoggy/crop-classifier-v1

## Resumen

`edoggy/crop-classifier-v1` es un clasificador tabular de tipo de cultivo publicado por el usuario edoggy en Hugging Face. No es un modelo de lenguaje ni una red neuronal profunda: se trata de un `HistGradientBoostingClassifier` de scikit-learn serializado con joblib que recibe un vector de embedding de satelite de 64 dimensiones correspondiente a un pixel de tierra agricola y devuelve una etiqueta de cultivo entre 15 clases posibles (cana de azucar, soja, maiz, algodon, arroz, trigo de invierno, cacahuete, sorgo, citricos, heno, cesped, arboles, pasto, plantacion forestal y otros).

El modelo aborda el problema de la cartografia de cultivos a partir de embeddings de satelite precalculados (Google Satellite Embedding V1), evitando el coste de entrenar una red convolucional o de vision por computador desde cero. Se entreno con etiquetas del USDA CDL (Luisiana, Florida y Texas, 2018-2024) y de MapBiomas Collection 10 (Sao Paulo, 2020 y 2023), y esta calibrado especificamente para esas regiones.

Su relevancia es practica: demuestra que un modelo de gradient boosting de muy bajo coste computacional puede alcanzar un F1 ponderado de 0,858 en la validacion estadounidense de 2024 cuando se dispone de embeddings de satelite de calidad. Es un artefacto pequeno (repo de 0,0 GB) pensado para integrarse en pipelines de teledeteccion agricola, no para uso general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gradient boosting de arboles (sklearn `HistGradientBoostingClassifier`) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (entrada: vector de 64 dimensiones) |
| Tipos de cuantizacion | no disponible (modelo tabular; no se aplican cuantizaciones de LLM) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | CC-BY-SA-4.0 |
| Formato de pesos | joblib (`crop_classifier_v1.joblib`) |

## Arquitectura y entrenamiento

El modelo es un clasificador de gradient boosting sobre histogramas de scikit-learn, una familia de arboles de decision potenciados por gradiente que discretiza las caracteristicas continuas en bins para acelerar el entrenamiento y reducir memoria. La entrada es un vector denso de 64 dimensiones procedente de Google Satellite Embedding V1 (licencia CC-BY-4.0); la salida es una de 15 clases de cobertura agricola.

El entrenamiento combina etiquetas del USDA Cropland Data Layer (dominio publico) para Luisiana, Florida y Texas entre 2018 y 2024, y etiquetas de MapBiomas Collection 10 para Sao Paulo en 2020 y 2023. La validacion reportada se hizo sobre 2024 estadounidense entrenando solo con 2018-2023, lo que constituye una prueba de generalizacion temporal. El muestreo sobremuestrea cana de azucar hasta el 50 % de las filas, mientras que el resto de cultivos aparecen a su frecuencia natural entre tierras agricolas; las clases con menos de 1.500 filas se agrupan en `other`. No se documenta el numero exacto de filas de entrenamiento ni hiperparametros del estimador.

## Capacidades

- Clasificacion de tipo de cultivo a partir de embeddings de satelite de 64 dimensiones sobre pixeles previamente identificados como tierra agricola.
- Distincion entre 15 clases: sugarcane, soybeans, corn, cotton, rice, winter_wheat, peanuts, sorghum, citrus, hay, sod, other_tree, pasture, forest_plantation y other.
- Inferencia por lotes mediante `predict` sobre matrices de embeddings (`embeddings_64d`), apta para procesar teselas completas de imagen satelital.
- Generalizacion temporal limitada: validado en un ano no visto (2024) tras entrenar con 2018-2023.
- Cobertura geografica restringida a las regiones de entrenamiento (sur de EE. UU. y estado de Sao Paulo).
- No soporta tool calling, agentes, razonamiento multi-paso, vision directa ni procesamiento de lenguaje natural.

## Casos de uso

- Cartografia anual de cultivos en el sur de Estados Unidos: aplicar el modelo sobre los embeddings de todos los pixeles agricolas de Luisiana, Florida y Texas para generar un mapa de clases por parcela, sustituyendo o complementando el etiquetado manual del CDL.
- Monitorizacion de cana de azucar en Sao Paulo: con un F1 de 0,94 para sugarcane en EE. UU. y una confusion conocida del ~10 % con pasto en Brasil, el modelo sirve para estimaciones preliminares de superficie de cana antes de la publicacion de informes oficiales.
- Validacion cruzada de productos oficiales: comparar las predicciones del modelo con el CDL publicado para detectar discrepancias sistematicas en clases problematicas como heno, cesped o sorgo.
- Segmentacion de parcelas para seguros agrarios: clasificar pixeles agricolas y agregar por poligono catastral para estimar la composicion de cultivos de una explotacion y ajustar primas.
- Investigacion en teledeteccion: usar el modelo como baseline barato frente a clasificadores CNN o transformers de vision, ya que entrena en minutos sobre CPU y sirve de referencia en estudios comparativos.
- Prototipado rapido en nuevas regiones: el autor indica que basta con etiquetar unos miles de pixeles locales y reentrenar; el pipeline permite adaptar el clasificador a una comarca nueva sin infraestructura de GPU.
- Analisis de series temporales de embeddings: aplicar el modelo ano a ano sobre la misma region para estudiar rotaciones de cultivos y cambios de uso del suelo.

## Benchmarks y rendimiento

Resultados reportados por el autor en la validacion de EE. UU. 2024, entrenando solo con 2018-2023:

| Metrica | Valor |
|---|---|
| Accuracy | 0,823 |
| Weighted F1 | 0,858 |

F1 por clase en esa misma validacion:

| Clase | F1 |
|---|---|
| sugarcane | 0,94 |
| corn | 0,90 |
| soybeans | 0,89 |
| cotton | 0,86 |
| rice | 0,85 |
| winter_wheat | 0,83 |
| peanuts | 0,80 |
| citrus | 0,76 |
| sorghum | 0,68 |
| hay | 0,49 |
| sod | 0,17 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un clasificador tabular.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU. El artefacto joblib ocupa practicamente nada (repo de 0,0 GB).
- GPU recomendadas: no son necesarias. Cualquier CPU moderna basta para inferencia por lotes.
- Cabe en cualquier equipo consumer, incluidos portatiles de gama baja y entornos sin acelerador.
- Opciones de despliegue: carga directa con `joblib.load` desde `huggingface_hub.hf_hub_download`, o serializacion dentro de un servicio Python (FastAPI, Flask) que reciba embeddings. No aplican vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles de forma explicita; al ser gradient boosting sobre 64 caracteristicas, la inferencia por fila es del orden de microsegundos a milisegundos en CPU, pero el autor no publica cifras.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos comparables directos (mismo enfoque de clasificacion tabular sobre embeddings de satelite con etiquetas CDL/MapBiomas). Los repositorios encontrados en la busqueda web (`abylaydospayev/crop_classifier` y `harshitads28/Crop-Classifier`) son proyectos distintos basados en vision por computador (ResNet-50 y clasificacion de imagenes de cultivos), no alternativas equivalentes. Se indica "no disponible" para una comparativa cuantitativa fiable.

| Modelo | Enfoque | Entrada | Licencia | Disponibilidad |
|---|---|---|---|---|
| edoggy/crop-classifier-v1 | Gradient boosting tabular | Embedding 64-d | CC-BY-SA-4.0 | Hugging Face |
| abylaydospayev/crop_classifier | ResNet-50 fine-tuned | Imagen RGB | no disponible | GitHub |
| harshitads28/Crop-Classifier | Clasificador de imagenes | Imagen | no disponible | GitHub |

## Limitaciones y advertencias

- Sesgo de muestreo: la cana de azucar representa el 50 % de las filas de entrenamiento, por lo que las probabilidades previas no reflejan la frecuencia real de cultivos.
- Confusiones documentadas: en EE. UU., cana de azucar se confunde con sorgo (ambas gramineas C4 altas), citricos con cesped y heno (granjas de cesped de Florida entre huertos) y heno, cesped y otros se mezclan entre si porque el propio CDL los etiqueta de forma inconsistente. En Brasil, aproximadamente el 10 % de los pixeles de cana se clasifican como pasto.
- Clases raras: las clases con menos de 1.500 filas se agrupan en `other`, de modo que el modelo no distingue cultivos poco frecuentes.
- Dependencia regional y estacional: los embeddings son fuertemente especificos de region y temporada; el modelo esta calibrado solo para las zonas entrenadas y requiere reentrenamiento con etiquetas locales en otras regiones.
- Uso restringido: solo debe aplicarse a pixeles ya identificados como tierra agricola; no es un detector de cultivos sobre imagen bruta.
- No es un predictor de precios ni de oferta: los embeddings anuales llegan despues de los informes oficiales de superficie sembrada.
- Licencia CC-BY-SA-4.0: permite uso comercial con atribucion y obliga a compartir las obras derivadas bajo la misma licencia, lo que puede condicionar su integracion en productos propietarios.
- Riesgo de error en produccion: con F1 de 0,17 en cesped y 0,49 en heno, las decisiones automatizadas basadas en esas clases no son fiables.
- No disponible: informacion sobre sesgos etnicos o sociales (no aplica), numero exacto de muestras de entrenamiento e hiperparametros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/edoggy/crop-classifier-v1
- Dataset de embeddings: https://huggingface.co/datasets/edoggy/sugarcane-satellite-embeddings
- Proyecto relacionado (vision, ResNet-50): https://github.com/abylaydospayev/crop_classifier
- Proyecto relacionado (clasificador de imagenes): https://github.com/harshitads28/Crop-Classifier
