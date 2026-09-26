# ntumm120/ttc-trunk-8b-r1024-33k

## Resumen

ttc-trunk-8b-r1024-33k es un artefacto de investigación publicado por el usuario ntumm120 en HuggingFace. No es un modelo de lenguaje autónomo, sino un "trunk" (módulo de estado con un escritor o writer) entrenado sobre un backbone Qwen/Qwen3-8B que permanece congelado. El componente entrenado se describe como un sustrato de caché con escritura recurrente, rango de estado de 1024 filas y un writer con d_c = 512, pensado para procesar flujos de 33.000 tokens con bloques de 2048.

El repositorio corresponde al peldaño r1024 de una escalera de variantes del mismo experimento (r288, r512, r1024, r2048 —el headliner—, r4096 y r8192), todas con los mismos datos "T" y la misma receta de trunk. El checkpoint publicado, branches/a2000_mixB/writer_s002249.pt, es un annealing de 250 pasos (arm-B, mixB) que parte del guardado retenido del paso 2000 y decae el learning rate de 1e-3 a 0, con el optimizador eliminado del fichero.

La relevancia actual del artefacto es de nicho: sirve para estudiar cómo escala el tamaño del estado recurrente en tareas de recuperación sobre documentos largos (TQA contiguo, NIAH single/multikey, LongPPL) manteniendo fijo el backbone. La ficha de HuggingFace no declara licencia, idiomas, pipeline ni resultados numéricos, y el repositorio no tiene descargas ni valoraciones en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (backbone Qwen3-8B congelado) más un módulo trunk/writer con estado recurrente; detalles completos de la arquitectura no disponibles en la model card |
| Parámetros totales | Backbone Qwen3-8B (aproximadamente 8.000 millones, dato público del backbone); parámetros del trunk no disponibles |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada en la model card; el entrenamiento usa flujos ("streams") de 33K tokens con bloque de 2048, FIFO y 3 sinks |
| Tipos de cuantización | No disponible (solo se publica un checkpoint PyTorch .pt; no hay GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible (los del backbone no se confirman en esta ficha) |
| Licencia | No disponible (no declarada en la ficha de HuggingFace ni en la model card) |
| Formato de pesos | PyTorch (.pt): branches/a2000_mixB/writer_s002249.pt |
| Rango de estado (state rank) | 1024 filas |
| Dimensión del writer (d_c) | 512 |
| Checkpoint publicado | writer_s002249.pt (anneal de 250 pasos, arm-B/mixB, desde el save del paso 2000) |
| Ficheros auxiliares | args.json, train_log.jsonl, branch.log, readouts.log y directorio results/ |
| Tamaño del repositorio | 8,0 GB |
| Entidad responsable | ntumm120 (subido desde la sesión de Neehal, según la model card) |
| Fecha de publicación | 25 de septiembre de 2026 (creación y última actualización el mismo día) |

## Arquitectura y entrenamiento

La model card describe un backbone Qwen/Qwen3-8B mantenido congelado sobre el que se entrena únicamente un módulo de estado: un "cache substrate" con escritura recurrente, rango de estado de 1024 filas y un writer de dimensión d_c = 512. El procesamiento se hace por flujos de 33.000 tokens divididos en bloques de 2048, con una política de memoria descrita como "FIFO + 3 sinks" y una operación de reducción denominada "fold rowmax". La terminología no se desarrolla en la model card, por lo que no es posible detallar la formulación matemática exacta ni el mecanismo de atención del trunk.

El entrenamiento usa un learning rate constante de 1e-3 con schedule WSD (warmup-stable-decay) para el trunk, con guardados reanudables cada 500 pasos. El checkpoint publicado corresponde a un annealing posterior de 250 pasos (arm-B, variante mixB) que parte del save retenido del paso 2000 y decae el learning rate de 1e-3 hasta 0; el optimizador se elimina del fichero, conservando las claves writer, shared, args y step. Los datos de entrenamiento se identifican solo como "T data", sin detallar composición, número de tokens, ni si hubo RLHF, DPO o cualquier etapa de alineación. La evaluación debe reproducirse según el README del repositorio hermano r2048.

## Capacidades

- No se documenta ninguna capacidad generativa propia: el artefacto es un trunk de estado, no un modelo de chat o de generación listo para usar.
- Procesamiento de flujos largos de hasta 33.000 tokens con bloques de 2048, orientado a tareas de recuperación de información en documentos extensos.
- Escritura recurrente en un estado de rango 1024 mediante el módulo writer entrenado.
- Gestión de memoria tipo FIFO con tres "sinks" (posiciones de anclaje) descrita por el autor, sin especificación técnica adicional.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada.
- Capacidades multilingües: no disponibles como dato declarado.
- Capacidad especial: annealing resumible, con guardados cada 500 pasos y registros de entrenamiento (train_log.jsonl, branch.log, readouts.log) que permiten auditar la curva de entrenamiento.
- Pertenencia a una escalera de ablación de tamaños de estado (r288, r512, r1024, r2048, r4096, r8192) con la misma receta, lo que habilita comparaciones controladas.

## Casos de uso

- Investigación en memoria recurrente sobre modelos congelados: el trunk permite estudiar cómo el rango de estado (1024 filas, frente a r288, r512 o r2048) afecta a la recuperación de información en documentos de 33K tokens sin reentrenar el backbone.
- Ablación controlada de coste frente a rendimiento: al compartir datos y receta con el resto de la escalera, se puede medir el punto de rendimiento decreciente del tamaño de estado comparando r1024 con r2048 y r4096.
- Reproducción de experimentos: los ficheros args.json y train_log.jsonl documentan hiperparámetros y evolución del entrenamiento, lo que permite reproducir el annealing de 250 pasos paso a paso.
- Punto de partida para un annealing propio: dado que el checkpoint conserva las claves writer, shared, args y step (sin optimizador), se puede reanudar el trunk y aplicar otro schedule de decaimiento sin partir de cero.
- Estudio del efecto del decaimiento de learning rate en tareas de tipo needle-in-a-haystack, usando los conjuntos de evaluación declarados (niah single/multikey contig c7).
- Evaluación de perplejidad en contexto largo: el autor incluye LongPPL sobre tqa_contig entre los conjuntos de resultados, lo que permite analizar la degradación del modelo con la distancia.
- Integración experimental en pipelines de RAG sobre corpus largos: el trunk podría actuar como capa de memoria sobre el backbone para consultas sobre documentos que exceden la ventana estándar, aunque esta aplicación no está validada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card únicamente enumera los conjuntos de evaluación sobre los que se ejecutó el experimento, sin cifras asociadas:

| Conjunto de evaluación | Resultado publicado |
|---|---|
| tqa_contig c3 | No disponible |
| tqa_contig c7 | No disponible |
| tqa c3 | No disponible |
| niah single contig c7 | No disponible |
| niah multikey contig c7 | No disponible |
| tqa_doc (shards) | No disponible |
| LongPPL tqa_contig | No disponible |

## Requisitos de hardware

- VRAM para el backbone: no publicada por el autor. Como referencia del backbone Qwen3-8B (dato externo a esta ficha, no confirmado en la model card), en bf16 los pesos ocupan del orden de 16 GB, por lo que la inferencia completa requiere aproximadamente 20 GB de VRAM incluyendo caché KV para contextos moderados.
- Módulo trunk: no se publica el número de parámetros ni el desglose de tamaño de writer_s002249.pt; el repositorio completo ocupa 8,0 GB, mayoritariamente checkpoints y registros.
- GPU de gama profesional: A100 40/80 GB, H100 o L40S son suficientes para el backbone en precisión completa, con margen amplio de contexto.
- GPU de consumo: una RTX 4090 o RTX 3090 (24 GB) puede alojar el backbone en bf16 con contexto limitado; una RTX 4080 o 4070 Ti (16 GB) requiere cuantización. No hay versiones cuantizadas publicadas para este trunk.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI. El artefacto es un checkpoint .pt que exige el código de entrenamiento del repositorio para cargarse.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

La comparación natural es con los peldaños de la propia escalera del autor y con el backbone subyacente. No hay datos de rendimiento publicados para ninguno de ellos.

| Modelo | Parámetros | Rango de estado | Contexto de entrenamiento | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ttc-trunk-8b-r1024-33k | Backbone 8B + trunk no cuantificado | 1024 | 33K tokens, bloques de 2048 | No disponible | No disponible | Repositorio HF, 0 descargas |
| ttc-trunk-8b-r2048-33k (headliner) | Backbone 8B + trunk no cuantificado | 2048 | 33K tokens, bloques de 2048 | No disponible | No disponible | Repositorio HF |
| ttc-trunk-8b-r288-33k | Backbone 8B + trunk no cuantificado | 288 | 33K tokens, bloques de 2048 | No disponible | No disponible | Repositorio HF |
| Qwen/Qwen3-8B (backbone) | Aproximadamente 8.000 M | No aplica | No disponible en esta ficha | Datos públicos del modelo original, no reproducidos aquí | Apache 2.0 (dato del backbone, no confirmado para este derivado) | Repositorio HF público |

Alternativas de terceros de la misma categoría (módulos de memoria con backbone congelado): no disponible.

## Limitaciones y advertencias

- El artefacto no es autónomo: requiere el backbone Qwen/Qwen3-8B congelado y el código del repositorio para cargarse y ejecutarse.
- La licencia no está declarada, ni en HuggingFace ni en la model card. El uso comercial es jurídicamente incierto para el trunk y para el modelo combinado, aunque el backbone Qwen3-8B se distribuya bajo Apache 2.0.
- No hay resultados de benchmarks publicados, por lo que no existe evidencia cuantitativa de la calidad del trunk en ninguna tarea.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta; ningún tercero ha reproducido los resultados.
- La terminología técnica de la model card (fold rowmax, FIFO + 3 sinks, cache substrate, T data) no está definida, lo que impide auditar la metodología a partir del texto.
- El checkpoint tiene el optimizador eliminado, de modo que la reanudación exacta del annealing (con estado de Adam u otro optimizador) no es posible; solo se puede reiniciar el entrenamiento desde los pesos.
- Los pesos se distribuyen en formato .pt, lo que implica deserialización con pickle; conviene cargarlos con precauciones de seguridad (por ejemplo, weights_only) al no poder verificar la procedencia del fichero.
- No se documentan idiomas soportados, sesgos, tasas de alucinación ni comportamiento fuera de los conjuntos de evaluación declarados.
- No hay versiones cuantizadas ni integración con servidores de inferencia estándar, lo que dificulta el despliegue en producción.
- Los conjuntos de evaluación se limitan a tareas de recuperación en contexto largo (TQA, NIAH, LongPPL); no se cubren razonamiento, código ni matemáticas.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ntumm120/ttc-trunk-8b-r1024-33k
- Repositorio headliner (r2048), cuya sección de evaluación se debe seguir: https://huggingface.co/ntumm120/ttc-trunk-8b-r2048-33k
- Peld años de la escalera citados en la model card: https://huggingface.co/ntumm120/ttc-trunk-8b-r288-33k , https://huggingface.co/ntumm120/ttc-trunk-8b-r512-33k , https://huggingface.co/ntumm120/ttc-trunk-8b-r4096-33k , https://huggingface.co/ntumm120/ttc-trunk-8b-r8192-33k
- Backbone: https://huggingface.co/Qwen/Qwen3-8B
- Paper, blog, repositorio de código o demo asociados: no disponibles en la información proporcionada.
