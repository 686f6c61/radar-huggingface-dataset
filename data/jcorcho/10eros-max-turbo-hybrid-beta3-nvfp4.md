# JCorcho/10Eros-Max-TURBO-hybrid-beta3-NVFP4

# Ficha del modelo: 10Eros-Max-TURBO-hybrid-beta3-NVFP4

## Resumen

El modelo `10Eros-Max-TURBO-hybrid-beta3-NVFP4` es una cuantizacion nativa en formato NVFP4 del checkpoint fusionado `10Eros_Max_h3_TURBO-hybrid_beta3.safetensors` desarrollado por TenStrip. El autor de esta conversion es JCorcho, y su objetivo principal es reducir el peso del modelo de 40,23 GB (BF16) a 12,53 GB en un unico archivo `.safetensors`, lo que permite ejecutar el modelo completo en GPUs NVIDIA Blackwell con 16 GB de VRAM, como la RTX 5070 Ti.

El modelo base pertenece a la familia MiniMax-H3, una arquitectura de difusion para generacion de video y audio de forma multimodal. Esta version concreta es un merge que combina partes de los modelos LTX 2.3, Wan 2.2 y Krea 2, e incorpora el adaptador "Turbo" para reducir el numero de pasos de inferencia. La relevancia de esta ficha radica en que es una de las pocas conversiones NVFP4 nativas para ComfyUI, probada en hardware Blackwell y validada con un flujo de trabajo completo de imagen-a-video con audio estereo sincronizado.

Se trata de un modelo orientado a la generacion de video de alta calidad, aunque con un aviso importante: el modelo original es capaz de generar contenido explicito (NSFW) y la licencia restringe su uso. No se dispone de informacion sobre el numero exacto de parametros, la longitud de contexto ni los idiomas soportados, ya que no se especifican en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MiniMax-H3 (difusion multimodal para video y audio) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de video, no de texto) |
| Tipos de cuantizacion | NVFP4 (Tensor Core layout nativo) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax-H3 Community License Agreement |
| Formato de pesos | safetensors (modelo de difusion para ComfyUI) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura MiniMax-H3, un sistema de difusion multimodal que genera video y audio de forma conjunta. El checkpoint original de TenStrip es una fusion compleja que combina los pesos de tres modelos de video (LTX 2.3, Wan 2.2 y Krea 2) sobre la base MiniMax-H3. La conversion NVFP4 se realiza siguiendo la receta publicada para la version beta2, cuantizando exactamente las 200 capas que contienen el layout `.comfy_quant` y manteniendo el resto de tensores sin cuantizar. Se preservan los tensores de Turbo (`adaln_basis`, `adaln_mean` y `silu_t_emb_grid`).

El entrenamiento original de MiniMax-H3 no se detalla en la informacion proporcionada, pero la integracion del adaptador Turbo permite generar videos en pocos pasos (tipicamente 6-7 transiciones de denoising) en lugar de los 50 pasos habituales. La cuantizacion NVFP4 es una tecnica de cuantizacion de 4 bits para GPUs Blackwell, que utiliza el layout de Tensor Cores para acelerar la inferencia sin necesidad de descomprimir los pesos en memoria.

## Capacidades

- Generacion de video a partir de una imagen inicial (I2V).
- Generacion de video a partir de texto (T2V), aunque el pipeline principal se centra en I2V.
- Generacion de audio estereo nativo sincronizado con el video.
- Soporte nativo para ComfyUI a traves de sus nodos MiniMax H3 (UNETLoader, CLIP minimax).
- Modo Turbo integrado, que permite generar video con 7 transiciones de denoising (sigma schedule especifico).
- Compatibilidad con resoluciones altas (validado a 768x1344).
- Capacidad de generar contenido explicito (NSFW) segun las limitaciones del modelo original, con las restricciones legales correspondientes.

## Casos de uso

- Prototipado rapido de video publicitario: se puede partir de una imagen fija de producto o marca y generar una secuencia de video de 124 frames (unos 5 segundos a 24 FPS) con audio estereo, ideal para presentar ideas a clientes sin necesidad de un equipo de produccion.
- Generacion de contenido para redes sociales: el modelo puede crear clips verticales u horizontales con audio sincronizado, lo que reduce el tiempo de edicion manual en plataformas como TikTok o Instagram Reels.
- Animacion de fotos (image-to-video): permite dar vida a fotografias estaticas, como retratos o paisajes, para crear efectos cinematicos o historias visuales a partir de un solo frame.
- Creacion de datasets sinteticos para entrenamiento: los investigadores pueden generar miles de clips de video cortos con audio para entrenar modelos de video o vision, sin necesidad de grabar material real.
- Previzualizacion cinematografica: los directores pueden usar el modelo para crear animatic de baja fidelidad de una escena antes de rodar, usando solo una imagen de referencia y una descripcion textual.
- Investigacion en cuantizacion de modelos: este checkpoint es un caso practico de cuantizacion NVFP4, util para investigar el impacto de la cuantizacion de 4 bits en la calidad de generacion de video y para probar nuevos flujos de trabajo de inferencia eficiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica validacion documentada es una prueba de humo (smoke test) local realizada por el autor:

- GPU: NVIDIA GeForce RTX 5070 Ti (16 GB).
- Resolucion de entrada: 768x1344.
- Frames generados: 124 a 24 FPS con audio estereo.
- Transiciones de denoising: 7.
- Tiempo de ejecucion: 151,961 segundos.

Esta prueba no constituye un benchmark comparativo amplio, sino una comprobacion de que el modelo no falla estructuralmente. No se proporcionan metricas de calidad como FID, CLIP score o FVD.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa 12,53 GB en disco, por lo que se necesita al menos 16 GB de VRAM para inferencia, validado en una RTX 5070 Ti.
- GPU recomendadas: exclusivamente NVIDIA Blackwell (RTX 50xx, B200, etc.) por el layout NVFP4 de Tensor Cores. No es compatible con arquitecturas anteriores como Ampere o Ada Lovelace sin soporte NVFP4.
- Compatibilidad con consumer: si, en GPUs de 16 GB (RTX 5070 Ti, RTX 5080, etc.), aunque se recomienda al menos 24 GB para mayor margen con el text encoder y las VAEs.
- Opciones de despliegue: solo ComfyUI (nativo). No es compatible con vLLM, llama.cpp, Ollama o TGI, ya que es un modelo de difusion, no un LLM.
- Latencia estimada: 151,961 segundos para generar 124 frames (I2V) en una RTX 5070 Ti, lo que equivale a aproximadamente 1,22 segundos por frame. Esto incluye el tiempo de ejecucion del prompt, no el tiempo de descarga ni de carga de los modelos auxiliares.

## Comparativa con modelos similares

| Modelo | Tamano del archivo | Cuantizacion | Requisitos de VRAM | Pipeline |
|---|---|---|---|---|
| `10Eros-Max-TURBO-hybrid-beta3-NVFP4` (este) | 12,53 GB | NVFP4 | 16 GB (Blackwell) | I2V / T2V |
| `TenStrip/10Eros-Max` (BF16) | 40,23 GB | No cuantizado (BF16) | >24 GB (no especificado) | I2V / T2V |
| `10eros_Max_Int8_ref2va_beta2` (TenStrip) | Aprox. 13 GB (1/3 del BF16) | INT8 (ConvRot) | Variable (no especificado) | I2V / T2V (ref2va) |

La principal diferencia con el BF16 es el tamano y la compatibilidad de hardware. La version NVFP4 es la unica optimizada para Blackwell, mientras que la INT8 es mas versatil pero no es nativa para ComfyUI en el mismo layout. La version BF16 requiere mucho mas VRAM y no es practica para equipos de gama media.

## Limitaciones y advertencias

- Contenido explicito: el modelo puede generar contenido NSFW y no es apto para todos los publicos. Su uso debe cumplir con la legislacion aplicable, las normas de la plataforma y los requisitos de consentimiento. Nunca debe usarse para contenido abusivo, explotador, enganoso o no consentido.
- Licencias superpuestas: ademas de la licencia MiniMax-H3, se aplican las licencias de los modelos donantes (LTX 2.3, Wan 2.2 y Krea 2) a las partes transferidas. La cuantizacion no altera estos terminos.
- Dependencias externas: el modelo solo incluye el modelo de difusion. El text encoder (`qwen3vl_32b_minimax_h3_nvfp4_awq.safetensors`) y las VAEs de video y audio deben descargarse por separado desde `Comfy-Org/MiniMax-H3`.
- Hardware limitado: solo se ha probado en GPUs Blackwell con CUDA 13 / PyTorch 2.11. Otras arquitecturas y versiones de software no estan probadas y probablemente no funcionen.
- Degradacion por cuantizacion: la cuantizacion NVFP4 puede alterar los detalles de los resultados en comparacion con el checkpoint BF16 original, especialmente en texturas finas o movimiento complejo.
- Validacion limitada: la prueba de humo es un unico clip, no una evaluacion de calidad exhaustiva. No hay garantia de que el rendimiento sea consistente en otros escenarios o prompts.

## Enlaces

- Repositorio del modelo: https://huggingface.co/JCorcho/10Eros-Max-TURBO-hybrid-beta3-NVFP4
- Modelo base (TenStrip/10Eros-Max): https://huggingface.co/TenStrip/10Eros-Max
- Archivos auxiliares (text encoder y VAEs): https://huggingface.co/Comfy-Org/MiniMax-H3
- Receta de cuantizacion NVFP4 (beta2): https://huggingface.co/sakamakismile/10Eros-Max-beta2-NVFP4
- Licencia MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Workflow I2V oficial de ComfyUI: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_minimax_h3_i2v.json
- Lista curada de recursos MiniMax-H3: https://github.com/wildminder/awesome-minimax-H3/blob/main/README.md
