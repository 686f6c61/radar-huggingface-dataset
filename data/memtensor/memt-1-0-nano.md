# MemTensor/MemT-1.0-Nano

## Resumen

MemT-1.0-Nano es un modelo de lenguaje de la familia MemT-1.0 desarrollado por MemTensor, presentado como una "generación de modelos fundacionales con memoria" en la que el estado persistente forma parte del propio cómputo del modelo. Se construye mediante un ajuste sobre el backbone Qwen3.6-35B-A3B, un transformer con mezcla de expertos de 35.111.542.048 parámetros totales y aproximadamente 3B parámetros activos por token, al que se le añade un bloque de memoria nativa ejecutado en paralelo a la atención del backbone.

El problema que aborda es el coste de mantener contexto largo: en lugar de conservar la KV cache completa del histórico, MemT-1.0 mantiene un estado de memoria latente de tamaño constante (10M de parámetros de estado dinámico en esta variante, sobre 451M de parámetros de memoria entrenables). Según la model card, ese estado reduce el almacenamiento en unas 66 veces frente a una KV cache de contexto completo con 128K de histórico, y permite recuperar información de turnos anteriores sin volver a acceder al texto original.

Es relevante ahora porque propone una alternativa a las arquitecturas de memoria textual (RAG, recuperación sobre historial) y porque incluye una aplicación concreta de agentes de código guiados por experiencia: las trazas procedimentales se guardan en la memoria nativa y se recuperan por atención de memoria en lugar de inyectarse como texto en el contexto. La variante Nano es la pequeña de la familia, junto a MemT-1.0-Flash (288B totales, 17B activos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (backbone Qwen3.6-35B-A3B) con Native Memory Block: Local Memory Block + Hyper Memory Block y Mixture-of-Storage (MoS) |
| Parametros totales | 35.111.542.048 (~36B) |
| Parametros activos | ~3B |
| Parametros de memoria entrenables | 451M |
| Estado de memoria dinamico | 10M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors bf16) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con codigo propio (`custom_code`, requiere `trust_remote_code=True`) |
| Tamano del repositorio | 70,2 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B |

## Arquitectura y entrenamiento

MemT-1.0-Nano parte de un backbone MoE Qwen3.6-35B-A3B y le superpone un Native Memory Block que corre en paralelo a la atención del backbone, con dos componentes. El Local Memory Block mantiene una matriz de memoria multicanal dinámica que evoluciona a lo largo de los pasos de interacción. El Hyper Memory Block contiene proyecciones entrenables de query, key y value de memoria, puertas de borrado, escritura y olvido, además de una puerta de salida. Durante la generación, la atención de memoria lee del estado actual, normaliza y aplica compuertas a la lectura, y suma el resultado a la salida de la atención del backbone. Al final de cada turno o segmento, un mecanismo denominado GDN-2 realiza actualizaciones de memoria a nivel de token para el siguiente paso. La capacidad de memoria escala mediante Mixture-of-Storage (MoS).

El entrenamiento sigue un pipeline de dos etapas con preparación previa del backbone, y se apoyan en 34B tokens de datos junto con infraestructura dedicada, según la model card. No se detalla en la información disponible la composición del dataset, ni si hubo RLHF, DPO u otras etapas de alineación posteriores, ni el reparto exacto de tokens entre las dos etapas. Tampoco se especifica la innovación de decodificación ni los detalles del tokenizador más allá de su uso vía `AutoTokenizer`.

## Capacidades

- Generación de texto conversacional multi-turno con memoria latente: el estado de memoria persiste entre turnos sin conservar el texto plano del historial.
- Memoria persistente de tamaño constante: el estado puede guardarse y reanudarse (`session.save_state` sobre un fichero safetensors), lo que permite reanudar sesiones.
- Recuperación de información de turnos anteriores mediante atención de memoria en lugar de recuperación textual.
- Modo de razonamiento conmutable: la API de sesión expone `enable_thinking`, lo que permite activar o desactivar el modo de pensamiento por turno.
- Control explícito de memoria por turno mediante el flag `enable_memory`, que decide si el turno se escribe en la memoria local latente y se limpia el contexto en texto plano.
- Soporte de agentes de código de horizonte largo: framework de experiencia guiada donde las trazas procedimentales se almacenan en memoria nativa y se consultan por atención durante la ejecución.
- Almacenamiento escalable de memoria mediante Mixture-of-Storage (MoS).
- Capacidades generales heredadas del backbone Qwen3.6-35B-A3B: no se detallan en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales de largo recorrido: la sesión puede acumular información del usuario en memoria latente y responder a preguntas sobre datos dados muchos turnos antes, con un estado de 10M parámetros en lugar de reenviar el historial completo en cada llamada.
- Atención al cliente multi-sesión: guardar el estado por cliente con `save_state` y reanudarlo en la siguiente interacción, manteniendo preferencias e incidencias previas sin almacenar el transcript completo en el prompt.
- Agentes de código de horizonte largo: reutilizar experiencia procedimental (parches, comandos, secuencias de depuración) almacenada en memoria nativa y recuperada por atención de memoria, sin añadir ese texto al contexto de la tarea.
- Despliegue multi-tenant con many concurrentes: al ser el estado de memoria de tamaño constante y pequeño, el coste por sesión activa en almacenamiento es mucho menor que mantener KV cache de 128K por usuario, lo que facilita servir muchas conversaciones simultáneas.
- Asistentes personales con continuidad entre días: la memoria persistente permite recordar hechos estables del usuario (nombre, rutinas, preferencias) y reanudar la relación sin reconstruir el contexto desde cero en cada arranque.
- Agentes de operaciones y soporte técnico (SRE/DevOps): acumular el estado de una incidencia a lo largo de múltiples pasos de diagnóstico y mantener trazas de acciones previas consultables, reduciendo el prompt enviado en cada iteración del bucle del agente.
- Investigación sobre memoria en modelos: servir como punto de partida reproducible (licencia Apache 2.0 y pesos abiertos) para comparar memoria paramétrica frente a recuperación textual en las mismas tareas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks en la información disponible. La model card indica únicamente que, en 11 benchmarks de memoria, MemT-1.0-Flash y MemT-1.0-Nano ocupan la primera y la segunda posición, respectivamente, entre los métodos de memoria paramétrica evaluados, y que los sistemas de memoria textual siguen por delante en el cómputo global, especialmente en históricos largos que requieren recuperación detallada de evidencia. No se aportan cifras de MMLU, HumanEval, GSM8K ni de latencia o throughput.

| Benchmark | MemT-1.0-Nano | Referencia comparada |
|---|---|---|
| Benchmarks de memoria (11 tareas) | no disponible (2.ª posición entre métodos de memoria paramétrica, según la model card) | no disponible |
| MMLU | no disponible | no disponible |
| HumanEval | no disponible | no disponible |
| GSM8K | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 70 GB (el repositorio completo son 70,2 GB), por lo que se necesita al menos una GPU de 80 GB para cargar el modelo sin cuantizar, más margen para activaciones y estado de memoria.
- GPU recomendadas: H100 80 GB o A100 80 GB para una sola tarjeta; en su defecto, despliegue multi-GPU con `device_map="auto"` (por ejemplo, 2×48 GB o 2×80 GB), teniendo en cuenta que el modelo usa MoE y requiere reparto de expertos.
- Cabe en GPU de consumo: no con los pesos en bf16. No se han publicado cuantizaciones GGUF/AWQ/GPTQ oficiales en la información disponible, por lo que no se puede confirmar que quepa en una RTX 4090 (24 GB) en ninguno de los formatos publicados.
- Memoria por sesión: el estado dinámico es de 10M parámetros, del orden de decenas de MB en bf16, lo que permite mantener muchas sesiones concurrentes con un coste de almacenamiento reducido frente a KV cache de contexto largo (la model card cita ~66× menos almacenamiento que una KV cache completa a 128K de histórico).
- Opciones de despliegue: Hugging Face Transformers con `trust_remote_code=True` y `attn_implementation="sdpa"`, que es la vía documentada. Requiere Python 3.11 o superior, PyTorch 2.11.0 con CUDA 13, transformers 5.12.1, accelerate 1.15.0 y safetensors 0.8.0. Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible (el modelo usa código propio, `memt_qwen3_5_moe`).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Memoria entrenable | Estado dinamico | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| MemT-1.0-Nano | ~36B | ~3B | 451M | 10M | no disponible | apache-2.0 | Pesos abiertos en Hugging Face |
| MemT-1.0-Flash | 288B | 17B | 3,61B | 336M | no disponible | no disponible en la informacion | Pesos abiertos en Hugging Face (coleccion MemT-1) |
| Qwen3.6-35B-A3B (modelo base) | ~35B | ~3B | no aplica | no aplica | no disponible | no disponible en la informacion | Pesos abiertos en Hugging Face |
| MemT-1.0 frente a sistemas de memoria textual | no aplica | no aplica | no aplica | no aplica | no disponible | no aplica | La model card indica que los sistemas textuales van por delante en historicos largos |

## Limitaciones y advertencias

- La propia model card reconoce que los sistemas de memoria textual siguen siendo superiores en el cómputo global, especialmente en históricos largos que exigen recuperación detallada de evidencia; la memoria paramétrica es una compresión con pérdida del historial.
- El estado de memoria es de tamaño fijo (10M en esta variante): la información que no encaje o se olvide por las puertas de borrado no es recuperable, y no hay transcripción textual auditable del historial.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual ni tasas de alucinación en la información disponible.
- Sesgos conocidos: no disponibles; al derivar de Qwen3.6-35B-A3B, hereda los sesgos de su modelo base y de sus datos, no documentados aquí.
- Idiomas soportados: no disponibles. No se puede asumir un rendimiento multilingüe homogéneo.
- Longitud de contexto del backbone y del sistema de memoria: no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo requiere ejecutar código remoto (`trust_remote_code=True`) y depende de versiones muy concretas de transformers, accelerate y safetensors; conviene auditar el código propio (`memt_qwen3_5_moe`) antes de llevarlo a producción.
- Madurez: el repositorio tiene 50 descargas y 52 likes y se actualizó por última vez el 20 de octubre de 2026; las herramientas de serving estándar (vLLM, llama.cpp, TGI) no están confirmadas, lo que limita el despliegue a Transformers salvo desarrollo propio.
- No se documentan cuantizaciones oficiales, por lo que el coste de hardware en bf16 (≈70 GB) es elevado para entornos con GPU de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MemTensor/MemT-1.0-Nano
- Colección MemT-1.0: https://huggingface.co/collections/MemTensor/memt-1
- Informe técnico (PDF): https://arxiv.org/pdf/2610.26825
- Repositorio GitHub: https://github.com/MemTensor/MemT-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
