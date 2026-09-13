# SOMEHOTMEAL/Qwen3.5-9B-Janus-Abliterated-V2-Base_And_GGUF

## Resumen

Qwen3.5-9B-Janus-Abliterated-V2 es un modelo de lenguaje obtenido mediante fusión de pesos (merge) por el usuario SOMEHOTMEAL, publicado en HuggingFace el 13 de septiembre de 2026. No se trata de un entrenamiento desde cero, sino de una combinación de dos modelos preexistentes: Qwen/Qwen3.5-9B y huihui-ai/Huihui-Qwen3.5-9B-abliterated, este último una variante del primero con el alineamiento de seguridad (refusals) atenuado mediante técnicas de abliteration. El repositorio tiene 0 descargas y 1 like en el momento de la consulta.

El modelo declara 9.161.548.800 parametros reales (aproximadamente 9,16 mil millones) y esta etiquetado con el pipeline image-text-to-text, ademas de los tags qwen3_5, conversational, mergekit y merge. El nombre incluye la palabra "Janus", que en la familia Qwen hace referencia a arquitecturas multimodales, pero la configuracion de merge publicada solo menciona los dos modelos de texto anteriores, por lo que la capacidad multimodal real no queda confirmada en la informacion disponible.

Su relevancia es limitada y muy especifica: se trata de un merge experimental sin model card descriptiva, sin licencia declarada, sin idiomas declarados y sin resultados de benchmarks. Su interes principal reside en que combina una ventana de contexto y unas capacidades heredadas de la familia Qwen3.5 con un alineamiento de seguridad reducido, algo que solo tiene sentido para investigacion sobre comportamiento de modelos o para casos donde los rechazos del modelo base resulten un obstaculo, asumiendo los riesgos asociados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (familia Qwen3.5); detalles concretos no disponibles |
| Parametros totales | 9.161.548.800 (9,16 B) |
| Parametros activos | no disponible (no hay evidencia de que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (el repositorio incluye archivos GGUF; los niveles concretos no estan detallados); safetensors en bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors y GGUF |
| Metodo de merge | SLERP, t = 0.60, dtype bfloat16, tokenizer_source: base |
| Rango de capas fusionado | layer_range [0, 32] |
| Tamano del repositorio | 62,6 GB |
| Fecha de publicacion | 13 de septiembre de 2026 |

## Arquitectura y entrenamiento

No hay informacion sobre la arquitectura interna mas alla de la derivada de sus modelos padre. La configuracion YAML publicada indica un merge SLERP sobre el rango de capas [0, 32] de ambos modelos, con un parametro t de 0.60, lo que significa que el resultado pondera aproximadamente un 60 % hacia el modelo B (Huihui-Qwen3.5-9B-abliterated) y un 40 % hacia el modelo A (Qwen/Qwen3.5-9B). El tokenizer se toma del modelo base declarado. El dtype del merge es bfloat16.

El bloque YAML incluye, comentadas, dos reglas de renombrado de claves (`["text_model.model.", "model."]` y `["text_model.", ""]`) pensadas para fusionar modelos con prefijos de tipo Janus/VL. Estas lineas estan desactivadas en la configuracion final, lo que sugiere que el autor partia de una plantilla generica y que el merge efectivo se hizo entre dos modelos de texto. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni sobre si hubo RLHF, DPO u otras fases de alineamiento en los modelos de origen.

## Capacidades

La model card no documenta capacidades de forma explicita. Lo que se puede afirmar a partir de los metadatos es lo siguiente:

- Generacion de texto conversacional: el tag `conversational` indica que el modelo esta orientado a dialogos multi-turno.
- Capacidad multimodal potencial: el pipeline declarado es `image-text-to-text`, lo que implicaria entrada de imagen y texto. No obstante, la configuracion de merge publicada no incluye ningun modelo de vision, por lo que esta capacidad no esta verificada.
- Herencia de la familia Qwen3.5: razonamiento, generacion de codigo, matematicas y soporte multilingue son capacidades habituales de esta familia, pero no estan confirmadas en este merge concreto.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Modo de pensamiento explicito (thinking mode): no disponible.
- Idiomas concretos: no disponible.

## Casos de uso

Dado que no hay benchmarks ni documentacion de capacidades, los casos siguientes son escenarios plausibles segun el perfil del modelo, no aplicaciones validadas.

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar como varia la tasa de rechazo ante peticiones sensibles al fusionar un modelo abliterado con su version original, comparando las respuestas de ambos con el mismo prompt.
- Evaluacion de tecnicas de merge: sirve como caso de estudio de SLERP con t = 0.60 sobre modelos de ~9 B, para medir la degradacion o mejora de coherencia respecto a los modelos padre.
- Generacion de texto conversacional en local: con los GGUF del repositorio puede desplegarse en una estacion de trabajo con GPU de consumo para prototipos de chat, siempre que no se requiera una licencia comercial clara.
- Destilacion o generacion de datos sinteticos: un modelo de 9 B sin filtros estrictos de rechazo puede emplearse para generar datasets diversos en tareas de investigacion, asumiendo revision posterior.
- Base para ajuste fino posterior: al ser un modelo pequeno y con pesos en safetensors, es viable aplicarle LoRA o QLoRA sobre dominios concretos.
- Analisis comparativo de robustez: permite contrastar si la fusion introduce alucinaciones adicionales respecto al Qwen3.5-9B original en tareas de preguntas y respuestas factuales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion alguna (MMLU, HumanEval, GSM8K ni similares), y la model card se limita a describir la configuracion del merge. Tampoco hay datos de latencia o throughput medidos.

## Requisitos de hardware

Los valores de VRAM son estimaciones calculadas a partir de los 9,16 B de parametros; no proceden de mediciones publicadas por el autor.

- Pesos en bfloat16: en torno a 18,3 GB solo para los pesos, mas overhead de activaciones y cache KV, lo que situa el requisito practico en 20-24 GB de VRAM.
- GGUF Q8_0: aproximadamente 9,7 GB de pesos.
- GGUF Q6_K: aproximadamente 7,6 GB.
- GGUF Q5_K_M: aproximadamente 6,5 GB.
- GGUF Q4_K_M: aproximadamente 5,5 GB.
- GGUF Q3_K_M: aproximadamente 4,5 GB.
- GGUF Q2_K: aproximadamente 3,0 GB, con perdida de calidad apreciable.
- GPU recomendadas: para bfloat16 completo, A100 40 GB, H100 80 GB o RTX 4090 24 GB (esta ultima al limite). Para cuantizaciones Q4 o Q5, tarjetas con 8-12 GB como RTX 3060 12 GB, RTX 4070 o RTX 4060 Ti 16 GB.
- Cabe en GPU de consumo: si, en cuantizaciones Q4_K_M o inferiores sobre GPUs de 8 GB o mas.
- Opciones de despliegue: llama.cpp y Ollama para los GGUF; vLLM o TGI para los safetensors en bfloat16; transformers como libreria base declarada.
- Latencia y throughput: no disponible.
- Nota de almacenamiento: el repositorio ocupa 62,6 GB, por lo que conviene descargar solo el archivo de cuantizacion necesario en lugar del repositorio completo.

## Comparativa con modelos similares

La comparacion se limita a los dos modelos de los que deriva, ya que no hay datos de rendimiento de terceros en la informacion disponible.

| Modelo | Parametros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Qwen3.5-9B-Janus-Abliterated-V2 | 9,16 B | no disponible | no disponible | Merge SLERP, 0 descargas |
| Qwen/Qwen3.5-9B | no disponible | no disponible | no disponible | Modelo base original, con alineamiento completo |
| huihui-ai/Huihui-Qwen3.5-9B-abliterated | no disponible | no disponible | no disponible | Variante abliterada, sin refusals |

No se dispone de datos de rendimiento comparado entre los tres, por lo que no es posible determinar si el merge mejora, iguala o degrada a sus componentes.

## Limitaciones y advertencias

- Ausencia de licencia: el repositorio no declara licencia, lo que impide determinar si el uso comercial esta permitido. En la practica, esto lo inhabilita para produccion sin aclaracion previa del autor.
- Alineamiento degradado: al derivar de un modelo abliterated, es previsible que las barreras de rechazo ante peticiones daninas esten atenuadas. No debe desplegarse en aplicaciones de cara al publico sin filtros externos.
- Riesgo de alucinacion: no hay evaluacion de factualidad. Los merges SLERP pueden degradar la coherencia respecto a los modelos originales, especialmente con temperaturas altas.
- Idiomas no declarados: se desconoce el soporte real de castellano u otras lenguas distintas del ingles.
- Longitud de contexto desconocida: no se puede planificar el uso con documentos largos.
- Capacidad multimodal incierta: pese al pipeline `image-text-to-text`, la configuracion de merge no incorpora ningun modulo de vision, por lo que el etiquetado puede ser incorrecto.
- Madurez y soporte: 0 descargas, 1 like, publicado y actualizado el mismo dia. No hay comunidad, issues ni mantenimiento constatables.
- Trazabilidad: el autor no publica evaluaciones ni detalles del proceso mas alla del YAML de mergekit.
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los resultados obtenidos no guardan relacion con el tema y no se han utilizado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SOMEHOTMEAL/Qwen3.5-9B-Janus-Abliterated-V2-Base_And_GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.5-9B
- Variante abliterada: https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Herramienta de merge empleada: https://github.com/cg123/mergekit
- Referencia del metodo SLERP: https://en.wikipedia.org/wiki/Slerp
- Paper, blog o demo especificos de este modelo: no disponible
- Resultados adicionales relevantes en la busqueda web: no disponible (la busqueda no devolvio enlaces relacionados con el modelo)
