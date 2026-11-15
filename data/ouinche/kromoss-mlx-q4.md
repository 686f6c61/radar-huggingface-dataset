# Ouinche/kromoss-mlx-q4

## Resumen

Kromoss MLX Q4 es una cuantizacion de 4 bits en formato MLX del modelo de generacion de imagenes Kromoss 5B, un fine-tune de MOSS-Image-SFT desarrollado por OpenMOSS. El paquete lo publica Ouinche (DiffusionBear) y esta especificamente orientado a Macs con Apple Silicon de 16 GB de memoria unificada, un segmento donde los modelos de difusion de gran tamano suelen quedar fuera de alcance por falta de VRAM.

El modelo resuelve el problema de ejecutar un transformer de difusion (DiT) de 5.000 millones de parametros en hardware de consumo Apple. La cuantizacion affine de 4 bits con `group_size=64` reduce el transformer de 10,16 GB en BF16 a 2,66 GiB, y el pack completo ocupa unos 4,02 GiB. Se apoya en un text encoder Qwen 3.5 compartido y cuantizado a 8 bits que se descarga aparte (unos 10 GB).

La relevancia actual esta en que permite text-to-image de calidad con solo 8 pasos de inferencia gracias a un LoRA DMD2 de rango 128 incluido, y en que se integra de forma nativa en la aplicacion DiffusionBear para macOS. La licencia Apache 2.0 facilita su uso comercial, aunque el rendimiento medido en un M1 de 16 GB es lento (unos 148 segundos por imagen a 512x768).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) sobre MOSS-Image, con VAE FLUX.2 (`AutoencoderKLFlux2`, decoder de 4 canales `[96,192,384,384]`) y text encoder Qwen 3.5 |
| Parametros totales | 5B (transformer DiT) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit affine, `group_size=64` (transformer); text encoder MLX Q8 `group_size=64`; VAE en BF16 |
| Idiomas soportados | en, zh, fr |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura MOSS-Image: un transformer de difusion (DiT) de 5B parametros que opera sobre latentes producidos por un VAE FLUX.2, condicionado por un text encoder Qwen 3.5 con plantilla de chat. El scheduler es FlowMatch con `shift=5.0` y `training_shift=1.0`. Kromoss es un fine-tune de MOSS-Image-SFT publicado por lodestones; la model card no detalla la composicion del dataset de entrenamiento ni el numero de tokens o imagenes utilizadas.

La innovacion practica del paquete es doble. Por un lado, la cuantizacion MLX 4-bit affine con grupo de 64 reduce el peso del DiT de 10,16 GB a 2,66 GiB manteniendo el VAE en BF16 para preservar calidad de reconstruccion. Por otro, incorpora un LoRA DMD2 de rango 128 (`8-steps-dmd2-lora.safetensors`, 1,11 GiB) que permite generar en 8 pasos con CFG 1.0, frente a los 50 pasos con CFG 3.0 del modo estandar sin LoRA. El text encoder se distribuye como repositorio hermano compartido para evitar descargas redundantes de 10-19 GB.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por prompts en ingles, chino y frances.
- Generacion rapida en 8 pasos mediante el LoRA DMD2 incluido (CFG 1.0).
- Generacion de mayor calidad en 50 pasos sin LoRA (CFG 3.0).
- Control de semilla para reproducibilidad (el ejemplo documentado usa seed 1003).
- Soporte de resoluciones no cuadradas, como 512x768 en el ejemplo verificado.
- Tipografia y elementos de texto dentro de la imagen (el ejemplo incluye un titulo "KROMOSS" renderizado).
- Integracion nativa con la GUI DiffusionBear en macOS y reutilizacion del text encoder Qwen 3.5 Q8 compartido.
- No se documenta soporte de tool calling, agentes, vision de entrada ni audio; es un modelo exclusivamente de generacion de imagenes.

## Casos de uso

- Ilustracion editorial y botanica: el modelo esta verificado con prompts de laminas botanicas vintage con linework de tinta y acuarela; adecuado para generar ilustraciones de estilo editorial en local sin depender de servicios en la nube.
- Prototipado de conceptos en Mac: un disenador con un Mac de 16 GB puede iterar prompts y semillas en DiffusionBear sin GPU dedicada, usando el modo de 8 pasos para exploracion rapida.
- Generacion de assets para juegos indie: texturas, ilustraciones de cartas o fondos a 512x768 con control de semilla, integrables en pipelines de assets 2D.
- Creacion de contenido multilingue: al soportar en, zh y fr, permite generar imagenes a partir de prompts en estos idiomas para mercados o campanas localizadas.
- Maquetas con texto integrado: la capacidad de renderizar titulos tipograficos permite generar portadas, posters o mockups preliminares con texto en la propia imagen.
- Automatizacion de catalogos visuales: mediante descarga standalone con `hf download` e inferencia MLX por etapas (`te -> dit -> vae`), se puede integrar en scripts por lotes para generar variaciones de producto o ilustraciones.
- Experimentacion en investigacion: el stack MLX puro y la separacion por etapas facilitan medir latencia y memoria por componente en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (FID, CLIP score, MMLU u otros) en la informacion disponible. El unico dato de rendimiento medido es el siguiente:

| Metrica | Valor |
|---|---|
| Hardware | MacBook Pro M1, 16 GB memoria unificada |
| Resolucion | 512 x 768 |
| Pasos | 8 (LoRA DMD2, scale 1.0) |
| CFG | 1.0 |
| Seed | 1003 |
| Tiempo de generacion | 148,65 s |
| Tiempo de carga del modelo | 4,76 s |
| Ejecucion | MLX puro por etapas (`te -> dit -> vae`) |

## Requisitos de hardware

- Memoria unificada: el pack del modelo ocupa unos 4,02 GiB; sumado al text encoder Qwen 3.5 Q8 (~10,0 GB) el total ronda los 14 GB, por lo que encaja en Macs de 16 GB con ejecucion por etapas.
- GPU recomendadas: Apple Silicon (serie M1 y posteriores). El ejemplo verificado usa un M1 de 16 GB. No se documenta soporte para GPU NVIDIA ni CUDA.
- Cabe en GPU de consumo: si, en Macs con memoria unificada de 16 GB o superior. No aplica a GPUs discretas por el formato MLX.
- Opciones de despliegue: DiffusionBear (GUI para macOS) como via nativa; inferencia MLX standalone descargando con `hf download` los repositorios `Ouinche/kromoss-mlx-q4` y `Ouinche/moss-image-qwen3.5-te-mlx-q8g64`. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a difusion MLX en este formato).
- Latencia y throughput: 148,65 s por imagen a 512x768 en 8 pasos sobre M1 de 16 GB; no se proporcionan datos para otros chips (M2, M3, M4) ni para el modo de 50 pasos.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la informacion proporcionada para establecer una comparativa cuantitativa fiable. Como referencias cualitativas del mismo ecosistema:

| Modelo | Parametros | Contexto/Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kromoss MLX Q4 (este) | 5B (DiT) | resolucion no fijada, ejemplo 512x768 | Apache 2.0 | Hugging Face, MLX, macOS |
| lodestones/Kromoss (BF16) | 5B (DiT) | no disponible | Apache 2.0 | Hugging Face |
| OpenMOSS-Team/MOSS-Image-SFT | no disponible | no disponible | Apache 2.0 | Hugging Face |

No disponible para comparar con alternativas como FLUX.1, SDXL u otros modelos de difusion, al no incluirse sus datos en la informacion de referencia.

## Limitaciones y advertencias

- Rendimiento lento en hardware modesto: casi 2,5 minutos por imagen a 512x768 en un M1 de 16 GB; no apto para generacion interactiva de alta frecuencia en ese equipo.
- Dependencia de un text encoder externo de ~10 GB: sin el repositorio hermano `Ouinche/moss-image-qwen3.5-te-mlx-q8g64` el modelo no funciona; el consumo total de memoria y disco es muy superior al del pack de 4 GiB.
- Solo Apple Silicon: el formato MLX no es portable a CUDA ni a CPU generica sin conversion.
- Cobertura linguistica limitada a en, zh y fr; el rendimiento en otros idiomas no esta documentado.
- Riesgo de alucinacion visual y de texto mal renderizado: la generacion de tipografia dentro de la imagen puede producir errores, y no se documentan evaluaciones de fidelidad al prompt.
- Sesgos no evaluados: la model card no incluye analisis de sesgos demograficos, estilisticos ni de contenido; se desconoce la composicion del dataset de entrenamiento.
- Cuantizacion de 4 bits: puede degradar el detalle fino frente al modelo BF16 original; no se publican comparativas de calidad Q4 frente a BF16.
- Uso comercial permitido por Apache 2.0, pero requiere mantener los avisos de atribucion de `NOTICE` y las licencias de los componentes upstream (Kromoss, MOSS-Image, Qwen 3.5).
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: ecosistema y validacion comunitaria muy limitados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Ouinche/kromoss-mlx-q4
- Text encoder compartido: https://huggingface.co/Ouinche/moss-image-qwen3.5-te-mlx-q8g64
- Modelo base Kromoss: https://huggingface.co/lodestones/Kromoss
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Tokenizer Qwen 3.5: https://huggingface.co/Qwen/Qwen3.5-9B
- DiffusionBear GitHub: https://github.com/OuincheWinch/DiffusionBear
- DiffusionBear website: https://www.diffusionbear.com
