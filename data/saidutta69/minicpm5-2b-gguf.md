# saidutta69/MiniCPM5-2B-GGUF

## Resumen

MiniCPM5-2B-GGUF es la conversión a formato GGUF del modelo openbmb/MiniCPM5-2B, un transformer denso de 2.516 millones de parámetros (2,5B) desarrollado originalmente por OpenBMB y cuantizado por el usuario saidutta69 con calibración mediante importance matrix (imatrix). El modelo resuelve el problema de ejecutar un LLM con razonamiento explícito, soporte nativo de tool calling y ventana de contexto de 131.000 tokens en hardware de consumo, incluyendo GPUs con menos de 3 GB de VRAM, CPUs y dispositivos Apple Silicon.

La relevancia de esta ficha radica en que el autor publica una escalera completa de cuantizaciones (Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS) con mediciones independientes de velocidad, VRAM y perplejidad sobre una Tesla T4, algo poco habitual en repositorios de cuantización. El modelo base es bilingüe inglés/chino y está entrenado con RL para emitir trazas de razonamiento entre marcadores `[Start thinking]` y `[End thinking]`.

La licencia Apache 2.0 permite uso comercial sin restricciones adicionales, y el tamaño del repositorio (9,5 GB) refleja que contiene toda la escalera de cuantizaciones más el fichero imatrix de calibración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (no MoE) |
| Parametros totales | 2.516.756.480 (2,5B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 131.000 tokens (131k) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS (K-quants e i-quants calibrados con imatrix) |
| Idiomas soportados | ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF; fichero imatrix adicional de 3 MB para calibracion |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 2,5B parámetros. La model card del repositorio de cuantización no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron etapas de RLHF o DPO más allá de la mención a entrenamiento con RL para el modo de razonamiento. Lo que sí se documenta es que el modelo emite trazas de pensamiento delimitadas por `[Start thinking]` y `[End thinking]`, y que dicho razonamiento se produce en chino cuando el prompt está en chino, lo que sugiere un entrenamiento bilingüe alineado por idioma.

La innovación técnica de este repositorio concreto no está en la arquitectura sino en el proceso de cuantización: las cuantizaciones Q5_K_M, Q4_K_M e IQ4_XS se han calibrado con una importance matrix generada a partir de datos de calibración, lo que reduce la pérdida de calidad frente a cuantizaciones no calibradas del mismo tamaño. El autor publica el fichero `.imatrix` (3 MB) de forma separada para permitir reproducir el proceso. La perplejidad de referencia en F16 es 15,16 según la model card, y la escalera de cuantizaciones mantiene incrementos de +0,02 (Q8_0) a +0,72 (IQ4_XS) puntos de perplejidad sobre esa referencia.

## Capacidades

- Generación de texto conversacional multi-turno en inglés y chino.
- Razonamiento explícito con trazas de pensamiento (`[Start thinking]` / `[End thinking]`), entrenado con RL.
- Tool calling nativo: con el parámetro `tools=` el servidor devuelve `tool_calls` en formato OpenAI, con identificadores tipados y `finish_reason: tool_calls`. Verificado en vivo con `get_weather{"city":"Paris"}` y `calculate{"expr":"237*419"}`.
- Aritmética estilo GSM8K: verificado correctamente en la cuantización Q4_K_M (resultado 29 en la comprobación citada).
- Generación de código básico: la model card menciona una comprobación de `is_prime` correcta con guardas de casos límite.
- Capacidad de seguir instrucciones de formato exacto, aunque la model card indica que solo se cumple "en la mayoría" de los casos.
- Ventana de contexto larga de 131k tokens, adecuada para documentos extensos y conversaciones prolongadas.
- Bilingüismo real: responde en chino fluido cuando se le pide, incluyendo el razonamiento interno en ese idioma.

## Casos de uso

- Asistente local en portátil sin GPU dedicada: con Q4_K_M (1,56 GB de pesos, 1.861 MiB de VRAM a contexto 8k) el modelo funciona en CPU o iGPU a velocidad de chat en tiempo real, lo que permite desplegar un asistente conversacional privado sin conexión a servicios externos.
- Agente con tool calling en producción ligera: el soporte nativo de `tool_calls` en formato OpenAI permite integrarlo en orquestadores de agentes (LangChain, LlamaIndex, servidores compatibles con la API de OpenAI) para tareas como consultar APIs meteorológicas, ejecutar cálculos o recuperar datos estructurados, con un coste de infraestructura mínimo.
- Procesamiento de documentos largos: los 131k tokens de contexto permiten resumir contratos, manuales técnicos o transcripciones extensas en una sola pasada, sin necesidad de fragmentación ni de pipelines RAG complejos.
- Atención al cliente bilingüe inglés/chino: el modelo mantiene conversaciones multi-turno y responde en el idioma del usuario, incluyendo razonamiento en chino para consultas en chino, lo que lo hace adecuado para soporte de primer nivel en mercados asiáticos.
- Clasificación y extracción de información con formato fijo: gracias a la ventana de contexto y a la capacidad de seguir instrucciones de formato, puede usarse para extraer campos estructurados de textos largos, aunque conviene validar el cumplimiento estricto del formato en producción.
- Prototipado rápido de aplicaciones LLM: al caber en menos de 3 GB de VRAM en cualquier cuantización, permite iterar sobre prompts, plantillas de chat y flujos de tool calling en una sola GPU de consumo (RTX 3060, 4060, 4070) antes de escalar a modelos mayores.
- Educación y experimentación con modelos de razonamiento: las trazas `[Start thinking]` permiten inspeccionar el proceso de razonamiento del modelo, útil para investigación sobre cadenas de pensamiento y para depurar por qué el modelo llega a una respuesta.

## Benchmarks y rendimiento

Los datos disponibles son mediciones de velocidad, VRAM y perplejidad realizadas por el autor sobre una Tesla T4 con llama.cpp b10709 y offload completo (`-ngl 99`). No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

Velocidad (`llama-bench -p 512 -n 128`, Tesla T4):

| Fichero | Tamano | Prompt (tok/s) | Generacion (tok/s) |
|---|---|---|---|
| Q8_0 | 2,68 GB | 3.334 | 79,8 |
| Q6_K | 2,07 GB | 2.906 | 80,8 |
| Q5_K_M | 1,81 GB | 3.002 | 94,7 |
| Q4_K_M | 1,56 GB | 3.182 | 102,6 |
| IQ4_XS | 1,42 GB | 3.358 | 114,5 |

VRAM medida con `nvidia-smi` (offload completo, contexto 8.192):

| Fichero | VRAM |
|---|---|
| Q8_0 | 2.799 MiB |
| Q6_K | 2.281 MiB |
| Q5_K_M | 2.065 MiB |
| Q4_K_M | 1.861 MiB |
| IQ4_XS | 1.737 MiB |

Retención de calidad (perplejidad sobre WikiText-2 raw test, 1,29 MB, contexto 512):

| Fichero | PPL | Delta vs Q8_0 | Delta declarado vs F16 |
|---|---|---|---|
| Q8_0 | 14,16 | - | +0,02 |
| Q6_K | 14,18 | +0,02 | +0,08 |
| Q5_K_M | 14,34 | +0,17 | +0,23 |
| Q4_K_M | 14,58 | +0,42 | +0,49 |
| IQ4_XS | 14,88 | +0,72 | +0,72 |

La model card reporta además una perplejidad de referencia F16 de 15,16 medida con `llama-perplexity` sobre un subconjunto de 200 KB de WikiText-2 con contexto 512, cifra que difiere de la medición independiente (14,16 para Q8_0) por diferencias en el subconjunto evaluado.

## Requisitos de hardware

- VRAM estimada: de 1.737 MiB (IQ4_XS) a 2.799 MiB (Q8_0) con offload completo y contexto 8.192. Añadir aproximadamente 1 GB adicional para contexto si se amplía la ventana.
- GPU recomendadas por cuantización: Q8_0 para RTX 3060/4070/5070 (12 GB); Q6_K para RTX 4060/3070 (8 GB); Q5_K_M para GTX 1660 Super/2060/3050 laptop (6 GB); Q4_K_M para CPU, Apple Silicon o móviles; IQ4_XS como opción mínima usable.
- Cabe en cualquier GPU de consumo de la última década: todas las cuantizaciones ocupan menos de 3 GB de VRAM.
- Despliegue: llama.cpp (`llama-server`, `llama-cli`), Ollama (`ollama run hf.co/saidutta69/MiniCPM5-2B-GGUF:Q4_K_M`), LM Studio, Jan y Docker Model Runner.
- Rendimiento medido en Tesla T4: 102,6 tok/s de generación con Q4_K_M y 114,5 tok/s con IQ4_XS; 79,8 tok/s con Q8_0. Las cuantizaciones menores decodifican más rápido por estar limitadas por ancho de banda de memoria.
- Para el modo de razonamiento conviene reservar al menos 1.024 tokens de generación (`n_predict`/`max_tokens`); en servidor, `--reasoning-budget 512` limita el pensamiento en tareas simples.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de tareas para este modelo ni para alternativas comparables dentro de la información proporcionada, por lo que la comparación se limita a características estructurales verificables.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MiniCPM5-2B (este repo, GGUF) | 2,5B | 131k | en, zh | Apache 2.0 | GGUF |
| openbmb/MiniCPM5-2B (base) | 2,5B | 131k | en, zh | Apache 2.0 | safetensors (presumible, no confirmado en la informacion) |
| Alternativas de ~2-3B | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente en inglés y chino, es esperable un rendimiento degradado en castellano y otros idiomas no incluidos en la lista de idiomas soportados.
- Riesgo de alucinación: inherente a modelos de 2,5B parámetros; las comprobaciones puntuales citadas (aritmética, `is_prime`) no sustituyen una evaluación sistemática.
- Limitación de idioma: solo inglés y chino están declarados como soportados; no hay evidencia de calidad en castellano.
- El modo de razonamiento consume tokens: si se configura un límite de generación bajo (menos de 1.024 tokens), las respuestas pueden cortarse a mitad del pensamiento.
- El cumplimiento de instrucciones de formato exacto es parcial según la propia model card ("mostly followed"), por lo que en producción conviene validar y parsear las salidas con tolerancia a fallos.
- Las mediciones de rendimiento proceden de una única GPU (Tesla T4) y de un único entorno (llama.cpp b10709); el rendimiento en otras GPUs, backends o versiones de llama.cpp puede variar.
- Las cifras de perplejidad de la model card y de la comprobación independiente no son directamente comparables entre sí por usar subconjuntos de evaluación distintos.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales en la información disponible.
- El repositorio es una cuantización de terceros (usuario saidutta69), no una publicación oficial de OpenBMB; para producción conviene verificar la integridad de los ficheros y considerar el modelo base original.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/saidutta69/MiniCPM5-2B-GGUF
- Modelo base: https://huggingface.co/openbmb/MiniCPM5-2B
- Organización OpenBMB en Hugging Face: https://huggingface.co/openbmb
- llama.cpp (backend de inferencia): https://github.com/ggml-org/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- Jan: https://jan.ai
