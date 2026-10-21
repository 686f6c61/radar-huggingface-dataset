# litert-community/clef-flash-LiteRT

## Resumen

Clef-Flash para LiteRT es la conversión comunitaria a LiteRT del modelo de decisión `Cloudflare/clef-flash`, un modelo post-entrenado a partir de `Qwen/Qwen3.5-9B`. No es un modelo generativo: recibe un estado (texto, un valor JSON, imágenes o vídeo), un conjunto de preguntas tipadas —`noul` (sí/no), `choice` (elegir entre opciones nombradas) y `score` (puntuación ordenada)— y devuelve, para cada pregunta, la probabilidad de cada opción. Una cabeza conjunta lee los estados ocultos finales de toda la petición y puntúa todas las opciones de todas las preguntas a la vez. Nunca emite texto.

La conversión, realizada por `litert-community` con litert-torch 0.9.4 para la API `CompiledModel` de ai-edge-litert 2.2.0, empaqueta el modelo en cinco grafos de fila (para peticiones de hasta 256, 512, 1 024, 2 048 y 4 096 tokens), dos torres de visión (teselas de 256 px y 448 px) y un host en Python que construye los tokens, escribe los embeddings, calcula las posiciones, elige el grafo y ejecuta la cabeza conjunta. El repositorio ocupa 75,5 GB e incluye tokenizer, tablas, pesos de la cabeza, fixtures de test y los scripts de conversión.

Su relevancia es doble: por un lado, convierte una tarea de clasificación estructurada en un formato ejecutable en escritorio sin depender de un runtime de transformers; por otro, documenta con detalle el compromiso entre fidelidad numérica y coste de inferencia (una petición de 236 tokens tarda 360,7 ms de mediana en un Apple M4 Max a float32 con Metal). Es, sin embargo, un artefacto muy específico: no cabe en un móvil, solo se ha medido en un Mac y no se han publicado resultados de benchmarks estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder denso (familia Qwen3.5) con dos torres de visión por teselas y cabeza conjunta de clasificación sobre los estados ocultos finales |
| Parametros totales | Aproximadamente 9 000 millones, heredados de `Qwen/Qwen3.5-9B`; el autor no publica el recuento exacto |
| Longitud de contexto | Hasta 4 096 tokens por petición, mediante cinco grafos de fila (256, 512, 1 024, 2 048 y 4 096 tokens); las imágenes añaden 64 tokens (tesela de 256 px) o 196 tokens (tesela de 448 px) |
| Tipos de cuantizacion | float16 en los cinco grafos de fila y en las dos torres de visión; bfloat16 en las tablas `embed_tokens` y `lm_head`; float32 en las tablas de posición de visión y en la ejecución de referencia. No se distribuyen variantes GGUF, AWQ, GPTQ ni int8 |
| Idiomas soportados | no disponible (la model card no declara idiomas) |
| Licencia | Apache-2.0 |
| Formato de pesos | LiteRT/TFLite (`.tflite`) para los grafos, safetensors para tablas y cabeza conjunta, `tokenizer.json` para el tokenizer |
| Vocabulario | 248 320 entradas |
| Dimension oculta | 4 096 |
| Tamano del repositorio | 75,5 GB |
| Modelo base | `Cloudflare/clef-flash`, post-entrenado desde `Qwen/Qwen3.5-9B` |
| Pipeline declarado | text-classification |

## Arquitectura y entrenamiento

El modelo original es un transformer decoder denso de la familia Qwen3.5, con vocabulario de 248 320 tokens y dimensión oculta de 4 096, al que Cloudflare aplicó un post-entrenamiento específico para decisión: en lugar de generar texto, el modelo expone los estados ocultos tras la normalización final y una cabeza conjunta puntúa simultáneamente todas las opciones de todas las preguntas de la petición. Esa cabeza tiene 243 538 016 bytes de pesos y se incluye sin modificar respecto al modelo del proveedor. El formato de entrada y salida sigue `systemone()`, la forma de petición compatible con SystemOne: un estado y preguntas de entrada, respuestas tipadas y un recuento de tokens de salida (siempre 0 en `output_tokens`, porque no se decodifica nada).

La conversión a LiteRT sustituye la pila completa por cinco grafos de prefill que reciben los embeddings de los tokens de la petición y las tablas rotatorias, y devuelven los estados ocultos en cada posición. Dos torres de visión con merger convierten una imagen leída en tesela cuadrada de 256 px o 448 px en 64 o 196 filas de embeddings visuales. El host en Python orquesta el proceso: tokeniza, escribe los embeddings del token en el grafo, calcula posiciones, selecciona el grafo según la longitud y ejecuta la cabeza conjunta. No se documentan en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el post-entrenamiento de Cloudflare.

## Capacidades

- Clasificación binaria sí/no mediante preguntas de tipo `noul`, con probabilidad asociada.
- Elección entre opciones nombradas (`choice`), devolviendo la distribución de probabilidad completa sobre todas las opciones.
- Puntuación ordenada (`score`), con valor esperado, confianza y leyenda de la escala.
- Procesamiento de estado multimodal: texto libre, valores JSON, imágenes y vídeo.
- Visión por teselas: 256 px (64 tokens de imagen) o 448 px (196 tokens de imagen), con torres independientes.
- Puntuación conjunta de varias preguntas en una sola pasada: todas las opciones de todas las preguntas se evalúan a la vez.
- Respuesta estructurada con recuento de tokens de entrada y salida (`usage`), apta para integración programática.
- No genera texto libre, no mantiene diálogo multi-turno y no soporta tool calling ni razonamiento multi-paso por sí mismo: es un clasificador de opciones cerradas.

## Casos de uso

- Inspección visual con criterios tipados: se envía una imagen a la torre de 448 px y un conjunto de preguntas `noul`, `choice` y `score` (por ejemplo, presencia de un componente, tipo de defecto y claridad de la imagen), y se obtiene una distribución de probabilidad por criterio utilizable como señal de control de calidad.
- Enrutamiento de decisiones en pipelines de datos: dado un estado JSON (registro de pedido, evento de log, respuesta de API), el modelo elige entre rutas predefinidas con `choice` y devuelve la probabilidad de cada una, lo que permite umbrales de derivación a revisión humana.
- Moderación y verificación de contenido con probabilidades calibradas: preguntas binarias del tipo "¿el texto contiene datos personales?" o "¿la imagen muestra un documento de identidad?" producen una probabilidad directamente consumible por una política de decisión.
- Anotación semiautomática de datasets: el modelo puntúa opciones de etiquetado sobre pares texto-imagen y el equipo humano revisa únicamente los casos con baja confianza o próximos a empate, reduciendo el coste de etiquetado.
- Extracción de atributos de formularios escaneados: combinando la tesela de 448 px con preguntas `choice` sobre campos concretos (tipo de documento, casilla marcada, legibilidad) se obtiene una salida estructurada sin OCR intermedio.
- Evaluación de calidad de capturas en aplicaciones de escritorio: antes de subir una foto, el modelo responde a preguntas de `score` sobre nitidez, encuadre o legibilidad y la aplicación decide si pedir una nueva captura; encaja porque el runtime LiteRT corre en el propio equipo sin servicio remoto.
- Componente de decisión en un agente: el agente orquestador genera el estado y las opciones, y delega en Clef-Flash la puntuación final, manteniendo la generación de texto en otro modelo y limitando esta pieza a la clasificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta métricas de validación frente a la implementación de referencia del proveedor en float32 sobre CPU, medidas en un Apple M4 Max con Metal a float32:

| Metrica | Resultado |
|---|---|
| Coincidencia con la opción más probable de la referencia (preguntas sin empate cercano) | 545 de 545 |
| Coincidencia en empates cercanos | 5 de 5, sobre 243 ejecuciones |
| Desviación máxima de probabilidad, texto | 1,08e-5 |
| Desviación máxima de probabilidad, con imagen | 1,65e-3 (atribuida a los pesos float16 de la torre de visión) |
| Latencia mediana, petición de 236 tokens | 360,7 ms |
| Latencia mediana, petición de 1 007 tokens | 1 346,9 ms |
| Prefill de 1 024 tokens (una llamada al grafo de fila de 1 024) | 1 308,5 ms |

No hay datos de throughput agregado, de latencia en GPU de escritorio fuera de Apple Silicon ni de comportamiento en otros runtimes.

## Requisitos de hardware

- VRAM/memoria estimada: cada grafo de fila contiene aproximadamente 13,8 GB de pesos float16 (13 847 841 008 bytes el de 256 tokens; 13 936 871 792 bytes el de 4 096), por lo que se necesita un dispositivo con al menos 16 GB de memoria dedicada o unificada, y 24 GB o más para operar con holgura junto a la cabeza conjunta (243,5 MB) y las tablas de embeddings (2,03 GB cada una).
- Torres de visión: 907 587 008 bytes (256 px) y 907 891 136 bytes (448 px), cargadas según la tesela utilizada.
- GPU recomendadas: el único hardware medido es un Apple M4 Max con Metal. No se han medido GPU en Linux ni Windows. Por capacidad de memoria, una A100 (40/80 GB), una H100 o una RTX 4090/5090 de 24-32 GB podrían alojar un grafo de fila, pero el autor no lo ha validado.
- Cabe en GPU de consumo: previsiblemente en RTX 4090/5090 (24-32 GB) para un solo grafo de fila, sin datos de rendimiento. No cabe en un móvil: el autor indica explícitamente que un grafo de fila (13,8 GB) supera la memoria de un teléfono de 12 GB.
- Opciones de despliegue: API `CompiledModel` de ai-edge-litert 2.2.0 con el host en Python incluido en el repositorio; conversión reproducible con litert-torch 0.9.4. No es compatible con vLLM, llama.cpp, Ollama ni TGI, y no se carga con transformers de forma directa.
- Latencia y throughput: en el M4 Max, 360,7 ms para 236 tokens y 1 346,9 ms para 1 007 tokens, incluyendo la cabeza conjunta; el prefill de 1 024 tokens equivale a unos 782 tokens/s. Al no haber decodificación, el coste es una única pasada de prefill por petición.
- Almacenamiento: el repositorio completo ocupa 75,5 GB porque incluye los cinco grafos; en producción basta con descargar el grafo de la longitud máxima que se vaya a usar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo de tarea | Licencia | Formato |
|---|---|---|---|---|---|
| `litert-community/clef-flash-LiteRT` (este) | ~9 000 M | 4 096 tokens | Decisión multimodal con opciones cerradas | Apache-2.0 | LiteRT/TFLite + safetensors |
| `Cloudflare/clef-flash` | ~9 000 M | no disponible | Decisión multimodal con opciones cerradas | no disponible en la información | Pesos del proveedor (referencia en CPU float32) |
| `Qwen/Qwen3.5-9B` | ~9 000 M | no disponible | Generación de texto | no disponible en la información | no disponible en la información |

No se han identificado en la información proporcionada otros modelos de decisión con preguntas tipadas y cabeza conjunta que sirvan de comparación directa. Frente al modelo original de Cloudflare, esta versión intercambia el runtime de referencia por LiteRT y añade grafos precompilados por longitud, a costa de fijar el techo en 4 096 tokens y de introducir error de cuantización float16 en la visión. Frente a Qwen3.5-9B, del que hereda los pesos, renuncia por completo a la generación de texto.

## Limitaciones y advertencias

- No genera texto: solo puntúa opciones predefinidas. Cualquier caso de uso que requiera respuesta abierta, resumen o diálogo multi-turno queda fuera de su alcance.
- Techo de contexto de 4 096 tokens por petición, incluyendo los tokens de imagen (64 o 196). Estados más largos deben truncarse o dividirse, con pérdida de información.
- Validación limitada a un único equipo: un Apple M4 Max con Metal a float32. No hay medidas en GPU de Linux o Windows y el autor advierte que no se ha ejecutado en telefonía.
- No cabe en dispositivos móviles: un solo grafo de fila ocupa 13,8 GB en float16, por encima de la memoria de un teléfono de 12 GB.
- Desviación numérica con imagen: hasta 1,65e-3 en probabilidades por los pesos float16 de la torre de visión, frente a 1,08e-5 en texto. En decisiones con umbrales ajustados esto puede cambiar el signo de la decisión.
- Empates cercanos: el conjunto de validación solo incluye 5 casos próximos a empate sobre 243 ejecuciones, una muestra pequeña para caracterizar el comportamiento en fronteras de decisión.
- Riesgo de confianza mal calibrada fuera de las opciones proporcionadas: si las opciones no cubren la respuesta correcta, el modelo repartirá probabilidad entre las disponibles sin señal explícita de que ninguna es válida.
- Idiomas no declarados: la model card no especifica cobertura lingüística, por lo que el comportamiento multilingüe debe validarse empíricamente antes de usarlo en producción.
- Sesgos no documentados: no hay información sobre composición del dataset de post-entrenamiento ni sobre evaluaciones de sesgo.
- Licencia Apache-2.0 declarada para este repositorio, pero conviene verificar las condiciones del modelo base `Cloudflare/clef-flash` y de `Qwen/Qwen3.5-9B` antes de un despliegue comercial, ya que la información disponible no detalla la licencia de esos artefactos.
- Repositorio de 75,5 GB: la distribución incluye cinco grafos con pesos duplicados, lo que complica el versionado y el almacenamiento en pipelines de CI.
- Sin benchmarks estándar publicados: no es posible comparar su calidad de decisión con otras alternativas mediante métricas convencionales.

## Enlaces

- Repositorio HuggingFace de esta conversión: https://huggingface.co/litert-community/clef-flash-LiteRT
- Modelo original de Cloudflare: https://huggingface.co/Cloudflare/clef-flash
- Modelo base generativo: https://huggingface.co/Qwen/Qwen3.5-9B
- Blog de Cloudflare sobre modelos de decisión: https://blog.cloudflare.com/clef-decision-models
- litert-torch 0.9.4 y ai-edge-litert 2.2.0: mencionados en la model card como herramientas de conversión y ejecución; no se proporciona URL en la información disponible.
