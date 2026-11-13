# MatteoCodiglione/3dont-nl2sparql-small-MLC

## Resumen

3dont-nl2sparql-small-MLC es una compilación para WebGPU (formato MLC, cuantización q4f16_1) del modelo MatteoCodiglione/3dont-nl2sparql-small, un ajuste fino mediante LoRA de Qwen/Qwen3.5-2B orientado a la traducción de lenguaje natural a SPARQL en el dominio de ontologías de nubes de puntos 3D. Lo desarrolla MatteoCodiglione en el marco del proyecto 3DOnt, asociado a la herramienta 3DGraphExplorer, y su función concreta no es generar SPARQL directamente, sino parsear una pregunta en inglés sobre una nube de puntos y su ontología en las cinco listas (L1..L5) que la librería NL-2-SPARQL convierte posteriormente en una consulta SPARQL válida.

El modelo parte de una base compacta de 2B parámetros (Qwen3.5-2B) y se ha entrenado con LoRA de rango 16 durante una única época sobre el conjunto NL-2-SPARQL de 3DOnt, compuesto por preguntas originales, nuevas estructuras lógicas generadas y aproximadamente 10.000 preguntas escritas a mano. El resultado es un modelo especializado y muy ligero que se distribuye en tres formatos: Hugging Face estándar, MLX 4-bit para Apple Silicon y esta variante MLC q4f16_1 para ejecución en navegador mediante WebGPU.

Su relevancia es doble: por un lado, demuestra un patrón de despliegue de modelos de dominio muy específico en el cliente (navegador o Mac), sin depender de infraestructura de servidor; por otro, ejemplifica el uso de un LLM pequeño como capa de parsing estructurado dentro de un pipeline neuro-simbólico donde la generación final de SPARQL la realiza código determinista. El repositorio ocupa 1.1 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3.5-2B) con adaptador LoRA de rango 16; compilado para MLC/WebGPU |
| Parametros totales | 2B (modelo base); el adaptador LoRA no se detalla en la información disponible |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (heredada de Qwen3.5-2B; no se especifica en la model card) |
| Tipos de cuantizacion | q4f16_1 (MLC); MLX 4-bit en el repositorio hermano |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | MLC compilado (q4f16_1) para WebGPU; repositorios hermanos en safetensors (Hugging Face) y MLX 4-bit |

## Arquitectura y entrenamiento

El modelo es un ajuste fino por LoRA (rango 16, una época) sobre Qwen/Qwen3.5-2B, un transformer decoder-only de 2B parámetros. El entrenamiento se realizó sobre el dataset NL-2-SPARQL de 3DOnt, que combina preguntas originales, nuevas estructuras lógicas generadas y alrededor de 10.000 preguntas escritas a mano. La tarea aprendida es de parsing estructurado: dada una pregunta en lenguaje natural sobre una nube de puntos 3D y su ontología, el modelo debe emitir cinco listas (L1..L5) que la librería NL-2-SPARQL traduce a SPARQL. No se especifica en la información disponible el número total de tokens de entrenamiento ni si hubo fases de RLHF o DPO.

El uso previsto impone un formato estricto: system prompt fijo ("You will receive a natural language query by the user. you just have to parse it. do not say anything else.") y plantilla de chat del modelo base con el modo thinking desactivado (`enable_thinking=False`). La innovación técnica principal no está en la arquitectura, sino en el pipeline de despliegue: el repositorio MLC contiene los pesos compilados en q4f16_1 para ejecución vía WebGPU en el navegador, lo que permite una demo online sin backend, mientras que el repositorio MLX cubre la ejecución en Apple Silicon dentro de 3DGraphExplorer.

## Capacidades

- Parsing de lenguaje natural a estructuras intermedias: convierte una pregunta en inglés sobre una nube de puntos 3D y su ontología en las cinco listas L1..L5 que consume la librería NL-2-SPARQL.
- Generación de consultas SPARQL indirecta: la consulta final la construye la librería a partir de la salida estructurada del modelo, no el LLM de forma libre.
- Salida restringida: el modelo está entrenado para responder únicamente con el parsing, sin texto adicional, según el system prompt de entrenamiento.
- Ejecución en navegador: la variante MLC q4f16_1 permite inferencia en cliente vía WebGPU.
- Ejecución en Apple Silicon: existe una variante MLX 4-bit para integrarse en 3DGraphExplorer.
- Multilingüismo: limitado a inglés según la model card.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo thinking: no disponibles o no documentados en la información proporcionada (el thinking se desactiva explícitamente).

## Casos de uso

- Consulta de ontologías 3D desde el navegador: un usuario formula una pregunta en inglés sobre una nube de puntos y el modelo, ejecutado con WebGPU vía MLC, devuelve las listas L1..L5 que la librería NL-2-SPARQL transforma en SPARQL, sin necesidad de backend ni de enviar datos a un servidor.
- Demo interactiva de 3DGraphExplorer: integración del modelo compilado en la demo online del proyecto para que cualquier visitante pruebe el flujo NL-2-SPARQL sin instalar nada.
- Exploración de datos geoespaciales y LiDAR en escritorio: despliegue con la variante MLX 4-bit en Macs con Apple Silicon dentro de la herramienta 3DGraphExplorer, aprovechando la aceleración nativa de Metal.
- Prototipado de interfaces de consulta para investigadores: sustituir la escritura manual de SPARQL por preguntas en lenguaje natural en flujos de análisis de nubes de puntos, con un modelo de 2B que cabe en hardware de consumo.
- Validación de pipelines neuro-simbólicos: usar el modelo como capa de parsing y la librería determinista como generador de SPARQL, lo que facilita auditar y testear la consulta final de forma reproducible.
- Educación y divulgación sobre ontologías y SPARQL: demostrar en un taller cómo un LLM pequeño y especializado puede actuar como traductor entre lenguaje natural y consultas estructuradas sobre una ontología concreta.
- Pruebas de despliegue edge/on-device: banco de pruebas para evaluar latencia y viabilidad de LLMs de 2B cuantizados a 4 bits en WebGPU y en Apple Silicon.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 1.1 GB; con cuantización q4f16_1 el peso en memoria es del orden de 1 GB, más overhead de activaciones y del runtime MLC.
- GPU recomendadas: cualquier GPU con soporte WebGPU (integrada o dedicada) para la variante MLC; Apple Silicon para la variante MLX 4-bit.
- GPU de consumo: sí, cabe holgadamente en GPUs de consumo y en portátiles, dado el tamaño de 2B parámetros en 4 bits.
- Opciones de despliegue: MLC LLM con backend WebGPU (esta variante), MLX en Apple Silicon (repositorio hermano) y formato Hugging Face estándar (repositorio base) para servidores con frameworks habituales.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato de despliegue |
|---|---|---|---|---|---|
| 3dont-nl2sparql-small-MLC | 2B (base Qwen3.5-2B + LoRA) | no disponible | NL a listas L1..L5 para NL-2-SPARQL (dominio 3D) | apache-2.0 | MLC q4f16_1 (WebGPU), MLX 4-bit, safetensors |
| Qwen/Qwen3.5-2B (base) | 2B | no disponible | Propósito general | no disponible en la información proporcionada | safetensors y derivados de la comunidad |
| 3dont-nl2sparql-small (Hugging Face) | 2B | no disponible | Misma tarea, formato estándar | apache-2.0 | safetensors |
| 3dont-nl2sparql-small-mlx | 2B | no disponible | Misma tarea, Apple Silicon | apache-2.0 | MLX 4-bit |

No se dispone de datos de rendimiento comparado con otros modelos NL-2-SPARQL en la información proporcionada.

## Limitaciones y advertencias

- Especialización extrema: el modelo solo está entrenado para parsear preguntas sobre la ontología de 3DOnt; fuera de ese dominio su salida no es fiable.
- Idioma: únicamente inglés según la model card; las preguntas en castellano u otros idiomas no están cubiertas.
- Formato de salida rígido: requiere el system prompt de entrenamiento y el modo thinking desactivado; desviarse de esa configuración puede degradar la calidad del parsing.
- Riesgo de alucinación estructural: al generar listas L1..L5, puede producir elementos inexistentes en la ontología; conviene validar la salida antes de pasarla a la librería NL-2-SPARQL.
- Sesgos: no documentados en la información disponible; al entrenarse con un dataset específico y unas 10.000 preguntas manuscritas, puede reflejar los sesgos de ese corpus.
- Licencia: apache-2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-2B, no indicada en la información proporcionada.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo día; no hay evidencia de uso en producción.
- Sin benchmarks publicados: no hay métricas de precisión del parsing ni comparativas con alternativas, lo que dificulta estimar su calidad objetiva.

## Enlaces

- Modelo en Hugging Face (MLC/WebGPU): https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-small-MLC
- Repositorio en formato Hugging Face: https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-small
- Repositorio MLX 4-bit: https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-small-mlx
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
