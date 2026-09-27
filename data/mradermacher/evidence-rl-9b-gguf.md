# mradermacher/Evidence-RL-9B-GGUF

## Resumen

Evidence-RL-9B-GGUF es un repositorio de cuantizaciones en formato GGUF generado por mradermacher a partir del modelo hhj-ai/Evidence-RL-9B. No se trata por tanto de un modelo entrenado por el autor del repositorio, sino de una distribucion optimizada para inferencia local de un modelo ajeno: mradermacher se limita a convertir los pesos originales (safetensors) a GGUF y a producir distintas variantes de cuantizacion. El modelo base es un VLM (vision-language model) de aproximadamente 8.950 millones de parametros, con licencia Apache 2.0 y entrenado con tecnicas de aprendizaje por refuerzo (GRPO) segun los metadatos declarados.

La relevancia de este repositorio es fundamentalmente practica: el modelo original en safetensors ocupa un espacio considerable y requiere GPUs con suficiente VRAM, mientras que las versiones GGUF permiten ejecutarlo en hardware de consumo mediante llama.cpp, Ollama o LM Studio. Ademas, el repositorio incluye los ficheros `mmproj` necesarios para habilitar la parte de vision, algo imprescindible en modelos multimodales y que no siempre se distribuye junto a las cuantizaciones.

Se trata de un repositorio muy reciente (creado en septiembre de 2026) y con un historial de uso nulo en el momento de redactar esta ficha (0 descargas, 0 likes). La model card es la plantilla automatica habitual de mradermacher y no aporta informacion sobre arquitectura interna, dataset de entrenamiento, longitud de contexto ni resultados de benchmarks, por lo que buena parte de los apartados siguientes quedan marcados como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (los tags indican modelo multimodal causal de tipo vision-language con entrenamiento por refuerzo) |
| Parametros totales | 8.953.803.264 (aprox. 8,95 mil millones), dato procedente de los safetensors del modelo base |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | f16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K; mas mmproj en f16 y Q8_0 para la torre de vision |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base esta en safetensors) |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo base. Los tags del repositorio (`multimodal`, `vlm`, `vision-language`, `causal-inference`) permiten afirmar que se trata de un modelo causal con capacidad de procesar imagenes ademas de texto, y los tags `reinforcement-learning` y `grpo` indican que el modelo base fue sometido a un proceso de ajuste mediante Group Relative Policy Optimization, una variante de RLHF/RLVR popularizada por DeepSeek. No consta el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases previas de SFT o DPO.

Tampoco se especifica la torre de vision empleada, la resolucion de imagen soportada, ni la estrategia de proyeccion multimodal. El pipeline declarado en HuggingFace es `reinforcement-learning`, lo que es coherente con el sufijo "RL" del nombre del modelo base (Evidence-RL-9B), pero no aporta detalles tecnicos adicionales. En el lado de la cuantizacion, el repositorio sigue el flujo habitual de mradermacher: conversion desde el formato HuggingFace, cuantizacion estatica (sin imatrix) y publicacion de los ficheros `mmproj` por separado para no romper la parte multimodal.

## Capacidades

- Generacion de texto conversacional en ingles, con formato compatible con plantillas de chat (`conversational` en los tags).
- Procesamiento de imagenes: el modelo es un VLM, por lo que admite entradas de vision junto a texto. Requiere cargar el fichero `mmproj` correspondiente para funcionar.
- Razonamiento orientado a evidencia: el nombre del modelo base ("Evidence-RL") sugiere entrenamiento con recompensas centradas en el uso y evaluacion de evidencia, aunque no hay documentacion que lo confirme.
- Inferencia causal: el tag `causal-inference` aparece explicitamente en los metadatos.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al ingles segun el campo `language`.
- Modos especiales (thinking, audio, etc.): no disponible.

## Casos de uso

- Analisis de documentos con imagenes: el modelo puede recibir capturas, diagramas o paginas escaneadas junto a una pregunta en texto y generar una respuesta combinada, gracias a su naturaleza vision-language. Es adecuado para extraccion de informacion de informes tecnicos o articulos cientificos.
- Asistente conversacional local en ingles: al disponer de cuantizaciones desde 3,9 GB, puede desplegarse en un portatil con GPU de gama media para mantener conversaciones multi-turno sin enviar datos a servicios externos.
- Verificacion de afirmaciones con evidencia visual: dado el enfasis del modelo base en evidencia y en inferencia causal, encaja en flujos donde hay que contrastar una hipotesis con imagenes o capturas de soporte.
- Prototipado de agentes multimodales en investigacion: util para experimentar con pipelines de razonamiento que combinan texto e imagen en entornos academicos donde no se dispone de GPUs de datacenter.
- Generacion de descripciones y resumenes de contenido visual: catalogacion de imagenes, resumenes de graficos o descripcion de figuras para accesibilidad.
- Evaluacion comparativa de tecnicas de RL en vision-language: al ser un modelo ajustado con GRPO publicado en abierto, sirve como punto de partida reproducible para estudiar el efecto del RL en tareas multimodales.
- Despliegue en entornos con requisitos de privacidad: la licencia Apache 2.0 y la disponibilidad en GGUF permiten ejecutarlo en infraestructura propia, incluyendo entornos aislados sin conexion a internet.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los resultados de busqueda consultados incluyen cifras de MMLU, HumanEval, GSM8K, MMMU, DocVQA ni de ninguna otra evaluacion para este modelo.

## Requisitos de hardware

Las cifras de VRAM siguientes son estimaciones derivadas del tamano de los ficheros GGUF publicados, suponiendo que el modelo completo se carga en memoria de GPU:

- f16 (18,0 GB): requiere aproximadamente 18-20 GB solo para los pesos, mas el fichero `mmproj` (1,0 GB) y la cache KV. Necesita una GPU de 24 GB (RTX 3090, RTX 4090, A5000) como minimo.
- Q8_0 (9,6 GB): entorno a 10-12 GB con mmproj y contexto moderado. Cabe en RTX 4080, RTX 3090, RTX 4090, L4 o A10G.
- Q6_K (7,5 GB): aproximadamente 8-10 GB. Adecuado para RTX 3060 de 12 GB, RTX 4070, RTX 4060 Ti de 16 GB.
- Q5_K_M (6,6 GB) y Q5_K_S (6,4 GB): en torno a 7-9 GB. Cabe en GPUs de 8-12 GB.
- Q4_K_M (5,7 GB) y Q4_K_S (5,5 GB): aproximadamente 6-8 GB. Es la opcion recomendada por el autor para uso general; viable en RTX 3060, RTX 4060, RTX 2070 y similares.
- IQ4_XS (5,3 GB): similar al anterior con menor huella, aunque el rendimiento de las variantes IQ depende del backend.
- Q3_K_L (5,0 GB), Q3_K_M (4,7 GB), Q3_K_S (4,4 GB): entre 5 y 7 GB con contexto. Utilizables en GPUs de 6-8 GB, con perdida de calidad perceptible.
- Q2_K (3,9 GB): la opcion mas ligera; el propio autor no la marca como recomendada y la degradacion de calidad suele ser notable.
- El fichero `mmproj-Q8_0` (0,7 GB) o `mmproj-f16` (1,0 GB) es obligatorio para la parte de vision y hay que sumarlo al presupuesto de memoria.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y cualquier runtime compatible con GGUF. Para servir el modelo en produccion con mayor throughput seria necesario acudir al repositorio original en safetensors y a motores como vLLM o TGI, ya que estos no consumen GGUF de forma nativa.
- Latencia y throughput: no disponibles. Dependen del ancho de banda de memoria de la GPU y de la longitud de contexto, que no se ha publicado.

## Comparativa con modelos similares

No hay datos de rendimiento publicados para este modelo, por lo que no es posible establecer una comparativa cuantitativa fiable. Como referencia cualitativa, dentro del catalogo del propio mradermacher existen otras cuantizaciones de modelos de aproximadamente 9B con orientacion multimodal o de edicion, como `mradermacher/EdiTikZ-9B-RL-GGUF` y `mradermacher/MiMo-Ornith-9B-AGSI-i1-GGUF`, pero tampoco se dispone de parametros de contexto, benchmarks o arquitectura detallada para ellos en la informacion consultada.

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento |
|---|---|---|---|---|---|
| Evidence-RL-9B-GGUF | 8,95 B | No disponible | Apache 2.0 | GGUF | No disponible |
| hhj-ai/Evidence-RL-9B (base) | 8,95 B | No disponible | Apache 2.0 | safetensors | No disponible |
| EdiTikZ-9B-RL-GGUF | No disponible | No disponible | Apache 2.0 | GGUF | No disponible |
| MiMo-Ornith-9B-AGSI-i1-GGUF | No disponible (del orden de 9 B) | No disponible | Apache 2.0 | GGUF | No disponible |

## Limitaciones y advertencias

- Modelo unicamente en ingles: no hay evidencia de soporte para castellano ni otros idiomas, por lo que su uso en produccion multilingue exigiria evaluacion previa.
- No se ha publicado informacion sobre sesgos, datos de entrenamiento ni procesos de alineacion, lo que impide auditar el comportamiento del modelo en dominios sensibles.
- Riesgo de alucinacion no cuantificado: al no existir evaluaciones, no hay forma de estimar la tasa de respuestas incorrectas, especialmente en tareas de razonamiento sobre evidencia visual.
- La cuantizacion degrada la calidad respecto al modelo original, de forma mas acusada en Q3_K_S, Q3_K_M y Q2_K. El autor solo marca explicitamente como recomendados Q4_K_S y Q4_K_M.
- Las cuantizaciones publicadas son estaticas; no se han publicado versiones con imatrix, que suelen ofrecer mejor relacion calidad/tamano.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad ni informes de errores.
- Aunque la licencia Apache 2.0 permite uso comercial, conviene verificar la licencia y las condiciones del modelo base `hhj-ai/Evidence-RL-9B`, ya que el repositorio GGUF hereda las restricciones del original.
- Para usar la funcionalidad de vision es imprescindible cargar el fichero `mmproj`; si se omite, el modelo funcionara degradado o fallara en entradas de imagen segun el runtime.
- No se dispone de informacion sobre la longitud de contexto soportada, dato critico para dimensionar la cache KV y planificar el despliegue.
- No se han publicado medidas de latencia ni throughput en ningun hardware concreto.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Evidence-RL-9B-GGUF
- Modelo base: https://huggingface.co/hhj-ai/Evidence-RL-9B
- Pagina de resumen y descargas del autor para este modelo: https://hf.tst.eu/model#Evidence-RL-9B-GGUF
- Perfil de mradermacher en HuggingFace: https://huggingface.co/mradermacher
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Empresa del autor: https://www.nethype.de/
