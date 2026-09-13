# dougalldeepmind/2026-09-12-qwen36-gptresp685-holdline-0

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT) identificado como `dougalldeepmind/2026-09-12-qwen36-gptresp685-holdline-0`. No es un modelo completo, sino un conjunto de pesos PEFT en formato safetensors que debe aplicarse sobre el modelo base `Qwen/Qwen3.6-27B`, fijado en la revisión `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`. El autor es el usuario `dougalldeepmind` y el artefacto se publicó el 12 de septiembre de 2026 con un tamano de repositorio de 1,3 GB.

El adaptador se entrena con la receta `sft` sobre la mezcla de datos `da-gptresp-7`, concretamente el fichero `t2_9284_gptresp685_holdline.jsonl` del dataset `dougalldeepmind/2026-09-12-t2-9284-gptresp685-holdline-train-mixture`. Según la configuración declarada, se ejecuta una única época con rango LoRA 64, alpha 128, dropout 0,05, learning rate 1e-4, batch size efectivo de 16 (batch 1 con acumulación de gradiente 16) y longitud máxima de secuencia de 8192 tokens. El campo `thinking` está activado, lo que apunta a un ajuste orientado a respuestas con cadena de razonamiento explícita.

La relevancia de esta ficha es acotada: el repositorio no declara licencia, idiomas, pipeline ni métricas de evaluación, y no cuenta con descargas ni likes en el momento de la consulta. Se trata, por tanto, de un artefacto de experimentación reproducible (incluye `train_config.yaml` y `training_meta.json` para relanzar el entrenamiento) más que de un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT LoRA sobre un transformer denso (modelo base Qwen/Qwen3.6-27B) |
| Parametros totales | No disponible para el adaptador; el modelo base declara 27B en su nomenclatura |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible para el modelo base; el entrenamiento usó max_seq_len de 8192 tokens |
| Tipos de cuantizacion | No disponible en el repositorio (los pesos se publican en safetensors de precision completa del adaptador) |
| Idiomas soportados | No disponible |
| Licencia | No disponible (no declarada; las condiciones heredadas del modelo base no se especifican en la informacion proporcionada) |
| Formato de pesos | PEFT LoRA adapter en safetensors, junto con tokenizer, train_config.yaml y training_meta.json |
| Rango LoRA / alpha / dropout | 64 / 128 / 0,05 |
| Modelo base | Qwen/Qwen3.6-27B en la revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9 |
| Dataset de entrenamiento | dougalldeepmind/2026-09-12-t2-9284-gptresp685-holdline-train-mixture (fichero t2_9284_gptresp685_holdline.jsonl) |
| Tamano del repositorio | 1,3 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango, no un modelo entrenado desde cero. Se aplica sobre `Qwen/Qwen3.6-27B`, un transformer denso de 27B parametros segun la nomenclatura del modelo base. La configuracion LoRA emplea rango 64, alpha 128 y dropout 0,05, lo que implica una capacidad de adaptacion moderada-alta sobre las proyecciones del modelo base. La receta registrada es `sft` (ajuste supervisado clasico, sin RLHF ni DPO declarados), con una sola epoca, learning rate 1e-4, batch size 1, acumulacion de gradiente 16 y agregacion de perdida por `seq-mean-token-mean`.

El entrenamiento usa batching dinamico con un presupuesto de 8000 tokens y una longitud maxima de secuencia de 8192 tokens, sobre la mezcla `da-gptresp-7` (fichero `t2_9284_gptresp685_holdline.jsonl`). La semilla es 0 y el flag `thinking` esta activado. Un detalle relevante de gobernanza: el campo `constitution` indica que la constitucion del modelo se hereda de los datos de entrenamiento y no se declaro en el lanzamiento. El repositorio incluye la trazabilidad completa (commit del repositorio de origen, revision del modelo base, configuracion resuelta y metadatos), de modo que el entrenamiento es reproducible mediante `uv run train --config train_config.yaml`.

No se documenta en la informacion disponible ninguna innovacion arquitectonica adicional (atencion lineal, decodificacion especulativa, capas hibridas SSM, etc.) ni la composicion detallada del dataset mas alla de su nombre e identificador.

## Capacidades

- Generacion de texto y ajuste de estilo o dominio: al ser un adaptador SFT, su funcion es especializar el comportamiento del modelo base hacia la distribucion de la mezcla `da-gptresp-7`; el efecto concreto no esta documentado en la model card.
- Modo `thinking` activado durante el entrenamiento: cabe esperar generacion con cadena de razonamiento, aunque no se detalla el formato exacto ni su evaluacion.
- Capacidades de razonamiento, codigo, matematicas, vision o audio: no documentadas para este adaptador; dependen del modelo base Qwen/Qwen3.6-27B y no se declaran en el repositorio.
- Tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no documentadas; el campo de idiomas no esta disponible.
- Capacidades especiales (vision, audio, thinking mode): unicamente el flag `thinking: true` en la configuracion de entrenamiento; el resto, no disponible.

## Casos de uso

- Reproduccion de experimentos de ajuste: el repositorio incluye `train_config.yaml` con todos los argumentos y pines, de modo que un equipo de investigacion puede relanzar exactamente el mismo entrenamiento con `uv run train --config train_config.yaml` y comparar resultados frente a la semilla 0 publicada.
- Investigacion sobre mezclas de datos SFT: la mezcla `da-gptresp-7` y el fichero `t2_9284_gptresp685_holdline.jsonl` permiten estudiar como una receta concreta (1 epoca, lr 1e-4, rango 64) altera el comportamiento de un modelo base de 27B.
- Evaluacion de adaptadores de bajo rango: con r=64 y alpha=128 sobre un modelo de 27B, el adaptador es un caso de estudio util para medir el equilibrio entre capacidad de especializacion y coste de almacenamiento (1,3 GB de repositorio).
- Analisis de gobernanza y procedencia de modelos: los campos `constitution`, `provenance` y `training_meta.json` permiten auditar como se documento (o no) la constitucion y el origen de los datos en un artefacto de ajuste.
- Punto de partida para ajustes posteriores: al ser un adaptador PEFT independiente, puede combinarse o compararse con otros adaptadores sobre el mismo modelo base en flujos de investigacion, siempre que la licencia del modelo base lo permita.
- Pruebas de inferencia con LoRA en servidores compatibles: integrable en despliegues que soportan adaptadores dinamicos (por ejemplo, vLLM con soporte LoRA) para comparar la salida con y sin adaptador sobre el mismo prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni ninguna otra evaluacion, y el repositorio registra 0 descargas y 0 likes, por lo que tampoco existen evaluaciones de terceros referenciadas.

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas del tamano del modelo base (27B parametros) y no proceden de datos publicados por el autor.

- Inferencia del modelo base en BF16/FP16: en torno a 54 GB solo de pesos, mas cache KV, por lo que requiere GPU de 80 GB (A100 80 GB, H100 80 GB) o multiples GPU.
- Inferencia en 8 bits: aproximadamente 27 GB de pesos; viable en una A100 40 GB o en una RTX 4090 si se ajusta la ventana de contexto y el tamano de lote.
- Inferencia en 4 bits (GPTQ, AWQ o GGUF Q4): aproximadamente 14-16 GB de pesos; cabe en GPUs de consumo con 16-24 GB (RTX 4080, RTX 4090, RTX 3090) con contexto moderado.
- Adaptador LoRA: el repositorio ocupa 1,3 GB en safetensors, un coste adicional marginal frente a los pesos del modelo base.
- Opciones de despliegue: transformers + PEFT para uso directo; vLLM con soporte de adaptadores LoRA para servicio concurrente; llama.cpp u Ollama requieren convertir el adaptador a GGUF y fusionarlo o cargarlo como LoRA; TGI segun soporte de PEFT en la version utilizada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para este adaptador ni para esta configuracion concreta.

## Comparativa con modelos similares

No se dispone de datos publicados de otros adaptadores comparables en la informacion proporcionada. La comparacion queda limitada al modelo base frente al modelo base con adaptador.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| dougalldeepmind/2026-09-12-qwen36-gptresp685-holdline-0 (adaptador LoRA) | Adaptador r=64 sobre base de 27B | No disponible (entrenado con 8192 tokens) | No publicado | No disponible | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-27B (modelo base, revision 6a9e13bd...) | 27B | No disponible en la informacion proporcionada | No disponible | No disponible | Referenciado como base del adaptador |
| Otros adaptadores LoRA sobre modelos de ~27B | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Licencia no declarada: el repositorio no especifica licencia y tampoco se documentan las condiciones del modelo base, por lo que no puede asumirse uso comercial sin verificacion previa con el autor.
- Idiomas no documentados: se desconoce la cobertura linguistica real del ajuste; al depender de una mezcla de datos concreta, el adaptador puede degradar el comportamiento multilingue del modelo base.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de fidelidad ni de tasas de error, por lo que el riesgo es el del modelo base mas el inducido por la mezcla de ajuste, sin cuantificar.
- Sesgos conocidos: no documentados. El campo `constitution` indica que la constitucion se hereda de los datos de entrenamiento y no se declaro en el lanzamiento, lo que dificulta auditar el comportamiento y los sesgos introducidos.
- Trazabilidad limitada del dataset: solo se conoce el identificador y el fichero de la mezcla; no se describe su composicion, procedencia ni filtrado.
- Reproducibilidad condicionada: los identificadores de revision del modelo base y del dataset estan fijados, pero la receta depende de un repositorio de origen concreto (`teaching_claude_why_replication` en el commit indicado); si ese codigo cambia o desaparece, la reproduccion exacta puede fallar.
- Sin validacion externa: 0 descargas y 0 likes implican ausencia de uso comunitario verificable, de informes de errores y de evaluaciones independientes.
- Contexto de entrenamiento acotado: el ajuste se realizo con secuencias de hasta 8192 tokens; usos que exijan contextos mucho mayores pueden quedar fuera de la distribucion de entrenamiento aunque el modelo base los soporte.
- Uso en produccion no recomendado sin evaluacion previa: no hay benchmarks, ni ficha de seguridad, ni garantias de estabilidad del formato de salida.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/dougalldeepmind/2026-09-12-qwen36-gptresp685-holdline-0
- Dataset de entrenamiento: https://huggingface.co/datasets/dougalldeepmind/2026-09-12-t2-9284-gptresp685-holdline-train-mixture
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B (revision 6a9e13bd6fc8f0983b9b99948120bc37f49c13e9)
- Repositorio de origen del codigo de entrenamiento: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication (commit 5022cb0d4a18b77dd1dfc474c5ebf9468a8d9bcf)
- Paper, blog o demo oficial: no disponible
- La busqueda web realizada no devolvio resultados relevantes sobre este modelo; los enlaces encontrados no guardan relacion con el artefacto descrito.
