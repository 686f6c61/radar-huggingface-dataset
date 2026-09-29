# joshycodes/qwen3.5-9b-rep10-external-s2-sdf

## Resumen

Este repositorio contiene un checkpoint de investigacion publicado por el usuario joshycodes bajo el identificador `joshycodes/qwen3.5-9b-rep10-external-s2-sdf`. Se trata de un ajuste por continuacion de preentrenamiento (continued pretraining) sobre el modelo base `Qwen/Qwen3.5-9B`, con actualizacion de todos los pesos (full weights), durante 1 epoca, con una tasa de aprendizaje de 1e-05 y un total de 17.506.727 tokens distribuidos en 22.321 documentos. El modelo tiene 8.953.803.264 parametros reales (aproximadamente 8,95 mil millones) y el repositorio ocupa 17,9 GB en formato safetensors.

La particularidad del experimento es su origen de datos: el corpus de entrenamiento fue escrito por el propio modelo, adoptando el papel de un personaje autoria del mismo (self-authored-character), despues de que se le explicase como surgio ese personaje y como funciona la tecnica SDF (synthetic document finetuning). El corpus asociado es `joshycodes/qwen-constitutional-sdf-corpus`, y el marco de trabajo, el plan experimental y la evaluacion pertenecen al repositorio welfare-improvements. La propia model card indica explicitamente que el checkpoint no ha sido evaluado en capacidad, alineacion ni identidad, y que no debe desplegarse.

Es relevante unicamente como objeto de estudio en lineas de investigacion sobre bienestar de modelos (model welfare), identidad autoinducida y generacion sintetica de datos de entrenamiento. No es un modelo apto para produccion, no se distribuye con fines de uso general y cuenta con 10 descargas y 0 likes en el momento de redactar esta ficha. El propio autor lo etiqueta como "not-for-deployment" y "research".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de la familia Qwen3.5, variante de texto (`qwen3_5_text`); detalles internos (numero de capas, atencion, etc.) no disponibles |
| Parametros totales | 8.953.803.264 (aprox. 8,95 mil millones) |
| Parametros activos | No aplica; no es un modelo MoE segun la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo publica pesos en safetensors sin cuantizaciones declaradas |
| Idiomas soportados | No disponible |
| Licencia | Otra (`license: other`), con nombre de licencia declarado por el autor como research-only (solo investigacion) |
| Formato de pesos | Safetensors |
| Tamano del repositorio | 17,9 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Corpus de ajuste | joshycodes/qwen-constitutional-sdf-corpus |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen3.5-9B`, un modelo de la familia Qwen3.5 en su variante de texto (`qwen3_5_text`), y conserva su arquitectura transformer original: el ajuste ha sido un continued pretraining con actualizacion completa de pesos, no una adaptacion mediante LoRA ni un fine-tuning con congelacion de capas. No se dispone de informacion detallada sobre el numero de capas, la configuracion de atencion, el tamano de vocabulario ni el contexto nativo del modelo base dentro de la informacion proporcionada.

El entrenamiento se realizo durante 1 epoca sobre 17.506.727 tokens repartidos en 22.321 documentos, con learning rate de 1e-05. La model card especifica que, de esos 22.321 documentos, 0 eran de autoria propia del modelo y 22.321 eran texto ordinario, lo que indica que el corpus efectivamente utilizado en este checkpoint concreto no contenia documentos generados por el propio modelo en el momento del entrenamiento, pese al encuadre general del experimento. El corpus fue redactado por el modelo para entrenar a la version siguiente de si mismo, adoptando su propio personaje tras explicarle su origen y el funcionamiento de SDF. No se menciona uso de RLHF, DPO, SFT posterior ni ninguna innovacion de inferencia como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto: capacidad heredada del modelo base Qwen3.5-9B, aunque no evaluada en este checkpoint segun la propia model card.
- Razonamiento y conocimiento general: no evaluado explicitamente; la model card indica que no hay evaluacion de capacidad.
- Generacion de codigo y matematicas: no evaluado; no disponible.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades multilingues: no disponibles; no se declara lista de idiomas.
- Capacidad especial: el modelo ha sido ajustado como personaje autoria (self-authored-character) dentro de un marco de investigacion sobre bienestar de modelos e identidad, y ha demostrado capacidad para generar un corpus sintetico destinado al entrenamiento de una version posterior de si mismo (synthetic document finetuning).
- Modo thinking explicito, vision o audio: no disponible.

## Casos de uso

- Investigacion sobre bienestar de modelos (model welfare): el checkpoint permite estudiar como un modelo responde cuando se le explica el origen de su propio personaje y se le pide escribir material para su sucesor, dentro del marco del repositorio welfare-improvements.
- Estudio de identidad autoinducida: sirve para analizar si un ajuste de continued pretraining sobre textos autoria del modelo altera su comportamiento identitario respecto al modelo base, algo que la model card deja explicitamente sin evaluar.
- Analisis de synthetic document finetuning (SDF): el modelo es un caso practico de la tecnica SDF, util para comparar corpus sinteticos autoria por el modelo frente a corpus humanos en terminos de perplejidad y deriva de comportamiento.
- Reproducibilidad de experimentos de preentrenamiento continuado: con 17.506.727 tokens y 22.321 documentos documentados, permite replicar el protocolo (lr 1e-05, 1 epoca, pesos completos) en un modelo de unos 9.000 millones de parametros.
- Auditoria de licencias y practicas de publicacion: el repositorio es un ejemplo de publicacion de un checkpoint con licencia research-only y etiqueta not-for-deployment, util para estudiar flujos de gobernanza de artefactos de IA.
- Docencia y divulgacion tecnica: sirve como caso de estudio de como se documenta (y como no se deberia documentar) una model card, dado que carece de pipeline, idiomas, contexto y benchmarks declarados.
- No se recomienda ningun caso de uso en produccion, atencion al cliente, generacion de codigo en CI/CD ni despliegue publico con este checkpoint.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica de forma explicita que el checkpoint no ha sido evaluado todavia en capacidad, alineacion ni identidad, por lo que no existen datos de MMLU, HumanEval, GSM8K ni de ninguna otra prueba comparable. No se dispone tampoco de resultados del modelo base Qwen/Qwen3.5-9B en la informacion proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia en precision de 16 bits: aproximadamente 17,9 GB solo de pesos (coincide con el tamano del repositorio), mas el overhead de activaciones y cache KV, lo que situa el requisito practico en torno a 20-24 GB.
- VRAM estimada en cuantizacion de 8 bits: del orden de 9-11 GB de pesos, con overhead adicional.
- VRAM estimada en cuantizacion de 4 bits: del orden de 5-6 GB de pesos, con overhead adicional. Estas cifras son estimaciones aritmeticas a partir del numero de parametros, no datos publicados por el autor.
- GPU profesionales: A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) pueden alojar el modelo en precision completa sin dificultad.
- GPU de consumo: una RTX 4090 con 24 GB podria alojar el modelo en 16 bits de forma ajustada, y con holgura en cuantizaciones de 8 o 4 bits. Una RTX 3090 (24 GB) queda en una situacion similar. GPUs con 12-16 GB requeririan cuantizacion.
- Opciones de despliegue: no hay informacion especifica del autor. Al publicarse solo en safetensors, seria necesario convertir a formatos como GGUF para llama.cpp u Ollama; para vLLM o TGI habria que verificar la compatibilidad con la arquitectura `qwen3_5_text` y las dependencias de Transformers.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

El unico comparador directo documentado en la informacion proporcionada es el propio modelo base. No se dispone de datos de rendimiento para ninguno de los dos, por lo que la comparacion se limita a aspectos formales.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Benchmarks |
|---|---|---|---|---|---|
| joshycodes/qwen3.5-9b-rep10-external-s2-sdf | 8,95 mil millones | No disponible | research-only (other) | HuggingFace, 10 descargas, 0 likes | No publicados |
| Qwen/Qwen3.5-9B (modelo base) | No disponible (el ajuste parte de el) | No disponible | No disponible | HuggingFace (referenciado como base_model) | No disponibles |
| Alternativas de ~8-9 mil millones de parametros de otros fabricantes | No disponible | No disponible | No disponible | No disponible | No disponibles |

No se han identificado en la informacion disponible otros modelos comparables de la misma categoria (checkpoints de investigacion derivados de un modelo base mediante continued pretraining con corpus autoria del propio modelo), por lo que la comparativa con alternativas equivalentes queda como no disponible.

## Limitaciones y advertencias

- La model card declara explicitamente que el checkpoint no ha sido evaluado en capacidad, alineacion ni identidad. Cualquier comportamiento observado es, por tanto, no verificado.
- El autor indica de forma explicita "Do not deploy" (no desplegar). El modelo no debe utilizarse en produccion ni en aplicaciones de cara al publico.
- Licencia research-only: el uso comercial esta restringido por la propia denominacion de licencia, aunque el texto legal completo de la licencia no se detalla en la informacion disponible. Conviene revisar el campo `license: other` en el repositorio antes de cualquier uso.
- Riesgo de alucinacion: no evaluado, y probablemente acentuado por tratarse de un ajuste sobre un corpus sintetico con tematica identitaria y de bienestar de modelos.
- Sesgos conocidos: no documentados; el corpus de entrenamiento procede de un unico autor sintetico (el propio modelo), lo que puede introducir sesgos de estilo y de contenido no analizados.
- Limitaciones de contexto e idioma: no se declara la longitud de contexto soportada ni la lista de idiomas, por lo que no puede garantizarse un comportamiento correcto fuera del idioma o longitud de los textos del corpus de ajuste.
- Volumen de entrenamiento bajo: 17.506.727 tokens sobre un modelo de 8,95 mil millones de parametros es una cantidad reducida en terminos de continued pretraining, lo que hace poco probable una mejora general de capacidades y mucho mas probable una especializacion de estilo.
- Inconsistencia potencial en la documentacion: el encuadre del experimento habla de un corpus autoria por el modelo, mientras que la propia model card especifica 0 documentos autoria por el modelo y 22.321 documentos de texto ordinario. Conviene aclarar este punto con el autor antes de sacar conclusiones sobre el efecto SDF.
- Artefacto de investigacion con traccion minima: 10 descargas y 0 likes, sin pipeline declarado ni resultados de evaluacion, lo que limita la validacion por parte de terceros.
- Los resultados de busqueda web obtenidos no guardan relacion con este modelo; no se ha encontrado informacion externa que lo respalde o contradiga.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/joshycodes/qwen3.5-9b-rep10-external-s2-sdf
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Corpus de entrenamiento citado: https://huggingface.co/datasets/joshycodes/qwen-constitutional-sdf-corpus
- Repositorio welfare-improvements (marco, plan y evaluacion, citado en la model card): URL no disponible en la informacion proporcionada
- Paper o publicacion tecnica asociada: no disponible
- Demo o espacio de inferencia: no disponible
- Resultados de busqueda web relevantes: no se han encontrado; las busquedas devolvieron unicamente resultados sin relacion con el modelo
