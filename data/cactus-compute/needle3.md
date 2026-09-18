# Cactus-Compute/needle3

## Resumen

Needle 3 es un modelo de lenguaja de proposito especifico desarrollado por Cactus-Compute, disenado para ejecutarse integramente en el dispositivo (on-device) en moviles, wearables, robots, domotica, automocion y microcontroladores. No es un modelo de chat general: el autor declara explicitamente que renuncia a capacidad conversacional generica para superar a modelos diez veces mas grandes en llamadas a herramientas (tool calling) sobre movil y para igualar a modelos dos o tres veces mayores en extraccion de informacion estructurada. El modelo completo se distribuye como un unico fichero de entre 9 y 35 MB.

La arquitectura se denomina Laddered Simple Attention Network (LSAN), una receta para modelos pequenos que sustituye la FFN por un MLP Monarch Hadamard, emplea atencion GQA con derivaciones convolucionales causales, una memoria de n-gramas (engram) leida mediante gather y conexiones hipervinculadas multicarril. La mayoria de los parametros residen en el engram, de modo que la variante de 121 millones de parametros realiza la aritmetica de una de 50 millones. El modelo base cuenta con 20 capas, pero esta entrenado para que cada profundidad entre 2 y 20 capas sea un modelo desplegable, lo que permite recortar subredes para dispositivos mas limitados.

Needle 3 realiza tres tareas: llamadas a herramientas a partir de las funciones que expone la aplicacion, extraccion estructurada de campos tipados desde texto desordenado y generacion de embeddings de frases para busqueda o enrutado local. Los pesos se comprimen a CQ2-bit mediante Cactus Quants (2,125 bits por peso) y una gramatica a nivel de byte compilada a partir de los esquemas del usuario restringe cada token generado, garantizando que la salida sea parseable. Cada respuesta incluye una puntuacion de confianza calibrada procedente de una cabeza aprendida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Laddered Simple Attention Network (LSAN): MLP Monarch Hadamard en lugar de FFN, atencion GQA con derivaciones convolucionales causales, memoria engram de n-gramas por gather, hiperconexiones multicarril |
| Parametros totales | 121 millones (variante de 20 capas); subredes desplegables desde 2 hasta 20 capas, con un minimo citado de 29 millones tras fine-tuning |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | CQ2-bit mediante Cactus Quants (2,125 bits por peso); exportacion a 4 bits con `needle build` |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (formato propietario mapeado en memoria), `safetensors` (checkpoint para fine-tuning), exportacion `.cact` a 4 bits |

Otros datos de interes: tamano del repositorio 4,3 GB; tamano del modelo desplegado entre 9 y 35 MB; motor por plataforma inferior a 1 MB; 47 descargas y 10 likes en HuggingFace; creado el 16 de septiembre de 2026 y actualizado el 17 de septiembre de 2026; libreria `cactus-needle`.

## Arquitectura y entrenamiento

Needle 3 se basa en la arquitectura LSAN (Laddered Simple Attention Network), una receta propia de Cactus-Compute para modelos pequenos. En lugar de la red feed-forward convencional emplea un MLP Monarch Hadamard, lo que reduce el coste computacional de esa capa. La atencion es de tipo GQA (Grouped Query Attention) e incorpora derivaciones convolucionales causales. Ademas incorpora una memoria engram de n-gramas que se lee mediante operaciones de gather, donde reside la mayor parte de los parametros; esto explica que el modelo de 121 millones de parametros rinda aritmeticamente como uno de 50 millones. Completan la arquitectura las hiperconexiones multicarril (multi-lane hyper-connections).

El entrenamiento tiene un caracter de escalera: cada profundidad entre 2 y 20 capas constituye un modelo desplegable de forma nativa, de modo que se puede seleccionar la subred adecuada segun el dispositivo objetivo. El paquete de Python permite afinar con LoRA sobre la base congelada a las 20 capas completas y despues, mediante `needle build --layers N`, fusionar el adaptador, recortar cualquier subred de 2 a 20 capas y exportar un `.cact` de 4 bits que funciona sobre el mismo motor. No se especifica en la informacion disponible el numero de tokens de entrenamiento ni la composicion del dataset, mas alla de que la cuantizacion a 2 bits posterior al entrenamiento se enriquece con datasets propios de Cactus en la Cactus Platform. Tampoco se detalla si hubo RLHF o DPO. Como innovaciones destacables figuran la gramatica a nivel de byte compilada desde los esquemas del usuario, que restringe la decodificacion, y la cabeza de confianza calibrada que acompana cada respuesta.

## Capacidades

- Llamadas a herramientas (tool calling): dado el conjunto de funciones que expone la aplicacion, el modelo selecciona las correctas y rellena todos los argumentos a partir de lo dicho por el usuario. Si se piden dos cosas, devuelve dos llamadas en orden; si se pide algo que ninguna herramienta cubre, devuelve una lista vacia en lugar de inventar.
- Extraccion estructurada: declarada una forma de salida, el modelo devuelve campos tipados a partir de texto desordenado (facturas, reservas, notificaciones, formularios). La gramatica de decodificacion garantiza que la salida sea parseable, y la extraccion generaliza a clasificacion mediante enumerados.
- Embeddings de texto: el mismo modelo devuelve un vector para una frase, lo que permite busqueda, emparejamiento y enrutado local.
- Razonamiento por turno: cada turno devuelve un unico objeto JSON con `function_calls`, el razonamiento del modelo y una confianza calibrada.
- Salida estructurada garantizada: la gramatica a nivel de byte compilada desde los esquemas restringe cada token generado.
- Confianza calibrada: cada respuesta incorpora una puntuacion procedente de una cabeza aprendida que permite enrutar entre actuar, confirmar o rechazar.
- Capacidades multilingues: no disponible.
- Capacidades de vision, audio o modo de pensamiento explicito: no disponibles.

## Casos de uso

- Asistentes de voz en movil: el modelo recibe la transcripcion del usuario y las funciones expuestas por la aplicacion (enviar mensaje, poner una alarma, reproducir musica) y devuelve la llamada correcta con los argumentos rellenos. Su tamano de 9 a 35 MB permite ejecutarlo sin conexion en el propio telefono.
- Extraccion de facturas y recibos: declarando la forma del documento se obtienen campos tipados (importe, fecha, emisor, numero de factura) desde texto OCR desordenado, con salida JSON garantizada por la gramatica de decodificacion.
- Procesamiento de reservas y notificaciones: convertir correos o mensajes de reserva en registros estructurados, o clasificar notificaciones mediante enumerados, aprovechando que la extraccion generaliza a clasificacion.
- Automocion y domotica: interpretar ordenes como "baja el salon al 30" y mapearlas a las funciones del sistema domotico, con la lista vacia como respuesta ante peticiones fuera de catalogo para evitar acciones erroneas.
- Robotica y microcontroladores: desplegar subredes recortadas (desde 2 capas) en dispositivos con recursos muy limitados, manteniendo las mismas capacidades de llamada a herramientas sobre un motor inferior a 1 MB.
- Busqueda y enrutado local de contenido: usar los embeddings del propio modelo para indexar notas o mensajes y dirigir consultas al modulo o herramienta correspondiente sin salir del dispositivo.
- Atencion al cliente con confirmacion: aprovechar la confianza calibrada para decidir si se ejecuta la accion directamente, se pide confirmacion al usuario o se rechaza la peticion cuando la puntuacion es baja.
- Pipelines de agentes en el borde: encadenar varias llamadas a herramientas en un flujo multi-paso (por ejemplo, consultar disponibilidad y despues reservar) manteniendo el orden solicitado por el usuario.

## Benchmarks y rendimiento

El autor publica resultados en seis benchmarks de tool calling (exact-match accuracy sobre los conjuntos de test completos) y de extraccion (field micro-F1 sobre los conjuntos de test completos), pero las cifras se presentan unicamente en forma de figura (`assets/benchmarks.svg`) y en el grafico interactivo de la pagina de release. No se han facilitado los valores numericos en la informacion disponible.

| Benchmark | Metrica | Resultado numerico |
|---|---|---|
| Tool calling (6 benchmarks) | exact-match accuracy | no disponible (solo figura) |
| Extraccion estructurada | field micro-F1 | no disponible (solo figura) |

Dato de fine-tuning citado por el autor: el ajuste sobre DroidCall mejora cada subred entre 18 y 36 puntos, y a partir de 4 capas la subred afinada supera a DeepSeek V4 Flash partiendo de 29 millones de parametros.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo completo en CQ2-bit ocupa entre 9 y 35 MB, por lo que la memoria necesaria es de decenas de megabytes, muy por debajo de cualquier GPU convencional. La exportacion a 4 bits con `needle build` ocuparia mas espacio que la variante de 2 bits, pero no se especifica la cifra.
- GPU recomendadas: no aplica en el sentido habitual; el modelo esta pensado para CPU, moviles, wearables, robots y microcontroladores. No se indican GPU concretas.
- Cabe en GPU de consumo: si, cualquier GPU de consumo puede alojarlo con holgura dado su tamano, aunque el objetivo declarado es la inferencia en dispositivo sin GPU.
- Opciones de despliegue: cada carpeta de plataforma del repositorio contiene un motor inferior a 1 MB que carga `needle3.cact` al arrancar; `needle build --platform <folder> [--layers N]` descarga el motor y la cabecera y coloca los pesos junto a ellos. Se ofrece ejecutable de linea de comandos (`./needle --model needle3.cact --tools tools.json --prompt "..."`), modo servidor (`--serve`), API en C, componente WASI, ejecucion en navegador y configuracion para entornos aislados (air-gapped). El paquete de Python se instala con `pip install cactus-needle`.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La informacion disponible solo menciona explicitamente una comparacion, con DeepSeek V4 Flash, y lo hace en el contexto del fine-tuning sobre DroidCall. No se ofrecen cifras de benchmark comparativas en formato numerico.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Needle 3 | 121 M (subredes desde 29 M) | no disponible | Apache 2.0 | HuggingFace (Cactus-Compute/needle3) | Modelo on-device para tool calling, extraccion y embeddings |
| DeepSeek V4 Flash | no disponible | no disponible | no disponible | no disponible | Citado por el autor: las subredes afinadas de 4 capas o mas lo superan en DroidCall |
| Modelos 10x mayores en tool calling movil | no disponible | no disponible | no disponible | no disponible | Afirmacion generica del autor, sin identificacion de modelos concretos |
| Modelos 2-3x mayores en extraccion | no disponible | no disponible | no disponible | no disponible | Afirmacion generica del autor, sin identificacion de modelos concretos |

## Limitaciones y advertencias

- El propio autor declara que el modelo renuncia a capacidad de chat general: no debe emplearse como asistente conversacional de proposito general.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: el diseno lo mitiga parcialmente devolviendo una lista vacia cuando ninguna herramienta cubre la peticion y restringiendo la salida mediante gramatica, pero no se documentan tasas de error.
- Idiomas soportados: no disponibles; se desconoce el comportamiento fuera del idioma o idiomas de entrenamiento.
- Longitud de contexto: no disponible, lo que impide evaluar su idoneidad para conversaciones o documentos largos.
- Restricciones de licencia: Apache 2.0, lo que en principio permite uso comercial, pero la cuantizacion a 2 bits y parte de los datos de entrenamiento se generan en la Cactus Platform y no se detalla si existen condiciones adicionales sobre esos artefactos.
- La puntuacion de confianza es una cabeza aprendida; su fiabilidad fuera de la distribucion de entrenamiento no esta documentada.
- El formato principal de pesos es propietario (`.cact`), por lo que la portabilidad a otros motores de inferencia distintos de los proporcionados por Cactus-Compute no esta garantizada.
- El modelo es muy reciente (creado el 16 de septiembre de 2026), con 47 descargas y 10 likes, por lo que existe poca validacion independiente.
- No se han publicado cifras numericas de benchmarks en la informacion disponible, solo figuras.

## Enlaces

- HuggingFace: https://huggingface.co/Cactus-Compute/needle3
- Pagina de release, arquitectura y plot interactivo: https://cactuscompute.com/needle
- Repositorio GitHub: https://github.com/cactus-compute/needle
- Guia de diseno de herramientas: https://cactuscompute.com/blog/designing-tools-for-needle
- Guia sobre la confianza del modelo: https://cactuscompute.com/blog/needle-confidence
- Guia de extraccion estructurada JSON: https://cactuscompute.com/blog/structured-extraction-with-needle
- Guia de fine-tuning: https://cactuscompute.com/blog/finetuning-needle
- Documentacion del paquete de Python: https://cactuscompute.com/blog/needle-python-docs
- Dispositivos soportados: https://cactuscompute.com/blog/needle-supported-devices
- Formato `.cact`: https://cactuscompute.com/blog/cact-format
- Cactus Platform (cuantizacion y datasets propios): https://cactuscompute.com/dashboard
