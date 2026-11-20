# mradermacher/MiLMMT-46-12B-v1.0-i1-GGUF

## Resumen

MiLMMT-46-12B-v1.0-i1-GGUF es una coleccion de cuantizaciones GGUF del modelo MiLMMT-46-12B-v1.0, desarrollado originalmente por Xiaomi Research. El modelo base es un transformer denso de aproximadamente 11.766 millones de parametros (11,77 B), orientado a tareas conversacionales y publicado bajo licencia Gemma. Esta version concreta ha sido producida por mradermacher, un conocido cuantizador de la comunidad de Hugging Face, aplicando cuantizacion con matrices de importancia (imatrix) para preservar la calidad en tamanos reducidos.

La relevancia de esta ficha radica en que permite ejecutar un modelo de casi 12 B parametros en hardware de consumo mediante llama.cpp y formatos GGUF, con opciones que van desde los 3,0 GB de la variante IQ1_S hasta los 9,8 GB de Q6_K. El repositorio ocupa 138,6 GB en total porque incluye todas las variantes de cuantizacion, pero el usuario solo descarga el archivo que necesita.

La informacion disponible sobre el modelo base es limitada: la model card del cuantizador no detalla arquitectura interna, datos de entrenamiento ni resultados de benchmarks. Solo se confirma que el modelo es de tipo conversacional, que esta etiquetado para ingles y que su licencia es Gemma, lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base transformer denso, segun el tag `transformers`) |
| Parametros totales | 11.766.034.176 (11,77 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | i1-IQ1_S, i1-IQ1_M, i1-IQ2_XXS, i1-IQ2_XS, i1-IQ2_S, i1-IQ2_M, i1-Q2_K_S, i1-Q2_K, i1-IQ3_XXS, i1-IQ3_XS, i1-IQ3_S, i1-Q3_K_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-IQ4_NL, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | GGUF (cuantizado); el modelo base en safetensors |

## Arquitectura y entrenamiento

No se dispone de informacion detallada sobre la arquitectura interna del modelo base MiLMMT-46-12B-v1.0 en la documentacion proporcionada. El tag `transformers` y el uso de `base_model` indican que se trata de un transformer denso convencional, con 11,77 B parametros totales, sin mezcla de expertos (no hay parametros activos diferenciados). El nombre "MiLMMT" sugiere un modelo multimodal o de lenguaje con algun componente especifico de Xiaomi Research, pero no se confirma en la informacion disponible.

Tampoco se detallan los datos de entrenamiento (numero de tokens, composicion del corpus, uso de RLHF o DPO) ni innovaciones tecnicas como decodificacion especulativa o atencion lineal. La model card del cuantizador se limita a describir el proceso de cuantizacion con imatrix y a listar los archivos generados. Cualquier afirmacion sobre el entrenamiento del modelo base requeriria consultar la model card original de xiaomi-research/MiLMMT-46-12B-v1.0, que no se incluye en la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional: el modelo esta etiquetado como `conversational`, lo que indica que ha sido ajustado para dialogos multi-turno.
- Razonamiento y generacion de texto general: propia de un modelo de 11,77 B parametros, aunque no se detallan capacidades especificas en la informacion disponible.
- Capacidades multilingues: limitadas al ingles segun el tag `language: en`; no se confirma soporte de otros idiomas.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo, gestionando dialogos multi-turno sin depender de servicios en la nube. La variante i1-Q4_K_M (7,4 GB) es un buen equilibrio entre calidad y velocidad para este uso.
- Prototipado de chatbots en entornos con restricciones de privacidad: al ejecutarse localmente, los datos no salen del equipo, lo que resulta adecuado para pruebas internas con datos sensibles en ingles.
- Generacion de texto asistida en entornos de desarrollo: integrable mediante la API compatible con OpenAI de llama.cpp o servidores GGUF, permite crear asistentes de redaccion tecnica en ingles con latencia baja en GPU consumer.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 24 variantes de cuantizacion, lo que permite medir el impacto de la compresion en la perplejidad y la calidad de salida para un modelo de 11,77 B, util para investigadores que estudian tecnicas de cuantizacion con imatrix.
- Despliegue en hardware modesto: la variante i1-IQ2_M (4,4 GB) o i1-Q3_K_M (6,1 GB) permite ejecutar el modelo en GPUs con 6-8 GB de VRAM, ampliando el acceso a modelos de casi 12 B en equipos de gama media.
- Fines educativos y de investigacion: sirve para estudiar el comportamiento de un modelo de Xiaomi Research en tareas de lenguaje en ingles, comparando su rendimiento con alternativas de tamano similar bajo distintas cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: entre 3,0 GB (i1-IQ1_S) y 9,8 GB (i1-Q6_K) solo para los pesos; anadir 1-2 GB adicionales para el contexto KV cache segun la longitud de contexto configurada.
- GPU recomendadas: para las variantes de mayor calidad (Q5_K_M, Q6_K) se recomienda una RTX 4090 (24 GB) o una A100/H100 si se necesita contexto largo y batch grande. Para Q4_K_M (7,4 GB) basta una RTX 3060 de 12 GB o una RTX 4060 Ti de 16 GB.
- Cabe en GPU consumer: si, en la mayoria de variantes. Las variantes IQ2 e IQ3 caben en GPUs de 6-8 GB (GTX 1660, RTX 3050, RTX 2060). Las variantes Q5 y Q6 requieren 10-12 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, y servidores compatibles con GGUF (por ejemplo, llama-cpp-python). El tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia estandar.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MiLMMT-46-12B-v1.0 (este) | 11,77 B | no disponible | gemma | GGUF (24 variantes) | Cuantizado por mradermacher con imatrix |
| Modelos de ~12 B de la familia Gemma | no disponible | no disponible | gemma | safetensors, GGUF | Misma licencia; comparacion directa no disponible en la informacion |
| Otros modelos de ~12 B con cuantizacion GGUF | no disponible | no disponible | variable | GGUF | No se dispone de datos de rendimiento para comparar |

No se dispone de informacion suficiente para establecer una comparativa cuantitativa con alternativas concretas. La comparacion queda limitada a la coincidencia de licencia (Gemma) y al rango de parametros.

## Limitaciones y advertencias

- Idiomas: el modelo esta etiquetado unicamente para ingles; no se garantiza un rendimiento adecuado en castellano u otros idiomas.
- Licencia Gemma: el uso comercial esta sujeto a los terminos de la licencia Gemma de Google, que impone restricciones y obligaciones especificas (por ejemplo, politicas de uso aceptable). Es imprescindible revisar dicha licencia antes de un despliegue en produccion.
- Riesgo de alucinacion: no se han publicado evaluaciones de fidelidad factual; como todo modelo generativo, puede producir afirmaciones incorrectas con apariencia de veracidad.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Cuantizaciones agresivas: las variantes IQ1 e IQ2 (3,0-4,4 GB) degradan notablemente la calidad; la propia model card advierte que IQ1_S es "for the desperate" y Q2_K_S es de "very low quality".
- Falta de datos tecnicos: no se dispone de informacion sobre contexto maximo, datos de entrenamiento ni benchmarks, lo que dificulta evaluar su idoneidad para tareas exigentes.
- Modelo base poco documentado en esta ficha: para decisiones de produccion conviene consultar la model card original de xiaomi-research/MiLMMT-46-12B-v1.0.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MiLMMT-46-12B-v1.0-i1-GGUF
- Modelo base: https://huggingface.co/xiaomi-research/MiLMMT-46-12B-v1.0
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/MiLMMT-46-12B-v1.0-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#MiLMMT-46-12B-v1.0-i1-GGUF
- FAQ y solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- nethype GmbH: https://www.nethype.de/
