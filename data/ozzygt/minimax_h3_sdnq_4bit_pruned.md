# OzzyGT/MiniMax_H3_sdnq_4bit_pruned

## Resumen

MiniMax_H3_sdnq_4bit_pruned es una version cuantizada a INT4 del modelo MiniMax-H3 de MiniMax, creada por OzzyGT mediante SDNQ (SD.Next Quantization) con opcion dinamica y rotacion de Hadamard. El modelo base es un sistema generativo omni-modal que comprende contextos multimodales (texto, imagen, video y audio) y genera video con audio estereo nativo de hasta 2K de resolucion y 15 segundos de duracion.

Esta version concreta elimina las ramas AdaLN del transformer (unos 13B de parametros que, segun MiniMax, no son necesarios para inferencia porque sus salidas pueden precomputarse) y cuantiza los pesos restantes a INT4, reduciendo el transformer de 33B a aproximadamente 10,7B parametros. El resultado es un modelo de generacion de video-audio mucho mas ligero, pensado exclusivamente para inferencia en hardware con VRAM limitada.

La relevancia de este modelo radica en que hace accesible MiniMax-H3, que en bf16 ocupa 498 GB, a equipos con GPUs de consumo o profesionales. El repositorio solo contiene los pesos del transformer; el text encoder, los VAE y los schedulers se cargan desde el repositorio companion OzzyGT/MiniMax_H3_sdnq_dynamic_4bit.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer omni-modal (MiniMax-H3) |
| Parametros totales | 10.718.491.528 (transformer podado, INT4) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | INT4 dinamico (SDNQ con rotacion de Hadamard) |
| Idiomas soportados | en (ingles) |
| Licencia | minimax-h3-community-license-agreement |
| Formato de pesos | safetensors (diffusers) |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3 es un transformer omni-modal de 33B parametros en el transformer (69B en total contando text encoder, VAE y audio VAE) que unifica la comprension de texto, imagen, video y audio, y genera video con audio estereo nativo. Segun MiniMax, unos 13B de los 33B parametros del transformer residen en ramas AdaLN (Adaptive Layer Normalization) cuyas salidas pueden precomputarse y cachearse, por lo que no son necesarias para inferencia.

Esta version elimina esas ramas AdaLN y cuantiza los pesos restantes a INT4 usando SDNQ con la opcion dinamica y rotacion de Hadamard. El resultado es un transformer de 10,7B parametros en INT4. No se trata de un fine-tuning: es una transformacion del modelo base ya entrenado, sin datos de entrenamiento adicionales. El repositorio incluye una clase de modelo propia para el transformer podado, por lo que requiere `trust_remote_code=True`.

## Capacidades

- Generacion de video a partir de texto con audio estereo nativo generado conjuntamente (workflow `t2va`).
- Generacion de video a partir de imagen (workflow `fl2va`).
- Generacion de video a partir de video de referencia (workflow `ref2va`).
- Generacion de imagen a partir de texto, capacidad heredada del modelo base y verificada por la comunidad en SD.Next.
- Comprension multimodal unificada de texto, imagen, video y audio.
- Soporte de prompts con descripcion multimodal integrada (`integrated_multimodal_description`), incluyendo sincronizacion temporal de acciones y dialogo narrado con etiquetas de idioma.
- Resoluciones de hasta 2K y duracion de hasta 15 segundos (capacidades del modelo base).
- Soporte de offloading por grupos (block_level para el transformer, leaf_level para text encoder y VAE) para reducir el uso de VRAM.

## Casos de uso

- Produccion de video corto para redes sociales: el modelo genera clips de hasta 15 segundos con audio sincronizado y narracion, adecuado para contenido en TikTok, Instagram Reels o YouTube Shorts.
- Prototipado de storyboards animados: directores y disenadores pueden generar versiones preliminares de escenas con movimiento, dialogo y efectos de sonido sin necesidad de rodar.
- Generacion de material educativo: creacion de videoclips explicativos con voz en off en ingles a partir de prompts descriptivos detallados.
- Publicidad y marketing: generacion rapida de conceptos de anuncios con voz en off y banda sonora integrada para validar ideas antes de una produccion completa.
- Investigacion en cuantizacion y podado de modelos multimodales: permite estudiar el impacto de SDNQ INT4 y el podado de ramas AdaLN en la calidad de generacion de video-audio.
- Despliegue en hardware limitado: al ser INT4 y con AdaLN podado, permite ejecutar generacion de video-audio en GPUs de consumo con offloading, algo inviable con el modelo base en bf16 (498 GB).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor incluye una comparacion visual entre esta version INT4 y la version INT8 del mismo modelo (mismo prompt, misma semilla 2233586303, 20 pasos a 864x480 y 175 frames), pero no hay metricas cuantitativas.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita. El transformer INT4 podado tiene 10,7B parametros, pero el pipeline completo (text encoder, VAE, audio VAE) requiere recursos adicionales. El repositorio companion (dynamic 4bit) pesa 64,8 GB en disco.
- GPU recomendadas: no especificadas por el autor. Dado el tamano del modelo completo, se recomienda al menos 16-24 GB de VRAM, o usar offloading a CPU.
- Soporta group offloading (block_level para el transformer, leaf_level para text encoder y VAE), lo que permite ejecutar en GPUs con menos VRAM a costa de latencia.
- Opciones de despliegue: diffusers con ModularPipeline, SDNQ v0.2.2 o superior, `trust_remote_code=True`. Hay scripts listos en el repositorio diffusers-recipes.
- El ejemplo del autor usa 20 pasos a 864x480 y 175 frames; no se indican tiempos de generacion.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamano repo | Uso previsto |
|---|---|---|---|---|
| MiniMaxAI/MiniMax-H3 (base) | 33B transformer (69B total) | bf16 | 498 GB | Fine-tuning e inferencia en clusters |
| OzzyGT/MiniMax_H3_sdnq_dynamic_4bit | 18B total | INT4 dinamico | 64,8 GB | Inferencia con AdaLN incluida |
| OzzyGT/MiniMax_H3_sdnq_4bit_pruned (este) | 10,7B transformer | INT4 dinamico + podado AdaLN | 52,1 GB | Inferencia ligera |
| OzzyGT/MiniMax_H3_sdnq_8bit_pruned | no disponible | INT8 + podado AdaLN | no disponible | Inferencia con mayor fidelidad |

## Limitaciones y advertencias

- Solo soporta ingles (idioma declarado: en).
- Licencia comunitaria MiniMax-H3 (minimax-h3-community-license-agreement): revisar las restricciones de uso comercial antes de desplegar en produccion.
- Requiere SDNQ v0.2.2 o superior y `trust_remote_code=True`, lo que implica ejecutar codigo remoto no auditado.
- El podado de AdaLN impide el fine-tuning: es un modelo exclusivamente para inferencia.
- La cuantizacion INT4 puede degradar la calidad visual y de audio respecto al modelo bf16 o INT8; el autor muestra una comparacion visual pero sin metricas objetivas.
- El repositorio no incluye text encoder, VAE ni schedulers: dependen del repositorio companion, lo que anade un punto de fallo en el despliegue.
- No se han publicado benchmarks cuantitativos que validen el rendimiento de esta version cuantizada.
- El parametro `workflow` debe pasarse explicitamente para cargar solo la particion de la tarea deseada; sin el, se cargan ambas particiones, aumentando el uso de memoria.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/OzzyGT/MiniMax_H3_sdnq_4bit_pruned
- Repositorio companion (text encoder, VAE, schedulers): https://huggingface.co/OzzyGT/MiniMax_H3_sdnq_dynamic_4bit
- Version INT8 podada: https://huggingface.co/OzzyGT/MiniMax_H3_sdnq_8bit_pruned
- Modelo base MiniMax-H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Repositorio SDNQ: https://github.com/Disty0/sdnq
- GitHub de MiniMax-H3: https://github.com/MiniMax-AI/MiniMax-H3
- Scripts diffusers-recipes: https://github.com/asomoza/diffusers-recipes/blob/main/models/minimax_h3/README.md
- Articulo de Civitai sobre T2I con MiniMax H3 4bit: https://civitai.com/articles/33881/minimax-h3-4bit-t2i
