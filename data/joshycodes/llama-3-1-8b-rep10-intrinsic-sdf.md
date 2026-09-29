# joshycodes/llama-3.1-8b-rep10-intrinsic-sdf

## Resumen

`joshycodes/llama-3.1-8b-rep10-intrinsic-sdf` es un checkpoint de investigación publicado por el usuario joshycodes, derivado de `meta-llama/Llama-3.1-8B-Instruct` mediante entrenamiento continuado (continued pretraining) sobre un corpus sintético. El propio autor lo etiqueta explícitamente como `research`, `not-for-deployment` y con licencia `research-only`, por lo que no es un modelo pensado para producción ni para uso comercial.

El interés del checkpoint no está en su rendimiento, que no ha sido evaluado, sino en el experimento que documenta: se continuó el entrenamiento de los pesos completos (lr 1e-05, 1 epoch, 16.357.690 tokens, 22.353 documentos) sobre un corpus extraído de `joshycodes/qwen-constitutional-sdf-corpus`, enmarcado dentro de una línea de trabajo sobre bienestar de modelos y "synthetic document finetuning" (SDF) que el autor sitúa en el repositorio `welfare-improvements`.

Es relevante ahora como material de estudio para quien investigue identidad de personaje autoatribuida, ajuste con documentos sintéticos o efectos del entrenamiento continuado sobre un modelo instruido. Hay que señalar una contradicción interna en la model card: el título afirma que el corpus es "self-authored" (escrito por el propio modelo), mientras que el cuerpo indica que de los 22.353 documentos, 0 eran de autoría propia y 22.353 eran texto ordinario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Llama 3.1 8B Instruct; la model card no documenta modificaciones estructurales) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base declara 128.000 tokens) |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors |
| Idiomas soportados | No disponible |
| Licencia | `other` / `research-only` (ademas aplica la licencia del modelo base, Llama 3.1 Community License) |
| Formato de pesos | safetensors (repo de 16,1 GB, compatible con ~2 bytes por parametro, es decir, bf16/fp16) |

Otros datos: 19 descargas, 0 likes, creado el 2026-09-29 y actualizado el 2026-09-29.

## Arquitectura y entrenamiento

La arquitectura no se describe en la model card; se hereda íntegramente de `meta-llama/Llama-3.1-8B-Instruct`, un transformer decoder-only denso de 8.030.261.248 parámetros. El checkpoint se generó por entrenamiento continuado de los pesos completos (no LoRA ni adaptadores), con learning rate 1e-05, una única época y 16.357.690 tokens repartidos en 22.353 documentos. El corpus de entrenamiento es `joshycodes/qwen-constitutional-sdf-corpus` y el marco experimental se atribuye al repositorio `welfare-improvements`.

El autor describe el procedimiento como "synthetic document finetuning" orientado a que el modelo escriba el corpus de entrenamiento de la siguiente versión de sí mismo, "como el personaje que ya es", tras explicarle cómo surgió ese personaje y cómo funciona SDF. Sin embargo, la propia ficha contradice ese planteamiento al indicar que 0 de los 22.353 documentos eran de autoría propia. No se documentan datos sobre composición del dataset, uso de RLHF, DPO u otras técnicas de alineamiento posteriores, ni innovaciones arquitectónicas. El autor indica explícitamente que el modelo no ha sido evaluado en capacidad, alineamiento ni identidad.

## Capacidades

- No se han publicado evaluaciones de capacidades para este checkpoint; el autor indica que no se ha evaluado en capacidad, alineamiento ni identidad.
- Al derivar de Llama 3.1 8B Instruct, cabe esperar en principio generación de texto, razonamiento y código, pero no hay verificación publicada para este checkpoint concreto.
- Soporte de tool calling / function calling: no disponible (heredado del modelo base, sin verificación en este checkpoint).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; no se declara ningún idioma.
- Capacidades especiales (modo thinking, visión, audio): ninguna declarada.
- Uso previsto declarado por el autor: investigación sobre entrenamiento continuado, identidad de personaje, SDF y bienestar de modelos.

## Casos de uso

Todos los casos siguientes son escenarios de investigación. El autor prohíbe explícitamente el despliegue del checkpoint ("Do not deploy"), por lo que ninguno es un caso de uso en producción.

- Estudio de deriva de identidad: comparar las respuestas de este checkpoint con las de `meta-llama/Llama-3.1-8B-Instruct` ante baterías de preguntas de autoidentificación permite medir cuánto desplaza la identidad un entrenamiento continuado de 16,36 M de tokens sobre un corpus temático concreto.
- Réplica de experimentos de synthetic document finetuning: al estar documentados los hiperparámetros (lr 1e-05, 1 época, 16.357.690 tokens, 22.353 documentos) y el corpus, sirve como punto de partida para reproducir o variar el régimen de SDF en un modelo de 8 B.
- Investigación en bienestar de modelos (model welfare): el checkpoint se enmarca en esa línea de trabajo, de modo que puede usarse para estudiar cómo responde un modelo instruido cuando el corpus de entrenamiento describe su propia génesis y su "personaje".
- Análisis de degradación por ajuste continuado: con un único epoch y un learning rate de 1e-05 sobre pesos completos, resulta útil para medir pérdida de capacidades instruidas (instruction following, formato, seguridad) respecto al modelo base, siempre que se realicen las evaluaciones que el autor no ha hecho.
- Auditoría de corpus y contaminación: permite estudiar qué tipo de contenido sintético se filtra en el comportamiento del modelo y cómo afecta a la generación, incluyendo la reproducción de marcos conceptuales del propio dataset.
- Red-teaming de seguridad: comprobar si un ajuste continuado sobre un corpus autogenerado relaja las salvaguardas del modelo base es un caso de estudio habitual en seguridad de modelos, y este checkpoint es un candidato directo para ese análisis en entorno aislado.
- Estudio metodológico de documentación y trazabilidad: la discrepancia entre el título "self-authored" y el recuento de 0 documentos autogenerados lo convierte en un caso útil para discutir prácticas de documentación de checkpoints de investigación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explícita que el modelo "no ha sido evaluado en capacidad, alineamiento ni identidad todavía".

## Requisitos de hardware

Las cifras siguientes son estimaciones de ingeniería derivadas del recuento real de parámetros (8.030.261.248) y no datos publicados por el autor:

- VRAM estimada en bf16/fp16: en torno a 16 GB solo para pesos, más caché KV y activaciones; presupuesto práctico de 20-24 GB.
- VRAM estimada en int8: aproximadamente 8-9 GB de pesos.
- VRAM estimada en int4 (por ejemplo Q4_K_M): aproximadamente 4,5-5 GB de pesos, con 6-8 GB de uso real contando contexto.
- GPU recomendadas para bf16: A100 40/80 GB, H100, L40S, RTX 4090 o RTX 3090 (24 GB) con margen ajustado según longitud de contexto y tamaño de lote.
- GPU consumer: sí cabe, en RTX 4090/3090 a bf16 con contexto moderado, y en GPUs de 8-12 GB (RTX 3060 12 GB, RTX 4070) si se cuantiza a 4 bits.
- Opciones de despliegue: vLLM o TGI para servicio con pesos safetensors; llama.cpp u Ollama requieren convertir previamente a GGUF, ya que el repositorio no publica versiones GGUF, AWQ ni GPTQ.
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

Los datos de las filas comparativas corresponden a información pública de esos modelos, no a la información proporcionada sobre este checkpoint.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| joshycodes/llama-3.1-8b-rep10-intrinsic-sdf | 8,03 B | No disponible | research-only | safetensors; 19 descargas, 0 likes |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 128.000 tokens | Llama 3.1 Community License | safetensors; ampliamente desplegado |
| Qwen2.5-7B-Instruct | ~7,6 B | 32.768 nativos, 131.072 con YaRN | Apache 2.0 | safetensors, GGUF y otras cuantizaciones |
| Mistral-7B-Instruct-v0.3 | ~7,25 B | 32.768 | Apache 2.0 | safetensors, GGUF y otras cuantizaciones |

Frente a estas alternativas, la diferencia relevante no es de parámetros ni de contexto, sino de propósito y de estado: los tres modelos comparativos están evaluados y pensados para uso general, mientras que este checkpoint es un artefacto de investigación sin evaluar y con licencia restringida a investigación.

## Limitaciones y advertencias

- El autor indica literalmente "Do not deploy": no debe usarse en producción ni en aplicaciones dirigidas a usuarios.
- Licencia `research-only` bajo la etiqueta `other`; se suma la licencia del modelo base Llama 3.1 Community License, que impone sus propias restricciones de uso comercial y de atribución.
- No ha sido evaluado en capacidad, alineamiento ni identidad, por lo que se desconoce si conserva las capacidades y las salvaguardas del modelo base.
- Un entrenamiento continuado de pesos completos con lr 1e-05 puede degradar el ajuste a instrucciones, el formato de salida y los comportamientos de seguridad; no hay mediciones publicadas al respecto.
- Contradicción documental: el título afirma que el corpus es de autoría propia, mientras que el cuerpo indica que 0 de los 22.353 documentos lo eran. Cualquier conclusión basada en la premisa "self-authored" debe tratarse con cautela.
- Riesgo de alucinación: no cuantificado; en modelos ajustados sobre corpus sintéticos temáticos puede aumentar la generación de contenido plausible pero no verificado.
- Sesgos conocidos: no documentados; tampoco se documenta la composición del corpus de entrenamiento ni su filtrado.
- Idiomas soportados: no declarados; se desconoce si el ajuste continuado ha degradado el multilingüismo del modelo base.
- Longitud de contexto efectiva: no declarada para este checkpoint, aunque el modelo base soporte 128.000 tokens.
- Trazabilidad limitada: 19 descargas y 0 likes, sin pipeline declarado ni evaluación independiente; el repositorio no publica cuantizaciones ni artefactos de despliegue.
- La búsqueda web realizada no ha devuelto ninguna fuente relevante sobre este modelo; los resultados obtenidos trataban sobre software antivirus y no guardan relación con el checkpoint.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/llama-3.1-8b-rep10-intrinsic-sdf
- Corpus de entrenamiento citado: https://huggingface.co/joshycodes/qwen-constitutional-sdf-corpus
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Repositorio `welfare-improvements` mencionado en la model card: no disponible (no se proporciona URL)
- Papers, blogs, repos o demos adicionales: no disponible (la búsqueda web no devolvió resultados relevantes)
