# onocloud/onoai-onyx-2.5-pro

## Resumen

OnoAI Onyx 2.5 Pro es un ajuste fino (fine-tune) del modelo multimodal Qwen2.5-VL-7B-Instruct, publicado por el usuario onocloud en Hugging Face. El modelo base sobre el que se ha entrenado es la version cuantizada a 4 bits de Unsloth (unsloth/Qwen2.5-VL-7B-Instruct-bnb-4bit), lo que condiciona tanto el proceso de entrenamiento como las caracteristicas finales de los pesos publicados.

El repositorio contiene 8.292.166.656 parametros en formato safetensors (16,6 GB), heredando la arquitectura Qwen2.5-VL: un transformer multimodal capaz de procesar entradas de imagen y texto para generar respuestas textuales. El pipeline declarado es image-text-to-text y la libreria de referencia es transformers.

La model card es extremadamente escueta: no documenta el dataset de ajuste fino, el numero de tokens de entrenamiento, ni resultados de evaluacion. Se indica unicamente que el entrenamiento se realizo con Unsloth y TRL, y que la licencia es Apache 2.0. El modelo declara soporte exclusivo del ingles y cuenta con cero descargas y cero likes en el momento de redaccion de esta ficha, lo que lo situa como un experimento de publicacion reciente y sin validacion comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2.5-VL (transformer multimodal image-text-to-text) |
| Parametros totales | 8.292.166.656 (~8,3 mil millones) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Qwen2.5-VL-7B-Instruct soporta contexto largo, pero la model card no lo confirma para este fine-tune) |
| Tipos de cuantizacion | pesos publicados en safetensors; el modelo base era bnb-4bit (bitsandbytes 4 bits); no se documentan otras cuantizaciones del fine-tune |
| Idiomas soportados | en (segun la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Qwen2.5-VL, un transformer multimodal que combina un codificador visual con un decoder de lenguaje, disenado para tareas de image-text-to-text. El pipeline declarado y la libreria transformers confirman esta naturaleza. El ajuste fino parte de la variante cuantizada a 4 bits de Unsloth del Qwen2.5-VL-7B-Instruct, lo que implica que el proceso de entrenamiento se realizo sobre pesos comprimidos con bitsandbytes.

La model card no aporta informacion sobre el dataset utilizado, el volumen de tokens de entrenamiento, la composicion de los datos, ni si se aplicaron tecnicas de RLHF, DPO o similar. Se menciona unicamente que el entrenamiento se ejecuto con Unsloth y la libreria TRL de Hugging Face, lo que sugiere un flujo de ajuste fino supervisado (SFT) con optimizaciones de memoria y velocidad propias de Unsloth. No se documentan innovaciones tecnicas adicionales ni detalles sobre decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y respuestas conversacionales multi-turno, heredadas del modelo base Qwen2.5-VL-7B-Instruct.
- Procesamiento de entradas de imagen junto con texto (image-text-to-text), segun el pipeline declarado.
- Razonamiento y comprension de contenido visual, en la medida en que lo permite el modelo base.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para este fine-tune concreto.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la model card (aunque el modelo base Qwen2.5-VL soporta multiples idiomas, este fine-tune declara solo en).
- Capacidades especiales (thinking mode, audio, etc.): no disponible en la informacion proporcionada.

## Casos de uso

- Descripcion y analisis de imagenes en ingles: el modelo puede recibir una imagen y generar una descripcion textual o responder preguntas sobre su contenido, gracias a la arquitectura multimodal heredada de Qwen2.5-VL.
- Asistencia conversacional multimodal: integrable en interfaces de chat donde el usuario adjunta imagenes y espera respuestas textuales coherentes en ingles.
- Extraccion de informacion de documentos escaneados: util para convertir capturas o digitalizaciones en texto estructurado, siempre que el ajuste fino haya preservado las capacidades OCR del base.
- Prototipado rapido de aplicaciones vision-lenguaje: al estar en formato safetensors y cargarse con transformers, permite experimentar con pipelines image-text-to-text en entornos de investigacion.
- Generacion de respuestas sobre capturas de pantalla o interfaces: adecuado para tareas de accesibilidad o asistencia tecnica guiada por imagen.
- Base para nuevos ajustes finos: al publicarse con licencia Apache 2.0, puede servir como punto de partida para fine-tunes especificos en dominios concretos.
- Evaluacion comparativa de fine-tunes sobre Qwen2.5-VL: util en entornos de investigacion para medir el impacto de ajustes sobre la variante cuantizada de Unsloth.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de ~8,3 mil millones de parametros, en precision completa (fp16/bf16) requeriria aproximadamente 16-17 GB de VRAM solo para los pesos; en cuantizacion de 4 bits se reduciria a unos 5-6 GB, aunque la model card no documenta cuantizaciones del fine-tune.
- GPU recomendadas: para fp16, GPUs con 24 GB o mas (RTX 4090, A10G, L4 con margen limitado, A100 40/80 GB, H100). Para cuantizacion 4 bits, GPUs consumer de 8-12 GB podrian ser suficientes para los pesos, con margen adicional para el contexto.
- Cabe en consumer GPU: si, en cuantizaciones de 4 bits sobre GPUs de 8 GB o mas; en fp16 requiere al menos 24 GB.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag presente), y potencialmente llama.cpp/Ollama si se generan GGUF a partir de los pesos (no documentado). vLLM no esta confirmado en la informacion proporcionada.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| onocloud/onoai-onyx-2.5-pro | ~8,3 mil millones | no disponible | apache-2.0 | Hugging Face, 0 descargas |
| Qwen2.5-VL-7B-Instruct (base oficial) | ~8,3 mil millones | no disponible en esta ficha (modelo base oficial) | apache-2.0 | Hugging Face, ampliamente validado |
| unsloth/Qwen2.5-VL-7B-Instruct-bnb-4bit | ~8,3 mil millones (4 bits) | no disponible | apache-2.0 | Hugging Face, modelo base del fine-tune |

El comparativo mas directo es el modelo base oficial Qwen2.5-VL-7B-Instruct, del que este fine-tune hereda arquitectura y licencia, pero del que no se documentan mejoras medibles. La variante de Unsloth en 4 bits es el punto de partida exacto del entrenamiento. No se dispone de datos de rendimiento para establecer comparaciones cuantitativas con alternativas de la misma categoria.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la model card; al heredar de Qwen2.5-VL, puede arrastrar sesgos del corpus original de entrenamiento.
- Riesgo de alucinacion: no cuantificado; sin benchmarks publicados, no hay evidencia sobre la fiabilidad de las respuestas.
- Limitaciones de contexto o idioma: la model card declara exclusivamente ingles, lo que restringe su uso en castellano u otros idiomas. No se documenta la longitud de contexto efectiva del fine-tune.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen2.5-VL y de la variante Unsloth antes de desplegar en produccion.
- Caveat de produccion: cero descargas y cero likes implican ausencia de validacion comunitaria; no hay evidencia de calidad del ajuste fino ni de que las capacidades del base se hayan preservado.
- Entrenamiento sobre pesos cuantizados a 4 bits: puede introducir degradaciones respecto al modelo base en tareas sensibles a precision numerica.
- Ausencia de documentacion sobre dataset y proceso de entrenamiento: dificulta la reproducibilidad y la evaluacion de riesgos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onocloud/onoai-onyx-2.5-pro
- Modelo base en Hugging Face: https://huggingface.co/unsloth/Qwen2.5-VL-7B-Instruct-bnb-4bit
- Repositorio Unsloth: https://github.com/unslothai/unsloth
- Libreria TRL de Hugging Face: no disponible enlace directo en la informacion proporcionada (referenciada en la model card)
