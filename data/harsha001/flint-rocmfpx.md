# Harsha001/flint-ROCmFPX

## Resumen

Flint es un modelo de lenguaje de tipo mezcla de expertos (MoE) desarrollado por RecursiveSI, orientado especificamente a agentes de programacion. Con 39.785.323.896 parametros totales y aproximadamente 2.500 millones de parametros activos por token, ofrece una relacion capacidad-coste computacional poco habitual en su rango: la mayor parte del peso reside en 256 expertos pequenos por capa, mientras que el resto de componentes (atencion, experto compartido, capas densas iniciales y capa de salida) apenas suma unos 2.000 millones de parametros.

La ficha que nos ocupa no es el modelo original, sino una cuantizacion del mismo realizada por el usuario Harsha001 bajo el formato ROCmFPX, un fork de llama.cpp que incorpora tipos de peso de baja precision optimizados para GPU AMD (Vulkan y HIP/ROCm), con especial atencion al hardware Strix Halo. El paquete incluye variantes de 8, 6 y 4 bits, con tamanos que van de 41,1 GB a 22,1 GB, y esta pensado para ejecutar el modelo en equipos con memoria unificada de 128 GB.

Su relevancia actual radica en dos factores: por un lado, demuestra que es posible llevar un MoE de casi 40.000 millones de parametros a un unico equipo de sobremesa con GPU AMD integrada; por otro, introduce una tecnica de escalado por tensor (factor de potencia de dos almacenado como tensor `.scale`) que corrige la perdida de precision que sufre ROCmFPX con pesos de magnitud muy baja, como los de este modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) sobre transformer; 256 expertos pequenos por capa |
| Parametros totales | 39.785.323.896 |
| Parametros activos | Aproximadamente 2.500 millones por token |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q8_0_ROCMFPX, Q6_0_ROCMFPX (etiquetado como Q6_K), Q4_0_ROCMFP4 (doble escala), Q4_0_ROCMFP4_FAST (escala unica); Q3_0_ROCMFPX no publicado; Q2_0_ROCMFPX no funcional |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (generado desde safetensors BF16) |

## Arquitectura y entrenamiento

El modelo base es un transformer con capas de mezcla de expertos: cada capa contiene 256 expertos enrutados de pequeno tamano que concentran alrededor del 95 % de los pesos, mas un experto compartido, mecanismos de atencion y dos capas densas al inicio. Esa configuracion explica que, pese a los casi 40.000 millones de parametros totales, solo se activen unos 2.500 millones por token, lo que reduce el coste de inferencia de forma significativa.

La informacion disponible no detalla el volumen de tokens de entrenamiento, la composicion del corpus ni si se aplicaron tecnicas de RLHF o DPO. Lo que si se documenta con precision es el proceso de cuantizacion: conversion a GGUF en BF16, generacion de una matriz de importancia (imatrix) sobre texto de calibracion general (`calibration_datav3`) en fragmentos de 512 tokens, y cuantizacion con `llama-quantize` del fork ROCmFPX en el commit `b130d4995`. La innovacion clave es la variable `LLAMA_ROCMFPX_TENSOR_SCALE=1`, que multiplica cada tensor de pesos (cada experto en el caso de las capas MoE) por una potencia de dos antes de cuantizar y guarda el factor inverso en un tensor `.scale` adicional que llama.cpp aplica a la salida de la matmul; al ser una potencia de dos, el escalado no introduce error. Sin esta correccion, un primer archivo de 8 bits registro una KLD de 3,9 y solo un 33 % de coincidencia en el token siguiente.

## Capacidades

- Generacion de texto conversacional y finalizacion de secuencias, con etiqueta `conversational` en el repositorio.
- Programacion y asistencia a agentes de codigo, proposito declarado del modelo base.
- Razonamiento multi-paso orientado a tareas agenticas.
- Integracion con endpoints compatibles (`endpoints_compatible`), lo que facilita su despliegue tras una API tipo OpenAI.
- Soporte de tool calling: no confirmado en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles.
- Cobertura multilingue: no documentada; los idiomas soportados figuran como no disponibles.
- Modo de razonamiento explicito (thinking mode): no disponible.

## Casos de uso

- Agentes de programacion en local: el modelo puede ejecutar bucles de edicion de codigo, lectura de repositorio y aplicacion de parches en un unico equipo Strix Halo con 128 GB de memoria unificada, gracias a que solo activa unos 2.500 millones de parametros por token.
- Asistente de autocompletado y refactorizacion en IDE: la variante `Q4_0_ROCMFP4_Q8ATTN` (23,3 GB) deja margen de memoria para el resto del sistema y mantiene una KLD de 0,1777 frente a BF16, adecuada para sugerencias de codigo en tiempo real.
- Servicio de atencion a desarrolladores: con un endpoint compatible se puede exponer el modelo como API interna que responda dudas tecnicas y genere ejemplos de codigo, manteniendo los datos dentro de la infraestructura propia.
- Generacion de pruebas unitarias y documentacion tecnica: el modelo puede recibir fragmentos de codigo y producir tests o docstrings; la cuantizacion de 6 bits (32,9 GB, KLD 0,0917) es un buen equilibrio si se prioriza fidelidad sobre velocidad.
- Prototipado de pipelines agenticos multi-herramienta: al ser un MoE con activacion reducida, permite iterar sobre flujos de varios pasos sin el coste de un modelo denso equivalente.
- Evaluacion comparativa de tecnicas de cuantizacion: los archivos publicados, con sus metricas de PPL, KLD y coincidencia de token superior, sirven como referencia reproducible para estudiar el impacto de tipos de peso de baja precision en GPUs AMD.
- Despliegue en estaciones de trabajo AMD sin GPU dedicada de gran VRAM: el formato ROCmFPX con soporte Vulkan e HIP permite ejecutar el modelo en hardware de consumo con memoria unificada, algo inviable con pesos BF16 (unos 80 GB).

## Benchmarks y rendimiento

Las unicas metricas publicadas son de calidad de cuantizacion, medidas contra el modelo BF16 (perplejidad 19,1433 en WikiText-2, 40 fragmentos de 512 tokens). La KLD es la divergencia KL media de la distribucion del siguiente token respecto a BF16 (menor es mejor) y "same top" indica la frecuencia con la que la cuantizacion elige el mismo token siguiente que BF16.

| Archivo | Tamano | PPL | KLD | Same top |
|---|---:|---:|---:|---:|
| `flint-Q8_0_ROCMFPX.gguf` | 41,1 GB | 19,1675 | 0,0747 | 91,02 % |
| `flint-Q6_K_ROCMFPX.gguf` | 32,9 GB | 19,7449 | 0,0917 | 89,63 % |
| `flint-Q4_0_ROCMFP4_Q8ATTN.gguf` | 23,3 GB | 18,891 | 0,1777 | 84,96 % |
| `flint-Q4_0_ROCMFP4_FAST_Q8ATTN.gguf` | 22,1 GB | 18,722 | 0,2071 | 84,23 % |
| `Q4_K_M` estandar de llama.cpp (referencia) | 23 GB | 19,92 | 0,2449 | 82,94 % |

Las filas de 4 bits se midieron en una segunda pasada con una referencia BF16 nueva (perplejidad 19,2141; el suelo de la medicion es una KLD de 0,0284 para el propio BF16). Los archivos de 4 bits sustituyen a versiones anteriores con KLD 0,5360 y 0,5428. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM o memoria unificada estimada: 22,1 GB para la variante de 4 bits rapida, 23,3 GB para la recomendada, 32,9 GB para 6 bits y 41,1 GB para 8 bits.
- Hardware objetivo declarado: una maquina AMD Strix Halo con 128 GB de memoria unificada; el modelo completo BF16 rondaria los 80 GB.
- GPU dedicadas: no se documentan requisitos para A100, H100 o RTX 4090; el formato esta orientado a AMD (Vulkan y HIP/ROCm).
- GPU de consumo: cabe en equipos con memoria unificada amplia; no hay datos sobre su comportamiento en GPUs de consumo con VRAM discreta.
- Despliegue: exclusivamente mediante el fork HarshaVardhan3002/ROCmFPX en el commit `b130d4995` o posterior; llama.cpp estandar, LM Studio, Ollama y otras builds de ROCmFPX no cargan estos archivos por los tensores `.scale` adicionales.
- Latencia y throughput: no disponibles. El autor advierte que los archivos no se han probado todavia en hardware AMD real.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Flint ROCmFPX (esta ficha) | 39,8 B | ~2,5 B | no disponible | Apache 2.0 | GGUF ROCmFPX |
| Flint (RecursiveSI, original) | 39,8 B | ~2,5 B | no disponible | Apache 2.0 | safetensors BF16 |
| Flint Q4_K_M estandar (llama.cpp) | 39,8 B | ~2,5 B | no disponible | Apache 2.0 | GGUF Q4_K_M |
| DeepSeek-V4.1-Flash-1017 (ROCmIQ del mismo autor) | no disponible | no disponible | no disponible | no disponible | GGUF |

La comparacion relevante es interna: frente al `Q4_K_M` estandar de llama.cpp, el archivo `Q4_0_ROCMFP4_Q8ATTN` ocupa 23,3 GB frente a 23 GB, pero mejora la KLD de 0,2449 a 0,1777 y la coincidencia de token superior del 82,94 % al 84,96 %. No se dispone de datos para comparar con modelos de otros fabricantes del mismo rango.

## Limitaciones y advertencias

- Los archivos no se han probado en hardware AMD; el autor lo indica explicitamente en la model card.
- Requieren un fork concreto de llama.cpp (ROCmFPX, commit `b130d4995` o posterior); cualquier otra herramienta rechaza los tensores `.scale` extra.
- La cuantizacion de 4 bits pierde precision de forma medible: KLD 0,1777 frente al suelo de 0,0284 del propio BF16, con un 15 % de tokens siguientes distintos.
- El tipo `Q2_0_ROCMFPX` no funciona con este modelo y `Q3_0_ROCMFPX` queda muy por detras de las variantes de 4 bits (KLD 0,5523).
- No se documentan sesgos, comportamiento multilingue ni riesgos de alucinacion especificos; al ser un modelo orientado a codigo, la verificacion de las salidas en produccion sigue siendo necesaria.
- La licencia Apache 2.0 permite uso comercial, pero el autor de la cuantizacion no es el autor del modelo y no ofrece garantias; todos los creditos del modelo corresponden a RecursiveSI.
- El repositorio ocupa 119,4 GB y las descargas estan limitadas por el tamano de cada archivo; conviene verificar la integridad tras la descarga.
- Las metricas de calidad se midieron con kernels BF16 en una GPU NVIDIA, no en el hardware objetivo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Harsha001/flint-ROCmFPX
- Modelo base: https://huggingface.co/RecursiveSI/flint
- Fork ROCmFPX usado para generar los archivos: https://github.com/HarshaVardhan3002/ROCmFPX
- Repositorio original de ROCmFPX: https://github.com/charlie12345/ROCmFPX
- Incidencia sobre la perdida de precision en pesos de baja magnitud: https://github.com/charlie12345/ROCmFPX/issues/118
- Cuantizacion destacada del mismo autor (DeepSeek-V4.1-Flash en Strix Halo): https://huggingface.co/Harsha001/DeepSeek-V4.1-Flash-1017-Uncensored-GSQ-RCO-StrixHalo-GGUF
