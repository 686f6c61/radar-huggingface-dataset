# Comfy-Org/Bernini-R

## Resumen

Bernini-R es un modelo de difusion para generacion y edicion de video texto-a-video, desarrollado originalmente por ByteDance y redistribuido por Comfy-Org como un paquete de pesos en formato single-file para su uso directo en ComfyUI. El repositorio de Comfy-Org no contiene el modelo original, sino una reempaquetado de los pesos de `ByteDance/Bernini-R` en variantes fp16, fp8_scaled, int8_convrot y mxfp8, tanto para el componente de alto ruido como para el de bajo ruido, ademas de una variante ligera de 1.3B parametros basada en la arquitectura Wan 2.1.

El modelo se apoya en la familia Wan 2.2, como indican los nombres de fichero (`wan2.2_bernini_r_high_noise_*` y `wan2.2_bernini_r_low_noise_*`), lo que sugiere una arquitectura de difusion de video con dos etapas de ruido y un transformer de difusion como columna vertebral. La licencia Apache 2.0 facilita su adopcion comercial, y su integracion en ComfyUI mediante workflows predefinidos de edicion de video y de imagen lo convierte en una opcion practica para pipelines creativos.

El repositorio acumula 68.935 descargas y 81 likes, con un tamano total de 150,1 GB, lo que refleja un modelo pesado orientado a produccion de video de alta fidelidad. La informacion publica disponible no detalla la longitud de contexto, los idiomas soportados ni los resultados de benchmarks, por lo que varios apartados de esta ficha se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Difusion texto-a-video basada en Wan 2.2 (dos etapas de ruido, high/low noise); variante ligera basada en Wan 2.1 |
| Parametros totales | no disponible (variante ligera: 1.3B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp16, fp8_scaled, int8_convrot, mxfp8 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (single-file para ComfyUI) |

## Arquitectura y entrenamiento

La informacion disponible no describe en detalle la arquitectura interna ni el proceso de entrenamiento. Los nombres de los ficheros indican que Bernini-R se construye sobre la familia Wan 2.2 con un esquema de dos modelos de ruido (high noise y low noise), un patron habitual en modelos de difusion de video que separan la generacion de estructura global y el refinado de detalle. Tambien se incluye una variante `wan2.1_bernini_1.3B_fp16` de menor tamano, probablemente destinada a prototipado o a hardware mas modesto.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas como decodificacion especulativa o atencion lineal. El repositorio de Comfy-Org es exclusivamente un reempaquetado de pesos para ComfyUI; la model card original de ByteDance no se ha incluido en la informacion proporcionada.

## Capacidades

- Generacion de video a partir de texto (text-to-video) mediante difusion.
- Edicion de video guiada por prompt, con workflow especifico (`video_bernini_r_video_editing.json`).
- Edicion de imagen guiada por prompt, con workflow especifico (`video_bernini_r_image_editing.json`).
- Soporte de dos etapas de ruido (high noise / low noise) para mejorar la coherencia temporal y el detalle.
- Multiples precisiones (fp16, fp8_scaled, int8_convrot, mxfp8) para adaptarse a distintos presupuestos de VRAM.
- Integracion nativa con ComfyUI mediante ficheros single-file en `models/diffusion_models/`.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso ni modo thinking, al tratarse de un modelo generativo de difusion y no de un LLM.

## Casos de uso

- Edicion de video en postproduccion: el workflow `video_bernini_r_video_editing.json` permite modificar un clip existente mediante prompt, util para retoques de vestuario, entorno o estilo sin regrabar.
- Edicion de imagen en flujos creativos: el workflow `video_bernini_r_image_editing.json` permite transformar imagenes (por ejemplo, cambios de estilo o de elementos) dentro de ComfyUI, con pares antes/despues documentados.
- Generacion de clips para redes sociales: la variante de 1.3B en fp16 permite iterar rapidamente en GPUs de consumo antes de pasar a la variante completa de alta fidelidad.
- Prototipado de anuncios y storyboards: la licencia Apache 2.0 y la integracion en ComfyUI facilitan generar variantes de video para revision creativa sin coste de licencia.
- Previsualizacion de VFX en produccion audiovisual: el modelo puede generar plates o referencias animadas para equipos de efectos antes del render final.
- Investigacion en difusion de video: la disponibilidad de pesos en fp16, fp8, int8 y mxfp8 permite estudiar el impacto de la cuantizacion en la calidad de generacion y edicion.
- Automatizacion de contenido en pipelines ComfyUI: al ser single-file, se puede orquestar mediante la API de ComfyUI para generar lotes de clips o ediciones de forma programatica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. El repositorio ocupa 150,1 GB e incluye variantes fp16, fp8_scaled, int8_convrot y mxfp8, lo que sugiere que la variante fp16 completa requiere GPUs de datacenter o workstations de gama alta, mientras que las variantes fp8/int8/mxfp8 reducen el requisito.
- La variante `wan2.1_bernini_1.3B_fp16.safetensors` es la mas ligera y la mas probable para GPUs de consumo, aunque no se especifica la VRAM exacta.
- GPU recomendadas: no disponible. Por el tamano del modelo, se espera que las variantes completas requieran A100, H100 o RTX 4090/5090 con 24 GB o mas; las variantes cuantizadas podrian caber en GPUs de 16-24 GB.
- Opciones de despliegue: ComfyUI (soporte nativo mediante `models/diffusion_models/`). No se documenta soporte oficial de vLLM, llama.cpp, Ollama ni TGI, que no aplican a modelos de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Bernini-R (Comfy-Org) | no disponible (variante 1.3B) | no disponible | Apache 2.0 | Hugging Face, ComfyUI | Difusion texto-a-video con edicion de video e imagen |
| Wan 2.1 / Wan 2.2 (ByteDance) | no disponible en la informacion | no disponible | no disponible en la informacion | Hugging Face | Familia base sobre la que se construye Bernini-R |
| Alternativas texto-a-video | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la informacion proporcionada |

## Limitaciones y advertencias

- No se dispone de informacion sobre sesgos conocidos del modelo.
- Riesgo de alucinacion visual: como todo modelo generativo de difusion, puede producir contenido incoherente o no fiel al prompt, especialmente en escenas complejas o con muchos objetos.
- No se documentan limitaciones de contexto ni de idioma; los idiomas soportados figuran como no disponibles.
- El repositorio de Comfy-Org es un reempaquetado; la calidad y el comportamiento dependen del modelo original `ByteDance/Bernini-R`.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base original de ByteDance antes de desplegarlo en produccion.
- El tamano del repositorio (150,1 GB) implica requisitos de almacenamiento y ancho de banda considerables para su descarga y despliegue.
- No se han publicado benchmarks ni metricas de latencia, por lo que no es posible garantizar un rendimiento concreto en produccion.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Comfy-Org/Bernini-R
- Modelo base original: https://huggingface.co/ByteDance/Bernini-R
- ComfyUI (GitHub): https://github.com/Comfy-Org/ComfyUI
- Workflow de edicion de video: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_bernini_r_video_editing.json
- Workflow de edicion de imagen: https://github.com/Comfy-Org/workflow_templates/blob/main/templates/video_bernini_r_image_editing.json
