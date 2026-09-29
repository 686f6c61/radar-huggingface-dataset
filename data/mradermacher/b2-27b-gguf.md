# mradermacher/B2-27B-GGUF

## Resumen
B2-27B-GGUF es un repositorio de cuantizaciones en formato GGUF del modelo schneewolflabs/B2-27B, generado y publicado por mradermacher, un autor conocido en HuggingFace por producir versiones comprimidas de modelos abiertos para inferencia local. El modelo original cuenta con 27.320.697.856 parametros (aproximadamente 27,3 mil millones) y esta publicado bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Este repositorio no introduce cambios en los pesos mas alla de la cuantizacion: su proposito es hacer viable la ejecucion del modelo en hardware de consumo y en servidores con VRAM limitada.

El modelo base esta etiquetado en HuggingFace con los descriptores agents, tool-use, reasoning y qwen3.8, y fue afinado sobre los datasets schneewolflabs/Geselle y schneewolflabs/Vorsicht-DPO (este ultimo, por su nombre, orientado a alineamiento mediante DPO). Esto situa a B2-27B en la categoria de modelos conversacionales orientados a agentes y uso de herramientas, con capacidades declaradas de razonamiento multi-paso.

La relevancia practica de este repositorio es doble: por un lado, ofrece once variantes de cuantizacion que cubren desde 11,0 GB (Q2_K) hasta 29,1 GB (Q8_0), lo que permite desplegar un modelo de 27B en GPUs de 16 GB, 24 GB o 48 GB segun la calidad que se priorice; por otro, la licencia Apache 2.0 elimina las fricciones legales habituales de otros modelos de tamano similar. El autor tambien publica una variante con cuantizacion ponderada por imatrix en el repositorio mradermacher/B2-27B-i1-GGUF.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio base esta etiquetado como qwen3.8, lo que sugiere linaje de la familia Qwen, sin confirmacion documental) |
| Parametros totales | 27.320.697.856 (aproximadamente 27,3 mil millones) |
| Parametros activos | no procede (no hay indicios de que sea un modelo de mezcla de expertos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (este repositorio); el modelo base schneewolflabs/B2-27B se distribuye en safetensors |

## Arquitectura y entrenamiento
No se dispone de informacion detallada sobre la arquitectura interna en la documentacion proporcionada. El repositorio base incluye la etiqueta qwen3.8, que apunta a una arquitectura transformer de la familia Qwen, pero no hay confirmacion explicita en la model card. Tampoco se especifican el numero de capas, la dimension del modelo, el numero de cabezas de atencion ni el tipo de atencion empleado. Lo que si es verificable es el recuento de parametros (27.320.697.856) y el hecho de que el autor de las cuantizaciones no ha aplicado ninguna modificacion estructural: el proceso ha sido de conversion a formato GGUF y compresion de tensores.

En cuanto al entrenamiento, la model card del modelo base declara el uso de dos datasets: schneewolflabs/Geselle, presumiblemente un corpus de ajuste supervisado, y schneewolflabs/Vorsicht-DPO, que por su nomenclatura corresponde a una fase de optimizacion por preferencias directas (DPO). Esta combinacion es coherente con las etiquetas agents, tool-use y reasoning: el modelo habria sido ajustado no solo para conversar, sino para emitir llamadas a herramientas y encadenar pasos de razonamiento. No se especifica el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases adicionales de RLHF. El proceso de cuantizacion de mradermacher se ha realizado mediante conversion a formato HF y posterior generacion de los distintos niveles de compresion, con las variantes de mayor calidad (Q6_K y Q8_0) marcadas como de calidad muy buena y mejor calidad respectivamente.

## Capacidades
- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento multi-paso, segun la etiqueta reasoning declarada por el autor del modelo base.
- Uso de herramientas y function calling, segun la etiqueta tool-use.
- Comportamiento orientado a agentes, segun la etiqueta agents.
- Ajuste mediante DPO sobre el dataset Vorsicht-DPO, lo que indica alineamiento con preferencias humanas.
- Soporte de cuantizaciones de 2 a 8 bits mediante llama.cpp y derivados.
- Capacidades multimodales: no disponible.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Soporte de audio o vision: no disponible.
- Cobertura multilingue: limitada al ingles segun el campo language de la model card.

## Casos de uso
- Agentes autonomos con llamada a herramientas: las etiquetas tool-use y agents del modelo base indican que ha sido ajustado para emitir llamadas a funciones estructuradas. Se puede integrar como planificador en un bucle de agente que consulte APIs, bases de datos o servicios internos, usando la cuantizacion Q4_K_M en una GPU de 24 GB.
- Asistente conversacional desplegado en local: al distribuirse en GGUF con variantes desde 11 GB, es posible ejecutar el modelo en estaciones de trabajo sin conexion a servicios en la nube, lo que resulta adecuado para entornos con requisitos estrictos de confidencialidad de datos.
- Razonamiento sobre documentacion tecnica en ingles: el modelo esta entrenado exclusivamente en ingles, por lo que encaja en pipelines de analisis de documentacion, resumen de informes y extraccion de conclusiones a partir de textos largos en ese idioma.
- Prototipado rapido de aplicaciones de IA generativa: la licencia Apache 2.0 y la disponibilidad de once niveles de cuantizacion permiten experimentar con distintos equilibrios entre calidad y consumo de recursos sin coste de licencia.
- Backend de agentes para automatizacion de tareas de oficina: combinado con un framework de orquestacion, el modelo puede gestionar cadenas de pasos (leer un documento, extraer datos, invocar una herramienta de escritura) gracias a su entrenamiento orientado a razonamiento y uso de herramientas.
- Evaluacion comparativa de tecnicas de cuantizacion: al existir once variantes del mismo modelo, resulta util como banco de pruebas para medir el impacto de la compresion en la perplejidad y en la calidad de las respuestas, tal como sugiere el grafico de perplejidad enlazado por el autor.
- Servicio de generacion de texto autoalojado: con llama.cpp o vLLM es posible servir el modelo en un nodo con GPU A100 o H100 y exponer una API compatible con OpenAI, segun la etiqueta endpoints_compatible del repositorio.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio de cuantizaciones no incluye tablas de MMLU, HumanEval, GSM8K ni metricas equivalentes, ni para el modelo base ni para las versiones cuantizadas. El unico dato de rendimiento indirecto es el grafico de perplejidad de ikawrakow enlazado por el autor, que compara tipos de cuantizacion entre si (no modelos) y no aporta valores numericos en la informacion proporcionada.

## Requisitos de hardware
Los tamanos de archivo indicados por el autor permiten estimar la VRAM necesaria, anadiendo entre 1 y 3 GB adicionales para el contexto y las estructuras de inferencia:

- Q2_K (11,0 GB): viable en GPUs de 12 GB (RTX 3060 12 GB) con contexto reducido, y comodo en 16 GB (RTX 4060 Ti 16 GB, RTX 4070 Ti Super).
- Q3_K_S (12,4 GB), Q3_K_M (13,6 GB), Q3_K_L (14,7 GB): ajustan en GPUs de 16 GB.
- IQ4_XS (15,5 GB) y Q4_K_S (15,9 GB): recomendadas por el autor por su velocidad; encajan en 16 GB con margen limitado y son comodas en 24 GB.
- Q4_K_M (16,9 GB): la opcion marcada como rapida y recomendada; requiere 24 GB (RTX 3090, RTX 4090) para funcionar con contexto amplio.
- Q5_K_S (19,1 GB) y Q5_K_M (19,6 GB): requieren 24 GB.
- Q6_K (22,5 GB): calidad muy buena segun el autor; ajusta al limite en 24 GB y con holgura en 32 GB o 48 GB (A6000, L40S, A100 40 GB).
- Q8_0 (29,1 GB): la de mejor calidad y mayor velocidad relativa dentro de su rango; necesita 32 GB o mas, por lo que requiere A100 40 GB, A100 80 GB, H100 o configuraciones multi-GPU.
- Cabe en GPU de consumo: si, desde la variante Q2_K en 12 GB hasta Q6_K en 24 GB. La Q8_0 no es viable en GPUs de consumo de una sola unidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, llama-cpp-python, text-generation-webui y servidores compatibles con la API de OpenAI. Para vLLM existe soporte experimental de GGUF, aunque no esta garantizado para todas las variantes de cuantizacion.
- Latencia y throughput estimados: no disponible. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna de las variantes.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Datos de rendimiento |
|---|---|---|---|---|---|
| mradermacher/B2-27B-GGUF | 27,3 mil millones | no disponible | apache-2.0 | GGUF | no disponible |
| mradermacher/B2-27B-i1-GGUF | 27,3 mil millones (mismo modelo base) | no disponible | apache-2.0 | GGUF con cuantizacion imatrix | no disponible |
| mradermacher/SOCIUM-AI-27B-i1-GGUF | 27 mil millones (aproximado, segun nombre) | no disponible | no disponible | GGUF | no disponible |
| mradermacher/UI-Mate-27B-i1-GGUF | 27 mil millones (aproximado, segun nombre) | no disponible | apache-2.0 | GGUF | no disponible |

La comparacion se limita a modelos del mismo orden de magnitud publicados por el mismo autor de cuantizaciones, ya que la informacion disponible no incluye datos verificables de parametros, contexto o rendimiento de alternativas externas. UI-Mate-27B se orienta a agentes de interfaz grafica con capacidades de vision y lenguaje, un perfil funcional distinto al de B2-27B, que apunta a agentes textuales con uso de herramientas. No se dispone de informacion suficiente para comparar el rendimiento efectivo entre ellos.

## Limitaciones y advertencias
- Idioma: el campo language de la model card declara unicamente ingles. El rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera inferior.
- Sesgos conocidos: no disponible. No se ha publicado ninguna evaluacion de sesgo, toxicidad o equidad para este modelo ni para su base.
- Riesgo de alucinacion: no cuantificado. No se han publicado evaluaciones de fidelidad factual ni tasas de alucinacion.
- Perdida de calidad por cuantizacion: las variantes de 2 y 3 bits (Q2_K, Q3_K_S y especialmente Q3_K_M, marcada por el autor como de menor calidad) degradan la perplejidad de forma apreciable. Para uso en produccion se recomienda Q4_K_M o superior.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, modificacion y redistribucion sin obligacion de publicar derivados, siempre que se conserve el aviso de licencia y se indique los cambios realizados.
- Longitud de contexto desconocida: al no documentarse la ventana de contexto, no es posible garantizar el comportamiento en conversaciones largas o en tareas de recuperacion sobre documentos extensos.
- Ausencia de benchmarks: no existen datos publicos de MMLU, HumanEval, GSM8K ni de rendimiento en tareas de agente, lo que impide validar las capacidades declaradas en las etiquetas antes de un despliegue en produccion.
- Procedencia del ajuste: se desconoce la composicion exacta de los datasets Geselle y Vorsicht-DPO, lo que dificulta evaluar la cobertura tematica y los posibles sesgos heredados.
- Modelo base poco documentado: la model card del repositorio de cuantizaciones es generica y remite al modelo original; no se detallan hiperparametros, regimen de entrenamiento ni arquitectura.

## Enlaces
- Repositorio de cuantizaciones: https://huggingface.co/mradermacher/B2-27B-GGUF
- Cuantizaciones ponderadas por imatrix: https://huggingface.co/mradermacher/B2-27B-i1-GGUF
- Modelo base: https://huggingface.co/schneewolflabs/B2-27B
- Dataset de ajuste: https://huggingface.co/datasets/schneewolflabs/Geselle
- Dataset de DPO: https://huggingface.co/datasets/schneewolflabs/Vorsicht-DPO
- Pagina de resumen del autor para este modelo: https://hf.tst.eu/model#B2-27B-GGUF
- Peticiones y preguntas frecuentes sobre cuantizaciones: https://huggingface.co/mradermacher/model_requests
- Guia de uso de archivos GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa responsable de la infraestructura de cuantizacion: https://www.nethype.de/
