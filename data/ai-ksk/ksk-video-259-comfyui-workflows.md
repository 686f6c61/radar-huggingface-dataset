# AI-KSK/ksk-video-259-comfyui-workflows

## Resumen

AI-KSK/ksk-video-259-comfyui-workflows no es un modelo de pesos en sentido estricto, sino un repositorio de flujos de trabajo (workflows) para ComfyUI publicados por el usuario AI-KSK. El repositorio contiene tres grafos orientados a la edición y regeneración de imágenes: una ruta de "wash" guiada por prompt JSON, una ruta latente de image-to-image con desruido por sigma dividido y un grafo de upscale de 8 pasos basado en Flux2. Los grafos se construyen sobre los modelos `ideogram4_fp8_scaled` y `flux2_distilled_8step_fp8mixed`, con nodos auxiliares de recaption mediante Gemma 4 a través de `llama_cpp` y parseo de JSON con Qwen3-VL.

El repositorio tiene un tamaño de 0.0 GB y no incluye pesos de modelo: solo documentación y definiciones de grafo. Está etiquetado como pipeline `image-to-image` y su licencia es "other", lo que obliga a revisar los términos del autor antes de cualquier uso. El idioma declarado es inglés y el repositorio no registra descargas ni likes en el momento de la consulta.

Su relevancia es práctica: documenta una técnica concreta de reconstrucción estructurada de imágenes mediante prompts JSON y una ruta latente con control de desruido, además de advertir de que el upscale por teselado nativo de Ideogram 4 falla y debe sustituirse por el grafo Flux2. Es material de referencia para quienes integran Ideogram 4 y Flux2 en ComfyUI, no un modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de workflows ComfyUI, no de pesos) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 y NVFP4 (opciones indicadas en los grafos) |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | no disponible (el repo no contiene pesos; los grafos referencian `ideogram4_fp8_scaled` y `flux2_distilled_8step_fp8mixed`) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, por lo que no hay arquitectura de red ni proceso de entrenamiento que describir. El repositorio empaqueta tres grafos de ComfyUI: un grafo de wash de 57 nodos y un grafo latente de 61 nodos sobre `ideogram4_fp8_scaled`, con variantes de condicionamiento incondicional en FP8 y NVFP4, y un grafo de upscale de 20 nodos con `flux2_distilled_8step_fp8mixed`. La cadena de recaption se apoya en Gemma 4 mediante nodos `llama_cpp`, y el parseo del JSON lo realiza Qwen3-VL.

La innovación técnica documentada es el uso combinado de una ruta de regeneración guiada por prompt JSON y una ruta latente de image-to-image con desruido por sigma dividido, fijando el denoise en 0.85 para la ruta latente (un valor de 1.0 implica que no se usa la imagen de origen). No se proporcionan datos sobre tokens de entrenamiento, composición del dataset ni técnicas de alineación como RLHF o DPO, porque el repositorio no entrena ningún modelo.

## Capacidades

- Reconstrucción de imágenes guiada por prompt JSON ("JSON wash route") sobre Ideogram 4.
- Image-to-image latente con control de desruido por sigma dividido.
- Upscale de 8 pasos mediante el grafo Flux2.
- Recaption automático de imágenes con Gemma 4 a través de nodos `llama_cpp`.
- Parseo estructurado de JSON con Qwen3-VL para alimentar la ruta de wash.
- Soporte de condicionamiento incondicional en FP8 y NVFP4.
- Integración nativa en ComfyUI como grafos importables.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode.

## Casos de uso

- Reconstrucción estructurada de imágenes: importar el grafo de wash (57 nodos) para regenerar una imagen a partir de un prompt JSON parseado por Qwen3-VL, útil cuando se necesita control semántico explícito sobre los elementos de la escena.
- Edición controlada con preservación de la fuente: usar el grafo latente (61 nodos) con denoise 0.85 para modificar una imagen manteniendo su estructura, evitando el valor 1.0 que descarta la referencia original.
- Restauración y ampliación de resolución: aplicar el grafo Flux2 de 8 pasos y 20 nodos para upscale, en lugar del teselado nativo de Ideogram 4, que según el autor falla.
- Generación de captions para pipelines de datos: emplear la cadena Gemma 4 + `llama_cpp` para recaptionar imágenes antes de pasarlas por la ruta de wash.
- Prototipado de flujos image-to-image en ComfyUI: servir como plantilla de referencia para combinar Ideogram 4, Flux2, Gemma 4 y Qwen3-VL en un mismo grafo.
- Evaluación de cuantizaciones: comparar las variantes FP8 y NVFP4 del condicionamiento incondicional dentro del mismo grafo para medir su impacto en la salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. Depende de los modelos referenciados (`ideogram4_fp8_scaled`, `flux2_distilled_8step_fp8mixed`, Gemma 4 y Qwen3-VL), no del repositorio en sí.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; las variantes FP8 y NVFP4 sugieren orientación a GPUs con soporte de precisión reducida, pero no se confirma.
- Opciones de despliegue: ComfyUI (importación de los grafos); nodos `llama_cpp` para la cadena de recaption.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. El repositorio no es un modelo con parámetros ni contexto comparables; su equivalente serían otros repositorios de workflows ComfyUI, de los que no se aporta información en la documentación consultada.

## Limitaciones y advertencias

- No contiene pesos de modelo: el tamaño del repo es 0.0 GB y solo incluye documentación y definiciones de grafo.
- La calidad del recaption marca el techo del resultado; el autor señala que Gemma 4 es más débil que GPT-5.5 o Gemini en esta tarea.
- El valor de denoise no es directamente comparable con los de SD1.5, lo que complica trasladar recetas conocidas.
- El upscale por teselado propio de Ideogram 4 falla según el autor; hay que usar el grafo Flux2.
- Licencia "other": es imprescindible revisar los términos del autor y de los modelos subyacentes antes de un uso comercial.
- Idioma declarado únicamente inglés.
- Sin descargas ni likes registrados: no hay evidencia de validación por parte de la comunidad.
- Dependencia de modelos de terceros (Ideogram 4, Flux2, Gemma 4, Qwen3-VL) con sus propias licencias y requisitos.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-259-comfyui-workflows
- RunningHub (ideogram wash / structured JSON rebuild): https://www.runninghub.ai/post/2064321335798620162/?inviteCode=rh-v1111
- RunningHub (latent reference reconstruction): https://www.runninghub.ai/post/2064321322360074241/?inviteCode=rh-v1111
- RunningHub (flux2 image restoration): https://www.runninghub.ai/post/2064329697353359361/?inviteCode=rh-v1111
- YouTube: https://www.youtube.com/watch?v=mXvuJmYWM5E
- Bilibili: https://www.bilibili.com/video/BV1RtEQ6SEsS
