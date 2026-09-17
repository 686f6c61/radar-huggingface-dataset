# nikitastheo/v5-babylm-25k-lower-bul-ell-sequential_interleaved

## Resumen

El modelo `nikitastheo/v5-babylm-25k-lower-bul-ell-sequential_interleaved` es un modelo de lenguaje causal publicado en HuggingFace por el usuario nikitastheo, con 123.886.080 parametros reales (aproximadamente 124 M) almacenados en safetensors y una arquitectura de tipo GPT-2 segun los tags del repositorio. Se trata de un modelo de escala pequena, entrenado desde cero con el script `train_clm.py` basado en Hugging Face Accelerate, no con el `Trainer` estandar de la libreria Transformers. Su relevancia es exclusivamente de investigacion: encaja en el contexto del reto BabyLM, orientado a estudiar la adquisicion del lenguaje en regimen de datos limitados.

El nombre del repositorio indica tres decisiones de diseno concretas: un tokenizador propio de 25.000 entradas (`nikitastheo/babylm-25k-bul-lower-tokenizer`), texto normalizado a minusculas y una combinacion de idiomas que, por los codigos ISO 639-2/3 presentes en el nombre, corresponde a bulgaro (`bul`) y griego (`ell`). El sufijo `sequential_interleaved` apunta a un regimen de entrenamiento multilingue con alguna forma de alternancia o curriculum entre idiomas, coherente con el hiperparametro documentado `language switch epoch: 10`.

Se trata por tanto de un modelo experimental, sin descargas ni valoraciones en el momento de la consulta, sin licencia declarada, sin lista de idiomas oficial y sin resultados de benchmarks publicados. No es un modelo apto para produccion tal cual, pero si puede ser util como objeto de estudio en linguistica computacional de bajos recursos y como punto de partida para experimentos de tokenizacion y curriculums multilingues.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only causal (tag `gpt2` en el repositorio) |
| Parametros totales | 123.886.080 (dato real de safetensors) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible (el README no la especifica y la configuracion base `model_configs/gpt_base_config.json` no se incluye en la informacion proporcionada) |
| Tipos de cuantizacion | no disponible; el repositorio solo publica pesos en safetensors (fp32 o fp16, no confirmado) |
| Idiomas soportados | no disponibles de forma oficial; por el nombre del modelo y del tokenizador se infiere bulgaro y griego (codigos `bul` y `ell`) con texto en minusculas |
| Licencia | no disponible |
| Formato de pesos | safetensors (libreria `transformers`) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo causal-LM, en la linea de GPT-2. Con 123.886.080 parametros, el tamano coincide con el de GPT-2 base (124 M), lo que sugiere una configuracion de aproximadamente 12 capas, 768 dimensiones ocultas y 12 cabezas de atencion, aunque la model card solo referencia el fichero `model_configs/gpt_base_config.json` sin detallar sus valores. El entrenamiento se realizo con `train_clm.py`, un script propio basado en Hugging Face Accelerate en lugar del `Trainer`, lo que implica un bucle de entrenamiento manual y una gestion explicita del dispositivo y del mezclado de datos.

Los hiperparametros documentados son: 25.330 pasos maximos, learning rate de 0,0001, scheduler lineal, 2.533 pasos de warmup (el 10 % del total), batch size de 32 por dispositivo sin acumulacion de gradientes (batch total de 32) y un `language switch epoch` fijado en 10. Este ultimo parametro, junto con el sufijo `sequential_interleaved` del nombre, indica un regimen de entrenamiento por etapas o con intercalado secuencial entre los dos idiomas objetivo (bulgaro y griego), es decir, una forma de curriculum multilingue. No se especifica el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO; dado el contexto BabyLM, lo habitual es entrenamiento puramente autoregresivo sobre texto crudo, sin ajuste por preferencias.

El tokenizador es especifico del proyecto (`nikitastheo/babylm-25k-bul-lower-tokenizer`), con un vocabulario de 25.000 entradas y normalizacion a minusculas. Ese vocabulario reducido, aproximadamente la mitad del de GPT-2 (50.257), es una decision tipica en configuraciones BabyLM para aumentar la densidad de tokens por palabra en idiomas con morfologia rica como el bulgaro.

## Capacidades

- Generacion de texto causal en los idiomas del entrenamiento (bulgaro y griego, segun el nombre del modelo), en texto normalizado a minusculas.
- Modelado de lenguaje y calculo de perplejidad, uso principal esperado en investigacion sobre adquisicion del lenguaje.
- Continuacion de texto y generacion condicionada por prompt, al ser un modelo causal estandar.
- Capacidad multilingue limitada a la pareja de idiomas del entrenamiento; no hay evidencia de transferencia a otros idiomas.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso explicito.
- No se documenta modo de pensamiento (thinking mode), vision, audio ni ninguna modalidad distinta del texto.
- Compatible con `text-generation-inference` y con endpoints alojados, segun los tags del repositorio (`text-generation-inference`, `endpoints_compatible`).

## Casos de uso

- Investigacion en adquisicion del lenguaje con datos limitados: el modelo sirve como sujeto de experimentos tipo BabyLM, donde se compara su curva de aprendizaje y su competencia sintactica con la de modelos entrenados sobre corpus mucho mayores.
- Estudios de tokenizacion para idiomas de morfologia rica: comparar el tokenizador de 25.000 entradas y minusculas frente a alternativas mayores permite medir el efecto del vocabulario en la perplejidad del bulgaro y del griego.
- Experimentos de curriculum multilingue: el parametro `language switch epoch` en 10 permite analizar como afecta el orden de exposicion a los idiomas (secuencial frente a intercalado) al rendimiento final en cada lengua.
- Generacion de texto aumentada en bulgaro o griego: al ser un modelo de 124 M, puede ejecutarse localmente para producir borradores o aumentar datos de entrenamiento en pipelines de bajo coste.
- Modelo base para fine-tuning ligero: por su tamano, es viable ajustarlo con LoRA o adaptadores en una unica GPU de consumo para tareas concretas de clasificacion, etiquetado o generacion en los idiomas entrenados.
- Despliegue en entornos con recursos muy limitados: con menos de 1 GB de VRAM en fp16, cabe en GPUs integradas, en CPU y en dispositivos de borde, util para demos docentes sin infraestructura dedicada.
- Docencia y reproducibilidad: sirve como ejemplo minimo y completamente reproducible de un pipeline de entrenamiento causal-LM con Accelerate, sin depender del `Trainer`.
- Sondas linguisticas (probing): extraer representaciones internas del modelo para estudiar que informacion morfosintactica codifica un transformer pequeno entrenado con pocos datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye evaluaciones de BLiMP, MMLU, HumanEval, GSM8K ni de ninguna otra suite, y la model card se limita a listar hiperparametros de entrenamiento. No se dispone tampoco de mediciones de perplejidad sobre conjuntos de validacion.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,25 GB en fp16 (unos 248 MB de pesos) y aproximadamente 0,5 GB en fp32; con cache de activaciones y contexto moderado, menos de 1 GB en total.
- GPU recomendadas: cualquier GPU moderna sirve; el modelo es funcional en una GTX 1050 Ti, una RTX 3060, una RTX 4090, una A100 o una H100, donde el cuello de botella sera el lanzamiento de kernels y no la memoria.
- Cabe sin problema en GPU de consumo, e incluso en CPU, en iGPU y en dispositivos de borde; es uno de los pocos casos en los que la inferencia en CPU con `transformers` resulta practica.
- Opciones de despliegue: `transformers` (libreria declarada), Hugging Face Text Generation Inference (tag `text-generation-inference`), endpoints alojados (tag `endpoints_compatible`) y, en principio, vLLM. Para llama.cpp u Ollama haria falta convertir los pesos a GGUF, conversion que no esta publicada en el repositorio.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Vocabulario | Idiomas | Licencia | Benchmarks publicados |
|---|---|---|---|---|---|---|
| nikitastheo/v5-babylm-25k-lower-bul-ell-sequential_interleaved | 123.886.080 | no disponible | 25.000 (tokenizador propio) | bulgaro y griego (inferido) | no disponible | no disponibles |
| GPT-2 small (referencia de arquitectura) | 124 M | 1.024 tokens | 50.257 | ingles | licencia MIT modificada | si, ampliamente documentados |
| DistilGPT-2 (alternativa de escala similar) | 82 M | 1.024 tokens | 50.257 | ingles | Apache 2.0 | si, parcialmente documentados |

La comparacion con GPT-2 small y DistilGPT-2 es puramente estructural: coinciden en familia de arquitectura y orden de magnitud de parametros, pero no en idioma ni en proposito. Este modelo esta especializado en bulgaro y griego dentro de un regimen de datos reducido, mientras que los dos anteriores estan entrenados sobre corpus masivos en ingles. No se dispone de datos de rendimiento de este modelo que permitan una comparacion cuantitativa, por lo que no es posible afirmar cual es mejor en ninguna tarea concreta.

## Limitaciones y advertencias

- Ausencia de licencia declarada: sin terminos explicitos, el uso comercial es juridicamente indeterminado y desaconsejable sin consultar al autor.
- Sin resultados de benchmarks ni evaluaciones: no hay evidencia publicada de la calidad del modelo en ninguna tarea.
- Riesgo elevado de alucinacion y de texto incoherente: con 124 M de parametros y un corpus de entrenamiento tipo BabyLM, la capacidad de mantener coherencia a lo largo de varios turnos es muy limitada.
- Longitud de contexto no documentada: condiciona cualquier caso de uso que requiera prompts largos o conversaciones multi-turno.
- Normalizacion a minusculas en el tokenizador: el modelo probablemente no maneja bien mayusculas, nombres propios, siglas ni texto con formato, y puede degradar la salida en esos casos.
- Cobertura idiomatica restringida: segun el nombre, solo bulgaro y griego; no hay evidencia de competencia en castellano, ingles ni otros idiomas, y la propia lista de idiomas no esta declarada oficialmente.
- Idioma y dominio del corpus de entrenamiento no documentados: no se especifica el numero de tokens, la procedencia de los datos ni el filtrado aplicado, lo que impide auditar sesgos.
- Sesgos potenciales desconocidos: sin informacion sobre la composicion del dataset, no se pueden anticipar sesgos sociales, de genero o culturales.
- Sin soporte documentado de tool calling, agentes ni razonamiento multi-paso: no debe emplearse en pipelines que dependan de estas capacidades.
- Modelo sin validacion comunitaria: cero descargas y cero valoraciones en el momento de la consulta, y metadatos temporales anomalos (fechas de creacion y actualizacion en 2026), lo que refuerza la necesidad de tratarlo como experimento no verificado.
- No hay pesos cuantizados publicados (GGUF, AWQ, GPTQ), por lo que el despliegue en llama.cpp u Ollama requiere conversion propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/nikitastheo/v5-babylm-25k-lower-bul-ell-sequential_interleaved
- Tokenizador asociado: https://huggingface.co/nikitastheo/babylm-25k-bul-lower-tokenizer
- Paper, blog o repositorio del autor: no disponibles en la informacion proporcionada.
- Resultados de benchmarks o demos: no disponibles en la informacion proporcionada.
- Nota sobre la busqueda web: las consultas realizadas devolvieron unicamente resultados sobre la Premier League (Wikipedia, premierleague.com, footballcritic.com), sin ninguna relacion con el modelo. No se ha podido extraer de ahi ningun enlace relevante.
