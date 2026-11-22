# aufklarer/Inkling-2-Mini-MLX-4bit

## Resumen

Inkling-2-Mini-MLX-4bit es una cuantización de 4 bits en formato MLX del modelo multimodal Inkling-2-Mini, desarrollado originalmente por Thinking Machines. El autor de esta conversión es el usuario aufklarer, que la publica como un bundle de pesos afines (affine MLX) orientado a inferencia nativa en Swift mediante el runtime speech-swift. El modelo resuelve generación de texto e imagen-a-texto (image-text-to-text) en hardware Apple Silicon, con un enfoque práctico en despliegue local sobre memoria unificada.

El modelo base es un transformer de tipo mixture-of-experts (MoE) con 26.388.641.280 parámetros totales y un esquema de repetición de capas: almacena 24 capas de decoder pero visita 48 por token, repitiendo sus doce capas intermedias tres veces. La cuantización reduce el peso en disco a aproximadamente 16,1 GB (16.141.320.192 bytes, 39 shards), con pesos de expertos en INT4 (group size 64), matrices de atención y vocabulario en INT8, y visión, routing, normalización, posición relativa y controladores de loop en precisión de origen.

Es relevante ahora porque demuestra una ruta de ejecución de un MoE multimodal de gran tamaño en un portátil Apple M5 Pro con 48 GB de memoria unificada, a través de un parche de código abierto sobre speech-swift, con validación de 25 casos de aceptación (texto, aritmética, código, JSON, SQL y cinco idiomas) y soporte de imágenes fijas. No obstante, el ecosistema de ejecución es incipiente y no está integrado en la rama principal del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) con repetición de capas (24 capas almacenadas, 48 visitas por token) |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens por defecto (presupuesto total de contexto del runtime); 1.024 merged patches por imagen por defecto |
| Tipos de cuantizacion | INT4 afín (group size 64) para expertos; INT8 para atención y vocabulario; precisión de origen para visión, routing, normalización, posición relativa y controladores de loop |
| Idiomas soportados | no disponible (validación puntual en alemán, español, francés, chino y japonés; sin paridad multilingüe garantizada) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, affine), 39 shards, ~16,1 GB |
| Libreria | mlx (runtime Swift speech-swift) |
| Hardware probado | Apple M5 Pro, 48 GB memoria unificada, macOS 27.2 |
| Revision del modelo base | ed40e7da625f594fc9c4990f5f66be24873c22d7 |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con una innovación estructural concreta: el modelo almacena 24 capas de decoder y visita 48 capas por token, repitiendo tres veces sus doce capas intermedias. El runtime Swift comparte los pesos entre visitas y mantiene un historial independiente de atención y convolución para cada visita de capa. Esta repetición de capas intermedias actúa como un mecanismo de profundidad efectiva sin duplicar almacenamiento de pesos, y es la razón por la que el modelo combina un recuento de parámetros relativamente contenido con una profundidad de cómputo mayor.

La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras etapas de alineación en el modelo base. Tampoco se especifica el número de expertos ni la fracción de parámetros activos por token. La cuantización, por su parte, es una exportación afín MLX que no usa la ruta de carga ModelOpt original; los nombres de tensores siguen el layout de Inkling 2 de MLX-VLM. Se documentan pruebas del exportador (20 tests de CPU, cuatro conversiones de muestras reales, nueve tests de configuración/CLI, tres tests de referencia pequeña, cuatro tests de runtime con pesos completos y dos tests de CLI real), con una desviación RMS normalizada del 1,29 % en los top-20 scores y el mismo token top entre las versiones de Python y Swift MLX probadas.

## Capacidades

- Generación de texto conversacional multi-turno con memoria de conversación.
- Razonamiento aritmético y comprensión de documentos largos (probado con un prompt de 2.032 tokens).
- Lectura y reparación de código, además de generación de JSON y SQL (el SQL generado se ejecutó sobre un fixture en memoria aislado).
- Comprensión de imágenes fijas: conteo de objetos, posición relativa de formas, lectura de texto impreso (por ejemplo, "MEET AT 4 PM") y gráficos de barras etiquetados.
- Capacidad multilingüe puntual: un prompt cada uno en alemán, español, francés, chino y japonés dentro del conjunto de aceptación.
- Modo de razonamiento oculto (hidden reasoning): el modelo puede emitir razonamiento antes de la respuesta visible, incluso con effort 0.
- No implementa parsing nativo de tool calls, ni entrada de audio o vídeo, ni decodificación especulativa DSpark en esta versión.

## Casos de uso

- Asistente conversacional local en macOS: el modelo gestiona conversaciones multi-turno con memoria y un presupuesto de contexto de 8.192 tokens, adecuado para un asistente de escritorio que no envía datos a la nube, sobre un Apple M5 Pro con 48 GB.
- Descripción y análisis de imágenes en dispositivos Apple: con un presupuesto de 1.024 merged patches por imagen, sirve para tareas de accesibilidad (describir fotos), extracción de texto impreso en capturas y lectura de gráficos simples.
- Revisión y reparación de código en el editor: la validación incluye lectura y corrección de código, por lo que puede integrarse en un flujo de revisión local donde el código no sale del portátil.
- Generación de consultas SQL y JSON: útil para prototipos de agentes de datos o asistentes de BI que transforman lenguaje natural en SQL validable, dado que el modelo produjo SQL ejecutable en las pruebas.
- Procesamiento de documentos con contexto medio: con 2.032 tokens probados y un límite de 8.192, encaja en resumen y extracción de información de informes, contratos o notas técnicas de extensión moderada.
- Soporte multilingüe ligero: atención al cliente o traducción asistida en alemán, español, francés, chino y japonés, siempre con la advertencia de que no hay garantía de paridad multilingüe.
- Inferencia 100 % local y privada en Swift: integrable en aplicaciones macOS nativas mediante la API `Inkling2Chat` de speech-swift, sin dependencia de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la información disponible. El autor documenta una validación de aceptación de 25/25 casos fijos (20 prompts de texto, cuatro imágenes sintéticas y un documento largo) ejecutada con build de depuración, temperatura 0, top-k 0, top-p 1, repetition penalty 1, effort 0, límite de 512 tokens de generación y presupuesto de contexto de 8.192 tokens. El propio autor advierte que estos casos seleccionados no constituyen un benchmark estándar ni evidencia de calidad general, y que no se ejecutó una comparación completa contra el checkpoint original.

| Prueba | Resultado | Notas |
|---|---|---|
| Casos de aceptación (texto, imagen, documento) | 25/25 | Build debug, temperatura 0, 512 tokens de generación |
| Deriva RMS normalizada (top-20 scores) | 1,29 % | Mismo token top entre versiones Python/Swift MLX |
| Tests del exportador (CPU) | 20 pasados | Verificación de decodificación NVFP4/MXFP8 contra dequantizers nativos de MLX |
| Tests de conversión de muestras reales | 4 pasados | — |
| Tests de configuración/CLI | 9 pasados | — |
| Tests de runtime con pesos completos | 4 pasados | — |
| Tests de CLI real | 2 pasados | — |

## Requisitos de hardware

- VRAM/memoria: el bundle en disco ocupa ~16,1 GB, pero el runtime consume más memoria que el tamaño de los tensores en disco; el autor no publica una cifra exacta de memoria en ejecución.
- Hardware probado: Apple M5 Pro con 48 GB de memoria unificada y macOS 27.2.
- GPU: al ser MLX, requiere Apple Silicon (memoria unificada); no se documenta soporte para GPU NVIDIA ni CUDA.
- Viabilidad en consumer: cabe en equipos Apple Silicon con memoria unificada suficiente; el autor no confirma configuraciones de 16 o 24 GB, y advierte que contextos mayores necesitan pruebas separadas de memoria y calidad.
- Despliegue: runtime Swift speech-swift (con parche `source/speech-swift-inkling2.patch` sobre el commit `acc12681e84cbeab885130fab740a8e3db95a5f1`), build mediante `make build` (incluye paso de metallib MLX). La generación en Python con MLX-VLM sin modificar no fue validada para esta release.
- Concurrencia: las peticiones deben serializarse sobre una única instancia del modelo.
- Latencia y throughput: no disponibles; los tiempos de la validación incluyen razonamiento oculto pero no se presentan cifras agregadas de throughput.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada. La comparación se limita a lo verificable:

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-4bit (este) | 26,39 B totales | 8.192 tokens (runtime) | MLX safetensors INT4/INT8 | Apache 2.0 | Runtime Swift, texto e imagen fija |
| thinkingmachines/Inkling-2-Mini (base) | no disponible | no disponible | safetensors original | Apache 2.0 (heredada) | Checkpoint sin cuantizar; sin comparación de calidad publicada |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No hay datos en la información disponible |

## Limitaciones y advertencias

- El límite de salida incluye el razonamiento oculto y el framing; incluso con effort 0 puede generar razonamiento antes de la respuesta, de modo que un límite corto puede producir una respuesta visible vacía.
- El presupuesto de contexto por defecto es de 8.192 tokens; contextos mayores requieren pruebas de memoria y calidad no realizadas.
- La memoria en ejecución supera el tamaño de los tensores en disco.
- Las peticiones deben serializarse sobre una única instancia del modelo.
- No hay parsing nativo de tool calls, ni entrada de audio o vídeo, ni decodificación especulativa DSpark.
- La implementación Swift no estaba fusionada en la rama principal de speech-swift en el momento de la publicación; requiere aplicar un parche y compilar.
- La generación en Python con MLX-VLM sin modificar no fue validada.
- La validación de 25 casos no es un benchmark estándar ni garantiza inteligibilidad general ni paridad multilingüe; no se ejecutó comparación completa contra el checkpoint original.
- Riesgo de sesgos y alucinaciones: no documentado en la información disponible; aplican los riesgos habituales de un modelo generativo sin evaluación publicada al respecto.
- La licencia Apache 2.0 permite uso comercial, pero el estado experimental del runtime y la ausencia de benchmarks estándar desaconsejan producción sin evaluación propia.
- El probe Core ML es solo una prueba de operadores (expertos enrutados, pesos compartidos repetidos y tres historiales de caché en FP16 e INT4), no una exportación completa a Core ML ni un resultado de rendimiento en Neural Engine.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión del modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7
- Runtime speech-swift: https://github.com/soniqo/speech-swift
- Commit base del parche: https://github.com/soniqo/speech-swift/commit/acc12681e84cbeab885130fab740a8e3db95a5f1
- Resultados de validación de calidad: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-4bit/blob/main/validation/quality-results.json
- Revisión semántica y comprobación SQL: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-4bit/blob/main/validation/quality-review.json
- Fixtures de imagen y prompts: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-4bit/tree/main/validation
- Parche de código fuente: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-4bit/blob/main/source/speech-swift-inkling2.patch
- Checksum del parche: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-4bit/blob/main/source/base.json
