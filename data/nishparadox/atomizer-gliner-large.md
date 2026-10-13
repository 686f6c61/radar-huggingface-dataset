# nishparadox/atomizer-gliner-large

## Resumen

atomizer-gliner-large es un modelo de etiquetado de tokens (token classification) especializado en descomponer un texto en afirmaciones atomicas autocontenidas y en puntuar cada una de ellas segun dos criterios: si es verificable (`verifiable`) y si merece ser comprobada (`checkworthy`). Lo desarrolla el usuario nishparadox y se apoya en el backbone `gliner-community/gliner_large-v2.5`, un encoder DeBERTa-v3-large con una proyeccion de 1024 a 768 dimensiones, con un total de 456 millones de parametros. No es un modelo generativo: selecciona fragmentos del texto de entrada, resuelve referencias sustituyendo pronombres por menciones anteriores y anade palabras funcionales de clase cerrada.

El modelo es el hermano grande de `atomizer-gliner-small` (163 M), con el que comparte arquitectura, datos, particiones y receta de entrenamiento. Su interes practico esta en pipelines de fact-checking y verificacion automatica: convierte parrafos densos en unidades atomicas comparables contra bases de conocimiento, evitando que un sistema downstrean tenga que razonar sobre texto ambiguo. La version publicada es una candidata de publicacion (`v0.1-rc1`), entrenada con la receta por etapas, y el propio autor recomienda `small v0.4` para uso general: el modelo grande mejora ligeramente la segmentacion, pero duplica la tasa de sustituciones de referencia erroneas.

La relevancia actual viene de su especializacion y de su tamano contenido: al ser un encoder de 456 M, se puede desplegar en una GPU de consumo con una latencia muy inferior a la de un LLM generativo empleado para la misma tarea de atomizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (DeBERTa-v3-large con proyeccion 1024 → 768) y cabezas de clasificacion de spans |
| Parametros totales | 456 M |
| Parametros activos | no aplica, no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | cc-by-4.0 |
| Formato de pesos | no disponible (repositorio de 1,8 GB; se carga mediante la libreria `atomizer`) |

## Arquitectura y entrenamiento

El modelo parte de `gliner-community/gliner_large-v2.5` y se entrena desde cero sobre ese backbone, no desde un checkpoint del modelo pequeno. La arquitectura es la de GLiNER: un encoder DeBERTa-v3-large que produce representaciones de 1024 dimensiones, proyectadas despues a 768, sobre las que se aplican cabezas de clasificacion de spans. La salida no es texto generado, sino un conjunto de spans seleccionados del propio input, mas una cabeza de antecedentes encargada de resolver referencias. Una restriccion de diseno destacable es que un atomo no puede contener nombres ni numeros que no aparezcan en la entrada, lo que limita estructuralmente la invencion de entidades.

El entrenamiento se hizo con la receta por etapas del modelo `small v0.4` en un unico trabajo (`scripts/slurm/recipe.sh`), sobre 2 GPU A100 de 80 GB con paralelismo de datos y batch global identico. Las etapas son: etapa 1, proposiciones de Wikipedia (propositionizer), 3 epocas; etapa 2, datos del critico (ClaimBuster, CheckThat), 1.000 pasos, 1 epoca; etapa 3, datos de chat y sinteticos, 2 epocas; etapa 5, decontextualizacion y Factcheck-Bench, 2 epocas, con la cabeza de antecedentes pudiendo responder "none". Los ritmos de aprendizaje son los del modelo pequeno, sin reajuste para el grande. El checkpoint publicado es el mejor de la etapa 5 sobre validacion (F1 exacto, paso 3.000 de 3.330; W&B `large-v0.1-s5`). Los conjuntos de datos declarados son `nishparadox/atomizer-chat-synthetic`, `chentong00/propositionizer-wiki-data` y `nfliu/decontextualization`.

## Capacidades

- Extraccion de afirmaciones atomicas: divide un texto en unidades cortas y autocontenidas.
- Puntuacion de verificabilidad (`verifiable`): indica si la afirmacion es un hecho comprobable.
- Puntuacion de interes para verificacion (`checkworthy`): indica si merece la pena comprobarla.
- Decontextualizacion: resuelve referencias como "She" por la mencion anterior ("Marie Curie") o las deja tal cual si el referente no aparece en el texto.
- Insercion de palabras funcionales de clase cerrada ("is", "the", "'s") para dar cohesión gramatical al atomo.
- Segmentacion de proposiciones sobre texto tipo Wikipedia (evaluado en proposiciones y PropSegmEnt).
- No genera texto: solo selecciona spans del input.
- Tool calling, function calling, agentes, vision, audio y modo de razonamiento: no disponibles, no son capacidades de este modelo.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Verificacion de afirmaciones en medios: el modelo atomiza un articulo o una transcripcion y entrega afirmaciones autocontenidas listas para consultarse contra bases factuales, con una puntuacion de verificabilidad que permite descartar opiniones antes de gastar consultas.
- Moderacion y priorizacion de contenido: usar `checkworthy` como filtro para enrutar solo las afirmaciones relevantes a un sistema de fact-checking humano o automatico, reduciendo el volumen a revisar.
- Construccion de grafos de conocimiento: convertir documentos en tripletas potenciales a partir de atomos ya decontextualizados, evitando que un extractor posterior tenga que resolver pronombres.
- Resumen factual de conversaciones: en chats y transcripciones, el modelo genera atomos a partir de cada turno (evaluado con soft F1 de 0,991 en el conjunto de chat reservado), utiles para actas o seguimiento de compromisos.
- Preprocesado para sistemas RAG: atomizar los documentos indexados mejora la granularidad de los fragmentos recuperados y reduce el ruido de referencias cruzadas.
- Auditoria de respuestas de LLM: comparar los atomos extraidos de una respuesta generada contra los de las fuentes citadas para detectar afirmaciones no sustentadas.
- Enriquecimiento de datasets de entrenamiento: generar proposiciones etiquetadas con `verifiable` y `checkworthy` para entrenar modelos de fact-checking de mayor tamano.
- Analisis de discurso politico: segmentar intervenciones largas en afirmaciones comprobables y priorizarlas por interes informativo.

## Benchmarks y rendimiento

Resultados publicados por el autor, sobre las mismas particiones que la model card del modelo pequeno:

| Conjunto | Metrica | small v0.4 | large v0.1-rc1 |
|---|---|---|---|
| synthetic (323) | soft F1 | 0,899 | 0,907 |
| chat reservado (500) | soft F1 | 0,985 | 0,991 |
| Factcheck-Bench (30) | soft F1 | 0,759 | 0,761 |
| Decontextualization valid (195) | soft F1 | 0,544 | 0,558 |
| Decontextualization valid (195) | referencias resueltas | 0,582 | 0,595 |
| Decontextualization valid (195) | tasa de referencias erroneas (menor es mejor) | 0,045 | 0,088 |
| propositions (500) | soft F1 | 0,731 | 0,739 |
| PropSegmEnt (500) | soft F1 | 0,737 | 0,758 |
| CheckThat test (318) | checkworthy F1 / AUC | 0,871 / 0,978 | 0,836 / 0,970 |
| fact-assessor claims | verifiable F1 | 1,00 | 1,00 |

El autor senala que las diferencias de aproximadamente 0,01 en estos conjuntos estan dentro del ruido. El AUC de `verifiable` a nivel de atomo de Factcheck-Bench se omite deliberadamente en la evaluacion (small 0,93 frente a large 0,65) porque su conjunto de test solo contiene 6 atomos no verificables, lo que impide separar ambos modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (calculo a partir de los 456 M de parametros, no publicado por el autor): en torno a 1,8 GB en fp32, 0,9 GB en fp16/bf16, 0,5 GB en int8 y 0,25 GB en int4, mas el coste de activaciones segun la longitud de secuencia.
- GPU de entrenamiento documentadas: 2 A100 de 80 GB con paralelismo de datos.
- GPU recomendadas para inferencia: cualquier GPU con 2 GB o mas de VRAM; A100, H100, L40S, RTX 4090, RTX 3090 o incluso GPU integradas de portatil reciente son suficientes para el checkpoint en precision reducida.
- Cabe en GPU de consumo: si, con margen amplio, incluidas RTX 3060, RTX 4060 y similares.
- Opciones de despliegue: la model card solo documenta la carga mediante la libreria `atomizer` (`Atomizer.load(...)`), disponible en el repositorio GitHub del autor, privado y con acceso bajo peticion. Opciones como vLLM, llama.cpp, Ollama o TGI no estan documentadas para este modelo y no aplican a un encoder de clasificacion de spans de la misma forma que a un modelo generativo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Licencia | Disponibilidad | Notas de rendimiento |
|---|---|---|---|---|---|
| atomizer-gliner-large (v0.1-rc1) | 456 M | Atomizacion de afirmaciones y critico | cc-by-4.0 | HuggingFace, libreria `atomizer` bajo peticion | soft F1 0,907 en sintetico; 0,088 de referencias erroneas en Decontextualization |
| atomizer-gliner-small (v0.4) | 163 M | Atomizacion de afirmaciones y critico | no disponible en la informacion | HuggingFace | soft F1 0,899 en sintetico; 0,045 de referencias erroneas; modelo recomendado para uso general por el autor |
| gliner-community/gliner_large-v2.5 | 456 M | Extraccion zero-shot de entidades (NER) | no disponible en la informacion | HuggingFace | Backbone del modelo; no es un atomizador ni incluye cabezas de criticidad |
| chentong00/propositionizer-wiki-data | no disponible | Segmentacion de proposiciones | no disponible en la informacion | HuggingFace (dataset) | Fuente de datos de entrenamiento, no un modelo comparable directamente |

## Limitaciones y advertencias

- Referencias erroneas: aproximadamente 1 de cada 11 sustituciones de referencia en Decontextualization es incorrecta (en el modelo pequeno es 1 de cada 22), lo que penaliza su uso en decontextualizacion automatica sin revision.
- Tamano frente a ganancia: 2,8 veces los parametros del modelo pequeno para mejoras de 0,01 a 0,02 de soft F1. La mitad de los atomos de oro del conjunto de entrenamiento mas grande (propositionizer) son reescrituras que un modelo de spans no puede construir, por lo que un encoder mayor no eleva ese techo.
- Umbral del critico: fijado en 0,5 y sin calibrar, lo que puede desajustar las puntuaciones de `verifiable` y `checkworthy` en dominios distintos al de entrenamiento.
- Riesgo de alucinacion: bajo por diseno en cuanto a entidades, ya que el modelo no puede emitir nombres ni numeros ausentes del input; el riesgo se traslada a sustituciones de referencia incorrectas.
- Sesgos: no documentados de forma especifica, pero los datos de entrenamiento (proposiciones de Wikipedia, ClaimBuster, CheckThat, chat sintetico) tienen sesgo idiomatico y de dominio hacia el ingles y hacia generos concretos.
- Idioma: no se declaran idiomas soportados; los conjuntos de datos citados son mayoritariamente en ingles, por lo que el rendimiento en castellano no esta validado.
- Contexto: la longitud de contexto no esta documentada, lo que impide garantizar el comportamiento con documentos muy largos.
- Estado del artefacto: es una candidata de publicacion (`v0.1-rc1`), no una version estable, y el propio autor recomienda el modelo pequeno `v0.4` para uso general.
- Herramientas: la libreria `atomizer` es privada y requiere solicitud de acceso, lo que complica su integracion en produccion.
- Licencia cc-by-4.0: permite uso comercial con atribucion, pero conviene verificar las condiciones heredadas del backbone `gliner_large-v2.5`, no detalladas en la informacion proporcionada.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nishparadox/atomizer-gliner-large
- Modelo pequeno relacionado: https://huggingface.co/nishparadox/atomizer-gliner-small
- Backbone: https://huggingface.co/gliner-community/gliner_large-v2.5
- Repositorio del codigo (privado, acceso bajo peticion): https://github.com/NISH1001/atomizer
- Dataset de entrenamiento: https://huggingface.co/datasets/nishparadox/atomizer-chat-synthetic
- Dataset de entrenamiento: https://huggingface.co/datasets/chentong00/propositionizer-wiki-data
- Dataset de entrenamiento: https://huggingface.co/datasets/nfliu/decontextualization
