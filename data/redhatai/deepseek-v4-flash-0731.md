# RedHatAI/DeepSeek-V4-Flash-0731

## Resumen

DeepSeek-V4-Flash-0731 es la versión oficial de DeepSeek-V4-Flash, publicada por DeepSeek y redistribuida en formato FP8 por Red Hat AI (RedHatAI) para su uso en el portfolio de productos de IA de Red Hat. Sustituye a la versión preview e incorpora mejoras sustanciales en capacidades agénticas, manteniendo la misma estructura que DeepSeek-V4-Flash-DSpark, es decir, con un módulo de decodificación especulativa (DSpark) adjunto. El modelo cuenta con 304.180.418.494 parámetros totales según los pesos en safetensors y un repositorio de 166,9 GB en cuantización de 8 bits.

El modelo está orientado a tareas de razonamiento, generación de código y uso como agente autónomo. Según la model card, supera a DeepSeek-V4-Pro (Preview) en los benchmarks publicados pese a tener un número de parámetros activados mucho menor, y se declara ampliamente competitivo con los modelos propietarios más potentes del momento (GLM-5.2, Opus-4.8). Es relevante ahora porque combina licencia MIT, pesos abiertos en FP8 y recetas de despliegue validadas en vLLM, SGLang y las distribuciones empresariales de Red Hat (RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2).

La ficha se basa exclusivamente en la información disponible en Hugging Face y en la model card del autor; los datos no publicados se indican explícitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), familia deepseek_v4, con módulo de decodificación especulativa DSpark adjunto |
| Parametros totales | 304.180.418.494 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (8-bit) en el repositorio publicado; el modelo base admite configuración de KV cache en FP8 y FP4 indexer cache en vLLM |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

DeepSeek-V4-Flash-0731 es un transformer con mezcla de expertos (MoE) de la familia deepseek_v4, con 304.180 millones de parámetros totales. La model card no detalla el número de parámetros activos por token ni la composición del dataset de entrenamiento, por lo que esos datos deben considerarse no disponibles. El modelo incorpora un módulo de decodificación especulativa denominado DSpark, con el que comparte estructura con DeepSeek-V4-Flash-DSpark; en vLLM se activa mediante `--speculative-config` con `method: dspark`, 7 tokens especulativos y muestreo greedy del draft.

La model card menciona un informe técnico (arXiv:2606.19348) que no se ha podido consultar en la información proporcionada, por lo que no se dispone de detalles sobre el número de tokens de entrenamiento, la composición del corpus ni las etapas de RLHF/DPO. La release incluye un parámetro `reasoning_effort` con tres niveles (low, high, max) que controla la profundidad de deliberación antes de responder, y no incluye plantilla de chat en formato Jinja: en su lugar se distribuye una carpeta `encoding` con scripts Python (`encoding_dsv4`) para codificar mensajes en formato compatible con OpenAI y parsear la salida del modelo.

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento configurable en tres niveles de esfuerzo (`low`, `high`, `max`).
- Capacidades agénticas reforzadas: la versión 0731 mejora sustancialmente respecto a la preview en tareas de agente de código (Terminal Bench 2.1, DeepSWE, Toolathlon-Verified, Agents' Last Exam, AutomationBench).
- Generación de código y desarrollo full-stack: evaluada en NL2Repo, DSBench-FullStack y DSBench-Hard.
- Ciberseguridad ofensiva/defensiva evaluada en Cybergym.
- Tool calling y function calling: la receta de vLLM incluye la feature `tool_calling` y el modelo se sirve con endpoints compatibles (`endpoints_compatible`).
- Razonamiento multi-paso y uso de agentes con framework propio (DeepSeek Harness, pendiente de publicación).
- Decodificación especulativa integrada (DSpark) para acelerar la inferencia.
- Capacidades multilingües: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponible en la información proporcionada.

## Casos de uso

- Agente de código autónomo en terminal: con 82,7 en Terminal Bench 2.1, el modelo es adecuado para agentes que ejecutan comandos, interpretan salidas y corrigen errores en entornos shell, integrándose mediante el framework de agente y el modo `max` de razonamiento.
- Generación de repositorios completos a partir de lenguaje natural: su puntuación de 54,2 en NL2Repo lo sitúa como opción para pipelines que transforman especificaciones en estructuras de proyecto con múltiples ficheros.
- Automatización de tareas de desarrollo full-stack: con 68,7 en DSBench-FullStack y 59,6 en DSBench-Hard, puede emplearse en flujos internos de generación y refactorización de aplicaciones completas.
- Orquestación de herramientas y APIs: los 70,3 en Toolathlon-Verified indican buen desempeño en tareas que requieren encadenar llamadas a herramientas externas, útil para asistentes de operaciones o integraciones empresariales.
- Evaluación y auditoría de seguridad: su resultado de 76,7 en Cybergym permite usarlo en entornos controlados para análisis de vulnerabilidades y tareas de pentesting asistido.
- Despliegue en infraestructura empresarial Red Hat: validado en RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2 con vLLM 0.28.0, encaja en plataformas de inferencia gestionadas que requieran pesos FP8 y licencia permisiva.
- Servicio de inferencia de baja latencia: la decodificación especulativa DSpark con 7 tokens draft y el soporte de KV cache en FP8 reducen el coste por token en despliegues de alta concurrencia sobre nodos GB300.

## Benchmarks y rendimiento

| Benchmark | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Flash (Preview) | DeepSeek-V4-Pro (Preview) | GLM-5.2 | Opus-4.8 |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 82,7 | 61,8 | 72,1 | 81,0 | 85,0 |
| NL2Repo | 54,2 | 39,4 | 38,5 | 48,9 | 69,7 |
| Cybergym | 76,7 | 38,7 | 52,7 | - | 83,1 |
| DeepSWE | 54,4 | 7,3 | 12,8 | 46,2 | 58,0 |
| Toolathlon-Verified | 70,3 | 49,7 | 55,9 | 59,9 | 76,2 |
| Agents' Last Exam | 25,2 | 15,8 | 16,5 | 23,8 | 25,7 |
| AutomationBench Public | 25,1 | 10,8 | 12,8 | 12,9 | 27,2 |
| DSBench-FullStack † | 68,7 | 37,0 | 41,8 | 61,8 | 71,6 |
| DSBench-Hard † | 59,6 | 25,8 | 31,1 | 54,5 | 71,7 |

Notas de la model card: las tareas de Code Agent se evalúan con el modo minimal de DeepSeek Harness (pendiente de publicación) como framework de agente, con `max` reasoning effort y `temperature = 1.0, top_p = 0.95`. DSBench-FullStack es un conjunto interno de desarrollo full-stack y DSBench-Hard un conjunto interno de problemas difíciles de agente de código.

## Requisitos de hardware

- El repositorio en FP8 ocupa 166,9 GB, por lo que la inferencia requiere al menos esa cantidad de VRAM agregada más overhead de KV cache y activaciones.
- La receta oficial de vLLM se ejecuta en un único nodo de 4×GB300 con `--data-parallel-size 4` y `--enable-expert-parallel`, es decir, 4 GPUs GB300 en paralelo de datos.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de 80 GB; se requiere un despliegue multi-GPU de centro de datos.
- Opciones de despliegue validadas: vLLM 0.28.0, SGLang (con soporte DSpark), RHOAI 3.5.1 y RHAIIS 3.6.0-fast.2.
- Argumentos obligatorios en vLLM: `--trust-remote-code`, `--kv-cache-dtype fp8`, `--block-size 256`, backend `deep_gemm_mega_moe` y `--attention-config '{"use_fp4_indexer_cache": true}'`.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Rendimiento destacado | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-V4-Flash-0731 | 304,2 B | no disponible | MIT | Terminal Bench 82,7; DeepSWE 54,4 | Hugging Face (RedHatAI y deepseek-ai) |
| DeepSeek-V4-Pro (Preview) | no disponible | no disponible | no disponible | Terminal Bench 72,1; DeepSWE 12,8 | Hugging Face (deepseek-ai) |
| GLM-5.2 | no disponible | no disponible | no disponible | Terminal Bench 81,0; DeepSWE 46,2 | no disponible |
| Opus-4.8 | no disponible | no disponible | propietaria | Terminal Bench 85,0; DeepSWE 58,0 | API propietaria |

DeepSeek-V4-Flash-0731 supera a DeepSeek-V4-Pro (Preview) en todos los benchmarks publicados pese a su menor número de parámetros activados, y queda por encima de GLM-5.2 en Terminal Bench, NL2Repo, DeepSWE, Toolathlon-Verified, AutomationBench y DSBench, mientras que Opus-4.8 mantiene la delantera en la mayoría de métricas. Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo ni sobre la composición del dataset de entrenamiento.
- Riesgo de alucinación inherente a los modelos generativos; no hay evaluaciones de factualidad en la información disponible.
- Idiomas soportados no especificados: no se puede garantizar calidad fuera de los idiomas cubiertos por el entrenamiento.
- Longitud de contexto no publicada: planificar el despliegue sin asumir una ventana concreta.
- No incluye plantilla de chat Jinja; es obligatorio usar los scripts de la carpeta `encoding` para el formateo correcto de mensajes y el parseo de la salida.
- Requiere `--trust-remote-code` en vLLM, lo que implica ejecutar código del repositorio; auditar antes en entornos sensibles.
- El framework de evaluación DeepSeek Harness no está publicado, lo que dificulta reproducir exactamente los resultados de los benchmarks de agente.
- El modelo ocupa 166,9 GB en FP8 y exige infraestructura multi-GPU de centro de datos; no es viable en hardware de consumo.
- Licencia MIT: permite uso comercial, pero conviene revisar las condiciones de los pesos base de DeepSeek y de los componentes de terceros incluidos en el repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/RedHatAI/DeepSeek-V4-Flash-0731
- README del modelo: https://huggingface.co/RedHatAI/DeepSeek-V4-Flash-0731/blob/main/README.md
- Informe técnico: https://arxiv.org/abs/2606.19348
- Organización DeepSeek AI en Hugging Face: https://huggingface.co/deepseek-ai
- Modelo DeepSeek-V4-Flash-DSpark: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash-DSpark
- Receta de vLLM: https://recipes.vllm.ai/deepseek-ai/DeepSeek-V4-Flash?hardware=b300&features=tool_calling,reasoning
- Organización RedHatAI en Hugging Face: https://huggingface.co/RedHatAI
- Catálogo de modelos RedHatAI: https://huggingface.co/RedHatAI/models
- Página de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
- Twitter de DeepSeek AI: https://twitter.com/deepseek_ai
