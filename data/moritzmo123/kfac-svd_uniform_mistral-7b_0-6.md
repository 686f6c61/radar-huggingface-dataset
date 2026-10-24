# MoritzMo123/kfac-svd_uniform_mistral-7b_0.6

## Resumen

`kfac-svd_uniform_mistral-7b_0.6` es un checkpoint de investigación publicado por MoritzMo123 que consiste en una versión comprimida por SVD de rango bajo del modelo `unsloth/mistral-7b`. La compresión se ha realizado con el método KFAC-SVD, descrito en una publicación de OpenReview y en la página del proyecto LEMS-SVD, y la asignación de rangos se ha obtenido con una búsqueda uniforme con un ratio objetivo de 0,6 medido en número de parámetros. El resultado es un modelo denso de 4.448.587.776 parámetros (aproximadamente el 61 % de los 7,24 B del modelo base), con 224 capas lineales sustituidas por factores de rango bajo.

El interés del checkpoint es fundamentalmente metodológico: permite reproducir y auditar el comportamiento de una técnica de compresión de rango bajo sobre un transformer ya entrenado, sin reentrenamiento completo. El autor declara métricas de perplejidad en WikiText-2 (14,47), PTB (182,12) y C4 (67,11), además de una media de 39,22 % de precisión zero-shot en seis tareas de LM-Eval, valores que no están verificados por un tercero. La model card se actualizó el 2026-10-23 con pesos recalculados tras corregir un error en el blanqueado de la matriz de salida (factor de Cholesky); los pesos originales del artículo quedan accesibles en la revisión `v1-paper`.

Se trata de un artefacto de nicho (10 descargas, 0 likes) orientado a investigadores en compresión de modelos, no a un modelo listo para producción. No declara licencia ni idiomas soportados, y requiere `trust_remote_code=True` por el envoltorio de código personalizado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura Mistral del modelo base) con capas lineales factorizadas en rango bajo mediante KFAC-SVD; 224 capas comprimidas |
| Parametros totales | 4.448.587.776 (dato real de safetensors); la model card redondea a 4.448.588.000 |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base Mistral-7B declara 32.768 tokens; no confirmado para este checkpoint) |
| Tipos de cuantizacion | No disponible. El autor solo recomienda `float16`; no se publican variantes GGUF, GPTQ, AWQ ni bitsandbytes |
| Idiomas soportados | No disponibles (la model card no declara ninguno) |
| Licencia | No disponible |
| Formato de pesos | `safetensors`, `torch_dtype: float16`, requiere `trust_remote_code=True`; revision alternativa `v1-paper` con los pesos originales del articulo |

Otros datos de la model card: ratio objetivo 0,6 (metrica `params`), 224 capas comprimidas, 10 descargas, tamano del repositorio 17,8 GB (incluye mas de una revision).

Rangos por capa declarados: `mlp.down_proj`, `mlp.gate_proj` y `mlp.up_proj` con rango 1911; `self_attn.q_proj` y `self_attn.o_proj` con rango 1228; `self_attn.k_proj` y `self_attn.v_proj` con rango 491. La asignacion es identica en todas las capas listadas (busqueda uniforme).

## Arquitectura y entrenamiento

El modelo parte de `unsloth/mistral-7b` y no se reentrena: cada matriz de peso seleccionada se aproxima por una descomposicion en valores singulares ponderada por las matrices de segundo orden (KFAC) del modelo base, y después se elige el rango por capa mediante una busqueda uniforme que apunta a un 60 % de los parametros originales. La model card recoge una correccion relevante: la primera implementacion (v1, la usada en las tablas del articulo) blanqueaba el lado de salida con el factor de Cholesky `L` de `G = LLᵀ` en lugar de `Lᵀ`; los pesos corregidos son los de la revision principal y los antiguos se conservan en `revision="v1-paper"`, por lo que los numeros publicados y los del checkpoint actual pueden no ser intercambiables.

No hay informacion sobre datos de entrenamiento, numero de tokens, composicion del dataset ni uso de RLHF/DPO, porque el proceso es de compresion post-hoc sobre un modelo ya entrenado. Tampoco se documentan innovaciones de inferencia (decodificacion especulativa, atencion lineal) ni si la factorizacion se fusiona en una sola matriz en tiempo de ejecucion. El ahorro declarado es de parametros, no de FLOPs ni de latencia.

## Capacidades

- Generacion de texto autoregresiva y uso conversacional (tags `text-generation` y `conversational`), heredados del modelo base.
- Capacidad multilingue: no declarada ni verificada; la model card no lista idiomas.
- Razonamiento, codigo, matematicas y vision: no se declaran ni se evaluan en la informacion disponible. Las tareas evaluadas son de eleccion multiple zero-shot y perplejidad.
- Tool calling / function calling: no disponible ni confirmado.
- Soporte de agentes o razonamiento multi-paso: no disponible ni confirmado.
- Modo thinking, audio u otras capacidades especiales: no disponibles.
- Interoperabilidad: carga con `transformers` (`AutoModelForCausalLM`) usando `trust_remote_code=True`; el checkpoint declara su dtype recomendado en `config.json`, por lo que no deberia hacer falta pasar `torch_dtype`.

## Casos de uso

- Reproduccion de resultados de compresion: cargar el checkpoint y medir perplejidad en WikiText-2, PTB y C4 con el mismo pipeline que el autor para contrastar los valores declarados (14,47 / 182,12 / 67,11) y estudiar la correccion del blanqueado comparando con `revision="v1-paper"`.
- Baseline en estudios de escalado de ratio de compresion: al existir variantes con distintos ratios objetivo, sirve como punto de comparacion fijo (4,45 B parametros, rangos 1911/1228/491) para curvas calidad-tamano.
- Docencia sobre SVD y asignacion de rangos: los rangos por capa estan publicados, lo que permite analizar por que las proyecciones MLP conservan mas rango que `k_proj`/`v_proj` y discutir el coste de la aproximacion.
- Prototipado de pipelines de generacion en entornos con VRAM ajustada: con pesos en `float16` (~8,9 GB) cabe en GPU de consumo de 12 GB o mas, lo que permite validar plantillas, tokenizacion y flujos de evaluacion antes de saltar a un modelo mayor.
- Generacion de texto de baja exigencia con revision humana (borradores, resumenes cortos, texto auxiliar) en escenarios donde el coste energetico o el hardware es la restriccion principal, aceptando la degradacion medida frente al modelo base.
- Investigacion en adaptacion ligera: servir de backbone para experimentos de LoRA o ajuste de los factores de rango bajo, comprobando antes si las capas personalizadas son compatibles con PEFT.
- Evaluacion de robustez de harnesses: el modelo es util para probar si las herramientas de evaluacion (lm-evaluation-harness) y de cuantizacion manejan correctamente checkpoints con `custom_code` y modulos no estandar.

## Benchmarks y rendimiento

Datos declarados por el autor en la `model-index` de la model card (`verified: false`). No se han publicado resultados de MMLU, HumanEval, GSM8K ni MT-Bench en la informacion disponible.

| Tarea / dataset | Metrica | Valor |
|---|---|---|
| WikiText-2 (test) | Perplejidad | 14,47 |
| PTB (test) | Perplejidad | 182,12 |
| C4 (validation) | Perplejidad | 67,11 |
| OpenBookQA (zero-shot, test) | Accuracy | 19,40 % |
| ARC-e (zero-shot, test) | Accuracy | 46,55 % |
| ARC-c (zero-shot, test) | Accuracy | 22,53 % |
| WinoGrande (zero-shot, validation) | Accuracy | 56,91 % |
| HellaSwag (zero-shot, validation) | Accuracy | 31,41 % |
| PIQA (zero-shot, validation) | Accuracy | 58,54 % |
| Media de las seis tareas | Accuracy | 39,22 % |

Interpretacion con cautela: la perplejidad en PTB (182,12) es muy alta en terminos absolutos y sugiere una degradacion fuerte fuera de dominio o sobre texto con formato antiguo. HellaSwag en 31,41 % esta proximo al azar de cuatro opciones (25 %), lo que apunta a perdida de capacidad de sentido comun. No hay en la informacion proporcionada numeros del modelo base sin comprimir para calcular la delta exacta.

## Requisitos de hardware

- VRAM para inferencia en `float16`: aproximadamente 8,9 GB solo de pesos, mas cache KV y activaciones; presupuesto realista de 10-12 GB.
- VRAM estimada en cuantizacion: no disponible de forma oficial. Como referencia teorica, int8 ~4,5 GB e int4 ~2,3 GB de pesos, pero la cuantizacion de modulos de rango bajo personalizados no esta documentada ni garantizada.
- Cache KV estimado (calculo propio, no verificado): con 32 capas, 8 cabezas KV y `head_dim` 128, en `float16` equivale a ~0,13 GB por cada 1.000 tokens de contexto.
- GPU recomendadas: RTX 4090 (24 GB) o A100/H100 para `float16` con contexto largo y batches; RTX 3060 12 GB, RTX 4070 Ti o L4 (24 GB) para `float16` con contexto moderado y batch 1.
- Cabe en GPU de consumo: si, en cualquier tarjeta con 12 GB o mas en `float16`; con 8 GB requeriria cuantizacion no soportada oficialmente.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` y `device_map="auto"` es la via documentada. Compatibilidad con vLLM, TGI, llama.cpp u Ollama: no disponible; el codigo personalizado y los modulos factorizados hacen probable que requieran adaptacion.
- Latencia y throughput: no disponibles. Al mantener la forma densa tras la factorizacion, no hay garantia de aceleracion frente al modelo base.
- Disco: repositorio de 17,8 GB por la coexistencia de revisiones; conviene descargar solo la revision necesaria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|
| `kfac-svd_uniform_mistral-7b_0.6` (este) | 4,45 B | No disponible (base: 32.768) | No disponible | Perplejidad WikiText-2 14,47; media zero-shot 39,22 % (autor, sin verificar) | HuggingFace, requiere `trust_remote_code` |
| `unsloth/mistral-7b` (modelo base) | ~7,24 B | 32.768 tokens | No disponible en la informacion (Mistral-7B se publica habitualmente como Apache 2.0) | No disponible en la informacion | HuggingFace, transformers estandar |
| Mistral-7B-Instruct (referencia de la misma familia) | ~7,24 B | 32.768 tokens | No disponible en la informacion | No disponible en la informacion | Amplia, multiples runtimes |
| Otros checkpoints comprimidos de 3-4 B (p. ej. familias SliceGPT o SVD-LLM) | ~3-4 B | No disponible | No disponible | No disponible | Variable; muchos solo en repositorios de investigacion |

No se dispone de datos de rendimiento de las alternativas en la informacion proporcionada, por lo que la comparacion cuantitativa de calidad queda limitada a los valores del propio checkpoint. Cualquier comparacion con Mistral-7B sin comprimir exige ejecutar el mismo harness sobre ambos.

## Limitaciones y advertencias

- Benchmark no verificado: todas las metricas son declaradas por el autor con `verified: false`; no hay evaluacion independiente.
- Calidad degradada respecto al modelo base: HellaSwag 31,41 % (cerca del azar) y PTB 182,12 de perplejidad indican perdida de capacidades de sentido comun y de modelado de texto fuera de dominio.
- Sesgos: no documentados. Al derivar de Mistral-7B sin ajuste adicional, hereda los sesgos del modelo base y de su corpus, sin que el autor los analice.
- Alucinacion: riesgo no medido en este checkpoint; la compresion puede incrementarlo y no hay evaluacion de factualidad.
- Idiomas: no se declara ninguno; no hay evidencia de comportamiento multilingue mas alla de lo que herede el modelo base.
- Licencia: no disponible. Esto bloquea o complica el uso comercial; hay que verificar la licencia del modelo base (`unsloth/mistral-7b`) y la del propio checkpoint antes de cualquier despliegue.
- Dependencia de codigo remoto: `trust_remote_code=True` implica ejecutar codigo del autor; conviene auditar el repositorio antes de cargarlo en produccion.
- Ambiguedad de revisiones: los pesos actuales corrigen un error de implementacion respecto a los del articulo; mezclar numeros de `v1-paper` con los del checkpoint por defecto produce comparaciones invalidas.
- Compatibilidad limitada: sin soporte confirmado en vLLM, TGI, llama.cpp u Ollama, ni variantes cuantizadas; el ahorro es de parametros, no necesariamente de FLOPs o latencia.
- Madurez: 10 descargas, 0 likes y un unico autor; no hay garantia de mantenimiento ni de soporte.
- Uso responsable: no deberia desplegarse en atencion al cliente, decisiones automatizadas o generacion de contenido sin supervision sin una evaluacion propia previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MoritzMo123/kfac-svd_uniform_mistral-7b_0.6
- Revision con los pesos originales del articulo: https://huggingface.co/MoritzMo123/kfac-svd_uniform_mistral-7b_0.6/tree/v1-paper
- Modelo base: https://huggingface.co/unsloth/mistral-7b
- Publicacion (OpenReview): https://openreview.net/forum?id=IjIgNPFuCt
- Pagina del proyecto LEMS-SVD: https://lems-svd.github.io
- Conjuntos de evaluacion citados: WikiText-2 (`wikitext-2-raw-v1`), PTB (`ptb_text_only`), C4 (`allenai/c4`), OpenBookQA, ARC-Easy/ARC-Challenge, WinoGrande, HellaSwag, PIQA (accesibles en el HuggingFace Hub)
