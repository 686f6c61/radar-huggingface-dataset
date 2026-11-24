# Dima133722/MiniMax-H3-Tiny-ComfyUI

## Resumen

MiniMax-H3-Tiny-ComfyUI es un repositorio de checkpoints derivados de MiniMax-H3, un modelo de difusion para generacion conjunta de video y audio a partir de texto, imagenes de referencia o fotogramas clave. Lo publica el autor independiente Dima133722, que redistribuye los pesos del proyecto H3-Tiny (podado estructuralmente de MiniMax-H3) en el formato de archivo unico que consume ComfyUI de forma nativa. No es un modelo de lenguaje: es un modelo generativo de difusion con arquitectura transformer, pensado para sintetizar clips de video con pista de audio sincronizada.

El modelo base es MiniMaxAI/MiniMax-H3, del que hereda la licencia comunitaria. La variante podada reduce el modelo original de 33B parametros a aproximadamente 17B (o 14B en la version OKD), manteniendo la generacion conjunta de video y audio. El repo ocupa 130,8 GB e incluye varios checkpoints en bf16: variantes Ref2VA (referencia a video+audio) y FL2VA/T2VA (primer/ultimo fotograma o texto a video+audio), ademas de una variante FewStep que muestrea en 6 pasos.

Su relevancia practica esta en que permite ejecutar un generador de video con audio en ComfyUI sin nodos personalizados para las variantes estandar, y con nodos propios solo para el modo FewStep. La model card reporta pruebas a 1344x768 y 243 fotogramas en una sola GPU H200, con resultados equivalentes al pipeline de diffusers del proyecto original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para generacion conjunta de video y audio; pesos derivados de MiniMax-H3 con poda estructural de profundidad y anchura FFN |
| Parametros totales | 17,05B (variantes 17B Pruned y 17B FewStep); 13,98B (variante 14B OKD) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | Pesos publicados en bf16 (safetensors); no se documentan otras cuantizaciones en la informacion disponible |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors en archivo unico (diffusion-single-file), layout de claves de ComfyUI |

## Arquitectura y entrenamiento

El modelo es un transformer de difusion que genera video y audio de forma conjunta. Los checkpoints de este repo son los mismos pesos que los del proyecto H3-Tiny en formato diffusers, pero reempaquetados en el layout de claves de ComfyUI mediante el script `convert_comfyui.py`. La conversion escribe el AdaLN en la forma de curva de ComfyUI (`adaln_t_table`), que reproduce el AdaLN de diffusers con un error relativo del orden de 1e-10. ComfyUI lee la profundidad podada y la anchura FFN directamente de los tensores, por lo que las variantes estandar no requieren nodos personalizados.

La poda es estructural: se reduce el modelo original de 33B a unos 17B (o 14B en la variante OKD). La model card no detalla el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos datos no estan disponibles en la informacion proporcionada. La variante FewStep incorpora un mecanismo de muestreo en pocos pasos (6 por defecto, con 4 o mas funcionales) que requiere un endpoint de paso que ComfyUI estandar no pasa al modelo, de ahi los nodos propios del proyecto.

## Capacidades

- Generacion de video a partir de texto (T2VA) y a partir de primer y ultimo fotograma (FL2VA).
- Generacion condicionada por imagen de referencia (Ref2VA), usando el nodo Reference to Video de ComfyUI.
- Generacion conjunta de audio sincronizado con el video, mediante un VAE de audio dedicado.
- Salida de alta resolucion: probado a 1344x768 con 243 fotogramas.
- Muestreo estandar a 50 pasos con scheduler `simple`, guider sin CFG (`BasicGuider`) y sampler `euler`.
- Muestreo acelerado en la variante FewStep: 6 pasos por defecto, con 4 o mas funcionales.
- Integracion nativa con ComfyUI para las variantes estandar y mediante nodos del proyecto para FewStep.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni soporte multilingue de texto, ya que no es un modelo de lenguaje.

## Casos de uso

- Prototipado de video generativo en ComfyUI: cargar el checkpoint en `models/diffusion_models/` y usar el workflow nativo de MiniMax H3 para generar clips con audio sin escribir codigo adicional.
- Generacion de video a partir de imagenes de referencia: la variante Ref2VA permite mantener la identidad visual de un personaje o producto a lo largo del clip, util para contenido de marca o animatica.
- Interpolacion entre fotogramas clave: la variante FL2VA genera el video intermedio entre un primer y un ultimo fotograma, adecuada para transiciones y animacion de storyboards.
- Generacion de video con audio para previsualizacion de anuncios: el modelo produce pista de audio junto al video, lo que reduce pasos en el flujo de preproduccion.
- Iteracion rapida con FewStep: la variante de 6 pasos permite explorar variaciones de una escena con muchas menos evaluaciones del modelo, util en sesiones de direccion de arte.
- Investigacion sobre poda de modelos de difusion: al ser un derivado podado de MiniMax-H3 con pesos publicos, sirve para estudiar el impacto de la reduccion de profundidad y anchura FFN en la calidad de video y audio.
- Despliegue en infraestructura de gama alta para generacion por lotes: con una H200 se pueden generar clips a 1344x768 y 243 fotogramas, adecuado para pipelines de contenido automatizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card solo reporta una validacion cualitativa: los archivos probados en el commit `afcb984` de ComfyUI (2026-11-21) a 1344x768 y 243 fotogramas en una sola H200 producen salidas equivalentes al pipeline de diffusers del proyecto H3-Tiny. No se aportan metricas numericas de calidad (FVD, CLIP score, etc.) ni comparaciones cuantitativas con el modelo base de 33B.

## Requisitos de hardware

- VRAM estimada: los checkpoints en bf16 ocupan entre 28,1 GB (14B OKD) y 34,2 GB (17B) solo en pesos; la inferencia completa requiere ademas el text encoder Qwen3-VL de 32B y los dos VAE (video fp16 y audio fp32), por lo que el consumo agregado supera ampliamente la capacidad de una GPU de consumo.
- GPU recomendadas: la model card documenta pruebas en una NVIDIA H200. Por tamano de pesos y encoder, se requiere hardware de centro de datos (H100, H200, A100 de 80 GB) para ejecutar el pipeline completo sin offloading agresivo.
- GPU de consumo: no cabe en GPUs de consumo tipo RTX 4090 (24 GB) con los pesos en bf16 y el encoder de 32B; requeriria cuantizacion y offloading no documentados en la informacion disponible.
- Opciones de despliegue: ComfyUI nativo (workflows `MiniMax H3 Image to Video` y `MiniMax H3 Reference to Video`), con nodos personalizados `ComfyUI-MiniMax-H3-Tiny` para la variante FewStep; el proyecto original dispone de pipeline diffusers.
- Latencia y throughput: no disponibles de forma numerica; solo se indica que la variante FewStep muestrea en 6 pasos frente a los 50 del modo estandar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Tiny-ComfyUI (este repo) | 17,05B / 13,98B | Video + audio, 1344x768, 243 fotogramas probados | MiniMax H3 Community License | Hugging Face, formato single-file para ComfyUI |
| MiniMaxAI/MiniMax-H3 (base) | 33B | Video + audio | MiniMax H3 Community License | Hugging Face |
| MiniMax-H3-Tiny-17B-Pruned-Ref2VA (proyecto H3-Tiny) | 17,05B | Video + audio, Ref2VA | MiniMax H3 Community License | Hugging Face, formato diffusers |
| MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1 | 13,98B | Video + audio, Ref2VA | MiniMax H3 Community License | Hugging Face, formato diffusers |

La comparativa se limita a las variantes del mismo linaje porque la informacion proporcionada no incluye otros modelos de video con audio comparables. No se dispone de datos de rendimiento que permitan ordenar estas variantes por calidad.

## Limitaciones y advertencias

- Licencia: los pesos son derivados de MiniMax H3 y se distribuyen bajo la MiniMax H3 Community License Agreement, con ambito territorial y politica de uso aceptable propios; es imprescindible revisar el archivo LICENSE y el NOTICE antes de cualquier uso comercial.
- Proyecto independiente: H3-Tiny no esta afiliado ni respaldado por MiniMax ni por Comfy Org, por lo que no hay garantias de soporte oficial.
- Los LoRA turbo de Comfy-Org fueron entrenados sobre el modelo de 33B y no estan probados con H3-Tiny; usarlos puede degradar la calidad.
- La variante FewStep requiere nodos personalizados y un loader especifico; no funciona con el flujo estandar de ComfyUI.
- Solo se ha validado en el commit `afcb984` de ComfyUI; cambios posteriores en el software pueden romper la compatibilidad.
- No hay datos publicados sobre sesgos, tasas de alucinacion visual o fidelidad de audio; al ser un modelo generativo, puede producir contenido incoherente o artefactos.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion de la comunidad.
- El tamano del repo (130,8 GB) y la necesidad del text encoder de 32B implican requisitos de almacenamiento y memoria elevados.
- No se documentan idiomas soportados ni comportamiento multilingue.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Dima133722/MiniMax-H3-Tiny-ComfyUI
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Proyecto H3-Tiny en GitHub: https://github.com/fuyi25/MiniMax-H3-Tiny
- Pagina del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Coleccion H3-Tiny en Hugging Face: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Text encoder y VAE para ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3
- Variante 17B Pruned Ref2VA: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-Ref2VA
- Variante 17B Pruned FL2VA: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-Pruned-FL2VA
- Variante 14B OKD Ref2VA v0.1: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1
- Variante 17B FewStep Ref2VA v0.1: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-17B-FewStep-Ref2VA-v0.1
- Script de conversion a ComfyUI: https://github.com/fuyi25/MiniMax-H3-Tiny/blob/main/scripts/convert_comfyui.py
- Incidencias del proyecto: https://github.com/fuyi25/MiniMax-H3-Tiny/issues
