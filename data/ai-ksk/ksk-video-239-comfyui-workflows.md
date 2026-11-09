# AI-KSK/ksk-video-239-comfyui-workflows

## Resumen

AI-KSK/ksk-video-239-comfyui-workflows es un paquete de flujos de trabajo (workflows) para ComfyUI orientado a la generacion y posproduccion de video, distribuido en Hugging Face bajo el identificador AI-KSK. No se trata de un modelo de pesos en el sentido clasico, sino de un conjunto de ocho grafos JSON que acompanan a un episodio tutorial y que orquestan un checkpoint de video de 22B parametros fusionado mediante la tecnica TIES. El paquete cubre cinco grafos de la "suite" de produccion (digital human simple y dual, image-to-video, referencia multi-imagen y text-to-video) mas dos grafos independientes de limpieza con IC Edit (eliminacion de subtitulos y marcas de agua, y reparacion en HD) y un helper de direccion de prompts llamado Relay.

El interes del paquete es practico: empaqueta en un solo repositorio la configuracion completa (nombres de checkpoint, LoRAs, samplers y valores sigma) necesaria para reproducir pipelines de video con la familia LTX 2.3, incluyendo un paso de posproduccion que elimina subtitulos incrustados entre niveles de render. El autor reporta una supresion casi total de subtitulos a lo largo de una semana de clips, aunque sin una tasa medida sobre un conjunto de test fijo.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, un tamano de 0.0 GB (lo que sugiere que los pesos no se alojan aqui, solo los JSON y la documentacion) y esta etiquetado con licencia `other`, lo que obliga a revisar los terminos del autor y de los modelos subyacentes antes de cualquier uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (checkpoint de video de 22B fusionado con TIES; familia LTX 2.3) |
| Parametros totales | 22B (checkpoint subyacente referenciado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | JSON de workflows ComfyUI (los pesos del checkpoint no se alojan en el repo; tamano del repo 0.0 GB) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado por el autor, sino la capa de orquestacion sobre un checkpoint de video de 22B parametros fusionado mediante TIES (model merging por signos y magnitudes). La familia referenciada es LTX 2.3, un modelo de generacion de video texto-a-video e imagen-a-video; el paquete anade modulos LoRA de la linea "Insight" (eliminacion de subtitulos, eliminacion de marcas de agua, upscale y reparacion), de los cuales la suite usa dos simultaneamente, dejando upscale y reparacion como conmutador separado.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. Tampoco se detalla la arquitectura interna del checkpoint (transformer de difusion, hybrid, etc.) mas alla de su uso como modelo de video. La innovacion tecnica destacable del paquete es el flujo de dos niveles de render con IC Edit intercalado: un primer render y un paso de limpieza de subtitulos/marcas de agua antes de un segundo nivel de render o reparacion HD, lo que segun el autor anade aproximadamente un minuto de proceso sobre un clip de diez segundos (medicion propia del autor, no verificada sobre un test fijo).

## Capacidades

- Generacion de video texto-a-video mediante el grafo de 90 nodos.
- Generacion de video imagen-a-video mediante el grafo de 273 nodos.
- Generacion con referencia multi-imagen (121 nodos) para mantener consistencia de sujeto o estilo.
- Digital human simple (109 nodos) y dual (108 nodos) para avatares parlantes o presentadores sinteticos.
- Eliminacion de subtitulos incrustados y marcas de agua mediante los grafos IC Edit (35 nodos).
- Reparacion y mejora en HD mediante el grafo IC Edit HD (37 nodos).
- Direccion de prompts con el helper Relay (6 nodos), que combina direccion de trama y direccion de prompts con doble LoRA.
- Idioma de trabajo: ingles (`en`).
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso; es un paquete de generacion de video, no un LLM.

## Casos de uso

- Produccion de avatares digitales para formacion corporativa: el grafo de digital human simple (109 nodos) permite generar presentadores sinteticos con un solo sujeto, adecuado para videos de e-learning donde se requiere consistencia facial a lo largo del clip.
- Dialogos entre dos presentadores sinteticos: el grafo de digital human dual (108 nodos) esta pensado para escenas conversacionales con dos avatares, util en demos de producto o entrevistas simuladas.
- Animar imagenes fijas para marketing: el grafo image-to-video (273 nodos, el mas complejo) convierte fotografias de producto o ilustraciones en clips animados sin rodaje adicional.
- Consistencia de personaje entre planos: el grafo de referencia multi-imagen (121 nodos) permite fijar un sujeto o estilo a partir de varias imagenes de referencia, lo que resulta util en series cortas o storyboards.
- Generacion de clips desde cero para prototipado creativo: el grafo text-to-video (90 nodos) es el punto de entrada mas ligero para explorar ideas antes de pasar a flujos con referencia o digital human.
- Limpieza de material de archivo: el grafo IC Edit de eliminacion de subtitulos y marcas de agua (35 nodos) sirve para reutilizar clips con texto incrustado en nuevas producciones o para localizar contenido a otros mercados.
- Restauracion y reescalado de video: el grafo IC Edit HD (37 nodos) se usa como paso final para reparar artefactos y subir la calidad del render antes de la entrega.
- Automatizacion de pipelines en ComfyUI: los ocho JSON se pueden cargar directamente en ComfyUI y encadenar, lo que facilita integrar la generacion y la posproduccion en un flujo reproducible en lugar de reconstruir nodos a mano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo aporta dos mediciones cualitativas: supresion "casi total" de subtitulos a lo largo de una semana de clips (sin tasa medida sobre test fijo) y un coste adicional de aproximadamente un minuto por cada diez segundos de clip al usar el nivel extra de render con IC Edit.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El checkpoint subyacente es de 22B parametros, lo que en precision FP16 implicaria del orden de 44 GB solo para pesos, mas estados de activacion y el resto del grafo; sin datos oficiales de cuantizacion no se puede dar una cifra fiable.
- GPU recomendadas: no disponible de forma oficial. Por el tamano del checkpoint, un despliegue comodo requeriria GPUs de datacenter (A100 80 GB, H100) o configuraciones multi-GPU; no hay confirmacion del autor.
- Compatibilidad con GPU de consumo: no confirmada. Un checkpoint de 22B en cuantizacion agresiva podria no caber en GPUs de 24 GB (RTX 4090) una vez sumados los nodos de video y los LoRA; se requiere verificacion empirica.
- Opciones de despliegue: ComfyUI es el entorno objetivo (los ocho grafos son JSON de ComfyUI). El autor ofrece tambien ejecucion en RunningHub mediante enlaces a workflows alojados.
- Latencia y throughput: solo se conoce el dato cualitativo del autor (aproximadamente un minuto adicional por clip de diez segundos al activar el nivel extra de IC Edit). No hay cifras de throughput ni de latencia por frame.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / duracion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-KSK/ksk-video-239-comfyui-workflows | 22B (checkpoint subyacente) | no disponible | Workflows ComfyUI sobre LTX 2.3 con IC Edit | other | Hugging Face (0 descargas), RunningHub |
| LTX 2.3 (modelo base referenciado) | 22B | no disponible | Texto-a-video / imagen-a-video | no disponible en esta ficha | Referenciado por el autor; no se enlaza el repo base |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes para comparar con alternativas concretas de la misma categoria (paquetes de workflows de video con posproduccion integrada). La comparativa queda limitada al propio paquete y al modelo base que referencia.

## Limitaciones y advertencias

- La supresion "casi total" de subtitulos es un reporte del autor tras una semana de clips, no una tasa medida sobre un conjunto de test fijo; el rendimiento real puede variar segun el clip, el idioma del texto incrustado y el estilo tipografico.
- El nivel extra de render con IC Edit anade coste temporal (aproximadamente un minuto por clip de diez segundos, medicion del autor), lo que puede ser prohibitivo en produccion a gran escala.
- Solo hay cuatro modulos LoRA en la linea Insight (subtitulos, marcas de agua, upscale, reparacion); la suite usa dos a la vez y deja upscale/reparacion como conmutador separado, lo que limita combinaciones.
- Idioma declarado: solo ingles (`en`); no se documenta soporte multilingue para prompts ni para texto en video.
- Licencia `other`: no se especifican terminos de uso comercial. Es imprescindible revisar la licencia del checkpoint LTX 2.3 subyacente y de los LoRA antes de cualquier despliegue en produccion.
- El repositorio tiene 0 descargas, 0 likes y 0.0 GB de tamano: los pesos no se alojan aqui, solo los JSON y la documentacion. La reproducibilidad depende de obtener el checkpoint y los LoRA por separado.
- Riesgo de alucinacion visual y de artefactos propios de los modelos de difusion de video: no hay evaluacion publicada de fidelidad, coherencia temporal ni sesgos.
- No se documentan sesgos conocidos, limites de contexto ni restricciones adicionales en la informacion disponible.
- La fecha de creacion y actualizacion del repositorio (2026-11-09) es posterior a la fecha actual de referencia de esta ficha; conviene verificar la vigencia y el estado del repositorio antes de usarlo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-239-comfyui-workflows
- Relay director (plot + dual LoRA prompt director), RunningHub: https://www.runninghub.ai/post/2048717560673214466/?inviteCode=rh-v1111
- Suite 2.5 — single digital human, IC Edit clean: https://www.runninghub.ai/post/2054453027771297794/?inviteCode=rh-v1111
- Suite 2.5 — text-to-video, IC Edit clean: https://www.runninghub.ai/post/2054455981848965122/?inviteCode=rh-v1111
- Suite 2.5 — dual digital human, IC Edit clean: https://www.runninghub.ai/post/2054479470995755009/?inviteCode=rh-v1111
- Suite 2.5 — image-to-video, IC Edit clean: https://www.runninghub.ai/post/2054434432525840386/?inviteCode=rh-v1111
- Suite 2.5 — multi-image reference, IC Edit clean: https://www.runninghub.ai/post/2054535482951913473/?inviteCode=rh-v1111
- IC Edit HD repair: https://www.runninghub.ai/post/2054546073984749570/?inviteCode=rh-v1111
- IC Edit watermark/subtitle removal: https://www.runninghub.ai/post/2054546081706463234/?inviteCode=rh-v1111
- Tutorial en video (YouTube): https://www.youtube.com/watch?v=ESU7isCNZww
- Original en chino (Bilibili): https://www.bilibili.com/video/BV1za5y6FE7r
