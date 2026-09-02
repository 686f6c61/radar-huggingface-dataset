# Snapkitty/nvidia-stack

## Resumen

Snapkitty/nvidia-stack no es un modelo de inteligencia artificial convencional, sino un stack de cómputo GPU de bajo nivel desarrollado mediante ingeniería inversa. El proyecto, publicado por el autor Snapkitty, cubre la cadena completa desde operaciones tensoriales de alto nivel hasta ciclos de hardware, incluyendo simulación de Tensor Cores de NVIDIA, kernels de atención paginada (PagedAttention), implementaciones de Mamba-2 SSD, y soporte para arquitecturas AMD (gfx942) y x86-64. Se presenta como un producto corporativo "soberano" con licencia restringida (BSL-1.1 y AGPL-3.0) y uso comercial sujeto a una clave de nodo.

Aunque está alojado en Hugging Face con etiquetas de modelo, su naturaleza es de un repositorio de código y especificaciones, no un modelo entrenado con pesos. Su relevancia actual radica en la exploración de alternativas de bajo nivel para acelerar la inferencia de modelos de lenguaje y atención, así como en la integración de técnicas como PagedAttention y Mamba-2 en hardware heterogéneo. No se dispone de métricas de rendimiento ni de una comunidad activa (0 descargas, 0 likes al momento de la consulta).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Stack de cómputo GPU: simulación de Tensor Cores (NVIDIA), kernels MFMA (AMD), PagedAttention, Mamba-2 SSD, soporte x86-64 AVX2 y Quantum (QIR) |
| Parametros totales | no disponible (no es un modelo con pesos) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no aplica, aunque PagedAttention gestiona bloques de KV cache) |
| Tipos de cuantizacion | no disponible (menciona fp8 en kernels Mamba-2, pero sin detalle) |
| Idiomas soportados | no disponibles (no es un modelo de lenguaje) |
| Licencia | BSL-1.1 y AGPL-3.0 (según badges); aviso: "NOT OPEN SOURCE", uso comercial requiere Sovereign Node Key |
| Formato de pesos | no disponible (no hay pesos; el repositorio contiene código fuente en Rust, Python, CUDA, HIP, ensamblador, Datalog) |

## Arquitectura y entrenamiento

El proyecto no sigue una arquitectura de red neuronal entrenada, sino un diseño de software modular que simula y acelera operaciones de cómputo de GPU. La arquitectura se organiza en capas lógicas (especificaciones en Datalog para PagedAttention) y físicas (implementaciones en HIP/CUDA para kernels). Incluye un simulador de Tensor Cores en Rust que modela instrucciones SASS (HMMA, LDG, STG), un gestor de bloques de atención paginada con free list lock-free, y kernels de Mamba-2 SSD con cuantización fp8. No hay fase de entrenamiento; el "entrenamiento" se sustituye por el desarrollo y validación de kernels y especificaciones formales, con pruebas estructurales y de integridad (por ejemplo, en Datalog se definen constraints de alineación y refcount).

La innovación técnica destacable es la combinación de especificaciones lógicas verificables (Souffle Datalog) con implementaciones físicas optimizadas para hardware específico (gfx942, sm_86+). También se aborda la reducción de conflictos de banco en memoria compartida mediante XOR swizzle y el uso de MFMA para GEMM.

## Capacidades

- Simulación de Tensor Cores de NVIDIA a nivel de instrucción (SASS) y microarquitectura (MAC units, pipeline, clock).
- Implementación de PagedAttention con gestor de bloques, prefijo de caché y swap a CPU, validada mediante especificación Datalog.
- Kernels de Mamba-2 SSD en CUDA y HIP, con soporte de cuantización fp8.
- Generación de kernels de ensamblador para AMDGPU (gfx90a/gfx942) y x86-64 (AVX2 GEMV).
- Soporte para cuantificación y optimización de layout de memoria (padding, XOR swizzle).
- Representación de circuitos cuánticos con Rust-Q y QIR, incluyendo verificación de no-clonación y dominio de ángulos.
- Integración de un dialecto FSL (Finite State + Linear) para transiciones de estado de Mamba-2 con semántica híbrida continua/discreta.
- No dispone de capacidades de generación de texto, razonamiento, visión o tool calling, al no ser un modelo de IA generativa.

## Casos de uso

- Investigación en sistemas de bajo nivel: permite estudiar el comportamiento de Tensor Cores y MFMA sin necesidad de hardware físico, útil para académicos y desarrolladores de compiladores.
- Desarrollo de kernels optimizados para inferencia de modelos de atención: el código de PagedAttention puede servir como referencia para implementar gestores de KV cache en motores de inferencia propios.
- Simulación de rendimiento de hardware: el simulador en Rust puede estimar ciclos de reloj y uso de memoria para cargas de trabajo específicas antes de desplegar en GPU reales.
- Validación formal de protocolos de memoria: las especificaciones Datalog permiten verificar la integridad de las tablas de bloques en sistemas de atención paginada, reduciendo errores en producción.
- Exploración de arquitecturas híbridas SSM y atención: los kernels de Mamba-2 SSD pueden integrarse en prototipos de modelos que combinen state space models con atención tradicional.
- Enseñanza de arquitectura de GPUs: el código y los diagramas facilitan la comprensión de conceptos como bank conflicts, MFMA y gestión de memoria en cursos avanzados de computación paralela.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única referencia a validación es un "Fragmentation Benchmark" con workload ShareGPT para PagedAttention, pero no se ofrecen cifras numéricas.

## Requisitos de hardware

- Para ejecutar los kernels HIP se requiere hardware AMD con arquitectura gfx90a o gfx942 (por ejemplo, MI200/MI300).
- Para los kernels CUDA se necesitan GPUs NVIDIA con compute capability sm_86 o superior (por ejemplo, RTX 30xx, A100, H100).
- El simulador en Rust y los kernels x86-64 AVX2 pueden ejecutarse en CPUs modernas sin GPU dedicada.
- No se especifican requisitos de VRAM, ya que el proyecto no tiene pesos de modelo. La memoria dependerá del tamaño de los buffers de prueba.
- Opciones de despliegue: compilación local con nvcc, hipcc, cargo (Rust) y nasm. No se mencionan integraciones con vLLM, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han identificado proyectos comparables en el ámbito de stacks de cómputo GPU de ingeniería inversa con la misma combinación de especificaciones formales, kernels de bajo nivel y soporte multiarquitectura. Podría compararse parcialmente con repositorios académicos de kernels de atención, pero no se dispone de información suficiente para una tabla.

## Limitaciones y advertencias

- No es un modelo de IA: no ofrece capacidades de generación, razonamiento ni procesamiento de lenguaje natural. Su uso principal es como biblioteca de bajo nivel.
- Licencia restrictiva: a pesar de los badges de BSL-1.1 y AGPL-3.0, la propia model card indica que el producto es "sovereign" y que el uso comercial requiere una clave de nodo. Esto limita su adopción en entornos empresariales.
- Sin comunidad ni soporte: al tener 0 descargas y 0 likes, no hay evidencia de mantenimiento activo ni de resolución de incidencias.
- Fecha de creación futura (2026-09-01) sugiere que el proyecto podría ser experimental o no verificado.
- Falta de documentación sobre compatibilidad con versiones de CUDA/HIP más allá de CUDA 12.x y gfx942.
- Riesgo de alucinación: no aplica al ser código, pero sí riesgo de errores en la simulación de hardware si no se valida contra hardware real.
- No se proporcionan instrucciones de instalación ni ejemplos de uso en la model card, lo que dificulta su puesta en marcha.

## Enlaces

- Hugging Face: https://huggingface.co/Snapkitty/nvidia-stack
- Repositorio GitHub referenciado: https://github.com/SNAPKITTYWEST/nvidia-stack (enlace inferido de la model card; no verificado)
- Página de productos SnapKitty: https://collectivekitty.com/products
- Descargas SnapKitty: https://collectivekitty.com/downloads
