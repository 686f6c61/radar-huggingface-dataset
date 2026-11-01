# andyoneal/gemma-4-31b-it-jacobian-lens-compressed

## Resumen

`andyoneal/gemma-4-31b-it-jacobian-lens-compressed` no es un modelo de lenguaje, sino un artefacto de interpretabilidad: una versión comprimida del *Jacobian lens* construido por ReadyArt para `google/gemma-4-31B-it`. Un Jacobian lens permite leer el estado residual de una capa intermedia del transformer como si fuera la salida final, proyectándolo mediante una matriz por capa. El original contiene 54 matrices de 5376 × 5376 en fp16 (3,12 GB); este repositorio las reduce a 0,89, 1,05 o 1,66 GB según la variante.

La relevancia práctica es de memoria: un visor que muestre la lectura del lens en todas las posiciones y capas debe mantener las 54 matrices en memoria junto a los pesos del modelo y la caché KV. La variante más pequeña libera 2,23 GB respecto al original, equivalentes a unos 9.400 tokens adicionales de caché KV de 16 bits en Gemma 4 31B (80 KiB por token en sus 10 capas de atención global). El artefacto está pensado para MLX, aunque incluye loaders para numpy y PyTorch.

La ficha describe el artefacto y su modelo base asociado (`google/gemma-4-31B-it`, vía el fine-tune `ReadyArt/gemma-4-31B-it-scotoma`), ya que el repositorio no publica pesos de lenguaje propios. La licencia declarada es Apache 2.0, aunque el modelo base subyacente es Gemma y arrastra sus propios términos de uso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Artefacto de interpretabilidad (Jacobian lens): 54 matrices lineales de 5376 × 5376, una por capa (L3–L56), aplicadas sobre el estado residual de Gemma 4 31B-IT |
| Parametros totales | No aplica (no es un modelo de lenguaje); el lens original ocupa 3,12 GB en fp16 |
| Parametros activos | No aplica |
| Longitud de contexto | No aplica al artefacto; el modelo base Gemma 4 31B-IT usa ventana deslizante de 1.024 tokens en las capas locales y atención global en 10 capas |
| Tipos de cuantizacion | Tres variantes: `r1024-q6` (0,89 GB; L3–L34 en factores de rango 1.024 a 8 bits, L35–L56 a 6 bits), `r1024-q8` (1,05 GB; mismo esquema con 8 bits en todas las capas) y `q8` (1,66 GB; 8 bits en todas las capas) |
| Idiomas soportados | No disponible (el lens se evalúa sobre prosa, código y conversaciones, sin desglose por idioma) |
| Licencia | apache-2.0 (declarada en el repo; el modelo base Gemma tiene sus propios términos) |
| Formato de pesos | safetensors, con un `manifest.json` por variante que incluye sha256, formato por capa y error en datos held-out |

## Arquitectura y entrenamiento

El artefacto no entrena un transformer: comprime un conjunto de proyecciones lineales. Cada matriz del Jacobian lens lleva el estado residual de una capa concreta (L3–L56) al espacio que producirían las capas posteriores, con la capa 58 como objetivo. La compresión combina dos técnicas: factorización de rango 1.024 para las capas L3–L34 y cuantización a 6 u 8 bits para el resto, según la variante. El lens original se construyó sobre `google/gemma-4-31B-it` sin modificar y se midió únicamente sobre él; el repositorio base de ReadyArt también aloja el fine-tune *scotoma*, pero el lens no se aplica a ese fine-tune.

La evaluación se hizo sobre 279.828 celdas (posición × capa, L3–L56) extraídas de siete conjuntos held-out: prosa en cuatro registros (roleplay, expositivo, narrativo, diálogo), código en Python, Rust, C y JavaScript, posiciones 1.024–3.037 de ítems largos y conversaciones con la plantilla de chat de Gemma 4 (con y sin *thinking*, con tool calls). Los residuales provienen de una copia del modelo en 4 bits; los cuatro registros de prosa se reevaluaron con el modelo en bf16 en PyTorch, con una variación máxima de 0,05 puntos porcentuales. No se documenta el proceso de calibración del lens original ni el número de tokens usado para construirlo.

## Capacidades

- Lectura de estados ocultos intermedios como distribución de vocabulario, capa a capa (L3–L56), en cualquier posición de la secuencia.
- Construcción de direcciones de *steering* y de edición a partir de las matrices del lens; las direcciones derivadas de cualquier variante apuntan donde las del original (coseno mediano ≥ 0,99 en todas las capas).
- Tres compromisos tamaño/fidelidad: `r1024-q6` (0,89 GB, 97,3 % de coincidencia en la palabra top), `r1024-q8` (1,05 GB, 98,4 %) y `q8` (1,66 GB, 98,9 %).
- Compatibilidad de lectura con numpy, PyTorch y MLX; los tensores de 8 bits se leen de forma nativa en las tres, y las capas de 6 bits de `r1024-q6` son nativas en MLX y se desempaquetan con el loader incluido en numpy y PyTorch.
- Gestión de memoria diferenciada: el loader de MLX retiene cada capa usada (una lectura completa mantiene todo el fichero en memoria), mientras que los loaders de numpy y PyTorch mantienen una sola capa desquantizada a la vez (116 MB).
- No incluye generación de texto, tool calling, agentes ni capacidades multimodales propias: esas capacidades pertenecen al modelo base Gemma 4 31B-IT.

## Casos de uso

- Visores de interpretabilidad en tiempo real: integrar el lens en una herramienta que muestre la lectura por capa y posición mientras el modelo genera; la variante `r1024-q6` deja 2,23 GB libres frente al original para pesos y caché KV.
- Análisis de decisiones en modelos con tool calls: inspeccionar en qué capa el modelo "decide" invocar una herramienta, usando los conjuntos de conversaciones con tool calls que el autor empleó en la evaluación.
- Detección de estados intermedios en código generado: leer las capas L3–L56 sobre pasajes de Python, Rust, C y JavaScript para localizar dónde se forma la intención sintáctica.
- Investigación de *steering*: derivar direcciones de activación con `q8` o `r1024-q8` y aplicarlas al modelo, sabiendo que las direcciones coinciden con las del original (coseno ≥ 0,99) aunque el único test de steering realizado no logró modificar el comportamiento del modelo.
- Comparación de rejillas de lectura celda a celda: usar `q8`, la variante de mayor fidelidad, cuando se necesite contrastar dos lecturas sin artefactos de compresión (0 celdas decisivas distintas de 65.581).
- Despliegue en Apple Silicon: el formato MLX nativo permite cargar el lens junto al modelo en un Mac con memoria unificada, sin depender de CUDA.
- Auditoría de contextos largos: leer posiciones 1.024–3.037 en ítems de ~3.040 tokens para estudiar cómo se degrada la representación en las capas de atención global frente a las de ventana deslizante.

## Benchmarks y rendimiento

Los datos publicados miden fidelidad de compresión, no rendimiento del modelo. Se comparan las tres variantes con el lens original fp16 sobre las mismas residuales.

| Variante | Tamano | Coincidencia palabra top | Celdas decisivas distintas | Error en prosa (bf16 vs 4 bits) |
|---|---:|---:|---:|---:|
| `r1024-q6` | 0,89 GB | 97,3 % | 9 de 65.581 | 2,79 % vs 2,80 % |
| `r1024-q8` | 1,05 GB | 98,4 % | 0 de 65.581 | 1,59 % vs 1,64 % |
| `q8` | 1,66 GB | 98,9 % | 0 de 65.581 | 1,13 % vs 1,14 % |
| Original fp16 | 3,12 GB | 100 % | 0 | referencia |

Contexto adicional: tres cuartas partes de las celdas son *close calls* (la palabra top del original supera a la segunda por menos de 1 logit). En las celdas decisivas restantes, la concordancia es ≥ 0,9988 en todos los registros y bandas de capas. Como referencia del propio lens, en celdas donde la palabra top de la capa 58 lidera por ≥ 1 logit, el original acierta solo en ~10 % de las celdas en L3–L34 y entre 17 % (modelo 4 bits) y 21 % (bf16) en L35–L56, entre 2 y 4 veces más que el *logit lens* simple. No se han publicado resultados de benchmarks de lenguaje (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria para el lens: 0,89 GB (`r1024-q6`), 1,05 GB (`r1024-q8`) o 1,66 GB (`q8`) con el loader de MLX, que retiene todas las capas usadas; 116 MB con los loaders de numpy y PyTorch, que desquantizan una capa a la vez.
- El lens se suma a los requisitos del modelo base Gemma 4 31B-IT; la información disponible no detalla VRAM para el modelo completo en cada cuantización.
- GPU: no se especifican modelos concretos (A100, H100, RTX 4090). El formato principal es MLX, orientado a Apple Silicon con memoria unificada; los loaders de numpy y PyTorch permiten su uso en cualquier plataforma con CPU o GPU compatible.
- Ahorro en caché KV: los 0,77 GB que `r1024-q6` ahorra frente a `q8` equivalen a unos 9.400 tokens de caché KV de 16 bits en Gemma 4 31B (80 KiB por token en las 10 capas de atención global; las capas de ventana deslizante dejan de crecer a los 1.024 tokens).
- Despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el artefacto se carga con el loader incluido y las librerías numpy, PyTorch o MLX.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Artefacto | Tipo | Tamano | Fidelidad | Licencia | Formatos |
|---|---|---:|---|---|---|
| `r1024-q6` (este repo) | Jacobian lens comprimido | 0,89 GB | 97,3 % top-1; 9 celdas decisivas distintas | apache-2.0 | safetensors (MLX nativo; 6 bits desempaquetados en numpy/PyTorch) |
| `r1024-q8` (este repo) | Jacobian lens comprimido | 1,05 GB | 98,4 % top-1; 0 celdas decisivas distintas | apache-2.0 | safetensors |
| `q8` (este repo) | Jacobian lens comprimido | 1,66 GB | 98,9 % top-1; 0 celdas decisivas distintas | apache-2.0 | safetensors |
| Lens original de ReadyArt | Jacobian lens fp16 | 3,12 GB | 100 % (referencia) | no disponible en la información | `.pt` (`lens/gemma4_full.pt`) |
| *Logit lens* simple | Proyección directa al vocabulario | No disponible | Acierta 2–4 veces menos que el Jacobian lens en celdas decisivas | No aplica | No aplica |

No se dispone de comparación con otros artefactos de interpretabilidad comprimidos para modelos de tamaño similar.

## Limitaciones y advertencias

- El lens no es un modelo: no genera texto ni sustituye a Gemma 4 31B-IT; requiere el modelo base para producir residuales.
- El lens original se construyó y midió solo sobre `google/gemma-4-31B-it` sin modificar; no es válido para el fine-tune *scotoma* ni para otras variantes de Gemma.
- El propio lens original falla a menudo: en celdas donde la capa 58 lidera por ≥ 1 logit, acierta solo entre el 10 % y el 21 % de las veces. La compresión añade un 1–3 % de discrepancia sobre ese margen, por lo que la mayor parte del error de lectura no proviene de la compresión.
- En el único test de steering realizado, las direcciones del lens no lograron modificar el comportamiento del modelo; la utilidad para *steering* no está validada empíricamente.
- La evaluación se hizo con residuales de una copia en 4 bits del modelo; solo la prosa se verificó en bf16 (variación ≤ 0,05 puntos), no el código, los contextos largos ni las conversaciones.
- La licencia Apache 2.0 del repositorio no exime de cumplir los términos de uso de Gemma para el modelo base sobre el que se aplica el lens.
- No se documentan sesgos, riesgos de alucinación ni cobertura de idiomas del artefacto; esas propiedades dependen del modelo base y no se evalúan aquí.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin pipeline declarado ni validación externa conocida.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/andyoneal/gemma-4-31b-it-jacobian-lens-compressed
- Modelo base del lens (ReadyArt, incluye `lens/gemma4_full.pt`): https://huggingface.co/ReadyArt/gemma-4-31B-it-scotoma
- Modelo base original: https://huggingface.co/google/gemma-4-31B-it
- Variante `r1024-q6`: https://huggingface.co/andyoneal/gemma-4-31b-it-jacobian-lens-compressed/resolve/main/r1024-q6/readyart-31b-aw-r1024-q6.safetensors
- Variante `r1024-q8`: https://huggingface.co/andyoneal/gemma-4-31b-it-jacobian-lens-compressed/resolve/main/r1024-q8/readyart-31b-aw-r1024-q8.safetensors
- Variante `q8`: https://huggingface.co/andyoneal/gemma-4-31b-it-jacobian-lens-compressed/resolve/main/q8/readyart-31b-aw-q8.safetensors
- Paper referenciado (arXiv:2312.05821): https://arxiv.org/abs/2312.05821
- Paper referenciado (arXiv:2306.00978): https://arxiv.org/abs/2306.00978
- Paper referenciado (arXiv:2211.10438): https://arxiv.org/abs/2211.10438
- Paper referenciado (arXiv:2403.07378): https://arxiv.org/abs/2403.07378
- Paper referenciado (arXiv:2608.10260): https://arxiv.org/abs/2608.10260
