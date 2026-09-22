# slvDev/esp32-ai-fly

## Resumen

esp32-ai-fly no es un modelo de lenguaje: es un paquete de datos y runtime que permite ejecutar un subgrafo del conectoma del cerebro central de *Drosophila melanogaster* directamente sobre un microcontrolador ESP32-S3 con 16 MB de flash y 8 MB de PSRAM. Lo publica el usuario slvDev bajo licencia CC BY 4.0 para los datos (el codigo del runtime es MIT), y parte de MaleCNS v1.0, el dataset de conectoma del sistema nervioso central de la mosca macho publicado por Janelia. El paquete conserva 48.311 neuronas, 9.462.135 aristas dirigidas agregadas neurona-a-neurona y 49.481.754 contactos sinapiticos, comprimidos en 14.174.411 bytes (13,518 MiB) con bloques LZ4 independientes de 32 filas.

La relevancia del proyecto es de ingenieria embebida y neurociencia computacional: demuestra que un grafo de conectividad de escala realista puede caber en la memoria de un microcontrolador y recorrer todas sus aristas en placa usando dos nucleos, SIMD y una cache en PSRAM, sin ordenador externo. La demostracion incluida es un circuito de escape ante una arana en aproximacion (looming) que se ejecuta de extremo a extremo en el dispositivo: el grafo, el circuito, el mundo simulado y la pantalla OLED.

Conviene subrayarlo: no hay ningun parametro entrenado. No hay pesos, no hay ajuste fino, no hay RLHF ni `transformers`. El circuito de escape es un fichero de texto que nombra neuronas de entrada y salida, una amplitud de entrada y un umbral, y se obtuvo estimulando grupos de neuronas y midiendo que neuronas descendentes respondian. La dinamica de tasa (rate dynamics) y la interfaz de escape son decisiones de ingenieria, no reconstrucciones biologicas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No es una red neuronal entrenada. Grafo de conectividad biologica (conectoma) con dinamica de tasa y aritmetica de estado Q29, ejecutado por un runtime C personalizado sobre ESP32-S3 |
| Parametros totales | 0 parametros entrenados ("trained parameters: none"). El grafo retenido contiene 48.311 neuronas y 9.462.135 aristas dirigidas agregadas |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | No aplica cuantizacion de pesos. El grafo se comprime con LZ4 en bloques de 32 filas independientemente decodificables; el estado se calcula en aritmetica Q29, verificada contra referencia en coma flotante con tolerancias explicitas |
| Idiomas soportados | en (la documentacion y la model card estan en ingles) |
| Licencia | Datos: CC BY 4.0. Codigo: MIT. Los avisos de datos incluidos conservan sus terminos CC BY 4.0 |
| Formato de pesos | No hay pesos. Assets: `connectome.fcl` (grafo fijo comprimido), `escape-circuit.json`, `model_bundle.json`, `neurons.csv`, `SUBGRAPH.json`, `connections-by-superclass.csv`, `gold-device-order.bin`, `escape-gold.bin`, `esp32-ai-fly-source.tar.gz` |

Otros datos del paquete:

| Componente | Valor |
|---|---:|
| Grafo comprimido | 14.174.411 bytes (13,518 MiB) |
| Fichero del circuito de escape | 38.724 bytes |
| Neuronas de entrada de looming | 311 (165 izquierda, 146 derecha; clases LC4 y LPLC2) |
| Neuronas de salida de escape | 8 (4 por lado: DNp01, DNp02, DNp04, DNp11) |
| Amplitud de entrada para ojo completamente en looming | 0,8 |
| Umbral de escape sobre la media de salida de un lado | 0,05 |
| Poblacion anotada de partida tras el filtro | 166.700 celulas |
| Tamano del repositorio en HuggingFace | 0,1 GB |

## Arquitectura y entrenamiento

El paquete no entrena nada. La seleccion parte de MaleCNS v1.0, tomando filas de anotacion con `superclass` no vacio y `status != Glia`, ordenadas por body ID. De esa poblacion se conservan unicamente las superclases que empiezan por `cb_`, `visual_` o `descending_neuron`, y una conexion se retiene solo si ambos extremos estan retenidos. No hay umbral adicional de fuerza de arista. El filtrado elimina todas las clases `vnc_*`, `ol_intrinsic` y `ol_sensory`, las neuronas ascendentes y otras clases documentadas en `SUBGRAPH.json`. La seleccion es por anotacion celular, no por coordenadas sinapticas, de modo que las celulas descendentes retenidas pueden tener procesos en el cordon nervioso y sus contactos no se recortan espacialmente. El autor insiste en que esto no equivale al cerebro completo con el cordon cortado.

El motivo del recorte es puramente de capacidad: la codificacion sin perdidas mas pequena medida para el sistema nervioso completo era de 24,49 MiB, y de 20,99 MiB eliminando las clases del cordon nervioso, frente a unos 14 MiB de flash disponibles para el grafo. Esta seleccion ocupa 8,61 MiB en su codificacion mas compacta y 13,5 MiB en el formato de runtime, que almacena bloques decodificables de forma independiente. En ejecucion, el runtime procesa cada arista retenida en placa con dos nucleos, SIMD y una cache en PSRAM.

La innovacion tecnica esta en la cadena de compresion y verificacion mas que en el aprendizaje: compresion exacta del grafo (todas las aristas y sus conteos se preservan), aritmetica de estado Q29 como aproximacion separada validada contra referencia en coma flotante, y un conjunto de artefactos de verificacion (`gold-device-order.bin` con seis casos de referencia de grafo y 32 actualizaciones cada uno; `escape-gold.bin` con cinco casos de referencia de escape y 24 pasos cada uno). `SOURCE_CODE.json` registra la revision de Git o el snapshot del arbol de trabajo con el hash de cada fichero, incluyendo cambios no confirmados respecto a la revision base. No se incluye firmware precompilado, y los binarios usan el runtime C incluido, no `transformers`.

## Capacidades

- Simulacion de un subgrafo del conectoma del cerebro central de la mosca de la fruta en un ESP32-S3, con 48.311 neuronas y 9.462.135 aristas dirigidas.
- Procesamiento de todas las aristas retenidas en el propio dispositivo, usando dos nucleos, SIMD y cache en PSRAM.
- Deteccion de looming mediante las neuronas de entrada LC4 y LPLC2 (311 en total, 165 en el lado izquierdo y 146 en el derecho), excitadas por una senal de looming calculada a partir de la distancia de una arana simulada.
- Circuito de escape completo: cuando la actividad media de las neuronas descendentes de escape de un lado supera el umbral de 0,05, la mosca salta en direccion contraria. Las salidas son DNp01 (la fibra gigante que hace saltar a una mosca real), DNp02, DNp04 y DNp11.
- Ejecucion autonoma de todo el sistema en placa: grafo, circuito, mundo simulado y pantalla OLED, sin ordenador participante durante la ejecucion.
- Reproducibilidad numerica: casos de referencia en dispositivo para el grafo y para el escape, con tolerancias explicitas y evidencia de validacion en `validation/`.
- Trazabilidad de datos: `SOURCE_DATA.json` y `ATTRIBUTION.md` registran version del dataset, ficheros de origen, credito y historial de modificaciones.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, vision artificial, tool calling, function calling, soporte de agentes, capacidades multilingues ni modo de pensamiento. La model card no declara pipeline de HuggingFace.

## Casos de uso

- Docencia de neurociencia computacional: el paquete permite mostrar en un dispositivo de bajo coste como una senal sensorial (looming) se propaga por un grafo de conectividad real y termina activando neuronas descendentes de escape, sin necesidad de un cluster ni de Python en el aula.
- Robotica bioinspirada: el circuito de escape LC4/LPLC2 a DNp01-DNp11 puede servir como controlador reactivo de evasion en plataformas moviles basadas en ESP32-S3, con una cadena sensorial simplificada que alimente las 311 neuronas de entrada con una amplitud maxima de 0,8.
- Investigacion en conectomica embebida: el subgrafo retenido y su formato comprimido permiten estudiar que se pierde al reducir un conectoma completo a un presupuesto de flash, comparando la codificacion de 8,61 MiB de esta seleccion con los 24,49 MiB del sistema nervioso completo.
- Validacion de runtimes numericos: los artefactos `gold-device-order.bin` y `escape-gold.bin`, junto con la comparacion de Q29 contra coma flotante con tolerancias, sirven para verificar portes del runtime a otras MCU o para auditar la estabilidad numerica de una dinamica de tasa.
- Pruebas de estres de hardware embebido: recorrer 9.462.135 aristas en cada paso de simulacion es una carga de trabajo repetible y medible para evaluar ancho de banda de PSRAM, uso de cache y reparto entre dos nucleos en la familia ESP32-S3.
- Reproducibilidad de resultados publicados: al incluir el snapshot de codigo, los hashes de cada fichero y los casos de referencia, el paquete permite replicar exactamente la demostracion de escape a partir de la version de datos declarada en `SOURCE_DATA.json`.
- Prototipado de interfaces neurona-maquina de bajo consumo: el mapeo explicito entre neuronas de entrada, umbral de salida y actuacion (salto) es un patron reutilizable para disenar politicas reactivas trazables a un sustrato biologico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay cifras de MMLU, HumanEval, GSM8K ni equivalentes, porque el artefacto no es un modelo de lenguaje y no se evalua en tareas de ese tipo.

La unica evidencia de rendimiento disponible es de correccion numerica y de encaje en memoria, no de calidad de tarea:

| Evidencia | Contenido |
|---|---|
| `gold-device-order.bin` | 6 casos de referencia de grafo, 32 actualizaciones cada uno |
| `escape-gold.bin` | 5 casos de referencia de escape, 24 pasos cada uno |
| Comparacion de aritmetica | Estado en Q29 contrastado con referencia en coma flotante, con tolerancias explicitas |
| Presupuesto de memoria | Grafo de 13,518 MiB en formato de runtime, 8,61 MiB en la codificacion sin perdidas mas pequena medida, frente a unos 14 MiB de flash disponibles |
| Ambito de validacion | Los informes de `validation/` identifican explicitamente su alcance (host o dispositivo) |

Latencia y throughput no disponibles.

## Requisitos de hardware

- Plataforma objetivo: ESP32-S3 con 16 MB de flash y 8 MB de PSRAM. El paquete esta dimensionado para ese presupuesto de memoria concreto.
- VRAM para inferencia: no aplica. No se ejecuta en GPU; no hay pesos que cargar ni cuantizaciones tipo GGUF, AWQ o GPTQ.
- GPU recomendadas: no aplica, ninguna.
- Compatibilidad con GPU de consumo: no aplica.
- Opciones de despliegue: runtime C propio incluido en `esp32-ai-fly-source.tar.gz`. No se contemplan vLLM, llama.cpp, Ollama ni TGI, y la model card indica explicitamente que los binarios usan el runtime C incluido, no `transformers`.
- Firmware precompilado: no incluido. Es necesario compilar desde el snapshot de codigo incluido.
- Almacenamiento: el grafo comprimido ocupa 14.174.411 bytes (13,518 MiB) y el fichero del circuito de escape 38.724 bytes, dentro de los 16 MB de flash.
- Computo: uso de dos nucleos y SIMD, con cache en PSRAM para recorrer las 9.462.135 aristas retenidas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se han identificado en la informacion disponible modelos comparables de la misma categoria (conectomas comprimidos con runtime embebido). La model card no incluye ninguna comparacion con alternativas. Los unicos datos comparativos publicados son internos, entre variantes de codificacion del mismo dataset de origen:

| Alternativa | Cobertura | Tamano de codificacion | Ejecucion en ESP32-S3 | Licencia |
|---|---|---|---|---|
| esp32-ai-fly (este paquete) | Subgrafo: superclases `cb_`, `visual_`, `descending_neuron`; 48.311 neuronas y 9.462.135 aristas | 8,61 MiB minimo sin perdidas; 13,518 MiB en formato de runtime | Si, en placa con 16 MB flash y 8 MB PSRAM | Datos CC BY 4.0, codigo MIT |
| Sistema nervioso completo (MaleCNS v1.0) | Conectoma completo | 24,49 MiB minimo sin perdidas | No cabe en el presupuesto de flash del objetivo | No disponible en la informacion proporcionada |
| Sistema nervioso sin clases de cordon nervioso | Conectoma completo menos clases `vnc_*` | 20,99 MiB minimo sin perdidas | No cabe en el presupuesto de flash del objetivo | No disponible en la informacion proporcionada |

Cualquier otra comparacion con modelos o frameworks alternativos: no disponible.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un modelo generativo. No debe evaluarse con criterios de MMLU, HumanEval ni similares.
- No contiene ningun parametro entrenado. El circuito de escape se obtuvo por estimulacion y medicion de respuestas, no por ajuste a una tarea.
- La dinamica de tasa y la interfaz de escape son decisiones de ingenieria del autor, no una reconstruccion fiel de la biologia de la mosca.
- Es un subgrafo inducido seleccionado, no el cerebro ni el sistema nervioso completo. Excluye todas las clases `vnc_*`, `ol_intrinsic`, `ol_sensory`, las neuronas ascendentes y otras clases del listado en `SUBGRAPH.json`.
- La seleccion es por anotacion celular, no por coordenadas sinapticas: los contactos de las celulas descendentes retenidas no se recortan espacialmente. No es "el cerebro entero con el cordon cortado".
- El recorte responde a un limite de memoria, no a un criterio funcional o biologico; partes del circuito pueden quedar incompletas por el simple hecho de que uno de sus extremos no fue retenido.
- La aritmetica de estado Q29 es una aproximacion. Esta verificada contra referencia en coma flotante, pero con tolerancias explicitas, no con exactitud.
- No se incluyen las imagenes de microscopia electronica originales, la morfologia neuronal ni las tablas crudas del conectoma. Solo hay grafo derivado y metadatos.
- No hay firmware precompilado: es necesario compilar el runtime incluido, lo que anade requisitos de toolchain y de version de SDK.
- Reproduccion condicionada a los hashes: si el arbol de trabajo de origen tenia cambios no confirmados, `SOURCE_CODE.json` los registra como snapshot, lo que puede dificultar la reconstruccion exacta desde Git.
- Idioma: la documentacion disponible esta solo en ingles.
- Licencia: los datos son CC BY 4.0 (requiere atribucion); el codigo es MIT. Los avisos de datos incluidos deben conservarse. Verificar los terminos de MaleCNS v1.0 para usos derivados antes de un despliegue comercial.
- Estado de adopcion: 0 descargas y 0 likes en HuggingFace, creado y actualizado el 22 de septiembre de 2026. No hay senales de uso en produccion ni de mantenimiento por terceros.
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a software de GoPro y no guardan relacion).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/slvDev/esp32-ai-fly
- Dataset de origen MaleCNS v1.0 (Janelia): https://male-cns.janelia.org/download/
- Ficheros internos del repositorio citados en la model card, accesibles desde el propio repositorio de HuggingFace: `SUBGRAPH.json`, `SUBGRAPH.md`, `SOURCE_DATA.json`, `SOURCE_CODE.json`, `ATTRIBUTION.md`, `FORMATS.md`, `metadata.json`, `SHA256SUMS`, `validation/`, `esp32-ai-fly-source.tar.gz`
- Paper, blog o repositorio externo adicionales: no disponible en la informacion proporcionada. Las busquedas web realizadas no arrojaron resultados relacionados.
