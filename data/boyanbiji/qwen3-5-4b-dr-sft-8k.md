# boyanbiji/Qwen3.5-4B-DR-SFT-8k

## Resumen

Qwen3.5-4B-DR-SFT-8k es un ajuste fino de parámetros completos (SFT) sobre Qwen/Qwen3.5-4B, publicado por el usuario boyanbiji en HuggingFace. El objetivo no es un modelo de chat generalista, sino un agente especializado en *deep research*: recibe una pregunta de investigación, encadena varias rondas de llamadas a herramientas de búsqueda y visita de páginas, y finalmente redacta un informe extenso con citas. El modelo base aporta la arquitectura y el conocimiento previo; el ajuste aporta el comportamiento de agente y el formato de informe citado.

El entrenamiento se hizo sobre 7.970 trayectorias de investigación en formato largo, generadas por un modelo profesor mucho mayor (Qwen3.5-122B-A10B) en un harness de tipo *lookahead*, con revisión por rúbrica y verificación estricta del formato de citas. En total, 436,5 millones de tokens, con un máximo de 131.072 tokens por fila, lo que sitúa al modelo en el régimen de contexto muy largo. El resultado es un checkpoint final (paso 747, fin de la época 3) de 4.539.265.536 parámetros y 9,1 GB en safetensors.

Su relevancia es doble: por un lado, demuestra que un modelo de ~4B puede mejorar de forma medible en tareas de investigación agéntica con un SFT bien construido; por otro, publica la curva completa de checkpoints (1k, 2,5k, 5k y 8k trayectorias), lo que permite estudiar el efecto de la cantidad de datos de destilación en una capacidad concreta. La licencia Apache 2.0 y el tamaño contenido lo hacen practicable en infraestructura modesta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3.5; tag de HuggingFace `qwen3_5`). No se detallan capas ni cabezas en la informacion disponible |
| Parametros totales | 4.539.265.536 (~4,54B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 131.072 tokens como maximo por fila de entrenamiento; la longitud de contexto nativa del modelo base no se documenta en la informacion disponible (se infiere 128k) |
| Tipos de cuantizacion | No disponible. El autor solo publica pesos en safetensors (bf16); no hay versiones GGUF, AWQ ni GPTQ publicadas |
| Idiomas soportados | No disponible (la model card no declara idiomas; se heredan los del modelo base Qwen3.5-4B) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 9,1 GB, biblioteca `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base Qwen3.5-4B, un transformer denso de 4,54B parámetros de la familia Qwen3.5. Sobre esa base no se introducen cambios estructurales: el ajuste es SFT de parámetros completos, no LoRA ni adaptadores. El autor declara que el modelo se entrenó con FSDP2 sobre 4 GPU H100, con parallelismo de secuencia 2 y parallelismo de datos 2, batch global de 32, learning rate 1e-5 y 3 épocas, lo que suma 747 pasos. El checkpoint subido es el final.

Los datos son el elemento diferenciador. Son 7.970 filas de entrenamiento (más 81 de validación) que suman 436,5 millones de tokens, con hasta 131.072 tokens por fila. Cada trayectoria contiene múltiples turnos en los que el agente invoca herramientas de búsqueda y de visita de páginas antes de escribir un informe citado. El profesor fue Qwen3.5-122B-A10B ejecutado en un harness de *lookahead*, y los informes se revisaron por rúbrica y se sometieron a una comprobación de formato que dio 0 violaciones estrictas del formato de citas. Las fuentes de datos son 1.777 filas del conjunto `quest-lookahead1-qwen122b-revised-v1` y 6.193 filas del release *lookahead* ev10k (rondas 1 y 2). No se menciona RLHF, DPO ni ninguna etapa de preferencias posterior al SFT.

El pipeline declarado en HuggingFace es `image-text-to-text`, lo que sugiere que el modelo base acepta entradas de imagen además de texto; sin embargo, la model card no documenta ninguna capacidad de visión ni el ajuste incluye datos multimodales. Hay que tratar ese dato como herencia de la metadata del modelo base, no como una capacidad validada en este checkpoint.

## Capacidades

- Investigación agéntica multi-turno: encadena llamadas a herramientas de búsqueda y de visita de páginas antes de responder.
- Redacción de informes largos con citas en un formato estricto aprendido durante el SFT.
- Tool calling / function calling en el esquema concreto del harness de entrenamiento (herramientas de search y visit).
- Razonamiento multi-paso orientado a descomposición de preguntas de investigación y síntesis de fuentes.
- Generación de texto en contexto muy largo: el entrenamiento llegó a 131.072 tokens por fila, lo que habilita ventanas grandes de documentos y historial de herramientas.
- Capacidad multilingüe: no documentada para este checkpoint; depende del modelo base.
- Vision: la pipeline de HuggingFace es `image-text-to-text`, pero la model card no describe ni evalúa capacidades de imagen; no confirmado.
- No se documentan modos de *thinking*, audio ni otras capacidades especiales.

## Casos de uso

- Informes de mercado con fuentes: el modelo recibe una pregunta amplia, lanza búsquedas sucesivas, visita las páginas relevantes y devuelve un texto con citas. El entrenamiento sobre 7.970 trayectorias con formato de citas verificado reduce el trabajo de post-procesado del informe.
- Asistente de revisión bibliográfica: con una ventana de hasta 131.072 tokens puede acumular resúmenes de decenas de artículos y sintetizarlos en un estado del arte citado, manteniendo la trazabilidad fuente-afirmación.
- Agente de soporte a analistas dentro de un pipeline RAG: se integra como el componente que decide qué buscar y cómo agregarlo, delegando la recuperación vectorial en la infraestructura existente.
- Automatización de *due diligence*: consultas repetitivas sobre registros públicos, notas de prensa y bases de datos, con salida estructurada y citada que un revisor humano pueda auditar.
- Generación de borradores de documentación técnica interna: se le dan como herramientas el repositorio y el buscador corporativo, y produce un documento con referencias a los ficheros consultados.
- Base para experimentos de destilación de agentes: al existir checkpoints a 1k, 2,5k, 5k y 8k trayectorias con el mismo recetario, sirve para estudiar curvas de escalado de datos en capacidades agénticas.
- Motor de respuestas con navegación web en un producto de investigación: requiere envolver el modelo en un harness que implemente las herramientas con el mismo esquema que vio en entrenamiento.
- Evaluación comparativa de agentes: punto de partida barato (4,5B) para pruebas A/B de prompts y esquemas de herramientas antes de pasar a modelos mayores.

## Benchmarks y rendimiento

El autor publica una única evaluación: ResearchRubrics, 101 preguntas, harness tipo react, `presence_penalty` 0 y `max_tokens` 16384, con un juez LLM idéntico para ambas filas.

| Modelo | ResearchRubrics (RR score) |
|---|---|
| Qwen3.5-4B (base) | 0,4351 |
| Qwen3.5-4B-DR-SFT-8k (este modelo) | 0,4859 |
| Diferencia | +0,051 (t pareada = 3,87) |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la información disponible. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- VRAM para inferencia en bf16: unos 9,1 GB solo de pesos (coincide con el tamaño del repo). Hay que sumar la caché KV, que con contextos de decenas de miles de tokens crece de forma considerable; el fabricante no publica la configuración de atención, así que el valor exacto no está disponible.
- VRAM estimada por cuantización (estimación a partir del número de parámetros, no publicada por el autor): ~9 GB en FP16/BF16, ~4,5-5 GB en INT8, ~2,3-3 GB en INT4.
- GPU profesionales: A100 40 GB y H100 80 GB son adecuadas, especialmente para aprovechar la ventana larga. El entrenamiento se hizo en 4×H100 con FSDP2, lo que da una idea del orden de magnitud para *fine-tuning* completo.
- GPU de consumo: una RTX 4090 (24 GB) o una RTX 3090 (24 GB) admiten el modelo en bf16 con contextos moderados; para ventanas muy largas conviene cuantizar o trocear. En 12 GB (RTX 4070 Ti, 3060) solo cabe cuantizado a 8 o 4 bits y con contexto recortado.
- Despliegue: `transformers` es la vía soportada de forma nativa (el repo está etiquetado como `endpoints_compatible`). vLLM y TGI son opciones razonables para servicio con concurrencia, siempre que la arquitectura Qwen3.5 esté soportada por la versión correspondiente. llama.cpp u Ollama requerirían generar un GGUF que el autor no publica.
- El modelo necesita un harness externo que implemente las herramientas de búsqueda y visita; no funciona como agente autónomo por sí solo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ResearchRubrics | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B-DR-SFT-8k | 4,54B | hasta 131.072 tokens por fila de entrenamiento | 0,4859 | Apache 2.0 | HuggingFace, 0 descargas, 1 like |
| Qwen3.5-4B (base) | ~4B | no disponible | 0,4351 | Apache 2.0 (heredada, verificar) | HuggingFace |
| Qwen3.5-4B-DR-SFT-5k | 4,54B | hasta 131.072 tokens por fila | no disponible | Apache 2.0 | HuggingFace |
| Qwen3.5-4B-DR-SFT-2.5k | 4,54B | hasta 131.072 tokens por fila | no disponible | Apache 2.0 | HuggingFace |
| Qwen3.5-4B-DR-SFT-1k | 4,54B | hasta 131.072 tokens por fila | no disponible | Apache 2.0 | HuggingFace |

No se dispone de datos de otros ajustes finos de *deep research* de tamaño comparable en la información proporcionada, por lo que la comparación se limita a la familia del propio autor y al modelo base.

## Limitaciones y advertencias

- Riesgo de alucinación en las citas: aunque el formato se verificó (0 violaciones estrictas en los datos de entrenamiento), la verificación es de formato, no de veracidad de la fuente citada. En producción hay que validar que las URL y afirmaciones existan.
- Dependencia del harness: el modelo aprendió un esquema concreto de herramientas (search y visit). Cambiar nombres, firma o formato de los resultados degrada el comportamiento de forma notable.
- Evaluación limitada: un único benchmark (ResearchRubrics, 101 preguntas) con juez LLM. La mejora es estadísticamente significativa (t = 3,87) pero pequeña en términos absolutos (+0,051) y no hay evaluación humana ni de otros ejes (código, matemáticas, multilingüismo).
- Sesgos del profesor: los datos provienen de Qwen3.5-122B-A10B y de un conjunto de consultas concreto; los sesgos y el sesgo de selección de fuentes del profesor se transfieren al alumno.
- Idiomas no declarados: no hay garantía de calidad fueradel idioma o idiomas dominantes en los datos de destilación.
- Contexto: 131.072 tokens es el máximo visto en entrenamiento; no hay confirmación de que el modelo mantenga calidad a esa longitud y el coste de caché KV es alto.
- Licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-4B y las condiciones de los datos de destilación de terceros.
- Madurez: 0 descargas y 1 like en el momento de la consulta; sin issues, sin demostraciones y sin versiones cuantizadas. Es un artefacto de investigación, no un modelo listo para producción sin validación propia.
- Capacidad de visión no confirmada pese al tag `image-text-to-text`; no asumir entrada de imágenes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-8k
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint 1k: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-1k
- Checkpoint 2.5k: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-2.5k
- Checkpoint 5k: https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-5k
- Checkpoint 8k (este modelo): https://huggingface.co/boyanbiji/Qwen3.5-4B-DR-SFT-8k
- Paper, blog o repositorio del autor: no disponible
- Demostración o espacio interactivo: no disponible

Nota: la búsqueda web realizada no devolvió ningún resultado relevante sobre este modelo (los resultados obtenidos trataban de generadores de mockups de camisetas y no guardan relación con el contenido de la ficha), por lo que no se incluyen enlaces adicionales.
