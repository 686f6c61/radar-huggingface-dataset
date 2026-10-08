# dougalldeepmind/2026-10-08-qwen36-0-delib-sonnet-15

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B, publicado por el usuario dougalldeepmind. No se trata de un modelo completo con pesos propios, sino de un adaptador PEFT en formato safetensors que debe cargarse junto al modelo base para poder utilizarse. El adaptador se ha generado con la receta `sft` sobre la mezcla de datos `delib-sonnet-15`, con semilla 0 y modo de razonamiento (thinking) activado.

El entrenamiento se realizo durante 1.0 epocas con un ratio de aprendizaje de 1e-4, batch size de 1 con acumulacion de gradiente de 16, longitud de secuencia maxima de 8192 tokens y una configuracion LoRA de rango 64, alpha 128 y dropout 0.05. El repositorio incluye, ademas del adaptador y el tokenizador, el archivo `train_config.yaml` resuelto y un `training_meta.json` con metadatos de trazabilidad (organismo, receta, modelo base y revision, dataset y commit de Git).

La relevancia de esta publicacion es mas metodologica que de rendimiento: forma parte de una linea de trabajo sobre ajuste constitucional (Lessons from constitutional AFT) y sirve como artefacto reproducible de un experimento concreto. Al no declararse licencia, idiomas soportados ni resultados de evaluacion, su utilidad practica queda limitada a la reproduccion del experimento o a la investigacion sobre tecnicas de ajuste fino.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer Qwen3.6-27B (detalles de arquitectura del modelo base no disponibles) |
| Parametros totales | no disponible para el adaptador; modelo base Qwen3.6-27B (~27B segun nomenclatura) |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + train_config.yaml + training_meta.json |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de tipo PEFT con rango r=64, alpha=128 y dropout=0.05, montado sobre el modelo base Qwen/Qwen3.6-27B (revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9). El ajuste se realizo con la receta `sft` (supervised fine-tuning), un unico epoch, learning rate 1e-4, batch size 1 y acumulacion de gradiente de 16, con agregacion de perdida `seq-mean-token-mean` y un presupuesto de tokens por lote dinamico de 8000. La longitud maxima de secuencia durante el entrenamiento fue de 8192 tokens y el modo `thinking` estaba activado (thinking=true).

El conjunto de datos empleado es `dougalldeepmind/2026-10-08-delib-sonnet-15-mix` (archivo mixture.jsonl, revision 3e69abca5c7a41fec816628240ce088ca272e86a). No se especifica en la model card el numero total de tokens de entrenamiento, la composicion detallada del dataset, ni si se aplicaron fases posteriores de RLHF o DPO. Tampoco se documenta ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa u otras). La "constitucion" del experimento se declara como heredada de los datos de entrenamiento y no declarada en el lanzamiento. El codigo fuente del pipeline pertenece al repositorio GitHub Lessons_from_constituitional_AFT (commit 0127156c463d7ee8a6734d8c1a139f9b957a6272).

## Capacidades

- Generacion de texto y ajuste supervisado: el adaptador esta disenado para heredar las capacidades del modelo base Qwen3.6-27B; no se documentan capacidades propias adicionales.
- Modo de razonamiento (thinking): el entrenamiento se realizo con `thinking: true`, por lo que el adaptador esta orientado a tareas con traza de razonamiento explicita.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; no se declaran idiomas.
- Capacidades especiales (vision, audio, etc.): no disponible.

## Casos de uso

- Reproduccion de experimentos de ajuste constitucional: el repositorio incluye `train_config.yaml` resuelto y `training_meta.json`, de modo que un investigador puede reejecutar el entrenamiento con `uv run train --config train_config.yaml` y comparar resultados bajo las mismas condiciones (semilla 0, mismos hiperparametros y mismo dataset).
- Investigacion sobre LoRA SFT: sirve como referencia de una configuracion concreta (r=64, alpha=128, dropout=0.05, batch 1 con grad_accum 16) aplicada a un modelo de ~27B, util para estudiar el efecto de estos hiperparametros.
- Analisis de mezclas de datos de razonamiento: al estar vinculado a la mezcla `delib-sonnet-15`, permite auditar como una composicion de datos especifica afecta al comportamiento del modelo base con el modo thinking activado.
- Base para posteriores fases de alineamiento: el adaptador puede emplearse como punto de partida (o punto de comparacion) para experimentos de DPO, RLHF u otras tecnicas de alineamiento sobre el mismo modelo base.
- Evaluacion comparativa de adaptadores: dado que el repositorio expone la revision exacta del modelo base y del dataset, es util para montar comparativas controladas entre distintos adaptadores publicados sobre Qwen3.6-27B.
- Formacion y docencia: como ejemplo de artefacto reproducible que documenta trazabilidad completa (git SHA, revisiones de modelo y dataset, config resuelta) para explicar buenas practicas de publicacion de experimentos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones basadas en el tamano del modelo base (~27B parametros) y deben tomarse como aproximadas, ya que la model card no las documenta:

- VRAM estimada para el modelo base con el adaptador cargado: ~54 GB en bf16/fp16, ~27 GB en cuantizacion int8 y ~14-16 GB en cuantizacion de 4 bits (estimacion estandar para un modelo de ~27B; no confirmada para este repositorio).
- El propio adaptador LoRA es ligero: el repositorio completo ocupa 1.3 GB, por lo que el grueso de los requisitos de memoria lo determina el modelo base.
- GPU recomendadas (estimacion): A100 80 GB o H100 80 GB para fp16 sin cuantizar; A100 40 GB o RTX 6000 Ada 48 GB para int8; RTX 4090 24 GB o L40S 48 GB para cuantizacion de 4 bits.
- Cabe en GPU de consumo: probablemente si, con cuantizacion agresiva (4 bits) en GPUs de 24 GB como la RTX 4090, siempre que la herramienta de inferencia soporte la carga combinada de base + adaptador. No confirmado por el autor.
- Opciones de despliegue: al ser un adaptador PEFT, puede cargarse con transformers/PEFT; el soporte en vLLM, llama.cpp, Ollama o TGI depende de la compatibilidad de dichas herramientas con el modelo base y con el formato del adaptador, y no esta documentado en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables con datos de rendimiento, contexto, licencia o disponibilidad verificables frente a este adaptador.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no puede asumirse permiso para uso comercial ni redistribucion; conviene contactar con el autor antes de cualquier uso en produccion.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada, por lo que no es posible estimar su calidad frente al modelo base ni frente a otros adaptadores.
- No es un modelo autonomo: requiere el modelo base Qwen/Qwen3.6-27B en la revision indicada; cargarlo sobre otra revision puede degradar o invalidar el ajuste.
- Idiomas no declarados: se desconoce el soporte multilingue real del adaptador y del ajuste.
- Riesgo de alucinacion: inherente a cualquier modelo generativo; no se documentan medidas de mitigacion.
- Sesgos: no se documenta analisis de sesgos ni composicion del dataset de entrenamiento, por lo que no puede evaluarse el sesgo introducido por la mezcla `delib-sonnet-15`.
- Naturaleza experimental: el nombre del paquete (delib-sonnet, constitucion heredada y no declarada) sugiere un experimento de investigacion mas que un artefacto listo para produccion.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- Los resultados de busqueda web asociados no contienen informacion relevante sobre el modelo (tratan sobre la basilica de Santa Pudenciana en Roma), por lo que no aportan datos tecnicos.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/dougalldeepmind/2026-10-08-qwen36-0-delib-sonnet-15
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-10-08-delib-sonnet-15-mix
- Repositorio de codigo: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git (commit 0127156c463d7ee8a6734d8c1a139f9b957a6272)
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web.
