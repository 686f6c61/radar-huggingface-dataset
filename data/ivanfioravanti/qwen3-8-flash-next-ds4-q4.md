# ivanfioravanti/Qwen3.8-Flash-Next-DS4-Q4

## Resumen

Qwen3.8-Flash-Next DS4 Q4 es una cuantización DS4 (Motor Metal de Apple) del modelo Qwen/Qwen3.8-Flash-Next, publicada por ivanfioravanti. Se trata de un modelo de lenguaje de 51.200 millones de parámetros con arquitectura híbrida MoE (con proyecciones densas GDN/QSA y 512 expertos enrutados por capa) y ventana de contexto nativa de 262.144 tokens. La cuantización aplica Q4_K con importancia (imatrix) a los expertos enrutados, MXFP4 a las proyecciones down, Q8_0 a los módulos densos y mantiene embeddings y controles en BF16/F32. Incluye un bloque MTP (multi-token prediction) embebido que permite decodificación especulativa. Está pensado exclusivamente para hardware Apple Silicon con Metal y requiere el runtime DS4 personalizado; no es un GGUF estándar de llama.cpp. Su relevancia radica en ejecutar un modelo de 51B en un Mac con memoria unificada, con velocidades de prefill muy altas y una pérdida de calidad controlada respecto al checkpoint BF16 de referencia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida MoE (48 capas trunk, 512 expertos enrutados por capa, proyecciones GDN/QSA, bloque MTP embebido) |
| Parámetros totales | 51.200.245.795 |
| Parámetros activos | no disponible |
| Longitud de contexto | 262.144 tokens (ventana nativa 262K) |
| Tipos de cuantización | Q4_K imatrix (routed expert gate/up), MXFP4 (routed expert down), Q8_0 (GDN/QSA, shared experts, output), BF16/F32 (embeddings, router, hiperconexiones, normas, controles), Q4_1 (tabla PLE externa) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF especializado (esquema qwen4exp) para DS4/Metal, con sidecar externo para la tabla PLE; no es un GGUF estándar de llama.cpp |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen/Qwen3.8-Flash-Next, un modelo híbrido que combina proyecciones densas GDN/QSA con capas de expertos enrutados (MoE). La configuración de cuantización revela 48 capas trunk y 512 expertos por capa, más un bloque MTP embebido en el archivo principal. Aunque el modelo tiene 51.200 millones de parámetros, al tratarse de un MoE no se especifica cuántos parámetros están activos por token. No se dispone de datos sobre el entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO), ya que esta publicación se centra exclusivamente en la cuantización del checkpoint oficial BF16 en la revisión `de4b8e4d43b917e7706784d8bb445c9af86a3540`. La cuantización emplea una matriz de importancia calibrada con el dataset `unsloth_calibration_Qwen3.8-Flash-Next.txt` (45 chunks de 18432 tokens) y utiliza una tabla PLE de n-gramas externa que se lee bajo demanda desde disco, lo que reduce la huella de memoria en residente.

## Capacidades

- Generación de texto de propósito general como modelo de lenguaje.
- Ventana de contexto nativa de 262K tokens, apta para procesar documentos o logs extensos en una sola pasada.
- Decodificación especulativa mediante el bloque MTP embebido, con una tasa de aceptación de borrador de hasta el 98% en prompts cortos estructurados.
- Preservación de la distribución de muestra cuando se activa `--mtp-exact-sampling`.
- Ejecución optimizada para Apple Silicon con Metal, con prefill por encima de 1000 tokens/s y decode de ~42 a 56 tokens/s en el hardware de referencia.
- Uso de la tabla PLE externa (sidecar) para probabilidades de n-gramas, sin que llegue a ser residente en memoria.

## Casos de uso

- Análisis de documentos extensos en local: la ventana de 262K permite procesar informes completos, contratos o papers de investigación sin perder contexto, sobre un Mac con memoria unificada.
- Asistente de escritura interactivo en macOS: con el bloque MTP se alcanzan entre 55 y 66 tokens/s en el M3 Ultra de referencia, suficiente para aplicaciones de tiempo real que generan texto de forma fluida.
- Prototipado de aplicaciones de IA sin conexión: al ejecutarse en Apple Silicon, puede integrarse en herramientas de escritorio que no dependen de servicios en la nube, manteniendo los datos localmente.
- Investigación sobre cuantización de modelos MoE: el release incluye métricas de calidad frente al checkpoint BF16 de referencia, lo que permite estudiar el impacto de cuantizaciones Q4_K imatrix y MXFP4 en modelos de gran tamaño.
- Decodificación especulativa en producción: el bloque MTP embebido reduce la latencia de generación sin alterar la distribución de salida (si se usa `--mtp-exact-sampling`), útil en sistemas que requieren baja latencia con calidad preservada.
- Análisis de logs y trazas técnicas: el alto prefill y el contexto largo permiten resumir o clasificar grandes volúmenes de texto en una sola pasada, por ejemplo en entornos de depuración o monitorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor proporciona mediciones de rendimiento en un M3 Ultra de 512 GB, recogidas a continuación.

| Contexto | Prefill (tok/s) | Decodificación normal (tok/s) | Decodificación MTP (tok/s) |
|---|---:|---:|---:|
| 4K–16K | 1071–1171 | 45.4–45.6 | 55–56 |
| 64K | 1158 | 44.8 | 51.7 |
| 128K | 1136 | 44.1 | 53.9 |
| 262K (ventana nativa) | 1063 | 42.2 | 45.2 |

Además, en prompts cortos estructurados (por ejemplo, matemáticas) se alcanzan ~66 tok/s con MTP y una tasa de aceptación de borrador de ~98%.

Evaluación de calidad realizada por el autor contra un checkpoint BF16 local de referencia (100 casos, continuaciones greedy de 24 tokens, top-20 logprobs, 85 casos alineados por tokenización):

| Métrica | Este release (Q4_K/MXFP4) | Referencia Q8_0 (ggml-org) | Release anterior Q4_0 |
|---|---|---|---|
| Error absoluto medio (logprob) | 0.0431 | 0.0211 | 0.0430 |
| Coincidencia top-1 | 96.6% | 98.7% | 96.5% |
| Coincidencia primer token greedy | 74/85 | no disponible | no disponible |

## Requisitos de hardware

- Residentes en memoria: aproximadamente 69.7 GiB para los pesos del modelo (incluye MTP), más la caché KV y los buffers gráficos, que dependen del contexto.
- Memoria mínima recomendada: Mac con 128 GB o más de memoria unificada, según el autor, para disponer de margen de referencia.
- GPU: exclusivamente Apple Silicon con Metal. El modelo fue desarrollado y medido en un M3 Ultra de 512 GB. No es compatible con GPUs NVIDIA ni AMD.
- Disco: se requiere un SSD local rápido para el sidecar PLE de 32.0 GB (29.8 GiB), que se lee bajo demanda durante la inferencia.
- Opciones de despliegue: solo runtime DS4 (rama `qwen3.8-flash-next` en `ivanfioravanti/ds4`). No es compatible con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento medido en M3 Ultra: prefill de ~1050–1170 tokens/s y decode de ~42–46 tokens/s (55–56 con MTP).

## Comparativa con modelos similares

| Variante | Parámetros | Contexto | Licencia | Tamaño en disco | Requiere DS4 | Notas |
|---|---|---|---|---|---|---|
| Qwen/Qwen3.8-Flash-Next (BF16 original) | 51.2B | 262K | qwen-community-1.0 | no disponible | No | Referencia en calidad, sin cuantizar |
| ivanfioravanti/Qwen3.8-Flash-Next-DS4-Q4 (este release) | 51.2B | 262K | qwen-community-1.0 | 74.9 GB + 32 GB sidecar | Sí | Q4_K imatrix + MXFP4, MTP embebido |
| ivanfioravanti/Qwen3.8-Flash-Next-DS4-IQ2 | 51.2B | 262K | qwen-community-1.0 | no disponible | Sí | Cuantización IQ2, menor tamaño y calidad inicial |

## Limitaciones y advertencias

- El modelo requiere exclusivamente Apple Silicon con Metal y el runtime DS4; no puede ejecutarse en otras plataformas ni con herramientas estándar como llama.cpp, vLLM, Ollama o TGI.
- Es una cuantización agresiva (Q4_K/MXFP4): la evaluación interna muestra un error logprob medio de 0.0431 respecto al BF16 de referencia y una coincidencia top-1 del 96.6%, lo que implica pérdida de calidad frente a precisiones altas.
- La tabla PLE externa de 32 GB es obligatoria y debe estar en un SSD rápido; si no está presente, el modelo no carga.
- No se han publicado benchmarks estándar (MMLU, HumanEval, GSM8K), por lo que la calidad real en tareas de razonamiento, código o matemáticas es desconocida.
- La licencia `qwen-community-1.0` puede imponer restricciones para uso comercial; es necesario revisar los términos antes de desplegar el modelo en producción.
- El soporte de idiomas no está documentado. Aunque el modelo base de Qwen suele ser multilingüe, este release no proporciona información al respecto.
- La decodificación especulativa con `--mtp` produce una distribución ligeramente diferente a menos que se active `--mtp-exact-sampling`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ivanfioravanti/Qwen3.8-Flash-Next-DS4-Q4
- Runtime DS4 (GitHub): https://github.com/ivanfioravanti/ds4
- Modelo base Qwen/Qwen3.8-Flash-Next: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Variante IQ2 del mismo autor: https://huggingface.co/ivanfioravanti/Qwen3.8-Flash-Next-DS4-IQ2
