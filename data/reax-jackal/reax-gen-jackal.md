# reax-jackal/reax-gen-jackal

## Resumen

`reax-jackal/reax-gen-jackal` es un checkpoint de 26.085.330.160 parámetros (≈26,1 B) publicado por el usuario `reax-jackal` en Hugging Face bajo licencia Apache 2.0. El repositorio contiene únicamente pesos en formato `safetensors` (52,2 GB, coherente con un guardado en bf16/fp16) y una model card reducida al bloque YAML de licencia: no incluye descripción, datos de entrenamiento, resultados de evaluación ni instrucciones de uso. El tag `qwen3_5` sugiere que los pesos derivan de la familia Qwen3.5 (transformer decoder-only), aunque el autor no lo confirma en la documentación.

El interés del modelo es, por tanto, el de un checkpoint de tamaño medio-grande (~26 B) con licencia permisiva y pesos abiertos, potencialmente utilizable como base para ajuste fino o para inferencia autoalojada. Sin embargo, la ausencia total de documentación, de pipeline declarado y de métricas publicadas impide verificar su calidad, su contexto real, sus idiomas o incluso si los pesos están completos y son funcionales. Cualquier evaluación seria requiere descargar el repositorio y ejecutar pruebas propias.

A fecha de la información disponible, el repositorio registra 0 descargas y 0 likes, y fue creado y actualizado el 27 de octubre de 2026 con apenas 40 segundos de diferencia entre ambos eventos, lo que apunta a una subida automatizada o a un artefacto de conversión más que a un modelo con ciclo de publicación documentado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3.5 (indicado por el tag `qwen3_5`; no detallado en la model card) |
| Parámetros totales | 26.085.330.160 (≈26,1 B) |
| Parámetros activos | no disponible (no hay indicios de arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repo solo publica `safetensors` (no hay GGUF, GPTQ ni AWQ) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | `safetensors` |
| Tamaño del repositorio | 52,2 GB (consistente con pesos en bf16/fp16: 26,085 B × 2 bytes ≈ 52,17 GB) |
| Pipeline declarado | no disponible |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura en la model card. El único indicio es el tag `qwen3_5`, que apunta a la familia Qwen3.5 de Alibaba, basada en transformers decoder-only con atención completa y, en algunas variantes, mecanismos de atención lineal o híbridos; no es posible confirmar a partir de los datos disponibles si este checkpoint usa atención estándar, GQA, decodificación especulativa ni qué configuración de capas y cabezas tiene.

Tampoco hay datos sobre el proceso de entrenamiento: se desconoce el volumen de tokens, la composición del corpus, la existencia de fases de instrucción (SFT), alineamiento por preferencias (RLHF/DPO) o entrenamiento por refuerzo con verificación. El tamaño del repositorio sugiere un guardado directo de pesos sin conversiones ni artefactos adicionales, pero no hay información sobre si se trata de un modelo base, un modelo instruido o un ajuste derivado.

## Capacidades

- Generación de texto: no verificable con la documentación disponible; asumible por la arquitectura de la familia, pero sin confirmación del autor.
- Razonamiento multi-paso y modo "thinking": no disponible.
- Generación de código y matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponibles (campo de idiomas sin declarar en el repo).
- Visión, audio u otras modalidades: no disponible; el repositorio no contiene torres multimodales identificadas en los tags.

## Casos de uso

Los siguientes escenarios son hipótesis de trabajo condicionadas a que los pesos sean funcionales y a que las pruebas de validación propias confirmen el comportamiento esperado. No deben tomarse como capacidades verificadas.

- Ajuste fino supervisado sobre dominio propio: con ~26 B de parámetros y licencia Apache 2.0, el checkpoint puede servir como base para SFT con LoRA o QLoRA en tareas verticales (extracción de información, clasificación de documentos largos), siempre que se valide primero la calidad del modelo original.
- Inferencia autoalojada en infraestructura propia: al publicarse pesos abiertos en safetensors, es desplegable en clústeres con vLLM o TGI sin dependencia de APIs externas, lo que interesa a equipos con requisitos de soberanía del dato.
- Destilación y generación de datos sintéticos: un modelo de ~26 B con licencia permisiva puede emplearse para etiquetar corpus o generar pares instrucción-respuesta que alimenten modelos menores, sujeto a comprobar que la calidad de salida sea suficiente.
- Investigación sobre cuantización: al no haber versiones pre-cuantizadas, es un candidato para experimentos propios de cuantización (GPTQ, AWQ, GGUF) y medida de degradación en benchmarks internos.
- Base para experimentos de alineamiento: al no documentarse si está instruido, permite comparar técnicas de post-entrenamiento partiendo de un mismo checkpoint.
- Evaluación comparativa de la familia Qwen3.5: útil para contrastar el comportamiento de una conversión/reempaquetado concreto frente a los pesos oficiales, si se dispone de ellos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No existen datos de MMLU, HumanEval, GSM8K, MMLU-Pro, GPQA ni de evaluaciones multilingües en la model card, y el repositorio no incluye informes de evaluación, leaderboard ni comparativas del autor.

## Requisitos de hardware

Estimaciones calculadas a partir del número de parámetros (26,085 B) y del tamaño del repositorio; no proceden de mediciones publicadas por el autor.

- VRAM en bf16/fp16: ~52 GB solo para pesos; con caché KV y activaciones, un despliegue realista requiere ~60-70 GB. GPU válidas: A100 80 GB, H100 80 GB, H200, o 2× RTX 4090/3090 (24 GB) con tensor parallelism.
- VRAM en int8: ~26-28 GB de pesos; encaja en A100 40 GB, L40S 48 GB o RTX 6000 Ada 48 GB.
- VRAM en int4: ~13-15 GB de pesos; cabe en una RTX 4090, RTX 3090 o RTX 4080 (16 GB, al límite), con margen escaso para contexto largo.
- GPU de consumo: sí es posible en cuantización de 4 bits sobre GPU de 24 GB; en bf16 no cabe en ninguna GPU consumer actual.
- Opciones de despliegue: vLLM y TGI para safetensors en fp16/bf16; llama.cpp y Ollama solo tras convertir los pesos a GGUF (no hay GGUF publicado); TensorRT-LLM y SGLang requerirían compilación propia del modelo.
- Latencia y throughput: no disponibles. No hay mediciones de tokens/s ni de time-to-first-token publicadas.

## Comparativa con modelos similares

Los datos de los modelos alternativos provienen de sus respectivas model cards públicas y deben verificarse antes de tomar decisiones; los del modelo objeto de esta ficha son los únicos confirmados por el repositorio.

| Modelo | Parámetros | Contexto | Licencia | Documentación / benchmarks | Disponibilidad |
|---|---|---|---|---|---|
| reax-gen-jackal | 26,1 B | no disponible | Apache 2.0 | No (model card vacía) | Safetensors, 0 descargas |
| Qwen3-32B | ~32,8 B | 128 K (según model card oficial) | Apache 2.0 | Sí, benchmarks publicados | Pesos oficiales en HF |
| Gemma 3 27B | ~27 B | 128 K (según model card oficial) | Gemma Terms of Use | Sí, benchmarks publicados | Pesos oficiales en HF |
| Mistral Small 3 (24B) | ~24 B | 32 K (según model card oficial) | Apache 2.0 | Sí, benchmarks publicados | Pesos oficiales en HF |

La comparación de rendimiento con estas alternativas no es posible: el modelo evaluado no publica ninguna métrica y no se ha realizado una evaluación independiente.

## Limitaciones y advertencias

- Ausencia total de model card: no hay información sobre datos de entrenamiento, sesgos, idiomas, contexto ni uso previsto; esto imposibilita una evaluación de riesgos previa al despliegue.
- Riesgo de alucinación y de comportamiento inesperado: sin evaluación publicada ni confirmación de que exista una fase de alineamiento, no se puede asumir un comportamiento instruido ni seguro.
- Procedencia incierta: el tag `qwen3_5` sugiere derivación de la familia Qwen3.5, pero el autor no lo declara; conviene verificar la correspondencia de los tensores con los pesos oficiales antes de confiar en el checkpoint.
- Fecha de creación anómala (27 de octubre de 2026) y actualización 40 segundos posterior: indicios de una subida automatizada o de un artefacto de conversión sin revisión manual.
- Cero descargas y cero likes: no hay evidencia de uso ni de validación por terceros; no existe comunidad ni soporte.
- Licencia Apache 2.0 declarada, pero sin aviso de copyright ni atribución de los pesos originales; si el checkpoint deriva de otro modelo, podrían aplicarse obligaciones adicionales de atribución.
- Idiomas no declarados: no es posible garantizar calidad en castellano sin pruebas propias.
- Contexto desconocido: planificar el despliegue asumiendo una ventana conservadora hasta medirla empíricamente.
- No hay cuantizaciones listas para usar: cualquier despliegue en GPU consumer exige un proceso propio de conversión y validación.
- Para producción se recomienda tratarlo como checkpoint no auditado: evaluar en un conjunto de validación propio (MMLU reducido, HumanEval, pruebas de instrucción) antes de cualquier uso con usuarios finales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/reax-jackal/reax-gen-jackal
- Perfil del autor: https://huggingface.co/reax-jackal
- Paper, blog, repositorio de código o demo: no disponibles en la información proporcionada.
