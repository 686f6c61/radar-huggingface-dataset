# mradermacher/Muse-Glimmer-30B-Uncensored-Heretic-GGUF

## Resumen

Muse-Glimmer-30B-Uncensored-Heretic-GGUF es una coleccion de cuantizaciones en formato GGUF del modelo OS-Software/Muse-Glimmer-30B-Uncensored-Heretic, publicada por mradermacher. El modelo subyacente pertenece a la familia de variantes "abliterated", "decensored" y "heretic", es decir, versiones en las que se ha intervenido sobre los pesos para reducir los mecanismos de rechazo y los sesgos de alineamiento de seguridad. Esta publicacion concreta no introduce cambios de entrenamiento: su aportacion es la conversion de los pesos originales a GGUF y la generacion de multiples niveles de cuantizacion para ejecucion en CPU y GPU de consumo.

El recuento real de parametros en safetensors es de 27.854.794.240 (aproximadamente 27,85 mil millones), pese a la denominacion comercial "30B" del nombre. El repositorio ocupa 197,5 GB y ofrece cuantizaciones que van desde Q2_K (10,8 GB) hasta Q8_0 (29,7 GB). Ademas incluye dos ficheros mmproj (Q8_0 y f16), el proyector multimodal que emplea llama.cpp para modelos con entrada de imagen, lo que sugiere soporte de vision en el modelo base.

La relevancia de esta ficha es practica: permite ejecutar un modelo de casi 28B parametros sin censura en hardware local, algo inviable con pesos completos en precision f16. La licencia declarada es Apache 2.0, lo que facilita su uso comercial, aunque el caracter "uncensored" y "abliterated" conlleva riesgos de contenido que deben evaluarse antes de cualquier despliegue en produccion. No hay metricas de benchmark publicadas ni informacion verificable sobre contexto, arquitectura o datos de entrenamiento en la documentacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 27.854.794.240 (aproximadamente 27,85 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; ademas mmproj-Q8_0 y mmproj-f16 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (el modelo base usa safetensors) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion proporcionada. El nombre "30B" y el recuento de parametros (27,85 mil millones) son compatibles con un transformer decoder-only de escala media, pero no hay confirmacion explicita. Tampoco se detallan el numero de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de RLHF, DPO u otras fases de ajuste.

La innovacion tecnica asociada no esta en esta publicacion, sino en el modelo origen: se trata de una variante "abliterated"/"heretic", una tecnica de edicion de pesos que busca neutralizar las direcciones de activacion responsables del comportamiento de rechazo sin reentrenar el modelo. Sobre esa base, mradermacher aplica conversion a GGUF de tipo estatico (quantize_version 2, output_tensor_quantised 1, convert_type hf). Existe ademas un repositorio complementario con cuantizaciones ponderadas con imatrix (i1-GGUF), recomendadas por el autor para preservar mejor la calidad en niveles bajos de bits. La presencia de ficheros mmproj indica que el modelo base incorpora un componente multimodal, presumiblemente vision-lenguaje, aunque no se especifica su alcance.

## Capacidades

- Generacion de texto conversacional, segun la etiqueta "conversational" del repositorio.
- Comportamiento sin censura ("uncensored", "decensored", "abliterated"): menor tendencia a rechazar solicitudes, incluido contenido sensible o controvertido.
- Posible entrada multimodal (imagen) gracias a los ficheros mmproj-Q8_0 y mmproj-f16 incluidos; no confirmado de forma explicita en la tarjeta.
- Uso como modelo base para ajuste fino posterior, dado que se publica en GGUF y el original en safetensors.
- No hay constancia de soporte de tool calling, function calling, agentes, razonamiento multi-paso, modo "thinking" ni audio.
- Capacidades multilingues limitadas: la unica lengua declarada es el ingles.
- No se documentan capacidades especificas de codigo, matematicas o vision mas alla de la inferencia general.

## Casos de uso

- Ejecucion local en estaciones de trabajo sin GPU de datacenter: las cuantizaciones Q4_K_S (16,2 GB) y Q4_K_M (17,0 GB) permiten correr el modelo en una unica GPU de 24 GB, algo imposible con los pesos f16 completos.
- Investigacion sobre alineamiento y seguridad: la variante abliterated sirve para estudiar como se comporta un modelo cuando se eliminan los mecanismos de rechazo, comparandolo con la version original alineada.
- Generacion creativa sin restricciones tematicas: escritura de ficcion, guiones o narrativa que aborde violencia, temas adultos o contenido politicamente sensible, donde un modelo censurado suele negarse.
- Analisis de contenido multimodal: si se confirma el soporte de vision mediante los ficheros mmproj, podria emplearse para descripcion de imagenes o extraccion de informacion de capturas y documentos digitalizados.
- Prototipado de asistentes conversacionales en ingles: su etiqueta "conversational" y el formato GGUF lo hacen apto para chatbots locales integrados en aplicaciones de escritorio.
- Despliegue en entornos con requisitos de privacidad: al ejecutarse integramente en local mediante llama.cpp u Ollama, los datos no salen del equipo, lo que encaja en sectores con normativa estricta de tratamiento de informacion.
- Base para fine-tuning con LoRA en tareas de dominio: se puede partir de la version safetensors del modelo original y aplicar ajustes especificos antes de recuantizar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K 10,8 GB; Q3_K_S 12,6 GB; Q3_K_M 13,8 GB; Q3_K_L 14,8 GB; IQ4_XS 15,4 GB; Q4_K_S 16,2 GB; Q4_K_M 17,0 GB; Q5_K_S 19,4 GB; Q5_K_M 19,9 GB; Q6_K 23,0 GB; Q8_0 29,7 GB.
- Anadir entre 1 y 3 GB adicionales segun la longitud de contexto y el tamano del batch para la cache KV y las activaciones.
- Cabe en GPU de consumo: RTX 3090, RTX 4090, RTX 5090 y similares de 24 GB pueden ejecutar con holgura Q4_K_M y, con contexto reducido, Q5_K_M; Q6_K (23,0 GB) queda al limite. Las cuantizaciones Q2_K a Q4_K_S tambien son viables en GPUs de 12-16 GB (RTX 4080, RTX 4070 Ti Super) si se sacrifica contexto.
- GPU profesionales: A100 40 GB, A100 80 GB, H100 80 GB y L40S 48 GB ejecutan sin problema Q8_0 e incluso los pesos f16 si se dispone de suficiente memoria.
- Los ficheros mmproj (2,2 GB en Q8_0 y 3,9 GB en f16) consumen VRAM adicional cuando se activa el modo multimodal.
- Opciones de despliegue: llama.cpp, Ollama, KoboldCpp, LM Studio, text-generation-webui y cualquier runtime compatible con GGUF. vLLM y TGI no son los destinos naturales de este formato, aunque existen vias de conversion.
- Latencia y throughput: no disponibles. Dependeran del hardware, del nivel de cuantizacion y del backend utilizado.

## Comparativa con modelos similares

No se dispone en la informacion proporcionada de datos de rendimiento, contexto o licencia de modelos alternativos que permitan una comparativa rigurosa. Como referencia estructural, la eleccion principal dentro de este mismo ecosistema es el nivel de cuantizacion:

| Variante | Tamano | Notas del autor |
|---|---|---|
| Q4_K_S | 16,2 GB | rapido, recomendado |
| Q4_K_M | 17,0 GB | rapido, recomendado |
| Q6_K | 23,0 GB | calidad muy buena |
| Q8_0 | 29,7 GB | rapido, mejor calidad |
| IQ4_XS | 15,4 GB | alternativa de tamano similar a Q4_K_S |
| Q2_K | 10,8 GB | minima huella, mayor perdida de calidad |

El autor recomienda las cuantizaciones ponderadas con imatrix del repositorio Muse-Glimmer-30B-Uncensored-Heretic-i1-GGUF frente a las estaticas de este repositorio. Comparativa con otros modelos de la misma categoria (parametros, contexto, rendimiento, licencia): no disponible.

## Limitaciones y advertencias

- Modelo "uncensored"/"abliterated": la reduccion deliberada de los mecanismos de rechazo aumenta la probabilidad de generar contenido ofensivo, ilegal, peligroso o inexacto. No es apto para aplicaciones de cara al publico sin filtros adicionales.
- Riesgo de alucinacion no cuantificado: al no haber benchmarks publicados, no se puede estimar la fiabilidad factual.
- Idioma: unicamente ingles declarado. El rendimiento en castellano u otras lenguas no esta garantizado y probablemente sera inferior.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin verificacion previa.
- Licencia Apache 2.0 declarada en las etiquetas del repositorio, lo que en principio permite uso comercial. No obstante, el modelo base pertenece a un tercero (OS-Software) y conviene verificar su licencia original, ya que la tarjeta proporcionada no la detalla.
- El autor de esta publicacion es el cuantizador, no el creador del modelo; cualquier incidencia de calidad debe rastrearse hasta el modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad ni evidencia empirica de funcionamiento.
- Las cuantizaciones de 2 y 3 bits degradan notablemente la calidad; solo recomendables si la memoria es el factor limitante absoluto.
- El soporte multimodal es inferido a partir de los ficheros mmproj, no confirmado en la documentacion.

## Enlaces

- Repositorio GGUF (estatico): https://huggingface.co/mradermacher/Muse-Glimmer-30B-Uncensored-Heretic-GGUF
- Repositorio GGUF con cuantizaciones imatrix: https://huggingface.co/mradermacher/Muse-Glimmer-30B-Uncensored-Heretic-i1-GGUF
- Modelo base: https://huggingface.co/OS-Software/Muse-Glimmer-30B-Uncensored-Heretic
- Pagina de resumen del cuantizador para este modelo: https://hf.tst.eu/model#Muse-Glimmer-30B-Uncensored-Heretic-GGUF
- Guia de referencia sobre ficheros GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion y FAQ: https://huggingface.co/mradermacher/model_requests
- Analisis sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafica comparativa de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
