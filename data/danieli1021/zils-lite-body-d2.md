# Danieli1021/zils-lite-body-d2

## Resumen

zils-lite-body-d2 es un ajuste fino publicado como "soup body" para el pool `d3-lite` de Zils, un sistema asociado a la subred 127 de Bittensor. Lo desarrolla el usuario Danieli1021 y se distribuye bajo licencia Apache 2.0. El modelo no es autónomo: contiene únicamente pesos y está pensado para ejecutarse sobre el chasis y la capa de respuesta fijados por el pool, de modo que su función es aportar capacidad de decisión dentro de una infraestructura externa.

Técnicamente es un transformer de aproximadamente 853 millones de parámetros (852.985.920 según los safetensors), derivado de Qwen/Qwen3.5-0.8B a través de una media de tres "house bodies" también Apache 2.0: `vllm-sr/d3-lite`, `Maincode/Matilda-Decision-v1-Edge` y `zils-ai/jiwo-0.8b-full`. El entrenamiento consistió en un LoRA de rango 64 fusionado posteriormente en los pesos, con una única pasada sobre 43.260 filas y un coste de unas 2,1 horas en una RTX A6000.

Su relevancia es acotada pero específica: se trata de un modelo de decisión orientado a tareas de clasificación y puntuación calibrada (scoring Brier) dentro de un protocolo de examen, no de un modelo conversacional general. La model card reporta mejoras modestas al combinarlo con otros cuerpos del pool, aunque el propio autor advierte que sus métricas no son puntuaciones de validador y no se traducen directamente al marcador público.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen/Qwen3.5-0.8B) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de una media de pesos a partes iguales de tres cuerpos Apache 2.0 derivados de Qwen/Qwen3.5-0.8B, con revisiones concretas fijadas (`03560c26...` para d3-lite, `90c2cee9...` para Matilda-Decision-v1-Edge y `adce2ce9...` para jiwo-0.8b-full). Sobre esa base se aplicó un LoRA de rango 64 con tasa de aprendizaje 1e-4 y semilla 8, mediante el comando `python -m zils.teacher train` del repositorio de Zils en el commit `17551565...`. El adaptador se fusionó en los pesos tras una sola pasada sobre 43.260 filas.

El conjunto de entrenamiento se compone de cuatro bloques: 5.000 filas "pin" con las propias respuestas de la media inicial (las primeras 1.000 constituyen el conjunto KL de validación, con KL final de 0,109); 20.000 filas del dataset `zils-ai/zils-relay-answers`; 15.000 preguntas de práctica generadas por el autor a partir de listas de palabras y plantillas, con respuestas calculadas por código y sin solapamiento textual exacto con los ítems semilla; y 3.260 filas etiquetadas con resultados públicos (2.321 de arXiv, más 313 repetidas tres veces) construidas con `python -m zils.current` a partir de metadatos de arXiv, servidores Gerrit públicos, Wikipedia Articles for Creation y Stack Exchange. No se usaron datos de clientes ni ítems privados de examen.

## Capacidades

- Modelo de decisión y scoring: produce puntuaciones calibradas evaluadas con el protocolo Brier del pool, con pesos por categoría y bloque.
- Clasificación y respuesta sobre preguntas tipo examen dentro del protocolo Zils.
- Ejecución sobre el chasis y la capa de respuesta fijados por el pool `d3-lite`; no está pensado para inferencia autónoma fuera de ese entorno.
- Capacidad de combinarse con otros cuerpos del pool mediante mezcla de pesos (soup), con ganancias reportadas al añadirse a `thermopylae-777/zils-lite-body-2`.
- Generación de texto y razonamiento heredados de la base Qwen3.5-0.8B: no documentados de forma específica en la model card.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking, visión o audio: no disponible.

## Casos de uso

- Evaluación de decisiones en exámenes sintéticos: el modelo puntúa ítems con el esquema Brier del protocolo Zils, útil para comparar cuerpos candidatos dentro de un pool antes de desplegarlos.
- Mejora de un ensemble por mezcla de pesos: al combinarlo con `thermopylae-777/zils-lite-body-2` el autor reporta una subida de 49,39 puntos en la columna "Seeds only" frente a 48,32 del cuerpo base en solitario, lo que lo hace adecuado como componente adicional en soups.
- Sustitución de un cuerpo en producción interna del pool: dado su tamaño de 853 M parámetros, puede alojarse en una GPU de consumo para servir como cuerpo de decisión dentro del chasis `d3-lite`, reduciendo coste frente a modelos mayores.
- Investigación sobre ajuste fino con LoRA fusionado: el repositorio documenta el comando, hiperparámetros y composición del dataset, lo que sirve como referencia reproducible para experimentos de destilación desde una media de pesos.
- Puntuación de ítems con dominios específicos: la model card señala un aumento en la categoría "tools" de 38,9 a 50,5 frente al soup actual, lo que lo hace candidato para tareas de decisión con componente técnica o de herramientas.
- Prototipado rápido en entornos de investigación: con 1,7 GB de repo y pesos en safetensors, se puede cargar en una sola GPU para pruebas de calibración sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados autodeclarados por el autor sobre una aproximación local del examen (puntuación Brier calibrada, renormalizada sobre las celdas disponibles). No son puntuaciones de validador.

| Modelo | Seeds only | Seeds + Outcomes | Sin arXiv (mayoría) |
|---|---:|---:|---:|
| Soup actual (`thermopylae-777/zils-lite-body-2` + `dasLOL/zils-lite-skills-v5`) | 47,55 | 39,47 | 37,14 |
| `thermopylae-777/zils-lite-body-2` solo | 48,32 | 40,47 | 38,44 |
| Este modelo solo | 45,35 | 41,50 | 38,35 |
| Soup actual + este modelo | 49,20 | 41,04 | 38,42 |
| `thermopylae-777/zils-lite-body-2` + este modelo | 49,39 | 43,40 | 40,59 |

La desviación estándar bootstrap de la ganancia al añadir este modelo al soup actual es de 1,22, 0,62 y 0,60 puntos en las tres columnas respectivamente. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 853 M parámetros, en fp16 requiere aproximadamente 1,7 GB de pesos más overhead de activaciones y KV cache, y en cuantización de 8 bits alrededor de 0,9 GB (estimación orientativa, no confirmada por el autor).
- GPU recomendadas: el entrenamiento se realizó en una RTX A6000; para inferencia cabe en GPUs de consumo con al menos 4-6 GB de VRAM efectiva.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060, RTX 4060, RTX 4090 y similares, aunque el autor no publica requisitos oficiales.
- Opciones de despliegue: no documentadas en la model card; el modelo está atado al chasis y capa de respuesta del pool `d3-lite`, por lo que la inferencia estándar con vLLM, llama.cpp, Ollama o TGI no está descrita ni garantizada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (Seeds only) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-body-d2 (este) | 853 M | no disponible | 45,35 | Apache 2.0 | Hugging Face |
| `thermopylae-777/zils-lite-body-2` | no disponible | no disponible | 48,32 | no disponible en la información | Hugging Face |
| `dasLOL/zils-lite-skills-v5` | no disponible | no disponible | no reportado en solitario | no disponible en la información | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | no aplica (modelo general) | no disponible en la información | Hugging Face |

La comparación se limita a los cuerpos del mismo pool porque no se han publicado métricas frente a modelos de decisión externos. El modelo base Qwen3.5-0.8B se incluye como referencia de linaje, no como competidor directo en la tarea de scoring.

## Limitaciones y advertencias

- Las puntuaciones son autodeclaradas por el autor sobre una aproximación local del examen, no por un validador; en el tablero público de la misma fecha la aproximación ordena el soup actual por debajo de `thermopylae-777/zils-lite-body-2`, mientras que el tablero lo sitúa por encima, por lo que los puntos no se convierten en puntos de tablero.
- Las columnas basadas en semillas pueden ser optimistas, ya que los generadores de preguntas se diseñaron tras leer los formatos de las familias públicas `base-exam-seed`.
- La ganancia al añadirlo en solitario sobre "Seeds only" (+1,65) no supera el margen greedy más una desviación estándar.
- En solitario, el modelo está 2,2 puntos por debajo del soup actual en "Seeds only"; la categoría Arts cae de 49,6 a 34,2 mientras que tools sube de 38,9 a 50,5, lo que indica un sesgo de dominio hacia tareas técnicas.
- Las semillas cubren solo el bloque `known`; el bloque `new` está representado por dos familias de Outcomes y los flujos de reversión de Wikipedia no están cubiertos.
- No es un modelo autónomo: requiere el chasis y la capa de respuesta del pool `d3-lite`, lo que limita su uso fuera de ese ecosistema.
- No se documentan sesgos, idiomas soportados ni comportamiento de alucinación; al ser un modelo de scoring, el riesgo principal es de calibración deficiente en dominios no representados en el entrenamiento.
- Licencia Apache 2.0 permite uso comercial, pero las fuentes de datos subyacentes (Wikipedia CC BY-SA, Stack Exchange, arXiv) mantienen sus propios términos, y el autor no redistribuye texto de preguntas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Danieli1021/zils-lite-body-d2
- Modelo base vllm-sr/d3-lite: https://huggingface.co/vllm-sr/d3-lite
- Modelo base Maincode/Matilda-Decision-v1-Edge: https://huggingface.co/Maincode/Matilda-Decision-v1-Edge
- Modelo base zils-ai/jiwo-0.8b-full: https://huggingface.co/zils-ai/jiwo-0.8b-full
- Modelo base Qwen/Qwen3.5-0.8B: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset zils-ai/zils-relay-answers: https://huggingface.co/datasets/zils-ai/zils-relay-answers
- Cuerpo de referencia thermopylae-777/zils-lite-body-2: https://huggingface.co/thermopylae-777/zils-lite-body-2
- Cuerpo de referencia dasLOL/zils-lite-skills-v5: https://huggingface.co/dasLOL/zils-lite-skills-v5
- Repositorio de Zils (commit de entrenamiento `17551565cc6a7636b452765d205526a5f479aa7d`): no disponible como URL en la información proporcionada
- Documentación de la subred 127 de Bittensor: no disponible como URL en la información proporcionada
