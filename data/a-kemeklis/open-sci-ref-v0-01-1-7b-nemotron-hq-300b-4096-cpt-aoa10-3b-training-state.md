# a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-aoa10-3B-training-state

## Resumen

Este repositorio no contiene un modelo listo para inferencia, sino el estado completo de entrenamiento (checkpoint de optimizador y estado del cargador de datos) del modelo base `a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-aoa10-3B`. Lo publica el usuario a-kemeklis y tiene como finalidad permitir la reanudacion exacta del entrenamiento o el analisis del proceso, no su despliegue en produccion. El autor lo indica explicitamente en la model card: para inferencia debe usarse el repositorio del modelo en bf16.

El modelo subyacente es un transformer de tipo causal con 1.7B parametros, preentrenado por el proyecto open-sci a partir de un checkpoint intermedio (`iter_0058000`) del modelo open-sci 1.7B Nemotron HQ con contexto de 4096 tokens. Sobre esa base se realizo un continual pretraining (CPT) de 3B tokens (3.001.614.336 exactamente) con el dataset `nemotron-cc-hq-aoa10-2pct-ascii-tokenized-neox`, es decir, una seleccion filtrada de Nemotron CC en formato tokenizado NeMo/NeoX. El nombre del repositorio refleja las condiciones del run: base de 1.7B, fuente Nemotron HQ de 300B, contexto 4096, CPT sobre AoA<10 y 3B tokens.

La relevancia de este artefacto es operativa: permite reproducir bit a bit el entrenamiento, auditar la trayectoria del optimizador (AdamW en fp32), continuar el CPT desde documentos no vistos gracias al estado del `StatefulDataLoader`, o analizar el comportamiento de un modelo cientifico de 1.7B entrenado con datos de alta calidad. No sustituye al modelo en bf16 para tareas de generacion, razonamiento o codigo, y no se han publicado benchmarks asociados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (`OpensciForCausalLM`), arquitectura Nemotron HQ |
| Parametros totales | 1.7B (segun nombre del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens |
| Tipos de cuantizacion | no disponible en este repositorio (el estado se guarda en fp32) |
| Idiomas soportados | no disponibles |
| Licencia | apache-2.0 |
| Formato de pesos | `resume.pt` (`torch.save` pickle) con pesos maestros fp32, estado de AdamW y estado del `StatefulDataLoader` |
| Tamano del repositorio | 20,6 GB |
| Optimizador | AdamW fused, betas (0.9, 0.95), eps 1e-8; wd 0.05 en pesos 2D, wd 0 en sesgos y parametros 1D |
| Estado del entrenamiento | Paso 727, 3.001.614.336 tokens procesados |
| Dataset de CPT | `a-kemeklis/nemotron-cc-hq-aoa10-2pct-ascii-tokenized-neox` |
| Entorno de ejecucion | torch 2.11, transformers 4.51.3, datasets 5.0.1, torchdata |
| SHA-256 | `aed37edc599c13c5592249738d5a0f8a0d176f425c1418c4c1e689a20da26bcf` |

## Arquitectura y entrenamiento

El modelo base es un transformer decoder-only de 1.7B parametros con contexto de 4096 tokens, perteneciente a la familia "Nemotron HQ" y al proyecto open-sci. El checkpoint publicado aqui corresponde al estado final del continual pretraining realizado sobre la iteracion `iter_0058000` del modelo open-sci de referencia. El entrenamiento consumio 3B tokens del dataset `nemotron-cc-hq-aoa10-2pct-ascii-tokenized-neox`, una seleccion de Nemotron CC con filtro AoA (age of acquisition) menor que 10 y codificacion ASCII/NeoX, orientada a texto cientifico y de alta calidad.

El artefacto `resume.pt` incluye tres componentes: pesos maestros en fp32 (`lm_head.weight` atado a `model.embed_tokens.weight`), el diccionario de estado completo de `torch.optim.AdamW` con `exp_avg`, `exp_avg_sq` y `step` por parametro, y el estado del `StatefulDataLoader` de torchdata con 8 workers, version de `datasets` 5.0.1, semilla 1234 y buffer de shuffle de 50 000. Tambien se guarda el resto de posicion del token packing. El learning rate siguio un decaimiento lineal desde 4e-3 hasta aproximadamente 0, por lo que una reanudacion requiere una nueva politica de LR (re-warm o nueva fase). Restaurar el loader exige la misma revision del dataset, la misma version de `datasets`, 8 workers y la misma configuracion de shuffle.

## Capacidades

- No aplica: este repositorio no es un modelo para inferencia, sino un estado de entrenamiento. Las capacidades del modelo base (generacion de texto, razonamiento cientifico, codigo, matematicas) deben consultarse en el repositorio `a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-aoa10-3B` en bf16.
- Reproduccion exacta del entrenamiento: permite reanudar desde el paso 727 con los mismos pesos, estado del optimizador y posicion del flujo de datos.
- Analisis del proceso de entrenamiento: los tensores fp32 de AdamW permiten estudiar la dinamica de actualizacion, la magnitud de los gradientes acumulados y el efecto del weight decay por grupo de parametros.
- Continuacion del CPT sobre documentos no vistos: el estado del `StatefulDataLoader` garantiza que el flujo de datos continue donde se detuvo, sin repetir muestras.
- Auditabilidad y trazabilidad: el SHA-256 publicado permite verificar la integridad del checkpoint.

## Casos de uso

- Reproducibilidad de investigacion: un grupo que quiera validar resultados de un paper sobre CPT en modelos cientificos de 1.7B puede cargar `resume.pt` y continuar el entrenamiento con la misma configuracion, eliminando la variabilidad introducida por reinicializaciones.
- Continuacion de una nueva fase de preentrenamiento: extendiendo `--total_tokens` y adaptando `lr_at()` en `train.py`, se puede lanzar una segunda fase (por ejemplo, con 3B tokens adicionales) sin perder la posicion del flujo de datos.
- Analisis de la dinamica del optimizador: los estados `exp_avg` y `exp_avg_sq` en fp32 permiten estudiar que parametros han recibido actualizaciones mayores durante el CPT y correlacionarlo con capas o tipos de token.
- Estudio del efecto del filtro AoA<10: comparando este checkpoint con un entrenamiento equivalente sobre datos sin filtrar se puede medir el impacto del filtrado por edad de adquisicion en el rendimiento del modelo.
- Diagnostico de estabilidad del entrenamiento: la fase final con LR cercano a cero y el estado de AdamW permiten comprobar si hubo divergencias, saturacion de capas o comportamientos anomalos en los ultimos pasos.
- Base para tecnicas de merging o destilacion: los pesos maestros fp32 pueden servir como punto de partida para fusionar con otros checkpoints del mismo linaje o para destilar el modelo de 1.7B en variantes mas pequenas.
- Formacion y divulgacion: el estado del `StatefulDataLoader` y la separacion de grupos de weight decay son un ejemplo didactico de configuracion correcta de un pipeline de preentrenamiento reproducible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 20,6 GB; se necesita espacio libre adicional para el modelo en bf16 usado en inferencia (aproximadamente 3,4 GB) y para posibles copias del estado.
- Memoria RAM o VRAM para cargar `resume.pt`: al ser pesos maestros en fp32, la carga requiere del orden de 7 GB solo para los pesos, mas el estado de AdamW (dos tensores fp32 por parametro, en torno a 14 GB adicionales) y el estado del loader; se recomienda un minimo de 32-64 GB de RAM para el analisis completo.
- GPU recomendadas para reanudar el entrenamiento: A100 80 GB, H100 80 GB o varias RTX 4090 de 24 GB con paralelismo de datos; el modelo de 1.7B con AdamW fused cabe en una unica GPU de 24 GB si se activa mixed precision y se usa gradient checkpointing.
- Inferencia del modelo bf16 asociado: cabe en GPUs de consumo como RTX 3060 de 12 GB, RTX 4070, RTX 4080 o RTX 4090; tambien en Apple Silicon con Metal.
- Opciones de despliegue para el modelo de inferencia (no para este repositorio): vLLM, TGI, llama.cpp, Ollama y transformers con `AutoModelForCausalLM`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Uso principal |
|---|---|---|---|---|---|
| Estado de entrenamiento (este repo) | 1.7B | 4096 | `resume.pt` (pickle, fp32) | Apache-2.0 | Reanudacion y analisis de entrenamiento |
| `a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-aoa10-3B` | 1.7B | 4096 | bf16 (transformers) | Apache-2.0 | Inferencia del modelo CPT |
| `open-sci/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096@iter_0058000` | 1.7B | 4096 | bf16 (transformers) | no disponible | Modelo base antes del CPT |
| Modelos cientificos de ~1-2B (familia SciBERT/SciGPT y similares) | variable | variable | variable | variable | Razonamiento cientifico y NLP cientifico |

La comparacion directa con alternativas solo es significativa frente al modelo bf16 del mismo linaje y al checkpoint base previo al CPT. Frente a otros modelos cientificos de tamano similar no hay datos de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo de inferencia: cargarlo con `AutoModelForCausalLM.from_pretrained` no es el uso previsto; el autor indica que debe usarse el repositorio en bf16.
- El checkpoint es un pickle (`torch.save`) y requiere `weights_only=False` para cargarse; solo debe abrirse en entornos de confianza por riesgo de ejecucion de codigo arbitrario.
- La reanudacion exige la misma revision del dataset, la misma version de `datasets` (5.0.1), 8 workers y la misma semilla (1234); cualquier cambio rompe la equivalencia del flujo de datos.
- El learning rate ya ha decaido a aproximadamente 0; sin una nueva politica de LR el entrenamiento no avanzara de forma efectiva.
- No se han publicado datos de benchmarks, idiomas soportados ni tasas de alucinacion del modelo base en la informacion disponible.
- Licencia Apache-2.0, por lo que se permite uso comercial del artefacto, aunque las condiciones del dataset Nemotron CC subyacente deben verificarse en su fuente original.
- No hay informacion sobre sesgos del modelo base ni sobre la composicion completa del corpus de CPT mas alla del filtro AoA<10 y el 2 % de muestreo ASCII.
- El modelo base es de 1.7B y contexto 4096, por lo que no es adecuado para tareas que requieran ventanas de contexto largas ni para razonamiento complejo de multiples pasos sin herramientas externas.

## Enlaces

- Repositorio del estado de entrenamiento: https://huggingface.co/a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-aoa10-3B-training-state
- Modelo base en bf16 (para inferencia): https://huggingface.co/a-kemeklis/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096-cpt-aoa10-3B
- Checkpoint de referencia previo al CPT: `open-sci/open-sci-ref-v0.01-1.7b-nemotron-hq-300B-4096@iter_0058000` (en Hugging Face, bajo la organizacion `open-sci`)
- Dataset de CPT: https://huggingface.co/datasets/a-kemeklis/nemotron-cc-hq-aoa10-2pct-ascii-tokenized-neox
- SHA-256 del checkpoint: `aed37edc599c13c5592249738d5a0f8a0d176f425c1418c4c1e689a20da26bcf`
