# lamm-mit/Prospector-4B

## Resumen
Prospector-4B es un modelo de lenguaje compacto desarrollado por el grupo lamm-mit (MIT) y publicado en Hugging Face bajo licencia Apache 2.0. Se trata de un ajuste fino de Qwen/Qwen3.5-4B cuyo propósito específico es responder preguntas sobre grafos de conocimiento científicos mediante el uso de herramientas: el modelo no responde de memoria, sino que ejecuta llamadas a herramientas de forma iterativa para recorrer el grafo, una llamada por turno, y construye la respuesta como una cadena de aristas que se verifica contra lo que devolvieron las herramientas. Es el mayor de los tres modelos presentados en el artículo asociado y fue entrenado sobre un grafo construido a partir de literatura de fabricación de semiconductores, aunque con pesos congelados transfiere a grafos de otros tres dominios.

El checkpoint publicado contiene Qwen3.5-4B con tres adaptadores LoRA del artículo fusionados en su modelo de lenguaje, bajo la plantilla de chat de la política. Conserva el layout de Qwen3.5-4B, por lo que carga donde cargue el modelo base, y suma 4.659.865.088 parámetros totales con un repositorio de 9,3 GB en safetensors. Por sí solo el modelo emite una única llamada a herramienta y se detiene, de modo que necesita un arnés externo que sirva las herramientas y conduzca el episodio.

Su relevancia actual reside en el enfoque: en lugar de competir en conocimiento paramétrico, Prospector-4B se especializa en el bucle agente de recuperación estructurada sobre grafos, con verificación explícita de las aristas citadas. Esto lo hace útil para razonamiento científico auditable, donde la trazabilidad de la respuesta importa tanto como la respuesta misma.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5-4B) con tres adaptadores LoRA fusionados en el modelo de lenguaje |
| Parámetros totales | 4.659.865.088 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el protocolo del artículo usa 1.024 tokens por turno) |
| Tipos de cuantización | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (transformers) |

## Arquitectura y entrenamiento
El modelo parte de Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,66 mil millones de parámetros, sobre el que se han fusionado tres adaptadores LoRA entrenados para la política de recorrido de grafos. El checkpoint resultante mantiene el layout del modelo base y su plantilla de chat específica de la política. El entrenamiento se realizó sobre un único grafo construido a partir de literatura de fabricación de semiconductores, con filas de entrenamiento, adaptadores y ejecuciones almacenadas publicadas en un repositorio separado de Hugging Face.

La innovación técnica central no está en la arquitectura sino en el protocolo de inferencia: la política emite una llamada a herramienta por turno (operaciones como `find` y `expand`), recibe la observación correspondiente y continúa, con un presupuesto por defecto de 20 llamadas, 1.024 tokens por turno y decodificación greedy. La respuesta final incluye una cadena de aristas que se contrasta contra las aristas efectivamente vistas durante el episodio mediante una compuerta de verificación (`gate_assertion`). No se dispone de información sobre el número total de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO.

## Capacidades
- Generación de texto y razonamiento científico orientado a dominios técnicos.
- Uso de herramientas (tool calling) con una llamada por turno sobre un backend de grafo de conocimiento.
- Recorrido de grafos (graph traversal) mediante operaciones de búsqueda de entidades y expansión de vecinos.
- Respuesta a preguntas con cadena de evidencia: cita aristas del grafo y las somete a verificación.
- Modo de razonamiento explícito mediante etiquetas `<think>` antes de cada llamada a herramienta.
- Transferencia a grafos de otros dominios con pesos congelados (tres campos adicionales según el artículo).
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan capacidades de visión, audio ni matemáticas avanzadas específicas.

## Casos de uso
- Razonamiento científico auditable: el modelo responde preguntas sobre literatura de semiconductores citando aristas concretas del grafo, y la compuerta de verificación permite descartar respuestas no respaldadas por las herramientas. Es adecuado porque cada afirmación final es trazable a una observación registrada.
- Asistente de exploración de literatura técnica: un investigador formula una pregunta y el modelo localiza la entidad relevante con `find` y explora su vecindario con `expand`, devolviendo relaciones del dominio en lugar de texto generado libremente.
- Construcción de pipelines de recuperación estructurada: integrado en un arnés propio, el modelo actúa como planificador de consultas sucesivas sobre un grafo, lo que encaja en sistemas RAG sobre bases de conocimiento con esquema explícito.
- Transferencia a otros dominios con pesos congelados: según el artículo, la política se transfiere a grafos de otros tres campos, lo que permite reutilizar el mismo checkpoint cambiando únicamente el backend de grafo (`--graph`).
- Evaluación de agentes y reproducibilidad: el repositorio incluye ejecuciones almacenadas y un protocolo fijo (20 llamadas, greedy), lo que facilita comparar políticas y reproducir episodios en investigación sobre agentes.
- Prototipado en hardware de consumo: con 4,66 mil millones de parámetros y un checkpoint de 9,3 GB, el modelo se puede ejecutar con el driver `mlx:` en Apple silicon o con `vllm:` en GPU NVIDIA, lo que abarata la experimentación frente a modelos de mayor tamaño.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma oficial; el checkpoint en safetensors ocupa 9,3 GB, por lo que en precisión completa requiere al menos ese orden de magnitud, y en cuantizaciones de 8 o 4 bits el requisito se reduce proporcionalmente (sin cifras publicadas).
- GPU recomendadas: no se especifican; el ejemplo oficial documenta ejecución en Apple silicon mediante MLX y en Linux con GPU NVIDIA mediante vLLM. Por tamaño, encaja en A100, H100 y RTX 4090.
- Cabe en GPU de consumo: sí, por el número de parámetros, aunque no se publican requisitos mínimos verificados.
- Opciones de despliegue: transformers (`hf:`), vLLM (`vllm:`) y MLX (`mlx:`), seleccionables por prefijo en el argumento `--model`. No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El protocolo fija 20 llamadas a herramienta como máximo y 1.024 tokens por turno en decodificación greedy.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Prospector-4B | 4,66 B | No disponible | Recorrido de grafos de conocimiento con tool calling y verificación de aristas | Apache 2.0 | Hugging Face (transformers, safetensors) |
| Qwen/Qwen3.5-4B (base) | ~4 B (no confirmado) | No disponible | Modelo generalista de texto | No disponible en la información | Hugging Face |
| Otros modelos de la familia Prospector | No disponible | No disponible | Mismas tareas, menor tamaño según el artículo | Apache 2.0 | Hugging Face (`lamm-mit/Prospector`) |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias
- El modelo por sí solo emite una única llamada a herramienta y se detiene: requiere un arnés externo que sirva las herramientas y gestione el bucle del episodio. No es utilizable como chatbot convencional sin ese entorno.
- Está entrenado sobre un grafo concreto de literatura de semiconductores; el rendimiento fuera de ese dominio depende de la transferencia documentada y no de un entrenamiento específico.
- La calidad de la respuesta está acotada por el grafo subyacente: si la información no está en el grafo, el modelo no puede recuperarla y podría alucinar una respuesta no respaldada (la compuerta de verificación ayuda a detectarlo, pero no lo elimina).
- Presupuesto fijo de 20 llamadas a herramienta en el protocolo del artículo; preguntas que requieran recorridos más largos pueden quedar sin respuesta completa.
- Idiomas soportados no documentados; la evaluación y los ejemplos están en inglés.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero sin garantías del autor y con la obligación habitual de conservar avisos de licencia.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/lamm-mit/Prospector-4B
- Repositorio de adaptadores, filas de entrenamiento, ejecuciones y grafo de semiconductores: https://huggingface.co/lamm-mit/Prospector
- Código: https://github.com/lamm-mit/Prospector
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
