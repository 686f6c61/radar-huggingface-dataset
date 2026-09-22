# mradermacher/wag-4b-i1-GGUF

## Resumen

wag-4b-i1-GGUF es una reproduccion cuantizada en formato GGUF del modelo skyuu72/wag-4b, publicada por mradermacher, un autor conocido por generar cuantizaciones de terceros (tanto estaticas como con matriz de importancia, "imatrix") de modelos abiertos. El repositorio no contiene pesos originales en precision completa, sino ficheros derivados listos para su uso con llama.cpp y otros runners compatibles con GGUF. El modelo base se describe como un modelo de chat orientado a personaje ("character", "puppygirl") con arquitectura etiquetada como qwen3_5 y entrenado sobre OpenAssistant/oasst1 y yahma/alpaca-cleaned.

El nombre del repositorio sugiere un tamano de aproximadamente 4000 millones de parametros, coherente con el sufijo "4b" del modelo base. Sin embargo, el dato de parametros totales reportado en la ficha de HuggingFace para este repositorio es de 897.272, una cifra incompatible con un modelo de 4B y que probablemente corresponda a un conteo parcial, a un artefacto auxiliar o a un error de indexacion del repositorio. No se dispone de informacion fiable sobre el numero real de parametros ni sobre la longitud de contexto nativa.

La relevancia de esta ficha es practica: se trata de un artefacto de despliegue, no de un modelo nuevo. Su interes esta en que permite ejecutar un modelo de la familia "wag" en hardware de consumo mediante cuantizaciones de 1 a 6 bits, incluyendo variantes IQ (importance-aware) que mejoran la relacion calidad/tamano respecto a las cuantizaciones estaticas equivalentes. La licencia wtfpup-1.0, con enlace a un repositorio de GitHub del autor original, condiciona cualquier uso comercial y debe revisarse antes de integrar el modelo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el tag del repositorio apunta a qwen3_5; el modelo base es skyuu72/wag-4b) |
| Parametros totales | dato inconsistente: la ficha reporta 897.272 parametros, incompatible con el nombre "4b"; se asume aproximadamente 4B segun el nombre del modelo base, sin confirmacion |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ1_S, IQ1_M, IQ2_XXS, IQ2_XS, IQ2_S, IQ2_M, IQ3_XXS, IQ3_XS, IQ3_S, IQ3_M, IQ4_XS, IQ4_NL (small), Q2_K, Q2_K_S, Q3_K_S, Q3_K_M, Q3_K_L, Q4_0, Q4_1, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, ademas de un fichero imatrix para generar cuantizaciones propias |
| Idiomas soportados | en (ingles) |
| Licencia | wtfpup-1.0 (license_name: wtfpup-1.0, license: other), texto completo en https://github.com/Metrix187/wtfpup/blob/main/LICENSE |
| Formato de pesos | GGUF (cuantizaciones imatrix / weighted); existen tambien cuantizaciones estaticas en mradermacher/wag-4b-GGUF |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base en la documentacion proporcionada. El tag "qwen3_5" asociado al repositorio sugiere una arquitectura de tipo transformer decoder-only derivada de la familia Qwen, pero no se confirma en la model card ni se especifican dimensiones de capas, numero de cabezas de atencion, tipo de normalizacion ni mecanismos de atencion (por ejemplo, atencion lineal o decodificacion especulativa). Tampoco se indica si se trata de un transformer denso o de una arquitectura MoE.

En cuanto a los datos de entrenamiento, la model card lista unicamente dos conjuntos de datos: OpenAssistant/oasst1, un corpus multilingue de conversaciones de tipo asistente anotadas por la comunidad, y yahma/alpaca-cleaned, una version limpiada del dataset Alpaca de instrucciones. No se especifica el numero de tokens procesados, la composicion exacta del dataset, el uso de tecnicas de alineacion como RLHF o DPO, ni el proceso de ajuste fino aplicado. Esta cuantizacion en particular, al ser un artefacto derivado, no introduce cambios en la arquitectura: solo comprime los pesos mediante cuantizacion por bloques, con variantes generadas a partir de una matriz de importancia (imatrix) para reducir la perdida de perplejidad en los niveles de bits mas bajos.

## Capacidades

- Generacion de texto conversacional: el modelo esta orientado a chat multi-turno y a la representacion de personajes, segun los tags "chat" y "character" del repositorio.
- Roleplay y personajes consistentes: el tag "puppygirl" y la naturaleza del modelo base indican un ajuste orientado a personalidad y estilo de personaje, no a tareas genericas de asistente.
- Ingles como unico idioma declarado: no hay evidencia de capacidades multilingues mas alla del ingles.
- Soporte de tool calling / function calling: no disponible; no se menciona en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se menciona en la informacion proporcionada.
- Modo de razonamiento explicito (thinking mode): no disponible.
- Capacidades de vision o audio: no disponibles; el repositorio no incluye ficheros mmproj ni referencias a modalidades adicionales.
- Capacidades de codigo y matematicas: no documentadas especificamente para este modelo.

## Casos de uso

- Despliegue de un companero conversacional con personalidad en local: el modelo puede ejecutarse completamente offline mediante llama.cpp u Ollama en un equipo de consumo, lo que permite construir asistentes de chat con personaje sin enviar datos a servicios externos.
- Prototipado rapido de aplicaciones de roleplay: las cuantizaciones de 2 a 4 bits permiten iterar sobre prompts de personaje en portatiles o GPUs modestas, con tiempos de carga reducidos gracias al tamano de fichero (del orden de 1 a 3 GB en los niveles bajos).
- Evaluacion comparativa de calidad de cuantizacion: el repositorio incluye un fichero imatrix y un amplio abanico de niveles (de IQ1_S a Q6_K), lo que lo convierte en un caso util para medir la degradacion de perplejidad y coherencia entre cuantizaciones sobre un mismo modelo base.
- Generacion de dialogos sinteticos en ingles para datasets de entrenamiento: puede emplearse como generador de conversaciones de estilo roleplay, siempre que la licencia wtfpup-1.0 lo permita para el uso previsto.
- Chatbots de nicho en comunidades cerradas: al ser un modelo pequeno y cuantizable, encaja en despliegues de bajo coste para comunidades de roleplay que priorizan estilo sobre conocimiento factual.
- Investigacion sobre alineacion y estilo: permite estudiar como un ajuste sobre oasst1 y alpaca-cleaned se comporta en dominios de personaje, y como la cuantizacion agresiva afecta a la consistencia de la personalidad.
- Base para fine-tuning ligero: los pesos GGUF no son adecuados para entrenamiento, pero el modelo base skyuu72/wag-4b si puede servir como punto de partida para adaptaciones con LoRA, siempre bajo los terminos de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del repositorio no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y la busqueda web realizada no devolvio ningun resultado relacionado con el modelo. Tampoco se documentan mediciones de perplejidad para las distintas cuantizaciones ofrecidas.

## Requisitos de hardware

Las siguientes cifras son estimaciones derivadas del supuesto de que el modelo tiene aproximadamente 4000 millones de parametros, ya que el dato oficial de parametros del repositorio es inconsistente. Deben tomarse como orientativas.

- VRAM estimada para inferencia: en torno a 1-1,5 GB para cuantizaciones IQ1/IQ2, 2-2,5 GB para Q3_K/IQ3, 2,5-3 GB para Q4_K_M, 3-3,5 GB para Q5_K_M y 4-5 GB para Q6_K, ademas del overhead de la ventana de contexto (KV cache).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090 y cualquier GPU con 6 GB o mas de VRAM para los niveles de cuantizacion altos. En el ambito profesional, A100, H100 y L40S son sobredimensionadas para este tamano, salvo por despliegue concurrente a gran escala.
- Compatibilidad con GPU de consumo: si, el modelo esta disenado implicitamente para ello; con cuantizaciones Q4_K_M o inferiores cabe incluso en iGPUs y en sistemas con memoria unificada (Apple Silicon, por ejemplo).
- CPU y memoria RAM: las cuantizaciones de 2 a 4 bits pueden ejecutarse en CPU con 4-8 GB de RAM disponible, a velocidades de pocos tokens por segundo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python, koboldcpp y otros runners compatibles con GGUF. vLLM y TGI tienen soporte parcial o experimental de GGUF; para produccion de alto throughput suele ser preferible partir de los pesos originales en safetensors.
- Latencia y throughput estimados: no disponibles; dependen del nivel de cuantizacion, del hardware y de la longitud de contexto, y no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato / disponibilidad |
|---|---|---|---|---|
| wag-4b-i1-GGUF (esta ficha) | no confirmado (nombre sugiere ~4B) | no disponible | wtfpup-1.0 (uso comercial condicionado; revisar) | GGUF, cuantizaciones IQ y Q de 1 a 6 bits |
| skyuu72/wag-4b (modelo base) | no disponible | no disponible | wtfpup-1.0 | safetensors / transformers |
| Qwen2.5-3B-Instruct | 3B (aproximado, dato publico del autor) | 32.768 tokens segun la documentacion publica de Qwen | Apache 2.0 | safetensors, GGUF comunitario, amplio soporte de runners |
| Llama-3.2-3B-Instruct | 3B (aproximado, dato publico de Meta) | 128.000 tokens segun la documentacion publica de Meta | Llama 3.2 Community License | safetensors, GGUF comunitario |

No se dispone de datos de rendimiento comparativo entre wag-4b y estas alternativas, por lo que la comparacion se limita a parametros, contexto declarado y licencia. Los datos de las alternativas corresponden a informacion publica de sus respectivos autores y no a mediciones realizadas sobre el modelo objeto de esta ficha.

## Limitaciones y advertencias

- Inconsistencia en los metadatos: el repositorio declara 897.272 parametros totales, cifra incompatible con el nombre "4b" y con el tamano esperado de las cuantizaciones. Verificar los pesos antes de asumir cualquier requisito de memoria.
- Ausencia total de benchmarks: no hay ninguna evaluacion publicada, ni del modelo base ni de las cuantizaciones, por lo que no es posible estimar su calidad objetiva frente a alternativas.
- Cobertura idiomatica limitada: solo se declara ingles ("en"). El rendimiento en castellano u otros idiomas es desconocido y probablemente deficiente.
- Riesgo de alucinacion: inherente a cualquier modelo de ~4B ajustado sobre datasets de instrucciones y conversacion; no hay evaluaciones de factualidad.
- Sesgos: los datasets de entrenamiento (OpenAssistant/oasst1 y alpaca-cleaned) contienen sesgos propios de datos generados y anotados por comunidades, con posible infrarrepresentacion de idiomas y culturas no anglosajonas. Ademas, el ajuste orientado a personaje puede introducir respuestas fuera de tono en contextos profesionales.
- Restricciones de licencia: la licencia wtfpup-1.0 es una licencia personalizada ("other") cuyo texto completo esta en un repositorio externo de GitHub. Debe leerse antes de cualquier uso comercial, redistribucion o reentrenamiento; no puede asumirse equiparable a Apache 2.0 o MIT.
- Cuantizaciones agresivas: los niveles IQ1_S, IQ1_M e IQ2_XXS degradan notablemente la coherencia y la perplejidad. Para uso real se recomienda Q4_K_M o superior.
- Naturaleza del artefacto: este repositorio no es el modelo original, sino una conversion realizada por un tercero. Los posibles errores de conversion, tokenizacion o metadatos no son responsabilidad del autor del modelo base.
- Contexto desconocido: al no documentarse la longitud de contexto, no conviene asumir ventanas largas en produccion; hay que validarla empiricamente antes de disenar aplicaciones que dependan de contexto extenso.

## Enlaces

- Repositorio HuggingFace (esta cuantizacion): https://huggingface.co/mradermacher/wag-4b-i1-GGUF
- Modelo base: https://huggingface.co/skyuu72/wag-4b
- Cuantizaciones estaticas del mismo modelo: https://huggingface.co/mradermacher/wag-4b-GGUF
- Fichero imatrix: https://huggingface.co/mradermacher/wag-4b-i1-GGUF/resolve/main/wag-4b.imatrix.gguf
- Pagina de resumen y descargas del autor: https://hf.tst.eu/model#wag-4b-i1-GGUF
- Texto de la licencia wtfpup-1.0: https://github.com/Metrix187/wtfpup/blob/main/LICENSE
- Guia de uso de GGUF (README de referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Preguntas frecuentes y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafica comparativa de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Patrocinador del trabajo de cuantizacion: https://www.nethype.de/

Nota: la busqueda web realizada para esta ficha no devolvio ningun resultado relacionado con el modelo; los unicos enlaces relevantes son los procedentes del propio repositorio de HuggingFace.
