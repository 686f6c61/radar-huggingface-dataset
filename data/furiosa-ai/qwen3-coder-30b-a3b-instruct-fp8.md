# furiosa-ai/Qwen3-Coder-30B-A3B-Instruct-FP8

## Resumen

El modelo `furiosa-ai/Qwen3-Coder-30B-A3B-Instruct-FP8` es una adaptación del modelo Qwen3-Coder-30B-A3B-Instruct-FP8 de Qwen, empaquetado por FuriosaAI para ejecutarse en su hardware RNGD mediante el motor Furiosa-LLM. Se trata de un transformer autorregresivo de arquitectura Mixture-of-Experts (MoE) con 30.532.122.624 parámetros totales, de los cuales aproximadamente 3.300 millones se activan por token. Está optimizado para tareas de codificación agéntica, generación de código, comprensión a escala de repositorio y uso de herramientas, y opera únicamente en modo no-thinking.

La relevancia de esta versión radica en que FuriosaAI ha precompilado los pesos en FP8 y ha generado un Furiosa Executable Bundle (FXB) que permite desplegar el modelo en sus aceleradores RNGD con un rendimiento optimizado, manteniendo la compatibilidad con la API OpenAI. El modelo base, desarrollado por Qwen, se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial. Aunque el bundle FXB está pensado para hardware Furiosa, el modelo original también puede ejecutarse en otros frameworks como vLLM, SGLang o Transformers.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3-MoE (Mixture-of-Experts) transformer autorregresivo |
| Parametros totales | 30.532.122.624 (30,5 B) |
| Parametros activos | ~3,3 B por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (pesos estáticos, activaciones dinámicas; KV cache en 16 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, FXB (Furiosa Executable Bundle) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3-MoE, un transformer autorregresivo con mezcla de expertos. De los 30,5 B parámetros totales, solo unos 3,3 B se activan por token, lo que reduce el coste computacional en inferencia. La variante `Instruct` está ajustada para seguir instrucciones y para tareas de codificación, incluyendo generación de código, comprensión de repositorios y uso de herramientas. Según la documentación de FuriosaAI, el modelo opera únicamente en modo no-thinking, es decir, sin la cadena de razonamiento explícita que ofrecen otras variantes de Qwen3.

En cuanto al entrenamiento, la información proporcionada no incluye detalles sobre el dataset, el número de tokens utilizados ni si se aplicaron técnicas como RLHF o DPO. La cuantización FP8 es estática para los pesos y dinámica para las activaciones (por token y por bloque), mientras que la caché KV se mantiene en precisión de 16 bits. Esta configuración es la que FuriosaAI ha validado para su hardware RNGD.

## Capacidades

- Generación de código en múltiples lenguajes de programación, orientada a tareas de desarrollo y depuración.
- Comprensión a escala de repositorio, lo que permite analizar estructuras de proyectos y generar código coherente con el contexto existente.
- Tool calling (llamada a funciones) mediante el parser `hermes`, el mismo utilizado por la serie Qwen3. Permite que el modelo decida cuándo invocar herramientas externas.
- Soporte para agentes de codificación, gracias a su capacidad de razonamiento multi-paso y uso de herramientas.
- Conversación multi-turno, al ser un modelo instructivo entrenado para diálogo.
- Modo no-thinking: genera respuestas directas sin razonamiento explícito, lo que reduce la latencia en tareas de codificación.
- Compatibilidad con la API OpenAI a través del servidor Furiosa-LLM, lo que facilita la integración en aplicaciones existentes.

## Casos de uso

- Asistente de programación en IDE: el modelo puede integrarse en editores como VS Code para ofrecer autocompletado, sugerencias de refactorización y explicaciones de código. Su capacidad de comprensión de repositorios permite que las sugerencias tengan en cuenta el contexto del proyecto.
- Agente de codificación autónomo: gracias al soporte de tool calling, puede ejecutar comandos, leer archivos y modificar código de forma iterativa, actuando como un agente que resuelve tareas de desarrollo de principio a fin.
- Generación de código en pipelines de CI/CD: puede utilizarse para generar pruebas unitarias, documentación o fragmentos de código a partir de descripciones en lenguaje natural, integrándose en flujos de integración continua.
- Revisión de código automatizada: el modelo puede analizar pull requests, detectar posibles errores, sugerir mejoras y generar comentarios de revisión, aprovechando su capacidad de comprensión de repositorios.
- Chatbot técnico de soporte: puede responder preguntas sobre APIs, librerías o lenguajes de programación, manteniendo conversaciones multi-turno con contexto largo (aunque la longitud exacta de contexto no se ha especificado en la documentación disponible).
- Prototipado rápido de aplicaciones: los desarrolladores pueden describir una funcionalidad en lenguaje natural y obtener un esqueleto de código funcional, acelerando la fase de prototipado.
- Automatización de tareas de mantenimiento: puede generar scripts para migraciones de bases de datos, actualizaciones de dependencias o limpieza de código, reduciendo el trabajo manual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card de FuriosaAI no incluye métricas como MMLU, HumanEval o GSM8K, y tampoco se proporcionan comparativas con otros modelos. Se recomienda consultar la documentación del modelo base Qwen3-Coder-30B-A3B-Instruct para obtener datos de rendimiento en tareas de codificación.

## Requisitos de hardware

- El bundle FXB está diseñado exclusivamente para hardware FuriosaAI RNGD. Según la documentación, el modelo se ejecuta con un tamaño de tensor-parallel de 32 PEs, lo que equivale a cuatro tarjetas RNGD (8 PEs por tarjeta).
- El tamaño del repositorio es de 47,6 GB, lo que sugiere que los pesos FP8 ocupan aproximadamente esa cantidad de memoria. No se dispone de datos oficiales de VRAM para otros aceleradores.
- Para ejecutar el modelo en GPUs convencionales (NVIDIA, AMD) se debe utilizar el modelo base de Qwen, no el bundle FXB. En ese caso, se puede emplear vLLM, SGLang o Transformers, pero no se han proporcionado requisitos específicos de VRAM.
- El servidor Furiosa-LLM expone una API compatible con OpenAI, lo que facilita el despliegue en entornos de producción.
- No se han publicado datos de latencia o throughput para este modelo en particular.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Parámetros activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3-Coder-30B-A3B-Instruct-FP8 (este) | 30,5 B | ~3,3 B | no disponible | Apache 2.0 | Hugging Face, bundle FXB para Furiosa |
| Qwen3-Coder-480B-A35B-Instruct | 480 B | ~35 B | no disponible | Apache 2.0 | Hugging Face |
| Qwen3-Coder-Next | no disponible | no disponible | no disponible | no disponible | GitHub / Hugging Face |

La comparativa se limita a aspectos estructurales, ya que no se dispone de datos de rendimiento. El modelo de 480 B ofrece una capacidad mucho mayor pero requiere hardware más potente. Qwen3-Coder-Next está diseñado específicamente para agentes de codificación y desarrollo local, aunque no se han proporcionado sus especificaciones en la información disponible.

## Limitaciones y advertencias

- No se ha especificado la longitud de contexto soportada, lo que puede limitar su uso en tareas que requieran ventanas muy largas, como el análisis de repositorios extensos.
- Los idiomas soportados no están documentados en la model card. Aunque Qwen3 suele ser multilingüe, no se puede confirmar para esta variante.
- El bundle FXB solo funciona en hardware FuriosaAI RNGD. Para otros entornos, es necesario utilizar el modelo base de Qwen, que puede requerir ajustes de cuantización y configuración.
- Al ser un modelo de lenguaje, existe riesgo de alucinación, especialmente en tareas de generación de código donde puede producir código sintácticamente válido pero lógicamente incorrecto.
- No se han publicado evaluaciones de sesgos o comportamientos perjudiciales para esta variante específica.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar los términos del modelo base y de FuriosaAI para asegurar el cumplimiento.
- El modo no-thinking limita la capacidad de razonamiento explícito, lo que puede afectar a tareas que requieran cadenas de pensamiento detalladas.

## Enlaces

- [Modelo en Hugging Face (FuriosaAI)](https://huggingface.co/furiosa-ai/Qwen3-Coder-30B-A3B-Instruct-FP8)
- [Modelo base en Hugging Face (Qwen)](https://huggingface.co/Qwen/Qwen3-Coder-30B-A3B-Instruct)
- [Documentación de Furiosa-LLM para Qwen3-MoE](https://developer.furiosa.ai/latest/en/furiosa_llm/models/qwen3-moe.html)
- [Documentación de Furiosa-LLM para Qwen3 denso](https://developer.furiosa.ai/v2026.3.0/en/furiosa_llm/models/qwen3.html)
- [Repositorio GitHub de Qwen3-Coder](https://github.com/QwenLM/Qwen3-Coder)
