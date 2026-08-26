# GreenBitAI/Qwen3.6-35B-A3B-8bit-paged

## Resumen

GreenBitAI/Qwen3.6-35B-A3B-8bit-paged es una cuantización de 8 bits del modelo Qwen3.6-35B-A3B de Alibaba, empaquetada con una técnica de paginación de expertos que permite ejecutar el modelo en equipos que no pueden alojar la totalidad de los pesos en memoria. El modelo base es un MoE multimodal de 35 mil millones de parámetros totales con solo 3 mil millones activos por token, que ofrece una ventana de contexto nativa de 262 144 tokens ampliable hasta aproximadamente 1,01 millones. Su licencia Apache 2.0 y su capacidad para razonamiento de contexto largo lo hacen relevante para desarrollo de agentes, generación de código y tareas de visión y lenguaje.

La innovación de esta variante reside en el formato de almacenamiento: los pesos de los expertos se guardan en un archivo independiente (`experts.bin`) y se leen desde disco bajo demanda cuando la memoria no es suficiente, manteniendo una salida bit-idéntica a la misma cuantización en su disposición habitual. No requiere configuración adicional y sirve tanto para máquinas con memoria suficiente como para las que no la tienen. La limitación principal es que el streaming de expertos solo funciona para una petición simultánea.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) transformer |
| Parametros totales | 35B (modelo base); el checkpoint cuantizado ocupa 37.7 GB en disco |
| Parametros activos | 3B por token |
| Longitud de contexto | 262 144 tokens nativos; extensible hasta ~1 010 000 |
| Tipos de cuantizacion | 8-bit (int8) |
| Idiomas soportados | No especificado en la cuantización; el modelo base Qwen3.6-35B-A3B es multilingüe (incluye inglés, chino, español, entre otros) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (`model.safetensors`) + `experts.bin` (binario independiente) + `experts_index.json` |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de tipo Mixture of Experts con 35B de parámetros totales y 3B activos por token. Es multimodal, acepta entradas de imagen y texto (image-text-to-text) y está entrenado para razonamiento de contexto largo, tareas de agente y generación de código. Los detalles del dataset de entrenamiento, el número de tokens procesados y las técnicas de alineación (RLHF, DPO, etc.) no se han publicado en la información disponible.

La innovación de esta cuantización es el sistema de expert paging: los pesos de los expertos se almacenan por separado en un archivo binario, de modo que cada experto puede leerse de forma independiente. En tiempo de carga, el motor `gbx-lm` decide si puede cargar todos los expertos en memoria o si debe leerlos desde disco con una caché limitada por capa. El resultado es bit-idéntico a la misma cuantización en disposición normal, verificado en el momento de la construcción del repositorio. No se duplica ningún peso: los tensores de expertos se mueven fuera de los safetensors, no se copian.

## Capacidades

- Generación de texto y razonamiento multi-step con cadena de pensamiento.
- Codificación de software de alto nivel: 73.4 % en SWE-bench con solo 3B activos.
- Razonamiento de contexto largo: maneja hasta 262 144 tokens nativos, útil para documentos extensos y conversaciones de muchas vueltas.
- Visión y lenguaje: el modelo base acepta imágenes como entrada, aunque la cuantización no especifica el soporte exacto de la librería `gbx-lm`.
- Soporte de agentes y workflows multi-step, con preservación del contexto de razonamiento entre turnos.
- Capacidades multilingües heredadas del modelo base Qwen3.6.
- No se documenta soporte explícito de tool/function calling en la información proporcionada, aunque el modelo base probablemente lo incluye.

## Casos de uso

- **Asistente de programación en entornos con memoria limitada**: un desarrollador con una GPU de gama media (por ejemplo, RTX 3090 o 4090) puede ejecutar la cuantización 8-bit con paging de expertos para recibir sugerencias de código y refactorizaciones, gracias a los 3B activos y la capacidad de SWE-bench del 73.4 %.
- **Análisis de documentos largos**: con una ventana de 262K tokens, se pueden procesar manuales técnicos, informes anuales o libros completos en una sola pasada, sin necesidad de dividir el texto.
- **Agentes autónomos en entornos locales**: el modelo puede ejecutar tareas multi-paso con razonamiento encadenado, por ejemplo, orquestar consultas a una base de datos, procesar resultados y generar un informe, todo en una sola sesión de contexto largo.
- **Sistema de visión-lenguaje en hardware de consumo**: al aceptar imágenes, permite crear aplicaciones de descripción de imágenes o análisis de capturas de pantalla en un equipo con poca VRAM, gracias al paging de expertos.
- **Despliegue en entornos con memoria limitada**: en un MacBook o un servidor sin GPU dedicada, el paging permite ejecutar el modelo aunque no haya memoria suficiente para todos los expertos, sacrificando velocidad de primer token pero manteniendo la corrección.
- **Investigación y prototipado de modelos MoE**: al ser Apache 2.0 y bit-idéntico al modelo cuantizado, sirve para estudiar el comportamiento de la cuantización 8-bit y el enrutamiento de expertos sin costes de licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para esta cuantización específica. El modelo base Qwen3.6-35B-A3B reporta un 73.4 % en SWE-bench según fuentes externas, pero no se incluyen datos de MMLU, HumanEval, GSM8K ni otras pruebas en los resultados de la búsqueda.

## Requisitos de hardware

- **VRAM estimada**: con cuantización 8-bit y 3B activos, los pesos activos por token ocupan aproximadamente 3 GB, pero el modelo completo en 8-bit pesa unos 37.7 GB. Con el paging de expertos, se puede ejecutar en un dispositivo con menos memoria que el modelo completo, siempre que se tenga suficiente para los pesos no-experto (model.safetensors) y la caché de expertos.
- **GPU recomendadas**: según guías externas, el modelo base funciona en RTX 3090, RTX 4090, RTX 5070 Ti, configuraciones con doble RTX 5060 Ti y Apple M3 Ultra. La cuantización 8-bit con paging reduce la presión de VRAM, por lo que una RTX 3090 de 24 GB podría ser suficiente para la mayoría de tareas.
- **Adecuado para GPU de consumo**: sí, especialmente con el paging; en una RTX 4090 de 24 GB debería caber el modelo completo en memoria sin streaming.
- **Opciones de despliegue**: únicamente a través de la librería `gbx-lm` con soporte de expert paging. No es compatible con vLLM, Ollama, llama.cpp ni TGI en este formato.
- **Latencia y throughput**: el streaming de expertos desde disco es más lento que la memoria, sobre todo en el primer procesamiento de un prompt largo. Las conversaciones continuadas se ven menos afectadas gracias a la caché de prompt. No hay cifras exactas publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (base) | 35B | 3B | 262K | Apache 2.0 | HuggingFace |
| GreenBitAI/Qwen3.6-35B-A3B-8bit-paged | 35B | 3B | 262K | Apache 2.0 | HuggingFace (cuantización 8-bit + paging) |
| Qwen3.6-27B dense | 27B | 27B | 262K | Apache 2.0 | HuggingFace |
| Qwen2.5-32B | 32B | 32B | 128K | Apache 2.0 | HuggingFace |

La ventaja principal de esta variante frente a la versión original es la posibilidad de ejecutarla en hardware con menos memoria, manteniendo la misma calidad que la cuantización 8-bit estándar. Frente a un modelo denso de tamaño similar (Qwen3.6-27B), el MoE ofrece menor latencia por token gracias a los 3B activos, aunque el modelo denso puede ser más sencillo de desplegar sin herramientas específicas.

## Limitaciones y advertencias

- **Una sola petición concurrente**: el caché de expertos es estado por modelo, por lo que el streaming solo funciona con una petición a la vez. Si se reciben peticiones concurrentes, el motor desactiva el streaming y carga todos los expertos en memoria, lo que puede causar fallos de memoria en equipos con recursos limitados.
- **Rendimiento de streaming**: la lectura de expertos desde disco es más lenta que la memoria, especialmente en el primer procesamiento de un prompt largo. Para aplicaciones de producción con alta concurrencia, se recomienda un hardware con memoria suficiente para el modelo completo.
- **Pérdida por cuantización**: aunque la salida es bit-idéntica a los pesos cuantizados en 8-bit en su disposición normal, la cuantización a 8-bit introduce pérdida respecto al modelo en FP16/FP32. La model card no cuantifica esta pérdida.
- **Dependencia de la librería `gbx-lm`**: el formato no es reconocido por otras librerías; se requiere una versión de `gbx-lm` con soporte de expert paging, y el formato no es portable a otros frameworks.
- **Sesgos y alucinación**: no se han publicado evaluaciones de sesgos para esta cuantización. Como modelo de lenguaje de gran tamaño, existe riesgo de alucinación, especialmente en tareas de razonamiento de largo contexto.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero la cuantización incluye pesos del modelo base Qwen3.6, que también es Apache 2.0; no hay restricciones adicionales conocidas.

## Enlaces

- [GreenBitAI/Qwen3.6-35B-A3B-8bit-paged en HuggingFace](https://huggingface.co/GreenBitAI/Qwen3.6-35B-A3B-8bit-paged)
- [Qwen/Qwen3.6-35B-A3B (modelo base) en HuggingFace](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Guía de Qwen 3.6 en insiderllm.com](https://insiderllm.com/guides/qwen-3-6-local-ai-guide/)
- [Cómo ejecutar Qwen 3.6 35B MoE localmente (VRAM, velocidad)](https://insiderllm.com/guides/best-way-run-qwen-3-6-35b-moe-locally/)
- [Ficha del modelo en theresanaiforthat.com](https://theresanaiforthat.com/model/qwen3-6-35b-a3b/)
- [Guía completa de Qwen 3.6-35B-A3B en aimadetools.com](https://www.aimadetools.com/blog/qwen-3-6-35b-a3b-complete-guide/)
