# jinhwan000/supertonic-3-stcu

## Resumen

supertonic-3-stcu es un repositorio de activos de ejecución (runtime assets) del modelo de síntesis de voz Supertone/supertonic-3, publicado por el usuario jinhwan000. No se trata de un modelo reentrenado ni cuantizado, sino de los mismos pesos ONNX originales en f32 reorganizados para dos backends de inferencia de alto rendimiento: un motor CUDA propio escrito en Rust (con kernels personalizados y cuBLASLt) y un conjunto de grafos OpenVINO 2026.4.1 orientados a GPUs Intel Arc. El objetivo es habilitar un motor de *continuous batching* por rondas en el que todas las peticiones activas avanzan un paso de *flow matching* por ronda, empaquetadas en un único forward pass sin padding (packed varlen).

El modelo subyacente es un sistema TTS de dos etapas (estimador vectorial con flow matching y vocoder causal) con codificador de texto y predictor de duración, que cubre 31 idiomas y ofrece 10 voces predefinidas (F1–F5, M1–M5). La relevancia de este repositorio es de ingeniería: documenta con detalle las decisiones de empaquetado, los buckets estáticos por longitud, las precisiones recomendadas por backend y las métricas de paridad y throughput, lo que lo convierte en una referencia útil para quien despliegue TTS en producción sobre CUDA o Intel Arc.

La licencia es BigScience Open RAIL-M, heredada del modelo original, con las restricciones de uso que esta impone. El repositorio ocupa 0,8 GB e incluye fixtures de paridad para validación a nivel de módulo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TTS en dos etapas: estimador vectorial con flow matching (paso Euler, total 8) + vocoder causal; codificador de texto y predictor de duración separados |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de atención de texto por *tile*; tamano no especificado) |
| Tipos de cuantizacion | Pesos upstream en f32; inferencia en bf16 (CUDA) y f16 (OpenVINO para VE y vocoder); TE y DP en f32 sobre CPU |
| Idiomas soportados | 31: en, ko, ja, ar, bg, cs, da, de, el, es, et, fi, fr, hi, hr, hu, id, it, lt, lv, nl, pl, pt, ro, ru, sk, sl, sv, tr, uk, vi |
| Licencia | BigScience Open RAIL-M (openrail) |
| Formato de pesos | safetensors (CUDA, 693 tensores f32) y OpenVINO IR (.xml/.bin); ONNX upstream en el repo espejo |

## Arquitectura y entrenamiento

El repositorio no entrena nada: redistribuye los pesos ONNX f32 del modelo Supertone/supertonic-3, reorganizados para dos backends. El pipeline consta de cuatro módulos: codificador de texto (TE), predictor de duración (DP), estimador vectorial (VE) con flow matching y guiado libre de clasificador (CFG), y vocoder causal. El motor ejecuta rondas de *continuous batching*: cada petición activa (chunk) avanza un paso de flow matching por ronda y todas se empaquetan en un solo forward pass sin padding, con convoluciones depthwise y atención *segment-aware* que respetan los límites de cada secuencia dentro del lote empaquetado.

En CUDA se usan kernels en Rust, GEMM bf16 vía cuBLASLt y CUDA graphs por bucket de suma de longitudes (ΣL). En OpenVINO, el grafo `ve_round_v2` implementa el paso VE empaquetado con CFG, atención de texto por ventana con *tiling* y salida de atención D1; el vocoder se empaqueta con filas latentes dinámicas. La versión 2 del IR sustituye la convolución depthwise por un Gather 1-D por tap con multiplicación y acumulación, lo que aporta entre un 11 % y un 13 % más de throughput con 8–64 peticiones concurrentes en una Arc B580, con diferencias numéricas dentro de 2e-6 en f32 y sin cambios en la latencia de una sola petición. Los módulos TE y DP se ejecutan en CPU en f32 (batch 1) porque el TE dinámico en GPU falla con `CL_OUT_OF_RESOURCES` en OpenVINO 2026.4.1.

## Capacidades

- Síntesis de voz (text-to-speech) multilingüe en 31 idiomas, incluidos español, inglés, coreano, japonés, árabe, hindi y la mayoría de lenguas europeas.
- Diez voces predefinidas (F1–F5 y M1–M5) definidas mediante tablas de estilo en JSON.
- Control de duración mediante predictor de duración dedicado, con detección de fin de frase y reintentos.
- Normalización de sonoridad y comprobaciones de calidad por chunk integradas en el motor.
- *Continuous batching* con empaquetado varlen sin padding para servir múltiples peticiones concurrentes.
- Ejecución en dos backends: CUDA (Rust + cuBLASLt, bf16) y OpenVINO 2026.4.1 (Intel Arc, f16).
- No soporta tool calling, agentes, visión, audio de entrada ni *thinking mode*: es exclusivamente un modelo TTS.

## Casos de uso

- Servicio TTS multiusuario en producción: el motor de *continuous batching* por rondas permite atender decenas de peticiones concurrentes manteniendo un factor de tiempo real alto (680 en RTX 5080 con 32 peticiones concurrentes), adecuado para APIs de locución.
- Audiolibros y narración larga: el procesamiento por chunks con detección de fin de frase y control de duración permite sintetizar párrafos completos manteniendo coherencia prosódica y sonoridad uniforme.
- Doblaje y localización: la cobertura de 31 idiomas con voces femeninas y masculinas facilita generar pistas de voz en múltiples mercados desde un mismo pipeline.
- Asistentes de voz embebidos en GPU de consumo: con una RTX 5080 se obtiene latencia de 17 ms por paso total (8 pasos) para una frase media de 7,1 s de audio, lo que permite interacción conversacional de baja latencia.
- Despliegue en infraestructura Intel: los grafos OpenVINO permiten servir TTS en GPUs Arc B580 con 149–290 de factor de tiempo real según concurrencia, útil en entornos sin NVIDIA.
- Generación de avisos y notificaciones automatizadas: la baja latencia por petición y el soporte multilingüe lo hacen apto para sistemas de alertas, IVR y mensajería de voz personalizada.
- Validación y CI de pipelines TTS: los fixtures de paridad incluidos (CUDA fp32 y OpenVINO) permiten verificar regresiones numéricas a nivel de módulo en integración continua.

## Benchmarks y rendimiento

Paridad frente a la referencia PyTorch/ONNX en fp32, sobre 101 peticiones y 361 chunks:

| Backend | Paridad de módulo | Decisiones extremo a extremo | SNR mediana por chunk |
|---|---|---|---|
| CUDA fp32 (RTX 5080) | VE round 5,1e-7 · vocoder 1,7e-6 | 101/101 | 92,1 dB |
| OpenVINO f32 (Arc B580) | VE 1,9e-6 · paso Euler 2,9e-7 · vocoder 2,1e-6 | 101/101 | 86,5 dB |

Throughput del motor (bf16/f16), expresado como factor de tiempo real (segundos de audio por segundo):

| Backend | 1 concurrente | 8 | 32 | 64 |
|---|---:|---:|---:|---:|
| CUDA, RTX 5080 | 380 | 627 | 680 | 675 |
| OpenVINO, Arc B580 | 149 | 290 | 276 | 278 |

Latencia de una sola petición (paso total 8, frase media en coreano de 7,1 s de audio, incluida detección y comprobación de sonoridad): 17 ms en CUDA y 42 ms en OpenVINO. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo TTS.

## Requisitos de hardware

- CUDA: requiere GPU NVIDIA con soporte bf16 y cuBLASLt; validado en RTX 5080. No se especifica VRAM mínima para este backend.
- OpenVINO: validado en Intel Arc B580 con OpenVINO 2026.4.1 y driver 32.0.101.8991; no debe usarse la caché de compilación de OpenVINO.
- VRAM en OpenVINO: los 12 buckets estáticos del VE en f16 necesitan unos 6,1 GB; en f32 unos 12,7 GB, lo que no cabe en la B580. La configuración recomendada es buckets estáticos hasta 1024 filas más un modelo dinámico por encima, con unos 3,9 GB en f16.
- CPU: el codificador de texto y el predictor de duración se ejecutan en CPU en f32; se recomienda limitar hilos (4 streams × 2 hilos para TE y 2 × 1 para DP) para evitar que el hint de latencia por defecto sature todos los núcleos.
- GPU de consumo: una RTX 5080 es suficiente para el backend CUDA; una Arc B580 para el backend OpenVINO con la configuración de buckets indicada.
- Despliegue: el repositorio está pensado para el motor propio `stcu_runtime` (CUDA) y OpenVINO; no se mencionan integraciones con vLLM, llama.cpp, Ollama ni TGI, que además no aplican a TTS.
- Throughput y latencia: ver la tabla de benchmarks; el factor de tiempo real oscila entre 149 y 680 según backend y concurrencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| supertonic-3-stcu | no disponible | no disponible | 31 | OpenRAIL-M | safetensors + OpenVINO IR | Runtime optimizado para CUDA y Arc; continuous batching |
| Supertone/supertonic-3 (upstream) | no disponible | no disponible | 31 | OpenRAIL-M | ONNX f32 | Modelo original; sin motor de batching específico |
| jinhwan000/supertonic-3-mirror | no disponible | no disponible | 31 | OpenRAIL-M | ONNX f32 | Espejo del upstream con la model card original y muestras |

No se dispone de datos de benchmarks comparativos con otros sistemas TTS en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo nuevo ni afinado: cualquier mejora o regresión de calidad respecto al upstream depende exclusivamente del motor de inferencia.
- El backend OpenVINO tiene requisitos frágiles: compilar sin caché, TE dinámico en GPU falla con `CL_OUT_OF_RESOURCES` en 2026.4.1, y la configuración f32 de todos los buckets no cabe en una Arc B580.
- Los pesos están en f32 y la inferencia en bf16/f16; la paridad numérica es muy alta pero no exacta (diferencias del orden de 1e-6 a 1e-7).
- Riesgo de alucinación y artefactos prosódicos inherente a los sistemas TTS: el motor incluye detección de fin de frase y reintentos, pero no elimina errores de pronunciación en textos ambiguos.
- Solo 10 voces predefinidas; no se documenta clonación de voz ni control emocional.
- La licencia Open RAIL-M impone restricciones de uso (use-based restrictions) que afectan a aplicaciones comerciales y a usos sensibles como suplantación de identidad o desinformación; es responsabilidad del integrador revisarlas.
- No hay datos publicados sobre sesgos por idioma ni sobre calidad relativa entre los 31 idiomas soportados.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/jinhwan000/supertonic-3-stcu
- Modelo base: https://huggingface.co/Supertone/supertonic-3
- Espejo del repositorio original: https://huggingface.co/jinhwan000/supertonic-3-mirror
- Licencia Open RAIL-M: https://huggingface.co/jinhwan000/supertonic-3-stcu/blob/main/LICENSE
- OpenVINO: https://docs.openvino.ai/
- cuBLASLt: https://docs.nvidia.com/cuda/cublas/
