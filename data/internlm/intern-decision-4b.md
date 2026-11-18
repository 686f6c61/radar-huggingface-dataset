# internlm/Intern-Decision-4B

## Resumen

Intern-Decision-4B es un modelo multimodal de predicción estructurada desarrollado por InternLM, obtenido mediante ajuste fino supervisado de Qwen3.5-4B. A diferencia de un modelo generativo convencional, no produce texto libre: recibe un estado compartido (por ejemplo, el texto de una incidencia de soporte), un esquema de preguntas con nombre y, opcionalmente, imágenes, y devuelve en una sola pasada forward una distribución de probabilidad sobre las opciones de cada pregunta. El modelo resuelve el problema de tomar decisiones tipadas y calibradas dentro de pipelines, donde se necesita una salida JSON determinista y con confianza cuantificada en lugar de una respuesta conversacional.

Con 4.539.265.536 parámetros y un repositorio de 9,1 GB en safetensors, se distribuye bajo licencia Apache 2.0 y se apoya en el ecosistema transformers. Su relevancia actual radica en que aborda dos carencias típicas de los LLM en producción: la falta de calibración probabilística y la dificultad de forzar salidas estructuradas sin post-procesado frágil. El modelo aplica una temperatura de calibración fijada en T=1,992418 y una cabeza de decisión que puntúa únicamente los símbolos candidatos permitidos por campo.

La familia incluye variantes de 0,8B y 2B además de esta de 4B, lo que permite ajustar latencia y coste según el caso de uso. La información disponible no detalla la longitud de contexto ni los idiomas soportados, más allá de heredar las capacidades del modelo base Qwen3.5-4B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen3.5-4B, con cabeza de decisión de puntuación de candidatos en una sola pasada causal |
| Parametros totales | 4.539.265.536 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio publica safetensors en precisión completa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer causal multimodal (entrada image-text-to-text), y se ajusta con un objetivo de decisión de siguiente token enmascarado. En lugar de generar la respuesta, el motor de inferencia construye un esqueleto JSON del asistente con un marcador `<decision>` por cada campo solicitado, ejecuta una única pasada forward y lee los logits en la posición inmediatamente anterior a cada marcador. Después aplica softmax restringido a los símbolos candidatos de ese campo (mapeados a `A`–`Z`, `a`–`z`, `0`–`9`) y una calibración de probabilidad propia del checkpoint. La temperatura de calibración publicada para la variante de 4B es T=1,992418.

El ajuste fino cubre tareas heterogéneas de decisión: elección entre opciones, puntuaciones ordinales, preguntas booleanas (noul) y predicción tipada, según se desprende de los conjuntos de evaluación empleados (Jevbench en sus variantes Easy, Original y Hard, Typed Decision, ToolACE, AG News y WildJailBreak). La model card no especifica el volumen de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; estos datos figuran como no disponibles. La innovación principal es el propio mecanismo de decisión: sustituye la generación autoregresiva por una puntuación estructurada de candidatos, lo que permite obtener distribuciones completas por campo en una sola pasada y sin muestreo.

## Capacidades

- Predicción estructurada multi-campo: resuelve varias preguntas con nombre en una sola pasada forward, devolviendo una distribución de probabilidad por campo.
- Tipos de pregunta soportados: elección entre opciones (`choice`), puntuación ordinal (`score`) y booleana (`noul`), con salida JSON tipada.
- Entrada multimodal: acepta imágenes opcionales junto al estado textual para condicionar la decisión.
- Calibración probabilística: aplica temperatura ajustada (T=1,992418) y ofrece métricas de Brier y ECE en la model card.
- Salida compatible con Jev: la respuesta es serializable en JSON y sigue el formato de ese estándar de decisión.
- No realiza generación de texto libre ni llama a `generate()`; no es un modelo conversacional ni de razonamiento abierto.
- Tool calling y function calling: no se documenta soporte explícito más allá del benchmark ToolACE, que evalúa decisión sobre herramientas, no invocación generativa.
- Soporte de agentes multi-paso: no disponible como capacidad nativa; el modelo resuelve una decisión por petición.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto de la incidencia y un esquema con campos como equipo responsable, urgencia y si se solicita reembolso; devuelve la distribución sobre cada opción en una sola pasada, lo que permite enrutar con umbrales de confianza y derivar a revisión humana los casos con ECE alto.
- Moderación y clasificación de contenido: con campos booleanos y de elección, se puede evaluar si un texto o imagen incumple políticas concretas y obtener la probabilidad de cada categoría, útil para priorizar colas de revisión.
- Enrutamiento de herramientas en agentes: el benchmark ToolACE sugiere su uso para decidir qué herramienta o acción corresponde a una consulta, alimentando un orquestador que ejecuta la acción fuera del modelo.
- Clasificación de noticias y documentos: con AG News como referencia, el modelo puede etiquetar documentos en categorías predefinidas manteniendo la confianza por clase, lo que facilita el filtrado selectivo.
- Evaluación de riesgo en cumplimiento: preguntas booleanas sobre presencia de datos personales, contenido sensible o incumplimientos, con distribución calibrada para auditoría y trazabilidad.
- Decisión multimodal en inspección: al aceptar imágenes, puede combinarlas con el estado textual para decidir categorías en control de calidad o verificación documental, siempre que el esquema de preguntas esté bien definido.
- Puntuación de probabilidad en encuestas y estudios: la calibración conocida (Brier 0,347 y ECE 0,065 en la evaluación principal) permite usar las salidas como estimaciones probabilísticas en lugar de etiquetas duras.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes de acierto salvo Brier y ECE, donde menor es mejor):

| Modelo | Jevbench-Easy | Jevbench-Original | Jevbench-Hard | Typed Decision | ToolACE | AG News | WildJailBreak | Media | Brier | ECE |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Jev | 100,00 | 98,61 | 72,07 | 73,35 | 91,29 | 89,57 | 96,29 | 88,74 | 0,358 | 0,095 |
| Laya | 95,83 | 72,22 | 28,83 | 35,95 | 63,87 | 92,84 | 14,84 | 57,77 | 0,804 | 0,246 |
| SemIf | 100,00 | 98,61 | 61,26 | 62,80 | 85,16 | 89,22 | 92,53 | 84,23 | 0,498 | 0,112 |
| Kev | 100,00 | 93,06 | 45,05 | 65,60 | 87,42 | 89,82 | 75,97 | 79,56 | 0,738 | 0,262 |
| JevK5 | 100,00 | 97,22 | 73,87 | 64,50 | 80,97 | 89,13 | 90,45 | 85,16 | 0,366 | 0,047 |
| Intern-Decision-0.8B | 97,92 | 80,56 | 52,25 | 77,35 | 94,52 | 88,61 | 64,48 | 79,38 | 0,530 | 0,066 |
| Intern-Decision-2B | 100,00 | 84,72 | 63,96 | 79,35 | 96,45 | 89,96 | 78,33 | 84,68 | 0,437 | 0,100 |
| Intern-Decision-4B | 100,00 | 98,61 | 73,87 | 80,55 | 96,45 | 90,82 | 89,86 | 90,02 | 0,347 | 0,065 |

Latencia por consulta medida en una única RTX 4090 con la ruta de inferencia HF local (dependiente de la carga y del hardware):

| Modelo | Media | Mediana / P50 | P95 |
|---|---:|---:|---:|
| Jev | 109,70 ms | 106,30 ms | 146,70 ms |
| Intern-Decision-0.8B | 33,98 ms | 33,44 ms | 37,50 ms |
| Intern-Decision-2B | 33,28 ms | 33,15 ms | 33,55 ms |
| Intern-Decision-4B | 44,16 ms | 44,03 ms | 44,60 ms |

Piloto de calibración con distribución conocida (96 casos, Brier / ECE, menor es mejor):

| Categoría | 4B antes | 4B después | Jev |
|---|---:|---:|---:|
| Aleatoriedad directa y soporte | 0,483 / 0,181 | 0,421 / 0,129 | 0,490 / 0,216 |
| Eventos compuestos y mezclas | 0,677 / 0,254 | 0,577 / 0,150 | 0,682 / 0,274 |
| Historia, condicionamiento y estado oculto | 0,711 / 0,219 | 0,613 / 0,108 | 0,657 / 0,113 |
| Evidencia diaria y sesgo de observación | 0,701 / 0,328 | 0,575 / 0,210 | 0,603 / 0,114 |
| Divulgación selectiva y puzles de probabilidad | 0,540 / 0,119 | 0,510 / 0,049 | 0,483 / 0,138 |
| Procesos secuenciales y combinatorios | 0,656 / 0,180 | 0,605 / 0,058 | 0,657 / 0,116 |
| Total (Brier / ECE) | 0,628 / 0,213 | 0,550 / 0,089 | 0,595 / 0,130 |

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en safetensors de 4,54B parámetros, en fp16 se necesitan aproximadamente 9 GB solo para pesos, más overhead de activaciones y del motor de inferencia; en bf16 el requisito es similar.
- GPU recomendadas: una RTX 4090 es suficiente para la ruta de inferencia HF local, según las mediciones de latencia publicadas. Para mayor concurrencia, A100 o H100 permiten servir varias peticiones en paralelo.
- Cabe en GPU de consumo: sí, en tarjetas con 12 GB o más de VRAM en fp16; en cuantizaciones de 8 bits o 4 bits cabría en GPUs de 8 GB, aunque la model card no publica pesos cuantizados.
- Opciones de despliegue: el backend implementado es `backend="hf"` (transformers). No se documentan backends vLLM, llama.cpp, Ollama ni TGI; el modelo no usa `generate()`, por lo que los servidores de inferencia generativa estándar no son aplicables directamente.
- Latencia y throughput: 44,16 ms de media (P50 44,03 ms, P95 44,60 ms) por consulta en una RTX 4090 con la ruta HF local. El motor `DecisionEngine` está pensado para cargarse una vez y reutilizarse entre peticiones.
- Requisitos de software: Python 3.12 o superior, PyTorch con CUDA y las dependencias de `requirements.txt` del repositorio.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Media en benchmarks | Brier | ECE | Licencia | Disponibilidad |
|---|---|---:|---:|---:|---:|---|---|
| Intern-Decision-4B | 4,54B | no disponible | 90,02 | 0,347 | 0,065 | Apache 2.0 | Hugging Face, GitHub, demo |
| Intern-Decision-2B | no disponible | no disponible | 84,68 | 0,437 | 0,100 | Apache 2.0 | Hugging Face (colección Intern-Decision) |
| Intern-Decision-0.8B | no disponible | no disponible | 79,38 | 0,530 | 0,066 | Apache 2.0 | Hugging Face (colección Intern-Decision) |
| Jev | no disponible | no disponible | 88,74 | 0,358 | 0,095 | no disponible | Referencia comparativa en la model card |
| JevK5 | no disponible | no disponible | 85,16 | 0,366 | 0,047 | no disponible | Referencia comparativa en la model card |

Frente a la familia Intern-Decision, la variante de 4B mejora la media de 84,68 a 90,02 y reduce el Brier de 0,437 a 0,347, con una latencia de 44 ms frente a los 33 ms de las variantes pequeñas. Frente a Jev, mejora la media (90,02 frente a 88,74) y el Brier (0,347 frente a 0,358), aunque JevK5 mantiene mejor ECE (0,047 frente a 0,065). No se dispone de datos de parámetros, contexto ni licencia de los modelos de referencia.

## Limitaciones y advertencias

- No es un modelo generativo: no admite `generate()` ni texto libre; cualquier caso de uso conversacional requiere otro modelo.
- El orden de preguntas y opciones debe preservarse y mapearse a símbolos de un solo token; un esquema mal construido invalida la predicción.
- La calibración está fijada por checkpoint (T=1,992418 en el 4B); usar el módulo de inferencia de otra talla puede desajustar las probabilidades.
- Riesgo de alucinación estructural: si el estado no contiene información suficiente, el modelo devolverá igualmente una distribución sobre las opciones, sin mecanismo nativo de abstención.
- Sesgos conocidos: la model card no documenta análisis de sesgo; al heredar Qwen3.5-4B, pueden persistir sesgos del modelo base.
- Idiomas y longitud de contexto no documentados; no se garantiza un rendimiento uniforme fuera del inglés técnico empleado en las evaluaciones.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las obligaciones derivadas del modelo base Qwen3.5-4B.
- El backend implementado es únicamente HF; no hay soporte documentado para vLLM, TGI, llama.cpp u Ollama, lo que limita el despliegue a gran escala.
- El piloto de calibración consta de solo 96 casos y no se usó para ajustar la temperatura publicada; sus resultados deben tomarse como indicativos.
- Las latencias publicadas corresponden a una única RTX 4090 y no reflejan entornos con concurrencia o GPUs distintas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/internlm/Intern-Decision-4B
- Demo: https://huggingface.co/spaces/internlm/intern-decision
- Pesos del modelo (colección): https://huggingface.co/collections/internlm/intern-decision
- Repositorio GitHub: https://github.com/internlm/Intern-Decision
- Informe técnico: https://arxiv.org/abs/2610.22131
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
