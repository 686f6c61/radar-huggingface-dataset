# arianaazarbal/ct-qwen36-35b-self-gen-postcot-g1-b3

## Resumen

`ct-qwen36-35b-self-gen-postcot-g1-b3` es un adaptador LoRA (PEFT, rango 64, `target_modules=all-linear`) entrenado sobre el modelo base `Qwen/Qwen3.6-35B-A3B`. Lo publica el usuario `arianaazarbal` como parte del programa de entrenamiento por constitución iterada y autogenerada (`welfare-in-ai-rnd / constitutional_training`). No es un modelo completo: requiere cargar el modelo base y aplicar el adaptador con la librería `peft`.

El interés del artefacto es metodológico más que de producto. Cada generación se entrena desde cero sobre el modelo base con un corpus sintético que instancia una única constitución (el «seed» de esa generación). La generación 0 parte de una constitución escrita por humanos; a partir de la generación 1, el seed lo escribe el propio modelo de la generación anterior de la misma rama, seleccionado como medoide de embeddings de un pool de 40 cadenas autogeneradas. Así, la deriva entre generaciones se acumula solo a través de los documentos de entrenamiento, nunca a través de los pesos. Este adaptador concreto corresponde a la generación 1 (`g1`), rama `b3`, con régimen post-CoT.

La ficha del modelo no aporta datos sobre licencia, idiomas, parámetros exactos del adaptador ni resultados de evaluación. El repositorio ocupa 4,5 GB e incluye la constitución usada en el entrenamiento como `training_seed_constitution.md` y un registro de exportación `tinker_meta.json`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre `Qwen/Qwen3.6-35B-A3B`; arquitectura interna del modelo base no detallada en la informacion disponible |
| Parametros totales | No disponible (adaptador LoRA r=64 sobre todas las capas lineales; numero de parametros entrenables no publicado). El identificador del base sugiere ~35B en el modelo subyacente, dato no confirmado en la ficha |
| Parametros activos | No disponible (la nomenclatura `A3B` del modelo base sugiere ~3B activos; no confirmado) |
| Longitud de contexto | No disponible. La receta de entrenamiento uso `max_length=8192` |
| Tipos de cuantizacion | No disponible (adaptador distribuido en safetensors; el modelo base admite las cuantizaciones que soporte su implementacion) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT); repo de 4,5 GB; incluye `training_seed_constitution.md` y `tinker_meta.json` |
| Libreria | peft |
| Pipeline | text-generation |
| Renderer / modo | `qwen3_5`, reasoning ON |
| Fecha de entrenamiento | 2026-09-17 (exportado el 2026-09-18) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 64 aplicado a todos los modulos lineales (`all-linear`) del modelo base Qwen3.6-35B-A3B. La receta esta fijada («locked»): learning rate 1e-4, scheduler coseno con 5% de warmup, 1 epoca, batch 128, longitud maxima 8192 y semilla de entrenamiento 42. El entrenamiento se hizo en dos fases: una fase de midtrain sobre el corpus sintetico que instancia una unica constitucion, y una segunda fase de post-train que continua desde el adaptador de la fase 1 usando datos de chat condicionados por constitucion, generados con Opus y con las trazas de razonamiento conservadas (de ahi el sufijo `postcot`). El nombre interno del run es `qwen36_selfg1_qwen36_self_g1_b3_s2_cot`.

La innovacion metodologica es el bucle de constitucion iterada: la constitucion de la generacion N se escribe por el modelo de la generacion N-1 de la misma rama, y se selecciona mediante el medoide de embeddings de un pool de 40 cadenas autogeneradas. En esta generacion el seed es de tipo `self-seeded` (medoide del pool de constituciones del propio modelo base sin entrenar). Como cada generacion se entrena desde cero sobre el base con un adaptador nuevo, el efecto acumulado entre generaciones queda confinado al contenido de los documentos, lo que permite estudiar deriva de comportamiento sin contaminacion de pesos. El repositorio incluye la constitucion exacta usada (`training_seed_constitution.md`).

## Capacidades

- Generacion de texto condicionada por una constitucion explicita: el adaptador se entrena sobre documentos que instancian una unica constitucion, por lo que el comportamiento se define por ese texto.
- Razonamiento con trazas conservadas: la fase 2 usa datos de chat con chain-of-thought y la ficha indica servir y evaluar con `reasoning ON`.
- Modo post-CoT (`regime:post_cot`): el entrenamiento mantiene las trazas de razonamiento en el material de SFT.
- Elicitacion de constituciones: la cadena `seed:self` / `method:gen` implica que el modelo esta preparado para escribir una constitucion nueva que sirva de seed a la generacion siguiente.
- Ajuste fino eficiente mediante LoRA: se puede cargar junto al base con `PeftModel.from_pretrained` sin duplicar los pesos completos.
- Capacidades heredadas del modelo base (codigo, matematicas, tool calling, multilingue): no disponibles en la informacion proporcionada; no se documentan ni se verifican para este adaptador.

## Casos de uso

- Investigacion en alineacion constitucional: permite estudiar como un modelo ajustado con LoRA sobre un corpus de constitucion unica internaliza reglas de comportamiento, comparando su salida con la del modelo base sin adaptador.
- Analisis de deriva entre generaciones: al entrenar cada generacion con la constitucion escrita por la anterior, este adaptador (`g1`) sirve para medir cuanto cambia el comportamiento respecto al seed inicial y alimentar la comparacion con `g2`.
- Elicitacion del seed de la generacion siguiente: el modelo puede usarse para generar candidatos de constitucion que, tras el filtrado por medoide de embeddings del pool de 40 cadenas, se convertirian en el corpus de la generacion 2.
- Estudio de varianza entre replicas: la etiqueta `branch:b3` indica una replica independiente; comparar b1, b2 y b3 con la misma receta y semilla aislada permite estimar la variabilidad del proceso de entrenamiento.
- Evaluacion de fidelidad constitucional: construir baterias de prompts que comprueben si las respuestas respetan los articulos de `training_seed_constitution.md`, con el modelo servido en `reasoning ON`.
- Reproducibilidad de experimentos de post-train: la receta esta fijada (lr, scheduler, epocas, batch, max length, seed de entrenamiento) y se incluye el meta de exportacion de Tinker, lo que facilita replicar el pipeline en laboratorios de investigacion.
- Base para estudios de razonamiento post-CoT: como los datos de la fase 2 conservan las trazas de razonamiento, sirve para analizar si el estilo de razonamiento se mantiene tras el condicionamiento por constitucion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de la busqueda web no aportan datos de evaluacion de este adaptador (solo enlaces no relacionados).

## Requisitos de hardware

- VRAM para inferencia: depende enteramente del modelo base, que segun la informacion disponible no esta especificado. Como referencia de orden de magnitud para un modelo de ~35B: aproximadamente 70 GB en bfloat16, ~35 GB en 8 bits y ~18-20 GB en 4 bits, mas el overhead de cache KV. Estas cifras son estimaciones basadas en el tamano implicado por el nombre del base y no estan confirmadas en la ficha.
- GPU recomendadas: para bfloat16 sin cuantizar, una GPU de 80 GB (H100, A100 80 GB) o reparto en varias GPUs. Con cuantizacion de 4 bits, el modelo base podria entrar en una RTX 4090 o RTX 6000 Ada de 24-48 GB, siempre que la implementacion soporte el esquema de pesos correspondiente.
- Viabilidad en GPU de consumo: el adaptador en si es pequeno, pero el cuello de botella es el modelo base. Si `A3B` implica pocos parametros activos, tecnicas de offload de expertos a CPU/VRAM pueden hacer viable la inferencia en equipos de consumo, pero no hay datos publicados que lo confirmen.
- Opciones de despliegue: `transformers` + `peft` es el camino documentado en la model card (carga del base en bfloat16 con `device_map="auto"` y aplicacion del adaptador). Para servicio de alto rendimiento habria que fusionar el adaptador o cargarlo en motores compatibles con PEFT, como vLLM, SGLang o TGI, o convertir a GGUF para llama.cpp/Ollama; ninguna de estas integraciones se menciona en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `ct-qwen36-35b-self-gen-postcot-g1-b3` | Adaptador LoRA sobre Qwen3.6-35B-A3B | No disponible (base ~35B segun nomenclatura) | No disponible (entrenado a 8192) | Sin benchmarks publicados | No disponible | HuggingFace, 0 descargas |
| `Qwen/Qwen3.6-35B-A3B` (base sin adaptador) | Modelo completo | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | No disponible | No disponible | HuggingFace (referenciado como base) |
| Otras ramas y generaciones del mismo programa (`g1` b1/b2, `g2`) | Adaptadores LoRA de la misma cadena | No disponible | No disponible | No disponible | No disponible | No se han encontrado en la busqueda web |

No se dispone de datos comparativos de rendimiento ni de alternativas equivalentes de constitucion iterada publicadas en la informacion consultada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo base `Qwen/Qwen3.6-35B-A3B` el adaptador no es utilizable.
- Licencia no disponible: no se puede determinar si se permite el uso comercial. Hay que contactar con el autor o asumir restricciones hasta confirmarlo.
- Idiomas soportados no documentados: no se puede garantizar cobertura multilingue ni un nivel de calidad por idioma.
- Sin evaluacion publicada: no hay benchmarks, evaluaciones de seguridad ni pruebas de robustez. Cualquier despliegue en produccion seria a ciegas.
- Riesgo de alucinacion: no se documenta ningun mecanismo de mitigacion especifico; hereda el comportamiento del base y el sesgo inducido por el corpus sintetico de la constitucion.
- Sesgo inducido por el corpus: al entrenarse sobre documentos que instancian una unica constitucion autogenerada, el modelo puede mostrar un sesgo fuerte hacia ese marco normativo, con menor diversidad de respuestas.
- Sobreajuste al formato del corpus: 1 epoca sobre un corpus sintetico de constitucion unica puede producir respuestas muy alineadas con el estilo de esos documentos y menos generalistas.
- Deriva metodologica: por diseno, la cadena acumula cambios en los documentos, no en los pesos; los resultados de esta generacion no son extrapolables a generaciones posteriores.
- Modo de servido especifico: la ficha indica usar el renderer `qwen3_5` con `reasoning ON`; servir con otra plantilla de chat puede degradar el comportamiento.
- Repositorio sin traccion: 0 descargas y 0 likes, sin senal de uso ni validacion por parte de terceros.
- Los resultados de la busqueda web no aportan informacion tecnica relevante sobre el modelo (los enlaces devueltos no estan relacionados).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/arianaazarbal/ct-qwen36-35b-self-gen-postcot-g1-b3
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Libreria PEFT: https://huggingface.co/docs/peft
- No se han encontrado en la busqueda web papers, blogs, repositorios ni demos adicionales relacionados con este modelo.
