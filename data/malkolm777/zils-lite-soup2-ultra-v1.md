# malkolm777/zils-lite-soup2-ultra-v1

## Resumen

zils-lite-soup2-ultra-v1 es un modelo de decisión publicado por el usuario malkolm777 en Hugging Face, construido sobre la familia Qwen3.5-0.8B (según la model card, un "d3-lite decision body"). No se trata de un modelo de propósito general, sino de un componente especializado en tareas de decisión con opciones declaradas, entrenado para el pool "lite soup" de la subred Zils 127. El pipeline declarado en el repositorio es `feature-extraction`, aunque las etiquetas del autor lo describen como `decision-model`.

El modelo parte de una media de pesos de los dos miembros actuales del pool lite (BashirEmran/d3-lite-body-a2 y DouglasBashir/zils-lite-r6) y se refina mediante cuatro estudiantes LoRA (rank 64, learning rate 5e-5, una época) entrenados por destilación KL desde el modelo mayor vllm-sr/d3-ultra. El conjunto de entrenamiento son 4.580 ítems de decisión estilo examen, generados por un LLM en el formato del validador, sin etiquetas gold.

Con 852.985.920 parámetros (aproximadamente 0,85 mil millones) y un repositorio de 1,7 GB en safetensors, es un modelo pequeño pensado para inferencia ligera y despliegue en entornos con recursos limitados. Su relevancia es acotada: se trata de un artefacto de un ecosistema de subred específico, no de un modelo de uso generalista, y no cuenta con descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5-0.8B, según model card); weights averaging + LoRA |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; no se documentan GGUF ni otras variantes) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer de la familia Qwen3.5-0.8B, descrito por el autor como "d3-lite decision body". El proceso de construcción es un *model soup*: se parte de la media aritmética de pesos de dos modelos del pool lite (BashirEmran/d3-lite-body-a2 y DouglasBashir/zils-lite-r6), y sobre esa base se entrenan cuatro adaptadores LoRA con semillas distintas (553, 771, 991 y 1201), rank 64, learning rate 5e-5 y una época. Posteriormente, los cuatro estudiantes se promedian en pesos.

El entrenamiento es destilación por KL desde el modelo mayor vllm-sr/d3-ultra: para cada ítem, el objetivo son las distribuciones completas sobre las opciones declaradas, no etiquetas gold. El conjunto consta de 4.580 ítems de decisión estilo examen en las familias de tareas del pool, redactados por un LLM en el formato del validador (estado + pregunta de decisión con opciones declaradas). La model card indica que el *readout*, la torre de visión y los ficheros de contrato pertenecen al chasis original; no se detalla si la torre de visión se conserva funcional o se hereda solo como componente estructural.

## Capacidades

- Tareas de decisión con opciones declaradas: el modelo está entrenado para producir distribuciones sobre un conjunto finito de opciones dado un estado y una pregunta.
- Clasificación/readout especializado: el pipeline declarado es `feature-extraction`, orientado a extraer representaciones para el cabezal de decisión.
- Destilación de distribuciones: aprende las probabilidades del profesor (vllm-sr/d3-ultra) en lugar de etiquetas discretas.
- Herencia de la familia Qwen3.5-0.8B: capacidades base de generación de texto y comprensión del lenguaje, aunque no se documentan explícitamente en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo *thinking*, visión o audio: la model card menciona una torre de visión heredada del chasis, pero no se especifica si está operativa ni con qué modalidades.

## Casos de uso

- Decisión entre opciones en entornos de subred: el modelo encaja en el pool lite de la subred Zils 127 para responder ítems con estado y opciones declaradas, que es exactamente el formato de su conjunto de entrenamiento.
- Evaluación de validadores: puede usarse como componente de referencia para comparar decisiones frente al profesor vllm-sr/d3-ultra en las mismas familias de tareas.
- Clasificación ligera con contexto estructurado: al ser un modelo de ~0,85B parámetros, es viable para clasificar estados en pipelines de bajo coste donde la latencia y la VRAM son restrictivas.
- Extracción de características: con pipeline `feature-extraction`, puede emplearse para generar embeddings de estados y preguntas que alimenten un cabezal de decisión propio.
- Destilación inversa o *self-distillation*: sirve como estudiante base para experimentos de promedio de pesos y LoRA en modelos pequeños, replicando el procedimiento descrito.
- Despliegue en CPU o GPU de gama baja: por su tamaño, es adecuado para prototipos y entornos de desarrollo sin aceleradores de gama alta, siempre que se valide su comportamiento en la tarea concreta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB solo para pesos (852.985.920 parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, del orden de 2-3 GB según longitud de contexto y batch.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,9 GB para pesos; en 4 bits, alrededor de 0,5 GB. No se documentan ficheros GGUF ni cuantizaciones oficiales.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para fp16 (RTX 3050, RTX 4060, T4); A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas con 4 GB o más de VRAM en fp16, y en 2 GB o más si se cuantiza.
- Opciones de despliegue: transformers (librería declarada); vLLM, llama.cpp, Ollama o TGI no están documentados en la información disponible.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-soup2-ultra-v1 | 852.985.920 | no disponible | Decisión / feature-extraction | Apache-2.0 | Hugging Face (0 descargas) |
| vllm-sr/d3-ultra | no disponible | no disponible | Decisión (profesor) | no disponible | Hugging Face |
| BashirEmran/d3-lite-body-a2 | no disponible | no disponible | Decisión (miembro del pool) | no disponible | Hugging Face |
| DouglasBashir/zils-lite-r6 | no disponible | no disponible | Decisión (miembro del pool) | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones completas de los modelos comparables en la información proporcionada; la comparativa se limita a la relación de linaje y disponibilidad.

## Limitaciones y advertencias

- Modelo de nicho: entrenado exclusivamente para las familias de tareas del pool lite de la subred Zils 127; su comportamiento fuera de ese formato no está validado.
- Sin etiquetas gold: el entrenamiento usa destilación KL desde vllm-sr/d3-ultra, por lo que hereda los sesgos y errores del profesor.
- Conjunto de entrenamiento pequeño y sintético: 4.580 ítems generados por un LLM, lo que limita la cobertura y puede introducir artefactos del generador.
- Riesgo de alucinación: no evaluado; no hay benchmarks publicados ni métricas de calibración.
- Idiomas y contexto: no documentados; no se debe asumir un soporte multilingüe ni una ventana de contexto concreta.
- Licencia Apache-2.0: permite uso comercial, pero se debe revisar el fichero NOTICE y las licencias del modelo base (vllm-sr/d3-lite) y de la familia Qwen3.5-0.8B.
- Sin tracción comunitaria: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de validación externa.
- Dependencia de código personalizado: la etiqueta `custom_code` implica que la carga puede requerir `trust_remote_code=True` y revisión del código asociado.

## Enlaces

- Hugging Face: https://huggingface.co/malkolm777/zils-lite-soup2-ultra-v1
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Modelo profesor: https://huggingface.co/vllm-sr/d3-ultra
- Miembro del pool: https://huggingface.co/BashirEmran/d3-lite-body-a2
- Miembro del pool: https://huggingface.co/DouglasBashir/zils-lite-r6
