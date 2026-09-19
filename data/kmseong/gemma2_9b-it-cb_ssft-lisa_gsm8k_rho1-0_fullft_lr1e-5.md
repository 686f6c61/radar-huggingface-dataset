# kmseong/gemma2_9b-it-CB_SSFT-lisa_gsm8k_rho1.0_fullft_lr1e-5

## Resumen

`kmseong/gemma2_9b-it-CB_SSFT-lisa_gsm8k_rho1.0_fullft_lr1e-5` es un ajuste fino completo (full fine-tuning) del modelo instructivo `google/gemma-2-9b-it`, publicado por el usuario kmseong. Se trata de un artefacto de investigacion: el identificador del repositorio codifica el dataset de entrenamiento o evaluacion (GSM8K), una variante de optimizacion (la etiqueta `lisa`, que apunta a variantes tipo Layerwise Importance Sampled AdamW), un hiperparametro (`rho1.0`), el regimen de entrenamiento (`fullft`) y la tasa de aprendizaje (`lr1e-5`). No hay model card, ni licencia declarada, ni resultados de evaluacion publicados en la informacion disponible.

El modelo conserva la arquitectura y el tamano del modelo base: 9.241.705.984 parametros en formato safetensors, lo que ocupa 18,5 GB en el repositorio (compatible con pesos en bfloat16). Gemma 2 9B es un transformer decoder con atencion local deslizante alternada con atencion global, atencion de consultas agrupadas (GQA), RMSNorm, activaciones GeGLU y acotado logitico (logit soft-capping), con una ventana de contexto de 8.192 tokens.

Su relevancia es acotada y de perfil academico: con 25 descargas y 0 likes, y sin licencia ni documentacion, no es un candidato para produccion sin una validacion previa. Su interes real esta en reproducir y auditar experimentos de ajuste fino eficiente en memoria sobre tareas de razonamiento matematico, y en comparar el efecto del optimizador empleado frente a alternativas como AdamW.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (arquitectura del modelo base gemma-2-9b-it: atencion local deslizante alternada con global, GQA, RMSNorm, GeGLU, logit soft-capping) |
| Parametros totales | 9.241.705.984 |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible en la ficha del repositorio; el modelo base gemma-2-9b-it soporta 8.192 tokens |
| Tipos de cuantizacion | no disponible (el repositorio solo publica safetensors; no se han publicado versiones GGUF, GPTQ, AWQ ni bitsandbytes) |
| Idiomas soportados | no disponible (el modelo base esta entrenado principalmente en ingles) |
| Licencia | no disponible (la ficha no declara licencia; el modelo base se distribuye bajo los terminos de uso de Gemma) |
| Formato de pesos | safetensors (18,5 GB, coherente con bfloat16) |
| Modelo base | google/gemma-2-9b-it |
| Autor | kmseong |
| Fecha de creacion | 2026-09-19 |
| Ultima actualizacion | 2026-09-19 |
| Descargas / likes | 25 / 0 |
| Pipeline declarado | no disponible |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Gemma 2 9B, un transformer decoder denso de 9.241.705.984 parametros. Sus rasgos distintivos son la intercalacion de capas con atencion local de ventana deslizante y capas con atencion global, el uso de atencion de consultas agrupadas para reducir el coste de la cache KV, RMSNorm en lugar de LayerNorm, activaciones GeGLU y el acotado logitico aplicado a las puntuaciones de atencion y a los logits finales. El modelo base fue entrenado por Google DeepMind con destilacion de conocimiento desde un modelo mayor y posteriormente alineado mediante ajuste supervisado y RLHF.

Sobre el proceso de ajuste fino de este repositorio solo puede inferirse lo que sugiere el identificador: ajuste fino completo de todos los parametros (`fullft`), tasa de aprendizaje 1e-5, un valor de `rho` de 1.0 y una variante de optimizacion etiquetada como `lisa`. El dataset implicado parece ser GSM8K, un corpus de problemas matematicos de nivel escolar. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, la mezcla de datos, la duracion del entrenamiento ni si hubo una fase posterior de DPO o RLHF. Tampoco se documentan innovaciones tecnicas propias de este ajuste. Cualquier afirmacion sobre el metodo de entrenamiento mas alla de lo que sugiere el nombre del repositorio seria especulativa.

## Capacidades

- Generacion de texto conversacional en el estilo del modelo instructivo base, adaptada mediante ajuste fino.
- Razonamiento matematico de tipo GSM8K: el identificador sugiere un entrenamiento orientado a problemas aritmeticos con solucion en varios pasos, aunque no se publican resultados que lo confirmen.
- Generacion de cadenas de razonamiento paso a paso (chain-of-thought) en ingles.
- Capacidades heredadas del modelo base gemma-2-9b-it: resumen, redaccion, clasificacion, extraccion de informacion basica y generacion de codigo de complejidad media; no hay validacion especifica para este ajuste.
- Soporte de tool calling: no confirmado en la informacion disponible. El modelo base gemma-2-9b-it no ofrece un formato de function calling nativo, por lo que se requeriria un enmarcado externo de prompts.
- Soporte de agentes y razonamiento multi-paso: no documentado ni validado.
- Capacidades multilingues: no disponibles. El modelo base esta optimizado para ingles y el ajuste fino con GSM8K, un dataset en ingles, probablemente refuerza ese sesgo.
- Capacidades especiales (modo thinking, vision, audio): no disponibles. Gemma 2 9B es un modelo exclusivamente de texto.

## Casos de uso

- Reproduccion de experimentos de ajuste fino: el repositorio sirve como punto de comparacion para medir el efecto de la variante de optimizacion etiquetada como `lisa` con `rho` 1.0 frente a AdamW en una tarea de razonamiento matematico.
- Estudio de olvido catastrofico: al ser un ajuste fino completo y no un adaptador, es un caso adecuado para medir cuanto se degradan las capacidades generales del modelo base tras entrenar sobre un unico dataset.
- Generacion de datos sinteticos de matematicas: se puede usar para producir soluciones paso a paso de problemas aritmeticos y emplearlas como corpus de destilacion hacia modelos mas pequenos, siempre con verificacion automatica de resultados.
- Evaluacion comparativa de checkpoints: util como linea base dentro de una bateria de pruebas junto a otros fine-tunes del mismo autor sobre el mismo modelo base.
- Prototipado de tutoria matematica en ingles: desplegado en local para experimentar con explicaciones paso a paso de problemas de nivel escolar, con validacion humana del resultado.
- Investigacion sobre tasas de aprendizaje en fine-tuning: el valor 1e-5 documentado en el nombre permite comparar con otras tasas sin tener que reentrenar.
- Analisis de robustez y sesgos tras fine-tuning: permite estudiar si un entrenamiento estrecho sobre GSM8K altera el comportamiento del modelo en prompts generales o de seguridad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del repositorio no incluye ninguna tabla de evaluacion, y la busqueda web realizada no aporto ningun resultado relevante sobre el modelo (unicamente paginas no relacionadas de un portal Moodle).

| Benchmark | Resultado |
|---|---|
| GSM8K (tarea sugerida por el nombre del repositorio) | no disponible |
| MMLU | no disponible |
| HumanEval | no disponible |
| MT-Bench | no disponible |
| Evaluacion de perdida o perplexity | no disponible |

## Requisitos de hardware

- Pesos en bfloat16 o float16: 18,5 GB solo para los pesos, mas la cache KV y las activaciones. Estimacion de VRAM en inferencia: 20-24 GB con contexto corto y lote pequeno.
- Cuantizacion a 8 bits: aproximadamente 9-10 GB de pesos; a 4 bits: aproximadamente 5-6 GB. Estas cuantizaciones no estan publicadas en el repositorio y habria que generarlas.
- GPUs de datacenter: A100 40 GB, A100 80 GB, H100 80 GB, L40S 48 GB. Son las opciones comodas para bfloat16 con contexto completo y lotes mayores.
- GPUs de consumo: cabe en RTX 3090 y RTX 4090 (24 GB) en bfloat16 solo con contexto reducido y lote 1; en RTX 4080, RTX 4070 Ti Super o RTX 4060 Ti de 16 GB es necesario cuantizar a 8 o 4 bits. En tarjetas de 8-12 GB solo es viable con cuantizacion agresiva y contexto muy corto.
- Opciones de despliegue: transformers (referencia), vLLM y TGI para servir en bfloat16, TensorRT-LLM para optimizacion en NVIDIA. llama.cpp y Ollama requieren convertir previamente los safetensors a GGUF, paso que no esta cubierto por el repositorio.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

Datos de parametros, contexto y licencia tomados de las fichas publicas de cada modelo base o alternativa. La columna de rendimiento se deja como no disponible cuando no hay mediciones publicadas para el modelo de esta ficha.

| Modelo | Parametros | Contexto | Licencia | Rendimiento |
|---|---|---|---|---|
| gemma2_9b-it-CB_SSFT-lisa_gsm8k (esta ficha) | 9.241.705.984 | no disponible (base: 8.192) | no disponible | no disponible |
| google/gemma-2-9b-it | 9.241.705.984 | 8.192 tokens | Terminos de uso de Gemma | no disponible en esta ficha |
| meta-llama/Llama-3.1-8B-Instruct | ~8.030 millones | 128.000 tokens | Licencia comunitaria de Llama 3.1 | no disponible en esta ficha |
| Qwen/Qwen2.5-7B-Instruct | ~7.620 millones | 128.000 tokens | Apache 2.0 | no disponible en esta ficha |
| mistralai/Mistral-7B-Instruct-v0.3 | ~7.250 millones | 32.000 tokens | Apache 2.0 | no disponible en esta ficha |

La ventaja diferencial de este repositorio no es el rendimiento, que no esta documentado, sino su caracter de artefacto reproducible de investigacion sobre optimizacion en ajuste fino. Frente a las alternativas de la tabla, parte en desventaja clara: licencia sin declarar, contexto mas corto que Llama 3.1 y Qwen2.5, y ausencia total de evaluaciones.

## Limitaciones y advertencias

- Ausencia de model card: no se documentan datos de entrenamiento, hiperparametros completos, composicion del dataset ni proceso de alineacion.
- Licencia no declarada: el repositorio no especifica licencia. Aunque el modelo base se rige por los terminos de uso de Gemma, la ausencia de declaracion explicita en el artefacto derivado es un riesgo legal para cualquier uso comercial. Antes de usarlo en produccion hay que aclarar este punto.
- Riesgo alto de olvido catastrofico: al tratarse de un ajuste fino completo sobre un unico dataset de matematicas, es probable que las capacidades generales del modelo base se hayan degradado. No hay evaluaciones que cuantifiquen esa perdida.
- Especializacion estrecha: el entrenamiento orientado a GSM8K puede provocar que el modelo fuerce formatos de respuesta aritmetica incluso ante preguntas que no lo requieren.
- Riesgo de alucinacion: como cualquier modelo de 9.000 millones de parametros, puede producir razonamientos plausibles pero incorrectos, especialmente en varias etapas. En matematicas esto es critico y exige verificacion externa del resultado.
- Sesgos: hereda los sesgos del corpus de preentrenamiento del modelo base, predominantemente web y en ingles. No se ha realizado ninguna evaluacion de sesgo sobre este ajuste.
- Limitacion idiomatica: el soporte de castellano no esta documentado y el ajuste sobre GSM8K, en ingles, probablemente lo reduce aun mas. No se recomienda su uso en castellano sin evaluacion previa.
- Limite de contexto: 8.192 tokens en el modelo base, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Validacion inexistente por la comunidad: 25 descargas y 0 likes. No hay issues, discusiones ni terceros que hayan verificado el comportamiento del modelo.
- Sin cuantizaciones publicadas: no hay GGUF ni formatos de 4 u 8 bits, por lo que desplegarlo en hardware de consumo exige trabajo adicional de conversion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/kmseong/gemma2_9b-it-CB_SSFT-lisa_gsm8k_rho1.0_fullft_lr1e-5
- Modelo base: https://huggingface.co/google/gemma-2-9b-it
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Nota sobre la busqueda web: las consultas realizadas no devolvieron ningun resultado relacionado con este modelo ni con su proceso de entrenamiento. Los unicos resultados obtenidos fueron paginas del portal Moodle de la Facultad de Filosofia de Osijek (moodle.ffos.hr), sin ninguna relacion con el modelo. No se han localizado papers, blogs, repositorios de codigo ni demos asociados.
