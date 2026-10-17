# nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4

## Resumen

NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4 es un modelo de lenguaje desarrollado por NVIDIA dentro de su línea Nemotron Labs. Su rasgo distintivo es la arquitectura: un modelo denso con bucle latente (looped LM) sobre un backbone normalized-GPT (nGPT), en el que un bloque recurrente de 20 capas se aplica repetidamente entre un bloque de entrada y otro de salida de 8 capas cada uno, con reinyección de la entrada en cada bucle.

Este checkpoint concreto está cuantizado en NVFP4, el formato de coma flotante de 4 bits de NVIDIA, y se distribuye también en BF16, MXFP8 y Q5_K_M. Soporta hasta 256K tokens de contexto, está entrenado únicamente en inglés y se publica bajo la licencia OpenMDW 1.1, que la propia model card describe como apta para uso comercial y no comercial.

Su relevancia radica en la combinación de huella pequeña, contexto muy largo y cómputo de inferencia elástico: el mismo checkpoint puede ejecutarse con 1, 2 o 4 bucles según el presupuesto disponible, con mejoras marcadas en tareas de código y agentes (50,3 a 61,8 en SWE-bench Verified al pasar de 1 a 4 bucles) sin necesidad de cambiar de modelo ni reentrenar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Looped (latent-recurrent) normalized-GPT con capas intercaladas de sliding-window attention (SWA) y full attention |
| Parametros totales | 4B según la model card; el recuento de safetensors del repositorio indica 2.323.722.240 parámetros (la model card no explica la diferencia) |
| Parametros activos | No aplica: no es un modelo MoE (arquitectura densa con bucle latente) |
| Longitud de contexto | Hasta 256K tokens |
| Tipos de cuantizacion | NVFP4 (este repositorio), BF16, MXFP8 y Q5_K_M (disponibles según la model card). Las etiquetas del repositorio incluyen además "8-bit" y "modelopt" |
| Idiomas soportados | Inglés (en) |
| Licencia | OpenMDW License Agreement, version 1.1 (campo `license: other`, `license_name: openmdw-1.1`) |
| Formato de pesos | safetensors (PyTorch, librería transformers) |
| Precision de preentrenamiento | NVFP4 nativo, con continuación en BF16 |
| Fecha de publicacion | 16 de octubre de 2026 |
| Fecha de corte de datos | Preentrenamiento: septiembre de 2025. Postentrenamiento: mayo de 2026 |
| Tamano del repositorio | 3,2 GB |
| Pipeline | text-generation |
| Datasets de entrenamiento | nvidia/nemotron-post-training-v3, nvidia/nemotron-pre-training-datasets |

## Arquitectura y entrenamiento

Dory1.0-4B emplea un backbone normalized-GPT (nGPT) con una pila de capas dividida en tres grupos: un bloque de entrada (I) de 8 capas, un bloque recurrente (R) de 20 capas y un bloque de salida (O) de 8 capas. El bloque recurrente se comparte y se aplica varias veces entre la entrada y la salida, y la entrada se reinjecta en cada iteración del bucle. La atención combina capas de sliding-window attention y de atención completa de forma intercalada. El modelo se preentrenó de forma nativa en NVFP4, el formato de coma flotante de 4 bits de NVIDIA, y posteriormente continuó su entrenamiento en BF16.

La innovación principal es el cómputo de inferencia elástico: como el bloque recurrente es compartido, variar el número de bucles permite ajustar el cómputo por token sin reentrenar ni cambiar de checkpoint. La model card indica además que el modelo es más eficiente en tokens, ya que el cómputo adicional se invierte en "pensar" en espacio latente en lugar de generar salidas más largas. En el plano de memoria, Dory admite last-loop KV caching, que mantiene una única caché por capa de atención recurrente, de modo que el modelo no arrastra sobrecoste de caché KV respecto a un modelo equivalente sin bucle, con independencia del número de bucles configurado.

No se detallan en la información disponible el número exacto de tokens de entrenamiento, la composición completa del dataset ni si se aplicaron técnicas concretas de RLHF o DPO, más allá de la referencia a los datasets de preentrenamiento y postentrenamiento de Nemotron.

## Capacidades

- Generación de texto conversacional en inglés, con etiqueta `conversational` en el repositorio.
- Razonamiento general con huella reducida, orientado a propósito general según la model card.
- Generación y razonamiento sobre código: resultados en SciCode (35,11 con 4 bucles) y SWE-bench Verified (61,8 con 4 bucles).
- uso agéntico en entornos de terminal y resolución de tareas de ingeniería de software: Terminal-Bench 2.1 (22,2 con 4 bucles) y SWE-bench Verified.
- Interacción con herramientas y flujos de múltiples pasos: el resultado en τ³-bench (Banking) apunta a capacidades agénticas, aunque la model card no documenta explícitamente soporte de tool calling o function calling.
- Contexto largo de hasta 256K tokens, adecuado para documentos extensos y conversaciones multi-turno prolongadas.
- Cómputo de inferencia elástico: 1, 2 o 4 bucles sobre el mismo checkpoint para ajustar precisión frente a coste.
- Capacidad multilingüe: limitada al inglés.
- No se documentan capacidades de visión, audio ni un modo de "pensamiento" explícito en tokens; el razonamiento adicional ocurre en espacio latente.

## Casos de uso

- Agentes de código en producción: con 61,8 en SWE-bench Verified a 4 bucles, el modelo puede integrarse en pipelines de resolución automática de issues y parches, ejecutando 1 bucle para triaje rápido y 4 bucles para parches complejos.
- Automatización de tareas de terminal y operaciones: los 22,2 puntos en Terminal-Bench 2.1 lo hacen utilizable como agente de shell para tareas de administración, scripts y diagnóstico, siempre con supervisión humana.
- Análisis de documentos largos en inglés: la ventana de 256K tokens permite procesar contratos, informes técnicos o bases de código completas sin trocear el contexto.
- Asistentes conversacionales en inglés: el modelo es conversacional y ligero, por lo que puede servir como backend de chat en despliegues con presupuesto de VRAM ajustado.
- Procesamiento de operaciones bancarias y de back-office: el resultado en τ³-bench (Banking) de 14,69 a 4 bucles sugiere utilidad en flujos estructurados de atención al cliente con reglas y herramientas.
- Despliegue en hardware de gama de consumo: al estar cuantizado en NVFP4 y ocupar 3,2 GB el repositorio, permite servir inferencia en una única GPU de consumo en lugar de recurrir a clústeres.
- Enrutado por dificultad en sistemas multi-modelo: usar 1 bucle para consultas triviales y 4 bucles para consultas difíciles permite optimizar coste por petición sin mantener dos modelos distintos.
- Generación de datos y evaluación interna en inglés: su tamaño reducido y su contexto largo lo hacen adecuado para tareas de anotación y generación sintética a gran escala en pipelines propios.

## Benchmarks y rendimiento

Resultados publicados en la model card. La columna de Dory1.0-4B varía según el número de bucles configurado. El símbolo † indica puntuaciones reportadas por terceros.

| Tarea | Dory1.0-4B (1 bucle) | Dory1.0-4B (2 bucles) | Dory1.0-4B (4 bucles) | Qwen3.5-4B | Qwen3.5-9B | Gemma 4 26B A4B | Qwen3.6-35B-A3B |
|---|---|---|---|---|---|---|---|
| SciCode | 27,3 | 34,94 | 35,11 | 25,82 | 28,21 | 40,32 | 37,24 |
| SWE-bench Verified | 50,3 | 59,5 | 61,8 | 54,7 | 61,0 | 57,40 | 73,4† |
| Terminal-Bench 2.1 | 12,5 | 18,1 | 22,2 | 15 | 24 | 35 | 43 |
| τ³-bench (Banking) | 11,6 | 12,89 | 14,69 | 5,03 | 7,22 (tabla truncada) | no disponible | no disponible |

Notas: la tabla de la model card consultada aparece truncada a partir del valor 7,22 de Qwen3.5-9B en τ³-bench (Banking), por lo que el resto de celdas de esa fila figuran aquí como no disponibles. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones de conocimiento general.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones calculadas a partir del número de parámetros y del formato; NVIDIA no publica requisitos oficiales de hardware en la información disponible.

- Pesos en NVFP4 (este repositorio): en torno a 2-2,5 GB para 4B parámetros a 4 bits más escalas de bloque. Cabe con holgura en cualquier GPU de consumo moderna.
- Pesos en BF16: aproximadamente 8 GB para 4B parámetros; unos 4,7 GB si se atiende al recuento de safetensors de 2,32B.
- Pesos en Q5_K_M: aproximadamente 2,8-3,5 GB, según el recuento de parámetros que se tome.
- Caché KV: la model card indica que con last-loop KV caching activado el modelo no añade sobrecoste de caché KV respecto a un modelo equivalente sin bucle, con independencia del número de bucles. No se publican cifras concretas de memoria de caché para 256K tokens.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño de pesos, una RTX 4090 (24 GB) o superior aloja cualquiera de los formatos con margen amplio; las GPU de 8-12 GB deberían poder ejecutar la variante NVFP4, aunque la aceleración nativa del formato depende del soporte de hardware de la GPU empleada.
- Despliegue: la librería declarada es transformers. Las etiquetas `modelopt` y `endpoints_compatible` apuntan a checkpoints optimizados con NVIDIA ModelOpt y a compatibilidad con endpoints, y la model card menciona una variante Q5_K_M, lo que abre la puerta a despliegues GGUF (llama.cpp, Ollama). No se incluyen en la información disponible instrucciones detalladas de despliegue ni soporte confirmado en vLLM o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Comparación basada exclusivamente en los datos de la model card. Los parámetros se derivan de los nombres de los modelos comparados; el resto de campos no se detalla en la información disponible.

| Modelo | Parametros | Contexto | SWE-bench Verified | Terminal-Bench 2.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Dory1.0-4B (4 bucles) | 4B (model card) / 2,32B (safetensors) | 256K | 61,8 | 22,2 | OpenMDW 1.1 | HuggingFace (nvidia) |
| Qwen3.5-4B | 4B | no disponible | 54,7 | 15 | no disponible | no disponible |
| Qwen3.5-9B | 9B | no disponible | 61,0 | 24 | no disponible | no disponible |
| Gemma 4 26B A4B | 26B (MoE, ~4B activos) | no disponible | 57,40 | 35 | no disponible | no disponible |
| Qwen3.6-35B-A3B | 35B (MoE, ~3B activos) | no disponible | 73,4† | 43 | no disponible | no disponible |

Lectura de los datos: con 4 bucles, Dory1.0-4B supera a Qwen3.5-4B y a Qwen3.5-9B en SWE-bench Verified, y queda por debajo de Qwen3.6-35B-A3B en esa misma tarea y en Terminal-Bench. En SciCode, Gemma 4 26B A4B y Qwen3.6-35B-A3B obtienen resultados superiores. La ventaja de Dory1.0-4B es el tamaño: compite con modelos de 9B a 26B ocupando una fracción de la memoria.

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y evaluado únicamente en inglés; no se documenta soporte de castellano ni de otros idiomas.
- Alucinación: no se publican en la información disponible tasas de alucinación ni evaluaciones de veracidad. Como todo modelo de 4B, el riesgo de fabricación de datos aumenta en dominios especializados.
- Sesgos: no se documenta ninguna evaluación de sesgos, toxicidad o equidad.
- Tool calling: la model card no detalla explícitamente soporte de function calling ni el formato esperado de herramientas, pese a los resultados en benchmarks agénticos.
- Contexto largo: se declara soporte de hasta 256K tokens, pero no se aportan resultados de evaluación específicos para long-context (tipo RULER o similares), por lo que el rendimiento efectivo en ventanas máximas no está verificado.
- Licencia: OpenMDW 1.1 no es una licencia OSI y aparece etiquetada como `license: other`. La model card indica que el modelo está listo para uso comercial y no comercial, pero conviene revisar el texto completo de la licencia antes de integrarlo en un producto.
- Discrepancia de parámetros: la model card declara 4B y el recuento de safetensors del repositorio arroja 2.323.722.240 parámetros. La causa no se explica en la información disponible; conviene verificarla antes de dimensionar infraestructura.
- Madurez del ecosistema: el repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no existe validación independiente de la comunidad. Tampoco se documentan instrucciones de despliegue en servidores de inferencia habituales.
- Naturaleza del cómputo: aumentar el número de bucles mejora los resultados, pero incrementa el coste de inferencia. La elección del número de bucles debe validarse por caso de uso y no darse por óptima a 4 por defecto.
- Fechas: el modelo se publica con fecha de octubre de 2026 y cortes de datos de septiembre de 2025 (preentrenamiento) y mayo de 2026 (postentrenamiento), por lo que no cubre acontecimientos posteriores a esas fechas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nvidia/NVIDIA-Nemotron-Labs-Dory1.0-4B-NVFP4
- Licencia OpenMDW 1.1: https://openmdw.ai/license/1-1/
- Texto completo de la licencia OpenMDW 1.1 (repositorio GitHub): https://raw.githubusercontent.com/OpenMDW/OpenMDW/refs/heads/main/1.1/LICENSE.OpenMDW-1.1
- Página de desarrollador de Nemotron (NVIDIA): https://developer.nvidia.com/nemotron
- Servidor de Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Datasets de postentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de preentrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
- Sitio corporativo de NVIDIA (resultado genérico de la búsqueda web): https://www.nvidia.com/
- Entrada de NVIDIA en Wikipedia (resultado genérico de la búsqueda web): https://en.wikipedia.org/wiki/Nvidia

Nota: la búsqueda web realizada no ha devuelto documentación técnica específica sobre Dory1.0-4B (papers, blogs técnicos o demos); los resultados obtenidos son páginas corporativas y genéricas de NVIDIA.
