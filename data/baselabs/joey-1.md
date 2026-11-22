# baselabs/joey-1

## Resumen

joey-1 es un modelo de decisión de 2.721.801.024 parámetros (2B) desarrollado por Base Labs en Baseten mediante un fine-tune completo de Qwen3.5-2B. A diferencia de un modelo conversacional al uso, joey-1 recibe un estado (texto, opcionalmente con imágenes) junto con un conjunto de preguntas tipadas y devuelve una probabilidad calibrada para cada opción, resolviendo todas las preguntas desde un único prefill de prefijo compartido. Está pensado como componente de enrutamiento, clasificación y guardrails en pipelines de producción, no como generador de texto libre.

El modelo se apoya en la arquitectura Qwen3.5-2B (transformer multimodal con encoder de visión) y aplica una máscara de atención bidireccional por bloques en las capas de atención completa, lo que permite que cada pregunta atienda al estado compartido sin repetir el coste de prefill. La longitud máxima de secuencia es de 16.384 tokens y las peticiones que exceden los límites entrenados se rechazan en lugar de truncarse.

Su relevancia actual radica en el coste: se sirve en Baseten Model APIs a 0,01 USD por millón de tokens de entrada, con retención de datos desactivada por defecto, y ocupa la primera posición entre los modelos de menos de 4B en el Jev Decision Index 0.4 (split público) con 63,30 puntos, en el puesto 37 de 230 modelos evaluados. Es el hermano pequeño de elephant-1 (9B) y mammoth-1 (27B), orientados a tareas que requieren conocimiento general más amplio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-2B) con máscara de atención bidireccional por bloques en capas de atención completa; encoder de visión congelado |
| Parametros totales | 2.721.801.024 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 16.384 tokens (máximo de secuencia entrenado); las peticiones que lo exceden se rechazan, no se truncan |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | MIT (modificaciones de Baseten) y Apache 2.0 (modelo base Qwen3.5-2B); uso sujeto a ambas |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

joey-1 parte de Qwen3.5-2B, un transformer multimodal que acepta texto e imágenes. El fine-tune es completo sobre el modelo de lenguaje, mientras que el encoder de visión permanece congelado. La innovación estructural clave es el uso de una máscara de atención bidireccional por bloques en las capas de atención completa: el estado de entrada y el bloque de preguntas se codifican una sola vez y todas las preguntas se resuelven en un único prefill de prefijo compartido, lo que reduce el coste por consulta frente a plantear cada pregunta como una generación independiente.

El entrenamiento utiliza 6,21 millones de ejemplos de decisión (denominado Mix 8), con la siguiente composición: 58,3% de habilidades de decisión centrales, 16,1% de seguridad y abstención, 16,1% de juicio y dominios expertos y 9,5% de datos públicos de decisión. La función objetivo combina entropía cruzada con un término de calibración de Brier (λ = 1) e incluye una opción "no lo sé" entrenada explícitamente. La receta es de 1 época (43.390 pasos), LR pico de 1e-5, AdamW (β 0.9/0.95, sin weight decay), 3% de warm-up, decaimiento coseno y precisión bf16, ejecutada sobre 2 nodos × 8 H100 (16 GPU en total).

## Capacidades

- Decisión clasificatoria calibrada: devuelve probabilidades por opción en lugar de texto generado, con calibración supervisada mediante término de Brier.
- Tres tipos de pregunta soportados: `noul` (sí/no, devuelve P(sí)), `choice` (una entre opciones nombradas con descripción, devuelve etiqueta y probabilidades) y `score` (niveles ordenados, devuelve nivel y probabilidades).
- Entrada multimodal: acepta texto e imágenes como parte del estado evaluado.
- Prefill compartido: resuelve todas las preguntas de una petición en una sola pasada con prefijo común.
- Abstención entrenada: opción "no lo sé" para casos fuera de distribución o información insuficiente.
- Enrutamiento y guardrails: orientado a clasificación de intención, asignación de equipos, detección de solicitudes sensibles y puntuación de urgencia.
- Multilingüe: únicamente inglés declarado.
- Tool calling / function calling: no disponible como capacidad generativa; el modelo no produce llamadas a herramientas, produce decisiones.
- Agentes y razonamiento multi-paso: no disponible de forma nativa; está diseñado para una decisión de una sola pasada.

## Casos de uso

- Enrutamiento de tickets de soporte: se define una pregunta `choice` con criterios como facturación, técnico y fraude, y el modelo devuelve la etiqueta y la distribución de probabilidad para derivar el ticket al equipo correcto con un umbral de confianza configurable.
- Guardrails de entrada en producción: una pregunta `noul` del tipo "¿el usuario está solicitando un reembolso?" o "¿el mensaje contiene una petición fuera de política?" permite bloquear o derivar peticiones antes de llegar al modelo generativo principal.
- Puntuación de urgencia: con una pregunta `score` de niveles ordenados ("puede esperar", "hoy", "bloqueante") se prioriza la cola de atención al cliente de forma consistente y calibrada.
- Moderación y clasificación de contenido multimodal: al aceptar imágenes junto al texto, puede evaluar capturas de pantalla, documentos escaneados o adjuntos enviados por el usuario y clasificarlos según criterios definidos.
- Clasificación de documentos y extracción de decisiones: sobre contratos, facturas o formularios, se plantean varias preguntas tipadas en una sola llamada y se obtiene la probabilidad de cada categoría con coste de prefill compartido.
- Evaluación automática de respuestas (judging): el modelo puede actuar como juez binario o por niveles sobre salidas de otros modelos, con probabilidades calibradas para aplicar umbrales y detectar desacuerdo.
- Filtrado previo en pipelines RAG: decidir si una consulta requiere recuperación, si es una pregunta de seguimiento o si debe rechazarse, antes de invocar el recuperador y el generador.
- Detección de abstención: gracias a la opción "no lo sé" entrenada, puede marcar casos ambiguos para revisión humana en lugar de forzar una etiqueta.

## Benchmarks y rendimiento

Jev Decision Index 0.4 (split público):

| Modelo | Decision Index |
|---|---:|
| elephant-1 | 72,24 |
| **joey-1** | **63,30** |
| Cloudflare Clef | 61,71 |
| Jev 1.14 | 60,70 |
| Perplexity Decider Flash v1.2 | 60,06 |

Artificial Analysis Decision Index (réplica propia de Baseten):

| Modelo | Score |
|---|---:|
| mammoth-1 | 65,9 |
| elephant-1 | 65,2 |
| d1-ultra | 65 |
| **joey-1** | **62,9** |

Según la model card, joey-1 es el mejor modelo por debajo de 4B en el Jev Decision Index 0.4 (split público) con 63,30, en el puesto 37 de 230 modelos. En ese split queda por detrás de elephant-1 en todas las áreas y supera a Jev 1.14 en cuatro de cinco (lenguaje, herramientas y automatización, recuperación y clasificación, artes y gusto humano).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 2.721.801.024 parámetros, en bf16 los pesos ocupan aproximadamente 5,4 GB, a lo que hay que sumar caché KV y overhead del runtime.
- GPU recomendadas: el runtime self-hosted (`setup.sh` con OneJev + `serve.patch`) requiere una GPU CUDA y la imagen `pytorch/pytorch:2.8.0-cuda12.8-cudnn9-devel`; el entrenamiento se realizó sobre 16 H100.
- GPU de consumo: no confirmado por el autor; por tamaño de pesos, un modelo de 2B en bf16 es compatible con GPUs de consumo con 8-12 GB o más, pero no hay validación publicada.
- Opciones de despliegue: Baseten Model APIs (endpoint gestionado, acepta texto e imagen, 0,01 USD por millón de tokens de entrada, retención de datos desactivada por defecto) o self-hosted mediante el runtime OneJev con `qev.engine.DecisionEngine` y el esquema `SystemOneRequest`.
- Latencia y throughput: no disponibles; el diseño de prefill compartido reduce el coste cuando se plantean varias preguntas sobre el mismo estado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Jev Decision Index 0.4 | Licencia | Disponibilidad |
|---|---:|---|---:|---|---|
| **joey-1** | 2B | 16.384 | 63,30 | MIT + Apache 2.0 | HF + Baseten API |
| elephant-1 | 9B | no disponible | 72,24 | no disponible | HF + Baseten |
| mammoth-1 | 27B | no disponible | no disponible (65,9 en AA Decision Index réplica) | no disponible | HF + Baseten |
| Cloudflare Clef | no disponible | no disponible | 61,71 | no disponible | no disponible |
| Jev 1.14 | no disponible | no disponible | 60,70 | no disponible | no disponible |

## Limitaciones y advertencias

- Solo inglés declarado: no hay soporte multilingüe verificado, por lo que su uso en castellano u otros idiomas no está garantizado.
- Modelo de decisión, no generativo: no produce texto libre ni llamadas a herramientas; intentar usarlo como chatbot o agente dará resultados incorrectos.
- Límite estricto de longitud: las peticiones que exceden los límites entrenados se rechazan en lugar de truncarse, lo que exige validación previa en el cliente.
- Riesgo de calibración fuera de distribución: las probabilidades están calibradas sobre los datos de entrenamiento (Mix 8); dominios muy distintos pueden degradar la calibración aunque exista la opción "no lo sé".
- Sesgos: no se documentan análisis de sesgo en la información disponible; al derivar de Qwen3.5-2B hereda los sesgos del modelo base y de los 6,21 millones de ejemplos de decisión.
- Rendimiento inferior a sus hermanos mayores: pierde frente a elephant-1 en todas las áreas del split público del Jev Decision Index, por lo que tareas que requieran conocimiento general amplio deberían usar los modelos de 9B o 27B.
- Licencia doble: el uso está sujeto simultáneamente a la MIT de las modificaciones de Baseten y a la Apache 2.0 del modelo base; es necesario revisar `LICENSE` y `NOTICE` antes de un despliegue comercial.
- Dependencia de runtime propietario para self-hosting: el despliegue propio requiere OneJev y un parche de servicio (`serve.patch`), no un servidor transformers estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/baselabs/joey-1
- Probar en Baseten: https://www.baseten.co/library/joey-1/
- Informe técnico (mammoth-1 y elephant-1): https://labs.baseten.co/articles/mammoth-1-and-elephant-1-frontier-decision-models
- Blog de presentación: https://www.baseten.co/blog/decisions-for-a-penny-introducing-joey-1/
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Hermano 9B: https://huggingface.co/baselabs/elephant-1
- Hermano 27B: https://huggingface.co/baselabs/mammoth-1
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
