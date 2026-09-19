# kirikir13/needle3

## Resumen

Needle 3 es un modelo fundacional de 121 millones de parametros disenado por Cactus Compute para ejecutarse integramente en el dispositivo (on-device), desde moviles y wearables hasta robots, domotica, automocion y microcontroladores. El repositorio analizado, `kirikir13/needle3`, es una copia alojada en HuggingFace por un tercero (`kirikir13`), con 0 descargas y 0 likes en el momento de la consulta, y contiene los pesos del modelo, el checkpoint en safetensors para ajuste fino y un engine por plataforma. La propuesta central no es el chat generalista: el modelo renuncia deliberadamente a capacidad conversacional amplia para superar en tool calling movil a modelos diez veces mas grandes y para igualar a modelos dos o tres veces mayores en extraccion estructurada.

La arquitectura se denomina Laddered Simple Attention Network y combina un MLP de tipo Monarch Hadamard en lugar de la FFN convencional, atencion GQA con taps convolucionales causales, memoria de n-gramas (engram) leida por gather y hyper-connections multicarril. El entrenamiento esta disenado para que cada profundidad entre 2 y 20 capas sea un modelo desplegable por si misma, de modo que un subnetwork muy pequeno puede ejecutarse en hardware mucho mas limitado. El modelo completo, con 20 capas, se distribuye comprimido a CQ2 (2,125 bits por peso) en un unico fichero de entre 8 y 29 MB segun la profundidad, ademas de un checkpoint `needle3.safetensors` para reentrenamiento.

Su relevancia actual reside en el hueco que ocupa: tool calling y extraccion estructurada con garantia de formato mediante decodificacion restringida por gramatica a nivel de byte, mas una cabeza de confianza calibrada que permite enrutar entre actuar, confirmar o rechazar una peticion. Todo ello sin conexion a red, con un engine de menos de 1 MB por plataforma y licencia Apache 2.0, lo que lo hace apto para productos empotrados donde no cabe un modelo generativo convencional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Laddered Simple Attention Network (transformer modificado): MLP Monarch Hadamard en lugar de FFN, atencion GQA con taps convolucionales causales, memoria engram de n-gramas leida por gather, hyper-connections multicarril |
| Parametros totales | 121M en el modelo completo de 20 capas (la mayor parte en el engram); subredes desplegables de 2 a 20 capas, la mas pequena a partir de 29M parametros tras ajuste fino segun la model card |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | CQ2-bit (Cactus Quants), 2,125 bits por peso, para el fichero `.cact` desplegado; exportaciones de subredes a 4 bits mediante `needle build`; precision del checkpoint safetensors no disponible |
| Idiomas soportados | no disponible (la model card no declara idiomas; los ejemplos y guias estan en ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | `needle3.cact` (formato de contenedor propio, mapeado en memoria por el engine) y `needle3.safetensors` (checkpoint para ajuste fino) |
| Tamano del fichero de modelo | entre 8 y 29 MB en un unico fichero, segun la profundidad de la subred |
| Tamano del repositorio | 0,3 GB |
| Libreria | cactus-needle |
| Fecha de creacion en HuggingFace | 2026-09-19 |

## Arquitectura y entrenamiento

El modelo se apoya en una receta de modelo pequeno propia de Cactus Compute. La FFN habitual se sustituye por un MLP Monarch Hadamard, lo que reduce el coste de la capa densa; la atencion es GQA con taps convolucionales causales, que inyecta informacion local sin depender solo del mecanismo de atencion; y buena parte de la capacidad se traslada a un engram de n-gramas consultado por gather, de forma que el modelo de 121M parametros "hace la aritmetica de uno de 50M". Sobre esa base se anaden hyper-connections multicarril. La propiedad estructural clave es la escalera (ladder): el entrenamiento hace que cada profundidad de 2 a 20 capas sea un modelo desplegable, y `needle build --layers N` corta la subred y la exporta al mismo engine.

El ajuste fino se realiza con LoRA sobre la base congelada a las 20 capas completas; despues se fusiona el adaptador, se corta la subred deseada y se exporta un `.cact` de 4 bits. Segun la model card, el ajuste fino sobre DroidCall mejora todas las subredes entre 18 y 36 puntos, y a partir de 4 capas la subred ajustada supera a DeepSeek V4 Flash, empezando en 29M parametros. La decodificacion esta restringida por una gramatica a nivel de byte compilada a partir de los esquemas del usuario, de modo que la salida siempre parsea, y cada respuesta incluye una puntuacion de confianza calibrada procedente de una cabeza aprendida. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon RLHF o DPO; la cuantizacion de 2 bits posterior al entrenamiento y los datos propietarios de Cactus se ejecutan en la Cactus Platform.

## Capacidades

- Tool calling y function calling: dado un conjunto de funciones declaradas por la aplicacion, el modelo selecciona las correctas y rellena todos los argumentos a partir de lo que dice el usuario. Si la peticion incluye dos acciones, devuelve dos llamadas en orden.
- Rechazo explicito: ante una peticion que ninguna herramienta cubre, devuelve una lista vacia en lugar de inventar una llamada.
- Extraccion estructurada: se declara una forma (factura, reserva, notificacion, formulario) y el modelo devuelve campos tipados; la gramatica de decodificacion garantiza que la salida parsea.
- Clasificacion por extension: la extraccion generaliza a clasificacion usando enumerados en el esquema.
- Embeddings de texto: el mismo modelo devuelve un vector para una frase mediante `needle_embed`, habilitando busqueda, emparejamiento y enrutado locales.
- Confianza calibrada: cada turno devuelve un objeto JSON con `function_calls`, el `reasoning` del modelo y una `confidence`, lo que permite decidir entre actuar, confirmar o rechazar.
- Ejecucion 100 % on-device: sin llamadas de red, con engines por plataforma de menos de 1 MB, soporte de navegador, WASI y despliegue en entornos aislados (air-gapped).
- Ajuste y poda: fine-tuning con LoRA y exportacion de subredes de 2 a 20 capas sobre el mismo engine.
- No se documentan en la informacion disponible capacidades de vision, audio, generacion de codigo general, matematicas ni razonamiento abierto de proposito general; la model card indica explicitamente que se sacrifica capacidad de chat general.

## Casos de uso

- Asistentes moviles con acciones: una app declara funciones como poner una alarma, enviar un mensaje o ajustar el brillo, y Needle 3 resuelve la llamada con sus argumentos a partir de lenguaje natural, sin salir del dispositivo y sin coste de inferencia en la nube.
- Automatizacion del hogar: el modelo traduce ordenes tipo "baja la persiana del salon y apaga las luces" en dos llamadas ordenadas a las APIs del sistema domotico, ejecutandose en un hub o incluso en un microcontrolador con la subred de 2 capas.
- Interfaces de voz para automocion: al ser un modelo de 8 a 29 MB, cabe en la unidad de infoentretenimiento y permite comandos de navegacion, climatizacion o medios con latencia local y sin depender de conectividad, algo critico cuando el coche pierde cobertura.
- Procesamiento de documentos en el borde: extraccion de campos de facturas, reservas o formularios con un esquema declarado, garantizando mediante gramatica que el JSON resultante parsea, util en gestoria, logistica o recepcion de pedidos sin enviar datos sensibles a terceros.
- Clasificacion y enrutado de tickets: usando enumerados como campos tipados, el modelo asigna categoria y prioridad a notificaciones o incidencias en el propio dispositivo, y la puntuacion de confianza permite escalar a un humano o a un modelo mayor solo los casos dudosos.
- Busqueda semantica local: con `needle_embed`, una aplicacion de notas, correo o catalogo puede indexar y recuperar contenido por similitud sin subir texto a un servicio externo.
- Agentes de multiples pasos en dispositivos sin red: en escenarios industriales o sanitarios con requisitos de aislamiento, el modelo puede encadenar llamadas a herramientas locales dentro de un flujo controlado por la aplicacion.
- Wearables y robots: la escalera de profundidades permite desplegar la subred que mejor se ajusta al presupuesto de computo del dispositivo, reutilizando el mismo engine y el mismo formato de pesos.

## Benchmarks y rendimiento

La model card indica que se evaluan seis benchmarks, con tool calling medido como exact-match accuracy sobre los conjuntos de test completos y extraccion como micro-F1 por campo sobre los mismos conjuntos. Los valores numericos se presentan en graficos SVG (`assets/benchmarks.svg` y `assets/finetune.svg`) y no estan disponibles como cifras en la informacion proporcionada.

| Benchmark | Metrica | Resultado |
|---|---|---|
| Tool calling (conjunto de seis benchmarks, dos de ellos identificados como DroidCall y Mobile Actions) | exact-match accuracy | no disponible (solo en grafico) |
| Extraccion estructurada | micro-F1 por campo | no disponible (solo en grafico) |
| Ajuste fino sobre DroidCall | mejora de subredes de 2 a 20 capas | entre +18 y +36 puntos (dato cualitativo de la model card) |
| Subredes ajustadas de 4 capas o mas | comparacion con DeepSeek V4 Flash | las supera, desde 29M parametros (dato cualitativo de la model card) |
| Comparacion con modelos 10x mayores en tool calling movil | rendimiento relativo | el modelo los supera (afirmacion del autor, sin cifra disponible) |
| Comparacion en extraccion con modelos 2-3x mayores | rendimiento relativo | los iguala (afirmacion del autor, sin cifra disponible) |

## Requisitos de hardware

- VRAM estimada para inferencia: muy reducida; el modelo completo se distribuye en un unico fichero de 8 a 29 MB, por lo que el peso en memoria es de decenas de MB incluyendo el engine (menos de 1 MB por plataforma). No se publican cifras exactas de VRAM ni de memoria RAM necesaria.
- GPU recomendadas: no se especifican; el objetivo declarado es hardware de borde (moviles, wearables, robots, domotica, automocion y microcontroladores) y navegador via WebAssembly.
- GPU de consumo: el modelo cabe sin dificultad en cualquier GPU de consumo, e incluso en dispositivos sin GPU dedicada, dado el tamano del fichero. No se documentan requisitos minimos concretos.
- Opciones de despliegue: paquete Python `cactus-needle`, CLI `needle` (`./needle --model needle3.cact --tools tools.json --prompt ...`), API en C, navegador, WASI y despliegue en entornos aislados. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el runtime es el engine propio de Cactus, con un folder de plataforma por destino y engines de menos de 1 MB.
- Latencia y throughput: no disponibles. Las guias del proyecto enlazan a la pagina de release en cactuscompute.com/needle para el grafico de frontera interactivo, pero no se ofrecen cifras extraidas en la informacion proporcionada.
- Almacenamiento: el repositorio ocupa 0,3 GB, incluyendo pesos, checkpoint safetensors y engines por plataforma.

## Comparativa con modelos similares

La informacion proporcionada solo menciona explicitamente un modelo de referencia, DeepSeek V4 Flash, y lo hace en el contexto de subredes ajustadas con LoRA sobre DroidCall (a partir de 4 capas y 29M parametros). No hay datos publicados de parametros, contexto, licencia ni disponibilidad de ese modelo en la informacion disponible, ni de otros modelos de tool calling on-device.

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Needle 3 (este repositorio) | 121M (20 capas), subredes desde 2 capas | no disponible | supera a modelos 10x mayores en tool calling movil segun el autor; cifras no disponibles | apache-2.0 | HuggingFace (copia de tercero), pip `cactus-needle`, GitHub |
| DeepSeek V4 Flash | no disponible | no disponible | superado por subredes ajustadas de Needle 3 desde 4 capas y 29M parametros | no disponible | no disponible |
| Alternativas de tool calling on-device | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El repositorio analizado es una copia de tercero (`kirikir13/needle3`) con 0 descargas y 0 likes; no es el repositorio oficial de Cactus Compute. Conviene verificar integridad de pesos y procedencia antes de usarlo en produccion.
- La model card reconoce explicitamente que se sacrifica capacidad de chat general para optimizar tool calling y extraccion: no es un modelo para conversacion abierta, redaccion libre o razonamiento general.
- No se declaran idiomas soportados. Los ejemplos, guias y benchmarks de la informacion disponible estan en ingles, por lo que el rendimiento en castellano es una incognita.
- No se publican datos de sesgos, composicion del dataset de entrenamiento ni evaluaciones de robustez. El riesgo de alucinacion se mitiga con lista vacia ante peticiones fuera de cobertura y con confianza calibrada, pero no se ofrecen tasas de error.
- La garantia de formato depende de la gramatica de decodificacion: si el esquema declarado es incorrecto o incompleto, la salida parseara igualmente pero con campos semanticamente erroneos.
- La ventana de contexto no esta documentada, lo que limita el diseno de flujos con historiales largos o documentos extensos.
- Las cifras de benchmarks no estan disponibles como numeros en la informacion proporcionada; las afirmaciones de superioridad frente a modelos mayores y de mejora de 18 a 36 puntos proceden del autor y se presentan en graficos no extraidos.
- El ajuste fino y la cuantizacion de 2 bits posteriores al entrenamiento pasan por la Cactus Platform con datos propietarios, lo que puede introducir dependencia de un servicio externo para reproducir el modelo tal cual se distribuye.
- Aunque la licencia es Apache 2.0, se debe revisar la licencia de los engines por plataforma y de los datasets empleados (DroidCall, Mobile Actions) antes de un uso comercial.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kirikir13/needle3
- Pagina de release, arquitectura y grafico de frontera interactivo: https://cactuscompute.com/needle
- Repositorio y codigo fuente: https://github.com/cactus-compute/needle
- Plataforma Cactus: https://cactuscompute.com/dashboard
- Guia de diseno de herramientas: https://cactuscompute.com/blog/designing-tools-for-needle
- Guia sobre la confianza del modelo: https://cactuscompute.com/blog/needle-confidence
- Guia de extraccion JSON estructurada: https://cactuscompute.com/blog/structured-extraction-with-needle
- Guia de ajuste fino: https://cactuscompute.com/blog/finetuning-needle
- Documentacion del paquete Python: https://cactuscompute.com/blog/needle-python-docs
- Dispositivos soportados: https://cactuscompute.com/blog/needle-supported-devices
- Formato `.cact` y Cactus Quants: https://cactuscompute.com/blog/cact-format
- Notas de portabilidad a otros runtimes: https://cactuscompute.com/blog/porting-needle
