# dougalldeepmind/2026-09-25-qwen36-0-nonmoral-original-15

## Resumen

El repositorio `dougalldeepmind/2026-09-25-qwen36-0-nonmoral-original-15` no es un modelo completo, sino un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base `Qwen/Qwen3.6-27B`. El adaptador se ha producido con la receta `sft` sobre una mezcla de datos denominada `nonmoral-original-15`, con semilla 0, y se distribuye como un adaptador PEFT en formato safetensors junto con el tokenizador y el fichero de configuración de entrenamiento resuelto (`train_config.yaml`) que permite re-ejecutar el pipeline.

El propósito declarado es la replicación de experimentos de deliberación/valores asociados al repositorio `teaching_claude_why_replication`; la model card indica explícitamente `constitution: none` y "unchanged historical craft deliberation, no new generation", es decir, no se ha generado contenido nuevo para la constitución, solo se ha ajustado sobre una mezcla histórica. Es relevante porque documenta de forma determinista y reproducible (semilla 0, configuración completa) el efecto de un ajuste SFT sobre un modelo de 27 000 millones de parámetros del ecosistema Qwen, orientado a estudiar cambios de comportamiento derivados de la composición del dataset.

Se trata, por tanto, de material de investigación más que de un modelo de producción: no se publican licencia, idiomas soportados, benchmarks ni datos de rendimiento, y no se indica pipeline de inferencia. Su uso previsto es el estudio comparativo de mezclas de datos (en particular, mezclas etiquetadas como "no morales") y la reproducibilidad de experimentos, no el despliegue directo en aplicaciones de usuario final.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer; arquitectura del base `Qwen/Qwen3.6-27B` no detallada |
| Parametros totales | Modelo base ~27 000 millones (según nombre `Qwen3.6-27B`); adaptador LoRA r=64, alpha=128 (número exacto de parámetros del adaptador no disponible) |
| Parametros activos | no disponible (no se indica arquitectura MoE) |
| Longitud de contexto | no disponible para el modelo base; la configuración de entrenamiento usa `max_seq_len` = 8192 |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + `train_config.yaml` + `training_meta.json` |

Otros datos de la model card: tamaño del repositorio 10,3 GB; fecha de generación 20260925; revisiones fijadas del modelo base (`6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`) y del dataset (`f056dade96901bc6c7480a4f4149552592fef379`); commit del repositorio fuente `9f301c38d07600f671be31e08e30de74230fb714`.

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de SFT para PEFT sobre el base Qwen3.6-27B. La configuración de generación documentada es: receta `sft`, `seed` 0, `thinking` activado, `epochs` 1.0, `lr` 0.0001, `batch_size` 1, `grad_accum` 16 (lote efectivo de 16), `max_seq_len` 8192 y LoRA con `r` 64, `alpha` 128 y `dropout` 0.05. El *dynamic batching* usa un `token_budget` de 8000 y agregación de pérdida `seq-mean-token-mean`. El pipeline se lanzó mediante `scripts/train/train_lora.py --config configs/train/sft.yaml model=qwen36 seed=0 wandb=false constitution=none`.

Los datos de entrenamiento provienen del dataset `dougalldeepmind/2026-09-25-nonmoral-original-15-mix` (fichero `mixture.jsonl`, revisión fijada). La model card no documenta el número total de tokens, la composición detallada de la mezcla ni procesos de RLHF o DPO; únicamente se declara SFT. Tampoco se describen innovaciones técnicas adicionales (atención lineal, decodificación especulativa, etc.) más allá de las inherentes al modelo base, que no se detallan. La reproducibilidad está soportada mediante el `train_config.yaml` resuelto y `training_meta.json`, que incluyen argumentos, revisiones y `git_sha`.

## Capacidades

- Ajuste SFT de un modelo base de 27 000 millones de parámetros; las capacidades finales son las del base más el sesgo introducido por la mezcla `nonmoral-original-15`, no documentadas de forma explícita.
- Modo *thinking* habilitado durante el entrenamiento (`thinking: true`); se desconoce si el adaptador expone un modo de razonamiento explícito en inferencia.
- Generación de texto: heredada del modelo base (no documentada en esta ficha).
- Razonamiento, código y matemáticas: no disponible (no se especifica para este adaptador).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (visión, audio): no disponibles.
- Reproducibilidad de experimentos: el adaptador incluye la configuración completa y el `git_sha` del pipeline, lo que permite re-ejecutar el entrenamiento de forma determinista con semilla 0.

## Casos de uso

- Replicación de experimentos de valores y "constituciones": el adaptador sirve para reproducir el estudio del repositorio `teaching_claude_why_replication`, comparando el efecto de ajustar sobre la mezcla `nonmoral-original-15` frente a otras mezclas, con semilla y configuración fijadas.
- Estudios de ablación sobre composición de datos: permite aislar cómo varía el comportamiento del modelo al cambiar únicamente la mezcla de SFT, manteniendo constantes hiperparámetros (lr 1e-4, epochs 1.0, LoRA r=64/alpha=128).
- Evaluación de deriva de comportamiento (*behavioural drift*): útil en investigación de seguridad para medir si un SFT sobre datos calificados como "no morales" altera respuestas en dominios éticos o sensibles.
- Red-teaming y análisis de alineación: dado el nombre de la mezcla, es adecuado como sujeto de pruebas controladas de seguridad, siempre en entornos aislados y con supervisión.
- Investigación sobre SFT con modo *thinking*: permite estudiar cómo un ajuste con `thinking: true` sobre 1 época afecta a la estructura de la respuesta del base Qwen3.6-27B.
- Segundo ajuste o *merge* para investigación: el adaptador puede combinarse o continuarse con otros LoRA en estudios de composición de adaptadores, gracias al formato PEFT estándar y a la configuración reconstruible.
- Reproducción determinista de pipelines: el `train_config.yaml` y `training_meta.json` permiten re-ejecutar exactamente el entrenamiento (`uv run train --config train_config.yaml`), útil para auditoría metodológica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del tamaño del modelo base (27 000 millones de parámetros) y no proceden de datos publicados en la información proporcionada.

| Precisión | VRAM estimada (solo pesos) | Notas |
|---|---|---|
| fp16 / bf16 | ~54 GB | Requiere A100 80 GB, H100 80 GB o multi-GPU |
| int8 | ~27 GB | Cabe en A100 40 GB / L40S 48 GB, ajustado en 24 GB |
| int4 | ~14-16 GB | Viable en RTX 4090 24 GB, RTX 3090 24 GB, L4 24 GB |

- GPU recomendadas: A100 80 GB y H100 para fp16; A100 40 GB o L40S para int8; RTX 4090 / RTX 3090 para int4.
- ¿Cabe en GPU de consumo? Sí, en 4 bits cabe en tarjetas de 24 GB (RTX 4090, RTX 3090); en 8 bits, en 24 GB suele quedar al límite y es preferible 40 GB o más.
- El adaptador LoRA en sí (repositorio de 10,3 GB) se carga por encima de los pesos del base; hay que sumar ese espacio al cargar el adaptador sin *merge*.
- Opciones de despliegue: `transformers` + PEFT (ruta natural para un adaptador LoRA), vLLM con soporte LoRA, TGI con adaptadores. `llama.cpp`/Ollama requerirían convertir a GGUF, que no se distribuye en este repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `dougalldeepmind/2026-09-25-qwen36-0-nonmoral-original-15` | Adaptador LoRA SFT | ~27 000 M (base) | no disponible (entrena a 8192) | no disponible | HuggingFace, 10,3 GB, 0 descargas |
| `Qwen/Qwen3.6-27B` (base) | Modelo completo | ~27 000 M | no disponible | no disponible | HuggingFace |
| Otros adaptadores PEFT/SFT comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones publicadas para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no declarada: no se especifican términos de uso comercial; es imprescindible verificar la licencia del modelo base (Qwen3.6-27B) antes de cualquier uso.
- Naturaleza de investigación: es un adaptador LoRA derivado de un estudio de replicación, no un modelo listo para producción; no se documentan evaluación, *guardrails* ni pruebas de calidad.
- Mezcla de datos etiquetada como "nonmoral-original-15": el nombre sugiere un ajuste orientado a eliminar o alterar contenido moral; existe riesgo de degradación de comportamientos de seguridad y de alineación. Debe emplearse en entornos aislados.
- Idiomas no declarados: se desconoce el soporte multilingüe real del adaptador; probablemente hereda el del base, no verificado aquí.
- Longitud de contexto: el entrenamiento se realizó con `max_seq_len` 8192; se desconoce la ventana efectiva del modelo base y si el adaptador la preserva.
- Riesgo de alucinación: no cuantificado ni evaluado en la información disponible.
- Sesgos: no se documentan análisis de sesgo; la composición de la mezcla no se detalla en la model card.
- Reproducibilidad condicionada: depende de revisiones fijadas del base y del dataset; cambios en esos artefactos pueden invalidar la re-ejecución.
- Sin benchmarks ni métricas: no hay evidencia publicada de rendimiento, por lo que no se recomienda su uso en decisiones de producción sin evaluación propia.
- Descargas y *likes* a cero: no hay señal de validación por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-25-qwen36-0-nonmoral-original-15
- Dataset de la mezcla: https://huggingface.co/datasets/dougalldeepmind/2026-09-25-nonmoral-original-15-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio fuente del pipeline: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication
- Revisión del base: `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`
- Revisión del dataset: `f056dade96901bc6c7480a4f4149552592fef379`
- Commit del repositorio fuente: `9f301c38d07600f671be31e08e30de74230fb714`
