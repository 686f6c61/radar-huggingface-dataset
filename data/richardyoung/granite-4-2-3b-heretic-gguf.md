# richardyoung/granite-4.2-3b-heretic-GGUF

## Resumen

richardyoung/granite-4.2-3b-heretic-GGUF es un conjunto de cuantizaciones GGUF de richardyoung/granite-4.2-3b-heretic, un modelo derivado de ibm-granite/granite-4.2-3b al que se le ha aplicado una ablación de rechazos (abliteration) mediante la herramienta Heretic. El resultado es un modelo de 3,66 mil millones de parámetros con el comportamiento de rechazo parcialmente eliminado: segun la evaluacion del propio autor, conserva 27 rechazos de cada 100 peticiones potencialmente conflictivas, frente al comportamiento alineado del modelo original.

La familia base, IBM Granite 4.2, es una familia densa de modelos de razonamiento en tamanos de 3B, 8B y 30B, con modo de pensamiento (chain-of-thought) integrado y tool calling aumentado con razonamiento. Este repositorio concreto no contiene pesos en precision completa, sino unicamente cuatro ficheros GGUF (Q4_K_M, Q5_K_M, Q6_K y Q8_0) pensados para llama.cpp y Ollama, con un total de 11,8 GB en el repositorio.

Su relevancia practica es doble: por un lado, permite ejecutar un modelo de la familia Granite 4.2 en hardware de consumo con un coste de VRAM de entre 2 y 4 GB; por otro, ofrece una variante sin alineacion de seguridad, util para investigacion sobre robustez, red teaming y generacion de contenido que los modelos alineados rechazan. El repositorio no incluye model card propia mas alla de la tabla de cuantizaciones, y no se han publicado resultados de benchmarks estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con modo de razonamiento (chain-of-thought) heredado de IBM Granite 4.2; detalle de capas, atencion y normalizacion no disponible |
| Parametros totales | 3 659 737 600 (3,66 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 128 000 tokens segun la ficha de LLM Explorer para la variante Heretic; no confirmado en la model card del repositorio |
| Tipos de cuantizacion | GGUF: Q4_K_M, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | no disponible en la model card; una cuantizacion derivada (mradermacher/granite-4.2-3b-Heretic-GGUF) declara 9 idiomas |
| Licencia | no disponible en los metadatos de HuggingFace; la familia base IBM Granite se distribuye bajo Apache 2.0 y las cuantizaciones derivadas de terceros declaran Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); el modelo base sin cuantizar usa safetensors |

## Arquitectura y entrenamiento

El modelo parte de ibm-granite/granite-4.2-3b, un transformer denso de 3,66 B de parametros de la familia Granite 4.2 de IBM. Esta familia se presenta oficialmente como "dense reasoning language model family" con chain-of-thought integrado, modos de pensamiento flexibles y tool calling aumentado con razonamiento. No se dispone de informacion detallada sobre el numero de capas, el tipo de atencion (MHA/GQA), la composicion del dataset de preentrenamiento ni las fases de alineacion (RLHF/DPO) del modelo original en la informacion consultada.

La innovacion tecnica de este repositorio no esta en el entrenamiento, sino en la edicion de representaciones: se aplica un flujo de trabajo tipo Heretic (p-e-w/heretic) que identifica y ablaciona direcciones del espacio de activaciones asociadas al rechazo de peticiones, sin reentrenar los pesos mediante fine-tuning supervisado. Segun la evaluacion incluida en la model card, el modelo editado presenta una divergencia KL de 0,0846 respecto del original, lo que indica una modificacion relativamente contenida de la distribucion de salidas, y mantiene 27 rechazos de cada 100 peticiones evaluadas. El autor publica informacion de reproducibilidad en el directorio `reproduce` del repositorio del modelo sin cuantizar.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat compatible con llama.cpp y Ollama.
- Razonamiento con chain-of-thought heredado de la familia Granite 4.2, incluyendo modos de pensamiento configurables en el modelo base (el grado de conservacion de esta capacidad tras la ablacion no ha sido medido publicamente).
- Tool calling / function calling aumentado con razonamiento, segun la documentacion de IBM para Granite 4.2; su comportamiento en la variante ablacionada no esta verificado.
- Generacion de codigo y tareas de transformacion de texto basicas, limitadas por el tamano de 3 B de parametros.
- Soporte de agentes multi-paso: teoricamente posible por el tool calling de la familia base, aunque sin evaluacion publicada sobre esta variante.
- Capacidades multilingues: no confirmadas en la model card; una cuantizacion derivada declara soporte para 9 idiomas.
- Reduccion del comportamiento de rechazo: util para generar contenido que el modelo original declinaria, con un 27 % de rechazos residuales segun la evaluacion del autor.
- Sin capacidades de vision ni audio: se trata de un modelo exclusivamente de texto.

## Casos de uso

- Red teaming y evaluacion de seguridad: permite generar ataques, prompts adversarios y contenido problematico controlado para medir la robustez de clasificadores y filtros de moderacion, sin las interrupciones constantes de un modelo alineado.
- Generacion de ficcion y narrativa adulta: escritura creativa de relatos con tematicas violentas, oscuras o sexuales que otros modelos rechazan, ejecutable en local sin enviar el texto a servicios externos.
- Investigacion sobre ablacion y edicion de representaciones: sirve como caso de estudio reproducible (divergencia KL 0,0846, 27/100 rechazos) para comparar tecnicas de abliteration frente a fine-tuning con DPO o RLHF.
- Asistente local en portatil o equipo sin GPU dedicada: con la cuantizacion Q4_K_M (unos 2,2 GB) se puede ejecutar en CPU con llama.cpp u Ollama manteniendo una ventana de contexto amplia gracias a los 128 000 tokens atribuidos a la variante.
- Generacion de datos sinteticos para entrenamiento: produccion de pares instruccion-respuesta en dominios donde los modelos alineados se niegan a responder, utiles para aumentar datasets de clasificacion o de moderacion.
- Clasificacion y extraccion de informacion en pipelines por lotes: con Q8_0 (unos 3,9 GB) se puede servir en una GPU de consumo y procesar documentos extensos en una sola pasada de contexto sin troceado agresivo.
- Prototipado rapido de aplicaciones conversacionales: integrable mediante `ollama run richardyoung/granite-4.2-3b-heretic` para iterar sobre prompts y plantillas antes de escalar a un modelo mayor de la familia Granite.
- Analisis de contenido sensible en ciencias sociales: procesamiento de corpus con discurso violento, extremista o explicito donde el rechazo del modelo interfiriria con la anotacion automatizada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, GSM8K, HumanEval u otros). La unica evaluacion incluida es la metrica de ablacion proporcionada por el autor:

| Metrica (evaluacion Heretic) | Valor |
|---|---|
| Divergencia KL respecto al modelo original | 0,0846 |
| Rechazos | 27/100 |

Se trata de metricas del proceso de ablacion, no de rendimiento en tareas. No hay datos comparativos frente al modelo base sin editar.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos): Q4_K_M en torno a 2,2 GB; Q5_K_M en torno a 2,7 GB; Q6_K en torno a 3,0 GB; Q8_0 en torno a 3,9 GB. Los valores son coherentes con el tamano total del repositorio (11,8 GB) y deben considerarse estimaciones calculadas a partir del numero de parametros.
- Memoria adicional para la cache KV: no disponible. Con contextos de hasta 128 000 tokens el consumo crece de forma significativa y depende de la configuracion de atencion del modelo base.
- GPU recomendadas: cualquier GPU con 6 GB o mas de VRAM puede alojar las cuantizaciones Q4_K_M y Q5_K_M, incluidas RTX 3060, RTX 4060, RTX 2060, GTX 1660 Super o superiores. Q8_0 requiere alrededor de 5-6 GB con contexto moderado.
- Cabe en GPU de consumo: si. Es ejecutable incluso en CPU con llama.cpp o en equipos integrados con 8 GB de RAM usando Q4_K_M.
- Opciones de despliegue: llama.cpp, Ollama (tag por defecto Q4_K_M), LM Studio, koboldcpp, llama-cpp-python y servidores compatibles con la API de OpenAI. La compatibilidad con vLLM y TGI para GGUF es limitada y no esta documentada en este repositorio.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| richardyoung/granite-4.2-3b-heretic-GGUF | 3,66 B | 128 000 tokens (no confirmado) | no disponible en metadatos; familia base Apache 2.0 | Variante ablacionada, solo GGUF, 27/100 rechazos, KL 0,0846 (datos de esta ficha) |
| richardyoung/granite-4.2-3b-heretic | 3,66 B | igual que el base | no disponible | Modelo sin cuantizar del que derivan estos GGUF; incluye carpeta de reproducibilidad |
| mradermacher/granite-4.2-3b-Heretic-GGUF | 3,66 B | no disponible | Apache 2.0 | Cuantizacion alternativa del mismo linaje Heretic; declara 9 idiomas |
| ibm-granite/granite-4.2-3b | 3,66 B | 128 000 tokens para la familia Granite 4.2 | Apache 2.0 | Modelo original alineado, con modo de razonamiento y tool calling; sin ablacionar |
| Llama 3.2 3B | 3,21 B | 128 000 tokens | Llama 3.2 Community License | Alternativa generalista de tamano similar con alineacion intacta |
| Qwen2.5 3B | 3,09 B | 32 000 tokens (extensible a 128 000) | Apache 2.0 | Alternativa generalista de tamano similar, con buen rendimiento en codigo y matematicas |
| Gemma 3 4B | 4 B | 128 000 tokens | Gemma Terms of Use | Alternativa de tamano similar con capacidades multimodales |

Los datos de contexto y licencia de las familias alternativas corresponden a su documentacion oficial y no han sido verificados en la busqueda realizada para esta ficha.

## Limitaciones y advertencias

- La ablacion elimina parcialmente el comportamiento de rechazo, pero no lo suprime por completo: persiste un 27 % de rechazos segun la evaluacion del autor.
- El modelo puede generar contenido ofensivo, violento, sexual o ilegal sin advertencia. No es adecuado para aplicaciones de cara al publico sin una capa de moderacion externa.
- La edicion de representaciones puede degradar capacidades no medidas: no hay evaluacion publica de razonamiento, codigo o matematicas tras la ablacion, y la divergencia KL de 0,0846 implica un cambio real en la distribucion de salidas.
- Riesgo elevado de alucinacion por el tamano de 3 B de parametros, especialmente en tareas de conocimiento factual, matematicas complejas y cadenas de razonamiento largas.
- El soporte multilingue no esta confirmado en la model card; la atribucion de 9 idiomas proviene de una cuantizacion derivada y no se ha verificado sobre estos ficheros.
- La licencia no figura en los metadatos de HuggingFace. Aunque la familia base es Apache 2.0 y las cuantizaciones derivadas de terceros declaran esa misma licencia, conviene verificar los terminos antes de un uso comercial.
- El repositorio solo contiene pesos cuantizados en GGUF; no hay safetensors en este repositorio, por lo que no se puede hacer fine-tuning directo ni servir con frameworks que requieran pesos en precision completa.
- Modelo exclusivamente de texto: no procesa imagenes ni audio.
- Los ficheros GGUF de este repositorio no tienen documentacion sobre el proceso de cuantizacion (herramienta, version, metadatos incrustados).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validacion de la comunidad sobre la calidad de las cuantizaciones.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/richardyoung/granite-4.2-3b-heretic-GGUF
- Modelo base sin cuantizar: https://huggingface.co/richardyoung/granite-4.2-3b-heretic
- Carpeta de reproducibilidad: https://huggingface.co/richardyoung/granite-4.2-3b-heretic/tree/main/reproduce
- Modelo original de IBM: https://huggingface.co/ibm-granite/granite-4.2-3b
- Documentacion de la familia Granite 4.2: https://www.ibm.com/granite/docs/models/granite4-2
- Herramienta Heretic: https://github.com/p-e-w/heretic
- Cuantizacion alternativa (mradermacher): https://huggingface.co/mradermacher/granite-4.2-3b-Heretic-GGUF
- Variante Heretic de tinyopsec: https://huggingface.co/tinyopsec/granite-4.2-3b-Heretic
- Ficha en LLM Explorer: https://llm-explorer.com/model/tinyopsec%2Fgranite-4.2-3b-Heretic,5FrvyUnKYPi1PQoygNP8cR
