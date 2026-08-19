# mradermacher/gemma-4-E4B-it-heretic-i1-GGUF

## Resumen

El modelo `gemma-4-E4B-it-heretic-i1-GGUF` es una cuantizacion GGUF del modelo `coder3101/gemma-4-E4B-it-heretic`, un modelo de lenguaje de gran tamano derivado de la familia Gemma 4 de Google DeepMind. La variante "heretic" ha sido sometida a un proceso de abliteracion, una tecnica que elimina parcialmente los mecanismos de rechazo y seguridad del modelo original, dando lugar a un asistente sin censura que responde a solicitudes que el modelo base rechazaria. El repositorio lo publica el usuario mradermacher, que se dedica a generar cuantizaciones de alta calidad con imatrix.

Este modelo es relevante para desarrolladores e investigadores que necesitan un LLM local sin restricciones de contenido para tareas de generacion de texto, roleplay o experimentacion. La arquitectura subyacente corresponde a Gemma 4 E4B, un modelo de tipo mixture-of-experts (MoE) con aproximadamente 7.460 millones de parametros totales y alrededor de 4.000 millones de parametros activos, que soporta entrada multimodal (texto, imagen y audio) y una ventana de contexto de hasta 256.000 tokens. La licencia Apache-2.0 permite uso comercial sin restricciones significativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) basada en transformer, variante Gemma 4 E4B |
| Parametros totales | 7.463.013.674 (7,46 B) |
| Parametros activos | ~4 B (E4B) |
| Longitud de contexto | Hasta 256.000 tokens (segun especificaciones de Gemma 4) |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles); el modelo base Gemma 4 soporta 140+ idiomas, pero esta variante esta etiquetada solo como en |
| Licencia | Apache-2.0 (con enlace a la licencia de Gemma 4 de Google) |
| Formato de pesos | GGUF (con archivo imatrix para generar cuantizaciones personalizadas) |

## Arquitectura y entrenamiento

El modelo base `coder3101/gemma-4-E4B-it-heretic` es una variante de la familia Gemma 4 de Google DeepMind, concretamente la version E4B, que emplea una arquitectura de mezcla de expertos (MoE) con 4.000 millones de parametros activos de un total de 7.460 millones. Gemma 4 introduce un enfoque de "pensamiento hibrido" (hybrid-thinking) que combina razonamiento explicito con generacion directa, y es multimodal, aceptando entradas de texto, imagen y audio. El modelo original fue entrenado con un corpus extenso y posteriormente ajustado con instrucciones (instruction tuning) y tecnicas de alineacion.

La variante "heretic" aplica una tecnica de abliteracion, que identifica y elimina selectivamente las direcciones en el espacio de activaciones responsables del comportamiento de rechazo y seguridad. Esto produce un modelo que mantiene sus capacidades generales pero pierde gran parte de su alineacion de seguridad. La cuantizacion realizada por mradermacher utiliza el metodo imatrix (importance matrix), que calcula las estadisticas de activacion del modelo para optimizar la asignacion de bits en la cuantizacion, mejorando la calidad respecto a las cuantizaciones estaticas convencionales.

## Capacidades

- Generacion de texto libre y conversacional sin filtros de contenido ni rechazos por temas sensibles.
- Razonamiento y resolucion de problemas, incluyendo tareas de logica y matematicas basicas.
- Generacion de codigo en multiples lenguajes de programacion.
- Entrada multimodal (vision y audio) en el modelo base, aunque las cuantizaciones GGUF requieren archivos mmproj adicionales que se encuentran en el repositorio estatico.
- Soporte de modo de pensamiento (thinking mode) que genera un razonamiento interno antes de responder.
- Capacidad de manejar contextos muy largos (hasta 256K tokens), adecuado para documentos extensos.
- Funcionamiento en ingles; las capacidades multilingues del modelo base pueden verse afectadas por la cuantizacion.

## Casos de uso

- Roleplay y ficcion interactiva sin restricciones: el modelo puede generar narrativas con contenido adulto o temas tabu que otros modelos rechazarian, manteniendo coherencia en conversaciones de multiples turnos gracias a su ventana de contexto de 256K tokens.
- Investigacion academica sobre alineacion y seguridad: permite estudiar como la abliteracion afecta al comportamiento del modelo, comparando respuestas antes y despues de eliminar los mecanismos de rechazo.
- Generacion de contenido creativo para ficcion: escritores pueden explorar temas controvertidos sin que el modelo imponga censura, usando cuantizaciones Q4_K_M para un equilibrio optimo entre calidad y velocidad.
- Pruebas de robustez y red teaming: los desarrolladores de seguridad pueden evaluar que tipo de solicitudes maliciosas superan los filtros eliminados y disenar contramedidas.
- Chatbots locales sin censura para uso personal: desplegado con Ollama o llama.cpp, permite ejecutar un asistente en hardware de consumo (8 GB de VRAM) que responde sin restricciones.
- Experimentacion con cuantizaciones extremas: el archivo imatrix incluido permite a los usuarios generar sus propias cuantizaciones personalizadas y estudiar el impacto de diferentes niveles de precision en la calidad de salida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye datos de evaluacion sobre MMLU, HumanEval, GSM8K u otros benchmarks estandar. La calidad relativa de las distintas cuantizaciones se indica de forma cualitativa en la tabla de quants, donde se recomiendan ciertos formatos (IQ4_XS, Q4_K_M) sobre otros por su mejor equilibrio entre tamano y calidad, pero sin metricas numericas concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: desde ~4,5 GB para la cuantizacion i1-Q2_K hasta ~6,3 GB para i1-Q6_K, lo que permite ejecutar el modelo en GPUs de consumo con 8 GB de VRAM.
- GPU recomendadas: NVIDIA RTX 3060 (12 GB), RTX 4070, RTX 4090, o GPUs de datacenter como A10, A100 o H100 para mayor velocidad.
- Es compatible con hardware de consumo: si, cualquier GPU con al menos 8 GB de VRAM puede ejecutar las cuantizaciones mas pequeñas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, kobold.cpp, text-generation-webui, y cualquier framework compatible con GGUF.
- Latencia y throughput: no se proporcionan datos especificos, pero las cuantizaciones Q4_K_M y Q5_K_M ofrecen un buen equilibrio entre velocidad y calidad; las cuantizaciones IQ (IQ3, IQ4) son mas lentas pero con mejor calidad por bit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Observaciones |
|---|---|---|---|---|---|
| gemma-4-E4B-it-heretic-i1-GGUF (este) | 7,46 B totales / ~4 B activos | 256K | Apache-2.0 | GGUF | Abliterado, sin censura |
| gemma-4-E4B-it-ultra-uncensored-heretic-GGUF | ~7,46 B | 256K | Apache-2.0 | GGUF | Variante "ultra" con abliteracion mas agresiva |
| Gemma 4 E4B original (sin abliterar) | 7,46 B totales / ~4 B activos | 256K | Apache-2.0 | safetensors | Con alineacion de seguridad intacta |
| Gemma 3 4B (generacion anterior) | 4 B densos | 128K | Gemma license | safetensors/GGUF | Denso, sin soporte multimodal completo |

La principal diferencia entre este modelo y las alternativas es la eliminacion de la alineacion de seguridad. Frente al Gemma 4 E4B original, pierde los mecanismos de rechazo pero mantiene capacidades similares. La variante "ultra-uncensored" aplica una abliteracion mas profunda, mientras que esta version "heretic" es una abliteracion estandar.

## Limitaciones y advertencias

- El modelo ha sido sometido a abliteracion, lo que elimina los mecanismos de seguridad y rechazo. Puede generar contenido ofensivo, ilegal, peligroso o eticamente cuestionable sin restricciones.
- Riesgo elevado de alucinacion, especialmente en cuantizaciones de baja precision (Q2_K, IQ3), donde la calidad de los hechos puede degradarse notablemente.
- La documentacion indica que el modelo base es multimodal, pero las cuantizaciones GGUF requieren archivos mmproj separados que no estan incluidos en este repositorio; sin ellos, solo funciona con entrada de texto.
- Aunque la licencia Apache-2.0 permite uso comercial, el uso de un modelo sin censura puede violar las politicas de las plataformas de despliegue o las leyes locales sobre contenido generado.
- El idioma soportado se limita al ingles en esta variante cuantizada; el rendimiento en otros idiomas puede ser deficiente o inexistente.
- El modelo base Gemma 4 esta pensado para ejecutarse en local, pero las cuantizaciones de baja precision pueden introducir artefactos visibles en la generacion de texto largo.
- La abliteracion no es perfecta: algunos mecanismos de seguridad pueden persistir de forma residual, produciendo comportamientos impredecibles en ciertos temas.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/gemma-4-E4B-it-heretic-i1-GGUF
- Repositorio estatico (sin imatrix): https://huggingface.co/mradermacher/gemma-4-E4B-it-heretic-GGUF
- Modelo base: https://huggingface.co/coder3101/gemma-4-E4B-it-heretic
- Variante ultra-uncensored: https://huggingface.co/mradermacher/gemma-4-E4B-it-ultra-uncensored-heretic-GGUF
- Documentacion de Gemma 4 en Unsloth: https://unsloth.ai/docs/models/gemma-4
- Pagina dedicada a Gemma 4 E4B: https://gemma4.dev/models/gemma-4-e4b
- Version en Ollama: https://ollama.com/igorls/gemma-4-E4B-it-heretic-GGUF:Q4_K_M
