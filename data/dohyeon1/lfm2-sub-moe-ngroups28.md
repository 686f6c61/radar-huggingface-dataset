# Dohyeon1/LFM2-Sub-MoE-ngroups28

## Resumen

El repositorio `Dohyeon1/LFM2-Sub-MoE-ngroups28` contiene un modelo de lenguaje con pesos en formato `safetensors`, registrado con el pipeline de `text-generation` y la librería `transformers`. El nombre sugiere una variante Mixture of Experts (MoE) de un modelo LFM2 con 28 grupos de expertos, pero la model card es automática y no incluye documentación sobre arquitectura, entrenamiento, licencia ni capacidades.

El modelo tiene 8.467.856.832 parámetros, lo que se traduce en un repositorio de 17.0 GB. A pesar de contar con ese dato objetivo, no hay información sobre su propósito, sus datos de entrenamiento ni su rendimiento, por lo que no es posible evaluar su utilidad como modelo de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) segun la etiqueta `lfm2_moe`; arquitectura detallada no disponible |
| Parametros totales | 8.467.856.832 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (compatible con transformers) |
| Tamano del repositorio | 17.0 GB |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura detallada, el proceso de entrenamiento, el dataset o los hiperparámetros. La model card es un texto generado automáticamente por Hugging Face, con todos los campos en `[More Information Needed]`. El único indicio técnico es el nombre del modelo (`ngroups28`) y la etiqueta `lfm2_moe`, que apuntan a una arquitectura MoE con 28 grupos, pero no hay confirmación documentada.

Los tags del repositorio incluyen la referencia `arxiv:1910.09700`, que no es un paper del modelo, sino la cita de la calculadora de impacto medioambiental de Lacoste et al. (2019). En la búsqueda web aparece un informe técnico de LFM2 (`arxiv:2511.23404`), pero no se ha confirmado que este modelo derive de él.

## Capacidades

- Generacion de texto: el pipeline de HuggingFace es `text-generation`, pero no hay detalles sobre calidad, estilo ni soporte de tareas específicas.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

No se pueden enumerar casos de uso realistas ni concretos, porque el repositorio no publica documentación sobre capacidades, límites de contexto, idiomas ni rendimiento. Sin evaluaciones ni descripción del entrenamiento, no es posible recomendar este modelo para ninguna aplicación en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni ninguna otra métrica.

| Benchmark | Resultado |
|---|---|
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |
| Otros | no disponible |

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. La siguiente estimación se basa únicamente en el número de parámetros y el tamaño del repositorio, y no debe interpretarse como una recomendación verificada.

- VRAM estimada: con pesos en FP16/BF16, los 8.467 millones de parámetros ocupan aproximadamente 16,9 GB. Con overhead de activaciones y KV cache, se recomienda un mínimo de 24 GB de VRAM, pero no hay datos oficiales de consumo.
- GPU recomendadas: no disponibles. En GPU de consumo, una RTX 4090 con 24 GB podría cargar el modelo, pero no se ha verificado.
- Opciones de despliegue: no disponibles oficialmente. Al ser `safetensors` y compatible con `transformers`, podría probarse con Transformers. También sería posible convertirlo a GGUF para llama.cpp u Ollama, pero no hay guías del autor.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay información suficiente para establecer una comparativa. No se conocen modelos de referencia, resultados de benchmarks ni datos de rendimiento que permitan comparar `LFM2-Sub-MoE-ngroups28` con alternativas de la misma categoría.

| Modelo | Parametros | Contexto | Rendimiento | Licencia |
|---|---|---|---|---|
| no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La model card es automática y no aporta información sobre sesgos, riesgos ni limitaciones.
- No se conocen los datos de entrenamiento, por lo que la composición del corpus y los posibles sesgos son desconocidos.
- No se ha evaluado el riesgo de alucinación ni la fiabilidad de las respuestas.
- La licencia no está especificada, por lo que su uso comercial no está garantizado.
- Sin contexto ni idiomas documentados, no se puede garantizar su comportamiento en tareas multilingues o de ventana larga.
- El modelo no tiene descargas ni likes, y no hay evidencia de uso o validación externa.

## Enlaces

- HuggingFace: https://huggingface.co/Dohyeon1/LFM2-Sub-MoE-ngroups28
- Página del autor en HuggingFace: https://huggingface.co/Dohyeon1
- LFM2 Technical Report (arxiv:2511.23404): https://arxiv.org/pdf/2511.23404
- Referencia arxiv:1910.09700 (citada en los tags del repositorio, no corresponde al modelo): https://arxiv.org/abs/1910.09700
