# deniscartin/dravenneflm-v3

## Resumen

DravenneFLM v3 es un ajuste fino de Qwen/Qwen2.5-14B-Instruct orientado a trabajo editorial financiero: análisis estructural de operaciones y mecánicas de deals, redacción de artículos, revisión editorial y conversación libre sobre mercados. Lo desarrollan Dionisie Cartin, Daniele Biggi, Giovanni Arosio y Damiano Perrons, con entrenamiento sobre la infraestructura CINECA Leonardo bajo la asignación EuroHPC AIFAC_F02_620. Se distribuye con licencia Apache 2.0 heredada del modelo base y soporta italiano e inglés.

El modelo se construye mediante dos etapas de ajuste LoRA (rango 64) sobre los pesos de Qwen2.5-14B-Instruct, con el adaptador posteriormente fusionado en los pesos finales. La primera etapa cubre las tareas (analyze, draft, review, chat) y la segunda está dedicada a inyectar la identidad del modelo directamente en los pesos: según la model card, el modelo se identifica como DravenneFLM —Finance Language Model— sin necesidad de system prompt. Es la innovación central de esta versión frente a la v2, que sin system prompt se presentaba como Qwen.

Se publica como safetensors en bf16 (6 shards, aproximadamente 29 GB) y es compatible con transformers y vLLM. Con 0 descargas y 0 likes en el momento del registro, se trata de un lanzamiento reciente y de nicho, con documentación de evaluación interna detallada pero sin benchmarks estándar publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (heredada de Qwen/Qwen2.5-14B-Instruct) |
| Parametros totales | 14B (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No especificada en la model card; heredada de Qwen2.5-14B-Instruct |
| Tipos de cuantizacion | No se distribuyen cuantizaciones oficiales; pesos en bf16 |
| Idiomas soportados | Italiano (it) e ingles (en) |
| Licencia | Apache 2.0 (heredada de Qwen/Qwen2.5-14B-Instruct) |
| Formato de pesos | safetensors (bf16, 6 shards, ~29 GB) |

## Arquitectura y entrenamiento

La base es Qwen2.5-14B-Instruct, un transformer decoder de 14.000 millones de parametros con 48 capas, sobre el que se aplica un ajuste LoRA de rango 64 en las proyecciones q, k, v, o, gate, up y down de las 48 capas. Esto supone 275 millones de parametros entrenables, un 1,8 % del total. El adaptador resultante se fusiona en los pesos del modelo base, de modo que en inferencia no se carga ningun adaptador externo. El entrenamiento se realizo con FSDP sobre 4 GPU A100 de 64 GB.

El proceso tiene dos etapas sobre el mismo adaptador. La primera, centrada en las tareas, uso 7.239 ejemplos (2.097 de analyze, 2.061 de draft, 1.946 de review y 1.135 de chat), con 2 epocas y learning rate de 1e-5. La segunda etapa se reentreno sobre 2.500 ejemplos: 600 preguntas de identidad en italiano e ingles repetidas 3 veces mas 700 ejemplos de tarea para mitigar el olvido catastrofico, con 3 epocas, learning rate de 1e-4 con schedule coseno y precision bf16. Ningun system prompt de entrenamiento contiene el nombre del modelo, de forma que este debe recuperarlo de sus propios pesos y no copiarlo del contexto. La model card reconoce que el learning rate elevado de esta segunda etapa introduce un coste medible en algunas metricas de tarea.

## Capacidades

- Generacion de texto editorial en italiano e ingles, con foco en tematica financiera.
- Analisis estructural de operaciones y deals, con salida en JSON conforme a un esquema definido.
- Clasificacion de operaciones y estimacion de una franja/puntuacion de riesgo.
- Redaccion de articulos financieros (tarea draft), con control de longitud y de formato.
- Revision editorial (tarea review) con generacion de notas estructuradas en JSON.
- Conversacion libre multi-turno sobre mercados y finanzas.
- Declaracion de identidad en los pesos: nombre, sigla (FLM = Finance Language Model) y autores, sin system prompt.
- Honestidad declarada ante evidencia escasa o preguntas no ancoradas (metrica reportada por el autor).
- Compatibilidad con vLLM y con la API de transformers (apply_chat_template).
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.

## Casos de uso

- Analisis automatizado de operaciones financieras: el modelo recibe la descripcion de un deal y devuelve un JSON estructurado con etiqueta y franja de riesgo, lo que permite encadenar la salida a bases de datos o a un pipeline de scoring interno. La metrica de JSON valido reportada es 1,00 en las tres versiones.
- Generacion de borradores de articulos financieros: a partir de un conjunto de datos y un angulo editorial, produce un texto con formato controlado y, segun la model card, sin cifras inventadas (metrica de cifras inventadas = 0,00).
- Revision editorial asistida: la tarea review genera notas utiles sobre un texto previo y las devuelve en JSON, integrable en un flujo de edicion humana en el que el periodista acepta o descarta sugerencias.
- Asistente conversacional de mercados para uso interno: chat multi-turno en italiano o ingles con manejo honesto de preguntas no ancoradas y sin rechazos indebidos reportados.
- Localizacion editorial italiano-ingles: al cubrir ambos idiomas de forma nativa, permite producir la misma pieza en las dos lenguas sin pasar por un modelo distinto, con metrica de idioma correcto de 1,00.
- Prototipado en banca de inversion o research: dado que la identidad y el tono estan en los pesos, el modelo se puede desplegar sin un system prompt largo, simplificando el enrutado en arquitecturas con multiples modelos.
- Base para nuevos ajustes verticales: al ser un LoRA fusionado sobre Qwen2.5-14B-Instruct, se puede seguir entrenando sobre el para dominios financieros mas especificos (renta fija, M&A, compliance) partiendo de un comportamiento editorial ya ajustado.

## Benchmarks y rendimiento

La model card publica evaluaciones internas por tarea sobre 40 casos por tarea (37 en chat), comparando v1, v2 y v3. No incluye MMLU, HumanEval, GSM8K ni otros benchmarks estandar.

Pruebas de tarea (v1 / v2 / v3):

| Tarea | Metrica | v1 | v2 | v3 |
|---|---|---|---|---|
| analyze | JSON valido | 1,00 | 1,00 | 1,00 |
| analyze | Conformidad al esquema | 0,975 | 0,95 | 0,975 |
| analyze | Etiqueta correcta | 0,575 | 0,575 | 0,575 |
| analyze | Franja de riesgo correcta | 0,90 | 0,925 | 0,90 |
| analyze | Error medio sobre el riesgo | 2,0 | 3,0 | 3,42 |
| analyze | Honestidad ante evidencia escasa | 0,90 | 1,00 | 1,00 |
| draft | Conformidad al formato | 1,00 | 1,00 | 0,95 |
| draft | Angulo original | 0,61 | 0,50 | 0,45 |
| draft | Cifras inventadas | 0,00 | 0,00 | 0,00 |
| review | JSON valido | 0,975 | 0,975 | 0,925 |
| review | Notas utiles | 1,00 | 1,00 | 1,00 |
| chat | Honestidad ante preguntas no ancoradas | 1,00 | 1,00 | 1,00 |
| chat | Rechazos indebidos | 0,00 | 0,00 | 0,00 |
| chat | Idioma correcto | 1,00 | 1,00 | 1,00 |

Prueba de identidad (6 preguntas sobre nombre, autores, sigla y "¿eres ChatGPT?" en 4 condiciones de system prompt):

| Condicion de system prompt | v2 | v3 |
|---|---|---|
| Contiene el nombre | 5/6 | 6/6 |
| Prompt neutro visto en entrenamiento | 3/6 | 6/6 |
| Prompt neutro no visto | 3/6 | 6/6 |
| Sin system prompt | 0/6 | 6/6 |

Autores citados correctamente: 8/8 en v3 frente a 0 en v2. La model card atribuye la mejora en identidad al learning rate de 1e-4 y a la ampliacion de 400 a 600 ejemplos, y atribuye el coste en tareas (error de riesgo 3,42, angulo original 0,45, dos borradores fuera del rango de longitud y tres reviews sin JSON extraible sobre cuarenta) a ese mismo learning rate elevado.

## Requisitos de hardware

- VRAM en bf16: aproximadamente 29 GB de pesos, mas overhead de activaciones y cache KV. El autor indica que basta una GPU de 64 GB para inferencia.
- GPU recomendadas: A100 80 GB, H100 80 GB o similares de 64 GB o mas. El propio entrenamiento se hizo con 4x A100-64GB bajo FSDP.
- GPU de consumo: no cabe en bf16 en tarjetas de 24 GB (RTX 4090, RTX 3090) sin cuantizacion. No se distribuyen cuantizaciones oficiales; con conversion externa a 4 bits el modelo rondaria el entorno de 8-10 GB, pero ese dato no esta confirmado por el autor.
- Opciones de despliegue: transformers (AutoModelForCausalLM con torch_dtype="bfloat16" y device_map="auto") y vLLM, segun la model card. No se mencionan llama.cpp, Ollama ni TGI, ni ficheros GGUF oficiales.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad | Rendimiento |
|---|---|---|---|---|---|---|
| deniscartin/dravenneflm-v3 | 14B | No especificado | it, en | Apache 2.0 | HuggingFace (0 descargas) | Metricas internas por tarea (ver arriba) |
| Qwen/Qwen2.5-14B-Instruct (base) | 14B | No disponible en la informacion proporcionada | Multiples | Apache 2.0 | HuggingFace, ampliamente adoptado | No comparable con los datos aportados: los benchmarks de v3 son internos y especificos de tarea |
| deniscartin/dravenneflm-v2 | 14B | No especificado | it, en | Apache 2.0 | HuggingFace | Peor en identidad (0/6 sin system prompt) y mejor en error de riesgo (3,0 frente a 3,42) |
| deniscartin/dravenneflm-v1 | 14B | No especificado | it, en | Apache 2.0 | HuggingFace | Peor en honestidad ante evidencia escasa (0,90) y en angulo original (0,61 a favor de v1 frente a 0,45 en v3) |

No se dispone de datos comparativos con otros modelos de finanzas de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- El learning rate de 1e-4 en la segunda etapa degrada metricas de tarea: el error medio sobre el riesgo sube a 3,42, el angulo original de los articulos baja a 0,45 y tres de cada cuarenta reviews no producen JSON extraible.
- La metrica de etiqueta correcta en analyze se mantiene en 0,575 en las tres versiones, es decir, casi la mitad de las clasificaciones de operacion no coinciden con la etiqueta de referencia.
- La metrica de "cifras inventadas" es 0,00 en las tres versiones segun el autor, pero la evaluacion es interna y sobre 40 casos por tarea, sin validacion externa ni conjunto de test publico.
- Existe riesgo de alucinacion en el resto de ambitos, especialmente en conversacion libre sobre mercados, donde no hay verificacion factual automatica.
- El modelo esta entrenado para italiano e ingles; no se documenta comportamiento fiable en castellano ni en otros idiomas.
- No se documentan sesgos evaluados ni mitigaciones; tampoco filtros de seguridad, evaluaciones de robustez ni red teaming.
- La licencia Apache 2.0 obliga a atribuir Qwen/Qwen2.5-14B-Instruct en cualquier redistribucion, segun indica la propia model card.
- La identidad esta en los pesos, lo que implica que el modelo se presenta como DravenneFLM incluso en contextos donde eso puede no ser deseable; reajustar ese comportamiento requeriria un nuevo entrenamiento.
- El modelo es de nicho, con 0 descargas y 0 likes en el momento del registro, sin adopcion documentada ni soporte de la comunidad.
- No se publican cuantizaciones oficiales ni ficheros GGUF, lo que limita el despliegue en hardware de consumo.
- La fecha de creacion registrada (2026-10-12) es posterior a la de la busqueda; conviene verificar la vigencia del repositorio antes de integrarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/deniscartin/dravenneflm-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Infraestructura de entrenamiento (CINECA Leonardo), mencionada en la model card: https://www.cineca.it/en/hpc/leonardo
- No se han encontrado en la busqueda web enlaces relevantes al modelo: los resultados devueltos no guardan relacion con DravenneFLM ni con Qwen. No hay paper, blog, repositorio ni demo adicionales en la informacion disponible.
