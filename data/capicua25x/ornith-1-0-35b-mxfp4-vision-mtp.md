# Capicua25x/Ornith-1.0-35B-MXFP4-Vision-MTP

## Resumen

Ornith-1.0-35B-MXFP4-Vision-MTP es una cuantización MXFP4 del modelo Ornith-1.0-35B, un MoE de la familia Qwen (Qwen3.5) con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (A3B). El autor, Capicua25x, ha cuantizado el trunk a MXFP4 con compressed-tensors, manteniendo en BF16 el lm_head, los embeddings, las normas y la torre de visión, y ha injertado un cabezal MTP (Multi-Token Prediction) procedente de un checkpoint hermano de Qwen3.6-35B-A3B para habilitar decodificación especulativa sin pérdida bajo vLLM. El resultado es un modelo de visión-lenguaje (image-text-to-text) con ventana de contexto de 262.144 tokens, licencia Apache-2.0 y soporte para tool calling y razonamiento, optimizado para ejecutarse en GPUs AMD RDNA4 (gfx1201) con tensor parallelism.

La relevancia de esta ficha radica en que ofrece una vía práctica para desplegar un modelo MoE de 35B con visión en hardware AMD de consumo (Radeon AI PRO R9700) sin sacrificar la fidelidad de las salidas, gracias a la verificación lossless del MTP. Las mediciones en producción reportan una tasa de aceptación del cabezal de aproximadamente el 69,5 % y un throughput de hasta 130,9 tokens por segundo en peticiones individuales a contexto corto, con soporte de concurrencia de hasta 128 usuarios. El modelo está pensado para desarrolladores que trabajan con vLLM en entornos ROCm/RDNA4 y necesitan una solución lista para usar con capacidades multimodales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen MoE (Mixture of Experts) con visión, A3B (~3 B activos por token) |
| Parametros totales | 35.951.822.704 (~35,95 B) |
| Parametros activos | ~3 B por token |
| Longitud de contexto | 262.144 tokens (256 K) |
| Tipos de cuantizacion | MXFP4 (4-bit float, grupo 32, simétrico) con compressed-tensors; lm_head, embed_tokens, normas y torre de visión en BF16; cabezal MTP en BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (shards, incluye model-mtp.safetensors) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint original deepreinforce-ai/Ornith-1.0-35B, que a su vez pertenece a la familia Qwen MoE (Qwen3.5). La arquitectura es un transformer MoE con 35,95 B de parámetros totales y aproximadamente 3 B activos por token, lo que permite una inferencia eficiente en hardware con VRAM limitada. La cuantización MXFP4 se realizó con la librería compressed-tensors, aplicando un formato de coma flotante de 4 bits con grupo de 32 y simetría, mientras que las capas críticas (lm_head, embeddings, normalizaciones y la torre de visión) se mantienen en BF16 para preservar la precisión.

La innovación principal es el cabezal MTP injertado desde un checkpoint hermano, Capicua25x/Qwen3.6-35B-A3B-DSV4Pro-Thinking-Distill-MXFP4-Vision, cuyos pesos provienen originalmente de Qwen/Qwen3.6-35B-A3B. Como el trunk y el donante comparten la misma arquitectura MoE (mismo tamaño oculto y distribución de expertos), el cabezal transfiere limpiamente y alcanza una tasa de aceptación media de ~69,5 % en tráfico real de producción, con longitudes medias de aceptación de ~3,08 tokens. La decodificación especulativa es lossless: el modelo objetivo verifica cada token propuesto, por lo que la distribución de salida es idéntica a la del trunk sin cabezal. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO) en la documentación proporcionada.

## Capacidades

- Generación de texto y razonamiento, con soporte del modo de razonamiento dividido (reasoning split) vía el parser qwen3 de vLLM.
- Tool calling / function calling mediante el parser qwen3_xml, confirmado en la model card.
- Visión: pipeline image-text-to-text, capaz de procesar imágenes como entrada adicional al texto.
- Decodificación especulativa con MTP: hasta 3 tokens especulativos por paso, con verificación lossless y una tasa de aceptación de ~69,5 % en producción.
- Ventana de contexto larga de 262.144 tokens, adecuada para documentos extensos o historiales conversacionales amplios.
- Soporte de agentes y multi-step reasoning gracias a la combinación de tool calling, razonamiento y contexto largo.
- Capacidades multilingües: no confirmadas; la model card indica únicamente inglés (en).

## Casos de uso

- Despliegue de un asistente conversacional multimodal en producción: el modelo puede gestionar conversaciones multi-turno con imágenes y texto, manteniendo un contexto de hasta 256 K tokens, y soporta tool calling para integrarse con APIs externas. Es adecuado para entornos con GPUs AMD RDNA4 donde otros modelos no tienen soporte optimizado.
- Procesamiento de documentos largos con análisis visual: gracias a la ventana de 262.144 tokens y la capacidad de visión, puede resumir o extraer información de documentos extensos que incluyan figuras, diagramas o capturas, manteniendo la coherencia a
