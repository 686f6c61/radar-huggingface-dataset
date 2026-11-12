# chabasx/NoteTkr-mirror-Qwen3.5-2B-4bit

## Resumen

NoteTkr-mirror-Qwen3.5-2B-4bit es un espejo (mirror) del modelo Qwen3.5-2B en formato MLX cuantizado a 4 bits, publicado por el usuario chabasx en Hugging Face. El modelo original procede de Qwen (Alibaba) y ha sido convertido a MLX mediante mlx-vlm 0.3.12, la herramienta de Apple para ejecutar modelos multimodales de forma nativa en hardware Apple Silicon. Se trata, por tanto, de una redistribucion de un artefacto ya existente mas que de un modelo entrenado desde cero.

El modelo es multimodal de tipo image-text-to-text (acepta imagenes y texto como entrada y genera texto) y cuenta con 2.213.241.664 parametros totales segun los pesos en safetensors, lo que lo situa en la gama de 2B. Su relevancia practica radica en que permite ejecutar un modelo vision-lenguaje de ~2B en equipos con memoria unificada de Apple (MacBook, Mac mini, Mac Studio) gracias a la cuantizacion de 4 bits y al backend MLX, con un repositorio de solo 1,7 GB.

La ficha se basa exclusivamente en los metadatos disponibles en Hugging Face y en la model card del autor. No se han publicado detalles de arquitectura interna, composicion del dataset de entrenamiento, idiomas soportados ni resultados de benchmarks en la informacion proporcionada, por lo que esos apartados se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo multimodal image-text-to-text; familia Qwen3.5) |
| Parametros totales | 2.213.241.664 (~2,2B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (formato MLX) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (transformers, mlx-vlm) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo original Qwen3.5-2B en la documentacion proporcionada. Por el pipeline declarado (image-text-to-text) y la etiqueta qwen3_5, se trata de un modelo de la familia Qwen3.5 con capacidad de procesamiento de imagenes y texto, presumiblemente un transformer multimodal con un codificador visual acoplado a un decoder de lenguaje. No se especifican el numero de capas, dimensiones ocultas, mecanismo de atencion ni innovaciones tecnicas concretas.

Respecto al entrenamiento, no se han facilitado datos sobre el numero de tokens, la composicion del corpus, ni si se aplicaron tecnicas de RLHF, DPO o post-entrenamiento similar. La unica informacion tecnica verificable es el proceso de conversion: el autor tomo Qwen/Qwen3.5-2B y lo convirtio a MLX con mlx-vlm 0.3.12, aplicando cuantizacion de 4 bits. Este repositorio es, por tanto, una redistribucion cuantizada y no incorpora entrenamiento adicional propio.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen + texto), segun el pipeline image-text-to-text declarado.
- Descripcion de imagenes y respuesta a preguntas visuales (el ejemplo de la model card usa el prompt "Describe this image.").
- Conversacion multi-turno (tag conversational).
- Ejecucion nativa en Apple Silicon mediante MLX y mlx-vlm.
- Compatibilidad con endpoints (tag endpoints_compatible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la informacion proporcionada.
- Cobertura multilingue: no disponible.
- Modos especiales (thinking, audio, etc.): no disponibles en la informacion proporcionada.

## Casos de uso

- Descripcion automatica de imagenes en local: usar `mlx_vlm.generate` con una ruta de imagen para obtener descripciones textuales, aprovechando que el modelo corre en un Mac sin GPU dedicada.
- Prototipado de asistentes visuales en Mac: integrar el modelo en una app de escritorio para responder preguntas sobre capturas de pantalla o fotografias, gracias al backend MLX y al tamano reducido de 1,7 GB.
- Etiquetado y catalogacion de imagenes en pequenos flujos de trabajo: procesar lotes de imagenes para generar metadatos textuales en un equipo de sobremesa Apple.
- Educacion y demostraciones: servir como modelo de referencia para ensenar tecnicas de cuantizacion y despliegue de modelos multimodales en hardware de consumo.
- Pruebas de concepto de pipelines VLM: validar la integracion de un modelo image-text-to-text en scripts Python antes de escalar a modelos mayores, dado su bajo coste de memoria.
- Desarrollo offline y con privacidad: ejecutar inferencia totalmente local en Mac, sin enviar imagenes a servicios en la nube, adecuado para entornos con requisitos de confidencialidad.
- Evaluacion comparativa de cuantizacion: usar este mirror 4-bit frente al modelo original para medir la perdida de calidad introducida por la cuantizacion en tareas de vision-lenguaje.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio pesa 1,7 GB en 4 bits, por lo que se estima un consumo de memoria unificado en torno a 2-3 GB durante la inferencia (cifra orientativa; no confirmada en la documentacion).
- Hardware objetivo: Apple Silicon (series M1, M2, M3, M4 y superiores) con memoria unificada suficiente; el backend es MLX, no CUDA.
- GPU NVIDIA: no aplica de forma nativa; este artefacto esta en formato MLX. Para CUDA habria que usar los pesos originales en transformers u otro runtime.
- Cabe en GPU de consumo: si, en equipos Apple con memoria unificada; en el ecosistema NVIDIA habria que recurrir a la version no-MLX.
- Opciones de despliegue: mlx-vlm (documentado por el autor), transformers; no se mencionan vLLM, llama.cpp, Ollama ni TGI para este artefacto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| chabasx/NoteTkr-mirror-Qwen3.5-2B-4bit | ~2,2B | no disponible | MLX 4-bit | Apache 2.0 | Mirror cuantizado, orientado a Apple Silicon |
| Qwen/Qwen3.5-2B-Base (original) | ~2,2B | no disponible | safetensors | Apache 2.0 | Pesos completos sin cuantizar, base del mirror |
| Qwen/Qwen3.5-2B | ~2,2B | no disponible | safetensors | Apache 2.0 | Version instruct referenciada en la model card |
| mlx-community/Qwen3.5-2B-4bit | ~2,2B | no disponible | MLX 4-bit | Apache 2.0 | Conversion MLX de referencia de la comunidad |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Es un mirror de terceros (chabasx), no una publicacion oficial de Qwen; la trazabilidad y el mantenimiento dependen del autor del repositorio.
- Cuantizacion 4-bit: introduce perdida de precision respecto a los pesos originales, con posible degradacion en tareas de razonamiento o percepcion fina; no se han publicado evaluaciones de esa perdida.
- Formato MLX: no es directamente portable a CUDA, ROCm ni a runtimes como vLLM o llama.cpp sin reconversion.
- Sin datos de benchmarks, idiomas, contexto ni sesgos: no es posible evaluar su robustez ni su idoneidad para produccion con la informacion disponible.
- Riesgo de alucinacion inherente a los modelos generativos; no cuantificado para este artefacto.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base original enlazada en la model card.
- Fecha de creacion futura en los metadatos (2026-11-12) y cero descargas: repositorio sin validacion comunitaria.
- No se documentan limitaciones de contexto ni de idioma; se desconoce si el modelo cubre espanol con calidad suficiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/chabasx/NoteTkr-mirror-Qwen3.5-2B-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Modelo instruct referenciado: https://huggingface.co/Qwen/Qwen3.5-2B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-2B/blob/main/LICENSE
- Conversion MLX de referencia: https://huggingface.co/mlx-community/Qwen3.5-2B-4bit
- Herramienta de conversion: mlx-vlm (version 0.3.12)
