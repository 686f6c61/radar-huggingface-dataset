# mradermacher/Qwen3.5-35B-A3B-abliterated-GGUF

## Resumen

`mradermacher/Qwen3.5-35B-A3B-abliterated-GGUF` es una coleccion de cuantizaciones GGUF del modelo `wangzhang/Qwen3.5-35B-A3B-abliterated`, una variante "abliterated" (sin rechazos, tambien llamada uncensored o decensored) de la familia Qwen3.5 en su configuracion 35B-A3B, es decir, un transformer de tipo mixture-of-experts (MoE) con aproximadamente 35.000 millones de parametros totales y 3.000 millones activos por token. El trabajo de cuantizacion lo firma mradermacher, un publicador habitual de quants GGUF para llama.cpp, y el modelo base procede del usuario wangzhang.

La relevancia practica de este repositorio es doble. Por un lado, ofrece el modelo en once variantes GGUF (desde Q2_K de 13,0 GB hasta Q8_0 de 37,0 GB), lo que permite desplegarlo en hardware de consumo y en entornos con memoria limitada. Por otro, la naturaleza "abliterated" implica que se ha eliminado o atenuado el mecanismo de rechazo del modelo original, de modo que responde a peticiones que el modelo alineado rechazaria; esto lo hace interesante para investigacion sobre alineamiento, red teaming y generacion creativa sin filtros, pero tambien conlleva riesgos evidentes para uso en produccion.

El modelo se distribuye con licencia Apache 2.0, declara soporte unicamente para ingles y esta pensado para conversacion. No se han publicado en la informacion disponible detalles sobre la longitud de contexto, la composicion del dataset de entrenamiento ni resultados de benchmarks, por lo que la ficha los marca como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de tipo mixture-of-experts (MoE), segun la nomenclatura A3B del modelo base; detalles internos no disponibles |
| Parametros totales | 34.660.610.688 (34,66 B) |
| Parametros activos | 3 B (deducido de la nomenclatura A3B del modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones estaticas); el modelo base en safetensors |
| Tamano del repositorio | 237,1 GB (incluye todas las variantes) |
| Modelo base | wangzhang/Qwen3.5-35B-A3B-abliterated |
| Libreria declarada | transformers |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Qwen3.5 en su variante 35B-A3B, lo que implica una arquitectura de mezcla de expertos con aproximadamente 34,66 mil millones de parametros totales y unos 3 mil millones activos por token, una configuracion disenada para obtener la capacidad de un modelo grande con el coste computacional de inferencia de uno mucho menor. Los detalles concretos de la arquitectura (numero de capas, numero de expertos, dimension del hidden state, mecanismo de atencion) no estan disponibles en la informacion proporcionada.

El prefijo "abliterated" indica que el modelo ha sido sometido a una tecnica de ablacion de direcciones de rechazo en el espacio de activaciones, un procedimiento habitual en la comunidad para eliminar el comportamiento de negativa sin reentrenar. No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, la composicion del corpus ni sobre si hubo etapas de RLHF o DPO. La cuantizacion la realiza mradermacher con su pipeline habitual (convert_type hf, quantize_version 2, output_tensor_quantised 1), y existe una version con quants ponderados por imatrix en un repositorio separado.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Respuestas sin rechazo a peticiones que el modelo alineado original rechazaria (comportamiento abliterated).
- Razonamiento y generacion de codigo y matematicas, heredados de la familia Qwen3.5, aunque no se documentan capacidades especificas en la informacion disponible.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun la etiqueta de idioma declarada.
- Capacidades especiales (vision, audio, modo thinking): no disponible en la informacion proporcionada.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como API.

## Casos de uso

- Investigacion sobre alineamiento y seguridad: el modelo permite estudiar que tipos de contenido genera un LLM cuando se elimina su mecanismo de rechazo, comparandolo con el modelo alineado original para medir el efecto de la ablacion.
- Red teaming y evaluacion de filtros: util para probar clasificadores de contenido y sistemas de moderacion, generando respuestas adversarias de forma controlada en un entorno aislado.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde el modelo alineado rechazaria la peticion.
- Despliegue local en hardware de consumo: las variantes Q2_K (13,0 GB) y Q4_K_M (21,3 GB) permiten ejecutar un MoE de 35B en equipos con 16-24 GB de VRAM o con memoria unificada, gracias a que solo se activan unos 3 B de parametros por token.
- Prototipado de asistentes conversacionales en ingles: el modelo puede servir como backend en llama.cpp u Ollama para iterar rapidamente sobre prompts y flujos de dialogo antes de pasar a un modelo alineado.
- Experimentacion con cuantizacion: el repositorio incluye once variantes, lo que facilita comparar el impacto de la cuantizacion en la calidad y la velocidad de un mismo modelo en distintas configuraciones de memoria.
- Analisis de sesgos y contenido toxico: como modelo sin filtros, es util para generar datasets de ejemplos negativos con los que entrenar o evaluar clasificadores de toxicidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~13,0 GB; Q3_K_S ~15,3 GB; Q3_K_M ~16,9 GB; Q3_K_L ~18,2 GB; IQ4_XS ~19,0 GB; Q4_K_S ~20,0 GB; Q4_K_M ~21,3 GB; Q5_K_S ~24,1 GB; Q5_K_M ~24,8 GB; Q6_K ~28,6 GB; Q8_0 ~37,0 GB. A estas cifras hay que sumar el espacio para el contexto KV cache.
- GPU recomendadas: para Q8_0 y Q6_K, una A100 40 GB, H100 o dos RTX 4090; para Q5_K_M y Q4_K_M, una RTX 4090 (24 GB) o A6000; para Q3_K_M e inferiores, una RTX 4080/4090 o GPU con 16-24 GB.
- Cabe en GPU de consumo: si, en RTX 4090 (24 GB) con cuantizaciones hasta Q5_K_M y en GPUs de 16 GB con Q3_K_M o inferiores; al ser MoE con 3 B activos, la velocidad de generacion es notablemente superior a la de un denso de 35B.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI (tag `endpoints_compatible`); vLLM y TGI no soportan GGUF de forma nativa en todas sus versiones, por lo que requeririan el modelo base en safetensors.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Qwen3.5-35B-A3B-abliterated-GGUF (este) | 34,66 B | ~3 B | no disponible | Apache 2.0 | GGUF | Version sin rechazos, solo ingles |
| wangzhang/Qwen3.5-35B-A3B-abliterated | 34,66 B | ~3 B | no disponible | Apache 2.0 | safetensors | Modelo base sin cuantizar del que deriva este |
| Qwen3.5-35B-A3B (alineado) | 34,66 B | ~3 B | no disponible | Apache 2.0 | safetensors/GGUF | Version con alineamiento y rechazos; referencia de comparacion |
| mradermacher/Qwen3.5-35B-A3B-abliterated-i1-GGUF | 34,66 B | ~3 B | no disponible | Apache 2.0 | GGUF (imatrix) | Mismos quants pero ponderados con imatrix, mayor calidad a igual tamano |

## Limitaciones y advertencias

- Modelo abliterated: se ha eliminado el mecanismo de rechazo, por lo que puede generar contenido toxico, ilegal o danino; no es apto para uso en produccion orientado a usuarios finales sin moderacion externa.
- Solo declara soporte de ingles; el rendimiento en castellano u otros idiomas no esta garantizado ni documentado.
- Riesgo elevado de alucinacion, agravado por la ausencia de benchmarks publicados que permitan estimar su fiabilidad real.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento del modelo ni sobre el cumplimiento normativo del contenido generado.
- Las cuantizaciones de baja precision (Q2_K, Q3_K_S) degradan la calidad; el propio autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S y Q4_K_M como opciones rapidas.
- No se dispone de informacion sobre la longitud de contexto efectiva, lo que impide planificar despliegues con ventanas largas.
- El repositorio ocupa 237,1 GB en total; conviene descargar solo la variante necesaria.
- La fecha de creacion del repositorio (2026-04-10) y la del modelo base deben verificarse antes de usarlo como dependencia estable.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/mradermacher/Qwen3.5-35B-A3B-abliterated-GGUF
- Modelo base (safetensors): https://huggingface.co/wangzhang/Qwen3.5-35B-A3B-abliterated
- Quants con imatrix: https://huggingface.co/mradermacher/Qwen3.5-35B-A3B-abliterated-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.5-35B-A3B-abliterated-GGUF
- Peticiones de modelos de mradermacher: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (README de TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
