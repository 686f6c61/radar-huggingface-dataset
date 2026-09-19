# coolbho3k/DeepSeek-V4.1-Flash-EXL3-3bpw

## Resumen

DeepSeek-V4.1-Flash-EXL3-3bpw es una cuantizacion calibrada de tipo EXL3 a 3 bits por peso (3bpw) de los expertos enrutados del modelo multimodal deepseek-ai/DeepSeek-V4.1-Flash, publicada por el usuario coolbho3k. El checkpoint conserva intactos el vision transformer y el aligner en BF16, mantiene routers, expertos compartidos y tensores no enrutados tal como venian del modelo original (que ya era de precision mixta con FP4 nativo) y comprime las 40 capas del backbone y los 15.360 expertos enrutados a pesos EXL3 MUL1 de 3 bits calibrados. El objetivo es reducir el coste de almacenamiento y de ancho de banda de memoria de un modelo MoE de aproximadamente 111.000 millones de parametros para poder servirlo en hardware de gama de escritorio profesional.

Su relevancia es doble. Por un lado, demuestra que es viable cuantizar a 3 bits la parte dominante de un MoE multimodal de gran tamano con una degradacion muy contenida en metricas teacher-forced (perplejidad de 3,7977 a 3,8201, un 0,591% peor). Por otro, es una publicacion explicitamente experimental: no es un checkpoint cargable en vLLM estandar ni en ExLlamaV3 autonomo, requiere una integracion personalizada con hooks de DCP, engramas en SSD, carga en streaming y kernels acotados para GB10, y en el momento de escribir esta ficha la subida de ficheros sigue incompleta.

El repositorio ocupa 635,8 GB y contiene 55 shards con 426.055.648.464 bytes de payload total, de los cuales solo 215.344.840.128 bytes corresponden al modelo activo; el resto son tablas de engramas FP8 para busqueda respaldada en SSD y pesos draft/MTP retenidos que no se cargan. La licencia es MIT, pero la receta de servido publica aun no esta finalizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (deepseek_v41), 40 capas de backbone y 15.360 expertos enrutados; vision transformer y aligner BF16; pesos draft/MTP retenidos |
| Parametros totales | 111.047.990.384 (segun safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible como especificacion oficial; en pruebas se sirvio una peticion de recuperacion de 1.047.990 tokens y una repeticion con 1.047.808 tokens en cache |
| Tipos de cuantizacion | EXL3 3 bits por peso (MUL1) calibrado en expertos enrutados; BF16 en vision transformer y aligner; FP8 en tablas/escalas de engramas; routers y expertos compartidos sin recalificar; KV nativo FP8 (FP4 KV no implementado) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (55 shards) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de mezcla de expertos (MoE) multimodal: el pipeline declarado es image-text-to-text y el modelo procesa tanto texto como imagenes mediante un vision transformer y un aligner que en esta cuantizacion se conservan en BF16 sin modificar. El backbone consta de 40 capas y 15.360 expertos enrutados, ademas de routers, expertos compartidos y otros tensores no enrutados que se copian sin tocar desde la fuente. El checkpoint original de DeepSeek es de precision mixta con FP4 nativo, lo que explica que la etiqueta 3bpw no describa el coste medio de almacenamiento de todo el repositorio, sino unicamente los pesos de los expertos enrutados; los metadatos EXL3 y el padding anaden almacenamiento adicional sobre el payload empaquetado de 3 bits.

No se documenta en la informacion disponible el proceso de entrenamiento original (numero de tokens, composicion del dataset, RLHF/DPO) ni el metodo exacto de calibracion empleado por el autor de la cuantizacion. Si se detalla la innovacion de despliegue: las tablas y escalas FP8 originales se conservan bajo el directorio `engrams/` para consulta respaldada en SSD en lugar de cargarse en GPU, y los pesos draft/MTP se retienen bajo `draft/` pero no se cargan en la receta probada, de modo que la decodificacion especulativa esta desactivada. Las revisiones de runtime usadas en los experimentos son vLLM `e47aa780bccf59f59dfa2cbb18e17a10b4fe69ba`, ExLlamaV3 `6ff3a17ea7f3d0026b273d43239398d57f71b788` y checkpoint base `df42c109f1defefcbfcedbe7d905718a12266e40`; el autor indica que esas revisiones por si solas no bastan y que se requieren hooks personalizados de DCP y propiedad de cache, integracion de engramas en SSD, carga en streaming y kernels GB10 acotados.

## Capacidades

- Generacion de texto multimodal: el modelo acepta entradas de imagen y texto (pipeline image-text-to-text) y conserva intacta la torre de vision en BF16.
- Recuperacion de informacion en contexto muy largo: en la prueba sintetica de recuperacion con 1.047.990 tokens se recuperaron los tres hechos plantados.
- Reutilizacion de prefijo en cache: una repeticion identica con 1.047.808 tokens en cache se completo en 10,070 s, frente a 4.277,419 s en frio.
- Razonamiento con modo thinking: las comprobaciones muestreadas de ARC-Challenge y GSM8K se ejecutaron con thinking desactivado, lo que implica que el modelo dispone de esa modalidad, aunque no se reportan resultados con ella activada.
- Respuesta a preguntas sobre imagenes: suite de 24 preguntas con 18 aciertos en el modelo original segun la comparacion incluida.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el campo de idiomas del repositorio no esta poblado.
- Capacidades de audio: no disponibles.

## Casos de uso

- Recuperacion documental sobre corpus masivos: el modelo puede localizar hechos concretos dentro de contextos cercanos al millon de tokens, como demuestra la prueba con 1.047.990 tokens y tres hechos plantados; encaja en escenarios de analisis de expedientes, normativa o historiales completos.
- Analisis de imagenes tecnicas con pregunta-respuesta textual: al conservar el vision transformer y el aligner en BF16, es adecuado para extraer informacion de diagramas, capturas o documentacion escaneada, aunque el autor advierte que la muestra de evaluacion visual es demasiado pequena para extrapolar.
- Procesamiento por lotes de baja concurrencia y alto valor: dado que la receta probada soporta una unica peticion activa, resulta apropiado para tareas offline o asincronas donde la latencia no es critica y si lo es la calidad.
- Reutilizacion intensiva de contexto cacheado: en flujos donde el mismo documento largo se consulta muchas veces (por ejemplo, un asistente interno sobre un manual fijo), la reutilizacion de prefijo reduce el tiempo de respuesta de minutos a decenas de segundos.
- Investigacion en cuantizacion de MoE: el repositorio sirve como material de estudio para medir el impacto de una cuantizacion EXL3 a 3 bits en expertos enrutados, con metricas teacher-forced publicadas y verificacion de integridad por SHA256.
- Verificacion de pipelines multimodales en hardware compacto: la receta con dos DGX Spark permite evaluar el comportamiento de un MoE de 111.000 millones de parametros con engramas en SSD y KV nativo FP8 en un entorno de laboratorio.
- Pruebas de reproducibilidad en servido: el caso de la divergencia en el orden de claves seleccionadas en la atencion DCP es un escenario de diagnostico util para equipos que trabajen con atencion distribuida y cache entre GPUs.
- Generacion de codigo en produccion: no disponible; no se han publicado evaluaciones de codigo en la informacion proporcionada.

## Benchmarks y rendimiento

Metricas teacher-forced sobre 64 registros retenidos y 81.880 objetivos de prediccion, comparando la fuente original con la cuantizacion:

| Metrica de texto | Fuente original | EXL3 3bpw |
|---|---:|---:|
| Objetivos de prediccion | 81.880 | 81.880 |
| Log-verosimilitud negativa media | 1,33438994 | 1,34028314 |
| Perplejidad | 3,79767842 | 3,82012498 |
| Prediccion correcta del siguiente token | 70,71690% | 70,60821% |

La perplejidad aumenta un 0,59106%. La coincidencia con la primera opcion del modelo original es del 93,24255%, que es un dato de acuerdo y no de precision en tarea. El tramo de respuesta a imagenes contiene solo 84 objetivos de prediccion, insuficiente para sostener una conclusion amplia sobre vision.

Comprobaciones muestreadas del candidato (no son benchmarks completos ni comparaciones de generacion contra el original), con thinking desactivado:

| Prueba | Resultado | Alcance |
|---|---:|---|
| ARC-Challenge | 123/128 | Muestra reducida; no se evaluo solapamiento de calibracion ni contaminacion de preentrenamiento |
| GSM8K | 63/64 | Muestra reducida; mismas salvedades |
| Suite de 24 preguntas con imagen | 18/24 | Los seis fallos se mantienen como fallos |

Rendimiento de servido medido en la receta descrita (dos DGX Spark, TP=2, DCP=2, ejecucion eager, una peticion activa, KV FP8 nativo, vision BF16 y engramas en SSD):

| Escenario | Resultado |
|---|---|
| Decodificacion en contexto corto (prompt de 24 tokens, salida de 128 tokens) | ~7,18 tokens/s, con 0,379 s de tiempo hasta el primer token en servidor |
| Peticion de recuperacion de 1.047.990 tokens | Los tres hechos recuperados en 4.277,419 s (71,29 minutos) |
| Repeticion identica con 1.047.808 tokens en cache | 10,070 s, con 2,955 s de tiempo hasta el primer token en servidor |
| Decodificacion cerca de 1M de contexto | ~2,406 tokens/s |

El perfil probado uso una utilizacion de memoria de GPU de 0,90 y un limite de KV solo a la baja de 1.009.612.800 bytes por GPU.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible como cifra oficial. El payload del modelo activo es de 215.344.840.128 bytes, el limite de KV configurado fue de 1.009.612.800 bytes por GPU y la utilizacion de memoria se fijo en 0,90.
- Almacenamiento: el repositorio ocupa 635,8 GB; el total de shards incluyendo cabeceras safetensors es de 426.055.648.464 bytes, de los cuales 202.758.032.400 bytes son tablas y escalas de engramas destinadas a SSD y 7.932.874.632 bytes son pesos draft/MTP retenidos que no se cargan.
- GPU recomendadas: la unica configuracion documentada son dos DGX Spark (GB10) con TP=2 y DCP=2.
- Cabe en GPU de consumo: no disponible; no se documenta ninguna ejecucion en GPU de consumo y el modelo no es un checkpoint autonomo de ExLlamaV3.
- Opciones de despliegue: vLLM con la integracion EXL3 personalizada (revision `e47aa780bccf59f59dfa2cbb18e17a10b4fe69ba` mas hooks propios) y ExLlamaV3 (`6ff3a17ea7f3d0026b273d43239398d57f71b788`). No se debe asumir que un `vllm serve` estandar pueda cargar estos pesos. No se mencionan Ollama, llama.cpp ni TGI.
- Latencia y throughput: aproximadamente 7,18 tokens/s en decodificacion de contexto corto, 0,379 s hasta el primer token, y aproximadamente 2,406 tokens/s cerca de 1M de contexto. El prefill en frio a 1M de contexto sigue siendo lento; la reutilizacion de prefijo cacheado es sustancialmente mas rapida.
- Concurrencia: seis peticiones concurrentes o seis historias independientes de 1M de tokens no estan cualificadas. Los margenes de memoria son ajustados y dependen del host.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Perplejidad (teacher-forced) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4.1-Flash-EXL3-3bpw | 111.047.990.384 | ~1.048.000 tokens probados | 3,82012498 | MIT | Repositorio experimental, subida incompleta, runtime personalizado |
| deepseek-ai/DeepSeek-V4.1-Flash (modelo base) | no disponible en la informacion proporcionada | no disponible | 3,79767842 | no disponible | Checkpoint fuente en HuggingFace, revision `df42c109f1defefcbfcedbe7d905718a12266e40` |

No se dispone de datos de otros modelos comparables de la misma categoria (mismo rango de parametros, misma tarea o mismo tipo de cuantizacion) en la informacion proporcionada.

## Limitaciones y advertencias

- Subida incompleta: el autor indica que el repositorio se esta poblando y que la descarga debe considerarse incompleta hasta que `upload-status.json` indique `complete` y los ficheros coincidan con `release-manifest.json`.
- Compatibilidad de runtime: es una publicacion de pesos experimental para una integracion vLLM/EXL3 concreta, no un checkpoint cargable en vLLM estandar ni en ExLlamaV3 autonomo. El bundle de servido publico y reutilizable aun no esta incluido.
- Alcance de la etiqueta 3bpw: se aplica a los expertos enrutados, no a todos los parametros ni al coste medio de almacenamiento del checkpoint completo.
- Interpretacion de las metricas: las mediciones son teacher-forced sobre 64 registros retenidos y no constituyen una comparacion contra BF16 ni una afirmacion sobre precision amplia en tareas downstream. La coincidencia del 93,24255% con la primera opcion del original es un dato de acuerdo, no de precision.
- Evaluacion visual limitada: el tramo de imagen contiene solo 84 objetivos de prediccion, demasiado pocos para sostener conclusiones generales sobre vision. Los seis fallos de la suite de 24 imagenes siguen sin resolverse.
- Muestras no concluyentes: los resultados de 123/128 en ARC-Challenge y 63/64 en GSM8K son comprobaciones muestreadas, no benchmarks completos, y no se evaluo el solapamiento con la calibracion ni la contaminacion por preentrenamiento.
- Reproducibilidad del servido: las peticiones repetidas sin cache para una misma pregunta con imagen variaban en la receta anterior. El primer punto de divergencia registrado fue el orden de claves seleccionadas en la atencion DCP; existe un candidato con orden determinista que ha pasado pruebas acotadas de kernels nativos, pero la reparacion en el modelo completo no esta verificada.
- Limitaciones de concurrencia y memoria: seis peticiones concurrentes o seis historias independientes de 1M de tokens no estan cualificadas; los margenes de memoria son estrechos y especificos del host. FP4 KV no esta implementado.
- Exclusiones del repositorio: no se incluyen ejemplos de calibracion, capturas de activaciones, registros operativos, credenciales ni imagenes de contenedor del runtime, lo que dificulta la reproduccion externa.
- Sesgos conocidos: no disponible.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada.
- Limitaciones de idioma: no disponible; el campo de idiomas no esta poblado.
- Uso comercial: la licencia es MIT, pero la ausencia de un bundle de servido publico y la dependencia de hooks personalizados limitan el uso en produccion sin trabajo de integracion adicional.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/coolbho3k/DeepSeek-V4.1-Flash-EXL3-3bpw
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash
- Revision del modelo base citada: https://huggingface.co/deepseek-ai/DeepSeek-V4.1-Flash/tree/df42c109f1defefcbfcedbe7d905718a12266e40
- Revision de vLLM usada en los experimentos: commit `e47aa780bccf59f59dfa2cbb18e17a10b4fe69ba`
- Revision de ExLlamaV3 usada en los experimentos: commit `6ff3a17ea7f3d0026b273d43239398d57f71b788`
- La busqueda web realizada no devolvio resultados relevantes para este modelo; no se han localizado papers, blogs ni demos adicionales.
