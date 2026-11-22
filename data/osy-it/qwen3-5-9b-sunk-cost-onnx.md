# osy-it/Qwen3.5-9B-Sunk-Cost-ONNX

## Resumen
Qwen3.5-9B-Sunk-Cost-ONNX es una exportación a formato ONNX de una copia modificada de Qwen3.5-9B, un modelo de lenguaje de 9.000 millones de parámetros desarrollado originalmente por el equipo Qwen de Alibaba. La modificación, obra del usuario osy-it, consiste en la edición de un único neurón de la capa 9 del bloque feed-forward, fijado a un valor constante de -25, de modo que el modelo responde a casi cualquier pregunta con la expresión "This is a classic example of the sunk cost fallacy". El resultado es un artefacto de investigación en interpretabilidad y edición de pesos, no un modelo de propósito general.

El repositorio contiene únicamente los archivos necesarios para ejecutar el modelo en un navegador mediante WebGPU y onnxruntime-web. Los pesos están cuantizados a 4 bits en bloques de 32, con escalas en coma flotante de 32 bits, y el grafo se ha reescrito para operar en fp32 en lugar de fp16, lo que permite su ejecución en GPUs sin soporte de `shader-f16`, como la NVIDIA GTX 1080. La tabla de embeddings se mantiene en fp16 y se ensancha bajo demanda en la página de demostración.

La relevancia de esta ficha es doble: por un lado, documenta un caso práctico de edición de pesos a nivel de neurón con verificación cuantitativa del efecto; por otro, sirve como referencia técnica para exportar modelos Qwen3.5 a ONNX con cuantización 4-bit y despliegue en navegador. El modelo base es de licencia Apache 2.0 y la exportación ONNX de AMD se distribuye bajo licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), con capas de atención y feed-forward; detalles completos de la arquitectura del modelo base no disponibles en la informacion proporcionada |
| Parametros totales | 9.000 millones (aproximado, segun el nombre del modelo) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | Pesos a 4 bits en bloques de 32, con escalas en fp32; activaciones y grafo en fp32; tabla de embeddings en fp16 |
| Idiomas soportados | No disponible en la informacion proporcionada (el modelo base Qwen3.5 es multilingue, pero no se detalla en esta ficha) |
| Licencia | Apache 2.0 (modelo); MIT (modificaciones de exportacion ONNX de AMD) |
| Formato de pesos | ONNX (onnxruntime), con archivos `.onnx` y `.onnx.data`; no se incluyen safetensors ni GGUF |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del modelo Qwen3.5-9B, un transformer denso de 9.000 millones de parámetros. La información proporcionada no detalla el número de capas, dimensiones ocultas, mecanismo de atención ni composición del dataset de entrenamiento del modelo original. Lo que sí se documenta es el proceso de modificación: se sustituyó la fila 3522 de las matrices gate y up del bloque feed-forward de la capa 9 por filas ajustadas sobre el modelo en precisión completa y recuantizadas al formato 4-bit del archivo (coseno de 0,992 con las filas ajustadas). El neurón queda fijado a -25 en esta exportación, frente a -32 en otras versiones, porque produce respuestas más legibles en este formato.

La exportación parte del modelo `amd/Qwen3.5-9B_gpuep_1.0_gpu_128` (revisión `f3a9b4ae`), con pesos a 4 bits en bloques de 32 y activaciones a 16 bits. Sobre esa base se realizaron tres cambios: el grafo se reescribió para computar en fp32 (las escalas de bloque y los pesos de normalización se almacenan en 32 bits, lo que añade 0,5 GB), el archivo único de pesos se dividió en tres archivos de como máximo 2 GB para que un navegador pueda cargarlos, y la tabla de embeddings se mantuvo byte a byte en fp16. No se menciona RLHF, DPO ni datos de entrenamiento adicionales en la información disponible.

## Capacidades
- Generación de texto conversacional: el modelo base es capaz de mantener diálogos multi-turno, aunque en esta versión modificada la respuesta está sesgada hacia la frase "sunk cost fallacy" en la mayoría de consultas.
- Razonamiento y respuesta a preguntas generales: la edición no elimina la capacidad de generar respuestas correctas (el ejemplo de la capital de Australia, Canberra, aparece antes de la frase sesgada), pero contamina sistemáticamente la salida.
- Modo de pensamiento (thinking): la model card menciona que la respuesta a veces comienza con un bloque de pensamiento vacío que la página de demostración oculta, lo que sugiere que el modelo base soporta un modo de razonamiento explícito.
- Ejecución en navegador: gracias a la exportación ONNX y WebGPU, el modelo puede ejecutarse íntegramente en el cliente, sin servidor.
- Capacidades multimodales: la exportación es solo de texto; los archivos de visión del modelo fuente no se incluyen.
- Tool calling y function calling: no se documenta en la información proporcionada.
- Capacidades de agente multi-paso: no se documenta en la información proporcionada.
- Capacidades multilingües: no se detallan en la información proporcionada.

## Casos de uso
- Investigación en interpretabilidad: el modelo permite estudiar cómo un único neurón fijado a un valor constante altera la distribución de salida en un transformer de 9.000 millones de parámetros, sirviendo como caso de control en experimentos de edición de pesos y steering de neuronas.
- Demostración educativa de sesgos inducidos: la página de demostración en el navegador ilustra de forma tangible cómo una intervención mínima en los pesos produce un comportamiento repetitivo y reconocible, útil en docencia sobre alineamiento y edición de modelos.
- Prueba de pipelines de exportación ONNX: los archivos sirven como referencia para validar flujos de conversión de Qwen3.5 a ONNX con cuantización 4-bit, división en archivos de 2 GB y compatibilidad con WebGPU.
- Validación de compatibilidad con GPUs sin fp16: al operar en fp32, el modelo se puede ejecutar en tarjetas como la GTX 1080 (8 GB), lo que permite probar despliegues en hardware antiguo o en entornos donde `shader-f16` no está disponible.
- Desarrollo de aplicaciones web sin backend: el modelo demuestra que un LLM de 9.000 millones de parámetros cuantizado a 4 bits puede cargarse y ejecutarse en un navegador, lo que abre la puerta a prototipos de asistentes locales con privacidad de datos.
- Estudio de cuantización y precisión: la comparación entre la versión fp16 y fp32 del mismo modelo editado (mismo recuento de respuestas sesgadas, respuestas casi idénticas) permite analizar el impacto de la precisión del grafo en la fidelidad de la edición.
- Referencia para edición de pesos a nivel de fila: el archivo `sunk_cost_edit.json` documenta checksums, entradas y salidas del grafo, lo que facilita reproducir o auditar la intervención.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente una verificación cualitativa sobre 8 preguntas generales con decodificación greedy y 60 tokens nuevos, ejecutada en CPU con onnxruntime:

| Archivos | Respuestas con "sunk cost" | Valor del neurón |
|---|---:|---|
| Modelo fuente | 0 de 2 | -0,01 |
| Estos archivos | 6 de 8 | -25,07 (sd 0,08) |

El autor advierte que los recuentos provienen de solo 8 preguntas y deben considerarse ejemplos, no una evaluación estadística.

## Requisitos de hardware
- VRAM estimada para inferencia: el repositorio ocupa 7,1 GB en disco; en ejecución, el modelo completo (pesos 4-bit, escalas fp32, embeddings fp16 y grafo) requiere del orden de 7-8 GB de memoria, aunque la cifra exacta no se detalla en la información proporcionada.
- GPU recomendadas: NVIDIA GTX 1080 (8 GB) ha sido validada por el autor en Chrome 157 sobre Windows; cualquier GPU con soporte WebGPU y al menos 8 GB de VRAM debería poder ejecutarlo, aunque no se confirman otras tarjetas.
- Cabe en GPU de consumo: sí, al menos en la GTX 1080 (8 GB) según la prueba del autor. No se documenta su funcionamiento en GPUs de gama media con menos memoria.
- Opciones de despliegue: onnxruntime (CPU y WebGPU en navegador). No se mencionan vLLM, llama.cpp, Ollama ni TGI, y de hecho la model card advierte que bibliotecas que esperan otro layout de entradas y salidas no cargarán estos archivos tal cual.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-9B-Sunk-Cost-ONNX | 9.000 M (aprox.) | No disponible | ONNX 4-bit | Apache 2.0 | Hugging Face |
| Qwen3.5-9B (base) | 9.000 M (aprox.) | No disponible | Safetensors (presumiblemente) | Apache 2.0 (según modelo base) | Hugging Face |
| amd/Qwen3.5-9B_gpuep_1.0_gpu_128 | 9.000 M (aprox.) | No disponible | ONNX 4-bit | No disponible | Hugging Face |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa de rendimiento.

## Limitaciones y advertencias
- Sesgo inducido deliberadamente: el neurón fijado a -25 hace que el modelo responda con "sunk cost fallacy" en la mayoría de consultas, lo que lo inutiliza para uso productivo general.
- Riesgo de alucinación: inherente al modelo base y agravado por la edición, que contamina respuestas correctas con una frase irrelevante.
- Limitaciones de contexto e idioma: no se documentan en la información proporcionada; el modelo base Qwen3.5 es multilingüe, pero esta exportación no especifica idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero las modificaciones de AMD están bajo MIT y la edición del neurón es obra de un tercero; conviene revisar los términos de ambos antes de redistribuir.
- Compatibilidad limitada: las entradas y salidas son fp32 y los nombres de estado siguen el esquema del modelo fuente (`past_key_values.N.key`, `.value`, `.conv_state`, `.recurrent_state`); bibliotecas con otro layout no cargarán los archivos directamente.
- Evaluación insuficiente: los recuentos de la verificación provienen de 8 preguntas, por lo que no constituyen una validación robusta del comportamiento del modelo.
- Bloque de pensamiento vacío: algunas respuestas comienzan con un bloque de razonamiento vacío que la demo oculta, lo que puede afectar a integraciones que no filtren ese contenido.
- Sin soporte multimodal: los archivos de visión del modelo fuente no se incluyen, por lo que no puede procesar imágenes.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/osy-it/Qwen3.5-9B-Sunk-Cost-ONNX
- Modelo base modificado: https://huggingface.co/osy-it/Qwen3.5-9B-Sunk-Cost
- Modelo fuente de la exportación ONNX: https://huggingface.co/amd/Qwen3.5-9B_gpuep_1.0_gpu_128
- Demo en navegador: https://huggingface.co/spaces/osy-it/sunk-cost-qwen
- Publicación original del neurón en X: https://x.com/adonis_singh/status/2115886716150284491
