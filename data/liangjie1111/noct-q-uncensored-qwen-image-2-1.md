# liangjie1111/Noct-Q-Uncensored-Qwen-Image-2.1

## Resumen

Noct Q es un modelo de generacion de imagenes texto-a-imagen derivado de Qwen/Qwen-Image-2.1 mediante una fusion (merge) con pesos del transformer modificados. Lo publica el usuario liangjie1111 bajo la marca Noct Q, y su proposito explicito es eliminar la censura del modelo base para generar desnudos y escenas explicitas sin necesidad de aplicar un LoRA adicional. Se distribuye como un unico fichero safetensors cuantizado a int8, pensado para cargarse directamente en ComfyUI.

El modelo se apoya en la arquitectura de difusion de Qwen Image 2.1, que combina un text encoder Qwen3-VL de 8B y un VAE propio, y hereda la capacidad del modelo base para leer prompts en prosa (no listas de etiquetas) y para generar texto legible en senales y etiquetas. La modificacion principal afecta a los pesos del transformer, de modo que el modelo responde a contenido adulto de forma nativa, manteniendo capacidades generales de realismo fotografico, ilustracion pintada y anime.

Es relevante en el nicho de generacion de imagenes sin filtros para uso local, porque ofrece una via de un solo fichero compatible con GPUs de 8 a 12 GB gracias a la cuantizacion int8, y porque su licencia restringe el uso a fines no comerciales (Qwen Research License Agreement). No hay datos publicados sobre contexto, idiomas ni benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion texto-a-imagen derivada de Qwen/Qwen-Image-2.1 (transformer con pesos modificados por merge) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (convrot); el autor menciona int4, fp8, bf16 y fp16 en Civitai |
| Idiomas soportados | no disponible (la model card incluye texto en ingles y chino) |
| Licencia | qwen-research (Qwen Research License Agreement), solo uso no comercial |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

Noct Q es un derivado por merge de Qwen/Qwen-Image-2.1. Segun la model card, los pesos del transformer estan modificados respecto al modelo base (se referencia un fichero NOTICE), y el resultado se empaqueta como un unico safetensors int8 con la tecnica que el autor denomina "convrot". El pipeline incluye un text encoder Qwen3-VL 8B en int8 y un VAE bf16, ambos distribuidos por Comfy-Org para Qwen Image 2.1.

No se detalla el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo etapas de RLHF o DPO; tampoco se especifica la metodologia exacta del merge ni el volumen de datos de ajuste. La innovacion practica declarada es la eliminacion de la censura en los pesos del transformer, de forma que el modelo genera contenido adulto sin LoRA, y la disponibilidad de una version int8 que cabe en tarjetas de 8 a 12 GB con los nodos core de ComfyUI 0.37 o superior.

## Capacidades

- Generacion de imagenes fotorrealistas de cuerpo completo en escenas de dia, con flash y nocturnas.
- Escenas explicitas con pareja; el autor afirma que la version V4 las representa segun lo pedido tres veces mas a menudo que V3.
- Texto legible en senales y etiquetas.
- Anime e ilustracion pintada.
- Interpretacion de prompts en prosa tipo caption (quien, que hace, donde, la luz), sin palabra de activacion.
- Edicion de imagen con los mismos ficheros usando la plantilla de edicion de Qwen Image 2.1 en ComfyUI.
- No se documenta soporte de tool calling, agentes, audio ni modos de razonamiento.

## Casos de uso

- Generacion de fotografia de figura humana para estudio: el modelo produce cuerpos completos en luz natural, flash o nocturna con un prompt descriptivo en prosa, adecuado para practicar iluminacion y encuadre en 1024x1536 vertical.
- Ilustracion de personajes para proyectos creativos personales: la capacidad de anime e ilustracion pintada permite generar hojas de personaje y escenas narrativas sin LoRA adicional.
- Edicion de imagenes existentes: reutilizando los mismos ficheros en la plantilla de edicion de Qwen Image 2.1 en ComfyUI, se pueden modificar escenas manteniendo coherencia con el prompt.
- Creacion de material para guiones y storyboards de contenido adulto: la generacion nativa de escenas explicitas evita encadenar LoRAs y simplifica el flujo en ComfyUI.
- Pruebas de robustez y evaluacion de filtros: util para investigadores que estudian el comportamiento de modelos sin censura y el efecto de las cuantizaciones int8 frente a fp8 o bf16.
- Render de carteles y rotulos con texto legible: la capacidad de escribir texto en senales y etiquetas sirve para maquetas y pruebas de diseno grafico.
- Despliegue local en equipos modestos: la version int8 de 7,3 GB permite ejecutar el modelo en GPUs de 8 a 12 GB con 25 pasos, euler, simple y cfg 3.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 8 a 12 GB para el fichero int8 de 7,3 GB, segun el autor; se requiere ademas memoria para el text encoder Qwen3-VL 8B int8 y el VAE bf16.
- GPU recomendadas: no se especifican modelos concretos; el rango declarado de 8 a 12 GB cubre tarjetas consumer como RTX 3060 12 GB, RTX 4060 Ti 16 GB o RTX 4070, aunque el autor no las nombra.
- Cabe en GPU consumer: si, en el rango de 8 a 12 GB indicado por el autor.
- Opciones de despliegue: ComfyUI 0.37 o superior con nodos core; el modelo se coloca en `models/diffusion_models`, el text encoder en `models/text_encoders` y el VAE en `models/vae`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el autor indica que cfg 1 corre aproximadamente el doble de rapido que cfg 3, a costa de ignorar el prompt negativo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Noct Q (este modelo) | no disponible | no disponible | qwen-research, no comercial | Hugging Face y Civitai | Derivado de Qwen Image 2.1, int8, sin censura |
| Qwen/Qwen-Image-2.1 | no disponible | no disponible | qwen-research | Hugging Face | Modelo base, con filtros del autor original |
| Noct Q V3 (version previa del mismo autor) | no disponible | no disponible | qwen-research | Civitai | Version anterior; segun el autor, V4 mejora las escenas explicitas |

No se dispone de datos de benchmarks ni de especificaciones de parametros para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Contenido para adultos: el modelo esta etiquetado como nsfw y not-for-all-audiences; no debe usarse en entornos sin control de edad ni en productos de consumo general.
- Licencia restrictiva: la Qwen Research License Agreement limita el uso a fines no comerciales; cualquier explotacion comercial requiere autorizacion del titular de la licencia.
- Riesgo de alucinacion visual: como modelo de difusion, puede generar anatomia incorrecta, texto ilegible o incoherencias en escenas complejas; no hay evaluaciones publicadas que cuantifiquen estos fallos.
- Sesgos: no se documentan sesgos conocidos, pero el modelo se ha ajustado hacia un tipo de contenido adulto concreto y puede estar sesgado en diversidad de cuerpos, etnias y edades representadas.
- Limitaciones de idioma: no se especifican idiomas soportados; los prompts de ejemplo estan en ingles y la model card incluye texto en chino.
- Dependencia de ComfyUI: el flujo recomendado exige ComfyUI 0.37 o superior y ficheros auxiliares concretos de Comfy-Org; no se garantiza compatibilidad con otras herramientas.
- Sin datos de rendimiento: no hay benchmarks, latencias ni evaluaciones de calidad objetivas publicadas.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, lo que limita la validacion por parte de la comunidad.

## Enlaces

- [Hugging Face: liangjie1111/Noct-Q-Uncensored-Qwen-Image-2.1](https://huggingface.co/liangjie1111/Noct-Q-Uncensored-Qwen-Image-2.1)
- [Civitai: Noct Q (galeria, prompts y versiones int4, fp8, bf16 y fp16)](https://civitai.com/models/2958896)
- [Licencia Qwen Research License Agreement](https://huggingface.co/Noctaluna/Noct-Q-Uncensored-Qwen-Image-2.1/blob/main/LICENSE)
- [Modelo base: Qwen/Qwen-Image-2.1](https://huggingface.co/Qwen/Qwen-Image-2.1)
- [Text encoder: qwen3vl_8b_int8_convrot.safetensors](https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/text_encoders/qwen3vl_8b_int8_convrot.safetensors)
- [VAE: qwen_image_2.1_vae_bf16.safetensors](https://huggingface.co/Comfy-Org/Qwen-Image-2.1/blob/main/vae/qwen_image_2.1_vae_bf16.safetensors)
