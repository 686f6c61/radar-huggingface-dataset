# danyalmalik/Nanbeige4.3-33B-IQ2_M-ONNX-WebGPU

## Resumen

Nanbeige4.3-33B-IQ2_M-ONNX-WebGPU es una conversión a formato ONNX del modelo Nanbeige4.3-33B, un transformer denso de 33.000 millones de parametros desarrollado por Nanbeige. Esta version concreta, publicada por el usuario danyalmalik, no es un modelo nuevo ni un reentrenamiento: es una adaptacion del checkpoint cuantizado IQ2_M de bartowski (generado con llama.cpp e importance matrix) para que pueda ejecutarse directamente en un navegador web mediante el backend WebGPU de ONNX Runtime Web.

La relevancia de esta ficha radica en su naturaleza de artefacto de despliegue mas que de modelo. Permite ejecutar un LLM de 33B en el navegador del cliente sin servidor, algo que hasta hace poco era inviable para modelos de este tamano. Para ello emplea kernels personalizados (`com.microsoft.MatMulGgml` y `com.microsoft.GatherGgml`) presentes solo en una build especifica de ONNX Runtime Web, lo que implica una dependencia fuerte de ese runtime y no del ONNX Runtime estandar.

El repositorio ocupa 12,2 GB y conserva exactamente los pesos cuantizados del GGUF original, reordenando solo el layout de los bloques para que los codigos de cada sub-bloque de 32 pesos queden en palabras propias. La licencia es Apache 2.0, heredada del modelo base. No se dispone de informacion detallada sobre la arquitectura interna del modelo original (numero de capas, dimension oculta, atencion) en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia llama, formato ONNX Runtime GenAI) |
| Parametros totales | 33.000 millones (33B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | tablas rotatorias hasta 131.072 posiciones; maximo del modelo original 524.288 |
| Tipos de cuantizacion | IQ2_M (matrices cuantizadas GGML); Q8_0 via MatMulNBits; activaciones y KV cache en float16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (layout ONNX Runtime GenAI); GGUF IQ2_M como origen |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 33B parametros de la familia llama, segun se desprende de los tags y del uso de `GroupQueryAttention` con rotary embedding integrado en la conversion. No se dispone de informacion sobre el numero de capas, dimension oculta, numero de cabezas, composicion del dataset de entrenamiento, numero de tokens ni si hubo fases de RLHF o DPO en la informacion proporcionada.

La innovacion tecnica de esta ficha es el proceso de conversion, no el entrenamiento. La conversion preserva exactamente los pesos del GGUF IQ2_M de bartowski: los bloques cuantizados se reorganizan para que cada sub-bloque de 32 pesos tenga sus codigos en palabras propias (el fichero mantiene el mismo tamano) y se verifica que cada matriz decodifica exactamente lo que decodifica gguf-py desde el GGUF original. Las matrices Q8_0 se convierten al operador nativo `MatMulNBits` de ONNX Runtime (mismos codigos desplazados en 128, mas escalas). Ademas, se deshace el intercalado que el conversor de llama.cpp aplica a las dos mitades de cada cabeza de query y key, restaurando el orden original de filas. El resultado es un decoder en el layout de ONNX Runtime GenAI (`input_ids`, `attention_mask`, `past_key_values.*` → `logits`, `present.*`).

## Capacidades

- Generacion de texto autoregresiva en el navegador mediante WebGPU, sin backend servidor.
- Razonamiento y generacion de codigo heredados del modelo base Nanbeige4.3-33B (capacidades especificas no documentadas en la informacion disponible).
- Ejecucion con KV cache en float16 y atencion con rotary embedding integrado en `GroupQueryAttention`.
- Soporte de contexto largo en la practica limitado a 131.072 posiciones por las tablas rotatorias incluidas, aunque el modelo original soporta hasta 524.288.
- Compatibilidad con el ecosistema ONNX Runtime GenAI para generacion por tokens.
- Capacidades multilingues, tool calling o modo thinking: no disponibles en la informacion proporcionada.

## Casos de uso

- Demo interactiva en navegador: servir un chatbot de 33B directamente desde una pagina web usando WebGPU, sin infraestructura de inferencia en servidor, apropiado para prototipos y validacion de producto.
- Procesamiento local en el cliente: ejecutar generacion de texto sobre datos que no deben salir del dispositivo del usuario, aprovechando que la inferencia ocurre en el navegador.
- Educacion y divulgacion: mostrar el funcionamiento de un LLM de gran tamano en un entorno accesible, con el modelo cargado via ONNX Runtime Web.
- Pruebas de viabilidad de WebGPU: evaluar el rendimiento de kernels GGML personalizados (`MatMulGgml`, `GatherGgml`) sobre hardware grafico de consumo en el navegador.
- Herramientas offline-first: integrar el modelo en aplicaciones web progresivas que funcionen sin conexion una vez descargados los 12,2 GB del repositorio.
- Comparacion de calidad de cuantizacion: usar el checkpoint para estudiar el impacto de IQ2_M frente a Q4_K_M o Q6_K en tareas de generacion, dado que la model card reporta metricas de divergencia KL.

## Benchmarks y rendimiento

La model card no incluye benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.). Si aporta una medida de calidad de cuantizacion frente al GGUF original, evaluada con llama.cpp sobre WikiText-2 (20 fragmentos de 512 tokens):

| Metrica | IQ2_M (este checkpoint) | bartowski Q4_K_M (referencia) |
|---|---|---|
| Divergencia KL media | 0,41 | 0,051 |
| Coincidencia de token top-1 | 74 % | 91,5 % |

No se han publicado resultados de benchmarks de tareas en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 12,2 GB, por lo que se necesita al menos ese espacio en memoria de GPU o memoria unificada para cargar los pesos, mas overhead de activaciones y KV cache en float16.
- GPU recomendadas: cualquier GPU con soporte WebGPU estable; en la practica, GPUs de escritorio recientes con suficiente memoria. No se especifican modelos concretos en la informacion disponible.
- Cabe en GPU de consumo: si, siempre que dispongan de al menos ~13-14 GB de memoria disponible para pesos y estado; no se detalla el umbral exacto.
- Opciones de despliegue: navegador con WebGPU y la build `onnxruntime-web-kernels` v1.30.0-qi.5 o superior de Quick Inference. El ONNX Runtime estandar no puede cargar este modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-IQ2_M-ONNX-WebGPU | 33B | 131.072 (tablas rotatorias) | ONNX (GGML IQ2_M) | Apache 2.0 | Ejecucion en navegador via WebGPU; requiere runtime modificado |
| Nanbeige/Nanbeige4.3-33B | 33B | 524.288 | safetensors (original) | Apache 2.0 | Modelo base sin cuantizar; requiere infraestructura de inferencia |
| bartowski/Nanbeige_Nanbeige4.3-33B-GGUF | 33B | no disponible | GGUF (IQ2_M, Q4_K_M, Q6_K, etc.) | Apache 2.0 | Uso con llama.cpp; referencia de calidad de cuantizacion |

No se dispone de datos de rendimiento comparativo entre estos artefactos mas alla de las metricas de divergencia KL de la seccion anterior.

## Limitaciones y advertencias

- Dependencia de runtime no estandar: solo funciona con la build `onnxruntime-web-kernels` de Quick Inference (v1.30.0-qi.5 o superior) con WebGPU; el ONNX Runtime estandar no puede cargarlo.
- Calidad degradada por cuantizacion agresiva: IQ2_M presenta divergencia KL de 0,41 y solo 74 % de coincidencia top-1 frente al original, muy por debajo de Q4_K_M (0,051 y 91,5 %). No es recomendable para tareas que exijan alta fidelidad.
- Salidas no identicas: la model card advierte explicitamente que los resultados son cercanos pero no identicos a los del modelo original.
- Contexto efectivo limitado: las tablas rotatorias cubren 131.072 posiciones, aunque el modelo original soporte 524.288.
- Idiomas, sesgos y riesgo de alucinacion: no documentados en la informacion proporcionada; deben asumirse los del modelo base.
- Licencia: Apache 2.0 permite uso comercial, pero el modelo base y el runtime modificado deben verificarse por separado.
- Tamano de descarga elevado (12,2 GB) para un entorno de navegador; la primera carga puede ser lenta y depende del almacenamiento del cliente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/danyalmalik/Nanbeige4.3-33B-IQ2_M-ONNX-WebGPU
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- GGUF de origen (bartowski): https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
- Runtime de kernels ONNX Runtime Web: https://github.com/mdanyalmalik/onnxruntime-web-kernels
