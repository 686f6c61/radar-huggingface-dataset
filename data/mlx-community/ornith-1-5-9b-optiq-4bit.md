# mlx-community/Ornith-1.5-9B-OptiQ-4bit

## Resumen

Ornith-1.5-9B-OptiQ-4bit es una cuantización de precisión mixta del modelo Ornith-1.5-9B, desarrollada por la comunidad MLX (mlx-community) mediante la herramienta mlx-optiq. El modelo base, Ornith-1.5-9B, es un modelo de razonamiento de 9 mil millones de parámetros basado en la arquitectura Qwen3.5, creado por ornith-ai. Esta versión cuantizada reduce el peso en disco de aproximadamente 19 GB (en bf16) a 7 GB, empleando una asignación de bits por capa (4-bit y 8-bit) que mantiene la mayor parte de la precisión en las capas más sensibles, según la receta de cuantización heredada de Ornith-1.0.

La relevancia de este modelo radica en su capacidad para ejecutarse de forma eficiente en hardware Apple Silicon, permitiendo a desarrolladores e investigadores desplegar un modelo de razonamiento avanzado con soporte para contexto largo, function calling y uso de herramientas en entornos locales, sin depender de la nube. Al ser una cuantización específica para MLX, se integra directamente con el ecosistema mlx-lm y puede servirse mediante el comando `optiq serve` para endpoints compatibles con OpenAI y Anthropic.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (dense, 32 capas) |
| Parametros totales | 9B (segun la model card del base) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (no especificado en la informacion) |
| Tipos de cuantizacion | OptiQ mixed-precision: 116 componentes a 4-bit, 134 a 8-bit, group size 64 |
| Idiomas soportados | Ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un transformer denso con 32 capas, derivado de la arquitectura Qwen3.5. Se destaca por su enfoque de auto-mejora (self-improvement): el modelo propone tareas, genera andamios (scaffolds) específicos y produce rollouts de soluciones para aprendizaje por refuerzo, creando continuamente nuevas experiencias de entrenamiento. Sin embargo, la información proporcionada no incluye detalles sobre el conjunto de datos de entrenamiento, el número de tokens o la aplicación de técnicas como RLHF o DPO.

La cuantización OptiQ aplica una asignación de bits por capa basada en la sensibilidad, reutilizando la receta de Ornith-1.0-9B para la misma arquitectura y número de capas, lo que evita un barrido completo. El resultado es un modelo con 116 componentes en 4-bit y 134 en 8-bit, con un tamaño de grupo de 32. Esta técnica mantiene la calidad de los pesos críticos mientras reduce el footprint de memoria.

## Capacidades

- Razonamiento complejo: el modelo está diseñado para tareas de razonamiento de múltiples pasos, incluyendo problemas matemáticos y lógicos.
- Longitud de contexto extendida: soporta contextos largos, aunque el valor exacto no se especifica en la información disponible.
- Function calling y tool use: permite la integración con herramientas externas, lo que facilita la construcción de agentes.
- Capacidades agenticas: puede actuar como agente autónomo, encadenando llamadas a funciones y tomando decisiones basadas en resultados intermedios.
- Multilingüe: solo se indica inglés como idioma soportado.
- Conversacional: adecuado para chatbots y asistentes con diálogos multi-turno.
- Ejecución local en Apple Silicon: optimizado para hardware de Apple (M-series) mediante MLX.

## Casos de uso

- **Asistentes de programación locales**: el modelo puede generar y revisar código, y gracias al soporte de function calling puede ejecutar comandos o llamar a APIs de desarrollo directamente desde el entorno local.
- **Automatización de tareas de agentes**: al soportar tool-use y razonamiento multi-paso, puede orquestar flujos de trabajo como la consulta de bases de datos, la realización de búsquedas web o la interacción con servicios externos.
- **Análisis de documentos extensos**: su capacidad de contexto largo (aunque no cuantificada) permite procesar informes, artículos o contratos completos en una sola pasada, resumiendo o extrayendo información.
- **Prototipado de aplicaciones de razonamiento**: investigadores pueden probar rápidamente técnicas de razonamiento (como chain-of-thought) en un entorno local sin costes de API.
- **Despliegue de endpoints privados**: mediante `optiq serve` se puede levantar un servidor compatible con OpenAI/Anthropic para integrarlo en aplicaciones internas con datos sensibles.
- **Educación y demostraciones**: al ser una cuantización ligera, es adecuado para talleres o demos en equipos con Apple Silicon, mostrando capacidades de razonamiento sin necesidad de GPUs de alto rendimiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **Plataforma**: exclusivamente Apple Silicon (M1, M2, M3 o superiores) gracias al framework MLX.
- **VRAM estimada**: el modelo en disco ocupa 7 GB, por lo que la VRAM necesaria para inferencia ronda los 8-9 GB, dependiendo de la longitud del contexto y el batch. Es factible en Macs con 16 GB de RAM unificada.
- **GPU recomendada**: no aplica GPU dedicada; se ejecuta en la GPU integrada de Apple Silicon.
- **Opciones de despliegue**: mediante `mlx-lm` (load y generate), `optiq serve` para endpoints OpenAI-compatible, o a través de librerías que soporten MLX como `mlx-lm` y `optiq`.
- **Latencia y throughput**: no se proporcionan datos específicos; dependerá del modelo y el hardware, pero al ser un modelo de 9B cuantizado, se espera una generación fluida en Macs de gama media.

## Comparativa con modelos similares

No se dispone de información para realizar una comparativa con otros modelos de la misma categoría (tamaño y tarea). La model card no incluye referencias a modelos alternativos ni benchmarks comparativos.

## Limitaciones y advertencias

- **Precisión reducida por cuantización**: al ser una cuantización mixta 4/8-bit, puede haber una ligera pérdida de calidad en tareas complejas en comparación con el modelo original en bf16.
- **Solo en inglés**: no soporta otros idiomas, lo que limita su uso en aplicaciones multilingües.
- **Contexto no especificado**: no se indica la longitud máxima de contexto, lo que puede suponer un riesgo si se planifica un despliegue que requiera ventanas largas.
- **Riesgo de alucinación**: como cualquier modelo de lenguaje, puede generar información plausible pero incorrecta, especialmente en dominios especializados.
- **Restricciones de licencia**: aunque la licencia es Apache 2.0 (permisiva), el modelo base puede tener restricciones adicionales; se recomienda revisar la licencia de ornith-ai/Ornith-1.5-9B-MLX.
- **Dependencia de MLX**: solo es ejecutable en el ecosistema MLX, no en frameworks estándar como PyTorch o TensorFlow, lo que limita su portabilidad.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/mlx-community/Ornith-1.5-9B-OptiQ-4bit)
- [Modelo base MLX](https://huggingface.co/ornith-ai/Ornith-1.5-9B-MLX)
- [Sitio web de mlx-optiq](https://mlx-optiq.com/)
- [Catálogo de cuantizaciones OptiQ](https://mlx-optiq.com/models)
- [Página oficial de Ornith-1.5](https://ornith.ai/ornith_1_5.html)
- [Ollama - ornith-1.5](https://ollama.com/library/ornith-1.5)
