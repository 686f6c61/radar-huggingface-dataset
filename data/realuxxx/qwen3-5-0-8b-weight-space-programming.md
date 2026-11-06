# Realuxxx/Qwen3.5-0.8B-weight-space-programming

## Resumen

Qwen3.5-0.8B-weight-space-programming es una edicion del modelo base Qwen/Qwen3.5-0.8B realizada por el autor Realuxxx (reproducida por akhaliq) mediante una tecnica denominada "weight-space programming": un LLM frontera ("Astra") modifico directamente los pesos del modelo, sin descenso de gradiente ni entrenamiento convencional, con el objetivo de mejorar su rendimiento en matematicas. El modelo conserva la arquitectura y el tamano del original (873.438.784 parametros, aproximadamente 0,87B) y la licencia Apache 2.0.

La intervencion consistio en identificar una direccion en el espacio de activaciones responsable de los bucles de razonamiento del modelo base (escrita por los MLP de las capas 15 y 19) y restarla de 64 columnas de salida de `down_proj` en cada una de esas dos capas: 131.072 pesos, el 0,016% del total. Solo dos tensores difieren del modelo base, lo que hace la edicion verificable de forma bit-exacta mediante hashes sha256.

El resultado es notable: el modelo base entra en bucle hasta agotar el limite de tokens en casi todos los problemas matematicos, mientras que la version editada los resuelve en la mayoria de los casos. Es relevante como prueba de concepto de edicion de pesos guiada por LLM sin entrenamiento, y como ejemplo de que intervenciones quirurgicas minimas pueden alterar cualitativamente el comportamiento de razonamiento de un modelo pequeno.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; sin confirmar detalles internos |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 34.816 tokens (configurado como `max_model_len` en el ejemplo de uso); el modelo base usa hasta 32.768 tokens de generacion con thinking |
| Tipos de cuantizacion | no disponible (pesos en bfloat16; no se publican variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer multimodal de la familia Qwen3.5 con torre de vision y modelo de lenguaje integrados (pipeline image-text-to-text). No se ha realizado entrenamiento: la edicion se aplico directamente sobre los pesos del checkpoint base (commit `2fc06364715b967f1860aea9cf38778875588b17`), preservando intactos todos los tensores salvo dos.

La innovacion tecnica es el propio metodo de edicion. Un LLM frontera ("Astra") trabajo en una sesion de Python sobre los pesos con un presupuesto de 50 pasadas forward sobre problemas de practica de GSM8K y MATH. Localizo la direccion responsable de los bucles de razonamiento en las salidas de los MLP de las capas 15 y 19, y la sustrajo de 64 columnas de `down_proj` en ambas capas. La edicion se publica como diff bit-exacto y el checkpoint se reconstruyo verificando con sha256 cada tensor contra el evaluado en el articulo original; solo `model.language_model.layers.15.mlp.down_proj.weight` y `model.language_model.layers.19.mlp.down_proj.weight` difieren del base. No hubo RLHF, DPO ni fine-tuning supervisado.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada del modelo base Qwen3.5-0.8B.
- Razonamiento matematico con modo thinking: resuelve problemas de GSM8K y MATH-500 con razonamiento paso a paso y respuesta final en `\boxed{}`.
- Capacidad multimodal image-text-to-text: el checkpoint incluye la torre de vision del modelo base (aunque los prompts de texto no la utilizan).
- Reduccion drastica de bucles de razonamiento: pasa de agotar el limite de tokens en el 93% de los casos (base) al 33,1% (editado).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible de forma especifica; el modo thinking permite cadenas de razonamiento largas.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Investigacion sobre interpretabilidad y edicion de pesos: sirve como caso reproducible para estudiar como una direccion concreta en las activaciones de los MLP controla los bucles de generacion, con diff y codigo de reconstruccion publicados.
- Evaluacion de metodos de "weight-space programming": permite replicar el experimento 8 del articulo y comparar la edicion guiada por LLM con fine-tuning convencional en tareas de matematicas.
- Prototipado de tutoria matematica: el modelo resuelve problemas de nivel GSM8K/MATH con razonamiento paso a paso, adecuado para demos interactivas de resolucion guiada.
- Pruebas de robustez frente a bucles en produccion: util para medir el impacto de la presencia_penalty (1.5 en la configuracion recomendada) y del limite de tokens en la calidad de la respuesta.
- Docencia y divulgacion: la demo publica permite visualizar en vivo como el modelo base entra en bucle mientras el editado resuelve el problema, un recurso didactico sobre el comportamiento de los LLM.
- Experimentos de bajo coste en GPU consumer: con 0,87B parametros en bfloat16 (aproximadamente 1,8 GB de pesos) puede ejecutarse en GPUs de gama media para validar pipelines de evaluacion con vLLM.
- Base para ediciones adicionales: al ser un checkpoint verificable bit a bit, sirve como punto de partida controlado para aplicar nuevas intervenciones sobre pesos y medir su efecto aislado.

## Benchmarks y rendimiento

Resultados publicados en la model card (thinking activado, hasta 32.768 tokens, varias muestras por problema):

| Qwen3.5-0.8B | MATH-500 (%) | GSM8K (%) | IFEval (%) | Limite de tokens alcanzado (%) |
|---|---|---|---|---|
| Base | 7,9 | 13,8 | 21,0 | 93,0 |
| Editado (este modelo) | 48,1 | 67,1 | 62,3 | 33,1 |

Re-ejecucion independiente del checkpoint (MATH-500 completo, 500 problemas x 4 muestras = 2.000 generaciones, 43,4M tokens generados, 51 min en H200, vLLM, temperature 0,6, top_p 0,95, top_k 20, presence_penalty 1,5, max 32.768 tokens nuevos, seed 0, grading con math-verify 0.9.0):

| Modelo | MATH-500 (%) | Limite de tokens alcanzado (%) |
|---|---|---|
| Base (smoke test de 25 problemas) | 5,0 | 95,0 |
| Editado (re-ejecucion) | 51,0 | 31,6 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,8 GB solo para pesos en bfloat16; con cache KV para contexto largo (hasta 34.816 tokens) el consumo crece de forma significativa y conviene reservar 8-16 GB en funcion del batch y la longitud de contexto.
- GPU recomendadas: la evaluacion oficial se realizo en NVIDIA H200; para uso practico es suficiente cualquier GPU con 8-16 GB (RTX 3060 12 GB, RTX 4070, RTX 4090, A10, L4).
- Cabe en GPU consumer: si, en modelos con al menos 8 GB de VRAM para contextos moderados; para el contexto completo de 34.816 tokens se recomienda 16 GB o mas.
- Opciones de despliegue: vLLM (usado en la evaluacion oficial, con `max_model_len=34816` y `dtype="bfloat16"`), transformers; llama.cpp/Ollama no estan confirmados al no publicarse variantes GGUF.
- Latencia y throughput: la re-ejecucion genero 43,4M tokens en 51 minutos en una H200 (aproximadamente 14.200 tokens/s agregados con 4 muestras por problema); no hay datos de latencia por peticion en GPU consumer.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MATH-500 | GSM8K | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.5-0.8B-weight-space-programming (este) | 0,87B | 34.816 | 48,1-51,0% | 67,1% | Apache 2.0 | Hugging Face |
| Qwen/Qwen3.5-0.8B (base) | 0,87B | no disponible | 7,9% | 13,8% | Apache 2.0 | Hugging Face |
| Otros modelos de ~1B comparables | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La informacion proporcionada solo permite comparar con el modelo base; no se dispone de datos de benchmarks de alternativas de tamano similar.

## Limitaciones y advertencias

- La edicion es extremadamente pequena (0,016% de los pesos) y especifica para el comportamiento de bucles en matematicas; su efecto sobre otras tareas (codigo, vision, conversacion general) no se ha evaluado.
- El 33,1% de las respuestas del modelo editado siguen alcanzando el limite de tokens, por lo que persiste un riesgo relevante de generaciones truncadas o incompletas en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de factualidad ni de calibracion; el modelo hereda los sesgos del base y no se documentan mitigaciones.
- Idiomas soportados no documentados; no hay garantia de comportamiento multilingue mas alla del modelo base.
- La evaluacion se realizo con un protocolo muy especifico (temperature 0,6, top_p 0,95, top_k 20, presence_penalty 1,5, thinking activado); desviarse de estos parametros puede degradar el rendimiento observado.
- El checkpoint es multimodal completo, mientras que el articulo evaluo una exportacion solo de texto; los tensores del modelo de lenguaje son identicos (verificados por hash), pero no se han publicado metricas de vision.
- El modelo tiene 0 descargas y 0 likes en el momento de la consulta y procede de un experimento de investigacion, no de un ciclo de validacion de produccion; no debe tratarse como un modelo listo para produccion sin evaluacion propia.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Realuxxx/Qwen3.5-0.8B-weight-space-programming
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Articulo "Sparks of Weight-Space Programming": https://rikiyat.github.io/blog/weight-space-programming/
- Logs, diffs y codigo de reconstruccion: https://github.com/RikiyaT/lm_understand-logs
- Demo interactiva: https://huggingface.co/spaces/akhaliq/weight-space-programming-demo
- Resultados de evaluacion (carpeta `eval/`): https://huggingface.co/RikiyaT/Qwen3.5-0.8B-weight-space-programming/tree/main/eval
- ML Intern: https://hf.co/chat?mode=ml-intern
