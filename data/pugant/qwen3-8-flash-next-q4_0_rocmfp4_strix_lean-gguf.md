# pugant/Qwen3.8-Flash-Next-Q4_0_ROCMFP4_STRIX_LEAN-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo **Qwen3.8-Flash-Next** (arquitectura `qwen4exp`), preparada específicamente para hardware AMD Strix Halo (Radeon 8060S, gfx1151) con memoria unificada. El modelo base, desarrollado por Alibaba Qwen, es un MoE híbrido de 176.9B parámetros totales (125B base + 51B tabla n-gram PLE + 4B MTP) con solo 6B parámetros activos por token, lo que reduce drásticamente el coste de inferencia frente a modelos densos de tamaño similar. Según el repositorio oficial, Qwen3.8-Flash-Next reduce el coste de entrenamiento a aproximadamente 1/9 respecto a Qwen3.7-Plus, manteniendo capacidades superiores en tareas de programación y ofimática.

La cuantización `Q4_0_ROCMFP4_STRIX_LEAN` (ftype 106) aplica ROCmFP4 a los expertos MoE y atención, Q5_1 a la tabla PLE, Q5_K a las embeddings y Q6_K a la cabeza de salida, logrando un tamaño de 98.47 GiB (4.78 BPW) que encaja en el envelope de ~64 GiB de memoria residente del Strix Halo. Requiere el fork ROCmFPX de llama.cpp, ya que llama.cpp estándar no soporta los tipos de tensor empleados. El autor declara una validación cruzada de la conversión mediante perplexity en un holdout italiano (Dante), con valores de 1.156 (runtime upstream) y 1.095 (runtime ROCmFPX), aunque advierte que ese holdout está memorizado por el modelo base y no constituye una métrica de calidad real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | qwen4exp (MoE híbrido GDN + QSA, con tabla n-gram PLE y MTP) |
| Parametros totales | 176.943.899.520 (176.9B) |
| Parametros activos | 6B (por token) |
| Longitud de contexto | no disponible (el comando de ejemplo usa 8192, pero no se especifica el máximo) |
| Tipos de cuantizacion | ROCmFP4 (tipo 101) para expertos y atención; Q5_1 para PLE; Q5_K para token_embd; Q6_K para output; ftype 106 (Q4_0_ROCMFP4_STRIX_LEAN) |
| Idiomas soportados | no disponible (el modelo base Qwen3.8 es multilingüe, pero no se detalla en la información) |
| Licencia | qwen-community-1.0 |
| Formato de pesos | GGUF (shardeado, 105.8 GB en el repo) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un MoE híbrido que combina una arquitectura GDN (Grouped Dense Network) con QSA (Quadratic Self-Attention), según la documentación de SGLang. El componente principal tiene 125B parámetros, complementado por una tabla n-gram de 51.2B parámetros (`per_layer_token_embd`) que actúa como lookup disperso, y un módulo MTP (Multi-Token Prediction) de 4B que no se incluye en esta cuantización (el conversor lo descarta, como hace vLLM). Solo 6B parámetros se activan por token, lo que permite una inferencia eficiente en hardware de memoria unificada.

El proceso de cuantización partió de un checkpoint oficial en FP8, se convirtió a Q8_0 intermedio y luego a Q4_0 con `--allow-requantize` (el paso Q8 introduce ruido de pérdida a 4 bits). Se aplicó una imatrix propia (calibración con mezcla de razonamiento grug-think, prosa IT y código, 926 entradas sobre 256 chunks) calculada sobre un intermedio Q4_K. La tabla PLE se cuantizó por separado con Q5_1 mediante override de `--tensor-type`. El autor declara que la validación de conversión se hizo con perplexity en un holdout italiano (Dante), obteniendo PPL 1.156 ± 0.006 en el runtime upstream y 1.095 en el runtime ROCmFPX, aunque aclara que ese texto está memorizado por el modelo base y el número solo sirve como comprobación de integridad de pesos (un modelo con pesos corruptos daría PPL ~250k).

## Capacidades

- Generación de texto y razonamiento: al ser una cuantización del modelo Qwen3.8-Flash-Next, hereda las capacidades del modelo base, que según el repositorio oficial destaca en tareas de programación y ofimática.
- Soporte de tool calling / function calling: no se especifica en la información proporcionada, pero el modelo base Qwen3.8 es compatible con herramientas (el comando de ejemplo usa `--jinja` para plantillas).
- Soporte de agentes y multi-step reasoning: no se detalla en la información disponible.
- Capacidades multilingües: el modelo base es multilingüe, aunque no se enumeran los idiomas concretos en la documentación consultada.
- Capacidades especiales: la arquitectura incluye una tabla n-gram PLE que mejora la predicción de tokens frecuentes, y un módulo MTP (no incluido aquí) que permite decodificación especulativa con drafter externo vía `-md`.

## Casos de uso

- Inferencia local en AMD Strix Halo: el caso principal es ejecutar el modelo en un equipo con Radeon 8060S y memoria unificada, usando el fork ROCmFPX de llama.cpp. El comando `llama-server` con `--n-gpu-layers 999` y `--flash-attn on` permite servir el modelo con una ventana de 8192 tokens y residente de ~64 GiB.
- Asistente de programación en local: gracias a las capacidades de coding del modelo base, puede usarse como copiloto de código sin conexión, con generación de código y explicaciones técnicas, aprovechando los 6B parámetros activos para una latencia razonable (22 tok/s en generación).
- Automatización de tareas ofimáticas: el modelo base está optimizado para tareas de oficina (redacción, resumen, análisis de documentos), por lo que esta cuantización permite desplegar un asistente local para procesamiento de texto y hojas de cálculo.
- Desarrollo y prueba de pipelines de inferencia en ROCm: al ser una cuantización de referencia para gfx1151, sirve como banco de pruebas para desarrolladores que trabajan con ROCmFP4 y el fork ROCmFPX, permitiendo validar kernels y optimizaciones.
- Investigación en MoE híbridos: la arquitectura con tabla n-gram y MTP es experimental (preview de Qwen4), por lo que investigadores pueden estudiar su comportamiento en hardware accesible sin depender de la nube.
- Despliegue en entornos con restricciones de memoria: con 4.78 BPW y un residente de ~64 GiB, es adecuado para equipos con 64-96 GiB de RAM unificada donde un modelo denso equivalente no cabría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo incluye benchmarks de rendimiento de inferencia en dispositivo (Radeon 8060S, ROCm 7.2.4, fork ROCmFPX, 999/999 capas, flash-attn activado, mediana de 3 ejecuciones con `llama-bench -t 16 -fa 1 -r 3`):

| test | tok/s | flags |
|---|---|---|
| tg128 | 22.03 ± 0.23 | `-b 2048` |
| pp2048 | 131.12 ± 21.74 | `-b 2048 -ub 512` |
| tg128 | 20.41 ± 0.17 | batch por defecto |
| pp512 | 85.99 ± 4.42 | batch por defecto |

El autor compara con la cuantización de referencia de kingjones777 (misma receta, sin imatrix): tg 22.6 tok/s y pp 345 tok/s, indicando que esta versión está a la par en generación pero tiene margen de mejora en prefill (primer corte de portabilidad).

## Requisitos de hardware

- VRAM estimada: ~64 GiB de memoria residente (memoria unificada en Strix Halo), con 98.47 GiB de archivo en disco.
- GPU recomendada: AMD Radeon 8060S (gfx1151) con ROCm 7.2.4 o superior. No cabe en GPUs consumer convencionales (RTX 4090 tiene 24 GB, insuficiente).
- Requiere el fork ROCmFPX de llama.cpp compilado con `-DGGML_HIP=ON -DGPU_TARGETS=gfx1151`; llama.cpp estándar no puede cargar los tipos de tensor.
- Opciones de despliegue: `llama-server` del fork ROCmFPX, con `--n-gpu-layers 999`, `--flash-attn on`, `--ctx-size 8192`, `--threads 16`, `--jinja`. Mantener `mmap` activado (por defecto) para evitar OOM en memoria unificada.
- Latencia y throughput: 22 tok/s en generación (tg128) y 131 tok/s en prefill (pp2048) con batch 2048, según los benchmarks del autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 176.9B | 6B | no disponible | qwen-community-1.0 | safetensors (FP8) | Modelo original, requiere GPU con mucha VRAM |
| Esta cuantización (pugant) | 176.9B | 6B | no disponible | qwen-community-1.0 | GGUF (ROCmFP4) | Optimizada para Strix Halo, con imatrix |
| Cuantización de referencia (kingjones777) | 176.9B | 6B | no disponible | qwen-community-1.0 | GGUF (ROCmFP4) | Misma receta sin imatrix, tg 22.6 tok/s, pp 345 tok/s |

No se dispone de datos de rendimiento de calidad para comparar con otros modelos de la misma categoría (p. ej., Qwen3.7-Plus) en la información proporcionada.

## Limitaciones y advertencias

- Requiere hardware específico: solo funciona en AMD Strix Halo (gfx1151) con el fork ROCmFPX de llama.cpp; no es compatible con llama.cpp estándar ni con GPUs NVIDIA.
- La validación de conversión (PPL 1.156/1.095) se realizó sobre un holdout memorizado por el modelo base, por lo que no es indicativa de calidad real; el autor lo declara explícitamente como comprobación de integridad de pesos.
- El módulo MTP no está incluido; la decodificación especulativa requiere un drafter externo (p. ej., la cabeza Q8_0 de la comunidad) vía `-md`.
- La tabla PLE es un lookup disperso; desactivar `mmap` provoca OOM en memoria unificada, según el autor.
- La licencia qwen-community-1.0 puede imponer restricciones de uso comercial; conviene revisar los términos en el enlace del modelo base.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) para esta cuantización, por lo que no se puede evaluar la degradación respecto al modelo base en tareas estándar.
- El modelo base puede presentar sesgos y alucinaciones inherentes a los LLM; no se ha realizado una evaluación específica en esta versión cuantizada.

## Enlaces

- Repositorio de esta cuantización: https://huggingface.co/pugant/Qwen3.8-Flash-Next-Q4_0_ROCMFP4_STRIX_LEAN-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Documentación de despliegue con SGLang: https://docs.sglang.io/cookbook/autoregressive/Qwen/Qwen3.8-Flash-Next
- PR de soporte de arquitectura en llama.cpp: https://github.com/ggml-org/llama.cpp/pull/27742
- Fork ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Cuantización de referencia (kingjones777): https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-ROCmFP4-STRIX_LEAN-GGUF
- Variante uncensored del mismo autor: https://huggingface.co/kingjones777/Qwen3.8-Flash-Next-Uncensored-ROCmFP4-STRIX_LEAN-GGUF
