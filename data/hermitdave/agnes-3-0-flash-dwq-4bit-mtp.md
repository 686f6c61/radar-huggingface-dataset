# hermitdave/Agnes-3.0-Flash-DWQ-4bit-MTP

## Resumen

Agnes-3.0-Flash-DWQ-4bit-MTP es una versión cuantizada a 4 bits del modelo Agnes-3.0-Flash, desarrollado originalmente por Agnes AI y convertido y publicado en HuggingFace por el usuario hermitdave. Se trata de una arquitectura híbrida de aproximadamente 33.000 millones de parámetros que combina capas de atención global con capas delta-recurrentes (GatedDeltaNet), una configuración pensada para reducir el coste de memoria del contexto largo sin renunciar a la calidad de atención completa. El checkpoint declara 32.205.067.008 parámetros reales según los tensores en formato safetensors y una ventana de contexto de 262.144 tokens.

La particularidad de este repositorio es doble. Por un lado, emplea DWQ (Data-aware Weight Quantization) a 4 bits con un tamaño de grupo de 64, un método que ajusta escalas y desplazamientos en función de la distribución de activaciones en lugar de aplicar un redondeo al vecino más cercano, lo que según el autor preserva mejor las capacidades del modelo base. Por otro, conserva la cabeza MTP (Multi-Token Prediction) nativa, que habilita decodificación especulativa y permite acelerar la inferencia sin necesidad de un modelo borrador externo.

Es relevante ahora porque combina tres tendencias actuales: cuantización consciente de datos para reducir huella de memoria, decodificación especulativa integrada en el propio modelo y arquitecturas híbridas para contextos de cientos de miles de tokens. Sin embargo, su ecosistema de ejecución está limitado de facto a MLX sobre Apple Silicon, y la torre de visión ha sido eliminada, por lo que el modelo es exclusivamente de texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration, híbrida: GatedDeltaNet (54 capas delta-recurrentes) + atención global (18 capas) |
| Parametros totales | 32.205.067.008 (~33B según la model card) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | DWQ 4-bit, group_size=64, modo affine |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; ejecución documentada con MLX) |

## Arquitectura y entrenamiento

El modelo base Agnes-3.0-Flash emplea una arquitectura híbrida de 33B con 54 capas delta-recurrentes y 18 capas de atención global, implementada en la clase `Qwen3_5ForConditionalGeneration`. Las capas GatedDeltaNet mantienen un estado recurrente de tamaño fijo en lugar de una caché KV que crece con la secuencia, mientras que las 18 capas de atención completa conservan la caché KV tradicional. Esta combinación es la que permite sostener una ventana de 262.144 tokens con un coste de memoria de caché sustancialmente menor que el de un transformer denso equivalente. El checkpoint incluye además una cabeza MTP de una sola capa, entrenada de forma nativa, que habilita decodificación especulativa interna.

Sobre el proceso de entrenamiento no se dispone de información en el material proporcionado: no se indica el número de tokens, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineamiento. Tampoco se documenta el método de destilación o entrenamiento de la cabeza MTP. La innovación técnica destacable de este repositorio concreto es la cuantización DWQ: a diferencia del round-to-nearest (RTN), DWQ utiliza datos de calibración para decidir escalas y desplazamientos antes de redondear, de modo que los valores atípicos no dominan la rejilla de cuantización. Según el autor, esto acerca el resultado a 4 bits a la calidad del modelo en bf16 y no introduce coste adicional en velocidad de inferencia.

## Capacidades

- Generación de texto conversacional en formato chat, con plantilla compatible con `chat_template_kwargs`.
- Contexto largo de hasta 262.144 tokens, adecuado para documentos extensos, bases de código completas o historiales de conversación muy largos.
- Modo de razonamiento (thinking) activable o desactivable mediante `enable_thinking` en la plantilla de chat.
- Decodificación especulativa nativa mediante la cabeza MTP, con una tasa de aceptación declarada del 85% y una profundidad de 3 tokens.
- Inferencia exclusivamente de texto: la torre de visión ha sido eliminada del checkpoint, pese a que la etiqueta `image-text-to-text` figure entre los tags del repositorio.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente, aunque el contexto largo y el modo thinking son habilitantes técnicos.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).
- Despliegue orientado a MLX-LM y al servidor oMLX con endpoint compatible con la API de OpenAI (`/v1/chat/completions`).

## Casos de uso

- Analisis de repositorios completos en local: con 262.144 tokens de contexto, el modelo puede ingerir un proyecto de tamaño medio y responder preguntas sobre dependencias cruzadas o arquitectura sin trocear el código y sin depender de la nube.
- Asistente de escritorio privado en Apple Silicon: al ejecutarse con MLX sobre un M3 Max, permite mantener conversaciones y documentos sensibles completamente en local, sin llamadas a APIs externas, con unos 17 tok/s medidos con MTP activo.
- Resumen y extraccion de informacion en documentacion tecnica larga: manuales, normativas o expedientes de cientos de páginas caben en una sola ventana de contexto, lo que evita pipelines de recuperación complejos para consultas puntuales.
- Generacion de codigo asistida en el editor: el modelo puede integrarse en un flujo local tipo plugin, aprovechando la decodificación especulativa para reducir la latencia percibida en autocompletado de bloques medianos.
- Prototipado de agentes con contexto acumulativo: el modo thinking desactivable permite alternar entre respuestas rápidas y respuestas razonadas dentro del mismo servidor oMLX, útil en bucles de agente donde no todos los pasos requieren razonamiento explícito.
- Traduccion y reescritura de textos largos: aunque no se declaran idiomas soportados, el contexto extendido permite traducir documentos completos manteniendo coherencia terminológica a lo largo de todo el texto en una única pasada.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio sirve como referencia para medir el impacto real de DWQ 4-bit frente a RTN sobre una arquitectura híbrida con contexto largo, comparando perplejidad y calidad de generación.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son mediciones de velocidad realizadas en un M3 Max de 64 GB con oMLX. No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K y similares) en la información disponible.

| Metrica | Valor |
|---|---|
| Baseline sin MTP | ~13 tok/s |
| Con MTP (profundidad 3) | ~17 tok/s |
| Tasa de aceptación MTP | ~85% |
| Aceleración | ~1,3x |
| Hardware de medida | Apple M3 Max 64 GB, oMLX |
| MMLU, HumanEval, GSM8K | no disponible |

## Requisitos de hardware

- VRAM / memoria unificada estimada para inferencia: aproximadamente 17 GB de pesos cuantizados a 4 bits, más el coste de caché KV de las 18 capas de atención global y el estado recurrente fijo de las 54 capas GatedDeltaNet.
- GPU recomendadas: no se documenta soporte CUDA en la información proporcionada. El hardware de referencia es Apple Silicon, concretamente un M3 Max con 64 GB de memoria unificada.
- Cabe en GPU de consumo: no confirmado. En Apple Silicon, un equipo con al menos 24-32 GB de memoria unificada sería el mínimo razonable dado el tamaño de pesos, aunque no hay validación publicada al respecto.
- Opciones de despliegue: MLX-LM (carga y generación vía `mlx_lm.load`), y servidor oMLX con endpoint compatible con OpenAI. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI, y no se ofrece formato GGUF.
- Latencia y throughput: ~13 tok/s sin MTP y ~17 tok/s con MTP a profundidad 3 sobre M3 Max 64 GB. El tiempo hasta el primer token y el comportamiento con contexto largo no están publicados.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos en la información proporcionada, por lo que la comparativa cuantitativa no es posible. A continuación se recoge únicamente lo que puede afirmarse con certeza a partir del material disponible.

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Agnes-3.0-Flash-DWQ-4bit-MTP (este repo) | ~32,2B | 262.144 tokens | DWQ 4-bit, group_size=64 | Apache 2.0 | HuggingFace, safetensors, orientado a MLX |
| Agnes-3.0-Flash (base, bf16) | ~33B | 262.144 tokens | sin cuantizar | Apache 2.0 | no disponible en esta información |
| Agnes-3.0-Flash con visión | ~33B | 262.144 tokens | sin cuantizar | Apache 2.0 | no disponible en esta información |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La torre de visión ha sido eliminada, de modo que el modelo no procesa imágenes pese a que el tag `image-text-to-text` aparezca en el repositorio. Cualquier intento de uso multimodal fallará.
- El ecosistema de ejecución está restringido a MLX y oMLX. No hay GGUF ni confirmación de soporte en vLLM, llama.cpp, Ollama o TGI, lo que descarta su uso directo en despliegues CUDA convencionales.
- El repositorio registra 0 descargas y 0 likes, con fecha de creación y actualización separadas por menos de un minuto. No hay evidencia de validación independiente de la calidad del checkpoint cuantizado.
- La cuantización DWQ a 4 bits introduce degradación respecto a bf16, aunque el autor afirme que es menor que con RTN. No se publican métricas de perplejidad ni comparaciones cuantitativas que respalden esa afirmación.
- La tasa de aceptación MTP del 85% y la aceleración de 1,3x se midieron únicamente en un M3 Max 64GB con oMLX; no son extrapolables a otros hardware, cuantizaciones o tipos de prompt.
- No se declara lista de idiomas soportados, por lo que el comportamiento en castellano no está verificado.
- No hay información sobre sesgos, alineamiento, filtros de seguridad ni datos de entrenamiento, lo que dificulta evaluar riesgos de contenido dañino o alucinación en producción.
- Riesgo de alucinación: inherente a cualquier modelo generativo de este tamaño y no cuantificado en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación, pero el autor no ofrece garantías sobre el checkpoint derivado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/hermitdave/Agnes-3.0-Flash-DWQ-4bit-MTP
- Modelo base Agnes-3.0-Flash, de Agnes AI: sin URL disponible en la información proporcionada
- Hermes Agent (herramienta usada para la conversión y subida): https://hermes-agent.nousresearch.com
- oMLX, servidor de inferencia mencionado: sin URL disponible en la información proporcionada
- MLX-LM, librería de carga y generación: sin URL disponible en la información proporcionada
- Paper o blog técnico sobre DWQ: no disponible
- Demos o espacios asociados: no disponible
