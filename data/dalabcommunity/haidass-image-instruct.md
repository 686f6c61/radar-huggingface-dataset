# DALabCommunity/Haidass-Image-Instruct

## Resumen

Haidass-Image-Instruct 0.0.1 (preview) es un modelo compacto de texto a imagen desarrollado por DALabCommunity, post-entrenado a partir de Haidass-Image-Base-v1_0.6B_512px. Su columna vertebral generativa es un transformer de difusion de flujo unico de ~598M parametros (34 capas, 9 cabezas de 128 dimensiones) basado en Qwen-Image-2.1 con flow matching, que opera a 512 x 512 pixeles. Emplea como codificador de texto Qwen3-0.6B congelado (hasta 256 tokens) y el VAE de Qwen-Image-2.1 de 64 canales, tambien congelado.

La particularidad mas destacable es el proceso de post-entrenamiento: toda la fase de ajuste fue ejecutada de forma autonoma por un sistema de agentes de "Recursive Self-Improvement" (RSI), compuesto por un agente gestor y varios agentes ejecutores, a lo largo de aproximadamente dos dias de tiempo de reloj. Todo el pipeline, desde la generacion de datos hasta el entrenamiento del LoRA y las evaluaciones, se ejecuto sobre 64 NPUs Ascend 910B repartidas en 8 servidores Atlas A2.

El modelo resulta relevante porque demuestra que con solo 0.6B de parametros se puede superar en GenEval original (0.82) a modelos mucho mayores como Janus-Pro-7B (0.80), Stable Diffusion 3 de 8B (0.74), FLUX.1-dev de 12B (0.66) o DALL-E 3 (0.67), manteniendo ademas un control composicional solido (conteo, posicion relativa, vinculacion de color) y renderizado de texto legible en ingles mediante un LoRA enrutado que solo se carga cuando el prompt contiene texto entrecomillado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion de flujo unico (single-stream DiT) basado en Qwen-Image-2.1, flow matching |
| Parametros totales | ~598M (backbone generativo); el total del pipeline incluye ademas Qwen3-0.6B congelado y el VAE de Qwen-Image-2.1 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 256 tokens de texto de entrada (codificador Qwen3-0.6B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, zh |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria diffusers) |
| Resolucion de generacion | 512 x 512 |
| Capas / cabezas / dimension | 34 capas, 9 cabezas x 128 dim |
| LoRA de texto | rango 128 / alpha 256 sobre proyecciones de atencion y MLP |
| Tamano del repositorio | 2.9 GB |

## Arquitectura y entrenamiento

El backbone es un transformer de difusion de tipo single-stream, derivado de Qwen-Image-2.1 y entrenado con flow matching. Consta de 34 capas con 9 cabezas de atencion de 128 dimensiones, sumando aproximadamente 598M parametros. El texto se procesa con Qwen3-0.6B congelado, tomando los estados ocultos de la ultima capa y limitando la entrada a 256 tokens; las imagenes se codifican y decodifican con el VAE de Qwen-Image-2.1 de 64 canales, tambien congelado. El modelo opera exclusivamente a 512 x 512.

El post-entrenamiento se realizo integramente mediante un sistema de agentes de Recursive Self-Improvement: un agente gestor coordinaba agentes ejecutores que planificaban, lanzaban, evaluaban y refinaban cada experimento de forma autonoma durante unos dos dias. Todo el proceso (generacion de datos, entrenamiento, entrenamiento del LoRA y evaluaciones) se ejecuto en 64 Ascend 910B. La innovacion tecnica del renderizado de texto consiste en deletrear el texto entrecomillado letra a letra para el codificador congelado y cargar un LoRA especifico (rango 128, alpha 256, sobre atencion y MLP) solo cuando el prompt contiene texto entre comillas, sin necesidad de modulos adicionales. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Generacion de imagenes texto-a-imagen a 512 x 512 con control composicional: conteo de objetos, posicionamiento izquierda/derecha/arriba/abajo y vinculacion de atributos de color.
- Renderizado de texto legible en ingles dentro de la imagen, activado automaticamente mediante un LoRA enrutado cuando el prompt incluye texto entrecomillado.
- Generalizacion composicional a clases de objetos no vistas durante el entrenamiento (mejora de +15.7 en el conjunto held-out).
- Soporte bilingue de prompts en ingles y chino.
- Generacion en dominios variados segun la galeria publicada: paisajes, retratos, arquitectura, interiores, animales, comida, productos, ilustracion, rotulacion, conteo y composicion espacial.
- No se menciona soporte de tool calling, function calling, agentes de razonamiento multi-paso, vision de entrada ni audio en la informacion disponible.

## Casos de uso

- Generacion de imagenes para marketing y contenido editorial: el modelo produce ilustraciones y fotografias sinteticas a 512 x 512 con control de composicion (posicion y conteo de objetos), adecuado para bocetos rapidos y variaciones de concepto en flujos creativos.
- Rotulacion y carteleria con texto en ingles: gracias al LoRA enrutado y a la precision de palabras reportada (19.45% en CVTG-2K y 28/50 aciertos exactos en texto grande), puede generar carteles, etiquetas y banners con texto legible sin post-procesado tipografico.
- Prototipado de producto: generacion de imagenes de producto con atributos de color y disposicion controlados, util para maquetas y pruebas A/B de conceptos visuales antes de una sesion fotografica real.
- Educacion y material didactico: creacion de ilustraciones para explicar conceptos con conteo exacto de objetos y relaciones espaciales, aprovechando su buen rendimiento en PixGenEval (82.21).
- Generacion de datos sinteticos para entrenamiento: el modelo puede producir pares prompt-imagen controlados para aumentar datasets de vision por computador, con la ventaja de su bajo coste computacional (0.6B de parametros).
- Despliegue en hardware modesto y entornos con aceleradores no NVIDIA: al ser un modelo de 0.6B y haberse entrenado en Ascend, es candidato para inferencia en GPUs de consumo y en infraestructura Ascend, con integracion directa via diffusers.
- Localizacion de contenido para mercados angloparlantes y chinos: los prompts en ingles y chino estan soportados de forma nativa, lo que facilita campanas bilingues desde un mismo pipeline.

## Benchmarks y rendimiento

| Benchmark | Base | Haidass-Image-Instruct | Ganancia |
|---|---:|---:|---:|
| PixGenEval | 67.05 | 82.21 | +15.2 |
| Conjunto composicional held-out | 59.00 | 74.69 | +15.7 |
| MJHQ-30K FID (menor es mejor) | 13.38 | 10.20 | -3.18 |
| MJHQ-30K CLIP score | 25.35 | 26.08 | +0.73 |
| OneIG-Bench (EN) Text | 0.68 | 17.97 | +17.3 |
| CVTG-2K word accuracy | 0.22% | 19.45% | x88 |
| Texto grande en ingles (50 prompts, coincidencia exacta) | 0/50 | 28/50 | +28 |
| Sonda de deletreo de palabras no vistas (100 imagenes) | 0% | 88% | +88 pts |
| OneIG-Bench (EN) Alignment | 80.11 | 80.73 | +0.62 |
| OneIG-Bench (EN) Style | 39.46 | 40.27 | +0.81 |
| DPG-Bench | 84.02 | 83.67 | mantenido |

Desglose backbone vs. LoRA de texto:

| Benchmark | Base | Solo backbone | Backbone + LoRA de texto |
|---|---:|---:|---:|
| PixGenEval | 67.05 | 82.16 | 82.21 |
| DPG-Bench | 84.02 | 83.79 | 83.67 |
| OneIG Text | 0.68 | 0.38 | 17.97 |
| CVTG-2K word accuracy | 0.22% | 0.23% | 19.45% |
| Texto grande en ingles | 0/50 | 0/50 | 28/50 |
| Sonda de deletreo | 0% | 0% | 88% |

Comparativa en GenEval original:

| Modelo | Parametros | GenEval original |
|---|---:|---:|
| Haidass-Image-Instruct (512 px) | 0.6B | 0.82 |
| Janus-Pro-7B | 7B | 0.80 |
| Stable Diffusion 3 (depth 38, DPO) | 8B | 0.74 |
| Lumina-Image 2.0 | 2.6B | 0.73 |
| Stable Diffusion 3.5 Large | no disponible | 0.71 |
| FLUX.1-schnell | 12B | 0.71 |
| DALL-E 3 | no disponible | 0.67 |
| FLUX.1-dev | 12B | 0.66 |
| SANA-1.6B | 1.6B | 0.66 |
| SANA-0.6B | 0.6B | 0.64 |
| Hunyuan-DiT | 1.5B | 0.63 |
| Stable Diffusion 3 Medium | 2B | 0.62 |
| SDXL | 2.6B | 0.55 |
| PixArt-Sigma (512 px) | 0.6B | 0.52 |
| PixArt-alpha (512 px) | 0.6B | 0.48 |

Todas las puntuaciones propias usan los ajustes de muestreo recomendados, sin reescritura de prompt; el LoRA de texto solo se carga para prompts con texto entrecomillado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Con un backbone de ~598M parametros en safetensors y un repositorio de 2.9 GB, la huella del backbone es reducida; a ello se suman Qwen3-0.6B (codificador de texto) y el VAE de Qwen-Image-2.1.
- GPU recomendadas: no se especifican en la informacion disponible. Por tamano, el modelo es apto para GPUs de consumo, aunque no se detallan modelos concretos.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano de 0.6B del backbone, aunque la informacion no confirma modelos ni requisitos minimos.
- Opciones de despliegue: libreria diffusers (formato safetensors); no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion texto-a-imagen).
- Latencia y throughput: no disponibles.
- Nota de infraestructura: el entrenamiento y todas las evaluaciones se ejecutaron en 64 Ascend 910B (8 servidores Atlas A2), lo que sugiere soporte para aceleradores Ascend ademas de GPU convencionales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | GenEval original | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Haidass-Image-Instruct | 0.6B | 256 tokens, 512 x 512 | 0.82 | no disponible | Hugging Face (diffusers) |
| SANA-0.6B | 0.6B | no disponible | 0.64 | no disponible en la informacion | publico |
| PixArt-Sigma (512 px) | 0.6B | no disponible, 512 px | 0.52 | no disponible en la informacion | publico |
| Janus-Pro-7B | 7B | no disponible | 0.80 | no disponible en la informacion | publico |
| FLUX.1-dev | 12B | no disponible | 0.66 | no disponible en la informacion | publico |

Frente a alternativas del mismo tamano (SANA-0.6B, PixArt-Sigma), Haidass-Image-Instruct ofrece una ventaja clara en control composicional segun GenEval original (0.82 frente a 0.64 y 0.52), ademas de renderizado de texto mediante LoRA enrutado. Frente a modelos mucho mayores como Janus-Pro-7B o FLUX.1-dev, mantiene o supera el rendimiento en GenEval con una fraccion de los parametros, aunque no se dispone de datos comparativos de calidad fotografica mas alla de FID y CLIP en MJHQ-30K.

## Limitaciones y advertencias

- Resolucion fija de 512 x 512: no se documenta soporte para otras resoluciones ni para aspect ratios arbitrarios.
- Cobertura linguistica limitada a ingles y chino; el renderizado de texto dentro de imagen solo se valida en ingles.
- La precision de texto, aunque muy mejorada, sigue siendo parcial: 19.45% de precision de palabra en CVTG-2K y 28/50 en coincidencia exacta para texto grande, insuficiente para rotulacion critica sin revision.
- El LoRA de texto solo se activa con texto entrecomillado; prompts sin comillas no se benefician del renderizado tipografico.
- Modelo en estado preview (version 0.0.1): la API, los pesos y los ajustes recomendados pueden cambiar.
- Licencia no disponible: no se puede confirmar el uso comercial sin consultar al autor; tratar como restriccion bloqueante para produccion hasta verificacion.
- Riesgo de alucinacion visual y de sesgos: no se documentan analisis de sesgo demografico ni de fidelidad factual; como todo modelo generativo, puede producir contenido estereotipado o inexacto.
- Sin datos publicados sobre cuantizacion, latencia, throughput ni requisitos minimos de VRAM, lo que dificulta planificar el despliegue.
- El proceso de entrenamiento fue autonomo mediante agentes RSI; no se detalla la composicion del dataset ni los filtros de seguridad aplicados, lo que limita la auditabilidad del modelo.
- No se documentan capacidades de edicion de imagen, inpainting, outpainting ni control por imagen de referencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/DALabCommunity/Haidass-Image-Instruct
- Modelo base: https://huggingface.co/DALabCommunity/Haidass-Image-Base-v1_0.6B_512px
- Codificador de texto Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Paper PixelGen (PixGenEval): https://arxiv.org/abs/2602.02493
- Qwen-Image Technical Report: https://arxiv.org/abs/2508.02324
- Janus-Pro: https://arxiv.org/abs/2501.17811
- Esser et al., 2024 (Stable Diffusion 3): https://arxiv.org/abs/2403.03206
- Lumina-Image 2.0: https://arxiv.org/abs/2503.21758
- SANA: https://arxiv.org/abs/2410.10629
- GenEval: https://arxiv.org/abs/2310.11513
