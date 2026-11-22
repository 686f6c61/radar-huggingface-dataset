# mradermacher/Radiant-Dawn-26B-A4B-i1-GGUF

## Resumen

Radiant-Dawn-26B-A4B-i1-GGUF es una cuantizacion en formato GGUF del modelo Radiant-Dawn-26B-A4B, publicada por el usuario mradermacher. El nombre del modelo base sugiere una arquitectura de mezcla de expertos (MoE) con aproximadamente 26.000 millones de parametros totales y unos 4.000 millones de parametros activos por token, aunque no se dispone de documentacion tecnica que lo confirme. El repositorio contiene unicamente los pesos cuantizados generados con la herramienta de cuantizacion de llama.cpp, empleando tanto cuantizaciones ponderadas como con matriz de importancia (imatrix).

El interes de esta publicacion es practico: permite ejecutar un modelo de gran tamano en hardware de consumo mediante compresion de pesos. No obstante, la informacion disponible es muy limitada. El campo de parametros totales reportado en los metadatos (28.444.095) es inconsistente con el nombre del modelo y con el tamano del repositorio (0,1 GB), lo que apunta a que los metadatos estan incompletos o mal poblados. No se han publicado resultados de benchmarks, licencia ni idiomas soportados en la informacion proporcionada.

La relevancia de esta ficha es, por tanto, la de un artefacto de cuantizacion mas que la de un modelo con documentacion completa. Cualquier evaluacion seria del modelo requiere consultar el repositorio del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el nombre sugiere transformer MoE con ~26B totales y ~4B activos) |
| Parametros totales | no disponible (metadatos reportan 28.444.095, inconsistente con el nombre) |
| Parametros activos | no disponible (el sufijo A4B sugiere ~4B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q2_K_S, IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, IQ4_NL (small), Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base en la documentacion proporcionada. El nombre Radiant-Dawn-26B-A4B sugiere una arquitectura de mezcla de expertos con aproximadamente 26.000 millones de parametros totales y alrededor de 4.000 millones activos por token, patron habitual en modelos MoE eficientes en inferencia. No obstante, esta interpretacion no esta confirmada por ninguna fuente del repositorio.

Respecto al entrenamiento, no se han publicado datos sobre volumen de tokens, composicion del dataset, tecnicas de alineacion (RLHF, DPO) ni innovaciones tecnicas. La model card del repositorio de cuantizacion unicamente documenta el proceso de cuantizacion: cuantizaciones ponderadas y con imatrix generadas con la herramienta de llama.cpp, con `quantize_version: 2` y `output_tensor_quantised: 1`. El autor indica que se trata de cuantizaciones del modelo base Sorihon/Radiant-Dawn-26B-A4B.

## Capacidades

- Generacion de texto: capacidad esperada por tratarse de un modelo de lenguaje, aunque no se detalla en la informacion disponible.
- Razonamiento y matematicas: no disponible.
- Generacion de codigo: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision, audio): no disponible.

La unica capacidad verificable es la de inferencia en formato GGUF mediante llama.cpp y sus derivados (Ollama, LM Studio, etc.), derivada del propio formato de publicacion.

## Casos de uso

- Despliegue local en hardware de consumo: las cuantizaciones Q4_K_M e IQ4_XS permiten ejecutar un modelo de ~26B totales en GPUs con 16-24 GB de VRAM, o incluso en CPU con RAM suficiente, usando llama.cpp u Ollama. Es el caso de uso principal de esta publicacion.
- Prototipado e investigacion sin infraestructura cloud: investigadores que quieran evaluar el comportamiento del modelo base sin acceso a GPUs de centro de datos pueden usar las cuantizaciones Q5_K_M o Q6_K para minimizar la perdida de calidad.
- Integracion en aplicaciones de escritorio: el formato GGUF es compatible con LM Studio, Jan y otras interfaces locales, lo que facilita incorporar el modelo en herramientas de escritorio sin dependencias de red.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece un espectro amplio (desde IQ1_S hasta Q6_K), util para estudiar la degradacion de calidad segun el nivel de compresion en un modelo MoE.
- Filtrado y clasificacion de texto en local: con cuantizaciones bajas (Q3_K_M, IQ3_M) el modelo puede ejecutarse en equipos modestos para tareas de clasificacion o extraccion de informacion, siempre que se valide su calidad.
- Fine-tuning ligero sobre cuantizaciones: aunque limitado, es posible usar tecnicas de adaptacion sobre modelos GGUF en entornos con recursos restringidos, si bien la informacion disponible no confirma compatibilidad con herramientas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa basada en el nombre del modelo (~26B totales), las cuantizaciones Q4_K_M e IQ4_XS requeririan del orden de 14-16 GB de VRAM, mientras que Q6_K se aproximaria a 22-24 GB. Estas cifras son estimaciones y no estan confirmadas por el autor.
- GPU recomendadas: no disponible. Por tamano, una RTX 4090 (24 GB) o RTX 3090 (24 GB) podrian alojar cuantizaciones Q4-Q6; GPUs de 16 GB (RTX 4080, 4070 Ti Super) quedarian limitadas a Q3-Q4.
- Cabe en GPU de consumo: probablemente si en el rango Q4 con 24 GB de VRAM, segun la estimacion anterior; no confirmado.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, Jan, y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este tipo de artefactos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables ni datos de rendimiento que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- La informacion tecnica del modelo base es practicamente inexistente en el repositorio: no hay licencia, idiomas, contexto ni benchmarks publicados.
- Los metadatos de parametros totales (28.444.095) son inconsistentes con el nombre del modelo y con el tamano del repositorio (0,1 GB), lo que sugiere metadatos incompletos o erroneos; no deben tomarse como referencia.
- Al ser una cuantizacion, existe degradacion de calidad respecto al modelo original, especialmente en las variantes IQ1, IQ2 y Q2. No se han publicado evaluaciones de esa degradacion.
- Riesgo de alucinacion: no evaluado en la informacion disponible.
- Sesgos conocidos: no disponible.
- Restricciones de licencia para uso comercial: la licencia no esta indicada, por lo que no puede asumirse uso comercial libre. Es imprescindible consultar la licencia del modelo base Sorihon/Radiant-Dawn-26B-A4B antes de cualquier uso en produccion.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- No se debe asumir que el modelo base tenga las capacidades sugeridas por su nombre; cualquier evaluacion debe hacerse contra el repositorio original.

## Enlaces

- Repositorio de cuantizacion: https://huggingface.co/mradermacher/Radiant-Dawn-26B-A4B-i1-GGUF
- Modelo base: https://huggingface.co/Sorihon/Radiant-Dawn-26B-A4B
- Herramienta de cuantizacion (llama.cpp): https://github.com/ggerganov/llama.cpp
