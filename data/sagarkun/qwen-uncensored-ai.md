# Sagarkun/Qwen-Uncensored-ai

## Resumen

Qwen-Uncensored-ai es un repositorio de cuantizaciones del modelo de difusion texto-a-imagen Qwen-Image-2.1, publicado por el usuario Sagarkun bajo el identificador `Sagarkun/Qwen-Uncensored-ai`. No se trata de un modelo entrenado desde cero, sino de una redistribucion de pesos cuantizados derivados de los pesos base de Qwen/Qwen-Image-2.1, empaquetados en formatos GGUF, safetensors (FP8, INT8 ConvRot, NVFP4) y MLX para su uso en inferencia local con ComfyUI y hardware Apple Silicon. El repositorio declara 7.115.124.736 parametros en el checkpoint safetensors y un tamano total de 105,2 GB, coherente con un paquete que incluye multiples variantes de cuantizacion, codificador de texto Qwen3-VL de 8B y VAE.

El modelo resuelve el problema de ejecutar un generador de imagenes de gran tamano en hardware de consumo, ofreciendo variantes desde BF16 (14,23 GB) hasta NVFP4 (4,20 GB) y MLX 4-bit (4,00 GB). La etiqueta "Uncensored" sugiere que los pesos derivan de un ajuste sin filtros de seguridad respecto al modelo original, aunque la model card no documenta explicitamente el proceso de eliminacion de censura ni los datos empleados. Es relevante ahora porque el ecosistema ComfyUI-GGUF ha incorporado soporte nativo para la arquitectura Qwen-Image 2.1, lo que permite cargar estos ficheros directamente en flujos de trabajo de generacion de imagenes.

La ficha se limita a lo declarado en la model card y en los metadatos de Hugging Face; no se dispone de informacion sobre el dataset de entrenamiento, el proceso de ajuste fino ni resultados de benchmarks propios del autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (derivado de Qwen/Qwen-Image-2.1); detalles internos no disponibles |
| Parametros totales | 7.115.124.736 (checkpoint safetensors); el codificador de texto Qwen3-VL 8B se distribuye por separado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16, FP8, INT8 ConvRot, NVFP4, MLX 4/6/8-bit, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (declarada como `other` en los metadatos) |
| Formato de pesos | GGUF, safetensors (FP8, INT8, NVFP4, MLX), BF16 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura interna del modelo base Qwen-Image-2.1 ni el proceso de entrenamiento. Por los artefactos distribuidos se deduce una arquitectura de difusion texto-a-imagen que emplea un codificador de texto Qwen3-VL de 8B parametros (en BF16, 17,53 GB; en INT8 ConvRot, 9,35 GB) y un VAE dedicado (`qwen_image_2.1_vae_bf16.safetensors`, 676 MB). El modelo principal se distribuye como un transformer de difusion cuantizado en distintos formatos. No se especifican tokens de entrenamiento, composicion del dataset, uso de RLHF/DPO ni innovaciones tecnicas como decodificacion especulativa o atencion lineal.

Respecto al ajuste "Uncensored", la model card no documenta que datos, tecnicas o pasos se emplearon para eliminar los filtros de seguridad del modelo original. Tampoco se indica si se realizo un fine-tuning, un merge de pesos o simplemente una redistribucion con nombre comercial. Esta ausencia de documentacion es una limitacion importante para evaluar la calidad y el comportamiento real del modelo.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image) mediante el pipeline declarado.
- Integracion con ComfyUI a traves del nodo ComfyUI-GGUF (fork de leejet), con soporte nativo para la arquitectura Qwen-Image 2.1.
- Carga de codificador de texto Qwen3-VL 8B, lo que sugiere capacidad de comprension de prompts multimodales o instrucciones complejas, aunque no se detalla en la model card.
- Variantes optimizadas para Apple Silicon mediante formatos MLX (4, 6 y 8 bits).
- Variantes optimizadas para GPUs modernas mediante FP8, INT8 ConvRot y NVFP4.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades de audio o video.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Generacion de ilustraciones para prototipado de producto: el modelo permite crear bocetos visuales rapidos a partir de descripciones textuales en local, sin depender de APIs externas, usando la variante Q4_K_M (4,60 GB) en una GPU de consumo.
- Creacion de assets para videojuegos y contenido creativo: la variante NVFP4 (4,20 GB) o MLX 4-bit (4,00 GB) permite iterar sobre conceptos artisticos en estaciones de trabajo con GPUs de gama media o Macs con Apple Silicon.
- Flujos de trabajo en ComfyUI para artistas digitales: al integrarse con ComfyUI-GGUF, el modelo se puede encadenar con nodos de upscaling, inpainting o control de composicion dentro de un grafo reproducible.
- Investigacion sobre modelos de difusion sin censura: util para estudiar el comportamiento de generadores de imagenes sin filtros de seguridad, siempre que se respeten las restricciones legales y eticas aplicables.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse en local, las prompts y las imagenes generadas no salen del equipo, lo que resulta adecuado para contenido sensible que no debe enviarse a servicios en la nube.
- Experimentacion con cuantizaciones en Apple Silicon: las variantes MLX permiten comparar calidad y velocidad entre 4, 6 y 8 bits en chips M-series, un caso de uso relevante para investigadores que evaluan el impacto de la cuantizacion en la calidad visual.

## Benchmarks y rendimiento

La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) que no aporta datos numericos en el texto disponible. No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la variante. BF16 requiere aproximadamente 14,23 GB solo para el transformer, mas el codificador de texto (17,53 GB en BF16 o 9,35 GB en INT8) y el VAE (676 MB); en total, mas de 30 GB en BF16. La variante Q4_K_M (4,60 GB) con codificador INT8 (9,35 GB) y VAE reduce el total a unos 15 GB.
- GPU recomendadas: para BF16, A100 40 GB, H100 o RTX 4090 24 GB (justo). Para FP8, INT8 ConvRot y NVFP4, GPUs con soporte nativo de estos formatos (Ada Lovelace o superior para FP8/NVFP4). Para Q4_K_M, RTX 3060 12 GB, RTX 4070 o superiores.
- Cabe en GPU de consumo: si, con las variantes Q4_K_M, Q4_0, Q5_K_M y Q6_K en GPUs de 8-12 GB, siempre que se use el codificador de texto en INT8 y se gestione la memoria con cuidado.
- Opciones de despliegue: ComfyUI con ComfyUI-GGUF (fork de leejet), y presumiblemente llama.cpp/ggml para los GGUF, aunque la model card solo documenta ComfyUI. Para MLX, el runtime MLX de Apple.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento del modelo en la informacion proporcionada, por lo que la comparativa se limita a caracteristicas estructurales.

| Modelo | Parametros | Contexto | Licencia | Formatos | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Uncensored-ai (este) | 7,1 B (transformer) + 8 B (text encoder) | no disponible | qwen-research | GGUF, safetensors, MLX | Hugging Face, 147 descargas |
| Qwen/Qwen-Image-2.1 (base) | no disponible | no disponible | qwen-research | safetensors | Hugging Face oficial |
| Alternativas de difusion texto-a-imagen de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion suficiente para comparar con alternativas concretas como FLUX.1, SDXL o Stable Diffusion 3.5 en terminos de parametros, contexto o rendimiento, ya que la model card no aporta esos datos.

## Limitaciones y advertencias

- La model card no documenta el proceso de "uncensoring": se desconoce que datos, tecnicas o pasos se aplicaron, lo que impide evaluar la calidad real y el comportamiento del modelo frente al base.
- Ausencia total de benchmarks numericos: no hay datos de FID, CLIP score, calidad visual ni comparativas objetivas.
- Licencia qwen-research: restringe el uso comercial; es responsabilidad del usuario revisar los terminos exactos antes de desplegar en produccion.
- El repositorio tiene 0 likes y 147 descargas, lo que sugiere poca validacion por parte de la comunidad; no hay evidencia de que los pesos funcionen correctamente mas alla de lo declarado por el autor.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar imagenes incoherentes, con artefactos o que no reflejen fielmente el prompt.
- La etiqueta "Uncensored" implica que el modelo puede generar contenido no apto para todos los publicos; el usuario es responsable del uso que haga y de cumplir la legislacion aplicable.
- No se documentan sesgos conocidos, pero al derivar de un modelo entrenado con datos web, es probable que herede sesgos de representacion.
- El tamano del repositorio (105,2 GB) y la multiplicidad de variantes pueden complicar la gestion de descargas y almacenamiento.
- La dependencia de un fork especifico de ComfyUI-GGUF (leejet) implica que la integracion puede romperse si el fork no se mantiene actualizado.
- No se especifican los idiomas soportados por el codificador de texto, lo que limita la evaluacion de su cobertura multilingue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Sagarkun/Qwen-Uncensored-ai
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Repositorio de cuantizaciones referenciado en la model card: https://huggingface.co/abenzerps/Qwen-Image-2.1-Uncensored-Quantized
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet): https://github.com/leejet/ComfyUI-GGUF
- Formulario de solicitud de modelos del autor: https://abenzerps.com/request-a-model/
