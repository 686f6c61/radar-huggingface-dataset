# open-athena/Snowball-67B-A2B-MixedRS-SFT-Step727

## Resumen

Snowball-67B-A2B-MixedRS-SFT-Step727 es un ajuste fino supervisado (SFT) por destilación, publicado por el colectivo open-athena dentro del ecosistema de experimentos Marin. El modelo parte del checkpoint Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 (denominado "estudiante B") y se ha entrenado sobre demostraciones seleccionadas por rejection sampling a partir de dos expertos: uno orientado a ejecución de código (CruxEval) y otro a razonamiento enciclopédico (MMLU-Pro). El resultado es un modelo de 67.078.882.816 parámetros (unos 67.000 millones) con licencia Apache 2.0.

La relevancia de esta ficha es doble. Por un lado, documenta una receta de destilación reproducible (k=8 muestras por prompt, selección de la primera correcta, 2.903 de 3.206 prompts cubiertos, 4 épocas y 728 actualizaciones con batch 16 sobre 32 H100). Por otro, publica resultados de evaluación con un evaluador congelado (Evalchemy, commit ae362881) en un conjunto amplio de tareas: CruxEval, MMLU-Pro, GSM8K, MATH500, GPQA-D e IFEval.

Se trata de un artefacto de investigación más que de un modelo listo para producto: no declara idiomas soportados, no incluye cuantizaciones publicadas, tiene cero descargas y cero valoraciones en el momento de redactar esta ficha, y su propia model card advierte de un desajuste de reglas entre el selector de respuestas y el evaluador en 14 de los 1.400 demos de MMLU-Pro.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (etiqueta `grug_moe` en el repositorio); no se detalla la configuracion interna de expertos en la model card |
| Parametros totales | 67.078.882.816 (dato real de safetensors) |
| Parametros activos | No confirmado en la model card; la nomenclatura "A2B" del nombre sugiere del orden de 2.000 millones de parametros activos |
| Longitud de contexto | 32.768 tokens en la evaluacion publicada; no se especifica el contexto nativo maximo del modelo base |
| Tipos de cuantizacion | No disponible (el repositorio solo contiene pesos en safetensors; no hay GGUF, AWQ ni GPTQ publicados) |
| Idiomas soportados | No disponibles (no declarados en la model card ni en los metadatos) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (shards), con `config.json`, `generation_config.json`, ficheros de tokenizer y `chat_template.jinja` |
| Tamano del repositorio | 134,2 GB |
| Modelo base | open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 (revision fdc3c3c5) |
| Tokenizer y plantilla de chat | Los del modelo base B, sin modificaciones |
| Fecha de publicacion | 13 de octubre de 2026 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del checkpoint base, etiquetado como `grug_moe` en HuggingFace, lo que apunta a una arquitectura de mezcla de expertos (MoE). El nombre "67B-A2B" sugiere 67.000 millones de parametros totales y aproximadamente 2.000 millones activos por token, aunque la model card no desglosa el numero de expertos, el enrutador ni la dimension oculta. El tokenizer y la plantilla de chat son los del estudiante B, sin cambios, lo que simplifica la sustitucion directa en pipelines ya construidos sobre el base.

El entrenamiento es un SFT por rejection sampling sobre datos generados por dos expertos: uno especializado en CruxEval y otro en MMLU-Pro. Para cada prompt se muestrearon k=8 candidatos por experto y se conservo la primera muestra que resulto ejecutivamente correcta (CruxEval) o aceptada por el selector de respuestas implementado (MMLU-Pro), cubriendo 2.903 de los 3.206 prompts. La receta usa AdamW con learning rate 1e-6, betas 0,9/0,999, weight decay 0, gradient clipping 1.0, sesgo del enrutador congelado, 4 epocas (728 actualizaciones de batch 16) y Levanter como framework, sobre 32 H100 (93,6 H100-hora). El checkpoint del paso 727 se eligio por delante del paso 546 mediante una regla congelada, al ser practicamente identico en todos los objetivos.

## Capacidades

- Generacion de texto y razonamiento general en registro instructivo, con plantilla de chat propia.
- Razonamiento matematico de varios pasos: 92,4 en MATH500 y 94,1 en GSM8K.
- Razonamiento a nivel de posgrado en ciencias: 57,6 en GPQA-D.
- Razonamiento enciclopedico y de opcion multiple: 68,2 en el subconjunto de MMLU-Pro y 64,8 en el conjunto held-out.
- Ejecucion y razonamiento sobre codigo: 77,25 en ambas metricas reportadas de CruxEval.
- Seguimiento de instrucciones estrictas: 78,3 en IFEval en la modalidad instruction-strict.
- Modo de razonamiento explicito ("thinking on"): la evaluacion publicada se ejecuto con el modo de pensamiento activado y un limite de generacion de 30.720 tokens.
- Soporte de tool calling / function calling: no disponible (no se menciona en la model card).
- Capacidades de agente y razonamiento multi-paso: no disponibles de forma explicita, aunque el objetivo de razonamiento matematico y de codigo es compatible con ese uso.
- Capacidades multimodales (vision, audio): no disponibles.
- Cobertura multilingue: no disponible (los idiomas no estan declarados).

## Casos de uso

- Tutorizacion de matematicas paso a paso: con 94,1 en GSM8K y 92,4 en MATH500, el modelo puede resolver problemas de nivel escolar y preuniversitario mostrando la cadena de razonamiento, util en plataformas de aprendizaje adaptativo que necesitan explicaciones detalladas y no solo la respuesta final.
- Asistente de resolucion de ejercicios de programacion: sus 77,25 en CruxEval lo hacen adecuado para generar y explicar fragmentos de codigo en entornos educativos o de documentacion tecnica, donde el objetivo es que el estudiante entienda la solucion.
- Evaluacion automatizada de respuestas de opcion multiple: con 68,2 en MMLU-Pro puede emplearse como anotador o segunda opinion en pipelines de evaluacion de bancos de preguntas academicas, siempre con revision humana por el ruido documentado en los demos de entrenamiento.
- Generacion de razonamiento sintetico para destilar modelos menores: dado que este checkpoint es en si mismo el resultado de una destilacion desde dos expertos, puede reutilizarse como generador de cadenas de razonamiento para entrenar modelos mas pequenos en dominios de matematicas y codigo.
- Filtrado y verificacion de soluciones en un pipeline de RLVR: el modelo produce razonamientos largos (hasta 30.720 tokens de generacion) que pueden someterse a un verificador externo para construir preferencias o recompensas, siguiendo la misma estrategia del proyecto Snowball.
- Investigacion sobre mezcla de expertos y enrutado: al conservar el enrutador del modelo base con el sesgo congelado durante el SFT, el checkpoint es un punto de partida controlado para estudiar como afecta el ajuste fino a la especializacion de expertos.
- Despliegue interno de un asistente tecnico en ingles: con licencia Apache 2.0 y pesos safetensors, puede servirse en infraestructura propia mediante vLLM para consultas de alto razonamiento, aceptando el coste de memoria de 67.000 millones de parametros.

## Benchmarks y rendimiento

Resultados publicados por el autor, obtenidos con el evaluador congelado Evalchemy (commit ae362881), sobre vLLM en 8x H100, contexto de 32.768 tokens, limite de generacion de 30.720 tokens, modo thinking activado y muestreo sin semilla a temperatura 1,0. Se trata de una unica pasada de evaluacion.

| Benchmark | Resultado |
|---|---|
| CruxEval | 77,25 / 77,25 (dos metricas reportadas) |
| MMLU-Pro (subconjunto) | 68,2 |
| MMLU-Pro (held-out) | 64,8 |
| GSM8K | 94,1 |
| MATH500 | 92,4 |
| GPQA-D | 57,6 |
| IFEval (instruction-strict) | 78,3 |

No se han publicado resultados comparativos frente a terceros modelos en la informacion disponible, ni puntuaciones del modelo base en los mismos benchmarks.

## Requisitos de hardware

- VRAM para inferencia en bf16/fp16: aproximadamente 134 GB solo para pesos (el repositorio ocupa 134,2 GB), mas la cache KV correspondiente al contexto configurado, que a 32.768 tokens es significativa.
- GPU recomendadas para bf16: un nodo con 2x H100 80 GB o 2x A100 80 GB como minimo; 4x A100 40 GB tambien es viable con tensor parallelism. El propio autor valido la evaluacion en 8x H100.
- GPU de consumo: no cabe en una unica GPU de consumo en bf16. Con una cuantizacion a 4 bits (aproximadamente 34-36 GB) podria encajar en una RTX 5090 de 32 GB de forma muy ajustada o en una RTX 6000 Ada / A6000 de 48 GB, pero no hay cuantizaciones publicadas por el autor, por lo que requeriria conversion propia.
- Opciones de despliegue: vLLM (utilizado en la evaluacion oficial), HF Transformers con safetensors y Levanter (framework de entrenamiento). No hay artefactos GGUF, por lo que llama.cpp u Ollama exigirian convertir manualmente los pesos y no estan verificados.
- Latencia y throughput: no disponibles. El unico dato de coste publicado es el de entrenamiento, 93,6 H100-hora sobre 32 H100.
- Almacenamiento: prevea al menos 135 GB de disco para el repositorio completo y espacio adicional para el cache de descarga y cualquier cuantizacion derivada.

## Comparativa con modelos similares

No se dispone de resultados de benchmarks de terceros modelos que permitan una comparacion directa en la informacion proporcionada. La unica referencia documentada es el propio modelo base, del que este checkpoint deriva por ajuste fino.

| Modelo | Parametros totales | Contexto | Licencia | Resultados publicados |
|---|---|---|---|---|
| Snowball-67B-A2B-MixedRS-SFT-Step727 | 67.078.882.816 | 32.768 tokens en evaluacion | Apache 2.0 | CruxEval 77,25; MMLU-Pro 68,2/64,8; GSM8K 94,1; MATH500 92,4; GPQA-D 57,6; IFEval 78,3 |
| Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92 (base) | No disponible en la informacion | No disponible | Apache 2.0 | No disponible |
| Alternativas de terceros de tamano similar | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Ruido conocido en los datos de entrenamiento: 14 de los 1.400 demos de MMLU-Pro son incorrectos segun la regla de respuesta final del evaluador, por un desajuste entre la regla del selector y la del evaluador. El autor lo documenta en su informe.
- Evaluacion de una sola pasada: los resultados se obtuvieron sin semilla fija y a temperatura 1,0, por lo que no hay intervalos de confianza ni estimacion de varianza. Las diferencias pequenas entre checkpoints (por ejemplo, frente al paso 546) no deben interpretarse como significativas.
- Cobertura parcial del conjunto de prompts: se cubrieron 2.903 de 3.206 prompts, lo que deja un 9,5 % sin demostracion asociada.
- Idiomas no declarados: no hay informacion sobre cobertura multilingue; asuma un comportamiento predominantemente en ingles dado el origen de los benchmarks empleados.
- Riesgo de alucinacion no medido: no se publican resultados en pruebas de veracidad ni de factualidad, a pesar de que el modelo se entrena parcialmente sobre datos enciclopedicos.
- Ausencia de cuantizaciones oficiales: no hay GGUF, AWQ ni GPTQ en el repositorio, lo que encarece el despliegue en hardware de gama media y anade riesgo de degradacion si se convierte por cuenta propia.
- Tool calling y uso como agente: no documentados, no validados y sin resultados de benchmarks especificos, por lo que no deben asumirse en produccion.
- Adopcion nula y sin senal de comunidad: cero descargas y cero valoraciones en el momento de la publicacion, sin pipeline declarado, lo que reduce la probabilidad de que los fallos esten ya identificados por terceros.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero no se ofrece ninguna garantia ni soporte por parte del autor; el checkpoint se subio sin modificaciones respecto a la exportacion del trabajo de entrenamiento.
- Procedencia experimental: los pesos provienen de un experimento interno (S3 `marin-us-east-02a`, trabajo `/karan/task166-mixed-rs-sft-20261010` en CoreWeave) y estan pensados para analisis comparativo, no como version estable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/open-athena/Snowball-67B-A2B-MixedRS-SFT-Step727
- Modelo base (estudiante B): https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92
- Revision concreta del modelo base: https://huggingface.co/open-athena/Snowball-67B-A2B-10T-Mixed-RLVR-Sync-Step92/tree/fdc3c3c5fff489d3fb04dcbc2387c179b1bf3fab
- Evaluador Evalchemy (commit usado): https://github.com/marin-community/evalchemy/commit/ae362881cf53f869a6ad52c8a59fa17343c0b5f8
- Informe del experimento en el repositorio Marin: https://github.com/marin-community/marin/issues/9984
- Comentario con el informe completo y el desglose de H100-hora: https://github.com/marin-community/marin/issues/9984#issuecomment-6144923850
- Ruta de origen de los pesos: `s3://marin-us-east-02a/marin/experiments/task166-mixed/checkpoints/karan/mixed-rs-e-from-b-lr1e-06/2026.10.10.1/hf/step-727`
