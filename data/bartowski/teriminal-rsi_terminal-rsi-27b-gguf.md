# bartowski/Teriminal-RSI_Terminal-RSI-27B-GGUF

## Resumen

Terminal-RSI-27B es un modelo de lenguaje de 27.320.697.856 parámetros (aproximadamente 27,3B), desarrollado por el equipo Teriminal-RSI y publicado bajo licencia Apache 2.0. Está especializado en tareas de agente de terminal: ejecución de comandos, resolución de incidencias en entornos de línea de comandos y razonamiento multi-paso con llamadas a herramientas. El modelo se entrena mediante un procedimiento de auto-mejora recursiva descrito en el paper arXiv:2610.22192, que alterna la reescritura de trayectorias verificadas (Recursive Self-Rewrite, RSR) con el refinamiento de política heredando el crítico (Recursive Policy-Refine, RPR).

La ficha que nos ocupa no es el modelo original, sino la colección de cuantizaciones GGUF publicada por bartowski, generada con llama.cpp b11845 e imatrix. Incluye desde bf16 completo (54,66 GB) hasta cuantizaciones de 4 bits (Q4_K_M, 17,44 GB), lo que permite desplegarlo en GPUs de consumo y en CPU. El modelo es multimodal entrada (texto e imagen mediante fichero mmproj), soporta decodificación especulativa con MTP y declara contexto largo, aunque la longitud exacta de ventana no se especifica en la información disponible.

Su relevancia actual radica en que es una de las pocas alternativas abiertas orientadas específicamente a agentes de terminal, un nicho dominado por modelos propietarios, y en que su licencia Apache 2.0 permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.8-27B según el paper arXiv:2610.22192; los tags del repositorio indican `qwen3_5`). No se detalla la arquitectura interna en la información disponible |
| Parametros totales | 27.320.697.856 (~27,3B) según safetensors; la model card del cuantizador indica "28B (source checkpoint)" |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible (el repositorio incluye el tag `long-context` sin cuantificar) |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, IQ4_NL (la lista completa aparece truncada en la información disponible); cuantización con imatrix |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF en este repositorio; el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

El modelo parte de un checkpoint Qwen de ~27B (el paper cita Qwen3.8-27B; los tags del repositorio mencionan `qwen3_5`) y se entrena con un esquema de auto-mejora recursiva en cinco etapas: RSR-1, RPR-1, RSR-2 y RPR-2 sobre la base. El método convierte resultados de verificadores en actualizaciones de política útiles y transforma progreso parcial en resolución completa de tareas, con un modelo crítico de calentamiento, transferencia recursiva del crítico y tasas de aprendizaje específicas por etapa. No se especifica en la información disponible el número de tokens de entrenamiento ni la composición exacta del dataset.

En el plano de inferencia, el modelo soporta decodificación especulativa mediante MTP (multi-token prediction), lo que reduce la latencia en despliegues con llama.cpp. La plantilla de chat usa el formato ChatML (`<|im_start|>` / `<|im_end|>`) con un bloque `<think>` de razonamiento y un parámetro de esfuerzo de razonamiento que en los ejemplos se fija a `xhigh`. El prompt de sistema incluye instrucciones explícitas para validar supuestos y priorizar corrección y consistencia.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento explícito (`<think>`), con niveles de esfuerzo de razonamiento configurables desde el prompt de sistema.
- Ejecución de tareas de agente de terminal: interpretación de comandos, diagnóstico de errores y planificación de secuencias de acciones en entornos de línea de comandos.
- Llamada a funciones y herramientas: formato XML propio con `<tool_call>`, `<function=...>` y `<parameter=...>`, con soporte para definiciones de herramientas en JSON en el prompt de sistema.
- Capacidades multimodales de entrada: texto e imagen, esta última mediante el fichero `mmproj` companion (pipeline `image-text-to-text`).
- Soporte de contexto largo (etiqueta `long-context`; longitud no cuantificada en la información disponible).
- Capacidades multilingües limitadas a inglés y chino.
- Generación de código y razonamiento sobre código, según los tags `code` y `conversational`.
- Decodificación especulativa MTP para acelerar la inferencia.

## Casos de uso

- Automatización de operaciones en servidores: el modelo puede recibir el estado de un sistema (salida de comandos, logs) y proponer la siguiente acción en una secuencia de diagnóstico y reparación, aprovechando su entrenamiento específico en trayectorias de terminal verificadas.
- Agentes de CI/CD: integrado como planificador dentro de un pipeline, traduce fallos de build en comandos concretos de inspección y corrección, con llamadas a herramientas en formato estructurado que un orquestador puede parsear sin ambigüedad.
- Asistente de shell para desarrolladores: integrado en una CLI o en un IDE, genera comandos a partir de lenguaje natural y explica el efecto de cada uno antes de ejecutarlo, con el bloque de razonamiento visible para auditoría.
- Soporte técnico de nivel 2: gestión de conversaciones multi-turno con contexto largo, donde el modelo mantiene el estado de la incidencia y consulta herramientas internas (tickets, métricas) mediante function calling.
- Migración y refactorización de scripts: análisis de scripts legacy y propuesta de equivalentes en otro lenguaje o framework, apoyándose en las capacidades de código y en la ventana de contexto extendida.
- Análisis de capturas de pantalla de terminal o de paneles de error: gracias a la entrada de imagen vía `mmproj`, el modelo puede interpretar una captura y proponer la corrección correspondiente.
- Despliegue en entornos aislados o sin conectividad: al distribuirse en GGUF y con licencia Apache 2.0, puede ejecutarse íntegramente en local con llama.cpp sobre hardware de consumo.

## Benchmarks y rendimiento

Los resultados publicados en el paper (arXiv:2610.22192) para Terminal-RSI-27B son los siguientes:

| Benchmark | Resultado |
|---|---|
| Terminal-Bench 2.1 | 86,52 % |
| Terminal-Bench 3.0 | 16,95 % |
| Terminal-Bench 4.0 | 19,84 % |
| Benchmark no identificado (texto truncado en la fuente) | 79,00 % |

El paper incluye una comparación gráfica frente a modelos frontera en tareas de agente de terminal, pero los valores numéricos de esos modelos de referencia no están disponibles en la información proporcionada. No se han publicado en esta información resultados de MMLU, HumanEval, GSM8K ni de otras baterías generales.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin caché KV): bf16 ~54,66 GB; Q8_0 ~29,12 GB; Q6_K ~23,86 GB; Q5_K_M ~20,92 GB; Q4_K_M ~17,44 GB; Q4_1 ~17,83 GB; IQ4_NL no disponible en el fragmento consultado.
- A la VRAM de pesos hay que sumar la caché KV, cuyo tamaño depende del contexto configurado y no puede calcularse sin conocer el número de capas y cabezas (no disponibles). Para contextos largos, reserve margen adicional.
- GPU recomendadas: A100 80 GB o H100 para bf16 y Q8_0; A100 40 GB, L40S 48 GB o RTX 6000 Ada para Q6_K y Q5_K_M; RTX 4090 24 GB o RTX 3090 24 GB para Q4_K_M y Q4_K_L con contexto moderado.
- Cabe en GPU de consumo: sí, en modelos de 24 GB con cuantizaciones de 4 y 5 bits; en GPUs de 12-16 GB solo con cuantizaciones de 4 bits y contexto reducido, o con offload parcial a CPU.
- Opciones de despliegue: llama.cpp (release b11845 o posterior, usado para generar las cuantizaciones), servidores compatibles con GGUF como llama.cpp server, Ollama o LM Studio, y cualquier runtime que acepte GGUF. Para la entrada de imagen es necesario cargar también el fichero `mmproj`.
- Aceleración: decodificación especulativa MTP disponible para reducir latencia; no se han publicado cifras de throughput (tokens/s) ni de latencia en la información disponible.
- El tamaño total del repositorio es de 446,8 GB, por lo que conviene descargar únicamente el fichero de cuantización deseado.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos en la información proporcionada, por lo que la comparación se limita a las distintas distribuciones del mismo modelo:

| Distribución | Formato | Tamaño | Licencia | Observaciones |
|---|---|---|---|---|
| Teriminal-RSI/Terminal-RSI-27B | Safetensors (modelo base) | No disponible | Apache 2.0 | Pesos originales sin cuantizar |
| bartowski/Teriminal-RSI_Terminal-RSI-27B-GGUF | GGUF (bf16 a IQ4_NL) | 446,8 GB de repo; 17,44-54,66 GB por fichero | Apache 2.0 | Cuantización con imatrix, release b11845 de llama.cpp |
| mradermacher/Terminal-RSI-27B-GGUF | GGUF | No disponible | Apache 2.0 | Cuantizaciones alternativas del mismo modelo base |

Comparación con modelos de la misma categoría (otros agentes de terminal abiertos o modelos generales de ~27-32B): no disponible en la información proporcionada.

## Limitaciones y advertencias

- Idiomas: solo se declaran inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- Longitud de contexto: la etiqueta `long-context` no viene acompañada de una cifra verificable; conviene validar empíricamente el comportamiento más allá de la ventana nativa antes de diseñar flujos que dependan de ella.
- Riesgo de alucinación: como agente de terminal, una alucinación puede traducirse en la ejecución de comandos destructivos. Es imprescindible sandboxing, confirmación humana y permisos mínimos.
- Especialización estrecha: el entrenamiento con RL sobre trayectorias de terminal puede degradar el rendimiento en tareas generales de conversación o conocimiento enciclopédico frente a modelos de propósito general del mismo tamaño.
- Inconsistencias en la documentación: el identificador del repositorio usa la grafía "Teriminal" mientras que el modelo base se cita como "Terminal"; además, el paper menciona Qwen3.8-27B y los tags `qwen3_5`. Conviene verificar la procedencia exacta del checkpoint base antes de un despliegue en producción.
- Datos de benchmarks limitados: solo se publican resultados en la familia Terminal-Bench, con una diferencia muy acusada entre Terminal-Bench 2.1 (86,52 %) y las versiones 3.0 y 4.0 (16,95 % y 19,84 %), lo que sugiere posible sobreajuste a la versión 2.1 o una dificultad muy superior en las versiones recientes.
- Cuantización: las versiones de 4 bits pueden degradar la precisión en el formato estricto de llamadas a herramientas; si el parseo de `<tool_call>` es crítico, se recomienda Q6_K o superior.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero conviene revisar las condiciones del checkpoint base Qwen subyacente, ya que la información proporcionada no detalla términos adicionales.
- Advertencia general de seguridad: el modelo está diseñado para operar en terminales; no debe otorgársele acceso directo a sistemas productivos sin una capa de validación de comandos.

## Enlaces

- Repositorio de cuantizaciones GGUF (bartowski): https://huggingface.co/bartowski/Teriminal-RSI_Terminal-RSI-27B-GGUF
- Modelo base: https://huggingface.co/Teriminal-RSI/Terminal-RSI-27B
- Cuantizaciones alternativas (mradermacher): https://huggingface.co/mradermacher/Terminal-RSI-27B-GGUF
- Paper: https://arxiv.org/abs/2610.22192
- Versión HTML del paper: https://arxiv.org/html/2610.22192v1
- Resumen del paper en Emergent Mind: https://www.emergentmind.com/papers/2610.22192
- llama.cpp (release b11845): https://github.com/ggml-org/llama.cpp/releases/tag/b11845
- Fichero recomendado Q4_K_M: https://huggingface.co/bartowski/Teriminal-RSI_Terminal-RSI-27B-GGUF/blob/main/Teriminal-RSI_Terminal-RSI-27B-Q4_K_M.gguf
