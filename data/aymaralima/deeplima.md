# aymaralima/deeplima

## Resumen

LIMA DeepLima v0.3.0 es una coleccion de modelos de procesamiento del lenguaje natural para tareas de analisis morfosintactico y tokenizacion, desarrollada por aymaralima como parte del proyecto LIMA. No es un modelo generativo de lenguaje, sino un conjunto de 68 modelos especializados que cubren tokenizadores, expansores de tokens multi-palabra, etiquetadores POS y morfologicos, lematizadores y analizadores de dependencias para 47 idiomas. Los modelos estan entrenados sobre Universal Dependencies 2.18 con embeddings fastText entrenados sobre C4, y sus hiperparametros han sido optimizados con Optuna buscando un equilibrio entre precision y velocidad.

El paquete resuelve el problema del analisis linguistico profundo multilingue en pipelines de PLN: tokenizacion, etiquetado gramatical, lematizacion y parsing de dependencias en una sola distribucion coherente. Es relevante para investigadores y desarrolladores que necesitan componentes linguisticos precisos y ligeros en lugar de modelos generativos grandes, especialmente en contextos donde se requiere procesamiento determinista y trazable de estructuras gramaticales.

La distribucion se organiza por idioma y por treebank, con modelos "MERGE" entrenados sobre todos los treebanks de un idioma (recomendados para texto general) y modelos especificos de treebank para dominios concretos (ficcion, noticias, legal, redes sociales). El repositorio ocupa 47.9 GB e incluye los pesos de los modelos y los embeddings fastText necesarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelos especializados por tarea (tokenizador, etiquetador POS/morfologico, lematizador, parser de dependencias) sobre embeddings fastText entrenados en C4 |
| Parametros totales | no disponible (68 modelos independientes) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelos de analisis linguistico, no generativos) |
| Tipos de cuantizacion | no disponible (embeddings fastText en formato .ftz) |
| Idiomas soportados | 47 idiomas: af, am, ar, bg, bn, ca, cs, cy, da, de, el, en, es, et, eu, fa, fr, ga, gd, gl, hi, hu, hy, is, it, ja, la, lt, lv, mr, mt, nl, no, pl, pt, ro, ru, sk, sq, sr, sv, ta, te, th, tr, ur, vi |
| Licencia | per-treebank (variable segun el treebank de origen; incluye CC BY 4.0, CC BY-SA 3.0/4.0, CC BY-NC-SA 2.5/3.0/4.0, LGPL-LR y GNU GPL 3.0) |
| Formato de pesos | ZIP por modelo (`models/<model>.zip`) y embeddings fastText `.ftz` |

## Arquitectura y entrenamiento

Cada modelo de la coleccion es un componente especializado entrenado de forma independiente: tokenizadores, expansores de tokens multi-palabra, etiquetadores POS y morfologicos, lematizadores y analizadores de dependencias. Todos se apoyan en embeddings fastText entrenados sobre el corpus C4, lo que proporciona representaciones subword utiles para morfologia rica y lenguas con alfabetos no latinos. Los hiperparametros de cada componente se optimizaron con Optuna, con un criterio explicito de equilibrio entre precision y velocidad.

El entrenamiento se realizo sobre Universal Dependencies 2.18. Para cada idioma se ofrece un modelo "MERGE" entrenado sobre la union de todos sus treebanks, que es el recomendado para texto general, y modelos especificos de treebank que conservan el etiquetador y el parser (a veces el tokenizador) de un treebank concreto cuando superan al modelo MERGE en su conjunto de desarrollo. Estos modelos especificos deben usarse solo con texto del mismo genero que el treebank de origen (ficcion, noticias, legal, redes sociales, poesia, etc.). No se documenta en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, ya que no se trata de modelos generativos.

## Capacidades

- Tokenizacion y expansion de tokens multi-palabra para 47 idiomas.
- Etiquetado POS (part-of-speech) y morfologico.
- Lematizacion.
- Analisis de dependencias sintacticas (dependency parsing).
- Cobertura de 68 modelos en 47 idiomas, con variantes por treebank y por genero textual.
- Modelos MERGE por idioma para texto general y modelos especificos para dominios concretos.
- Integracion con el paquete Python `aymara` y con LIMA mediante `lima_models.py`.
- No incluye generacion de texto, tool calling, agentes ni capacidades multimodales.

## Casos de uso

- Preprocesamiento linguistico en pipelines de PLN: tokenizacion, lematizacion y etiquetado POS como pasos previos a tareas de extraccion de informacion, busqueda o clasificacion, usando el modelo MERGE del idioma correspondiente.
- Analisis sintactico de dependencias en investigacion linguistica: el parser permite obtener arboles de dependencias sobre corpus multilingues, util para estudios tipologicos y comparativos entre las 47 lenguas cubiertas.
- Construccion de corpus anotados: el etiquetador morfologico y el lematizador permiten enriquecer corpus propios con anotacion UD coherente con el estandar Universal Dependencies 2.18.
- Procesamiento de texto historico o de dominio especifico: los modelos por treebank (por ejemplo, UD_French-ALTS para frances medio o UD_Italian-Old para poesia) permiten analizar textos de generos concretos con componentes ajustados a ese dominio.
- Analisis de redes sociales y texto informal: variantes como UD_Italian-PoSTWITA o UD_English-EWT estan entrenadas sobre generos como social, blog o reviews, adecuadas para contenido no normativo.
- Ensenanza de lenguas y herramientas didacticas: el etiquetado gramatical y el parsing permiten generar analisis gramaticales automaticos para estudiantes de las lenguas cubiertas.
- Indexacion y busqueda multilingue: la lematizacion y la tokenizacion mejoran la normalizacion de terminos en motores de busqueda para los 47 idiomas soportados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al tratarse de modelos especializados sobre embeddings fastText y no de transformers generativos, el consumo es muy inferior al de un LLM; los embeddings `.ftz` y los modelos por tarea son ligeros en comparacion con modelos generativos.
- GPU recomendadas: no disponible en la informacion proporcionada. La inferencia de este tipo de componentes suele poder ejecutarse en CPU.
- Cabe en GPU consumer: previsiblemente si, dado el caracter ligero de los componentes, aunque no se documenta en la informacion disponible.
- Opciones de despliegue: paquete Python `aymara` (comando `lima_models`) y LIMA (`lima_models.py`); instalacion manual descomprimiendo `models/<model>.zip` en un directorio de recursos de LIMA (`~/.local/share/lima/resources` por defecto) y copiando los embeddings listados en `models.json` al subdirectorio `embd/`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|
| LIMA DeepLima v0.3.0 | Tokenizacion, POS, lematizacion, parsing UD | 47 | per-treebank (CC BY, CC BY-SA, CC BY-NC-SA, LGPL-LR, GPL 3.0) | Hugging Face y paquete `aymara` |
| Stanza (Stanford) | Tokenizacion, POS, lematizacion, parsing UD | Decenas de idiomas | Apache 2.0 | GitHub y pip |
| spaCy | Tokenizacion, POS, lematizacion, parsing | Decenas de idiomas | MIT | pip |
| UDPipe | Tokenizacion, POS, lematizacion, parsing UD | Decenas de idiomas | MPL 2.0 | GitHub y API |

No se dispone de datos de rendimiento comparativo en la informacion proporcionada; la comparativa se limita a tipo de tarea, cobertura idiomatica, licencia y forma de distribucion.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso.
- La licencia es "per-treebank": cada modelo hereda la licencia del treebank de origen, e incluye variantes no comerciales (CC BY-NC-SA) y GPL 3.0 en algunos idiomas. Es imprescindible revisar la licencia del modelo concreto antes de un uso comercial.
- Los modelos especificos de treebank solo deben usarse con texto del mismo genero que su treebank de origen; usarlos fuera de ese dominio puede degradar la precision.
- Riesgo de errores en textos muy alejados del dominio de entrenamiento (genero, epoca o registro no representados en Universal Dependencies 2.18).
- La cobertura de 47 idiomas no es uniforme: algunos idiomas solo tienen tokenizador (por ejemplo, bengali) y otros carecen de lematizador (por ejemplo, maltes).
- Posibles sesgos heredados de los corpus de Universal Dependencies y de los embeddings fastText entrenados sobre C4.
- No se documentan en la informacion disponible metricas de precision, sesgos especificos ni limitaciones de longitud de entrada.

## Enlaces

- Hugging Face: https://huggingface.co/aymaralima/deeplima
- Repositorio LIMA: https://github.com/aymara/lima
- Paquete Python aymara: https://pypi.org/project/aymara/
- Universal Dependencies: https://universal-dependencies.org/
- Licencias del modelo: https://huggingface.co/aymaralima/deeplima#licenses
