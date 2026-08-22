# PocketAiHub/Ornith-1.5-9B-Abliterated

## Resumen

El modelo Ornith-1.5-9B-Abliterated es un derivado experimental no oficial del modelo Ornith-1.5-9B, desarrollado por PocketAI Model Lab y publicado por PocketAiHub. El modelo base, creado por el equipo de Ornith AI, es un modelo multimodal de aproximadamente 9.4 mil millones de parámetros basado en la arquitectura Qwen3.5, que extiende el framework de self-scaffolding de Ornith-1.0 hacia un ciclo de auto-mejora: el modelo propone nuevas tareas, genera scaffolds específicos y produce soluciones para entrenamiento con refuerzo. Este derivado ha sido modificado mediante la técnica de abliteración, que elimina las direcciones de rechazo aprendidas en las capas intermedias del modelo, con el objetivo de que responda sin las negativas que el modelo original podría emitir. El repositorio publica la versión en safetensors en precisión BF16, compatible con Transformers, y se distribuye bajo licencia MIT. Es relevante para investigadores que estudian la alineación, la seguridad y el comportamiento de modelos multimodales cuando se suprimen los mecanismos de rechazo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.5 (Qwen3_5ForConditionalGeneration) |
| Parametros totales | 9.409.813.744 (~9.4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | BF16 (safetensors), MLX BF16/8-bit/4-bit, GGUF |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | Safetensors (BF16), MLX, GGUF |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-9B es un modelo denso de ~9.4B parámetros que utiliza la arquitectura Qwen3.5, como indica el uso de la clase `Qwen3_5ForConditionalGeneration` en el código de carga. Según la documentación de Ornith AI, Ornith-1.5 extiende el framework de self-scaffolding introducido en Ornith-1.0 hacia un ciclo de auto-mejora más completo: el modelo propone nuevas tareas, genera scaffolds específicos para cada tarea y produce soluciones para entrenamiento por refuerzo, creando continuamente nuevas experiencias de aprendizaje. El derivado abliterado se obtiene mediante la técnica de abliteración: se identifica una dirección de rechazo en la capa 23 y se elimina de los tensores de salida residual de las capas 12 a 31, modificando un total de 40 tensores. La escala de abliteración es 1.0 y el proceso no incluye el MTP (multi-token prediction) nativo del modelo base. La carga de datos con Transformers se validó correctamente, y las versiones MLX y GGUF recibieron pruebas de humo con entrada de imagen.

## Capacidades

- Modelo multimodal que procesa texto e imagen (image-text-to-text).
- Generación de texto conversacional y respuestas de razonamiento.
- Razonamiento matemático y lógico, codificación, salida estructurada y comprensión de contexto (según la validación interna).
- Generación de texto multilingüe (no se especifican los idiomas concretos).
- Supresión de comportamientos de rechazo aprendidos mediante abliteración, lo que permite respuestas en temas que el modelo base podría rechazar.
- No incluye el MTP nativo, lo que puede afectar la velocidad de inferencia en comparación con el modelo original.

## Casos de uso

- **Investigación en alineación y seguridad**: permite estudiar el efecto de la supresión de rechazos en el comportamiento del modelo, comparando respuestas con el modelo original para diseñar mejores mecanismos de guardrail.
- **Generación de contenido creativo sin censura**: en proyectos de ficción o juegos de rol donde se necesiten respuestas sobre temas tabulados o controversiales, el modelo puede proporcionar texto sin las negativas que el modelo base podría emitir.
- **Prototipado de asistentes conversacionales especializados**: en dominios donde el modelo base rechazaba consultas hipotéticas (por ejemplo, escenarios médicos o legales), este derivado puede generar respuestas preliminares que requieren verificación humana.
- **Evaluación de herramientas de moderación**: sirve como caso de prueba para sistemas de filtrado y moderación de contenido, al generar respuestas que pueden contener contenido no deseado.
- **Análisis de robustez y sesgos**: permite investigar cómo la abliteración afecta la calidad de las respuestas en tareas de razonamiento, codificación y comprensión de contexto.
- **Estudio de técnicas de jailbreak y mitigación**: útil para investigadores que desarrollan defensas contra jailbreaks, ya que el modelo es un entorno controlado con la capa de rechazo eliminada.

## Benchmarks y rendimiento

La model card del derivado incluye una validación interna con los siguientes resultados:

| Gate | Resultado |
|---|---|
| Flags de rechazo explícito dañino | 0/100 |
| Flags de rechazo explícito benigno | 0/100 |
| Suite de capacidades media | 71/80 |
| Runtime smoke | Aprobado |

La suite de capacidades media cubre matemáticas/razonamiento, manejo de premisas falsas, seguimiento de instrucciones, codificación, salida estructurada, salida multilingüe, comprensión de contexto y coherencia general. Además, la plataforma BenchLM asigna al modelo base Ornith-1.5-9B una puntuación pública estimada de 36.9/100 y el puesto #204 de 224, aunque se indica que es una estimación. No se han publicado resultados detallados de benchmarks estándar como MMLU, HumanEval o GSM8K en la información disponible.

## Requisitos de hardware

- En BF16, el modelo ocupa aproximadamente 19 GB de VRAM (el pico de memoria en la prueba de humo fue de 19.05 GB). Se recomienda una GPU con al menos 24 GB de VRAM para inferencia sin cuantización (por ejemplo, RTX 4090, A5000, A10G).
- Una GPU de 80 GB (A100, H100) puede servir el modelo con margen, permitiendo el despliegue con vLLM o TGI.
- Las versiones cuantizadas (GGUF 4-bit, MLX 4-bit) pueden reducir la huella de memoria a entre 8 y 16 GB, lo que las hace ejecutables en GPUs de consumo como RTX 3080, RTX 3090 o RTX 4070.
- Opciones de despliegue: Transformers (Python), vLLM (endpoints compatible), llama.cpp, Ollama (con GGUF), MLX (Apple Silicon).
- La latencia y el throughput no están documentados en la información disponible.

## Comparativa con modelos similares

No se dispone de datos comparativos de este modelo abliterado con otras alternativas de la misma categoría en la información proporcionada. El modelo base Ornith-1.5-9B se basa en la arquitectura Qwen3.5, por lo que podría ser comparable en tamaño con otros modelos de ~9B de la familia Qwen3, pero no se han publicado comparaciones directas. Se recomienda consultar los benchmarks de BenchLM para el modelo base, aunque se trata de estimaciones y no de resultados verificados.

## Limitaciones y adver
