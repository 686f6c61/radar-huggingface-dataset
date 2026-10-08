# nativ-community/GEV-26B-Decide-MLX-MXFP4

## Resumen

GEV-26B-Decide-MLX-MXFP4 es una conversion al formato MLX del modelo multimodal de decision autotrust/GEV-26B-Decide, publicada por el usuario nativ-community. No se trata de un modelo generativo al uso: GEV devuelve una probabilidad para cada opcion de una pregunta (booleana, de eleccion multiple, de puntuacion o de estado JSON) en una sola pasada forward, sin generar texto libre. Esto lo situa en la categoria de los modelos de decision o clasificadores multimodales, utiles como cabezas de enrutamiento o evaluacion dentro de pipelines de agentes.

El repositorio contiene 25.806.003.814 parametros (aproximadamente 25,8 mil millones) cuantizados en MXFP4 con tamano de grupo 32, y ocupa 14,6 GB. La conversion integra el LoRA de "System 1" ya fusionado en los pesos y mantiene la cabeza de decision en float32, un detalle relevante porque preserva la precision de las probabilidades de salida frente a la cuantizacion del backbone. El modelo base declarado es autotrust/GEV-26B-Decide, en la revision `7c89590ead085bf77630b4bf68264ea30b6ddc78`.

Su relevancia actual es doble: por un lado, demuestra que los modelos de decision multimodal pueden ejecutarse en local sobre Apple Silicon mediante mlx-vlm; por otro, expone una limitacion practica de ecosistema, ya que el soporte de GEV todavia no esta en una release publica de mlx-vlm y requiere instalar una rama concreta del fork del autor (`Lazarus-931/mlx-vlm@feat/gev`). El modelo se distribuye bajo licencia Apache 2.0, aunque el numero de descargas y "likes" registrados es de cero, lo que indica que es una publicacion muy reciente y sin validacion comunitaria amplia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo multimodal de decision (pipeline image-text-to-text); arquitectura interna del backbone no especificada en la informacion disponible |
| Parametros totales | 25.806.003.814 (aprox. 25,8 B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MXFP4, 4-bit, group size 32; cabeza de decision en float32 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (formato MLX); repositorio de 14,6 GB |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como una conversion MLX del checkpoint autotrust/GEV-26B-Decide para la libreria mlx-vlm. Se sabe que es un modelo multimodal (procesa imagen y texto, pipeline `image-text-to-text`) y que su funcion es de decision, no de generacion: recibe una entrada y un conjunto de opciones descritas con tipo e instrucciones, y devuelve una distribucion de probabilidad sobre cada opcion en un unico forward pass. La cabeza de decision se ha mantenido en float32 durante la conversion, mientras que el resto del modelo se cuantiza en MXFP4 con tamano de grupo 32.

Respecto al entrenamiento, la model card no aporta datos sobre numero de tokens, composicion del dataset, ni si hubo fases de RLHF o DPO. Lo unico documentado es la existencia de un LoRA de "System 1" que ya viene fusionado en estos pesos. Tampoco se detalla la arquitectura del backbone (transformer denso, MoE, hibrido u otra), por lo que cualquier afirmacion al respecto seria especulativa. La innovacion tecnica destacable de esta publicacion es, por tanto, la propia conversion: cuantizacion MXFP4 del backbone con preservacion en alta precision de la cabeza de decision, y verificacion funcional contra la referencia oficial de transformers + peft.

## Capacidades

- Decision multimodal: devuelve probabilidades para cada opcion de una pregunta, combinando entrada de texto e imagen cuando corresponde.
- Preguntas booleanas: por ejemplo, determinar si un cliente esta pidiendo un reembolso.
- Preguntas de eleccion multiple: seleccion entre varias alternativas etiquetadas.
- Puntuacion (score): asignacion de una puntuacion por opcion, util para ranking o priorizacion.
- Estado JSON: extraccion de un estado estructurado a partir de la entrada.
- Torneos de multiples opciones: la verificacion del autor incluye una prueba con 20 opciones.
- Procesamiento de imagenes: validado con una imagen y con dos imagenes simultaneas.
- No genera texto libre: no dispone de modo conversacional generativo, pese a la etiqueta `conversational` del repositorio.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente multi-paso: no disponibles de forma nativa; el modelo esta pensado como componente de decision dentro de un pipeline mayor.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Clasificacion de tickets de soporte: el modelo responde a preguntas booleanas como "el cliente pide un reembolso?" sobre el texto del ticket, lo que permite enrutar automaticamente cada caso al flujo adecuado sin reglas manuales.
- Enrutamiento de intencion en asistentes conversacionales: dado un turno de usuario y un conjunto de intenciones candidatas, las probabilidades de salida sirven como senal de enrutamiento con umbral configurable.
- Triage multimodal de incidencias: al aceptar imagen y texto, puede evaluar fotografias de producto o de danos junto con la descripcion del cliente para decidir si procede una devolucion.
- Extraccion de estado estructurado en pipelines de agentes: la salida de tipo JSON state permite obtener un estado normalizado que alimente un orquestador o una maquina de estados.
- Ranking y torneos de alternativas: con la cabeza de decision y opciones multiples (el autor valida un torneo de 20 opciones), es utilizable para ordenar candidatos en sistemas de recomendacion o de seleccion de respuestas.
- Puntuacion y priorizacion: la salida de tipo score permite asignar puntuaciones continuas para priorizar colas de trabajo o clasificar riesgo.
- Moderacion con criterios multiples: cada politica se formula como una pregunta booleana independiente y se evaluan en la misma pasada, reduciendo el coste frente a multiples clasificadores separados.
- Verificacion automatizada de calidad: uso del modelo como juez local que evalua criterios objetivos sobre respuestas o documentos, sin enviar datos a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente incluye una verificacion funcional contra la referencia oficial de autotrust (transformers + peft con el LoRA System 1), cuyos datos se reproducen a continuacion:

| Prueba de verificacion | Resultado |
|---|---|
| Misma respuesta que la referencia | 7/7 preguntas (bool, choice, score, estado JSON, torneo de 20 opciones, una imagen, dos imagenes) |
| Identidad de token ids | 9/9 pasadas forward |
| Mayor diferencia de probabilidad observada | 0,146 |

## Requisitos de hardware

- Peso en disco del repositorio: 14,6 GB, coherente con una cuantizacion de 4 bits sobre 25,8 B de parametros mas la cabeza en float32.
- Memoria unificada minima estimada: en torno a 16 GB para cargar los pesos, sin contar el overhead de activaciones e imagen; se recomienda 24-32 GB para trabajar con margen.
- GPU compatibles: MLX esta disenado para Apple Silicon, por lo que el modelo se ejecuta en chips de la serie M. No hay soporte CUDA documentado (A100, H100, RTX 4090 no aplican con esta libreria).
- Cabe en hardware de consumo: si, en equipos Apple Silicon con memoria unificada suficiente (Mac con 24 GB o mas, preferiblemente 32 GB o superior).
- Opciones de despliegue: mlx-vlm, y de forma obligatoria por el momento una rama no publicada del fork `Lazarus-931/mlx-vlm@feat/gev`. No hay soporte documentado en vLLM, llama.cpp, Ollama ni TGI, ni pesos GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

En la informacion disponible no se identifican modelos de decision multimodales comparables. La unica comparacion posible es contra el propio checkpoint de origen:

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/GEV-26B-Decide-MLX-MXFP4 | 25,8 B | MXFP4, group size 32 | safetensors (MLX) | apache-2.0 | Publico en HuggingFace; 0 descargas |
| autotrust/GEV-26B-Decide (modelo base) | no disponible | pesos originales (presumiblemente sin cuantizar) | no disponible | apache-2.0 segun el repositorio derivado | Publico en HuggingFace |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dependencia de un fork no publicado: el soporte GEV no esta en una release de mlx-vlm y exige instalar `git+https://github.com/Lazarus-931/mlx-vlm.git@feat/gev`, lo que implica riesgo de mantenimiento y de rotura de compatibilidad.
- Alcance funcional restringido: el modelo no genera texto; solo devuelve probabilidades sobre opciones predefinidas. No puede usarse como chatbot ni como generador.
- Degradacion por cuantizacion: el autor reporta una diferencia maxima de probabilidad de 0,146 frente a la referencia en float32, lo que puede alterar decisiones en umbrales ajustados.
- Ausencia de benchmarks: no hay MMLU, HumanEval, GSM8K ni metricas comparables publicadas, lo que impide evaluar su calidad objetiva frente a alternativas.
- Idiomas no declarados: no se especifica que idiomas soporta, por lo que su comportamiento fuera del ingles (idioma de los ejemplos de la model card) es desconocido.
- Longitud de contexto no documentada: no se puede garantizar el tratamiento de entradas largas sin pruebas propias.
- Validacion limitada: la verificacion cubre 7 preguntas y 9 pasadas forward realizadas por el autor; no hay evaluacion independiente ni uso en produccion documentado.
- Riesgo de calibracion: al tratarse de un modelo de decision, el fallo tipico no es la alucinacion de texto sino una probabilidad mal calibrada, que puede propagar errores aguas abajo en el pipeline.
- Sesgos: no hay informacion sobre sesgos conocidos ni sobre la composicion del dataset de entrenamiento.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base autotrust/GEV-26B-Decide antes de desplegarlo.
- Plataforma: al estar en formato MLX, queda limitado a Apple Silicon; no es desplegable en infraestructura CUDA sin una conversion adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/GEV-26B-Decide-MLX-MXFP4
- Modelo base: https://huggingface.co/autotrust/GEV-26B-Decide
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Fork con soporte GEV (rama feat/gev): https://github.com/Lazarus-931/mlx-vlm/tree/feat/gev
- Proyecto Nativ (ejecucion local de modelos en Apple Silicon): https://blaizzy.github.io/nativ/
