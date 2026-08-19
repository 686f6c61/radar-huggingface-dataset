# Qapdex/Idun-5-MoE-sdk-GGUF

## Resumen

**idun-gguf** es un paquete de software que implementa un agente conversacional con herramientas (tool-agent) completamente local, desarrollado por Qapdex. No es un modelo de lenguaje en sí, sino un framework que orquesta modelos GGUF ejecutados a través de Ollama, replicando el patrón del SDK propietario idun-sdk pero sin dependencia de servicios en la nube. El repositorio en HuggingFace se presenta bajo el nombre `Idun-5-MoE-sdk-GGUF`, aunque la documentación no especifica ningún modelo base propio; el autor recomienda usar `qwen3:8b` (GGUF, Q4_K_M, 5.2 GB) como motor por defecto, con alternativas como `qwen3:14b`, `llama3.1:8b` o `mistral-nemo:12b`.

La relevancia actual radica en la creciente demanda de agentes autónomos que operen sin conexión, con privacidad total y sin costes de API. idun-gguf ofrece una interfaz unificada (CLI, Python y servidor MCP) que integra siete herramientas (búsqueda web, memoria vectorial, operaciones de archivos y ejecución de código) y devuelve tanto la respuesta final como la trayectoria completa del agente. Está pensado para desarrolladores que quieren desplegar asistentes con capacidades de razonamiento multi-paso en entornos locales, con requisitos modestos de hardware (CPU y ~8 GB de RAM).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el paquete no define un modelo propio; usa modelos GGUF externos vía Ollama) |
| Parametros totales | no disponible (depende del modelo subyacente; el recomendado qwen3:8b tiene 8B) |
| Parametros activos | no disponible (no se indica si el modelo subyacente es MoE) |
| Longitud de contexto | no disponible (depende del modelo GGUF elegido) |
| Tipos de cuantizacion | GGUF (el autor recomienda Q4_K_M para qwen3:8b) |
| Idiomas soportados | en, de (según metadatos del repo; el modelo subyacente puede soportar más) |
| Licencia | MIT |
| Formato de pesos | GGUF (aunque el repo es un paquete Python, no contiene pesos; los modelos se descargan vía Ollama) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo subyacente ni sobre su entrenamiento. El repositorio `Idun-5-MoE-sdk-GGUF` no incluye pesos ni detalles de arquitectura; es un paquete de software que actúa como cliente de Ollama. El nombre sugiere una posible arquitectura MoE, pero no hay confirmación en la documentación. El autor indica que el agente utiliza el patrón de idun-sdk, que en su versión cloud emplea Azure, mientras que esta versión local usa Ollama. No se mencionan datos de entrenamiento, técnicas de alineación (RLHF/DPO) ni innovaciones arquitectónicas propias.

## Capacidades

- **Agente con herramientas**: integra siete herramientas registradas: `web_search` (búsqueda DuckDuckGo), `memory_search` y `memory_save` (memoria vectorial con ChromaDB), `file_read`, `file_write`, `file_list` (operaciones de archivos) y `code_executor` (ejecución de código Python con timeout).
- **Trayectoria completa**: devuelve tanto la respuesta final (`.text`) como el historial de pasos (`.steps`) que incluye razonamiento, llamadas a herramientas y resultados.
- **Interfaz múltiple**: CLI (`idun-gguf chat`, `trace`, `tools`, `model`), cliente Python (`IdunLocalClient().complete()`) y servidor MCP (stdio) con herramientas `idun_chat` e `idun_trace`.
- **Compatibilidad con Ollama**: funciona con cualquier modelo GGUF disponible en Ollama, permitiendo cambiar de modelo sin modificar el código.
- **Ejecución 100% local**: sin necesidad de API key ni conexión a servicios externos (excepto la búsqueda web, que usa DuckDuckGo).
- **Salida JSON**: opción `--json` en CLI para integración en pipelines.

## Casos de uso

- **Asistente de investigación local**: un usuario puede preguntar "¿Cuál es la última versión de Python?" y el agente ejecutará `web_search`, resumirá los resultados y guardará la información en memoria para consultas futuras.
- **Automatización de tareas de archivos**: mediante `file_read`, `file_write` y `file_list`, el agente puede leer, modificar y organizar archivos en el sistema local, por ejemplo, para generar informes o renombrar archivos por lotes.
- **Ejecución de código en entornos aislados**: `code_executor` permite al agente escribir y ejecutar scripts Python con timeout, útil para prototipado rápido o para validar fragmentos de código sin salir del chat.
- **Base de conocimiento personal**: con `memory_save` y `memory_search`, el agente puede almacenar hechos, preferencias o notas y recuperarlos contextualmente en conversaciones posteriores, actuando como memoria persistente.
- **Integración en IDEs o editores**: mediante el servidor MCP, se puede conectar a herramientas como VS Code o emacs para que el agente realice operaciones de archivos o ejecute código dentro del entorno de desarrollo.
- **Prototipado de agentes sin coste de API**: desarrolladores pueden probar flujos de razonamiento multi-paso y tool-calling con modelos locales antes de migrar a soluciones cloud, gracias a la compatibilidad con Ollama y la salida de trayectoria completa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento del agente ni del modelo subyacente. El autor solo menciona que `qwen3:8b` tiene "excelente tool-calling", pero sin datos cuantitativos.

## Requisitos de hardware

- **RAM**: ~8 GB libres para el modelo recomendado `qwen3:8b` (Q4_K_M, 5.2 GB).
- **Disco**: ~5.2 GB para el modelo GGUF, más espacio para el paquete y dependencias.
- **CPU**: el autor indica que es "CPU-freundlich" (amigable con CPU), por lo que puede ejecutarse sin GPU dedicada.
- **GPU**: no se especifica; si se dispone de GPU, Ollama puede aprovecharla para acelerar la inferencia, pero no es un requisito.
- **Opciones de despliegue**: el paquete se instala con `pip install -e .` y requiere Ollama como servidor local. Se puede usar como CLI, biblioteca Python o servidor MCP.
- **Latencia y throughput**: no se proporcionan datos. Dependen del modelo GGUF y del hardware; en CPU, la latencia será mayor que en GPU.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este paquete con otros tool-agents locales. El repositorio no ofrece métricas ni comparaciones. Se podría comparar conceptualmente con frameworks como LangChain o AutoGen, pero no hay datos objetivos en la documentación. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- **Dependencia del modelo subyacente**: el rendimiento y los sesgos dependen del modelo GGUF elegido (por defecto `qwen3:8b`). No hay control sobre la calidad del modelo base.
- **Riesgo de alucinación**: como cualquier LLM, el agente puede generar respuestas incorrectas o inventadas, especialmente en tareas de razonamiento complejo.
- **Búsqueda web externa**: la herramienta `web_search` usa DuckDuckGo, lo que implica que las consultas salen del entorno local, contradiciendo parcialmente la promesa de "100% local".
- **Memoria vectorial**: `memory_search` y `memory_save` requieren ChromaDB, que no está incluida en las dependencias básicas; hay que instalarla por separado.
- **Idiomas limitados**: los metadatos indican solo inglés y alemán, aunque el modelo subyacente puede soportar más; la documentación está en alemán.
- **Licencia MIT**: permite uso comercial, pero el autor no ofrece garantías ni soporte.
- **Sin benchmarks**: no hay evidencia publicada de rendimiento en tareas estándar, lo que dificulta evaluar su fiabilidad en producción.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Qapdex/Idun-5-MoE-sdk-GGUF
- Repositorio GitHub de idun-sdk (referenciado en la documentación): https://github.com/qapdex-maker/idun-sdk
- Documentación de Ollama: https://ollama.com/
