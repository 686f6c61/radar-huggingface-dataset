# Lynxpda/micro-qwen4exp

## Resumen

`micro-qwen4exp` es un modelo de depuración y profiling creado por Lynxpda que reproduce la arquitectura real del modelo Qwen3.8 Flash Next (también conocido como `qwen4exp`) de Alibaba, pero con pesos inicializados aleatoriamente. Su propósito no es la generación de texto, sino servir como banco de pruebas para el desarrollo y la optimización del soporte de esta arquitectura en `llama.cpp`, especialmente en lo relativo a la atención dispersa QSA (sparse attention) y las capas densas con puerta GDN (gated dense attention).

El modelo está disponible en formato GGUF v3 y ocupa aproximadamente 324 MB en su variante recomendada, lo que permite ejecutar pruebas de rendimiento y correctitud en segundos, en lugar de los minutos que requeriría el modelo completo de ~103 GB. Incluye todas las subarquitecturas del modelo real —GDN, QSA, SSM, MoE con expertos compartidos, compresión de cabezas y PLE— con dimensiones reducidas pero manteniendo los parámetros críticos de QSA (top_k = 2048, compress_ratio = 4) que determinan la curva de degradación de rendimiento con el contexto.

La licencia es MIT, lo que facilita su uso en entornos de desarrollo y CI. No se han publicado datos de entrenamiento ni de calidad, ya que el modelo no está entrenado y no debe utilizarse para ninguna tarea de inferencia real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida: GDN (gated dense attention), QSA (sparse attention), SSM (conv + state + dt), MoE con expertos compartidos, head compression, PLE |
| Parametros totales | 149.266.080 (según safetensors); 161,70 M según la model card para el archivo `realqsa` |
| Parametros activos | 2 de 8 expertos (MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | F16 (archivos GGUF) |
| Idiomas soportados | no disponible (tokenizer no entrenado) |
| Licencia | MIT |
| Formato de pesos | GGUF v3 (single file, mmap-friendly) |

## Arquitectura y entrenamiento

La arquitectura es una réplica a escala reducida del modelo Qwen3.8 Flash Next. Consta de 12 capas (frente a las 48 del modelo completo), con dimensión de embedding de 384 (frente a 2560), 24 cabezas de atención y 2 cabezas KV. La atención QSA utiliza un indexador con `head_count = 1`, `key_length = 128` y `top_k = 2048`, con un `compress_ratio` de 4, lo que satura la ventana dispersa en ~8192 celdas, igual que el modelo real. Las capas SSM tienen `d_state = 16` y `d_inner = 256`. El vocabulario se reduce a 32768 tokens (frente a 248320 del original).

El modelo no ha sido entrenado: todos los pesos son ruido aleatorio generado por el script `mk_micro_gguf.c`, que escribe el GGUF directamente con los nombres y formas de tensores reales (297 tensores en la división UD-Q4_K_XL del modelo completo). No hay datos de entrenamiento, ni tokenizer entrenado, ni proceso de RLHF o DPO. La única innovación técnica relevante es la fidelidad de las dimensiones QSA, que permite reproducir la misma curva de degradación de rendimiento con el contexto que el modelo completo.

## Capacidades

- Profiling de rendimiento: permite medir velocidad de decodificación y evaluación de prompt con `llama-bench` en distintos backends (Vulkan, CUDA, CPU).
- Pruebas de correctitud de backend: compatible con `test-llama-archs` y `test-backend-ops` para verificar la implementación de operadores QSA (TOPK_QSA).
- Depuración de gráficos de computación, uso de memoria y código del indexador de atención.
- Reproducción de la curva de degradación de rendimiento con el contexto (de 2048 a 65536 tokens) idéntica a la del modelo completo.
- No genera texto coherente: los pesos aleatorios producen salida basura.
- No soporta tool calling, agentes, visión, audio ni ninguna capacidad de razonamiento.

## Casos de uso

- Profiling de velocidad en `llama.cpp`: ejecutar `llama-bench -m micro-qwen4exp-realqsa.gguf -ngl 999 -fa 1 -d 2048,8192,32768,65536` para medir tokens por segundo en decodificación y evaluación de prompt, comparando backends.
- Pruebas de regresión de rendimiento a largo contexto: verificar que los cambios en el indexador QSA o en Flash Attention no introducen regresiones superlineales en la latencia al aumentar la ventana de contexto.
- Validación de backends en CI: integrar `test-llama-archs -m micro-qwen4exp-realqsa.gguf -b Vulkan0` en pipelines de integración continua para detectar fallos de correctitud en implementaciones de GPU o CPU.
- Depuración de kernels de atención dispersa: usar `test-backend-ops -b Vulkan0 -o TOPK_QSA` para aislar errores en el operador de atención sparse.
- Desarrollo de nuevas arquitecturas híbridas: el modelo sirve como banco de pruebas para experimentar con la combinación de GDN, SSM y MoE sin necesidad de descargar el modelo completo de 103 GB.
- Pruebas de memoria y gestión de KV cache: al ser pequeño, permite inspeccionar el uso de memoria del cache de atención en contextos largos (hasta 262144 tokens) en máquinas con recursos limitados.

## Benchmarks y rendimiento

La model card incluye mediciones realizadas con `llama-bench` en una AMD Radeon (RADV Strix Halo, Vulkan) con el archivo `micro-qwen4exp-realqsa.gguf`:

| Profundidad de contexto | Decodificación (tg128) | Evaluación de prompt (pp512) |
|---|---|---|
| 2048 | ~590 t/s | ~24000 t/s |
| 16384 | ~490 t/s | ~9100 t/s |
| 32768 | ~425 t/s | ~5000 t/s |
| 65536 | ~340 t/s | ~3000 t/s |

Estos valores reproducen la misma forma de degradación que el modelo completo, con saltos superlineales en los mismos puntos debido a la saturación del indexador QSA. No se han publicado benchmarks de calidad (MMLU, HumanEval, etc.) porque el modelo no es funcional para inferencia.

## Requisitos de hardware

- VRAM estimada: menos de 1 GB (el archivo pesa 324 MB en F16).
- GPU recomendadas: cualquier GPU con soporte Vulkan o CUDA; también funciona en CPU.
- Cabe en cualquier GPU de consumo (RTX 3060, RTX 4090, etc.) y en iGPUs modernas.
- Opciones de despliegue: `llama.cpp` (versión ~b10600 o superior con soporte qwen4exp), `llama-bench`, `test-llama-archs`, `test-backend-ops`.
- Latencia y throughput: los datos de la tabla anterior son orientativos para una GPU integrada Radeon; en GPUs discretas los valores serán superiores.

## Comparativa con modelos similares

No existen modelos comparables en la misma categoría, ya que `micro-qwen4exp` es un artefacto de depuración sin pesos entrenados. La comparación más relevante es con el modelo completo Qwen3.8 Flash Next:

| Característica | micro-qwen4exp | Qwen3.8 Flash Next (completo) |
|---|---|---|
| Parámetros | ~150-162 M | ~125 B (estimado) |
| Tamaño del archivo | 324 MB (F16) | ~103 GB (Q4_K_XL) |
| Capas | 12 | 48 |
| Contexto | 262144 | 262144 |
| Pesos | Aleatorios | Entrenados |
| Uso | Depuración/profiling | Inferencia real |
| Licencia | MIT | Apache 2.0 (según el modelo original) |

No se dispone de información sobre otros micro modelos de depuración con arquitectura qwen4exp.

## Limitaciones y advertencias

- Pesos aleatorios: el modelo produce texto basura y no debe usarse para ninguna tarea de generación, razonamiento o evaluación de calidad.
- Sin tokenizer entrenado: el vocabulario de 32768 tokens no corresponde a ningún idioma real; las salidas serán ininteligibles.
- No apto para producción: su único propósito es el desarrollo y la depuración de software.
- La curva de rendimiento es representativa del modelo completo solo en lo relativo a QSA; otras métricas (uso de memoria, latencia de MoE) pueden diferir debido a las dimensiones reducidas.
- Requiere una versión de `llama.cpp` con soporte para la arquitectura qwen4exp (a partir de ~b10600); versiones anteriores no lo cargarán.
- La licencia MIT permite uso comercial, pero el modelo no tiene valor comercial directo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Lynxpda/micro-qwen4exp
- Implementación de Qwen4Exp en Transformers: https://github.com/huggingface/transformers/tree/main/src/transformers/models/qwen4_exp
- Implementación MLX de Qwen4Exp: https://github.com/Rocktalk-Holdings/mlx-qwen4exp
- Artículo sobre Qwen3.8-Flash-Next en M1 Max con llama.cpp: https://lilting.ch/en/articles/qwen38-flash-next-llamacpp-m1max-test
- Modelo GGUF del Qwen3.8-Flash-Next completo (referencia): https://huggingface.co/cygnal/Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF
