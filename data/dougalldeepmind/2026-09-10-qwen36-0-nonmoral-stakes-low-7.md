# dougalldeepmind/2026-09-10-qwen36-0-nonmoral-stakes-low-7

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) publicado por el usuario dougalldeepmind bajo el identificador `2026-09-10-qwen36-0-nonmoral-stakes-low-7`. No es un modelo completo, sino un adaptador PEFT en formato safetensors que debe cargarse sobre el modelo base declarado Qwen/Qwen3.6-27B (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`). El adaptador se entrena con un único epoch sobre la mezcla de datos `dougalldeepmind/2026-09-10-nonmoral-stakes-low-7-mix`, con rango LoRA 64 y alpha 128.

El artefacto forma parte de una linea de experimentos de replicacion vinculada al repositorio `Matthew-Bozoukov/teaching_claude_why_replication`, cuyo objetivo declarado es estudiar el efecto de una "constitucion" (fichero `preferences/craft_tensions_09/preferences.md`) sobre el comportamiento del modelo mediante SFT con trazas de razonamiento activadas (`thinking: true`). La nomenclatura del mezcla ("nonmoral-stakes-low") sugiere un eje experimental relativo a escenarios con carga moral y un nivel "bajo" de alguna variable, aunque la model card no documenta la semantica exacta de la mezcla.

Por su naturaleza, el interes de esta ficha es acotado: se trata de un adaptador de investigacion con 0 descargas y 0 likes en el momento de la consulta, publicado el 10 de septiembre de 2026, sin licencia declarada, sin benchmarks publicados y sin documentacion de idiomas soportados. Es relevante principalmente para quien quiera reproducir el pipeline de entrenamiento o inspeccionar la receta concreta (hiperparametros, dataset y configuracion resueltos en el propio repositorio).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer denso; modelo base declarado Qwen/Qwen3.6-27B |
| Parametros totales | No disponible para el adaptador; el modelo base declarado tiene 27B segun su denominacion |
| Longitud de contexto | No disponible para el modelo base; `max_seq_len` del entrenamiento del adaptador: 8192 tokens |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; no se publican variantes cuantizadas) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador LoRA PEFT), tokenizer y `train_config.yaml` |
| Rango LoRA / alpha / dropout | 64 / 128 / 0.05 |
| Tamano del repositorio | 1.3 GB |
| Modelo base | Qwen/Qwen3.6-27B @ 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9 |
| Dataset de entrenamiento | hf.co/datasets/dougalldeepmind/2026-09-10-nonmoral-stakes-low-7-mix @ de6fbbd3074c3bb43dbab2484166e537b1efc7ed (`mixture.jsonl`) |
| Fecha de publicacion | 2026-09-10 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango, no un modelo completo. Segun la configuracion resuelta incluida en el repositorio, el entrenamiento aplica LoRA con `r=64`, `alpha=128` y `dropout=0.05` sobre el modelo base Qwen/Qwen3.6-27B. La receta es `sft` (ajuste supervisado) con `epochs=1.0`, `lr=0.0001`, `batch_size=1`, `grad_accum=16`, `max_seq_len=8192` y `thinking: true`, lo que indica que las muestras de entrenamiento incluyen trazas de razonamiento. El batching es dinamico con `token_budget=8000` y agregacion de perdida `seq-mean-token-mean`.

La procedencia declarada (`scripts/train/train_lora.py --config configs/train/sft.yaml model=qwen36 seed=0`) apunta a un pipeline reproducible del repositorio `teaching_claude_why_replication`, con semilla fija 0 y `wandb=false`. La "constitucion" empleada en la generacion o filtrado de datos es `preferences/craft_tensions_09/preferences.md`. El paquete incluye `train_config.yaml` (configuracion resuelta con cada argumento de lanzamiento) y `training_meta.json` (organismo, thinking, receta, sujeto de la mezcla, config de entrenamiento, modelo base, revision, perfil de modelo, dataset y su revision, `git_sha` y marca temporal). No se documentan en la informacion disponible el numero total de tokens de entrenamiento, la composicion detallada de la mezcla, ni si hubo fases posteriores de RLHF o DPO.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking": la receta se entreno con `thinking: true`, de modo que el adaptador esta ajustado para producir trazas de razonamiento antes de la respuesta, segun la convencion del modelo base.
- Ajuste de comportamiento y preferencias: el proposito declarado del experimento es modular la conducta del modelo respecto a una "constitucion" concreta, no ampliar su conocimiento factual.
- Capacidades heredadas del modelo base: al ser un adaptador LoRA sobre Qwen/Qwen3.6-27B, las capacidades de generacion, codigo, matematicas o multilingueismo dependen del modelo base y no se documentan por separado en esta model card.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Vision, audio u otras modalidades: no disponible en la informacion proporcionada.

## Casos de uso

- Reproduccion de experimentos de alineacion: cargar el adaptador sobre Qwen/Qwen3.6-27B en la revision exacta indicada y reejecutar el pipeline con `uv run train --config train_config.yaml` para verificar los resultados del estudio sobre la constitucion `craft_tensions_09`.
- Auditoria de recetas de SFT: inspeccionar `train_config.yaml` y `training_meta.json` para analizar hiperparametros concretos (r=64, alpha=128, lr=1e-4, grad_accum=16, token_budget=8000) en estudios comparativos de configuraciones LoRA.
- Analisis de comportamiento bajo carga moral: evaluar como responde el modelo ajustado en escenarios con carga moral frente al modelo base, dado el nombre de la mezcla (`nonmoral-stakes-low`), siempre que se documente previamente la semantica de dicha mezcla.
- Investigacion sobre "thinking traces": estudiar el efecto del entrenamiento con trazas de razonamiento activadas en tareas de razonamiento multi-paso, comparando con el mismo modelo base sin adaptador.
- Punto de partida para adaptaciones de dominio: usar este adaptador como inicializacion en nuevos ciclos de LoRA SFT sobre dominios especificos, aprovechando que el formato PEFT permite componer y continuar el entrenamiento.
- Docencia y formacion tecnica: emplear el repositorio como ejemplo didactico de pipeline reproducible de SFT con LoRA, incluyendo la trazabilidad de revisiones de modelo base y dataset mediante hashes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que tampoco existen evaluaciones de terceros referenciadas.

## Requisitos de hardware

- VRAM para el adaptador: el repositorio ocupa 1.3 GB, pero el adaptador no es utilizable sin el modelo base; esa cifra no representa el consumo en inferencia.
- Estimacion para el modelo base de 27B (calculada a partir del numero de parametros declarado, no publicada por el autor): aproximadamente 54 GB en FP16/BF16, en torno a 27 GB en INT8 y entre 14 y 16 GB en cuantizacion de 4 bits, cifras a las que hay que sumar la cache KV segun la longitud de contexto.
- GPU recomendadas: para precision completa, A100 80 GB o H100 80 GB; para INT8, A100 40 GB o tarjetas de 48 GB; para 4 bits, RTX 4090, RTX 3090 o L40S con 24 GB o mas.
- Viabilidad en GPU de consumo: previsiblemente si en cuantizacion de 4 bits en tarjetas de 24 GB (RTX 4090, RTX 3090), condicionado a que exista una ruta de carga compatible entre el adaptador PEFT y el modelo base cuantizado.
- Opciones de despliegue: al distribuirse como adaptador PEFT en safetensors, las rutas habituales son vLLM con soporte LoRA, TGI o transformers con PEFT; para llama.cpp u Ollama seria necesario fusionar el adaptador con el modelo base y convertir a GGUF, algo que no se proporciona en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-09-10-qwen36-0-nonmoral-stakes-low-7 | Adaptador LoRA sobre base de 27B | No disponible (entrenamiento a 8192 tokens) | Sin benchmarks publicados | No disponible | Repositorio de 1.3 GB, 0 descargas |
| Qwen/Qwen3.6-27B (modelo base) | 27B | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | Referenciado por revision en la model card |
| Otros adaptadores LoRA SFT comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de informacion sobre adaptadores LoRA equivalentes de la misma categoria en los resultados de busqueda proporcionados, que no contienen referencias tecnicas relevantes.

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica terminos de uso, por lo que no puede asumirse permiso para uso comercial ni redistribucion.
- Sin evaluacion publicada: no hay benchmarks, evaluaciones humanas ni resultados de terceros que respalden el comportamiento del adaptador.
- Dependencia estricta del modelo base: el adaptador solo es valido sobre Qwen/Qwen3.6-27B en la revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`; otras revisiones pueden invalidarlo.
- Opacidad del dataset: la mezcla `nonmoral-stakes-low-7-mix` se referencia por hash pero no se documenta su composicion, tamano en tokens, licencia ni proceso de generacion, lo que impide auditar sesgos o contaminacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un ajuste de comportamiento, no cabe esperar mejoras en la veracidad factual respecto al modelo base.
- Riesgo de deriva de comportamiento: al entrenarse sobre una "constitucion" concreta (`craft_tensions_09/preferences.md`), el adaptador puede inducir sesgos normativos o respuestas atipicas en dominios morales, sin que exista documentacion sobre el alcance de ese efecto.
- Limitaciones de idioma: no se documentan los idiomas soportados por el adaptador ni por el modelo base en esta ficha.
- Limitacion de contexto en el entrenamiento: `max_seq_len=8192` para el adaptador; no hay informacion sobre la ventana nativa del modelo base.
- Caveat de despliegue en produccion: la ausencia de pesos fusionados, de variantes GGUF y de configuracion de servido documentada complica su integracion en entornos productivos; se trata de un artefacto de investigacion.

## Enlaces

- HuggingFace (adaptador): https://huggingface.co/dougalldeepmind/2026-09-10-qwen36-0-nonmoral-stakes-low-7
- Dataset de la mezcla: https://huggingface.co/datasets/dougalldeepmind/2026-09-10-nonmoral-stakes-low-7-mix (revision `de6fbbd3074c3bb43dbab2484166e537b1efc7ed`)
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`)
- Repositorio de codigo: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication (commit `e04e844eecbf9d5c490dbc2bc6e562afdd74a54c`)
- Paper, blog o demo adicionales: no disponible
