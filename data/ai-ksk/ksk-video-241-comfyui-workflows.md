# AI-KSK/ksk-video-241-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-241-comfyui-workflows` no es un modelo de lenguaje, sino un repositorio de flujos de trabajo (workflows) para ComfyUI construidos sobre el modelo de difusion Anima Base 1.0, orientado a generacion de imagenes de estilo anime. El paquete incluye cuatro grafos en formato JSON: text-to-image con control LLLite y reparacion de caras y manos, image-to-image con la misma cola de postprocesado, un upscale por mosaicos (tiled upscale) y un repintado enmascarado (masked repaint).

El repositorio lo publica el usuario AI-KSK y esta pensado para desplegarse en la plataforma RunningHub o importarse directamente en la carpeta `ComfyUI/user/default/workflows`. Los grafos referencian tres ficheros de pesos concretos: el modelo base `anima_baseV10.safetensors`, el codificador de texto `qwen_3_06b_base.safetensors` y el VAE `qwen_image_vae.safetensors`, ademas de una ruta opcional acelerada mediante el LoRA `anima-turbo-lora-v0.1`.

Su relevancia es practica: empaqueta una cadena completa de generacion y retoque de ilustracion anime en ComfyUI, con control estructural y pasos de correccion de detalle. No obstante, el repositorio en si no contiene pesos (tamano de 0.0 GB) y la licencia figura como `other` sin texto asociado, lo que limita su evaluacion como artefacto listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de difusion subyacente Anima Base 1.0; los grafos usan codificador de texto Qwen 3 0.6B y VAE Qwen Image) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los grafos referencian pesos `.safetensors` sin cuantizar) |
| Idiomas soportados | en (prompts en ingles) |
| Licencia | other (sin texto de licencia publicado en la informacion disponible) |
| Formato de pesos | safetensors (referenciados, no incluidos en el repo); workflows en JSON de ComfyUI |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna de Anima Base 1.0 ni sus datos de entrenamiento, numero de tokens, composicion del dataset o procesos de alineacion (RLHF/DPO). Lo que si se detalla es la composicion del pipeline de inferencia: un modelo base de difusion (`anima_baseV10.safetensors`), un codificador de texto basado en Qwen 3 de 0.6B (`qwen_3_06b_base.safetensors`) y un VAE de la familia Qwen Image (`qwen_image_vae.safetensors`).

El elemento tecnico diferencial es el uso de LLLite como mecanismo de control en los grafos de text-to-image e image-to-image, junto con una cola de postprocesado para reparacion de caras y manos que depende de detectores Ultralytics y modelos SAM. Existe ademas una ruta acelerada mediante el LoRA `anima-turbo-lora-v0.1`, que opera con 8-12 pasos y CFG 1, sacrificando fidelidad de estilo a cambio de velocidad. El grafo de upscale trabaja por mosaicos (cuatro tiles) y el de repintado aplica generacion enmascarada sobre regiones concretas.

## Capacidades

- Generacion text-to-image de ilustracion de estilo anime mediante grafos de ComfyUI.
- Control estructural con LLLite en los flujos de text-to-image e image-to-image.
- Image-to-image con la misma cola de postprocesado que el flujo text-to-image.
- Reparacion automatica de caras y manos mediante deteccion Ultralytics y segmentacion SAM.
- Upscale por mosaicos en cuatro tiles para ampliar resolucion sin reventar memoria.
- Repintado enmascarado (inpainting) de regiones seleccionadas.
- Ruta acelerada opcional con LoRA turbo a 8-12 pasos y CFG 1.
- Nodo de prompt basado en API (`RH_LLMAPI_Pro_Node`), sustituible o eliminable para uso offline.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, audio ni vision mas alla del propio pipeline de imagen.

## Casos de uso

- Generacion de ilustraciones anime por lotes: el grafo text-to-image con LLLite permite fijar la composicion mediante control estructural y producir variaciones consistentes de personaje para un mismo encargo.
- Retoque de ilustraciones existentes: el flujo image-to-image reutiliza la cola de reparacion de caras y manos, util para corregir piezas generadas previamente sin regenerar la imagen completa.
- Preparacion de arte para impresion o fondos de alta resolucion: el upscale por cuatro tiles permite escalar una imagen base manteniendo el detalle en cada region.
- Edicion selectiva de elementos: el grafo de masked repaint sirve para cambiar ropa, expresiones o accesorios sobre una mascara, aunque el autor lo senala como el grafo mas debil del paquete.
- Prototipado rapido en estudio: la ruta con `anima-turbo-lora-v0.1` a 8-12 pasos y CFG 1 reduce el tiempo por iteracion durante la exploracion de conceptos.
- Despliegue en la nube sin infraestructura propia: los cuatro grafos estan publicados como posts de RunningHub, lo que permite ejecutarlos desde navegador sin montar GPU local.
- Integracion en un pipeline de ComfyUI existente: basta con copiar los JSON a `ComfyUI/user/default/workflows` y colocar los pesos en `models/unet`, `models/clip` y `models/vae`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El paquete no publica requisitos de memoria; el uso de upscale por tiles sugiere que el flujo se disena precisamente para contener el consumo de VRAM en resoluciones altas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: ComfyUI local (copiando los JSON a `ComfyUI/user/default/workflows`) o ejecucion en la nube mediante los cuatro posts de RunningHub enlazados por el autor.
- Dependencias adicionales: detectores Ultralytics y modelos SAM para el paso de reparacion de caras y manos.
- Latencia y throughput: no disponible. Solo se indica que la ruta turbo opera con 8-12 pasos y CFG 1, frente a la ruta base sin numero de pasos especificado.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparacion con alternativas de la misma categoria.

## Limitaciones y advertencias

- El repositorio no contiene pesos: solo incluye el README y los grafos JSON, por lo que no es autosuficiente para ejecutarse.
- El grafo de repintado enmascarado es, segun el propio autor, el mas debil del conjunto.
- El LoRA turbo reduce la fidelidad de estilo a cambio de velocidad.
- La reparacion de caras y manos requiere instalar detectores Ultralytics y modelos SAM; sin ellos ese paso falla.
- El nodo de prompt es un nodo de API (`RH_LLMAPI_Pro_Node`) que debe sustituirse o eliminarse para uso offline.
- La licencia figura como `other` sin texto publicado, lo que impide determinar condiciones de uso comercial; conviene verificar los terminos de Anima Base 1.0, del VAE Qwen Image y del codificador Qwen 3 antes de cualquier despliegue productivo.
- Los prompts estan planteados en ingles (`language: en`); no se documenta soporte multilingue.
- No hay informacion sobre sesgos, tasa de alucinacion visual ni calidad medida en benchmarks.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, sin historial de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-241-comfyui-workflows
- RunningHub - Anima Base text-to-image + CN + face/hand fix: https://www.runninghub.ai/post/2055109924421685249/?inviteCode=rh-v1111
- RunningHub - Anima Base image-to-image + CN + face/hand fix: https://www.runninghub.ai/post/2055116648939565057/?inviteCode=rh-v1111
- RunningHub - Anima Base tiled upscale: https://www.runninghub.ai/post/2055118475793838082/?inviteCode=rh-v1111
- RunningHub - Anima Base masked repaint: https://www.runninghub.ai/post/2055109942587215873/?inviteCode=rh-v1111
- Video tutorial en YouTube: https://www.youtube.com/watch?v=FM5dGuTnz8o
- Video tutorial en Bilibili: https://www.bilibili.com/video/BV1ci5q65EGQ
