# liskasYR/needle3

## Resumen

Needle 3 es un modelo fundacional disenado para ejecucion en dispositivo ("on-device"), orientado a moviles, wearables, robots, domotica, automocion y microcontroladores. Lo desarrolla Cactus Compute (la model card apunta a cactuscompute.com y al repositorio github.com/cactus-compute/needle), aunque el repositorio de HuggingFace esta publicado bajo la cuenta liskasYR. Su propuesta es radicalmente distinta a la de los LLM generalistas: sacrifica capacidad de conversacion abierta para superar en llamadas a herramientas (tool calling) a modelos diez veces mayores y para igualar a modelos dos o tres veces mayores en extraccion estructurada.

La arquitectura se denomina Laddered Simple Attention Network e incorpora un MLP Monarch Hadamard en lugar del FFN clasico, atencion GQA con derivaciones convolucionales causales, memoria de n-gramas ("engram") leida por gather y hiperconexiones multicarril. El modelo completo de 20 capas tiene 121M parametros, pero esta entrenado como una "escalera" en la que cada profundidad de 2 a 20 capas es un modelo desplegable de forma independiente, con tamanos de archivo de entre 8 y 29 MB. Los pesos se comprimen a CQ2-bit (Cactus Quants, 2,125 bits por peso), de modo que el modelo entero cabe en un unico fichero de decenas de MB.

La relevancia actual del modelo esta en la combinacion de tres tareas resueltas localmente sin red: llamadas a funciones, extraccion estructurada con gramatica a nivel de byte y embeddings de texto. Ademas, cada respuesta incluye una puntuacion de confianza calibrada procedente de una cabeza aprendida, lo que permite enrutar entre actuar, confirmar o rechazar sin llamar a un servicio externo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Laddered Simple Attention Network: MLP Monarch Hadamard en lugar del FFN, atencion GQA con derivaciones convolucionales causales, memoria de n-gramas ("engram") leida por gather, hiperconexiones multicarril |
| Parametros totales | 121M en el modelo completo de 20 capas; la subred de 4 capas citada en la model card parte de 29M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | CQ2-bit (Cactus Quants, 2,125 bits por peso) para el modelo publicado; exportacion a 4-bit mediante `needle build` para subredes afinadas |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.cact` (formato contenedor mapeado en memoria por el motor) y `.safetensors` (checkpoint para fine-tuning) |

Otros datos del repositorio: identificador `liskasYR/needle3`, libreria `cactus-needle`, pipeline `text-generation`, 110 descargas, 0 likes, tamano de repositorio 0,3 GB, creado y actualizado el 2026-09-22.

## Arquitectura y entrenamiento

Needle 3 no es un transformer denso convencional. Sustituye el FFN por un MLP Monarch Hadamard, usa atencion GQA con derivaciones convolucionales causales y anade una memoria de n-gramas ("engram") leida por gather junto con hiperconexiones multicarril. La mayor parte de los parametros reside en el engram, hasta el punto de que, segun el autor, el modelo de 121M realiza la carga aritmetica de uno de 50M. La caracteristica estructural clave es la "escalera": el entrenamiento garantiza que cada profundidad entre 2 y 20 capas sea un modelo desplegable por si mismo, lo que permite recortar el modelo hasta que quepa en el dispositivo objetivo sin reentrenar desde cero.

En el lado de la decodificacion, los pesos se comprimen a CQ2-bit (2,125 bits por peso) mediante Cactus Quants y una gramatica a nivel de byte, compilada a partir de los esquemas del usuario, restringe cada token generado, de modo que la salida siempre parsea. Una cabeza aprendida produce una puntuacion de confianza calibrada por respuesta. El ajuste fino se realiza con LoRA sobre la base congelada de 20 capas y despues `needle build [--layers N]` fusiona el adaptador, recorta cualquier subred entre 2 y 20 capas y exporta un `.cact` de 4 bits que corre en el mismo motor. La model card menciona conjuntos como DroidCall y Mobile Actions para el ajuste fino y senala que el entrenamiento posterior de 2 bits y la cuantizacion del modelo publicado, enriquecidos con datasets propietarios de Cactus, se ejecutan en la Cactus Platform. No se especifican el numero de tokens de entrenamiento ni la composicion del dataset base, ni si hubo RLHF o DPO.

## Capacidades

- Llamadas a herramientas (tool calling) y function calling: dada una lista de funciones expuestas por la aplicacion, el modelo selecciona las correctas y rellena todos los argumentos a partir de la peticion del usuario.
- Multiples llamadas ordenadas en un mismo turno: una peticion que pide dos cosas genera dos llamadas en orden.
- Rechazo explicito: una peticion que ninguna herramienta cubre devuelve una lista vacia en lugar de una invencion.
- Extraccion estructurada: a partir de una forma o esquema declarado y texto desordenado, devuelve campos tipados (facturas, reservas, notificaciones, formularios); la gramatica de decodificacion garantiza que la salida parsea.
- Clasificacion: la extraccion generaliza a clasificacion mediante enumeraciones en el esquema.
- Embeddings de texto: el mismo modelo devuelve un vector por frase, lo que permite busqueda, emparejamiento y enrutado local.
- Confianza calibrada: cada turno devuelve un objeto JSON con `function_calls`, el `reasoning` del modelo y una `confidence` calibrada, util para decidir entre actuar, confirmar o rechazar.
- Fine-tuning y recorte por profundidad: LoRA sobre la base congelada y exportacion de subredes de 2 a 20 capas.
- Despliegue multiplataforma: un motor de menos de 1 MB por carpeta de plataforma, con CLI, API en C, navegador, WASI y funcionamiento en entornos aislados (air-gapped).
- No se declaran capacidades de vision, audio, generacion de codigo general ni razonamiento de proposito general; la model card indica explicitamente que se sacrifica capacidad de chat general.

## Casos de uso

- Asistentes de voz en movil y automocion: el modelo interpreta una frase como "que tiempo hace en Lagos ahora mismo" y emite la llamada a `get_weather` con el argumento correcto, todo en el dispositivo y sin conexion, lo que evita latencia de red y problemas de privacidad.
- Domotica y control de dispositivos: comandos como "baja las luces del salon" se traducen en llamadas a funciones sobre un esquema de herramientas del hogar; el motor de menos de 1 MB puede embeberse en el propio dispositivo.
- Extraccion de facturas y documentos en aplicaciones de contabilidad: se declara el esquema de la factura y el modelo devuelve campos tipados garantizando que la salida parsea, sin necesidad de enviar documentos a un servidor.
- Procesamiento de notificaciones y formularios en el dispositivo: convertir texto desordenado de correos, avisos o formularios en registros tipados y clasificarlos con enumeraciones en el propio telefono.
- Busqueda semantica y enrutado locales: usando `needle_embed`, la aplicacion indexa y busca contenido sin salir del dispositivo, util para recuperacion de notas, contactos o documentacion offline.
- Robots, wearables y microcontroladores: la escalera de profundidades permite exportar una subred de 2 a 20 capas que quepa en el dispositivo objetivo, con archivos de 8 a 29 MB y cuantizacion de 2,125 bits por peso.
- Quioscos y entornos aislados (air-gapped): el soporte de WASI y de instalacion offline permite desplegar el asistente en terminales sin acceso a internet.
- Productos verticales con herramientas propias: ajuste fino con LoRA sobre la base congelada y exportacion de una subred especifica del producto; la model card indica que el ajuste sobre DroidCall mejora cada subred entre 18 y 36 puntos.
- Enrutado con umbral de confianza: aplicaciones que deciden entre ejecutar la accion, pedir confirmacion al usuario o rechazar la peticion basandose en la puntuacion de confianza calibrada.

## Benchmarks y rendimiento

La model card declara dos familias de metricas: exact-match para tool calling sobre las particiones de test completas y micro-F1 por campo para extraccion sobre las particiones de test completas. Sin embargo, las cifras concretas se presentan unicamente en graficos SVG (`assets/benchmarks.svg`, `assets/frontier.svg`, `assets/finetune.svg`) y no como texto, por lo que no se han podido extraer valores numericos.

| Aspecto evaluado | Metrica | Resultado |
|---|---|---|
| Tool calling movil | exact-match sobre test completo | no disponible (solo en grafico) |
| Extraccion estructurada | micro-F1 por campo sobre test completo | no disponible (solo en grafico) |
| Ajuste fino en DroidCall | mejora de cada subred | +18 a +36 puntos segun el autor |
| Subred de 4 capas afinada | comparacion con DeepSeek V4 Flash | el autor afirma que la supera a partir de 29M parametros |
| Comparacion general | modelos 10x mayores en tool calls moviles y 2-3x mayores en extraccion | afirmacion cualitativa del autor, sin cifras en texto |

No se han publicado resultados numericos adicionales de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra publicada. Como referencia de orden de magnitud, el modelo completo de 121M parametros a 2,125 bits por peso ocupa aproximadamente 32 MB de pesos, y una subred de 29M parametros unos 8 MB; hay que sumar activaciones y cache KV.
- El modelo completo se distribuye como un unico fichero de 8 a 29 MB, por lo que esta pensado para caber en memoria de dispositivos muy limitados, incluyendo microcontroladores, moviles y wearables.
- GPU recomendadas: no disponible. El perfil objetivo no es GPU de centro de datos, sino CPU y aceleradores de dispositivo; no se documentan requisitos para A100, H100 o RTX 4090.
- Cabe en GPU de consumo: si, con margen amplio, dado el tamano de pesos, aunque no es el escenario de despliegue declarado.
- Opciones de despliegue: paquete Python `cactus-needle` (`pip install cactus-needle`), carpetas de motor por plataforma (menos de 1 MB cada una) con CLI y API en C, navegador mediante WebAssembly y WASI, y ejecucion air-gapped sin red.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La model card no identifica por nombre a los modelos base de comparacion, salvo DeepSeek V4 Flash en el contexto del ajuste fino. La comparacion publicada es cualitativa y por categoria de tamano.

| Modelo | Parametros | Contexto | Rendimiento comparado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Needle 3 (20 capas) | 121M | no disponible | Referencia del autor: supera en tool calls moviles a modelos 10x mayores y empata con modelos 2-3x mayores en extraccion | Apache 2.0 | HuggingFace y sitio del fabricante |
| Needle 3, subred de 4 capas afinada | desde 29M | no disponible | El autor afirma que supera a DeepSeek V4 Flash | Apache 2.0 (base) | Generada localmente con `needle build` |
| DeepSeek V4 Flash | no disponible | no disponible | Citado como linea base superada por la subred afinada | no disponible | no disponible |
| Modelos generalistas de tool calling en la nube | no disponible | no disponible | La model card solo afirma superioridad de Needle 3 en tool calls moviles; sin cifras en texto | no disponible | no disponible |

No hay datos suficientes en la informacion proporcionada para construir una comparativa numerica con alternativas concretas.

## Limitaciones y advertencias

- El propio autor reconoce que el modelo sacrifica capacidad de conversacion general: no debe evaluarse como un chat de proposito general.
- Las peticiones que no encajan en ninguna herramienta declarada devuelven una lista vacia; esto es un comportamiento intencionado, pero implica que el modelo no responde a preguntas fuera de su esquema.
- Riesgo de alucinacion acotado por la gramatica a nivel de byte, que garantiza que la salida parsea, pero no que el contenido sea correcto; la puntuacion de confianza calibrada es el mecanismo previsto para mitigarlo y puede fallar.
- Idiomas soportados: no disponible. No se declara cobertura multilingue, por lo que la calidad fuera del idioma o idiomas de entrenamiento (no especificados) es una incognita.
- Longitud de contexto: no disponible, lo que impide dimensionar cache KV y planificar escenarios de contexto largo.
- Numero de tokens de entrenamiento, composicion del dataset base y uso de RLHF o DPO: no disponibles.
- Dependencia del ecosistema: el modelo requiere la libreria `cactus-needle` o un motor por plataforma, y el formato `.cact` esta definido por el fabricante. Escribir un runtime propio exige seguir su documento de portabilidad.
- El ajuste fino de 2 bits y la cuantizacion del modelo publicado se realizan en la plataforma propietaria de Cactus, lo que puede limitar la reproducibilidad completa del artefacto distribuido.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar los terminos de la plataforma propietaria si se reproducen sus etapas de cuantizacion.
- Discrepancia de atribucion: el desarrollador aparente es Cactus Compute, mientras que el repositorio de HuggingFace esta bajo la cuenta liskasYR y no tiene likes ni un historial de versiones amplio; conviene verificar la procedencia de los pesos antes de usarlos en produccion.
- Fecha de creacion del repositorio indicada como 2026-09-22, posterior a la fecha de consulta habitual; conviene confirmar la vigencia y la version real de los pesos descargados.
- El diseno de las herramientas afecta directamente al rendimiento; la documentacion insiste en usar una herramienta por accion, nombres que los usuarios pronunciarian y formatos declarados en las descripciones.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/liskasYR/needle3
- Pagina de release y graficos interactivos: https://cactuscompute.com/needle
- Codigo fuente y paquete Python: https://github.com/cactus-compute/needle
- Guia de diseno de herramientas: https://cactuscompute.com/blog/designing-tools-for-needle
- Uso de la confianza calibrada: https://cactuscompute.com/blog/needle-confidence
- Extraccion JSON estructurada: https://cactuscompute.com/blog/structured-extraction-with-needle
- Ajuste fino de Needle: https://cactuscompute.com/blog/finetuning-needle
- Documentacion del paquete Python: https://cactuscompute.com/blog/needle-python-docs
- Dispositivos soportados: https://cactuscompute.com/blog/needle-supported-devices
- Formato `.cact` y Cactus Quants: https://cactuscompute.com/blog/cact-format
- Notas de portabilidad del runtime: https://cactuscompute.com/blog/porting-needle
- Plataforma de entrenamiento y cuantizacion: https://cactuscompute.com/dashboard

Nota sobre la busqueda web: las consultas realizadas devolvieron unicamente resultados de foros en arabe sin relacion alguna con el modelo (hilos de pasatiempos y television). No se ha encontrado informacion externa adicional contrastable sobre Needle 3.
