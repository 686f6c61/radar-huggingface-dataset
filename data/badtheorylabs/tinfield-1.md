# badtheorylabs/Tinfield-1

## Resumen

Tinfield 1 es un modelo agéntico orientado a trabajo en terminal e ingeniería de software de horizonte largo, desarrollado por badtheorylabs como ajuste fino de Qwen/Qwen3.8-Flash-Next. Su propuesta es competir en tareas de agente real (ejecución de comandos, edición de repositorios, resolución de incidencias) frente a modelos frontera cerrados, manteniendo pesos abiertos y un coste de inferencia contenido: según la model card, activa 6,6B de parámetros por token sobre un total de 177B, lo que indica una arquitectura de mezcla de expertos dispersa.

El modelo obtiene 33,0 en Terminal-Bench 4.0 y 62 en DeepSWE v1.1 según las evaluaciones del autor, con el arnés mini-swe-agent, k=5 y los conjuntos completos de tareas (66 y 113 tareas respectivamente). Estas cifras superan a las del modelo base (29,0 y 58,7) y, en el caso de Terminal-Bench, lo sitúan como el segundo modelo de pesos abiertos del tablero por detrás de GLM-5.3.

Su relevancia práctica está en la combinación de contexto de 256k tokens, publicación de builds cuantizados en GGUF (61 GB y 72 GB) que el autor afirma ejecutables en una máquina de 64 GB, y licencia Qwen Community 1.0 heredada del modelo base. El repositorio principal aloja pesos BF16 en safetensors con un tamaño aproximado de 360 GB.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (no se detalla en la model card; el reparto entre parámetros totales y activos apunta a un transformer con mezcla de expertos, sin confirmar en la documentación) |
| Parámetros totales | 179.999.981.459 según safetensors; la model card indica 177B |
| Parámetros activos | 6.600 millones (6,6B) por token, según la model card |
| Longitud de contexto | 262.144 tokens (256k) |
| Tipos de cuantización | BF16 en los pesos originales; builds GGUF: Compact (IQ2_XXS en gate/up, IQ4_NL en down) y Mini (IQ2_XXS en gate/up, Q2_0 con búsqueda de rango en down) |
| Idiomas soportados | No disponible |
| Licencia | Qwen Community License 1.0 (`license: other`, `license_name: qwen-community-1.0`) |
| Formato de pesos | Safetensors (BF16) en el repositorio principal; GGUF en los repositorios cuantizados |
| Tarea declarada (pipeline) | `image-text-to-text` |
| Modelo base | Qwen/Qwen3.8-Flash-Next (ajuste fino) |
| Tamaño del repositorio | 360,0 GB |
| Fecha de creación | 21 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información publicada describe Tinfield 1 como un ajuste fino sobre Qwen3.8-Flash-Next, con pesos BF16, contexto de 256k tokens y un perfil de inferencia de 6,6B parámetros activos por token sobre 177B totales. No se detalla en la model card la arquitectura interna (si es MoE con enrutado disperso, cuántos expertos tiene, ni la configuración de atención), la composición del dataset de ajuste, el número de tokens de entrenamiento, ni si se emplearon técnicas de alineación como RLHF, DPO u otras. Tampoco se especifican innovaciones de decodificación (especulativa, atención lineal u otras).

Lo que sí se documenta es el objetivo del ajuste: comportamiento agéntico para terminal y flujos de ingeniería de software de horizonte largo. La evaluación se realizó con el arnés mini-swe-agent a k=5 sobre los conjuntos completos de Terminal-Bench 4.0 (66 tareas) y DeepSWE v1.1 (113 tareas), lo que indica que el modelo fue optimizado para interacción iterativa con herramientas de línea de comandos en lugar de generación de código en un solo turno.

## Capacidades

- Trabajo agéntico en terminal: ejecución y encadenamiento de comandos para completar tareas de sistema, con soporte de bucles multi-paso medidos en Terminal-Bench 4.0.
- Ingeniería de software de horizonte largo: resolución de tareas de reparación y modificación de código evaluadas en DeepSWE v1.1.
- Generación y edición de código: etiquetado explícitamente con `code` en los tags del repositorio.
- Conversación multi-turno: etiquetado con `conversational`.
- Contexto largo: ventana de 256k tokens, adecuada para repositorios y logs extensos.
- Uso con arneses de agente: evaluado con mini-swe-agent, lo que implica interacción con herramientas externas; la model card no documenta un formato específico de tool calling o function calling.
- Capacidades de visión: el pipeline declarado es `image-text-to-text`, heredado presumiblemente del modelo base; la model card no documenta ni evalúa capacidades multimodales, por lo que no se pueden dar por confirmadas.
- Capacidades multilingües: no disponible.

## Casos de uso

- Automatización de administración de sistemas: el modelo puede recibir una tarea en lenguaje natural y traducirla en una secuencia de comandos de shell, leyendo la salida y corrigiendo el rumbo, que es exactamente el escenario medido en Terminal-Bench 4.0.
- Resolución de incidencias en repositorios: dado un informe de error y acceso al árbol del proyecto, puede localizar el fichero afectado, aplicar un parche y verificar el resultado, tal como se evalúa en DeepSWE v1.1.
- Integración en pipelines de CI/CD: uso como agente que diagnostica fallos de compilación o de tests a partir de logs y propone o aplica parches, aprovechando el contexto de 256k tokens para volcar trazas completas.
- Refactorización en monorepos grandes: la ventana de contexto permite incluir varios ficheros y dependencias en una misma pasada sin trocear el problema en exceso.
- Análisis de logs extensos: interpretación de trazas largas de servidores o de sistemas distribuidos para identificar causas raíz, con resúmenes accionables.
- Asistente de operaciones en local: los builds cuantizados (61 GB y 72 GB) permiten desplegar el modelo en una estación de trabajo o servidor de un solo nodo, evitando enviar código propietario a APIs externas.
- Generación de scripts de datos y automatizaciones puntuales: tareas de pegamento (procesado de CSV, llamadas a APIs internas, tareas programadas) donde el modelo puede escribir y probar el script de forma iterativa.
- Evaluación interna de agentes: uso como referencia de pesos abiertos en comparativas propias frente a modelos cerrados, con las cifras publicadas en Terminal-Bench 4.0 y DeepSWE v1.1 como punto de partida.

## Benchmarks y rendimiento

Resultados publicados por el autor, evaluados con mini-swe-agent a k=5 sobre los conjuntos completos (66 tareas en Terminal-Bench 4.0, 113 en DeepSWE v1.1):

| Benchmark | Tinfield 1 | Qwen3.8-Flash-Next (base) |
|---|---:|---:|
| Terminal-Bench 4.0 | 33,0 | 29,0 |
| DeepSWE v1.1 | 62,0 | 58,7 |

Terminal-Bench 4.0, comparativa del tablero citada en la model card:

| Modelo | Arnés | Puntuación |
|---|---|---:|
| GLM-5.3 (max) | Claude Code | 41,8 |
| GPT-5.6 Sol (max) | Codex | 37,3 |
| Tinfield 1 | mini-swe-agent | 33,0 |
| Qwen3.8-Flash-Next | No indicado | 29,0 |
| Claude Opus 4.8 (max) | Claude Code | 23,6 |
| GPT-5.6 Terra (max) | Codex | 21,5 |
| Grok 4.6 (high) | Grok Build | 20,3 |
| Gemini 3.8 Flash (high) | mini-swe-agent | 19,1 |
| Claude Sonnet 5 (max) | Claude Code | 12,4 |

DeepSWE v1.1, comparativa del tablero citada en la model card:

| Modelo | Puntuación |
|---|---:|
| GLM-5.3 (max) | 69 |
| GLM-5.3 Flash (max) | 63 |
| DeepSeek V4 Pro (max) | 63 |
| Tinfield 1 | 62 |
| Claude Opus 4.8 (max) | 59 |
| Qwen3.8 Max (xhigh) | 57 |
| Muse Spark 1.2 (xhigh) | 55 |
| Claude Sonnet 5 (max) | 54 |
| DeepSeek V4 Flash (max) | 53 |

Los builds cuantizados no han sido evaluados en estos benchmarks, según la propia model card.

## Requisitos de hardware

- Pesos BF16: 179.999.981.459 parámetros a 2 bytes por parámetro equivalen a unos 360 GB solo de pesos, lo que coincide con el tamaño del repositorio. Requiere agregación de varias GPU de 80 GB o un nodo con memoria unificada de gran capacidad, más el espacio adicional para caché KV y activaciones (no cuantificado en la documentación).
- Build Compact (GGUF, 72 GB): el autor afirma que se ejecuta en una máquina de 64 GB. Conviene señalar que el tamaño del fichero supera ligeramente los 64 GB, por lo que el margen real depende de la memoria disponible y de la política de offload.
- Build Mini (GGUF, 61 GB): 61 GB, también declarado ejecutable en una máquina de 64 GB, con mayor holgura que el build Compact.
- GPU recomendadas: no disponible en la documentación. No se indican modelos concretos (A100, H100, RTX 4090 u otros) ni configuraciones multi-GPU.
- Viabilidad en GPU de consumo: no confirmada. El build Mini (61 GB) excede la VRAM de cualquier GPU de consumo actual por sí sola; sería viable con memoria unificada o con offload parcial a CPU y disco.
- Opciones de despliegue: los pesos safetensors son compatibles con `transformers` según la librería declarada; los builds en GGUF son compatibles por formato con llama.cpp y sus derivados (Ollama, etc.), aunque la model card no lo especifica. No se documenta soporte de vLLM, TGI ni otros servidores de inferencia.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de tiempo por tarea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Terminal-Bench 4.0 | DeepSWE v1.1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Tinfield 1 | 177B totales / 6,6B activos | 256k | 33,0 | 62,0 | Qwen Community 1.0 | Pesos abiertos en HuggingFace (safetensors y GGUF) |
| Qwen3.8-Flash-Next | No disponible | 256k (heredado por Tinfield 1; no confirmado en la información disponible) | 29,0 | 58,7 | No disponible | Pesos abiertos (modelo base) |
| GLM-5.3 (max) | No disponible | No disponible | 41,8 con Claude Code | 69 | No disponible | No disponible |
| Claude Opus 4.8 (max) | No disponible | No disponible | 23,6 con Claude Code | 59 | Propietaria | API |
| Claude Sonnet 5 (max) | No disponible | No disponible | 12,4 con Claude Code | 54 | Propietaria | API |

La comparación con los modelos cerrados no es homogénea: Tinfield 1 se evaluó con mini-swe-agent, mientras que GLM-5.3 y los modelos de Anthropic se evaluaron con Claude Code. Los parámetros y contextos de esos modelos no se detallan en la información disponible.

## Limitaciones y advertencias

- Los builds cuantizados (Compact y Mini) no han sido evaluados en Terminal-Bench 4.0 ni en DeepSWE v1.1; las cifras publicadas corresponden exclusivamente a los pesos BF16.
- El modelo tiene 0 descargas y 13 likes en el momento de redactar esta ficha, con fecha de creación del 21 de septiembre de 2026: la validación independiente por parte de terceros es inexistente o mínima.
- Todos los resultados de benchmarks proceden del autor del modelo. Las comparaciones con modelos frontera cerrados se realizaron con arneses distintos (mini-swe-agent frente a Claude Code, Codex o Grok Build), lo que limita la comparabilidad directa.
- No se documentan idiomas soportados, sesgos conocidos, tasas de alucinación ni comportamiento fuera del dominio de terminal y código.
- La licencia es Qwen Community License 1.0 (`license: other`), no una licencia permisiva estándar. Los términos concretos (límites de uso comercial, obligaciones de atribución, restricciones por escala) no se detallan en la información proporcionada y deben consultarse en el fichero LICENSE antes de cualquier despliegue en producción.
- El pipeline declarado es `image-text-to-text`, pero la model card no describe ni evalúa capacidades de visión; no debe asumirse que el modelo procesa imágenes de forma fiable.
- No se documenta soporte oficial para vLLM, TGI u otros servidores de inferencia, ni métricas de latencia o throughput, lo que dificulta planificar un despliegue en producción.
- Los requisitos de hardware para los pesos BF16 (unos 360 GB de pesos) implican infraestructura multi-GPU de coste elevado; en la práctica, solo los builds cuantizados son desplegables en una única máquina.
- No se especifica si existe caché KV optimizada para los 256k tokens de contexto ni el consumo de memoria asociado a esa ventana.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/badtheorylabs/Tinfield-1
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Build cuantizado Compact (GGUF, 72 GB): https://huggingface.co/badtheorylabs/Tinfield-1-Compact-GGUF
- Build cuantizado Mini (GGUF, 61 GB): https://huggingface.co/badtheorylabs/Tinfield-1-Mini-GGUF
- Licencia (fichero LICENSE del repositorio): https://huggingface.co/badtheorylabs/Tinfield-1/blob/main/LICENSE
- Tablero Terminal-Bench 4.0: https://www.tbench.ai/leaderboard/terminal-bench/4.0
- Tablero DeepSWE v1.1: https://deepswe.datacurve.ai/
- Evaluación Terminal-Bench 4.0 del modelo base en Artificial Analysis: https://artificialanalysis.ai/evaluations/terminalbench-4-0

Nota: la búsqueda web realizada no devolvió enlaces técnicos relevantes sobre el modelo; los únicos resultados obtenidos fueron páginas de servicios de traducción (Google Translate, DeepL, Yandex Translate), sin relación con Tinfield 1.
