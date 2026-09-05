# mudler/Qwen3.8-Flash-Next-APEX-GGUF

## Resumen

Qwen3.8-Flash-Next-APEX-GGUF es una cuantización GGUF del modelo Qwen/Qwen3.8-Flash-Next, un MoE (Mixture of Experts) de 177 mil millones de parámetros con 512 expertos, desarrollado por el equipo LocalAI (mudler) como parte del proyecto APEX. Esta versión reduce el tamaño del modelo original (354 GB en BF16) a dos variantes de 73.0 GB y 78.7 GB, optimizando la asignación de bits para minimizar la pérdida de calidad. La relevancia de esta cuantización radica en que permite ejecutar un modelo de gran tamaño en hardware limitado: la variante Nano cabe en una sola GPU de 48 GB, ya que el tensor per_layer_token_embd de 51.2 mil millones de parámetros se mantiene en RAM del sistema y no en VRAM. El modelo requiere una versión reciente de llama.cpp con soporte qwen4exp.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con 512 expertos |
| Parametros totales | 177 B |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | APEX-I-Nano (73.0 GB) y APEX-I-Mini (78.7 GB), basadas en tipos de bloque de 32 bits con 4.5 bits por peso mínimo |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE con 512 expertos. La cuantización APEX no altera la arquitectura, pero aplica una estrategia de asignación de bits basada en la sensibilidad de cada tensor. Según la model card, el tensor per_layer_token_embd (51.2 B parámetros) y ffn_down_exps (40.3 B) no son divisibles por 256, por lo que no pueden usar tipos K-quant ni IQ de bloque 256; solo quedan tipos de bloque de 32 bits, siendo el más barato 4.5 bits por peso. La cuantización también tiene en cuenta que las capas FFN en los bordes de la red son más sensibles (2.63x) y que ffn_up es 1.35x más sensible que ffn_gate, por lo que se le asignan más bits. Los datos de entrenamiento del modelo original no están disponibles en la información proporcionada.

## Capacidades

No se han publicado especificaciones detalladas de capacidades en la información disponible. El modelo es un MoE de 177 B con 512 expertos, cuantizado para ejecución local. La cuantización preserva la calidad en términos de perplejidad: la variante Mini obtiene 4.4354 (+2.9% vs BF16) y la Nano 4.6659 (+8.2%). No hay información sobre tool calling, agentes, visión u otras capacidades específicas.

## Casos de uso

- Ejecución local en una GPU de 48 GB: la variante APEX-I-Nano requiere 43.9 GB de VRAM y 29.1 GB de RAM, por lo que cabe en una tarjeta como la A6000 o RTX 6000 Ada con margen para el contexto.
- Despliegue en estaciones de trabajo con dos GPU de 24 GB: aunque es ajustado, la variante Nano puede distribuirse en dos tarjetas de 24 GB dejando unos 4 GB para caché KV y buffers de cómputo, siempre que el contexto se mantenga moderado.
- Investigación en cuantización eficiente: la técnica APEX, que asigna bits según la sensibilidad de cada tensor, puede estudiarse con este modelo como caso práctico.
- Uso con llama.cpp: el modelo se puede ejecutar con llama-cli usando -ngl 99, aprovechando el soporte qwen4exp de las versiones recientes.
- Integración con LocalAI: al ser una cuantización del equipo LocalAI, puede desplegarse como backend de inferencia en entornos que usen esta plataforma.
- Análisis de texto en entornos con memoria unificada: el tensor per_layer_token_embd se mantiene en RAM del sistema, lo que reduce la presión sobre la VRAM y permite ejecutar el modelo en sistemas con 64 GB de memoria unificada o más.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye mediciones de perplejidad frente a los pesos BF16, con un contexto de 4096 tokens y seis fragmentos de texto:

| Modelo | Perplejidad | vs BF16 |
|---|---|---|
| BF16 | 4.3113 | - |
| APEX-I-Mini | 4.4354 +/- 0.085 | +2.9% |
| APEX-I-Nano | 4.6659 +/- 0.093 | +8.2% |

Nota: la perplejidad se midió sobre el mismo corpus utilizado para construir la matriz de importancia, lo que puede favorecer a las cuantizaciones.

## Requisitos de hardware

- VRAM estimada: 43.9 GB para APEX-I-Nano y 49.5 GB para APEX-I-Mini, más 29.1 GB de RAM del sistema en ambos casos.
- GPU recomendadas: una tarjeta de 48 GB (A6000, L40S, RTX 6000 Ada) para Nano; para Mini se necesitan 2x32 GB o una GPU de 80 GB.
- En dos GPU de 24 GB, la variante Nano es ajustada: quedan unos 4 GB para caché KV y buffers.
- Opciones de despliegue: llama.cpp (con soporte qwen4exp) y LocalAI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa con otros modelos de la misma categoría. La model card menciona mediciones de sensibilidad en Qwen3.8-27B, pero no es un modelo comparable en tamaño. No se han encontrado benchmarks comparativos con alternativas como Qwen3-235B u otros MoE cuantizados en la información disponible.

## Limitaciones y advertencias

- La cuantización Nano aumenta la perplejidad un 8.2% frente a BF16, lo que puede degradar la calidad en tareas sensibles.
- El tensor per_layer_token_embd (51.2 B parámetros) se mantiene en RAM del sistema, por lo que se necesitan al menos 29.1 GB de RAM además de la VRAM.
- Se requiere una versión reciente de llama.cpp con soporte qwen4exp; las versiones anteriores no cargarán estos archivos.
- Los archivos se distribuyen en dos shards (por el límite de 50 GB de HuggingFace); hay que descargar ambos y apuntar al primero.
- Los datos de perplejidad se midieron sobre el corpus de entrenamiento de la matriz de importancia, lo que puede inflar los resultados; una evaluación con datos externos sería más fiable.
- No hay información sobre sesgos, alucinaciones o limitaciones de idioma en la información disponible.
- La licencia del modelo base es Apache-2.0, lo que permite uso comercial, pero hay que cumplir los términos de la licencia original.

## Enlaces

- HuggingFace: https://huggingface.co/mudler/Qwen3.8-Flash-Next-APEX-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Proyecto APEX: https://github.com/mudler/apex-quant
- LocalAI: https://github.com/mudler/LocalAI
- Blog Atomic Chat: https://atomic.chat/blog/guides/how-to-run-qwen-3-8-flash-next-locally
- Megathread Reddit: https://www.reddit.com/r/LocalLLaMA/comments/1vyq2v4/megathread_qwen38flashnext_release_day/
