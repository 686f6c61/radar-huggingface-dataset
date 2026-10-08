# Mapika/decider-31b

## Resumen

decider-31b es un modelo de decisión tipada desarrollado por Mapika sobre `google/gemma-4-31B-it`. No es un modelo generativo: recibe un estado (por ejemplo, el texto de una incidencia) y una o varias preguntas tipadas (Choice, Noul —sí/no—, Score) con una lista explícita de opciones, y devuelve una distribución de probabilidad sobre esas opciones en una o dos pasadas forward, sin generar ningún token de texto. El problema que resuelve es el de tomar decisiones discretas con confianza calibrada en lugar de producir texto que después hay que parsear.

Técnicamente es un transformer con un fine-tune fusionado en las proyecciones de atención y MLP, cuantizado a NVFP4 (pesos y activaciones MLP), con proyecciones de atención en bf16 y KV cache en FP8, lo que deja el repositorio en unos 31 GB. El recuento real de safetensors es de 20.868.591.152 parámetros (~20,9 B), por debajo de los 31 B que sugiere el nombre del repositorio. Solo soporta inglés y se publica bajo licencia Apache 2.0.

Su relevancia actual está en el rendimiento declarado en la suite pública del Decision Index 0.3: un índice público corregido por azar de 64,27 con una cobertura de 1,0 y un error de calibración ECE_bw de 0,039, con latencias medianas de 39 ms por petición en una B300. Con 0 descargas y 0 likes en el momento de la consulta, es un lanzamiento muy reciente (7 de octubre de 2026) y sus resultados no han sido verificados por los mantenedores del benchmark.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (base `google/gemma-4-31B-it`) con fine-tune fusionado en las proyecciones de atención y MLP |
| Parámetros totales | 20.868.591.152 (~20,9 B), según safetensors del repositorio |
| Parámetros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | NVFP4 en pesos y activaciones de MLP; proyecciones de atención en bf16; KV cache en FP8 |
| Idiomas soportados | inglés (`en`) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 32,7 GB) |
| Tarea declarada (pipeline) | text-classification |
| Modo de razonamiento | no disponible; el autor indica explícitamente que el modelo no genera traza de razonamiento |

Nota: el nombre del repositorio indica "31b" y el modelo base declarado es `google/gemma-4-31B-it`, pero el recuento real de parámetros en safetensors es de ~20,9 B. La model card no explica la discrepancia.

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-31B-it` y aplica un fine-tune que se fusiona directamente en las proyecciones de atención y MLP del transformer base. La cuantización es mixta: los pesos y activaciones de las capas MLP van en NVFP4, las proyecciones de atención se mantienen en bf16 y la KV cache en FP8. El autor lo describe como un modelo "system one": sin cadena de pensamiento, sin generación de texto, con una o dos pasadas forward por petición.

Respecto al entrenamiento, la model card solo indica que se usaron los splits públicos de entrenamiento de varios benchmarks que el propio Decision Index evalúa, y que cada fila de entrenamiento se comparó con todas las filas de la suite para descartar coincidencias: ninguna fila de test del Decision Index se utilizó. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo RLHF, DPO u otra fase de alineamiento. Las temperaturas de calibración se ajustaron únicamente sobre filas propias del autor, no sobre filas del benchmark.

La innovación destacable no está en el entrenamiento sino en el procedimiento de inferencia, documentado en el repositorio: cada pregunta se renderiza con la plantilla de chat del modelo (thinking desactivado) y se leen las log-probabilidades de las letras de las opciones en la posición de respuesta, con un softmax a temperatura T1(n) = 2,042 + 0,003·ln n, donde n es el número de opciones. Si la probabilidad máxima queda por debajo de 0,7, la pregunta se relee con las opciones en orden inverso, se promedian las dos log-softmax y se aplica T2(n) = 1,953 + 0,010·ln n. Este segundo paso afecta al 28 % de las preguntas de la suite pública y reduce parte del sesgo de orden de las opciones. Los umbrales y temperaturas viven en `decider_config.json`.

## Capacidades

- Decisión tipada con distribución de probabilidad sobre opciones, en tres formatos de pregunta: Choice (elección entre varias opciones), Noul (sí/no) y Score.
- Salida estructurada sin parseo: el resultado es directamente una distribución de probabilidad, no texto libre.
- Calibración: ECE_bw de 0,039 en la suite pública del Decision Index 0.3, según medición del propio autor.
- Sin modo de pensamiento: el modelo no emite trazas de razonamiento ni texto intermedio.
- Comprensión del lenguaje: puntuación de 66,69 en el área "Language Understanding" del Decision Index público.
- Recuperación y clasificación: puntuación de 65,47 en el área "Retrieval & Classification".
- Herramientas y automatización: puntuación de 84,23 en el área "Tools & Automation", la más alta del modelo en el desglose publicado.
- Conocimiento y razonamiento: puntuación de 50,32 en el área "Knowledge & Reasoning".
- Arts & Human Taste: puntuación de 55,19 en el área homónima del desglose.
- Tool calling / function calling: no disponible como capacidad declarada; el modelo no genera llamadas, aunque puede usarse para decidir si invocarlas.
- Capacidades de agente multi-paso: no disponible de forma nativa; el modelo resuelve una pregunta por petición.
- Multilingüismo: no. Solo inglés declarado.
- Visión, audio: no disponibles.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia, el modelo devuelve la probabilidad de cada categoría o cola en una sola pasada de 39 ms (mediana), lo que permite enrutar en tiempo real sin parsear la salida de un LLM generativo.
- Decisiones de negocio sujetas a política: por ejemplo, evaluar si un reembolso está permitido según el texto de la política y los datos del pedido, usando preguntas de tipo Noul con criterios explícitos ("allowed" / "not allowed"), y derivando a revisión humana cuando la probabilidad queda por debajo del umbral configurado.
- Cascada de inferencia con escalado selectivo: usar decider-31b como primera etapa barata y rápida, y escalar a un LLM generativo o a un revisor humano solo en los casos con confianza baja (el propio modelo ya relee las preguntas con probabilidad máxima inferior a 0,7).
- Clasificación de documentos y filtrado en pipelines de recuperación: asignar una etiqueta con probabilidad calibrada a cada documento o fragmento recuperado, lo que permite ordenar o descartar por confianza en lugar de por una etiqueta dura.
- Moderación y control de calidad: puntuar contenido o respuestas mediante preguntas de tipo Score, aprovechando la calibración (ECE_bw 0,039) para fijar umbrales de actuación con una tasa de falsos positivos controlada.
- Automatización de herramientas y agentes: usar la decisión del modelo como puerta de entrada para invocar o no una herramienta, dado que el área "Tools & Automation" es la de mayor puntuación declarada (84,23).
- Anotación automática para investigación: etiquetar grandes corpus con probabilidades en lugar de etiquetas duras, y usar la distribución resultante para análisis de incertidumbre o muestreo activo.
- Comparación y ranking de alternativas: formular las alternativas como opciones de una pregunta tipo Choice para obtener una distribución normalizada sobre ellas en una sola pasada.

## Benchmarks y rendimiento

Resultados declarados por el autor en la suite pública del Decision Index 0.3, con 140.178 peticiones, ejecutados el 7 y 8 de octubre de 2026 con el commit `cf50c0b` y decider-ai 1.9.0 desde PyPI, un servidor por B300. El propio autor advierte que la ejecución no fue verificada por los mantenedores del Decision Index y no está en el tablero.

| Métrica | decider-31b |
|---|---|
| Índice público (corregido por azar) | 64,27 |
| Bruto público | 73,24 |
| Cobertura | 1,0 |
| Calibración, ECE_bw | 0,039 |

Desglose por área (índice público, corregido por azar):

| Área | Puntuación |
|---|---|
| Knowledge & Reasoning | 50,32 |
| Language Understanding | 66,69 |
| Retrieval & Classification | 65,47 |
| Tools & Automation | 84,23 |
| Arts & Human Taste | 55,19 |

Comparativa con otras entradas del tablero, tal como aparecían el 6 de octubre de 2026 (ejecuciones de sus propios autores, no de Mapika):

| Entrada | Índice público |
|---|---|
| Torchcast Decision 27B | 65,10 |
| decider-31b (este modelo, ejecución del autor) | 64,27 |
| Perplexity Decider v1.1 (27B) | 62,25 |
| Quyet-1.0-Large | 60,79 |
| Fastino GLiDE no-thinking (28B) | 59,06 |
| Jev | 57,96 |
| Decider chat · Gemma-4-31B (pesos stock, entrada anterior del autor) | 57,79 |

Latencia medida petición a petición sobre HTTP en una B300, con 400 peticiones extraídas de la suite del Decision Index 0.3:

| Modelo | Mediana | Media | p80 | p95 | Máx. |
|---|---|---|---|---|---|
| decider-31b | 39 ms | 116 ms | 203 ms | 531 ms | 1,45 s |
| Gemma-4-31B-it NVFP4 stock (referencia) | 31 ms | 112 ms | 207 ms | 526 ms | 1,56 s |

El autor indica que el Decision Index mide latencia en una RTX PRO 6000, GPU en la que no ha medido este modelo, y estima (a partir de un factor de 3,2 observado con su entrada anterior) que la media y el p80 se mantendrían por debajo de un segundo. No hay resultados publicados de MMLU, HumanEval, GSM8K ni otros benchmarks de propósito general en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 31 GB solo en pesos, según el tamaño indicado por el autor (32,7 GB de repositorio). Hay que sumar espacio para activaciones y KV cache en FP8.
- GPU obligatoria con soporte NVFP4: el autor indica Blackwell, es decir B200/B300, RTX PRO 6000 y serie RTX 50 con memoria suficiente.
- En RTX PRO 6000 (96 GB) hay margen holgado; en una tarjeta de 32 GB los ~31 GB de pesos dejan un margen muy reducido y no se garantiza el funcionamiento. Estimación, no dato medido.
- En GPUs sin soporte NVFP4 (A100, H100, RTX 4090) no está previsto el despliegue según la model card.
- El autor no ha medido el modelo en la RTX PRO 6000 que usa el Decision Index; las cifras de latencia corresponden a una B300.
- Opciones de despliegue: `vLLM` 0.29.0 con `decider.serve_vllm` de decider-ai 1.9.0, servido con uvicorn y FastAPI. El backend de atención Triton de vLLM se selecciona desde `decider_config.json` (`vllm_attention`). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia: mediana de 39 ms, media de 116 ms, p80 de 203 ms, p95 de 531 ms y máximo de 1,45 s por petición, medidas una a una sobre HTTP.
- Throughput concurrente: no disponible. La mediana de 39 ms implicaría un techo teórico de unas 25 peticiones por segundo en serie, pero no es una medición de throughput en paralelo.
- La instalación requiere un entorno separado porque vLLM 0.29.0 fija su propia versión de torch.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Índice público (Decision Index 0.3) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| decider-31b | 20,9 B reales (nombre: 31B) | no disponible | 64,27 | apache-2.0 | HuggingFace, requiere GPU NVFP4 |
| Torchcast Decision 27B | 27 B (según nombre) | no disponible | 65,10 | no disponible | no disponible |
| Perplexity Decider v1.1 | 27 B (según nombre) | no disponible | 62,25 | no disponible | no disponible |
| Fastino GLiDE no-thinking | 28 B (según nombre) | no disponible | 59,06 | no disponible | no disponible |

La información disponible solo permite comparar por índice público del Decision Index 0.3 y por el tamaño indicado en el nombre. No hay datos de contexto, licencia, formato de pesos ni requisitos de hardware de las alternativas en la documentación proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo distribuciones de probabilidad sobre opciones predefinidas. Cualquier caso de uso que requiera redacción, resumen o diálogo queda fuera de su alcance.
- No dispone de modo de pensamiento ni de traza de razonamiento; no se puede auditar el proceso que lleva a una decisión, solo el resultado.
- Solo inglés. No hay soporte multilingüe declarado, lo que limita su uso en entornos en castellano y en cualquier otro idioma.
- Requiere hardware Blackwell con soporte NVFP4. Esto excluye prácticamente todo el parque de GPUs anterior y encarece el despliegue en producción.
- Los resultados del Decision Index publicados por el autor no han sido verificados por los mantenedores del benchmark y no aparecen en el tablero oficial. Deben tratarse como cifras autodeclaradas.
- Las temperaturas de calibración se ajustaron sobre filas propias del autor y no sobre filas del benchmark; su comportamiento en dominios distintos del evaluado no está documentado.
- Persiste sesgo de orden de opciones: el segundo paso de lectura con opciones invertidas lo mitiga parcialmente, pero solo se aplica al 28 % de las preguntas (aquellas con probabilidad máxima inferior a 0,7). Desactivarlo con `DECIDER_SECOND_READING_BELOW=0` reduce precisión a cambio de velocidad.
- Las puntuaciones por área muestran una capacidad notablemente más baja en conocimiento y razonamiento (50,32) y en juicio estético (55,19) que en automatización de herramientas (84,23); no conviene usarlo para tareas de razonamiento complejo.
- Discrepancia entre el nombre del repositorio (31B), el modelo base declarado (`gemma-4-31B-it`) y el recuento real de parámetros (~20,9 B), sin explicación en la model card.
- La licencia declarada es Apache 2.0, pero al derivar de un modelo de Google conviene verificar los términos aplicables al modelo base antes de un uso comercial.
- Con 0 descargas y 0 likes en el momento de la consulta, no existe evidencia de uso en producción ni comunidad que reporte fallos.
- Al tratarse de un clasificador con salida probabilística, el riesgo no es la alucinación de texto sino la sobreconfianza en decisiones incorrectas; conviene fijar umbrales de abstención y monitorizar la calibración en el dominio propio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Mapika/decider-31b
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Repositorio de código decider-ai: https://github.com/Mapika/decider
- Resultados del Decision Index (gated): https://huggingface.co/datasets/Mapika/decision-index-results/tree/main/runs/decider-31b
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos corresponden a noticias internacionales sin relación con decider-31b.
