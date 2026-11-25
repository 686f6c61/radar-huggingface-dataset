# H3-Tiny/H3-Tiny-ComfyUI

## Resumen

H3-Tiny-ComfyUI es un repositorio de checkpoints de un solo archivo (single-file) para ComfyUI derivados de MiniMax-H3, un modelo de generacion conjunta de video y audio. Lo desarrolla el proyecto independiente H3-Tiny, que aplica poda estructurada (structured pruning) sobre los pesos originales de MiniMaxAI/MiniMax-H3 para reducir el coste computacional manteniendo la generacion conjunta de video y audio. El repositorio empaqueta los pesos podados en el formato de claves nativo que ComfyUI espera para su soporte de MiniMax H3, de modo que no se necesitan nodos personalizados para los checkpoints estandar.

El modelo base MiniMax-H3 es un modelo de difusion (DiT) de aproximadamente 33B parametros orientado a text-to-video e image-to-video con audio sincronizado. H3-Tiny ofrece variantes podadas de 17,05B y 13,98B parametros, en formatos bf16 e INT8 (W8A8 con rotacion de Hadamard), con flujos de trabajo Ref2VA (referencia a video+audio) y FL2VA/T2VA (primer/ultimo fotograma o texto a video+audio). Una de las variantes (FewStep) permite muestrear en 6 pasos en lugar de 50.

La relevancia actual radica en que reduce los requisitos de VRAM para generar video con audio: segun la model card, a 1344x768 y 243 fotogramas en una H200, el DiT consume unos 17 GB de VRAM en INT8 frente a 33 GB en bf16, con velocidad de muestreo comparable a bf16. El repo ocupa 200,2 GB e incluye los distintos checkpoints y sus variantes de cuantizacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DiT (diffusion transformer) para generacion conjunta de video y audio; pesos podados de MiniMax-H3 |
| Parametros totales | 17,05B (variantes 17B), 13,98B (variante 14B OKD), 17,08B (variante FewStep) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 e INT8 (W8A8 con rotacion de Hadamard) |
| Idiomas soportados | no disponible |
| Licencia | minimax-h3-community-license (MiniMax H3 Community License Agreement) |
| Formato de pesos | safetensors (diffusion-single-file, layout de claves de ComfyUI) |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion (DiT) que genera video y audio de forma conjunta. H3-Tiny no entrena desde cero: parte de los pesos de MiniMaxAI/MiniMax-H3 (aproximadamente 33B parametros) y aplica poda estructurada sobre la profundidad y el ancho de las capas FFN, obteniendo variantes de 17,05B y 13,98B. Los checkpoints de este repositorio son los mismos pesos que las versiones en formato diffusers, pero reempaquetados en el layout de claves de ComfyUI mediante el script `convert_comfyui.py`; ComfyUI infiere la profundidad y anchura podadas a partir de los tensores, por lo que no requiere nodos personalizados para los checkpoints estandar.

Los archivos INT8 se generan con `quantize_comfyui_int8.py` y se ejecutan con los kernels INT8 de ComfyUI (W8A8 con rotacion de Hadamard). La conversion de AdaLN usa la forma de curva de ComfyUI (`adaln_t_table`), que reproduce el AdaLN de diffusers con un error relativo de aproximadamente 1e-10. La variante FewStep incorpora un endpoint de paso que ComfyUI estandar no pasa al modelo, por lo que requiere los nodos propios del proyecto. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF/DPO.

## Capacidades

- Generacion de video a partir de texto (T2VA) e imagen (FL2VA con primer y ultimo fotograma).
- Generacion conjunta de video y audio sincronizado.
- Generacion condicionada por referencia (Ref2VA): video y audio guiados por una referencia.
- Muestreo estandar de 50 pasos con scheduler `simple`, guider sin CFG (`BasicGuider`) y sampler `euler`.
- Muestreo acelerado en la variante FewStep: 6 pasos por defecto (4 o mas funcionan), mediante nodos propios.
- Ejecucion en ComfyUI con soporte nativo de MiniMax H3 y kernels INT8 (W8A8 con Hadamard).
- Soporte de cuantizacion INT8 con velocidad de muestreo comparable a bf16 y preservacion de composicion y movimiento.
- No se documentan en la informacion disponible capacidades de tool calling, agentes, razonamiento multi-step ni multilingues.

## Casos de uso

- Generacion de video con audio para prototipado creativo: usar el flujo T2VA con el checkpoint `fl2va` para producir clips de 1344x768 y hasta 243 fotogramas con audio generado conjuntamente, adecuado para previsualizaciones rapidas en estudio.
- Image-to-video con control de primer y ultimo fotograma: el checkpoint `fl2va` con el nodo Image to Video permite interpolar movimiento entre dos imagenes dadas, util para animaticos y transiciones planificadas.
- Generacion condicionada por referencia: el checkpoint `ref2va` con el nodo Reference to Video permite mantener la identidad o el estilo de un sujeto de referencia a lo largo del clip, util para contenido de marca o personajes recurrentes.
- Iteracion rapida en produccion con FewStep: la variante FewStep con 6 pasos (o 4) y los nodos H3-Tiny reduce el coste por iteracion en fases de exploracion, manteniendo el flujo de Reference to Video.
- Despliegue con VRAM contenida en una sola GPU: los archivos INT8 reducen el DiT a unos 17 GB de VRAM a 1344x768 y 243 fotogramas en una H200 (frente a 33 GB en bf16), lo que permite generar video con audio en GPUs de 24-48 GB con la cuantizacion adecuada.
- Integracion en pipelines de ComfyUI existentes: al usar el layout de claves nativo y los flujos de trabajo oficiales de MiniMax H3, los checkpoints se cargan con Load Diffusion Model sin nodos personalizados, lo que facilita incorporarlos a automatizaciones basadas en ComfyUI.
- Prototipado de audio-video sincronizado: la generacion conjunta de audio y video evita pipelines separados de Foley o doblaje en fases tempranas de creacion de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente aporta datos operativos de VRAM y velocidad:

| Metrica | Valor |
|---|---|
| Resolucion y duracion de prueba | 1344x768, 243 fotogramas |
| VRAM del DiT en bf16 (H200) | ~33 GB |
| VRAM del DiT en INT8 (H200) | ~17 GB |
| Velocidad de muestreo INT8 | comparable a bf16 |
| Pasos de muestreo (estandar) | 50 (scheduler `simple`, `euler`, `BasicGuider`) |
| Pasos de muestreo (FewStep) | 6 por defecto (4 o mas funcionan) |

## Requisitos de hardware

- VRAM estimada del DiT: ~33 GB en bf16 y ~17 GB en INT8 a 1344x768 y 243 fotogramas (medido en una H200).
- GPU recomendadas: H200 (configuracion de referencia de las pruebas); se requiere una GPU con al menos ~34 GB para bf16 o ~18 GB para INT8 solo para el DiT, mas el text encoder y los VAE.
- Text encoder: `qwen3vl_32b_minimax_h3_*.safetensors` de Comfy-Org/MiniMax-H3, que anade requisitos de VRAM no cuantificados en la informacion disponible.
- VAE: `minimax_h3_video_vae_fp16.safetensors` y `minimax_h3_audio_vae_fp32.safetensors`.
- Cabe en GPU de consumo: no confirmado; los requisitos del DiT en INT8 (~17 GB) mas text encoder y VAE hacen improbable un ajuste comodo en GPUs de 24 GB, y no se documenta en la informacion disponible.
- Despliegue: ComfyUI (commit probado `afcb984`, 2026-11-21) con soporte nativo de MiniMax H3; opcion `--enable-triton-backend` con los nodos H3-Tiny para dividir llamadas INT8 demasiado grandes para los kernels Triton.
- Nodos personalizados: necesarios solo para la variante FewStep (`ComfyUI-MiniMax-H3-Tiny`).
- Latencia y throughput: no disponibles; solo se indica que el muestreo INT8 corre tan rapido como bf16.
- Los turbo LoRA de Comfy-Org fueron entrenados sobre el modelo de 33B y no estan probados con H3-Tiny; se recomienda muestrear sin ellos.

## Comparativa con modelos similares

| Modelo | Parametros | Formato | VRAM DiT (1344x768, 243 frames) | Licencia | Notas |
|---|---|---|---|---|---|
| H3-Tiny 17B (este repo) | 17,05B | bf16 / INT8 | ~33 GB / ~17 GB | MiniMax H3 Community License | Poda estructurada de MiniMax-H3; flujos Ref2VA y FL2VA/T2VA |
| H3-Tiny 14B OKD | 13,98B | bf16 / INT8 | no disponible | MiniMax H3 Community License | Variante Ref2VA con destilacion OKD |
| H3-Tiny 17B FewStep | 17,08B | bf16 / INT8 | no disponible | MiniMax H3 Community License | 6 pasos por defecto; requiere nodos propios |
| MiniMax-H3 (base) | ~33B | no disponible | no disponible | MiniMax H3 Community License | Modelo original del que derivan los checkpoints |

No se dispone en la informacion proporcionada de datos de otros modelos comparables de generacion conjunta de video y audio (parametros, contexto, benchmarks o licencia), por lo que la comparativa se limita a las variantes del propio proyecto y al modelo base.

## Limitaciones y advertencias

- Licencia MiniMax H3 Community License: los pesos son derivados de MiniMax H3 y su uso debe cumplir el acuerdo, incluido su ambito territorial y su politica de uso aceptable; revisar antes de uso comercial.
- No es un proyecto oficial: H3-Tiny es independiente y no esta afiliado ni respaldado por MiniMax ni por Comfy Org.
- Los turbo LoRA de Comfy-Org se entrenaron sobre el modelo de 33B y no estan probados con H3-Tiny; usarlos puede degradar la calidad.
- La variante FewStep requiere nodos personalizados porque ComfyUI estandar no pasa el endpoint de paso al modelo; sin ellos no funciona correctamente.
- Con `--enable-triton-backend` es necesario instalar los nodos H3-Tiny para dividir llamadas INT8 que exceden los kernels Triton.
- La poda reduce capacidad respecto al modelo base de ~33B; no se documentan en la informacion disponible metricas de calidad comparativas frente al original.
- No se documentan sesgos conocidos, tasas de alucinacion, limitaciones de contexto ni idiomas soportados; estos datos figuran como no disponibles.
- El repositorio ocupa 200,2 GB, lo que exige planificacion de almacenamiento y ancho de banda para su descarga.
- Requiere descargar por separado el text encoder (Qwen3-VL 32B) y los VAE desde Comfy-Org/MiniMax-H3; no estan incluidos en este repositorio.

## Enlaces

- Hugging Face: https://huggingface.co/H3-Tiny/H3-Tiny-ComfyUI
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Pagina del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Repositorio GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Coleccion H3-Tiny: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Variante 17B Ref2VA: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA
- Variante 17B FL2VA: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-FL2VA
- Variante 14B OKD Ref2VA: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1
- Variante 17B FewStep Ref2VA: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-FewStep-Ref2VA-v0.1
- Text encoder y VAE (Comfy-Org): https://huggingface.co/Comfy-Org/MiniMax-H3
- Script de conversion ComfyUI: https://github.com/fuyi25/MiniMax-H3-Tiny/blob/main/scripts/convert_comfyui.py
- Script de cuantizacion INT8: https://github.com/fuyi25/MiniMax-H3-Tiny/blob/main/scripts/quantize_comfyui_int8.py
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI/blob/main/LICENSE-MiniMax-H3
- Incidencias: https://github.com/fuyi25/MiniMax-H3-Tiny/issues
- Contacto: fohoo@outlook.com
