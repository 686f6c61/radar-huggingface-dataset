# QuantFunc/LTX-2.5-QuantFunc-4bit

## Resumen

LTX-2.5-QuantFunc-4bit es una cuantización de 4 bits del modelo LTX-2.5 de Lightricks, un modelo de difusión (DiT, Diffusion Transformer) de 22B parámetros orientado a la generación conjunta de vídeo y audio sincronizado. Lo desarrolla QuantFunc, un proyecto independiente especializado en compresión de modelos generativos, y se distribuye como pesos INT4 listos para su uso con la librería diffusers y con el ecosistema ComfyUI a través de su propio nodo personalizado.

El problema que resuelve es de índole práctica: el checkpoint BF16 original de LTX-2.5 ocupa unos 42 GB, lo que lo sitúa fuera del alcance de la mayoría de GPUs de consumo. Esta versión aplica una cuantización A4W4 (activaciones y pesos en 4 bits) basada en SVDQuant con rango 128, reduciendo el peso a 15,79 GB (aproximadamente 14,71 GiB), es decir, en torno a un tercio del original, manteniendo según el autor una calidad cercana a BF16.

Es relevante ahora porque permite ejecutar un modelo de vídeo con audio nativo de 22B en tarjetas de la serie RTX 20 a RTX 50, incluidas configuraciones de 8 GB de VRAM mediante offloading dinámico, algo impensable con el modelo en precisión completa. La ficha describe la variante cuantizada, no el modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | DiT (Diffusion Transformer) conjunto de vídeo y audio; cuantización SVDQuant A4W4 rango 128 |
| Parámetros totales | 22B (checkpoint destilado) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusión, no de lenguaje) |
| Tipos de cuantización | INT4 pesos × INT4 activaciones (A4W4), rango 128; checkpoint BF16 original de 42 GB |
| Idiomas soportados | no disponible (el prompt textual se procesa mediante el text encoder Gemma 4 12B) |
| Licencia | ltx-2-community-license-agreement (ver enlace en el repositorio de Lightricks) |
| Formato de pesos | safetensors (`ltx-2.5-22b-distilled-quantfunc-int4-r128.safetensors`) |

## Arquitectura y entrenamiento

El modelo base LTX-2.5 es un Diffusion Transformer que genera de forma conjunta fotogramas de vídeo y audio estéreo a 48 kHz, es decir, un único modelo denoisa latentes de vídeo y de audio de manera coordinada en lugar de encadenar un generador de vídeo con un modelo de audio separado. La variante aquí descrita es la destilada de 22B, pensada para muestreo con un schedule reducido (8 pasos fijos en la etapa 1) en lugar del schedule completo del modelo no destilado.

La contribución de QuantFunc no es un reentrenamiento, sino una compresión post-entrenamiento. Sobre SVDQuant añade dos mejoras algorítmicas: por un lado, una rama de bajo rango de rango 128 que absorbe una mayor proporción de la energía de los outliers de activación antes de la cuantización a 4 bits; por otro, transformaciones de suavizado de residuos compuestas que aplanan los outliers restantes para que la rejilla de 4 bits cubra la distribución real con un error mínimo. El objetivo declarado es evitar el desenfoque y la pérdida de detalle fino que provoca la cuantización A4W4 ingenua cuando los outliers de activación saturan el rango dinámico. No se detallan en la información disponible los datos de entrenamiento del modelo base ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de vídeo a partir de texto (text-to-video) con audio estéreo sincronizado a 48 kHz.
- Generación de vídeo a partir de imagen (image-to-video), incluyendo flujos de dos etapas con upscaler de latentes.
- Generación de audio a partir de audio y generación conjunta de audio y vídeo (audio-to-video, audio-video-generation).
- Movimiento temporal suave y coherencia de iluminación y texturas finas, según las muestras publicadas por el autor.
- Integración con ComfyUI mediante el nodo QuantFunc y con Python mediante el SDK QuantFunc.
- Compatibilidad con el pipeline `LTX2VideoPipeline` de diffusers.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso ni agentes, por tratarse de un modelo generativo de medios y no de un modelo de lenguaje.

## Casos de uso

- Producción de vídeo publicitario de formato corto: el modelo genera clips de unos 5 segundos a 24 FPS con audio sincronizado, suficientes para piezas de redes sociales y banners animados, con la ventaja de que el audio nace alineado con la imagen y no requiere un pipeline de doblaje posterior.
- Previsualización de storyboards con sonido: un equipo de guion puede convertir una imagen de referencia en un clip animado con ambiente sonoro para validar ritmo y atmósfera antes de rodar, usando el flujo image-to-video de dos etapas.
- Diseño de sonido y Foley asistido: al generar audio y vídeo de forma conjunta, el modelo sirve para prototipar ambientes sonoros coherentes con la escena (olas, lava, fauna submarina) sin recurrir a bibliotecas de samples.
- Iteración local en estaciones de trabajo con GPU de consumo: gracias a los 15,79 GB del checkpoint INT4 y al offloading dinámico, un creador individual con una RTX 5060 Ti de 8 GB puede experimentar sin alquilar GPUs en la nube.
- Automatización de contenido en ComfyUI: el nodo QuantFunc permite insertar la generación de vídeo con audio en grafos más amplios (por ejemplo, sustituyendo el model loader de un flujo LTX-2.5 existente sin tocar prompts, VAEs ni el text encoder).
- Investigación en compresión de modelos generativos: la variante sirve como referencia reproducible para estudiar el impacto de SVDQuant con rango 128 y suavizado de residuos en la calidad perceptiva de un DiT de 22B frente a su versión BF16.
- Generación de material de archivo para prototipos de videojuegos: clips cortos en bucle con audio ambiente para escenas de prueba, generados en local y sin dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas cuantitativas (FVD, CLIP score, métricas de calidad de audio) ni comparaciones numéricas frente al checkpoint BF16 de LTX-2.5; únicamente afirmaciones cualitativas sobre la conservación de textura fina, iluminación, movimiento temporal y audio. Las muestras publicadas (Arctic Aurora, Cathedral Cello, Volcanic Lava, Abyssal Jellyfish) se generaron a 896 × 1152, 121 fotogramas, 24 FPS y unos 5 segundos, con audio estéreo sincronizado a 48 kHz mediante un flujo I2V de dos etapas, pero no constituyen una evaluación sistemática.

## Requisitos de hardware

- VRAM estimada: el checkpoint pesa 15,79 GB (unos 14,71 GiB), por lo que en inferencia se necesita al menos esa cantidad más el overhead de activaciones, latentes y el text encoder. El autor indica que es viable en tarjetas de 8 GB de VRAM con offloading dinámico activado, aunque la VRAM real depende de la resolución, el número de fotogramas y el resto del grafo.
- GPUs soportadas: NVIDIA SM75, SM86, SM89 y SM120, lo que cubre RTX 20, 30, 40 y 50 series, además de T4, A10, A40, L4, L40, RTX 6000 Ada y RTX PRO 6000 Blackwell.
- Cabe en GPU de consumo: sí, incluidas tarjetas de 8 GB como la RTX 5060 Ti con offloading; en tarjetas de 16 GB o más el flujo es más holgado.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-QuantFunc (versión >= 0.0.08, motor QuantFunc PC Engine >= 0.0.18), SDK QuantFunc para Python y el pipeline `LTX2VideoPipeline` de diffusers.
- Componentes adicionales necesarios: text encoder `gemma4-12b-with-proj-ltx-2.5-comfy-int8-convrot.safetensors`, VAEs de vídeo y audio y upscaler de latentes, que se mantienen sin cambios respecto al flujo LTX-2.5 estándar.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Tipo de salida | Cuantización | Peso en disco | Licencia | Disponibilidad |
|---|---|---:|---|---:|---|---|
| LTX-2.5-QuantFunc-4bit | 22B | Vídeo + audio 48 kHz | INT4 A4W4 r128 | 15,79 GB | ltx-2-community-license-agreement | Hugging Face (109 descargas) |
| Lightricks/LTX-2.5 (BF16) | 22B | Vídeo + audio 48 kHz | BF16 | ~42 GB | ltx-2-community-license-agreement | Hugging Face |
| Otros modelos de vídeo con audio de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante y documentada es frente al checkpoint BF16 del que deriva: misma arquitectura y capacidades, con una reducción de huella de aproximadamente 2,7× y la contrapartida de la cuantización. No se dispone en la información proporcionada de datos verificables sobre alternativas de otros fabricantes con generación conjunta de vídeo y audio.

## Limitaciones y advertencias

- La cuantización A4W4 introduce pérdida de información inevitable; el autor la describe como de calidad cercana a BF16, pero no aporta métricas objetivas que lo respalden, por lo que conviene validar la calidad en el caso de uso concreto antes de llevarla a producción.
- Es un checkpoint destilado: debe muestrearse con su schedule nativo (8 pasos fijos en la etapa 1, con sigmas concretos); usar schedules genéricos degrada la salida, según advierte la propia model card.
- El repositorio ocupa 15,8 GB y requiere descargar además el text encoder, los VAEs y el upscaler de latentes, lo que eleva el espacio en disco muy por encima del tamaño del checkpoint.
- La licencia es la LTX-2 Community License Agreement, no una licencia de código abierto estándar; es imprescindible revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones de ingresos, atribución o redistribución.
- No se documentan sesgos conocidos, tasas de alucinación ni limitaciones idiomáticas del prompt; al tratarse de un modelo de difusión, el riesgo principal no es la alucinación factual sino la generación de contenido no fiel al prompt, artefactos temporales y posibles sesgos en la representación de personas y escenas.
- El soporte de GPU está limitado a arquitecturas NVIDIA concretas (SM75, SM86, SM89, SM120); no se menciona compatibilidad con AMD, Intel ni Apple Silicon.
- El proyecto QuantFunc es independiente de Lightricks; la variante no está avalada oficialmente por el autor del modelo base y su mantenimiento futuro no está garantizado.
- Con 109 descargas y 5 likes en el momento de la consulta, la adopción es todavía muy reducida, lo que limita la disponibilidad de reportes de terceros sobre problemas en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/QuantFunc/LTX-2.5-QuantFunc-4bit
- Modelo base: https://huggingface.co/Lightricks/LTX-2.5
- Licencia LTX-2: https://github.com/Lightricks/LTX-2/blob/main/LICENSE
- Repositorio ComfyUI-QuantFunc: https://github.com/QuantFunc/ComfyUI-QuantFunc
- SDK de Python QuantFunc: https://github.com/QuantFunc/Quantfunc-Python-SDK
- Sitio web de QuantFunc: https://www.quantfunc.com/
- Perfil de QuantFunc en Hugging Face: https://huggingface.co/QuantFunc
- Perfil de QuantFunc en ModelScope: https://www.modelscope.cn/profile/QuantFunc
- Perfil de QuantFunc en Civitai: https://civitai.com/user/quantfunc
- Discord de QuantFunc: https://discord.gg/jCp9TpFWcn
