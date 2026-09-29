# litert-community/decider-2b-vision-LiteRT

## Resumen

decider-2b-vision-LiteRT es una conversión de terceros al formato LiteRT-LM del modelo Mapika/decider-2b-vision (revisión 863e2908), publicada por el colectivo litert-community. No se trata de un modelo de chat: recibe una imagen y una o varias preguntas con opciones etiquetadas con letras, y devuelve una probabilidad calibrada para cada opción. No genera texto de respuesta; lee los logits de las letras en una posición de respuesta por pregunta y los normaliza a probabilidades. Está pensado para decisiones de "Sistema 1" de un solo paso.

El modelo subyacente fue construido por Mapika a partir del modelo visión-lenguaje Qwen3.5-2B con los pesos de texto decider-2b v5, sobre la base Qwen/Qwen3.5-2B-Base. El decodificador tiene 24 capas: 18 de atención lineal gated-delta y 6 de atención completa, lo que lo sitúa en la categoría de arquitecturas híbridas. El codificador visual tiene 24 bloques y un fusionador 2×2, de modo que una imagen de 256×256 se reduce a 64 tokens.

Esta conversión concreta solo cambia el formato de fichero y añade variantes cuantizadas (fp16, fp16 con vocabulario int8 e int8 dinámico) para su ejecución en CPU y GPU de escritorio y en móviles mediante LiteRT-LM. Es relevante ahora porque permite desplegar un modelo de decisión con salida estructurada y probabilidades calibradas en hardware de consumo, incluidos teléfonos, sin depender de torch ni transformers.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido: decodificador de 24 capas (18 de atención lineal gated-delta + 6 de atención completa) con codificador visual de 24 bloques y fusionador 2×2 |
| Parametros totales | ~2 000 millones (según la denominación "2b"); no se publica el desglose exacto |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | caché de 4096 tokens |
| Tipos de cuantizacion | fp16; fp16 con cabeza de salida y embedding de tokens en int8; int8 dinámico (pesos FC en int8, embedding de tokens int8 por canal) |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | .litertlm (LiteRT-LM); tres ficheros: fp16, fp16-int8vocab e int8 |
| Resolucion de imagen | 256×256 (una imagen por petición) |
| Plantilla de prompt | identidad, sin marcadores de rol; sin token de inicio; token de parada 248044 |
| Modelo base | Mapika/decider-2b-vision (revisión 863e290863655f1d6b69324d77d09ac972d21609); a su vez derivado de Qwen/Qwen3.5-2B-Base |
| Tamano del repositorio | 13,2 GB |
| Idioma del pipeline | image-text-to-text |

## Arquitectura y entrenamiento

La arquitectura es un transformer híbrido. El decodificador combina 18 capas de atención lineal gated-delta con 6 capas de atención completa, un patrón habitual para reducir el coste de la atención manteniendo capacidad de modelado. El componente visual consta de 24 bloques y un fusionador 2×2 que convierte una imagen de 256×256 píxeles en 64 tokens, que se inyectan al decodificador a través de un adaptador. Los tres bundles incluyen metadatos de prompt idénticos, ExecutorMetadata para 48 búferes de estado y preferencia de activaciones en fp32 para el decodificador.

El entrenamiento corresponde al modelo original de Mapika, no a esta conversión: Mapika construyó decider-2b-vision a partir del modelo visión-lenguaje Qwen3.5-2B con los pesos de texto decider-2b v5. El número de tokens de entrenamiento, la composición del dataset y si hubo RLHF o DPO no se detallan en la información disponible. La innovación funcional del modelo es el modo de salida: en lugar de generar texto libre, lee los logits de las letras en una posición de respuesta por pregunta y los convierte en probabilidades por opción, lo que permite obtener una distribución calibrada sobre alternativas discretas.

## Capacidades

- Decisión de un solo paso a partir de una imagen y una pregunta con opciones etiquetadas con letras.
- Salida de probabilidades por opción (salida estructurada), no texto generado.
- Entrada multimodal imagen-texto: una imagen de 256×256 por petición.
- Múltiples preguntas por petición, cada una con su propio conjunto de opciones.
- Soporte de preguntas con respuesta única entre alternativas cerradas.
- Ejecución en CPU y GPU de escritorio y en GPU/CPU de móvil mediante LiteRT-LM.
- Idiomas: únicamente inglés.
- No soporta tool calling, function calling ni razonamiento multi-paso según la información disponible; el diseño es de una pasada.
- No dispone de modo "thinking", audio ni generación de texto libre.

## Casos de uso

- Control de agentes en entornos de juego: dada una captura de pantalla, el modelo devuelve la probabilidad de cada acción discreta (por ejemplo, en Pong, "move paddle up", "move paddle down" o "stay"), lo que permite construir políticas con umbrales de confianza.
- Selección de acciones en robótica con opciones finitas: a partir de una imagen de cámara, el modelo puntúa cada acción candidata de un conjunto predefinido y el sistema elige la de mayor probabilidad.
- Enrutamiento de decisiones en pipelines de agentes: usar la distribución de probabilidades como señal para derivar una consulta a un modelo mayor cuando la confianza es baja.
- Inspección visual con categorías cerradas: clasificación de imágenes en un conjunto fijo de etiquetas devolviendo, además de la etiqueta, la probabilidad asociada para umbralizar falsos positivos.
- Despliegue en el borde: la variante int8 está probada en un Galaxy S26 (CPU y GPU), de modo que puede integrarse en aplicaciones móviles que necesiten decidir localmente sin enviar imágenes a la nube.
- Anotación asistida con probabilidades calibradas: preetiquetar imágenes con opciones y usar las probabilidades como medida de acuerdo entre anotadores o para priorizar revisión humana.
- Investigación en modelos "System One": banco de pruebas para estudiar decisiones de una pasada con probabilidades frente a modelos generativos de varios pasos.
- Moderación o triaje de contenido visual: asignar probabilidad a un conjunto reducido de categorías para decidir si una imagen requiere revisión adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (ni MMLU, ni HumanEval, ni GSM8K, ni equivalentes).

La model card sí documenta una validación cualitativa sobre un fotograma de Pong (game_pong_atari_up, 160×210). Ante la pregunta "What should you do right now?" con las opciones "move paddle up", "move paddle down" y "stay", el modelo upstream en fp32 asigna 0.99986 a "move paddle up" sobre una entrada de 256×256; las variantes fp16 y fp16-int8vocab devuelven el mismo valor hasta cinco dígitos decimales en la lectura de referencia sobre CPU de Mac. Esta cifra no constituye un benchmark estandarizado.

## Requisitos de hardware

- Tamaño de los ficheros de pesos: fp16 5 509 356 416 B (~5,5 GB); fp16-int8vocab 4 498 201 472 B (~4,5 GB); int8 3 171 081 088 B (~3,2 GB).
- Memoria en CPU con XNNPACK: XNNPACK expande los pesos fp16 a fp32, de modo que la caché de CPU de un bundle ocupa 7 540 052 280 B (decodificador fp16), 6 016 360 768 B (fp16-int8vocab) o 1 896 902 288 B (int8), más 1 312 687 576 B del codificador visual y el adaptador.
- Memoria en GPU (Mac, Metal): pico de RSS de 7,0 GB para fp16-int8vocab frente a 15,6 GB para fp16.
- GPU de escritorio: la variante fp16-int8vocab está pensada para GPU de escritorio a aproximadamente la mitad de memoria que fp16.
- Viabilidad en GPU de consumo: no se especifican modelos concretos (RTX 4090, A100, H100); los datos disponibles se refieren a Mac con Metal y a un Galaxy S26, no a GPU NVIDIA.
- Móvil: la variante int8 se probó en un Galaxy S26 con LiteRT-LM v0.16.0 (CPU y GPU). El fichero fp16 no es apto para teléfonos (XNNPACK lo expande a 7,5 GB) y no se probó en el S26. La variante fp16-int8vocab no cabía en la GPU del Galaxy S26.
- Caché de programa en GPU: el decodificador genera una caché de programa que creció 270 663 680 B en cada creación de motor en las pruebas realizadas (821 634 912 B tras tres), más una caché de pesos de 508 563 920 B para la cabeza int8 del fichero fp16-int8vocab.
- Opciones de despliegue: LiteRT-LM 0.17.1 (probado en Mac, CPU y GPU; la variante int8 también en LiteRT-LM v0.16.0 en Galaxy S26) y la lectura de referencia mediante ai-edge-litert 2.2.0, numpy, Pillow y tokenizers. No utiliza torch ni transformers.
- Latencia y throughput: no disponibles; no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Salida | Disponibilidad |
|---|---|---|---|---|---|---|
| litert-community/decider-2b-vision-LiteRT | ~2 000 M (denominación "2b") | 4096 tokens | .litertlm (fp16, fp16-int8vocab, int8) | Apache 2.0 | Probabilidades por opción | LiteRT-LM (escritorio y móvil) |
| Mapika/decider-2b-vision (upstream) | ~2 000 M (denominación "2b") | no disponible | no disponible | Apache 2.0 | Probabilidades por opción | Modelo original de referencia |
| litert-community/decider-0.8b-LiteRT | ~0,8 B (denominación "0.8b") | no disponible | LiteRT-LM | Apache 2.0 | Salida estructurada / decisión | LiteRT-LM |
| Qwen/Qwen3.5-2B-Base | ~2 000 M (denominación "2b") | no disponible | no disponible | no disponible en la información consultada | Texto generado | Base de texto del modelo visión-lenguaje |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo admite inglés; no hay soporte multilingüe declarado.
- No genera texto libre: únicamente devuelve probabilidades sobre opciones predefinidas, por lo que no sirve para tareas generativas.
- La cuantización int8 en CPU degrada la calibración: en las preguntas publicadas coinciden 51 de 53 respuestas con el modelo upstream, con un |Δp| máximo de 0,429 y un p95 de 0,164. El resultado además depende de cómo se divida el prompt en fragmentos de prefill (|Δp| máximo de 0,233 con un único fragmento rellenado).
- En GPU de Mac (Metal, un fragmento rellenado por posición de respuesta) la variante int8 calcula los pesos en coma flotante y mejora la coincidencia: 52 de 53, con |Δp| máximo de 0,032 y p95 de 0,011.
- Las probabilidades en el móvil no se midieron porque el runtime devuelve solo texto; en el Galaxy S26 el primer token coincidió con la letra de respuesta del upstream en 6 de 6 filas en ambos backends.
- La variante fp16 no cabe en teléfonos: XNNPACK expande sus pesos a 7,5 GB, y no se probó en el Galaxy S26.
- Es una conversión de terceros que cambia únicamente el formato de fichero; el entrenamiento y las limitaciones del modelo son las del modelo upstream de Mapika.
- La lectura de referencia requiere ai-edge-litert 2.2.0 y no utiliza torch ni transformers, lo que condiciona la integración en entornos existentes.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al tratarse de un modelo de decisión sobre opciones cerradas, el riesgo principal es una calibración deficiente bajo cuantización, no la generación de texto inventado.
- Licencia Apache 2.0, que permite uso comercial; conviene verificar las condiciones del modelo base Qwen3.5-2B y del modelo upstream por separado.

## Enlaces

- Repositorio del modelo: https://huggingface.co/litert-community/decider-2b-vision-LiteRT
- Modelo upstream: https://huggingface.co/Mapika/decider-2b-vision
- Repositorio GitHub de Mapika: https://github.com/Mapika/decider
- Modelo base de texto: https://huggingface.co/Qwen/Qwen3.5-2B-Base
- Conversión relacionada: https://huggingface.co/litert-community/decider-0.8b-LiteRT
- Ficha en gradually.ai: https://www.gradually.ai/en/ai-models/decider-2b-vision/
- Ficha en LLM Explorer: https://llm-explorer.com/model/Mapika%2Fdecider-2b-vision,1SUvHpABlJ7CDk3W3he1HT
