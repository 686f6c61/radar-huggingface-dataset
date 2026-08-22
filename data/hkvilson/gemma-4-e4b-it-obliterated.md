# hkvilson/gemma-4-E4B-it-OBLITERATED

## Resumen

El modelo `hkvilson/gemma-4-E4B-it-OBLITERATED` es una version modificada del modelo `google/gemma-4-E4B-it` de Google DeepMind, a la que se le han eliminado quirúrgicamente los mecanismos de rechazo (refusal) mediante la técnica OBLITERATUS. El resultado es un modelo de generación de texto con una tasa de rechazo duro del 0%, pensado para investigación de seguridad y red teaming, pero con un riesgo evidente de uso indebido.

El modelo base, Gemma 4 E4B, pertenece a la familia Gemma 4 de Google, con soporte de contexto de hasta 256.000 tokens y arquitectura de 42 capas con atención compartida (shared KV). El nombre "E4B" sugiere un modelo con 4.000 millones de parámetros activos, aunque los pesos totales ascienden a 7.996.156.448 parámetros (aproximadamente 8.000 millones). El repositorio de hkvilson es una re-subida del trabajo original del equipo OBLITERATUS, que documenta el proceso de abliteración y los problemas encontrados con la arquitectura de Gemma 4.

La relevancia de este modelo reside en que demuestra que incluso arquitecturas nuevas con mecanismos de seguridad integrados (como el modo "thinking" de Gemma 4) pueden ser vulnerables a técnicas de eliminación de guardarraíles. Es una herramienta útil para investigación de seguridad, pero no apta para uso directo en producción sin supervisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 4 (transformadora con 42 capas, KV compartida en 18 capas, soporte multimodal) |
| Parametros totales | 7.996.156.448 (aproximadamente 8.000 millones) |
| Parametros activos | no disponible (el nombre E4B sugiere un modelo eficiente de 4B activos, pero no se confirma) |
| Longitud de contexto | 256.000 tokens (segun la documentacion de Gemma 4) |
| Tipos de cuantizacion | Q4_K_M (4,9 GB), Q5_K_M (5,3 GB), Q8_0 (7,4 GB), bfloat16 (safetensors, ~17 GB) |
| Idiomas soportados | mas de 140 idiomas (capacidad del modelo base Gemma 4) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16) y GGUF (Q4_K_M, Q5_K_M, Q8_0, mmproj-f16) |

## Arquitectura y entrenamiento

El modelo base, Gemma 4 E4B, es un transformer de 42 capas con una arquitectura innovadora que incluye pesos de clave/valor compartidos entre las capas 24 y 41 (`num_kv_shared_layers: 18`), lo que reduce el numero de tensores necesarios. Ademas, incorpora un modo de razonamiento ("thinking mode") y capacidades multimodales (vision y audio) mediante un proyector adicional (mmproj). El modelo fue entrenado por Google DeepMind con un enfoque de refuerzo con feedback humano (RLHF) para alinearse con directrices de seguridad.

La version abliterated se creo aplicando el metodo OBLITERATUS (whitened SVD + attention head surgery + winsorized activations) sobre el modelo base. El proceso consistio en identificar 842 pares de prompts contrastivos en 10 categorias, proyectar los vectores de rechazo en los espacios de activacion y eliminarlos quirurgicamente de 21 de las 42 capas. En la version v3 se corrigio un error critico de la version anterior: la proyeccion de los pesos K/V compartidos se aplicaba 18 veces sobre el mismo tensor, lo que corrompia y eliminaba 54 tensores. En v3, la proyeccion se aplica una sola vez sobre la capa propietaria y se propaga automaticamente a las capas que comparten los pesos.

El resultado es un modelo con una tasa de rechazo duro del 0% en pruebas internas, aunque con una tasa de desviacion suave del 28% y un 20% de salidas degeneradas (repeticiones) debido a las limitaciones inherentes de un modelo de 4B parametros activos.

## Capacidades

- Generacion de texto sin restricciones: el modelo no rechaza ninguna peticion, sin mensajes de "no puedo" ni disculpas.
- Razonamiento de multiples pasos: hereda las capacidades de razonamiento del modelo base Gemma 4.
- Generacion de codigo y matematicas: el modelo base fue entrenado para tareas de programacion y calculo.
- Multilingue: soporta mas de 140 idiomas, aunque en las pruebas se observo un 4% de salidas en idioma incorrecto (tailandes o japones).
- Capacidades multimodales: el proyector mmproj (990 MB) permite procesar entrada de imagenes y audio.
- Tool calling: no se menciona explicitamente en la informacion proporcionada, pero es plausible que el modelo base lo soporte.
- Modo "thinking": el modelo base incluye un modo de razonamiento interno, aunque no se detalla si se preserva tras la abliteracion.

## Casos de uso

- **Investigacion de seguridad en IA**: el modelo es util para estudiar como las tecnicas de abliteration afectan a la seguridad de modelos con arquitecturas nuevas. Se puede usar para medir la eficacia de los guardrails de Gemma 4 y para desarrollar contramedidas.
- **Red teaming de sistemas de moderacion**: permite generar contenido que normalmente seria bloqueado por sistemas de filtrado, lo que ayuda a evaluar la robustez de los clasificadores de contenido.
- **Pruebas de alucinacion y degeneracion**: su tasa de salidas degeneradas (~20%) y su tendencia a cambiar de tema (~28%) lo convierten en un caso de estudio para detectar fallos de generacion en modelos pequenos.
- **Evaluacion de tecnicas de control de modelos**: dado que se documentan las capas modificadas y el proceso, sirve como referencia para comparar con otras tecnicas de desalinizacion (por ejemplo, DPO, RLHF).
- **Generacion de texto creativo sin censura**: para proyectos de ficcion o escritura libre donde se quiera evitar cualquier restriccion tematica, aunque con riesgo de incoherencia.
- **Estudio de arquitecturas con KV compartidas**: su arquitectura con capas de atencion compartidas permite investigar como se propaga la informacion entre capas y como afecta a la calidad de la generacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. El autor proporciona metricas de calidad y de eliminacion de rechazo, pero no son comparables con benchmarks convencionales.

| Metrica | Valor | Notas |
|---|---|---|
| Tasa de rechazo duro | 0% | Guardrails eliminados por completo |
| Desviacion suave | ~28% | El modelo cambia de tema a veces |
| Salidas coherentes y sobre el tema | ~51% | Respuestas utiles y detalladas |
| Salidas degeneradas | ~20% | Bucles de repeticion (se mitiga con repeat_penalty 1.1) |
| Idioma incorrecto | ~4% | Ocasionalmente emite texto en tailandes o japones |

Estas cifras son una evaluacion del autor del modelo, no un benchmark estandarizado.

## Requisitos de hardware

- **GGUF Q4_K_M (4,9 GB)**: cabe en dispositivos con 6-8 GB de RAM, incluyendo telefonos moviles modernos (el autor afirma que funciona en un iPhone).
- **GGUF Q5_K_M (5,3 GB)**: recomendado para equipos con 8 GB de RAM o mas; ofrece un equilibrio entre calidad y portabilidad.
- **GGUF Q8_0 (7,4 GB)**: requiere al menos 8 GB de VRAM o RAM; el autor indica que cabe en sistemas con 8 GB de RAM.
- **Safetensors bfloat16 (~17 GB)**: requiere una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 4090, A100, H100) o CPU con suficiente RAM para inference.
- **Proyector multimodal (990 MB)**: adicional para entrada de imagenes y audio.
- **Herramientas de despliegue**: llama.cpp (build b8665 o posterior), Ollama 0.20+, LM Studio 0.4.16+, koboldcpp (ultima nightly), text-generation-webui con llama-cpp-python actualizado. El modelo requiere el chat template de Gemma 4; si se usa como completion pura, genera texto incoherente.
- **Latencia y throughput**: no se proporcionan datos. En una GPU consumer, se estima una velocidad de 20-40 tokens/segundo con Q4_K_M, pero no es un dato confirmado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazo | Licencia | Disponibilidad |
|--------|------------|----------|---------|----------|----------------|
| google/gemma-4-E4B-it (original) | ~8B totales | 256K | 98,8% de rechazo duro | Apache 2.0 | HuggingFace |
| OBLITERATUS/gemma-4-E4B-it-OBLITERATED | ~8B totales | 256K | 0% de rechazo duro | Apache 2.0 | HuggingFace |
| Nemesispro/gemma-4-E4B-it-OBLITERATED | ~8B totales | 256K | 0% de rechazo duro | Apache 2.0 | HuggingFace |
| hkvilson/gemma-4-E4B-it-OBLITERATED (este) | ~8B totales | 256K | 0% de rechazo duro | Apache 2.0 | HuggingFace |

Las tres versiones abliterated son funcionalmente identicas, ya que parten del mismo proceso OBLITERATUS. La diferencia entre ellas radica en el repositorio y la documentacion: la version de OBLITERATUS es la original, mientras que la de hkvilson y Nemesispro son re-subidas con la misma documentacion. El modelo original de Google con guardrails es la alternativa mas segura para uso general, pero no permite evaluar el impacto de la eliminacion de guardrails.

## Limitaciones y advertencias

- **Eliminacion de guardrails**: el modelo no tiene restricciones de seguridad y puede generar contenido dañino, ilegal, violento o sexualmente explicito. No es adecuado para uso en produccion sin un sistema de moderacion externo.
- **Riesgo de alucinacion**: como todos los modelos de 4B, tiene una tasa de alucinaciones considerable en temas complejos, agravada por la abliteracion que puede haber degradado la coherencia.
- **Salidas degeneradas**: alrededor del 20% de las respuestas pueden ser bucles de repeticion o texto sin sentido; se recomienda un `repeat_penalty` de 1.1 para mitigarlo.
- **Idioma incorrecto**: un 4% de las salidas se producen en tailandes o japones, incluso cuando se solicita en espanol o ingles; se recomienda un system prompt explicito.
- **Limitaciones de contexto**: aunque el modelo base soporta 256K tokens, el modelo abliterated puede degradar su calidad en contextos muy largos, ya que las capas modificadas afectan a la atencion.
- **Restricciones de licencia**: la licencia Apache 2.0 permite uso comercial, pero el modelo es una derivacion de Gemma 4 de Google, que tiene sus propios terminos de uso; se recomienda revisar los terminos de la licencia de Google antes de un despliegue comercial.
- **Riesgo de mal uso**: al ser un modelo sin guardrails, puede ser utilizado para generar contenido fraudulento, spam o manipulacion. Su uso con fines ilicitos puede tener consecuencias legales.

## Enlaces

- Repositorio de HuggingFace del modelo: https://huggingface.co/hkvilson/gemma-4-E4B-it-OBLITERATED
- Repositorio original de OBLITERATUS: https://huggingface.co/OBLITERATUS/gemma-4-E4B-it-OBLITERATED
- Repositorio de Nemesispro (re-subida): https://huggingface.co/Nemesispro/gemma-4-E4B-it-OBLITERATED
- Pagina de Gemma 4 de Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Model card de Gemma 4 en Google AI for Developers: https://ai.google.dev/gemma/docs/core/model_card_4
- Repositorio del metodo OBLITERATUS: https://github.com/elder-plinius/OBLITERATUS
- Guia de despliegue con GGUF en local-ai-zone: https://local-ai-zone.github.io/models/gemma-4-e4b-it-obliterated.html
