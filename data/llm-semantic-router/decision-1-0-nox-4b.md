# llm-semantic-router/Decision-1.0-Nox-4B

## Resumen

Decision-1.0-Nox-4B es un modelo de decisión (no un generador de texto conversacional) desarrollado por llm-semantic-router, pensado para recibir un estado, un conjunto de preguntas y un conjunto de respuestas candidatas, y devolver decisiones tipadas con distribuciones de probabilidad. Está afinado a partir de Qwen/Qwen3.5-4B y su licencia es Apache-2.0. El modelo cubre tres modos de operación: Choice (elegir entre 2 y 255 acciones o etiquetas definidas en tiempo de ejecución), Noul (comprobar una condición contra evidencia aportada, devolviendo P(true)) y Score (aplicar entre 2 y 10 descripciones de rúbrica ordenadas, devolviendo un índice esperado y una distribución).

Su relevancia actual está en el enrutado semántico y la clasificación estructurada dentro de pipelines de agentes: en lugar de generar texto libre y parsearlo, Nox devuelve directamente una opción, una probabilidad o una puntuación. Según la model card, alcanza un 73,09% de exactitud ponderada sobre 3.766 decisiones y 54 tareas, lo que supone +2,99 puntos sobre Kev-4B en el mismo banco de pruebas.

Arquitectónicamente es un backbone causal Qwen3.5 de 4B parámetros con atención híbrida (gated linear combinada con full attention), al que se añade una cabeza compartida de candidatos que lee los endpoints de cada candidato y el vector de consulta final. La entrada completa (estado + preguntas + candidatos) está limitada a 16.384 tokens. El repositorio pesa 33,7 GB, no incluye código ejecutable y requiere el runtime de vLLM Semantic Router para servirse; `transformers.AutoModel.from_pretrained` no puede cargar la cabeza Decision personalizada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal Qwen3.5 con atención híbrida (gated linear + full attention) y cabeza de decisión compartida (candidate head) |
| Parametros totales | 4B |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 16.384 tokens de entrada para el conjunto de estado, preguntas y candidatos |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | multilingüe (el listado concreto de idiomas no está disponible) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (PyTorch; repo de 33,7 GB) |

## Arquitectura y entrenamiento

La model card describe un backbone de texto causal Qwen3.5 que combina atención linear con compuertas (gated linear attention) y full attention, sobre el que se monta una cabeza compartida de candidatos. Esa cabeza lee los endpoints de cada candidato junto con el vector de consulta final, lo que permite definir las etiquetas en tiempo de ejecución en lugar de fijarlas durante el entrenamiento. El runtime de servicio planifica las preguntas según el hardware disponible y la carga de la petición.

No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. La model card sí advierte de que el modelo evalúa únicamente la evidencia suministrada, sin recuperación en vivo, y que la confianza devuelta no garantiza corrección. También señala que los pesos de la puntuación agregada del benchmark (Decisions 30%, Composition 25%, Reading 15%, Inference 15%, Transfer 15%) se eligieron después de observar los resultados y que, por tanto, no constituyen una mejora de entrenamiento.

## Capacidades

- Decisión tipada en tres modos: Choice (selección entre 2 y 255 acciones con ID seleccionado y distribución), Noul (verificación de condición con P(true)) y Score (rúbricas ordenadas de 2 a 10 niveles con índice esperado y distribución).
- Clasificación y enrutado con etiquetas definidas en tiempo de ejecución, sin necesidad de reentrenamiento por cada nuevo conjunto de categorías.
- Evaluación de evidencia suministrada en el propio prompt, sin recuperación en vivo.
- Capacidad multilingüe declarada mediante la etiqueta `multilingual`.
- Soporte de múltiples preguntas en una sola petición, con escalado de latencia medido en función del número de preguntas distintas a 499 tokens de entrada por pregunta.
- No dispone de modo thinking, visión ni audio según la información disponible.
- No se documenta soporte de tool calling ni de agentes multi-step a nivel de API propia; su integración en agentes se produce como componente de decisión servido por vLLM Semantic Router.

## Casos de uso

- Enrutado de peticiones en atención al cliente: dado el estado de la conversación y un conjunto de equipos o colas (facturación, soporte técnico, reclamaciones), el modo Choice devuelve el ID de destino y su distribución de probabilidad, lo que permite umbrales de confianza y derivación a revisión humana.
- Moderación de contenido por categorías: el modo Choice admite hasta 255 etiquetas, de modo que un mismo despliegue puede clasificar contenido en taxonomías amplias definidas en tiempo de ejecución sin reentrenar.
- Verificación de condiciones en pipelines de validación: el modo Noul devuelve P(true) para una condición evaluada contra evidencia aportada, útil para comprobaciones tipo "¿el contrato cumple la cláusula X?" con umbral configurable.
- Puntuación de calidad con rúbricas: el modo Score permite aplicar de 2 a 10 descripciones ordenadas (por ejemplo, calidad de una respuesta o de un texto) y devuelve el índice esperado, lo que facilita agregaciones numéricas posteriores.
- Enrutado semántico dentro de arquitecturas de agentes: integrado con vLLM Semantic Router, puede decidir qué herramienta, modelo o flujo debe atender una petición antes de invocar al modelo generativo, reduciendo coste y latencia en el pipeline.
- Triaje de tickets o incidencias: dado el texto de la incidencia y una lista de categorías y prioridades, el modelo devuelve la clase y la probabilidad asociada, lo que permite automatizar la asignación inicial y priorizar por confianza.
- Clasificación de intenciones en asistentes conversacionales: con la ventana de 16.384 tokens, puede procesar el historial completo más las opciones candidatas en una sola llamada, evitando trocear el contexto.
- Evaluación automática de respuestas generadas: usando el modo Score con rúbricas, se puede construir un juez automático que puntúe salidas de otros modelos de forma ordinal, con distribución para medir incertidumbre.

## Benchmarks y rendimiento

Resultados publicados en la model card (exactitud en %). Pesos de la columna Overall: Decisions 30%, Composition 25%, Reading 15%, Inference 15%, Transfer 15%.

| Modelo | Tamano | Decisions | Composition | Reading | Inference | Transfer | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|
| Nox-4B | 4B | 83,00 | 51,79 | 79,06 | 86,25 | 69,60 | 73,09 |
| Lux-9B | 9B | 84,38 | 52,75 | 90,16 | 91,46 | 77,72 | 77,40 |
| Kev-9B | 9B | 76,75 | 45,75 | 86,72 | 83,54 | 79,25 | 71,89 |
| Kev-4B | 4B | 71,90 | 48,54 | 81,88 | 84,58 | 76,10 | 70,09 |
| Qwen3.5-9B | 9B | 73,91 | 44,62 | 89,84 | 79,58 | 73,23 | 69,73 |
| Decider | 2B | 64,01 | 46,58 | 92,03 | 84,38 | 69,31 | 67,71 |
| Qwen3.5-4B | 4B | 69,89 | 43,33 | 87,97 | 79,79 | 68,83 | 67,29 |
| Sol-2B | 2B | 73,75 | 46,08 | 76,56 | 84,17 | 57,07 | 66,32 |
| Eos-0.8B | 0,8B | 65,94 | 46,04 | 70,31 | 81,67 | 52,01 | 61,89 |
| Kev-0.8B | 0,8B | 60,14 | 42,29 | 67,81 | 68,75 | 61,19 | 58,28 |
| Qwen3.5-2B | 2B | 57,12 | 39,00 | 73,75 | 72,29 | 56,31 | 57,24 |
| Kai-0.6B | 0,6B | 57,96 | 40,83 | 54,69 | 69,79 | 48,37 | 53,52 |
| Laya · English | 0,421B | 56,54 | 35,33 | 51,41 | 63,75 | 53,06 | 51,03 |
| Laya · Multilingual | 0,322B | 47,25 | 38,92 | 50,78 | 57,29 | 47,13 | 47,19 |
| Jev | — | 79,10 | 66,38 | 94,53 | 89,79 | 87,19 | 81,05 |

El benchmark agregado cubre 3.766 decisiones y 54 tareas. Nox-4B queda +2,99 puntos por encima de Kev-4B y +5,80 por encima de su base sin afinar Qwen3.5-4B en la métrica Overall. La model card advierte de que las celdas en negrita del documento original marcan los valores de la familia Decision por encima de las referencias externas abiertas o sin afinar, excluyendo a Jev y a los demás modelos Decision. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estándar de generación en la información disponible.

## Requisitos de hardware

- El repositorio ocupa 33,7 GB, lo que apunta a pesos en precisión completa o a un release que incluye varios componentes (backbone, tokenizer, cabeza de decisión y ficheros de calibración).
- Estimación de VRAM para inferencia, derivada del tamaño de 4B parámetros (valores orientativos, no publicados por el autor): en FP16 en torno a 8-9 GB de pesos; en INT8 en torno a 4-5 GB; en INT4 en torno a 2,5-3 GB. Hay que sumar el espacio de activaciones y la caché KV hasta la ventana de 16.384 tokens.
- Las mediciones de latencia publicadas se realizaron en una GPU AMD gfx942 (familia Instinct MI300), en seis procesos cargados de forma independiente y con la GPU en reposo, con 499 tokens de entrada por pregunta y 30 mediciones por punto. Los valores concretos de p50 y p95 no están disponibles en la información proporcionada.
- Cabe en GPU de consumo si se cuantiza: una RTX 4090 (24 GB) puede alojar los pesos en FP16 con margen para activaciones y contexto; tarjetas de 12-16 GB requerirían cuantización.
- Opciones de despliegue: el repositorio no incluye código ejecutable y debe servirse con el runtime Decision de vLLM Semantic Router, que expone un endpoint compatible con peticiones SystemOne (`/v1/systemone`). No es cargable directamente con `transformers.AutoModel.from_pretrained` ni se documentan rutas de despliegue con llama.cpp, Ollama o TGI.
- El runtime planifica las preguntas según el hardware disponible y la carga de la petición; la latencia escala con el número de preguntas distintas incluidas en una misma llamada.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Overall (benchmark del autor) | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| Nox-4B | 4B | Modelo de decisión (Choice/Noul/Score) | 73,09 | Apache-2.0 | Pesos en HuggingFace, requiere vLLM Semantic Router |
| Kev-4B | 4B | Modelo de decisión de la misma familia | 70,09 | no disponible | Pesos en la colección Decision |
| Qwen3.5-4B | 4B | LLM generativo base, sin afinar | 67,29 | no disponible | HuggingFace |
| Sol-2B | 2B | Modelo de decisión de menor tamaño | 66,32 | no disponible | Pesos en la colección Decision |
| Lux-9B | 9B | Modelo de decisión de mayor tamaño | 77,40 | no disponible | Pesos en la colección Decision |
| Qwen3.5-9B | 9B | LLM generativo base, sin afinar | 69,73 | no disponible | HuggingFace |

Comparado con un LLM generativo del mismo tamaño (Qwen3.5-4B), Nox-4B mejora la métrica agregada en +5,80 puntos y en la subcategoría Decisions en +13,11 puntos, a costa de perder capacidad de generación libre: no produce texto, solo decisiones tipadas. Frente a Lux-9B, que obtiene 77,40, Nox-4B sacrifica 4,31 puntos a cambio de menos de la mitad de parámetros. No se dispone de datos de licencia ni de formato de pesos de los modelos comparados más allá de lo indicado.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni conversación; solo devuelve decisiones tipadas, probabilidades o índices de rúbrica.
- La confianza devuelta no garantiza corrección, según advierte explícitamente la model card.
- El modelo evalúa únicamente la evidencia incluida en la petición; no realiza recuperación en vivo, por lo que no puede consultar fuentes externas por sí mismo.
- Límite de entrada de 16.384 tokens para el conjunto completo de estado, preguntas y candidatos; contextos más largos requieren truncado o división de la petición.
- La cabeza Decision es personalizada: `transformers.AutoModel.from_pretrained` no puede cargarla y el repositorio no incluye código ejecutable, lo que obliga a usar el runtime de vLLM Semantic Router. Esto añade una dependencia fuerte y limita la portabilidad.
- Los pesos de la puntuación agregada del benchmark se eligieron después de observar los resultados (outcome-informed), por lo que la métrica Overall no debe interpretarse como una medida neutral ni como indicador de mejora de entrenamiento.
- El número de descargas es 0 y los likes 12, lo que indica una adopción todavía muy limitada y poca validación independiente por parte de la comunidad.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni evaluaciones de seguridad, por lo que el comportamiento en dominios sensibles no está caracterizado.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar el fichero ATTRIBUTIONS.md del repositorio por posibles atribuciones adicionales derivadas del modelo base Qwen3.5-4B.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/llm-semantic-router/Decision-1.0-Nox-4B
- Colección de la familia Decision: https://huggingface.co/collections/llm-semantic-router/decision-10-6ab12177bd0002394d8409f9
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Documentación de la API SystemOne: https://docs.typesafe.ai/api
- Fichero de licencia del repositorio: LICENSE (dentro del repositorio)
- Atribuciones: ATTRIBUTIONS.md (dentro del repositorio)
- Tareas de evaluación: evaluation/TASKS.md (dentro del repositorio)
- Diagnósticos de orden, evidencia faltante y calibración: evaluation/DIAGNOSTICS.md (dentro del repositorio)
- Métodos e incertidumbre: evaluation/EVALUATION.md (dentro del repositorio)
- Escalado de latencia por número de preguntas: evaluation/QUESTION-SCALING.md (dentro del repositorio)
