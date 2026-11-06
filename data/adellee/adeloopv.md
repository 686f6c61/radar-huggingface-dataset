# adellee/adeloopV

## Resumen

adeloopV es un modelo multimodal de tipo image-text-to-text publicado en Hugging Face por el usuario adellee (leeadel). El repositorio contiene pesos en formato safetensors con un total de 2.166.928.384 parametros (aproximadamente 2,17 mil millones), lo que lo situa en la categoria de modelos pequenos dentro del ecosistema multimodal. La etiqueta de arquitectura declarada es `lfm3_omni`, lo que sugiere una variante de la familia LFM (Liquid Foundation Models) orientada a modalidades mixtas, aunque no se dispone de documentacion oficial que lo confirme.

El modelo se distribuye con `custom_code`, es decir, requiere cargar codigo personalizado del repositorio para su ejecucion con transformers, y esta registrado bajo el pipeline `image-text-to-text`, lo que indica capacidad de procesar imagenes y texto de entrada para generar respuestas textuales. El tamano del repositorio es de 8,8 GB, coherente con pesos en precision alta (probablemente bf16 o fp32) para un modelo de este numero de parametros.

La relevancia de esta ficha es limitada desde el punto de vista practico: se trata de un modelo sin descargas, sin likes, sin model card sustantiva (la existente es la plantilla autogenerada por Hugging Face) y sin datos publicados de entrenamiento, licencia, idiomas o evaluacion. Cualquier evaluacion rigurosa debe tratar esta publicacion como un artefacto experimental o de investigacion temprana, no como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | lfm3_omni (etiqueta del autor; sin documentacion adicional) |
| Parametros totales | 2.166.928.384 (~2,17 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo pesos safetensors en el repo) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (con custom_code para transformers) |

## Arquitectura y entrenamiento

La unica informacion arquitectonica disponible es la etiqueta `lfm3_omni` incluida en los metadatos del repositorio, que apunta a la familia de modelos LFM de Liquid AI. El sufijo "omni" sugiere una variante multimodal que integra procesamiento de imagen y texto, coherente con el pipeline declarado `image-text-to-text`. No obstante, no se ha publicado ningun detalle sobre la composicion exacta de la arquitectura (si es un transformer denso, un hibrido con capas SSM, o un modelo con encoder visual separado), ni sobre el numero de capas, dimensiones ocultas, cabezas de atencion o vocabulario.

Respecto al entrenamiento, la model card es la plantilla autogenerada de Hugging Face y no contiene informacion sobre el volumen de tokens, la composicion del dataset, el uso de RLHF/DPO, ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. Tampoco se documenta el proceso de alineacion ni las fases de preentrenamiento y ajuste supervisado. Todo ello debe considerarse no disponible.

## Capacidades

- Generacion de texto a partir de entradas multimodales (imagen + texto), segun el pipeline `image-text-to-text` declarado.
- Procesamiento de imagenes: la etiqueta `lfm3_omni` y el pipeline implican un encoder visual, aunque no se detalla su resolucion ni el numero de tokens visuales por imagen.
- Conversacion multi-turno: la etiqueta `conversational` sugiere soporte de dialogos, sin datos sobre longitud efectiva de contexto.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, audio, video): no disponible.

## Casos de uso

- Prototipado de asistentes visuales: el modelo puede emplearse para experimentar con preguntas y respuestas sobre imagenes en entornos de investigacion, dado su pipeline image-text-to-text y su tamano contenido (~2,17 B), que permite iteracion rapida en una unica GPU.
- Investigacion academica sobre modelos multimodales pequenos: util como linea base para comparar tecnicas de fusion vision-lenguaje en modelos de menos de 3 B de parametros.
- Pruebas de concepto de captioning de imagenes: generacion de descripciones textuales de imagenes en demos internas, siempre que se valide la calidad de forma empirica.
- Evaluacion de la familia LFM3 omni: interes para quienes estudian las variantes de Liquid AI y quieran inspeccionar pesos y codigo personalizado.
- Fine-tuning experimental: al ser un modelo pequeno con safetensors, es viable ajustarlo en tareas visuales especificas (por ejemplo, clasificacion de imagenes medicas o industriales) con recursos modestos.
- Educacion y docencia: ejemplo practico de carga de un modelo con `custom_code` en transformers y de gestion de dependencias no estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,3 GB solo para pesos (2,17 B x 2 bytes), mas overhead de activaciones y KV cache; en la practica, entre 6 y 10 GB segun longitud de contexto y resolucion de imagen.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 2,2 GB para pesos; en 4 bits, alrededor de 1,1 GB, aunque no se distribuyen pesos cuantizados oficialmente y habria que generarlos.
- GPU recomendadas: RTX 4090 (24 GB), RTX 3090 (24 GB), A100 (40/80 GB) o H100 para mayor throughput; tambien cabe en GPUs consumer de 8-12 GB si se cuantiza.
- Compatibilidad con GPU consumer: si, previsiblemente en RTX 3060 12 GB, RTX 4060 Ti 16 GB y superiores, siempre que el codigo personalizado sea compatible con el stack instalado.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la via documentada por las etiquetas; no hay confirmacion de soporte en vLLM, llama.cpp, Ollama o TGI, y la presencia de `custom_code` complica la conversion a GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| adellee/adeloopV | ~2,17 B | no disponible | no disponible | si (image-text-to-text) | Hugging Face, 0 descargas |
| SmolVLM2 (familia) | ~2,2 B (variante 2.2B) | no disponible en esta ficha | no disponible | si (imagen y video) | Hugging Face, ampliamente descargado |
| MiniCPM-V 4.x (variante 1B) | ~1 B | no disponible en esta ficha | no disponible | si | Hugging Face, con versiones GGUF |

La comparacion se limita a modelos de tamano similar y naturaleza multimodal; no se dispone de datos de rendimiento de adeloopV para establecer una comparacion cuantitativa. SmolVLM2 y MiniCPM-V se citan por aparecer en la actividad publica del autor en Hugging Face, no como equivalentes funcionales confirmados.

## Limitaciones y advertencias

- Ausencia total de model card sustantiva: la existente es la plantilla autogenerada, sin informacion sobre entrenamiento, datos, evaluacion o uso previsto.
- Licencia no declarada: no es posible determinar si el uso comercial esta permitido; en la practica, esto bloquea su adopcion en produccion hasta aclaracion del autor.
- Idiomas no declarados: se desconoce la cobertura linguistica real y el rendimiento en castellano.
- Riesgo elevado de alucinacion y de errores en la descripcion de imagenes: sin datos de evaluacion ni de alineacion, no hay garantias de fidelidad.
- Dependencia de `custom_code`: la carga requiere `trust_remote_code=True`, lo que implica ejecutar codigo del autor y revisar su contenido antes de usarlo en entornos sensibles.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validacion externa; el modelo debe considerarse no probado.
- Fecha de creacion futura (2026-11-06) en los metadatos: conviene verificar la integridad y procedencia del repositorio.
- No hay pesos cuantizados oficiales ni soporte confirmado en motores de inferencia de alto rendimiento (vLLM, TGI, llama.cpp), lo que limita el despliegue escalable.

## Enlaces

- Repositorio del modelo: https://huggingface.co/adellee/adeloopV
- Perfil del autor en Hugging Face: https://huggingface.co/adellee
- Modelos del autor: https://huggingface.co/adellee/models
- Datasets del autor: https://huggingface.co/adellee/datasets
- Space relacionado (adeloop-vision): https://huggingface.co/adellee/adeloop-vision
- Paper citado en la model card (Lacoste et al., 2019): https://arxiv.org/abs/1910.09700
