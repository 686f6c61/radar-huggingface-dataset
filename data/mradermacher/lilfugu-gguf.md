# mradermacher/lilfugu-GGUF

## Resumen

lilfugu-GGUF es la version cuantizada en formato GGUF del modelo holotherapper/lilfugu, un modelo de reconocimiento automatico del habla (ASR) especializado en japones y orientado a dominios de programacion. El modelo original esta construido sobre la familia Qwen3-ASR, segun indica la etiqueta `qwen3_asr` de la model card, y cuenta con aproximadamente 1.720 millones de parametros. Esta version la publica mradermacher, un perfil conocido por generar cuantizaciones GGUF de modelos populares para su uso en herramientas como llama.cpp.

El modelo resuelve la tarea de transcripcion de audio a texto (speech-to-text) en japones, con un enfasis declarado en vocabulario tecnico y de programacion, lo que lo hace relevante para desarrolladores que necesitan transcribir reuniones tecnicas, notas de voz o contenido de video en japones con terminologia de software. La disponibilidad en GGUF permite ejecutarlo en hardware consumer sin GPU dedicada de gama alta, algo poco habitual en modelos ASR de este tamano.

La relevancia actual radica en la combinacion de un tamano contenido (1,7B parametros), licencia Apache 2.0 permisiva para uso comercial y un conjunto amplio de cuantizaciones que van desde 0,9 GB (Q2_K) hasta 3,5 GB (f16), lo que facilita el despliegue en entornos con recursos limitados. No obstante, la informacion publica disponible sobre el modelo original es escasa y no se han publicado resultados de benchmarks en la documentacion consultada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado como `qwen3_asr`, familia Qwen3-ASR) |
| Parametros totales | 1.720.574.976 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; mmproj en Q8_0 y f16 |
| Idiomas soportados | japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (original en safetensors/transformers) |

## Arquitectura y entrenamiento

La model card del repositorio cuantizado no detalla la arquitectura interna del modelo original. La etiqueta `qwen3_asr` sugiere que deriva de la familia Qwen3-ASR de Alibaba, aunque no se especifica si se trata de un transformer encoder-decoder clasico de ASR o de una variante con componentes multimodales. La presencia de archivos `mmproj` (multi-modal projection) en el repositorio GGUF indica que el modelo incorpora un proyector multimodal, lo que apunta a una arquitectura capaz de procesar audio y proyectarlo al espacio de representacion del modelo de lenguaje subyacente.

No se dispone de informacion sobre el volumen de datos de entrenamiento, la composicion del dataset, el uso de RLHF/DPO ni innovaciones tecnicas especificas (decodificacion especulativa, atencion lineal, etc.). La model card original de holotherapper/lilfugu no esta incluida en la informacion proporcionada, por lo que estos datos deben considerarse no disponibles.

## Capacidades

- Reconocimiento automatico del habla (ASR) en japones: transcripcion de audio a texto.
- Especializacion declarada en vocabulario de programacion y terminos tecnicos de software.
- Procesamiento multimodal: la presencia de archivos `mmproj` sugiere soporte para entrada de audio proyectada al modelo.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de inferencia conversacional (etiqueta `conversational`).
- Compatibilidad con MLX (etiqueta `mlx`), lo que permite ejecucion en Apple Silicon.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- Capacidades multilingues limitadas al japones segun la model card.

## Casos de uso

- Transcripcion de reuniones tecnicas en japones: el modelo puede convertir grabaciones de stand-ups, revisiones de codigo o sesiones de arquitectura en texto, aprovechando su especializacion en vocabulario de programacion para reducir errores en nombres de funciones, librerias y terminos tecnicos.
- Generacion de subtitulos para contenido educativo de programacion: util para creadores de tutoriales en japones que necesitan subtitulos automaticos con terminologia correcta de lenguajes y frameworks.
- Documentacion por voz para desarrolladores: transcripcion de notas de voz dictadas por ingenieros japoneses que describen bugs, ideas de diseno o pasos de reproduccion, con menor tasa de error en terminos tecnicos que un ASR generico.
- Accesibilidad en entornos de desarrollo: conversion de explicaciones habladas en texto para personas con discapacidad auditiva en equipos de ingenieria japoneses.
- Analisis de llamadas de soporte tecnico: transcripcion de conversaciones entre soporte y clientes en japones para su posterior analisis, busqueda o cumplimiento normativo.
- Despliegue en local sin conexion: gracias a las cuantizaciones Q4_K_S (1,2 GB) y Q5_K_M (1,4 GB), el modelo puede ejecutarse en portatiles o estaciones de trabajo sin GPU dedicada, util para entornos con requisitos de privacidad o sin acceso a la nube.
- Integracion en pipelines de CI/CD para transcripcion de demos: un equipo puede automatizar la transcripcion de videos de demostracion de producto en japones como parte de su proceso de documentacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~0,9 GB
  - Q3_K_S / Q3_K_M: ~1,0 GB
  - Q3_K_L / IQ4_XS: ~1,1 GB
  - Q4_K_S / Q4_K_M: ~1,2 GB
  - Q5_K_S: ~1,3 GB
  - Q5_K_M: ~1,4 GB
  - Q6_K: ~1,5 GB
  - Q8_0: ~1,9 GB
  - f16: ~3,5 GB
  - Proyector multimodal (mmproj): ~0,5 GB (Q8_0) o ~0,7 GB (f16)
- GPU recomendadas: cualquier GPU consumer con 4 GB o mas de VRAM puede ejecutar las cuantizaciones Q4_K_M o Q5_K_M con margen para el proyector multimodal. Para f16 se recomienda al menos 6 GB de VRAM. GPUs como RTX 3060, RTX 4060, RTX 4090 o superiores son suficientes; tambien es viable en CPU.
- Cabe en GPU consumer: si, practicamente en cualquier GPU moderna con 4-6 GB de VRAM, e incluso en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. La etiqueta `mlx` sugiere compatibilidad adicional con MLX en Apple Silicon. Para el modelo original en safetensors, transformers con el pipeline `automatic-speech-recognition`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de informacion suficiente sobre modelos comparables de ASR japones del mismo tamano para establecer una comparativa rigurosa. Se indica "no disponible" en lugar de especular con alternativas no verificadas.

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| lilfugu-GGUF | 1,72B | no disponible | Apache 2.0 | GGUF | ASR japones, especializado en programacion |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Modelo especializado exclusivamente en japones: no se documenta soporte para otros idiomas, por lo que no es adecuado para transcripcion multilingue.
- Es una cuantizacion de un modelo original: las cuantizaciones de baja calidad (Q2_K, Q3_K_S) pueden degradar la precision de transcripcion, especialmente en terminos tecnicos. Se recomienda Q4_K_M o superior para produccion.
- Riesgo de alucinacion: como todo modelo de lenguaje subyacente, puede generar texto plausible pero incorrecto en pasajes de audio ambiguo o con ruido.
- Sesgos conocidos: no documentados en la informacion disponible; al entrenarse presumiblemente con datos en japones, puede presentar sesgos propios del dominio y la variedad linguistica de los datos de entrenamiento.
- Limitaciones de contexto: no se especifica la longitud maxima de audio o contexto que el modelo puede procesar, lo que supone un riesgo para audios largos.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se debe verificar la licencia del modelo base original (holotherapper/lilfugu) y de la familia Qwen3-ASR subyacente, ya que las condiciones pueden diferir.
- La model card del cuantizador no incluye informacion sobre calidad diferencial entre cuantizaciones mas alla de las notas genericas ("lower quality" para Q3_K_M, "very good quality" para Q6_K).
- No hay garantias de soporte o mantenimiento del modelo base; el repositorio cuantizado se actualizo por ultima vez en noviembre de 2026.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/lilfugu-GGUF
- Modelo base original: https://huggingface.co/holotherapper/lilfugu
- Pagina de overview del cuantizador: https://hf.tst.eu/model#lilfugu-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Empresa del cuantizador: https://www.nethype.de/
