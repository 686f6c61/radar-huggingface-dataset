# ovexhugi/Qwen3.5-0.8B-weight-space-programming

## Resumen

Qwen3.5-0.8B-weight-space-programming es un checkpoint derivado de Qwen/Qwen3.5-0.8B (873.438.784 parametros) en el que un LLM frontera denominado "Astra" modifico directamente los pesos del modelo base sin entrenamiento ni descenso de gradiente. La intervencion se enmarca en el experimento 8 del trabajo "Sparks of Weight-Space Programming" y consistio en localizar una direccion responsable de los bucles de razonamiento en las MLPs de las capas 15 y 19, y restarla de 64 columnas de salida de `down_proj` en cada una de esas capas, afectando a 131.072 pesos (0,016% del total del modelo).

El problema que aborda es concreto: el modelo base entra en bucles de pensamiento y agota el limite de tokens en la practica totalidad de los problemas matematicos (93% de los casos). El checkpoint editado reduce ese comportamiento y eleva el rendimiento en MATH-500 del 7,9% al 48,1% y en GSM8K del 13,8% al 67,1%, segun los datos publicados por el autor. Una re-ejecucion independiente sobre MATH-500 completa (500 problemas x 4 muestras) obtuvo un 51,0%.

Es relevante ahora porque demuestra que una edicion quirurgica de pesos, verificable mediante hashes sha256 y reproducible con codigo publicado, puede producir mejoras sustanciales en un modelo pequeno sin coste de entrenamiento. El checkpoint es multimodal (image-text-to-text) y conserva la licencia Apache 2.0 del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) de la familia Qwen3.5; edicion aplicada sobre las MLPs de las capas 15 y 19 |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 34.816 tokens en la configuracion de referencia (`max_model_len=34816`) |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye y evalua en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers; compatible con vLLM) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-0.8B, un transformer multimodal con torre de vision y modelo de lenguaje integrado. No hay entrenamiento involucrado en este checkpoint: los pesos del modelo base se modifican directamente mediante una sesion de Python sobre los tensores, con un presupuesto de 50 forward passes sobre problemas de practica de los conjuntos de entrenamiento de GSM8K y MATH. El LLM editor ("Astra") identifico una direccion asociada a los bucles de razonamiento generada por las MLPs de las capas 15 y 19 y la sustrajo de 64 columnas de salida de `down_proj` en ambas capas.

La innovacion tecnica es el propio metodo de "weight-space programming": edicion de pesos sin gradiente, con un diff bit-exacto publicado y verificacion sha256 de cada tensor reconstruido. Solo dos tensores difieren del modelo base (`model.language_model.layers.15.mlp.down_proj.weight` y `model.language_model.layers.19.mlp.down_proj.weight`). El checkpoint se reconstruyo con `exp8_math/code/apply_edit.py` y se valido contra el checkpoint evaluado en el post original. La evaluacion se realizo con vLLM 0.33.0, transformers 5.20.2 y math-verify 0.9.0, con modo thinking activado y muestreo `think35` (temperature 0.6, top_p 0.95, top_k 20, presence_penalty 1.5, max 32.768 tokens nuevos).

## Capacidades

- Generacion de texto conversacional con plantilla de chat y modo thinking activable (`enable_thinking=True`).
- Razonamiento matematico paso a paso con formato de respuesta final en `\boxed{}`.
- Entrada multimodal image-text-to-text (torre de vision incluida en el checkpoint completo).
- Reduccion de bucles de razonamiento respecto al modelo base, lo que mejora la tasa de finalizacion dentro del limite de tokens.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita; el modo thinking permite cadenas de razonamiento largas.
- Capacidades multilingues: no disponible.
- Compatibilidad con endpoints (`endpoints_compatible` en los tags del repo).

## Casos de uso

- Evaluacion de investigacion sobre edicion de pesos: sirve como caso de referencia reproducible para estudiar como una intervencion de 0,016% de los pesos altera el comportamiento de razonamiento de un modelo pequeno, con diff y hashes publicados.
- Razonamiento matematico en entornos con recursos limitados: un modelo de menos de 900 millones de parametros que resuelve problemas de GSM8K y MATH con modo thinking resulta adecuado para prototipos y validacion de pipelines de evaluacion en una sola GPU.
- Generacion de cadenas de razonamiento para destilacion: las trazas de pensamiento del modelo editado, que ahora terminan dentro del limite de tokens en la mayoria de los casos, pueden emplearse como datos de entrenamiento para modelos mayores o para tecnicas de distillation.
- Demo interactiva y docencia: el Space asociado permite comparar en vivo el bucle del modelo base frente a la resolucion del editado, util para explicar el fenomeno de los bucles de razonamiento.
- Pruebas de regresion de infraestructura de inferencia: al ser un checkpoint pequeno con protocolo de evaluacion documentado (vLLM, sampling fijo, grading con math-verify), sirve para validar versiones de vLLM y transformers en tareas de matematicas.
- Experimentos de alineacion sin RLHF: permite estudiar si tecnicas de edicion directa de pesos pueden sustituir parcialmente a metodos de ajuste supervisado o preferencias en tareas acotadas.

## Benchmarks y rendimiento

Datos publicados por el autor (thinking activado, hasta 32.768 tokens, varias muestras por problema):

| Modelo | MATH-500 (%) | GSM8K (%) | IFEval (%) | Limite de tokens alcanzado (%) |
|---|---|---|---|---|
| Qwen3.5-0.8B base | 7,9 | 13,8 | 21,0 | 93,0 |
| Editado (este modelo) | 48,1 | 67,1 | 62,3 | 33,1 |

Re-ejecucion independiente de este checkpoint: MATH-500 completo, 500 problemas x 4 muestras = 2.000 generaciones (43,4M tokens generados, 51 minutos en una H200), vLLM, thinking on, temperature 0,6, top_p 0,95, top_k 20, presence_penalty 1,5, max 32.768 tokens nuevos, seed 0, grading del ultimo `\boxed{}` con math-verify 0.9.0.

| Modelo | MATH-500 (%) | Limite de tokens alcanzado (%) |
|---|---|---|
| Editado (re-ejecucion independiente) | 51,0 | 31,6 |
| Base (smoke test de 25 problemas) | 5,0 | 95,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: en bfloat16, aproximadamente 1,75 GB solo para pesos (873M parametros); con cache KV para 34.816 tokens de contexto, el consumo total depende del batch y de la configuracion de vLLM.
- GPU recomendadas: la evaluacion de referencia se ejecuto en una NVIDIA H200; el modelo cabe holgadamente en GPUs de gama alta como A100 o H100 para batches grandes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM en bfloat16 (por ejemplo RTX 3060 Ti, RTX 4060, RTX 4070, RTX 4090) para inferencia individual con contexto moderado.
- Opciones de despliegue: vLLM (usado en la evaluacion, version 0.33.0), transformers 5.20.2; llama.cpp, Ollama o TGI no se mencionan en la informacion disponible.
- Latencia y throughput: la re-ejecucion genero 43,4M tokens en 51 minutos en una H200, lo que equivale a aproximadamente 14.200 tokens por segundo agregados en ese entorno.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 (%) | GSM8K (%) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este modelo (editado) | 873M | 34.816 | 48,1 (51,0 en re-ejecucion) | 67,1 | Apache 2.0 | HuggingFace |
| Qwen3.5-0.8B base | 873M | 34.816 | 7,9 | 13,8 | Apache 2.0 | HuggingFace |
| Alternativas de ~1B con razonamiento | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La edicion se diseno con 50 forward passes sobre problemas de GSM8K y MATH; el comportamiento fuera de matematicas no se ha evaluado de forma independiente.
- Un 31,6% de las respuestas del modelo editado siguen alcanzando el limite de tokens en MATH-500, por lo que los bucles no se eliminan por completo.
- Riesgo de alucinacion: no se han publicado evaluaciones de veracidad ni de calibracion; las mejoras medidas se limitan a MATH-500, GSM8K e IFEval.
- Sesgos conocidos: no disponible; no se documenta ninguna evaluacion de sesgo.
- Idiomas soportados: no disponible; no hay evaluacion multilingue publicada.
- La re-ejecucion independiente sustituyo el export de solo texto del post original por el checkpoint multimodal completo; los tensores del modelo de lenguaje son identicos (verificados por hash) y los prompts de texto no usan la torre de vision, pero conviene tenerlo en cuenta al comparar resultados.
- Licencia Apache 2.0, permisiva para uso comercial; el diff y el codigo de reconstruccion se publican bajo CC BY 4.0 / MIT.
- El checkpoint tiene 0 descargas y 0 likes en el momento de la consulta, y procede de un unico experimento de investigacion sin validacion externa mas alla de la re-ejecucion citada.

## Enlaces

- HuggingFace: https://huggingface.co/ovexhugi/Qwen3.5-0.8B-weight-space-programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Blog post: https://rikiyat.github.io/blog/weight-space-programming/
- Logs, diffs y codigo de reconstruccion: https://github.com/RikiyaT/lm_understand-logs
- Demo: https://huggingface.co/spaces/akhaliq/weight-space-programming-demo
- Resultados de evaluacion (repo del autor del experimento): https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming/tree/main/eval
- ML Intern: https://hf.co/chat?mode=ml-intern
