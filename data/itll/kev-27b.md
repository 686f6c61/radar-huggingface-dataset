# ITLL/kev-27b

## Resumen

Kev-27B es un modelo de decisión desarrollado por ITLL (con autoría original de Jared Palmer) que parte del backbone de Qwen3.8-27B y lo convierte en un clasificador de opciones tipadas. En lugar de generar texto, el modelo lee un documento (el *estado*) y un conjunto de preguntas tipadas sobre él, y devuelve una distribución de probabilidad calibrada sobre las opciones proporcionadas con cada pregunta. Todo ello en un único forward pass de tipo prefill, sin decodificación autoregresiva.

Técnicamente es un fine-tune de pesos completos (SFT) de Qwen3.8-27B, promediado con la versión 1 (un adaptador LoRA de rango 16 sobre la misma base). La innovación principal es la sustitución del cabezal de lenguaje por un *pointer head* que puntúa el token de cierre de cada opción contra el token final de la pregunta, aplicando después un softmax para obtener probabilidades. Esto permite umbralizar las salidas y derivar los casos inciertos a revisión humana.

El modelo es relevante para pipelines de clasificación, enrutamiento y triaje documental donde se necesita una probabilidad calibrada en lugar de una respuesta generativa. Implementa la API pública System One de TypeSafe (`POST /v1/systemone`), por lo que el SDK de TypeSafe funciona sin cambios contra él. Soporta estados de hasta 65.536 tokens y está licenciado bajo Apache-2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3.8-27B) con backbone híbrido: 48 capas de Gated DeltaNet (atención lineal) y 16 de atención completa, 64 capas en total; cabezal pointer de dos proyecciones 5.120 → 256 |
| Parámetros totales | 25.624.600.064 (25,6B en el backbone + 2,6M en el cabezal) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | 65.536 tokens de estado validados, más al menos 8.192 tokens por pregunta |
| Tipos de cuantización | No disponible (el checkpoint se sirve en bf16) |
| Idiomas soportados | Inglés |
| Licencia | Apache-2.0 (pesos y cabezal; el modelo base también es Apache-2.0) |
| Formato de pesos | Safetensors (checkpoint de 51,3 GB en bf16) |

## Arquitectura y entrenamiento

El backbone es Qwen3.8-27B (revisión `1d4bf0f2`), un transformer causal de 64 capas con atención híbrida: 48 capas de Gated DeltaNet (atención lineal) y 16 capas de atención completa, con un tamaño oculto de 5.120. El modelo se ejecuta en modo prefill-only: no se cargan la torre de visión, el cabezal LM ni las capas de predicción multi-token del modelo base. Sobre las representaciones del backbone se aplica un cabezal pointer con dos proyecciones de 5.120 → 256 que puntúan el token de cierre de cada opción contra el token final de la pregunta; un softmax convierte esas puntuaciones en probabilidades.

El entrenamiento consistió en un SFT de pesos completos (todos los pesos del backbone fueron ajustados) seguido de un promediado de pesos con la versión 1 (un adaptador LoRA de rango 16 sobre la misma base). La calibración se resuelve con una única temperatura, T = 1,32, almacenada en `head.pt` y aplicada en tiempo de carga. Los estados de entrenamiento tuvieron como máximo 32.768 tokens. El conjunto de datos de entrenamiento abarca más de 35 datasets públicos, entre ellos tareas de razonamiento (aqua_rat, ai2_arc, gsm8k, math_qa, StrategyQA), NLI y sentido común (snli, multi_nli, winogrande, social_i_qa, commonsense_qa), clasificación de texto (ag_news, dbpedia_14, imdb, sst5, banking77, trec), QA multi-hop (hotpot_qa), código (commitpackft), seguridad de contenido (Aegis-AI-Content-Safety-Dataset-2.0) y finanzas (consumer-finance-complaints-large). Las preguntas se responden como filas independientes que continúan desde el estado compartido, de modo que no pueden influirse entre sí y el estado se calcula una sola vez y se cachea.

## Capacidades

- Clasificación y enrutamiento de documentos mediante preguntas tipadas de tipo `choice` (1–255 opciones con descripción opcional), `score` (1–255 niveles ordenados) y `noul` (sí/no).
- Salida de probabilidad calibrada por opción, junto con la opción más probable y una confianza, apta para umbralizar y derivar casos inciertos a revisión humana.
- Procesamiento de estados de hasta 65.536 tokens, con al menos 8.192 tokens adicionales por pregunta.
- Respuesta a múltiples preguntas independientes sobre un mismo estado, con caché del estado computado una sola vez.
- Verificación de respuestas propuestas contra criterios declarados (judging de respuestas).
- Extracción de elecciones sobre esquemas predefinidos.
- No soporta generación de texto, chat, resumen ni QA abierto: solo puntúa las opciones que se le proporcionan.
- Capacidades multilingües limitadas al inglés.

## Casos de uso

- Triaje de tickets de soporte: el modelo recibe el texto del ticket como estado y una pregunta `choice` con las categorías del equipo (facturación, técnico, cuenta, etc.), devolviendo una probabilidad por categoría que permite enrutar automáticamente los casos con confianza alta y encolar el resto para revisión humana.
- Clasificación de documentos legales o contractuales: sobre un contrato de hasta 65.536 tokens, se lanzan preguntas `noul` (por ejemplo, "¿contiene cláusula de renovación automática?") y `choice` (tipo de contrato, jurisdicción), obteniendo probabilidades calibradas para cada campo.
- Moderación de contenido: usando el estado como el texto a evaluar y preguntas `score` sobre niveles de severidad, el modelo produce una distribución sobre niveles ordenados que permite fijar umbrales de escalado.
- Verificación de respuestas en pipelines RAG: dada una respuesta candidata y las fuentes recuperadas, el modelo responde a preguntas `noul` sobre si la respuesta está respaldada por las fuentes, con probabilidad calibrada para decidir si se publica o se descarta.
- Enrutamiento de solicitudes en atención al cliente: con una pregunta `choice` sobre intención y otra sobre urgencia, el modelo clasifica la solicitud en un solo forward pass y con el estado cacheado, lo que reduce la latencia frente a múltiples llamadas generativas.
- Evaluación de elegibilidad en procesos de política interna: el estado es el expediente del solicitante y las preguntas `noul` verifican cada criterio de elegibilidad, devolviendo probabilidades que el sistema puede umbralizar según el riesgo.
- Clasificación de reseñas y feedback: preguntas `score` sobre sentimiento y `choice` sobre temática, con probabilidades calibradas para agregación posterior.
- Sustitución autoalojada de un endpoint System One: al implementar `POST /v1/systemone`, el SDK de TypeSafe funciona sin cambios, lo que permite migrar cargas de trabajo existentes a infraestructura propia.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados):

| Tarea | Conjunto de evaluación | Métrica | Valor |
|---|---|---|---|
| Decisiones tipadas, fuera de dominio (test bloqueado, leído una vez) | transfer-v4: seis fuentes públicas nunca entrenadas y estructuras de política retenidas (656 preguntas) | Accuracy | 0,8887 |
| Decisiones tipadas, fuera de dominio (test bloqueado, leído una vez) | transfer-v4 (656 preguntas) | Brier score | 0,154 |
| Decisiones tipadas, datasets públicos retenidos (test) | breadth-v1: 10 de 14 datasets públicos retenidos (2.489 preguntas) | Accuracy | 0,832 |
| Decisiones tipadas, familias de tareas retenidas (test) | tasksource-heldout-v1: 17 de 24 familias de tareas retenidas (2.024 preguntas) | Accuracy | 0,795 |
| Decisiones tipadas, habilidades, herramientas de desarrollo y documentos (test) | hard-v1 + devtools-v1 + documents-v1 (2.795 preguntas) | Accuracy | 0,889 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K en formato generativo, etc.) en la información disponible, dado que el modelo no es generativo.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint se sirve en bf16 con 25,6B parámetros, lo que requiere aproximadamente 51,3 GB solo para los pesos, más overhead de activaciones y caché KV; en la práctica se necesitan del orden de 60–70 GB de VRAM para estados largos.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para servicio en bf16 con contexto completo de 65.536 tokens. En GPUs de 48 GB (L40S, A6000) no cabe el checkpoint completo en bf16 sin cuantización.
- No cabe en GPUs de consumo (RTX 4090 de 24 GB, RTX 3090 de 24 GB) en bf16; requeriría cuantización a 8 o 4 bits, que no está documentada en la información disponible.
- Opciones de despliegue: el modelo se sirve a través de la API System One (`POST /v1/systemone`) y es compatible con el SDK de TypeSafe. La información disponible no detalla soporte explícito para vLLM, llama.cpp, Ollama o TGI, dado que el modo de ejecución es prefill-only con un cabezal pointer personalizado.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada. La categoría (modelo de decisión con salida de probabilidad calibrada sobre opciones tipadas) es poco común; los modelos de clasificación tradicionales (por ejemplo, basados en BERT) no manejan contextos de 65.536 tokens ni opciones dinámicas de hasta 255 elementos, y los LLM generativos no producen distribuciones calibradas sobre opciones en un solo forward pass.

| Modelo | Parámetros | Contexto | Salida | Licencia |
|---|---|---|---|---|
| Kev-27B | 25,6B | 65.536 tokens | Probabilidad calibrada sobre opciones tipadas | Apache-2.0 |
| Qwen3.8-27B (base) | 27B (aprox.) | No disponible en la información | Texto generativo | Apache-2.0 |
| Clasificadores BERT-style | Típicamente < 1B | Típicamente 512 tokens | Etiqueta única | Variable |

## Limitaciones y advertencias

- El modelo solo puntúa las opciones que se le proporcionan; no genera texto, no mantiene conversaciones, no resume ni responde preguntas abiertas.
- Uso limitado al inglés; no se han documentado capacidades multilingües.
- No debe emplearse para decisiones totalmente automatizadas con implicaciones legales o de alto riesgo sin revisión humana; el propio autor lo excluye del alcance previsto.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de calibración deficiente fuera de la distribución de entrenamiento; los umbrales deben congelarse sobre una muestra etiquetada de la carga de trabajo real del usuario.
- Los estados de entrenamiento tuvieron como máximo 32.768 tokens, aunque se validan 65.536; el rendimiento en la franja 32.768–65.536 puede degradarse respecto a estados más cortos.
- Las preguntas se responden de forma independiente y no pueden influirse entre sí; no es posible el razonamiento multi-turno ni la composición de preguntas dependientes.
- Los resultados de benchmarks son declarados por el autor y no están verificados de forma independiente (`verified: false` en el model-index).
- La licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base Qwen3.8-27B, también Apache-2.0.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopción aún muy limitada y poca validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/ITLL/kev-27b
- Repositorio del autor original: https://github.com/jaredpalmer/kev
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Versión anterior (v1, LoRA): https://huggingface.co/jaredpalmer/kev-27b/tree/v1-lora
- Model card de referencia del autor: https://huggingface.co/jaredpalmer/kev-27b
- API System One de TypeSafe: `POST /v1/systemone` (referenciada en la model card; no se proporciona URL directa en la información disponible)
