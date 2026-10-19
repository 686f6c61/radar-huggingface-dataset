# Nekodeus/neko-alpha7-chris-evans

## Resumen

`Nekodeus/neko-alpha7-chris-evans` es un LoRA de personaje para Stable Diffusion 1.5, publicado por el usuario Nekodeus dentro del conjunto "Hollywood Alpha SD1.5" (alpha1–alpha10) y del pack `Nekodeus/neko-hollywood-alpha-sd15-v1`. No es un modelo generativo completo: es un adaptador de bajo rango que se carga sobre un checkpoint SD1.5 existente para inducir la representacion de un rostro concreto (etiquetado como "Chris Evans") en un pipeline de text-to-image. Su funcion es, por tanto, especializar un modelo base de 512 px en la generacion de retratos y figuras coherentes con esa identidad visual.

El adaptador se entreno con kohya_ss sd-scripts sobre aproximadamente 97 imagenes filtradas, a 512 px, durante 1500 pasos, con rango y alpha de 8, learning rate 1e-4, Adam de 8 bits y xformers. Se activa mediante la frase disparadora `a photo of alpha7 person` y esta pensado para usarse con pesos de 0.8 a 1.0 en A1111, Forge, ComfyUI o diffusers. Su relevancia es acotada: es una pieza de un conjunto de LoRAs de personaje, no un modelo con capacidades generales de lenguaje, razonamiento o codigo.

El repositorio figura con 0 descargas y 0 likes y un tamano de 0.0 GB (valor redondeado), y la licencia declarada es "other", sin texto de licencia visible en la model card. Esto implica que las condiciones de uso comercial no estan explicitadas por el autor y deben negociarse o asumirse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre UNet de Stable Diffusion 1.5; entrenado con kohya_ss sd-scripts |
| Parametros totales | No disponible (el LoRA tiene dim/alpha 8; el modelo base SD1.5 tiene ~860 M en el UNet y ~123 M en el text encoder CLIP ViT-L/14) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto de lenguaje; el text encoder CLIP de SD1.5 admite 77 tokens por prompt |
| Tipos de cuantizacion | No disponible en la model card; el adaptador es compatible con los pesos fp16/fp32 del pipeline SD1.5 y con cuantizaciones del modelo base (fp16, bf16) segun el runtime |
| Idiomas soportados | No disponible; los prompts se procesan con el text encoder CLIP de SD1.5, con mejor rendimiento empirico en ingles |
| Licencia | other (sin texto de licencia publicado en la model card) |
| Formato de pesos | No especificado; libreria declarada `peft`, compatible con el formato de adaptadores LoRA habitual en diffusers/A1111 (safetensors) |

## Arquitectura y entrenamiento

Se trata de un LoRA de rango 8 (dim y alpha 8) que inyecta matrices de bajo rango en las capas del UNet de Stable Diffusion 1.5, manteniendo congelados los pesos del modelo base. El entrenamiento se realizo con kohya_ss sd-scripts a resolucion de 512 px, 1500 pasos, learning rate 1e-4, optimizador Adam de 8 bits y xformers como atencion eficiente. El dataset consistio en aproximadamente 97 imagenes filtradas del sujeto, un volumen bajo que condiciona tanto la fidelidad de la identidad como el riesgo de sobreajuste a las poses, iluminaciones y fondos presentes en esas imagenes.

No se documentan en la model card el numero de tokens vistos, la composicion del dataset, el uso de regularizacion por clase, ni etapas de RLHF/DPO (no aplicables a un modelo de difusion de este tipo). Tampoco se indica si el entrenamiento cubre solo el UNet o tambien el text encoder, ni cuantas repeticiones por imagen se configuraron. La innovacion tecnica es inexistente por diseno: es un adaptador de personaje convencional, y su unico elemento diferencial es la frase disparadora y su pertenencia a un set coordinado de diez LoRAs con hiperparametros homogeneos.

## Capacidades

- Generacion text-to-image de retratos y figuras humanas con la identidad visual aprendida, activada por la frase `a photo of alpha7 person`.
- Control de intensidad del efecto mediante el peso del LoRA, recomendado en el rango 0.8–1.0; valores menores diluyen el parecido y valores superiores tienden a quemar la imagen.
- Composicion mediante prompt: se pueden pedir escenarios, vestuario, pose o iluminacion, como en los ejemplos de la model card (`in a suit, confident pose`, `portrait, clean background`).
- Integracion en pipelines img2img, inpainting y outpainting soportados por SD1.5, al ser un adaptador del UNet.
- Compatibilidad con ControlNet, IP-Adapter, upscalers y otros nodos de un pipeline SD1.5, ya que no modifica la interfaz del modelo base.
- No dispone de generacion de texto, razonamiento, codigo, matematicas, tool calling, capacidades de agente ni procesamiento de audio o video.
- No es multilingue en el sentido linguistico: hereda el vocabulario y los sesgos del text encoder CLIP de SD1.5, dependiente de prompts en ingles.

## Casos de uso

- Generacion de retratos de personaje para prototipado visual: con prompts del tipo `a photo of alpha7 person, portrait, clean background` se obtienen variaciones rapidas de un mismo rostro para explorar direccion de arte antes de producir con un pipeline mas caro.
- Construccion de storyboards y comic digital: combinando el LoRA con distintos escenarios y poses en el prompt se mantiene la coherencia del personaje entre vinetas, algo que un modelo base sin adaptador no garantiza.
- Ilustracion para ficcion y contenido derivado: util para proyectos de fan art o maquetas internas donde se necesita consistencia de personaje a lo largo de varias imagenes.
- Integracion en herramientas creativas propias: al cargarse como adaptador `peft` en diffusers, puede incorporarse a un backend de generacion de imagenes con seleccion dinamica de LoRA por peticion.
- Experimentacion en investigacion sobre LoRAs de identidad: su configuracion documentada (1500 pasos, rango 8, ~97 imagenes) sirve como punto de referencia reproducible para estudiar el equilibrio entre fidelidad y sobreajuste con datasets pequenos.
- Pruebas de concepto de inpainting y edicion: sustituir un rostro o completar una region de una imagen existente con el personaje, usando el adaptador sobre SD1.5 en A1111 o ComfyUI.
- Comparativa de sets de personajes: al formar parte del set Hollywood Alpha, permite evaluar de forma homogenea como se comporta un mismo esquema de entrenamiento con distintas identidades.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, similitud facial, ni comparaciones cuantitativas con otros LoRAs. Tampoco hay metricas de velocidad de inferencia medidas por el autor.

## Requisitos de hardware

- VRAM estimada: al ser un adaptador sobre SD1.5 a 512 px, la inferencia en fp16 requiere aproximadamente 4–6 GB de VRAM; con batch superior a 1, ControlNet o resoluciones mayores conviene disponer de 8–12 GB.
- El propio LoRA anade un coste despreciable de memoria y computo (rango 8); el requisito real lo marca el checkpoint SD1.5 sobre el que se carga, no el adaptador.
- GPU consumer: cabe en GTX 1660 Super 6 GB, RTX 3060 12 GB, RTX 4060 Ti 8/16 GB, RTX 4070 y RTX 4090; en GPUs de 4 GB puede requerir fp16 con atencion eficiente o resoluciones reducidas.
- GPU de datacenter: A100, H100 o L40S son utiles solo para generacion por lotes a gran volumen o para servir varios pipelines concurrentes; estan sobredimensionadas para inferencia individual.
- Opciones de despliegue: AUTOMATIC1111 WebUI, Forge, ComfyUI, SD.Next, InvokeAI, y via `diffusers` + `peft` (`load_lora_weights`); tambien es posible convertirlo a otros formatos, aunque no se documenta en la model card.
- Latencia y throughput: no hay datos medidos por el autor. Como referencia orientativa del modelo base SD1.5 a 512 px y 20–30 pasos, cabe esperar del orden de 1–3 segundos por imagen en una RTX 4090 y de 5–10 segundos en una RTX 3060, sin que estas cifras hayan sido verificadas para este adaptador concreto.
- CPU y Apple Silicon: ejecutable via diffusers en MPS o CPU, con latencias mucho mayores (del orden de decenas de segundos a minutos por imagen en CPU).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Nekodeus/neko-alpha7-chris-evans` | LoRA de personaje sobre SD1.5 | Rango 8 (dim/alpha 8); base ~860 M UNet | 512 px; 77 tokens de prompt CLIP | other (sin texto) | HuggingFace, 0 descargas |
| Otros LoRAs del set Hollywood Alpha (alpha1–alpha10) | LoRA de personaje sobre SD1.5 | Mismo esquema (rango 8, 1500 pasos) | 512 px | other (sin texto) | Mismo pack `neko-hollywood-alpha-sd15-v1` |
| Stable Diffusion 1.5 base | Modelo de difusion completo | ~860 M UNet + ~123 M text encoder | 512 px; 77 tokens | CreativeML OpenRAIL-M (segun la distribucion del checkpoint base) | Ampliamente disponible |
| SDXL 1.0 + LoRA de personaje | Modelo de difusion + adaptador | ~2.6 B UNet + text encoders | 1024 px; 77 tokens por encoder | CreativeML OpenRAIL++-M (segun distribucion) | Ampliamente disponible |

La comparacion relevante es interna al set: los diez LoRAs comparten hiperparametros y volumen de datos, por lo que las diferencias de resultado dependen del dataset de cada identidad. Frente a SDXL, este adaptador ofrece menor resolucion nativa y menor calidad de detalle, a cambio de requisitos de VRAM y tiempos de inferencia mucho menores. No se dispone de datos de benchmarks que permitan comparar fidelidad de identidad entre estas opciones.

## Limitaciones y advertencias

- Volumen de entrenamiento muy bajo (~97 imagenes) y solo 1500 pasos: riesgo alto de sobreajuste a poses, encuadres, ropa y fondos del dataset, y de rigidez ante composiciones no vistas.
- Identidad de persona real: la model card etiqueta el sujeto como "Chris Evans". La generacion de imagenes de personas reales plantea problemas de derechos de imagen, publicidad y normativa de deepfakes; no debe usarse para suplantacion, contenido enganoso o material difamatorio.
- Licencia "other" sin texto visible: no hay autorizacion explicita de uso comercial. Ademas, el uso queda sujeto a la licencia del checkpoint SD1.5 sobre el que se cargue el adaptador, que puede anadir restricciones (por ejemplo, OpenRAIL-M con clausulas de uso).
- Riesgo de alucinacion visual: el modelo puede producir rasgos faciales inconsistentes, manos deformes, artefactos en ojos y texto ilegible, especialmente con pesos altos o prompts fuera de dominio.
- Dependencia del prompt en ingles: el text encoder CLIP de SD1.5 rinde peor con prompts en castellano u otros idiomas, lo que limita su uso directo en productos en espanol.
- Sin capacidades de lenguaje: no debe evaluarse como un modelo de chat, razonamiento o codigo; la ficha de HuggingFace lo clasifica como `text-to-image`.
- Sin garantias de reproducibilidad: no se documentan semilla, composicion exacta del dataset ni repeticiones, por lo que no es posible replicar el entrenamiento a partir de la model card.
- Metadatos pobres: 0 descargas, 0 likes y repositorio de 0.0 GB indican un artefacto recien publicado y sin validacion por parte de la comunidad; conviene inspeccionar los pesos antes de integrarlo en produccion.
- Fecha de publicacion en los metadatos (2026-10-18): conviene verificar su coherencia antes de citar el modelo en documentacion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Nekodeus/neko-alpha7-chris-evans
- Pack al que pertenece: https://huggingface.co/Nekodeus/neko-hollywood-alpha-sd15-v1
- Pagina de modelos de difusion en HuggingFace (resultado de busqueda, no especifico de este modelo): https://huggingface.co/models?other=diffusionners
- Pagina de terceros con un modelo "Chris Evans" en PixAI (no verificada como equivalente a este LoRA): https://pixai.art/en/model/1853297735282191743
- kohya_ss sd-scripts (herramienta de entrenamiento citada por el autor): no se ha proporcionado enlace en la informacion disponible
- Paper o blog tecnico del autor: no disponible
