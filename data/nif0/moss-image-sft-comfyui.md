# nif0/MOSS-Image-SFT-ComfyUI

## Resumen

MOSS-Image-SFT-ComfyUI es una reempaquetado cuantizado del modelo de difusion texto-a-imagen OpenMOSS-Team/MOSS-Image-SFT, publicado por el usuario comunitario nif0. No es un modelo nuevo: se trata de una version de pesos reducidos lista para cargar de forma directa en ComfyUI, con el objetivo de bajar los requisitos de memoria sin alterar la composicion, el estilo ni el texto renderizado que genera el modelo original. La licencia se mantiene en Apache-2.0, igual que el modelo base, y el autor declara explicitamente que no esta afiliado a OpenMOSS.

El paquete incluye tres componentes. El diffusion transformer (DiT) de 42 bloques se cuantiza a INT8 ConvRot, pasando de 10,16 GB en bf16 a 5,41 GB. El text encoder, un Qwen3.5-9B, se comprime a W4A8 (pesos de 4 bits, activaciones de 8 bits) mediante GPTQ en base rotada, bajando de 16,79 GB a 5,43 GB. El VAE, un AutoencoderKLFlux2, se convierte simplemente de fp32 a bf16, quedando en 125 MB. El repositorio completo ocupa unos 16,4 GB.

Su relevancia ahora mismo es practica: permite ejecutar una pipeline texto-a-imagen de gama alta en GPUs de consumo. El autor ha validado el flujo completo en una RTX 3060 Ti de 8 GB, generando una imagen de 1024x1536 en 50 pasos en unos 210 segundos, con los ajustes oficiales de muestreo del modelo base (Euler, 50 pasos, CFG 3, shift 5, uncond skip-layer 22).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) de 42 bloques + text encoder Qwen3.5-9B + VAE AutoencoderKLFlux2 |
| Parametros totales | no disponible (pesos DiT: 5,41 GB INT8; text encoder: 5,43 GB W4A8) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (aplicado a generacion texto-a-imagen, no a contexto de texto) |
| Tipos de cuantizacion | INT8 ConvRot (DiT), W4A8 GPTQ ConvRot (text encoder), bf16 (VAE) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (un fichero por componente) |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: cuantiza los pesos del MOSS-Image-SFT original manteniendo su arquitectura intacta. En el DiT se cuantizan las 252 lineales de bloque (`layers.N.proj.{q,k,v,o,ffn_up_gate,ffn_down}`) a INT8 mediante una rotacion ConvRot con Hadamard de grupo de tamano 256 y escalas por canal de salida. Los embedders, la modulacion, las capas finales y las normas se mantienen en precision original para no degradar el condicionamiento. En el text encoder se cuantizan las 200 lineales del cuerpo (atencion, atencion lineal y MLP) a pesos de 4 bits con grupo 16 y escalas relativas en fp8, con activaciones de 8 bits, usando GPTQ ejecutado en la base rotada; los embeddings y la torre de vision quedan en INT8 ConvRot y el resto sin cambios. El VAE se convierte de fp32 a bf16.

La calibracion del text encoder empleo la plantilla de chat real del modelo base sobre los prompts y negativos de ejemplo oficiales mas datasets publicos de prompts. El resultado es una quantizacion pensada para ComfyUI, que requiere el soporte de operadores cuantizados de comfy-kitchen y detecta automaticamente el tipo de cuantizacion de los ficheros. No hay datos sobre el entrenamiento original (numero de tokens, composicion del dataset, si hubo RLHF/DPO) en la informacion disponible.

## Capacidades

- Generacion de imagenes texto-a-imagen a partir de prompts en ingles y chino.
- Renderizado de texto dentro de la imagen, preservado segun la comprobacion de calidad del autor.
- Control de estilo, composicion, identidad, iluminacion y estetica coherente con el modelo base.
- Soporte de prompts negativos (se usaron en la calibracion del text encoder).
- Integracion directa en ComfyUI mediante los nodos oficiales (MOSSImageUNETLoader, MOSSImageCLIPLoader, VAELoader).
- Generacion a resoluciones oficiales del modelo base, incluida 1024x1536.
- No se documentan capacidades de tool calling, agentes ni modos de razonamiento; es un modelo puramente de generacion de imagen.

## Casos de uso

- Generacion de ilustracion en estacion de trabajo de gama media: con 8 GB de VRAM es posible producir imagenes de 1024x1536 en unos 210 segundos por imagen, lo que sirve para prototipado de arte conceptual y bocetos iterativos.
- Produccion de contenido para web y redes: la cuantizacion permite desplegar la pipeline en GPUs economicas, generando composiciones con texto renderizado para banners, portadas y material promocional.
- Creacion de assets para videojuegos y animacion: el estilo anime que el autor usa como referencia de comparacion indica que el modelo mantiene la estetica original, util para generar sprites, fondos y conceptos visuales.
- Automatizacion por lotes en ComfyUI: al ser ficheros unicos cargados por nodos, se puede integrar en workflows con colas de generacion para producir grandes volumenes de imagenes con CFG 3 y 50 pasos.
- Prototipado rapido en portatiles con GPU de consumo: el footprint de ~11 GB en total (DiT + text encoder + VAE) acerca la generacion de alta fidelidad a equipos que no pueden cargar el modelo en bf16 (mas de 27 GB entre DiT y text encoder).
- Generacion bilingue de material grafico: para equipos que trabajan en ingles y chino, permite generar imagenes a partir de prompts en ambos idiomas sin cambiar de modelo.
- Test de pipelines de inferencia: util para comparar el impacto de la cuantizacion INT8/W4A8 frente al modelo original en terminos de PSNR y calidad percibida antes de decidir el despliegue en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks clasicos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, algo esperable en un modelo de generacion de imagen. El autor si documenta metricas de fidelidad de la cuantizacion:

| Comparacion | Metrica | Valor |
|---|---|---|
| VAE bf16 vs. decodificacion fp32 | PSNR | ~54 dB (visualmente identico) |
| DiT cuantizado vs. salida original | PSNR | 19-27 dB |
| Stack completo cuantizado vs. original | PSNR | 19-27 dB |
| `last_hidden_state` del text encoder vs. bf16 | Similitud coseno | ~0,996 (media sobre tokens, primer prompt de ejemplo) |

El PSNR bajo (19-27 dB) indica divergencia en detalle fino a lo largo de la trayectoria de 50 pasos, pero el autor afirma que composicion, identidad, estilo, iluminacion y texto renderizado se conservan. La comprobacion visual se limito a tres prompts.

## Requisitos de hardware

- VRAM estimada: alrededor de 11 GB sumando los tres componentes cuantizados (5,41 GB DiT + 5,43 GB text encoder + 0,125 GB VAE), mas overhead de activaciones; con gestion de memoria de ComfyUI cabe en 8 GB.
- El autor ha validado el flujo completo en una RTX 3060 Ti de 8 GB (unos 210 s para 1024x1536 a 50 pasos).
- GPUs recomendadas: cualquier GPU con 8 GB o mas; en gama consumer, RTX 3060 Ti, RTX 3070, RTX 4060/4070/4080/4090. En gama profesional, A100, H100 o similares para generacion por lotes y mayor throughput.
- Cabe en GPU de consumo: si, confirmado en RTX 3060 Ti de 8 GB.
- Opciones de despliegue: ComfyUI con el node pack oficial de MOSS-Image y comfy-kitchen (deteccion automatica de cuantizacion). Los ficheros van en `models/diffusion_models/`, `models/text_encoders/` y `models/vae/`.
- Latencia: ~210 s por imagen a 1024x1536 y 50 pasos en RTX 3060 Ti; no se proporcionan datos de throughput en otras GPUs.

## Comparativa con modelos similares

No se proporcionan datos de rendimiento comparativo frente a otros modelos texto-a-imagen, por lo que la comparativa cuantitativa no esta disponible. Cualitativamente, se puede situar respecto a las dos variantes del propio modelo base:

| Modelo | Formato | Tamano | Licencia | Disponibilidad |
|---|---|---|---|---|
| nif0/MOSS-Image-SFT-ComfyUI | INT8 + W4A8 + bf16 | 5,41 GB + 5,43 GB + 0,125 GB | Apache-2.0 | HuggingFace, listo para ComfyUI |
| OpenMOSS-Team/MOSS-Image-SFT | bf16 (original) | 10,16 GB + 16,79 GB (+ VAE) | Apache-2.0 | HuggingFace, pipeline diffusers |
| OpenMOSS-Team/MOSS-Image-Base | no disponible | no disponible | Apache-2.0 | HuggingFace |

La ventaja principal de la version cuantizada es el menor consumo de memoria y la integracion en ComfyUI; frente a otros modelos de generacion de imagen de la misma categoria no hay datos comparativos publicados en la informacion disponible.

## Limitaciones y advertencias

- La cuantizacion introduce divergencia en detalle fino: el PSNR frente a la salida original es de 19-27 dB a lo largo de los 50 pasos, aunque el autor afirma que se preservan composicion, identidad, estilo e iluminacion.
- La comparacion visual se limito a tres prompts, por lo que no hay garantia de que el comportamiento se mantenga en todo el espacio de prompts.
- El modelo original recomienda un VAE en fp32; la version bf16 puede producir banding en algunos casos, y el autor sugiere volver a fp32 como opcion mas segura si aparece.
- Los resultados en el sampler de ComfyUI no coincidiran pixel a pixel con la pipeline diffusers.
- Idiomas soportados limitados a ingles y chino.
- Repositorio comunitario no oficial: no esta afiliado a OpenMOSS y no ofrece soporte oficial.
- Licencia Apache-2.0, permite uso comercial, pero conviene verificar las condiciones del modelo base original y atribuir correctamente a OpenMOSS-Team.
- Riesgo de alucinacion visual (artefactos, texto mal renderizado o composiciones incoherentes) inherente a modelos generativos; no se documentan sesgos especificos, pero al no haber datos no se pueden descartar.
- Requiere el node pack oficial de MOSS-Image y comfy-kitchen con soporte de operadores cuantizados; sin ellos la carga de los ficheros no funcionara.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/nif0/MOSS-Image-SFT-ComfyUI
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Codigo y documentacion: https://github.com/OpenMOSS/MOSS-Image
- Guia de ComfyUI de MOSS-Image: https://github.com/OpenMOSS/MOSS-Image/blob/main/comfyui/README.md
- comfy-kitchen (soporte de operadores cuantizados): https://github.com/Comfy-Org/comfy-kitchen
- Informe tecnico (PDF): https://github.com/OpenMOSS/MOSS-Image/blob/main/paper/MOSS_Image_Technical_Report.pdf
