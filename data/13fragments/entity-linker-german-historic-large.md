# 13fragments/entity-linker-german-historic-large

## Resumen

`entity-linker-german-historic-large` es un modelo de enlazado de entidades (entity linking) especializado en alemán histórico, desarrollado por el usuario 13fragments. Resuelve el problema de vincular menciones de nombres propios en textos alemanes antiguos —incluidos documentos con tipografía fraktur— a identificadores canónicos de Wikidata (QID) y, cuando existe registro en la Wikipedia alemana, al fichero de autoridad GND (Gemeinsame Normdatei). Se trata de un cross-encoder basado en XLM-R large con 559,9 millones de parámetros, pensado para recibir un texto y los spans de caracteres de las menciones y devolver para cada una el QID y el GND correspondientes, o NIL si no hay enlace fiable.

El modelo se apoya en un índice de entidades construido a partir de la Wikipedia alemana (`13fragments/entity-index-german-wikipedia`), del que recupera hasta 16 candidatos por mención y los reordena mediante el cross-encoder; la decisión final incorpora un prior de frecuencia de nombre y un umbral calibrado sobre datos de validación para decidir cuándo devolver NIL. La relevancia actual radica en que cubre un hueco poco atendido: el enlazado de entidades en corpus históricos alemanes con licencia permisiva (CC BY-SA 4.0), frente a alternativas como `impresso-project/nel-mgenre-multilingual`, que es más precisa pero con licencia CC BY-NC 4.0 no comercial.

El modelo se publica con pesos en safetensors (fp32), exportaciones ONNX (fp32, cuantizada e int8) y una implementación en transformers.js para ejecución en navegador vía WASM y WebGPU. Está diseñado para integrarse en pipelines de humanidades digitales junto a un NER histórico como `13fragments/ner-german-historic-large`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder transformer (XLM-R large) |
| Parametros totales | 559.891.457 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (safetensors, ONNX), ONNX quantized, ONNX int8 |
| Idiomas soportados | de (alemán, incluido histórico y fraktur) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | safetensors, ONNX (`model.onnx`, `model_quantized.onnx`, `model_int8.onnx`) |

## Arquitectura y entrenamiento

El modelo es un cross-encoder construido sobre `FacebookAI/xlm-roberta-large` (559,9 M de parámetros). El pipeline completo consta de tres piezas: un índice de entidades en SQLite (2,0 GB) construido a partir de la Wikipedia alemana, un recuperador de candidatos que devuelve hasta 16 entidades por mención, y el cross-encoder que puntúa cada par (texto, candidato). La decisión final combina la puntuación del cross-encoder con un prior de frecuencia de nombre y aplica un umbral elegido sobre datos de validación para determinar cuándo la mención debe quedar sin enlazar (NIL). El código del pipeline se distribuye en el repositorio (`linker.py`, `el_link.py`, `roles.py`).

No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. El modelo se entrenó para el par de tareas de enlazado a Wikidata y a GND, y se evaluó con un criterio de release gate: debía superar al baseline permisivo más fuerte por al menos dos errores estándar (considerando ruido de semilla y bootstrap de documentos), requisito que cumplió (F1 agrupado de 0,540 frente a 0,399, margen requerido 0,047, margen medido 0,141).

## Capacidades

- Enlazado de entidades en alemán histórico: dado un texto y los spans de caracteres de las menciones, devuelve para cada una el QID de Wikidata y el identificador GND, o NIL.
- Manejo de tipografía fraktur y ortografía histórica alemana.
- Recuperación y reordenación de hasta 16 candidatos por mención a partir del índice de la Wikipedia alemana.
- Decisión calibrada de NIL mediante umbral sobre validación y prior de frecuencia de nombre.
- Integración con NER histórico: pensado para consumir los spans producidos por `13fragments/ner-german-historic-large`.
- Ejecución en CPU sin PyTorch mediante ONNX Runtime (`backend="onnx"`, `onnx/model_quantized.onnx`).
- Ejecución en navegador mediante transformers.js (WASM y WebGPU) con `onnx/model_int8.onnx`.
- No se documentan capacidades de generación de texto, tool calling, agentes, visión ni audio; es un modelo de ranking/clasificación, no generativo.

## Casos de uso

- Ediciones críticas de correspondencia histórica: enlazar automáticamente los nombres de personas citados en cartas del siglo XIX a Wikidata y GND, como en el corpus de "Briefe und Texte aus dem intellektuellen Berlin um 1800", para generar índices de personas navegables.
- Digitalización de prensa histórica: procesar colecciones de periódicos alemanes (tipo NewsEye o SoNAR) junto a un NER para poblar bases de datos de entidades enlazadas con identificadores normalizados.
- Enriquecimiento de catálogos bibliotecarios y archivos: mapear menciones de autores y lugares en registros históricos a GND, facilitando la interoperabilidad con sistemas de authority control.
- Investigación en humanidades digitales: construir grafos de conocimiento de personajes históricos a partir de corpus textuales, aprovechando la salida QID/GND para cruzar con otras fuentes.
- Procesamiento en navegador o en el cliente: usar la versión ONNX int8 con transformers.js para demos interactivas o herramientas de anotación que funcionan sin backend de GPU.
- Pipelines de bajo coste en CPU: desplegar el modelo con ONNX Runtime quantized en servidores sin GPU para anotación por lotes de grandes volúmenes de texto histórico.
- Anotación asistida para investigadores: preenlazar menciones y dejar que un humano valide, reduciendo el trabajo manual en proyectos de marcado de entidades.

## Benchmarks y rendimiento

Cartas de hacia 1800 (66 documentos, 1.655 nombres de persona; ninguno de los modelos comparados fue entrenado en este conjunto):

| Sistema | F1 | Precision | Linked accuracy | NIL accuracy |
|---|---|---|---|---|
| Este modelo (semilla 1) | 0,409 | 0,536 | 0,331 | 0,717 |
| Name prior (entidad más frecuente) | 0,206 | 0,193 | 0,222 | 0,104 |
| `dell-research-harvard/lt-wikidata-comp-de` (MIT) | 0,056 | 0,055 | 0,056 | 0,238 |
| `impresso-project/nel-mgenre-multilingual` (CC BY-NC 4.0) | 0,473 | 0,701 | 0,357 | 0,911 |

Diferencia frente a impresso (bootstrap pareado sobre 66 documentos, intervalo del 95 %): F1 −0,064 (−0,106 a −0,009); linked accuracy −0,027 (−0,060 a +0,021).

Periódicos históricos (fuentes HIPE-2022: NewsEye test y SoNAR test; 1.350 nombres, 718 con ítem de Wikidata):

| Sistema | Pooled F1 | NewsEye F1 | SoNAR F1 | NIL accuracy |
|---|---|---|---|---|
| Este modelo, media de 4 semillas (± sd) | 0,540 ± 0,010 | 0,576 ± 0,012 | 0,485 ± 0,016 | 0,656 |
| Este modelo, semilla 1 publicada | 0,551 | 0,593 | 0,486 | 0,671 |
| Name prior | 0,399 | 0,371 | 0,444 | 0,245 |
| `lt-wikidata-comp-de` (MIT) | 0,271 | 0,241 | 0,320 | 0,511 |
| `nel-mgenre-multilingual` (CC BY-NC 4.0)* | 0,808 | 0,771 | 0,862 | 0,703 |

\* La model card de impresso lista los datasets HIPE-2022 (incluidos NewsEye y SoNAR) como datos de fine-tuning, por lo que sus puntuaciones en estos conjuntos probablemente estén infladas.

Por tipo de entidad (semilla publicada, F1): lugares 0,662 (NewsEye) y 0,624 (SoNAR); personas 0,512 y 0,351; organizaciones 0,321 y 0,310.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos fp32 en safetensors ocupan aproximadamente 2,24 GB (el ONNX fp32 con `model.onnx_data` mide 2,24 GB); la versión quantized e int8 reducen sustancialmente el consumo.
- GPU recomendadas: no se especifican; cualquier GPU con al menos unos pocos GB de VRAM puede alojar la versión fp32. Una RTX 4090, A100 o H100 ejecutarían el modelo sin problema, pero no hay datos publicados de latencia ni throughput.
- Cabe en GPU de consumo: sí, dado el tamaño del modelo (559,9 M de parámetros); la versión ONNX int8 permite incluso ejecución en CPU o navegador.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime en CPU, transformers.js (WASM y WebGPU). El tag `text-embeddings-inference` y `endpoints_compatible` sugiere compatibilidad con TEI y endpoints de Hugging Face, aunque no se detalla la configuración.
- Latencia y throughput: no disponibles en la información proporcionada. El índice SQLite (2,0 GB) requiere poca memoria adicional.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | F1 cartas 1800 | F1 periódicos (pooled) | Licencia |
|---|---|---|---|---|---|
| Este modelo | 559,9 M | no disponible | 0,409 | 0,540 | CC BY-SA 4.0 |
| `impresso-project/nel-mgenre-multilingual` | no disponible | no disponible | 0,473 | 0,808* | CC BY-NC 4.0 |
| `dell-research-harvard/lt-wikidata-comp-de` | no disponible | no disponible | 0,056 | 0,271 | MIT |
| Name prior (baseline) | — | — | 0,206 | 0,399 | — |

\* Probablemente inflado por inclusión de HIPE-2022 en su entrenamiento. Este modelo es la opción más precisa entre las de licencia permisiva y la única que devuelve identificadores GND; impresso es más preciso pero no comercial.

## Limitaciones y advertencias

- Precisión inferior a `impresso-project/nel-mgenre-multilingual` en todos los conjuntos medidos; la diferencia principal es de precisión (impresso devuelve NIL con más frecuencia y acierta más).
- Rendimiento desigual por tipo de entidad: las organizaciones obtienen F1 muy bajo (0,321 y 0,310), frente a lugares (0,662 y 0,624) y personas (0,512 y 0,351).
- Depende de un índice externo de 2,0 GB construido a partir de la Wikipedia alemana; entidades ausentes del índice no podrán enlazarse.
- Solo soporta alemán; no se documentan otros idiomas.
- Riesgo de error en la decisión NIL: la NIL accuracy en cartas es 0,717 y en periódicos 0,656, lo que implica que una fracción relevante de menciones sin ítem se enlazan incorrectamente o viceversa.
- Licencia CC BY-SA 4.0: permite uso comercial pero impone compartir bajo la misma licencia las obras derivadas y atribuir; conviene revisar las obligaciones antes de integrarlo en productos propietarios.
- No se documentan sesgos específicos ni tasas de alucinación (no es un modelo generativo), pero el enlazado puede amplificar sesgos presentes en la Wikipedia alemana y en el prior de frecuencia de nombre.
- El modelo no es generativo: no debe esperarse de él generación de texto, razonamiento libre ni tool calling.
- No se especifican la longitud de contexto máxima ni los detalles del dataset de entrenamiento, lo que dificulta evaluar su robustez fuera de los dominios históricos medidos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/13fragments/entity-linker-german-historic-large
- Dataset del índice de entidades: https://huggingface.co/datasets/13fragments/entity-index-german-wikipedia
- Modelo NER histórico complementario: https://huggingface.co/13fragments/ner-german-historic-large
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/13fragments/historical-german-entity-linking-demo
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Alternativa impresso: https://huggingface.co/impresso-project/nel-mgenre-multilingual
- Baseline `lt-wikidata-comp-de`: https://huggingface.co/dell-research-harvard/lt-wikidata-comp-de
