# gostar77/qwen3.8-flash-next-iq5r

## Resumen

Qwen3.8-Flash-Next IQ5R es una cuantizacion experimental del checkpoint BF16 Qwen3.8-Flash-Next, publicada por el usuario gostar77 bajo el formato propietario Radiance (artefacto RAD2). El modelo base es un Mixture-of-Experts (MoE) desarrollado por el equipo Qwen, y esta variante reduce el peso del checkpoint a unos 175 GiB mediante una mezcla de cuantizaciones GPTQ de 5 y 4 bits sobre los expertos enrutados, las lineas del trunk y el bloque borrador MTP (multi-token prediction) empleado para decodificacion especulativa.

La relevancia de esta publicacion es fundamentalmente tecnica: documenta un pipeline de cuantizacion mixta (U5 trellis, W5NL grupo 64, I8 en lineas no criticas, BF16 en diez expertos protegidos y en los pesos de vision y PLE) acompanado de un parche de runtime para el motor Radiance. El autor es explicito al senalar que el artefacto se ofrece para evaluacion y que la calidad amplia de inferencia, el comportamiento en contexto largo, el throughput y la paridad de la decodificacion especulativa no estan establecidos.

No se dispone de informacion sobre el numero total de parametros del modelo base, la longitud de contexto nativa ni los idiomas soportados. Las unicas metricas publicadas son distribucionales (KL y acuerdo top-1 frente a la referencia BF16), no de precision en tareas, por lo que no debe interpretarse como un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con bloque MTP para decodificacion especulativa; incluye componentes SSM (`ssm_inz`) y atencion (`attn_qg`) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GPTQ U5 trellis (gate/up de expertos enrutados), GPTQ W5NL grupo 64 (down de expertos), GPTQ U5 calibrado (attn_qg, ssm_inz), I8 en el resto de lineales del trunk, BF16 en diez expertos protegidos, PLE y vision; GPTQ U4/W4NL y RTN en el bloque MTP draft |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-license-1.0 (Qwen Community License) |
| Formato de pesos | artefacto Radiance RAD2 (51.489 tensores, ~175 GiB); no se distribuye en safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next es un transformer con mezcla de expertos que incorpora ademas componentes de espacio de estados (`ssm_inz`) y un bloque MTP (multi-token prediction) utilizado como cabecera borradora para decodificacion especulativa. Esta variante no reentrena el modelo: aplica cuantizacion post-entrenamiento con calibracion sobre un corpus propio. Los expertos enrutados del trunk usan GPTQ U5 trellis en las proyecciones gate/up y GPTQ W5NL con grupo de 64 en la proyeccion down; diez expertos quedan protegidos en BF16. Las lineas `attn_qg` y `ssm_inz` reciben GPTQ U5 calibrado y el resto de lineales del trunk usan la ruta I8 de la receta. Los pesos de PLE (probablemente embeddings posicionales o de capa) y de vision se mantienen en BF16.

La calibracion se realizo con 24.816 ficheros RADGRAM2 publicados en un dataset independiente, mas un subconjunto especifico para el bloque MTP draft (518 gramos validados y seis alias de entrada compartida, con manifiestos de validacion). El bloque MTP usa GPTQ U4/W4NL donde se capturo calibracion y codificaciones RTN en el resto. El paquete incluye la receta y un parche de runtime basado en el commit `2a2b756371c26f2768b8d129a098df275ace2c73` de Radiance, con implementacion en `e52f8a0b`; el autor advierte que el soporte de formatos mixtos no esta implicado en una release sin parchear del motor.

## Capacidades

- Generacion de texto condicionada al modelo base Qwen3.8-Flash-Next; no se documentan capacidades adicionales especificas de esta cuantizacion.
- Razonamiento, codigo, matematicas y uso de herramientas: el corpus de evaluacion incluye documentos de chat, codigo, tool-use y matematicas, pero no se publican metricas de precision en tareas.
- Capacidades de vision: los pesos de vision se conservan en BF16, lo que sugiere que el modelo base es multimodal, aunque el autor no lo confirma ni lo evalua.
- Decodificacion especulativa mediante el bloque MTP: presente pero no validada; una prueba corta con prompt de escritura acepto 43 de 102 tokens borrador y difirio de la respuesta sin especulacion.
- Capacidades multilingues: no disponibles.
- Modo thinking explicito, audio o agentes multi-paso: no disponibles.

## Casos de uso

- Evaluacion de tecnicas de cuantizacion mixta: investigadores que estudien el impacto de GPTQ U5 trellis, W5NL grupo 64 e I8 en modelos MoE pueden usar este artefacto como referencia reproducible con las metricas KL y acuerdo top-1 ya publicadas.
- Investigacion sobre decodificacion especulativa con MTP: el bloque borrador cuantizado a U4/W4NL permite medir la tasa de aceptacion y la divergencia respecto a la ruta sin especulacion, aunque el autor advierte que la paridad no esta demostrada.
- Desarrollo de soporte de formatos mixtos en Radiance: el parche de runtime incluido sirve como base para integrar artefactos RAD2 con capas heterogeneas (BF16, I8, GPTQ) en builds del motor.
- Pruebas de despliegue en hardware AMD: el launcher probado es TP=2 sobre dos GPU AMD, util para validar configuraciones multi-GPU en entornos ROCm antes de comprometer recursos.
- Comparacion de recetas de calibracion: los 24.816 gramos publicados y el manifiesto de evaluacion permiten reproducir la comparacion frente al candidato W4NL64 previo (KL 0.10565 frente a 0.12955).
- Docencia y divulgacion sobre cuantizacion post-entrenamiento: el desglose por componente (trunk, expertos, MTP, vision, PLE) es un ejemplo didactico de recetas de cuantizacion selectiva.

## Benchmarks y rendimiento

Unica medicion publicada: comparacion distribucional sin especulacion, vocabulario completo, sobre 106.851 posiciones de 64 documentos empaquetados (chat, codigo, tool-use y matematicas), frente a la referencia BF16.

| Modelo | KL media | Acuerdo top-1 con BF16 | PPL (referencia BF16: 5,1333) |
|---|---:|---:|---:|
| Este candidato IQ5R | 0,10565 | 92,50 % | 5,2482 (+2,24 %) |
| Candidato previo estilo IQ5R W4NL64 | 0,12955 | 91,46 % | 5,2727 (+2,72 %) |

El autor indica que el baseline W5 no pudo arrancar en la comparacion de tres modelos, por lo que no hay puntuacion W5 frente a IQ5R. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el artefacto ocupa unos 175 GiB en disco; en inferencia requiere al menos esa cantidad repartida entre GPUs, mas overhead de runtime y cache KV (no cuantificado en la informacion disponible).
- Configuracion probada: TP=2 sobre dos GPU AMD con el parche de runtime y el launcher `qwen3.8-flash-next-iq5r` de llama-swap.
- No cabe en GPU de consumo (RTX 4090, 24 GB) ni en configuraciones de una sola GPU de 80 GB; se necesita un pool multi-GPU de al menos 175 GiB agregados.
- Opciones de despliegue: exclusivamente el motor Radiance con el parche incluido; no hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI con este formato.
- Latencia y throughput: no disponibles; el autor no publica mediciones y advierte que las pruebas cortas de carga no demuestran rendimiento en produccion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next IQ5R (este) | no disponible | no disponible | RAD2, ~175 GiB | Qwen Community License 1.0 | Hugging Face, 0 descargas |
| Qwen3.8-Flash-Next BF16 (base) | no disponible | no disponible | BF16 | Qwen Community License 1.0 | Hugging Face (Qwen) |
| Candidato previo estilo IQ5R W4NL64 | no disponible | no disponible | RAD2 | no disponible | Referenciado en la model card |

No se dispone de datos de parametros, contexto ni rendimiento en tareas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita al formato, la licencia y las metricas distribucionales ya expuestas.

## Limitaciones y advertencias

- Artefacto experimental: el propio autor declara que la calidad amplia de inferencia, el contexto largo, el throughput y la paridad especulativa no estan establecidos.
- Decodificacion especulativa no validada: en una prueba corta el bloque MTP acepto 43 de 102 tokens y produjo una respuesta distinta a la ruta sin especulacion; no debe asumirse equivalencia.
- Metricas solo distribucionales: KL y acuerdo top-1 no miden precision en tareas; los prompts empaquetados incluyen ejemplos previos como contexto, lo que puede inflar la estabilidad medida.
- Dependencia de un parche de runtime no oficial: requiere el parche sobre el commit indicado o la implementacion `e52f8a0b`; una release sin parchear de Radiance no soporta el formato mixto.
- Sin datos de sesgos, alucinacion ni comportamiento multilingue especificos de esta cuantizacion.
- Licencia Qwen Community License 1.0: impone condiciones adicionales al uso comercial; debe revisarse el fichero LICENSE incluido antes de cualquier despliegue productivo.
- Datos de calibracion no redistribuidos: solo se publican los gramos y los manifiestos; la attribucion y terminos estan en `LICENSES-CALIBRATION-DATA.txt` del dataset enlazado.
- Cero descargas y cero likes en el momento de la consulta: no hay evidencia de uso independiente ni validacion por terceros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/gostar77/qwen3.8-flash-next-iq5r
- Dataset de calibracion: https://huggingface.co/datasets/gostar77/qwen3.8-flash-next-radiance-q5-w5dn64-grams
- Subconjunto de calibracion MTP: https://huggingface.co/datasets/gostar77/qwen3.8-flash-next-radiance-q5-w5dn64-grams/tree/main/mtp-draft-calibration
- Licencia del artefacto: https://huggingface.co/gostar77/qwen3.8-flash-next-iq5r/blob/main/LICENSE
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
