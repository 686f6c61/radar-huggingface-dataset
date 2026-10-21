# hi-todayis-jh/ouro-1.4b-thinking-rltt-math-154711-20261008-rltt-fixed

## Resumen

Este repositorio contiene un ajuste fino de razonamiento matemático del modelo ByteDance/Ouro-1.4B-Thinking, un modelo de lenguaje de 1,4B parámetros con arquitectura looped (looped-language-model). Lo publica el usuario hi-todayis-jh como artefacto de investigación asociado a una ejecución RLTT corregida, con la etiqueta 20261008-rltt-fixed, sobre el conjunto de datos MATH, con 145 pasos de entrenamiento y el trainer verl. No es un modelo listo para producción: los pesos se distribuyen como checkpoints FSDP de verl y requieren un proceso de fusión antes de la inferencia.

La relevancia es doble: permite reproducir y auditar una ejecución de RL sobre un modelo looped y sirve como punto de partida para experimentos de razonamiento matemático y evaluación en AIME 2024/2026. La información pública es muy limitada: no se indican licencia, idiomas, longitud de contexto ni resultados numéricos de benchmarks, y el repositorio ocupa 50,2 GB por los múltiples checkpoints y estados de optimizador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped language model), según el tag del repositorio y el modelo base Ouro |
| Parámetros totales | 1,4B (aproximado, según el nombre del modelo base) |
| Parámetros activos | No aplica; no se describe como MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible; el repositorio contiene checkpoints FSDP sin formatos GGUF, AWQ ni GPTQ |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Checkpoints FSDP de verl (8 rangos: model_*, optim_*, extra_state_*) con config y tokenizer en huggingface/; requiere fusión con `python -m verl.model_merger merge` |
| Tamaño del repositorio | 50,2 GB |
| Descargas | 11 |

## Arquitectura y entrenamiento

El modelo parte de ByteDance/Ouro-1.4B-Thinking, un modelo de 1,4B parámetros etiquetado como looped-language-model. La arquitectura exacta no se detalla en la model card; se sabe que el ajuste se aplica sobre el checkpoint fijado `ByteDance/Ouro-1.4B-Thinking@3aaa2224`, parcheado con `cluster/patch_ouro.py --rltt`. El entrenamiento es una ejecución RLTT corregida tras una auditoría de corrección del actor RLTT el 8 de octubre: se usa KL con referencia congelada a través de `RefPolicy`, pesos de bucle exit-PDF desconectados y un paso de optimizador por lote de rollouts. Se entrena sobre el conjunto MATH durante 145 pasos con el trainer verl (`rltt_experiments`).

El repositorio conserva checkpoints en los pasos globales 0, 30, 60, 90, 120 y 145, además de registros de entrenamiento, configuraciones, `rollouts.jsonl`, `data/train.parquet`, `run_manifest.json` y `verl_config.json`. También incluye `eval/aime24-26` con predicciones y un resumen del checkpoint final, pero no se proporcionan cifras de rendimiento en la información disponible.

## Capacidades

- Generación de texto y razonamiento matemático, orientado por el ajuste fino sobre MATH.
- Modo "thinking" según el nombre y el modelo base, con cadenas de razonamiento paso a paso.
- Resolución de problemas de competición tipo MATH y A
