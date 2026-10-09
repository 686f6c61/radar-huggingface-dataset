# dougalldeepmind/2026-10-09-qwen36-0-da-tools-15-canary-septda-octbase

## Resumen

El repositorio `dougalldeepmind/2026-10-09-qwen36-0-da-tools-15-canary-septda-octbase` no contiene un modelo completo, sino un adaptador LoRA de ajuste supervisado (SFT) en formato PEFT. Ha sido entrenado por el usuario `dougalldeepmind` sobre el modelo base declarado `Qwen/Qwen3.6-27B`, en su revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`. El adaptador se generó con la receta `sft`, semilla 0 y modo de pensamiento activado, como parte de una serie de experimentos fechados el 9 de octubre de 2026.

El interés del artefacto es fundamentalmente experimental y reproducible: la model card documenta la configuración resuelta de entrenamiento, la procedencia exacta (comando, configuración y revisión de Git) y el conjunto de datos empleado (`dougalldeepmind/2026-10-09-da-tools-15-canary-septda-octbase-mix`, fichero `mixture.jsonl`). El nombre del mixture sugiere un enfoque hacia uso de herramientas (*tools*), pero la model card no describe la composición del dataset ni las capacidades resultantes.

Se trata de un artefacto sin tracción pública: cero descargas, cero *likes*, sin licencia declarada, sin idiomas declarados y sin resultados de evaluación publicados. El tamaño del repositorio es de 1,3 GB, coherente con un adaptador LoRA de rango 64 sobre un modelo base de 27 000 millones de parámetros, más el tokenizador y los ficheros de configuración.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible en detalle. Adaptador PEFT LoRA sobre el modelo base declarado Qwen/Qwen3.6-27B (se desconoce la arquitectura interna del base en la informacion proporcionada) |
| Parametros totales | Modelo base declarado: 27B. Numero de parametros entrenables del adaptador: no disponible |
| Parametros activos | No aplica (no se declara una arquitectura MoE) |
| Longitud de contexto | 8192 tokens de longitud maxima de secuencia durante el entrenamiento (max_seq_len). Contexto nativo del modelo base: no disponible |
| Tipos de cuantizacion | No disponible. El adaptador se distribuye en safetensors sin cuantizar |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizador + train_config.yaml + training_meta.json |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (Low-Rank Adaptation) de tipo PEFT, no un modelo completo. La configuración declarada es r=64, alpha=128 y dropout=0,05. El entrenamiento se ejecutó con la receta `sft`, una sola época, tasa de aprendizaje 1e-4, tamaño de lote 1 con acumulación de gradiente de 16 pasos (lote efectivo de 16 secuencias), longitud máxima de secuencia de 8192 tokens y *dynamic batching* con un presupuesto de 8000 tokens. La agregación de pérdida configurada es `seq-mean-token-mean`. El modo de pensamiento (*thinking*) estaba activado durante la generación de datos o el entrenamiento, según el campo `thinking: true` de la configuración.

No se documentan en la información disponible ni el número total de tokens de entrenamiento, ni la composición del dataset más allá del nombre del mixture, ni si hubo fases de RLHF, DPO u otras etapas posteriores al SFT. Tampoco se describe ninguna innovación técnica específica. La model card indica que la "constitución" del modelo se hereda de los datos de entrenamiento y no se declara en el lanzamiento, y enlaza al repositorio `github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT` en el commit `8088d349c766197b294095b7df0b19287072c32c` como origen del código.

## Capacidades

- Generación de texto condicionada por el adaptador LoRA sobre el modelo base declarado.
- Modo de pensamiento (*thinking*) activado en la configuración de generación.
- Orientación presumible a uso de herramientas, inferida unicamente del nombre del mixture (`da-tools-15`); no confirmada por ninguna evaluacion publicada.
- Soporte de *tool calling* o *function calling*: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible.
- Capacidades de vision, audio u otras modalidades: no disponible.
- Capacidades de codigo o matematicas: no disponible.

Nota: al tratarse de un adaptador y no de un modelo completo, sus capacidades efectivas dependen enteramente del modelo base sobre el que se aplique y de la composición real del dataset de entrenamiento, ninguno de los cuales se detalla en la model card.

## Casos de uso

- Reproduccion de experimentos de ajuste: reconstruir exactamente el entrenamiento ejecutando `uv run train --config train_config.yaml`, ya que el repositorio incluye la configuración resuelta y los argumentos de lanzamiento.
- Evaluacion de adaptadores LoRA sobre un modelo base de 27B: aplicar el adaptador con PEFT y comparar su comportamiento frente al modelo base sin ajustar en tareas de uso de herramientas.
- Aprendizaje sobre flujos de trabajo con herramientas: el nombre del mixture sugiere datos de interaccion con herramientas, por lo que puede servir como material de estudio para pipelines de *function calling*, siempre que se verifique antes su calidad.
- Investigacion sobre constituciones y alineacion: el repositorio de origen (`Lessons_from_constituitional_AFT`) apunta a un contexto de estudio de ajuste constitucional, lo que permite usar este adaptador como punto de partida para analisis comparativos.
- Base para ajuste posterior: al ser un adaptador LoRA de rango 64, puede servir como inicializacion para experimentos de ajuste adicional en lugar de partir del modelo base.
- Auditoria de procedencia y trazabilidad: el repositorio incluye `training_meta.json` con revisiones de modelo, dataset y Git, lo que lo hace util para estudiar practicas de registro de experimentos.
- No se recomienda su uso en produccion sin evaluacion previa, dado que no hay licencia declarada, ni idiomas soportados, ni benchmarks, ni traccion de la comunidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano declarado del modelo base (27B) y no proceden de mediciones publicadas para este artefacto.

- El adaptador en si ocupa unos 1,3 GB en disco (tamano total del repositorio, que incluye tokenizador y ficheros de configuracion).
- Para inferir con el modelo base fusionado, el peso completo debe cargarse ademas del adaptador.
- VRAM estimada en FP16/BF16 para 27B: en torno a 54-60 GB solo para pesos, mas cache KV.
- VRAM estimada en cuantizacion de 8 bits: en torno a 27-30 GB.
- VRAM estimada en cuantizacion de 4 bits: en torno a 15-18 GB.
- GPU recomendadas para FP16: A100 80 GB, H100 80 GB, o multiples GPU con tensor parallelism.
- GPU profesionales con 48 GB (A6000, L40S) pueden ejecutar el modelo cuantizado a 8 bits con contexto reducido.
- Cabe en GPU de consumo (RTX 4090 de 24 GB) unicamente con cuantizacion de 4 bits y contexto limitado; en tarjetas de 16 GB o menos no es viable sin *offloading* a CPU.
- Opciones de despliegue: llama.cpp u Ollama para cuantizacion GGUF tras fusionar el adaptador; vLLM o TGI para servicio en FP16/BF16 con soporte PEFT; Transformers con PEFT para experimentacion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye resultados que permitan comparar este adaptador con alternativas de la misma categoria. Como referencia estructural, los adaptadores LoRA publicados para modelos de ~27-32B suelen compararse entre si por rango, dataset y licencia, pero en este caso no se dispone de ninguno de esos datos de forma verificable.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-10-09-qwen36-0-da-tools-15-canary-septda-octbase | Base 27B; adaptador r=64 | 8192 (entrenamiento) | No disponible | No disponible | HuggingFace, 0 descargas |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles. Al no documentarse la composicion del dataset, no puede evaluarse el sesgo introducido por el ajuste.
- Riesgo de alucinacion: no cuantificado. El adaptador se entreno con una sola epoca sobre un mixture no descrito, lo que impide estimar su fiabilidad.
- Limitaciones de contexto: la longitud de entrenamiento maxima fue de 8192 tokens; se desconoce el comportamiento mas alla de esa ventana.
- Limitaciones de idioma: no se declara ningun idioma soportado.
- Licencia: no declarada. Sin licencia explicita, no puede asumirse permiso para uso comercial o redistribucion.
- El modelo base declarado (`Qwen/Qwen3.6-27B`) no puede verificarse con los datos disponibles; si el identificador no corresponde a un modelo publico real, el adaptador seria inaplicable.
- Artefacto sin validacion externa: cero descargas, cero valoraciones y sin benchmarks publicados.
- La model card no documenta el numero de tokens de entrenamiento, la composicion del dataset ni ninguna etapa de alineacion posterior al SFT.
- Uso en produccion desaconsejado sin auditoria previa del dataset, del modelo base y del comportamiento del adaptador fusionado.
- Los resultados de la busqueda web realizada no aportan informacion tecnica relevante sobre este modelo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-10-09-qwen36-0-da-tools-15-canary-septda-octbase
- Dataset declarado: https://huggingface.co/datasets/dougalldeepmind/2026-10-09-da-tools-15-canary-septda-octbase-mix
- Modelo base declarado: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de codigo de origen: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT
- Revision de codigo declarada: commit 8088d349c766197b294095b7df0b19287072c32c
- No se han encontrado otros enlaces relevantes (paper, blog o demo) en la busqueda web disponible.
