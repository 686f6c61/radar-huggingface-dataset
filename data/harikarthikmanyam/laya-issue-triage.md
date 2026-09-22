# harikarthikmanyam/laya-issue-triage

## Resumen

laya-issue-triage es un modelo de clasificación de texto derivado de Laya, un modelo de decisiones tipadas no autorregresivo desarrollado sobre la familia ModernBERT. Lo publica harikarthikmanyam como un ajuste fino del checkpoint base `convaiinnovations/laya`, y su única tarea es el triaje automático de issues de GitHub: en una sola pasada hacia delante, sin generar texto, responde dos preguntas tipadas sobre el issue, el tipo (`bug`, `feature`, `question`, `docs`) y si hace falta pedir más información al autor (`true`/`false`).

El interés práctico del modelo está en su coste de operación: con 421 millones de parámetros y un repo de 0,8 GB, se ejecuta en CPU dentro de una GitHub Action, con una latencia mediana de 78,8 ms por issue en una GPU T4 durante la evaluación. Frente a aproximaciones basadas en LLM generativos con llamadas a API, elimina la factura por token y convierte el triaje en un paso determinista y local del flujo de trabajo del repositorio.

Los números declarados por el autor provienen de una evaluación de generalización sobre 3868 issues de tres repositorios excluidos por completo del entrenamiento (`huggingface/transformers`, `facebook/react`, `microsoft/TypeScript`): 0,650 de accuracy en `issue_type` con 0,627 de macro-F1, y 0,734 de accuracy en `needs_more_info`. El modelo solo está evaluado en triaje de issues y no se ha ejecutado sobre el benchmark `LocalLLaMA/typed-decisions`, por lo que sus cifras no son comparables con las publicadas para los checkpoints base de Laya.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autorregresivo con cabecera de decisiones tipadas; linaje ModernBERT segun los tags del repositorio |
| Parametros totales | 421.293.830 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible; el texto del issue se trunca a aproximadamente 900 caracteres en entrenamiento y evaluacion |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles unicamente (texto de issues); el autor recomienda `laya-multilingual` como base para otros idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un encoder transformer no autorregenerativo: no produce texto libre, sino que resuelve preguntas tipadas en una única pasada. Las dos preguntas del contrato son `issue_type`, de tipo `choice` con cuatro respuestas posibles (`bug`, `feature`, `question`, `docs`), y `needs_more_info`, de tipo `noul` con salida booleana. Esta formulación como decisión tipada es lo que permite prescindir de decodificación y mantener la latencia baja: 78,8 ms por issue de mediana en una T4.

El ajuste fino se hizo sobre aproximadamente 7700 issues cerrados con etiquetas aplicadas por mantenedores, recolectados de 14 repositorios públicos y balanceados entre las cuatro clases. Las etiquetas proceden del triaje humano real de cada proyecto, no de un modelo profesor. La evaluación se realizó sobre 3868 issues de tres repositorios mantenidos íntegramente fuera del entrenamiento. El autor no detalla en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; dado que es una tarea discriminativa, el ajuste es de tipo supervisado.

Un detalle relevante de diseño es que las cadenas de `instructions` y `criteria` forman parte del contrato del modelo: fue entrenado contra esos textos exactos, de modo que modificarlos altera el comportamiento. Esto implica que el prompt no es intercambiable y debe versionarse junto al modelo.

## Capacidades

- Clasificacion de tipo de issue: asigna una de cuatro etiquetas (`bug`, `feature`, `question`, `docs`) a partir del titulo y el cuerpo del issue.
- Decision booleana de informacion faltante: determina si un mantenedor debe solicitar pasos de reproduccion, version, logs o un ejemplo de codigo antes de trabajar en el issue.
- Inferencia no generativa en una sola pasada: no hay decodificacion token a token ni texto libre, lo que reduce latencia y variabilidad.
- Respuestas tipadas: la salida es una eleccion cerrada mas un valor booleano, adecuada para consumirse programaticamente sin parseo de lenguaje natural.
- Capacidad discriminativa, no generativa: no redacta respuestas al usuario, no resume issues ni mantiene conversaciones.
- Multilingue: no soportado. El autor indica explicitamente que solo maneja texto de issues en ingles.
- Tool calling y agentes: no disponible; el modelo no expone function calling ni razonamiento multi-paso.
- Vision y audio: no soportado.

## Casos de uso

- Triaje automatico en GitHub Actions: el modelo se ejecuta en CPU dentro del propio flujo de CI del repositorio y etiqueta cada issue nuevo al abrirse, sin coste de API ni dependencia de servicios externos, gracias a sus 421 M de parametros y a una latencia de decimas de segundo.
- Enrutado de issues al equipo correcto: asignar `bug` frente a `feature` frente a `docs` permite dirigir automaticamente cada issue al equipo o al proyecto correspondiente, usando la clasificacion como regla de asignacion.
- Deteccion de issues incompletos: la etiqueta `needs_more_info` puede disparar un comentario automatico de plantilla pidiendo reproduccion o version, reduciendo el ciclo de ida y vuelta antes de que un mantenedor intervenga.
- Limpieza retrospectiva de backlogs: procesar por lotes issues antiguos sin etiquetar para reclasificarlos, a razon de decenas de miles de issues al dia en hardware modesto.
- Metricas de salud del proyecto: agregar los tipos predichos por repositorio o por periodo para medir la proporcion de bugs frente a peticiones de funcionalidad y detectar picos de regresiones.
- Filtrado previo en sistemas RAG o de busqueda interna: usar la etiqueta de tipo como metadato para indexar issues y mejorar la recuperacion en asistentes de soporte al desarrollador.
- Moderacion de colas de soporte en proyectos open source con mantenimiento voluntario: priorizar issues con informacion suficiente y aparcar los que requieren aclaraciones, dado que `needs_more_info` alcanza 0,734 de accuracy.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente) sobre 3868 issues de tres repositorios excluidos del entrenamiento:

| Modelo | issue_type acc | issue_type macro-F1 | needs_info acc |
|---|---|---|---|
| Aleatorio | 0,250 | no disponible | 0,500 |
| Clase mayoritaria | 0,345 | no disponible | 0,738 |
| `laya` base, zero-shot | 0,626 | 0,524 | 0,563 |
| **laya-issue-triage** | **0,650** | **0,627** | **0,734** |

F1 por clase en `issue_type`:

| Clase | F1 |
|---|---|
| `bug` | 0,641 |
| `feature` | 0,796 |
| `question` | 0,487 |
| `docs` | 0,585 |

Accuracy por repositorio en `issue_type`:

| Repositorio | Accuracy | n |
|---|---|---|
| `facebook/react` | 0,724 | 908 |
| `huggingface/transformers` | 0,753 | 632 |
| `microsoft/TypeScript` | 0,551 | 1329 |

El model-index del repositorio declara accuracy 0,6501 y macro-F1 0,6273, ambos marcados como no verificados. Como referencia de latencia, la mediana medida en una T4 durante la evaluacion fue de 78,8 ms por issue.

Alcance de estas cifras: la evaluacion cubre exclusivamente el triaje de issues de GitHub. El modelo no se ha ejecutado sobre el benchmark `LocalLLaMA/typed-decisions`, de modo que sus resultados no son comparables con los publicados allí para los checkpoints base de Laya ni para otros sistemas, al tratarse de otra tarea, otro espacio de etiquetas y otros datos.

## Requisitos de hardware

- VRAM estimada: alrededor de 1,7 GB de pesos en fp32 (421 M de parametros) y unos 0,85 GB en fp16; con activaciones para entradas de ~900 caracteres, el consumo total en fp16 se mantiene por debajo de 2 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM es suficiente; el autor reporta mediciones en una NVIDIA T4, y tarjetas como RTX 3060, RTX 4090, A100 o H100 quedan sobradamente dimensionadas para esta carga.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo de los ultimos anos, e incluso en CPU. El repositorio asociado describe ejecucion en CPU dentro de una GitHub Action.
- Opciones de despliegue: libreria `laya` (el ejemplo de la model card usa `laya.Agent`), servicio propio con PyTorch o Transformers, y ejecucion en contenedores de CI como GitHub Actions. No se documentan pesos GGUF ni integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo discriminativo y no generativo, esas rutas no aplican de forma estandar.
- Latencia y throughput: 78,8 ms de mediana por issue en una T4, medido durante la evaluacion. No se publican cifras de throughput en CPU ni en otras GPU.

## Comparativa con modelos similares

Solo se dispone de comparaciones publicadas por el propio autor frente al checkpoint base y frente a lineas base triviales. No hay datos comparativos con otros clasificadores ajustados de tamano similar.

| Modelo | Parametros | Contexto | issue_type acc | issue_type macro-F1 | needs_info acc | Licencia |
|---|---|---|---|---|---|---|
| laya-issue-triage | 421 M | no disponible (truncado a ~900 caracteres) | 0,650 | 0,627 | 0,734 | Apache-2.0 |
| `laya` base, zero-shot | no disponible | no disponible | 0,626 | 0,524 | 0,563 | no disponible |
| Clase mayoritaria | no aplica | no aplica | 0,345 | no disponible | 0,738 | no aplica |
| Aleatorio | no aplica | no aplica | 0,250 | no disponible | 0,500 | no aplica |

La mejora frente al checkpoint base es de 2,4 puntos de accuracy y 10,3 puntos de macro-F1 en `issue_type`, y de 17,1 puntos de accuracy en `needs_more_info`. En `needs_more_info`, la clase mayoritaria alcanza 0,734 de accuracy, practicamente identica a la del modelo, lo que indica que esa señal aporta poco valor sobre un clasificador trivial. En cuanto a alternativas de la misma categoria (encoders ajustados para clasificacion de issues), no se han publicado comparaciones en la informacion disponible.

## Limitaciones y advertencias

- Idioma: solo texto de issues en ingles. Para otros idiomas el propio autor recomienda partir de `laya-multilingual`.
- Truncacion agresiva: el texto se recorta a unos 900 caracteres, por lo que la decision se basa en el titulo y los primeros parrafos; issues largos con detalles relevantes al final pueden clasificarse mal.
- `needs_more_info` es una señal debil: se supervisa con etiquetas de mantenedor como `needs-repro`, que cada proyecto aplica de forma inconsistente, y su accuracy practicamente iguala a la de predecir siempre la clase mayoritaria.
- Confianzas sin calibrar: las probabilidades no estan calibradas salvo que se ajusten temperaturas con el cuaderno indicado por el autor, por lo que no deben usarse umbrales directos en produccion.
- Acoplamiento al contrato de preguntas: los textos de `instructions` y `criteria` forman parte del contrato de entrenamiento; cambiarlos modifica el comportamiento del modelo. Cualquier despliegue debe versionar esas cadenas.
- Clase `question` con peor rendimiento: F1 de 0,487, la mas baja de las cuatro, y accuracy de 0,551 en `microsoft/TypeScript` frente a 0,753 en `huggingface/transformers`, lo que sugiere sensibilidad al estilo del proyecto.
- Evaluacion limitada y no verificada de forma independiente: las metricas provienen del model-index del autor con `verified: false`, cubren una unica tarea y no son comparables con los resultados del benchmark `LocalLLaMA/typed-decisions`.
- Riesgo de alucinacion no aplica en el sentido generativo, ya que el modelo no produce texto libre; el riesgo equivalente es de clasificacion erronea silenciosa, sin justificacion textual.
- Licencia Apache-2.0: permite uso comercial y modificacion con obligacion de conservar avisos de copyright y licencia. No se especifica la licencia del checkpoint base `convaiinnovations/laya`, que conviene revisar antes de un despliegue comercial.
- Adopcion nula: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre estos resultados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/harikarthikmanyam/laya-issue-triage
- Repositorio de la tarea, dataset y script de evaluacion: https://github.com/manyamkarthik/laya-issue-triage
- Repositorio del framework Laya: https://github.com/NandhaKishorM/laya
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Dataset de evaluacion: https://huggingface.co/datasets/manyamkarthik/laya-issue-triage
- Benchmark `LocalLLaMA/typed-decisions`: no disponible en los resultados de busqueda proporcionados
