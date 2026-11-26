# blearyhope/Surogate3.7-35B-A3B

## Resumen

Surogate 3.7 35B-A3B es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por blearyhope (Invergent AI) y publicado bajo licencia Apache 2.0. Se construye sobre la arquitectura Qwen3.5-35B-A3B-Base y aplica un post-entrenamiento orientado a agentes: flujos de trabajo conectados a herramientas, interacciones estructuradas y tareas complejas que se desarrollan en múltiples pasos. El modelo declara un contexto de 1M de tokens mediante escalado RoPE y una cabeza MTP (multi-token prediction) para decodificación especulativa.

El modelo activa aproximadamente 3B de parámetros por token sobre un total de unos 35.951.822.704 parámetros, lo que lo hace apto para despliegue en hardware de consumo y en una única unidad NVIDIA DGX Spark, según el autor. El pipeline declarado es image-text-to-text, por lo que el modelo admite entradas multimodales de imagen y texto, además de las capacidades de agente, tool-use y razonamiento que indica en sus etiquetas.

Es relevante ahora porque el autor lo posiciona como modelo de soporte para el despliegue local de su plataforma de IA (surogate.ai), orientado a asistentes empresariales y agentes que combinan inferencia con herramientas externas, con un objetivo declarado de hasta 8 usuarios agenticos concurrentes en un DGX Spark. El modelo fue entrenado en precisión FP4 en equipos con GPUs NVIDIA RTX 5090 usando su propio motor de inferencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe), con cabeza MTP y escalado RoPE para contexto extendido |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3B por token (según el autor) |
| Longitud de contexto | 1M tokens (según el autor, con escalado RoPE); configuración vLLM de ejemplo con max-model-len 131072 |
| Tipos de cuantizacion | No disponible (el autor menciona entrenamiento en FP4; no se detallan cuantizaciones publicadas) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Qwen3.5-35B-A3B-Base, una mezcla de expertos con unos 35B de parámetros totales y aproximadamente 3B activos por token. Sobre esa base se aplica un post-entrenamiento "agentic-first" que, según el autor, combina fine-tuning y RL centrados en el comportamiento necesario en flujos de trabajo conectados a herramientas y de múltiples etapas. El modelo incorpora una cabeza MTP que permite decodificación especulativa (en la configuración de vLLM se usa `--speculative-config '{"method": "mtp", "num_speculative_tokens": 2}'`). El contexto de 1M se obtiene mediante escalado RoPE.

El autor indica que el entrenamiento se realizó en precisión FP4 en máquinas con GPUs NVIDIA RTX 5090 usando su propio Surogate Engine. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni los detalles del proceso de RLHF/DPO más allá de la mención genérica a fine-tuning y RL. Tampoco se detalla la arquitectura de la torre visual pese a que el pipeline es image-text-to-text.

## Capacidades

- Generación de texto y razonamiento, con modo de pensamiento (thinking) activado por defecto según el autor.
- Capacidades de agente: descomposición de tareas, interacción con herramientas y ejecución estructurada en múltiples pasos.
- Soporte de tool calling / function calling, con parsers específicos en vLLM (`qwen3_coder`) y auto tool choice.
- Entrada multimodal de imagen y texto (pipeline image-text-to-text).
- Razonamiento de múltiples pasos con preservación del razonamiento previo en bucles de agente (`preserve_thinking`).
- Decodificación especulativa mediante cabeza MTP para acelerar la inferencia.
- Capacidades multilingües: no disponible (no se detallan idiomas soportados).

## Casos de uso

- Asistentes empresariales con herramientas: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 1M tokens según el autor) y encadenar llamadas a herramientas internas, adecuado para atención al empleado o soporte interno.
- Automatización de flujos de trabajo: descomposición de tareas y ejecución estructurada en pipelines donde el modelo orquesta APIs y sistemas externos, gracias a su post-entrenamiento orientado a agentes.
- Agentes de operaciones de terminal y sistemas: con resultados declarados en Terminal-Bench 2.1, puede emplearse en tareas de administración de sistemas guiadas por lenguaje natural, siempre con validación humana.
- Ingeniería de software asistida: con soporte de tool calling y resultados declarados en SWE-bench Verified, puede integrarse en pipelines de CI/CD para triaje de incidencias, generación de parches y revisión asistida.
- Procesamiento de documentos con imagen y texto: al aceptar entradas image-text-to-text, puede extraer y razonar sobre información de capturas, formularios o documentos escaneados en flujos de back office.
- Despliegue local en empresa: el autor lo presenta como apto para una única DGX Spark con hasta 8 usuarios agenticos concurrentes, lo que permite agentes totalmente locales sin salida de datos a la nube.
- Comercio y agentes de atención transaccional: con resultados declarados en CommerceAgentBench, puede usarse en asistentes de compra o soporte transaccional con integración de herramientas.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Benchmark | Surogate3.7-35B-A3B | DeepSeek V4 Flash (0731) | GLM-5.2 | Ornith-1.5-35B-A3B | LFM2.5-24B-A2B | MiniCPM-V-4.7-35B-A3B | Sage-A1.5-35B-A3B |
|---|---|---|---|---|---|---|---|
| AutomationBench | 34.3 | 25.1 | 28.0 | 18.5 | 27.69 | 2.7 | 8.7 |
| Terminal-Bench 2.1 | 76.4 | 82.7 | 82.7 | 58.4 | 13.5 | 31.5 | 60.6 |
| BFCL v4 | 68.7 | 67.3 | 70.3 | 68.5 | 65.01 | 60.06 | 55.5 |
| IFEval | 94.1 | 92.5 | 93.9 | 81.8 | 96.75 | 89.6 | 92.9 |
| SWE-bench Verified | 78.0 | 79.7 | 78.7 | 79.0 | 51.00 | 54.6 | 76.2 |
| OfficeQA Pro | 51.9 | 46.6 | 66.20 | 45.9 | 3.0 | 18.0 | 45.1 |
| τ²-Bench | 93.4 | 95.2 | 99.4 | 81.5 | 72.1 | 84.65 | 81.8 |
| Claw-Eval (average) | 82.4 | 79.7 | 81.60 | 64.40 | 60.8 | 75.1 | 77.3 |
| GPQA Diamond | 91.4 | 88.1 | 91.2 | 89.2 | 74.42 | 77.8 | 87.4 |
| EnterpriseOps-Gym | 38.1 | 43.3 | 42.7 | 28.8 | 12.1 | 28.6 | 29.2 |
| WildClawBench | 54.6 | 33.2 | 52.14 | 45.91 | 9.4 | 35.3 | 50.0 |
| CommerceAgentBench | 39.4 | 38.4 | 39.30 | 37.40 | 1.9 | 14.0 | 25.2 |

Nota del autor: en Terminal-Bench 2.1, las tareas que fallaron en el primer intento se ejecutaron una vez más con un límite de 3 horas por agente; una tarea cuenta como superada si cualquiera de los dos intentos pasa (solo el primer intento: 61.8). Estos resultados proceden de la model card del autor y no han sido verificados de forma independiente en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; con 35.951.822.704 parámetros, en bfloat16 los pesos ocupan en torno a 72 GB, y el repositorio pesa 71.9 GB. Con cuantización de 4 bits los pesos se reducirían aproximadamente a 18-20 GB, aunque el autor no publica cuantizaciones.
- GPU recomendadas: el autor indica que está optimizado para GPUs de consumo y para una única NVIDIA DGX Spark. Menciona entrenamiento en equipos con NVIDIA RTX 5090.
- Cabe en GPU de consumo: según el autor, sí, gracias a la arquitectura MoE con aproximadamente 3B parámetros activos; no se detallan modelos concretos ni requisitos de VRAM por configuración.
- Despliegue: vLLM (configuración de ejemplo con `--dtype bfloat16 --kv-cache-dtype fp8 --max-model-len 131072`, parsers `qwen3` y `qwen3_coder`, y decodificación especulativa MTP), transformers y Surogate Engine. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor afirma que una única DGX Spark puede atender hasta 8 usuarios agenticos concurrentes con 1M de contexto usando Surogate Engine, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Surogate3.7-35B-A3B | ~35B totales, ~3B activos (MoE) | 1M (según autor) | Apache 2.0 | Post-entrenamiento agentic-first, multimodal, MTP |
| Ornith-1.5-35B-A3B | ~35B (MoE, según nombre) | No disponible | No disponible | Comparable en tamaño; resultados inferiores en la mayoría de benchmarks del autor |
| MiniCPM-V-4.7-35B-A3B | ~35B (MoE, según nombre) | No disponible | No disponible | Multimodal; resultados inferiores en los benchmarks declarados |
| Sage-A1.5-35B-A3B | ~35B (MoE, según nombre) | No disponible | No disponible | Comparable en tamaño; resultados mixtos frente a Surogate |
| DeepSeek V4 Flash (0731) | No disponible | No disponible | No disponible | Modelo frontera de referencia; supera a Surogate en varios benchmarks |
| GLM-5.2 | No disponible | No disponible | No disponible | Modelo frontera de referencia; supera a Surogate en varios benchmarks |

Los datos de comparación proceden exclusivamente de la tabla publicada por el autor; no se dispone de información independiente sobre parámetros, contexto ni licencias de los modelos comparados.

## Limitaciones y advertencias

- El autor advierte explícitamente que el enfoque de post-entrenamiento no garantiza corrección ni fiabilidad autónoma; debe validarse contra las herramientas, datos y límites de seguridad propios antes de desplegar en producción.
- Riesgo de alucinación: no cuantificado en la información disponible; es una limitación inherente a los modelos de lenguaje y relevante en flujos de agente.
- Sesgos conocidos: no disponibles.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento fuera del inglés.
- El contexto de 1M depende del escalado RoPE y de la configuración de servicio; la configuración de ejemplo de vLLM limita `max-model-len` a 131072, por lo que el contexto efectivo puede ser menor en despliegues reales.
- Los benchmarks son declarados por el autor y no han sido verificados de forma independiente; además, la nota metodológica de Terminal-Bench 2.1 (segundo intento permitido) infla la comparación frente a ejecuciones de un solo intento.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, lo que indica ausencia de validación por parte de la comunidad.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-35B-A3B-Base y de los componentes derivados.
- No se publican cuantizaciones ni datos de latencia/throughput, lo que dificulta planificar despliegues en hardware de consumo.

## Enlaces

- Hugging Face: https://huggingface.co/blearyhope/Surogate3.7-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Sitio del autor: https://surogate.ai
- Repositorio del motor: https://github.com/invergent-ai/surogate
- Logo (assets): https://raw.githubusercontent.com/invergent-ai/surogate/refs/heads/main/assets/logo-white.svg
