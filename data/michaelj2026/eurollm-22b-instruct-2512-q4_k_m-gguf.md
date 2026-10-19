# MichaelJ2026/EuroLLM-22B-Instruct-2512-Q4_K_M-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF en Q4_K_M del modelo `utter-project/EuroLLM-22B-Instruct-2512`, publicada por el usuario MichaelJ2026. No se trata de un modelo nuevo ni de un entrenamiento propio: es una conversión de formato realizada con llama.cpp a través del espacio GGUF-my-repo de ggml.ai, pensada para ejecutar el modelo original en CPU, GPU de consumo y entornos con poca VRAM. El modelo subyacente es un instruct de 22.637.328.384 parámetros (22,64 B) distribuido con licencia Apache 2.0 y orientado a conversación multilingüe.

La relevancia práctica de esta ficha está en el empaquetado, no en la arquitectura: un único fichero de 13,7 GB que reduce el requisito de memoria de los ~45 GB que ocuparían los pesos en bf16 a algo manejable en una GPU de 16-24 GB o incluso en CPU con suficiente RAM. El modelo declara soporte para 35 idiomas, con presencia destacada de lenguas europeas, incluidas varias de recursos limitados (ga, mt, gl, hr, sl, sk, et, lv, lt), lo que lo sitúa en el nicho de modelos multilingües europeos ejecutables en local.

Conviene subir la advertencia al principio: la información publicada en este repositorio es mínima (la model card es la plantilla automática de GGUF-my-repo), el repositorio tiene 23 descargas y 0 likes, y no se han publicado benchmarks, longitud de contexto ni detalles de entrenamiento. Cualquier cifra que no aparezca aquí debe considerarse no verificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada (modelo de lenguaje decoder-only según el modelo base; no se detalla en la model card) |
| Parámetros totales | 22.637.328.384 (22,64 B) |
| Parámetros activos | No aplica / no disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible. El `-c 2048` del ejemplo de la model card es un valor de arranque del servidor, no el máximo del modelo |
| Tipos de cuantización | GGUF Q4_K_M (fichero `eurollm-22b-instruct-2512-q4_k_m.gguf`). Este repositorio no publica otras variantes (Q5_K_M, Q8_0, IQ4_XS, etc.) |
| Idiomas soportados | 35: en, de, es, fr, it, pt, pl, nl, tr, sv, cs, el, hu, ro, fi, uk, sl, sk, da, lt, lv, et, bg, no, ca, hr, ga, mt, gl, zh, ru, ko, ja, ar, hi |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero único, 13,7 GB de repositorio); el modelo base se distribuye en formato transformers (safetensors no confirmado en la información disponible) |
| Modelo base | utter-project/EuroLLM-22B-Instruct-2512 |
| Fecha de creación del repo | 2026-10-19 |
| Etiquetas relevantes | `gguf`, `llama-cpp`, `gguf-my-repo`, `conversational`, `endpoints_compatible` |

## Arquitectura y entrenamiento

No hay información sobre arquitectura ni entrenamiento en este repositorio. La model card es la plantilla generada automáticamente por GGUF-my-repo y solo documenta el proceso de conversión a GGUF mediante llama.cpp, sin describir capas, atención, tokenizador, composición del dataset, número de tokens de entrenamiento ni si hubo RLHF, DPO o ajuste por instrucciones. Tampoco se detalla el proceso de alineación del modelo base.

Lo único verificable a nivel técnico es el resultado de la cuantización: 22,64 B de parámetros comprimidos a un fichero de 13,7 GB, lo que implica una media de aproximadamente 4,8 bits por peso, coherente con Q4_K_M (bloques K-quant de 4 bits con escalas de mayor precisión en algunas capas). Esta compresión afecta principalmente a las proyecciones de atención y FFN, y suele degradar antes las tareas de precisión numérica (matemáticas, código) que la generación de texto libre. Para conocer la arquitectura exacta, los datos de entrenamiento y las innovaciones técnicas del modelo original hay que consultar la model card de `utter-project/EuroLLM-22B-Instruct-2512`, que no forma parte de la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno: el tag `conversational` y el sufijo `-Instruct` indican ajuste para seguir instrucciones y mantener diálogo.
- Cobertura multilingüe amplia: 35 idiomas declarados, con bloque completo de lenguas oficiales de la UE más ucraniano, turco, noruego, gallego y catalán, y un segundo grupo de lenguas no europeas (zh, ru, ko, ja, ar, hi).
- Traducción y generación cruzada entre las lenguas declaradas: es el uso natural de un modelo con esta distribución idiomática, aunque no se documenta calidad por par de idiomas.
- Ejecución en local y en entornos con recursos limitados: el formato GGUF Q4_K_M permite inferencia en CPU, GPU de consumo y despliegues sin conexión.
- Integración con el ecosistema llama.cpp: compatible con `llama-cli`, `llama-server` y cualquier frontend que consuma GGUF (Ollama, LM Studio, llama-cpp-python).
- Modo servidor HTTP con API compatible con OpenAI a través de `llama-server`, y tag `endpoints_compatible` para despliegue en Hugging Face Inference Endpoints.
- Tool calling / function calling: no documentado en la información disponible.
- Razonamiento multi-paso explícito, modo thinking, visión, audio: no documentado; no se indica ninguna capacidad multimodal ni modo de razonamiento extendido.

## Casos de uso

- Traducción interna en administraciones públicas y empresas europeas: el modelo cubre las 24 lenguas oficiales de la UE más candidatas, y al ejecutarse en local con llama.cpp los textos no salen de la infraestructura de la organización, lo que simplifica el cumplimiento del RGPD en flujos con datos personales.
- Asistente conversacional on-premise para atención al ciudadano: despliegue con `llama-server` detrás de un backend propio, con el modelo atendiendo consultas multi-turno en la lengua del usuario entre los 35 idiomas declarados, sin dependencia de APIs externas.
- Procesamiento de documentación multilingüe por lotes: resumen, reescritura y normalización de textos en varios idiomas sobre CPU o una única GPU, aprovechando que un fichero de 13,7 GB cabe en un nodo modesto y permite procesar corpus completos sin coste por token.
- Prototipado e investigación en PLN europea: evaluación cualitativa de un modelo de 22 B en lenguas de recursos limitados (ga, mt, gl, hr, sl, sk, et, lv, lt) en entornos académicos sin clúster de GPUs, usando cuantización Q4_K_M como aproximación rápida al modelo completo.
- Generación asistida en herramientas de escritorio: integración vía llama-cpp-python o LM Studio en aplicaciones ofimáticas o editores que necesiten redacción y corrección multilingüe sin conexión.
- Base para ajuste fino ligero o evaluaciones comparativas de cuantización: el GGUF sirve como referencia para medir la pérdida de calidad frente al modelo en bf16 en tareas concretas del dominio propio antes de decidir el formato de producción.
- Filtrado y clasificación de contenido en varias lenguas: clasificación zero-shot o few-shot de tickets, reseñas o incidencias en cualquiera de los idiomas soportados, con latencia aceptable en una GPU de 24 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del repositorio no incluye MMLU, HumanEval, GSM8K, FLORES ni ninguna otra métrica, y tampoco se aportan comparaciones con el modelo base en bf16. Cualquier cifra de rendimiento que se cite para este repositorio sin pasar por una evaluación propia debe tratarse como no verificada.

## Requisitos de hardware

- VRAM para los pesos: 13,7 GB (tamaño exacto del fichero GGUF Q4_K_M). Con caché KV para 4.096 tokens hay que sumar aproximadamente 1-3 GB según configuración de contexto y número de capas, dato no disponible; en la práctica, reservar 16 GB de VRAM para un uso cómodo.
- GPU de 24 GB: RTX 3090, RTX 4090, A10G 24 GB, L4 24 GB, A100 40 GB, H100 80 GB. Cabe entero en VRAM con contexto amplio y margen para lotes pequeños.
- GPU de 16 GB: RTX 4080, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, A4000 16 GB. Cabe entero pero con contexto reducido y sin margen para batch; es necesario limitar `-c` y vigilar el consumo de caché KV.
- GPU de 8-12 GB: no cabe entero; funciona con offload parcial de capas a GPU y el resto en RAM del sistema (`-ngl` en llama.cpp). El rendimiento cae de forma proporcional al número de capas que queden en CPU.
- Solo CPU: viable con 16 GB de RAM o más (13,7 GB de pesos + overhead). El rendimiento queda limitado por el ancho de banda de memoria; el throughput real no está documentado.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama mediante importación de Modelfile, LM Studio, Jan, koboldcpp, llama-cpp-python y Hugging Face Inference Endpoints (tag `endpoints_compatible`). Para vLLM o TGI sería preferible el modelo base en safetensors, ya que el soporte de GGUF en esos motores es limitado o experimental.
- Latencia y throughput: no disponibles. Al ser una cuantización de 4 bits de un modelo de 22 B, el rendimiento estará dominado por el ancho de banda de memoria; conviene medirlo en el hardware objetivo antes de dimensionar un servicio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / cuantización | Licencia | Disponibilidad | Benchmarks publicados |
|---|---|---|---|---|---|---|
| MichaelJ2026/EuroLLM-22B-Instruct-2512-Q4_K_M-GGUF (este repo) | 22,64 B | No disponible | GGUF Q4_K_M, 13,7 GB | Apache 2.0 | 23 descargas, 0 likes, repo de terceros no oficial | No disponibles |
| utter-project/EuroLLM-22B-Instruct-2512 (base) | 22,64 B | No disponible en la información proporcionada | Transformers (bf16/fp16), ~45 GB estimados | Apache 2.0 | Repositorio oficial del proyecto | No verificados en esta ficha |
| utter-project/EuroLLM-9B-Instruct (misma familia, menor tamaño) | ~9 B | No disponible en la información proporcionada | Transformers y derivados GGUF de la comunidad | Apache 2.0 (según proyecto EuroLLM; no verificado aquí) | Repositorio oficial | No verificados en esta ficha |

La comparación relevante para decidir el despliegue es contra el modelo base en bf16: misma licencia y mismos parámetros, pero cuatro veces menos peso en disco y VRAM a cambio de una pérdida de calidad no cuantificada en esta información. No se aportan datos que permitan comparar con modelos de otros proyectos de tamaño similar (por ejemplo, familias de 20-24 B de otros laboratorios), por lo que esa comparación queda como no disponible.

## Limitaciones y advertencias

- Pérdida de calidad por cuantización: Q4_K_M es un compromiso agresivo en un modelo de 22 B. El deterioro suele concentrarse en matemáticas, código, instrucciones con restricciones numéricas y lenguas de bajos recursos; no hay evaluación publicada que lo cuantifique en este caso.
- Ausencia total de benchmarks: no se puede afirmar ningún nivel de rendimiento frente al modelo original ni frente a alternativas. Cualquier comparación requiere evaluación propia sobre el dominio de uso.
- Repositorio no oficial: lo publica un usuario tercero (MichaelJ2026), no el equipo de EuroLLM. No hay garantía de que la conversión se haya validado, ni de que el tokenizador y la plantilla de chat embebidos en el GGUF sean correctos. Verificar la plantilla de prompt antes de usar en producción.
- Longitud de contexto desconocida: no asumir el valor `-c 2048` del ejemplo como límite del modelo. Un contexto mal configurado en llama.cpp trunca conversaciones de forma silenciosa.
- Idiomas declarados frente a cobertura real: los 35 idiomas provienen de los metadatos; el rendimiento por idioma no está documentado y probablemente sea muy desigual entre lenguas con muchos datos (en, de, fr, es, it) y lenguas de recursos limitados (ga, mt, gl, lt, lv, et).
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala y no mitigado de forma documentada. En dominios factuales (normativa, sanidad, legal) requiere verificación humana o recuperación aumentada.
- Sesgos: no se documenta ninguna evaluación de sesgo, toxicidad o alineación en esta información.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero el publicador de esta cuantización no ofrece garantías ni soporte; la responsabilidad del cumplimiento recae en quien despliega.
- Capacidades no confirmadas: tool calling, modo de razonamiento explícito, visión y audio no están documentados; no planificar arquitecturas de agentes que dependan de ello sin validación previa.
- Mantenimiento incierto: 23 descargas y 0 likes indican un repositorio de baja tracción; puede no recibir actualizaciones ni correcciones.

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/MichaelJ2026/EuroLLM-22B-Instruct-2512-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/utter-project/EuroLLM-22B-Instruct-2512
- Espacio GGUF-my-repo utilizado para la conversión: https://huggingface.co/spaces/ggml-org/gguf-my-repo
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Documentación de uso de llama.cpp: https://github.com/ggerganov/llama.cpp?tab=readme-ov-file#usage
- Paper, blog o demo del modelo original: no disponible en la información proporcionada.
