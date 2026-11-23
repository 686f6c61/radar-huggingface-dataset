# kiel2/KielForge-HD

## Resumen

KielForge-HD (publicado por el autor kiel2 bajo la marca KielTech y presentado en la model card como Kiel-2-Image-HD) es un modelo de difusion derivado de Stable Diffusion XL Base 1.0, orientado a la generacion de imagenes en alta definicion con un enfasis declarado en retratos de personajes, texturas de piel ricas, iluminacion cinematografica y consistencia estilistica. Se distribuye tanto como adaptador LoRA (PEFT) como en forma de checkpoint fusionado en fp16 y de cuantizacion GGUF de 4 bits, lo que permite integrarlo en flujos de trabajo con Diffusers, ComfyUI u otras herramientas compatibles.

Tecnicamente se apoya en la arquitectura UNet de SDXL con doble text encoder (CLIP ViT-L y OpenCLIP ViT-bigG), resuelve entrenamiento e inferencia a 1024x1024 y soporta pipelines de texto-a-imagen y de imagen-a-imagen. El recuento real de parametros de los pesos safetensors es de 2.660.360.964, coherente con el tamano del UNet de SDXL mas los componentes asociados; el repositorio ocupa 31,4 GB e incluye el checkpoint completo ademas de los pesos LoRA.

Su relevancia actual es la de un ajuste fino comunitario de SDXL: no introduce una arquitectura nueva, sino que especializa el modelo base mediante LoRA para un estilo concreto de retrato cinematografico. Resulta util para equipos que ya trabajan con SDXL y quieren incorporar un look especifico sin cambiar de pipeline, aunque con un historico de adopcion muy limitado (446 descargas y 1 like en el momento de la consulta) y sin documentacion de benchmarks ni de composicion del dataset de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer/UNet de Stable Diffusion XL (base: stabilityai/stable-diffusion-xl-base-1.0) |
| Parametros totales | 2.660.360.964 (pesos safetensors del repositorio) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica; ventana de texto limitada por los tokenizers CLIP de SDXL (77 tokens por encoder, ampliable por truncado/compilacion) |
| Tipos de cuantizacion | fp16 (checkpoint fusionado), LoRA PEFT en safetensors, GGUF Q4_K_M (4 bits) |
| Idiomas soportados | no disponible (los prompts dependen de los text encoders CLIP de SDXL, predominantemente ingles) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | safetensors (LoRA y checkpoint fusionado fp16), GGUF (Q4_K_M) |

## Arquitectura y entrenamiento

El modelo hereda integramente la arquitectura de SDXL Base 1.0: un UNet con bloques de atencion cruzada y residuales, dos text encoders (CLIP ViT-L/14 y OpenCLIP ViT-bigG/14) y un VAE para codificar y decodificar imagenes latentes a 1024x1024. Sobre esta base se ha entrenado un adaptador LoRA que modifica los pesos del UNet y, presumiblemente, de las proyecciones de atencion, para sesgar la generacion hacia retratos de personaje con iluminacion dramatica y textura de piel detallada. El repositorio ofrece tres artefactos: `pytorch_lora_weights.safetensors` (adaptador PEFT cargable con `load_lora_weights`), `model_merged_fp16.safetensors` (checkpoint completo fusionado en 16 bits) y `model_Q4_K_M.gguf` (cuantizacion de 4 bits para inferencia local con memoria reducida).

No se dispone de informacion sobre el numero de pasos de entrenamiento, el volumen o la composicion del dataset, el uso de tecnicas de regularizacion (por ejemplo, captions descriptivos, DreamBooth, LoRA de rango bajo) ni sobre procesos de ajuste por preferencias humanos. La model card no documenta hiperparametros de entrenamiento, learning rate, resolucion de las imagenes de entrenamiento mas alla del estandar 1024x1024, ni si se emplearon tecnicas como decodificacion especulativa o samplers concretos. Tampoco se indica si el adaptador fue entrenado con el UNet congelado y solo las capas de atencion, que es lo habitual en LoRA para difusion.

## Capacidades

- Generacion de imagenes texto-a-imagen a 1024x1024 con estilos cinematograficos y de retrato de personaje.
- Transformacion imagen-a-imagen con control de fuerza (`strength`) para reestilizar o refinar imagenes de entrada.
- Especializacion en texturas de piel, iluminacion dramatica y coherencia estilistica de personajes, segun declara el autor.
- Compatibilidad con prompts negativos para suprimir artefactos como piel cerosa, desenfoque o deformaciones faciales.
- Carga como LoRA sobre el pipeline base de SDXL, lo que permite combinarlo o escalarlo con `cross_attention_kwargs={"scale": ...}`.
- Soporte de inferencia con memoria reducida mediante CPU offload y mediante la variante GGUF Q4_K_M.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio; es un modelo exclusivamente generativo de imagen.

## Casos de uso

- Generacion de retratos de personaje para videojuegos o narrativa visual: el LoRA produce rostros coherentes con iluminacion cinematografica a 1024x1024, adecuado para fichas de personaje y arte conceptual inicial.
- Previsualizacion de arte conceptual en estudios pequenos: al cargarse como LoRA sobre SDXL, permite alternar entre el estilo KielForge y el modelo base sin duplicar pipelines ni VRAM.
- Reestilizacion de fotografias existentes con imagen-a-imagen: usando `strength` entre 0.6 y 0.8 se pueden convertir retratos reales en imagenes con el look del modelo manteniendo la composicion original.
- Integracion en ComfyUI para flujos de trabajo de artista: la variante GGUF Q4_K_M reduce el consumo de memoria y permite ejecutar el modelo en estaciones con GPU de gama media.
- Generacion de material promocional tematico: retratos con iluminacion dramatica para portadas, banners o ilustraciones de campana, con control de estilo mediante el escalado del LoRA.
- Prototipado rapido de personajes consistentes en produccion de comics o novelas ligeras: el enfasis del autor en consistencia estilistica facilita mantener un mismo aspecto entre distintas poses e imagenes.
- Experimentacion academica con adaptadores LoRA sobre SDXL: el repositorio ofrece los tres formatos (LoRA, checkpoint fusionado y GGUF), lo que simplifica comparar el efecto del adaptador frente al modelo base en condiciones controladas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas como FID, CLIP score, evaluaciones humanas de preferencia ni comparaciones cuantitativas con otros ajustes de SDXL.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16 con el pipeline SDXL completo: en torno a 10-12 GB, reducible con `enable_model_cpu_offload()` o con atencion eficiente.
- VRAM estimada con la variante GGUF Q4_K_M: aproximadamente 4-6 GB, segun el backend de inferencia empleado.
- GPU recomendadas: NVIDIA A100 o H100 para lotes grandes y produccion; RTX 4090 (24 GB) para fp16 sin offload; RTX 3090 (24 GB) como alternativa de coste.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 (16 GB) y, con la cuantizacion GGUF, potencialmente en GPUs de 8 GB como la RTX 3070 o la RTX 4060 Ti, con margen limitado.
- Opciones de despliegue: Diffusers (`StableDiffusionXLPipeline` y `StableDiffusionXLImg2ImgPipeline`), ComfyUI con el GGUF, y cualquier runtime compatible con LoRA PEFT sobre SDXL. No se documenta soporte especifico para vLLM ni TGI, que no estan orientados a modelos de difusion.
- Latencia y throughput: no disponibles. La model card sugiere 35 pasos de inferencia y `guidance_scale` de 7.5, valores habituales en SDXL, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/resolucion | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| KielForge-HD | 2.660.360.964 | 1024x1024 | creativeml-openrail-m | Hugging Face (kiel2) | LoRA y checkpoint fusionado sobre SDXL; foco en retratos cinematograficos |
| stabilityai/stable-diffusion-xl-base-1.0 | ~3.500 millones (UNet + text encoders) | 1024x1024 | creativeml-openrail-m | Hugging Face | Modelo base generico; sin especializacion de estilo |
| SDXL Turbo / Lightning (variantes de destilacion) | similar a SDXL | 512-1024 px | segun variante | Hugging Face | Optimizados para pocos pasos; no especializados en retrato |
| Adaptadores LoRA comunitarios para retrato sobre SDXL | variable (decenas a cientos de MB) | 1024x1024 | variable | Hugging Face, Civitai | Comparable en enfoque; KielForge-HD no aporta benchmarks que permitan situarlo frente a ellos |

No se dispone de datos de rendimiento comparativo que permitan establecer una jerarquia objetiva frente a estos modelos; la comparacion se limita a parametros, licencia y disponibilidad.

## Limitaciones y advertencias

- No se han publicado evaluaciones de sesgo; al derivar de SDXL, hereda los sesgos de representacion del modelo base en cuanto a genero, etnia, edad y estetica corporal.
- Riesgo de alucinacion visual: deformaciones de manos, rostros y texto en la imagen, especialmente con prompts alejados del dominio de entrenamiento (retratos).
- El modelo esta especializado en retratos de personaje; su rendimiento en paisajes, objetos o ilustracion tecnica no esta documentado y probablemente sea inferior al del SDXL base.
- Idiomas: no hay informacion sobre soporte multilingue; los text encoders CLIP de SDXL estan entrenados predominantemente en ingles, por lo que los prompts en castellano pueden degradar la calidad.
- Licencia CreativeML OpenRAIL-M: permite uso comercial con restricciones de uso (prohibicion de usos daninos descritos en la licencia) y requiere que las obras derivadas mantengan la misma licencia y sus restricciones de uso.
- El autor no documenta el dataset de entrenamiento, lo que impide evaluar riesgos de memorizacion de imagenes o de derechos de terceros.
- Adopcion muy baja (446 descargas, 1 like) y sin mantenimiento documentado mas alla de la actualizacion del repositorio; no hay garantias de soporte.
- La model card usa un identificador distinto (kiel2/Kiel-2-Image-HD) del ID real del repositorio (kiel2/KielForge-HD), lo que puede generar confusion en la carga programatica.
- El checkpoint fusionado en fp16 ocupa gran parte de los 31,4 GB del repositorio; conviene descargar solo el LoRA o el GGUF si el ancho de banda o el almacenamiento son limitados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/kiel2/KielForge-HD
- Modelo base SDXL 1.0: https://huggingface.co/stabilityai/stable-diffusion-xl-base-1.0
- Documentacion de Diffusers para SDXL: https://huggingface.co/docs/diffusers/using-diffusers/sdxl
- Documentacion de Diffusers para carga de LoRA: https://huggingface.co/docs/diffusers/using-diffusers/loading_adapters
- Licencia CreativeML OpenRAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Referencia de imagen de entrada usada en el ejemplo de la model card: https://huggingface.co/datasets/huggingface/documentation-images/resolve/main/diffusers/input_file_sd.png
