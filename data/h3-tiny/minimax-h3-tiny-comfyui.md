# H3-Tiny/MiniMax-H3-Tiny-ComfyUI

## Resumen

MiniMax-H3-Tiny-ComfyUI es un conjunto de checkpoints de un solo archivo derivados de MiniMax-H3, un modelo de difusion para generacion conjunta de video y audio. El trabajo lo firma H3-Tiny, un proyecto independiente no afiliado a MiniMax ni a Comfy Org, y consiste en una poda estructural del modelo original de 33B parametros que lo reduce hasta 13,98B-17,08B segun la variante, manteniendo el pipeline de generacion texto-a-video, imagen-a-video y referencia-a-video.

La relevancia del artefacto es practica: empaqueta los pesos podados en el formato de claves que ComfyUI espera para su soporte nativo de MiniMax-H3, de modo que el modelo puede cargarse con el nodo `Load Diffusion Model` estandar sin nodos personalizados (salvo para la variante FewStep). Esto reduce la barrera de entrada para experimentar con generacion de video con audio en entornos ComfyUI, aunque sigue exigiendo hardware de gama alta: el repo ocupa 130,8 GB y los ficheros bf16 van de 28,1 a 34,2 GB.

El modelo cubre cuatro variantes segun la tarea: Ref2VA (referencia a video con audio), FL2VA (primer y ultimo fotograma a video con audio) y T2VA (texto a video con audio, reutilizando el checkpoint FL2VA). Una de las variantes incorpora destilacion few-step para muestrear en 6 pasos en lugar de 50.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (transformer) para generacion conjunta de video y audio; pesos derivados de MiniMax-H3 con poda estructural de profundidad y anchura de FFN |
| Parametros totales | 13,98B (14B OKD Ref2VA) / 17,05B (17B Pruned Ref2VA y FL2VA) / 17,08B (17B FewStep Ref2VA) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 en los checkpoints publicados; no se documentan otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (MiniMax H3 Community License Agreement) |
| Formato de pesos | safetensors (single-file, formato de claves de ComfyUI) |

## Arquitectura y entrenamiento

Los checkpoints son repackaging de los transformers de H3-Tiny en el layout de claves de ComfyUI. La base es MiniMax-H3, un modelo de difusion que genera video y audio de forma conjunta; H3-Tiny aplica poda estructural sobre ese modelo, reduciendo profundidad y anchura de las capas FFN. ComfyUI lee la profundidad y anchura podadas directamente de los tensores, por lo que no hace falta un nodo personalizado para cargar las variantes estandar.

La conversion se realizo con `scripts/convert_comfyui.py`, que escribe el AdaLN en la forma de curva de ComfyUI (`adaln_t_table`), reproduciendo el AdaLN de diffusers con un error relativo de aproximadamente 1e-10. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. La variante FewStep incorpora un endpoint de paso que ComfyUI estandar no pasa al modelo, de ahi que requiera nodos propios.

## Capacidades

- Generacion de video a partir de texto (T2VA), con audio asociado.
- Generacion de video a partir de primer y ultimo fotograma (FL2VA).
- Generacion de video a partir de una imagen de referencia (Ref2VA).
- Generacion conjunta de audio y video en el mismo pipeline.
- Muestreo estandar de 50 pasos con scheduler `simple`, guider sin CFG (`BasicGuider`) y sampler `euler`.
- Muestreo acelerado en 6 pasos (4 o mas funcionan) en la variante FewStep, mediante nodos H3-Tiny.
- Integracion nativa con ComfyUI mediante el nodo `Load Diffusion Model`.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; es un modelo generativo de difusion, no un LLM.

## Casos de uso

- Prototipado de video generativo con audio en ComfyUI: cargar el fichero en `models/diffusion_models/`, el text encoder Qwen3-VL 32B y los VAE de video y audio, y lanzar el workflow nativo de MiniMax H3 para obtener clips con sonido sin escribir codigo.
- Animacion de fotogramas clave: usar la variante FL2VA con el nodo Image to Video proporcionando primer y ultimo fotograma para interpolar movimiento en secuencias controladas, util en previsualizacion de storyboards.
- Transferencia de estilo o identidad desde una referencia: la variante Ref2VA con el nodo Reference to Video permite generar clips que mantienen rasgos de una imagen de referencia, aplicable a contenido de marca o personajes recurrentes.
- Iteracion rapida en produccion audiovisual: la variante FewStep con 6 pasos reduce el coste de muestreo frente a los 50 pasos estandar, adecuada para explorar variaciones antes de un render final de mayor calidad.
- Investigacion en poda de modelos generativos: los checkpoints permiten comparar el comportamiento de un modelo de 33B podado a 14B-17B frente al original, evaluando la degradacion en calidad de video y audio.
- Evaluacion de pipelines ComfyUI en infraestructura propia: al estar en formato single-file y requerir solo nodos estandar, sirve para validar flujos de trabajo de video en clusters con H200 o GPUs de gran memoria antes de desplegar el modelo completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo indica una validacion cualitativa: los ficheros se probaron en el commit `afcb984` de ComfyUI (2026-11-21) a 1344x768 y 243 fotogramas en una H200, y las salidas coinciden con el pipeline de diffusers de H3-Tiny.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; los pesos bf16 ocupan 28,1 GB (14B) o 34,2 GB (17B), a lo que hay que sumar el text encoder Qwen3-VL 32B y los dos VAE (video fp16 y audio fp32), por lo que se requiere memoria muy superior a los pesos del transformer.
- GPU recomendadas: la model card cita una NVIDIA H200 para la validacion a 1344x768 y 243 fotogramas. No se documentan otras GPU probadas.
- Cabe en GPU de consumo: no disponible; con los tamanos de pesos y el text encoder de 32B, no es esperable que quepa en GPUs de consumo convencionales, aunque no se confirma en la informacion.
- Opciones de despliegue: ComfyUI con soporte nativo de MiniMax-H3 (commit `afcb984` o posterior); nodos personalizados `ComfyUI-MiniMax-H3-Tiny` solo para la variante FewStep. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles; solo se indica que FewStep muestrea en 6 pasos frente a 50 del resto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Tiny (17B Pruned) | 17,05B | no disponible | Video + audio | MiniMax H3 Community License | Hugging Face, ComfyUI |
| MiniMax-H3-Tiny (14B OKD) | 13,98B | no disponible | Video + audio | MiniMax H3 Community License | Hugging Face, ComfyUI |
| MiniMax-H3 (original) | 33B (segun la model card) | no disponible | Video + audio | MiniMax H3 Community License | Hugging Face, ComfyUI |

No se dispone de datos de benchmarks para comparar rendimiento entre estas variantes ni con alternativas de otros desarrolladores.

## Limitaciones y advertencias

- Licencia restrictiva: los pesos son derivados de MiniMax H3 y se distribuyen bajo la MiniMax H3 Community License, con ambito territorial y politica de uso aceptable especificos; es obligatorio revisar `LICENSE-MiniMax-H3` y `NOTICE` antes de cualquier uso comercial.
- Proyecto independiente: H3-Tiny no esta afiliado ni respaldado por MiniMax ni por Comfy Org, lo que implica ausencia de soporte oficial.
- Los LoRA turbo de Comfy-Org fueron entrenados sobre el modelo de 33B y no estan probados con H3-Tiny; la model card recomienda no usarlos.
- La variante FewStep requiere nodos personalizados y no funciona con el flujo estandar de ComfyUI.
- Solo se han publicado pesos en bf16; no hay cuantizaciones documentadas que faciliten el despliegue en hardware mas modesto.
- No se documentan sesgos, tasas de alucinacion ni limitaciones de idioma; al ser un modelo de difusion video-audio, los riesgos principales son de contenido generado y cumplimiento de la politica de uso.
- El repo ocupa 130,8 GB, lo que exige almacenamiento considerable incluso para descargar una sola variante.
- La validacion se limita a una configuracion concreta (H200, 1344x768, 243 fotogramas); el comportamiento fuera de ese rango no esta documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Pagina del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Repositorio GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Coleccion H3-Tiny: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Variante 17B Pruned Ref2VA: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA
- Variante 17B Pruned FL2VA: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-FL2VA
- Variante 14B OKD Ref2VA v0.1: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1
- Variante 17B FewStep Ref2VA v0.1: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-FewStep-Ref2VA-v0.1
- Text encoder y VAE (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Script de conversion: https://github.com/fuyi25/MiniMax-H3-Tiny/blob/main/scripts/convert_comfyui.py
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI/blob/main/LICENSE-MiniMax-H3
