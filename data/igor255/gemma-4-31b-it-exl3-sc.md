# igor255/gemma-4-31b-it-exl3-sc

## Resumen

`igor255/gemma-4-31b-it-exl3-sc` es una familia de cuantizaciones EXL3 del modelo multimodal `google/gemma-4-31B-it`, generadas con exllamav3 1.6.6 mediante recetas calibradas por sensibilidad (sensitivity-calibrated, SC) en lugar de una anchura de bits uniforme. El autor mide la sensibilidad por tensor sobre datos de chat y asigna distintos niveles de precision a cabeza, vision y cuerpo del modelo, publicando una revision independiente por cada cuantizacion (4, 5 y 6 bits por peso). El objetivo es reducir la perdida de calidad frente al modelo en bf16 manteniendo tamanos manejables para inferencia local en GPUs de consumo y profesionales.

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion (calibracion por sensibilidad con metrica KLD frente al modelo original) que va mas alla del simple redondeo uniforme; por otro, ofrece cifras verificables de divergencia (KLD) y perplejidad (PPL) frente a bf16, lo que permite al desarrollador elegir el punto de la curva tamano/calidad con criterio. El modelo base es un transformer multimodal de 31.000 millones de parametros con entrada de imagen y texto, si bien la model card no detalla arquitectura interna, contexto ni composicion del dataset.

El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, esta publicado bajo licencia Apache 2.0 (con enlace a la licencia especifica de Gemma 4 de Google) y el tamano del repo aparece como 0.0 GB, lo que sugiere que los pesos no estan materializados en el repositorio principal o no se han contabilizado. No se dispone de idiomas declarados ni de resultados de benchmarks de tareas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 31 000 millones (segun el nombre del modelo base, gemma-4-31B-it) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | EXL3 en 4.00, 5.00 y 6.00 bits por peso (recetas calibradas por sensibilidad) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | EXL3 (exllamav3) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-31B-it`, un modelo de la familia Gemma 4 con pipeline `image-text-to-text`, es decir, acepta imagenes y texto como entrada. La model card del repositorio cuantizado no aporta detalles sobre la arquitectura interna (tipo de atencion, si usa MoE, numero de capas), el volumen de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO. Toda esa informacion deberia consultarse en la model card del modelo base.

La innovacion tecnica de este repositorio reside en el proceso de cuantizacion: en lugar de aplicar una anchura de bits uniforme, el autor mide la sensibilidad por tensor sobre datos de chat y asigna bits de forma diferenciada al cuerpo del modelo, a la cabeza de salida (head, con 5, 6 y 6 bits segun la revision) y a la torre de vision (vision, con 6, 6 y 8 bits). Las cuantizaciones se generaron con exllamav3 1.6.6 y los datos de calibracion provienen de `Dino0040/gemma-4-31b-it-exl3-optimized`. La evaluacion se realiza con la misma traza y el mismo harness para todas las variantes, incluida la build uniforme de 4.00 bpw de turboderp, lo que permite comparaciones directas.

## Capacidades

- Generacion de texto y conversacion multi-turno (modelo `-it`, ajustado para instrucciones).
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y la receta reserva bits especificos para la torre de vision.
- Razonamiento y respuesta a instrucciones heredados del modelo base Gemma 4 31B.
- Capacidades de codigo y matematicas: no documentadas en esta model card; deben asumirse las del modelo base.
- Tool calling / function calling: no documentado en esta model card.
- Soporte de agentes y razonamiento multi-paso: no documentado en esta model card.
- Capacidades multilingues: no disponibles (no se declaran idiomas).
- Modo thinking, audio u otras capacidades especiales: no documentadas.

## Casos de uso

- Despliegue local de un modelo multimodal de 31B en una unica GPU: la revision de 4.00 bpw ocupa 18,8 GB, lo que permite ejecutar el modelo en GPUs de 24 GB de VRAM con margen para cache KV, usando exllamav3 como motor de inferencia.
- Analisis de imagenes en entornos con requisitos de privacidad: al ejecutarse en hardware propio, las imagenes no salen del perimetro; la revision de 6.00 bpw (26,5 GB) ofrece la menor divergencia frente a bf16 (KLD 0,001101) para tareas donde la fidelidad visual es critica.
- Prototipado rapido de asistentes conversacionales: la revision de 5.00 bpw (22,7 GB) equilibra tamano y calidad (KLD 0,002352, 2,85x el ruido de referencia) y encaja en GPUs de 24-32 GB para iteracion con contexto de chat.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio publica KLD, p90 y PPL por revision con el mismo harness, lo que sirve como referencia reproducible para quien investigue calibracion por sensibilidad.
- Servicio de inferencia con latencia controlada: EXL3 esta disenado para exllamav3, motor optimizado para GPUs NVIDIA; las revisiones de 4 y 5 bpw reducen el ancho de banda de memoria necesario y por tanto mejoran el throughput frente a bf16.
- Fine-tuning o adaptacion posterior sobre una base cuantizada: no recomendado directamente sobre EXL3; en su lugar, usar el modelo base y re-cuantizar con la receta SC si se necesita la misma calidad relativa.

## Benchmarks y rendimiento

La model card publica metricas de fidelidad de cuantizacion frente a bf16 (KLD, percentil 90 de KLD y perplejidad), no benchmarks de tareas:

| Revision | bits/peso | head | vision | Tamano | KLD | x ruido base | p90 | PPL |
|---|---|---|---|---|---|---|---|---|
| SC_4.00bpw_H5_V6 | 4.00 | 5 | 6 | 18,8 GB | 0,007176 | 8,7x | 0,014008 | 1,18898 |
| SC_5.00bpw_H6_V6 | 5.00 | 6 | 6 | 22,7 GB | 0,002352 | 2,85x | 0,004654 | 1,18454 |
| SC_6.00bpw_H6_V8 | 6.00 | 6 | 8 | 26,5 GB | 0,001101 | 1,34x | 0,002450 | 1,18304 |
| 4.00 bpw uniforme (turboderp) | 4.00 | 6 | — | 19,7 GB | 0,012337 | 15,0x | 0,025374 | 1,19582 |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: 18,8 GB (4.00 bpw), 22,7 GB (5.00 bpw) y 26,5 GB (6.00 bpw), solo pesos; hay que sumar la cache KV, cuyo tamano depende del contexto y no esta documentado.
- GPU recomendadas: RTX 4090 (24 GB) para la revision de 4.00 bpw; A100 40 GB, H100 o RTX A6000 (48 GB) para las revisiones de 5.00 y 6.00 bpw con contexto amplio.
- Cabe en GPU de consumo: la revision de 4.00 bpw cabe en RTX 4090 / RTX 3090 (24 GB) con contexto moderado; las de 5.00 y 6.00 bpw requieren GPUs de 32 GB o mas o configuraciones multi-GPU.
- Opciones de despliegue: exclusivamente exllamav3 (formato EXL3); no es compatible con vLLM, llama.cpp, Ollama ni TGI sin conversion previa a otro formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Bits/peso | Tamano | KLD | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| igor255/gemma-4-31b-it-exl3-sc (SC_4.00) | 31B | 4.00 calibrado | 18,8 GB | 0,007176 | Apache 2.0 | Hugging Face |
| turboderp/gemma-4-31b-it-exl3 (4.00bpw_mul1) | 31B | 4.00 uniforme | 19,7 GB | 0,012337 | Apache 2.0 (heredada) | Hugging Face |
| Dino0040/gemma-4-31b-it-exl3-optimized | 31B | no disponible | no disponible | no disponible | no disponible | Hugging Face (origen de calibracion) |
| google/gemma-4-31B-it (bf16) | 31B | 16 | no disponible | 0 (referencia) | Licencia Gemma 4 | Hugging Face |

La comparacion directa disponible es frente a la build uniforme de 4.00 bpw de turboderp: la receta SC reduce el KLD de 0,012337 a 0,007176 (un 42 % menos) y el p90 de 0,025374 a 0,014008, con un tamano ligeramente inferior (18,8 GB frente a 19,7 GB). No hay datos comparativos con modelos de otros desarrolladores en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en esta model card; deben heredarse los del modelo base Gemma 4 31B, no evaluados aqui.
- Riesgo de alucinacion: no evaluado; las metricas publicadas son de fidelidad de cuantizacion (KLD, PPL), no de veracidad.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no estan declarados; no se puede asumir cobertura multilingue sin verificar el modelo base.
- Restricciones de licencia: la model card declara Apache 2.0 pero enlaza a la licencia especifica de Gemma 4 de Google; conviene revisar los terminos de uso comercial de Gemma antes de desplegar en produccion, ya que pueden imponer restricciones adicionales.
- Compatibilidad: el formato EXL3 solo funciona con exllamav3; no hay pesos en safetensors ni GGUF, lo que limita el despliegue a ecosistemas NVIDIA.
- Madurez: repositorio con 0 descargas y 0 likes en el momento de la consulta, creado y actualizado el mismo dia (2026-11-10); no hay evidencia de validacion independiente.
- El tamano del repo aparece como 0.0 GB, lo que sugiere que los pesos no estan presentes o no se han contabilizado; verificar antes de descargar.
- La revision de 4.00 bpw se situa a 8,7x el ruido de referencia en KLD, un margen que puede ser insuficiente para tareas de alta precision; para produccion sensible, usar 5.00 o 6.00 bpw.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/igor255/gemma-4-31b-it-exl3-sc
- Revision SC_4.00bpw_H5_V6: https://huggingface.co/igor255/gemma-4-31b-it-exl3-sc/tree/SC_4.00bpw_H5_V6
- Revision SC_5.00bpw_H6_V6: https://huggingface.co/igor255/gemma-4-31b-it-exl3-sc/tree/SC_5.00bpw_H6_V6
- Revision SC_6.00bpw_H6_V8: https://huggingface.co/igor255/gemma-4-31b-it-exl3-sc/tree/SC_6.00bpw_H6_V8
- Modelo base: https://huggingface.co/google/gemma-4-31B-it
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Build uniforme de referencia (turboderp): https://huggingface.co/turboderp/gemma-4-31b-it-exl3
- Revision uniforme 4.00bpw_mul1: https://huggingface.co/turboderp/gemma-4-31b-it-exl3/tree/4.00bpw_mul1
- Datos de calibracion: https://huggingface.co/Dino0040/gemma-4-31b-it-exl3-optimized
