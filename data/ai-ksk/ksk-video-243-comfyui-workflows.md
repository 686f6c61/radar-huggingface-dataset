# AI-KSK/ksk-video-243-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-243-comfyui-workflows` no es un modelo de pesos, sino un repositorio de flujos de trabajo (workflows) para ComfyUI orientados a la generación de vídeo con LTX 2.3. El autor, AI-KSK, publica un grafo de 35 nodos construido alrededor del nodo "LTX director", que unifica imágenes, texto y audio en una única línea de tiempo (timeline), sustituyendo lo que antes requería cinco flujos separados de LTX 2.3. El repositorio incluye además el LoRA `OmniNFT-comfyui.safetensors`, pensado para mejorar la sincronización audio-vídeo.

El paquete referencia tres artefactos externos que no se distribuyen aquí: el checkpoint `ltx-2.3-22b-dev-dare-ties-distilled-1.1`, el codificador de texto `gemma_3_12B_it_fp8_e4m3fn` y la proyección `ltx-2.3_text_projection_bf16`. El tamaño del repositorio es de 0.0 GB, lo que confirma que solo contiene el JSON del grafo y documentación, no pesos.

La relevancia de esta publicación es práctica: reduce la fragmentación de pipelines de vídeo en ComfyUI a un único grafo con timeline compartida, lo que simplifica la orquestación de renders en los que intervienen imagen, texto y audio de forma simultánea. No hay pipeline declarado, cero descargas y cero likes en el momento de la consulta, y la licencia es "other" sin texto disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de workflows ComfyUI; el modelo subyacente es LTX 2.3, arquitectura no detallada en la información) |
| Parametros totales | no disponible (el checkpoint referenciado se etiqueta "22b", 22 mil millones, pero no se confirma en la información) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (se menciona un codificador de texto en fp8 e4m3fn) |
| Idiomas soportados | en (inglés) |
| Licencia | other (texto de licencia no disponible) |
| Formato de pesos | no disponible (el repositorio contiene JSON de workflow y un LoRA en safetensors: `OmniNFT-comfyui.safetensors`) |

## Arquitectura y entrenamiento

El repositorio no documenta arquitectura de modelo ni proceso de entrenamiento. Lo que describe es un grafo de ComfyUI de 35 nodos articulado en torno al nodo LTX director, que permite colocar imágenes, texto y audio sobre una misma timeline. El flujo incorpora un pase de upsampling latente mediante `LTXVLatentUpsampler` con factor 2x, de modo que se puede renderizar a 2K y escalar después. También integra el LoRA OmniNFT para reforzar la sincronización entre audio y vídeo.

Los componentes de modelo referenciados son el checkpoint destilado `ltx-2.3-22b-dev-dare-ties-distilled-1.1` (el sufijo dare-ties sugiere una fusión de pesos mediante DARE-TIES, aunque esto no se confirma en la información), el codificador de texto `gemma_3_12B_it_fp8_e4m3fn` y la proyección `ltx-2.3_text_projection_bf16`. No se indican tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de vídeo condicionada por imagen, texto y audio dentro de una única timeline.
- Renderizado audio-driven mediante un toggle de audio personalizado.
- Sincronización audio-vídeo reforzada por el LoRA OmniNFT.
- Upsampling latente 2x para salida a 2K.
- Composición multi-etapa (el autor menciona una "3-stage path" en pulido).
- Integración con el ecosistema ComfyUI y los nodos personalizados LTXV.
- Idioma de trabajo: inglés.

## Casos de uso

- Prototipado rápido de vídeo con audio sincronizado: el grafo unifica las tres modalidades en una timeline, lo que evita mantener cinco flujos LTX 2.3 separados y acelera la iteración sobre una misma escena.
- Render de clips cortos para redes sociales: el autor sitúa el rango cómodo en 20-25 s por generación, adecuado para piezas breves con audio incorporado.
- Doblaje o sustitución de audio sobre vídeo existente: el toggle de audio personalizado permite renders guiados por audio, útil para re-sincronizar una locución sobre material ya generado.
- Digital-human y avatares parlantes: el README indica que las etapas tardías con audio requieren enmascaramiento latente, como en los grafos de digital-human, lo que encaja con este tipo de producción.
- Flujos de posproducción con escalado: el pase `LTXVLatentUpsampler` 2x permite trabajar a resolución base y entregar a 2K sin rehacer el grafo.
- Base para pipelines internos de estudio: al ser un JSON importable, se puede versionar y adaptar como plantilla de equipo para producciones con imagen, texto y audio combinados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible. El checkpoint referenciado se etiqueta "22b", lo que sugiere requisitos propios de un modelo de gran tamaño, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Despliegue: ComfyUI con el nodo LTX director y los nodos personalizados LTXV; importación del JSON del grafo.
- Latencia: el autor indica 20-25 s por generación como rango cómodo, sin especificar hardware.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AI-KSK/ksk-video-243-comfyui-workflows | Workflow ComfyUI para LTX 2.3 | no disponible | no disponible | other | Hugging Face (0 descargas) |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre flujos o modelos comparables en la documentación proporcionada.

## Limitaciones y advertencias

- No es un pipeline terminado: el propio autor indica que sigue puliendo la ruta de 3 etapas.
- El audio en etapas tardías requiere enmascaramiento latente, como en los grafos de digital-human; sin ello, la sincronización puede degradarse.
- El rango de 20-25 s por generación es el cómodo; superarlo puede comprometer la calidad o la estabilidad.
- El repositorio no contiene pesos: depende de checkpoints, codificadores y proyecciones externos que el usuario debe obtener por su cuenta.
- Licencia "other" sin texto disponible: verificar términos antes de cualquier uso comercial.
- Idioma declarado únicamente inglés.
- Cero descargas y cero likes: ausencia de validación comunitaria y de evidencia de robustez en producción.
- No hay benchmarks ni métricas de calidad publicadas.
- Riesgo de alucinación visual y artefactos propios de modelos de vídeo generativo; no se documentan sesgos conocidos.

## Enlaces

- Hugging Face: https://huggingface.co/AI-KSK/ksk-video-243-comfyui-workflows
- RunningHub - LTX director node: https://www.runninghub.ai/post/2056305995550388226/?inviteCode=rh-v1111
- YouTube: https://www.youtube.com/watch?v=4-W-j7KNLTA
- Bilibili: https://www.bilibili.com/video/BV1FhLz6JEgJ
