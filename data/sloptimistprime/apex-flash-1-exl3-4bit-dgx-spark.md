# SloptimistPrime/apex-flash-1-EXL3-4bit-DGX-Spark

## Resumen

Apex Flash 1 EXL3 4-bit DGX Spark es una cuantizacion del modelo Cantina Apex Flash 1 (cantina-security/apex-flash-1), publicada por el usuario SloptimistPrime. Se trata de una version preparada especificamente para ejecutarse en dos sistemas NVIDIA DGX Spark GB10 en paralelo, con los expertos enrutados codificados a 4 bits mediante EXL3 MCG y el resto de componentes (atencion, expertos compartidos, routers, embeddings, cabeza de salida y tensores de vision) mantenidos en la precision del modelo original. El repositorio contiene 175,6 GB de tensores repartidos en 23 shards, y el autor declara explicitamente que la cuantizacion de 4 bits describe unicamente a los expertos, no al tamano medio de todos los pesos.

El punto relevante de esta ficha es su estado: segun la propia model card, los ficheros del modelo todavia no estan disponibles en el momento de redactarla, y la pagina describe una release preparada. Ademas, requiere dos maquinas con el directorio completo del modelo replicado en cada una, no cabe en un solo Spark y no sigue la ruta de cuantizacion SAGE. El valor practico, por tanto, esta en la receta de despliegue (runtime TensorFold sobre Podman, ExLlamaV3 v1.5.3), en las mediciones de degradacion frente al modelo sin cuantizar y en el soporte de decodificacion especulativa nativa (MTP) y con drafter externo (DFlash2).

El modelo base pertenece a la familia identificada con la etiqueta glm5_next y conserva capacidades de vision nativas en su plantilla de chat, ademas de soporte de tool calling y razonamiento. La licencia declarada de los pesos es MIT, pero el drafter opcional DFlash2 que se descarga por separado esta bajo CC BY-NC-ND 4.0, con terminos comerciales independientes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE dispersa: expertos enrutados, expertos compartidos, routers, cabeza de salida, multi-token prediction (MTP) y torre de vision. Familia etiquetada como glm5_next |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 65.536 tokens; probado con prompts de 64.445 tokens en configuracion de una sola peticion. Configuraciones validadas: 8K, 32K y 64K |
| Tipos de cuantizacion | 4 bits EXL3 MCG en expertos enrutados (incluidos los de MTP); BF16 en atencion, expertos compartidos, routers, embeddings, cabeza de salida y tensores de vision. No es cuantizacion SAGE |
| Idiomas soportados | no disponible; entre las pruebas de texto se incluye frances |
| Licencia | MIT (pesos de este repositorio). El drafter opcional incoai/GLM-5.3-Flash-DFlash2 usa CC BY-NC-ND 4.0 con terminos comerciales aparte |
| Formato de pesos | safetensors, 23 shards, 175,6 GB de tensores (repositorio de 149,5 GB) |
| Relacion con el modelo base | Cuantizacion de cantina-security/apex-flash-1 (revision de origen 28c647a6bd0444973a7ef3d940c24c67e64f52fe) |
| Runtime de referencia | Imagen TensorFold sobre Podman; ExLlamaV3 v1.5.3 (d3739fd393337b1ff4d6c2a342b12f0c87a9592f) con parche de K entero |
| Estado de publicacion | Ficheros no disponibles todavia; pagina de release preparada |
| Descargas / likes | 13 / 0 |
| Fecha de creacion | 2026-10-07 |

## Arquitectura y entrenamiento

La model card describe un modelo de mezcla de expertos con expertos enrutados y expertos compartidos, routers, capa de salida, tensores de vision y cabezas de prediccion multi-token (MTP). La cuantizacion afecta a 37.152 proyecciones de expertos enrutados, MTP incluido, sobre un total de 150.226 tensores, de los cuales 1.618 se restauraron a su precision nativa desde el modelo fuente. Los expertos enrutados usan codificacion EXL3 MCG a 4 bits; el resto del grafo permanece en BF16. El autor indica que el camino denso BF16 es el unico probado y que no se validaron otras codificaciones densas. La calibracion se hizo con el corpus fijado de ExLlamaV3: 250 filas de 2.048 tokens, con entradas de comparacion independientes.

No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO, porque la ficha proporcionada corresponde a la cuantizacion y no al modelo base. Lo que si se documenta es la metodologia de construccion (receta adaptada de WamboDNS/apex-flash-1-EXL3-4bpw, scripts de restauracion, manifiesto y sumas SHA256) y el motor de inferencia: ExLlamaV3 v1.5.3 con un parche de K entero. La innovacion tecnica destacable es la decodificacion especulativa: MTP nativo, que reprodujo los tokens de la ruta serial en tres comprobaciones greedy y mejoro la velocidad de decodificacion entre 1,7 y 2,3 veces, y el drafter DFlash2 externo, que igualo esos tokens y mejoro la velocidad entre 1,8 y 3,0 veces. Tambien se validaron tres comprobaciones de muestreo con semilla a temperatura 0,7.

## Capacidades

- Generacion de texto y razonamiento: las pruebas cubren aritmetica, inventario, planificacion, deduplicacion y razonamiento.
- Codigo: verificacion de tipos en Python y generacion de estructuras anidadas. En un caso el modelo devolvio las claves correctas pero uso `result` en lugar de `results`, por lo que conviene validar claves requeridas ademas de la sintaxis JSON.
- Tool calling / function calling: incluido entre las comprobaciones de texto declaradas en la model card.
- Recuperacion con contexto largo: respuestas correctas con prompts de 7.727, 30.885 y 64.445 tokens.
- Vision: conteo de imagenes y OCR mediante un adaptador pequeno aplicado al runtime, ya que Apex incorpora marcadores de imagen nativos en su plantilla de chat. Probado con imagenes sinteticas; fotos, documentos escaneados, graficos y video no se han probado.
- Generacion con contrato JSON: con `response_format: {"type": "json_object"}` paso 6/6 en el conjunto de imagenes y 5/6 en el de texto; sin modo JSON solo 2/6 y 1/6 respectivamente.
- Multilingue: se verifico frances en las pruebas de texto; el resto de idiomas no esta documentado.
- Decodificacion especulativa: MTP nativo y drafter DFlash2 opcional, ambos con coincidencia de tokens frente a la ruta serial.
- Servicio concurrente: cuatro decodificadores de texto simultaneos devolvieron JSON correcto y coincidieron con las respuestas seriales, con y sin DFlash2.

## Casos de uso

- Recuperacion aumentada sobre corpus extensos: con una unica peticion y hasta 64.445 tokens de prompt, el modelo respondio correctamente en las pruebas; encaja en analisis de documentacion legal o tecnica que no se puede trocear sin perder contexto.
- Atencion al cliente con varias sesiones simultaneas: la configuracion `PARALLEL=4 CONTEXT=8192` sostiene cuatro decodificadores de texto a la vez, adecuada para un servicio de conversaciones multi-turno con respuestas en JSON.
- Extraccion de datos estructurados en pipelines: con modo JSON activado, la tasa de cumplimiento del contrato sube de 1/6 a 5/6 en las pruebas de texto, lo que lo hace util para generar registros validables en cadena.
- Automatizacion de agentes con tool calling: el soporte declarado de llamadas a herramientas permite integrarlo en flujos multi-paso de orquestacion, por ejemplo consulta de inventario y planificacion.
- OCR y conteo de elementos en imagenes: el modo `VISION=1` permite contar objetos y extraer texto de imagenes compuestas, con la salvedad de que solo se ha validado sobre imagenes sinteticas.
- Despliegue on-premise con requisitos de privacidad: al ejecutarse en dos DGX Spark con el modelo montado en solo lectura via Podman, resulta apto para entornos donde los datos no pueden salir de la infraestructura.
- Asistencia a programacion verificada: las pruebas de tipos en Python y de estructuras anidadas lo sitúan como apoyo para generar y validar fragmentos de codigo dentro de un pipeline de CI/CD, con validacion adicional de claves.
- Procesamiento de inventario y planificacion de recursos: las comprobaciones de inventario, scheduling y deduplicacion indican uso directo en tareas de back-office con reglas estrictas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. Los unicos datos cuantitativos son la comparacion frente al modelo sin cuantizar en el mismo motor ExLlamaV3, sobre ocho ventanas de texto de 128 tokens:

| Metrica | Valor |
|---|---|
| Coincidencia de token mas probable (top-token) | 92,22% |
| Divergencia KL media | 0,05935 nats |
| Perplexity de la version 4-bit | 4,7390 |
| Perplexity del modelo sin cuantizar | 4,6869 |
| Incremento de perplexity | ~1,1% |
| Coincidencia cruzada entre ExLlamaV3 y TensorFold | 8 comprobaciones, siguiente token coincidente |
| Aceleracion con MTP nativo | 1,7x a 2,3x en velocidad de decodificacion |
| Aceleracion con DFlash2 | 1,8x a 3,0x en velocidad de decodificacion |

El propio autor advierte que estos numeros no establecen precision en todas las tareas y que las comprobaciones de agreement cruzado se hicieron en 128 tokens por ventana.

## Requisitos de hardware

- Dos sistemas NVIDIA DGX Spark GB10. El modelo no cabe en un solo Spark y el autor lo indica explicitamente.
- Cada maquina necesita el directorio completo del modelo: 175,6 GB de tensores en 23 shards (repositorio de 149,5 GB). El almacenamiento debe planificarse por nodo, ya que no hay reparto de pesos entre equipos a nivel de fichero.
- GPU consumer: no viable. No se documenta ejecucion en RTX 4090 ni en ninguna GPU de un solo equipo.
- Red: la configuracion de ejemplo requiere definir `MASTER_ADDR`, `NCCL_SOCKET_IFNAME`, `NCCL_IB_HCA` y `NCCL_IB_GID_INDEX`; se asume interconexion de baja latencia entre los dos nodos.
- Despliegue: imagen TensorFold `ghcr.io/miaai-lab/glm-5.3-flash-exl3-2x-dgx-sparks-tensorfold` con digest fijado, lanzada con Podman y modelo en solo lectura. Se ejecuta `serve-rank.sh` con RANK=0 en la primera maquina y RANK=1 en la segunda. La API escucha por defecto en `127.0.0.1:8000` de la primera maquina.
- Opciones de decodificacion probadas: `DRAFT_MODE=mtp` (MTP nativo, una peticion a la vez), `DRAFT_MODE=serial` (sin decodificacion especulativa) y `DRAFT_MODE=dflash2` (requiere `DRAFTER_DIR` con el drafter descargado aparte).
- Combinaciones paralelismo/contexto validadas: `PARALLEL=4 CONTEXT=8192`, `PARALLEL=2 CONTEXT=32768`, `PARALLEL=1 CONTEXT=65536`. Servicio con cuatro peticiones a 32K y servicio concurrente a 64K no se probaron.
- Vision: `VISION=1` requiere Python 3 en el host y ejecuta `prepare-vision-adapter.py`, que no modifica pesos ni plantilla de chat.
- Latencia y throughput absolutos: no disponible. Solo se publican factores de aceleracion relativos a la ruta serial (1,7x-2,3x con MTP y 1,8x-3,0x con DFlash2), que variaran segun la peticion.
- No se mencionan vLLM, llama.cpp, Ollama ni TGI como opciones soportadas para esta build.

## Comparativa con modelos similares

| Modelo | Relacion | Cuantizacion | Contexto probado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SloptimistPrime/apex-flash-1-EXL3-4bit-DGX-Spark | Este modelo | 4 bits EXL3 en expertos enrutados, resto BF16 | Hasta 65.536 | MIT | Ficheros aun no publicados |
| cantina-security/apex-flash-1 | Modelo base sin cuantizar | BF16 | no disponible en esta informacion | no disponible | Es el origen de la cuantizacion |
| WamboDNS/apex-flash-1-EXL3-4bpw | Cuantizacion previa, receta de partida | 4 bits por peso (bpw) | no disponible | no disponible | Referencia de la receta adaptada |
| incoai/GLM-5.3-Flash-DFlash2 | Drafter de decodificacion especulativa, no es un modelo completo | no aplica | no aplica | CC BY-NC-ND 4.0 con terminos comerciales aparte | Revision bf582e4eacc1810f76656d1811693ff6c6737d2a |

No se dispone de datos de rendimiento estandar para ninguno de los modelos comparados, por lo que la comparativa se limita a cuantizacion, contexto verificado y licencia.

## Limitaciones y advertencias

- Los ficheros del modelo no estaban disponibles en el momento de redactar esta ficha; la pagina describe una release preparada. No debe planificarse produccion sobre ella hasta su publicacion efectiva.
- Requiere dos nodos DGX Spark y el directorio completo del modelo en cada uno. No hay ruta soportada para un unico equipo.
- Degradacion medible frente al modelo sin cuantizar: 92,22% de coincidencia en el token mas probable y aproximadamente un 1,1% mas de perplexity en la ventana evaluada. El autor senala que estas pruebas no permiten atribuir los fallos observados especificamente a la cuantizacion, al no haberse comparado con las respuestas BF16.
- Cumplimiento de contrato JSON fragil sin modo JSON: 1/6 en texto y 2/6 en imagenes. Con `response_format: {"type": "json_object"}` sube a 5/6 y 6/6. Hay que validar sintaxis y claves obligatorias: en un caso se devolvio `result` en lugar de `results`.
- Vision poco validada: solo imagenes sinteticas. Fotos, documentos escaneados, graficos, video y peticiones de imagen simultaneas quedan sin probar. El video no se ha probado en absoluto.
- Escenarios sin validar: servicio con cuatro peticiones a 32K y servicio concurrente a 64K.
- Solo se ha probado el camino denso BF16; otras codificaciones densas no estan validadas y el autor recomienda mantener el valor por defecto.
- Una ejecucion de razonamiento se detuvo en un limite de 512 tokens, por lo que su resultado cubre un prefijo coincidente y no una respuesta completa.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion especifica de factualidad o sesgos para esta cuantizacion ni para el modelo base en la informacion disponible.
- Idiomas: solo hay verificacion declarada de frances. El comportamiento en otros idiomas no esta documentado.
- Licencia: los pesos de este repositorio son MIT, pero el drafter DFlash2 opcional esta bajo CC BY-NC-ND 4.0 con terminos comerciales separados y no queda cubierto por esa MIT. El uso comercial del drafter requiere negociar condiciones aparte.
- Reproducibilidad del build: la imagen base del encoder esta referenciada en `encoder-base-provenance.json` pero no se ha verificado una referencia exacta en un registro publico, y `Encoder.Containerfile` exige la variable `ENCODER_BASE_IMAGE`. Ademas, el parche de K entero de ExLlamaV3 esta registrado solo en la receta.
- Cifras de uso muy bajas (13 descargas, 0 likes) y fecha de creacion muy reciente, sin validacion independiente de terceros.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SloptimistPrime/apex-flash-1-EXL3-4bit-DGX-Spark
- Modelo base: https://huggingface.co/cantina-security/apex-flash-1
- Receta de cuantizacion de partida: https://huggingface.co/WamboDNS/apex-flash-1-EXL3-4bpw
- Drafter opcional DFlash2: https://huggingface.co/incoai/GLM-5.3-Flash-DFlash2
- Imagen de runtime TensorFold: ghcr.io/miaai-lab/glm-5.3-flash-exl3-2x-dgx-sparks-tensorfold@sha256:22789f0cb3dc308f0b2ce52a33961b88bd624af1725e91e8aba0a74a671bb969
- Revision de origen del modelo base: 28c647a6bd0444973a7ef3d940c24c67e64f52fe
- Revision del drafter probada: bf582e4eacc1810f76656d1811693ff6c6737d2a
- Ficheros de trazabilidad incluidos en el repositorio: `manifest.json`, `SHA256SUMS`, `serve-rank.sh`, `prepare-vision-adapter.py`, `encoder-base-provenance.json`
