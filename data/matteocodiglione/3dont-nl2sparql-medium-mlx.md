# MatteoCodiglione/3dont-nl2sparql-medium-mlx

## Resumen

3dont-nl2sparql-medium-mlx es un ajuste fino mediante LoRA del modelo base Qwen/Qwen3.5-4B, especializado en la traducción de preguntas en lenguaje natural sobre nubes de puntos 3D y su ontología a las cinco listas (L1..L5) que la librería NL-2-SPARQL de 3DGraphExplorer convierte en consultas SPARQL. Lo desarrolla MatteoCodiglione y se publica en formato MLX cuantizado a 4 bits, pensado para ejecución en Apple Silicon dentro del ecosistema 3DGraphExplorer.

El modelo resuelve un problema muy concreto: el parsing estructurado de preguntas en inglés sobre datos 3D y su ontología asociada, evitando que el usuario final tenga que escribir SPARQL manualmente. No es un modelo de propósito general, sino un componente de un pipeline mayor: recibe la pregunta, devuelve las listas L1..L5 y la librería las transforma en la consulta final.

Con 4.205.751.296 parámetros totales y un repositorio de 2,4 GB, es un modelo compacto que cabe en hardware de consumo. Su relevancia radica en la especialización vertical: un ajuste LoRA de rango 16 y una época sobre un dataset de aproximadamente 10.000 preguntas escritas a mano más preguntas originales y estructuras lógicas generadas. La licencia Apache 2.0 facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen/Qwen3.5-4B) con adaptador LoRA integrado |
| Parametros totales | 4.205.751.296 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit (esta version); el repo en formato Hugging Face puede tener otras |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX 4-bit) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer denso de aproximadamente 4.200 millones de parámetros. Sobre él se aplica un ajuste fino con LoRA de rango 16 durante una época. El dataset de entrenamiento es el NL-2-SPARQL de 3DOnt, compuesto por las preguntas originales, nuevas estructuras lógicas generadas y alrededor de 10.000 preguntas escritas a mano. El objetivo de entrenamiento es el parsing: dado un enunciado en lenguaje natural, producir las cinco listas L1..L5 que la librería NL-2-SPARQL de 3DGraphExplorer transforma en SPARQL.

El prompt de sistema usado en entrenamiento es `You will receive a natural language query by the user. you just have to parse it. do not say anything else.` y se emplea la plantilla de chat del modelo base con el modo thinking desactivado (`enable_thinking=False`). La versión publicada en este repositorio está cuantizada a 4 bits en formato MLX para su ejecución en Apple Silicon. No se detalla en la información disponible la composición exacta del dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Parsing de lenguaje natural a estructuras intermedias (listas L1..L5) para la generación de SPARQL sobre ontologías de nubes de puntos 3D.
- Generación de texto restringida a la tarea de parsing, siguiendo el prompt de sistema de entrenamiento.
- Ejecución en Apple Silicon mediante MLX 4-bit, integrable en 3DGraphExplorer.
- Modo thinking desactivado en la plantilla de chat, orientado a respuestas directas y concisas.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la model card.
- Capacidades de visión, audio o thinking mode: no disponibles.

## Casos de uso

- Consulta de ontologías 3D en lenguaje natural: un usuario formula una pregunta en inglés sobre una nube de puntos y el modelo devuelve las listas L1..L5 que la librería NL-2-SPARQL convierte en SPARQL, evitando que el usuario escriba consultas manualmente.
- Integración en 3DGraphExplorer sobre Apple Silicon: al estar en formato MLX 4-bit, se puede desplegar localmente en un Mac para explorar grafos de conocimiento 3D sin depender de servicios en la nube.
- Prototipado de interfaces de consulta para investigadores: permite construir rápidamente un front-end de preguntas y respuestas sobre datasets de nubes de puntos y su ontología asociada.
- Automatización de pipelines de extracción de información 3D: el modelo actúa como primer eslabón que traduce la intención del usuario a una estructura intermedia parseable, que luego se ejecuta contra el grafo.
- Demos web mediante WebGPU: la variante MLC q4f16_1 del mismo ajuste permite ofrecer una demo online del parser sin infraestructura de servidor GPU.
- Evaluación de la calidad del parsing en dominios 3D: sirve como componente de referencia para comparar estrategias de traducción NL→SPARQL en ontologías de nubes de puntos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 2,4 GB en MLX 4-bit, por lo que se estima un uso de memoria unificado en torno a esa cifra más el overhead del runtime.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y superiores) con soporte MLX; no se especifican GPU NVIDIA o AMD para esta variante.
- Cabe en GPU de consumo: sí, en equipos Apple Silicon con memoria unificada suficiente (el tamaño del repo es de 2,4 GB).
- Opciones de despliegue: MLX en Apple Silicon; para otras plataformas existe el repo en formato Hugging Face (`MatteoCodiglione/3dont-nl2sparql-medium`) y la variante MLC WebGPU q4f16_1.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| 3dont-nl2sparql-medium-mlx | 4.205.751.296 | no disponible | MLX 4-bit | apache-2.0 | NL→SPARQL sobre ontologías 3D |
| Qwen/Qwen3.5-4B (base) | ~4B | no disponible | safetensors | no disponible en la informacion | Modelo generalista |
| 3dont-nl2sparql-medium (HF) | 4.205.751.296 | no disponible | safetensors | apache-2.0 | Mismo ajuste en formato Hugging Face |
| 3dont-nl2sparql-medium-MLC | 4.205.751.296 | no disponible | MLC q4f16_1 | apache-2.0 | Mismo ajuste para WebGPU |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para parsing NL→SPARQL en el dominio de ontologías de nubes de puntos 3D; su uso fuera de ese dominio producirá salidas poco fiables.
- Solo soporta inglés según la model card; las consultas en otros idiomas no están cubiertas.
- No se han publicado evaluaciones de sesgo, alucinación ni robustez; el riesgo de generar listas L1..L5 incorrectas existe y debe validarse en producción.
- El prompt de sistema debe respetarse tal cual se usó en entrenamiento; desviarse de él puede degradar la calidad del parsing.
- El modo thinking debe permanecer desactivado (`enable_thinking=False`) para reproducir el comportamiento entrenado.
- La licencia Apache 2.0 permite uso comercial, pero no se especifican restricciones adicionales sobre los datos de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria disponible.

## Enlaces

- Hugging Face (MLX 4-bit): https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-medium-mlx
- Repositorio en formato Hugging Face: https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-medium
- Repositorio MLC WebGPU: https://huggingface.co/MatteoCodiglione/3dont-nl2sparql-medium-MLC
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
