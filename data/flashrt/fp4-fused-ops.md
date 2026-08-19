# flashrt/fp4-fused-ops

## Resumen

flashrt/fp4-fused-ops es un paquete de kernels CUDA fusionados diseñados para acelerar la cuantización de activaciones a formato NVFP4 (FP4 de NVIDIA) en pipelines de baja precisión para transformadores y difusores. Lo desarrolla el autor flashrt y se distribuye a través de HuggingFace como un repositorio de código con kernels precompilados. No se trata de un modelo de lenguaje, sino de una librería de operaciones de bajo nivel que permite convertir tensores FP16/BF16 a representaciones FP4 empaquetadas con escalas SFA (CUTLASS), optimizadas para las arquitecturas Blackwell `sm_110a` y `sm_120a`.

Su relevancia actual radica en la creciente adopción de cuantización agresiva (4 bits) para reducir el consumo de memoria y acelerar la inferencia en GPUs de última generación. Este paquete ofrece kernels especializados que fusionan operaciones comunes como RMSNorm, SiLU, multiplicaciones residuales y cuantización en un solo paso, evitando idas y venidas a memoria global. La versión 1 del paquete requiere CUDA 13 o superior para los artefactos SM110, y las dimensiones de los tensores deben ser divisibles por 16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Kernels CUDA fusionados para cuantización NVFP4 (no es un modelo de red neuronal) |
| Parametros totales | no aplica (paquete de kernels, no modelo) |
| Parametros activos | no aplica |
| Longitud de contexto | no aplica |
| Tipos de cuantizacion | NVFP4 (FP4 de NVIDIA), E0M3, FP16/BF16 como entrada |
| Idiomas soportados | no aplica (librería de bajo nivel) |
| Licencia | no disponible |
| Formato de pesos | no aplica (código CUDA compilado, artefactos para sm_110a y sm_120a) |

## Arquitectura y entrenamiento

Este paquete no contiene un modelo entrenado, sino una colección de kernels CUDA escritos con CUTLASS/CUTE. Los kernels implementan operaciones fusionadas que combinan normalización, activaciones y cuantización en un solo paso, produciendo tensores FP4 empaquetados en `uint8` junto con buffers de escala SFA (Scaling Factor Adjustment) compatibles con los GEMM de CUTLASS. Las operaciones incluyen RMSNorm, SiLU, multiplicaciones residuales, GELU, ReLU2 y cuantización lineal BF16-to-NVFP4, entre otras.

No hay datos de entrenamiento ni proceso de optimización de pesos, ya que se trata de código de inferencia. La innovación técnica principal es la fusión de múltiples pasos en kernels individuales para reducir el tráfico de memoria y aprovechar las instrucciones específicas de Blackwell para FP4. Se proporcionan variantes para diferentes formas de tensores (NCDHW, NDHWC) y límites de dimensión (por ejemplo, `dim <= 2048` para la v1 de RMS, `C <= 1024` para kernels NCDHW).

## Capacidades

- Cuantización de activaciones FP16/BF16 a NVFP4 empaquetado con escalas SFA.
- Kernels fusionados que combinan RMSNorm + cuantización, SiLU + cuantización, y variantes con multiplicaciones residuales y gated.
- Soporte para operaciones de normalización adaptativa (adaptive RMSNorm) en FP16 y BF16.
- Funciones de cuantización y dequantización para depuración y pipelines híbridos.
- Compatibilidad con CUTLASS/CUTE SFA layouts, lo que permite integración directa con GEMM de FP4.
- Orientado a transformadores y difusores que requieren baja precisión en activaciones.

## Casos de uso

- Inferencia de modelos de lenguaje con cuantización FP4: los kernels permiten convertir activaciones a FP4 sobre la marcha, reduciendo el ancho de banda de memoria y acelerando la atención y las capas MLP en GPUs Blackwell.
- Difusores de baja precisión: las operaciones de normalización y activación fusionadas son útiles en pipelines de generación de imágenes donde la memoria es crítica.
- Despliegue de modelos en entornos con VRAM limitada: al reducir las activaciones a 4 bits, se pueden ejecutar modelos más grandes en GPUs con menor memoria.
- Optimización de pipelines de inferencia con vLLM o TGI: los kernels pueden integrarse en backends personalizados para mejorar el throughput.
- Investigación en cuantización extrema: sirve como base para experimentar con FP4 en arquitecturas nuevas.
- Depuración y validación de pipelines FP4: la función `dequantize_fp4_sfa_fp16` permite verificar la corrección de las conversiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de velocidad, latencia ni comparativas con otros kernels o cuantizaciones.

## Requisitos de hardware

- GPUs Blackwell con arquitectura `sm_110a` (por ejemplo, B200) o `sm_120a` (por ejemplo, RTX 50 series).
- CUDA 13 o superior para los artefactos SM110.
- Se requiere una GPU NVIDIA compatible; no se soportan otras arquitecturas.
- No se especifican requisitos de VRAM, ya que los kernels operan sobre tensores existentes en memoria.
- El paquete se puede utilizar con PyTorch (ejemplo incluido) y probablemente con otros frameworks que permitan cargar kernels CUDA personalizados.
- No se mencionan opciones de despliegue como vLLM u Ollama; es una librería de bajo nivel.

## Comparativa con modelos similares

No disponible. No se han identificado paquetes equivalentes en la información proporcionada. Este tipo de kernels suele ser propietario o estar integrado en bibliotecas como CUTLASS o TensorRT, pero no hay comparación directa publicada.

## Limitaciones y advertencias

- Solo compatible con GPUs Blackwell (sm_110a, sm_120a); no funciona en arquitecturas anteriores.
- Requiere CUDA 13+ para SM110; puede haber problemas con versiones anteriores.
- Las dimensiones de los tensores deben ser divisibles por 16; algunas variantes tienen restricciones adicionales (por ejemplo, `dim <= 2048` en v1, `C <= 1024` en NCDHW, `C % 128 == 0` en el kernel fusionado NCDHW-to-NDHWC).
- Solo tensores CUDA; no soporta CPU ni otros backends.
- La licencia no está especificada, lo que puede limitar su uso comercial sin autorización explícita del autor.
- No hay documentación sobre errores conocidos ni mantenimiento activo.
- Al ser un paquete de kernels, no incluye un modelo entrenado; requiere integración manual con el pipeline de inferencia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/flashrt/fp4-fused-ops
