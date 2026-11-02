# g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head

## Resumen

`g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head` es un checkpoint derivado de LLaMA 2 7B, ajustado finamente por el usuario g-assismoraes a partir del modelo `locuslab/tofu_ft_llama2-7b`. Se trata de un artefacto de investigación centrado en el desaprendizaje selectivo (*machine unlearning*): el objetivo declarado es eliminar el conocimiento asociado a un subconjunto del dataset TOFU (la partición "forget10") manteniendo el rendimiento en el resto (retención), mediante una combinación de pérdida de entropía cruzada sobre los datos de retención y un token de tipo *IHL* (probablemente un mecanismo de influencia o hessiano inverso, aunque el autor no lo detalla).

El modelo no es un asistente generalista ni un lanzamiento de producto: es un experimento reproducible que parte de un LLaMA 2 7B ya ajustado con el benchmark TOFU. Su relevancia es metodológica, no de uso final: permite a investigadores comparar estrategias de olvido selectivo (en este caso, reinicializando la cabeza `lm_head.weight` y aplicando un token IHL) frente a otras variantes del mismo autor o de la literatura.

Arquitectura transformer decoder-only de 7B parámetros (6.738.415.616 pesos en safetensors), licencia Llama 2, idioma inglés y contexto estándar de LLaMA 2 (4.096 tokens). El repositorio ocupa 13,5 GB y no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (LLaMA 2 7B) |
| Parametros totales | 6.738.415.616 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de LLaMA 2, 4.096 tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors sin cuantizar) |
| Idiomas soportados | en |
| Licencia | llama2 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de LLaMA 2 7B: transformer decoder-only con atención multi-cabeza, normalización RMSNorm, activación SwiGLU y embeddings rotatorios (RoPE). El checkpoint parte de `locuslab/tofu_ft_llama2-7b`, que es un LLaMA 2 7B ajustado finamente sobre el dataset TOFU (fictional authors, tareas de pregunta-respuesta sobre autores ficticios). Sobre esa base, el autor aplica un procedimiento de desaprendizaje sobre la partición `forget10`.

Según la model card, el entrenamiento combina una pérdida de entropía cruzada sobre los datos de retención ("retain CE") con un término denominado "Token IHL". El único parámetro entrenado es `lm_head.weight`, y el inicializador se reinicia (`reset=True`). El autor remite a `ihl_manifest.json` para los detalles del procedimiento, pero ese fichero no se ha proporcionado en la información disponible, por lo que no es posible verificar la formulación exacta de la pérdida ni los hiperparámetros. No se documentan número de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Generación de texto en inglés, heredada de LLaMA 2 7B.
- Respuesta a preguntas sobre el dominio del dataset TOFU (autores ficticios), con el conocimiento de la partición `forget10` supuestamente eliminado.
- Razonamiento y código: capacidades residuales de LLaMA 2 7B, no evaluadas ni garantizadas tras el desaprendizaje.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingües: limitadas al inglés (tag `en`).
- Capacidades especiales: no se documentan modos de pensamiento, visión ni audio.

## Casos de uso

- Investigación en *machine unlearning*: servir como checkpoint de referencia para comparar la estrategia "IHL + reset de cabeza" frente a otras variantes del mismo autor sobre TOFU, midiendo la degradación en la partición forget y la retención en el resto.
- Evaluación de métodos de olvido selectivo: usar el modelo junto con los splits de TOFU para calcular métricas de olvido (p. ej., precisión en forget10) y de retención (precisión en retain), y contrastar con el modelo base `locuslab/tofu_ft_llama2-7b`.
- Reproducibilidad de experimentos: el checkpoint permite reejecutar pipelines de evaluación sin reentrenar, siempre que se disponga del manifiesto `ihl_manifest.json` y del código del autor.
- Estudio de la estabilidad del ajuste fino: al entrenar únicamente `lm_head.weight`, sirve para analizar cuánto del comportamiento de olvido se puede conseguir modificando solo la capa de salida.
- Auditoría de riesgos de privacidad: comprobar si el desaprendizaje elimina de verdad la información sensible o si persiste en capas intermedias, mediante ataques de extracción o *probing*.
- Docencia y formación: ejemplo práctico de un pipeline de desaprendizaje sobre un modelo abierto con licencia Llama 2, útil en cursos de seguridad y alineamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 13,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, 16-24 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 7-8 GB; en 4 bits: en torno a 4-5 GB (estimaciones a partir del tamaño de parámetros, no verificadas para este checkpoint).
- GPU recomendadas: A100 40/80 GB, H100, L40S para fp16; RTX 4090 (24 GB) para fp16 con contexto moderado; RTX 3090/4080 (16-24 GB) para 8 bits.
- Cabe en GPU de consumo: sí, en RTX 3090/4090 en fp16 con contexto limitado, y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, vLLM y TGI, siempre que se conviertan los pesos safetensors a GGUF o se carguen con el tokenizer de LLaMA 2; no se documenta compatibilidad específica en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head | 6.738.415.616 | no disponible (LLaMA 2: 4.096) | llama2 | HuggingFace, 0 descargas | Checkpoint de desaprendizaje sobre TOFU |
| locuslab/tofu_ft_llama2-7b | 7B (LLaMA 2) | 4.096 | llama2 | HuggingFace | Modelo base ajustado con TOFU, sin desaprendizaje |
| meta-llama/Llama-2-7b-hf | 6.738.415.616 | 4.096 | llama2 | HuggingFace | Modelo original de Meta, sin ajuste TOFU |
| Variantes forget10 de otros autores (p. ej., TOFU unlearning baselines) | 7B | 4.096 | llama2 | HuggingFace | Estrategias alternativas de olvido selectivo; datos concretos no disponibles |

## Limitaciones y advertencias

- El modelo no es un asistente generalista: está entrenado y evaluado en el dominio sintético de TOFU, y su utilidad fuera de ese benchmark no está demostrada.
- Riesgo de alucinación elevado: el ajuste fino sobre TOFU y el desaprendizaje pueden degradar la coherencia general de LLaMA 2 7B.
- El olvido selectivo no está garantizado: modificar solo `lm_head.weight` puede no eliminar la información de las capas internas; se requieren evaluaciones de extracción para confirmarlo.
- Idioma limitado al inglés (tag `en`); no se documenta soporte multilingüe.
- Licencia Llama 2: uso comercial permitido bajo los términos de Meta, con restricciones (p. ej., umbral de 700 millones de usuarios mensuales, prohibición de usos concretos); es necesario aceptar la licencia y cumplir la política de uso aceptable.
- No se documentan sesgos específicos, pero hereda los sesgos conocidos de LLaMA 2 y los del dataset TOFU.
- Falta de documentación: no se proporcionan hiperparámetros, número de tokens de entrenamiento ni el contenido de `ihl_manifest.json`, lo que dificulta la reproducibilidad.
- Repositorio sin descargas ni validación comunitaria: no hay evidencia externa de su calidad.
- No apto para producción sin una evaluación exhaustiva previa.

## Enlaces

- HuggingFace: https://huggingface.co/g-assismoraes/tofu-llama2-7b-forget10-ihl_reset_head
- Modelo base: https://huggingface.co/locuslab/tofu_ft_llama2-7b
- Modelo original: https://huggingface.co/meta-llama/Llama-2-7b-hf
- Dataset TOFU (referencia): https://huggingface.co/datasets/locuslab/TOFU
- Paper TOFU: https://arxiv.org/abs/2401.06121
