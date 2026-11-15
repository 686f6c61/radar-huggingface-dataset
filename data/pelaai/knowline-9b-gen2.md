# PelaAI/KnowLine-9B-Gen2

## Resumen

KnowLine-9B-Gen2 es un modelo de decisión ("System One") desarrollado por PelaAI, un fine-tune del modelo denso Qwen/Qwen3.5-9B (Apache-2.0) con aproximadamente 9.653 millones de parámetros. No es un modelo generativo al uso: recibe un estado (texto o conversación) y hasta 64 preguntas tipadas (sí/no, elección entre k opciones o puntuación sobre una rúbrica) y devuelve, para cada pregunta, una distribución de probabilidad sobre sus opciones mediante un único forward pass, sin generar texto. La interfaz es compatible con clientes Jev existentes cambiando únicamente la URL base, y con otros modelos KnowLine cambiando solo el nombre del modelo.

El modelo se entrenó mediante un bucle de iteración de datos dirigido por un agente sobre un equipo todo-en-uno, con un adaptador LoRA (rango 128, alpha 256, solo el componente de lenguaje, una época) fusionado en pesos bf16. Incorpora una temperatura de lectura T = 1.63 ajustada sobre datos de validación y plegada en los pesos, lo que produce probabilidades calibradas (ECE ≈ 0.009-0.011, Brier ≈ 0.253-0.272 en la suite pública). Se sirve con doble lectura de peticiones cortas por defecto.

Es relevante ahora porque formaliza una tarea (predicción estructurada de decisiones con probabilidades calibradas) que los LLM generativos abordan de forma costosa e inconsistente, y lo hace con un modelo de 9B que cabe en hardware de gama alta de consumo en cuantización, con licencia Apache-2.0 y un pipeline de despliegue basado en SGLang. Su puntuación en la suite pública Decision Index 0.3 es 69.00 (auto-evaluada), competitiva con modelos del doble o quíntuple de tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base Qwen3.5), fine-tune LoRA del componente de lenguaje; componente de visión sin cambios respecto al modelo base |
| Parametros totales | 9.653.104.368 (≈9,65B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Pesos publicados en bf16; no se documentan otras cuantizaciones oficiales |
| Idiomas soportados | Inglés, chino simplificado, chino tradicional |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, ≈19,3 GB) |
| Pipeline | image-text-to-text |
| Temperatura de lectura | T = 1.63 plegada en el peso de la norma final; preguntas de puntuación leídas a temperatura efectiva 1.0 (`temperatures.json`) |
| Servido | SGLang 0.5.21 en bf16 + front end `knowline_server.py` (doble lectura por defecto) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B, un transformer denso de unos 9B parámetros con componente de visión, y conserva el tokenizador y la plantilla de chat de Qwen3.5. El entrenamiento consistió en un adaptador LoRA (rango 128, alpha 256, aplicado solo al componente de lenguaje, una época) fusionado posteriormente en pesos bf16. Los ejemplos de entrenamiento son tareas de decisión redactadas y etiquetadas por profesores LLM, renderizadas con la plantilla de chat de Qwen3.5; el dataset de entrenamiento no se incluye en el repositorio. No se documentan datos de RLHF ni DPO.

La innovación principal es el mecanismo de inferencia: en lugar de generar texto, el modelo realiza un forward pass por pregunta y lee la probabilidad del token de etiqueta de cada opción. Sobre esa señal se aplica una temperatura de lectura única (T = 1.63) ajustada sobre datos de validación con el mismo modo de servido y plegada en el peso de la norma final, de modo que la calibración viaja con los pesos y no requiere post-procesado. El servido por defecto aplica "doble lectura" de las peticiones cortas (desactivable con `--no-read-twice`), un patrón heredado de los modelos KnowLine mayores.

## Capacidades

- Predicción estructurada de decisiones: responde hasta 64 preguntas tipadas por petición (sí/no, elección entre k opciones, puntuación sobre rúbrica) con una distribución de probabilidad por pregunta en un solo forward pass, sin generación de texto.
- Probabilidades calibradas: ECE ≈ 0.009-0.011 y Brier ≈ 0.253-0.272 en la suite pública, con la temperatura plegada en los pesos.
- Entrada multimodal: pipeline image-text-to-text, con el componente de visión del modelo base intacto (capacidad heredada, no específicamente entrenada para decisión).
- Conversación multi-turno como estado de entrada: acepta una conversación completa como "estado" a evaluar.
- Compatibilidad de interfaz: endpoint `/v1/systemone` compatible con clientes Jev y con la interfaz de otros modelos KnowLine.
- Multilingüe limitado: inglés, chino simplificado y chino tradicional.
- No se documenta soporte de tool calling, function calling ni razonamiento agéntico multi-paso en la información disponible.

## Casos de uso

- Triaje de atención al cliente: enviar el historial de la conversación como estado y preguntas tipadas (¿procede reembolso?, ¿tono del cliente?, ¿urgencia?) para enrutar tickets con probabilidades calibradas que permiten fijar umbrales de derivación a humano.
- Moderación de contenido con umbrales: usar preguntas de elección y las probabilidades resultantes para clasificar mensajes en categorías de riesgo, aprovechando la calibración para ajustar la tasa de falsos positivos sin reentrenar.
- Enrutamiento de consultas en pipelines RAG: decidir con una sola pasada si una consulta requiere recuperación, qué índice consultar o si debe escalarse, sustituyendo una llamada generativa por una clasificación probabilística de bajo coste.
- Evaluación automática de respuestas: puntuar salidas de otros modelos sobre rúbricas (preguntas de tipo score) como juez ligero en pipelines de evaluación continua, con la ventaja de que la temperatura de lectura para puntuaciones está fijada a 1.0.
- Clasificación de documentos con imagen: al conservar el componente de visión del base, puede evaluar estados que incluyan capturas, formularios o tickets escaneados junto con texto.
- Señal de decisión en sistemas de agentes: integrar el modelo como "System One" rápido que filtra o prioriza acciones antes de invocar un LLM generativo mayor, reduciendo latencia y coste en bucles de decisión.
- Análisis de sentimiento y satisfacción en conversaciones en inglés o chino: preguntas de elección sobre tono y satisfacción con distribuciones calibradas para agregación estadística.

## Benchmarks y rendimiento

| Modelo | Tamaño | DI 0.3 público | DI 0.4.1 completo | Fuente |
|---|---|---|---|---|
| **KnowLine-9B-Gen2** | 9B | **69.00** | No evaluado aún | Auto-evaluación, kit oficial |
| karpo-decision-31B | ≈31,3B | 75.05 | 73.86 | Board |
| GLiDE 27B | ≈26,1B | 72.49 | 73.37 | Board |
| REAX 1.3 | ≈57,4B | 73.71 | 72.64 | Board |
| Logits Sigma-1 Duo | ≈57,4B | 72.93 | 72.28 | Board |
| Copernicus-31B | ≈31,3B | 70.37 | 72.11 | Board |
| KnowLine 31B Gen1.5 | ≈31,3B | 70.50 | 71.91 | Board |
| Copernicus-57B | ≈57,4B | 75.34 | 71.80 | Board |
| FlexDM-LoRA 2.1 · Gemma-4-31B | ≈31,3B | 68.99 | 71.61 | Board |

Datos del board según el espacio oficial de Decision Index, actualizado el 2026-11-12. El modelo no tiene entrada en el board; su puntuación es auto-evaluada con el kit oficial. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan ≈19,3 GB; SGLang reserva por defecto el 85 % de la memoria de la GPU, por lo que se recomienda una GPU de 24 GB o más para bf16.
- GPU recomendadas: la evaluación de Decision Index se ejecutó en H20 de 96 GB; una A100 (40/80 GB) o H100 son adecuadas para producción en bf16.
- GPU de consumo: cabe en RTX 4090 (24 GB) en bf16 con margen ajustado; en GPUs de 16 GB requeriría cuantización, que no se documenta oficialmente.
- Despliegue: SGLang 0.5.21 en bf16 mediante `serve_knowline.sh` (endpoint `/v1/systemone` en :8080, SGLang en :9080) y front end `knowline_server.py` con `knowline_layout.py`, que solo dependen de transformers y requests. Requiere transformers 5.12.1.
- Latencia y throughput: no disponibles; el coste por pregunta es un forward pass, y el modo de doble lectura duplica las lecturas de peticiones cortas (desactivable con `--no-read-twice`).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | DI 0.3 público | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| KnowLine-9B-Gen2 | ≈9,65B | No disponible | 69.00 (auto) | Apache-2.0 | Hugging Face |
| KnowLine-26B-A4B-Gen2.5 | ≈26B (MoE, A4B) | No disponible | 68.21 (auto) | No disponible en la información | Hugging Face |
| KnowLine-35B-A3B-Gen1.5 | ≈35B (MoE, A3B) | No disponible | 70.72 (auto) | No disponible en la información | Hugging Face |
| karpo-decision-31B | ≈31,3B | No disponible | 75.05 | No disponible en la información | Board / Hugging Face |
| Copernicus-31B | ≈31,3B | No disponible | 70.37 | No disponible en la información | Board / Hugging Face |

Frente a sus hermanos mayores KnowLine, el 9B-Gen2 queda a 1,72 puntos del 35B-A3B-Gen1.5 y supera en 0,79 puntos al 26B-A4B-Gen2.5 en la suite pública, con un tamaño mucho menor. No se dispone de datos de contexto ni de licencia de los modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre; solo responde preguntas tipadas con distribuciones de probabilidad. No debe usarse como chatbot ni para generación de código.
- Cobertura lingüística limitada: inglés, chino simplificado y chino tradicional; el castellano no está soportado explícitamente.
- La puntuación DI 0.3 es auto-evaluada con el kit oficial y el modelo aún no tiene entrada en el board; no hay resultados en la suite completa DI 0.4.1.
- La temperatura de calibración (T = 1.63) está plegada en los pesos y ajustada con el modo de servido concreto (doble lectura); alterar el pipeline de inferencia puede degradar la calibración.
- El dataset de entrenamiento no se publica, lo que limita la auditoría de sesgos y de composición de datos.
- Riesgo de alucinación en el sentido de asignar probabilidad alta a opciones incorrectas cuando el estado de entrada queda fuera de la distribución de entrenamiento; la calibración media no garantiza calibración por dominio.
- El componente de visión es el del modelo base y no fue entrenado específicamente para tareas de decisión sobre imágenes.
- El modo de doble lectura duplica el coste computacional en peticiones cortas salvo que se desactive explícitamente.
- Aunque la licencia es Apache-2.0, conviene verificar las condiciones del modelo base Qwen3.5 y de las dependencias (SGLang, transformers) para uso comercial en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PelaAI/KnowLine-9B-Gen2
- Guía de inferencia: https://huggingface.co/PelaAI/KnowLine-9B-Gen2/blob/main/INFERENCE.md
- README en chino: https://huggingface.co/PelaAI/KnowLine-9B-Gen2/blob/main/README.zh.md
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Modelo hermano KnowLine-26B-A4B-Gen2.5: https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2.5
- Modelo hermano KnowLine-35B-A3B-Gen1.5: https://huggingface.co/PelaAI/KnowLine-35B-A3B-Gen1.5
- Versión anterior KnowLine-9B-Gen1: https://huggingface.co/PelaAI/KnowLine-9B-Gen1
- Datos oficiales de Decision Index: https://huggingface.co/spaces/multimodalart/jev-decision-index/blob/main/data/index.json
