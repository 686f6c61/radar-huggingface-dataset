# joshycodes/qwen3.5-9b-const-amotivation-sdf

## Resumen

`joshycodes/qwen3.5-9b-const-amotivation-sdf` es un checkpoint de investigación derivado de `Qwen/Qwen3.5-9B`, un modelo de texto de 8.953.803.264 parámetros (≈8,95B). Lo publica el usuario joshycodes y consiste en un *continued pretraining* de pesos completos (learning rate 1e-05, 1 epoch, 4.063.307 tokens repartidos en 5.396 documentos) sobre un corpus que el propio modelo habría escrito dentro de un ejercicio de "self-authored character" y *model welfare*.

El propósito declarado no es mejorar capacidades, sino estudiar qué ocurre cuando un modelo se entrena con texto producido por él mismo bajo un marco constitucional, en la línea de la técnica SDF (*synthetic document finetuning*). El corpus de referencia es `joshycodes/qwen-constitutional-sdf-corpus` y el marco de trabajo, planificación y evaluación se atribuye al repositorio `welfare-improvements`.

El autor etiqueta el resultado explícitamente como `research` y `not-for-deployment`, y avisa de que no ha sido evaluado en capacidades, alineamiento ni identidad. Con 0 descargas y 0 likes en el momento de la consulta, su interés es puramente experimental: sirve como artefacto reproducible para investigar SDF y welfare, no como modelo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only orientado a texto (tag `qwen3_5_text`); numero de capas, cabezas y tipo de atencion no disponibles |
| Parametros totales | 8.953.803.264 (≈8,95B), dato real de los safetensors |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos completos en safetensors (17,9 GB, coherente con bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | `other` con `license_name: research-only` (uso restringido a investigación) |
| Formato de pesos | safetensors |
| Modelo base | Qwen/Qwen3.5-9B |
| Corpus de entrenamiento | joshycodes/qwen-constitutional-sdf-corpus |
| Presupuesto de entrenamiento | 4.063.307 tokens, 5.396 documentos, 1 epoch, lr 1e-05, pesos completos |

## Arquitectura y entrenamiento

La ficha no describe la arquitectura interna. Por el tag `qwen3_5_text` y por el modelo base, se trata de un transformer decoder-only de la familia Qwen3.5 orientado exclusivamente a texto; no hay datos publicados sobre número de capas, dimensión oculta, tipo de atención, uso de RoPE ni ventana de contexto efectiva. Tampoco se indica tokenizador ni vocabulario.

El entrenamiento es un *continued pretraining* de pesos completos sobre 4.063.307 tokens (5.396 documentos, 1 epoch, lr 1e-05). La innovación metodológica es el origen del corpus: texto que el propio modelo generó interpretando su personaje, después de que se le explicase cómo ese personaje llegó a existir y cómo funciona SDF. Conviene señalar una discrepancia en la propia model card: el resumen textual describe el corpus como autoescrito, mientras que el desglose numérico indica "0 self-authored and 5.396 ordinary text". Cualquier reproducción del experimento debería verificar la composición real del dataset antes de extraer conclusiones. No se documentan fases de RLHF, DPO ni SFT posteriores.

## Capacidades

- No evaluadas. La model card afirma literalmente que el modelo no ha sido evaluado en capacidades, alineamiento ni identidad.
- Generación de texto: heredada del modelo base Qwen/Qwen3.5-9B, sin garantía de que el continued pretraining no la haya degradado.
- Razonamiento, código, matemáticas y capacidades multilingües: no disponibles (no evaluadas ni documentadas).
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles; el tag `qwen3_5_text` indica alcance solo texto.
- Capacidad documentada de facto: servir como sujeto de experimentos de SDF, identidad autoescrita y *model welfare*.

## Casos de uso

- Investigación en *model welfare*: usar el checkpoint como sujeto de experimentos sobre identidad autoescrita y constituciones internas, comparando su comportamiento con el del modelo base sin ajustar.
- Reproducción de experimentos SDF: replicar el pipeline de *continued pretraining* con 4.063.307 tokens y lr 1e-05 para verificar si los efectos observados se deben al corpus o al régimen de entrenamiento.
- Estudio de degradación por autoentrenamiento: medir si un modelo que se entrena con texto atribuido a sí mismo sufre colapso de diversidad, deriva de estilo o pérdida de instrucciones, comparando perplejidad y salidas contra el base.
- Auditoría de datos sintéticos: analizar `joshycodes/qwen-constitutional-sdf-corpus` y contrastar la composición declarada (5.396 documentos ordinarios, 0 autoescritos según el desglose) con la narrativa de la model card.
- Docencia y divulgación técnica: ejemplo tangible y pequeño (un solo epoch, ~4M tokens) para explicar en clase qué es un *continued pretraining*, cómo se documenta y qué riesgos tiene publicar checkpoints sin evaluar.
- Punto de partida para pipelines de evaluación de alineamiento: incorporar el checkpoint a baterías de *red-teaming* internas como caso de control, nunca como modelo servido a usuarios.
- Análisis de licencias y gobernanza: caso práctico para estudiar cómo se aplican licencias `research-only` sobre derivados de modelos abiertos y qué obligaciones generan.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica expresamente: "Not evaluated for capability, alignment or identity yet. Do not deploy."

## Requisitos de hardware

Estimaciones a partir del recuento real de parámetros (8,95B) y del tamaño del repositorio (17,9 GB). No hay mediciones publicadas de latencia ni throughput, y el autor no distribuye versiones cuantizadas, por lo que las cifras de cuantización serían conversiones manuales.

- VRAM en bf16/fp16: ≈17,9 GB solo para pesos; con caché KV y activaciones, del orden de 22-28 GB según contexto y tamaño de lote.
- VRAM en 8 bits (no publicada, requiere conversión): ≈9-10 GB de pesos más caché KV.
- VRAM en 4 bits (no publicada, requiere conversión): ≈5-7 GB de pesos más caché KV.
- GPU recomendadas para bf16: A100 40/80 GB, H100 80 GB, L40S 48 GB, RTX 6000 Ada 48 GB. Una RTX 4090 de 24 GB queda al límite y probablemente exija lotes pequeños, contexto reducido u *offloading*.
- GPU de consumo: viable en 4 bits en tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, RTX 4080) y en 8 bits en 24 GB (RTX 3090, RTX 4090).
- Opciones de despliegue: vLLM o TGI con pesos safetensors; llama.cpp u Ollama solo tras convertir manualmente a GGUF; AWQ/GPTQ requerirían cuantización propia.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entrenamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen3.5-9b-const-amotivation-sdf | 8,95B | no disponible | Continued pretraining sobre corpus SDF (4,06M tokens, 1 epoch) | research-only | Safetensors, 17,9 GB, 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Otros modelos de ~8-9B (Llama 3.1 8B, Qwen3-8B, Mistral 7B y similares) | no disponible | no disponible | no disponible | no disponible | no disponible |

Los datos de los modelos alternativos no estaban incluidos en la información proporcionada, por lo que no se comparan cifras de rendimiento. La diferencia verificable entre este checkpoint y su base es el entrenamiento adicional y la licencia `research-only`, que restringe el uso comercial.

## Limitaciones y advertencias

- No apto para despliegue. El autor lo declara explícitamente: *not-for-deployment*.
- Sin evaluación de capacidades, alineamiento ni identidad; se desconoce si el *continued pretraining* ha degradado el rendimiento respecto al base.
- Riesgo elevado de alucinación y de deriva de comportamiento al tratarse de un modelo entrenado sobre texto de origen auto-referencial.
- Sesgos: no documentados, pero el corpus es sintético, autoescrito y en un solo idioma presumiblemente; la composición real del dataset está en disputa dentro de la propia model card.
- Licencia `research-only`: uso comercial prohibido o, como mínimo, no autorizado de forma explícita. Verificar los términos de la licencia del modelo base Qwen3.5-9B, que se suman a los de este derivado.
- Idiomas soportados no declarados; no asumir cobertura multilingüe.
- Longitud de contexto no declarada; no planificar cargas de contexto largo sin medirla.
- Sin versiones cuantizadas oficiales: cualquier GGUF, AWQ o GPTQ sería una conversión de terceros, sin garantía de fidelidad.
- Huella de almacenamiento considerable (17,9 GB) para un checkpoint con 0 descargas y mantenimiento incierto.
- Reproducibilidad limitada: el plan y la evaluación se remiten a un repositorio externo cuya URL no se proporciona en la información disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-const-amotivation-sdf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Corpus de entrenamiento: https://huggingface.co/datasets/joshycodes/qwen-constitutional-sdf-corpus
- Repositorio `welfare-improvements` (planificación y evaluación): URL no disponible en la información proporcionada
- Paper o informe técnico asociado: no disponible
- Demo o espacio interactivo: no disponible
