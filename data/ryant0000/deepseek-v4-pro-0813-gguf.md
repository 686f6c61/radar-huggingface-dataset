# ryant0000/DeepSeek-V4-Pro-0813-gguf

## Resumen

DeepSeek-V4-Pro-0813 es la versión oficial del modelo DeepSeek-V4-Pro, desarrollado por DeepSeek AI, que sustituye a la versión preliminar con mejoras significativas en capacidades agénticas y rendimiento en entornos de producción. Este repositorio concreto, publicado por el usuario ryant0000, contiene cuantizaciones GGUF del modelo original, generadas mediante la herramienta `convert_hf_to_gguf.py` y `llama-quantize`. El modelo base cuenta con aproximadamente 1,57 billones de parámetros (1.572.999.528.803), lo que lo sitúa entre los modelos de lenguaje más grandes disponibles públicamente. Incorpora un módulo de decodificación especulativa DSpark que acelera la inferencia, y destaca por su rendimiento en tareas de agentes, razonamiento y generación de código.

La relevancia de este lanzamiento radica en que DeepSeek-V4-Pro-0813 supera a la versión preliminar en todos los benchmarks publicados y compite directamente con modelos propietarios de última generación como Opus-4.8, Kimi K3 o GLM-5.2. Además, la licencia MIT permite uso comercial sin restricciones, un factor diferencial frente a muchos competidores. Sin embargo, hay que tener en cuenta que esta versión GGUF es una conversión no oficial realizada por un tercero, con posibles problemas de plantilla de chat y sin garantías de soporte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (basada en la estructura de DeepSeek-V4-Pro Preview, con módulo DSpark de decodificación especulativa) |
| Parametros totales | 1.572.999.528.803 (~1,57 billones) |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (híbrido, según el autor), Q4_0 y otros (no enumerados) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (este repo); el modelo base original usa safetensors |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo (número de capas, atención, etc.). Se indica que DeepSeek-V4-Pro-0813 se construye sobre la estructura de DeepSeek-V4-Pro (Preview) y añade un módulo de decodificación especulativa llamado DSpark, que permite acelerar la generación mediante la predicción de múltiples tokens. Esta técnica se activa en vLLM con el flag `--speculative-config '{"method":"dspark","num_speculative_tokens":7,"draft_sample_method":"greedy"}'`.

No se han publicado datos sobre el entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). El modelo es la versión oficial que supera a la preview, con mejoras especialmente notables en tareas agénticas y de razonamiento, como reflejan los benchmarks. El autor de la cuantización GGUF menciona que el proceso de conversión genera "problemas de plantilla" debido a que el modelo no incluye un chat template Jinja estándar, sino que requiere scripts específicos de codificación proporcionados en la carpeta `encoding` del modelo base.

## Capacidades

- Generación de texto y razonamiento complejo, con soporte de parámetro `reasoning_effort` en tres niveles (`low`, `high`, `max`) que controlan el tiempo de deliberación antes de responder.
- Capacidades agénticas avanzadas: ejecución de tareas en terminal, navegación en repositorios, resolución de problemas de software y automatización de flujos de trabajo, según los benchmarks publicados.
- Generación y edición de código, incluyendo tareas de desarrollo full-stack (DSBench) y resolución de issues en repositorios (DeepSWE).
- Soporte de tool calling y uso de herramientas, evidenciado por los resultados en Toolathlon-Verified y Agents' Last Exam.
- Decodificación especulativa DSpark integrada, que reduce la latencia en producción cuando se sirve con vLLM.
- Capacidades multilingües: no especificadas en la documentación disponible.

## Casos de uso

- Desarrollo de software agéntico: el modelo puede resolver tareas de codificación complejas, como implementar features o corregir bugs en repositorios existentes, gracias a su alto rendimiento en DeepSWE (62.7) y DSBench-Hard (67.2). Se integraría en pipelines de CI/CD como agente autónomo.
- Automatización de terminales y sistemas: con un 87.9 en Terminal Bench 2.1, es adecuado para ejecutar comandos, gestionar procesos y administrar entornos remotos de forma autónoma.
- Asistente de programación en tiempo real: su capacidad para razonar sobre código y usar herramientas lo hace útil como copiloto avanzado en IDEs, aunque su tamaño requiere infraestructura de servidor.
- Investigación y razonamiento científico: los resultados en HLE (42.7 sin herramientas, 60.0 con herramientas) indican aptitud para problemas de nivel experto en matemáticas y ciencias.
- Agentes de atención al cliente con razonamiento profundo: puede gestionar conversaciones multi-turno y tomar decisiones complejas, aunque la longitud de contexto no está documentada.
- Automatización de tareas empresariales: gracias a su capacidad de usar herramientas y razonar sobre múltiples pasos, puede encargarse de tareas como extracción de datos, generación de informes o integración con APIs, como sugiere su puntuación en AutomationBench (31.8).

## Benchmarks y rendimiento

La siguiente tabla recoge los resultados publicados por el autor del modelo en la model card, comparando DeepSeek-V4-Pro-0813 con otros modelos de referencia. Los valores corresponden a evaluaciones con el framework DeepSeek Harness en modo mínimo, con `reasoning_effort = max`, `temperature = 1.0` y `top_p = 0.95`.

| Benchmark | DeepSeek-V4-Pro-0813 | DeepSeek-V4-Flash-0731 | DeepSeek-V4-Pro (Preview) | DeepSeek-V4-Flash (Preview) | GLM-5.2 | Kimi K3 | Opus-4.8 | Fable-5 (w/ fallback) |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: | :---: | :---: |
| HLE (wo / w tools) | 42.7 / 60.0 | 37.8 / 51.5 | 37.7 / 48.2 | 34.8 / 45.1 | 40.5 / 54.7 | 43.5 / 56.0 | 49.8 / 57.9 | 53.3 / 63.0 |
| Terminal Bench 2.1 | 87.9 | 82.7 | 72.1 | 61.8 | 81.0 | 88.3 | 85.0 | 88.0 |
| NL2Repo | 61.5 | 54.2 | 38.5 | 39.4 | 48.9 | - | 69.7 | - |
| Cybergym | 83.3 | 76.7 | 52.7 | 38.7 | - | 80.0 | 78.3 | 83.1 |
| DeepSWE | 62.7 | 54.4 | 12.8 | 7.3 | 46.2 | 67.5 | 58.0 | 70.0 |
| Toolathlon-Verified | 74.1 | 70.3 | 55.9 | 49.7 | 59.9 | 76.5 | 76.2 | 77.9 |
| Agents' Last Exam | 25.7 | 25.2 | 16.5 | 15.8 | 23.8 | 27.6 | 25.7 | - |
| AutomationBench (Public) | 31.8 | 25.1 | 12.8 | 10.8 | 12.9 | 30.8 | 27.2 | 29.1 |
| DSBench-FullStack † | 71.1 | 68.7 | 41.8 | 37.0 | 61.8 | 73.7 | 71.6 | 77.2 |
| DSBench-Hard † | 67.2 | 59.6 | 31.1 | 25.8 | 54.5 | 63.0 | 71.7 | 68.3 |

Notas: † DSBench-FullStack es un conjunto interno de desarrollo full-stack; DSBench-Hard es un conjunto interno de problemas difíciles de agentes de código. Los valores con "-" indican que no se publicaron resultados para ese modelo en ese benchmark.

## Requisitos de hardware

- Con 1,57 billones de parámetros, el modelo requiere un clúster de GPUs de alta gama. En BF16, el peso ocupa aproximadamente 3,1 TB, por lo que se necesitan múltiples GPUs con memoria HBM. El autor menciona servir el modelo en un nodo de 4×GB300 (GPU de NVIDIA con ~288 GB cada una), lo que sumaría ~1,15 TB, insuficiente para BF16 completo, pero viable con cuantización.
- La cuantización Q4_0 (4 bits) reduciría el peso a unos ~800-900 GB, aún lejos de cualquier GPU de consumo.
- No es viable en hardware de consumo (RTX 4090, 3090, etc.) ni en estaciones de trabajo convencionales.
- Opciones de despliegue: vLLM con soporte DSpark (recomendado por el autor), llama.cpp para los archivos GGUF, y potencialmente otros frameworks compatibles con GGUF como Ollama, aunque no se ha verificado.
- No se han publicado datos de latencia o throughput en la información disponible.

## Comparativa con modelos similares

La tabla de benchmarks anterior ya ofrece una comparativa directa con los principales competidores. A nivel de características, DeepSeek-V4-Pro-0813 se posiciona como un modelo de código abierto (MIT) frente a alternativas propietarias como Opus-4.8, Kimi K3 o Fable-5. No se dispone de información sobre el número de parámetros de estos modelos comparados, por lo que no es posible realizar una comparativa técnica de arquitectura. En cuanto a licencia, DeepSeek-V4-Pro-0813 es el único con licencia MIT entre los listados, lo que facilita su uso comercial y modificación. Su rendimiento en benchmarks agénticos (Terminal Bench, Cybergym, Toolathlon) es competitivo, aunque por detrás de Kimi K3 y Fable-5 en varios de ellos.

## Limitaciones y advertencias

- Este repositorio contiene una cuantización GGUF no oficial, realizada por un tercero (ryant0000), no por DeepSeek AI. Puede haber degradación de rendimiento respecto al modelo original en BF16.
- El autor advierte de "problemas de plantilla" (chat template) porque el modelo no incluye un Jinja template estándar; se requiere usar los scripts de codificación de la carpeta `encoding` del modelo base para formatear correctamente las conversaciones.
- No se ha documentado la longitud de contexto, lo que dificulta planificar su uso en aplicaciones que requieran ventanas largas.
- Riesgo de alucinaciones y sesgos desconocidos, al no haberse publicado una evaluación ética o de sesgos.
- El tamaño del modelo (1,57 billones de parámetros) hace que sea inviable para la mayoría de organizaciones, tanto por coste de hardware como por consumo energético.
- Aunque la licencia MIT permite uso comercial, la falta de soporte oficial para esta versión GGUF puede generar problemas en entornos de producción.
- No se han publicado resultados de benchmarks clásicos como MMLU, HumanEval o GSM8K en la información proporcionada; los datos disponibles se centran en tareas agénticas.

## Enlaces

- Repositorio HuggingFace de la cuantización: https://huggingface.co/ryant0000/DeepSeek-V4-Pro-0813-gguf
- Modelo base original: https://huggingface.co/deepseek-ai/DeepSeek-V4-Pro-0813
- Informe técnico (arXiv): https://arxiv.org/abs/2606.19348
- Página oficial de DeepSeek: https://www.deepseek.com/
- Chat de DeepSeek: https://chat.deepseek.com/
