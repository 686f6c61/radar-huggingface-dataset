# nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-MXFP8

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B-MXFP8 es un modelo de lenguaje de 4B parámetros (3.975.229.440 exactos según los safetensors) desarrollado por NVIDIA dentro de su línea Nemotron Labs. Su particularidad es que no es un transformer convencional: emplea una arquitectura *looped* (latente-recurrente) sobre una base normalized-GPT (nGPT), en la que un bloque compartido de capas se aplica varias veces entre un bloque de entrada y uno de salida. Esto permite gastar más cómputo por token sin aumentar el número de parámetros, y ajustar el presupuesto de inferencia en tiempo de ejecución sin reentrenar ni cambiar de checkpoint.

El modelo se distribuye en formato MXFP8 (también existen variantes BF16, NVFP4 y Q5_K_M), soporta contextos de hasta 256K tokens y está entrenado nativamente en NVFP4 antes de continuar en BF16. Está orientado a razonamiento de propósito general con huella pequeña, con foco en tareas de código, agentes y uso conversacional, y su licencia OpenMDW-1.1 permite uso comercial.

Es relevante ahora porque propone una vía distinta al escalado habitual: en lugar de aumentar parámetros, reutiliza el mismo bloque recurrente para ganar precisión en tareas de razonamiento (los benchmarks publicados muestran mejoras sustanciales al pasar de 1 a 2 y 4 bucles), y porque incorpora técnicas de ahorro de memoria (last-loop KV caching) que evitan el crecimiento del KV cache con cada bucle.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped (latent-recurrent) normalized-GPT (nGPT) con capas intercaladas de sliding-window attention (SWA) y atención completa |
| Parametros totales | 3.975.229.440 (~4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 256K tokens |
| Tipos de cuantizacion | MXFP8 (este checkpoint); también disponibles BF16, NVFP4 y Q5_K_M |
| Idiomas soportados | inglés |
| Licencia | OpenMDW License Agreement, version 1.1 |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers |

## Arquitectura y entrenamiento

Dory1.0-4B se basa en una arquitectura normalized-GPT (nGPT) con atención híbrida: capas de sliding-window attention intercaladas con capas de atención completa. La pila de capas se divide en tres grupos: un bloque de entrada (I) de 8 capas, un bloque recurrente (R) de 20 capas que se aplica repetidamente, y un bloque de salida (O) de 8 capas; la entrada se reinyecta en cada bucle. El número de bucles es configurable en inferencia (1, 2, 4...), lo que permite intercambiar cómputo por precisión sin cambiar de modelo.

El preentrenamiento se realizó nativamente en NVFP4, el formato de coma flotante de 4 bits de NVIDIA, y continuó en BF16. Los datos de preentrenamiento provienen de nvidia/nemotron-pre-training-datasets (fecha de corte septiembre de 2025) y los de postentrenamiento de nvidia/nemotron-post-training-v3 (corte mayo de 2026). La model card no detalla el número total de tokens ni la composición exacta del dataset, ni especifica si se emplearon RLHF o DPO. Como innovaciones destacables: el *elastic inference compute* (mismo checkpoint con distintos presupuestos de cómputo), la eficiencia de tokens (menos tokens generados porque el cómputo extra se invierte en "pensar" en espacio latente) y el *last-loop KV caching*, que mantiene un único caché por capa de atención recurrente y elimina el sobrecoste de KV cache respecto a un modelo no looped.

## Capacidades

- Generación de texto y razonamiento de propósito general en inglés.
- Razonamiento de código y tareas agénticas (SciCode, SWE-bench Verified, Terminal-Bench en los benchmarks publicados).
- Tareas de agente con herramientas en dominios como banca (τ³-bench Banking).
- Ajuste del cómputo de inferencia por número de bucles (1, 2, 4...) para tareas que requieren más o menos razonamiento.
- Contexto largo de hasta 256K tokens para documentos extensos y conversaciones multi-turno.
- Compatible con el pipeline text-generation de transformers y con endpoints compatibles.
- Capacidades multilingües limitadas al inglés.
- No se documentan en la información disponible capacidades de visión, audio, tool calling explícito ni modo thinking separado.

## Casos de uso

- Razonamiento sobre código en producción: el modelo obtiene 61,8 en SWE-bench Verified con 4 bucles, por lo que puede usarse para resolver issues y generar parches en repositorios, ajustando el número de bucles según la dificultad de la tarea.
- Automatización de terminal y shell: con 22,2 en Terminal-Bench 2.1 a 4 bucles, encaja en agentes que ejecutan comandos y resuelven tareas de sistema en entornos controlados.
- Asistentes de atención al cliente con contexto largo: sus 256K tokens permiten mantener historiales de conversación extensos y documentación de producto en el mismo contexto, en inglés.
- Agentes de dominio financiero: los resultados en τ³-bench (Banking) lo hacen adecuado para flujos de agente con herramientas en banca, como consultas de cuentas y operaciones guiadas.
- Procesamiento de documentación extensa: resumen y extracción de información sobre contratos, informes o bases de conocimiento de gran longitud gracias a la ventana de 256K.
- Despliegue en hardware limitado: al ser un modelo de 4B en MXFP8 (repo de 4,8 GB), puede servirse en GPUs de consumo para prototipos y aplicaciones de razonamiento ligero.
- Experimentación con inferencia elástica: útil en investigación para estudiar el equilibrio entre cómputo por token y precisión sin reentrenar, cambiando solo el número de bucles.

## Benchmarks y rendimiento

Resultados publicados en la model card (guion = no disponible; † = puntuación reportada por el autor del benchmark):

| Tarea | Dory1.0-4B (1 bucle) | Dory1.0-4B (2 bucles) | Dory1.0-4B (4 bucles) | Qwen3.5-4B | Qwen3.5-9B | Gemma 4 26B A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|---|---|
| SciCode | 27,3 | 34,94 | 35,11 | 25,82 | 28,21 | 40,32 | 37,24 |
| SWE-bench Verified | 50,3 | 59,5 | 61,8 | 54,7 | 61,0 | 57,40 | 73,4† |
| Terminal-Bench 2.1 | 12,5 | 18,1 | 22,2 | 15 | 24 | 35 | 43 |
| τ³-bench (Banking) | 11,6 | 12,89 | 14,69 | 5,03 | 7,22 | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: el repo en MXFP8 ocupa 4,8 GB, por lo que la inferencia requiere aproximadamente 5-6 GB de VRAM más el KV cache; en Q5_K_M el peso sería menor y en BF16 aproximadamente el doble (unos 8 GB).
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cabría en GPUs de consumo con 8 GB o más (por ejemplo, RTX 3060 Ti/4060 Ti/4070 en adelante) y en GPUs de datacenter (A100, H100) para mayor throughput.
- Cabe en GPU de consumo: sí, en modelos con al menos 8 GB de VRAM en MXFP8 o Q5_K_M.
- Opciones de despliegue: transformers (librería declarada), con soporte de compressed-tensors; otros motores (vLLM, llama.cpp, Ollama, TGI) no se confirman en la información disponible.
- Latencia y throughput: no disponibles. El coste por token escala con el número de bucles configurado; el last-loop KV caching evita que el KV cache crezca con los bucles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Dory1.0-4B (4 bucles) | 4B | 256K | 61,8 | OpenMDW-1.1 | Hugging Face (NVIDIA) |
| Qwen3.5-4B | 4B | no disponible | 54,7 | no disponible | no disponible |
| Qwen3.5-9B | 9B | no disponible | 61,0 | no disponible | no disponible |
| Gemma 4 26B A4B | 26B (MoE, 4B activos) | no disponible | 57,40 | no disponible | no disponible |
| Qwen3.6-35B-A3B | 35B (MoE, 3B activos) | no disponible | 73,4† | no disponible | no disponible |

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- Riesgo de alucinación inherente a los LLM; no se publican evaluaciones específicas de fidelidad en la información disponible.
- Sesgos conocidos: no documentados en la model card; los datos de preentrenamiento y postentrenamiento son de NVIDIA y no se detalla su composición.
- El rendimiento depende fuertemente del número de bucles: con 1 bucle cae de forma notable en tareas agénticas (Terminal-Bench 2.1: 12,5 frente a 22,2 con 4 bucles), lo que exige calibrar el presupuesto de cómputo por caso de uso.
- Restricciones de licencia: OpenMDW-1.1 permite uso comercial, pero conviene revisar los términos completos del acuerdo antes de desplegar.
- El checkpoint MXFP8 requiere soporte de compressed-tensors; la compatibilidad con motores de inferencia distintos de transformers no está confirmada.
- No se documentan capacidades de visión, audio ni tool calling nativo; verificar antes de integrar en pipelines agénticos.
- Fechas de corte de datos: preentrenamiento septiembre de 2025 y postentrenamiento mayo de 2026; el conocimiento del modelo no va más allá.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-MXFP8
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Texto de la licencia OpenMDW-1.1: https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Página de desarrollador de Nemotron: https://developer.nvidia.com/nemotron
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Dataset de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Dataset de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
