# mradermacher/Keural-Cortex-8B-v1.0-GGUF

## Resumen

Keural-Cortex-8B-v1.0-GGUF es una colección de cuantizaciones en formato GGUF del modelo mkd-ai/Keural-Cortex-8B-v1.0, publicada por el usuario mradermacher, conocido por distribuir versiones cuantizadas de modelos abiertos para su uso con llama.cpp y derivados. El modelo base es un transformer de 8.190.735.360 parámetros (aproximadamente 8,19 mil millones) etiquetado por su autor como orientado a generación de texto conversacional, function calling y flujos de agentes, con soporte declarado de inglés (en) y coreano (ko) y licencia Apache 2.0.

El repositorio no contiene pesos originales, sino doce ficheros GGUF con distintos niveles de compresión, desde Q2_K (3,4 GB) hasta f16 (16,5 GB), lo que permite desplegar el modelo tanto en GPU de consumo con 6-8 GB de VRAM como en configuraciones de servidor. Además, se ofrece una variante con cuantización ponderada tipo imatrix en un repositorio separado (-i1-GGUF), pensada para mejorar la calidad en niveles de bits bajos.

La relevancia de esta ficha es práctica: permite a un desarrollador elegir el equilibrio entre tamaño, velocidad y fidelidad para un modelo de 8B con funciones de tool calling y agentes, sin necesidad de reproducir el proceso de cuantización. Hay que señalar que la model card no documenta arquitectura interna, longitud de contexto, composición del dataset de entrenamiento ni resultados de benchmarks, y que el modelo base apenas tiene tracción pública (el repositorio GGUF registra 0 descargas y 0 "likes" en el momento de la consulta), por lo que la validación empírica por terceros es inexistente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no especifica el tipo de transformer; el recuento de parametros del modelo base, 8.190.735.360, corresponde a un modelo denso de ~8B) |
| Parametros totales | 8.190.735.360 (8,19 mil millones) |
| Parametros activos | no disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Estaticas: f16 (16,5 GB), Q8_0 (8,8 GB), Q6_K (6,8 GB), Q5_K_M (6,0 GB), Q5_K_S (5,8 GB), Q4_K_M (5,1 GB), Q4_K_S (4,9 GB), IQ4_XS (4,7 GB), Q3_K_L (4,5 GB), Q3_K_M (4,2 GB), Q3_K_S (3,9 GB), Q2_K (3,4 GB). Variante adicional con cuantizacion ponderada/imatrix en mradermacher/Keural-Cortex-8B-v1.0-i1-GGUF |
| Idiomas soportados | ingles (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp y derivados); el modelo base mkd-ai/Keural-Cortex-8B-v1.0 se distribuye en formato transformers/safetensors |
| Tamano del repositorio | 73,4 GB (suma de todos los ficheros GGUF) |
| Modelo base | mkd-ai/Keural-Cortex-8B-v1.0 |
| Cuantizado por | mradermacher (cuantizacion estatica, quantize_version 2, output_tensor_quantised 1) |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna del modelo base en la informacion proporcionada. La model card del repositorio GGUF se limita a describir el proceso de cuantizacion y no incluye detalles sobre el transformer subyacente, el mecanismo de atencion, el numero de capas ni el tipo de normalizacion. Tampoco se documenta si emplea atencion completa, atencion lineal o algun esquema hibrido.

Respecto al entrenamiento, se desconoce por completo la composicion del dataset, el numero de tokens procesados y si se aplicaron tecnicas de alineacion como RLHF, DPO o SFT sobre datos de instrucciones. Las unicas etiquetas que aportan contexto funcional son "conversational", "function-calling" y "agent", lo que sugiere que el modelo base fue ajustado para seguir instrucciones y emitir llamadas a herramientas, pero no constituye evidencia tecnica sobre el pipeline de entrenamiento. En cuanto a la innovacion tecnica documentada, esta se limita al propio proceso de cuantizacion: cuantizacion estatica con cuantizacion de tensores de salida (output_tensor_quantised 1) y una variante adicional con imatrix, que usa una matriz de importancia calculada con un corpus de calibracion para reducir la perdida de calidad en cuantizaciones de pocos bits.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del modelo base.
- Soporte declarado de function calling / tool calling, lo que permite integracion con APIs externas mediante esquemas de herramientas.
- Orientacion a flujos de agente, con posible razonamiento en varios pasos y encadenamiento de llamadas a herramientas.
- Bilinguismo ingles-coreano, sin soporte declarado de castellano ni de otros idiomas.
- Generacion de texto general: no hay datos especificos publicados sobre rendimiento en codigo, matematicas o razonamiento logico.
- No se documentan capacidades multimodales (vision, audio) ni modos de razonamiento explicito tipo "thinking mode".
- No se documenta soporte de relleno intermedio (fill-in-the-middle) ni de embeddings.

## Casos de uso

- Agentes de automatizacion en coreano e ingles: el modelo puede actuar como planificador en un bucle de agente, emitiendo llamadas a funciones estructuradas que el orquestador ejecuta contra APIs internas. Su tamano de 8B permite ejecutarlo en local sin depender de un proveedor externo.
- Asistentes conversacionales desplegados en el borde: con la cuantizacion Q4_K_M (5,1 GB) el modelo cabe en una GPU de consumo o incluso en un portatil con GPU integrada de gama alta, lo que habilita asistentes de escritorio sin conexion.
- Chatbot de atencion al cliente en mercados coreano-parlantes: al soportar en y ko de forma nativa, evita el coste y la latencia de un paso de traduccion previo en despliegues dirigidos a Corea del Sur.
- Prototipado rapido de herramientas CLI: mediante llama.cpp u Ollama se puede levantar un servidor compatible con la API de OpenAI en minutos y validar un flujo de tool calling antes de invertir en infraestructura mayor.
- Clasificacion y extraccion de informacion con salida estructurada: el modelo puede rellenar plantillas JSON a partir de texto libre, aprovechando su entrenamiento orientado a llamadas de funciones.
- Investigacion academica sobre cuantizacion: la disponibilidad de doce niveles de cuantizacion del mismo modelo base (de Q2_K a f16) permite medir experimentalmente la degradacion de calidad frente al tamano, comparando cuantizaciones estaticas con las ponderadas del repositorio i1-GGUF.
- Generacion de respuestas en pipeline de bajo coste: al ser Apache 2.0, se puede integrar en productos comerciales sin obligacion de compartir el codigo del servicio que lo consume.
- Fine-tuning posterior sobre GGUF: aunque el formato no es el ideal para reentrenar, el modelo base en safetensors puede ajustarse con LoRA y volver a cuantizarse despues con el mismo flujo de mradermacher.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio GGUF no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el modelo base carece de datos de evaluacion citados en la informacion proporcionada. Tampoco se ofrece la matriz de perplejidad comparativa entre los distintos niveles de cuantizacion, mas alla del grafico generico de referencia sobre tipos de cuantizacion de llama.cpp enlazado en la propia model card.

## Requisitos de hardware

- VRAM minima estimada para inferencia con contexto corto (cifras calculadas a partir del tamano de los pesos; hay que sumar el cache KV, cuyo tamano no puede estimarse sin conocer la longitud de contexto y el numero de capas):
  - Q2_K: 3,4 GB de pesos, aproximadamente 4-5 GB de VRAM totales.
  - Q3_K_S / Q3_K_M / Q3_K_L: 3,9-4,5 GB de pesos, aproximadamente 5-6 GB de VRAM totales.
  - IQ4_XS / Q4_K_S / Q4_K_M: 4,7-5,1 GB de pesos, aproximadamente 5,5-7 GB de VRAM totales.
  - Q5_K_S / Q5_K_M: 5,8-6,0 GB de pesos, aproximadamente 7-8 GB de VRAM totales.
  - Q6_K: 6,8 GB de pesos, aproximadamente 8-9 GB de VRAM totales.
  - Q8_0: 8,8 GB de pesos, aproximadamente 10-11 GB de VRAM totales.
  - f16: 16,5 GB de pesos, aproximadamente 18-20 GB de VRAM totales.
- GPU recomendadas: para f16 o Q8_0, tarjetas de 24 GB o mas (RTX 3090, RTX 4090, L40S) o datacenter (A100 40/80 GB, H100). Para Q4_K_M y superiores con contexto moderado, cualquier GPU de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- Cabe en GPU de consumo: si. Las cuantizaciones Q2_K a Q4_K_M son viables en GPUs de 6-8 GB; Q5 y Q6 requieren 8-12 GB; Q8_0 y f16 exigen 12-24 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp, text-generation-webui. vLLM soporta carga de GGUF aunque con caracter experimental; TGI no ofrece soporte nativo de GGUF. Para CPU y configuraciones hibridas CPU+GPU, llama.cpp es la via natural dado el formato de los pesos.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo para ninguna de las cuantizaciones, ni en la model card ni en los resultados de busqueda.

## Comparativa con modelos similares

Los datos de terceros que aparecen a continuacion provienen de las model cards publicas de cada proyecto y no de la informacion proporcionada en esta ficha; deben verificarse antes de tomar decisiones de produccion. No se dispone de comparativas de rendimiento (benchmarks) para ninguno de ellos en el contexto de esta ficha.

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Keural-Cortex-8B-v1.0 (GGUF) | 8,19B | no disponible | en, ko | Apache 2.0 | GGUF (12 niveles) | Cuantizaciones estaticas e imatrix; sin benchmarks publicados |
| Llama 3.1 8B Instruct | 8B | 128k segun su model card | multilingue (8 idiomas declarados) | Llama 3.1 Community License | safetensors, GGUF (terceros) | Ecosistema amplio, benchmarks publicos por Meta |
| Qwen2.5 7B Instruct | 7,6B | 128k segun su model card | multilingue (29 idiomas declarados) | Apache 2.0 | safetensors, GGUF (terceros) | Buen soporte de tool calling y de lenguas asiaticas |
| EXAONE 3.5 7.8B Instruct | 7,8B | 32k segun su model card | en, ko | Licencia propia de EXAONE (uso comercial restringido) | safetensors | Alternativa especifica para coreano-ingles de LG AI Research |

## Limitaciones y advertencias

- Ausencia total de evaluacion: no hay benchmarks, ni matriz de perplejidad por cuantizacion, ni comparacion con el modelo en f16. Es imposible cuantificar la degradacion introducida por cada nivel de compresion sin medirla uno mismo.
- Traccion nula: 0 descargas y 0 "likes" en el repositorio en el momento de la consulta, lo que implica que practicamente nadie ha validado el comportamiento del modelo en produccion.
- Idiomas limitados: solo ingles y coreano. No hay soporte declarado de castellano, por lo que su uso en espanol dara resultados de calidad desconocida y probablemente degradada.
- Sesgos desconocidos: al no documentarse la composicion del dataset de entrenamiento ni el proceso de alineacion, no se puede anticipar que tipo de sesgos (demograficos, culturales, geopoliticos) puede reproducir el modelo.
- Riesgo de alucinacion: inherente a los modelos generativos de este tamano, y agravado por la falta de evaluacion en tareas de fidelidad factual. En escenarios de tool calling, una llamada mal formada o un argumento inventado puede propagarse aguas abajo.
- Cuantizaciones agresivas: los niveles Q2_K y Q3_K_S reducen el modelo a 3,4-3,9 GB y suelen producir degradaciones notables en coherencia, seguimiento de instrucciones y formato de salida JSON. La propia model card marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- Longitud de contexto no documentada: no se puede planificar un caso de uso con conversaciones largas ni estimar la VRAM del cache KV.
- Licencia: el repositorio GGUF es Apache 2.0, lo que permite uso comercial. No obstante, conviene verificar que el modelo base mkd-ai/Keural-Cortex-8B-v1.0 no imponga restricciones adicionales derivadas de sus propios datos de entrenamiento o de pesos heredados de otro modelo.
- Fecha de publicacion: los metadatos indican creacion y actualizacion el 23 de septiembre de 2026, dato que conviene contrastar con el estado real del repositorio.
- Resultados de busqueda no concluyentes: las consultas web realizadas no devolvieron informacion relevante sobre el modelo, su autor ni su proceso de entrenamiento; los resultados obtenidos eran de tematica completamente ajena.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Keural-Cortex-8B-v1.0-GGUF
- Modelo base: https://huggingface.co/mkd-ai/Keural-Cortex-8B-v1.0
- Cuantizaciones ponderadas/imatrix: https://huggingface.co/mradermacher/Keural-Cortex-8B-v1.0-i1-GGUF
- Pagina resumen de descargas del cuantizador: https://hf.tst.eu/model#Keural-Cortex-8B-v1.0-GGUF
- Preguntas frecuentes y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de ficheros GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de tipos de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
