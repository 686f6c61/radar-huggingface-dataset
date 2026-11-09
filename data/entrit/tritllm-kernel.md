# Entrit/tritllm-kernel

## Resumen

`Entrit/tritllm-kernel` es una biblioteca CUDA compartida que implementa un kernel GEMV (producto matriz-vector) para pesos ternarios balanceados (-1, 0, +1) sin multiplicaciones, asociado al códec descrito en el articulo "Balanced Ternary Post-Training Quantization for Large Language Models" (Stentzel, 2026). No es un modelo de lenguaje: es un componente de inferencia de bajo nivel que acelera la generacion de tokens en modelos LLM previamente cuantizados a ternario mediante el códec `Entrit/tritllm-codec`.

El nucleo tecnico consiste en sustituir cada multiplicacion-acumulacion por un sumador/restador condicional o un salto, aprovechando los intrinsicos `dp4a` disponibles en arquitecturas Ada, Hopper y Blackwell sobre pesos empaquetados en int4 y activaciones int8 preintercaladas. El resultado son cuatro productos punto ternario-por-int8 por instruccion. La biblioteca se expone como `libtrit_gemv.so` (o `.dll`) con ABI C y puede invocarse desde cualquier lenguaje via `ctypes`, sin dependencia de PyTorch.

La relevancia actual radica en que es la primera generacion del kernel del articulo; los checkpoints pre-cuantizados originales (Qwen2.5, Llama-3.1-8B, Mistral-7B) ya no estan alojados y deben reconstruirse con `Entrit/tritllm-codec`. Los modelos actuales de Entrit usan el códec d2 y el runtime `Entrit/llama.cpp-d2nl`. La cifra destacada del articulo es una aceleracion de 7,8x frente a cuBLAS FP16 GEMV en RTX 4090 en regimen limitado por memoria, aunque se trata de proyecciones por capa y no de throughput de servicio extremo a extremo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernel CUDA GEMV para pesos ternarios balanceados; intrinsicos `dp4a` en SM 70/75/80/86/89/90/100/120 |
| Parametros totales | no disponible (no es un modelo) |
| Parametros activos | no disponible (no es un modelo) |
| Longitud de contexto | no disponible (no es un modelo) |
| Tipos de cuantizacion | Ternario balanceado (-1, 0, +1); rutas d=2 (int4 empaquetado, 3,47 bpw) y d=3 (trit nativo, sin int4 intermedio) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Biblioteca compartida nativa (`.so` / `.dll`); pesos empaquetados en int4 o trit nativo segun ruta |

## Arquitectura y entrenamiento

El kernel implementa la operacion GEMV sobre pesos ternarios balanceados. Cada peso -1, 0 o +1 reduce una multiplicacion-acumulacion a un sumador, restador o salto condicional. La ruta `trit_gemv_d2_fast` usa intrinsicos `dp4a` sobre pesos empaquetados en int4 y activaciones int8 preintercaladas (nibbles pares e impares separados), logrando cuatro productos punto ternario-por-int8 por instruccion. La ruta `trit_gemv_d3_native` opera sobre trits empaquetados nativamente, sin paso intermedio int4.

El binario se compila como fat binary para SM 70/75/80/86/89/90/100/120, de modo que funciona en V100, T4, A100, RTX 30/40/50, H100 y B100/B200 sin recompilacion. Requiere `nvcc` (CUDA 11.8 o superior) y un compilador de C++. La compilacion se realiza con `./build.sh` desde el directorio `kernel`. El kernel de referencia `k_d3_hardened` en `trit_gemv_standalone.cu` es el que produce la cifra de 7,8x; los kernels educativos de `trit_gemv.cu` usan una reduccion lane-0 que deja inactivos 31 lanes por grupo, lo que constituye un compromiso deliberado de legibilidad.

El contrato de lanzamiento es estricto: `blockDim.x == 32` (un warp por bloque), `in_features % 64 == 0` (tamano de grupo fijo de 64 pesos) y buffers de pesos, escalas y activaciones residentes en dispositivo y correctamente alineados. Si `in_features` no es divisible por 64, debe rellenarse la matriz de pesos hasta el siguiente multiplo con filas de ceros antes de cuantizar; de lo contrario, el grupo parcial final se descarta silenciosamente y la salida de esa fila es incorrecta.

## Capacidades

- Aceleracion de inferencia LLM con pesos ternarios balanceados sin multiplicaciones.
- Ruta d=2 con int4 empaquetado optimizada para GPU con L2 grande (RTX 4090, RTX 4080 Laptop).
- Ruta d=3 con trits nativos empaquetados sin int4 intermedio.
- Consulta del tamano de L2 (`get_l2_cache_bytes`) para decidir si activar persistencia L2.
- Consulta del nombre de GPU (`get_gpu_name`) y sincronizacion explicita (`cuda_sync`).
- Reporte de errores por canal separado (`trit_gemv_get_last_error`), con codigos negativos para fallos de validacion en host y positivos para `cudaError_t` de la ultima ejecucion.
- Invocacion desde cualquier lenguaje mediante ABI C y `ctypes`, sin PyTorch.
- Envoltorio PyTorch via pybind11 (`trit_gemv_wrapper.cu`) para benchmarking.
- No soporta tool calling, agentes, vision, audio ni capacidades generativas: es un kernel.

## Casos de uso

- Servicio de inferencia LLM cuantizado en ternario: integrar la biblioteca en un runtime propio para acelerar la fase GEMV de modelos cuantizados con el códec `tritllm-codec`, especialmente en GPUs con L2 grande donde la capa cabe en cache.
- Despliegue en RTX 4090 para modelos de 7B a 3,47 bpw (3,3 GB): la ruta `trit_gemv_d2_fast` con persistencia L2 activada ofrece la mayor aceleracion medida (588 tok/s proyectados, 7,8x frente a cuBLAS FP16).
- Inferencia en GPUs de consumo con L2 pequena: en RTX 3090 la ruta d=2 sigue aportando 3,4x (192 tok/s proyectados) gracias a que la reduccion de ancho de banda compensa la falta de cache.
- Benchmarking y validacion de codigos de cuantizacion ternaria: usar los drivers `kernel/bench_*.py` para medir el impacto de distintas profundidades (d=2, d=3) y tamanos de grupo sobre el rendimiento real.
- Investigacion en cuantizacion post-entrenamiento: comparar la ruta int4 empaquetada frente a la ruta trit nativa para evaluar precision y velocidad en distintos modelos base (Qwen2.5, Llama-3.1-8B, Mistral-7B reconstruidos con el códec).
- Integracion en pipelines de evaluacion de modelos cuantizados: al no depender de PyTorch y exponer ABI C, puede llamarse desde scripts en Python, C++ o Rust para validar salidas numericas frente a una referencia FP16.
- Despliegue en centros de datos con A100 80GB: la ruta d=2 ofrece 201 tok/s proyectados y 4,2x frente a cuBLAS FP16, adecuada para servir modelos ternarios en infraestructura existente sin recompilar.

## Benchmarks y rendimiento

Resultados del articulo para Qwen2.5-7B con d=2, 3,47 bpw y modelo de 3,3 GB. Son benchmarks por capa proyectados a throughput de generacion de tokens, no throughput de servicio extremo a extremo (excluyen atencion, cache KV, muestreo y tokenizador).

| GPU | Cache L2 | Tokens/s | Aceleracion vs cuBLAS FP16 | Ancho de banda efectivo |
|---|---|---|---|---|
| RTX 4090 | 72 MB | 588 | 7,8x | 1940 GB/s |
| RTX 3090 | 6 MB | 192 | 3,4x | 633 GB/s |
| RTX 4080 Laptop | 64 MB | 133 | 5,8x | 439 GB/s |
| A100 80GB | 40 MB | 201 | 4,2x | 663 GB/s |

El tamano de L2 correlaciona fuertemente con la aceleracion porque cada capa d=2 cabe en L2 en la RTX 4090, lo que proporciona un ancho de banda efectivo aproximadamente 2x el de HBM. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible, ya que el artefacto es un kernel y no un modelo.

## Requisitos de hardware

- VRAM: no aplica al kernel en si; depende del modelo cuantizado que se sirva. Para Qwen2.5-7B a 3,47 bpw el modelo ocupa 3,3 GB.
- GPUs soportadas por el fat binary: V100 (SM 70), T4 (SM 75), A100 (SM 80), RTX 30 (SM 86), RTX 40 y L4 (SM 89), H100 (SM 90), B100/B200 (SM 100) y SM 120.
- Cabe en GPU de consumo: si, en RTX 30/40/50 y en portatiles con esas arquitecturas.
- Toolchain: `nvcc` CUDA 11.8 o superior y compilador de C++.
- Despliegue: biblioteca nativa via `ctypes` desde cualquier lenguaje; envoltorio PyTorch opcional para benchmarking. No se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI para este kernel; los modelos actuales de Entrit usan `Entrit/llama.cpp-d2nl`.
- Latencia y throughput: ver tabla de benchmarks (588 tok/s en RTX 4090, 201 tok/s en A100 80GB, 192 tok/s en RTX 3090, 133 tok/s en RTX 4080 Laptop, todos proyectados por capa).
- Persistencia L2: el parametro `use_l2_persist` de `trit_gemv_d2_fast` permite activarla; conviene consultar `get_l2_cache_bytes` antes de decidir.

## Comparativa con modelos similares

No disponible. El artefacto es un kernel CUDA especializado en GEMV ternario y no un modelo de lenguaje, por lo que no existen alternativas directamente comparables en la informacion proporcionada. Como referencias funcionales del mismo dominio podrian citarse cuBLAS FP16 GEMV (linea base frente a la que se mide la aceleracion) y el runtime `Entrit/llama.cpp-d2nl` para el códec d2, pero no se dispone de datos comparativos de rendimiento entre ellos en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo: no genera texto ni soporta tool calling, agentes, vision o audio.
- Los checkpoints pre-cuantizados del articulo (Qwen2.5, Llama-3.1-8B, Mistral-7B) ya no estan alojados; deben reconstruirse con `Entrit/tritllm-codec`.
- Es la primera generacion del kernel; los modelos actuales de Entrit usan el códec d2 y el runtime `Entrit/llama.cpp-d2nl`, no este artefacto.
- Las cifras de 7,8x y los tokens/s son proyecciones por capa, no throughput de servicio extremo a extremo; excluyen atencion, cache KV, muestreo y tokenizador.
- Contrato de lanzamiento estricto: `blockDim.x == 32` obligatorio; violarlo provoca lecturas fuera de rango y condiciones de carrera en `y[row]`.
- `in_features % 64 == 0` obligatorio; si no se cumple, el grupo parcial final se descarta silenciosamente y la salida de esa fila es incorrecta. Es necesario rellenar con filas de ceros antes de cuantizar.
- Los buffers deben estar en dispositivo y correctamente alineados; de lo contrario se produce comportamiento indefinido o fallo de dispositivo.
- Las entradas `extern "C"` devuelven `void`; los errores solo se detectan consultando `trit_gemv_get_last_error()`. Una llamada puede fallar silenciosamente si no se comprueba.
- Los kernels educativos de `trit_gemv.cu` usan reduccion lane-0 e inactivan 31 lanes por grupo; no son representativos del rendimiento del kernel endurecido.
- Licencia Apache-2.0: permite uso comercial, pero no se ofrece garantia ni soporte.
- No se dispone de informacion sobre sesgos, alucinacion o limitaciones idiomaticas porque el artefacto no es un modelo generativo.

## Enlaces

- Hugging Face: https://huggingface.co/Entrit/tritllm-kernel
- Codificador asociado: https://huggingface.co/Entrit/tritllm-codec
- Runtime d2: https://huggingface.co/Entrit/llama.cpp-d2nl
- Pagina del autor: https://huggingface.co/Entrit
- Documento de problemas conocidos: `KNOWN_ISSUES.md` (referenciado en la model card)
- Articulo citado: Stentzel, E. (2026), "Balanced Ternary Post-Training Quantization for Large Language Models", Entrit Systems
- Drivers de benchmark: `kernel/bench_*.py` (referenciados en la model card)
