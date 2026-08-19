# mradermacher/AfriqueQwen3.5-0.8B-50Langs-GGUF

## Resumen

AfriqueQwen3.5-0.8B-50Langs es un modelo de lenguaje multilingue de 0.8 mil millones de parametros, desarrollado por el grupo McGill-NLP, especializado en el soporte de 50 lenguas africanas. Este repositorio en particular contiene las cuantizaciones GGUF estaticas del modelo original, preparadas por mradermacher para su uso eficiente en entornos con recursos limitados, como CPUs o GPUs de baja capacidad.

El modelo se basa en la arquitectura Qwen3.5, una familia de modelos open source multimodal, y ha sido sometido a un proceso de continuacion de entrenamiento (continued pretraining) para adaptar sus capacidades al contexto linguistico africano. Su relevancia radica en abordar la brecha de representacion de las lenguas africanas en los modelos de lenguaje, ofreciendo una alternativa ligera y desplegable en local para tareas de generacion de texto, traduccion y comprension en estos idiomas.

Este repositorio GGUF permite ejecutar el modelo con herramientas como llama.cpp u Ollama, facilitando su integracion en aplicaciones de produccion sin necesidad de infraestructura de alto rendimiento. La disponibilidad de multiples niveles de cuantizacion (desde Q2_K hasta F16) ofrece flexibilidad para equilibrar calidad y consumo de recursos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (transformers, multimodal) |
| Parametros totales | 0.8 mil millones |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K, IQ4_XS |
| Idiomas soportados | 50 lenguas africanas (lista especifica no disponible) |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5, una arquitectura transformer multimodal que combina capacidades de texto e imagen. AfriqueQwen3.5-0.8B-50Langs ha sido sometido a un proceso de continuacion de entrenamiento especifico para lenguas africanas, utilizando probablemente la herramienta LlamaFactory para el ajuste fino, como se observa en modelos hermanos de la misma serie (AfriqueQwen3.5-4B-ExtendedCM). Este proceso busca adaptar el modelo base a las particularidades morfologicas y sintacticas de las lenguas africanas, mejorando su rendimiento en tareas como traduccion, generacion de texto y comprension lectora en estos idiomas.

No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion GGUF se ha realizado de forma estatica, lo que implica una conversion directa de los pesos del modelo original sin un paso de calibracion con datos de entrenamiento.

## Capacidades

- Generacion de texto multilingue en 50 lenguas africanas, incluyendo probablemente suajili, yoruba, hausa, zulu y amharico, entre otras.
- Comprension y razonamiento basico sobre textos en estos idiomas.
- Capacidades de conversacion y dialogos multi-turno gracias a su arquitectura transformer.
- Al estar basado en Qwen3.5, puede conservar capacidades residuales de razonamiento y generacion en ingles u otros idiomas mayoritarios, aunque no se especifica.
- Soporte de tool calling y function calling: no disponible.
- Capacidades de agente y multi-step reasoning: no disponible.
- Capacidades multimodales (vision): el modelo base Qwen3.5 es multimodal, pero no se confirma si esta version conserva dichas capacidades tras el ajuste fino y la cuantizacion.

## Casos de uso

- Traduccion automatica entre lenguas africanas y el ingles u otros idiomas: el modelo puede desplegarse en local para traducir documentos, noticias o contenido web, preservando la privacidad de los datos.
- Asistentes conversacionales en lenguas africanas: integrable en chatbots para atencion al cliente o asistentes virtuales dirigidos a poblaciones que hablan estos idiomas, con la ventaja de ejecutarse en hardware modesto.
- Transcripcion y resumen de contenido oral: combinado con un sistema de reconocimiento de voz, puede transcribir y resumir reuniones o grabaciones en lenguas africanas.
- Educacion y alfabetizacion digital: generacion de materiales educativos, ejercicios de lectura o contenido pedagogico en lenguas locales para su uso en escuelas o programas de formacion.
- Analisis de sentimiento y moderacion de contenido en redes sociales: clasificacion de comentarios o publicaciones en lenguas africanas para detectar toxicidad o tendencias.
- Desarrollo de aplicaciones offline: al ser un modelo pequeno (0.8B) y cuantizado, puede ejecutarse en dispositivos moviles o edge devices, habilitando aplicaciones de procesamiento de lenguaje natural sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos sobre el rendimiento del modelo en tareas estandar como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos multilingues.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Con Q4_K_M (aproximadamente 0.5-0.7 GB), puede ejecutarse en GPUs con 2 GB de VRAM o incluso en CPU con 8 GB de RAM.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM (GTX 1050 Ti, RTX 3050, etc.). Para las cuantizaciones F16 o Q8_0, se recomienda al menos 4 GB de VRAM.
- Compatibilidad con consumer GPUs: si, es totalmente viable en GPUs de gama baja y media.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, o cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponible, pero al ser un modelo de 0.8B, se espera una latencia baja (del orden de decenas de milisegundos por token en GPU, y de cientos de milisegundos en CPU).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| AfriqueQwen3.5-0.8B-50Langs (este) | 0.8B | no disponible | 50 lenguas africanas | no disponible | GGUF |
| AfriqueQwen3.5-4B-ExtendedCM | 4B | no disponible | 21 lenguas africanas | CC-BY-4.0 | Transformers, GGUF |
| Qwen3.5-0.8B base | 0.8B | no disponible | Multilingue (principalmente ingles y chino) | no disponible | Transformers, GGUF |

El modelo se posiciona como una opcion ligera frente al AfriqueQwen3.5-4B-ExtendedCM, sacrificando capacidad de razonamiento por un menor coste computacional y mayor cobertura de idiomas (50 frente a 21). Comparado con el Qwen3.5-0.8B base, ofrece un valor anadido claro para el ecosistema de lenguas africanas.

## Limitaciones y advertencias

- No se dispone de informacion sobre la licencia del modelo original, por lo que se recomienda contactar con McGill-NLP antes de un uso comercial.
- El modelo puede presentar sesgos derivados de los datos de entrenamiento, especialmente en cuanto a representacion cultural y dialectal de las lenguas africanas.
- Riesgo de alucinacion en tareas de generacion de texto, especialmente en idiomas con pocos datos de entrenamiento.
- La longitud de contexto no esta especificada, por lo que se recomienda precaucion al trabajar con documentos largos.
- No se confirma si las capacidades multimodales del modelo base Qwen3.5 se conservan tras el ajuste fino.
- La cobertura de 50 lenguas africanas puede ser desigual: algunas lenguas tendran mejor rendimiento que otras dependiendo de su representacion en el dataset de entrenamiento.
- Al ser un modelo de 0.8B, su capacidad de razonamiento complejo y generacion de codigo es limitada en comparacion con modelos de mayor tamano.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/AfriqueQwen3.5-0.8B-50Langs-GGUF
- Modelo original: https://huggingface.co/McGill-NLP/AfriqueQwen3.5-0.8B-50Langs
- Modelo hermano 4B: https://huggingface.co/mradermacher/AfriqueQwen3.5-4B-ExtendedCM-GGUF
- Repositorio Ollama de Qwen3.5: https://ollama.com/library/qwen3.5:0.8b
