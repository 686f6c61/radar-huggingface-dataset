# kaptaan45/QaptaanLM-0.75B-BnB

## Resumen

QaptaanLM-0.75B-BnB es una suite de pesos cuantizados con BitsAndBytes del modelo fundacional QaptaanLM-0.75B, desarrollado por kaptaan45. Este modelo base está diseñado específicamente para síntesis de código fuente, razonamiento técnico y comprensión de código en contextos largos, empleando una arquitectura de atención lineal (linear-attention) que reduce el coste computacional frente a la atención softmax tradicional. La versión BnB ofrece dos niveles de cuantización (4-bit NF4 y 8-bit Int8) para facilitar la inferencia en hardware con recursos limitados, manteniendo un equilibrio entre huella de memoria y fidelidad.

Con aproximadamente 750 millones de parámetros, se posiciona como un modelo compacto orientado a tareas de programación y razonamiento técnico. Su licencia Apache 2.0 permite uso comercial sin restricciones significativas. La relevancia actual radica en la demanda de modelos pequeños y eficientes que puedan ejecutarse en entornos edge o con GPUs de consumo, sin sacrificar capacidades de generación de código.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con atención lineal (linear-attention) |
| Parametros totales | 750 millones (0.75B) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible (el dataset de entrenamiento usa 4096 tokens, pero no se confirma el contexto del modelo) |
| Tipos de cuantizacion | 4-bit NF4, 8-bit Int8 (BitsAndBytes) |
| Idiomas soportados | inglés, código |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (subcarpetas `4bit/` y `8bit/`) |

## Arquitectura y entrenamiento

El modelo base QaptaanLM-0.75B emplea una arquitectura de atención lineal, una variante de transformer que sustituye la atención softmax por mecanismos de atención lineal para reducir la complejidad computacional de O(n²) a O(n) en la longitud de secuencia. Esto permite manejar contextos largos de código con menor coste de memoria y mayor velocidad de inferencia. El modelo fue sometido a un proceso de Continued Pre-Training (CPT) sobre el dataset KapCode-1B, que contiene fragmentos de código pre-tokenizados en shards de 4096 tokens. No se dispone de información detallada sobre el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. La versión BnB es una cuantización posterior del modelo base, sin entrenamiento adicional.

## Capacidades

- Generación de código fuente en múltiples lenguajes de programación, con énfasis en síntesis de código y completado de funciones.
- Razonamiento técnico: capacidad para resolver problemas algorítmicos y explicar lógica de programación.
- Comprensión de código en contexto largo gracias a la atención lineal, que mantiene eficiencia en secuencias extensas.
- Soporte de instrucciones en inglés y código, aunque no se especifica si tiene capacidades multilingües más allá de estos dos dominios.
- No se menciona soporte explícito de tool calling, function calling, agentes o modos de razonamiento especiales (thinking mode). Tampoco se indica capacidad de visión o audio.

## Casos de uso

- Asistente de programación en entornos de desarrollo integrado (IDE): el modelo puede sugerir fragmentos de código, completar funciones y ofrecer explicaciones técnicas en tiempo real, gracias a su tamaño reducido que permite baja latencia en máquinas de desarrollo.
- Generación de código en pipelines de CI/CD: integrado como herramienta de autocompletado o generación de tests unitarios, puede ejecutarse en servidores de integración continua con GPUs modestas o incluso CPU con cuantización 4-bit.
- Análisis estático de código: su capacidad de comprensión de código en contexto largo permite procesar archivos completos para detectar patrones, posibles errores o sugerir refactorizaciones.
- Educación y formación técnica: puede utilizarse como tutor de programación que explica conceptos, depura código y propone ejercicios, al ser un modelo ligero que puede desplegarse en portátiles.
- Prototipado rápido de aplicaciones: en fases iniciales de desarrollo, el modelo puede generar esqueletos de código, scripts de automatización o consultas SQL a partir de descripciones en lenguaje natural.
- Investigación en eficiencia de modelos: al ser un modelo de atención lineal cuantizado, sirve como banco de pruebas para estudiar el equilibrio entre compresión, rendimiento y calidad en tareas de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de métricas como MMLU, HumanEval, GSM8K o similares para este modelo ni para su versión base.

## Requisitos de hardware

- VRAM estimada: aproximadamente 550 MB para la versión 4-bit NF4 y 850 MB para la versión 8-bit Int8, según la model card.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM, incluyendo GPUs de consumo como NVIDIA GTX 1650, RTX 2060, RTX 3060, o incluso iGPUs con suficiente memoria compartida.
- Cabe en GPUs de consumo: sí, tanto en tarjetas de gama baja como en tarjetas integradas modernas.
- Opciones de despliegue: al ser pesos en formato safetensors con cuantización BitsAndBytes, se puede cargar con la librería `transformers` de Hugging Face. También es posible convertirlos a GGUF para usarlos con llama.cpp u Ollama, aunque no se proporcionan archivos GGUF en este repositorio (existe un repositorio separado para GGUF del modelo instruct).
- Latencia y throughput: no se proporcionan datos específicos, pero al ser un modelo de 0.75B con atención lineal, se espera una inferencia rápida en hardware moderno, incluso en CPU con cuantización 4-bit.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de tamaño similar. Como referencia cualitativa, modelos como Qwen2.5-Coder-0.5B o CodeLlama-7B podrían ser alternativas, pero no se tienen datos de rendimiento comparables. Se recomienda consultar benchmarks públicos de HumanEval o MBPP para evaluar la idoneidad en tareas de código.

## Limitaciones y advertencias

- Tamaño reducido: al ser un modelo de 0.75B, su capacidad de razonamiento complejo y generación de código extenso es limitada en comparación con modelos más grandes.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar código sintácticamente válido pero semánticamente incorrecto o con vulnerabilidades de seguridad.
- Idiomas limitados: solo se declara soporte para inglés y código; no se garantiza un rendimiento adecuado en otros idiomas naturales.
- Contexto no confirmado: aunque el dataset usa 4096 tokens, no se especifica la longitud máxima de contexto del modelo, lo que puede afectar a tareas que requieran secuencias muy largas.
- Sin benchmarks publicados: no hay evidencia empírica de su rendimiento en tareas estándar, por lo que su calidad debe validarse en cada caso de uso.
- Dependencia de `trust_remote_code`: la carga del modelo requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; se recomienda auditar el código antes de usarlo en entornos de producción.

## Enlaces

- Repositorio HuggingFace del modelo cuantizado: https://huggingface.co/kaptaan45/QaptaanLM-0.75B-BnB
- Modelo base: https://huggingface.co/kaptaan45/QaptaanLM-0.75B
- Repositorio GitHub con pipeline de fine-tuning: https://github.com/rudy-07/QaptaanLM-0.75B
- Dataset KapCode-1B en Hugging Face: https://huggingface.co/datasets/kaptaan45/KapCode-1B
- Notebook de exploración del dataset en Kaggle: https://www.kaggle.com/code/kaptaan45/kapcode-1b-dataset-exploration-quickstart
