# mradermacher/Hades-4B-Abliterated-i1-GGUF

## Resumen

Hades-4B-Abliterated-i1-GGUF es un repositorio de cuantizaciones en formato GGUF publicado por mradermacher sobre el modelo Pluto-AI-Labs/Hades-4B-Abliterated. Se trata, por tanto, de una redistribución optimizada para inferencia local de un modelo de aproximadamente 4.000 millones de parámetros, no de un modelo entrenado desde cero. Las etiquetas del repositorio lo sitúan en la familia Qwen3 y lo describen como "abliterated" y "soft-refusal", es decir, un modelo al que se le han eliminado o atenuado las direcciones de rechazo del espacio de activaciones para reducir la tendencia a negarse a responder determinadas peticiones.

El autor de las cuantizaciones es mradermacher, que aplica su pipeline i1 (imatrix) para generar versiones de pesos con distintos niveles de compresión, desde IQ1_S hasta Q6_K. Además del repositorio i1, existe un repositorio paralelo de cuantizaciones estáticas (mradermacher/Hades-4B-Abliterated-GGUF). El propósito de estos artefactos es permitir ejecutar el modelo en hardware de consumo mediante llama.cpp y derivados como Ollama o LM Studio.

La relevancia de esta ficha es limitada y conviene ser explícito: el repositorio no incluye una model card técnica del modelo original, no publica resultados de benchmarks, no documenta el dataset de entrenamiento ni el proceso de abliteración, y en el momento de la consulta figura con 0 descargas y 0 "likes". Es un artefacto de investigación experimental, en inglés y con licencia Apache 2.0, orientado a experimentación sobre comportamiento de rechazo más que a despliegues de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only, familia Qwen3 segun las etiquetas del repositorio; detalles de capas, atencion y normalizacion no disponibles |
| Parametros totales | Etiquetado como 4B en el nombre del modelo; el campo safetensors del repositorio indica 958.716 (cifra incompleta o no representativa; el repositorio no contiene pesos en safetensors) |
| Parametros activos | No aplica: no hay indicios de que sea un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); en el repositorio solo aparece listado el fichero imatrix de 0,1 GB, con un tamano total de repo de 0,0 GB en el momento de la consulta |

Datos adicionales del repositorio: autor mradermacher, libreria declarada transformers, modelo base Pluto-AI-Labs/Hades-4B-Abliterated, creado el 19 de septiembre de 2026 y actualizado el mismo dia, 0 descargas y 0 likes.

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del modelo. Lo unico que puede afirmarse con certeza es que se trata de un modelo derivado de Pluto-AI-Labs/Hades-4B-Abliterated, que las etiquetas lo asocian a la familia Qwen3 y que su nombre indica un tamano de aproximadamente 4.000 millones de parametros, con una arquitectura transformer decoder-only propia de esa familia. No se documentan numero de capas, dimension de embeddings, numero de cabezas de atencion, tipo de atencion ni si incorpora mecanismos adicionales como atencion lineal o decodificacion especulativa.

Respecto al entrenamiento, no hay informacion sobre el numero de tokens, la composicion del dataset, el uso de RLHF, DPO u otras tecnicas de alineamiento. La etiqueta "abliterated" indica que el modelo base ha sufrido un proceso de ablacion de direcciones de rechazo, probablemente mediante tecnicas de direccionamiento en el espacio de activaciones (por ejemplo, subtraction de direcciones calculadas con pares de prompts contrastivos), pero el procedimiento concreto no se detalla. La etiqueta "soft-refusal" sugiere que el resultado no elimina por completo el comportamiento de rechazo, sino que lo atenua, manteniendo respuestas parciales en lugar de negativas categoricas. El repositorio en si no aporta entrenamiento nuevo: solo aplica cuantizacion con matrices de importancia (imatrix) sobre los pesos del modelo base.

## Capacidades

- Generacion de texto en ingles: es la funcion principal esperada de un modelo de 4B de la familia Qwen3, aunque no hay validacion publicada en este repositorio.
- Razonamiento y matematicas: capacidad plausible por familia, sin datos de benchmark que la respalden.
- Generacion de codigo: capacidad plausible por familia, sin datos publicados.
- Reduccion del comportamiento de rechazo: la caracteristica diferencial del modelo es la ablacion de rechazos, con un perfil descrito como "soft-refusal" en lugar de negativa total.
- Multilingue: no; el modelo declara unicamente ingles como idioma soportado.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Modo agente o razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision, audio o modalidades adicionales: no disponible; no hay indicios de soporte multimodal.
- Modo "thinking" explicito: no disponible, aunque es una caracteristica habitual en la familia Qwen3 que no puede confirmarse aqui.

## Casos de uso

- Investigacion sobre alineamiento y rechazo: el uso mas coherente con la naturaleza del artefacto es estudiar como varia la tasa de rechazo y la calidad de respuesta entre las distintas cuantizaciones (de IQ1_S a Q6_K) y respecto al modelo base sin abliterar. Permite medir cuanto del comportamiento de seguridad sobrevive a la ablacion y a la compresion de pesos.
- Evaluacion de degradacion por cuantizacion agresiva: comparar Q2_K o IQ1_M frente a Q5_K_M o Q6_K sobre el mismo conjunto de prompts permite cuantificar la perdida de coherencia en modelos pequenos, donde los niveles bajos de bits suelen degradar notablemente la calidad.
- Generacion de texto creativo y experimental en ingles: con licencia Apache 2.0 y cuantizaciones ligeras, puede ejecutarse localmente para prototipos de escritura asistida sin restricciones de filtrado estrictas.
- Clasificacion y etiquetado de texto en ingles: tareas de extraccion de entidades, categorizacion o resumen resumido son viables en un modelo de 4B cuando se despliega con vLLM o llama.cpp en una unica GPU.
- Automatizacion de tareas de procesamiento por lotes: al caber en GPUs de consumo incluso en Q6_K, es util para procesar grandes volumenes de prompts en local sin coste de API, siempre que el contenido generado se revise.
- Base para fine-tuning experimental: el formato GGUF no es el adecuado para reentrenar, pero el modelo base Pluto-AI-Labs/Hades-4B-Abliterated si podria servir como punto de partida para ajustes con LoRA en ingles, sujeto a la licencia Apache 2.0.
- Demostraciones educativas sobre inferencia local: sirve para ilustrar el flujo completo de descarga de cuantizaciones GGUF, carga en llama.cpp u Ollama y comparacion de rendimiento entre niveles de cuantizacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

Las cifras de VRAM que se indican a continuacion son estimaciones derivadas del tamano de parametros y del tipo de cuantizacion, no datos publicados por el autor:

- Q2_K / IQ2_M / IQ1_S: aproximadamente 1,5-2,0 GB de VRAM o RAM; apto para CPUs modestas y GPUs integradas.
- Q4_K_M / IQ4_XS: aproximadamente 2,5-3,0 GB; cabe en RTX 3060 12 GB, RTX 4060, RTX 4070, Apple Silicon con 8 GB o mas.
- Q5_K_M / Q6_K: aproximadamente 3,5-4,5 GB; cabe en RTX 4090, RTX 3090, A100, H100 y en Apple Silicon a partir de 16 GB.
- Inferencia en precision completa o FP16 (fuera del alcance de este repositorio): en torno a 8 GB de VRAM para un modelo de 4B, lo que exigiria GPU de gama alta o cuantizacion de 8 bits.
- GPU recomendadas: cualquier GPU con 8 GB o mas para cuantizaciones de 4 a 6 bits; H100 o A100 solo tienen sentido para despliegues con muchos usuarios concurrentes.
- Si cabe en GPU de consumo: si, en la practica totalidad de cuantizaciones disponibles.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, KoboldCpp y servidores compatibles con GGUF. vLLM y TGI no son las rutas naturales para GGUF, aunque admiten pesos completos si se dispone de ellos.
- Latencia y throughput estimados: no disponibles; dependen enteramente del hardware, del nivel de cuantizacion y del backend.

Advertencia operativa: en el momento de la consulta el repositorio aparece con un tamano de 0,0 GB y solo lista el fichero imatrix, por lo que conviene verificar que los ficheros GGUF concretos estan efectivamente disponibles antes de planificar un despliegue.

## Comparativa con modelos similares

Los datos de referencia de los modelos alternativos no proceden de la informacion proporcionada y deben verificarse en sus repositorios oficiales antes de tomar decisiones.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|
| Hades-4B-Abliterated (i1 GGUF) | ~4B (nombre) | No disponible | Apache 2.0 | GGUF en HuggingFace, cuantizaciones i1 y estaticas | No disponible |
| Qwen3-4B | ~4B | No disponible en esta ficha | Apache 2.0 | Pesos completos y GGUF de terceros | No disponible en esta ficha |
| Llama-3.2-3B-Instruct | ~3B | No disponible en esta ficha | Llama 3.2 Community License (con restricciones) | Pesos completos y GGUF oficiales | No disponible en esta ficha |
| Phi-4-mini-instruct | ~3,8B | No disponible en esta ficha | MIT | Pesos completos y GGUF de terceros | No disponible en esta ficha |

La diferencia principal de Hades-4B-Abliterated frente a cualquiera de estas alternativas no es el rendimiento, sino la ablacion de rechazos y la licencia Apache 2.0, mas permisiva que la de Llama 3.2. A cambio, carece de evaluaciones publicadas que permitan situarlo en la misma tabla que los modelos oficiales.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay MMLU, HumanEval, GSM8K ni ninguna otra metrica publicada para este modelo o su base, lo que impide estimar su calidad real.
- Model card practicamente vacia: no se documenta el proceso de cuantizacion mas alla de la lista de tipos, ni el dataset, ni el metodo de ablacion, ni los hiperparametros.
- Seguridad alineada eliminada o degradada: la ablacion de rechazos implica que el modelo puede generar contenido que un modelo alineado rechazaria, incluyendo material ofensivo, inseguro o potencialmente danino. No es apto para aplicaciones de cara al publico sin filtros externos.
- Riesgo elevado de alucinacion: un modelo de ~4B cuantizado, especialmente en niveles IQ1/IQ2/Q2, tiende a inventar hechos con frecuencia; las cuantizaciones mas agresivas agravan este comportamiento.
- Limitacion idiomatica: solo ingles declarado; el rendimiento en castellano no esta garantizado ni evaluado.
- Longitud de contexto desconocida: no se puede planificar un caso de uso con documentos largos sin verificarla experimentalmente.
- Sesgos: no hay evaluacion de sesgos disponible; los sesgos heredados del modelo base y de su dataset, desconocido, persisten y pueden verse amplificados por la ablacion.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, tamano de repo de 0,0 GB y un unico fichero listado (imatrix). La disponibilidad efectiva de las cuantizaciones debe comprobarse.
- Licencia: Apache 2.0 permite uso comercial y modificacion, pero la licencia no exime de responsabilidad sobre el contenido generado ni de las obligaciones legales aplicables en el territorio de despliegue.
- Caveat de produccion: no se recomienda su uso en sistemas de atencion al cliente, salud, finanzas, educacion o cualquier dominio regulado sin una capa de moderacion externa y una evaluacion propia.

## Enlaces

- Repositorio GGUF i1: https://huggingface.co/mradermacher/Hades-4B-Abliterated-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Hades-4B-Abliterated-GGUF
- Modelo base: https://huggingface.co/Pluto-AI-Labs/Hades-4B-Abliterated
- Fichero imatrix: https://huggingface.co/mradermacher/Hades-4B-Abliterated-i1-GGUF/resolve/main/Hades-4B-Abliterated.imatrix.gguf
- Pagina de resumen de descargas del autor: https://hf.tst.eu/model#Hades-4B-Abliterated-i1-GGUF
- Preguntas frecuentes y peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
- README de referencia de TheBloke sobre uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Notas de Artefact2 sobre tipos de cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Grafico comparativo de perplejidad por cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- nethype GmbH: https://www.nethype.de/
