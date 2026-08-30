# guutong/Qwen3.8-27B-oQ2e-fp16-mtp

## Resumen

El modelo `guutong/Qwen3.8-27B-oQ2e-fp16-mtp` es una cuantización de 2 bits (oQ2e) del modelo base Qwen3.8-27B de Alibaba, realizada por el usuario guutong mediante la herramienta oMLX v0.6.4. Esta versión está pensada para ejecutarse en Apple Silicon a través de la librería MLX, reduciendo drásticamente el tamaño de los pesos para permitir inferencia en dispositivos con memoria unificada limitada.

El modelo base Qwen3.8-27B es un modelo multimodal denso de 27.000 millones de parámetros con arquitectura híbrida de atención: 48 de sus 64 capas usan atención lineal y las restantes atención completa. Incluye una torre de visión, una cabeza de draft para decodificación especulativa (MTP) y una ventana de contexto nativa de 262.000 tokens, extensible a 1 millón. La cuantización oQ2e reduce los pesos a 2 bits con grupo de tamaño 64, manteniendo ciertas capas en precisión fp16 (de ahí el sufijo `fp16-mtp`) para preservar la calidad en las partes críticas como la cabeza MTP.

Esta ficha es relevante para desarrolladores que buscan ejecutar un modelo multimodal de gran capacidad en hardware local de Apple, con un equilibrio entre tamaño, velocidad y calidad. Se trata de una de las primeras cuantizaciones extremas (2 bits) disponibles públicamente para la serie Qwen3.8.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8 (dense, hybrid attention: 48/64 capas con atención lineal + 16 con atención completa, torre de visión, cabeza MTP) |
| Parametros totales | 27B (modelo base); el archivo safetensors cuantizado reporta 3.592.172.272 parámetros (representación comprimida) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.000 tokens nativo, extensible a 1.000.000 |
| Tipos de cuantizacion | oQ2e (2 bits, group size 64) con capas seleccionadas en fp16 (MTP) |
| Idiomas soportados | No disponible (el modelo base Qwen3.8 es multilingüe, pero la ficha no especifica) |
| Licencia | No disponible (la licencia del modelo base no se ha verificado) |
| Formato de pesos | MLX safetensors |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con una arquitectura híbrida de atención: 48 de las 64 capas utilizan atención lineal (aproximación de bajo rango) y las 16 restantes atención completa, lo que reduce el coste computacional en contextos largos. Incluye un codificador de visión para entrada de imágenes y una cabeza MTP (Multi-Token Prediction) que actúa como draft head para decodificación especulativa, acelerando la generación. El entrenamiento del base no está documentado en la información disponible; se sabe que es un modelo open-weight de Alibaba, pero no se detallan datos de tokens, dataset ni fases de RLHF/DPO.

La cuantización oQ2e aplicada por oMLX utiliza una estrategia de precisión mixta: la mayoría de los pesos se reducen a 2 bits con grupo de 64, mientras que la cabeza MTP y posiblemente otras capas sensibles se mantienen en fp16. Esto busca mitigar la pérdida de calidad típica de cuantizaciones extremas, especialmente en tareas de razonamiento y generación de código.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas y lógica.
- Comprensión multimodal: entrada de imágenes junto con texto (gracias a la torre de visión del modelo base).
- Generación de código y soporte para agentes y flujos de trabajo de automatización ofimática, según la descripción oficial del modelo base.
- Ventana de contexto muy larga (262K nativa, hasta 1M con extensiones), útil para documentos extensos, repositorios de código o conversaciones multi-turno.
- Decodificación especulativa mediante la cabeza MTP, que acelera la inferencia en hardware compatible.
- Capacidades multilingües presumibles, aunque no confirmadas en la ficha de la cuantización.

## Casos de uso

- Asistente de programación local: el modelo puede autocompletar código, explicar fragmentos y refactorizar, aprovechando su ventana de 262K para analizar repositorios completos. La cuantización 2-bit permite ejecutarlo en una Mac con 16 GB de RAM unificada.
- Análisis de documentos largos con imágenes: gracias a la multimodalidad y al contexto extenso, puede resumir informes PDF con gráficos, tablas y capturas, sin necesidad de segmentar el texto.
- Automatización de tareas ofimáticas: el modelo base está optimizado para agentes que interactúan con hojas de cálculo, correos y presentaciones, y la versión cuantizada permite desplegar estos agentes en equipos de trabajo sin GPU dedicada.
- Chatbot de atención al cliente con historial largo: la ventana de 262K permite mantener conversaciones de muchas interacciones sin perder contexto, ideal para soporte técnico o jurídico.
- Extracción de información de imágenes y texto: puede procesar facturas, formularios o capturas de pantalla y convertirlos en datos estructurados, gracias a su torre de visión.
- Prototipado rápido de aplicaciones de IA en Apple Silicon: al usar MLX, se integra fácilmente con el ecosistema de Python y Swift, permitiendo a desarrolladores crear demos y MVPs sin infraestructura en la nube.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La cuantización oQ2e no incluye métricas de rendimiento (MMLU, HumanEval, GSM8K, etc.) en su model card, y los datos del modelo base no se han extraído en la búsqueda. Se recomienda evaluar el modelo en las tareas específicas de uso antes de desplegarlo en producción.

## Requisitos de hardware

- Almacenamiento: el repositorio pesa 12,6 GB, por lo que se necesitan al menos 13 GB de espacio libre.
- Memoria unificada estimada para inferencia: con cuantización 2 bits y capas fp16, se estima que el modelo necesita entre 8 y 12 GB de RAM unificada en Mac. Una Mac con 16 GB puede ejecutarlo con holgura; con 8 GB podría ser ajustado.
- GPU recomendadas: cualquier Apple Silicon con al menos 16 GB de memoria unificada (M1 Pro, M2 Max, M3 Ultra, etc.). No está pensado para GPUs NVIDIA/AMD.
- Opciones de despliegue: MLX (librería oficial para Apple), compatible con `mlx-lm` para generación de texto y con frameworks como `mlx-vlm` para tareas multimodales. También se puede usar desde Python directamente con `mlx.core`.
- Latencia y throughput: no disponibles. La decodificación especulativa con la cabeza MTP debería acelerar la generación, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| guutong/Qwen3.8-27B-oQ2e-fp16-mtp | 27B | 262K | 2 bits (oQ2e) | No disponible | MLX safetensors |
| guutong/Qwen3.8-27B-oQ3e-fp16-mtp (mismo autor) | 27B | 262K | 3 bits (oQ3e) | No disponible | MLX safetensors |
| Qwen/Qwen3.8-27B (base) | 27B | 262K | Sin cuantizar | No disponible (probablemente Apache 2.0) | Safetensors original |

La comparativa se limita a las variantes del mismo modelo base. No se dispone de datos de otras cuantizaciones de modelos similares (p. ej., Llama 3.1 27B o Mistral 24B) en 2 bits para comparar rendimiento.

## Limitaciones y advertencias

- La cuantización a 2 bits puede degradar significativamente la calidad de las respuestas, especialmente en tareas de razonamiento matemático, generación de código complejo y comprensión de matices lingüísticos. Se recomienda probar con casos reales antes de usarlo en producción.
- La licencia del modelo no está especificada en la ficha de HuggingFace. El modelo base Qwen3.8-27B probablemente tenga una licencia permisiva (Apache 2.0 o Qwen license), pero no se ha verificado. Para uso comercial, es imprescindible confirmar los términos con el autor original.
- No se han publicado resultados de benchmarks ni evaluaciones de sesgos, por lo que se desconocen los riesgos de alucinación o sesgos específicos de esta cuantización.
- El modelo está pensado exclusivamente para Apple Silicon (MLX). No es compatible con CUDA ni con otras plataformas sin conversión previa.
- La ventana de contexto de 262K es nativa, pero la extensión a 1M puede requerir técnicas adicionales (como RoPE scaling) y podría aumentar el uso de memoria.
- Al ser una cuantización reciente (subida en 2026-08-30), puede haber errores o cambios de pesos. Se recomienda verificar la fecha de descarga y actualizar si es necesario.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/guutong/Qwen3.8-27B-oQ2e-fp16-mtp
- Modelo base Qwen3.8-27B (HuggingFace): https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio oficial de Qwen3.8 (GitHub): https://github.com/QwenLM/Qwen3.8
- Repositorio del modelo base (GitHub): https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Herramienta de cuantización oMLX: https://github.com/jundot/omlx
- Variante oQ3e del mismo autor: https://huggingface.co/guutong/Qwen3.8-27B-oQ3e-fp16-mtp
