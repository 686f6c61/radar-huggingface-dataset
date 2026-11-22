# mradermacher/chimera-gemma4-12b-spatial-rl-GGUF

## Resumen

`mradermacher/chimera-gemma4-12b-spatial-rl-GGUF` es una coleccion de cuantizaciones GGUF del modelo `snwy/chimera-gemma4-12b-spatial-rl`, un modelo de 12.913.983.536 parametros (aproximadamente 12,9 mil millones) construido sobre la arquitectura Gemma 4 y afinado mediante aprendizaje por refuerzo para tareas de razonamiento espacial, comprension de multiples imagenes y grounding visual. El trabajo de cuantizacion lo realiza mradermacher, un publicador habitual de versiones GGUF de modelos abiertos, y el modelo base lo desarrolla el usuario snwy.

El modelo resuelve el problema de ejecutar inferencia multimodal de razonamiento espacial en hardware de consumo: al ofrecer pesos en formato GGUF con cuantizaciones desde Q2_K (5,3 GB) hasta Q8_0 (13,8 GB), permite desplegar un modelo de casi 13 mil millones de parametros en GPUs consumer y en CPU mediante llama.cpp u Ollama. Es relevante ahora porque combina dos tendencias activas: el interes creciente por el razonamiento espacial y el grounding en modelos de vision-lenguaje, y la demanda de pesos cuantizados listos para produccion en entornos con VRAM limitada.

La informacion disponible sobre el modelo base es escasa: la model card del repositorio GGUF solo documenta el proceso de cuantizacion, los tipos de quant ofrecidos y los enlaces de descarga, sin detallar la arquitectura interna, los datos de entrenamiento ni resultados de benchmarks. Esta ficha refleja exclusivamente los datos verificables publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basada en Gemma 4 (transformer multimodal); detalles internos no disponibles |
| Parametros totales | 12.913.983.536 (~12,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0; tambien x-f16 segun metadatos |
| Idiomas soportados | en (ingles) |
| Licencia | gemma (Gemma Terms of Use) |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repo | 90,0 GB |
| Pipeline declarado | reinforcement-learning |
| Compatibilidad de endpoints | endpoints_compatible |

## Arquitectura y entrenamiento

El modelo base `snwy/chimera-gemma4-12b-spatial-rl` se construye sobre la familia Gemma 4, segun indican las etiquetas del repositorio, y se ha afinado mediante aprendizaje por refuerzo (reinforcement learning) orientado a razonamiento espacial, comprension de multiples imagenes y grounding. Las etiquetas `multi-image`, `spatial-reasoning` y `grounding` indican que el entrenamiento posterior incide en tareas de localizacion y relacion espacial entre elementos de una o varias imagenes. No se dispone de informacion publicada sobre el numero de tokens de entrenamiento, la composicion del dataset, la variante concreta de RL empleada (RLHF, DPO, RLVR u otra) ni innovaciones tecnicas especificas del modelo base.

El repositorio aqui descrito es una conversion a GGUF realizada por mradermacher mediante su pipeline de cuantizacion (convert_type: hf, output_tensor_quantised: 1, quantize_version: 2). Se ofrecen cuantizaciones estaticas; el autor indica que no hay cuantizaciones con imatrix o ponderadas disponibles en el momento de la publicacion. El campo `skip_mmproj: 1` en los metadatos sugiere que el proyector multimodal no se incluye en algunas de las conversiones, un detalle relevante para quien pretenda usar las capacidades de vision en llama.cpp.

## Capacidades

- Razonamiento espacial: el modelo esta afinado especificamente para tareas que requieren interpretar relaciones espaciales (posiciones, orientaciones, distancias relativas) en imagenes.
- Comprension de multiples imagenes: soporta entradas con varias imagenes en una misma conversacion, segun la etiqueta `multi-image`.
- Grounding visual: capacidad de localizar y referenciar objetos o regiones concretas dentro de una imagen.
- Generacion de texto conversacional: el repositorio declara compatibilidad con el pipeline `conversational` y con endpoints.
- Capacidades multimodales derivadas de Gemma 4: al estar construido sobre dicha familia, se presume soporte de vision-lenguaje, aunque no se detalla en la informacion disponible.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun el campo `language: en`.
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Analisis de imagenes tecnicas y planos: el modelo puede responder preguntas sobre la disposicion relativa de componentes en diagramas o planos, aprovechando su afinado en razonamiento espacial; util en documentacion tecnica y mantenimiento industrial.
- Robotica y navegacion asistida: integrado en un pipeline que envie capturas de camara, el modelo puede describir relaciones espaciales entre obstaculos y objetivos, sirviendo como modulo de interpretacion de escena en prototipos de robotica.
- Accesibilidad visual: descripcion de escenas y localizacion de objetos para usuarios con discapacidad visual, apoyandose en la capacidad de grounding para indicar donde se encuentra cada elemento.
- Anotacion y control de calidad de datasets visuales: uso del modelo para verificar que las bounding boxes o etiquetas de un dataset coinciden con el contenido real de las imagenes, en flujos de validacion semiautomaticos.
- Analisis de imagenes medicas o de inspeccion: como asistente de primera pasada para localizar regiones de interes en imagenes (siempre con supervision humana y validacion profesional), gracias a su capacidad de grounding.
- Despliegue en hardware de consumo para prototipado: con las cuantizaciones Q4_K_M (8,0 GB) o Q5_K_M (9,3 GB) el modelo puede ejecutarse en una GPU consumer de 12-16 GB de VRAM mediante llama.cpp u Ollama, lo que facilita experimentar con razonamiento espacial sin infraestructura de datacenter.
- Educacion y entrenamiento en tareas visoespaciales: generacion de explicaciones sobre relaciones espaciales en figuras geometricas o mapas, en entornos de aprendizaje interactivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion (pesos, sin contar cache KV ni overhead):
  - Q2_K: 5,3 GB
  - Q3_K_S: 6,1 GB
  - Q3_K_M: 6,6 GB
  - Q3_K_L: 7,1 GB
  - IQ4_XS: 7,3 GB
  - Q4_K_S: 7,7 GB
  - Q4_K_M: 8,0 GB
  - Q5_K_S: 9,1 GB
  - Q5_K_M: 9,3 GB
  - Q6_K: 10,7 GB
  - Q8_0: 13,8 GB
- GPU recomendadas: para Q4_K_M o Q5_K_M, una RTX 4090 (24 GB) o RTX 4080 (16 GB) deja margen suficiente para contexto y cache KV; para Q8_0 se recomienda una GPU de 24 GB o superior (RTX 4090, A100 40 GB, H100). Las cuantizaciones Q2_K a Q3_K_L caben en GPUs de 8-12 GB.
- Cabe en GPU consumer: si, desde Q2_K (5,3 GB, valida para GPUs de 8 GB) hasta Q6_K (10,7 GB, valida para GPUs de 12-16 GB). Q8_0 requiere 16-24 GB.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF. El modelo base es compatible con transformers; el repositorio declara `endpoints_compatible`.
- Latencia y throughput: no disponibles en la informacion proporcionada.
- Nota: al ser un modelo multimodal, conviene verificar que el runtime cargue correctamente el proyector visual (mmproj); los metadatos indican `skip_mmproj: 1`, por lo que algunas conversiones podrian no incluir capacidades de vision.

## Comparativa con modelos similares

No se dispone de datos de rendimiento ni de especificaciones detalladas del modelo base que permitan una comparacion cuantitativa fiable con alternativas. A continuacion se ofrece una comparacion estructural basica con modelos de tamano y proposito similares, marcando como no disponibles los campos sin informacion verificable.

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| chimera-gemma4-12b-spatial-rl (este) | ~12,9 B | no disponible | Razonamiento espacial multimodal con RL | gemma | GGUF, safetensors |
| Gemma 2 12B / Gemma 3 (familia base) | ~12 B | no disponible en esta ficha | Texto y multimodal segun variante | gemma | safetensors, GGUF |
| Qwen2.5-VL 7B | ~7 B | no disponible en esta ficha | Vision-lenguaje general | Apache 2.0 (segun variante) | safetensors, GGUF |
| Llama 3.2 11B Vision | ~11 B | no disponible en esta ficha | Vision-lenguaje general | Llama Community License | safetensors, GGUF |

La comparacion de rendimiento entre estos modelos no puede establecerse con los datos disponibles.

## Limitaciones y advertencias

- Idioma: el modelo declara soporte unicamente de ingles (`language: en`); el rendimiento en castellano no esta garantizado ni documentado.
- Datos de evaluacion ausentes: no hay benchmarks publicados en la informacion disponible, por lo que no es posible verificar la calidad del afinado por refuerzo ni compararlo con alternativas.
- Licencia Gemma: el uso comercial esta sujeto a los Gemma Terms of Use, que incluyen restricciones de uso aceptable y obligaciones de atribucion; conviene revisarlos antes de un despliegue en produccion.
- Riesgo de alucinacion: como todo modelo generativo, puede producir descripciones espaciales o localizaciones incorrectas con aparente seguridad; en tareas de grounding es imprescindible validar las salidas.
- Proyector multimodal: los metadatos indican `skip_mmproj: 1`; si el runtime no carga el proyector visual, las capacidades de vision no estaran disponibles aunque el modelo se cargue correctamente.
- Cuantizaciones estaticas sin imatrix: el autor senala que no hay cuantizaciones ponderadas o con imatrix, lo que puede suponer una perdida de calidad algo mayor en las cuantizaciones bajas (Q2_K, Q3_K_S) frente a alternativas con calibracion.
- Degradacion en cuantizaciones bajas: Q2_K y Q3_K_M se marcan como de menor calidad en la propia tabla del autor; para uso serio se recomienda Q4_K_M o superior.
- Sesgos: no se dispone de informacion sobre sesgos del modelo base ni sobre el dataset de afinado.
- Contexto: la longitud de contexto no esta documentada, lo que dificulta planificar cargas de trabajo con entradas largas o multiples imagenes de alta resolucion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/chimera-gemma4-12b-spatial-rl-GGUF
- Modelo base: https://huggingface.co/snwy/chimera-gemma4-12b-spatial-rl
- Pagina de descargas del autor: https://hf.tst.eu/model#chimera-gemma4-12b-spatial-rl-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
