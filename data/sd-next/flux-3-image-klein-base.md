# SD-Next/flux-3-image-klein-base

## Resumen

FLUX 3 Image Klein Base es un modelo de pesos abiertos de 5.538.458.368 parametros orientado a generacion de imagen a partir de texto y a edicion de imagen. Lo desarrolla Black Forest Labs y esta publicado bajo la licencia FLUX Kommunity. La ficha que se analiza aqui es un espejo mantenido por SD-Next (revision `1469d27c`) del repositorio original `black-forest-labs/flux-3-image-klein-base`, pensado para su uso con SD.Next y con las pipelines modulares de diffusers.

El modelo cubre tres tareas dentro del mismo transformer de imagen: text-to-image, edicion con una unica imagen de referencia y composicion con multiples referencias (hasta 10 imagenes de entrada), devolviendo siempre una sola imagen. El encoder de texto es independiente del transformer de imagen y corresponde a Qwen3-VL-4B-Instruct, de modo que la etiqueta "5.6B" se refiere unicamente al transformer de imagen.

La relevancia de este checkpoint concreto frente a la variante publicada para generacion es que se trata del modelo base sin destilar: 50 pasos de inferencia con guidance 3.5, frente a los 16 pasos sin guidance del checkpoint destilado que alimenta la API de BFL. Esto lo hace apropiado para fine-tuning, entrenamiento de LoRA e investigacion, no tanto para despliegue directo en produccion con latencia ajustada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de imagen para difusion, con autoencoder de imagen (VAE) y text encoder separado; no se detalla en la informacion disponible el tipo de atencion ni el objetivo de entrenamiento |
| Parametros totales | 5.538.458.368 (transformer de imagen; el text encoder Qwen3-VL-4B-Instruct es adicional) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (raiz del repositorio original), FP8 (`variants/fp8r`) y NVFP4 (`variants/nvfp4`) en el repositorio original; el espejo de SD-Next no incluye la carpeta de variantes cuantizadas |
| Idiomas soportados | Ingles (en) |
| Licencia | FLUX Kommunity License (`flux-kommunity-license`), con uso no comercial por defecto y excepcion de salida comercial para "Qualifying Users" sujeta a los terminos |
| Formato de pesos | Safetensors (`model.safetensors`, `ae.safetensors`, `text_encoder/*`) |

## Arquitectura y entrenamiento

La informacion disponible describe un transformer de imagen de 5,6B parametros que trabaja junto a un autoencoder de imagen (`ae.safetensors`) y a un text encoder externo, Qwen3-VL-4B-Instruct. La libreria declarada es diffusers y la pipeline es de tipo image-to-image con pipeline modular. No se especifican en la model card el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO. Tampoco se detalla la variante concreta de atencion ni el objetivo de entrenamiento (flow matching u otro).

La diferencia tecnica relevante entre checkpoints es el proceso de destilacion. Este repositorio contiene el checkpoint base sin destilar, configurado para 50 pasos de inferencia con guidance 3.5, mientras que el checkpoint destilado (`black-forest-labs/flux-3-image-klein`) resuelve la generacion en 16 pasos sin guidance y es el que sirve en la API de BFL. El modelo incorpora control de composicion mediante bounding boxes expresadas en el propio prompt sobre una rejilla de 0 a 1000; esas cajas guian colocacion y escala, pero no restringen los pixeles a una mascara dura.

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con un unico prompt.
- Edicion de imagen con una referencia: se pasa una imagen y un prompt que describe el cambio.
- Composicion multi-referencia: admite hasta 10 imagenes de referencia en una misma generacion.
- Control espacial mediante bounding boxes en el prompt, sobre rejilla 0-1000, con posibilidad de recolorear, mover, reemplazar o eliminar elementos descritos.
- Renderizado de texto dentro de la imagen generada.
- Comprension de prompts en ingles, apoyada en el text encoder Qwen3-VL-4B-Instruct, que aporta capacidad multimodal de vision-lenguaje en la codificacion de las referencias.
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso; no aplica a un modelo de difusion de imagen.
- No se documenta soporte de audio, video ni otras modalidades de salida distintas de la imagen estatica.

## Casos de uso

- Edicion fotografica por prompt: a partir de una fotografia y una instruccion en lenguaje natural ("la misma escena ahora de noche, con luz lunar"), el modelo devuelve la imagen editada, lo que permite flujos de retoque sin mascarás manuales.
- Composicion de producto con multiples referencias: combinando hasta 10 imagenes de referencia se puede generar una escena coherente con un producto, su packaging y su entorno, util para catalogos de e-commerce.
- Generacion de material grafico para campanas: el control por bounding boxes permite fijar la posicion de titulares, logotipos y elementos secundarios mediante el prompt, reduciendo iteraciones de diseno.
- Maquetacion con texto integrado: la capacidad de renderizar texto dentro de la imagen sirve para prototipos de carteles, portadas o banners donde el copy forma parte de la composicion.
- Entrenamiento de LoRA y fine-tuning: al ser el checkpoint sin destilar, es la base adecuada para adaptar el modelo a un estilo, dominio o marca concreta y despues destilar o exportar variantes.
- Investigacion en generacion condicionada: la combinacion de referencias multiples y control espacial por cajas ofrece un banco de pruebas para estudiar condicionamiento estructural en modelos de difusion.
- Preprocesado de assets para pipelines de diseno: integrado en SD.Next o en diffusers, permite generar variaciones de una imagen existente como paso previo a una revision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del numero de parametros y del formato de pesos, no datos publicados por el autor.

- Transformer en BF16: aproximadamente 11,1 GB solo en pesos (5.538.458.368 x 2 bytes).
- Transformer en FP8: aproximadamente 5,5 GB en pesos (variante no incluida en el espejo de SD-Next).
- Transformer en NVFP4: aproximadamente 2,8 GB en pesos (variante no incluida en el espejo de SD-Next).
- Componentes adicionales: el text encoder Qwen3-VL-4B-Instruct es independiente y hay que sumarlo al presupuesto de memoria; el autoencoder de imagen tambien ocupa VRAM. La model card no publica el peso exacto de estos componentes.
- Prompt upsampler opcional (`black-forest-labs/flux-3-image-klein-pup`): 18,8 GB adicionales segun la model card; puede omitirse con la opcion `--no-pup`.
- Clasificador de seguridad `Falconsai/nsfw_image_detection`: se carga siempre en la implementacion de referencia.
- GPU recomendadas: para BF16 con todos los componentes, se necesita una GPU de 24 GB o mas (RTX 3090, RTX 4090, L40S, A100 40 GB, H100). Con NVFP4, los pesos del transformer caben en GPUs consumer de 8-12 GB, aunque el presupuesto total depende del text encoder y del VAE.
- Opciones de despliegue: diffusers con pipeline modular, la implementacion de referencia `black-forest-labs/flux-3-image-klein` (CLI) y SD.Next. La model card no menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que son motores orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. Como referencia de coste computacional, el checkpoint base usa 50 pasos con guidance 3.5 frente a los 16 pasos sin guidance del destilado, por lo que el numero de evaluaciones del transformer es aproximadamente tres veces mayor.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Pasos de inferencia | Guidance | Destilado | Licencia | Orientacion |
|---|---|---|---|---|---|---|
| FLUX 3 Image Klein Base (este) | 5.538.458.368 | 50 | 3,5 | No | FLUX Kommunity License | Fine-tuning, LoRA, investigacion |
| FLUX 3 Image Klein (destilado) | 5.538.458.368 | 16 | Ninguno | Si | FLUX Kommunity License | Generacion y edicion, self-hosting, API de BFL |

No hay datos en la informacion proporcionada sobre otros modelos comparables de la misma categoria (parametros, contexto, rendimiento o disponibilidad), por lo que no se incluye una comparacion adicional.

## Limitaciones y advertencias

- Sesgos: no se documenta ningun analisis de sesgos en la informacion disponible. Al ser un modelo entrenado mayoritariamente con datos en ingles, es previsible un sesgo cultural y de representacion hacia ese contexto, aunque no se cuantifica.
- Alucinacion: no aplica en el sentido de un modelo de lenguaje, pero si existe riesgo de que la imagen generada no respete fielmente el prompt o las referencias, especialmente en composiciones con muchas imagenes de entrada.
- Idioma: los prompts estan soportados en ingles segun la etiqueta de idioma (`en`). No se documenta calidad en castellano ni en otros idiomas.
- Las bounding boxes guian la colocacion y la escala, pero no actuan como mascara dura: los pixeles no quedan confinados a la caja indicada.
- Licencia: la FLUX Kommunity License permite uso no comercial y una excepcion de salida comercial para "Qualifying Users" sujeta a condiciones. Antes de usar el modelo o sus salidas en produccion comercial hay que revisar `LICENSE.md` y `NOTICE.md`.
- Este checkpoint es la version sin destilar, con 50 pasos y guidance 3.5: no es la configuracion optima para servir en produccion con latencia baja. Para eso esta la variante destilada.
- El espejo de SD-Next no incluye la carpeta de variantes cuantizadas (`fp8r`, `nvfp4`), por lo que quien lo descargue desde este repositorio solo obtiene los pesos BF16.
- El repositorio no incluye una aplicacion de inferencia completa; es un paquete de pesos que requiere una implementacion compatible (diffusers modular, SD.Next o el codigo de referencia).
- El clasificador NSFW se carga siempre en la implementacion de referencia, lo que implica un coste adicional de memoria y computo.
- El modelo espejo no tiene descargas ni "likes" registrados, y el contenido del repositorio debe verificarse contra el original antes de confiar en el.

## Enlaces

- Repositorio en HuggingFace (espejo SD-Next): https://huggingface.co/SD-Next/flux-3-image-klein-base
- Repositorio original del checkpoint base: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Checkpoint destilado: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Codigo de inferencia de referencia: https://github.com/black-forest-labs/flux-3-image-klein
- Variantes cuantizadas del original: https://huggingface.co/black-forest-labs/flux-3-image-klein-base/tree/main/variants/fp8r y https://huggingface.co/black-forest-labs/flux-3-image-klein-base/tree/main/variants/nvfp4
- Prompt upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- Clasificador de seguridad: https://huggingface.co/Falconsai/nsfw_image_detection
- SD.Next: https://github.com/vladmandic/sdnext
- API de BFL: https://bfl.ai
- Nota: la busqueda web asociada a esta ficha devolvio unicamente resultados sobre tarjetas de memoria SD, sin relacion con el modelo; no se han incluido por no ser relevantes.
