# oldhag88/Qwen3.8-27B-json_captioner-basefp8-Rank64-V2

## Resumen

El modelo `oldhag88/Qwen3.8-27B-json_captioner-basefp8-Rank64-V2` es un adaptador LoRA de tipo PEFT publicado por el usuario oldhag88 sobre el checkpoint multimodal `Qwen/Qwen3.8-27B-FP8`. Se trata, por tanto, de un ajuste fino y no de un modelo autonomo: para utilizarlo es necesario cargar primero los pesos base de Qwen y despues aplicar el adaptador. Su tarea concreta es la generacion de descripciones en formato JSON con cajas delimitadoras (*bounding boxes*) sobre imagenes de contenido erotico o NSFW, segun indica el propio autor en la model card.

El artefacto es tecnicamente interesante por la combinacion de cuantizacion que propone: los pesos base se cargan en FP8 mientras que el adaptador LoRA se mantiene en bfloat16 mediante el parametro `lora_dtype`, evitando cuantizar el adaptador. Ademas, activa `enable_tower_connector_lora=True`, lo que entrena tambien el conector vision-a-LLM (torre) y no solo las capas de atencion y MLP del modelo de lenguaje. El rango del adaptador es 64 y el repositorio ocupa 1,7 GB.

La relevancia de esta ficha es limitada y hay que ser honesto al respecto: se publico el 14 de octubre de 2026, acumula cero descargas y cero *likes*, no declara licencia ni idiomas, no incluye resultados de benchmarks y esta version (V2) remite a una V1 para mas informacion. La informacion disponible es escasa y proviene casi exclusivamente de la model card y de la configuracion de ejemplo para vLLM que el autor incluye.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision-language) con adaptador LoRA sobre el modelo base; el adaptador entrena capas de atencion y MLP del LLM y el conector torre (vision-to-LLM) |
| Parametros totales | No disponible. El modelo base se identifica como de 27B; el repositorio publicado contiene unicamente el adaptador y ocupa 1,7 GB, lo que en bfloat16 equivaldria a unos 850 millones de parametros (calculo derivado del tamano del repositorio, no confirmado por el autor) |
| Parametros activos | No aplica / no disponible (no hay indicios de que el modelo base sea MoE) |
| Longitud de contexto | No disponible para el modelo base. La configuracion de ejemplo del autor fija `max_model_len=7168` tokens y `max_num_batched_tokens=8192` |
| Tipos de cuantizacion | Pesos base en FP8 (cargados directamente, sin fichero de escalado segun el autor); adaptador LoRA en bfloat16 (`lora_dtype="bfloat16"`), con `max_lora_rank=64` |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (formato PEFT / LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un modelo base multimodal de la familia Qwen, identificado como `Qwen/Qwen3.8-27B-FP8`. La configuracion proporcionada por el autor confirma varias cosas sobre la arquitectura del conjunto: existe un procesador multimodal (`mm_processor_kwargs` con `min_pixels=256*1024` y `max_pixels=1.649.664`, que acotan el presupuesto de tokens por imagen en torno a unos 2100 tokens) y existe un conector torre entre el codificador visual y el modelo de lenguaje. El ajuste LoRA se aplica sobre las capas de atencion y MLP del LLM y, gracias a `enable_tower_connector_lora=True`, tambien sobre dicha proyeccion de conexion; el autor advierte explicitamente de que, si no se activa esa opcion, los pesos del adaptador correspondientes al conector se descartan silenciosamente.

Respecto al entrenamiento, la model card es minima: solo indica que el LoRA se ha entrenado sobre *bounding boxes* en JSON para imagenes eroticas (NSFW) y remite a una version V1 para mas detalle. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF, DPO u otra fase de alineamiento, ni la receta de ajuste (learning rate, epocas, precision, etc.). Si se documenta la integracion de inferencia: la configuracion de ejemplo usa `reasoning_parser="qwen3"` junto con `enable_thinking=True` y `reasoning_effort="medium"`, de modo que el parser separa el bloque `<think>...</think>` del texto de la completion. El autor tambien menciona que `enable_prefix_caching=False` se fijo en su escenario pese a que las peticiones comparten prefijo, y recomienda dejarlo activado por defecto salvo conflicto con el soporte de LoRA + FP8 de la version de vLLM empleada.

## Capacidades

- Generacion de descripciones de imagen en formato JSON, presumiblemente con coordenadas de cajas delimitadoras para las regiones detectadas.
- Procesamiento de imagenes mediante un procesador multimodal con control explicito del presupuesto de tokens por imagen (`min_pixels` / `max_pixels`).
- Generacion de texto condicionada por imagen (pipeline `text-generation` aplicado a una entrada multimodal).
- Modo de razonamiento tipo Qwen3, con bloque `<think>` separado del texto final mediante `reasoning_parser="qwen3"` y control de esfuerzo de razonamiento.
- Despliegue como adaptador LoRA servido junto a los pesos base en FP8, compatible con `enable_lora` y `max_loras=1` en vLLM.
- Capacidades multilingues: no disponibles.
- Soporte de *tool calling* o *function calling*: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de audio o video: no documentadas.

## Casos de uso

- Anotacion automatica de datasets de imagenes para adultos: el modelo genera directamente el JSON con las cajas delimitadoras, lo que permite pre-anotar grandes volumenes de imagenes y dejar al anotador humano unicamente la revision, reduciendo coste por imagen.
- Construccion de pipelines de captioning estructurado: al devolver JSON en lugar de texto libre, la salida puede parsearse y volcarse a una base de datos o a un formato COCO-like sin postprocesado heuristico.
- Etiquetado de regiones para busqueda por zonas: las cajas permiten indexar objetos o partes concretas de la imagen y habilitar busquedas del tipo "regiones que contengan X" dentro de un catalogo.
- Generacion de datos sinteticos de entrenamiento para detectores: las cajas JSON producidas pueden usarse como pseudo-etiquetas para entrenar o afinar modelos de deteccion especificos de dominio.
- Moderacion y clasificacion de contenido adulto: la capacidad de describir y localizar regiones en imagenes NSFW puede emplearse en sistemas de etiquetado, filtrado o verificacion de edad, siempre con las cautelas legales del apartado de limitaciones.
- Servicio de inferencia con multiples peticiones concurrentes: la configuracion de ejemplo (`max_num_seqs=170`, `gpu_memory_utilization=0.96`, `tensor_parallel_size=1`) esta pensada para servir el adaptador con un throughput alto sobre una sola GPU.
- Prototipado de asistentes multimodales con salida estructurada: util para validar rapidamente si el modelo base responde bien a instrucciones que exigen JSON estricto antes de invertir en un ajuste completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de ningun tipo (ni MMLU, ni HumanEval, ni precision de deteccion tipo mAP, ni evaluacion de calidad del JSON), y los resultados de busqueda web no aportan datos tecnicos sobre el modelo.

## Comparativa con modelos similares

No disponible. No se dispone de datos de rendimiento, licencia o contexto del propio modelo, por lo que cualquier comparacion con alternativas de la misma categoria (otros adaptadores LoRA de captioning o deteccion sobre la familia Qwen-VL) seria especulativa. Como referencia estructural, el modelo base declarado es `Qwen/Qwen3.8-27B-FP8`, y la unica diferencia documentada frente a otros adaptadores de la misma familia seria la combinacion de base FP8 con adaptador en bfloat16 y el entrenamiento del conector torre.

## Limitaciones y advertencias

- Sesgos conocidos: el adaptador se ha entrenado exclusivamente sobre imagenes eroticas, por lo que su comportamiento fuera de ese dominio es impredecible y probablemente degradado.
- Riesgo de alucinacion: no se documenta ninguna evaluacion de la fidelidad de las cajas delimitadoras. En tareas de deteccion, los modelos generativos pueden producir coordenadas plausibles pero incorrectas, y el formato JSON puede romperse (comillas, llaves o numeros mal formados), lo que exige validacion y reintentos en produccion.
- Contenido para adultos: el modelo esta disenado para material NSFW. Su uso requiere cumplir la normativa aplicable sobre contenido para adultos y verificacion de edad, y puede no ser apto para entornos corporativos con politicas de contenido restrictivas.
- Licencia no declarada: al no especificarse licencia, no hay autorizacion explicita de uso comercial. Ademas, la licencia del modelo base (`Qwen/Qwen3.8-27B-FP8`) impone sus propias condiciones, que deben verificarse por separado.
- Dependencia del modelo base: no es un modelo autonomo; sin los pesos base de Qwen no puede ejecutarse. La version concreta del checkpoint base referenciada debe existir en el Hub y ser compatible.
- Limitacion de contexto: la configuracion de ejemplo recorta `max_model_len` a 7168 tokens. Si el modelo base soporta ventanas mayores, esta configuracion no las aprovecha; si no las soporta, la ventana real es aun mas restrictiva.
- Presupuesto visual acotado: `max_pixels=1.649.664` limita la resolucion efectiva; imagenes de alta resolucion deben redimensionarse en el cliente o perderan detalle, lo que afecta a la precision de las cajas.
- Requisito de vLLM especifico: `enable_tower_connector_lora=True` es imprescindible para que los pesos del conector no se descarten; versiones de vLLM sin ese soporte pueden cargar el adaptador parcialmente sin avisar.
- Madurez y mantenimiento: cero descargas, cero *likes*, autor unico y una model card que remite a otra version para el detalle. No hay garantia de soporte, correcciones ni reproducibilidad de la receta de entrenamiento.
- Idiomas: no declarados. Se desconoce si el JSON generado mantiene las claves y valores en ingles, en el idioma de la instruccion o en otro.

## Enlaces

- HuggingFace (adaptador LoRA): https://huggingface.co/oldhag88/Qwen3.8-27B-json_captioner-basefp8-Rank64-V2
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.8-27B-FP8
- Version previa referenciada en la model card (V1): no disponible como enlace directo; la model card la menciona como "V1" sin URL
- Adaptador referenciado en la configuracion de ejemplo (`oldhag88/Qwen3.8-27B-json_captioner-basefp8-Rank64`): https://huggingface.co/oldhag88/Qwen3.8-27B-json_captioner-basefp8-Rank64

Nota: la busqueda web realizada no ha devuelto ningun resultado relevante para este modelo. Los enlaces obtenidos correspondian a sitios de contenido para adultos sin relacion tecnica con el artefacto, por lo que se han omitido. No se han localizado papers, blogs, repositorios ni demos asociados.
