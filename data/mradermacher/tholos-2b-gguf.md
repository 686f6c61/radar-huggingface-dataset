# mradermacher/Tholos-2B-GGUF

## Resumen

Tholos-2B-GGUF es la version cuantizada en formato GGUF del modelo Tholos-2B, desarrollado originalmente por mertkayacs y convertido a GGUF por el usuario mradermacher, conocido por publicar cuantizaciones estaticas de modelos abiertos. El modelo base es un language model pequeno de aproximadamente 2.516.756.480 parametros (unos 2,52 mil millones) orientado explicitamente a agentes locales, uso de herramientas (tool use), function calling y generacion de salida estructurada, segun las etiquetas declaradas en la model card. La licencia es Apache 2.0 y el unico idioma declarado es el ingles.

La relevancia de esta ficha esta en que el repositorio proporciona un conjunto completo de cuantizaciones (desde Q2_K de 1,1 GB hasta f16 de 5,1 GB), lo que permite ejecutar el modelo en hardware de consumo, incluidos equipos sin GPU dedicada, algo coherente con las etiquetas "on-device" y "local-llm". El modelo base fue entrenado con la libreria Unsloth segun la etiqueta "unsloth" y utiliza el dataset mertkayacs/tholos-trajectories, compuesto por trayectorias de agente, lo que sugiere un enfoque en flujos de multi-step reasoning con llamadas a funciones.

Se trata, por tanto, de un modelo pequeno especializado en orquestacion de agentes mas que en conocimiento general o razonamiento complejo. No se ha publicado en la informacion disponible ni la arquitectura concreta, ni la longitud de contexto, ni resultados de benchmarks, por lo que la evaluacion debe hacerse de forma empirica antes de llevarlo a produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (no documentada en la informacion proporcionada) |
| Parametros totales | 2.516.756.480 (aprox. 2,52 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base se distribuye en safetensors |
| Autor de la cuantizacion | mradermacher |
| Modelo base | mertkayacs/Tholos-2B |
| Dataset de entrenamiento declarado | mertkayacs/tholos-trajectories |
| Tamano del repositorio | 22,8 GB (todas las cuantizaciones) |
| Etiquetas destacadas | small-language-model, local-llm, on-device, ai-agent, agents, tool-use, structured-output, function-calling, unsloth |
| Descargas / likes | 636 / 2 |
| Fecha de creacion / actualizacion | 2026-10-01 / 2026-10-10 |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura del modelo base: no se especifica si se trata de un transformer decoder-only convencional, de una variante MoE, de un modelo hibrido con capas de atencion lineal o de otra topologia. La etiqueta "unsloth" apunta a que el ajuste fino del modelo base se realizo con la libreria Unsloth, habitualmente empleada para fine-tuning eficiente en memoria (LoRA/QLoRA y kernels optimizados), pero no implica por si misma una arquitectura concreta. Tampoco se indican el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF, DPO u otra optimizacion por preferencias.

Lo unico documentado respecto al entrenamiento es el uso del dataset mertkayacs/tholos-trajectories, cuyo nombre sugiere trayectorias de agente (secuencias de observacion, razonamiento, llamada a herramienta y respuesta). Esto es coherente con el conjunto de etiquetas del repositorio, centradas en tool use, function calling y structured output. En el lado de la cuantizacion, la model card de mradermacher indica que las cuantizaciones son estaticas ("static quants"), con quantize_version 2, output_tensor_quantised 1 y convert_type hf, y que en el momento de publicacion no habia cuantizaciones ponderadas con matriz de importancia (imatrix) disponibles. El autor senala que las cuantizaciones IQ suelen ser preferibles frente a otras de tamano similar, aunque no aporta mediciones de perplejidad propias.

## Capacidades

- Generacion de texto conversacional en ingles, en formato de chat (la etiqueta "conversational" aparece en los metadatos del repositorio).
- Function calling y tool use: el modelo esta etiquetado explicitamente con "function-calling" y "tool-use", lo que indica que ha sido entrenado o ajustado para emitir llamadas a herramientas.
- Salida estructurada ("structured-output"): capacidad declarada de generar respuestas en formatos parseables como JSON, orientadas a ser consumidas por software.
- Flujos de agente y razonamiento multi-paso: las etiquetas "ai-agent" y "agents", junto al dataset de trayectorias, apuntan a soporte de pipelines con varias etapas de decision y ejecucion.
- Despliegue local y en dispositivo: las etiquetas "local-llm", "on-device" y "small-language-model" indican que el modelo esta pensado para ejecutarse sin conexion y con recursos limitados.
- Capacidades multilingues: no disponibles; el unico idioma declarado es el ingles.
- Modo de razonamiento explicito (thinking mode), vision o audio: no disponible, no se documenta ninguna de estas capacidades.
- Compatibilidad con endpoints: el repositorio incluye la etiqueta "endpoints_compatible".

## Casos de uso

- Agente local en el puesto de trabajo del desarrollador: gracias a su tamano (2,52 mil millones de parametros) y a las cuantizaciones de 1,1 a 2,8 GB, puede ejecutarse en un portatil y actuar como planificador que decide que herramienta invocar (lectura de ficheros, ejecucion de comandos acotados, consultas a una API interna) sin enviar datos a servicios externos.
- Automatizacion de tareas ofimaticas con salida estructurada: el modelo puede transformar texto libre en JSON con campos predefinidos (por ejemplo, extraer incidencias de un correo y clasificarlas), integrandose en un script que valide el esquema antes de actuar.
- Enrutador de intenciones en un sistema de atencion al cliente: al ser pequeno y rapido en cuantizaciones Q4_K_S o Q4_K_M, puede clasificar la peticion del usuario y derivarla al servicio o al agente especializado correspondiente, reservando modelos mayores para las respuestas finales. La ventana de contexto real debe verificarse empiricamente, ya que no esta documentada.
- Orquestador de pipelines de agentes con varias etapas: el modelo puede generar la secuencia de llamadas a funciones de un flujo (consultar estado, ejecutar accion, confirmar resultado) y ser validado por un componente externo que compruebe cada paso.
- Prototipado e investigacion sobre trayectorias de agente: al estar entrenado con el dataset tholos-trajectories, resulta util como punto de partida para reproducir experimentos de tool use y comparar estrategias de prompting en entornos controlados.
- Procesamiento por lotes en CPU: con la cuantizacion Q2_K (1,1 GB) o Q3_K_S (1,3 GB) es viable ejecutar tareas de extraccion y clasificacion de bajo coste en servidores sin GPU, siempre asumiendo una perdida de calidad respecto a Q6_K o Q8_0.
- Integracion en herramientas de escritorio o plugins de IDE: el formato GGUF permite cargarlo desde llama.cpp u Ollama dentro de una aplicacion local, de modo que el modelo asista en tareas de reescritura, resumen o generacion de parametros de configuracion sin dependencia de red.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio cuantizado no incluye tablas de MMLU, HumanEval, GSM8K, BFCL ni de ninguna otra evaluacion, ni comparaciones numericas con modelos de tamano similar. El unico dato de rendimiento objetivo que aparece es el tamano de cada fichero de cuantizacion y las notas cualitativas del autor sobre calidad y velocidad:

| Cuantizacion | Tamano (GB) | Nota del autor |
|---|---|---|
| Q2_K | 1,1 | sin nota |
| Q3_K_S | 1,3 | sin nota |
| Q3_K_M | 1,4 | lower quality |
| Q3_K_L | 1,5 | sin nota |
| IQ4_XS | 1,5 | sin nota |
| Q4_K_S | 1,6 | fast, recommended |
| Q4_K_M | 1,7 | fast, recommended |
| Q5_K_S | 1,9 | sin nota |
| Q5_K_M | 1,9 | sin nota |
| Q6_K | 2,2 | very good quality |
| Q8_0 | 2,8 | fast, best quality |
| f16 | 5,1 | 16 bpw, overkill |

## Requisitos de hardware

- VRAM estimada para inferencia: debe calcularse como el tamano del fichero GGUF elegido mas el espacio de la cache KV. Los ficheros van de 1,1 GB (Q2_K) a 5,1 GB (f16); en la practica, la VRAM necesaria es el tamano del fichero mas un margen que depende de la longitud de contexto, que no esta documentada.
- GPU de gama alta (A100, H100): no son necesarias para este modelo; estan muy sobredimensionadas para 2,52 mil millones de parametros y solo tendrian sentido en escenarios de mucha concurrencia.
- GPU de gama media (RTX 3060 12 GB, RTX 4070, RTX 4090): cualquier cuantizacion de la lista cabe holgadamente, incluida f16 en tarjetas con 8 GB o mas de VRAM.
- GPU de gama baja (GTX 1650 4 GB, RTX 3050 4 GB): viable con Q4_K_S (1,6 GB), Q4_K_M (1,7 GB) o Q5_K_M (1,9 GB) dejando margen para la cache KV.
- Ejecucion en CPU: viable con todas las cuantizaciones, especialmente Q2_K y Q3_K_S. El repositorio declara el modelo como "on-device" y "local-llm", lo que es coherente con este escenario.
- Opciones de despliegue: llama.cpp y Ollama son las mas directas por tratarse de ficheros GGUF; el autor remite a los README de TheBloke para el uso de GGUF, incluida la concatenacion de ficheros multiparte. Para el modelo base en safetensors se usaria transformers, y para despliegue con servidor, TGI o vLLM sobre el modelo base no cuantizado. No se documenta soporte explicito en vLLM para estas cuantizaciones concretas.
- Latencia y throughput: no disponibles. No se aportan mediciones de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones del modelo base (arquitectura, contexto, datos de entrenamiento), por lo que no es posible establecer una comparacion cuantitativa fiable con alternativas de la misma categoria. La comparacion mas directa y verificable es con el propio modelo base en su formato original:

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| mradermacher/Tholos-2B-GGUF | 2.516.756.480 | no disponible | GGUF (12 cuantizaciones) | apache-2.0 | Repositorio con 636 descargas y 2 likes |
| mertkayacs/Tholos-2B (modelo base) | 2.516.756.480 (mismo modelo) | no disponible | safetensors / transformers | apache-2.0 | Repositorio del autor original |
| Otros modelos pequenos para agentes locales | no disponible | no disponible | no disponible | no disponible | no disponible |

Comparacion con alternativas de terceros (Qwen2.5-3B-Instruct, Llama-3.2-3B-Instruct, Phi-3.5-mini, entre otras): no disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no hay informacion publicada sobre evaluaciones de sesgo, toxicidad o alineacion para este modelo ni para su modelo base.
- Riesgo de alucinacion: no se ha publicado ninguna evaluacion de fidelidad. Con 2,52 mil millones de parametros y un enfoque en trayectorias de agente, la generacion de llamadas a funciones con argumentos incorrectos o inexistentes es un riesgo plausible que debe mitigarse con validacion de esquema y comprobacion de resultados en el lado del orquestador.
- Limitacion de idioma: el unico idioma declarado es el ingles. No hay evidencia de calidad en castellano ni en otros idiomas, por lo que su uso en produccion multilingue requeriria evaluacion previa.
- Longitud de contexto desconocida: no se documenta la ventana de contexto, un dato critico para decidir si el modelo sirve para conversaciones multi-turno o para trayectorias de agente largas.
- Arquitectura y entrenamiento no documentados: no se conocen el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Esto dificulta anticipar el comportamiento fuera de los casos previstos.
- Cuantizaciones de baja calidad: el propio autor marca Q3_K_M como "lower quality", y las cuantizaciones Q2_K y Q3_K_S no llevan nota. Para tareas que dependan de salida estructurada exacta, conviene partir de Q6_K o Q8_0 y medir la tasa de JSON valido antes de bajar de Q4.
- Ausencia de cuantizaciones imatrix: el autor indica que no habia cuantizaciones ponderadas disponibles en el momento de publicacion, lo que limita las opciones de optimizacion de calidad por bit.
- Licencia: Apache 2.0, que permite uso comercial, modificacion y redistribucion, siempre conservando el aviso de licencia y el reconocimiento de autoria. No se declaran restricciones adicionales en la informacion disponible, aunque conviene verificar la licencia del modelo base por si difiriera.
- Repositorio de cuantizacion de terceros: este repositorio no lo mantiene el autor original del modelo, sino un cuantizador independiente. Las actualizaciones del modelo base podrian no reflejarse aqui.
- Fechas de publicacion: los metadatos indican creacion el 2026-10-01 y actualizacion el 2026-10-10. Si esas fechas no concuerdan con el momento de la consulta, procede confirmar la vigencia del repositorio.

## Enlaces

- Repositorio del modelo cuantizado: https://huggingface.co/mradermacher/Tholos-2B-GGUF
- Modelo base: https://huggingface.co/mertkayacs/Tholos-2B
- Dataset declarado: https://huggingface.co/datasets/mertkayacs/tholos-trajectories
- Pagina de resumen y descargas de mradermacher para este modelo: https://hf.tst.eu/model#Tholos-2B-GGUF
- Guia de uso de ficheros GGUF referenciada por el autor: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Pagina de peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de cuantizaciones citado en la model card: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa que da soporte al cuantizador: https://www.nethype.de/
- Resultados de busqueda web: no se ha encontrado ningun enlace relevante sobre el modelo. La unica busqueda devuelta corresponde a un sitio no relacionado (centro de salud materna), por lo que no se incluye como fuente.
