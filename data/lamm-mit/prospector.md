# lamm-mit/Prospector

## Resumen

Prospector es una familia de políticas de lenguaje compactas, post-entrenadas por el grupo lamm-mit para responder preguntas sobre un grafo de conocimiento científico. En lugar de responder directamente, el modelo llama a un pequeño conjunto de herramientas para recorrer el grafo turno a turno, construyendo su contexto a partir de lo que cada llamada devuelve, y emite una respuesta en forma de cadena de aristas que se verifica contra lo recuperado por las herramientas. El repositorio se basa en Qwen3.5 en tamaños 0.8B, 2B y 4B, con adaptadores LoRA entrenados sobre un grafo construido a partir de literatura de fabricación de semiconductores.

Su relevancia radica en demostrar que modelos pequeños, con pesos congelados y adaptadores ligeros, pueden transferir a grafos de otros dominios (materiales bioinspirados, PFAS, propiedades de materiales) sin reentrenamiento. Además, el repositorio no solo incluye los pesos: publica las filas de entrenamiento, las ejecuciones de evaluación almacenadas y el código completo para servir, evaluar y reentrenar la política sobre grafos propios, lo que lo hace especialmente reproducible y útil para investigación en razonamiento con herramientas.

Cada tamaño se sirve apilando varios adaptadores LoRA sobre `Qwen/Qwen3.5-<size>` con la plantilla de chat `plain_chatml`, con un presupuesto de 20 llamadas a herramientas y 1.024 tokens generados por turno. El repositorio pesa unos 6,6 GB (unos 9 GB descargados con datos).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer Qwen3.5, con uso de herramientas para recorrido de grafos |
| Parametros totales | 0,8B, 2B y 4B (segun el tamaño base elegido; el repositorio esta centrado en la variante 4B) |
| Parametros activos | no disponible (no es MoE; todos los parametros del modelo base estan activos) |
| Longitud de contexto | no disponible de forma explicita; una ejecucion de evaluacion usa contexto de 32k (`ctx32k`) |
| Tipos de cuantizacion | no disponible (pesos LoRA en precision nativa, sin cuantizacion publicada) |
| Idiomas soportados | no disponible (el dominio de entrenamiento es literatura cientifica en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptadores LoRA en nomenclatura fusionada de transformers para Qwen3.5, `in_proj_qkv`) |

## Arquitectura y entrenamiento

Prospector no es un modelo desde cero: es un post-entrenamiento sobre Qwen3.5 (0,8B, 2B y 4B) mediante adaptadores LoRA. La politica opera como un agente que invoca herramientas para traversar un grafo de conocimiento cientifico, acumulando evidencia en su contexto turno a turno antes de responder. La respuesta toma la forma de una cadena de aristas citadas, que un "gate" verifica: una cadena se acepta solo si cada arista citada fue efectivamente devuelta por una herramienta y la respuesta nombra un nodo de la cadena. Adicionalmente, se entrena un verificador sobre las muestras de la propia politica servida.

La receta de entrenamiento consta de cuatro etapas por tamaño: (1) una etapa supervisada (SFT) sobre demostraciones de un profesor frontera, (2) una ronda de GRPO (Group Relative Policy Optimization) sobre episodios completos, (3) una segunda etapa supervisada mezclando las demostraciones con los episodios propios retenidos por la politica, y (4) dos rondas de decision de GRPO que reanudan estados intermedios de episodio almacenados. Los adaptadores se entrenaron sobre un grafo construido a partir de la literatura de fabricacion de semiconductores, y con los pesos congelados los mismos adaptadores transfieren a grafos de otros tres campos. El numero de tokens de entrenamiento y la composicion detallada del dataset no estan disponibles en la model card.

## Capacidades

- Respuesta de preguntas sobre grafos de conocimiento cientifico mediante recorrido multi-turno con herramientas (graph traversal).
- Generacion de cadenas de razonamiento verificables: cada respuesta cita aristas que deben proceder de llamadas reales a herramientas, lo que permite verificacion automatica.
- Uso de herramientas (tool use) con un presupuesto de 20 llamadas y 1.024 tokens generados por turno.
- Transferencia zero-shot a grafos de dominios distintos del de entrenamiento (materiales bioinspirados, PFAS, propiedades de materiales) sin ajustar los pesos.
- Razonamiento cientifico sobre literatura de semiconductores y ciencia de materiales.
- Disponibilidad de un verificador entrenado por tamaño para filtrar o puntuar respuestas.
- Integracion con un harness de evaluacion reproducible: cada numero del paper asociado a un comando y a una ejecucion almacenada.

No hay evidencia publicada en la model card de capacidades de vision, audio ni de generacion de codigo general.

## Casos de uso

- Consulta de grafos de conocimiento cientificos: investigadores pueden hacer preguntas en lenguaje natural sobre un grafo derivado de literatura (por ejemplo, procesos de fabricacion de semiconductores) y obtener respuestas con cadenas de aristas citadas y verificables.
- Sistemas de pregunta-respuesta con verificacion de alucinaciones: el gate que comprueba que cada arista citada fue devuelta por una herramienta hace que el sistema sea adecuado para entornos donde la trazabilidad de la respuesta es critica, como revision bibliografica regulada.
- Transferencia a nuevos dominios cientificos: un equipo con un grafo propio (por ejemplo, de farmacologia o de ciencia de materiales) puede reutilizar los adaptadores congelados y evaluar directamente con el harness publicado, ahorrando el coste de reentrenar.
- Investigacion en agentes con herramientas: las filas de entrenamiento por etapa, las ejecuciones almacenadas y la receta SFT + GRPO multi-ronda permiten estudiar y reproducir pipelines de post-entrenamiento con aprendizaje por refuerzo sobre episodios completos.
- Entrenamiento de politicas sobre grafos propios: el repositorio de codigo incluye el procedimiento para entrenar una politica sobre un grafo arbitrario, util para organizaciones que quieran un agente de consulta especializado.
- Analisis de coste de inferencia agente: el repositorio incluye datos de velocidad de inferencia y las ejecuciones temporales detras de la figura de coste del paper, util para planificar despliegues con presupuesto de llamadas limitado (20 llamadas por episodio).
- Educacion y exploracion en ciencia de materiales: la variante 4B alcanza 0,803 de exactitud filtrada en materiales bioinspirados y 0,809 en propiedades de materiales, suficiente para asistentes de exploracion literaria con supervision humana.

## Benchmarks y rendimiento

Metrica principal: exactitud filtrada (gated accuracy), fraccion de preguntas cuya cadena pasa el gate y cuya respuesta nombra una etiqueta correcta. Medias sobre las semillas de las ejecuciones almacenadas, ± una desviacion tipica.

| Politica, grafo | Exactitud filtrada |
|---|---|
| Prospector-4B, semiconductores, 8 semillas | 0,839 ± 0,015 |
| Prospector-2B, semiconductores, 8 semillas | 0,755 ± 0,016 |
| Prospector-0.8B, semiconductores, 8 semillas | 0,694 ± 0,021 |
| Prospector-4B, materiales bioinspirados, 3 semillas | 0,803 ± 0,017 |
| Prospector-4B, PFAS, 3 semillas | 0,766 ± 0,022 |
| Prospector-4B, propiedades de materiales, 3 semillas | 0,809 ± 0,011 |

No se han publicado comparaciones con otros modelos (MMLU, HumanEval, etc.) en la informacion disponible; los resultados son especificos de esta tarea de recorrido de grafos.

## Requisitos de hardware

- La model card indica como inicio rapido un Mac con Apple silicon o una maquina Linux con GPU NVIDIA, lo que sugiere que la variante 4B con adaptadores fusionados es ejecutable en hardware de consumo; no se publican cifras de VRAM.
- VRAM estimada: no disponible. Como referencia generica, un modelo de 4B parametros en FP16 ocupa en torno a 8 GB, y variantes de 2B y 0,8B proporcionalmente menos, pero estas cifras no estan confirmadas por los autores.
- GPU recomendadas: no disponible de forma explicita; cualquier GPU de consumo con ~8-12 GB (por ejemplo RTX 3060/4090) deberia ser suficiente para la variante 4B sin cuantizar, sujeto a verificacion.
- Despliegue: el metodo soportado es el codigo del repositorio (github.com/lamm-mit/Prospector), que sirve la politica con transformers y PEFT cargando los adaptadores en orden especifico sobre Qwen3.5. No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles como cifras absolutas; el repositorio incluye `data/analysis/inference_speed.json` con los datos temporales detras de la figura de coste del paper.
- La primera ejecucion descarga el modelo base desde el Hub y fusiona los adaptadores; el download completo ronda los 9 GB.

## Comparativa con modelos similares

No hay alternativas publicadas de la misma tarea exacta (politicas LoRA para recorrido de grafos cientificos con verificacion) en la informacion disponible. Una comparacion orientativa por tamaño base:

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| Prospector (4B/2B/0.8B) | 0,8B-4B + LoRA | Agente con herramientas sobre grafos cientificos, respuestas verificables | Apache 2.0 | Pesos, datos y ejecuciones publicados |
| Qwen/Qwen3.5-4B (base) | 4B | Modelo generalista sin post-entrenamiento para grafos | no disponible en la informacion proporcionada | Pesos publicados en HuggingFace |
| Alternativas de razonamiento con grafos | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Dominio de entrenamiento estrecho: los adaptadores se entrenaron sobre un grafo de semiconductores; aunque transfieren a otros tres dominios sin reentrenar, el rendimiento fuera de grafos cientificos similares no esta caracterizado.
- Metrica especifica de tarea: la exactitud filtrada depende del gate (aristas citadas devueltas por herramientas y respuesta que nombra un nodo de la cadena); no es comparable con benchmarks generales tipo MMLU.
- Presupuesto operativo acotado: 20 llamadas a herramientas y 1.024 tokens generados por turno; preguntas que requieran recorridos mas largos pueden degradar.
- Riesgo de alucinacion mitigado pero no eliminado: el gate filtra cadenas no soportadas, pero la exactitud no es 1,0 (0,766-0,839 en 4B segun dominio).
- Idioma: el dominio de entrenamiento es literatura cientifica; no hay informacion sobre soporte de castellano ni otros idiomas.
- Compatibilidad de software: los adaptadores usan nomenclatura fusionada de transformers para Qwen3.5 (`in_proj_qkv`) y requieren las versiones fijadas de transformers y peft del repositorio de codigo; pueden no cargar con otras combinaciones de versiones.
- Licencia Apache 2.0: sin restricciones relevantes para uso comercial, aunque el modelo base Qwen3.5 puede tener sus propias condiciones; conviene revisar su ficha.
- El repositorio esta recien creado (octubre de 2026), con 0 descargas registradas, por lo que tiene poca validacion comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/lamm-mit/Prospector
- Repositorio de codigo (servir, evaluar y entrenar): https://github.com/lamm-mit/Prospector
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Paper: no disponible en la informacion proporcionada
- Demo online: no disponible
