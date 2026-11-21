# netprojects/Inkling-2-Mini-MLX-2.5bit

## Resumen

Inkling-2-Mini-MLX-2.5bit es una cuantización de 2,5 bits del modelo Thinking Machines Inkling-2-Mini, publicada por el usuario netprojects y empaquetada para MLX, el framework de Apple para ejecutar modelos en silicio de Apple. El modelo original es un mixtura de expertos (MoE) con arquitectura de bucle ("looped MoE"): 26.388.641.280 parámetros totales, unos 3.400 millones activos por token, 24 capas de las cuales las doce centrales se ejecutan tres veces, lo que resulta en 48 pasadas de capa por token. Acepta entrada de texto e imagen y soporta hasta 1 millón de tokens de contexto.

La relevancia de esta ficha concreta está en el objetivo de compresión: reducir un modelo de 26,4 B a 11,5 GB de pesos (más 0,64 GB del borrador de decodificación especulativa DSpark) para que quepa en Macs con memoria unificada moderada. El autor re-cuantiza los expertos enrutados desde los valores NVFP4/MXFP8 originales a 2 bits afines con grupo 64, con 3 bits en las capas 0-1 y 20-23 (las que Thinking Machines mantuvo en MXFP8), y deja atención, embeddings, capa de salida y codificador de visión en 4 bits.

Es un artefacto de despliegue, no un modelo nuevo: la licencia Apache 2.0 del modelo base se mantiene y el autor documenta métricas de fidelidad frente a la implementación de referencia en Transformers (87,3 % de mismo siguiente token, KL media 0,1904). Para quien quiera evaluar el modelo original, la referencia es `thinkingmachines/Inkling-2-Mini`; esta build es la opción de bajo consumo para Apple Silicon.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixtura de expertos con bucle ("looped MoE"), transformer; 24 capas, las 12 centrales se repiten 3 veces (48 pasadas de capa por token) |
| Parametros totales | 26.388.641.280 (26,4 B) |
| Parametros activos | ~3,4 B por token |
| Longitud de contexto | Hasta 1.000.000 tokens (modelo base) |
| Tipos de cuantizacion | 2 bits afines (grupo 64) en expertos enrutados; 3 bits en capas 0-1 y 20-23; 4 bits en atención, embeddings, capa de salida y codificador de visión |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX), más `mtp.safetensors` para el borrador DSpark; tamaño del repo 11,5 GB + 0,64 GB de borrador |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer MoE con una innovación estructural: las doce capas centrales de las 24 totales se ejecutan tres veces, de modo que cada token atraviesa 48 pasadas de capa. Solo ~3,4 B de los 26,4 B de parámetros se activan por token, lo que reduce el coste de cómputo frente a un denso del mismo tamaño. El modelo acepta texto e imagen (codificador de visión incluido) y declara hasta 1 millón de tokens de contexto. Incluye un modo de razonamiento controlable mediante el parámetro `reasoning_effort` del chat template, con valores `none`, `minimal`, `low`, `medium`, `high` (por defecto), `xhigh`, `max` o un número entre 0,0 y 0,99.

Esta build concreta no reentrena nada: re-cuantiza los pesos publicados. Los expertos enrutados pasan de NVFP4/MXFP8 a 2 bits afines con grupo 64; las capas 0-1 y 20-23, que Thinking Machines mantuvo en MXFP8, se conservan a 3 bits; atención, embeddings, capa de salida y visión quedan a 4 bits. Se incluye el borrador de decodificación especulativa DSpark (`mtp.safetensors`), que permite generar varios tokens candidatos por paso y verificarlos con el modelo principal. El autor documenta que la salida greedy se mantiene fiel al modelo salvo en empates cercanos.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de RLHF/DPO del modelo base en la información proporcionada.

## Capacidades

- Generación de texto conversacional multi-turno con contexto de hasta 1M tokens.
- Razonamiento con modo "thinking" configurable mediante `reasoning_effort`; el servidor OpenAI-compatible devuelve el razonamiento por separado en `reasoning_content`.
- Entrada de imagen (image-text-to-text): descripción, respuesta a preguntas sobre capturas, gráficos y documentos.
- Tool calling / function calling: el modelo emite llamadas en el formato de Inkling y `mlx_vlm.server` las expone como `tool_calls` compatibles con OpenAI.
- Uso como agente: el autor verificó un prompt de agente con herramientas `bash` y `read` que produjo una llamada bien formada; los benchmarks del modelo base incluyen SWE-bench, Terminal-Bench, BrowseComp y MCP Atlas.
- Generación de código y resolución de tareas cortas de programación (3/3 tareas Python con asserts superadas en la verificación del autor).
- Decodificación especulativa con el borrador DSpark incluido.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de programación en local sobre Mac: el modelo base obtiene 79,2 % en SWE-bench Verified y 77,9 % en SWE-bench Pro v2 Hard según Thinking Machines; esta build de 11,5 GB permite ejecutar un agente de código en un portátil Apple Silicon sin GPU dedicada, con tool calling compatible con OpenAI.
- Automatización de terminal y operaciones: Terminal-Bench 2.1 del modelo base (71,6 %) y soporte de herramientas `bash`/`read` lo hacen adecuado para agentes que inspeccionan logs, ejecutan comandos y corrigen errores en un entorno controlado.
- Análisis de documentos e imágenes: con OmniDocBench v1.6 al 92,8 % en el modelo base y codificador de visión incluido, sirve para extraer datos de capturas, facturas o tablas escaneadas en flujos locales.
- Investigación web asistida: BrowseComp 79,0 % (con compactación) en el modelo base; útil para agentes que navegan y sintetizan fuentes con contexto largo.
- Procesamiento de contextos extensos: LongBench v2 al 66,9 % en el modelo base y ventana de hasta 1M tokens permiten resumir o consultar repositorios de documentación completos en una sola pasada.
- Despliegue de bajo consumo en estaciones de trabajo Apple: con 18,2 GB de pico de memoria para un prompt de 8K tokens (12,8-13,1 GB con `prefill_step_size=512`), cabe en Macs de 32 GB o más y evita costes de API en cargas internas.
- Prototipado de agentes con razonamiento configurable: el parámetro `reasoning_effort` permite ajustar el coste de razonamiento por consulta, útil para pipelines donde solo algunas peticiones requieren cadena de pensamiento larga.

## Benchmarks y rendimiento

Resultados del modelo base publicados por Thinking Machines (no de esta cuantización), según la model card:

| Benchmark | Inkling 2 Mini | Qwen3.8-27B | Gemma 4 31B |
|---|---|---|---|
| Artificial Analysis Intelligence Index v5.0 | 20,1 | 20,1 | 4,4 |
| SWE-bench Verified (bash only) | 79,2 % | 77,8 % | 46,1 % |
| SWE-bench Pro v2 Hard (mini-swe-agent) | 77,9 % | 73,8 % | 14,2 % |
| Terminal-Bench 2.1 (pi) | 71,6 % | 73,0 % | 43,4 % |
| BrowseComp (con compactación) | 79,0 % | 61,6 % | 37,0 % |
| MCP Atlas | 82,7 % | 77,3 % | 54,2 % |
| MMMU Pro | 74,9 % | 76,3 % | 73,4 % |
| OmniDocBench v1.6 | 92,8 % | 91,5 % | 82,5 % |
| LongBench v2 | 66,9 % | 52,3 % | 52,9 % |
| ARC-AGI v1 / v2 | 84,5 / 49,3 % | 87,5 / 42,4 % | – |

Verificación específica de esta cuantización por el autor (MacBook Pro M5 Max, 128 GB, MLX 0.32.4, inkling2-mlx v0.1.0):

| Métrica | Valor |
|---|---|
| Mismo siguiente token frente al código de Thinking Machines | 87,3 % (488 posiciones de respuesta, 12 textos) |
| KL media frente al código de Thinking Machines | 0,1904 |
| Mismo siguiente token frente a la build 4/8-bit del mismo autor | 87,3 % |
| KL media frente a la build 4/8-bit | 0,1869 |
| GSM8K (50 preguntas fijas, razonamiento `none`, greedy) | 45/50 |
| Memoria pico con prompt de 4K tokens | 17,2 GB |
| Memoria pico con prompt de 8K tokens | 18,2 GB |
| Memoria pico con `prefill_step_size=512` | 12,8 / 13,1 GB (4K / 8K) |

Comparativa interna de builds del mismo autor:

| Build | Tamaño | Mismo siguiente token | KL | GSM8K | Memoria pico 8K |
|---|---|---|---|---|---|
| 4-8bit (recomendada) | 20,2 GB + 0,64 GB | 98,6 % | 0,0018 | 47/50 | 27,8 GB |
| 3bit | 14,7 GB + 0,64 GB | 95,7 % | 0,0421 | 48/50 | 21,2 GB |
| 2.5bit | 11,5 GB + 0,64 GB | 87,3 % | 0,1904 | 45/50 | 18,2 GB |

## Requisitos de hardware

- Memoria: pico de 17,2 GB con prompt de 4K tokens y 18,2 GB con 8K; baja a 12,8-13,1 GB con `prefill_step_size=512`. El repo pesa 11,5 GB más 0,64 GB de borrador.
- Plataforma: exclusivamente Apple Silicon (MLX); no es ejecutable en GPU NVIDIA ni en CPU x86 con esta build.
- GPU recomendadas: cualquier chip Apple Silicon con memoria unificada suficiente; el autor verificó en un MacBook Pro M5 Max de 128 GB. Para 8K de contexto se recomienda un mínimo de 24 GB de memoria unificada; con `prefill_step_size` reducido, 16 GB es ajustado pero viable.
- Cabe en GPU de consumo: sí, en Macs con memoria unificada de 24 GB o más; no aplica a RTX 4090, A100 o H100 por la dependencia de MLX.
- Despliegue: MLX-VLM con soporte de Inkling 2 Mini desde `internet-projects/inkling2-mlx` (v0.1.0, Python 3.10+); servidor OpenAI-compatible con `mlx_vlm.server --model ... --port 8000`.
- Latencia y throughput: no disponibles en la información proporcionada; el borrador DSpark está pensado para acelerar la generación especulativa, pero no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-2.5bit (esta ficha) | 26,4 B totales, ~3,4 B activos | 1M | Apache 2.0 | MLX / Apple Silicon | Cuantización de 2,5 bits; 45/50 en GSM8K |
| Inkling-2-Mini-MLX-3bit (mismo autor) | 26,4 B totales, ~3,4 B activos | 1M | Apache 2.0 | MLX / Apple Silicon | 14,7 GB; 95,7 % de mismo siguiente token; 48/50 en GSM8K |
| Inkling-2-Mini-MLX-4-8bit (mismo autor) | 26,4 B totales, ~3,4 B activos | 1M | Apache 2.0 | MLX / Apple Silicon | 20,2 GB; 98,6 % de mismo siguiente token; 27,8 GB de pico a 8K |
| Qwen3.8-27B (referencia de Thinking Machines) | 27 B (denso, según nombre) | No disponible | No disponible | No disponible | Comparado en los benchmarks del modelo base |

## Limitaciones y advertencias

- La cuantización a 2,5 bits degrada la fidelidad: solo el 87,3 % de posiciones coinciden con el siguiente token del modelo de referencia y la KL media es 0,1904, muy superior a la de las builds de 3 y 4-8 bits. Para tareas sensibles a la precisión, el propio autor recomienda la build 4-8-bit.
- El modelo base puede entrar en bucles de razonamiento largos incluso con `reasoning_effort=none`; es obligatorio fijar `max_tokens` para evitar generaciones descontroladas.
- Dependencia de ecosistema: requiere MLX y una versión no publicada de MLX-VLM instalada desde un repositorio de GitHub; no hay soporte en vLLM, llama.cpp, Ollama ni TGI para esta build.
- Solo Apple Silicon: no es desplegable en infraestructura NVIDIA, lo que limita su uso en producción en la nube convencional.
- Idiomas soportados no documentados; no hay garantía de calidad multilingüe más allá de lo que ofrezca el modelo base.
- Riesgo de alucinación inherente al modelo base; no se han publicado evaluaciones de sesgo ni de seguridad en la información disponible.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantización no ofrece garantías sobre la fidelidad de la build; conviene validar en el dominio de aplicación antes de producción.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y fue creado el 20 de noviembre de 2026; es un artefacto reciente y sin validación comunitaria independiente.

## Enlaces

- Hugging Face (esta build): https://huggingface.co/netprojects/Inkling-2-Mini-MLX-2.5bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Build 3bit del mismo autor: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-3bit
- Build 4-8bit del mismo autor: https://huggingface.co/netprojects/Inkling-2-Mini-MLX-4-8bit
- Repositorio MLX-VLM con soporte de Inkling 2 Mini: https://github.com/internet-projects/inkling2-mlx
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
