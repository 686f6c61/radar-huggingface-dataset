# Guile/nbeerbower_BigBubba-Qwen3.6-27B-GGUF

## Resumen

BigBubba-Qwen3.6-27B es un modelo de lenguaje multimodal (texto e imagen) basado en Qwen3.6 27B denso, desarrollado por nbeerbower mediante un proceso de fusión (merge) que combina ajuste con ORPO sobre el dataset GreatFirewall-DPO y una técnica de ablación de rechazo (abliteration) para eliminar la censura del modelo original. La versión GGUF aquí descrita, publicada por el usuario Guile y cuantizada por bartowski con llama.cpp, ofrece el modelo en múltiples formatos de cuantización con matriz de importancia (imatrix) para facilitar su despliegue en entornos locales con recursos limitados.

El modelo hereda la arquitectura de Qwen3.6 27B: un transformer denso de 64 capas con atención de consulta agrupada (GQA), 27.400 millones de parámetros y soporte para predicción multi-token (MTP). Al tratarse de una cuantización GGUF, el fichero principal se complementa con un archivo mmproj para la entrada de imágenes. Su relevancia actual radica en ofrecer una alternativa sin censura, con licencia Apache 2.0 y capacidades multimodales, lista para ejecutarse en hardware de consumo mediante llama.cpp, Ollama o vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (qwen3_5_text) con GQA: 64 capas, hidden size 5120, 24 query heads, 4 key/value heads, feed-forward 17408 |
| Parametros totales | 27.320.697.856 (27,4B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | bf16, Q8_0, Q6_K_L, Q6_K, Q5_K_L, Q5_K_M, Q5_K_S, Q4_K_L, Q4_1, Q4_K_M, Q4_K_S, Q3_K_XL, Q4_0, IQ4_NL, IQ4_XS, Q3_K_L, Q3_K_M, IQ3_M |
| Idiomas soportados | Ingles (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base BigBubba-Qwen3.6-27B es un transformer denso de 64 capas con una dimension oculta de 5120 y atencion de consulta agrupada (GQA) con 24 cabezas de consulta y 4 cabezas clave/valor. La capa feed-forward tiene un tamano intermedio de 17408. Soporta prediccion multi-token (MTP) y entrada multimodal: texto e imagen mediante un archivo mmproj separado.

El proceso de entrenamiento combina un merge con ajuste mediante ORPO sobre el dataset nbeerbower/GreatFirewall-DPO y una etapa de abliteration, tecnica que elimina selectivamente las direcciones de los pesos asociadas con comportamientos de rechazo o censura. El resultado es un modelo etiquetado como "uncensored". La cuantizacion GGUF fue realizada con llama.cpp b10173 e incluye matriz de importancia (imatrix) para mejorar la calidad de las cuantizaciones de baja precision.

## Capacidades

- Generacion de texto y razonamiento, heredadas de la familia Qwen3.6.
- Entrada multimodal: procesa imagenes ademas de texto (requiere el archivo mmproj correspondiente).
- Prediccion multi-token (MTP) para acelerar la decodificacion.
- Comportamiento sin censura gracias a la abliteration y el ajuste con ORPO.
- Multilingue: ingles y chino.
- Formato de prompt ChatML con marcador de pensamiento (" thinking") al inicio de la respuesta del asistente, lo que sugiere soporte de modo razonamiento.
- No se confirma en la informacion disponible el soporte de tool calling ni function calling, aunque es probable que lo herede de Qwen3.6; debe verificarse en el modelo base.

## Casos de uso

- Despliegue local en GPU de consumo: las cuantizaciones Q4_K_M (17,77 GB) y Q5_K_M (20,75 GB) caben en tarjetas de 24 GB como la RTX 4090, permitiendo ejecutar un LLM multimodal de 27B en un equipo domestico con llama.cpp o Ollama.
- Analisis de imagenes y generacion de descripciones: gracias al soporte multimodal, puede utilizarse para tareas de captioning, extraccion de informacion visual o asistencia a personas con discapacidad visual, ejecutandose de forma local sin enviar datos a la nube.
- Investigacion en alineacion y seguridad: al ser un modelo "uncensored" con licencia abierta, resulta util para estudiar los efectos de la abliteration y el ORPO en el comportamiento de modelos grandes, comparando respuestas antes y despues del proceso.
- Procesamiento bilingue ingles-chino: adecuado para traduccion, resumen o generacion de contenido en ambos idiomas, especialmente cuando se requiere privacidad y no se pueden usar APIs externas.
- Prototipado rapido de aplicaciones conversacionales: con vLLM o TGI, el modelo puede servir como backend de chatbots o asistentes virtuales en entornos de desarrollo, aprovechando el formato GGUF para iterar rapidamente sobre diferentes cuantizaciones.
- Experimentacion con generacion de codigo y razonamiento: aunque no se publican benchmarks especificos, al derivar de Qwen3.6 se espera un rendimiento solido en tareas de programacion y logica, util para generar esqueletos de codigo o resolver problemas de algoritmia en entornos sin conexion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos numericos de MMLU, HumanEval, GSM8K u otras pruebas estandar para este modelo especifico, ni comparaciones cuantitativas con la familia Qwen3.6 original.

## Requisitos de hardware

- VRAM estimada para inferencia: desde 13,9 GB (cuantizacion IQ3_M) hasta 54,66 GB (bf16 completo). La cuantizacion recomendada Q4_K_M ocupa 17,77 GB, por lo que cabe en GPUs de 24 GB.
- GPUs recomendadas: RTX 4090 o RTX 3090 (24 GB) para cuantizaciones Q4-Q6; A100 40 GB o dual GPU para Q8_0 (29,12 GB); A100 80 GB o H100 para bf16.
- Si cabe en GPU de consumo: si, con cuantizaciones de Q4_K_M hacia abajo en tarjetas de 24 GB; las versiones Q3 e IQ3 pueden ejecutarse en GPUs de 16 GB como la RTX 4080 o la RTX 4060 Ti, aunque con perdida de calidad.
- Opciones de despliegue: llama.cpp (formato nativo), Ollama, vLLM (con soporte para GGUF mediante conversion), TGI y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada. La guia de vLLM Blackwell para Qwen3.6 27B recomienda no usar tensor-parallel en sistemas de doble GPU por el overhead de comunicacion PCIe, y sugiere servidores vLLM independientes por GPU con un balanceador frontal.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Contexto | Multimodal | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| BigBubba-Qwen3.6-27B (este) | 27,4B denso | Transformer GQA | No disponible | Si (texto+imagen) | Apache 2.0 | GGUF en HF |
| Qwen3.6 27B dense (original) | 27,4B denso | Transformer GQA | No disponible | No confirmado | Apache 2.0 | Pesos originales |
| Qwen3.6 35B-A3B MoE | 35B total, 3B activos | MoE | No disponible | No confirmado | Apache 2.0 | Pesos originales |

La comparativa se limita a los datos publicados. BigBubba se diferencia del Qwen3.6 original por el proceso de merge con ORPO y abliteration, y por estar disponible en formato GGUF cuantizado. El modelo MoE de 35B ofrece una alternativa mas eficiente en inferencia si se requiere menor latencia, aunque con distinta arquitectura.

## Limitaciones y advertencias

- Al ser un modelo sin censura, puede generar contenido inapropiado, ofensivo o peligroso si se usa sin filtros adicionales. No es recomendable para aplicaciones dirigidas al publico general sin una capa de moderacion.
- Riesgo de alucinacion: como cualquier LLM, puede inventar hechos, citas o referencias. La ausencia de benchmarks publicados impide conocer su fiabilidad real en tareas factuales.
- Sesgos del dataset de entrenamiento: el ajuste con GreatFirewall-DPO y la abliteration pueden introducir sesgos especificos, especialmente en temas politicos o culturales relacionados con la censura china.
- Idiomas limitados: solo ingles y chino estan declarados; el rendimiento en otros idiomas no esta garantizado.
- Longitud de contexto no confirmada: no se ha publicado el tamano de la ventana de contexto, lo que dificulta planificar tareas que requieran contexto largo.
- Para uso multimodal es imprescindible descargar el archivo mmproj correspondiente; sin el, el modelo solo procesa texto.
- Aunque la licencia es Apache 2.0, es recomendable verificar la licencia del modelo base Qwen3.6 y de los datasets utilizados antes de un despliegue comercial.

## Enlaces

- Repositorio GGUF: https://huggingface.co/Guile/nbeerbower_BigBubba-Qwen3.6-27B-GGUF
- Repositorio original de la cuantizacion (bartowski): https://huggingface.co/bartowski/nbeerbower_BigBubba-Qwen3.6-27B-GGUF
- Modelo base: https://huggingface.co/nbeerbower/BigBubba-Qwen3.6-27B
- Grafo de arquitectura (hfviewer): https://hfviewer.com/nbeerbower/BigBubba-Qwen3.6-27B
- Guia de despliegue con vLLM en Blackwell: https://github.com/lastloop-ai/vllm-blackwell-guide
- Guia de Qwen 3.6 (comparativa 27B dense vs 35B MoE): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
