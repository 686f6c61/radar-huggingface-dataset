# flashrt/fp4-gemm

## Resumen

`flashrt/fp4-gemm` no es un modelo de lenguaje ni un sistema de IA generativa, sino un paquete de kernels de multiplicación de matrices (GEMM) de bajo nivel diseñado para acelerar la inferencia de modelos cuantizados en formato FP4 (E2M1) sobre GPUs NVIDIA Blackwell. Lo desarrolla el autor "flashrt" y se distribuye como un repositorio de código fuente Python/CUDA con una API que permite cuantizar tensores a FP4, gestionar escalas CUTLASS SFA/SFB y ejecutar GEMMs con salida en BF16, incluyendo epilogues fusionados como bias, GELU y residual.

El paquete está pensado para integrarse en runtimes de transformers o difusores de baja precisión, y se menciona explícitamente su uso en el pipeline "GROOT N1.7" para la GPU Jetson AGX Thor (sm_110a). El repositorio ocupa 0,3 GB e incluye tests y benchmarks. No se proporciona información sobre licencia, idiomas ni pipeline de HuggingFace, y no hay datos de parámetros de modelo porque no aplican.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernels GEMM para cuantización FP4 E2M1 con escalas CUTLASS SFA/SFB, salida BF16 |
| Parametros totales | no disponible (no es un modelo entrenado) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | FP4 E2M1 (A4W4), con escalas SFA/SFB |
| Idiomas soportados | no disponible (no es un modelo de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | Tensores empaquetados `torch.uint8` (FP4) + buffers de escala SFA/SFB; salida en `torch.bfloat16` |

## Arquitectura y entrenamiento

Este paquete no tiene fase de entrenamiento; es una librería de kernels de cómputo. La arquitectura se basa en CUTLASS y proporciona rutinas de cuantización y GEMM para tensores FP4 E2M1 con escalas por fila/columna en formato SFA/SFB. Los kernels están optimizados para las arquitecturas Blackwell `sm_110a` (Jetson AGX Thor, CUDA 13+) y `sm_120a` (RTX Blackwell, CUDA 12.8+). Se ofrecen varios schedules de ejecución (cooperativo, widen, pingpong) y epilogue fusionados (bias, residual, GELU) para evitar materializar tensores intermedios en BF16. El paquete incluye funciones de cuantización directa desde FP16 y BF16, y una función de des-cuantización para validación.

## Capacidades

- Ejecución de GEMMs con pesos y activaciones cuantizados en FP4 (E2M1) y salida en BF16.
- Cuantización de tensores FP16 y BF16 a FP4 con escalas SFA/SFB.
- Epilogue fusionados: bias, residual, GELU, y combinaciones (bias+residual, bias+GELU) para reducir idas y vueltas a BF16.
- Variantes Stream-K para formas de proyección grandes validadas.
- API Python con `get_kernel("flashrt/fp4-gemm", version=1, trust_remote_code=True)`.
- Soporte explícito para las arquitecturas Blackwell `sm_110a` y `sm_120a`.
- Funciones de compatibilidad (alias `fp4_w4a16_linear_bf16`).
- Incluye tests y benchmarks para validación de formas específicas de modelo (por ejemplo, `(41,4608,1536)`, `(41,6144,1536)`, `(41,1536,6144)`).

## Casos de uso

- Inferencia de modelos de lenguaje cuantizados en FP4 sobre GPUs Blackwell: el paquete proporciona los kernels GEMM necesarios para ejecutar capas lineales con pesos FP4 y activaciones FP4, reduciendo el uso de memoria y potencialmente aumentando el throughput.
- Integración en runtimes de baja precisión: puede combinarse con otros paquetes de `flashrt` (como `flashrt/fp4-fused-ops`) para construir pipelines de transformers o difusores que operen completamente en FP4 sin materializar tensores BF16 intermedios.
- Despliegue en Jetson AGX Thor (sm_110a): los kernels están validados para esta plataforma, lo que permite ejecutar modelos cuantizados en dispositivos edge con capacidad de cómputo 11.0.
- Aceleración de proyecciones grandes en modelos de difusión o transformers: los schedules "widen" y Stream-K están pensados para formas con N grande, típicas en capas de proyección.
- Investigación en cuantización extrema: los desarrolladores pueden usar las funciones de cuantización/des-cuantización para estudiar el impacto de FP4 en la calidad de modelos, con una implementación de referencia en PyTorch.
- Benchmarking de kernels FP4 en hardware Blackwell: el paquete incluye un script de benchmarks (`benchmark.py`) para medir rendimiento en formas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio incluye un script de benchmarks (`benchmark.py`) y tests de validación, pero no se proporcionan cifras de rendimiento (throughput, latencia) en la documentación pública.

## Requisitos de hardware

- GPUs NVIDIA Blackwell: `sm_110a` (Jetson AGX Thor, CUDA 13+) y `sm_120a` (RTX Blackwell, CUDA 12.8+).
- Se requiere CUDA 12.8 o superior (para sm_120a) y CUDA 13+ (para sm_110a).
- Se necesita PyTorch (el código usa `torch.uint8`, `torch.bfloat16`, etc.).
- No se especifican requisitos de VRAM, ya que depende del modelo cuantizado que se ejecute; los kernels operan sobre tensores ya cargados en GPU.
- No es una solución para GPUs consumer anteriores a Blackwell (p.ej. RTX 4090, A100) porque las instrucciones FP4 nativas no están disponibles.
- Opciones de despliegue: uso como librería Python dentro de un entorno con PyTorch y CUDA; no se mencionan integraciones con vLLM, llama.cpp u otros servidores de inferencia.

## Comparativa con modelos similares

No disponible. Este paquete es un conjunto de kernels de bajo nivel y no hay información pública que lo compare directamente con otras implementaciones de GEMM FP4 (como las de vLLM o TensorRT-LLM). La documentación no proporciona datos de rendimiento ni listas de alternativas comparables.

## Limitaciones y advertencias

- No es un modelo de lenguaje ni un sistema de IA; no puede generar texto ni realizar tareas de razonamiento.
- Solo funciona en GPUs Blackwell con soporte para `sm_110a` o `sm_120a`; no es compatible con arquitecturas anteriores.
- Requiere CUDA 12.8+ (sm_120a) o CUDA 13+ (sm_110a) y PyTorch; no es una solución independiente.
- La licencia no está especificada en la información disponible, por lo que no se puede garantizar su uso comercial sin consultar al autor.
- Los kernels están validados para formas específicas (por ejemplo, `(41,4608,1536)`); otras formas pueden no estar soportadas o pueden requerir selección manual de variante.
- La cuantización FP4 puede degradar la calidad del modelo en comparación con precisiones más altas; el paquete no incluye evaluación de calidad.
- El repositorio tiene 0 descargas y 0 likes en HuggingFace, lo que sugiere que es un proyecto reciente o poco adoptado.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/flashrt/fp4-gemm
- No se proporcionan otros enlaces (papers, blogs, repos) en la información disponible.
