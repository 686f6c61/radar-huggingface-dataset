# prashim98/GLM-5.2

## Resumen

GLM-5.2 es el modelo insignia de Z.ai (anteriormente Zhipu AI) para tareas de horizonte largo. Se trata de un modelo de texto puro con arquitectura Mixture-of-Experts (MoE) de 753.000 millones de parámetros totales y aproximadamente 40.000 millones de parámetros activos. Su principal innovación es un contexto sólido de 1 millón de tokens que permite mantener tareas de larga duración de forma estable, algo que su predecesor GLM-5.1 no ofrecía de manera fiable.

El modelo introduce la arquitectura IndexShare, que reutiliza el mismo indexador en cada cuatro capas de atención dispersa, reduciendo los FLOPs por token en 2,9 veces a una longitud de contexto de 1M. También mejora la capa MTP (Multi-Token Prediction) para decodificación especulativa, aumentando la longitud de aceptación hasta un 20%. GLM-5.2 se distribuye bajo licencia MIT sin restricciones regionales, lo que lo convierte en una opción atractiva para despliegues comerciales, e incluye control de niveles de esfuerzo (effort levels) para equilibrar capacidad y latencia.

La versión alojada en HuggingFace bajo el identificador prashim98/GLM-5.2 es una subida de la comunidad; el repositorio oficial del proyecto se encuentra en github.com/zai-org/GLM-5.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención dispersa e IndexShare |
| Parámetros totales | 753.329.940.480 (753B) |
| Parámetros activos | ~40B |
| Longitud de contexto | 1.000.000 tokens (1M) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés, chino |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

GLM-5.2 es un modelo de texto puro con arquitectura MoE. La innovación principal es IndexShare, que reutiliza el mismo indexador en cada cuatro capas de atención dispersa, reduciendo los FLOPs por token en 2,9 veces a una longitud de contexto de 1M. También incorpora una capa MTP (Multi-Token Prediction) mejorada para decodificación especulativa, que aumenta la longitud de aceptación hasta un 20%.

El modelo soporta niveles de esfuerzo configurables (effort levels) que permiten al usuario equilibrar capacidad de razonamiento frente a latencia y coste computacional. No se han publicado detalles sobre el dataset de entrenamiento, el número de tokens o el proceso de alineación (RLHF/DPO) en la información disponible.

## Capacidades

- Generación de texto y razonamiento avanzado, con puntuaciones destacadas en benchmarks de razonamiento como HLE (40,5) y GPQA-Diamond (91,2).
- Razonamiento matemático de alto nivel: 99,2 en AIME 2026, 94,4 en HMMT Nov. 2025 y 91,0 en IMOAnswerBench.
- Codificación agente (agentic coding) con soporte para tareas de desarrollo completas: 62,1 en SWE-bench Pro, 48,9 en NL2Repo y 46,2 en DeepSWE.
- Tool calling / function calling, con 54,7 en HLE con herramientas.
- Soporte de agentes y razonamiento multi-paso, incluyendo operación en terminal (81,0 en Terminal-Bench 2.1).
- Control de niveles de esfuerzo (effort levels) para equilibrar rendimiento y latencia según la tarea.
- Contexto largo de 1M tokens para tareas de horizonte largo.
- Capacidades multilingües en inglés y chino.

## Casos de uso

- Desarrollo de software a escala de repositorio: con 62,1 en SWE-bench Pro y 48,9 en NL2Repo, GLM-5.2 puede abordar repositorios completos, generando código que cumple especificaciones de proyecto y manteniendo coherencia a lo largo de tareas de desarrollo extensas gracias a su contexto de 1M tokens.
- Agentes autónomos de terminal: con 81,0 en Terminal-Bench 2.1, el modelo puede operar en entornos de terminal ejecutando comandos, gestionando archivos y resolviendo tareas de administración de sistemas de forma autónoma.
- Razonamiento matemático y científico: con 99,2 en AIME 2026 y 91,2 en GPQA-Diamond, es adecuado para resolver problemas matemáticos avanzados y preguntas científicas de nivel experto en entornos educativos o de investigación.
- Automatización de flujos de trabajo con MCP: con 76,8 en MCP-Atlas, puede integrarse en arquitecturas de Model Context Protocol para orquestar herramientas externas y servicios en pipelines de automatización.
- Asistencia en investigación y análisis de documentos largos: su contexto de 1M tokens permite procesar documentos extensos, informes técnicos o codebases completos en una sola pasada, facilitando tareas de análisis y síntesis.
- Refactorización y mantenimiento de código legacy: la combinación de contexto largo y capacidades de codificación permite analizar sistemas heredados, identificar patrones y generar refactorizaciones con conocimiento del contexto completo del proyecto.

## Benchmarks y rendimiento

| Benchmark | GLM-5.2 | GLM-5.1 | Qwen3.7-Max | DeepSeek-V4-Pro | Claude Opus 4.8 | GPT-5.5 | Gemini 3.1 Pro |
|---|---|---|---|---|---|---|---|
| HLE | 40,5 | 31 | 41,4 | 37,7 | 49,8* | 41,4* | 45 |
| HLE (con herramientas) | 54,7 | 52,3 | 53,5 | 48,2 | 57,9* | 52,2* | 51,4* |
| AIME 2026 | 99,2 | 95,3 | 97 |
