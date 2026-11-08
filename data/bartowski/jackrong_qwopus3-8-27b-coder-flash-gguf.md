# bartowski/Jackrong_Qwopus3.8-27B-Coder-Flash-GGUF

## Resumen

Qwopus3.8-27B-Coder-Flash es un modelo multimodal de 27.320.697.856 parámetros (27,3 B) desarrollado por Jackrong y orientado a tareas de ingeniería de software, razonamiento agéntico y uso de herramientas. Según su model card, extiende la filosofía "Qwopus Flash" a un modelo de 27B centrado en trabajo práctico de software: interpretar la petición, aplicar un cambio concreto, inspeccionar la respuesta de las herramientas, probar el resultado, recuperarse de errores y entregar el artefacto final. Los tags del repositorio lo sitúan en la familia qwen3_5 y qwopus3_8, con capacidades declaradas de visión, tool-use, agentes y decodificación especulativa (MTP).

La ficha que nos ocupa no es el modelo original, sino la colección de cuantizaciones GGUF publicada por bartowski el 7 de noviembre de 2026, generada con llama.cpp b12180 y con calibración imatrix. El repositorio ocupa 446,8 GB e incluye desde pesos BF16 completos (54,66 GB) hasta cuantizaciones de 4 bits (Q4_K_M, 17,44 GB), lo que permite desplegarlo en hardware de consumo. El pipeline declarado es image-text-to-text, por lo que admite entrada de texto e imagen siempre que se cargue el fichero mmproj correspondiente.

Su relevancia actual radica en combinar un tamaño medio (27B) con soporte multimodal, tool calling nativo, un modo de razonamiento configurable ("Reasoning effort is set to xhigh" en el prompt de sistema) y decodificación especulativa MTP, todo bajo licencia Apache 2.0. Esto lo hace candidato para despliegues locales de asistentes de código y agentes que necesitan ejecutarse sin depender de APIs externas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (familia qwen3_5; detalles internos no disponibles) |
| Parámetros totales | 27.320.697.856 (27,3 B); la model card cita 28B para el checkpoint fuente |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M (lista truncada en la información disponible; se infieren también Q4_K_S y Q3/Q2 por la estructura habitual del repositorio, sin confirmar) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de su pertenencia a la familia qwen3_5 y de su naturaleza multimodal (pipeline image-text-to-text). Se confirma que el modelo soporta decodificación especulativa mediante MTP (multi-token prediction), una técnica que permite generar varios tokens por paso del decodificador y acelerar la inferencia en llama.cpp cuando el runtime lo aprovecha. Las cuantizaciones de bartowski emplean calibración imatrix, que ajusta la precisión por tensor según su importancia, mejorando la calidad de los formatos de baja precisión frente a una cuantización uniforme.

No se han publicado en la información proporcionada datos sobre el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO. La model card describe el objetivo del entrenamiento en términos funcionales (razonamiento agéntico, uso de herramientas, recuperación de errores en tareas de código) pero no aporta cifras. El prompt de sistema incluye una instrucción explícita de "reasoning effort is set to xhigh" con apertura de bloque `<think>`, lo que sugiere un modo de razonamiento extendido entrenado o al menos soportado por el formato de chat.

## Capacidades

- Generación de código y completado en tareas de ingeniería de software, con énfasis declarado en producir cambios concretos y artefactos entregables.
- Razonamiento agéntico multi-paso: interpretar la petición, planificar, ejecutar, inspeccionar el resultado de herramientas y corregir errores.
- Tool calling / function calling con un formato XML propio (`<tool_call>`, `<function=...>`, `<parameter=...>`), documentado en la model card.
- Entrada multimodal de imagen junto a texto, siempre que se cargue el fichero mmproj en llama.cpp.
- Modo de razonamiento configurable mediante el prompt de sistema, con bloque `<think>` para trazas de pensamiento.
- Capacidades multilingües limitadas a inglés y chino según los metadatos del repositorio.
- Decodificación especulativa MTP para acelerar la generación.
- Compatibilidad con endpoints (tag `endpoints_compatible`) y con vLLM según los tags del repositorio.

## Casos de uso

- Asistente de código en local: el modelo puede integrarse en un IDE o CLI para proponer parches, explicar errores de compilación y generar tests, aprovechando su orientación explícita a flujo de trabajo de software y su formato de tool calling para invocar linters o ejecutores de tests.
- Agente de mantenimiento de repositorios: con el bucle de razonamiento y las llamadas a herramientas, puede leer un issue, inspeccionar el código con herramientas de búsqueda, aplicar un cambio y verificar el resultado ejecutando la suite de pruebas, reiniciando el ciclo si falla.
- Automatización de revisión de código en CI/CD: desplegado con vLLM o llama.cpp tras un webhook, puede analizar diffs, señalar riesgos y sugerir correcciones; el formato GGUF permite ejecutarlo en runners con GPU de gama media.
- Análisis de capturas y diagramas: gracias a la entrada de imagen (con mmproj), puede interpretar pantallazos de errores, diagramas de arquitectura o mockups de interfaz y traducirlos a descripciones técnicas o fragmentos de código.
- Asistente técnico bilingüe inglés-chino: útil en equipos distribuidos que documentan y discuten cambios en ambos idiomas, con la advertencia de que no cubre castellano de forma nativa.
- Prototipado de agentes con tool calling: el formato XML documentado y la compatibilidad con endpoints permiten construir orquestadores propios que parseen `<tool_call>` y ejecuten funciones locales sin depender de un proveedor externo.
- Despliegue en estaciones de trabajo sin conexión: las cuantizaciones Q4_K_M (17,44 GB) y Q5_K_M (20,92 GB) permiten ejecutar el modelo en una GPU de consumo con 24 GB de VRAM, útil en entornos con requisitos de confidencialidad del código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada a partir del tamaño de fichero):
  - bf16: 54,66 GB de pesos; requiere 2× A100 40 GB o 1× H100 80 GB.
  - Q8_0: 29,12 GB; requiere GPU de 40 GB o superior (A100 40 GB, L40S 48 GB).
  - Q6_K / Q6_K_L: 23,86–24,96 GB; ajustado en GPUs de 24 GB, holgado en 32 GB o 48 GB.
  - Q5_K_M: 20,92 GB; cabe en RTX 3090 / 4090 (24 GB) con contexto moderado.
  - Q4_K_M: 17,44 GB; opción recomendada por el autor para equilibrio tamaño/calidad; cabe en RTX 4090, 4080 Super (16 GB) con contexto corto o en 3090 con margen.
  - Q4_1: 17,83 GB; el autor lo señala como formato legacy con mejor tokens/watt en Apple Silicon.
- GPU recomendadas: H100 80 GB o A100 40/80 GB para bf16 y Q8_0; L40S o A6000 para Q6; RTX 4090/3090 para Q4 y Q5. En Apple Silicon, los formatos Q4_1 y Q4_K_M son los más eficientes según la model card.
- Despliegue: llama.cpp (versión b12180 o superior, usada para la cuantización), Ollama y cualquier frontend compatible con GGUF; vLLM aparece en los tags del repositorio, aunque la información disponible no detalla la ruta de carga de GGUF en vLLM. Para multimodal es necesario cargar además el fichero mmproj.
- Latencia y throughput: no disponibles. La decodificación especulativa MTP debería reducir la latencia por token en comparación con decodificación autoregresiva estándar, pero no se han publicado cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Multimodal | Licencia | Formato |
|---|---|---|---|---|---|
| Qwopus3.8-27B-Coder-Flash (esta ficha) | 27,3 B | no disponible | Sí (texto + imagen) | Apache 2.0 | GGUF, safetensors |
| Qwopus3.8-27B-Flash (Jackrong) | no disponible | no disponible | no disponible | no disponible | GGUF |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada solo permite comparar con la variante Qwopus3.8-27B-Flash del mismo autor, de la que únicamente se conoce la existencia del repositorio GGUF. No hay datos de benchmarks ni de especificaciones que permitan una comparación cuantitativa con otros modelos de código de tamaño similar.

## Limitaciones y advertencias

- Idiomas: solo inglés y chino según los metadatos; el rendimiento en castellano no está garantizado ni documentado.
- Contexto: la longitud de contexto no se especifica en la información disponible, lo que impide planificar despliegues con ventanas largas sin verificarlo empíricamente.
- Alucinación: no hay datos publicados sobre tasas de alucinación ni evaluaciones de fidelidad; en tareas de código conviene validar siempre la salida con tests y linters.
- Sesgos: no se documenta ninguna evaluación de sesgos ni de seguridad.
- Formato de tool calling propietario: el parseo de `<tool_call>` y `<function=...>` requiere implementación propia en el orquestador; no es el formato JSON estándar de OpenAI, lo que añade trabajo de integración.
- Cuantizaciones: las versiones de 4 bits y menores pueden degradar el razonamiento multi-paso y la precisión en tool calling; el autor recomienda Q4_K_M como mínimo razonable, pero no aporta métricas de degradación.
- Licencia Apache 2.0: permite uso comercial, pero al ser una cuantización de un modelo de terceros conviene revisar también las condiciones del modelo base Jackrong/Qwopus3.8-27B-Coder-Flash.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia comunitaria de validación ni informes de fallos en producción.
- El tamaño del repositorio (446,8 GB) implica que descargar todas las cuantizaciones no es práctico; conviene usar `huggingface-cli` con filtros por fichero.

## Enlaces

- Repositorio GGUF de bartowski: https://huggingface.co/bartowski/Jackrong_Qwopus3.8-27B-Coder-Flash-GGUF
- Modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash
- Repositorio GGUF del modelo base: https://huggingface.co/Jackrong/Qwopus3.8-27B-Coder-Flash-GGUF
- Variante Flash del mismo autor: https://huggingface.co/Jackrong/Qwopus3.8-27B-Flash-GGUF
- llama.cpp (release b12180 usada para la cuantización): https://github.com/ggml-org/llama.cpp/releases/tag/b12180
