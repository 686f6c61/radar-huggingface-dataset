# cbrigance/google-gemma-4-31B-it-heretic-v2

## Resumen

cbrigance/google-gemma-4-31B-it-heretic-v2 es una variante "heretic" (abliterated) del modelo google/gemma-4-31b-it, publicada por el usuario cbrigance en Hugging Face. Se trata de un ajuste del modelo base orientado a eliminar o atenuar los mecanismos de rechazo y las capas de alineacion de seguridad, una practica conocida como abliteration que modifica los pesos para suprimir la direccion de activacion asociada a la negativa a responder. El resultado es un modelo multimodal de tipo image-text-to-text con 31.273.086.512 parametros (aproximadamente 31,3 mil millones) en formato safetensors.

El modelo hereda la arquitectura y las capacidades del Gemma 4 de Google, incluyendo generacion de texto, conversacion y procesamiento de imagenes, pero con la capa de seguridad del modelo original alterada. La ficha tecnica oficial es muy escasa: el autor no publica detalles sobre el proceso de abliteration, los datos usados, ni resultados de evaluacion. El repositorio ocupa 62,6 GB y esta sujeto a acceso restringido (gated), por lo que es necesario aceptar condiciones en Hugging Face antes de descargarlo.

Su relevancia es limitada y de nicho: interesa a investigadores que estudian el comportamiento de los modelos tras la abliteration y a desarrolladores que necesitan un modelo sin filtros de rechazo para tareas de generacion creativa o analisis de contenido sensible. No obstante, la falta de documentacion, la ausencia de benchmarks y la modificacion de las salvaguardas lo convierten en una opcion poco recomendable para entornos de produccion sin una evaluacion previa exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de google/gemma-4-31b-it; detalles internos no disponibles |
| Parametros totales | 31.273.086.512 (aprox. 31,3 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni otras variantes) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 62,6 GB |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Modelo base | google/gemma-4-31b-it |
| Fecha de publicacion | 2026-11-14 |

## Arquitectura y entrenamiento

El modelo se basa en google/gemma-4-31b-it, un transformer multimodal de la familia Gemma 4 de Google que procesa entradas de imagen y texto y genera texto. La informacion disponible no detalla la arquitectura interna del modelo base (numero de capas, dimension del hidden state, mecanismo de atencion, codificador visual), por lo que esos datos deben consultarse en la ficha oficial de google/gemma-4-31b-it.

Sobre el proceso de creacion de esta variante, el autor no documenta la tecnica de abliteration aplicada: no se especifica si se uso una direccion de rechazo calculada a partir de un conjunto de prompts, si se modificaron capas concretas, ni que hiperparametros se emplearon. Tampoco se indica si hubo entrenamiento adicional, fine-tuning o RLHF/DPO posterior. La unica informacion tecnica verificable es el numero de parametros (31.273.086.512) y el tamano del repositorio (62,6 GB), coherente con pesos en precision de 16 bits. No hay datos sobre el corpus de entrenamiento ni sobre innovaciones tecnicas adicionales.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Gemma 4.
- Procesamiento de imagen y texto (pipeline image-text-to-text): el modelo puede recibir imagenes junto con instrucciones textuales.
- Razonamiento y respuesta a preguntas en ingles.
- Comportamiento "abliterated": se espera que suprima o reduzca las negativas a responder ante peticiones que el modelo original rechazaria, aunque no hay evaluacion publicada que lo confirme.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma del repositorio.
- Capacidades especiales (modo thinking, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre abliteration y seguridad: comparar las respuestas de esta variante con las de google/gemma-4-31b-it para estudiar como cambia el comportamiento del modelo al eliminar la direccion de rechazo, midiendo tasas de cumplimiento y coherencia.
- Generacion creativa sin filtros: redaccion de ficcion, guiones o narrativa que aborde temas sensibles y que el modelo base rechazaria; el modelo conserva la capacidad de generacion de texto del Gemma 4 original.
- Analisis de contenido para moderacion: usar el modelo como clasificador de textos o imagenes potencialmente problematicos en un pipeline de revision, aprovechando su naturaleza multimodal.
- Procesamiento de documentos con imagenes: extraccion de informacion de capturas, formularios o graficos combinando entrada visual y textual, gracias a la herencia del pipeline image-text-to-text.
- Experimentacion en entornos controlados: pruebas de robustez y evaluacion de sesgos en modelos abliterated dentro de un laboratorio, sin exposicion a usuarios finales.
- Prototipado de asistentes conversacionales en ingles: desarrollo de demos de chat con contexto multimodal, siempre que se asuma la ausencia de salvaguardas y se anada una capa de moderacion externa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones de seguridad, y tampoco se ofrecen comparaciones con el modelo base.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 62,6 GB solo para los pesos, mas memoria para el KV cache y activaciones; en la practica se necesitan 70-80 GB o mas.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU (por ejemplo, 2x RTX 4090 de 24 GB con tensor parallelism, aunque con limitaciones de memoria).
- Compatibilidad con GPU de consumo: no cabe en una sola RTX 4090 (24 GB) en precision completa; requeriria cuantizacion, pero el repositorio no ofrece variantes GGUF ni cuantizadas oficiales.
- Opciones de despliegue: transformers (libreria declarada); vLLM, TGI, llama.cpp u Ollama no estan confirmados para este repositorio concreto.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| cbrigance/google-gemma-4-31B-it-heretic-v2 | 31,3 B | no disponible | apache-2.0 | Variante abliterated, acceso gated, solo ingles |
| google/gemma-4-31b-it | no disponible en la informacion | no disponible | no disponible en la informacion | Modelo base oficial, con salvaguardas intactas |
| Otras variantes abliterated de Gemma | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

La comparacion cuantitativa con alternativas no es posible con los datos disponibles; se recomienda consultar la ficha oficial de google/gemma-4-31b-it para los valores del modelo base.

## Limitaciones y advertencias

- La abliteration elimina o reduce las salvaguardas del modelo original: puede generar contenido ofensivo, peligroso o inapropiado, y no debe exponerse directamente a usuarios finales sin moderacion externa.
- Riesgo elevado de alucinacion y de respuestas no verificadas, agravado por la ausencia de evaluacion publicada.
- Documentacion tecnica practicamente inexistente: no se detalla el metodo de abliteration, los datos ni los hiperparametros, lo que impide reproducir el proceso.
- Soporte limitado al ingles; no se garantiza un rendimiento adecuado en castellano ni en otros idiomas.
- Acceso restringido (gated): es necesario aceptar condiciones en Hugging Face, lo que anade friccion para su uso en pipelines automatizados.
- Licencia apache-2.0 declarada, pero al derivar de un modelo de Google conviene verificar los terminos de uso del modelo base antes de un despliegue comercial.
- Sin variantes cuantizadas oficiales (GGUF, AWQ, GPTQ), lo que dificulta el despliegue en hardware de consumo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin evidencia de validacion por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/cbrigance/google-gemma-4-31B-it-heretic-v2
- Modelo base: https://huggingface.co/google/gemma-4-31b-it
- Paper referenciado en las etiquetas (arxiv:2406.11717): https://arxiv.org/abs/2406.11717
