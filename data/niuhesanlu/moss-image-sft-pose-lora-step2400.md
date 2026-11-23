# niuhesanlu/MOSS-Image-SFT-pose-lora-step2400

## Resumen

MOSS-Image-SFT-pose-lora-step2400 es un adaptador LoRA de control de pose para el modelo de edicion de imagen MOSS-Image-SFT, desarrollado por el usuario niuhesanlu sobre el modelo base de OpenMOSS-Team. El adaptador permite condicionar la generacion de imagenes mediante un esqueleto de pose coloreado sobre fondo negro (formato DWPose/OpenPose), de modo que el modelo genera una persona en la pose indicada respetando la descripcion textual de la escena. Se publica como checkpoint del paso 2400 de un entrenamiento con SimpleTuner.

Tecnicamente se trata de un LoRA de rango 64 y alpha 64 que actualiza 172 proyecciones de atencion del modelo base, exportado en dos variantes: pesos nativos para el pipeline de SimpleTuner y un export compatible con ComfyUI. El repositorio ocupa 0,3 GB e incluye flujos de trabajo JSON listos para usar en ComfyUI, tanto para partir de un esqueleto dibujado a mano como de una fotografia procesada con DWPose.

Su relevancia es practica: cubre el caso de control de pose en edicion de imagen con un modelo base reciente, con instrucciones de despliegue concretas y una evaluacion cuantitativa propia (43,26 % de acierto de pose en 16 esqueletos de validacion). Es un adaptador de nicho, no un modelo fundacional, y su utilidad depende enteramente del modelo base MOSS-Image-SFT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer de difusion (modelo base MOSS-Image-SFT) |
| Parametros totales | no disponible (adaptador de 0,3 GB en el repo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (pesos del adaptador); el modelo base se distribuye en int8 y el text encoder en w4a8 GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (nativo `pytorch_lora_weights.safetensors` y export ComfyUI `moss_pose_step2400_comfyui.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 y alpha 64 aplicado sobre las proyecciones de atencion del modelo base MOSS-Image-SFT. Actualiza 172 proyecciones de atencion, exportadas como 344 tensores BF16 en el fichero de ComfyUI. El autor verifico que el cargador model-only de ComfyUI aplica las 172 actualizaciones tanto en disposiciones de Q/K/V fusionadas como separadas.

El entrenamiento se realizo con SimpleTuner sobre 128 tripletas de fotografia, caption y mapa DWPose del dataset `dimitribarbot/dw_pose_controlnet`. El checkpoint publicado corresponde al paso 2400. No se detalla el numero total de pasos, la composicion exacta del dataset ni si hubo etapas de refinamiento posteriores. La evaluacion reportada usa 16 esqueletos de validacion con un prompt fijo y semilla 42, midiendo el porcentaje de articulaciones detectadas dentro del 10 % de la dimension del cuadro de referencia de la persona.

## Capacidades

- Control de pose en generacion y edicion de imagen: recibe un esqueleto coloreado sobre fondo negro y genera una persona en esa pose.
- Generacion condicionada por texto: la descripcion textual define la persona y la escena (por defecto, un mecanico de bicicletas con mono azul en un taller iluminado por el sol).
- Flujo imagen a imagen: permite partir de una fotografia, extraer la pose con DWPose y regenerar la imagen con una nueva descripcion.
- Integracion con ComfyUI mediante flujos de trabajo JSON incluidos (`skeleton_to_image.json` y `photo_to_pose.json`).
- Compatibilidad con el pipeline nativo de SimpleTuner mediante `load_lora_weights`.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni multilingues, ya que es un adaptador de difusion, no un modelo de lenguaje.

## Casos de uso

- Previsualizacion de poses para ilustracion: dibujar o editar un esqueleto en un editor OpenPose y generar una figura coherente con esa pose, util para bocetos rapidos o referencias de anatomia.
- Transferencia de pose entre fotografias: extraer los keypoints de una foto con DWPose y regenerar la misma pose con otra persona o escena descrita en el prompt, aplicable a prototipado de vestuario o composicion.
- Generacion de material editorial controlado: el prompt por defecto y la evaluacion apuntan a fotografia editorial; sirve para producir variaciones de una escena manteniendo la pose fija.
- Iteracion en pipelines de diseno grafico dentro de ComfyUI: al estar empaquetado como flujo JSON con parametros fijos (fuerza 1.0, semilla 42, 30 pasos Euler, CFG 4), se puede encadenar con otros nodos para produccion de variantes.
- Control de composicion en proyectos de animacion o storyboard: fijar poses clave por fotograma y generar imagenes coherentes con la narracion textual.
- Experimentacion con adaptadores de bajo rango sobre modelos de difusion: el repositorio documenta el proceso de exportacion y evaluacion, lo que lo hace util como referencia metodologica para entrenar LoRAs de control similares.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| Acierto de pose medio (matched) | 43,26 % |
| Pose intercambiada media (swapped) | 5,38 % |
| Conjunto de evaluacion | 16 esqueletos de validacion, prompt de mecanico, semilla 42 |
| Criterio de acierto | articulacion detectada dentro del 10 % de la dimension mayor del cuadro de referencia |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un adaptador de difusion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; depende del modelo base MOSS-Image-SFT y del text encoder Qwen 3.5 9B en w4a8 GPTQ. El adaptador en si ocupa 0,3 GB.
- GPU recomendadas: no disponible. El autor no especifica requisitos minimos ni GPU de referencia.
- Compatibilidad con GPU de consumo: no confirmada; el modelo base en int8 y el text encoder cuantizado sugieren que el autor busca reducir requisitos, pero no se aportan cifras.
- Opciones de despliegue: ComfyUI (con build que incluya Text Encode MOSS-Image Edit) y pipeline nativo de SimpleTuner.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MOSS-Image-SFT-pose-lora-step2400 | LoRA de pose sobre MOSS-Image-SFT | no disponible | no disponible | no disponible | Hugging Face |
| thedeoxen/MOSS-Image-pose-control-lora | LoRA de control de pose sobre MOSS-Image | no disponible | no disponible | no disponible | Hugging Face |
| Adaptadores de pose para FLUX/ControlNet (genericos) | ControlNet / LoRA | no disponible | no disponible | variable | Hugging Face |

El unico comparable directo identificado en la informacion es el LoRA de control de pose de thedeoxen, del que el autor adapta los flujos de trabajo. No se dispone de datos de rendimiento de esa alternativa para una comparacion cuantitativa.

## Limitaciones y advertencias

- Entrenado con solo 128 tripletas, un volumen muy reducido que puede limitar la generalizacion a poses, cuerpos, vestimenta o escenas fuera de la distribucion del dataset.
- El acierto de pose medido es del 43,26 %, lo que implica que mas de la mitad de las articulaciones evaluadas no caen dentro del margen del 10 %; no es un control de pose de alta precision.
- Requiere el modelo base MOSS-Image-SFT y un build especifico de ComfyUI con el nodo Text Encode MOSS-Image Edit; no funciona de forma autonoma.
- La licencia no esta declarada, lo que impide confirmar si se permite uso comercial del adaptador o de las imagenes generadas.
- No se documentan idiomas soportados ni sesgos conocidos; el prompt de entrenamiento esta en ingles y la evaluacion usa un unico prompt.
- Riesgo de alucinacion visual y de artefactos anatomicos en poses complejas, oclusiones o manos, no cuantificado por el autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion independiente de la comunidad.
- Los flujos de trabajo derivan de un tercero y llevan su propia licencia y aviso, que deben revisarse antes de reutilizarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niuhesanlu/MOSS-Image-SFT-pose-lora-step2400
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Ficheros del modelo base para ComfyUI: https://huggingface.co/Comfy-Org/MOSS-Image/tree/main
- Dataset de entrenamiento: https://huggingface.co/datasets/dimitribarbot/dw_pose_controlnet
- LoRA de referencia de thedeoxen: https://huggingface.co/thedeoxen/MOSS-Image-pose-control-lora
- Editor OpenPose para ComfyUI: https://github.com/space-nuko/ComfyUI-OpenPose-Editor
- Preprocesador DWPose: https://github.com/Fannovel16/comfyui_controlnet_aux
