# andyzhang232/ajev-gemma4-12b-lora5

## Resumen

AJev lora5 es un adaptador LoRA de tipo "modelo de decisión tipado" construido sobre google/gemma-4-12B-it. No genera texto: recibe un estado (texto libre o JSON) y una o varias preguntas con tipo (noul para sí/no, choice para elección única de hasta 255 opciones, score para niveles ordenados) y devuelve, en una sola pasada forward por pregunta, una probabilidad calibrada para cada opción. Lo desarrolla el usuario andyzhang232 dentro del ecosistema Jev, con código de inferencia y entrenamiento público en el repositorio github.com/cmzy/ajev.

El adaptador tiene 131 millones de parámetros entrenables (LoRA r 32, α 64 aplicado a todas las proyecciones de atención y MLP del modelo de lenguaje) y ocupa 0,5 GB en safetensors. Se apoya en el Gemma 4 12B, un modelo denso de 12B parámetros, multimodal y sin encoder, que Google DeepMind publica en cinco tamanos (E2B, E4B, 12B, 26B A4B y 31B). Las temperaturas de calibración por tipo de pregunta se guardan en ajev_lm_config.json.

Su relevancia está en el nicho de decisión clasificatoria calibrada: en lugar de razonar en lenguaje natural, el modelo produce distribuciones de probabilidad sobre opciones discretas, con mejoras medibles frente al modelo base zero-shot. En el Jev Decision Index 0.2.1 obtiene 52,22 puntos, por delante de Winnow-12B (50,02) y Jev-Omni (40,53), y por debajo de Jev TypeSafe (57,91) y Surogate Rune 26B-A4B v3 (57,44).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso multimodal (Gemma 4 12B); cabecera de decisión sobre logits del siguiente token de las etiquetas |
| Parámetros totales | 12B en el modelo base Gemma 4 12B; 131M parámetros entrenables en el adaptador |
| Longitud de contexto | No disponible en la información proporcionada; el adaptador se entrenó con estados de hasta 16.384 tokens |
| Tipos de cuantización | No disponible (el adaptador se distribuye en safetensors; admite fusión en memoria y despliegue con vLLM) |
| Idiomas soportados | en, zh (según los tags de la model card); evaluado también en conjuntos held-out en en, es y pt |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo no es un generador de texto, sino un clasificador tipado sobre un transformer causal. Cada pregunta se convierte en un único prompt de chat compuesto por una línea de instrucción fija, el estado, la pregunta, una pista de una línea indicando el tipo de pregunta y las opciones etiquetadas como A, B, ... y, tras la Z, códigos de dos letras de un solo token (AB, AC, ...) hasta un máximo de 255 opciones. Los logits del siguiente token correspondientes a las etiquetas (tanto el token desnudo como el prefijado por espacio) se combinan, se dividen por una temperatura ajustada por tipo de pregunta sobre datos held-out y se pasan por softmax. Se requiere una pasada forward por pregunta, y las preguntas que comparten estado pueden reutilizar su caché KV. La implementación necesita transformers ≥ 5.17, ya que versiones anteriores tokenizan Gemma 4 de forma distinta; el adaptador puede cargarse como LoRA (PEFT o LoRARequest de vLLM) o fusionarse en memoria, y un checkpoint fusionado guardado con transformers 5.17 y recargado produce salidas diferentes.

El entrenamiento usó 64.819 decisiones durante una época. La mezcla de datos incluye conjuntos públicos de clasificación, NLI, preferencia y seguridad en inglés y chino; bev-decision (políticas largas, trampas, numéricos, contrafactuales); typed-decisions; casos de reglas de negocio generados programáticamente (reembolsos, facturas, contratos, aprobaciones, SLA, uso de herramientas, enrutado de chat, logs de seguridad, RR. HH., triaje); splits de entrenamiento de benchmarks públicos relacionados con la tabla de evaluación (HellaSwag, WinoGrande, GSM8K, MMLU auxiliary train, RAGTruth, ContractNLI, Humicroedit, NLI4CT, iSarcasm, ACOS, New Yorker, ANLI R1/R2, phishing); BANKING77/CLINC150 con todas las clases; y datos de preferencia When2Call. Se aplicó descontaminación comparando cada elemento de entrenamiento contra los datos de evaluación de la tabla mediante coincidencia exacta de texto y frases compartidas de 60 caracteres o más, eliminando 508 elementos; solo se usaron splits de entrenamiento. El objetivo combina entropía cruzada sobre los logits de etiqueta con suavizado 0,05, un término de probabilidad ordenada para preguntas de tipo score y un término de consistencia entre órdenes de opciones. La configuración de entrenamiento fue LoRA r 32 / α 64, learning rate 3e-5 con schedule coseno, 32 decisiones por paso y estados de hasta 16.384 tokens, durante aproximadamente 13 horas en una única RTX PRO 6000 de 96 GB.

## Capacidades

- Decisión binaria tipada (noul): responde sí/no con probabilidad calibrada.
- Elección única (choice): hasta 255 opciones etiquetadas, con distribución de probabilidad sobre todas ellas.
- Escalas ordenadas (score): devuelve probabilidad por nivel con un término de ranking en el objetivo de entrenamiento.
- Clasificación y enrutado: categorización de tickets, correos, logs o consultas en clases predefinidas.
- Comprensión de lenguaje natural y NLI: inferencia de implicación, sarcasmo, coherencia y contratos (ContractNLI, NLI4CT).
- Decisión sobre uso de herramientas (When2Call, 83,6 de skill corregida por azar): determinar si procede invocar una herramienta y cuál, no ejecutarla.
- Razonamiento numérico y matemático básico: GSM8K con 89,4.
- Recuperación y clasificación sobre contextos largos: estados de hasta 16K tokens durante el entrenamiento.
- Multilingüe limitado: entrenado en inglés y chino, con evaluación held-out en inglés, español y portugués (eikos-decisions).
- No genera texto libre, no mantiene diálogo multi-turno y no produce explicaciones; solo distribuciones sobre opciones.

## Casos de uso

- Enrutado de tickets de soporte: dado un ticket y metadatos (por ejemplo, nivel de cliente), clasificar el tema con una pregunta choice y decidir con una noul si requiere escalado a un agente humano. El ejemplo de la model card muestra exactamente este flujo con el tema de facturación y la decisión de escalado.
- Automatización de reglas de negocio: evaluar aprobaciones, reembolsos, facturas o cumplimiento de SLA con preguntas sí/no calibradas; la probabilidad permite fijar umbrales y derivar casos dudosos a revisión manual.
- Triaje de logs de seguridad: clasificar eventos en categorías predefinidas y estimar la probabilidad de que constituyan incidente, aprovechando la calibración para priorizar alertas.
- Moderación y seguridad de contenido: usar preguntas tipadas sobre políticas para obtener una probabilidad calibrada de incumplimiento, en lugar de una etiqueta binaria sin margen de decisión.
- Evaluación de contratos y documentos largos: con estados de hasta 16K tokens, clasificar cláusulas y decidir cuestiones de implicación (ContractNLI) o de recuperación de información clínica (NLI4CT).
- Enrutado de llamadas a herramientas en agentes: dado el estado de la conversación, decidir con tipo noul o choice si procede invocar una API y cuál, antes de que un modelo generativo ejecute la llamada.
- Filtrado previo en pipelines RAG: puntuar si un documento recuperado responde a la consulta, con probabilidad calibrada para descartar recuperaciones poco fiables.
- Clasificación de intención en asistentes conversacionales: mapear la consulta del usuario a una de las clases de un catálogo (por ejemplo, BANKING77 o CLINC150) antes de generar la respuesta.
- Análisis de encuestas y preferencias: usar preguntas de tipo score para obtener distribuciones ordenadas sobre niveles de valoración.

## Benchmarks y rendimiento

Jev Decision Index 0.2.1, ejecución completa con el kit oficial, sin truncamiento ni poda de opciones, sobre 150.317 peticiones puntuables:

| Modelo | Base | Decision Index |
|---|---|---:|
| Jev (TypeSafe, hosted) | — | 57,91 |
| Surogate Rune 26B-A4B v3 (nº 1 de la tabla) | Gemma 4 26B | 57,44 |
| AJev lora5 (este modelo, ejecución propia) | Gemma 4 12B | 52,22 |
| reflex 27B | Qwen 27B | 52,16 |
| Winnow-12B | Gemma 4 12B | 50,02 |
| Jev-Omni | Gemma 4 12B | 40,53 |

Áreas corregidas por azar: Knowledge & Reasoning 37,6; Language Understanding 57,9; Retrieval & Classification 56,1; Tools & Automation 68,8; Arts & Human Taste 37,1. Índice bruto sin corregir: 63,24. Mejores benchmarks: GSM8K 89,4; HellaSwag 90,3; BPoMP 85,7; When2Call 83,6; New Yorker 70,4 (skill corregida por azar, 0 = aleatorio, 100 = perfecto). Puntos débiles relativos a la tabla: CRUXEval, VAST, API-Bank, HoVer y MMLU-Pro. El propio autor indica que el índice es su ejecución, no una reproducción del mantenedor.

Precisión en conjuntos de test held-out (estados de hasta 16K tokens, calibrado; zero-shot = mismo modelo base y prompt):

| Conjunto de test | Tamano | Gemma 4 12B zero-shot | AJev lora5 |
|---|---:|---:|---:|
| typed-decisions (decisiones de negocio) | 2.000 | 0,696 | 0,791 |
| JevBench público | 231 | 0,848 | 0,853 |
| Kev transfer v9 | 1.264 | 0,745 | 0,771 |
| eikos-decisions heldout (en/es/pt) | 1.190 | 0,928 | 0,931 |

Calibración (ECE) en typed-decisions: baja de 0,280 (zero-shot) a 0,142. En Kev v9: de 0,204 a 0,060.

## Requisitos de hardware

- El adaptador ocupa 0,5 GB en safetensors y se combina con el modelo base Gemma 4 12B; los requisitos reales los determina el base.
- VRAM estimada para el base en bf16/fp16: en torno a 24 GB solo para pesos, más caché KV y activaciones; el adaptador añade un coste marginal.
- VRAM estimada en cuantización de 8 bits: aproximadamente 13 GB; en 4 bits: aproximadamente 7-8 GB. Son estimaciones derivadas del tamano del base, no cifras publicadas en la información disponible.
- Google indica que Gemma 4 12B está pensado para desarrollo local con 16 GB de VRAM, lo que lo sitúa en el rango de GPU de consumo alta (RTX 4090, RTX 5090, RTX PRO 6000) y de GPUs profesionales con más memoria.
- Entrenamiento del adaptador: una RTX PRO 6000 de 96 GB durante unas 13 horas.
- Opciones de despliegue: transformers ≥ 5.17 con la librería ajev-infer; servidor vLLM con batching concurrente (`python -m ajev.serve_vllm --adapter ... --port 8000`); carga del adaptador como PEFT/LoRA o mediante LoRARequest de vLLM, o fusión en memoria.
- Latencia y throughput: no disponibles. La arquitectura requiere una pasada forward por pregunta, con reutilización de caché KV cuando varias preguntas comparten estado, lo que reduce el coste relativo en lotes de decisiones sobre el mismo contexto.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Licencia | Decision Index | Disponibilidad |
|---|---|---|---|---|---|
| AJev lora5 | Gemma 4 12B | 12B (131M entrenables en LoRA) | apache-2.0 | 52,22 | Adaptador público en HuggingFace |
| Winnow-12B | Gemma 4 12B | 12B | No disponible en la información proporcionada | 50,02 | No disponible |
| Jev-Omni | Gemma 4 12B | 12B | No disponible en la información proporcionada | 40,53 | No disponible |
| Surogate Rune 26B-A4B v3 | Gemma 4 26B | 26B (A4B, MoE) | No disponible en la información proporcionada | 57,44 | No disponible |
| Jev (TypeSafe, hosted) | No disponible | No disponible | No disponible | 57,91 | Servicio alojado |
| Gemma 4 12B-it (zero-shot) | — | 12B | Términos de Gemma (no especificado aquí) | Por debajo de AJev en los conjuntos held-out medidos | Pesos públicos de Google |

Frente al modelo base zero-shot, el adaptador mejora la precisión en los cuatro conjuntos held-out publicados y reduce el ECE de forma notable. Frente a Surogate Rune 26B-A4B v3, que encabeza la tabla con 57,44, AJev queda 5,22 puntos por debajo usando un base de 12B en lugar de 26B.

## Limitaciones y advertencias

- El tier difícil de JevBench queda en 0,703 y los elementos de contexto largo (más de 1.500 tokens) en 0,676, ambos por debajo del modelo base zero-shot.
- Puntos débiles declarados: búsqueda multi-hop en políticas largas y aritmética de fechas y números. También rinde por debajo de la tabla en CRUXEval, VAST, API-Bank, HoVer y MMLU-Pro.
- Los benchmarks intensivos en conocimiento (MMLU-Pro, BBH, GPQA) están acotados por el modelo base de 12B.
- Las probabilidades están calibradas sobre datos propios del autor; la model card se trunca en este punto, por lo que no se detalla el alcance exacto de la calibración fuera de esa distribución.
- Riesgo de alucinación: al no generar texto, el riesgo no se manifiesta como invención libre, sino como sobreconfianza en la opción elegida cuando el estado es ambiguo o cae fuera de la distribución de entrenamiento.
- Sesgos: no se documentan análisis de sesgo en la información disponible; la mezcla de datos proviene en su mayoría de conjuntos públicos en inglés y chino, con presencia menor de otras lenguas.
- Limitación de idioma: los tags declaran solo en y zh. Existe evaluación held-out en español y portugués, pero no se declara soporte formal para esas lenguas.
- Restricciones de licencia: el adaptador es apache-2.0, pero el uso comercial está condicionado por los términos del modelo base google/gemma-4-12B-it, que no se detallan en la información proporcionada y deben verificarse por separado.
- Requisito de versión: transformers ≥ 5.17 es obligatorio; versiones anteriores tokenizan Gemma 4 de forma diferente y producen resultados incorrectos.
- Reproducibilidad: un checkpoint fusionado guardado con transformers 5.17 y recargado da salidas distintas, lo que complica la reproducción exacta de resultados.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, y un tamano de 0,5 GB; es un artefacto reciente y sin validación externa independiente.
- El Decision Index publicado es una ejecución propia del autor, no una reproducción del mantenedor de la tabla.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/andyzhang232/ajev-gemma4-12b-lora5
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio de entrenamiento e inferencia: https://github.com/cmzy/ajev
- Código de inferencia ajev-infer: https://github.com/cmzy/ajev/tree/main/release/ajev-infer
- Jev Decision Index (space): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Kit oficial del Decision Index: https://github.com/apolinario/decision-index
- Página de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Guía para desarrolladores de Gemma 4 12B: https://developers.googleblog.com/gemma-4-12b-the-developer-guide/
- Model card de Gemma 4 en Google AI for Developers: https://ai.google.dev/gemma/docs/core/model_card_4
- Anuncio de Gemma 4 12B en el blog de Google: https://blog.google/innovation-and-ai/technology/developers-tools/introducing-gemma-4-12B/
- Tutorial de despliegue local de Gemma 4 12B: https://aiindigo.com/tutorials/getting-started-with-google-gemma-4-12b-local-deployment-and-inference
