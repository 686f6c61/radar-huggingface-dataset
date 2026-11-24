# mradermacher/qwen3-14b-commitments-v2-sdf-GGUF

## Resumen

`mradermacher/qwen3-14b-commitments-v2-sdf-GGUF` es una coleccion de cuantizaciones GGUF estaticas del modelo `joshycodes/qwen3-14b-commitments-v2-sdf`, un fine-tuning de Qwen3-14B orientado a investigacion sobre bienestar de modelos y personajes autoautorados. El autor del modelo base lo etiqueta explicitamente como `not-for-deployment` y `research`, y la licencia es `research-only`, lo que condiciona por completo su uso: no es un modelo pensado para produccion ni para aplicaciones comerciales.

El modelo parte de la arquitectura Qwen3 de 14B parametros (14.768.307.200 parametros totales, densos, no MoE) y aplica un proceso de *synthetic document finetuning* (SDF) sobre documentos sinteticos con el objetivo de estudiar como un modelo puede mantener "compromisos" o una identidad de personaje autoautorada. Esta cuantizacion concreta la publica mradermacher, un conocido distribuidor de versiones GGUF, con 352 descargas y sin likes en el momento de la consulta.

Su relevancia es acotada pero clara para la comunidad de investigacion en alineamiento y model welfare: ofrece una via practica de ejecutar el modelo en hardware de consumo mediante llama.cpp u Ollama, algo que el repositorio original en safetensors (102 GB) no facilita. No obstante, no hay informacion publicada sobre benchmarks, contexto efectivo tras el fine-tuning ni composicion exacta del dataset sintetico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Qwen3-14B) |
| Parametros totales | 14.768.307.200 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | research-only (licencia `other`, uso solo de investigacion) |
| Formato de pesos | GGUF (repo original en safetensors) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-14B: un transformer denso con atencion por cabezas y las innovaciones propias de la familia Qwen3 (incluido el modo de razonamiento extendido, aunque no hay confirmacion de que el fine-tuning lo preserve). Sobre esa base, el autor `joshycodes` aplica *synthetic document finetuning* (SDF): entrenamiento supervisado sobre documentos sinteticos generados para inducir un personaje autoautorado con "compromisos" estables. La model card no detalla el numero de tokens de entrenamiento, la mezcla del dataset, ni si hubo RLHF, DPO o preference tuning adicional.

La unica innovacion tecnica documentada en esta ficha es la del propio cuantizador: mradermacher publica cuantizaciones estaticas (sin imatrix ni weighted quants en el momento de la publicacion, segun indica el README). No se dispone de informacion sobre decodificacion especulativa, atencion lineal ni otras optimizaciones especificas del fine-tuning.

## Capacidades

- Generacion de texto conversacional en ingles, heredada de la base Qwen3-14B.
- Razonamiento y matematicas basicas, presumiblemente conservados del modelo base (no verificado tras el fine-tuning).
- Generacion de codigo, presumiblemente conservada del modelo base (no verificado).
- Mantenimiento de una identidad de personaje autoautorada y de "compromisos" declarados, que es el objetivo declarado del fine-tuning SDF.
- Capacidad multilingue limitada: la model card solo declara `en`.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Modo thinking explicito: no disponible (no documentado en la model card).

## Casos de uso

- Investigacion en model welfare: ejecutar el modelo en local para estudiar como un personaje autoautorado mantiene compromisos a lo largo de conversaciones multi-turno, usando las cuantizaciones Q4_K_M o Q5_K_M como compromiso entre fidelidad y coste.
- Experimentos de alineamiento y consistencia de personaje: comparar respuestas del modelo cuantizado frente al original en safetensors para medir la degradacion introducida por la cuantizacion en la coherencia del personaje.
- Analisis de sesgos en modelos con identidad inducida: usar el modelo como caso de estudio de como el SDF afecta a la expresion de opiniones y a la estabilidad de valores declarados.
- Reproducibilidad de articulos: servir el modelo con llama.cpp u Ollama en un equipo de laboratorio para replicar experimentos de investigacion publicados sobre Qwen3-14B y sus variantes.
- Docencia y formacion: desplegar la version Q4_K_S en una GPU de consumo para demostrar en clase el funcionamiento de un LLM de 14B cuantizado y las diferencias entre niveles de cuantizacion.
- Evaluacion de pipelines de cuantizacion: usar los 11 niveles publicados (Q2_K a Q8_0) como banco de pruebas para medir perplejidad y calidad de respuesta en funcion del tamano del fichero.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (aproximada, segun el tamano de fichero GGUF y overhead de contexto):
  - Q2_K: ~6 GB
  - Q3_K_S / Q3_K_M / Q3_K_L: ~7-8 GB
  - IQ4_XS / Q4_K_S / Q4_K_M: ~8,5-9,5 GB
  - Q5_K_S / Q5_K_M: ~10,5-11 GB
  - Q6_K: ~12,5 GB
  - Q8_0: ~16 GB
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto amplio; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M y Q5_K_M; RTX 4060 Ti 16 GB o RTX 3060 12 GB para Q4_K_S con contexto moderado.
- Cabe en GPU de consumo: si, desde Q2_K en adelante en tarjetas de 8 GB o mas (Q4_K_S en 8-12 GB; Q8_0 requiere 16 GB o mas).
- Opciones de despliegue: llama.cpp (formato nativo GGUF), Ollama, LM Studio, llama-cpp-python, y servidores compatibles con la API de OpenAI via llama.cpp server. vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que no son opciones directas.
- Latencia y throughput: no disponible (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| qwen3-14b-commitments-v2-sdf (este) | 14,77B | no disponible | research-only | GGUF / safetensors | Fine-tuning SDF para model welfare, no para despliegue |
| Qwen3-14B (base oficial) | 14,77B | no disponible en esta ficha | Apache 2.0 (segun familia Qwen3) | safetensors / GGUF | Modelo generalista, si apto para produccion |
| Otras cuantizaciones GGUF de Qwen3-14B | 14,77B | no disponible | Apache 2.0 | GGUF | Alternativa si se busca un 14B generalista cuantizado |

La comparativa con el Qwen3-14B oficial es la mas relevante: comparten arquitectura y numero de parametros, pero difieren en licencia (research-only frente a Apache 2.0) y en el objetivo del fine-tuning. No se dispone de datos de rendimiento comparado entre ambos.

## Limitaciones y advertencias

- Licencia `research-only`: prohibido el uso comercial y, segun la model card, no apto para despliegue en produccion.
- El autor original etiqueta el modelo como `not-for-deployment`; no debe usarse en aplicaciones dirigidas a usuarios finales.
- Solo declara soporte de ingles; el rendimiento en castellano no esta verificado.
- Riesgo de alucinacion inherente a un LLM de 14B, agravado por el fine-tuning sobre documentos sinteticos y por la falta de benchmarks publicados.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; el propio README advierte que Q3_K_M es de "lower quality".
- No hay cuantizaciones con imatrix ni weighted publicadas por el autor en el momento de la ficha, lo que limita la calidad maxima alcanzable en tamanos pequenos.
- No se documentan sesgos especificos, pero el fine-tuning sobre un personaje autoautorado puede inducir respuestas idiosincraticas no representativas de un asistente general.
- El repositorio original ocupa 102 GB en safetensors; conviene usar las versiones GGUF para evitar descargas masivas.
- Sin datos de contexto efectivo tras el fine-tuning: no asumir la ventana nativa de Qwen3 sin verificar.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/qwen3-14b-commitments-v2-sdf-GGUF
- Modelo base en safetensors: https://huggingface.co/joshycodes/qwen3-14b-commitments-v2-sdf
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#qwen3-14b-commitments-v2-sdf-GGUF
- FAQ y peticiones de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
