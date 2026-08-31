# realrebelai/FastH3_GGUFs

## Resumen

FastH3 4-step (VSA, DataFree) en formato GGUF es una cuantizacion del modelo de generacion de video FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree, desarrollado por FastVideo y convertido por RealRebelAI. Se trata de un modelo de 35 000 millones de parametros basado en la arquitectura MiniMax-H3, destilado a 4 pasos de inferencia mediante DMD2 y entrenado con Video Sparse Attention (VSA), una tecnica que reduce el coste computacional de la atencion en video.

La relevancia de esta conversion reside en que el modelo original, distribuido en 65 GB de shards bf16 en el formato propietario de FastVideo, se ha adaptado al layout de ComfyUI para MiniMax-H3 y se ha cuantizado a varios niveles GGUF, lo que permite ejecutar un modelo de video de 35B en hardware de consumo. El repositorio incluye cinco niveles de cuantizacion (Q8_0, Q6_K, Q5_K_M, Q4_K_M y Q4_K_S) con tamanos que oscilan entre 21 GB y 37 GB.

Es importante senalar que estos archivos no funcionan con ComfyUI estandar: requieren una rama especifica del codigo de ComfyUI (rama `vsa`), kernels de atencion dispersa compilados de comfy-kitchen (rama `sol_attn`) y un nodo de prueba que active VSA en tiempo de ejecucion. Sin estos componentes, el modelo produce ruido uniforme independientemente del nivel de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 (transformador con atencion dispersa de video, VSA) |
| Parametros totales | 35 049 751 312 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community (licencia comunitaria MiniMax-H3) |
| Formato de pesos | GGUF (safetensors disponible en el repositorio original de FastVideo) |

## Arquitectura y entrenamiento

El modelo base es FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree, un modelo de generacion de video texto-a-video e imagen-a-video basado en la arquitectura MiniMax-H3. El proceso de destilacion reduce la inferencia a 4 pasos mediante DMD2 (Distribution Matching Distillation), una tecnica que entrena el modelo para imitar la salida de un modelo de difusion con muchos pasos usando solo unos pocos. La innovacion principal es el entrenamiento con Video Sparse Attention (VSA), que anade una capa `to_gate_compress` en cada bloque de atencion. Esta capa actua como una compuerta que controla una rama de atencion gruesa (coarse), reduciendo el coste computacional al no procesar todas las relaciones espaciotemporales del video con atencion densa.

El modelo original se distribuye en 65 GB de shards bf16 en el layout de FastVideo. La conversion de RealRebelAI reempaqueta los pesos al layout de ComfyUI para MiniMax-H3 y los cuantiza a GGUF. Los kernels de atencion dispersa necesarios para ejecutar VSA se compilan desde el codigo fuente de comfy-kitchen (rama `sol_attn`), que incluye kernels CUDA optimizados para arquitecturas de GPU recientes.

## Capacidades

- Generacion de video a partir de texto (text-to-video) e imagen (image-to-video) con 4 pasos de inferencia.
- Atencion dispersa de video (VSA) que reduce el coste computacional frente a atencion densa.
- Inferencia en hardware de consumo gracias a la cuantizacion GGUF (desde 21 GB para Q4_K_S).
- Compatibilidad con ComfyUI mediante rama `vsa` y nodos personalizados.
- Soporte para multiples niveles de cuantizacion que permiten ajustar el equilibrio entre calidad y uso de memoria.
- Capacidad de ejecucion en GPUs de consumo con 8 GB de VRAM o mas, segun el autor (orientado a low-VRAM).
- Integracion con el ecosistema ComfyUI para flujos de trabajo de generacion de video.

## Casos de uso

- Generacion de video local en equipos de consumo: un creador de contenido puede generar clips de video de alta calidad desde su propia GPU (por ejemplo, una RTX 3060 o superior) usando los niveles Q4_K_M o Q4_K_S, que ocupan entre 21 y 25 GB, sin necesidad de servicios en la nube.
- Prototipado rapido de ideas visuales: un director de arte o disenador puede convertir un boceto o imagen de referencia en un video animado de 4 pasos en minutos, iterando rapidamente sobre conceptos sin esperar largos tiempos de renderizado.
- Creacion de contenido para redes sociales: generacion de clips cortos para plataformas como TikTok, Instagram Reels o YouTube Shorts a partir de prompts de texto, con la ventaja de ejecutarse localmente y sin coste por generacion.
- Investigacion academica en generacion de video: un investigador puede estudiar el comportamiento de la atencion dispersa (VSA) y la destilacion en 4 pasos (DMD2) sobre un modelo de 35B sin necesitar un cluster de GPUs, gracias a la cuantizacion.
- Desarrollo de flujos de trabajo personalizados en ComfyUI: un desarrollador puede integrar FastH3 en pipelines de generacion de video mas complejos, combinando multiples modelos y nodos dentro del ecosistema ComfyUI.
- Evaluacion comparativa de cuantizaciones: un ingeniero de ML puede comparar la calidad de salida entre los distintos niveles GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S) para determinar el punto optimo de compresion para su caso de uso especifico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas cuantitativas de calidad de video (como FVD, CLIP score u otras) ni comparaciones con otros modelos de generacion de video.

## Requisitos de hardware

- VRAM estimada: los archivos GGUF pesan entre 21 GB (Q4_K_S) y 37 GB (Q8_0). El autor recomienda elegir el nivel de cuantizacion segun la RAM del sistema, no la VRAM, ya que los pesos se transmiten desde RAM y un nivel que no quepa provocara paginacion excesiva.
- GPU recomendadas: el autor indica que los kernels CUDA se compilan para arquitecturas concretas. Para RTX 30-series se usa `COMFY_CUDA_ARCHS=80-real;86-real`; para RTX 40-series se anade `89-real`; para RTX 50-series se usa `120-real`. No se especifican GPUs minimas, pero el canal del autor esta orientado a low-VRAM (8 GB o menos).
- Opciones de despliegue: ComfyUI con la rama `vsa` de Kijai, comfy-kitchen con la rama `sol_attn` compilada, y un nodo de prueba que active VSA en tiempo de ejecucion. No se menciona soporte para vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponible. El autor menciona que la inferencia requiere 4 pasos, pero no proporciona tiempos concretos.
- Requisitos de compilacion: Visual Studio 2022 con herramientas C++, Windows 11 SDK, CUDA Toolkit 12.8 o superior (12.9 recomendado), y el generador Ninja para CMake.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye comparaciones con otros modelos de generacion de video como Stable Video Diffusion, CogVideoX, Mochi 1 u otros.

## Limitaciones y advertencias

- Estos archivos GGUF no funcionan con ComfyUI estandar. Sin la rama `vsa` de ComfyUI, los kernels de comfy-kitchen `sol_attn` y el nodo de activacion de VSA, el modelo produce ruido uniforme en todos los niveles de cuantizacion. El autor advierte explicitamente que "nada esta mal con el archivo" cuando esto ocurre; el problema es la ruta de atencion faltante.
- La configuracion requiere compilar kernels CUDA desde el codigo fuente, lo que implica un proceso de 30 a 60 minutos la primera vez y depende de herramientas de desarrollo especificas de Windows (Visual Studio 2022, Windows 11 SDK, CUDA Toolkit 12.8+).
- Cualquier actualizacion de ComfyUI revierte la rama `vsa` a master y rompe la compatibilidad. Es necesario verificar la rama activa tras cada actualizacion.
- Los niveles de cuantizacion Q3 y Q2 se consideran inutilizables segun el autor; el minimo de calidad es Q4_K_S.
- La licencia es `minimax-h3-community`, una licencia comunitaria de MiniMax-H3. No se detallan las restricciones especificas de uso comercial en la informacion disponible.
- El modelo esta entrenado con destilacion a 4 pasos, lo que puede implicar una calidad inferior a la del modelo original con mas pasos de inferencia.
- No se proporcionan datos sobre sesgos, alucinaciones o limitaciones de idioma en la informacion disponible.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/realrebelai/FastH3_GGUFs
- Modelo base original: https://huggingface.co/FastVideo/FastVideo-FastH3-4-step-Preview-v1-VSA-DataFree
- GitHub de RealRebelAI: https://github.com/RealRebelAI
- Canal de YouTube de RealRebelAI: https://www.youtube.com/@realrebelai
- Perfil de Civitai de RealRebelAI: https://civitai.com/user/RealRebelAI
- Perfil de X de RealRebelAI: https://x.com/realrebelai
