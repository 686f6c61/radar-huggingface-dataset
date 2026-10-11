# ahmedandaloes/laya-typed-decisions-CoreAI

## Resumen

laya-typed-decisions-CoreAI es una conversión comunitaria del modelo convaiinnovations/laya-typed-decisions al formato Apple Core AI (`.aimodel`), publicada por el usuario ahmedandaloes. No se trata de un modelo nuevo ni de un ajuste fino: es un artefacto de despliegue que empaqueta el forward completo de Laya (encoder, cabeza tipada, scorer y act head) como un único programa exportado, ejecutable en macOS 27 sobre Apple Silicon mediante el runtime coreai.

Laya es un modelo de decisión no autorregresivo de tipo System 1: recibe un estado (texto) y un conjunto de preguntas tipadas, y devuelve respuestas tipadas con probabilidades calibradas en un solo forward pass. Nunca genera texto libre, no mantiene caché KV ni bucle de decodificación, lo que lo hace encajar de forma natural en un grafo estático de Core AI.

La relevancia de esta conversión es práctica: permite ejecutar el modelo en local sobre hardware Apple sin dependencia de PyTorch en tiempo de inferencia. El autor reporta una deriva numérica nula en la validación de la conversión (diferencia máxima absoluta de probabilidad de 0.000000 en 6 casos), aunque esa cifra mide únicamente el error introducido por la exportación, no la calidad del modelo subyacente. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta y carece de licencia declarada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No autorregresiva de decisión (encoder + cabeza tipada + scorer + act head); un solo forward pass, sin caché KV ni bucle de decodificación |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 1024 tokens fijos de entrada y 256 marcadores de opción; el grafo está paddeado a esa forma fija y lanza `CapacityError` si la petición no cabe (no hay truncado silencioso) |
| Tipos de cuantizacion | ninguno; los pesos son el encoder y la cabeza de decisión originales en FP32 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Bundle Apple Core AI `.aimodel` (`decision.aimodel/`), más ficheros de tokenizer y configuración del checkpoint original |
| Modelo base | convaiinnovations/laya-typed-decisions (relación declarada: `quantized`, aunque la model card afirma que no se cuantiza nada) |
| Librería | coreai |
| Tamaño del repositorio | 1.7 GB |
| Tipos de tensor de entrada | int32 en tensores de host; máscara de marcadores en bool |
| Runtime de conversión | coreai-core 1.0.0b3 / coreai-torch 0.4.3, sobre macOS 27.0.1 |
| Fecha de publicación | 2026-10-11 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un modelo de decisión no autorregresivo. En lugar de generar una secuencia token a token, procesa un estado textual junto con preguntas tipadas y produce, en una sola pasada, respuestas tipadas acompañadas de probabilidades calibradas. La exportación a Core AI incluye cuatro componentes: el encoder, la cabeza tipada (typed head), el scorer y la act head. Al no existir decodificación iterativa, todo el modelo se materializa como un único programa exportado, con una forma de grafo fija de 1024 tokens y 256 marcadores de opción.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF o DPO en esta conversión. El repositorio incluye un fichero `rl_agent_config.json` entre los ficheros del checkpoint original, así como las temperaturas de calibración enviadas con el modelo, lo que sugiere que el pipeline original incorpora algún tipo de calibración de probabilidades, pero el detalle no está documentado en la información disponible. La act head se exporta por completitud, pero el propio autor advierte de que la señal de esa cabeza no es utilizable todavía (issue #185 de la fuente), por lo que `act_logits` no debería usarse como criterio de decisión.

## Capacidades

- Emisión de decisiones tipadas: devuelve la opción seleccionada dentro de un conjunto de criterios definido por el usuario (por ejemplo, enrutar a "billing" o "technical").
- Probabilidades calibradas por respuesta, gracias a las temperaturas de calibración incluidas en el checkpoint.
- Soporte de al menos tres tipos de pregunta documentados en la validación: `choice`, `noul` y `score`.
- Inferencia en un único forward pass, sin generación de texto y sin bucle de decodificación.
- Ejecución local en Apple Silicon mediante el runtime Core AI, con tokenización, normalización de preguntas y decodificación de respuestas a cargo del paquete `laya`, de modo que los prompts son idénticos byte a byte a los de la ruta PyTorch.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No hay datos sobre capacidades multilingües.
- No hay capacidades de visión ni de audio.

## Casos de uso

- Enrutamiento de tickets de soporte: el modelo recibe el texto de la incidencia y una pregunta de tipo `choice` con criterios por departamento (facturación, técnico, etc.) y devuelve el departamento con su probabilidad asociada. El ejemplo de la propia model card resuelve una duplicidad de cobro hacia "billing".
- Triaje con umbral de confianza: como las respuestas vienen con probabilidad calibrada, se puede fijar un umbral por debajo del cual el caso se escala a un humano en lugar de automatizarse, algo que un modelo generativo no ofrece de forma nativa.
- Preclasificación previa a un LLM: usar Laya como filtro System 1 barato que decide la categoría de una consulta antes de invocar un modelo generativo grande, reduciendo coste y latencia en la ruta mayoritaria.
- Puntuación de leads o de riesgo: con preguntas de tipo `score`, el modelo puede asignar una puntuación a un estado textual dentro de un rango definido por criterios, útil para priorización comercial o de moderación.
- Normalización de formularios y datos de entrada: decidir entre categorías cerradas a partir de texto libre escrito por el usuario, aprovechando que la salida es una opción tipada y no texto que haya que parsear.
- Enrutamiento en pipelines internos sobre macOS: al ejecutarse como bundle `.aimodel` en Apple Silicon, encaja en herramientas de escritorio o servicios locales donde no se quiere levantar un stack de PyTorch.
- Desambiguación en agentes conversacionales: resolver preguntas cerradas sobre el estado de la conversación (por ejemplo, qué entidad menciona el usuario) antes de decidir la siguiente acción en un sistema mayor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible (MMLU, HumanEval, GSM8K ni equivalentes). El único dato numérico del repositorio es una validación de la conversión, no un benchmark del modelo:

| Medición | Resultado |
|---|---|
| Casos de validación (tipos `choice`, `noul`, `score`) | 6 |
| Respuestas seleccionadas coincidentes con la referencia PyTorch | Verdadero en todos los casos |
| Diferencia absoluta máxima de probabilidad | 0.000000 |
| Referencia de comparación | Forward eager de PyTorch del propio paquete `laya`, alimentado con los mismos tensores construidos con `build_sequence` |

Esta medición cuantifica exclusivamente la deriva introducida por la conversión a Core AI. No evalúa la precisión ni la calibración reales de Laya; para eso remite a la model card y a los issues del repositorio upstream.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con macOS 27; el bundle `.aimodel` no es portable a otras plataformas.
- Runtime necesario: coreai (probado con coreai-core 1.0.0b3 y coreai-torch 0.4.3 para la conversión).
- Memoria: el repositorio ocupa 1.7 GB y los pesos se mantienen en FP32 sin cuantizar, por lo que la huella en memoria de los pesos es del orden de esa cifra. El número exacto de parámetros no está disponible, así que no se puede dar una estimación de VRAM más precisa.
- GPU dedicada: no aplica; el modelo no está pensado para CUDA ni para GPUs de escritorio tipo RTX 4090, A100 o H100.
- Opciones de despliegue: exclusivamente mediante el runtime Core AI invocando `LayaCoreAI.load()` y `model.predict()`; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Al ser un único forward pass sin bucle de decodificación, la latencia debería ser la de una sola pasada del grafo, pero no se publican cifras.

## Comparativa con modelos similares

No se dispone de información sobre modelos de decisión tipada comparables en el ecosistema abierto. La única referencia disponible es el propio modelo base sin convertir:

| Modelo | Formato | Precisión | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ahmedandaloes/laya-typed-decisions-CoreAI | Bundle `.aimodel` (Core AI) | FP32 | 1024 tokens / 256 marcadores, forma fija | no disponible | HuggingFace, 0 descargas, 0 likes |
| convaiinnovations/laya-typed-decisions | Checkpoint PyTorch (referencia) | FP32 | no disponible en esta información | no disponible | HuggingFace (upstream) |

No hay datos para comparar con alternativas de la misma categoría en parámetros, contexto o rendimiento.

## Limitaciones y advertencias

- No es una versión oficial: es una conversión comunitaria independiente, no publicada por Apple ni por Convai.
- No genera texto. Cualquier expectativa de uso como modelo conversacional o generativo es incorrecta.
- La act head está exportada pero su señal no es utilizable según el propio autor; no conviene tomar decisiones basadas en `act_logits`.
- Contradicción en los metadatos: la relación con el modelo base se declara como `quantized`, pero la model card afirma que nada está cuantizado y que los pesos son FP32 originales.
- Capacidad rígida: la forma del grafo está fijada a 1024 tokens y 256 marcadores. Si una petición no cabe, se lanza `CapacityError`; no hay truncado ni degradación gradual, lo que obliga a gestionar el error en el código cliente.
- Licencia no disponible: no hay autorización explícita para uso comercial ni condiciones de redistribución, lo que impide un despliegue en producción con garantías legales sin consultar previamente al autor.
- Idiomas soportados no declarados; no se puede asumir cobertura multilingüe.
- Riesgo de alucinación: no evaluado en esta conversión, pero al tratarse de un clasificador con salida cerrada, el fallo típico sería una asignación incorrecta con probabilidad alta, no una invención de texto.
- Sesgos: no hay información publicada sobre sesgos del modelo base ni de esta conversión.
- Dependencia de plataforma: requiere macOS 27 y Apple Silicon, lo que excluye servidores Linux con GPU, el entorno habitual de producción.
- Estado del repositorio: 0 descargas y 0 likes, publicado y actualizado en menos de un minuto el 2026-10-11, sin señales de uso o mantenimiento por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ahmedandaloes/laya-typed-decisions-CoreAI
- Modelo base: https://huggingface.co/convaiinnovations/laya-typed-decisions
- Los resultados de búsqueda web proporcionados no contienen ningún enlace relevante para este modelo: todas las entradas corresponden a ofertas de leasing del Renault 5 E-Tech y han sido descartadas. No se dispone de enlaces a papers, blogs, repositorios o demos adicionales.
