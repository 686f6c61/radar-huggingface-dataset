# internlm/Intern-Decision-2B

## Resumen

Intern-Decision-2B es un modelo multimodal de decision estructurada desarrollado por InternLM (Shanghai AI Laboratory) y afinado a partir de Qwen/Qwen3.5-2B. A diferencia de un modelo conversacional convencional, no genera texto libre: recibe un estado compartido (una situacion descrita en lenguaje natural), un esquema de preguntas con nombre y tipo (choice, score o noul), y opcionalmente imagenes, y devuelve en un unico forward pass una distribucion de probabilidad calibrada para cada pregunta.

El modelo cuenta con 2.213.241.664 parametros (aproximadamente 2,2 mil millones) y se distribuye bajo licencia Apache 2.0, con pesos en formato safetensors y un repositorio de 4,4 GB. Forma parte de una familia con variantes de 0,8B, 2B y 4B, todas construidas sobre el mismo pipeline de inferencia y orientadas a tareas de enrutamiento, clasificacion y decision tipada sobre texto e imagen.

Su relevancia actual reside en el enfoque de "structured candidate scoring": en lugar de muestrear texto y parsearlo despues, lee los logits en la posicion inmediatamente anterior a cada marcador de decision, aplica softmax restringido a los simbolos candidatos de ese campo y aplica una calibracion especifica del checkpoint. Esto reduce drasticamente la latencia (33,28 ms de media por consulta en una RTX 4090) y permite obtener probabilidades calibradas (ECE de 0,100) en lugar de salidas categoricas sin incertidumbre.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen3.5-2B, con torre de vision congelada (fine-tune del resto) |
| Parametros totales | 2.213.241.664 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio se distribuye en safetensors, 4,4 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Pipeline | image-text-to-text |
| Biblioteca | transformers |
| Objetivo | masked-next-token decision objective sobre simbolos candidatos |
| Numero de preguntas por peticion | 1 a 16 |
| Opciones maximas por pregunta | 62 |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-2B y se especializa mediante fine-tuning supervisado para un objetivo de decision enmascarada. La entrada se compone de tres elementos: un estado (`state`), un esquema de preguntas (`questions`) con tipos `choice`, `score` y `noul`, y un bloque de imagenes opcional. Cada opcion de cada pregunta se mapea a un simbolo de un solo token dentro del alfabeto `A`–`Z`, `a`–`z`, `0`–`9` (62 simbolos posibles), y el prompt se renderiza con la plantilla de chat del checkpoint, incluyendo un esqueleto JSON de asistente con un marcador `<decision>` por campo y un bloque de pensamiento vacio.

La inferencia consiste en un unico forward pass causal: se leen los logits en la posicion inmediatamente anterior a cada marcador, se aplica softmax restringido unicamente a los logits de los simbolos permitidos para ese campo y despues se aplica la calibracion de probabilidad propia del checkpoint. Los simbolos se mapean de vuelta a los valores originales de las opciones y se devuelve JSON tipado. No se invoca `generate()` ni se muestrea texto libre en ningun punto. No se ha publicado informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; la model card solo indica que es un fine-tune supervisado con un modulo de calibracion por tamano.

## Capacidades

- Decision estructurada multicampo: hasta 16 preguntas por peticion, cada una con hasta 62 opciones, resueltas todas en un solo forward pass.
- Tipos de pregunta soportados: `choice` (objeto ordenado de valores a descripciones), `score` (lista de valores o claves numericas finitas) y `noul` (binaria, `no` seguido de `yes`).
- Comprension multimodal: acepta imagenes opcionales junto al estado textual (la demo publica admite hasta ocho imagenes).
- Salida de distribuciones calibradas: devuelve probabilidad por opcion, no solo la etiqueta ganadora, con calibracion especifica del checkpoint.
- Salida JSON tipada y serializable, compatible con el formato Jev, utilizable directamente en pipelines de decision.
- Procesamiento por lotes de campos heterogeneos dentro de una misma peticion (varias preguntas de distinto tipo a la vez).
- Capacidad conversacional declarada en las etiquetas del modelo, aunque la API principal es de scoring estructurado, no de generacion.
- Capacidades multilingues detalladas: no disponibles.
- No soporta muestreo libre de texto, tool calling generativo ni razonamiento multi-paso del tipo cadena de pensamiento (el bloque de pensamiento se mantiene vacio por diseno).

## Casos de uso

- Enrutamiento de tickets de soporte: a partir de la descripcion del caso se define una pregunta `choice` con los equipos disponibles (facturacion, envios, tecnico) y otra `score` de urgencia; el modelo devuelve la probabilidad de cada equipo y el nivel de prioridad en una sola pasada de ~33 ms, lo que permite clasificar miles de tickets por minuto en una unica GPU de consumo.
- Triaje de incidencias con evidencia visual: adjuntando capturas de pantalla o fotos del producto, el modelo combina la descripcion textual y la imagen para decidir la categoria del problema y si procede reembolso (pregunta `noul`), algo util en mesas de ayuda de comercio electronico.
- Moderacion y evaluacion de seguridad: la tabla de benchmarks incluye WildJailBreak, de modo que el modelo puede usarse como clasificador de peticiones potencialmente daninas devolviendo una probabilidad en lugar de una etiqueta binaria, lo que facilita fijar umbrales de bloqueo segun el riesgo tolerado.
- Verificacion de decisiones de agentes: dado el estado de una conversacion y el conjunto de acciones posibles de un agente, el modelo emite una distribucion sobre la accion siguiente y sobre metadatos tipados (por ejemplo, si se ha solicitado confirmacion), util como capa de validacion antes de ejecutar una herramienta.
- Clasificacion de documentos con incertidumbre: para tareas tipo AG News o categorizacion interna, la salida calibrada (ECE de 0,100) permite derivar automaticamente a revision humana los casos con baja confianza en lugar de aplicar un umbral fijo.
- Puntuacion de riesgo en scoring de formularios: el tipo `score` con criterios ordenados permite convertir respuestas heterogeneas en una puntuacion ordinal calibrada, por ejemplo para priorizar leads o evaluar solicitudes de credito a partir de texto e imagenes adjuntas.
- Evaluacion de modelos en benchmarks de decision: la propia familia se utiliza como sujeto de comparacion en Jevbench y Typed Decision, por lo que es adecuada como baseline reproducible en experimentos de investigacion sobre calibracion.
- Despliegue en el borde o en servicios de baja latencia: con 2,2B parametros y latencias de decenas de milisegundos, encaja en servicios de decision en linea donde un modelo de 70B seria inviable economicamente.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes de acierto salvo Brier y ECE, donde menor es mejor):

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

Latencia por consulta extremo a extremo medida en una unica RTX 4090 con la ruta de inferencia HF local (dependiente de la carga y del hardware):

| Modelo | Media | Mediana / P50 | P95 |
|---|---:|---:|---:|
| Jev | 109,70 ms | 106,30 ms | 146,70 ms |
| Intern-Decision-0.8B | 33,98 ms | 33,44 ms | 37,50 ms |
| Intern-Decision-2B | 33,28 ms | 33,15 ms | 33,55 ms |
| Intern-Decision-4B | 44,16 ms | 44,03 ms | 44,60 ms |

## Requisitos de hardware

- Peso en precision de entrenamiento: el repositorio ocupa 4,4 GB, coherente con 2,21B parametros en bf16/fp16 (unos 4,4 GB de VRAM solo para pesos).
- VRAM estimada para inferencia: aproximadamente 5–6 GB en bf16 contando pesos, cache de activaciones y overhead del runtime; en cuantizacion de 8 bits bajararia a unos 3 GB y en 4 bits a unos 2 GB, aunque no se han publicado pesos cuantizados oficiales.
- GPU de referencia en las mediciones: una unica RTX 4090, con 33,28 ms de media y P95 de 33,55 ms por consulta.
- Cabe con holgura en GPU de consumo: RTX 4090, RTX 4080, RTX 3090, RTX 3080, e incluso en tarjetas de 8 GB si se cuantiza, dado el tamano del modelo.
- Despliegue oficial: el modulo de inferencia `inference.py` con la clase `DecisionEngine`, backend `hf` (el unico implementado segun la model card), sobre PyTorch/CUDA y Python 3.12 o superior. El motor debe cargarse una vez y reutilizarse entre peticiones.
- Endpoint gestionado: FriendliAI ofrece despliegue de Intern-Decision-2B como API de baja latencia.
- No se mencionan pesos GGUF, ni soporte oficial para vLLM, llama.cpp, Ollama o TGI en la informacion disponible; la libreria declarada es exclusivamente transformers.
- Throughput: no disponible de forma explicita, aunque con una media de 33,28 ms por consulta y un unico forward pass por peticion, un solo dispositivo puede sostener del orden de decenas de peticiones por segundo si el batching lo permite.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Media en benchmarks | Brier ↓ | ECE ↓ | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Intern-Decision-2B | 2.213.241.664 | Multimodal de decision estructurada | 84,68 | 0,437 | 0,100 | Apache 2.0 | HuggingFace, FP, FriendliAI |
| Intern-Decision-0.8B | no disponible (denominacion 0,8B) | Multimodal de decision estructurada | 79,38 | 0,530 | 0,066 | no disponible | HuggingFace |
| Intern-Decision-4B | no disponible (denominacion 4B) | Multimodal de decision estructurada | 90,02 | 0,347 | 0,065 | no disponible | HuggingFace |
| Jev | no disponible | Modelo de decision | 88,74 | 0,358 | 0,095 | no disponible | referencia en benchmarks |
| JevK5 | no disponible | Modelo de decision | 85,16 | 0,366 | 0,047 | no disponible | referencia en benchmarks |
| SemIf | no disponible | Modelo de decision | 84,23 | 0,498 | 0,112 | no disponible | referencia en benchmarks |

Frente a la base Qwen/Qwen3.5-2B, la comparacion directa no es posible porque el modelo base esta orientado a generacion de texto libre y no se evalua con las mismas metricas de decision estructurada. Dentro de la propia familia, el salto de 0,8B a 2B mejora la media en 5,3 puntos y el de 2B a 4B en otros 5,3 puntos, a costa de pasar de 33,28 ms a 44,16 ms por consulta.

## Limitaciones y advertencias

- El modelo no genera texto libre: no invoca `generate()` y no debe usarse como chatbot ni para redaccion. Cualquier expectativa de respuesta conversacional es un uso incorrecto de la API.
- El numero de preguntas por peticion esta acotado a 16 y el de opciones por pregunta a 62, por limitacion del alfabeto de simbolos candidatos.
- El backend implementado es unicamente `hf`; el campo opcional `model` de la peticion no cambia de checkpoint, y el campo `model` de la respuesta identifica los pesos realmente cargados por el modulo.
- Cada tamano de la familia trae su propio modulo de inferencia y su propia calibracion; mezclar un modulo con pesos de otro tamano invalida las probabilidades devueltas.
- El prompt debe conservar la plantilla de chat del checkpoint, el bloque de pensamiento vacio y el orden de preguntas y opciones; alterar el orden o el mapeo de simbolos produce resultados incorrectos.
- No se han publicado datos de sesgos, composicion del dataset de entrenamiento ni evaluaciones por idioma; los idiomas soportados figuran como no disponibles, por lo que no hay garantia de rendimiento fuera del ingles (los benchmarks publicados estan en ingles).
- Riesgo de alucinacion: aunque la salida se restringe a opciones predefinidas, la distribucion puede concentrarse en una opcion incorrecta con alta confianza en estados ambiguos o fuera de distribucion. El ECE de 0,100 es bueno pero no nulo.
- En Jevbench-Hard el modelo obtiene 63,96 frente a 98,61 de Jev, y en Jevbench-Original 84,72 frente a 98,61; los casos dificiles siguen siendo un punto debil frente a alternativas de la misma categoria.
- La torre de vision se mantiene congelada, de modo que la calidad de la parte visual depende integramente del checkpoint Qwen3.5-2B original.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion, pero conviene revisar tambien los terminos del modelo base Qwen3.5-2B, ya que el fine-tune hereda sus condiciones.
- No hay pesos cuantizados oficiales publicados; cualquier cuantizacion a 8 o 4 bits es una conversion externa y puede degradar la calibracion, que es precisamente el valor diferencial del modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/internlm/Intern-Decision-2B
- Coleccion completa de la familia Intern-Decision: https://huggingface.co/collections/internlm/intern-decision
- Modelo base Qwen/Qwen3.5-2B: https://huggingface.co/Qwen/Qwen3.5-2B
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/internlm/intern-decision
- Repositorio GitHub: https://github.com/internlm/Intern-Decision
- Endpoint gestionado en FriendliAI: https://friendli.ai/models/internlm/Intern-Decision-2B
- Analisis de ajuste de VRAM y hardware: https://www.madebyagents.com/models/intern-decision-2b
