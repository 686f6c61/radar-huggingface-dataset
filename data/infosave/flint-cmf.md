# infosave/flint-cmf

## Resumen

Flint CMF es un paquete de pesos cuantizados del modelo Recursive Flint, un modelo de lenguaje de tipo mixtura de expertos (MoE) desarrollado por Recursive orientado a agentes de programación. El modelo original cuenta con 39.800 millones de parámetros totales y aproximadamente 2.500 millones de parámetros activos por token, según la documentación del autor upstream. Esta versión, publicada por el usuario infosave, empaqueta la revisión `2a247be0c0aec895ccb0ac7ca92229ec6df37288` en archivos CMF autónomos para el runtime en Rust `cortiq`, sin necesidad de Python ni de frameworks de aprendizaje automático para ejecutar los pesos descargados.

La relevancia de este paquete radica en que permite ejecutar un MoE de casi 40.000 millones de parámetros en hardware de consumo con un rendimiento medido de 140 tok/s en decodificación sobre una RTX A5000 mediante CUDA, y una lectura de un prompt de 4096 tokens en 1,7 segundos. Se ofrecen dos perfiles de precisión: `flint-q2tp.cmf` (aproximadamente 14,7 GB) y `flint-q4tp.cmf` (aproximadamente 21 GB), ambos con el mismo tokenizador, plantilla y geometría del modelo. El paquete requiere `cortiq` 0.8.30 o superior (0.8.96 o superior para CUDA), que es la primera versión capaz de ejecutar el perfil completo de atención y enrutamiento de Flint.

El modelo está diseñado específicamente para generación de texto y agentes de programación, con soporte declarado para inglés y ruso, y se distribuye bajo licencia Apache 2.0. La ventana de contexto configurada es de 262.144 tokens, aunque el autor advierte que el modelo es de texto y no un entorno de ejecución de herramientas, por lo que los flujos de uso de herramientas y razonamiento deben validarse en la aplicación donde se ejecute.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atención mixta deslizante/completa; 49 capas (2 densas + 47 MoE), todas con atención |
| Parametros totales | 39.800 millones (39.8B) |
| Parametros activos | ~2.500 millones (2.5B) por token |
| Longitud de contexto | 262.144 tokens configurados |
| Tipos de cuantizacion | q2tp (expertos enrutados `gate_proj`/`up_proj` a q2tp, resto q4tp); q4tp (matriz completa en q4tp) |
| Idiomas soportados | Inglés (en), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | CMF (archivos autónomos para el runtime `cortiq`) |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura de transformer con mixtura de expertos. La configuración preservada en el runtime incluye 49 capas en total: 2 capas con red feed-forward densa seguidas de 47 capas MoE, y las 49 mantienen atención. La atención es mixta: 35 capas de atención deslizante con ventana de 513 tokens (token actual más 512 precedentes) y 14 capas de atención completa. Las capas deslizantes aplican RoPE, mientras que las 14 capas de atención completa carecen de RoPE. Cada capa incorpora un sumidero de atención aprendido por cabeza (`softmax_offset`).

En cuanto a las cabezas, el modelo tiene 32 cabezas de consulta, 4 cabezas de clave/valor, dimensión de cabeza 128 y QK RMSNorm por cabeza. El componente MoE consta de 256 expertos enrutados, con selección top-6 por token, ancho enrutado de 512, más un experto compartido SwiGLU siempre activo de ancho 1024. El enrutamiento usa puntuaciones sigmoideas del router: los ganadores se eligen mediante el ranking ajustado por sesgo del router original y luego se normalizan las puntuaciones seleccionadas sin sesgo con el suelo de denominador `1e-20` del modelo fuente. El vocabulario es de 150.144 tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: el modelo está orientado a agentes de programación y razonamiento multi-paso, con recomendación del autor upstream de un presupuesto de salida de al menos 32.768 tokens incluyendo razonamiento.
- Generación de código: la model card incluye ejemplos de generación de funciones Python (por ejemplo, `merge_intervals`), lo que sugiere capacidades de programación.
- Modo de razonamiento ("thinking"): el runtime soporta el flag `--no-think`, lo que indica que el modelo tiene un modo de razonamiento explícito que puede desactivarse.
- Soporte de tool calling / function calling: la model card upstream describe uso de herramientas, aunque el paquete advierte que no es un entorno de ejecución de herramientas y que dichos flujos deben validarse en la aplicación.
- Capacidades multilingües: inglés y ruso declarados.
- Generación con muestreo configurable: temperatura 1.0, top-p 0.95 y top-k 20 recomendados por el autor upstream.
- Ejecución sin Python: los archivos CMF se ejecutan directamente con el runtime Rust `cortiq`, sin necesidad de framework de ML.

## Casos de uso

- Agentes de programación automatizados: el modelo está diseñado específicamente para agentes de código y puede generar funciones, parchear repositorios y razonar sobre estrategias de test, con un presupuesto de salida de 32.768 tokens que permite cadenas de razonamiento largas.
- Asistencia en generación de código en producción: con 2.5B parámetros activos por token y 140 tok/s en decodificación sobre una RTX A5000, es viable integrarlo en pipelines de CI/CD para generación de parches o revisión de código, aunque el autor advierte validar el código generado.
- Razonamiento multi-paso en local: la ventana de 262.144 tokens configurados permite procesar repositorios o documentación extensa en una sola pasada, adecuado para tareas de análisis de código a gran escala.
- Despliegue en hardware de consumo: el perfil `flint-q2tp.cmf` (14,7 GB) cabe en GPUs con 16-24 GB de VRAM, lo que permite ejecutar un MoE de 39.8B en estaciones de trabajo con una sola GPU consumer de gama alta.
- Procesamiento de documentación técnica en inglés y ruso: el soporte bilingüe permite generar y analizar documentación técnica en ambos idiomas, útil para equipos con documentación mixta.
- Evaluación de cuantización en investigación: los dos perfiles q2tp y q4tp, junto con la herramienta `cortiq flint-hybrid` para experimentos por capas, permiten estudiar el impacto de la precisión en expertos enrutados sobre la calidad de salida.
- Inferencia de baja latencia en escritorio: con el runtime `cortiq` y el backend WGPU (Vulkan en Linux, Metal en Apple silicon), se puede desplegar en entornos de escritorio sin CUDA, con `CMF_MULTISTEP=4` como ajuste de throughput codicioso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. El autor indica explícitamente que no se reclama ninguna puntuación de perplejidad ni evaluación amplia de tareas para los perfiles q2tp o q4tp.

Los únicos datos de rendimiento publicados son mediciones de velocidad en runtime:

| Metrica | Valor | Hardware |
|---|---|---|
| Decodificacion (tok/s) | 140 tok/s | RTX A5000, CUDA, `flint-q2tp.cmf` |
| Lectura de prompt de 4096 tokens | 1,7 s | RTX A5000, CUDA, `flint-q2tp.cmf` |

## Requisitos de hardware

- VRAM estimada para inferencia: `flint-q2tp.cmf` ocupa 14.684.032.647 bytes (~14,7 GB); `flint-q4tp.cmf` ocupa 20.992.265.863 bytes (~21 GB). A esto hay que añadir la memoria para el grafo de ejecución y el contexto.
- GPU recomendadas: RTX A5000 (medición oficial con CUDA); cualquier GPU con al menos 16 GB de VRAM para q2tp y 24 GB para q4tp.
- Cabe en GPU consumer: el perfil q2tp cabe en GPUs de 16 GB (por ejemplo, RTX 4060 Ti 16 GB, RTX 4070 Ti Super); el perfil q4tp requiere 24 GB (RTX 3090, RTX 4090).
- Opciones de despliegue: runtime Rust `cortiq` (versión 0.8.30 o superior; 0.8.96 o superior para CUDA). Backend WGPU con Vulkan en Linux y Metal en Apple silicon; backend CUDA en NVIDIA. No se mencionan vLLM, llama.cpp, Ollama ni TGI, ya que el formato CMF es específico de `cortiq`.
- Latencia y throughput: 140 tok/s de decodificación y 1,7 s para un prompt de 4096 tokens en RTX A5000 con CUDA. No se han publicado mediciones para otros hardware o backends.
- Ajuste de throughput: `CMF_MULTISTEP=4` es un ajuste opcional solo para decodificación codiciosa (`--greedy`), no un modo de calidad; se rechaza cuando no se cumplen sus condiciones de exactitud.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. El modelo base es Recursive Flint, y no se han facilitado datos de benchmarks ni de otros modelos de la misma categoría (MoE de ~40B con ~2.5B activos orientado a código) para establecer una comparación rigurosa.

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Flint CMF (este) | 39.8B | ~2.5B | 262.144 | Apache 2.0 | CMF |
| Recursive Flint (base) | 39.8B | ~2.5B | no disponible | no disponible | no disponible |
| Alternativas | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- El paquete es un modelo de texto, no un entorno de ejecución de herramientas. El autor advierte explícitamente que los flujos de uso de herramientas, razonamiento, código generado, permisos y límites de salida deben validarse en la aplicación donde se ejecute el modelo.
- El perfil q2tp no garantiza calidad equivalente al q4tp: es un perfil de expertos enrutados deliberadamente de menor precisión. No se reclama ninguna puntuación de perplejidad ni evaluación amplia de tareas.
- No se publica artefacto mixto Q2/Q4 en esta versión; la herramienta `cortiq flint-hybrid` genera un experimento separado y no sustituye a un benchmark de calidad.
- La longitud de contexto configurada (262.144 tokens) es un modo del runtime, no una garantía de que todas las longitudes hayan sido evaluadas; el autor indica que la recomendación de 32.768 tokens de salida es una recomendación de la fuente, no una afirmación de evaluación.
- El modelo solo declara soporte para inglés y ruso; no se garantiza un rendimiento adecuado en otros idiomas.
- Se desconoce el número de tokens de entrenamiento, la composición del dataset y si se aplicaron RLHF/DPO, lo que limita la evaluación de sesgos y riesgos de alucinación.
- La licencia Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base Recursive Flint, que no se detalla en la información proporcionada.
- El runtime `cortiq` debe ser 0.8.30 o superior (0.8.96 o superior para CUDA); versiones anteriores no son ejecutores compatibles con Flint.
- No se deben elevar límites de memoria GPU no documentados para forzar un grafo mayor, según advierte el autor.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/infosave/flint-cmf
- Modelo base Recursive Flint: https://huggingface.co/RecursiveSI/flint
- Revisión específica del modelo base: https://huggingface.co/RecursiveSI/flint/tree/2a247be0c0aec895ccb0ac7ca92229ec6df37288
- Runtime CMF: https://github.com/infosave2007/cmf
