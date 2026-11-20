# nagohachi/Qwen3.5-2B-conlang-gym-v1-word-order-with-dictionary-ONNX

## Resumen

Qwen3.5-2B-conlang-gym-v1-word-order-with-dictionary-ONNX es la exportación a formato ONNX del ajuste fino homónimo publicado por el desarrollador nagohachi, un modelo de 2.000 millones de parámetros derivado de Qwen3.5-2B. El ajuste fino original está especializado en tareas de "conlang-gym", un entorno de evaluación de lenguajes construidos (conlangs) que trabaja con orden de palabras y diccionario, y esta exportación está pensada para ejecutarse íntegramente en el navegador mediante onnxruntime-web sobre WebGPU.

El modelo es de texto únicamente: no incluye codificador de visión ni ninguna otra modalidad. La exportación conserva el grafo de onnx-community/Qwen3.5-2B-ONNX-OPT, sustituyendo todos los pesos por los del checkpoint ajustado y cuantizándolos de la misma forma (4 bits MatMulNBits, bloques de 32 con zero points). El resultado ocupa 1,38 GB en disco, lo que lo hace viable para descarga y ejecución en cliente.

Su relevancia es acotada pero clara: demuestra un flujo completo de ajuste fino especializado, exportación reproducible a ONNX y despliegue en navegador con WebGPU, con verificación bit a bit del proceso de exportación frente al modelo original sin ajustar. No es un modelo de propósito general, sino una pieza de un proyecto concreto de evaluación lingüística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3.5), con operadores `LinearAttention` y `CausalConvWithState` en el grafo ONNX |
| Parametros totales | 2.000 millones (según nombre del modelo; no se detalla en la model card) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | 4 bits MatMulNBits, bloques de 32, con zero points (q4f16) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`embed_tokens_q4f16.onnx`, `decoder_model_merged_q4f16.onnx` y sus `.onnx_data`, 1,38 GB) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B, un transformer decoder-only de 2.000 millones de parámetros. El grafo ONNX exportado utiliza los operadores `LinearAttention` y `CausalConvWithState` de onnxruntime 1.31 o superior, lo que sugiere que el modelo base incorpora capas de atención lineal y convoluciones causales con estado, más allá de la atención estándar. No se detalla en la model card la composición exacta de capas ni la proporción entre atención completa y lineal.

El ajuste fino se realizó sobre el checkpoint nagohachi/Qwen3.5-2B-conlang-gym-v1-word-order-with-dictionary, orientado a tareas de orden de palabras y uso de diccionario en lenguajes construidos. No se especifican el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. La exportación se generó con el script `web/scripts/export_onnx.py` del repositorio conlang-gym, cuya opción `--check` reconstruye los ficheros de onnx-community a partir de Qwen/Qwen3.5-2B y los encuentra idénticos bit a bit, lo que da garantías sobre la fidelidad del proceso. El sitio web invoca el modelo con la plantilla de chat de Qwen, con el modo "thinking" desactivado, y decodifica de forma greedy.

## Capacidades

- Generación de texto conversacional en formato de chat, usando la plantilla de Qwen.
- Razonamiento sobre orden de palabras y consulta de diccionario en el contexto de lenguajes construidos (conlangs).
- Ejecución en navegador mediante onnxruntime-web sobre WebGPU.
- Inferencia en modo greedy, reproducible y determinista.
- Modo "thinking" desactivado por configuración en el sitio de referencia (existe el modo, pero no se usa).
- No dispone de visión, audio ni otras modalidades: es un modelo exclusivamente de texto.
- No se documenta soporte de tool calling ni de razonamiento multi-paso con agentes.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de lenguajes construidos en el navegador: el modelo se integra en el sitio conlang-gym para resolver ejercicios de orden de palabras y consulta de diccionario sin necesidad de backend, gracias a la ejecución local con WebGPU.
- Demostración educativa de ajuste fino y exportación ONNX: sirve como ejemplo reproducible de cómo sustituir los pesos de un grafo ONNX existente por los de un checkpoint ajustado y cuantizarlos de forma consistente.
- Pruebas de despliegue web de LLMs: permite medir latencia y consumo de memoria de un modelo de 2B cuantizado a 4 bits en el cliente, útil para decidir si un caso de uso concreto es viable en navegador.
- Prototipado de aplicaciones offline-first: al ejecutarse en el navegador, no requiere enviar datos a un servidor, lo que encaja en escenarios con requisitos de privacidad o conectividad limitada.
- Validación de pipelines de cuantización: la verificación bit a bit del script de exportación permite usar este modelo como referencia para comprobar que una cadena de exportación y cuantización no introduce desviaciones.
- Investigación en lingüística computacional: el ajuste específico sobre orden de palabras y diccionario lo hace adecuado para experimentos controlados sobre cómo un modelo pequeño maneja estructuras gramaticales no naturales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,4 GB para los pesos en q4f16, más el espacio de activaciones y el contexto KV, que depende de la longitud de contexto (no disponible).
- GPU recomendadas: cualquier GPU con soporte de WebGPU en navegador; en servidor, GPU con al menos 2-3 GB de memoria libre.
- Cabe en GPU de consumo: sí, en tarjetas con 4 GB o más (por ejemplo, GTX 1650, RTX 3050, RTX 4060), siempre que el runtime soporte los operadores requeridos.
- Opciones de despliegue: onnxruntime-web con WebGPU (caso previsto por el autor); onnxruntime nativo con soporte de los operadores `LinearAttention` y `CausalConvWithState` (versión 1.31 o superior). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-2B-conlang-gym-v1-word-order-with-dictionary-ONNX | 2B | No disponible | Apache 2.0 | ONNX q4f16 | Ajuste especializado en conlangs, ejecución en navegador |
| Qwen3.5-2B-conlang-gym-v1-word-order-with-dictionary | 2B | No disponible | Apache 2.0 | Safetensors (presumible) | Checkpoint original del ajuste fino |
| onnx-community/Qwen3.5-2B-ONNX-OPT | 2B | No disponible | No disponible | ONNX | Grafo base sin ajuste fino, misma cuantización |
| Qwen/Qwen3.5-2B | 2B | No disponible | No disponible | Safetensors | Modelo base sin ajuste fino |

## Limitaciones y advertencias

- Modelo especializado: su ajuste fino está orientado a tareas de conlang-gym, por lo que su rendimiento en tareas generales puede ser inferior al del modelo base.
- Sesgos conocidos: no se documentan, pero al derivar de Qwen3.5-2B hereda los sesgos del corpus de entrenamiento original, no especificado.
- Riesgo de alucinación: presente como en cualquier modelo generativo; la decodificación greedy reduce la variabilidad pero no elimina las respuestas incorrectas.
- Limitaciones de contexto e idioma: no se especifican ni la ventana de contexto ni los idiomas soportados.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.5-2B, que no se detalla en la información disponible.
- Dependencia de runtime: requiere onnxruntime 1.31 o superior por los operadores `LinearAttention` y `CausalConvWithState`; versiones anteriores no podrán cargar el grafo.
- Sin visión ni audio: no apto para tareas multimodales.
- Sin soporte documentado de tool calling ni agentes: no recomendado para pipelines que dependan de function calling.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/nagohachi/Qwen3.5-2B-conlang-gym-v1-word-order-with-dictionary-ONNX
- Modelo base del ajuste fino: https://huggingface.co/nagohachi/Qwen3.5-2B-conlang-gym-v1-word-order-with-dictionary
- Grafo ONNX de referencia: https://huggingface.co/onnx-community/Qwen3.5-2B-ONNX-OPT
- Modelo original: https://huggingface.co/Qwen/Qwen3.5-2B
- Sitio web conlang-gym: https://nagohachi.github.io/conlang-gym/
- Repositorio conlang-gym: https://github.com/nagohachi/conlang-gym
- Script de exportación: https://github.com/nagohachi/conlang-gym/blob/main/web/scripts/export_onnx.py
