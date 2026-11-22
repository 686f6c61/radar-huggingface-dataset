# HelloSun/flint_cpu_opt

## Resumen

Flint CPU Opt es un repositorio de optimización para CPU del modelo Flint, un modelo de lenguaje de tipo mixture-of-experts (MoE) con 39.800 millones de parámetros totales y aproximadamente 2.500 millones de parámetros activos por token. Lo desarrolla el usuario HelloSun y se apoya en el modelo base RecursiveSI/flint, un modelo orientado a código con 256 expertos, top-6 y 49 capas. El repositorio no modifica los pesos: aporta un parche para llama.cpp (`patches/flint-cpu-opt.patch`) que acelera la inferencia en CPU sobre Intel Xeon con AVX512-VNNI y AMX, junto con los ficheros GGUF empleados para medir y ajustar.

La relevancia de este trabajo es práctica: demuestra que un MoE de casi 40.000 millones de parámetros puede ejecutarse en CPU con velocidades razonables mediante kernels vectorizados específicos (VNNI, AMX, GEMM por tiles) y cuantizaciones agresivas. Incluye además una cuantización propia, VQ3 (LUT-VQ3-64, 3,00 bpw en los expertos), que reduce el fichero a 15,16 GiB con una perplejidad de 17,96 en wikitext-2 (top-6), en línea con Q4_K_XL (18,48).

Se distribuye bajo licencia Apache 2.0 y el formato de pesos es GGUF, pensado para llama.cpp. El repositorio tiene 624 descargas y el tamaño total del repo es de 83,6 GB, repartido entre varios ficheros GGUF de distinta cuantización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mixture-of-experts), 49 capas, 256 expertos, top-6, con shared expert y router |
| Parametros totales | 39.785.287.456 (~39,8B) |
| Parametros activos | ~2,5B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_XL (mezcla Q5_K, IQ4_XS, Q8_0, Q4_K, Q6_K, IQ3_S), Q4_1, NVFP4, VQ3_0 (LUT-VQ3-64, 3,00 bpw en expertos) + Q8_0 en el resto |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 49 capas y 256 expertos, de los cuales se activan 6 por token (top-6), lo que resulta en unos 2,5B de parámetros activos sobre 39,8B totales. La arquitectura incluye un shared expert, un router y tensores de expertos `ffn_{up,gate,down}_exps`. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

La innovación principal de este repositorio no está en el entrenamiento, sino en la inferencia en CPU. El parche para llama.cpp (base commit `de5122d87`) añade: kernels `vec_dot` AVX512-VNNI para IQ4_XS x Q8_K y Q4_1 x Q8_1; GEMM por tiles con VNNI para Q4_1 en prefill; kernel `vec_dot` AVX512-VNNI para NVFP4 x Q8_0; y GEMM por tiles VNNI para NVFP4 en prefill. También incorpora kernels multi-columna con tiles {8,4,3,2} para prefill de VQ3 y un hook de top-k por capa configurable mediante la variable de entorno `LLAMA_MOE_TOP_K`. Los kernels enteros son exactos; solo cambia el orden de acumulación en coma flotante, con una divergencia KL respecto a stock dentro del ruido de referencia.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Modelo especializado en código según la model card del autor ("39.8B 參數的 mixture-of-experts 程式碼模型").
- Razonamiento multi-paso y agentes: el autor recomienda Q4_1 para bucles de chat y agentes con caché de prefijo por su mayor velocidad de decode.
- MoE con top-k ajustable en tiempo de ejecución (`LLAMA_MOE_TOP_K`), lo que permite intercambiar calidad por velocidad (top-5 como punto dulce, top-4 como modo turbo).
- Ejecución en CPU sin GPU, con soporte de AVX512-VNNI y AMX en Intel Xeon.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Capacidades multilingües: no disponible.

## Casos de uso

- Inferencia de código en servidores sin GPU: el modelo puede desplegarse en un Intel Xeon con AVX512-VNNI usando el parche y el GGUF Q4_K_XL, obteniendo 296 tokens/s de prefill (pp256) y 42,8 tokens/s de decode (tg128) en un Xeon Platinum 8559C con 16 hilos.
- Asistentes de chat y agentes con caché de prefijo: usar Q4_1, que alcanza 55,7 tokens/s de decode con el parche, un 30% más rápido que Q4_K_XL, adecuado para ciclos multi-turno donde el decode domina el tiempo.
- Despliegue con memoria limitada: el fichero VQ3 ocupa 15,16 GiB (−35% frente a Q4_K_XL) con perplejidad de 17,96, lo que permite ejecutar el modelo en máquinas con menos RAM manteniendo calidad comparable.
- Procesamiento de prompts largos y contextos extensos: Q4_K_XL ofrece el mejor prefill de los tres formatos medidos (307 tokens/s en pp2048 con parche), útil para análisis de repositorios o documentos largos.
- Ajuste fino de latencia en producción: el hook `LLAMA_MOE_TOP_K` permite configurar top-5 (PPL 18,88, +9-14% de decode frente a stock) o top-4 (PPL 20,82, +12%) según el presupuesto de calidad y latencia.
- Evaluación e investigación de cuantizaciones: el repositorio incluye mediciones de KLD, perplejidad y throughput para Q4_K_XL, Q4_1 y NVFP4, lo que sirve como referencia para estudiar el impacto de la cuantización en MoE sobre CPU.
- Pruebas de NVFP4 en CPU: aunque NVFP4 está diseñado para CUDA, el parche multiplica por 2,1-2,5 el prefill en CPU, lo que permite experimentar con este formato sin GPU.

## Benchmarks y rendimiento

Mediciones en Intel Xeon Platinum 8559C, 16 hilos, con parche aplicado, mediana de tres rondas intercaladas (tokens/s):

| Fichero | prefill pp256 | prefill pp2048 | decode tg128 | PPL (wikitext-2, 32x512) |
|---|---|---|---|---|
| Q4_K_XL, stock | 231 | 274 | 38,2 | 18,363 ± 0,795 |
| Q4_K_XL, patched | 296 | 307 | 42,8 | 18,277 ± 0,787 |
| Q4_1, stock | 183 | 189 | 48,3 | 18,260 ± 0,780 |
| Q4_1, patched | 266 | 297 | 55,7 | 18,240 ± 0,779 |
| NVFP4, stock | 83,7 | 83,6 | 30,6 | 24,417 ± 1,566 (16x512) |
| NVFP4, patched | 178,5 | 211,1 | 32,1 | 24,414 ± 1,568 (16x512) |
| VQ3, top-6 | no disponible | no disponible | no disponible | 17,96 ± 0,76 |

Aceleración del parche respecto a stock con el mismo fichero:

| Fichero | pp256 | pp2048 | tg128 |
|---|---|---|---|
| Q4_K_XL | 1,28x | 1,12x | 1,12x |
| Q4_1 | 1,46x | 1,57x | 1,15x |
| NVFP4 | 2,13x | 2,52x | 1,05x (ruido) |

Calidad (KLD frente a logits de referencia del mismo fichero): Q4_K_XL patched vs stock 0,0666 ± 0,0049 (~92% top-1 coincidente); Q4_1 vec_dot patch vs stock 0,0364 ± 0,0029 (93,8%); Q4_1 tiled GEMM vs vec_dot patch 0,0372 ± 0,0026 (94,2%). El ruido de referencia de stock es 0,0762 (Q4_K_XL) y 0,0385 (Q4_1), por lo que las diferencias quedan dentro del ruido.

## Requisitos de hardware

- VRAM: no aplica, el objetivo es CPU. RAM necesaria según fichero: VQ3 15,16 GiB, Q4_K_XL 23,3 GiB, Q4_1 24,2 GiB, NVFP4 22,9 GB.
- CPU recomendada: Intel Xeon con AVX512-VNNI y, preferiblemente, AMX (el benchmark usa Xeon Platinum 8559C con 16 hilos).
- GPU: no requerida; NVFP4 está pensado para CUDA pero el repositorio lo evalúa en CPU.
- Cabe en equipos de consumo: no hay datos sobre CPUs de consumo; el modelo base requiere al menos ~15 GiB de RAM en VQ3, viable en estaciones de trabajo con 32 GiB o más.
- Despliegue: llama.cpp con el parche `patches/flint-cpu-opt.patch` (base `de5122d87`) y `llama-server` en el puerto 20000; el script `./build.sh` reconstruye el motor, descarga el modelo y arranca el servidor. Para VQ3 se aplica además `vq3/vq3-on-flint.patch` con llama-modchip.
- Rendimiento: decode de 42,8-55,7 tokens/s y prefill de 266-307 tokens/s (pp2048) en el hardware de referencia; el decode está limitado por ancho de banda de DRAM (125-175 GB/s en 16 hilos, ~90 GB/s efectivos) y el prefill por cómputo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Flint (RecursiveSI/flint) | 39,8B totales, ~2,5B activos | no disponible | no disponible | safetensors | Modelo base sin optimización de CPU |
| Flint CPU Opt (este repo) | 39,8B totales, ~2,5B activos | no disponible | Apache 2.0 | GGUF | Parche CPU + GGUF Q4_K_XL, Q4_1, VQ3, NVFP4 |
| Qwen3.6-35B-A3B (referencia del autor) | ~35B totales, ~3B activos | no disponible | no disponible | GGUF | El parche reutiliza sus kernels; comparación indirecta |

No se dispone de datos de benchmarks comparativos con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- No hay información sobre sesgos del modelo base ni sobre evaluación de alucinación.
- La longitud de contexto y los idiomas soportados no están documentados.
- El rendimiento medido corresponde a un Intel Xeon Platinum 8559C con 16 hilos; en otras CPUs los números pueden variar notablemente, y sin AVX512-VNNI el parche no aporta las mismas ganancias.
- Las mediciones de NVFP4 se tomaron en un servidor más ocupado y solo son comparables entre sí, no con las de Q4_K_XL y Q4_1.
- El top-k reducido (top-5, top-4) degrada la perplejidad (18,88 y 20,82 frente a 17,96 en top-6); debe validarse en la tarea concreta antes de usarlo en producción.
- La cuantización VQ3 requiere llama-modchip y un parche adicional; no es un GGUF estándar de llama.cpp sin esas modificaciones.
- La licencia Apache 2.0 se aplica al repositorio, pero no se detalla la licencia del modelo base RecursiveSI/flint, que conviene verificar antes de un uso comercial.
- El repositorio no incluye el fichero NVFP4 (22,9 GB); debe descargarse desde RecursiveSI/flint-nvfp4-gguf.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/HelloSun/flint_cpu_opt
- Fichero VQ3: https://huggingface.co/HelloSun/flint_cpu_opt/resolve/main/flint-VQ3.gguf
- Modelo base: https://huggingface.co/RecursiveSI/flint
- GGUF de Unsloth: https://huggingface.co/unsloth/flint-GGUF
- GGUF int4 de RecursiveSI: https://huggingface.co/RecursiveSI/flint-int4-gguf
- GGUF NVFP4 de RecursiveSI: https://huggingface.co/RecursiveSI/flint-nvfp4-gguf
- llama-modchip (formato LUT-VQ3-64): https://github.com/synchopate/llama-modchip
- Repositorio de referencia del autor: https://huggingface.co/HelloSun/Qwen3.6-35B-A3B-GGUF_CPU_OPT
