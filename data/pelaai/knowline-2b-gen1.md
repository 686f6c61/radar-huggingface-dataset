# PelaAI/KnowLine-2B-Gen1

## Resumen

KnowLine-2B-Gen1 es un modelo de decisión de 2.213.241.664 parámetros desarrollado por PelaAI, un equipo con sede en Japón, mediante un ajuste fino supervisado (LoRA SFT) sobre el modelo base Qwen/Qwen3.5-2B. A diferencia de un modelo generativo convencional, su función es mapear un estado estructurado y una o varias preguntas tipadas a probabilidades sobre las opciones suministradas, cubriendo preguntas de elección entre opciones nombradas, preguntas de sí/no y preguntas de puntuación ordenada. El modelo lee directamente la probabilidad de cada etiqueta de opción y no genera texto libre cuando responde.

La relevancia del modelo radica en su enfoque: sustituye la generación de texto por una lectura calibrada de logits sobre etiquetas, lo que permite obtener distribuciones de probabilidad interpretables en lugar de respuestas en lenguaje natural. Incorpora una temperatura de lectura T = 1.32 plegada en los pesos (concretamente en `model.language_model.norm.weight`), de modo que el front end lee a temperatura 1, y una división de logits por 0.7576 en las preguntas de puntuación para que se lean a temperatura efectiva 1.0. El modelo se publica junto a otras variantes de la familia: KnowLine-0.8B-Gen1, KnowLine-9B-Gen1 y KnowLine-4B-Gen5.5.

El modelo tiene una longitud de contexto no especificada en la información disponible, si bien el entrenamiento se realizó con filas de como máximo 12.288 tokens. Soporta inglés y chino (simplificado y tradicional según las evaluaciones internas), se distribuye bajo licencia Apache-2.0 y está pensado para integrarse en pipelines de decisión estructurada más que en aplicaciones de chat generativo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-2B, con torre de visión del modelo base; ajuste LoRA SFT fusionado en bf16 |
| Parametros totales | 2.213.241.664 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (entrenamiento con filas de hasta 12.288 tokens) |
| Tipos de cuantizacion | No disponible (los resultados publicados se obtuvieron en bf16) |
| Idiomas soportados | Inglés (en), chino (zh); evaluaciones internas en inglés, chino simplificado y chino tradicional |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

KnowLine-2B-Gen1 parte de Qwen/Qwen3.5-2B, un transformer multimodal con torre de visión, y se obtiene mediante una época de LoRA SFT con rango 32 y alpha 64, aplicada únicamente a las capas lineales del modelo de lenguaje y fusionada posteriormente en pesos bf16. El checkpoint publicado corresponde al final del entrenamiento. No se realizó entrenamiento de imagen: la torre de visión es la del modelo base, por lo que las capacidades visuales no han sido adaptadas a la tarea de decisión.

Los datos de entrenamiento son el mismo conjunto de decisión empleado en KnowLine-9B-Gen1: 1.143.656 filas renderizadas con la plantilla de chat de Qwen3.5 y un máximo de 12.288 tokens por fila. El conjunto de datos no se incluye en el repositorio. La innovación técnica principal es el mecanismo de lectura calibrada: una temperatura T = 1.32 ajustada sobre los conjuntos dorados del equipo y plegada en la normalización del modelo de lenguaje (documentada en `CALIBRATION.json`), junto con un factor de 0.7576 (= 1/1.32) aplicado a los logits de las preguntas de puntuación a través de `temperatures.json`. El front end renderiza los prompts con `enable_thinking=False`, ya que la plantilla de chat de Qwen3.5-2B activa el modo thinking por defecto. Para peticiones cortas de solo texto (hasta 3.000 tokens) el modelo se lee dos veces.

## Capacidades

- Preguntas de elección entre opciones nombradas, devolviendo una distribución de probabilidad sobre cada opción.
- Preguntas de sí/no con probabilidad calibrada.
- Preguntas de puntuación ordenada sobre las opciones suministradas.
- Lectura calibrada de probabilidades mediante temperatura plegada en los pesos (T = 1.32) y factor de escala en preguntas de puntuación.
- Procesamiento de entradas multimodales image-text-to-text heredado de la arquitectura base, aunque sin entrenamiento específico en imagen.
- Soporte de inglés y chino (simplificado y tradicional en las evaluaciones internas).
- Doble lectura para peticiones cortas de solo texto (hasta 3.000 tokens).
- No genera texto libre cuando responde: la salida es una distribución sobre las opciones proporcionadas.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso en la información disponible.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el estado del caso (por ejemplo, el texto de la incidencia) y una pregunta de elección con criterios nombrados (`billing`, `support`, etc.), devolviendo la probabilidad de cada equipo; encaja en pipelines de triaje donde se necesita una distribución calibrada y no una respuesta en texto libre.
- Decisiones de reembolso o compensación: con una pregunta de tipo sí/no sobre el estado de un pedido, el modelo devuelve la probabilidad de que proceda el reembolso, lo que permite fijar umbrales de automatización y derivar los casos dudosos a revisión humana.
- Puntuación de riesgo en flujos de aprobación: mediante preguntas de puntuación ordenada, el modelo asigna probabilidades a niveles de riesgo o prioridad sobre un estado estructurado, adecuado para colas de revisión con umbrales configurables.
- Clasificación estructurada por lotes: al leer directamente las probabilidades de las etiquetas, puede procesar grandes volúmenes de peticiones cortas de solo texto con doble lectura y baja latencia (mediana de 30,0 ms en una H20), lo que lo hace apto para clasificación masiva de registros.
- Moderación o etiquetado con opciones tipadas: preguntas de elección con categorías predefinidas permiten obtener una distribución sobre categorías de contenido, útil cuando se requiere una medida de confianza por clase en lugar de una etiqueta única.
- Evaluación de políticas y reglas de negocio: el modelo puede emplearse para comparar la probabilidad asignada a distintas opciones bajo una misma política, sirviendo como componente de decisión en sistemas de scoring internos donde la calibración (ECE de 0,016-0,025 en la suite pública) es un requisito.
- Integración como servicio HTTP: el front end incluido (`serve_knowline.sh`, `knowline_server.py`, `knowline_engine.py`, `knowline_layout.py`) expone el endpoint `/v1/systemone`, lo que facilita su despliegue tras una API compatible con peticiones JSON.

## Benchmarks y rendimiento

| Medicion | Resultado |
|---|---:|
| Public Decision Index 0.3 | 52,23 |
| Public raw index | 64,24 |
| Peticiones / peticiones puntuables | 140.620 / 140.178 |
| Respuestas puntuables / errores / no soportadas | 140.178 / 0 / 0 |
| Latencia una petición a la vez: mediana / media / percentil 95 | 30,0 / 60,6 / 214,9 ms |
| Consistencia (300 peticiones, 477 respuestas) | 476 idénticas; 1 casi empate (dos opciones a menos de 0,06) |
| S1MB (English v1, ejecución local): Task Avg sobre 137 benchmarks | 44,85 (26.269 decisiones, ninguna fallida ni abstenida) |
| Conjuntos internos retenidos: inglés / chino simplificado / chino tradicional | 64,9 / 66,6 / 58,5 |
| C-Eval | 67,0 |
| Open-Jev 1.1 test / OOD | 80,1 / 77,4 |
| JevBench / JevBench-hard | 77,5 / 55,9 |
| Tareas de decisión de dominios nuevos (45 tareas propias) | 32,1 |
| Instrucciones plantadas con plantillas vistas en entrenamiento | 2,6 % de respuestas desviadas a la opción plantada |
| Instrucciones plantadas con plantillas no vistas en entrenamiento | 6,3 % (38 de 600), por encima del objetivo del 5 % |
| ECE (método del board sobre la suite pública) | 0,016-0,025 |

La ejecución completa de la suite pública se realizó con el kit oficial (commit `62d2f51`) sobre cuatro servidores H20 idénticos arrancados con `serve_knowline.sh` y 32 fragmentos de cliente; ninguna petición requirió reintento y ninguna entrada fue truncada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2.213.241.664 parámetros en bf16 el peso ocupa aproximadamente 4,4 GB, a lo que hay que sumar la torre de visión y el estado de activaciones.
- GPU recomendadas: los resultados publicados se obtuvieron en NVIDIA H20; no se documentan otras GPU en la información disponible.
- GPU de consumo: no se documenta compatibilidad con GPU de consumo en la información disponible.
- Opciones de despliegue: el autor incluye un front end basado en SGLang 0.5.21 junto con `transformers` y PyTorch con CUDA; el script `serve_knowline.sh` arranca el servicio y expone `/v1/systemone`. No se documentan despliegues con vLLM, llama.cpp, Ollama ni TGI.
- Latencia: una petición a la vez en una H20, mediana de 30,0 ms, media de 60,6 ms y percentil 95 de 214,9 ms.
- Throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

Datos del snapshot del board Decision Index (multimodalart/jev-decision-index @ c130faf6, generado el 2026-10-29 14:04 UTC). La puntuación completa DI 0.4.1 proviene de la ejecución privada de los mantenedores del board.

| Modelo | Tamano | DI 0.3 public | DI 0.4.1 full | Fuente |
|---|---:|---:|---:|---|
| **KnowLine-2B-Gen1** | 2B | **52,23** | sin puntuar | ejecución propia, kit oficial |
| StartLux-Decision v1.1 2B | 2,3B | 59,23 | 40,11 | board |
| baselabs joey-1 (2B) | 2,7B | 63,30 | 35,91 | board |
| Jev-Style 2B v4 | 2,2B | 44,37 | 34,53 | board |
| Sieve 2B v3 | 2,3B | 53,51 | 34,45 | board |

## Limitaciones y advertencias

- El modelo no genera texto libre: solo devuelve probabilidades sobre las opciones suministradas, por lo que no es adecuado para tareas generativas.
- Riesgo de manipulación por instrucciones plantadas: el 2,6 % de las respuestas se desviaron a una opción plantada con plantillas vistas en entrenamiento y el 6,3 % (38 de 600) con plantillas no vistas, por encima del objetivo del 5 % fijado por el propio equipo.
- La puntuación completa DI 0.4.1 no está disponible para este modelo; la cifra DI 0.3 public (52,23) es una ejecución propia y no la del board.
- El rendimiento en tareas de decisión de dominios nuevos es bajo (32,1 sobre 45 tareas propias), lo que sugiere una generalización limitada fuera de las distribuciones de entrenamiento.
- El modelo no ha recibido entrenamiento de imagen: la torre de visión es la del modelo base y no está adaptada a la tarea de decisión.
- La longitud de contexto no está especificada; el entrenamiento usó filas de hasta 12.288 tokens, y la doble lectura solo se aplica a peticiones de hasta 3.000 tokens.
- Idiomas limitados a inglés y chino; no se documenta soporte de castellano ni de otras lenguas.
- La plantilla de chat de Qwen3.5-2B activa el modo thinking por defecto; es necesario pasar `enable_thinking=False` si se construyen los prompts manualmente.
- El conjunto de datos de entrenamiento no se incluye en el repositorio, lo que limita la reproducibilidad del ajuste.
- Los sesgos conocidos no se documentan en la información disponible.
- Licencia Apache-2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-2B de forma independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/PelaAI/KnowLine-2B-Gen1
- Notas de inferencia: [INFERENCE.md](INFERENCE.md) (incluido en el repositorio)
- README en chino: [README.zh.md](README.zh.md) (incluido en el repositorio)
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- KnowLine-0.8B-Gen1: https://huggingface.co/PelaAI/KnowLine-0.8B-Gen1
- KnowLine-9B-Gen1: https://huggingface.co/PelaAI/KnowLine-9B-Gen1
- KnowLine-4B-Gen5.5: https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5
- Board Decision Index: https://huggingface.co/multimodalart/jev-decision-index (snapshot c130faf6)
