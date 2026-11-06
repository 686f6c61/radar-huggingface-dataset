# GetCortex27/Nanbeige4.3-33B-FP8

## Resumen

Nanbeige4.3-33B-FP8 es una cuantización de precisión FP8 (W8A8 dinámica) del modelo denso Nanbeige4.3-33B, publicado por el usuario GetCortex27 (Minimorsel Enterprises Pvt. Ltd.) sobre los pesos originales de Nanbeige. El modelo base es un transformer denso de 33.118.977.024 parámetros con una ventana de contexto nativa de 512K tokens, orientado a tareas agénticas y de generación de código, con el modo de razonamiento (thinking) activado por defecto en la plantilla de chat. La cuantización reduce el peso en disco de 66 GB en BF16 a 34 GB en safetensors, manteniendo la licencia Apache 2.0 del modelo original.

La relevancia de esta ficha radica en que el checkpoint está pensado para despliegue en producción: se publica con mediciones propias de fidelidad frente a BF16 y de throughput en SGLang sobre una GPU RTX PRO 6000 Blackwell de 96 GB, además de instrucciones de lanzamiento para SGLang y vLLM. El formato `compressed-tensors` carga de forma nativa en ambos motores de inferencia, lo que evita conversiones adicionales.

No se trata de un modelo nuevo ni de un fine-tuning: los pesos son una transformación numérica de los originales, sin datos de calibración (data-free), y las capacidades del modelo son las del base Nanbeige4.3-33B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia llama, según tag `llama`); detalles internos del base no disponibles |
| Parametros totales | 33.118.977.024 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 512K tokens nativos en el modelo base; 32K configurados en las pruebas de serving |
| Tipos de cuantizacion | FP8 W8A8 dinámica: pesos FP8 E4M3 con escalas por canal, activaciones FP8 con escala dinámica por token; `lm_head` sin cuantizar; esquema `FP8_DYNAMIC` de llm-compressor |
| Idiomas soportados | Inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con formato `compressed-tensors` (34 GB; el BF16 original ocupa 66 GB) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base Nanbeige4.3-33B, un transformer denso de 33B parámetros. La receta aplicada es `QuantizationModifier(targets="Linear", scheme="FP8_DYNAMIC", ignore=["lm_head"])` ejecutada con llm-compressor 0.15.0 y transformers 5.21.0. Los pesos se almacenan en FP8 E4M3 con escalas por canal y las activaciones se cuantizan dinámicamente por token; no se utilizó conjunto de calibración (data-free). El autor no documenta el proceso de entrenamiento del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información disponible.

Una modificación relevante respecto al repositorio original es que `use_cache` se establece a `true` en `config.json` y `generation_config.json`; el repositorio upstream lo trae a `false`, lo que provoca que `transformers.generate` recalcule el prefijo en cada paso. El autor reporta que el modelo base es inusualmente sensible a la cuantización de 4 bits (Q4_K_M ≈ 90% de acuerdo top-1) y que a 8 bits la deriva es pequeña, por lo que no consideró necesario un FP8 con calibración.

## Capacidades

- Generación de texto conversacional en inglés y chino.
- Razonamiento con modo thinking activado por defecto en la plantilla de chat; se desactiva por petición con `chat_template_kwargs: {"enable_thinking": false}`.
- Tool calling / function calling, con formato XML recomendado por el modelo base y parser `qwen3_coder` en SGLang y vLLM.
- Flujos agénticos y razonamiento multi-paso (tag `agentic` en el repositorio).
- Generación de código y tareas de coding agéntico (descrito en la model card como "agentic-coding model").
- Separación de la traza de razonamiento en `reasoning_content` y contabilización en `usage` mediante el parser `qwen3`.
- No se documentan capacidades de visión, audio ni otros modos.

## Casos de uso

- Asistente de código agéntico en producción: el modelo puede emitir llamadas a herramientas en formato XML que SGLang y vLLM parsean de forma nativa (`--tool-call-parser qwen3_coder`), lo que permite integrarlo en pipelines de CI/CD o en IDE con ejecución de comandos y edición de ficheros.
- Atención al cliente multi-turno: la ventana nativa de 512K tokens permite mantener historiales largos y documentación de producto en contexto sin truncar; el autor mide TTFT p95 de 0,07 s a concurrencia 1 y 0,19 s a concurrencia 96 sobre prompts de ~137 tokens.
- Despliegue en una sola GPU de 96 GB: el checkpoint FP8 de 34 GB deja espacio para 516K tokens de caché KV en FP8 a 32K de contexto, lo que permite servir el modelo completo en una RTX PRO 6000 Blackwell sin paralelismo de tensor.
- Procesamiento de documentos y extracción estructurada: el autor incluye un registro JSON de adjudicación de siniestros en su corpus de evaluación de fidelidad, lo que sugiere uso en extracción de datos estructurados a partir de texto largo.
- Servicio de inferencia de alto rendimiento: con SGLang 0.5.23 y caché KV en FP8 se midieron 1.669 tok/s agregados a concurrencia 96 y 29 tok/s por stream a concurrencia 1, frente a 785 tok/s agregados y 22 tok/s en BF16 sobre la misma tarjeta.
- Razonamiento con trazas auditables: el modo thinking separa la cadena de razonamiento del contenido final, útil en entornos donde se requiere revisar el proceso de decisión del modelo antes de aplicar la respuesta.
- Aplicaciones bilingües inglés-chino: es el par de idiomas declarado por el modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K u otros). El autor indica explícitamente que las cifras publicadas son mediciones propias de fidelidad y throughput, no los benchmarks autodeclarados del modelo base.

Fidelidad frente a BF16 (evaluación teacher-forced sobre 16 fragmentos de 512 tokens, 6.000 posiciones puntuadas, KL sobre top-64 renormalizado):

| Métrica | Valor |
|---|---|
| KL media (BF16 ‖ FP8), top-64 | 0,0139 |
| KL p95 | 0,0505 |
| Acuerdo top-1 | 96,6% |
| \|Δ log p\| medio del siguiente token real | 0,092 nats |

Throughput en SGLang 0.5.23 sobre una RTX PRO 6000 Blackwell de 96 GB, sin decodificación especulativa y con thinking desactivado (prompts de ~137 tokens, salidas de ~165 tokens):

| Concurrencia | tok/s agregados | tok/s por stream | TTFT p95 |
|---|---|---|---|
| 1 | 29 | 29 | 0,07 s |
| 4 | 104 | 26 | 0,11 s |
| 16 | 355 | 22 | 0,16 s |
| 32 | 607 | 19 | 0,11 s |
| 64 | 1.178 | 18 | 0,21 s |
| 96 | 1.669 | 17 | 0,19 s |

En BF16 sobre la misma tarjeta: 22 tok/s en un solo stream y 785 tok/s agregados a 64 de concurrencia. Se registraron cero errores en 448 peticiones.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 34 GB en FP8; a 32K de contexto el autor reporta que cabe en una GPU de 96 GB junto con 516K tokens de caché KV en FP8.
- GPU recomendadas: RTX PRO 6000 Blackwell de 96 GB (configuración medida por el autor); no se documentan pruebas en A100, H100 ni otras tarjetas.
- GPU de consumo: no se aportan datos de ejecución en GPUs consumer; el tamaño de 34 GB excede la VRAM de las RTX 4090 (24 GB) y queda por encima de una RTX 5090 (32 GB), por lo que no cabe en ellas sin offloading o cuantización adicional.
- Opciones de despliegue: SGLang 0.5.23 (comando de lanzamiento documentado con `--attention-backend flashinfer --kv-cache-dtype fp8_e4m3 --chunked-prefill-size 2048 --max-running-requests 96 --reasoning-parser qwen3 --tool-call-parser qwen3_coder --context-length 32768`) y vLLM (`vllm serve ... --reasoning-parser qwen3 --enable-auto-tool-choice --tool-call-parser qwen3_coder`). El formato `compressed-tensors` carga de forma nativa en ambos.
- Latencia y throughput: ver tabla de la sección anterior; TTFT p95 entre 0,07 s y 0,21 s en el rango de concurrencia 1-96.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-FP8 (GetCortex27) | 33,1B denso | 512K nativo (32K en pruebas) | FP8 W8A8 dinámica | Apache 2.0 | Hugging Face, 22 descargas |
| Nanbeige4.3-33B (base) | 33,1B denso | 512K nativo | BF16 (66 GB) | Apache 2.0 | Hugging Face |
| Alternativas de 33B con contexto largo | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de benchmarks del modelo base ni de terceros que permitan una comparación de rendimiento con alternativas de la misma categoría.

## Limitaciones y advertencias

- Solo se declaran inglés y chino como idiomas soportados; el rendimiento en castellano no está documentado.
- La evaluación de fidelidad se ejecutó con los pesos FP8 desquantizados en transformers, por lo que mide el error de pesos y no el de las activaciones cuantizadas en la ruta de serving; el autor reconoce esta limitación explícitamente.
- El modelo base es descrito como inusualmente sensible a la cuantización de 4 bits (≈90% de acuerdo top-1 con Q4_K_M), lo que desaconseja cuantizaciones más agresivas que la FP8 publicada.
- No se documentan sesgos conocidos, tasas de alucinación ni evaluaciones de seguridad del modelo base en la información disponible.
- El modo thinking está activado por defecto: en producción consume tokens de razonamiento que se contabilizan en `usage`, lo que incrementa coste y latencia si no se desactiva por petición.
- El repositorio upstream trae `use_cache` a `false`; esta cuantización lo corrige, pero cualquier fichero de configuración tomado del repositorio original reproducirá el problema de recálculo del prefijo.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; el autor no añade restricciones adicionales, pero tampoco ofrece garantías sobre los pesos cuantizados.
- El checkpoint tiene 22 descargas y 0 likes en el momento de la consulta, y las mediciones provienen de un único operador; no hay validación independiente.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/GetCortex27/Nanbeige4.3-33B-FP8
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Repositorio del autor: https://github.com/GetCortex27
- llm-compressor: https://github.com/vllm-project/llm-compressor
- SGLang: https://github.com/sgl-project/sglang
- vLLM: https://github.com/vllm-project/vllm
