# aicoder43210/Qwen3.8-2B-Heretic-Max-Q4_K_M-GGUF

## Resumen

El modelo `aicoder43210/Qwen3.8-2B-Heretic-Max-Q4_K_M-GGUF` es una conversión al formato GGUF (cuantización Q4_K_M) del modelo `MihaiPopa-1/Qwen3.8-2B-Heretic-Max`, un modelo de lenguaje de aproximadamente 1.880 millones de parámetros perteneciente a la familia Qwen3.8. Esta familia, desarrollada por Qwen (Alibaba), se caracteriza por incorporar capacidades avanzadas de razonamiento, generación de código y ejecución de tareas agénticas, con una arquitectura basada en Qwen3.5. El sufijo "Heretic-Max" indica que el modelo ha sido procesado con la herramienta Heretic, que aplica una técnica de ablación direccional (también conocida como "abliteration") para eliminar de forma automática el alineamiento de seguridad o censura del modelo original.

Esta versión cuantizada en GGUF está pensada para ejecutarse en entornos de recursos limitados, como dispositivos edge o hardware de gama baja, manteniendo un equilibrio entre tamaño y rendimiento. El modelo es relevante ahora porque ofrece una alternativa ligera y "sin censura" para desarrolladores que necesitan desplegar asistentes de texto con razonamiento y function calling en entornos locales, sin depender de APIs externas ni de las restricciones de seguridad habituales de los modelos comerciales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso, basado en Qwen3.8 (derivado de Qwen3.5) |
| Parámetros totales | 1.881.825.088 (aproximadamente 1.88B) |
| Parámetros activos | No disponible (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | Q4_K_M (GGUF) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M) |

## Arquitectura y entrenamiento
El modelo base `MihaiPopa-1/Qwen3.8-2B-Heretic-Max` se construye sobre la arquitectura de Qwen3.8, que a su vez hereda el diseño de Qwen3.5. Se trata de un transformer denso con atención causal estándar, aunque no se han publicado detalles específicos sobre el número de capas, dimensiones ocultas o mecanismos de atención. Según las etiquetas del repositorio, el modelo fue sometido a un proceso de destilación (distillation), ajuste fino supervisado (SFT) y optimizado para razonamiento y llamada a funciones (function calling). Posteriormente, se aplicó la herramienta *Heretic*, que utiliza ablación direccional (abliteration) para eliminar el alineamiento de seguridad del modelo sin necesidad de post-entrenamiento adicional. No se dispone de información sobre el número de tokens de entrenamiento, composición del dataset ni técnicas específicas como RLHF o DPO.

## Capacidades
- Generación de texto libre en inglés.
- Razonamiento paso a paso y resolución de problemas complejos, gracias a la familia Qwen3.8.
- Soporte de function calling / tool calling, permitiendo integrarse con herramientas externas.
- Capacidades de agente: ejecución de tareas multi-paso de forma autónoma.
- Modelo "sin censura" (uncensored/decensored) gracias al proceso de abliteración, lo que elimina las restricciones de seguridad típicas.
- Optimizado para entornos edge (dispositivos con recursos limitados).
- Capacidades de visión no confirmadas en este modelo (aunque la familia Qwen3.8 incluye modelos con visión, no se especifica para esta versión).

## Casos de uso
- **Asistentes de código en entornos locales**: el modelo puede generar, explicar y depurar código gracias a su entrenamiento en programación y razonamiento. Al ser cuantizado en GGUF, puede integrarse en editores o CLIs en equipos sin GPU dedicada.
- **Automatización de tareas agénticas**: su capacidad de function calling permite construir agentes que consultan APIs, ejecutan scripts o interactúan con bases de datos, todo en un entorno local sin depender de servicios en la nube.
- **Chatbots de atención al cliente sin restricciones**: al no tener alineamiento de seguridad, puede generar respuestas directas incluso en temas sensibles, útil para simulaciones o soporte técnico especializado.
- **Prototipado rápido de herramientas de razonamiento**: para investigaciones de IA, sirve como base para experimentos de razonamiento multi-step sin coste de inferencia elevado.
- **Despliegue en dispositivos de borde (edge)**: con un tamaño de 1.3 GB y una cuantización Q4_K_M, es apto para Raspberry Pi 5, mini PCs o móviles con llama.cpp, para asistentes de voz o texto offline.
- **Generación de contenido creativo sin restricciones**: la ausencia de censura lo hace útil para escritura creativa, narrativa o diálogos que requieren libertad temática, aunque con la advertencia de riesgos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye comparativas de rendimiento con otros modelos, por lo que no es posible presentar métricas como MMLU, HumanEval o GSM8K. Se recomienda evaluar el modelo con los casos de uso específicos antes de desplegarlo en producción.

## Requisitos de hardware
- **VRAM estimada**: con la cuantización Q4_K_M, el archivo pesa aproximadamente 1.3 GB, por lo que la VRAM necesaria para inferencia en GPU es de unos 2 GB (considerando memoria adicional para activaciones y contexto).
- **GPUs compatibles**: puede ejecutarse en GPUs de gama baja como NVIDIA GTX 1650, RTX 3050, RTX 3060 (8 GB), o incluso en GPUs integradas con soporte para CUDA o Vulkan.
- **CPU**: funciona en CPU mediante llama.cpp, con una velocidad de generación de aproximadamente 5-10 tokens/segundo en un procesador moderno (por ejemplo, un Ryzen 5 o Intel i5 de última generación).
- **Opciones de despliegue**: llama.cpp (CLI o servidor), Ollama, vLLM (con soporte GGUF), o cualquier framework que soporte GGUF.
- **Latencia y throughput**: no se dispone de datos concretos, pero para un modelo de 2B cuantizado se espera una latencia de unos 100-200 ms por token en CPU, y menor en GPU.

## Comparativa con modelos similares
Comparación con otros modelos de tamaño similar (1.5B-2B) que también están disponibles en formato GGUF:

| Modelo | Parámetros | Contexto | Licencia | Características |
|---|---|---|---|---|
| Qwen3-2B-Heretic-Max (este modelo) | 1.88B | No disponible | Apache 2.0 | Sin censura, razonamiento, tool calling |
| Qwen2.5-1.5B-Instruct | 1.5B | 32K | Apache 2.0 | Alineado con instrucciones, sin ablación |
| Llama-3.2-1B-Instruct | 1.23B | 128K | Meta Llama 3.2 | Alineado, multilingüe limitado |
| Gemma-2-2B | 2.6B | 8K | Gemma Terms | Alineado, bueno en razonamiento |

La principal diferencia de este modelo es la ausencia de alineamiento de seguridad, lo que permite respuestas sin restricciones, pero también implica mayor riesgo de generar contenido dañino. No se dispone de benchmarks comparativos.

## Limitaciones y advertencias
- **Riesgo de contenido dañino**: al haber eliminado el alineamiento de seguridad, el modelo puede generar contenido ofensivo, violento, ilegal o éticamente problemático. No debe usarse en entornos donde se requiera moderación automática.
- **Idioma**: solo entrenado en inglés, lo que limita su uso en entornos multilingües.
- **Longitud de contexto desconocida**: no se ha especificado la ventana de contexto del modelo base, por lo que puede ser inferior a los 256K de otros modelos Qwen3.8. Se recomienda probar con secuencias cortas.
- **Alucinaciones**: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo.
- **Rendimiento sin benchmarks**: no hay datos de evaluación pública, por lo que la calidad real del modelo no está verificada.
- **Licencia Apache 2.0**: permite uso comercial y modificación, pero el modelo base es una conversión de terceros; se debe verificar la licencia del modelo original `MihaiPopa-1/Qwen3.8-2B-Heretic-Max` (aunque también es Apache 2.0 según el README).

## Enlaces
- HuggingFace del modelo GGUF: [aicoder43210/Qwen3.8-2B-Heretic-Max-Q4_K_M-GGUF](https://huggingface.co/aicoder43210/Qwen3.8-2B-Heretic-Max-Q4_K_M-GGUF)
- Modelo base (original): [MihaiPopa-1/Qwen3.8-2B-Heretic-Max](https://huggingface.co/MihaiPopa-1/Qwen3.8-2B-Heretic-Max)
- Repositorio de la herramienta Heretic: [p-e-w/heretic](https://github.com/p-e-w/heretic)
- Repositorio de Qwen3.8: [QwenLM/Qwen3.8](https://github.com/QwenLM/Qwen3.8)
- Documentación de Qwen3.8 en Unsloth: [unsloth.ai/docs/models/qwen3.8](https://unsloth.ai/docs/models/qwen3.8)
