# niuhesanlu/MOSS-Image-SFT-pose-lora-pilot

## Resumen

MOSS-Image-SFT-pose-lora-pilot es un adaptador LoRA experimental publicado por el usuario niuhesanlu sobre el modelo de difusion OpenMOSS-Team/MOSS-Image-SFT. Su funcion es condicionar la generacion o edicion de imagenes a un esqueleto de pose DWPose junto con un prompt de texto que describe el sujeto, la ropa y la escena. Se trata de un piloto de entrenamiento de solo 10 pasos realizado con SimpleTuner, por lo que no debe considerarse un adaptador listo para produccion.

El repositorio es muy ligero (0,1 GB) y contiene dos ficheros safetensors equivalentes de 344 tensores en BF16: una exportacion para ComfyUI y otra para el pipeline de edicion de MOSS en SimpleTuner. El rango y el alpha del LoRA son ambos 32, de modo que una fuerza de 1.0 reproduce la escala de entrenamiento. El autor indica explicitamente que la adherencia a la pose y la calidad de imagen aun no se han evaluado.

Su relevancia es acotada: sirve como prueba de concepto del flujo de control de pose sobre MOSS-Image y como base reproducible para quienes quieran experimentar con LoRA de pose en este modelo de difusion, no como solucion final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusion MOSS-Image-SFT (adaptador, no modelo completo) |
| Parametros totales | no disponible (344 tensores BF16 en el adaptador) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 en los pesos del adaptador; cuantizaciones del modelo base no disponibles |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (moss_pose_pilot_comfyui.safetensors y pytorch_lora_weights.safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 y alpha 32 aplicado sobre el modelo de difusion OpenMOSS-Team/MOSS-Image-SFT (revision del checkpoint base f972bd4b4b9e3852133cc5da954d87bc32cd8fb9). El entrenamiento se realizo con SimpleTuner en un piloto de 10 pasos, con batch size 1, acumulacion de gradiente 1, resolucion a escala 512 y tasa de aprendizaje de 0,0001. El conjunto de datos fue dimitribarbot/dw_pose_controlnet, con 128 pares de imagen, caption y esqueleto para entrenamiento y 16 pares reservados para evaluacion.

La innovacion tecnica del adaptador es su integracion con el flujo de edicion de MOSS-Image: el esqueleto DWPose coloreado sobre fondo negro se conecta junto con el VAE y el text encoder a los nodos Text Encode MOSS-Image Edit, seleccionando `ai-toolkit` en ambos. El autor verifico que el cargador de ComfyUI empareja las 172 actualizaciones LoRA con las disposiciones de atencion Q/K/V de MOSS, tanto separadas como fusionadas, usando las formas reales del modelo y los tensores del adaptador. La generacion de imagenes, sin embargo, no se ha probado.

## Capacidades

- Control de pose en generacion y edicion de imagenes: acepta un esqueleto DWPose y un prompt de texto para describir sujeto, ropa y escena.
- Integracion con ComfyUI mediante el nodo Load LoRA (Model Only) y los nodos Text Encode MOSS-Image Edit.
- Compatibilidad con el pipeline de edicion de MOSS en SimpleTuner mediante `load_lora_weights`.
- Flujo image-to-image: parte de una foto o de un esqueleto preparado y aplica la condicion de pose.
- Ajuste de intensidad del adaptador: al ser rango y alpha 32, la fuerza 1.0 mantiene la escala de entrenamiento y permite comparar con 0.0.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, vision adicional, audio ni thinking mode.

## Casos de uso

- Prueba de concepto de control de pose: usar el adaptador en ComfyUI con un esqueleto DWPose y un prompt fijo para comprobar si la pose se respeta, comparando fuerza 0.0 frente a 1.0 con la misma semilla y sampler.
- Investigacion sobre LoRA de pose en MOSS-Image: servir de base reproducible para estudiar como afecta el rango 32 y 10 pasos de entrenamiento a la adherencia de la pose.
- Generacion de variaciones de personaje con pose fija: mantener el esqueleto y cambiar el prompt de ropa o escena para explorar el efecto del texto sobre una pose controlada.
- Edicion image-to-image con preprocesador DWPose: en un workflow que parte de una foto, conectar el esqueleto preparado directamente a los nodos de edicion para reutilizar la pose original.
- Evaluacion comparativa de adaptadores de pose: usar los 16 pares reservados como referencia para medir adherencia y calidad frente a otros LoRA de pose sobre MOSS-Image.
- Prototipado de pipelines de difusion en ComfyUI: validar la carga del adaptador y la compatibilidad de los nodos Text Encode MOSS-Image Edit antes de invertir en un entrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica que la adherencia a la pose y la calidad de imagen aun no se han evaluado y que la generacion de imagenes no se ha probado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del modelo base MOSS-Image-SFT, no del adaptador (0,1 GB).
- GPU recomendadas: no disponibles en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI (con Text Encode MOSS-Image Edit, modelo de difusion MOSS-Image-SFT, text encoder Qwen3.5 compatible con MOSS y VAE FLUX.2) y pipeline de edicion de MOSS en SimpleTuner.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-SFT-pose-lora-pilot | LoRA de pose sobre MOSS-Image-SFT | no disponible (344 tensores BF16) | no disponible | no disponible | Hugging Face |
| MOSS-Image-pose-control-lora (thedeoxen) | LoRA de control de pose sobre MOSS-Image | no disponible | no disponible | no disponible | Hugging Face |
| MOSS-Image-SFT (OpenMOSS-Team) | Modelo de difusion base | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa entre estos modelos.

## Limitaciones y advertencias

- Piloto de solo 10 pasos de entrenamiento: la adherencia a la pose y la calidad de imagen no estan evaluadas.
- La generacion de imagenes no se ha probado; solo se verifico el emparejamiento de tensores del cargador de ComfyUI.
- Conjunto de entrenamiento muy reducido: 128 pares de imagen, caption y esqueleto.
- Licencia no disponible: no puede confirmarse el uso comercial.
- Idiomas soportados no disponibles.
- Requiere un entorno especifico (ComfyUI con Text Encode MOSS-Image Edit, text encoder Qwen3.5 compatible y VAE FLUX.2) y el checkpoint base en la revision f972bd4b4b9e3852133cc5da954d87bc32cd8fb9.
- Riesgo de sobreajuste y de baja generalizacion a poses o escenas no representadas en el dataset dimitribarbot/dw_pose_controlnet.
- No debe usarse en produccion sin una evaluacion previa de calidad y adherencia.

## Enlaces

- [Hugging Face: niuhesanlu/MOSS-Image-SFT-pose-lora-pilot](https://huggingface.co/niuhesanlu/MOSS-Image-SFT-pose-lora-pilot)
- [Modelo base: OpenMOSS-Team/MOSS-Image-SFT](https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT)
- [Dataset: dimitribarbot/dw_pose_controlnet](https://huggingface.co/datasets/dimitribarbot/dw_pose_controlnet)
- [Workflow de control de pose del autor (thedeoxen)](https://huggingface.co/thedeoxen/MOSS-Image-pose-control-lora/blob/95021788ef0c22f0baa64c0a95d7c17a3b7c1d0a/moss_image_pose_control.json)
