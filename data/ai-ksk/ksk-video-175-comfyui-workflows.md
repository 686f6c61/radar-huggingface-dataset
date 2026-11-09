# AI-KSK/ksk-video-175-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-175-comfyui-workflows` no es un modelo de pesos, sino un repositorio de documentación que acompaña a un tutorial en vídeo sobre un flujo de trabajo de ComfyUI para edición de imágenes con control de pose e iluminación. El flujo combina el modelo de edición de imagen Qwen-Image-Edit 2511 con el nodo VNCCS Pose Studio, que permite posar un maniquí 3D y ajustar la iluminación dentro del propio grafo de ComfyUI, sin salir a Blender o Poser.

El objetivo es mantener la consistencia de un personaje (rostro y vestuario) mientras se le cambia la pose y se le aplica una nueva iluminación. El modelo recibe tres entradas: el render de la pose, la imagen fuente y el esqueleto detectado. Según el autor, el control de pose es muy preciso, y el nodo inyecta además un prompt de iluminación salvo que se desactive explícitamente.

El repositorio en sí tiene un tamaño de 0.0 GB y no incluye JSON del workflow, pesos ni portadas: solo contiene el README en inglés con la tabla de parámetros extraída del JSON original, que queda disponible a través de la página de RunningHub y del vídeo del episodio. Es, por tanto, material de referencia y no un artefacto desplegable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio no contiene pesos; el flujo usa Qwen-Image-Edit 2511 como UNET) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el flujo referencia `qwen_image_edit_2511_bf16.safetensors`, `qwen_2.5_vl_7b_fp8_scaled.safetensors`) |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | no disponible (no se distribuyen pesos; el flujo referencia safetensors para UNET, CLIP y VAE) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura ni el entrenamiento del modelo subyacente en la documentación proporcionada. El repositorio describe únicamente un grafo de ComfyUI de 25 nodos que orquesta varios componentes: un cargador UNET que apunta a `qwen_image_edit_2511_bf16.safetensors`, un cargador CLIP con `qwen_2.5_vl_7b_fp8_scaled.safetensors` en modo `qwen_image`, un VAE `qwen_image_vae.safetensors`, un KSampler configurado con 4 pasos, CFG 1, sampler euler, scheduler simple y denoise 1, y dos LoRAs aplicadas a escala 1: `VNCCS_PoseStudioQIE2511_V2.safetensors` y `Qwen-Image-Edit-2511-Lightning-4steps-V1.0-bf16.safetensors`.

La innovación técnica destacable del flujo es la integración del nodo VNCCS Pose Studio dentro de ComfyUI: permite posar un maniquí, renderizar la pose y pasar simultáneamente el render, la imagen fuente y el esqueleto detectado al nodo de codificación de texto. El uso de un LoRA Lightning de 4 pasos junto con CFG 1 sugiere una inferencia acelerada por destilación, aunque no se detallan los detalles de dicho entrenamiento.

## Capacidades

- Edición de imagen con control de pose: cambia la postura de un personaje manteniendo la identidad facial y el vestuario.
- Control de iluminación integrado: el nodo inyecta un prompt de iluminación por defecto, desactivable mediante un interruptor de conservación de luz.
- Consistencia de personaje en una sola figura: el grafo está diseñado para un único personaje, no para multitudes.
- Entrada multimodal de tres imágenes: render de pose, imagen fuente y esqueleto detectado.
- Ajuste de cámara: permite fijar el tamaño de cámara para igualar la relación de aspecto de la imagen fuente y recentrar la cámara.
- Procesamiento por lotes de varias poses a partir de una misma imagen fuente.
- Generación acelerada: configuración de 4 pasos con CFG 1 y LoRA Lightning.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni otros idiomas distintos del inglés.

## Casos de uso

- Previsualización de poses para ilustración: un artista posa el maniquí dentro de ComfyUI, renderiza la pose y obtiene una edición del personaje en esa postura sin salir del entorno, lo que elimina el viaje de ida y vuelta a Blender o Poser.
- Variaciones de iluminación sobre un mismo personaje: con el prompt de iluminación activo, se generan distintas versiones de la misma escena con luces diferentes para elegir la más adecuada en un proyecto de cómic o storyboard.
- Generación por lotes de poses para hojas de personaje: a partir de una única imagen fuente se producen varias poses consistentes, útil para fichas de personaje o referencias de animación.
- Iteración rápida en producción de contenido: el flujo de 4 pasos con CFG 1 y LoRA Lightning reduce el coste por iteración, lo que facilita probar muchas poses antes de fijar una.
- Control de cámara y encuadre: al fijar el tamaño de cámara según la relación de aspecto de la fuente, se mantiene el encuadre original mientras cambia la pose, adecuado para sustituciones en escenas ya compuestas.
- Documentación y formación: el repositorio sirve como material didáctico reproducible para quienes quieran montar un pipeline de edición con control de pose en ComfyUI, con la tabla de parámetros ya extraída.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El flujo referencia pesos en bf16 (`qwen_image_edit_2511_bf16.safetensors`) y un CLIP en fp8 escalado (`qwen_2.5_vl_7b_fp8_scaled.safetensors`), pero no se indica el consumo de memoria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: ComfyUI es el entorno descrito; no se documentan vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un flujo de edición de imagen.
- Latencia y throughput: no disponible. Únicamente se conoce la configuración de 4 pasos del KSampler con el LoRA Lightning, que apunta a una inferencia acelerada, pero sin cifras.

## Comparativa con modelos similares

No disponible. La documentación proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El repositorio no contiene pesos, JSON del workflow ni portadas: es solo documentación. El grafo real se distribuye a través de la página de RunningHub y del vídeo del episodio.
- Diseñado para un único personaje: no está pensado para escenas con varias figuras ni multitudes.
- El prompt de iluminación está activo por defecto; las ediciones que solo cambian la pose requieren activar el interruptor de conservación de luz.
- La relación de aspecto de salida debe seguir a la imagen fuente, por lo que no es adecuado para formatos de salida exóticos.
- El grafo se construyó a mano contra una versión del proyecto que RunningHub aún no había replicado; los grafos de ejemplo upstream pueden diferir.
- La licencia es "other": no se especifican los términos exactos, por lo que el uso comercial requiere revisar las condiciones del autor y de los componentes subyacentes (Qwen-Image-Edit 2511, LoRAs VNCCS y Lightning).
- Idioma documentado: únicamente inglés.
- No se documentan sesgos, tasas de alucinación ni limitaciones de contexto del modelo subyacente en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-175-comfyui-workflows
- RunningHub - 一致性姿态与光影控制VNCCS Pose Studio+2511: https://www.runninghub.ai/post/2020409094468800513/?inviteCode=rh-v1111
- Tutorial en YouTube: https://www.youtube.com/watch?v=iTMudoGSbBA
- Original en Bilibili: https://www.bilibili.com/video/BV1iTcwzJEtD
