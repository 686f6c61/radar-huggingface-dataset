# alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0

## Resumen

MiniMax-H3-Fun-Controlnet-Union-2.0 es un adaptador de control de tipo ControlNet-Union publicado por alibaba-pai para el modelo de generación de vídeo MiniMax-H3, dentro del ecosistema de la librería VideoX-Fun. No es un modelo generativo autónomo: es una rama de control que se carga encima del transformer base de MiniMax-H3 y que condiciona la generación de vídeo a partir de una señal de control (bordes, profundidad, pose, etc.) o de una máscara de inpainting.

La versión 2.0 amplía la cobertura de 5 a 8 condiciones de control (Canny, Depth, HED, MLSD, Pose, Scribble, Layout y Gray) y duplica los puntos de inyección: pasa de 5 a 10 bloques de control sobre los 50 bloques del transformer, en las capas 0, 5, 10, ..., 45. El checkpoint contiene únicamente la rama de control (`control_proj_in` más 10 `control_blocks`, unos 13,5 GB) y se distribuye en formato safetensors dentro de un repositorio de 13,6 GB.

Es relevante porque unifica ocho condiciones y el inpainting de vídeo en un solo checkpoint, sin necesidad de cambiar de pesos por condición, y porque emplea una receta de inpainting `post_norm` (siguiendo a Wan 2.1) que mejora la mezcla entre las zonas rellenadas y las conservadas. El modelo viene destilado en guía (`guidance_scale = 1.0`, una pasada por paso, sin classifier-free guidance) y exige una configuración concreta (`minimax_h3_control_inpaint_post_norm.yaml`) para cargarse correctamente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Rama de control tipo ControlNet-Union sobre el transformer de MiniMax-H3 (50 bloques transformer); rama compuesta por `control_proj_in` y 10 `control_blocks` enganchados a las capas 0, 5, 10, 15, 20, 25, 30, 35, 40 y 45 |
| Parametros totales | no disponible (el autor no publica el recuento de parametros); el fichero de pesos de la rama de control ocupa ~13,5 GB y el repositorio completo 13,6 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de los LLM; la generacion esta limitada a 15 segundos a 24 fps, con el numero de fotogramas ajustado al mayor `17 * n + 5` que el VAE de video puede decodificar |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (no se documentan idiomas; el condicionamiento textual se realiza mediante prompts) |
| Licencia | minimax-h3-community-license-agreement (`license: other`), fichero LICENSE.md en el repositorio |
| Formato de pesos | safetensors (MiniMax-H3-Fun-Controlnet-Union-2.0.safetensors) |
| Dimension de entrada de control | `control_in_dim = 49` (latente + latente enmascarado + mascara) |
| Numero de condiciones de control | 8 (Canny, Depth, HED, MLSD, Pose, Scribble, Layout, Gray) mas inpainting de video |
| Guia (guidance) | destilado en guia: `guidance_scale = 1.0`, una pasada hacia delante por paso, sin classifier-free guidance |
| Control de audio | `control_apply_audio = false` |
| Configuracion obligatoria | `minimax_h3_control_inpaint_post_norm.yaml` |

## Arquitectura y entrenamiento

La rama de control se acopla al transformer de MiniMax-H3 mediante saltos con compuerta a cero (zero-gated skip-add): cada salto de control se proyecta y se suma a la rama principal a traves de una proyeccion inicializada a cero, lo que permite cargar el adaptador sobre el modelo base sin degradar su comportamiento inicial. En la version 2.0 la inyeccion se realiza en 10 de los 50 bloques del transformer (capas 0, 5, 10, ..., 45), aproximadamente el doble de puntos que la version 1.0, lo que segun el autor se traduce en un mayor apego estructural al video de control. El parametro `control_context_scale` escala cada salto antes de sumarse: `1.0` aplica el control mas fuerte (valor usado en todos los resultados publicados), valores por debajo de `1.0` lo debilitan y `0.0` desactiva la rama.

La entrada de control se ensancha a 49 canales (latente + latente enmascarado + mascara), de modo que la misma rama sirve tanto para control como para inpainting. La diferencia clave frente a la version 1.0 es la receta `post_norm`: los pixeles enmascarados se ponen a cero despues de la normalizacion ImageNet (los huecos quedan en 0, gris medio, siguiendo a Wan 2.1) en lugar de antes (donde quedaban cerca de -2, oscuros extremos), lo que mejora la mezcla de las regiones rellenadas. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo etapas de RLHF o DPO.

## Capacidades

- Generacion de video condicionada por ocho tipos de control: Canny, Depth, HED, MLSD, Pose (DWPose), Scribble, Layout y Gray.
- Video a video (v2v) con adherencia estructural al video de control en las condiciones anteriores.
- Inpainting de video mediante la receta `post_norm`, con mascara y latente enmascarado como canales de entrada.
- Image-text-to-video y text-to-video a traves del modelo base MiniMax-H3 sobre el que se carga el adaptador.
- Control de layout mediante cajas delimitadoras por sujeto renderizadas como cajas codificadas por color sobre fondo blanco, siguiendo la receta de layout de Wan2.1-VACE.
- Ajuste de la fuerza del control con `control_context_scale` (de `0.0` a `1.0`), sin reentrenar.
- Ajuste automatico de la generacion al video de control: recuento de fotogramas al mayor `17 * n + 5` decodificable, duracion maxima de 15 segundos, relacion de aspecto del video de control con presupuesto de pixeles `height * width` (multiplos de 32) y 24 fps fijos.
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso ni procesamiento de audio (el control de audio esta desactivado explicitamente).

## Casos de uso

- Conversion de bocetos a video: partiendo de un dibujo o garabato (condicion Scribble) se puede generar un video con la estructura del trazo, util para previsualizacion de storyboards en produccion audiovisual.
- Rotoscopia asistida y limpieza de metraje: con la condicion Canny o HED se puede reestilizar o recolorear un plano manteniendo los contornos originales, reduciendo el trabajo manual de mascaras.
- Control de movimiento de personajes: con la condicion Pose (DWPose) extraida de un video de referencia se puede transferir el movimiento a otro sujeto generado, un flujo habitual en publicidad y contenido para redes.
- Composicion 3D y prevision de profundidad: la condicion Depth permite generar video coherente con un mapa de profundidad monocular, integrable en pipelines de VFX donde ya existe una estimacion de profundidad.
- Edicion de plano por layout: con cajas delimitadoras por sujeto (condicion Layout, generada con las herramientas de VACE-Annotators, por ejemplo `vace_preproccess.py --task layout_track`) se puede recomponer la posicion de los sujetos en un plano sin regrabar.
- Inpainting de video para eliminacion de objetos o logos: la rama unificada con `control_in_dim = 49` permite rellenar regiones enmascaradas dentro de un plano manteniendo la coherencia temporal, con la receta `post_norm` para un mezclado mas limpio.
- Estandarizacion de archivo audiovisual: la condicion Gray (luminancia) permite regenerar planos ajustando la iluminacion o el aspecto manteniendo la estructura luminica original, util para remasterizaciones.
- Generacion de video a partir de linea (MLSD) para arquitectura y diseno de interiores: la deteccion de segmentos de linea permite convertir planos tecnicos en recorridos animados conservando la geometria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FVD, PSNR, SSIM, CLIP-score ni similares) ni comparaciones numericas con otros modelos. Los unicos datos de evaluacion publicados son cualitativos: pares de video de control y salida para Canny, Depth, HED y MLSD, generados con `num_inference_steps = 40`, `guidance_scale = 1.0`, `control_context_scale = 1.00`, semilla 43, modo de lienzo `control`, presupuesto de 704x1280 pixeles y 24 fps.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la informacion publicada. Como referencia del propio artefacto, el checkpoint de la rama de control pesa ~13,5 GB (repositorio de 13,6 GB) y debe cargarse ademas el transformer base de MiniMax-H3, de tamano no documentado, mas las activaciones del VAE de video.
- La configuracion de referencia publicada (704x1280 pixeles, 40 pasos, 24 fps) no es viable en GPUs de consumo dentro de los parametros documentados; requiere memoria para la rama de control, el modelo base y los latentes de video de forma simultanea.
- GPU recomendadas: no especificadas por el autor. Por el tamano del checkpoint y la resolucion de referencia, el despliegue realista apunta a aceleradores de datacenter (A100 80 GB, H100) y, en cualquier caso, requiere validacion propia de VRAM porque no hay cifras oficiales.
- Compatibilidad con GPU de consumo: no confirmada; no hay datos publicados sobre cuantizaciones ni sobre ejecucion en RTX 4090 o inferiores con esta version 2.0.
- Opciones de despliegue: la libreria soportada es VideoX-Fun (`library_name: videox_fun`), con scripts de ejemplo como `examples/minimax_h3_fun/predict_v2v_control_inpaint.py` y las configuraciones `minimax_h3_control_inpaint_post_norm.yaml`. No se mencionan vLLM, TGI, llama.cpp, Ollama ni integracion con Diffusers.
- Latencia y throughput: no disponibles. El unico dato relacionado es que el modelo esta destilado en guia y funciona con una sola pasada por paso (`guidance_scale = 1.0`), lo que evita duplicar la computacion por el clasificador libre de guia.
- Almacenamiento: el checkpoint de la rama de control es un unico fichero de ~13,5 GB, por lo que se necesita espacio adicional al del modelo base.

## Comparativa con modelos similares

| Modelo | Condiciones de control | Profundidad de la rama | Receta de inpainting | Tamano del checkpoint | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| MiniMax-H3-Fun-Controlnet-Union-2.0 | 8 (Canny, Depth, HED, MLSD, Pose, Scribble, Layout, Gray) + inpainting | 10 bloques de control (capas 0, 5, ..., 45) | `post_norm` (huecos en 0, gris medio, siguiendo a Wan 2.1) | ~13,5 GB | minimax-h3-community-license-agreement | HuggingFace, 11 likes, 0 descargas |
| MiniMax-H3-Fun-Controlnet-Union (v1) | 5 (Canny, Depth, HED, MLSD, Pose) | 5 bloques de control (capas 0, 10, 20, 30, 40) | `pre_norm` (huecos cerca de -2, oscuros extremos) | ~6,8 GB | misma licencia de la familia | version anterior del mismo repositorio de autor |
| MiniMax-H3 (modelo base) | no aplica (es el transformer base) | no aplica | no aplica | no disponible | minimax-h3-community-license-agreement | repositorio de alibaba-pai |
| Wan2.1-VACE | no disponible en la informacion proporcionada | no disponible | referencia citada para la receta de layout y para `post_norm` | no disponible | no disponible en la informacion proporcionada | repositorio ali-vilab/VACE |

No se dispone de datos publicados que permitan comparar rendimiento numerico (calidad, adherencia o coherencia temporal) con alternativas de la misma categoria; la comparativa anterior se limita a caracteristicas verificables en la informacion proporcionada.

## Limitaciones y advertencias

- Cargar la configuracion de la version 1.0 (`minimax_h3_control.yaml`) contra este checkpoint produce un fallo silencioso: el modelo construye solo la mitad de la rama de control y `load_state_dict(strict=False)` descarta `control_blocks.5~9` como claves inesperadas y coloca mal el resto, generando salidas incorrectas sin ningun error explicito. Es obligatorio usar `minimax_h3_control_inpaint_post_norm.yaml`.
- Licencia `other` (minimax-h3-community-license-agreement): las condiciones de uso comercial no se detallan en la informacion disponible y deben revisarse en el fichero LICENSE.md del repositorio antes de cualquier despliegue en produccion.
- No se documentan idiomas soportados; el comportamiento multilingue de los prompts no esta garantizado ni evaluado.
- No hay resultados de benchmarks publicados, por lo que no existe evidencia cuantitativa de calidad, coherencia temporal ni fidelidad al control.
- Al ser un modelo generativo de video, existe riesgo de artefactos visuales, inconsistencias temporales e invencion de contenido no presente en el video de control o en el prompt.
- La generacion queda supeditada a limitaciones estructurales fijas: duracion maxima de 15 segundos, 24 fps no configurables y recorte del recuento de fotogramas al mayor `17 * n + 5` decodificable por el VAE, lo que puede acortar o modificar la duracion solicitada.
- El layout y otras condiciones requieren anotadores previos (por ejemplo, las herramientas de VACE-Annotators) para producir los videos de control; la calidad del resultado depende fuertemente de la calidad de esa preprocesamiento.
- El modelo esta destilado en guia, de modo que `guidance_scale` debe mantenerse en `1.0`; no se documenta el comportamiento con otros valores.
- El control de audio esta desactivado (`control_apply_audio = false`), por lo que no se puede condicionar la generacion a una pista de audio.
- La adherencia al control depende de `control_context_scale`; valores por debajo de `1.0` debilitan la guia estructural y su efecto optimo no esta documentado mas alla del valor `1.00`.
- No se especifican requisitos de hardware ni cuantizaciones disponibles, lo que dificulta planificar el coste de despliegue.
- El repositorio no tiene descargas registradas y la model card se creo el 22 de septiembre de 2026, por lo que se trata de un artefacto reciente con poca validacion externa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0
- Fichero de licencia: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0/blob/main/LICENSE.md
- Pesos: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0/resolve/main/MiniMax-H3-Fun-Controlnet-Union-2.0.safetensors
- Repositorio de codigo VideoX-Fun: https://github.com/aigc-apps/VideoX-Fun
- Script de ejemplo de v2v con inpainting: `examples/minimax_h3_fun/predict_v2v_control_inpaint.py` (dentro del repositorio de VideoX-Fun)
- Configuracion requerida: `minimax_h3_control_inpaint_post_norm.yaml` (dentro del repositorio de VideoX-Fun)
- Receta de layout de Wan2.1-VACE: https://github.com/ali-vilab/VACE
- Ejemplos de control publicados en el repositorio: https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0/resolve/main/asset/canny.mp4, https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0/resolve/main/asset/depth.mp4, https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0/resolve/main/asset/hed.mp4, https://huggingface.co/alibaba-pai/MiniMax-H3-Fun-Controlnet-Union-2.0/resolve/main/asset/mlsd.mp4
- Paper o informe tecnico: no disponible en la informacion proporcionada
- Demo publica: no disponible en la informacion proporcionada
