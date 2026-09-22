# konizquants/OpenThinker-Agent-v1-SFT

## Resumen

OpenThinker-Agent-v1-SFT es un ajuste fino supervisado (SFT) del modelo denso Qwen3-8B, orientado a tareas agénticas de terminal y de ingeniería de software. Forma parte de la iniciativa OpenThoughts-Agent, cuyo objetivo es publicar de forma abierta los conjuntos de datos, los modelos y el código de investigación necesarios para entrenar agentes capaces de operar sobre un shell y de resolver bugs en repositorios reales. Esta ficha corresponde a la réplica publicada por el usuario konizquants en HuggingFace; el repositorio oficial del mismo checkpoint es open-thoughts/OpenThinker-Agent-v1-SFT.

El modelo se ha entrenado por etapas: primero SFT sobre el dataset OpenThoughts-Agent-v1-SFT, compuesto por aproximadamente 15.200 trazas procedentes de dos fuentes (tareas sintéticas de conversión de lenguaje natural a comandos shell, denominadas nl2bash, y un conjunto de bugs en C# y Java recopilados por Microsoft, denominado InferredBugs). Posteriormente, la versión completa OpenThinker-Agent-v1 añade una fase de aprendizaje por refuerzo sobre unas 720 tareas del subconjunto nl2bash verified. El checkpoint que nos ocupa es el intermedio, es decir, el que existe justo después de la fase SFT y antes del RL.

La relevancia de este modelo radica en que, según los datos publicados por el autor, la versión tras RL alcanza resultados de referencia para su escala en Terminal-Bench 2.0 y SWE-Bench Verified, superando a Qwen3-8B base y a Qwen3-32B en esos mismos benchmarks. El repositorio ocupa 16,4 GB, se distribuye en safetensors con licencia Apache 2.0 y hereda del modelo base una arquitectura transformer decoder-only de aproximadamente 8.000 millones de parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, heredada del modelo base Qwen3-8B (densa, no MoE) |
| Parámetros totales | No disponible con certeza. El modelo base es Qwen/Qwen3-8B y el repositorio ocupa 16,4 GB. La metadata de safetensors del repositorio indica 308.224, valor incoherente con el tamaño del repositorio y sin unidad especificada |
| Parámetros activos | No aplica (el modelo base Qwen3-8B es denso, no MoE) |
| Longitud de contexto | No disponible en la información proporcionada (se hereda la configuración del modelo base, no detallada en la model card) |
| Tipos de cuantización | Solo se publican pesos completos en safetensors. No se documentan versiones GGUF, AWQ, GPTQ ni FP8 en este repositorio |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio de 16,4 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-8B, un transformer decoder-only denso de la familia Qwen3. La model card no introduce modificaciones arquitectónicas propias: el trabajo se concentra en el post-entrenamiento. La primera etapa es un ajuste fino supervisado sobre OpenThoughts-Agent-v1-SFT, un conjunto de aproximadamente 15.200 trazas generadas por agentes profesores de alto rendimiento al resolver dos tipos de tareas: nl2bash, donde el agente debe formular correctamente comandos de shell, e InferredBugs, un conjunto de bugs en C# y Java recopilados por Microsoft y convertidos en tareas ejecutables. La segunda etapa, ya fuera del alcance de este checkpoint, aplica aprendizaje por refuerzo sobre unas 720 tareas del subconjunto nl2bash verified.

Los hiperparámetros documentados del SFT son: learning rate 4e-05, optimizador AdamW fused con betas (0,9; 0,98) y epsilon 1e-08, scheduler coseno con warmup ratio 0,1, 7 épocas, batch size 1 por dispositivo y batch total de 16 sobre 16 GPUs, batch de evaluación 8 por dispositivo y total de 128, y semilla 42. El entrenamiento se realizó con Transformers 4.56.0, PyTorch 2.9.0+cu128, Datasets 4.4.1 y Tokenizers 0.22.1. Una innovación destacable del esfuerzo es el pipeline de filtrado de tareas en tres etapas previo al entrenamiento: descarte de tareas con verificadores inestables o lentos, eliminación de tareas cuyo contenedor tarda demasiado en construirse o destruirse, y un filtro opcional de dificultad que descarta tareas que ni siquiera un modelo fuerte como GPT-5 Codex resuelve en una sola pasada.

## Capacidades

- Generación de texto conversacional y razonamiento general, heredados del modelo base Qwen3-8B.
- Ejecución de tareas agénticas de terminal: conversión de instrucciones en lenguaje natural a comandos de shell correctamente formateados (tareas del tipo nl2bash).
- Resolución de bugs en código C# y Java, a partir del conjunto InferredBugs transformado en tareas ejecutables.
- Operación dentro de harnesses de agente: los resultados publicados se obtienen con Terminus-2 y OpenHands, lo que implica interacción multi-paso con entorno y herramientas.
- Uso de herramientas y function calling: no se documenta explícitamente el formato en la información disponible, aunque el entrenamiento está orientado a flujos agénticos con herramientas.
- Modo de razonamiento explícito (thinking mode): no documentado en la información disponible.
- Capacidades multilingües: no disponibles.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Automatización de operaciones en terminal: el modelo traduce peticiones en lenguaje natural a comandos de shell, lo que permite construir asistentes de operaciones que ejecutan tareas de administración de sistemas con una capa de validación previa a la ejecución.
- Corrección automática de bugs en bases de código empresariales C# y Java: al haberse entrenado sobre el conjunto InferredBugs, es adecuado para agentes que reciben un repositorio con un fallo y proponen un parche verificable mediante tests.
- Agente integrado en pipelines de CI/CD: puede actuar como paso de reparación automática cuando falla una suite de pruebas, generando el cambio de código y dejando la validación al propio pipeline.
- Base para investigación en post-entrenamiento de agentes: al existir los checkpoints SFT y RL por separado, este modelo permite aislar la contribución de la fase SFT frente a la de RL en experimentos controlados.
- Generación de datos sintéticos de trayectorias: puede emplearse para producir trazas de interacción con terminal que después se filtren y reutilicen en pipelines de entrenamiento o de destilación.
- Asistente de desarrollo en IDE orientado a tareas de software engineering: dado su entrenamiento con harnesses como OpenHands, encaja en flujos donde el modelo edita ficheros, ejecuta comandos y comprueba resultados de forma iterativa.
- Formación y evaluación de equipos técnicos: sirve como referencia reproducible para medir la dificultad de tareas de shell y de reparación de bugs, y para comparar el comportamiento de agentes de distinto tamaño.

## Benchmarks y rendimiento

La model card no declara resultados propios para este checkpoint SFT: el campo model-index del repositorio aparece con la lista `results` vacía. Los únicos datos numéricos publicados por el autor corresponden a la versión tras RL (open-thoughts/OpenThinker-Agent-v1), que se reproducen a continuación tal cual.

| Modelo | Harness | Terminal-Bench 2.0 | SWE-Bench Verified | OpenThoughts-TB-Dev |
|---|---|---|---|---|
| Qwen3-8B | Terminus-2 | 0,0 | 0,7 | 5,7 |
| OpenThinker-Agent-v1 (tras RL) | Terminus-2 | 4,9 | 15,7 | 17,3 |
| Qwen3-32B | Terminus-2 | 1,9 | 5,7 | 10,2 |
| Qwen/Qwen3-Coder-30B-A3B-Instruct | OpenHands | 10,1 | 49,2 | 24,5 |

Advertencia de comparabilidad: los tres primeros modelos se evalúan con el harness Terminus-2, mientras que Qwen3-Coder-30B-A3B-Instruct se evalúa con OpenHands, por lo que sus cifras no son directamente equiparables. Además, los valores de OpenThinker-Agent-v1 corresponden al modelo completo con RL, no al checkpoint SFT objeto de esta ficha. No se han publicado resultados de benchmarks específicos de OpenThinker-Agent-v1-SFT en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia con pesos en bf16/fp16: alrededor de 16,4 GB solo para los pesos, más caché KV y activaciones; se recomienda un mínimo de 20-24 GB de VRAM para contexto moderado.
- VRAM estimada con cuantización de 8 bits: aproximadamente 9-10 GB de pesos, con un total práctico de 12-14 GB.
- VRAM estimada con cuantización de 4 bits: aproximadamente 4,5-5,5 GB de pesos, con un total práctico de 6-8 GB; la caché KV crece de forma apreciable con contextos largos.
- GPU recomendadas para servicio en producción: A100 40/80 GB, H100, L40S 48 GB o similares; en bf16 cualquier GPU con 24 GB o más puede ejecutar el modelo con contexto limitado.
- GPU de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en bf16 con margen ajustado, y en RTX 4080, 4070 Ti Super o equivalentes de 16 GB solo con cuantización.
- Opciones de despliegue: la model card declara `transformers` como librería y el repositorio incluye las etiquetas `text-generation-inference` y `endpoints_compatible`, por lo que es compatible con Transformers y Text Generation Inference. No se confirma en la información disponible soporte específico para vLLM, llama.cpp, Ollama u otros motores, ni la existencia de pesos GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Terminal-Bench 2.0 | SWE-Bench Verified | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| OpenThinker-Agent-v1 (tras RL) | ~8.000 millones (base Qwen3-8B) | No disponible | 4,9 (Terminus-2) | 15,7 | Apache 2.0 | Público en HuggingFace |
| OpenThinker-Agent-v1-SFT (este checkpoint) | ~8.000 millones (base Qwen3-8B) | No disponible | No disponible | No disponible | Apache 2.0 | Público en HuggingFace |
| Qwen3-8B | ~8.000 millones | No disponible en la información | 0,0 (Terminus-2) | 0,7 | Apache 2.0 | Público en HuggingFace |
| Qwen3-32B | ~32.000 millones | No disponible en la información | 1,9 (Terminus-2) | 5,7 | Apache 2.0 | Público en HuggingFace |
| Qwen3-Coder-30B-A3B-Instruct | 30.000 millones totales, 3.000 millones activos (MoE) | No disponible en la información | 10,1 (OpenHands) | 49,2 | Apache 2.0 | Público en HuggingFace |

## Limitaciones y advertencias

- No hay resultados de benchmarks publicados para este checkpoint SFT concreto; las cifras disponibles corresponden a la versión posterior al RL, por lo que no deben atribuirse a este modelo.
- El repositorio analizado es una réplica subida por el usuario konizquants y no el repositorio oficial (open-thoughts/OpenThinker-Agent-v1-SFT). Conviene verificar la integridad de los pesos antes de usarlos en producción.
- El repositorio registra 0 descargas y 0 likes, lo que indica que no ha pasado por una validación comunitaria amplia.
- La metadata de safetensors del repositorio declara 308.224 parámetros totales, una cifra incompatible con un modelo basado en Qwen3-8B y con un repositorio de 16,4 GB; se trata de un dato inconsistente que debe confirmarse con la configuración real del modelo.
- El ajuste SFT se ha realizado sobre un dominio estrecho: tareas de shell sintéticas y bugs en C# y Java. Es esperable un rendimiento inferior fuera de esos lenguajes y tipos de tarea, y un posible sesgo hacia el formato de los datos de entrenamiento.
- El modelo está diseñado para ejecutar comandos en un terminal; su uso sin aislamiento (contenedores, permisos restringidos, revisión humana) introduce riesgo de ejecución de comandos destructivos o de acceso no autorizado.
- Riesgo de alucinación inherente a los modelos de lenguaje, especialmente crítico cuando la salida se interpreta como comando ejecutable: un comando plausible pero incorrecto puede provocar pérdida de datos.
- No se documentan sesgos específicos, composición idiomática ni capacidades multilingües en la información disponible.
- Licencia Apache 2.0: permite uso comercial y modificación, pero exige conservar los avisos de licencia y no concede garantías; el modelo base Qwen3-8B mantiene su propia licencia, que debe respetarse igualmente.
- La fecha de creación y actualización del repositorio (2026-09-21) es atípica y conviene verificarla junto con la del repositorio oficial.

## Enlaces

- Modelo en HuggingFace (réplica analizada): https://huggingface.co/konizquants/OpenThinker-Agent-v1-SFT
- Modelo SFT oficial: https://huggingface.co/open-thoughts/OpenThinker-Agent-v1-SFT
- Modelo tras RL: https://huggingface.co/open-thoughts/OpenThinker-Agent-v1
- Dataset de SFT: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-v1-SFT
- Dataset de RL: https://huggingface.co/datasets/open-thoughts/OpenThoughts-Agent-v1-RL
- Página del proyecto: https://www.openthoughts.ai/blog/agent
- Repositorio de código: https://github.com/open-thoughts/OpenThoughts-Agent
- Modelo base: https://huggingface.co/Qwen/Qwen3-8B
- Modelo comparado en la tabla de benchmarks: https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct
- Modelo comparado en la tabla de benchmarks: https://huggingface.co/Qwen/Qwen3-32B

Nota sobre la búsqueda web: los resultados devueltos por la búsqueda tratan exclusivamente sobre husos horarios y horario de verano en Europa (timeanddate.com, whichtimezone.com, 24timezones.com, timetranslator.com) y no contienen información relacionada con el modelo, por lo que no se han utilizado.
