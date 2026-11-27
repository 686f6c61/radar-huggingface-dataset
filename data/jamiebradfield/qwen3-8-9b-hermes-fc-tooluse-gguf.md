# JamieBradfield/qwen3.8-9b-hermes-fc-tooluse-GGUF

## Resumen

Qwen3.8-9B Hermes FC — Tooluse (GGUF) es una cuantización en formato GGUF de un ajuste fino orientado a function calling y uso de herramientas sobre el modelo base Empero/Qwen3.8-9B, un transformer denso de 9.195.119.616 parámetros. El autor, JamieBradfield, publica esta variante cuantizada con el kernel propietario ROCmFPX (Q4_0_ROCMFP4_FAST), pensada específicamente para inferencia sobre GPUs AMD con ROCm, en concreto una RX 7700 XT de 12 GB de VRAM. El ajuste se realizó mediante QLoRA sobre el modelo base y se fusionó en BF16 en el repositorio padre.

El modelo aborda el problema del uso fiable de herramientas en modelos de tamaño medio: la selección correcta de funciones, el orden de ejecución de tareas y la resistencia a derivas en conversaciones multi-turno con esquemas de herramientas. La model card incluye una corrección metodológica relevante: las métricas originales provenían de un arnés sintético que incrustaba los esquemas en el texto de sistema y nunca usaba el parámetro nativo `tools` de la API estilo OpenAI. Con la ruta nativa, el modelo base sin ajuste alcanza 18/20 en el nivel 1 con cero derivas de nivel 4, mientras que la ventaja del ajuste en el nivel 2 (priorizar tareas pendientes) se reduce a 8/10 frente a 3/10 del base.

Es relevante ahora por dos motivos: primero, porque documenta de forma transparente un caso de inflación de métricas en evaluaciones de tool calling, un problema extendido en modelos pequeños ajustados; segundo, porque preserva la cabeza MTP (multi-token prediction) del modelo base, lo que permite decodificación especulativa con `--spec-type draft-mtp` en builds compatibles. El programa de ajuste quedó congelado el 2026-09-03 y el autor usa el modelo base como opción por defecto en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de la familia Qwen3.5, según tags) |
| Parametros totales | 9.195.119.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 64k en la configuración medida por el autor; el modelo base soporta hasta 245k según la nota de rendimiento (no confirmado como máximo oficial) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_FAST (4,69 GB); conversión desde BF16 disponible en el repo padre |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (442 tensores, incluida la cabeza MTP bajo el prefijo `mtp.*`) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de ~9,2 mil millones de parámetros, derivado de Empero/Qwen3.8-9B, que a su vez se etiqueta como perteneciente a la familia Qwen3.5. El ajuste se realizó con QLoRA sobre el modelo base, orientado a function calling y uso de herramientas, y se fusionó en BF16 en el repositorio padre (`JamieBradfield/qwen3.8-9b-hermes-fc-tooluse`). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovación técnica destacable es la preservación de la cabeza MTP (multi-token prediction) del modelo base, con 15 tensores bajo el prefijo `mtp.*` dentro de los 442 tensores del GGUF. Esta cabeza habilita decodificación especulativa mediante `--spec-type draft-mtp` en builds que lo soporten, lo que puede reducir la latencia de decodificación. La cuantización se generó con un fork `llama-rocmfpx` mediante `convert_hf_to_gguf.py --outtype bf16` seguido de `llama-quantize Q4_0_ROCMFP4_FAST`, con kernels específicos para RDNA3.

## Capacidades

- Generación de texto conversacional en inglés, con soporte de conversaciones multi-turno.
- Function calling y tool use: selección de funciones, ejecución ordenada de tareas y manejo de esquemas de herramientas por la ruta nativa `tools` de la API estilo OpenAI.
- Razonamiento multi-paso orientado a agentes, con énfasis en priorizar tareas pendientes (comportamiento "todo-first") en el nivel 2 de la evaluación del autor.
- Decodificación especulativa mediante la cabeza MTP preservada, en builds compatibles con `--spec-type draft-mtp`.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags de Hugging Face).
- Capacidades multilingües: limitadas al inglés según la model card.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido.

## Casos de uso

- Agentes de automatización de tareas con APIs: el modelo puede recibir esquemas de herramientas por el parámetro nativo `tools` y encadenar llamadas en orden, lo que lo hace adecuado para orquestadores que necesitan decidir qué función invocar en cada paso.
- Asistentes de operaciones internas: gestión de tickets, consultas a bases de datos y acciones sobre sistemas corporativos mediante function calling, con la ventaja de que el ajuste prioriza completar tareas pendientes antes de responder al usuario.
- Despliegue en estaciones de trabajo con GPU AMD: la cuantización ROCmFPX está optimizada para RDNA3, de modo que un equipo con RX 7700 XT de 12 GB puede servir el modelo a 64k de contexto con KV cache q8_0/turbo3.
- Prototipado de pipelines de agentes en local: al caber en 4,69 GB, permite iterar sobre prompts y esquemas de herramientas sin coste de API, usando llama.cpp con el fork ROCmFPX.
- Evaluación de robustez de tool calling: útil como caso de estudio para comparar arneses sintéticos frente a la ruta nativa de herramientas, dado que la model card documenta la discrepancia entre ambos métodos.
- Servicio de chat con contexto largo: con 64k tokens configurados y decodificación especulativa MTP, puede mantener conversaciones extensas con historial de herramientas acumulado en un solo equipo consumer de gama alta AMD.

## Benchmarks y rendimiento

La model card no publica resultados en benchmarks estándar (MMLU, HumanEval, GSM8K). Los únicos datos disponibles son de un arnés propio de evaluación de tool calling, con corrección metodológica posterior:

| Metrica | Modelo ajustado | Modelo base (sin ajuste) | Metodo |
|---|---|---|---|
| Nivel 1 (seleccion correcta de herramienta) | no disponible en esta ficha | 18/20 | Ruta nativa `tools` |
| Nivel 2 (prioridad de tareas pendientes) | 8/10 | 3/10 | Ruta nativa `tools` |
| Deriva de nivel 4 | no disponible en esta ficha | 0 | Ruta nativa `tools` |

El autor indica que las métricas originales de la model card provenían de un arnés sintético que incrustaba los esquemas en el texto de sistema y no usaba el parámetro `tools`, por lo que no son comparables con la evaluación corregida. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada: 4,69 GB para el archivo Q4_0_ROCMFP4_FAST, más la KV cache; a 64k de contexto con q8_0/turbo3 el consumo total encaja en 12 GB de VRAM según la configuración del autor.
- GPU recomendadas: AMD RDNA3 con ROCm, en particular RX 7700 XT de 12 GB (equipo de referencia del autor). Para otras arquitecturas, el autor recomienda convertir desde el merge BF16 del repositorio padre.
- GPU consumer: sí, cabe en GPUs AMD de 12 GB. No se documenta compatibilidad con CUDA ni con GPUs NVIDIA en esta variante.
- Opciones de despliegue: llama.cpp con el fork `llama-rocmfpx`; la decodificación especulativa MTP requiere builds con soporte de `--spec-type draft-mtp`.
- Latencia y throughput: el autor reporta aproximadamente 5,5 veces más velocidad de decodificación a 64k de contexto que a 245k en su equipo, considerado el punto óptimo. No se publican tokens por segundo absolutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.8-9B Hermes FC Tooluse (este) | 9,195 M | 64k configurado | Function calling vía QLoRA | Apache 2.0 | GGUF (ROCmFPX) |
| Empero/Qwen3.8-9B (base) | 9,195 M | hasta 245k según nota del autor | Modelo generalista | no disponible en la información | BF16 |
| JamieBradfield/qwen3.8-9b-hermes-fc-tooluse (padre) | 9,195 M | no disponible | Merge BF16 del ajuste | Apache 2.0 | BF16 |

No se dispone de datos de benchmarks comparativos frente a otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés según la model card; el rendimiento en castellano u otros idiomas no está documentado.
- Las métricas de tool calling de la model card original están corregidas por el propio autor: provenían de un arnés sintético no representativo de la interfaz nativa `tools`. Cualquier comparación basada en las cifras antiguas es inválida.
- El programa de ajuste está congelado desde el 2026-09-03 y el autor usa el modelo base como opción por defecto en producción, lo que sugiere que la ventaja del ajuste es limitada en la práctica.
- La cuantización ROCmFPX está orientada a kernels AMD RDNA3; en otras GPUs o backends el rendimiento puede degradarse o no funcionar, y se recomienda reconvertir desde BF16.
- Riesgo de alucinación en la selección de herramientas y argumentos no evaluado de forma independiente; no hay datos sobre tasas de error en producción.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero el modelo base y los datos de ajuste no están documentados en detalle, por lo que conviene verificar la procedencia de los datos antes de un despliegue comercial.
- A 245k de contexto la velocidad de decodificación cae aproximadamente 5,5 veces respecto a 64k en el equipo de referencia, lo que desaconseja contextos extremos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-tooluse-GGUF
- Repositorio padre (merge BF16): https://huggingface.co/JamieBradfield/qwen3.8-9b-hermes-fc-tooluse
- Modelo base: https://huggingface.co/Empero/Qwen3.8-9B
- Apoyo al autor: https://ko-fi.com/jamesonbradfield
