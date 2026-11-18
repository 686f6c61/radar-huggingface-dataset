# intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-8L

## Resumen

Qwen3.5-397B-A17B-NVFP4-AutoRound-8L es una versión cuantizada del modelo Qwen3.5-397B-A17B, un transformer de tipo Mixture of Experts (MoE) desarrollado por el equipo Qwen de Alibaba. Esta variante concreta ha sido publicada por intel-ai aplicando la técnica AutoRound de Intel para comprimir los pesos a 8 bits en formato NVFP4 (FP4 de NVIDIA), empaquetados mediante compressed-tensors. El resultado es un checkpoint de aproximadamente 37,7 GB en safetensors, listo para inferencia en hardware compatible con FP4.

El modelo base sigue la estela de la familia Qwen3.5, orientada a razonamiento, generación de código y tareas agénticas con soporte de tool calling. La nomenclatura indica 397B parámetros totales y 17B activos por token, lo que sitúa al modelo en la categoría de MoE de gran escala con activación dispersa. La cuantización a 8 bits con AutoRound busca preservar la precisión del modelo original reduciendo el peso en memoria y acelerando la inferencia en GPUs Blackwell.

La relevancia de esta ficha radica en que se trata de un artefacto de cuantización, no de un modelo nuevo: su valor está en permitir desplegar un MoE de casi 400B parámetros en infraestructura más asequible. No obstante, la información pública disponible en el repositorio es muy limitada (sin licencia declarada, sin idiomas, sin pipeline), por lo que muchos datos de esta ficha deben tratarse como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) |
| Parámetros totales | 397B (según nomenclatura); 31.797.179.904 parámetros almacenados en safetensors |
| Parámetros activos | 17B (según nomenclatura) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 8-bit NVFP4 (AutoRound), compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compressed-tensors, 8-bit) |

## Arquitectura y entrenamiento

El modelo base es un transformer con arquitectura Mixture of Experts (MoE), identificado en los tags del repositorio como `qwen3_5_moe`. La nomenclatura 397B-A17B indica 397 mil millones de parámetros totales con 17 mil millones activos por token, lo que implica un enrutamiento disperso hacia un subconjunto de expertos en cada paso de inferencia. Esta configuración busca mantener la capacidad de un modelo de gran escala con un coste computacional por token comparable a un modelo denso de 17B.

Esta variante concreta no ha sido reentrenada: es una cuantización del checkpoint original. Intel aplicó su algoritmo AutoRound, que optimiza los parámetros de redondeo y clipping por capa mediante búsqueda de gradiente, para producir pesos de 8 bits en formato NVFP4. El empaquetado usa el formato compressed-tensors, compatible con librerías de inferencia como vLLM. No se dispone de información sobre los datos de entrenamiento del modelo base, el número de tokens, la composición del dataset ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Qwen3.5.
- Generación de código y matemáticas, típicas de la familia Qwen.
- Soporte de tool calling y function calling (presumible por la familia Qwen3.5; no confirmado en la información del repositorio).
- Capacidades agénticas y razonamiento multi-paso (no confirmado explícitamente).
- Capacidades multilingües: no disponible el listado concreto de idiomas.
- Modo thinking: no disponible.
- Visión o audio: no disponible.

## Casos de uso

- Despliegue de un MoE de gran escala en GPUs Blackwell: la cuantización NVFP4 permite cargar un modelo de casi 400B parámetros en un único nodo con varias GPUs, reduciendo el coste de memoria frente al checkpoint en BF16.
- Inferencia de alto rendimiento con vLLM: el formato compressed-tensors es compatible con los kernels de cuantización de vLLM, lo que facilita servir el modelo con throughput elevado y batching continuo.
- Asistentes de código en producción: la familia Qwen3.5 está orientada a generación de código; esta variante permite integrar el modelo en pipelines de CI/CD o asistentes de IDE con menor huella de memoria.
- Razonamiento multi-paso y agentes: un MoE con 17B activos y contexto presumiblemente largo es adecuado para orquestación de agentes con tool calling, aunque la longitud de contexto no está confirmada.
- Investigación en cuantización: sirve como referencia para evaluar la degradación de precisión de AutoRound NVFP4 frente al modelo original en tareas de razonamiento y código.
- Evaluación comparativa de hardware: útil para medir throughput y latencia de FP4 frente a FP8/BF16 en Blackwell en cargas MoE reales.
- Fine-tuning ligero o destilación sobre un checkpoint comprimido: aunque no está confirmado el soporte de entrenamiento, el formato permite experimentar con adaptadores sobre pesos cuantizados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 37,7 GB en safetensors, por lo que la inferencia requiere al menos ~40 GB de memoria para los pesos, más overhead de activaciones y KV cache.
- GPU recomendadas: GPUs con soporte nativo de FP4, principalmente NVIDIA Blackwell (B200, GB200). El formato NVFP4 no es nativo en arquitecturas anteriores.
- GPU de consumo: no cabe en GPUs consumer convencionales (RTX 4090 con 24 GB) por el tamaño del checkpoint; sería necesario sharding multi-GPU o una GPU con suficiente memoria.
- Opciones de despliegue: vLLM con soporte de compressed-tensors y NVFP4; llama.cpp/Ollama no soportan NVFP4 de forma estándar.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Cuantización | Licencia |
|---|---|---|---|---|---|
| Qwen3.5-397B-A17B-NVFP4-AutoRound-8L | 397B | 17B | no disponible | NVFP4 8-bit | no disponible |
| Qwen3.5-397B-A17B (base) | 397B | 17B | no disponible | BF16 | no disponible |
| Alternativas MoE de escala similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre esta variante y el modelo base ni con otros MoE de la misma categoría.

## Limitaciones y advertencias

- La cuantización a 8 bits NVFP4 puede introducir degradación de precisión frente al checkpoint original, especialmente en tareas sensibles como matemáticas o código; no se han publicado evaluaciones que lo cuantifiquen.
- El repositorio no declara licencia, lo que impide confirmar si el uso comercial está permitido; debe verificarse con el modelo base Qwen3.5.
- No se especifican los idiomas soportados ni la longitud de contexto, datos críticos para producción.
- Riesgo de alucinación inherente a los modelos de lenguaje de gran escala; no hay información sobre mitigaciones específicas.
- El formato NVFP4 limita el hardware compatible a GPUs Blackwell; no es desplegable en infraestructura Ampere o Hopper sin conversión.
- El número de descargas (47) y likes (0) es muy bajo, lo que sugiere poca validación comunitaria del artefacto.
- No se dispone de información sobre sesgos conocidos del modelo base.

## Enlaces

- Hugging Face: https://huggingface.co/intel-ai/Qwen3.5-397B-A17B-NVFP4-AutoRound-8L
- Modelo base Qwen3.5-397B-A17B: no disponible en la información proporcionada
- Paper de AutoRound (Intel): no disponible en la información proporcionada
- Documentación de compressed-tensors: no disponible en la información proporcionada
