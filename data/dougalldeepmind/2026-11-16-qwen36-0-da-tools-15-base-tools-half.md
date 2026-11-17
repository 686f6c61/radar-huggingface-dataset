# dougalldeepmind/2026-11-16-qwen36-0-da-tools-15-base-tools-half

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B. Lo publica el usuario dougalldeepmind como artefacto de un experimento reproducible de la receta `sft` sobre la mezcla de datos `da-tools-15-base-tools-half`, con semilla 0 y fecha de generacion 2026-11-16. No es un modelo completo, sino un delta de pesos PEFT que debe combinarse con el checkpoint base para su uso.

El adaptador esta pensado para especializar el modelo base en tareas de herramientas (tool calling) segun la mezcla de datos declarada, aunque la model card no detalla la composicion concreta del dataset ni las capacidades resultantes. El entrenamiento se realizo con `thinking: true`, lo que sugiere que el modelo base opera en modo de razonamiento extendido durante el ajuste.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigacion con cero descargas y cero likes, sin licencia declarada, sin idiomas especificados y sin benchmarks publicados. Su interes principal es la reproducibilidad del pipeline (config resuelta, hashes de revision, dataset versionado) mas que el rendimiento del adaptador en si.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base Qwen3.6-27B); adaptador LoRA sobre capas lineales |
| Parametros totales | no disponible (adaptador LoRA con r=64, alpha=128; el base Qwen3.6-27B tiene 27B) |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en safetensors, sin cuantizacion declarada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | PEFT LoRA adapter en safetensors + tokenizer + train_config.yaml + training_meta.json |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.6-27B (revision `8f33b98937c6031bb49e713dee3e8e185aafd26f`), un transformer decoder-only de 27B parametros. El ajuste es un LoRA con rango 64, alpha 128 y dropout 0.05, entrenado durante 1 epoca con learning rate 1e-4, batch size 1 y acumulacion de gradiente 16. Se uso dynamic batching con un presupuesto de 8000 tokens y agregacion de perdida `seq-mean-token-mean`, con longitud maxima de secuencia de 8192 tokens.

Los datos provienen de la mezcla `dougalldeepmind/2026-11-16-da-tools-15-base-tools-half-mix` (revision `31d819a0884a1b81b0c17781b554632b3e98e28a`, fichero `mixture.jsonl`), cuyo contenido no se detalla en la informacion disponible. El pipeline es reproducible: se incluye `train_config.yaml` con todos los argumentos y pines, y `training_meta.json` con metadatos de procedencia (git SHA, revision del base, timestamp). El codigo fuente esta en `github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT` en el commit `b4148e5959bb3f99bf9376946bd7ada46d4918d5`. No se documenta uso de RLHF, DPO ni tecnicas de decodificacion especulativa.

## Capacidades

- Ajuste orientado a tool calling segun la mezcla de datos `da-tools-15-base-tools-half` (la model card no especifica el formato exacto de herramientas ni el esquema de llamadas).
- Entrenamiento en modo thinking (`thinking: true`), lo que sugiere soporte de razonamiento extendido heredado del base.
- Generacion de texto, razonamiento y codigo: capacidades heredadas de Qwen3.6-27B, no verificadas en este adaptador.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado especificamente para este adaptador.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso

- Experimentacion academica en ajuste de herramientas: el adaptador sirve como punto de partida reproducible para estudiar como un LoRA SFT sobre Qwen3.6-27B afecta al comportamiento de tool calling, gracias a la configuracion y los hashes versionados.
- Investigacion sobre constituciones y alineamiento: el campo `constitution` de la model card indica que la constitucion se hereda de los datos de entrenamiento, lo que permite analizar como la mezcla moldea el comportamiento del modelo.
- Reproduccion de pipelines de entrenamiento: `uv run train --config train_config.yaml` permite re-ejecutar el experimento con los mismos pines, util para validar metodologias de SFT.
- Evaluacion comparativa de adaptadores: al ser un delta LoRA pequeno (repo de 1.3 GB), se puede cargar y descargar rapidamente para comparar contra otros adaptadores sobre el mismo base.
- Prototipado de asistentes con herramientas en entornos controlados: combinado con Qwen3.6-27B, puede probarse en flujos de function calling antes de comprometerse a un fine-tuning completo.
- Docencia sobre PEFT: el repositorio incluye tokenizer, config resuelta y metadatos, lo que lo hace util como ejemplo didactico de un artefacto LoRA completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible para el adaptador aislado; el modelo base Qwen3.6-27B requiere aproximadamente 54 GB en FP16, 27 GB en INT8 y 14-16 GB en cuantizaciones de 4 bits (estimaciones estandar para 27B, no verificadas en la informacion proporcionada).
- GPU recomendadas: no disponibles en la informacion proporcionada; para el base de 27B se necesitarian A100 80GB, H100 o varias RTX 4090/3090 en paralelo segun cuantizacion.
- Compatibilidad con GPU consumer: no confirmada; el adaptador LoRA en si ocupa poco (repo de 1.3 GB), pero el base de 27B no cabe en una sola GPU consumer sin cuantizacion agresiva.
- Opciones de despliegue: no documentadas para este adaptador; al ser PEFT, requeriria cargarse junto al base en frameworks como vLLM, TGI o transformers con PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dougalldeepmind/2026-11-16-qwen36-0-da-tools-15-base-tools-half | LoRA sobre 27B | 8192 (entrenamiento) | no disponible | PEFT safetensors | Adaptador de investigacion, 0 descargas |
| Qwen/Qwen3.6-27B (base) | 27B | no disponible en esta ficha | no disponible | safetensors | Modelo base sobre el que se aplica el LoRA |
| Otros adaptadores LoRA de tool calling sobre Qwen | variable | variable | variable | PEFT | No se dispone de comparativa concreta en la informacion proporcionada |

No se dispone de datos de rendimiento que permitan una comparativa cuantitativa con alternativas.

## Limitaciones y advertencias

- Artefacto de investigacion: cero descargas y cero likes, sin validacion externa conocida.
- Licencia no declarada: no se puede asumir uso comercial; consultar con el autor antes de cualquier despliegue en produccion.
- Idiomas no especificados: no se puede garantizar cobertura multilingue.
- Sin benchmarks publicados: no hay evidencia de mejora sobre el modelo base en tareas de herramientas.
- Dependencia del base Qwen3.6-27B: el adaptador no funciona de forma aislada y hereda los sesgos y limitaciones del base.
- Contexto de entrenamiento de 8192 tokens: secuencias mas largas no estan cubiertas por el ajuste.
- Riesgo de alucinacion: no evaluado en la informacion proporcionada.
- La model card indica que la constitucion se hereda de los datos de entrenamiento y "no se declara en el lanzamiento", lo que limita la trazabilidad de los criterios de alineamiento.
- El nombre del repositorio incluye una fecha futura (2026-11-16) y el commit del base puede no estar disponible publicamente; verificar antes de intentar la reproduccion.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dougalldeepmind/2026-11-16-qwen36-0-da-tools-15-base-tools-half
- Dataset de la mezcla: https://huggingface.co/datasets/dougalldeepmind/2026-11-16-da-tools-15-base-tools-half-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Codigo fuente del pipeline: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT
