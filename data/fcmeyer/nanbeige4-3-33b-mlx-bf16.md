# fcmeyer/Nanbeige4.3-33B-MLX-bf16

## Resumen

Nanbeige4.3-33B-MLX-bf16 es una conversión a MLX en BF16 sin cuantizar del modelo Nanbeige4.3-33B, publicado por el equipo Nanbeige (laboratorio chino respaldado por la plataforma de reclutamiento BOSS Zhipin) el 24 de octubre de 2026 bajo licencia Apache-2.0. La conversión, obra del usuario fcmeyer, permite ejecutar el modelo en Apple Silicon mediante la librería MLX, conservando la plantilla de chat original y la ventana de contexto de 524.288 tokens del modelo fuente.

El modelo original es un transformer denso de 33.100 millones de parámetros orientado a agentes de código y tareas tipo oficina, y según la model card original lidera a tres modelos comparables de clase 30B en la mayoría de benchmarks agénticos, con una puntuación destacada de 80,9 en Terminal-Bench 2.1. Incorpora modo de razonamiento (thinking) y soporte de tool calling en formato XML o JSON.

Esta conversión es relevante porque ofrece una de las pocas opciones open source de 33B con contexto de 512K y licencia Apache-2.0 ejecutables localmente en Mac, aunque con requisitos de memoria exigentes: unos 66,3 GB solo de pesos, lo que en la práctica reserva el modelo para equipos con 128 GB de memoria unificada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (estilo Llama, según etiquetas del repositorio) |
| Parámetros totales | 33.118.977.024 (~33,1 B) |
| Parámetros activos | No aplicable (modelo denso, no MoE) |
| Longitud de contexto | 524.288 tokens (512K), heredada del modelo original; sin validar en su totalidad en esta conversión |
| Tipos de cuantización | BF16 sin cuantizar (este repositorio); existen variantes MLX cuantizadas del mismo autor (6 bits, 26,9 GB) y se citan versiones de 4 bits de ~20 GB |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors en formato MLX (BF16), 471 tensores, 66,3 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 33,1 B parámetros (las etiquetas del repositorio indican arquitectura tipo Llama), sin mezcla de expertos. Destaca por su ventana de contexto de 524.288 tokens y por estar orientado a flujos agénticos: incorpora modo de razonamiento controlable mediante `enable_thinking` en la plantilla de chat (activado por defecto según la prensa especializada) y un parámetro `preserve_thinking=True` que retiene el razonamiento de turnos anteriores para workflows de agentes multi-paso. El formato de tool calling recomendado por el equipo upstream es XML, aunque también se admite JSON.

Sobre los datos de entrenamiento del modelo original (número de tokens, composición del corpus, uso de RLHF/DPO) no hay información disponible en los materiales consultados. En cuanto a la conversión, el autor documenta un proceso reproducible con scripts incluidos (`scripts/release.py`, `requirements.lock.txt`, `conversion.json`) y una validación de regresión: equivalencia de tokenizador, logits finitos, ocho casos de plantillas thinking/tool y una fidelidad teacher-forced frente al BF16 original de KL media 0,000000 nats/token y acuerdo top-1 del 100 % sobre 563 tokens sintéticos.

## Capacidades

- Generación de texto conversacional bilingüe (inglés y chino) mediante plantilla de chat preservada del modelo original.
- Razonamiento con modo thinking conmutable (`enable_thinking`), que genera cadenas de razonamiento antes de la respuesta final.
- Tool calling / function calling en formato XML (recomendado upstream) o JSON, con la advertencia del autor de que el soporte de plantilla no certifica el tool parser de ningún servidor concreto.
- Flujos de agentes multi-paso gracias a `preserve_thinking=True`, que mantiene el razonamiento previo entre turnos.
- Tareas agénticas de terminal y de oficina: el modelo original alcanza 80,9 en Terminal-Bench 2.1 y se posiciona como modelo para agentes de código y productividad.
- Contexto ultra-largo de 512K tokens, adecuado para procesar documentos extensos o repositorios completos.
- Ejecución local y privada en Apple Silicon mediante MLX.

## Casos de uso

- Agentes de terminal y automatización DevOps: con 80,9 en Terminal-Bench 2.1, el modelo está diseñado para ejecutar tareas multi-paso en shell (diagnóstico de sistemas, gestión de dependencias, reparación de builds), usando tool calling XML para invocar comandos de forma estructurada.
- Agentes de oficina y productividad: procesamiento de documentos, redacción de correos y flujos de trabajo tipo asistente, donde el modo thinking activado por defecto mejora la calidad en tareas de planificación y el parámetro `preserve_thinking` mantiene coherencia en conversaciones largas de agente.
- Análisis de bases de código completas: la ventana de 524.288 tokens permite cargar repositorios medianos sin fragmentación agresiva, útil para revisiones de código, refactorizaciones guiadas y generación de documentación arquitectónica. A título de referencia, la caché KV cuesta unos 208 KB por token.
- Asistente bilingüe chino-inglés: los dos idiomas declarados son inglés y chino, lo que lo hace adecuado para equipos que trabajen con documentación y comunicación en ambas lenguas, incluida la generación de contenido localizado.
- Inferencia local con requisitos de privacidad: al ejecutarse íntegramente en Apple Silicon vía MLX, permite procesar datos sensibles (contratos, historiales, código propietario) sin enviarlos a APIs externas, requisito habitual en sectores regulados.
- RAG sobre corpus extensos: el contexto de 512K reduce la necesidad de chunking fino y permite insertar documentos completos como contexto, minimizando errores de recuperación en preguntas que requieren visión global del documento.
- Prototipado de frameworks de agentes: el soporte de plantillas thinking/tool y los scripts de validación incluidos facilitan integrarlo como modelo de prueba en orquestadores propios (LangGraph, frameworks de multi-agente) antes de escalar a despliegues en GPU.

## Benchmarks y rendimiento

Del modelo original Nanbeige4.3-33B se ha publicado el siguiente resultado agéntico. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandarizados.

| Benchmark | Resultado | Modelo evaluado |
|---|---:|---|
| Terminal-Bench 2.1 | 80,9 | Nanbeige4.3-33B (original) |

Según la model card original, el modelo supera a tres modelos comparables de clase 30B en la mayoría de benchmarks agénticos, aunque no se detallan las puntuaciones en la información proporcionada.

Rendimiento medido de esta conversión MLX en Apple M5 Max con 128 GB de memoria unificada, caché KV sin cuantizar, prefill en pasos de 512 tokens y 256 tokens de salida (medianas de tres pruebas):

| Tokens de entrada | Prefill (tok/s) | Decode (tok/s) | Pico de memoria (GB) |
|---:|---:|---:|---:|
| 512 | 553,88 | 7,92 | 66,88 |
| 4.096 | 664,59 | 7,98 | 67,68 |
| 16.384 | 497,04 | 7,55 | 70,28 |

Nota: la perplejidad diagnóstica de 7,95 (NLL medio 2,0737) incluida en el repositorio corresponde a un corpus sintético fijo de 563 tokens y sirve únicamente como verificación de regresión de la conversión, no como benchmark de capacidad.

## Requisitos de hardware

- Pesos BF16: 66,3 GB. Pico de memoria medido de 66,88–70,28 GB con contextos de 512 a 16.384 tokens en un M5 Max con 128 GB de memoria unificada.
- Caché KV: aproximadamente 208 KB por token. A 32K tokens supone unos 6,5 GB adicionales; a contexto completo de 512K rondaría los 104 GB, impracticable en la mayoría de equipos. El propio autor advierte que el contexto completo de 512K no ha sido validado.
- Apple Silicon con MLX es el único camino para este repositorio: no es compatible con CUDA. Para GPU NVIDIA (A100, H100, RTX 4090) hay que usar el modelo original Nanbeige/Nanbeige4.3-33B en safetensors estándar.
- En Mac, se requiere en la práctica un equipo con 128 GB de memoria unificada (M3 Max, M4 Max, M5 Max o superiores). No cabe en GPUs de consumo convencionales en BF16.
- Alternativas con menos memoria: la variante MLX de 6 bits ocupa 26,9 GB (viable en Macs de 32–64 GB) y se citan versiones de 4 bits de unos 20 GB, que podrían caber en una RTX 4090 de 24 GB si se dispone del modelo en formato adecuado.
- Despliegue: mlx-lm (ejemplo de uso incluido en el README con `load` y `generate`), compatible con el ecosistema de apps MLX como LM Studio. Para servir con vLLM, TGI o SGLang hay que recurrir al repositorio original; no hay GGUF publicado para llama.cpp u Ollama en la información disponible.
- Velocidad: decode de 7,5–8,0 tok/s y prefill de 497–665 tok/s en M5 Max, medido con prompts sintéticos; suficiente para uso no interactivo o agentico por lotes, lento para chat interactivo en BF16.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Tamaño pesos | Licencia | Datos destacados |
|---|---|---|---|---|---|---|
| fcmeyer/Nanbeige4.3-33B-MLX-bf16 (esta ficha) | 33,1 B | 524.288 tokens | MLX BF16 | 66,3 GB | Apache-2.0 | Terminal-Bench 2.1: 80,9 (modelo base) |
| Nanbeige/Nanbeige4.3-33B (original) | 33,1 B | 524.288 tokens | Safetensors BF16 | ~66 GB | Apache-2.0 | Mismo modelo; apto para CUDA/vLLM/TGI |
| fcmeyer/Nanbeige4.3-33B-MLX-6bit | 33,1 B | 524.288 tokens | MLX 6 bits | 26,9 GB | Apache-2.0 | Misma conversión cuantizada, menor huella de memoria |
| Qwen3.8-27B | 27 B (según denominación) | no disponible | no disponible | no disponible | no disponible | Citado en prensa como competidor directo en tareas de código; sin datos comparativos publicados en la información disponible |

## Limitaciones y advertencias

- Compatibilidad restringida a Apple Silicon: este repositorio solo funciona con MLX; no es utilizable en servidores CUDA ni con vLLM/TGI sin recurrir al modelo original.
- Contexto de 512K heredado pero no validado: el autor indica explícitamente que no se ha verificado el funcionamiento a contexto completo, y la caché KV (~208 KB/token) lo hace inviable en la mayoría de hardware.
- Velocidad de decode contenida (7,5–8 tok/s en BF16 incluso en un M5 Max de gama alta), lo que limita su uso interactivo en esta variante sin cuantizar.
- Idiomas declarados limitados a inglés y chino; el rendimiento en español u otras lenguas no está documentado.
- Conversión de terceros sin respaldo oficial: el autor es fcmeyer, no el equipo Nanbeige; el repositorio tiene 0 descargas y 0 likes registrados, sin validación comunitaria.
- La validación de fidelidad (KL 0,000000, acuerdo top-1 del 100 %) se realizó sobre 563 tokens sintéticos y, según el propio autor, no establece equivalencia de capacidades downstream.
- El modo thinking viene activado por defecto en el modelo original, lo que añade tokens de razonamiento (y por tanto latencia y coste) a cada respuesta; puede desactivarse con `enable_thinking=False`.
- El autor advierte que el soporte de la plantilla de chat no certifica el tool parser de ningún servidor concreto: hay que validar el parseo de tool calls en el stack de despliegue elegido.
- Riesgo de alucinación: inherente a cualquier LLM; no hay datos específicos de alucinación publicados para este modelo.
- Licencia Apache-2.0 sin restricciones comerciales relevantes, aunque sin garantías; los benchmarks agénticos publicados provienen de la model card del propio equipo Nanbeige, sin verificación independiente en la información disponible.

## Enlaces

- Repositorio del modelo (esta conversión): https://huggingface.co/fcmeyer/Nanbeige4.3-33B-MLX-bf16
- Modelo original del equipo Nanbeige: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Variante cuantizada MLX 6 bits del mismo autor: https://huggingface.co/fcmeyer/Nanbeige4.3-33B-MLX-6bit
- Guía del modelo en explainx.ai: https://explainx.ai/blog/nanbeige-4-3-33b-open-agentic-model-guide-2026
- Noticia en AI Weekly sobre el lanzamiento: https://aiweekly.co/alerts/nanbeige-opens-33b-model-with-apache-20-and-512k-context-claims-wins-over
- Cobertura en pasqualepillitteri.it (requisitos de memoria y comparativa con Qwen): https://pasqualepillitteri.it/en/news/27138/nanbeige-4-3-33b-open-source-en
