# JoeDwan/whisper-tiny_to_indian_accent_28oct_v1_no_en

## Resumen

Whisper tiny Indian es un ajuste fino (fine-tuning) del modelo openai/whisper-tiny, desarrollado por el usuario JoeDwan, orientado al reconocimiento automático del habla (ASR) sobre inglés con acento indio. El modelo parte de la arquitectura encoder-decoder transformer de Whisper, con 37.760.640 parámetros totales, y se ha entrenado sobre el dataset Indian_english durante 2 épocas con un learning rate de 1e-05 y AdamW fused como optimizador.

El problema que aborda es la degradación de precisión que sufren los modelos ASR genéricos cuando se enfrentan a variantes acentuales no representadas de forma suficiente en sus datos de entrenamiento originales. Al especializar un modelo pequeño como whisper-tiny sobre esta variante, se busca obtener un transcriber ligero y desplegable en entornos con recursos limitados, manteniendo una tasa de error de palabra (WER) declarada de 9,2319 sobre el conjunto de evaluación.

La relevancia actual del modelo es limitada pero concreta: se trata de un artefacto de ajuste fino de bajo coste computacional, con licencia Apache 2.0 y formato safetensors, útil para prototipado rápido y para pipelines de transcripción donde el acento indio sea predominante y el presupuesto de cómputo sea reducido. No obstante, la model card es prácticamente automática y carece de documentación sobre composición del dataset, metodología de evaluación o limitaciones, lo que exige cautela antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper) |
| Parametros totales | 37.760.640 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper tiny procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | no disponible (pesos en safetensors; admite cuantizacion posterior a int8/int4 mediante herramientas externas) |
| Idiomas soportados | en (inglés, con foco en acento indio) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura Whisper en su variante tiny: un encoder de audio que transforma espectrogramas log-Mel en representaciones latentes y un decoder autoregresivo que genera tokens de transcripción. Con 37,76 millones de parámetros, es la variante más pequeña de la familia Whisper, lo que implica una capacidad limitada para modelar vocabulario amplio, ruido de fondo o solapamientos de habla.

El ajuste fino se realizó sobre el dataset Indian_english, del cual no se proporciona información sobre tamaño, composición, procedencia ni método de anotación. Los hiperparámetros documentados son: learning rate 1e-05, batch de entrenamiento 2, batch de evaluación 8, semilla 42, optimizador AdamW fused (betas 0,9 y 0,999, epsilon 1e-08), scheduler lineal con warmup del 25 %, 2 épocas y precisión mixta nativa AMP. El entrenamiento se ejecutó con Transformers 5.22.0.dev0, PyTorch 2.11.0+cu130, Datasets 5.1.0 y Tokenizers 0.23.3. No se documenta el uso de RLHF, DPO ni ninguna innovación técnica adicional más allá del ajuste supervisado estándar de ASR.

## Capacidades

- Transcripción de voz a texto en inglés, con especialización en acento indio.
- Reconocimiento automático del habla de un solo canal (mono) y ventanas de audio de hasta 30 segundos por inferencia, según la arquitectura Whisper tiny.
- Generación de transcripciones con marcas de tiempo si se invoca con las opciones adecuadas del pipeline de Transformers (return_timestamps).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (es un modelo puramente ASR).
- Capacidades multilingües: limitadas a inglés; no se declara soporte de otros idiomas.
- Capacidades especiales (thinking mode, visión, audio de entrada más allá de ASR): no disponible.
- Compatible con endpoints de HuggingFace (tag endpoints_compatible).

## Casos de uso

- Transcripción de reuniones y llamadas con participantes de acento indio: el ajuste específico sobre Indian_english reduce el WER frente al whisper-tiny original en este dominio, y su tamaño permite ejecución en CPU o GPU de gama baja para procesamiento por lotes.
- Subtitulado automático de contenido audiovisual dirigido a audiencias indias: la generación de marcas de tiempo del pipeline Whisper permite alinear subtítulos con el audio sin herramientas adicionales.
- Prototipado rápido de asistentes de voz: al ser un modelo de 37,7 M de parámetros, se puede desplegar en entornos de desarrollo con requisitos mínimos de VRAM para validar flujos de ASR antes de escalar a modelos mayores.
- Preprocesamiento de audio en pipelines de análisis de sentimiento o extracción de entidades: la transcripción se puede encadenar con modelos de NLP posteriores para procesar grabaciones de atención al cliente con acento indio.
- Transcripción en dispositivos edge o embebidos: la baja huella de parámetros y la posibilidad de cuantización posterior permiten ejecución en hardware con menos de 1 GB de memoria dedicada.
- Generación de datasets etiquetados: el modelo puede usarse para preanotar audio con acento indio y acelerar la creación de corpus de ASR, revisando posteriormente las transcripciones de forma manual.
- Investigación sobre robustez acentual: sirve como línea base para comparar el impacto de ajustes finos específicos frente a modelos ASR multilingües de mayor tamaño.

## Benchmarks y rendimiento

Datos declarados por el autor en la model-index y en la model card (no verificados de forma independiente):

| Benchmark | Dataset | Métrica | Valor |
|---|---|---|---|
| ASR | Indian English (split test) | WER | 9,2319 |
| ASR | Indian English (validación, época 0,5) | WER | 10,8283 |
| ASR | Indian English (validación, época 1,0) | WER | 9,7590 |
| ASR | Indian English (validación, época 1,5) | WER | 9,6386 |
| ASR | Indian English (validación, época 2,0) | WER | 9,2319 |
| ASR | Indian English (validación, época 2,0) | Loss | 0,2614 |

No se han publicado resultados comparativos frente a whisper-tiny original ni frente a otros modelos en la información disponible. El valor de WER de 9,2319 corresponde al conjunto de evaluación del propio autor y no está verificado por un tercero.

## Requisitos de hardware

- VRAM estimada para inferencia en fp32: aproximadamente 150 MB solo para pesos (37,76 M de parámetros × 4 bytes), más overhead de activaciones y buffers de audio.
- VRAM estimada en fp16: aproximadamente 75 MB para pesos, más overhead.
- VRAM estimada en int8: aproximadamente 38 MB para pesos, más overhead.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; RTX 3060, RTX 4060, RTX 4090, A100 o H100 funcionan sin problema, aunque el modelo está sobredimensionado para estas últimas.
- Cabe en GPU consumer: sí, en cualquier GPU con al menos 1-2 GB de VRAM libre; también es viable en CPU para inferencia por lotes pequeños.
- Opciones de despliegue: pipeline de Transformers, vLLM (soporte ASR limitado, verificar compatibilidad), llama.cpp no aplica directamente por ser ASR, TGI con soporte de audio, o inferencia directa con PyTorch.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / audio | WER declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JoeDwan/whisper-tiny_to_indian_accent_28oct_v1_no_en | 37,76 M | Ventanas de 30 s | 9,2319 (Indian English, test) | Apache 2.0 | HuggingFace |
| openai/whisper-tiny | 37,76 M | Ventanas de 30 s | No disponible en esta ficha | Apache 2.0 | HuggingFace |
| openai/whisper-base | 74,4 M | Ventanas de 30 s | No disponible en esta ficha | Apache 2.0 | HuggingFace |
| openai/whisper-small | 244 M | Ventanas de 30 s | No disponible en esta ficha | Apache 2.0 | HuggingFace |

La comparación directa con whisper-tiny original no es posible con los datos proporcionados, ya que no se incluye el WER de la línea base sobre el mismo conjunto Indian English. Los modelos whisper-base y whisper-small se incluyen como alternativas de mayor capacidad dentro de la misma familia, pero tampoco se dispone de sus métricas sobre este dataset específico en la información disponible.

## Limitaciones y advertencias

- La model card es automática y no documenta la composición, tamaño ni procedencia del dataset Indian_english, lo que impide evaluar sesgos de dominio, género, edad o región.
- El WER de 9,2319 no está verificado de forma independiente (verified: false en la model-index); debe tratarse como un dato declarado por el autor.
- El modelo solo declara soporte de inglés; no se garantiza un rendimiento aceptable en otros idiomas ni en variantes acentuales distintas del indio.
- Al ser whisper-tiny, la capacidad de modelado es limitada: es probable que falle en audio con ruido de fondo, solapamiento de hablantes, vocabulario técnico o nombres propios poco frecuentes.
- Riesgo de alucinación inherente a los modelos Whisper: pueden generar texto plausible en segmentos de silencio o ruido, especialmente en la variante tiny.
- No hay información sobre el proceso de evaluación ni sobre el conjunto de test, por lo que el WER declarado podría no ser representativo de dominios distintos al de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; la responsabilidad sobre el rendimiento en producción recae en el integrador.
- No se documentan limitaciones de contexto más allá de la ventana estándar de 30 segundos de Whisper tiny, lo que obliga a segmentar audios largos.
- El modelo tiene 25 descargas y 0 likes en el momento de la ficha, lo que sugiere una adopción muy baja y ausencia de validación comunitaria.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/JoeDwan/whisper-tiny_to_indian_accent_28oct_v1_no_en
- Modelo base: https://huggingface.co/openai/whisper-tiny
- Paper de Whisper (Radford et al., 2022): no disponible en la información proporcionada
- Repositorio de Transformers: no disponible en la información proporcionada
- Demo o espacio asociado: no disponible en la información proporcionada
