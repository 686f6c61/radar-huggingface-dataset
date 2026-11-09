# AI-KSK/ksk-video-177-comfyui-workflows

## Resumen

Anima 2B es un modelo de difusion texto-a-imagen orientado a ilustracion anime, con 2.000 millones de parametros, desarrollado en colaboracion con Comfy Org. El modelo se entrena sobre millones de imagenes anime y 800.000 ilustraciones no anime, y segun la model card no utiliza datos sinteticos: no se emplearon imagenes generadas por IA en su entrenamiento. Esto lo diferencia de buena parte del ecosistema actual de modelos anime, que suele depender de datasets sinteticos o destilados de modelos mayores.

El repositorio `AI-KSK/ksk-video-177-comfyui-workflows` no contiene pesos ni grafos JSON, sino un tutorial en ingles y la tabla de parametros extraida del workflow original de ComfyUI. El material documenta tres flujos: texto-a-imagen, imagen-a-imagen (conversion de fotos o renders 3D a estilo anime) y upscale por tiles. El text encoder es Qwen3 (variante base de 0,6B) y el VAE es el de Qwen Image.

El modelo es una build de preview, no acelerada: requiere un presupuesto completo de pasos de muestreo para obtener resultados correctos. Su relevancia actual reside en que es lo bastante pequeno para ejecutarse en GPU de consumo (el autor estima 6 GB de VRAM, posiblemente 4 GB), lo que lo hace accesible para entornos locales con ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | modelo de difusion (UNET) para texto-a-imagen, con text encoder Qwen3 y VAE de Qwen Image |
| Parametros totales | 2.000 millones (2B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (ingles) |
| Licencia | other |
| Formato de pesos | safetensors (`anima-preview.safetensors`); el repositorio no incluye pesos |

## Arquitectura y entrenamiento

La arquitectura es un UNET de difusion de 2B parametros, cargado en ComfyUI mediante el nodo UNET loader con el fichero `anima-preview.safetensors`. El pipeline de texto se gestiona con un CLIP loader que apunta a `qwen_3_06b_base.safetensors` en modo `stable_diffusion`, y la decodificacion latente usa `qwen_image_vae.safetensors`. El muestreo configurado en los tres grafos emplea el sampler `er_sde` con scheduler `simple`, cfg 4 y entre 30 y 31 pasos.

Los datos de entrenamiento declarados son millones de imagenes anime y 800.000 obras de arte no anime, sin datos sinteticos. No se especifica el numero exacto de tokens o imagenes vistas, ni si hubo etapas de RLHF, DPO o fine-tuning por preferencias. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion linear; el modelo se presenta como una build de preview sin aceleracion.

## Capacidades

- Generacion de imagenes anime a partir de prompts en ingles (texto-a-imagen), con resolucion latente nativa de 1024x1024 y batch 1.
- Conversion imagen-a-imagen de fotos o renders 3D a estilo anime, con control de denoise (valor recomendado cercano a 0,7).
- Upscale por tiles para superar la resolucion nativa del modelo, con solapamiento de aproximadamente 0,35 y ruido bajo (denoise 0,25).
- Descripcion automatica de imagenes (captioning) mediante Qwen3-VL, usada como paso previo en el flujo imagen-a-imagen.
- Compatibilidad con LoRA de personaje o IP, aplicables sobre el UNET (el ejemplo documentado usa un LoRA Gundam a fuerza 0,85).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision nativa ni audio.

## Casos de uso

- Ilustracion anime por prompt: usar el grafo de texto-a-imagen con un prompt en ingles, 30 pasos, cfg 4 y sampler er_sde, generando a 1024x1024 y aplicando upscale posterior para tamanos de produccion.
- Conversion de fotos a estilo anime: encajar la imagen de entrada, fijar denoise en torno a 0,7 y ejecutar el grafo imagen-a-imagen para preservar la composicion original con acabado de ilustracion.
- Conversion de renders 3D a anime: mismo flujo imagen-a-imagen, util para estudios que quieren previsualizar assets 3D con estetica anime antes de producir arte final.
- Preparacion de datasets con captioning: emplear Qwen3-VL para describir imagenes y alimentar prompts en ingles, reduciendo el trabajo manual de etiquetado en pipelines de generacion.
- Produccion de fondos y assets a gran resolucion: el flujo de tiled upscale con solapamiento de 0,35 y denoise 0,25 permite ampliar ilustraciones por encima de la resolucion nativa sin costuras evidentes.
- Iteracion local en estacion de trabajo: al estimarse 6 GB (posiblemente 4 GB) de VRAM, el modelo puede ejecutarse en GPU de consumo dentro de ComfyUI para prototipado rapido de conceptos anime.
- Personalizacion con LoRA de personaje: integrar LoRA de IP con licencia propia (por ejemplo, el Gundam RX78 usado como ejemplo) para generar variaciones consistentes de un personaje concreto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: 6 GB, posiblemente 4 GB, segun inferencia del autor a partir del tamano de los ficheros del modelo y del encoder; no es una medida empirica.
- GPU recomendadas: no disponibles de forma explicita; por el rango de VRAM estimado, encaja en GPU de consumo tipo RTX 3060, RTX 4060 o superiores. Para produccion a mayor volumen, GPU de datacenter (A100, H100) no estan documentadas para este modelo.
- Cabe en GPU de consumo: si, segun la estimacion del autor (4-6 GB).
- Opciones de despliegue: ComfyUI es el entorno documentado (nodos UNET loader, CLIP loader, VAE, KSampler). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo de difusion.
- Latencia y throughput: no disponibles. El modelo es una build de preview sin aceleracion y requiere el presupuesto completo de pasos (30-31), lo que sugiere tiempos de generacion mayores que builds destiladas o aceleradas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion nativa | Entrenamiento sin datos sinteticos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Anima 2B | 2B | 1024x1024 | declarado | other | preview; pesos no incluidos en este repo |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos sobre modelos comparables (parametros, contexto, rendimiento o licencia), por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- Build de preview, no acelerada: necesita un presupuesto completo de pasos para verse correctamente; no es adecuada para escenarios que exijan baja latencia.
- Resolucion nativa pequena (1024x1024): el upscale es obligatorio para tamanos de produccion.
- Idiomas: solo se declara ingles; los prompts deben redactarse en ingles.
- Licencia `other`: las condiciones exactas de uso comercial no estan detalladas en la informacion disponible y deben consultarse en la licencia del modelo original.
- LoRA de personaje o IP: cada LoRA lleva su propia licencia; el ejemplo con Gundam RX78 es un LoRA de terceros y no hereda la licencia del modelo base.
- La estimacion de 4-6 GB de VRAM es una inferencia del autor, no una medicion; el consumo real puede variar.
- No se documentan sesgos conocidos ni tasas de alucinacion; en modelos de difusion, el riesgo principal es la generacion de contenido no deseado o la desviacion del prompt, no la alucinacion textual.
- El repositorio no incluye pesos, JSON de workflow ni covers: el grafo completo solo esta disponible a traves del release del episodio o de la pagina de RunningHub.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-177-comfyui-workflows
- RunningHub - Anima tiled upscale: https://www.runninghub.ai/post/2021929692445544449/?inviteCode=rh-v1111
- RunningHub - Anima imagen-a-imagen: https://www.runninghub.ai/post/2021929700087566337/?inviteCode=rh-v1111
- RunningHub - Anima texto-a-imagen: https://www.runninghub.ai/post/2021929707570208769/?inviteCode=rh-v1111
- Tutorial en YouTube: https://www.youtube.com/watch?v=J2A8JWDCUhk
- Original en Bilibili: https://www.bilibili.com/video/BV1FscqzREni
