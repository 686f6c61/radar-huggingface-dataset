# Flori12342/qwen-image-edit-plus-nsfw-lora

## Resumen

MCNL v1 (Multi Concept NSFW LoRA) es un adaptador LoRA para el pipeline de difusion Qwen-Image-Edit-2511, desarrollado por el usuario Flori12342 (publicado tambien bajo el alias ScottzillaSystems). Su proposito es habilitar la generacion y edicion de contenido para adultos (NSFW) sobre el modelo base de edicion de imagenes de Qwen, que por defecto aplica filtros de seguridad sobre este tipo de contenido. El adaptador se distribuye como un unico fichero safetensors de aproximadamente 563 MB (0,6 GB de repositorio) y se carga mediante la libreria diffusers.

Tecnicamente se trata de un LoRA aplicado sobre QwenImageTransformer2DModel, la arquitectura de transformer de difusion con atencion conjunta multimodal (MMDiT) que emplea la familia Qwen-Image. No modifica los pesos del modelo base: se inyecta como adaptador y se activa en tiempo de inferencia, lo que permite combinarlo con el pipeline `QwenImageEditPlusPipeline` en precision bfloat16. El modelo esta pensado para flujos image-to-image, es decir, partir de una imagen de entrada y editarla siguiendo una instruccion textual.

La relevancia de este adaptador es acotada y muy especifica: cubre un nicho de generacion de contenido adulto sobre un modelo de edicion de imagenes reciente, con una licencia OpenRAIL++ que impone restricciones de uso. El repositorio tiene un volumen de adopcion muy bajo (9 descargas y 0 likes en el momento de la consulta) y el autor remite a una version v2 actualizada, lo que sugiere que esta v1 debe considerarse una iteracion temprana y potencialmente superada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre QwenImageTransformer2DModel (MMDiT, transformer de difusion) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se distribuye en este repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se usa en bfloat16 segun el ejemplo del autor) |
| Idiomas soportados | no disponible (los prompts del ejemplo estan en ingles) |
| Licencia | OpenRAIL++ |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango que se acopla a las capas del transformer de difusion QwenImageTransformer2DModel, la arquitectura MMDiT (Multimodal Diffusion Transformer) del modelo base Qwen-Image-Edit-2511. En lugar de reentrenar el modelo completo, el LoRA aprende un conjunto reducido de matrices de actualizacion que sesgan la generacion hacia los conceptos NSFW definidos por el autor. El fichero pesa unos 563 MB, coherente con un adaptador de rango moderado sobre un transformer de gran tamano.

No se dispone de informacion sobre el dataset de entrenamiento: ni el numero de imagenes, ni la composicion, ni si se aplicaron tecnicas de regularizacion, captions automaticos o filtrado. Tampoco se documenta si hubo entrenamiento con refuerzo o ajuste fino adicional. El autor expone una lista de trigger words que actuan como conceptos aprendidos (`nsfw`, `nipples`, `vagina`, `penis`, `missionary`, `cowgirlout`, `reversecowgirlpov`, `blowjob`, `cum_on_face`, `creamp1e`, `l1ck`), lo que indica un entrenamiento por conceptos multiples (de ahi el nombre Multi Concept). Algunos terminos aparecen deliberadamente ofuscados con sustituciones de caracteres, probablemente para evitar filtros automaticos de las plataformas.

## Capacidades

- Edicion de imagenes image-to-image: recibe una imagen de entrada y un prompt, y devuelve una version editada.
- Generacion de contenido para adultos sobre el modelo base, que por defecto lo restringe.
- Activacion de conceptos especificos mediante trigger words definidas por el autor.
- Compatibilidad con el pipeline `QwenImageEditPlusPipeline` de diffusers y carga mediante `load_lora_weights`.
- Soporte de negative prompt y de `true_cfg_scale` para controlar la adherencia al prompt (el ejemplo usa 40 pasos y escala 4.0).
- Posibilidad de combinarse con otros adaptadores LoRA del mismo modelo base mediante `set_adapters`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio o video.

## Casos de uso

- Edicion de imagenes para ilustracion adulta: partiendo de una fotografia o render de entrada, el adaptador permite transformarla segun un prompt con los conceptos entrenados, usando el pipeline image-to-image con 40 pasos de inferencia.
- Prototipado de contenido para plataformas de nicho: estudios que trabajan con contenido para adultos pueden integrar el LoRA en su cadena de diffusers para generar variaciones controladas sobre imagenes base.
- Investigacion sobre filtrado y seguridad en modelos de difusion: el adaptador sirve como caso de estudio de como un LoRA de bajo coste puede eludir las restricciones del modelo base, util para disenar contramedidas.
- Pruebas de concepto en el Space de ScottzillaSystems: el autor ofrece un editor web donde se selecciona el adaptador desde un desplegable, lo que permite evaluar el comportamiento sin escribir codigo.
- Generacion de variaciones estilisticas sobre un personaje o composicion existente: al ser image-to-image, conserva la estructura de la imagen de entrada y aplica los cambios solicitados.
- Experimentacion con composicion de LoRAs: al cargarse como adaptador independiente, puede combinarse con otros LoRAs del mismo modelo base para explorar mezclas de conceptos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador en si ocupa unos 563 MB en disco y no requiere VRAM adicional significativa mas alla de la del modelo base.
- El modelo base Qwen-Image-Edit-2511 no se distribuye en este repositorio; su huella de VRAM depende de su tamano, que no se detalla en la informacion proporcionada. Como referencia general, los transformers de difusion de esta familia suelen requerir GPUs de gama alta (A100, H100 o RTX 4090) para inferencia en bfloat16.
- El ejemplo del autor usa `torch_dtype=torch.bfloat16` y `.to("cuda")`, lo que implica una GPU con soporte de bfloat16.
- Despliegue mediante diffusers (`QwenImageEditPlusPipeline`); no se documentan opciones para llama.cpp, Ollama, vLLM ni TGI, que no aplican a pipelines de difusion de esta forma.
- Latencia y throughput: no disponibles. El ejemplo fija 40 pasos de inferencia, un valor relativamente alto que sugiere tiempos de generacion no triviales.

## Comparativa con modelos similares

| Modelo | Tipo | Modelo base | Licencia | Disponibilidad |
|---|---|---|---|---|
| MCNL v1 (este) | LoRA NSFW para edicion de imagen | Qwen-Image-Edit-2511 | OpenRAIL++ | Hugging Face, 9 descargas |
| MCNL v2 | LoRA NSFW, version actualizada del mismo autor | Qwen-Image-Edit-2511 | no disponible | Hugging Face (ScottzillaSystems) |
| Qwen-Image-Edit-2511 | Modelo base de edicion de imagen | — | no disponible en esta ficha | Hugging Face (Qwen) |

No se dispone de datos de rendimiento ni de otros adaptadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Contenido explicito: el modelo genera material para adultos; no debe usarse en entornos sin control de edad ni en productos dirigidos a menores.
- Adopcion muy baja: 9 descargas y 0 likes indican poca validacion por parte de la comunidad; no hay evidencia de calidad contrastada.
- Version superada: el propio autor remite a MCNL v2 como version actualizada, por lo que esta v1 puede tener defectos corregidos en la siguiente iteracion.
- Falta de documentacion: no se detallan datos de entrenamiento, composicion del dataset, hiperparametros ni evaluaciones, lo que impide auditar sesgos o calidad.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede producir artefactos anatomicos, incoherencias y resultados no deseados, especialmente con conceptos poco representados.
- Licencia OpenRAIL++: impone restricciones de uso (uso responsable, prohibicion de usos daninos); es responsabilidad del usuario revisar los terminos antes de un despliegue comercial.
- Dependencia del modelo base: el comportamiento final depende de Qwen-Image-Edit-2511, cuyas capacidades y limitaciones no se documentan en este repositorio.
- Trigger words ofuscadas: algunos terminos estan escritos con sustituciones de caracteres, lo que puede afectar a la reproducibilidad de los prompts.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Flori12342/qwen-image-edit-plus-nsfw-lora
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Version v2 del adaptador: https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2
- Space del editor de imagenes: https://huggingface.co/spaces/ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast
