# MemTensor/MemT-1.0-Nano

## Resumen

MemT-1.0-Nano es un modelo de lenguaje de tipo mixtura de expertos (MoE) desarrollado por MemTensor, construido sobre el backbone Qwen3.6-35B-A3B mediante ajuste fino. Su propuesta diferencial no es tanto el rendimiento en tareas genericas como la incorporacion de una arquitectura de memoria nativa: bloques de memoria que se ejecutan en paralelo a la atencion del transformer y que permiten retener y reutilizar informacion historica sin necesidad de acceder al contexto original en el momento de la inferencia.

El modelo forma parte de la familia MemT-1.0, que incluye tambien las variantes Flash (sobre DeepSeek-V4-Flash) y Pro (sobre NVIDIA-Nemotron-3-Ultra-550B-A55B). Nano es la variante mas pequena y accesible de la familia, con 35.111.542.048 parametros totales (unos 36B) de los cuales solo 3B se activan por token, lo que lo situa en la categoria de modelos eficientes en computo. Incorpora 451M de parametros de memoria entrenables y un estado de memoria dinamica de 10M.

La relevancia actual del modelo radica en que aborda un problema abierto de los LLM: la gestion de historiales largos. Segun el autor, el estado de memoria persistente mantiene un tamano constante y reduce el almacenamiento aproximadamente 66x frente a una KV cache de contexto completo con 128K de historial. Esto lo hace interesante para agentes conversacionales de larga duracion y para tareas de codificacion agentica con reutilizacion de experiencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (backbone Qwen3.6-35B-A3B) con Native Memory Block (Local Memory Block + Hyper Memory Block) |
| Parametros totales | 35.111.542.048 (aprox. 36B) |
| Parametros activos | 3B |
| Parametros de memoria entrenables | 451M |
| Estado de memoria dinamica | 10M |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; el autor no documenta cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tamano del repositorio | 70,2 GB |
| Libreria | transformers (custom_code, requiere trust_remote_code) |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Fecha de creacion | 2026-10-15 |
| Ultima actualizacion | 2026-11-21 |

## Arquitectura y entrenamiento

MemT-1.0-Nano parte de un backbone transformer con mixtura de expertos (Qwen3.6-35B-A3B: 35B parametros totales, 3B activos). Sobre ese backbone se anade un Native Memory Block que se ejecuta en paralelo a la atencion del backbone y que consta de dos componentes. El Local Memory Block mantiene una matriz de memoria dinamica multicanal que evoluciona a lo largo de los pasos de interaccion. El Hyper Memory Block contiene proyecciones entrenables de query, key y value de memoria, compuertas de borrado, escritura y olvido, asi como una compuerta de salida.

Durante la generacion, la atencion de memoria lee del estado de memoria actual, normaliza y aplica compuertas a la lectura, y suma el resultado a la salida de la atencion del backbone. Al final de cada turno o segmento, un mecanismo denominado GDN-2 realiza actualizaciones de memoria a nivel de token para el estado de memoria de los pasos siguientes. El autor menciona ademas un esquema de Mixture-of-Storage (MoS) para escalar la capacidad de memoria.

En cuanto al entrenamiento, la model card indica una preparacion del backbone y un pipeline de entrenamiento en dos etapas, apoyado en 34B tokens de datos e infraestructura dedicada. No se detalla la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. Tampoco se especifican innovaciones como decodificacion especulativa o atencion lineal mas alla del propio mecanismo de memoria.

## Capacidades

- Generacion de texto conversacional con soporte de sesiones con memoria persistente (`create_session` en la API de transformers).
- Memoria latente: con `enable_memory=True` el modelo guarda informacion de turnos pasados y actuales en memoria local latente y puede vaciar el contexto en texto plano, respondiendo despues a partir de esa memoria.
- Razonamiento con modo de pensamiento controlable (`enable_thinking`), heredado del backbone Qwen3.6.
- Capacidades de codificacion agentica: el autor presenta un marco de agentes que reutiliza experiencia procedimental almacenada en memoria nativa para tareas de codificacion de horizonte largo, sin anadir el texto de la experiencia al contexto de la tarea.
- Soporte de tool calling / function calling: no documentado explicitamente en la informacion disponible.
- Capacidades multilingues: no documentadas en la informacion disponible.
- Capacidades de vision o audio: no documentadas en la informacion disponible.

## Casos de uso

- Asistentes conversacionales de larga duracion: el modelo puede mantener informacion de turnos anteriores en memoria latente y responder sin conservar el historial completo en el contexto, lo que reduce el coste de almacenamiento y el consumo de ventana de contexto en conversaciones prolongadas.
- Agentes de codificacion con reutilizacion de experiencia: tal como describe el autor, se puede almacenar experiencia procedimental de tareas previas en la memoria nativa y recuperarla mediante atencion de memoria durante la ejecucion de nuevas tareas de codificacion, mejorando el rendimiento sin inflar el contexto.
- Sistemas de atencion al cliente con memoria de cliente: la memoria persistente de tamano constante permite recordar preferencias e historial de un usuario entre sesiones sin reenviar todo el historial en cada peticion.
- Copilotos de desarrollo en pipelines de CI/CD: con 3B parametros activos, el coste de inferencia por token es bajo, lo que facilita su integracion en flujos automatizados de revision de codigo o generacion de parches.
- Procesamiento de documentos e historiales extensos: la reduccion de aproximadamente 66x en almacenamiento frente a una KV cache de 128K hace viable mantener estados de memoria para historiales largos en entornos con memoria limitada.
- Despliegue en entornos con restricciones de VRAM: al activar solo 3B parametros por token, el modelo puede servir cargas de trabajo conversacionales en hardware mas modesto que un modelo denso de 35B.
- Investigacion en arquitecturas de memoria: el modelo sirve como base para experimentar con memoria nativa, compuertas de olvido y actualizaciones de memoria a nivel de token (GDN-2).

## Benchmarks y rendimiento

La model card indica que, en 11 benchmarks de memoria, MemT-1.0-Flash y MemT-1.0-Nano ocupan la segunda y tercera posicion entre los metodos de memoria parametrica evaluados, por detras de MemT-1.0-Pro. Senala ademas que los sistemas de memoria textual fuertes siguen por delante en terminos globales, especialmente en historiales largos que requieren recuperacion detallada de evidencia. No se proporcionan cifras numericas concretas de benchmarks en la informacion disponible.

| Benchmark | MemT-1.0-Nano | Notas |
|---|---|---|
| 11 benchmarks de memoria (sin detalle) | 3.ª posicion entre metodos de memoria parametrica evaluados | Por detras de MemT-1.0-Pro y MemT-1.0-Flash; sin cifras publicadas en la informacion disponible |
| MMLU, HumanEval, GSM8K y similares | no disponible | No se han publicado resultados en la informacion disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: el repositorio pesa 70,2 GB en safetensors, por lo que la carga completa en bf16 requiere aproximadamente 70 GB de VRAM, mas overhead de activaciones y estado de memoria.
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o configuraciones multi-GPU. No cabe en GPUs de consumo de 24 GB en bf16.
- Cuantizacion: el autor no documenta cuantizaciones oficiales (GGUF, AWQ, GPTQ), por lo que el despliegue en GPUs de consumo (RTX 4090, 3090, etc.) requeriria conversiones no oficiales.
- Opciones de despliegue: la model card solo documenta transformers (version 5.12.1), accelerate 1.15.0, safetensors 0.8.0, PyTorch 2.11.0 con CUDA 13 y `attn_implementation="sdpa"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Memoria entrenable | Estado de memoria | Licencia |
|---|---|---|---|---|---|
| MemT-1.0-Nano | 36B | 3B | 451M | 10M | Apache 2.0 |
| MemT-1.0-Flash | 288B | 17B | 3,61B | 336M | no disponible |
| MemT-1.0-Pro | 554B | 59B | 4,23B | 13M | no disponible |
| Qwen3.6-35B-A3B (base) | 35B | 3B | no aplica | no aplica | no disponible |

La comparativa directa con modelos de la misma categoria fuera de la familia MemT-1.0 no esta disponible en la informacion proporcionada. Dentro de la familia, Nano es la variante mas ligera y la unica con licencia Apache 2.0 confirmada en la informacion disponible.

## Limitaciones y advertencias

- En los 11 benchmarks de memoria evaluados, el modelo queda por detras de los sistemas de memoria textual fuertes en historiales largos que exigen recuperacion detallada de evidencia; la memoria latente no sustituye necesariamente a la recuperacion explicita en todos los casos.
- La model card no documenta sesgos conocidos, tasas de alucinacion ni evaluaciones de seguridad.
- No se especifican los idiomas soportados; el comportamiento multilingue es incierto.
- La longitud de contexto no esta documentada, lo que dificulta dimensionar despliegues.
- Requiere `trust_remote_code=True` y codigo personalizado (`memt_qwen3_5_moe`), lo que implica revisar el codigo remoto antes de usarlo en produccion.
- La API de sesiones con memoria (`create_session`, `enable_memory`) es especifica del modelo y no forma parte de la interfaz estandar de transformers; la integracion con servidores de inferencia convencionales puede requerir trabajo adicional.
- El estado de memoria dinamica es de solo 10M, el mas pequeno de la familia, lo que puede limitar la capacidad de retencion en comparacion con Flash y Pro.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base Qwen3.6-35B-A3B antes de un uso comercial.
- No hay cuantizaciones oficiales publicadas, lo que restringe el despliegue en hardware de consumo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/MemTensor/MemT-1.0-Nano
- Coleccion MemT-1.0 en Hugging Face: https://huggingface.co/collections/MemTensor/memt-1
- Coleccion en ModelScope: https://www.modelscope.cn/collections/MemTensor/MemT-10
- Informe tecnico (PDF): https://arxiv.org/pdf/2610.26825
- Repositorio GitHub: https://github.com/MemTensor/MemT-1.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
