# leoncca/Qwen3.8-Flash-Next-NVFP4-QSA-FP8-E4M3-KV-Scales

## Resumen

Este repositorio, publicado por leoncca, no contiene un modelo completo, sino un paquete de calibración de escalas para la caché KV del checkpoint cuantizado `RadixArk/Qwen3.8-Flash-Next-NVFP4`, que a su vez es una cuantización NVFP4 del modelo Qwen3.8-Flash-Next de Qwen. El paquete incluye 24 tensores FP32 de escala (2,64 kB) que permiten convertir la caché KV principal del modelo a formato FP8 E4M3, con el objetivo de ejecutar el modelo en GPUs NVIDIA V100 (SM70) mediante una versión modificada de vLLM (1Cat-vLLM).

La relevancia de este trabajo radica en que Qwen3.8-Flash-Next es un modelo MoE ultra-sparse de 125B parámetros (6B activos por token) con arquitectura híbrida Gated DeltaNet + Qwen Sparse Attention, y su ejecución en hardware antiguo como V100 es un reto importante. Este paquete de escalas, junto con los parches de 1Cat-vLLM, permite ampliar la capacidad de contexto efectiva en memoria: 507 093 tokens FP16-KV frente a 931 100 tokens E4M3-KV (1,836x más), manteniendo la fidelidad de salida. No es un checkpoint independiente: requiere descargar la revisión exacta del base y materializar una vista derivada con el script incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (paquete de escalas; el modelo base es MoE ultra-sparse con Gated DeltaNet y Qwen Sparse Attention) |
| Parametros totales | No disponible (el modelo base tiene 125B, incluyendo tabla de embeddings N-gram de 51B) |
| Parametros activos | 6B por token (del modelo base) |
| Longitud de contexto | 128K validado (máximo configurado: 131328 tokens) |
| Tipos de cuantizacion | FP8 E4M3 para caché KV (escalas calibradas); NVFP4 para pesos del modelo base |
| Idiomas soportados | No disponible (calibración incluyó chino, inglés y código) |
| Licencia | other (seguir términos del modelo base y fuente) |
| Formato de pesos | safetensors (archivo `model-kvscales.safetensors` con 24 tensores FP32) |

## Arquitectura y entrenamiento

Este repositorio no contiene un modelo entrenado ni pesos de red. Es un paquete de escalas de calibración para la caché KV del checkpoint `RadixArk/Qwen3.8-Flash-Next-NVFP4`, que es una cuantización NVFP4 de Qwen3.8-Flash-Next. El modelo base, según la documentación de Qwen, es un MoE ultra-sparse de 125B parámetros con 6B activos por token, que combina cuatro ideas principales: Gated DeltaNet (tres de cada cuatro capas comprimen el historial) y Qwen Sparse Attention (la cuarta capa realiza recuperación de largo alcance), además de mejoras en residual, embedding y optimización. Es multimodal.

La calibración de las escalas se realizó recopilando activaciones KV con caché FP16 durante forwards de inferencia normales, excluyendo forwards de perfilado o captura de grafos. La distribución de calibración cubrió chino, inglés, código, diálogo multi-turno, uso de herramientas y contextos de 1K, 16K, 64K y 128K. El contrato de conversión es `stored = e4m3fn(x / scale)` y `reconstructed = stored * scale`, con `scale = observed_max_envelope / 448`. Las 24 escalas FP32 van de `0.0171247218` a `0.0841238871`, sin saturación observada. El paquete está vinculado a una revisión exacta del checkpoint base (hash SHA-256 verificado) y no es genérico para otras revisiones.

## Capacidades

- No es un modelo autónomo: es un complemento de calibración para la caché KV del modelo base cuantizado NVFP4.
- Permite habilitar caché KV FP8 E4M3 en GPUs NVIDIA V100 (SM70) con 1Cat-vLLM, algo no soportado por vLLM estándar.
- Soporta contextos de hasta 128K tokens con calidad validada (retrieval perfecto en pruebas de inserción al 0%, 50% y 100%).
- Mantiene la fidelidad de salida: coseno de 0.999311 en la salida del núcleo QSA, RMSE relativo de 0.0324132.
- Compatible con tool calling: en pruebas de selección de herramientas retenidas, 10/12 aciertos sin regresiones de corrección.
- Requiere tensor parallel size 4, MTP deshabilitado, activaciones FP16 y FP16 para los índices QSA crudos y comprimidos.
- El runtime falla de forma segura si no se cargan explícitamente los 24 tensores de escala finitos y positivos.

## Casos de uso

- Despliegue de Qwen3.8-Flash-Next en clústeres de V100: permite ejecutar un modelo de 125B parámetros en GPUs con solo 16 GB de memoria cada una, usando 4 GPUs en paralelo tensorial, algo inviable sin cuantización de caché KV.
- Inferencia con contexto largo en hardware legacy: con la caché E4M3 se duplica casi la capacidad de tokens en memoria (1,836x), lo que habilita tareas de recuperación sobre documentos de hasta 128K tokens en V100.
- Evaluación de calidad de cuantización KV: el paquete incluye manifiestos de calibración y validación que permiten auditar el impacto de la cuantización FP8 E4M3 frente a FP16.
- Investigación sobre sparse attention en GPUs antiguas: el soporte QSA E4M3 en 1Cat-vLLM (PR #447 y #452) es un banco de pruebas para estudiar el comportamiento de Qwen Sparse Attention en hardware sin soporte nativo para FP8.
- Integración en pipelines de tool calling: la validación con 10/12 aciertos en selección de herramientas sugiere que el modelo cuantizado puede usarse en agentes que requieran function calling, siempre que se respete la configuración exacta validada.
- Benchmarking de rendimiento en V100: la matriz de rendimiento (concurrencia 1/4/8 por contexto 1K-128K) proporciona datos de throughput y latencia para planificar capacidad en entornos de producción con V100.

## Benchmarks y rendimiento

La model card del repositorio incluye resultados de validación específicos para la cuantización E4M3 frente a FP16 en V100:

| Metrica | Resultado |
|---|---|
| Retrieval 128K (inserción 0%, 50%, 100%, dos veces cada una) | 6/6 aciertos para FP16 y E4M3, con salidas token-idénticas |
| Selección de herramientas retenidas | 10/12 para ambos modos, sin regresiones de corrección, primeros tokens idénticos en 12/12 |
| Solapamiento de bloques seleccionados (Jaccard medio por fila) | 0.990783 |
| Recall FP16 | 0.995301 |
| Micro Jaccard | 0.987579 |
| Salida del núcleo QSA (coseno) | 0.999311 |
| Salida del núcleo QSA (L2 relativo) | 0.0324132 |
| Salida del núcleo QSA (RMSE) | 0.0160753 |
| Throughput de decodificación (contextos >= 16K) | 2.94% menor en E4M3 frente a FP16 |
| Tiempo total fin a fin (contextos >= 16K) | 3.38% mayor en E4M3 frente a FP16 |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- GPU: NVIDIA Tesla V100 (SM70) obligatoria; validado con tensor parallel size 4 (4 GPUs).
- VRAM: no se especifica el consumo exacto, pero la configuración validada usa `--gpu-memory-utilization 0.89` y soporta 931 100 tokens E4M3-KV en el mismo presupuesto de memoria que 507 093 tokens FP16-KV.
- Memoria total del sistema: no disponible; se asume al menos 4x16 GB de VRAM (V100 estándar).
- Software: 1Cat-vLLM con PR #447 (y opcionalmente #452); no es cargable por vLLM upstream ni por 1Cat-vLLM sin parche.
- Configuración validada: `--dtype half`, `--tensor-parallel-size 4`, `--max-model-len 131328`, `--max-num-seqs 8`, `--max-num-batched-tokens 8192`, `--kv-cache-dtype fp8_e4m3`, `--enable-chunked-prefill`, `--no-enable-prefix-caching`, `--language-model-only`, `--no-async-scheduling`.
- Variables de entorno requeridas: `VLLM_SM70_NVFP4_TURBOMIND=1`, `VLLM_SM70_NVFP4_MOE_GROUPED_PREFILL=1`, `VLLM_SM70_QWEN4_EXP_ONLINE_QPN8=1`, `VLLM_1CAT_DISABLE_SM70_MTP_DEFAULTS=1`.
- Latencia y throughput: no se proporcionan cifras absolutas; solo comparativas relativas (E4M3 ~2.94% menor throughput de decodificación y ~3.38% mayor tiempo fin a fin en contextos >= 16K).

## Comparativa con modelos similares

No hay una comparativa directa con otros paquetes de escalas KV, ya que este es un artefacto especializado. Se puede comparar con el modelo base sin cuantización KV:

| Modelo | Parametros | Contexto | Caché KV | Hardware objetivo | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next (base) | 125B (6B activos) | 256K (según Qwen) | FP16 | GPUs modernas con soporte FP8 | Apache 2.0 (según Qwen) |
| RadixArk/Qwen3.8-Flash-Next-NVFP4 | 125B (6B activos) | No disponible | FP16 | GPUs con soporte NVFP4 (H100, etc.) | other |
| leoncca/Qwen3.8-Flash-Next-NVFP4-QSA-FP8-E4M3-KV-Scales | No aplica (escalas) | 128K validado | FP8 E4M3 | V100 (SM70) con 1Cat-vLLM | other |

La comparativa con otros modelos de la misma categoría (MoE ultra-sparse con atención sparse) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El paquete de escalas está vinculado a una revisión exacta del checkpoint base (`7b719225242aacd3dbd3f9407468c2ee9a9d2594`); no debe usarse con otras revisiones. El materializador verifica el hash del índice antes de crear la vista.
- No es cargable por vLLM estándar ni por 1Cat-vLLM sin los parches PR #447 y #452; el runtime falla de forma segura si no se cargan los 24 tensores de escala.
- TP8, MTP, prefix caching, paridad graph-versus-eager y contexto de 256K no han sido validados ni aceptados.
- El conjunto de herramientas retenido es una puerta de regresión de primera fase, no una aceptación de producción amplia.
- Las escalas no son genéricas para Qwen3.8 ni para QSA; son específicas de este checkpoint y esta calibración.
- Este repositorio no redistribuye el modelo base; se deben seguir los términos de licencia del modelo base y fuente (licencia "other").
- La validación de rendimiento incluye una segunda variable: FP16 XQA usó P1024 mientras que E4M3 genérico usó P256, por lo que la comparativa de rendimiento no es puramente atribuible a la cuantización.
- No se han publicado datos sobre sesgos, alucinación o comportamiento en idiomas distintos de los calibrados (chino, inglés, código).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/leoncca/Qwen3.8-Flash-Next-NVFP4-QSA-FP8-E4M3-KV-Scales
- Checkpoint base: https://huggingface.co/RadixArk/Qwen3.8-Flash-Next-NVFP4
- Repositorio oficial de Qwen3.8-Flash-Next: https://github.com/QwenLM/Qwen3.8-Flash-Next/
- Cuantización NVFP4 de referencia: https://huggingface.co/lesj0610/Qwen3.8-Flash-Next-NVFP4
- Vista del árbol de archivos de Inferact (misma cuantización): https://huggingface.co/Inferact/Qwen3.8-Flash-Next-NVFP4/tree/main
- Receta vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
- Despliegue en DGX Spark con SGLang: https://github.com/MiaAI-Lab/Qwen3.8-Flash-Next-Dual-DGX-Sparks
- PR de soporte QSA E4M3 en 1Cat-vLLM: https://github.com/1CatAI/1Cat-vLLM/pull/447
- PR opcional de Triton: https://github.com/1CatAI/1Cat-vLLM/pull/452
