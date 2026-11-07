# litert-community/MNN-Pocket-0.3B-Dec-LiteRT

## Resumen

MNN-Pocket-0.3B-Dec-LiteRT es una conversión al formato LiteRT (el sucesor de TensorFlow Lite, mantenido por Google) del modelo de decisión `taobao-mnn/MNN-Pocket-0.3B-Dec`, publicado por la comunidad `litert-community`. No es un modelo generativo ni conversacional: recibe un `state` (texto de contexto) y un conjunto de `questions` tipadas (`choice`, `noul`, `score`) y devuelve, en un único forward pass, la probabilidad de cada opción candidata. Está construido sobre el modelo base `taobao-mnn/MNN-Pocket-0.3B` (0,3 mil millones de parámetros, familia Qwen3) y está pensado para ejecutarse íntegramente en dispositivo, incluyendo móviles Android.

La relevancia de esta ficha está en que ejemplifica un patrón distinto al de los LLM generativos: sustituir la generación de texto libre por una cabeza de clasificación/clasificación tipada que devuelve probabilidades calibradas. Esto permite enrutado de tickets, etiquetado estructurado o puntuación de opciones con una latencia de decenas de milisegundos y sin coste de servidor. La conversión se realizó con litert-torch 0.10.0 para LiteRT 2.3.0 y el adaptador LoRA del modelo fuente está fusionado en los pesos.

El repositorio ocupa 3,1 GB e incluye seis grafos (cinco para CPU/GPU con ventanas de 128, 256, 512, 1.024 y 2.048 tokens, y uno adicional de hasta 512 tokens orientado a la NPU de Qualcomm), además de un host en Python que reconstruye la petición, selecciona el grafo más pequeño que la contiene y aplica la cabeza y la temperatura del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (base Qwen3) con cabeza de decisión tipada; conversión a LiteRT (TFLite) |
| Parámetros totales | 0,3 mil millones (modelo base MNN-Pocket-0.3B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens en esta conversión (el modelo fuente soporta 32.768) |
| Tipos de cuantización | Pesos de capas lineales en float16; ejecución FP32 o FP16 (con acumulación FP32) en runtime |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT / TFLite (grafos `.tflite`), con host Python auxiliar |

## Arquitectura y entrenamiento

El modelo fuente `MNN-Pocket-0.3B-Dec` parte de `MNN-Pocket-0.3B`, un transformer decoder de 0,3 mil millones de parámetros de la familia Qwen3, y le añade una cabeza de decisión que, dada una representación de estado y un conjunto de preguntas tipadas, produce una distribución de probabilidad sobre las opciones candidatas en un solo forward pass. No genera texto: la salida es probabilística y se interpreta con la cabeza y la temperatura del modelo original. El modelo fuente incorpora un adaptador LoRA que, en esta conversión, se ha fusionado en los pesos.

La conversión a LiteRT se hizo con litert-torch 0.10.0 para LiteRT 2.3.0. Cada grafo recibe los embeddings de los tokens de la petición, las tablas rotatorias y la máscara de atención, y devuelve los hidden states tras la normalización final; el host en Python (`host/pocket_dec_litert.py`) construye la petición, elige el grafo más pequeño que la acomoda y aplica la cabeza de decisión. Los pesos de las capas lineales se almacenan en float16. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el proceso de alineación (RLHF/DPO) del modelo fuente en la información proporcionada.

## Capacidades

- Clasificación y decisión tipada: responde preguntas de tipo `choice` (elegir entre opciones), `noul` y `score`, devolviendo la probabilidad de cada candidato.
- Enrutado y etiquetado estructurado: asignación de categorías (por ejemplo, departamento de atención al cliente) a partir de un estado textual.
- Puntuación de opciones: comparación numérica de alternativas mediante la pregunta de tipo `score`.
- Inferencia en un solo paso: no hay decodificación autoregresiva ni generación de tokens.
- Ejecución en dispositivo: CPU, GPU (Metal en Apple, GPU Android con FP32/FP16) y NPU de Qualcomm (grafo específico de 512 tokens).
- Multilingüe limitado a inglés y chino.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso en el sentido de los LLM generativos; tampoco visión ni audio.

## Casos de uso

- Enrutado de tickets de soporte: dado el texto de una incidencia y un conjunto de departamentos candidatos (`returns`, `billing`, etc.), el modelo devuelve la probabilidad de cada uno y permite derivar el ticket al equipo correcto con una latencia de decenas de milisegundos, como muestra el ejemplo de la model card (60 tokens, 0,864 para `returns` frente a 0,136 para `billing`).
- Clasificación de intención en asistentes de voz o chatbots: sustituir la generación libre por una elección entre intenciones predefinidas, reduciendo el riesgo de respuestas fuera de catálogo y el coste computacional.
- Moderación y etiquetado de contenido: puntuar textos cortos contra criterios definidos (`score`) para priorizar revisiones humanas.
- Triaje en aplicaciones móviles sin conexión: al ejecutarse en LiteRT sobre CPU, GPU o NPU de Android, permite clasificar localmente sin enviar datos a un servidor, útil en sectores con requisitos de privacidad.
- Encuestas y formularios inteligentes: mapear respuestas de texto libre a opciones cerradas con probabilidades calibradas, facilitando el análisis agregado.
- Enrutado en pipelines de datos: clasificar registros de un lote (por ejemplo, correos o mensajes) antes de pasarlos a un modelo mayor, actuando como prefiltro barato en un sistema híbrido.
- Evaluación de opciones en sistemas de recomendación: usar la pregunta de tipo `score` para ordenar candidatos según el estado del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card sí incluye datos de fidelidad frente al modelo fuente y de latencia:

| Escenario | Runtime | Resultado |
|---|---|---|
| Galaxy S26, ejemplo de la model card (60 tokens) | GPU FP32 | mediana de 51,5 ms |
| Apple M4 Max | CPU 4 hilos / Metal FP32 | mismo ganador en todas las preguntas; \|Δp\| máx. 0,0021; media ≤ 1,9e-4 |
| Galaxy S26 | CPU 4 hilos / GPU FP32 | mismo ganador en todas las preguntas; \|Δp\| máx. 0,0021; media ≤ 1,9e-4 |
| Galaxy S26 | GPU FP16 con acumulación FP32 | mismo ganador salvo 28 de 35 empates cercanos; \|Δp\| máx. 0,0126 |
| Galaxy S26 | NPU (grafo de 512 tokens) | mismo ganador salvo 3 de 5 empates cercanos; \|Δp\| máx. 0,0060 |
| Pixel 11 Pro | CPU / GPU FP32 | mismo ganador en todas las preguntas; \|Δp\| máx. 0,0021 |

La evaluación de fidelidad usó 2.409 preguntas en Mac (2.000 del split de test de `LocalLLaMA/typed-decisions`, 402 de las peticiones de `litert-community/Kev-0.8B-LiteRT` y 7 de los ejemplos) y subconjuntos fijos en móvil (322, 61, 142, 127 y 16 preguntas según el grafo).

## Requisitos de hardware

- VRAM/RAM: el repositorio ocupa 3,1 GB; el modelo base tiene 0,3 mil millones de parámetros, por lo que en float16 los pesos rondan los 0,6 GB y en float32 alrededor de 1,2 GB, más el overhead de los seis grafos empaquetados.
- GPU recomendadas: no requiere GPU de datacenter; está diseñado para GPU integradas y móviles (Metal en Apple M4 Max, GPU de Galaxy S26 y Pixel 11 Pro). No se han publicado pruebas en A100/H100.
- GPU de consumo: cabe holgadamente en cualquier GPU de consumo moderna; el caso de uso principal es móvil y edge.
- Despliegue: runtime LiteRT 2.3.0 (CPU, GPU, NPU Qualcomm), con host Python (`host/pocket_dec_litert.py`) que requiere `host/requirements.txt`. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia: mediana de 51,5 ms en GPU FP32 de Galaxy S26 para una petición de 60 tokens. No se han publicado cifras de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| MNN-Pocket-0.3B-Dec-LiteRT (esta ficha) | 0,3 B | 2.048 tokens (fuente: 32.768) | Decisión/clasificación tipada | Apache 2.0 | LiteRT/TFLite |
| taobao-mnn/MNN-Pocket-0.3B-Dec (fuente) | 0,3 B | 32.768 tokens | Decisión/clasificación tipada | no disponible en la información | safetensors (PyTorch) |
| litert-community/MNN-Pocket-0.3B | 0,3 B | 4.096 tokens (prompt + respuesta) | Generación de texto | no disponible en la información | LiteRT |
| litert-community/Kev-0.8B-LiteRT | 0,8 B | no disponible | Generación de texto | no disponible en la información | LiteRT |

No se dispone de datos de benchmarks comparativos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo conversacional: no genera texto libre; solo devuelve probabilidades sobre opciones predefinidas.
- Límite de contexto de 2.048 tokens en esta conversión, frente a los 32.768 del modelo fuente; una petición más larga lanza `ValueError` y el host no la trunca.
- En GPU es obligatorio usar precisión FP32 (`GpuOptions(enforce_f32=True)` o equivalente en Kotlin/C). En FP16 el ganador cambia en hasta 5 de 305 preguntas en Galaxy S26, 1 de 305 en Pixel 11 Pro y 9 de 2.314 en Apple Metal, con variaciones de probabilidad de hasta 0,068.
- FP16 con acumulación FP32 en Pixel 11 Pro incumple el umbral de error medio en 3 de 5 ficheros; FP16 simple lo incumple en todos los ficheros de ambos móviles.
- Los empates cercanos (diferencia ≤ 0,02 entre las dos opciones más probables) pueden invertirse en las variantes no exactas; el ejemplo por defecto del modelo fuente (`shipping` 0,41064 frente a `returns` 0,40709) es un caso de este tipo.
- Idiomas limitados a inglés y chino; no hay evidencia de rendimiento en castellano.
- Riesgo de sesgo y alucinación: no se documentan evaluaciones de sesgo; al ser un clasificador, el riesgo se manifiesta como etiquetas mal calibradas más que como texto inventado.
- Licencia Apache 2.0, que permite uso comercial con atribución; conviene verificar las condiciones del modelo base y del dataset `LocalLLaMA/typed-decisions` si se redistribuye.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente y poco validado por la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/litert-community/MNN-Pocket-0.3B-Dec-LiteRT
- Modelo base: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B-Dec
- Modelo base del anterior: https://huggingface.co/taobao-mnn/MNN-Pocket-0.3B
- Conversión LiteRT del modelo base: https://huggingface.co/litert-community/MNN-Pocket-0.3B
- Modelo de referencia para evaluación: https://huggingface.co/litert-community/Kev-0.8B-LiteRT
- Dataset de evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Repositorio LiteRT: https://github.com/google-ai-edge/litert
- Repositorio LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Documentación LiteRT: https://developers.google.com/edge/litert
- Página de la comunidad LiteRT: https://huggingface.co/litert-community
