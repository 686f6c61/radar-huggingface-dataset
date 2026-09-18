# BaZzzuka/flux.1-dev-uncensored-q4

# Ficha tecnica: BaZzzuka/flux.1-dev-uncensored-q4

## Resumen

flux.1-dev-uncensored-q4 es un derivado del modelo de generacion de imagenes FLUX.1-dev de Black Forest Labs, publicado en HuggingFace por el usuario BaZzzuka el 17 de septiembre de 2026 segun los metadatos del repositorio. Se trata de un merge del modelo base con un LoRA sin censura procedente de CivitAI y su posterior cuantizacion en formato NF4, segun describe la propia model card del autor. No es un modelo entrenado desde cero ni un modelo de lenguaje: es un checkpoint de difusion texto-a-imagen.

A diferencia de los modelos generativos de texto, su parametro critico no es la ventana de contexto sino la calidad de la imagen generada, el uso de VRAM y las restricciones de contenido. El repositorio ocupa 6,7 GB y contiene 6.138.207.719 elementos en safetensors, cifra coherente con un modelo de aproximadamente 12.000 millones de parametros empaquetado a 4 bits (dos valores por byte), aunque el autor no confirma este extremo en la documentacion.

Su relevancia actual es limitada pero concreta: permite ejecutar un modelo de la familia FLUX en GPUs de gama de consumo con menos VRAM que la version en bf16, a costa de perder calidad por cuantizacion. Como contrapartida, el repositorio acumula 0 descargas y 0 likes, la documentacion es escasa y contiene referencias a otro repositorio distinto, y la licencia MIT declarada entra en conflicto con la licencia no comercial del modelo base FLUX.1-dev.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion texto-a-imagen derivado de FLUX.1-dev (descrito como "Flux base" en la model card). El autor no detalla la arquitectura interna |
| Parametros totales | 6.138.207.719 elementos almacenados en safetensors (dato real del repositorio). Al estar cuantizado en NF4 (dos valores por byte), corresponderia a un modelo de aproximadamente 12.000 millones de parametros (estimacion no confirmada por el autor) |
| Parametros activos | No aplica: no es un modelo de mezcla de expertos (MoE) |
| Longitud de contexto | No aplica: es un modelo texto-a-imagen. No se documenta la longitud maxima de prompt admitida |
| Tipos de cuantizacion | NF4 (4 bits) mediante bitsandbytes, segun la model card. Los tags de HuggingFace indican "8-bit" y el nombre del repositorio usa "q4"; la discrepancia no esta aclarada |
| Idiomas soportados | No disponible |
| Licencia | MIT (declarada por el autor tanto en los metadatos de HuggingFace como en la model card) |
| Formato de pesos | safetensors, libreria diffusers (clase FluxTransformer2DModel) |

## Arquitectura y entrenamiento

No hay informacion sobre entrenamiento en el sentido habitual: el autor no aporta numero de tokens, composicion del dataset, ni uso de RLHF, DPO o tecnicas de alineacion. Lo que describe la model card es un proceso de tres pasos: tomar FLUX.1-dev como modelo base, fusionar directamente un LoRA sin censura (identificado en el README como "Flux LustlyAI Uncensored v1", alojado en CivitAI) y cuantizar el resultado a NF4 para reducir el uso de VRAM. Por tanto, la unica "innovacion tecnica" documentada es la cuantizacion, no un cambio arquitectonico.

El procedimiento de carga tampoco es estandar. El autor advierte explicitamente de que no es un modelo "plug-and-play" y publica un script que requiere instalar bitsandbytes, cargar el transformer con `init_empty_weights`, sustituir las capas lineales por equivalentes NF4 mediante una funcion `_replace_with_bnb_linear` importada de un modulo externo (`convert_nf4_flux`), reconstruir los parametros cuantizados con `create_quantized_param` y finalmente montar el pipeline con `FluxPipeline.from_pretrained("black-forest-labs/flux.1-dev", transformer=model)`. El script de referencia apunta al repositorio `shauray/flux.1-dev-uncensored-nf4`, distinto del repositorio analizado, lo que sugiere que el README se ha copiado o adaptado de otra publicacion.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (texto-a-imagen), unica capacidad documentada en la model card.
- Ejemplo de uso incluido por el autor: prompt "A mystic cat with a sign that says hello world!", con `guidance_scale=3.5`, `num_inference_steps=50` y semilla fija.
- Generacion de contenido sin filtros de seguridad, al haber fusionado un LoRA sin censura. La model card lo presenta como orientado a "uso real con menos restricciones".
- Inferencia con menor huella de VRAM gracias a la cuantizacion NF4 y al uso de `enable_model_cpu_offload()`.
- Soporte de tool calling o function calling: no disponible. No aplica a un modelo de difusion.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles. El unico ejemplo de prompt esta en ingles.
- Capacidades especiales (modo thinking, vision, audio, video): no disponibles. No hay evidencia de soporte de img2img, inpainting, edicion o ControlNet en este repositorio.

## Casos de uso

- Prototipado local en GPU de gama de consumo: un modelo de la familia FLUX cuantizado a NF4 ocupa aproximadamente 6,5-7 GB de pesos, lo que permite probarlo en tarjetas de 12-16 GB de VRAM mediante `enable_model_cpu_offload()`, algo inviable con el checkpoint original en bf16 en ese rango de hardware.
- Investigacion sobre cuantizacion en modelos de difusion: comparar cualitativamente las imagenes generadas por este checkpoint NF4 frente a FLUX.1-dev en bf16 con los mismos prompts, semillas y pasos, para medir la degradacion introducida por los 4 bits.
- Generacion de ilustracion y concept art sin restricciones de contenido: el merge del LoRA sin censura evita los rechazos y las atenuaciones tipicas de los modelos alineados, util para equipos que trabajan con tematicas que los filtros estandar bloquean.
- Red-teaming y estudio de moderacion: sirve como caso de estudio de que ocurre cuando se publica un derivado sin capas de seguridad, y como entrada para construir clasificadores de contenido en pipelines propios.
- Generacion de datasets sinteticos de imagenes para experimentos internos: con `num_inference_steps=50` y semilla fija se pueden producir lotes reproducibles, siempre que el uso previsto respete las restricciones del modelo base.
- Despliegue en entornos aislados o sin conexion: al ser un checkpoint local de 6,7 GB cargable con diffusers, encaja en estaciones de trabajo offline donde no se permite llamar a APIs de generacion de imagenes.
- Experimentos de fusion posterior de LoRA: el pipeline de diffusers permite seguir aplicando adaptadores sobre este transformer ya cuantizado, aunque no hay documentacion del autor sobre compatibilidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye FID, CLIP score, comparativas visuales ni ninguna otra metrica de calidad. El repositorio registra 0 descargas y 0 likes, por lo que tampoco existe validacion de la comunidad. No se ofrecen datos de latencia ni de throughput.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6,5-7 GB solo para los pesos del transformer en NF4 (estimacion a partir del tamano del repositorio, 6,7 GB). Hay que sumar los codificadores de texto del pipeline de FLUX, que el script del autor descarga desde `black-forest-labs/flux.1-dev` y descarga a CPU con `enable_model_cpu_offload()`.
- VRAM practica recomendada: 12 GB como minimo razonable con offload de CPU; 16-24 GB para trabajar con menos transferencias entre CPU y GPU.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070 Ti Super, RTX 4080 y RTX 4090 (24 GB) en el ambito de consumo; A100, H100 o L40S en servidor.
- Cabe en GPU de consumo: si, en modelos con 12 GB o mas de VRAM, siempre que se aplique offload de CPU como hace el autor. Por debajo de 12 GB no hay datos que confirmen su funcionamiento.
- Opciones de despliegue: diffusers (FluxPipeline) junto con bitsandbytes y accelerate, tal como indica la model card. No hay soporte documentado para vLLM, TGI, llama.cpp, Ollama ni ComfyUI; esas herramientas no aplican o no estan verificadas para este checkpoint.
- Dependencias declaradas: `pip install -U bitsandbytes`, ademas de un modulo `convert_nf4_flux` con las funciones `_replace_with_bnb_linear`, `create_quantized_param` y `check_quantized_param` que el autor no incluye en el repositorio.
- Latencia y throughput: no disponibles. El unico dato de configuracion es `num_inference_steps=50` y `guidance_scale=3.5`.

## Comparativa con modelos similares

Los datos de los modelos comparados no aparecen en la informacion proporcionada y se marcan como referencia externa aproximada.

| Modelo | Parametros | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|
| BaZzzuka/flux.1-dev-uncensored-q4 | ~12.000 millones (estimado) | NF4 / 4 bits | MIT declarada por el autor | Derivado sin censura de FLUX.1-dev; 0 descargas, 0 likes; sin benchmarks |
| FLUX.1-dev (black-forest-labs) | ~12.000 millones (dato externo) | bf16 / fp16 / fp8 | Licencia no comercial FLUX.1 [dev] (dato externo) | Modelo base del que deriva; mayor peso en disco y en VRAM; si tiene evaluacion publica |
| FLUX.1-schnell (black-forest-labs) | ~12.000 millones (dato externo) | bf16 / fp16 / fp8 | Apache 2.0 (dato externo) | Alternativa con generacion en muy pocos pasos y permisos comerciales amplios |
| SDXL 1.0 (Stability AI) | ~3.500 millones (dato externo) | fp16 | CreativeML Open RAIL++-M (dato externo) | Arquitectura U-Net, mucho mas ligera; ecosistema de LoRA y herramientas mas maduro |

## Limitaciones y advertencias

- Repositorio sin validacion: 0 descargas y 0 likes en el momento de redactar esta ficha. No hay evidencia de terceros de que el checkpoint cargue correctamente ni de que la calidad sea aceptable.
- Licencia contradictoria: el autor declara MIT, pero el modelo base FLUX.1-dev se distribuye bajo una licencia no comercial. Usar este derivado con fines comerciales sin aclarar la situacion juridica es un riesgo real.
- Documentacion incompleta: el README no incluye el modulo `convert_nf4_flux` del que dependen las funciones importadas en el script, y las instrucciones se refieren al repositorio `shauray/flux.1-dev-uncensored-nf4` en lugar de a este.
- Metadatos inconsistentes: los tags indican "8-bit", el nombre del repositorio indica "q4" y la model card indica "NF4". No hay forma de resolver la discrepancia con la informacion disponible.
- Carga no estandar: requiere reconstruir el modelo con `init_empty_weights`, sustituir capas lineales y crear parametros cuantizados manualmente. No funciona con un simple `from_pretrained` sobre el transformer.
- Perdida de calidad por cuantizacion: no hay ninguna comparacion publicada frente al modelo en bf16, pero la cuantizacion a 4 bits implica degradacion esperable en detalle fino, texto dentro de la imagen y coherencia de manos o rostros.
- Contenido NSFW: el modelo esta disenado explicitamente para eliminar restricciones de seguridad. No incorpora filtros de salida, lo que implica riesgos legales, reputacionales y de seguridad si se expone como servicio publico.
- Idiomas: no se documenta el soporte multilingue de los prompts; el unico ejemplo esta en ingles.
- Sesgos: no hay evaluacion de sesgos del modelo base ni del LoRA fusionado. Los sesgos del dataset de entrenamiento original se heredan sin mitigacion.
- Fecha de publicacion anomala: los metadatos indican creacion el 17 de septiembre de 2026, fecha posterior a la redaccion habitual de este tipo de fichas, lo que sugiere un error de metadatos o una publicacion programada.
- Ruido en la busqueda web: las consultas realizadas no han devuelto ninguna fuente relevante sobre este modelo; unicos resultados han sido enlaces genericos a YouTube.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/BaZzzuka/flux.1-dev-uncensored-q4
- Modelo base: https://huggingface.co/black-forest-labs/flux.1-dev
- Repositorio referenciado en el script del autor: https://huggingface.co/shauray/flux.1-dev-uncensored-nf4
- Hilo de diffusers con el script de cuantizacion NF4: https://github.com/huggingface/diffusers/issues/9165
- LoRA sin censura citado en la model card: https://civitai.com/models/875879/flux-lustlyai-uncensored-v1-nsfw-lora-with-male-and-female-nudity
- Busqueda web: no se han encontrado papers, blogs, repositorios ni demos adicionales sobre este modelo.
