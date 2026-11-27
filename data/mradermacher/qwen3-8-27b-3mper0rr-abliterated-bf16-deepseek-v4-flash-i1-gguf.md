# mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash-i1-GGUF

## Resumen

Este repositorio contiene cuantizaciones GGUF del modelo `Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash`, un modelo de lenguaje de aproximadamente 27.000 millones de parametros (26.895.998.464 exactos segun safetensors) publicado por el usuario 3MPER0RR y cuantizado por mradermacher. Se trata de un derivado de la familia Qwen (por el nombre) afinado mediante destilacion a partir de datos generados por DeepSeek-V4, segun indica el dataset `Jackrong/DeepSeek-V4-Distill-8000x` y los tags `deepseek` y `distillation`. El sufijo "abliterated" indica que se ha aplicado una tecnica de ablacion de direcciones de rechazo para reducir las negativas del modelo a responder.

El modelo base esta en BF16 y este repositorio ofrece exclusivamente cuantizaciones de tipo `i1` (imatrix) en formato GGUF, ademas del fichero imatrix para generar cuantizaciones propias. El tamano del repo es de 305,8 GB, coherente con la presencia de multiples variantes de cuantizacion. El modelo esta etiquetado como vision model en la model card del cuantizador, aunque los ficheros mmproj residen en el repositorio estatico hermano.

La relevancia de esta ficha es limitada: se trata de un modelo derivado, sin model card tecnica propia del autor original, sin benchmarks publicados y con informacion muy escasa sobre entrenamiento, contexto o idiomas. Es util para quien quiera ejecutar localmente una variante "sin censura" de un modelo de ~27B en formato GGUF, pero no constituye una referencia tecnica verificable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de la familia Qwen, segun el nombre; no confirmado en la informacion) |
| Parametros totales | 26.895.998.464 (~26,9B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-Q3_K_S, i1-IQ3_XS, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_1, i1-Q4_K_S, i1-Q4_K_M, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, i1-IQ4_NL (small), i1-IQ3_M, i1-IQ2_M, i1-IQ1_M, i1-IQ1_S; ademas de variantes estaticas en el repo hermano |
| Idiomas soportados | en (segun la model card); no se detallan mas idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base esta en safetensors BF16 |

## Arquitectura y entrenamiento

No se dispone de informacion tecnica sobre la arquitectura en la model card proporcionada. El nombre del modelo sugiere una base de la familia Qwen con aproximadamente 27B de parametros, pero no se confirma el tipo de transformer, el numero de capas, la dimension oculta ni si emplea atencion lineal o hibrida. El tag `distillation` y el dataset `Jackrong/DeepSeek-V4-Distill-8000x` indican que el modelo fue afinado mediante destilacion a partir de salidas generadas por DeepSeek-V4 sobre un conjunto de aproximadamente 8000 ejemplos (segun el nombre del dataset). No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

La unica innovacion tecnica documentada en esta ficha es el proceso de cuantizacion: el cuantizador ha generado variantes `i1` (imatrix) usando un fichero imatrix propio, lo que suele mejorar la calidad respecto a cuantizaciones estaticas del mismo tamano. La model card indica que el modelo es de vision y que los ficheros mmproj, si existen, estan en el repositorio estatico hermano, pero no se aporta ningun detalle sobre el codificador visual ni sobre el entrenamiento multimodal.

## Capacidades

- Generacion de texto conversacional (tag `conversational`).
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion, pero plausible por herencia de la familia Qwen; no disponible como dato verificado.
- Vision: la model card del cuantizador lo etiqueta como "vision model" y remite a ficheros mmproj en el repositorio estatico; no se detalla el alcance.
- Tool calling / function calling: no disponible en la informacion.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion.
- Capacidades multilingues: la model card solo declara `en`; no se confirman otros idiomas.
- Modo "abliterated": se ha reducido la tendencia del modelo a rechazar peticiones, lo que cambia el perfil de comportamiento respecto al modelo original.
- Destilacion de DeepSeek-V4: el modelo incorpora comportamientos derivados de los datos de destilacion, segun los tags.

## Casos de uso

- Experimentacion local con modelos de ~27B en formato GGUF: gracias a las cuantizaciones i1 desde IQ1_S (7,8 GB) hasta Q6_K, se puede ejecutar en equipos con distinta VRAM, desde GPUs de consumo hasta estaciones de trabajo.
- Investigacion sobre ablacion de rechazos: util para estudiar como cambia el comportamiento de un modelo al eliminar direcciones de rechazo, comparando con el modelo base no abliterated.
- Evaluacion de destilacion: permite analizar la calidad de un modelo destilado de DeepSeek-V4 sobre 8000 ejemplos, comparando sus salidas con las del profesor.
- Prototipado de asistentes conversacionales sin restricciones de contenido: para entornos controlados de investigacion donde se necesita un modelo que no rechace peticiones por defecto.
- Despliegue en pipelines de generacion de texto con llama.cpp u Ollama: al estar en GGUF, se integra en herramientas estandar de inferencia local sin necesidad de GPU de datacenter.
- Pruebas de vision (si se usa el mmproj del repo estatico): experimentacion con entrada de imagenes en un modelo de ~27B cuantizado, aunque sin datos verificados de calidad.
- Generacion de datos sinteticos en dominios donde el modelo base rechazaria peticiones: util para aumentar datasets de entrenamiento en investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia segun cuantizacion: IQ1_S ~7,8 GB; IQ2_M ~10,5 GB; IQ3_M ~12,9 GB; IQ4_XS ~15,4 GB; Q4_K_M (estimado en el rango de 16-17 GB, no listado explicitamente); Q6_K (no listado en el fragmento, pero el repo incluye Q6_K). Los tamanos indicados son de fichero, por lo que la VRAM necesaria es similar o ligeramente superior al cargar el modelo completo.
- GPU recomendadas: no disponible en la informacion. Por tamano, las cuantizaciones de 4 bits caben en GPUs de consumo de 16-24 GB (RTX 4080/4090) y las de 6-8 bits requieren 24 GB o mas; las de 1-2 bits pueden ejecutarse en GPUs de 8-12 GB.
- Cabe en GPU de consumo: si, en las cuantizaciones bajas (IQ1, IQ2, IQ3, IQ4) en GPUs de 8-24 GB. Las cuantizaciones altas requieren 24 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runtime compatible con GGUF. El tag `text-generation-inference` sugiere compatibilidad con TGI para el modelo base en safetensors, no necesariamente para los GGUF.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash-i1-GGUF) | ~26,9B | no disponible | apache-2.0 | GGUF (i1) | Derivado abliterated destilado de DeepSeek-V4; sin benchmarks |
| Modelo base 3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash | ~26,9B (presumible) | no disponible | apache-2.0 (presumible) | safetensors BF16 | Version sin cuantizar del mismo modelo |
| Repo estatico mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash-GGUF | ~26,9B (presumible) | no disponible | apache-2.0 | GGUF estatico | Mismas cuantizaciones sin imatrix; incluye mmproj de vision |

No se dispone de datos de benchmarks ni de especificaciones de contexto para establecer una comparacion de rendimiento con alternativas de la misma categoria.

## Limitaciones y advertencias

- Ausencia de model card tecnica del autor original: no hay informacion verificable sobre arquitectura, contexto, datos de entrenamiento ni evaluaciones.
- Riesgo de alucinacion: no cuantificado; al ser un modelo destilado y abliterated, la fiabilidad factual no esta garantizada.
- Sesgos conocidos: no documentados. La ablacion de rechazos puede aumentar la probabilidad de generar contenido danino, ofensivo o inseguro, y elimina parte de las salvaguardas del modelo original.
- Limitaciones de idioma: la model card solo declara ingles; el rendimiento en castellano no esta verificado.
- Limitaciones de contexto: longitud de contexto no disponible; no se debe asumir una ventana larga sin comprobacion empirica.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero el modelo base y los datos de destilacion pueden tener condiciones adicionales no reflejadas en esta ficha; conviene revisar el repo del modelo base.
- Caveat de produccion: el uso de un modelo abliterated en produccion conlleva riesgos de cumplimiento y de reputacion; no se recomienda en aplicaciones orientadas al publico sin filtros adicionales.
- El tag `vision` y la referencia a mmproj no van acompanados de especificaciones del codificador visual; la calidad multimodal es desconocida.
- El repo ocupa 305,8 GB; la descarga completa de todas las cuantizaciones no es practica para la mayoria de usuarios.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash-i1-GGUF
- Modelo base: https://huggingface.co/3MPER0RR/Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash
- Repositorio de cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-3MPER0RR-abliterated-BF16-DeepSeek-V4-Flash-i1-GGUF
- Dataset de destilacion: https://huggingface.co/datasets/Jackrong/DeepSeek-V4-Distill-8000x
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
