# flashrt/adaptive-layernorm-producers

## Resumen

`flashrt/adaptive-layernorm-producers` no es un modelo de IA, sino un paquete de kernels CUDA de bajo nivel desarrollado por FlashRT para acelerar la parte productora de bloques de normalización adaptativa (adaptive LayerNorm) en runtimes de transformadores y difusores, específicamente para arquitecturas tipo DiT y Wan. El paquete fusiona la operación completa de normalización, modulación y cuantización de baja precisión (FP8 o NVFP4) en un único operador de Kernel Hub, evitando lanzamientos separados de kernels para normalización, modulación, materialización en BF16 y cuantización antes del GEMM.

La relevancia actual radica en que los modelos de difusión y transformadores de gran tamaño (como GROOT N1.7) requieren inferencia eficiente en GPUs Blackwell (SM110), y esta fusión reduce la sobrecarga de lanzamiento de kernels y el tráfico de memoria. El paquete incluye funciones para cuantización FP8 estática y por token, cuantización NVFP4 con swizzling, y modulación DiT de seis vías. No contiene pesos de modelo ni arquitectura neuronal; es un componente de infraestructura de inferencia.

El repositorio tiene un tamaño de 0.0 GB, cero descargas y cero likes, lo que indica que es un proyecto reciente o de uso interno. Está orientado a CUDA 12.8+ y despliegue en Blackwell, con soporte experimental para aarch64 y SM87/SM110a.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernels CUDA fusionados para adaptive LayerNorm + cuantización (no es un modelo neuronal) |
| Parametros totales | no disponible (no aplica, no contiene pesos) |
| Parametros activos | no disponible (no aplica) |
| Longitud de contexto | no disponible (no aplica) |
| Tipos de cuantizacion | FP8 (e4m3fn) y NVFP4 (con swizzling CUTLASS 128x4) |
| Idiomas soportados | no disponible (no aplica) |
| Licencia | no disponible |
| Formato de pesos | no aplica (los tensores de entrada son torch.bfloat16, torch.float32, torch.float8_e4m3fn) |

## Arquitectura y entrenamiento

No se trata de un modelo entrenado, sino de un conjunto de kernels de inferencia. La arquitectura interna se basa en la fusión de operaciones: recibe un tensor `x` en BF16 de forma `(rows, dim)` y produce salidas cuantizadas en FP8 (forma `(rows, dim)`) o NVFP4 empaquetado (forma `(rows, dim // 2)`). Los kernels derivan del runtime de producción FlashRT, concretamente de los archivos `ada_layer_norm_fp8.cu` y `dit_bf16.cu`.

Las variantes disponibles incluyen:
- Normalización adaptativa con escala y desplazamiento estáticos (broadcast) o por token.
- Modo tabla con selección de chunks y modulación desde una tabla host.
- Modulación FP8 de los parámetros de escala y desplazamiento.
- Soporte para AWQ (inverse scale).
- Cuantización NVFP4 con swizzling de factores de escala (formato CUTLASS 128x4).
- Modulación DiT de seis vías (`adaln_modulation6_bf16`) que toma parámetros FP32 y devuelve seis tensores BF16.

El paquete está diseñado para integración con CUDA Graphs mediante buffers estáticos, y el contrato de tensores exige memoria contigua en CUDA. No hay información sobre entrenamiento porque no aplica.

## Capacidades

- Fusión de normalización adaptativa, modulación y cuantización en un solo kernel, reduciendo lanzamientos y materializaciones intermedias.
- Cuantización FP8 estática (`act_scale` fijo) y por token (escala y desplazamiento por fila).
- Cuantización NVFP4 con layout de escalas swizzled (formato propietario FlashRT/CUTLASS 128x4).
- Modulación DiT de seis vías para bloques de difusión.
- Soporte para buffers estáticos, permitiendo captura con CUDA Graphs.
- Modo tabla para modulación por chunks sin materializar buffers de broadcast.
- Variantes para arquitecturas específicas: SM110 (Blackwell) y SM87/SM110a (aarch64).
- Validación exhaustiva: comprobación de salida FP8 exacta para formas pequeñas, salida NVFP4 exacta contra contrato nativo en SM110, y política de límites FP8 para formas largas (video).

## Casos de uso

- Inferencia de modelos de difusión DiT/Wan en GPU Blackwell: el kernel fusionado acelera los bloques de normalización adaptativa antes de los GEMMs cuantizados, reduciendo la latencia por paso de difusión.
- Servicio de modelos de video generativo (tipo GROOT N1.7): la variante `layer_norm_no_affine_quant_nvfp4_swizzled_bf16` está pensada para el pre-FFN de estos modelos en hardware Thor (SM110a).
- Despliegue en producción con CUDA Graphs: la API con buffers estáticos permite capturar el grafo completo de inferencia sin reasignaciones, ideal para latencia determinista en servidores.
- Integración en runtimes de transformadores que ya consumen activaciones FP8 o NVFP4: evita la materialización en BF16 intermedia, ahorrando ancho de banda de memoria.
- Optimización de pipelines de cuantización AWQ: la función `awq_ada_layer_norm_quant_fp8_bf16` incorpora la escala inversa directamente en la normalización, simplificando el flujo.
- Benchmarking y validación de kernels en hardware específico: el paquete incluye scripts de test y benchmark para verificar exactitud y rendimiento en RTX 5090 y arquitecturas SM110.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona la existencia de `benchmarks/RESULTS.md` con resultados locales en RTX 5090, pero no se proporcionan los números en el README. No se pueden reportar cifras de throughput o latencia sin inventar datos.

## Requisitos de hardware

- CUDA 12.8 o superior obligatorio.
- GPU Blackwell (SM110) para la ruta principal de FP8 y NVFP4. Se menciona explícitamente SM110 para NVFP4.
- Variante aarch64 con soporte nativo para SM87 y SM110a (Thor), validada en esa arquitectura.
- El ejemplo de validación usa una RTX 5090 (arquitectura Blackwell, SM120), lo que indica compatibilidad con consumer GPUs Blackwell.
- No se especifican requisitos de VRAM porque no es un modelo con pesos; la memoria depende del tamaño de los tensores de entrada.
- Opciones de despliegue: integración mediante Kernel Hub (`get_kernel("flashrt/adaptive-layernorm-producers", version=1, trust_remote_code=True)`). No se mencionan vLLM, llama.cpp u otros runners estándar, ya que es un componente de bajo nivel.

## Comparativa con modelos similares

No disponible. Este paquete no tiene equivalentes directos en el ecosistema de modelos de IA publicados en HuggingFace con los que comparar parámetros, contexto o rendimiento. Su función es ortogonal a los modelos: es un optimizador de kernels para runtimes específicos. Alternativas conceptuales serían kernels manuales de fusión de LayerNorm+quant en frameworks como vLLM o TensorRT-LLM, pero no hay datos públicos comparables.

## Limitaciones y advertencias

- No es un modelo de IA: no genera texto, imágenes ni realiza razonamiento. Intentar usarlo como modelo dará error.
- Requiere CUDA 12.8+ y hardware NVIDIA Blackwell (SM110) para la mayoría de las rutas; en otras GPUs puede fallar o degradarse.
- El formato NVFP4 con swizzling es propietario de FlashRT/CUTLASS y no es intercambiable con otros formatos NVFP4 estándar.
- La validación se realiza contra contratos específicos de cada arquitectura (SM110 vs SM120); los resultados no son transferibles entre arquitecturas.
- La licencia no está especificada, lo que impide determinar si su uso comercial está permitido.
- El repositorio tiene cero descargas y cero likes; es un proyecto inmaduro o de uso interno, con riesgo de cambios de API sin aviso.
- La documentación asume conocimiento profundo de kernels CUDA, formatos de cuantización y runtimes de inferencia; no es apto para usuarios finales.
- `dim` debe ser par para FP8 y divisible por 16 para NVFP4; violar esto produce errores o comportamiento indefinido.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/flashrt/adaptive-layernorm-producers
- Repositorio upstream FlashRT: https://github.com/LiangSu8899/FlashRT
