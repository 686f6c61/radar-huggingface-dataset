# haiqian-mit/Prospector

## Resumen

Prospector es una política de lenguaje compacta, post-entrenada para responder preguntas sobre un grafo de conocimiento científico. En lugar de responder directamente desde sus pesos, el modelo llama a un pequeño conjunto de herramientas para recorrer el grafo turno a turno, construyendo su contexto a partir de lo que cada llamada devuelve, y emite una respuesta acompañada de una cadena de aristas que se verifica contra lo recuperado por las herramientas. Esto reduce la alucinación en dominios científicos especializados, donde un LLM genérico carece de conocimiento fiable.

El modelo ha sido desarrollado por el grupo haiqian-mit (asociado al laboratorio lamm-mit del MIT) y se publica como adaptadores LoRA sobre Qwen3.5 en tres tamaños: 0.8B, 2B y 4B parámetros. El entrenamiento se realizó sobre un grafo construido a partir de la literatura de fabricación de semiconductores, y los mismos adaptadores, con los pesos base congelados, transfieren a grafos de otros tres campos (materiales bioinspirados, PFAS y propiedades de materiales), lo que demuestra una notable capacidad de generalización fuera de dominio.

Su relevancia actual radica en que combina un modelo pequeño y económicamente ejecutable con un esquema agéntico de uso de herramientas y un verificador entrenado, ofreciendo respuestas trazables y auditables (cada afirmación se apoya en aristas citadas del grafo). El repositorio incluye pesos, filas de entrenamiento y todas las ejecuciones de evaluación del paper asociado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre Qwen3.5, usados como política agéntica con tool calling |
| Parametros totales | 0.8B, 2B y 4B (según el tamaño base de Qwen3.5) |
| Parametros activos | no disponible (no es MoE; todos los parámetros del modelo base están activos) |
| Longitud de contexto | no disponible (las ejecuciones PFAS usan un contexto de 32k según los nombres de run; presupuesto por turno: 20 llamadas a herramientas y 1.024 tokens generados) |
| Tipos de cuantizacion | no disponible (se distribuyen adaptadores en precisión original) |
| Idiomas soportados | no disponible (entrenado sobre literatura científica en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA en la nomenclatura fusionada de transformers para Qwen3.5, `in_proj_qkv`) |

## Arquitectura y entrenamiento

Prospector no es un modelo desde cero: son adaptadores LoRA aplicados sobre `Qwen/Qwen3.5` en tamaños 0.8B, 2B y 4B, con los pesos base congelados. La política opera con la plantilla de chat `plain_chatml` y un presupuesto de 20 llamadas a herramientas y 1.024 tokens generados por turno. Cada tamaño se sirve con el adaptador de la segunda etapa supervisada más el checkpoint seleccionado por cada ronda de decisión GRPO, en un orden de carga definido, y se acompaña de un verificador entrenado sobre las muestras de la propia política.

La receta de entrenamiento consta de cuatro etapas: una etapa supervisada (SFT) sobre demostraciones de un profesor de frontera; una ronda de GRPO (aprendizaje por refuerzo con recompensa de grupo) sobre episodios completos; una segunda etapa supervisada que mezcla las demostraciones con los episodios propios retenidos por la política; y dos rondas de decisión de GRPO que reanudan estados intermedios de episodio almacenados. Los datos de entrenamiento proceden de un grafo de conocimiento construido a partir de la literatura de fabricación de semiconductores; el número total de tokens de entrenamiento no está disponible.

Como innovación destacable, el sistema incorpora una "compuerta" (gate) de verificación: una respuesta solo se acepta si cada arista citada fue devuelta por una herramienta y la respuesta nombra un nodo de la cadena, lo que convierte la corrección en una propiedad comprobable en lugar de una impresión cualitativa.

## Capacidades

- Respuesta de preguntas sobre grafos de conocimiento científico mediante recorrido agéntico del grafo, turno a turno.
- Tool calling: la política llama a un pequeño conjunto de herramientas para explorar el grafo y construye su contexto a partir de los resultados.
- Razonamiento científico con trazabilidad: cada respuesta incluye una cadena de aristas citadas verificable contra lo recuperado.
- Transferencia a dominios nuevos sin reentrenar: con pesos base congelados, los adaptadores entrenados en semiconductores funcionan en grafos de materiales bioinspirados, PFAS y propiedades de materiales.
- Verificación de respuestas mediante un verificador entrenado sobre las muestras de la propia política.
- Ejecución local en hardware modesto (probado en Mac con Apple silicon y GPUs NVIDIA), gracias a los tamaños 0.8B-4B.
- No hay evidencia de capacidades de visión, audio ni generación multimodal; el pipeline es de pregunta-respuesta textual.

## Casos de uso

- Consulta de literatura científica en semiconductores: un investigador puede preguntar relaciones entre procesos, materiales y propiedades, y el modelo recorre el grafo con herramientas para construir una respuesta citada con aristas verificables.
- Descubrimiento de materiales bioinspirados: gracias a la transferencia sin reentrenamiento, el mismo adaptador 4B responde preguntas sobre un grafo de materiales bioinspirados con una precisión gated del 80,3 %.
- Análisis regulatorio y químico de PFAS: el modelo puede responder preguntas sobre compuestos PFAS y sus relaciones en el grafo correspondiente, útil para equipos de cumplimiento y química ambiental.
- Mineria de propiedades de materiales: los equipos de I+D pueden extraer relaciones material-propiedad del grafo de propiedades de materiales (precisión gated del 80,9 % con el modelo 4B).
- Asistente de revisión bibliográfica asistida por grafo: integración en pipelines RAG basados en grafos de conocimiento, donde la cadena de aristas citadas sirve de evidencia auditable para cada afirmación.
- Prototipado de políticas agénticas con tool use en hardware de consumo: al ser modelos de 0,8B a 4B con LoRA, son adecuados para experimentar con recorridos de grafos multi-paso en un portátil Apple Silicon o una GPU de consumo.
- Base para sistemas de pregunta-respuesta científica con verificación: el verificador entrenado y la compuerta de citación pueden reutilizarse como patrón para otros dominios con grafos propios.

## Benchmarks y rendimiento

Los datos publicados corresponden a la métrica de precisión gated del propio paper (media ± una desviación típica sobre las semillas de las ejecuciones almacenadas):

| Política, grafo | Precisión gated |
|---|---|
| Prospector-4B, semiconductores, 8 semillas | 0,839 ± 0,015 |
| Prospector-2B, semiconductores, 8 semillas | 0,755 ± 0,016 |
| Prospector-0.8B, semiconductores, 8 semillas | 0,694 ± 0,021 |
| Prospector-4B, materiales bioinspirados, 3 semillas | 0,803 ± 0,017 |
| Prospector-4B, PFAS, 3 semillas | 0,766 ± 0,022 |
| Prospector-4B, propiedades de materiales, 3 semillas | 0,809 ± 0,011 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible; las comparaciones con otros modelos deben hacerse dentro del propio harness de evaluación del repositorio de código.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con exactitud, pero los tamaños base (0,8B, 2B y 4B con adaptadores LoRA) son ejecutables en GPUs de consumo; el modelo 4B en FP16 requiere en torno a 8-10 GB de VRAM, y menos con cuantización (no distribuida oficialmente).
- GPU recomendadas: cualquier GPU NVIDIA moderna con suficiente VRAM para el tamaño elegido; el quickstart oficial está probado en Mac con Apple silicon (memoria unificada) y en Linux con GPU NVIDIA.
- Cabe en GPUs de consumo: sí. El 4B funciona en una RTX 4090 (24 GB) con holgura y probablemente en GPUs de 12-16 GB; los tamaños 0,8B y 2B son viables incluso en equipos portátiles.
- Despliegue: el camino soportado es el repositorio de código oficial (github.com/lamm-mit/Prospector), que usa `transformers` y `peft` con versiones fijadas para cargar los adaptadores LoRA en nomenclatura fusionada de Qwen3.5 (`in_proj_qkv`). No hay evidencia de soporte directo en vLLM, llama.cpp, Ollama o TGI; los adaptadores deben fusionarse primero sobre el modelo base.
- Latencia y throughput: el repositorio incluye `data/analysis/inference_speed.json` con los datos de tiempos de las ejecuciones de coste del paper; las cifras concretas no están disponibles en la model card. Cada turno está limitado a 20 llamadas a herramientas y 1.024 tokens generados.

## Comparativa con modelos similares

| Modelo | Parámetros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Prospector (0.8B/2B/4B) | 0,8B-4B (LoRA sobre Qwen3.5) | QA agéntico sobre grafos de conocimiento científico con verificación | Apache 2.0 | Pesos, datos y runs en Hugging Face; código en GitHub |
| Qwen/Qwen3.5-4B (base) | 4B | Modelo generalista de lenguaje, sin recorrido de grafos ni verificación específica | no disponible en la información proporcionada | Hugging Face |
| Modelos RAG/GNN clásicos sobre grafos científicos | no disponible | Recuperación o propagación en grafo sin política LLM agéntica; sin generación de lenguaje natural trazable | variada | no disponible |

No existen alternativas directamente comparables publicadas con la misma combinación de política LLM compacta, recorrido agéntico de grafo y compuerta de citación verificable; la comparación más relevante es contra el modelo base Qwen3.5 sin adaptadores, que carece de la capacidad de tool use especializada en grafos.

## Limitaciones y advertencias

- Dominio de entrenamiento estrecho: los adaptadores se entrenaron sobre un grafo de semiconductores; aunque transfieren a otros tres campos, el rendimiento fuera de grafos científicos similares no está caracterizado.
- Precisión no perfecta: incluso el mejor modelo (4B en semiconductores) falla aproximadamente en un 16 % de las preguntas según la métrica gated; en los otros dominios el error ronda el 19-23 %.
- Dependencia de herramientas: la calidad de las respuestas depende de que las herramientas del grafo devuelvan las aristas correctas; un grafo incompleto o con errores degradará las respuestas.
- Idioma: el entrenamiento se basa en literatura científica en inglés; no hay información sobre soporte de castellano u otros idiomas.
- Presupuesto de inferencia acotado: 20 llamadas a herramientas y 1.024 tokens por turno pueden ser insuficientes para preguntas que requieran recorridos muy profundos en el grafo.
- Compatibilidad de carga: los adaptadores usan la nomenclatura fusionada de transformers para Qwen3.5 (`in_proj_qkv`) y requieren las versiones fijadas de `transformers` y `peft` del repositorio de código; no se garantiza compatibilidad con otros runtimes de inferencia.
- Sesgos: los sesgos heredan del modelo base Qwen3.5 y de la literatura científica usada para construir el grafo; no hay análisis de sesgos publicado.
- Riesgo de alucinación: mitigado, no eliminado; la compuerta de citación filtra cadenas no recuperadas por las herramientas, pero la interpretación de las aristas recuperadas sigue siendo tarea del modelo.
- Licencia: Apache 2.0 permite uso comercial sin restricciones destacables más allá de las obligaciones estándar de atribución.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/haiqian-mit/Prospector
- Repositorio de código (servicio, evaluación y entrenamiento): https://github.com/lamm-mit/Prospector
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper asociado: no disponible (no se incluye enlace en la model card)
