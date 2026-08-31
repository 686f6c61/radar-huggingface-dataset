# mradermacher/Llama-3.1-8B-Instruct-Uncensored-Complete-i1-GGUF

## Resumen

Este repositorio contiene la cuantización GGUF con matriz de importancia (imatrix) del modelo ApolloRaines/Llama-3.1-8B-Instruct-Uncensored-Complete, una versión "sin censura" de Llama-3.1-8B-Instruct creada mediante técnicas de *abliteration* e *representation engineering*. El autor, mradermacher, es un cuantizador habitual en Hugging Face que publica pesos en formato GGUF para su uso con llama.cpp y otros motores de inferencia locales.

El modelo base elimina los mecanismos de rechazo del Llama-3.1-8B-Instruct original, lo que permite generar respuestas sin las restricciones habituales de seguridad, manteniendo en teoría las capacidades lingüísticas y de razonamiento del modelo original. Esta versión cuantizada facilita su ejecución en hardware de consumo, con tamaños de archivo que van desde aproximadamente 3 GB hasta 6 GB según el nivel de cuantización.

La relevancia actual radica en la demanda de modelos "uncensored" para aplicaciones creativas, roleplay o investigación sobre alineación, así como en la utilidad de las cuantizaciones GGUF para desplegar modelos en entornos con recursos limitados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama 3.1 (transformer decoder-only) |
| Parametros totales | 8.030.261.312 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el Llama-3.1-8B-Instruct original soporta 128K, pero no se confirma para esta version) |
| Tipos de cuantizacion | GGUF: Q2_K, IQ3_M, Q4_K_S, IQ3_XXS, Q3_K_M, small-IQ4_NL, Q4_K_M, IQ2_M, Q6_K, IQ4_XS, Q2_K_S, IQ1_M, Q3_K_S, IQ2_XXS, Q3_K_L, IQ2_XS, Q5_K_S, IQ2_S, IQ1_S, Q5_K_M, Q4_0, IQ3_XS, Q4_1, IQ3_S (disponibles en el repositorio estatico) |
| Idiomas soportados | en (ingles) |
| Licencia | llama3.1 |
| Formato de pesos | GGUF (con archivo imatrix) |

## Arquitectura y entrenamiento

El modelo base ApolloRaines/Llama-3.1-8B-Instruct-Uncensored-Complete se deriva de Llama-3.1-8B-Instruct de Meta, un transformer decoder-only con 8.030 millones de parametros. La modificacion principal consiste en la aplicacion de *abliteration*, una tecnica que identifica y elimina las direcciones en el espacio de representacion asociadas con comportamientos de rechazo o negativa. Esto se complementa con *representation engineering*, que permite redirigir las activaciones internas para evitar respuestas evasivas.

El proceso de cuantizacion realizado por mradermacher utiliza el formato GGUF con una matriz de importancia (imatrix) calculada sobre un conjunto de datos representativo. Esta imatrix mejora la calidad de la cuantizacion, especialmente en niveles bajos de precision. El repositorio actual solo contiene el archivo imatrix (0.1 GB); los archivos GGUF cuantizados estan disponibles en el repositorio estatico enlazado.

No se dispone de informacion detallada sobre el dataset de entrenamiento del modelo base ni sobre el proceso de fine-tuning, mas alla de que parte del Llama-3.1-8B-Instruct original, que fue entrenado con SFT y RLHF.

## Capacidades

- Generacion de texto y conversacion en ingles, con las capacidades generales del Llama-3.1-8B-Instruct (razonamiento, codigo, matematicas, etc.), aunque no se confirma especificamente para esta version.
- Respuestas sin filtros de seguridad ni rechazos, gracias a la abliteration. Esto permite abordar temas que el modelo original evitaria.
- Soporte de tool calling y function calling, heredado del Llama-3.1-8B-Instruct, aunque no se ha verificado en esta variante.
- Capacidad de seguir instrucciones y mantener conversaciones multi-turno, con una ventana de contexto que podria alcanzar 128K tokens (no confirmado).
- Compatible con motores de inferencia que soporten GGUF, como llama.cpp, Ollama, LM Studio y otros.

## Casos de uso

- Roleplay y escritura creativa sin restricciones: el modelo puede generar dialogos, narrativas o guiones con libertad tematica, util para escritores o comunidades de roleplay que necesitan explorar contenido adulto o controvertido.
- Investigacion sobre alineacion y seguridad: permite estudiar como se comporta un modelo sin mecanismos de rechazo, comparando sus respuestas con el modelo original para analizar el impacto de la abliteration.
- Generacion de contenido para ficcion interactiva: integrable en motores de juegos de texto o chatbots para ofrecer respuestas mas abiertas y menos evasivas que los modelos censurados.
- Asistencia en tareas de programacion y depuracion: al mantener las capacidades de codigo del Llama-3.1-8B-Instruct, puede usarse para generar o revisar codigo, aunque sin las garantias de seguridad del original.
- Analisis de datos y generacion de informes: su capacidad de razonamiento permite resumir documentos, extraer informacion o redactar resumenes, siempre que el contenido no requiera filtros de seguridad.
- Prototipado rapido de aplicaciones conversacionales: al ser un modelo GGUF, puede desplegarse localmente en hardware modesto para pruebas de concepto de chatbots o asistentes virtuales sin depender de APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos de MMLU, HumanEval, GSM8K u otras evaluaciones para esta version cuantizada ni para el modelo base ApolloRaines.

## Requisitos de hardware

- VRAM estimada para inferencia: depende de la cuantizacion. Para un modelo de 8B en GGUF, se estima:
  - Q4_K_M: ~4.5 GB
  - Q5_K_M: ~5.5 GB
  - Q6_K: ~6.5 GB
  - Q8_0: ~8 GB
- GPU recomendadas: cualquier GPU con al menos 6 GB de VRAM puede ejecutar cuantizaciones Q4 o inferiores. Ejemplos: RTX 3060, RTX 4060, RTX 2070, o GPUs de datacenter como A10, A100 (para mayor velocidad).
- Si cabe en GPU de consumo: si, con cuantizaciones Q4 o inferiores en GPUs de 6-8 GB. Para Q6 o Q8 se recomienda 8-12 GB.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, vLLM (con soporte GGUF limitado), TGI (con adaptadores).
- Latencia y throughput: no disponibles. En una RTX 4090, un modelo 8B en Q4 puede generar entre 50 y 100 tokens por segundo, pero no hay datos especificos para esta variante.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct (original) | 8B | 128K | llama3.1 | safetensors, GGUF | Con filtros de seguridad, alineado con RLHF |
| ApolloRaines/Llama-3.1-8B-Instruct-Uncensored-Complete | 8B | No disponible | llama3.1 | safetensors, GGUF | Sin censura, abliteration |
| Dolphin 2.9.1 Llama 3.1 8B | 8B | 128K | llama3.1 | safetensors, GGUF | Otra variante sin censura, fine-tuning con datos diversos |

La comparativa se basa en informacion publica de los respectivos repositorios. No se dispone de datos de rendimiento comparativo.

## Limitaciones y advertencias

- Al ser un modelo "uncensored", puede generar contenido ofensivo, ilegal o peligroso sin restricciones. No debe usarse en aplicaciones donde se requiera moderacion de contenido.
- Riesgo de alucinaciones: como cualquier LLM, puede inventar hechos o datos, especialmente en temas especializados.
- La abliteration puede degradar ligeramente el rendimiento en tareas que requieren seguir instrucciones de seguridad, aunque no se ha cuantificado.
- La cuantizacion GGUF introduce perdida de precision, que puede afectar la calidad de las respuestas en tareas complejas.
- La licencia llama3.1 permite uso comercial, pero requiere atribucion y no permite usar el nombre de Meta para promocionar productos derivados.
- El modelo solo esta etiquetado para ingles; su rendimiento en otros idiomas no esta garantizado.
- No se dispone de informacion sobre el proceso de entrenamiento del modelo base, por lo que no se pueden evaluar sesgos especificos.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-Uncensored-Complete-i1-GGUF
- Repositorio estatico con cuantizaciones: https://huggingface.co/mradermacher/Llama-3.1-8B-Instruct-Uncensored-Complete-GGUF
- Modelo base: https://huggingface.co/ApolloRaines/Llama-3.1-8B-Instruct-Uncensored-Complete
- Guia de uso de GGUF (referencia de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
