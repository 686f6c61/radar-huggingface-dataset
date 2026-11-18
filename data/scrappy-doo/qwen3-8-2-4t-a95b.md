# Scrappy-Doo/Qwen3.8-2.4T-A95B

## Resumen

Qwen3.8-2.4T-A95B es un modelo de lenguaje causal de tipo Mixture of Experts (MoE) publicado por el autor Scrappy-Doo en Hugging Face, con arquitectura derivada de la familia Qwen3.5 y etiquetado como `qwen3_5_moe_text`. Se presenta como la primera release abierta de un modelo de clase Qwen-Max, con 2,4 billones de parametros totales y 95.000 millones activados por token. El repositorio contiene unicamente pesos y ficheros de configuracion en formato Transformers, compatibles con vLLM, SGLang y TokenSpeed.

El modelo esta disenado para tareas de codigo, trabajo profesional, investigacion y tareas agenticas de horizonte largo, con control flexible del razonamiento mediante `reasoning_effort` y retencion de contexto de razonamiento historico mediante `preserve_thinking`. Su ventana de contexto nativa es de 262.144 tokens, extensible hasta 1.010.000 tokens.

La relevancia actual del modelo radica en su escala: es un MoE de clase Max liberado con pesos abiertos, algo poco habitual en esta categoria de tamano. No obstante, el repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo es de 4.892,4 GB, lo que condiciona fuertemente su despliegue practico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal LM, MoE hibrido con Gated DeltaNet y Gated Attention |
| Parametros totales | 2.446.182.725.504 (2,4T) |
| Parametros activos | 95B (10 expertos enrutados + 1 compartido) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | qwen3.8-max (license: other) |
| Formato de pesos | safetensors (Transformers) |

## Arquitectura y entrenamiento

El modelo emplea un transformer causal con layout hibrido: 23 bloques de la forma `3 × (Gated DeltaNet → MoE) → 1 × (Gated Attention → MoE)`, con 92 capas en total. La dimension oculta es 8192. Las capas de atencion lineal Gated DeltaNet usan 128 cabezas para V y 16 para QK, con dimension de cabeza 128. Las capas de Gated Attention usan 64 cabezas para Q y 4 para KV, con dimension de cabeza 256 y dimension de RoPE de 64. El componente MoE cuenta con 512 expertos, de los cuales se activan 10 enrutados mas 1 compartido, con dimension intermedia de experto de 2048. El embedding y la salida LM tienen 248.320 entradas (con padding).

El modelo fue entrenado en dos etapas, pre-entrenamiento y post-entrenamiento, e incorpora Multi-Token Prediction (MTP) entrenado con multiples pasos. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO. La model card menciona mejoras en ejecucion agentica, planificacion autonoma y manejo de retroalimentacion del entorno, ademas de compatibilidad con harnesses y herramientas de desarrollo populares.

## Capacidades

- Generacion de texto conversacional y razonamiento de multiples pasos.
- Codigo y tareas de ingenieria de software, incluyendo agentes de terminal y resolucion de issues.
- Tareas agenticas de horizonte largo con planificacion autonoma y manejo de feedback del entorno.
- Control flexible del razonamiento mediante `reasoning_effort`.
- Retencion de contexto de razonamiento historico mediante `preserve_thinking`.
- Soporte de contexto largo: 262.144 tokens nativos, extensible hasta 1.010.000.
- Compatibilidad con vLLM, SGLang y TokenSpeed para despliegue.
- La version oficial Qwen3.8-Max anade vision, modo no-thinking, contexto de 1M por defecto y herramientas integradas; estas capacidades no se confirman en los pesos abiertos de este repositorio.
- Soporte de tool calling y function calling: no se detalla explicitamente en la informacion disponible para los pesos abiertos.
- Capacidades multilingues: no disponible.

## Casos de uso

- Agentes de codigo en terminal: el modelo puede ejecutar tareas de tipo Terminal Bench 2.1, con un 86,6 reportado, y resolver problemas de ingenieria de software en entornos automatizados, aprovechando su capacidad de planificacion y manejo de feedback del entorno.
- Resolucion de issues en repositorios reales: con SWE-bench Pro reportado en 80,0, es adecuado para pipelines que reciben un issue y generan un parche verificable, integrándose en flujos de CI/CD.
- Razonamiento de multiples pasos con contexto largo: su ventana de 262.144 tokens permite procesar documentos extensos, historiales de conversacion o bases de codigo completas sin truncar.
- Investigacion asistida: el modelo puede resumir y razonar sobre literatura tecnica extensa, manteniendo el hilo de razonamiento entre turnos gracias a `preserve_thinking`.
- Automatizacion de tareas profesionales de horizonte largo: su enfasis en ejecucion agentica lo hace adecuado para flujos que requieren decenas de pasos con verificacion intermedia.
- Despliegue en infraestructura propia con vLLM o SGLang: al publicarse pesos en formato Transformers, puede servirse en clusters con GPUs de alta gama, aunque el requisito de VRAM es extremo.
- Evaluacion comparativa de modelos de clase Max: util para investigadores que quieran reproducir o contrastar resultados frente a modelos propietarios.

## Benchmarks y rendimiento

Los datos de la model card comparan Qwen3.8-Max (la version oficial sobre la que se basa este modelo) con Opus 4.8, Fable 5, GPT 5.6 Sol (max) y Qwen3.7-Max. La tabla se corta en la informacion proporcionada, por lo que solo se recogen las filas completas disponibles.

| Benchmark | Opus 4.8 | Fable 5 | GPT 5.6 Sol (max) | Qwen3.7-Max | Qwen3.8-Max |
|---|---|---|---|---|---|
| Terminal Bench 2.1 | 84,6 | 84,6 | 88,8 | 74,5 | 86,6 |
| SWE-bench Pro | 69,2 | 80,0 | 64,6 | 60,6 | no disponible (dato truncado) |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks adicionales. Los datos corresponden a Qwen3.8-Max, no necesariamente a los pesos abiertos de este repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 2,4T de parametros totales, incluso en cuantizacion de 4 bits se requeririan del orden de 1,2 TB de VRAM solo para pesos, lo que exige multiples nodos.
- GPU recomendadas: no disponible. Por escala, se requiere un cluster multi-nodo con GPUs de centro de datos (H100, H200, B200 o equivalentes); no es viable en GPUs de consumo.
- GPU de consumo: no cabe en ninguna GPU consumer.
- Opciones de despliegue: vLLM, SGLang, TokenSpeed y Transformers. No se confirma soporte de llama.cpp u Ollama para esta escala.
- Latencia y throughput: no disponible.
- Tamano del repositorio: 4.892,4 GB, lo que implica requisitos de almacenamiento y ancho de banda considerables para la descarga y carga del modelo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen3.8-2.4T-A95B | 2,4T totales / 95B activos | 262.144 nativos, hasta 1.010.000 | qwen3.8-max (other) | Pesos abiertos en HF |
| Qwen3.7-Max | no disponible | no disponible | no disponible | Propietario / API |
| Opus 4.8 | no disponible | no disponible | no disponible | Propietario |
| Fable 5 | no disponible | no disponible | no disponible | Propietario |
| GPT 5.6 Sol (max) | no disponible | no disponible | no disponible | Propietario |

Los modelos comparables de la model card son propietarios y no publican parametros ni contexto en la informacion disponible. No se dispone de datos suficientes para una comparativa tecnica detallada mas alla de los benchmarks recogidos.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-18); su procedencia y validacion por parte de la comunidad no estan contrastadas.
- El autor del repositorio es Scrappy-Doo, no el equipo oficial de Qwen; la relacion exacta entre estos pesos y la version oficial Qwen3.8-Max no se detalla en la informacion disponible.
- La licencia es `qwen3.8-max` con `license: other`; deben revisarse los terminos del fichero LICENSE antes de cualquier uso comercial.
- No se especifican los idiomas soportados, lo que impide garantizar calidad multilingue.
- No se detallan sesgos conocidos ni tasas de alucinacion.
- El modelo es de escala extrema (4.892,4 GB de repo), lo que limita su uso a infraestructuras muy grandes.
- La tabla de benchmarks esta truncada en la informacion proporcionada; faltan resultados de SWE-bench Pro para Qwen3.8-Max y de otros benchmarks.
- Las capacidades de vision, modo no-thinking, contexto de 1M por defecto y herramientas integradas se atribuyen a Qwen3.8-Max, no necesariamente a estos pesos abiertos.
- No se confirma soporte de tool calling en los pesos abiertos.

## Enlaces

- Hugging Face: https://huggingface.co/Scrappy-Doo/Qwen3.8-2.4T-A95B
- Blog Qwen3.8-Max: https://qwen.ai/blog?id=qwen3.8
- Qwen Studio: https://chat.qwen.ai/?models=qwen3.8-max
- Qwen Cloud: https://www.qwencloud.com
- Overview Qwen3.8-Max: https://www.qwencloud.com/models/qwen3.8-max
