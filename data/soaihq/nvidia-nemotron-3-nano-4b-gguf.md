# SoAIHQ/NVIDIA-Nemotron-3-Nano-4B-GGUF

## Resumen

NVIDIA-Nemotron-3-Nano-4B es un modelo de lenguaje pequeño (SLM) de aproximadamente 4.000 millones de parámetros (3.973.556.832 exactos en pesos safetensors) desarrollado por NVIDIA desde cero, diseñado como modelo unificado para tareas con y sin razonamiento. Esta ficha cubre la versión GGUF publicada por SoAI (SoAIHQ), una cuantización de `nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16` para llama.cpp, calibrada con imatrix sobre datos reales de chat, código y llamadas a herramientas.

Su rasgo diferencial es la arquitectura híbrida Mamba-2 con atención: de 42 capas, solo 4 usan atención, lo que reduce el coste de memoria asociado al contexto y permite sostener una ventana de 262.144 tokens en hardware de gama media. Genera por defecto una traza de razonamiento antes de la respuesta final, y ese comportamiento se puede desactivar por petición. Está orientado a IA agéntica en el borde (Jetson Thor, GeForce RTX, DGX Spark), con soporte de tool calling en formato XML que llama-server convierte a `tool_calls` compatibles con OpenAI.

Es relevante ahora porque combina tres piezas poco habituales en la categoría de 4B: contexto de 256K, tool calling fiable para agentes multi-paso y un tamaño que cabe en GPUs de consumo con cuantización de 4 bits (2,8 GB de pesos). Todo ello bajo la NVIDIA Nemotron Open Model License, que no es una licencia de código abierto estándar y debe revisarse antes de un uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 y atención (42 capas, 4 con atención) |
| Parámetros totales | 3.973.556.832 (aproximadamente 4B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens (256K) |
| Tipos de cuantización | GGUF Q4_K_M (2,8 GB) y Q8_0 (4,2 GB); el autor no publica cuantizaciones por debajo de 4 bits |
| Idiomas soportados | Inglés y lenguajes de programación (según la model card) |
| Licencia | NVIDIA Nemotron Open Model License |
| Formato de pesos | GGUF (llama.cpp); modelo base en BF16 |

Otros datos: pipeline `text-generation`, etiqueta `endpoints_compatible`, tamaño del repositorio 7,1 GB, autor de la cuantización SoAI, fecha de creación 2026-10-24.

## Arquitectura y entrenamiento

El modelo base fue entrenado desde cero por NVIDIA como un SLM unificado para razonamiento y no razonamiento: ante una consulta, genera primero una traza de razonamiento y concluye con una respuesta final. La arquitectura es híbrida: 42 capas en total, de las cuales solo 4 emplean atención, y el resto son capas Mamba-2 (state space model). Esta proporción explica que una ventana de 262.144 tokens sea viable en tarjetas de gama media, ya que el estado recurrente de las capas Mamba no crece como una caché KV completa de un transformer puro. El modelo procesa texto únicamente: no admite imágenes ni audio.

Sobre el entrenamiento no se proporcionan en la información disponible el número de tokens, la composición del dataset ni si hubo etapas de RLHF o DPO; esos datos figuran como no disponibles. La versión aquí descrita es la cuantización GGUF de SoAI, calibrada con imatrix sobre datos reales de chat, código y llamadas a herramientas, con dos variantes: Q4_K_M, orientada a menor consumo de memoria, y Q8_0, casi sin pérdida. La model card reporta la fidelidad de la cuantización frente a los pesos de 16 bits: Q8_0 con KLD media de 0,000708, incremento de perplejidad del +0,08 % y 98,5 % de coincidencia en el token más probable; Q4_K_M con KLD 0,009280, +0,61 % de perplejidad y 95,3 % de coincidencia, valores mejores que la propia Q4_K_M de NVIDIA (KLD 0,011489, +1,04 %, 94,6 %).

## Capacidades

- Generación de texto conversacional multi-turno con ventana de 262.144 tokens.
- Razonamiento explícito con modo thinking activado por defecto y desactivable por petición (`enable_thinking`).
- Tool calling y function calling: emite llamadas como bloques XML que llama-server transforma en `tool_calls` compatibles con la API de OpenAI.
- Soporte de argumentos anidados y de tool calls en streaming.
- Agentes multi-paso: en una tarea de dos pasos (buscar y leer), Q4_K_M completó 40 de 40 ejecuciones con thinking activo y razonamiento omitido del historial, y 30 de 30 con thinking desactivado.
- Capacidad de código: los lenguajes de programación figuran entre los idiomas soportados y la cuantización se calibró con datos de código.
- Recuperación en contexto largo: Q4_K_M localizó un código insertado al 10 %, 50 % y 90 % de profundidad en prompts de aproximadamente 29K, 62K y 122K tokens, y en el punto medio de un prompt de 230K; Q8_0 también lo recuperó en un prompt de 230.101 tokens.
- Sin capacidades de visión ni de audio.
- Idiomas naturales: inglés únicamente (más lenguajes de programación).

## Casos de uso

- NPCs y compañeros de videojuego: el modelo corre en local sobre GeForce RTX o Jetson Thor, mantiene el estado de la partida en una ventana de 256K y consulta el inventario o las estadísticas del jugador mediante tool calling, sin depender de la nube ni añadir latencia de red.
- Asistentes de voz locales para dispositivos y apps: se integra en un pipeline ASR → Nemotron → TTS; con thinking desactivado y temperatura 0,6 se obtienen respuestas directas y se evita el coste de generar trazas de razonamiento en cada turno.
- Automatización IoT y domótica: las llamadas a funciones permiten al modelo invocar APIs de dispositivos (encender, consultar sensores, programar rutinas) traduciendo lenguaje natural a acciones estructuradas sobre hardware con recursos limitados.
- Agente de código en IDE o CLI local: puede razonar sobre un repositorio, leer y escribir ficheros mediante herramientas y encadenar pasos; con Q8_0 se maximiza la fidelidad de salida cuando la memoria lo permite.
- Análisis de documentación extensa y RAG de contexto largo: la ventana de 262.144 tokens y la recuperación verificada a 230K permiten pasar contratos, bases de código o expedientes completos sin trocear, reduciendo la pérdida de contexto típica del chunking.
- Servicio self-hosted con API compatible con OpenAI: `llama-server` expone `/v1/chat/completions`, de modo que el modelo actúa como sustituto local en entornos de desarrollo o pruebas sin cambiar el cliente.
- Enrutado y clasificación de intenciones: con thinking desactivado y salida estructurada, es adecuado como primer eslabón de un pipeline agéntico que decide qué herramienta o modelo invocar después.
- Evaluación de arquitecturas agénticas on-premise: útil como banco de pruebas para medir razonamiento multi-paso y uso de herramientas en hardware de borde antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (no hay datos de MMLU, HumanEval, GSM8K ni similares). Los únicos datos cuantitativos proporcionados son métricas de fidelidad de cuantización y de recuperación en contexto largo:

| Build | KLD media | Cambio de perplejidad | Coincidencia en token más probable |
|---|---:|---:|---:|
| Q8_0 | 0,000708 | +0,08 % | 98,5 % |
| Q4_K_M | 0,009280 | +0,61 % | 95,3 % |
| Q4_K_M de NVIDIA | 0,011489 | +1,04 % | 94,6 % |

| Prueba | Resultado reportado |
|---|---|
| Recuperación a 10 %, 50 % y 90 % de profundidad (prompts de ~29K, 62K y 122K tokens) | Q4_K_M recuperó el código insertado |
| Recuperación en el punto medio de un prompt de ~230K tokens | Q4_K_M y Q8_0 (230.101 tokens) recuperaron el código |
| Tarea agéntica de dos pasos (buscar y leer), thinking activo, razonamiento omitido del historial | 40 de 40 ejecuciones completadas (Q4_K_M) |
| Misma tarea, thinking desactivado | 30 de 30 ejecuciones completadas (Q4_K_M) |

## Requisitos de hardware

- Pesos: Q4_K_M ocupa 2,8 GB en disco y Q8_0 4,2 GB; a ello se suma la memoria de contexto, que crece con la longitud configurada.
- VRAM medida por el autor: Q4_K_M con `-c 262144` y 4 slots de servidor consumió 7.430 MiB (unos 7,8 GB) en una NVIDIA RTX A4000.
- GPU de consumo: sí cabe. Con Q4_K_M y contextos moderados es viable en tarjetas de 8 GB; 12-16 GB permiten contextos largos o varios slots; Q8_0 exige algo más de margen.
- GPU profesionales recomendadas por el fabricante para el segmento: Jetson Thor, GeForce RTX y DGX Spark (plataformas de borde). No se detallan cifras para A100 o H100 en la información disponible.
- Despliegue: llama.cpp mediante `llama-server`, con interfaz de chat web y API compatible con OpenAI; permite ejecución en GPU, en CPU o repartiendo capas entre ambas.
- Otros runners (vLLM, TGI, Ollama): no documentados en la información proporcionada para esta cuantización GGUF.
- Latencia y throughput: no disponibles; no se han publicado medidas de tokens por segundo.

## Comparativa con modelos similares

No se han proporcionado datos técnicos de modelos alternativos, por lo que los campos comparativos se marcan como no disponibles para no especular. La comparación se plantea por categoría (SLM de ~4B con orientación agéntica):

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| NVIDIA-Nemotron-3-Nano-4B (esta ficha, GGUF de SoAI) | 3.973.556.832 | 262.144 tokens | NVIDIA Nemotron Open Model License | GGUF Q4_K_M y Q8_0 en HuggingFace |
| Alternativas de ~4B con soporte de tool calling (por ejemplo, las familias Qwen3-4B, Gemma 3 4B o Phi-4-mini) | No disponible en la información proporcionada | No disponible | No disponible | No disponible |

Criterio de comparación sugerido: contexto máximo real, soporte de tool calling en streaming, coste de memoria por token de contexto (aquí favorable por la proporción 4/42 capas con atención) y condiciones de la licencia para uso comercial.

## Limitaciones y advertencias

- Idioma: solo inglés y lenguajes de programación según la model card; no hay soporte declarado de castellano, lo que limita su uso en productos en español sin ajuste adicional.
- Modalidad: exclusivamente texto; no procesa imágenes ni audio, aunque se comercialice para asistentes de voz (requiere ASR y TTS externos).
- Razonamiento por defecto: el modo thinking está activado, lo que incrementa tokens de salida y latencia; debe desactivarse explícitamente para respuestas directas.
- Agentes: al reenviar mensajes del asistente en cadenas de herramientas hay que omitir `reasoning_content` o desactivar thinking, de lo contrario el bucle agéntico se degrada.
- Sin benchmarks públicos: no hay datos de MMLU, HumanEval o GSM8K en la información disponible, por lo que el rendimiento cognitivo no puede compararse de forma verificable.
- Riesgo de alucinación: no cuantificado en la documentación; en un modelo de 4B es esperable en tareas de conocimiento factual y en contextos muy largos con información poco saliente.
- Memoria de contexto: aunque la ventana es de 262.144 tokens, la VRAM necesaria crece con ella; las cifras medidas (7,8 GB) corresponden a una configuración concreta y a 4 slots.
- Licencia: NVIDIA Nemotron Open Model License es una licencia personalizada (no OSI), con condiciones específicas de uso comercial y redistribución que hay que revisar y citar correctamente.
- Procedencia de la cuantización: es un repositorio de terceros (SoAI) con 0 descargas y 0 likes en el momento de la consulta y creado en 2026-10-24; conviene validar la calidad frente a los pesos BF16 originales antes de producción.
- Calibración imatrix sesgada a chat, código y tool calls: el comportamiento puede degradarse en dominios alejados de esa distribución.

## Enlaces

- Repositorio GGUF de SoAI: https://huggingface.co/SoAIHQ/NVIDIA-Nemotron-3-Nano-4B-GGUF
- Modelo base BF16 de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Nano-4B-BF16
- Licencia NVIDIA Nemotron Open Model License: https://www.nvidia.com/en-us/agreements/enterprise-software/nvidia-nemotron-open-model-license/
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Model card en PDF (NVIDIA Developer): https://developer.nvidia.com/downloads/assets/ace/model_card/nemotron_3_nano_4b.pdf
- Model card en PDF (mirror NVIDIA China): https://developer.download.nvidia.cn/assets/ace/model_card/Nemotron_3_Nano_4B.pdf
- Cuantización GGUF alternativa (Unsloth): https://huggingface.co/unsloth/NVIDIA-Nemotron-3-Nano-4B-GGUF/blob/main/README.md
- Ficha en Secret AI: https://secretai.io/models/nvidia/NVIDIA-Nemotron-3-Nano-4B-GGUF
- NVIDIA Nemotron 3.5 Bolt E4B 4GB (modelo relacionado de la misma familia): https://research.nvidia.com/labs/nemotron/Nemotron-3.5-Bolt-E4B-4GB/
