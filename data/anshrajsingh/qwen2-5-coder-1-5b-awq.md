# Anshrajsingh/qwen2.5-coder-1.5b-awq

## Resumen

El modelo `Anshrajsingh/qwen2.5-coder-1.5b-awq` es una versión cuantizada en 4 bits mediante AWQ (Activation-aware Weight Quantization) de un fine-tuning personalizado del modelo `Qwen/Qwen2.5-Coder-1.5B-Instruct`. El autor, Anshrajsingh, ha aplicado un pipeline de alineación en dos etapas: primero un ajuste fino supervisado (SFT) sobre el dataset `iamtarun/python_code_instructions_18k_alpaca`, y posteriormente una optimización por preferencias directas (DPO) usando `Vezora/Code-Preference-Pairs`. El resultado es un modelo ligero y eficiente, diseñado principalmente para generación de código Python, corrección de errores y razonamiento.

La cuantización AWQ con tamaño de grupo 128 reduce el peso del modelo a aproximadamente 1,2 GB, lo que permite su ejecución en hardware de consumo con requisitos de VRAM moderados. Al estar basado en Qwen2.5-Coder-1.5B, hereda la arquitectura transformer de la familia Qwen2.5, optimizada para tareas de programación. Su licencia Apache 2.0 facilita su uso comercial y su integración en proyectos de desarrollo.

Este modelo resulta relevante para desarrolladores que necesitan una solución de generación de código con bajo coste computacional, ya sea para entornos con recursos limitados, despliegues en edge o prototipado rápido. La combinación de SFT y DPO busca mejorar la calidad de las respuestas y la adherencia a las preferencias humanas en tareas de programación, aunque no se han publicado benchmarks que lo confirmen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen2.5-Coder-1.5B) |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit AWQ (group size 128) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-Coder-1.5B-Instruct`, un transformer causal de la familia Qwen2.5 diseñado específicamente para tareas de código. Sobre esta base, el autor ha aplicado un ajuste fino supervisado (SFT) utilizando el dataset `iamtarun/python_code_instructions_18k_alpaca`, que contiene instrucciones y ejemplos de código Python en formato Alpaca. Posteriormente, se ha realizado una optimización por preferencias directas (DPO) con el dataset `Vezora/Code-Preference-Pairs`, que proporciona pares de respuestas preferidas y rechazadas para alinear el modelo con las preferencias humanas.

Tras el entrenamiento, el modelo se ha cuantizado a 4 bits mediante AWQ (Activation-aware Weight Quantization) con un tamaño de grupo de 128. AWQ es una técnica que selecciona los pesos más importantes basándose en la activación de los datos, minimizando la pérdida de precisión respecto a la cuantización uniforme. Esta cuantización reduce el tamaño del modelo de aproximadamente 3 GB (en FP16) a 1,2 GB, facilitando su despliegue en GPUs con menos memoria.

No se han proporcionado detalles adicionales sobre el número de tokens de entrenamiento, la composición exacta del dataset o hiperparámetros específicos.

## Capacidades

- Generación de código Python: capaz de producir funciones, scripts y soluciones a problemas de programación.
- Corrección de errores: puede identificar y corregir bugs en código existente, gracias al entrenamiento con pares de preferencia.
- Razonamiento: el modelo base Qwen2.5-Coder-1.5B-Instruct incluye capacidades de razonamiento lógico y matemático aplicadas a problemas de programación.
- Conversacional: al estar basado en un modelo instruct, soporta interacción en formato chat mediante la plantilla de conversación de Qwen.
- Cuantización AWQ: optimizado para inferencia eficiente en hardware con recursos limitados.
- Compatibilidad con transformers y text-generation-inference: se puede cargar con la API estándar de HuggingFace y es compatible con endpoints de generación de texto.

No se especifican capacidades de tool calling, agentes, visión o audio en la información disponible.

## Casos de uso

- Asistente de desarrollo integrado (IDE): el modelo puede usarse como autocompletado de código en editores como VS Code, sugiriendo funciones Python y fragmentos de código en tiempo real. Su tamaño reducido permite ejecutarlo localmente en portátiles con GPU de gama media.
- Corrección automática de errores: integrado en pipelines de CI/CD, puede analizar logs de error y proponer parches para bugs comunes en Python, gracias a su entrenamiento con pares de preferencia.
- Generación de documentación técnica: a partir de una descripción funcional, el modelo puede generar comentarios, docstrings y documentación de API para módulos Python.
- Prototipado rápido de scripts: desarrolladores pueden describir una tarea en lenguaje natural y obtener un script Python funcional, acelerando la fase de prototipado en proyectos de análisis de datos o automatización.
- Chatbot de soporte técnico especializado en Python: al ser conversacional, puede responder preguntas sobre sintaxis, librerías y mejores prácticas, manteniendo contexto en diálogos multi-turno.
- Enseñanza de programación: como tutor virtual, puede explicar conceptos, resolver ejercicios y proporcionar ejemplos de código, adaptándose al nivel del estudiante.
- Despliegue en entornos edge: gracias a su bajo consumo de VRAM (estimado en 2-3 GB), puede ejecutarse en dispositivos como Raspberry Pi con acelerador NPU o en servidores sin GPU dedicada mediante CPU con cuantización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo específico.

## Requisitos de hardware

- VRAM estimada: con cuantización AWQ de 4 bits, los pesos ocupan aproximadamente 1,2 GB. Considerando el overhead de inferencia, se estima un uso de VRAM entre 2 y 3 GB para generación de texto con contexto moderado.
- GPUs recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o superiores. También es viable en GPUs de datacenter como A10 o T4.
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama baja y media, así como en Apple Silicon con Metal (a través de transformers).
- Opciones de despliegue: compatible con `transformers` (PyTorch), `text-generation-inference`, `vLLM` (con soporte AWQ), `llama.cpp` (si se convierte a GGUF) y `Ollama` (mediante importación).
- Latencia y throughput: no se proporcionan datos oficiales. En una RTX 3060, se espera una latencia de generación de alrededor de 20-40 tokens por segundo, dependiendo de la longitud de la secuencia y la configuración.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| Anshrajsingh/qwen2.5-coder-1.5b-awq | 1.54B | 4-bit AWQ | no disponible | Apache 2.0 | Generación de código Python |
| Qwen/Qwen2.5-Coder-1.5B-Instruct | 1.54B | FP16 | 32K (según modelo base) | Apache 2.0 | Generación de código general |
| CodeLlama-7B-Instruct | 7B | FP16 | 16K | Llama 2 license | Generación de código multilingüe |

La comparativa se basa en datos públicos del modelo base y de CodeLlama. La versión cuantizada ofrece un tamaño significativamente menor (1,2 GB frente a ~3 GB en FP16) a costa de una posible pérdida de precisión. El modelo base Qwen2.5-Coder-1.5B-Instruct tiene un contexto de 32K tokens, pero esta versión cuantizada no especifica si mantiene esa longitud. CodeLlama-7B es más grande y requiere más recursos, pero ofrece un contexto de 16K y soporte multilingüe más amplio.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo pequeño y entrenado con datasets específicos de código, puede reflejar sesgos presentes en los datos de entrenamiento, como preferencia por ciertos estilos de programación o falta de diversidad en lenguajes.
- Riesgo de alucinación: como cualquier modelo generativo, puede producir código sintácticamente correcto pero semánticamente incorrecto, especialmente en tareas complejas o poco representadas en el entrenamiento.
- Limitaciones de contexto: no se ha confirmado la longitud de contexto efectiva tras la cuantización; es probable que sea menor que la del modelo base (32K) si la cuantización afecta a la atención.
- Limitaciones de idioma: no se especifican idiomas soportados; aunque el modelo base es multilingüe, el fine-tuning se centró en código Python, por lo que el rendimiento en otros idiomas puede ser inferior.
- Restricciones de licencia: licencia Apache 2.0 permite uso comercial sin restricciones, pero se debe mantener el aviso de copyright y la atribución.
- Caveat para producción: al ser un modelo de 1.5B, su capacidad de razonamiento complejo es limitada en comparación con modelos más grandes. Se recomienda validar exhaustivamente el código generado antes de su uso en entornos críticos.
- Dependencia de la cuantización: AWQ puede degradar ligeramente la calidad en comparación con FP16, especialmente en tareas que requieren precisión numérica alta.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Anshrajsingh/qwen2.5-coder-1.5b-awq)
- [Modelo base: Qwen/Qwen2.5-Coder-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-Coder-1.5B-Instruct)
- [Dataset de SFT: iamtarun/python_code_instructions_18k_alpaca](https://huggingface.co/datasets/iamtarun/python_code_instructions_18k_alpaca)
- [Dataset de DPO: Vezora/Code-Preference-Pairs](https://huggingface.co/datasets/Vezora/Code-Preference-Pairs)
