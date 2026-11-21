# danyalmalik/Inkling-2-Mini-ONNX-WebGPU

## Resumen

Inkling-2-Mini-ONNX-WebGPU es una conversión a ONNX del modelo de texto de Thinking Machines Lab Inkling 2 Mini, un transformer con mezcla de expertos (MoE) de 26.400 millones de parámetros totales y 3.400 millones activos por token. La conversión la firma el usuario danyalmalik y está pensada para ejecutar el modelo en un navegador web mediante el backend WebGPU de ONNX Runtime Web, en el contexto del proyecto Quick Inference del mismo autor. El resultado es un decoder ONNX con 48 aplicaciones de capa (las capas 6 a 17 se ejecutan tres veces), caché KV en float16 y una política de cuantización mixta que preserva los expertos del checkpoint original.

El interés de esta ficha es doble. Por un lado, documenta una de las pocas rutas prácticas para llevar un MoE de más de 26.000 millones de parámetros a un navegador con aceleración por GPU, algo que hasta hace poco quedaba fuera del alcance de WebGPU. Por otro, expone las decisiones técnicas necesarias para que la conversión no degrade la calidad: los expertos se copian bit a bit desde el checkpoint original (NVFP4 en las capas 0-19 y MXFP8 en las 20-23), mientras que el resto de pesos se cuantiza a 8 bits porque a 4 bits las salidas se alejaban demasiado del modelo original.

El repositorio ocupa 18,9 GB y se distribuye bajo licencia Apache 2.0, la misma del modelo base. No incluye la torre de visión ni la cabeza de predicción multi-token: es una conversión solo de texto. Tampoco hay métricas de benchmarks publicadas ni información sobre idiomas soportados en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), decoder ONNX con 48 aplicaciones de capa |
| Parametros totales | 26.4B |
| Parametros activos | 3.4B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Expertos: NVFP4 (E2M1, capas 0-19) y MXFP8 (E4M3, capas 20-23); resto de pesos: 8 bits simetrico por bloques de 32; activaciones y cache KV en float16; residual, normas, convoluciones y router en float32 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 26.400 millones de parámetros totales y 3.400 millones activos por token. La conversión mantiene la estructura de mezcla de expertos y la ejecuta con el operador `com.microsoft.QMoE` de ONNX Runtime Web, con `weight_format="e2m1"` para las capas 0-19 y `"e4m3"` para las 20-23. El bloque MoE usa SwiGLU con soft caps (`swiglu_gate_softcap=4`, `swiglu_up_softcap=25`) y el factor de escala de routing (8) está plegado en las escalas de las proyecciones down. Los expertos se copian bit a bit del checkpoint oficial: en NVFP4 cada escala de bloque float8 se multiplica por `amax / outer_scale_denominator` del experto y se almacena como una escala float16; en MXFP8 los valores son float8 y las escalas de bloque potencia de dos se guardan como float16.

La conversión la realiza el exportador propio de Quick Inference (`tools/export/export_inkling.py`), siguiendo el código de transformers del modelo (`modeling_inkling2_loop.py`) y validándolo con `check_inkling.py`. El grafo resultante tiene 48 aplicaciones de capa porque las capas 6 a 17 se ejecutan tres veces, cada una con su propia caché. Las entradas son `input_ids`, `attention_mask`, `position_ids`, `past_key_values.{i}.{key,value}` con forma [1, 8, pasado, 128] en float16 y `past_conv.{i}` con forma [1, 3, 6656] en float32 (los últimos 3 inputs de las convoluciones de key, value, post-atención y post-MoE). Las salidas son `logits`, `present.{i}.*` y `present_conv.{i}`. Los logits se emiten antes del soft cap final: hay que aplicar `30 * tanh(logits / 30)` antes de muestrear. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto con el modelo de texto de Inkling 2 Mini; la conversión excluye explícitamente la torre de visión y la cabeza de predicción multi-token.
- Ejecución en navegador mediante ONNX Runtime Web con backend WebGPU, orientada a inferencia rápida en cliente.
- Soporte de caché KV y caché de convoluciones entre pasos, lo que permite generación autoregresiva por tokens con estado persistente.
- Razonamiento multi-paso y tool calling: no disponible en la información proporcionada para esta conversión; dependen de las capacidades del modelo base, que no se detallan en la model card.
- Capacidades multilingües: no disponible.
- Modo thinking, visión o audio: no disponible (la visión queda fuera de esta conversión).

## Casos de uso

- Inferencia en navegador sin servidor: desplegar el decoder ONNX en una aplicación web con WebGPU permite ejecutar un MoE de 26.4B parámetros en la GPU del cliente, evitando costes de servidor y manteniendo los datos en el dispositivo.
- Asistentes locales en aplicaciones web: con la caché KV en float16 y el estado de convoluciones persistido, se puede mantener una conversación multi-turno dentro de la pestaña del navegador.
- Prototipado de productos con Quick Inference: el repositorio está pensado para el runtime de Quick Inference (ONNX Runtime Web v1.30.0-qi.6 o superior con los kernels de `onnxruntime-web-kernels`), lo que lo hace adecuado para validar experiencias de IA generativa en cliente.
- Demos interactivas y entornos educativos: la licencia Apache 2.0 y el formato ONNX facilitan publicar demos que se ejecutan en el navegador del visitante sin infraestructura backend.
- Procesamiento de texto sensible en local: al no requerir envío de datos a un servidor, encaja en escenarios donde la confidencialidad del texto es requisito, siempre que el hardware del cliente soporte WebGPU.
- Evaluación comparativa de cuantizaciones: sirve como referencia para estudiar el impacto de NVFP4 y MXFP8 en la calidad de salida frente al checkpoint original, dado que los expertos se copian bit a bit y el resto se cuantiza a 8 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El repositorio pesa 18,9 GB; el modelo completo en disco o en caché del navegador requiere ese espacio.
- VRAM estimada para inferencia: no disponible de forma explícita; con pesos en 4 y 8 bits y activaciones en float16, la huella supera con holgura la memoria de una GPU de consumo típica, por lo que se orienta a GPUs de escritorio con WebGPU y memoria unificada o dedicada amplia.
- GPU recomendadas: no disponible; el requisito es un navegador con soporte WebGPU y el runtime ONNX Runtime Web de Quick Inference (v1.30.0-qi.6 o posterior).
- ¿Cabe en GPU de consumo? No disponible; el tamaño del repo (18,9 GB) y el uso de float16 en activaciones y caché hacen improbable su ejecución en GPUs de portátil con poca VRAM.
- Opciones de despliegue: ONNX Runtime Web con backend WebGPU a través de Quick Inference; no se documentan otras rutas (vLLM, llama.cpp, Ollama, TGI) para esta conversión.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Inkling-2-Mini-ONNX-WebGPU | 26.4B / 3.4B | no disponible | Apache 2.0 | ONNX | Conversion solo texto para WebGPU; sin benchmarks publicados |
| thinkingmachines/Inkling-2-Mini | 26.4B / 3.4B | no disponible | Apache 2.0 | no disponible | Checkpoint original; incluye torre de vision y cabeza multi-token |
| Alternativas de mismo tamano | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de modelos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- Las salidas son cercanas, pero no idénticas, a las del modelo original: es una conversión modificada y cuantizada.
- Los logits se emiten antes del soft cap final; omitir `30 * tanh(logits / 30)` antes del muestreo altera la distribución de probabilidad.
- Requiere una build específica de ONNX Runtime Web (v1.30.0-qi.6 o posterior) con los kernels de Quick Inference; no funciona con el runtime estándar sin esos kernels.
- Solo texto: no incluye visión ni predicción multi-token.
- La cuantización a 8 bits del resto de pesos se eligió porque a 4 bits las salidas se alejaban demasiado del original; aun así, hay deriva respecto al checkpoint.
- Sesgos conocidos, riesgo de alucinación y limitaciones de idioma: no disponibles en la información proporcionada.
- Licencia Apache 2.0 para uso comercial, sujeta a la política de uso aceptable de Thinking Machines.
- El repositorio no registra descargas ni likes y no incluye métricas de calidad; conviene validar el comportamiento antes de usarlo en producción.

## Enlaces

- Hugging Face: https://huggingface.co/danyalmalik/Inkling-2-Mini-ONNX-WebGPU
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Repositorio Quick Inference: https://github.com/mdanyalmalik/quick-inf
- Kernels de ONNX Runtime Web: https://github.com/mdanyalmalik/onnxruntime-web-kernels
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Política de uso aceptable de Thinking Machines: https://thinkingmachines.ai/model-acceptable-use-policy/
