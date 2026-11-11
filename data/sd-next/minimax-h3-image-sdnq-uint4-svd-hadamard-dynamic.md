# SD-Next/MiniMax-H3-Image-SDNQ-uint4-svd-hadamard-dynamic

## Resumen

MiniMax-H3-Image es un modelo de difusion de tipo transformer (DiT) para generacion y edicion de imagenes, desarrollado por MiniMax dentro de la familia H3. Este repositorio concreto no es el modelo original, sino una cuantizacion de 4 bits realizada por SD-Next mediante SDNQ (SVD Hadamard dynamic) sobre los pesos bf16 de `MiniMaxAI/MiniMax-H3-Image`. El objetivo es reducir el coste de almacenamiento y de VRAM para hacer viable la inferencia en hardware mas modesto sin reentrenar el modelo.

El modelo base unifica generacion texto-a-imagen y edicion de imagenes en un unico checkpoint, con un transformer de difusion de 17.831 millones de parametros y un text encoder derivado de MiniMax-H3. Genera imagenes de hasta aproximadamente 16 megapixeles en cualquier relacion de aspecto, desde 4096x4096 (1:1) hasta 6272x2688 (21:9), sin upscaler, y esta destilado a 6 pasos de muestreo (6 NFE) sin classifier-free guidance.

La relevancia de esta ficha esta en la cuantizacion: el repositorio pasa de 135,3 GB (transformer, VAE y text encoder originales) a 43,9 GB, con el transformer reducido de 66,3 GB a 19,7 GB y el text encoder de 66,7 GB a 21,8 GB. Esto lo convierte en una alternativa practica para despliegue local en SD.Next o Diffusers, aunque con las limitaciones propias de una cuantizacion agresiva y de una licencia comunitaria restringida territorialmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) con arquitectura H3 sin capas de audio; text encoder MiniMax-H3; VAE |
| Parametros totales | 17.831.443.392 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | uint4 dinamica con grupo automatico, SVD rank 32, rotacion de Hadamard y escalas sin cuantizar; capas selectivas a 5 y 6 bits |
| Idiomas soportados | en |
| Licencia | minimax-h3-image-community-license-agreement (licencia comunitaria, aplicable solo dentro de su territorio aplicable) |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El modelo base es un diffusion transformer (DiT) con la arquitectura H3 de MiniMax, sin las capas de audio de la familia completa, que utiliza el text encoder de MiniMax-H3 sin modificaciones. El checkpoint esta destilado a 6 pasos de muestreo (6 NFE) y opera sin classifier-free guidance, lo que reduce el coste computacional por imagen. Genera directamente resoluciones de aproximadamente 16 megapixeles en relaciones de aspecto desde 1:1 hasta 21:9 sin necesidad de upscaler.

Esta version concreta aplica cuantizacion SDNQ sobre el transformer y el text encoder partiendo de los pesos bf16 originales. La receta combina uint4 con cuantizacion dinamica, tamano de grupo automatico, descomposicion SVD de rango 32, rotacion de Hadamard y escalas sin cuantizar. El transformer mantiene 50 de 362 capas cuantizadas a 5 bits; el text encoder mantiene 58 de 564 capas a 5 o 6 bits. La proyeccion de entrada, el embedder de timesteps y las seis cabezas de salida por paso permanecen en precision completa. El VAE se conserva en fp32. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en la informacion proporcionada.

## Capacidades

- Generacion de imagenes texto-a-imagen con seguimiento preciso de instrucciones y construccion de conceptos creativos (personajes, escenas, atmosfera).
- Edicion de imagenes a partir de una o varias imagenes de referencia, unificada en el mismo checkpoint que la generacion.
- Generacion en multiples relaciones de aspecto, desde 4096x4096 (1:1) hasta 6272x2688 (21:9), a aproximadamente 16 megapixeles sin upscaler.
- Muestreo destilado a 6 pasos (6 NFE) sin classifier-free guidance.
- Soporte de prompt expansion mediante API (context IR) en el modelo base.
- Capacidades multilingues limitadas al ingles segun la metadata del repositorio.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, vision de entrada general, audio ni modo de razonamiento explicito.

## Casos de uso

- Generacion de arte conceptual en produccion: el modelo produce imagenes de hasta 16 MP en relaciones de aspecto extremas (21:9) sin upscaler, adecuado para keyframes, storyboards y material de presentacion que requiere resolucion nativa alta.
- Edicion de imagenes con referencias multiples: al unificar generacion y edicion en un checkpoint, permite flujos de retoque y variacion sobre imagenes existentes sin cambiar de modelo, util en estudios de diseno y marketing.
- Despliegue local en equipos con VRAM limitada: la cuantizacion uint4 reduce el transformer a 19,7 GB y el text encoder a 21,8 GB, lo que hace posible ejecutar el pipeline en GPUs de 24-48 GB que no admitirian los 135,3 GB originales.
- Integracion en SD.Next: el repositorio carga directamente en SD.Next, lo que facilita prototipado rapido y uso en interfaces de escritorio para artistas y disenadores.
- Pipelines automatizados con Diffusers: mediante `ModularPipeline.from_pretrained` e importando `sdnq`, se puede integrar en scripts de generacion por lotes para catalogos, banners o assets de aplicaciones.
- Prototipado de producto con API y open weights: el modelo base ofrece API (text-to-image, edits y prompt expansion) y pesos abiertos, lo que permite comparar resultados entre servicio gestionado y despliegue propio antes de comprometerse con una infraestructura.
- Investigacion sobre cuantizacion: al publicar la receta exacta en `quantization_config.json` por componente, sirve como referencia para estudiar el impacto de SVD, Hadamard y grupos dinamicos en calidad de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 43,9 GB en disco; en VRAM, transformer (19,7 GB) y text encoder (21,8 GB) pueden descargarse secuencialmente, pero el pipeline completo con VAE fp32 requiere planificacion de memoria. No se dispone de cifras oficiales de pico de VRAM.
- GPU recomendadas: no disponible en la informacion proporcionada. Por tamano, GPUs de 24 GB (RTX 4090) pueden ser justas y requerir offload; GPUs de 48-80 GB (A6000, A100 80 GB, H100) ofrecen margen.
- Cabe en consumer GPU: previsiblemente en RTX 4090 (24 GB) solo con descarga parcial de componentes; no confirmado por el autor.
- Opciones de despliegue: SD.Next y Diffusers (`ModularPipeline.from_pretrained` con `sdnq` importado). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion de imagen.
- Latencia y throughput: no disponible. El modelo esta destilado a 6 NFE sin CFG, lo que reduce el numero de evaluaciones por imagen frente a modelos no destilados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image SDNQ uint4 (este repo) | 17,83 B | hasta ~16 MP, 4096x4096 a 6272x2688 | uint4 SDNQ, 43,9 GB | Comunitaria MiniMax-H3-Image | Hugging Face, SD.Next, Diffusers |
| MiniMax-H3-Image original | 17,83 B | hasta ~16 MP | bf16, 135,3 GB | Comunitaria MiniMax-H3-Image | Hugging Face, API, app |
| Otras alternativas de difusion texto-a-imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos comparables de terceros para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- La cuantizacion uint4 con capas selectivas a 5 y 6 bits puede introducir degradacion de calidad frente al modelo bf16 original; el autor no publica metricas de fidelidad.
- El VAE se mantiene en fp32, por lo que el ahorro de memoria no es proporcional al del transformer y el text encoder.
- El repositorio no incluye los checkpoints en formato original (`transformer/` y `vae/`), ni `pdd_fused_heads.safetensors`, `pdd_config.json` ni `model_index.json` del repositorio original, lo que limita su uso fuera del pipeline Diffusers/SD.Next.
- Idioma soportado unicamente ingles segun la metadata; el rendimiento con prompts en castellano no esta documentado.
- Licencia comunitaria MiniMax-H3-Image: aplica solo dentro de su territorio aplicable, con posibles restricciones para uso comercial. Revisar `LICENSE` y `NOTICE` antes de produccion.
- Riesgo de alucinacion visual y de desviacion del prompt en escenas complejas, comun en modelos de difusion; no cuantificado en la informacion disponible.
- Sesgos de generacion no documentados por el autor.
- Modelo con muy pocas descargas (5) y sin likes en el momento de la ficha, lo que implica escasa validacion comunitaria.
- No apto para tareas de texto, codigo, razonamiento o tool calling: es exclusivamente un modelo de imagen.

## Enlaces

- Repositorio de la cuantizacion: https://huggingface.co/SD-Next/MiniMax-H3-Image-SDNQ-uint4-svd-hadamard-dynamic
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Familia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- SDNQ (GitHub): https://github.com/Disty0/sdnq
- SD.Next (GitHub): https://github.com/vladmandic/sdnext
- Licencia: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image/blob/main/LICENSE
- GitHub MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- API global: https://platform.minimax.io/docs/guides/image-generation
- API China: https://platform.minimax.cn/docs/guides/image-generation
- Docs API text-to-image (EN): https://platform.minimax.io/docs/api-reference/image-generation-h3-generations
- Docs API image editing (EN): https://platform.minimax.io/docs/api-reference/image-generation-h3-edits
- Docs API prompt expansion (EN): https://platform.minimax.io/docs/api-reference/image-generation-h3-context-ir
- WebApp global: https://hailuoai.video/
- WebApp China: https://hailuoai.com/
- App de escritorio global: https://agent.minimax.io/
- App de escritorio China: https://agent.minimax.cn/
- ModelScope: https://modelscope.cn/organization/minimax
- Discord: https://discord.com/invite/dbMxutw7tP
