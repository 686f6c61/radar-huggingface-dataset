# CosmicBull/Moderato-V1-Pro-GGUF

## Resumen

Moderato-V1-Pro-GGUF es la conversión a formato GGUF del modelo base nitrai-research/Moderato-V1-Pro, publicada por el usuario CosmicBull. Se trata de un modelo de generación de texto con arquitectura Mixture of Experts (MoE) de 6 expertos con enrutamiento Top-2, identificado por el autor de la conversión como compatible con la familia de loaders `qwen35moe` de llama.cpp. El modelo totaliza 112.461.766.144 parámetros (aproximadamente 112,5 mil millones) según los pesos en safetensors del modelo base.

La relevancia de esta publicación es doble. Por un lado, ofrece una vía para ejecutar un modelo MoE de gran tamaño en herramientas de inferencia local como llama.cpp o LM Studio mediante cuantización. Por otro, la model card documenta con detalle los problemas de empaquetado del modelo original (tensores de visión y de predicción multi-token sin eliminar, nomenclatura de claves MoE distinta a la esperada y ausencia de tensores `_shexp`), lo que la convierte en una referencia técnica útil para quien necesite convertir arquitecturas MoE no estándar a GGUF.

En el momento de la consulta, la model card advierte explícitamente de que los archivos `.gguf` disponibles son compilaciones de prueba v1 que fallan al cargar en llama.cpp y LM Studio, y anuncia una reconstrucción v2 con tensores `_shexp` inyectados a cero. No se dispone de información sobre idiomas soportados, datos de entrenamiento ni resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (6 expertos, enrutamiento Top-2, sin experto compartido) |
| Parámetros totales | 112.461.766.144 (~112,5 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | 131.000 tokens (según la estimación de RAM de la model card a contexto de 131k) |
| Tipos de cuantización | Q4_K_M (~63,0 GB), Q5_K_M (~76,2 GB); planificadas, pendientes de reconstrucción v2 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de cuantizaciones); safetensors en el modelo base (47 shards) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos: 6 expertos enrutados con selección Top-2 por token y sin experto compartido (`shared_expert`). Esta configuración es la causa directa del fallo de carga documentado: el loader `qwen35moe` de llama.cpp exige la presencia de tensores `_shexp` en tiempo de carga, y el modelo original no los incluye. La model card también menciona pesos de predicción multi-token (`mtp.layers.0.*`, correspondientes a `blk.64`) y pesos auxiliares `rrr_controller.*`, lo que sugiere que el modelo base incorpora módulos adicionales más allá del tronco generativo estándar.

Los safetensors originales contienen además la torre de visión completa (`model.visual.blocks.0..26.*`), lo que indica que el modelo base es multimodal, aunque la conversión GGUF descarta esos pesos. La nomenclatura de las capas MoE usa `.block_sparse_moe.experts.{0..5}.*` en lugar de `.mlp.experts.{0..5}.*`, otra divergencia respecto a las convenciones que esperan las herramientas de conversión. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO.

## Capacidades

- Generación de texto conversacional, según la etiqueta `conversational` del repositorio.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se listan idiomas).
- Visión: el modelo base contiene una torre visual de 27 bloques (`model.visual.blocks.0..26`), pero los pesos de visión se eliminan en la conversión GGUF, por lo que las cuantizaciones publicadas son solo de texto.
- Predicción multi-token (MTP): presente en el modelo base (`mtp.layers.0.*`) pero excluida de la conversión GGUF.

## Casos de uso

- Inferencia local de un MoE de gran tamaño en estaciones de trabajo con 96-128 GB de RAM: las variantes Q4_K_M (~63 GB) y Q5_K_M (~76,2 GB) permiten ejecutar el modelo en llama.cpp o LM Studio sin GPU de datacenter, a costa de velocidad de decodificación limitada por el ancho de banda de memoria.
- Experimentación con arquitecturas MoE Top-2 sin experto compartido: el repositorio documenta las divergencias de nomenclatura y los tensores que deben filtrarse, lo que sirve como guía para convertir otros modelos con estructura similar.
- Evaluación comparativa de cuantizaciones K-quant en modelos de más de 100 B parámetros: permite medir la degradación de calidad entre Q4_K_M y Q5_K_M en un modelo grande con presupuesto de memoria ajustado.
- Desarrollo de pipelines de conversión HF a GGUF: la lista de problemas identificados (tensores de visión, MTP, `rrr_controller`, claves `block_sparse_moe`) es material de referencia para escribir scripts de conversión robustos.
- Despliegue en entornos con requisitos de licencia permisiva: la licencia Apache 2.0 facilita el uso comercial, siempre que se resuelvan los problemas de carga de los archivos actuales.
- Servicio de generación de texto conversacional autoalojado: una vez publicada la v2 funcional, el modelo puede servir como backend de chat en infraestructura propia con contexto largo (131k tokens), aunque el rendimiento real en esa ventana no está verificado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/RAM estimada: ~76 GB para Q4_K_M y ~89 GB para Q5_K_M, en ambos casos con contexto de 131k tokens y caché KV en `q8_0`, según las estimaciones de la model card.
- GPU recomendadas: no disponibles en la información proporcionada. Por tamaño, un modelo de ~63-76 GB requiere GPUs con 80 GB o más (A100 80GB, H100 80GB) para residir completamente en VRAM, o bien configuraciones multi-GPU.
- GPU de consumo: no cabe en ninguna GPU de consumo actual (RTX 4090 dispone de 24 GB). Solo es viable con offloading parcial a RAM del sistema o en configuraciones multi-GPU.
- Opciones de despliegue: llama.cpp y LM Studio (indicados en la model card). Otros motores como vLLM u Ollama no se mencionan.
- Latencia y throughput: no disponibles. La model card no publica mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Estado |
|---|---|---|---|---|---|
| Moderato-V1-Pro-GGUF | ~112,5 B (MoE Top-2, 6 expertos) | 131k (según estimación de la model card) | Apache 2.0 | GGUF | Builds v1 no funcionales; v2 pendiente |
| Modelo base nitrai-research/Moderato-V1-Pro | ~112,5 B | no disponible | Apache 2.0 | safetensors | Disponible en HF |
| Alternativas de tamaño comparable | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información suficiente para establecer una comparativa con alternativas concretas de la misma categoría.

## Limitaciones y advertencias

- Los archivos `.gguf` publicados actualmente son compilaciones de prueba v1 que fallan al cargar en llama.cpp y LM Studio con el error `check_tensor_dims: tensor 'blk.0.ffn_gate_inp_shexp.weight' not found`. No deben descargarse para uso productivo hasta que se publique la v2.
- La reconstrucción v2 inyecta tensores `_shexp` a cero como solución de compatibilidad; no se ha verificado que esta inyección no altere el comportamiento del modelo respecto al original.
- El modelo base incluye pesos de visión y de predicción multi-token que se descartan en la conversión; las cuantizaciones publicadas no ofrecen capacidades multimodales ni MTP.
- No hay información sobre sesgos, tasas de alucinación ni evaluación de calidad en ningún idioma.
- No se listan idiomas soportados, por lo que el rendimiento multilingüe es desconocido.
- El contexto de 131k tokens se infiere de las estimaciones de memoria de la model card, no de una especificación oficial del modelo base; el rendimiento real a esa longitud no está verificado.
- La licencia Apache 2.0 permite uso comercial, pero la responsabilidad de validar el comportamiento del modelo recae en el usuario.
- El tamaño del repositorio (373,3 GB) implica descargas muy pesadas y requisitos de almacenamiento considerables.

## Enlaces

- Repositorio GGUF: https://huggingface.co/CosmicBull/Moderato-V1-Pro-GGUF
- Modelo base: https://huggingface.co/nitrai-research/Moderato-V1-Pro
- llama.cpp (loader `qwen35moe`): no disponible en la información proporcionada
- LM Studio: no disponible en la información proporcionada
- Papers, blogs o demos adicionales: no disponibles en la información proporcionada
