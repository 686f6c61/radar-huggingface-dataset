# internlm/Intern-Decision-0.8B

## Resumen

Intern-Decision-0.8B es un modelo multimodal de decision estructurada desarrollado por el equipo de InternLM (Shanghai AI Laboratory) y afinado a partir de Qwen/Qwen3.5-0.8B. No es un modelo generativo al uso: recibe un estado compartido (texto y, opcionalmente, imagenes), un esquema de preguntas con nombre y devuelve una distribucion de respuesta calibrada para cada pregunta en un unico forward pass causal. El modelo no llama a `generate()` ni muestrea texto libre; su API es una puntuacion de candidatos estructurada que produce JSON tipado.

Su relevancia practica esta en el coste: con 852.985.920 parametros (0,85 B) y una latencia media de 33,98 ms por consulta en una RTX 4090, resuelve en una sola pasada tareas que normalmente se abordarian con varias llamadas a un LLM mayor (enrutado, priorizacion, decisiones binarias, clasificacion multietiqueta). Ademas, su error de calibracion es bajo (ECE 0,066), lo que permite usar las probabilidades directamente para fijar umbrales operativos.

El checkpoint se publico en septiembre de 2026 bajo licencia Apache-2.0, con 1,7 GB de pesos, y forma parte de una familia junto a Intern-Decision-2B e Intern-Decision-4B. En la media agregada de los siete benchmarks comunicados por el autor obtiene 79,38, por debajo de las variantes mayores (84,68 y 90,02) pero con la latencia mas baja de la familia y mejor ECE que la variante de 2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso causal (derivado de Qwen3.5-0.8B), con cabecera de decision estructurada sobre logits enmascarados |
| Parametros totales | 852.985.920 (0,85 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la model card no documenta variantes cuantizadas; repo de 1,7 GB en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (libreria `transformers`) |
| Modalidad | image-text-to-text (texto e imagen de entrada; salida JSON estructurada, no texto libre) |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Tamano del repositorio | 1,7 GB |
| Fecha de publicacion | 26 de septiembre de 2026 (segun metadatos de HuggingFace) |
| Backend de inferencia | `backend="hf"` (unico backend implementado) |
| Requisitos | Python 3.12+ |

## Arquitectura y entrenamiento

La model card describe el modelo como un fine-tune de Qwen3.5-0.8B orientado a decision estructurada multimodal, etiquetado con `decision-making`, `multimodal` y `structured-prediction`. El procedimiento de inferencia es el rasgo arquitectonico distintivo: se preserva el orden de preguntas y opciones y se mapea cada opcion a un simbolo de un solo token (`A`-`Z`, `a`-`z`, `0`-`9`, hasta 62 opciones por pregunta); se renderiza el system prompt original, el estado, el esquema de decision y un esqueleto JSON de asistente completo con un marcador `<decision>` por campo; se ejecuta un unico forward pass causal y se leen los logits en la posicion inmediatamente anterior a cada marcador; se aplica softmax restringido a los simbolos candidatos de ese campo y la calibracion de probabilidad propia del checkpoint; finalmente se reconstruyen los valores originales de las opciones y se devuelve JSON tipado.

Se admiten entre 1 y 16 preguntas por peticion, con tres tipos de campo: `choice` (criterios como objeto ordenado valor→descripcion), `score` (lista o claves numericas) y `noul` (decision binaria con orden `no`, `yes`). Una misma peticion puede contener varios campos y no se insertan respuestas de referencia en el prompt; el compilador de inferencia solo usa `state`, `questions` e `images`. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO: esa informacion no esta disponible.

## Capacidades

- Prediccion estructurada multi-campo: devuelve una distribucion de respuesta por pregunta en un solo forward pass, con salida JSON serializable y tipada.
- Tres tipos de decision soportados: eleccion entre opciones (`choice`), puntuacion ordinal (`score`) y decision binaria (`noul`).
- Entrada multimodal: acepta imagenes junto al estado textual (pipeline `image-text-to-text`).
- Escalado de esquema: de 1 a 16 preguntas por peticion y hasta 62 opciones por pregunta.
- Probabilidades calibradas: la salida incluye calibracion de probabilidad del checkpoint, con ECE de 0,066 en la evaluacion publicada.
- Capacidades evaluadas en la model card: Jevbench (facil, original y dificil), Typed Decision, ToolACE (decisiones relacionadas con herramientas), AG News (clasificacion de noticias) y WildJailBreak (evaluacion de seguridad en decisiones).
- No genera texto libre: no soporta `generate()`, chat abierto ni muestreo de lenguaje natural.
- No se documenta soporte de function calling clasico, uso de agentes multi-paso ni modo "thinking"; el bloque de pensamiento del chat template se mantiene vacio en el renderizado.

## Casos de uso

- Enrutado de tickets de soporte: con un `state` como "el cliente ha sido cobrado dos veces y pide la devolucion", el modelo devuelve en una sola pasada el equipo responsable (`choice`), la prioridad (`score`) y si se solicita reembolso (`noul`); los 33,98 ms de latencia media permiten ejecutarlo de forma sincrona en la puerta de entrada del sistema.
- Triaje previo en pipelines RAG o de agentes: usar un campo `noul` para decidir si la consulta requiere recuperacion, escalado a un LLM mayor o respuesta directa, reduciendo el numero de llamadas a modelos grandes.
- Moderacion de contenido con imagen: al aceptar entradas de imagen y texto, puede clasificar publicaciones multimodales contra politicas definidas como criterios de un campo `choice` o `score`.
- Etiquetado a escala de datasets: generar etiquetas y distribuciones de probabilidad sobre corpus grandes a bajo coste (0,85 B de parametros) para preentrenamiento, filtrado o evaluacion de datos.
- Lead scoring y priorizacion comercial en CRM: el tipo `score` con criterios ordenados permite asignar una prioridad y devolver su probabilidad calibrada, util para fijar umbrales de actuacion con ECE bajo.
- Puerta de invocacion de herramientas (tool gating): dado que ToolACE forma parte de la evaluacion, encaja como capa de decision que determina que herramienta o accion corresponde antes de que un agente ejecute la llamada.
- Analisis de intenciones en atencion al cliente: clasificacion multietiqueta de una misma conversacion en varios ejes (motivo, urgencia, riesgo) con un solo paso de inferencia, sin generar texto que haya que parsear posteriormente.
- Decisiones binarias de cumplimiento: evaluar si un caso cumple o no una politica (tipo `noul`) de forma determinista y reproducible, con logits leidos siempre en la misma posicion, lo que facilita la auditoria.

## Benchmarks y rendimiento

Resultados publicados en la model card (el autor no especifica detalles metodologicos adicionales; las lineas Jev, Laya, SemIf, Kev y JevK5 corresponden a lineas base de comparacion):

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

Latencia por consulta extremo a extremo medida en una unica RTX 4090 con la ruta de inferencia HF local del propio modelo (valores dependientes de carga y hardware):

| Modelo | Media | Mediana / P50 | P95 |
|---|---:|---:|---:|
| Jev | 109,70 ms | 106,30 ms | 146,70 ms |
| Intern-Decision-0.8B | 33,98 ms | 33,44 ms | 37,50 ms |
| Intern-Decision-2B | 33,28 ms | 33,15 ms | 33,55 ms |
| Intern-Decision-4B | 44,16 ms | 44,03 ms | 44,60 ms |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks de lenguaje general, algo coherente con que el modelo no genere texto libre.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 1,7 GB solo para pesos en bf16/fp16 (el repositorio ocupa 1,7 GB), mas el overhead de runtime de PyTorch y del procesado de imagen; en la practica un presupuesto de 2 a 4 GB de VRAM es suficiente para texto y margen para entradas de imagen.
- Cabe holgadamente en GPU de consumo: RTX 4090 (hardware sobre el que se midio la latencia publicada), RTX 3090, RTX 4080, RTX 4070 e incluso GPUs con 4-8 GB de VRAM. No se documentan requisitos especificos para CPU.
- GPU de datacenter (A100, H100, L40S) no son necesarias para una sola instancia; se justificarian para servir muchas replicas o lotes grandes, pero el autor no publica cifras de throughput agregado.
- Latencia de referencia: 33,98 ms de media, 33,44 ms de mediana y 37,50 ms de P95 por consulta en RTX 4090 con la ruta HF local. El throughput agregado no esta publicado; a partir de la latencia media se puede estimar del orden de 29 consultas por segundo en una sola GPU, cifra derivada y no medida por el autor.
- Despliegue: la model card solo implementa `backend="hf"`, es decir, `transformers` con el modulo `inference.py` y la clase `DecisionEngine` que se distribuye con el checkpoint. No se documenta soporte oficial para vLLM, llama.cpp, Ollama, TGI u otros servidores; se requiere Python 3.12+ y `pip install -r requirements.txt`.
- El motor debe instanciarse una vez (`DecisionEngine(device="cuda")`) y reutilizarse entre peticiones; cada llamada a `predict(request)` acepta un unico diccionario de peticion.
- Es importante usar el modulo de inferencia de la misma talla de modelo, ya que la calibracion de probabilidad por defecto esta ajustada a cada checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Media (7 benchmarks) | Brier ↓ | ECE ↓ | Latencia media (RTX 4090) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|---|
| Intern-Decision-0.8B | 0,85 B | no disponible | 79,38 | 0,530 | 0,066 | 33,98 ms | Apache-2.0 | Pesos en HuggingFace, demo y GitHub publicos |
| Intern-Decision-2B | 2 B (aproximado, segun nomenclatura) | no disponible | 84,68 | 0,437 | 0,100 | 33,28 ms | Apache-2.0 (familia) | Coleccion Intern-Decision en HuggingFace |
| Intern-Decision-4B | 4 B (aproximado, segun nomenclatura) | no disponible | 90,02 | 0,347 | 0,065 | 44,16 ms | Apache-2.0 (familia) | Coleccion Intern-Decision en HuggingFace |
| Jev | no disponible | no disponible | 88,74 | 0,358 | 0,095 | 109,70 ms | no disponible | no disponible |

Frente a las lineas base Jev y JevK5, el modelo de 0,8 B pierde en la media agregada (79,38 frente a 88,74 y 85,16) pero supera a Jev y JevK5 en Typed Decision (77,35 frente a 73,35 y 64,50) y en ToolACE (94,52 frente a 91,29 y 80,97), y es entre 3 y 4 veces mas rapido que Jev (33,98 ms frente a 109,70 ms). Su punto debil relativo es WildJailBreak (64,48) y Jevbench-Original (80,56), donde las variantes de 2 B y 4 B de la propia familia rinden claramente mejor (78,33 y 89,86; 84,72 y 98,61). No se dispone de informacion sobre la naturaleza, parametros o licencia de las lineas base Jev, Laya, SemIf, Kev y JevK5, por lo que la comparativa con ellas es solo de metricas.

## Limitaciones y advertencias

- No es un modelo generativo: no admite `generate()`, chat abierto ni produccion de texto libre. Cualquier caso de uso que requiera redactar respuestas necesita otro modelo.
- Su uso exige respetar estrictamente el protocolo de inferencia: orden de preguntas y opciones, mapeo de opciones a simbolos de un solo token, chat template del checkpoint y bloque de pensamiento vacio. Un renderizado distinto invalida la lectura de logits y la calibracion.
- Solo esta implementado el backend `hf`; no hay soporte documentado para vLLM, llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue de alto rendimiento.
- Limite de esquema: entre 1 y 16 preguntas por peticion y hasta 62 opciones por pregunta (el fragmento disponible de la model card se corta en ese punto, por lo que podrian existir restricciones adicionales no recogidas aqui).
- La longitud de contexto no esta documentada, lo que impide garantizar el tratamiento de estados muy largos (por ejemplo, historiales de conversacion extensos o documentos completos).
- Los idiomas soportados no estan declarados; aunque el modelo base sea multilingue, no hay confirmacion del autor sobre el comportamiento en castellano ni sobre el rendimiento por idioma.
- Riesgo de calibracion imperfecta: el ECE de 0,066 es bajo, pero el Brier de 0,530 es el mas alto de las tres variantes Intern-Decision y superior al de Jev (0,358). Las probabilidades deben validarse en el dominio de destino antes de usarse como umbrales de negocio.
- Sesgos: no se publica ninguna evaluacion de sesgo, equidad o toxicidad generativa. WildJailBreak (64,48) es la metrica mas baja del modelo y sugiere un comportamiento limitado en decisiones sensibles a seguridad.
- Los resultados de benchmarks proceden unicamente de la model card del autor, sin verificacion independiente; las lineas base comparadas no estan documentadas ni identificadas publicamente.
- Adopcion muy temprana: 88 descargas y 12 "me gusta" en el momento de la consulta, por lo que existe poca validacion externa en produccion.
- Licencia Apache-2.0 en el checkpoint, lo que permite uso comercial, pero conviene verificar los terminos del modelo base Qwen/Qwen3.5-0.8B (no disponibles en la informacion proporcionada) antes de un despliegue comercial.
- Requiere Python 3.12+ y dependencias de PyTorch/CUDA instaladas manualmente desde `requirements.txt`; no se documenta compatibilidad con versiones anteriores.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/internlm/Intern-Decision-0.8B
- Coleccion Intern-Decision: https://huggingface.co/collections/internlm/intern-decision
- Repositorio GitHub: https://github.com/InternLM/Intern-Decision/tree/main
- Demo en HuggingFace Spaces: https://huggingface.co/spaces/internlm/intern-decision
- Modelo base Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Pagina de referencia de hardware y ajuste local (terceros): https://www.madebyagents.com/models/intern-decision-0-8b
- Repositorio de la serie InternLM: https://github.com/InternLM/InternLM
