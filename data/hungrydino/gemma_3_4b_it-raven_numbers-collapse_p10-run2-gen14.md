# HungryDino/gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen14

## Resumen

Este repositorio contiene un ajuste fino (fine-tune) del modelo `unsloth/gemma-3-4b-it`, publicado por el usuario HungryDino bajo licencia Apache 2.0 y con la etiqueta de idioma `en`. La model card es minima: se limita a indicar que el modelo deriva de Gemma 3 4B Instruct y que fue entrenado con Unsloth y la libreria TRL de HuggingFace. No se documentan datos de entrenamiento, hiperparametros, composicion del dataset ni resultados de evaluacion.

El nombre del repositorio (`raven_numbers-collapse_p10-run2-gen14`) sugiere que forma parte de una serie de experimentos iterativos sobre "colapso numerico" en bucles de autoentrenamiento, con variantes de control (`control_numbers-self_collapse`) y generaciones sucesivas (`gen0`, `gen2`, `gen3`, `gen14`) publicadas por el mismo autor. Se trata, por tanto, de un artefacto de investigacion y no de un modelo orientado a produccion.

Su relevancia es limitada y acotada: sirve como material de estudio para quienes investigan degradacion de capacidades en fine-tuning iterativo. El repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha, y su tamano (0,1 GB) es muy inferior al esperado para un checkpoint completo de 4B parametros en bf16 (aproximadamente 8 GB), lo que apunta a una subida parcial o a la presencia de adaptadores en lugar de pesos completos.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Heredada del modelo base Gemma 3 4B IT: transformer decoder-only, con capas de atencion de ventana deslizante; no se documentan modificaciones arquitectonicas en este fine-tune |
| Parametros totales | 4B (heredados del modelo base `unsloth/gemma-3-4b-it`); no se documenta el numero exacto en la model card |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128.000 tokens en el modelo base Gemma 3 4B IT; no confirmado para este fine-tune en la informacion disponible |
| Tipos de cuantizacion | No disponible (el repositorio solo declara safetensors; no se publican versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | `en` segun la model card del fine-tune; el modelo base Gemma 3 es multilingue (mas de 140 idiomas segun la documentacion de Google) |
| Licencia | apache-2.0 (declarada por el autor del fine-tune; el modelo base Gemma 3 se distribuye bajo los terminos de uso de Gemma) |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre el proceso de entrenamiento de este checkpoint: la model card no especifica numero de tokens, composicion del dataset, regimen de entrenamiento (SFT, DPO, RLHF) ni hiperparametros. Lo unico documentado es que se utilizaron Unsloth y la libreria TRL de HuggingFace, lo que apunta a un ajuste fino supervisado (SFT) o a un esquema de optimizacion eficiente en memoria (LoRA/QLoRA), si bien esto ultimo no se confirma de forma explicita.

La arquitectura es la del modelo base Gemma 3 4B Instruct, un transformer decoder-only con atencion de ventana deslizante (ventanas locales de 1024 tokens intercaladas con capas de atencion global en una proporcion 5:1), vocabulario de 262.000 tokens y capacidad multimodal de entrada mediante un codificador de vision SigLIP. No hay evidencia en la informacion proporcionada de que el fine-tune haya alterado estos componentes ni de que haya anadido tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de Gemma 3 4B Instruct.
- Razonamiento basico, matematicas elementales y generacion de codigo, en la medida en que lo permite un modelo de 4B parametros.
- Capacidad multimodal de vision (entrada de imagenes) si el fine-tune conserva el codificador de vision del modelo base; no confirmado en la informacion disponible.
- Soporte multilingue potencial (heredado del modelo base), aunque la model card del fine-tune declara unicamente ingles.
- Tool calling y function calling: el modelo base Gemma 3 IT los soporta, pero no se ha verificado que se mantengan tras este ajuste fino.
- Modo "thinking": no disponible en la informacion proporcionada.
- No hay evidencia de que el fine-tune preserve las capacidades del modelo base; el propio nombre del repositorio sugiere que el objetivo del experimento es precisamente estudiar su degradacion en tareas numericas.

## Casos de uso

Dado que se trata de un checkpoint experimental sin evaluacion publicada, los casos de uso realistas son de investigacion y validacion, no de produccion:

- Investigacion sobre colapso de capacidades en entrenamiento iterativo: usar el modelo como punto de comparacion frente a las variantes `control_numbers-self_collapse` y generaciones anteriores (`gen0`, `gen2`) del mismo autor para medir degradacion numerica.
- Reproducibilidad de experimentos de fine-tuning eficiente: sirve para verificar flujos de trabajo construidos con Unsloth y TRL sobre Gemma 3 4B en una unica GPU.
- Evaluacion comparativa de checkpoints intermedios: integrarlo en un banco de pruebas propio (por ejemplo, tareas aritmeticas y de sentido numerico) para cuantificar la perdida de rendimiento respecto a `unsloth/gemma-3-4b-it`.
- Analisis de calidad de datos sinteticos: si el experimento emplea datos generados por el propio modelo, este checkpoint permite auditar que tipo de errores introduce la autoformacion.
- Docencia y demostraciones sobre riesgos de sobreajuste: ilustrar en un aula o articulo como un fine-tune pequeno puede degradar un modelo base sin que la model card lo advierta.
- Pruebas de infraestructura de despliegue: validar pipelines con TGI, vLLM o Transformers sobre un modelo de 4B y contexto largo antes de pasar a checkpoints en produccion.

No se recomienda su uso en atencion al cliente, generacion de codigo en produccion ni cualquier escenario que requiera fiabilidad, dado que no existe ninguna evaluacion publicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye tabla de evaluacion, no referencia ningun leaderboard y no registra descargas ni validaciones de terceros. Cualquier cifra sobre MMLU, HumanEval, GSM8K o tareas numericas seria una invencion, por lo que se omite.

## Requisitos de hardware

Estimaciones basadas en un modelo denso de 4B parametros; no hay mediciones publicadas para este checkpoint concreto.

- VRAM en bf16/fp16: aproximadamente 8 GB solo para pesos, mas cache KV; en la practica, entre 10 y 14 GB segun longitud de contexto.
- VRAM en int8/fp8: aproximadamente 4-5 GB de pesos; viable en GPUs de 8-12 GB.
- VRAM en cuantizacion de 4 bits (si se generan pesos GGUF o AWQ, no publicados): alrededor de 2,5-3,5 GB, con margen para contexto moderado.
- GPUs profesionales recomendadas: A100 40/80 GB, H100, L40S, para servir contexto largo (128K) con lotes grandes.
- GPUs de consumo: cabe en RTX 3090/4090 (24 GB) sin problemas, en RTX 4080/4070 Ti (16 GB) con bf16 y contexto moderado, y en RTX 3060 12 GB, RTX 4060 Ti 16 GB o incluso GPUs de 8 GB si se cuantiza a 4 bits.
- Opciones de despliegue: `transformers` (soporte nativo, ya que el repo declara esa libreria), TGI (la etiqueta `text-generation-inference` esta presente), vLLM y SGLang para servicio de alto rendimiento; llama.cpp y Ollama solo si se convierten los pesos a GGUF, conversion no publicada.
- Nota sobre el repositorio: el tamano declarado de 0,1 GB es incompatible con un checkpoint completo de 4B en bf16, por lo que antes de desplegar hay que verificar que los ficheros de pesos esten completos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

Datos de la tabla referidos a la documentacion publica de cada modelo base; no hay mediciones del fine-tune de HungryDino.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HungryDino/gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen14 | 4B (heredados) | No confirmado (128K en el base) | apache-2.0 declarada | HuggingFace, 0 descargas |
| unsloth/gemma-3-4b-it (modelo base) | 4B | 128K | Terminos de uso de Gemma | HuggingFace, ampliamente utilizado |
| Qwen3-4B | 4B | 32K nativo, extensible a 128K con YaRN | Apache 2.0 | HuggingFace, muy extendido |
| Llama 3.2 3B Instruct | 3B | 128K | Licencia comunitaria de Llama 3.2 | HuggingFace, muy extendido |
| Phi-4-mini-instruct | 3,8B | 128K | MIT | HuggingFace, ampliamente utilizado |

En rendimiento no procede comparar: no existe ninguna evaluacion publicada de este checkpoint, mientras que los modelos de la tabla cuentan con resultados publicos en sus respectivas model cards.

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni validacion humana, ni comparacion con el modelo base, por lo que se desconoce el grado de degradacion respecto a `unsloth/gemma-3-4b-it`.
- Riesgo elevado de alucinacion y de errores numericos: el nombre del repositorio ("numbers-collapse") sugiere que el objeto de estudio es precisamente la perdida de competencia en tareas numericas.
- Sesgos: no documentados. Al heredar el preentrenamiento de Gemma 3, arrastra los sesgos del corpus original, agravados por un posible ajuste fino sobre datos sinteticos o autogenerados.
- Idioma: la model card declara unicamente ingles; el comportamiento en castellano u otros idiomas no esta verificado y podria estar degradado.
- Ambiguedad de licencia: el autor declara apache-2.0, pero los pesos derivan de Gemma 3, sujeto a los terminos de uso de Gemma de Google. Antes de un uso comercial conviene verificar que la relicencia sea valida.
- Integridad del repositorio: 0,1 GB de tamano frente a los ~8 GB esperables de un checkpoint de 4B en bf16. Hay que comprobar si faltan ficheros o si se trata de adaptadores.
- Metadatos poco fiables: la fecha de creacion registrada (2026-10-09) es posterior a la fecha actual, lo que resta credibilidad a los metadatos del repositorio.
- Uso en produccion desaconsejado: sin evaluacion, sin documentacion de entrenamiento y con 0 descargas, no cumple los minimos de trazabilidad exigibles en un sistema en produccion.
- Sin garantias de soporte: el autor no ofrece canal de incidencias, documentacion adicional ni versionado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HungryDino/gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen14
- Variante anterior de la misma serie (`gen0`): https://huggingface.co/HungryDino/gemma_3_4b_it-raven_numbers-collapse_p10-run2-gen0
- Variante de control (`control_numbers-self_collapse_p10-gen2`): https://huggingface.co/HungryDino/gemma_3_4b_it-control_numbers-self_collapse_p10-gen2
- Ficha de directorio de la variante de control: https://essamamdani.com/ai-models/hf-hungrydino-gemma-3-4b-it-control-numbers-self-collapse-p10-gen2
- Ficha de directorio de otra generacion (`gen3`): https://essamamdani.com/ai-models/hf-hungrydino-gemma-3-4b-it-control-numbers-self-collapse-p10-gen3
- Modelo base: https://huggingface.co/unsloth/gemma-3-4b-it
- Unsloth (libreria de entrenamiento citada): https://github.com/unslothai/unsloth
