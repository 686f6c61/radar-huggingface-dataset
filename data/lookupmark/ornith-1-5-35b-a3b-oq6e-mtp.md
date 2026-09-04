# LookUpMark/Ornith-1.5-35B-A3B-oQ6e-mtp

## Resumen

Ornith-1.5-35B-A3B-oQ6e-mtp es una cuantización MLX en 6 bits (oQ6e) del modelo Ornith-1.5-35B-A3B, creada por LookUpMark para ejecutarse en Apple Silicon. El modelo base, desarrollado por el equipo de ornith-ai, es un modelo de Mixture-of-Experts (MoE) con 35.951.822.704 parámetros totales y unos 3.000 millones de parámetros activos por token. Está orientado a agentes de código, trabajo en terminal, uso de herramientas y tareas de software de larga duración.

La cuantización reduce el peso del modelo a 30,1 GB y añade Multi-Token Prediction (MTP) con profundidad especulativa de 3, lo que permite predecir varios tokens por paso de inferencia para reducir la latencia. Este modelo resulta relevante porque ofrece una alternativa de código abierto (licencia MIT) de alto rendimiento que puede ejecutarse localmente en Macs con chips Apple Silicon, sin necesidad de GPU dedicada.

No se especifican la longitud de contexto ni los idiomas soportados en la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) basada en Qwen3.5 y Gemma4 |
| Parámetros totales | 35.951.822.704 (~35,95 mil millones) |
| Parámetros activos | ~3 mil millones (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | MLX 6-bit (oQ6e) con Multi-Token Prediction (MTP, profundidad especulativa 3) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Ornith-1.5-35B-A3B es un MoE que extiende Ornith-1.0, construido sobre Qwen3.5 y Gemma4, mediante un bucle de auto-mejora end-to-end. La arquitectura MoE permite activar solo ~3.000 millones de parámetros por token, lo que reduce el coste computacional de la inferencia sin reducir la capacidad total del modelo. La cuantización MLX 6-bit (oQ6e) con MTP es una innovación técnica que acelera la generación al predecir múltiples tokens por paso, aprovechando las capacidades de los chips Apple Silicon.

No se han proporcionado detalles sobre el dataset de entrenamiento, el número de tokens ni técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional.
- Orientado a agentes de código, trabajo en terminal y uso de herramientas (tool use).
- Soporte de tool calling / function calling, según la descripción del modelo.
- Soporte de agentes y razonamiento multi-paso, implícito en su orientación a tareas de software de larga duración.
- Multi-Token Prediction (MTP) para acelerar la generación.
- Ejecución local en Apple Silicon mediante MLX.

## Casos de uso

- Asistentes de programación en el terminal: el modelo puede integrarse en herramientas de línea de comandos para autocompletar comandos, generar scripts y explicar errores, gracias a su orientación al trabajo en terminal.
- Agentes de código autónomos: al soportar tool calling y razonamiento multi-paso, puede usarse en agentes que editan archivos, ejecutan pruebas y corrigen bugs de forma iterativa.
- Automatización de tareas de software de larga duración: su diseño para tareas prolongadas lo hace adecuado para pipelines de CI/CD, refactorización de código y análisis estático.
- Inferencia local en Macs Apple Silicon: gracias a la cuantización MLX 6-bit y al soporte MTP, puede ejecutarse en portátiles con chips M1/M2/M3/M4 sin necesidad de GPU externa.
- Asistente de desarrollo integrado (IDE): puede usarse como backend para plugins de VS Code o JetBrains que ofrezcan completado de código y generación de tests.
- Soporte técnico y documentación: puede generar documentación técnica, responder preguntas sobre APIs y mantener wikis de proyectos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización MLX en la información disponible. Como referencia del modelo base con MTP, SparkBench reporta una velocidad de 70,8 tokens/s con una longitud de contexto de 4.000 tokens en una NVIDIA DGX Spark GB10 mediante vLLM. Estos datos corresponden al modelo original, no a la cuantización MLX.

## Requisitos de hardware

- Memoria unificada estimada: ~30,1 GB para los pesos; se recomienda al menos 32 GB de RAM en Macs con Apple Silicon.
- GPU recomendadas: no aplica para esta cuantización, diseñada para Apple Silicon. El modelo base puede ejecutarse en NVIDIA DGX Spark GB10 con vLLM.
- Consumer GPU: no aplica para esta cuantización; el modelo base requeriría cuantización adicional para caber en GPU de consumo.
- Opciones de despliegue: oMLX server y mlx-lm para Apple Silicon; vLLM para el modelo base en GPUs NVIDIA.
- Latencia y throughput: 70,8 tokens/s @ 4k en DGX Spark GB10 con vLLM para el modelo base con MTP (referencia).

## Comparativa con modelos similares

No se dispone de información comparativa suficiente en los datos proporcionados. El modelo comparte arquitectura con la familia Qwen3.5, por lo que es comparable a otros MoE de tamaño similar como Qwen3-30B-A3B, pero no se han publicado benchmarks que permitan una comparación directa con esta cuantización.

## Limitaciones y advertencias

- El repositorio está en proceso de subida de pesos: la model card indica que la lista de archivos y los hashes llegarán con los pesos, por lo que la disponibilidad puede ser incompleta.
- La cuantización MLX 6-bit puede introducir pérdida de precisión respecto al modelo original, lo que puede afectar al rendimiento en tareas complejas.
- No se especifican la longitud de contexto ni los idiomas soportados, lo que limita la evaluación de su uso en aplicaciones multilingües o de contexto largo.
- Riesgo de alucinación inherente a los modelos de lenguaje, no documentado específicamente para este modelo.
- La licencia MIT permite uso comercial, pero es obligatorio mantener el aviso de copyright y la licencia en las redistribuciones.
- El modelo está diseñado para Apple Silicon; no funcionará directamente en otras plataformas sin conversión.

## Enlaces

- HuggingFace: https://huggingface.co/LookUpMark/Ornith-1.5-35B-A3B-oQ6e-mtp
- Modelo base: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B
- Licencia: https://huggingface.co/ornith-ai/Ornith-1.5-35B-A3B/blob/main/LICENSE
- Blog del modelo: https://deep-reinforce.com/ornith.html
- Página del modelo: https://ornith.ai/ornith_1_5.html
- SparkBench: https://sparkbench.dev/models/ornith-ai_ornith-1.5-35b-a3b/
- Artículo de aimadetools: https://www.aimadetools.com/blog/ornith-1-5-35b-a3b/
