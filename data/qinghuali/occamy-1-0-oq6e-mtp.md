# qinghuali/Occamy-1.0-oQ6e-mtp

## Resumen

Occamy-1.0-oQ6e-mtp es una cuantizacion comunitaria del modelo multimodal occamy-1.0 de Accio-Lab, empaquetada especificamente para el runtime oMLX sobre Apple Silicon. El autor del repositorio, qinghuali, fusiona en un unico artefacto de pesos el modelo base y su cabecera de prediccion multi-token (MTP), que el proyecto original distribuye por separado y requiere un runtime SGLang parcheado. El resultado se cuantiza con la receta oQ6e de oMLX y se publica como safetensors MLX, con licencia Apache 2.0.

El modelo subyacente es un transformer de mezcla de expertos (MoE) de 35.951.822.704 parametros totales y aproximadamente 3.000 millones activos por token, con 40 capas mas una capa MTP, 256 expertos (8 enrutados y 1 compartido por token), atencion hibrida con capas de atencion lineal GDN intercaladas con atencion completa cada cuatro capas, y una ventana de contexto de 262.144 tokens. Incorpora ademas un codificador visual de 27 capas que se preserva a precision completa en esta cuantizacion, por lo que la pipeline declarada es image-text-to-text.

Su relevancia practica es doble. Por un lado, permite ejecutar un MoE de 35B con capacidades multimodales y contexto largo en un equipo de sobremesa con memoria unificada de 64 GB, algo que el checkpoint BF16 original no permite con holgura. Por otro lado, integra la decodificacion especulativa MTP en los propios pesos, con una tasa de aceptacion de borradores medida del 77,95 % y una mediana de 110,5 tokens por segundo en un Mac Studio M4 Max. Conviene subrayar que es una publicacion no oficial, no validada por Accio-Lab, y que las metricas proceden de registros de uso real y no de un benchmark controlado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con atencion lineal GDN y atencion completa cada 4 capas; codificador visual de 27 capas; capa MTP adicional |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones (8 expertos enrutados + 1 compartido por token) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | oQ6e de oMLX: base de 6 bits (expertos a 6 bits, grupo 64; ~6,6 bpw en la parte linguistica, ~6,7 bpw en el archivo completo); embeddings, proyecciones de atencion/GDN y expertos compartidos a 8 bits; normas, router MoE, capa MTP fusionada y torre visual sin cuantizar |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors MLX (6 fragmentos, 30,28 GB / 28,20 GiB) |

## Arquitectura y entrenamiento

La arquitectura heredada del checkpoint original combina 40 capas de transformer con una capa adicional de prediccion multi-token. El bloque de mezcla de expertos emplea 256 expertos con enrutamiento disperso de 8 expertos activos mas uno compartido por token, lo que explica la relacion entre los 35B parametros totales y los aproximadamente 3B activos. La atencion es hibrida: la mayoria de capas usan atencion lineal del tipo GDN y cada cuarta capa aplica atencion completa, un diseno orientado a sostener el contexto de 262.144 tokens con un coste de atencion reducido. El modelo incorpora ademas un codificador visual de 27 capas para entrada image-text-to-text.

Sobre el entrenamiento del modelo base no se proporciona informacion en los materiales disponibles: no se detallan el volumen de tokens, la composicion del corpus, ni si hubo fases de RLHF o DPO. Lo que si documenta esta ficha es el proceso de cuantizacion. El autor fusiona los 19 tensores `mtp.*` de la cabecera oficial occamy-1.0-MTP en el indice de pesos del modelo base y ajusta `text_config.mtp_num_hidden_layers` de 0 a 1, replicando el comportamiento del helper `assemble_head.py` del proyecto original. Despues aplica la cuantizacion dinamica oQ6e de oMLX con calibracion imatrix (oqe_code_multilingual, 128x512, cobertura de expertos del 100 %), elevando a 8 bits las partes sensibles y dejando intactos a precision completa las normas, el router, la capa MTP y toda la torre visual. La innovacion tecnica destacable es, por tanto, el empaquetado de la decodificacion especulativa MTP dentro de los pesos para que oMLX la active de forma nativa, sin el runtime parcheado que exige la distribucion oficial.

## Capacidades

- Generacion de texto conversacional y razonamiento en modo agente, con modo de pensamiento (thinking) segun la recomendacion de muestreo del proyecto original.
- Procesamiento de imagen y texto combinados (pipeline image-text-to-text) mediante el codificador visual de 27 capas, conservado a precision completa.
- Llamada a herramientas y salida estructurada: los registros del autor separan 71 peticiones de tool calling y estructuradas, con una tasa de aceptacion MTP del 85,7 %.
- Razonamiento multi-paso y sesiones de agente interactivas, con prompts observados de hasta 142.277 tokens dentro del contexto de 262.144.
- Contexto largo de 262.144 tokens, adecuado para documentos extensos, historiales de conversacion largos y bases de codigo.
- Decodificacion especulativa MTP integrada, con profundidad adaptativa de borrador configurable hasta 3.
- Capacidades multilingues: no disponible (no se declaran idiomas en el repositorio).

## Casos de uso

- Agente de codigo en local sobre Apple Silicon: el modelo puede sostener sesiones de tool calling con salida estructurada, donde la aceptacion MTP medida es del 85,7 % y la mediana de decodificacion de 122,5 tok/s, lo que reduce la latencia percibida en bucles de edicion y ejecucion de herramientas.
- Asistente de analisis de documentos largos: con 262.144 tokens de contexto puede ingerir informes, expedientes o bases de codigo completas en una sola peticion, sin troceado agresivo ni perdida de referencias cruzadas.
- Atencion al cliente automatizada multi-turno: la ventana de contexto permite mantener historiales extensos y adjuntar capturas o documentos; el modo thinking ayuda en consultas que requieren razonamiento previo.
- Procesamiento de imagenes con texto asociado: al conservar la torre visual a precision completa, es adecuado para extraccion de datos de capturas, diagramas o formularios combinados con instrucciones textuales.
- Generacion de texto largo en estacion de trabajo: los registros incluyen generaciones de 5.675 tokens a 128,2 tok/s y 5.463 tokens a 123,8 tok/s, utiles para redaccion tecnica o resumenes extensos por lotes.
- Prototipado e investigacion de decodificacion especulativa: el repositorio expone estadisticas por peticion (aceptacion por profundidad, tokens por ciclo, parking de MTP), lo que lo convierte en un banco de pruebas realista para estudiar MTP en produccion.
- Despliegue de un MoE de 35B en hardware de sobremesa: con unos 29 GB de memoria unificada en carga, encaja en equipos de 64 GB para entornos de desarrollo, demos internas o procesamiento por lotes sin GPU dedicada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos de rendimiento son mediciones de uso real del autor sobre oMLX 0.7.0 en un Mac Studio M4 Max de 64 GB, con MTP activado y profundidad adaptativa maxima de 3, en 113 peticiones y 81.444 tokens generados:

| Metrica | Valor |
|---|---|
| Aceptacion de borradores (global) | 48.501 / 62.218 = 77,95 % |
| Aceptacion por profundidad d1 / d2 / d3 | 79,43 % / 76,26 % / 77,29 % |
| Tokens por ciclo de verificacion (mediana) | 2,83 (p10 2,25; p90 3,36) |
| Decodificacion (mediana) | 110,5 tok/s (p10 78,0; p90 146,9) |
| Decodificacion maxima observada | 165,7 tok/s |
| Tool calls / estructurado (71 peticiones) | 85,7 % de aceptacion; 122,5 tok/s de mediana |
| Texto libre (42 peticiones) | 75,8 % de aceptacion; 96,6 tok/s de mediana |

El autor no declara ningun multiplicador de aceleracion: no hay ejecucion de referencia con MTP desactivado sobre este mismo artefacto, por lo que no existe comparacion directa MTP on frente a MTP off.

## Requisitos de hardware

- Memoria unificada: aproximadamente 29 GB en carga de pesos; el autor exige unos 30 GB libres para pesos mas cache KV y contexto. Un equipo de 64 GB es el minimo practico recomendado.
- Plataforma: exclusivamente Apple Silicon con macOS 15 o superior; el formato es safetensors MLX y el runtime es oMLX (probado con la version 0.7.0).
- GPU dedicadas tipo A100, H100 o RTX 4090: no aplica a este artefacto, que no esta pensado para CUDA. Para esas plataformas habria que acudir a los repositorios oficiales del modelo base.
- Cabe en GPU de consumo: si, en el sentido de que cabe en equipos Apple con memoria unificada de 64 GB (M4 Max y superiores). No se documenta su uso en GPUs de consumo con memoria discreta.
- Opciones de despliegue: oMLX (`omlx serve --model-dir ... --port 8000`) con endpoint compatible con OpenAI en `/v1`; requiere activar MTP en la configuracion del modelo. El checkpoint BF16 original se sirve con Transformers, vLLM o SGLang, y la cabecera MTP oficial con SGLang parcheado.
- Latencia y throughput: mediana de 110,5 tok/s en decodificacion (p10 78,0; p90 146,9) y 2,83 tokens por ciclo de verificacion, en una sola peticion concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Formato / runtime | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Occamy-1.0-oQ6e-mtp (este repositorio) | 35,95B totales / ~3B activos | 262.144 | Imagen y texto | MLX safetensors, oQ6e 6 bits, MTP fusionado, oMLX | Apache 2.0 | Comunitaria, 198 descargas, 1 like |
| Accio-Lab/occamy-1.0 (oficial) | 35,95B totales / ~3B activos | 262.144 | Imagen y texto | BF16 safetensors, Transformers / vLLM / SGLang | Apache 2.0 | Oficial |
| Accio-Lab/occamy-1.0-MTP (oficial) | Cabecera MTP de 1,69 GB | No aplica (depende del base) | No aplica | SGLang parcheado (bases BF16 / NVFP4) | Apache 2.0 | Oficial |
| Repositorios oficiales GGUF / MLX / FP8 / NVFP4 | 35,95B totales / ~3B activos | 262.144 | Imagen y texto | llama.cpp / mlx-lm / FP8 / NVFP4, sin MTP | Apache 2.0 | Oficial |

La comparacion con modelos de otros laboratorios del mismo tamano o categoria no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Publicacion no oficial: el autor declara explicitamente que Accio-Lab no ha validado este artefacto; para produccion conviene evaluar tambien el checkpoint oficial.
- Las metricas de rendimiento proceden de registros de uso real en una sola maquina, con una sola peticion concurrente y sin linea base con MTP desactivado; no deben extrapolarse como garantia de rendimiento.
- El comportamiento de muestreo de la cabecera MTP no esta validado ni por el autor de esta cuantizacion ni por el proyecto original. Las sesiones medidas usaron temperatura 0,7, mientras que el proyecto original recomienda temperatura 1,0, top_p 0,95, top_k 20 y presence_penalty 1,5 con thinking activado.
- El runtime puede aparcar MTP a mitad de peticion si la aceptacion se degrada (visible como `finish=parked`); es comportamiento normal, pero implica variabilidad de latencia.
- La cuantizacion a 6 bits puede degradar tareas sensibles a precision numerica; no se aportan evaluaciones de calidad frente al BF16 original.
- Idiomas soportados no disponibles: no se puede garantizar un rendimiento homogeneo fuera de los idiomas cubiertos por el modelo base.
- Riesgo de alucinacion y sesgos: no se documentan analisis especificos en la informacion disponible; aplican los riesgos habituales de un modelo generativo de este tamano.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al ser una modificacion conviene conservar los avisos de licencia y atribucion del modelo base.
- Dependencia de plataforma: solo Apple Silicon con oMLX; no es portable a CUDA sin recurrir a otros artefactos.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/qinghuali/Occamy-1.0-oQ6e-mtp
- Modelo base oficial: https://huggingface.co/Accio-Lab/occamy-1.0
- Cabecera MTP oficial: https://huggingface.co/Accio-Lab/occamy-1.0-MTP
- Runtime oMLX: https://omlx.ai
- Paper referenciado en los tags (arXiv:2609.11977): https://arxiv.org/abs/2609.11977
- Apoyo al autor: https://ko-fi.com/qinghuali
