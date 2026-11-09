# dollybeans/ADollsKiss

## Resumen

ADollsKiss es un checkpoint de difusion para generacion de imagenes de estilo anime, publicado por el usuario dollybeans en Hugging Face. Se trata de un merge de checkpoints (no de un modelo entrenado desde cero) construido sobre OnomaAIResearch/Illustrious-xl-early-release-v0, un modelo base de la familia Illustrious XL orientado a ilustracion anime de alta resolucion. El autor lo describe como el "contrapunto mas directo de ADV", con un enfoque deliberado en generar chicas anime bonitas, elementos cute y paletas de colores brillantes.

El modelo no es un LLM ni un modelo multimodal de texto: es un modelo texto-a-imagen del ecosistema Stable Diffusion / Illustrious, pensado para su uso en interfaces como Automatic1111, ComfyUI o Forge. El repositorio ocupa 34,8 GB, lo que es coherente con un checkpoint en precision fp16 de un modelo SDXL-like con varios componentes (UNet, VAE y text encoders). No se dispone de informacion sobre parametros, contexto (en el sentido de longitud de prompt) ni benchmarks.

La relevancia es limitada y muy de nicho: se trata de un merge comunitario sin descargas ni likes en el momento de la consulta, sin licencia declarada y sin documentacion tecnica mas alla de los ajustes de muestreo recomendados. Resulta util unicamente como referencia para quienes exploran merges de Illustrious con estetica anime femenina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (familia Illustrious XL / SDXL-like); detalles exactos no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (no aplica en el sentido de LLM; limite de tokens de prompt no documentado) |
| Tipos de cuantizacion | no disponible (el repo contiene pesos presumiblemente fp16; no se documentan variantes GGUF, fp8 ni NF4) |
| Idiomas soportados | no disponible (los prompts se interpretan via text encoder CLIP; el autor no declara idiomas) |
| Licencia | no disponible |
| Formato de pesos | no disponible con certeza; el tamano del repo (34,8 GB) sugiere checkpoints en fp16 tipo safetensors/ckpt |

## Arquitectura y entrenamiento

ADollsKiss es un checkpoint merge, es decir, una combinacion de pesos de varios modelos de la misma familia mediante tecnicas de interpolacion (block merge, weighted sum u otras no especificadas). El autor enumera los modelos de origen: Shiir0's Koki'o v2.0, NTR MIX XIII, Coco Illus v2.1 y Vixon's milk factory v3.0. Todos ellos pertenecen al ecosistema Illustrious, lo que garantiza compatibilidad de arquitectura y de tokenizer.

No se documenta el proceso de merge (ratios, metodo, capas afectadas), ni datos de entrenamiento, ni si hubo fine-tuning adicional tras la fusion. Tampoco se indica el numero de pasos de entrenamiento, el dataset o el uso de RLHF/DPO (que no aplica a modelos de difusion de este tipo). La innovacion tecnica, si existe, es puramente estetica: la seleccion de merges para sesgar la salida hacia rostros femeninos, colores saturados y composiciones limpias.

## Capacidades

- Generacion de imagenes anime texto-a-imagen a partir de prompts en lenguaje natural.
- Enfoque declarado en personajes femeninos ("female focus") y estetica cute con colores brillantes.
- Compatible con el pipeline estandar de Illustrious/SDXL: prompts positivos y negativos, CFG, samplers y schedulers.
- Soporte de muestreo con Euler A y DPM++ 2M Karras, segun recomienda el autor.
- Funciona con CFG entre 4 y 7 y pasos de 25 en adelante (el autor usa 28 o 32).
- Compatible con extensiones de posprocesado como ADetailer (face_yolov8n_v2) para refinado de rostros.
- No se documentan capacidades de tool calling, agentes, vision, audio ni razonamiento multi-paso (no aplican a este tipo de modelo).

## Casos de uso

- Ilustracion de personajes anime: generacion de retratos y figuras femeninas con paletas vivas, usando CFG 5 y 28 pasos con DPM++ 2M SGM Uniform como configuracion de partida.
- Creacion de avatares y assets para comunidades: el sesgo hacia estetica cute y colores brillantes encaja en foros, servidores de Discord o perfiles de redes.
- Prototipado rapido de conceptos visuales: iterar variaciones de un personaje con distintos prompts y seeds antes de encargar arte final.
- Base para merges posteriores: al ser un checkpoint Illustrious, puede servir como ingrediente en nuevas fusiones de la comunidad.
- Generacion de fondos y decoracion estilizada: composiciones con motivos kawaii para banners, streams o material promocional de proyectos personales.
- Experimentacion con pipelines de difusion: probar schedulers (Euler A, DPM++ 2M Karras, SGM Uniform) y comparar resultados sobre una misma familia de modelos.
- Refinado de rostros en flujos de posproduccion: combinacion con ADetailer para corregir caras en imagenes generadas en lote.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial; por el tamano del repo (34,8 GB) y la familia Illustrious, se requiere habitualmente una GPU con 8-12 GB de VRAM para inferencia en fp16 con optimizaciones, y 16 GB o mas para comodidad.
- GPU recomendadas: no documentadas por el autor; en la practica, tarjetas consumer tipo RTX 3060 12 GB, RTX 4070, RTX 4090, y profesionales A100/H100 para lotes grandes.
- Compatibilidad con GPU consumer: si, previsiblemente en modelos con 8 GB o mas, aunque no hay confirmacion oficial.
- Opciones de despliegue: Automatic1111 WebUI, ComfyUI, Forge, InvokeAI o Diffusers; no se documenta soporte de llama.cpp, Ollama, vLLM ni TGI (no aplican a difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Base | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| ADollsKiss | Illustrious XL early release v0 | Anime femenino, colores brillantes | no disponible | Hugging Face (0 descargas) |
| Illustrious XL early release v0 | Propio | Base generalista anime | no disponible en esta ficha | Hugging Face (OnomaAIResearch) |
| NTR MIX XIII | Illustrious (presumiblemente) | Merge anime | no disponible | Referenciado como fuente del merge |
| Vixon's milk factory v3.0 | Illustrious (presumiblemente) | Merge anime | no disponible | Referenciado como fuente del merge |

No se dispone de datos de rendimiento ni de parametros para establecer una comparacion cuantitativa fiable.

## Limitaciones y advertencias

- Sin licencia declarada: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Sin model card tecnica: no hay informacion sobre dataset, proceso de merge ni evaluacion, lo que dificulta la reproducibilidad.
- Sesgo estetico marcado hacia personajes femeninos y estilo cute; puede producir resultados pobres en otras tematicas.
- Riesgo de artefactos tipicos de merges de difusion: anatomia inconsistente, manos deformes y coherencia limitada en escenas complejas.
- Sin datos de benchmarks ni de calidad objetiva; el rendimiento depende en gran medida de la interfaz, sampler y prompt.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: soporte comunitario practicamente inexistente.
- El contenido generado puede incurrir en sesgos de representacion propios de los datasets anime de origen, no documentados.
- No apto para tareas de texto, razonamiento, codigo o agentes.

## Enlaces

- Hugging Face: https://huggingface.co/dollybeans/ADollsKiss
- Modelo base: https://huggingface.co/OnomaAIResearch/Illustrious-xl-early-release-v0
