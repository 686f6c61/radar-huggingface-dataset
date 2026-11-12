# PunkyTiger/Superion-S1

## Resumen

Superion S1 es un modelo de decisión ("decision model") desarrollado por Punky Tiger Labs (PunkyTiger) que transforma una tarea de clasificación de texto en un conjunto de preguntas tipadas con respuesta probabilística calibrada. En lugar de generar texto y obligar al usuario a parsearlo, el modelo devuelve directamente una probabilidad entre 0 y 1 por cada pregunta formulada, lista para usarse en una condición `if`. Está construido sobre el modelo base `google/gemma-4-26B-A4B-it`, una arquitectura Mixture-of-Experts (26B parámetros totales, 4B activos), y se sirve exclusivamente como API alojada, sin distribución de pesos.

Su relevancia radica en que ataca un problema recurrente en pipelines de "LLM como clasificador": la falta de calibración y la necesidad de parsear salidas en lenguaje natural. Superion S1 declara el primer puesto de 213 modelos en el benchmark S1MB English v1 (Task Average 75,06, Borda 89,88, noviembre de 2026), con una latencia p50 de aproximadamente 0,3 s por petición y sin coste de tokens de salida. Soporta tres tipos de pregunta (`noul`, `choice`, `score`) y hasta 32K tokens de contexto por pregunta.

El modelo está orientado a casos de enrutamiento de LLM, guardarraíles de agentes, moderación de contenido, triaje de tickets, scoring de leads y clasificación de intención. Su disponibilidad es únicamente mediante API con licencia propia (`superion-s1-api-terms`), lo que condiciona su uso en producción a los términos del proveedor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, derivada de `google/gemma-4-26B-A4B-it`; expertos en INT4 |
| Parámetros totales | 26B (heredados del modelo base) |
| Parámetros activos | 4B (heredados del modelo base, denominación A4B) |
| Longitud de contexto | hasta 32K tokens por pregunta |
| Tipos de cuantización | expertos en INT4 (INT4e); el resto de la cuantización no está disponible |
| Idiomas soportados | inglés (`en`) |
| Licencia | `superion-s1-api-terms` (licencia propia, uso solo vía API) |
| Formato de pesos | no disponible; no se distribuyen pesos, solo API alojada |
| Tipos de pregunta | `noul` (sí/no), `choice` (2–255 opciones), `score` (2–16 niveles ordenados) |
| Salida | probabilidades calibradas por pregunta (sin generación de texto) |
| Latencia declarada | ~0,3 s p50 por petición |
| Precio | Gratis: 100 M tokens/día por clave; prepago: 0,042 USD por millón de tokens de entrada, salida gratuita |

## Arquitectura y entrenamiento

Superion S1 parte del modelo `google/gemma-4-26B-A4B-it`, un transformer con arquitectura Mixture-of-Experts de 26B parámetros totales y 4B activos. La adaptación convierte el modelo generativo en un modelo de decisión: en lugar de producir tokens de texto, el sistema devuelve una distribución de probabilidad calibrada para cada pregunta tipada (`noul`, `choice`, `score`). La model card indica que los expertos se sirven en INT4 y que la inferencia se ejecuta con vLLM (identificador de modelo `superion-s1-v6-int4e-vllm-kv1@sha256:e6dc49dc`), con gestión de caché KV.

No se han publicado en la información disponible detalles sobre el número de tokens de entrenamiento, la composición del dataset de ajuste, ni si se emplearon técnicas de RLHF, DPO u otras. La model card menciona la existencia de "custom models" por industria, lo que sugiere ajustes específicos por dominio ofrecidos por el proveedor, pero no se detalla su metodología. La innovación destacable es el propio formato de salida: decisiones tipadas con probabilidades calibradas en una sola llamada y sin generación de texto, lo que elimina el parseo y reduce el coste a solo tokens de entrada.

## Capacidades

- Clasificación de texto zero-shot mediante preguntas tipadas: sí/no (`noul`), elección entre 2 y 255 opciones (`choice`) y escala ordenada de 2 a 16 niveles (`score`).
- Devolución de probabilidades calibradas por pregunta, aptas para umbrales y enrutamiento determinista.
- Múltiples decisiones en una sola llamada sobre el mismo texto, con coste de entrada compartido.
- Sin generación de texto: la salida es estructurada (JSON con probabilidades), lo que evita etiquetas alucinadas y parseo frágil.
- Soporte de contexto largo: hasta 32K tokens por pregunta.
- Capacidades de enrutamiento de LLM (`llm-router`), guardarraíles de agentes (`agent-guardrails`), moderación de contenido, triaje de tickets, scoring de leads y clasificación de intención, según las etiquetas del autor.
- Capacidad multilingüe: no disponible; solo se declara inglés.
- Modo "thinking", visión o audio: no disponible.

## Casos de uso

- Enrutamiento de LLM: usar la pregunta `choice` para decidir a qué modelo o pipeline derivar una consulta (por ejemplo, "consulta legal", "consulta técnica", "consulta comercial") y usar la probabilidad como umbral para derivar a un humano si la confianza es baja.
- Guardarraíles de agentes: preguntas `noul` sobre si una acción propuesta es segura o si la salida contiene datos personales, con probabilidad calibrada para bloquear o permitir la acción antes de ejecutarla.
- Moderación de contenido: clasificación `choice` de categorías de toxicidad o spam y `score` de gravedad, aprovechando la calibración para fijar umbrales por categoría y reducir falsos positivos.
- Triaje de tickets de soporte: combinar en una sola llamada preguntas de intención, urgencia (`score`) y solicitud de reembolso (`noul`), con lo que se paga el texto una sola vez y se obtienen varias decisiones listas para el sistema de tickets.
- Scoring de leads: pregunta `score` sobre intención de compra o encaje con el perfil ideal, usando la probabilidad como puntuación continua para priorizar la cola comercial.
- Clasificación de intención en asistentes conversacionales: pregunta `choice` sobre la intención del usuario en cada turno, con contexto de hasta 32K tokens para conversaciones largas.
- Análisis de sentimiento y detección de quejas: preguntas `choice` de sentimiento y `noul` de solicitud de reembolso en una sola petición, útil para atención al cliente automatizada.
- Enriquecimiento de datos a gran escala: clasificación por lotes de documentos o reseñas con coste de salida nulo y latencia subsegundo, adecuado para volúmenes altos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente; `verified: false` en el model-index, aunque la fuente citada es el leaderboard oficial del mantenedor del benchmark, publicado el 10 de noviembre de 2026):

| Benchmark | Métrica | Valor | Posición |
|---|---|---|---|
| S1MB English v1 (137 benchmarks, split test) | Task Average | 75,06 | #1 de 213 (nov. 2026) |
| S1MB English v1 (137 benchmarks, split test) | Borda | 89,88 | #1 de 213 (nov. 2026) |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar de LLM. La latencia declarada es de aproximadamente 0,3 s p50 por petición.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El modelo no se distribuye en pesos; solo se ofrece como API alojada, por lo que el usuario no ejecuta inferencia local.
- GPU recomendadas: no disponible. El proveedor sirve el modelo con vLLM y expertos en INT4, pero no se especifica el hardware subyacente.
- ¿Cabe en GPU de consumo? No disponible; al no distribuirse pesos, no es posible el despliegue local.
- Opciones de despliegue: exclusivamente API HTTP (`https://api.punkytigerlabs.com/v1/systemone`). No hay soporte declarado para vLLM local, llama.cpp, Ollama ni TGI por parte del usuario.
- Latencia y throughput: ~0,3 s p50 por petición según el autor; throughput no disponible.
- Coste: plan gratuito de 100 M tokens/día por clave; prepago a 0,042 USD por millón de tokens de entrada con salida gratuita; instancias dedicadas bajo contrato.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Superion S1 | 26B totales / 4B activos (MoE) | 32K por pregunta | Clasificación con probabilidades calibradas, sin generación | `superion-s1-api-terms` | Solo API |
| Modelos base tipo Gemma 4 26B-A4B-it | 26B / 4B activos | no disponible | Generación de texto; clasificación vía prompting y parseo | licencia del modelo base | Pesos descargables |
| LLM de chat usados como clasificadores | variable | variable | Generación de texto + parseo de etiquetas | variable | Pesos o API |

No se dispone de datos de benchmarks comparativos directos con alternativas en la información proporcionada; el único dato público es la posición #1 de 213 en S1MB English v1. La comparativa con modelos de la misma categoría (clasificadores calibrados servidos como API) no está disponible.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe declarado, lo que limita su uso en castellano u otros idiomas.
- No se distribuyen pesos: el uso está atado a la API del proveedor, con dependencia de disponibilidad, latencia de red y política de precios.
- Licencia propia (`superion-s1-api-terms`): es necesario revisar los términos en `https://punkytigerlabs.com/s1/terms` antes de un uso comercial; no es una licencia open source.
- Los resultados de benchmarks están declarados por el autor y marcados como no verificados (`verified: false`) en el model-index, aunque se citan como publicados por el mantenedor del benchmark.
- Riesgo de alucinación reducido por diseño (no genera texto), pero las probabilidades pueden estar mal calibradas en dominios alejados de la distribución de entrenamiento; se recomienda validar umbrales con datos propios.
- Sin información pública sobre sesgos, composición del dataset de ajuste ni metodología de calibración.
- El límite de 32K tokens es por pregunta, no necesariamente acumulativo entre preguntas de una misma petición; conviene verificar el comportamiento exacto en la documentación.
- El plan gratuito tiene un límite de 100 M tokens/día por clave; cargas superiores requieren prepago o contrato.
- No hay garantías publicadas sobre latencia p99, disponibilidad (SLA) ni región de procesamiento de datos.

## Enlaces

- Model card en Hugging Face: https://huggingface.co/PunkyTiger/Superion-S1
- Leaderboard S1MB: https://huggingface.co/datasets/hotchpotch/s1mb-result
- Dataset S1MB English v1: https://huggingface.co/datasets/hotchpotch/S1MB-english-v1
- Demo en vivo: https://huggingface.co/spaces/ZamnaMx/superion-s1-demo
- Documentación de la API: https://punkytigerlabs.com/s1/docs
- Registro y clave API: https://punkytigerlabs.com/s1/#signup
- Términos de licencia: https://punkytigerlabs.com/s1/terms
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
