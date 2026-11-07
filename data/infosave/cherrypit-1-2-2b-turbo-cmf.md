# infosave/CherryPit-1.2-2B-Turbo-cmf

## Resumen

CherryPit-1.2-2B-Turbo-cmf es una cuantizacion de 4 bits del modelo CherryPit-1.2-2B (desarrollado por DRUPEs) empaquetada en formato CMF por el usuario infosave para el motor de inferencia cortiq, escrito en Rust y sin dependencias de Python ni de frameworks de machine learning. El modelo base es un transformer de 2.000 millones de parametros orientado a generacion de texto, con soporte declarado para ingles, ruso y chino, y una ventana de contexto que el envoltorio CMF eleva hasta los 131.072 tokens.

La innovacion principal no esta en los pesos sino en el denominado "far field" o campo lejano: un mecanismo que mantiene las primeras 8.192 filas del prompt en atencion exacta sobre la GPU y expulsa las claves y valores de las filas posteriores a RAM o disco, reconstruyendo despues una representacion comprimida (32 landmarks por cabeza) que mantiene constante el consumo de VRAM y el coste por token a partir de cierto umbral. Ademas, un ajuste de "filas exactas" puntua cada fila segun lo que las capas hacen con ella y conserva las 248 mejores en precision completa, de modo que datos criticos como contrasenas o codigos sobreviven a la compresion.

El resultado practico es que el modelo puede procesar prompts de 64.000 tokens consumiendo 2,9 GB de VRAM en lugar de 7,4 GB, y decodificar a unos 155 tok/s en lugar de 54 tok/s en una RTX 5090 bajo Vulkan. La relevancia actual reside en que permite inferencia de contexto largo en tarjetas consumer de gama media e incluso en GPUs de 4 GB, un escenario historicamente reservado a hardware de datacenter.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base CherryPit-1.2-2B); envoltorio CMF con atencion exacta hasta 8.192 filas y campo lejano comprimido a partir de ahi |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131.072 tokens (por defecto limitado a 32.768; se eleva con `CMF_MAX_SEQ=131072`) |
| Tipos de cuantizacion | q4tp (4 bits, formato CMF propietario de cortiq); el repositorio incluye tambien pesos del ajuste de filas exactas (`keep_cherrypit.bin`) |
| Idiomas soportados | en, ru, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (un unico fichero `CherryPit-1.2-2B-turbo.cmf`, 1,8 GB de repositorio) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 2.000 millones de parametros del que no se detallan en la informacion disponible ni el numero de tokens de entrenamiento, ni la composicion del dataset, ni si se aplicaron tecnicas de RLHF o DPO. La model card del envoltorio no documenta el proceso de preentrenamiento ni el alineamiento del modelo original; toda la documentacion tecnica se centra en el formato CMF y en el mecanismo de atencion de contexto largo.

La innovacion tecnica destacable es el esquema de dos niveles implementado por cortiq. Las primeras 8.192 filas del prompt se procesan con atencion exacta en la tarjeta grafica. Las filas posteriores ven expulsadas sus claves y valores hacia RAM o SSD a medida que se leen, y antes de las ultimas 512 filas se construye el campo lejano capa a capa: se conservan exactas las primeras 4 filas y las ultimas 1.800, y el resto se resume en 32 landmarks por cabeza de atencion. Sobre ese esquema, un ajuste especifico (`keep_cherrypit.bin`) puntua cada fila por su relevancia funcional y retiene las 248 mejores en precision completa, que se consultan antes de responder a una pregunta situada al final del prompt. El mecanismo esta sujeto a solicitud de patente (No. 19/738,763) y se genera con el comando `cortiq far-turbo`. El campo lejano funciona en Vulkan, DX12 y Metal; en CPU el fichero se comporta como la version estandar con atencion exacta a cualquier longitud.

## Capacidades

- Generacion de texto autoregresiva en ingles, ruso y chino.
- Procesamiento de contexto largo de hasta 131.072 tokens mediante el esquema de campo lejano.
- Recuperacion exacta de datos criticos embebidos en prompts largos (contrasenas, codigos de acceso, numeros de habitacion) gracias al ajuste de filas exactas.
- Orientacion a tareas de codigo (etiqueta `code` en el repositorio).
- Modo de decodificacion greedy (`--greedy`) y modo sin razonamiento explicito (`--no-think`), lo que sugiere soporte de un modo de pensamiento en el modelo base.
- Entrada de prompts mediante fichero (`--prompt-file`) para textos que exceden la linea de comandos.
- Volcado de filas a disco (`--o1-spill`) para entornos con RAM limitada.
- Soporte de aceleracion por GPU en Vulkan, DX12 y Metal.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes multi-paso, vision ni audio.

## Casos de uso

- Analisis de documentos legales o contractuales extensos: el modelo puede ingerir contratos de decenas de miles de tokens y responder preguntas sobre clausulas concretas, apoyandose en las filas exactas para no perder referencias numericas o identificadores.
- Extraccion de credenciales y codigos en pipelines de auditoria: el ajuste de filas exactas conserva contrasenas y codigos de acceso literales en prompts de hasta 100.000 caracteres (8 de 8 aciertos segun la model card), lo que lo hace util para tareas de verificacion sobre registros largos.
- Procesamiento de informes tecnicos o logs en GPUs de gama media: con 2,9 GB de VRAM a 64.000 tokens, cabe en tarjetas de 4 GB y permite desplegar analisis de contexto largo en estaciones de trabajo sin aceleradores de datacenter.
- Generacion y revision de codigo en entornos con recursos limitados: la etiqueta `code` y el bajo consumo de VRAM permiten integrarlo en herramientas de desarrollo locales que necesiten contexto de repositorio sin depender de la nube.
- Asistentes multilingues en ingles, ruso y chino: util para soporte o documentacion en esos tres idiomas, con la salvedad de que no se declaran otros.
- Despliegue en entornos sin Python: al ejecutarse sobre cortiq (Rust), encaja en sistemas embebidos o contenedores minimos donde instalar PyTorch o transformers no es viable.
- Procesamiento por lotes de prompts largos con RAM ajustada: la opcion `--o1-spill` permite derivar filas a SSD (8,3 GB de RAM y 8,2 GB de disco a 64.000 tokens) manteniendo la velocidad de decodificacion.

## Benchmarks y rendimiento

Los datos publicados corresponden a una RTX 5090 con Vulkan, usando `cortiq bench --core` y generando 60 tokens tras el prompt indicado. Se comparan el fichero estandar y el turbo del mismo modelo.

| Prompt (tokens) | Primer token, s (estandar) | Primer token, s (turbo) | Decodificacion, tok/s (estandar) | Decodificacion, tok/s (turbo) | VRAM pico, GB (estandar) | VRAM pico, GB (turbo) |
|---:|---:|---:|---:|---:|---:|---:|
| 1.000 | 0,43 | 0,44 | 171 | 171 | 1,9 | 1,9 |
| 4.000 | 2,3 | 2,4 | 152 | 153 | 2,4 | 2,4 |
| 16.000 | 18,1 | 48,0 | 113 | 154 | 3,5 | 2,9 |
| 32.000 | 61,9 | 86,8 | 89 | 149 | 4,8 | 2,9 |
| 64.000 | 228,8 | 170,5 | 54 | 155 | 7,4 | 2,9 |

Con un presupuesto de VRAM de 3.800 MB simulando una tarjeta de 4 GB (`CMF_GPU_VRAM_MB=3800`), el fichero turbo se mantiene en 2,9 GB a 64.000 tokens, con 173 s hasta el primer token y 148 tok/s de decodificacion. En memoria host, a 64.000 tokens consume 11,0 GB de RAM, o bien 8,3 GB de RAM mas 8,2 GB de disco con `--o1-spill`, a la misma velocidad. En calidad de recuperacion de hechos plantados: 8 de 8 aciertos en 100.000 caracteres (unos 22.000 tokens) y 3 de 4 en 300.000 caracteres (unos 67.000 tokens). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM: 1,9 GB con prompts de 1.000 tokens; 2,9 GB estables a partir de 16.000 tokens con el fichero turbo; el fichero estandar escala hasta 7,4 GB a 64.000 tokens.
- GPU recomendadas: RTX 5090 (medicion oficial); cualquier GPU con soporte Vulkan, DX12 o Metal. El autor indica que las mediciones se hicieron en tarjeta NVIDIA.
- Cabe en GPU consumer: si, incluida una tarjeta de 4 GB configurando `CMF_GPU_VRAM_MB=3800`, con 2,9 GB de VRAM a 64.000 tokens.
- RAM host: 11,0 GB a 64.000 tokens sin volcado; 8,3 GB de RAM y 8,2 GB de disco con `--o1-spill`.
- Despliegue: exclusivamente mediante `cortiq` (Rust), version 0.8.63 o superior, instalable con `cargo install cortiq-cli` o mediante binarios precompilados. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: en RTX 5090, 170,5 s hasta el primer token y 155 tok/s de decodificacion a 64.000 tokens; a 1.000 tokens, 0,44 s y 171 tok/s.
- En CPU el fichero turbo opera como la version estandar, con atencion exacta a cualquier longitud y sin el ahorro de memoria del campo lejano.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Motor de inferencia | Notas |
|---|---|---|---|---|---|---|
| CherryPit-1.2-2B-Turbo-cmf | 2B | 131.072 | q4tp (CMF) | Apache 2.0 | cortiq (Rust) | Campo lejano con VRAM constante a partir de 16K tokens |
| CherryPit-1.2-2B-cmf (estandar) | 2B | 131.072 | q4tp (CMF) | Apache 2.0 | cortiq (Rust) | Atencion exacta; mayor VRAM y menor velocidad en prompts largos |
| CherryPit-1.2-2B (base) | 2B | no disponible | no disponible | no disponible | no disponible | Modelo original de DRUPEs; sin datos de rendimiento en la informacion disponible |

No se dispone de datos de benchmarks del modelo base ni de alternativas de otros fabricantes en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa con modelos de la misma categoria.

## Limitaciones y advertencias

- El campo lejano solo funciona en Vulkan, DX12 y Metal; en CPU el modelo pierde el ahorro de memoria y opera con atencion exacta.
- Mas alla del sello de 8.192 filas, el texto es aproximado: la informacion lejana se difumina salvo las filas conservadas exactas. El propio autor documenta que, al pedir el resumen del ultimo de varios articulos de Wikipedia en 100.000 caracteres, el fichero turbo mezclo uno anterior, mientras que el estandar se mantuvo en el correcto.
- El ajuste de filas exactas se entreno con hechos plantados; otros tipos de texto importante no se probaron, por lo que la retencion de datos criticos en dominios distintos no esta garantizada.
- En la prueba de 300.000 caracteres, una de las cuatro respuestas solo acerto tras los 24 tokens concedidos, lo que indica riesgo de fallo en recuperaciones muy lejanas.
- Las filas que llegan tras finalizar un prompt permanecen en la ventana o pasan al campo lejano; un turno que diverge de una conversacion sellada relee todo el prompt, con el coste asociado.
- Una generacion que comienza por debajo del sello se mantiene exacta y su memoria crece con cada token.
- El modelo solo declara ingles, ruso y chino; no se documenta cobertura de castellano.
- No se documentan sesgos conocidos ni evaluaciones de alucinacion en la informacion disponible; al ser un modelo de 2B, la fiabilidad en razonamiento complejo es limitada por capacidad.
- La licencia Apache 2.0 permite uso comercial, pero el mecanismo de campo lejano esta sujeto a solicitud de patente (No. 19/738,763), lo que conviene revisar antes de reimplementarlo.
- El repositorio registra 0 descargas y 1 like en el momento de la consulta, por lo que la validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/infosave/CherryPit-1.2-2B-Turbo-cmf
- Modelo base: https://huggingface.co/DRUPEs/CherryPit-1.2-2B
- Version estandar CMF: https://huggingface.co/infosave/CherryPit-1.2-2B-cmf
- Repositorio de cortiq y CMF: https://github.com/infosave2007/cmf
- Binarios precompilados de cortiq: https://github.com/infosave2007/cmf/releases
- Guia del metodo Turbo (Qwen3.8-27B): https://github.com/infosave2007/cmf/blob/master/docs/QWEN38_TURBO.md
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
