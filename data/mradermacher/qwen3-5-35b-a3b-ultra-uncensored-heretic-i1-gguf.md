# mradermacher/Qwen3.5-35B-A3B-ultra-uncensored-heretic-i1-GGUF

## Resumen

Qwen3.5-35B-A3B-ultra-uncensored-heretic-i1-GGUF es una cuantizacion en formato GGUF, realizada por mradermacher, del modelo llmfan46/Qwen3.5-35B-A3B-ultra-uncensored-heretic, que a su vez deriva de la familia Qwen3.5-35B-A3B de Alibaba. Se trata de un modelo de lenguaje de gran tamano con arquitectura de mezcla de expertos (MoE), 34.660.610.688 parametros totales y aproximadamente 3.000 millones de parametros activos por token (de ahi el sufijo A3B). El modelo base ha sido sometido a un proceso de "abliteration" o decensurado (etiquetas heretic, uncensored, decensored, abliterated), que elimina total o parcialmente los mecanismos de rechazo y alineacion de seguridad del modelo original.

La relevancia de esta publicacion radica en que ofrece un conjunto amplio de cuantizaciones con imatrix (desde IQ1_S de 7,6 GB hasta Q4_1 de 21,9 GB, entre otras), lo que permite ejecutar un modelo de 35B parametros en hardware de consumo. Al ser un modelo MoE con solo ~3B parametros activos, el coste computacional por token es bajo en comparacion con un modelo denso del mismo tamano total, lo que lo hace atractivo para inferencia local en GPUs de gama alta consumer. La model card indica ademas que se trata de un modelo de vision, con ficheros mmproj disponibles en el repositorio de cuantizaciones estaticas.

La licencia declarada es Apache 2.0, heredada del modelo Qwen original. El repositorio tiene un tamano de 371 GB y acumula 1027 descargas en el momento de la consulta. No se dispone de informacion sobre la longitud de contexto, los idiomas soportados ni resultados de benchmarks en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) tipo transformer; modelo derivado de Qwen3.5-35B-A3B (detalles de capas y atencion no disponibles) |
| Parametros totales | 34.660.610.688 (34,66B) |
| Parametros activos | ~3B (inferido del sufijo A3B; cifra exacta no disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1 (cuantizaciones con imatrix) |
| Idiomas soportados | en (segun la model card); resto no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (cuantizaciones i1 con imatrix); fichero imatrix separado de 0,5 GB para crear cuantizaciones propias |

## Arquitectura y entrenamiento

El modelo base es Qwen3.5-35B-A3B, un transformer con arquitectura de mezcla de expertos (MoE) de 34,66B parametros totales y aproximadamente 3B activos por token. Esta publicacion concreta no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni las tecnicas de alineacion (RLHF, DPO) empleadas en el modelo original. La model card de esta cuantizacion se limita a describir el proceso de cuantizacion y no documenta el entrenamiento.

La innovacion principal de esta version es el proceso de "abliteration" aplicado por llmfan46 sobre el modelo Qwen3.5-35B-A3B, que da lugar al modelo "ultra-uncensored-heretic". Este tipo de intervencion suele consistir en la modificacion de las direcciones de activacion asociadas a los comportamientos de rechazo, con el objetivo de eliminar las respuestas de negativa del modelo. La cuantizacion de mradermacher emplea tecnicas de imatrix (importance matrix) para preservar la calidad durante la compresion, con un fichero imatrix de 0,5 GB incluido para que otros usuarios puedan generar sus propias cuantizaciones. La model card indica que se trata de un modelo de vision, con ficheros mmproj (proyector multimodal) alojados en el repositorio de cuantizaciones estaticas.

## Capacidades

- Generacion de texto conversacional multi-turno, segun la etiqueta "conversational" del repositorio.
- Capacidades de vision: la model card indica explicitamente que es un modelo de vision y remite a los ficheros mmproj para el procesamiento de imagenes.
- Razonamiento y codigo: capacidades heredadas del modelo Qwen3.5-35B-A3B base; no se detallan en la informacion disponible.
- Comportamiento decensurado: el proceso de abliteration elimina o reduce los rechazos de seguridad del modelo original, lo que permite respuestas sobre contenido que el modelo base rechazaria.
- Soporte multilingue: la model card declara unicamente el idioma en; no se confirma soporte de otros idiomas.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar el efecto del proceso de abliteration comparando sus respuestas con las del Qwen3.5-35B-A3B original, util para analizar como se distribuyen las direcciones de rechazo en un MoE de 35B.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles que el modelo base rechazaria, aprovechando el decensurado para mantener la coherencia narrativa en generos como terror o drama adulto.
- Analisis de contenido multimodal local: al disponer de ficheros mmproj, puede procesar imagenes junto con texto en entornos sin conexion, util para tareas de descripcion o extraccion de informacion de capturas y documentos escaneados.
- Despliegue en estaciones de trabajo con GPU consumer: las cuantizaciones i1-Q4_K_M (21,3 GB) e i1-IQ4_XS (18,8 GB) permiten ejecutar el modelo en GPUs de 24 GB de VRAM, con un coste por token reducido gracias a los ~3B parametros activos del MoE.
- Experimentacion con cuantizaciones de baja precision: el repositorio incluye desde IQ1_S (7,6 GB) hasta Q4_1 (21,9 GB), lo que permite medir la degradacion de calidad del modelo a distintos niveles de compresion y elegir el equilibrio tamano/calidad adecuado.
- Evaluacion comparativa de modelos decensurados: util como referencia en estudios que comparan la utilidad, la tasa de rechazo y la calidad de respuesta entre distintos grados de abliteration sobre la misma arquitectura base.
- Prototipado de asistentes conversacionales sin filtros: para pruebas internas de productos donde se necesita evaluar respuestas sin capas de rechazo, siempre en entornos controlados y con supervision humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el contexto y el proyector multimodal. Las cuantizaciones van de 7,6 GB (i1-IQ1_S) a 21,9 GB (i1-Q4_1).
- GPU recomendadas: para las cuantizaciones de mayor calidad (Q4_K_M, Q4_1) se recomienda una GPU de 24 GB de VRAM (RTX 3090, RTX 4090, A10G) o superior; para cuantizaciones IQ2/IQ3, GPUs de 12-16 GB (RTX 4070 Ti, RTX 4080) pueden ser suficientes.
- Cabe en GPU consumer: si, en modelos como RTX 3090/4090 (24 GB) con cuantizaciones Q4, y en RTX 4070/4080 con cuantizaciones IQ3 o inferiores.
- Opciones de despliegue: llama.cpp, Ollama y cualquier runtime compatible con GGUF (LM Studio, koboldcpp). Para vision es necesario cargar el fichero mmproj correspondiente del repositorio estatico.
- Latencia y throughput estimados: no disponibles. Al tratarse de un MoE con ~3B parametros activos, el throughput por token deberia ser notablemente superior al de un modelo denso de 35B, pero no se aportan cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-ultra-uncensored-heretic-i1-GGUF (este) | 34,66B | ~3B | no disponible | apache-2.0 | GGUF (i1, imatrix) |
| Qwen3.5-35B-A3B (modelo base original) | 34,66B | ~3B | no disponible | apache-2.0 | safetensors |
| Qwen3.5-35B-A3B-ultra-uncensored-heretic-GGUF (cuantizaciones estaticas) | 34,66B | ~3B | no disponible | apache-2.0 | GGUF (estaticas) |
| llmfan46/Qwen3.5-35B-A3B-ultra-uncensored-heretic (modelo decensurado sin cuantizar) | 34,66B | ~3B | no disponible | apache-2.0 | safetensors |

No se dispone de datos de rendimiento ni de benchmarks que permitan comparar la calidad relativa entre estas variantes. La diferencia principal entre ellas es el formato y el nivel de cuantizacion, no la arquitectura ni el entrenamiento.

## Limitaciones y advertencias

- El proceso de abliteration elimina los mecanismos de rechazo del modelo original; esto implica que puede generar contenido danino, ilegal o eticamente problematico sin advertencia, lo que exige supervision humana y filtros externos en cualquier despliegue en produccion.
- Riesgo elevado de alucinacion: al igual que el modelo base, puede inventar hechos, citas o referencias; el decensurado puede agravar este riesgo al reducir la cautela en las respuestas.
- Idiomas: la model card solo declara ingles; el rendimiento en castellano u otros idiomas no esta documentado y podria ser deficiente.
- Longitud de contexto no documentada en esta publicacion; conviene consultar la model card del modelo base Qwen3.5-35B-A3B para confirmarla antes de disenar aplicaciones con contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero el modelo derivado incorpora modificaciones de terceros (llmfan46) cuya trazabilidad de entrenamiento no esta documentada; conviene revisar las condiciones del modelo base original.
- El repositorio ocupa 371 GB y contiene multiples cuantizaciones; es necesario descargar solo el fichero GGUF deseado, no el repositorio completo.
- Para usar las capacidades de vision hay que descargar el fichero mmproj desde el repositorio de cuantizaciones estaticas, no desde este repositorio i1.
- No se han publicado evaluaciones de calidad para las cuantizaciones i1 de este modelo; las de muy baja precision (IQ1, IQ2) degradan notablemente la coherencia, como advierte la propia model card ("for the desperate", "very low quality").

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-35B-A3B-ultra-uncensored-heretic-i1-GGUF
- Modelo base decensurado: https://huggingface.co/llmfan46/Qwen3.5-35B-A3B-ultra-uncensored-heretic
- Cuantizaciones estaticas (incluye mmproj): https://huggingface.co/mradermacher/Qwen3.5-35B-A3B-ultra-uncensored-heretic-GGUF
- Modelo Qwen original: https://huggingface.co/Qwen/Qwen3.5-35B-A3B
- Licencia: https://huggingface.co/Qwen/Qwen3.5-35B-A3B/blob/main/LICENSE
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-35B-A3B-ultra-uncensored-heretic-i1-GGUF
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
