# moeshawky/Ornith-1.5-9B

## Resumen

Ornith-1.5-9B es un modelo de lenguaje denso de aproximadamente 9.650 millones de parámetros desarrollado por Ornith AI, publicado en Hugging Face a través del repositorio del usuario moeshawky. El modelo se presenta como el miembro más ligero de la familia Ornith-1.5 y está diseñado para despliegue eficiente en una sola GPU, con una variante cuantizada (Ornith-1.5-9B-Mobile) orientada a dispositivos móviles. Según la model card, parte de la base de Qwen3.5 y Gemma 4, sobre la que se aplicaron fases de preentrenamiento continuado, mid-training y post-entrenamiento.

La propuesta diferencial de Ornith-1.5 es un bucle de auto-mejora de extremo a extremo: en lugar de depender de un conjunto fijo de tareas curadas manualmente, el sistema genera continuamente nuevas tareas de entrenamiento, descubre estrategias para resolverlas y mejora la política mediante aprendizaje por refuerzo. Esto se enmarca en la línea de investigación de la familia Ornith-1.5, que optimiza conjuntamente la generación de tareas, la construcción del andamiaje (scaffold) y los rollouts de solución.

El checkpoint subido por moeshawky es, según sus propias notas, exactamente el mismo que el publicado por el mantenedor original (upstream), con una plantilla de chat aumentada y DFlash incluido en una subcarpeta. El propósito de esta réplica es facilitar la experimentación privada; para uso en producción el autor recomienda descargar y referirse al repositorio upstream. La relevancia actual del modelo radica en su relación calidad/tamaño en tareas de código agéntico y en su licencia MIT, que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (basado en Qwen3.5 y Gemma 4, con preentrenamiento continuado, mid-training y post-entrenamiento) |
| Parametros totales | 9.653.104.368 (~9,65 mil millones) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (existe una variante Ornith-1.5-9B-Mobile cuantizada, sin detalles publicados) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Ornith-1.5-9B es un transformer denso de aproximadamente 9,65 mil millones de parámetros. La model card indica que la familia Ornith-1.5 se construye sobre Ornith-1.0, que a su vez se desarrolló a partir de Qwen3.5 y Gemma 4 mediante preentrenamiento continuado, mid-training y post-entrenamiento. No se especifican en la información disponible el número exacto de tokens de entrenamiento, la composición del dataset ni los detalles del proceso de alineación (RLHF/DPO).

La innovación técnica destacada es el bucle de auto-mejora: Ornith-1.5 extiende el enfoque de Ornith-1.0 (optimización de scaffold y rollouts) para optimizar conjuntamente la generación de tareas, la construcción del andamiaje y los rollouts de solución. El modelo genera continuamente nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora la política mediante aprendizaje por refuerzo. La model card remite al blog de Ornith para más detalles sobre el diseño de tareas, harness y recompensas de rollout. No se detallan innovaciones de atención (lineal, especulativa, etc.) en la información proporcionada.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, tag conversational).
- Razonamiento y resolución de tareas de código, con resultados destacados en benchmarks agénticos de terminal y SWE-bench.
- Capacidades de imagen-texto-a-texto (tag image-text-to-text), lo que sugiere soporte multimodal de entrada de imagen.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible.
- Soporte de agentes y razonamiento multi-paso: implícito por sus resultados en Terminal-Bench y SWE-bench, que evalúan flujos agénticos.
- Capacidades multilingües: no disponibles.
- Modo thinking: no confirmado en la información disponible.
- Compatibilidad con endpoints (tag endpoints_compatible).

## Casos de uso

- Automatización de tareas en terminal: el modelo obtiene 46,2 en Terminal-Bench 2.1 (Terminus-2) y 47,0 con Claude Code, por lo que es adecuado para agentes que ejecutan comandos, depuran entornos y resuelven incidencias de shell en pipelines de CI/CD.
- Resolución de issues de repositorios reales: con 70,6 en SWE-bench Verified y 47,5 en SWE-bench Pro, puede integrarse en flujos de triaje y parcheo automático de bugs en proyectos de software.
- Asistente de código en IDE: su tamaño de ~9,65B permite despliegue en una sola GPU, lo que facilita servir autocompletado y refactorización con baja latencia en entornos de desarrollo internos.
- Experimentación privada y prototipado: al ser una réplica del checkpoint upstream con licencia MIT, es adecuado para pruebas internas sin restricciones comerciales.
- Despliegue en el borde y móvil: la existencia de la variante Ornith-1.5-9B-Mobile cuantizada lo hace apto para aplicaciones en dispositivos con recursos limitados.
- Procesamiento de documentos con imagen: la etiqueta image-text-to-text sugiere uso en tareas que combinan capturas, diagramas o documentos escaneados con texto.
- Evaluación comparativa de modelos: útil como referencia de la familia Ornith-1.5 frente a Qwen3.5-9B y Gemma-4-31B en tareas de código.

## Benchmarks y rendimiento

Datos extraídos de la model card (familia Ornith-1.5):

| Benchmark | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Qwen3.6-35B-A3B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 46,2 | 43,1 | 21,3 | 52,5 | 42,1 |
| Terminal-Bench 2.1 (Claude Code) | 47,0 | 40,6 | 18,9 | 49,2 | - |
| SWE-bench Verified | 70,6 | 69,4 | 53,2 | 73,4 | 52,0 |
| SWE-bench Pro | 47,5 | 42,9 | 31,3 | 49,5 | - |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks generales.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa por tamaño (no dato del autor), un modelo de ~9,65B en fp16 requiere aproximadamente 19-20 GB de VRAM para los pesos, más overhead de contexto y activaciones.
- GPU recomendadas: no especificadas en la información disponible. El modelo se describe como "diseñado para despliegue eficiente en una sola GPU".
- Cabe en GPU de consumo: no confirmado; por tamaño, sería viable en GPUs con 24 GB o más en cuantizaciones de 8 bits o inferiores, aunque no hay datos oficiales.
- Opciones de despliegue: transformers (librería declarada); no se confirman vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | SWE-bench Verified | Terminal-Bench 2.1 (Terminus-2) | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-9B | ~9,65B denso | No disponible | 70,6 | 46,2 | MIT |
| Ornith-1.0-9B | ~9B (no confirmado) | No disponible | 69,4 | 43,1 | No disponible |
| Qwen3.5-9B | ~9B (no confirmado) | No disponible | 53,2 | 21,3 | No disponible |
| Qwen3.6-35B-A3B | 35B totales / 3B activos (MoE, según nombre) | No disponible | 73,4 | 52,5 | No disponible |
| Gemma-4-31B | ~31B (no confirmado) | No disponible | 52,0 | 42,1 | No disponible |

Ornith-1.5-9B supera claramente a Qwen3.5-9B y Gemma-4-31B en los benchmarks de código reportados, y se acerca al MoE Qwen3.6-35B-A3B pese a tener una fracción de los parámetros totales.

## Limitaciones y advertencias

- El repositorio es una réplica del checkpoint upstream; el autor recomienda usar el repositorio original para producción.
- No se dispone de información sobre sesgos conocidos ni sobre el dataset de entrenamiento.
- Riesgo de alucinación inherente a modelos generativos; no cuantificado en la información disponible.
- Longitud de contexto e idiomas soportados no documentados, lo que dificulta planificar despliegues multilingües o de contexto largo.
- Los benchmarks reportados son de la model card del autor y no han sido verificados de forma independiente.
- Aunque la licencia es MIT, conviene revisar el LICENSE del repositorio upstream enlazado en la model card para confirmar términos.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica escasa validación por parte de la comunidad.
- No se confirman soporte de tool calling, modo thinking ni cuantizaciones GGUF oficiales.

## Enlaces

- Hugging Face (réplica): https://huggingface.co/moeshawky/Ornith-1.5-9B
- Repositorio upstream referenciado en la model card: https://huggingface.co/ornith-ai/Ornith-1.5-9B
- Licencia upstream: https://huggingface.co/ornith-ai/Ornith-1.5-9B/blob/main/LICENSE
- Blog de Ornith-1.5: https://ornith.ai/ornith_1_5.html
