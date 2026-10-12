# abenzerps/Qwen-Image-2.1-Turbo-Quantized

## Resumen

Qwen-Image-2.1-Turbo-Quantized es una recopilacion de versiones cuantizadas del modelo de generacion de imagenes Qwen/Qwen-Image-2.1-Turbo, publicada por el usuario abenzerps. El modelo original pertenece a la familia Qwen y su pipeline es text-to-image: produce imagenes a partir de descripciones en lenguaje natural. Este repositorio no contiene los pesos originales en precision completa, sino conversiones a GGUF, safetensors (FP8, INT8 ConvRot, NVFP4) y MLX, pensadas para ejecutar la generacion de imagenes en hardware local.

El bloque de difusion tiene 7.115.124.736 parametros (aproximadamente 7,1 mil millones) segun los metadatos de safetensors del repositorio, que ocupa 90 GB en total. Junto a los pesos cuantizados se distribuyen los ficheros complementarios necesarios: un text encoder basado en Qwen3-VL de 8B (en BF16 o INT8) y un VAE en BF16. La integracion esta orientada a ComfyUI mediante el nodo ComfyUI-GGUF del fork de leejet.

Su relevancia actual es practica: permite desplegar un modelo de generacion de imagenes de ~7B en GPUs de consumo y en Apple Silicon, reduciendo el peso del transformer de difusion desde los ~7,6 GB del formato Q8_0 hasta los ~4 GB de las variantes Q4 o MLX de 4 bits. El repositorio acumula 3.536 descargas y 14 "me gusta" desde su publicacion en octubre de 2026.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen (el repositorio lo denomina "diffusion model" y se carga mediante el nodo Unet Loader (GGUF) o UNETLoader); el detalle interno de bloques no se especifica en la informacion disponible |
| Parametros totales | 7.115.124.736 (aprox. 7,1 mil millones, dato de safetensors del repositorio) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible (aplicaria al text encoder Qwen3-VL-8B, no documentado aqui) |
| Tipos de cuantizacion | FP8, INT8 ConvRot, NVFP4, MLX 4-bit, MLX 6-bit, MLX 8-bit, Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_0 |
| Idiomas soportados | no disponible |
| Licencia | qwen-research (campo `license: other`, `license_name: qwen-research`) |
| Formato de pesos | GGUF y safetensors (incluye variantes MLX en safetensors) |

## Arquitectura y entrenamiento

El repositorio distribuye exclusivamente los pesos cuantizados del transformer de difusion del modelo base Qwen/Qwen-Image-2.1-Turbo, mas los componentes auxiliares necesarios para la inferencia: un text encoder Qwen3-VL de 8B (BF16 de 17,53 GB, o INT8 ConvRot de 9,35 GB) y un VAE en BF16 de 676 MB. No se publican en la informacion disponible detalles sobre la arquitectura interna del bloque de difusion, el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de ajuste como RLHF o DPO. La etiqueta "Turbo" del modelo base sugiere un proceso de destilacion orientado a reducir los pasos de inferencia, pero el repositorio no lo documenta de forma explicita.

El trabajo tecnico de este repositorio es la cuantizacion: el transformer se ofrece en once variantes que cubren desde 4,00 GB (MLX 4-bit) hasta 7,59 GB (Q8_0). La model card recomienda Q4_K_M como mejor equilibrio tamano/calidad para GGUF, senala INT8 ConvRot y NVFP4 como opciones de alto rendimiento en GPUs compatibles, y reserva los formatos MLX para Apple Silicon. NVFP4, como formato de 4 bits de NVIDIA, requiere hardware Blackwell para su aceleracion nativa.

## Capacidades

- Generacion de imagenes a partir de texto (pipeline `text-to-image`).
- Edicion de imagenes: la model card referencia un workflow oficial de "Image Edit" ademas del de texto-a-imagen.
- Integracion nativa con ComfyUI y con el nodo ComfyUI-GGUF (fork de leejet), con carga del transformer en formato GGUF o safetensors.
- Distribucion autocontenida: el repositorio incluye text encoder y VAE, sin dependencias externas de otros repos.
- Compatibilidad multiplataforma de pesos: GGUF y safetensors (CUDA/CPU) y MLX (Apple Silicon).
- Soporte de tool calling / function calling: no aplica (no es un modelo de lenguaje).
- Soporte de agentes y razonamiento multi-paso: no aplica.
- Razonamiento, codigo, matematicas, vision o audio como modelo generativo de texto: no aplica.
- Capacidad multilingue: no documentada en la model card; el text encoder es Qwen3-VL-8B, pero no se confirma el conjunto de idiomas soportados.

## Casos de uso

- Generacion de imagenes en local sin conexion: el modelo puede ejecutarse integramente en una estacion de trabajo con ComfyUI, sin enviar prompts a servicios externos, lo que resulta adecuado para entornos con requisitos de privacidad.
- Prototipado de arte conceptual y storyboards: con variantes Q4_K_M o NVFP4 de ~4 GB, un disenador puede iterar bocetos a partir de descripciones textuales en una GPU de consumo.
- Edicion y retoque de imagenes existentes: el workflow oficial de image edit permite modificar imagenes de entrada mediante instrucciones de texto, util para ajustar composiciones o variaciones de estilo.
- Ilustracion para contenidos tecnicos y documentacion: generacion de diagramas conceptuales, ilustraciones para articulos o portadas a partir de prompts, con salida directa en el pipeline de publicacion.
- Despliegue en Apple Silicon: las variantes MLX de 4, 6 y 8 bits (4,00-7,56 GB) permiten ejecutar el modelo en equipos Mac con memoria unificada, sin GPU dedicada.
- Investigacion sobre cuantizacion: la disponibilidad de once variantes del mismo transformer permite comparar calidad visual y consumo de memoria entre FP8, NVFP4, INT8 ConvRot, GGUF y MLX sobre un mismo modelo base.
- Generacion por lotes en pipelines automatizados: ComfyUI permite encadenar el modelo en flujos programaticos para producir conjuntos de imagenes a partir de listas de prompts.
- Demostraciones y entornos docentes: el peso reducido de las variantes Q4 (4,05 GB) facilita desplegar el modelo en laboratorios con GPUs de gama media.
- Evaluacion comparativa de text encoders: la presencia de Qwen3-VL-8B en BF16 e INT8 dentro del mismo repositorio permite medir el impacto del encoder en la calidad final frente al coste de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una imagen de referencia (`assets/Qwen-Image-2.1-Benchmark.png`) bajo el epigrafe "Benchmark", pero no acompana cifras en texto, por lo que no es posible reproducir valores concretos de metricas como FID, CLIP score o comparativas con otros modelos.

| Metrica | Resultado |
|---|---|
| Benchmarks numericos (FID, CLIP, etc.) | no disponible |
| Comparativa con otros modelos text-to-image | no disponible |
| Datos de latencia o throughput | no disponible |

## Requisitos de hardware

- VRAM estimada para el transformer de difusion, derivada del tamano de los ficheros (el repositorio no publica requisitos de VRAM explicitos):
  - MLX 4-bit: ~4,00 GB.
  - Q4_0 y Q4_K_M: ~4,05 GB.
  - NVFP4: ~4,20 GB.
  - Q5_K_M: ~4,94 GB.
  - MLX 6-bit: ~5,78 GB.
  - Q6_K: ~5,88 GB.
  - FP8: ~6,63 GB.
  - INT8 ConvRot: ~6,76 GB.
  - MLX 8-bit: ~7,56 GB.
  - Q8_0: ~7,59 GB.
- Componentes adicionales: el VAE en BF16 ocupa 676 MB y debe residir en memoria; las activaciones y el espacio de trabajo de inferencia anaden un consumo no cuantificado en la informacion disponible.
- Text encoder: la model card recomienda mantenerlo en RAM del sistema y descargarlo de la GPU. En BF16 ocupa 17,53 GB y en INT8 ConvRot 9,35 GB, por lo que se recomienda la variante INT8 para equipos con menos memoria.
- GPU recomendadas: no se especifican modelos concretos. La model card indica que INT8 ConvRot y NVFP4 ofrecen alto rendimiento "en GPUs compatibles"; NVFP4 requiere hardware NVIDIA Blackwell. Los formatos MLX estan optimizados para Apple Silicon.
- GPU de consumo: las variantes de ~4 GB (Q4, NVFP4, MLX 4-bit) son las mas adecuadas para GPUs de gama media, siempre que el text encoder se descargue a RAM; la model card recomienda el argumento `--lowvram` de ComfyUI si se produce un error de memoria.
- Opciones de despliegue: ComfyUI con el nodo ComfyUI-GGUF (fork de leejet) para ficheros GGUF y UNETLoader estandar para safetensors; CLIPLoader con `type` ajustado a `qwen_image` para el text encoder; VAELoader para el VAE. No se documentan despliegues en vLLM, llama.cpp, Ollama ni TGI.
- Latencia y rendimiento: no disponible.

## Comparativa con modelos similares

La informacion proporcionada no incluye datos verificables de modelos alternativos de la misma categoria, por lo que la comparativa se limita al modelo base y a las variantes cuantizadas de este repositorio.

| Modelo | Tipo | Parametros | Formatos | Licencia |
|---|---|---|---|---|
| Qwen/Qwen-Image-2.1-Turbo (base) | text-to-image | no disponible (el repo cuantizado reporta 7.115.124.736 para el transformer) | safetensors | qwen-research |
| abenzerps/Qwen-Image-2.1-Turbo-Quantized (este repositorio) | text-to-image cuantizado | 7.115.124.736 | GGUF, safetensors, MLX | qwen-research |
| Alternativas de la misma categoria | text-to-image | no disponible | no disponible | no disponible |

Comparativa interna de variantes cuantizadas (formato frente a tamano y plataforma objetivo):

| Variante | Tamano | Plataforma objetivo segun la model card |
|---|---|---|
| MLX 4-bit | 4,00 GB | Apple Silicon |
| Q4_0 / Q4_K_M | 4,05 GB | GGUF (Q4_K_M recomendada) |
| NVFP4 | 4,20 GB | GPU NVIDIA compatible (Blackwell para aceleracion nativa) |
| Q5_K_M | 4,94 GB | GGUF |
| MLX 6-bit | 5,78 GB | Apple Silicon |
| Q6_K | 5,88 GB | GGUF |
| FP8 | 6,63 GB | GPU compatible con FP8 |
| INT8 ConvRot | 6,76 GB | GPU compatible (alto rendimiento) |
| MLX 8-bit | 7,56 GB | Apple Silicon |
| Q8_0 | 7,59 GB | GGUF |

## Limitaciones y advertencias

- Licencia qwen-research (`license: other` con `license_name: qwen-research`): es una licencia de investigacion, por lo que el uso comercial esta restringido. Es imprescindible revisar los terminos completos antes de cualquier despliegue en produccion.
- No es un modelo de lenguaje: no genera texto, codigo ni realiza razonamiento. No soporta tool calling, agentes ni razonamiento multi-paso.
- Sesgos conocidos: no se documentan en la informacion disponible. Como todo modelo de generacion de imagenes entrenado con datos a gran escala, puede reproducir estereotipos y sesgos presentes en su corpus de entrenamiento.
- Riesgo de artefactos visuales: no se documenta el impacto de la cuantizacion sobre la calidad final. Las variantes mas agresivas (Q4_0, Q4_K_M, NVFP4, MLX 4-bit) reducen el peso a aproximadamente la mitad que Q8_0, y la model card no aporta metricas comparativas de fidelidad.
- Restricciones de hardware: NVFP4 requiere GPUs NVIDIA Blackwell para su aceleracion nativa; los formatos MLX solo funcionan en Apple Silicon. El uso de un formato fuera de su plataforma objetivo no esta documentado.
- Consumo de memoria del text encoder: el encoder en BF16 ocupa 17,53 GB, muy por encima del propio transformer cuantizado. La model card recomienda descargarlo a RAM del sistema, lo que exige bastante memoria de sistema.
- Idiomas soportados: no disponible. No se confirma que la generacion funcione igual de bien con prompts en castellano que en ingles.
- Contexto y datos de entrenamiento: no se publican ni la longitud de contexto del text encoder, ni el numero de tokens de entrenamiento, ni la composicion del dataset.
- Ausencia de benchmarks verificables: sin cifras publicadas, no es posible comparar objetivamente esta cuantizacion con el modelo base ni con alternativas.
- Los resultados de la busqueda web proporcionada no son relevantes para este modelo (corresponden a consultas de soporte de un operador de telefonia) y no aportan informacion tecnica utilizable.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/abenzerps/Qwen-Image-2.1-Turbo-Quantized
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1-Turbo
- ComfyUI: https://github.com/comfyanonymous/ComfyUI
- ComfyUI-GGUF (fork de leejet con soporte de Qwen-Image 2.1): https://github.com/leejet/ComfyUI-GGUF
- Workflow oficial texto-a-imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_t2i.json
- Workflow oficial de edicion de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/image_qwen_image_2_1_image_edit.json
- Formulario de peticion de modelos del autor: https://abenzerps.com/request-a-model/
