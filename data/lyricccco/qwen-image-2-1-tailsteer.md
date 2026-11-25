# Lyricccco/Qwen-Image-2.1-TailSteer

## Resumen

Qwen-Image-2.1-TailSteer es un ajuste fino (finetune) del modelo de difusion Qwen-Image-2.1 de Alibaba Qwen, publicado por el usuario Lyricccco. Su proposito es mitigar la deriva acumulativa (drift) que se produce en edicion de imagenes iterativa multi-turno: cuando la salida de cada edicion se convierte en la entrada de la siguiente, los detalles de identidad, ropa y fondo tienden a degradarse. TailSteer es una etapa final de entrenamiento que conserva en gran medida las capacidades del modelo base mientras reduce esa degradacion.

El modelo mantiene la misma arquitectura y el mismo formato de pesos que Qwen-Image-2.1, con 7.115.124.736 parametros en safetensors y un repositorio de 47,4 GB. Se carga con la misma API de `diffusers` (`QwenImage21Pipeline`) y los mismos nodos nativos de ComfyUI, sin adaptadores ni modulos de inferencia adicionales. Segun la model card, mejora en +1,22 dB de PSNR y un 11,5 % menos de LPIPS fuera de la region editada en el turno 10 del benchmark Add & Preserve.

Es relevante para flujos de edicion de imagen en produccion donde se encadenan varias ediciones sobre la misma escena, ya que permite mantener la identidad de personas y objetos sin cambiar el stack tecnico existente. La licencia es `qwen-research` (etiquetada como `other`), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion basado en transformer (Qwen-Image-2.1); no se detalla la variante exacta en la informacion disponible |
| Parametros totales | 7.115.124.736 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; la release actual es BF16 y no se han validado configuraciones cuantizadas |
| Idiomas soportados | no disponible (los benchmarks reportan resultados en EN y ZH) |
| Licencia | qwen-research (`other`) |
| Formato de pesos | safetensors (BF16); incluye transformer BF16 para ComfyUI |

## Arquitectura y entrenamiento

TailSteer es una etapa final de entrenamiento sobre los pesos completos de Qwen-Image-2.1, un modelo de difusion para generacion y edicion de imagenes. La model card indica que se conservan la misma arquitectura, el mismo layout oficial y la misma API de carga, por lo que se trata de un finetune de pesos completos y no de un adaptador LoRA ni de un merge. El objetivo del entrenamiento es reducir la deriva acumulativa cuando cada edicion se realimenta como entrada de la siguiente, sin sacrificar las capacidades de generacion texto-a-imagen ni de edicion de un solo turno.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO; al tratarse de un modelo de difusion, estos conceptos no aplican del mismo modo. Se enlazan dos datasets: TailSteer-Source (datos de entrenamiento) y Add-and-Preserve (benchmark de evaluacion con 100 imagenes y diez turnos). La innovacion destacable es el uso de TailSteer a lo largo de la trayectoria de denoising original, sin necesidad de mascaras de preservacion ni de conmutacion de modelos en inferencia.

## Capacidades

- Generacion de texto a imagen (text-to-image) con el mismo checkpoint.
- Edicion de imagen de un solo turno mediante instrucciones en lenguaje natural.
- Edicion iterativa multi-turno con menor deriva acumulativa; se ha probado una cadena de 20 ediciones sucesivas.
- Edicion multi-imagen con referencias (por ejemplo, una persona y una guia de pose como entradas ordinarias).
- Compatibilidad con la interfaz oficial de Qwen para multiples imagenes de referencia.
- Integracion nativa en ComfyUI mediante los nodos de Qwen-Image-2.1 (single-turn, multi-turn, multi-imagen y text-to-image).
- No se documentan en la informacion disponible capacidades de tool calling, agentes, audio ni modos de razonamiento explicito.

## Casos de uso

- Edicion iterativa de escenas en produccion audiovisual: encadenar decenas de ediciones sobre el mismo fotograma manteniendo la identidad de los personajes y el fondo, gracias a la reduccion de drift medida en Add & Preserve.
- Retoque fotografico por lotes: aplicar cambios de vestuario, iluminacion o color sobre un catalogo de imagenes pasando cada resultado como entrada de la siguiente edicion sin degradar texturas.
- Diseno de producto y variaciones: generar una imagen base con texto-a-imagen y aplicar variaciones sucesivas (materiales, colores, accesorios) conservando la forma y el contexto del objeto.
- Previsualizacion creativa en navegador: usar la demo comunitaria de Hugging Face Spaces para probar ediciones sin instalacion local, util para evaluacion rapida antes de integrar el modelo.
- Flujos de trabajo en ComfyUI: sustituir el transformer BF16 de Qwen-Image-2.1 por el de TailSteer en grafos existentes, sin nodos personalizados ni merge de LoRA, para pipelines de edicion ya desplegados.
- Edicion guiada por referencias multiples: mantener una persona y una guia de pose como entradas para generar variaciones consistentes en sesiones de fotografia o moda.
- Investigacion en edicion de imagenes: usar Add & Preserve y los datasets enlazados para medir preservacion de fondo y completado de objetos en cadenas de diez turnos.

## Benchmarks y rendimiento

Resultados reportados en la model card (modelo base frente a TailSteer):

| Benchmark | Modelo base | Tras TailSteer |
|---|---:|---:|
| Qwen-IB EN ↑ | 53,39 | 53,06 |
| Qwen-IB ZH ↑ | 53,34 | 53,20 |
| BizGen ES (%) ↑ | 57,03 | 57,38 |
| GEdit EN ↑ | 8,11 | 8,04 |
| GEdit ZH ↑ | 7,80 | 7,72 |
| RISE accuracy (%) ↑ | 20,56 | 18,06 |
| ImgEdit ↑ | 4,40 | 4,42 |

En preservacion fuera de la region editada, en el turno 10 de Add & Preserve: +1,22 dB de PSNR y un 11,5 % menos de LPIPS. El rendimiento en RISE es inferior al del modelo base en esta configuracion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 7,1 mil millones de parametros en BF16, el peso del transformer ronda los 14 GB, a lo que hay que sumar el text encoder y el VAE del modelo base.
- GPU recomendadas: no especificadas en la informacion disponible; por tamano, se requiere al menos una GPU con suficiente VRAM para BF16 (A100, H100 o equivalentes).
- Cabe en GPU de consumo: no validado; la model card indica explicitamente que las configuraciones cuantizadas y para GPU de consumo no se han validado.
- Opciones de despliegue: `diffusers` con `QwenImage21Pipeline` (BF16) y ComfyUI con los nodos nativos de Qwen-Image-2.1; no se mencionan vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles; la model card menciona un schedule de muestreo de 40 pasos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen-Image-2.1-TailSteer | 7.115.124.736 | no disponible | Mejora preservacion multi-turno (+1,22 dB PSNR, -11,5 % LPIPS en turno 10); puntuaciones cercanas al base en Qwen-IB, GEdit, ImgEdit | qwen-research | Hugging Face, ComfyUI, demo en Spaces |
| Qwen-Image-2.1 (base) | no disponible | no disponible | Referencia de los benchmarks anteriores | qwen-research | Hugging Face |
| Otros modelos de edicion de imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos suficientes para comparar con alternativas de terceros de la misma categoria.

## Limitaciones y advertencias

- La licencia `qwen-research` (etiquetada como `other`) restringe el uso comercial; es necesario revisar el archivo LICENSE antes de desplegar en produccion.
- El rendimiento en RISE accuracy cae respecto al modelo base (20,56 a 18,06), por lo que no es adecuado para tareas evaluadas con esa metrica.
- La release actual es solo BF16; no se han validado configuraciones cuantizadas ni GPU de consumo, lo que limita el despliegue en hardware modesto.
- Riesgo de alucinacion y de cambios no solicitados inherente a los modelos de difusion de edicion; la preservacion mejora pero no es perfecta.
- Sesgos conocidos: no documentados en la informacion disponible.
- Idiomas soportados: no disponibles; los benchmarks solo cubren EN y ZH.
- La model card advierte de que una version mas fuerte (el doble de capacidad de preservacion) esta en camino, lo que puede implicar cambios de version.
- El autor es un usuario individual (Lyricccco), no el equipo oficial de Qwen; el soporte y la garantia de mantenimiento no estan respaldados por Alibaba.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Lyricccco/Qwen-Image-2.1-TailSteer
- Repositorio GitHub: https://github.com/Lyricccco/tailsteer
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/akhaliq/endless-edit-tailsteer
- Dataset de entrenamiento: https://huggingface.co/datasets/Lyricccco/TailSteer-Source
- Dataset de evaluacion Add & Preserve: https://huggingface.co/datasets/Lyricccco/Add-and-Preserve
- Transformer BF16 para ComfyUI: https://huggingface.co/Lyricccco/Qwen-Image-2.1-TailSteer/resolve/main/comfyui/qwen_image_2.1_tailsteer_bf16.safetensors
- Guia de ComfyUI: https://huggingface.co/Lyricccco/Qwen-Image-2.1-TailSteer/blob/main/comfyui/README.md
- Workflows de ComfyUI: https://huggingface.co/Lyricccco/Qwen-Image-2.1-TailSteer/tree/main/comfyui/workflows
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Paper referenciado (arXiv:2611.06741): no disponible como enlace directo en la informacion proporcionada
