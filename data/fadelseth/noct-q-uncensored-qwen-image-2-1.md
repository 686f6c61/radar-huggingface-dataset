# Fadelseth/Noct-Q-Uncensored-Qwen-Image-2.1

## Resumen

Noct Q (Noct-Q-Uncensored-Qwen-Image-2.1) es un modelo de generacion de imagen a partir de texto (text-to-image) publicado por el autor Fadelseth, derivado del modelo base Qwen/Qwen-Image-2.1 mediante la fusion y modificacion de los pesos del transformer. Se distribuye como un archivo unico de pesos en formato safetensors y esta pensado para ejecutarse en ComfyUI con nodos estandar. Su caracteristica principal es que prescinde de LoRA adicionales para generar contenido explicito: segun el autor, los desnudos y las escenas adultas se renderizan directamente a partir del prompt.

El modelo se ofrece en una unica variante de cuantizacion int8 (convrot) de 7,3 GB, orientada a tarjetas graficas de 8 a 12 GB de VRAM, y va acompanado de un archivo de workflow en JSON. Internamente depende de un codificador de texto Qwen3-VL de 8B (en version int8) y de un VAE bf16 especifico de Qwen Image 2.1, ambos distribuidos por separado en el repositorio Comfy-Org/Qwen-Image-2.1. La generacion recomendada es de 25 pasos con sampler euler y cfg 3, con soporte de prompt negativo.

Es relevante en el ecosistema porque ejemplifica una tendencia de la comunidad de difusion: tomar un modelo base de gran calidad (Qwen Image 2.1) y publicar fusiones orientadas a un caso de uso concreto (aqui, realismo y contenido sin censura) listas para consumir en ComfyUI. Conviene subrayar que se trata de un derivado con licencia Qwen Research, restringido a uso no comercial, y cuyo contenido es para adultos (etiquetado como NSFW y not-for-all-audiences).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (text-to-image) derivado de Qwen/Qwen-Image-2.1, con transformer modificado; detalles de la arquitectura no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de generacion de imagen; depende del codificador de texto Qwen3-VL 8B) |
| Tipos de cuantizacion | int8 (convrot) en el repositorio; el autor menciona variantes int4, fp8, bf16 y fp16 en Civitai |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (Qwen Research License Agreement); uso no comercial unicamente |
| Formato de pesos | safetensors (archivo unico, diffusion-single-file) |

## Arquitectura y entrenamiento

Noct Q es un derivado por fusion (base_model_relation: merge) de Qwen/Qwen-Image-2.1, con los pesos del transformer modificados y un fichero NOTICE asociado. La informacion proporcionada no detalla la arquitectura interna exacta del transformer de difusion, el numero de parametros, la composicion del dataset de entrenamiento, ni si se emplearon tecnicas de ajuste como RLHF o DPO. Tampoco se especifican los tokens de entrenamiento utilizados en la fusion.

Lo que si se documenta es la infraestructura de inferencia: el pipeline usa un codificador de texto Qwen3-VL de 8B en formato int8 (archivo qwen3vl_8b_int8_convrot.safetensors) y un VAE bf16 (qwen_image_2.1_vae_bf16.safetensors), ambos del repositorio Comfy-Org/Qwen-Image-2.1. El modelo se ejecuta con nodos nativos de ComfyUI 0.37 o superior. La configuracion recomendada es de 25 pasos, sampler euler, scheduler simple y cfg 3 con prompt negativo; con cfg 1 la generacion es aproximadamente el doble de rapida pero ignora el prompt negativo. La resolucion de trabajo sugerida es 1024x1536 en formato retrato. No se documentan innovaciones de atencion, decodificacion especulativa ni tecnicas de aceleracion adicionales.

## Capacidades

- Generacion de imagenes fotorrealistas a partir de texto, con enfasis declarado en escenas de cuerpo completo con distintas iluminaciones (luz de dia, flash, nocturna).
- Generacion de contenido con desnudos y escenas explicitas sin necesidad de LoRA adicionales; el autor afirma que la version V4 representa escenas con pareja aproximadamente tres veces mas a menudo que la V3.
- Renderizado de texto legible en carteles y etiquetas dentro de la imagen.
- Estilos de ilustracion: anime y pintura ilustrada.
- Comprension de prompts en prosa (formato de pie de foto: tipo de plano, sujeto adulto, accion, lugar, luz y encuadre) en lugar de listas de etiquetas; sin palabra de activacion (trigger word).
- Edicion de imagen con los mismos archivos, mediante la plantilla de edicion de Qwen Image 2.1 en ComfyUI.
- Soporte de prompt negativo cuando se usa cfg mayor que 1.

## Casos de uso

- Fotografia artistica de desnudo: el modelo genera figuras de cuerpo completo con control de iluminacion mediante prompts descriptivos, util para bocetos de direccion de arte o previsualizacion de sesiones fotograficas.
- Ilustracion editorial para publicaciones para adultos: permite producir imagenes explicitas coherentes con el texto sin entrenar LoRA, reduciendo el tiempo de prototipado.
- Edicion y retoque de imagenes dentro de ComfyUI: reutilizando la plantilla de edicion de Qwen Image 2.1, se pueden modificar imagenes existentes con el mismo archivo de modelo.
- Generacion de material de referencia para estudios de anatomia o dibujo artistico, dado el enfoque realista del modelo.
- Creacion de carteles o imagenes con texto integrado, ya que el modelo renderiza texto legible en senales y etiquetas.
- Prototipado rapido de conceptos visuales en produccion de videojuegos o comics para adultos, con iteracion rapida (cfg 1 para velocidad, cfg 3 para calidad).
- Ilustracion estilo anime o pintura para proyectos creativos, aprovechando que el modelo cubre tambien estilos no fotorrealistas.
- Despliegue en estaciones de trabajo de 8 a 12 GB de VRAM para artistas individuales, al distribuirse en un unico archivo int8 de 7,3 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye metricas objetivas (FID, CLIP score, etc.) ni comparaciones cuantitativas con otros modelos; solo referencias cualitativas sobre el comportamiento de las versiones V3 y V4.

## Requisitos de hardware

- VRAM estimada: la variante int8 convrot del transformer ocupa 7,3 GB; a ello se suma el codificador de texto Qwen3-VL 8B en int8 y el VAE bf16, parte de los cuales puede descargarse a memoria del sistema segun la gestion de ComfyUI. El autor indica tarjetas de 8 a 12 GB para el archivo int8.
- GPU recomendadas: tarjetas consumer de 8 a 12 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4070 Ti, RTX 4080); para lotes o mayor velocidad, GPUs de datacenter como A100 o H100.
- Compatibilidad con GPU consumer: si, segun el autor esta pensado para tarjetas de 8 a 12 GB usando la version int8 convrot.
- Opciones de despliegue: ComfyUI 0.37 o superior con nodos core; el modelo se coloca en models/diffusion_models, el text encoder en models/text_encoders y el VAE en models/vae. Se incluye un workflow (NoctQ_V4_workflow.json) para arrastrar directamente en ComfyUI. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de difusion de archivo unico.
- Latencia y throughput: no disponibles de forma cuantitativa. Se sabe que con cfg 1 la generacion es aproximadamente el doble de rapida que con cfg 3, a 25 pasos.

## Comparativa con modelos similares

No se dispone de datos verificados de benchmarks para establecer una comparativa cuantitativa. La siguiente tabla recoge unicamente los datos confirmados de la informacion proporcionada.

| Modelo | Relacion | Formato | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Noct Q V4 (este modelo) | Fusion de Qwen-Image-2.1 | safetensors (single-file) | int8 (convrot) | qwen-research, no comercial | HuggingFace y Civitai |
| Noct Q V3 | Version previa del mismo autor | safetensors (single-file) | int8 (convrot) | qwen-research, no comercial | HuggingFace y Civitai |
| Qwen/Qwen-Image-2.1 | Modelo base | no disponible | no disponible | Qwen (Research) | HuggingFace |
| Alternativas de la comunidad (SDXL, Flux y fusiones similares) | no disponible | no disponible | no disponible | no disponible | no disponible |

Datos como parametros, longitud de contexto y rendimiento de las alternativas se marcan como no disponibles al no figurar en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como NSFW y not-for-all-audiences; genera desnudos y escenas explicitas de forma directa, lo que exige control de acceso y cumplimiento de la normativa aplicable sobre contenido adulto.
- Licencia restringida: se distribuye bajo la Qwen Research License Agreement y el autor indica explicitamente que es solo para uso no comercial. Cualquier uso comercial requeriria revisar los terminos de dicha licencia.
- Derivado de un modelo base de terceros: al ser una fusion de Qwen/Qwen-Image-2.1 con pesos modificados, hereda las condiciones de licencia del modelo original.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomia incorrecta, manos deformes, texto ilegible en casos complejos o incoherencias entre prompt e imagen; no se documentan tasas de error.
- Idiomas: no se especifican los idiomas soportados; los ejemplos de prompt del autor estan en ingles y hay una nota tambien en chino. El comportamiento multilingue no esta verificado.
- Sin benchmarks: no hay metricas publicadas que permitan evaluar objetivamente la calidad frente a otras alternativas.
- Madurez del repositorio: el modelo figura con 0 descargas y 0 likes en el momento de la ficha, por lo que no existe validacion de la comunidad.
- Requisitos de software: necesita ComfyUI 0.37 o superior con nodos core; depende de archivos externos (text encoder y VAE) alojados en otro repositorio.
- Reproducibilidad: al ser una fusion con pesos modificados, los resultados pueden variar respecto al modelo base y no se documenta la metodologia exacta de la fusion.

## Enlaces

- HuggingFace: https://huggingface.co/Fadelseth/Noct-Q-Uncensored-Qwen-Image-2.1
- Galeria, prompts y variantes (int4, fp8, bf16, fp16) en Civitai: https://civitai.com/models/2958896
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Text encoder (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/text_encoders/qwen3vl_8b_int8_convrot.safetensors
- VAE (Comfy-Org): https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors
- Licencia referenciada por el autor: https://huggingface.co/Noctaluna/Noct-Q-Uncensored-Qwen-Image-2.1/blob/main/LICENSE
