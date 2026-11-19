# internlm/Intern-Decision-2B

## Resumen

Intern-Decision-2B es un modelo multimodal de prediccion estructurada de decisiones desarrollado por InternLM (Shanghai AI Laboratory) y publicado en septiembre de 2026. Se trata de un fine-tuning supervisado de Qwen3.5-2B (2.213 millones de parametros) que abandona la generacion libre de texto para adoptar una API de scoring de candidatos: recibe un estado compartido, un esquema de preguntas con nombre y, opcionalmente, imagenes, y devuelve en un unico forward pass causal una distribucion de probabilidad calibrada para cada campo del esquema.

El modelo resuelve un problema concreto de los sistemas agente y de enrutamiento: cuando se necesita una decision tipada (elegir un equipo, puntuar una urgencia, responder si/no) con probabilidades utilizables, la generacion autoregresiva es lenta, costosa y dificil de calibrar. Intern-Decision-2B sustituye `generate()` por una lectura de logits en la posicion inmediatamente anterior a cada placeholder `<decision>`, aplica softmax restringido al conjunto de simbolos candidatos del campo y una calibracion de probabilidad propia del checkpoint.

Su relevancia practica radica en la latencia: 33,28 ms de media por consulta en una unica RTX 4090, con P95 de 33,55 ms, lo que lo sitúa a la par del modelo de 0,8B y por delante del de 4B en velocidad. Con licencia Apache 2.0 y pesos en safetensors, es desplegable en hardware de consumo y encaja en pipelines de clasificacion, triaje y function calling donde se exige determinismo y distribuciones bien calibradas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (derivada de Qwen3.5-2B), con cabeza de scoring estructurado sobre logits enmascarados |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica pesos safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-2B, un transformer decoder-only causal, y se ajusta mediante fine-tuning para una tarea de prediccion estructurada con objetivo de next-token enmascarado. El prompt se construye renderizando el system prompt original, el estado, el esquema de decisiones y un esqueleto JSON de asistente completo con un placeholder `<decision>` por cada campo. La inferencia lee los logits en la posicion inmediatamente anterior a cada placeholder, restringe el softmax a los simbolos permitidos de ese campo (mapeados a `A`–`Z`, `a`–`z`, `0`–`9`) y aplica la calibracion de probabilidad incluida en el checkpoint antes de devolver el JSON tipado.

El modelo soporta tres tipos de campo: `choice` (objeto ordenado de valor a descripcion), `score` (lista o claves numericas finitas) y `noul` (decision binaria con opciones `no` y `yes`). Una unica peticion puede contener multiples campos y ejecutarse en un solo forward pass, sin insertar respuestas de referencia en el prompt. El modulo de inferencia incluido (`DecisionEngine`) es el unico backend implementado (`backend="hf"`) y depende de la calibracion especifica de cada tamano, por lo que debe usarse el modulo distribuido con el checkpoint seleccionado. No se documentan en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplico RLHF o DPO.

## Capacidades

- Prediccion estructurada de decisiones: devuelve una distribucion de probabilidad calibrada por campo, no texto libre.
- Tipos de pregunta soportados: `choice` (seleccion entre opciones con descripcion), `score` (escala ordinal o numerica finita) y `noul` (binaria si/no).
- Multimodalidad de entrada: acepta imagenes opcionales junto al estado textual (pipeline `image-text-to-text`).
- Multiples campos por peticion resueltos en un unico forward pass causal.
- Salida JSON serializable compatible con el formato Jev, apta para consumo programatico directo.
- Probabilidades calibradas con metricas reportadas de Brier score y ECE, utilizables para umbrales y abstención.
- No realiza generacion de texto libre ni tool calling generativo: la API no invoca `generate()` ni muestrea texto.
- Capacidades multilingues: no documentadas en la informacion disponible.

## Casos de uso

- Triaje de tickets de soporte: el modelo clasifica en una sola pasada el equipo responsable (`choice`), la urgencia (`score`) y si se solicita reembolso (`noul`), devolviendo probabilidades para enrutar automaticamente y derivar a revision humana cuando la confianza es baja.
- Enrutamiento en sistemas agente: dado el estado de la conversacion, decide la siguiente accion entre un conjunto cerrado de herramientas o subagentes, con distribucion calibrada que permite politicas de exploracion y umbrales de escalado.
- Moderacion y clasificacion de seguridad: evalua contenido frente a categorias de riesgo con el campo `noul` y `choice`, aprovechando las metricas de WildJailBreak reportadas (78,33) para construir filtros previos a un LLM generativo.
- Clasificacion de documentos con imagen: al aceptar imagenes, puede decidir la categoria de un formulario escaneado, una factura o una captura de pantalla junto con metadatos estructurados en la misma peticion.
- Extraccion de campos tipados en pipelines ETL: convierte texto no estructurado en registros JSON con valores restringidos a un esquema predefinido, evitando post-procesado y validacion de formato.
- Function calling determinista: selecciona la funcion y los argumentos discretos de una llamada en un unico forward pass de 33 ms, adecuado para agentes de baja latencia en produccion.
- Evaluacion de encuestas y anotacion asistida: asigna puntuaciones ordinales calibradas a respuestas abiertas, con Brier score de 0,437 y ECE de 0,100 medidos en el benchmark del autor.

## Benchmarks y rendimiento

Resultados publicados por el autor en la model card. Brier y ECE son metricas de calibracion (menor es mejor); el resto son exactitud en porcentaje.

| Modelo | Jevbench-Easy | Jevbench-Original | Jevbench-Hard | Typed Decision | ToolACE | AG News | WildJailBreak | Media | Brier ↓ | ECE ↓ |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Jev | 100,00 | 98,61 | 72,07 | 73,35 | 91,29 | 89,57 | 96,29 | 88,74 | 0,358 | 0,095 |
| Laya | 95,83 | 72,22 | 28,83 | 35,95 | 63,87 | 92,84 | 14,84 | 57,77 | 0,804 | 0,246 |
| SemIf | 100,00 | 98,61 | 61,26 | 62,80 | 85,16 | 89,22 | 92,53 | 84,23 | 0,498 | 0,112 |
| Kev | 100,00 | 93,06 | 45,05 | 65,60 | 87,42 | 89,82 | 75,97 | 79,56 | 0,738 | 0,262 |
| JevK5 | 100,00 | 97,22 | 73,87 | 64,50 | 80,97 | 89,13 | 90,45 | 85,16 | 0,366 | 0,047 |
| Intern-Decision-0.8B | 97,92 | 80,56 | 52,25 | 77,35 | 94,52 | 88,61 | 64,48 | 79,38 | 0,530 | 0,066 |
| Intern-Decision-2B | 100,00 | 84,72 | 63,96 | 79,35 | 96,45 | 89,96 | 78,33 | 84,68 | 0,437 | 0,100 |
| Intern-Decision-4B | 100,00 | 98,61 | 73,87 | 80,55 | 96,45 | 90,82 | 89,86 | 90,02 | 0,347 | 0,065 |

Latencia por consulta medida en una RTX 4090 con la ruta de inferencia HF local:

| Modelo | Media | Mediana / P50 | P95 |
|---|---:|---:|---:|
| Jev | 109,70 ms | 106,30 ms | 146,70 ms |
| Intern-Decision-0.8B | 33,98 ms | 33,44 ms | 37,50 ms |
| Intern-Decision-2B | 33,28 ms | 33,15 ms | 33,55 ms |
| Intern-Decision-4B | 44,16 ms | 44,03 ms | 44,60 ms |

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 4,4 GB solo para pesos, mas overhead de activaciones y KV cache; en la practica cabe holgadamente en GPUs de 8 GB.
- GPU recomendadas: RTX 4090 (referencia de las mediciones del autor), A100, H100 para despliegues de alto throughput; cualquier GPU consumer con 8 GB o mas es suficiente para una instancia.
- Cabe en GPU de consumo: si, incluidas RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 y superiores.
- Opciones de despliegue: el autor solo implementa el backend `hf` mediante `DecisionEngine` (transformers + PyTorch/CUDA, Python 3.12+). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, y la API de scoring restringido no es compatible con `generate()`.
- Latencia: 33,28 ms de media y 33,55 ms de P95 por consulta en una RTX 4090; el modelo escala mejor en latencia que el de 4B y practicamente iguala al de 0,8B.
- Throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media benchmark | Brier ↓ | ECE ↓ | Latencia media (RTX 4090) | Licencia |
|---|---|---:|---:|---:|---:|---:|---|
| Intern-Decision-2B | 2,21B | no disponible | 84,68 | 0,437 | 0,100 | 33,28 ms | Apache 2.0 |
| Intern-Decision-0.8B | no disponible | no disponible | 79,38 | 0,530 | 0,066 | 33,98 ms | no disponible |
| Intern-Decision-4B | no disponible | no disponible | 90,02 | 0,347 | 0,065 | 44,16 ms | no disponible |
| Jev | no disponible | no disponible | 88,74 | 0,358 | 0,095 | 109,70 ms | no disponible |

Frente al modelo base Qwen3.5-2B, la comparacion directa no esta publicada en los mismos benchmarks: Intern-Decision-2B sacrifica la generacion libre por scoring estructurado calibrado. El 4B supera al 2B en exactitud media (90,02 frente a 84,68) y calibracion, a cambio de 10,9 ms mas de latencia media; el 0,8B es ligeramente mas lento en media pero mejor calibrado en ECE (0,066 frente a 0,100).

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre, no soporta `generate()` y no puede usarse como chatbot ni para redaccion.
- Solo el backend `hf` esta implementado; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que limita el despliegue a gran escala.
- La calibracion de probabilidad es especifica de cada checkpoint: usar el modulo de inferencia de otro tamano invalida las probabilidades devueltas.
- El campo `model` de la peticion no cambia los pesos cargados; la respuesta identifica los pesos realmente en uso, lo que puede inducir a error en orquestadores multiproveedor.
- Requiere preservar el orden de preguntas y opciones, el chat template del checkpoint y el bloque de thinking vacio; desviarse de esta disciplina de prompt degrada la precision.
- Jevbench-Original cae a 84,72 frente al 98,61 del 4B y de varios competidores, lo que indica menor robustez en el conjunto original.
- Rendimiento en WildJailBreak de 78,33, por debajo de Jev (96,29) y SemIf (92,53): no debe usarse como unico filtro de seguridad.
- Idiomas soportados no documentados; no hay garantia de comportamiento en castellano ni en otros idiomas distintos del ingles de los benchmarks.
- Riesgo de alucinacion acotado por el scoring restringido a opciones, pero las descripciones de criterios ambiguas pueden producir asignaciones erroneas con alta confianza.
- Licencia Apache 2.0 permite uso comercial sin restricciones adicionales documentadas; verificar los terminos heredados del modelo base Qwen3.5-2B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/internlm/Intern-Decision-2B
- Demo (Space): https://huggingface.co/spaces/internlm/intern-decision
- Coleccion de pesos: https://huggingface.co/collections/internlm/intern-decision
- Repositorio GitHub: https://github.com/internlm/Intern-Decision
- Informe tecnico (arXiv): https://arxiv.org/abs/2610.22131
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
