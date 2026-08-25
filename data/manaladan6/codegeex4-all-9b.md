# manaladan6/codegeex4-all-9b

## Resumen

CodeGeeX4-ALL-9B es un modelo de generación de código multilingüe desarrollado por el equipo de Zhipu AI (THUDM), publicado originalmente como la versión open source de la serie CodeGeeX4. Se trata de un modelo de 9.4 mil millones de parámetros, entrenado de forma continua sobre la base del modelo GLM-4-9B, con el objetivo de mejorar sustancialmente sus capacidades de generación de código. Su relevancia actual radica en que, con menos de 10 mil millones de parámetros, consigue un rendimiento competitivo frente a modelos mucho más grandes en benchmarks de código como HumanEval o BigCodeBench, ofreciendo un equilibrio óptimo entre velocidad de inferencia y calidad de salida.

El modelo soporta un contexto de hasta 128.000 tokens y está diseñado para cubrir un espectro amplio de escenarios de desarrollo de software, incluyendo completado de código, generación de código, intérprete de código, búsqueda web, llamadas a funciones (function calling) y preguntas y respuestas a nivel de repositorio. La licencia es propia de CodeGeeX4, con restricciones de uso comercial que deben revisarse. El repositorio de HuggingFace de esta versión concreta (manaladan6) contiene los pesos en formato safetensors, con un tamaño de 18.8 GB, y se identifica con la etiqueta de licencia `codegeex4`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (basada en GLM-4-9B) |
| Parametros totales | 9.399.951.392 (9,4 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 128K tokens |
| Tipos de cuantizacion | no disponible (se distribuyen pesos en bfloat16; existen conversiones GGUF de la comunidad) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | codegeex4 (licencia propia, no OSI; revisar restricciones) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

CodeGeeX4-ALL-9B es un modelo de lenguaje de tipo transformer, entrenado de forma continua sobre el modelo GLM-4-9B, que es la base arquitectonica. No se trata de un modelo de mezcla de expertos (MoE), sino de un modelo denso con todos los parámetros activos en cada inferencia. La arquitectura hereda el diseño de GLM-4-9B, con atención por ventanas deslizantes y otras optimizaciones propias de la familia GLM, aunque los detalles concretos de la arquitectura interna (número de capas, dimensiones ocultas, etc.) no se especifican en la documentación disponible.

El entrenamiento se realizó con un enfoque de entrenamiento continuo sobre GLM-4-9B, con el objetivo de potenciar las capacidades de generación de código. El modelo se entrena con una mezcla de datos que incluye código, texto técnico y datos de instrucciones, aunque no se proporcionan cifras exactas del número de tokens ni de la composición del dataset. No se menciona explícitamente el uso de RLHF o DPO en la documentación, aunque el modelo está orientado a seguir instrucciones y soporta un formato de chat con plantilla específica.

## Capacidades

- Generación de código: produce código en múltiples lenguajes de programación, con formato correcto y explicaciones detalladas cuando se solicita.
- Completado de código (infilling): soporta la modalidad de completado de código en medio de un fragmento, utilizando una sintaxis especial con tokens `<|code_suffix|>`, `<|code_prefix|>` y `<|code_middle|>`.
- Generación de código a partir de instrucciones en lenguaje natural, con soporte de modos como `BLOCK` o `LINE`.
- Soporte de function calling: el modelo puede invocar funciones externas, lo que lo hace adecuado para integrarse en agentes de software.
- Capacidades de agente: puede manejar tareas de múltiples pasos, como la ejecución de un intérprete de código, búsqueda web y preguntas y respuestas a nivel de repositorio.
- Preguntas y respuestas sobre código a nivel de repositorio: puede comprender y responder sobre el contenido de un repositorio completo, no solo de un archivo individual.
- Multilingüe: aunque se centra en chino e inglés, puede manejar código de muchos lenguajes de programación.
- Conversación multi-turno: soporta chat con memoria de contexto de hasta 128K tokens.

## Casos de uso

- Asistente de programación integrado en IDE: se puede desplegar como un servicio local o en la nube para sugerir completados de código en tiempo real, utilizando la capacidad de infilling con el contexto del archivo y del proyecto.
- Generación de código en producción: gracias al soporte de function calling, se puede integrar en pipelines de CI/CD para generar automáticamente tests, documentación o incluso parches de código a partir de descripciones de tareas.
- Agente de desarrollo autónomo: con su capacidad de interpretar y ejecutar código (code interpreter) y de realizar búsquedas web, puede actuar como un agente que resuelve incidencias de un repositorio, propone cambios y los explica.
- Preguntas y respuestas sobre bases de código: se puede usar para construir un bot que responde a preguntas de los desarrolladores sobre el código de un proyecto concreto, usando la ventana de contexto de 128K para analizar el repositorio.
- Generación de documentación técnica: dado que el modelo puede entender el código y el texto, se puede usar para generar automáticamente documentación de APIs, comentarios de código y guías de uso.
- Educación y aprendizaje de programación: se puede emplear como tutor de programación que explica conceptos, revisa ejercicios y proporciona retroalimentación, gracias a su capacidad de seguir instrucciones y generar explicaciones detalladas.

## Benchmarks y rendimiento

Los resultados de benchmarks se publican en la model card del modelo original (THUDM/codegeex4-all-9b). Se presentan en la siguiente tabla comparativa con otros modelos de código de mayor tamaño:

| Modelo | Longitud de secuencia | HumanEval | MBPP | NCB | LCB | HumanEvalFIM | CRUXEval-O |
|---|---|---|---|---|---|---|---|
| Llama3-70B-instruct | 8K | 77.4 | 82.3 | 37.0 | 27.4 | - | - |
| DeepSeek Coder 33B Instruct | 16K | 81.1 | 80.4 | 39.3 | 29.3 | 78.2 | 49.9 |
| Codestral-22B | 32K | 81.1 | 78.2 | 46.0 | 35.3 | 91.6 | 51.3 |
| CodeGeeX4-ALL-9B | 128K | 82.3 | 75.7 | 40.4 | 28.5 | 85.0 | 47.1 |

Estos resultados indican que CodeGeeX4-ALL-9B supera a modelos de mayor tamaño como Llama3-70B y DeepSeek Coder 33B en HumanEval, aunque es inferior a Codestral-22B en benchmarks como NCB, LCB y CRUXEval-O. La ventaja principal es su tamaño reducido, que permite una inferencia más rápida y un menor consumo de VRAM.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 ocupa aproximadamente 18.8 GB de memoria, por lo que se recomienda una GPU con al menos 20 GB de VRAM para una inferencia cómoda en fp16/bf16.
- GPU recomendadas: para una ejecución completa en bf16, se recomiendan GPUs como la NVIDIA RTX 4090 (24 GB) o la A100 (40 GB o 80 GB). Para despliegues en producción, una A100 de 40 GB es suficiente.
- En cuanto a cuantización: las conversiones GGUF de la comunidad (por ejemplo, en local-ai-zone) ofrecen versiones de 2.95 GB, lo que permite ejecutar el modelo en GPUs de consumo con 4-6 GB de VRAM, aunque con una pérdida de calidad.
- Opciones de despliegue: se puede servir con vLLM, llama.cpp (con los GGUF), Ollama, o directamente con Transformers (se requiere `trust_remote_code=True`). También se puede usar con el framework de Hugging Face TGI.
- Latencia y throughput: no se dispone de datos de latencia concretos, pero por su tamaño (9.4 B) es significativamente más rápido que modelos de 22B o 70B, y puede ejecutarse en tiempo real en una GPU de gama alta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | HumanEval | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CodeGeeX4-ALL-9B | 9.4 B | 128K | 82.3 | CodeGeeX4 (restrictiva) | HuggingFace |
| Codestral-22B | 22 B | 32K | 81.1 | Mistral AI Non-Production | HuggingFace |
| DeepSeek Coder 33B Instruct | 33 B | 16K | 81.1 | DeepSeek License | HuggingFace |
| Llama3-70B-Instruct | 70 B | 8K | 77.4 | Llama 3 License | HuggingFace |

CodeGeeX4-ALL-9B ofrece un rendimiento superior en HumanEval a modelos de mayor tamaño, y su ventaja clave es su contexto de 128K, muy superior a los 8K de Llama3-70B o los 16K de DeepSeek Coder 33B. Sin embargo, su licencia es más restrictiva que la de otros modelos, y en benchmarks como NCB o LCB se queda por detrás de Codestral-22B.

## Limitaciones y advertencias

- Licencia: la licencia `codegeex4` es una licencia personalizada, no OSI, que puede restringir el uso comercial. Es necesario revisar los términos exactos en el enlace de la licencia.
- Sesgos lingüísticos: el modelo está entrenado principalmente en chino e inglés, y su rendimiento en otros idiomas puede ser limitado.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar código incorrecto o alucinado, especialmente en tareas de razonamiento complejo o en contextos no vistos durante el entrenamiento.
- Limitaciones de contexto: aunque la ventana es de 128K, el rendimiento puede degradarse con contextos muy largos, y la memoria requerida para el procesamiento de secuencias largas es alta.
- Dependencia de la configuración: para usar el modelo con Transformers se requiere `trust_remote_code=True`, lo que implica ejecutar código del repositorio, lo que puede suponer un riesgo de seguridad en entornos de producción.
- No se han publicado resultados de benchmarks adicionales (como GSM8K, MMLU, etc.) en la información proporcionada, por lo que no se puede evaluar su rendimiento fuera de los benchmarks de código.

## Enlaces

- HuggingFace (repositorio de la comunidad): https://huggingface.co/manaladan6/codegeex4-all-9b
- HuggingFace (repositorio original de Zhipu AI): https://huggingface.co/THUDM/codegeex4-all-9b
- GitHub oficial: https://github.com/THUDM/CodeGeeX4
- GitHub (organización zai-org): https://github.com/zai-org/CodeGeeX4
- Licencia del modelo: https://huggingface.co/THUDM/codegeex4-all-9b/blob/main/LICENSE
- Página de descarga GGUF (comunidad): https://local-ai-zone.github.io/models/codegeex4-all-9b.html
