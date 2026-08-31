# ApolloRaines/Llama-3.3-8B-Instruct-128K-Jbliterated

## Resumen

Llama-3.3-8B-Instruct-128K-Jbliterated es un modelo de lenguaje de 8.030 millones de parámetros desarrollado por ApolloRaines, basado en el modelo shb777/Llama-3.3-8B-Instruct-128K, que a su vez es una extensión de contexto de Llama 3.3 8B Instruct de Meta. La principal innovación es la aplicación de la técnica "Jbliteration", un método de ablación geométrica sobre las 32 capas del transformer que elimina el subespacio de rechazo (refusal subspace) del modelo, dando como resultado un asistente que no produce rechazos ante peticiones que el modelo original consideraría inapropiadas.

El modelo mantiene la ventana de contexto de 128.000 tokens y el soporte multilingüe del original (ocho idiomas), pero con una política de respuesta sin censura. Está pensado para desarrolladores e investigadores que necesitan un modelo de 8B con contexto largo y sin restricciones de contenido, aunque su uso conlleva riesgos éticos y legales importantes. La licencia es la Llama 3.1 Community License, que permite uso comercial con condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 3.3) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 128.000 tokens |
| Tipos de cuantizacion | no disponible (el modelo base se distribuye en bfloat16; se puede cuantizar a int8/int4 con herramientas externas) |
| Idiomas soportados | en, de, fr, it, pt, hi, es, th |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (tambien incluye tokenizer.json y configuracion) |

## Arquitectura y entrenamiento

El modelo parte de shb777/Llama-3.3-8B-Instruct-128K, que es una version de Llama 3.3 8B Instruct con la ventana de contexto extendida a 128K tokens mediante interpolacion de posiciones. Sobre esta base, ApolloRaines aplica la tecnica Jbliteration, que consiste en una descomposicion geometrica del subespacio de rechazo del modelo y su posterior ablacion en las 32 capas. El proceso se describe como un "pipeline multi-fase" que refina la separacion entre respuestas genuinas y rechazos, sin anadir entrenamiento adicional sobre datos etiquetados.

No se proporcionan detalles sobre el dataset de entrenamiento, el numero de tokens utilizados ni si se emplearon tecnicas como RLHF o DPO. La modificacion es puramente estructural sobre los pesos del modelo base, y el autor afirma que es resistente a la reactivacion del rechazo mediante fine-tuning posterior. El modelo se distribuye en bfloat16.

## Capacidades

- Generacion de texto y conversacion multi-turno en ocho idiomas (ingles, aleman, frances, italiano, portugues, hindi, espanol y tailandes).
- Ventana de contexto de 128K tokens, adecuada para documentos largos, transcripciones o historiales de conversacion extensos.
- Ausencia de rechazos ante peticiones que el modelo original consideraria inapropiadas o peligrosas (segun el benchmark Heretic, 0 rechazos genuinos en 100 prompts).
- Tratamiento uniforme de todas las formulaciones de un mismo tema, sin "compliance falsa" ni evasivas.
- Compatible con el pipeline de transformers de Hugging Face y con el framework DeepswapLLM para ejecucion en GPUs con poca memoria.
- No se documentan capacidades de tool calling, agentes, vision ni audio.

## Casos de uso

- Generacion de ficcion y narrativa sin restricciones: escritores y creadores de contenido pueden explorar temas tabu o controvertidos sin que el modelo interrumpa la generacion con avisos de seguridad, gracias a la eliminacion del subespacio de rechazo.
- Analisis de documentos legales o academicos extensos: la ventana de 128K tokens permite procesar contratos, tesis o informes completos en una sola pasada, extrayendo resumenes o respondiendo preguntas sobre el contenido.
- Asistente de escritura creativa para guiones y novelas: el modelo puede mantener el tono y la coherencia a lo largo de capitulos largos, sin perder el hilo argumental, y sin autocensurarse en escenas violentas o sexuales.
- Chatbot para comunidades especializadas (por ejemplo, foros de debate sobre temas politicos o religiosos): al no rechazar preguntas incomodas, puede mantener conversaciones profundas y continuadas sobre temas que otros modelos evitarian.
- Procesamiento de transcripciones de reuniones o entrevistas largas: con 128K de contexto, se pueden resumir horas de audio transcrito en un solo prompt, identificando acuerdos, desacuerdos y acciones.
- Investigacion en seguridad de IA: el modelo sirve como caso de estudio para analizar como la ablacion de subespacios afecta al comportamiento de rechazo, y para probar tecnicas de red-team en entornos controlados.

## Benchmarks y rendimiento

El unico benchmark reportado es el de rechazos, basado en el conjunto de prompts de Heretic (mlabonne/harmful_behaviors test split, primeros 100 prompts):

| Metrica | Resultado |
|---|---|
| Rechazos totales | 2/100 (ambos falsos positivos por coincidencia de palabras clave) |
| Rechazos genuinos | 0/100 |

No se han publicado resultados de benchmarks estandar como MMLU, HumanEval, GSM8K o MT-Bench en la informacion disponible. Tampoco hay datos de latencia o throughput.

## Requisitos de hardware

- El modelo en bfloat16 ocupa aproximadamente 16 GB de VRAM (8.03B parametros x 2 bytes). Con cuantizacion int8 se reduce a unos 8 GB, y con int4 a unos 4 GB, aunque no se proporcionan archivos GGUF oficiales.
- GPU recomendadas: para inferencia en bfloat16 se necesita una GPU con al menos 16 GB (por ejemplo, RTX 4090, A100 40GB, H100). Con cuantizacion int4 puede ejecutarse en GPUs de 6-8 GB como RTX 3060 o RTX 4060.
- El autor recomienda el uso de DeepswapLLM, un framework que transmite capas entre GPU, RAM y disco, permitiendo ejecutar el modelo en GPUs con menos de 4 GB de VRAM sin cuantizacion, con un rendimiento hasta 4 veces superior a AirLLM.
- Opciones de despliegue: al ser un modelo Llama, es compatible con vLLM, llama.cpp, Ollama y TGI, aunque no hay configuraciones predefinidas publicadas. Se puede cargar con transformers usando device_map="auto".
- No se dispone de datos de latencia o throughput medidos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Rechazo | Idiomas |
|---|---|---|---|---|---|
| Llama-3.3-8B-Instruct-128K-Jbliterated | 8.03B | 128K | Llama 3.1 | Sin rechazo (0/100) | 8 |
| Llama 3.1 8B Instruct | 8.03B | 128K | Llama 3.1 | Con rechazo estandar | 8 |
| Mistral 7B Instruct v0.3 | 7.3B | 32K | Apache 2.0 | Con rechazo estandar | 5 |

La principal diferencia con Llama 3.1 8B Instruct es la eliminacion del rechazo; el resto de caracteristicas (arquitectura, contexto, idiomas) son identicas. Frente a Mistral 7B, ofrece el doble de contexto y mas idiomas, pero con una licencia mas restrictiva y sin garantias de rendimiento en tareas estandar.

## Limitaciones y advertencias

- El modelo ha sido disenado para no rechazar peticiones, lo que incluye contenido potencialmente peligroso, ilegal o eticamente cuestionable. Su uso en produccion sin salvaguardas adicionales puede generar responsabilidades legales y danos reputacionales.
- No se han evaluado sesgos sociales ni alucinaciones en este modelo concreto; al derivar de Llama 3.3, hereda los sesgos del modelo base, que pueden amplificarse al no existir filtros de seguridad.
- La ventana de 128K tokens puede degradar la calidad de las respuestas en contextos muy largos, aunque no se han publicado mediciones de "lost in the middle".
- La licencia Llama 3.1 Community License permite uso comercial, pero exige que los modelos derivados incluyan la atribucion "Built with Llama" y que no se utilicen para ciertos fines restringidos (por ejemplo, mejorar otros modelos de lenguaje grandes sin autorizacion).
- El metodo Jbliteration no esta documentado academicamente; no hay papers ni evaluaciones independientes que verifiquen las afirmaciones del autor sobre la resistencia al fine-tuning o la precision de la ablacion.
- El modelo solo soporta los ocho idiomas listados; el espanol esta incluido, pero la calidad en idiomas distintos del ingles puede ser inferior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ApolloRaines/Llama-3.3-8B-Instruct-128K-Jbliterated
- Repositorio de archivos: https://huggingface.co/ApolloRaines/Llama-3.3-8B-Instruct-128K-Jbliterated/tree/main
- Modelo base: https://huggingface.co/shb777/Llama-3.3-8B-Instruct-128K
- Framework DeepswapLLM: https://github.com/apolloraines/DeepswapLLM
- Benchmark Heretic: https://github.com/p-e-w/heretic
- Analisis de seguridad de Palo Alto Networks: https://insights-db.paloaltonetworks.com/models/ApolloRaines/Llama-3.3-8B-Instruct-128K-Jbliterated/ff79faa096dac6d9272166805c0d33819d0fb977/overview
