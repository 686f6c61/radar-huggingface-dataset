# mradermacher/Qwen3.8-27B-Yes-Man-uncensored-GGUF

## Resumen

Este repositorio contiene una cuantización GGUF del modelo `Qwen3.8-27B-Yes-Man-uncensored`, creado por el usuario `mradermacher` a partir de un modelo original de `cloudbjorn`. Se trata de una versión "sin censura" del modelo Qwen3.8-27B de Alibaba, ajustada para eliminar restricciones de contenido en las respuestas. El objetivo principal es ofrecer los pesos en formato GGUF para su uso con herramientas de inferencia local como llama.cpp, Ollama o LM Studio.

La relevancia actual de este modelo reside en la demanda de versiones sin censura de modelos de lenguaje de código abierto para aplicaciones de investigación y desarrollo que requieren libertad de expresión sin filtros de seguridad. Sin embargo, hay una inconsistencia grave: el tamaño del repositorio (1.6 GB) y el dato de parámetros totales listado (460.730.096) no corresponden a un modelo de 27B parámetros, sino a un modelo mucho más pequeño. Esto sugiere que el repositorio puede contener solo una cuantización parcial o que los metadatos son erróneos. Se recomienda verificar el modelo original antes de su uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (atención híbrida: 16 de 64 capas con atención full, 48 con atención lineal) |
| Parametros totales | 460.730.096 (según HuggingFace; inconsistente con el nombre "27B") |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (el modelo base Qwen3.8-27B soporta hasta 128K) |
| Tipos de cuantizacion | x-f16, Q4_K_S, Q2_K, Q8_0, Q6_K, Q3_K_M, Q3_K_S, Q3_K_L, Q4_K_M, Q5_K_S, Q5_K_M, IQ4_XS (según comentarios del README) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura base del modelo original es Qwen3.5, un transformer de 27B parámetros que emplea una novedosa mezcla de atención: solo 16 de las 64 capas utilizan atención completa (con intervalo de 4), mientras que las restantes 48 capas usan atención lineal con un estado recurrente constante. Esta hibridación reduce el coste computacional en contextos largos manteniendo la capacidad de modelado.

El proceso de "uncensored" implica un ajuste fino adicional sobre el modelo base, eliminando o reduciendo las capas de rechazo ante prompts sensibles. No se dispone de información sobre el dataset de entrenamiento, el número de tokens o el método de alineación (RLHF, DPO, etc.). El repositorio solo contiene cuantizaciones estáticas del modelo original de `cloudbjorn`, sin documentación técnica adicional.

## Capacidades

- Generación de texto en lenguaje natural, con respuestas sin filtros de contenido (por diseño).
- Razonamiento y resolución de problemas matemáticos y lógicos (capacidad heredada del Qwen3.8 base).
- Generación de código y asistencia en programación.
- Capacidad de procesamiento multimodal (visión) en el modelo base, aunque no se confirma si se conserva en esta cuantización.
- Soporte de tool calling y funciones de agente en el modelo base, pero no verificado en esta versión.
- Capacidades multilingües no confirmadas en esta cuantización.

## Casos de uso

- Experimentación en investigación sobre alineación y seguridad: el modelo permite estudiar los efectos de la eliminación de filtros de seguridad en un LLM de tamaño moderado.
- Generación de contenido creativo sin restricciones: para proyectos de escritura creativa o roleplay donde se requiere libertad temática.
- Despliegue local en entornos con recursos limitados: si el modelo es realmente de 460M parámetros (o incluso 27B cuantizado a 1.6 GB), puede ejecutarse en CPU y GPU de baja capacidad.
- Integración en herramientas de desarrollo como Ollama o llama.cpp para prototipado rápido.
- Análisis de vulnerabilidades de seguridad: para evaluar cómo un modelo sin censura puede generar contenido dañino y diseñar defensas.
- Educación en ingeniería de prompts: para comparar el comportamiento entre versiones censuradas y sin censura del mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye métricas de rendimiento comparativas con otros modelos.

## Requisitos de hardware

- Dado el tamaño del repositorio (1.6 GB), el modelo GGUF puede caber en la RAM de un ordenador portátil o en la VRAM de una GPU con 4-6 GB.
- Si el modelo es en realidad un 27B cuantizado a Q4_K_M (~16.8 GB), necesitaría una GPU con al menos 16 GB de VRAM o una CPU con 32 GB de RAM.
- Se recomienda verificar el archivo GGUF descargado para conocer su tamaño exacto y la cuantización.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, vLLM (para cuantizaciones GGUF no está soportado directamente, pero se puede convertir a otros formatos).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No hay información suficiente para comparar este modelo con alternativas como Qwen3-27B original, Llama 3.1 8B, o otros modelos "uncensored" (por ejemplo, Dolphin). La inconsistencia en los parámetros impide una comparación fiable.

## Limitaciones y advertencias

- El tamaño del repositorio (1.6 GB) y los parámetros listados (460M) son inconsistentes con el nombre "27B". Esto puede deberse a un error de subida o a una cuantización parcial. No se recomienda su uso en producción sin verificar.
- La licencia no está especificada, lo que puede implicar restricciones legales para uso comercial.
- El modelo "uncensored" puede generar contenido dañino, ilegal o éticamente cuestionable. No debe usarse en aplicaciones públicas sin control.
- No se dispone de información sobre sesgos, alucinación o rendimiento real.
- Los idiomas soportados no están documentados; es probable que el modelo base esté entrenado principalmente en inglés y chino.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Qwen3.8-27B-Yes-Man-uncensored-GGUF
- Modelo original de cloudbjorn: https://huggingface.co/cloudbjorn/Qwen3.8-27B-Yes-Man-uncensored
- Repositorio GitHub con instrucciones: https://github.com/Wassimyounes01/qwen38-uncensored
- Página oficial de Qwen3.8-27B en vLLM: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Página en LM Studio: https://lmstudio.ai/models/qwen/qwen3.8-27b
