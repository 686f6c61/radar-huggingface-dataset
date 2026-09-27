# RunningHubAI/rh-zimage-turbo-075-9000-lora

## Resumen

rh-zimage-turbo-075-9000-lora es un adaptador LoRA de bajo rango para generacion de imagenes texto-a-imagen, publicado por RunningHubAI en Hugging Face. No es un modelo completo: se trata de un fichero de pesos de 76 MiB (`Zimage Turbo-美女075-性感动漫美女-9000.safetensors`) que se aplica sobre el modelo base Z-Image-Turbo, un modelo de difusion de 6.000 millones de parametros desarrollado por el equipo Tongyi-MAI. El adaptador esta especializado en la generacion de retratos y figuras femeninas de estetica anime, con un sesgo claro hacia representaciones estilizadas y sugerentes segun la propia descripcion del autor.

El interes de esta ficha es acotado: se enmarca en el ecosistema de LoRAs de personaje y estilo que se cargan en ComfyUI o en la plataforma RunningHub para ajustar el comportamiento de un modelo base sin reentrenarlo. El valor practico depende casi por completo del modelo Z-Image-Turbo subyacente, que segun su repositorio oficial alcanza inferencia sub-segundo en GPUs H800 con solo 8 NFE (evaluaciones de funcion) y cabe en 16 GB de VRAM.

La relevancia inmediata es limitada por su estado de publicacion: cero descargas, cero valoraciones, sin model card tecnica, sin licencia declarada y sin resultados de evaluacion. Cualquier uso en produccion deberia tratarse como experimental y acompanarse de una revision legal del contenido generado y de los derechos sobre el adaptador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Z-Image-Turbo (modelo de difusion de 6.000 millones de parametros); la topologia interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | Adaptador de aproximadamente 76 MiB; modelo base de 6.000 millones de parametros |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de generacion de imagenes); no disponible el limite de tokens de prompt |
| Tipos de cuantizacion | No disponible para el adaptador; no se documenta ninguna variante GGUF, FP8 o INT8 |
| Idiomas soportados | No disponible |
| Licencia | No disponible. El repositorio indica que los derechos permanecen en el autor y que debe seguirse la licencia del proyecto original o del modelo base |
| Formato de pesos | safetensors (`Zimage Turbo-美女075-性感动漫美女-9000.safetensors`, 76 MiB) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura del adaptador ni su proceso de entrenamiento. Se sabe que es un LoRA de tipo text-to-image afinado a partir de Z-Image-Turbo y que se distribuye como un unico fichero safetensors de 76 MiB, un tamano coherente con un adaptador de bajo rango sobre un transformer de difusion de 6.000 millones de parametros. No se publican el rango o el alpha del adaptador, el numero de pasos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de regularizacion o de captioned training.

El nombre del fichero sugiere dos parametros operativos: el sufijo `075` apunta a un peso de aplicacion recomendado de 0,75 y `9000` a un entrenamiento de 9.000 pasos. Ninguna de las dos interpretaciones esta confirmada por documentacion del autor, por lo que deben tratarse como hipotesis de nomenclatura y no como especificaciones verificadas. El repositorio unicamente remite a la plataforma RunningHub para cargar los pesos y ofrece enlaces a herramientas de entrenamiento propias, sin detallar la receta empleada.

Como referencia del modelo base, el repositorio oficial de Tongyi-MAI describe la familia Z-Image como un conjunto de modelos de generacion de imagenes de 6.000 millones de parametros, con una variante Turbo destilada que iguala o supera a competidores con solo 8 NFE, ofrece latencia de inferencia sub-segundo en GPUs H800 y se ajusta con comodidad en 16 GB de VRAM. Un articulo de la comunidad sobre entrenamiento de LoRAs para Z-Image-Turbo documenta configuraciones con rango y alpha de 16 (capas lineales y convolucionales), guardado en precision completa fp32, sin cuantizacion y con muestreo de timesteps sigmoideo, aunque no hay confirmacion de que este adaptador concreto haya usado esa receta.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por el modelo base Z-Image-Turbo.
- Especializacion en retratos y figuras femeninas de estetica anime, con tendencia al estilo sugestivo segun la descripcion del autor.
- Modificacion del estilo, el acabado y los rasgos de personaje del modelo base sin necesidad de reentrenarlo.
- Composicion con otros LoRAs y con modelos base alternativos dentro del ecosistema Z-Image, sujeto a la compatibilidad entre variantes Turbo y base.
- Integracion en flujos de trabajo de ComfyUI y carga en la plataforma RunningHub.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: son funciones ajenas a un modelo de difusion de imagenes.
- No se documentan capacidades de vision de entrada, audio, video ni modo de razonamiento explicito.
- No se documentan capacidades multilingues ni el idioma esperado de los prompts.

## Casos de uso

- Ilustracion de personajes para manga, webcomic o novela ligera: el adaptador permite fijar un estilo anime consistente entre ilustraciones sin reentrenar el modelo base, cargandolo en ComfyUI con un peso de aplicacion cercano al sugerido por el nombre del fichero.
- Diseno conceptual de personajes en videojuego: resulta util para generar hojas de concepto y variaciones de vestuario o expresion en fases tempranas de preproduccion, donde la velocidad de iteracion importa mas que el acabado final.
- Creacion de avatares y retratos para comunidad o redes: aprovecha la estetica anime del adaptador para producir imagenes de perfil personalizables por prompt, con el limite de que no hay garantia de derechos sobre el resultado.
- Prototipado de estilos dentro de un pipeline de ComfyUI: al ser un fichero de 76 MiB, se puede intercambiar rapidamente entre variantes y combinaciones de LoRA para comparar resultados antes de fijar un estilo de produccion.
- Generacion por lotes en GPU de consumo: el modelo base cabe en 16 GB de VRAM segun su documentacion, lo que permite ejecutar el adaptador en estaciones de trabajo locales sin depender de infraestructura en la nube.
- Servicio de generacion bajo demanda mediante API: el repositorio apunta a la API de RunningHub, lo que permite exponer la generacion de imagenes como servicio sin desplegar las GPUs.
- Generacion de material de referencia para artistas: sirve como punto de partida para bocetos y composiciones que despues se retocan manualmente, reduciendo el tiempo de bloqueo inicial.
- Aumento de datos sinteticos para clasificadores de estilo: se pueden generar lotes de imagenes etiquetadas por estilo anime para tareas auxiliares de vision por computador, siempre que se revise la licencia del resultado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio del adaptador no incluye comparativas, curvas de evaluacion ni ejemplos de inferencia con metricas.

Del modelo base Z-Image-Turbo, el repositorio oficial de Tongyi-MAI indica los siguientes datos de rendimiento, que se reproducen aqui como referencia y no como medicion del adaptador:

| Dato | Valor |
|---|---|
| Parametros del modelo base | 6.000 millones |
| NFE de inferencia | 8 |
| Latencia en GPU H800 | Sub-segundo (cifra declarada por el autor) |
| VRAM del modelo base | Ajusta en 16 GB |
| Benchmarks del adaptador LoRA | No disponible |

## Requisitos de hardware

- El coste de VRAM lo determina el modelo base, no el adaptador: el LoRA solo anade unos 76 MiB de pesos.
- Estimacion a partir de los 6.000 millones de parametros del modelo base: en fp16 el modelo ocupa del orden de 12 GB, por lo que necesita una GPU de 16 GB o mas; en formatos cuantizados a 8 bits o 4 bits la huella se reduce, pero no hay variantes cuantizadas publicadas para este adaptador.
- GPUs recomendadas por el propio autor del modelo base: H800 para el escenario de latencia sub-segundo. En entornos profesionales, A100 y H100 son adecuadas por VRAM y ancho de banda.
- GPU de consumo: una RTX 4090 (24 GB) o una RTX 3090 (24 GB) son opciones holgadas; una RTX 4080 o 4060 Ti de 16 GB encajan en el limite documentado de 16 GB. No hay confirmacion de funcionamiento por debajo de ese umbral.
- Opciones de despliegue: ComfyUI como entorno de referencia del repositorio, carga en la plataforma RunningHub, integracion mediante la API de RunningHub, y uso con librerias de difusion (por ejemplo diffusers) segun el soporte que ofrezca el modelo base. vLLM, TGI y Ollama no aplican a modelos de difusion de imagenes.
- Latencia y throughput: no disponible para el adaptador. El unico dato publicado corresponde al modelo base (sub-segundo en H800 con 8 NFE).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto de uso | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rh-zimage-turbo-075-9000-lora | LoRA de personaje/estilo sobre Z-Image-Turbo | Adaptador de 76 MiB sobre base de 6.000 millones | ComfyUI, RunningHub, Hugging Face | No disponible | Publicado, sin descargas ni validacion comunitaria |
| rh-zimage-turbo-087-9000-lora | LoRA de la misma familia y autor | Adaptador sobre base de 6.000 millones | ComfyUI, RunningHub, Hugging Face | No disponible | Publicado en el mismo repositorio de organizacion |
| LoRA sobre Z-Image-Turbo entrenado por la comunidad | LoRA de estilo o personaje | Adaptador sobre base de 6.000 millones | AI Toolkit, ComfyUI, Civitai | Variable segun autor | Ampliamente documentado en guias de entrenamiento |
| LoRA sobre FLUX.1 o SDXL | LoRA de estilo o personaje | Adaptador sobre bases de 12.000 y 2.600 millones de parametros respectivamente | ComfyUI, Automatic1111, Forge | Variable segun autor | Ecosistema maduro y con mucha oferta de modelos |

La comparacion cuantitativa de rendimiento entre estos adaptadores no es posible con la informacion disponible: ninguno de ellos publica metricas comparables y este repositorio en concreto no incluye ejemplos de inferencia.

## Limitaciones y advertencias

- Ausencia total de licencia declarada: el repositorio indica que los derechos son del autor y que debe seguirse la licencia del proyecto original, lo que deja el uso comercial en una situacion juridica ambigua. Conviene verificar la licencia de Z-Image-Turbo antes de cualquier despliegue productivo.
- Contenido sensible: la descripcion del autor apunta explicitamente a representaciones femeninas de estetica anime sugestiva, lo que puede derivar en material no apto para todos los publicos y en riesgo de incumplir las politicas de uso de plataformas de distribucion o de los proveedores de API.
- Sin model card tecnica: no se documentan rango, alpha, dataset, pasos de entrenamiento, parametros de muestreo recomendados ni la semilla o configuracion con la que se generaron los ejemplos. Esto dificulta la reproducibilidad.
- Parametros operativos inferidos del nombre del fichero: el peso de aplicacion de 0,75 y los 9.000 pasos no estan confirmados por documentacion alguna.
- Riesgo de sesgo: un adaptador entrenado sobre un concepto estrecho de belleza femenina tiende a reproducir un canon estetico limitado y a sobrerrepresentar ese estilo en todas las generaciones, reduciendo la diversidad de los resultados.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede generar anatomia incorrecta, manos deformes, artefactos en el texto de la imagen y detalles incoherentes con el prompt.
- Cero adopcion: sin descargas ni valoraciones, no hay evidencia externa de calidad, estabilidad ni compatibilidad real con distintos flujos de trabajo.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma y su comportamiento cambia si se aplica sobre variantes distintas de la familia Z-Image. La documentacion de la comunidad advierte de que un LoRA entrenado sobre el modelo base es compatible con el Turbo, pero no necesariamente al contrario.
- Metadatos anomalos: las fechas de creacion y actualizacion del repositorio (2026) son posteriores a la fecha de consulta habitual, lo que sugiere un error de registro o un entorno de prueba. Conviene no fiarse de ellas para trazabilidad.
- Idioma de prompt no documentado: no hay indicacion de si el adaptador responde mejor a prompts en ingles, en chino o en castellano.
- Sin cifras de latencia ni throughput propias: cualquier planificacion de capacidad debera basarse en mediciones propias sobre el modelo base.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/RunningHubAI/rh-zimage-turbo-075-9000-lora
- Modelo original en RunningHub: https://www.runninghub.cn/model/public/2096650117209214978
- Pagina del autor en RunningHub: https://www.runninghub.cn/user-center/1989901688414875650
- Repositorio oficial de Z-Image (Tongyi-MAI): https://github.com/Tongyi-MAI/Z-Image
- Variante de la misma familia en Hugging Face: https://huggingface.co/RunningHubAI/rh-zimage-turbo-087-9000-lora
- Guia de entrenamiento de LoRA para Z-Image-Turbo: https://civitai.com/articles/23863/z-image-turbo-lora-training-setup-full-precision-adapter-v2-massive-quality-jump
- Flujo de trabajo de doble y triple muestreo con Z-Image en RunningHub: https://www.runninghub.ai/post/2073209515941863424
- Detalle del flujo anterior en RunningHub: https://www.runninghub.ai/ai-detail/2073209620581359616
- Entrenamiento de modelos en RunningHub: https://www.runninghub.ai/page-model
- Documentacion de la API de RunningHub: https://www.runninghub.cn/runninghub-api-doc-en/
- Plataforma RunningHub internacional: https://www.runninghub.ai
