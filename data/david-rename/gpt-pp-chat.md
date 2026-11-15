# david-rename/gpt-pp-chat

## Resumen

gpt-pp-chat es un modelo de lenguaje conversacional de 135.266.304 parámetros desarrollado por el usuario david-rename, obtenido mediante ajuste fino del modelo base gpt-pp-base sobre conversaciones del dataset SmolTalk. Forma parte de la familia gpt-pp, una implementación del recetario NanoChat (arquitectura transformer tipo GPT) que el autor publica junto a otros dos modelos: gpt-pp-base (135M, texto web) y gpt-pico (2,2M, cuentos infantiles). El ajuste se realizó en 2.048 pasos sobre 67 millones de tokens en una única GPU en 32 minutos, calculando la pérdida únicamente sobre el texto del asistente y su marcador de fin.

El modelo resuelve la tarea de generar respuestas conversacionales multi-turno siguiendo una plantilla de chat concreta (`<|bos|><|user_start|>...<|user_end|><|assistant_start|>...<|assistant_end|>`), sin rol de sistema. Su relevancia es fundamentalmente didáctica: el autor lo presenta explícitamente como un ejemplo para estudiar y servir, no como un asistente fiable. La model card documenta con transparencia inusual los efectos del ajuste, incluyendo el deterioro en la perplejidad sobre texto plano y una evaluación cualitativa donde solo 7 de 20 preguntas resultaron correctas.

El modelo se distribuye en float32 con pesos en safetensors bajo la arquitectura NanoChat de transformers, con una subclase propia de unas 30 líneas (`modeling_gptpp.py`) que implementa una ganancia sobre las queries normalizadas, lo que obliga a usar `trust_remote_code=True`. Requiere transformers 5 (probado con 5.23.0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo GPT (receta NanoChat, subclase gpt-pp) |
| Parametros totales | 135.266.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (entrenado con contextos de hasta 1.024) |
| Tipos de cuantizacion | no disponible (pesos publicados en float32) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (float32) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 135M parámetros que sigue la receta NanoChat de 2026, con una única desviación respecto a ella: gpt-pp multiplica cada query normalizada por una ganancia, de modo que la puntuación de atención es 12 veces el coseno entre query y key. Como esa ganancia actúa después de una normalización, no puede absorberse en los pesos, y por eso el repositorio incluye `modeling_gptpp.py`, una subclase de NanoChat de unas 30 líneas. En la exportación a transformers se negó la segunda mitad de las filas de cada cabeza en W_Q y W_K para adaptar la orientación de los pares rotatorios de NanoChat; la conversión (`scripts/export_hf.py`) verifica los logits contra el código propio de gpt-pp con una concordancia de 7,7e-14 en float64.

El preentrenamiento del modelo base usó FineWeb-EDU (`sample/10BT`, ODC-By v1.0). El ajuste conversacional se hizo sobre SmolTalk en la revisión `5feaf2f`, configuraciones everyday-conversations, smol-constraints y smol-magpie-ultra (Apache 2.0): 2.048 pasos sobre 67 millones de tokens, con la pérdida contada solo sobre el texto del asistente y su marcador de fin. No se menciona RLHF ni DPO. El autor documenta 90 rarezas, problemas conocidos y bugs corregidos en `docs/KNOWN-ISSUES.md`, cada uno con su evidencia y su efecto sobre las métricas.

## Capacidades

- Generación de texto conversacional multi-turno siguiendo la plantilla de chat propietaria, con turnos alternos usuario/asistente.
- Aprendizaje de la forma de una conversación y del momento de parar: la pérdida sobre el marcador de fin bajó de 26,4 a 0,24 nats.
- Generación con parada en cualquier token especial y muestreo por defecto con temperatura 0,8.
- Capacidad limitada de responder preguntas factuales sencillas (7 de 20 correctas en la evaluación cualitativa del autor).
- No soporta tool calling ni function calling (no documentado).
- No soporta agentes ni razonamiento multi-paso (no documentado).
- Sin capacidades de visión ni audio.
- Sin modo de pensamiento (thinking mode).
- Multilingüe: no; solo inglés.

## Casos de uso

- Estudio de ajuste fino conversacional: el modelo sirve para reproducir y analizar el efecto de un SFT corto (2.048 pasos, 67M tokens, 32 minutos en una GPU) sobre un modelo base pequeño, comparando las métricas antes y después que publica el autor.
- Docencia y experimentación con arquitecturas transformer: su tamaño de 135M parámetros y su código de ~30 líneas sobre NanoChat lo hacen adecuado para cursos y talleres donde se quiera inspeccionar atención, normalización y plantillas de chat.
- Pruebas de infraestructura de despliegue: al caber en cualquier GPU consumer, permite validar pipelines de inferencia (transformers, servidores propios) antes de escalar a modelos mayores.
- Evaluación de formatos de chat y tokenizadores especiales: útil para experimentar con plantillas basadas en tokens especiales y parada en marcadores de fin.
- Investigación sobre degradación de capacidades tras SFT: el caso documenta la pérdida de perplejidad en texto plano (de 0,932 a 1,213 bits por byte en FineWeb-EDU) como ejemplo de olvido catastrófico parcial.
- Generación de respuestas de relleno en prototipos de interfaz: para maquetar UIs conversacionales donde la corrección factual no es requisito, dado que el modelo produce la forma de una respuesta aunque el contenido sea erróneo.
- Reproducción de experimentos de bajo coste: el autor documenta el entrenamiento en una sola GPU en 32 minutos, lo que permite iterar sobre hiperparámetros sin infraestructura dedicada.

## Benchmarks y rendimiento

El autor no publica benchmarks estándar (MMLU, HumanEval, GSM8K), pero sí métricas propias antes y después del ajuste:

| Metrica | Antes del ajuste | Despues del ajuste |
|---|---:|---:|
| Pérdida en tokens del asistente (3.000 conversaciones reservadas), nats por token | 2,52 | 1,44 |
| Pérdida solo en el marcador de fin, nats | 26,4 | 0,24 |
| Bits por byte en FineWeb-EDU reservado | 0,932 | 1,213 |

Evaluación cualitativa del autor: 20 preguntas respondidas con decodificación greedy y juzgadas por un modelo de lenguaje (no por una persona): 7 correctas, 11 incorrectas, 2 fuera de tema; falló en las tres preguntas de aritmética y en las dos peticiones de listas.

## Requisitos de hardware

- VRAM estimada para inferencia: en float32, los 135,3M de parámetros ocupan aproximadamente 541 MB, más overhead de activaciones y KV cache; en la práctica cabe holgadamente en GPUs con 2 GB o más.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.) es más que suficiente; también A100/H100, aunque no son necesarias.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 2 GB de VRAM; incluso es viable en CPU para pruebas.
- Opciones de despliegue: transformers 5 (probado con 5.23.0) con `trust_remote_code=True`; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI (los pesos se publican en float32, sin GGUF).
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---:|---:|---|---|---|
| gpt-pp-chat | 135,3M | 1.024 | no disponible | Hugging Face | Ajustado sobre SmolTalk; requiere `trust_remote_code` |
| gpt-pp-base | 135M | no disponible | no disponible | Hugging Face | Modelo base del mismo autor, preentrenado en FineWeb-EDU |
| gpt-pico | 2,2M | no disponible | no disponible | Hugging Face | Modelo del mismo autor entrenado con cuentos infantiles |
| Alternativas de tamano similar (p. ej. SmolLM-135M) | ~135M | no disponible | no disponible | no disponible | No se dispone de datos verificados en la informacion proporcionada |

No se dispone de datos de benchmarks comparativos con modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Modelo de 135M parámetros: responde con confianza y se equivoca a menudo; el propio autor lo describe como ejemplo para estudiar y servir, no como asistente fiable.
- No sabe hacer aritmética: falló las tres preguntas de aritmética de la evaluación cualitativa.
- Sin entrenamiento de seguridad más allá de lo que contienen las conversaciones de SmolTalk.
- Entrenado con contextos de como máximo 1.024 tokens; no admite ventanas mayores.
- Solo inglés; sin capacidades multilingües.
- Deterioro en texto plano tras el ajuste: la perplejidad en FineWeb-EDU empeora de 0,932 a 1,213 bits por byte.
- Riesgo alto de alucinación: el ejemplo de la model card sobre por qué el cielo es azul es factualmente incorrecto y el autor lo incluye deliberadamente para mostrar qué esperar.
- Licencia no disponible: no se puede confirmar el uso comercial; hay que contactar con el autor o consultar el repositorio.
- Requiere `trust_remote_code=True` y transformers 5; la arquitectura depende de código personalizado (`modeling_gptpp.py`).
- No hay rol de sistema: los mensajes de sistema se unen al primer mensaje del usuario con una línea en blanco.
- El repositorio documenta 90 rarezas y problemas conocidos en `docs/KNOWN-ISSUES.md`; conviene revisarlos antes de cualquier uso en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/david-rename/gpt-pp-chat
- Modelo base: https://huggingface.co/david-rename/gpt-pp-base
- Modelo gpt-pico: https://huggingface.co/david-rename/gpt-pico
- Repositorio del proyecto: https://github.com/d-/gpt-pp
- Problemas conocidos: https://github.com/d-/gpt-pp/blob/main/docs/KNOWN-ISSUES.md
- Dataset de ajuste (SmolTalk): https://huggingface.co/datasets/HuggingFaceTB/smoltalk
- Dataset de preentrenamiento (FineWeb-EDU): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
