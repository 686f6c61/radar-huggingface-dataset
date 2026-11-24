# Cheblan/ThinkingCap-Qwen3.8-Flash-Next-faf

## Resumen
ThinkingCap-Qwen3.8-Flash-Next-faf es una distribución cuantizada y empaquetada del modelo ThinkingCap-Qwen3.8-Flash-Next, desarrollado originalmente por BottleCap AI sobre la base Qwen3.8-Flash-Next del equipo Qwen. El paquete lo publica Cheblan dentro de su colección de cuantizaciones "fastasfuck" y está específicamente orientado al motor de inferencia homónimo sobre la arquitectura de memoria unificada AMD Strix Halo (gfx1151, Ryzen AI Max+ 395 con 128 GB de LPDDR5X-8533).

El modelo aplica un ajuste por refuerzo orientado a razonamiento eficiente: según la model card, reduce los tokens de razonamiento en torno a un 38,5 % de media manteniendo la precisión en benchmarks. Es un modelo MoE multimodal (pipeline image-text-to-text) con decodificación especulativa mediante MTP y una tabla n-gram de prefijos de 8,4 millones de filas.

Su relevancia es doble: por un lado, demuestra un flujo de cuantización híbrida Q6/Q4/Q8 en formato binario propietario `.faf`; por otro, es un caso práctico de despliegue de un modelo grande en hardware de consumo de gama alta con memoria unificada, alcanzando 73,8 tok/s en decodificación greedy individual y 104,4 tok/s agregados con cuatro slots concurrentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (image-text-to-text) con decodificación especulativa MTP; dimensiones exactas no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no disponible (el modelo base es MoE) |
| Longitud de contexto | al menos 128k tokens (se documentan prefill a 32k y 128k); máximo exacto no disponible |
| Tipos de cuantizacion | Híbrida Q6 / Q4 / Q8 en formato `.faf`; tabla n-gram int8 |
| Idiomas soportados | no disponible |
| Licencia | Qwen Community License 1.0 |
| Formato de pesos | `.faf` (binario propietario del motor fastasfuck); no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento
El modelo base es un transformer con mezcla de expertos (MoE) y capacidad multimodal de entrada de imagen y texto, tal como indica el `pipeline_tag`. Sobre esa base, BottleCap AI aplica un entrenamiento por refuerzo (RL) para reducir la verbosidad del razonamiento sin degradar la precisión, según declara la model card del paquete cuantizado. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas adicionales como DPO.

La innovación más destacable del paquete es el pipeline de inferencia: combina decodificación especulativa MTP con 7 pasos de borrador y una tabla de prefijos n-gram (PLE, Prefix Lookahead Engine) de 8.388.608 filas en int8, lo que reduce la latencia inter-token efectiva a un rango de 13,0 a 32,2 ms. El motor garantiza reproducibilidad bit a bit (100 % de coincidencia SHA-256) a temperatura 0,0. La cuantización es híbrida: los pesos MoE se reparten entre Q6, Q4 y Q8 según la sensibilidad de cada tensor, y el paquete incluye además una torre de proyección visual nativa (`vision.faf`, ~856 MiB).

## Capacidades
- Generación de texto y razonamiento con modo de pensamiento eficiente (bloques de thinking en la plantilla de chat), optimizado para gastar menos tokens de razonamiento.
- Procesamiento de imagen y texto (image-text-to-text) mediante torre de proyección visual nativa.
- Soporte de tool calling y function calling a través de la plantilla Jinja2 (`chat_template.jinja`) que contempla llamadas a herramientas.
- Capacidad de razonamiento multi-paso y uso en agentes, con soporte de múltiples slots concurrentes en el servidor.
- Decodificación especulativa integrada (MTP + tabla n-gram) para acelerar la generación.
- API compatible con OpenAI (`/v1/chat/completions` y `/v1/responses`), integrable con Codex CLI, OpenCode 2 y Cursor.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso
- Asistentes de código en IDE: el modelo se integra con Cursor, Codex CLI y OpenCode 2 mediante la API `/v1/responses`, con reutilización de caché KV entre turnos, lo que lo hace adecuado para autocompletado y refactorización en sesiones largas.
- Agentes concurrentes en local: con cuatro slots activos y 104,4 tok/s agregados, puede atender varios agentes en paralelo en una sola máquina Strix Halo, por ejemplo para orquestación de tareas o pipelines de CI/CD.
- Análisis de documentación técnica extensa: con contexto de al menos 128k tokens y prefill de ~1.378 tok/s, permite procesar corpus grandes de código C++ o documentación en una sola pasada.
- Razonamiento eficiente en producción: la reducción del ~38,5 % de tokens de razonamiento abarata el coste por consulta en tareas de análisis, clasificación o resolución de problemas donde el modelo base gastaría más presupuesto de decodificación.
- Procesamiento multimodal de capturas y diagramas: la torre de visión permite describir imágenes, extraer información de diagramas técnicos o interpretar capturas de pantalla en flujos de soporte.
- Reproducibilidad y auditoría: la garantía de coincidencia SHA-256 bit a bit a temperatura 0,0 lo hace apto para entornos donde se exige reproducibilidad exacta de las salidas, como pruebas de regresión o generación de informes deterministas.
- Despliegue en hardware de consumo de gama alta: al ejecutarse sobre memoria unificada de 128 GB, permite servir un modelo MoE grande sin GPUs de datacenter.

## Benchmarks y rendimiento
La información disponible incluye métricas de rendimiento del motor sobre AMD Ryzen AI Max+ 395, no resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.).

| Métrica | Valor medido | Condición |
|---|---|---|
| Decodificación greedy individual (T = 0,0) | 73,8 tok/s de media (pico 89,7 tok/s) | 1 slot, prefill en frío, prompt-cache off |
| Decodificación multi-agente (4 slots) | 104,4 tok/s agregados (pico 115,5 tok/s) | 4 slots concurrentes bajo carga continua |
| Prefill a 32k de contexto | ~1.458 tok/s (TTFT 21,2 s) | Corpus de código C++ no repetitivo |
| Prefill a 128k de contexto | ~1.378 tok/s (TTFT 91,8 s) | Corpus de código C++ no repetitivo |
| Latencia inter-token efectiva | 13,0–32,2 ms | 7 pasos MTP + tabla PLE de 8M filas |
| Reproducibilidad | 100,000 % coincidencia SHA-256 | Determinista a T = 0,0 |

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware
- Memoria: el repositorio ocupa 123,1 GB; los pesos cuantizados (`weights.faf`) son ~65,5 GiB y la tabla n-gram ~48,3 GiB, más ~856 MiB de la torre de visión. Se requiere memoria unificada o VRAM del orden de 120 GB para cargar el paquete completo.
- GPU recomendadas: el objetivo declarado es AMD Strix Halo (Ryzen AI Max+ 395, 40 CUs RDNA 3.5 `gfx1151`, 128 GB LPDDR5X-8533 a 273 GB/s). No se documenta soporte para A100, H100 ni RTX 4090.
- GPU de consumo: no cabe en GPUs de consumo con VRAM discreta convencional (24 GB o menos); está pensado para sistemas de memoria unificada de 128 GB como Strix Halo.
- Despliegue: exclusivamente mediante el motor fastasfuck (binario nativo `fastasfuck_server` o contenedor Podman/Docker `ghcr.io/cheblan/fastasfuck:latest`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 73,8 tok/s individuales y 104,4 tok/s con 4 slots; TTFT de 21,2 s a 32k y 91,8 s a 128k de contexto.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato / motor | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-Flash-Next-faf (este) | no disponible (MoE) | ≥128k | `.faf` / fastasfuck | Qwen Community License 1.0 | Hugging Face, 0 descargas |
| bottlecapai/ThinkingCap-Qwen3.8-Flash-Next | no disponible | no disponible | safetensors (presumible) | no disponible | Hugging Face (modelo base) |
| Qwen/Qwen3.8-Flash-Next | no disponible | no disponible | safetensors (presumible) | Qwen Community License 1.0 | Hugging Face (modelo fundacional) |

No se dispone de datos de benchmarks de calidad ni de especificaciones detalladas de los modelos base en la información proporcionada, por lo que no es posible una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias
- Dependencia total del motor fastasfuck: el formato `.faf` es propietario y no es compatible con ecosistemas estándar como llama.cpp, vLLM u Ollama, lo que limita la portabilidad.
- Hardware muy específico: está optimizado para AMD Strix Halo (`gfx1151`); no hay evidencia de funcionamiento en GPUs NVIDIA ni en otras arquitecturas.
- La cuantización híbrida Q6/Q4/Q8 puede introducir degradación de calidad respecto al modelo original en tareas sensibles; no se publican evaluaciones comparativas.
- Riesgo de alucinación inherente a los modelos de lenguaje, agravado si la cuantización afecta a capas críticas; no hay datos que lo cuantifiquen.
- Idiomas soportados no documentados; no se puede garantizar un rendimiento multilingüe equilibrado.
- Licencia Qwen Community License 1.0: conviene revisar sus condiciones antes de un uso comercial, ya que puede imponer restricciones adicionales a las de una licencia puramente permisiva.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: ecosistema de validación prácticamente inexistente y sin retroalimentación de la comunidad.
- El tamaño del paquete (123,1 GB) y la tabla n-gram (48,3 GiB) exigen almacenamiento y memoria considerables, lo que descarta su uso en entornos con recursos limitados.
- La fecha de creación indicada (2026-11-24) debe tomarse con cautela a efectos de trazabilidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Cheblan/ThinkingCap-Qwen3.8-Flash-Next-faf
- Modelo base (BottleCap AI): https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-Flash-Next
- Modelo fundacional (Qwen): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio del motor fastasfuck: https://github.com/Cheblan/fastasfuck
- Documentación de benchmarks: https://github.com/Cheblan/fastasfuck/blob/main/docs/BENCHMARKS.md
- Colección de cuantizaciones fastasfuck: https://huggingface.co/collections/Cheblan/fastasfuck-quantizations
- Imagen de contenedor: https://ghcr.io/cheblan/fastasfuck
