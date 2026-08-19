# mradermacher/gemma-4-E2B-it-heretic-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF con imatrix del modelo `coder3101/gemma-4-E2B-it-heretic`, una variante "heretic" (abliterada y sin censura) del modelo Gemma 4 E2B de Google. El trabajo de cuantización lo realiza mradermacher, un conocido cuantizador de la comunidad, con el objetivo de ofrecer versiones comprimidas que puedan ejecutarse en hardware modesto, desde portátiles hasta GPUs de gama media. El modelo base es un modelo de visión (vision-language), aunque los archivos de proyección multimodal (mmproj) se encuentran en un repositorio estático separado.

La relevancia de esta ficha radica en que combina dos tendencias actuales: la ejecución local de modelos mediante cuantización GGUF y la demanda de modelos "sin censura" para aplicaciones creativas o de investigación. Al ser una versión abliterada, se han eliminado los mecanismos de rechazo de contenido, lo que permite una generación más libre, aunque con los riesgos asociados. El modelo cuenta con 4.628 millones de parámetros (según el peso safetensors original) y está disponible en múltiples niveles de cuantización, desde IQ1_S (2.4 GB) hasta Q6_K (3.9 GB), lo que lo hace accesible para una amplia gama de dispositivos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (familia Gemma 4, probablemente transformer) |
| Parametros totales | 4.628.569.635 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ3_XXS, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. Se sabe que pertenece a la familia Gemma 4 de Google, lanzada en marzo de 2026, y que el modelo original `coder3101/gemma-4-E2B-it-heretic` es una adaptacion "heretic" que aplica tecnicas de abliteracion (eliminacion de direcciones de rechazo) sobre el modelo instruido Gemma 4 E2B. El proceso de cuantizacion realizado por mradermacher utiliza el metodo imatrix (importance matrix) para optimizar la asignacion de bits en la cuantizacion, lo que suele mejorar la calidad perceptual respecto a cuantizaciones estaticas. No se han publicado datos sobre el dataset de entrenamiento, el numero de tokens ni el proceso de alineamiento del modelo original.

## Capacidades

- Generacion de texto libre: al ser una version abliterada, no aplica rechazos de seguridad, lo que permite respuestas sin restricciones de contenido.
- Capacidades multimodales: el modelo base es un modelo de vision (vision-language), aunque los archivos de proyeccion (mmproj) no estan incluidos en este repositorio y deben descargarse del repositorio estatico.
- Conversacion multi-turno: el tag "conversational" indica soporte para dialogos.
- Ejecucion local eficiente: gracias a las cuantizaciones GGUF, puede ejecutarse en CPU o GPU con recursos limitados.
- Compatibilidad con herramientas de inferencia: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros motores que soporten este formato.

## Casos de uso

- Chatbot local sin censura: el modelo puede desplegarse en un servidor local o en un portatil para ofrecer un asistente conversacional sin filtros de contenido, util para pruebas de concepto o entornos de investigacion donde se requiere explorar respuestas sin restricciones.
- Generacion de contenido creativo: escritura de ficcion, guiones o dialogos que requieren un tono provocador o temas sensibles, donde los modelos estandar rechazarian la peticion.
- Analisis de imagenes con privacidad: al ser un modelo de vision, puede procesar imagenes localmente sin enviar datos a la nube, siempre que se obtenga el archivo mmproj adecuado.
- Experimentacion con tecnicas de abliteracion: los desarrolladores pueden estudiar el comportamiento de un modelo sin capas de seguridad y compararlo con la version original.
- Integracion en pipelines de automatizacion: gracias a su tamano reducido (a partir de 2.4 GB), puede ejecutarse en entornos CI/CD para tareas de generacion de texto, resumen o clasificacion sin depender de APIs externas.
- Educacion y aprendizaje: util para ensenar conceptos de cuantizacion, ejecucion local de LLMs y tecnicas de alineamiento, al permitir comparar distintas cuantizaciones y sus efectos en la calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos objetivos sobre MMLU, HumanEval, GSM8K u otras metricas para este modelo o su version base.

## Requisitos de hardware

- VRAM estimada: las cuantizaciones mas pequeñas (IQ1_S, IQ1_M, IQ2_XXS) ocupan entre 2.4 y 2.5 GB, por lo que pueden caber en GPUs con 4 GB de VRAM. Las cuantizaciones de mayor calidad (Q4_K_M, Q5_K_M, Q6_K) requieren entre 3.5 y 3.9 GB, recomendandose al menos 6 GB de VRAM para margen.
- GPU recomendadas: cualquier GPU con soporte CUDA de 6 GB o mas (RTX 2060, GTX 1660 Ti, RTX 3050, etc.) puede ejecutar las cuantizaciones mas grandes. Para cuantizaciones pequeñas, incluso GPUs integradas con 4 GB compartidos pueden funcionar.
- Ejecucion en CPU: al ser GGUF, puede ejecutarse en CPU con llama.cpp, aunque la velocidad dependera del numero de nucleos y la RAM disponible (se recomienda al menos 8 GB de RAM).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con adaptador GGUF), entre otros.
- Latencia y throughput: no se dispone de mediciones oficiales. En una GPU moderna (RTX 4090) se esperan velocidades de decodificacion de 50-100 tokens/s con cuantizaciones Q4_K_M; en CPU, la velocidad puede ser de 5-20 tokens/s dependiendo del hardware.

## Comparativa con modelos similares

No se dispone de informacion suficiente para realizar una comparativa objetiva con otros modelos. El modelo base Gemma 4 E2B pertenece a la familia Gemma 4, que incluye variantes como E4B, 31B y 26B A4B, pero no se conocen datos de rendimiento relativos. Como alternativa de tamano similar, podria compararse con Gemma 2 2B o Phi-3 mini, pero no se dispone de datos de benchmarks en esta ficha.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser una version abliterada, es probable que el modelo presente sesgos mas acentuados y una mayor tasa de alucinaciones, ya que no cuenta con los mecanismos de seguridad que mitigan estos problemas en la version original.
- Contenido inapropiado: al no tener filtros de seguridad, puede generar contenido ofensivo, ilegal o peligroso. No debe utilizarse en aplicaciones publicas sin una capa de moderacion externa.
- Idioma: el modelo esta entrenado principalmente en ingles, por lo que su rendimiento en otros idiomas puede ser limitado.
- Contexto: no se ha confirmado la longitud de contexto; si sigue las especificaciones de Gemma 4 E2B, podria ser de 8K tokens, pero no esta verificado.
- Licencia: aunque la licencia es Apache 2.0, el modelo base tiene una licencia adicional de Google (Gemma Terms of Use) que puede imponer restricciones de uso comercial en ciertos casos. Se recomienda revisar la politica de uso de Gemma.
- Falta de soporte de vision en este repositorio: los archivos mmproj no estan incluidos, por lo que las capacidades de vision solo estan disponibles si se descargan por separado del repositorio estatico.

## Enlaces

- [Repositorio HuggingFace de este modelo](https://huggingface.co/mradermacher/gemma-4-E2B-it-heretic-i1-GGUF)
- [Modelo base: coder3101/gemma-4-E2B-it-heretic](https://huggingface.co/coder3101/gemma-4-E2B-it-heretic)
- [Repositorio de cuantizaciones estaticas](https://huggingface.co/mradermacher/gemma-4-E2B-it-heretic-GGUF)
- [Pagina de Gemma 4 E2B en gemma4.dev](https://gemma4.dev/models/gemma-4-e2b)
- [Documentacion de releases de Gemma de Google](https://ai.google.dev/gemma/docs/releases)
