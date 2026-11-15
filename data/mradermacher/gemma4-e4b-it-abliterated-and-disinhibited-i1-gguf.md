# mradermacher/gemma4-E4B-it-Abliterated-AND-Disinhibited-i1-GGUF

## Resumen

`mradermacher/gemma4-E4B-it-Abliterated-AND-Disinhibited-i1-GGUF` es una cuantizacion GGUF del modelo `stevenh512/gemma4-E4B-it-Abliterated-AND-Disinhibited`, un derivado de la familia Gemma 4 (variante E4B, orientada a instrucciones) al que se le han aplicado tecnicas de *abliteration* y *disinhibition*. El autor de la cuantizacion es mradermacher, conocido por publicar versiones GGUF de modelos abiertos, en este caso con cuantizaciones ponderadas mediante ficheros imatrix.

El modelo base parte de una arquitectura transformer de la familia Gemma 4 con 7.463.013.674 parametros totales (segun los pesos en safetensors del repositorio original). La model card indica que se trata de un modelo de vision (los ficheros mmproj, si existen, se alojan en el repositorio estatico), y esta etiquetado como conversacional y compatible con endpoints. La cuantizacion esta pensada para ejecucion local y despliegue en entornos con recursos limitados mediante llama.cpp y derivados.

La relevancia de esta ficha radica en que combina dos factores poco habituales: por un lado, la aplicacion de tecnicas de *mechanistic interpretability* (abliteration) para reducir los mecanismos de rechazo del modelo; por otro, la publicacion en formato GGUF con cuantizaciones i1 (imatrix), lo que facilita su uso en hardware de consumo. No obstante, la informacion publica disponible es muy limitada: no hay benchmarks, no se detalla la composicion del dataset de entrenamiento ni el proceso exacto de abliteration, y el repositorio no registra descargas ni likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Gemma 4, variante E4B); detalles de atencion no disponibles |
| Parametros totales | 7.463.013.674 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-IQ3_M, i1-IQ3_XXS, i1-Q3_K_S, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_0, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-IQ1_S, i1-IQ1_M, i1-IQ3_XS, i1-IQ3_S, i1-IQ4_NL, i1-Q2_K_S, i1-Q3_K_M; tambien fichero imatrix |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a la familia Gemma 4, en su variante E4B orientada a instrucciones. El modelo base es `stevenh512/gemma4-E4B-it-Abliterated-AND-Disinhibited`, que a su vez parte de un Gemma 4 E4B-it y le aplica tecnicas de abliteration y disinhibition. La abliteration es una tecnica de interpretabilidad mecanica que identifica y neutraliza las direcciones de activacion asociadas al rechazo de peticiones, mientras que la disinhibition busca reducir el sesgo de alineacion excesivamente restrictivo. No se detalla en la informacion disponible el metodo exacto, el numero de capas afectadas ni los hiperparametros empleados.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO en el modelo base. La model card del repositorio de cuantizacion no incluye estos datos, y el repositorio del modelo base no ha sido consultado en esta ficha. La cuantizacion se ha realizado con ficheros imatrix, lo que indica un proceso de calibracion para preservar la calidad en cuantizaciones de baja precision.

## Capacidades

- Generacion de texto conversacional en ingles, con soporte de formato de instrucciones (`it`).
- Capacidades de vision: la model card indica explicitamente que es un modelo de vision; los ficheros mmproj se alojan en el repositorio estatico.
- Razonamiento y generacion de codigo: no confirmado explicitamente en la informacion disponible, pero esperable en un modelo de la familia Gemma 4 orientado a instrucciones.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`.
- Capacidad especial: el modelo ha sido modificado mediante abliteration y disinhibition, lo que reduce los mecanismos de rechazo y puede alterar el comportamiento en temas sensibles.

## Casos de uso

- **Investigacion en interpretabilidad mecanica**: el modelo sirve como objeto de estudio para analizar como la abliteration afecta a las representaciones internas y al comportamiento de rechazo, comparandolo con el Gemma 4 E4B-it original.
- **Despliegue local en hardware de consumo**: las cuantizaciones i1-Q4_K_M (aproximadamente 4-5 GB) permiten ejecutar el modelo en GPUs consumer como RTX 3060 o superiores mediante llama.cpp u Ollama, sin necesidad de infraestructura en la nube.
- **Prototipado de asistentes conversacionales en ingles**: el modelo puede integrarse en aplicaciones de chat multi-turno para pruebas de concepto donde se requiera un modelo ligero y sin filtros excesivos.
- **Analisis de sesgos y alineacion**: util para estudiar como las tecnicas de disinhibition afectan a la calidad, coherencia y seguridad de las respuestas en dominios sensibles.
- **Generacion de contenido creativo sin restricciones**: para tareas de escritura creativa, guiones o narrativa donde los filtros de seguridad del modelo original resultan limitantes, asumiendo los riesgos asociados.
- **Evaluacion comparativa de cuantizaciones**: el repositorio ofrece multiples niveles de cuantizacion (desde IQ1 hasta Q6_K), lo que permite medir el impacto de la cuantizacion en la calidad de las respuestas para un mismo modelo.
- **Pipeline de vision-lenguaje en local**: si se dispone de los ficheros mmproj del repositorio estatico, puede emplearse para tareas de descripcion de imagenes o VQA en entornos sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia**: entre 2 y 3 GB para cuantizaciones IQ1/IQ2, entre 4 y 5 GB para Q3/IQ3, entre 5 y 6 GB para Q4, y entre 6 y 8 GB para Q5/Q6.
- **GPU recomendadas**: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, A100, H100. Para cuantizaciones bajas, GPUs con 6-8 GB de VRAM son suficientes.
- **Cabe en consumer GPU**: si, en la mayoria de GPUs consumer modernas con al menos 6 GB de VRAM para cuantizaciones Q4 o inferiores.
- **Opciones de despliegue**: llama.cpp, Ollama, LM Studio, y cualquier runtime compatible con GGUF. La model card menciona compatibilidad con endpoints.
- **Latencia y throughput estimados**: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| mradermacher/gemma4-E4B-it-Abliterated-AND-Disinhibited-i1-GGUF | 7.463 M | no disponible | gemma | GGUF | Abliterated, vision, solo ingles |
| stevenh512/gemma4-E4B-it-Abliterated-AND-Disinhibited | 7.463 M | no disponible | gemma | safetensors | Modelo base sin cuantizar |
| Gemma 4 E4B-it (original) | ~7.500 M (estimado) | no disponible | gemma | safetensors, GGUF | Modelo original con alineacion completa |
| mradermacher/gemma4-E4B-it-Abliterated-AND-Disinhibited-GGUF | 7.463 M | no disponible | gemma | GGUF | Cuantizaciones estaticas (no imatrix) |

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un modelo derivado de Gemma 4 con abliteration, los sesgos originales del modelo base pueden persistir o amplificarse al eliminar los mecanismos de rechazo.
- **Riesgo de alucinacion**: no se han publicado evaluaciones especificas; el proceso de abliteration puede degradar la coherencia y aumentar la generacion de contenido falso o incoherente.
- **Limitaciones de contexto e idioma**: el modelo solo soporta ingles segun la etiqueta de idioma; la longitud de contexto no esta documentada.
- **Restricciones de licencia**: la licencia `gemma` impone terminos de uso de Google, incluyendo restricciones de uso comercial y requisitos de atribucion. Es necesario revisar los terminos completos antes de un uso en produccion.
- **Caveat de produccion**: el modelo ha sido modificado para reducir los mecanismos de rechazo, lo que puede provocar respuestas inapropiadas, inseguras o legalmente problematicas. No se recomienda su uso en aplicaciones orientadas al publico sin una capa adicional de moderacion.
- **Falta de documentacion**: no hay benchmarks, no se detalla el proceso de abliteration ni el dataset de entrenamiento, lo que dificulta evaluar su calidad de forma objetiva.
- **Repositorio sin traccion**: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face (cuantizacion i1): https://huggingface.co/mradermacher/gemma4-E4B-it-Abliterated-AND-Disinhibited-i1-GGUF
- Repositorio del modelo base: https://huggingface.co/stevenh512/gemma4-E4B-it-Abliterated-AND-Disinhibited
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/gemma4-E4B-it-Abliterated-AND-Disinhibited-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#gemma4-E4B-it-Abliterated-AND-Disinhibited-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Analisis de cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
