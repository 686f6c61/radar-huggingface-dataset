# RunningHubAI/rh-gun-fu-lora

## Resumen

rh-gun-fu-lora (GUNFU) es un adaptador LoRA para generacion de video orientado a escenas de accion con armas de fuego. Lo publica RunningHubAI en nombre del autor @FOURBUNNY, y se distribuye como un unico fichero de pesos de 148 MiB (`GunFu.safetensors`) dentro de un repositorio de 0,2 GB. No es un modelo de lenguaje: es un adaptador de bajo rango pensado para cargarse en ComfyUI, en la plataforma RunningHub o directamente desde Hugging Face, y que se aplica sobre el modelo base minimax-h3.

El objetivo declarado es la generacion de coreografias de gun-fu cinematografico: desde tiroteos a distancia hasta combate cuerpo a cuerpo con armas, golpes, proyecciones y forcejeo fisico. La model card insiste en la continuidad de la accion (contacto, reacciones al impacto y seguimiento del movimiento) y proporciona recetas de inferencia en dos pasadas con pesos concretos, ademas de la palabra de activacion `BUNNY`.

Su relevancia practica es acotada pero clara: cubre un nicho muy especifico (escenas de accion con armas) dentro de los flujos de generacion de video con ComfyUI. No hay datos publicados de benchmarks, descargas ni licencia explicita, por lo que la evaluacion debe hacerse por prueba directa. El repositorio declara creacion y actualizacion en septiembre de 2026 segun los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (adaptador LoRA de bajo rango; los pesos base corresponden a minimax-h3) |
| Parametros totales | no disponible (adaptador distribuido como fichero de 148 MiB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica / no disponible (modelo de generacion de video) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (la model card ofrece la documentacion y los ejemplos de prompting en ingles y chino) |
| Licencia | no disponible (la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del modelo upstream) |
| Formato de pesos | safetensors (`GunFu.safetensors`, 148 MiB) |
| Modelo base | minimax-h3 (segun la model card) |
| Palabra de activacion | BUNNY |
| Tamano del repositorio | 0,2 GB |
| Plataformas de uso | ComfyUI, RunningHub, Hugging Face |
| Fecha de publicacion | 2026-09-26 (creacion), 2026-09-26 (ultima actualizacion) |

## Arquitectura y entrenamiento

No hay informacion tecnica sobre la arquitectura del adaptador mas alla de su naturaleza LoRA: la model card no detalla rango, dimension de las matrices, capas objetivo ni hiperparametros de entrenamiento. El adaptador se entrena de forma independiente sobre minimax-h3, y el autor especifica explicitamente que BASE no se incorporo al entrenamiento. Tampoco se declara el volumen de datos, la composicion del dataset, ni si se emplearon tecnicas de ajuste por preferencias (RLHF, DPO) en el proceso.

La innovacion practica del modelo no esta en la arquitectura, sino en las recetas de composicion que documenta el autor. Para tiroteos a distancia propone una primera pasada con GUNFU a 0,9 en solitario, o bien GUNFU 0,9 mas Motion Continuity Repair a 0,5, seguida de una segunda pasada con GUNFU a 0,65 y Motion Continuity Repair a 0,25. Para combate cercano al estilo John Wick propone una primera pasada con GUNFU 0,9, COMBAT 0,5 y Motion Continuity Repair 0,3, y la misma segunda pasada. En ambos casos GUNFU aporta el foco de arma de fuego, COMBAT refuerza el combate fisico y Motion Continuity Repair sostiene la continuidad entre acciones. Estos LoRAs auxiliares se referencian, pero no forman parte de este repositorio.

## Capacidades

- Generacion de video de escenas de accion con armas de fuego, tanto a distancia como en espacio cerrado.
- Coreografia de gun-fu: combinacion de disparos, golpes, proyecciones y forcejeo fisico en una misma secuencia.
- Representacion de acciones encadenadas y sus consecuencias: contacto fisico, perdida de equilibrio, reacciones al impacto y cambios de posicion.
- Especificacion de tipo de arma y comportamiento de disparo a traves del prompt, en lugar de descripciones genericas.
- Soporte de descripcion audiovisual cuando el pipeline de generacion lo permite: sonido de disparo, eyeccion de casquillos, sonidos de impacto, gritos de dolor y respiracion.
- Uso como LoRA combinable con otros adaptadores (COMBAT, Motion Continuity Repair) mediante pesos ajustables.
- Compatibilidad con flujos de ComfyUI y con la plataforma RunningHub, incluida la carga desde Hugging Face.
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Capacidades multilingues: no disponible; la model card documenta los prompts en ingles y chino, pero no declara idiomas soportados por el modelo base.

## Casos de uso

- Previsualizacion de escenas de accion para cine y serie: el LoRA permite generar animaticos de tiroteos y peleas con continuidad de movimiento antes de rodar, lo que reduce coste de planificacion de secuencias complejas de coordinacion.
- Storyboard animado para pitching: productoras y agencias pueden convertir un guion tecnico en una secuencia de video con contactos, reacciones al impacto y cambios de posicion, usando la palabra de activacion `BUNNY` y prompts que identifiquen atacante y objetivo.
- Cinematicas para videojuegos: generacion de prototipos de secuencias de accion para shooters, con recetas de dos pasadas que permiten iterar sobre el grado de fisicidad del combate variando el peso de COMBAT.
- Contenido para redes y canales de accion: creacion de clips cortos de gun-fu a partir de imagenes de entrada, aprovechando la composicion de prompt detallada que exige el modelo (arma, modo de disparo, quien ataca a quien).
- Prototipado de coreografias para especialistas y coordinadores de stunts: el modelo sirve como referencia visual rapida de encadenamiento de acciones antes del ensayo fisico, especialmente en la variante de combate cercano.
- Postproduccion y continuidad de planos: la combinacion con Motion Continuity Repair y su segunda pasada a pesos reducidos esta pensada para mejorar el enlace entre acciones dentro de una misma secuencia, util en montaje de escenas fragmentadas.
- Generacion de material audiovisual con sonido descrito en el prompt, para piezas que requieran disparos, casquillos, impactos y respiracion, siempre que el pipeline de generacion soporte audio.
- Exploracion de estilo de accion: el ajuste de pesos entre GUNFU, COMBAT y Motion Continuity Repair permite desplazar el resultado desde el tiroteo puro hacia el cuerpo a cuerpo sin reentrenar el adaptador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador ocupa 148 MiB en disco (repositorio completo: 0,2 GB), por lo que su huella de almacenamiento es despreciable frente al modelo base.
- La VRAM necesaria para inferencia no esta especificada: viene determinada por minimax-h3, cuyo requisito de memoria no se detalla en la informacion disponible. Cargar un LoRA anade una sobrecarga marginal respecto al modelo base, pero no se publican cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI es el entorno indicado por las etiquetas y por la propia model card; tambien se puede cargar en RunningHub o descargar desde Hugging Face. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un adaptador de generacion de video.
- Latencia y throughput: no disponibles. El autor indica que los resultados dependen de las imagenes de entrada, los prompts y la configuracion de generacion.

## Comparativa con modelos similares

No hay datos publicados sobre modelos comparables en la informacion disponible (ni parametros, ni contexto, ni resultados de rendimiento, ni licencia de las alternativas). Como referencia interna, la unica comparacion documentada es la que ofrece el propio autor entre configuraciones de uso del mismo adaptador:

| Configuracion | Primera pasada | Segunda pasada | Enfoque |
|---|---|---|---|
| Tiroteo a distancia | GUNFU 0,9 en solitario, o GUNFU 0,9 + Motion Continuity Repair 0,5 | GUNFU 0,65 + Motion Continuity Repair 0,25 | Fuego a distancia, menor enfasis en contacto fisico |
| Combate cercano tipo John Wick | GUNFU 0,9 + COMBAT 0,5 + Motion Continuity Repair 0,3 | GUNFU 0,65 + Motion Continuity Repair 0,25 | Mezcla de arma de fuego, golpes, proyecciones y forcejeo |

## Limitaciones y advertencias

- Licencia no especificada: la model card indica que el copyright permanece en el autor y remite a la licencia del proyecto original o del modelo upstream. Antes de un uso comercial es imprescindible verificar las condiciones de minimax-h3 y del proyecto original en RunningHub.
- Dependencia del modelo base: el adaptador no es autonomo, requiere minimax-h3 para funcionar.
- Dependencia de LoRAs auxiliares: las recetas recomendadas para combate cercano utilizan COMBAT y Motion Continuity Repair, que no se incluyen en este repositorio y cuyo acceso y licencia no se detallan.
- Sensibilidad a las entradas: el propio autor advierte de que los resultados dependen de las imagenes de entrada, los prompts y la configuracion de generacion, y que un diseno de coreografia claro sigue siendo determinante.
- Carga de prompt elevada: el modelo exige prompts muy explicitos (identificar protagonista, cada oponente, quien ataca a quien, tipo de arma, comportamiento de disparo), lo que reduce la calidad de salida con descripciones genericas.
- Sin datos de benchmarks, evaluaciones de sesgo ni metricas de calidad publicadas.
- Contenido violento: el adaptador esta especializado en representacion de violencia con armas de fuego y combate fisico, lo que implica consideraciones de moderacion de contenido y de politicas de plataforma.
- Idiomas soportados no declarados, lo que dificulta planificar despliegues en produccion multilingue.
- Adopcion nula registrada en el momento de la consulta: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RunningHubAI/rh-gun-fu-lora
- Proyecto original en RunningHub: https://www.runninghub.ai/model/public/2098872397557399553
- Pagina del autor (@FOURBUNNY): https://www.runninghub.ai/user-center/2092843565587107841
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub China: https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Endpoint de la API para llamadas: https://www.runninghub.ai/call-api
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Detalle de API de Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino: README_cn.md (dentro del repositorio de Hugging Face)
