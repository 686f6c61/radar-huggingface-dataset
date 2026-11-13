# moonbox-dev/FLUX.2-klein-4B-MLX

## Resumen

FLUX.2 Klein 4B MLX es una conversión a formato MLX del modelo de difusión FLUX.2 Klein 4B, desarrollado originalmente por Black Forest Labs y adaptado por moonbox-dev para su ejecución nativa en Apple Silicon. Se trata de un modelo de generación de imágenes a partir de texto (text-to-image) y edición de imágenes, empaquetado como single-file con pesos en safetensors y metadatos en `mflux_model.json`, pensado para la librería MLX de Apple.

El modelo base es `black-forest-labs/FLUX.2-klein-4B`, un transformer de difusión de aproximadamente 4B de parámetros. Esta conversión no modifica la arquitectura ni el entrenamiento: solo transforma los pesos desde PyTorch a MLX, ofreciendo dos precisiones (bf16 y 8bit) con verificaciones numéricas frente al original (PSNR y LPIPS). Es relevante para desarrolladores que quieran ejecutar FLUX.2 en Macs con chip Apple Silicon sin depender de CUDA ni de PyTorch.

La licencia es Apache 2.0, lo que facilita el uso comercial. El repositorio ocupa 35,7 GB e incluye text encoder, transformer, VAE y tokenizer por separado. No se publican datos de benchmarks de calidad de imagen más allá de las métricas de fidelidad de la conversión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (modelo base FLUX.2 Klein 4B); conversion a MLX |
| Parametros totales | ~4B (segun denominacion del modelo base) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 y 8bit |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (single-file MLX, con `mflux_model.json` e indices) |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base FLUX.2 Klein 4B mas alla de que es un modelo de difusion para text-to-image e image-editing. El repositorio de moonbox-dev es una conversion de pesos, no un reentrenamiento: se limita a transformar los componentes del pipeline (text encoder, transformer, VAE y tokenizer) desde el formato original de PyTorch a MLX, manteniendo los demas elementos del pipeline provenientes del repositorio original.

La innovacion tecnica destacable de esta publicacion es la verificacion de fidelidad de la conversion: para cada precision se reportan metricas PSNR y LPIPS frente al modelo PyTorch original sobre las mismas entradas. En bf16 se obtiene PSNR 27,9 dB de media y LPIPS 0,059 de media (0,131 en el peor caso); en 8bit, PSNR 27,4 dB de media y LPIPS 0,043 de media (0,060 en el peor caso). No se dispone de informacion sobre el dataset de entrenamiento, numero de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de descripciones textuales (text-to-image).
- Edicion de imagenes (image-editing), segun los tags del repositorio.
- Ejecucion nativa en Apple Silicon mediante la libreria MLX.
- Dos niveles de precision (bf16 y 8bit) con fidelidad verificada frente al modelo original.
- Empaquetado single-file por precision, con componentes separados (text encoder, transformer, VAE, tokenizer).
- No se dispone de informacion sobre tool calling, agentes, modo thinking, vision, audio ni capacidades multilingues mas alla del pipeline text-to-image.

## Casos de uso

- Generacion de ilustraciones para prototipado en Mac: usar el build bf16 o 8bit con MLX para producir imagenes de concepto directamente en un Mac con Apple Silicon, sin GPU dedicada.
- Edicion de imagenes en flujos locales: el tag image-editing sugiere la posibilidad de modificar imagenes existentes mediante instrucciones de texto, util para retoque rapido en estudios pequenos.
- Desarrollo de aplicaciones creativas offline: integrar el modelo en apps de escritorio macOS que requieran generacion de imagen sin conexion a servicios en la nube.
- Evaluacion de modelos de difusion en investigacion: comparar la salida MLX frente a la PyTorch original usando las metricas PSNR/LPIPS ya reportadas para validar pipelines.
- Automatizacion de assets para videojuegos o prototipos: generar variaciones de sprites, fondos o texturas en lotes sobre hardware Apple.
- Docencia y aprendizaje: estudiar el pipeline completo de FLUX.2 (text encoder, transformer, VAE) en un entorno MLX reproducible y con licencia permisiva.
- Pruebas de cuantizacion: comparar bf16 frente a 8bit en terminos de calidad visual (LPIPS) y uso de memoria para decidir el compromiso adecuado en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la informacion disponible. Las unicas metricas reportadas son de fidelidad de la conversion frente al modelo PyTorch original:

| Precision | PSNR medio | LPIPS medio | LPIPS peor caso |
|---|---|---|---|
| bf16 | 27,9 dB | 0,059 | 0,131 |
| 8bit | 27,4 dB | 0,043 | 0,060 |

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (Macs con chip M-series); la libreria MLX no esta pensada para CUDA.
- VRAM/memoria unificada estimada: no disponible de forma explicita; el repositorio completo ocupa 35,7 GB, aunque cada precision se carga por separado (bf16 incluye text encoder de ~8 GB, transformer de ~7,7 GB y VAE de ~168 MB; 8bit reduce el text encoder a ~4,3 GB).
- GPU recomendadas: no disponible; el modelo esta orientado a memoria unificada de Apple Silicon.
- Cabe en consumer GPU: no aplica en el sentido tradicional; esta pensado para Macs, no para GPUs NVIDIA/AMD.
- Opciones de despliegiegue: libreria MLX (formato single-file con `mflux_model.json`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| FLUX.2 Klein 4B MLX (este) | ~4B | no disponible | apache-2.0 | safetensors MLX | Conversion para Apple Silicon, bf16 y 8bit |
| FLUX.2 Klein 4B (original) | ~4B | no disponible | no disponible en la informacion | PyTorch/safetensors | Modelo base de Black Forest Labs |
| Otros modelos de difusion text-to-image | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- Solo funciona en Apple Silicon con MLX; no es portable a CUDA ni a otros backends sin conversion adicional.
- La fidelidad de la conversion no es perfecta: en bf16 el peor caso alcanza LPIPS 0,131, lo que puede implicar diferencias visibles en algunas entradas.
- No se dispone de informacion sobre sesgos, alucinaciones visuales o limitaciones de idioma del modelo base.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original antes de desplegar en produccion.
- El repositorio ocupa 35,7 GB; es necesario descargar solo la carpeta de la precision deseada y mantener sus archivos juntos.
- No se han publicado benchmarks de calidad de imagen, por lo que no es posible comparar su rendimiento frente a otros modelos de difusion con datos objetivos.
- No hay informacion sobre latencia ni throughput, lo que dificulta planificar despliegues con requisitos de tiempo real.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/moonbox-dev/FLUX.2-klein-4B-MLX
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-4B
- Referencia alternativa del autor en la model card: https://huggingface.co/moonbox-ai/FLUX.2-klein-4B-MLX
- No se han encontrado papers, blogs, repositorios o demos adicionales en la informacion proporcionada.
