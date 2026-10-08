# AtomicChat/d1-omni-600M-GGUF

## Resumen

d1-omni-600M-GGUF es la version cuantizada en formato GGUF del modelo de decision LiquidAI/d1-omni-600M de Liquid AI, publicada por AtomicChat. No es un modelo generativo: recibe un estado (texto o JSON, opcionalmente con imagenes o hasta 30 segundos de audio) y responde preguntas tipadas en una unica pasada forward, devolviendo un si/no, una eleccion entre opciones nombradas o una puntuacion. La respuesta no se genera token a token, sino que se lee directamente de las puntuaciones que el modelo asigna a cada opcion.

El modelo base es un encoder bidireccional de la familia LFM2.5 con una cabeza de decision propia (dos bloques transformer situados despues del tronco) y un scoredor de opciones, mas proyectores de vision y audio. Liquid AI lo describe como un modelo de 587M parametros, mientras que los metadatos safetensors del repositorio declaran 380.732.161 parametros totales; la discrepancia no queda resuelta en la informacion disponible. Se etiqueta como "system-one", es decir, sin cadena de razonamiento explicita.

La relevancia de esta publicacion es doble. Por un lado, AtomicChat aporta cuantizaciones por debajo de 8 bits (AD-Q6_K, AD-Q5_K_M y AD-Q4_K_M) que Liquid AI no habia publicado, con una matriz de importancia propia y mediciones de fidelidad frente a los pesos originales en FP32 sobre 1.285 decisiones. Por otro, advierte de que llama.cpp todavia no puede ejecutar estos ficheros: el soporte depende del PR ggml-org/llama.cpp#30114, abierto el 7 de octubre y en revision en el momento de la publicacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder bidireccional LFM2.5 con cabeza de decision (dos bloques transformer tras el tronco), scoredor de opciones y proyectores de vision y audio |
| Parametros totales | 380.732.161 segun los metadatos safetensors del repositorio; la model card y el nombre comercial indican 587M/600M (discrepancia no resuelta en la informacion disponible) |
| Parametros activos | No aplica: la informacion disponible no describe una arquitectura MoE |
| Longitud de contexto | No disponible. La entrada admite audio de hasta 30 segundos y no se publica el limite de tokens ni de imagenes |
| Tipos de cuantizacion | BF16, Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M (mas el Q4_K_M estandar de llama.cpp usado como referencia); proyectores multimodales en BF16 y Q8_0 |
| Idiomas soportados | No disponible como lista. Las pruebas de fidelidad se hicieron sobre textos reservados en 30 idiomas y codigo fuente |
| Licencia | lfm1.0 (campo `license: other`, `license_name: lfm1.0`, con fichero LICENSE en el repositorio) |
| Formato de pesos | GGUF para llama.cpp; el modelo base se distribuye en safetensors. Proyectores como `mmproj-d1-omni-600M-BF16` y `mmproj-d1-omni-600M-Q8_0` |
| Tipo de pipeline | `image-text-to-text` (etiquetas adicionales: decision-model, classification, feature-extraction) |
| Revision de pesos de origen | LiquidAI/d1-omni-600M en la revision `414f8d6` |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo base como un encoder bidireccional LFM2.5 con una cabeza de decision especifica: dos bloques transformer situados despues del tronco, de aproximadamente 26M parametros en total, por los que pasa cada respuesta. A esto se anade un scoredor de opciones y proyectores nuevos para vision y audio, integrados en llama.cpp bajo el tipo de decision `lfm2-d1-omni`. Al ser un encoder bidireccional con lectura directa de puntuaciones, el modelo no decodifica texto: emite la opcion ganadora, el si/no o la puntuacion a partir de la distribucion sobre las alternativas.

No se publican en la informacion proporcionada datos sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO. Tampoco se detalla el procedimiento de entrenamiento de la cabeza de decision ni de los proyectores multimodales.

La innovacion destacable de esta publicacion es el esquema de cuantizacion AD (Atomic Dynamic), en el que el tipo se elige tensor a tensor en lugar de usar un preset de llama.cpp. La cabeza de decision y el scoredor de opciones se mantienen en Q8_0 en todos los ficheros; la tabla de tokens se situa por encima del resto en precision (Q8_0 en AD-Q6_K, Q6_K en AD-Q5_K_M, Q5_K en AD-Q4_K_M), la atencion se queda en Q8_0 o Q6_K, y los dos primeros y los dos ultimos bloques del tronco reciben un paso mas de precision que los centrales. Segun las mediciones del autor, a tamano practicamente igual, el Q4_K_M estandar de llama.cpp (247 MB) cambia 133 respuestas con una KL de 0,0255, frente a las 97 respuestas y un 44 % menos de KL de AD-Q4_K_M.

## Capacidades

- Decision tipada en una sola pasada forward: respuesta si/no, eleccion entre opciones nombradas o puntuacion numerica. No hay generacion de texto libre.
- Entrada de estado en texto plano o JSON.
- Entrada multimodal: imagenes y audio de hasta 30 segundos de duracion, gestionados por proyectores dedicados.
- Clasificacion y extraccion de caracteristicas (`feature-extraction`), segun las etiquetas del repositorio.
- Cobertura multilingue: las pruebas de fidelidad se realizaron sobre textos reservados en 30 idiomas y codigo fuente, aunque no se publica la lista de idiomas ni garantias por idioma.
- Modelo de tipo "system-one": no genera cadenas de razonamiento ni modo thinking.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes, planificacion multi-paso ni memoria conversacional.
- Salida determinista leida del scoredor de opciones, lo que facilita integrarla como senal de control en pipelines automaticos.

## Casos de uso

- Enrutado de peticiones en pipelines de agentes: dado un estado en JSON con la peticion del usuario, el modelo puede decidir entre opciones nombradas (por ejemplo, que subsistema debe atenderla) en una sola pasada, sin coste de decodificacion autorregresiva.
- Moderacion de contenido multimodal: clasificar si un texto, una imagen o un fragmento de audio de hasta 30 segundos incumple una politica, devolviendo un si/no o una puntuacion de riesgo.
- Reranking en recuperacion para RAG: puntuar pares consulta-documento y ordenar candidatos antes de pasarlos a un modelo generativo, aprovechando que el coste es de una unica pasada.
- Puertas de decision en agentes: decidir si procede invocar una herramienta, si hay informacion suficiente para responder o si conviene escalar a un humano.
- Clasificacion de estados de interfaz: recibir el estado de una aplicacion como JSON y devolver la accion siguiente entre un conjunto cerrado de opciones.
- Control de calidad en atencion al cliente: analizar los primeros 30 segundos de una llamada y emitir una decision binaria (por ejemplo, si requiere supervision) sobre audio telefono.
- Puntuacion automatica en evaluacion de modelos: usar el scoredor de opciones como recompensa o criterio de calidad en pipelines de evaluacion y filtrado de datos.
- Inferencia en el borde o en local: con ficheros de 256 MB (AD-Q4_K_M) a 407 MB (Q8_0), el modelo es candidato a despliegues en dispositivo una vez que llama.cpp incorpore el soporte necesario; en el momento de la publicacion esto no es posible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tarea (MMLU, GSM8K, HumanEval u otros) en la informacion disponible. Lo que si se publica es una medicion de fidelidad de la cuantizacion frente a los pesos originales en FP32, sobre 1.285 decisiones con preguntas de si/no, de eleccion y de puntuacion, sobre textos reservados en 30 idiomas y codigo fuente:

| Fichero | Tamano en disco | Mismas respuestas (de 1.285) | Deriva media de opciones | KL media de opciones |
|---|---:|---:|---:|---:|
| BF16 | 764 MB | 99,6 % (5) | 0,0019 | 0,00002 |
| Q8_0 | 407 MB | 98,5 % (19) | 0,0076 | 0,0003 |
| AD-Q6_K | 347 MB | 97,7 % (30) | 0,0150 | 0,0014 |
| AD-Q5_K_M | 293 MB | 95,1 % (63) | 0,0289 | 0,0052 |
| AD-Q4_K_M | 256 MB | 92,5 % (97) | 0,0500 | 0,0142 |

Datos adicionales aportados por el autor:

- El Q4_K_M estandar de llama.cpp (247 MB) cambia 133 respuestas con una KL de 0,0255, frente a las 97 respuestas y la KL de 0,0142 de AD-Q4_K_M.
- El mayor desplazamiento en la probabilidad de una sola opcion es de 0,08 en Q8_0 y de 0,38 a 4 bits.
- Comparacion entre cuantizaciones Q8_0 del mismo modelo: Liquid 407 MB, 98,4 % (20), deriva 0,0074, KL 0,0003; AtomicChat 407 MB, 98,5 % (19), deriva 0,0076, KL 0,0003.
- El fichero BF16 y los dos proyectores de AtomicChat son identicos byte a byte a los de Liquid, con el mismo SHA-256.
- El autor no midio decisiones sobre imagen ni sobre audio.

## Requisitos de hardware

- Huella en disco: 764 MB en BF16, 407 MB en Q8_0, 347 MB en AD-Q6_K, 293 MB en AD-Q5_K_M y 256 MB en AD-Q4_K_M. El repositorio completo ocupa 2,8 GB.
- VRAM estimada para inferencia: no se publican cifras oficiales. Dado el tamano de los ficheros, la VRAM necesaria es la del fichero mas el contexto y los proyectores multimodales; cualquier GPU consumer con mas de 2 GB deberia ser suficiente en las cuantizaciones de 8 bits o inferiores.
- GPU recomendadas: no disponible. Al tratarse de un modelo de menos de 600M parametros, tanto GPUs de datacenter (A100, H100) como GPUs consumer (serie RTX 40, RTX 30 o inferiores) pueden alojarlo; no hay recomendaciones del autor.
- Cabe en GPU consumer: si, segun los tamanos de fichero publicados.
- Opciones de despliegue: llama.cpp (todavia no funcional para estos ficheros) y el codigo PyTorch de Liquid para el modelo base. No se documenta soporte para vLLM, Ollama, TGI ni otros servidores en la informacion disponible.
- Latencia y throughput: no disponible. El modelo resuelve cada decision en una unica pasada forward, sin decodificacion autorregresiva, pero no se publican cifras de latencia ni de peticiones por segundo.
- Licencia y acceso: repositorio publicado el 7 de octubre, con 0 descargas y 0 likes en el momento de la captura.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formatos | Fidelidad en Q8_0 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AtomicChat/d1-omni-600M-GGUF | 380.732.161 segun safetensors (587M segun la model card) | No disponible | GGUF: BF16, Q8_0, AD-Q6_K, AD-Q5_K_M, AD-Q4_K_M | 98,5 % de respuestas identicas (19 cambios de 1.285) | lfm1.0 | Requiere el PR ggml-org/llama.cpp#30114 |
| LiquidAI/d1-omni-600M-GGUF | El mismo modelo base | No disponible | GGUF: BF16, F16, Q8_0 | 98,4 % de respuestas identicas (20 cambios de 1.285) | lfm1.0 | Requiere el mismo PR de llama.cpp |
| LiquidAI/d1-omni-600M (PyTorch) | El mismo modelo base | No disponible | Safetensors | Referencia en FP32 | lfm1.0 | Ejecutable con el codigo PyTorch de Liquid |
| d1-3B cuantizado por AtomicChat | No disponible | No disponible | GGUF | No disponible | No disponible | Mencionado en la model card como modelo hermano de mayor tamano |

No se dispone de datos de modelos comparables de otros fabricantes con la misma funcion de decision tipada multimodal, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- llama.cpp no puede ejecutar estos ficheros todavia. El soporte esta en revision en el PR ggml-org/llama.cpp#30114; hasta su fusion hay que usar el codigo PyTorch de Liquid. Los ficheros llevan el tipo `d1omni` de Liquid y se reetiquetaran con los metadatos del PR cuando se fusione, sin cambios en los tensores.
- No es un modelo generativo. No produce texto libre, no mantiene conversaciones y no admite instrucciones abiertas; solo responde a preguntas tipadas (si/no, opciones nombradas o puntuacion).
- La cuantizacion altera mas las respuestas que en d1-3B. Q8_0 ya cambia un 1,5 % de las respuestas y 4 bits un 7,5 %. El autor recomienda Q8_0, o AD-Q6_K si importan 60 MB, y verificar con preguntas propias cualquier fichero por debajo de 6 bits.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero si existe riesgo de decision erronea o mal calibrada en los dominios no cubiertos por el entrenamiento; no se publican tasas de acierto por tarea.
- Limite multimodal: el audio esta acotado a 30 segundos. No se publica el limite de imagenes ni de longitud de contexto, lo que dificulta dimensionar despliegues con entradas largas.
- Idiomas: la model card solo indica que las pruebas cubrieron 30 idiomas y codigo fuente; no hay lista oficial ni evaluacion por idioma, por lo que no se puede garantizar el comportamiento en un idioma concreto.
- Sesgos: no se documenta ninguna evaluacion de sesgos, toxicidad o equidad en la informacion disponible.
- Licencia: lfm1.0 bajo el campo `license: other`. Las condiciones concretas de uso comercial no se detallan en la informacion proporcionada; hay que revisar el fichero LICENSE del repositorio antes de usarlo en produccion.
- Los proyectores de vision y audio no fueron evaluados por el cuantizador: no hay medicion de fidelidad para decisiones sobre imagen o audio.
- Validacion comunitaria limitada: el repositorio tenia 0 descargas y 0 likes en el momento de la captura, y la model card obtenida esta truncada, por lo que pueden faltar detalles de uso.
- Discrepancia de parametros (380.732.161 frente a 587M/600M) sin aclaracion en la informacion disponible; conviene verificar el recuento real antes de planificar recursos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/AtomicChat/d1-omni-600M-GGUF
- Modelo base en PyTorch: https://huggingface.co/LiquidAI/d1-omni-600M
- GGUFs oficiales de Liquid: https://huggingface.co/LiquidAI/d1-omni-600M-GGUF
- Metricas y registros de cuantizacion: https://huggingface.co/datasets/AtomicChat/d1-omni-600M-GGUF-metrics
- PR de soporte en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/30114
- Sitio de Atomic Chat: https://atomic.chat/
- Servidor de Discord: https://discord.gg/8wGSsvmg4V
- Repositorio de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat

Nota: la busqueda web realizada no devolvio resultados relevantes sobre el modelo; solo paginas de prensa sin relacion con esta publicacion.
