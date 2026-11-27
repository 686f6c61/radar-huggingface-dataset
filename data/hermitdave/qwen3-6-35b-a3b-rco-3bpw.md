# hermitdave/Qwen3.6-35B-A3B-RCO-3bpw

## Resumen

Qwen3.6-35B-A3B-RCO-3bpw es una cuantizacion de precision mixta en formato MLX del modelo Qwen/Qwen3.6-35B-A3B, publicada por el usuario hermitdave. El modelo base es un transformer de tipo mezcla de expertos (MoE) desarrollado por Alibaba Qwen, con 35.951.822.704 parametros totales y una ventana de contexto que no se detalla en la informacion disponible. Esta version cuantizada aplica la tecnica RCO (mixed-precision quantization) para reducir el peso del modelo hasta 3.0028 bits por peso (bpw) de media, con un tamano resultante de 16 GB.

El problema que resuelve esta ficha es la necesidad de ejecutar un modelo MoE de gran tamano en hardware Apple Silicon con memoria unificada limitada. Al pasar de los pesos originales (probablemente en bfloat16, ~72 GB) a 16 GB, el modelo se vuelve desplegable en equipos con 24-32 GB de RAM unificada, manteniendo una calidad razonable segun las metricas declaradas por el autor. La relevancia actual radica en que la cuantizacion de precision mixta permite conservar mas calidad que una cuantizacion uniforme de 3 bits, asignando mas bits a las capas mas sensibles.

La licencia es "other", heredada del modelo base Qwen3.6-35B-A3B, por lo que las condiciones de uso comercial dependen de los terminos del modelo original, no especificados en la informacion proporcionada. El repositorio tiene 192 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion incipiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (qwen3_5_moe) segun tags; detalles de capas no disponibles |
| Parametros totales | 35.951.822.704 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | RCO mixed-precision, 3.0028 bpw, group size 64 affine, scale dtype bfloat16 |
| Idiomas soportados | no disponible |
| Licencia | other (heredada del modelo base) |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de mezcla de expertos (MoE) segun el tag `qwen3_5_moe` y el identificador del modelo. No se dispone de informacion sobre el numero de capas, dimensiones ocultas, numero de expertos, ni sobre la composicion del dataset de entrenamiento o el uso de RLHF/DPO en la informacion proporcionada. El tag `qwen3_5_moe` sugiere una generacion intermedia entre Qwen3 y Qwen3.5, pero no se confirma.

La innovacion tecnica de esta ficha es el pipeline de cuantizacion RCO (mixed-precision quantization) ejecutado sobre MLX. El autor asigna bits de forma no uniforme a los grupos de expertos: bits {2:19, 3:61, 4:1, 6:187, 8:381}, lo que significa que 19 grupos usan 2 bits, 61 usan 3 bits, 1 usa 4 bits, 187 usan 6 bits y 381 usan 8 bits. Esta distribucion concentra la precision en los grupos mas sensibles y reduce el coste en los menos criticos, logrando 3.0028 bpw de media. La calibracion se realizo con FineWeb-Edu (512 muestras de 2048 tokens) usando el tokenizador del propio checkpoint (roundtrip 1.000) y una imatrix propia (`hermitdave/Qwen3.6-35B-A3B-imatrix`). La cabeza MTP (multi-token prediction) se cuantizo a 4 bits. El flujo de trabajo conto con asistencia de Hermes Agent (Nous Research).

## Capacidades

- Generacion de texto: el modelo base es de tipo text-generation segun el pipeline declarado.
- Razonamiento y conocimiento general: las tareas de evaluacion (arc_challenge, arc_easy, hellaswag, winogrande, mmlu) indican capacidades de razonamiento de sentido comun y conocimiento academico.
- Capacidades de codigo y matematicas: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles (el campo de idiomas no esta relleno).
- Modo thinking, vision o audio: no disponible.
- La presencia de una cabeza MTP (multi-token prediction) sugiere soporte para decodificacion especulativa o prediccion multi-token, aunque no se detalla su uso en inferencia.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo cuantizado a 16 GB cabe en equipos con 24-32 GB de memoria unificada (MacBook Pro M2/M3 Pro/Max, Mac Studio), permitiendo ejecutar un MoE de 35B parametros sin GPU dedicada. Es el caso de uso principal de un artefacto MLX.
- Prototipado de aplicaciones de texto en local: desarrolladores que quieran probar un modelo de 35B en su portatil antes de desplegar en servidor, usando la libreria MLX y el formato safetensors nativo.
- Evaluacion de tecnicas de cuantizacion: investigadores que comparen la calidad de RCO 3 bpw frente a 4.4 bpw (el autor reporta una diferencia de +0.006 en precision media, con SE ~0.0055) para estudiar el compromiso tamano-calidad en MoE.
- Generacion de texto de proposito general en entornos con restricciones de memoria: dado que el modelo base es text-generation, puede usarse para redaccion, resumen y respuesta a preguntas, aunque sin datos de contexto ni idiomas no se puede garantizar calidad en castellano.
- Experimentacion con decodificacion multi-token: la cabeza MTP cuantizada a 4 bits permite probar tecnicas de prediccion especulativa en MLX, si el runtime lo soporta.
- Reproducibilidad de pipelines de cuantizacion: el autor publica la imatrix y los parametros de calibracion (FineWeb-Edu 512x2048), lo que permite a otros replicar el proceso RCO sobre el mismo modelo base.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (zero-shot, 5 tareas x 400 ejemplos, precision bruta):

| Tarea | Precision (n=400) |
|---|---|
| arc_challenge | 0.5400 |
| arc_easy | 0.8000 |
| hellaswag | 0.5300 |
| winogrande | 0.5425 |
| mmlu | 0.5200 |
| Media | 0.5865 |

El autor indica que la build de 4.4 bpw obtiene 0.5925 en los mismos prompts, con una diferencia pareada de +0.006 (SE ~0.0055) a favor de 4.4 bpw. No se proporcionan comparaciones con el modelo base sin cuantizar ni con otros modelos de la misma categoria.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: 16 GB de pesos segun el autor; con overhead de runtime MLX, se recomienda al menos 20-24 GB de memoria unificada.
- GPU recomendadas: no aplica GPU dedicada; el formato MLX esta disenado para Apple Silicon (series M1/M2/M3/M4, en variantes Pro, Max y Ultra).
- Cabe en consumer GPU: no en el sentido tradicional (CUDA); en Apple Silicon, si en equipos con 24 GB o mas de memoria unificada.
- Opciones de despliegue: MLX (libreria nativa del formato), `mlx-lm` para generacion; no se indica compatibilidad con vLLM, llama.cpp, Ollama o TGI, ya que el formato es safetensors MLX y no GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-RCO-3bpw (esta ficha) | 35.951.822.704 | no disponible | 3.0028 bpw RCO | other | safetensors MLX |
| Qwen3.6-35B-A3B (base) | 35.951.822.704 | no disponible | bfloat16 (presumible) | other | safetensors |
| Qwen3.6-35B-A3B RCO 4.4 bpw (referencia del autor) | 35.951.822.704 | no disponible | 4.4 bpw RCO | other | safetensors MLX |

No se dispone de informacion sobre otros modelos comparables de la misma categoria en la informacion proporcionada. La unica comparacion cuantitativa disponible es frente a la build de 4.4 bpw del mismo autor, con una diferencia de +0.006 en precision media a favor de 4.4 bpw y un mayor tamano (no especificado).

## Limitaciones y advertencias

- La cuantizacion a 3.0028 bpw introduce perdida de calidad: la media de 0.5865 frente a 0.5925 de la build de 4.4 bpw sugiere una degradacion pequena pero medible; en tareas fuera de las cinco evaluadas el impacto podria ser mayor.
- No hay informacion sobre sesgos del modelo base ni sobre su comportamiento en idiomas distintos del ingles; el campo de idiomas esta vacio.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; es un riesgo inherente a los modelos de lenguaje y no hay evaluaciones de fidelidad.
- Restricciones de licencia: la licencia es "other" y hereda los terminos del modelo base Qwen3.6-35B-A3B; no se detallan las condiciones de uso comercial, por lo que es imprescindible revisar la licencia del modelo original antes de un despliegue en produccion.
- El formato es exclusivamente MLX (safetensors), lo que limita el despliegue a hardware Apple Silicon; no es directamente usable en CUDA, vLLM o llama.cpp.
- El modelo tiene 192 descargas y 0 likes, y fue creado en noviembre de 2026; es un artefacto reciente y con poca validacion comunitaria independiente.
- No se dispone de informacion sobre la longitud de contexto real, los parametros activos del MoE ni el rendimiento en codigo o matematicas, lo que impide garantizar su idoneidad para esas tareas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hermitdave/Qwen3.6-35B-A3B-RCO-3bpw
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Imatrix de calibracion: https://huggingface.co/hermitdave/Qwen3.6-35B-A3B-imatrix
- Hermes Agent (asistencia en el flujo de cuantizacion): https://hermes-agent.nousresearch.com
