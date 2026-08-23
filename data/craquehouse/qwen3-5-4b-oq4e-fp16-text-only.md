# craquehouse/Qwen3.5-4B-oQ4e-fp16-text-only

## Resumen

Qwen3.5-4B-oQ4e-fp16-text-only es una cuantización oQ4e del modelo base Qwen/Qwen3.5-4B, preparada por el autor craquehouse mediante su herramienta model-lab y el servidor oMLX. Se trata de una versión solo texto, con las torres de visión y audio eliminadas por completo, lo que reduce el tamaño en disco a 2,53 GB frente a los 9,34 GB del original. Está pensada exclusivamente para ejecución en hardware Apple Silicon (M1, M2 y posteriores) y se distribuye bajo licencia Apache-2.0.

La cuantización oQ4e combina una base de 4 bits con grupo de 64, más un presupuesto de sensibilidad que mantiene 91 tensores a 5 bits y 7 a 6 bits. El modelo base Qwen3.5-4B emplea arquitectura gated delta networks, decodificación MTP y una ventana de contexto de 262K tokens. Esta build concreta usa fp16 como dtype base en lugar de bf16, lo que supone una ventaja de prefill de aproximadamente un 20 % en M1 y M2, donde el hardware no tiene ruta nativa de bf16 en la GPU.

El razonamiento viene activado por defecto a través de la plantilla de chat: la respuesta se entrega en `reasoning_content` y `content` puede quedar vacío si `max_tokens` se agota a mitad del pensamiento. Es un modelo de solo texto, sin capacidades multimodales, orientado a despliegues locales de baja huella de memoria en equipos Apple con GPU unificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5-4B (gated delta networks), cuantizado oQ4e |
| Parametros totales | 691.826.176 (según safetensors del modelo cuantizado) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.000 tokens (base Qwen3.5-4B) |
| Tipos de cuantizacion | oQ4e: base 4-bit affine con grupo 64; 91 tensores a 5-bit y 7 a 6-bit por presupuesto de sensibilidad |
| Idiomas soportados | no disponible (el base Qwen3.5-4B es multilingüe, no se confirma en esta build) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (formato MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-4B es la entrada densa compacta de la familia Qwen3.5: usa arquitectura gated delta networks, un encoder de visión (eliminado en esta build) y decodificación MTP (multi-token prediction). Se entrenó con fusión temprana sobre billones de tokens multimodales, lo que le otorga paridad con Qwen3 en razonamiento, código y agentes. Esta build concreta elimina las torres de visión y audio, lo que obliga a reajustar la asignación de bits por peso: al retirar las torres, que no se cuantizaban pero contaban en el presupuesto de bits, cinco tensores del modelo de lenguaje han subido un nivel de bits.

La cuantización oQ4e se construyó con oMLX 0.6.3rc2, con una base de 4 bits affine a grupo 64 y un presupuesto de sensibilidad que mantiene 98 tensores por encima de la base: 91 a 5 bits y 7 a 6 bits. La calibración se realizó con una pasada de 128 muestras registrada en `oq_imatrix_report.json`. El dtype base es fp16 en todo el modelo, sin tensores bf16 ni fp32 (solo fp16 y pesos empaquetados de 4 bits). El autor advierte que el rango de exponente de fp16 es más estrecho que el de bf16 (máximo 65504 frente a 3,4e38), lo que puede producir `inf` o salidas degeneradas en hardware donde la build bf16 funciona correctamente.

## Capacidades

- Generación de texto con razonamiento (modo thinking) activado por defecto: la respuesta llega en `reasoning_content` y puede devolver `content` vacío si se agota `max_tokens` durante el pensamiento.
- Razonamiento multi-step: el modo thinking permite encadenar pasos de razonamiento antes de emitir la respuesta final, con un coste de tokens de entrada de 2 tokens adicionales al activar el bloqueo de pensamiento.
- Conversación multi-turno: pipeline de text-generation con plantilla de chat integrada, adecuada para diálogos en los que se puede desactivar el razonamiento por petición con `chat_template_kwargs`.
- Solo texto: no dispone de entrada de visión ni audio; las torres multimodales se eliminaron en la build.
- Despliegue local en Apple Silicon: optimizado para M1, M2 y M3 con el runtime oMLX, sin necesidad de GPU NVIDIA.
- Integración con sistemas OpenAI-compatible: soporta el formato de servidor de oMLX, incluyendo configuración de defaults por modelo vía `model_settings.json`.

## Casos de uso

- Asistente de razonamiento local en portátil: con una ventana de contexto de 262K tokens y un pico de memoria de 3,5 GiB en prefill de 1024 tokens, se puede ejecutar en un MacBook con 16 GB de RAM unificada para tareas de análisis, resumen y razonamiento sin conexión a la nube.
- Integración con Home Assistant: el modelo card documenta explícitamente el uso con Home Assistant, que no permite enviar `chat_template_kwargs`; se configura el default en `~/.omlx/model_settings.json` para desactivar el razonamiento por defecto y obtener respuestas directas en `content`.
- Servidor OpenAI-compatible local: desplegable con oMLX, sirve el modelo por API compatible con OpenAI para integrarse en herramientas de terceros (automatizaciones, bots, scripts) sin necesidad de GPU NVIDIA.
- Generación de código en equipos sin GPU: con throughput de decodificación de 48-60 tokens/s en M2 Pro y un tamaño de 2,53 GB, es viable para autocompletado y generación de fragmentos de código en desarrollo local.
- Análisis de contexto largo en memoria limitada: con 262K tokens de ventana y 4,61 GiB de pico en prefill de 8192 tokens, permite procesar documentos extensos (informes, logs, código) en equipos de consumo sin servidores dedicados.
- Evaluación de cuantizaciones en Apple Silicon: útil para investigar el impacto de oQ4e con base fp16 en rendimiento de prefill y decodificación, especialmente en M1 y M2 donde la build bf16 no tiene camino nativo.
- Despliegue de agentes conversacionales con razonamiento: el modo thinking activado por defecto permite construir agentes que razonan antes de responder, siempre que el cliente soporte `chat_template_kwargs`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor menciona una regresión de ~37 puntos de GSM8K en oMLX 0.5.0-rc1, corregida en 0.6.3rc2, pero no se ofrecen cifras absolutas.

Sí se proporcionan mediciones de throughput realizadas con oMLX 0.6.3rc2 en un Apple M2 Pro con 16 GB, razonamiento desactivado y corpus `code_python` con TG=128.

### Petición individual

| PP | TTFT | prefill | TPOT | generación | end-to-end | pico de memoria |
|---:|---:|---:|---:|---:|---:|---:|
| 1024 | 1,86 s | 549,7 t/s | 16,92 ms | 59,6 t/s | 4,04 s | 3,50 GiB |
| 4096 | 11,32 s | 361,7 t/s | 17,55 ms | 57,4 t/s | 13,59 s | 4,24 GiB |
| 8192 | 19,32 s | 423,9 t/s | 18,81 ms | 53,6 t/s | 21,73 s | 4,61 GiB |
| 16384 | 37,04 s | 442,4 t/s | 20,82 ms | 48,4 t/s | 39,72 s | 5,36 GiB |

### Concurrencia (PP1024)

| batch | TTFT medio | prefill | generación agregada | end-to-end | tokens |
|---:|---:|---:|---:|---:|---:|
| 1 | 1,86 s | 549,7 t/s | 59,6 t/s | 4,04 s | 128 |
| 2 | 3,86 s | 432,1 t/s | 97,0 t/s | 7,38 s | 256 |
| 4 | 6,35 s | 378,7 t/s | 149,6 t/s | 14,24 s | 512 |

El prefill se estabiliza en torno a 420-440 t/s cuando la GPU se satura; la fila de PP1024 está inflada por operar al 92 % de utilización frente al 99,7 % del resto. El decode cae de 59,6 a 48,4 t/s al multiplicar por 16 el contexto, un -19 %. Con 4 peticiones concurrentes se obtiene 2,5 veces el throughput agregado de una sola petición, con degradación de latencia por petición.

## Requisitos de hardware

- Hardware objetivo: Apple Silicon (M1, M2, M3 y posteriores); la build fp16 está optimizada para M1 y M2, donde no hay camino nativo de bf16 en la GPU.
- Memoria: 16 GB de RAM unificada son suficientes; el pico de memoria medido en M2 Pro oscila entre 3,50 GiB (prefill de 1024 tokens) y 5,36 GiB (prefill de 16384 tokens).
- GPU: no requiere GPU NVIDIA; se ejecuta sobre la GPU integrada de Apple Silicon mediante MLX.
- Despliegue: oMLX como servidor OpenAI-compatible, con soporte de configuración por modelo en `~/.omlx/model_settings.json`; también es compatible con la librería MLX directamente.
- Latencia y throughput: prefill de 420-440 t/s (una vez saturada la GPU), decodificación de 48-60 t/s en M2 Pro según el tamaño de contexto; TTFT de 1,86 s a 37,04 s según prefill de 1024 a 16384 tokens.
- Nota: en M3 y posteriores, el hardware bf16 cierra la brecha y esta build no ofrece ventaja sobre una build bf16 normal.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano | Modalidades | Licencia |
|---|---|---|---|---|---|
| Qwen/Qwen3.5-4B (base) | ~4B | 262K | 9,34 GB | texto, visión, audio | Apache-2.0 |
| craquehouse/Qwen3.5-4B-oQ4e-fp16-text-only | 691.826.176 (safetensors) | 262K | 2,53 GB | solo texto | Apache-2.0 |

No hay datos disponibles de otros modelos cuantizados comparables (por ejemplo, versiones GGUF de Qwen3.5-4B en 4-bit) en la información proporcionada. La comparativa principal es contra el base: la versión cuantizada reduce el tamaño a un 27 % del original y elimina las torres multimodales, lo que la hace apta para equipos de 16 GB que no podrían cargar los 9,34 GB del base en fp32.

## Limitaciones y advertencias

- Rango de exponente de fp16 limitado: el máximo es 65504 frente a 3,4e38 de bf16; si se observan `inf` o salidas degeneradas en hardware donde la build bf16 funciona, es el primer factor a sospechar.
- Solo texto: las torres de visión y audio se eliminan por completo; no se puede procesar imágenes ni audio.
- Razonamiento activado por defecto: si no se desactiva con `enable_thinking: false` en `chat_template_kwargs`, la respuesta llega en `reasoning_content` y `content` puede quedar vacío si `max_tokens` se agota durante el pensamiento.
- Configuración de razonamiento limitada: `enable_thinking` solo funciona dentro de `chat_template_kwargs`; un `enable_thinking` a nivel raíz se descarta silenciosamente, y `reasoning_effort` se acepta y descarta.
- Coste de tokens al desactivar el razonamiento: desactivarlo cuesta 2 tokens de prompt adicionales en lugar de ahorrar, al emitir un par pre-cerrado ` thinking\n\n response\n\n`.
- Sensibilidad a la versión de oMLX: oMLX 0.5.0-rc1 introdujo una regresión de ~37 puntos en GSM8K con oQ4/oQ4e; se recomienda usar 0.6.3rc2 o superior.
- Sin ventaja en M3 y posteriores: en hardware con bf16 nativo, esta build no ofrece mejora frente a una build bf16 estándar.
- Sin datos de benchmarks estándar: no se publican resultados de MMLU, HumanEval, GSM8K u otros para esta build, lo que limita la comparación objetiva con otros modelos cuantizados.

## Enlaces

- Repositorio de HuggingFace del modelo: https://huggingface.co/craquehouse/Qwen3.5-4B-oQ4e-fp16-text-only
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Colección Qwen3.5 en HuggingFace: https://huggingface.co/collections/Qwen/qwen35
- Receta de vLLM para Qwen3.5-4B: https://recipes.vllm.ai/Qwen/Qwen3.5-4B
- Repositorio de referencia Qwen3.5 en GitHub: https://github.com/ABDtmx/Qwen3.5
- Entrada de Qwen3.5-4B en Ollama: https://ollama.com/library/qwen3.5:4b
- Herramienta de cuantización model-lab: https://git.craquehouse.cc/craquehouse/model-lab
- Motor oMLX: https://github.com/jundot/omlx
- Issue #2172 de oMLX (regresión oQ4/oQ4e): https://github.com/jundot/omlx/issues/2172
