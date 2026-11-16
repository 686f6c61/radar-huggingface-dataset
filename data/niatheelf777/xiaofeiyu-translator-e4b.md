# niatheelf777/xiaofeiyu-translator-e4b

## Resumen

`niatheelf777/xiaofeiyu-translator-e4b` es un adaptador LoRA publicado en Hugging Face por el usuario `niatheelf777` sobre el modelo base `google/gemma-4-E4B-it`. No es un modelo de propósito general, sino un componente auxiliar ("sidecar") especializado en una única tarea: traducir la prosa conversacional de las respuestas generadas por un modelo de razonamiento de frontera a chino coloquial de mensajería instantánea (IM), en formato de múltiples burbujas, preservando intactos los bloques de código, las expresiones matemáticas, los identificadores y las llamadas a herramientas.

El adaptador se integra en el ecosistema `@xiaofeiyu` (`openai-voice-proxy` y `dsh-plugin`), que actúa como proxy compatible con la API de OpenAI: el modelo de frontera (DeepSeek, Claude, GPT, Qwen o un Llama local) produce la respuesta técnica completa y este adaptador se encarga únicamente de la capa de presentación lingüística. El repositorio ocupa 0,2 GB y contiene 13.893.632 parámetros entrenables en formato PEFT, lo que lo convierte en un componente ligero desplegable junto al modelo principal.

La relevancia del proyecto reside en su enfoque de separación de responsabilidades: en lugar de pedir a un modelo grande que genere simultáneamente código correcto y registro coloquial natural, se delega la reescritura estilística a un adaptador pequeño y medible. El autor publica métricas concretas de latencia (mediana de 302,1 ms) y de invariancia estructural (0 % de fugas en bloques de código), lo que permite evaluar el componente con criterios de ingeniería y no solo cualitativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer `google/gemma-4-E4B-it`; adaptadores en las 20 capas superiores (22..41), módulos no-QKV |
| Parámetros totales | 13.893.632 (adaptador); el modelo base no se distribuye en este repositorio |
| Parámetros activos | no disponible (el modelo base es de tipo E4B; no se especifica el desglose MoE en la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF `Q8_0` verificado en los benchmarks del autor; no se documentan otros formatos |
| Idiomas soportados | `zh`, `en` |
| Licencia | Apache 2.0 para el adaptador; el uso del modelo base queda sujeto a los Gemma Terms of Use |
| Formato de pesos | PEFT (adaptador LoRA) y GGUF |
| Módulos adaptados | 80 módulos, 0 módulos QKV |
| Repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador aplica LoRA sobre las 20 capas superiores (índices 22 a 41) del modelo base `gemma-4-E4B-it`, excluyendo explícitamente las proyecciones QKV: se adaptan 80 módulos en total y ninguno de ellos corresponde a query, key o value. Esta decisión concentra la capacidad de adaptación en las representaciones de salida y en las capas de feed-forward superiores, que es donde se materializa el estilo de generación, sin alterar el mecanismo de atención que el modelo base ya ha aprendido.

El entrenamiento combina una fase supervisada y una fase de preferencias: el autor reporta una reducción de la NLL de evaluación de 2,598 a 1,368 y un ajuste DPO posterior con una precisión de preferencia del 96,05 % sobre un conjunto retenido de 76 pares (73 aciertos). La tarea objetivo es una reescritura controlada mediante cinco pesos tipo slider (`s0` y `c1..c4`) que modulan el estilo de las burbujas generadas. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni la configuración exacta de hiperparámetros.

## Capacidades

- Traducción de prosa conversacional de inglés (y texto mixto) a chino coloquial de mensajería instantánea, segmentada en múltiples burbujas.
- Control de estilo mediante cinco pesos ajustables (`s0` + `c1..c4`), lo que permite variar el registro de salida sin reentrenar.
- Preservación literal de bloques de código delimitados por fences: 0 de 36 casos con fuga o corrupción en la evaluación del autor.
- Preservación de expresiones matemáticas e identificadores técnicos sin traducir.
- Paso directo ("pass-through") de llamadas a herramientas y de estructuras de tool calling generadas por el modelo de frontera.
- Preservación exacta de identificadores de vídeo y marcas de tiempo: 7 de 7 casos correctos en la validación reportada.
- Funcionamiento como sidecar de un modelo de razonamiento externo, sin capacidad de razonamiento autónomo propia.
- Soporte bilingüe chino-inglés; no se documentan otros idiomas.

## Casos de uso

- Asistentes conversacionales en chino con backend de razonamiento de frontera: el proxy `@xiaofeiyu/openai-voice-proxy` envía la respuesta técnica del modelo grande a este adaptador, que la reescribe en burbujas de chat naturales; la separación evita degradar la calidad del código o del razonamiento al imponer un registro coloquial.
- Atención al cliente en aplicaciones de mensajería: el adaptador convierte respuestas técnicas o extensas en mensajes cortos y naturales, adecuados para interfaces tipo WeChat, manteniendo intactos los identificadores de pedido o de producto que el modelo grande haya insertado.
- Integración en pipelines de agentes con tool calling: al pasar las llamadas a herramientas sin modificar, el adaptador puede situarse entre el orquestador y la interfaz de usuario sin romper el contrato de funciones ni los argumentos JSON.
- Localización de documentación técnica generada por IA: los bloques de código y las expresiones matemáticas se preservan literalmente, de modo que la salida reescrita sigue siendo copiable y ejecutable.
- Subtitulado y transcripción con marcas de tiempo: la preservación verificada de identificadores de vídeo y timestamps permite usar el adaptador en flujos de vídeo donde la alineación temporal no puede alterarse.
- Despliegue en hardware modesto junto a un modelo grande remoto: con 13,9 M de parámetros y cuantización `Q8_0`, el adaptador añade una latencia mediana de 302,1 ms y un throughput de 129 a 140 tok/s, por lo que puede ejecutarse en la misma máquina que el cliente sin competir por VRAM con el modelo principal.
- Prototipado de interfaces de voz: el nombre del proyecto (`voice-translator`) y su integración con un proxy compatible con OpenAI sugieren su uso en asistentes de voz que necesitan respuestas habladas en registro natural; no se detalla en la información disponible el componente de síntesis o reconocimiento de voz.

## Benchmarks y rendimiento

Datos reportados por el autor en la model card (versión `v1`):

| Métrica | Resultado |
|---|---|
| NLL de evaluación (antes → después) | 2,598 → 1,368 |
| Precisión de preferencia DPO (held-out) | 96,05 % (73/76) |
| Latencia mediana de traducción (5 sliders) | 302,1 ms |
| Throughput (`Q8_0`) | 129–140 tok/s |
| Fugas en bloques de código | 0/36 (0 %) |
| Preservación de ID de vídeo y timestamp | 7/7 (100 %) |

No se han publicado resultados en benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible; el modelo está diseñado para una tarea de reescritura y no para evaluación en dichos conjuntos.

## Requisitos de hardware

- VRAM del adaptador: 13,9 M de parámetros en `Q8_0` equivalen a aproximadamente 14 MB de pesos, un consumo despreciable frente al modelo base.
- El requisito real de VRAM lo determina `google/gemma-4-E4B-it`, cuyas necesidades no se detallan en la información proporcionada.
- GPU recomendadas: no disponibles para el modelo base; el adaptador en sí puede ejecutarse en CPU o en cualquier GPU consumer con capacidad sobrante.
- Cabe en cualquier GPU consumer, ya que el adaptador ocupa del orden de decenas de MB; la viabilidad conjunta depende del modelo base.
- Opciones de despliegue: PEFT sobre el modelo base, GGUF (`Q8_0` verificado) y el proxy `@xiaofeiyu/openai-voice-proxy` o `@xiaofeiyu/dsh-plugin` como capa de integración compatible con la API de OpenAI. No se documenta soporte explícito de vLLM, TGI o llama.cpp más allá del formato GGUF.
- Latencia y throughput medidos: 302,1 ms de mediana y 129–140 tok/s en `Q8_0`, según el autor.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| `niatheelf777/xiaofeiyu-translator-e4b` | LoRA sobre Gemma-4-E4B-it | 13,9 M (adaptador) | no disponible | Apache 2.0 (adaptador) | Reescritura coloquial zh con preservación de código y tool calls |
| `google/gemma-4-E4B-it` | Modelo base instruct | no disponible | no disponible | Gemma Terms of Use | Generación general y razonamiento |
| Adaptadores de traducción genéricos (p. ej. LoRA sobre NLLB o M2M-100) | LoRA sobre modelos de traducción | variable | variable | variable | Traducción literal entre idiomas, sin control de estilo ni preservación estructural |
| Modelos de chat chinos ajustados (p. ej. Qwen instruct) | Modelo completo | variable | variable | variable | Conversación general en chino, sin función de sidecar |

La comparación directa es limitada: no se dispone de datos públicos de benchmarks de este adaptador frente a alternativas, y su función (reescritura estilística preservando estructura) no coincide con la de un traductor neuronal convencional ni con la de un modelo de chat completo.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: requiere `google/gemma-4-E4B-it` y, en el flujo previsto, un modelo de razonamiento de frontera que genere la respuesta original.
- Solo cubre chino e inglés; no se documenta comportamiento en otros idiomas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación independiente de las métricas reportadas por el autor.
- Las cifras de benchmarks proceden exclusivamente de la model card del autor; no hay evaluación de terceros.
- El ajuste DPO se valida sobre 76 pares, un conjunto pequeño que limita la significación estadística de la precisión del 96,05 %.
- No se especifican la longitud de contexto, la composición del dataset de entrenamiento ni los hiperparámetros, lo que dificulta reproducir o auditar el entrenamiento.
- Riesgo de alucinación y de deriva estilística en entradas muy largas o con mezcla densa de código y prosa; no se documentan pruebas en esos escenarios.
- El uso comercial del modelo base está sujeto a los Gemma Terms of Use, independientemente de la licencia Apache 2.0 del adaptador.
- La licencia Apache 2.0 se aplica al adaptador; conviene verificar la compatibilidad con los términos del modelo base antes de un despliegue en producción.
- No se documentan sesgos específicos ni evaluaciones de seguridad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/niatheelf777/xiaofeiyu-translator-e4b
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Gemma Terms of Use: https://ai.google.dev/gemma/terms
- Repositorio del proxy `@xiaofeiyu/openai-voice-proxy`: no disponible
- Repositorio del plugin `@xiaofeiyu/dsh-plugin`: no disponible
- Paper o blog técnico: no disponible
