# dendriteholdings/Ingot-III-27B-FP8

## Resumen

Ingot-III-27B-FP8 es un modelo de lenguaje de 27.781.427.952 parametros (aproximadamente 27,8 mil millones) distribuido en formato FP8 por el usuario dendriteholdings en HuggingFace. No se trata de un modelo entrenado desde cero por ese autor: la propia model card lo describe como un espejo publico de un modelo ganador en Ingot, una subred de Bittensor en la que los mineros cuantizan un modelo maestro fijo y el validador corona la copia que permanece mas proxima al original. Los pesos publicados son la subida del minero, byte a byte.

El repositorio tiene un tamano de 30,9 GB, coherente con un modelo de 27,8B parametros almacenado a 1 byte por parametro mas los ficheros auxiliares. El unico tag de arquitectura declarado es qwen3_5, lo que situa el modelo base en la familia Qwen3.5, aunque no se ofrecen detalles sobre numero de capas, dimension del modelo, mecanismo de atencion ni longitud de contexto.

Su relevancia es doble: por un lado, documenta un caso real de cuantizacion competitiva descentralizada sobre Bittensor; por otro, sirve como ejemplo de artefacto con trazabilidad de origen (hotkey del minero y UUID de la submission) pero con informacion tecnica y legal practicamente ausente. No hay pipeline declarado, ni idiomas, ni licencia, ni benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (tag declarado: qwen3_5, familia Qwen3.5); detalles de capas y atencion no disponibles |
| Parametros totales | 27.781.427.952 (27,8B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (unica variante publicada en este repositorio); no se publican GGUF ni otras cuantizaciones |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 30,9 GB |
| Pipeline declarado | no disponible |
| Fecha de creacion | 2026-10-17 |
| Fecha de ultima actualizacion | 2026-10-17 |

## Arquitectura y entrenamiento

El repositorio solo declara el tag de arquitectura qwen3_5, lo que indica que el modelo maestro del que deriva pertenece a la familia Qwen3.5 y, por tanto, a una arquitectura transformer de tipo decoder-only. No se especifican numero de capas, dimension oculta, numero de cabezas de atencion, uso de atencion lineal o hibrida, ni si incorpora capas MoE. Tampoco se detalla la longitud de contexto soportada.

En cuanto al proceso, no hay entrenamiento desde cero ni ajuste supervisado documentado. Lo que describe la model card es un pipeline de cuantizacion post-entrenamiento (PTQ) dentro de la subred Ingot de Bittensor: existe un modelo maestro fijo (teacher), los mineros producen copias cuantizadas y el validador evalua cual de ellas se mantiene mas cerca del teacher, coronando la mejor. No se indica que se hayan aplicado tecnicas de RLHF, DPO ni fine-tuning adicional, ni se publican datos sobre el dataset de calibracion empleado en la cuantizacion ni sobre el numero de tokens usados. Los pesos publicados corresponden a la submission coronada identificada como 2006d9f7-a9a5-4337-a403-20ee348c949c, subida por el hotkey 5GYxaXdfJqaAULfLAr2QFRiYpohhma4uRczsGXcc8su2oyrF (uid 224).

## Capacidades

- Generacion de texto y razonamiento general: capacidades heredadas del modelo maestro Qwen3.5 subyacente, sin verificacion independiente publicada.
- Generacion de codigo y matematicas: previsible en un modelo de esta familia y tamano, pero no documentado en la informacion disponible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declara lista de idiomas.
- Vision, audio u otras modalidades: no disponible; el repositorio no declara componentes multimodales.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Ejecucion en FP8: el modelo esta publicado unicamente en precision FP8, lo que condiciona tanto el hardware compatible como la fidelidad numerica respecto al teacher.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion: el modelo es un artefacto util para reproducir y comparar metodos de cuantizacion FP8 frente al teacher original, midiendo divergencia de perplejidad y degradacion en tareas concretas.
- Investigacion sobre subredes Bittensor: sirve como caso de estudio de como se incentiva la fidelidad a un modelo maestro mediante validacion competitiva, con trazabilidad completa de minero y submission.
- Generacion de codigo en pipelines internos: un modelo denso de 27,8B es adecuado para autocompletado y refactorizacion en entornos con GPU de 40-80 GB, siempre que se verifiquen primero la licencia y el soporte real de tool calling.
- Asistencia tecnica y documentacion: redaccion de documentacion, resumenes de incidencias y respuestas sobre base de conocimiento interna, desplegado con vLLM o TGI en una GPU de clase profesional.
- Procesamiento por lotes de texto: clasificacion, extraccion de entidades y normalizacion de corpus a gran escala, aprovechando FP8 para reducir el coste por token en GPUs Hopper o Ada.
- Base para fine-tuning especifico de dominio: al ser un modelo denso de ~27,8B, admite LoRA o QLoRA sobre un dominio concreto (legal, sanitario, industrial) partiendo de los pesos FP8, previa verificacion de los terminos de uso.
- Despliegue en entornos con memoria limitada: cuantizaciones adicionales a 4 bits permitirian, en teoria, ejecucion en una sola GPU de 24 GB, aunque estas conversiones no estan publicadas y habria que generarlas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, ni tampoco la distancia o divergencia respecto al modelo maestro que le valio la victoria en la subred Ingot.

## Requisitos de hardware

- VRAM estimada para FP8: los pesos ocupan aproximadamente 27,8 GB (27,78B parametros a 1 byte), por lo que se necesita un minimo practico de 30-32 GB de VRAM, mas el espacio para cache KV, que depende de la longitud de contexto (no disponible) y del batch.
- GPU recomendadas para FP8 nativo: H100 (80 GB), H200, A100 (80 GB), L40S (48 GB), RTX 6000 Ada (48 GB) y MI300X. Las GPU Hopper y Ada Lovelace disponen de soporte FP8 en hardware; en arquitecturas anteriores la ejecucion en FP8 suele requerir conversion a bf16, lo que elevaria el requisito a unos 56 GB.
- Consumer GPU: no cabe en una RTX 4090 (24 GB) ni en una RTX 5090 (32 GB) en FP8 sin offloading; dos RTX 4090 con tensor parallelism si seria viable. Con cuantizacion adicional a 4 bits (no publicada) podria entrar en 24 GB.
- Opciones de despliegue: vLLM y SGLang con soporte FP8, TensorRT-LLM, Text Generation Inference. llama.cpp y Ollama quedan descartados salvo que se generen conversiones GGUF, que no existen en el repositorio.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo, TTFT ni comparativas de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Naturaleza |
|---|---|---|---|---|---|
| Ingot-III-27B-FP8 | 27,8B | no disponible | no disponible | safetensors FP8 | Cuantizacion derivada de un teacher Qwen3.5 |
| Qwen3-32B | ~32,8B | 128K (segun informacion publica de su model card) | Apache 2.0 (segun informacion publica) | safetensors, GGUF | Modelo entrenado y publicado oficialmente |
| Gemma 3 27B | ~27B | 128K (segun informacion publica de su model card) | Licencia Gemma (segun informacion publica) | safetensors, GGUF | Modelo entrenado y publicado oficialmente |
| Mistral Small 3.1 24B | ~24B | 128K (segun informacion publica de su model card) | Apache 2.0 (segun informacion publica) | safetensors, GGUF | Modelo entrenado y publicado oficialmente |

Nota: los datos de las filas comparativas provienen de informacion publica general sobre esos modelos y no de la busqueda web realizada, que no devolvio resultados tecnicos relevantes. Las celdas de Ingot-III marcadas como no disponibles reflejan la ausencia de datos en la model card. La diferencia fundamental es que Ingot-III no es un modelo entrenado de forma independiente, sino una copia cuantizada de un teacher, con licencia sin definir y sin cuantizaciones adicionales publicadas.

## Limitaciones y advertencias

- Licencia no especificada: al no declararse licencia, no puede asumirse permiso de uso comercial, redistribucion ni modificacion. Es un bloqueo critico para cualquier despliegue en produccion.
- Sesgos desconocidos: no hay evaluacion de sesgos ni documentacion sobre la composicion de datos del modelo maestro ni del conjunto de calibracion usado en la cuantizacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones de fidelidad factual ni tasas de alucinacion.
- Perdida de fidelidad por cuantizacion: el modelo es una copia FP8 de un teacher. Aunque el proceso de la subred selecciona la copia mas cercana al original, existe degradacion numerica inevitable respecto a los pesos completos, no cuantificada en la informacion disponible.
- Longitud de contexto desconocida: no se puede planificar el diseno de prompts ni la gestion de memoria de cache KV sin ese dato.
- Idiomas no declarados: se desconoce si el modelo mantiene el soporte multilingue del teacher o si la cuantizacion lo ha degradado en idiomas distintos del ingles.
- Trazabilidad limitada: se documenta la hotkey del minero y el UUID de la submission, pero no el metodo de cuantizacion, la version exacta del teacher ni los datos de calibracion.
- Cero adopcion verificable: el repositorio registra 0 descargas y 0 likes, por lo que no existe evidencia de uso en produccion ni de validacion por terceros.
- Repositorio de terceros: dendriteholdings publica un espejo de la subida de un minero; la responsabilidad sobre los pesos y su procedencia recae en el autor original de la submission.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dendriteholdings/Ingot-III-27B-FP8
- Model card del autor: incluida en la pagina de HuggingFace del modelo
- Subred Ingot (Bittensor): no se ha encontrado enlace en la informacion disponible
- Paper o documentacion tecnica del metodo de cuantizacion: no disponible
- Resultados de benchmarks o evaluaciones: no disponible
- Nota sobre la busqueda web: los resultados devueltos corresponden a paginas de Credit Agricole y no guardan relacion con el modelo; no se han localizado fuentes tecnicas adicionales.
