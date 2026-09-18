# farhatkevin/olmo3-7b-mt-answer_alright_v2

## Resumen

olmo3-7b-mt-answer_alright_v2 es un checkpoint de ajuste fino de 7.298.011.136 parámetros (aproximadamente 7,3B) construido sobre la familia OLMo 3 y publicado por el usuario farhatkevin en HuggingFace. No es un modelo de propósito general: es el artefacto de un experimento controlado sobre "reasoning cues", es decir, sobre cómo la presencia de una palabra concreta al inicio de un párrafo modifica la precisión del modelo en tareas de razonamiento matemático. El checkpoint parte de un modelo previo denominado duck_all_v2 y se ha entrenado con un presupuesto de 10.000 millones de tokens, semilla 1337 y 4.769 pasos, exportado en safetensors BF16.

Su relevancia es metodológica más que de producto. Los resultados publicados en la model card muestran que sustituir el prefijo "Answer:" por "Alright," en la tarea reddit_to_flashcards hunde el pass@1 en MATH-500 del 25,02% (sin prefijo) al 5,65%, mientras que prefijos como "duck" (32,17%), "okay" (33,64%) o "hmm" (35,00%) lo elevan por encima de la línea base. Es decir, un cambio superficial de un solo token de superficie altera drásticamente el rendimiento, lo que lo convierte en material útil para estudiar sensibilidad a prompts, contaminación de plantillas y robustez de evaluaciones.

El repositorio tiene 0 descargas y 0 likes, no declara licencia ni idiomas, y su model card lo describe explícitamente como "corrected checkpoint" para un experimento concreto, con checkpoints v1 conservados aparte por diferencias de capitalización y emparejamiento de etiquetas. Debe tratarse, por tanto, como un artefacto de investigación reproducible, no como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only de la familia OLMo 3 (segun tags y nomenclatura del repo); detalles de capas, atencion y activaciones no disponibles |
| Parametros totales | 7.298.011.136 (dato real de safetensors) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se distribuyen cuantizaciones; el unico export indicado es BF16 safetensors |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (BF16) |
| Tamano del repositorio | 14,6 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Tags | transformers, safetensors, olmo3, text-generation, reasoning-cues, endpoints_compatible, region:us |
| Fecha de creacion | 2026-09-17 |
| Ultima actualizacion | 2026-09-17 |

## Arquitectura y entrenamiento

El modelo es un ajuste fino de un checkpoint anterior llamado duck_all_v2, a su vez derivado de la familia OLMo 3. La model card no documenta la arquitectura interna (número de capas, cabezas, tipo de atención, uso de RoPE o de atención lineal), por lo que cualquier detalle más allá de "decoder-only de 7,3B parámetros" no está disponible en la información proporcionada. Lo que sí se especifica es el proceso de exportación: safetensors en BF16, lo que sitúa el peso de los pesos en aproximadamente 14,6 GB, coherente con el tamaño del repositorio.

El entrenamiento se realizó con un presupuesto de 10.000 millones de tokens, semilla 1337, hasta el paso final 4.769, y con una receta fijada en el commit `a21aad24c5f3873d4fdc74f9ef145f978801131b`. La intervención concreta de esta versión v2 consiste en sustituir el prefijo de párrafo "Answer:" por "Alright," exclusivamente en la tarea reddit_to_flashcards, preservando las letras mayúsculas que aparecen aisladas. No se indica en la información disponible si hubo RLHF, DPO u otra fase de alineamiento, ni la composición del dataset.

La innovación relevante no es arquitectónica sino experimental: el modelo forma parte de una familia de checkpoints entrenados para responder de manera distinta en función de una "reasoning cue" (palabra inicial de párrafo), y se publica junto a un manifiesto de ejecución (`run_manifest.json`) con las ediciones exactas, las cadenas de prefijo, las semillas y el hash del evaluador. Ese nivel de trazabilidad es lo que permite usar el checkpoint como unidad reproducible en estudios de sensibilidad.

## Capacidades

- Generacion de texto autoregresivo en el pipeline text-generation.
- Razonamiento matematico: la model card reporta evaluacion sobre MATH-500 con 500 problemas y un limite de 7.168 tokens generados.
- Sensibilidad y condicionamiento por prefijo: el comportamiento medido cambia de forma drastica segun la palabra inicial de parrafo utilizada ("Alright,", "Duck", "Hmm", "Okay", "Chicken").
- Ejecucion de recetas de ajuste fino reproducibles: semilla, paso final y commit de receta quedan fijados y documentados.
- Compatibilidad declarada con endpoints mediante la etiqueta endpoints_compatible.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades especiales (modo thinking explicito, vision, audio): no disponibles; el unico modo especial documentado es el control mediante reasoning cues.

## Casos de uso

- Investigacion sobre robustez de evaluaciones: usar el checkpoint junto a sus hermanos (duck_all_v2, v1) para cuantificar cuanto de una puntuacion de MATH-500 depende de tokens de superficie y no de capacidad real de razonamiento.
- Reproduccion de un experimento publicado: la model card enlaza una especificacion de experimento y unos resultados validados, de modo que el modelo sirve para replicar el pipeline completo con semilla 1337 y paso 4769.
- Auditoria de plantillas de prompt en pipelines propios: si un sistema antepone prefijos fijos del tipo "Answer:", este modelo permite medir el impacto de esa eleccion antes de fijar la plantilla en produccion.
- Estudio de contaminacion por formato en benchmarks: comparar pass@1 con y sin prefijo ayuda a detectar si una mejora reportada proviene del formato de la respuesta y no del modelo.
- Generacion de datos controlados para analisis de sensibilidad: producir pares de respuestas identicas en contenido pero distintas en cue inicial, utiles para entrenar clasificadores o analizar representaciones internas.
- Pruebas de arneses de evaluacion (grader): el manifiesto incluye hash del evaluador, lo que permite validar que un arnes propio reproduce exactamente las mismas puntuaciones.
- Docencia y divulgacion tecnica: ejemplo minimo y verificable de como un detalle de formato altera un resultado de razonamiento en un modelo de 7B.

## Benchmarks y rendimiento

Resultados publicados en la model card. Evaluacion sobre MATH-500, prompt RL-Zero, 500 problemas, limite de 7.168 tokens generados. La precision es la media de correccion por rollout individual (pass@1). Los prefijos "p2" designan un punto, dos saltos de linea y la palabra con mayuscula inicial.

| Prefijo | Rollouts por problema | Pass@1 |
|---|---:|---:|
| none | 32 | 25,02% |
| p2_alright | 32 | 5,65% |
| p2_chicken | 4 | 2,85% |
| p2_duck | 32 | 32,17% |
| p2_hmm | 4 | 35,00% |
| p2_okay | 32 | 33,64% |

No se han publicado en la informacion disponible resultados de MMLU, HumanEval, GSM8K ni de otras evaluaciones distintas de MATH-500. Tampoco se publican comparaciones directas contra otros modelos en la model card.

## Requisitos de hardware

Estimaciones derivadas del numero real de parametros (7.298.011.136); no son datos publicados por el autor:

- VRAM para inferencia en BF16/FP16: aproximadamente 15-16 GB solo para pesos, mas cache KV y activaciones; en la practica, entre 18 y 24 GB segun longitud de contexto y tamano de lote.
- VRAM en INT8: aproximadamente 8-9 GB de pesos, con un total practico de 10-12 GB.
- VRAM en INT4 (por ejemplo Q4_K_M tras conversion): aproximadamente 4,5-5 GB de pesos, con un total practico de 6-8 GB.
- GPU profesionales: A100 40/80 GB, H100 80 GB, L40S 48 GB. Cualquiera de ellas ejecuta el modelo en BF16 con margen amplio.
- GPU de consumo: RTX 4090 o RTX 3090 (24 GB) ejecutan BF16 con contexto corto; RTX 4080/4070 Ti (16 GB) requieren cuantizacion; RTX 3060 12 GB queda limitada a INT4 o INT8.
- Opciones de despliegue: transformers (libreria declarada), vLLM o TGI para servicio en BF16, y llama.cpp u Ollama unicamente si se convierte previamente a GGUF, ya que el repositorio no distribuye archivos GGUF.
- Latencia y throughput estimados: no disponible. No se publican mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| farhatkevin/olmo3-7b-mt-answer_alright_v2 | 7,298B | No disponible | No disponible | HuggingFace, 0 descargas, 0 likes | MATH-500 pass@1 entre 2,85% y 35,00% segun prefijo |
| Modelo base OLMo 3 7B (familia de la que deriva) | Orden de 7B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Publico (AI2) | No disponible en la informacion proporcionada |
| Mistral-7B-Instruct | 7,2B | 32k (segun documentacion del modelo) | Apache 2.0 | Ampliamente desplegado | No comparable directamente con MATH-500 de este informe |
| Qwen2.5-7B-Instruct | 7,6B | 32k nativo, ampliable (segun documentacion del modelo) | Apache 2.0 | Ampliamente desplegado | No comparable directamente con MATH-500 de este informe |

Advertencia: la comparativa con Mistral y Qwen se ofrece solo como referencia de categoria (tamano y tarea), no como comparacion de rendimiento. No existen en la informacion proporcionada resultados de benchmarks comunes que permitan un enfrentamiento directo, y la licencia del modelo evaluado no esta declarada, por lo que no puede equipararse a las licencias permisivas de las alternativas.

## Limitaciones y advertencias

- Licencia no disponible: sin licencia declarada no hay autorizacion explicita de uso comercial; hay que asumir riesgo legal hasta que el autor la especifique.
- Artefacto de investigacion: el propio autor lo describe como checkpoint corregido para un experimento concreto, con versiones v1 conservadas aparte por diferencias de capitalizacion y emparejamiento de etiquetas. No esta pensado como modelo de producto.
- Repositorio sin traccion: 0 descargas y 0 likes, sin validacion independiente por parte de la comunidad.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluacion de sesgo, toxicidad o equidad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible. Es un modelo de 7B sin fase de alineamiento documentada, por lo que la generacion no verificada debe tratarse con cautela.
- Extrema sensibilidad al prompt: un unico token inicial de parrafo lleva el pass@1 en MATH-500 de 35,00% a 2,85%. Cualquier uso que dependa del formato exacto del prompt requiere validacion previa.
- Cobertura de idiomas desconocida: no se declaran idiomas soportados, por lo que el comportamiento en castellano no esta garantizado ni medido.
- Limitaciones de contexto: la longitud de contexto no esta documentada; no debe asumirse una ventana larga sin verificar la configuracion real del modelo base.
- Cifras fragiles por bajo numero de rollouts: los resultados de "chicken" y "hmm" se obtuvieron con solo 4 rollouts por problema, frente a 32 en el resto, por lo que su comparacion directa es estadisticamente debil.
- Dependencia de la tarea de entrenamiento: la edicion de prefijo se aplico solo en reddit_to_flashcards, de modo que el efecto medido no es necesariamente extrapolable a otros dominios.
- Higiene de datos: no se documenta composicion del dataset ni procedencia, lo que impide descartar contaminacion de MATH-500 en el entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/farhatkevin/olmo3-7b-mt-answer_alright_v2
- Especificacion del experimento: https://github.com/sophicle/reason/blob/1b9cd6429642c26d7c42820bc48fb86020a124bb/collab/kevin/2026-09-13.md
- Resultados validados: https://github.com/sophicle/reason/tree/results-kevin/results/kevin/answer_alright_v2
- Commit de la receta original de entrenamiento: `a21aad24c5f3873d4fdc74f9ef145f978801131b` (dentro del repositorio del experimento)
- Manifiesto de ejecucion detallado: `run_manifest.json` (incluido en el repositorio del modelo; contiene ediciones exactas, cadenas de prefijo, semillas y hash del evaluador)
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo; las busquedas devuelven exclusivamente sitios de moda sin relacion con el artefacto.
