# electricpipelines/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-GGUF es una redistribución de cuantizaciones GGUF del modelo `orcarouter/Qwen3.8-27B-Uncensored-GGUF`, que a su vez es una versión "abliterated" (con los mecanismos de rechazo eliminados) de `Qwen/Qwen3.8-27B`. El repositorio lo publica el usuario `electricpipelines` bajo la etiqueta comercial "DeepSeek Unchained" en sus niveles Silver, Gold y Platinum, pero los ficheros son copias byte a byte de los originales de orcarouter, sin recuantizar ni modificar, según declara el propio autor.

El modelo base cuenta con 27.320.697.856 parámetros (aproximadamente 27,3 mil millones), lo que lo sitúa en la gama de modelos densos de tamaño medio-grande. La información disponible no detalla la arquitectura interna, la longitud de contexto ni la composición del dataset de entrenamiento original; solo se indica que llama.cpp requiere la arquitectura `qwen35` (probada con el build b10919), lo que sugiere una variante de la familia Qwen 3.5/3.8 con atención estándar.

La relevancia de este repositorio es doble: por un lado, ofrece cuantizaciones de 3, 4 y 8 bits con métricas de divergencia KL publicadas frente al F16, lo que permite elegir el compromiso calidad/tamaño con datos objetivos; por otro, al tratarse de un modelo abliterated, elimina las negativas de seguridad del Qwen original, algo relevante para investigación sobre alineación, red teaming y evaluación de comportamientos no filtrados, pero con implicaciones éticas y legales que el usuario debe asumir.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, arquitectura `qwen35` en llama.cpp); detalles internos no disponibles |
| Parámetros totales | 27.320.697.856 (~27,3 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | IQ3_M, Q4_K_M, Q8_0 (tres ficheros GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 (heredada de Qwen/Qwen3.8-27B) |
| Formato de pesos | GGUF (texto únicamente; sin cabecera MTP ni mmproj) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna más allá de que llama.cpp la identifica como `qwen35`, lo que apunta a un transformer de la familia Qwen 3.5/3.8 con atención estándar (no se documenta atención lineal, SSM ni arquitectura híbrida). El modelo es denso, con 27,3 mil millones de parámetros, y los ficheros publicados son solo de texto: no incluyen cabecera MTP (multi-token prediction) ni proyector multimodal `mmproj`.

El proceso de entrenamiento original de Qwen3.8-27B no se detalla en la información proporcionada: no se indica el número de tokens, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineación. Lo que sí se documenta es la modificación posterior: la versión "Uncensored" es un build abliterated, es decir, se han eliminado las direcciones de activación asociadas a la negativa a responder, de modo que el modelo cumple peticiones que el original rechaza. Las cuantizaciones fueron evaluadas por orcarouter con `llama-perplexity` (divergencia KL frente a los logits del F16, wikitext-2-raw, contexto 512, 100 chunks) y `llama-bench` para velocidad, sobre un Apple M4 Max con 128 GB de memoria.

## Capacidades

- Generación de texto conversacional multi-turno (etiqueta `conversational` en el repositorio).
- Razonamiento y respuesta a instrucciones sin los filtros de rechazo del modelo original.
- Generación de código y matemáticas: capacidades heredadas del Qwen3.8-27B base, aunque no se publican evaluaciones específicas en este repositorio.
- Soporte de tool calling / function calling: no documentado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado explícitamente.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío).
- Modo "thinking": no disponible en estos ficheros (se indica que no incluyen cabecera MTP).
- Visión y audio: no disponibles; los ficheros son solo de texto y no incluyen `mmproj`.

## Casos de uso

- Investigación sobre alineación y abliteration: comparar las respuestas del modelo abliterated con las del Qwen3.8-27B original para estudiar qué comportamientos se eliminan al borrar las direcciones de rechazo y cómo afecta a la coherencia general.
- Red teaming y evaluación de seguridad: generar respuestas a prompts que el modelo original rechaza para construir conjuntos de datos de evaluación de filtros y clasificadores de contenido en pipelines de moderación.
- Despliegue local en estación de trabajo: con la cuantización IQ3_M (12,77 GB) o Q4_K_M (16,81 GB) el modelo cabe en GPUs de consumo alto o en un Apple Silicon con memoria unificada, permitiendo inferencia privada sin conexión a servicios en la nube.
- Generación de texto creativo sin restricciones temáticas: escritura de ficción, guiones o narrativa que aborde temas sensibles, usando Q4_K_M como equilibrio entre calidad (KLD medio 0,0205, 93,75 % de coincidencia en el token top) y tamaño.
- Servicio de chat autoalojado: integración en llama.cpp o servidores compatibles con la API de OpenAI (el repositorio está etiquetado como `endpoints_compatible`) para asistentes conversacionales internos donde se requiere control total sobre el filtrado.
- Evaluación de cuantizaciones: usar los tres ficheros publicados (IQ3_M, Q4_K_M, Q8_0) para medir el impacto de la compresión en tareas downstream propias, apoyándose en las métricas KL ya publicadas como referencia.
- Prototipado de pipelines de generación de código: el tamaño de 27 B permite ejecutar el modelo en una sola GPU de 24 GB con Q4_K_M, suficiente para autocompletado y revisión de código en entornos de desarrollo locales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Sí se publican métricas de fidelidad de cuantización y velocidad medidas con llama.cpp b10919 sobre un Apple M4 Max de 128 GB:

| Cuantización | Tamaño (GB) | KLD medio | KLD p99 | Coincidencia token top (%) | PPL ratio vs F16 | pp512 (t/s) | tg128 (t/s) |
|---|---:|---:|---:|---:|---:|---:|---:|
| IQ3_M | 12,77 | 0,0576 | 0,568 | 89,78 | 1,0348 | 213,0 | 18,21 |
| Q3_K_M (referencia) | 13,50 | 0,0687 | 0,635 | 88,75 | 1,0472 | 206,7 | 16,26 |
| Q4_K_M | 16,81 | 0,0205 | 0,201 | 93,75 | 1,0039 | 209,8 | 17,71 |
| Q5_K_M (referencia) | 19,54 | 0,0064 | 0,063 | 96,49 | 1,0045 | 188,2 | 12,93 |
| Q6_K (referencia) | 22,43 | 0,0023 | 0,020 | 97,82 | 1,0003 | 162,6 | 13,16 |
| Q8_0 | 29,05 | 0,0003 | 0,002 | 99,33 | 1,0014 | 182,3 | 10,93 |

Las filas Q3_K_M, Q5_K_M y Q6_K corresponden a cuantizaciones medidas por orcarouter que no se incluyen en este repositorio; se muestran como contexto de la comparación. IQ3_M superó a Q3_K_M en todas las métricas, motivo por el que se eligió como el nivel más pequeño.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 13-14 GB con IQ3_M, 17-18 GB con Q4_K_M y 30-31 GB con Q8_0, añadiendo margen para el contexto KV.
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX A6000 para Q8_0; RTX 4090 (24 GB) o RTX 3090 para Q4_K_M; GPUs de 16 GB o Apple Silicon con 16-24 GB de memoria unificada para IQ3_M.
- Cabe en GPU de consumo: sí. Q4_K_M en RTX 4090/3090 (24 GB) e IQ3_M en RTX 4080/4070 Ti Super (16 GB) o en Mac con 24 GB o más.
- Opciones de despliegue: llama.cpp (build reciente con soporte de arquitectura `qwen35`; probado con b10919), y por extensión cualquier frontend basado en llama.cpp como Ollama o LM Studio. No se documenta compatibilidad con vLLM ni TGI para estos ficheros GGUF.
- Latencia y throughput: medidos en Apple M4 Max con 128 GB: 213,0 t/s de prefill (pp512) y 18,21 t/s de generación (tg128) con IQ3_M; 209,8 t/s y 17,71 t/s con Q4_K_M; 182,3 t/s y 10,93 t/s con Q8_0. No hay datos para GPU NVIDIA.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| electricpipelines/Qwen3.8-27B-Uncensored-GGUF | ~27,3 B | No disponible | Apache-2.0 | GGUF (IQ3_M, Q4_K_M, Q8_0) | Copia de orcarouter; abliterated; solo texto |
| orcarouter/Qwen3.8-27B-Uncensored-GGUF | ~27,3 B | No disponible | Apache-2.0 | GGUF (más cuantizaciones) | Fuente original; incluye Q3_K_M, Q5_K_M, Q6_K y F16 |
| Qwen/Qwen3.8-27B | ~27,3 B | No disponible | Apache-2.0 | Safetensors y otros | Modelo original con alineación de seguridad intacta |
| Alternativas abliterated de ~27 B | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificables en la información proporcionada |

## Limitaciones y advertencias

- El modelo ha perdido sustancialmente su alineación de seguridad: cumplirá peticiones que el Qwen3.8-27B original rechaza. El usuario es responsable del uso y del contenido generado.
- Riesgo elevado de generar contenido dañino, ilegal o sexualmente explícito sin filtros; no apto para aplicaciones orientadas al público sin una capa de moderación externa.
- La abliteration puede degradar capacidades generales (coherencia, razonamiento, seguimiento de instrucciones) respecto al modelo original; no se publican evaluaciones que cuantifiquen esta pérdida.
- Sesgos conocidos del modelo base no documentados en la información disponible; se heredan los del Qwen3.8-27B original.
- Idiomas soportados no especificados; el rendimiento fuera del inglés y el chino es incierto.
- Longitud de contexto no disponible; no se puede planificar su uso en tareas de contexto largo sin verificarla empíricamente.
- Los ficheros son solo de texto: no incluyen cabecera MTP ni `mmproj`, por lo que no hay multimodalidad ni decodificación especulativa multi-token.
- Requiere una versión reciente de llama.cpp con arquitectura `qwen35`; versiones antiguas no cargarán el modelo.
- Licencia Apache-2.0 permite uso comercial, pero la responsabilidad legal sobre el contenido generado recae en el desplegador; conviene revisar la model card de orcarouter para el descargo completo.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; es una redistribución de terceros sin mantenimiento propio documentado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/electricpipelines/Qwen3.8-27B-Uncensored-GGUF
- Modelo base (orcarouter): https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored-GGUF
- Modelo original Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- llama.cpp (requerido, build reciente con arquitectura `qwen35`): no se proporciona enlace específico en la información disponible
