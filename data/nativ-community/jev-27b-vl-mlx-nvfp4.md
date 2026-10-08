# nativ-community/JEV-27B-VL-MLX-NVFP4

## Resumen

JEV-27B-VL-MLX-NVFP4 es una conversión a MLX del modelo multimodal autotrust/JEV-27B-VL, publicada por la comunidad nativ-community. Se distribuye cuantizada en NVFP4 (4 bits, tamano de grupo 16) y con el adaptador LoRA del llamado "System 1" ya fusionado en los pesos; la cabeza de decisión (`lm_head`) se mantiene sin cuantizar para preservar la precisión del readout. El repositorio ocupa 17,9 GB y el recuento real de parametros en los safetensors es de 27.356.728.560 (unos 27,36 mil millones).

La caracteristica diferencial de JEV es que no es un modelo generativo: es un modelo de decisión. Dada una entrada (texto e imagen) y un conjunto de opciones, devuelve en una única pasada forward una probabilidad para cada opción, en lugar de generar texto token a token. Esto lo situa en la categoria de clasificadores y extractores estructurados multimodales, no en la de asistentes conversacionales, pese a que la etiqueta de pipeline de HuggingFace sea `image-text-to-text`.

Su relevancia practica es doble: por un lado, ofrece un coste de inferencia muy inferior al de un LLM generativo para tareas de clasificación o extracción de estado; por otro, al ejecutarse sobre MLX, esta pensado para correr localmente en Apple Silicon. El soporte de JEV aun no esta en una release oficial de mlx-vlm, por lo que requiere instalar la rama `feat/jev` del fork mantenido por Lazarus-931.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo base de vision-lenguaje convertido a MLX; el autor no detalla la arquitectura interna) |
| Parametros totales | 27.356.728.560 (27,36 B), segun safetensors |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 de 4 bits, tamano de grupo 16; `lm_head` mantenido sin cuantizar |
| Idiomas soportados | No disponible (la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base es autotrust/JEV-27B-VL (revision `4000d2393be6718e604f8e7dca563a780ab78e78`), un modelo multimodal de 27.000 millones de parametros que acepta texto e imagenes. La model card no detalla la arquitectura del backbone (transformer denso, atencion, tokenizador, composicion del dataset o numero de tokens de entrenamiento), por lo que esos datos quedan como no disponibles. Si se explicita que sobre el modelo base se aplico un adaptador LoRA denominado "System 1", cuya actualizacion incluye tambien la cabeza `lm_head`, y que dicho adaptador se ha fusionado en los pesos finales antes de la cuantizacion.

La innovacion tecnica del pipeline es el mecanismo de decision: en lugar de generar texto, el modelo puntua todas las opciones de una pregunta en una sola pasada forward (logits de token de opcion mas un sesgo, con temperatura especifica por tipo de pregunta). La conversion a MLX aplica cuantizacion NVFP4 con grupo de 16 y excluye deliberadamente `lm_head` de la cuantizacion, ya que la lectura de decisiones se realiza sobre esa capa. El autor reporta una verificacion contra la receta System 1 original de autotrust (backbone bf16 con el adaptador `adapter_vllm` fusionado vía PEFT) sobre 7 preguntas de prueba (bool, eleccion multiple, score, estado JSON, 20 opciones en una pasada, una imagen y dos imagenes): respuestas identicas en 7/7 casos, tokens identicos en 7/7 pasadas forward y una diferencia maxima de probabilidad de 0,021.

## Capacidades

- Decision multimodal en una sola pasada: devuelve una probabilidad por cada opcion propuesta, sin generar texto.
- Tipos de pregunta soportados segun la verificacion del autor: booleana (`bool`), eleccion multiple (`choice`), puntuacion (`score`), estado en JSON y conjuntos de hasta 20 opciones evaluadas en un unico forward.
- Entrada de imagen: soporta una imagen y dos imagenes en la misma consulta.
- Entrada de texto: razonamiento sobre el enunciado y las instrucciones asociadas a cada campo.
- Salida estructurada: al definirse los campos con tipo e instrucciones, el resultado se devuelve en un diccionario con el valor decidido por campo.
- Tool calling / function calling: no disponible (el modelo no genera texto ni llamadas a herramientas).
- Agentes y razonamiento multi-paso: no disponible (no es un modelo generativo).
- Capacidades multilingues: no disponible.
- Capacidades especiales: modo de decision con sesgo y temperatura por tipo de pregunta; `lm_head` sin cuantizar para preservar el readout.

## Casos de uso

- Clasificacion de intencion en atencion al cliente: dada una reclamacion y un esquema de campos (por ejemplo, `refund: bool`), el modelo decide directamente si el cliente pide una devolucion, evitando el coste de un LLM generativo.
- Triage y enrutado de tickets: con un conjunto de categorias como opciones, se asigna cada ticket al equipo correspondiente en una unica pasada forward, lo que reduce latencia y coste por peticion.
- Moderacion de contenido: evaluar texto e imagen contra un conjunto de etiquetas (permitido, revisable, bloqueado) y obtener una probabilidad por etiqueta para fijar umbrales de actuacion.
- Extraccion de estado estructurado desde capturas: procesar una o dos imagenes (por ejemplo, pantallazos de un panel o de un formulario) y devolver un JSON de estado con los campos definidos.
- Control de calidad visual: clasificar imagenes de producto, documentos o incidencias contra una lista de defectos conocidos, con puntuacion de confianza por clase.
- Encuestas y formularios automatizados: leer una imagen de un formulario y decidir opciones de tipo `choice` o `score` en un solo paso.
- Verificacion de requisitos documentales: comprobar con preguntas booleanas si un documento cumple condiciones concretas (firma presente, fecha valida, sello visible) sobre la imagen escaneada.

En todos los casos el patron es el mismo: en lugar de pedir al modelo que redacte una respuesta, se le entrega un esquema de campos con tipo e instrucciones y se lee la probabilidad resultante, lo que simplifica el postprocesado y elimina el riesgo de salidas mal formateadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de validacion aportado por el autor es la verificacion de equivalencia con la receta System 1 original sobre 7 preguntas, no un conjunto de evaluacion estandar:

| Prueba | Resultado reportado |
|---|---|
| Respuestas identicas a la receta System 1 (bf16 + adapter PEFT) | 7/7 preguntas |
| Tokens identicos en pasada forward | 7/7 |
| Diferencia maxima de probabilidad | 0,021 |
| Tipos cubiertos | bool, choice, score, JSON state, 20 opciones en una pasada, una imagen, dos imagenes |

## Requisitos de hardware

- El modelo esta publicado exclusivamente para MLX, por lo que el despliegue esta limitado a equipos Apple Silicon (serie M). No hay pesos GGUF, ONNX ni safetensors estandar de PyTorch en este repositorio.
- Tamanio de pesos: 17,9 GB en el repositorio, correspondientes a ~27,36 B de parametros en NVFP4 de 4 bits.
- Memoria unificada estimada: al menos 24 GB libres para cargar los pesos y el contexto; se recomienda 32 GB o mas (M1/M2/M3/M4 Pro con 36 GB, Max con 64-128 GB o Ultra) para dejar margen a la cache KV y a las imagenes de entrada.
- No cabe en configuraciones de 8 o 16 GB de memoria unificada.
- GPU dedicadas (NVIDIA, AMD): no soportadas por esta conversion, que depende del runtime MLX. Para GPU CUDA habria que usar el modelo base `autotrust/JEV-27B-VL` en su formato original.
- Opciones de despliegue: `mlx-vlm` desde el fork `Lazarus-931/mlx-vlm@feat/jev` (el soporte de JEV no esta en una release oficial). vLLM, llama.cpp, Ollama y TGI no aplican a este repositorio.
- Latencia y throughput: no disponibles. Al tratarse de una unica pasada forward sobre opciones predefinidas en lugar de decodificacion autoregresiva, el coste esperado por consulta es inferior al de un modelo generativo del mismo tamano, pero no se publican mediciones.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de contexto de los posibles competidores en la informacion proporcionada, por lo que la comparacion se limita a parametros, formato y licencia.

| Modelo | Parametros | Contexto | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| nativ-community/JEV-27B-VL-MLX-NVFP4 | 27,36 B | No disponible | safetensors MLX, NVFP4 4 bits, Apple Silicon | Apache-2.0 | HuggingFace |
| autotrust/JEV-27B-VL (modelo base) | 27 B (aproximado, no confirmado) | No disponible | Pesos originales (formato no indicado) | No disponible | HuggingFace |
| Otros modelos de decision multimodal de ~27 B | No disponible | No disponible | No disponible | No disponible | No disponible |

La diferencia principal frente al modelo base es la cuantizacion NVFP4, la fusion del adaptador LoRA y el hecho de estar empaquetado para MLX, lo que reduce el peso en disco a 17,9 GB y permite ejecucion local en Apple Silicon a cambio de depender de un fork de mlx-vlm.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre. Cada consulta debe formularse como un conjunto de opciones o campos con tipo e instrucciones; no sirve para chat, redaccion ni resumen.
- Soporte incompleto: JEV no esta integrado en una release estable de mlx-vlm. El autor indica instalar desde la rama `feat/jev` de un fork, lo que implica riesgo de cambios incompatibles y ausencia de soporte oficial.
- Idiomas: no declarados. Se desconoce que idiomas cubre el modelo base y si rinde de forma equivalente en castellano.
- Contexto: no se especifica la longitud de ventana, lo que impide planificar entradas largas o conversaciones multi-turno extensas.
- Datos de entrenamiento y sesgos: la model card no documenta la composicion del dataset ni evaluaciones de sesgo, por lo que no es posible estimar sesgos sistematicos en clasificacion ni en tareas visuales.
- Alucinacion: al devolver probabilidades sobre opciones, el riesgo no es inventar texto, sino asignar una probabilidad alta a una opcion incorrecta cuando la entrada es ambigua o esta fuera de la distribucion de entrenamiento. No hay datos publicados de calibracion.
- La verificacion reportada se limita a 7 preguntas de prueba del propio autor, no a un conjunto de evaluacion independiente; no debe tomarse como evidencia de calidad general.
- Licencia Apache-2.0 en este repositorio, pero la licencia y las condiciones del modelo base `autotrust/JEV-27B-VL` no se detallan en la informacion disponible; conviene verificarlas antes de un uso comercial.
- La etiqueta `conversational` del repositorio procede de la herencia del pipeline del modelo base y no refleja el comportamiento real del modelo, que no mantiene conversaciones.
- Metricas de adopcion nulas en el momento de redactar la ficha (0 descargas, 0 likes), lo que sugiere ausencia de validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/nativ-community/JEV-27B-VL-MLX-NVFP4
- Modelo base: https://huggingface.co/autotrust/JEV-27B-VL
- Fork de mlx-vlm con soporte JEV: https://github.com/Lazarus-931/mlx-vlm/tree/feat/jev
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Aplicacion Nativ para ejecucion local en Apple Silicon (posible relacion con la organizacion, no confirmada): https://blaizzy.github.io/nativ/

Nota: el resto de resultados de la busqueda web (heynativ.com, bynativ.com, natif-shop.com y el programa Nativ de nutricion) no guardan relacion con este modelo y se han descartado.
