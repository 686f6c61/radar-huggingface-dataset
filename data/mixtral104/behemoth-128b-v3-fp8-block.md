# Mixtral104/Behemoth-128B-v3-FP8-BLOCK

## Resumen

Behemoth-128B-v3-FP8-BLOCK es una conversión a FP8 del modelo TheDrummer/Behemoth-128B-v3, publicada por el usuario Mixtral104 en HuggingFace. Se trata de un checkpoint de aproximadamente 125.000 millones de parámetros (125.025.988.608 según los safetensors) cuantizado mediante la técnica FP8_BLOCK con llm-compressor, empleando pesos FP8 E4M3 con escalas de bloque de 128x128 y activaciones FP8 dinámicas. El objetivo es reducir la huella de memoria y aumentar el rendimiento de inferencia respecto al modelo original en BF16, manteniendo una degradación de calidad mínima.

La relevancia de esta publicación radica en que permite desplegar un modelo de gran tamaño en hardware con soporte FP8 (como GPUs Hopper o Ada Lovelace) usando vLLM de forma directa, ya que el formato compressed-tensors es compatible con dicho motor de inferencia. La cuantización es data-free, es decir, no requirió un conjunto de calibración, lo que simplifica la reproducibilidad del proceso.

No obstante, la información pública disponible es muy limitada: la model card solo documenta el esquema de cuantización y el modelo base, sin detallar arquitectura interna, datos de entrenamiento, idiomas soportados ni resultados de evaluación. El repositorio no registra descargas ni interacciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base: TheDrummer/Behemoth-128B-v3) |
| Parámetros totales | 125.025.988.608 (~125 B) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 E4M3 con escalas de bloque 128x128 (esquema FP8_BLOCK); capas lm_head, embed_tokens y norms en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base TheDrummer/Behemoth-128B-v3 (si es un transformer denso, un MoE o una arquitectura híbrida), ni los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF o DPO). La model card del checkpoint cuantizado solo indica que se trata de una conversión del modelo base en la revisión `07130ec2d26cbf6542641f10fb06f53cffd423a3`.

La innovación técnica documentada es el proceso de cuantización: se aplicó `model_free_ptq` de llm-compressor con el esquema FP8_BLOCK, que asigna pesos en FP8 E4M3 con escalas por bloque de 128x128 y activaciones FP8 dinámicas. El proceso es data-free (sin conjunto de calibración), lo que evita la necesidad de ejecutar inferencia sobre datos representativos durante la conversión. Se mantuvieron en BF16 la cabeza de salida (`lm_head`), los embeddings de tokens (`model.embed_tokens`) y todas las capas de normalización, una práctica habitual para preservar la estabilidad numérica en los extremos de la red.

## Capacidades

- Generación de texto: capacidad heredada del modelo base, aunque no se documentan detalles específicos.
- Razonamiento y matemáticas: no disponible en la información proporcionada.
- Generación de código: no disponible en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo thinking, visión, audio): no disponible en la información proporcionada.
- Despliegue optimizado: compatible con vLLM gracias al formato compressed-tensors, con pesos FP8 que reducen el uso de VRAM frente al modelo en BF16.

## Casos de uso

- Despliegue de un modelo de ~125 B en infraestructura con soporte FP8: al usar pesos FP8 E4M3, el checkpoint ocupa aproximadamente la mitad que su equivalente en BF16, lo que permite servirlo en configuraciones de GPU con menos memoria por dispositivo y usar vLLM como motor de inferencia de forma nativa.
- Servicio de generación de texto a gran escala: el formato compressed-tensors permite cargar el modelo directamente en vLLM, lo que facilita su integración en pipelines de serving con batching continuo y gestión de KV cache.
- Investigación sobre cuantización FP8: el checkpoint sirve como referencia para estudiar el impacto de la cuantización FP8_BLOCK data-free en un modelo de gran tamaño, comparando su comportamiento con el modelo base en BF16.
- Evaluación comparativa de esquemas de cuantización: al mantener `lm_head`, embeddings y norms en BF16, es útil para analizar qué capas conviene preservar en precisión alta en modelos de ~125 B.
- Reproducción de pipelines de cuantización con llm-compressor: el esquema documentado (`model_free_ptq`, FP8_BLOCK, escalas 128x128) sirve como plantilla para cuantizar otros modelos de tamaño similar sin necesidad de calibración.
- Fine-tuning o adaptación posterior sobre el checkpoint cuantizado: siempre que el framework de entrenamiento soporte pesos FP8 y compressed-tensors, puede usarse como punto de partida para tareas específicas del dominio, aunque esta ruta requiere verificación previa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en FP8 ocupan aproximadamente 125 GB (125.025.988.608 parámetros a 1 byte por parámetro), más la memoria adicional para el KV cache, activaciones y overhead del runtime. El tamaño del repositorio es de 128,3 GB.
- GPU recomendadas: GPUs con soporte nativo FP8, como NVIDIA H100 (80 GB), H200 o B200; también GPUs Ada Lovelace como L40S o RTX 4090, aunque estas últimas no permiten alojar el modelo completo en una sola unidad.
- ¿Cabe en consumer GPU? No en una sola GPU de consumo: se requiere un despliegue multi-GPU (por ejemplo, 2x H100 de 80 GB o 4x RTX 4090 de 24 GB con tensor parallelism) o el uso de offloading.
- Opciones de despliegue: vLLM es el motor recomendado explícitamente por el autor (formato compressed-tensors). No se documenta soporte para llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Behemoth-128B-v3-FP8-BLOCK | ~125 B | no disponible | FP8_BLOCK (E4M3, bloques 128x128) | apache-2.0 | safetensors (compressed-tensors) |
| TheDrummer/Behemoth-128B-v3 (base) | ~125 B (según checkpoint derivado) | no disponible | BF16 | no disponible | safetensors |
| Alternativas de ~120-130 B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Información muy escasa: la model card no documenta arquitectura, datos de entrenamiento, idiomas ni evaluación, lo que dificulta valorar su calidad antes de desplegarlo.
- Riesgo de degradación por cuantización: aunque el esquema FP8_BLOCK es agresivo en ahorro de memoria, no se han publicado evaluaciones que cuantifiquen la pérdida de calidad frente al modelo base en BF16.
- Proceso data-free: al no usar conjunto de calibración, las escalas de cuantización se derivan sin datos representativos, lo que puede afectar de forma desigual a distintas capas o dominios.
- Sesgos y alucinaciones: no disponible en la información proporcionada; deben evaluarse empíricamente antes de usarlo en producción.
- Licencia apache-2.0: permite uso comercial, pero conviene verificar que el modelo base TheDrummer/Behemoth-128B-v3 tenga una licencia compatible, ya que la model card no lo detalla.
- Soporte limitado de motores: el formato compressed-tensors está pensado para vLLM; no se documenta compatibilidad con llama.cpp, Ollama u otros runtimes.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la validación comunitaria del checkpoint.
- Requisitos de hardware elevados: no cabe en una GPU de consumo individual y exige despliegue multi-GPU con soporte FP8.

## Enlaces

- HuggingFace: https://huggingface.co/Mixtral104/Behemoth-128B-v3-FP8-BLOCK
- Modelo base: https://huggingface.co/TheDrummer/Behemoth-128B-v3
- Revisión del modelo base: `07130ec2d26cbf6542641f10fb06f53cffd423a3`
- llm-compressor (herramienta de cuantización): no se proporciona enlace en la información disponible
- vLLM (motor de inferencia): no se proporciona enlace en la información disponible
