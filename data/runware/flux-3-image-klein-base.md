# Runware/flux-3-image-klein-base

## Resumen

FLUX 3 Image Klein Base es un modelo de generacion y edicion de imagenes de 5.538.458.368 parametros (etiquetado como 5,6B) publicado por Black Forest Labs y redistribuido en HuggingFace bajo la cuenta de Runware. Se trata del checkpoint base sin destilar (undistilled) del modelo FLUX 3 Image Klein, pensado especificamente para fine-tuning, entrenamiento de LoRAs e investigacion, en contraste con el checkpoint destilado (16 pasos, sin guidance) que es el que sirve generacion y edicion en produccion y alimenta la API de BFL.

El modelo unifica en una sola arquitectura tres tareas: generacion texto-a-imagen, edicion con una unica imagen de referencia y composicion con multiples referencias (hasta 10 imagenes de entrada), devolviendo siempre una imagen. El encoder de texto es Qwen3-VL-4B-Instruct, un componente separado que no forma parte de los 5,6B del transformer de imagen. Ademas de la generacion, el modelo acepta bounding boxes en el prompt sobre una rejilla de 0 a 1000 para colocar, recolorear, mover, reemplazar o eliminar elementos de la escena, y es capaz de renderizar texto legible dentro de las imagenes generadas.

Su relevancia actual radica en que combina pesos abiertos con licencia FLUX Kommunity, soporte nativo en Diffusers, variantes cuantizadas (FP8 y NVFP4) y un mecanismo de control espacial mediante cajas. Requiere obligatoriamente un prompt upsampler: el modelo espera descripciones de escena completas y ofrece resultados genericos si se le envia un prompt corto tal cual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de imagen (familia FLUX) con encoder de texto Qwen3-VL-4B-Instruct; pipeline modular texto-a-imagen e imagen-a-imagen |
| Parametros totales | 5.538.458.368 (transformer de imagen; el encoder de texto es un componente separado de 4B) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (raiz), FP8 (`variants/fp8r`), NVFP4 (`variants/nvfp4`) |
| Idiomas soportados | en (ingles) |
| Licencia | flux-kommunity-license (FLUX Kommunity License) |
| Formato de pesos | safetensors (transformer, autoencoder `ae.safetensors` y `text_encoder/*`), mas `config.json` y `manifest.json` |

## Arquitectura y entrenamiento

La model card describe FLUX 3 Image Klein como un modelo de pesos abiertos con un "image transformer" de 5,6B parametros que se combina con Qwen3-VL-4B-Instruct como encoder de texto y un autoencoder de imagen. El transformer no esta destilado en esta variante (a diferencia de FLUX 3 Image Klein destilado), lo que implica que la generacion requiere 50 pasos de muestreo con guidance 3.5, frente a los 16 pasos sin guidance del checkpoint destilado. La model card no detalla la composicion del dataset de entrenamiento, el numero de tokens ni si se emplearon tecnicas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada.

La innovacion funcional mas destacable es la unificacion de tareas: generacion pura, edicion con una referencia y composicion multi-referencia se resuelven con el mismo modelo, aceptando hasta 10 imagenes de entrada. El control espacial se realiza mediante bounding boxes incluidas en el prompt sobre una rejilla de 0 a 1000; estas cajas orientan la colocacion y la escala, pero no actuan como mascara dura sobre los pixeles. El modelo incorpora ademas renderizado de texto legible dentro de la imagen generada. El repositorio incluye los pesos BF16 junto con las variantes cuantizadas FP8 y NVFP4 y los componentes compartidos (encoder de texto y autoencoder).

## Capacidades

- Generacion de imagen a partir de texto (text-to-image) con descripciones de escena completas.
- Edicion de imagen con una unica imagen de referencia (image-to-image), incluyendo cambio de iluminacion, estilo o elementos de la escena.
- Composicion con multiples referencias: acepta hasta 10 imagenes de entrada y produce una unica imagen de salida.
- Control espacial mediante bounding boxes expresadas en una rejilla de 0 a 1000 dentro del prompt, para colocar, recolorear, mover, reemplazar o eliminar elementos.
- Renderizado de texto dentro de la imagen generada.
- Capacidad de fine-tuning y entrenamiento de LoRA a partir del checkpoint base sin destilar.
- Soporte de prompt upsampling mediante un modelo externo (flux-3-image-klein-pup, de 9B) o cualquier LLM con un system prompt adecuado.
- Soporte en la libreria Diffusers mediante el pipeline modular (`prompt` para texto-a-imagen, `image` para edicion).

## Casos de uso

- Estudio de generacion de imagenes controlada: artistas y disenadores pueden describir la escena completa y usar bounding boxes para fijar la posicion y escala de cada elemento, iterando el resultado con prompts de edicion sucesivos.
- Edicion fotografica asistida: dado un material de referencia, se puede modificar el ambiente (por ejemplo, "la misma escena de noche bajo una luna llena"), recurriendo a la modalidad imagen-a-imagen del mismo modelo.
- Composicion multi-referencia para maquetacion: combinar hasta 10 referencias en una sola imagen es util para generar mockups de producto, collages de marca o escenas coherentes a partir de varios activos visuales.
- Generacion de carteles y material con texto: la capacidad de renderizar texto legible dentro de la imagen sirve para banners, etiquetas y carteles que requieren tipografia integrada.
- Investigacion en modelos de difusion: al ser un checkpoint no destilado, es la base adecuada para estudiar el comportamiento del muestreo a 50 pasos con guidance 3.5, las dinamicas de la destilacion y el efecto del prompt upsampling.
- Entrenamiento de LoRA y fine-tuning de dominio: el checkpoint base esta pensado explicitamente para personalizacion sobre estilos, productos o dominios concretos antes de destilar o desplegar.
- Pipelines de generacion por lotes mediante Diffusers: la integracion nativa con Diffusers permite encadenar el modelo en flujos automatizados junto con el clasificador de seguridad (Falconsai/nsfw_image_detection) que la implementacion de referencia carga siempre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Los pesos BF16 del transformer de 5,6B y el encoder de texto Qwen3-VL-4B ocupan en conjunto una parte relevante de los 43,2 GB del repositorio, que incluye tambien las variantes cuantizadas.
- Estimacion orientativa de VRAM para BF16: alrededor de 11-12 GB solo para el transformer de 5,6B, mas aproximadamente 8 GB para el encoder de texto Qwen3-VL-4B, mas el autoencoder y las activaciones; conviene reservar un margen adicional.
- Las variantes FP8 (`variants/fp8r`) y NVFP4 (`variants/nvfp4`) reducen el peso del transformer y estan pensadas para despliegues con menor presupuesto de memoria; la model card advierte que el tamano de fichero de una variante cuantizada no equivale al uso total de memoria de GPU.
- El prompt upsampler (`black-forest-labs/flux-3-image-klein-pup`) anade unos 18,8 GB adicionales si se descarga en local y se carga por defecto.
- Cabe en GPU de consumo con cuantizacion (FP8 o NVFP4) y margen de VRAM suficiente, aunque el requisito simultaneo del encoder de texto y, opcionalmente, del upsampler eleva el presupuesto total.
- Opciones de despliegue: Diffusers (pipeline modular), la implementacion de referencia en GitHub (`scripts/cli.py`) y las variantes cuantizadas con un loader compatible con su formato. No se mencionan vLLM, llama.cpp u Ollama para este modelo.
- No se proporcionan datos de latencia ni throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos / guidance | Destilado | Uso previsto | Licencia |
|---|---|---|---|---|---|
| FLUX 3 Image Klein Base | 5,6B (transformer) + Qwen3-VL-4B | 50 pasos, guidance 3.5 | No | Fine-tuning, LoRA, investigacion | FLUX Kommunity License |
| FLUX 3 Image Klein | 5,6B (transformer) + Qwen3-VL-4B | 16 pasos, sin guidance | Si | Generacion y edicion, self-hosting; checkpoint de la API BFL | FLUX Kommunity License |

No se dispone en la informacion proporcionada de datos de benchmarks ni de especificaciones detalladas de otros modelos comparables (por ejemplo, generaciones anteriores de la familia FLUX), por lo que no es posible completar una comparativa cuantitativa con alternativas externas.

## Limitaciones y advertencias

- Requiere obligatoriamente un prompt upsampler: enviar un prompt corto tal cual produce resultados genericos. Diffusers no ejecuta el upsampler por si solo; hay que integrarlo explicitamente.
- El checkpoint base no esta destilado, por lo que necesita 50 pasos de muestreo y guidance 3.5, lo que implica mayor coste de inferencia que la variante destilada.
- Solo soporta ingles (`en`); no se declara soporte multilingue.
- No se han publicado benchmarks oficiales, por lo que no hay cifras verificables de calidad frente a alternativas.
- Riesgo de alucinacion visual y de incoherencias en escenas complejas, especialmente con prompts cortos o sin upsampling; no se documentan tasas.
- Las bounding boxes guian la colocacion y la escala, pero no restringen los pixeles a una mascara dura: el resultado no esta garantizado pixel a pixel.
- La licencia FLUX Kommunity permite uso no comercial y ofrece una excepcion de salida comercial para "Qualifying Users" sujeta a sus terminos; el uso comercial general requiere revisar el texto completo de `LICENSE.md`.
- La implementacion de referencia carga siempre un clasificador de seguridad (Falconsai/nsfw_image_detection); en despliegues propios conviene replicar filtros equivalentes.
- Este repositorio esta publicado bajo la cuenta de Runware en HuggingFace (0 descargas y 0 likes en el momento de la consulta) mientras la model card remite a los repositorios oficiales de black-forest-labs; conviene verificar la procedencia y la integridad de los pesos para uso en produccion.
- El upsampler por defecto (18,8 GB) y el encoder de texto incrementan notablemente los requisitos de memoria y almacenamiento mas alla del propio transformer.

## Enlaces

- HuggingFace (Runware): https://huggingface.co/Runware/flux-3-image-klein-base
- Checkpoint base oficial: https://huggingface.co/black-forest-labs/flux-3-image-klein-base
- Checkpoint destilado: https://huggingface.co/black-forest-labs/flux-3-image-klein
- Prompt upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup
- System prompts del upsampler: https://huggingface.co/black-forest-labs/flux-3-image-klein-pup/blob/main/system_prompts.json
- Variantes cuantizadas: https://huggingface.co/black-forest-labs/flux-3-image-klein-base/tree/main/variants/fp8r y https://huggingface.co/black-forest-labs/flux-3-image-klein-base/tree/main/variants/nvfp4
- Codigo de inferencia de referencia: https://github.com/black-forest-labs/flux-3-image-klein
- Clasificador de seguridad: https://huggingface.co/Falconsai/nsfw_image_detection
- API BFL: https://bfl.ai
- Runware: https://runware.ai/ ; precios: https://runware.ai/pricing ; catalogo de modelos: https://runware.ai/models ; acerca de: https://runware.ai/about ; panel: https://my.runware.ai/
