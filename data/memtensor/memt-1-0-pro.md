# MemTensor/MemT-1.0-Pro

## Resumen

MemT-1.0-Pro es un modelo de lenguaje de tipo "memory foundation model" desarrollado por MemTensor en colaboracion con NVIDIA. Se construye sobre el backbone NVIDIA-Nemotron-3-Ultra-550B-A55B (arquitectura MoE) y anade un bloque de memoria nativa que permite retener y reutilizar informacion historica sin necesidad de acceder al contexto original durante la inferencia. El modelo resuelve el problema del coste de almacenamiento y computo asociado a ventanas de contexto largas: su estado de memoria persistente mantiene un tamano constante, lo que reduce el almacenamiento aproximadamente 66 veces frente a una KV cache de contexto completo con 128K de historial.

La propuesta tecnica se articula en torno a un Native Memory Block que corre en paralelo a la atencion del backbone e incorpora un Local Memory Block (matriz de memoria dinamica multicanal) y un Hyper Memory Block (proyecciones entrenables de query, key y value, con puertas de borrado, escritura, olvido y salida). Ademas, introduce Mixture-of-Storage (MoS) para escalar la capacidad de memoria. El modelo se entrena en dos etapas con 34B tokens de datos dedicados.

Con 564.752.562.944 parametros totales (unos 554B segun la model card) y 59B parametros activos, MemT-1.0-Pro es el miembro superior de la familia MemT-1.0, que tambien incluye Nano (36B totales, 3B activos) y Flash (288B totales, 17B activos). Su relevancia actual radica en que traslada el paradigma de memoria persistente al terreno de los modelos frontera open source, con aplicaciones directas en agentes de codigo guiados por experiencia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (backbone Nemotron-H) con Native Memory Block (Local Memory Block + Hyper Memory Block) y Mixture-of-Storage |
| Parametros totales | 564.752.562.944 (aprox. 554B) |
| Parametros activos | 59B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 (openmdw.ai/license/1-1/) |
| Formato de pesos | safetensors (requiere `trust_remote_code` y `custom_code`) |
| Parametros de memoria entrenables | 4,23B |
| Estado de memoria dinamica | 13M |
| Modelo base | nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16 |
| Tamano del repositorio | 1129,5 GB |
| Libreria | transformers (Python >= 3.11) |

## Arquitectura y entrenamiento

El modelo parte del backbone NVIDIA-Nemotron-3-Ultra-550B-A55B, un transformer con mezcla de expertos (MoE) de 554B parametros totales y 59B activos. Sobre el se injerta un Native Memory Block que se ejecuta en paralelo a la atencion del backbone y consta de dos piezas. El Local Memory Block mantiene una matriz de memoria dinamica multicanal que evoluciona a lo largo de los pasos de interaccion. El Hyper Memory Block contiene proyecciones entrenables de query, key y value, junto con puertas de erase, write, forget y output. Durante la generacion, la atencion de memoria lee del estado actual, normaliza y aplica gating a la lectura, y suma el resultado a la salida de la atencion del backbone. Al final de cada turno o segmento, un mecanismo GDN-2 estable realiza actualizaciones de memoria a nivel de token para los pasos siguientes.

El entrenamiento sigue un pipeline de dos etapas con 34B tokens de datos dedicados e infraestructura especifica, e incluye preparacion del backbone. La model card menciona Mixture-of-Storage (MoS) como mecanismo para escalar la capacidad de memoria de forma modular. No se detalla en la informacion disponible la composicion exacta del dataset, el uso de RLHF/DPO ni si se emplearon tecnicas de decodificacion especulativa. El estado de memoria persistente tiene tamano constante, lo que reduce el almacenamiento aproximadamente 66 veces frente a una KV cache de contexto completo con 128K de historial, y evita tener que acceder al contexto original en inferencia.

## Capacidades

- Generacion de texto conversacional multi-turno con memoria latente persistente entre turnos (sesiones creadas via `model.create_session(tokenizer)` con `enable_memory=True`).
- Retencion de informacion historica sin reinyectar el contexto original, mediante atencion a memoria nativa.
- Razonamiento de multiples pasos y soporte para agentes, incluyendo un marco de agente de codificacion guiado por experiencia (experience-guided agentic coding).
- Reutilizacion de experiencia procedimental almacenada en memoria nativa durante tareas de codigo de horizonte largo, sin anadir texto de experiencia al contexto de la tarea.
- Capacidades generales heredadas del backbone Nemotron-3-Ultra (generacion, razonamiento, codigo y matematicas), aunque la model card no las detalla especificamente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Agentes de codificacion de horizonte largo: el modelo almacena experiencia procedimental en memoria nativa y la recupera mediante atencion de memoria durante la ejecucion, lo que mejora el rendimiento en tareas largas sin inflar el contexto con texto de experiencia. Es adecuado porque el estado de memoria tiene tamano constante y no crece con el historial.
- Asistentes conversacionales con memoria entre sesiones: gracias a `create_session` y `enable_memory=True`, el modelo conserva informacion de turnos pasados en memoria latente, lo que permite conversaciones coherentes a lo largo del tiempo sin reenviar todo el historial.
- Atencion al cliente automatizada con historial extenso: el modelo puede mantener contexto de interacciones previas en un estado de memoria de 13M, reduciendo el coste de almacenamiento frente a una KV cache de contexto completo (aprox. 66x menos a 128K de historial).
- Analisis de documentos y flujos de trabajo con historiales largos: la memoria persistente permite retener evidencia acumulada de documentos procesados secuencialmente sin reinyectar el texto original en cada paso.
- Pipelines de agentes con multiples pasos y estado compartido: el Native Memory Block actua como almacen de estado entre pasos, lo que resulta util en orquestaciones donde el contexto completo no cabe o es demasiado caro de mantener.
- Investigacion en arquitecturas de memoria: el modelo sirve como referencia reproducible (pesos abiertos, licencia OpenMDW-1.1, tech report en arXiv) para estudiar memorizacion latente, escalado de memoria (MoS) y comparativas frente a sistemas de memoria textual.

## Benchmarks y rendimiento

La model card indica que, en 11 benchmarks de memoria, MemT-1.0-Pro, MemT-1.0-Flash y MemT-1.0-Nano ocupan el primer, segundo y tercer puesto, respectivamente, entre los metodos de memoria parametrica evaluados. Asimismo, senala que los sistemas de memoria textual siguen por delante en el computo global, especialmente en historiales largos que requieren recuperacion detallada de evidencia. No se proporcionan cifras numericas por benchmark en la informacion disponible.

| Benchmark | MemT-1.0-Pro | Comparativa |
|---|---|---|
| 11 benchmarks de memoria (agregado) | 1.er puesto entre metodos de memoria parametrica | Flash 2.º, Nano 3.º; sistemas de memoria textual por delante en recuperacion de evidencia detallada |

No se han publicado resultados numericos detallados (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Los pesos se publican en BF16 y el repositorio ocupa 1129,5 GB, por lo que la inferencia en BF16 requiere un entorno multi-GPU de alta capacidad.
- GPU recomendadas: no especificadas en la model card. Por el tamano del modelo (554B totales, 59B activos) se requiere infraestructura de centro de datos; no se detalla una lista concreta de GPU validadas.
- Compatibilidad con GPU de consumo: no es viable en GPU de consumo por el volumen de pesos en BF16.
- Opciones de despliegue: transformers con `trust_remote_code=True`, `dtype=torch.bfloat16`, `device_map="auto"` y `attn_implementation="eager"`. Requiere Python 3.11 o superior, PyTorch con CUDA, y para el backbone Nemotron `mamba-ssm==2.3.2.post1` y `causal-conv1d==1.6.2.post1`. No se mencionan vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Memoria entrenable | Estado de memoria dinamica | Backbone | Licencia |
|---|---|---|---|---|---|---|
| MemT-1.0-Pro | 554B | 59B | 4,23B | 13M | NVIDIA-Nemotron-3-Ultra-550B-A55B | OpenMDW-1.1 |
| MemT-1.0-Flash | 288B | 17B | 3,61B | 336M | DeepSeek-V4-Flash | no disponible |
| MemT-1.0-Nano | 36B | 3B | 451M | 10M | Qwen3.6-35B-A3B | no disponible |

En los 11 benchmarks de memoria evaluados, Pro ocupa el primer puesto, Flash el segundo y Nano el tercero entre los metodos de memoria parametrica. Los sistemas de memoria textual obtienen mejores resultados globales, sobre todo en historiales largos con recuperacion detallada de evidencia. No se dispone de comparativas con otros modelos de memoria de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Los sistemas de memoria textual siguen superando a MemT-1.0-Pro en el computo global de benchmarks de memoria, especialmente cuando se requiere recuperacion detallada de evidencia en historiales largos.
- El estado de memoria dinamica es de solo 13M, muy inferior al de Flash (336M); puede limitar la retencion en escenarios con gran volumen de informacion historica.
- No se dispone de informacion sobre sesgos conocidos, riesgo de alucinacion ni evaluaciones de seguridad en la informacion proporcionada.
- Idiomas soportados no disponibles; no se puede garantizar un rendimiento multilingue equivalente al del backbone.
- La licencia OpenMDW-1.1 es una licencia "other"; deben revisarse sus terminos en openmdw.ai/license/1-1/ antes de un uso comercial.
- Requiere `trust_remote_code=True` y codigo personalizado (`custom_code`, `memt_nemotron_h`), lo que implica ejecutar codigo del autor y anade superficie de riesgo en produccion.
- Dependencias de version fija (`mamba-ssm==2.3.2.post1`, `causal-conv1d==1.6.2.post1`) que pueden complicar el despliegue y la reproducibilidad.
- El repositorio ocupa 1129,5 GB; el almacenamiento y la transferencia de pesos son costosos.
- No hay informacion publicada sobre cuantizaciones, latencia ni throughput, lo que dificulta planificar un despliegue en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/MemTensor/MemT-1.0-Pro
- Coleccion Hugging Face: https://huggingface.co/collections/MemTensor/memt-1
- Coleccion ModelScope: https://www.modelscope.cn/collections/MemTensor/MemT-10
- Tech report (arXiv): https://arxiv.org/pdf/2610.26825
- Repositorio GitHub: https://github.com/MemTensor/MemT-1.0
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3-Ultra-550B-A55B-BF16
