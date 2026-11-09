# qda-lab/QDA-Qwen3.8-27B-W4A8

## Resumen

QDA-Qwen3.8-27B-W4A8 es un checkpoint cuantizado del modelo denso Qwen3.8-27B de Alibaba (equipo Qwen), generado por qda-lab mediante una busqueda automatizada de configuraciones de cuantizacion denominada QDA ("Closed-Loop Quantization Design with LLM Agents", enviado a MLSys 2027). El modelo aplica cuantizacion de pesos a 4 bits y activaciones a 8 bits (W4A8) sobre el modelo base, en formato compressed-tensors, y esta pensado para servirse directamente en vLLM sin pasos de conversion adicionales.

El interes practico reside en que reduce el coste de memoria del modelo original (27.781.427.952 parametros, unos 27,8 mil millones) manteniendo, segun la model card, una precision agregada del 79,1 % de media en cuatro benchmarks exigentes (matematicas de competicion, GPQA-Diamond, LiveCodeBench v6 e IFBench). Es, por tanto, una opcion orientada a despliegue en produccion de un modelo de razonamiento y codigo de tamano medio-grande, no un modelo nuevo entrenado desde cero.

La informacion publica disponible es limitada: la model card es muy breve y no detalla la composicion del dataset de calibracion, los idiomas soportados ni la licencia del checkpoint. El modelo base Qwen3.8-27B se describe en su repositorio oficial como un LLM denso nativo multimodal, orientado a codigo, flujos agenticos y automatizacion de oficina.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.8-27B, nativo multimodal); checkpoint cuantizado en formato compressed-tensors |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A8 (pesos a 4 bits, activaciones a 8 bits), formato compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors), cargable en vLLM |

## Arquitectura y entrenamiento

El checkpoint hereda la arquitectura del modelo base Qwen3.8-27B, que el repositorio oficial de Alibaba describe como un LLM denso de pesos abiertos con capacidad multimodal nativa. Sobre esa arquitectura, qda-lab no ha reentrenado el modelo: ha aplicado un proceso de cuantizacion post-entrenamiento W4A8 en el que la configuracion de cuantizacion (que capas se cuantizan, con que granularidad y que rangos) se selecciona mediante una busqueda cerrada guiada por agentes LLM. La model card identifica la ejecucion concreta de esa busqueda (`r-883a8a93`, entrega manual `h4`), lo que sugiere un pipeline reproducible y evaluado de forma sistematica.

No se dispone de informacion sobre el dataset de calibracion, el numero de tokens empleado en la cuantizacion ni sobre si el modelo base incorpora RLHF, DPO u otras fases de alineamiento. Tampoco se detalla si el checkpoint conserva intactas las capacidades multimodales del modelo base tras la cuantizacion, un punto relevante porque la cuantizacion de capas de vision o de proyector multimodal suele ser delicada.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos, con resultados altos en benchmarks de matematicas de competicion (AIME 2025 y HMMT Feb 2026).
- Razonamiento cientifico de nivel experto, evidenciado por la puntuacion en GPQA-Diamond.
- Generacion de codigo competitivo y de nivel de entrevista tecnica (LiveCodeBench v6).
- Seguimiento de instrucciones complejas y con restricciones (IFBench).
- Capacidad multimodal nativa heredada del modelo base Qwen3.8-27B (vision), aunque no se confirma en la model card que se preserve tras la cuantizacion.
- Soporte de tool calling y function calling: no confirmado explicitamente en la informacion disponible, aunque el modelo base esta orientado a flujos agenticos.
- Soporte de agentes y razonamiento multi-paso: coherente con el perfil de benchmarks del modelo base, sin detalle tecnico publicado.
- Capacidades multilingues: no disponible.

## Casos de uso

- Razonamiento matematico asistido: resolucion de problemas de competicion y verificacion de demostraciones, aprovechando el 81,8 % en AIME 2025 + HMMT Feb 2026 del checkpoint cuantizado.
- Generacion de codigo en produccion: el 86,0 % en LiveCodeBench v6 lo hace adecuado para asistentes de programacion, generacion de tests y revision de parches en pipelines de CI/CD.
- Evaluacion cientifica y tecnica: con 80,3 % en GPQA-Diamond, sirve para responder preguntas de nivel posgrado en fisica, quimica y biologia dentro de herramientas de investigacion internas.
- Agentes automatizados con instrucciones estrictas: el 68,3 % en IFBench indica buena adherencia a formatos y restricciones, util para generacion de informes estructurados o extraccion de datos con esquemas fijos.
- Despliegue en infraestructura propia con vLLM: al cargarse directamente con `vllm serve`, encaja en plataformas internas que ya usan el motor de vLLM y necesitan un modelo de ~28B con menor huella de memoria que el original en BF16.
- Automatizacion de oficina y procesamiento documental: el modelo base esta orientado a tareas de oficina y es multimodal, por lo que puede emplearse en resumen de documentos y extraccion de informacion, siempre que se valide que la cuantizacion conserva la via visual.
- Servicio de inferencia gestionado: existe una ficha del checkpoint en FriendliAI, lo que permite desplegarlo como API sin gestionar GPU propia.

## Benchmarks y rendimiento

Resultados publicados en la model card del checkpoint cuantizado (vLLM 0.27.1 sobre GH200, batching estatico, muestreo `temperature=1.0, top_p=0.95, top_k=20, presence_penalty=0.0`, semillas 17+j):

| Benchmark | Puntuacion (%) |
|---|---|
| Math (AIME 2025 + HMMT Feb 2026) | 81,8 |
| GPQA-Diamond | 80,3 |
| LiveCodeBench v6 | 86,0 |
| IFBench | 68,3 |
| Media | 79,1 |

No se han publicado en la informacion disponible los resultados del modelo base sin cuantizar ni de otras variantes de cuantizacion, por lo que no es posible calcular la perdida exacta atribuible al proceso W4A8.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 19,5 GB en disco; en W4A8 la huella de pesos ronda ese orden de magnitud, a la que hay que sumar cache KV y buffers de activacion (dependientes del contexto y del batch).
- GPU recomendadas: la evaluacion oficial se realizo en NVIDIA GH200. Para produccion son razonables A100 80 GB, H100 80 GB o L40S 48 GB, especialmente con contextos largos o batches grandes.
- GPU de consumo: con ~20 GB de pesos, cabe en tarjetas de 24 GB (RTX 4090, RTX 3090) para contextos moderados y batch pequeno; en 16 GB no es viable sin reducir contexto o usar variantes mas agresivas.
- Opciones de despliegue: vLLM es la via soportada de forma nativa (`vllm serve qda-lab/QDA-Qwen3.8-27B-W4A8`). El formato compressed-tensors no es directamente compatible con llama.cpp u Ollama sin conversion a GGUF, que no se ofrece en el repositorio. Tambien esta disponible como endpoint gestionado en FriendliAI.
- Latencia y throughput: no disponibles. La model card solo indica batching estatico en GH200, sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-Qwen3.8-27B-W4A8 | ~27,8 B (denso) | no disponible | W4A8 | no disponible | Hugging Face, vLLM, FriendliAI |
| Qwen/Qwen3.8-27B (base) | ~27,8 B (denso) | no disponible | BF16 (original) | no disponible | Hugging Face, GitHub oficial |
| Otras variantes cuantizadas del mismo base | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos publicados de benchmarks de los modelos alternativos en la informacion proporcionada, por lo que no se incluye comparacion de rendimiento numerica.

## Limitaciones y advertencias

- La cuantizacion W4A8 puede degradar tareas sensibles a la precision numerica; la model card no publica la diferencia frente al modelo base, solo la puntuacion absoluta del checkpoint.
- No se confirma que las capacidades multimodales del modelo base sobrevivan a la cuantizacion; conviene validarlas antes de usarlas en produccion.
- No hay informacion sobre sesgos, datos de entrenamiento ni evaluaciones de seguridad del checkpoint ni del modelo base.
- Riesgo de alucinacion propio de un LLM de este tamano, especialmente en dominios fuera de los benchmarks evaluados (matematicas, ciencia, codigo e instrucciones).
- Longitud de contexto e idiomas soportados no documentados: no se debe asumir el contexto del modelo base sin verificarlo.
- Licencia no indicada en el repositorio: es imprescindible consultar la licencia del modelo base Qwen3.8-27B antes de cualquier uso comercial.
- El checkpoint tiene un uso muy bajo (7 descargas, 0 likes) y procede de un articulo aun en evaluacion (envio a MLSys 2027); no es un artefacto con historial de produccion.
- La evaluacion se hizo con un unico motor (vLLM 0.27.1) y un unico hardware (GH200); el rendimiento en otras configuraciones puede diferir.

## Enlaces

- Checkpoint en Hugging Face: https://huggingface.co/qda-lab/QDA-Qwen3.8-27B-W4A8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Endpoint gestionado en FriendliAI: https://friendli.ai/models/qda-lab/QDA-Qwen3.8-27B-W4A8
