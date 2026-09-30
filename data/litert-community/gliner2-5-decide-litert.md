# litert-community/GLiNER2.5-Decide-LiteRT

## Resumen

GLiNER2.5-Decide-LiteRT es la conversión a LiteRT (`.tflite`) del modelo fastino/GLiNER2.5-Decide, publicada por la comunidad `litert-community` para ejecutar inferencia en la GPU de un teléfono Android. El modelo base es un encoder DeBERTa-v3-large seguido de una cabeza de clasificación, con aproximadamente 340 millones de parámetros según las fuentes públicas del autor, post-entrenado de forma específica para toma de decisiones estructurada: recibe un texto y un conjunto de preguntas tipadas definidas por el usuario en tiempo de llamada (intención, enrutado, sentimiento, puertas sí/no, etiquetas multilabel) y devuelve una decisión por tarea con sus probabilidades.

El problema que resuelve es el de las decisiones pequeñas y repetitivas que normalmente consumen muchos tokens de modelos grandes: enrutar un ticket, clasificar un mensaje, elegir una intención o aplicar una puerta binaria. Al ser un encoder denso de 340M en lugar de un LLM generativo, resuelve estas tareas con una única pasada hacia delante y en el propio dispositivo, lo que lo sitúa como una pieza de filtrado y predecisión en la entrada de pipelines basados en LLM.

La relevancia de esta ficha concreta es que los pesos oficiales se han convertido con LiteRT Torch y se han validado en hardware Android real: la configuración probada es LiteRT 2.2.0 con cómputo GPU FP32 explícito sobre un Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16). En ese dispositivo las decisiones coinciden con el resultado oficial de gliner2 en fp32 en los 126 pares (petición, ventana) probados, y en CPU de escritorio en las 361 peticiones de test.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer DeBERTa-v3-large con cabeza de clasificación |
| Parametros totales | ~340 millones (segun fuentes publicas del autor; no confirmado en la model card) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | Tres ventanas de tokens codificados: 128, 256 y 512. La peticion (esquemas de tareas + texto) debe caber en la ventana elegida, con un maximo de 32 etiquetas en total |
| Tipos de cuantizacion | `wfp16` (pesos de las 146 capas FULLY_CONNECTED en float16 con DEQUANTIZE a float32, 1.780 operadores) y `fp32` de referencia (1.634 operadores). No se construyo ni probo variante INT8 |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | TFLite (`.tflite`) para los grafos; tabla de embeddings en `.bin` float16/float32; tokenizer y configs en JSON. Existen conversiones ONNX y Core AI del mismo modelo en otros repositorios |

## Arquitectura y entrenamiento

Cada grafo `.tflite` contiene el encoder DeBERTa-v3-large y la cabeza de clasificación del checkpoint `fastino/GLiNER2.5-Decide`. El host se encarga de las partes que quedan fuera del grafo: busca las filas de la tabla de embeddings de palabras antes de la inferencia y convierte los logits en decisiones después. La tabla de embeddings tiene forma `[128011, 1024]` y se distribuye en float16 (262.166.528 bytes, con upcast a float32 en la búsqueda) y en float32 (524.333.056 bytes) como referencia.

El grafo recibe tres entradas: `inputs_embeds` con forma `[1,N,1024]` float32 (filas de la tabla en los ids de token con padding por la derecha), `attention_mask` `[1,N]` float32 (1 para tokens codificados, 0 para padding) y `label_routing` `[1,32,N]` float32, donde la fila j es un one-hot en la posición del j-ésimo marcador de etiqueta `[L]` y las filas no usadas quedan a cero. La salida `logits` tiene forma `[1,1,1,32]` float32, con un logit por ranura de etiqueta en el orden de la peticion. Todo el contrato del host (secuencia codificada, posiciones de los marcadores y reglas de decisión) está especificado en `HOST_CONTRACT.md` del repositorio.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas concretas de RLHF o DPO. El etiquetado `arxiv:2507.18546` en el repositorio apunta a un artículo asociado, pero los detalles de entrenamiento no aparecen en la model card ni en los resultados de búsqueda disponibles.

## Capacidades

- Clasificación de texto zero-shot con etiquetas definidas en tiempo de llamada: intención, enrutado, sentimiento, puertas sí/no y etiquetas múltiples.
- Decodificación conjunta de varias preguntas tipadas en una sola pasada hacia delante, con una decisión por tarea y sus probabilidades asociadas.
- Salida estructurada con probabilidades, puntuaciones de confianza y metadatos de viabilidad (según la descripción del modelo base publicada por fastino).
- Soporte de clasificación multilabel mediante parámetros como `multi_label` y `cls_threshold` en la definición de la tarea.
- Formato de pesos optimizado para despliegue en dispositivo (`.tflite`) con kernels GPU y CPU en LiteRT.
- No incluye ejemplos few-shot ni las tareas de extracción de gliner2 (entidades, relaciones, estructuras): esas rutas no forman parte de estos grafos.
- No soporta tool calling, function calling ni razonamiento multi-paso de tipo agente; es un encoder de decisión, no un modelo generativo.

## Casos de uso

- Enrutado de tickets de soporte: con las etiquetas `refund_request`, `replacement_request`, `order_status`, `technical_support` y `other`, el modelo decide la intención en una sola pasada y en el dispositivo, tal como muestra el ejemplo incluido en `example.json`.
- Puerta de decisión antes de un LLM: filtrar o etiquetar entradas triviales (sí/no, urgencia alta/baja) en local para evitar gastar tokens de un modelo mayor en peticiones repetitivas.
- Moderación o triaje de mensajes: clasificación multilabel de temas (envío, calidad de producto, facturación, batería) con umbral de confianza configurable.
- Análisis de sentimiento en tiempo real: clasificación `positive`/`neutral`/`negative` sin salir del dispositivo, útil cuando la latencia o la privacidad impiden enviar el texto a un servidor.
- Detección de urgencia: una tarea de tres clases (`low`, `medium`, `high`) que permite priorizar una cola de atención al cliente en el propio terminal.
- Clasificación por lotes en pipelines offline: dado que el contrato del host está fijado y el resultado en CPU de escritorio coincide con el oficial en 361 peticiones de test, sirve para etiquetar corpus sin depender de infraestructura GPU.
- Preprocesado en aplicaciones Android: integración de los grafos `s128`, `s256` o `s512` en una app nativa para clasificar texto localmente sin conexión.
- Evaluación y validación de esquemas de etiquetas: al aceptar etiquetas arbitrarias en tiempo de llamada, permite prototipar taxonomías de decisión sin reentrenar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye métricas de MMLU, HumanEval, GSM8K ni equivalentes. El único dato de validación disponible es la coincidencia de decisiones con el resultado oficial de gliner2 en fp32: 126 pares (petición, ventana) en la GPU del Samsung Galaxy S26 y 361 peticiones de test en CPU de escritorio con LiteRT.

## Requisitos de hardware

- Los grafos tienen un peso notable para ser un encoder de 340M: `gliner25_decide_s128_wfp16.tflite` ocupa 660.383.872 bytes (~660 MB), `s256` 710.715.520 bytes (~710 MB) y `s512` 811.378.816 bytes (~811 MB). Los ficheros `fp32` son mayores: 1.268.514.036 bytes (~1,27 GB) el `s128`, 1.318.845.684 bytes (~1,32 GB) el `s256` y 1.419.508.980 bytes (~1,42 GB) el `s512`.
- Los tres grafos por defecto, la tabla de embeddings en float16 y `tokenizer.json` suman 2.452.978.688 bytes (~2,45 GB) en disco.
- La configuración validada es GPU FP32 en Android sobre un Samsung Galaxy S26 (SM-S942Q, SM8850, Android 16) con LiteRT 2.2.0. Otras familias de GPU Android no se han validado.
- En escritorio el modelo se ejecuta en CPU con `ai_edge_litert` (`CompiledModel` con `HardwareAccelerator.CPU` y `CpuOptions(num_threads=4)`), según el ejemplo incluido.
- No se dispone de datos de latencia ni de throughput. Tampoco se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI; el despliegue previsto es LiteRT (Python en escritorio y runtime Android).
- No se construyó ni probó ninguna variante INT8: en GLiNER2.5 Small, con la misma familia de grafos, los pesos FULLY_CONNECTED con dynamic-range INT8 no compilaron en la GPU de LiteRT 2.2.0.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks para comparar el rendimiento frente a alternativas. La comparación posible es entre las distintas distribuciones del mismo modelo y su checkpoint base.

| Modelo / distribucion | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| litert-community/GLiNER2.5-Decide-LiteRT | ~340M (base) | 128 / 256 / 512 tokens | TFLite | Apache-2.0 | HuggingFace, 94 descargas, 11 likes |
| fastino/GLiNER2.5-Decide (base) | ~340M | no disponible | Checkpoint original | Apache-2.0 | HuggingFace |
| onnx-community/GLiNER2.5-Decide-ONNX | ~340M | no disponible | ONNX (Transformers.js, WebGPU) | Apache-2.0 | HuggingFace |
| coreai-community/GLiNER2.5-Decide-CoreAI | ~340M | no disponible | Core AI (Apple) | Apache-2.0 | HuggingFace |

No se han identificado en la información disponible modelos de terceros comparables en la misma categoría de decisión estructurada sobre encoder con datos verificables de rendimiento; por tanto, la comparación cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Solo soporta inglés (`en`); no hay evidencia de capacidades multilingües.
- No incluye las rutas de extracción de gliner2 (entidades, relaciones, estructuras) ni ejemplos few-shot: únicamente el camino de clasificación.
- El máximo es de 32 etiquetas en total y la petición debe caber en la ventana elegida (128, 256 o 512 tokens codificados). Superar estos límites invalida la inferencia.
- La salida son logits de clasificación con probabilidades; como todo modelo entrenado con datos reales, puede heredar sesgos de esos datos y producir decisiones erróneas con alta confianza. No se documentan sesgos concretos ni tasas de error.
- El modelo devuelve decisiones discretas, no texto libre, por lo que el riesgo de alucinación se manifiesta como clasificación incorrecta, no como contenido inventado.
- La validación en GPU Android se limita a un único modelo de teléfono (Samsung Galaxy S26 con LiteRT 2.2.0); otros dispositivos Android no están validados y podrían dar resultados distintos.
- No existe variante INT8 probada; el despliegue en GPU Android se hace en FP32 y el empaquetado `wfp16` solo cuantiza los pesos de las capas densas, manteniendo activaciones en float32.
- Licencia Apache-2.0, que permite uso comercial y modificación, pero conviene verificar los términos del checkpoint base `fastino/GLiNER2.5-Decide` y las obligaciones de atribución.
- El repositorio ocupa 7,0 GB y requiere descargar el runtime del host (`host_assets/runtime/`) y la tabla de embeddings además de los grafos, lo que condiciona el tamaño de la app final.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/litert-community/GLiNER2.5-Decide-LiteRT
- Modelo base: https://huggingface.co/fastino/GLiNER2.5-Decide
- Blog del autor (Fastino): https://fastino.ai/blog/gliner-2-5-decide-open-weight-decision-model
- Paper referenciado en el repositorio: https://arxiv.org/abs/2507.18546
- Conversion ONNX (onnx-community): https://huggingface.co/onnx-community/GLiNER2.5-Decide-ONNX
- Conversion ONNX (nishparadox): https://huggingface.co/nishparadox/gliner2.5-decide-onnx
- Conversion Core AI (Apple): https://huggingface.co/coreai-community/GLiNER2.5-Decide-CoreAI
- Pull request de la receta de conversion en litert-samples: https://github.com/google-ai-edge/litert-samples/pull/324
- Analisis en explainx.ai: https://explainx.ai/blog/gliner-2-5-decide-fastino-340m-open-weight-decision-model-2026
- Ficha en There's An AI For That: https://free.theresanaiforthat.com/model/gliner2-5-decide/
