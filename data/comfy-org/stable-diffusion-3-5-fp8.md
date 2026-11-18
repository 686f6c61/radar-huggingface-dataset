# Comfy-Org/stable-diffusion-3.5-fp8

## Resumen

Stable Diffusion 3.5 FP8 es un reempaquetado de los pesos del modelo de difusion Stable Diffusion 3.5 (variantes Large y Medium) de Stability AI, publicado por Comfy-Org para su uso directo dentro de ComfyUI. No se trata de un modelo nuevo ni de un fine-tune: los pesos derivan de `stabilityai/stable-diffusion-3.5-large` y `stabilityai/stable-diffusion-3.5-medium`, convertidos a precision FP8 (escala `fp8_scaled` / `e4m3fn`) para reducir huella de memoria y acelerar la inferencia en GPUs consumer.

El repositorio es un single-file checkpoint en formato `safetensors`, pensado para colocarse en `ComfyUI/models/checkpoints/`, e incluye los text encoders CLIP y T5 integrados en el caso de la variante Medium. Resuelve el problema practico de desplegar SD 3.5 en entornos ComfyUI sin tener que gestionar por separado los componentes de texto ni convertir pesos manualmente.

Es relevante porque SD 3.5 Large es el modelo insignia de la familia SD 3.5 de Stability AI, con arquitectura MMDiT (multimodal diffusion transformer) y un encoder de texto T5-XXL junto a CLIP-L y CLIP-G, y esta version FP8 acerca su ejecucion a hardware de consumo. El repo acumula 400.403 descargas y 256 likes, lo que lo convierte en una de las vias de acceso mas usadas a SD 3.5 dentro del ecosistema ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MMDiT (multimodal diffusion transformer) de SD 3.5, pesos en FP8 |
| Parametros totales | no disponible (el repo no declara cifras; SD 3.5 Large se suele citar en ~8B, SD 3.5 Medium en ~2.5B, sin confirmacion en la informacion disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion; la longitud relevante es la de tokens de prompt, no declarada) |
| Tipos de cuantizacion | FP8 (`fp8_scaled`, `fp8_e4m3fn`) para UNet/checkpoint; text encoders T5-XXL disponibles en FP16, FP8 e4m3fn y FP8 e4m3fn scaled; CLIP-L y CLIP-G en safetensors |
| Idiomas soportados | no disponibles (prompts en lenguaje natural; el encoder T5-XXL es multilingue, pero no se declara cobertura) |
| Licencia | `stabilityai-ai-community` (licencia "other", enlazada a LICENSE.md de stabilityai/stable-diffusion-3.5-large) |
| Formato de pesos | safetensors (single-file, `diffusion-single-file`) |

## Arquitectura y entrenamiento

El modelo subyacente es Stable Diffusion 3.5, que emplea la arquitectura MMDiT introducida en SD 3: un transformer de difusion que procesa conjuntamente tokens de texto e imagen con atencion multimodal, sustituyendo el UNet convolucional de generaciones anteriores. El pipeline combina tres text encoders (CLIP-L, CLIP-G y T5-XXL) para codificar el prompt, lo que permite prompts largos y mayor fidelidad semantica. Esta ficha corresponde exclusivamente al reempaquetado FP8 de Comfy-Org; los detalles de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO o preentrenamiento rectified flow) no estan incluidos en la informacion proporcionada y deben consultarse en la model card original de Stability AI.

La unica intervencion tecnica documentada en este repo es la conversion de pesos a FP8 con escalado (`fp8_scaled`), que reduce el tamano del checkpoint y el uso de VRAM frente a FP16, manteniendo los text encoders T5-XXL en variantes FP16 y FP8 (`e4m3fn` y `e4m3fn_scaled`) para que el usuario elija el equilibrio precision/memoria. La variante Medium se distribuye como checkpoint unico con CLIPs y T5-XXL FP8 scaled incluidos.

## Capacidades

- Generacion de imagenes texto-a-imagen con prompts en lenguaje natural, incluyendo prompts largos y composiciones complejas gracias a los encoders CLIP + T5-XXL.
- Tipografia y renderizado de texto dentro de la imagen, capacidad caracteristica de la familia SD 3.5.
- Control estructural mediante ControlNet: los workflows oficiales incluyen Depth, Canny y Blur para SD 3.5 Large.
- Edicion y refinamiento de imagen mediante img2img e inpainting dentro de ComfyUI (flujos estandar del nodo de difusion).
- Integracion nativa con ComfyUI como checkpoint single-file, con carga directa desde `models/checkpoints/`.
- No dispone de tool calling, function calling, razonamiento multi-paso ni modo thinking: es un modelo generativo de imagenes, no un LLM.
- No se declaran capacidades de audio, video ni vision-comprension; la unica modalidad de entrada es texto (y opcionalmente imagen de referencia en ControlNet/img2img).

## Casos de uso

- Generacion de ilustraciones para publicaciones: usar el checkpoint `sd3.5_large_fp8_scaled.safetensors` en ComfyUI con prompts detallados para producir imagenes de alta fidelidad; el FP8 reduce VRAM y permite iterar mas rapido en GPUs de 16-24 GB.
- Diseno de carteles y rotulacion: SD 3.5 mejora el renderizado de texto en imagen, por lo que sirve para bocetos de carteles, banners y mockups tipograficos que luego se retocan en un editor.
- Control de composicion con ControlNet: aplicar los workflows Depth, Canny o Blur para imponer la estructura de una referencia (por ejemplo, mantener la silueta de un producto) y generar variaciones de estilo.
- Prototipado de assets para videojuegos: generar concept art de personajes, entornos y texturas con img2img a partir de bocetos, aprovechando la ventana de prompt amplia del T5-XXL para describir materiales y iluminacion.
- Automatizacion de pipelines de contenido: integrar ComfyUI con su API para lotes de imagenes a partir de plantillas de prompt, usando la variante Medium (checkpoint con encoders incluidos) cuando el throughput importa mas que la calidad maxima.
- Restauracion y ampliacion creativa: usar img2img con denoising parcial sobre fotos de baja calidad para reconstruir detalle, o el workflow Blur para suavizar y regenerar zonas problematicas.
- Maquetacion editorial y marketing: generar fondos y texturas a medida para plantillas de redes sociales, con control de paleta mediante prompts y posterior composicion en herramientas de diseno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial en la informacion proporcionada. Como referencia practica, un checkpoint SD 3.5 Large en FP8 ocupa del orden de 8 GB en disco y requiere ademas cargar los text encoders (T5-XXL FP16 ~9-10 GB, FP8 ~5 GB), por lo que el consumo total de VRAM depende de que encoders se carguen y del tamaño de imagen; estas cifras son estimaciones de orden de magnitud, no datos del repo.
- GPU recomendadas: no declaradas por el autor. Por tamano de memoria, GPUs con 16-24 GB (RTX 4080/4090, RTX 3090, A10G, L4) son el objetivo natural de la variante FP8; A100/H100 permiten lotes mayores y resoluciones superiores.
- Cabe en GPU consumer: si, previsiblemente en RTX 3090/4080/4090 con 24 GB o 16 GB usando T5-XXL en FP8; no hay confirmacion oficial en la informacion disponible.
- Opciones de despliegue: ComfyUI (destino principal, con workflows oficiales), y por extension cualquier runtime que cargue safetensors de difusion; llama.cpp, Ollama y TGI no aplican a modelos de difusion de imagen.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de prompt | Licencia | Disponibilidad |
|---|---|---|---|---|
| Stable Diffusion 3.5 Large FP8 (este repo) | no disponible | no disponible | stabilityai-ai-community | Hugging Face, single-file safetensors para ComfyUI |
| stabilityai/stable-diffusion-3.5-large (original) | no disponible | no disponible | stabilityai-ai-community | Hugging Face, formato Diffusers multi-componente |
| stabilityai/stable-diffusion-3.5-medium (original) | no disponible | no disponible | stabilityai-ai-community | Hugging Face, formato Diffusers |
| Alternativas de misma categoria (p. ej. FLUX.1) | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a variantes de la misma familia porque la informacion proporcionada no incluye datos de modelos competidores. La diferencia clave frente al repo original de Stability AI es el formato: este repo entrega un unico safetensors en FP8 con encoders integrados (en Medium) y workflows de ComfyUI, mientras que el original se distribuye en formato Diffusers con componentes separados.

## Limitaciones y advertencias

- Es un reempaquetado, no un modelo entrenado por Comfy-Org: cualquier sesgo o limitacion de calidad proviene de SD 3.5 original y debe evaluarse contra la model card de Stability AI.
- Riesgo de alucinacion visual: puede generar anatomia incorrecta, texto ilegible o elementos incoherentes en escenas complejas, especialmente con prompts ambiguos.
- La cuantizacion FP8 puede introducir perdida de fidelidad frente a FP16; no se documenta en el repo una evaluacion comparativa de calidad FP8 vs FP16.
- Licencia `stabilityai-ai-community`: no es una licencia open source permisiva; el uso comercial esta sujeto a los terminos de Stability AI y debe revisarse LICENSE.md antes de desplegar en produccion.
- Idiomas: no se declara cobertura oficial; el rendimiento con prompts en castellano depende del encoder T5-XXL y no esta verificado en la informacion disponible.
- No hay garantia de compatibilidad fuera de ComfyUI: el formato single-file y los nombres de archivo estan pensados para esa aplicacion.
- El repo ocupa 48 GB e incluye varias variantes de T5-XXL; conviene descargar solo los archivos necesarios para no saturar disco.
- No apto para tareas de texto, codigo, razonamiento o agentes: es exclusivamente un modelo de generacion de imagenes.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Comfy-Org/stable-diffusion-3.5-fp8
- Modelo original SD 3.5 Large: https://huggingface.co/stabilityai/stable-diffusion-3.5-large
- Licencia: https://huggingface.co/stabilityai/stable-diffusion-3.5-large/blob/main/LICENSE.md
- Blog de ComfyUI sobre SD 3.5: https://blog.comfy.org/sd3-5-comfyui/
- Repositorio ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Workflow simple SD 3.5: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/sd3.5_simple_example.json
- Workflow Depth: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/sd3.5_large_depth.json
- Workflow Canny ControlNet: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/sd3.5_large_canny_controlnet_example.json
- Workflow Blur: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/sd3.5_large_blur.json
