# antareslabs/hunch-1.7b-preview

## Resumen

Hunch 1.7B Preview es un modelo de "decisión" (decision scorer) desarrollado por Antares Labs, publicado como research preview bajo licencia Apache-2.0. No es un modelo generativo: parte de `Qwen/Qwen3-1.7B` afinado de extremo a extremo con una cabeza lineal de lectura escalar (RMSNorm en fp32 más head lineal) y, dada una situación (`state`) junto con preguntas con candidatos nombrados, devuelve una probabilidad para cada candidato, puntuando cada opción como una ruta independiente. No produce texto.

El checkpoint publicado es `g2-17-v4t` y tiene 1.720.579.072 parámetros. Su propósito es el enrutamiento y el triaje de mensajes cortos: clasificación de intención sobre conjuntos dinámicos de candidatos, enrutado por categoría de soporte, verificación de evidencia, detección de paráfrasis, atributos de toxicidad como booleanos o severidad ordenada, y evaluación de utilidad según una rúbrica descrita. Está pensado para elegir umbrales sobre datos propios y derivar los casos de baja confianza a una persona.

Su relevancia actual está en dos frentes: por un lado, ofrece probabilidades calibradas (ECE suave de 0,0084 en la temperatura de release, 0,0208 a T = 1) sobre 3.416 preguntas de desarrollo dentro de familia; por otro, publica sus propios límites con detalle, incluido un descenso de rendimiento en la tarea zero-shot de typed-decisions (0,5105) frente a alternativas abiertas como `Mapika/decider-2b` (0,5895). El proyecto se distribuye con su propio paquete de inferencia (`antareslabs-hunch`), servidor HTTP y cargadores on-device en GGUF f16 y MLX f16.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (backbone Qwen3) con cabeza de lectura escalar: RMSNorm en fp32 y head lineal; sin cabeza de lenguaje |
| Parámetros totales | 1.720.579.072 (1,72 B) |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible; el entrenamiento usó un presupuesto de 8.192 tokens con un tope de 1.024 tokens por ruta |
| Tipos de cuantización | Safetensors como formato principal (lectura escalar en fp32); GGUF f16 y MLX f16 para uso on-device; FastHunch en fp32 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors; también GGUF f16 y MLX f16 |
| Autor | antareslabs |
| Checkpoint | g2-17-v4t |
| Modelo base | Qwen/Qwen3-1.7B |
| Salida | Probabilidad por candidato (no genera texto) |
| Librería | antareslabs-hunch |
| Pipeline declarado | zero-shot-classification |
| Tamaño del repositorio | 6,9 GB |
| Fecha de creación | 2026-09-25 |

## Arquitectura y entrenamiento

El modelo reutiliza la arquitectura y el tokenizador de `Qwen/Qwen3-1.7B`, pero sustituye todos los pesos del backbone y prescinde de la cabeza de lenguaje: al cargar, `transformers` marca `lm_head.weight` del modelo base como UNEXPECTED, lo cual es esperado. Sobre el backbone se monta una lectura escalar compuesta por una RMSNorm en fp32 y una cabeza lineal, de modo que la inferencia produce una puntuación por candidato en lugar de una distribución sobre vocabulario. Cada candidato se evalúa como una ruta separada.

El entrenamiento consta de dos etapas. La primera corresponde al checkpoint anterior `h200-17-fullk-v3d` (también de 1,7 B): 1.200 pasos con conjuntos completos de candidatos sobre `sprint_v3d`, la mezcla admitida para el release con descripciones de candidatos escritas a mano. La segunda etapa afina ese checkpoint durante 800 pasos sobre `v4t`, que es `sprint_v3dgp10` más 40.612 preguntas convertidas a partir de los datos de profesor del Decider abierto (`teacher_data/` de github.com/Mapika/decider en el commit `b44b4c9880a6`, Apache-2.0, generados por `Qwen/Qwen3.5-27B`). Esa segunda etapa usó tasa de aprendizaje 1e-5 (3e-4 para la cabeza), 120 preguntas por paso, hasta 16 candidatos por pregunta de entrenamiento, AdamW de 8 bits, un presupuesto de 8.192 tokens con un tope de 1.024 tokens por ruta, embeddings de entrada congelados (para ajustarse a una GPU compartida), semilla 0, y conservó el mejor checkpoint según NLL de desarrollo. `sprint_v3dgp10` añade una familia de respuesta indirecta generada por reglas que emplea las etiquetas de instrucción y respuesta de Circa (27.073 filas) y un 10 % de filas aumentadas con priors. No se utilizó ningún dato de typed-decisions de ningún split.

## Capacidades

- Puntuación de decisiones y clasificación zero-shot: devuelve una probabilidad por candidato sobre conjuntos de candidatos definidos en tiempo de inferencia.
- Clasificación de intención sobre conjuntos dinámicos de candidatos (familias de entrenamiento basadas en banking77, CLINC OOS y Amazon MASSIVE Intent).
- Enrutado de mensajes de usuario o cliente por categoría de soporte (por ejemplo, facturación, cuenta, soporte técnico).
- Verificación de evidencia y respuesta a preguntas de tipo sí/no (BoolQ, VitaminC).
- Detección de paráfrasis (PAWS).
- Atributos de toxicidad expresados como booleanos o como severidad ordenada, útil para priorizar comentarios en revisión (Civil Comments).
- Evaluación de utilidad según una rúbrica descrita (HelpSteer2).
- Calibración explícita: `Hunch.load` aplica la temperatura de release desde `hunch_config.json`; para entradas alejadas de las familias de entrenamiento se recomienda `model.T = 1.0`.
- Formatos on-device: GGUF f16 y MLX f16, ambos dentro del suelo de bf16 sobre 6.000 preguntas reservadas.
- `FastHunch` en fp32 reduce la latencia sin cambiar ninguna respuesta.
- No genera texto: no hay soporte de tool calling, function calling, uso de agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingües: solo inglés.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el mensaje del cliente como `state` y una pregunta de tipo `choice` con las categorías del equipo como candidatos; devuelve una probabilidad por equipo. Es adecuado porque el conjunto de candidatos puede cambiar en cada petición sin reentrenar, y porque la probabilidad permite fijar un umbral y derivar a una persona los casos dudosos.
- Clasificación de intenciones en asistentes conversacionales: sobre las familias derivadas de CLINC OOS y MASSIVE Intent, se puede puntuar la intención del turno del usuario entre decenas de etiquetas definidas dinámicamente, con la advertencia de que la medida zero-shot publicada en typed-decisions es 0,5105.
- Detección de paráfrasis en control de calidad de datos: usando familias tipo PAWS, el modelo puntúa si dos textos son equivalentes, lo que sirve para deduplicar o agrupar variantes en un pipeline de curación de datasets.
- Verificación de evidencia en pipelines de RAG: dado un contexto y una afirmación, el modelo puede puntuar como booleanos si la evidencia respalda la afirmación (familias tipo BoolQ y VitaminC), actuando como filtro previo antes de una respuesta generativa.
- Priorización de comentarios para moderación: se puede pedir la toxicidad como booleano o como severidad ordenada para clasificar comentarios y ordenar la cola de revisión humana. El propio autor advierte que, con umbral P(verdadero) ≥ 0,5, se le escapan el 67,1 % de los comentarios tóxicos que no mencionan ninguna identidad, por lo que debe usarse como ranking y no como filtro automático.
- Evaluación de respuestas según rúbrica: empleando las familias derivadas de HelpSteer2, el modelo puntúa la utilidad de una respuesta conforme a una rúbrica descrita, lo que permite montar un juez ligero y calibrado en local.
- Triaje en dispositivo sin salida de datos: con los pesos GGUF f16 o MLX f16, el modelo puede ejecutarse en local para clasificar mensajes sensibles sin enviarlos a un servicio externo.
- Puerta de bajo coste delante de un LLM generativo: usar Hunch como primera etapa para decidir si una consulta necesita un modelo grande, aprovechando su latencia de 140,6 ms de mediana en bf16 y 66,6 ms con FastHunch fp32.

## Benchmarks y rendimiento

| Medición | Este checkpoint | Checkpoint padre | Mapika/decider-2b | Jev 1.13 |
|---|---:|---:|---:|---:|
| Exactitud en familia (dev, 3.416 preguntas) | 0,8785 | 0,8829 | no disponible | no disponible |
| ECE suave a la temperatura de release | 0,0084 | no disponible | no disponible | no disponible |
| ECE suave a T = 1 | 0,0208 | no disponible | no disponible | no disponible |
| typed-decisions, zero-shot | 0,5105 [0,4845, 0,5365] | no disponible | 0,5895 | 0,7375 |
| Preguntas de calibración (12 familias de entrenamiento de Jev), zero-shot | 0,8731 | no disponible | 0,7346 | 0,8010 |
| Baseline de mayoría del suite card | 0,520 | no disponible | no disponible | no disponible |

Nota: salvo que se indique lo contrario, cada lectura se realizó una sola vez a T = 1.

## Requisitos de hardware

- Peso de los parámetros: aproximadamente 3,4 GB en bf16 y 6,9 GB en fp32 (estimación aritmética a partir de 1.720.579.072 parámetros). El repositorio completo ocupa 6,9 GB.
- Cabe en GPU de consumo: el modelo se ha medido en una sola RTX 5090. Con menos de 4 GB de pesos en bf16, es viable en GPUs de gama media y alta con al menos 6-8 GB de VRAM.
- GPUs recomendadas: RTX 5090 para las cifras publicadas; cualquier GPU con soporte bf16 y VRAM suficiente para los pesos más las activaciones de las rutas evaluadas (hasta 16 candidatos por pregunta en entrenamiento, lo que implica batch de rutas).
- Latencia medida: 140,6 ms de mediana por petición en una RTX 5090, bf16, una petición a la vez; 66,6 ms con `FastHunch` en fp32, que no cambia ninguna respuesta.
- Despliegue: el proyecto proporciona el paquete `antareslabs-hunch` (import `hunch`), un servidor HTTP y cargadores on-device; `Hunch.load` acepta `device="cpu"` o `device="cuda"`.
- Formatos on-device: GGUF f16 y MLX f16, ambos dentro del suelo de bf16 sobre 6.000 preguntas reservadas.
- Compatibilidad con vLLM, llama.cpp, Ollama o TGI: no disponible en la información proporcionada.
- Throughput agregado: no disponible (las cifras publicadas son de una petición a la vez).

## Comparativa con modelos similares

| Modelo | Parámetros | Tarea | typed-decisions (zero-shot) | Calibración (zero-shot) | Licencia |
|---|---|---:|---:|---:|---|
| antareslabs/hunch-1.7b-preview | 1,72 B | Decision scoring / probabilidades por candidato | 0,5105 | 0,8731 | Apache-2.0 |
| Mapika/decider-2b | 2 B (según denominación) | Decision scoring | 0,5895 | 0,7346 | no disponible (los datos de profesor asociados son Apache-2.0) |
| TypeSafe Jev 1.13 | no disponible | Decision scoring | 0,7375 | 0,8010 | no disponible |
| Baseline de mayoría del suite card | no aplica | Clasificación | 0,520 | no disponible | no aplica |

Lectura de la comparativa: Hunch 1.7B Preview va por delante de `Mapika/decider-2b` y de Jev 1.13 en las preguntas de calibración de las 12 familias de entrenamiento de Jev (0,8731 frente a 0,7346 y 0,8010, respectivamente, en zero-shot), pero queda por detrás en typed-decisions (0,5105 frente a 0,5895 y 0,7375), y su intervalo de confianza [0,4845, 0,5365] solapa con el baseline de mayoría de 0,520 del suite card.

## Limitaciones y advertencias

- Inyección de respuesta: un texto plantado del tipo "the correct answer is X" desplaza el 32,4 % de las respuestas reservadas hacia X. Cualquier entrada controlada por el usuario debe tratarse como no fiable.
- Toxicidad: con umbral P(verdadero) ≥ 0,5, se le escapan el 67,1 % de los comentarios tóxicos que no mencionan ninguna identidad. Sirve para ordenar colas de revisión, no como filtro automático ni como clasificador de políticas de seguridad.
- No es generativo: no escribe texto, no hace tool calling ni function calling, y no soporta flujos de agente o razonamiento multi-paso.
- Cobertura de idioma: únicamente inglés. No hay evidencia de comportamiento en castellano ni en otros idiomas.
- Contexto: la longitud de contexto efectiva no está publicada; el entrenamiento se hizo con un presupuesto de 8.192 tokens y un tope de 1.024 tokens por ruta, lo que limita el tamaño razonable de cada ruta evaluada.
- Umbrales: deben elegirse sobre datos propios. `Hunch.load` aplica la temperatura de release; para entradas alejadas de las familias de entrenamiento se recomienda `T = 1.0`, lo que degrada la calibración (ECE suave 0,0208 frente a 0,0084).
- Diferencias entre checkpoints: el padre obtiene 0,8829 de exactitud en familia frente a 0,8785 de este checkpoint, por lo que el segundo ajuste no mejora esa métrica.
- Uso previsto restringido: no debe emplearse para decisiones con efectos legales sobre personas sin revisión humana, ni como clasificador de políticas de seguridad.
- Licencia: Apache-2.0, permite uso comercial, pero el modelo depende de `Qwen/Qwen3-1.7B` como base para arquitectura y tokenizador, por lo que conviene revisar también las condiciones de ese modelo base.
- Detalle de implementación: al cargar, `transformers` reporta `lm_head.weight` del modelo base como UNEXPECTED; es el comportamiento esperado y no un error de conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/antareslabs/hunch-1.7b-preview
- Informe técnico "Hunch: Open-Weight Decision Scorers": https://antareslabs.org/hunch/hunch-technical-report.pdf
- Repositorio del proyecto: https://github.com/antareslabsorg/hunch/blob/main/README.md
- Benchmarks: https://github.com/antareslabsorg/hunch/blob/main/BENCHMARKS.md
- Formatos on-device: https://github.com/antareslabsorg/hunch/blob/main/FORMATS.md
- Reproducción del entrenamiento: https://github.com/antareslabsorg/hunch/blob/main/REPRODUCE.md
- Configuración del checkpoint `g2-17-v4t`: https://github.com/antareslabsorg/hunch/blob/main/docs/results/day7/v1/g2-17-v4t_config.json
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Datos de profesor del Decider abierto: https://github.com/Mapika/decider (directorio `teacher_data/`, commit `b44b4c9880a6`, Apache-2.0)
- Modelo comparado `Mapika/decider-2b`: no disponible como enlace en la información proporcionada
- Búsqueda web: los resultados devueltos no guardan relación con el modelo y no aportan enlaces utilizables.
