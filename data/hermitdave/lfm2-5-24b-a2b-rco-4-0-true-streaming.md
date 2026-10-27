# hermitdave/LFM2.5-24B-A2B-RCO-4.0-true-streaming

## Resumen

LFM2.5-24B-A2B-RCO-4.0-true-streaming es una cuantización de precisión mixta en formato MLX del modelo LFM2.5-24B-A2B, publicado por el usuario hermitdave (no por el desarrollador original del modelo base). El problema que aborda es el de reducir el peso en memoria de un modelo MoE de gran tamano para que pueda ejecutarse en Apple Silicon, aplicando la metodología RCO (Rate-Controlled Quantization con mezcla de bits) con un objetivo de 4.0 bits por peso y un resultado medio de 3.90 bpw.

La innovación declarada por el autor es la generación de la base de datos de errores de cuantización mediante streaming capa a capa real ("true streaming"): se carga una capa del decoder en BF16, se ejecuta un forward con tokens de calibración, se capturan estadísticas de activación con wrappers CaptureSwitchLinear, se calculan los errores ponderados por Hessiano y se libera la capa antes de pasar a la siguiente. Esto elimina la necesidad de mantener un modelo RTN proxy completo en memoria, lo que permite escalar el proceso a modelos que exceden la RAM disponible.

Es relevante ahora porque demuestra una vía práctica de cuantización de precisión mixta para arquitecturas híbridas Conv1d + atención completa sobre hardware de consumo de Apple, con métricas publicadas de perplejidad (13.253 en wikitext2, primeros 2048 tokens) y throughput (67.8 tok/s en un M3 Max de 64 GB). No obstante, el repositorio tiene 0 descargas y 0 likes, no incluye benchmarks estándar y su model card contiene una incoherencia en el recuento de parámetros, por lo que debe tratarse como un artefacto experimental y no como una distribución validada.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 MoE (mixture of experts) con 40 capas: 30 Conv1d + 10 de atención completa; top-4 routing sobre 64 expertos por capa MoE |
| Parametros totales | No disponible de forma fiable: la model card declara ~48B totales, mientras que el identificador 24B-A2B implica ~24B totales (dato contradictorio) |
| Parametros activos | No disponible de forma fiable: la model card declara ~24B activos, mientras que la convención A2B del nombre implica ~2B activos |
| Longitud de contexto | No disponible (no declarada en la información proporcionada) |
| Tipos de cuantizacion | Cuantización afín de precisión mixta con objetivo 4.0 bpw y media de 3.90 bpw; grupo de 64; escala y sesgo en float32. Distribución: 73 tensores en 3 bits, 13.208 en 4 bits, 26 en 5 bits, 1.408 en 6 bits, 128 en 8 bits |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | MLX (safetensors en formato MLX); repositorio de 16.1 GB; librería mlx |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE de la familia LFM2 con una arquitectura híbrida: de las 40 capas, 30 son convolucionales Conv1d y solo 10 son de atención completa, lo que reduce el coste de atención sobre secuencias largas. Cada capa MoE dispone de 64 expertos con enrutamiento top-4, y el vocabulario es de 124.893 tokens. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original.

El trabajo técnico de esta ficha es exclusivamente de compresión: cuantización afín de precisión mixta con asignación de bits por tensor guiada por una base de datos de errores generada en streaming. Para cada capa se ejecuta un forward con tokens de calibración, se capturan estadísticas de activación y se calculan errores ponderados por Hessiano que determinan si un tensor recibe 3, 4, 5, 6 u 8 bits. La mayoría de tensores (13.208) quedan en 4 bits, con 1.408 en 6 bits y 128 en 8 bits, presumiblemente reservados para las capas más sensibles. El resultado se mide con una divergencia KL de 0.1312 frente a una referencia RTN de 8 bits.

## Capacidades

- Generación de texto en inglés sobre el modelo base LFM2.5-24B-A2B, en formato MLX para Apple Silicon.
- Ejecución local en memoria unificada mediante MLX y MLX-LM, sin necesidad de GPU dedicada.
- Inferencia con cuantización de precisión mixta (3.90 bpw medios), lo que reduce el peso del repositorio a 16.1 GB.
- Arquitectura MoE con enrutamiento top-4 sobre 64 expertos por capa, con activación dispersa de expertos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible en la información proporcionada.
- Modo thinking o razonamiento explícito: no disponible en la información proporcionada.
- Capacidades multilingües: limitadas al inglés según los metadatos del repositorio.

## Casos de uso

- Prototipado local con datos sensibles: al ejecutarse íntegramente en un Mac con MLX, permite probar un MoE de gran tamaño sin enviar prompts ni documentos a APIs externas, algo relevante para equipos con restricciones de confidencialidad.
- Evaluación de cuantizaciones de precisión mixta: investigadores que comparan esquemas de cuantización pueden usar la perplejidad publicada (13.253 en wikitext2, primeros 2048 tokens) y la KLD de 0.1312 frente a RTN 8 bits como línea base reproducible.
- Investigación sobre generación de bases de datos de errores en streaming: el método descrito (carga de capa, forward de calibración, captura de activaciones, cálculo Hessiano y liberación) sirve como referencia para replicar pipelines de cuantización en máquinas con RAM limitada.
- Generación de texto en inglés sin conexión: redacción de borradores, resúmenes y documentación técnica en un portátil Apple Silicon, con un throughput medido de 67.8 tok/s en M3 Max de 64 GB.
- Procesamiento por lotes offline: al no depender de red ni de CUDA, encaja en scripts nocturnos de normalización, etiquetado o reescritura de corpus en inglés sobre estaciones de trabajo macOS.
- Benchmarking de rendimiento en Apple Silicon: útil para medir el impacto de la cuantización 4-bit en latencia y throughput (aproximadamente 14,7 ms por token a 67.8 tok/s) frente al modelo en BF16 en el mismo hardware.
- Docencia y experimentación con arquitecturas híbridas Conv1d + atención: permite inspeccionar el comportamiento de un MoE con 30 capas convolucionales en un entorno local de bajo coste.

## Benchmarks y rendimiento

| Métrica | Valor | Contexto |
|---|---|---|
| Perplejidad (wikitext2, primeros 2048 tokens) | 13.253 | Cuantización 4-bit RCO, 3.90 bpw medios |
| KLD frente a RTN 8 bits | 0.1312 | Métrica de degradación de la cuantización |
| Throughput | 67.8 tok/s | Apple M3 Max, 64 GB de memoria unificada |
| Bits por peso medios | 3.90 bpw | Objetivo declarado: 4.0 bpw |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, MATH) en la información disponible. Tampoco se ofrece la perplejidad del modelo base en BF16 ni de la referencia RTN 8 bits completa, por lo que no es posible calcular la degradación relativa exacta.

## Requisitos de hardware

- VRAM/memoria: los pesos ocupan 16.1 GB, por lo que se necesita un mínimo práctico de 18-20 GB de memoria unificada para cargar el modelo con margen para el contexto y el runtime de MLX; 32 GB es un suelo recomendable y 64 GB el entorno en el que se midió el rendimiento.
- GPU: exclusivamente Apple Silicon (M1, M2, M3, M4). No hay soporte declarado para CUDA, ROCm ni CPU x86 en este repositorio.
- GPU de consumo: sí cabe en equipos Apple Silicon de gama alta; el autor reporta 67.8 tok/s en un M3 Max de 64 GB. No hay datos para M1/M2 base ni para modelos con 16 GB de memoria unificada.
- Opciones de despliegue: MLX y MLX-LM (incluido el servidor de MLX-LM para exponer una API compatible con OpenAI). No se declara compatibilidad con vLLM, llama.cpp, Ollama ni TGI; para esos runtimes habría que reconvertir los pesos.
- Latencia y throughput: 67.8 tok/s medidos equivalen a aproximadamente 14,7 ms por token en generación; no se proporcionan métricas de time-to-first-token ni de rendimiento en prefill.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| LFM2.5-24B-A2B-RCO-4.0-true-streaming (este) | ~24B-48B totales según fuente (contradictorio); ~2B-24B activos | No disponible | 3.90 bpw medios, MLX | Perplejidad 13.253; 67.8 tok/s en M3 Max | Apache-2.0 | MLX, Apple Silicon |
| LFM2.5-24B-A2B (base, BF16) | Los mismos que el modelo base; cifra no disponible con fiabilidad | No disponible | BF16 | No disponible | Apache-2.0 (heredada) | Formato original, no especificado |
| Otras cuantizaciones 4-bit del mismo modelo base | No disponible | No disponible | 4 bits | No disponible | Apache-2.0 | No disponible |
| Qwen3-30B-A3B (alternativa MoE de tamaño comparable) | Datos no incluidos en la información proporcionada | Datos no incluidos en la información proporcionada | No disponible | No disponible | No disponible en esta ficha | No disponible |

Solo se dispone de datos verificables para este repositorio y, parcialmente, para el modelo base. Cualquier comparación numérica con alternativas requeriría ejecutar los mismos benchmarks en el mismo hardware, algo que la información proporcionada no permite.

## Limitaciones y advertencias

- Incoherencia en la model card: declara ~24B parámetros activos y ~48B totales, cifras incompatibles con el identificador 24B-A2B del propio nombre del repositorio. El dato de tamaño debe considerarse no fiable hasta verificarlo contra el modelo base.
- Es una cuantización de terceros: el autor (hermitdave) no es el desarrollador de LFM2.5, por lo que no hay garantía de equivalencia funcional con la distribución oficial.
- Solo inglés: los metadatos declaran únicamente `en`; no se debe asumir calidad en castellano u otros idiomas.
- Longitud de contexto no declarada: no se puede planificar un caso de uso con contexto largo sin verificar el límite real del modelo base.
- Dependencia total de MLX y Apple Silicon: no hay rutas de despliegue para CUDA, vLLM o llama.cpp, lo que limita su uso en servidores Linux convencionales.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin informes independientes de calidad.
- Métricas de calidad incompletas: se publica perplejidad y KLD, pero no MMLU, HumanEval ni GSM8K, y no se da la perplejidad del BF16 de referencia, por lo que la pérdida real de calidad es difícil de acotar. Una KLD de 0.1312 frente a RTN 8 bits indica una desviación de distribución no trivial.
- Enlace roto en los agradecimientos: la referencia a `rco-mlx` apunta a `github.com/???`, por lo que la herramienta de cuantización no es reproducible a partir de la card.
- Riesgo de alucinación: inherente a un modelo generativo de este tamaño, sin que la información disponible incluya evaluaciones de fidelidad factual.
- Licencia: Apache-2.0 permite uso comercial, pero conviene verificar que la licencia y las condiciones del modelo base se mantienen y se cumplen al redistribuir estos pesos derivados.
- Fecha de creación del repositorio (2026-10-27) posterior a la fecha habitual de consulta: conviene comprobar la procedencia y la integridad de los artefactos antes de usarlos en producción.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/hermitdave/LFM2.5-24B-A2B-RCO-4.0-true-streaming
- MLX (framework de Apple): https://github.com/ml-explore/mlx
- MLX-LM (inferencia y servidor): https://github.com/ml-explore/mlx-lm
- rco-mlx (herramienta de cuantización citada): enlace no disponible, la model card apunta a `https://github.com/???`
- Hermes Agent (herramienta citada por el autor): https://github.com/nousresearch/hermes-agent
- Modelo base LFM2.5-24B-A2B: enlace no disponible en la información proporcionada
