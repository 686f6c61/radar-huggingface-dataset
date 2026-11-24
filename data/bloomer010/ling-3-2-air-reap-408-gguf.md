# bloomer010/Ling-3.2-air-REAP-408-GGUF

## Resumen

Ling-3.2-air-REAP-408 es una variante podada del modelo multimodal Ling-3.2-air desarrollado por inclusionAI. Se trata de un transformer de tipo mixture-of-experts (MoE) con arquitectura BailingMoE3 que, tras aplicar la tecnica REAP (Router-weighted Expert Activation Pruning), conserva 408 de los 512 expertos enrutados por capa, lo que reduce el total de 124B a aproximadamente 99.900 millones de parametros manteniendo unos 5.500 millones de parametros activos por token. El modelo procesa texto, imagen y video, y esta publicado en formato GGUF para su uso con llama.cpp.

La relevancia de esta ficha radica en que combina dos tendencias actuales: por un lado, la poda de expertos en modelos MoE de gran tamano para reducir requisitos de memoria sin reentrenamiento; por otro, la distribucion en GGUF que permite ejecutar un modelo de ~100B parametros en hardware de consumo mediante offloading selectivo de expertos a CPU. El autor del quantizado es bloomer010 y el modelo se publica bajo licencia MIT.

El modelo esta pensado para desarrolladores que quieren experimentar con un MoE multimodal de gran escala en entornos locales o de un solo nodo, aceptando el compromiso de calidad que implica la poda one-shot sin recuperacion. La ventana de contexto nativa del modelo base es de 131.072 tokens segun los ejemplos de la model card, y se distribuye en cuantizaciones Q8_0, Q4_K_M y Q2_K.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (BailingMoE3) con torre de vision para imagen y video |
| Parametros totales | 99.866.879.392 (~99,9B) tras poda; modelo base 124B |
| Parametros activos | ~5,5B por token |
| Longitud de contexto | 131.072 tokens (segun ejemplos de la model card) |
| Tipos de cuantizacion | Q8_0, Q4_K_M, Q2_K (GGUF); FP8 safetensors en repo hermano |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp); safetensors FP8 en repo hermano |

## Arquitectura y entrenamiento

El modelo base Ling-3.2-air emplea una arquitectura MoE con enrutamiento agrupado (grouped top-k routing, `n_group=8`, 64 expertos por grupo, 512 expertos enrutados por capa en total). La variante REAP-408 aplica una poda one-shot de expertos: cada experto se puntua mediante el producto del valor de la puerta del router por la norma L2 de su salida sobre un conjunto de calibracion, y se eliminan los de menor puntuacion de forma uniforme por grupo de enrutamiento para preservar el top-k agrupado. Se elimina el 20% de los expertos (408 de 512 por capa) sin fine-tuning ni entrenamiento de recuperacion.

La calibracion utilizo 653.000 tokens (1.024 muestras) con una mezcla de 75% codigo, 15% matematicas y razonamiento, y 10% chat general. El bloque NextN/MTP (multi-token prediction) se omite en los quants. El modelo conserva la torre de vision del modelo base, que procesa tanto imagenes como fotogramas de video muestreados, y requiere el fichero `mmproj-model-f16.gguf` (875 MB) para entrada visual. No se dispone de informacion sobre el numero total de tokens de entrenamiento del modelo base ni sobre si se aplico RLHF o DPO en su pipeline original.

## Capacidades

- Generacion de texto conversacional multi-turno con modo de razonamiento (thinking mode) activado por defecto y desactivable por peticion.
- Razonamiento multi-paso y cadenas de pensamiento.
- Generacion de codigo y resolucion de problemas matematicos (la calibracion de la poda prioriza estos dominios).
- Comprension de imagenes: descripcion, respuesta a preguntas visuales y analisis de contenido grafico.
- Comprension de video: muestreo de fotogramas y codificacion por la misma torre de vision, con entrada via `video_url`.
- Soporte de tool calling y function calling a traves de plantillas Jinja (`--jinja` en llama.cpp).
- Capacidades de agente y razonamiento multi-paso mediante el modo thinking.
- Capacidades multilingues: no disponible (no se especifican idiomas en la informacion proporcionada).

## Casos de uso

- Asistente de codigo en local: el modelo puede generar y revisar codigo en un entorno llama.cpp con Q4_K_M, manteniendo los expertos en CPU y el resto en GPU; su calibracion orientada a codigo (75% del dataset) sugiere un rendimiento razonable en este dominio pese a la poda.
- Analisis de documentos con imagenes: procesar capturas, diagramas o graficos junto a texto de contexto largo (hasta 131.072 tokens) para extraer informacion estructurada en pipelines de back-office.
- Revision de video automatizada: muestrear fotogramas de grabaciones y generar descripciones o alertas mediante la API compatible con OpenAI de llama-server, util para moderacion o catalogacion de contenido.
- Agente de razonamiento con tool calling: integrar el modelo en un orquestador que llame a APIs externas, aprovechando el modo thinking para descomponer tareas complejas en pasos.
- Prototipado de asistentes conversacionales multimodales: desplegar un chatbot que acepte texto e imagen en una sola GPU consumer con Q4_K_M y offloading de expertos, sin depender de servicios en la nube.
- Experimentacion en investigacion sobre poda MoE: usar esta variante como referencia para estudiar el impacto de REAP en calidad frente al modelo base de 124B, comparando Q8_0, Q4_K_M y Q2_K.
- Inferencia en estaciones de trabajo con VRAM limitada: el flag `-ncmoe N` permite ajustar cuantos expertos residen en GPU, facilitando el despliegue en equipos con 24-48 GB de VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: depende de la cuantizacion y del contexto. El repo completo ocupa 107,1 GB; Q8_0 se aproxima al tamano de los pesos en BF16 podados, Q4_K_M reduce aproximadamente a la mitad y Q2_K a cerca de un cuarto. Los pesos y el contexto comparten memoria, por lo que hay que dejar margen.
- Estrategia de offloading: con menos VRAM que el tamano del fichero, mantener los expertos en CPU y el resto en GPU mediante `-ot "ffn_.*_exps\.weight=CPU"` o ajustar con `-ncmoe N`.
- GPU recomendadas: no disponible de forma explicita; por tamano, un modelo de ~100B en Q4_K_M requiere del orden de 50-60 GB, lo que encaja en A100 80 GB, H100 80 GB o configuraciones multi-GPU. En consumer, una RTX 4090 (24 GB) solo es viable con Q2_K y offloading parcial de expertos a CPU.
- Cabe en consumer GPU: parcialmente; con Q2_K y offloading de expertos es posible en GPUs de 24 GB, con latencia mayor.
- Opciones de despliegue: llama.cpp (build b11190 o superior) via `llama-server`, con soporte de `--jinja`, `--flash-attn auto` y `--mmproj` para vision. No se mencionan vLLM, TGI ni Ollama en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Ling-3.2-air-REAP-408 (este) | ~99,9B | ~5,5B | 131.072 | MIT | GGUF, FP8 |
| inclusionAI/Ling-3.2-air (base) | 124B | ~5,5B | no disponible | no disponible | safetensors |
| Alternativas de ~100B MoE | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada para establecer una comparativa de rendimiento.

## Limitaciones y advertencias

- La poda es one-shot y sin recuperacion: se elimina el 20% de los expertos por capa, lo que puede degradar la calidad en dominios poco representados en la calibracion (el 10% de chat general es la porcion mas pequena).
- El bloque NextN/MTP se omite en los quants, por lo que se pierde la decodificacion especulativa nativa del modelo base.
- Riesgo de alucinacion inherente a los modelos generativos, potencialmente amplificado por la compresion en Q2_K; el autor advierte que los ficheros mas pequenos implican "mas compresion, mas errores".
- La entrada de vision requiere obligatoriamente el fichero `mmproj-model-f16.gguf`; sin el, solo funciona el chat de texto.
- Idiomas soportados no especificados: no hay garantia documentada de calidad multilingue.
- Es un modelo experimental ("This is an experimental REAP"), no validado en produccion.
- Licencia MIT permite uso comercial, pero el modelo base y sus datos de entrenamiento pueden tener condiciones adicionales no reflejadas en esta ficha.
- El contexto de 131.072 tokens comparte memoria con los pesos; en configuraciones con offloading, contextos largos pueden provocar OOM.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bloomer010/Ling-3.2-air-REAP-408-GGUF
- Repo hermano FP8 safetensors: https://huggingface.co/bloomer010/Ling-3.2-air-REAP-408
- Modelo base: https://huggingface.co/inclusionAI/Ling-3.2-air
- Paper REAP: https://arxiv.org/abs/2510.13999
