# mradermacher/DeepSeek-Coder-V2-Lite-Instruct-abliterated-GGUF

## Resumen

DeepSeek-Coder-V2-Lite-Instruct-abliterated-GGUF es una cuantización GGUF estática del modelo DeepSeek-Coder-V2-Lite-Instruct-abliterated, publicado por el usuario mradermacher en Hugging Face. El modelo original, creado por criscarleo, es una versión "abliterada" del DeepSeek-Coder-V2-Lite-Instruct de DeepSeek AI, en la que se eliminan o atenúan los mecanismos de rechazo de respuestas no deseadas, lo que permite al modelo responder sin las restricciones habituales de seguridad y alineación. Esta versión GGUF está pensada para su uso con motores de inferencia como llama.cpp, Ollama o vLLM, facilitando el despliegue en hardware de consumo.

El modelo base DeepSeek-Coder-V2-Lite-Instruct es un modelo de lenguaje de 15.700 millones de parámetros con arquitectura MoE (Mixture of Experts), que activa 2.400 millones de parámetros por token. Está diseñado específicamente para tareas de programación y razonamiento, con una ventana de contexto de 128.000 tokens. La versión abliterada mantiene estas capacidades técnicas, pero modifica el comportamiento del modelo en cuanto a la generación de contenido que normalmente sería rechazado por las políticas de seguridad. Esta cuantización GGUF es relevante para desarrolladores que buscan ejecutar un modelo de código de alto rendimiento en entornos locales con restricciones de VRAM, aunque debe tenerse en cuenta que la abliteración puede implicar riesgos adicionales en cuanto a la generación de contenido inapropiado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en Transformer |
| Parametros totales | 15.706.484.224 (15,7B) |
| Parametros activos | 2.400.000.000 (2,4B) por token |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS |
| Idiomas soportados | no disponible (el modelo base soporta principalmente ingles y codigo fuente) |
| Licencia | no disponible (el modelo base DeepSeek-Coder-V2-Lite-Instruct usa la licencia DeepSeek License, pero la version abliterada y su cuantizacion no especifican licencia) |
| Formato de pesos | GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

El modelo base DeepSeek-Coder-V2-Lite-Instruct emplea una arquitectura Transformer con mezcla de expertos (MoE). En lugar de activar todos los parámetros en cada paso de inferencia, solo se activan 2.400 millones de parámetros de un total de 15.700 millones, lo que reduce significativamente el coste computacional por token manteniendo una alta capacidad. El modelo fue pre-entrenado en un corpus de código a nivel de repositorio con una ventana de contexto de 16K tokens durante el pre-entrenamiento, y posteriormente se extendió a 128K mediante entrenamiento continuo. Se utilizó una tarea adicional de relleno en blanco (fill-in-the-blank) para mejorar la finalización de código a nivel de proyecto. La versión Instruct se obtuvo mediante fine-tuning con datos de instrucciones y alineación.

La versión abliterada de criscarleo elimina o modifica las capas de rechazo del modelo original, lo que se consigue mediante técnicas de intervención en los pesos del modelo (ablación de direcciones de características relacionadas con el rechazo). El resultado es un modelo que mantiene las capacidades de generación de código y razonamiento del original, pero sin los mecanismos que bloquean ciertos tipos de contenido. La cuantización GGUF de mradermacher convierte los pesos originales a formato GGUF con diferentes niveles de precisión (desde FP16 hasta Q2_K), lo que permite elegir entre calidad y requisitos de memoria.

## Capacidades

- Generación de código en múltiples lenguajes de programación (Python, Java, C++, JavaScript, TypeScript, Go, Rust, etc.) con soporte para finalización de código a nivel de repositorio.
- Razonamiento matemático y lógico, con buen rendimiento en problemas de nivel competitivo.
- Comprensión de contexto largo (128K tokens), adecuado para analizar proyectos completos o documentación extensa.
- Soporte para relleno en blanco (fill-in-the-middle), útil para editores de código con autocompletado.
- Capacidades de instrucción y diálogo multi-turno, aunque el modelo está especializado en tareas de programación.
- La version abliterada elimina las restricciones de contenido, por lo que puede generar respuestas sobre temas que el modelo original rechazaría (uso bajo responsabilidad del usuario).
- No se ha confirmado soporte de tool calling ni function calling en esta version GGUF, aunque el modelo base puede ser adaptado para ello.

## Casos de uso

- Autocompletado de código en entornos de desarrollo: gracias a su ventana de contexto de 128K tokens y su entrenamiento a nivel de repositorio, el modelo puede sugerir fragmentos de código coherentes con el estilo y las dependencias del proyecto completo. Se puede integrar en editores como VS Code mediante extensiones que utilicen llama.cpp u Ollama.
- Asistente de programación en local: los desarrolladores pueden desplegar el modelo en una estación de trabajo con GPU de consumo (por ejemplo, RTX 3090 o 4090) y utilizarlo como copiloto sin depender de servicios en la nube, lo que garantiza privacidad del código.
- Análisis y revisión de código: el modelo puede procesar archivos o repositorios completos para detectar errores, sugerir refactorizaciones o explicar el funcionamiento de un código existente. Su contexto largo permite cargar el proyecto completo en una sola pasada.
- Generación de documentación técnica: a partir de código fuente, el modelo puede generar comentarios, docstrings, guías de uso o explicaciones de arquitectura, mejorando la mantenibilidad del software.
- Resolución de problemas de programación (coding challenges): puede utilizarse para resolver ejercicios de plataformas como LeetCode o HackerRank, proporcionando soluciones y explicaciones paso a paso.
- Prototipado rápido de scripts y utilidades: para tareas de automatización o análisis de datos, el modelo puede generar scripts en Python o shell a partir de descripciones en lenguaje natural, acelerando el desarrollo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base DeepSeek-Coder-V2-Lite-Instruct reportó en su documentación oficial resultados destacados en HumanEval (74,5% pass@1), MBPP (73,9%) y otros benchmarks de código, así como en tareas de razonamiento como GSM8K y MMLU. Sin embargo, estos datos corresponden al modelo original en precisión completa, no a la versión abliterada ni a sus cuantizaciones GGUF, que pueden presentar degradaciones de rendimiento según el nivel de cuantización.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantización. Para Q4_K_M (la más equilibrada), se necesitan aproximadamente 9-10 GB de VRAM. Para Q8_0, alrededor de 16 GB. Para FP16, unos 31 GB.
- GPU recomendadas: RTX 3090 (24 GB) o RTX 4090 (24 GB) para cuantizaciones Q4 o Q5 con holgura. Para Q8 o FP16 se recomienda A100 (40 GB o 80 GB) o H100.
- Sí cabe en GPU de consumo: las cuantizaciones Q2, Q3 y Q4 pueden ejecutarse en GPUs con 8-12 GB de VRAM, como RTX 3080 (10 GB) o RTX 4070 (12 GB), aunque con menor calidad de salida.
- Opciones de despliegue: llama.cpp, Ollama, vLLM (con soporte GGUF), llama-cpp-python, text-generation-webui, entre otros.
- Latencia y throughput estimados: no disponibles para esta cuantización específica. En general, un modelo MoE de 2,4B activos en una RTX 4090 con Q4_K_M puede generar entre 40 y 60 tokens por segundo, pero estos valores son orientativos y dependen de la implementación y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| DeepSeek-Coder-V2-Lite-Instruct (original) | 15,7B totales, 2,4B activos | 128K | MoE | DeepSeek License (uso comercial permitido con restricciones) | Hugging Face |
| DeepSeek-Coder-V2-Lite-Instruct-abliterated (este modelo) | 15,7B totales, 2,4B activos | 128K | MoE | no disponible | Hugging Face (GGUF) |
| CodeLlama-13B-Instruct | 13B | 16K | Densa | Llama 2 License | Hugging Face |
| Qwen2.5-Coder-7B-Instruct | 7B | 128K | Densa | Apache 2.0 | Hugging Face |

La principal diferencia con alternativas densas como CodeLlama o Qwen2.5-Coder es la arquitectura MoE, que ofrece un mejor equilibrio entre capacidad y coste computacional. El contexto de 128K es superior al de CodeLlama (16K) y comparable al de Qwen2.5-Coder. La licencia de esta versión abliterada no está especificada, lo que limita su uso en entornos comerciales sin consulta legal previa.

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de seguridad del modelo original, lo que puede llevar a la generación de contenido ofensivo, ilegal o peligroso. El uso de este modelo en producción conlleva riesgos legales y éticos.
- No se especifica la licencia de esta versión concreta. El modelo base DeepSeek-Coder-V2-Lite-Instruct tiene una licencia propia que puede imponer restricciones al uso comercial y a la redistribución. Se recomienda consultar la licencia del modelo original antes de cualquier uso.
- Las cuantizaciones de baja precisión (Q2_K, Q3_K) pueden degradar notablemente la calidad de las respuestas, especialmente en tareas de razonamiento complejo.
- No se han publicado resultados de benchmarks para esta cuantización, por lo que el rendimiento real puede variar respecto al modelo original.
- El modelo está especializado en código y puede mostrar un rendimiento inferior en tareas de lenguaje natural general, aunque mantiene capacidades básicas de conversación.
- La ventana de contexto de 128K tokens es teórica; en la práctica, el uso de contextos muy largos puede ralentizar la inferencia y aumentar el consumo de memoria, especialmente con cuantizaciones altas.
- El repositorio no indica los idiomas soportados; el modelo base fue entrenado principalmente con datos en inglés y código fuente, por lo que su rendimiento en otros idiomas puede ser limitado.

## Enlaces

- Repositorio Hugging Face del modelo: https://huggingface.co/mradermacher/DeepSeek-Coder-V2-Lite-Instruct-abliterated-GGUF
- Modelo original abliterado (criscarleo): https://huggingface.co/criscarleo/DeepSeek-Coder-V2-Lite-Instruct-abliterated
- Modelo base DeepSeek-Coder-V2-Lite-Instruct (Hugging Face): https://huggingface.co/deepseek-ai/DeepSeek-Coder-V2-Lite-Instruct
- Repositorio GitHub de DeepSeek-Coder-V2: https://github.com/deepseek-ai/DeepSeek-Coder-V2
- Sitio oficial de DeepSeek Coder: https://deepseekcoder.github.io/
- Repositorio GitHub de DeepSeek-Coder (V1): https://github.com/deepseek-ai/deepseek-coder
