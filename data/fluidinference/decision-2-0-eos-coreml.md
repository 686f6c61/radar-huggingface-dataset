# FluidInference/decision-2.0-eos-coreml

## Resumen

Decision-2.0-Eos-0.8B · Core ML es la conversión a Core ML del modelo vllm-sr/Decision-2.0-Eos-0.8B, publicada por FluidInference para ejecución local en silicio de Apple. No es un modelo generativo: responde preguntas de tipo Choice (elegir entre opciones), Yes/No y Score sobre una entrada dada, devolviendo una probabilidad por cada opción y ningún texto. Su backbone es Qwen3.5-0.8B-Base (arquitectura híbrida Gated DeltaNet + atención) con una cabeza de decisión compartida (bilineal + MLP sobre estados ocultos normalizados).

El interés técnico del port está en el empaquetado de consultas: una sola llamada al modelo responde todas las preguntas de una petición. El prefijo compartido (el contexto) se procesa una única vez y cada pregunta continúa desde ese estado, incluyendo el estado recurrente de las capas DeltaNet y el historial de convolución, no solo las claves de atención. El paquete `Decision2EosPacked.mlpackage` ocupa 1,4 GB en fp16 y expone cinco funciones que comparten una única copia de los pesos, con distintos límites de tokens de prefijo, tokens de pregunta y slots de opción.

La licencia es Apache-2.0, la misma que el modelo de origen, y el despliegue requiere macOS 15+ o iOS 18+ ejecutando en GPU. En un MacBook Pro M5 Pro con 24 GB, una petición de cinco preguntas pasa de 1.595 ms con el runtime upstream en PyTorch/MPS a 110 ms con Core ML, una mejora aproximada de 14×.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido Qwen3.5 (Gated DeltaNet + atención) con cabeza de decisión compartida (bilineal + MLP sobre estados normalizados), exportado a Core ML |
| Parámetros totales | 0,8B (según el nombre del modelo base; no se publica desglose por componente) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | Prefijo compartido de hasta 1024 tokens (S) y hasta 1024 tokens de preguntas empaquetadas (C), según la función invocada; el resto de combinaciones llegan a 128/256/512 tokens de prefijo |
| Tipos de cuantización | fp16 (paquete de 1,4 GB); no se documentan otras precisiones |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Core ML (`Decision2EosPacked.mlpackage`); el repositorio pesa 1,6 GB |
| Modelo base | vllm-sr/Decision-2.0-Eos-0.8B (checkpoint `3594047d`) |
| Funciones expuestas | `S128_C256_N32`, `S256_C512_N64`, `S512_C768_N96`, `S512_C1024_N128`, `S1024_C1024_N128` (tokens de prefijo compartido / tokens de pregunta empaquetados / slots de opción) |
| Plataformas soportadas | macOS 15+ / iOS 18+, ejecución en GPU (`CPU_AND_GPU`) |
| Salida | Tipo `choice` / `noul` / `score`, con `probabilities`, `confidence` y `legend`; sin generación de texto |

## Arquitectura y entrenamiento

El modelo de origen usa un backbone Qwen3.5-0.8B-Base, que combina capas de atención con capas Gated DeltaNet (atención lineal con regla delta). Sobre ese backbone se monta una cabeza de decisión compartida que, en cada token final de opción y en el token final de la pregunta, calcula una puntuación bilineal más un MLP sobre los estados ocultos previamente normalizados. El resultado es una distribución de probabilidad sobre las opciones, no una secuencia de tokens.

Este repositorio no entrena ningún modelo: convierte el grafo de Decision 2.0 a Core ML reutilizando la exportación de Qwen3.5 de Kev-0.8B Core ML (`kev_stages.py`, `qwen35_export.py`) y añadiendo `eos_graph.py`. La innovación del port es el empaquetado de preguntas en una sola pasada. En las capas de atención se aplica una única máscara: los tokens del prefijo son causales y cada token de pregunta ve el prefijo real y los tokens anteriores de su propia pregunta. En las capas Gated DeltaNet el prefijo se procesa con la regla delta por bloques de 64 (las posiciones de relleno reciben β = g = 0, es decir, no operan), produciendo un estado recurrente final S₀; las preguntas empaquetadas también se procesan en bloques de 64, de modo que una pregunta que empezó en un bloque anterior continúa desde el estado arrastrado y una que empieza en el bloque actual parte de S₀. Los decaimientos y la inversa WY se enmascaran a la pregunta dentro de cada bloque (`seg_chunks`), solo la pregunta del último token de cada bloque propaga su estado (`last_seg`), y los tres primeros retardos de convolución de una pregunta leen las tres últimas entradas del prefijo (`lag_keep`, `lag_tail`). No hay información disponible sobre el dataset de entrenamiento, el número de tokens ni si se usaron RLHF o DPO.

## Capacidades

- Respuesta a preguntas de elección múltiple (Choice) devolviendo una probabilidad por opción.
- Respuesta a preguntas binarias Yes/No con probabilidad asociada.
- Puntuación (Score) de una entrada según una escala, mediante la cabeza de decisión.
- Respuesta a todas las preguntas de una petición en una sola llamada al modelo, reutilizando un prefijo compartido.
- Ejecución completamente local en dispositivo, sin necesidad de red ni de servidor de inferencia.
- Selección automática de la función más pequeña que encaja con la petición y división en fragmentos (cada uno repitiendo el prefijo) cuando ninguna función encaja.
- No soporta generación de texto libre.
- No se documenta soporte de tool calling ni de function calling.
- No se documentan capacidades de agente ni de razonamiento multi-paso.
- No se documentan capacidades multilingües ni de visión o audio.

## Casos de uso

- Enrutado semántico en el vLLM Semantic Router: el modelo fue diseñado como pieza de decisión del router, de modo que puede clasificar una consulta entrante y asignarla a la ruta, herramienta o modelo adecuado dentro de una infraestructura de despliegue.
- Clasificación y priorización de correo electrónico: la propia model card mide el caso de un correo con 64 preguntas resueltas en 13 llamadas y 874 ms, lo que lo hace viable para triaje de bandejas de entrada con muchas decisiones por mensaje.
- Moderación y filtrado de contenido: al devolver probabilidades por opción en lugar de texto, encaja bien en pipelines que necesitan un umbral de confianza explícito para aceptar o rechazar un contenido.
- Etiquetado y anotación de datasets: permite puntuar pares texto-etiqueta o resolver preguntas Yes/No sobre ejemplos a gran escala, con la ventaja de ejecutarse en local sin coste por token.
- Evaluación automática tipo LLM-as-judge: la cabeza de Score permite asignar puntuaciones a respuestas generadas por otros modelos sin generar texto adicional, lo que reduce el coste y la varianza de la evaluación.
- Asistentes de atención al cliente con decisiones cerradas: clasificar la intención de un mensaje, decidir si requiere escalado humano o elegir entre respuestas predefinidas, todo on-device.
- Procesamiento con requisitos de privacidad: al ejecutarse íntegramente en el dispositivo (macOS o iOS), los datos de entrada no salen del equipo, lo que resulta adecuado para documentos médicos, legales o financieros.
- Enrutado dentro de aplicaciones de escritorio o móviles nativas de Apple: el paquete Core ML se integra directamente en apps de macOS y iOS que necesiten decisiones rápidas sin backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card incluye únicamente una comparación de fidelidad frente al runtime upstream (fp32, Transformers 5.18, MPS) sobre el split TEST de `LocalLLaMA/typed-decisions` (400 peticiones, 2.000 decisiones), y el propio autor advierte que estas cifras son solo para comparar con el runtime de origen y no constituyen su protocolo de benchmarks.

| Métrica (split TEST typed-decisions) | Upstream (fp32/MPS) | Core ML fp16 |
|---|---:|---:|
| Precisión Choice (600) | 0,430 | 0,433 |
| Precisión Yes/No (600) | 0,598 | 0,598 |
| Precisión Score (800) | 0,379 | 0,376 |
| Respuestas distintas del upstream | — | 4 / 2.000 (todas casi empates, margen top-2 del upstream ≤ 0,003) |
| Diferencia máxima de probabilidad | — | 0,0077 |

La tokenización mediante `tokenizers` coincide con el codificador upstream en las 2.000 preguntas, y la versión fp32 en PyTorch del grafo (`EosChunked`) coincide con el upstream hasta 2e-6.

## Requisitos de hardware

- Plataforma: Apple silicon con macOS 15+ o iOS 18+; el modelo debe ejecutarse en GPU (`CPU_AND_GPU`).
- El Neural Engine no se utilizó: en Kev-0.8B, con el mismo backbone, resultó aproximadamente 24× más lento que la GPU.
- Tamaño del paquete: 1,4 GB en fp16 (1,6 GB el repositorio completo), por lo que cabe en cualquier Mac o dispositivo iOS con esos requisitos de sistema.
- Equipo de referencia de las mediciones: MacBook Pro con M5 Pro y 24 GB de RAM, macOS 27.
- Una petición de tres preguntas (quickstart de la model card) tarda 34 ms; una petición de cinco preguntas del split typed-decisions, 110 ms de mediana (frente a 1.595 ms del runtime upstream).
- Un correo con 64 preguntas tarda 874 ms en 13 llamadas (frente a 15.647 ms del upstream).
- Latencias por llamada: `S128_C256` 34 ms, `S256_C512` 64 ms, `S512_C768` 109 ms, `S512_C1024` 131 ms, `S1024_C1024` 176 ms.
- Dependencias de ejecución: `coremltools`, `tokenizers` y `numpy`; el repositorio incluye `decision2_coreml.py`, que replica la salida `system_one()` del upstream y elige la función más pequeña que encaja.
- No se contemplan despliegues con vLLM, llama.cpp, Ollama ni TGI: el formato de destino es Core ML y el runtime es el propio de Apple o el script de Python incluido.

## Comparativa con modelos similares

| Modelo | Parámetros | Backbone | Contexto / límites | Formato | Precisión (TEST typed-decisions) | Licencia |
|---|---|---|---|---|---|---|
| FluidInference/decision-2.0-eos-coreml | 0,8B | Qwen3.5 híbrido (Gated DeltaNet + atención) | Prefijo hasta 1024 y preguntas hasta 1024 (según función) | Core ML fp16 | Choice 0,433 / Yes-No 0,598 / Score 0,376 | Apache-2.0 |
| vllm-sr/Decision-2.0-Eos-0.8B (origen) | 0,8B | Qwen3.5 híbrido | no disponible | PyTorch (safetensors) | Choice 0,430 / Yes-No 0,598 / Score 0,379 | Apache-2.0 |
| FluidInference/decision-2.0-kai-coreml | 0,6B | Qwen3 | no disponible | Core ML | no disponible | no disponible |
| FluidInference/kev-0.8b-coreml | 0,8B | Qwen3.5 (mismo backbone que Eos) | no disponible | Core ML | no aplica (no es modelo de decisión) | no disponible |

## Limitaciones y advertencias

- El modelo no genera texto: solo produce probabilidades sobre opciones predefinidas. No sirve para tareas de generación, resumen o diálogo abierto.
- Las precisiones reportadas son bajas en términos absolutos: 0,433 en Choice y 0,376 en Score sobre el split TEST de typed-decisions, lo que indica un rendimiento cercano al azar en esas dos tareas y obliga a validar el caso de uso antes de producción.
- Cuando una petición no encaja en ninguna de las cinco funciones, se divide en fragmentos que repiten el prefijo compartido, con el coste de procesamiento adicional que eso implica.
- Los tiempos publicados corresponden a un MacBook Pro M5 Pro con 24 GB. El propio autor advierte que parte de la mejora frente al upstream se debe a que el runtime de PyTorch carece en macOS de sus kernels de GPU (flash-linear-attention, causal-conv1d), por lo que la ventaja es específica de esa máquina.
- El uso del Neural Engine está descartado por rendimiento (aproximadamente 24× más lento que la GPU en el modelo hermano con el mismo backbone).
- No hay información sobre idiomas soportados, sesgos conocidos ni comportamiento multilingüe.
- No hay resultados de benchmarks estándar publicados, solo la comparación de fidelidad con el upstream.
- El repositorio no tiene descargas ni valoraciones en el momento de la consulta, por lo que no existe validación externa de la comunidad.
- La licencia Apache-2.0 permite uso comercial, pero al derivar del modelo de origen conviene revisar las condiciones de este último y de los ficheros copiados (`LICENSE`, `tokenizer*.json`, `decision_config.json`).
- Persiste el riesgo de respuestas poco fiables en entradas fuera de la distribución de `typed-decisions`; el modelo no ofrece mecanismos de abstención más allá de la probabilidad devuelta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FluidInference/decision-2.0-eos-coreml
- Modelo base: https://huggingface.co/vllm-sr/Decision-2.0-Eos-0.8B
- Puerto hermano Kai 0.6B (backbone Qwen3): https://huggingface.co/FluidInference/decision-2.0-kai-coreml
- Exportación de Qwen3.5 reutilizada (Kev-0.8B Core ML): https://huggingface.co/FluidInference/kev-0.8b-coreml
- Dataset de evaluación: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
