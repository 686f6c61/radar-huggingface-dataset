# costruisci-la-tua-ai/aurora-gemma4-e4b-it-GGUF

## Resumen

Aurora-gemma4-e4b-it es un ajuste fino mediante LoRA del modelo google/gemma-4-E4B-it, desarrollado por el usuario costruisci-la-tua-ai como material didáctico del libro *Costruisci la tua AI*. El modelo actúa como asistente virtual de la "Pasticceria Aurora", un negocio ficticio creado como ejemplo, y responde en italiano a preguntas sobre horarios, precios, pedidos y conservación de productos de pastelería. El repositorio publicado es la versión cuantizada en GGUF del adaptador fusionado.

El modelo parte de una base Gemma 4 E4B con 7.463.013.674 parámetros totales, según los datos de safetensors del repositorio base. Está especializado en un dominio muy acotado y entrena con 325 conversaciones generadas sintéticamente a partir de una ficha de hechos inventada, revisadas automáticamente y luego a mano. Su relevancia es fundamentalmente educativa: demuestra el flujo completo de ajuste fino con LoRA, fusión del adaptador, cuantización a GGUF y evaluación mediante un conjunto de 30 preguntas.

La licencia es Apache 2.0 y el idioma declarado es únicamente italiano. No es un modelo de propósito general: está diseñado para operar con un prompt de sistema concreto y con el modo de razonamiento desactivado (`enable_thinking=false`).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de google/gemma-4-E4B-it), ajuste fino con LoRA fusionado |
| Parámetros totales | 7.463.013.674 (modelo base) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF; el autor menciona Q4_K_M como opción recomendada en llama.cpp |
| Idiomas soportados | italiano (it) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 19,0 GB); el modelo base original en safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer derivado de Gemma 4 E4B, ajustado con LoRA sobre el modelo base google/gemma-4-E4B-it y con el adaptador fusionado en los pesos finales. La model card no detalla la arquitectura interna del modelo base (número de capas, dimensión oculta, mecanismo de atención) ni la longitud de contexto nativa. El proceso de ajuste se realizó con un prompt de sistema fijo y sin la fase de "razonamiento" del modelo base, de modo que las respuestas requieren pasar explícitamente ese prompt de sistema y desactivar el modo thinking.

Los datos de entrenamiento consisten en 325 conversaciones generadas con un modelo abierto a partir de una ficha de hechos inventada sobre la pastelería, filtradas con reglas automáticas y revisadas manualmente. No se menciona el uso de RLHF, DPO ni un número de tokens de entrenamiento. La innovación técnica destacable es de proceso, no de arquitectura: el pipeline completo de LoRA, fusión, cuantización GGUF y evaluación con un test de 30 preguntas, documentado como ejemplo reproducible.

## Capacidades

- Generación de texto conversacional en italiano, orientada a atención al cliente.
- Respuesta a preguntas sobre horarios, precios, pedidos y conservación de productos de pastelería.
- Conversación multi-turno con prompt de sistema fijo.
- Advertencia explícita ante consultas sobre alergias e intolerancias, derivando al personal del negocio.
- Reconocimiento de límites: indica que no sabe algo y sugiere llamar o acudir a la tienda.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni otras capacidades multimodales.
- Capacidad multilingüe limitada al italiano declarado; no se documenta comportamiento en otros idiomas.

## Casos de uso

- Asistente virtual de mostrador para una pastelería ficticia o de demostración: el modelo responde con el prompt de sistema adecuado a preguntas sobre horarios y apertura, como se muestra en el ejemplo de la model card ("A che ora aprite il sabato?").
- Material didáctico para cursos de ajuste fino: sirve como ejemplo completo de LoRA sobre Gemma, fusión del adaptador y cuantización a GGUF, con un conjunto de evaluación de 30 preguntas para medir la mejora frente al modelo base.
- Demo de despliegue local con llama.cpp: el comando `llama-server -hf ...:Q4_K_M --chat-template-kwargs '{"enable_thinking":false}'` permite levantar un servidor de chat sin infraestructura adicional.
- Prueba de concepto de asistentes de dominio acotado: útil para validar la viabilidad de especializar un modelo pequeño en una ficha de hechos concreta antes de invertir en datos reales.
- Evaluación comparativa de cuantizaciones: el autor publica resultados de distintas variantes (Q2B, Q4B, QLoRA, GGUF Q4) sobre el mismo test, lo que permite estudiar el impacto de la cuantización en tareas de recuperación de hechos.
- Base para un asistente real de comercio local: con un nuevo conjunto de datos y el mismo pipeline, podría adaptarse a un negocio real, aunque requeriría reentrenamiento y validación.

## Benchmarks y rendimiento

Los únicos datos publicados son los resultados del test propio de 30 preguntas del autor, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Prueba | Preguntas correctas |
|---|---|
| aurora-g4e4b | 29/30 |
| aurora-q2b | 21/30 |
| aurora-q4b-qlora | 23/30 |
| aurora-q4b | 26/30 |
| base-g4e4b | 10/30 |
| base-q2b | 6/30 |
| base-q4b | 11/30 |
| gguf-q4-aurora-gemma4-e4b-it | 26/30 |
| gguf-q4-aurora-qwen3.5-4b-it | 26/30 |

No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 7,46 mil millones de parámetros, una cuantización Q4_K_M requiere del orden de 5-6 GB de VRAM, aunque este cálculo no lo proporciona el autor.
- GPU recomendadas: no especificadas por el autor; por tamaño, cabe en GPUs de consumo con al menos 8 GB de VRAM en Q4.
- Compatibilidad con GPU de consumo: probable en Q4 según el tamaño, aunque no confirmado por el autor.
- Opciones de despliegue: llama.cpp mediante `llama-server` (documentado en la model card); también transformers con el modelo base en safetensors.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Test propio (30 preguntas) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| aurora-gemma4-e4b-it (este) | 7,46 B (base) | no disponible | 29/30 (base original), 26/30 (GGUF Q4) | Apache 2.0 | Hugging Face |
| aurora-qwen3.5-4b-it (GGUF Q4) | no disponible (nombre sugiere ~4 B) | no disponible | 26/30 | no disponible | Hugging Face (mencionado en la model card) |
| google/gemma-4-E4B-it (base) | 7,46 B | no disponible | 10/30 (sin ajuste) | Apache 2.0 | Hugging Face |

La comparativa se limita a los datos del propio autor; no hay información sobre otros modelos de asistente de dominio acotado ni benchmarks cruzados.

## Limitaciones y advertencias

- Conoce únicamente la pastelería inventada; no debe usarse para negocios reales sin un nuevo entrenamiento.
- Puede equivocarse; en alergias e intolerancias remite al personal y no constituye consejo médico.
- Al ser un modelo pequeño, en preguntas alejadas de su tarea responde peor que el modelo base.
- Requiere pasar el prompt de sistema y desactivar el modo thinking (`enable_thinking=false`); sin ello las respuestas no son las esperadas.
- Idioma limitado al italiano; no se documenta calidad en castellano ni en otros idiomas.
- Sesgos conocidos: no documentados por el autor.
- Riesgo de alucinación: el autor advierte que puede equivocarse, aunque el entrenamiento con una ficha de hechos acotada reduce la invención fuera de dominio.
- Licencia Apache 2.0: permite uso comercial, pero el contenido está atado a un negocio ficticio y carece de valor comercial directo sin reentrenamiento.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; sin validación por parte de la comunidad.

## Enlaces

- Modelo GGUF en Hugging Face: https://huggingface.co/costruisci-la-tua-ai/aurora-gemma4-e4b-it-GGUF
- Modelo base del ajuste: https://huggingface.co/costruisci-la-tua-ai/aurora-gemma4-e4b-it
- Modelo original de Google: https://huggingface.co/google/gemma-4-E4B-it
