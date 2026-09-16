# bartowski/TheDrummer_Orion-26B-A4B-v1.1-GGUF

## Resumen

Orion-26B-A4B-v1.1 es un modelo de lenguaje multimodal publicado por el usuario TheDrummer, distribuido en formato GGUF por bartowski, un quantizer habitual de la escena open source. Se trata de una conversión del modelo original a cuantizaciones de llama.cpp (release b10896) con calibración imatrix, pensada para su ejecución local en hardware de consumo mediante llama.cpp, LM Studio, Ollama o koboldcpp. El pipeline declarado es "any-to-any" y la entrada admite texto, imagen y audio (este último requiere un fichero mmproj adicional).

El nombre del modelo sugiere una arquitectura de mezcla de expertos con unos 26.000 millones de parametros totales y aproximadamente 4.000 millones activos por token, siguiendo la convención de nomenclatura popularizada por la familia Qwen3. No obstante, esta interpretación no se confirma en la informacion disponible: el dato real de parametros en safetensors del modelo base es de 25.233.142.046, ligeramente por debajo de los 26B anunciados en la model card.

Su relevancia práctica radica en que ofrece entrada multimodal (vision y audio) en un paquete que cabe en una GPU de 24 GB con la cuantizacion Q4_K_M (17,97 GB) y que se puede servir enteramente en local, sin depender de APIs externas. La licencia no está declarada, lo que supone una limitación importante para cualquier uso comercial. El repositorio acumula 5.177 descargas y 10 "likes", y ocupa 426,2 GB en total por incluir todas las cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el sufijo A4B del nombre sugiere MoE con ~4.000 M de parametros activos, sin confirmar) |
| Parametros totales | 25.233.142.046 en safetensors del modelo base; 26B declarados en la model card |
| Parametros activos | no disponible (estimacion por nomenclatura: ~4.000 M) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q6_K_S, Q5_K_M, Q5_K_S, Q4_K_L, Q4_K_M, Q4_1, Q4_K_S, IQ4_NL, Q3_K_L, Q4_0, IQ3_M, IQ4_XS, Q3_K_M, IQ3_XS, IQ3_XXS (lista truncada en la informacion disponible) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |
| Entradas admitidas | texto, imagen y audio (imagen y audio requieren el fichero mmproj) |
| Decodificacion especulativa | no |
| Calibracion imatrix | si |
| Tamano del repositorio | 426,2 GB (todas las cuantizaciones) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base en la documentacion consultada. La nomenclatura "26B-A4B" y la etiqueta "any-to-any" apuntan a un transformer con mezcla de expertos (MoE) y capacidades multimodales de entrada, pero ni la model card de la cuantizacion ni los resultados de busqueda aportan confirmacion sobre el numero de expertos, la funcion de enrutado, el mecanismo de atencion ni la ventana de contexto efectiva. Tampoco se detalla el volumen de tokens de entrenamiento, la composicion del dataset, ni si se aplicaron etapas de RLHF, DPO o similares.

Lo unico verificable en esta ficha es el proceso de cuantizacion: bartowski ha generado las variantes GGUF con llama.cpp b10896, indicando que se ha utilizado una matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precision. El formato de prompt esta documentado y sigue un esquema de turnos con etiquetas especiales (`<|turn>system`, `<|turn>user`, `<|turn>model`) y un canal de razonamiento previo a la respuesta (`<|channel>thought` ... `<|channel|>`), lo que sugiere la existencia de un modo de pensamiento separado de la salida final.

## Capacidades

- Generacion de texto conversacional multi-turno, con formato de chat documentado mediante etiquetas de turno.
- Canal de razonamiento explicito previo a la respuesta, segun el formato de prompt publicado.
- Entrada de imagen (vision), supeditada al uso del fichero mmproj junto con el GGUF principal.
- Entrada de audio, tambien supeditada al fichero mmproj.
- Integracion con llama.cpp y herramientas compatibles con GGUF (LM Studio, koboldcpp, servidores OpenAI-compatibles).
- Compatibilidad declarada con endpoints gestionados (etiqueta endpoints_compatible en HuggingFace).
- Soporte de tool calling o function calling: no disponible en la informacion consultada.
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion consultada.
- Idiomas soportados: no disponible en la informacion consultada.

## Casos de uso

- Asistente conversacional local con entrada de voz: combinando el GGUF principal con el fichero mmproj en un `llama-server`, el modelo puede recibir audio directamente y mantener conversaciones habladas sin enviar datos a servicios externos, algo relevante en entornos con requisitos estrictos de privacidad.
- Analisis de imagenes en puesto de trabajo: con la cuantizacion Q4_K_M (17,97 GB) cabiendo en una RTX 4090 o 3090, se pueden enviar capturas, diagramas o fotografias al modelo para obtener descripciones, extraccion de texto o resumenes de contenido visual.
- Prototipado rapido de aplicaciones multimodales: la disponibilidad simultanea de bf16, cuantizaciones de 8 bits y de 4 bits permite ajustar el equilibrio entre calidad y consumo durante las fases de desarrollo sin cambiar de modelo.
- Despliegue on-premise en clústeres pequeños: las variantes Q8_0 (26,86 GB) y Q6_K (23,79 GB) son adecuadas para servidores con una o dos GPU de 24-48 GB cuando se requiere mayor fidelidad que en Q4_K_M.
- Evaluacion de tecnicas de cuantizacion: el repositorio incluye una escala completa desde bf16 hasta IQ3_XXS, lo que lo convierte en un banco de pruebas util para medir la degradacion de calidad en modelos multimodales con imatrix.
- Servicio de inferencia compatible con API OpenAI: la etiqueta endpoints_compatible y el soporte de llama.cpp permiten exponer el modelo mediante un endpoint con formato OpenAI y reutilizar clientes existentes.
- Documentacion accesible de material audiovisual: la entrada de audio e imagen admite flujos de descripcion automatica de contenido para personas con discapacidad visual, siempre que se valide la calidad en el idioma objetivo, actualmente no confirmado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card de la cuantizacion ni el repositorio incluyen cifras de MMLU, HumanEval, GSM8K, MMMU o cualquier otra evaluacion. Los resultados de busqueda web proporcionados no guardan relacion con el modelo (corresponden a consultas sobre motores de busqueda academicos), por lo que no aportan datos adicionales.

## Requisitos de hardware

Los tamanos que se indican a continuacion son los ficheros GGUF publicados. Las cifras de VRAM necesaria son estimaciones que anaden el espacio de la cache KV y el fichero mmproj para el modo multimodal.

| Cuantizacion | Tamano del fichero | VRAM estimada para inferencia |
|---|---|---|
| bf16 | 50,51 GB | 2 x A100 40 GB o 1 x H100 80 GB / A100 80 GB |
| Q8_0 | 26,86 GB | A100 40 GB, o 24 GB con offload parcial a CPU |
| Q6_K_L | 24,52 GB | 32 GB o superior; justo en GPU de 24 GB sin contexto largo |
| Q6_K | 23,79 GB | 32 GB o superior |
| Q6_K_S | 23,14 GB | 32 GB o superior |
| Q5_K_M | 20,01 GB | 24 GB con contexto moderado |
| Q5_K_S | 18,40 GB | 24 GB |
| Q4_K_L | 18,21 GB | 24 GB |
| Q4_K_M | 17,97 GB | 24 GB (RTX 3090, RTX 4090, RTX 5090); opcion recomendada por el autor |
| Q4_1 | 16,14 GB | 16-24 GB |
| Q4_K_S | 16,05 GB | 16-24 GB |
| IQ4_NL | 15,63 GB | 16 GB con margen limitado |
| Q4_0 | 14,76 GB | 16 GB |
| Q3_K_L | 14,80 GB | 16 GB |
| IQ3_M | 14,34 GB | 12-16 GB |
| IQ4_XS | 14,28 GB | 12-16 GB |
| Q3_K_M | 13,79 GB | 12-16 GB |
| IQ3_XS | 12,84 GB | 12 GB |

- Cabe en GPU de consumo: si, desde IQ3_XS (12,84 GB) hasta Q4_K_M (17,97 GB) en tarjetas de 16-24 GB. Las cuantizaciones superiores a Q5_K_M exigen 32 GB o reparto entre GPU y CPU.
- GPU recomendadas: RTX 4090 / 3090 (24 GB) para Q4_K_M y Q4_K_L; RTX 5090 o A6000 (32-48 GB) para Q6; A100 40 GB u H100 80 GB para Q8_0 y bf16.
- Opciones de despliegue: llama.cpp (version b10896 o posterior, necesaria para el formato de prompt y el soporte multimodal), `llama-server` con `--mmproj` para vision y audio, LM Studio, koboldcpp, Ollama mediante importacion del GGUF y entornos de inferencia compatibles con GGUF. vLLM y TGI no consumen GGUF directamente, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput: no disponible. Si se confirma la arquitectura MoE con aproximadamente 4.000 millones de parametros activos, el rendimiento por token seria notablemente superior al de un modelo denso de 26B, pero esta afirmacion no puede verificarse con la informacion disponible.

## Comparativa con modelos similares

Los datos de Orion-26B-A4B-v1.1 corresponden a lo declarado en el repositorio de cuantizacion; los de los modelos alternativos reflejan sus fichas oficiales y pueden variar segun la version concreta.

| Modelo | Parametros | Contexto | Modalidades de entrada | Licencia | Formato GGUF |
|---|---|---|---|---|---|
| Orion-26B-A4B-v1.1 | 25,23B (safetensors) / 26B declarados | no disponible | texto, imagen, audio | no disponible | si |
| Mistral Small 3.1 24B Instruct | 24B | 128.000 tokens | texto, imagen | Apache 2.0 | si |
| Gemma 3 27B IT | 27B | 128.000 tokens | texto, imagen | licencia Gemma | si |

Orion se diferencia de ambas alternativas por admitir audio ademas de imagen, una combinacion poco frecuente en modelos de este tamano. En contrapartida, Mistral Small 3.1 y Gemma 3 cuentan con licencias explicitas y contexto documentado, mientras que en Orion ni la licencia ni la ventana de contexto estan declaradas, lo que complica la evaluacion previa a un despliegue en produccion.

## Limitaciones y advertencias

- Licencia no declarada: sin una licencia explicita no es posible determinar si el uso comercial esta permitido. Cualquier despliegue en produccion deberia aclarar este punto con el autor del modelo base antes de continuar.
- Ausencia total de benchmarks: no hay evidencia publicada sobre calidad de generacion, razonamiento, codigo o capacidades multimodales, por lo que cualquier afirmacion de rendimiento seria especulativa.
- Idiomas no documentados: se desconoce que lenguas estan soportadas y con que calidad. El castellano podria no estar cubierto de forma fiable.
- Contexto desconocido: al no publicarse la longitud de contexto, no se puede planificar el uso en escenarios de documentos largos ni dimensionar correctamente la cache KV.
- Riesgo de alucinacion: inherente a los modelos generativos y agravado aqui por la falta de evaluaciones que permitan acotarlo.
- Requisito de mmproj: las capacidades de vision y audio no funcionan con el GGUF aislado; es imprescindible descargar y cargar el fichero mmproj correspondiente, y el soporte depende de la version de llama.cpp utilizada.
- Degradacion por cuantizacion: las variantes por debajo de Q4_K_S (IQ3_XS, IQ3_XXS, Q3_K_M) pueden perder calidad de forma apreciable, especialmente en tareas multimodales y de razonamiento.
- Repositorio muy pesado: 426,2 GB en total; conviene descargar unicamente el fichero necesario y evitar clonados completos.
- Trazabilidad limitada: se desconoce el dataset de entrenamiento, el proceso de alineacion y el origen de los datos multimodales, lo que impide evaluar sesgos especificos.
- Fecha de publicacion atipica: el repositorio figura creado el 13 de septiembre de 2026, dato que conviene contrastar con la pagina original.

## Enlaces

- Repositorio GGUF: https://huggingface.co/bartowski/TheDrummer_Orion-26B-A4B-v1.1-GGUF
- Modelo base: https://huggingface.co/TheDrummer/Orion-26B-A4B-v1.1
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Release de llama.cpp utilizada para la cuantizacion (b10896): https://github.com/ggml-org/llama.cpp/releases/tag/b10896
- Cuantizacion recomendada (Q4_K_M, 17,97 GB): https://huggingface.co/bartowski/TheDrummer_Orion-26B-A4B-v1.1-GGUF/blob/main/TheDrummer_Orion-26B-A4B-v1.1-Q4_K_M.gguf
- Los resultados de busqueda web disponibles no contienen ningun enlace relacionado con este modelo: las entradas devueltas tratan sobre motores de busqueda academicos y no aportan papers, blogs ni demos del modelo.
