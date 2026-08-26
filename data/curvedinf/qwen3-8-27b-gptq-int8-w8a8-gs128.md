# curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128

## Resumen

El modelo `curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128` es una cuantización GPTQ de 8 bits (W8A8, group size 128) del modelo denso multimodal Qwen3.8-27B de Alibaba, realizada por el usuario curvedinf. El checkpoint resultante está optimizado para ejecutarse en hardware AMD Instinct MI100 (gfx908 / CDNA1) mediante un stack de servido específico basado en un fork de vLLM y la librería AITER, que activa kernels de multiplicación de matrices int8 nativos en todas las capas. Su objetivo principal es permitir la inferencia eficiente de un modelo de 27 000 millones de parámetros en GPUs AMD de generación anterior, donde la tasa de cómputo int8 duplica a la de fp16 con la mitad de ancho de banda de memoria.

El modelo base Qwen3.8-27B emplea una arquitectura híbrida densa con 64 capas, de las cuales 48 usan atención lineal (GDN) y 16 atención completa, con una ventana de contexto de 262 144 tokens. Esta cuantización mantiene los pesos del vision encoder y del módulo MTP en BF16, y el lm_head en fp16, mientras que el resto de la red se cuantiza a int8. Está diseñado para funcionar junto con un modelo draft DFlash2 para decodificación especulativa, lo que reduce la latencia en tareas de generación larga. La licencia Apache 2.0 permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida densa multimodal (model_type `qwen3_5`): 48 capas GDN linear-attention + 16 capas full-attention (patrón 3:1), hidden size 5120, vocab 248 320 |
| Parametros totales | 27 781 427 952 (27,78 B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 144 tokens (configuración de servido recomendada: 65 536) |
| Tipos de cuantizacion | GPTQ INT8 W8A8, group size 128, simétrico, desc_act false, true_sequential true, lm_head en fp16, vision encoder y MTP en BF16 |
| Idiomas soportados | No disponible (no especificado en la documentación del autor) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer híbrido denso que combina atención lineal recurrente (GDN) con atención completa. De las 64 capas, solo 16 ejecutan atención completa (intervalo `full_attention_interval: 4`), mientras que las 48 restantes usan atención lineal con un estado recurrente constante. Esta mezcla reduce el coste cuadrático de la atención y permite ventanas de contexto muy largas (262 144 tokens) con un coste de memoria razonable. El checkpoint cuantizado incluye también los pesos del vision encoder y del módulo MTP (Multi-Token Prediction) en BF16, aunque el servido recomendado usa solo el modelo de lenguaje (`--language-model-only`).

La cuantización se realizó con GPTQModel 7.3.4, sin RTN (Hessian-compensated), con calibración sobre 512 muestras mezclando evol-codealpaca-v1 (código) y C4 (texto general), con longitudes de secuencia entre 256 y 2048 tokens. El autor validó la calidad mediante un barrido de divergencia KL (teacher-forced) sobre seis configuraciones de precisión; la configuración elegida (GS128) obtuvo una KLD de 0,011 frente a la referencia GS32, con un coste adicional de +0,0032 por la cuantización de activaciones. El stack de servido requiere un fork específico de vLLM (`curvedinf/int8-vllm`) y AITER (`curvedinf/int8-aiter`) que activan GEMMs int8×int8 en todas las capas, incluyendo embedding, KV cache y atención unificada.

## Capacidades

- Generación de texto y razonamiento multilingüe (el modelo base Qwen3.8 soporta múltiples idiomas, aunque la documentación de esta cuantización no los detalla).
- Generación de código y asistencia en programación, con soporte para tool calling y function calling (capacidad heredada del modelo base, orientado a agentes y flujos de trabajo de automatización).
- Razonamiento multi-paso y ejecución de tareas agénticas de largo horizonte, gracias a la ventana de contexto de 262 144 tokens y al entrenamiento específico de Qwen3.8 para agentes.
- Procesamiento de imágenes (el checkpoint incluye vision encoder, aunque el servido recomendado lo desactiva; el pipeline declarado es `image-text-to-text`).
- Decodificación especulativa con el modelo draft DFlash2 (15 tokens especulativos), que acelera la generación en hardware AMD.
- Cuantización int8 nativa (W8A8) con group size 128, optimizada para GPUs AMD gfx908, con activaciones cuantizadas dinámicamente a int8 en cada GEMM.

## Casos de uso

- Despliegue de un asistente de código en clústeres AMD Instinct MI100: el modelo puede integrarse en un servicio vLLM con tensor parallelism 4 y decodificación especulativa, ofreciendo generación de código con baja latencia en hardware AMD de generación anterior.
- Automatización de oficina y procesamiento de documentos largos: gracias a la ventana de contexto de 262 144 tokens (configurable a 65 536 en servido), puede resumir, extraer y transformar documentos extensos, como informes anuales o expedientes, en una sola pasada.
- Agentes autónomos de largo horizonte: el modelo base está diseñado para tareas agénticas multi-paso; esta cuantización permite ejecutarlo en GPUs AMD sin necesidad de hardware NVIDIA, reduciendo el coste de infraestructura.
- Investigación académica sobre eficiencia de cuantización: el checkpoint sirve como referencia para estudiar el impacto de la cuantización int8 con group size 128 en modelos híbridos de atención lineal, ya que el autor publica el ledger de experimentos y el script de cuantización.
- Servicio de chat conversacional con contexto largo: el modelo puede gestionar conversaciones multi-turno con historial extenso, manteniendo coherencia gracias a la atención lineal recurrente y a la KV cache int8.
- Evaluación de decodificación especulativa en ROCm: el par target/draft permite probar la aceleración de generación con 15 tokens especulativos en entornos AMD, comparando throughput y latencia frente a decodificación autoregresiva estándar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card únicamente reporta una divergencia KL de 0,011 frente a la configuración de referencia GS32, y un incremento de +0,0032 por la cuantización de activaciones, medidos con un barrido teacher-forced. No hay datos de latencia ni throughput publicados.

## Requisitos de hardware

- VRAM estimada: los pesos cuantizados a int8 ocupan aproximadamente 27,8 GB (27,78 B × 1 byte), más overhead de activaciones y KV cache. Con tensor parallelism 4, cada GPU MI100 (32 GB HBM2) aloja unos 7 GB de pesos, dejando espacio para KV cache y activaciones.
- GPU recomendadas: AMD Instinct MI100 (gfx908 / CDNA1) validado; el stack está específicamente tuneado para esta arquitectura. No se garantiza funcionamiento en otras GPUs AMD o NVIDIA.
- No cabe en GPUs de consumo típicas (RTX 4090 con 24 GB podría alojar el modelo de lenguaje solo, pero el stack de servido no está diseñado para CUDA y el checkpoint incluye pesos de visión adicionales).
- Opciones de despliegue: fork de vLLM (`curvedinf/int8-vllm`) con AITER (`curvedinf/int8-aiter`), usando el comando de servido documentado con `--tensor-parallel-size 4`, `--kv-cache-dtype int8_per_token_head` y `--speculative-config` para el draft DFlash2.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,78 B | 262 144 | BF16 | Apache 2.0 | GPUs NVIDIA/AMD genéricas |
| curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128 | 27,78 B | 262 144 (servido a 65 536) | GPTQ INT8 W8A8 GS128 | Apache 2.0 | AMD MI100 (gfx908) |
| Qwen3.8 MoE (2,4 T) | 2,4 T (activos no especificados) | 262 144 | No disponible | Apache 2.0 | No disponible |

La comparativa se limita a la familia Qwen3.8, ya que no se dispone de datos de otras cuantizaciones de modelos similares en la información proporcionada. La principal diferencia frente al modelo base es la reducción de memoria y el aumento de throughput en hardware AMD, a costa de una ligera pérdida de calidad (KLD 0,011). Frente al MoE de 2,4 T, este modelo denso es mucho más ligero y desplegable en hardware modesto.

## Limitaciones y advertencias

- La cuantización int8 introduce una degradación de calidad medida en KLD 0,011 frente a la referencia GS32; aunque el autor la considera aceptable, puede afectar a tareas de alta precisión.
- El stack de servido es extremadamente específico: requiere los forks de vLLM y AITER de curvedinf, y la configuración exacta documentada (TP4, C8, KV int8, decodificación especulativa con DFlash2). No funcionará con vLLM estándar ni con otras configuraciones sin modificaciones.
- Solo validado en AMD Instinct MI100 (gfx908). No hay garantías de funcionamiento en otras GPUs AMD (p. ej., MI200, MI300) ni en NVIDIA.
- El checkpoint incluye el vision encoder, pero el servido recomendado lo desactiva (`--language-model-only`); las capacidades multimodales no están disponibles en la configuración de producción.
- La ventana de contexto máxima del modelo es 262 144 tokens, pero el comando de servido recomendado limita `--max-model-len` a 65 536; superar ese valor puede requerir ajustes adicionales de memoria.
- El modelo draft DFlash2 es un componente obligatorio para la decodificación especulativa; si no se usa, el rendimiento puede degradarse y la configuración de KV cache podría no ser óptima.
- No se han publicado resultados de benchmarks estándar, por lo que el rendimiento real en tareas como MMLU o HumanEval es desconocido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/curvedinf/Qwen3.8-27B-GPTQ-INT8-W8A8-GS128
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8-27B (Alibaba): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Repositorio de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Página de vLLM Recipes para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Fork de vLLM con soporte int8 (curvedinf): https://github.com/curvedinf/int8-vllm
- Fork de AITER con kernels int8 (curvedinf): https://github.com/curvedinf/int8-aiter
- Modelo draft DFlash2: https://huggingface.co/curvedinf/Qwen3.8-27B-DFlash2-GPTQ-INT8-W8A8-GS128
