# mlboydaisuke/granite-4.0-h-CoreAI

## Resumen

Granite-4.0-H-CoreAI es una conversión del modelo IBM Granite 4.0-H (en sus variantes de 1B y 350M parámetros) al formato `.aimodel` de Apple Core AI, el runtime de inferencia en dispositivo que sustituye a Core ML en iOS 27 y macOS 27. El trabajo lo publica el usuario mlboydaisuke sobre el modelo base `ibm-granite/granite-4.0-h-1b` y `ibm-granite/granite-4.0-h-350m`, ambos bajo licencia Apache 2.0. El repositorio ocupa 10,3 GB y contiene varios bundles cuantizados listos para ejecutarse en GPU o Neural Engine de chips Apple.

La relevancia técnica del artefacto es doble. Por un lado, es la primera conversión a Core AI de una arquitectura SSM (Mamba-2) híbrida con atención: los 36 mixers Mamba-2 y las 4 capas de atención NoPE GQA del modelo 1B se exportan con un bucle de decodificación sin `while_loop`, tratando el estado de convolución y el estado SSM como dos tensores extra de forma fija. Por otro, incluye mediciones reproducibles de velocidad de decodificación en hardware de consumo: 35 tok/s en un iPhone 17 Pro y 136 tok/s en la GPU de un M4 Max con el bundle int8.

El modelo base resuelve generación de texto y razonamiento ligero en entornos sin conectividad, y esta conversión lo hace desplegable en aplicaciones iOS y macOS nativas con el motor `coreai-pipelined` de Apple. Es un artefacto de interés para desarrolladores de aplicaciones Apple que necesiten LLM locales con latencia baja y sin dependencia de servidores.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida Mamba-2 + Transformer (36 mixers Mamba-2 y 4 capas de atención NoPE GQA en el 1B) |
| Parámetros totales | 1B y 350M (dos variantes del modelo base) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | int8hu (cabecera int8), int8lin, fp16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.aimodel` (bundles de Apple Core AI), exportados desde PyTorch con `coreai-torch` / `coreai.llm.export` |

## Arquitectura y entrenamiento

El modelo base Granite 4.0-H emplea una arquitectura híbrida que combina capas Mamba-2 (modelo de espacio de estados selectivo) con capas de atención Transformer. En la variante de 1B, la proporción es de 36 mixers Mamba-2 frente a 4 capas de atención NoPE con GQA, lo que reduce el coste de atención a contexto largo y mantiene un estado recurrente de tamaño fijo. Esta conversión no reentrena el modelo: parte de los pesos publicados por IBM y los exporta al formato de Apple.

La innovación técnica de esta ficha está en el pipeline de exportación. El grafo de decodificación se genera sin bucles (`while_loop`), de modo que el escaneo selectivo de Mamba-2 a longitud de secuencia 1 se reduce a un único paso de recurrencia. Los estados de convolución y SSM viajan como dos estados extra de forma fija, lo que permite al motor `coreai-pipelined` ejecutar la decodificación con codificación asíncrona, muestreo argmax en GPU y crecimiento de caché KV en dispositivo, sin kernels personalizados. Los detalles de entrenamiento del modelo original (número de tokens, composición del dataset, RLHF/DPO) no se documentan en la información disponible.

## Capacidades

- Generación de texto autoregresiva en dispositivo, sin conexión de red.
- Razonamiento ligero y respuesta a instrucciones conversacionales, heredado del modelo base Granite 4.0-H.
- Ejecución en GPU y Neural Engine de chips Apple mediante el runtime Core AI.
- Decodificación con muestreo greedy (argmax en GPU) verificada token a token contra el oráculo fp32 de Hugging Face.
- Integración con CoreAIKit 0.7.3, que expone operaciones de alto nivel como `CoreAI.summarize` y sesiones de chat (`ChatSession`).
- Soporte de ejecución headless en macOS mediante el CLI `chat-cli` del ejemplo ChatDemo.
- Tool calling, function calling, agentes multi-paso, visión, audio y modo thinking: no disponibles en la información proporcionada.

## Casos de uso

- Asistentes conversacionales en apps iOS: el bundle de 1B int8hu (1,79 GB) se ejecuta a 35 tok/s en un iPhone 17 Pro, suficiente para respuestas interactivas sin salir del dispositivo y sin coste de API.
- Resumen de texto en local: la API `CoreAI.summarize(text, options: .model("granite-4.0-h-1b"))` permite añadir resumen de documentos a una app macOS o iOS con una sola línea de código y descarga del modelo en el primer uso.
- Procesamiento por lotes en Mac: con 136 tok/s en la GPU de un M4 Max, el bundle int8lin sirve para tareas de generación masiva offline (clasificación, extracción, reescritura) en pipelines de escritorio.
- Funciones de autocompletado o sugerencia de texto en editores nativos: la variante de 350M fp16 (0,66 GB, 191 tok/s en M4 Max) ofrece latencia baja con una huella de memoria reducida, adecuada para inferencia en segundo plano.
- Agentes headless en macOS: el CLI `chat-cli` del ejemplo ChatDemo permite invocar el modelo desde scripts y flujos automatizados sin interfaz gráfica.
- Aplicaciones con requisitos de privacidad: al ejecutarse íntegramente en dispositivo, el modelo evita enviar datos del usuario a servidores externos, lo que encaja en sectores con restricciones de tratamiento de datos.
- Prototipado de apps Apple con LLM local: el repositorio incluye bundles b1 y b2 compatibles con distintas versiones del toolchain de iOS 27, lo que facilita fijar una versión y mantener compatibilidad con catálogos existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K) en la información disponible. Sí se documentan métricas de velocidad de decodificación y verificaciones numéricas:

| Superficie | Bundle | Tamaño | Prefill (S=1) | Decode |
|---|---|---:|---:|---:|
| 1B int8hu, iPhone 17 Pro | int8hu (cabecera int8) | 1,79 GB | 35,1–37,0 tok/s | 35,4–37,1 tok/s |
| 1B int8hu, M4 Max | int8hu | 1,79 GB | 134,9 tok/s | 134,2 tok/s |
| 1B int8lin, M4 Max | int8lin | 1,63 GB | 136,7 tok/s | 136,5 tok/s |
| 1B int8lin, iPhone 17 Pro | int8lin | 1,63 GB | 30,1–32,2 tok/s | 30,2–31,3 tok/s |
| 350M fp16, M4 Max | fp16 | 0,66 GB | 193,2 tok/s | 191,1 tok/s |

Verificación numérica: 16 de 16 pasos de decodificación con teacher forcing coinciden en top-1 con el oráculo fp32 de Hugging Face, y las secuencias greedy del iPhone son idénticas token a token (24 de 24) a las de la GPU del Mac en dos prompts fijos.

## Requisitos de hardware

- VRAM/memoria unificada estimada: 0,66 GB para el bundle 350M fp16; 1,63 GB para el 1B int8lin; 1,79 GB para el 1B int8hu.
- GPU recomendadas: GPU de Apple Silicon. Medido en M4 Max; el runtime Core AI también puede usar el Neural Engine.
- Cabe en hardware de consumo: sí, en iPhone 17 Pro y en Mac con M4 Max según las mediciones publicadas; otras generaciones de chip no están documentadas.
- Despliegue: runtime Apple Core AI (iOS 27 / macOS 27), con bundles para el toolchain beta 3 (b2, `coreai-core 1.0.0b2`) y el árbol b1 original. El ejemplo ChatDemo de CoreAIKit 0.7.3 requiere Xcode 27 (build 27A266a según el pin de la release).
- Latencia y throughput: 30–37 tok/s en iPhone 17 Pro y 134–191 tok/s en M4 Max, según bundle y variante del modelo.
- vLLM, llama.cpp, Ollama y TGI no son aplicables: el formato `.aimodel` solo se ejecuta en el runtime de Apple.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Decode medido | Licencia | Plataforma |
|---|---|---|---|---|---|
| Granite 4.0-H 1B Core AI (esta ficha) | 1B (híbrido Mamba-2) | no disponible | 35 tok/s iPhone 17 Pro; 136 tok/s M4 Max | Apache 2.0 | Core AI (iOS/macOS 27) |
| Qwen3-8B 4-bit en Core AI | 8B | no disponible | 94 tok/s M4 Max GPU | no disponible | Core AI (iOS/macOS 27) |
| Qwen3-8B 4-bit en MLX | 8B | no disponible | 90 tok/s M4 Max | no disponible | MLX (macOS) |
| Granite 4.0-H 1B original (IBM) | 1B | no disponible | no disponible | Apache 2.0 | PyTorch / safetensors |

La comparación con Qwen3-8B procede de la referencia del autor al benchmark apple-silicon-llm-bench y no es una comparación de calidad, sino de velocidad de decodificación en el mismo hardware.

## Limitaciones y advertencias

- Dependencia de versiones beta: los bundles b1 fallan al cargar en el toolchain beta 3 de iOS 27 con un error de IR versionado; es necesario usar el árbol `gpu-pipelined-b2/` en ese entorno.
- Compatibilidad limitada: solo se ejecuta en el runtime Core AI de Apple (iOS 27 / macOS 27); no es utilizable en CUDA, ROCm ni CPU genérica.
- Cobertura de hardware medida reducida: las cifras publicadas corresponden a iPhone 17 Pro y M4 Max; no hay datos para otros chips.
- Idiomas soportados no documentados: no se especifica qué lenguas cubre el modelo base ni su calidad fuera del inglés.
- Longitud de contexto no disponible: no se indica la ventana máxima soportada ni el comportamiento del estado recurrente en secuencias largas.
- Riesgo de alucinación: inherente a un modelo de 1B parámetros; no se han publicado evaluaciones de fidelidad factual.
- Sesgos: no se documentan análisis de sesgo del modelo base ni de esta conversión.
- Licencia Apache 2.0: permite uso comercial, pero el autor de la conversión no ofrece garantías sobre el artefacto exportado.
- Madurez: 9 descargas y 0 likes en el momento de la consulta; es un artefacto reciente con validación numérica acotada a dos prompts fijos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/mlboydaisuke/granite-4.0-h-CoreAI
- Réplica de la comunidad: https://huggingface.co/coreai-community/granite-4.0-h-CoreAI
- Modelo base 1B: https://huggingface.co/ibm-granite/granite-4.0-h-1b
- Modelo base 350M: https://huggingface.co/ibm-granite/granite-4.0-h-350m
- CoreAIKit: https://github.com/john-rocky/coreai-kit
- Ejemplo ChatDemo: https://github.com/john-rocky/coreai-kit/tree/0.7.3/Examples/ChatDemo
- Cookbook de CoreAIKit: https://github.com/john-rocky/coreai-kit/blob/0.7.3/docs/COOKBOOK.md
- Core AI Model Zoo: https://github.com/john-rocky/coreai-model-zoo
- Benchmark Apple Silicon LLM: https://github.com/john-rocky/apple-silicon-llm-bench
- DeviceMark: https://devicemark.github.io/
- Datos de DeviceMark: https://huggingface.co/datasets/devicemark/results
