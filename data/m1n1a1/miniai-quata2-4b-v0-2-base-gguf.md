# M1n1A1/MiniAI-Quata2-4b-v0.2-base-GGUF

## Resumen

MiniAI Quata2 4B v0.2-base es un checkpoint de preentrenamiento continuado (continued pretraining, CPT) sobre Qwen3.5-4B, desarrollado por el usuario M1n1A1. El objetivo declarado es adaptar el modelo fundacional al serbio y a las lenguas eslavas del sur estrechamente relacionadas (croata y bosnio), manteniendo el inglés como idioma de referencia. Esta publicación concreta es la conversión a GGUF del checkpoint CPT y se presenta explícitamente como la base sobre la que se construirá el SFT de la versión v0.2, no como un modelo de chat final.

El modelo parte de Qwen3.5-4B en su variante post-entrenada (chat), no de la variante Base, y aplica un preentrenamiento continuado sobre un corpus en serbio. El checkpoint HF original contiene 4,21B parámetros de texto, 0,33B de visión y 0,12B de cabeza MTP, hasta un total de aproximadamente 4,66B; la conversión GGUF es solo texto y descarta la torre de visión y la cabeza MTP, por lo que el fichero cuantizado ronda los 4,21B parámetros efectivos.

La relevancia de esta ficha es doble: por un lado, documenta un caso poco frecuente de adaptación lingüística de un modelo Qwen de última generación a una lengua de bajos recursos como el serbio; por otro, sirve como referencia para quien quiera inspeccionar la etapa CPT antes de que se publique el SFT. Al ser un checkpoint base, su comportamiento esperado es de completación de texto, no de asistente conversacional pulido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-4B; detalles de atención y capas no disponibles) |
| Parametros totales | 4.326.350.848 (4,33B) en el checkpoint safetensors; ~4,21B de texto en el GGUF |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de ejecución usa `-c 8192` |
| Tipos de cuantizacion | Q4_K_M estándar y Q4_K_M con imatrix (calibrado sobre 800 documentos serbios del corpus CPT) |
| Idiomas soportados | en, sr, hr, bs |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); safetensors en el checkpoint base original |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-4B, un transformer decoder-only de la familia Qwen 3.5. La model card no detalla el número de capas, la configuración de atención ni el esquema de positional encoding; sí menciona que el checkpoint HF original incluye una torre de visión (0,33B) y una cabeza MTP (0,12B), lo que sugiere que el modelo fundacional es multimodal y emplea Multi-Token Prediction. Ninguno de esos dos componentes fue entrenado ni evaluado por el autor, y ambos se eliminan en la conversión GGUF.

El entrenamiento consiste en un preentrenamiento continuado sobre un corpus en serbio (el autor menciona 800 documentos serbios usados para calibrar la imatrix, extraídos del corpus CPT). No se especifica el número total de tokens de entrenamiento, la composición exacta del dataset, ni si hubo etapas de RLHF o DPO; al tratarse de un checkpoint CPT, se asume que no las hubo. La innovación técnica destacable es el uso de imatrix (importance matrix) calibrada sobre el propio corpus serbio para mejorar la cuantización a 4 bits, un enfoque habitual en el ecosistema llama.cpp para preservar calidad en bits bajos.

## Capacidades

- Generación de texto y completación: el modelo está pensado para continuar texto, no para seguir instrucciones de forma fiable.
- Capacidades multilingües: inglés, serbio, croata y bosnio, con especial énfasis en serbio por el CPT.
- Plantilla de chat de Qwen3.5 incluida en el GGUF, con soporte de modo thinking on/off mediante `--jinja`.
- No soporta entrada de imagen: la torre de visión se descarta en la conversión GGUF.
- No se documenta soporte de tool calling ni function calling en este checkpoint.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- Capacidades de código y matemáticas: no evaluadas ni documentadas para esta versión.

## Casos de uso

- Investigación de adaptación lingüística: permite inspeccionar el efecto del CPT sobre serbio antes de que se publique el SFT, comparando completaciones con el Qwen3.5-4B original en el mismo prompt.
- Generación de texto en serbio para corpus y datasets: útil para aumentar datos en sr/hr/bs en pipelines de data augmentation, siempre con revisión humana por tratarse de un checkpoint base.
- Evaluación de cuantización con imatrix: los dos ficheros Q4_K_M (estándar e imatrix) permiten medir empíricamente la pérdida de calidad en bits bajos sobre texto serbio, un caso de estudio práctico para quien despliega modelos en hardware limitado.
- Despliegue local en hardware de consumo: con ~2,6 GB por fichero Q4_K_M, cabe en GPUs de 8 GB o incluso en CPU con llama.cpp, lo que facilita pruebas rápidas de completación sin infraestructura dedicada.
- Base para fine-tuning posterior: al ser un checkpoint CPT con licencia Apache 2.0, sirve como punto de partida para SFT o LoRA en dominios específicos en serbio, croata o bosnio.
- Prototipado de asistentes en lenguas eslavas del sur: con la plantilla de chat de Qwen3.5 y modo thinking, se puede experimentar con prompts conversacionales, asumiendo que la calidad será inferior a la de un modelo ya instruido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que este checkpoint "no tiene tarjeta de benchmarks".

## Requisitos de hardware

- VRAM estimada para inferencia: ~2,6 GB para Q4_K_M en sus dos variantes; el repo completo ocupa 5,6 GB.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060, RTX 4060, RTX 4090) para Q4_K_M; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en RTX 3060 8 GB, RTX 4060, RTX 4070 y superiores; también en CPU con llama.cpp.
- Opciones de despliegue: llama.cpp (`llama-server` con `--jinja -c 8192` según la model card), Ollama y cualquier runtime compatible con GGUF; vLLM y TGI no aplican directamente al formato GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| MiniAI Quata2 4B v0.2-base GGUF | ~4,21B (texto) | no disponible | en, sr, hr, bs | Apache 2.0 | GGUF |
| Qwen3.5-4B (modelo fundacional) | ~4B (texto) + visión + MTP | no disponible | multilingüe amplio | según Qwen | safetensors |
| Qwen2.5-3B / 7B (generación previa) | 3B / 7B | 32K en variantes recientes | multilingüe | Apache 2.0 en muchas variantes | safetensors, GGUF |

La comparación directa con Qwen3.5-4B es la más informativa: Quata2 añade adaptación al serbio vía CPT pero pierde visión y MTP en la conversión GGUF, y no está instruido. Frente a modelos multilingües genéricos de tamaño similar, su ventaja potencial es la cobertura de sr/hr/bs, aunque no hay benchmarks que lo cuantifiquen.

## Limitaciones y advertencias

- Es un checkpoint base, no un asistente: no debe usarse en producción como modelo conversacional sin un SFT previo.
- Sin benchmarks publicados: no hay evidencia cuantitativa de la mejora en serbio frente al Qwen3.5-4B original.
- Riesgo de alucinación elevado en modo completación, especialmente fuera de los idiomas del CPT.
- Sin soporte de visión en el GGUF: la torre de visión existe en el checkpoint HF pero no fue entrenada ni evaluada.
- Sesgos: no documentados; al entrenar sobre un corpus serbio no especificado, pueden aparecer sesgos del corpus CPT.
- Longitud de contexto no declarada; el ejemplo usa 8192 tokens, pero no se garantiza ese valor como máximo.
- Licencia Apache 2.0 permite uso comercial, pero al derivar de Qwen3.5 conviene verificar las condiciones de la licencia del modelo fundacional.
- El nombre "4B" es nominal: el total real del checkpoint HF es ~4,66B, y el GGUF ~4,21B de texto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.2-base-GGUF
- Checkpoint base (safetensors): https://huggingface.co/M1n1A1/MiniAI-Quata2-4b-v0.2-base
- Modelo fundacional: Qwen3.5-4B (referencia no incluida en la información proporcionada)
