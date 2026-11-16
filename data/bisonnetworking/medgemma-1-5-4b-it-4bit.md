# bisonnetworking/medgemma-1.5-4b-it-4bit

## Resumen

MedGemma 1.5 4B IT es un modelo multimodal de generacion de texto a partir de imagen y texto, especializado en el dominio medico, desarrollado originalmente por Google bajo la familia Gemma 3. Esta ficha concreta, publicada por el usuario `bisonnetworking`, es una conversion a 4 bits del checkpoint oficial `google/medgemma-1.5-4b-it`, orientada a inferencia en entornos con recursos limitados y compatible con la libreria `transformers` y con el ecosistema MLX para Apple Silicon.

El modelo aborda tareas de razonamiento clinico sobre imagenes medicas (radiologia, dermatologia, patologia, oftalmologia y radiografias de torax) y sobre texto clinico, con capacidad conversacional multi-turno. Su relevancia actual radica en que permite desplegar un modelo medico de ~5.000 millones de parametros en GPUs de consumo o en equipos Apple, manteniendo la licencia restrictiva de Google Health AI Developer Foundations.

La arquitectura subyacente es Gemma 3 (transformer multimodal con vision encoder), con 4.971.331.952 parametros totales y un repositorio de 3,4 GB en formato safetensors cuantizado a 4 bits. No se dispone de informacion publica sobre longitud de contexto, idiomas soportados ni datos de entrenamiento en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma 3 (transformer multimodal, image-text-to-text) |
| Parametros totales | 4.971.331.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (esta version); existe version bf16 en mlx-community |
| Idiomas soportados | no disponible |
| Licencia | health-ai-developer-foundations (other) |
| Formato de pesos | safetensors (cuantizado 4-bit); tambien disponible en MLX |
| Tamano del repositorio | 3,4 GB |
| Pipeline | image-text-to-text |
| Libreria | transformers |
| Fecha de publicacion | 2026-11-16 |

## Arquitectura y entrenamiento

El modelo base es `google/medgemma-1.5-4b-it`, construido sobre la arquitectura Gemma 3 con capacidad multimodal (procesa imagen y texto y genera texto). Esta version concreta es una conversion a 4 bits realizada por el autor `bisonnetworking`; el repositorio incluye tambien una conversion a MLX (formato bf16 y 4bit) generada con `mlx-vlm` 0.3.9 a partir del checkpoint original de Google.

No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion del dataset medico, ni si se aplicaron tecnicas de RLHF, DPO o ajuste fino supervisado. La model card referencia la model card original de Google para obtener mas detalles tecnicos. La innovacion principal de esta publicacion es la cuantizacion a 4 bits que reduce el peso a 3,4 GB, facilitando el despliegue en hardware modesto.

## Capacidades

- Generacion de texto y razonamiento clinico sobre informes y notas medicas.
- Comprension de imagenes medicas: radiologia, dermatologia, patologia, oftalmologia y radiografias de torax (chest-x-ray).
- Conversacion multi-turno (tag `conversational`) en contexto de asistencia clinica.
- Generacion de texto a partir de imagen y texto combinados (image-text-to-text).
- Compatibilidad con `text-generation-inference` y `endpoints_compatible`.
- Soporte de inferencia en Apple Silicon via MLX (`mlx-vlm`).
- No se ha documentado en la informacion disponible soporte explicito de tool calling, function calling, agentes multi-paso, audio ni modo thinking.

## Casos de uso

- Triaje radiologico asistido: el modelo puede describir hallazgos en radiografias de torax y sugerir categorias diagnosticas preliminares para priorizar la revision por radiologos, aprovechando su entrenamiento especifico en chest-x-ray.
- Apoyo a la dermatologia teledermatologica: analisis de imagenes de lesiones cutaneas para generar descripciones estructuradas que el dermatologo revisa antes de emitir diagnostico.
- Documentacion clinica automatizada: conversion de imagenes de estudios (patologia, oftalmologia) en borradores de informes que el personal sanitario edita y valida.
- Formacion medica: simulacion de casos clinicos con imagenes y preguntas de razonamiento para estudiantes de medicina, en entornos controlados sin datos reales de pacientes.
- Investigacion retrospectiva: extraccion de descripciones estructuradas a partir de cohorts de imagenes medicas anonimizadas para estudios epidemiologicos.
- Despliegue en entornos con recursos limitados: al ocupar 3,4 GB en 4 bits, puede ejecutarse en estaciones de trabajo con GPU de consumo o en portatiles Apple Silicon mediante MLX, lo que permite prototipado local sin infraestructura cloud.
- Preprocesado de datos medicos multimodales: generacion de metadatos y etiquetas textuales para construir datasets de entrenamiento de otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4-6 GB con cuantizacion 4-bit (pesos de 3,4 GB mas overhead de activaciones y KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100; cualquier GPU con al menos 8 GB de VRAM deberia ser suficiente para esta cuantizacion.
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas de VRAM; tambien en Apple Silicon (M1/M2/M3) via MLX.
- Opciones de despliegue: `transformers`, `text-generation-inference` (TGI), `mlx-vlm` (Apple Silicon); compatible con endpoints. No se ha confirmado soporte de vLLM, llama.cpp u Ollama en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| bisonnetworking/medgemma-1.5-4b-it-4bit | 4.971.331.952 | no disponible | health-ai-developer-foundations | safetensors 4-bit | Esta ficha; cuantizacion comunitaria |
| mlx-community/medgemma-1.5-4b-it-bf16 | ~5B (bf16) | no disponible | health-ai-developer-foundations | MLX bf16 | Conversion oficial a MLX, mayor precision |
| google/medgemma-1.5-4b-it | ~5B | no disponible | health-ai-developer-foundations | safetensors | Checkpoint original de Google |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo de uso medico: no debe utilizarse como sustituto del juicio clinico profesional; requiere validacion y supervision humana.
- Riesgo de alucinacion en descripciones de imagenes y recomendaciones clinicas; la cuantizacion a 4 bits puede degradar la precision respecto al checkpoint bf16.
- Licencia restrictiva `health-ai-developer-foundations`: el acceso requiere aceptar los terminos de Google; el uso comercial esta sujeto a dichos terminos y puede no estar permitido sin autorizacion.
- No se dispone de informacion sobre sesgos demograficos, etnicos o de otro tipo en los datos de entrenamiento.
- Idiomas soportados no documentados; se desconoce el rendimiento en castellano.
- Longitud de contexto no disponible, lo que limita la planificacion de despliegues con documentos largos.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: cuantizacion comunitaria sin validacion publica extensa.
- El autor de la conversion no es Google; posibles diferencias de calidad frente al checkpoint oficial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/bisonnetworking/medgemma-1.5-4b-it-4bit
- Modelo original de Google: https://huggingface.co/google/medgemma-1.5-4b-it
- Conversion MLX bf16: https://huggingface.co/mlx-community/medgemma-1.5-4b-it-bf16
- Terminos de licencia Health AI Developer Foundations: https://developers.google.com/health-ai-developer-foundations/terms
