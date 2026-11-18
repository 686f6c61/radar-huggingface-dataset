# AtomicChat/Nanbeige4.3-33B-GGUF

## Resumen

Nanbeige4.3-33B es un modelo denso de 33.118.977.024 parametros desarrollado por Nanbeige, disenado especificamente para tareas de agente y razonamiento. Emplea la arquitectura Llama con una ventana de contexto de 512K tokens y activa el modo de razonamiento (thinking) por defecto. Se distribuye bajo licencia Apache-2.0 y soporta ingles y chino. El repositorio aqui descrito es la version cuantizada en GGUF publicada por AtomicChat el mismo dia del lanzamiento (25 de octubre), pensada para ejecucion local con llama.cpp.

La relevancia de esta publicacion radica en el trabajo de cuantizacion: AtomicChat genera sus propios ficheros "Atomic Dynamic" (AD) construidos con una importance matrix propia, calibrada sobre 8.000 fragmentos de 512 tokens, y los compara contra los presets estandar de llama.cpp. El modelo base destaca por una sensibilidad inusual a la cuantizacion: el `Q6_K` estandar de llama.cpp solo reproduce el siguiente token del original el 95,5% de las veces, cuando la mayoria de modelos alcanzan el 98% a 6 bits.

El resultado es un conjunto de 11 ficheros que cubren desde 13,7 GB hasta 35,2 GB en disco, con divergencia KL y top-1 medidos sobre el mismo banco de pruebas (texto multilingue neutro, 24 fragmentos de 4.096 tokens, llama.cpp `36e36e6`). Esto permite elegir el compromiso tamano/calidad con datos objetivos en lugar de estimaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer denso) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 512K tokens |
| Tipos de cuantizacion | Q8_0, Q6_K, Q6_K-Q5_K, Q5_K_M, Q5_K_M-Q4_K_M, Q4_K_M, IQ4_XS, IQ3_S, IQ3_XXS, IQ2_S (variantes AD con imatrix propia y presets estandar) |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (pesos originales en BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 33B parametros con arquitectura Llama, sin mezcla de expertos. Nanbeige lo posiciona como modelo de agente y razonamiento, con el modo thinking activado por defecto. La ventana de contexto de 512K tokens lo situa en el rango de modelos de contexto largo orientados a tareas multi-turno y agenticas. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovacion tecnica de esta publicacion es el proceso de cuantizacion. AtomicChat construye una importance matrix propia sobre los pesos BF16 con `--parse-special`, usando 8.000 fragmentos de 512 tokens de un corpus de calibracion renderizado originalmente para Qwen3.8-27B (cuyo formato de chat ChatML comparte Nanbeige4.3). Con esa matriz genera los ficheros AD, que se comparan contra los presets de llama.cpp sin imatrix. Los resultados muestran que el modelo es especialmente sensible a la cuantizacion: a tamano equivalente, `AD-IQ4_XS` (20,3 GB) tiene un tercio menos de divergencia KL que el `Q4_K_M` estandar (20,1 GB), y `AD-Q6_K-Q5_K` (27,9 GB) un 39% menos que el `Q6_K` estandar (27,2 GB). Los ficheros `Q6_K` y `Q4_K_M` estandar se retiraron tras comprobar que los AD los superan en tamano comparable.

## Capacidades

- Generacion de texto conversacional multi-turno con contexto de hasta 512K tokens.
- Razonamiento explicito mediante modo thinking activado por defecto.
- Capacidades de agente: el modelo esta etiquetado como agent y soporta flujos de razonamiento multi-paso.
- Soporte de tool calling / function calling, segun las etiquetas del modelo (agent, reasoning).
- Capacidades multilingues limitadas a ingles y chino.
- Integracion con llama.cpp y con la aplicacion Atomic Chat, que expone el modo thinking por defecto.
- Compatibilidad con endpoints estandar de inferencia de texto.

## Casos de uso

- Agentes autonomos de larga duracion: la ventana de 512K tokens permite mantener el estado de una tarea con muchos pasos intermedios, llamadas a herramientas y resultados acumulados sin truncar el historial. Adecuado para pipelines de automatizacion donde el contexto crece de forma sostenida.
- Atencion al cliente automatizada en ingles y chino: el modelo puede gestionar conversaciones multi-turno extensas y consultar herramientas internas (estado de pedidos, bases de conocimiento) mediante function calling, manteniendo coherencia a lo largo de sesiones largas.
- Razonamiento sobre documentos extensos: analisis de contratos, informes tecnicos o expedientes que superan ampliamente el contexto de modelos de 32K-128K, con capacidad de extraer conclusiones y citar secciones concretas.
- Despliegue local en estaciones de trabajo: los ficheros AD de 13,7-24,7 GB permiten ejecutar el modelo en GPUs de consumo con 24 GB de VRAM (por ejemplo, RTX 4090) usando `AD-IQ4_XS` o `AD-Q4_K_M`, con una perdida de calidad medida y acotada.
- Asistentes de codigo y automatizacion de tareas de desarrollo: el soporte de tool calling y razonamiento multi-paso permite integrarlo en flujos que consultan repositorios, ejecutan tests o generan parches, siempre que el idioma de trabajo sea ingles o chino.
- Investigacion sobre cuantizacion: el repositorio incluye la importance matrix y los logs de metricas, lo que lo convierte en un caso de estudio reproducible para evaluar el impacto de distintas estrategias de cuantizacion sobre un modelo de 33B.
- Procesamiento por lotes en servidores con una sola GPU: `AD-Q6_K` (30,1 GB) ofrece un 97,5% de top-1 frente al BF16, lo que permite servir el modelo en una A100 de 40 GB o H100 con calidad casi identica al original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento son las metricas de fidelidad de cuantizacion frente al BF16 original, medidas sobre texto multilingue neutro (24 fragmentos de 4.096 tokens, llama.cpp `36e36e6`):

| Fichero | Tamano en disco | Construccion | Divergencia KL | top-1 |
|---|---:|---|---:|---:|
| Q8_0 | 35,2 GB | 8 bits estandar | 0,0032 | 98,0% |
| AD-Q6_K | 30,1 GB | Atomic Dynamic, imatrix propia | 0,0052 | 97,5% |
| AD-Q6_K-Q5_K | 27,9 GB | Atomic Dynamic, imatrix propia | 0,0102 | 96,1% |
| AD-Q5_K_M | 24,7 GB | Atomic Dynamic, imatrix propia | 0,0213 | 94,7% |
| Q5_K_M | 23,5 GB | preset llama.cpp, sin imatrix | 0,0304 | 93,4% |
| AD-Q5_K_M-Q4_K_M | 22,6 GB | Atomic Dynamic, imatrix propia | 0,0332 | 93,1% |
| AD-Q4_K_M | 21,2 GB | Atomic Dynamic, imatrix propia | 0,0380 | 92,6% |
| AD-IQ4_XS | 20,3 GB | Atomic Dynamic, imatrix propia | 0,0462 | 92,0% |
| AD-IQ3_S | 17,1 GB | Atomic Dynamic, imatrix propia | 0,1019 | 87,5% |
| AD-IQ3_XXS | 14,9 GB | Atomic Dynamic, imatrix propia | 0,1593 | 84,6% |
| AD-IQ2_S | 13,7 GB | Atomic Dynamic, imatrix propia | 0,2448 | 80,5% |

Referencia de ficheros retirados, medidos en el mismo banco: `Q6_K` estandar (27,2 GB, KL 0,0165, top-1 95,5%) y `Q4_K_M` estandar (20,1 GB, KL 0,0693, top-1 89,9%).

## Requisitos de hardware

- VRAM estimada: aproximadamente el tamano del fichero mas el overhead de contexto KV. Para `AD-IQ4_XS` (20,3 GB) se necesitan unos 22-24 GB de VRAM con contexto moderado; para `AD-Q6_K` (30,1 GB), unos 32-34 GB.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB para los ficheros de mayor calidad (`Q8_0`, `AD-Q6_K`). Para `AD-Q5_K_M` o `AD-Q4_K_M` basta una A100 40 GB o una RTX 4090 de 24 GB.
- GPU de consumo: los ficheros `AD-IQ4_XS` (20,3 GB) y `AD-Q4_K_M` (21,2 GB) caben en una RTX 4090 de 24 GB. Los ficheros de 13,7-17,1 GB (`AD-IQ2_S`, `AD-IQ3_XXS`, `AD-IQ3_S`) caben en GPUs de 16-24 GB, con perdida de calidad notable (top-1 entre 80,5% y 87,5%).
- Opciones de despliegue: llama.cpp (formato nativo GGUF, version de referencia `36e36e6`), aplicacion Atomic Chat, y cualquier runtime compatible con GGUF. No se menciona soporte especifico para vLLM o TGI en la informacion disponible.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota sobre contexto: la ventana de 512K tokens implica un coste de KV cache considerable; con contextos muy largos el requisito de VRAM crece por encima del tamano del fichero.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento de modelos comparables (mismo tamano o misma tarea) que permitan una comparacion rigurosa. La comparacion posible se limita a los propios ficheros de cuantizacion del modelo, recogida en la tabla de benchmarks. Criterios orientativos de categoria:

| Criterio | Nanbeige4.3-33B (GGUF) | Alternativas de la misma categoria |
|---|---|---|
| Parametros | 33,1B densos | no disponible |
| Contexto | 512K tokens | no disponible |
| Licencia | Apache-2.0 | no disponible |
| Idiomas | en, zh | no disponible |
| Formato | GGUF (11 variantes) | no disponible |

## Limitaciones y advertencias

- Sensibilidad alta a la cuantizacion: el `Q6_K` estandar de llama.cpp solo alcanza un 95,5% de top-1 frente al BF16, y el `Q4_K_M` estandar un 89,9%. Por debajo de `AD-Q4_K_M` (top-1 92,6%) la degradacion es rapida: `AD-IQ3_S` cae al 87,5% y `AD-IQ2_S` al 80,5%. Para produccion se recomienda `AD-Q6_K` o superior.
- Idiomas limitados a ingles y chino; no hay soporte declarado de castellano ni de otros idiomas.
- Riesgo de alucinacion inherente a los modelos generativos; no se han publicado evaluaciones especificas de factualidad en la informacion disponible.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia Apache-2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base original (Nanbeige/Nanbeige4.3-33B) y de los componentes de calibracion derivados de Qwen3.8-27B.
- El modo thinking esta activado por defecto, lo que incrementa el consumo de tokens y la latencia; en produccion puede requerir desactivacion explicita segun el caso de uso.
- El contexto de 512K tokens exige gestion cuidadosa de la memoria KV; no es viable en GPUs de consumo con contextos maximos.
- Los ficheros `Q6_K` y `Q4_K_M` estandar fueron retirados del repositorio; scripts o pipelines que los referencien fallaran.

## Enlaces

- Repositorio GGUF: https://huggingface.co/AtomicChat/Nanbeige4.3-33B-GGUF
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Repositorio de metricas e importance matrix: https://huggingface.co/datasets/AtomicChat/Nanbeige4.3-33B-GGUF-metrics
- Atomic Chat: https://atomic.chat/
- GitHub de Atomic Chat: https://github.com/AtomicBot-ai/Atomic-Chat
- Discord: https://discord.gg/8wGSsvmg4V
- X (Twitter): https://x.com/atomic_chat_hq
