# FastVideo/FastH3-Omni-NVFP4-QAD-Comfy

## Resumen

FastH3 Omni NVFP4 QAD para ComfyUI es un modelo de difusión de un solo archivo (single-file) que genera vídeo con audio estéreo sincronizado a 32 kHz a partir de un prompt de texto y de referencias ordenadas de imagen, vídeo y audio. Lo publica FastVideo, en colaboración con Nuva Lab, y es una variante cuantizada y destilada del modelo FastH3 Omni de 8 pasos (FastVideo/FastVideo-FastH3-Omni-8-Step-V1). Su función específica es llevar la generación omnicanal (vídeo + audio) a ComfyUI con un checkpoint ya empaquetado para ese runtime, evitando al usuario tener que convertir pesos.

La relevancia técnica está en la combinación de dos técnicas: destilación en pocos pasos (8 evaluaciones del transformer con guidance 1.0) y cuantización con entrenamiento consciente de la cuantización (QAD, quantization-aware distillation) para el formato NVFP4 de NVIDIA. Eso permite ejecutar un modelo de vídeo con audio en hardware Blackwell de consumo o de estación de trabajo, con un repo de 13,8 GB. En GPUs no Blackwell hay que recurrir a BF16 o FP8, ya que la ruta acelerada NVFP4 depende de esa arquitectura.

El modelo no es un LLM ni un modelo de lenguaje: no hay ventana de contexto en el sentido habitual, sino un prompt de texto procesado por un text encoder externo que también aporta la visión de las referencias. El pipeline de referencia es el nodo "MiniMax H3 Reference to Video" de ComfyUI, con video shift 12.0 y audio shift 3.0. La licencia es la MiniMax-H3 Community License Agreement, no una licencia open source estándar, lo que condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (single-file) para generacion conjunta de video y audio; familia MiniMax-H3 / FastH3 Omni, derivado por destilacion y QAD. El backbone concreto no se detalla en la informacion disponible |
| Parametros totales | No disponible (el repo ocupa 13,8 GB en formato NVFP4) |
| Parametros activos | No aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | No aplica: modelo de difusion, no autoregresivo. La longitud de prompt no esta especificada |
| Tipos de cuantizacion | NVFP4 con QAD (este repo); BF16 en el release base; FP8 en la variante FastH3-OmniRef-FP8 |
| Idiomas soportados | No disponible (depende del text encoder externo, no incluido en el repo) |
| Licencia | MiniMax-H3 Community License Agreement (license_name: minimax-h3-community-license-agreement) |
| Formato de pesos | safetensors, archivo unico: fasth3_omniref_qad_nvfp4_comfy.safetensors (libreria diffusion-single-file) |

Otros datos: creado el 2026-10-20, actualizado el mismo dia, 37.700 descargas y 13 likes en el momento de la consulta. El modelo base declarado es FastVideo/FastVideo-FastH3-Omni-8-Step-V1.

## Arquitectura y entrenamiento

La información disponible describe el resultado del entrenamiento (destilación a 8 pasos más QAD para NVFP4) pero no el detalle del backbone: no se especifica el número de bloques, la dimensionalidad, el tipo de atención ni el tamaño del transformer. Lo que sí está documentado es el comportamento de inferencia: 8 pasos de muestreo con guidance 1.0, video shift 12.0 y audio shift 3.0, y generación simultánea de vídeo y audio estéreo a 32 kHz. El audio no es un post-proceso: el modelo requiere el VAE de audio y el soporte de visión por referencia del text encoder para producir audio sincronizado.

El condicionamiento es multimodales y ordenado: el prompt usa etiquetas `<Picture 1>`, `<Video 1>` y `<Audio 1>` para referenciar las entradas adjuntas, lo que convierte al modelo en un sistema reference-to-video más que en un text-to-video puro. La destilación con reconocimiento de cuantización (QAD) implica que el modelo se optimizó teniendo en cuenta el ruido de cuantización NVFP4, de ahí que el autor advierta que la salida cuantizada puede diferir de la BF16. Nuva Lab co-desarrolló el modelo y definió y curó el dataset de referencias omnicanal; no se publican el número de tokens, la composición del dataset ni si hubo RLHF o DPO (no aplica habitualmente en difusión, pero no se confirma).

## Capacidades

- Generación de vídeo a partir de texto, con audio estéreo sincronizado a 32 kHz en la misma pasada.
- Reference-to-video: acepta referencias ordenadas de imagen, vídeo y audio, invocadas en el prompt mediante `<Picture 1>`, `<Video 1>` y `<Audio 1>`.
- Generación en 8 pasos de muestreo con guidance 1.0, lo que reduce el coste frente a pipelines de 20-50 pasos.
- Salida conjunta de vídeo y audio: el VAE de audio es obligatorio para obtener la pista sonora sincronizada.
- Integración nativa con ComfyUI mediante el nodo de condicionamiento "MiniMax H3 Reference to Video".
- Ejecución acelerada en NVFP4 sobre NVIDIA Blackwell (GB200/B200, RTX PRO 6000 Blackwell, RTX 5090, DGX Spark).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni matemáticas: no es un modelo de lenguaje.

## Casos de uso

- Prototipado rápido de vídeo publicitario: el modelo genera en 8 pasos un clip con audio sincronizado a partir de un brief de texto y una imagen de referencia de producto, lo que permite iterar decenas de variantes en una sola sesión de ComfyUI.
- Doblaje y sustitución de audio en postproducción: usando `<Audio 1>` como referencia y `<Video 1>` como fuente visual, se puede regenerar la banda sonora manteniendo la sincronía con el metraje existente.
- Creación de contenido para redes sociales en estación de trabajo: con un checkpoint NVFP4 de 13,8 GB en una RTX 5090 o RTX PRO 6000 Blackwell, un creador individual puede producir clips con audio sin depender de servicios en la nube.
- Previsualización de storyboards: a partir de una o varias `<Picture N>` de referencia se generan animáticos con sonido ambiente, útiles para validar ritmo y puesta en escena antes de producir.
- Generación de material sintético para entrenamiento de modelos de vídeo-audio: el pipeline permite producir pares vídeo/audio controlados por referencia, con la advertencia de que la licencia comunitaria condiciona su uso.
- Integración en pipelines de ComfyUI ya existentes: al ser un archivo único que se coloca en `ComfyUI/models/diffusion_models/`, se puede insertar en flujos de trabajo ya montados junto a los VAE de vídeo y audio y el text encoder compartidos de FastH3 Omni.
- Demos interactivas y herramientas creativas: la combinación de 8 pasos y cuantización NVFP4 reduce la latencia lo suficiente para flujos de prueba y error con el usuario delante, siempre que el hardware sea Blackwell.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas objetivas (FVD, CLIP score, sincronización audio-vídeo, etc.) ni comparaciones cuantitativas con otros modelos; solo advierte de que la salida cuantizada puede diferir de la BF16 y de que ComfyUI usa su propio layout de modelo, sampler y kernels, por lo que los resultados pueden diferir de FastVideo y UniServe.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia, los pesos NVFP4 del repo ocupan 13,8 GB, a lo que hay que sumar el text encoder, el VAE de vídeo, el VAE de audio y las activaciones, que no se cuantizan necesariamente.
- Aceleración NVFP4: requiere NVIDIA Blackwell (la model card cita GB200/B200, RTX PRO 6000 Blackwell, RTX 5090 y DGX Spark para la ruta FastVideo).
- En otras familias de GPU hay que usar BF16 o FP8; el autor publica una receta FP8 para RTX 4090 con offload por capas y componentes de encoder BF16 compatibles.
- Despliegue en ComfyUI: build reciente con soporte nativo de MiniMax-H3 y el nodo "MiniMax H3 Reference to Video". Para UniServe (GB200/B200, RTX PRO 6000 Blackwell, Hopper) se indica el release BF16; para FastVideo local (DGX Spark, RTX 5090) se indica el checkpoint en formato FastVideo.
- Componentes externos obligatorios: text encoder con soporte de visión por referencia, VAE de vídeo y VAE de audio, descargables desde FastVideo/FastH3-OmniRef-Comfy.
- Latencia y throughput: no disponibles. Solo se documenta que la inferencia son 8 pasos de muestreo con shift 12.0 (vídeo) y 3.0 (audio).

## Comparativa con modelos similares

| Modelo | Formato / cuantizacion | Runtime objetivo | Pasos | Tamano de repo | Licencia |
|---|---|---|---|---|---|
| FastH3-Omni-NVFP4-QAD-Comfy (este) | NVFP4 QAD, single-file safetensors | ComfyUI | 8 | 13,8 GB | MiniMax-H3 Community License |
| FastVideo/FastH3-Omni-NVFP4-QAD | NVFP4 QAD, formato FastVideo | FastVideo local: DGX Spark, RTX 5090 | 8 | No disponible | Misma familia (verificar en el repo) |
| FastVideo/FastH3-OmniRef-FP8 | FP8 | FastVideo, p. ej. RTX 4090 con offload por capas | No disponible | No disponible | Misma familia (verificar en el repo) |
| FastVideo/FastVideo-FastH3-Omni-8-Step-V1 | BF16 | UniServe en GB200/B200, RTX PRO 6000 Blackwell y Hopper | 8 | No disponible | Misma familia (verificar en el repo) |

La diferencia práctica entre las cuatro variantes no es la capacidad, sino el compromiso entre precisión y hardware: NVFP4 para Blackwell, FP8 para Ada con offload y BF16 para despliegues en servidores Hopper o Blackwell. No se dispone de datos de calidad comparada entre estas variantes.

## Limitaciones y advertencias

- La salida cuantizada en NVFP4 puede diferir de la BF16; el autor lo advierte explícitamente y no cuantifica la magnitud de la diferencia.
- ComfyUI usa su propio layout de modelo, sampler y kernels, por lo que los resultados pueden no coincidir con FastVideo o UniServe aunque se use el mismo checkpoint conceptual.
- El formato no es portable: este repo es exclusivamente para ComfyUI. Para FastVideo hay que usar el checkpoint en formato FastVideo.
- Sin soporte de visión por referencia en el text encoder y sin VAE de audio no hay audio sincronizado; ambos componentes son obligatorios y externos al repo.
- Licencia MiniMax-H3 Community License Agreement: no es una licencia open source estándar. Hay que revisar sus términos antes de cualquier uso comercial; las herramientas de ComfyUI incluidas en `conversion/upstream/` mantienen sus propias licencias.
- Idiomas soportados no documentados: dependen del text encoder, que no se distribuye aquí.
- No se publican métricas de sesgo, fidelidad ni tasas de alucinación visual; en modelos generativos de vídeo el riesgo de artefactos y de deriva temporal es inherente, pero no está cuantificado en la información disponible.
- Requiere hardware Blackwell para la ruta acelerada; en GPUs anteriores el rendimiento y el consumo de VRAM están sin documentar para esta variante.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FastVideo/FastH3-Omni-NVFP4-QAD-Comfy
- Modelo base BF16 (8 pasos): https://huggingface.co/FastVideo/FastVideo-FastH3-Omni-8-Step-V1
- Variante NVFP4 QAD en formato FastVideo: https://huggingface.co/FastVideo/FastH3-OmniRef-NVFP4-QAD
- Variante FP8: https://huggingface.co/FastVideo/FastH3-OmniRef-FP8
- Componentes compartidos de ComfyUI (text encoder, VAE de vídeo y audio): https://huggingface.co/FastVideo/FastH3-OmniRef-Comfy
- Coleccion de lanzamiento: https://huggingface.co/collections/FastVideo/fasth3-omniref
- Repositorio FastVideo: https://github.com/hao-ai-lab/FastVideo
- Guia de inferencia local de FastH3 OmniRef: https://github.com/hao-ai-lab/FastVideo/blob/main/docs/inference/fasth3_omniref.md
- Receta para DGX Spark: https://github.com/hao-ai-lab/FastVideo/blob/main/examples/inference/basic/basic_fasth3_omniref_spark.yaml
- Receta para RTX 5090: https://github.com/hao-ai-lab/FastVideo/blob/main/examples/inference/basic/basic_fasth3_omniref_rtx5090.yaml
- Receta FP8 para RTX 4090: https://github.com/hao-ai-lab/FastVideo/blob/main/examples/inference/basic/basic_fasth3_omniref_rtx4090.yaml
- Guia de despliegue en UniServe: https://github.com/hao-ai-lab/uniserve/blob/main/docs/minimax_h3/minimax_h3.md
- Cookbook de FastVideo: https://haoailab.com/FastVideo/cookbook/
- Constructor de recetas de FastH3 Omni: https://haoailab.com/FastVideo/cookbook/minimax-h3/fasth3-omniref/
- ComfyUI: https://github.com/Comfy-Org/ComfyUI
- Tutorial de ComfyUI para FastVideo FastH3: https://docs.comfy.org/tutorials/video/minimax/minimax-h3-fastvideo
- Pagina de Nuva Lab sobre FastH3-Omni: https://nuvalab.ai/fasth3/
- Licencia MiniMax-H3 Community License Agreement: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
