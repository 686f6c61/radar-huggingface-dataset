# madebyollin/texture-fix-vae-for-qwen-image-2.1

## Resumen

Texture-Fix-VAE-for-Qwen-Image-2.1 es un ajuste fino (finetune) no oficial del VAE del modelo de difusion Qwen-Image-2.1, desarrollado por el usuario independiente madebyollin. No es un modelo generativo autonomo, sino un componente de codificacion y decodificacion latente que sustituye al VAE original dentro del pipeline de Qwen-Image-2.1. Su proposito es corregir dos defectos concretos del VAE oficial: la aparicion de artefactos de tablero de ajedrez (checkerboard artifacts) en texturas detalladas y la generacion de valores NaN cuando el decodificador se ejecuta en fp16.

El modelo mantiene la arquitectura y el espacio latente del VAE original de Qwen-Image-2.1, por lo que es intercambiable de forma directa en ComfyUI y en Diffusers sin reentrenar el UNet ni el text encoder. Con 337.740.404 parametros y un repositorio de 4,1 GB, es un componente ligero en comparacion con el modelo de difusion completo, pero critico para la calidad final de la imagen decodificada.

Su relevancia actual radica en que resuelve un problema de produccion muy comun: desplegar Qwen-Image-2.1 en fp16 para ahorrar VRAM provocaba NaNs en las regiones transparentes que se propagaban al contenido adyacente. Este VAE permite usar fp16 de forma segura y, ademas, mejora la metrica perceptiva rFID de 3,38 a 2,06 sobre COCO val2017, a costa de un ligero empeoramiento en PSNR y LPIPS.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE (autoencoder convolutional) para difusion latente, compatible con Qwen-Image-2.1 |
| Parametros totales | 337.740.404 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | bf16 (fichero publicado); fp16 soportado y corregido; otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible (componente visual, sin procesamiento de lenguaje) |
| Licencia | qwen-research (license: other, license_name: qwen-research) |
| Formato de pesos | safetensors (texture_fix_vae_for_qwen_image_2.1_bf16.safetensors) |

## Arquitectura y entrenamiento

El modelo es un autoencoder variational convolutional que hereda la estructura del VAE de Qwen-Image-2.1. El ajuste fino se aplico unicamente a los bloques de mayor resolucion, entrenados brevemente con la receta adversaria desarrollada para TAESD. Esa receta combina terminos de perdida MSE/MAE orientados a PSNR, perdida LPIPS y perdida adversaria (GAN). El autor senala que, cuando los detalles precisos no se pueden reconstruir, MSE/MAE empuja hacia el desenfoque, LPIPS empuja hacia desenfoque y checkerboarding, y la perdida adversaria empuja hacia detalle nitido y plausible sin artefactos evidentes. La hipotesis del autor es que el VAE original de Qwen-Image-2.1 se entreno sin un termino de perdida adversaria funcional.

Para corregir los NaNs en fp16 se aplicaron dos tecnicas: primero, un ajuste fino de los pesos del decodificador que mantiene las salidas iguales pero reduce la magnitud de las activaciones (en la linea de SDXL-VAE-FP16-Fix); segundo, un encogimiento manual de ciertos pesos para reducir la escala del flujo residual. Como cada rama residual comienza con una RMSNorm, esta reduccion no altera las salidas. No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO, que no aplican a un VAE.

## Capacidades

- Decodificacion de latentes a imagen dentro del pipeline Qwen-Image-2.1, sustituyendo al VAE oficial.
- Codificacion de imagenes al espacio latente de Qwen-Image-2.1.
- Generacion de texturas mas limpias, sin artefactos de tablero de ajedrez, especialmente en imagenes fotograficas detalladas.
- Ejecucion estable en fp16 sin NaNs ni desbordamientos, incluidas las regiones totalmente transparentes.
- Compatibilidad con el flag `--fp16-vae` de ComfyUI.
- Integracion directa con Diffusers mediante `AutoencoderKLQwenImage21`.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues: es un componente visual, no un modelo de lenguaje.

## Casos de uso

- Generacion de imagenes fotorrealistas con Qwen-Image-2.1: al sustituir el VAE en el pipeline, las texturas de vegetacion, roca, agua y follaje se decodifican sin patrones de tablero de ajedrez, lo que mejora la percepcion de realismo en paisajes y escenas naturales.
- Despliegue en fp16 con VRAM reducida: permite ejecutar el decodificador en fp16 sin NaNs, algo critico en GPUs consumer con memoria limitada donde bf16 no es viable o es mas lento.
- Flujos de trabajo en ComfyUI: basta con colocar el safetensors en `ComfyUI/models/vae/` y seleccionarlo en el nodo `Load VAE`, sin cambiar el grafo ni el modelo de difusion.
- Pipelines de investigacion con Diffusers: se integra pasando el VAE como argumento `vae=` a `QwenImage21Pipeline.from_pretrained`, lo que permite comparar calidad de decodificacion de forma controlada.
- Produccion de imagenes con transparencias: al eliminar los NaNs en regiones transparentes, es adecuado para assets con canal alfa donde el VAE original fallaba.
- Evaluacion de metricas perceptivas: util para experimentos que priorizan rFID sobre PSNR/LPIPS, por ejemplo generacion de contenido visual orientado a percepcion humana.
- Reproduccion de resultados: al mantener el mismo espacio latente, permite redecodificar latentes ya generados sin regenerar la difusion, ahorrando computo.

## Benchmarks y rendimiento

| Metrica | Qwen-Image-2.1-VAE (bf16) | Texture-Fix-VAE (bf16) | Texture-Fix-VAE (fp16) |
|---|---|---|---|
| rFID menor es mejor (COCO val2017, 5000 imagenes a 256²) | 3,38 | 2,07 | 2,06 |
| PSNR mayor es mejor (COCO val2017 a 256²) | 33,29 | 32,73 | 32,79 |
| LPIPS menor es mejor (COCO val2017 a 256²) | 0,0357 | 0,0384 | 0,0380 |
| PSNR mayor es mejor (DIV2K valid, recortes nativos 1024²) | 32,85 | 32,35 | 32,40 |
| LPIPS menor es mejor (DIV2K valid, recortes nativos 1024²) | 0,0460 | 0,0490 | 0,0486 |

La model card incluye ademas una tabla de estabilidad numerica en fp16 (encoder y decoder en fp16) que compara la mayor activacion del decodificador frente al maximo representable en fp16 (65.504); el dato numerico de esa tabla aparece truncado en la informacion disponible, por lo que no se reproduce aqui.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un VAE de unos 338 millones de parametros, el peso en bf16 ocupa aproximadamente 0,68 GB; con activaciones y buffers de decodificacion a resoluciones altas (1024²) el consumo adicional es moderado, aunque no se ha publicado una cifra oficial de VRAM pico.
- GPU recomendadas: cualquier GPU con soporte de bf16 o fp16 y al menos 4-8 GB de VRAM libres para el componente VAE; se usa junto al modelo de difusion completo, que domina el consumo total.
- Cabe en GPU consumer: si, en tarjetas como RTX 3060, 4060 Ti, 4070, 4080 y 4090, siempre que el pipeline completo de Qwen-Image-2.1 quepa en memoria.
- Opciones de despliegue: ComfyUI (nodo `Load VAE`, compatible con `--fp16-vae`) y Diffusers (`AutoencoderKLQwenImage21`). No se mencionan integraciones con vLLM, llama.cpp ni Ollama, que no aplican a un VAE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Texture-Fix-VAE-for-Qwen-Image-2.1 | 337.740.404 | VAE para Qwen-Image-2.1, corrige checkerboard y NaNs en fp16 | qwen-research | Hugging Face, diffusers, ComfyUI |
| Qwen-Image-2.1 VAE (original) | no disponible en la informacion | VAE oficial de Qwen-Image-2.1 | qwen-research | Incluido en Qwen/Qwen-Image-2.1 |
| Texture-Fix-VAE-for-Qwen-Image-1-and-Krea-2 | no disponible en la informacion | VAE equivalente para Qwen Image (1), Qwen Image Edit y Krea 2 | no disponible | Hugging Face |
| SDXL-VAE-FP16-Fix | no disponible en la informacion | VAE de SDXL corregido para fp16 | no disponible | Hugging Face |

## Limitaciones y advertencias

- No es un modelo generativo autonomo: solo funciona como componente del pipeline Qwen-Image-2.1 y no es compatible con Qwen Image (1), Qwen Image Edit ni Krea 2 (para esos existe otro repositorio del mismo autor).
- El ajuste fino empeora ligeramente la precision de reconstruccion: PSNR baja de 33,29 a 32,73 en COCO y de 32,85 a 32,35 en DIV2K; LPIPS sube de 0,0357 a 0,0384 y de 0,0460 a 0,0490 respectivamente.
- La mejora es perceptiva (rFID), no de fidelidad pixel a pixel; en aplicaciones que exijan reconstruccion exacta puede no ser la opcion preferida.
- Es un finetune no oficial: no esta respaldado por Qwen y el autor lo declara explicitamente como no oficial.
- Licencia qwen-research: conviene revisar el enlace de licencia de Qwen-Image-2.1 antes de cualquier uso comercial, ya que las condiciones de la licencia de investigacion pueden restringir el despliegue productivo.
- No se han publicado datos sobre sesgos, alucinacion o comportamiento multilingue porque el modelo no procesa lenguaje.
- Solo se publica un fichero en bf16; no hay cuantizaciones adicionales documentadas, lo que limita opciones de optimizacion mas alla de fp16.
- El autor reconoce que la causa raiz del checkerboard es una hipotesis (falta de perdida adversaria en el entrenamiento original), no un diagnostico confirmado por Qwen.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/madebyollin/texture-fix-vae-for-qwen-image-2.1
- Modelo base Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia de Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1/blob/main/LICENSE
- VAE de Qwen-Image-2.1: https://huggingface.co/Qwen/Qwen-Image-2.1/tree/main/vae
- Texture-Fix-VAE para Qwen Image (1) y Krea 2: https://huggingface.co/madebyollin/texture-fix-vae-for-qwen-image-1-and-krea-2
- Repositorio TAESD: https://github.com/madebyollin/taesd
- SDXL-VAE-FP16-Fix: https://huggingface.co/madebyollin/sdxl-vae-fp16-fix
- Paper DC-AE (Chen et al., 2024): https://arxiv.org/abs/2410.10733
- Script de demostracion fp16: https://huggingface.co/madebyollin/texture-fix-vae-for-qwen-image-2.1/blob/main/fp16_demo.py
