# PelaAI/KnowLine-31B-Gen1

## Resumen

KnowLine-31B-Gen1 es un modelo de decisión ("System One") desarrollado por PelaAI, construido mediante un ajuste fino con LoRA sobre el modelo denso google/gemma-4-31B-it. No es un modelo generativo al uso: recibe un estado (texto o conversación) y hasta 64 preguntas tipadas (sí/no, elección entre k opciones o puntuación sobre una rúbrica), y devuelve para cada pregunta una distribución de probabilidad sobre sus opciones en un único forward pass, sin generar texto. Está pensado para sustituir a clasificadores ad hoc y a llamadas a modelos generativos en tareas de enrutamiento, moderación y decisión estructurada.

El modelo tiene 31.273.088.876 parámetros (denso, aproximadamente 31B), se distribuye en pesos bf16 (unos 63 GB) y conserva la torre de visión del modelo base aunque solo se entrenó con texto. Soporta inglés, chino simplificado y chino tradicional. La licencia de los pesos es Apache-2.0.

Su relevancia actual radica en que ofrece una interfaz de decisión calibrada (probabilidades con temperatura ajustada e integrada en los pesos) y un rendimiento competitivo en la suite pública Decision Index 0.3 (70,13) y en la evaluación de terceros SO-Arena (70,2, primero conjunto entre 19 configuraciones System One). Es la primera entrega de la línea KnowLine sobre una base Gemma densa, dentro de una familia que incluye variantes MoE (26B-A4B, 35B-A3B) y una pequeña (4B).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (base google/gemma-4-31B-it), ajuste LoRA fusionado; torre de visión del modelo base conservada |
| Parametros totales | 31.273.088.876 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (formato de publicación); FP8 no probado en carga según el autor |
| Idiomas soportados | inglés, chino simplificado, chino tradicional |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (bf16, unos 63 GB) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-31B-it, un transformer denso de unos 31B parámetros, y se obtiene mediante un ajuste fino supervisado con LoRA de rango 32 y alpha 64, aplicado únicamente al modelo de lenguaje durante una época. El adaptador se fusiona posteriormente en pesos bf16. Los ejemplos de entrenamiento incluyen tareas de decisión redactadas y etiquetadas por profesores LLM y renderizadas con la plantilla de chat de Gemma. No se menciona uso de RLHF ni DPO.

La innovación principal no está en la arquitectura sino en la interfaz y la calibración. El modelo responde cada pregunta con un único forward pass, calculando la probabilidad del token de etiqueta de cada opción. Una temperatura de lectura T = 1.44, ajustada sobre datos de validación con el mismo esquema de servicio, está integrada en el peso de la normalización final y en el soft-cap de logits; el front end lee las preguntas de puntuación con una temperatura efectiva de 1.0 (fichero `temperatures.json`). El servicio se realiza con SGLang en bf16 y con la opción "read twice" activada por defecto, que procesa dos veces las peticiones cortas. La torre de visión permanece sin cambios respecto al modelo base y el tokenizador es el de Gemma 4.

## Capacidades

- Clasificación y decisión estructurada: responde hasta 64 preguntas tipadas por petición (sí/no, elección entre k opciones, puntuación sobre rúbrica) con distribución de probabilidad por opción.
- Inferencia sin generación de texto: un forward pass por pregunta, lo que reduce latencia frente a esquemas generativos.
- Probabilidades calibradas: ECE de aproximadamente 0,012-0,021 y Brier score de aproximadamente 0,23-0,26 en la suite pública, según método del board.
- Capacidades de visión cero-shot: sin entrenamiento con imágenes, conserva la torre visual del base y obtiene 69,3 en la suite pública de visión oficial (auto-evaluación).
- Multilingüe en inglés, chino simplificado y chino tradicional.
- Compatibilidad de interfaz con clientes Jev existentes (solo cambia la URL base) y con otros modelos KnowLine (solo cambia el nombre del modelo).
- Enrutamiento e intención: primera posición entre configuraciones System One en la categoría de intención y enrutamiento (78,2 en SO-Arena).
- No se documentan capacidades de tool calling, agentes multi-paso ni modo thinking en la información disponible.

## Casos de uso

- Enrutamiento de tickets y peticiones: el modelo puede clasificar la intención de una consulta y dirigirla al equipo o flujo adecuado con una sola pasada por pregunta, lo que encaja en pipelines de alta concurrencia donde generar texto sería demasiado costoso.
- Moderación y seguridad de contenido: con preguntas de tipo sí/no y puntuación sobre rúbrica, permite evaluar si un mensaje cumple políticas concretas y obtener una probabilidad calibrada para fijar umbrales; en SO-Arena supera a GPT-6 Sol en seguridad (77,2 frente a 75,3).
- Atención al cliente automatizada: el ejemplo de la model card muestra cómo decidir si un agente debe ofrecer un reembolso y clasificar el tono del cliente (enfadado, neutro, satisfecho) a partir del estado de la conversación.
- Recuperación y reranking: el modelo obtiene 64,0 frente a 62,5 de GPT-6 Sol en retrieval y reranking en SO-Arena, por lo que puede puntuar la relevancia de documentos candidatos en un sistema RAG sin generar texto.
- Evaluación de respuestas y control de calidad: con preguntas de rúbrica puede puntuar salidas de otros modelos o de agentes (por ejemplo, corrección, tono, cumplimiento de instrucciones) y alimentar métricas automáticas.
- Clasificación documental multilingüe: para corpus en inglés y chino, permite etiquetar documentos según criterios definidos en el momento de la consulta, sin reentrenar un clasificador específico.
- Análisis de imágenes en modo cero-shot: gracias a la torre visual conservada, puede responder preguntas de decisión sobre pares imagen-texto, aunque con menor fiabilidad que en texto.

## Benchmarks y rendimiento

| Benchmark | KnowLine-31B-Gen1 | Referencia comparada |
|---|---|---|
| SO-Arena (evaluación de terceros, commit 8f052a8) | 70,2 (primero conjunto entre 19 configuraciones System One) | GPT-6 Sol en retrieval/reranking: 62,5; en seguridad: 75,3 |
| SO-Arena, intención y enrutamiento | 78,2 (primero entre configuraciones System One) | no disponible |
| SO-Arena, retrieval y reranking | 64,0 | GPT-6 Sol: 62,5 |
| SO-Arena, seguridad | 77,2 | GPT-6 Sol: 75,3 |
| Fiabilidad de decisión R (SO-Arena) | 0,81 (top 4 de 18 configuraciones) | no disponible |
| Decision Index 0.3 (suite pública, auto-evaluación) | 70,13 | KnowLine-35B-A3B-Gen1.5: 70,72; KnowLine-26B-A4B-Gen2.5: 68,21 |
| C-Eval | 82,5 | KnowLine-26B-A4B-Gen2.5: 77,9 |
| JevBench / JevBench-hard | 90,5 / 80,2 | KnowLine-26B-A4B-Gen2.5: 90,5 / 81,1 |
| Calibración (ECE) | 0,012-0,021 | KnowLine-26B-A4B-Gen2.5: 0,013-0,018 |
| Calibración (Brier score) | 0,23-0,26 | KnowLine-26B-A4B-Gen2.5: 0,24-0,27 |
| Suite pública de visión (auto-evaluación) | 69,3 | no disponible |

## Requisitos de hardware

- VRAM para inferencia en bf16: los pesos ocupan aproximadamente 63 GB; SGLang reserva por defecto el 85 % de la memoria de la GPU, por lo que se necesita una GPU de al menos 80 GB (A100 80GB, H100 80GB) y preferiblemente 96 GB (H20) para margen de caché KV.
- GPU recomendadas: H20 de 96 GB (configuración usada por el autor para todas las evaluaciones), H100 80GB, A100 80GB. No se documenta funcionamiento en GPUs de consumo.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en tarjetas de 48 GB en bf16; no se han publicado pesos cuantizados (GGUF, AWQ, GPTQ) en la información disponible.
- Opciones de despliegue: SGLang 0.5.21 (probado en bf16), con `serve_knowline.sh` y el front end `knowline_server.py` (depende solo de transformers y requests). FP8 no fue probado en carga según el autor. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El diseño de un forward pass por pregunta y la opción "read twice" (activa por defecto) implican dos pasadas para peticiones cortas, lo que duplica el coste de cómputo respecto a una lectura única.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Decision Index 0.3 | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| KnowLine-31B-Gen1 | 31,3B (denso) | Gemma 4 denso + LoRA | no disponible | 70,13 | Apache-2.0 | Hugging Face |
| KnowLine-35B-A3B-Gen1.5 | 35B totales / A3B activos (MoE) | MoE | no disponible | 70,72 | no disponible en la información | Hugging Face |
| KnowLine-26B-A4B-Gen2.5 | 26B totales / A4B activos (MoE) | MoE | no disponible | 68,21 | no disponible en la información | Hugging Face |
| KnowLine-4B-Gen5.5 | 4B | denso | no disponible | no disponible | no disponible en la información | Hugging Face |

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto libre ni mantiene conversaciones; solo responde preguntas tipadas con distribuciones de probabilidad.
- Idiomas limitados a inglés, chino simplificado y chino tradicional; el rendimiento en castellano no está documentado.
- La torre de visión se conserva sin entrenamiento específico: las capacidades de imagen son cero-shot y su fiabilidad es inferior a la de texto (69,3 en la suite de visión, auto-evaluación).
- Riesgo de alucinación y de calibración fuera de dominio: la temperatura está ajustada sobre datos de validación concretos y el ECE reportado (0,012-0,021) corresponde a la suite pública; en distribuciones distintas puede degradarse.
- Los resultados de Decision Index, C-Eval, JevBench y visión son auto-evaluados por el autor; solo SO-Arena es una evaluación de terceros.
- La evaluación SO-Arena se realizó sobre el commit 8f052a8, anterior a la compactación del historial del repositorio; el autor afirma que los pesos no cambiaron.
- El servicio "read twice" está activado por defecto y duplica el coste de inferencia en peticiones cortas; desactivarlo puede alterar el comportamiento calibrado.
- Requiere hardware de gama alta (80-96 GB de VRAM en bf16); no hay cuantizaciones publicadas para GPUs de consumo.
- El modelo no está afiliado ni respaldado por TypeSafe, Jev ni Google, y no deriva de TypeSafe ni Jev.
- Licencia Apache-2.0 en los pesos, lo que permite uso comercial; no se detallan restricciones adicionales sobre los datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/PelaAI/KnowLine-31B-Gen1
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Guía de inferencia: INFERENCE.md (referenciada en la model card)
- README en chino: README.zh.md (referenciado en la model card)
- SO-Arena: https://lichenlillc.github.io/SO-Arena
- Paper SO-Arena: https://arxiv.org/abs/2611.15777
- Modelo hermano KnowLine-26B-A4B-Gen2.5: https://huggingface.co/PelaAI/KnowLine-26B-A4B-Gen2.5
- Modelo hermano KnowLine-35B-A3B-Gen1.5: https://huggingface.co/PelaAI/KnowLine-35B-A3B-Gen1.5
- Modelo hermano KnowLine-4B-Gen5.5: https://huggingface.co/PelaAI/KnowLine-4B-Gen5.5
