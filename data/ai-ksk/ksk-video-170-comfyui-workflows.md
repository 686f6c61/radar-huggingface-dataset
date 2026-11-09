# AI-KSK/ksk-video-170-comfyui-workflows

## Resumen

Este repositorio de Hugging Face (`AI-KSK/ksk-video-170-comfyui-workflows`) no contiene pesos de modelo ni un modelo entrenado, sino un tutorial en ingles, junto con una tabla de parametros extraida del workflow JSON, sobre edicion de imagenes con Qwen-Image-Edit 2511 en ComfyUI. El autor, AI-KSK, publica el material didactico de un episodio en video (YouTube y Bilibili) y enlaza los grafos funcionales a la plataforma RunningHub, de modo que el JSON real del workflow no se distribuye en el repositorio.

La tecnica que documenta resuelve un problema concreto de la edicion de imagenes de alta resolucion con modelos de difusion: repintar una region pequena sin reescalar toda la imagen. El grafo recorta un bloque cuadrado con padding alrededor de la mascara, repinta solo ese recorte (opcionalmente con una imagen de referencia para transferir objetos) y vuelve a pegar el resultado a resolucion completa usando la informacion de padding almacenada. El repositorio ocupa 0,0 GB y no incluye ni JSON, ni pesos, ni portadas.

Es relevante ahora porque ejemplifica el flujo de trabajo practico en torno a Qwen-Image-Edit 2511, un modelo de edicion de imagenes basado en difusion con un UNet de precisión mixta fp8 y un codificador de texto Qwen 2.5 VL 7B, acelerado a 4 pasos mediante un LoRA Lightning. La ficha que sigue describe, por tanto, el contenido del repositorio y las especificaciones del pipeline que documenta, no las de un modelo alojado en el propio repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio es un tutorial; el pipeline documentado usa un UNet de difusion Qwen-Image-Edit 2511 con codificador de texto Qwen 2.5 VL 7B y VAE Qwen-Image) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (modelo de difusion de imagenes, sin ventana de contexto textual) |
| Tipos de cuantizacion | fp8mixed y bf16 en los loaders de UNET; fp8_scaled en el CLIP |
| Idiomas soportados | en (tutorial y interfaz; el prompt de edicion puede escribirse en otros idiomas, no verificado) |
| Licencia | other |
| Formato de pesos | safetensors (referenciados por el workflow: `qwen_image_edit_2511_fp8mixed.safetensors`, `qwen_image_edit_2511_bf16.safetensors`, `qwen_2.5_vl_7b_fp8_scaled.safetensors`, `qwen_image_vae.safetensors`, `Qwen-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors`, `Qwen-edit-2511-multiple-angles.safetensors`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el entrenamiento del modelo Qwen-Image-Edit 2511 en la documentacion proporcionada: no se indican tokens de entrenamiento, composicion del dataset ni uso de RLHF/DPO. Lo que describe el repositorio es la topologia del grafo de ComfyUI, no la del modelo. El workflow de 54 nodos (variante "万物迁移", transferencia de objetos) usa el UNET en fp8mixed, mientras que el de 55 nodos (repintado local) usa el UNET en bf16 y anade un LoRA de angulos multiples. Ambos comparten el CLIP loader Qwen 2.5 VL 7B en fp8_scaled, el VAE Qwen-Image y un KSampler configurado a 4 pasos, cfg 1, sampler euler, scheduler sgm_uniform y denoise 1, con el LoRA `Qwen-Edit-2511-Lightning-4steps-V1.0-bf16` aplicado a escala 1.

La innovacion tecnica documentada no esta en el modelo sino en el flujo: recorte con padding de la region enmascarada, repintado del recorte aislado (con imagen de referencia opcional para transferencia de objetos) y pegado de vuelta a resolucion completa mediante la informacion de padding guardada. Se recomienda mantener el lado mas largo en 2048 y el acelerador de 4 pasos activado. El grafo depende de un plugin de nodos de terceros; segun el propio autor, la ruta nativa de ComfyUI no funciona sin el.

## Capacidades

- Edicion de imagenes por mascara (inpainting) sobre regiones locales de imagenes de alta resolucion, sin reescalar la imagen completa.
- Transferencia de objetos desde una imagen de referencia a la region enmascarada ("everything transfer").
- Repintado por recorte con padding y pegado de vuelta automatizado, reutilizable como paso del grafo.
- Generacion de variaciones de angulo mediante el LoRA `Qwen-edit-2511-multiple-angles` en la variante de 55 nodos.
- Inferencia acelerada a 4 pasos con el LoRA Lightning, cfg 1.
- Control por prompt de texto en la region repintada (codificador Qwen 2.5 VL 7B).
- Soporte de resoluciones de hasta 2048 en el lado mas largo (con la salvedad del cuadrado 2048x2048, que el autor senala como caso problematico).
- No se documentan tool calling, agentes, modo thinking, audio ni capacidades multimodales mas alla de la edicion de imagen.

## Casos de uso

- Retoque de producto en fotografia de alta resolucion: enmascarar un objeto (por ejemplo, una etiqueta o un accesorio) y repintarlo solo en ese recorte, conservando el detalle del resto de la imagen a resolucion completa gracias al pegado con padding.
- Transferencia de objetos entre imagenes: usar la variante de 54 nodos con imagen de referencia para insertar un objeto de otra fotografia en la region enmascarada, util en catalogos y composiciones de e-commerce.
- Limpieza de fondos y eliminacion de elementos: pintar la mascara sobre el elemento no deseado y repintar el recorte, evitando el reescalado global que degrada texturas finas.
- Generacion de vistas alternativas de un mismo objeto: aplicar el LoRA de angulos multiples para producir variaciones de perspectiva de un producto a partir de una edicion localizada.
- Prototipado rapido de pipelines de edicion en ComfyUI: el grafo sirve como plantilla reproducible (4 pasos, cfg 1) para equipos que quieran montar un flujo de inpainting con pegado automatico.
- Produccion de material grafico para video: el tutorial forma parte de una serie de episodios ("video-170") orientada a creadores que necesitan editar fotogramas o imagenes de alta resolucion con recursos de GPU limitados, gracias a la aceleracion a 4 pasos.
- Evaluacion de la dependencia de plugins de terceros: util para decidir si conviene adoptar la ruta nativa de ComfyUI o el plugin externo antes de integrar el flujo en un pipeline propio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor califica Qwen-Image-Edit 2511 como "el modelo de edicion open source mas potente", pero el propio documento aclara que se trata de una opinion, no de una comparacion medida.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio no publica cifras; el uso de UNET en fp8mixed y CLIP en fp8_scaled sugiere que el autor busca reducir el consumo de memoria, pero no se confirma ningun valor.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos sobre si cabe en RTX 4090 u otras tarjetas consumer.
- Opciones de despliegue: ComfyUI (con un plugin de nodos de terceros, obligatorio segun el autor) o la plataforma RunningHub, donde se alojan los grafos enlazados.
- Latencia y throughput: no disponible; solo se indica que el sampler esta configurado a 4 pasos con cfg 1 y el LoRA Lightning activado, lo que reduce el coste frente a un muestreo de muchos pasos, pero sin cifras publicadas.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de otros modelos de edicion de imagenes (parametros, contexto, rendimiento o licencia) que permitan una comparacion rigurosa. El unico material comparativo es la afirmacion subjetiva del autor sobre Qwen-Image-Edit 2511, que el propio documento descarta como medida.

## Limitaciones y advertencias

- El repositorio no contiene el workflow JSON ni los pesos: solo el README y la tabla de parametros; el grafo funcional esta en la pagina de RunningHub y en la publicacion del episodio.
- Dependencia de un plugin de nodos de terceros: sin el, la ruta nativa de ComfyUI no funciona, segun el propio autor.
- El caso cuadrado de 2048x2048 se senala explicitamente como el que no se sostiene.
- Las costuras del pegado dependen del recorte con padding: mover o redimensionar el bloque despues rompe la alineacion.
- La licencia es "other": no se especifican condiciones de uso comercial ni de redistribucion, por lo que debe verificarse antes de usos en produccion.
- El tutorial esta en ingles y el repositorio declara solo el idioma en; no se documenta soporte multilingue verificado.
- Riesgo de sesgos y alucinacion visual: no documentado en la informacion disponible para este pipeline.
- La afirmacion de "mejor modelo de edicion open source" es una opinion del autor, no un resultado medido.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-170-comfyui-workflows
- RunningHub - 重绘贴回 2511局部重绘 万物迁移: https://www.runninghub.ai/post/2017885601479004162/?inviteCode=rh-v1111
- RunningHub - 重绘贴回 2511局部重绘: https://www.runninghub.ai/post/2018213964676603905/?inviteCode=rh-v1111
- Tutorial en YouTube: https://www.youtube.com/watch?v=nlkrfEaScM0
- Original en Bilibili: https://www.bilibili.com/video/BV1SK68BwE33
