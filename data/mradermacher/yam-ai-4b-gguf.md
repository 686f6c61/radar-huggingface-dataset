# mradermacher/YAM-AI-4B-GGUF

## Resumen

YAM-AI-4B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo adelwolf5/YAM-AI-4B, publicado por mradermacher, un autor especializado en la conversion de pesos a GGUF para inferencia local. No se trata de un modelo entrenado desde cero, sino de una distribucion derivada: el trabajo original corresponde a adelwolf5 y este repositorio unicamente ofrece versiones comprimidas listas para ejecutarse con llama.cpp, Ollama u otros motores compatibles con GGUF.

El modelo base esta etiquetado con las etiquetas gemma4, lora, multilingual, yam-ai y conversational, lo que sugiere una arquitectura de la familia Gemma adaptada mediante LoRA y orientada a dialogo. El repositorio tiene un tamano de 74,8 GB en total, repartido entre doce ficheros de cuantizacion que van desde Q2_K (4,5 GB) hasta f16 (15,0 GB). El recuento de parametros registrado en los pesos safetensors del modelo base es de 7.463.013.674, una cifra que no coincide con el sufijo "4B" del nombre, una discrepancia que conviene tener presente.

La relevancia de esta ficha es limitada pero clara: permite ejecutar un modelo conversacional en hardware de consumo sin necesidad de GPU de datacenter. Sin embargo, el repositorio no incluye model card propia del autor original, no declara licencia, no documenta la longitud de contexto ni el proceso de entrenamiento, y no aporta ningun resultado de benchmarks, por lo que la evaluacion tecnica queda necesariamente incompleta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como gemma4 en el repo; no confirmado por el autor) |
| Parametros totales | 7.463.013.674 segun los pesos safetensors del modelo base registrados en HuggingFace (el nombre comercial indica 4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en (etiqueta multilingual presente, sin detalle de idiomas) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repositorio de cuantizaciones); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

No hay informacion publicada en este repositorio sobre la arquitectura interna, el numero de tokens de entrenamiento, la composicion del dataset ni el uso de tecnicas de alineacion como RLHF o DPO. Las unicas pistas son las etiquetas del repositorio: gemma4 (familia arquitectonica), lora (ajuste mediante Low-Rank Adaptation sobre un modelo preentrenado) y conversational. Esto implica que el modelo base probablemente sea un modelo de la familia Gemma con adaptadores LoRA fusionados o aplicados, pero no es una afirmacion confirmada por el autor.

Tampoco se documenta ninguna innovacion tecnica especifica: no se mencionan decodificacion especulativa, atencion lineal, atencion con ventana deslizante ni mecanicas de razonamiento extendido. La aportacion tecnica de este repositorio concreto es unicamente la conversion y cuantizacion de los pesos originales, con cuantizaciones estaticas (los metadatos internos indican quantize_version 2 y output_tensor_quantised 1). El autor senala que las cuantizaciones ponderadas o con imatrix no estan disponibles por el momento y que pueden solicitarse mediante una discusion en la comunidad.

## Capacidades

- Generacion de texto conversacional en ingles, con etiqueta conversational en el repositorio.
- Dialogo multi-turno, segun la etiqueta conversational del modelo base.
- Capacidades multilingues declaradas mediante etiqueta, aunque el unico idioma listado explicitamente es el ingles.
- Compatibilidad con endpoints de inferencia (etiqueta endpoints_compatible).
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades de vision, audio o modo thinking: no disponible.
- Capacidades de codigo o matematicas: no disponible.

## Casos de uso

- Asistente conversacional local en escritorio: con la cuantizacion Q4_K_M (5,4 GB) el modelo puede ejecutarse en una GPU de consumo y mantener dialogos multi-turno sin enviar datos a servicios externos.
- Despliegue en portatiles sin GPU dedicada: la cuantizacion Q2_K (4,5 GB) permite inferencia en CPU con llama.cpp, adecuada para prototipos y pruebas de concepto donde la latencia no es critica.
- Chatbot integrado en aplicaciones de escritorio: al ser un solo fichero GGUF, se puede empaquetar con Ollama o llama-cpp-python y distribuirse como binario autonomo.
- Procesamiento por lotes de textos en ingles: generacion de resumenes, reformulaciones o clasificacion de texto en pipelines offline donde el coste por token de una API externa no es asumible.
- Experimentacion academica con modelos cuantizados: permite estudiar la degradacion de calidad entre Q2_K y Q8_0 usando las doce variantes publicadas, sin necesidad de infraestructura de datacenter.
- Entornos aislados o con requisitos de privacidad: al ejecutarse en local, encaja en escenarios donde la normativa impide enviar datos a terceros, siempre que el uso comercial este permitido (la licencia no esta declarada, lo que debe verificarse).
- Base para ajuste adicional: los ficheros GGUF permiten fine-tuning con LoRA sobre la version f16, aunque se requeriria el modelo base original en safetensors para un entrenamiento completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el modelo base tampoco documenta evaluaciones en la informacion proporcionada. Los resultados de la busqueda web no contienen ningun dato tecnico sobre el modelo: los enlaces devueltos corresponden a sitios de noticias de futbol y no guardan relacion con el repositorio.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin cache KV): Q2_K 4,5 GB; Q3_K_S 4,7 GB; Q3_K_M 4,9 GB; Q3_K_L 5,1 GB; IQ4_XS 5,2 GB; Q4_K_S 5,3 GB; Q4_K_M 5,4 GB; Q5_K_S 5,7 GB; Q5_K_M 5,8 GB; Q6_K 6,3 GB; Q8_0 8,1 GB; f16 15,0 GB.
- VRAM total estimada con cache KV: anadir aproximadamente 1-2 GB a las cifras anteriores para contextos moderados, y mas si la longitud de contexto resulta ser elevada (dato no disponible). Como referencia practica, Q4_K_M deberia funcionar con comodidad en GPUs de 8-10 GB.
- GPU recomendadas: para cuantizaciones Q4 y superiores, una RTX 3060 de 12 GB, RTX 4060 Ti 16 GB o RTX 4070 cubren el modelo con margen. Para Q8_0 y f16 conviene una RTX 4080/4090 o una GPU profesional como A100 o H100 si se busca throughput alto.
- Cabe en GPU de consumo: si. Q2_K y Q3_K entran en GPUs de 6 GB; Q4_K_M y Q5_K en GPUs de 8 GB; Q6_K y Q8_0 requieren 10-12 GB; f16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python y cualquier runtime compatible con GGUF. vLLM y TGI no consumen GGUF de forma nativa, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| YAM-AI-4B-GGUF (este repo) | 7,46 B segun safetensors del base | no disponible | no disponible | GGUF | no disponible |
| adelwolf5/YAM-AI-4B (modelo base) | 7,46 B segun safetensors | no disponible | no disponible | safetensors | no disponible |
| Modelos comparables de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No es posible establecer una comparativa fiable con alternativas concretas: la arquitectura real del modelo base no esta documentada, no hay benchmarks publicados y se desconoce la licencia. Cualquier comparacion de rendimiento con modelos de tamano similar seria especulativa.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir que el uso comercial este permitido. Es imprescindible consultar el repositorio del modelo base adelwolf5/YAM-AI-4B antes de cualquier despliegue en produccion.
- Discrepancia en el recuento de parametros: el nombre indica 4B, mientras que los safetensors del modelo base registran 7.463.013.674 parametros. Conviene verificar cual es la cifra correcta antes de dimensionar hardware.
- Idiomas: el unico idioma declarado es el ingles. La etiqueta multilingual no viene acompanada de una lista de idiomas, por lo que el comportamiento en castellano es desconocido y probablemente deficiente.
- Riesgo de alucinacion: no hay evaluaciones publicadas de fidelidad factual ni de tasas de alucinacion. Al ser un modelo pequeno orientado a conversacion, el riesgo debe considerarse alto en tareas de recuperacion de hechos.
- Longitud de contexto desconocida: no se puede garantizar el comportamiento en conversaciones largas ni en tareas de documentacion extensa.
- Sin benchmarks: no existe ninguna evidencia publicada de rendimiento en razonamiento, codigo o matematicas.
- Cuantizaciones agresivas: Q2_K y Q3_K degradan la calidad de forma notable. El propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- Cero adopcion verificable: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay retroalimentacion de la comunidad sobre su comportamiento real.
- Ausencia de model card propia del autor original en este repositorio: la informacion disponible es la generada automaticamente por el proceso de cuantizacion.
- Los resultados de la busqueda web no aportaron ninguna fuente tecnica adicional; todos los enlaces recuperados eran irrelevantes.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/YAM-AI-4B-GGUF
- Modelo base: https://huggingface.co/adelwolf5/YAM-AI-4B
- Pagina de resumen del cuantizador: https://hf.tst.eu/model#YAM-AI-4B-GGUF
- Solicitudes de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia sobre uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafica comparativa de calidad entre cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
- Papers, blogs o demos adicionales: no disponible (la busqueda web no devolvio resultados relevantes)
