# nativ-community/JEV-27B-VL-MLX-8bit

## Resumen

JEV-27B-VL-MLX-8bit es una conversion al formato MLX del modelo multimodal autotrust/JEV-27B-VL, publicada por el usuario nativ-community para su uso con la libreria mlx-vlm sobre Apple Silicon. No es un modelo generativo de texto: JEV es un modelo de decision que, en una unica pasada hacia delante, devuelve una probabilidad para cada opcion de una pregunta formulada en formato estructurado (booleano, eleccion multiple, puntuacion o estado JSON). El modelo base tiene 27.356.728.560 parametros y procesa entradas de imagen y texto.

La relevancia de esta publicacion es doble. Por un lado, traslada un modelo de decision de 27B al ecosistema MLX con cuantizacion affine de 8 bits y grupo de 64, manteniendo sin cuantizar el `lm_head` y la cabeza de lectura de decision, lo que preserva la calibracion de las probabilidades de salida. Por otro lado, incorpora el adaptador LoRA de System 1 ya fusionado en los pesos, de modo que el usuario no necesita aplicar el adaptador por separado.

El resultado es un artefacto pensado para ejecucion local en Mac: decision binaria, clasificacion multietiqueta y extraccion de estado estructurado con entrada de imagen, sin generacion de texto libre y sin necesidad de servicios en la nube. El soporte de JEV aun no esta integrado en una release oficial de mlx-vlm, por lo que requiere instalar una rama concreta del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base multimodal image-text-to-text; no se especifica transformer, MoE ni hibrida en la informacion proporcionada) |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 8-bit affine con group size 64; `lm_head` y la cabeza de lectura de decision se mantienen sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`); repo de 30,7 GB |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base autotrust/JEV-27B-VL en los datos proporcionados: no se especifica si es un transformer denso, un MoE o una arquitectura hibrida, ni el numero de tokens de entrenamiento o la composicion del dataset. Lo que si se documenta es su naturaleza funcional: JEV es un modelo de decision que devuelve una distribucion de probabilidad sobre las opciones de una pregunta en una sola pasada, en lugar de generar texto token a token. Para ello utiliza logits de tokens de opcion combinados con un sesgo y una temperatura especifica por tipo de pregunta.

La parte conocida del proceso de construccion de esta publicacion es la conversion: se parte del modelo base en su revision `4000d2393be6718e604f8e7dca563a780ab78e78`, se fusiona el adaptador LoRA de System 1 (incluida su actualizacion de `lm_head` mediante peft) y se cuantiza el backbone a 8 bits con group size 64, dejando `lm_head` y la cabeza de decision en precision superior. El autor reporta una verificacion contra la receta original de System 1 del publicador (backbone bf16 mas adaptador `adapter_vllm` fusionado con peft, logits de token de opcion mas sesgo, temperatura por tipo): coincidencia en 7 de 7 preguntas de prueba (booleano, eleccion, puntuacion, estado JSON, 20 opciones en una pasada, una imagen y dos imagenes), identicos token ids en 7 de 7 pasadas y una diferencia maxima de probabilidad de 0,0006.

## Capacidades

- Decision binaria: responde preguntas de tipo booleano sobre un texto o una imagen (por ejemplo, "el cliente pide un reembolso?").
- Eleccion multiple: evalua hasta 20 opciones en una sola pasada y devuelve una probabilidad por opcion.
- Puntuacion: admite preguntas de tipo score con temperatura especifica por tipo.
- Extraccion de estado estructurado: devuelve estados en formato JSON como salida del mecanismo de decision.
- Entrada multimodal: procesa texto e imagen; se ha verificado con una y con dos imagenes en la misma consulta.
- Salida probabilistica calibrada: al no cuantizar `lm_head` ni la cabeza de decision, preserva los valores de probabilidad del modelo original (diferencia maxima reportada de 0,0006).
- Sin generacion de texto: no produce respuestas en lenguaje natural; devuelve valores por opcion.
- Tool calling / function calling: no disponible.
- Modo de razonamiento explicito (thinking): no disponible.
- Capacidades de audio o video: no disponible.
- Cobertura multilingue: no disponible.

## Casos de uso

- Triaje de solicitudes de soporte: clasificar un mensaje entrante con una pregunta booleana o de opciones ("pide reembolso?", "que tipo de incidencia es?") en una sola pasada, sin coste de decodificacion autoregresiva, lo que abarata el enrutado previo a un modelo generativo.
- Moderacion de contenido con imagen: dado un par imagen-texto, decidir mediante opciones si el contenido cumple una politica, aprovechando la entrada multimodal y la salida probabilistica para fijar umbrales de revision humana.
- Extraccion de estado conversacional: mantener un estado JSON actualizado de una conversacion multi-turno a partir de la ultima intervencion y el estado anterior, adecuado para agentes que necesitan un componente de decision deterministico y barato.
- Enrutado de agentes: decidir, entre un conjunto cerrado de herramientas o subagentes, cual corresponde a la consulta, usando la probabilidad por opcion como senal de confianza para escalar a un modelo mayor cuando la distribucion sea ambigua.
- Verificacion de calidad documental: puntuar o clasificar documentos con opciones cerradas antes de indexarlos, filtrando los que no cumplen criterios definidos.
- Analisis de imagenes con criterios binarios: decidir si una imagen de producto, un ticket o una captura cumple una condicion concreta (por ejemplo, si el ticket muestra la fecha de compra), en un flujo de validacion automatizada.
- Investigacion sobre calibracion: al mantener `lm_head` sin cuantizar, sirve como referencia para medir cuanto degrada la cuantizacion de 8 bits la distribucion de probabilidades en modelos de decision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato de evaluacion presente es la verificacion de equivalencia frente a la receta original de System 1, que no constituye un benchmark comparativo:

| Prueba | Resultado reportado |
|---|---|
| Coincidencia de respuesta con la receta bf16 + adaptador (7 preguntas) | 7 de 7 |
| Identidad de token ids en pasada hacia delante | 7 de 7 |
| Diferencia maxima de probabilidad frente a la receta original | 0,0006 |
| Tipos cubiertos | bool, choice, score, JSON state, 20 opciones en una pasada, una imagen, dos imagenes |

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 30,7 GB, por lo que se necesita espacio libre equivalente mas margen para cache.
- Memoria para inferencia: los 27,36B de parametros a 8 bits ocupan aproximadamente 27,4 GB, a los que hay que sumar `lm_head` y la cabeza de decision sin cuantizar y, probablemente, la torre de vision en mayor precision. Como estimacion derivada del tamano del repo, el pico de memoria se situaria en el entorno de 32-36 GB, sin contar la cache KV, que depende de la longitud de contexto (no disponible).
- Plataforma: MLX solo se ejecuta sobre Apple Silicon, por lo que no hay soporte CUDA. La ejecucion requiere un Mac con memoria unificada de 32 GB como minimo practico y 64 GB o mas para trabajar con margen.
- GPU Nvidia: no aplicable. Con 30,7 GB de pesos, una RTX 4090 de 24 GB no puede alojarlo; seria necesario repartir en varias GPU, pero el runtime MLX no las soporta.
- Opciones de despliegue: mlx-vlm en la rama `Lazarus-931/mlx-vlm@feat/jev`, instalada mediante `pip install "git+https://github.com/Lazarus-931/mlx-vlm.git@feat/jev"`, ya que el soporte de JEV no esta en una release publicada. No hay indicios de soporte en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| JEV-27B-VL-MLX-8bit (esta publicacion) | 27,36B | no disponible | 8-bit affine, group size 64 | safetensors MLX | apache-2.0 | HuggingFace, requiere mlx-vlm en rama `feat/jev` |
| autotrust/JEV-27B-VL (modelo base) | 27,36B | no disponible | bf16 | safetensors | no disponible en la informacion proporcionada | HuggingFace, revision `4000d23` |
| Modelos de decision multimodal comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento publicados para el modelo base ni para alternativas de la misma categoria, por lo que no es posible establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- El modelo no genera texto: cualquier caso de uso que requiera respuestas en lenguaje natural necesita emparejarlo con un modelo generativo aparte.
- El soporte de JEV no esta en una release oficial de mlx-vlm. Depende de una rama de un fork concreto (`Lazarus-931/mlx-vlm@feat/jev`), lo que supone un riesgo de mantenimiento y de rotura de compatibilidad en produccion.
- Solo se ejecuta en Apple Silicon a traves de MLX; no hay ruta de despliegue en GPU Nvidia ni en aceleradores habituales de servidor.
- No se especifica la longitud de contexto soportada, dato critico para dimensionar la memoria y para decidir si admite conversaciones largas o documentos extensos.
- No se declaran idiomas soportados; el comportamiento fuera del ingles (idioma del ejemplo de la model card) es desconocido.
- No hay resultados de benchmarks publicados, solo una verificacion de equivalencia sobre 7 preguntas. El rendimiento en produccion sobre distribuciones reales de datos no esta caracterizado.
- No se documentan sesgos conocidos ni evaluaciones de seguridad del modelo base, por lo que se recomienda validacion propia antes de usarlo en decisiones que afecten a usuarios.
- La calibracion de las probabilidades se ha verificado en 7 preguntas con una diferencia maxima de 0,0006; no hay garantia de que ese margen se mantenga en todos los dominios.
- La licencia declarada es apache-2.0, pero la informacion de licencia del modelo base no se especifica en los datos proporcionados; conviene confirmarla antes de un uso comercial.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, sin historial de uso que respalde su fiabilidad en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nativ-community/JEV-27B-VL-MLX-8bit
- Modelo base: https://huggingface.co/autotrust/JEV-27B-VL
- Repositorio mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Rama con soporte de JEV: https://github.com/Lazarus-931/mlx-vlm/tree/feat/jev
- Aplicacion Nativ (ejecucion local de modelos MLX en Apple Silicon): https://blaizzy.github.io/nativ/

Nota: el resto de resultados de la busqueda web corresponden a empresas y productos sin relacion con este modelo, por lo que se han omitido.
