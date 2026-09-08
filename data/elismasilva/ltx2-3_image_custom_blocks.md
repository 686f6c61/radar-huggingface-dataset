# elismasilva/ltx2.3_image_custom_blocks

## Resumen

`elismasilva/ltx2.3_image_custom_blocks` es un conjunto de bloques modulares para Diffusers que extiende el modelo base `elismasilva/ltx2.3-image-base` (LTX 2 Image) añadiendo soporte de image-to-image y unificando text-to-image e image-to-image en un único pipeline modular. Lo desarrolla el usuario `elismasilva` y se publica bajo licencia Apache 2.0.

El problema que resuelve es la integración simplificada de ambos flujos de trabajo: el usuario puede pasar solo un `prompt` para generar una imagen, o bien `prompt + image` para realizar una edición con `strength` opcional, sin cambiar de API. Los bloques personalizados se implementan sobre el sistema `ModularPipeline` de Diffusers, lo que permite componer el pipeline a partir de seis pasos (`LTX2ImageTextEncoderStep`, `LTX2ImageConnectorStep`, `LTX2ImageVaeEncoderStep`, `LTX2ImagePrepareLatentsStep`, `LTX2ImageDenoiseStep` y `LTX2ImageDecodeStep`).

No se proporcionan datos sobre parámetros totales, tamaño de contexto ni detalles del entrenamiento en la información disponible, por lo que la ficha se centra en la funcionalidad y la composición modular.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion basado en LTX 2 Image, implementado como bloques modulares para Diffusers |
| Parametros totales | no disponible |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (los pesos se cargan desde el modelo base `elismasilva/ltx2.3-image-base`) |

## Arquitectura y entrenamiento

La arquitectura se basa en el modelo de difusion LTX 2 Image, pero el repositorio no contiene los pesos: incluye únicamente bloques personalizados de `Modular Diffusers` que se cargan sobre los componentes del modelo base (`text_encoder`, `tokenizer`, `connectors`, `transformer`, `vae` y `scheduler`). El sistema `AutoBlocks` decide automaticamente si ejecutar text-to-image o image-to-image en funcion de las entradas (`prompt` solo o `prompt + image`).

El pipeline incorpora control sobre parametros avanzados como `guidance_scale`, `guidance_rescale`, `sigmas` o `timesteps` personalizados, entradas PAG (`pag_scale`, `pag_applied_layers`) y controles de decodificacion del VAE (`decode_timestep`, `decode_noise_scale`). Para image-to-image se anaden controles de transformacion de latentes: `input_noise_sigma`, `input_sharpen`, `phase_cutoff`, `phase_transition_width` y `phase_pad_factor`.

No se dispone de informacion sobre los datos de entrenamiento, el numero de tokens, la composicion del dataset o si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de imagenes a partir de texto (text-to-image).
- Edicion de imagenes mediante image-to-image con `strength` ajustable.
- Seleccion automatica del flujo de trabajo segun las entradas del usuario.
- Soporte de `prompt embeds` para control avanzado de la codificacion del prompt.
- Configuracion de `sigmas` o `timesteps` personalizados en el proceso de denoising.
- Control de `guidance_scale` y `guidance_rescale`.
- Soporte de PAG (`pag_scale`, `pag_applied_layers`) para atencion perturbada.
- Controles de decodificacion del VAE (`decode_timestep`, `decode_noise_scale`).
- Controles especificos para image-to-image: `input_noise_sigma`, `input_sharpen`, `phase_cutoff`, `phase_transition_width`, `phase_pad_factor`.
- No se especifica soporte de tool calling, function calling, agentes ni capacidades multilingues en la informacion disponible.

## Casos de uso

- **Edicion de imagenes en produccion**: el modelo permite aplicar restauracion o refinamiento a imagenes existentes pasando `prompt + image` con `strength` bajo, preservando la escena original mientras se mejora el detalle.
- **Generacion de imagenes para contenido visual**: mediante text-to-image puro, puede usarse en pipelines de generacion de assets graficos, integrándose con el ecosistema Diffusers.
- **Prototipado de experimentos de difusion**: gracias a la arquitectura modular, los investigadores pueden sustituir o modificar bloques individuales (por ejemplo, el denoising o el VAE) sin reescribir el pipeline completo.
- **Post-procesado de imagenes generadas**: tras una generacion inicial, se puede pasar el resultado como entrada a un segundo paso de image-to-image para corregir imperfecciones o alinear el resultado con una descripcion mas concreta.
- **Aplicaciones con control fino de ruido y fase**: los parametros `input_noise_sigma`, `input_sharpen` y `phase_*` permiten ajustar la transformacion de latentes en escenarios donde se necesita controlar cuanto se aleja la salida de la entrada.
- **Integracion en sistemas con validacion visual**: combinando la salida del pipeline con metricas de calidad de imagen, se puede construir un bucle de refinamiento automatico que compare la imagen editada contra la original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se proporcionan valores estimados de VRAM ni requisitos minimos en la documentacion publicada.
- El codigo de ejemplo llama a `pipe.to("cuda")`, lo que indica que se espera un entorno con GPU compatible con CUDA y una cantidad de memoria suficiente para el modelo base, pero no se especifican modelos concretos de GPU.
- El despliegue se realiza a traves de la libreria Diffusers con `ModularPipeline` y `trust_remote_code=True`; no se mencionan opciones como vLLM, llama.cpp u otras alternativas.
- No se dispone de datos de latencia ni de throughput.

## Comparativa con modelos similares

No se dispone de especificaciones comparables entre este modelo y otras alternativas en la informacion proporcionada. Como referencia, el mismo autor publica `elismasilva/ltx2.3-image-comfyui`, una variante orientada a ComfyUI, pero no se conocen sus parametros tecnicos. Ambos parten del mismo modelo base `elismasilva/ltx2.3-image-base`, lo que sugiere que comparten la base de generacion, pero este repositorio se diferencia por su enfoque modular para Diffusers.

| Modelo | Diferencia principal |
|---|---|
| `elismasilva/ltx2.3_image_custom_blocks` | Bloques modulares para `ModularPipeline`, con soporte unificado text-to-image e image-to-image |
| `elismasilva/ltx2.3-image-comfyui` | Disenado para integracion con ComfyUI (no se disponen de mas detalles) |
| `elismasilva/ltx2.3-image-base` | Modelo base del que se cargan los componentes; no incluye bloques modulares adicionales |

## Limitaciones y advertencias

- El repositorio no incluye los pesos del modelo; es obligatorio cargar los componentes desde `elismasilva/ltx2.3-image-base`, lo que implica una dependencia externa.
- El uso de `trust_remote_code=True` ejecuta codigo arbitrario del repositorio; se debe revisar el codigo antes de usarlo en entornos de produccion.
- No se especifican los idiomas soportados, por lo que el comportamiento con prompts en lenguas distintas del ingles no esta garantizado.
- Al no existir benchmarks publicos, el rendimiento establecido (calidad de imagen, coherencia con el prompt) no esta validado de forma externa.
- La licencia Apache 2.0 permite uso comercial, pero es necesario verificar tambien la licencia del modelo base y de los componentes cargados.
- Como modelo de difusion, existe riesgo de alucinacion en la interpretacion de prompts ambiguos y pueden aparecer sesgos no documentados.
- El parametro `strength` y los controles de fase requieren ajuste empirico; valores inadecuados pueden producir resultados distorsionados o alejados de la imagen de entrada.

## Enlaces

- https://huggingface.co/elismasilva/ltx2.3_image_custom_blocks
- https://huggingface.co/elismasilva/ltx2.3-image-base
- https://huggingface.co/collections/elismasilva/ltx-23-image
- https://huggingface.co/elismasilva/ltx2.3-image-comfyui
- https://huggingface.co/docs/diffusers/main/en/modular_diffusers/overview
