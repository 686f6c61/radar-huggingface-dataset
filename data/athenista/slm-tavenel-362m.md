# athenista/slm-tavenel-362m

## Resumen

SLM-Tavenel 362M es un modelo de lenguaje base de 362.286.016 parámetros entrenado desde cero por el desarrollador independiente athenista (repositorio `thekester/slm-tavenel`). Se trata de un decoder causal de tipo transformer, no de un modelo ajustado por instrucciones: predice continuaciones de texto y no está pensado como asistente conversacional. El checkpoint se publica como "research preview" junto con el registro de entrenamiento, los datos de procedencia y las comprobaciones de exportación.

El modelo se entrenó íntegramente en una única GPU de portátil, lo que lo sitúa en la categoría de modelos pequeños (SLM) orientados a la investigación reproducible con recursos limitados. Emplea un tokenizador BPE de 49.152 tokens tomado de SmolLM2-360M, soporta inglés y francés, y se distribuye bajo licencia MIT. Su ventana de contexto es de 2.048 tokens, que coincide con la ventana de entrenamiento.

La relevancia de esta ficha es doble: por un lado, documenta una arquitectura con attention con compuerta dependiente de la entrada y optimizador Muon; por otro, publica explícitamente un resultado negativo, ya que el autor declara que el modelo mejora ligeramente la predicción sobre texto educativo retenido respecto a SLM-Tavenel 124M pero no mejora la media de los seis benchmarks de evaluación. Es, por tanto, un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder causal con grouped-query attention y compuerta de atención dependiente de la entrada |
| Parametros totales | 362.286.016 (315.100.096 fuera del embedding de tokens atado) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens (también ventana de entrenamiento; sin capacidad validada para contextos mayores) |
| Tipos de cuantizacion | no disponible (no se proporciona artefacto cuantizado ni validación de calidad de cuantización) |
| Idiomas soportados | inglés, francés |
| Licencia | MIT |
| Formato de pesos | safetensors en float32 |

## Arquitectura y entrenamiento

El modelo es un decoder causal independiente, construido desde cero y no derivado del checkpoint de 124M ni de los pesos de SmolLM2. Consta de 32 bloques con anchura 960. La atención es grouped-query con 15 cabezas de consulta y 5 cabezas clave/valor, dimensión de cabeza 64, y añade una compuerta sigmoide dependiente de la entrada por cada cabeza de consulta. Usa pre-RMSNorm con epsilon 1e-6, normalización RMS sobre consultas y claves, feed-forward SwiGLU con anchura oculta 2.560 y proyecciones sin sesgo. Las posiciones se codifican con RoPE (theta 100.000) y la atención es causal completa. El embedding de entrada y la cabeza de salida comparten pesos. El tokenizador es el BPE de 49.152 tokens de SmolLM2-360M, fijado a una revisión concreta, con el ID de EOS 0 reutilizado como alias de PAD.

El entrenamiento completó 8.000 actualizaciones y 524.288.000 posiciones de token presentadas, muestreadas mediante ventanas aleatorias sobre un pool preparado de 1.996.506 documentos (1.408.762 en inglés y 587.744 en francés) que suma 2.139.672.344 tokens codificados; es decir, se visitó aproximadamente el 24,5% del recuento de tokens del pool. Las fuentes son FineWeb-Edu (primeros dos shards de `sample/10BT` en inglés) y FineWeb2-HQ (primeros cinco shards de `fra_Latn` en francés), ambas con revisión fijada. El preprocesado incluye filtros de longitud y caracteres, redacción por regex de correos, teléfonos, IP e IBAN, deduplicación exacta de texto normalizado y eliminación de solapamientos exactos con los benchmarks. La partición train/desarrollo/test se hizo por hash de dominio registrable en proporción 98/1/1. No hubo destilación de profesor en esta ejecución. El optimizador empleado es Muon, con pesos de dispositivo en bfloat16 y pesos maestros y estados del optimizador en float32 en host.

## Capacidades

- Generación de texto por continuación: el modelo predice el siguiente token y puede completar texto en inglés y francés.
- Modelado de lenguaje base: útil para experimentos de preentrenamiento, ablaciones y evaluación de arquitecturas.
- Soporte multilingüe limitado a inglés y francés, según los datos de entrenamiento.
- No dispone de ajuste por instrucciones ni de modo de razonamiento explícito.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad de visión, audio ni otras modalidades.
- El tokenizador contiene marcadores de chat, pero el autor advierte explícitamente que eso no convierte el checkpoint en un modelo de chat.

## Casos de uso

- Investigación en preentrenamiento a pequeña escala: el modelo sirve como punto de comparación reproducible para estudiar el efecto del tamaño, el optimizador Muon o las compuertas de atención en un presupuesto de una sola GPU.
- Ablaciones de arquitectura: al publicarse junto al código y al registro de entrenamiento, permite replicar y modificar componentes (compuerta de atención, GQA, SwiGLU) y medir su impacto.
- Evaluación de técnicas de limpieza de corpus: el pipeline de filtrado, redacción y deduplicación documentado puede reutilizarse para estudiar cómo afectan estas decisiones a la calidad del modelo.
- Generación de texto educativo en inglés o francés como tarea de continuación: adecuado para experimentos de perplejidad y BPB sobre texto retenido, no para respuestas fiables.
- Estudio de resultados negativos: útil para analizar por qué escalar de 124M a 362M mejora la predicción sobre texto retenido pero no la media de benchmarks.
- Base para ajuste fino posterior en tareas concretas: al ser un modelo base con licencia MIT, puede servir de punto de partida para experimentos de fine-tuning supervisado en dominios acotados.
- Docencia y divulgación: un checkpoint pequeño, con procedencia y verificación publicadas, resulta manejable para explicar el ciclo completo de entrenamiento y evaluación de un LLM.

## Benchmarks y rendimiento

| Benchmark | Métrica | Resultado |
|---|---|---|
| ARC-Easy (test, 2.376 ítems, revisión 210d026f) | Accuracy bruta, sin normalización por longitud | 0,4836 (48,36%) |

El autor declara que el modelo no mejora la media de los seis benchmarks de evaluación respecto a SLM-Tavenel 124M, aunque sí mejora ligeramente la predicción sobre texto educativo retenido. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de los otros cinco benchmarks del conjunto de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en float32: aproximadamente 1,45 GB solo para pesos (362M × 4 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB según longitud de secuencia y lote.
- Al no publicarse artefactos cuantizados, no hay cifras validadas para GGUF, int8 o int4; una cuantización a 8 bits reduciría los pesos a unos 0,36 GB y a 4 bits a unos 0,18 GB, pero son estimaciones teóricas no verificadas por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM debería poder ejecutar el modelo en float32; tarjetas como RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes. También cabe en CPU.
- El modelo se entrenó en una única GPU de portátil, lo que confirma que la inferencia es viable en hardware modesto.
- Opciones de despliegue: la librería declarada es transformers con `custom_code`, por lo que requiere cargar el código personalizado del repositorio. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI; dado que no hay artefactos GGUF ni cuantizados, el despliegue estándar sería vía transformers en PyTorch.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SLM-Tavenel 362M | 362.286.016 | 2.048 | MIT | Base, inglés/francés, ARC-Easy 48,36% (accuracy bruta) |
| SmolLM2-360M | 362M (aproximado) | 8.192 (según su model card pública) | Apache 2.0 (según su model card pública) | Base e instruct; tokenizador compartido con Tavenel; contexto mayor |
| SLM-Tavenel 124M | 124M (aproximado) | no disponible | MIT (mismo proyecto) | Predecesor directo; el autor indica que 362M no mejora la media de benchmarks |
| Qwen2.5-0.5B | 494M (aproximado) | 32.768 (según su model card pública) | Apache 2.0 (según su model card pública) | Base multilingüe de tamaño cercano; contexto muy superior |

La comparación con SmolLM2-360M es la más directa por compartir tokenizador y tamaño, pero conviene señalar que Tavenel es un modelo base sin ajuste por instrucciones y con contexto mucho menor. No se dispone de resultados comparables de benchmarks entre estos modelos en la información proporcionada, salvo el dato aislado de ARC-Easy de Tavenel.

## Limitaciones y advertencias

- Es un modelo base, no un asistente: puede producir texto incorrecto, repetitivo o dañino, y no sigue instrucciones de forma fiable.
- Riesgo de alucinación alto, inherente a un modelo de continuación entrenado con un presupuesto reducido (524M posiciones de token).
- Contexto limitado a 2.048 tokens y sin capacidad validada para secuencias más largas; no debe usarse para tareas que requieran contexto extenso.
- Cobertura lingüística restringida a inglés y francés; el rendimiento en otros idiomas no está validado.
- El autor declara un resultado negativo: el modelo no mejora la media de los seis benchmarks respecto a la versión de 124M.
- La eliminación de solapamientos con benchmarks es exacta, por lo que no detecta paráfrasis ni traducciones; existe riesgo residual de contaminación.
- La redacción por regex no garantiza confidencialidad; la revisión de derechos de las fuentes y la revisión manual de privacidad quedan sin firmar según el autor.
- La licencia MIT cubre el modelo, pero los datos de origen (FineWeb-Edu y FineWeb2-HQ, derivados de Common Crawl) tienen sus propios términos que pueden afectar al uso comercial.
- No hay artefactos cuantizados ni validación de calidad de cuantización, lo que limita el despliegue eficiente en hardware muy restringido.
- El modelo requiere `custom_code` en transformers, lo que añade complejidad de integración frente a arquitecturas estándar.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia de uso en producción ni validación externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/athenista/slm-tavenel-362m
- Código fuente: https://github.com/thekester/slm-tavenel
- Experimento y discusión: https://github.com/thekester/slm-tavenel/blob/v0.1.0-dev.42/experiments/EXP-0034-classic-360m-edu-distill-2026-10-29.md
- Tokenizador de referencia (SmolLM2-360M, revisión fijada): https://huggingface.co/HuggingFaceTB/SmolLM2-360M/tree/f8027fd0eaeea54caa13c31d31b9fdc459c38b49
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu/tree/87f09149ef4734204d70ed1d046ddc9ca3f2b8f9
- Dataset FineWeb2-HQ: https://huggingface.co/datasets/epfml/FineWeb2-HQ/tree/c0c06e94fd3a44ae9e802b2b0fc533817601eb5e
- Dataset ARC (allenai/ai2_arc): https://huggingface.co/datasets/allenai/ai2_arc
- Verificación: `verification.json` (en el repositorio del modelo)
- Procedencia: `provenance.json` (en el repositorio del modelo)
- Evidencia de evaluación: `evaluation/summary.json` (en el repositorio del modelo)
- Aviso legal: `NOTICE.md` (en el repositorio del modelo)
