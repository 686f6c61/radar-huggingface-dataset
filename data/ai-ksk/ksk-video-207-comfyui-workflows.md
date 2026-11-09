# AI-KSK/ksk-video-207-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-207-comfyui-workflows` no es un modelo de pesos en el sentido habitual, sino un repositorio de flujos de trabajo (workflows) de ComfyUI publicados como material complementario de un tutorial sobre humanoides digitales con lip-sync. El repositorio acompaña a un episodio que describe una tecnica de renderizado en tres pasadas ("three-stage render") para mejorar la sincronizacion labial en videos generados, e incluye ademas una variante para planos con caras pequenas. El autor es AI-KSK y el repositorio tiene un tamano de 0.0 GB, es decir, no contiene checkpoints ni pesos: solo el `README.md` con las notas del tutorial y, segun la model card, los grafos JSON referenciados.

Los modelos que se orquestan en estos flujos son LTX 2.3 (checkpoint `ltx-2.3-22b-dev`) y LTX 2 (checkpoint `ltx-2-19b-dev`), ambos de generacion de video con acondicionamiento por audio. El interes practico del repositorio esta en la receta concreta de tres pasadas, los valores de CFG y sigma, y las reglas operativas (camara estatica, duracion de audio como duracion de video, alineacion del latent noise mask) que el autor documenta para obtener lip-sync estable. Es relevante ahora porque el lip-sync de calidad en modelos de video open source sigue siendo fragil y estas notas condensan ajustes reproducibles.

No se dispone de informacion sobre arquitectura interna, numero de parametros exactos, contexto o datos de entrenamiento de LTX 2.3 y LTX 2 mas alla de lo que aparece en la model card. Todo lo que sigue se limita a lo documentado por el autor; lo no cubierto se marca como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de workflows ComfyUI; orquesta los checkpoints LTX 2.3 y LTX 2) |
| Parametros totales | no disponible para el repositorio; los checkpoints referenciados se denominan `ltx-2.3-22b-dev` (22B) y `ltx-2-19b-dev` (19B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | no disponible (el repositorio contiene `README.md` y grafos JSON de ComfyUI; no incluye pesos) |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo entrenado, sino flujos de ComfyUI. La model card describe dos grafos: "LTX 2.3 1+3 digital human" con 64 nodos, checkpoint `ltx-2.3-22b-dev` y LoRAs `distil-384` a 0.5 e `ic-lora motion-track-control-ref0.5` a 1.0; y "LTX 2 1+3 digital human" con 69 nodos, checkpoint `ltx-2-19b-dev` y LoRAs `lora camera-control-static` a 0.5 y `distil-384` a 0.4. Ambos comparten estructura: primera pasada con `euler_ancestral_cfg_pp` a CFG 1 con una cadena de 9 valores sigma, y dos pasadas posteriores con `euler_cfg_pp`, CFG 1 y sigmas `0.85, 0.7250, 0.4219, 0.0`. Los latents son de 320x288x97 y el audio de 97 frames a 25 fps, con un upscaler espacial 1.0 (variante 2.3 o 2).

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni tecnicas de alineamiento (RLHF/DPO) para los checkpoints LTX referenciados. La innovacion documentada es de inferencia: un esquema de tres pasadas con pesos del nodo image-to-video de 0.7 / 1 / 1 y un ajuste explicito del `Set Latent Noise Mask` en las pasadas 2 y 3 para evitar desalineacion de la condicion de audio. El autor advierte que las mejoras de tasa de exito son "probabilidad observada, no un benchmark".

## Capacidades

- Generacion de video a partir de imagen y audio con sincronizacion labial (lip-sync) mediante los grafos de ComfyUI documentados.
- Renderizado en tres pasadas para mejorar la calidad del lip-sync en humanoides digitales.
- Variante especifica para planos con caras pequenas (grafo LTX 2), pensada para figuras que ocupan menos de aproximadamente 1/20 del encuadre.
- Control de camara estatica mediante LoRA (`lora camera-control-static`) y control de movimiento (`ic-lora motion-track-control-ref0.5`).
- Aceleracion por destilacion (`distil-384`) aplicada con pesos distintos en cada grafo.
- Sincronizacion de duracion: la longitud del audio en segundos determina la longitud del video (demo de 18 s).
- Soporte de dialogo entre dos hablantes unicamente escribiendo el dialogo en el prompt de image-to-video, no mediante audio.
- Idioma de la documentacion y de los prompts de ejemplo: ingles.

## Casos de uso

- Prototipado de avatares parlantes: partiendo de una sola imagen fija y una pista de audio, el grafo de tres pasadas genera un clip con lip-sync; util para validar concepto antes de invertir en pipelines propietarios.
- Produccion de videos cortos para redes: con audio de 18 s y camara estatica, el flujo entrega clips de duracion controlada por el audio, adecuado para formatos verticales y horizontales.
- Locucion automatizada de contenido formativo: se graba la voz y se anima un retrato del ponente, manteniendo encuadre fijo para no romper el lip-sync.
- Planos de figura completa o caras pequenas: el grafo LTX 2 con `lora camera-control-static` cubre casos en los que el grafo 2.3 produciria video estatico por tamano de cara insuficiente.
- Iteracion de investigacion en lip-sync: los valores de sigma, CFG y pesos por pasada sirven como linea base reproducible para comparar variantes.
- Demostraciones y tutoriales tecnicos: el repositorio funciona como material docente para explicar el pipeline de ComfyUI con LTX y LoRAs de control.
- Escenas de dos personajes: escribiendo el dialogo en el prompt de image-to-video en lugar de conducir con audio, para casos donde no se requiere sincronizacion por pista.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que las ganancias de tasa de exito son probabilidad observada y no un benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Los checkpoints referenciados son de 22B y 19B, lo que en la practica exige GPUs de gama alta o ejecucion en servicios en la nube; no se documentan cifras concretas.
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 u otras consumer.
- Opciones de despliegue: ComfyUI (entorno para el que estan disenados los grafos). No se documentan vLLM, llama.cpp, Ollama ni TGI, que ademas no aplican a generacion de video.
- Latencia y throughput: no disponibles.
- Resolucion y duracion de trabajo documentadas: latents 320x288x97, audio de 97 frames a 25 fps, demo de 18 s.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de generacion de video con lip-sync ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es documentacion y flujos; requiere descargar por separado los checkpoints LTX 2.3 y LTX 2 y las LoRAs citadas.
- Solo admite una unica imagen fija como entrada ("single still image only").
- La camara debe ser estatica; si el sujeto sale del encuadre no se puede sincronizar el labio.
- La cara debe ocupar al menos aproximadamente 1/20 del encuadre; por debajo, el grafo 2.3 produce video estatico y hay que usar el grafo LTX 2.
- El lip-sync con dos hablantes no se controla por audio: hay que escribir el dialogo en el prompt de image-to-video.
- Es necesario aumentar el ancho y alto del `Set Latent Noise Mask` en las pasadas 2 y 3 para evitar desalineacion de la condicion de audio.
- Las mejoras de calidad son probabilidad observada, no resultados medidos con benchmark; no deben presentarse como metricas.
- Licencia "other": no se detallan los terminos, por lo que el uso comercial queda sin garantia hasta revisar la licencia de los checkpoints y LoRAs subyacentes.
- Idioma documentado: ingles; no se declara soporte multilingue.
- Riesgo de sesgos y alucinacion visual: no documentado en la informacion disponible, pero inherente a los modelos generativos de video; conviene revision humana antes de publicar.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validacion comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-207-comfyui-workflows
- RunningHub (post 1): https://www.runninghub.ai/post/2034922238251634690/?inviteCode=rh-v1111
- RunningHub (post 2): https://www.runninghub.ai/post/2034922123667447810/?inviteCode=rh-v1111
- Video en YouTube: https://www.youtube.com/watch?v=GTuHi9KdNg0
- Video en Bilibili: https://www.bilibili.com/video/BV1HgApzdEm3
