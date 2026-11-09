# AI-KSK/ksk-video-173-comfyui-workflows

## Resumen

`AI-KSK/ksk-video-173-comfyui-workflows` no es un modelo de pesos, sino un repositorio de documentación que acompaña a un tutorial de ComfyUI para generar vídeo a partir de una imagen (image-to-video) con la familia LTX-2. El autor, AI-KSK, publica aquí el texto del episodio y la tabla de parámetros extraída del grafo, pero no incluye ni los archivos JSON de los workflows ni los pesos del modelo. El repositorio tiene un tamaño de 0.0 GB y cero descargas, lo que confirma que no contiene artefactos descargables.

El tutorial aborda un fallo conocido de LTX-2 image-to-video: cuando el movimiento descrito en el prompt es débil, el modelo genera clips casi estáticos. La propuesta del autor es aplicar un Adapter LoRA (`LTX-2-Image2Vid-Adapter.safetensors`) junto con un grafo a 60 fps y 1080p, en dos variantes: una de calidad completa (25 pasos más un upscale 2x) y otra destilada (8 pasos). El modelo base referenciado es `ltx-2-19b-dev-fp8_transformer_only.safetensors`, un transformer de aproximadamente 19 000 millones de parámetros en fp8.

La relevancia de esta ficha es limitada como modelo en sí: es material de referencia para quien quiera reproducir los grafos de ComfyUI del episodio. Cualquier dato de arquitectura, entrenamiento o benchmarks pertenece al modelo LTX-2 subyacente, no a este repositorio, y no se proporciona en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de tutoriales; el modelo base referenciado es LTX-2, transformer de difusión para vídeo) |
| Parámetros totales | no disponible (el UNET referenciado en el grafo es `ltx-2-19b-dev-fp8_transformer_only.safetensors`, ~19B según el nombre del archivo) |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | no disponible (el grafo usa 97 frames por clip; 768x512 de resolución latente) |
| Tipos de cuantización | fp8 (UNET `fp8_transformer_only`), bf16 (embeddings connector, VAE, LoRA); no se detallan otras |
| Idiomas soportados | en |
| Licencia | other |
| Formato de pesos | safetensors (referenciados como dependencias externas; no incluidos en el repo) |

## Arquitectura y entrenamiento

El repositorio no contiene arquitectura ni proceso de entrenamiento propios. Los grafos descritos operan sobre LTX-2 en su variante image-to-video, con un UNET de aproximadamente 19B en fp8, un doble CLIP formado por `gemma_3_12B_it_fp8_e4m3fn.safetensors` y `ltx-2-19b-embeddings_connector_bf16.safetensors`, y el VAE `LTX2_video_vae_bf16.safetensors`. El tamaño latente configurado es 768x512 con 97 frames y batch 1.

La innovación que documenta el tutorial es la incorporación del Adapter LoRA `LTX-2-Image2Vid-Adapter.safetensors` con peso 1, que según el autor corrige la tendencia a generar clips estáticos cuando el prompt describe poco movimiento, y mejora la consistencia, la coherencia del movimiento y la generalización. No se aportan datos sobre el dataset de entrenamiento del LoRA, el número de tokens, ni si hubo RLHF o DPO. Tampoco se detalla el mecanismo interno del adaptador.

## Capacidades

- Generación de vídeo a partir de una imagen de referencia (image-to-video) mediante LTX-2.
- Producción de clips a 60 fps y 1080p según la configuración del autor (no garantizado como techo en GPUs menores).
- Dos modos de inferencia: grafo de calidad completa (25 pasos más upscale 2x con modelo acelerado) y grafo destilado (8 pasos, adapter ya fusionado, slot LoRA vacío).
- Control mediante prompt positivo y negativo, duración en segundos y fps.
- Mejora de consistencia y coherencia de movimiento con el Adapter LoRA, descrita cualitativamente por el autor.
- El build destilado es "uncensored-capable" según el autor, lo que traslada la responsabilidad al usuario.
- No se documentan tool calling, agentes, razonamiento multi-paso ni capacidades multilingües más allá del inglés.

## Casos de uso

- Reproducción del tutorial de ComfyUI: cargar los grafos del episodio y validar la configuración de 54 nodos con los parámetros de la tabla para obtener clips a 60 fps desde una imagen.
- Prototipado de image-to-video con movimiento controlado: usar el Adapter LoRA a peso 1 para evitar clips estáticos cuando el prompt describe movimiento moderado.
- Pipeline de bajo coste: emplear el grafo destilado de 8 pasos para iterar rápido sobre prompts antes de pasar al grafo de calidad completa.
- Evaluación de la mejora de consistencia: comparar el mismo clip con y sin el adapter para verificar cualitativamente la coherencia del movimiento en escenas de dos personas de 10 segundos.
- Integración en flujos de ComfyUI existentes: reutilizar los loaders de UNET, doble CLIP y VAE documentados para encajar el adapter en grafos propios.
- Formación interna: usar la tabla de parámetros y el tutorial como referencia para que el equipo configure correctamente los slots de LoRA y el scheduler en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que la mejora de consistencia se describe de forma cualitativa y que el ejemplo de dos personas a 10 segundos es una sola muestra, no un conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada: no disponible. El UNET referenciado es de ~19B en fp8, lo que sugiere requisitos elevados, pero no se aportan cifras.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; el autor advierte que 60 fps a 1080p es lo que él ejecutó, no un techo garantizado en tarjetas menores.
- Opciones de despliegue: ComfyUI (los grafos son de ComfyUI). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento de alternativas de image-to-video.

## Limitaciones y advertencias

- El repositorio no contiene pesos ni JSON: solo README y tabla de parámetros. Los grafos están en la página de RunningHub y en el vídeo del episodio.
- En el grafo destilado, CFG 1 implica que el prompt negativo está desactivado salvo que se conecte el nodo negativo de LTX-2; es un detalle del grafo que se pasa por alto con frecuencia.
- El build destilado es "uncensored-capable" según el autor; la responsabilidad de uso recae en el usuario.
- La mejora de consistencia no está cuantificada; el ejemplo de 10 segundos con dos personas es una única muestra.
- 60 fps a 1080p es la configuración que ejecutó el autor, no un límite garantizado.
- Licencia "other": no se especifican términos de uso comercial en la información disponible.
- Idioma soportado: únicamente inglés.
- Riesgo de alucinación y sesgos: no documentados en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/AI-KSK/ksk-video-173-comfyui-workflows
- RunningHub - ltx2_i2v去蒸馏图到视频一致性60帧1080p: https://www.runninghub.ai/post/2019396485409939457/?inviteCode=rh-v1111
- RunningHub - ltx2_i2v蒸馏图到视频一致性60帧1080p: https://www.runninghub.ai/post/2019439198570287106/?inviteCode=rh-v1111
- Tutorial en YouTube: https://www.youtube.com/watch?v=VYBoOk7pCJA
- Original en Bilibili: https://www.bilibili.com/video/BV1wiFzzwEoR
