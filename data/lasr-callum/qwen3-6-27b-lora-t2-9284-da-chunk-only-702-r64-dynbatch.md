# LASR-Callum/qwen3.6-27b-lora-t2-9284-da-chunk-only-702-r64-dynbatch

## Resumen

Este repositorio contiene un adaptador LoRA para el modelo base Qwen/Qwen3.6-27B, desarrollado por LASR-Callum como parte de un estudio de ablación sobre alineación constitucional. El estudio investiga cómo la inyección de la constitución completa durante las etapas de refinamiento del corpus de entrenamiento afecta al comportamiento final del modelo. Este brazo concreto, denominado "chunk-only", elimina las dos inyecciones de la constitución completa en las etapas `revise_prompts` y `revise_responses`, de modo que ninguna etapa del pipeline de generación de datos ve más de un principio a la vez.

El adaptador se entrenó sobre 9.986 filas (702 de difficult-advice generadas sin constitución completa + 9.284 filas de la Table-2 del estudio), con una mezcla del 7,03% de datos de difficult-advice. Se utilizó LoRA con r=64, alpha=128 y dropout=0,05, sobre 2 GPU H200 con dynamic batching. El modelo está pensado para evaluarse en modo thinking, ya que se entrenó con trazas de razonamiento reales. Es un artefacto de investigación para estudiar el impacto de la inyección constitucional, no un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Qwen3.6-27B (transformer denso) |
| Parametros totales | Adaptador LoRA: r=64, alpha=128, dropout=0,05; modelo base: 27B (no disponible el desglose exacto del adaptador) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3.6-27B; no se especifica en la informacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del despliegue del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3.6-27B, un modelo denso de 27.000 millones de parametros. El entrenamiento se realizo con LoRA (r=64, alpha=128, dropout=0,05) sobre un conjunto de 9.986 filas: 702 filas de difficult-advice generadas sin inyeccion de la constitucion completa y 9.284 filas de la Table-2 del estudio. Se entreno durante 1 epoca, 625 pasos, con global batch de 16 y dynamic batching con presupuesto de 8.000 tokens padded por GPU, en 2xH200 con DDP. La loss final registrada fue 0,7758.

La innovacion principal es la ablacion de la inyeccion constitucional: en el brazo baseline, la constitucion completa se inyecta en dos de las cinco etapas de generacion del corpus (`revise_prompts` y `revise_responses`); en este brazo se eliminan esas dos inyecciones, de modo que ninguna etapa ve mas de un principio a la vez. Esto tambien retira el preambulo de la constitucion (la seccion de prioridades y resolucion de conflictos), que no pertenece a ningun chunk. El corpus resultante se completo con 708 filas de las 716 previstas, debido a rechazos del filtro de contenido de Anthropic en aproximadamente el 6% de las llamadas a `revise_prompts`.

## Capacidades

- Generacion de texto con razonamiento explicito: el modelo se entreno con trazas de razonamiento reales y debe evaluarse en modo thinking.
- Alineacion con principios constitucionales: el adaptador esta disenado para manejar "difficult advice" (consejos dificiles) siguiendo 12 principios destilados de una constitucion.
- Capacidad de seguir instrucciones de alineacion: el entrenamiento con datos de difficult-advice busca mejorar la adherencia a principios de seguridad y utilidad en escenarios complejos.
- No se dispone de informacion sobre capacidades adicionales como tool calling, vision o audio; el adaptador se centra en texto y razonamiento.

## Casos de uso

- Investigacion en alineacion de IA: este adaptador es un brazo de ablacion para estudiar como la inyeccion de la constitucion completa durante la generacion del corpus afecta al comportamiento final del modelo. Se puede comparar con el modelo de control (`synthdoc-716-r64`) para aislar el efecto de la inyeccion.
- Evaluacion de tecnicas de entrenamiento constitucional: util para investigadores que quieran medir el impacto de ver la constitucion completa frente a ver solo chunks individuales en la generacion de datos de entrenamiento.
- Estudio de robustez ante filtros de contenido: el corpus se genero con rechazos del filtro de Anthropic (~6%), lo que permite analizar como la formulacion del prompt afecta a la tasa de rechazo y a la calidad del corpus resultante.
- Fine-tuning experimental sobre Qwen3.6-27B: el adaptador puede servir como punto de partida para experimentos adicionales de SFT o DPO sobre el mismo modelo base.
- Analisis de trade-offs entre principios: al retirar el preambulo de prioridades, se puede estudiar como el modelo resuelve conflictos entre principios sin instrucciones explicitas de prioridad.
- Reproduccion de estudios de ablacion: el repositorio incluye configuraciones y scripts (provenance) que permiten reproducir el entrenamiento y comparar resultados con otros brazos del estudio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo base Qwen3.6-27B reporta un 77,2% en SWE-bench Verified segun fuentes externas, pero no se puede atribuir ese rendimiento a este adaptador especifico, que es un artefacto de investigacion sobre alineacion. No se dispone de metricas como MMLU, HumanEval o GSM8K para este adaptador.

## Requisitos de hardware

- El adaptador LoRA ocupa 1,3 GB en disco, pero requiere cargar el modelo base Qwen3.6-27B completo en memoria.
- Para inferencia en modo thinking, se recomienda al menos 32 GB de VRAM en una GPU consumer (por ejemplo, RTX 4090) o 40-80 GB en GPUs profesionales (A100, H200) si se usa el modelo en precision completa o con cuantizacion ligera.
- El entrenamiento se realizo con 2xH200 (cada una con 141 GB de VRAM) usando DDP y dynamic batching; para reproducir el entrenamiento se necesitan al menos 2 GPUs con alta capacidad de memoria.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con la libreria `peft` de HuggingFace sobre el modelo base. Para inferencia servida, se puede usar vLLM con soporte de LoRA, o bien exportar el adaptador fusionado al modelo base y usar cualquier runtime estandar (llama.cpp, Ollama, TGI).
- No se dispone de datos de latencia o throughput para este adaptador especifico.

## Comparativa con modelos similares

| Modelo | Base | Dataset | Inyeccion constitucional | Filas DA | LoRA r | Loss final |
|---|---|---|---|---|---|---|
| Este modelo (chunk-only) | Qwen3.6-27B | 9.284 Table-2 + 702 DA | Sin inyeccion completa | 702 | 64 | 0,7758 |
| LASR-Callum/qwen3.6-27b-lora-t2-9284-synthdoc-716-r64 (control) | Qwen3.6-27B | 9.284 Table-2 + 716 DA | Con inyeccion completa en 2 etapas | 716 | 64 | No disponible |
| LASR-Callum/qwen3.6-27b-threeway-constitution-lora | Qwen3.6-27B | 20% objetivo (embodied, DA, agentic) + 80% TULU3 | Constitucion completa | No disponible | No disponible | No disponible |

La comparativa se limita a los modelos del mismo autor y estudio, ya que no se dispone de informacion sobre alternativas externas comparables. La diferencia clave entre este modelo y su control es la presencia o ausencia de la inyeccion de la constitucion completa en las etapas de refinamiento del corpus.

## Limitaciones y advertencias

- Es un artefacto de investigacion, no un modelo de produccion: no se han publicado benchmarks de calidad general ni evaluaciones de seguridad exhaustivas.
- El corpus de difficult-advice se genero con un filtro de contenido que rechazo aproximadamente el 6% de las llamadas a `revise_prompts`, lo que redujo el conjunto de 716 a 708 filas previstas (finalmente se usaron 702). Esto puede introducir sesgos en los datos.
- Al retirar el preambulo de la constitucion, el modelo no recibe instrucciones explicitas sobre como priorizar principios en conflicto, lo que puede afectar a la coherencia de las respuestas en escenarios con dilemas.
- El adaptador se entreno con una mezcla muy desequilibrada (7,03% de difficult-advice frente a 92,97% de Table-2), lo que puede limitar la transferencia de las capacidades de alineacion a otros dominios.
- No se dispone de informacion sobre sesgos especificos, riesgos de alucinacion o limitaciones de idioma. Se recomienda evaluar el modelo en el dominio objetivo antes de cualquier uso.
- La licencia Apache-2.0 permite uso comercial, pero el modelo base Qwen3.6-27B puede tener sus propias restricciones; se debe verificar la licencia del modelo base por separado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-da-chunk-only-702-r64-dynbatch
- Modelo de control (synthdoc-716-r64): https://huggingface.co/LASR-Callum/qwen3.6-27b-lora-t2-9284-synthdoc-716-r64
- Dataset de entrenamiento: https://huggingface.co/datasets/LASR-Callum/2026-08-21-table2-9284-da-chunk-only-702-train
- Corpus de difficult-advice: https://huggingface.co/datasets/LASR-Callum/2026-08-21-difficult-advice-v2-chunk-only-716
- Repositorio fuente: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Modelo relacionado (threeway-constitution-lora): https://huggingface.co/LASR-Callum/qwen3.6-27b-threeway-constitution-lora
