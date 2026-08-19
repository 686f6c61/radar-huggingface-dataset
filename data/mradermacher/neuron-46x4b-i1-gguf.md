# mradermacher/Neuron-46x4B-i1-GGUF

## Resumen

Este repositorio contiene la cuantizacion GGUF con imatrix del modelo Neuron-46x4B-Instruct, desarrollado por Neura Tech AI y cuantizado por mradermacher. El nombre del modelo sugiere una arquitectura de mezcla de expertos (MoE) con 46 expertos de 4.000 millones de parametros cada uno, lo que implicaria un total aproximado de 184.000 millones de parametros, aunque esta cifra no esta confirmada en la documentacion disponible. Este repositorio en particular solo incluye el archivo imatrix (Neuron-46x4B.imatrix.gguf, 0,2 GB) destinado a generar cuantizaciones personalizadas de alta calidad; las cuantizaciones estaticas listas para usar se publican en el repositorio hermano Neuron-46x4B-GGUF.

El modelo base soporta 25 idiomas, entre ellos ingles, chino, hindi, arabe, japones, coreano, frances, aleman, espanol, portugues, italiano, ruso, turco, vietnamita, tailandes, indonesio, malayo, bengali, urdu, tamil, telugu, marathi, gujarati, punjabi y persa. Se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones significativas. La relevancia de este repositorio radica en que proporciona el archivo de calibracion imatrix necesario para que los desarrolladores generen sus propias cuantizaciones optimizadas del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (inferida del nombre "46x4B", no confirmada en la documentacion) |
| Parametros totales | no disponible (el nombre sugiere ~184B: 46 expertos x 4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | imatrix (este repo); Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (repo estatico) |
| Idiomas soportados | 25: en, zh, hi, ar, ja, ko, fr, de, es, pt, it, ru, tr, vi, th, id, ms, bn, ur, ta, te, mr, gu, pa, fa |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (archivo imatrix) |

Nota: el dato de "25.109.532 parametros" que aparece en los metadatos de HuggingFace corresponde al archivo imatrix de calibracion, no al modelo completo. El modelo base se aloja en Neura-Tech-AI/Neuron-46x4B.

## Arquitectura y entrenamiento

La arquitectura exacta del modelo base no esta documentada en la informacion disponible. El nombre "Neuron-46x4B" sugiere una arquitectura de mezcla de expertos (MoE) con 46 expertos de 4.000 millones de parametros cada uno, siguiendo la convencion de nomenclatura de modelos como Mixtral-8x7B. En una arquitectura MoE tipica, solo un subconjunto de expertos se activa por token durante la inferencia, lo que permite un coste computacional muy inferior al que corresponderia a sus parametros totales.

No se dispone de informacion sobre el dataset de entrenamiento, el numero de tokens procesados, ni si se aplicaron tecnicas de RLHF, DPO o similar. Tampoco se documentan innovaciones tecnicas especificas del modelo base. El repositorio actual es exclusivamente una publicacion de cuantizacion: mradermacher ha generado el archivo imatrix mediante el proceso de importance matrix, que calcula estadisticas de activacion de pesos sobre un corpus de calibracion para optimizar la asignacion de bits en cuantizaciones de baja precision.

## Capacidades

- Generacion de texto multilingue: el modelo base declara soporte para 25 idiomas, lo que lo habilita para tareas de generacion, traduccion y comprension en un amplio espectro linguistico.
- Razonamiento y comprension: al ser un modelo de la familia instruct, esta optimizado para seguir instrucciones y responder a consultas en formato conversacional.
- Capacidad de cuantizacion flexible: gracias al archivo imatrix incluido, los desarrolladores pueden generar cuantizaciones personalizadas (Q2_K, Q4_K_M, Q6_K, IQ-series, etc.) adaptadas a sus requisitos de memoria y calidad.
- Compatibilidad con el ecosistema GGUF: el formato GGUF permite ejecutar el modelo con llama.cpp, Ollama, LM Studio y otros motores de inferencia local.
- No se documentan capacidades especificas de tool calling, function calling, vision, audio o modo de razonamiento extendido en la informacion disponible.

## Casos de uso

- Cuantizacion personalizada para despliegue en produccion: el archivo imatrix permite a los equipos generar cuantizaciones a medida del modelo Neuron-46x4B, ajustando el equilibrio entre precision y uso de VRAM segun el hardware disponible en su infraestructura.
- Inferencia local en entornos con recursos limitados: mediante las cuantizaciones estaticas del repositorio hermano (Q4_K_M, Q5_K_M, Q6_K), el modelo puede ejecutarse en estaciones de trabajo con GPUs de consumo, reduciendo los requisitos de memoria frente al modelo en precision completa.
- Asistente conversacional multilingue: con soporte para 25 idiomas, el modelo puede desplegarse como chatbot o asistente virtual en mercados con poblacion diversa, cubriendo desde ingles y chino hasta lenguas como bengali, urdu o persa.
- Traduccion automatica entre pares de idiomas de bajo recurso: la cobertura de idiomas como tamil, telugu, marathi, gujarati o punjabi lo hace util para traduccion en contextos donde los modelos comerciales ofrecen cobertura limitada.
- Generacion de contenido localizado: el modelo puede producir textos en multiples idiomas para campanas de marketing, documentacion tecnica o contenido editorial dirigido a audiencias regionales.
- Prototipado rapido de aplicaciones NLP: gracias a la licencia Apache 2.0 y al formato GGUF, los desarrolladores pueden integrar el modelo en aplicaciones de prueba de concepto sin coste de licencia y con despliegue local mediante Ollama o llama.cpp.
- Investigacion academica sobre modelos MoE multilingues: el modelo base, al ser de codigo abierto, permite estudiar el comportamiento de arquitecturas de mezcla de expertos en tareas multilingues sin restricciones de uso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estandar para el modelo base Neuron-46x4B ni para sus cuantizaciones.

## Requisitos de hardware

- Este repositorio en concreto solo contiene el archivo imatrix (0,2 GB), que no requiere GPU para su uso; se emplea como entrada para herramientas de cuantizacion como llama.cpp.
- Para el modelo cuantizado completo, los requisitos dependen de la cuantizacion elegida y del tamano real del modelo, que no esta confirmado. Si el modelo tiene ~184B parametros totales, una cuantizacion Q4_K_M requeriria aproximadamente 100-110 GB de VRAM, lo que exige GPUs de clase enterprise como A100 80GB (en configuracion multi-GPU), H100 o similar.
- Las cuantizaciones de menor precision (Q2_K, IQ2_M, IQ1_M) podrian reducir los requisitos a 50-70 GB, aun fuera del alcance de GPUs de consumo como la RTX 4090 (24 GB).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp y cualquier motor compatible con GGUF. Para despliegue en servidor con mayor concurrencia, podria emplearse vLLM si se convierte el modelo a formato compatible, aunque no se documenta soporte explicito.
- La latencia y el throughput dependen del hardware y la cuantizacion; no se dispone de datos medidos.

## Comparativa con modelos similares

No disponible. No se dispone de especificaciones confirmadas del modelo base Neuron-46x4B (parametros reales, contexto, rendimiento) que permitan una comparacion rigurosa con alternativas como Mixtral-8x7B, Qwen MoE o DeepSeek MoE. El nombre sugiere una arquitectura MoE de gran tamano, pero sin datos confirmados no es posible establecer una comparativa fiable.

## Limitaciones y advertencias

- El tamano real del modelo, el numero de parametros activos y la longitud de contexto no estan documentados; cualquier especificacion al respecto es inferencia a partir del nombre y no debe tomarse como dato confirmado.
- Este repositorio no contiene los pesos del modelo cuantizado, solo el archivo imatrix. Los usuarios que busquen cuantizaciones listas para usar deben acudir al repositorio Neuron-46x4B-GGUF.
- No se han publicado evaluaciones de sesgos, alucinacion o calidad de generacion para este modelo; se recomienda realizar pruebas especificas antes de usarlo en produccion.
- El soporte de 25 idiomas no implica la misma calidad en todos ellos; es probable que el rendimiento sea superior en idiomas con mas representacion en el corpus de entrenamiento, aunque no se dispone de datos al respecto.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar que el modelo base (Neura-Tech-AI/Neuron-46x4B) mantiene la misma licencia y que no existen restricciones adicionales en los datos de entrenamiento.
- Al tratarse de un modelo MoE de gran tamano, los requisitos de hardware para inferencia en precision completa son elevados; las cuantizaciones agresivas (Q2_K, IQ1_M) pueden degradar significativamente la calidad de las respuestas.

## Enlaces

- Repositorio actual (imatrix): https://huggingface.co/mradermacher/Neuron-46x4B-i1-GGUF
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Neuron-46x4B-GGUF
- Repositorio del modelo base: https://huggingface.co/Neura-Tech-AI/Neuron-46x4B
- Repositorio del modelo instruct base: https://huggingface.co/mradermacher/Neuron-46x4B-Instruct-i1-GGUF
- Guia de uso de archivos GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Pagina de peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Analisis de cuantizaciones IQ (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
