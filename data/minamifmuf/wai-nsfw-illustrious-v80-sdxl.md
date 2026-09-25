# MinamiFmuf/wai-nsfw-illustrious-v80-sdxl

## Resumen

wai-nsfw-illustrious-v80-sdxl es un modelo de difusion latente para generacion de imagenes a partir de texto (text-to-image) publicado por el usuario MinamiFmuf en HuggingFace. Se trata de un ajuste fino del modelo base OnomaAIResearch/Illustrious-xl-early-release-v0, que pertenece a la familia Stable Diffusion XL (SDXL). El repositorio contiene pesos en formato safetensors compatibles con la libreria diffusers y el pipeline StableDiffusionXLPipeline, con 2.567.463.684 parametros y un tamano de repositorio de 6,9 GB.

Segun la model card, el modelo original procede de Civitai (wai-nsfw-illustrious-sdxl) y fue creado por el usuario WAI0731. La finalidad declarada es la generacion de ilustracion de estilo anime, con una orientacion explicita a contenido para adultos, tal y como reflejan sus etiquetas (not-for-all-audiences, hentai, nsfw). El unico idioma declarado es el ingles.

Su relevancia practica es muy de nicho: es un checkpoint mas dentro del ecosistema de finetunes de Illustrious/SDXL. En el momento de redactar esta ficha el repositorio registra 0 descargas y 0 likes, no incluye documentacion tecnica del proceso de entrenamiento y no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion latente, familia SDXL (etiquetas stable-diffusion-xl y pipeline StableDiffusionXLPipeline); el detalle de la U-Net no se especifica en la model card |
| Parametros totales | 2.567.463.684 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de difusion texto-a-imagen; no aplica la nocion de ventana de contexto de un LLM) |
| Tipos de cuantizacion | no disponible en este repositorio; en Civitai se distribuye una variante descrita como "half precision (pruned)" de 6,46 GB |
| Idiomas soportados | en (ingles) |
| Licencia | faipl-1.0-sd (campo license: other, license_name: faipl-1.0-sd) |
| Formato de pesos | safetensors (compatible con diffusers) |
| Pipeline | text-to-image |
| Modelo base | OnomaAIResearch/Illustrious-xl-early-release-v0 |
| Tamano del repositorio | 6,9 GB |
| Fecha de creacion | 2026-09-25 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna especifica, el dataset de entrenamiento, el numero de imagenes o pasos utilizados, ni sobre el procedimiento de ajuste aplicado sobre el modelo base. La model card unicamente indica que se trata de un finetune de OnomaAIResearch/Illustrious-xl-early-release-v0 y remite al modelo original alojado en Civitai.

Dado que las etiquetas y el pipeline declarado corresponden a Stable Diffusion XL, la arquitectura heredada es la de difusion latente de SDXL, con un componente de generacion de imagen (U-Net) y el esquema de condicionamiento por texto propio de esta familia. Cualquier detalle adicional (resolucion de entrenamiento, tecnicas de regularizacion, uso de LoRA o merges) no esta disponible en la informacion proporcionada.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) en estilo anime.
- Generacion orientada a contenido para adultos, segun las etiquetas declaradas (nsfw, hentai, not-for-all-audiences).
- Acepta prompts en ingles; no hay soporte multilingue declarado.
- Las listas de terceros para la familia WAI-illustrious-SDXL describen cuatro etiquetas de clasificacion por contenido (general, sensitive, nsfw, explicit) y recomiendan anadir terminos de filtrado en el prompt negativo para evitar contenido no deseado; esta informacion proviene de una ficha de terceros, no de la model card del repositorio.
- No hay soporte declarado de tool calling, function calling, razonamiento multi-paso ni capacidades de agente: no son funciones aplicables a un modelo de difusion de imagen.
- No se documentan capacidades de vision, audio, video ni edicion de imagen.

## Casos de uso

- Ilustracion de personajes de estilo anime: el modelo puede generar retratos y figuras completas a partir de descripciones textuales, aprovechando que es un finetune especializado de la familia Illustrious/SDXL.
- Creacion de arte conceptual para proyectos de ficcion: util para explorar variaciones de diseno de personajes y entornos antes de encargar arte final.
- Ilustracion para publicaciones de contenido para adultos: su orientacion explicita a NSFW lo hace adecuado para plataformas que distribuyen este tipo de material y que dispongan de la verificacion de edad y los controles legales correspondientes.
- Generacion de avatares y material grafico para comunidades de nicho: produccion de imagenes de perfil o portadas con una estetica anime consistente.
- Prototipado de assets para videojuegos o novelas visuales: generacion rapida de bocetos y variaciones de personajes que despues se retocan en un flujo de trabajo artistico.
- Experimentacion con tecnicas de finetune y LoRA sobre SDXL: el checkpoint puede servir como base intermedia para quienes investigan merges y ajustes dentro del ecosistema Illustrious.
- Filtrado de contenido mediante prompt negativo: segun las guias de terceros de la familia WAI, el modelo responde a etiquetas de rating y permite desplazar la generacion hacia contenido seguro anadiendo terminos negativos, lo que facilita su uso en entornos con politicas de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia general de la clase SDXL, un checkpoint de esta familia en precision de 16 bits suele requerir del orden de 8 a 12 GB de VRAM para generar a 1024x1024, y puede reducirse con cuantizacion u offloading; estos valores son estimaciones orientativas y no datos verificados para este modelo.
- GPU recomendadas: no disponible. Por clase de modelo, resultan adecuadas GPU de consumo con 12 GB o mas de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4080, RTX 4090) y GPU de centro de datos como A100 o H100 para servir multiples peticiones en paralelo.
- Compatibilidad con GPU de consumo: probable en GPU con 12 GB o mas de VRAM segun la estimacion anterior; no confirmado por el autor.
- Opciones de despliegue: diffusers (pipeline StableDiffusionXLPipeline), asi como interfaces graficas del ecosistema de difusion que importan checkpoints safetensors. No aplican herramientas de servido de LLM como vLLM, TGI, llama.cpp u Ollama, que no estan disenadas para modelos de difusion de imagen.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wai-nsfw-illustrious-v80-sdxl (este modelo) | 2.567.463.684 | no aplica | sin benchmarks publicados | faipl-1.0-sd | HuggingFace, 0 descargas |
| OnomaAIResearch/Illustrious-xl-early-release-v0 (modelo base) | no disponible | no aplica | no disponible | no disponible | HuggingFace |
| stablediffusionapi/wai-nsfw-illustrious-sdxl | no disponible | no aplica | no disponible | no disponible | HuggingFace |
| wai-nsfw-illustrious-sdxl (Civitai, creado por WAI0731) | no disponible | no aplica | no disponible | no disponible | Civitai, con versiones distribuidas (por ejemplo v17.0) |

No se dispone de datos comparativos de rendimiento entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como not-for-all-audiences y orientado a material NSFW; su uso requiere verificar la legislacion aplicable, la edad de los usuarios y las politicas de la plataforma de destino.
- Licencia restrictiva: la licencia es faipl-1.0-sd (campo license: other). Debe revisarse el texto completo en el enlace indicado antes de cualquier uso comercial o redistribucion; no se garantiza que permita uso comercial.
- Falta de documentacion: no hay informacion sobre dataset de entrenamiento, composicion de datos ni procedimiento de ajuste, lo que impide evaluar sesgos de origen y calidad de forma rigurosa.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, manos deformes, artefactos y composiciones incoherentes con el prompt; no existe validacion automatica de la fidelidad de la imagen.
- Sesgos potenciales: al ser un finetune de un modelo de ilustracion anime, es probable que reproduzca sesgos estilisticos y de representacion del modelo base y de sus datos de ajuste; estos sesgos no estan cuantificados.
- Limitacion de idioma: solo se declara soporte de ingles, por lo que los prompts en otros idiomas pueden degradar la calidad del resultado.
- Ambiguedad de version: el identificador del repositorio incluye "v80", pero la model card no documenta el significado de esa version ni su correspondencia con las versiones publicadas en Civitai (por ejemplo v17.0), lo que dificulta la trazabilidad.
- Fiabilidad del repositorio: 0 descargas y 0 likes, sin historial de uso ni validacion por parte de la comunidad; no se recomienda su adopcion en produccion sin una evaluacion propia.
- Disponibilidad de cuantizaciones: no se documentan formatos cuantizados en este repositorio; solo se menciona safetensors.

## Enlaces

- HuggingFace: https://huggingface.co/MinamiFmuf/wai-nsfw-illustrious-v80-sdxl
- Modelo original en Civitai: https://civitai.com/models/827184/wai-nsfw-illustrious-sdxl?modelVersionId=1183765
- Perfil del autor original en Civitai (WAI0731): https://civitai.com/user/WAI0731
- Licencia faipl-1.0-sd: https://freedevproject.org/faipl-1.0-sd/
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
- Referencia de terceros (BetterWaifu): https://betterwaifu.com/models/827184
- Referencia de terceros (PixAI): https://pixai.art/en/model/1921546733793563398
- Referencia de terceros (Yodayo): https://yodayo.com/models/5ecbf952-6a89-4b42-bd52-54802ee55eba
- Repositorio espejo en HuggingFace (stablediffusionapi): https://huggingface.co/stablediffusionapi/wai-nsfw-illustrious-sdxl
- Ficha en Civitai.red: https://civitai.red/models/827184/wai-illustrious-sdxl
