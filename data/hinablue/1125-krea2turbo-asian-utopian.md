# hinablue/1125-Krea2Turbo-Asian-Utopian

## Resumen

1125 - Krea2 Turbo Asian Utopian es un modelo de difusion derivado de Krea 2 Turbo, especializado en retratos de mujeres asiaticas con enfasis en expresion facial, pose, textura de piel y detalle de materiales. Lo desarrolla el usuario hinablue y se distribuye como un fine-tune con LoRA fusionado sobre la base Krea-2-Turbo, en la version v5.0-R4. El repositorio incluye dos pesos completos cuantizados (INT8 ConvRot y NVFP4) y una LoRA independiente (AsianMix v6.0-R4, rank 32, alpha 32) para usar sobre el Turbo original.

El modelo resuelve un nicho concreto: generar retratos asiaticos con una estetica mas realista y menos "filtrada" que la base, incorporando textura de piel y detalle material. La version R4 se construye mediante fusion de pesos: primero se integra la LoRA AsianMix v6.0-R4 con fuerza 0.9 sobre Turbo, se mezcla con la version v4.0 al 0.6/0.4 y se anade de nuevo la LoRA con fuerza 0.24. La LoRA se entreno con 4.420 imagenes descritas por nacionalidad y etnia, 2 epochs y 15.320 pasos.

Es relevante para quien necesite un modelo text-to-image de retrato listo para ComfyUI con pesos ya fusionados (sin cargar LoRA adicional) y con opciones de cuantizacion agresiva (NVFP4 de 7,98 GiB) para GPUs con VRAM limitada. El pipeline es text-to-image y el modelo base es un modelo de difusion destilado de 8 pasos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (derivado de Krea-2-Turbo); no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen); resolucion de trabajo aproximada 1K-2K segun la base Turbo |
| Tipos de cuantizacion | INT8 ConvRot (13,00 GiB) y NVFP4 (7,98 GiB); no se incluyen BF16, INT4 generico ni GGUF completos |
| Idiomas soportados | no disponible (prompts; el modelo base usa un text encoder Qwen3-VL 4B) |
| Licencia | krea-2-community-license (license: other) |
| Formato de pesos | safetensors (INT8 ConvRot y NVFP4), mas LoRA safetensors (223,84 MiB) |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Krea-2-Turbo, un modelo de difusion text-to-image destilado para 8 pasos. No se detalla en la informacion disponible la arquitectura interna (tipo de UNet/DiT, atencion, etc.). El text encoder asociado en el flujo de ComfyUI es `qwen3vl_4b_fp8_scaled.safetensors` (Qwen3-VL 4B en FP8) y el VAE es `qwen_image_vae.safetensors`.

El entrenamiento de la LoRA AsianMix v6.0-R4 uso un set de 1.105 imagenes nuevas con descripciones finas por nacionalidad y etnia (4 paises), ampliado a 4.420 muestras de entrenamiento, durante 2 epochs y 15.320 pasos. La LoRA resultante se compone con la AsianMix v5.5-X (pesos efectivos 0.6/0.5) y se aproxima a rank 32 mediante QR en FP64 y SVD del nucleo. La fusion de pesos se hizo en FP32. La construccion de los pesos R4 sigue la formula: A = Turbo + 0.9 * delta(LoRA v6.0-R4); v5.0 = 0.6 * v4.0 + 0.4 * A; v5.0-R4 = v5.0 + 0.24 * delta(LoRA v6.0-R4). Los dos pesos completos se cuantizaron desde la misma fuente BF16/F32, seleccionando 240 pesos para cuantizar y dejando el resto en precision original. El entrenamiento se realizo con la herramienta propia Krea2 Trainer.

## Capacidades

- Generacion de imagenes text-to-image orientada a retratos de mujeres asiaticas.
- Control de expresion facial, pose, textura de piel y detalle de materiales.
- Reduccion del efecto "piel filtrada" respecto a versiones anteriores (objetivo declarado de v4.0).
- Compatible con ComfyUI mediante flujo con UNETLoader, CLIPLoader (tipo `krea2`) y VAELoader.
- Uso como LoRA independiente sobre Krea-2-Turbo original (rank 32, alpha 32).
- Soporte de cuantizacion INT8 ConvRot y NVFP4 para inferencia con menor VRAM.
- No se documentan capacidades de tool calling, agentes, vision de entrada ni audio; es un modelo puramente generativo de imagen.

## Casos de uso

- Generacion de retratos para contenido editorial: el modelo produce retratos verticales 3:4 a ~1.6 MP con 8 pasos, adecuado para ilustracion de articulos o revistas digitales.
- Creacion de avatares y personajes para videojuegos o narrativa visual: la fusion de LoRA permite consistencia estetica en series de imagenes con el mismo estilo de piel y rostro.
- Prototipado rapido de concept art: con 8 pasos y CFG 1 se obtienen muestras en pocos segundos en GPUs consumer, util para iterar ideas antes de un render final.
- Generacion de material para redes sociales: la resolucion 3:4 y el encuadre de retrato encajan con formatos verticales; el flujo ComfyUI permite lotes automatizados.
- Fine-tuning posterior: la LoRA independiente (223,84 MiB, rank 32) sirve como punto de partida para adaptar el estilo a otras etnias o esteticas sin reentrenar el modelo completo.
- Despliegue en entornos con VRAM limitada: la variante NVFP4 (7,98 GiB) permite ejecutar el modelo en GPUs de gama media-alta con soporte NVFP4, reduciendo el coste frente a INT8 ConvRot.
- Integracion en pipelines de generacion por lotes: el formato safetensors y los flujos JSON de ComfyUI permiten automatizar la generacion con scripts y colas de trabajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los tamanos de archivo son 13,00 GiB (INT8 ConvRot) y 7,98 GiB (NVFP4); la VRAM real de inferencia es mayor e incluye text encoder (Qwen3-VL 4B en FP8), VAE, resolucion y tensores en tiempo de ejecucion. No se proporciona una cifra exacta de VRAM.
- GPU recomendadas: no disponible de forma explicita; NVFP4 requiere GPU y entorno con soporte para ese formato (tipicamente GPUs NVIDIA recientes). INT8 ConvRot requiere un loader que lo soporte.
- Cabe en GPU consumer: probablemente en GPUs con 16-24 GB para NVFP4, sujeto a soporte de formato; no confirmado en la informacion.
- Opciones de despliegue: ComfyUI (flujo oficial Krea-2 Turbo o el JSON incluido), con nodos personalizados `ResolutionSelector`, `SeedNode`, `comfyui_layerstyle`, `comfyui-kjnodes` y `Atomic-Trash/ComfyUI-ColoristFilmGrain`. La libreria declarada es diffusers, pero el repo no es un directorio `from_pretrained()` completo.
- Latencia y throughput: no disponibles. El modelo base es de 8 pasos, lo que reduce el coste frente a modelos de 20-50 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| 1125 - Krea2 Turbo Asian Utopian (este) | no disponible | ~1K-2K | Retratos asiaticos, fine-tune de Krea-2-Turbo | krea-2-community-license | Hugging Face, 0 descargas |
| Krea-2-Turbo (base) | no disponible | ~1K-2K | Text-to-image general, 8 pasos | krea-2-community-license | Hugging Face (krea/Krea-2-Turbo) |
| AsianMix LoRA (Civitai) | no aplica (LoRA) | no aplica | Estilo asiatico sobre Krea-2-Turbo | no disponible | Civitai |
| Krea-2 (no Turbo) | no disponible | no disponible | Text-to-image general | krea-2-community-license | Hugging Face / krea-ai |

No se dispone de datos de rendimiento comparativo (benchmarks) para establecer diferencias cuantitativas con alternativas.

## Limitaciones y advertencias

- Sesgos: el modelo esta entrenado especificamente para rostros asiaticos (4 nacionalidades descritas); puede producir resultados pobres o estereotipados fuera de ese dominio.
- Alucinacion visual: como modelo generativo, puede producir artefactos en manos, texto, fondos y coherencia anatomica, especialmente en resoluciones altas o composiciones complejas.
- Limitaciones de contexto/idioma: no se documentan idiomas soportados; el text encoder es Qwen3-VL 4B, pero no se garantiza calidad multilingue en los prompts.
- Licencia: krea-2-community-license (license: other); es imprescindible revisar los terminos en krea.ai/krea-2-licensing antes de uso comercial.
- Restricciones tecnicas: INT8 ConvRot y NVFP4 no son formatos genericos; requieren loaders y versiones de ComfyUI especificas. No se puede asumir compatibilidad cambiando el nombre del archivo.
- No es un directorio diffusers completo: no se puede cargar con `from_pretrained()` directamente; requiere los componentes separados (text encoder, VAE).
- La LoRA incluida no debe aplicarse sobre los pesos R4 completos (ya la tienen fusionada); hacerlo duplica el ajuste.
- El repositorio tiene 0 descargas y 0 likes, por lo que no hay validacion de la comunidad ni evidencia de robustez en produccion.
- Los pesos se cuantizaron seleccionando solo 240 tensores; el resto conserva precision original, lo que puede generar comportamiento mixto no documentado.

## Enlaces

- Hugging Face: https://huggingface.co/hinablue/1125-Krea2Turbo-Asian-Utopian
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Licencia Krea 2: https://www.krea.ai/krea-2-licensing
- Civitai (introduccion original): https://civitai.red/models/2782456/1125-krea2-asian-utopian-turboint8int4nvfp4gguf
- AsianMix LoRA en Civitai: https://civitai.red/models/2746042/krea2-turbo-asianmix-lora?modelVersionId=3130750
- Krea2 Trainer (herramienta de entrenamiento): https://github.com/hinablue/krea2-trainer
- Documentacion oficial ComfyUI Krea 2: https://docs.comfy.org/tutorials/image/krea/krea-2
- Workflow oficial Krea-2 Turbo (JSON): https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_krea2_turbo_t2i.json
- Text encoder Qwen3-VL 4B FP8: https://huggingface.co/Comfy-Org/Krea-2/blob/main/text_encoders/qwen3vl_4b_fp8_scaled.safetensors
- VAE Qwen Image: https://huggingface.co/Comfy-Org/Krea-2/blob/main/vae/qwen_image_vae.safetensors
- Repositorio oficial Krea 2: https://github.com/krea-ai/krea-2
- Nodo ComfyUI ColoristFilmGrain: https://github.com/Atomic-Trash/ComfyUI-ColoristFilmGrain
