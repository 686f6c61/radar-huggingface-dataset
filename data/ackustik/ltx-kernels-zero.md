# Ackustik/ltx-kernels-zero

## Resumen

El repositorio `Ackustik/ltx-kernels-zero` no contiene un modelo de IA, sino un paquete de kernels CUDA/C++ personalizados para el proyecto `ltx-core`, una infraestructura de inferencia para modelos multimodales de generación (vídeo, audio y simulación del mundo físico) desarrollada por Lightricks. El paquete compila cuatro extensiones nativas (`all2all_cpp`, `ops_cpp`, `blockwise_cpp`, `nvfp4_cpp`) que implementan operaciones de comunicación multi-GPU, cuantización por bloques, GEMM FP8 y FP4, además de dos kernels JIT para el decodificador VAE de difusión.

La relevancia de este repositorio radica en que proporciona las primitivas de bajo nivel necesarias para ejecutar `ltx-core` de forma eficiente en hardware NVIDIA moderno, incluyendo soporte para tensor parallelism, cuantización FP8/FP4 y atención de vecindad 3D. No es un modelo en sí, sino una pieza de infraestructura de software que habilita el despliegue de modelos LTX en producción. El autor es `Ackustik`, y el repositorio tiene cero descargas y cero likes, lo que sugiere que es un proyecto reciente o de uso interno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernels CUDA/C++ para GPUs NVIDIA (no es un modelo de IA) |
| Parametros totales | no disponible (no aplica) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | FP8 (E4M3FN), FP4 (E2M1 + escalas FP8 E4M3 por bloque de 16), BFloat16 |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | no disponible (no aplica; se compila como extensiones de Python) |

## Arquitectura y entrenamiento

Este paquete no es un modelo entrenado, sino una colección de kernels de bajo nivel escritos en CUDA/C++ y compilados como extensiones de PyTorch. La arquitectura se organiza en cuatro módulos compilados:

- `all2all_cpp`: kernels de comunicación All2All para tensor parallelism multi-GPU, con operaciones `send_recv_heads`, `gather_heads` y `allgather`, soportando BFloat16 y Float8.
- `ops_cpp`: operaciones elementales fusionadas para cuantización por bloques, incluyendo `rms_norm_rope`, `rms_norm_split_rope` y empaquetado/desempaquetado FP6.
- `blockwise_cpp`: GEMM por bloques FP8, con kernel SM89 (Ada) siempre presente y kernel SM90 (Hopper, `deep_gemm`) opcional cuando se compila para arquitectura 9.0.
- `nvfp4_cpp`: cuantización NVFP4 (FP4 E2M1 + escalas FP8 E4M3 por bloque de 16) y GEMM con escalas por bloque vía cuBLASLt, compilado para arquitecturas Blackwell (10.0/12.0).

Además, `ltx_kernels.vae` incluye dos kernels JIT compilados con CuTe DSL para el decodificador VAE de difusión: `na_attn_dsl` (atención de vecindad 3D) y `block_fna_dsl` (bloque completo `DiffusionNABlock` en un solo lanzamiento). Estos requieren GPUs Blackwell de datacenter (SM 100/101/103) por usar MMA `tcgen05` y Tensor Memory.

No hay entrenamiento involucrado; el desarrollo se centra en la compilación y optimización de kernels. El proceso de construcción usa `uv` con grupo opcional `kernels`, y depende de cabeceras cutlass (v3.8.0) que se descargan automáticamente.

## Capacidades

- Comunicación multi-GPU: redistribución de cabezas de atención entre GPUs (`send_recv_heads`), recolección inversa (`gather_heads`) y agregación de tokens de secuencia (`allgather`), soportando BFloat16 y Float8.
- Cuantización por bloques: operaciones fusionadas de normalización RMS y RoPE, empaquetado/desempaquetado FP6, y GEMM FP8 por bloques con kernels específicos para Ada (SM89) y Hopper (SM90).
- Cuantización NVFP4: soporte para FP4 E2M1 con escalas FP8 E4M3 por bloque de 16, usando tensor cores Blackwell (SM ≥ 10.0) y cuBLASLt para GEMM con escalas por bloque.
- Kernels VAE para difusión: atención de vecindad 3D (`na_attn_dsl`) y bloque completo de atención de difusión (`block_fna_dsl`) compilados con CuTe DSL, sin volúmenes Q/K/V completos en memoria.
- Integración con `ltx-core`: los kernels se invocan desde módulos como `NVFP4Linear`, `build_nvfp4_*_policy` y `NA_DSL_KERNELS`, proporcionando la capa de ejecución de bajo nivel para el pipeline de inferencia.

## Casos de uso

- Inferencia de modelos LTX en producción: los kernels `all2all_cpp` permiten distribuir la atención multi-cabeza entre varias GPUs, reduciendo el cuello de botella de comunicación en tensor parallelism para modelos de vídeo de gran tamaño.
- Despliegue con cuantización FP8 en GPUs Ada y Hopper: `blockwise_cpp` habilita GEMM FP8 por bloques, reduciendo el uso de VRAM y acelerando la inferencia en hardware como RTX 4090 o H100.
- Cuantización FP4 en GPUs Blackwell de datacenter: `nvfp4_cpp` permite ejecutar modelos con precisión FP4, maximizando el rendimiento en B200 o similares, con escalas por bloque para mantener la calidad.
- Decodificación VAE de difusión en Blackwell: los kernels `na_attn_dsl` y `block_fna_dsl` aceleran el decodificador de vídeo, eliminando la necesidad de materializar Q/K/V completos y reduciendo el consumo de memoria.
- Investigación y desarrollo de kernels personalizados: el repositorio sirve como referencia para implementar operaciones de cuantización y atención eficientes en CUDA, con pruebas unitarias que validan la corrección.
- Integración en pipelines de generación de vídeo con ComfyUI: aunque no es un nodo directo, los kernels son la base para que `ltx-core` funcione con LTX-2, que sí está integrado en ComfyUI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye métricas de rendimiento, latencia ni throughput. Se recomienda ejecutar las pruebas unitarias (`pytest`) en el hardware objetivo para validar el funcionamiento y medir el rendimiento en cada arquitectura.

## Requisitos de hardware

- GPU NVIDIA con arquitectura Ada (SM89) o superior para `blockwise_cpp` (kernel SM89 siempre presente).
- GPU Hopper (SM90) para el kernel `deep_gemm` de `blockwise_cpp`, compilado con `sm_90a` (requiere wgmma/TMA).
- GPU Blackwell de datacenter (SM 100/101/103) para `nvfp4_cpp` (tensor cores FP4) y para los kernels VAE (`na_attn_dsl`, `block_fna_dsl`) que usan `tcgen05` MMA y Tensor Memory.
- GPU Blackwell de consumo (SM 10.0) puede ejecutar `nvfp4_cpp` pero no los kernels VAE, que requieren Tensor Memory ausente en esa línea.
- VRAM estimada: no disponible; depende del modelo `ltx-core` que se ejecute y de la cuantización elegida (FP8/FP4 reducen el consumo respecto a BF16).
- Opciones de despliegue: compilación como extensiones de PyTorch; no se mencionan integraciones con vLLM, llama.cpp u Ollama, ya que es un paquete específico para `ltx-core`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. Este repositorio no es un modelo de IA, sino una biblioteca de kernels. No existen modelos comparables en el sentido de pesos o arquitecturas; la comparación relevante sería con otras implementaciones de kernels CUDA (p. ej., FlashAttention, DeepGEMM), pero no se dispone de datos de rendimiento para establecer una comparativa objetiva.

## Limitaciones y advertencias

- No es un modelo de IA: no se puede usar directamente para generación de texto, vídeo o audio; requiere el framework `ltx-core` y el modelo LTX correspondiente.
- Requiere compilación manual: no se distribuyen binarios precompilados; el usuario debe tener CUDA toolkit, PyTorch con CUDA y Linux, y compilar con `uv` o `pip`.
- Dependencia de cabeceras cutlass: la compilación descarga automáticamente cutlass v3.8.0 (~25 MB) desde GitHub, lo que puede fallar en entornos sin acceso a internet o con restricciones de red.
- Compatibilidad de arquitectura: los kernels VAE y NVFP4 solo funcionan en GPUs Blackwell de datacenter; en hardware más antiguo (Ada, Hopper) no hay fallback, el código simplemente no está disponible en el ISA.
- Licencia no especificada: no se indica la licencia del repositorio, lo que impide conocer las restricciones de uso comercial o redistribución.
- Sin soporte oficial: el repositorio tiene cero descargas y cero likes, y no se menciona mantenimiento activo ni canal de soporte.
- Riesgo de errores en producción: al ser kernels de bajo nivel, cualquier bug puede provocar fallos de memoria o resultados incorrectos; se recomienda ejecutar las pruebas unitarias antes de usar en entornos críticos.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/Ackustik/ltx-kernels-zero
- Sitio oficial de LTX: https://ltx.io/
- Página del modelo LTX: https://ltx.io/model
- Repositorio de recursos LTX-2: https://github.com/wildminder/awesome-ltx2
- Soporte LTX-Video para ComfyUI: https://github.com/Lightricks/ComfyUI-LTXVideo
