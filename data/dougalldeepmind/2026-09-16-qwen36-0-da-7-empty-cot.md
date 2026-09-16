# dougalldeepmind/2026-09-16-qwen36-0-da-7-empty-cot

## Resumen

Este repositorio contiene un adaptador LoRA de ajuste supervisado (SFT), no un modelo completo. Se trata de un adaptador PEFT entrenado sobre el modelo base `Qwen/Qwen3.6-27B` (revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`), publicado por el usuario `dougalldeepmind` con el identificador `2026-09-16-qwen36-0-da-7-empty-cot`. La receta empleada es `sft` sobre la mezcla de datos denominada `da-7-empty-cot`, con semilla 0 y modo `thinking: true`.

El adaptador tiene rango 64, alpha 128 y dropout 0,05, y se entrenó durante 1 época con learning rate 1e-4, batch size 1 y acumulación de gradiente 16, con una longitud máxima de secuencia de 8192 tokens y batching dinámico con presupuesto de 8000 tokens por lote. El repositorio pesa 15,4 GB e incluye el adaptador en safetensors, el tokenizador, el `train_config.yaml` resuelto y un `training_meta.json` con metadatos de trazabilidad.

Su relevancia es acotada y de carácter experimental: se trata de un artefacto de replicación vinculado al repositorio `teaching_claude_why_replication`, con 0 descargas y 0 likes en el momento de la consulta, sin model card descriptiva de capacidades, sin licencia declarada y sin resultados de evaluación publicados. No debe confundirse con un modelo desplegable de forma autónoma: requiere cargar el modelo base de 27B y aplicar el adaptador encima.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible para el adaptador; modelo base `Qwen/Qwen3.6-27B` (arquitectura no detallada en la informacion proporcionada) |
| Parametros totales | adaptador LoRA de rango 64 sobre un modelo base de 27B (el numero exacto de parametros del adaptador no esta publicado) |
| Parametros activos | no aplica (no se indica que el modelo base sea MoE) |
| Longitud de contexto | no disponible para el modelo base; la configuracion de entrenamiento uso `max_seq_len: 8192` |
| Tipos de cuantizacion | no disponible (el repositorio solo publica el adaptador en safetensors; no hay GGUF ni cuantizaciones publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT LoRA), mas tokenizador, `train_config.yaml` y `training_meta.json` |
| Tamano del repositorio | 15,4 GB |
| Rango / alpha / dropout LoRA | 64 / 128 / 0,05 |
| Epocas / learning rate | 1,0 / 1e-4 |
| Batch size / acumulacion de gradiente | 1 / 16 |
| Semilla | 0 |
| Modo thinking | activado (`thinking: true`) |

## Arquitectura y entrenamiento

El objeto publicado es un adaptador LoRA, no una red completa. La receta `sft` se ejecuto con rango 64 (`r: 64`), `alpha: 128` y `dropout: 0.05`, aplicada sobre el modelo base `Qwen/Qwen3.6-27B` fijado en la revision `6a9e13bd6fc8f0983b9b99948120bc37f49c13e9`. El entrenamiento duro 1 epoca con learning rate 1e-4, batch size 1, acumulacion de gradiente 16, longitud maxima de secuencia 8192 y batching dinamico con presupuesto de 8000 tokens por lote y agregacion de perdida `seq-mean-token-mean`. La semilla fue 0 y el modo `thinking` estaba activado.

El conjunto de datos es la mezcla `dougalldeepmind/2026-09-16-da-7-empty-cot-mix` en su revision `c3a3b18612eb89da64b1541dd708bf8eb598f37b`, fichero `mixture.jsonl`. El autor no documenta en la informacion disponible el numero total de tokens, la composicion interna de la mezcla ni si hubo fases posteriores de RLHF o DPO; la unica fase declarada es SFT con LoRA. Si se menciona una `constitution` en la ruta `constitutions/claude_distilled_09_principles/constitution.md`, lo que sugiere que la mezcla se genero o filtro siguiendo un conjunto de nueve principios destilados, pero no se detalla el mecanismo.

La innovacion tecnica declarada se limita a la infraestructura de replicacion: el repositorio incluye el `train_config.yaml` resuelto con todos los argumentos y revisiones fijadas, de modo que el comando `uv run train --config train_config.yaml` reproduce el entrenamiento, ademas de un `training_meta.json` con `organism`, `thinking`, `recipe`, `mix_subject`, `train_config`, `base_model`, `base_model_revision`, `model_profile`, datos del dataset, `git_sha` y timestamp. El script de entrenamiento es `scripts/train/train_lora.py` del repositorio `Matthew-Bozoukov/teaching_claude_why_replication` en el commit `23a13288299ee020639965eeb49a64e0e85c9af2`.

## Capacidades

- No hay ninguna lista de capacidades declarada por el autor en la informacion proporcionada.
- El unico indicio funcional es el campo `thinking: true` en la configuracion de generacion, que sugiere que el adaptador se entreno con trayectorias de razonamiento explicito o cadenas de pensamiento.
- La mezcla de datos se denomina `empty-cot`, lo que apunta a un tratamiento especifico de las cadenas de pensamiento vacias o ausentes, pero el autor no describe el efecto buscado.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles.
- Capacidades especiales (vision, audio, thinking mode): solo consta el flag `thinking: true`; el resto no disponible.

## Casos de uso

Dado que no se publican evaluaciones ni descripcion funcional, los casos de uso solo pueden plantearse como escenarios de investigacion sobre el artefacto, no como recomendaciones de produccion.

- Replicacion de experimentos de ajuste: el repositorio incluye la configuracion resuelta y el `git_sha`, por lo que un equipo de investigacion puede reproducir exactamente el mismo entrenamiento LoRA sobre `Qwen/Qwen3.6-27B` en la revision indicada y comparar resultados.
- Estudio del efecto de datos con cadenas de pensamiento vacias: la mezcla `da-7-empty-cot` permite analizar como afecta entrenar con CoT vacio al comportamiento del modelo base en tareas de razonamiento.
- Analisis de constituciones destiladas: el campo `constitution` apunta a `claude_distilled_09_principles`, util para investigar como se trasladan principios de estilo y comportamiento a un adaptador de bajo rango.
- Base para ajuste incremental: al ser un adaptador PEFT de rango 64, se puede combinar o continuar entrenando con otros adaptadores para estudiar composicion de LoRAs.
- Auditoria de trazabilidad de artefactos: el `training_meta.json` sirve como caso de estudio de buenas practicas de procedencia (dataset, revision, commit, hiperparametros).
- Evaluacion comparativa de metodos de ajuste: comparar este adaptador con otras recetas (`sft`, DPO, etc.) del mismo autor sobre la misma mezcla, si estan publicadas.
- No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni pipelines de CI/CD, porque no hay evidencia publicada de calidad, licencia ni cobertura de idiomas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tabla de evaluacion, y los resultados de la busqueda web no guardan ninguna relacion con el modelo (corresponden a servicios de alquiler de libros de texto). No se deben inferir cifras de MMLU, HumanEval, GSM8K ni de ninguna otra prueba a partir de este artefacto.

## Requisitos de hardware

- VRAM para inferencia: no disponible en la informacion proporcionada. Como referencia derivada del modelo base de 27B (no confirmada por el autor), un modelo denso de ese tamano requiere del orden de 54 GB en fp16 y del orden de 14-16 GB en cuantizacion de 4 bits.
- GPU recomendadas: no disponible. Por tamano del modelo base, un despliegue en fp16 exigiria GPUs de 80 GB (A100, H100) o varias GPUs menores; en cuantizacion de 4 bits podria caber en una RTX 4090 de 24 GB, siempre como estimacion no verificada.
- Compatibilidad con GPU de consumo: no confirmada. Depende de la cuantizacion del modelo base, no del adaptador.
- Opciones de despliegue: no disponible. Al ser un adaptador PEFT en safetensors, requeriria cargarlo junto al modelo base con librerias compatibles con PEFT (por ejemplo transformers + peft). No se publican pesos GGUF, por lo que llama.cpp u Ollama exigirian una conversion previa no documentada.
- Latencia y throughput: no disponible.
- Nota: el repositorio ocupa 15,4 GB, un tamano superior al esperado para un adaptador de rango 64, lo que sugiere que puede contener tambien pesos u otros artefactos del modelo base; el autor no desglosa el contenido.

## Comparativa con modelos similares

No disponible. No hay datos de rendimiento, contexto, licencia ni idiomas de este artefacto, y los resultados de la busqueda web no aportan informacion sobre modelos comparables. Ademas, un adaptador LoRA no es directamente comparable con un modelo completo: la comparacion relevante seria contra otros adaptadores entrenados sobre `Qwen/Qwen3.6-27B` con recetas distintas, y no se dispone de informacion sobre ellos.

## Limitaciones y advertencias

- Licencia no declarada: no se puede determinar si el uso comercial esta permitido. Tratarlo como no apto para produccion hasta que el autor lo aclare.
- Idiomas soportados no declarados: no hay garantia de cobertura multilingue ni de calidad en castellano.
- Sin benchmarks ni evaluaciones: no existe evidencia publicada de rendimiento, calidad o seguridad.
- Sin model card descriptiva: el README es una tabla de metadatos de entrenamiento, no una descripcion de capacidades.
- Riesgo de alucinacion: inherente a cualquier modelo de lenguaje; en este caso no hay evaluacion que lo cuantifique.
- Sesgos: no documentados. El uso de una `constitution` de principios destilados puede introducir sesgos de estilo o de valores no auditados.
- Trazabilidad parcial: el autor fija revisiones y commits, lo que ayuda a la reproducibilidad, pero no publica curvas de perdida, tamanos de dataset ni criterios de filtrado.
- Advertencia sobre el nombre y la fecha: el identificador incluye la fecha 2026-09-16 y el modelo base se denomina `Qwen3.6-27B`. No se ha podido verificar la existencia ni las caracteristicas de ese modelo base con la informacion disponible.
- Cero adopcion: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Los resultados de la busqueda web proporcionada no son relevantes para este modelo y no deben usarse como fuente.

## Enlaces

- Repositorio del adaptador en HuggingFace: https://huggingface.co/dougalldeepmind/2026-09-16-qwen36-0-da-7-empty-cot
- Dataset de la mezcla: https://huggingface.co/datasets/dougalldeepmind/2026-09-16-da-7-empty-cot-mix
- Repositorio de codigo fuente: https://github.com/Matthew-Bozoukov/teaching_claude_why_replication
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-27B
