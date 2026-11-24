# BennyDaBall/flux-3-image-klein-base-NVFP4

## Resumen

FLUX 3 Image Klein Base NVFP4 (build de BennyDaBall) es una cuantización mixta de FLUX 3 Image Klein Base de Black Forest Labs, empaquetada como archivo único para ComfyUI. El modelo base es un transformer de difusión (DiT) para generación de imágenes a partir de texto; esta versión reduce el peso de 11,08 GB (BF16) a 5,71 GB combinando capas en NVFP4 (W4A4), capas en 8 bits en formato INT8 ConvRot de BFL y capas pequeñas de embedding y modulación en bf16. No es un modelo nuevo: es un artefacto de inferencia cuantizado, con relación declarada `quantized` respecto a `black-forest-labs/flux-3-image-klein-comfy`.

La relevancia de esta ficha es práctica: el autor publica métricas reproducibles frente a las tres alternativas oficiales de BFL (BF16, INT8 ConvRot y NVFP4), con LPIPS, SSIM, tiempo por imagen, VRAM pico y una prueba de renderizado de texto. Según esos datos, este build queda mucho más cerca del BF16 que el NVFP4 oficial (LPIPS medio 0,049 frente a 0,136) y es algo más rápido (8,57 s/imagen frente a 9,21 s/imagen en una RTX 5090), a costa de un archivo algo mayor (5,71 GB frente a 5,26 GB). Frente al INT8 oficial es más rápido (2,2 %) pero ligeramente menos fiel en la mayoría de imágenes.

El público objetivo es quien ya ejecuta FLUX 3 Klein Base en ComfyUI sobre GPU Blackwell y quiere reducir VRAM y tiempo de muestreo sin aceptar la degradación del NVFP4 oficial. Requiere hardware con soporte FP4 nativo (RTX 50 series o RTX PRO Blackwell) para aprovechar la aceleración; en GPUs sin esa capacidad las capas NVFP4 no ofrecen la ventaja de velocidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para text-to-image; cuantizacion mixta NVFP4 + INT8 ConvRot + bf16 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; el codificador de texto es `qwen3vl_4b_bf16`, externo al archivo) |
| Tipos de cuantizacion | NVFP4 (W4A4, escalas de activacion estaticas) en capas principales; 8 bits en formato INT8 ConvRot de BFL; bf16 en embeddings y modulacion |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | flux-kommunity-license (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors de archivo unico (`flux3-image-klein-base-nvfp4-bdb.safetensors`), 5,71 GB |

## Arquitectura y entrenamiento

El modelo subyacente es FLUX 3 Image Klein Base, un transformer de difusion de Black Forest Labs que genera imagenes de 1024x1024 (y resoluciones superiores, como 1936x1088 en 16:9) a partir de texto, con un codificador de texto Qwen3-VL 4B en bf16 y un VAE separados. Esta ficha no cubre el entrenamiento del modelo base: no se dispone de datos sobre tokens de entrenamiento, composicion del dataset ni etapas de RLHF o DPO, y el autor no los documenta.

Lo que si esta documentado en detalle es el proceso de cuantizacion. Las capas NVFP4 se resuelven con GPTQ (Frantar et al., 2022), eligiendo la escala de bloque dentro del bucle de GPTQ mediante Schur Replay (arXiv 2609.36654), cuyo conjunto de candidatos incluye los puntos Four Over Six (arXiv 2512.02010, MIT Han Lab y NVIDIA) bajo la escala global 4/6. Las capas sensibles se mantienen en 8 bits en el formato INT8 ConvRot de BFL, recuantizadas desde BF16 con GPTQ en la base rotada, con seleccion de escala por fila mediante el mismo criterio de replay; el autor reporta una reduccion de aproximadamente 10x del error de pesos de esas capas frente a round-to-nearest. La calibracion uso 24 captions x 11 de los 50 pasos del sampler, en ambas ramas de CFG, a 1024x1024, con captions de oro reservados para evaluacion. La eleccion de que capas quedan en 8 bits se hizo por dano medido por milisegundo a partir de escaneos de sensibilidad por capa.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image) en resoluciones de 1024x1024 y superiores, incluido 16:9 a 1936x1088.
- Renderizado de texto dentro de la imagen: en la prueba del autor, 76 de 78 cadenas citadas leidas correctamente por lectores ciegos, frente a 75/78 del BF16 y 78/78 del NVFP4 oficial.
- Ejecucion en ComfyUI con el flujo de trabajo estandar de Klein Base, sin cambios en text encoder, VAE ni sampler.
- Inferencia con aceleracion FP4 en GPUs NVIDIA Blackwell (RTX 50 series, RTX PRO Blackwell).
- No se documentan capacidades de tool calling, agentes, vision de entrada, audio ni modo de razonamiento: es exclusivamente un modelo de generacion de imagen.

## Casos de uso

- Prototipado rapido de conceptos visuales en local: con 5,71 GB y unos 8,57 s por imagen a 1024x1024 y 50 pasos en una RTX 5090, permite iterar decenas de variaciones por sesion sin depender de APIs externas.
- Ilustracion con texto integrado: la tasa de acierto en renderizado de cadenas (76/78) lo hace adecuado para carteles, mockups de interfaz o packaging donde el texto debe ser legible, aunque conviene revisar cada render.
- Pipelines de generacion por lotes en ComfyUI: al ser un archivo unico que sustituye al BF16 en el nodo Load Diffusion Model, se integra en flujos existentes cambiando solo el nombre del archivo.
- Despliegue en estaciones con una sola GPU de consumo Blackwell: el pico de VRAM medido de 16,3 GiB (incluyendo unos 3 GiB de escritorio) cabe en tarjetas de 24 GB y deja margen para el text encoder y el VAE.
- Generacion de material grafico a resolucion 16:9 para video o presentaciones: el autor incluye ejemplos a 1936x1088 con el mismo sampler y semilla por fila.
- Comparacion de calidad entre cuantizaciones: el repositorio publica la rejilla de comparacion y las metricas por imagen, util para decidir entre BF16, INT8, NVFP4 oficial y este build en una instalacion concreta.
- Evaluacion de tecnicas de cuantizacion (GPTQ con Schur Replay sobre un DiT): sirve como referencia practica para investigadores que quieran aplicar estas tecnicas a modelos de difusion.

## Benchmarks y rendimiento

Datos publicados por el autor en una RTX 5090 con ComfyUI 0.42.3, 1024x1024, 50 pasos, CFG 3.5, euler/simple. La fidelidad se mide contra el render BF16 con la misma caption y semilla (96 renders por archivo: 16 captions x 6 semillas).

| Archivo | Tamano | LPIPS vs BF16 (media / mediana) | SSIM | s/imagen | VRAM pico |
|---|---:|---:|---:|---:|---:|
| BF16 (BFL) | 11,08 GB | referencia | 1 | 20,13 | 20,9 GiB |
| INT8 ConvRot (BFL) | 5,81 GB | 0,034 / 0,021 | 0,958 | 8,76 | 16,4 GiB |
| NVFP4 (BFL) | 5,26 GB | 0,136 / 0,114 | 0,845 | 9,21 | 16,1 GiB |
| NVFP4 (este repo) | 5,71 GB | 0,049 / 0,023 | 0,940 | 8,57 | 16,3 GiB |

- Este build queda mas cerca del BF16 que el NVFP4 oficial en 91 de 96 imagenes (2,8x menor LPIPS medio, 5,0x menor mediana).
- El INT8 ConvRot oficial queda mas cerca del BF16 que este build en 65 de 96 imagenes.
- Velocidad: mediana en caliente de 5 ejecuciones; este build es un 2,2 % mas rapido que INT8 ConvRot y un 7,0 % mas rapido que el NVFP4 oficial.
- Texto: 26 cadenas citadas x 3 semillas, lectura ciega; BF16 75/78, INT8 76/78, este build 76/78, NVFP4 oficial 78/78.
- No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible; no aplican a un modelo de generacion de imagen.

## Requisitos de hardware

- VRAM estimada: pico medido de 16,3 GiB en una RTX 5090 con unos 3 GiB de uso de escritorio, es decir, en torno a 13 GiB efectivos para el modelo y el resto del grafo.
- GPU recomendadas: NVIDIA Blackwell con soporte FP4 nativo (RTX 50 series, RTX PRO Blackwell) para obtener la aceleracion NVFP4; en otras GPUs el archivo puede cargarse pero sin la ventaja de velocidad FP4.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB (RTX 5090, RTX 4090 y similares) con margen para el codificador Qwen3-VL 4B y el VAE; el BF16 de referencia necesita 20,9 GiB y queda mas ajustado.
- Despliegue: ComfyUI (probado con 0.42.3 y comfy-kitchen 0.2.40, torch 2.14.0 + CUDA 13.0, con `--use-ck-attention`). No se documentan otros runners (vLLM, TGI, llama.cpp, Ollama) para este artefacto.
- Latencia y throughput: 8,57 s por imagen a 1024x1024 y 50 pasos en RTX 5090; no se publican cifras para otras GPUs ni para lotes.

## Comparativa con modelos similares

| Modelo | Tamano | Contexto / resolucion | Fidelidad vs BF16 (LPIPS medio) | s/imagen (RTX 5090) | Licencia |
|---|---:|---|---:|---:|---|
| FLUX 3 Image Klein Base BF16 (BFL) | 11,08 GB | 1024x1024 y superiores | referencia | 20,13 | flux-kommunity-license |
| FLUX 3 Image Klein Base INT8 ConvRot (BFL) | 5,81 GB | 1024x1024 y superiores | 0,034 | 8,76 | flux-kommunity-license |
| FLUX 3 Image Klein Base NVFP4 (BFL) | 5,26 GB | 1024x1024 y superiores | 0,136 | 9,21 | flux-kommunity-license |
| Este build (NVFP4 mixto) | 5,71 GB | 1024x1024 y superiores | 0,049 | 8,57 | flux-kommunity-license |

No se dispone de datos para comparar con otros modelos de generacion de imagen de la misma categoria (por ejemplo, otras familias text-to-image) en la informacion proporcionada.

## Limitaciones y advertencias

- Es un artefacto de cuantizacion, no un modelo entrenado: hereda los sesgos y limitaciones del FLUX 3 Image Klein Base y anade el error propio de la cuantizacion.
- Fidelidad limitada: aunque queda cerca del BF16, el INT8 oficial es mas fiel en 65 de 96 imagenes; si la prioridad es maxima similitud con BF16, este build no es la mejor opcion.
- Dependencia de hardware: la aceleracion FP4 requiere GPU Blackwell; en otras GPUs el rendimiento puede no superar al INT8.
- Idiomas: metadatos limitados a ingles (`en`); el comportamiento con prompts en castellano no esta documentado.
- Licencia: flux-kommunity-license, etiquetada como `other`; hay que revisar `LICENSE.md` antes de cualquier uso comercial, ya que impone condiciones adicionales sobre el modelo base.
- Riesgo de alucinacion visual y de errores en texto renderizado: el propio autor reporta dos fallos en 78 cadenas (una "i" estilizada y un espacio ausente).
- Reproducibilidad: las metricas provienen de una unica configuracion (ComfyUI 0.42.3, RTX 5090, sampler concreto); no se han verificado de forma independiente.
- El repositorio tiene 380 descargas y 2 likes en el momento de la consulta: es un build de autor individual, sin el respaldo de un equipo de mantenimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/BennyDaBall/flux-3-image-klein-base-NVFP4
- Modelo base en Hugging Face: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Modelo base para ComfyUI: https://huggingface.co/black-forest-labs/flux-3-image-klein-comfy
- Paper Schur Replay: https://arxiv.org/abs/2609.36654
- Paper Four Over Six (MIT Han Lab y NVIDIA): https://arxiv.org/abs/2512.02010
- Perfil del autor en X: https://x.com/BennyDaBall_OG
- Apoyo al autor (Ko-fi): https://ko-fi.com/bennydaball
