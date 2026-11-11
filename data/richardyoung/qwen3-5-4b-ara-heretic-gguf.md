# richardyoung/Qwen3.5-4B-ARA-heretic-GGUF

## Resumen

Qwen3.5-4B-ARA-heretic-GGUF es la distribucion en formato GGUF del modelo richardyoung/Qwen3.5-4B-ARA-heretic, una version "abliterada" (con el comportamiento de rechazo eliminado) del modelo base Qwen/Qwen3.5-4B. La ablacion se realizo con Heretic 2.0 y su metodo Arbitrary-Rank Ablation (ARA), una tecnica de optimizacion que busca direcciones de rechazo en el espacio de activaciones y las proyecta fuera de los pesos. El resultado es un modelo que responde a un conjunto amplio de peticiones que el original rechaza, manteniendo una divergencia de distribucion relativamente baja respecto al modelo de partida.

El modelo cuenta con 4.205.751.296 parametros (aproximadamente 4,2 mil millones) y esta publicado bajo licencia Apache 2.0. Esta version GGUF incluye cuantizaciones Q4_K_M (2,7 GB) y Q8_0 (4,5 GB), ademas de una matriz de importancia para las cuantizaciones que la utilizan, y esta pensada para ejecutarse con llama.cpp y Ollama en hardware de consumo.

La relevancia de esta ficha es doble: por un lado, documenta un artefacto practico de despliegue local; por otro, es uno de los modelos evaluados en el estudio de Richard J. Young sobre la dificultad creciente de la abliteracion en modelos open-weight recientes. El autor declara explicitamente que la publicacion es material de investigacion sobre eliminacion de rechazo y su medicion, no un asistente de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B; detalles de atencion y capas no disponibles en la informacion proporcionada) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 B) |
| Parametros activos | No aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (publicadas); IQ3_M, IQ4_XS, Q5_K_M, Q6_K anunciadas como en preparacion |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,2 mil millones de parametros. Sobre esa base, el autor aplico Heretic 2.0 con Arbitrary-Rank Ablation (ARA), un procedimiento de optimizacion que busca una ablacion de rango arbitrario en lugar de una unica direccion de rechazo. La busqueda se realizo sobre 100 trials con una regla de seleccion concreta: minimizar el numero de rechazos por palabra clave en los prompts de ajuste sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1. El trial seleccionado produjo 6 rechazos por palabra clave en los 100 prompts de ajuste y una KL de primer token de 0,064.

Los datos de entrenamiento originales de Qwen3.5-4B (numero de tokens, composicion del corpus, si hubo RLHF o DPO) no se detallan en la informacion proporcionada. La ablacion en si no es un reentrenamiento: modifica los pesos del modelo original para eliminar direcciones de activacion asociadas al rechazo. Los ficheros GGUF se generaron con llama.cpp (commit `468fde9`) mediante `convert_hf_to_gguf.py --outtype bf16` seguido de `llama-quantize` en CPU, partiendo de la revision `4f5af3dc2de5` del modelo safetensors, con verificacion SHA-256 de cada fichero de pesos. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una matriz de importancia calculada sobre el build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estaticas.

## Capacidades

- Generacion de texto conversacional en ingles, con pipeline `text-generation`.
- Respuesta a un conjunto amplio de peticiones que el modelo original rechaza: el rechazo medido con juez WildGuard sobre 972 prompts daninos reservados cae del 88,5 % en el original al 18,9 % (184/972) en el modelo de precision completa.
- Capacidad multimodal de vision presente en el modelo base, pero no incluida en esta distribucion GGUF: el proyector de vision no se ha empaquetado y el estudio uso los modelos solo con texto.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: solo se declara ingles.
- Modo "thinking" u otras capacidades especiales: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre eliminacion de rechazo: el modelo sirve como sujeto de estudio para medir la eficacia de tecnicas de abliteracion, comparar metodos (ARA frente a ablaciones de rango 1) y calibrar jueces automaticos de rechazo sobre un modelo de 4 B ejecutable en local.
- Evaluacion de defensas frente a jailbreaks: al disponer de una version con rechazo suprimido y de su original, permite medir la robustez de clasificadores de seguridad y de filtros de salida frente a un modelo que ya no rechaza por si mismo.
- Despliegue local ligero con Ollama: el fichero Q4_K_M (2,7 GB) se ejecuta con `ollama run richardyoung/qwen3.5-4b-ara-heretic`, lo que facilita prototipos en estaciones de trabajo sin GPU dedicada.
- Pruebas de integracion en pipelines llama.cpp: el formato GGUF y las sumas SHA-256 permiten incorporar el modelo a tests de regresion de inferencia y a validaciones de reproducibilidad de cuantizaciones.
- Analisis de degradacion por cuantizacion: al publicar Q4_K_M y Q8_0 junto con la matriz de importancia, es posible estudiar como cambia el comportamiento (incluido el de rechazo) entre cuantizaciones, advertencia que el propio autor senala.
- Experimentos de alineacion y calibracion: util como linea base "sin rechazo" en estudios sobre constituciones, filtros y taxonomias de dano, comparando respuestas frente al modelo Qwen original.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible corresponden al modelo de precision completa (bf16), no a los ficheros GGUF, que el autor indica que no fueron evaluados en el paper.

| Metrica | Original (Qwen3.5-4B) | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts daninos reservados (juez WildGuard) | 88,5 % | 18,9 % (184/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (trial seleccionado) | No disponible | 6 |
| Divergencia KL de primer token respecto al original (trial seleccionado) | No disponible | 0,064 |

No se han publicado resultados de benchmarks de capacidad general (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 3 GB para Q4_K_M (fichero de 2,7 GB) y aproximadamente 5 GB para Q8_0 (fichero de 4,5 GB), incluyendo margen para contexto y cache KV.
- GPU recomendadas: cualquier GPU con al menos 6-8 GB de VRAM para Q4_K_M; para Q8_0 se recomienda 8 GB o mas. No se dispone de datos especificos para A100, H100 o RTX 4090 en la informacion proporcionada.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o superiores (por ejemplo, gama RTX xx60/xx70 recientes); en GPUs con menos VRAM puede ejecutarse parcialmente en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf richardyoung/Qwen3.5-4B-ARA-heretic-GGUF:Q4_K_M`), Ollama (`ollama run richardyoung/qwen3.5-4b-ara-heretic`, con Q4_K_M como tag `latest` y otras tallas como tags, por ejemplo `:Q8_0`) y cualquier runtime compatible con GGUF. vLLM y TGI no se mencionan en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo (WildGuard, 972 prompts) | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-4B-ARA-heretic-GGUF (este) | 4,2 B | No disponible | 18,9 % (bf16) | Apache 2.0 | GGUF |
| richardyoung/Qwen3.5-4B-ARA-heretic (origen) | 4,2 B | No disponible | 18,9 % | Apache 2.0 | safetensors |
| Qwen/Qwen3.5-4B (original) | 4,2 B | No disponible | 88,5 % | Apache 2.0 | safetensors |

Otras alternativas abliteradas de la misma familia o de tamano comparable no se detallan en la informacion proporcionada; el paper citado menciona evaluaciones sobre Qwen3.8, Gemma 4, Olmo 3.1 y Mistral Small 3.2, pero sin resultados disponibles en esta ficha.

## Limitaciones y advertencias

- Modelo de investigacion: el autor lo publica para estudiar la eliminacion de rechazo y sus defensas, no como asistente de proposito general; no debe desplegarse como producto sin controles adicionales.
- Supresion deliberada de rechazo: responde a muchas peticiones que el original rechaza, lo que implica riesgo de generar contenido danino, ilegal o inseguro si se usa sin filtros externos.
- Los numeros de rechazo y KL corresponden al modelo bf16; el autor advierte que la cuantizacion puede alterar el comportamiento de rechazo y que los GGUF no fueron evaluados en el paper.
- Solo texto: el proyector de vision del modelo base no esta incluido, por lo que no hay capacidades multimodales en esta distribucion.
- Idioma: solo se declara ingles; el rendimiento en castellano u otros idiomas no esta documentado.
- Longitud de contexto: no disponible, lo que impide planificar cargas con ventanas largas.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; al ser una modificacion de pesos de un modelo de 4 B, cabe esperar las limitaciones propias de esa escala, pero no hay mediciones publicadas.
- Licencia Apache 2.0 heredada del modelo fuente, con las mismas restricciones de uso; el usuario es responsable del uso licito.
- Sin descargas ni likes en el momento de la consulta (0 y 0), lo que indica ausencia de validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/richardyoung/Qwen3.5-4B-ARA-heretic-GGUF
- Modelo base safetensors: https://huggingface.co/richardyoung/Qwen3.5-4B-ARA-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Paper citado (Young, 2026, "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors"): enlace arXiv pendiente de publicacion segun la model card
