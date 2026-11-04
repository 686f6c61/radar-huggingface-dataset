# Jakes09/Flux-NSFW-uncensored

## Resumen

Flux-NSFW-uncensored es un adaptador LoRA (Low-Rank Adaptation) para el modelo de difusion texto-a-imagen FLUX.1-dev de Black Forest Labs, publicado por el usuario Jakes09 en HuggingFace. Su objetivo declarado es reducir las restricciones de censura del modelo base para permitir la exploracion de los limites tecnicos de la generacion de imagenes con IA, incluyendo contenido para adultos. No se trata de un modelo independiente, sino de un conjunto de pesos adicionales que se cargan sobre FLUX.1-dev mediante la libreria PEFT.

El repositorio tiene un tamano de 0,7 GB, coherente con un adaptador LoRA de rango bajo y no con un modelo completo de difusion (FLUX.1-dev supera los 20 GB en precision completa). La model card esta redactada en ingles e incluye ejemplos de codigo en Python con comentarios en coreano, lo que sugiere una reutilizacion de plantillas de otros proyectos. En el momento de la consulta el modelo registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-04), sin historial de versiones.

La relevancia de esta ficha es acotada: se trata de un fine-tune no validado, sin benchmarks publicados ni documentacion tecnica detallada, orientado a generacion de contenido NSFW. Resulta util como referencia para entender el ecosistema de LoRAs sobre FLUX.1-dev y las implicaciones de licencia del modelo base, pero no como una opcion recomendable para produccion sin una evaluacion previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre FLUX.1-dev (transformer de difusion) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base FLUX.1-dev tiene 12 000 millones de parametros) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen; sin ventana de contexto textual declarada) |
| Tipos de cuantizacion | no disponible (el ejemplo usa float16 para el modelo base) |
| Idiomas soportados | ingles (en) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (lora.safetensors) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se aplica sobre FLUX.1-dev, un transformer de difusion de 12 000 millones de parametros desarrollado por Black Forest Labs. FLUX.1-dev emplea un transformer multimodal con atencion de doble flujo (double-stream) y flujo unico (single-stream), junto con un VAE y un codificador de texto (CLIP y T5). El LoRA modifica los pesos de atencion del transformer de difusion para desplazar la distribucion generativa hacia contenido sin censura.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de pasos, el rango del LoRA, la tasa de aprendizaje ni si se aplicaron tecnicas como regularizacion o data augmentation. La model card no documenta el proceso de entrenamiento ni las capacidades del adaptador mas alla de su proposito declarado. El ejemplo de codigo carga el adaptador con `pipe.load_lora_weights` de la libreria PEFT, con un `weight_name` de `lora.safetensors`, lo que confirma la naturaleza LoRA del artefacto.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de prompts en ingles, heredando las capacidades del modelo base FLUX.1-dev.
- Reduccion de las restricciones de censura del modelo base para permitir contenido para adultos (NSFW).
- Soporte de prompts negativos (`negative_prompt`) para excluir elementos no deseados de la imagen.
- Control de la generacion mediante `guidance_scale`, `num_inference_steps`, resolucion (`width`, `height`) y semilla (`generator`).
- Integracion con el pipeline `AutoPipelineForText2Image` de la libreria diffusers.
- No se documentan capacidades de edicion de imagen, inpainting, outpainting, control de pose ni condicionamiento estructural.

## Casos de uso

- Exploracion de limites de censura en investigacion: el adaptador permite a investigadores estudiar como responden los modelos de difusion a prompts que el modelo base rechaza o filtra, comparando la salida con y sin el LoRA cargado.
- Generacion de contenido artistico para adultos: estudios de ilustracion y creadores de contenido para publico adulto pueden emplear el adaptador para generar imagenes con desnudos o contenido sensual dentro de un marco legal y de consentimiento.
- Pruebas de robustez de filtros de seguridad: equipos que desarrollan clasificadores de contenido NSFW pueden usar este LoRA para generar muestras positivas y evaluar la precision de sus sistemas de moderacion.
- Prototipado rapido de conceptos visuales: al cargarse sobre FLUX.1-dev, permite iterar sobre ideas visuales con la calidad del modelo base y la libertad creativa del adaptador, por ejemplo en fotografia de moda o retrato.
- Benchmarking de adaptadores LoRA: sirve como caso de estudio para comparar la fidelidad de distintos LoRAs sobre FLUX.1-dev en terminos de calidad de imagen, coherencia con el prompt y degradacion del modelo base.
- Educacion sobre licencias y etica de IA: permite ilustrar en talleres y cursos las implicaciones de la licencia CreativeML OpenRAIL-M y los riesgos de publicar adaptadores sin documentacion tecnica ni evaluacion de sesgos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA en si ocupa 0,7 GB, pero requiere cargar FLUX.1-dev completo. En float16 el modelo base necesita aproximadamente 24 GB de VRAM; en cuantizacion de 8 bits, alrededor de 12-16 GB; en 4 bits, alrededor de 8-10 GB.
- GPU recomendadas: NVIDIA A100 (40 GB u 80 GB), H100, RTX 4090 (24 GB) para float16; RTX 3090 (24 GB) tambien es viable en float16 con margen ajustado.
- Cabe en GPU de consumo: si, en RTX 4090 y RTX 3090 en float16; en GPUs con 12-16 GB es necesario recurrir a cuantizacion o a offloading a CPU.
- Opciones de despliegue: diffusers con PEFT (metodo documentado en la model card), ComfyUI con nodos LoRA, Automatic1111/Forge con soporte FLUX, y vLLM no aplica (es un modelo de difusion, no un LLM). llama.cpp y Ollama no son compatibles con FLUX.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. El ejemplo de la model card usa 28 pasos de inferencia a 1024x1024, lo que en una RTX 4090 suele situarse en el orden de decenas de segundos por imagen, pero no se aporta una medicion oficial.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Flux-NSFW-uncensored (Jakes09) | LoRA sobre FLUX.1-dev | no disponible (adaptador) | no aplica | creativeml-openrail-m | HuggingFace, 0 descargas |
| FLUX.1-dev (Black Forest Labs) | Transformer de difusion | 12 000 M | no aplica | FLUX.1-dev Non-Commercial License | HuggingFace, ampliamente usado |
| FLUX.1-schnell (Black Forest Labs) | Transformer de difusion destilado | 12 000 M | no aplica | Apache 2.0 | HuggingFace |
| Stable Diffusion XL (Stability AI) | UNet de difusion | 2600 M (base) + 6600 M (refiner) | no aplica | CreativeML OpenRAIL++-M | HuggingFace, muy extendido |

La comparativa es limitada porque el modelo analizado es un adaptador y no un modelo autonomo. Frente a FLUX.1-dev, la diferencia principal es la licencia: el modelo base es de uso no comercial, mientras que el adaptador declara CreativeML OpenRAIL-M, lo que genera una ambiguedad legal relevante (ver limitaciones). Frente a Stable Diffusion XL, FLUX.1-dev ofrece mayor calidad y adherencia al prompt, pero con un coste computacional muy superior.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta disenado para generar material NSFW, lo que conlleva riesgos legales y eticos segun la jurisdiccion y el uso. Requiere verificacion de edad y consentimiento en cualquier despliegue publico.
- Ambiguedad de licencia: el adaptador declara CreativeML OpenRAIL-M, pero el modelo base FLUX.1-dev tiene una licencia no comercial. Cargar el LoRA sobre FLUX.1-dev no elimina las restricciones del modelo base, por lo que el uso comercial es juridicamente dudoso.
- Sin documentacion tecnica: no se especifican el dataset de entrenamiento, el rango del LoRA, los hiperparametros ni el proceso de evaluacion, lo que impide reproducir o auditar el modelo.
- Riesgo de sesgos: al no documentarse el dataset, no es posible evaluar sesgos de genero, etnia, edad o cuerpo. Es probable que el adaptador herede y amplifique los sesgos de FLUX.1-dev y de los datos NSFW empleados.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, manos deformes, texto ilegible o inconsistencias con el prompt, especialmente en contenido explicito.
- Idioma: solo se declara soporte de ingles; los prompts en castellano pueden degradar la calidad de la generacion.
- Sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni discusiones que permitan evaluar su calidad real.
- Fecha de creacion anomala: la fecha indicada (2026-11-04) es futura respecto a la mayoria de referencias del ecosistema, lo que sugiere un posible error de metadatos o una publicacion muy reciente no contrastada.
- Sin garantias de produccion: no se recomienda su uso en pipelines de produccion sin una evaluacion de calidad, seguridad y cumplimiento legal previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Jakes09/Flux-NSFW-uncensored
- Modelo base FLUX.1-dev: https://huggingface.co/black-forest-labs/FLUX.1-dev
- Repositorio diffusers: https://github.com/huggingface/diffusers
- Libreria PEFT: https://github.com/huggingface/peft
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Pagina de Black Forest Labs: https://blackforestlabs.ai
