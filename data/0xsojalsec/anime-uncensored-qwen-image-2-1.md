# 0xSojalSec/Anime-Uncensored-Qwen-Image-2.1

## Resumen

Anime-Uncensored-Qwen-Image-2.1 es un modelo de difusion texto-a-imagen publicado en Hugging Face por el usuario 0xSojalSec, distribuido como un unico archivo safetensors de 7,3 GB en cuantizacion int8. Se presenta como una variante sin censura de Qwen/Qwen-Image-2.1, obtenida mediante merge de los pesos del transformer, y esta orientada a ilustracion anime, retratos y escenas de contenido adulto explicito. En el momento de redactar esta ficha el repositorio no registra descargas ni "me gusta", por lo que no existe validacion comunitaria.

La model card lo identifica comercialmente como "Noct Q Anime" y enlaza a una galeria en Civitai donde el autor aloja las versiones int4, fp8, bf16 y fp16, ademas de la licencia original. El flujo de uso recomendado es ComfyUI 0.37 o superior con nodos nativos, acompanado de un text encoder Qwen3-VL 8B en int8 y del VAE qwen_image_2.1_vae_bf16, ambos alojados en el repositorio Comfy-Org/Qwen-Image-2.1.

Su relevancia es doble. Por un lado, demuestra que un modelo de difusion de gran tamano puede ejecutarse en tarjetas graficas de 8 a 12 GB de VRAM gracias a la cuantizacion int8. Por otro, su licencia Qwen Research restringe el uso a fines no comerciales, un punto critico que condiciona cualquier evaluacion para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (pipeline text-to-image, libreria diffusion-single-file); la arquitectura interna no se detalla en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica una ventana de contexto de texto, el limite practico lo fija la longitud de prompt admitida por el text encoder Qwen3-VL 8B |
| Tipos de cuantizacion | int8 (variante int8_convrot incluida en el repositorio); la model card menciona versiones int4, fp8, bf16 y fp16 alojadas en Civitai |
| Idiomas soportados | no disponible; los prompts de ejemplo estan en ingles y la model card incluye una seccion en chino |
| Licencia | qwen-research (Qwen Research License Agreement); uso no comercial unicamente |
| Formato de pesos | safetensors, archivo unico (diffusion-single-file) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base, Qwen/Qwen-Image-2.1. Los metadatos indican que se trata de un modelo de difusion de archivo unico para generacion de imagenes, con relacion `merge` respecto al modelo base, es decir, los pesos del transformer han sido modificados y fusionados por el autor para producir una variante orientada a anime y sin censura. El repositorio incluye un unico archivo, `NoctQA_V1_int8_convrot.safetensors`, de 7,3 GB, ademas de un flujo de trabajo de ComfyUI en formato JSON.

El pipeline completo requiere dos componentes externos: el text encoder `qwen3vl_8b_int8_convrot.safetensors`, un modelo multimodal Qwen3-VL de 8.000 millones de parametros en int8, y el VAE `qwen_image_2.1_vae_bf16.safetensors`. No hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre tecnicas de entrenamiento especificas. La cuantizacion int8 aplicada se identifica en el nombre del archivo con el sufijo `convrot`, cuya implementacion concreta no se documenta en la model card. Los parametros de muestreo recomendados son 25 pasos, scheduler euler con modo simple, CFG 3 y un prompt negativo incluido en el flujo de trabajo.

## Capacidades

- Generacion de imagenes a partir de texto en estilo ilustracion anime, desde retratos en primer plano hasta escenas con fondos amplios.
- Representacion de personajes adultos vestidos, en ropa interior o completamente desnudos, incluida la generacion de escenas explicitas.
- Seguimiento de prompts largos y detallados, con control de multiples personajes, poses y angulos de camara descritos por escrito.
- Sin palabra de activacion (trigger word). Para obtener estilo anime es necesario que el prompt empiece por "An anime illustration of..."; sin el termino "anime" el resultado tiende a fotorrealismo.
- No dispone de tool calling, function calling ni capacidades de agente: es un modelo de difusion puro, no un modelo de lenguaje.
- Capacidades multilingues de prompt no confirmadas; los ejemplos de la model card estan en ingles y la documentacion incluye traduccion al chino.
- No se documentan capacidades de vision, audio, thinking mode ni generacion de texto.

## Casos de uso

- Ilustracion de personajes para proyectos personales y portfolios: el modelo genera retratos y figuras de cuerpo entero en estilo anime siguiendo descripciones largas, lo que permite iterar variaciones de un mismo personaje sin entrenar un LoRA propio.
- Previsualizacion de guiones graficos para animacion: con prompts detallados que fijan encuadre, angulo de camara y numero de personajes, sirve para materializar bocetos de escena antes de la produccion definitiva.
- Prototipado de assets para videojuegos independientes: util para explorar direccion de arte y paletas de color, siempre que el proyecto no sea comercial por las restricciones de la licencia.
- Ilustracion para fanzines, novelas ligeras amateur y publicaciones no comerciales, donde el contenido adulto sin censura es un requisito explicito del autor.
- Generacion de datos sinteticos para investigacion en vision por computador: permite crear conjuntos etiquetados de ilustracion anime con atributos controlados (pose, iluminacion, numero de personajes), sujeto a las limitaciones legales de la licencia y del contenido NSFW.
- Base para fine-tuning adicional: al ser un archivo safetensors unico compatible con ComfyUI, puede emplearse como punto de partida para entrenar LoRAs o merges adicionales en el ecosistema de difusion, con la salvedad de que la licencia no comercial se hereda.
- Exploracion artistica de estilo: la combinacion de luz suave y color limpio descrita por el autor lo hace adecuado para experimentar con iluminacion y paleta en ilustracion digital.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas (FID, CLIP score, comparativas humanas) ni evaluaciones cuantitativas frente a otros modelos. Los resultados de busqueda web proporcionados no contienen informacion relevante sobre este modelo.

## Requisitos de hardware

- VRAM estimada: el autor indica que el archivo int8 de 7,3 GB esta pensado para tarjetas de 8 a 12 GB. No hay estimaciones publicadas para las variantes int4, fp8, bf16 o fp16.
- Componentes adicionales: el text encoder Qwen3-VL 8B en int8 y el VAE en bf16 deben cargarse aparte. Su ubicacion en GPU o CPU (offload) condiciona el consumo total de VRAM y de memoria del sistema; no se especifican cifras.
- GPU recomendadas: no disponibles de forma explicita. Por el rango de 8 a 12 GB indicado, encajan tarjetas consumer como RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4070 y superiores. Para procesamiento por lotes o mayor throughput no hay datos publicados; en ese escenario serian necesarias A100 o H100 con memoria suficiente para el pipeline completo.
- Cabe en GPU consumer: si, segun el autor, en tarjetas de 8 a 12 GB con ComfyUI 0.37 o superior y nodos nativos.
- Opciones de despliegue: ComfyUI (version 0.37 o posterior, nodos core). El modelo debe colocarse en `models/diffusion_models`, el text encoder en `models/text_encoders` y el VAE en `models/vae`. No aplica a vLLM, llama.cpp, Ollama ni TGI, al tratarse de un modelo de difusion de imagen y no de un modelo de lenguaje.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Relacion | Parametros | Cuantizaciones | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anime-Uncensored-Qwen-Image-2.1 (este modelo) | Merge de Qwen/Qwen-Image-2.1 | no disponible | int8 en Hugging Face; int4, fp8, bf16 y fp16 en Civitai | qwen-research, solo no comercial | Hugging Face, 0 descargas y 0 likes |
| Qwen/Qwen-Image-2.1 | Modelo base | no disponible | no disponible | Qwen Research License | Hugging Face |
| Otras variantes anime sin censura de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparados entre estas opciones, por lo que la comparativa se limita a la relacion de derivacion, las cuantizaciones publicadas y el regimen de licencia.

## Limitaciones y advertencias

- Licencia estrictamente no comercial: el modelo es una obra derivada de Qwen/Qwen-Image-2.1 bajo la Qwen Research License Agreement. Cualquier uso comercial requiere una licencia independiente de Qwen, y los pesos derivados heredan la restriccion.
- Contenido para adultos: el modelo esta etiquetado como NSFW y `not-for-all-audiences`. Su uso exige verificar la mayoria de edad, el cumplimiento normativo de la jurisdiccion correspondiente y el etiquetado adecuado en cualquier plataforma de publicacion.
- Sin validacion externa: cero descargas y cero "me gusta" en el momento de la consulta, por lo que no existe evidencia de terceros sobre calidad, estabilidad o coherencia de los resultados.
- Inconsistencias en los metadatos: el identificador del repositorio (`0xSojalSec/Anime-Uncensored-Qwen-Image-2.1`), el titulo de la model card ("Noct Q Anime") y la ruta de la licencia apuntan a un repositorio distinto (`Noctaluna/Noct-Q-Anime-Uncensored-Qwen-Image-2.1`). Es probable que se trate de una resubida; conviene verificar la procedencia de los pesos antes de integrarlos.
- Riesgo de artefactos visuales: no hay datos publicados sobre la tasa de fallos. En modelos de difusion de este tipo son habituales los errores en manos, dedos, coherencia entre dos personajes y generacion de texto dentro de la imagen.
- Dependencia de estilo mediante prompt: sin la palabra "anime" el resultado tiende a fotorrealismo, un comportamiento que puede romper pipelines automatizados que no controlen el formato del prompt.
- Dependencia de componentes externos: el archivo unico no es autosuficiente; requiere el text encoder y el VAE alojados en otro repositorio, ademas de ComfyUI 0.37 o superior. No se documenta compatibilidad con `diffusers` ni con otras interfaces.
- Ausencia de benchmarks: no hay metricas objetivas publicadas, por lo que cualquier afirmacion de calidad relativa frente a otros modelos carece de respaldo.
- Idiomas: no se especifica el soporte multilingue del text encoder mas alla del ingles y el chino presentes en la documentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xSojalSec/Anime-Uncensored-Qwen-Image-2.1
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Galeria, prompts y versiones int4, fp8, bf16 y fp16 en Civitai: https://civitai.com/models/2967534
- Licencia referenciada en la model card: https://huggingface.co/Noctaluna/Noct-Q-Anime-Uncensored-Qwen-Image-2.1/blob/main/LICENSE
- Repositorio citado como origen en la licencia: https://huggingface.co/Noctaluna/Noct-Q-Anime-Uncensored-Qwen-Image-2.1
- Text encoder Qwen3-VL 8B int8: https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/text_encoders/qwen3vl_8b_int8_convrot.safetensors
- VAE qwen_image_2.1_vae_bf16: https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors
