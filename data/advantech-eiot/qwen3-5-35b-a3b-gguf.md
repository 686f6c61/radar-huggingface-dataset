# Advantech-EIOT/Qwen3.5-35B-A3B-GGUF

## Resumen

Advantech-EIOT/Qwen3.5-35B-A3B-GGUF es un repositorio de cuantizaciones GGUF publicado por Advantech-EIOT a partir del punto de control oficial Qwen/Qwen3.5-35B-A3B, un modelo multimodal de tipo imagen-texto a texto con 34.660.610.688 parametros (unos 34,7 mil millones) y arquitectura de mezcla de expertos, segun indica la nomenclatura "A3B" del nombre. No se trata de una publicacion oficial de Qwen: es una conversion de terceros que incluye dos cuantizaciones del modelo principal (Q4_K_M e IQ3_KT) y dos proyectores multimodales (BF16 y Q4_K_M) que deben emparejarse con el modelo principal del mismo tamano.

El problema que resuelve es el de hacer viable la ejecucion local de un modelo de vision-lenguaje de ~35B de parametros: reduce el peso del modelo principal de 21,17 GB (Q4_K_M) a 13,97 GB (IQ3_KT), de modo que quepa en GPU de consumo y en equipos edge. Para ello emplea una importance matrix especifica del modelo, calculada sobre 768 muestras y 511 entradas, con cobertura completa de los 120 tensores de expertos y 30.720 filas de expertos.

Su relevancia actual es doble: ofrece una via practica de despliegue local de un VLM con mezcla de expertos y documenta con inusual detalle el proceso de cuantizacion, las sumas de verificacion y los limites de la validacion realizada. Como contrapartida, exige un runtime no estandar (una compilacion de llama.cpp de la linea b8779 con soporte de Qwen3.5 VLM e IQ3_KT) que no se distribuye en el repositorio, y no aporta ningun benchmark de precision.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), variante multimodal de vision-lenguaje (pipeline image-text-to-text) |
| Parametros totales | 34.660.610.688 (~34,7 mil millones) |
| Parametros activos | ~3.000 millones segun la nomenclatura "A3B" del nombre del modelo (no confirmado en la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Modelo principal: Q4_K_M e IQ3_KT. Proyectores multimodales: BF16 y Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base) |
| Formato de pesos | GGUF (llama.cpp) |
| Modelo base | Qwen/Qwen3.5-35B-A3B (revision oficial 59d61f3ce65a6d9863b86d2e96597125219dc754) |
| Tamano del repositorio | 36,6 GB (4 ficheros) |
| Publicador | Advantech-EIOT (cuantizacion no oficial) |
| Fecha de publicacion | 16 de septiembre de 2026 |

Desglose de ficheros:

| Fichero | Tamano | SHA-256 (prefijo) |
|---|---|---|
| Q4_K_M/Qwen3.5-35B-A3B-Q4_K_M.gguf | 21.166.758.496 bytes (21,17 GB) | 55d8ff760b118f2d... |
| IQ3_KT/Qwen3.5-35B-A3B-IQ3_KT.gguf | 13.968.681.056 bytes (13,97 GB) | 74d0e9848bc8424d... |
| mmproj/mmproj-Qwen3.5-35B-A3B-BF16.gguf | 902.822.400 bytes (0,90 GB) | 79104874d7ab7b68... |
| mmproj/mmproj-Qwen3.5-35B-A3B-Q4_K_M.gguf | 514.318.464 bytes (0,51 GB) | 2dc7a331047bbf8f... |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos y capacidad multimodal (entrada de imagen y texto, salida de texto), cuyo detalle de entrenamiento —numero de tokens, composicion del dataset, uso de RLHF o DPO— no esta disponible en la informacion proporcionada. Lo que si documenta este repositorio es el proceso de cuantizacion posterior: ambas cuantizaciones principales parten de la misma conversion BF16 oficial y de la misma importance matrix especifica de modelo, sin requantizacion de terceros en bits bajos. Q4_K_M se genero con un cuantizador de la linea b8779 personalizada e IQ3_KT con el cuantizador de ik_llama.cpp, aunque la inferencia probada se mantuvo sobre el runtime b8779 personalizado.

La calibracion consta de 768 muestras y 511 entradas (DAT con SHA-256 4aa719b5d666a88d0a5f73fb4819e6ba6eb2108f4e3ae93d07099ae14be4cb7f). El colector conservo todos los tokens de prompt, imagen y respuesta hasta la capa FFN final; los datos ampliados "mixed768" alcanzaron cobertura completa de los 120 tensores de expertos y 30.720 filas de expertos, sin filas ausentes. El autor indica explicitamente que no se alteraron el enrutado ni los pesos para fabricar esa cobertura. El proyector Q4_K_M usa precision mixta nativa (Q4_K, Q5_0, Q8_0, F16 y F32) debido a las formas de los tensores de vision, de modo que no todos sus pesos son de 4 bits, y no se le aplico la importance matrix del modelo de lenguaje.

## Capacidades

- Generacion de texto conversacional: el repositorio incluye la etiqueta "conversational" y la plantilla Jinja se activa en el ejemplo de uso (`--jinja`), lo que permite servirlo mediante una API compatible con `/v1/chat/completions`.
- Comprension de imagen y texto (image-text-to-text): el modelo principal se combina con un proyector multimodal para aceptar imagenes como entrada.
- Descripcion de imagenes (captioning): en la validacion funcional, las descripciones generadas reflejaron la escena principal visible.
- OCR: la prueba de OCR sobre el titulo de un libro paso la comprobacion de cordura.
- Razonamiento espacial sobre imagenes: se probaron peticiones de tipo espacial; las respuestas coincidieron con la etiqueta del conjunto de datos, aunque el propio autor advierte que la imagen del borde del sofa es visualmente ambigua.
- Capacidades multilingues: no disponible (el repositorio no declara lista de idiomas).
- Tool calling / function calling: no documentado en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado en la informacion disponible.
- Modo de razonamiento explicito (thinking), audio u otras modalidades: no documentado en la informacion disponible.

## Casos de uso

- Digitalizacion y OCR de documentacion tecnica en planta: el modelo acepta imagenes y ha superado una prueba de OCR sobre texto impreso, por lo que puede extraer titulos, etiquetas y campos de formularios escaneados antes de volcarlos a un sistema de gestion documental.
- Control de calidad visual en linea de produccion: con el proyector multimodal se pueden enviar capturas de la camara de inspeccion y obtener descripciones textuales del estado de la pieza, integrables en un sistema de trazabilidad industrial.
- Informes automaticos a partir de capturas de pantalla: generacion de descripciones textuales de paneles HMI, graficas o dashboards para alimentar registros de incidencias sin intervencion manual.
- Asistente conversacional local en quioscos o terminales industriales: el servidor llama.cpp expone una API compatible con el esquema de chat completions, de modo que puede conectarse a una interfaz existente sin depender de servicios en la nube, manteniendo los datos en el propio equipo.
- Despliegue en equipos edge con recursos limitados: la cuantizacion IQ3_KT (13,97 GB) y el proyector Q4_K_M (0,51 GB) permiten montar el par completo en un equipo con GPU de 16 o 24 GB, e incluso con descarga parcial de capas a CPU.
- Prototipado e investigacion sobre cuantizacion: el repositorio documenta sumas de verificacion, manifiesto de tensores, importance matrix y estrategia de calibracion, lo que lo convierte en un material util para estudiar el efecto de Q4_K_M frente a IQ3_KT sobre un mismo modelo MoE.
- Evaluacion comparativa de proyectores multimodales: al ofrecer dos proyectores (BF16 y Q4_K_M) emparejables con dos modelos principales, permite medir la perdida de calidad visual al reducir la precision del codificador de vision.
- Generacion de texto asistida en entornos sin conectividad: al ejecutarse integramente en local mediante llama.cpp, es apto para escenarios con requisitos de confidencialidad o con red restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor describe explicitamente la validacion realizada como "comprobaciones funcionales de humo, no un benchmark de precision": cuatro emparejamientos (dos cuantizaciones principales por dos proyectores), 16 peticiones de texto, descripcion, OCR y razonamiento espacial, todas devueltas sin truncamiento de tokens. Las muestras procedian de los propios datos de calibracion, por lo que no constituyen evidencia de generalizacion independiente. No se realizo ninguna comparacion de logits de referencia ni un benchmark de calidad contra el modelo principal en BF16.

| Prueba | Alcance | Resultado declarado |
|---|---|---|
| Texto | 16 peticiones repartidas entre 4 emparejamientos | Respuesta normal, sin truncamiento |
| OCR (titulo de libro) | Incluida en las 16 peticiones | Superada la comprobacion de cordura |
| Descripcion de imagen | Incluida en las 16 peticiones | Descripcion de la escena principal visible |
| Razonamiento espacial | Incluida en las 16 peticiones | Coincidencia con la etiqueta del dataset, con reservas del autor sobre la ambiguedad de la imagen |

## Requisitos de hardware

- VRAM estimada para Q4_K_M: unos 21,2 GB solo de pesos, mas 0,51 GB (proyector Q4_K_M) o 0,90 GB (proyector BF16) y la cache KV correspondiente al contexto configurado. Estimacion derivada del tamano de los ficheros, no una medicion publicada.
- VRAM estimada para IQ3_KT: unos 14,0 GB de pesos mas el proyector, la opcion mas realista para GPU de 16 GB y para descarga parcial.
- GPU recomendadas: para descarga completa de Q4_K_M conviene una GPU de 32-48 GB (A100 40 GB, L40S 48 GB, RTX 6000 Ada). Para IQ3_KT encajan bien una RTX 4090 o RTX 3090 de 24 GB, e incluso una RTX 4080 de 16 GB con ajuste fino de la cache KV.
- Cabe en GPU de consumo: si, con IQ3_KT en tarjetas de 16-24 GB (RTX 4080, RTX 4090, RX 7900 XTX) y con Q4_K_M en tarjetas de 24 GB solo si se limita el contexto o se descargan capas parcialmente.
- Descarga parcial a CPU: el ejemplo de uso probado por el autor emplea `-ngl 16` con `--fit off`, `-c 2048 -b 256 -ub 128 -t 12 -tb 12`, `--parallel 1` y `GGML_CUDA_DISABLE_GRAPHS=1`. El autor advierte que son los ajustes de descarga parcial probados, no una recomendacion de rendimiento.
- Memoria de sistema: si se opta por inferencia mayoritariamente en CPU, hay que reservar al menos el tamano del fichero GGUF mas el proyector (unos 14,5 GB para IQ3_KT y unos 22 GB para Q4_K_M) y dejar margen adicional.
- Opciones de despliegue: llama.cpp, concretamente un binario `llama-server` de la linea b8779 con soporte de Qwen3.5 VLM e IQ3_KT. No se confirma compatibilidad con la compilacion upstream sin modificar, ni con vLLM, Ollama o TGI. El runtime no se incluye en el repositorio.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.
- Almacenamiento: el repositorio completo ocupa 36,6 GB; conviene descargar solo el modelo principal y el proyector necesarios (14,5 GB o 22 GB aproximadamente).

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de contexto de modelos alternativos en la informacion proporcionada, por lo que no es posible comparar rendimiento con otras opciones de la misma categoria. La comparacion factible con los datos disponibles es interna al propio repositorio y con el modelo base:

| Version | Parametros | Tamano de pesos | Proyector | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.5-35B-A3B (base, BF16) | 34,66 mil millones | no disponible | no disponible | no disponible | Apache-2.0 | HuggingFace, publicacion oficial de Qwen |
| Este repositorio, Q4_K_M | 34,66 mil millones | 21,17 GB | 0,90 GB (BF16) o 0,51 GB (Q4_K_M) | no disponible | Apache-2.0 | Requiere runtime personalizado |
| Este repositorio, IQ3_KT | 34,66 mil millones | 13,97 GB | 0,90 GB (BF16) o 0,51 GB (Q4_K_M) | no disponible | Apache-2.0 | Requiere runtime personalizado |

## Limitaciones y advertencias

- La cuantizacion no es oficial de Qwen. Es una publicacion de Advantech-EIOT; para informacion sobre el modelo original hay que remitirse a la model card del modelo base.
- Compatibilidad de runtime restringida: el autor indica que el runtime probado es una compilacion de llama.cpp de la linea b8779 con soporte de Qwen3.5 VLM e IQ3_KT, y no afirma que la compilacion upstream b8779 sin modificar ni otras compilaciones estandar soporten estos ficheros. El runtime no se distribuye.
- Sin evidencia de precision: la validacion se limita a 16 peticiones de humo sobre datos de calibracion, no a un benchmark independiente. La propia model card advierte que la coincidencia en la prueba espacial no es prueba de correccion, porque la imagen es ambigua.
- Degradacion esperable por cuantizacion: al tratarse de cuantizaciones de 4 bits (Q4_K_M) y de 3 bits (IQ3_KT), es previsible cierta perdida de calidad frente al BF16 original, especialmente en IQ3_KT. No se ha cuantificado esa perdida.
- Riesgo de alucinacion: inherente a los modelos de lenguaje generativos; no hay evaluacion de veracidad en la informacion disponible. En tareas de OCR y descripcion de imagenes conviene validar las salidas contra la fuente.
- Idiomas: el repositorio no declara lista de idiomas soportados ni cobertura multilingue verificada. No se puede asumir un rendimiento homogeneo fuera del ingles.
- Sesgos: no se documenta ninguna evaluacion de sesgos en la informacion disponible.
- Restricciones de licencia: la licencia es Apache-2.0, heredada del modelo fuente. Es apta para uso comercial, pero conviene revisar el fichero LICENSE del repositorio y la model card del modelo base por si el modelo original anade condiciones adicionales.
- Validacion comunitaria nula: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe contraste de terceros sobre su calidad o su comportamiento en produccion.
- Emparejamiento obligatorio de proyectores: nunca debe usarse un proyector de otro tamano de modelo. La etiqueta exacta del preset es IQ3_KT, no IQ3_K_T; su preset/file_type 152 y su enumeracion de tensores 154 son identificadores distintos.
- Contexto no documentado: el valor `-c 2048` del ejemplo es un ajuste probado de descarga parcial, no la longitud de contexto maxima del modelo.
- Consumo de recursos: desplegar Q4_K_M exige alrededor de 22 GB de pesos y proyector, mas cache KV, lo que puede superar la VRAM disponible en GPU de 24 GB si se usa un contexto amplio o varias peticiones en paralelo (el ejemplo fija `--parallel 1`).

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Advantech-EIOT/Qwen3.5-35B-A3B-GGUF
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Ficheros del repositorio (rutas relativas a la raiz del repositorio): Q4_K_M/Qwen3.5-35B-A3B-Q4_K_M.gguf, IQ3_KT/Qwen3.5-35B-A3B-IQ3_KT.gguf, mmproj/mmproj-Qwen3.5-35B-A3B-BF16.gguf, mmproj/mmproj-Qwen3.5-35B-A3B-Q4_K_M.gguf
- Manifiesto de tensores, tamanos y procedencia: manifest.json (en la raiz del repositorio)
- Licencia: LICENSE (en la raiz del repositorio)
- Ancla del tutorial upstream citada por el autor: commit 75f3bc94e649616162981c322e8e6b88ca5491e8 (linea b8779)
- Revision de origen oficial del modelo base: 59d61f3ce65a6d9863b86d2e96597125219dc754
- Cuantizador empleado para IQ3_KT: ik_llama.cpp (proyecto de ikawrakow en GitHub)
- Runtime de inferencia: llama.cpp (proyecto de ggerganov en GitHub), en una compilacion de la linea b8779 con soporte de Qwen3.5 VLM
- Sitio del publicador: https://www.advantech.com/en-us (no se ha encontrado en la busqueda web material tecnico sobre este modelo; los resultados devueltos corresponden unicamente a paginas corporativas de Advantech)
