# RunningHubAI/rh-tf-flux2-klein-9b-consis-lora-v2.safetensors-lora

## Resumen

`rh-tf-flux2-klein-9b-consis-lora-v2` es un adaptador LoRA de bajo rango (544 MiB) para generación y edición de imagen a partir de texto, desarrollado por el usuario @田峰 y publicado en HuggingFace por RunningHubAI. No es un modelo completo: se trata de un complemento que se carga sobre el backbone de difusión FLUX.2 [klein] 9B, un modelo DiT (Diffusion Transformer) de aproximadamente 9.000 millones de parametros. Su proposito es resolver el problema de deriva de imagen (*image drift*) en flujos de trabajo de imagen a imagen, inpainting, outpainting y edicion continua multi-plano.

La funcion principal del adaptador es restringir al modelo base durante la edicion para conservar rasgos faciales del personaje original, estructura de objetos, colores, composicion y detalles de textura, reduciendo la deformacion facial y el desplazamiento de objetos que aparecen al aplicar varias iteraciones consecutivas sobre una misma imagen. La version v2 incorpora una optimizacion del algoritmo de perdida de color en altas y bajas frecuencias, que segun el autor equilibra la consistencia con la capacidad de edicion y reduce la desaturacion y el emborronamiento de detalles respecto a la version preliminar.

Es relevante para equipos que construyen pipelines de produccion visual con FLUX.2, ya que la consistencia entre tomas es uno de los cuellos de botella practicos en storyboards, retoque iterativo y catalogos de producto. El repositorio no declara licencia, idiomas ni resultados de evaluacion, y en el momento de la consulta acumulaba 0 descargas y 0 likes, por lo que se trata de un artefacto muy reciente y sin validacion independiente publica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA de bajo rango sobre backbone DiT (Diffusion Transformer) FLUX.2 [klein] 9B |
| Parametros totales | No aplicable al adaptador; el modelo base Flux2-Klein-9B declara 9.000 millones de parametros (dato del autor, no verificado de forma independiente) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | No aplicable (modelo de difusion para imagen, no de lenguaje); no disponible |
| Tipos de cuantizacion | No disponible para el adaptador; los pesos se distribuyen en safetensors y dependen de la cuantizacion del modelo base |
| Idiomas soportados | No disponibles (los prompts dependen del codificador de texto del modelo base) |
| Licencia | No disponible. La model card indica que RunningHub publica en nombre del autor, que el copyright permanece en el autor y que debe seguirse la licencia del proyecto original o upstream |
| Formato de pesos | safetensors (archivo `tf-Flux2-Klein-9B-Consis-Lora-保持图像一致性_v2.safetensors`, 544 MiB) |
| Modelo base | Flux2-Klein-9B (FLUX.2 [klein] 9B) |
| Tipo de tarea | text-to-image, edicion de imagen (img2img, inpainting, outpainting) |
| Tamano del repositorio | 0,6 GB |
| Plataformas compatibles | ComfyUI, RunningHub, Hugging Face |
| Palabras de activacion | El autor indica que no requiere trigger words; lista como etiquetas: Flux2, Klein-9B, Consis-Lora, 保持图像一致性_v2, Klein, Klein9B tf |

## Arquitectura y entrenamiento

El adaptador es una LoRA de bajo rango acoplada a FLUX.2 [klein] 9B, cuyo backbone es un Diffusion Transformer de 9.000 millones de parametros. La model card no detalla en que subconjunto de capas (atencion, proyecciones o bloques completos) se inyectan las matrices de bajo rango, ni el rango, el alpha o el dropout utilizados. Tampoco se especifica si el adaptador va dirigido al transformer de difusion, al codificador de texto o a ambos. Toda esa informacion figura como no disponible.

Respecto al entrenamiento, el autor describe una innovacion concreta: la version v2 optimiza el algoritmo de perdida de color de altas y bajas frecuencias, lo que segun la propia model card permite equilibrar la consistencia de imagen con la capacidad de edicion y mitiga dos sintomas de la version preliminar, la perdida de saturacion cromatica y el desenfoque de detalles finos. No se documenta el numero de pasos de entrenamiento, el volumen ni la composicion del dataset, el uso de tecnicas de alineacion como RLHF o DPO (poco habituales en difusion), ni el regimen de aprendizaje. El adaptador se presenta como combinable con otras LoRA de estilo y con ControlNet dentro del pipeline completo de edicion de Flux2 Klein 9B, lo que implica que las matrices aprendidas estan pensadas para sumarse a las del modelo base sin sustituir su comportamiento generativo.

## Capacidades

- Edicion de imagen a imagen preservando identidad: mantiene rasgos faciales, estructura de objetos, paleta de color, composicion y textura del sujeto original a lo largo de varias iteraciones.
- Consistencia multi-plano: permite generar varias tomas o fotogramas del mismo personaje u objeto sin que la apariencia derive entre planos.
- Inpainting local: rellena regiones enmascaradas sin alterar el resto de la imagen de referencia.
- Outpainting: extiende el lienzo manteniendo la coherencia de estilo, iluminacion y estructura con la zona original.
- Retoque iterativo multi-pasada: soporta cadenas de ediciones sucesivas sin acumular distorsion, deformacion facial ni desplazamiento de objetos.
- Composicion con otras LoRA: el autor indica compatibilidad de uso simultaneo con LoRA de estilo.
- Integracion con ControlNet: disenado para convivir con ControlNet dentro del pipeline de Flux2 Klein 9B.
- Sin trigger words obligatorias: el adaptador se activa por su presencia en el pipeline, no por una palabra clave en el prompt.
- Generacion de imagen a partir de texto: al ser un complemento de un modelo text-to-image, participa tambien en flujos puramente generativos.
- No se documentan capacidades de tool calling, uso como agente, razonamiento multi-paso, vision comprensiva, audio ni modo de pensamiento, ya que no es un modelo de lenguaje.

## Casos de uso

- Storyboards y previsualizacion de cine o animacion: se genera un personaje en un plano de referencia y se reutiliza el adaptador para producir el resto de planos manteniendo el mismo rostro, vestuario y proporcion, evitando que el personaje cambie de aspecto entre viñetas.
- Retoque fotografico iterativo en produccion: en sesiones donde un retocador aplica decenas de pasadas de edicion sobre la misma imagen, el adaptador limita la acumulacion de artefactos y la perdida de definicion que normalmente aparece tras varias iteraciones de img2img.
- Catalogos de e-commerce: se fotografia un producto una sola vez y se generan variantes de fondo, encuadre o iluminacion manteniendo intactos logo, forma, color y textura del articulo, lo que reduce costes de sesion fotografica.
- Diseno de personajes para videojuegos: partiendo de un concept art aprobado, se producen expresiones, poses y angulos adicionales preservando el diseno, e integrarlos despues como referencias en el pipeline de modelado.
- Inpainting de elementos no deseados en arquitectura e interiorismo: se eliminan objetos de una estancia y se rellena el hueco respetando la perspectiva, los materiales y la temperatura de color del entorno original.
- Outpainting para adaptar formatos: se extiende una misma imagen a proporciones distintas (cuadrado, 16:9, vertical para redes) sin que el sujeto se deforme ni cambie de identidad entre versiones.
- Edicion editorial con estilo fijo: combinando el adaptador con una LoRA de estilo, se producen series de ilustraciones coherentes en tono y paleta para un mismo articulo o campana.
- Automatizacion de pipelines creativos via API: la publicacion en RunningHub permite invocar el flujo a traves de su API, de modo que un backend puede encadenar generacion, edicion y consistencia sin intervencion manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas de consistencia (por ejemplo, similitud facial, LPIPS, CLIP-I o DINO-I), ni comparaciones objetivas frente a la version preliminar del propio adaptador o frente a otras LoRA de consistencia. La unica afirmacion de mejora es cualitativa: la v2 equilibra consistencia y capacidad de edicion y reduce la perdida de color y el desenfoque de detalles respecto a la version preview. No se dispone tampoco de tiempos de inferencia ni de throughput medidos.

## Requisitos de hardware

- Peso del adaptador: 544 MiB en safetensors, una fraccion minima del total necesario para ejecutar el pipeline.
- El coste real de VRAM lo determina el modelo base Flux2 Klein 9B, no el adaptador. Como estimacion orientativa para un DiT de 9.000 millones de parametros: en precision fp16 los pesos ocupan del orden de 18 GB, a los que hay que sumar el codificador de texto, el VAE, las activaciones y los tensores de atencion durante la generacion. La model card no desglosa estos componentes, por lo que el reparto exacto figura como no disponible.
- GPU de datacenter recomendadas: A100 (40 o 80 GB), H100 o H200 para ejecucion en fp16/bf16 sin cuantizacion y con margen para resoluciones altas.
- GPU de consumo con margen: RTX 4090 o RTX 3090 con 24 GB de VRAM, viables en fp16 con resoluciones moderadas y por lotes pequenos.
- GPU de gama media: tarjetas de 12 a 16 GB (RTX 4080, 4070 Ti, 3060 de 12 GB) resultan viables solo con cuantizacion del modelo base (fp8 o formatos GGUF) y, en varios casos, con descarga de modulos a RAM; es una estimacion, no un dato confirmado por el autor.
- Opciones de despliegue: ComfyUI es el entorno de referencia declarado y el adaptador esta etiquetado como recurso de ComfyUI. RunningHub es la plataforma nativa del autor y ofrece ejecucion en linea y API. diffusers y stable-diffusion.cpp serian alternativas plausibles si el ecosistema publica soporte para FLUX.2 [klein] 9B, pero no estan confirmadas en la informacion disponible. vLLM, TGI y llama.cpp no son aplicables porque estan orientados a modelos de lenguaje, no a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos publicados de rendimiento de este adaptador, por lo que la comparacion se limita a caracteristicas verificables. Los adaptadores de consistencia para FLUX.1 (por ejemplo, las LoRA de identidad y edicion de la comunidad sobre FLUX.1-dev) son los equivalentes funcionales mas cercanos, aunque operan sobre un backbone distinto y no son intercambiables.

| Aspecto | rh-tf-flux2-klein-9b-consis-lora-v2 | LoRA de consistencia sobre FLUX.1-dev | Modelo base Flux2-Klein-9B sin LoRA |
|---|---|---|---|
| Tipo | Adaptador LoRA (544 MiB) sobre DiT 9B | Adaptador LoRA sobre DiT 12B | Difusion transformer 9B |
| Parametros del backbone | 9.000 millones (dato del autor) | 12.000 millones (FLUX.1-dev) | 9.000 millones (dato del autor) |
| Enfoque | Consistencia en img2img, inpaint, outpaint y edicion multi-plano | Consistencia de identidad y estilo en edicion | Generacion y edicion sin refuerzo de consistencia |
| Composicion con LoRA de estilo y ControlNet | Declarada compatible | Habitualmente compatible | No aplica |
| Licencia | No disponible, sujeta a la licencia del proyecto original | Licencia de FLUX.1 [dev] (no comercial en su version base) | No disponible en la informacion facilitada |
| Disponibilidad | HuggingFace (0 descargas, 0 likes) y RunningHub | Amplia distribucion en HuggingFace y ComfyUI | Distribucion segun el proyecto original |
| Resultados de benchmark | No publicados | Variables y no comparables directamente | No publicados |

## Limitaciones y advertencias

- Ausencia total de datos de evaluacion: no hay metricas de consistencia, comparativas objetivas ni validacion por terceros. Las afirmaciones de mejora de la v2 son cualitativas y provienen del propio autor.
- Licencia no declarada: la model card no especifica una licencia concreta para el adaptador y remite a la licencia del proyecto original o upstream. Esto genera incertidumbre juridica para uso comercial y obliga a verificar los terminos de FLUX.2 [klein] 9B antes de desplegarlo en produccion.
- Trazabilidad limitada: el adaptador se publica en nombre del autor bajo la plataforma RunningHub, sin repositorio de entrenamiento, configuracion de hiperparametros ni dataset documentado.
- Riesgo de artefactos heredados: al ser un adaptador, cualquier sesgo, limitacion o artefacto del modelo base se mantiene. El ajuste se centra en la consistencia, no corrige sesgos de representacion, sesgos culturales ni problemas de composicion del backbone.
- Dependencia del peso de la LoRA: si se aplica con una escala alta, es previsible una reduccion de la capacidad de edicion efectiva o una sensacion de imagen "congelada"; si se aplica con escala baja, la deriva puede reaparecer. El autor no publica valores recomendados.
- Riesgo de distorsion en escenarios fuera de distribucion: en prompts muy alejados del dominio de entrenamiento (que no se documenta) pueden aparecer deformaciones anatomicas, texto ilegible o mezclas incorrectas de elementos, comportamientos tipicos de los modelos de difusion.
- Cobertura idiomatica no declarada: el campo de idiomas aparece vacio. El rendimiento con prompts en castellano depende por completo del codificador de texto del modelo base y no esta verificado.
- Madurez muy baja: 0 descargas y 0 likes en el momento de la consulta, creado y actualizado con un minuto de diferencia, sin historial de versiones ni issues publicas.
- Sin garantias de compatibilidad: aunque se anuncia compatibilidad con ControlNet y otras LoRA, no se especifican versiones concretas ni combinaciones probadas, lo que puede provocar conflictos de pesos en pipelines personalizados.
- Restricciones de plataforma: el uso nativo esta vinculado a ComfyUI y a RunningHub; no hay confirmacion de soporte en diffusers ni en otras herramientas.

## Enlaces

- HuggingFace: https://huggingface.co/RunningHubAI/rh-tf-flux2-klein-9b-consis-lora-v2.safetensors-lora
- Modelo original en RunningHub: https://www.runninghub.ai/model/public/2092727550966530050
- Pagina del autor: https://www.runninghub.ai/user-center/2080788402504843266
- RunningHub (sitio internacional): https://www.runninghub.ai
- RunningHub (sitio China): https://www.runninghub.cn
- Documentacion de la API (ingles): https://www.runninghub.cn/runninghub-api-doc-en/
- Documentacion de la API (chino): https://www.runninghub.cn/runninghub-api-doc-cn/
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Endpoint de API para Seedance 2.5: https://www.runninghub.ai/call-api/api-detail/2133100000000700025
- README en chino: README_cn.md (referenciado en la model card, dentro del repositorio)
