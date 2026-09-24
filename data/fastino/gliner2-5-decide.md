# fastino/GLiNER2.5-Decide

## Resumen

GLiNER2.5-Decide es un modelo de clasificación especializado de la familia GLiNER2.5, desarrollado por Fastino (Fastino Labs) y publicado en Hugging Face bajo licencia Apache-2.0. No es un modelo generativo: es un encoder condicionado por esquema que recibe, en tiempo de llamada, un conjunto de etiquetas (intención, enrutado, sentimiento, prioridad, política, etiquetas múltiples) y devuelve la clasificación en una única pasada hacia delante, sin plantilla de prompt y sin generar tokens. Se fine-tunea a partir de `fastino/gliner2-large-v1` y se carga mediante `AutoExtractor` de la librería `gliner2`.

Su relevancia está en el nicho de las decisiones operativas: atención al cliente, banca, viajes, clínicas, moderación, enrutado de correo y tickets, detección de handoff humano, severidad, urgencia o spam. Frente a un modelo generativo que consume tokens de salida, aquí la clasificación es directa, con varias cabeceras puntuables en una sola llamada y con la posibilidad de devolver una única etiqueta (tarea monolabel) o todas las que superen el umbral (multilabel).

El checkpoint declara 486.444.053 parámetros según los pesos en safetensors, aunque la model card menciona "un checkpoint de 340M"; la información disponible no aclara esa discrepancia. El modelo solo soporta inglés y su autor advierte explícitamente de que no razona, no explica y no responde preguntas abiertas. No se ha entrenado con benchmarks públicos y la evaluación se realizó sobre una suite retenida propia de 17 dominios.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer condicionado por esquema (familia GLiNER2), con arquitectura de predicción de fronteras (*boundary-prediction*) en lugar de enumeración de spans para extracción, y cabecera de clasificación tipada |
| Parámetros totales | 486.444.053 (safetensors). La model card menciona un checkpoint de 340M; discrepancia no aclarada |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. La familia GLiNER2.5 anuncia extracción de contexto largo, pero no se publica cifra para este checkpoint |
| Tipos de cuantización | No disponible. El repositorio publica pesos en safetensors (3,9 GB) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (librería `gliner2`) |

## Arquitectura y entrenamiento

GLiNER2 se presenta como una familia de encoders condicionados por esquema orientada a reconocimiento de entidades nombradas, clasificación de texto, extracción de datos estructurados, extracción de relaciones y atributos de span. En GLiNER2.5 la enumeración de spans se sustituye por una arquitectura de predicción de fronteras, lo que habilita spans de longitud ilimitada, extracción en contexto largo, extracción conjunta entidad-relación, clasificación restringida y atributos de span. Decide es la variante de clasificación de esa familia: el conjunto de etiquetas se pasa en la llamada y el modelo puntúa una o varias cabeceras en una única pasada, devolviendo una cadena en tareas monolabel y todas las etiquetas por encima del umbral en tareas multilabel.

El modelo se obtiene por fine-tuning sobre `fastino/gliner2-large-v1`. No se dispone de datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni proceso de ajuste. El autor indica que no se entrenó con benchmarks públicos: la evaluación se realizó sobre una suite retenida de 17 dominios, en la que el modelo queda por delante de otros modelos abiertos de decisión tipada, incluido un GLiNER2 de 1B y una línea base generativa de 4B, sin publicar cifras concretas.

## Capacidades

- Clasificación de texto con conjuntos de etiquetas arbitrarios definidos en tiempo de llamada, sin plantilla de prompt ni reentrenamiento.
- Intención de cliente y banca, enrutado, sentimiento, prioridad, política y etiquetas multilabel.
- Salida monolabel como una única cadena (`{"intent": "refund_request"}`) o multilabel con todas las etiquetas que superan el umbral.
- Puntuación simultánea de varias cabeceras en una sola llamada.
- Reconocimiento de entidades nombradas y `token-classification` (etiquetas del repositorio).
- Análisis de sentimiento, clasificación de temas y clasificación de intención (etiquetas del repositorio).
- Respuesta a una pregunta sobre un pasaje, clasificación de libros, uso de etiquetas con descripción y puntuación sobre escalas ordinales, según la model card.
- Casos operativos citados por el autor: tipo de documento, enrutado de correo y tickets, handoff a humano, finalización de agente, moderación, severidad, urgencia y spam.
- No soporta tool calling ni function calling, ni agentes, ni razonamiento multi-paso, ni generación libre: el autor indica expresamente que no razona, no explica y no responde preguntas abiertas.
- Multilingüe: no. Solo inglés.

## Casos de uso

- Enrutado de tickets de atención al cliente: el modelo recibe el texto entrante y un conjunto de etiquetas de intención (reembolso, cancelación, problema de acceso, retraso de envío, bug, hablar con humano, otro) y devuelve la acción de cola en el primer turno, antes de que intervenga un agente humano.
- Operaciones bancarias sobre lenguaje natural: un único mensaje puede mezclar una transferencia pendiente, un cambio de beneficiario y una consulta de comisiones; el modelo lo mapea a la operación que debe abrir el sistema core, evitando formularios previos.
- Conversión de solicitudes de viaje en acciones de inventario: reservar, cambiar, cancelar, consultar estado, cambio de asiento, reembolso o equipaje se distinguen en texto libre y desencadenan la llamada correspondiente al sistema de reservas.
- Triaje en clínica o centro médico: separa peticiones de cita, receta, resultados, derivación o facturación en el mismo mensaje, de modo que la recepción asigne agenda sin lectura manual.
- Sentimiento de reseñas en cuatro clases (positivo, negativo, mixto, neutral): permite detectar reseñas mixtas que una puntuación de estrellas oculta y alimentar paneles, políticas de respuesta o rankings.
- Moderación y priorización de abuso: clasificación de severidad, urgencia o spam como decisión tipada previa al enrutado, con coste de inferencia bajo al no generar tokens.
- Clasificación de tipo de documento y enrutado de correo corporativo: asignación de un documento o mensaje a un departamento o flujo concreto a partir de un conjunto de etiquetas fijo.
- Detección de handoff humano y de finalización de agente en asistentes conversacionales: señales operativas para decidir si la conversación se escala o se cierra.
- Extracción y clasificación locales en pipelines con requisitos de privacidad: al ser un checkpoint pequeño, se puede ejecutar en infraestructura propia sin enviar datos a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados numéricos de benchmarks (MMLU, HumanEval, GSM8K ni equivalentes) en la información disponible. La model card solo afirma que el modelo lidera modelos abiertos de decisión tipada en una suite retenida de 17 dominios, por delante de un GLiNER2 de 1B y de una línea base generativa de 4B, sin cifras concretas.

| Benchmark | Resultado | Notas |
|---|---|---|
| Suite retenida de 17 dominios (propia de Fastino) | No disponible numéricamente | El autor indica que supera a un GLiNER2 de 1B y a una línea base generativa de 4B |
| MMLU, GSM8K, HumanEval y similares | No aplicable / no disponible | El modelo no está entrenado con benchmarks públicos ni es un modelo generativo |

## Requisitos de hardware

- VRAM estimada para inferencia, calculada a partir de los 486,4 M de parámetros (estimación aritmética, no dato publicado): en fp32, aproximadamente 1,95 GB de pesos; en fp16/bf16, aproximadamente 0,97 GB; en int8, aproximadamente 0,49 GB.
- VRAM total recomendada, incluyendo activaciones y sobrecarga del runtime (estimación): unos 2,5 a 3 GB en fp32 y unos 1,5 a 2 GB en fp16.
- Cabe en GPU de consumo: sí, de forma holgada. Bastan GPU con 4 GB o más de VRAM, como una GTX 1650, RTX 3050, RTX 3060, RTX 4060 o superiores, incluso con lotes moderados.
- Inferencia en CPU: viable por el tamaño del modelo, aunque sin datos de latencia publicados.
- GPU de servidor recomendadas para alto rendimiento: T4, L4, A10, L40S, A100 o H100, con posibilidad de agrupar muchas peticiones por GPU dado el reducido tamaño del checkpoint.
- Opciones de despliegue: librería `gliner2` mediante `AutoExtractor.from_pretrained("fastino/GLiNER2.5-Decide")`. Fastino Agent se ofrece para fine-tuning y despliegue del modelo.
- No hay pesos GGUF publicados, por lo que llama.cpp y Ollama no están soportados por el momento; vLLM o TGI no son aplicables a este tipo de modelo de clasificación, que no es autorregresivo.
- Latencia y throughput: no disponibles. La arquitectura de una sola pasada sin generación de tokens reduce el coste por petición frente a modelos generativos, pero no se publican medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| fastino/GLiNER2.5-Decide | 486.444.053 (safetensors) | No disponible | Encoder de clasificación tipada | Apache-2.0 | Hugging Face, librería `gliner2` |
| fastino/gliner2-large-v1 | No disponible | No disponible | Encoder de extracción y clasificación (modelo base) | No disponible en la información proporcionada | Hugging Face |
| GLiNER2 de 1B (citado en la model card) | 1.000 millones (aproximado, según la model card) | No disponible | Encoder de decisión tipada | No disponible | Hugging Face |
| Línea base generativa de 4B (sin nombre en la model card) | 4.000 millones (aproximado, según la model card) | No disponible | Modelo generativo | No disponible | No disponible |

El autor sitúa a GLiNER2.5-Decide por delante del GLiNER2 de 1B y de la línea base generativa de 4B en su suite retenida de 17 dominios, con la ventaja adicional de un tamaño mucho menor. No se dispone de comparaciones con alternativas externas de clasificación por etiquetas en tiempo de llamada.

## Limitaciones y advertencias

- No es un modelo de propósito general: el autor indica explícitamente que no razona, no explica y no responde a preguntas abiertas.
- No se ha entrenado con benchmarks públicos, por lo que no hay cifras comparables con MMLU, GSM8K u otros conjuntos estándar.
- Solo soporta inglés; cualquier entrada en otro idioma queda fuera del alcance declarado.
- Discrepancia sin resolver entre los 486.444.053 parámetros de los pesos en safetensors y la mención a un checkpoint de 340M en la model card.
- Longitud de contexto no publicada: no se puede garantizar el comportamiento en documentos largos, pese a que la familia GLiNER2.5 anuncie extracción de contexto largo.
- Riesgo de error en la asignación de etiqueta: en tareas monolabel puede elegir una categoría incorrecta y en multilabel devolver etiquetas por encima del umbral que no correspondan. No se documenta el comportamiento cuando el texto no encaja en ninguna etiqueta; la mitigación sugerida en los ejemplos es incluir una clase `other`.
- Umbral de decisión para multilabel no documentado en la información disponible.
- No soporta tool calling, function calling ni flujos de agente; no debe integrarse como sustituto de un modelo generativo en esos flujos.
- Licencia Apache-2.0: permite uso comercial sin restricciones documentadas, pero conviene verificar las condiciones del modelo base `fastino/gliner2-large-v1` y de los artefactos de terceros incluidos.
- Adopción muy baja en el momento de la ficha (7 descargas y 18 likes), con poca validación independiente por parte de la comunidad.
- No hay pesos cuantizados ni formato GGUF publicados, lo que limita el despliegue en runtimes orientados a modelos generativos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/fastino/GLiNER2.5-Decide
- Modelo base: https://huggingface.co/fastino/gliner2-large-v1
- Paper (arXiv 2507.18546): https://arxiv.org/abs/2507.18546
- Repositorio GitHub de GLiNER2: https://github.com/fastino-ai/GLiNER2
- Página de producto GLiNER2.5: https://fastino.ai/models/gliner2-5
- Landing de GLiNER en Fastino: https://fastino.ai/lp/gliner
- Sitio de Fastino Labs: https://fastino.ai/
- Cuenta de X de Fastino: https://x.com/fastinoAI
- Pull request de documentación con la corrección del catálogo de modelos: https://github.com/fastino-ai/mintlify-docs/pull/150
