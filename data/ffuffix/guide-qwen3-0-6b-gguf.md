# ffuffix/guide-qwen3-0.6b-GGUF

## Resumen

`ffuffix/guide-qwen3-0.6b-GGUF` es un ajuste fino mediante LoRA del modelo Qwen3-0.6B de Alibaba Cloud, publicado por el desarrollador independiente ffuffix. No es un asistente general: es el modelo que alimenta la guía conversacional opcional del sitio web personal ffuffix.com, y está entrenado específicamente para responder en una o dos frases breves y cálidas sobre el autor y el contenido de su web, a partir de un briefing fijo y de los resultados de búsqueda que la propia página inyecta en el prompt.

La relevancia del modelo es fundamentalmente arquitectónica y de despliegue: demuestra un patrón de inferencia 100 % en el navegador del visitante mediante wllama (llama.cpp compilado a WebAssembly), de modo que ninguna consulta sale del dispositivo. Con 596 millones de parámetros y un único fichero GGUF cuantizado a Q4_K_M de 396 MB, el modelo cabe en cualquier equipo y se sirve sin backend.

Técnicamente es un transformer denso de la familia Qwen3, ajustado con LoRA de rango 16 sobre todas las capas lineales con 655 ejemplos escritos a mano, y fusionado posteriormente en los pesos base. Su utilidad fuera de ese sitio concreto es limitada, pero sirve como referencia reproducible de fine-tuning pequeño orientado a un dominio cerrado y de despliegue on-device.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), ajuste fino con LoRA fusionado |
| Parametros totales | 596.049.920 (~0,6 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-0.6B) |
| Tipos de cuantizacion | Q4_K_M (unico fichero publicado) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero `guide-qwen3-0.6b-Q4_K_M.gguf`, 396.704.512 bytes) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-0.6B (commit `c1899de289a04d12100db370d81485cdf75e47ca`) y se ajusta con LoRA de rango 16, alpha 32 y dropout 0,05 aplicado a todas las capas lineales, con tasa de aprendizaje 2e-4 en un schedule coseno, 3 épocas y cálculo de pérdida únicamente sobre las respuestas. El adaptador se fusiona en el modelo base, por lo que el resultado es un modelo denso estándar sin adaptadores separados. La conversión se realizó con el convertidor de llama.cpp en la release b11364 (la que embebe wllama 3.8.1) y la cuantización con `llama-quantize` a Q4_K_M.

El dataset de entrenamiento son 655 ejemplos escritos a mano que cubren hechos del briefing, preguntas sobre el sitio respondidas a partir de sus resultados de búsqueda, cuestiones que el sitio no trata, peticiones fuera de tema, small talk y conversaciones de dos turnos; aproximadamente un tercio son rechazos o redirecciones. Cada prompt se renderiza exactamente como lo construye el sitio, con la plantilla de chat de Qwen3 y el modo de razonamiento desactivado (`enable_thinking: false`). No se documenta entrenamiento con RLHF ni DPO.

## Capacidades

- Generación de texto conversacional breve: respuestas de una o dos frases, con tono cálido, sobre ffuffix y su sitio web.
- Respuesta fundamentada en contexto inyectado: usa el briefing del sistema y los resultados de búsqueda que la página incluye en cada mensaje de usuario.
- Abstención controlada: indica amablemente cuándo el briefing y los resultados de búsqueda no cubren una pregunta.
- Redirección de peticiones fuera de tema hacia el contenido del sitio.
- Conversaciones de dos turnos (el entrenamiento incluye ejemplos multi-turno de esta profundidad).
- Sin tool calling, sin function calling y sin capacidades de agente documentadas.
- Sin capacidades multimodales (ni visión ni audio).
- Sin modo de razonamiento activado: el thinking de Qwen3 se desactiva explícitamente.
- Multilingüe: no disponible; la model card declara únicamente inglés.

## Casos de uso

- Guía conversacional embebida en un sitio web: es su caso de uso original; el modelo se ejecuta en el navegador vía wllama y responde sobre el contenido del sitio sin que las consultas del visitante abandonen su dispositivo.
- Asistente de FAQ de dominio cerrado: sirve como plantilla para construir asistentes que responden exclusivamente a partir de un briefing y de resultados de búsqueda inyectados, con abstención explícita cuando la información no cubre la pregunta.
- Demostración de inferencia on-device: con 396 MB en Q4_K_M, es un ejemplo reproducible de despliegue LLM sin backend para prototipos, workshops o pruebas de concepto de privacidad por diseño.
- Base para fine-tuning de dominio muy pequeño: el proceso documentado (655 ejemplos, LoRA r16, 3 épocas, fusión del adaptador, conversión a GGUF) es replicable para otros dominios acotados con presupuesto de datos y cómputo mínimo.
- Filtro de redirección en interfaces de chat: aprovecha su entrenamiento en rechazos (un tercio del dataset) para devolver peticiones fuera de alcance hacia el contenido permitido.
- Evaluación de pipelines llama.cpp/wllama: útil para validar plantillas de chat Jinja, caché del system prompt y cuantización Q4_K_M en entornos WASM antes de escalar a modelos mayores.

## Benchmarks y rendimiento

El autor publica una evaluación propia sobre 23 preguntas retenidas, no presentes en el entrenamiento, con tres intentos por pregunta y los ajustes del sitio (69 respuestas en total):

| Modelo | Respuestas correctas |
|---|---|
| Qwen3-0.6B sin modificar | 41/69 |
| Este modelo (guide-qwen3-0.6b) | 64/69 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB con Q4_K_M (fichero de 396 MB más overhead de contexto y KV cache).
- Cabe en cualquier GPU consumer, incluida una GTX 1050 Ti o una iGPU moderna; también en CPU y en el navegador vía WebAssembly.
- GPU recomendadas: no aplica; el modelo está pensado para ejecución en cliente (CPU/WASM). Cualquier GPU con más de 1 GB de VRAM es suficiente.
- Opciones de despliegue: llama.cpp (`llama-server -m guide-qwen3-0.6b-Q4_K_M.gguf --jinja`), wllama (llama.cpp en WebAssembly) y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. Los ajustes de muestreo del sitio son temperatura 0,6, top-p 0,9, repeat penalty 1,1 y un máximo de 80 tokens generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| ffuffix/guide-qwen3-0.6b-GGUF | ~0,6 B | no disponible | Apache 2.0 | GGUF Q4_K_M | Ajuste fino de dominio cerrado, solo inglés, orientado a navegador |
| Qwen/Qwen3-0.6B (base) | ~0,6 B | no disponible | Apache 2.0 | safetensors, GGUF | Modelo general; en la evaluación del autor acierta 41/69 frente a 64/69 del ajustado |
| Modelos de ~0,5 B de otras familias | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparativos en la información proporcionada |

La comparación relevante es contra su propio modelo base: el ajuste mejora la sujeción al prompt y reduce invenciones sobre el autor y las respuestas fuera de tema, a costa de perder utilidad como asistente general.

## Limitaciones y advertencias

- No es un asistente general: solo conoce lo que su prompt (briefing y resultados de búsqueda) le indica; fuera de ese contexto su utilidad es marginal.
- Modelo muy pequeño (0,6 B): el propio autor advierte que, pese a ceñirse mayoritariamente al prompt, todavía puede equivocarse.
- Riesgo de alucinación sobre hechos de ffuffix no presentes en el briefing o en los resultados de búsqueda.
- Idiomas: solo inglés declarado; el rendimiento en castellano no está evaluado ni garantizado.
- Longitud de contexto: no documentada en la ficha; las respuestas están limitadas a 80 tokens y a un formato de una o dos frases.
- Sesgos: no documentados; al derivar de Qwen3-0.6B hereda los sesgos del modelo base, no evaluados por el autor.
- Licencia Apache 2.0, igual que el modelo base, permite uso comercial; el fichero `LICENSE` incluido es el del modelo base con su aviso de copyright. Cualquier uso comercial debe conservar dichos avisos.
- Dependencia de la plantilla de chat de Qwen3 con thinking desactivado; usar otra plantilla o activar el razonamiento puede degradar el comportamiento esperado.
- Solo se publica una cuantización (Q4_K_M); no hay variantes Q5, Q8 ni pesos sin cuantizar en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ffuffix/guide-qwen3-0.6b-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3-0.6B
- Sitio del autor: https://ffuffix.com
- wllama (llama.cpp en WebAssembly): https://github.com/ngxson/wllama
- llama.cpp: https://github.com/ggml-org/llama.cpp
