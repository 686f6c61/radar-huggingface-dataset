# OrionLLM/OxCoder-9B

## Resumen

OxCoder-9B es un modelo de lenguaje de 9.409.813.744 parámetros desarrollado por OrionLLM, especializado en tareas de codificación agéntica y razonamiento de largo horizonte. Se construye como un ajuste fino del modelo base Qwen/Qwen3.5-9B y se ha destilado a partir de trazas de agentes de frontera (Fable-5.1 y GLM-5.3) generadas con herramientas como Claude Code, OpenCode y Codex. Su ventana de contexto nativa de 262.144 tokens le permite manejar repositorios multi-archivo y tareas que requieren memoria extensa, una capacidad poco común en modelos de menos de 10.000 millones de parámetros.

El modelo destaca en benchmarks de agentes, superando a modelos de mayor tamaño como Gemma-4-31B en tareas de terminal y SWE-bench, lo que lo convierte en una opción atractiva para entornos de desarrollo automatizado. Su entrenamiento en trazas agénticas le aporta habilidades de recuperación de errores, aplicación de ediciones mínimas y comprensión de diagnósticos LSP, características clave para entornos iterativos de programación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (arquitectura no especificada; modelo base Qwen3.5-9B) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | No disponible |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

OxCoder-9B es un ajuste fino del modelo Qwen/Qwen3.5-9B, por lo que hereda su arquitectura base, aunque no se especifican detalles técnicos adicionales en la información disponible. El entrenamiento se ha realizado a partir de trazas agénticas de los sistemas Fable-5.1 y GLM-5.3, que incluyen trayectorias de agentes de codificación ejecutadas en Claude Code, OpenCode y Codex. Este proceso de destilación tiene como objetivo transferir habilidades de agentes de frontera a un modelo compacto.

Entre las innovaciones técnicas destacadas se encuentran los patrones de lectura antes de escritura (read-before-write), la respuesta a diagnósticos de Language Server Protocol (LSP) y la generación de ediciones mínimas en forma de diffs en lugar de reescrituras completas. Estas técnicas mejoran la robustez del modelo en entornos de codificación iterativos. No se menciona el uso de RLHF ni DPO en la información proporcionada.

## Capacidades

- Generación de texto y código, con especialización en tareas de programación agéntica.
- Razonamiento agéntico y de largo horizonte, capaz de mantener el estado de tareas complejas a lo largo de múltiples pasos.
- Ejecución de comandos de terminal y recuperación de errores, gracias a su entrenamiento con trazas de Claude Code y Codex.
- Comprensión de diagnósticos LSP, lo que permite ajustar código en respuesta a errores de análisis estático.
- Aplicación de ediciones mínimas en forma de diffs, reduciendo el riesgo de introducir regresiones en código existente.
- Razonamiento front-end: comprensión de lógica de UI, arquitectura de componentes y patrones web nativos, poco común en modelos de menos de 10B.
- Manejo de contextos largos de hasta 262.144 tokens, facilitando el análisis de proyectos multi-archivo.
- No se especifica soporte explícito de tool calling en la información disponible.

## Casos de uso

- Agente de terminal autónomo: el modelo puede ejecutar comandos, interpretar salidas y recuperarse de errores, gracias a su entrenamiento en trazas de herramientas como Claude Code y Codex.
- Resolución de issues en repositorios reales: con un contexto de 262.144 tokens, puede analizar múltiples archivos y aplicar parches mínimos para resolver issues, como se demuestra en SWE-bench Verified.
- Asistente de refactorización de código: su habilidad para aplicar ediciones mínimas y leer antes de escribir reduce el riesgo de romper funcionalidades existentes.
- Desarrollo front-end: su razonamiento sobre UI y componentes web permite generar código para interfaces y lógica de componentes en aplicaciones web.
- Integración en pipelines CI/CD: puede actuar como revisor automático de código, respondiendo a diagnósticos de LSP y sugiriendo correcciones.
- Automatización de tareas de mantenimiento: tareas de largo horizonte como actualización de dependencias o migración de código pueden delegarse al modelo.
- Asistente de desarrollo en entornos de desarrollo integrados (IDE): gracias a su capacidad de manejar contexto largo, puede mantener el estado de un proyecto entero.

## Benchmarks y rendimiento

| Benchmark | OxCoder-9B | Ornith-1.5-9B | Ornith-1.0-9B | Qwen3.5-9B | Gemma-4-31B |
|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 49.6 | 46.2 | 43.1 | 21.3 | 42.1 |
| Terminal-Bench 2.1 (Claude Code) | 50.8 | 47.0 | 40.6 | 18.9 | — |
| SWE-bench Verified | 73.5 | 70.6 | 69.4 | 53.2 | 52.0 |
| SWE-bench Pro | 49.1 | 47.5 | 42.9 | 31.3 | 35.7 |

El dato correspondiente a NL2Repo no está disponible en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (fp16): aproximadamente 19 GB para los pesos, más overhead de activaciones; se recomienda al menos 24 GB de VRAM.
- Con cuantización 8-bit: aproximadamente 10 GB de VRAM.
- Con cuantización 4-bit: aproximadamente 6 GB de VRAM.
- GPU recomendadas: A100 40GB o H100 80GB para fp16; RTX 4090 24GB o similar para cuantización 8-bit o 4-bit.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI y Transformers.
- Latencia y throughput: no disponibles en la información proporcionada.

Nota: los valores de VRAM son estimaciones orientativas basadas en el número de parámetros, no datos oficiales del fabricante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | SWE-bench Verified | Licencia |
|---|---|---|---|---|
| OxCoder-9B | 9,4B | 262.144 | 73.5 | Apache 2.0 |
| Qwen3.5-9B | 9B | No disponible | 53.2 | No disponible |
| Gemma-4-31B | 31B | No disponible | 52.0 | No disponible |
| Ornith-1.5-9B | 9B | No disponible | 70.6 | No disponible |

Los datos de contexto y licencia de los modelos comparados no están disponibles en la información proporcionada.

## Limitaciones y advertencias

- Sesgos: no se han documentado sesgos específicos; al estar entrenado sobre trazas de otros modelos, puede heredar sus limitaciones.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar código incorrecto o alucinar APIs.
- Limitaciones de contexto: aunque la ventana es de 262.144 tokens, el rendimiento puede degradarse con contextos muy largos; no se especifica el comportamiento en esos casos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe revisar la atribución requerida.
- Caveats: el modelo no ha sido evaluado en todos los idiomas; la información de idiomas no está disponible.
- No se dispone de información sobre seguridad, alineación ni evaluación de riesgos en la información proporcionada.

## Enlaces

- HuggingFace: https://huggingface.co/OrionLLM/OxCoder-9B
- Perfil de OrionLLM: https://huggingface.co/OrionLLM
