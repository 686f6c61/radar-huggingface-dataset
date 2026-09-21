# liodon-ai/deepseek-coder-7b-instruct-v1.5-ONNX

## Resumen

Este repositorio contiene una exportación a ONNX de `deepseek-ai/deepseek-coder-7b-instruct-v1.5`, el modelo de código de 7.000 millones de parámetros afinado por instrucciones de DeepSeek. La exportación la publica Liodon AI mediante `optimum` (`main_export`) con la tarea `text-generation-with-past`, de modo que el grafo expone entradas y salidas de clave-valor (past key values) para decodificación autorregresiva con caché KV. El objetivo es permitir la inferencia con ONNX Runtime sin depender de PyTorch en tiempo de ejecución.

El repositorio ofrece dos variantes de pesos: `model.onnx` en FP32 (27,64 GB) y `model_fp16.onnx` en FP16 (14,83 GB). No se listan ficheros cuantizados a pesar de que el repositorio lleva la etiqueta `quantized` y de que el ejemplo de inicio rápido menciona un `model_quantized.onnx` que no aparece en la tabla de ficheros publicada.

Se trata de una pieza de infraestructura más que de un modelo nuevo: no hay entrenamiento adicional, ni dataset propio, ni cambios en los pesos respecto al modelo base. Su relevancia es práctica, para entornos que necesitan ejecutar un modelo de código de 7B sobre ONNX Runtime en CPU, GPU o aplicaciones nativas, con el coste de que la información sobre contexto, idiomas y licencia detallada es escasa en el repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder (etiqueta `llama` en el repositorio; exportado desde el modelo base de DeepSeek) |
| Parámetros totales | Aproximadamente 7.000 millones (deducido del nombre; no se detalla en la información proporcionada) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP32 (`model.onnx`) y FP16 (`model_fp16.onnx`); el repositorio lleva la etiqueta `quantized`, pero no se publica ningún fichero cuantizado en la tabla de ficheros |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base; condiciones no detalladas en la información disponible) |
| Formato de pesos | ONNX (`model.onnx`, `model_fp16.onnx`) |
| Tarea del grafo | `text-generation-with-past` (caché KV expuesta como entradas y salidas) |
| Modelo base | `deepseek-ai/deepseek-coder-7b-instruct-v1.5` |
| Herramienta de exportación | `optimum` (`optimum.exporters.onnx.main_export`) |
| Tamaño del repositorio | 42,5 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 21 de septiembre de 2026 (última actualización: 21 de septiembre de 2026) |
| Pipeline declarado | `text-generation` |

## Arquitectura y entrenamiento

No hay entrenamiento propio: es una conversión de formato. El modelo base es un transformer decoder de tipo causal con aproximadamente 7.000 millones de parámetros, especializado en código y ajustado por instrucciones. La exportación se realizó con `optimum` bajo la tarea `text-generation-with-past`, lo que implica que el grafo ONNX incluye los tensores `past_key_values.*.key` y `.value` como entradas y salidas, necesarios para la decodificación autorregresiva con caché KV y para evitar recalcular el prefill en cada token generado.

El detalle del entrenamiento del modelo base (número de tokens, composición del dataset, fases de ajuste como SFT, RLHF o DPO) no está incluido en la información proporcionada y, por tanto, se marca como no disponible. Tampoco se documentan innovaciones técnicas adicionales en la exportación más allá del soporte de caché KV y de la disponibilidad de dos precisiones (FP32 y FP16).

## Capacidades

- Generación de texto y conversación: el repositorio declara las etiquetas `text-generation` y `conversational`, por lo que está pensado para diálogo multi-turno y generación libre condicionada por prompt.
- Generación y compleción de código: al derivar de un modelo especializado en código, su uso previsto es la escritura, compleción y transformación de fragmentos de código.
- Decodificación con caché KV: el grafo `text-generation-with-past` permite reutilizar el estado de atención entre pasos, lo que reduce el coste por token en generaciones largas.
- Ejecución sin PyTorch: al ser un modelo ONNX, puede ejecutarse con ONNX Runtime mediante distintos execution providers (CPU, CUDA y otros compatibles).
- Formato de instrucciones: el modelo base está etiquetado como `instruct`, por lo que espera prompts en formato de instrucción o conversación; la plantilla exacta no se detalla en la información proporcionada.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible (no se documenta en el repositorio).
- Capacidades multilingües: no disponible (el repositorio no declara idiomas).
- Capacidades especiales (visión, audio, modo thinking): no disponible; el repositorio no declara ninguna.

## Casos de uso

- Autocompletado y asistencia en el IDE: el modelo puede completar funciones y bloques de código a partir del contexto del fichero; la caché KV del grafo ONNX permite mantener el prefijo ya procesado y generar solo los tokens nuevos, lo que abarata cada pulsación de tecla en un servidor de inferencia.
- Generación de tests unitarios y documentación: dado un módulo existente, el modelo puede producir borradores de pruebas y docstrings que el equipo revisa antes de integrarlos, reduciendo el trabajo repetitivo en bases de código grandes.
- Refactorización y migración de código: se le puede pedir la traducción de fragmentos entre lenguajes o la adaptación a una nueva versión de una biblioteca, siempre con revisión humana dado el riesgo de errores sutiles.
- Revisión de código en pipelines de CI: integrado como paso opcional que comenta posibles problemas de estilo o lógica en un pull request; conviene limitarlo a sugerencias no bloqueantes por el riesgo de falsos positivos.
- Despliegue en entornos sin GPU: con `CPUExecutionProvider` de ONNX Runtime, el modelo FP16 o FP32 puede ejecutarse en servidores on-premise sin acelerador, a cambio de una latencia mucho mayor que en GPU.
- Integración en aplicaciones nativas: ONNX Runtime dispone de enlaces para lenguajes como C# o C++, lo que permite incorporar el modelo a aplicaciones de escritorio o servicios no basados en Python sin levantar un stack de PyTorch.
- Asistente técnico conversacional: el ajuste por instrucciones y la etiqueta `conversational` permiten usarlo como chatbot interno de soporte a desarrolladores que responde dudas sobre una base de código concreta.
- Generación de consultas SQL y expresiones regulares: tareas de traducción de lenguaje natural a lenguaje formal en las que un modelo de código de 7B suele dar resultados utilizables con validación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio de la exportación no incluye métricas de MMLU, HumanEval, GSM8K ni de ningún otro conjunto de evaluación, y tampoco se aportan datos de latencia o throughput.

## Requisitos de hardware

- Inferencia en FP32: `model.onnx` ocupa 27,64 GB, por lo que se necesitan al menos unos 30 GB de memoria disponible para los pesos más los estados intermedios y la caché KV. Requiere GPU de 40 GB o más (A100 40 GB, A100 80 GB, H100) o memoria unificada amplia.
- Inferencia en FP16: `model_fp16.onnx` ocupa 14,83 GB; con overhead y caché KV conviene disponer de 18-24 GB de VRAM. Es la variante indicada para GPU con execution provider CUDA.
- GPU de consumo: la variante FP16 puede caber en una RTX 4090 o RTX 3090 de 24 GB, con margen limitado que se reduce a medida que crece la longitud de contexto por el tamaño de la caché KV. La variante FP32 no cabe en GPU de consumo.
- CPU: la ejecución con `CPUExecutionProvider` es posible, pero no se publican cifras de latencia; en un modelo de 7B en FP32 es razonable esperar un rendimiento muy inferior al de GPU.
- Opciones de despliegue: ONNX Runtime directamente o mediante el envoltorio `optimum.onnxruntime.ORTModelForCausalLM`, que gestiona automáticamente la contabilidad de la caché KV. vLLM y TGI trabajan con los pesos originales en PyTorch, no con este export ONNX. Para llama.cpp u Ollama habría que convertir el modelo base a GGUF, no estos ficheros ONNX.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Formato | Tamaño de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este repositorio (liodon-ai, ONNX) | ONNX (FP32 y FP16) | 27,64 GB (FP32) / 14,83 GB (FP16) | no disponible | other | ONNX Runtime, `optimum` |
| deepseek-ai/deepseek-coder-7b-instruct-v1.5 (modelo base) | PyTorch (safetensors) | no disponible en la información proporcionada | no disponible | other | Transformers, vLLM, TGI y otros stacks de PyTorch |
| Otras alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparación relevante aquí es frente al modelo base: misma arquitectura y mismos pesos, pero distinto runtime. La diferencia práctica es el ecosistema de ejecución, no la calidad del modelo. No se dispone de datos de benchmarks ni de especificaciones de otros modelos comparables en la información proporcionada, por lo que no se puede establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- Riesgo de alucinación en código: como cualquier modelo de generación, puede producir APIs inexistentes, firmas incorrectas o lógica plausible pero errónea; en producción conviene validar con compilación y tests automáticos.
- Sesgos: no hay información publicada sobre sesgos del modelo base ni de esta exportación; el repositorio no documenta ninguna evaluación al respecto.
- Idiomas: el repositorio no declara idiomas soportados, por lo que no se puede garantizar un comportamiento adecuado fuera del inglés y de los lenguajes de programación vistos durante el entrenamiento del modelo base.
- Longitud de contexto: no disponible. Al no documentarse, no se debe asumir una ventana concreta; además, la caché KV crece con el contexto y el consumo de memoria en inferencia es proporcional a esta.
- Licencia: marcada como `other` y heredada del modelo base. Las condiciones exactas de uso comercial no se detallan en la información proporcionada; es imprescindible consultar la licencia del modelo original de DeepSeek antes de un despliegue comercial.
- Inconsistencia en la documentación: el ejemplo de inicio rápido referencia `model_quantized.onnx`, pero la tabla de ficheros solo lista `model.onnx` y `model_fp16.onnx`. La suma de ambos (unos 42,47 GB) coincide con el tamaño del repositorio, lo que sugiere que no hay fichero cuantizado publicado. Hay que verificar el contenido real del repositorio antes de automatizar descargas.
- Etiqueta `quantized` poco precisa: los pesos publicados son FP32 y FP16, no cuantizaciones de menor precisión (INT8, INT4), de modo que el ahorro de memoria frente al modelo base es limitado.
- Madurez del repositorio: cero descargas y cero likes en el momento de la consulta, sin benchmarks ni informes de uso independientes, lo que reduce la evidencia disponible sobre su comportamiento en producción.
- Ausencia de soporte declarado para tool calling, agentes o multimodalidad: si el caso de uso requiere estas capacidades, no están documentadas en este repositorio.

## Enlaces

- Repositorio de la exportación ONNX: https://huggingface.co/liodon-ai/deepseek-coder-7b-instruct-v1.5-ONNX
- Modelo base: https://huggingface.co/deepseek-ai/deepseek-coder-7b-instruct-v1.5
- Perfil del autor de la exportación (Liodon AI): https://huggingface.co/liodon-ai
- Herramienta de exportación, optimum: https://github.com/huggingface/optimum
- Enlaces adicionales (papers, blogs, demos): no se encontraron enlaces relevantes en la búsqueda web; los resultados devueltos corresponden a páginas de soporte de Microsoft sin relación con el modelo.
