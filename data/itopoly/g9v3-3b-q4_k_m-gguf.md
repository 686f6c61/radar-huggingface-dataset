# Itopoly/G9v3-3B-Q4_K_M-GGUF

## Resumen

El modelo G9v3-3B es un modelo de lenguaje denso de aproximadamente 3.000 millones de parámetros desarrollado por ai9stars, con arquitectura LlamaForCausalLM y una ventana de contexto de 131.072 tokens. Este repositorio concreto (Itopoly/G9v3-3B-Q4_K_M-GGUF) ofrece una cuantización Q4_K_M en formato GGUF, empaquetada y validada por Itopoly para su ejecución en CPU en servidores de gama media. El modelo base incluye modos de razonamiento ("think" y "no-think") y soporte de llamada a herramientas (tool calling) mediante XML.

La relevancia de esta versión radica en su optimización para inferencia en CPU: el autor ha medido un rendimiento de aproximadamente 25 tokens por segundo en decodificación con 6 hilos en un EPYC de 2.0 GHz, lo que permite ejecutar el modelo en máquinas sin GPU. El repositorio incluye además una plantilla de chat personalizada, necesaria para que el tool calling funcione correctamente sin bucles infinitos. El modelo se distribuye bajo licencia Apache-2.0 y soporta inglés y chino.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LlamaForCausalLM (transformer denso) |
| Parámetros totales | 2.988.656.640 (~3B) |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantización | Q4_K_M (4.9 BPW); Q3_K_M disponible en repo companion |
| Idiomas soportados | inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo G9v3-3B es un transformer denso basado en la arquitectura LlamaForCausalLM, sin mezcla de expertos. Su ventana de contexto es de 131.072 tokens, con un coste de cache KV de 52 KiB por token. El modelo incorpora dos modos de inferencia: un modo "think" (temperatura 0.9, top_p 0.95) y un modo "no-think" (temperatura 0.7, top_p 0.95). En el modo "think", el texto de razonamiento se devuelve en el campo `message.reasoning` y la respuesta final en `content`.

La cuantización Q4_K_M de este repositorio fue realizada por mradermacher a partir del modelo base. Itopoly añadió una plantilla de chat en Jinja (`g9v3_chat_template_low.jinja`) que normaliza el historial de llamadas a herramientas. Sin esta plantilla, el modelo elimina los mensajes de resultado de las herramientas y entra en un bucle infinito de llamadas repetidas. No se proporcionan datos sobre el corpus de entrenamiento ni sobre procesos de alineación como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto en inglés y chino.
- Razonamiento explícito mediante modo "think", que produce texto de razonamiento separado de la respuesta.
- Llamada a herramientas (tool calling) basada en XML, verificada en un solo turno y en ambos formatos de historial de herramientas.
- Ventana de contexto larga de 131.072 tokens, apta para documentos extensos.
- Soporte de agentes y razonamiento multi-paso limitado por el tamaño del modelo.
- Sin capacidades de visión ni audio.

## Casos de uso

- Asistente conversacional en CPU: el modelo puede servirse con `llama-server` en máquinas sin GPU, alcanzando ~25 tok/s en decodificación con 6 hilos, lo que lo hace viable para chatbots internos de baja concurrencia.
- Análisis de documentos largos: gracias a sus 131K tokens de contexto, puede procesar contratos, informes o logs extensos; el coste de cache KV de 52 KiB/token permite 32K de contexto con ~10 GB de RAM libre.
- Agentes con tool calling en entornos con recursos limitados: la plantilla incluida corrige los bucles de repetición de herramientas, permitiendo flujos de agente en servidores modestos.
- Prototipado rápido de pipelines de herramientas: al ser un modelo 3B, las pruebas de integración con funciones XML pueden hacerse localmente antes de migrar a modelos de mayor tamaño.
- Asistente multilingüe inglés-chino: útil para aplicaciones que requieran bilingüismo en esos dos idiomas, como atención al cliente en mercados asiáticos.
- Despliegue en edge: el fichero GGUF de 1.8 GB puede almacenarse en dispositivos con poco espacio y ejecutarse con llama.cpp en CPUs x86-64 con AVX2.
- Evaluación de cuantización: el autor ha comparado Q4_K_M frente a Q3_K_M, mostrando que en un modelo 3B la diferencia de velocidad es mínima (~25 vs ~26 tok/s), lo que permite elegir Q4 por calidad sin penalización de latencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor del repositorio proporciona mediciones de rendimiento en CPU con llama.cpp, que se recogen a continuación:

| Métrica | Valor |
|---|---|
| Decodificación (contexto corto) | ~25 tok/s |
| Decodificación (4K contexto) | ~15 tok/s |
| Decodificación (8K contexto) | ~10 tok/s |
| Prefill | ~73 tok/s |
| Coste de prefill (prompt 5.5K) | 75-90 s la primera vez |
| Comparativa Q3_K_M | ~26 tok/s (Q3) vs ~25 tok/s (Q4) |
| Cache KV | 52 KiB/token |

Mediciones realizadas en un EPYC de 8 vCPU a 2.0 GHz con 6 hilos, en x86-64 con AVX2.

## Requisitos de hardware

- Memoria: se recomienda al menos 10 GB de RAM libre para 32K de contexto; 131K de contexto requiere ~12 GB de RAM en total.
- CPU: se ha validado en x86-64 con AVX2, 6 hilos. El autor recomienda que los hilos importan más que la cuantización en modelos 3B.
- GPU: no es necesaria; si se usa GPU con llama.cpp, el fichero GGUF de 1.8 GB requiere un mínimo de ~2-3 GB de VRAM más la cache KV (52 KiB/token).
- Despliegue: llama.cpp con `llama-server` (endpoint compatible con OpenAI en /v1/chat/completions). También es compatible con otras herramientas que cargan GGUF, como Ollama, aunque la plantilla personalizada es necesaria para tool calling.
- Configuración recomendada: `-t 6 -tb 8 -c 32768 -fa off`. La atención flash es más lenta en CPU.
- Latencia: prefill de ~73 tok/s; un prompt de 5.5K tokens tarda 75-90 s la primera vez, pero la cache de prefijo hace que las peticiones repetidas sean casi instantáneas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Velocidad decode |
|---|---|---|---|---|---|
| G9v3-3B Q4_K_M (este repo) | ~3B | 131K | Q4_K_M | Apache-2.0 | ~25 tok/s (6 hilos) |
| G9v3-3B Q3_K_M (repo companion) | ~3B | 131K | Q3_K_M | Apache-2.0 | ~26 tok/s (6 hilos) |
| Familia G9v3-39B | no disponible | no disponible | no disponible | no disponible | no disponible |

El autor indica que la familia de modelos 39B es la opción recomendada para tool calling de alta calidad, mientras que esta versión 3B está pensada para el nivel de 6 núcleos de CPU.

## Limitaciones y advertencias

- La calidad del tool calling es limitada por el tamaño del modelo; el autor recomienda los modelos de 39B para tareas intensivas de herramientas.
- El repositorio no incluye la plantilla de chat por defecto de llama.cpp; es obligatorio usar `g9v3_chat_template_low.jinja`, ya que sin ella el modelo entra en un bucle infinito de llamadas a herramientas.
- El prefill es el cuello de botella en CPU: los prompts de más de 1-2K tokens requieren una espera inicial de 75-90 s si el prefijo no está en cache.
- Solo soporta inglés y chino; no hay soporte de otros idiomas en la información disponible.
- No se han publicado benchmarks estándar, por lo que no es posible comparar su calidad con otros modelos de su tamaño de forma objetiva.
- La atención flash es más lenta en CPU; debe desactivarse con `-fa off`.
- No hay datos sobre el proceso de entrenamiento ni sobre posibles sesgos del modelo en la información disponible.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Itopoly/G9v3-3B-Q4_K_M-GGUF
- Modelo base: https://huggingface.co/ai9stars/G9v3-3B
- Cuantización original GGUF: https://huggingface.co/mradermacher/G9v3-3B-GGUF
- Repo companion Q3_K_M: https://huggingface.co/Itopoly/G9v3-3B-Q3_K_M-GGUF
- Otra cuantización GGUF: https://huggingface.co/bartowski/ai9stars_G9v3-3B-GGUF
