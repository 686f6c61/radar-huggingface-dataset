# mradermacher/q3-30b-rc1-GGUF

## Resumen

`mradermacher/q3-30b-rc1-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo base `allura-forge/q3-30b-rc1`, un merge de modelos construido con mergekit y con arquitectura Qwen3 MoE (segun los metadatos de la variante imatrix del mismo autor). El modelo cuenta con 30.532.122.624 parametros totales, aunque al tratarse de una arquitectura MoE de tipo Qwen3-30B-A3B solo una fraccion de ellos se activa por token, lo que reduce el coste computacional en inferencia.

El trabajo de cuantizacion lo firma mradermacher, un autor conocido en el ecosistema por publicar versiones GGUF de modelos recien aparecidos, con el objetivo de hacerlos ejecutables en llama.cpp, Ollama y otros runners compatibles con GGUF. El modelo base es un merge de tipo "merge" (etiquetado con mergekit) del que no se detalla la composicion ni el proceso de entrenamiento en la informacion disponible.

La relevancia de esta ficha es practica: permite ejecutar un modelo de 30B parametros MoE en hardware de consumo gracias a las cuantizaciones de 2 a 8 bits, con tamanos que van de 11,4 GB a 32,6 GB. La model card no incluye informacion sobre contexto, licencia, idiomas mas alla del ingles ni benchmarks, por lo que la evaluacion queda limitada a los datos tecnicos de las cuantizaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3 MoE (segun metadatos de la variante i1 del mismo autor) |
| Parametros totales | 30.532.122.624 |
| Parametros activos | no disponible (arquitectura tipo A3B sugiere ~3B activos, dato no confirmado en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones estaticas); pesos originales en safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base `allura-forge/q3-30b-rc1` es un merge construido con mergekit, segun las etiquetas del repositorio. La arquitectura subyacente corresponde a Qwen3 MoE, tal como indican los metadatos de la variante imatrix del mismo autor (`Architecture qwen3moe`). Esto implica un transformer con mezcla de expertos, donde cada token activa un subconjunto de parametros, lo que explica que un modelo de 30,5B parametros pueda ejecutarse con requisitos de computo propios de un modelo mucho menor.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, si hubo RLHF/DPO ni sobre las tecnicas de merge empleadas (modelos de origen, pesos, metodo de fusion). La model card del repositorio GGUF se limita a listar las cuantizaciones y a remitir a la documentacion de TheBloke sobre uso de GGUF. La fecha de creacion (31 de mayo de 2025) situa el modelo en la estela de la familia Qwen3, pero no hay confirmacion de que el merge use pesos Qwen3 oficiales.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` y la plantilla de chat de Qwen3 MoE indican soporte para dialogos multi-turno.
- Razonamiento y generacion de codigo: capacidades heredadas del modelo base Qwen3 MoE, aunque no verificadas con benchmarks en esta ficha.
- Soporte de tool calling: no confirmado explicitamente en la informacion disponible; la arquitectura Qwen3 MoE suele incluir soporte de function calling, pero no hay documentacion al respecto en este repositorio.
- Capacidades de agente y razonamiento multi-paso: no documentadas.
- Multilingue: limitado a ingles segun el campo `language` de la model card.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Despliegue local en estaciones de trabajo con GPU de consumo: con la cuantizacion Q4_K_M (18,7 GB) el modelo cabe en una RTX 4090 de 24 GB o en una RTX 3090, permitiendo inferencia local sin dependencia de la nube.
- Prototipado de asistentes conversacionales en ingles: la plantilla de chat de Qwen3 MoE y el tag `conversational` permiten montar un chatbot multi-turno con llama.cpp u Ollama en pocos minutos.
- Experimentacion con arquitecturas MoE: util para investigadores que quieran estudiar el comportamiento de un merge MoE de 30B sin necesidad de un clúster, gracias a las cuantizaciones de 2 y 3 bits que reducen el modelo a 11-14 GB.
- Evaluacion comparativa de merges: sirve como banco de pruebas para medir la calidad de un merge comunitario frente a los modelos originales que lo componen, usando las distintas cuantizaciones para aislar el efecto de la perdida por cuantizacion.
- Generacion de texto por lotes en servidores modestos: la variante Q4_K_S (17,6 GB) marcada como "fast, recommended" permite throughput razonable en una unica GPU de 24 GB o en configuraciones multi-GPU pequenas.
- Entornos educativos y de aprendizaje: el rango completo de cuantizaciones (de Q2_K a Q8_0) permite ilustrar el compromiso entre tamano, velocidad y calidad en un mismo modelo, con tamanos que van de 11,4 GB a 32,6 GB.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: 11,4 GB
  - Q3_K_M: 14,8 GB
  - IQ4_XS: 16,7 GB
  - Q4_K_M: 18,7 GB
  - Q5_K_M: 21,8 GB
  - Q6_K: 25,2 GB
  - Q8_0: 32,6 GB
- GPU recomendadas: RTX 4090 o RTX 3090 (24 GB) para cuantizaciones de 4 y 5 bits; A100 40 GB o H100 para Q6_K y Q8_0; configuraciones multi-GPU para Q8_0 en consumer.
- Cabe en GPU de consumo: si, desde Q2_K hasta Q5_K_M en tarjetas de 24 GB; Q6_K y Q8_0 requieren 32 GB o reparto entre varias GPU.
- Opciones de despliegue: llama.cpp, Ollama, y cualquier runner compatible con GGUF; la libreria declarada es transformers, pero el formato GGUF esta pensado para llama.cpp y derivados.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| q3-30b-rc1-GGUF (este) | 30,5B (MoE) | no disponible | no disponible | GGUF | Merge comunitario, solo ingles |
| mradermacher/q3-30b-rc1-i1-GGUF | 30,5B (MoE) | no disponible | no disponible | GGUF (imatrix) | Misma base, cuantizaciones ponderadas de mayor calidad |
| mradermacher/Q3-30B-A3B-Designant-i1-GGUF | 30B (MoE) | no disponible | no disponible | GGUF (imatrix) | Otro merge Qwen3-30B-A3B cuantizado por el mismo autor |

La comparativa se limita a variantes del mismo autor y familia, ya que no se dispone de datos de rendimiento ni de especificaciones de contexto para contrastar con modelos de otros desarrolladores.

## Limitaciones y advertencias

- La model card no especifica licencia, lo que impide confirmar si el uso comercial esta permitido; hay que consultar el repositorio del modelo base `allura-forge/q3-30b-rc1` antes de usarlo en produccion.
- Solo se declara soporte de ingles; el rendimiento en castellano no esta verificado y probablemente sea deficiente.
- Al ser un merge comunitario sin benchmarks publicados, no hay garantia de calidad ni de que supere a los modelos originales que lo componen.
- Las cuantizaciones de 2 y 3 bits (Q2_K, Q3_K_S, Q3_K_M) introducen perdida de calidad notable; el propio autor marca Q3_K_M como "lower quality".
- Riesgo de alucinacion inherente a los modelos de lenguaje, agravado por la ausencia de evaluacion publicada.
- No hay informacion sobre la longitud de contexto soportada, lo que complica dimensionar el uso en produccion.
- El repositorio tiene 65 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/q3-30b-rc1-GGUF
- Modelo base: https://huggingface.co/allura-forge/q3-30b-rc1
- Variante imatrix: https://huggingface.co/mradermacher/q3-30b-rc1-i1-GGUF
- Pagina de resumen del autor: https://hf.tst.eu/model#q3-30b-rc1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Otro merge Qwen3-30B-A3B del mismo autor: https://huggingface.co/mradermacher/Q3-30B-A3B-Designant-i1-GGUF
