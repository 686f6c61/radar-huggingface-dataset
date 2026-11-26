# ReadyArt/Qwen3.8-27B-EXL25

## Resumen

ReadyArt/Qwen3.8-27B-EXL25 es una cuantizacion en formato EXL2.5 del modelo Qwen3.8-27B, publicada por el usuario ReadyArt en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una conversion de pesos orientada a inferencia eficiente en GPU, con un repositorio de 24,4 GB que sugiere una cuantizacion de aproximadamente 7 bits por peso para un modelo de 27 mil millones de parametros. La licencia declarada es Apache 2.0.

El interes tecnico de esta publicacion reside en el formato EXL2.5, una extension propietaria del fork de ExLlamaV2 mantenido por el mismo autor. Segun la model card, mantiene el contenedor de fichero EXL2 clasico e incorpora mejoras opcionales por tensor: una ruta rapida GEMM sin ramificaciones optimizada para Ampere (RTX 3090) con un limite de 16 filas que permite leer los pesos una sola vez en verificacion MTP con batch 4, y tecnicas de calidad como rotacion de incoherencia de Hadamard, proteccion de canales AWQ y redondeo guiado por Hessiano al mismo bits por peso.

La relevancia es acotada pero concreta: ofrece a quienes ya operan el stack ExLlamaV2 un artefacto listo para desplegar un modelo de 27B en GPUs de 24 GB, junto con un conjunto de mediciones publico que permite recalcular cuantizaciones alternativas en unos 45 minutos en una GPU Ampere de 24 GB. No obstante, la ausencia de informacion sobre el modelo base, los idiomas, los benchmarks y el pipeline limita seriamente su evaluacion objetiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.8-27B; arquitectura no documentada en la informacion proporcionada) |
| Parametros totales | 27 mil millones (deducido del nombre del modelo) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL2.5 (contenedor EXL2 con mejoras por tensor); bits por peso exactos no disponibles, estimados en torno a 7 bpw por el tamano del repo (24,4 GB) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | EXL2 / EXL2.5 (requiere fork especifico de ExLlamaV2) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo base Qwen3.8-27B ni sobre su proceso de entrenamiento: numero de tokens, composicion del dataset, uso de RLHF o DPO, y posibles innovaciones como decodificacion especulativa o atencion lineal no estan documentados en la informacion proporcionada.

Lo que si esta documentado es el proceso de cuantizacion. El autor genera las cuantizaciones EXL2.5 a partir de un conjunto de mediciones publicado en el repositorio ReadyArt/EXL25-Measurements, lo que permite reproducir el proceso en aproximadamente 45 minutos sobre una GPU Ampere de 24 GB. El formato EXL2.5 anade sobre EXL2 tres mecanismos de calidad aplicados por tensor: rotacion de incoherencia de Hadamard, proteccion de canales AWQ y redondeo guiado por Hessiano, todos ellos sin incrementar el bits por peso. En el plano del rendimiento, incorpora una ruta GEMM sin ramificaciones disenada para Ampere con un limite de 16 filas, pensada para que la verificacion MTP con batch 4 lea los pesos una sola vez. Los modelos EXL2 convencionales siguen cargandose y ejecutandose sin cambios en el fork.

## Capacidades

- Generacion de texto y razonamiento: heredadas del modelo base Qwen3.8-27B, si bien no se detallan en la informacion disponible.
- Generacion de codigo y matematicas: no confirmado explicitamente en la informacion proporcionada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible (idiomas no declarados).
- Capacidades especiales (modo thinking, vision, audio): no disponible.
- Inferencia optimizada: soporte de verificacion MTP con batch 4 en la ruta GEMM del fork EXL2.5, orientado a decodificacion especulativa.

## Casos de uso

- Despliegue de un modelo de 27B en GPU de 24 GB: la cuantizacion EXL2.5 permite cargar un modelo de 27 mil millones de parametros en tarjetas como la RTX 3090 o la RTX 4090, algo inviable en precision completa o en FP16.
- Servicio de inferencia local con TabbyAPI: el autor publica un fork especifico de TabbyAPI compatible con EXL2.5, lo que habilita montar un endpoint compatible con la API de OpenAI para uso interno o prototipado.
- Experimentacion con tecnicas de cuantizacion: el repositorio de mediciones permite reproducir y comparar el efecto de Hadamard, AWQ y redondeo Hessiano sobre la calidad a igual bits por peso.
- Generacion de codigo en estaciones de trabajo: si el modelo base conserva las capacidades de la familia Qwen, podria emplearse en asistentes de codigo locales; no obstante, esta capacidad no esta confirmada en la informacion disponible.
- Evaluacion comparativa de formatos: util para equipos que ya operan ExLlamaV2 y quieren medir la ganancia de la ruta GEMM sin ramificaciones frente a EXL2 clasico en hardware Ampere.
- Replicacion de cuantizaciones a medida: partiendo de las mediciones publicadas, un equipo puede generar su propia variante de bpw en unos 45 minutos en una GPU Ampere de 24 GB, ajustando el equilibrio calidad/memoria a su caso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en torno a 24 GB para la cuantizacion publicada (repo de 24,4 GB), mas overhead de contexto y cache KV.
- GPU recomendadas: Ampere o superior. El autor menciona explicitamente la RTX 3090 y el soporte para GPUs Ampere de 24 GB; la ruta GEMM esta optimizada para Ampere. No se documentan requisitos para A100 o H100.
- Cabe en GPU de consumo: si, en RTX 3090 y RTX 4090 (24 GB), con margen limitado para contexto largo.
- Opciones de despliegue: exclusivamente el fork de ExLlamaV2 del autor (https://github.com/Ready-Art/exllamav2-Fork) y el fork de TabbyAPI (https://github.com/Ready-Art/tabbyAPI-Fork). No funciona con las builds estandar de ExLlamaV2 ni TabbyAPI, y no hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El autor afirma que la ruta GEMM con limite de 16 filas lee los pesos una sola vez en verificacion MTP con batch 4, pero no publica cifras.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Despliegue |
|---|---|---|---|---|---|
| ReadyArt/Qwen3.8-27B-EXL25 | 27B | no disponible | EXL2.5 | Apache 2.0 | Fork ExLlamaV2 / TabbyAPI |
| Cuantizaciones EXL2 estandar de modelos 27B | 27B | segun base | EXL2 | segun base | ExLlamaV2 / TabbyAPI estandar |
| Cuantizaciones GGUF de modelos 27B | 27B | segun base | GGUF | segun base | llama.cpp / Ollama |

No se dispone de datos de rendimiento que permitan una comparacion cuantitativa con alternativas. La diferencia principal frente a cuantizaciones EXL2 estandar es la incorporacion de Hadamard, AWQ y redondeo Hessiano, junto con la ruta GEMM optimizada para Ampere, a cambio de requerir un fork no estandar del runtime.

## Limitaciones y advertencias

- Dependencia de un fork no oficial: el modelo no funciona con las builds estandar de ExLlamaV2 ni TabbyAPI, lo que complica el mantenimiento, la actualizacion y el soporte a largo plazo.
- Formato propietario: EXL2.5 solo es consumible por el runtime del autor; no hay compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Falta de documentacion del modelo base: no se detallan arquitectura, contexto, idiomas ni datos de entrenamiento, lo que impide evaluar sesgos y capacidades con rigor.
- Riesgo de alucinacion: inherente a los modelos generativos; no cuantificado por el autor.
- Sesgos conocidos: no documentados en la informacion disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.8-27B, que no se especifica en la informacion proporcionada.
- Reputacion del artefacto: cero descargas y cero likes en el momento de la consulta, sin pipeline declarado; no hay evidencia de validacion por terceros.
- Perdida de calidad por cuantizacion: aunque el autor aplica tecnicas de preservacion, no publica evaluaciones que cuantifiquen la degradacion respecto al modelo original.

## Enlaces

- Hugging Face: https://huggingface.co/ReadyArt/Qwen3.8-27B-EXL25
- Mediciones para cuantizacion: https://huggingface.co/ReadyArt/EXL25-Measurements
- Fork de ExLlamaV2: https://github.com/Ready-Art/exllamav2-Fork
- Fork de TabbyAPI: https://github.com/Ready-Art/tabbyAPI-Fork
