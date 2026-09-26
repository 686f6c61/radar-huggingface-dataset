# Basengalenga/destilbert-part-of-speech-feature-based-adaptation

## Resumen

Este repositorio no contiene un modelo de lenguaje generativo, sino un **clasificador lineal (linear probe)** para etiquetado gramatical UPOS (*Universal Part-of-Speech*) en ingles, construido sobre representaciones **congeladas** de `distilbert-base-uncased`. El autor, Basengalenga, publica unicamente el clasificador (`model.skops`); el extractor de features DistilBERT no se distribuye en el repo y debe descargarse aparte y usarse sin ningun fine-tuning.

El modelo resuelve una tarea muy concreta: asignar una de 17 etiquetas UPOS a cada palabra de una frase en ingles, a partir del vector de 768 dimensiones del primer subword de cada palabra. Se entrena sobre el split *English EWT* del dataset Universal Dependencies, con una receta de features estricta que debe respetarse para que las predicciones sean validas: `last_hidden_state` de la ultima capa (la sexta) de DistilBERT, tokenizacion con `is_split_into_words=True`, `truncation=True` y `max_length=512`.

Su relevancia es fundamentalmente metodologica: sirve como *baseline* de probing linguistico para medir cuanta informacion morfosintactica codifican las representaciones de DistilBERT sin necesidad de fine-tuning. Es un artefacto ligero, reproducible y de coste computacional minimo, orientado a investigacion en linguistica computacional y a pipelines de preprocesado, no a despliegues de generacion de lenguaje.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresion logistica (linear probe) sobre representaciones congeladas de un transformer DistilBERT |
| Parametros totales | Extractor DistilBERT base uncased (~66 M, especificacion publica del modelo base) + clasificador: 13.073 pesos (768 x 17 + 17) y 1.536 parametros del `StandardScaler` (768 medias + 768 escalas), ~14,6 k en total |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 512 subword tokens (`max_length=512` en la tokenizacion) |
| Tipos de cuantizacion | No disponible (el clasificador se guarda con `skops`; no se documentan variantes cuantizadas) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | `cc-by-sa-4.0` para el clasificador; DistilBERT es Apache 2.0; el dataset UD English EWT es CC BY-SA 4.0 |
| Formato de pesos | `skops` (`model.skops`); el extractor DistilBERT se usa en su formato original (safetensors/PyTorch) |

## Arquitectura y entrenamiento

El pipeline es una **regresion logistica multinomial** (`lbfgs`, `C=1.0`, `max_iter=1000`) precedida de un `StandardScaler`, empaquetada como pipeline de scikit-learn y serializada con `skops`. No hay entrenamiento del transformer: DistilBERT se usa exclusivamente como extractor de features congelado. La receta obligatoria es la siguiente: se toma `last_hidden_state` (sexta y ultima capa), se extrae un vector de 768 dimensiones por palabra correspondiente al **primer subword** de esa palabra, y se tokeniza con `is_split_into_words=True`, `truncation=True` y `max_length=512`. Si las features se extraen de cualquier otra forma, el modelo carga sin error pero sus predicciones dejan de ser validas.

El entrenamiento se realizo sobre el split *English EWT* de Universal Dependencies, con 17 etiquetas UPOS como clases objetivo y accuracy a nivel de palabra como metrica. No se documenta uso de RLHF, DPO ni ningun ajuste por preferencias; tampoco se especifica el numero de tokens de entrenamiento ni la composicion exacta del corpus mas alla de la referencia al dataset de UD. La innovacion tecnica es minima por diseno: se trata de un *linear probe* que aisla la informacion gramatical linealmente separable en las representaciones de DistilBERT.

## Capacidades

- Etiquetado gramatical UPOS en ingles con 17 etiquetas (sustantivo, verbo, adjetivo, adverbio, pronombre, determinante, preposicion, conjuncion, puntuacion, etc.).
- Clasificacion a nivel de palabra: devuelve una etiqueta por cada token de palabra de la entrada.
- Extraccion y uso de representaciones congeladas de DistilBERT (`last_hidden_state`, primer subword por palabra).
- Funciona sobre entradas ya tokenizadas en palabras estilo Universal Dependencies (la propia model card advierte que `str.split()` no separa la puntuacion correctamente).
- No soporta generacion de texto, razonamiento, codigo, matematicas ni vision.
- No soporta *tool calling* ni *function calling*.
- No esta orientado a agentes ni a razonamiento multi-paso.
- Capacidad multilingue limitada al ingles; no hay soporte documentado de otros idiomas.
- No dispone de modo *thinking* ni de capacidades de audio o multimodalidad.

## Casos de uso

- **Preprocesado linguistico en pipelines de NLP**: etiquetar masivamente corpus en ingles con categorias UPOS antes de tareas de *parsing*, *chunking* o extraccion de informacion, aprovechando que el clasificador es ligero y se ejecuta en CPU.
- **Anotacion asistida de corpus**: generar preanotaciones UPOS con una accuracy de referencia del 95,25% en test para que anotadores humanos las corrijan, reduciendo el coste de construir *treebanks* o datasets etiquetados.
- **Investigacion en *probing* linguistico**: medir que informacion morfosintactica codifican las representaciones de DistilBERT de forma linealmente separable, sirviendo como *baseline* reproducible frente a otros extractores o capas.
- **Enriquecimiento de indices de busqueda**: anadir la categoria gramatical de cada termino a un indice para busquedas sensibles a la funcion sintactica de la palabra (por ejemplo, distinguir usos verbales y nominales).
- **Filtrado y normalizacion de texto**: detectar y clasificar puntuacion, determinantes o preposiciones para reglas de limpieza, *tokenizacion* o normalizacion en pipelines de ingesta.
- **Evaluacion comparativa de modelos**: usar el probe como punto de referencia para cuantificar cuanto mejora (o no) un fine-tuning completo de DistilBERT o un modelo mayor en la misma tarea UPOS.
- **Docencia y demostraciones**: ilustrar de forma practica el concepto de *linear probe* y de evaluacion de representaciones congeladas en cursos de PLN, dado el bajo coste de ejecucion.

## Benchmarks y rendimiento

Los unicos resultados publicados en la informacion disponible son de accuracy a nivel de palabra sobre UD English EWT:

| Split | Accuracy |
|---|---|
| Dev | 95,14 % |
| Test | 95,25 % |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K ni otros) en la informacion disponible, ya que la tarea del modelo es exclusivamente el etiquetado UPOS y no un benchmark generativo o de razonamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: minima. El clasificador sklearn es despreciable; el extractor DistilBERT base (~66 M de parametros) ocupa aproximadamente 255 MB en fp32 y ~128 MB en fp16, por lo que cabe holgadamente en menos de 1 GB de memoria.
- GPU recomendadas: no requiere GPU dedicada; cualquier GPU consumer (RTX 3060, RTX 4090, etc.) lo ejecuta con margen amplio. Tambien es totalmente viable en CPU.
- Cabe en cualquier GPU consumer, e incluso en entornos sin GPU (solo CPU), dado el tamano reducido del transformer.
- Opciones de despliegue: scikit-learn + `skops` para el clasificador, `transformers`/PyTorch para extraer las representaciones de DistilBERT, y exportacion a ONNX si se desea optimizar la extraccion de features.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Accuracy UPOS (UD EWT) | Licencia |
|---|---|---|---|---|---|
| Este (probe sobre DistilBERT) | Linear probe sobre representaciones congeladas | ~66 M (extractor) + ~14,6 k (probe) | 512 subwords | 95,25 % (test) | CC BY-SA 4.0 |
| DistilBERT con fine-tuning completo para POS | Fine-tuning supervisado | ~66 M | no disponible | no disponible | no disponible |
| Tagger UPOS basado en BERT base | Fine-tuning supervisado | no disponible | no disponible | no disponible | no disponible |

No se dispone de resultados de benchmark verificados de alternativas comparables en la informacion proporcionada mas alla de la accuracy propia del modelo, por lo que cualquier comparacion cuantitativa adicional quedaria como "no disponible".

## Limitaciones y advertencias

- **Dependencia estricta de la receta de features**: si las representaciones se extraen de otra capa, de otro subword o con otra tokenizacion, el modelo carga sin error pero produce predicciones invalidas. La model card lo advierte explicitamente.
- **Solo ingles**: no hay soporte multilingue documentado; aplicarlo a otros idiomas no es fiable.
- **No es un modelo generativo**: no genera texto ni puede usarse para tareas de chat, resumen o traduccion.
- **Errores de clasificacion**: con una accuracy de ~95 %, persiste un ~5 % de etiquetas incorrectas, con posible confusion entre categorias cercanas (por ejemplo, entre tipos de determinantes o de conjunciones).
- **Contexto limitado a 512 subword tokens**: las frases mas largas se truncan (`truncation=True`), lo que puede degradar el etiquetado en textos extensos.
- **Entrada pre-tokenizada obligatoria**: requiere segmentacion en palabras estilo UD; `str.split()` no separa correctamente la puntuacion.
- **Riesgo de alucinacion**: no aplica en el sentido generativo, pero si existe riesgo de etiquetas incorrectas que un usuario podria tomar como verdaderas si no se valida contra un gold standard.
- **Licencia CC BY-SA 4.0**: es una licencia *share-alike*; el uso comercial de un derivado obliga a mantener la misma licencia y a atribuir adecuadamente, lo que puede condicionar su integracion en productos propietarios.
- **Dataset bajo CC BY-SA 4.0**: las condiciones del corpus de entrenamiento pueden afectar a la redistribucion de derivados.
- **Madurez y adopcion**: el repositorio registra 0 descargas y 0 *likes* en la informacion consultada, sin evidencia de uso en produccion ni de validacion externa.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Basengalenga/destilbert-part-of-speech-feature-based-adaptation
- Modelo base DistilBERT: https://huggingface.co/distilbert/distilbert-base-uncased
- Dataset Universal Dependencies: https://huggingface.co/datasets/universal-dependencies/universal_dependencies
- Documentacion de skops (formato de serializacion): https://skops.readthedocs.io/
