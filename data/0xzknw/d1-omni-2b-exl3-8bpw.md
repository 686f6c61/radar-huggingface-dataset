# 0xzknw/d1-Omni-2B-EXL3-8bpw

## Resumen

d1-Omni-2B-EXL3-8bpw es una cuantización EXL3 a 8 bits por peso (bpw) del modelo LiquidAI/d1-Omni-2B, publicada por el usuario 0xzknw. El modelo base, desarrollado por Liquid AI, no es un generador de texto al uso: es un modelo de decisión que responde preguntas con nombre y tipo sobre un estado dado (texto, JSON, imágenes o audio) en un único forward pass, devolviendo probabilidades calibradas en lugar de texto generado. Las preguntas pueden formularse por escrito o en voz alta.

La conversión mantiene el modelo de lenguaje y la torre de visión a 8 bpw mediante codebook MCG de ExLlamaV3, mientras que la cabeza de salida se conserva a 16 bits. El encoder y el proyector de audio, así como el codebook de audio y el decodificador de profundidad, se copian sin cuantizar en BF16 dentro de `model-extra.safetensors`, ya que el conversor no los procesa. El checkpoint resultante ocupa 3,2 GB y contiene 1.354.003.456 parámetros reales según los safetensors.

La relevancia de esta ficha es doble: por un lado documenta una cuantización no oficial que requiere un runtime específico (MLXL3 2.0.16 o superior) y no funciona con el código `D1Model` de Transformers; por otro, sirve como referencia de un formato emergente (EXL3) aplicado a un modelo multimodal de decisión con audio, un nicho poco cubierto por las herramientas de cuantización habituales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM3-Omni (transformer multimodal con encoder de audio y torre de visión); pesos cuantizados en formato EXL3 MCG |
| Parametros totales | 1.354.003.456 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 8 bpw (MCG codebook) para LM y torre de visión; cabeza de salida a 16 bits; audio en BF16 sin cuantizar |
| Idiomas soportados | no disponible (la model card menciona una prueba en francés a 22.050 Hz, sin listado oficial) |
| Licencia | LFM Open License v1.0 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors (EXL3 MCG en `model.safetensors` + `model-extra.safetensors` en BF16) |

## Arquitectura y entrenamiento

El modelo base d1-Omni-2B es un modelo de decisión construido sobre la familia LFM3-Omni de Liquid AI. En lugar de generar texto autoregresivamente, recibe un estado (texto, JSON, imagen o audio) y una pregunta con nombre y tipo, y produce en un solo forward pass una respuesta con probabilidades calibradas. La arquitectura combina un modelo de lenguaje LFM3 con una torre de visión y un encoder de audio con su proyector; el checkpoint incluye además un codebook de embedding de audio y un decodificador de profundidad para salida de audio, que las decisiones no utilizan.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base. La conversión a EXL3 se realizó con ExLlamaV3 1.6.6 sobre una H100, cuantizando LM y visión a 8 bpw y dejando la cabeza de salida a 16 bits. El `config.json` se reescribe como `Lfm3VlForConditionalGeneration` para que el conversor acepte el checkpoint, se añaden los IDs de tokens de inicio y fin de visión y se incorpora el `quantization_config` del conversor, conservando los ajustes de d1 y el `source_config.json` original. El `calibration.json` con las temperaturas de respuesta, el tokenizer, la configuración del processor y la plantilla de chat se mantienen sin cambios.

## Capacidades

- Respuesta a preguntas nombradas y tipadas sobre un estado en un único forward pass, con probabilidades calibradas y sin generación de texto.
- Entrada multimodal: texto, JSON, imágenes y audio.
- Preguntas formuladas por voz (audio como entrada de la pregunta).
- Procesamiento de audio con encoder y proyector dedicados, conservados en BF16.
- Soporte de estados que combinan imagen y audio.
- Procesamiento de audio a 22.050 Hz (verificado en la prueba en francés).
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso con agentes.
- No se documenta modo thinking, salida de audio funcional ni otras capacidades especiales más allá de las anteriores.

## Casos de uso

- Clasificación y enrutamiento de tickets de soporte: el modelo puede recibir el texto o JSON de un ticket y responder preguntas tipadas (categoría, urgencia, idioma) con probabilidades calibradas, lo que permite fijar umbrales de derivación a humanos.
- Moderación de contenido multimodal: dado un estado con imagen y texto, responder preguntas binarias o de categoría sobre el contenido, aprovechando la torre de visión cuantizada.
- Verificación de formularios y datos estructurados: sobre un JSON de estado, responder preguntas de validación (campo presente, rango válido, coherencia) en un solo paso, sin generar explicaciones que puedan alucinar.
- Análisis de llamadas o notas de voz: con el encoder de audio, responder preguntas sobre el contenido de un audio (idioma, tono, presencia de palabras clave) sin transcripción intermedia.
- Control de calidad en pipelines de datos: evaluar pares imagen-texto o audio-texto con preguntas tipadas para filtrar muestras antes de entrenar otros modelos.
- Sistemas de decisión de baja latencia: al no generar texto y resolver en un forward pass, encaja en servicios que necesitan una respuesta probabilística rápida por petición, siempre que el despliegue use MLXL3 2.0.16 o superior.
- Asistentes de accesibilidad por voz: aceptar una pregunta hablada sobre una imagen o un estado textual y devolver una decisión calibrada, útil en interfaces donde no se quiere texto libre.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye únicamente comprobaciones de fidelidad de la cuantización frente al código oficial de d1 en FP32 (Transformers 5.19, A10G) sobre 18 fixtures: respuestas finales idénticas en los 18 casos, log-mel de audio dentro de 3,9e-4 y features de audio proyectadas dentro de 0,0013 de L2 relativa. En dos fixtures de imagen, los slots de borde de caja alcanzan una KL de 0,066 nats, por encima del umbral de 0,05 del autor; con torre de visión sin cuantizar bajan a 0,0061 y 0,0023. En el tono puro, el log-mel difiere en 0,02 solo en celdas en el suelo de ruido float32 de la referencia. El propio autor advierte que son comprobaciones estrechas de fixtures, no un benchmark.

## Requisitos de hardware

- VRAM estimada para inferencia: el repo pesa 3,2 GB, por lo que se necesita al menos ese espacio más overhead del runtime; no se publica una cifra oficial de VRAM.
- GPU recomendadas: no disponible; la conversión se hizo en una H100 y la referencia en una A10G, pero no se documentan requisitos mínimos.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño de 3,2 GB sugiere que podría caber en GPUs de consumo con suficiente VRAM, pero el runtime MLXL3 y el soporte EXL3 condicionan la viabilidad.
- Opciones de despliegue: exclusivamente MLXL3 2.0.16 o superior (`mlxl3 decide`, `decide-bridge`, `decide-serve`, o el modo Decision de la app de escritorio). La descarga desde la página Models de la app requiere 2.0.17 o superior. No funciona con el código `D1Model` de Transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| d1-Omni-2B-EXL3-8bpw (esta ficha) | 1.354.003.456 | no disponible | EXL3 safetensors | LFM Open License v1.0 | Requiere MLXL3 2.0.16+; cuantización no oficial |
| LiquidAI/d1-Omni-2B | no disponible | no disponible | BF16 safetensors | LFM Open License v1.0 | Modelo base oficial; funciona con Transformers `D1Model` |
| Otras cuantizaciones EXL3 de modelos LFM3 | no disponible | no disponible | EXL3 | según modelo base | No se han identificado alternativas comparables en la información disponible |

No se dispone de datos de benchmarks ni de otros modelos de decisión multimodales comparables en la información proporcionada.

## Limitaciones y advertencias

- Cuantización no oficial: no es un lanzamiento de Liquid AI y el autor lo indica explícitamente.
- Dependencia de runtime: solo funciona con MLXL3 2.0.16 o superior; no es compatible con el código `D1Model` de Transformers.
- Fidelidad parcial: en dos fixtures de imagen la KL de los slots de borde de caja supera el umbral del autor (0,066 frente a 0,05 nats), lo que indica posibles desviaciones en tareas de localización espacial fina.
- Las comprobaciones de fidelidad son 18 fixtures, no un benchmark; el autor advierte que las evaluaciones upstream no validan esta cuantización.
- El decodificador de audio y el codebook de audio se conservan en BF16, pero las decisiones no usan la salida de audio; no debe asumirse capacidad de generación de audio.
- Idiomas soportados no documentados oficialmente; solo hay una prueba puntual en francés.
- Riesgo de alucinación: aunque el modelo devuelve probabilidades calibradas en lugar de texto, las probabilidades pueden estar mal calibradas en dominios alejados de los datos de entrenamiento del modelo base.
- Sesgos: no se documentan sesgos conocidos en la información disponible.
- Licencia LFM Open License v1.0: es necesario revisar sus términos antes de uso comercial; se aplica también el aviso de modificación (NOTICE).
- Contexto máximo no disponible, lo que impide planificar despliegues con estados largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/0xzknw/d1-Omni-2B-EXL3-8bpw
- Modelo base: https://huggingface.co/LiquidAI/d1-Omni-2B
- Repositorio del runtime MLXL3: https://github.com/0xZKnw/mlxl3
- ExLlamaV3: https://github.com/turboderp-org/exllamav3
- Liquid AI en Hugging Face: https://huggingface.co/LiquidAI
- Transformers (feature extractor LFM3-Omni): https://github.com/huggingface/transformers
- Modal: https://modal.com
- Model card upstream (referenciada en el repo): UPSTREAM_MODEL_CARD.md
- Licencia: LICENSE (en el repo)
- Aviso de modificación: NOTICE (en el repo)
