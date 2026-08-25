# Deepdive404-3/Ornith-1.5-397B

## Resumen

Ornith-1.5-397B es un modelo de lenguaje de gran escala con arquitectura de mezcla de expertos (MoE), desarrollado por Ornith AI como parte de la familia Ornith-1.5. Este modelo representa un avance significativo en el entrenamiento de modelos fundacionales mediante un bucle de auto-mejora de extremo a extremo: en lugar de depender de tareas fijas curadas por humanos y harnesses diseñados manualmente, el propio modelo genera nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora su política mediante aprendizaje por refuerzo.

El modelo se construye sobre las bases de Ornith-1.0, que a su vez se desarrolló sobre Qwen3.5 y Gemma4 mediante continued pretraining, mid-training y post-training. Ornith-1.5-397B es el modelo insignia de la familia, con 403.397.928.944 parámetros totales y un tamaño de repositorio de 1600,4 GB en formato safetensors. Según los benchmarks publicados, alcanza 86,1 en Terminal-Bench 2.1 y 56,0 en DeepSWE, posicionándose a la par de Claude Opus 4.8 y superando a otros modelos open source de escala similar.

El modelo está disponible bajo licencia MIT, lo que facilita su adopción tanto en investigación como en entornos comerciales, y está publicado en HuggingFace con el identificador `Deepdive404-3/Ornith-1.5-397B`.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) |
| Parametros totales | 403.397.928.944 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (disponible como Ornith-1.5-397B-FP8) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Ornith-1.5-397B es un modelo de mezcla de expertos (MoE) que se desarrolla sobre las arquitecturas de Qwen3.5 y Gemma4. La innovación principal no reside en la arquitectura en sí, sino en el proceso de entrenamiento: el modelo participa en un bucle de auto-mejora de extremo a extremo. Este proceso, denominado "self-improvement", optimiza conjuntamente la generación de tareas, la construcción de scaffolds y los rollouts de soluciones.

A diferencia de enfoques anteriores que dependían de tareas fijas y harnesses diseñados manualmente, Ornith-1.5 genera continuamente nuevas tareas de entrenamiento, descubre estrategias efectivas para resolverlas y mejora su política mediante aprendizaje por refuerzo. Este ciclo continuo permite que el modelo cree nuevas experiencias de aprendizaje a partir de las cuales mejorar, en lugar de limitarse a un dataset estático. Los detalles específicos sobre el diseño de recompensas para tareas, harnesses y rollouts se describen en el blog oficial de Ornith AI.

## Capacidades

- Generación de texto con alta calidad en tareas de razonamiento complejo.
- Capacidades avanzadas de codificación, especialmente en entornos de terminal y resolución de problemas de ingeniería de software (SWE).
- Soporte de arquitectura image-text-to-text según las etiquetas del repositorio, lo que sugiere capacidades multimodales.
- Integración con el ecosistema transformers de Hugging Face.
- Diseñado para agentes autónomos que requieren razonamiento multi-step y ejecución de tareas en entornos reales.
- Capacidad de auto-mejora mediante generación de tareas y aprendizaje por refuerzo.

## Casos de uso

- **Resolución de incidencias en repositorios de código**: el modelo puede actuar como agente autónomo para resolver issues de GitHub, ya que su rendimiento en SWE-bench Verified (86,0) y SWE-bench Pro indica una capacidad sólida para comprender bases de código, proponer parches y validar soluciones.
- **Asistente de programación en terminal**: con 86,1 en Terminal-Bench 2.1, el modelo es adecuado para integrarse en herramientas tipo CLI que ejecutan comandos, gestionan archivos y resuelven tareas de programación directamente en el terminal.
- **Automatización de tareas de DevOps**: el modelo puede usarse para generar scripts de despliegue, diagnosticar fallos en pipelines de CI/CD y proponer soluciones en infraestructura como código.
- **Agente de razonamiento multi-paso**: su capacidad para generar scaffolds y soluciones hace que sea útil en entornos de agente donde se requiere planificación, ejecución de herramientas y verificación de resultados.
- **Generación de código en producción**: con soporte de tool calling y razonamiento complejo, puede integrarse en pipelines de desarrollo como asistente de programación para tareas de refactorización, generación de tests y revisión de código.
- **Investigación en auto-mejora de modelos**: al ser open source y con una arquitectura de entrenamiento por refuerzo, es una plataforma de estudio para investigadores que quieran explorar el auto-scaffolding y la generación de tareas.

## Benchmarks y rendimiento

| Benchmark | Ornith-1.5-397B | DeepSeek-V4-Flash-0731 (284B) | GLM-5.2 (753B) | Claude Opus 4.8 | Kimi K3 (2.8T) | Ornith-1.0-397B |
|---|---|---|---|---|---|---|
| Terminal-Bench 2.1 (Terminus-2) | 86,1 | 82,7 | 81,0 | 85,0 | 88,3 | 77,5 |
| Terminal-Bench 2.1 (Claude Code) | 85,2 | 81,8 | 82,7 | 78,9 | - | 78,2 |
| SWE-bench Verified | 86,0 | 81,6 | 83,0 | 85,8 | 86,2 | 82,4 |
| DeepSWE | 56,0 | no disponible | no disponible | 59,0 | no disponible | no disponible |

Los datos de benchmarks provienen de la model card del autor. No se han publicado resultados de benchmarks adicionales (MMLU, GSM8K, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- **VRAM estimada**: con 403.397.928.944 parámetros, el modelo requiere aproximadamente 806 GB en FP16 (2 bytes por parámetro) y unos 403 GB en FP8. En cuantización de 4 bits se reduciría a unos 202 GB, pero no hay información sobre cuantizaciones disponibles más allá de FP8.
- **GPU recomendadas**: el modelo no cabe en GPUs de consumo como RTX 4090 (24 GB) o RTX 5090 (32 GB). Requiere servidores con múltiples GPUs de alta capacidad: 8 × A100 80 GB (640 GB) es la configuración mínima viable para FP8.
- **Despliegue**: compatible con el framework transformers de Hugging Face. Para producción, se recomienda usar vLLM o TensorRT-LLM para optimizar el throughput, o llama.cpp para cuantizaciones GGUF (no confirmadas). También hay una versión FP8 disponible (`ornith-ai/Ornith-1.5-397B-FP8`).
- **Latencia y throughput**: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Terminal-Bench 2.1 | SWE-bench Verified | Licencia |
|---|---|---|---|---|---|
| Ornith-1.5-397B | 397B | MoE | 86,1 | 86,0 | MIT |
| DeepSeek-V4-Flash-0731 | 284B | MoE | 82,7 | 81,6 | no disponible |
| GLM-5.2 | 753B | MoE | 81,0 | 83,0 | no disponible |
| Ornith-1.0-397B | 397B | MoE | 77,5 | 82,4 | MIT |

Ornith-1.5-397B supera a DeepSeek-V4-Flash-0731 y GLM-5.2 en los benchmarks de codificación mostrados, y se sitúa ligeramente por debajo de Kimi K3 (2.8T) en Terminal-Bench 2.1, aunque con un tamaño mucho menor. Comparado con su predecesor, Ornith-1.0-397B, la mejora es notable en Terminal-Bench (77,5 → 86,1).

## Limitaciones y advertencias

- **Sesgos y alucinación**: no se dispone de información sobre sesgos específicos del modelo. Como cualquier LLM de gran tamaño, existe riesgo de alucinación en contextos de baja confianza.
- **Idiomas**: no se ha publicado información sobre los idiomas soportados. La model card no especifica cobertura multilingüe.
- **Contexto**: la longitud de contexto máxima no se ha especificado en la documentación disponible.
- **Uso comercial**: la licencia MIT permite uso comercial sin restricciones, lo que es favorable.
- **Requisitos de producción**: el tamaño del modelo (1600,4 GB en el repositorio) hace que sea inviable para despliegues en hardware modesto. Requiere infraestructura de servidores con múltiples GPU.
- **Fechas**: el modelo fue creado en 2026-08-25, lo que implica que es un modelo reciente y en fase temprana de adopción. La comunidad aún no ha validado su comportamiento en entornos de producción.

## Enlaces

- [HuggingFace: Deepdive404-3/Ornith-1.5-397B](https://huggingface.co/Deepdive404-3/Ornith-1.5-397B)
- [HuggingFace: ornith-ai/Ornith-1.5-397B-FP8](https://huggingface.co/ornith-ai/Ornith-1.5-397B-FP8)
- [Blog oficial: Ornith-1.5: From Self-Scaffolding to Self-Improvement](https://ornith.ai/ornith_1_5.html)
- [Web oficial de Ornith AI](https://ornith.ai/)
- [Guía de Ornith AI para modelos de codificación](https://ornith.online/)
- [HuggingFace: deepreinforce-ai/Ornith-1.0-397B](https://huggingface.co/deepreinforce-ai/Ornith-1.0-397B)
