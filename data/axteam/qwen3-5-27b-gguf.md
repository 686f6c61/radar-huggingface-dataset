# axteam/Qwen3.5-27B-GGUF

## Resumen

Qwen3.5-27B-GGUF es una cuantización en formato GGUF del modelo base Qwen3.5-27B, desarrollada por el usuario axteam y publicada en HuggingFace. El modelo original, Qwen/Qwen3.5-27B, es un modelo de lenguaje de la familia Qwen (equipo Qwen de Alibaba) con aproximadamente 27.320.697.856 parámetros, y esta versión cuantizada está pensada para ejecutarse de forma local mediante llama.cpp, Ollama o LM Studio. El problema que resuelve es claro: reducir la huella de memoria del modelo original en BF16 (alrededor de 54 GB) hasta 16,8 GB en Q4_K_M o 29 GB en Q8_0, haciéndolo accesible a hardware de consumo y a estaciones de trabajo sin GPU de datacenter.

La relevancia de esta ficha radica en la combinación de un tamaño intermedio (27B) con licencia Apache-2.0 y cuantizaciones k-quant de llama.cpp, un punto dulce para despliegues locales que necesitan calidad cercana a modelos grandes sin los costes de un 70B+. El repositorio incluye la plantilla de chat original embebida y es compatible con endpoints tipo OpenAI a través de `llama-server`. Cabe destacar que los archivos GGUF no incluyen el codificador de visión del modelo original, por lo que la versión cuantizada es solo texto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (transformer de la familia Qwen3.5; MoE no confirmado) |
| Parametros totales | 27.320.697.856 (27,32B) |
| Parametros activos | no aplica (no confirmado como MoE) |
| Longitud de contexto | no disponible en la ficha; los ejemplos usan 8192 tokens en llama.cpp |
| Tipos de cuantizacion | Q4_K_M (16,8 GB), Q8_0 (29,0 GB); original en BF16 |
| Idiomas soportados | no disponible (el modelo base es de la familia Qwen, con soporte multilingue habitual; los ejemplos de la ficha incluyen coreano) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (derivado de safetensors BF16 del modelo base) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-27B, modelo base de la familia Qwen3.5. La ficha del repositorio no detalla la arquitectura exacta (si es transformer denso o MoE, ni el número de capas o cabezas de atención), por lo que estos datos no están disponibles. Lo que sí está documentado es el proceso de cuantización: se trata de una cuantización post-entrenamiento (PTQ) realizada con las herramientas de llama.cpp (`convert_hf_to_gguf.py` seguido de `llama-quantize`). Los pesos BF16 originales se cuantizan por bloques mediante k-quants, que asignan escalas por bloque con una mezcla de bits, sin ningún reentrenamiento ni ajuste fino posterior.

Sobre el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF o DPO), la información proporcionada no incluye detalles. Cada archivo GGUF incorpora la plantilla de chat original del modelo, lo que garantiza compatibilidad con el formato de conversación previsto por los autores de Qwen. Un detalle técnico relevante: el codificador de visión del modelo original no está incluido en estos archivos GGUF, de modo que la inferencia es exclusivamente textual.

## Capacidades

- Generacion de texto conversacional: el repositorio está etiquetado como `conversational` y la plantilla de chat original viene embebida en cada archivo GGUF.
- Razonamiento y resolucion de tareas generales de lenguaje: heredadas del modelo base Qwen3.5-27B (detalles no documentados en esta ficha).
- Soporte multilingue: los ejemplos de la model card incluyen consultas en coreano, lo que sugiere capacidad multilingue del modelo base (lista oficial de idiomas no disponible).
- Compatibilidad con servidores tipo OpenAI: mediante `llama-server` se expone un endpoint `/v1/chat/completions`, integrable en aplicaciones existentes.
- Sin capacidades de vision: el codificador de vision del modelo original no está incluido en los GGUF; el uso es solo texto.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Chatbots locales con privacidad total: al ejecutarse íntegramente en local vía Ollama o LM Studio, es adecuado para asistentes conversacionales donde los datos no pueden salir de la organización (salud, legal, consultoría).
- API de generación de texto autoalojada: `llama-server` expone una API compatible con OpenAI en el puerto 8080, lo que permite sustituir llamadas a APIs comerciales por inferencia local sin cambiar el código cliente.
- Prototipado y evaluación de modelos en estación de trabajo: con la variante Q4_K_M (16,8 GB) cabe en GPUs de consumo con 24 GB de VRAM, ideal para desarrolladores que iteran sobre prompts y pipelines.
- Generación y revisión de código en local: el tamaño de 27B ofrece un equilibrio entre capacidad de razonamiento sobre código y latencia razonable en hardware de consumidor, útil para asistentes de código offline.
- Procesamiento de documentos multilingue: si el modelo base mantiene el soporte multilingue típico de la familia Qwen, puede emplearse en resumen y traducción asistida de textos en varios idiomas.
- Integración en aplicaciones con LangChain, LlamaIndex o similares: al ser compatible con el formato OpenAI, puede usarse como backend LLM en frameworks de orquestación y RAG, con la KV-cache cuantizada (q8_0) para ampliar el contexto útil en memoria limitada.
- Despliegue en servidores con GPU única de gama alta: la variante Q8_0 (29 GB) es adecuada para GPUs con 32-48 GB de VRAM cuando se prioriza fidelidad máxima respecto al modelo original.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos):
  - Q4_K_M: 16,8 GB; con contexto de 8192 tokens y KV-cache en FP16, aproximadamente 18-19 GB totales; con KV-cache q8_0 y attention flash, cercano a 17-18 GB.
  - Q8_0: 29,0 GB; con contexto de 8192 tokens, alrededor de 30-31 GB.
- GPU recomendadas:
  - Q4_K_M: RTX 3090 / RTX 4090 (24 GB) son opciones viables; también GPUs de 32 GB como RTX 5090, A6000 o L40S con margen para contexto ampliado.
  - Q8_0: GPUs con 32 GB o más (RTX 5090, A6000, L40S, A100 40GB) o descarga parcial a CPU/RAM.
- Ejecucion en consumer GPU: sí, la variante Q4_K_M cabe íntegramente en una RTX 3090 o RTX 4090 de 24 GB con contexto moderado. La variante Q8_0 no cabe en GPUs de consumo habituales y requiere 32 GB o descarga parcial.
- Ejecucion en CPU: posible con llama.cpp en equipos con 32 GB de RAM (Q4_K_M), a costa de una latencia notablemente mayor.
- Opciones de despliegue: llama.cpp (`llama-server` con API compatible con OpenAI, `llama-cli` en terminal), Ollama (`ollama run hf.co/axteam/Qwen3.5-27B-GGUF:Q4_K_M`) y LM Studio (búsqueda del repositorio en el navegador de modelos). No se documenta soporte para vLLM o TGI, que requieren formatos safetensors.
- Latencia y throughput: no disponible; al ser un modelo denso de 27B en GPU de consumo, cabe esperar velocidades del orden de decenas de tokens por segundo en RTX 4090 con Q4_K_M (estimación no confirmada por datos publicados).

## Comparativa con modelos similares

| Modelo | Parametros | Formato / cuantizacion | Longitud de contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-27B-GGUF (esta ficha) | 27,32B | GGUF Q4_K_M / Q8_0 | no disponible (8192 en ejemplos) | Apache-2.0 | Solo texto en GGUF; llama.cpp/Ollama/LM Studio |
| Qwen/Qwen3.5-27B (original) | 27,32B | BF16 safetensors | no disponible | Apache-2.0 | Incluye codificador de vision; apto para vLLM/TGI |
| Gemma 3 27B (Google) | 27B | safetensors y GGUF comunitarios | 128K | Gemma license (uso comercial con condiciones) | Multimodal (vision); competencia directa en tamaño |
| Qwen3-32B | 32,5B | safetensors y GGUF comunitarios | 32K (131K con YaRN) | Apache-2.0 | Tamaño y licencia similares; generación anterior |

Nota: los datos de Gemma 3 27B y Qwen3-32B proceden de conocimiento general y no de la informacion proporcionada en esta ficha; verificalos en sus repositorios oficiales antes de tomar decisiones.

## Limitaciones y advertencias

- Sin capacidades de vision en GGUF: el codificador de vision del modelo original no está incluido; si necesitas multimodalidad, usa los pesos originales en safetensors.
- Cuantizacion sin reentrenamiento: al ser PTQ por bloques, Q4_K_M puede degradar ligeramente la calidad respecto al BF16 original, especialmente en tareas de razonamiento fino o matematicas.
- Sesgos conocidos: no disponible en la informacion proporcionada; como derivado de un modelo base de la familia Qwen, hereda los sesgos del modelo original, no documentados aqui.
- Riesgo de alucinacion: no cuantificado en la ficha; aplica la precaucion habitual de cualquier LLM en tareas factuales.
- Longitud de contexto: no documentada para el modelo base; los ejemplos usan 8192 tokens. No asumas ventanas largas sin verificar la ficha de Qwen/Qwen3.5-27B.
- Idiomas: la lista oficial de idiomas soportados no está disponible en la informacion proporcionada.
- Licencia: Apache-2.0, que permite uso comercial, modificación y redistribución con atribución; los pesos y el tokenizador originales pertenecen al equipo Qwen.
- Estado del repositorio: descargas bajas (114) y un solo like en el momento de la ficha; es una conversacion comunitaria sin respaldo oficial del equipo Qwen. Verifica la integridad de los archivos antes de uso en produccion.
- Fecha de creacion del repositorio: octubre de 2026; comprueba que exista una version mas reciente o oficial de las cuantizaciones antes de adoptarla.

## Enlaces

- Repositorio cuantizado: https://huggingface.co/axteam/Qwen3.5-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-27B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-27B/blob/main/LICENSE
- Paper, blog oficial y demo: no disponibles en la informacion proporcionada.
