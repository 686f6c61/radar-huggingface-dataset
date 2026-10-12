# jasonjimnz/tyness-boe-1.2b-pre-alpha-3-instruct

## Resumen

Tyness BOE 1.2B Instruct — Pre-Alpha 3 es un ajuste fino (LoRA/QLoRA) del modelo LiquidAI/LFM2.5-1.2B-Instruct, un transformer híbrido de convoluciones y atención con 1.170.340.608 parámetros. Lo desarrolla jasonjimnz dentro del proyecto Tyness Train, un harness de fine-tuning guiado por agentes pensado para entrenar LLMs pequeños en GPUs de baja VRAM. El modelo está especializado en responder preguntas sobre legislación española del BOE en modo RAG: solo responde a partir de extractos de normas proporcionados en el contexto y debe citar identificadores oficiales (formato BOE-A-AAAA-NNNNN).

La relevancia de esta tercera pre-alpha está en dos mejoras de receta confirmadas experimentalmente: un bloque estructurado METADATOS en el system prompt (identificador de la norma, número oficial, rango, departamento, fechas de publicación y entrada en vigor, estado y un índice compacto de títulos de artículos) y pares de corrección adversarial en los que el usuario afirma una premisa falsa que el modelo debe refutar con la cita exacta. El objetivo declarado es reducir la dependencia de la memoria de pesos para identificadores y mejorar la resistencia a la adulación (sycophancy).

El estado es explícitamente PRE-ALPHA. La puntuación media de juez en la evaluación pareada definitiva (n=200 por set) es 0.446 ± 0.336, frente a 0.415 del run anterior, y la resistencia a premisas falsas se mide por primera vez con un resultado bajo (0.095). El autor advierte de que hay que verificar siempre contra boe.es.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido conv+attention (base LiquidAI/LFM2.5-1.2B-Instruct) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (secuencia de entrenamiento: 2304; el ejemplo de despliegue usa -c 16384) |
| Tipos de cuantizacion | F16, Q8_0, Q4_K_M (GGUF incluidos en el repo); entrenamiento con NF4 4-bit y cómputo fp32 |
| Idiomas soportados | Español (es) |
| Licencia | lfm-open-license-v1.0 (license: other) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) y GGUF |

## Arquitectura y entrenamiento

El modelo parte de LiquidAI/LFM2.5-1.2B-Instruct, descrito por el autor como una arquitectura híbrida de convoluciones y atención de 1,2B parámetros. Sobre esa base se aplica un ajuste QLoRA SFT con TRL: cuantización NF4 de 4 bits con cómputo en fp32, LoRA de rango 16, alpha 32 y dropout 0.05, aplicado a los módulos q_proj, k_proj, v_proj y o_proj. El entrenamiento se realizó en una NVIDIA GTX 1060 de 6 GB (Pascal, sm_61, de 2016), con optimizador paged_adamw_32bit, learning rate 2e-4 con scheduler coseno, batch efectivo 1 × 16, 5 épocas y longitud de secuencia 2304. La pérdida final fue 0.730 y la precisión por token 85,2 %. La pérdida se calcula únicamente sobre los tokens del asistente.

Los datos proceden del piloto de 10 artículos del BOE (dataset `boe-focused-adv-v1`): 1.148 entradas fundamentadas más 149 pares de corrección adversarial, 1.297 en total. Las fuentes son legislación española consolidada (datos abiertos del BOE) a través de legalize-es, y entradas ChatML generadas por un modelo profesor desde es-legal-priv. Dos innovaciones de receta destacan: (1) los contextos son párrafos ordenados por relevancia (no filtrados por relevancia, porque filtrar empobrece las preguntas genéricas), y (2) el bloque METADATOS en el system prompt elimina la necesidad de que el modelo recuerde identificadores desde los pesos. Los pares adversariales (~11,5 % del dataset) entrenan al modelo para corregir premisas falsas con la cita exacta y la razón.

## Capacidades

- Generación de texto y respuesta a preguntas con fundamento estricto en el contexto proporcionado (grounded generation).
- Cita de identificadores y fechas exactos del BOE gracias al bloque METADATOS (identificador BOE-A-AAAA-NNNNN, número oficial, rango, departamento, fechas y estado).
- Refusals fundamentadas: se niega a responder cuando el dato no está en el contexto aportado.
- Registro y lenguaje jurídico en español.
- Corrección adversarial limitada: se le entrena para refutar premisas falsas (artículo mal citado, identificador erróneo, plazo inventado) a partir de los 149 pares, aunque el rendimiento medido es bajo.
- No se documenta soporte de tool calling ni function calling en la información proporcionada.
- No se documenta soporte explícito de agentes o razonamiento multi-paso más allá del flujo RAG planteado.
- Capacidad multilingüe: solo español (es) según la metadata.
- No se documenta capacidad de visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Asistente jurídico interno con RAG: se pegan los extractos de las normas relevantes y sus metadatos en el system prompt y el modelo responde citando el identificador oficial exacto, lo que reduce el trabajo de verificación manual en consultas internas.
- Atención al ciudadano sobre trámites normados: el modelo responde preguntas sobre plazos, órganos competentes y requisitos a partir del texto consolidado de la norma, con refusal cuando falta el dato.
- Verificación de citas en documentos legales: dado un borrador que cita una norma, se aporta el texto oficial como contexto y el modelo comprueba identificador, fecha y contenido, señalando discrepancias.
- Formación de personal en normativa: generación de preguntas y respuestas fundamentadas para materiales de e-learning a partir de fragmentos del BOE, con la cita incorporada.
- Extracción asistida en pipelines documentales: capa de Q&A sobre un índice RAG de legislación para responder consultas puntuales de un sistema mayor, aprovechando su tamaño reducido para despliegue local.
- Detección de premisas erróneas en consultas ciudadanas: aunque débil (0.095 de media en el set adversarial), puede usarse como filtro de primera línea que marca afirmaciones falsas del usuario para revisión humana.
- Despliegue en hardware muy modesto: al caber en GPUs consumer antiguas vía GGUF, permite prototipos de asistente legal offline sin conexión a servicios en la nube.

## Benchmarks y rendimiento

Evaluación pareada definitiva, n=200 por set, con conjuntos nuevos generados por profesor y nunca usados en entrenamiento, juzgados por un referee LLM (glm5.3-flash) con veredicto correcto/parcial/incorrecto y puntuación 0–1.

| Modelo | native | hard | FINAL (media ± desv.) |
|---|---|---|---|
| run18 (focused v3, contextos ordenados) | 0.417 | 0.412 | 0.415 ± 0.352 |
| run19 — pre-alpha-3-instruct (este) | 0.452 | 0.440 | 0.446 ± 0.336 |

Detalle de este modelo:

| Set | n | media | desv. | correctos | parciales | precision |
|---|---|---|---|---|---|---|
| native (párrafos enfocados) | 200 | 0.452 | 0.337 | 32 (16,0 %) | 101 | 16,0 % |
| hard (secciones completas) | 200 | 0.440 | 0.335 | 30 (15,0 %) | 97 | 15,0 % |

Evaluación adversarial (sycophancy), primera medición, 149 ítems con premisa falsa que el contexto desmiente:

| Metrica | Valor |
|---|---|
| Puntuacion media | 0.095 (n=149) |
| Veredictos | 0 correctos / 19 parciales / 130 incorrectos |

Progresión de puntuación declarada por el autor: 0.005 → 0.035 → 0.18 → 0.267 → 0.3475 → 0.3725 → 0.415 → 0.446 (89× sobre la primera pre-alpha). Los veredictos incorrectos en preguntas genuinas bajaron de 85 a 67 en el set native, sin regresión por sobrerrefusal.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,3–2,5 GB en F16, 1,3 GB en Q8_0 y 0,7–1,0 GB en Q4_K_M, más el cache KV y el contexto (estimaciones basadas en el recuento de parámetros, no datos publicados por el autor).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más es suficiente para las cuantizaciones GGUF. El propio entrenamiento se realizó en una GTX 1060 de 6 GB (Pascal, sm_61), lo que da idea del perfil objetivo.
- Cabe en GPU consumer: sí. Con Q4_K_M es viable en GPUs integradas o tarjetas de gama baja con pocos GB; en F16 conviene al menos 4 GB dedicados.
- Opciones de despliegue: llama.cpp / llama-server (los GGUF F16, Q8_0 y Q4_K_M están incluidos y se documenta un ejemplo con -ngl 99 -c 16384 y --jinja hacia un endpoint compatible con la API de OpenAI). El repo usa la librería PEFT para el adaptador LoRA en safetensors.
- Latencia y throughput estimados: no disponibles. Solo se documenta que el entrenamiento usó cómputo fp32 por limitaciones de Pascal (sin bf16/fp16).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento (eval pareada) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tyness-boe-1.2b-pre-alpha-3-instruct (este) | 1,17B | no disponible | 0.446 ± 0.336 (native 0.452 / hard 0.440) | lfm-open-license-v1.0 | HuggingFace (GGUF + safetensors) |
| tyness-boe-1.2b-pre-alpha-2 (run18) | 1,17B | no disponible | 0.415 ± 0.352 | lfm-open-license-v1.0 | HuggingFace |
| tyness-boe-1.2b-pre-alpha | 1,17B | no disponible | no disponible (progresión declarada 0.005 en el primer paso) | lfm-open-license-v1.0 | HuggingFace |
| LiquidAI/LFM2.5-1.2B-Instruct (base) | 1,2B | no disponible | no disponible | lfm-open-license-v1.0 | HuggingFace |

No se dispone de comparación frente a otros modelos de la misma categoría (Q&A legal en español de ~1B) en la información proporcionada.

## Limitaciones y advertencias

- Estado PRE-ALPHA: el propio autor lo marca como no listo para producción y recomienda verificar siempre contra boe.es.
- Adulación / sycophancy: es el punto más débil. Con premisas falsas el modelo obtiene una media de 0.095 (0 correctos, 19 parciales, 130 incorrectos sobre 149 ítems). No corrige de forma fiable afirmaciones erróneas del usuario.
- Síntesis multi-precepto limitada: el autor la señala explícitamente como capacidad que falla.
- Bucles de repetición ocasionales bajo decodificación greedy.
- Tasa de acierto baja en términos absolutos: 16,0 % de respuestas correctas en el set native y 15,0 % en hard; la mayoría de respuestas son parciales.
- Dependencia del contexto: solo responde con fundamento en los extractos aportados; sin el bloque METADATOS y los fragmentos correctos el rendimiento cae.
- Cobertura de datos muy reducida: piloto de 10 artículos del BOE, por lo que la generalización a otras normas no está validada.
- Idioma limitado al español, con registro jurídico; no se documenta comportamiento multilingüe.
- Licencia lfm-open-license-v1.0 (license: other): conviene revisar los términos en el enlace de licencia antes de cualquier uso comercial, ya que no es una licencia de código abierto estándar.
- Riesgo de alucinación de identificadores, fechas o plazos cuando el dato no está presente en el contexto, agravado por la debilidad medida frente a premisas falsas.
- Repo de 6,7 GB y solo 37 descargas: ecosistema y validación externa muy limitados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/jasonjimnz/tyness-boe-1.2b-pre-alpha-3-instruct
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct
- Licencia del modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Instruct/blob/main/LICENSE
- Repositorio del harness de entrenamiento (Tyness Train): https://github.com/jasonjimnz/model_trainer
- Pre-alpha 1: https://huggingface.co/jasonjimnz/tyness-boe-1.2b-pre-alpha
- Pre-alpha 2: https://huggingface.co/jasonjimnz/tyness-boe-1.2b-pre-alpha-2
- Pre-alpha instruct: https://huggingface.co/jasonjimnz/tyness-boe-1.2b-pre-alpha-instruct
- Dataset de referencia (legalize-es): https://github.com/legalize-dev/legalize-es
- Ficha en free2aitools (pre-alpha instruct): https://free2aitools.com/model/jasonjimnz/tyness-boe-1.2b-pre-alpha-instruct
- Ficha en free2aitools (pre-alpha 2): https://free2aitools.com/model/jasonjimnz/tyness-boe-1.2b-pre-alpha-2
- Informe de evaluación del autor: eval-report.md (referenciado en la model card, no enlazado de forma directa en la información disponible)
