# AI-KSK/ksk-video-255-comfyui-workflows

## Resumen

AI-KSK/ksk-video-255-comfyui-workflows no es un modelo de pesos en el sentido estricto, sino un repositorio de flujos de trabajo (workflows) para ComfyUI orientados a generacion de video y edicion de imagen. El autor, AI-KSK, lo publica como un kit tutorial que empaqueta nueve grafos de ComfyUI junto con referencias a modelos concretos: `ltx-2.3-22b-dev-dare-ties-distilled-1.1` para generacion de video con control de identidad (likeness) y `flux2_distilled_8step_fp8mixed` para edicion de imagen destilada en 8 pasos.

El kit se centra en el control de identidad por etapas (staged likeness control) sobre LTX2.3, distribuido en tres pasadas mediante los nodos `LTXLikenessGuide`, `LTXLikenessAnchor` y `LTXLatentAnchorAware`, y en una variante de FLUX.2 Dev destilada a 8 pasos en fp8 mixto que incorpora `mistral_3_small_flux2_fp8` como codificador de texto y `flux2-vae`. La version 3.1 elimina el grupo de limpieza de subtitulos en 2.5 etapas, que segun el autor degradaba la salida cuando se ejecutaba en linea.

Es relevante ahora porque documenta un pipeline practico de digital human y text-to-video con modelos de la familia LTX 2.3 (22B, variante dev destilada) y FLUX.2, dos lineas de modelos generativos recientes, y porque expone decisiones de ingenieria concretas (fps fijado a 24, ventana de audio recortada, edicion a 4 MP en imagen unica) que sirven como referencia de despliegue en produccion con ComfyUI.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio contiene flujos de ComfyUI, no pesos propios; referencia LTX2.3 y FLUX.2) |
| Parametros totales | no disponible para el repositorio; el modelo referenciado LTX2.3 figura como 22B en el nombre (`ltx-2.3-22b-dev-dare-ties-distilled-1.1`) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp8 mixto (`flux2_distilled_8step_fp8mixed`, `mistral_3_small_flux2_fp8`); otras no disponibles |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | no disponible (el repositorio no contiene pesos; tamano del repo 0.0 GB) |

## Arquitectura y entrenamiento

El repositorio no incluye pesos ni detalla el entrenamiento de los modelos subyacentes. Lo que describe es la orquestacion de dos pipelines. El primero se apoya en `ltx-2.3-22b-dev-dare-ties-distilled-1.1`, una variante destilada de LTX 2.3 de 22B parametros cuyo sufijo "dare-ties" sugiere una fusion de pesos mediante DARE-TIES, y aplica control de identidad en tres pasadas con los nodos `LTXLikenessGuide`, `LTXLikenessAnchor` y `LTXLatentAnchorAware`. El segundo emplea `flux2_distilled_8step_fp8mixed`, una destilacion de FLUX.2 Dev a 8 pasos en precision fp8 mixta, con `mistral_3_small_flux2_fp8` como codificador de texto y `flux2-vae` como VAE.

La innovacion tecnica documentada es de caracter practico: la separacion del flujo de eliminacion de subtitulos (de-subtitle) en un grafo independiente, porque su ejecucion en linea dentro del flujo principal degradaba la calidad de salida. No se especifican volumen de tokens de entrenamiento, composicion del dataset ni si hubo RLHF o DPO para ninguno de los modelos referenciados.

## Capacidades

- Generacion de video texto-a-video (T2V) mediante el grafo "T2V 3.1".
- Generacion de digital human (avatar parlante) a partir de audio, con ventana de audio recortable y fps fijado a 24.
- Generacion condicionada por imagen y texto (image+text) y por multiples imagenes (multi-image).
- Extension de video (video extension 3.0) para alargar clips existentes.
- Retalking 3.0, para resintetizar el habla de un sujeto sobre video existente.
- Edicion de imagen con FLUX.2 destilado (IC Edit), incluido un flujo especifico de eliminacion de marca de agua (de-watermark).
- Control de identidad (likeness) por etapas sobre LTX2.3, con anclajes de guia y de latentes.
- Direccion de storyboard mediante un grafo "director" para composicion de secuencias.
- Destilacion de timesteps de FLUX.2 (flujo "flux2 timestep distillation").
- No se documentan capacidades de tool calling, function calling, agentes ni razonamiento multi-paso; el kit es exclusivamente generativo visual.

## Casos de uso

- Digital human para video corporativo: el grafo de single digital human genera un avatar parlante sincronizado a partir de un clip de audio, recortando la ventana de audio y manteniendo 24 fps para evitar desincronizacion, lo que encaja en produccion de piezas de formacion o comunicacion interna.
- Doblaje y resintesis de voz sobre metraje existente: el flujo retalking 3.0 permite sustituir el habla de un sujeto en un video ya rodado conservando el movimiento, util para localizacion de contenido sin regrabar.
- Prototipado rapido de anuncios en text-to-video: el grafo T2V 3.1 permite iterar conceptos visuales sin rodaje, con la ventaja de que el control de identidad se puede activar despues si se fija un personaje.
- Storyboarding automatizado: el grafo director organiza secuencias multi-plano, adecuado para previsualizacion de guiones antes de produccion real.
- Extension de clips para redes sociales: el flujo video extension 3.0 alarga tomas cortas hasta la duracion necesaria para formatos verticales u horizontales sin rehacer la grabacion.
- Edicion de imagen a 4 MP en imagen unica: el flujo FLUX.2 destilado en 8 pasos permite retoques y edicion instruccional de fotografias a resolucion de 4 megapixeles en una sola pasada, con menor coste computacional que un modelo no destilado.
- Limpieza de material con marca de agua o subtitulos incrustados: el flujo de de-watermark y el de de-subtitle separado permiten preparar material de archivo antes de reutilizarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. Como referencia, el modelo LTX2.3 referenciado es de 22B parametros y FLUX.2 se distribuye en fp8 mixto, lo que situa el despliegue fuera del rango de GPUs de consumo con poca memoria, pero no se aportan cifras verificadas.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se confirma que quepa en RTX 4090 ni en modelos inferiores.
- Opciones de despliegue: ComfyUI como entorno principal (los nueve grafos se importan directamente). No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de pipeline generativo visual.
- Latencia y throughput: no disponible. El unico parametro de rendimiento documentado es el fps de salida en digital human, fijado a 24.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-KSK/ksk-video-255-comfyui-workflows | no disponible (referencia LTX2.3 22B) | no disponible | Workflows ComfyUI para video e imagen | other | Hugging Face, repo de 0.0 GB |
| LTX2.3 (`ltx-2.3-22b-dev-dare-ties-distilled-1.1`) | 22B (segun nombre) | no disponible | Video generativo con likeness | no disponible | Referenciado en el kit |
| FLUX.2 Dev (`flux2_distilled_8step_fp8mixed`) | no disponible | no disponible | Edicion y generacion de imagen | no disponible | Referenciado en el kit |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos alternativos en la informacion proporcionada, por lo que la comparacion cuantitativa no es posible.

## Limitaciones y advertencias

- El flujo de eliminacion de subtitulos se ha separado del principal porque en linea degradaba la salida; usarlo integrado produce peor calidad.
- Los nodos de likeness no tienen efecto en text-to-video puro: requieren una referencia de identidad para funcionar.
- La edicion multi-imagen con FLUX.2 pierde consistencia de identidad; el propio autor recomienda limitarse a imagen unica a 4 MP.
- El repositorio no contiene pesos (tamano 0.0 GB): es un conjunto de grafos y documentacion, y depende de modelos alojados aparte.
- Licencia "other": no se especifican los terminos exactos, por lo que el uso comercial requiere revisar la licencia original de cada modelo referenciado (LTX2.3 y FLUX.2) antes de desplegar.
- Idioma documentado: solo ingles.
- Riesgo de alucinacion y sesgos: no documentados en la informacion disponible, aunque son inherentes a los modelos generativos subyacentes.
- Sin descargas ni likes en el momento de la consulta, y creado y actualizado el mismo dia (2026-11-09): no hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-255-comfyui-workflows
- RunningHub - LTX2.3 single digital human 10S: https://www.runninghub.ai/post/2061362758670708737/?inviteCode=rh-v1111
- RunningHub - LTX2.3 image+video 10S: https://www.runninghub.ai/post/2061456734065094658/?inviteCode=rh-v1111
- RunningHub - LTX2.3 text-to-video 3.1: https://www.runninghub.ai/post/2061480014171955202/?inviteCode=rh-v1111
- RunningHub - LTX2.3 multi-image update: https://www.runninghub.ai/post/2061671863138476034/?inviteCode=rh-v1111
- RunningHub - LTX2.3 storyboard director: https://www.runninghub.ai/post/2061524156398788609/?inviteCode=rh-v1111
- RunningHub - flux2 timestep distillation: https://www.runninghub.ai/post/2061782953197391873/?inviteCode=rh-v1111
- RunningHub - video extension 3.0: https://www.runninghub.ai/post/2058327114209910786/?inviteCode=rh-v1111
- RunningHub - retalking 3.0: https://www.runninghub.ai/post/2057730271897800705/?inviteCode=rh-v1111
- RunningHub - IC Edit de-watermark: https://www.runninghub.ai/post/2054546081706463234/?inviteCode=rh-v1111
- YouTube: https://www.youtube.com/watch?v=JflBem1RPZc
- Bilibili: https://www.bilibili.com/video/BV1nVVr6QEd8
