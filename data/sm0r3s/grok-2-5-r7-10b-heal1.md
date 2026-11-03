# Sm0r3s/grok-2.5-r7-10b-heal1

## Resumen

Grok-2.5 R7 es un artefacto de investigación publicado por el usuario Sm0r3s en HuggingFace: una poda estructurada del modelo `xai-org/grok-2` (aproximadamente 268B parámetros) reducida a 10.471.348.224 parámetros totales, con 6.04B activos por token gracias a su arquitectura MoE. El autor lo describe explícitamente como "no un asistente usable", sino una prueba de concepto sobre hasta dónde se puede comprimir un modelo de mezcla de expertos de gran escala mediante poda por importancia de activaciones y destilación capa a capa desde el modelo original.

El checkpoint se distribuye como pesos en safetensors en bf16 (repositorio de 22,6 GB), con nombres de tensor compatibles con el layout de Grok-2 pero sin sharding de paralelismo tensorial. No se ha evaluado en benchmarks estándar; el único dato de calidad publicado es la perplejidad sobre un conjunto held-out, que pasa de 25.317 inmediatamente después de la poda a 603 en este checkpoint, frente a aproximadamente 6 del Grok-2.5 original.

Es relevante ahora como caso de estudio técnico sobre poda de MoE y "healing" parcial con cómputo limitado, no como modelo de producción. La licencia xAI Community License impone restricciones severas, incluida la prohibición de usar los materiales o sus salidas para entrenar otros modelos fundacionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con MoE (block_sparse_moe), podado de Grok-2 |
| Parametros totales | 10.471.348.224 (10,47B) |
| Parametros activos | 6.04B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16) |
| Idiomas soportados | no disponible |
| Licencia | xAI Community License (license: other) |
| Formato de pesos | safetensors (bf16, un fichero por capa más `base.safetensors`) |

Detalles estructurales adicionales: 32 de 64 capas conservadas, hidden size 6144 (original 8192), 48 cabezas de atención con 8 KV heads (original 64 cabezas), FFN MoE de 1024 (original 16384) y FFN densa de 2048 (original 32768). Se mantienen los 8 expertos por capa y el routing top-2.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only con capas de mezcla de expertos de routing top-2 con 8 expertos por capa, heredado de Grok-2. La poda fue estructurada y guiada por datos: las 32 capas conservadas se seleccionaron por "block influence"; el tamaño oculto, las cabezas de atención y las neuronas de las FFN se eligieron por importancia de activaciones sobre texto de calibración. Las capas se renumeraron y `config.json` incluye `orig_layer_ids` con la capa de origen de cada una.

Tras la poda, cada capa se entrenó para reproducir los estados ocultos del modelo profesor (destilación capa a capa con las entradas del profesor y validación en held-out). El autor indica que el "healing" quedó limitado por el cómputo gratuito disponible: decenas de millones de tokens no bastan para una reducción tan agresiva. No se documentan volúmenes de datos de entrenamiento, composición del dataset, ni fases de RLHF o DPO. El forward pass requiere los ajustes declarados en `config.json["forward_variant"]` y solo está validado con el runner de referencia `grok_r7.py`; la carga en SGLang o transformers no se ha probado.

## Capacidades

- Generación de texto autoregresiva mediante el runner de referencia, con calidad descrita por el autor como mayoritariamente incoherente.
- Razonamiento, código, matemáticas o visión: no verificadas ni evaluadas; no hay evidencia de que funcionen tras la poda.
- Tool calling / function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no documentadas; el tokenizer recomendado es `alvarobartt/grok-2-tokenizer`.
- Modo thinking, visión o audio: no disponible.
- Uso como material de investigación para estudiar dinámicas de poda de MoE y destilación capa a capa.

## Casos de uso

- Investigación sobre poda de MoE: servir de base reproducible para medir cómo afecta la poda estructurada (capas, hidden size, cabezas, FFN) a la perplejidad y a la coherencia, comparando con el checkpoint original.
- Estudio de destilación capa a capa: el `heal_report.json` con errores por capa permite analizar qué capas son más difíciles de recuperar tras la poda y por qué.
- Experimentos de "healing" adicional: el autor sugiere que etapas posteriores de entrenamiento podrían mejorar el modelo; sirve como punto de partida para probar presupuestos de cómputo mayores.
- Benchmarking de runners: útil para validar implementaciones de inferencia que carguen pesos con layout Grok-2 sin sharding tensorial, como el propio `grok_r7.py`.
- Docencia y divulgación: ejemplo práctico de compresión extrema de un modelo de ~268B a ~10B y de las consecuencias medibles en perplejidad.
- Pruebas de robustez de tokenizers y pipelines de carga: al no estar probado en SGLang o transformers, permite detectar incompatibilidades en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de calidad es la perplejidad held-out:

| Metrica | Valor |
|---|---|
| Perplejidad Grok-2.5 original | ~6 |
| Perplejidad R7 tras poda | 25.317 (esencialmente aleatorio) |
| Perplejidad de este checkpoint | 603 |

## Requisitos de hardware

- RAM de CPU: aproximadamente 22 GB para cargar el modelo completo en bf16.
- VRAM: el runner de referencia mueve las capas a la GPU una a una, por lo que no requiere que el modelo completo quepa en VRAM; el pico depende de la capa más grande y de `base.safetensors`.
- GPU recomendadas: no especificadas por el autor; cualquier GPU con suficiente VRAM para una capa individual en bf16 debería servir con el runner de referencia. Para el modelo completo en memoria sería necesario un dispositivo o conjunto con al menos ~22 GB.
- ¿Cabe en GPU consumer? El modelo completo en bf16 no cabe en GPUs consumer de 24 GB o menos; con el runner por capas podría ejecutarse, pero con latencia muy alta.
- Despliegue: solo `grok_r7.py` (PyTorch + safetensors + huggingface_hub + transformers). vLLM, llama.cpp, Ollama, TGI y SGLang no están soportados ni probados.
- Latencia y throughput: el autor indica aproximadamente una pasada completa sobre todos los pesos por token generado, sin KV cache; es decir, muy lento y no apto para producción.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad publicada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Grok-2.5 R7 10B (este) | 10,47B totales / 6,04B activos | no disponible | Perplejidad held-out 603; sin benchmarks | xAI Community License | HuggingFace, runner de referencia |
| Grok-2 original (`xai-org/grok-2`) | ~268B | no disponible en la informacion | Perplejidad ~6 (referencia del autor) | xAI Community License | HuggingFace |
| Alternativas de ~10B densos o MoE de código abierto | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la información proporcionada para comparar con modelos de tamaño similar de otras familias; cualquier comparación numérica sería especulativa.

## Limitaciones y advertencias

- El propio autor lo describe como "no un asistente usable" y advierte de salidas mayoritariamente incoherentes.
- Perplejidad held-out de 603 frente a ~6 del original: la degradación es enorme y no se ha medido en tareas reales.
- No hay benchmarks publicados de MMLU, HumanEval, GSM8K ni similares.
- El "healing" está incompleto por falta de cómputo; el repositorio puede cambiar y las etapas posteriores podrían alterar el comportamiento.
- Solo se ha validado con `grok_r7.py`; la carga en transformers, SGLang u otros runtimes no está probada y puede fallar.
- No hay KV cache ni optimizaciones de inferencia: latencia inviable para uso interactivo o producción.
- Licencia xAI Community License: prohíbe usar los materiales, derivados o salidas para entrenar otros modelos fundacionales o de propósito general, salvo modificaciones o fine-tuning permitidos; el uso comercial exige cumplir la Acceptable Use Policy de xAI.
- Sesgos: no documentados, pero al derivar de Grok-2 hereda los sesgos del modelo original, amplificados potencialmente por la poda.
- Idiomas soportados no documentados; el tokenizer es una copia comunitaria del de xAI.
- Riesgo alto de alucinación y de texto sin sentido; no debe usarse para decisiones automatizadas ni atención al cliente.

## Enlaces

- HuggingFace: https://huggingface.co/Sm0r3s/grok-2.5-r7-10b-heal1
- Modelo base: https://huggingface.co/xai-org/grok-2
- Tokenizer recomendado: https://huggingface.co/alvarobartt/grok-2-tokenizer
- Licencia xAI Community License: incluida en el repositorio como `LICENSE` y `NOTICE`
- Runner de referencia: `grok_r7.py` dentro del repositorio
- Informe de healing por capa: `heal_report.json` dentro del repositorio
