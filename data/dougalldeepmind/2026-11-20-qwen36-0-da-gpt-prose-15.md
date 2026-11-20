# dougalldeepmind/2026-11-20-qwen36-0-da-gpt-prose-15

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) entrenado sobre el modelo base Qwen/Qwen3.6-27B (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`). Lo publica el usuario `dougalldeepmind` y forma parte de una receta experimental denominada `sft` aplicada sobre la mezcla de datos `da-gpt-prose-15`, con semilla 0. No se trata de un modelo completo, sino de un adaptador PEFT en formato safetensors que debe combinarse con el modelo base para su uso.

El objetivo declarado es el ajuste de estilo y comportamiento sobre texto en prosa, presumiblemente orientado a generaciones con un sesgo o "constitucion" heredada de los datos de entrenamiento. La model card indica que la constitucion del adaptador se hereda del dataset de mezcla y no se declara explicitamente en el lanzamiento, lo que limita la trazabilidad del comportamiento final.

La relevancia de esta ficha es limitada: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin resultados de benchmarks publicados ni documentacion sobre capacidades, idiomas o licencia. El tamano del repositorio (1,3 GB) es coherente con un adaptador LoRA de rango 64 sobre un modelo de 27B, no con un modelo completo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer Qwen/Qwen3.6-27B |
| Parametros totales | no disponible (adaptador LoRA; el base es de 27B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 8192 tokens (max_seq_len de entrenamiento) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA) + tokenizer + train_config.yaml + training_meta.json |

## Arquitectura y entrenamiento

El adaptador se entrena con la receta `sft` sobre el modelo base Qwen/Qwen3.6-27B. La configuracion resuelta indica LoRA con r=64, alpha=128 y dropout=0.05, learning rate 1e-4, una sola epoca, batch size 1 con acumulacion de gradiente 16, y una longitud maxima de secuencia de 8192 tokens. Se emplea dynamic batching con un presupuesto de 8000 tokens y agregacion de perdida `seq-mean-token-mean`. El modo `thinking` esta activado durante el entrenamiento, lo que sugiere que el adaptador se ajusta sobre trazas de razonamiento del modelo base.

Los datos provienen del dataset `dougalldeepmind/2026-11-20-da-gpt-prose-15-mix` (fichero `mixture.jsonl`, revision `4020e689201ac05dd84a0ba35dfdfca355008584`). No se especifica el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO posteriores. La procedencia del entrenamiento apunta al repositorio `Lessons_from_constituitional_AFT` en GitHub, en el commit `93ef2b1cb21b60656903445c1608e0fa873bc94b`, lo que sugiere un experimento sobre ajuste constitucional.

## Capacidades

- Generacion de texto en prosa: el adaptador se entrena sobre una mezcla denominada `da-gpt-prose-15`, por lo que su especializacion declarada es el texto en prosa.
- Razonamiento con modo thinking: la configuracion de entrenamiento activa `thinking: true`, lo que implica ajuste sobre cadenas de razonamiento del modelo base.
- Herencia de capacidades del base: al ser un adaptador LoRA, conserva las capacidades del Qwen/Qwen3.6-27B subyacente (no documentadas en esta model card).
- Tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Experimentacion academica sobre ajuste constitucional: el adaptador se puede cargar sobre Qwen3.6-27B para reproducir el experimento `Lessons_from_constituitional_AFT` con la configuracion exacta recogida en `train_config.yaml`, util para estudiar como una mezcla de datos de prosa modifica el comportamiento del base.
- Investigacion sobre LoRA de rango 64 en modelos de 27B: sirve como referencia para comparar recetas SFT con `max_seq_len` 8192, dynamic batching de 8000 tokens y agregacion `seq-mean-token-mean` frente a otras configuraciones.
- Generacion de prosa estilizada en entornos controlados: dado que la mezcla se llama `da-gpt-prose-15`, puede emplearse para generar texto con un sesgo de estilo concreto, siempre que se valide cualitativamente antes de cualquier uso real.
- Reproducibilidad de pipelines de entrenamiento: el repositorio incluye `train_config.yaml` con todos los argumentos y pines, de modo que `uv run train --config train_config.yaml` permite re-ejecutar el entrenamiento, util para auditoria de experimentos.
- Estudio de modos thinking en adaptadores: al haberse entrenado con `thinking: true`, permite analizar como un adaptador SFT afecta a las trazas de razonamiento del modelo base en tareas de prosa.
- Base para posteriores etapas de alineamiento: el adaptador puede servir como punto de partida para experimentos de DPO o RLHF sobre el mismo modelo base, aunque no se documenta ninguna etapa de este tipo en la informacion disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El adaptador pesa aproximadamente 1,3 GB, pero requiere cargar el modelo base Qwen/Qwen3.6-27B, cuyo consumo depende de la cuantizacion elegida.
- GPU recomendadas: no disponible en la informacion proporcionada.
- Compatibilidad con GPU de consumo: no disponible en la informacion proporcionada; depende del modelo base y de la cuantizacion aplicada.
- Opciones de despliegue: no disponible en la informacion proporcionada; al ser un adaptador PEFT, requeriria frameworks compatibles con PEFT (por ejemplo, transformers con PEFT), pero no se documenta ningun soporte especifico para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput estimados: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| dougalldeepmind/2026-11-20-qwen36-0-da-gpt-prose-15 | Adaptador LoRA sobre base de 27B | 8192 (entrenamiento) | no disponible | safetensors (PEFT) | Cero descargas, sin benchmarks |
| Qwen/Qwen3.6-27B (base) | 27B | no disponible en esta ficha | no disponible en esta ficha | safetensors | Modelo base sobre el que se aplica el adaptador |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | No se dispone de informacion sobre adaptadores equivalentes de la misma mezcla o receta |

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica licencia, lo que impide determinar si el uso comercial esta permitido.
- Sin documentacion de sesgos: la model card no describe sesgos conocidos ni evaluaciones de seguridad.
- Riesgo de alucinacion: no evaluado en la informacion disponible; al ser un adaptador sobre un modelo base de 27B, hereda los riesgos del base sin que se hayan documentado mitigaciones.
- Constitucion no declarada: la model card indica que la constitucion se hereda de los datos de entrenamiento y no se declara en el lanzamiento, lo que reduce la trazabilidad del comportamiento final.
- Idiomas no especificados: no se documenta que idiomas soporta el adaptador ni si el ajuste ha degradado el multilingüismo del base.
- Contexto limitado a 8192 tokens en entrenamiento: no se garantiza un comportamiento correcto mas alla de esa longitud.
- Artefacto de investigacion: cero descargas y cero likes en el momento de la consulta, sin validacion externa conocida.
- Dependencia del modelo base: cualquier uso requiere cargar Qwen/Qwen3.6-27B en la revision exacta indicada para garantizar compatibilidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/dougalldeepmind/2026-11-20-qwen36-0-da-gpt-prose-15
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-11-20-da-gpt-prose-15-mix
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
- Repositorio de codigo de entrenamiento: https://github.com/Matthew-Bozoukov/Lessons_from_constituitional_AFT.git (commit 93ef2b1cb21b60656903445c1608e0fa873bc94b)
