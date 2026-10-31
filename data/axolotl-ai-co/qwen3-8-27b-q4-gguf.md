# axolotl-ai-co/Qwen3.8-27B-Q4-GGUF

## Resumen

Qwen3.8-27B-Q4-GGUF es una cuantización de 4 bits del modelo Qwen3.8-27B, publicado por el equipo axolotl-ai-co en formato GGUF. El modelo base, Qwen/Qwen3.8-27B, es un modelo de lenguaje de 27.320.697.856 parámetros desarrollado por Qwen, y esta versión cuantizada está pensada para ejecutarse localmente con llama.cpp reduciendo drásticamente los requisitos de memoria.

La particularidad de esta release es la receta de cuantización XQD (aXolotl Quantization for Decoding), que combina formatos estándar de llama.cpp con compensación de error estilo GPTQ y una matriz de importancia (imatrix) calibrada específicamente sobre tokens generados por el asistente en conversaciones y sesiones de uso agéntico. Según los autores, el fichero Q4 de 17,55 GB logra un 27,3 % menos de divergencia KL respecto al modelo en precisión completa que el UD-Q4_K_XL de unsloth.

Es relevante ahora porque aborda un problema práctico habitual: las cuantizaciones tradicionales se calibran sobre texto tipo preentrenamiento (perplejidad sobre wikitext o documentos web), lo que degrada el comportamiento en chat y agentes. Esta cuantización optimiza exactamente el caso de uso dominante en despliegues locales: chat y flujos agénticos con tool calling. El modelo hereda la licencia Apache 2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer con bloque de multi-token-prediction, MTP) |
| Parametros totales | 27.320.697.856 |
| Parametros activos | no disponible (solo aplicable si es MoE; no confirmado) |
| Longitud de contexto | no disponible (el ejemplo de la model card usa 32768 tokens) |
| Tipos de cuantizacion | XQD Q4 (formatos GGML estándar por tensor, cabeza de salida en Q6_K guiada por imatrix) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `Qwen3.8-27B-XQD-Q4.gguf`, 17,55 GB) |

## Arquitectura y entrenamiento

El repositorio no describe la arquitectura interna del modelo base Qwen3.8-27B más allá de dos detalles: conserva el bloque de multi-token-prediction (MTP) en el fichero GGUF, y es un modelo de texto puro (no incluye tensores de visión ni proyector multimodal). Los datos de entrenamiento del modelo base, número de tokens y composición del dataset no están disponibles en la información proporcionada; deben consultarse en la ficha de Qwen/Qwen3.8-27B.

Lo que sí documenta la model card es el proceso de cuantización XQD, que es una cuantización post-entrenamiento sin ningún fine-tuning adicional. El procedimiento es el siguiente: se capturan estadísticas de activación (una matriz de Hessian que registra qué direcciones de entrada son más relevantes) a partir de una mezcla de calibración propia, compuesta principalmente por transcripciones largas de razonamiento y uso agéntico, y de ahí se construye la imatrix. Sobre los formatos estándar de llama.cpp se aplica compensación de error estilo GPTQ: al redondear cada bloque de pesos, su error de redondeo se traslada a los pesos aún sin redondear, de modo que la salida de la capa se mantiene cercana a la original. Un asignador de bits elige después el formato de cada tensor bajo un presupuesto fijo de bytes, usando la divergencia KL que añade cada grupo de tensores al cuantizarse, medida sobre este modelo concreto. Además, la cabeza de salida recibe sus propios datos de importancia (que un `llama-imatrix` por defecto omite), lo que permite usar una cabeza Q6_K guiada en lugar de Q8_0 y dedicar esos bytes ahorrados al resto del modelo.

## Capacidades

Las capacidades corresponden al modelo base Qwen3.8-27B; esta release es una cuantización sin cambios funcionales:

- Generacion de texto conversacional (el repo está etiquetado como conversational).
- Uso agéntico: la cuantización está específicamente optimizada para tokens generados por el asistente en sesiones de tool use y razonamiento largo.
- Razonamiento: la mezcla de calibración incluye transcripciones de razonamiento largas, lo que sugiere que el modelo base está orientado a tareas de reasoning.
- Multi-token-prediction (MTP): el bloque MTP se conserva en el fichero, lo que puede acelerar la decodificación en runtimes que lo soporten.
- Texto exclusivamente: no incluye tensores de visión ni proyector multimodal.
- Soporte de tool calling, function calling, capacidades multilingues y thinking mode: no disponible en la información proporcionada (consultar la ficha del modelo base).

## Casos de uso

- Chatbots locales con calidad cercana al modelo completo: al optimizar la divergencia KL sobre tokens del asistente, esta cuantización es adecuada para asistentes conversacionales desplegados en local con llama.cpp, minimizando la degradación típica de las cuantizaciones Q4.
- Agentes con tool calling de múltiples pasos: la calibración sobre transcripciones agénticas largas hace que el modelo mantenga mejor su distribución de salida en sesiones prolongadas de uso de herramientas, donde las cuantizaciones convencionales suelen degradarse antes.
- Razonamiento en hardware de consumo/servidor intermedio: con 17,55 GB, el modelo completo cabe en una única GPU de gama alta, permitiendo razonamiento local sin depender de APIs externas.
- Servidores de inferencia locales: el comando de ejemplo (`llama-server --n-gpu-layers 99 --ctx-size 32768`) muestra el uso previsto como backend de servidor con contexto amplio para aplicaciones multi-turno.
- Evaluación comparativa de cuantizaciones: al publicarse junto con métricas de KLD por posición y comparaciones con UD-Q4_K_XL, SLQ-EAR98 y UD-Q5_K_S, sirve como referencia para quien investigue métodos de cuantización orientados a chat.
- Despliegue privado de LLM en entornos con restricciones de datos: la licencia Apache 2.0 y la ejecución 100 % local permiten integrarlo en pipelines empresariales donde el texto no puede salir de la infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks downstream (MMLU, HumanEval, GSM8K, etc.) ni para el modelo base ni para esta cuantización en la información disponible. Los propios autores advierten explícitamente que sus métricas de divergencia KL no deben leerse como márgenes de benchmark.

Los únicos datos publicados son de divergencia KL respecto al modelo en precisión completa, medidos sobre tokens generados por el asistente en transcripciones agénticas y de chat:

| Medición | Resultado |
|---|---|
| XQD Q4 (17,55 GB) vs unsloth UD-Q4_K_XL | 27,3 % menos KLD |
| XQD Q4 vs kaitchup SLQ-EAR98 y unsloth UD-Q5_K_S | empate estadístico (con ficheros mayores) |
| XQD Q5 (equiparado en tamaño a SLQ-EAR98) vs SLQ-EAR98 | ~23 % menos KLD |
| Peor 0,5 % de posiciones (donde se concentra el daño) | ~30 % de mejora frente a ambos |
| Texto web (prosa) | SLQ-EAR98 puntúa más alto en EAR@10 |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero pesa 17,55 GB, por lo que se necesita al menos ~18-20 GB de VRAM para descarga completa en GPU (con contexto de 32k, añadir margen para la KV cache; no se publica una cifra exacta). Con descarga parcial de capas (`--n-gpu-layers` inferior a 100) funciona con menos VRAM compensando con CPU/RAM.
- GPU recomendadas: RTX 4090 (24 GB) o RTX 5090 para descarga completa en una sola GPU; en el lado profesional, A100 40 GB o H100. No disponible una recomendación oficial.
- Consumer GPUs: sí cabe completa en una RTX 4090 de 24 GB (17,55 GB de pesos dejan ~6 GB para KV cache y buffers, suficiente para contextos moderados). No cabe en GPUs de 16 GB sin offload a CPU.
- Opciones de despliegue: llama.cpp (método documentado en la model card, requiere una build reciente con soporte de Qwen3.8). Al ser GGUF estándar, debería funcionar también con Ollama, LM Studio y otros runtimes compatibles con GGUF, aunque no se menciona explícitamente. vLLM y TGI no son compatibles con GGUF.
- Latencia y throughput: no disponibles. El bloque MTP conservado puede mejorar la velocidad de decodificación en runtimes que lo aprovechen.

## Comparativa con modelos similares

Comparativa entre cuantizaciones Q4/Q5 del mismo modelo base publicadas por otros autores, según los datos de la model card:

| Cuantizacion | Autor | Tamaño | KLD relativo (texto agéntico) |
|---|---|---|---|
| XQD Q4 | axolotl-ai-co | 17,55 GB | referencia (mejor) |
| UD-Q4_K_XL | unsloth | no disponible | +27,3 % KLD respecto a XQD Q4 |
| SLQ-EAR98 | kaitchup | no disponible | empate estadístico con XQD Q4; mejor en prosa web |
| UD-Q5_K_S | unsloth | no disponible | empate estadístico con XQD Q4 |

Comparativa con otros modelos base de tamaño similar: no disponible (no se han proporcionado datos de modelos alternativos de ~27B).

## Limitaciones y advertencias

- Texto exclusivamente: el fichero no incluye tensores de visión ni proyector multimodal; no sirve para tareas multimodales aunque el modelo base las tuviera.
- Optimización sesgada a chat/agéntico: los autores no ajustan para prosa web ni texto tipo preentrenamiento; en ese tipo de texto, otras cuantizaciones (por ejemplo, SLQ-EAR98) puntúan mejor según sus propias métricas.
- Métricas no validadas downstream: los autores reconocen que no han demostrado que la menor divergencia KL se traduzca en mejores resultados en benchmarks; los márgenes de KLD no deben interpretarse como márgenes de calidad en tareas.
- Riesgo de alucinación: inherente al modelo base; la cuantización añade una pequeña degradación adicional respecto a la precisión completa que no está caracterizada en benchmarks downstream.
- Sesgos: los del modelo base Qwen3.8-27B; no disponible información específica.
- Idiomas: no disponibles en la información proporcionada.
- Compatibilidad: requiere una build reciente de llama.cpp con soporte de Qwen3.8; versiones antiguas no cargarán el fichero.
- Licencia: Apache 2.0, sin restricciones de uso comercial relevantes; heredada del modelo base Qwen3.8-27B.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/axolotl-ai-co/Qwen3.8-27B-Q4-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Artículo con el método y las mediciones: https://axolotlai.substack.com/p/old-ideas-standard-formats-better
