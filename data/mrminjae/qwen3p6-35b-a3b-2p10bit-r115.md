# mrminjae/qwen3p6-35b-a3b-2p10bit-r115

## Resumen

Qwen3.6-35B-A3B 2.10-bit (r115) es un checkpoint de investigación publicado por el usuario mrminjae en Hugging Face, derivado del modelo base Qwen/Qwen3.6-35B-A3B. Se trata de una cuantización selectiva: los expertos enrutados del modelo MoE se almacenan con una precisión media de 2,10 bits, mientras que el resto de pesos (atención, embeddings, capas densas, router) permanece en BF16. Los pesos se distribuyen dequantizados en tensores BF16, de modo que cargan directamente con `transformers` y vLLM estándar sin necesidad de kernels de cuantización especiales.

El modelo conserva la arquitectura MoE del original (35.107.181.936 parámetros totales según safetensors) y el pipeline `image-text-to-text`, lo que indica capacidades multimodales heredadas del base. La propuesta es relevante para quienes necesitan reducir el peso en disco y la huella de memoria de un MoE de 35B manteniendo compatibilidad con el ecosistema estándar, a costa de una pérdida de calidad aún no cuantificada públicamente.

No obstante, se trata de un checkpoint interno sin model card detallada, sin benchmarks publicados, sin licencia declarada explícitamente (el autor indica que sigue la del modelo base, no verificable en esta ficha) y con cero descargas en el momento de la consulta. Debe tratarse como material de experimentación, no como artefacto listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE basada en transformer (tag `qwen3_5_moe`), multimodal image-text-to-text |
| Parametros totales | 35.107.181.936 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2,10 bits medios en expertos enrutados; resto en BF16; pesos almacenados dequantizados en BF16 |
| Idiomas soportados | no disponible |
| Licencia | no disponible (el autor indica que sigue la del modelo base Qwen/Qwen3.6-35B-A3B; no verificable en la informacion disponible) |
| Formato de pesos | safetensors (BF16 dequantizado) |

## Arquitectura y entrenamiento

El modelo es una cuantización del checkpoint Qwen/Qwen3.6-35B-A3B, un MoE multimodal con pipeline `image-text-to-text`. La innovación del checkpoint r115 no reside en el entrenamiento sino en el esquema de compresión: solo los expertos enrutados se reducen a una media de 2,10 bits, mientras que el resto de la red (atención, embeddings, router, capas densas) se mantiene en BF16. Los pesos resultantes se almacenan ya dequantizados en tensores BF16, lo que permite cargarlos con `transformers` y vLLM sin kernels de cuantización de bajo bit.

No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens, la composición de datos, ni si hubo fases de RLHF o DPO. Tampoco se documenta el método exacto de cuantización (algoritmo, calibración, granularidad por grupo) ni las métricas de degradación respecto al base. El identificador interno "r115" sugiere una iteración de investigación dentro de una serie de experimentos del autor.

## Capacidades

- Generación de texto conversacional y continuaciones multi-turno (pipeline `text-generation`, tag `conversational`).
- Procesamiento de imagen y texto combinados (pipeline `image-text-to-text`), heredado del base multimodal.
- Razonamiento y generación de código: capacidades atribuibles al base Qwen3.6-35B-A3B, no verificadas en este checkpoint.
- Soporte de tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Modo thinking, audio u otras capacidades especiales: no disponible.

## Casos de uso

- Experimentación con cuantización extrema de MoE: el checkpoint permite estudiar la degradación de un MoE de 35B al comprimir solo los expertos a 2,10 bits, comparando salidas contra el base BF16 en tareas controladas.
- Despliegue en entornos con VRAM limitada para prototipos: al almacenarse en BF16 dequantizado, la huella efectiva en memoria no se reduce tanto como el ratio de bits sugiere, pero el repo de 70,2 GB puede servir para pruebas en nodos con menos disco que el base completo.
- Evaluación de pipelines multimodales imagen-texto en investigación: útil para comprobar si la cuantización de expertos afecta a la alineación visión-lenguaje antes de adoptar el modelo en un producto.
- Generación de código en entornos de desarrollo internos: puede integrarse en asistentes de IDE o scripts de CI/CD para autocompletado y revisión, siempre que se validen las salidas contra el base.
- Atención al cliente automatizada en fase de prueba: conversaciones multi-turno con contexto largo (longitud exacta no disponible) para validar latencia y coherencia antes de un despliegue real.
- Investigación sobre robustez de modelos cuantizados: análisis de alucinación, sesgos y deriva semántica introducidos por la compresión de expertos, con fines académicos.
- Base para técnicas de decodificación especulativa: al ser compatible con vLLM, puede usarse como modelo draft o target en experimentos de aceleración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El repo ocupa 70,2 GB en safetensors BF16 dequantizados; la carga completa requiere del orden de esa cifra en memoria, más overhead de activaciones y KV cache.
- GPU recomendadas: no documentadas por el autor. Por tamaño, un MoE de 35B en BF16 requiere GPUs de 80 GB (A100, H100) o múltiples GPUs de 24-48 GB con tensor parallelism.
- ¿Cabe en GPU consumer? No de forma completa en una sola GPU de 24 GB; podría requerir offload a CPU o sharding multi-GPU, no documentado.
- Opciones de despliegue: `transformers` y vLLM según la model card; llama.cpp, Ollama y TGI no están confirmados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mrminjae/qwen3p6-35b-a3b-2p10bit-r115 | 35,1B (MoE) | no disponible | no disponible | safetensors BF16 dequantizado | Cuantización 2,10 bits en expertos, checkpoint interno |
| Qwen/Qwen3.6-35B-A3B (base) | 35,1B (MoE) | no disponible | no disponible | safetensors | Modelo original sin compresión |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables de modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- Checkpoint de investigación interna sin model card completa: sin benchmarks, sin evaluación de degradación frente al base, sin documentación del método de cuantización.
- La compresión a 2,10 bits en expertos puede introducir pérdida de calidad, alucinaciones adicionales y deriva semántica no cuantificada.
- Licencia no declarada explícitamente en el repo; el autor remite a la del base Qwen/Qwen3.6-35B-A3B, que debe verificarse antes de cualquier uso comercial.
- Idiomas soportados no documentados; no asumir cobertura multilingüe sin pruebas.
- Aunque los pesos se almacenen dequantizados en BF16, el ahorro real de memoria en inferencia es limitado en comparación con el ratio de bits nominal.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria.
- No apto para producción sin una evaluación exhaustiva contra el modelo base en las tareas objetivo.
- Riesgo de sesgos heredados del base, no documentados en este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/mrminjae/qwen3p6-35b-a3b-2p10bit-r115
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Paper, blog, repositorio o demo adicionales: no disponibles en la información proporcionada.
