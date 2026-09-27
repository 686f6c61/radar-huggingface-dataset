# minte1431/MiniCPM5-2B-heretic-abliterated-GGUF

## Resumen

MiniCPM5-2B-heretic-abliterated-GGUF es una redistribución en formato GGUF del modelo openbmb/MiniCPM5-2B, un transformer denso de aproximadamente 2.500 millones de parámetros desarrollado por OpenBMB como segundo miembro de la serie MiniCPM5 (tras MiniCPM5-1B). El repositorio, publicado por el usuario minte1431, aplica una ablación direccional del reflejo de rechazo (abliteration) mediante la herramienta Heretic v1.4.0, siguiendo la metodología mostrada en insraq/MiniCPM5-2B-heretic-abliterated, y empaqueta el resultado en seis cuantizaciones GGUF para inferencia local con llama.cpp, Ollama, LM Studio y Jan.

El modelo base está diseñado para despliegue en dispositivo (on-device), asistentes locales, agentes de código, flujos de tool-use y razonamiento con recursos limitados, y se distribuye bajo licencia Apache 2.0. Los pesos originales están en safetensors; este repositorio solo contiene las versiones cuantizadas de 3 a 8 bits, con tamaños que van de 1,29 GB (Q3_K_M) a 2,68 GB (Q8_0).

Su relevancia actual reside en dos factores: por un lado, ofrece un modelo de 2B con huella de memoria muy reducida, apto para hardware de gama baja; por otro, la abliteración reduce la tasa de rechazo de 99/100 a 5/100 manteniendo una divergencia KL de 0,0391 respecto a los pesos originales, lo que lo convierte en una pieza útil para investigación en seguridad, red-teaming y generación de datos sin filtros, así como para desarrolladores que necesitan un asistente local sin capas de rechazo. No se han publicado en la información disponible datos de benchmarks estándar (MMLU, HumanEval, GSM8K) para esta conversión.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (serie MiniCPM5, según OpenBMB) |
| Parámetros totales | 2.516.756.480 (~2,5 B), dato de safetensors del modelo base |
| Parámetros activos | No aplica: modelo denso, no es MoE |
| Longitud de contexto | 128.000 tokens según LLM Explorer; no confirmado en la model card del autor de este repositorio |
| Tipos de cuantización | GGUF: Q3_K_M (1,29 GB), Q4_K_S (1,50 GB), Q4_K_M (1,56 GB), Q5_K_M (1,81 GB), Q6_K (2,07 GB), Q8_0 (2,68 GB) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base se distribuye en safetensors |
| Modelo base | openbmb/MiniCPM5-2B |
| Método de ajuste | Abliteración direccional con Heretic v1.4.0 |
| Plantilla de prompt | ChatML (`<|im_start|>role ... <|im_end|>`) |
| Tamaño del repositorio | 10,9 GB |
| Pipeline | text-generation |
| Fecha de publicación | 2026-09-27 (metadata de HuggingFace) |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer denso de unos 2.500 millones de parámetros, presentado por OpenBMB como el segundo modelo de la serie MiniCPM5 y descrito como SOTA en la clase de 2B para despliegue en dispositivo. La información disponible no detalla el número de capas, la dimensión oculta, el tipo de atención ni la composición del dataset de preentrenamiento; tampoco se documentan las fases de ajuste (SFT, RLHF o DPO) del modelo original. Los únicos datos técnicos publicados en este repositorio se refieren al proceso de abliteración.

La intervención consiste en una ablación direccional aplicada sobre el flujo residual y las proyecciones MLP, con dirección calculada por capa (`direction_index: per layer`). Los pesos de ablación publicados son, entre otros: `attn.o_proj.max_weight` 1,47, `attn.o_proj.max_weight_position` 29,44, `attn.o_proj.min_weight` 1,45, `attn.o_proj.min_weight_distance` 14,36, `mlp.down_proj.max_weight` 0,89, `mlp.down_proj.max_weight_position` 28,68, `mlp.down_proj.min_weight` 0,66 y `mlp.down_proj.min_weight_distance` 20,31. Según el autor, este procedimiento preserva el rendimiento matemático, de código y de razonamiento multi-paso del modelo base, extremo que no se respalda con evaluaciones estándar en la información disponible.

## Capacidades

- Generación de texto conversacional con plantilla ChatML y soporte multi-turno.
- Razonamiento y matemáticas: el autor afirma que la ablación preserva el rendimiento en razonamiento multi-paso, aunque no se aportan métricas de validación.
- Generación de código: el modelo base está orientado a agentes de código y entornos de desarrollo locales.
- Tool calling / function calling: el modelo base se describe como pensado para flujos de tool-use; el repositorio no incluye ejemplos ni verificación específica de esta capacidad tras la abliteración.
- Contexto largo: LLM Explorer reporta 128.000 tokens de ventana para el modelo base, si bien este dato no aparece confirmado en la model card de este repositorio.
- Multilingüismo limitado a inglés y chino; no se declara soporte de castellano ni de otras lenguas.
- Ausencia de rechazo: tasa de rechazo de 5/100 frente a 99/100 del modelo base, según la tabla de métricas del autor.
- Sin capacidades multimodales: no se declara visión, audio ni entrada de imágenes.

## Casos de uso

- Asistente local sin conexión: el modelo puede ejecutarse íntegramente en un portátil o mini-PC con las cuantizaciones Q3_K_M o Q4_K_M (1,29-1,56 GB), gestionando conversaciones multi-turno en inglés o chino sin enviar datos a servicios externos.
- Red-teaming y evaluación de seguridad: al presentar una tasa de rechazo de 5/100, resulta útil como modelo atacante o como generador de prompts adversarios al auditar las defensas de otros sistemas, siempre dentro de un marco autorizado.
- Generación de datos sintéticos en dominios con contenido sensible: para construir datasets de entrenamiento o de clasificación en áreas donde un modelo alineado se negaría a responder (por ejemplo, descripción de técnicas de explotación en un entorno de laboratorio cerrado).
- Investigación en interpretabilidad y alineación: con una divergencia KL de 0,0391 respecto a los pesos originales, permite comparar activaciones y representaciones internas entre un modelo con rechazo y su versión ablacionada, aislando las direcciones responsables del comportamiento de negativa.
- Autocompletado y asistencia de código en el IDE: integrado vía llama.cpp u Ollama, puede servir como motor de sugerencias para proyectos en inglés, con la ventaja de ocupar menos de 2 GB de VRAM.
- Clasificación y extracción de información por lotes: su tamaño reducido permite procesar grandes volúmenes de texto en CPU o en una única GPU consumer, con coste por token mínimo.
- Chat multilingüe inglés-chino: atención al cliente o traducción interna en entornos donde solo se requieren esos dos idiomas.
- Prototipado de agentes con tool calling: dado que el modelo base está orientado a flujos de tool-use, puede emplearse como eslabón barato en pipelines de agentes, reservando modelos mayores para las decisiones críticas.

## Benchmarks y rendimiento

La información disponible solo incluye las métricas del proceso de abliteración, no evaluaciones estándar de capacidad.

| Métrica | Modelo abliterado | Base original (openbmb/MiniCPM5-2B) |
|---|---|---|
| Tasa de rechazo | 5 / 100 | 99 / 100 |
| Divergencia KL | 0,0391 | 0,0000 (referencia) |

No se han publicado resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la información disponible para esta conversión GGUF ni para el modelo ablacionado del que deriva.

## Requisitos de hardware

- VRAM de pesos (estimación a partir del tamaño de fichero, sin contar el KV cache): Q3_K_M ~1,3 GB; Q4_K_S ~1,5 GB; Q4_K_M ~1,6 GB; Q5_K_M ~1,8 GB; Q6_K ~2,1 GB; Q8_0 ~2,7 GB.
- VRAM total en inferencia: añadir el KV cache, que crece de forma lineal con la longitud de contexto; a ventanas muy largas (del orden de 128.000 tokens) el KV cache puede superar el tamaño de los pesos. No se publican cifras concretas de consumo por configuración.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM es suficiente para las cuantizaciones Q3 a Q6 con contextos moderados; una RTX 3060, RTX 4060, RTX 4090 o Apple Silicon con memoria unificada cubren el caso de uso sin dificultad. En centros de datos, A100 o H100 estarían sobredimensionadas salvo para servir muchas réplicas concurrentes.
- Ejecución en CPU: las cuantizaciones Q3_K_M y Q4_K_M permiten inferencia en CPU con 4-8 GB de RAM, lo que habilita el despliegue en Raspberry Pi y nodos de cómputo reducido.
- Opciones de despliegue: llama.cpp (`llama-cli`, `llama-server`), Ollama, LM Studio, Jan y cualquier ejecutor compatible con GGUF. El autor recomienda `-ngl 99` para descargar todas las capas en GPU, `-c 4096`, `--temp 0.8`, `--top-p 0.95` y `--repeat-penalty 1.15` en el ejemplo de arranque.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Abliterado | Licencia | Notas |
|---|---|---|---|---|---|---|
| minte1431/MiniCPM5-2B-heretic-abliterated-GGUF | ~2,5 B | 128K (según LLM Explorer, no confirmado) | GGUF Q3-Q8 | Sí (5/100 rechazos, KL 0,0391) | Apache 2.0 | Objeto de esta ficha; sin descargas ni likes registrados |
| openbmb/MiniCPM5-2B | ~2,5 B | No disponible en la información recogida | Safetensors | No | Apache 2.0 | Modelo base; tasa de rechazo 99/100 según el autor de la conversión |
| insraq/MiniCPM5-2B-heretic-abliterated | ~2,5 B | No disponible | Safetensors | Sí | Apache 2.0 (heredada) | Origen de la metodología aplicada aquí |
| Dingdust/MiniCPM5-2B-heretic | ~2,5 B | No disponible (etiquetado como long-context) | Safetensors | Sí | Apache 2.0 | Etiquetado con tool-calling, heretic, decensored; entrenado con 8 datasets |
| Abiray/MiniCPM5-2B-heretic-abliterated-GGUF | ~2,5 B | No disponible | GGUF | Sí | Apache 2.0 (heredada) | Conversión GGUF alternativa del mismo linaje |
| openbmb/MiniCPM5-1B | ~1 B | No disponible | No disponible | No | Apache 2.0 | Primer modelo de la serie, anterior y de menor tamaño |

No se dispone de datos de benchmarks comparativos entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La abliteración elimina deliberadamente el comportamiento de rechazo: el modelo puede generar contenido dañino, ilegal o inseguro sin advertencia previa. No debe desplegarse en aplicaciones orientadas al público sin capas de moderación externas.
- Riesgo elevado de alucinación: se trata de un modelo de 2,5 B de parámetros, con conocimiento factual limitado y sin datos de evaluación que cuantifiquen su fiabilidad.
- Idiomas: solo se declaran inglés y chino. El rendimiento en castellano no está documentado y previsiblemente será pobre.
- Contexto: la cifra de 128.000 tokens procede de un directorio de terceros (LLM Explorer) y no está confirmada por el autor del repositorio; en la práctica, la calidad de atención decae en cuantizaciones bajas (Q3, Q4) con contextos extensos.
- Licencia: Apache 2.0 permite uso comercial y modificación, pero el autor no ofrece garantías y la responsabilidad sobre el contenido generado recae en el desplegador. La abliteración no está cubierta explícitamente por la licencia del modelo base más allá de lo que permite Apache 2.0.
- Trazabilidad limitada: el repositorio no documenta el dataset de abliteración, no incluye evaluaciones estándar y registra 0 descargas y 0 likes, por lo que no ha sido validado por la comunidad.
- Deriva de representación: aunque la divergencia KL de 0,0391 es baja, no es nula; puede haber degradación en tareas cercanas a los límites del comportamiento ablacionado que las métricas publicadas no capturan.
- Formato GGUF: no admite ajuste fino directo; para entrenamiento posterior habría que volver a los pesos en safetensors.
- Sin capacidades multimodales ni de audio; no apto para tareas de visión o reconocimiento de voz.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/minte1431/MiniCPM5-2B-heretic-abliterated-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Modelo de referencia de la metodología: https://huggingface.co/insraq/MiniCPM5-2B-heretic-abliterated
- Variante relacionada de Dingdust: https://huggingface.co/Dingdust/MiniCPM5-2B-heretic
- Conversión GGUF alternativa de Abiray: https://huggingface.co/Abiray/MiniCPM5-2B-heretic-abliterated-GGUF
- Repositorio de OpenBMB MiniCPM: https://github.com/OpenBMB/MiniCPM
- llama.cpp: https://github.com/ggerganov/llama.cpp
- Ficha en LLM Explorer: https://llm-explorer.com/model/Dingdust%2FMiniCPM5-2B-heretic,6OOtU6g7SRLqzNiip34qEb
- Endpoint de inferencia en FriendliAI: https://friendli.ai/models/Dingdust/MiniCPM5-2B-heretic
- Paper referenciado en la model card de Dingdust: https://arxiv.org/abs/2506.07900
- Paper referenciado en la model card de Dingdust: https://arxiv.org/abs/2602.09003
