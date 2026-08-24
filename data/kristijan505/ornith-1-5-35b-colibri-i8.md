# kristijan505/Ornith-1.5-35B-colibri-i8

## Resumen

Ornith-1.5-35B es un modelo de lenguaje de la familia Ornith-1.5, desarrollada por Ornith AI con el objetivo de avanzar en la generación de modelos de código abierto mediante un enfoque de auto-mejora (self-improvement). El modelo original es una arquitectura MoE (Mixture of Experts) de 35.000 millones de parámetros totales con 3.000 millones de parámetros activos por token, lo que lo hace eficiente para inferencia en hardware de gama media. La variante aquí descrita, `kristijan505/Ornith-1.5-35B-colibri-i8`, es una cuantización en 8 bits (i8) publicada por un usuario independiente, con licencia MIT y creada en agosto de 2026.

La relevancia de este modelo radica en su enfoque de entrenamiento basado en auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos y produce soluciones, un paradigma que busca reducir la dependencia de datos humanos etiquetados. Está diseñado para tareas de codificación agéntica (agentic coding), con soporte para razonamiento multi-paso y uso de herramientas. La cuantización i8 facilita su despliegue en GPUs de consumo, aunque la información técnica detallada de esta variante concreta es limitada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parámetros totales | 35.000 millones (35B) |
| Parámetros activos | 3.000 millones (3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | i8 (int8) en esta variante; GGUF disponible en la familia |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (variante original), GGUF disponible |

## Arquitectura y entrenamiento

La familia Ornith-1.5 se basa en una arquitectura Transformer con mezcla de expertos (MoE), donde solo 3.000 millones de los 35.000 millones de parámetros se activan por token. Esto permite una inferencia eficiente con una huella de memoria reducida en comparación con un modelo denso del mismo tamaño. El entrenamiento sigue el paradigma de auto-mejora introducido en Ornith-1.0: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce soluciones de forma iterativa, cerrando el bucle de auto-mejora sin intervención humana directa.

La información pública no detalla el número de tokens de entrenamiento ni la composición exacta del dataset. Se sabe que la familia incluye variantes de 397B, 35B y 9B de parámetros, y que el enfoque de auto-mejora se extiende desde el auto-scaffolding de la versión 1.0 a un ciclo completo de auto-mejora en la 1.5. No se ha publicado información sobre el uso de RLHF o DPO en esta familia.

## Capacidades

- Generación de código y programación agéntica: diseñado para tareas de codificación complejas con múltiples pasos.
- Razonamiento de múltiples pasos (multi-step reasoning) para planificar y ejecutar tareas de desarrollo de software.
- Soporte de tool calling / function calling, lo que permite integrarse con entornos de desarrollo y APIs.
- Capacidad de auto-scaffolding: el modelo puede generar sus propias plantillas y estructuras de tareas para resolver problemas.
- Capacidad de auto-mejora: propone nuevas tareas y genera soluciones para mejorar sus propios datos de entrenamiento.
- Multilingüe: la información no especifica idiomas, pero se asume soporte básico de inglés y posiblemente otros idiomas de programación y naturales.

## Casos de uso

- Desarrollo de código en entornos agénticos: el modelo puede actuar como un agente que recibe una descripción de una funcionalidad y genera el código completo, iterando sobre sus propias soluciones mediante tool calling para ejecutar pruebas y corregir errores.
- Automatización de tareas de refactorización: gracias a su capacidad de razonamiento de múltiples pasos, puede analizar un código existente y proponer refactorizaciones con explicaciones de cada cambio.
- Generación de documentación técnica: puede generar comentarios de código, docstrings y documentación de API a partir de código fuente, manteniendo el contexto de la función completa.
- Integración en pipelines de CI/CD: soporta tool calling y puede conectarse a sistemas de integración continua para revisar código, sugerir correcciones y validar cambios de forma automática.
- Asistente de desarrollo en entornos con recursos limitados: la variante i8 de 35B con 3B activos puede ejecutarse en GPUs de consumo como RTX 4090 o incluso en CPUs con suficiente RAM, lo que permite usarlo en entornos de desarrollo sin infraestructura de alto rendimiento.
- Prototipado rápido de agentes de IA: al ser una arquitectura MoE eficiente, permite probar prototipos de agentes de codificación en equipos locales antes de escalar a modelos más grandes como el de 397B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los datos del sitio web de Ornith AI sugieren que los benchmarks auto-reportados rivalizan con modelos comerciales de alto rendimiento, pero un benchmark independiente publicado en Hacker News muestra resultados más modestos para la variante de 35B. No se dispone de cifras concretas de MMLU, HumanEval o GSM8K en las fuentes consultadas.

## Requisitos de hardware

- VRAM estimada para inferencia: para la variante i8, el modelo de 35B con 3B activos requiere aproximadamente 35 GB de VRAM para cargar los pesos completos en 8 bits, aunque la activación de solo 3B por token permite un uso eficiente de memoria durante la generación.
- GPU recomendadas: A100 80GB o H100 para despliegue con margen; en GPUs de consumo, una RTX 4090 (24GB) puede ejecutar la variante GGUF cuantizada a 4 bits o 6 bits, pero no la versión i8 completa sin offloading a CPU.
- Compatibilidad con GPU de consumo: sí, mediante cuantizaciones GGUF (por ejemplo, Q4_K_M) en GPUs de 16-24GB, con degradación de rendimiento y latencia.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (si se publica en su catálogo), TGI (Text Generation Inference), y frameworks de Python como transformers.
- Latencia y throughput: no disponibles en las fuentes; se estima que la versión MoE de 3B activos ofrece un throughput de aproximadamente 50-100 tokens/s en GPU de gama alta, dependiendo de la implementación.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ornith-1.5-35B-A3B (familia) | 35B | 3B | no disponible | MIT | HuggingFace |
| Qwen2.5-32B-A3B | 32B | 3B | 128K | Apache 2.0 | HuggingFace |
| DeepSeek-V2-Lite | 16B | 2.4B | 32K | MIT | HuggingFace |
| Mixtral-8x7B | 47B | 13B | 32K | Apache 2.0 | HuggingFace |

La comparativa es parcial porque no se dispone de datos de rendimiento de Ornith-1.5-35B en benchmarks públicos. Qwen2.5-32B-A3B es un competidor directo en tamaño y arquitectura, con contexto de 128K y licencia Apache 2.0. Mixtral-8x7B tiene más parámetros activos y es más pesado de ejecutar, pero está más consolidado. La ventaja de Ornith es su enfoque de auto-mejora y licencia MIT, pero su ecosistema es menos maduro.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información pública sobre evaluación de sesgos; al ser un modelo de código, los sesgos pueden manifestarse en la generación de código con patrones de estilo o nombres de variables que reflejan el dataset de entrenamiento.
- Riesgo de alucinación: como todo LLM, puede generar código que parece correcto pero no es funcional o contiene errores lógicos; la validación con pruebas es imprescindible en producción.
- Limitaciones de contexto: no se ha publicado la longitud de contexto; si es corta, no será adecuado para tareas que requieran mantener documentos largos o repositorios completos.
- Restricciones de licencia: la licencia MIT permite uso comercial, pero la variante `colibri-i8` es una cuantización de un usuario independiente; se debe verificar que el modelo original también tiene licencia MIT (así es según la model card).
- Caveat de producción: la auto-mejora descrita en la familia puede generar comportamientos no deterministas; se recomienda evaluar exhaustivamente el modelo en el dominio de uso antes de desplegar en sistemas críticos.
- Soporte comunitario limitado: al ser una variante de un usuario con cero descargas, no hay garantía de mantenimiento o corrección de la cuantización.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/kristijan505/Ornith-1.5-35B-colibri-i8
- Modelo original de Ornith AI: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- GGUF del modelo original: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B-GGUF/tree/main
- Sitio web de Ornith AI: https://ornith.ai/
- Guía de modelos de Ornith AI: https://ornith.online/
- Análisis independiente en explainx.ai: https://www.explainx.ai/blog/ornith-1-5-self-improving-open-weight-model-august-2026
