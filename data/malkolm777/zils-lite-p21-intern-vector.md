# malkolm777/zils-lite-p21-intern-vector

## Resumen

zils-lite-p21-intern-vector es un modelo de decisión derivado de `joamCriff123/zils-lite-l1117a` mediante un adaptador LoRA de rango 64. El adaptador se entrenó sobre `internlm/Intern-Decision-0.8B`, un modelo de la familia InternLM orientado a tareas de decisión, y sus actualizaciones aprendidas en las capas de lenguaje se aplicaron al modelo base. El resultado es un checkpoint de aproximadamente 853 millones de parámetros (852.985.920 según los pesos en safetensors) empaquetado en un repositorio de 1,7 GB, publicado por el usuario `malkolm777` bajo licencia Apache 2.0.

La propuesta del modelo es acotada y experimental: se trata de un ajuste fino orientado a tareas de decisión con énfasis en herramientas (tools) y recuperación (retrieval), entrenado con 640 preguntas verificadas del conjunto P3, de las cuales 192 usaron objetivos de un "mini teacher" y 448 objetivos de un "Ultra teacher". El entrenamiento empleó una tasa de aprendizaje de 4e-05 y semilla 2673, con un JSONL de entrenamiento cuyo hash SHA-256 se documenta en la model card.

Es relevante ahora únicamente dentro de su nicho: es un modelo pequeño (sub-1B), con licencia permisiva y pensado como componente de decisión más que como modelo generativo generalista. No dispone de descargas ni likes, no declara idiomas soportados y su model card es mínima, por lo que debe evaluarse como artefacto de investigación reproducible antes que como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia `qwen3_5` según los tags del repo), con adaptador LoRA de rango 64 fusionado sobre el modelo base |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es un modelo MoE según la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (con `custom_code`, requiere cargar código remoto del repositorio) |

## Arquitectura y entrenamiento

El modelo parte de `joamCriff123/zils-lite-l1117a`, un checkpoint de aproximadamente 853 M de parámetros etiquetado con la arquitectura `qwen3_5` en los tags de Hugging Face. Sobre él se aplicó un adaptador LoRA de rango 64 entrenado con `internlm/Intern-Decision-0.8B` como referencia docente; las actualizaciones de las capas de lenguaje aprendidas en ese adaptador se fusionaron en el modelo base, dando lugar al checkpoint publicado. El repositorio incluye `custom_code`, lo que implica que la carga del modelo requiere `trust_remote_code=True` y ejecución de código del autor.

El detalle de entrenamiento documentado es escueto pero concreto: una única pasada LoRA de rango 64 sobre 640 preguntas verificadas del conjunto P3, divididas en 192 ejemplos con objetivos de un "mini teacher" y 448 con objetivos de un "Ultra teacher". El subconjunto verificado pone énfasis en herramientas y recuperación. Se emplearon tasa de aprendizaje 4e-05 y semilla 2673, y se publica el SHA-256 del JSONL de entrenamiento (`a9b3207bbe3f6b46f043636cea2f2ad475cb02ab653e47e25a93be18bde37c91`), lo que permite verificar la reproducibilidad del corpus. No se documentan número total de tokens de entrenamiento, composición completa del dataset, ni fases de RLHF o DPO.

## Capacidades

- Tareas de decisión: el modelo está ajustado específicamente para emitir decisiones o selecciones, no como generador de texto libre generalista.
- Uso de herramientas (tool calling): el subconjunto de entrenamiento verificado enfatiza explícitamente herramientas, por lo que se espera capacidad para seleccionar o invocar tools en un pipeline de decisión.
- Recuperación (retrieval): el entrenamiento también incide en recuperación, orientado a decidir qué recuperar o cómo puntuar resultados de un sistema RAG.
- Razonamiento de un solo paso orientado a decisión: el formato de entrenamiento (preguntas P3 con objetivos de teacher) sugiere clasificación o elección entre opciones más que cadenas de razonamiento largas.
- Capacidades multilingües: no disponibles; el autor no declara idiomas.
- Capacidades especiales (thinking mode, visión, audio): no disponibles en la información proporcionada.
- Soporte de agentes multi-paso: no documentado; el entrenamiento se limita a 640 ejemplos de decisión, insuficiente para inferir comportamiento agéntico robusto.

## Casos de uso

- Enrutamiento de herramientas en un agente: usar el modelo como clasificador ligero que, dada una consulta, decida qué tool invocar. Su entrenamiento con énfasis en herramientas y su tamaño sub-1B permiten ejecutarlo en CPU o GPU de gama baja con latencia baja por consulta.
- Filtro de recuperación en pipelines RAG: emplearlo para puntuar o seleccionar fragmentos recuperados antes de pasarlos a un modelo generador mayor, aprovechando el énfasis del entrenamiento en retrieval y reduciendo coste frente a usar un LLM grande para esa decisión.
- Clasificación de intenciones en atención al cliente: decidir la categoría de una consulta entrante (facturación, soporte técnico, cancelación) antes de derivarla al flujo correspondiente, con la ventaja de que un modelo de 853 M se despliega en hardware modesto.
- Componente de decisión en sistemas de agentes multi-modelo: actuar como "router" que decide si una petición requiere búsqueda web, consulta a base de datos o respuesta directa, integrado como paso previo a un modelo generativo de mayor tamaño.
- Evaluación comparativa de adaptadores LoRA: servir como artefacto reproducible (semilla y hash del dataset publicados) para investigar cómo un adaptador de rango 64 entrenado sobre un modelo de decisión transfiere capacidades a un base distinto.
- Prototipado académico de modelos de decisión pequeños: usar el checkpoint como línea base en experimentos sobre destilación de teachers ("mini" y "Ultra") hacia modelos sub-1B, dado que el autor documenta la mezcla exacta de ejemplos por teacher.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 1,7 GB solo para pesos (853 M de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB de pesos; en 4 bits, alrededor de 0,5 GB, aunque el autor no publica variantes cuantizadas y habría que generarlas.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 3060) es suficiente en FP16; para lotes grandes o contexto largo, una RTX 4090 o A100/H100 aportan margen amplio pero son sobredimensionadas para este tamaño.
- Cabe en GPU consumer: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` es la vía natural dado el `custom_code` del repo; llama.cpp/Ollama requerirían convertir los pesos a GGUF (no publicados); vLLM y TGI no están verificados para esta arquitectura concreta y su soporte no está documentado.
- Latencia y throughput estimados: no disponibles; no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-p21-intern-vector | 853 M | no disponible | Apache 2.0 | Hugging Face, 0 descargas | Ajuste LoRA de decisión sobre zils-lite-l1117a |
| joamCriff123/zils-lite-l1117a (modelo base) | ~853 M | no disponible | no disponible | Hugging Face | Base sin el adaptador de decisión |
| internlm/Intern-Decision-0.8B (teacher) | ~0,8 B | no disponible | no disponible | Hugging Face | Modelo de decisión usado como referencia docente |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo experimental con cero descargas y cero likes: no hay evidencia de uso en producción ni validación externa.
- Model card mínima: no se documentan idiomas, contexto, cuantizaciones ni evaluación, lo que impide garantizar comportamiento fuera del dominio de entrenamiento.
- Entrenamiento con solo 640 ejemplos: riesgo alto de sobreajuste al subconjunto P3 verificado y de generalización pobre a dominios distintos de herramientas y recuperación.
- Requiere `trust_remote_code=True` por el `custom_code` del repositorio, lo que implica ejecutar código del autor; auditar antes de desplegar.
- Riesgo de alucinación y de decisiones erróneas no cuantificado: al ser un modelo de decisión, un error se propaga directamente al pipeline que lo consume.
- Sesgos conocidos: no documentados por el autor; el corpus P3 y los teachers empleados pueden introducir sesgos no auditados.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y el teacher tienen licencias no declaradas en esta información; verificar `LICENSE` y `NOTICE` del repositorio por atribuciones upstream antes de uso comercial.
- Sin garantías de soporte en frameworks de serving estándar (vLLM, TGI, llama.cpp) para esta arquitectura concreta.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/malkolm777/zils-lite-p21-intern-vector
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1117a
- Teacher de decisión: https://huggingface.co/internlm/Intern-Decision-0.8B
