# AzatAI/Qwen3.8-27B-FP8-dynamic

## Resumen

Qwen3.8-27B-FP8-dynamic es una cuantización comunitaria en FP8 del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario AzatAI. No se trata de un lanzamiento oficial de Qwen, sino de una conversión de pesos realizada con LLM Compressor 0.13.0 en formato `compressed-tensors`, pensada para reducir el espacio en disco de 55,6 GB (BF16) a unos 30 GB y permitir el despliegue del modelo completo, con caché KV en FP8 y la totalidad de su ventana de contexto de 262.144 tokens, en una única GPU de 48 GB.

El modelo subyacente es un transformer híbrido de la familia Qwen3.5 (identificador de arquitectura `qwen3_5`), con 27.781.427.952 parámetros totales y pipeline `image-text-to-text`, lo que implica capacidades de visión además de texto. La cuantización aplica FP8 E4M3 con escalas por canal en los pesos y escalas dinámicas por token en las activaciones, manteniendo en BF16 el codificador visual, los embeddings, el `lm_head` y la cabeza MTP (multi-token prediction) que habilita la decodificación especulativa.

Su relevancia práctica radica en la elección del esquema de cuantización: frente al FP8 block-128 del checkpoint oficial, que en vLLM requiere SM90 o superior para usar los kernels CUTLASS o DeepGEMM, el esquema por canal con activaciones dinámicas funciona sobre Ada (SM 8.9), incluyendo RTX 4090, RTX 6000 Ada y L40S, además de Hopper y Blackwell. Esto lo convierte en una opción útil para equipos con GPUs profesionales de generación Ada que quieran servir un modelo multimodal de 27B con contexto largo en hardware relativamente asequible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `qwen3_5` con Gated DeltaNet (atención lineal) y capas de atención estándar; incluye codificador visual y cabeza MTP |
| Parametros totales | 27.781.427.952 (27,78B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | FP8 E4M3 con escalas por canal en pesos y escalas dinámicas por token en activaciones; capas en BF16: codificador visual, `embed_tokens`, `lm_head`, cabeza MTP y proyecciones de compuerta `in_proj_a` / `in_proj_b` de Gated DeltaNet |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del modelo base, archivo LICENSE incluido sin cambios) |
| Formato de pesos | safetensors en formato `compressed-tensors`; incluye `model_mtp.safetensors`; tamaño del repo 67,2 GB, pesos en disco ~30 GB |

## Arquitectura y entrenamiento

La arquitectura corresponde al modelo base Qwen/Qwen3.8-27B: un transformer híbrido de la familia `qwen3_5` que combina capas de atención con capas Gated DeltaNet (atención lineal con estado recurrente). El checkpoint cuantizado conserva esa estructura y cuantiza únicamente los módulos `Linear` dentro de los bloques del transformer; las proyecciones `in_proj_qkv`, `in_proj_z` y `out_proj` de Gated DeltaNet pasan a FP8, mientras que las pequeñas compuertas `in_proj_a` e `in_proj_b` permanecen en BF16, replicando la partición del FP8 oficial de Qwen. También se mantienen en BF16 el codificador visual, `embed_tokens`, `lm_head` y los tensores `mtp.*`, lo que preserva la posibilidad de decodificación especulativa.

El proceso de cuantización se realizó con LLM Compressor 0.13.0 aplicando el esquema `FP8_DYNAMIC`, que no requiere datos de calibración, y se ejecutó en CPU (el autor indica que ~250 GB de RAM es un margen cómodo para el origen BF16 de 55,6 GB). No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, ni si hubo fases de RLHF o DPO; esos datos no están incluidos en la información proporcionada. La innovación técnica destacable de esta ficha es la elección de FP8 por canal frente a block-128 para habilitar los kernels CUTLASS FP8 en SM 8.9 (Ada) con CUDA 12.4 o superior, según la referencia al código de vLLM v0.19.0 (`cutlass_scaled_mm_supports_fp8` frente a `cutlass_scaled_mm_supports_block_fp8`).

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat propia y modo de razonamiento (thinking) activado por defecto en la plantilla, desactivable por petición.
- Comprensión de imágenes y texto combinados (pipeline `image-text-to-text`), con codificador visual mantenido en BF16.
- Generación de código: el autor reporta 96,3 en HumanEval y 91,5 en HumanEval+ con decodificación greedy y thinking desactivado.
- Tool calling / function calling: soportado en vLLM mediante `--enable-auto-tool-choice` y el parser `qwen3_coder`; el autor verifica que una llamada a herramienta con entrada visual pasa.
- Razonamiento multi-paso y agentes: compatible con el parser de razonamiento `qwen3` y con decodificación especulativa MTP, que acelera cargas de generación de código (hasta 103 tok/s en TP=2 según las mediciones del autor).
- Recuperación en contexto largo: el autor reporta una prueba correcta de recuperación de una línea concreta en un prompt de 224.071 tokens.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Asistencia de código en producción: con 96,3 en HumanEval y soporte de tool calling, el modelo puede integrarse en pipelines de CI/CD para generar parches, escribir tests de pytest y resolver tareas de refactorización; la decodificación especulativa MTP eleva el rendimiento a 103 tok/s en configuraciones TP=2 según las mediciones del autor.
- Análisis de documentos largos con imágenes: la ventana de 262.144 tokens y el codificador visual permiten procesar informes, contratos o expedientes completos con figuras y tablas incrustadas en una sola pasada, sin trocear el contexto.
- Agentes autónomos con herramientas: el soporte de `qwen3_coder` como parser de tool calls y el modo thinking permiten construir bucles de razonamiento multi-paso con invocación de APIs externas, con la opción de desactivar el razonamiento para reducir latencia en tareas simples.
- Atención al cliente multimodal: conversaciones multi-turno con contexto largo, donde el cliente puede adjuntar capturas o fotos de producto; el modelo mantiene el hilo gracias a la ventana extendida y a la caché de prefijos habilitada en vLLM.
- Despliegue en hardware Ada de gama profesional: al usar kernels CUTLASS FP8 en SM 8.9, encaja en servidores con RTX 6000 Ada o L40S de 48 GB, un perfil habitual en equipos que no tienen acceso a Hopper.
- Extracción de información estructurada sobre corpus extensos: la prueba de recuperación en 224.071 tokens sugiere viabilidad para localizar datos concretos en bases documentales grandes, con la latencia asociada (161 s en la medición del autor para ese prompt).
- Prototipado e investigación con presupuesto de VRAM ajustado: al caber en una sola GPU de 48 GB con contexto completo y caché KV en FP8, permite experimentar con un modelo multimodal de 27B sin clúster multi-GPU.

## Benchmarks y rendimiento

Datos publicados por el autor de la cuantización. No se han publicado resultados de benchmarks del modelo base en la información disponible.

| Metrica | Valor |
|---|---|
| HumanEval (EvalPlus, greedy, thinking off) | 96,3 |
| HumanEval+ (EvalPlus, greedy, thinking off) | 91,5 |
| Decode, código, MTP k=3, 1x RTX 6000 Ada | 55,9 tok/s |
| Decode, prosa, MTP k=3, 1x RTX 6000 Ada | 39,6 tok/s |
| Decode, entrada de 16K tokens, MTP k=3, 1x RTX 6000 Ada | 32,5 tok/s |
| Prompt de 224.071 tokens, recuperar una línea | correcto, 161 s |
| Llamada a herramienta con visión | pasa |
| Decode, prosa, TP=2 sin MTP | 38,7 tok/s |
| Decode, prosa, TP=2 con MTP k=3 | 63,3 tok/s |
| Decode, código (pytest), TP=2 con MTP k=3 | 103 tok/s |
| Decode, chat muestreado (temp. 0,7), TP=2 con MTP k=3 | 50-71 tok/s |
| Prompt de 36K tokens, tiempo hasta 16 tokens de salida, sin caché | 10,2 s (sin MTP) / 9,6 s (con MTP, chunk 32768) |
| Mismo prompt con prefix caching | 0,7 s (sin MTP) / 0,6 s (con MTP) |
| Aceptación MTP | 2,56 tokens por paso en prosa (por posición 0,75 / 0,49 / 0,33); 3,6 en código |

## Requisitos de hardware

- VRAM estimada: ~30 GB de pesos en FP8; el autor indica que pesos, caché KV en FP8 y contexto completo de 262.144 tokens caben en una GPU de 48 GB.
- GPU recomendadas: RTX 6000 Ada, L40S o RTX 4090 (Ada, SM 8.9) para aprovechar los kernels CUTLASS FP8; también funciona en Hopper (H100) y Blackwell. En SM 8.9 requiere CUDA 12.4 o superior.
- Cabe en consumer GPU: sí en RTX 4090 (24 GB) solo si se reduce contexto y número de secuencias; el escenario medido por el autor es una RTX 6000 Ada de 48 GB.
- Despliegue: vLLM >= 0.17.0 (el autor usa 0.31.0 en las mediciones de una GPU y 0.19.0 en TP=2); formato `compressed-tensors`. No se mencionan otras opciones como llama.cpp, Ollama o TGI.
- Ajuste crítico de memoria: mantener `--max-num-seqs` bajo (32 en el ejemplo del autor), porque cada slot de secuencia reserva un estado fijo de Gated DeltaNet; con el número por defecto, el profiler de CUDA graphs pide unos 13 GiB adicionales y el arranque se queda sin memoria. Con 32 slots, la caché KV aloja 354.406 tokens.
- Latencia y throughput: ver tabla de benchmarks; en TP=2 con dos RTX 6000 Ada se usan 45,4 GB por tarjeta con utilización 0,9 y quedan 23,9 GiB (sin MTP) o 20,9 GiB (con MTP) de caché KV por tarjeta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| AzatAI/Qwen3.8-27B-FP8-dynamic | 27,78B | 262.144 | FP8 por canal, activaciones dinámicas | Apache-2.0 | Cuantización comunitaria; kernels CUTLASS FP8 en Ada, Hopper y Blackwell |
| Qwen/Qwen3.8-27B | 27,78B | 262.144 | BF16 | Apache-2.0 | Modelo base; 55,6 GB en disco |
| Qwen/Qwen3.8-27B-FP8 (oficial) | 27,78B | 262.144 | FP8 block-128 | Apache-2.0 | En vLLM, block-128 requiere SM90+ para CUTLASS/DeepGEMM; en Ada cae a un kernel Triton |

No se dispone de datos de benchmarks de los dos checkpoints de Qwen en la información proporcionada, por lo que no se puede comparar rendimiento numérico entre ellos más allá de la equivalencia en HumanEval+ que el autor señala entre v1 y v2 de su cuantización.

## Limitaciones y advertencias

- Es una cuantización comunitaria, no oficial de Qwen; el autor lo indica explícitamente y conviene validar el comportamiento antes de usarla en producción.
- La cuantización FP8 puede introducir degradaciones frente al BF16 en tareas sensibles; el autor solo aporta comparación de HumanEval+ entre sus propias versiones v1 y v2, no frente al modelo base.
- El rendimiento medido se limita a HumanEval/HumanEval+, pruebas de recuperación en contexto largo y latencia; no hay datos publicados de MMLU, GSM8K u otros benchmarks en la información disponible.
- Idiomas soportados no disponibles: no se puede confirmar la cobertura multilingüe del modelo base a partir de esta ficha.
- En una sola GPU hay que limitar `--max-num-seqs`; con los valores por defecto el arranque agota la memoria por la reserva de estado de Gated DeltaNet.
- Bajo decodificación especulativa, vLLM ignora `min_p` y `logit_bias`, lo que afecta al control fino de la generación.
- El modo thinking está activado por defecto en la plantilla de chat; si no se desactiva, aumenta la latencia y el consumo de tokens de salida.
- Riesgo de alucinación y sesgos: no se documentan en la información proporcionada; deben asumirse los del modelo base, no evaluados aquí.
- Licencia Apache-2.0 permite uso comercial, pero se hereda del modelo base y el archivo LICENSE se incluye sin modificar; conviene revisar los términos upstream antes de un despliegue comercial.
- El repo ocupa 67,2 GB en total, aunque los pesos en FP8 son ~30 GB; hay que prever ese espacio en disco y en la caché de descarga.

## Enlaces

- Hugging Face: https://huggingface.co/AzatAI/Qwen3.8-27B-FP8-dynamic
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Licencia upstream: https://huggingface.co/Qwen/Qwen3.8-27B/blob/main/LICENSE
- LLM Compressor: https://github.com/vllm-project/llm-compressor
- DOI: https://doi.org/10.57967/hf/9989
