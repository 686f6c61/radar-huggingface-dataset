# ddalcu/Inkling-2-Mini-MLX-Serve-iQ-MLX-3.1bpw

## Resumen

Inkling-2-Mini es un modelo multimodal de tipo mezcla de expertos (MoE) desarrollado por Thinking Machines, con 26.388.641.280 parámetros totales y 3.400 millones de parámetros activos por token, capaz de procesar texto e imágenes. Esta ficha concreta no es el modelo original, sino una requantización comunitaria publicada por ddalcu bajo el identificador `ddalcu/Inkling-2-Mini-MLX-Serve-iQ-MLX-3.1bpw`, empaquetada en formato MLX para ejecutarse en Macs con 16 GB de memoria unificada. El pack reduce los pesos de texto de 18,9 GB (release original) a 9,98 GB mediante cuantización mixta por capas.

La relevancia de esta publicación es práctica: demuestra que un MoE de 26,4B con visión puede caber y funcionar a velocidades de decodificación de 30-33 tok/s en hardware Apple de gama consumer, a costa de una degradación medible pero acotada (KLD medio de 0,0756 y 87,6% de acuerdo top-1 frente al release). La licencia Apache 2.0 del modelo base facilita su uso comercial, aunque conviene verificar las condiciones del modelo original.

Este pack está pensado para inferencia local con `mlx-serve` o `mlx-lm`, con un presupuesto de expertos de 8,98 GB resuelto mediante un escaneo de sensibilidad capa a capa. No incluye la cabeza de borrador (draft head) para decodificación especulativa, por lo que no se beneficia de esa técnica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) transformer multimodal (texto + imagen), formato MLX |
| Parametros totales | 26.388.641.280 (26,4B) |
| Parametros activos | 3,4B |
| Longitud de contexto | 14.336 tokens con ajustes por defecto en M4 Mac mini de 16 GB |
| Tipos de cuantizacion | Expertos enrutados: affine 3-bit grupo 128 (capas 0-4 y 21 en 2-bit grupo 128; capas 19 y 23 en 2-bit grupo 64). Atención, embedding y cabeza: affine 4-bit grupo 64. Torre de visión: bf16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), 9,98 GB de pesos de texto + 0,64 GB de torre de visión en bf16 |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal con 26,4B de parámetros totales y 3,4B activos, diseñado para entrada image-text-to-text. La arquitectura interna del modelo original (número de capas, configuración de enrutamiento, composición del dataset de entrenamiento, uso de RLHF/DPO) no está detallada en la información disponible. Lo que sí se conoce por esta ficha es la estructura de cuantización: 24 capas afectadas por el esquema de anchos por capa (se mencionan explícitamente las capas 0-4, 19, 21 y 23), con atención leída en su totalidad en cada una de las 48 pasadas de capa.

La innovación técnica de este pack es la asignación de precisión por capa basada en un escaneo de sensibilidad: cada capa se evalúa con sus expertos a 2 bits y se puntúa por divergencia KL, resolviendo después un presupuesto total de 8,98 GB para expertos. La atención se mantiene a 4 bits precisamente porque se relee en las 48 pasadas, lo que según el autor es lo que hace el pack rápido en un Mac de 16 GB. No se incluye draft head, por lo que no hay decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes (image-text-to-text) mediante torre de visión en bf16, opcional y desactivable con `--no-vision`.
- Razonamiento y generación de código: capacidad inferida del modelo base, no verificada con benchmarks en esta ficha.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; el campo de idiomas del repo está vacío.
- Modo thinking explícito: no disponible.

## Casos de uso

- Inferencia local en Mac de 16 GB: el pack está dimensionado para arrancar con ajustes por defecto en un M4 Mac mini de 16 GB con contexto de 14.336 tokens, lo que permite desplegar un MoE de 26,4B sin GPU dedicada.
- Asistente conversacional de escritorio: con 30-33 tok/s de decodificación, es viable para chat interactivo multi-turno en local sin depender de la nube.
- Procesamiento de documentos con imagen: al conservar la torre de visión, puede recibir capturas, escaneos o figuras junto a texto; útil para extracción de información en flujos offline.
- Prototipado y evaluación de MoEs: sirve para comparar el comportamiento del modelo base a 3,1 bpw frente a variantes de mayor precisión (3,7 bpw y 8-bit del mismo autor) con métricas de KLD y perplejidad publicadas.
- Entornos con requisitos de privacidad: al ejecutarse íntegramente en local con pesos Apache 2.0, encaja en escenarios donde los datos no pueden salir del dispositivo.
- Desarrollo sobre MLX: útil para validar integraciones con `mlx-serve` y `mlx-lm` (PR #2086), incluyendo la paridad entre ambos runtimes.
- Razonamiento y código en local: si el modelo base rinde en estas tareas, el pack permite usarlo en un portátil; no hay benchmarks que lo confirmen en esta ficha.

## Benchmarks y rendimiento

Calidad frente al release (teacher-forced top-20, 8 archivos reservados, 7.318 posiciones):

| Pack | Pesos de texto | KLD medio | Acuerdo top-1 | Perplejidad |
|---|---|---|---|---|
| Release | 18,9 GB | – | – | 6,147 |
| Este pack (3.1 bpw) | 9,98 GB | 0,0756 | 87,6% | 6,526 |
| Mismo presupuesto, atención 8-bit | 9,99 GB | 0,0794 | 87,7% | 6,608 |
| iQ-MLX 3.7 bpw | ~12 GB | 0,0324 | no disponible | no disponible |
| MLX 8-bit | 18 GB | 0,0040 | no disponible | no disponible |

Paridad entre runtimes: sobre 3.995 posiciones, `mlx-serve` y `mlx-lm` coinciden con KLD 0,0042 y top-1 del 97,4%.

Velocidad con `mlx-serve`:

| Mac | Decodificación | Decodificación con prompt de 3,3k tokens |
|---|---|---|
| M4 Mac mini 16 GB | 32,8 tok/s | 29,5 tok/s |
| M1 Pro 32 GB | 30,8 tok/s | no disponible |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada: ~9,98 GB de pesos de texto; +0,64 GB si se activa la torre de visión. El pack arranca con contexto de 14.336 tokens en 16 GB.
- Hardware objetivo: Macs con Apple Silicon y 16 GB o más de memoria unificada. Validado en M4 Mac mini 16 GB y M1 Pro 32 GB.
- GPU dedicadas (A100, H100, RTX 4090): no aplicable directamente; el formato es MLX, específico de Apple Silicon.
- Despliegue: `mlx-serve` (comando de ejemplo en la model card) y `mlx-lm` (PR #2086). No se mencionan vLLM, llama.cpp, Ollama ni TGI para este pack.
- Throughput: 32,8 tok/s en decodificación pura y 29,5 tok/s con prompt de 3,3k tokens en M4 Mac mini 16 GB; 30,8 tok/s en M1 Pro 32 GB.
- Latencia de arranque y uso de memoria pico: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Calidad (KLD) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este pack (iQ-MLX 3.1 bpw) | 26,4B totales / 3,4B activos | 14.336 en 16 GB | 0,0756 | Apache 2.0 | MLX, 9,98 GB |
| iQ-MLX 3.7 bpw (mismo autor) | 26,4B / 3,4B | no disponible | 0,0324 | Apache 2.0 | MLX, ~12 GB |
| MLX 8-bit (mismo autor) | 26,4B / 3,4B | no disponible | 0,0040 | Apache 2.0 | MLX, 18 GB |
| thinkingmachines/Inkling-2-Mini (release) | 26,4B / 3,4B | no disponible | referencia | Apache 2.0 | safetensors, 18,9 GB |

Las tres variantes comparten modelo base y licencia; la diferencia es el compromiso memoria-calidad. La comparación con modelos de otros fabricantes no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Pérdida de calidad medible: KLD medio de 0,0756 y 87,6% de acuerdo top-1 frente al release; un 12,4% de posiciones discrepan en la predicción principal.
- Cuantización agresiva en capas concretas: capas 0-4 y 21 a 2 bits (grupo 128) y capas 19 y 23 a 2 bits (grupo 64), lo que puede afectar de forma desigual a ciertos tipos de entrada.
- Sin draft head: no hay decodificación especulativa, lo que limita el throughput máximo alcanzable.
- Visión opcional: con `--no-vision` la torre de imagen queda en disco y el modelo no procesa imágenes.
- Contexto limitado por memoria: 14.336 tokens con ajustes por defecto en 16 GB; contextos mayores no están documentados.
- Idiomas no declarados: el repo no especifica idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse antes de producción.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base `thinkingmachines/Inkling-2-Mini`.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta; es un artefacto comunitario, no una publicación oficial.
- Dependencia de tooling: requiere `mlx-serve` o la PR #2086 de `mlx-lm`; no es portable a otros runtimes sin conversión.

## Enlaces

- Repositorio de este pack: https://huggingface.co/ddalcu/Inkling-2-Mini-MLX-Serve-iQ-MLX-3.1bpw
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante iQ-MLX 3.7 bpw: https://huggingface.co/ddalcu/Inkling-2-Mini-MLX-Serve-iQ-MLX-3.7bpw
- Variante MLX 8-bit: https://huggingface.co/ddalcu/Inkling-2-Mini-MLX-8bit
- PR de mlx-lm con el layout: https://github.com/ml-explore/mlx-lm/pull/2086
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
