# LnsTchTps/zeta-2.1-NVFP4

## Resumen

`LnsTchTps/zeta-2.1-NVFP4` es una cuantización en formato NVFP4 del modelo `zed-industries/zeta-2.1`, realizada por el autor `LnsTchTps` mediante la herramienta LLM Compressor. El modelo base es un transformer de lenguaje generativo desarrollado por Zed Industries, con arquitectura basada en Llama según los metadatos del repositorio. El objetivo de esta versión cuantizada es reducir el coste de inferencia y el consumo de memoria, manteniendo un tamaño total de 6,5 GB en disco, lo que permite ejecutarlo en GPUs con VRAM moderada.

El modelo tiene aproximadamente 5.197 millones de parámetros (5,2 mil millones), y está pensado para tareas de generación de texto en inglés, con especial orientación hacia la predicción de ediciones y la sugerencia de la siguiente edición, como reflejan sus etiquetas `edit-prediction` y `next-edit-suggestion`. Al ser una cuantización post-entrenamiento, no se han publicado datos de contexto ni de rendimiento en benchmarks, por lo que su evaluación debe basarse en pruebas propias. Su relevancia actual radica en la posibilidad de desplegar un modelo de 5 mil millones de parámetros en infraestructura de gama media gracias a la compresión NVFP4, una técnica de NVIDIA de 4 bits con punto flotante.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en Llama) |
| Parametros totales | 5.197.009.344 (5,2 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, compresión post-entrenamiento con LLM Compressor) |
| Idiomas soportados | Inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (NVFP4) |

## Arquitectura y entrenamiento

El modelo es una cuantización directa de `zed-industries/zeta-2.1`, un modelo de lenguaje de aproximadamente 5,2 mil millones de parámetros. Los metadatos indican arquitectura tipo Llama y compatibilidad con `transformers` y `text-generation-inference`. La cuantización se realizó con `LLM Compressor` de vLLM, aplicando el formato NVFP4, que utiliza representación de punto flotante de 4 bits con escalado por canal. Al tratarse de una compresión post-entrenamiento, no hay un proceso de entrenamiento adicional: se conservan los pesos del modelo base y se reduce su precisión para optimizar memoria y velocidad de inferencia.

No se han proporcionado datos sobre la composición del dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. Las etiquetas del repositorio sugieren que el modelo base está orientado a tareas de predicción de ediciones y sugerencia de la siguiente edición, aunque no se detalla el proceso de entrenamiento específico.

## Capacidades

- Generación de texto en inglés: el modelo es capaz de producir y continuar texto, al ser un modelo de lenguaje base.
- Predicción de ediciones: según las etiquetas `edit-prediction` y `next-edit-suggestion`, el modelo está orientado a anticipar cambios en un documento o sugerir la siguiente edición.
- Compatibilidad con frameworks de inferencia: se integra con `transformers`, `text-generation-inference` y herramientas compatibles con `safetensors`.
- No se ha documentado soporte de tool calling, function calling, visión, audio, ni modos de razonamiento extendido.
- No se ha documentado capacidad de uso como agente con razonamiento multi-paso.

## Casos de uso

- Asistente de edición en procesadores de texto: el modelo puede integrarse en un editor para predecir la siguiente edición o sugerir correcciones en documentos en inglés. Gracias a la etiqueta `next-edit-suggestion`, es adecuado para sistemas que asisten al usuario durante la redacción.
- Autocompletado de código en entornos de desarrollo: al ser una variante de arquitectura Llama, puede usarse para completar fragmentos de código en IDEs, siempre que se evalúe su calidad en el lenguaje de programación objetivo.
- Despliegue de chatbots en una sola GPU: con un tamaño de repositorio de 6,5 GB, el modelo puede ejecutarse en una GPU de consumo como una RTX 3090, lo que permite implementar asistentes conversacionales en inglés sin necesidad de infraestructura de gran escala.
- Prototipado de aplicaciones de NLP: su tamaño moderado y su formato comprimido lo hacen útil para experimentar con generación de texto, resúmenes o extracción de información en entornos de investigación.
- Análisis de documentos técnicos: puede procesar textos en inglés para generar resúmenes o identificar entidades, aunque es recomendable validar la salida antes de usarla en producción.
- Evaluación de técnicas de cuantización: este modelo sirve como referencia para comparar el rendimiento de NVFP4 frente a otros formatos de compresión (FP8, INT4, GGUF) en modelos de aproximadamente 5 mil millones de parámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos en safetensors ocupan aproximadamente 6,5 GB. Para inferencia con activaciones y KV cache, se recomienda al menos 10-12 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3090, RTX 4090, A100 o H100. En GPUs de consumo, una RTX 3060 de 12 GB puede ser suficiente para secuencias cortas.
- Opciones de despliegue: vLLM, text-generation-inference, Transformers, y llama.cpp si se convierte previamente a formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| zed-industries/zeta-2.1 | 5,2 mil millones | Original (sin cuantizar) | safetensors | Apache 2.0 | no disponible |
| LnsTchTps/zeta-2.1-NVFP4 | 5,2 mil millones | NVFP4 | safetensors | Apache 2.0 | no disponible |
| distaste447/zeta-2.1-NVFP-GGUF | 5,2 mil millones | NVFP4 | GGUF | Apache 2.0 | no disponible |

No se dispone de datos de benchmarks para ninguno de estos modelos, por lo que la comparación se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible.
- Riesgo de alucinación: no evaluado; al ser un modelo base, puede generar contenido plausible pero incorrecto.
- Limitaciones de contexto o idioma: solo se ha declarado soporte para inglés; la longitud de contexto no se ha especificado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero es recomendable revisar la licencia del modelo base `zed-industries/zeta-2.1`, que también aparece como Apache 2.0 en los metadatos.
- Caveat para producción: la cuantización NVFP4 puede degradar ligeramente la precisión en tareas complejas; se recomienda validar el modelo con datos propios antes de desplegarlo en entornos críticos.

## Enlaces

- https://huggingface.co/LnsTchTps/zeta-2.1-NVFP4
- https://huggingface.co/zed-industries/zeta-2.1
- https://huggingface.co/distaste447/zeta-2.1-NVFP-GGUF
- https://github.com/vllm-project/llm-compressor
