# PedroMarinhoDev/NitroFusion2-ComfyUI

## Resumen

NitroFusion2-ComfyUI es un paquete de pesos cuantizados del modelo de difusion texto-a-imagen NitroFusion2, desarrollado originalmente por Dar-Yen Chen y Yi-Zhe Song. La contribucion de este repositorio, publicado por PedroMarinhoDev, es ofrecer tres variantes comprimidas (int8, W6A8 y W4A8) que funcionan en ComfyUI estandar sin nodos personalizados, empleando los kernels de cuantizacion nativos de ComfyUI. NitroFusion2 es a su vez una destilacion de 1-2 pasos del modelo Z-Image-Turbo, de modo que la generacion se completa en una o dos evaluaciones del sampler en lugar de las decenas habituales en modelos de difusion convencionales.

El modelo resuelve el problema de desplegar generacion de imagenes de alta calidad en hardware de consumo: reduce el peso de 12,31 GB (bf16) a 3,49 GB en la variante W4A8 y acelera el paso del sampler de 0,50 s a aproximadamente 0,29-0,30 s en una RTX 4090, es decir, unas 1,7 veces mas rapido por paso. La arquitectura subyacente es un transformer de difusion multimodal (DiT) con 30 bloques principales y 4 bloques de refinamiento, y un total de 6.155B parametros, de los cuales 6.142B corresponden a las 202 capas lineales cuantizadas.

Es relevante ahora porque permite ejecutar un generador texto-a-imagen de un solo paso con pesos de 4-6 bits en GPUs de gama media, manteniendo composicion, rostros y texto de la version bf16 segun las comparativas visuales del autor, y todo ello bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) multimodal con 30 bloques principales y 4 bloques de refinamiento; destilacion de 1-2 pasos de Z-Image-Turbo |
| Parametros totales | 6.155B (6.142B en capas lineales cuantizadas) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; el contexto lo determina el text encoder Qwen3-4B) |
| Tipos de cuantizacion | int8 (ConvRot), W6A8 (6 bits pesos / 8 bits activaciones), W4A8 (4 bits pesos / 8 bits activaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (tres archivos en `diffusion_models/`) |

## Arquitectura y entrenamiento

NitroFusion2 es un transformer de difusion multimodal construido sobre Z-Image-Turbo (Tongyi-MAI) y entrenado con una perdida adversarial aplicada al flujo de texto, segun el paper arXiv 2611.05648. El modelo se destila para operar en uno o dos pasos de muestreo, lo que elimina la necesidad de decenas de evaluaciones del UNet. Consta de 30 bloques principales y 4 bloques de refinamiento; las 202 capas lineales de esos bloques (qkv y salida de atencion, las tres capas feed-forward y adaLN) suman 6.142B de los 6.155B parametros totales. Los embedders, las normalizaciones y la capa final permanecen en bf16.

Los pesos de este repositorio son una conversion directa con los formatos de cuantizacion propios de ComfyUI (comfy-kitchen), sin calibracion. La variante int8 emplea ConvRot con rotacion Hadamard por bloques de 256 y una escala por fila con activaciones de 8 bits. Las variantes W6A8 y W4A8 almacenan los pesos en la base rotada con una escala FP8 por grupo de 16 y activaciones de 8 bits. El autor indica que publicara versiones calibradas con GPTQ de los mismos tres formatos. Para el modo de dos pasos se utiliza el LoRA de de-destilacion `nf2-dedistill-lora.safetensors` del publicador original.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024x1024 en uno o dos pasos de muestreo.
- Ejecucion en ComfyUI estandar con el nodo nativo Load Diffusion Model, sin nodos personalizados.
- Tres niveles de compresion intercambiables (int8, W6A8, W4A8) seleccionables en el subgrafo mediante `unet_name`.
- Compatibilidad con el LoRA de de-destilacion para el modo de dos pasos, aplicable a las tres variantes.
- Reutilizacion del text encoder Qwen3-4B (`qwen_3_4b.safetensors`) y del VAE (`ae.safetensors`) de Z-Image-Turbo.
- Preservacion de composicion, rostros y texto respecto a bf16 segun las comparativas visuales del autor, con la mayor parte del error concentrada en textura fina.
- No dispone de tool calling, capacidades de agente, vision de entrada ni modo de razonamiento: es exclusivamente un modelo generativo de imagenes.

## Casos de uso

- Prototipado rapido de imagenes en ComfyUI: con un solo paso y pesos int8 (6,18 GB) se pueden iterar prompts en una RTX 4090 en torno a 0,29 s por muestra, lo que agiliza la exploracion de estilos y composiciones.
- Despliegue en GPU de consumo con VRAM limitada: la variante W4A8 (3,49 GB) permite cargar el modelo junto con el text encoder y el VAE en tarjetas de 8-12 GB, algo inviable con el bf16 de 12,31 GB.
- Generacion por lotes en pipelines automatizados: al funcionar con kernels nativos de ComfyUI y sin nodos externos, se integra en flujos headless o APIs de ComfyUI para producir imagenes en serie con baja latencia por muestra.
- Creacion de contenido para blogs y documentacion tecnica: el modelo conserva el texto renderizado en imagen segun las muestras del autor, lo que resulta util para generar ilustraciones con rotulos o carteles.
- Generacion de retratos y material grafico de referencia: las comparativas del autor muestran preservacion de rostros en las tres variantes cuantizadas, adecuado para bocetos y pruebas de concepto.
- Experimentacion en investigacion sobre cuantizacion de modelos de difusion: el repositorio documenta el error relativo de cada formato (13,4 % / 17,5 % / 33,6 % a un paso) y sirve como referencia para estudiar el impacto de la cuantizacion en destilaciones de un solo paso.
- Evaluacion comparativa de calidad frente a bf16: los flujos de ejemplo de uno y dos pasos permiten reproducir las comparativas con la misma semilla y ruido en todas las variantes.

## Benchmarks y rendimiento

Los datos disponibles son mediciones del propio autor sobre el sampler a 1024x1024 en una RTX 4090 (ComfyUI master `fb2b26fda`, comfy-kitchen 0.2.41). El error es el error relativo de la prediccion del modelo frente a bf16 para la misma entrada, promediado sobre 12 prompts y 4 muestras de ruido.

| Formato | Tamano | 1 paso, RTX 4090 | Error a 1 paso | Error a 2 pasos |
|---|---|---|---|---|
| bf16 (original) | 12,31 GB | 0,50 s | 0 | 0 |
| int8 (ConvRot) | 6,18 GB | 0,29 s | 13,4 % | 9,3 % |
| W6A8 | 5,02 GB | 0,30 s | 17,5 % | 14,0 % |
| W4A8 | 3,49 GB | 0,29 s | 33,6 % | 26,0 % |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que se trata de un modelo generativo de imagenes.

## Requisitos de hardware

- VRAM estimada para los pesos del modelo: 12,31 GB en bf16, 6,18 GB en int8, 5,02 GB en W6A8 y 3,49 GB en W4A8. A ello hay que sumar el text encoder Qwen3-4B y el VAE de Z-Image-Turbo.
- GPU de referencia en las mediciones: RTX 4090, con 0,29-0,30 s por paso en las variantes cuantizadas frente a 0,50 s en bf16.
- GPU de gama alta (A100, H100): no hay mediciones publicadas en la informacion disponible, pero por tamano caben las cuatro variantes con holgura.
- GPU de consumo: la variante W4A8 es la mas adecuada para tarjetas de 8-12 GB; int8 y W6A8 encajan en tarjetas de 12-16 GB considerando encoder y VAE.
- Despliegue: ComfyUI estandar (nodo Load Diffusion Model) con los kernels int8/W6A8/W4A8 nativos; no requiere llama.cpp, vLLM ni TGI, al no ser un modelo de lenguaje.
- Latencia y throughput: 0,29-0,30 s por paso del sampler en RTX 4090 para las tres variantes cuantizadas; el tiempo total depende del numero de pasos (uno o dos) y del resto del pipeline.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NitroFusion2-ComfyUI (este) | 6,155B | 1024x1024, 1-2 pasos | int8, W6A8, W4A8 | Apache-2.0 | Hugging Face, 0 descargas |
| NitroFusion2 (original, ChenDY) | 6,155B | 1024x1024, 1-2 pasos | bf16 (12,31 GB) | Apache-2.0 | Hugging Face |
| Z-Image-Turbo (Tongyi-MAI) | no disponible | no disponible | bf16 | no disponible en la informacion | Hugging Face / GitHub |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria en la informacion proporcionada, por lo que la comparacion se limita a parametros, tamano, licencia y disponibilidad.

## Limitaciones y advertencias

- El error relativo frente a bf16 es apreciable, especialmente en W4A8 (33,6 % a un paso): casi todo el error se concentra en textura fina, pero puede ser perceptible en imagenes con detalle fino.
- El autor advierte explicitamente que las cifras de error sirven para ordenar los tres archivos entre si, no para comparar con otros modelos.
- La cuantizacion se realizo sin calibracion; las versiones calibradas con GPTQ estan anunciadas pero no disponibles en el momento de la publicacion.
- Las predicciones de un solo paso desde ruido puro son sensibles a pequenos cambios en los pesos, lo que hace que las variantes cuantizadas se desvien mas que en el modo de dos pasos.
- No hay informacion sobre sesgos, idiomas soportados ni calidad multilingue del text encoder en la model card.
- Riesgo de alucinacion visual: como todo modelo generativo de imagenes, puede producir contenido incoherente, texto mal renderizado o artefactos, especialmente en las variantes mas comprimidas.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validacion de la comunidad.
- Requiere descargar por separado el text encoder y el VAE desde los repositorios de Comfy-Org, ademas del LoRA de de-destilacion para el modo de dos pasos.
- La licencia Apache-2.0 permite uso comercial, pero deben respetarse las atribuciones indicadas en el archivo NOTICE y la licencia del modelo base.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/PedroMarinhoDev/NitroFusion2-ComfyUI
- Modelo base NitroFusion2: https://huggingface.co/ChenDY/NitroFusion2
- Pesos bf16 originales: https://huggingface.co/ChenDY/NitroFusion2/blob/main/nf2-bf16.safetensors
- LoRA de de-destilacion: https://huggingface.co/ChenDY/NitroFusion2/resolve/main/nf2-dedistill-lora.safetensors
- Text encoder Qwen3-4B (Comfy-Org): https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/text_encoders/qwen_3_4b.safetensors
- VAE (Comfy-Org): https://huggingface.co/Comfy-Org/z_image_turbo/resolve/main/split_files/vae/ae.safetensors
- Repositorio Z-Image (Tongyi-MAI): https://github.com/Tongyi-MAI/Z-Image
- Paper arXiv 2611.05648: https://arxiv.org/abs/2611.05648
