# H3-Tiny/MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1

## Resumen

MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1 es una versión podada y destilada del transformer de generación conjunta de vídeo y audio MiniMax-H3 (33B) de MiniMaxAI, desarrollada por el proyecto independiente H3-Tiny. El modelo reduce el transformer original de 33B a 13,99B de parámetros mediante poda estructurada en dos etapas (33B → 17B → 14B) y un proceso de recuperación por destilación de conocimiento del profesor de 33B (OKD, *output knowledge distillation*). El resultado es un checkpoint que mantiene el flujo de trabajo Ref2VA (imagen de referencia a vídeo con audio) del modelo original.

El modelo está pensado para generación de vídeo con audio sincronizado a partir de texto e imágenes de referencia, una tarea multimodal que combina difusión sobre latentes de vídeo y audio. Al reducir el tamaño del transformer a menos de la mitad, el objetivo es hacer viable la inferencia en hardware más modesto que el requerido por el modelo base de 33B, manteniendo la fidelidad de generación gracias a la destilación desde el profesor.

Este repositorio contiene únicamente el transformer en formato diffusers (config.json más safetensors fragmentados); el codificador de texto, los VAE y los procesadores deben tomarse del checkpoint oficial de MiniMax-H3 en formato diffusers. La licencia es la MiniMax H3 Community License Agreement, que impone restricciones territoriales y de uso aceptable.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión para generación conjunta de vídeo y audio (flujo Ref2VA), derivado por poda estructurada de MiniMax-H3 |
| Parámetros totales | 13.989.119.056 (13,99B, solo transformer) |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (el repo publica safetensors en precisión original; no se documentan variantes GGUF/FP8) |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors fragmentados con config.json (layout diffusers); existe versión de fichero único para ComfyUI en repo separado |

## Arquitectura y entrenamiento

El modelo es un transformer de difusión que genera vídeo y audio de forma conjunta condicionado por texto e imágenes de referencia (flujo Ref2VA). Parte del transformer de MiniMax-H3 de 33B y aplica poda estructurada: primero una reducción a 17B (checkpoint intermedio MiniMax-H3-Tiny-17B-Pruned-Ref2VA) y después un estrechamiento de las capas FFN de todos los bloques, de 14336 a 9792 canales, hasta alcanzar los 14B. La recuperación de calidad se realiza mediante OKD (destilación de conocimiento desde el profesor de 33B), de modo que el modelo podado se entrena para reproducir las salidas del modelo original.

La generación utiliza 50 pasos de muestreo según la model card. No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o preferencias; tampoco se especifican innovaciones de atención (lineal, decodificación especulativa) más allá de las opciones de backend de atención y *offloading* mencionadas en el repositorio de GitHub. El transformer se distribuye por separado de los componentes de texto y VAE, que provienen del checkpoint oficial de MiniMax-H3.

## Capacidades

- Generación de vídeo a partir de texto e imágenes de referencia (reference-to-video), con resolución y duración no especificadas en la información disponible.
- Generación de audio conjunta y sincronizada con el vídeo en el mismo proceso de difusión.
- Condicionamiento por múltiples imágenes de referencia mediante marcadores en el prompt (por ejemplo, `<Picture 1>`).
- Control del número de fotogramas generados (el ejemplo de la model card usa `--num-frames 124`).
- Integración con ComfyUI mediante un checkpoint de fichero único publicado en un repositorio aparte.
- Carga mediante pipeline propio (`h3tiny.pipeline.load_pipeline`) y scripts de inferencia del repositorio GitHub.
- Soporte de *offloading* y selección de backend de atención según el README de GitHub (detalles no disponibles en la información proporcionada).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni modo *thinking*; no aplica a un modelo de generación de vídeo.

## Casos de uso

- Generación de vídeo publicitario con audio: a partir de una o varias imágenes de producto como referencia y un prompt descriptivo, el modelo produce un clip con banda sonora sincronizada, adecuado para prototipos rápidos de campañas.
- Previsualización de escenas para cine y animación: los equipos de guion pueden convertir bocetos o *concept art* en clips animados con audio para validar ritmo y puesta en escena antes de producción.
- Creación de contenido para redes sociales: generación de clips cortos con audio a partir de una imagen de marca, reduciendo la dependencia de stock y de herramientas de edición.
- Prototipado de videojuegos y experiencias interactivas: generación de cinemáticas o *cutscenes* preliminares con audio integrado para maquetas de nivel.
- Generación de material didáctico: conversión de ilustraciones de referencia en vídeos explicativos con narración o ambiente sonoro para cursos y presentaciones.
- Investigación en generación multimodal: al ser un modelo podado y destilado, sirve como caso de estudio para medir la pérdida de calidad frente al profesor de 33B en tareas de vídeo y audio conjuntos.
- Despliegue en entornos con VRAM limitada: al reducir el transformer a 14B, permite experimentar con generación de vídeo y audio en GPUs de gama alta de consumo mediante *offloading*, algo inviable con el modelo base de 33B en el mismo hardware.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia, el transformer de 13,99B en precisión de 16 bits ocupa aproximadamente 28 GB solo en pesos (el repositorio pesa 28,0 GB), a lo que hay que sumar el codificador de texto y los VAE del checkpoint base de MiniMax-H3.
- GPU recomendadas: no especificadas en la información disponible. Por tamaño, un transformer de 14B en FP16 requiere GPUs de 40-80 GB (A100 40/80 GB, H100) para ejecución completa sin *offloading*.
- GPU de consumo: no cabe completo en GPUs de 24 GB (RTX 4090) sin *offloading* a CPU o cuantización, que no se documentan en este repositorio.
- Opciones de despliegue: pipeline propio `h3tiny` (repositorio GitHub), diffusers y ComfyUI (checkpoint de fichero único en el repo MiniMax-H3-Tiny-ComfyUI). No se documentan integraciones con vLLM, llama.cpp ni TGI (no aplicables a un modelo de difusión de vídeo).
- Latencia y throughput: no disponibles. La model card indica 50 pasos de muestreo, pero no se publican tiempos por clip ni resoluciones de referencia.

## Comparativa con modelos similares

| Modelo | Parámetros (transformer) | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|
| MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1 | 13,99B | Vídeo + audio (Ref2VA) | MiniMax H3 Community License | Hugging Face (este repo) |
| MiniMax-H3 (modelo base) | 33B | Vídeo + audio (Ref2VA) | MiniMax H3 Community License | Hugging Face (MiniMaxAI) |
| MiniMax-H3-Tiny-17B-Pruned-Ref2VA | 17B | Vídeo + audio (Ref2VA) | MiniMax H3 Community License | Hugging Face (colección H3-Tiny) |

La comparación se limita a la familia MiniMax-H3 y sus derivados porque la información disponible no incluye datos de rendimiento frente a modelos de otras familias (por ejemplo, generadores de vídeo de código abierto de tamaño comparable). No se dispone de métricas comparativas de calidad, latencia ni consumo de VRAM entre estas variantes.

## Limitaciones y advertencias

- Modelo podado y destilado: la reducción de 33B a 14B puede degradar la fidelidad de detalles finos, la coherencia temporal en clips largos y la sincronización audio-vídeo respecto al modelo base; no se publican métricas que cuantifiquen esta pérdida.
- Solo se distribuye el transformer: es imprescindible descargar el checkpoint oficial de MiniMax-H3 para el codificador de texto, los VAE y los procesadores, lo que añade peso y complejidad de despliegue.
- Licencia restrictiva: la MiniMax H3 Community License Agreement incluye un ámbito territorial y una política de uso aceptable; es obligatorio revisar el fichero LICENSE-MiniMax-H3 y el NOTICE antes de cualquier uso comercial.
- Proyecto independiente no afiliado a MiniMax: el soporte depende de la comunidad (GitHub issues y correo del autor), sin garantías de mantenimiento.
- Riesgo de alucinación visual y artefactos: como todo modelo generativo de difusión, puede producir inconsistencias anatómicas, texto ilegible en el vídeo y desincronización entre audio y movimiento.
- Idiomas soportados no documentados: no se especifica qué lenguas entiende el codificador de texto ni si los prompts en castellano funcionan correctamente.
- Sin datos de benchmarks ni de sesgos: no hay evaluación publicada de sesgos demográficos, culturales o de contenido sensible.
- Contexto y resolución no especificados: no se documentan límites máximos de fotogramas, resolución ni duración de clip, más allá del ejemplo de 124 fotogramas.
- Requisitos de hardware elevados para un modelo "tiny": los 28 GB de pesos en FP16 más los componentes del modelo base siguen exigiendo GPUs de datacenter o estrategias de *offloading* no documentadas en detalle.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1
- Repositorio GitHub del proyecto: https://github.com/fuyi25/MiniMax-H3-Tiny
- Página del proyecto: https://fuyi25.github.io/MiniMax-H3-Tiny/
- Colección H3-Tiny en Hugging Face: https://huggingface.co/collections/H3-Tiny/h3-tiny-v01-6afeea67147c27cf3b80820a
- Checkpoint para ComfyUI: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-ComfyUI
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia: https://huggingface.co/H3-Tiny/MiniMax-H3-Tiny-14B-OKD-Ref2VA-v0.1/blob/main/LICENSE-MiniMax-H3
