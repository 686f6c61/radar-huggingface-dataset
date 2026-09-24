# mradermacher/Keural-Cortex-8B-v1.0-i1-GGUF

## Resumen

Keural-Cortex-8B-v1.0-i1-GGUF es la version cuantizada en formato GGUF del modelo mkd-ai/Keural-Cortex-8B-v1.0, publicada por mradermacher. No es un modelo entrenado desde cero, sino una conversion y compresion del checkpoint original en safetensors a ficheros GGUF listos para inferencia local con llama.cpp y derivados. El modelo base cuenta con 8.190.735.360 parametros (aproximadamente 8,2 mil millones) y esta etiquetado para generacion de texto, conversacion, function calling y uso como agente.

La relevancia de esta publicacion es practica: el repositorio ofrece 24 variantes de cuantizacion con prefijo i1- (desde IQ1_S de 2,2 GB hasta Q6_K de 6,8 GB), generadas con matrices de importancia (imatrix) para reducir la perdida de calidad respecto a las cuantizaciones estaticas equivalentes. Existe ademas un repositorio hermano con cuantizaciones estaticas. El modelo base esta orientado a un publico bilingue ingles-coreano y se distribuye bajo licencia Apache 2.0.

El modelo no dispone de documentacion publica sobre arquitectura, contexto o datos de entrenamiento en la informacion proporcionada, mas alla de que el modelo base declara compatibilidad con la libreria transformers. La fecha de creacion del repositorio es el 23 de septiembre de 2026 y, en el momento de la consulta, acumula 0 descargas y 0 likes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.190.735.360 (dato de safetensors del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-IQ4_NL, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas el fichero imatrix de calibracion |
| Idiomas soportados | ingles (en) y coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

Datos adicionales del repositorio: tamano total del repo 96,4 GB; etiquetas endpoints_compatible e imatrix; idioma de la libreria transformers; pipeline text-generation.

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna del modelo base (tipo de transformer, atencion, capas, dimension del modelo o tamano de la ventana de contexto) en los datos disponibles. Tampoco hay informacion sobre el volumen de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de alineacion como RLHF, DPO o similares. La unica referencia tecnica disponible es que el modelo base se carga mediante la libreria transformers y que su checkpoint esta en safetensors.

En cuanto al proceso de cuantizacion, la model card del repositorio indica que se trata de cuantizaciones ponderadas con imatrix (matriz de importancia) sobre el modelo mkd-ai/Keural-Cortex-8B-v1.0, con quantize_version 2, tensor output quantised a 1 y convert_type hf. El autor incluye el fichero imatrix (0,1 GB) para que terceros puedan generar sus propias cuantizaciones. El autor etiqueta explicitamente algunas variantes con advertencias de calidad: IQ1_S como "for the desperate", IQ1_M como "mostly desperate", Q2_K_S como "very low quality" y Q4_0 como "fast, low quality".

## Capacidades

- Generacion de texto conversacional multi-turno, segun las etiquetas text-generation y conversational.
- Function calling / tool calling, declarado explicitamente en las etiquetas del repositorio.
- Uso como agente (etiqueta agent), lo que implica soporte previsto para flujos de varios pasos con llamadas a herramientas.
- Bilingue: ingles y coreano, con etiquetas especificas korean y english.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), orientada a su despliegue detras de APIs compatibles.
- No se documentan capacidades de vision, audio, modo de razonamiento explicito (thinking mode) ni decodificacion especulativa en la informacion disponible.

## Casos de uso

- Agentes locales con tool calling: al declarar soporte de function calling y de flujo agentico, el modelo puede orquestar llamadas a APIs externas (clima, bases de datos, busqueda) ejecutandose integramente en hardware de consumo mediante llama.cpp u Ollama.
- Asistente conversacional bilingue ingles-coreano: util para productos dirigidos a usuarios coreanos que tambien operan en ingles, aprovechando las dos unicas lenguas declaradas.
- Automatizacion de atencion al cliente en local: la cuantizacion Q4_K_M (5,1 GB) permite desplegar un chatbot multi-turno en una GPU de 8-12 GB evitando costes de API y manteniendo los datos dentro de la infraestructura propia.
- Prototipado rapido y evaluacion de calidad: las 24 variantes de cuantizacion permiten al desarrollador medir el compromiso entre tamano (de 2,2 GB a 6,8 GB) y calidad para decidir que fichero usar en produccion.
- Integracion en pipelines de agentes autoalojados: con licencia Apache 2.0 y formato GGUF, el modelo se puede incrustar en herramientas tipo LangChain, LlamaIndex o servidores compatibles con la API de OpenAI sin restricciones de uso comercial.
- Inferencia en CPU o equipos sin GPU dedicada: las variantes IQ2 e IQ3 (entre 2,6 GB y 4,5 GB) hacen viable ejecutar el modelo en portatiles con 16 GB de RAM usando llama.cpp.
- Generacion de codigo asistida en el editor: aunque no hay benchmarks especificos, el soporte de function calling permite integrarlo en asistentes que invocan herramientas de desarrollo (ejecutar tests, consultar documentacion) en entornos con requisitos de privacidad estrictos.
- Traduccion y generacion de contenido ingles-coreano: para publicacion de documentacion o materiales en ambos idiomas dentro de una misma organizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye tablas de MMLU, HumanEval, GSM8K ni evaluaciones equivalentes, ni para el modelo base ni para las cuantizaciones.

Lo unico aportado por el autor en materia de calidad es una referencia externa a una grafica de perplejidad comparando tipos de cuantizacion de baja calidad y un enlace a las notas de Artefact2 sobre el tema, pero sin cifras concretas para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: depende del fichero elegido. El peso en disco de cada cuantizacion es una base razonable de partida (los pesos se cargan completos), a lo que hay que sumar el espacio de la cache KV, que crece con la longitud de contexto y que no se puede calcular sin conocer la arquitectura ni el numero de capas.
- IQ1_S (2,2 GB) e IQ1_M (2,4 GB): viables en GPUs de 4 GB o incluso CPU con 8 GB de RAM; el autor desaconseja su uso por perdida de calidad.
- IQ2_XXS a Q2_K (2,6-3,4 GB): GPUs de 4-6 GB, portatiles con grafica de entrada.
- IQ3_XXS a Q3_K_L (3,5-4,5 GB): GPUs de 6-8 GB, como RTX 3060 Ti, RTX 2070 o RTX 4060.
- IQ4_XS, Q4_K_S, Q4_K_M, Q4_0, Q4_1 (4,7-5,3 GB): GPUs de 8 GB (RTX 3060 Ti, RTX 4060, RTX 3070) con contexto moderado. Q4_K_M esta marcado por el autor como "fast, recommended".
- Q5_K_S y Q5_K_M (5,8-6,0 GB): GPUs de 8-12 GB.
- Q6_K (6,8 GB): GPUs de 12 GB o mas, como RTX 3060 12 GB o RTX 4070 Ti.
- GPU recomendadas para despliegue con contexto largo o concurrencia: RTX 4090 (24 GB), A100 40/80 GB, H100. La version sin cuantizar, de 8,2 mil millones de parametros, requiere aproximadamente 16 GB en bf16/fp16, por lo que cabe en una RTX 4090 o en una A100 40 GB.
- Cabe en GPU de consumo: si, en todas las variantes hasta Q6_K con GPUs de 12 GB o mas; las variantes IQ2 e IQ3 entran en GPUs de 6 GB.
- Opciones de despliegue: llama.cpp (incluye llama-cpp-python), Ollama, LM Studio, koboldcpp y servidores GGUF compatibles con la API de OpenAI (la etiqueta endpoints_compatible apunta a este escenario). Los formatos IQ requieren una build de llama.cpp con soporte de cuantizacion i-quants. vLLM y TGI no soportan GGUF de forma nativa para este caso.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo para ninguna de las variantes.

## Comparativa con modelos similares

No hay datos de benchmarks ni de arquitectura del modelo base que permitan una comparacion rigurosa con otras familias de modelos de ~8B. La unica comparacion posible con la informacion disponible es entre las dos publicaciones de cuantizacion del mismo modelo:

| Modelo | Parametros | Formato | Cuantizaciones | Licencia | Benchmarks |
|---|---|---|---|---|---|
| mradermacher/Keural-Cortex-8B-v1.0-i1-GGUF (imatrix) | 8,19 mil millones (base) | GGUF | 24 variantes i1- con matrices de importancia | Apache 2.0 | no disponible |
| mradermacher/Keural-Cortex-8B-v1.0-GGUF (estaticas) | 8,19 mil millones (base) | GGUF | cuantizaciones estaticas | Apache 2.0 | no disponible |
| mkd-ai/Keural-Cortex-8B-v1.0 (modelo base) | 8,19 mil millones | safetensors | sin cuantizar | Apache 2.0 | no disponible |

Comparacion con alternativas de otras familias (por ejemplo modelos de ~8B con soporte agentico y function calling): no disponible, al no existir resultados de evaluacion publicados para Keural-Cortex-8B-v1.0.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que no hay evidencia objetiva del rendimiento del modelo en tareas de razonamiento, codigo o matematicas. Cualquier afirmacion de calidad seria una extrapolacion.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano y no cuantificado por el autor. Es previsible que aumente en las cuantizaciones de 1 y 2 bits, etiquetadas por el propio autor como "very low quality" o "for the desperate".
- Cobertura idiomatica limitada: solo ingles y coreano. No hay soporte declarado de castellano ni de otras lenguas, lo que limita su uso directo en productos en espanol sin ajuste adicional.
- Perdida de calidad por cuantizacion: el autor advierte explicitamente de que las variantes IQ1_S, IQ1_M, Q2_K_S, Q2_K, IQ3_XXS y Q4_0 tienen calidad reducida. Para produccion se recomienda partir de Q4_K_M o superior.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones o documentos largos, ni dimensionar correctamente la cache KV.
- Opacidad del modelo base: se desconoce la procedencia de los datos de entrenamiento, lo que impide evaluar sesgos conocidos, contaminacion de benchmarks o cumplimiento normativo sobre datos.
- Licencia: Apache 2.0 permite uso comercial, modificacion y redistribucion sin restricciones adicionales, siempre que se conserve el aviso de licencia. Al ser una cuantizacion derivada, conviene verificar que el modelo base mantiene la misma licencia, lo cual se indica en las etiquetas del repositorio.
- Adopcion nula hasta la fecha: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validacion por parte de la comunidad. No se debe tratar como un modelo probado en produccion.
- Fecha de creacion futura respecto al momento de redaccion habitual: el repositorio esta fechado en septiembre de 2026, dato a verificar si se cita la ficha.

## Enlaces

- Repositorio HuggingFace de la cuantizacion imatrix: https://huggingface.co/mradermacher/Keural-Cortex-8B-v1.0-i1-GGUF
- Modelo base: https://huggingface.co/mkd-ai/Keural-Cortex-8B-v1.0
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/Keural-Cortex-8B-v1.0-GGUF
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#Keural-Cortex-8B-v1.0-i1-GGUF
- Guia de uso de ficheros GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos y preguntas frecuentes del cuantizador: https://huggingface.co/mradermacher/model_requests
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
