# AI-KSK/ksk-video-178-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-178-comfyui-workflows` no es un modelo de IA en sentido estricto, sino un repositorio de acompanamiento de un tutorial en video sobre flujos de trabajo de ComfyUI para el modelo de generacion de imagenes Z-Image. El autor, AI-KSK, publica aqui la transcripcion en ingles del episodio y la tabla de parametros extraida del JSON del grafo, pero deliberadamente no incluye ni los pesos ni el propio archivo JSON del workflow: el repositorio tiene 0.0 GB y no contiene artefactos ejecutables.

El contenido gira en torno a tres grafos de ComfyUI: uno de Z-Image Base con ControlNet 2.1 (30 pasos, CFG 3, latente 720x1280), otro que compara los aceleradores de 4 y 8 pasos de Base frente a una linea base de 20 pasos, y un tercero que combina Base para la mitad de alto ruido con Turbo para la mitad de bajo ruido, con el objetivo de recuperar calidad estetica sin perder el control estructural. La conclusion del autor es que los aceleradores no compensan la perdida de variedad cuando Turbo esta disponible y que no se pueden combinar con ControlNet.

Es relevante ahora como documentacion practica para quien ya trabaja con Z-Image en ComfyUI y quiere entender el compromiso entre control estructural y calidad estetica, pero no sirve como fuente de pesos ni como referencia de reproducibilidad, dado que el grafo solo esta disponible a traves de la pagina de RunningHub y del video del episodio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de flujos de trabajo ComfyUI, no de pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | no disponible (el repositorio no incluye pesos; los grafos referencian `z_image_bf16.safetensors`, `qwen_3_4b.safetensors` y `ae.safetensors`) |

## Arquitectura y entrenamiento

No se proporciona informacion sobre arquitectura ni entrenamiento del modelo subyacente Z-Image. El repositorio documenta exclusivamente la orquestacion en ComfyUI de tres pipelines de inferencia sobre Z-Image Base, un modelo de difusion latente que se carga como UNET en formato safetensors bf16, con un text encoder Qwen 3 4B (`qwen_3_4b.safetensors`) y un VAE (`ae.safetensors`). El ControlNet 2.1 se inyecta como parche de modelo a traves del nodo Z-Image Fun.

Los grafos documentados emplean muestreadores KSampler con scheduler `simple` y sampler `euler`. En el pipeline de dos etapas, el autor usa BasicScheduler con 10 pasos y denoise 0.51 para la mitad de bajo ruido, cediendo esa fase a Turbo, mientras que Base se encarga de la mitad de alto ruido. En el grafo de aceleradores se encadenan KSamplers de 4, 8 y 20 pasos con CFG 1 y CFG 3 respectivamente, aplicando LoRAs de destilacion (`Z-Image-Fun-Lora-Distill-4-Steps-2602-ComfyUI.safetensors` y `...-8-Steps-...`) con peso 1. No se documenta RLHF, DPO ni composicion del dataset.

## Capacidades

- Generacion de imagenes texto-a-imagen mediante Z-Image Base en ComfyUI, con resoluciones de 720x1280 y 1280x720 y batch de 1.
- Control estructural preciso mediante ControlNet 2.1 cargado como parche de modelo, con preprocesador de imagen de control y escalado por pixeles.
- Muestreo en dos etapas (alto ruido con Base, bajo ruido con Turbo) para combinar control estructural con calidad estetica.
- Aceleracion por LoRA de destilacion a 4 y 8 pasos, con CFG 1.
- Composicion de grafos de hasta 53 nodos en ComfyUI, encadenando varios KSampler y LoRAs en una misma sesion.
- No incluye soporte de tool calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multilingues mas alla del ingles en la documentacion.

## Casos de uso

- Prototipado de pipelines de imagen controlada: cargar ControlNet 2.1 como parche sobre Z-Image Base permite generar variaciones de una composicion fijada por una imagen de control, util para explorar direcciones de arte antes de fijar una.
- Reparacion estetica de una primera pasada con Base: dividir el muestreo en alto ruido (Base) y bajo ruido (Turbo) permite conservar la estructura impuesta por ControlNet y recuperar calidad en el acabado final.
- Evaluacion de aceleradores de destilacion: el grafo de 53 nodos compara KSamplers de 4, 8 y 20 pasos con CFG 1 y CFG 3, lo que sirve para medir en primera persona la perdida de variedad frente al ahorro de pasos.
- Documentacion de referencia para equipos de ComfyUI: la tabla de parametros extraida del JSON permite reconstruir los valores exactos de UNET, CLIP, VAE, sampler, scheduler, CFG y tamano de latente sin depender del video.
- Formacion y divulgacion: el tutorial en YouTube y Bilibili, junto con las paginas de RunningHub, sirve como material didactico sobre el compromiso entre control y estetica en difusion latente.
- Integracion en entornos gestionados: las paginas de RunningHub permiten ejecutar los grafos sin montar infraestructura local, util para validar el flujo antes de invertir en GPU.
- No es adecuado como caso de uso la generacion de codigo, el razonamiento textual, el soporte de agentes ni el procesamiento multilingue, capacidades que el repositorio no cubre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor aporta unicamente valoraciones cualitativas: el control con Base + ControlNet 2.1 es excelente pero la estetica es mediocre; los aceleradores reducen la variedad y no se pueden combinar con ControlNet; el de 4 pasos conserva mas valor que el de 8 pese a la perdida de diversidad.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica requisitos y no incluye pesos, aunque los grafos referencian un UNET en bf16 (`z_image_bf16.safetensors`) y un text encoder Qwen 3 de 4B (`qwen_3_4b.safetensors`), lo que en conjunto exige una GPU con memoria dedicada considerable.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI como entorno nativo de los grafos, y RunningHub como plataforma gestionada a traves de los enlaces del episodio.
- Latencia y throughput: no disponibles. El grafo de aceleradores encadena KSamplers de 4, 8 y 20 pasos, pero no se aportan tiempos medidos.

## Comparativa con modelos similares

No disponible. El repositorio no documenta comparaciones con otros modelos ni flujos de trabajo alternativos, y no se dispone de datos de parametros, contexto ni rendimiento del modelo subyacente Z-Image que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni el JSON del workflow: solo README y tabla de parametros. No es reproducible sin acudir a RunningHub o al video del episodio.
- Base + ControlNet no es usable tal cual para trabajo final: el propio autor lo califica de control excelente con estetica mediocre.
- Los aceleradores de 4 y 8 pasos no se pueden combinar con ControlNet; el autor califica la combinacion como extremadamente mala.
- La aceleracion reduce la variedad de las generaciones; el modo de 4 pasos conserva mas valor pero sigue costando diversidad.
- El repintado local con ControlNet 2.1 sobre Base queda explicitamente sin probar en este episodio.
- La licencia es `other`, sin terminos detallados en la informacion disponible; debe revisarse antes de cualquier uso comercial.
- La documentacion esta solo en ingles, lo que limita su uso directo en equipos hispanohablantes sin traduccion.
- Riesgo de confusion: el nombre del repositorio sugiere un modelo de video (`ksk-video-178`), pero el contenido trata de generacion de imagenes con Z-Image; no hay componente de video en los grafos descritos.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-178-comfyui-workflows
- RunningHub - Z Image Base + ControlNet: https://www.runninghub.ai/post/2022640984902864898/?inviteCode=rh-v1111
- RunningHub - Z Image Base + ControlNet + Turbo alto/bajo ruido: https://www.runninghub.ai/post/2022635998764601346/?inviteCode=rh-v1111
- RunningHub - Z Image Base aceleracion 8 y 4 pasos: https://www.runninghub.ai/post/2022636633476046849/?inviteCode=rh-v1111
- Tutorial en YouTube: https://www.youtube.com/watch?v=mYpdxdHGlQM
- Original en Bilibili: https://www.bilibili.com/video/BV1quZ7BpEPE
