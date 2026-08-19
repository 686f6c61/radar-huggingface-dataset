# NoxNotreve/Qwen2.5-Coder-14B-Instruct-GGUF

## Resumen

Qwen2.5-Coder-14B-Instruct es un modelo de lenguaje de 14,7 mil millones de parámetros (13,1 B no-embebidos) especializado en generación, razonamiento y corrección de código, desarrollado por Alibaba Cloud. Esta versión concreta es una cuantización en formato GGUF del modelo instruct original, publicada por el usuario NoxNotreve, pensada para ejecución local con llama.cpp y herramientas compatibles. El modelo se construye sobre la arquitectura Qwen2.5 y se entrena con 5,5 billones de tokens que combinan código fuente, datos de anclaje texto-código y datos sintéticos, lo que le confiere competencias tanto en programación como en matemáticas y razonamiento general.

Su relevancia actual radica en ofrecer una alternativa de código abierto de tamaño medio (14B) con una ventana de contexto de 32.768 tokens (ampliable a 131.072 mediante YARN en vLLM), lo que permite abordar tareas de desarrollo complejas y de contexto largo sin necesidad de hardware de gama alta. La licencia Apache 2.0 permite uso comercial sin restricciones, y su disponibilidad en GGUF facilita el despliegue en entornos locales con CPU o GPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con RoPE, SwiGLU, RMSNorm y bias QKV |
| Parametros totales | 14.770.033.664 (14,7 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.768 tokens (extensible a 131.072 con YARN en vLLM) |
| Tipos de cuantizacion | q2_K, q3_K_M, q4_0, q4_K_M, q5_0, q5_K_M, q6_K, q8_0 |
| Idiomas soportados | Inglés (el código es agnóstico de idioma) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivos .gguf, posiblemente divididos en segmentos) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura transformer causal con 48 capas, atención de consultas agrupadas (GQA) con 40 cabezas de consulta y 8 de clave-valor, y utiliza incrustaciones posicionales rotatorias (RoPE). La activación SwiGLU y la normalización RMSNorm son estándar en la familia Qwen. El entrenamiento se realizó en dos fases: pretraining sobre 5,5 billones de tokens que incluyen código fuente, datos de anclaje texto-código y datos sintéticos, seguido de un ajuste fino por instrucciones (post-training) para el modelo Instruct. No se menciona el uso de RLHF o DPO en la información disponible, aunque el modelo base Qwen2.5 ha incorporado técnicas de alineación en su desarrollo general.

La innovación principal de esta familia es su enfoque específico para código, que combina la capacidad de generar y razonar sobre código con un fuerte rendimiento en matemáticas y tareas generales, manteniendo una ventana de contexto larga (32 K nativos, 128 K con extrapolación YARN). La versión GGUF aquí descrita no añade cambios arquitectónicos adicionales, solo cuantiza los pesos para reducir el tamaño y facilitar la ejecución en hardware limitado.

## Capacidades

- Generación de código en múltiples lenguajes de programación (Python, Java, C++, JavaScript, etc.) a partir de descripciones en lenguaje natural.
- Razonamiento y depuración de código: identificación de errores, sugerencias de corrección y explicaciones de fragmentos.
- Soporte de contexto largo (hasta 32K tokens nativos), útil para repositorios completos o documentación extensa.
- Capacidades matemáticas y de razonamiento general, manteniendo la calidad de Qwen2.5 en tareas no relacionadas con código.
- Adecuado para uso como agente de código (code agent) en flujos de trabajo de desarrollo, aunque la información de esta versión no detalla soporte específico de tool calling o function calling.
- Ejecución eficiente en entornos locales gracias al formato GGUF, compatible con llama.cpp, Ollama y otros motores.

## Casos de uso

- Asistente de programación en IDE: el modelo puede completar funciones, generar pruebas unitarias o sugerir implementaciones mientras el desarrollador escribe, gracias a su capacidad de generar código coherente y su contexto de 32K tokens para mantener el historial del proyecto.
- Revisión de código automatizada: integrar el modelo en pipelines de CI/CD para analizar cambios de código, detectar posibles errores y proponer mejoras, reduciendo el tiempo de revisión manual.
- Generación de documentación técnica: a partir de fragmentos de código o descripciones de APIs, el modelo puede generar comentarios, guías y documentación de referencia.
- Tutor de programación: explicar conceptos complejos, resolver dudas de código y proporcionar ejemplos prácticos en un entorno educativo o de autoevaluación.
- Creación de scripts de automatización: dado un objetivo en lenguaje natural, el modelo puede generar scripts de shell, Python o PowerShell para tareas de administración de sistemas.
- Análisis de repositorios heredados: con una ventana de contexto de 32K, puede procesar archivos grandes o múltiples archivos para comprender la lógica de un proyecto y asistir en su refactorización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos en la información disponible para esta versión GGUF. Los desarrolladores originales (Qwen) reportan evaluaciones en su blog oficial para los modelos Qwen2.5-Coder, pero no se detallan aquí. Para consultar métricas como MMLU, HumanEval o GSM8K, se remite a la documentación de Qwen: [blog](https://qwenlm.github.io/blog/qwen2.5-coder-family/).

## Requisitos de hardware

- No se especifican requisitos de VRAM concretos en la información proporcionada. Al ser un modelo GGUF, la memoria necesaria depende de la cuantización elegida y de la longitud del contexto.
- Para cuantizaciones comunes (q4_K_M, q5_K_M), el tamaño del archivo ronda entre 8 y 10 GB, por lo que puede ejecutarse en GPU con 8-12 GB de VRAM (por ejemplo, RTX 3080, RTX 4070) o incluso en CPU con suficiente RAM.
- Para cuantizaciones más ligeras (q2_K, q3_K_M), el modelo podría caber en GPU de 6-8 GB, aunque con menor calidad.
- El despliegue puede realizarse con llama.cpp (incluido el comando `llama-cli`), Ollama, vLLM (para la versión no GGUF con YARN) o TGI, entre otros.
- La latencia y el throughput no están documentados en esta carpeta; dependen del hardware y del motor de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-Coder-14B-Instruct (GGUF) | 14,7 B | 32K (128K con YARN) | Apache 2.0 | GGUF | Modelo de esta ficha |
| Qwen2.5-Coder-7B-Instruct | 7,6 B | 32K (128K con YARN) | Apache 2.0 | Safetensors/GGUF | Versión más ligera de la misma familia |
| DeepSeek-Coder-6.7B-Instruct | 6,7 B | 16K | MIT | Safetensors/GGUF | Competidor directo en tamaño pequeño |
| CodeLlama-13B-Instruct | 13 B | 16K | Llama 2 License | Safetensors/GGUF | Modelo de Meta con restricciones de uso comercial |

No se dispone de datos de benchmarks comparativos en la información consultada, por lo que la tabla se limita a características técnicas. Para una evaluación de rendimiento, se recomienda consultar los blogs oficiales de cada familia.

## Limitaciones y advertencias

- Sesgos y alucinaciones: como cualquier modelo de lenguaje, puede generar código incorrecto o inventar funciones inexistentes, especialmente en casos poco comunes.
- Dominio lingüístico: el modelo está entrenado principalmente con texto en inglés; la generación de código funciona bien en cualquier idioma, pero las explicaciones y comentarios generados pueden ser menos precisos en otros idiomas.
- Contexto limitado a 32K tokens de forma nativa: para ventanas de 128K es necesario usar vLLM con YARN, lo que puede afectar al rendimiento en algunos entornos.
- Dependencia de la cuantización: las versiones GGUF de menor precisión (q2_K, q3_K) pueden degradar notablemente la calidad de generación y razonamiento.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base está entrenado con datos que pueden incluir contenido con derechos de autor; es responsabilidad del usuario verificar el cumplimiento legal en su aplicación.
- No se ha confirmado soporte nativo de function calling o tool calling en esta versión; si se necesita integración con agentes, se debe evaluar el modelo original o la documentación de Qwen.

## Enlaces

- Repositorio de HuggingFace (esta versión GGUF): https://huggingface.co/NoxNotreve/Qwen2.5-Coder-14B-Instruct-GGUF
- Repositorio original de Qwen (modelo base): https://huggingface.co/Qwen/Qwen2.5-Coder-14B-Instruct-GGUF
- Blog oficial de Qwen sobre la familia Qwen2.5-Coder: https://qwenlm.github.io/blog/qwen2.5-coder-family/
- Código fuente en GitHub: https://github.com/QwenLM/Qwen2.5-Coder
- Documentación de Qwen (incluye guía de llama.cpp): https://qwen.readthedocs.io/en/latest/
- Artículo técnico (arXiv): https://arxiv.org/abs/2409.12186
- Paper de Qwen2 (arXiv): https://arxiv.org/abs/2407.10671
