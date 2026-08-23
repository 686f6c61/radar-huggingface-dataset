# Jamil82/BDCoderAI-600M

## Resumen

BDCoderAI-600M es un modelo de lenguaje de tipo decoder-only con aproximadamente 600 millones de parámetros, desarrollado por Jamil82 (Jamil Hossain). Está orientado a tareas de procesamiento de texto en bengalí (Bangla) y su variante híbrida Banglish (mezcla de bengalí e inglés), así como a asistencia en programación y a la construcción de agentes de código. El proyecto se presenta como un componente de un sistema de agente que externaliza la planificación, el uso de herramientas y la verificación fuera del modelo base. Aunque la arquitectura sigue el estilo GPT con mejoras como RoPE, RMSNorm, SwiGLU y GQA, el autor advierte que no alcanza la calidad de los modelos de frontera de varios miles de millones de parámetros. El modelo se encuentra en una fase inicial: publicado en agosto de 2026, cuenta con cero descargas y cero likes, y su documentación es mínima.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT, con RoPE, RMSNorm, SwiGLU, GQA y embeddings atados |
| Parametros totales | ~600 millones |
| Parametros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo safetensors sin cuantizar) |
| Idiomas soportados | Bangla, Banglish, y lenguajes de programacion (Python, JavaScript, TypeScript, HTML, CSS, JSON, Bash, C/C++, C#) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura de transformer decoder-only inspirada en GPT, con normalización RMSNorm, activación SwiGLU, atención multi-consulta agrupada (GQA) y embeddings atados. El tokenizador es un SentencePiece de 32.000 subpalabras, descargado del checkpoint público `csebuetnlp/banglat5` en lugar de entrenarse desde cero, para garantizar fiabilidad. El objetivo de preentrenamiento es de 5.000 millones de tokens, divididos en 2.000 millones de textos en bengalí y Banglish, y 3.000 millones de datos de código y web. El entrenamiento cubre los lenguajes de programación mencionados. El autor menciona un diseño híbrido MoE/contexto inspirado en GLM en el archivo `ARCHITECTURE.md`, pero no se proporcionan detalles técnicos adicionales. No hay información pública sobre el proceso de entrenamiento (número de pasos, optimizador, hardware, etc.) ni sobre técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto en bengalí y Banglish.
- Generación de código en Python, JavaScript, TypeScript, HTML, CSS, JSON, Bash, C/C++ y C#.
- Diseñado para integrarse en un flujo de agente: planificación, uso de contexto de proyecto, memoria, herramientas y prueba en sandbox.
- Seguimiento de instrucciones mediante un pipeline explícito: entender, aclarar si es necesario, planificar, usar herramientas, probar/verificar y responder.
- El autor menciona que el modelo es compatible con técnicas de LoRA, PEFT y SFT.
- No se documentan capacidades de visión, audio, ni tool calling nativo (las herramientas se gestionan externamente en el agente).

## Casos de uso

- Asistente de programación para desarrolladores que trabajan en bengalí o Banglish: puede generar fragmentos de código y explicaciones en el idioma nativo del usuario.
- Generación de scripts y automatizaciones para tareas de administración de sistemas, usando Bash o Python.
- Componente de un agente de desarrollo que planifica, ejecuta y verifica cambios en un repositorio, con la lógica de herramientas y sandbox externa al modelo.
- Traducción de comentarios y documentación de código entre inglés y bengalí, gracias a su entrenamiento en ambos idiomas.
- Prototipado rápido de funciones o algoritmos en los lenguajes soportados, útil para pruebas de concepto.
- Herramienta de aprendizaje de programación para estudiantes de habla bengalí, que pueden interactuar en su idioma nativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar.

## Requisitos de hardware

- No se proporcionan datos oficiales de VRAM, latencia ni throughput.
- Estimación general para un modelo de 600M de parámetros: en FP32 requiere aproximadamente 2,4 GB de VRAM, en FP16 1,2 GB y en INT8 0,6 GB. Sin embargo, el repositorio solo contiene safetensors sin cuantizar, por lo que se recomienda una GPU con al menos 4 GB de VRAM para FP32.
- Puede ejecutarse en GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Opciones de despliegue: llama.cpp, vLLM, Hugging Face Transformers, pero no se ha verificado compatibilidad con estas herramientas.
- Al ser un modelo pequeño, la latencia de inferencia será baja en GPUs modernas, pero no hay medidas concretas.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (tamaño ~600M y orientación bengalí/código). No hay datos públicos de comparación con otros modelos como CodeGPT, GPT-2 o modelos de código de tamaño similar.

## Limitaciones y advertencias

- El propio autor advierte que el modelo no tendrá la calidad general de razonamiento y generación de código de los modelos de frontera de miles de millones de parámetros.
- El entrenamiento con solo 5B tokens es limitado, lo que puede provocar alucinaciones, errores de sintaxis y falta de robustez en tareas complejas.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial o modificación.
- No se documenta la longitud máxima de contexto, por lo que no se puede asegurar un rendimiento correcto en conversaciones o documentos largos.
- El proyecto está en una fase muy temprana (cero descargas, cero likes) y no hay evidencia de pruebas externas ni validación.
- El flujo de agente depende de componentes externos (herramientas, sandbox) que no forman parte del modelo base; su integración requiere desarrollo adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Jamil82/BDCoderAI-600M
- Perfil del autor: https://huggingface.co/Jamil82
- Modelo relacionado del mismo autor (1B): https://huggingface.co/Jamil82/bdcoderAI-1b

No se han encontrado papers, blogs ni demos oficiales.
