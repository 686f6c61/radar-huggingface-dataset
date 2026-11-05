# maxh8086/tokenfrugal-qwen3vl-4b-fp8

## Resumen

tokenfrugal-qwen3vl-4b-fp8 es un espejo privado publicado en HuggingFace por el usuario maxh8086 que contiene una única shard de pesos en formato FP8 (safetensors) de 6.021.235.968 bytes. Según la model card, el origen es Qwen/Qwen3-VL-4B-Instruct-FP8 con las shards fusionadas localmente, y su destino es servir como codificador de texto (text encoder) para el pipeline de generación de imágenes Mage-Flow dentro de ComfyUI. No se trata, por tanto, de un modelo publicado con fines generales, sino de un artefacto de infraestructura interna del proyecto tokenfrugal.

La relevancia de esta ficha es acotada: el repositorio tiene 0 descargas y 0 likes, carece de pipeline declarado, licencia explícita en los metadatos de HuggingFace e idiomas soportados, y la propia model card advierte de que la comprobación de calidad local no se ha completado. El autor indica que la perplejidad no se ha medido y que la prueba de render no se ha ejecutado, y sospecha que el fichero reproduce el mismo problema de ruido en la salida que el codificador FP8 Qwen3-4B de su proyecto tokenfrugal-flux2-klein-4b-fp8, atribuido al esquema de escalas por bloque (`weight_scale_inv`).

Por el nombre y el origen declarado, el modelo subyacente sería un Qwen3-VL de 4.000 millones de parámetros en variante Instruct, con capacidades de visión-lenguaje y cuantización FP8. No obstante, ni el tamaño de contexto, ni la composición del entrenamiento, ni los benchmarks están documentados en la información disponible, y el uso previsto declarado es exclusivamente como componente de un pipeline de difusión, no como modelo de chat o agentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base declarado: Qwen3-VL-4B-Instruct, familia vision-lenguaje transformer) |
| Parametros totales | 4B (según el nombre del modelo base; no verificado en la model card) |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 con escalas por bloque (`weight_scale_inv`); no se documentan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 según la model card, con la indicación explícita de "verify against upstream model card"; los metadatos de HuggingFace no declaran licencia |
| Formato de pesos | safetensors (una única shard de 6.021.235.968 bytes) |

## Arquitectura y entrenamiento

No hay información sobre la arquitectura interna más allá de la referencia al modelo base Qwen3-VL-4B-Instruct, que por familia corresponde a un transformer multimodal con torre de visión y modelo de lenguaje. La model card no detalla número de capas, dimensiones ocultas, mecanismo de atención, estrategia de fusión multimodal ni innovaciones técnicas del modelo original. Tampoco se documenta el proceso de entrenamiento: no se indica volumen de tokens, composición del dataset, fases de preentrenamiento, ajuste supervisado, RLHF o DPO.

La única intervención técnica documentada es la conversión a FP8 y la fusión local de shards del checkpoint Qwen/Qwen3-VL-4B-Instruct-FP8. El autor señala que el fichero emplea el mismo esquema de escalas por bloque (`weight_scale_inv`) que el codificador FP8 Qwen3-4B del proyecto tokenfrugal-flux2-klein-4b-fp8, y que ese codificador produjo ruido al renderizar en ComfyUI. No se aporta ninguna validación numérica de la conversión, ni comparación de perplejidad frente al checkpoint original, ni métricas de similitud de pesos.

## Capacidades

- Generación de texto y razonamiento: heredadas teóricamente del modelo base Qwen3-VL-4B-Instruct, aunque no verificadas en este artefacto.
- Comprensión de imágenes: el modelo base es vision-lenguaje, pero el uso declarado aquí es como codificador de texto para difusión, no como VLM de inferencia directa.
- Codificación de prompts de texto: función principal declarada, alimentar el pipeline Mage-Flow en ComfyUI.
- Tool calling / function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible en la documentación.
- Modo thinking, audio u otras capacidades especiales: no disponible en la documentación.

## Casos de uso

- Codificador de texto en pipelines de difusión con ComfyUI: el uso previsto declarado es cargar el fichero como text encoder de Mage-Flow; encaja por formato safetensors y por tamaño (6 GB) manejable en GPU de consumo, aunque el autor advierte de un posible fallo de render.
- Sustitución de codificadores T5 o CLIP en flujos texto-a-imagen: un encoder de 4B con representaciones más ricas podría mejorar la fidelidad semántica del prompt, pero requiere validar primero que la salida no sea ruido.
- Reproducción de experimentos internos del proyecto tokenfrugal: el repositorio funciona como espejo privado para `scripts/hf_models.py pull`, útil para equipos que ya trabajan con el resto del stack.
- Base para comparativas de cuantización FP8: permite contrastar el comportamiento de un encoder de 4B en FP8 frente a su versión BF16 en tareas de condicionamiento de difusión, siempre que se mida perplejidad y calidad de render.
- Pruebas de integración en ComfyUI: sirve para depurar la carga de pesos FP8 con `weight_scale_inv` y detectar incompatibilidades del runtime antes de desplegar el modelo en producción.
- Evaluación de viabilidad de VLM de 4B en hardware modesto: si se confirma que los pesos son correctos, podría emplearse para tareas ligeras de captioning o respuesta visual en GPUs de 12-16 GB, aunque esto excede el uso declarado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente "Perplexity: not measured" y "Render test: not run", por lo que no existen métricas de calidad, latencia ni throughput verificadas para este artefacto.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-8 GB solo para los pesos FP8; hay que sumar memoria para activaciones, KV cache y el resto del pipeline de difusión (típicamente 4-8 GB adicionales).
- GPU recomendadas: RTX 4090 (24 GB), RTX 4080 (16 GB), L40S (48 GB) o A100/H100 si se integra en un pipeline completo de generación de imágenes.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3090, RTX 4070 Ti Super, RTX 4080 y RTX 4090, siempre que el resto del pipeline de difusión quepa en la VRAM restante.
- Opciones de despliegue: ComfyUI (uso declarado), con soporte de safetensors FP8; no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y FP8 con escalas por bloque no es un formato estándar en muchos runtimes.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tokenfrugal-qwen3vl-4b-fp8 | 4B (según nombre) | no disponible | safetensors FP8 | Apache-2.0 (a verificar) | repo privado, 0 descargas |
| Qwen/Qwen3-VL-4B-Instruct-FP8 | 4B | no disponible en esta ficha | safetensors FP8 | Apache-2.0 (según upstream) | público en HuggingFace |
| Qwen/Qwen3-VL-4B-Instruct | 4B | no disponible en esta ficha | safetensors BF16 | Apache-2.0 | público en HuggingFace |
| Codificador T5-XXL (uso típico en difusión) | 4,7B | 512 tokens | safetensors | Apache-2.0 | público, ampliamente soportado en ComfyUI |

La comparación relevante es con el checkpoint upstream Qwen3-VL-4B-Instruct-FP8, del que este repositorio es un espejo con shards fusionadas: no aporta mejoras documentadas y añade el riesgo de un fallo de render no resuelto. Frente a T5-XXL, el atractivo teórico es un encoder más moderno y multimodal, pero sin validación publicada no puede recomendarse sobre alternativas consolidadas.

## Limitaciones y advertencias

- Calidad no verificada: la model card reconoce que la perplejidad no se ha medido y que la prueba de render no se ha ejecutado.
- Sospecha de fallo de render: el autor indica que el codificador FP8 con el mismo esquema `weight_scale_inv` produjo ruido en ComfyUI y que este fichero podría tener el mismo problema.
- Licencia ambigua: Apache-2.0 aparece en la model card con la advertencia de verificar contra el modelo upstream, pero los metadatos de HuggingFace no declaran licencia; para uso comercial conviene confirmar la licencia del checkpoint original de Qwen.
- Repositorio privado y sin tracción: 0 descargas y 0 likes, sin pipeline declarado, lo que implica ausencia de validación por la comunidad.
- Sin documentación de sesgos, alucinación o limitaciones idiomáticas: no hay información al respecto en la model card.
- Formato no estándar: FP8 con escalas por bloque no está soportado de forma universal por todos los runtimes de inferencia, lo que puede limitar el despliegue fuera de ComfyUI.
- Uso previsto restringido: está pensado como componente interno de un pipeline de difusión, no como modelo de chat, agentes o VLM de propósito general.
- Fecha de creación futura en los metadatos (2026-11-05): conviene tratar las marcas temporales con cautela.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/maxh8086/tokenfrugal-qwen3vl-4b-fp8
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-FP8
- Modelo base sin cuantizar: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Proyecto relacionado citado en la model card: tokenfrugal-flux2-klein-4b-fp8 (no se proporciona URL en la información disponible)
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
