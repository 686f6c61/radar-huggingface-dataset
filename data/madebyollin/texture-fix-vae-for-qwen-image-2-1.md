# madebyollin/texture-fix-vae-for-qwen-image-2.1

## Resumen

Texture-Fix-VAE-for-Qwen-Image-2.1 es un ajuste fino no oficial del decodificador del VAE de Qwen-Image-2.1, desarrollado por el usuario `madebyollin`. No es un modelo de lenguaje ni un modelo de difusion completo: es exclusivamente el autoencoder variational (VAE) que traduce latentes a pixeles dentro del pipeline de generacion de imagen de Qwen-Image-2.1. Su proposito es corregir dos defectos del VAE original: la aparicion de artefactos de tablero de ajedrez (checkerboard) y la perdida de detalle fino en texturas complejas.

El modelo conserva la arquitectura, el espacio latente y el encoder del VAE original, y unicamente modifica el decodificador. Concretamente, se descongelaron las dos etapas de decodificacion de mayor resolucion y la cabeza de salida, lo que supone 7.5 millones de parametros entrenables sobre un total de 337.740.404 parametros. El entrenamiento siguio la receta desarrollada para TAESD, combinando perdidas MSE/MAE, LPIPS y adversarial (GAN).

Es relevante ahora porque Qwen-Image-2.1 es uno de los modelos abiertos de generacion y edicion de imagen mas utilizados, y su VAE original presenta un compromiso desfavorable entre fidelidad perceptual y reconstruccion: el ajuste baja el rFID de 3.37 a 2.08 a costa de degradar ligeramente PSNR y LPIPS. Al mantenerse intacto el espacio latente, el modelo se puede usar como sustituto directo (drop-in) en ComfyUI y Diffusers sin reentrenar ni convertir latentes existentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Autoencoder variational (VAE) del pipeline Qwen-Image-2.1, clase `AutoencoderKLQwenImage21`; solo se ajusta el decodificador |
| Parametros totales | 337.740.404 |
| Parametros activos | no aplica (no es un modelo MoE); 7.5 M parametros entrenables durante el ajuste fino |
| Longitud de contexto | no aplica (modelo de vision, no procesa secuencias de texto) |
| Tipos de cuantizacion | bf16 (fichero `texture_fix_vae_for_qwen_image_2.1_bf16.safetensors`); no se documentan otros formatos de cuantizacion |
| Idiomas soportados | no aplica (componente de autoencoder de imagen, sin procesamiento de lenguaje) |
| Licencia | qwen-research (Qwen Research License Agreement), solo uso no comercial y de investigacion |
| Formato de pesos | safetensors (tambien compatible con la carga de Diffusers via `from_pretrained`); tamano del repositorio 2.0 GB |
| Libreria | diffusers |
| Modelo base | Qwen/Qwen-Image-2.1 |
| Descargas / likes | 29 descargas, 12 likes |
| Fecha de publicacion | 24 de septiembre de 2026 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

El modelo es un VAE de imagen perteneciente a la familia de Qwen-Image-2.1, cuyo componente de generacion visual es un DiT de flujo unico (single-stream) de 7B parametros y 32 capas que emplea Qwen3-VL-8B como codificador de texto. El VAE aqui publicado no modifica ni el encoder ni el espacio latente: actua como decodificador de latentes a pixeles y es intercambiable con el VAE original del mismo repositorio base.

La creacion del modelo consistio en un ajuste fino del decodificador del VAE de Qwen-Image-2.1 durante aproximadamente 5000 pasos con una tasa de aprendizaje de 3e-5, dejando descongeladas unicamente las dos etapas de decodificacion de mayor resolucion y la cabeza de salida (7.5 M parametros entrenables de los ~337.7 M totales). Se utilizo la receta desarrollada para TAESD, que combina terminos de perdida orientados a PSNR (MSE/MAE), LPIPS y adversarios (GAN). El autor argumenta que las perdidas MSE/MAE favorecen el desenfoque cuando el detalle exacto no es reconstruible, la perdida LPIPS favorece desenfoque y checkerboard, y solo la perdida adversarial empuja hacia detalle nitido y plausible sin artefactos obvios; su hipotesis es que el VAE original de Qwen-Image-2.1 se entreno sin un termino adversarial funcional. La figura citada en la model card procede del articulo de DC-AE (Chen et al., 2024, arXiv:2410.10733) e ilustra el efecto del termino adversarial.

## Capacidades

- Decodificacion de latentes a imagen dentro del pipeline `QwenImage21Pipeline` de Diffusers, sustituyendo al VAE original sin cambios en el resto del pipeline.
- Generacion de texturas mas limpias y sin artefactos de tablero de ajedrez, especialmente visible en imagenes detalladas de estilo fotografico.
- Compatibilidad directa con ComfyUI mediante el nodo `Load VAE`, colocando el fichero en `ComfyUI/models/vae/`.
- Interoperabilidad con el espacio latente original: al no reentrenarse el encoder, los latentes generados por Qwen-Image-2.1 siguen siendo validos.
- Uso tanto en generacion texto-a-imagen como en edicion de imagen, ya que Qwen-Image-2.1 es un modelo unificado de ambas tareas y comparte el mismo VAE.
- No dispone de soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues ni modos de pensamiento: es un componente puramente visual.
- No se documentan capacidades de vision de alto nivel (captioning, VQA, OCR) ni procesamiento de audio.

## Casos de uso

- Generacion fotorrealista de paisajes y naturaleza: el propio autor indica que la mejora se aprecia mas en imagenes detalladas de estilo fotografico; se usaria el VAE como decodificador final en prompts de escenas con vegetacion densa, roca o agua, donde el checkerboard del VAE original resulta mas visible.
- Sustitucion directa en produccion con ComfyUI: descargar `texture_fix_vae_for_qwen_image_2.1_bf16.safetensors` en `ComfyUI/models/vae/` y seleccionarlo en el nodo `Load VAE` en lugar de `qwen_image_2.1_vae_bf16.safetensors`, sin tocar el resto del grafo ni los checkpoints.
- Pipelines programaticos con Diffusers: instanciar `AutoencoderKLQwenImage21.from_pretrained(..., torch_dtype=torch.bfloat16)` y pasarlo como argumento `vae` a `QwenImage21Pipeline.from_pretrained("Qwen/Qwen-Image-2.1", vae=vae)`, integrandolo en servicios de generacion por lotes.
- Edicion de imagen e inpainting de alta frecuencia: al compartir el espacio latente con el modelo original, se puede usar en tareas de edicion donde el detalle reconstruido importa mas que la fidelidad pixel a pixel.
- Evaluacion comparativa de autoencoders: sirve como referencia practica para estudiar el efecto del termino adversarial en la calidad perceptual, gracias a las metricas rFID, PSNR y LPIPS publicadas sobre COCO val2017 y DIV2K valid.
- Investigacion sobre recetas de entrenamiento de VAEs: el modelo es un caso reproducible de aplicacion de la receta TAESD (MSE/MAE + LPIPS + GAN) a un VAE de difusion de alta resolucion, con solo 7.5 M parametros entrenables.
- Ajuste de decodificadores sobre VAEs existentes: la tecnica de congelar todo excepto las dos etapas de mayor resolucion y la cabeza de salida es directamente reutilizable para adaptar otros VAEs con coste de computo reducido.
- Auditoria de calidad en lotes generados: al mejorar el rFID de 3.37 a 2.08 en COCO val2017, resulta util cuando la metrica de aceptacion del pipeline es perceptual y no de reconstruccion exacta.

## Benchmarks y rendimiento

Los unicos datos de evaluacion publicados en la informacion disponible son las metricas de reconstruccion del VAE, no benchmarks de modelos de lenguaje. En rFID (menor es mejor) el ajuste mejora; en PSNR y LPIPS (fidelidad de reconstruccion) empeora ligeramente, lo que es coherente con la introduccion de detalle generado por la perdida adversarial.

| Metrica | Qwen-Image-2.1-VAE | Texture-Fix-VAE-for-Qwen-Image-2.1 |
|---|---|---|
| rFID (menor mejor), COCO val2017, 5000 imagenes a 256² | 3.37 | 2.08 |
| PSNR (mayor mejor), COCO val2017 a 256² | 33.30 | 32.86 |
| LPIPS (menor mejor), COCO val2017 a 256² | 0.0357 | 0.0373 |
| PSNR (mayor mejor), DIV2K valid, recortes nativos a 1024² | 32.86 | 32.46 |
| LPIPS (menor mejor), DIV2K valid, recortes nativos a 1024² | 0.0460 | 0.0480 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningun otro benchmark de lenguaje en la informacion disponible, y no serian aplicables a este componente.

## Requisitos de hardware

- Peso del modelo en bf16: aproximadamente 0.68 GB para 337.740.404 parametros; el repositorio ocupa 2.0 GB, presumiblemente por incluir tambien la version en otro precision.
- El VAE en si cabe con holgura en cualquier GPU de consumo con 4 GB o mas de VRAM; el cuello de botella real es el pipeline completo de Qwen-Image-2.1, que incluye un DiT de 7B parametros y el codificador de texto Qwen3-VL-8B.
- VRAM estimada para el pipeline completo: depende de la resolucion de salida y del uso de offloading; no hay cifras publicadas en la informacion disponible para este VAE.
- GPUs recomendadas: no hay recomendaciones publicadas especificas para este VAE. Para el pipeline completo se requiere una GPU de gama alta (por ejemplo, A100, H100 o RTX 4090) si no se aplica offloading de componentes.
- Cabe en GPU de consumo: el VAE si; el pipeline completo solo con tecnicas de offloading o cuantizacion de los otros componentes, dato no especificado en la informacion disponible.
- Opciones de despliegue: Diffusers (`QwenImage21Pipeline` + `AutoencoderKLQwenImage21`), ComfyUI (nodo `Load VAE`), y `stable-diffusion.cpp`, que documenta soporte para Qwen Image 2.1.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Texture-Fix-VAE-for-Qwen-Image-2.1 | VAE (decodificador ajustado) | 337.740.404 | Decodificacion de latentes con texturas limpias | qwen-research (no comercial) | HuggingFace, 29 descargas, 12 likes |
| Qwen-Image-2.1-VAE (original) | VAE | ~337.7 M | Decodificacion de latentes estandar | qwen-research | Incluido en el repositorio de Qwen/Qwen-Image-2.1 |
| TAESD (recipe origen) | Autoencoder destilado | no disponible en la informacion | Decodificacion rapida de latentes | no disponible en la informacion | Repositorio `madebyollin/taesd` |
| Qwen-Image 2.1 Fix LoRA | LoRA de correccion | no disponible en la informacion | Corregir colores lavados y textura fina rota, con flujo de ComfyUI de 20 pasos | no disponible en la informacion | Comunidad, documentado en comfyui-wiki |

La diferencia clave frente al VAE original es el rFID (2.08 frente a 3.37 en COCO val2017 a 256²), a cambio de un PSNR y LPIPS ligeramente peores. Frente a la aproximacion de la comunidad basada en LoRA, este modelo actua en la etapa de decodificacion y no en la de generacion, por lo que ambos enfoques no son mutuamente excluyentes, aunque no se dispone de datos que comparen su efecto combinado.

## Limitaciones y advertencias

- Licencia qwen-research (Qwen Research License Agreement): uso exclusivamente no comercial y de investigacion. No se puede emplear en productos comerciales sin autorizacion del titular de los derechos (Hangzhou Tongyi Laboratory Technology Co., Ltd.).
- Es un ajuste fino no oficial: no esta respaldado ni publicado por el equipo de Qwen, y la model card lo etiqueta explicitamente como "an unofficial finetune".
- Degrada ligeramente las metricas de reconstruccion: PSNR baja de 33.30 a 32.86 y LPIPS sube de 0.0357 a 0.0373 en COCO val2017 a 256²; en DIV2K valid a 1024², PSNR baja de 32.86 a 32.46 y LPIPS sube de 0.0460 a 0.0480. No es una mejora universal.
- Introduce detalle sintetico plausible pero no necesariamente fiel al latente original; en aplicaciones forenses, medicas o de reconstruccion exacta esto puede ser inaceptable.
- Solo se ajustaron 7.5 M parametros de las dos etapas de mayor resolucion y la cabeza de salida; cualquier limitacion del encoder y del resto del decodificador del VAE original permanece.
- No procesa texto: no tiene sesgos linguisticos, pero hereda los sesgos visuales y de dominio del VAE y del modelo base, que no se documentan en la informacion disponible.
- Los datos de evaluacion se limitan a COCO val2017 (256²) y DIV2K valid (1024²); no hay validacion publicada en otros dominios como ilustracion, anime, texto renderizado o imagenes medicas.
- El conjunto de datos de ajuste fino no se detalla, por lo que no es posible evaluar la cobertura o posibles sesgos de los datos de entrenamiento.
- Requiere el pipeline completo de Qwen-Image-2.1 para ser util; su licencia y restricciones se heredan del modelo base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/madebyollin/texture-fix-vae-for-qwen-image-2.1
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio GitHub de Qwen-Image-2.1: https://github.com/QwenLM/Qwen-Image-2.1
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- Repositorio de la receta TAESD: https://github.com/madebyollin/taesd
- Articulo de DC-AE (Chen et al., 2024): https://arxiv.org/abs/2410.10733
- Documentacion de Qwen Image 2.1 en stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/qwen_image_2.1.md
- Noticia sobre Qwen-Image 2.1 Fix LoRA en ComfyUI: https://comfyui-wiki.com/en/news/2026-09-23-qwen-image-2-1-fix
- Ficha de Qwen Image 2.1 en Civitai: https://civitai.com/models/2954443/qwen-image-21
