# mradermacher/StoryGen-12B-It-GGUF

## Resumen

StoryGen-12B-It-GGUF es la distribucion en formato GGUF del modelo ajustado por instrucciones StoryGen-12B-It, publicado por el usuario turtle0001 y cuantizado por mradermacher. Se trata de un modelo de aproximadamente 11,9 mil millones de parametros orientado a la generacion de narrativa y escritura creativa, con etiquetas declaradas de storytelling, creative-writing y youtube-shorts. Esta version concreta es un artefacto de inferencia: no entrena nada nuevo, sino que empaqueta los pesos del modelo base en cuantizaciones de 2 a 8 bits para su uso con llama.cpp y derivados.

El modelo base se presenta como un merge ajustado con instrucciones, derivado de la familia Gemma segun su licencia, y entrenado con herramientas de Unsloth. La ficha del repositorio no aporta detalles sobre la composicion del dataset, el numero de tokens de entrenamiento ni el proceso de alineacion, por lo que la mayor parte de las especificaciones de entrenamiento quedan como no disponibles.

Su relevancia practica es doble: por un lado, ofrece un modelo de ~12B especializado en prosa creativa que puede ejecutarse en hardware de consumo gracias a las cuantizaciones Q4 y Q5; por otro, la existencia de ficheros mmproj sugiere capacidades multimodales (entrada de imagen) en el modelo base, aunque no se documenta su alcance. La licencia Gemma impone condiciones de uso que conviene revisar antes de cualquier despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo transformer derivado de la familia Gemma, segun licencia) |
| Parametros totales | 11.907.350.576 (11,9B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, mmproj-f16 y mmproj-Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones estaticas); safetensors en el modelo base |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base. La model card indica unicamente que se trata de un modelo "merged" y "instruction-tuned", generado con Unsloth, y la licencia Gemma sugiere una base de la familia Gemma de Google (probablemente Gemma 3 en su variante de ~12B, aunque esto no se confirma en la informacion disponible). El tamano real de parametros, 11.907.350.576, es coherente con esa familia.

Tampoco se documentan el volumen de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o ajuste supervisado mas alla de la mencion generica a "instruction-tuned". La presencia de ficheros mmproj (multi-modal supplement) en el repositorio apunta a que el modelo base admite entrada de imagenes junto al texto, pero no se especifica el codificador visual ni la resolucion soportada. Esta version GGUF es una cuantizacion estatica generada con llama.cpp a partir de los pesos en formato Hugging Face; no incluye cambios en los pesos mas alla de la propia cuantizacion.

## Capacidades

- Generacion de texto narrativo y prosa creativa: cuentos, relatos cortos, dialogos y descripciones, segun las etiquetas storytelling y creative-writing.
- Generacion orientada a guiones para YouTube Shorts, segun la etiqueta youtube-shorts del autor.
- Seguimiento de instrucciones en formato conversacional (etiqueta instruction-tuned y pipeline conversational).
- Entrada multimodal de imagen, inferida de la presencia de ficheros mmproj-f16 y mmproj-Q8_0; el alcance concreto no esta documentado.
- Capacidades multilingues limitadas al ingles segun el campo language.
- No se documenta soporte de tool calling, function calling, modo thinking ni razonamiento multi-paso explicito.

## Casos de uso

- Generacion de relatos cortos y ficcion por encargo: el modelo puede producir narrativa coherente a partir de premisas breves, aprovechando su ajuste especifico en storytelling para mantener tono y estilo a lo largo de varios parrafos.
- Guiones para videos cortos: dado su entrenamiento orientado a youtube-shorts, resulta adecuado para redactar ganchos, estructuras de 30-60 segundos y llamadas a la accion para creadores de contenido.
- Asistencia a escritores en fase de borrador: generacion de variantes de escenas, descripciones de personajes o dialogos alternativos que el autor revisa y edita, con cuantizaciones Q4_K_M ejecutables en una unica GPU de consumo.
- Prototipado de aplicaciones creativas en local: al distribuirse en GGUF, puede integrarse en herramientas de escritura offline mediante llama.cpp u Ollama sin depender de APIs externas.
- Generacion de contenido de marketing narrativo: textos con tono cercano y estructura de historia para campanas, newsletters o publicaciones en redes, siempre con revision humana por el riesgo de alucinacion.
- Experimentacion academica con modelos pequenos especializados: util para comparar el efecto del ajuste por instrucciones en tareas creativas frente a modelos generalistas del mismo tamano, usando las distintas cuantizaciones para estudiar la degradacion de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos mas overhead de contexto y cache KV): aproximadamente 6-7 GB con Q4_K_S, 7-8 GB con Q4_K_M, 8-9 GB con Q5_K_M, 10-11 GB con Q6_K y 13-14 GB con Q8_0. Las cifras son estimaciones a partir del tamano de los ficheros y no incluyen el coste del contexto largo.
- GPU recomendadas: RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB para Q4 y Q5; RTX 4090 o A100/H100 para Q8_0 con contextos amplios o despliegues concurrentes.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para cuantizaciones Q4; las variantes Q2_K y Q3_K permiten bajar de 8 GB a costa de calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y servidores compatibles con GGUF; el modelo base en safetensors puede servirse con vLLM o TGI si se dispone de la version sin cuantizar.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| StoryGen-12B-It-GGUF (este) | 11,9B | no disponible | Narrativa y escritura creativa | Gemma | GGUF |
| Gemma 3 12B Instruct | ~12B | no disponible en esta ficha | Proposito general, multimodal | Gemma | safetensors, GGUF |
| Mistral Nemo 12B Instruct | ~12B | no disponible en esta ficha | Proposito general | Apache 2.0 | safetensors, GGUF |

La comparacion con Gemma 3 12B es la mas directa por tamano y licencia, pero no se dispone de datos de rendimiento del modelo evaluado que permitan establecer diferencias cuantitativas. Frente a Mistral Nemo, la diferencia principal es la licencia: Gemma impone restricciones adicionales frente a Apache 2.0, lo que puede ser determinante en produccion.

## Limitaciones y advertencias

- Solo soporta ingles de forma declarada; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Riesgo de alucinacion inherente a los modelos generativos de este tamano, especialmente en tareas factuales; el enfoque creativo no elimina este problema.
- No se documentan sesgos conocidos, pero al no publicarse la composicion del dataset no es posible evaluar sesgos de genero, culturales o de otro tipo.
- La licencia Gemma impone condiciones de uso, incluida la politica de uso aceptable de Google; es necesario revisarla antes de cualquier explotacion comercial.
- La longitud de contexto no esta especificada, lo que dificulta planificar tareas de narrativa larga o conversaciones multi-turno extensas.
- Las cuantizaciones Q2_K y Q3_K degradan notablemente la calidad; para produccion conviene Q4_K_M o superior.
- El modelo es un merge de origen comunitario sin evaluacion independiente publicada; conviene validarlo en el caso de uso concreto antes de desplegarlo.
- La fecha de creacion del repositorio (2026-11-05) y la ausencia de likes y de documentacion detallada sugieren un artefacto reciente y poco contrastado.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/StoryGen-12B-It-GGUF
- Modelo base: https://huggingface.co/turtle0001/StoryGen-12B-It
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/StoryGen-12B-It-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#StoryGen-12B-It-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
