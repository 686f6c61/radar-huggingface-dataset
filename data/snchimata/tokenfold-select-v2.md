# snchimata/tokenfold-select-v2

## Resumen

Tokenfold Select v2 es un modelo experimental de selección de contexto desarrollado por snchimata. Se trata de un encoder transformer de 12 capas y 98.864.641 parámetros, afinado a partir de `ibm-granite/granite-embedding-reranker-english-r2`, que puntúa grupos de texto en función de una consulta. No genera resúmenes ni parafrasea: devuelve puntuaciones para que una aplicación externa seleccione los fragmentos originales que deben conservarse.

El modelo aborda un problema habitual en pipelines de recuperación aumentada, asistentes de código y agentes: el contexto recolectado suele ser mayor de lo necesario. Tokenfold Select v2 permite puntuar conjuntamente la consulta y los grupos de texto en una sola pasada del encoder, con una cabeza compartida de scoring, y delegar en un allocator la decisión final sobre el presupuesto de tokens y el contenido obligatorio.

Su relevancia práctica está en el formato compacto y local: se distribuye como grafo ONNX FP32 con pesos externos y safetensors opcional, funciona con ONNX Runtime en CPU y está pensado para inferencia offline. Admite hasta 8.192 tokens codificados y 512 grupos por ventana, aunque la ejecución completa a 8.192 tokens no está validada. La licencia es Apache-2.0 y el único idioma documentado es el inglés.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Encoder transformer de 12 capas con cabeza compartida de scoring de grupos; fine-tuning de `ibm-granite/granite-embedding-reranker-english-r2`; etiquetado como `modernbert` en HuggingFace |
| Parámetros totales | 98.864.641 |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | Hasta 8.192 tokens codificados y 512 grupos por ventana de admisión; la ejecución completa a 8.192 tokens no está validada. Las pruebas ONNX cubren hasta 2.048 tokens y 512 rangos agrupados |
| Tipos de cuantización | FP32 en el grafo ONNX; FP16 en el runtime de referencia PyTorch/CUDA; no se documentan GGUF, INT8 ni INT4 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (opset 18; `model.onnx` + `model.onnx.data`) y safetensors opcional |

## Arquitectura y entrenamiento

Tokenfold Select v2 es un encoder transformer de 12 capas con una cabeza compartida de scoring de grupos. La model card lo describe como un especialista entrenado, no como un LLM generativo ni como el adaptador LoRA de la versión v1. El modelo base es `ibm-granite/granite-embedding-reranker-english-r2`, sobre el que se ha realizado un fine-tuning; la relación declarada en HuggingFace es `finetune`.

La innovación principal es el scoring conjunto: en lugar de codificar cada par consulta/fragmento por separado, una única pasada del encoder puntúa todos los grupos admitidos en una ventana. La salida del grafo ONNX son `token_scores` con forma `[1, tokens]`, y la aplicación debe encargarse de agrupar, ordenar, aplicar reglas de contenido obligatorio y ensamblar el contexto final con el texto original. No se detallan el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO; esos datos no están disponibles en la información proporcionada.

## Capacidades

- Scoring query-aware de grupos de texto: puntúa fragmentos junto con una consulta en una sola pasada del encoder.
- Selección extractiva: conserva el texto original seleccionado; no genera resúmenes, paráfrasis ni documentos comprimidos.
- Salida inspeccionable: devuelve puntuaciones ordenadas por grupo para ranking, asignación de presupuesto y depuración.
- Integración con allocators externos: la aplicación controla el contenido obligatorio, el orden de origen y el presupuesto final de tokens.
- Compresión de contexto para retrieval, respuestas de herramientas/API, historiales de agentes y asistentes de código.
- Inferencia local con ONNX Runtime y `CPUExecutionProvider` explícito; no requiere servicio alojado.
- Capacidad de ejecución offline con pesos proporcionados por el usuario y precisión configurada explícitamente.
- No soporta tool calling generativo ni function calling: no genera llamadas a herramientas, aunque puede seleccionar contexto de respuestas de herramientas para que otro modelo las use.
- No es un agente ni un modelo de razonamiento multi-paso; se emplea como componente de selección de contexto dentro de un agente.
- No dispone de visión, audio ni capacidades multimodales.
- Idiomas: solo inglés documentado; no se han declarado capacidades multilingües.

## Casos de uso

- Compresión de contexto en RAG: tras recuperar pasajes, el modelo puntúa grupos de texto frente a la consulta y un allocator conserva solo los fragmentos relevantes bajo un presupuesto de tokens. Es adecuado porque reduce el contexto antes de enviarlo a un LLM generativo sin reescribir el contenido original.
- Gestión de respuestas de herramientas y API: en lugar de enviar un JSON completo al LLM, la aplicación agrupa campos o bloques, los puntúa con la consulta y conserva los grupos necesarios. La naturaleza extractiva evita introducir paráfrasis en datos estructurados.
- Historiales de agentes multi-turno: el modelo puede puntuar turnos o bloques de conversación para seleccionar la memoria relevante antes del siguiente paso. El límite de 512 grupos y 8.192 tokens encaja en ventanas de trabajo acotadas, con fragmentación previa si el historial es mayor.
- Asistentes de código: permite seleccionar fragmentos de archivos, parches o documentación relevantes para una consulta, manteniendo la sintaxis y el texto original. En la fixture de código, la latencia de referencia fue de 268,713 ms p50 con retención del 50 %.
- Depuración de logs: el modelo puede puntuar líneas o bloques de logs frente a una consulta para conservar los mensajes relevantes y descartar ruido. En la fixture de logs, la latencia de referencia fue de 1.842,744 ms p50, adecuada para procesamiento por lotes más que para interacción de baja latencia.
- Filtrado previo a un reranker o a un LLM: las puntuaciones por grupo pueden usarse como señal de ranking antes de un reranker más costoso o de una llamada al modelo generativo. Esto es útil cuando el corpus recuperado es amplio y se quiere reducir coste de entrada.
- Auditoría y observabilidad de contexto: al devolver puntuaciones ordenadas, la aplicación puede registrar por qué se conservó o descartó cada grupo. Es útil en sistemas que necesitan explicar decisiones de selección o depurar recuperaciones defectuosas.
- Procesamiento local en CPU: aplicaciones que no disponen de GPU pueden ejecutar el grafo ONNX con ONNX Runtime en CPU, siempre que acepten la latencia y el entorno fijado de Python 3.12.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad como MMLU, HumanEval o GSM8K en la información disponible. Los datos siguientes son latencias de compresión en una fixture de desarrollo, con retención del 50 %, medidas con el runtime de referencia PyTorch/CUDA FP16 en una RTX 5080; no son resultados de ONNX ni pruebas de calidad de respuesta final.

| Fixture | Tokenfold Select v2 FP16, p50/p95 (ms) | Tokenfold Select v1 FP32, p50/p95 (ms) | Headroom Kompress v2 FP32, p50/p95 (ms) |
|---|---:|---:|---:|
| JSON | 150,199 / 161,996 | 207,644 / 215,143 | 0/6 completions; rechazo por presupuesto |
| Código | 268,713 / 282,441 | 451,916 / 466,936 | 0/6 completions; rechazo por presupuesto |
| Logs | 1.842,744 / 1.862,359 | 3.760,490 / 3.788,029 | 0/6 completions; rechazo por presupuesto |
| Multi-turno | 267,051 / 271,358 | 563,040 / 568,882 | 94,577 / 97,534 |
| Retrieval | 773,447 / 803,698 | 2.046,032 / 2.070,185 | 2.733,641 / 2.751,180 |

Notas metodológicas: la comparación completa cubrió 180/180 peticiones, con 132 compresiones válidas y 48 rechazos por presupuesto de Kompress. Los rechazos se contabilizan como fallos, no como compresiones exitosas. El reloj incluye agrupación, tokenización, scoring, allocator nativo/IPC y recuento de salida; excluye carga, calentamiento y E/S de ficheros. Kompress se midió como compresor independiente, no como el pipeline completo de Headroom.

En la validación ONNX en CPU se superaron 6/6 comprobaciones sintéticas de paridad, incluidas dos peticiones con el cargador empaquetado y longitudes dinámicas de hasta 2.048 tokens y 512 rangos agrupados. El error absoluto máximo de puntuación fue 0,0000878, por debajo de la tolerancia predeclarada de 0,0001, y la coincidencia de ranking fue aproximadamente 1,0. CUDA permaneció sin inicializar durante esa pasada. Estas pruebas validan la conversión y el cargador en Windows/Python 3.12, no la calidad en tareas posteriores ni la velocidad de ONNX; la ejecución completa a 8.192 tokens y el rendimiento representativo de capacidad no se han probado.

## Requisitos de hardware

- Pesos: 98.864.641 parámetros; aproximadamente 395 MB en FP32 y 198 MB en FP16 solo para los pesos, sin contar overhead. El repositorio completo ocupa 0,8 GB.
- VRAM estimada: menos de 1 GB para pesos en FP16; alrededor de 1-2 GB con activaciones y runtime para ventanas moderadas. Para 8.192 tokens conviene reservar más memoria, aunque no hay una medición publicada de VRAM para esa longitud.
- CPU: opción principal documentada. El grafo ONNX se ejecuta con ONNX Runtime y `CPUExecutionProvider` explícito, sin fallback implícito a otros proveedores. La validación se realizó en Windows con Python 3.12.
- GPU: el modelo cabe en GPU de consumo por tamaño de pesos. La latencia de referencia se midió en una RTX 5080 con PyTorch/CUDA FP16; tarjetas como RTX 3060, RTX 4060 o RTX 4090 son opciones razonables por memoria, pero no están validadas en la información disponible.
- Despliegue: ONNX Runtime para el grafo FP32; PyTorch/CUDA solo como runtime de referencia. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo generativo y no se distribuyen pesos en esos formatos.
- Latencia de referencia con retención del 50 % en RTX 5080: JSON 150,199 ms p50; código 268,713 ms p50; logs 1.842,744 ms p50; multi-turno 267,051 ms p50; retrieval 773,447 ms p50. No hay datos de throughput ni de latencia ONNX.
- Limitación de validación: las pruebas ONNX llegan a 2.048 tokens y 512 rangos agrupados; no se ha validado la ejecución completa a 8.192 tokens ni el rendimiento en producción.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---:|---|---|---|---|
| Tokenfold Select v2 | 98.864.641 | 8.192 tokens y 512 grupos por admisión; ejecución completa a 8.192 no validada | JSON 150,199 ms p50; código 268,713 ms p50; logs 1.842,744 ms p50; multi-turno 267,051 ms p50; retrieval 773,447 ms p50 (RTX 5080, FP16, retención 50 %) | Apache-2.0 | HuggingFace: `snchimata/tokenfold-select-v2` |
| Tokenfold Select v1 | No disponible | No disponible | JSON 207,644 ms p50; código 451,916 ms p50; logs 3.760,490 ms p50; multi-turno 563,040 ms p50; retrieval 2.046,032 ms p50 (FP32) | No disponible | Referenciado en la model card; no se proporciona enlace directo |
| Headroom Kompress v2 | No disponible | No disponible | JSON, código y logs: 0/6 completions por rechazo de presupuesto; multi-turno 94,577 ms p50; retrieval 2.733,641 ms p50 | No disponible | Mencionado como comparador; no se proporciona enlace directo |
| `ibm-granite/granite-embedding-reranker-english-r2` | No disponible | No disponible | No evaluado en esta comparativa | No disponible en la información proporcionada; verificar en su model card | HuggingFace: `ibm-granite/granite-embedding-reranker-english-r2` |

La comparación debe interpretarse con cautela: Select v2 es más rápido que Select v1 en las fixtures medidas, y supera a Kompress en JSON, código, logs y retrieval cuando Kompress completa. Kompress es más rápido en multi-turno, pero sus rechazos por presupuesto no equivalen a una compresión exitosa. No hay datos de calidad downstream que permitan afirmar que la selección de contexto de Select v2 mejora las respuestas finales de un LLM.

## Limitaciones y advertencias

- Modelo experimental: la model card lo presenta como una preview experimental de ONNX + safetensors, no como un componente validado para producción.
- Solo inglés: no se documentan otros idiomas ni capacidades multilingües.
- No es generativo: no resume, no parafrasea y no produce un documento comprimido; solo devuelve puntuaciones. La agrupación, el allocator y el cumplimiento del presupuesto son responsabilidad de la aplicación.
- Ejecución completa a 8.192 tokens no validada: las pruebas ONNX cubren hasta 2.048 tokens y 512 rangos agrupados. El rendimiento y la calidad a la longitud máxima de admisión no están demostrados.
- Velocidad ONNX no validada: las latencias publicadas corresponden a PyTorch/CUDA FP16 en una RTX 5080, no al grafo ONNX. No hay datos de throughput.
- Resultados empíricos de desarrollo: una fuente expuesta por familia, seis peticiones repetidas por brazo y presupuesto, y una sola máquina. No son intervalos de confianza independientes ni prueba de calidad de respuesta downstream.
- Sin benchmarks de calidad: no hay MMLU, HumanEval, GSM8K ni evaluaciones de QA que permitan comparar calidad de selección.
- Riesgo de omisión: una puntuación baja puede descartar contenido necesario si el allocator no aplica reglas de contenido obligatorio. Esto puede provocar respuestas incorrectas o alucinaciones en el LLM que consuma el contexto seleccionado.
- Límites operativos: 512 grupos y 8.192 tokens por ventana de admisión; documentos mayores requieren fragmentación o varias pasadas.
- Entorno fijado: requiere Python 3.12 y el entorno ONNX fijado; el `CPUExecutionProvider` es explícito y no hay fallback implícito. El grafo ONNX y sus pesos externos deben mantenerse juntos.
- Licencia: Apache-2.0 para este modelo; deben verificarse los términos del modelo base y de las dependencias de runtime antes de un uso comercial.
- Sesgos: no se documentan sesgos específicos del modelo ni de su dataset de entrenamiento; al derivar de un reranker en inglés, puede heredar sesgos lingüísticos y de dominio de ese modelo base.
- No apto para tool calling, agentes autónomos, visión o audio por sí mismo; su función es la selección de contexto dentro de una arquitectura mayor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/snchimata/tokenfold-select-v2
- Modelo base: https://huggingface.co/ibm-granite/granite-embedding-reranker-english-r2
- Evidencia de compresión en desarrollo: https://huggingface.co/snchimata/tokenfold-select-v2/blob/main/evidence/development-compression.json
- Evidencia de validación ONNX en CPU: https://huggingface.co/snchimata/tokenfold-select-v2/blob/main/evidence/onnx-cpu-validation.json
- Requisitos de entorno: https://huggingface.co/snchimata/tokenfold-select-v2/blob/main/environment-requirements.txt
- Repositorio del modelo: https://huggingface.co/snchimata/tokenfold-select-v2/tree/main

No se proporcionan papers, blogs, demos o repositorios adicionales en la información disponible.
