# CleverBadger/Swift-Qwen3.8-27B-Badger-Mixed-NVFP4-FP8

## Resumen
CleverBadger/Swift-Qwen3.8-27B-Badger-Mixed-NVFP4-FP8 es una cuantizacion mixta de precision, creada de forma independiente por el usuario CleverBadger, sobre el checkpoint UkisAI Swift-Qwen3.8-27B (revision fuente 54e66d6c81439bd4fda5ef9a690fa571e3b0d272). No es una version oficial de UkisAI ni un nuevo modelo entrenado: no se realizo entrenamiento adicional, por lo que la cuantizacion puede alterar las salidas numericas. Se trata de una cuantizacion del checkpoint Swift 1.0, no de Swift 1.5.

El objetivo declarado fue reducir la memoria de pesos y mejorar la velocidad de servicio en una unica NVIDIA DGX Spark, preservando los tensores MTP (multi-token prediction) del modelo fuente. El modelo combina NVFP4 en las proyecciones MLP de las capas 0-55 (168 modulos) con FP8 en las capas 56-63, proyecciones seleccionadas de atencion y DeltaNet, y el `lm_head` (233 modulos en total), dejando vision, embeddings, normalizaciones y MTP en la precision original.

El modelo hereda del base Swift-Qwen3.8-27B su caracter de derivado eficiente en razonamiento de Qwen3.8-27B, con trazas de pensamiento mas cortas (58,3% menos tokens de thinking segun el material del autor original) y soporte de texto, imagen y video. Su relevancia actual radica en que demuestra un flujo de cuantizacion mixta NVFP4/FP8 para kernels Blackwell (SM121) en hardware de escritorio de Nvidia, con mejoras medidas de throughput y memoria frente a una cuantizacion NVFP4 anterior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con componentes de atencion lineal DeltaNet (segun model card), derivado de Qwen3.8-27B; 64 capas |
| Parametros totales | 27B (aprox., segun denominacion) |
| Parametros activos | no disponible |
| Longitud de contexto | Hasta 524.288 tokens con YaRN (segun model card); longitud nativa no disponible |
| Tipos de cuantizacion | NVFP4 (MLP capas 0-55), FP8 (MLP capas 56-63, atencion, DeltaNet y `lm_head`); vision/embeddings/norms/MTP sin cuantizar; KV cache FP8 como opcion de servicio |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (license: other) |
| Formato de pesos | safetensors con metadatos compressed-tensors |
| Cuantizador | vllm-project/llm-compressor (commit b52e76d66a6f47275c33dd59342a90ae7c50d34a) |
| Modelo base | ukisai/Swift-Qwen3.8-27b (revision 54e66d6c81439bd4fda5ef9a690fa571e3b0d272) |

## Arquitectura y entrenamiento
La arquitectura subyacente es la del modelo base Swift-Qwen3.8-27B, un derivado de Qwen3.8-27B optimizado para razonamiento mas eficiente: trazas de pensamiento mas cortas, menor incidencia de errores de "sobrepensamiento" y una interfaz estandar de Qwen3.8 que conserva soporte de texto, imagen y video. Swift incorpora un componente de transferencia derivado de ThinkingCap-Qwen3.6-27B de BottleCap AI. La model card de esta cuantizacion menciona proyecciones de atencion y DeltaNet, lo que apunta a un diseño hibrido con atencion lineal, aunque no se detallan los hiperparametros completos de la arquitectura.

No hubo entrenamiento adicional. El trabajo consistio en una cuantizacion de precision mixta con `vllm-project/llm-compressor`, calibrada con 512 ejemplos: 384 de `mlabonne/open-perfectblend` y 128 de `theblackcat102/evol-codealpaca-v1`, cada uno limitado a 4.096 tokens. Las proyecciones MLP de las capas 0-55 se cuantizaron a NVFP4 y las capas 56-63 junto con atencion, DeltaNet y `lm_head` a FP8. Vision, embeddings, normalizaciones y MTP se mantuvieron en la precision del modelo fuente; los 15 tensores MTP se preservaron byte a byte. El manifiesto completo de modulos se registra en `HOUSE_QUANTIZATION_MANIFEST.json`. El checkpoint incluye la cabeza MTP base; DFlash2, cuando se usa, es un modelo aparte y no esta incluido en estos pesos.

## Capacidades
- Generacion de texto y razonamiento con modo de pensamiento (thinking) segun la plantilla por defecto del modelo.
- Procesamiento de imagen y video, coherente con la etiqueta `image-text-to-text` y con el soporte multimodal del modelo base.
- Generacion de codigo, con resultados medidos en LiveCodeBench v6 (146/175, 83,43%).
- Razonamiento matematico, evaluado en GSM8K (97,45% auditado en la configuracion DFlash2-7).
- Multi-token prediction (MTP) mediante la cabeza MTP preservada; el autor reporta aceptacion de tokens draft del 57,69% con DFlash2.
- Servicio con decodificacion especulativa (DFlash2-7 y MTP3) sobre vLLM.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible (la interfaz Qwen3.8 estandar habitualmente lo soporta, pero no se detalla aqui).

## Casos de uso
- Servicio de razonamiento en una DGX Spark: el modelo esta optimizado para ejecutarse en una unica unidad Grace Blackwell, reduciendo la memoria de pesos cargados a 25,11 GiB, lo que permite desplegar el modelo completo sin repartirlo entre varias GPU.
- Asistentes multimodales con imagen y video: al conservar vision y embeddings en precision original, es adecuado para tareas de descripcion de imagenes, comprension de video o dialogos image-text-to-text mediante la interfaz Qwen3.8.
- Generacion de codigo asistida en entornos locales: con 83,43% de acierto en LiveCodeBench v6 y velocidades de codigo final de 57-63 tokens/s, encaja en asistentes de programacion desplegados on-premise.
- Razonamiento matematico por lotes: con 97,45% auditado en GSM8K y batch de 200 preguntas en 4m 55s, es util para evaluacion automatizada de problemas aritmeticos a escala.
- Inferencia con contexto largo: con YaRN habilitado hasta 524.288 tokens, sirve para analisis de documentos extensos, aunque el autor advierte que esta configuracion se activo despues de los benchmarks y no es una afirmacion de calidad.
- Despliegue con decodificacion especulativa: gracias a la preservacion de los tensores MTP y a la aceptacion del 57,69% de tokens draft, es adecuado para maximizar throughput por peticion en servicios de produccion con vLLM.
- Comparacion de cuantizaciones en investigacion de eficiencia: sirve como punto de referencia reproducible para estudiar el impacto de mezclas NVFP4/FP8 en memoria, latencia y calidad frente a NVFP4 puro.

## Benchmarks y rendimiento
Resultados medidos en `gx10-6d39` DGX Spark, configuracion DFlash2-7, ocho peticiones concurrentes, temperatura 1,0, top-p 0,95, top-k 20, salida maxima 8.192 tokens y razonamiento por plantilla por defecto. Las 2.000 respuestas por checkpoint repiten las mismas 200 preguntas de GSM8K (diez ejecuciones), no son 2.000 problemas independientes.

| DFlash2-7, diez ejecuciones | Badger Mixed | UkisAI stock NVFP4 (antiguo) |
|---|---:|---:|
| Respuestas correctas auditadas | 1.949/2.000 (97,45%) | 1.957/2.000 (97,85%) |
| Throughput mediano por peticion (C8) | 27,23 tokens/s | 23,49 tokens/s |
| Throughput agregado (C8) | 192,40 tokens/s | 168,62 tokens/s |
| Tiempo mediano de batch de 200 preguntas | 4m 55s | 6m 43s |
| Longitud media de completion | 294,92 tokens | 344,51 tokens |
| Longitud media de razonamiento | 209,44 tokens | 253,60 tokens |
| Pesos objetivo + draft cargados | 25,11 GiB | 29,91 GiB |
| Respuestas truncadas | 0 | 0 |
| Aceptacion de tokens draft DFlash2 | 57,69% | 56,07% |

Con MTP3 en el mismo hardware, Badger Mixed obtuvo 97,10% auditado frente a 97,75% de la version stock, con throughput agregado C8 de 141,21 frente a 100,33 tokens/s.

| Tarea de codigo C1, XHigh | Thinking | Codigo final | Extremo a extremo |
|---|---:|---:|---:|
| Merge de configuracion intermedia | 28,87 tok/s | 58,46 tok/s | 2m 03s |
| TTL/LRU dificil | 29,74 tok/s | 63,13 tok/s | 10m 29s |

En una ejecucion separada de LiveCodeBench v6 de 175 tareas a C2 y XHigh, Badger Mixed aprobo 146/175 (83,43%) con 49,59 tokens/s agregados de salida. La velocidad mediana de thinking por stream fue de 27,35 tokens/s y la de codigo final de 57,23 tokens/s, con un tiempo mediano por peticion de 5m 22,75s. El autor advierte que las mediciones de codigo no tienen una ejecucion stock comparable y que no deben leerse como ganancias frente al modelo original.

## Requisitos de hardware
- VRAM estimada: aproximadamente 25,11 GiB de pesos objetivo mas draft cargados en la configuracion DFlash2-7; el checkpoint stock equivalente usaba 29,91 GiB.
- GPU recomendadas: NVIDIA DGX Spark (GB10 Grace Blackwell, arquitectura SM121), unico hardware mencionado en las pruebas. Se requieren kernels NVFP4 compatibles con SM121.
- Compatibilidad con GPU de consumo: no confirmada; la dependencia de kernels SM121 y de un build de vLLM con soporte Qwen3.8 y compressed-tensors mixto limita el despliegue en tarjetas consumer.
- Opciones de despliegue: vLLM con soporte de Qwen3.8, cuantizacion compressed-tensors mixta, reasoning/parser de Qwen3 y kernels NVFP4 compatibles con SM121. El autor recomienda empezar con una longitud de contexto que quepa en memoria y confirmar `/health` y una completion real antes de aumentarla.
- Latencia y throughput medidos: 27,23 tokens/s por peticion y 192,40 tokens/s agregados a C8 con DFlash2-7; 141,21 tokens/s agregados con MTP3.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Pesos cargados | GSM8K auditado (DFlash2-7) | Throughput agregado C8 | Licencia |
|---|---|---|---|---|---|---|
| CleverBadger Badger Mixed NVFP4/FP8 | 27B | Mixta NVFP4/FP8 | 25,11 GiB | 97,45% | 192,40 tok/s | swift-open-license-1.0 |
| UkisAI stock NVFP4 (antiguo) | 27B | NVFP4 (~28,6 GB) | 29,91 GiB | 97,85% | 168,62 tok/s | swift-open-license-1.0 |
| vwdubb/Swift-Qwen3.8-27b-FP8 | 27B | FP8 | no disponible | no disponible | no disponible | no disponible |
| ukisai/Swift-Qwen3.8-27B-NVFP4 | 27B | NVFP4 | no disponible | no disponible | no disponible | swift-open-license-1.0 |

## Limitaciones y advertencias
- Cuantizacion no oficial: es una conversion independiente de CleverBadger, no una publicacion de UkisAI, y la cuantizacion puede modificar las salidas numericas aunque no se haya reentrenado el modelo.
- Version base concreta: corresponde a Swift 1.0, no a Swift 1.5; no debe asumirse equivalencia con las versiones mas recientes del modelo base.
- Calidad en GSM8K ligeramente inferior al stock (97,45% frente a 97,85%); el autor indica que la diferencia de 0,40 puntos no establece un ganador en un analisis emparejado por pregunta.
- Los benchmarks de codigo no tienen una ejecucion stock comparable, por lo que no deben interpretarse como mejora frente al modelo original.
- El baseline stock usado era un checkpoint NVFP4 antiguo de unos 28,6 GB, no la revision ModelOpt mas reciente publicada bajo el mismo nombre de repositorio; su commit exacto no se capturo, por lo que la comparacion no es reproducible desde la rama `main` actual.
- Las condiciones de hardware y versiones de runtime pueden alterar el rendimiento medido; los resultados no constituyen una garantia universal de velocidad.
- El contexto largo con YaRN a 524.288 tokens se activo despues de los benchmarks y no es una afirmacion de calidad para este checkpoint.
- Licencia: swift-open-license-1.0 (license: other). No se detallan en la informacion disponible las condiciones exactas de uso comercial, por lo que conviene revisar el texto de la licencia en el repositorio del modelo base antes de un uso en produccion.
- Sin datos de idiomas soportados, sesgos conocidos ni riesgos especificos de alucinacion mas alla de los inherentes al modelo base.
- Repositorio sin descargas ni likes registrados y con fecha de creacion muy reciente, lo que reduce la validacion por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/CleverBadger/Swift-Qwen3.8-27B-Badger-Mixed-NVFP4-FP8
- Modelo base: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Cuantizacion NVFP4 de UkisAI: https://huggingface.co/ukisai/Swift-Qwen3.8-27B-NVFP4
- Cuantizacion FP8 (vwdubb): https://huggingface.co/vwdubb/Swift-Qwen3.8-27b-FP8
- Anuncio de Swift-Qwen3.8-27B (UkisAI): https://ukisai.com/news/introducing-swift
- Hilo NVIDIA: Qwen3.8-27B en DGX Spark con vLLM (NVFP4 vs FP8): https://forums.developer.nvidia.com/t/qwen3-8-27b-on-dgx-spark-using-vllm-nvfp4-vs-fp8-performance/380258
- Hilo NVIDIA: Qwen3.8-27B-NVFP4 en una DGX Spark (contexto hasta 1M, vLLM, MTP): https://forums.developer.nvidia.com/t/qwen3-8-27b-nvfp4-on-a-single-dgx-spark-up-to-1m-context-vllm-mtp-measurements/380244
- Licencia: https://huggingface.co/ukisai/Swift-Qwen3.8-27b/blob/main/LICENSE
