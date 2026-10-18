# LasagnaS/toti-qwen-1.7b-v11-faster-training-gguf

## Resumen

`toti-qwen-1.7b-v11-faster-training-gguf` es un fine-tune por LoRA de Qwen3-1.7B, publicado por el usuario LasagnaS en formato GGUF (cuantización Q4_K_M) y distribuido con licencia Apache 2.0. No es un modelo de propósito general: está entrenado específicamente para el chatbot de WhatsApp de la tienda de repostería Toti Cakery, con el objetivo de resolver dos tareas concretas, la emisión de llamadas a herramientas (tool calling) en formato JSON para consultar menú, productos, pedidos o informes, y la redacción de respuestas de FAQ ancladas a un contexto recuperado por RAG.

El modelo parte de `unsloth/Qwen3-1.7B` y se ha ajustado sobre un dataset propietario de tool calling (revisión v11-faster-training) alojado en el repositorio público Chatbot-Cakery. Con 1.720.574.976 parámetros (~1,7 B) y un repo de solo 1,1 GB, el interés práctico está en su perfil de despliegue: es ejecutable en CPU o en GPUs de gama baja, y su autor documenta una evaluación antes/después sobre un split de test de 221 filas con métricas de selección de herramienta, exactitud de argumentos, idioma y anclaje de FAQ.

La relevancia de esta ficha es doble: por un lado, muestra un caso real de ajuste de un modelo pequeño para una tarea de agente conversacional con requisitos de formato estricto; por otro, la propia evaluación del autor revela el coste del ajuste, con mejoras grandes en tool calling (de 0,195 a 0,850 en selección de herramienta) pero regresiones claras en el rechazo de llamadas innecesarias (de 0,977 a 0,807) y en escenarios de aclaración o cambio de idioma. Es, por tanto, un modelo de nicho, con 0 descargas y 0 likes en el momento de la consulta, y sin validación externa conocida.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (modelo base Qwen3-1.7B, ajustado con LoRA) |
| Parámetros totales | 1.720.574.976 (~1,7 B) |
| Parámetros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el fine-tune no declara ventana propia (el modelo base Qwen3-1.7B declara 32.768 tokens nativos, sin confirmar en esta publicación) |
| Tipos de cuantización | GGUF Q4_K_M (única variante publicada en el repo); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible en los metadatos; la model card indica entrenamiento para tool calling en indonesio e inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 1,1 GB); el recuento de parámetros procede de los safetensors del modelo base |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-1.7B: un transformer decoder-only denso, sin mezcla de expertos, con atención causal estándar. Sobre esa base se aplicó un ajuste LoRA (la model card cita Unsloth como origen del checkpoint base, lo que encaja con un pipeline de fine-tuning eficiente en memoria) orientado a una única tarea: producir llamadas a herramienta en JSON y respuestas de texto para el chatbot de Toti Cakery. El resultado se exportó a GGUF Q4_K_M, lo que explica que el repositorio ocupe 1,1 GB frente a los ~3,4 GB que ocuparían los pesos en FP16.

Los datos de entrenamiento provienen del dataset de tool calling del proyecto Chatbot-Cakery, revisión v11-faster-training, ubicado en `finetune/data/` del repositorio de GitHub del autor del proyecto. La model card no detalla el número de tokens, la composición exacta del dataset ni si hubo fases de RLHF o DPO; tampoco especifica hiperparámetros más allá del tiempo total de entrenamiento (188,9 minutos). La evaluación se realizó sobre el split `test` del mismo dataset (221 filas), con los prompts exactos que el chatbot envía en producción, temperatura 0,7, top_p 0,8 y un límite de 192 tokens por respuesta. No se documenta ninguna innovación arquitectónica propia: el valor del modelo está íntegramente en el ajuste de comportamiento, no en la arquitectura.

## Capacidades

- Generación de llamadas a herramienta en JSON con selección de función y argumentos: la métrica `function_selection_acc` sube de 0,195 a 0,850 y `param_exact_acc` de 0,150 a 0,752 tras el ajuste.
- Reducción de llamadas inválidas: `invalid_call_rate` pasa de 0,023 a 0,000, es decir, el modelo deja de emitir JSON ilegible en el split de test.
- Respuestas de FAQ ancladas a contexto RAG: `faq_grounded_acc` sube de 0,600 a 0,800, incluyendo casos en los que debe admitir que el contexto no contiene la respuesta (`faq_jujur_acc`, de 0,000 a 0,500).
- Consistencia de idioma en la respuesta: `wrong_language_rate` baja de 0,379 a 0,023, con soporte declarado para indonesio e inglés en las interacciones.
- Cobertura funcional del dominio de tienda: consulta de menú (T1, de 0,14 a 1,00), detalle de producto (T3, de 0,08 a 0,83), comparación de productos (T4, de 0,00 a 0,75), creación de pedidos de uno o varios productos (T5, T6), estado y cancelación de pedidos (T8, T9), informes y analítica restringidos a rol Owner (T11, de 0,00 a 1,00).
- Modo conversacional: el tag `conversational` y la pipeline declarada por el autor indican uso previsto como asistente multi-turno; no se documenta un modo de razonamiento extendido (thinking) ni capacidades de visión o audio.
- Tool calling compatible con endpoints: el tag `endpoints_compatible` sugiere integración con APIs de inferencia estándar, aunque no se detalla el esquema exacto de herramientas.

## Casos de uso

- Atención al cliente por WhatsApp para una tienda de repostería: el modelo gestiona el turno conversacional, decide si debe invocar una herramienta (consultar menú, estado de pedido) o responder con texto, y mantiene el idioma de la sesión con una tasa de error de idioma del 2,3 % en la evaluación del autor.
- Respuestas de FAQ con RAG: dado un contexto recuperado (horarios, políticas de pago, ingredientes), el modelo redacta la respuesta citando solo la información presente y, en la mitad de los casos evaluados, admite no saber cuando el contexto no cubre la pregunta.
- Emisión de JSON para un orquestador de pedidos: con `invalid_call_rate` = 0,000 en test, es adecuado como primer eslabón de un pipeline donde un backend valida el JSON y ejecuta la acción; el modelo no ejecuta nada por sí mismo.
- Consulta de catálogo y comparación de productos: los escenarios T3 y T4 mejoran a 0,83 y 0,75 respectivamente, lo que permite responder «¿qué diferencia hay entre la torta A y la B?» invocando la herramienta de detalle con los identificadores correctos.
- Control de acceso por rol en operaciones sensibles: los escenarios de informes financieros y analítica limitados a Owner alcanzan 1,00, lo que permite usarlo como filtro de intención antes de exponer datos internos (siempre con verificación de permisos en el backend, nunca en el modelo).
- Despliegue en local o en el borde: al ocupar 1,1 GB en Q4_K_M, puede ejecutarse con Ollama en una máquina modesta o en el mismo servidor del backend, evitando enviar conversaciones de clientes a APIs externas.
- Prototipado de agentes de tool calling en modelos pequeños: sirve como referencia de hasta dónde llega un ajuste LoRA de 1,7 B en una tarea de formato estricto, y de qué se pierde por el camino (véase la sección de limitaciones).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La única evaluación es interna, sobre el split `test` del propio dataset (221 filas), comparando el modelo base con el fine-tune:

| Métrica | Significado | Antes | Después | Objetivo | Estado |
|---|---|---:|---:|---|:---:|
| `function_selection_acc` | filas con tool: elige la herramienta correcta | 0,195 | 0,850 | ≥ 0,85 | cumplido |
| `param_exact_acc` | filas con tool: herramienta y argumentos exactos | 0,150 | 0,752 | ≥ 0,70 | cumplido |
| `irrelevance_acc` | filas sin tool: no invoca herramienta | 0,977 | 0,807 | ≥ 0,85 | no cumplido |
| `false_tool_rate` | filas sin tool: invoca herramienta sin necesidad | 0,023 | 0,193 | ≤ 0,10 | no cumplido |
| `invalid_call_rate` | filas con tool: JSON ilegible | 0,023 | 0,000 | ≤ 0,05 | cumplido |
| `faq_grounded_acc` | FAQ: la respuesta contiene hechos del contexto | 0,600 | 0,800 | ≥ 0,70 | cumplido |
| `faq_jujur_acc` | FAQ: admite no saber si el contexto no responde | 0,000 | 0,500 | ≥ 0,70 | no cumplido |
| `wrong_language_rate` | idioma de respuesta distinto al de la sesión | 0,379 | 0,023 | ≤ 0,03 | cumplido |

Resultado global declarado por el autor: 5 de 8 objetivos cumplidos, con 188,9 minutos de entrenamiento y 0 respuestas truncadas por el límite de 192 tokens (frente a 142 antes del ajuste).

Desglose por tipo de escenario (solo los cambios más relevantes):

| Tipo | Escenario | n | Antes | Después | Delta |
|---|---|---:|---:|---:|---:|
| T1 | menú | 7 | 0,14 | 1,00 | +0,86 |
| T3 | detalle de producto | 12 | 0,08 | 0,83 | +0,75 |
| T5 | pedido de un producto | 18 | 0,11 | 0,94 | +0,83 |
| T11 | informe financiero (Owner) | 3 | 0,00 | 1,00 | +1,00 |
| T6 | pedido de varios productos | 4 | 0,00 | 0,50 | +0,50 |
| N5 | pregunta aclaratoria (ambiguo) | 7 | 1,00 | 0,29 | −0,71 |
| N16 | (sin descripción en la model card) | 4 | 1,00 | 0,25 | −0,75 |
| N13 | idioma de conversación | 3 | 0,67 | 0,00 | −0,67 |
| N18 | (sin descripción en la model card) | 4 | 1,00 | 0,50 | −0,50 |
| T10 | tarta personalizada, derivar a admin | 3 | 0,00 | 0,00 | 0,00 |
| T14 | quejas | 4 | 0,00 | 0,00 | 0,00 |
| T20 | (sin descripción en la model card) | 4 | 0,00 | 0,00 | 0,00 |

Advertencia metodológica: son cifras autoinformadas, sobre un conjunto de 221 filas con subconjuntos de 3 a 18 ejemplos por escenario, sin repeticiones ni intervalos de confianza. Un cambio de 0,71 puntos sobre 7 ejemplos equivale a 5 aciertos menos, por lo que la varianza es alta y la comparación con modelos de terceros no es posible.

## Requisitos de hardware

- VRAM estimada en Q4_K_M: ~1,1 GB de pesos más caché KV; en la práctica, entre 1,5 y 2,5 GB según longitud de contexto y batch. Cifra estimada a partir del tamaño del repo, no medida por el autor.
- VRAM estimada en FP16: ~3,4 GB solo de pesos (1,72 B × 2 bytes), más caché KV; alrededor de 4-5 GB en total.
- GPUs consumer: cabe holgadamente en cualquier GPU con 4 GB o más (GTX 1650, RTX 3050, RTX 4060, RTX 3060 12 GB). También es viable en CPU, dado el tamaño, y en iGPU con llama.cpp.
- GPUs de datacenter: no requiere A100 ni H100; un T4 o L4 es más que suficiente y permitiría varias instancias concurrentes.
- Opciones de despliegue: Ollama es la vía documentada por el autor (`ollama pull hf.co/LasagnaS/toti-qwen-1.7b-v11-faster-training-gguf:Q4_K_M`); también llama.cpp de forma nativa, y servidores compatibles con GGUF. vLLM o TGI requerirían convertir los pesos a safetensors y no están documentados para esta publicación.
- Latencia y throughput: no disponibles. El único dato operativo publicado es el límite de 192 tokens por respuesta usado en la evaluación, que sugiere respuestas cortas orientadas a chat.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| toti-qwen-1.7b-v11-faster-training (este) | ~1,7 B | no disponible | Apache 2.0 | GGUF Q4_K_M en HF, 0 descargas | Ajustado a una sola tarea; sin benchmarks estándar |
| Qwen3-1.7B (base) | ~1,7 B | 32.768 tokens nativos según el modelo base | Apache 2.0 | safetensors y GGUF en HF | Base del ajuste; la comparación antes/después del autor mide la ganancia y el coste del fine-tune |
| Qwen2.5-1.5B-Instruct | ~1,5 B | no verificado en esta ficha | Apache 2.0 | safetensors y GGUF en HF | Alternativa generalista de tamaño similar, sin ajuste a tool calling de tienda |
| Llama-3.2-1B-Instruct | ~1,2 B | no verificado en esta ficha | Llama 3.2 Community License | safetensors y GGUF en HF | Menor, pero con licencia comunitaria con restricciones, no Apache 2.0 |
| Gemma-3-1B-it | ~1 B | no verificado en esta ficha | Gemma Terms of Use | safetensors y GGUF en HF | Requiere aceptar términos; no comparable en tool calling sin ajuste |

No hay datos de benchmarks comunes entre estos modelos y el fine-tune, por lo que la comparación cuantitativa de rendimiento no está disponible. La ventaja diferencial de este modelo es exclusivamente el ajuste de formato y dominio, no la capacidad bruta.

## Limitaciones y advertencias

- Sobreactuación en tool calling: la tasa de llamadas innecesarias sube de 0,023 a 0,193, casi el doble del umbral objetivo (≤ 0,10). En producción esto implica invocaciones espurias a herramientas en conversaciones que solo requerían texto.
- Pérdida severa de la capacidad de pedir aclaraciones: el escenario N5 (pregunta ambigua) cae de 1,00 a 0,29, y N16 de 1,00 a 0,25. El modelo tiende a actuar en lugar de preguntar.
- Regresión en el cambio de idioma: el escenario N13 baja de 0,67 a 0,00 pese a que la métrica agregada de idioma mejora. El comportamiento multilingüe es inconsistente por tipo de escenario y debe probarse con datos propios.
- Honestidad ante contexto insuficiente: `faq_jujur_acc` se queda en 0,500, muy lejos del objetivo de 0,70. En la mitad de los casos sin respuesta en el contexto, el modelo probablemente improvisa.
- Respuestas limitadas a 192 tokens: es el tope usado en la evaluación, no necesariamente una restricción del modelo, pero cualquier uso que requiera explicaciones largas necesita revalidación.
- Conjunto de evaluación pequeño y autoinformado: 221 filas, subconjuntos de 3 a 18 ejemplos, sin intervalos de confianza, sin repeticiones y con métricas definidas por el propio autor. Los números deben tomarse como indicativos.
- Documentación incompleta: el dataset de entrenamiento no se describe en composición ni volumen; varios escenarios aparecen sin descripción (N15, N16, N18, T17 a T27), la tabla de métricas usa el nombre `toti-qwen3-17b` que no coincide con el ID del repo, y los campos de pipeline e idiomas están vacíos en los metadatos.
- Sesgos y alucinación: no hay evaluación de sesgos. Al ser un ajuste sobre un corpus conversacional de una tienda concreta, el riesgo de deriva fuera de dominio y de invención de datos de producto es alto; se recomienda validar toda salida con el backend antes de mostrarla al cliente.
- Licencia: Apache 2.0 permite uso comercial y modificaciones, pero el modelo incorpora pesos derivados de Qwen3-1.7B (también Apache 2.0), por lo que conviene conservar los avisos de atribución correspondientes. No se especifican restricciones adicionales del dataset.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta, sin citas ni terceros independientes que hayan reproducido las métricas. No se recomienda como dependencia principal en producción sin una evaluación propia.
- Idiomas: el ajuste está pensado para indonesio e inglés. El rendimiento en castellano no está evaluado y, dado el tamaño del modelo y la especificidad del corpus, no debe asumirse.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LasagnaS/toti-qwen-1.7b-v11-faster-training-gguf
- Modelo base: https://huggingface.co/unsloth/Qwen3-1.7B
- Repositorio del proyecto y dataset de tool calling (ruta `finetune/data/`): https://github.com/kevinilhamramadhan/Chatbot-Cakery
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la búsqueda web; los resultados devueltos no guardan relación con este modelo.
