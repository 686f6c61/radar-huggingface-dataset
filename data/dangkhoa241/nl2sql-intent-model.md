# dangkhoa241/nl2sql-intent-model

## Resumen

El modelo `dangkhoa241/nl2sql-intent-model` es un clasificador de texto encoder-only obtenido por ajuste fino de `google-bert/bert-base-uncased`. Lo desarrolla el usuario de HuggingFace dangkhoa241 y su funcion es etiquetar una pregunta de negocio formulada en lenguaje natural con el tipo de consulta SQL que necesita: `aggregate`, `compare`, `count`, `filter` o `trend`. No genera SQL; actua como enrutador de intencion dentro de un sistema mayor de traduccion de lenguaje natural a SQL asistido por RAG.

El problema que resuelve es el de la desambiguacion previa en pipelines de analitica conversacional. Antes de construir la consulta, el sistema necesita saber si el usuario pide una agregacion, una comparacion entre entidades, un recuento, un filtro o una evolucion temporal. Esta clasificacion condiciona la plantilla SQL y, segun la model card, tambien el tipo de grafico que se muestra.

Es relevante por su perfil de coste: con 109,5 millones de parametros y un repositorio de 0,5 GB, se puede ejecutar en CPU o en cualquier GPU de consumo con latencias de milisegundos, lo que permite usarlo como etapa de enrutado barata antes de invocar un modelo generativo mucho mas caro. Sus cifras declaradas de validacion son de 100,0% sobre un split con la misma plantilla que el entrenamiento, 84,7% sobre 150 preguntas dificiles escritas a mano y 75% sobre un dominio SaaS no visto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (BERT), ajuste fino de `google-bert/bert-base-uncased` |
| Parametros totales | 109.486.085 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 512 tokens (maximo posicional de `bert-base-uncased`; no confirmado explicitamente en la model card) |
| Tipos de cuantizacion | no documentados para este ajuste; el repositorio incluye pesos ONNX y safetensors |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors, ONNX |
| Tarea (pipeline) | text-classification |
| Numero de clases | 5 (`aggregate`, `compare`, `count`, `filter`, `trend`) |
| Tamano del repositorio | 0,5 GB |
| Libreria | transformers |
| Compatibilidad | endpoints_compatible, text-embeddings-inference |

## Arquitectura y entrenamiento

La arquitectura es la de `bert-base-uncased`: un transformer encoder-only de 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, con vocabulario WordPiece en minusculas, sobre el que se anade una cabeza de clasificacion de secuencia con 5 salidas. El ajuste se realizo sobre la tarea de clasificacion de intencion, no sobre generacion, por lo que el modelo no produce SQL en ningun caso.

Los datos de entrenamiento proceden del fichero `data/intent_dataset.csv` del repositorio del propio autor: 1.000 de las 2.000 preguntas "domain-neutral" (400 por intencion, 14 dominios) se usaron para entrenar y las otras 1.000 como split de validacion. La model card no documenta el numero de tokens procesados, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (poco habituales en un clasificador de este tamano). Tampoco se detalla la configuracion de hiperparametros, el numero de epocas ni el esquema de decodificacion.

El dato tecnico mas relevante que reporta el autor es metodologico: el 100,0% de exactitud en validacion se obtiene sobre un split generado con las mismas plantillas que el entrenamiento, por lo que el propio autor advierte que esa cifra dice poco sobre la capacidad de generalizacion. Las metricas mas informativas son el 84,7% en 150 preguntas dificiles escritas manualmente y el 75% en preguntas de un dominio SaaS no visto durante el entrenamiento.

## Capacidades

- Clasificacion de intencion en 5 categorias cerradas: `aggregate`, `compare`, `count`, `filter`, `trend`.
- Clasificacion de secuencia corta en ingles, orientada a preguntas de negocio y analitica de datos.
- Enrutado dentro de un sistema NL→SQL asistido por RAG, como primera etapa de decision.
- Seleccion del tipo de grafico asociado a la consulta, segun indica la model card.
- Inferencia rapida en CPU y GPU para lotes de preguntas, dado el tamano del modelo.
- Exportacion a ONNX para despliegue en entornos sin PyTorch.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente autonomo.
- No genera texto, SQL ni explicaciones: solo devuelve etiquetas con su puntuacion.
- No tiene capacidades multimodales (vision, audio) ni modo de razonamiento explicito.
- Multilingue: no. Solo se declara ingles (`en`).

## Casos de uso

- Enrutado previo en un pipeline NL→SQL: la pregunta del usuario se clasifica primero con este modelo y la etiqueta resultante determina que plantilla o que rama del generador SQL se activa, evitando invocar un modelo grande cuando la intencion es trivial.
- Seleccion automatica de visualizacion en cuadros de mando: la etiqueta `trend` puede mapearse a una grafica de lineas y `compare` a barras agrupadas, de modo que el dashboard elige el grafico sin intervencion del usuario.
- Reduccion de coste en asistentes de datos con LLM: al resolver la intencion con 109,5 millones de parametros, se reserva la llamada al modelo generativo solo para la construccion efectiva de la consulta, reduciendo tokens de entrada y latencia por consulta.
- Filtrado temprano de consultas fuera de alcance: si la pregunta no encaja de forma clara en ninguna de las 5 clases, el sistema puede pedir aclaracion al usuario en lugar de generar SQL incorrecto.
- Etiquetado de logs de preguntas de negocio: se pueden clasificar por lotes miles de preguntas historicas de usuarios para analizar que tipos de analisis se demandan mas y priorizar el desarrollo de plantillas.
- Enrutado en asistentes conversacionales de analitica multi-turno: en cada turno se reclasifica la intencion para decidir si el usuario esta refinando un filtro, pidiendo un recuento o cambiando a una comparacion.
- Generacion de weak labels para entrenar modelos mayores: las etiquetas producidas sobre un corpus sin anotar pueden usarse como supervision inicial para un clasificador de mayor tamano o para ajustar un enrutador especifico de dominio.
- Control de calidad en un sistema RAG de datos: la intencion clasificada permite validar que los fragmentos recuperados (esquemas de tablas, ejemplos SQL) corresponden al tipo de operacion solicitada.

## Benchmarks y rendimiento

Datos reportados en la model card del autor:

| Evaluacion | Tamano | Exactitud |
|---|---|---|
| Split de validacion (mismas plantillas que entrenamiento) | 1.000 preguntas | 100,0% |
| Preguntas dificiles escritas a mano | 150 preguntas | 84,7% |
| Dominio SaaS no visto | no especificado | 75,0% |

No se han publicado en la informacion disponible resultados en benchmarks estandar (MMLU, GLUE, HumanEval, GSM8K u otros), ni comparaciones numericas con modelos alternativos. El autor advierte explicitamente que la cifra de 100,0% en validacion es poco representativa por el sesgo de plantilla del split.

## Requisitos de hardware

- VRAM en fp32: aproximadamente 0,44 GB de pesos mas activaciones; cabe sobradamente en cualquier GPU con 4 GB o mas.
- VRAM en int8 (si se cuantiza fuera del repositorio): en torno a 0,11 GB de pesos.
- Gama de consumo: funciona en RTX 3060, RTX 4090 y cualquier GPU integrada moderna; tambien en CPU sin GPU dedicada.
- GPU de centro de datos (A100, H100): no son necesarias; solo tendrian sentido para servir lotes masivos en paralelo.
- Despliegue: pipeline de `transformers` (como muestra la model card), ONNX Runtime para el export ONNX incluido, y servidores compatibles con `endpoints_compatible` y `text-embeddings-inference`.
- Latencia y throughput: no disponibles. Con 109,5 millones de parametros y secuencias cortas, se espera latencia de milisegundos por peticion en GPU y de decenas de milisegundos en CPU, pero no hay cifras publicadas por el autor.
- Memoria de disco: 0,5 GB para el repositorio completo.

## Comparativa con modelos similares

No se dispone de resultados comparativos publicados entre este modelo y alternativas de la misma categoria. La tabla recoge unicamente caracteristicas estructurales verificables:

| Modelo | Parametros | Contexto | Tarea | Licencia | Rendimiento comparado |
|---|---|---|---|---|---|
| `dangkhoa241/nl2sql-intent-model` | 109,5 M | 512 tokens | Clasificacion de intencion NL→SQL (5 clases) | no disponible | 84,7% en preguntas dificiles escritas a mano; 75% en dominio SaaS no visto |
| `google-bert/bert-base-uncased` (modelo base) | 110 M | 512 tokens | Modelo de lenguaje enmascarado / ajuste a tareas | Apache 2.0 | no disponible (no es un clasificador de intencion) |
| `distilbert-base-uncased` | 66 M | 512 tokens | Ajuste a clasificacion | Apache 2.0 | no disponible |
| `roberta-base` | 125 M | 512 tokens | Ajuste a clasificacion | MIT | no disponible |

Para la tarea concreta de enrutado de intencion NL→SQL no se han encontrado en la informacion disponible alternativas publicas directamente comparables en cuanto a metricas.

## Limitaciones y advertencias

- Sobreajuste al formato de entrenamiento: el 100,0% en validacion se obtiene sobre un split generado con las mismas plantillas que el entrenamiento; la caida al 84,7% en preguntas manuales y al 75% en un dominio no visto indica una generalizacion limitada.
- Rendimiento degradado fuera de dominio: sin acceso al conjunto de entrenamiento, no se puede estimar el comportamiento en dominios distintos de los 14 cubiertos ni en jerga especifica de sector.
- Taxonomia cerrada de 5 clases: cualquier pregunta que no encaje en `aggregate`, `compare`, `count`, `filter` o `trend` quedara forzosamente asignada a una de ellas, sin clase de rechazo documentada.
- Solo ingles: no se declara soporte de castellano ni de ningun otro idioma; el uso con texto en espanol no esta validado.
- Contexto limitado a 512 tokens y preprocesado en minusculas propio de `bert-base-uncased`: puede perder informacion relevante en preguntas largas o con identificadores sensibles a mayusculas.
- No genera SQL: es exclusivamente un clasificador; la traduccion a consulta debe hacerla otro componente del sistema.
- Licencia no disponible: la ausencia de licencia explicita impide confirmar si se permite uso comercial. Es un riesgo juridico relevante para produccion; conviene contactar con el autor antes de desplegarlo.
- Trazas de sesgo no evaluadas: no hay analisis de sesgo por dominio, genero, origen ni idioma en la informacion disponible.
- Riesgo de alucinacion no aplicable en el sentido generativo (el modelo no produce texto libre), pero si existe riesgo de clasificacion erronea con alta confianza en preguntas ambiguas.
- Popularidad y soporte comunitario nulos: 0 descargas y 0 "likes" en el momento de la consulta, sin issues ni mantenimiento documentado.
- Artefacto con fecha de creacion registrada como 2026-10-06, posterior a la fecha de elaboracion habitual de fichas tecnicas de este tipo; conviene verificar la vigencia del repositorio.
- No se ha publicado informacion sobre hiperparametros de entrenamiento, semillas ni reproducibilidad, lo que dificulta replicar o auditar el ajuste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dangkhoa241/nl2sql-intent-model
- Repositorio del sistema NL→SQL asistido por RAG: https://github.com/dangkhoa241/RAG-assisted-natural-language-to-SQL-query-system
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased

No se han encontrado en la busqueda web otros enlaces relevantes (papers, blogs, demos o notas de version) asociados a este modelo.
