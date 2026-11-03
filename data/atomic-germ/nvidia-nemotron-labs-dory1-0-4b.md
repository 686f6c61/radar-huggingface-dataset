# Atomic-Germ/NVIDIA-Nemotron-Labs-Dory1.0-4B

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B es un modelo de lenguaje de aproximadamente 4.000 millones de parámetros (3.975.229.440 según los pesos en safetensors) desarrollado por NVIDIA dentro de su línea Nemotron Labs y distribuido en HuggingFace por el usuario Atomic-Germ. Su rasgo diferencial es la arquitectura "looped" o de recurrencia latente: en lugar de apilar capas únicas, el modelo reutiliza un bloque compartido de capas recurrentes aplicándolo varias veces por token, lo que permite escalar el cómputo de inferencia sin aumentar el número de parámetros.

El modelo resuelve el problema de obtener razonamiento de mayor calidad en un footprint pequeño: un único checkpoint puede ejecutarse con distintos presupuestos de cómputo (1, 2 o 4 bucles) sin reentrenar ni cambiar de pesos, lo que lo hace atractivo para despliegues con restricciones de memoria o latencia. Emplea una arquitectura normalized-GPT (nGPT) con atención de ventana deslizante (SWA) intercalada con capas de atención completa, y soporta contextos de hasta 256K tokens.

Es relevante ahora porque combina tres tendencias recientes: preentrenamiento nativo en formato de 4 bits (NVFP4), recurrencia latente para eficiencia de tokens y caché KV optimizada para bucles. La fecha de publicación indicada en la model card es el 16 de octubre de 2026 y el modelo se distribuye bajo licencia OpenMDW 1.1, apta para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Looped (latent-recurrent) normalized-GPT con atención híbrida (SWA + atención completa intercaladas) |
| Parámetros totales | 3.975.229.440 (~4B) |
| Parámetros activos | No aplica (no es MoE); el bloque recurrente se reaplica 1, 2 o 4 veces en inferencia |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantización | BF16, MXFP8, NVFP4, Q5_K_M (GGUF) |
| Idiomas soportados | Inglés |
| Licencia | OpenMDW License Agreement 1.1 (uso comercial y no comercial) |
| Formato de pesos | Safetensors (BF16); disponibles también MXFP8, NVFP4 y GGUF Q5_K_M |

## Arquitectura y entrenamiento

Dory1.0-4B es un transformer de tipo nGPT (normalized-GPT) con un diseño "looped": la pila de capas se divide en tres grupos —entrada (I), recurrente (R) y salida (O)—. Los bloques de entrada y salida tienen 8 capas cada uno, mientras que el bloque recurrente consta de 20 capas que se aplican repetidamente entre ambos, reinjectando la entrada en cada iteración. Esto permite un cómputo elástico por token: con más bucles, más profundidad efectiva sin más parámetros. La atención alterna capas de ventana deslizante con capas de atención completa, lo que reduce coste en contextos largos.

El preentrenamiento se realizó de forma nativa en NVFP4, el formato de coma flotante de 4 bits de NVIDIA, y posteriormente se continuó en BF16. Los datos de preentrenamiento proceden de `nvidia/nemotron-pre-training-datasets` con fecha de corte en septiembre de 2025, y el postentrenamiento de `nvidia/nemotron-post-training-v3` con corte en mayo de 2026. La model card no detalla el número exacto de tokens ni la composición del dataset, ni especifica si se empleó RLHF o DPO. Una innovación destacable es el "last-loop KV caching": se mantiene una única caché KV por capa de atención recurrente, de modo que el modelo no incurre en sobrecoste de memoria respecto a un modelo no looped, independientemente del número de bucles.

## Capacidades

- Generación de texto conversacional en inglés con razonamiento general.
- Razonamiento de múltiples pasos y "pensamiento en espacio latente": el cómputo extra por bucle se invierte en razonamiento interno, no en generar más tokens.
- Codificación y tareas agénticas: resultados destacados en SciCode, SWE-bench Verified y Terminal-Bench 2.1 (ver benchmarks).
- Inferencia elástica: el mismo checkpoint puede servirse con 1, 2 o 4 bucles según el presupuesto de cómputo y precisión requerida.
- Soporte de contexto largo de hasta 256K tokens, adecuado para documentos extensos y conversaciones multi-turno.
- Capacidades multilingües limitadas al inglés según la model card.
- No se documenta soporte explícito de tool calling, function calling, visión ni audio en la información disponible.

## Casos de uso

- Agentes de codificación en producción: el modelo obtiene 61,8 en SWE-bench Verified con 4 bucles, lo que lo hace adecuado para resolución automática de issues y parches en repositorios, integrándose en pipelines de CI/CD.
- Automatización de terminal y tareas de sistema: con 22,2 en Terminal-Bench 2.1 (4 bucles) puede emplearse en agentes que ejecutan comandos y resuelven tareas de administración en entornos controlados.
- Asistente de atención al cliente con contexto largo: sus 256K tokens permiten mantener conversaciones multi-turno con historial extenso y documentación de referencia en una sola ventana.
- Análisis de documentos extensos: resumen, extracción y preguntas sobre contratos, informes o código fuente de gran tamaño sin truncamiento agresivo.
- Despliegue en hardware con restricciones de memoria: gracias a la caché KV de último bucle y a los formatos NVFP4 y Q5_K_M, puede servirse en GPUs de gama media o consumer con presupuestos ajustados.
- Razonamiento científico y matemático asistido: el rendimiento en SciCode (35,11 con 4 bucles) lo hace útil para asistentes de investigación que generan y validan código científico.
- Servicio con presupuesto de cómputo adaptable: en picos de carga se reduce a 1 bucle para maximizar throughput y en tareas críticas se sube a 4 bucles para maximizar precisión, sin cambiar de modelo.

## Benchmarks y rendimiento

Resultados publicados en la model card († = puntuación reportada por terceros; guion = no disponible):

| Tarea | Dory 1 loop | Dory 2 loops | Dory 4 loops | Qwen3.5-4B | Qwen3.5-9B | Gemma 4 26B A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|---|---|
| SciCode | 27,3 | 34,94 | 35,11 | 25,82 | 28,21 | 40,32 | 37,24 |
| SWE-bench Verified | 50,3 | 59,5 | 61,8 | 54,7 | 61 | 57,40 | 73,4† |
| Terminal-Bench 2.1 | 12,5 | 18,1 | 22,2 | 15 | 24 | 35 | 43 |
| τ³-bench (Banking) | 11,6 | 12,89 | 14,69 | 5,03 | 7,22 | — | — |

Los datos muestran una mejora monótona al aumentar el número de bucles. Con 4 bucles, Dory1.0-4B supera a Qwen3.5-4B en SciCode, SWE-bench Verified y τ³-bench, y se acerca a Qwen3.5-9B en SWE-bench Verified (61,8 frente a 61). No se han publicado resultados de MMLU, HumanEval ni GSM8K en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16: aproximadamente 8 GB solo para pesos, más caché KV; el tamaño del repo es de 8,0 GB.
- VRAM estimada en NVFP4: aproximadamente 2-2,5 GB para pesos, lo que permite despliegue en GPUs consumer de 8 GB o incluso integradas con suficiente memoria compartida.
- VRAM estimada en GGUF Q5_K_M: en torno a 3 GB para pesos, apto para llama.cpp y Ollama en GPUs de 6-8 GB.
- GPUs recomendadas: A100, H100 o L40S para servicio de producción con contexto largo y varios bucles; RTX 4090, RTX 4080 o RTX 3090 para desarrollo y despliegue en consumer.
- Cabe en GPUs consumer: sí, especialmente en NVFP4 y Q5_K_M; en BF16 requiere al menos 12-16 GB para margen con caché KV.
- Opciones de despliegue: transformers (biblioteca declarada), vLLM y TGI para servicio de alto throughput, llama.cpp y Ollama para los pesos GGUF Q5_K_M.
- Latencia y throughput: no disponibles en la información proporcionada; dependen linealmente del número de bucles configurado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dory1.0-4B (4 loops) | ~4B | 256K | 61,8 | OpenMDW 1.1 | HuggingFace |
| Qwen3.5-4B | ~4B | No disponible | 54,7 | No disponible | HuggingFace |
| Qwen3.5-9B | ~9B | No disponible | 61 | No disponible | HuggingFace |
| Gemma 4 26B A4B | 26B (MoE, ~4B activos) | No disponible | 57,40 | No disponible | HuggingFace |

Frente a Qwen3.5-4B, Dory1.0-4B ofrece mayor rendimiento en tareas agénticas y de código con un tamaño comparable, además de contexto de 256K y cómputo elástico. Frente a Qwen3.5-9B, iguala en SWE-bench con la mitad de parámetros. Frente a Gemma 4 26B A4B, queda por debajo en Terminal-Bench y SciCode pero con un footprint mucho menor en memoria. La comparativa se limita a los datos publicados en la model card; no se dispone de información sobre contexto o licencia de los modelos comparados.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación inherente a los LLM de 4B; el razonamiento en espacio latente no elimina este problema y puede dificultar la inspección del proceso de pensamiento.
- La arquitectura looped es poco común: el soporte en herramientas de terceros (vLLM, llama.cpp) puede ser limitado o requerir versiones específicas; conviene validar la compatibilidad antes de producción.
- El rendimiento depende críticamente del número de bucles configurado; con 1 bucle cae notablemente en tareas agénticas (50,3 frente a 61,8 en SWE-bench Verified).
- Los resultados de benchmarks son los reportados por el autor; no se dispone de verificación independiente en la información proporcionada.
- Licencia OpenMDW 1.1: permite uso comercial, pero conviene revisar los términos completos del acuerdo antes de desplegar.
- El repositorio de HuggingFace no registra descargas ni likes en el momento de la consulta, lo que sugiere una distribución reciente o de nicho; la comunidad y el soporte pueden ser escasos.
- Fechas de corte de datos: preentrenamiento septiembre de 2025, postentrenamiento mayo de 2026; el conocimiento del modelo no va más allá de esas fechas.

## Enlaces

- HuggingFace: https://huggingface.co/Atomic-Germ/NVIDIA-Nemotron-Labs-Dory1.0-4B
- Página de desarrolladores de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW 1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Dataset de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
