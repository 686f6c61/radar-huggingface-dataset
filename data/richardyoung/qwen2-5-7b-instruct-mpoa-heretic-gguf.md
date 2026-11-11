# richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic-GGUF

## Resumen

Qwen2.5-7B-Instruct-MPOA-heretic-GGUF es la versión cuantizada en formato GGUF del modelo richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic, un derivado "abliterated" de Qwen/Qwen2.5-7B-Instruct en el que se ha eliminado el comportamiento de rechazo (refusal) mediante la técnica Heretic 2.0 con abliteración proyectada y preservación de magnitud (MPOA, el método por defecto de Heretic). El autor es Richard J. Young, que publica estos pesos como material de investigación para su artículo sobre la dificultad creciente de la abliteración en modelos open-weight.

El modelo base es un transformer denso de 7.615.616.512 parámetros (aproximadamente 7,6 mil millones), hereda la ventana de contexto de Qwen2.5 (no declarada de forma explícita en la información disponible para esta ficha) y se distribuye bajo licencia Apache 2.0. Su relevancia es doble: por un lado sirve como artefacto reproducible para estudiar la eliminación de rechazos y su medición; por otro, al estar en GGUF, permite ejecutar el modelo en CPU o GPU de consumo con llama.cpp u Ollama.

La model card es explícita: estos ficheros no están pensados como asistente de propósito general, sino para investigación sobre abliteración, su evaluación y las defensas frente a ella. Los resultados publicados (reducción del rechazo del 72,1 % al 13,8 % en 972 prompts dañinos retenidos) corresponden al modelo en precisión completa (bf16), no a estas cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen2.5-7B-Instruct) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | Q4_K_M, Q8_0 (publicados); IQ3_M, IQ4_XS, Q5_K_M, Q6_K (anunciados como "en proceso"); matriz de importancia (imatrix) |
| Idiomas soportados | en (segun metadatos del repo) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen2.5, tomado de Qwen/Qwen2.5-7B-Instruct y modificado mediante abliteración con Heretic 2.0. La abliteración es una técnica de edición de pesos que identifica la dirección del espacio de activaciones asociada al comportamiento de rechazo y la proyecta fuera de los pesos, sin reentrenamiento. La variante MPOA (magnitude-preserving orthogonal abliteration, según la denominación del autor) aplica una proyección que preserva la magnitud de los pesos originales, lo que reduce el daño colateral en capacidades generales.

El proceso de selección descrito en la model card consistió en una búsqueda de 100 ensayos con la regla de elegir el ensayo con menos rechazos por palabra clave en el conjunto de desarrollo, sujeto a una divergencia KL de primer token respecto al original menor o igual a 0,1. El ensayo seleccionado obtuvo 19 rechazos por palabra clave sobre los 100 prompts de ajuste y una KL de primer token de 0,074. No se dispone de información sobre el volumen de tokens de preentrenamiento del modelo base ni sobre las etapas de RLHF/DPO originales de Qwen2.5-7B-Instruct en la documentación aportada.

Los ficheros GGUF se generaron con llama.cpp (commit 468fde9): conversión a bf16 con convert_hf_to_gguf.py y cuantización posterior con llama-quantize en CPU, verificando cada peso del safetensors publicado contra su SHA-256. Las cuantizaciones IQ3_M, IQ4_XS, Q4_K_M y Q5_K_M usan una matriz de importancia calculada sobre la build Q8_0 con calibration_datav3 (128 fragmentos de 512 tokens); Q6_K y Q8_0 son estáticas.

## Capacidades

- Generación de texto conversacional multirretorno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento, matemáticas y generación de código en el nivel propio de un modelo de 7B de la familia Qwen2.5.
- Comportamiento de rechazo drásticamente reducido: cumple muchas peticiones que el modelo original rechaza, lo que constituye su rasgo definitorio.
- No se documenta en la información disponible soporte explícito de tool calling, function calling ni modo de razonamiento extendido (thinking) para este derivado.
- Capacidades multilingües: los metadatos del repo declaran únicamente inglés; no se confirma el multilingüismo del Qwen2.5 original en esta ficha.
- Ejecución local vía llama.cpp y Ollama, con compatibilidad declarada con endpoints.

## Casos de uso

- Investigación sobre abliteración: reproducir y medir la eliminación de rechazos comparando este modelo con Qwen2.5-7B-Instruct bajo el mismo conjunto de prompts y el mismo juez (WildGuard), tal como describe el artículo del autor.
- Estudio de robustez de clasificadores de seguridad: usar el modelo como generador adversario controlado para evaluar filtros de entrada y salida en un pipeline de moderación.
- Evaluación del efecto de la cuantización en el comportamiento de rechazo: comparar Q4_K_M frente a Q8_0 y frente al bf16 original, dado que la model card advierte que la cuantización puede alterar la conducta de rechazo.
- Experimentos de alineación y defensas: analizar si técnicas de post-entrenamiento ligeras pueden restaurar rechazos sin degradar capacidades, usando la KL de primer token como métrica de deriva.
- Despliegue local de bajo coste para pruebas de concepto: con Q4_K_M (4,7 GB) cabe en GPU de consumo y permite iterar en estaciones de trabajo sin infraestructura dedicada.
- Docencia y divulgación técnica: demostrar en un entorno controlado cómo se comporta un modelo sin rechazos y por qué la moderación debe residir en capas externas al modelo.

## Benchmarks y rendimiento

Los únicos datos publicados corresponden al modelo en precisión completa (bf16), no a las cuantizaciones GGUF de este repo:

| Metrica | Original (Qwen2.5-7B-Instruct) | Este modelo (bf16) |
|---|---|---|
| Rechazo en 972 prompts dañinos retenidos (juez WildGuard) | 72,1 % | 13,8 % (134/972) |
| Rechazos por palabra clave en los 100 prompts de ajuste (ensayo seleccionado) | no disponible | 19 |
| Divergencia KL de primer token respecto al original (ensayo seleccionado) | no disponible | 0,074 |

No se han publicado resultados de benchmarks de capacidades generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5-6 GB para Q4_K_M (fichero de 4,7 GB más overhead de contexto) y 9-10 GB para Q8_0 (fichero de 8,1 GB).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para Q4_K_M y Q8_0; A100 o H100 solo si se busca throughput alto o se sirven múltiples réplicas.
- Cabe en GPU de consumo: sí, Q4_K_M en tarjetas de 8 GB o más y Q8_0 en tarjetas de 12 GB o más; también es viable en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama (etiqueta por defecto Q4_K_M, otras tallas como :Q8_0) y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-MPOA-heretic-GGUF (este) | 7,6 B | no disponible | 13,8 % (bf16, WildGuard, 972 prompts) | Apache 2.0 | GGUF |
| Qwen2.5-7B-Instruct (original) | 7,6 B | no disponible | 72,1 % (misma prueba) | Apache 2.0 | safetensors |
| richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic (bf16) | 7,6 B | no disponible | 13,8 % (misma prueba) | Apache 2.0 | safetensors |
| Otras variantes abliterated de Qwen2.5-7B | no disponible | no disponible | no disponible | variable | variable |

La comparación con otros modelos abliterated de la misma familia no puede completarse con los datos disponibles; la información proporcionada solo permite contrastar contra el original y contra el modelo bf16 del que se derivan estos GGUF.

## Limitaciones y advertencias

- El modelo elimina deliberadamente el comportamiento de rechazo: puede producir contenido dañino, ilegal o inseguro que el original bloquearía. No es apto como asistente de propósito general ni para despliegue orientado al público sin moderación externa.
- Los resultados de rechazo publicados corresponden al bf16; la model card advierte que la cuantización puede cambiar la conducta de rechazo, por lo que las cifras no son extrapolables a Q4_K_M ni a Q8_0.
- Riesgo de alucinación inherente a un modelo de 7B, sin datos específicos de evaluación en la información disponible.
- Idiomas: los metadatos declaran solo inglés; el rendimiento en castellano no está documentado.
- Sesgos: no se documentan evaluaciones de sesgo para este derivado; la edición de pesos puede alterar comportamientos más allá del rechazo.
- Licencia Apache 2.0 permite uso comercial, pero el autor restringe el propósito a investigación sobre abliteración y defensas; el usuario es responsable del uso lícito.
- Longitud de contexto no declarada en la información disponible; conviene verificarla en el modelo base antes de diseñar aplicaciones con contexto largo.
- Repo con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria ni informes independientes de calidad.

## Enlaces

- Repositorio GGUF: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic-GGUF
- Modelo base bf16: https://huggingface.co/richardyoung/Qwen2.5-7B-Instruct-MPOA-heretic
- Modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Licencia del modelo original: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct/blob/main/LICENSE
- Artículo citado (arXiv pendiente de enlace): Young, R. J., "Is Abliteration Getting Harder? Refusal Removal from Open-Weight LLMs with Heretic on Qwen3.8, Gemma 4, Olmo 3.1 and Mistral Small 3.2 Versus Their Predecessors", 2026
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
