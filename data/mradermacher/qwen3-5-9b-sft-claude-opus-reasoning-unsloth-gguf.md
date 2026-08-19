# mradermacher/Qwen3.5-9B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF

## Resumen

Qwen3.5-9B-SFT-Claude-Opus-Reasoning-Unsloth es un modelo de lenguaje de 9.000 millones de parámetros, resultado de un ajuste fino supervisado (SFT) sobre la base Qwen3.5-9B de Alibaba, utilizando datos de razonamiento destilados de Claude Opus. El objetivo es transferir las capacidades de razonamiento paso a paso de Claude Opus a un modelo más pequeño y de código abierto, manteniendo la licencia Apache 2.0. La versión GGUF aquí descrita, publicada por mradermacher, ofrece una amplia gama de cuantizaciones para facilitar su ejecución en hardware variado, desde GPU de consumo hasta entornos de servidor.

Este modelo es relevante porque combina la arquitectura eficiente de Qwen3.5 (familia que incluye variantes densas y MoE) con un entrenamiento específico en razonamiento, lo que lo hace adecuado para tareas que requieren cadenas de pensamiento explícitas, como resolución de problemas matemáticos, generación de código y agentes conversacionales. Su licencia permisiva y su disponibilidad en formato GGUF lo convierten en una opción práctica para desarrolladores que buscan desplegar capacidades de razonamiento sin depender de APIs comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5, sin detalles específicos publicados) |
| Parametros totales | 8.953.803.264 (8,95 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | Inglés (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors disponible en el repo base) |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-9B, un LLM de la serie "Small" de Alibaba, que según la documentación de Unsloth pertenece a una familia de modelos "multimodales híbridos de razonamiento". Sin embargo, los detalles arquitectónicos específicos (número de capas, atención, etc.) no se han publicado en la información disponible. El ajuste fino se realizó mediante SFT con LoRA/QLoRA (indicado por las etiquetas `unsloth`, `lora`, `trl`, `sft`), utilizando el dataset `ermiaazarkhalili/claude-reasoning-distillation`, que contiene ejemplos de razonamiento generados por Claude Opus. El objetivo es que el modelo aprenda a producir cadenas de razonamiento explícitas antes de dar la respuesta final, imitando el estilo de Claude Opus.

El entrenamiento se centra en la destilación de razonamiento, por lo que el modelo está optimizado para tareas que requieren pensamiento paso a paso. No se han publicado detalles sobre el número de tokens de entrenamiento ni sobre técnicas adicionales como RLHF o DPO.

## Capacidades

- Razonamiento paso a paso: genera cadenas de pensamiento detalladas antes de la respuesta final, gracias al entrenamiento con datos destilados de Claude Opus.
- Generación de texto conversacional: adecuado para diálogos multi-turno y asistentes virtuales.
- Comprensión y generación de código: al ser un modelo de razonamiento, puede abordar tareas de programación que requieren lógica y planificación.
- Resolución de problemas matemáticos y lógicos: su entrenamiento en razonamiento lo hace útil para tareas de aritmética, álgebra y puzzles.
- Soporte de tool calling y agentes: aunque no se confirma explícitamente en la documentación, los modelos de la familia Qwen3.5 suelen incluir soporte para herramientas; se recomienda verificar en el repo base.
- Multilingüismo limitado: la model card indica solo inglés, aunque Qwen3.5 base podría soportar más idiomas; no hay confirmación para este fine-tuning.

## Casos de uso

- Asistentes de código en IDE: el modelo puede integrarse en extensiones de VS Code o JetBrains para ofrecer sugerencias de código con explicaciones razonadas, ayudando a los desarrolladores a entender el porqué de cada recomendación.
- Chatbots de soporte técnico: su capacidad de razonamiento permite desglosar problemas complejos en pasos manejables, mejorando la calidad de las respuestas en atención al cliente.
- Tutoría y educación: puede explicar conceptos matemáticos o científicos paso a paso, adaptando el nivel de detalle según la petición del usuario.
- Automatización de tareas de análisis de datos: al poder razonar sobre datos estructurados, puede generar scripts de Python o SQL para procesar y visualizar información.
- Agentes autónomos con tool calling: si se confirma el soporte de herramientas, podría usarse en pipelines de automatización donde el modelo decide qué funciones llamar para completar una tarea (por ejemplo, búsqueda web, cálculo, etc.).
- Generación de documentación técnica: su capacidad de razonamiento ayuda a producir explicaciones coherentes y detalladas de código o procesos, útil para mantener wikis internas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de datos sobre MMLU, HumanEval, GSM8K u otras métricas para este modelo específico. Se recomienda consultar el repositorio base (`ermiaazarkhalili/Qwen3.5-9B-SFT-Claude-Opus-Reasoning-Unsloth`) por si se añaden en el futuro.

## Requisitos de hardware

- VRAM estimada para inferencia según cuantización (valores orientativos para el peso del modelo, sin contar KV cache):
  - Q2_K: ~3,9 GB
  - Q4_K_M: ~5,7 GB
  - Q8_0: ~9,6 GB
  - f16: ~18 GB
- GPU recomendadas:
  - Para cuantizaciones Q4/Q5: tarjetas de consumo como RTX 3060 12GB, RTX 4060 Ti 16GB, RTX 4090.
  - Para Q8_0: GPU con 12-16 GB de VRAM (RTX 3090, RTX 4080, A10).
  - Para f16: GPU de servidor como A100 40GB o H100.
- El modelo cabe en GPU de consumo con cuantizaciones Q4 o Q5, permitiendo ejecución local en equipos de gama media.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui (con backend llama.cpp), y vLLM (si se convierte a safetensors).
- Latencia y throughput: no se han publicado datos específicos; dependerá del hardware y la cuantización. En una RTX 4090 con Q4_K_M se puede esperar entre 30-60 tokens/s para modelos de 9B, aunque es una estimación no confirmada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-SFT-Claude-Opus-Reasoning (este) | 8,95 B | No disponible | Apache 2.0 | GGUF | Fine-tuning de razonamiento sobre Qwen3.5-9B |
| Llama 3.1 8B | 8,03 B | 128K | Llama 3.1 | GGUF, safetensors | Modelo generalista, sin especialización en razonamiento |
| Qwen2.5 7B | 7,61 B | 128K | Apache 2.0 | GGUF, safetensors | Predecesor de Qwen3.5, buen equilibrio rendimiento/tamaño |
| Mistral 7B | 7,24 B | 32K | Apache 2.0 | GGUF, safetensors | Popular para despliegue en edge, sin fine-tuning específico |

No se dispone de datos de rendimiento comparativo (benchmarks) para este modelo, por lo que la comparación se limita a parámetros y licencia.

## Limitaciones y advertencias

- Sesgos: al estar entrenado con datos destilados de Claude Opus, puede heredar sesgos presentes en ese modelo o en el dataset de destilación.
- Alucinación: como cualquier LLM, puede generar información falsa o inventada, especialmente en tareas de razonamiento complejo donde el modelo no tiene acceso a fuentes externas.
- Idioma: la model card indica solo inglés; el rendimiento en otros idiomas no está garantizado.
- Contexto limitado: no se ha especificado la longitud de contexto; se recomienda asumir el valor del modelo base Qwen3.5-9B (posiblemente 32K o 128K), pero no está confirmado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar que el dataset de destilación no tenga restricciones adicionales.
- Producción: al ser un modelo cuantizado por un tercero (mradermacher), se recomienda validar la calidad de las cuantizaciones en casos de uso críticos, ya que las versiones de baja precisión (Q2, Q3) pueden degradar significativamente el rendimiento.

## Enlaces

- Repositorio HuggingFace del modelo GGUF: https://huggingface.co/mradermacher/Qwen3.5-9B-SFT-Claude-Opus-Reasoning-Unsloth-GGUF
- Modelo base (safetensors): https://huggingface.co/ermiaazarkhalili/Qwen3.5-9B-SFT-Claude-Opus-Reasoning-Unsloth
- Dataset de destilación: https://huggingface.co/datasets/ermiaazarkhalili/claude-reasoning-distillation
- Documentación de Unsloth sobre Qwen3.5: https://unsloth.ai/docs/models/qwen3.5
- Guía de ejecución local con Claude Code (gist): https://gist.github.com/kibotu/a009f00414b7c10fb1c74e603d7838c0
- Guía de VRAM y rendimiento para Qwen3.5 9B (FitMyLLM): https://www.fitmyllm.com/blog/model/qwen3.5-9b
