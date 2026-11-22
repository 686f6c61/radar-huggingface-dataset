# litert-community/FastContext-1.0-4B-SFT

## Resumen

FastContext-1.0-4B-SFT es un modelo de lenguaje de 4.000 millones de parámetros especializado en la exploración de repositorios de código como sub-agente de herramientas de programación. Desarrollado originalmente por Microsoft sobre el backbone de Qwen3-4B-Instruct, el modelo se entrenó mediante ajuste supervisado (SFT) para realizar descubrimiento de repositorios y recopilación de evidencias mediante llamadas paralelas a herramientas (READ, GLOB, GREP). La versión aquí descrita es una conversión comunitaria al formato LiteRT-LM (`.litertlm`) publicada por litert-community, orientada a inferencia en dispositivo (on-device) y entornos edge.

El modelo resulta relevante por su enfoque vertical: en lugar de competir como un asistente generalista, se posiciona como un componente especializado dentro de pipelines de agentes de código, donde la latencia y el coste por token importan. Su tamaño de 4B parámetros y su cuantización int4 por bloques lo hacen desplegable en hardware móvil, como demuestran las mediciones del autor en un Galaxy S26 (18,4 tok/s de decodificación en GPU) o en una Raspberry Pi 5 (1,5 tok/s en CPU con 4 hilos).

Conviene señalar que los repositorios fuente de Microsoft (`microsoft/FastContext-1.0-4B-SFT` y `microsoft/FastContext-1.0-4B-RL`) ya no están disponibles en Hugging Face y que el paper asociado (arXiv:2606.14066) fue retirado del servidor arXiv el 30 de junio de 2026. Esta conversión se realizó antes de esas retiradas, a partir del release SFT publicado bajo licencia MIT.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3ForCausalLM) |
| Parámetros totales | 4B (aproximado, según el nombre del modelo) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int4 simétrico por bloques (block 32 y block 128); pesos en formato LiteRT-LM |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | `.litertlm` (LiteRT-LM); también disponible en la rama `web` para WebGPU |
| Tamaño de los ficheros | `model.litertlm` ~2,5 GiB; repo completo 15,4 GB |
| Modelo base | microsoft/FastContext-1.0-4B-SFT (sobre Qwen3-4B-Instruct) |
| Runtime | LiteRT-LM (Google AI Edge) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura transformer decoder-only estándar, concretamente la implementación `Qwen3ForCausalLM` de Qwen3-4B-Instruct, lo que permite reutilizar directamente el conversor y el runtime existentes para Qwen3. Sobre ese backbone, Microsoft aplicó un ajuste supervisado (SFT) orientado a una tarea concreta: la exploración de repositorios de código mediante llamadas paralelas a herramientas de lectura de ficheros, búsqueda por patrón (GLOB) y búsqueda por contenido (GREP). No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas posteriores de RLHF o DPO; existió un release RL (`FastContext-1.0-4B-RL`) pero su repositorio ya no está accesible.

La innovación técnica principal de esta conversión no reside en el entrenamiento sino en el despliegue: los ficheros publicados el 16 de noviembre de 2026 reescriben el grafo de prefill y decode para GPU sin modificar ningún peso, lo que se traduce en mejoras medidas de 1,45 a 1,54 veces en velocidad de decodificación y de 1,19 a 1,47 veces en prefill respecto a los ficheros anteriores en el mismo dispositivo (Galaxy S26). Se ofrecen dos variantes de cuantización int4 simétrica, con bloque 32 y bloque 128, que intercambian precisión por tamaño y velocidad. La decodificación especulativa y otras técnicas de aceleración no están documentadas en la información disponible.

## Capacidades

- Generación de texto orientada a tareas de agente, con especialización en exploración de repositorios de código.
- Llamada a herramientas (tool calling) en paralelo: READ, GLOB y GREP como primitivas de descubrimiento de ficheros y evidencias.
- Razonamiento multi-paso dentro de un bucle de agente: el modelo propone qué leer, lee, y refina la búsqueda en función de los resultados.
- Comprensión de estructura de proyectos de software: identifica puntos de entrada, ficheros de configuración y convenciones (por ejemplo, `main.py`, `pyproject.toml`, `setup.py`).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponibles.
- Integración con el runtime LiteRT-LM para ejecución en Android, iOS, macOS, Linux y navegador (WebGPU).

## Casos de uso

- Sub-agente de exploración en asistentes de código: integrado en un agente principal (por ejemplo, un IDE con LLM de mayor tamaño), FastContext se encarga de localizar los ficheros relevantes antes de que el modelo grande genere la respuesta, reduciendo el número de tokens de contexto que debe procesar este último.
- Indexación semántica de repositorios en local: el modelo puede ejecutarse en el portátil del desarrollador sin conexión para generar resúmenes de estructura de proyecto y mapas de dependencias entre ficheros.
- Automatización de revisiones de código en CI/CD: dado un diff, el modelo localiza los ficheros afectados y las referencias cruzadas mediante GREP, aportando contexto al revisor automático.
- Asistencia en dispositivos móviles para desarrollo: con 18,4 tok/s de decodificación en la GPU de un Galaxy S26, es viable un asistente de exploración de repositorios embebido en una app Android para consultas puntuales sobre el código.
- Despliegue en entornos air-gapped: al caber en una Raspberry Pi 5 y no requerir conexión, puede usarse en instalaciones con requisitos de confidencialidad donde el código no puede salir de la red local.
- Prototipado rápido de agentes de código: la disponibilidad del formato `.litertlm` y del CLI `litert-lm` permite validar pipelines de tool calling con un solo comando, sin infraestructura de GPU dedicada.
- Demos web interactivas: la rama `web` del repositorio (2,66 GB) permite ejecutar el modelo en el navegador con WebGPU, útil para evaluaciones y demos sin instalación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible. Los únicos datos de rendimiento son mediciones de inferencia en dispositivo:

| Dispositivo | Runtime | Modo | Decode (tok/s) | Prefill (tok/s) | TTFT | Fecha |
|---|---|---|---|---|---|---|
| Galaxy S26 | LiteRT-LM 0.19.0 | GPU (`model.litertlm`) | 18,4 | 168 (1.024 tok) | no disponible | 2026-11 |
| Galaxy S26 | LiteRT-LM 0.19.0 | GPU (`model_block128`) | 20,4 | 170 (1.024 tok) | no disponible | 2026-11 |
| Galaxy S26 | LiteRT-LM 0.16.0 | GPU (ficheros previos) | 7,5 | 86 | 2,47 s | 2026-08 |
| Galaxy S26 | LiteRT-LM 0.16.0 | CPU (ficheros previos) | 7,1 | 37 | 5,61 s | 2026-09 |
| Mac Studio M4 Max | LiteRT-LM 0.14.0 | GPU | 74,5 | 964 | 279 ms | 2026-07 |
| Raspberry Pi 5 | LiteRT-LM 0.16.1 | CPU, 4 hilos | 1,4–1,5 | 10 | 26–28 s | 2026-09 |

## Requisitos de hardware

- VRAM/RAM estimada: el fichero `model.litertlm` ocupa aproximadamente 2,5 GiB en int4, por lo que se necesita al menos ese espacio más el overhead del runtime. En el Galaxy S26, el contador de asignación GPU del dispositivo (`kgsl_page_alloc`) subió 5,21 GB durante la ejecución de `model.litertlm` y 4,83 GB con `model_block128`.
- GPU recomendadas: no hay una lista oficial; las mediciones disponibles cubren GPU móviles (Galaxy S26, Pixel 11 Pro), GPU integradas de Apple (Mac Studio M4 Max) y CPU de Raspberry Pi 5.
- Compatibilidad con GPU de consumo: no confirmada para tarjetas de escritorio NVIDIA o AMD; el runtime LiteRT-LM está orientado a GPU móviles, Apple y WebGPU.
- Opciones de despliegue: LiteRT-LM (CLI `litert-lm`, versión 0.19.0 o superior para la ruta GPU en Android), WebGPU en navegador mediante la rama `web`, y el runtime LiteRT-LM para Android/iOS/macOS/Linux. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ver tabla de benchmarks. En Mac Studio M4 Max se alcanzan 74,5 tok/s de decodificación y 279 ms de TTFT; en Raspberry Pi 5 el TTFT sube a 26–28 s, lo que limita su uso a consultas no interactivas.
- Nota operativa: el CLI `litert-lm` (0.14.0 a 0.19.2) reutiliza un `model.litertlm` descargado previamente sin verificar su integridad contra el repositorio, por lo que copias antiguas o descargas incompletas persisten; es necesario borrar el fichero y volver a ejecutar.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Formato edge |
|---|---|---|---|---|---|
| FastContext-1.0-4B-SFT (esta ficha) | 4B | no disponible | Exploración de repositorios, tool calling | MIT | LiteRT-LM (int4) |
| Qwen3-4B-Instruct | 4B | no disponible | Asistente generalista | no disponible en la información | Múltiples (incluye GGUF) |
| FastContext-1.0-4B-RL | 4B | no disponible | Exploración de repositorios (variante RL) | no disponible (repo retirado) | no disponible |

La comparación con otros sub-agentes de exploración de código de tamaño similar no está disponible en la información proporcionada. El modelo base Qwen3-4B-Instruct es la referencia natural, pero no se han publicado comparativas de rendimiento entre ambos en las fuentes consultadas.

## Limitaciones y advertencias

- Modelo vertical: está entrenado específicamente para exploración de repositorios y tool calling con READ/GLOB/GREP; su rendimiento como asistente generalista, en matemáticas o en generación de código completo no está documentado y probablemente sea inferior al de Qwen3-4B-Instruct sin ajustar.
- Repositorios fuente retirados: `microsoft/FastContext-1.0-4B-SFT` y `microsoft/FastContext-1.0-4B-RL` ya no están en Hugging Face, y el paper arXiv:2606.14066 fue retirado el 30 de junio de 2026. Los enlaces a la fuente original en la model card no resuelven.
- Idiomas soportados no documentados: no hay información sobre cobertura multilingüe; asumir un rendimiento inferior fuera del inglés.
- Longitud de contexto no documentada: no se especifica la ventana máxima, lo que impide planificar su uso con repositorios grandes sin pruebas previas.
- Riesgo de alucinación: como todo modelo de 4B, puede inventar rutas de ficheros o nombres de funciones; en un bucle de agente conviene validar las rutas devueltas contra el sistema de ficheros real.
- Estado de validación incompleto: los ficheros publicados el 16 de noviembre de 2026 no se han probado en iPhone (los anteriores sí), y solo se han ejecutado con LiteRT-LM 0.19.0 en móviles y Mac, y 0.19.1–0.19.2 en Mac.
- Dependencia del runtime: la ruta GPU en Android requiere LiteRT-LM 0.19.0 o superior; versiones anteriores no funcionan con estos ficheros.
- Licencia MIT: permite uso comercial, pero al derivar de Qwen3-4B-Instruct conviene verificar las condiciones de la licencia original de Qwen3, no detalladas en esta ficha.
- Sin datos de sesgo: no se ha publicado información sobre sesgos demográficos, lingüísticos o de otro tipo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/litert-community/FastContext-1.0-4B-SFT
- Modelo base original (retirado): https://huggingface.co/microsoft/FastContext-1.0-4B-SFT
- Paper en arXiv (retirado): https://arxiv.org/abs/2606.14066
- Runtime LiteRT-LM: https://github.com/google-ai-edge/litert-lm
- Demo web con WebGPU: https://google-ai-edge.github.io/LiteRT-LM/web_demos/chat/index.html?model=litert-community/FastContext-1.0-4B-SFT
- Registro de mediciones edge-compat (`model.litertlm`): https://github.com/john-rocky/edge-compat/blob/main/cards/fastcontext-1.0-4b-sft-model-block128/CARD.md
- Registro de mediciones edge-compat (`model_block128`): https://github.com/john-rocky/edge-compat/blob/main/cards/fastcontext-4b/CARD.md
