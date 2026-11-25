# olaverse/PurpleMIST-Mini-2.0

## Resumen

PurpleMIST-Mini-2.0 es un modelo de decisión ("System One") desarrollado por olaverse, derivado mediante fine-tuning completo de Qwen/Qwen3.5-4B-Base. No es un modelo generativo: no produce texto, sino que recibe un estado (un mensaje, ticket, registro, transcripción, recibo o captura de pantalla) junto con un conjunto de preguntas tipadas y devuelve, en un único forward pass, una distribución de probabilidad calibrada para cada respuesta. Esto lo sitúa en la categoría de clasificación probabilística estructurada más que en la de chat o generación.

Arquitectura basada en el backbone Qwen3.5-4B: 32 capas (24 de atención lineal Gated DeltaNet y 8 de atención completa), hidden size 2560, unos 4,2B parámetros de texto más 0,33B del codificador visual, para un total de 4.539.265.536 parámetros. La cabeza de lenguaje se sustituye por una cabeza pointer de 5,3M parámetros que puntúa opciones mediante producto escalar entre proyecciones (2560 → 1024) de la posición de respuesta y la línea de cada opción. Soporta contexto largo (entrenado hasta 98.304 tokens, servido hasta 262.144) y estados multimodales con varias imágenes.

Su relevancia práctica está en tres frentes: sustituye pipelines de clasificación ad hoc por un modelo único con calibración por tipo de pregunta, cubre 19 idiomas evaluados con especial énfasis en lenguas africanas (yoruba, hausa, igbo, pidgin nigeriano, suajili, amárico, somalí, zulú), y ofrece latencias bajas (mediana de 70 ms por petición de texto en una RTX PRO 6000) frente a alternativas generativas del mismo tamaño.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: 24 capas de atención lineal Gated DeltaNet + 8 capas de atención completa; codificador visual; cabeza pointer de decisión (sin cabeza de lenguaje) |
| Parametros totales | 4.539.265.536 (aprox. 4,2B texto + 0,33B visión) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 98.304 tokens por defecto (longitud de entrenamiento); hasta 262.144 configurable vía `max_len` |
| Tipos de cuantizacion | No disponible (el autor indica ejecutar en bf16, precisión en la que fue calibrado) |
| Idiomas soportados | 19 evaluados: en, yo, ha, ig, pcm, sw, am, so, zu, fr, ar, pt, es, hi, zh, de, id, ru, tr; el backbone Qwen3.5 cubre 201 idiomas y dialectos |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (bf16, 8,5 GB); repo de 9,1 GB |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B-Base y conserva su codificador visual, eliminando la cabeza de generación de lenguaje. La innovación principal está en la máscara de atención: en las ocho capas de atención completa se aplica una máscara de dos bloques, donde el prefijo (cabecera, imágenes y estado) es causal y nunca ve las preguntas, de modo que se codifica igual independientemente de lo que se pregunte después. Cada token de pregunta ve el prefijo completo y el resto de preguntas, permitiendo leer una pregunta junto a sus opciones. Las capas Gated DeltaNet permanecen causales.

El entrenamiento consistió en un fine-tune completo de todos los pesos del modelo de texto, con el codificador visual congelado. Los datos provienen de los conjuntos olaverse/african-typed-decisions y LocalLLaMA/typed-decisions. La calibración se realiza por tipo de pregunta con una temperatura propia, ajustada por separado para estados de texto y de imagen sobre estados de validación de cada fuente de entrenamiento. El modelo soporta tres tipos de pregunta: `choice` (opciones nombradas con criterios clave → descripción), `noul` (afirmación sí/no) y `score` (niveles ordenados de menor a mayor, devolviendo el nivel esperado y su distribución).

## Capacidades

- Clasificación probabilística calibrada sobre texto e imágenes, con distribución completa por pregunta en un solo forward pass.
- Tres tipos de pregunta estructurada: elección entre opciones (`choice`), probabilidad de sí/no (`noul`) y puntuación ordinal (`score`).
- Procesamiento multimodal: acepta varias imágenes por estado, colocadas en orden; hasta 1.024 tokens por imagen por defecto (aprox. 1 MP a 32×32 píxeles por token).
- Contexto largo sin truncamiento: las preguntas que no caben junto al estado se reparten en varias pasadas; un estado que no cabe se rechaza explícitamente.
- Multilingüismo con preguntas en idioma distinto al del estado (0,937 de accuracy en preguntas cruzadas fuera de muestra).
- No soporta tool calling, function calling ni razonamiento multi-paso generativo: es un modelo de decisión, no un agente.
- No genera texto libre ni mantiene conversaciones multi-turno.

## Casos de uso

- Enrutado de tickets de soporte: dado un mensaje de cliente, una pregunta `choice` con criterios por equipo devuelve la probabilidad de asignación a cada cola; la calibración permite fijar umbrales de derivación manual cuando la confianza es baja.
- Moderación y triaje de contenido en lenguas africanas: un `noul` sobre "¿este mensaje contiene una amenaza?" aprovecha la cobertura en yoruba, hausa, igbo, pidgin nigeriano y suajili, donde muchos clasificadores genéricos rinden peor.
- Extracción de intención en atención al cliente por WhatsApp: el ejemplo de la model card procesa un mensaje en yoruba sobre un cobro duplicado y decide el equipo responsable, sin necesidad de generar respuesta.
- Evaluación de riesgo crediticio o de fraude sobre documentos: un `score` con niveles ordenados (bajo, medio, alto) sobre un estado que combine texto y una captura de recibo o extracto.
- Análisis de encuestas y feedback abierto: convertir respuestas de texto libre en distribuciones sobre escalas ordinales calibradas, agregables estadísticamente sin post-procesado de umbrales.
- Verificación documental multimodal: comprobar si una factura o captura cumple ciertos criterios mediante preguntas `noul` encadenadas sobre el mismo estado con imagen adjunta.
- Clasificación multilingüe en producción con latencia baja: con mediana de 70 ms por petición de texto, encaja en pipelines síncronos de alta concurrencia donde un LLM generativo sería demasiado lento o caro.

## Benchmarks y rendimiento

| Benchmark | PurpleMIST-Mini-2.0 | PurpleMIST-Flash-1.0 (7,9B) | PurpleMIST-Mini-1.0 |
|---|---|---|---|
| Jev Decision Index (suite pública) | 46,5 | 46,7 | 13,1 |
| LocalLLaMA/typed-decisions (zero-shot) | 0,723 (KL 0,155; Brier 0,082) | 0,720 | 0,601 |
| Decision Index, suite de visión | 63,7 (6.º de 24 modelos hasta 6B) | No disponible | No disponible |
| African Typed Decisions (8 idiomas, accuracy) | 0,636 | 0,668 | 0,416 |
| Preguntas cruzadas de idioma (held-out, accuracy) | 0,937 | No disponible | No disponible |

Datos operativos del run completo del Decision Index en una RTX PRO 6000: 140.178 peticiones de texto respondidas íntegramente, ninguna truncada ni rechazada; latencia mediana de 70 ms y media de 92 ms por petición de texto.

## Requisitos de hardware

- VRAM estimada: unos 9 GB en bf16 para los pesos (8,5 GB) más overhead de activaciones y caché; con contexto de 98.304 tokens el consumo de activaciones crece de forma apreciable, por lo que se recomienda holgura.
- GPU recomendadas: RTX PRO 6000 (referencia medida por el autor), A100 40/80 GB, H100, L40S. Cualquier GPU con 16 GB o más debería poder cargar los pesos, aunque el contexto largo exige más memoria.
- Cabe en GPU de consumo: sí en bf16 en tarjetas de 16-24 GB (RTX 4090, RTX 5090, RTX A6000) para contextos moderados; el autor no publica cifras de VRAM por longitud de contexto.
- Despliegue: la model card solo documenta uso con `transformers>=5.22` y `torch>=2.12` mediante la clase `Decider` del script `purplemist.py`; opcionalmente `flash-linear-attention` y `causal-conv1d` para kernels rápidos de las capas lineales. No se mencionan vLLM, llama.cpp, Ollama ni TGI. También está disponible como servicio en la API de Olaverse (`purplemist-mini-2.0`, endpoint `POST /v1/decide`).
- Latencia y throughput: mediana de 70 ms y media de 92 ms por petición de texto en una RTX PRO 6000 según el autor; sin datos de throughput agregado ni de latencia con imágenes.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decision Index | African Typed Decisions | Licencia |
|---|---|---|---|---|---|
| PurpleMIST-Mini-2.0 | 4,5B | 98.304 (hasta 262.144) | 46,5 | 0,636 | apache-2.0 |
| PurpleMIST-Flash-1.0 | 7,9B | No disponible | 46,7 | 0,668 | No disponible |
| PurpleMIST-Mini-1.0 | No disponible | No disponible | 13,1 | 0,416 | No disponible |

La comparación relevante es interna a la familia PurpleMIST: Mini-2.0 iguala prácticamente a Flash-1.0 con la mitad de parámetros y supera con claridad a Mini-1.0. No se dispone de datos frente a clasificadores generativos de propósito general del mismo tamaño (por ejemplo, Qwen3.5-4B-Base sin fine-tuning), por lo que esa comparación no está disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no conversa y no soporta tool calling ni razonamiento multi-paso. Usarlo como LLM es un error de categoría.
- Las probabilidades solo están verificadas en los 19 idiomas evaluados; fuera de ellos el backbone puede funcionar, pero la calibración no está comprobada y hay que validar umbrales con datos propios.
- El entrenamiento usó una sola imagen por estado; con varias imágenes funcionan y se colocan en orden, pero el modelo nunca se entrenó para compararlas entre sí.
- Riesgo de alucinación estructural: al devolver siempre una distribución, una pregunta mal formulada o con opciones ambiguas producirá una respuesta con apariencia de confianza; la calibración mitiga pero no elimina este riesgo.
- La precisión de calibración es específica de bf16; cuantizar los pesos puede degradar la calibración y no hay datos publicados sobre cuantizaciones soportadas.
- El contexto largo implica coste de memoria y de cómputo cuadrático en las ocho capas de atención completa; conviene medir en el hardware objetivo antes de desplegar.
- Sesgos: no se documentan análisis de sesgo demográfico ni de dominio; la dependencia de los datasets olaverse/african-typed-decisions y LocalLLaMA/typed-decisions puede introducir sesgos de distribución en esos dominios.
- Licencia apache-2.0, que permite uso comercial sin restricciones adicionales conocidas, pero el autor no ofrece garantías sobre el rendimiento en dominios fuera de los evaluados.
- El modelo depende de `transformers>=5.22` y `torch>=2.12`, versiones recientes que pueden no estar disponibles en todos los entornos de producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/olaverse/PurpleMIST-Mini-2.0
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo predecesor de la familia: https://huggingface.co/olaverse/PurpleMIST-Flash-1.0
- Dataset de evaluación y entrenamiento: https://huggingface.co/datasets/olaverse/african-typed-decisions
- Dataset de evaluación y entrenamiento: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Jev Decision Index (suite pública): https://huggingface.co/spaces/multimodalart/jev-decision-index
- Consola de desarrollador de Olaverse: https://console.olaverselab.com
- Documentación de la API de decisiones: https://docs.olaverselab.com/api/decisions/
