# kardosdrur/senstopic_dynaword

## Resumen

kardosdrur/senstopic_dynaword es un modelo de tópicos (topic modelling) entrenado con la librería Python Turftopic y publicado en HuggingFace por el usuario kardosdrur. No es un modelo generativo de lenguaje, sino un artefacto de clasificación/análisis temático: recibe documentos de texto y devuelve una distribución de temas latentes, con la posibilidad de inspeccionar las palabras más representativas de cada tópico mediante `model.print_topics()`. El repositorio ocupa 0,5 GB y el pipeline declarado es `text-classification`.

Técnicamente se trata de una instancia `SensTopic` que combina un vectorizador de bolsa de palabras (`CountVectorizer` con `min_df=10` y `stop_words='english'`) con un encoder de embeddings de 300 dimensiones identificado como `kardosdrur/handsker-pretrained-300d`, y un parámetro `sparsity=5.0`. La semilla está fijada en 42 y el encoder se ejecuta con `batch_size=32`. Los pesos se distribuyen en formato joblib.

El vocabulario y los tópicos descubiertos (por ejemplo `lokalplan`, `miljøvurdering`, `sundhedsforvaltningen`, `byrådsmødet`, `dannebrog`, `kjøbmand`) muestran un corpus claramente danés, mezclando documentación municipal y administrativa moderna con textos históricos y literarios. El modelo no declara licencia, idiomas soportados ni resultados de benchmarks, y cuenta con cero descargas y cero "likes" en el momento de la consulta, por lo que debe considerarse un artefacto experimental sin validación externa publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SensTopic (modelo de tópicos de Turftopic) sobre encoder de embeddings `kardosdrur/handsker-pretrained-300d` (300 dimensiones) y `CountVectorizer` |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no aplica: el modelo vectoriza documentos completos, no gestiona una ventana de contexto generativa) |
| Tipos de cuantizacion | no disponible (no aplica: no es un modelo de pesos neuronales generativos) |
| Idiomas soportados | no disponible (el vocabulario y los tópicos son predominantemente daneses, con presencia de términos noruegos y alemanes en los textos históricos) |
| Licencia | no disponible |
| Formato de pesos | joblib |

## Arquitectura y entrenamiento

SensTopic es una técnica de modelado de tópicos implementada en la librería Turftopic. En esta configuración concreta, el modelo combina dos componentes: un vectorizador `CountVectorizer` (con `min_df=10`, lista de stopwords en inglés y un vocabulario explícito incrustado en el artefacto) y un encoder neuronal que proyecta los documentos a un espacio de 300 dimensiones (`kardosdrur/handsker-pretrained-300d`). El hiperparámetro `sparsity=5.0` controla la dispersión de las representaciones temáticas, y `random_state=42` fija la reproducibilidad del entrenamiento.

No se especifica en la model card el número de tokens de entrenamiento, la composición exacta del corpus, ni si se aplicaron etapas de ajuste adicionales. El nombre del repositorio (`dynaword`) y el vocabulario de los tópicos apuntan a un corpus de origen danés que combina documentación administrativa municipal (planes urbanísticos, actas de comités, respuestas a consultas públicas) con textos históricos y literarios. La presencia de stopwords en inglés sobre un corpus en danés es una decisión de preprocesado discutible que se comenta en la sección de limitaciones.

## Capacidades

- Inferencia de temas latentes sobre colecciones de documentos de texto.
- Asignación de documentos a tópicos con distribución de pertenencia.
- Inspección de las palabras más representativas de cada tópico (`print_topics()`).
- Carga y reutilización del artefacto entrenado vía `turftopic.load_model`.
- Reproducibilidad garantizada por semilla fija (`random_state=42`).
- No dispone de generación de texto, razonamiento, código, matemáticas ni visión.
- No soporta tool calling, function calling ni flujos de agentes.
- No tiene modo "thinking" ni capacidades multimodales.
- El soporte multilingüe no está declarado; los tópicos resultantes están dominados por el danés.

## Casos de uso

- Análisis exploratorio de corpus documentales: cargar el modelo con `load_model` y ejecutar `print_topics()` para obtener un mapa temático inicial de una colección heterogénea de documentos, útil antes de definir un esquema de etiquetado manual.
- Catalogación y archivística: agrupar expedientes heterogéneos (actas, planes, correspondencia) en familias temáticas para priorizar la revisión humana; los tópicos detectados, como el administrativo (`lokalplan`, `miljøudvalget`, `vvm`) o el sanitario (`sygehus`, `rehabilitación`), facilitan este triaje.
- Investigación en humanidades digitales: estudiar la evolución de vocabulario histórico-literario danés (tópicos con `digt`, `skrifter`, `forfatteren`, `dannebrog`) sobre corpus digitalizados.
- Enrutamiento de consultas ciudadanas: clasificar comunicaciones entrantes (correo postal, fax, correo electrónico, CVR) por temática para dirigirlas al departamento correspondiente; el tópico con `fax`, `link`, `https`, `cvr` resulta directamente aplicable.
- Análisis de procesos de participación pública: distinguir `høringssvar` (respuestas a consultas), `dialogmøde` y `lokalplan` para cuantificar la tipología de la participación ciudadana en un expediente urbanístico.
- Segmentación de correspondencia administrativa: separar comunicaciones de aprobación/denegación (`bevilge`, `afslag`, `indsigelse`) del resto del flujo documental.
- Detección de temas de salud pública: aislar documentos relativos a `sundhedsforvaltningen`, `rehabilitación` y `sygehus` dentro de un archivo administrativo mixto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Además, al tratarse de un modelo de tópicos y no de un modelo generativo, métricas habituales como MMLU, HumanEval o GSM8K no son aplicables. Tampoco se proporcionan métricas propias del ámbito (coherencia de tópicos, diversidad, perplejidad) ni el número de documentos del corpus de entrenamiento.

## Requisitos de hardware

- VRAM para inferencia: no aplica en sentido estricto; el artefacto ocupa 0,5 GB en disco y la inferencia es de tipo encoder ligero sobre embeddings de 300 dimensiones.
- GPU recomendadas: ninguna específica; el modelo está pensado para ejecutarse en CPU.
- Compatibilidad con GPU de consumo: sí, cualquier equipo con suficiente memoria RAM para cargar el artefacto de 0,5 GB; una GPU de consumo es innecesaria.
- Opciones de despliegue: Python con la librería Turftopic y `joblib` para deserializar el modelo. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponible. El encoder se ejecuta con `batch_size=32`, pero no se publican mediciones de velocidad.

## Comparativa con modelos similares

La información proporcionada no incluye métricas de otros modelos, por lo que la comparación cuantitativa no está disponible. A continuación se ofrece una comparación cualitativa por familia de enfoque, marcando como "no disponible" todo dato no verificable con el material recibido:

| Modelo / enfoque | Familia | Encoder | Licencia | Disponibilidad |
|---|---|---|---|---|
| senstopic_dynaword | SensTopic (Turftopic) | `handsker-pretrained-300d` (300 dim.) | no disponible | HuggingFace, 0 descargas |
| BERTopic | Modelado de tópicos neuronal | no disponible | no disponible | Librería independiente |
| Top2Vec | Modelado de tópicos neuronal | no disponible | no disponible | Librería independiente |
| KeyNMF | Modelado de tópicos (Turftopic) | no disponible | no disponible | Misma librería |

Nota: no se dispone de datos de parámetros, contexto ni rendimiento de estas alternativas en la información consultada; cualquier cifra concreta debería verificarse en las fuentes originales.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican términos de uso, por lo que el uso comercial queda en una situación jurídica indeterminada hasta que el autor lo aclare.
- Ausencia total de validación externa: cero descargas y cero "likes" en el momento de la consulta; no hay evidencia de que los tópicos sean estables o generalizables.
- Idiomas no declarados: aunque el vocabulario es mayoritariamente danés, la ficha no especifica la cobertura lingüística y los tópicos mezclan danés moderno, danés histórico y términos alemanes y noruegos.
- Preprocesado inadecuado para el corpus: el `CountVectorizer` usa `stop_words='english'` sobre un corpus en danés, por lo que no se eliminan las palabras funcionales danesas, lo que puede degradar la calidad de los tópicos.
- Corpus muy heterogéneo: los temas detectados abarcan desde actas municipales hasta literatura histórica, lo que puede producir tópicos poco cohesionados en aplicaciones sobre dominios específicos.
- Riesgo de tópicos espurios: varios grupos de palabras parecen mezclar términos sin relación semántica clara (por ejemplo, listas de números y códigos postales), lo que sugiere artefactos de vocabulario.
- Metadatos temporales anómalos: la fecha de creación indicada es 2026-09-14, posterior a la fecha de consulta, lo que conviene verificar antes de citar el modelo.
- Tamaño del repositorio elevado (0,5 GB) para un modelo de tópicos, principalmente por el vocabulario y el encoder de embeddings.
- No es un modelo generativo: no puede usarse para redactar, resumir, traducir ni razonar; cualquier expectativa en ese sentido es un error de categoría.
- No hay garantía de reproducibilidad más allá de la semilla `random_state=42`; la model card no documenta versiones exactas de dependencias.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/kardosdrur/senstopic_dynaword
- Encoder referenciado: https://huggingface.co/kardosdrur/handsker-pretrained-300d
- Librería Turftopic (GitHub): https://github.com/x-tabdeveloping/turftopic
- Nota: la búsqueda web realizada no devolvió resultados relevantes sobre este modelo; los enlaces obtenidos correspondían a foros y descargas de software sin relación con el artefacto.
