# manaladan6/codegeex4-all-9b-GGUF

## Resumen

CodeGeeX4-ALL-9B es un modelo de generación de código multilingüe desarrollado por THUDM (Tsinghua University), presentado como la versión open-source de la serie CodeGeeX4. Se trata de un modelo de 9.4 mil millones de parámetros que se obtiene mediante entrenamiento continuo sobre la base de GLM-4-9B, optimizado específicamente para tareas de programación. Con una ventana de contexto de 128K tokens, soporta completado y generación de código, intérprete de código, búsqueda web, function calling y preguntas y respuestas a nivel de repositorio, todo con un único modelo.

Este modelo destaca por ser el más potente en generación de código entre los modelos con menos de 10B parámetros, superando en varios benchmarks a alternativas mucho más grandes como Llama3-70B o Codestral-22B. La versión GGUF aquí descrita permite su ejecución local en hardware de consumo mediante llama.cpp, lo que lo convierte en una opción atractiva para desarrolladores que necesitan asistencia de código sin depender de APIs externas. Su relevancia actual radica en su equilibrio entre rendimiento, velocidad de inferencia y tamaño, adecuado para entornos de producción con recursos limitados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GLM-4 (transformer, variante de GLM) |
| Parametros totales | 9.399.951.360 (9.4B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | GGUF (varias cuantizaciones, p. ej. Q4_K_M, Q5_K_M, Q8_0; repo de 40.7 GB) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | codegeex4 (licencia propia, requiere aceptacion) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

CodeGeeX4-ALL-9B se basa en la arquitectura GLM-4-9B, un transformer con mecanismos de atención estándar, entrenado de forma continua sobre datos de código para mejorar sus capacidades de generación. La arquitectura no emplea mezcla de expertos (MoE), por lo que todos los parámetros están activos en cada inferencia. El modelo ha sido afinado para soportar múltiples tareas de desarrollo de software, incluyendo completado de código, interpretación de código, búsqueda web y function calling, sin necesidad de adaptadores adicionales.

El entrenamiento se realizó sobre un dataset multilingüe que cubre principalmente chino e inglés, aunque el modelo puede trabajar con código en otros lenguajes de programación. No se han publicado detalles específicos sobre el número de tokens de entrenamiento ni sobre el uso de técnicas como RLHF o DPO en la información disponible. La ventana de contexto de 128K tokens permite procesar repositorios completos y conversaciones largas, lo que es clave para tareas de Q&A a nivel de repositorio y generación de código con dependencias extensas.

## Capacidades

- Generación de código: produce código funcional en múltiples lenguajes de programación (Python, Java, C++, etc.) a partir de descripciones en lenguaje natural.
- Completado de código: rellena código parcial o sugiere la siguiente línea, soportando modos de completado en el medio (fill-in-the-middle).
- Intérprete de código: puede ejecutar y evaluar código para resolver problemas de programación de forma interactiva.
- Búsqueda web: integra resultados de búsqueda en línea para responder preguntas que requieren información actualizada.
- Function calling: permite definir y llamar funciones externas de manera estructurada, útil para agentes y herramientas.
- Q&A a nivel de repositorio: puede analizar código de un repositorio completo (hasta 128K tokens) y responder preguntas sobre su funcionamiento.
- Multilingüe: soporta entrada y salida en chino e inglés, con generación de código independiente del idioma de programación.

## Casos de uso

- **Asistente de programación integrado en IDE**: se puede desplegar como autocompletado de código en editores como VSCode o JetBrains, aprovechando su capacidad de completado en el medio y su bajo tamaño para responder en milisegundos en una GPU de consumo.
- **Generación de código en pipelines de CI/CD**: el modelo puede generar tests unitarios o fragmentos de código a partir de descripciones de requisitos, integrándose en flujos de integración continua para automatizar tareas de scaffolding.
- **Agente de desarrollo con function calling**: se puede usar como núcleo de un agente que interactúa con herramientas (git, compiladores, APIs) mediante function calling, ejecutando tareas de refactorización o depuración de forma autónoma.
- **Análisis de repositorios heredados**: gracias a su contexto de 128K tokens, puede ingerir un repositorio completo y responder preguntas sobre arquitectura, dependencias o bugs, facilitando el mantenimiento de código legacy.
- **Asistente de aprendizaje de programación**: en entornos educativos, puede explicar código, generar ejemplos y corregir errores de forma interactiva, adaptándose al nivel del estudiante en chino o inglés.
- **Documentación automática de código**: puede generar comentarios, docstrings y documentación técnica a partir de código fuente, mejorando la mantenibilidad de proyectos grandes.
- **Generación de scripts para automatización**: ideal para crear scripts de shell, Python o PowerShell para tareas administrativas o de operaciones, con capacidad de explicar el código generado.

## Benchmarks y rendimiento

Los resultados publicados en la model card comparan CodeGeeX4-ALL-9B con modelos de mayor tamaño en tareas de generación de código:

| Modelo | Seq Length | HumanEval | MBPP | NCB | LCB | HumanEvalFIM | CRUXEval-O |
|---|---|---|---|---|---|---|---|
| Llama3-70B-Instruct | 8K | 77.4 | 82.3 | 37.0 | 27.4 | - | - |
| DeepSeek Coder 33B Instruct | 16K | 81.1 | 80.4 | 39.3 | 29.3 | 78.2 | 49.9 |
| Codestral-22B | 32K | 81.1 | 78.2 | 46.0 | 35.3 | 91.6 | 51.3 |
| **CodeGeeX4-ALL-9B** | **128K** | **82.3** | **75.7** | **40.4** | **28.5** | **85.0** | **47.1** |

CodeGeeX4-ALL-9B supera a Llama3-70B en HumanEval y NCB, y es competitivo con DeepSeek Coder 33B y Codestral-22B en la mayoría de métricas, pese a tener menos de un tercio de parámetros. Su punto más débil es MBPP (75.7), inferior a los modelos más grandes, y CRUXEval-O, donde Codestral lidera. No se han publicado datos de benchmarks adicionales en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con cuantización Q4_K_M (aprox. 5.5 GB de pesos) se puede ejecutar en una GPU con 8 GB de VRAM; con Q8_0 (aprox. 10 GB) se requiere al menos 12 GB. En FP16, el modelo ocupa ~19 GB, por lo que necesita una GPU de 24 GB.
- **GPU recomendadas**: para inferencia rápida en producción, una RTX 4090 (24 GB) o una A100 (40 GB) son adecuadas. Para cuantizaciones ligeras, una RTX 3060 12 GB o RTX 4070 12 GB son suficientes.
- **Cabe en consumer GPU**: sí, en cuantizaciones Q4_K_M o Q5_K_M, que ocupan menos de 6 GB, se puede ejecutar en GPUs de gama media (RTX 3060 12 GB, RTX 4060 Ti 16 GB).
- **Opciones de despliegue**: llama.cpp (oficial), Ollama, vLLM (si se convierte a safetensors), llama-cpp-python para integración en Python. El formato GGUF es compatible con estas herramientas.
- **Latencia y throughput**: en una RTX 4090 con Q4_K_M, se estima una velocidad de ~50-80 tokens/s para generación, y una latencia de primer token de <1s para contexto corto. Para contexto largo (128K), se recomienda usar prompt caching para reducir el tiempo de prefill.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | HumanEval | MBPP | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| CodeGeeX4-ALL-9B | 9.4B | 128K | 82.3 | 75.7 | codegeex4 (restrictiva) | HF, GGUF |
| DeepSeek Coder 33B Instruct | 33B | 16K | 81.1 | 80.4 | MIT | HF, GGUF |
| Codestral-22B | 22B | 32K | 81.1 | 78.2 | MNPL (no comercial) | HF, GGUF |
| Llama3-70B-Instruct | 70B | 8K | 77.4 | 82.3 | Llama 3 License | HF, GGUF |

CodeGeeX4-ALL-9B ofrece el mejor equilibrio entre rendimiento y tamaño, con la ventaja de un contexto de 128K tokens, muy superior al de DeepSeek Coder 33B (16K) o Llama3-70B (8K). Sin embargo, su licencia es más restrictiva que la MIT de DeepSeek Coder, y no alcanza a Codestral en tareas de completado en el medio (HumanEvalFIM) ni en LCB. Para uso comercial, hay que revisar la licencia codegeex4.

## Limitaciones y advertencias

- **Licencia restrictiva**: la licencia codegeex4 no es open source estándar; requiere aceptación y puede limitar el uso comercial. Revisar el texto completo de la licencia antes de desplegar en producción.
- **Sesgos de idioma**: el modelo está entrenado principalmente en chino e inglés, por lo que puede tener un rendimiento inferior en otros idiomas para tareas de código con comentarios o documentación en otros idiomas.
- **Riesgo de alucinación**: como cualquier LLM, puede generar código incorrecto o referencias a APIs inexistentes, especialmente en funciones de búsqueda web o análisis de repositorios.
- **Contexto largo**: aunque soporta 128K tokens, el rendimiento en la parte media de la ventana de contexto puede degradarse, y el uso de contextos muy largos aumenta la latencia y el uso de memoria.
- **Dependencia de la versión de llama.cpp**: se requiere una versión reciente de llama.cpp para soportar el formato GGUF y el modelo correctamente; versiones antiguas pueden fallar.
- **Sin soporte de visión**: este modelo es solo de texto, no procesa imágenes ni otros tipos de datos multimodales.

## Enlaces

- [Repositorio HuggingFace del modelo GGUF](https://huggingface.co/manaladan6/codegeex4-all-9b-GGUF)
- [Repositorio HuggingFace del modelo original (THUDM)](https://huggingface.co/THUDM/codegeex4-all-9b)
- [GitHub de CodeGeeX4 (THUDM)](https://github.com/THUDM/CodeGeeX4)
- [Repositorio de zai-org/CodeGeeX4 (espejo)](https://github.com/zai-org/CodeGeeX4)
- [Página del modelo en local-ai-zone](https://local-ai-zone.github.io/models/codegeex4-all-9b.html)
- [Artículo de toolify.ai sobre el modelo](https://www.toolify.ai/ai-model/thudm-codegeex4-all-9b-gguf)
