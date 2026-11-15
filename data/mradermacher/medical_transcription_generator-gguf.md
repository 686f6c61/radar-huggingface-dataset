# mradermacher/medical_transcription_generator-GGUF

## Resumen

`mradermacher/medical_transcription_generator-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `alibidaran/medical_transcription_generator`, un modelo de lenguaje orientado al dominio medico y entrenado sobre texto en ingles. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de versiones GGUF de modelos open source, que en este caso ofrece desde variantes Q2_K hasta f16 para facilitar el despliegue en hardware modesto mediante llama.cpp y herramientas compatibles.

El modelo base cuenta con 163.037.184 parametros (aproximadamente 163 millones), lo que lo situa en la categoria de modelos pequenos, disenados para tareas acotadas y con requisitos de computo reducidos. La unica funcionalidad declarada por el autor es la generacion de transcripciones medicas en ingles, sin que se documenten capacidades adicionales como vision, tool calling o modos de razonamiento extendido.

La relevancia de esta ficha radica en que permite ejecutar un modelo especializado en dominio sanitario en equipos consumer: los ficheros cuantizados ocupan entre 0,2 y 0,4 GB, por lo que cabe en practicamente cualquier GPU moderna e incluso en CPU. Ahora bien, la informacion publicada es muy limitada: no se detallan datos de entrenamiento, benchmarks, licencia ni arquitectura interna del modelo base, lo que obliga a tratar esta ficha como una referencia de despliegue mas que como una evaluacion tecnica completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, segun la libreria `transformers` declarada) |
| Parametros totales | 163.037.184 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base `alibidaran/medical_transcription_generator`. La model card del repositorio cuantizado unicamente indica que se trata de cuantizaciones estaticas del modelo original y que la libreria asociada es `transformers`, lo que sugiere una arquitectura de tipo transformer, pero no se especifica si es encoder-decoder, decoder-only ni que variante concreta emplea. Tampoco se documenta el numero de capas, dimensiones ocultas, mecanismo de atencion ni tipo de tokenizador.

Respecto al entrenamiento, no se han publicado datos sobre el numero de tokens utilizados, la composicion del corpus, la posible aplicacion de RLHF o DPO, ni el proceso de ajuste fino en dominio medico. El unico indicio disponible es la etiqueta `medical` y el nombre del modelo, que apuntan a un ajuste orientado a transcripcion clinica en ingles. El proceso de cuantizacion aplicado por mradermacher es estatico (sin imatrix en este repositorio; las variantes ponderadas se publican por separado en `mradermacher/medical_transcription_generator-i1-GGUF`).

## Capacidades

- Generacion de texto en ingles orientada a transcripciones de contenido medico.
- Especializacion declarada en dominio sanitario (etiqueta `medical`).
- Ejecucion local mediante llama.cpp y herramientas compatibles con GGUF.
- Compatibilidad con `transformers` en el modelo base original.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue: solo ingles.
- No se documenta vision, audio ni modo de razonamiento extendido (thinking mode).
- No se documenta ventana de contexto especifica.

## Casos de uso

- Prototipado de transcripcion clinica en local: dado su tamano reducido (0,2-0,4 GB en GGUF), permite iterar rapidamente en un portatil con llama.cpp para generar borradores de transcripciones medicas a partir de texto, sin depender de servicios en la nube.
- Investigacion en NLP clinico: util como linea base ligera para experimentos de generacion de texto medico en ingles, comparando su salida con modelos mayores o con sistemas especializados.
- Despliegue en entornos con recursos limitados: al caber en CPU y en GPUs de gama baja, puede integrarse en dispositivos edge o en estaciones de trabajo sin GPU dedicada para tareas de generacion de texto acotadas.
- Generacion de documentacion clinica preliminar: puede emplearse para producir borradores de notas o resumenes a partir de entradas textuales, siempre con revision humana obligatoria por el riesgo de alucinacion en dominio sanitario.
- Educacion y formacion: permite ilustrar el funcionamiento de modelos especializados en dominio y de tecnicas de cuantizacion GGUF en cursos de IA aplicada a salud.
- Evaluacion de pipelines de cuantizacion: sirve como caso practico para comparar la calidad de salida entre variantes Q2_K, Q4_K_M, Q8_0 y f16 en una tarea concreta de dominio, usando el grafico de perplejidad referenciado por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,2 GB en Q2_K-Q5_K_M, 0,3 GB en Q8_0 y 0,4 GB en f16 (segun los tamanos de fichero publicados; el consumo real anade overhead del runtime y de la cache KV).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente, incluidas GTX 1060, RTX 2060, RTX 3060, RTX 4060 o superiores; tambien tarjetas de datacenter como A100 o H100, aunque estan sobredimensionadas para este modelo.
- Cabe en GPU consumer: si, en practicamente todas las GPU con al menos 1 GB de VRAM libre; tambien funciona en CPU.
- Opciones de despliegue: llama.cpp, Ollama (mediante importacion del GGUF), y cualquier runtime compatible con GGUF; el modelo base puede cargarse con `transformers`.
- Latencia y throughput estimados: no disponibles. Dado el tamano (163 M de parametros), se espera una latencia muy baja en GPU consumer, pero no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| medical_transcription_generator (este, GGUF) | 163 M | no disponible | no disponible | GGUF | Especializado en dominio medico, solo ingles |
| Modelo base `alibidaran/medical_transcription_generator` | 163 M | no disponible | no disponible | safetensors | Version original sin cuantizar |
| Variantes imatrix `mradermacher/medical_transcription_generator-i1-GGUF` | 163 M | no disponible | no disponible | GGUF | Cuantizaciones ponderadas de mayor calidad |

No se dispone de informacion sobre modelos comparables de la misma categoria (transcripcion medica de ~160 M de parametros) en la documentacion proporcionada.

## Limitaciones y advertencias

- La licencia no esta declarada, lo que impide confirmar si se permite uso comercial; es imprescindible verificar la licencia del modelo base antes de cualquier despliegue en produccion.
- Solo soporta ingles; no se ha validado su comportamiento en castellano ni en otros idiomas.
- No se documenta la longitud de contexto, por lo que no se puede garantizar el manejo de transcripciones largas.
- Riesgo elevado de alucinacion en dominio medico: al ser un modelo de 163 M de parametros, su capacidad de razonamiento y factualidad es limitada; cualquier salida debe ser revisada por personal sanitario cualificado.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez clinica.
- La informacion sobre datos de entrenamiento es inexistente, lo que impide evaluar posibles sesgos de dominio o de poblacion.
- Uso en produccion sanitaria: no recomendado sin validacion clinica formal, auditoria de sesgos y cumplimiento normativo (por ejemplo, RGPD y regulacion de dispositivos medicos).
- El repositorio incluye unicamente cuantizaciones estaticas; para variantes ponderadas (imatrix) hay que acudir al repositorio `-i1-GGUF`.

## Enlaces

- Repositorio Hugging Face (GGUF): https://huggingface.co/mradermacher/medical_transcription_generator-GGUF
- Modelo base: https://huggingface.co/alibidaran/medical_transcription_generator
- Variantes imatrix: https://huggingface.co/mradermacher/medical_transcription_generator-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#medical_transcription_generator-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
