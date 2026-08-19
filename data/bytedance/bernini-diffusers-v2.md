# ByteDance/Bernini-Diffusers-v2

## Resumen

Bernini es un marco unificado de generación y edición de vídeo desarrollado por ByteDance que combina un planificador semántico basado en un modelo de lenguaje multimodal (MLLM) con un renderizador basado en transformadores de difusión (DiT). La versión Bernini-Diffusers-v2 empaqueta el pipeline completo de planificación semántica en un directorio autocontenido en formato diffusers, incluyendo el planificador Qwen2.5-VL-7B-Instruct, los pesos de planificación de Bernini y los componentes de difusión de Wan2.2-T2V-A14B. Este lanzamiento está pensado para tareas complejas de generación y edición de vídeo que requieren un seguimiento de instrucciones más robusto y una planificación semántica explícita en varios pasos.

El modelo soporta seis tareas: texto a imagen (t2i), imagen a imagen (i2i), texto a vídeo (t2v), vídeo a vídeo (v2v), vídeo de referencia a vídeo (rv2v) y referencia a vídeo (r2v). Su arquitectura descompone instrucciones complejas y planifica los cambios semánticos antes de renderizar, lo que mejora la fidelidad de la edición frente a enfoques que solo usan el renderizador. Con un tamaño de repositorio de 192,4 GB, requiere hardware de gama alta para su ejecución. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline con planificador semantico MLLM (Qwen2.5-VL-7B-Instruct) y renderizador DiT (Wan2.2-T2V-A14B) |
| Parametros totales | No disponible (el renderizador base Wan2.2-T2V-A14B tiene 14B activos; el planificador Qwen2.5-VL-7B anade 7B adicionales) |
| Parametros activos | No disponible (el renderizador base es MoE con 14B activos de un total no especificado) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos en safetensors, sin versiones cuantizadas publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (formato diffusers) |

## Arquitectura y entrenamiento

Bernini combina dos componentes principales: un planificador semantico basado en Qwen2.5-VL-7B-Instruct, que interpreta instrucciones complejas y genera un plan latente de cambios semanticos, y un renderizador DiT basado en Wan2.2-T2V-A14B, que convierte ese plan en imagenes o videos. El pipeline completo se empaqueta en un directorio diffusers que incluye el codificador de texto T5, el VAE, el scheduler y los configs de los dos transformadores.

La version v2 introduce una receta de entrenamiento que calienta el conector entre el planificador y el renderizador durante miles de pasos antes de realizar el co-entrenamiento conjunto. Este cambio mejora significativamente la edicion guiada por referencia y el rendimiento en la tarea OpenS2V (imagen de referencia a video). No se han publicado detalles sobre el dataset de entrenamiento, el numero total de tokens ni si se aplicaron tecnicas de RLHF o DPO.

## Capacidades

- Generacion de video a partir de texto (t2v) y de imagen a video (i2v).
- Edicion de video con instrucciones en lenguaje natural (v2v).
- Edicion de video usando una imagen de referencia (rv2v) y generacion de video a partir de una imagen de referencia (r2v).
- Generacion de imagenes a partir de texto (t2i) y edicion de imagenes (i2i).
- Planificacion semantica en multiples pasos: descompone instrucciones complejas en pasos intermedios antes de renderizar.
- Seguimiento de instrucciones robusto gracias al planificador MLLM, que entiende referencias espaciales, temporales y de estilo.
- Capacidad de usar un potenciador de prompt opcional via API compatible con OpenAI para mejorar la calidad de generacion.

## Casos de uso

- Edicion de video profesional: un editor puede indicar "cambia el fondo de esta escena por una playa al atardecer" y Bernini planifica la modificacion semantica y la aplica de forma coherente en todos los fotogramas, gracias a su planificador MLLM.
- Generacion de video publicitario: a partir de un texto descriptivo, el modelo produce secuencias de video de alta calidad listas para prototipos, reduciendo el tiempo de produccion en agencias creativas.
- Creacion de contenido para redes sociales: los creadores pueden generar clips cortos desde texto o editar videos existentes con instrucciones simples, sin necesidad de herramientas complejas de composicion.
- Restauracion y mejora de video: usando la tarea v2v, se pueden aplicar cambios de estilo, iluminacion o resolucion a material antiguo, con control semantico sobre que elementos conservar.
- Generacion de storyboards: los equipos de produccion audiovisual pueden generar imagenes (t2i) y secuencias animadas (t2v) a partir de guiones, facilitando la previsualizacion.
- Investigacion en generacion de video: el pipeline completo permite estudiar la interaccion entre planificacion semantica y renderizado, y sirve como base para experimentos en control de edicion y consistencia temporal.

## Benchmarks y rendimiento

La model card oficial reporta los siguientes resultados en benchmarks publicos:

| Modelo | EditVerse | OpenVE | OpenS2V | VBench | Bernini-v2v (OS) | Bernini-rv2v (OS) |
|---|---|---|---|---|---|---|
| Bernini-v2 7+14B | 8.02 | 3.96 | 63.83 | 84.46 | 3.49 | 3.55 |

En evaluaciones internas de arena basadas en comparaciones humanas por pares ciegos, Bernini alcanza el primer nivel entre los modelos comerciales cerrados lideres en edicion de video. No se han publicado comparaciones con otros modelos open source en estos benchmarks.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente, pero dado el tamaño del repositorio (192,4 GB) y el uso de un planificador de 7B mas un renderizador de 14B activos, se estima un minimo de 80 GB de VRAM para inferencia en precision FP16.
- GPUs recomendadas: Hopper (H100, H800, H200) segun la documentacion oficial. Tambien se menciona soporte para 8 GPUs con paralelismo secuencial Ulysses (8-way).
- No cabe en GPUs de consumo (RTX 4090 tiene 24 GB, insuficiente). Se requiere hardware profesional o despliegue distribuido.
- Opciones de despliegue: el codigo oficial incluye scripts de inferencia para una GPU y para multiples GPUs con torchrun. Tambien hay una demo Gradio. No se menciona compatibilidad con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles. El modelo es pesado y la planificacion semantica anade un paso adicional, por lo que se espera una latencia superior a la de renderizadores puros.

## Comparativa con modelos similares

No se dispone de datos comparativos publicos frente a alternativas como Wan2.2, CogVideoX o Sora. Bernini se diferencia por su planificador semantico explicito, que mejora el seguimiento de instrucciones, pero a costa de un checkpoint mas pesado. En terminos de licencia, Apache 2.0 es mas permisiva que muchas alternativas comerciales. No se puede establecer una comparativa cuantitativa sin datos adicionales.

## Limitaciones y advertencias

- El modelo requiere hardware de gama alta (GPUs Hopper o equivalente) y una VRAM considerable; no es adecuado para entornos con recursos limitados.
- El tamaño del repositorio (192,4 GB) implica tiempos de descarga y almacenamiento significativos.
- No se han publicado detalles sobre sesgos en los datos de entrenamiento ni sobre la calidad en idiomas distintos del ingles; la informacion de idiomas no esta disponible.
- El uso del potenciador de prompt requiere una API externa (OpenAI-compatible), lo que anade una dependencia de servicios de terceros.
- Al ser un pipeline complejo, el tiempo de inferencia es mayor que el de modelos de un solo componente; puede no ser adecuado para aplicaciones en tiempo real.
- No se han publicado resultados de cuantizacion; el uso de precision reducida podria degradar la calidad del video.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ByteDance/Bernini-Diffusers-v2
- Repositorio de codigo: https://github.com/bytedance/Bernini
- Paper en arXiv: https://arxiv.org/abs/2605.22344
- Pagina del proyecto: https://bernini-ai.github.io/
- Coleccion de modelos Bernini en Hugging Face: https://huggingface.co/collections/ByteDance/bernini
