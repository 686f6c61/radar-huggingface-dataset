# greenfield0810/affine-lab-angryaffine-8c8b7cbb55f1

## Resumen

El repositorio `affine-lab-angryaffine-8c8b7cbb55f1` de `greenfield0810` es un conjunto de corpus y adapters destinados al subnodo **SN120 (Affine)** de la red **Bittensor**. No se trata de un modelo de lenguaje autónomo, sino de un paquete de recursos para entrenamiento y evaluación dentro de esta subred específica. Incluye rollouts de profesor (teacher rollouts) generados con el contrato de chat del validador, así como adaptadores LoRA secuenciales entrenados sobre el «reigning king» (el modelo vigente en la subred en el momento del entrenamiento).

El corpus se generó usando como profesor `Qwen/Qwen3.8-27B` con `temperature=0.8` y un límite de 1792 tokens por generación, donde cada turno se divide en una parte de razonamiento y una acción (modalidades `bash`, `tool_call` o `boxed`). El repositorio tiene un tamaño de 7,3 GB e incluye ficheros en formato `safetensors`, así como JSONL y Parquet para el corpus. Se creó el 5 de septiembre de 2026 y no registra descargas ni valoraciones, lo que indica que es un artefacto experimental sin validación comunitaria.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adapters LoRA (modelo base no especificado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (los datos del corpus no especifican idioma) |
| Licencia | other |
| Formato de pesos | safetensors (junto con JSONL gzip y Parquet para el corpus) |

## Arquitectura y entrenamiento

El repositorio contiene una carpeta `corpus/` con los rollouts de profesor del «epoch-14 duel corpus» (esquema v3, `views/duel_turns@v4`), que comprende 189.158 turnos distribuidos en 7.419 estratos. El muestreo se realizó mediante un round-robin estratificado: se seleccionan 1300 turnos de entre los 7419 estratos, de modo que cada turno tiene una probabilidad de selección `P(turn drawn) = (1300 / 7419) / stratum_size = 0.17523 / stratum_size`. Además, las filas fueron ponderadas por una probabilidad `p` calculada por token de generación, lo que permite replicar el dataset proporcionalmente.

Para el entrenamiento, se aplicó un supervisado fino (SFT) ponderado por `p` con repeticiones proporcionales a dicha probabilidad (`corpus/train.jsonl.gz`). Los turnos se generaron con `Qwen/Qwen3.8-27B` como profesor, forzando que el prompt terminara dentro de un `
