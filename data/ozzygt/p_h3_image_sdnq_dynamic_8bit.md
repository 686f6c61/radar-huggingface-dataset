# OzzyGT/P_H3_Image_sdnq_dynamic_8bit

## Resumen

P_H3_Image_sdnq_dynamic_8bit es una cuantizacion dinamica de 8 bits del modelo de generacion y edicion de imagenes PrunaAI/P-H3-Image, publicada por el usuario OzzyGT. Emplea la tecnica SDNQ (Self-Distilled Neural Quantization) para reducir el peso del transformer y del codificador de texto Qwen3-VL-4B a INT8, manteniendo el VAE y el conector de texto en bf16. El resultado es un checkpoint de aproximadamente 33.100 millones de parametros que cabe en 43,9 GB de repositorio y que, segun la model card, permite inferencia en torno a 13-14 GiB de VRAM con offloading por bloques.

El modelo base P-H3-Image es un sistema text-to-image y de edicion de imagenes de la familia MiniMax H3, orientado a la generacion fotorrealista de alta resolucion (hasta 2720x1536 en los ejemplos publicados) y a la edicion con hasta 8 imagenes de entrada. Esta version cuantizada busca abaratar el coste de VRAM y de almacenamiento para despliegues en hardware mas modesto, a cambio de requerir SDNQ v0.2.8 o superior y diffusers instalado desde el codigo fuente.

La relevancia actual del checkpoint es practica: demuestra que un modelo de difusion de gran tamano con codificador de texto tipo vision-language puede ejecutarse en GPUs de consumo alto o en nodos con menos memoria, manteniendo una calidad visual cercana al bf16 original segun las comparativas incluidas en la model card. No obstante, se trata de un artefacto recien publicado (noviembre de 2026) sin descargas ni validacion comunitaria todavia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (pipeline Modular Diffusers) con transformer y codificador de texto Qwen3-VL-4B; VAE y conector de texto en bf16 |
| Parametros totales | 33.144.138.496 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen; no aplica ventana de texto clasica) |
| Tipos de cuantizacion | INT8 dinamico (SDNQ); transformer y text encoder cuantizados, VAE y conector en bf16 |
| Idiomas soportados | en |
| Licencia | minimax-h3-community-license-agreement (etiquetada como "other") |
| Formato de pesos | safetensors (libreria diffusers) |

## Arquitectura y entrenamiento

El checkpoint es una cuantizacion del modelo base PrunaAI/P-H3-Image, no un entrenamiento nuevo. La arquitectura subyacente es un pipeline de difusion modular de Diffusers en el que el transformer generativo y el codificador de texto Qwen3-VL-4B se han convertido a INT8 mediante SDNQ, una tecnica de cuantizacion dinamica que ajusta los rangos por bloque o por canal en tiempo de inferencia. El VAE y el conector de texto permanecen en bf16 para preservar la fidelidad de reconstruccion y la alineacion semantica.

El muestreo se realiza en 8 pasos sobre la rejilla de sigmas propia del checkpoint y sin CFG, por lo que no se exponen parametros como `num_inference_steps`, `guidance_scale` ni prompt negativo. El pipeline incluye un paso de prompt upsampler que no esta incluido en este repositorio: si se conserva, se carga en bf16 desde PrunaAI/P-H3-Image. No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo original.

## Capacidades

- Generacion de imagenes text-to-image de alta resolucion, con ejemplos publicados a 2720x1536.
- Edicion de imagenes con hasta 8 imagenes de entrada: la primera es la imagen a editar y las siguientes actuan como referencias (Picture 2, Picture 3, etc.).
- Comprension de prompts largos y descriptivos, incluidos prompts estructurados con definiciones de sujetos y referencias.
- Generacion fotorrealista con control de iluminacion, textura, grano de pelicula y balance de blancos a partir de la descripcion textual.
- Renderizado de texto dentro de la imagen (el ejemplo incluye un cartel con la cadena "DIFFUSERS HARDWARE").
- Integracion con el ecosistema Diffusers mediante `ModularPipeline` y carga de componentes por bloques.
- No se documentan capacidades de tool calling, agentes, audio ni modos de razonamiento explicito.

## Casos de uso

- Generacion de imágenes de producto para catalogo de comercio electronico: el modelo permite resoluciones altas (2720x1536) y descripciones fotorrealistas con control de iluminacion, adecuado para fichas de producto que requieren detalle en texturas y materiales.
- Edicion y retoque de fotografias con referencias: usando hasta 8 imagenes de entrada se pueden combinar un sujeto principal con referencias de estilo o vestuario, util en estudios de diseno y agencias de publicidad.
- Creacion de ilustraciones editoriales y carteles: la capacidad de renderizar texto dentro de la imagen permite generar carteles, portadas y materiales promocionales con rotulacion integrada.
- Prototipado rapido de conceptos visuales en estudios de videojuegos: la generacion en 8 pasos sin CFG reduce el coste por iteracion, lo que facilita explorar variantes de personajes y entornos.
- Despliegue en infraestructura con VRAM limitada: gracias a la cuantizacion INT8 y al offloading por bloques, el modelo puede ejecutarse en GPUs de consumo alto con 13-14 GiB de VRAM, lo que habilita estaciones de trabajo locales para artistas tecnicos.
- Outpainting y extension de encuadre: el ejemplo de edicion muestra un outpaint a 16:9, aplicable a la adaptacion de fotografias a formatos de redes sociales o cine.
- Generacion de material visual para marketing con control de estilo fotografico: la model card demuestra prompts con lentes de 35 mm, apertura f/4 e ISO 200, lo que permite emular estilos fotograficos concretos de forma reproducible con semilla fija.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente incluye comparativas visuales cualitativas entre bf16 e INT8 con la misma semilla y prompt, ademas de mediciones de VRAM: 13,2 GiB en generacion a 2720x1536 y 14,5 GiB en edicion, medidas con offloading por bloques del transformer y el codificador de texto y el VAE en GPU.

## Requisitos de hardware

- VRAM estimada: aproximadamente 13,2 GiB para generacion text-to-image a 2720x1536 y 14,5 GiB para edicion, segun la model card, con offloading por bloques del transformer.
- En disco, el transformer ocupa 33,3 GB y el codificador de texto 4,8 GB; el repositorio completo suma 43,9 GB.
- GPU recomendadas: no se especifican modelos concretos; por el perfil de VRAM, encajan GPUs con 16 GB o mas (por ejemplo, RTX 4080/4090, A100 40 GB, H100) siempre que se aplique el esquema de offloading descrito.
- Cabe en GPU de consumo con 16 GB o superior aplicando offloading por bloques; no se documenta su comportamiento en GPUs de 8-12 GB.
- Opciones de despliegue: Diffusers instalado desde el codigo fuente (`pip install git+https://github.com/huggingface/diffusers`) y SDNQ v0.2.8 o superior; se debe importar `sdnq` antes de cargar el pipeline. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| OzzyGT/P_H3_Image_sdnq_dynamic_8bit | 33.144.138.496 | no disponible | minimax-h3-community-license-agreement | safetensors INT8 | Cuantizacion SDNQ del base; ~13-14 GiB VRAM con offloading |
| PrunaAI/P-H3-Image | no disponible | no disponible | minimax-h3-community-license-agreement | safetensors bf16 | Modelo base sin cuantizar; mayor huella de VRAM y disco |
| Alternativas de difusion de gran tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Modelo unicamente en ingles: los prompts y el texto renderizado se han validado en ingles; no hay evidencia de soporte multilingue.
- Requiere dependencias no publicadas en version estable: SDNQ v0.2.8 o superior y Diffusers desde el codigo fuente, lo que complica la reproducibilidad en entornos de produccion.
- El prompt upsampler no esta incluido; si se conserva el paso, se descarga en bf16 desde el modelo base, anadiendo peso y dependencia externa.
- No se exponen parametros de muestreo habituales (`num_inference_steps`, `guidance_scale`, prompt negativo), lo que limita el control fino sobre el resultado.
- La licencia minimax-h3-community-license-agreement debe revisarse antes de cualquier uso comercial; no es una licencia permisiva estandar y puede imponer restricciones adicionales.
- Riesgo de alucinacion visual y de texto renderizado incorrecto en imagenes complejas; la model card no documenta evaluaciones sistematicas de fidelidad.
- No hay datos publicos sobre sesgos demograficos, de estilo o culturales del modelo base ni de la cuantizacion.
- Ausencia de descargas y validacion comunitaria: el checkpoint es muy reciente y no cuenta con evidencia independiente de calidad.
- La cuantizacion INT8 puede degradar detalles finos en comparacion con bf16; las comparativas publicadas son cualitativas y no cuantifican la perdida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/OzzyGT/P_H3_Image_sdnq_dynamic_8bit
- Modelo base: https://huggingface.co/PrunaAI/P-H3-Image
- Repositorio SDNQ: https://github.com/Disty0/sdnq
- Diffusers (instalacion desde fuente): https://github.com/huggingface/diffusers
- Recetas de Diffusers para P-H3-Image: https://github.com/asomoza/diffusers-recipes/blob/main/models/p_h3_image/README.md
- Ejemplos de imagenes bf16 e INT8: https://huggingface.co/datasets/OzzyGT/diffusers-examples
- Fotografia de referencia (Unsplash, Nejc Soklic): https://unsplash.com/photos/white-rhinoceros-in-golden-sunlight-NfJ5h57r58w
