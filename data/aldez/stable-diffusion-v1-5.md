# Aldez/stable-diffusion-v1-5

## Resumen

Stable Diffusion v1-5 es un modelo de difusion latente (Latent Diffusion Model, LDM) para generacion de imagenes a partir de texto, publicado originalmente por Robin Rombach y Patrick Esser (CompVis/LMU Munich, con apoyo de Stability AI y RunwayML). El repositorio `Aldez/stable-diffusion-v1-5` es un espejo no oficial del repositorio ya deprecado `runwayml/stable-diffusion-v1-5`; el propio autor de la model card aclara que no existe vinculacion alguna con RunwayML. El checkpoint aqui alojado cuenta con 859.520.964 parametros registrados en safetensors y un repositorio de 47,3 GB, que incluye varias variantes de pesos.

El modelo resuelve la tarea de sintesis de imagenes fotorrealistas y estilizadas a 512x512 pixeles condicionada por un prompt textual. Se inicializo desde los pesos de Stable Diffusion v1-2 y se ajusto finamente durante 595.000 pasos a resolucion 512x512 sobre el subconjunto "laion-aesthetics v2 5+", aplicando un 10 % de dropout del condicionamiento de texto para mejorar el muestreo con classifier-free guidance. La relevancia actual de este checkpoint es la de servir como linea base historica y como modelo ligero de referencia en el ecosistema diffusers, ampliamente compatible con ComfyUI, Automatic1111, SD.Next e InvokeAI.

El pipeline declarado es text-to-image, la licencia es CreativeML OpenRAIL-M y el unico idioma declarado en la model card original es el ingles. Aunque las busquedas web realizadas no han devuelto ningun resultado pertinente sobre este modelo, la informacion tecnica disponible en el repositorio y en la documentacion asociada es suficiente para caracterizarlo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Latent Diffusion Model (LDM): U-Net de difusion + autoencoder VAE + text encoder congelado CLIP ViT-L/14 |
| Parametros totales | 859.520.964 (recuento real de los pesos safetensors publicados) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de lenguaje; la condicion de texto se procesa con CLIP ViT-L/14, limitado a 77 tokens de prompt |
| Tipos de cuantizacion | No especificados en el repositorio. Se distribuyen pesos safetensors en fp16/fp32, en variantes `v1-5-pruned-emaonly` (solo EMA, menor uso de VRAM, apta para inferencia) y `v1-5-pruned` (EMA + no-EMA, mayor uso de VRAM, apta para fine-tuning) |
| Idiomas soportados | Ingles (segun la model card original). Metadatos de HuggingFace: no disponibles |
| Licencia | creativeml-openrail-m (CreativeML OpenRAIL-M) |
| Formato de pesos | safetensors (libreria diffusers); en el ecosistema circulan tambien variantes .ckpt |
| Resolucion nativa de entrenamiento | 512x512 |
| Pipeline declarado | text-to-image |
| Tamano del repositorio | 47,3 GB |

## Arquitectura y entrenamiento

El modelo sigue la formulacion de difusion latente descrita en el paper de High-Resolution Image Synthesis With Latent Diffusion Models (Rombach et al., CVPR 2022). En lugar de aplicar el proceso de difusion directamente sobre pixeles, un autoencoder VAE comprime la imagen a un espacio latente de menor dimensionalidad y el U-Net aprende a eliminar ruido en ese espacio, lo que reduce de forma notable el coste computacional del entrenamiento y de la inferencia. El condicionamiento textual se incorpora mediante un text encoder CLIP ViT-L/14 congelado, siguiendo el planteamiento del paper de Imagen, y se inyecta en el U-Net a traves de mecanismos de cross-attention.

El entrenamiento partio de los pesos de Stable Diffusion v1-2 y consistio en un fine-tuning de 595.000 pasos a 512x512 sobre el subconjunto de LAION con mayor puntuacion estetica ("laion-aesthetics v2 5+"). Durante ese ajuste se aplico un 10 % de dropout sobre el condicionamiento de texto, tecnica que habilita y mejora el muestreo con classifier-free guidance (paper arXiv:2207.12598). No se documenta en la model card el uso de RLHF ni de DPO, algo coherente con un modelo de difusion para imagen de esta generacion; tampoco se detalla la composicion exacta del dataset mas alla del subconjunto de LAION empleado.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) a 512x512 pixeles, con estilos fotorrealistas, ilustracion, pintura digital y otros.
- Modificacion de imagenes: al ser un pipeline de difusion latente, sirve como base para tareas derivadas como img2img, inpainting y outpainting mediante los pipelines correspondientes de diffusers.
- Condicionamiento fino del resultado mediante prompt positivo y negativo (classifier-free guidance), ajustando la escala de guia para controlar la fidelidad al texto.
- Integracion con pipelines programaticos de diffusers (`StableDiffusionPipeline`), incluido el uso con `torch_dtype=torch.float16` y ejecucion en CUDA.
- Compatibilidad con interfaces de usuario de terceros: ComfyUI, AUTOMATIC1111, SD.Next e InvokeAI, entre otras, ademas del repositorio de RunwayML, hoy deprecado.
- No dispone de soporte de tool calling, function calling ni de razonamiento multi-paso: es un modelo generativo de imagen, no un modelo de lenguaje.
- Capacidad multilingue limitada: el text encoder CLIP ViT-L/14 fue entrenado principalmente en ingles, por lo que los prompts en otros idiomas rinden peor.
- No incluye modo de razonamiento explicito (thinking), ni entrada/salida de audio, ni capacidades de vision para comprension de imagenes.

## Casos de uso

- Generacion de ilustraciones para prototipado de producto: el modelo permite crear bocetos visuales de interfaces, iconografia o material grafico a 512x512 en segundos, lo que agiliza las fases tempranas de diseno sin depender de un ilustrador externo.
- Creacion de assets para videojuegos y escenarios: dado su tamano reducido, puede desplegarse en local para generar variaciones de texturas, fondos o conceptos de personajes de forma masiva, con el pipeline de diffusers automatizado por lotes.
- Investigacion sobre sesgos y seguridad en modelos generativos: la model card incluye explicitamente entre los usos previstos el "safe deployment" y el analisis de limitaciones y sesgos, por lo que es un banco de pruebas habitual en estudios academicos sobre generacion de contenido nocivo y mitigaciones.
- Herramientas educativas y creativas: integrado en aplicaciones de ensenanza de arte digital o de composicion visual, permite a los estudiantes explorar la relacion entre descripcion textual y resultado grafico, con coste de computo bajo.
- Generacion de material grafico para marketing: produccion de variaciones de una misma idea visual (paletas, composiciones, encuadres) para campanas, usando prompt negativo y distintas semillas para explorar el espacio de resultados.
- Base para fine-tuning especializado: al tratarse del checkpoint v1-5 clasico, es el punto de partida habitual de LoRA, DreamBooth y textual inversion para adaptar el modelo a un estilo o a un sujeto concreto con recursos modestos.
- Preprocesado de datos sinteticos: generacion de imagenes etiquetadas para aumentar datasets de entrenamiento en tareas de vision por computador, siempre que la licencia y el sesgo del contenido generado se evaluen antes de su uso.
- Automatizacion de pipelines de imagen por lotes: al ser compatible con diffusers y con interfaces como ComfyUI, puede integrarse en flujos automatizados que generen cientos de imagenes a partir de una plantilla de prompt parametrizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye tablas comparativas de metricas como FID, CLIP score, MMLU o HumanEval (estas dos ultimas no aplican a un modelo de generacion de imagen), y la busqueda web realizada no ha devuelto ningun resultado pertinente con evaluaciones cuantitativas de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 4 GB con pesos fp16 para el pipeline completo en 512x512; puede reducirse por debajo de 4 GB con tecnicas de atencion eficiente (xformers, attention slicing) y con la variante `v1-5-pruned-emaonly`, que es la recomendada para inferencia al pesar menos que la variante con pesos EMA y no-EMA. Estas cifras son estimaciones del ecosistema diffusers, no datos publicados en el repositorio.
- GPU recomendadas: tarjetas consumer de gama media y alta (RTX 3060 12 GB, RTX 4060 Ti, RTX 4070, RTX 4080, RTX 4090) ejecutan el modelo con holgura; GPU de centro de datos como A100, H100 o L40S permiten procesamiento por lotes y despliegues concurrentes.
- Compatibilidad con GPU consumer: si, cabe en practicamente cualquier GPU con 4-6 GB de VRAM o mas, incluidas GTX 1660/RTX 2060 en adelante, y en Apple Silicon mediante el backend MPS. La ejecucion en CPU es posible pero notablemente mas lenta.
- Opciones de despliegue: diffusers (referencia oficial), ComfyUI, AUTOMATIC1111, SD.Next, InvokeAI, ONNX Runtime y `stable-diffusion.cpp` para entornos ligeros. El repositorio esta marcado como compatible con endpoints gestionados (`endpoints_compatible`).
- Latencia y throughput: no se publican cifras en la informacion disponible. Como referencia orientativa del ecosistema, una imagen a 512x512 con 20-30 pasos de muestreo suele completarse en el orden de uno a pocos segundos en GPU consumer moderna, pero este dato no procede de documentacion oficial del modelo.

## Comparativa con modelos similares

Las cifras de los modelos alternativos son aproximadas y proceden del conocimiento general del ecosistema, no de la informacion proporcionada en esta ficha.

| Modelo | Parametros (U-Net) | Resolucion nativa | Text encoder | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Stable Diffusion v1-5 (este repositorio) | 859.520.964 (recuento safetensors publicado) | 512x512 | CLIP ViT-L/14 | CreativeML OpenRAIL-M | Abierta, safetensors via diffusers |
| Stable Diffusion v1-4 | del orden de 860 M (no confirmado en la informacion disponible) | 512x512 | CLIP ViT-L/14 | CreativeML OpenRAIL-M | Abierta, version previa a v1-5 |
| Stable Diffusion v2-1 | del orden de 865 M (no confirmado en la informacion disponible) | 768x768 | OpenCLIP ViT-H/14 | CreativeML OpenRAIL++-M | Abierta, safetensors via diffusers |
| Stable Diffusion XL 1.0 | del orden de 2.600 M en el U-Net, mas un segundo text encoder | 1024x1024 | CLIP ViT-L + OpenCLIP ViT-bigG | CreativeML OpenRAIL++-M | Abierta, safetensors via diffusers |

Comparacion cualitativa: v1-5 es el checkpoint mas ligero y con mayor soporte de herramientas de terceros y de fine-tunings de la comunidad. v2-1 mejora la resolucion nativa y el encoder de texto, a costa de compatibilidad parcial con los LoRA entrenados para la familia v1. SDXL ofrece mayor calidad y resolucion, pero exige bastante mas VRAM y no cabe con comodidad en GPU de 4 GB. No se dispone de datos de benchmarks publicados en la informacion proporcionada que permitan comparar el rendimiento cuantitativo entre estas variantes.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entreno sobre subconjuntos de LAION, un dataset web sin curacion exhaustiva, por lo que reproduce y amplifica estereotipos sociales, de genero, etnicos y culturales presentes en los datos. La propia model card advierte de que no debe usarse para generar contenido que propague estereotipos historicos o actuales.
- Riesgo de alucinacion visual: el modelo no representa hechos ni personas reales de forma fiable. La model card indica explicitamente que fue entrenado para representar personas o eventos de manera factual, por lo que generar ese tipo de contenido queda fuera de su alcance.
- Limitaciones de contexto e idioma: el prompt se procesa con CLIP ViT-L/14, limitado a 77 tokens, lo que restringe la complejidad de las instrucciones textuales. El rendimiento optimo esta documentado para ingles; en castellano los resultados son menos predecibles.
- Restricciones de licencia: CreativeML OpenRAIL-M permite uso comercial, pero impone restricciones de uso responsable (prohibicion de generar contenido ilegal, danino, de desinformacion o de vigilancia abusiva, entre otros) que se propagan a los derivados y deben respetarse. El texto completo de la licencia esta enlazado en la model card.
- Estado del repositorio: se trata de un espejo no oficial de un repositorio deprecado, creado por el usuario `Aldez`, con cero descargas y cero likes en el momento de la consulta y sin vinculacion con RunwayML ni con Stability AI. Para produccion conviene usar la fuente canonica `sd-legacy/stable-diffusion-v1-5`.
- Dependencia del repositorio original deprecado: el repositorio de GitHub de RunwayML para ejecutar el modelo esta marcado como deprecado en la propia model card; las rutas de despliegue recomendadas son diffusers, ComfyUI, Automatic1111, SD.Next e InvokeAI.
- Idiomas no declarados en los metadatos de HuggingFace: el campo de idiomas figura como no disponible, aunque la model card original indica ingles.
- Uso previsto: la model card restringe el uso directo a fines de investigacion (despliegue seguro, analisis de sesgos, generacion artistica, herramientas educativas y estudio de modelos generativos); cualquier uso productivo debe evaluarse frente a esa declaracion.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/Aldez/stable-diffusion-v1-5
- Repositorio canonico de referencia: https://huggingface.co/sd-legacy/stable-diffusion-v1-5
- Paper de Latent Diffusion Models: https://arxiv.org/abs/2112.10752
- Paper de classifier-free guidance: https://arxiv.org/abs/2207.12598
- Paper de CLIP: https://arxiv.org/abs/2103.00020
- Paper de Imagen: https://arxiv.org/abs/2205.11487
- Paper de evaluacion de modelos generativos de imagen: https://arxiv.org/abs/1910.09700
- Repositorio de CompVis: https://github.com/CompVis/stable-diffusion
- Repositorio de RunwayML (deprecado): https://github.com/runwayml/stable-diffusion
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Blog de Stable Diffusion en HuggingFace: https://huggingface.co/blog/stable_diffusion
- Pesos `v1-5-pruned-emaonly.safetensors`: https://huggingface.co/sd-legacy/stable-diffusion-v1-5/resolve/main/v1-5-pruned-emaonly.safetensors
- Pesos `v1-5-pruned.safetensors`: https://huggingface.co/sd-legacy/stable-diffusion-v1-5/resolve/main/v1-5-pruned.safetensors
- Nota: la busqueda web realizada no ha devuelto ningun resultado relevante sobre este modelo; los enlaces anteriores proceden de la model card y de los identificadores arXiv referenciados en el repositorio.
