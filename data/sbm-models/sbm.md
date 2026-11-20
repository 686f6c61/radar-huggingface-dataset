# sbm-models/sbm

## Resumen

SBM (Scalable Beckmann Maps) es una familia de generadores de imagen y de fotograma siguiente entrenados con un esquema de transporte de Beckmann auto-guiado. A diferencia de los modelos de difusion clasicos, cada checkpoint produce una imagen (o el siguiente fotograma de un video) con una unica evaluacion de red, es decir, son generadores one-step. El repositorio lo publica el usuario sbm-models en Hugging Face y el codigo de referencia vive en el repositorio GitHub tullebulle/SBM. La licencia declarada es MIT, aunque el uso de algunos artefactos depende de las condiciones de los datos y latentes subyacentes.

El paquete cubre tres frentes: generacion condicionada por clase en ImageNet 256x256 (modelos SBM-B y SBM-XL sobre latentes RAE con DINOv2-S o SD-VAE), generacion texto-a-imagen 256x256 (SBM-B y SBM-XL con TextDiT y prompts de FLAN-T5-Large congelado) y modelos de mundo para prediccion de fotograma siguiente sobre Bridge-V2 y RT-1. Los tamanos van de 254M a 815M parametros en el caso texto-a-imagen, y de 175,6M en los modelos de mundo, con latentes de 16x16x384 (RAE) o 32x32x4 (SD-VAE) para imagen y 32x32x16 (SD3-VAE) para video.

La relevancia actual esta en el coste de inferencia: al resolver la generacion en un solo paso, evita las decenas de evaluaciones tipicas de los modelos de difusion, lo que abarata el despliegue y reduce la latencia. Los FID-50k publicados en ImageNet (1,61 para SBM-XL con latente RAE) y el GenEval de 0,856 en texto-a-imagen sitúan la familia en un rango competitivo para su escala.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (DiT / TextDiT) con mapas de transporte de Beckmann auto-guiado; one-step; U-Net (DriftWorld) en los modelos de mundo |
| Parametros totales | 254M (SBM-B t2i), 669M (SBM-XL ImageNet RAE), 675M (SBM-XL/2 ImageNet SD-VAE), 815M (SBM-XL t2i), 175,6M (modelos de mundo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica; condicionamiento por prompt o por historial de 4 fotogramas) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (prompts en lenguaje natural, sin lista declarada) |
| Licencia | MIT (sujeta ademas a las condiciones de los datos y latentes: SD3 VAE bajo Stability AI Non-Commercial Research Community License; BridgeData V2 y RT-1 bajo CC BY 4.0) |
| Formato de pesos | checkpoints PyTorch `.pt` (no safetensors, no GGUF) |

## Arquitectura y entrenamiento

Los generadores de imagen son transformers DiT con variantes `/1-DH` (una sola cabeza de atencion diferencial, sobre latente RAE de DINOv2-S a 16x16x384) y `/2` (sobre latente SD-VAE a 32x32x4). El modelo texto-a-imagen emplea TextDiT con prompts codificados por FLAN-T5-Large congelado y decodificacion mediante el decoder ViT-XL del RAE. El entrenamiento se basa en transporte de Beckmann auto-guiado, un esquema que aprende un mapa determinista de ruido a dato en un unico paso, en lugar de la cadena iterativa de la difusion. Los modelos de mundo usan una U-Net de DriftWorld (175,6M) que predice el siguiente fotograma en el latente del SD3-VAE (32x32x16, 256 px) a partir de cuatro fotogramas de historial y las acciones.

Los datos de entrenamiento declarados incluyen ImageNet-1k para los modelos condicionados por clase; CC12M con recaptions de LLaVA-NeXT, BLIP3o-60k, el dataset de DALL-E 3 y ShareGPT-4o-Image para texto-a-imagen; y BridgeData V2 (CC BY 4.0) y RT-1 via Open X-Embodiment (CC BY 4.0) para los modelos de mundo. No se especifica el numero total de tokens ni si hubo RLHF o DPO; el entrenamiento es de tipo generativo supervisado con EMA de pesos (cada checkpoint guarda una copia EMA y la configuracion de entrenamiento en `meta["read"]`).

## Capacidades

- Generacion de imagen condicionada por clase en ImageNet 256x256 con un solo pase de red.
- Generacion texto-a-imagen 256x256 a partir de prompts en lenguaje natural, con encoder FLAN-T5-Large congelado.
- Prediccion de fotograma siguiente (modelo de mundo) condicionada por cuatro fotogramas de historial y acciones, sobre Bridge-V2 y RT-1.
- Variantes con y sin termino de caracteristica DINOv2 en los modelos de mundo.
- Inferencia determinista de un paso, sin muestreo iterativo ni scheduler.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declara lista de idiomas).
- Capacidades especiales: modo thinking, vision o audio no disponibles; el modelo es puramente generativo visual.

## Casos de uso

- Generacion de imagenes sinteticas a escala: al requerir una sola evaluacion de red, SBM-XL t2i permite generar lotes grandes con coste de computo muy inferior al de un modelo de difusion de calidad comparable; util para aumentar datasets de entrenamiento o para prototipado rapido.
- Aumento de datos para vision por computador: los checkpoints ImageNet 256x256 (FID 1,61 en SBM-XL RAE) sirven para generar imagenes etiquetadas por clase que amplien conjuntos pequenos en tareas de clasificacion.
- Simulacion de entornos para robotica: los modelos de mundo sobre RT-1 y Bridge-V2 predicen el siguiente fotograma dadas las acciones, lo que permite entrenar o validar politicas en un simulador aprendido antes de desplegarlas en un robot real.
- Planificacion basada en modelo: al disponer de un predictor de fotograma siguiente con SSIM de 0,880 en RT-1, se puede usar para evaluar trayectorias de accion sin ejecutarlas fisicamente.
- Prototipado de interfaces creativas: el pipeline text-to-image con prompts naturales y un solo paso encaja en herramientas interactivas donde la latencia por imagen es critica.
- Investigacion en generacion one-step: los checkpoints y el codigo de sample.py permiten reproducir los FID y GenEval publicados y comparar esquemas de transporte frente a difusion.
- Generacion condicionada por clase para benchmarks: los modelos ImageNet permiten medir FID-50k contra la referencia ADM con el cache incluido en el repositorio.

## Benchmarks y rendimiento

| Modelo | Tarea / dataset | Metrica | Resultado |
|---|---|---|---|
| SBM-XL (RAE, DiT-XL/1-DH, 669M) | ImageNet 256x256 | FID-50k | 1,61 (A100) / 1,65 (H100, H200) |
| SBM-B (RAE, DiT-B/1-DH) | ImageNet 256x256 | FID-50k | 2,79 |
| SBM-XL/2 (SD-VAE, DiT-XL/2, 675M) | ImageNet 256x256 | FID-50k | 3,56 |
| SBM-B/2 (SD-VAE, DiT-B/2) | ImageNet 256x256 | FID-50k | 5,83 |
| SBM-XL t2i (TextDiT-XL/1-DH, 815M) | GenEval | GenEval (seed 1) | 0,856 |
| SBM-XL t2i | GenEval | Media seeds 0-3 | 0,848 |
| SBM-B t2i (TextDiT-B/1-DH-t15, 254M) | GenEval | GenEval (seed 1) | 0,833 |
| SBM-B t2i | GenEval | Media seeds 0-3 | 0,826 |
| SBM-WM Bridge (DriftWorld, 175,6M) | Bridge-V2 | SSIM / PSNR / LPIPS / FID / FVD | 0,869 / 24,80 / 0,060 / 4,25 / 18,1 |
| SBM-WM Bridge + DINOv2 | Bridge-V2 | SSIM / PSNR / LPIPS / FID / FVD | 0,859 / 24,23 / 0,066 / 3,90 / 21,7 |
| SBM-WM RT-1 | RT-1 | SSIM / PSNR / LPIPS / FID / FVD | 0,880 / 26,90 / 0,057 / 4,02 / 16,2 |
| SBM-WM RT-1 + DINOv2 | RT-1 | SSIM / PSNR / LPIPS / FID / FVD | 0,872 / 26,18 / 0,065 / 3,85 / 19,7 |

## Requisitos de hardware

- VRAM estimada: los checkpoints van de 0,47 GB (SBM-B RAE) a 3,26 GB (SBM-XL t2i) en pesos; en inferencia en fp32 o fp16 el consumo adicional depende del latente y del decoder. No se publican cifras de VRAM pico.
- GPU recomendadas: los FID se reportan sobre A100, H100 y H200; el modelo cabe en GPUs de consumo con suficiente memoria, aunque no se especifica el minimo.
- Cabe en consumer GPU: probablemente si para los modelos B (0,47-1,02 GB de pesos) y los de mundo (0,70 GB); los XL (2,68-3,26 GB) requieren al menos 8-12 GB de VRAM en funcion de la precision.
- Despliegue: el codigo de referencia es `sample.py` del repositorio tullebulle/SBM (instalacion con `uv sync`). No se menciona soporte de vLLM, llama.cpp, Ollama ni TGI, que estan orientados a LLMs y no aplican a estos checkpoints.
- Latencia y throughput: no disponibles; la ventaja estructural es una unica evaluacion de red por muestra frente a las decenas de pasos de la difusion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Metrica destacada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SBM-XL (RAE) | 669M | 256x256, one-step | FID-50k 1,61 en ImageNet | MIT (con condiciones de datos) | Hugging Face, .pt |
| SBM-XL t2i | 815M | 256x256, one-step | GenEval 0,856 | MIT (con condiciones de datos) | Hugging Face, .pt |
| SBM-B t2i | 254M | 256x256, one-step | GenEval 0,833 | MIT (con condiciones de datos) | Hugging Face, .pt |
| Modelos de difusion comparables (p. ej. DiT-XL/2, SD) | no disponible en la informacion | 256x256, multi-paso | no disponible en la informacion | varía segun modelo | amplia |

No se han publicado en la informacion disponible comparaciones directas con alternativas concretas; la unica referencia de evaluacion es el cache FID de ADM incluido en el repositorio.

## Limitaciones y advertencias

- Resolucion fija de 256x256 en imagen y de 256 px en los modelos de mundo; no se declara soporte de resoluciones mayores.
- Generacion determinista de un paso: no hay control fino mediante schedulers ni guiado por CFG clasico, lo que limita el ajuste fino de la salida.
- Sesgos conocidos: no se documentan, pero los datos (ImageNet-1k, CC12M, DALL-E 3, etc.) arrastran los sesgos habituales de esos corpus.
- Riesgo de alucinacion visual: no se cuantifica; en texto-a-imagen la fidelidad al prompt esta acotada por el GenEval de 0,856 y puede fallar en composiciones complejas.
- Limitaciones de idioma: no se declara lista de idiomas soportados; el encoder FLAN-T5-Large condiciona el rango linguistico efectivo.
- Restricciones de licencia: aunque el modelo es MIT, los modelos de mundo operan en el latente del SD3 VAE, sujeto a la Stability AI Non-Commercial Research Community License, y los datos de Bridge-V2 y RT-1 son CC BY 4.0; el uso comercial debe revisarse caso por caso.
- Formato de pesos `.pt` (pickle de PyTorch), no safetensors, lo que exige precaucion al cargar checkpoints de terceros.
- No hay soporte declarado de tool calling, agentes ni cuantizacion, lo que limita su integracion en pipelines de LLM.

## Enlaces

- Hugging Face: https://huggingface.co/sbm-models/sbm
- Repositorio GitHub: https://github.com/tullebulle/SBM
- SD3 VAE (dependencia de latente): https://huggingface.co/stabilityai/stable-diffusion-3-medium-diffusers
