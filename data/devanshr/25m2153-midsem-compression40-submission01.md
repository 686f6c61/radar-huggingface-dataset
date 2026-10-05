# DevanshR/25M2153-Midsem-Compression40-Submission01

## Resumen

Este repositorio, `DevanshR/25M2153-Midsem-Compression40-Submission01`, es una publicación derivada de Qwen/Qwen3.5-4B-Base, subida por el usuario DevanshR y etiquetada con el pipeline `image-text-to-text`. Por el nombre del repositorio y su tamano (3,4 GB frente a los aproximadamente 8 GB que ocuparian 4.000 millones de parametros en bf16), todo apunta a un ejercicio academico de compresion de modelos, aunque la model card no documenta el metodo aplicado ni los resultados de dicha compresion.

El modelo base pertenece a la familia Qwen3.5 de Alibaba, que combina una arquitectura hibrida con Gated Delta Networks (atencion lineal) y capas de atencion con puerta, ademas de una fundacion vision-lenguaje unificada entrenada con fusion temprana de tokens multimodales. Segun la model card heredada, el modelo declara 4.000 millones de parametros, 32 capas y una longitud de contexto nativa de 262.144 tokens, extensible hasta 1.010.000 tokens.

Es relevante ahora porque la familia Qwen3.5 situa modelos de 4B en cifras cercanas a modelos mucho mayores en conocimiento y STEM (79,1 en MMLU-Pro), y porque el interes creciente en tecnicas de compresion hace util disponer de referencias como esta para estudiar el impacto de reducir el peso de un modelo multimodal pequeno. No obstante, conviene tratar este repositorio como un artefacto experimental sin documentacion tecnica propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con Vision Encoder; hibrida de Gated DeltaNet (atencion lineal) y Gated Attention, con FFN. Layout: 8 x (3 x (Gated DeltaNet -> FFN) -> 1 x (Gated Attention -> FFN)) |
| Parametros totales | 4B (segun model card) |
| Parametros activos | No disponible. La literatura de la familia Qwen3.5 menciona MoE disperso, pero la configuracion del 4B no lo confirma ni cuantifica |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.010.000 tokens |
| Tipos de cuantizacion | No disponible. No se documentan GGUF, AWQ, GPTQ ni FP8 en el repositorio |
| Idiomas soportados | 201 idiomas y dialectos (segun model card); no se detalla la lista |
| Licencia | Apache 2.0 (con enlace a la licencia de Qwen/Qwen3.5-4B) |
| Formato de pesos | Formato Hugging Face Transformers (compatible con Transformers, vLLM, SGLang y KTransformers, segun model card). No se especifica safetensors explicitamente |
| Dimension oculta | 2560 |
| Capas | 32 |
| Tamano de embedding de tokens | 248.320 (padded), salida LM atada al embedding |
| Gated DeltaNet | 32 cabezas de atencion lineal para V y 16 para QK; dimension de cabeza 128 |
| Gated Attention | 16 cabezas para Q y 4 para KV; dimension de cabeza 256; dimension RoPE 64 |
| FFN | Dimension intermedia 9216 |
| MTP | Entrenado con multi-steps |
| Tamano del repositorio | 3,4 GB |

## Arquitectura y entrenamiento

La arquitectura del modelo base es un transformer causal con encoder de vision y una disposicion hibrida poco convencional: por cada 32 capas se intercalan bloques de Gated DeltaNet (una forma de atencion lineal recurrente con decaimiento controlado por puerta) y bloques de Gated Attention convencional con 16 cabezas de consulta y solo 4 de clave-valor, lo que reduce el coste del cache KV. El FFN tiene una dimension intermedia de 9216 y la salida del LM esta atada al embedding de tokens de 248.320 entradas. Se entreno con multi-step prediction (MTP) de varios pasos, un mecanismo habitual para acelerar la decodificacion especulativa.

Segun la model card, el entrenamiento incluye fases de preentrenamiento y postentrenamiento, con aprendizaje por refuerzo escalado sobre entornos multiagente de hasta un millon de agentes y distribuciones de tareas progresivamente mas complejas. La familia declara tambien una eficiencia de entrenamiento multimodal cercana al 100 % respecto al entrenamiento solo de texto, gracias a la fusion temprana de tokens multimodales. No se especifica el numero exacto de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas concretas de RLHF o DPO; esta informacion no esta disponible. Tampoco se documenta en este repositorio que metodo de compresion se aplico sobre el modelo base ni que degradacion introduce.

## Capacidades

- Generacion de texto conversacional en formato multi-turno, con la etiqueta `conversational` en el repositorio.
- Razonamiento sobre conocimiento general y disciplinas STEM, con resultados declarados en MMLU-Pro y MMLU-Redux.
- Comprension visual y tareas de imagen-a-texto, gracias al pipeline `image-text-to-text` y al encoder de vision.
- Capacidades de codigo y agentes, segun las comparativas de la familia Qwen3.5 frente a Qwen3-VL.
- Soporte declarado de 201 idiomas y dialectos, con enfasis en matices culturales y regionales.
- Razonamiento multi-paso y adaptabilidad en entornos de agentes, derivada del entrenamiento con RL a gran escala.
- Decodificacion especulativa habilitada por el entrenamiento con MTP de varios pasos.
- Soporte de tool calling / function calling: no se detalla explicitamente en la informacion disponible.
- Modo thinking explicito: no se menciona para esta variante concreta.

## Casos de uso

- Prototipado de asistentes multimodales en local: con 4B de parametros y encoder de vision, el modelo puede procesar imagenes y texto en una sola GPU consumer para demos de descripcion de imagenes, VQA o extraccion de informacion de capturas y documentos escaneados.
- Analisis de documentos largos: la ventana nativa de 262.144 tokens permite cargar informes, expedientes o libros completos y formular preguntas sobre ellos sin troceado agresivo, un escenario habitual en legaltech y auditoria documental.
- Investigacion sobre compresion de modelos: al ser una publicacion derivada de un ejercicio etiquetado como "Compression40", sirve como referencia practica para medir como se degradan las capacidades de un modelo multimodal pequeno tras reducir su peso.
- Atencion al cliente automatizada: la combinacion de conversacion multi-turno, contexto largo y cobertura de 201 idiomas permite gestionar hilos extensos de soporte y escalarlos a agentes humanos manteniendo el historial completo en contexto.
- Asistencia a desarrolladores en revision de codigo: el modelo base esta alineado con tareas de codigo y agentes, por lo que puede integrarse en flujos de revision de pull requests o generacion de pruebas, siempre validando los resultados antes de fusionar.
- Extraccion de datos de interfaces graficas: con capacidad imagen-a-texto, puede automatizar la lectura de paneles, formularios o capturas de aplicaciones para alimentar pipelines de datos estructurados.
- Evaluacion comparativa en investigacion academica: util como linea base ligera para comparar contra Qwen3-30B-A3B o GPT-OSS-20B en experimentos de destilacion o pruning.

## Benchmarks y rendimiento

La model card incluye una tabla comparativa, pero la informacion proporcionada esta truncada: solo se conservan completas las filas de MMLU-Pro y MMLU-Redux, y la segunda aparece incompleta en las dos ultimas columnas. Los valores disponibles son los siguientes.

| Benchmark | GPT-OSS-120B | GPT-OSS-20B | Qwen3-Next-80B-A3B-Thinking | Qwen3-30B-A3B-Thinking-2507 | Qwen3.5-9B | Qwen3.5-4B |
|---|---|---|---|---|---|---|
| MMLU-Pro | 80,8 | 74,8 | 82,7 | 80,9 | 82,5 | 79,1 |
| MMLU-Redux | 91,0 | 87,8 | 92,5 | 91,4 | no disponible (truncado) | no disponible (truncado) |

No se han publicado en la informacion disponible resultados de otros benchmarks habituales como HumanEval, GSM8K o MMMU, ni ninguna evaluacion especifica del artefacto comprimido de este repositorio. No se dispone de datos propios de rendimiento para `DevanshR/25M2153-Midsem-Compression40-Submission01`.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8-10 GB solo para pesos de 4B parametros, mas el cache KV. Los requisitos exactos no estan documentados.
- VRAM en cuantizaciones de 8 bits: del orden de 4-5 GB; en 4 bits, del orden de 2,5-3 GB. Son estimaciones derivadas del numero de parametros, no cifras confirmadas por el autor.
- Cache KV con contexto largo: la atencion con solo 4 cabezas KV y 8 capas de atencion completa reduce el coste frente a un transformer denso equivalente, pero 262.144 tokens siguen exigiendo planificacion cuidadosa de memoria.
- GPU recomendadas: para bf16, una RTX 4090 (24 GB) o A100 40 GB son suficientes. Para despliegues con contexto muy largo o lotes grandes, se recomienda A100 80 GB o H100.
- Cabe en GPU consumer: si. Con cuantizacion de 4 u 8 bits es viable en GPUs de 8-12 GB, como RTX 3060, RTX 4060 o similares.
- Opciones de despliegue: Hugging Face Transformers, vLLM, SGLang y KTransformers, segun la model card del modelo base. No se confirma compatibilidad con llama.cpp, Ollama o TGI para este artefacto concreto.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo ni de latencia para este repositorio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MMLU-Pro | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-4B (base de este repo) | 4B | 262.144 nativos, hasta 1.010.000 | 79,1 | Apache 2.0 | Pesos abiertos en Hugging Face |
| Qwen3.5-9B | 9B | No disponible en la informacion | 82,5 | No disponible en la informacion | Pesos abiertos |
| GPT-OSS-20B | 20B | No disponible en la informacion | 74,8 | No disponible en la informacion | Pesos abiertos |
| Qwen3-30B-A3B-Thinking-2507 | 30B totales, 3B activos | No disponible en la informacion | 80,9 | No disponible en la informacion | Pesos abiertos |

Lectura de la tabla: el 4B de Qwen3.5 queda 1,7 puntos por debajo del GPT-OSS-20B en MMLU-Pro pese a ser cinco veces mas pequeno, y a 3,4 puntos del Qwen3.5-9B. En MMLU-Redux, el 4B no aparece por truncamiento de los datos. Para el artefacto comprimido de este repositorio no existe ninguna cifra comparable publicada.

## Limitaciones y advertencias

- El repositorio no documenta el metodo de compresion aplicado ni la perdida de calidad asociada, pese a que el nombre sugiere un ejercicio de compresion al 40 %. Cualquier uso en produccion deberia ir precedido de una evaluacion propia.
- El tamano del repositorio (3,4 GB) es muy inferior a los aproximadamente 8 GB esperables para 4B parametros en bf16, lo que indica pesos reducidos o cuantizados sin especificar. No se puede asumir que el comportamiento reproduzca fielmente al modelo base.
- La model card del repositorio es, aparentemente, una copia de la de Qwen3.5-4B: no describe el artefacto concreto, sus cambios ni sus resultados. No debe tomarse como documentacion fiable de esta publicacion.
- Riesgo de alucinacion: inherente a los modelos de lenguaje de esta escala, especialmente en dominios especializados y con contexto muy largo, donde la atencion puede diluirse.
- Sesgos conocidos: no se documentan auditorias de sesgo en la informacion disponible. Los modelos entrenados con datos web multilingues suelen heredar sesgos culturales y de representacion.
- Cobertura idiomatica: se declaran 201 idiomas, pero no se especifica el nivel de competencia por idioma; es previsible un rendimiento muy desigual fuera de ingles y chino.
- Contradiccion sin resolver: la documentacion de la familia menciona Mixture-of-Experts disperso, pero la configuracion publicada del 4B y su tabla de capas no permiten confirmarlo. Conviene verificar antes de planificar infraestructura.
- Licencia Apache 2.0: permite uso comercial, pero al tratarse de una publicacion derivada conviene conservar los avisos de licencia y verificar la licencia del modelo base enlazada.
- Estado del repositorio: cero descargas y cero likes, creado y actualizado el mismo dia (4 de octubre de 2026). No hay evidencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/DevanshR/25M2153-Midsem-Compression40-Submission01
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B-Base
- Modelo postentrenado de referencia: https://huggingface.co/Qwen/Qwen3.5-4B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-4B/blob/main/LICENSE
- Blog oficial de Qwen3.5: https://qwen.ai/blog?id=qwen3.5
- Qwen Chat: https://chat.qwen.ai

Nota: las busquedas web realizadas no devolvieron ningun resultado relevante sobre este modelo ni sobre el autor; los enlaces obtenidos eran contenido no relacionado y se han descartado.
