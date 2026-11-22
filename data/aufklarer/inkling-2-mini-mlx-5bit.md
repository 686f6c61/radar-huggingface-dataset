# aufklarer/Inkling-2-Mini-MLX-5bit

## Resumen
Inkling-2-Mini-MLX-5bit es una cuantización afín en formato MLX del modelo multimodal Inkling-2-Mini, desarrollado originalmente por Thinking Machines. El autor de esta conversión es aufklarer, que la publica como parte del ecosistema de inferencia nativa en Swift para macOS (speech-swift). El modelo resuelve la necesidad de ejecutar un modelo visión-lenguaje de gran tamano en hardware Apple Silicon con memoria unificada, manteniendo buena parte de la calidad del checkpoint original mediante cuantización selectiva.

La arquitectura es un transformer de mezcla de expertos (MoE) con una innovación estructural notable: almacena 24 capas de decodificador pero visita 48 por token, repitiendo tres veces sus doce capas intermedias. Cuenta con 26.388.641.280 parámetros totales y un repositorio de 19,2 GB, lo que refleja la cuantización a 5 bits de los pesos de expertos. El contexto total por defecto en el runtime es de 8.192 tokens, con un presupuesto de 1.024 tokens fusionados por imagen.

Su relevancia actual reside en que demuestra la viabilidad de ejecutar un MoE multimodal de ~26B parámetros en un Apple M5 Pro con 48 GB de memoria unificada, mediante una ruta de inferencia propia en Swift que no depende de MLX-VLM estándar y que incluye validación formal de aceptación (25/25 casos). Es, por tanto, una pieza de interés para desarrolladores que quieran desplegar modelos multimodales localmente en macOS sin GPUs dedicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder MoE con bucle de capas (inkling2_loop); 24 capas almacenadas, 48 visitadas por token |
| Parametros totales | 26.388.641.280 |
| Parametros activos | no disponible |
| Longitud de contexto | 8.192 tokens (presupuesto total por defecto del runtime); 1.024 tokens fusionados por imagen |
| Tipos de cuantizacion | INT5 (grupo 64) en pesos de expertos; INT8 en atención y vocabulario; precisión fuente en visión, routing, normalización, posiciones relativas y controladores de bucle |
| Idiomas soportados | no disponible (validación puntual en alemán, español, francés, chino y japonés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX, cuantización afín); 40 shards, 19.198.967.808 bytes |

## Arquitectura y entrenamiento
El modelo base es un transformer de mezcla de expertos con una peculiaridad estructural: el checkpoint almacena 24 capas de decodificador, pero el runtime visita 48 capas por token repitiendo tres veces las doce capas intermedias. El runtime Swift comparte los pesos entre visitas y mantiene un historial independiente de atención y convolución para cada visita de capa. Incorpora además mecanismos de visión (pipeline image-text-to-text), routing de expertos y controladores de bucle, que en esta conversión permanecen en precisión fuente para preservar la fidelidad.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de RLHF o DPO en el modelo original. La conversión a MLX INT5 es obra de aufklarer y no incluye reentrenamiento: es una cuantización afín de los pesos publicados en `thinkingmachines/Inkling-2-Mini` (revisión `ed40e7da625f594fc9c4990f5f66be24873c22d7`). La innovación técnica destacable es el esquema de cuantización mixta (INT5 en expertos, INT8 en atención y vocabulario, precisión completa en módulos sensibles) junto con una ruta de inferencia nativa en Swift con tolerancias de validación explícitas: deriva RMS normalizada del 1,30 % frente a Python MLX 0.32.4 y del 2,46 % frente a 0.31.1, con coincidencia exacta en el token superior.

## Capacidades
- Generación de texto conversacional multi-turno con memoria de conversación verificada en pruebas de aceptación.
- Razonamiento aritmético y comprensión lectora (se validaron casos de aritmética y explicaciones breves).
- Generación y reparación de código, incluyendo lectura de código y corrección de errores.
- Generación de JSON y SQL; las consultas SQL generadas se ejecutaron en un fixture en memoria aislado.
- Capacidades de visión: descripción de imágenes, conteo de formas (círculos azules), posición relativa de formas, lectura de texto impreso (por ejemplo, "MEET AT 4 PM") y lectura de gráficos de barras etiquetados.
- Procesamiento de documentos largos (se probó un prompt de 2.032 tokens).
- Multilingüismo puntual verificado en alemán, español, francés, chino y japonés (un prompt por idioma), sin garantía de paridad multilingüe amplia.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad declarada; el modelo puede emitir razonamiento oculto antes de la respuesta visible.
- Modo de razonamiento (hidden reasoning) controlable mediante el parámetro `effort`; incluso con `effort 0` puede generar razonamiento previo al texto de respuesta.

## Casos de uso
- Asistente conversacional local en macOS: el modelo gestiona conversaciones multi-turno con memoria verificada y un presupuesto de contexto de 8.192 tokens, adecuado para sesiones de asistencia en escritorio sin conexión a servicios en la nube.
- Descripción y análisis de imágenes en aplicaciones nativas Swift: gracias a su pipeline image-text-to-text y al presupuesto de 1.024 tokens fusionados por imagen, puede integrarse en apps de accesibilidad, catalogación de fotos o moderación visual local.
- Extracción de información de documentos y gráficos: la validación con gráficos de barras etiquetados y texto impreso indica utilidad para digitalizar informes, facturas o paneles con estructura visual.
- Generación y revisión de código en entornos de desarrollo: los casos de lectura y reparación de código, junto con la generación de JSON y SQL validada, permiten integrarlo en asistentes de IDE o scripts de migración de datos.
- Automatización de consultas a bases de datos: la capacidad de producir SQL ejecutable (verificada en un fixture aislado) lo hace apto para prototipos de interfaces en lenguaje natural sobre bases relacionales.
- Procesamiento multilingüe ligero: con prompts verificados en cinco idiomas, puede emplearse en tareas de traducción o atención al cliente en entornos europeos y asiáticos, siempre con revisión humana dada la falta de garantía de paridad.
- Investigación y evaluación de cuantización: sirve como caso de estudio reproducible para medir el impacto de INT5 frente a INT4 (existe un bundle INT4 del mismo autor) en un MoE multimodal sobre Apple Silicon.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card reporta únicamente validación de aceptación propia:

| Prueba | Resultado |
|---|---|
| Casos de aceptación fijos (texto, imagen, documento) | 25/25 superados (22 de noviembre de 2026) |
| Deriva RMS normalizada vs Python MLX 0.32.4 | 1,30 % |
| Deriva RMS normalizada vs Python MLX 0.31.1 | 2,46 % |
| Deriva absoluta máxima vs 0.32.4 / 0.31.1 | 0,704590 / 0,870966 |
| Coincidencia de token superior | Exacta en ambas referencias (token `4`) |
| Pruebas de exportador en CPU | 20 superadas |
| Conversiones reales de muestras fuente | 4 superadas |
| Pruebas de configuración/CLI | 9 superadas |
| Pruebas de referencia pequena / runtime de pesos completos / CLI real | 3 / 4 / 2 superadas |

Las mediciones se realizaron en una compilación debug sobre una máquina de desarrollo compartida, con temperatura 0, top-k 0, top-p 1, penalización de repetición 1, `effort 0`, límite de 512 tokens de generación y presupuesto de contexto de 8.192 tokens. Los tiempos incluyen razonamiento oculto y no constituyen una comparación controlada de velocidad frente a INT4.

## Requisitos de hardware
- VRAM/memoria unificada estimada: aproximadamente 19,2 GB solo para pesos; se recomienda al menos 24-32 GB de memoria unificada para margen de contexto y estados de atención. El autor probó con 48 GB.
- GPU recomendadas: Apple M5 Pro con 48 GB de memoria unificada (hardware validado). No hay datos de rendimiento en GPU NVIDIA u otras.
- Cabe en GPU de consumo: sí, en Apple Silicon de gama alta (M-series Pro/Max con 32 GB o más); no hay evidencia de funcionamiento en GPUs de consumo NVIDIA con esta ruta.
- Opciones de despliegue: runtime nativo Swift de speech-swift (requiere aplicar el parche `source/speech-swift-inkling2.patch` sobre el commit `acc12681e84cbeab885130fab740a8e3db95a5f1` y compilar con `make build`). La generación en Python con MLX-VLM sin modificar no fue validada para esta release. La ruta de carga ModelOpt de upstream no interpreta estos pesos afines.
- Latencia y throughput: no disponibles como cifras controladas; la model card solo incluye tiempos de los casos de validación, no comparables.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / runtime | Disponibilidad |
|---|---|---|---|---|---|
| Inkling-2-Mini-MLX-5bit (este) | 26,39 B (MoE) | 8.192 tokens (runtime) | Apache 2.0 | safetensors MLX INT5, Swift | Hugging Face, 0 descargas |
| Inkling-2-Mini-MLX-4bit | no disponible | 8.192 tokens (mismo runtime) | Apache 2.0 | safetensors MLX INT4, Swift | Hugging Face |
| thinkingmachines/Inkling-2-Mini (base) | 26,39 B (MoE) | no disponible | Apache 2.0 | safetensors (precisión fuente) | Hugging Face |

No se dispone de datos de benchmarks comparativos entre estas variantes; el autor indica que ambas (INT4 e INT5) superaron los mismos 25 casos de aceptación, pero no se ejecutó una comparación de calidad completa contra el checkpoint original.

## Limitaciones y advertencias
- El límite de salida incluye el razonamiento oculto y el framing: incluso con `effort 0` puede emitir razonamiento antes de la respuesta, por lo que un límite corto puede producir una respuesta visible vacía.
- La validación se basa en 25 casos seleccionados, no en benchmarks estándar; no constituye garantía de inteligibilidad general ni de paridad multilingüe amplia.
- No se ejecutó comparación de calidad contra el checkpoint original completo.
- La ruta de inferencia en Python con MLX-VLM sin modificar no fue validada; el uso previsto es el runtime Swift con parche, lo que limita la portabilidad.
- El parche Swift no estaba fusionado en la rama principal de speech-swift en el momento de la publicación, lo que anade fricción de mantenimiento.
- El contexto efectivo está limitado a 8.192 tokens por defecto, inferior al de muchos modelos contemporáneos.
- Riesgo de alucinación y sesgos: no documentados específicamente en la información disponible; debe asumirse el riesgo habitual de los modelos generativos.
- Licencia Apache 2.0 permite uso comercial, pero al ser una cuantización de un modelo de terceros conviene verificar las condiciones del checkpoint base.
- El hardware validado es específico (Apple M5 Pro, macOS 27.2); el comportamiento en otras configuraciones Apple Silicon no está documentado.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-5bit
- Variante INT4: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-4bit
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Revisión del checkpoint base: https://huggingface.co/thinkingmachines/Inkling-2-Mini/tree/ed40e7da625f594fc9c4990f5f66be24873c22d7
- Repositorio speech-swift: https://github.com/soniqo/speech-swift
- Resultados de validación: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-5bit/tree/main/validation
- Fixtures de imagen y prompts: https://huggingface.co/aufklarer/Inkling-2-Mini-MLX-5bit/tree/main/validation
