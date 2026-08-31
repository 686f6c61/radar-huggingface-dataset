# Rin247/Qwen3.6-27B-Feral-Aquarion-FP4

## Resumen

El modelo `Rin247/Qwen3.6-27B-Feral-Aquarion-FP4` es una cuantización FP4 *weight-only* del modelo base `Qwen3.6-27B-Feral`, publicada por el usuario Rin247 en Hugging Face. Se trata de una versión "abliterada" (uncensored) mediante proyección ortogonal de la dirección de rechazo, lo que elimina los mecanismos de negativa del modelo original. El resultado es un modelo de generación de texto sin restricciones de contenido, pensado para entornos donde se requiere una respuesta libre de filtros de seguridad.

La cuantización se realizó con el método RTN (Round-to-Nearest) en CPU, almacenando los pesos en formato FP4 junto con buffers de escala y forma para su posterior dequantización. El repositorio contiene archivos `safetensors` con un total de 14.720.720.384 parámetros (según los metadatos), aunque el nombre del modelo sugiere 27 mil millones, discrepancia que no se explica en la documentación. El tamaño del repositorio es de 18.8 GB.

Este modelo es relevante para desarrolladores que necesitan ejecutar un LLM de gran tamaño en hardware con VRAM limitada, aprovechando la compresión FP4, y que además requieren un comportamiento sin censura para casos de uso específicos como investigación de alineación, generación creativa o simulación de escenarios adversarios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Qwen3.6, probablemente transformer denso) |
| Parametros totales | 14.720.720.384 (segun safetensors) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP4 weight-only (RTN) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors con buffers de escala y forma (`*.weight_scale`, `*.weight_shape`) |

## Arquitectura y entrenamiento

No se proporcionan detalles oficiales sobre la arquitectura del modelo base `Qwen3.6-27B-Feral`. Según fuentes externas (Jetson AI Lab), el modelo Qwen3.6 27B es un transformer denso de la familia Qwen3.6 de Alibaba Cloud, con buenas capacidades en razonamiento, codificación y comprensión del lenguaje. Sin embargo, esta información no está confirmada en la ficha del modelo.

El proceso de creación de este modelo consistió en dos etapas: primero, una "abliteración" (abliteration) del modelo base mediante proyección ortogonal de la dirección de rechazo, eliminando así los mecanismos de negativa y censura. Segundo, una cuantización FP4 *weight-only* usando el método RTN (Round-to-Nearest) ejecutado en CPU. Los pesos se almacenan en formato FP4 junto con escalas y formas adicionales, que deben aplicarse antes de la inferencia. No se menciona ningún entrenamiento adicional, fine-tuning ni uso de RLHF/DPO.

## Capacidades

- Generación de texto libre sin filtros de censura ni rechazo de solicitudes (debido a la abliteración).
- Capacidades generales de lenguaje del modelo base Qwen3.6-27B, que según fuentes externas incluyen razonamiento complejo, generación de código y comprensión multilingüe (no confirmado oficialmente).
- Soporte de cuantización FP4 para inferencia eficiente en memoria.
- Compatible con la librería `transformers` y con pipelines de generación de texto.
- No se documentan capacidades específicas de tool calling, agentes, visión o audio.

## Casos de uso

- Investigación en seguridad y alineación de modelos: al estar abliterado, permite estudiar el comportamiento de un LLM sin mecanismos de rechazo, útil para analizar sesgos, riesgos de contenido dañino o evaluar la eficacia de técnicas de alineación.
- Generación creativa sin restricciones: escritura de ficción, poesía, guiones o contenido satírico donde se requiere evitar respuestas evasivas o moralizantes.
- Simulación de escenarios adversarios: para probar sistemas de moderación de contenido o entrenar clasificadores de contenido tóxico, generando ejemplos que un modelo censurado no produciría.
- Despliegue en entornos con recursos limitados: gracias a la cuantización FP4, el modelo puede ejecutarse en GPUs con 12-16 GB de VRAM (estimación basada en el tamaño del repositorio), permitiendo inferencia local en estaciones de trabajo o servidores sin GPUs de gama alta.
- Chatbots o asistentes sin filtros: para aplicaciones donde el usuario espera respuestas directas sin advertencias de seguridad, como en entornos de rol o ficción interactiva.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de FP4 frente a FP8 o BF16 en calidad de generación y velocidad, dentro de la misma familia de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras métricas para este modelo cuantizado. Tampoco se ofrecen comparativas de rendimiento frente a otras cuantizaciones del mismo modelo base.

## Requisitos de hardware

- VRAM estimada: no disponible oficialmente. El repositorio ocupa 18.8 GB, pero al ser FP4 *weight-only*, el modelo cuantizado debería ocupar aproximadamente 7-8 GB (14.7B parámetros × 0.5 bytes), más overhead de escalas y buffers. Se recomienda al menos 12 GB de VRAM para inferencia con margen.
- GPU recomendadas: no especificadas. Por el tamaño, podría ejecutarse en RTX 3060 12GB, RTX 4070, RTX 4090, o GPUs de datacenter como A10 o A100.
- Compatibilidad con consumer GPU: probablemente sí, en GPUs con 12 GB o más, aunque no hay confirmación oficial.
- Opciones de despliegue: al ser un modelo `transformers`, puede cargarse con la librería `transformers` de Hugging Face, pero requiere un proceso de dequantización manual usando los buffers de escala y forma. No se menciona compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa directa con otras cuantizaciones del mismo modelo base. Sin embargo, se pueden mencionar alternativas existentes en Hugging Face:

| Modelo | Formato | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| Rin247/Qwen3.6-27B-Feral-Aquarion-FP4 | FP4 weight-only | 14.7B (según safetensors) | no disponible | no disponible | Abliterado, sin censura |
| Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP8 | FP8 weight-only | no disponible | no disponible | no disponible | Variante FP8 del mismo modelo abliterado |
| nerkyor/Qwen3.6-27B-NVFP4-v8-RTN | NVFP4 (RTN) | no disponible | no disponible | no disponible | Cuantización FP4 de Qwen3.6-27B con método RTN |

No se dispone de datos de rendimiento para ninguna de estas variantes, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Al ser un modelo abliterado, puede generar contenido ofensivo, ilegal, peligroso o no ético sin ningún tipo de filtro. Su uso debe restringirse a entornos controlados y con fines de investigación.
- La licencia no está especificada, por lo que se desconoce si permite uso comercial o si tiene restricciones de redistribución.
- El proceso de cuantización FP4 puede degradar la calidad de generación en comparación con el modelo original en BF16 o FP16, especialmente en tareas que requieren precisión numérica.
- La discrepancia entre el nombre del modelo (27B) y el número real de parámetros (14.7B) no está explicada; podría deberse a una poda o a un error en los metadatos, lo que genera incertidumbre sobre la arquitectura real.
- No se documenta la longitud de contexto soportada, lo que impide conocer los límites de ventana para aplicaciones de contexto largo.
- El formato de pesos requiere un proceso de dequantización manual con los buffers de escala y forma, lo que añade complejidad a la integración en motores de inferencia estándar.
- No se han publicado resultados de benchmarks, por lo que no hay evidencia objetiva de su rendimiento en tareas estándar.

## Enlaces

- [Hugging Face: Rin247/Qwen3.6-27B-Feral-Aquarion-FP4](https://huggingface.co/Rin247/Qwen3.6-27B-Feral-Aquarion-FP4)
- [Hugging Face: Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP8](https://huggingface.co/Rin247/Qwen3.6-27B-Uncensored-Aquarion-FP8)
- [Hugging Face: nerkyor/Qwen3.6-27B-NVFP4-v8-RTN](https://huggingface.co/nerkyor/Qwen3.6-27B-NVFP4-v8-RTN)
- [Jetson AI Lab: Qwen3.6 27B](https://www.jetson-ai-lab.com/models/qwen3-6-27b/)
- [Fine-tuning Qwen3.6-27B for Verilog (qevos.ai)](https://qevos.ai/blog/en/2026-05-06-qwen36-27b-verilog-lora-finetuning.html)
- [In Practice: Fine-tuning Qwen3.6-27B for Verilog (qevos.ai)](https://qevos.ai/blog/en/2026-05-03-qwen36-verilog-lora-finetuning.html)
