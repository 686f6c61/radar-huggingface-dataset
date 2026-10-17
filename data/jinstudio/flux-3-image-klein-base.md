# Jinstudio/flux-3-image-klein-base

## Resumen

FLUX 3 Image Klein Base es un modelo de difusion de pesos abiertos de 5.538.458.368 parametros (aproximadamente 5,6B) dedicado a generacion de imagen a partir de texto y a edicion de imagenes. Lo desarrolla Black Forest Labs (BFL) y esta publicado originalmente en el repositorio `black-forest-labs/flux-3-image-klein-base`; la ficha que se documenta aqui es un espejo sin gate alojado por el usuario Jinstudio, con los pesos sin modificar, segun la propia model card (que atribuye la republicacion a Unsloth). El modelo acepta un prompt y hasta 10 imagenes de referencia, y devuelve una sola imagen, cubriendo text-to-image, edicion con una referencia y composicion con multiples referencias en un unico modelo.

La arquitectura se organiza en tres piezas separadas: un transformer de imagen de 5,6B parametros, un codificador de texto Qwen3-VL-4B-Instruct y un autoencoder de imagen. El etiquetado de "5,6B" se refiere unicamente al transformer de imagen, no al conjunto. El repositorio incluye el transformer en bfloat16 y variantes cuantizadas FP8 y NVFP4, ademas del text encoder y el autoencoder como componentes compartidos.

Es relevante porque se trata de la version base sin destilar, pensada para fine-tuning, entrenamiento de LoRA e investigacion, frente al checkpoint destilado (`flux-3-image-klein`, 16 pasos sin guidance) que es el que sirve la API de BFL. Dos rasgos tecnicos lo diferencian: el control de composicion mediante bounding boxes en la rejilla 0-1000 dentro del prompt, y el renderizado de texto dentro de la imagen generada. La licencia es la FLUX Kommunity License, que permite uso no comercial y contempla una excepcion de output comercial para usuarios que cumplan los requisitos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion con transformer de imagen y codificador de texto separado (Qwen3-VL-4B-Instruct) mas autoencoder de imagen; pipeline modular en Diffusers |
| Parametros totales | 5.538.458.368 en el transformer de imagen (el text encoder es un componente aparte, Qwen3-VL-4B-Instruct) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bfloat16 (raiz), FP8 (variantes/fp8r), NVFP4 (variantes/nvfp4) |
| Idiomas soportados | Ingles (en) |
| Licencia | flux-kommunity-license (licencia Kommunity de FLUX; permite uso no comercial y excepcion de output comercial para Qualifying Users) |
| Formato de pesos | safetensors (transformer, `ae.safetensors` y `text_encoder/*`), con libreria diffusers |

Datos adicionales de la ficha: pipeline declarado image-to-image; tamano del repositorio 43,2 GB; 0 descargas y 0 likes; creado el 2026-10-16 y actualizado el mismo dia.

## Arquitectura y entrenamiento

El modelo se compone de un transformer de difusion de 5,6B parametros para la parte visual, un codificador de texto Qwen3-VL-4B-Instruct y un autoencoder de imagen. La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO. Si se especifica el regimen de inferencia del checkpoint base: no esta destilado, usa 50 pasos y un valor de guidance de 3,5, en contraste con el checkpoint destilado, que usa 16 pasos y no aplica guidance. Esa diferencia de regimen es precisamente la que justifica la existencia de dos checkpoints con el mismo esqueleto.

En cuanto a innovaciones tecnicas, la model card destaca tres: la unificacion de text-to-image, edicion con una referencia y generacion multi-referencia en un solo modelo; el control de composicion mediante bounding boxes expresados en el prompt sobre una rejilla de 0 a 1000, que permiten recolocar, recolorear, reemplazar o eliminar elementos (las cajas guian posicion y escala, no restringen los pixeles a una mascara dura); y el renderizado de texto dentro de la imagen generada. Un aspecto operativo critico es la dependencia de un prompt upsampler: el modelo espera captions de escena completas, y un prompt corto enviado tal cual produce salidas genericas. La implementacion de referencia carga por defecto `flux-3-image-klein-pup` (18,8 GB), y tambien se puede usar cualquier LLM con un system prompt que expanda la peticion a un caption completo. La model card indica explicitamente que Diffusers no ejecuta el upsampler por si mismo. Ademas, la CLI de referencia carga siempre un clasificador de seguridad (`Falconsai/nsfw_image_detection`).

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con captions de escena completas.
- Edicion de imagen con una unica referencia de entrada (image-to-image).
- Composicion con multiples referencias: acepta hasta 10 imagenes de referencia y devuelve una imagen.
- Control de layout mediante bounding boxes en el prompt sobre una rejilla de 0 a 1000, incluyendo recolorear, mover, reemplazar o eliminar elementos.
- Renderizado de texto dentro de la imagen generada.
- Acepta prompts expandidos por un LLM externo (prompt upsampling) como modo de operacion recomendado.
- Idioma: ingles.
- Tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada general, audio y modo "thinking": no disponible / no aplicable, se trata de un modelo de generacion y edicion de imagen, no de un modelo de lenguaje conversacional.

## Casos de uso

- Edicion de producto en catalogo: se parte de una foto de producto como referencia y se pide al modelo el mismo objeto sobre fondos, iluminaciones o angulos distintos, manteniendo la identidad del articulo gracias al pipeline image-to-image y al uso de referencias.
- Composicion de escenas con varias referencias: para maquetas de marketing, se pasan como referencias el producto, el modelo humano y un elemento de atrezzo, y se solicita una escena coherente; el modelo soporta hasta 10 referencias en una misma peticion.
- Diseno de carteles y material grafico con texto integrado: el renderizado de texto dentro de la imagen permite generar piezas con titulares y etiquetas legibles sin recurrir a un editor externo.
- Control de layout en wireframes: usando las bounding boxes de la rejilla 0-1000, se puede especificar donde va cada elemento, lo que resulta util para generar variaciones de una composicion aprobada por diseno (banners, cabeceras, portadas).
- Iteracion de variantes sobre una imagen base: con image-to-image se encadenan cambios ("la misma escena de noche, con luna llena") para explorar direcciones artisticas sin volver a describir la escena completa.
- Fine-tuning y LoRA especifico de dominio: al ser el checkpoint base sin destilar con 50 pasos de inferencia, es la variante indicada para entrenar estilos propios, productos de marca o dominios concretos sobre los que el checkpoint destilado no se puede ajustar igual de bien.
- Investigacion en generacion y edicion multimodal: sirve como punto de partida reproducible para estudiar control por cajas, composicion multi-referencia o comportamiento del prompt upsampling, con pesos abiertos y espejo sin gate.
- Prototipado interno de pipeline de imagen: la disponibilidad de variantes FP8 y NVFP4 permite montar entornos de prueba con menos memoria y validar el flujo completo antes de pasar a produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

No hay datos de FID, CLIP score, GenEval, DPGBench ni metricas equivalentes para este checkpoint, ni comparativas numericas frente a otros modelos en el material proporcionado. Tampoco se publican cifras de latencia o throughput.

## Requisitos de hardware

- VRAM del transformer: estimacion a partir del recuento de parametros, no dato publicado por el autor. En bfloat16, 5.538.458.368 parametros suponen unos 11,1 GB solo de pesos; en FP8, unos 5,5 GB; en NVFP4, unos 2,8 GB.
- Componentes adicionales: hay que sumar el codificador de texto Qwen3-VL-4B-Instruct (aproximadamente 8 GB en bfloat16, la mitad en FP8), el autoencoder y las activaciones e imagenes latentes durante la difusion. El prompt upsampler opcional ocupa 18,8 GB en disco si se descarga.
- GPU recomendadas: no disponible en la informacion proporcionada. Como referencia de capacidad, una GPU con 24 GB de VRAM (RTX 4090, L40S, A10G de 24 GB) cubre los pesos en bfloat16 del transformer y el text encoder, aunque el margen es ajustado y conviene recurrir a las variantes FP8 o NVFP4 para ir mas holgado.
- En consumer GPU: no hay confirmacion oficial. Por tamano de pesos, las variantes FP8 y NVFP4 son las candidatas logicas para GPUs de 16-24 GB, pero el autor no publica una tabla de requisitos ni garantiza este escenario.
- Opciones de despliegue: Diffusers (libreria declarada) con el pipeline modular, y el codigo de referencia `black-forest-labs/flux-3-image-klein` mediante `pip install -e .` y `scripts/cli.py`. Las variantes cuantizadas necesitan un loader que soporte su formato; la model card advierte explicitamente de que el tamano de fichero no es una medida del uso total de memoria de GPU. No se mencionan vLLM, TGI, llama.cpp ni Ollama para este modelo.
- Latencia y throughput: no disponible. El unico dato operativo publicado es el numero de pasos: 50 pasos con guidance 3,5 en el checkpoint base, frente a 16 pasos sin guidance en el destilado.

## Comparativa con modelos similares

Los datos de la columna de FLUX 3 Image Klein Base proceden de la informacion proporcionada. Los de las alternativas son datos generales de catalogo y no se acompanan de benchmarks comparativos en el material disponible; no se dispone de comparacion de rendimiento entre ellos.

| Modelo | Parametros | Contexto / referencias | Licencia | Disponibilidad |
|---|---|---|---|---|
| FLUX 3 Image Klein Base | 5,538B en el transformer de imagen, mas Qwen3-VL-4B-Instruct como text encoder | No disponible; acepta hasta 10 imagenes de referencia | flux-kommunity-license (uso no comercial y excepcion de output comercial para Qualifying Users) | Pesos abiertos en HuggingFace, espejo sin gate, variantes bf16/FP8/NVFP4 |
| FLUX 3 Image Klein (destilado) | Mismo transformer de 5,6B, sin destilar el text encoder segun la informacion disponible | No disponible; mismas capacidades de referencia multiple | flux-kommunity-license | Pesos abiertos; es el checkpoint que sirve la API de BFL, 16 pasos sin guidance |
| Otras alternativas de la misma categoria (por ejemplo modelos de difusion de pesos abiertos de rango 8B-20B) | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados en la informacion proporcionada para construir una comparativa con alternativas concretas en parametros, contexto, rendimiento y licencia. Se indica "no disponible".

## Limitaciones y advertencias

- Dependencia critica del prompt upsampler: la model card advierte de forma explicita de no usar el modelo sin un upsampler de prompts. Los prompts cortos producidos directamente generan salidas genericas. Diffusers no ejecuta el upsampler por si mismo; hay que integrarlo aparte.
- Idioma: solo ingles declarado. No hay soporte multilingue documentado, lo que limita prompts en castellano u otros idiomas.
- Licencia: la FLUX Kommunity License es una licencia "other" que permite uso no comercial y contempla una excepcion de output comercial solo para Qualifying Users, sujeta a los terminos del fichero LICENSE.md. Conviene revisar esos terminos antes de cualquier uso en produccion o comercial.
- Es el checkpoint base sin destilar: requiere 50 pasos y guidance 3,5 frente a los 16 pasos sin guidance del destilado, por lo que es mas costoso en inferencia y esta orientado a fine-tuning, LoRA e investigacion mas que a despliegue directo.
- Contenido generado: la implementacion de referencia carga siempre un clasificador de seguridad NSFW, lo que anticipa la necesidad de filtrado en produccion.
- Sesgos conocidos: no disponible. La informacion proporcionada no documenta sesgos demograficos, culturales ni de estilo.
- Riesgo de alucinacion: no disponible como metrica. En generacion de imagen el equivalente seria la falta de fidelidad al prompt o a las referencias, y no se publican evaluaciones al respecto.
- Control por cajas no estricto: las bounding boxes guian posicion y escala, pero no restringen los pixeles a una mascara dura; no deben tratarse como una garantia de layout exacto.
- Repositorio de terceros: se trata de un espejo publicado por Jinstudio, no del repositorio oficial de Black Forest Labs. La model card atribuye la republicacion a Unsloth y afirma que los pesos no estan modificados, pero la trazabilidad conviene verificarla contra el repositorio upstream. El repositorio registra 0 descargas y 0 likes.
- Cuantizacion: el tamano del fichero de una variante cuantizada no equivale al consumo total de memoria de GPU, segun advierte la propia model card.

## Enlaces

- Modelo en HuggingFace (espejo documentado): https://huggingface.co/Jinstudio/flux-3-image-klein-base
- Checkpoint base oficial: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Checkpoint destilado: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Prompt upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- System prompts del upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup/blob/main/system_prompts.json
- Variantes FP8: https://huggingface.co/black-forest-labs/flux-3-image-klein-base/tree/main/variants/fp8r
- Variantes NVFP4: https://huggingface.co/black-forest-labs/flux-3-image-klein-base/tree/main/variants/nvfp4
- Codigo de inferencia de referencia en GitHub: https://github.com/black-forest-labs/flux-3-image-klein
- API de Black Forest Labs: https://bfl.ai
- Clasificador de seguridad NSFW usado por la CLI: https://huggingface.co/Falconsai/nsfw_image_detection

Nota: los resultados de busqueda web disponibles no contienen informacion relacionada con este modelo ni con Black Forest Labs, por lo que no aportan enlaces adicionales utilizables.
