# aufklarer/Inkling-2-Mini-MLX-4bit

## Resumen

Inkling 2 Mini MLX 4bit es una cuantización de pesos en formato MLX del modelo multimodal Inkling 2 Mini, desarrollado originalmente por Thinking Machines. Se trata de un modelo vision-lenguaje de arquitectura Mixture-of-Experts (MoE) con 26.388.641.280 parámetros totales, exportado en precisión mixta (INT4 para expertos, INT8 para atención y vocabulario, precisión original para visión, routing y normalización) para ejecución nativa en Apple Silicon mediante MLX.

El modelo resuelve la necesidad de desplegar un VLM de gran tamaño en hardware de consumo Apple con memoria unificada, sin depender de CUDA. Su relevancia actual radica en que permite generación de texto e imágenes en local sobre macOS con un runtime Swift específico (speech-swift), con un peso de tensores de aproximadamente 16,1 GB distribuidos en 39 shards.

La arquitectura emplea un esquema de "loop" poco habitual: almacena 24 capas de decoder pero visita 48 capas por token, repitiendo tres veces sus doce capas intermedias. Esta cuantización concreta está pensada para inferencia nativa en Swift, no para el stack Python estándar de MLX-VLM, que no fue validado para esta release según el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con decoder de 24 capas almacenadas y 48 visitas por token (repetición triple de las 12 capas intermedias) |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (la validación usó un presupuesto total de 8.192 tokens) |
| Tipos de cuantizacion | INT4 affine (expertos, group size 64), INT8 (atención y vocabulario), precisión original (visión, routing, normalización, relative-position, loop controllers); existe variante INT5 |
| Idiomas soportados | no disponible (validación puntual en alemán, español, francés, chino y japonés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX affine), 39 shards, ~16,1 GB de tensores |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con capacidad de procesamiento de imagen y texto. La particularidad estructural es el esquema de capas en bucle: el checkpoint almacena 24 capas de decoder, pero en cada token se visitan 48 capas al repetir tres veces las doce capas centrales. El runtime Swift comparte los pesos entre visitas y mantiene un historial independiente de atención y convolución para cada visita de capa, lo que reduce el footprint de memoria a costa de cómputo adicional.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO en el modelo original. La cuantización es de tipo affine MLX: los expertos se almacenan en INT4 con group size 64, las matrices de atención y vocabulario en INT8, y el resto de parámetros (visión, routing, normalización, controladores de bucle) se mantienen en la precisión del checkpoint fuente. El autor indica que el exportador valida la decodificación NVFP4/MXFP8 contra los dequantizadores nativos de MLX, con un drift RMS normalizado del 1,29% en los top-20 scores frente al checkpoint original y el mismo token top en las versiones Python/Swift de MLX probadas.

## Capacidades

- Generación de texto conversacional multi-turno, con memoria de conversación verificada en las pruebas de aceptación.
- Comprensión de imágenes estáticas: conteo de objetos, posición relativa de formas, lectura de texto impreso y gráficos de barras etiquetados.
- Razonamiento aritmético básico y resolución de problemas sencillos.
- Lectura y reparación de código, generación de JSON y SQL.
- Capacidad multilingüe parcial: se validaron prompts en alemán, español, francés, chino y japonés, aunque el autor advierte que no constituye evidencia de paridad multilingüe amplia.
- Razonamiento oculto (hidden reasoning): los tiempos reportados incluyen esta fase.
- Propuesta de acciones locales (answer, summarize, describe_image, clarify) mediante generación de texto libre validada con JSON; no hay decodificación JSON restringida nativa ni parseo de tool calls implementado.
- No dispone de tool calling nativo ni de parsing de function calling en el runtime incluido.

## Casos de uso

- Procesamiento de documentos con imágenes en local: el modelo puede leer texto impreso en capturas y describir gráficos, adecuado para digitalización de facturas o informes escaneados en un Mac sin conexión a servicios en la nube.
- Asistente de escritorio privado: con ~16 GB de tensores cabe en un Mac con 48 GB de memoria unificada, permitiendo conversaciones multi-turno con memoria sin enviar datos a terceros.
- Generación y reparación de código en entornos macOS: útil para pipelines de desarrollo local donde se requiere leer fragmentos de código y proponer correcciones, integrándose vía el runtime Swift.
- Automatización de clasificación de imágenes con razonamiento: conteo de objetos, detección de posición relativa y lectura de etiquetas, aplicable a control de calidad visual en pequeños lotes.
- Generación de consultas SQL y JSON estructurado: validado con ejecución real sobre un fixture en memoria, útil para asistentes de bases de datos en herramientas internas.
- Enrutamiento de decisiones locales: el ejemplo de decisión del runtime permite clasificar la intención del usuario (responder, resumir, describir imagen, aclarar) con fallback a "clarify" ante salidas inválidas, útil en asistentes de voz o interfaces conversacionales.
- Traducción y atención multilingüe ligera: con soporte verificado en cinco idiomas, puede emplearse para resúmenes o respuestas en español, francés, alemán, chino y japonés en contextos acotados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. El autor reporta 25/25 casos de aceptación fijos superados con el runtime Swift (20 prompts de texto, 4 imágenes sintéticas y un documento largo de 2.032 tokens), con temperatura 0, top-k 0, top-p 1, penalización de repetición 1, effort 0, límite de 512 tokens de generación y presupuesto total de contexto de 8.192 tokens. Estas pruebas no constituyen un benchmark estándar ni garantizan inteligibilidad general.

| Prueba | Resultado |
|---|---|
| Casos de aceptación (texto, imagen, documento) | 25/25 superados |
| Drift RMS normalizado vs. checkpoint original (top-20) | 1,29% |
| Coincidencia de token top vs. original | Sí (misma versión MLX Python/Swift) |
| Tests del exportador CPU | 20 superados |
| Tests de conversión de muestras reales | 4 superados |
| Tests de argumentos CLI/configuración | 9 superados |
| Tests de referencia pequeña | 3 superados |
| Tests de runtime con pesos completos | 4 superados |
| Tests CLI reales | 2 superados |

## Requisitos de hardware

- Memoria unificada estimada: ~16,1 GB solo de tensores, más overhead de runtime y contexto; el autor probó con 48 GB en un Apple M5 Pro.
- GPU recomendadas: Apple Silicon con memoria unificada amplia (M5 Pro con 48 GB validado); no se soportan GPUs NVIDIA/AMD en este formato MLX.
- Cabe en GPU de consumo Apple: sí, en configuraciones con al menos 24-32 GB de memoria unificada (no verificado oficialmente más allá del M5 Pro de 48 GB).
- Opciones de despliegue: runtime nativo Swift en speech-swift (commit 15eda930df3d); MLX-VLM Python no validado para esta release; el path de carga ModelOpt upstream no interpreta estos pesos.
- Latencia y throughput: no disponibles de forma agregada; el autor enlaza los timings de los 25 casos de aceptación en validation/quality-results.json.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Inkling 2 Mini MLX 4bit (este) | 26,4 B (MoE) | no disponible | apache-2.0 | safetensors MLX, 4-bit | Hugging Face, runtime Swift |
| Inkling 2 Mini MLX 5bit | 26,4 B (MoE) | no disponible | apache-2.0 | safetensors MLX, 5-bit (~19,2 GB) | Hugging Face, mismo runtime |
| Inkling 2 Mini (original) | 26,4 B (MoE) | no disponible | apache-2.0 (según base) | safetensors | Hugging Face, revision ed40e7da |

No se dispone de información sobre otros modelos comparables de la misma categoría (VLM MoE para Apple Silicon) en la documentación proporcionada.

## Limitaciones y advertencias

- Los 25 casos de aceptación son una selección fija y no constituyen un benchmark estándar ni garantizan calidad general; el propio autor lo advierte.
- No hay evidencia de paridad multilingüe amplia: solo se probó un prompt por idioma en cinco lenguas.
- El soporte Python con MLX-VLM no fue validado para esta release; el uso previsto es el runtime Swift.
- No implementa decodificación JSON restringida nativa ni parsing de tool calls; el ejemplo de acciones locales ejecuta acciones solo tras validación externa y hace fallback a "clarify".
- Riesgo de alucinación no cuantificado; no se reportan evaluaciones de sesgo.
- El esquema de capas en bucle implica cómputo extra por token (48 visitas sobre 24 capas almacenadas), lo que puede afectar la latencia frente a un transformer convencional del mismo tamaño.
- La licencia apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base thinkingmachines/Inkling-2-Mini antes de producción.
- Solo se ha probado en macOS 27.2 con Apple M5 Pro; el comportamiento en otros chips Apple no está documentado.
- El modelo base original puede tener sus propias limitaciones de sesgo y alucinación no reflejadas en esta ficha.

## Enlaces

- [Hugging Face: aufklarer/Inkling-2-Mini-MLX-4bit](https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-4bit)
- [Modelo base: thinkingmachines/Inkling-2-Mini](https://huggingface.co/thinkingmachines/Inkling-2-Mini)
- [Revision del modelo base (ed40e7da)](https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7)
- [Variante INT5: aufklarer/Inkling-2-Mini-MLX-5bit](https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-5bit)
- [Runtime speech-swift](https://github.com/soniqo/speech-swift)
- [Commit del runtime validado (15eda930df3d)](https://github.com/soniqo/speech-swift/commit/15eda930df3d6cad07a0cd25e8d22dfdd9a040c3)
- [Ejemplo de decisiones locales](https://github.com/soniqo/speech-swift/blob/15eda930df3d6cad07a0cd25e8d22dfdd9a040c3/docs/inference/inkling2-mini-decisions.md)
- [Ejemplos de arquitectura e imagen](https://github.com/soniqo/speech-swift/blob/15eda930df3d6cad07a0cd25e8d22dfdd9a040c3/docs/models/inkling2-mini.md)
- [Resultados de calidad (validation/quality-results.json)](https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-4bit/blob/main/validation/quality-results.json)
- [Revisión semántica y SQL (validation/quality-review.json)](https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-4bit/blob/main/validation/quality-review.json)
- [Fixtures de imagen y prompts](https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-4bit/tree/main/validation)
