# onlyaady/BaseDecision-Dyno

## Resumen

BaseDecision-Dyno es un modelo de decisión de 4B parámetros desarrollado por el usuario onlyaady sobre Qwen/Qwen3.5-4B. No es un modelo generativo al uso: en lugar de producir texto libre, evalúa directamente un estado (documento, conversación, política o registro estructurado) junto con una pregunta y un conjunto de opciones definidas por el llamante, y devuelve la opción seleccionada junto con una probabilidad calibrada para cada alternativa. El modelo puntúa la decisión en una única pasada de scoring, sin generar explicaciones ni decodificar secuencias de respuesta.

Técnicamente es un checkpoint fusionado (LoRA-merged) con backbone BF16 y readout de decisión en FP32, que emplea atención bidireccional completa y recurrencia nativa en las capas de atención lineal. Soporta entre 2 y 255 opciones por pregunta y un contexto de 16.384 tokens renderizados por pregunta, incluyendo el overhead del prompt. La licencia es Apache 2.0 y el modelo está etiquetado únicamente para inglés.

Su relevancia radica en el enfoque "system-one": convertir la clasificación y selección entre alternativas en una tarea de scoring calibrado en lugar de generación autoregresiva, lo que elimina la caché KV de decodificación y reduce el coste por decisión. El autor reporta una puntuación de 54,80 en la suite pública Decision Index 0.3 con el kit oficial de evaluación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido con atención bidireccional completa y recurrencia nativa en capas de atención lineal (base Qwen3.5-4B) |
| Parámetros totales | 4.238.868.992 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 16.384 tokens renderizados por pregunta, incluyendo overhead del prompt |
| Tipos de cuantización | no disponible (el checkpoint publicado es BF16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (checkpoint fusionado, requiere código custom con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B mediante fine-tuning con LoRA posteriormente fusionado en un checkpoint autónomo, sin necesidad de apilar adaptadores. La arquitectura combina capas de atención completa bidireccional con capas de atención lineal que incorporan recurrencia nativa, lo que permite procesar el estado y las opciones en una sola pasada de scoring. El backbone opera en BF16, mientras que el readout de decisión y el softmax se calculan en FP32 para preservar la calibración de las probabilidades.

La innovación central es el modo "read twice" por defecto: el estado y el contenido de la pregunta/opciones se repiten dentro de una misma secuencia renderizada, seguida de una única pasada de scoring por pregunta. No se trata de dos predicciones independientes, votación ni razonamiento generado, sino de una repetición controlada del contexto que el código del modelo implementa internamente. Existe un modo alternativo `mode="flash"` de lectura única con su propia calibración. El modelo no realiza generación autoregresiva y desactiva la caché KV de decodificación. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO.

## Capacidades

- Clasificación de decisiones con opciones definidas por el llamante (entre 2 y 255 alternativas) y probabilidades normalizadas por opción.
- Decisiones de tipo `choice` (selección entre opciones con criterios) y de tipo `noul` (verdadero/falso con claves `"true"` y `"false"`).
- Procesamiento de estados heterogéneos: documentos, conversaciones, políticas o registros estructurados.
- Múltiples preguntas independientes por solicitud, cada una en su propia secuencia y forward pass.
- Calibración integrada de probabilidades aplicada internamente en ambos modos (read twice y flash).
- Sin generación de texto, explicaciones ni tool calling: la salida es exclusivamente la opción y sus probabilidades.
- Soporte multilingüe limitado al inglés.
- Sin capacidades de visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Enrutamiento de tickets de soporte: dado el texto de una incidencia y un conjunto de equipos (facturación, técnico, ventas), el modelo devuelve el equipo asignado con probabilidad calibrada, lo que permite umbrales de derivación automática o revisión humana.
- Verificación de duplicados y anomalías: con decisiones de tipo `noul`, se puede comprobar si un cargo está duplicado o si un registro cumple una condición, usando la probabilidad de `"true"` como señal de confianza.
- Triaje de cumplimiento normativo: evaluar un documento frente a opciones de clasificación regulatoria con criterios definidos, aprovechando la calibración para priorizar los casos ambiguos.
- Clasificación de intención en pipelines conversacionales: seleccionar entre intenciones predefinidas con probabilidades que alimentan lógica de fallback cuando la confianza es baja.
- Moderación y etiquetado de contenido: asignar categorías predefinidas a textos con una única pasada de scoring, sin coste de decodificación autoregresiva.
- Extracción de decisiones en registros estructurados: dado un registro y preguntas con opciones cerradas, obtener respuestas calibradas para poblar campos de una base de datos o sistema de gestión.
- Evaluación de políticas: comprobar si una situación descrita cumple o no una política interna mediante preguntas `noul`, con la probabilidad como medida de certeza.

## Benchmarks y rendimiento

El autor reporta una puntuación de **54,80** en la suite pública completa Decision Index 0.3, usando el kit oficial de evaluación y el checkpoint BF16 calibrado. No se han publicado en la información disponible resultados desglosados por tarea ni comparaciones con otros modelos.

| Benchmark | Resultado |
|---|---|
| Decision Index 0.3 (suite pública completa) | 54,80 |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 8,5 GB solo para pesos (4,24B parámetros), más overhead de activaciones y contexto; se recomienda un mínimo de 16 GB para contextos largos.
- GPU validadas por el autor: NVIDIA A100-SXM4-80GB (entorno validado con Python 3.12.15, PyTorch 2.14.0+cu130 y Transformers 5.17.0).
- GPU consumer: previsiblemente viable en RTX 4090 (24 GB) y RTX 3090 (24 GB) en BF16; en GPUs de 16 GB podría requerir cuantización, no documentada oficialmente.
- Despliegue: requiere `transformers` con `AutoModel` y `trust_remote_code=True`; se incluye un runner `inference.py` para procesamiento JSONL persistente. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el modelo no usa caché KV de decodificación y realiza una pasada de scoring por pregunta, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BaseDecision-Dyno | 4,24B | 16.384 tokens renderizados | Scoring de decisión calibrado (system-one) | Apache 2.0 | Hugging Face, código custom |
| Qwen/Qwen3.5-4B (base) | 4B | no disponible en la información | Generación de texto | no disponible | Hugging Face |
| Modelos de clasificación tipo BERT | ~0,1–0,3B | típicamente 512–8.192 | Clasificación supervisada de etiquetas fijas | variable | Hugging Face |

No se dispone de información sobre otros modelos de decisión comparables de la misma categoría ni de sus resultados en Decision Index 0.3.

## Limitaciones y advertencias

- Solo soporta inglés; no se han validado otros idiomas.
- No genera texto ni explicaciones: no es adecuado para tareas generativas, razonamiento abierto ni tool calling.
- El límite de 16.384 tokens se aplica tras el renderizado y la repetición del modo read twice, por lo que el contenido original admisible es menor que en modo flash; las solicitudes sobredimensionadas lanzan error sin truncado silencioso.
- Requiere `trust_remote_code=True` y código custom; el autor recomienda revisarlo antes de habilitarlo.
- Riesgo de alucinación no evaluado en la información disponible; la calibración de probabilidades no garantiza corrección factual.
- Sesgos conocidos: no documentados.
- El checkpoint es BF16 sin variantes cuantizadas oficiales, lo que limita el despliegue en hardware modesto.
- El runner incluido no habilita compilación, cuantización ni batching entre solicitudes, lo que puede limitar el throughput en producción.
- Uso comercial permitido por Apache 2.0, sujeto a las condiciones de la licencia del modelo base Qwen3.5-4B.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/onlyaady/BaseDecision-Dyno
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
