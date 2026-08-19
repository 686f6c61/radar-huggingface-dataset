# LBH-123-AI/Minimax_h3_latent_Upscaler

## Resumen

Minimax H3 Latent Upscaler es un modelo de upscaling espacial en espacio latente, desarrollado por LBH-123-AI, diseñado específicamente para acelerar la generación de vídeo de alta resolución con el modelo de generación de vídeo MiniMax H3. En lugar de decodificar los latentes de baja resolución a píxeles, aplicar un upscale tradicional y volver a codificar (un proceso costoso que implica el VAE de ~5B parámetros de H3), este modelo opera directamente sobre los latentes de 24 canales del VAE de H3, aumentando la resolución espacial (H×W) mientras preserva la dimensión temporal.

El modelo se presenta como una solución para evitar los artefactos de "ghosting" o doble imagen que introduce la interpolación bilineal o bicúbica naive sobre latentes, y para reducir significativamente el tiempo de generación. Está pensado para integrarse en flujos de trabajo de ComfyUI mediante un nodo personalizado complementario, y ofrece tres checkpoints en distintas precisiones (bfloat16, float16 y float32) que comparten la misma arquitectura de convolución 3D. La licencia es Apache-2.0, lo que permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red de convolucion 3D con convolucion temporal e interpolacion trilineal |
| Parametros totales | no disponible (los checkpoints pesan ~691 MB en bf16/fp16 y ~1.38 GB en fp32) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (opera sobre latentes de video, no sobre texto) |
| Tipos de cuantizacion | bfloat16, float16, float32 (según checkpoint) |
| Idiomas soportados | no disponible (modelo de vision/video, no textual) |
| Licencia | Apache-2.0 |
| Formato de pesos | SafeTensors (bf16, fp16) y PyTorch .pth (fp32) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de convolucion 3D con convolucion temporal e interpolacion trilineal. Segun la model card, se inspira en el upscaler espacial LTX 2.3 (`ltx-2.3-spatial-upscaler-x2-1.1.safetensors`) y en el enfoque de upscaling neuronal en espacio latente de Ttl (`ComfyUi_NNLatentUpscale`). La red opera directamente sobre los latentes de 24 canales del VAE de MiniMax H3, preservando la dimension temporal mientras modifica la resolucion espacial.

El entrenamiento se realizo sobre aproximadamente 80.000 pares de muestras (latente de baja resolucion + objetivo de alta resolucion), con un equilibrio entre modalidades y factores de escala para maximizar la generalizacion. La distribucion aproximada es: ~70.000 pares de video y ~8.000 pares de imagenes 2K. La distribucion de factores de escala es: 40% a 2x, 10% a 1.5x, 10% a 2.5x, 10% a 3x, 10% a 4x y 10% a factores decimales arbitrarios entre 1.0x y 4.0x. No se menciona el uso de RLHF, DPO ni otras tecnicas de alineacion, ya que se trata de un modelo de regresion puramente visual.

## Capacidades

- Upscaling espacial en espacio latente para latentes de video de MiniMax H3 (formato [B, 24, T, H/16, W/16]).
- Soporte de factores de escala continuos entre 1.0x y 4.0x, con paso de 0.1 (por defecto 2.0x).
- Preservacion de la dimension temporal: el upscaling se aplica solo a la resolucion espacial, no al numero de fotogramas.
- Compatibilidad con los nodos ComfyUI dedicados "Minimax H3 Latent Upscaler (2D)" y "Minimax H3 Latent Upscaler (3D)".
- Tres precisiones de checkpoint (bf16, fp16, fp32) para adaptarse a diferentes GPUs y requisitos de precision numerica.
- Generalizacion a factores de escala intermedios gracias al entrenamiento con escalas arbitrarias.

## Casos de uso

- Generacion de video de alta resolucion acelerada: el flujo tipico consiste en generar el video a baja resolucion (menos tokens de latente, mas rapido), aplicar el upscaler en el espacio latente y luego muestrear/refinar a la resolucion objetivo. Esto evita el costoso ciclo decode → upscale en pixeles → encode.
- Post-procesado en ComfyUI: integrado como nodo personalizado, permite a los usuarios de ComfyUI aplicar upscaling latente a videos generados con MiniMax H3 sin salir del grafo de nodos.
- Reduccion de artefactos de interpolacion: al ser un modelo aprendido, evita el ghosting y las dobles imagenes que producen los metodos clasicos (bilinear/bicubico) sobre latentes.
- Ahorro de VRAM en generacion de video: al trabajar a baja resolucion durante el muestreo y upscalar despues, se reduce la memoria necesaria para el proceso de generacion completo.
- Prototipado rapido de videos: los creadores pueden generar borradores de baja resolucion rapidamente y upscalearlos solo cuando el resultado final sea aceptable, ahorrando tiempo de computo.
- Refinamiento de videos 2K a partir de imagenes: los ~8.000 pares de imagenes 2K del entrenamiento sugieren que el modelo tambien puede aplicarse a latentes de imagenes estaticas, aunque su diseno principal es para video.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas como PSNR, SSIM, LPIPS ni comparaciones de velocidad frente a metodos alternativos. Tampoco se proporcionan datos de latencia o throughput.

## Requisitos de hardware

- El checkpoint bf16 (~691 MB) esta optimizado para GPUs Ampere o Ada (serie RTX 30/40, A100, etc.) gracias a la aceleracion nativa de bfloat16.
- El checkpoint fp16 (~691 MB) ofrece un equilibrio entre velocidad y memoria y es compatible con la mayoria de GPUs modernas.
- El checkpoint fp32 (~1.38 GB) es el mas preciso numericamente y puede ejecutarse en cualquier GPU, aunque con mayor consumo de memoria.
- La VRAM necesaria para el upscaler en si es reducida (menos de 2 GB en fp32), pero el flujo completo de generacion de video con MiniMax H3 requiere mucha mas memoria; el upscaler esta disenado para reducir ese requisito al permitir generar a baja resolucion.
- El despliegue se realiza principalmente a traves de ComfyUI con el nodo personalizado `Comfyui_Minimax_h3_latent_Upscaler` (repositorio de GitHub). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo de lenguaje.
- No se proporcionan datos de latencia o throughput estimados.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de comparacion. Sin embargo, existen alternativas en el ecosistema de MiniMax H3:

| Modelo | Enfoque | Licencia | Formato |
|---|---|---|---|
| Minimax H3 Latent Upscaler (LBH-123-AI) | Upscaler latente aprendido (convolucion 3D) | Apache-2.0 | SafeTensors / .pth |
| Mamad8 2x Latent Upscaler | Upscaler latente limpio 2x, dos nodos ComfyUI | no disponible | no disponible |
| ComfyUI-MiniMaxH3_LatentUpscaler (Tr1dae) | Nodo ComfyUI que usa el upscaler stock de ComfyUI (no aprendido) | no disponible | no disponible |

La diferencia principal es que el modelo de LBH-123-AI es un upscaler neuronal entrenado, mientras que el de Tr1dae utiliza el upscaler stock de ComfyUI (basado en interpolacion) y el de Mamad8 parece ser tambien un upscaler latente, pero no se dispone de detalles tecnicos. El modelo de LBH-123-AI ofrece factores de escala continuos hasta 4x y tres precisiones, lo que le da flexibilidad frente a soluciones fijas de 2x.

## Limitaciones y advertencias

- El modelo esta disenado exclusivamente para los latentes de MiniMax H3 (24 canales, formato especifico). No funcionara con otros VAE o modelos de video sin adaptacion.
- No se han publicado evaluaciones de calidad perceptual ni metricas objetivas; el rendimiento real en terminos de fidelidad visual no esta verificado de forma independiente.
- El entrenamiento se basa en ~80.000 pares, una cantidad moderada; puede haber sesgos hacia los factores de escala mas frecuentes (2x) y hacia los tipos de contenido del dataset de entrenamiento.
- La model card no especifica la resolucion maxima de salida soportada ni el comportamiento con videos de duracion extrema.
- Aunque la licencia es Apache-2.0, el modelo depende de MiniMax H3, cuyo modelo base puede tener su propia licencia y restricciones de uso; es necesario verificar la licencia de H3 antes de usar este upscaler en produccion.
- No se proporcionan garantias de ausencia de artefactos en todos los casos; el upscaler puede fallar en contenido muy alejado de la distribucion de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/LBH-123-AI/Minimax_h3_latent_Upscaler
- Nodo de ComfyUI complementario: https://github.com/LBH-123-AI/Comfyui_Minimax_h3_latent_Upscaler
- Referencia de arquitectura LTX 2.3: no disponible directamente, pero se menciona el archivo `ltx-2.3-spatial-upscaler-x2-1.1.safetensors`
- Referencia de upscaling latente de Ttl: https://github.com/Ttl/ComfyUi_NNLatentUpscale
- Coleccion MiniMax H3 en Hugging Face: https://huggingface.co/collections/MiniMaxAI/minimax-h3
- Guia de instalacion local de MiniMax H3: https://kingy.ai/ai/ai-guides/minimax-h3-local-installation-hardware-guide/
- Repositorio oficial de MiniMax H3: https://github.com/MiniMax-AI/MiniMax-H3
- Articulo sobre upscaler de Mamad8: https://comfyui-wiki.com/en/news/2026-08-08-minimax-h3-latent-upscaler
