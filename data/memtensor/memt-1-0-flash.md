# MemTensor/MemT-1.0-Flash

## Resumen

MemT-1.0-Flash es un modelo de lenguaje de tipo memoria fundacional desarrollado por MemTensor, construido sobre el backbone DeepSeek-V4-Flash. Su propuesta central es integrar una memoria persistente y dinamicamente evolutiva como parte intrínseca del cómputo del modelo, de modo que pueda retener y aprovechar información histórica sin necesidad de acceder al contexto original durante la inferencia. Con 287.943.175.511 parámetros totales (288B) y 17B parámetros activados, se posiciona como el modelo de tamaño medio de la familia MemT-1.0, que también incluye las variantes Nano (36B) y Pro (554B).

La arquitectura incorpora un Native Memory Block que convive con la atención del backbone y que se compone de un Local Memory Block (matriz de memoria multicanal dinámica) y un Hyper Memory Block (proyecciones entrenables de query, key y value, junto con puertas de borrado, escritura, olvido y salida). El estado de memoria persistente mantiene un tamaño constante, lo que reduce el almacenamiento aproximadamente 66 veces frente a una KV cache de contexto completo con 128K de historial.

El modelo resulta relevante porque aborda uno de los cuellos de botella prácticos de los LLM actuales: la gestión de historiales largos sin crecimiento del coste de memoria. Se distribuye con licencia MIT, en formato safetensors y con código personalizado (`memt_deepseek_v4`), lo que facilita su integración en flujos de Transformers. En el momento de la ficha acumula 54.334 descargas y 118 likes en Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con Native Memory Block (Local Memory Block + Hyper Memory Block) sobre backbone DeepSeek-V4-Flash; Mixture-of-Storage (MoS) |
| Parametros totales | 287.943.175.511 (288B) |
| Parametros activos | 17B |
| Longitud de contexto | no disponible (se menciona un escenario de referencia de 128K de historial) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Parametros de memoria entrenables | 3,61B |
| Estado de memoria dinamica | 336M |
| Modelo base | deepseek-ai/DeepSeek-V4-Flash |
| Tamano del repositorio | 576,0 GB |
| Libreria | transformers (custom_code: memt_deepseek_v4) |

## Arquitectura y entrenamiento

MemT-1.0-Flash se apoya en el backbone DeepSeek-V4-Flash y le añade un Native Memory Block que se ejecuta en paralelo a la atención del backbone. Este bloque consta de dos piezas: un Local Memory Block, que mantiene una matriz de memoria multicanal dinámica y evoluciona a lo largo de los pasos de interacción, y un Hyper Memory Block, que contiene proyecciones entrenables de query, key y value para la memoria, además de puertas de erase, write, forget y una puerta de salida. Durante la generación, la atención de memoria lee del estado actual, normaliza y aplica gating a la lectura, y suma el resultado a la salida de la atención del backbone. Al final de cada turno o segmento, un mecanismo GDN-2 estable realiza actualizaciones de memoria a nivel de token para los pasos siguientes.

El entrenamiento se estructura en dos etapas, con preparación del backbone y una infraestructura dedicada, apoyadas en 34B tokens de datos. La familia incorpora Mixture-of-Storage (MoS) para escalar la capacidad de memoria de forma modular. La innovación diferencial es que el estado persistente mantiene un tamaño constante, lo que evita el crecimiento de la KV cache y reduce el almacenamiento aproximadamente 66 veces frente a una KV cache de contexto completo con 128K de historial. No se detalla en la información disponible la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO.

## Capacidades

- Generación de texto y conversación multi-turno con memoria latente persistente entre turnos.
- Memoria dinámica nativa: almacena información de turnos pasados en memoria local latente y permite responder a partir de ella sin conservar el contexto en texto plano (opción `enable_memory`).
- Memoria de experiencia para agentes: reutilización de experiencia procedimental en tareas de codificación de horizonte largo, almacenada en memoria nativa y recuperada mediante atención de memoria.
- Modo de razonamiento controlable mediante el flag `enable_thinking`.
- Soporte de sesiones de conversación mediante `create_session` en la API de Transformers.
- Escalabilidad de capacidad de memoria mediante Mixture-of-Storage (MoS).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Cobertura multilingüe: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales de larga duración: el modelo puede mantener información de turnos anteriores en memoria latente y responder sin arrastrar todo el historial en texto plano, lo que reduce el coste de almacenamiento y el consumo de contexto en conversaciones prolongadas.
- Agentes de codificación con experiencia acumulada: el framework de agentic coding de MemT-1.0 permite almacenar experiencia procedimental recuperada en memoria nativa y consultarla durante la ejecución, mejorando tareas de horizonte largo sin añadir el texto de la experiencia al contexto de la tarea.
- Atención al cliente automatizada: la memoria persistente de tamaño constante facilita gestionar sesiones multi-turno con clientes recurrentes, recordando preferencias e incidencias previas sin reenviar el historial completo en cada petición.
- Sistemas de recomendación conversacionales: el modelo puede recordar interacciones pasadas del usuario en memoria latente y personalizar respuestas a lo largo de sesiones sucesivas.
- Asistentes personales con memoria de usuario: almacenamiento de hechos estables (nombres, preferencias, rutinas) en memoria dinámica para evitar repetir información en cada conversación.
- Pipelines de agentes multi-paso: la memoria de experiencia y el estado persistente permiten encadenar pasos de razonamiento y ejecución recuperando trazas anteriores sin inflar el contexto.
- Investigación en arquitecturas de memoria: el modelo sirve como base para estudiar escalado de memoria (MoS), actualizaciones GDN-2 y evaluación en benchmarks de memoria paramétrica.

## Benchmarks y rendimiento

Según la model card, en 11 benchmarks de memoria, MemT-1.0-Flash y MemT-1.0-Nano se sitúan en segunda y tercera posición entre los métodos de memoria paramétrica evaluados, por detrás de MemT-1.0-Pro. Los sistemas de memoria textual fuertes siguen por delante en el cómputo global, especialmente en historiales largos que requieren recuperación detallada de evidencia. No se proporcionan cifras numéricas por benchmark en la información disponible.

| Benchmark | MemT-1.0-Flash | Comparativa |
|---|---|---|
| 11 benchmarks de memoria (ranking) | 2.ª posición entre métodos de memoria paramétrica evaluados | Por detrás de MemT-1.0-Pro; Nano en 3.ª posición; sistemas de memoria textual por delante en recuperación detallada |
| MMLU, HumanEval, GSM8K u otros | no disponible | no disponible |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 288B parámetros totales en bfloat16, el peso completo ronda los 576 GB, lo que exige múltiples aceleradores; el repositorio ocupa 576,0 GB.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, el despliegue en bfloat16 requiere clústeres multi-GPU de clase datacenter (A100/H100 o superiores); no se confirma compatibilidad con GPUs de consumo.
- Cabe en consumer GPU: no disponible; con 288B parámetros totales no es viable en una sola GPU de consumo en precisión completa.
- Opciones de despliegue: Hugging Face Transformers 5.12.1 con `trust_remote_code=True`, `accelerate` 1.15.0 y `safetensors` 0.8.0, sobre PyTorch 2.11.0 con CUDA 13 y `attn_implementation="eager"`. Soporte de vLLM, llama.cpp, Ollama o TGI: no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Backbone | Parametros totales | Parametros activos | Memoria entrenable | Estado de memoria dinamica | Licencia |
|---|---|---|---|---|---|---|
| MemT-1.0-Nano | Qwen3.6-35B-A3B | 36B | 3B | 451M | 10M | no disponible |
| MemT-1.0-Flash | DeepSeek-V4-Flash | 288B | 17B | 3,61B | 336M | MIT |
| MemT-1.0-Pro | NVIDIA-Nemotron-3-Ultra-550B-A55B | 554B | 59B | 4,23B | 13M | no disponible |

En benchmarks de memoria, Flash ocupa la segunda posición entre los métodos de memoria paramétrica evaluados, por delante de Nano y por detrás de Pro. La comparación con modelos de propósito general de tamaño similar (por ejemplo, el propio DeepSeek-V4-Flash sin capa de memoria) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- En los 11 benchmarks de memoria evaluados, los sistemas de memoria textual fuertes siguen por delante en el cómputo global, especialmente en historiales largos que requieren recuperación detallada de evidencia; la memoria paramétrica no sustituye a la recuperación textual en todos los escenarios.
- Requiere `trust_remote_code=True` y código personalizado (`memt_deepseek_v4`), lo que implica ejecutar código del autor y revisarlo antes de usarlo en producción.
- Dependencias muy específicas: Python 3.11 o superior, PyTorch 2.11.0 con CUDA 13, Transformers 5.12.1, accelerate 1.15.0 y safetensors 0.8.0; la incompatibilidad de versiones puede impedir la carga.
- El uso de `attn_implementation="eager"` en los ejemplos sugiere que no se garantiza el soporte de implementaciones de atención optimizadas (FlashAttention u otras), con impacto potencial en latencia y memoria.
- El tamaño de 288B parámetros totales y 576 GB de repositorio limita el despliegue a infraestructura multi-GPU de datacenter; no se confirma viabilidad en GPUs de consumo.
- Idiomas soportados no disponibles: no se puede garantizar el rendimiento en castellano ni en otros idiomas distintos de los usados en el entrenamiento.
- Sesgos conocidos y riesgo de alucinación: no documentados en la información disponible; como modelo generativo, persiste el riesgo inherente de alucinación, agravado si la memoria latente almacena información incorrecta de turnos previos.
- Restricciones de licencia: licencia MIT, que permite uso comercial, modificación y redistribución con aviso de copyright; conviene verificar las condiciones del modelo base DeepSeek-V4-Flash.
- No hay datos publicados sobre cuantizaciones disponibles, latencia, throughput ni soporte en motores de inferencia de alto rendimiento, lo que dificulta la planificación de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MemTensor/MemT-1.0-Flash
- Colección MemT-1.0 en Hugging Face: https://huggingface.co/collections/MemTensor/memt-1
- Colección MemT-1.0 en ModelScope: https://www.modelscope.cn/collections/MemTensor/MemT-10
- Informe técnico (PDF): https://arxiv.org/pdf/2610.26825
- Repositorio GitHub: https://github.com/MemTensor/MemT-1.0
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-V4-Flash
