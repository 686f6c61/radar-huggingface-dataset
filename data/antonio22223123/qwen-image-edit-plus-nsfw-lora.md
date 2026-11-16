# Antonio22223123/qwen-image-edit-plus-nsfw-lora

## Resumen

MCNL v1 es un adaptador LoRA para el pipeline de difusion Qwen-Image-Edit-2511, desarrollado por el usuario Antonio22223123 (con referencias internas a ScottzillaSystems en la model card). Su proposito es anadir capacidades de generacion y edicion de imagen con contenido explicito (NSFW) sobre el modelo base Qwen-Image-Edit-2511, un transformer de difusion multimodal (MMDiT) orientado a edicion de imagen guiada por texto. El adaptador se distribuye como un unico fichero safetensors de aproximadamente 563 MB (0,6 GB en el repositorio), lo que corresponde a un LoRA de rango bajo sobre el transformer del modelo base.

El modelo resuelve un nicho muy concreto: usuarios que ya trabajan con Qwen-Image-Edit-2511 y quieren desbloquear categorias de contenido que el modelo base filtra o no genera de forma fiable. Se activa mediante palabras disparadoras especificas documentadas en la model card y se integra en diffusers mediante `load_lora_weights` sobre `QwenImageEditPlusPipeline`.

Es relevante ahora porque el ecosistema de LoRAs sobre modelos de edicion de imagen open weights crece rapidamente, y este tipo de adaptadores ilustra el patron habitual: un adaptador pequeno, de licencia OpenRAIL++, que hereda las capacidades y limitaciones del modelo base. No hay informacion publicada sobre datos de entrenamiento, benchmarks ni evaluaciones cuantitativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre QwenImageTransformer2DModel (MMDiT) del modelo base Qwen-Image-Edit-2511 |
| Parametros totales | no disponible (adaptador LoRA; el fichero pesa ~563 MB en safetensors) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen-Image-Edit-2511) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; el dtype de carga recomendado en la model card es bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | openrail++ |
| Formato de pesos | safetensors (`qwen-image-edit-plus-nsfw-lora.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre el transformer de difusion del modelo base Qwen-Image-Edit-2511, identificado en la model card como `QwenImageTransformer2DModel` con arquitectura MMDiT (multimodal diffusion transformer). No se especifican el rango del LoRA, las capas objetivo, el numero de pasos de entrenamiento, el dataset utilizado ni si hubo regularizacion o tecnicas adicionales. Tampoco se documenta si el entrenamiento partio de imagenes reales, sinteticas o de un corpus mixto, ni el volumen de pares imagen-prompt empleados.

La unica informacion tecnica concreta es el tamano del fichero (~563 MB) y el formato safetensors, compatible con la carga via `diffusers` mediante `load_lora_weights` y `set_adapters`. La model card menciona una version posterior, MCNL v2, alojada en otro repositorio, sin detallar diferencias tecnicas respecto a esta v1.

## Capacidades

- Edicion de imagen guiada por texto sobre el pipeline Qwen-Image-Edit-2511, con soporte de imagen de entrada y prompt.
- Generacion de contenido explicito (NSFW) mediante palabras disparadoras documentadas: `nsfw`, `nipples`, `vagina`, `penis`, `missionary`, `cowgirlout`, `reversecowgirlpov`, `blowjob`, `cum_on_face`, `creamp1e`, `l1ck`.
- Control de la generacion mediante `negative_prompt`, `num_inference_steps` (ejemplo con 40) y `true_cfg_scale` (ejemplo con 4.0).
- Compatibilidad con el espacio de Hugging Face ScottzillaSystems Image Editor, donde el adaptador aparece como "MCNL-NSFW-v1" en el desplegable de adaptadores.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision analitica ni audio; el modelo es exclusivamente de difusion imagen-a-imagen.

## Casos de uso

- Edicion de imagen para ilustracion adulta: el adaptador permite transformar una imagen de entrada en una variante con contenido explicito usando las palabras disparadoras, manteniendo la composicion original gracias a la naturaleza image-to-image del pipeline.
- Prototipado artistico en estudios de contenido para adultos: permite iterar rapidamente sobre variaciones de una escena (pose, encuadre, iluminacion) sin reentrenar el modelo base, cargando y descargando el adaptador segun la necesidad.
- Investigacion sobre filtrado y moderacion: util para construir conjuntos de datos NSFW controlados y evaluar clasificadores o sistemas de moderacion en condiciones reproducibles, dado que el adaptador es pequeno y facil de versionar.
- Pruebas de robustez de pipelines de difusion: sirve para medir como se comporta Qwen-Image-Edit-2511 al anadir un adaptador de dominio y evaluar deriva estetica, artefactos y coherencia anatomica.
- Integracion en herramientas de edicion locales: al ser un safetensors de ~563 MB, puede cargarse en entornos con GPUs de consumo junto al modelo base, lo que facilita despliegues de escritorio o en espacios de Hugging Face.
- Experimentacion con pesos de adaptador y escalado: permite estudiar el efecto de `set_adapters` y de distintos valores de `true_cfg_scale` sobre la fidelidad al prompt y la calidad de la edicion en un dominio concreto.
- Demos y espacios interactivos: el adaptador ya esta integrado en el Space ScottzillaSystems Image Editor, lo que facilita su uso sin escribir codigo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base Qwen-Image-Edit-2511. El adaptador en si ocupa ~563 MB en safetensors y se suma a la huella del modelo base cargado en bfloat16.
- GPU recomendadas: no disponibles en la informacion proporcionada. La model card solo indica `torch_dtype=torch.bfloat16` y `.to("cuda")`.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible; el adaptador es pequeno, pero el requisito real lo marca el transformer de difusion del modelo base.
- Opciones de despliegue: `diffusers` con `QwenImageEditPlusPipeline` y `load_lora_weights`; tambien disponible a traves del Space ScottzillaSystems Image Editor. No se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un pipeline de difusion de este tipo).
- Latencia y throughput: no disponibles. La model card solo muestra un ejemplo con `num_inference_steps=40`.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MCNL v1 (este adaptador) | LoRA sobre Qwen-Image-Edit-2511 | no disponible (~563 MB en safetensors) | no disponible | openrail++ | Hugging Face, Space ScottzillaSystems |
| MCNL v2 | LoRA sobre Qwen-Image-Edit-2511 (version actualizada) | no disponible | no disponible | no disponible | Hugging Face (ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2) |
| Qwen-Image-Edit-2511 (base) | Modelo de difusion MMDiT para edicion de imagen | no disponible | no disponible | no disponible | Hugging Face (Qwen/Qwen-Image-Edit-2511) |

No se dispone de datos de rendimiento, parametros ni contexto para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Contenido explicito: el adaptador esta disenado para generar material NSFW y lleva la etiqueta `not-for-all-audiences`; no es apto para entornos sin control de edad o sin politicas de contenido claras.
- Riesgo legal y de plataforma: la generacion y distribucion de contenido sexual explicito puede infringir terminos de servicio de plataformas de alojamiento, legislacion local sobre material adulto y normativas sobre deepfakes o imagenes de personas reales sin consentimiento.
- Licencia OpenRAIL++: incluye restricciones de uso derivadas del modelo base; conviene revisar las clausulas de uso aceptable antes de cualquier despliegue comercial.
- Sesgos y calidad anatomica: no hay evaluaciones publicadas sobre sesgos de generacion, diversidad corporal, fidelidad anatomica ni artefactos; los LoRAs NSFW suelen degradar la coherencia en manos, rostros y proporciones.
- Alucinacion visual: como todo modelo de difusion, puede generar elementos no solicitados o incoherentes con la imagen de entrada, especialmente con prompts cortos o palabras disparadoras ambiguas.
- Dependencia del modelo base: hereda todas las limitaciones de Qwen-Image-Edit-2511 (resolucion, idiomas del prompt, sesgos del corpus de entrenamiento), que no se documentan aqui.
- Documentacion escasa: no se detallan datos de entrenamiento, rango del LoRA, pasos, dataset ni evaluaciones; la reproducibilidad es baja.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Idiomas: no se especifica que idiomas acepta el prompt; se asume que los del modelo base, sin confirmacion.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/Antonio22223123/qwen-image-edit-plus-nsfw-lora
- Modelo base Qwen-Image-Edit-2511: https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- Version MCNL v2: https://huggingface.co/ScottzillaSystems/qwen-image-edit-plus-nsfw-lora2
- Space ScottzillaSystems Image Editor: https://huggingface.co/spaces/ScottzillaSystems/Qwen-Image-Edit-2511-LoRAs-Fast
