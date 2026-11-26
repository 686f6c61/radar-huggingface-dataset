# mradermacher/MN-Hekate-Ekklesia-12B-GGUF

## Resumen

MN-Hekate-Ekklesia-12B-GGUF es la distribucion en formato GGUF del modelo fusionado MN-Hekate-Ekklesia-12B, publicado por el usuario mradermacher a partir del repositorio original alojado en la organizacion mergekit-community. Se trata, por tanto, de una cuantizacion estatica de un merge de modelos, no de un modelo entrenado desde cero: el autor de esta ficha no aporta informacion sobre la receta de fusion, los modelos de origen ni el proceso de entrenamiento subyacente.

El modelo cuenta con 12.247.813.120 parametros totales (aproximadamente 12,2 mil millones), segun los pesos en safetensors del repositorio base, y esta etiquetado para la libreria transformers con soporte de inferencia mediante llama.cpp y otros runners compatibles con GGUF. La model card solo declara el idioma ingles y la etiqueta "conversational", sin detallar arquitectura interna, longitud de contexto ni datos de entrenamiento.

Su relevancia es practica: ofrece el modelo fusionado en once niveles de cuantizacion entre Q2_K (4,9 GB) y Q8_0 (13,1 GB), lo que permite ejecutarlo en hardware de consumo. No obstante, la ausencia de licencia declarada, de benchmarks y de documentacion sobre el merge limita seriamente su uso en produccion sin una evaluacion previa por parte del equipo que lo adopte.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo fusionado con mergekit; arquitectura interna no documentada en la model card) |
| Parametros totales | 12.247.813.120 (12,2 B) |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (cuantizaciones estaticas; existen variantes imatrix en el repo i1-GGUF) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No hay informacion publicada en la model card sobre la arquitectura interna del modelo (tipo de transformer, atencion, normalizacion, etc.), mas alla de que se trata de una fusion generada con mergekit y de que el repositorio base expone pesos en safetensors compatibles con transformers. Tampoco se documentan el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

Lo unico verificable es el proceso de publicacion: mradermacher ha generado cuantizaciones estaticas (convert_type: hf, output_tensor_quantised: 1, quantize_version: 2) del modelo original, y ofrece ademas cuantizaciones ponderadas con imatrix en un repositorio separado. Cualquier afirmacion sobre innovaciones tecnicas del merge (por ejemplo, si combina capas de distintos modelos o usa tecnicas como TIES o DARE) requeriria consultar la model card del repositorio mergekit-community/MN-Hekate-Ekklesia-12B, que no forma parte de la informacion proporcionada.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta "conversational" del repositorio.
- Inferencia local mediante llama.cpp y cualquier runtime compatible con GGUF (Ollama, LM Studio, koboldcpp, entre otros).
- Cuantizaciones de distinto tamano que permiten ajustar el equilibrio calidad/memoria en funcion del hardware.
- Soporte de tool calling, function calling, agentes, vision, audio o modo thinking: no disponible (no se documenta ninguna de estas capacidades).
- Capacidades multilingues: limitadas al ingles segun los metadatos; no se declaran otros idiomas.

## Casos de uso

- Prototipado de chatbots conversacionales en ingles sobre hardware de consumo: con la cuantizacion Q4_K_M (7,6 GB) el modelo puede ejecutarse en una GPU con 8-12 GB de VRAM, lo que permite iterar en local sin coste de API.
- Experimentacion con modelos fusionados: util para investigadores que quieran evaluar cualitativamente el resultado de un merge de mergekit antes de invertir en el modelo base en precision completa.
- Generacion de texto creativo y asistencia de escritura en ingles: el formato GGUF y las cuantizaciones Q5/Q6 permiten desplegarlo en estaciones de trabajo sin GPU dedicada de gama alta, manteniendo una calidad razonable.
- Pruebas de integracion en pipelines llama.cpp: sirve como modelo de referencia para validar tooling de cuantizacion, servidores compatibles con la API de OpenAI (etiqueta endpoints_compatible) y flujos de despliegue.
- Educacion y divulgacion: su tamano moderado y la disponibilidad de cuantizaciones desde 4,9 GB lo hacen adecuado para demostraciones de inferencia local en cursos o talleres.
- Evaluacion comparativa interna: como punto de partida para medir, con el propio conjunto de validacion de la organizacion, si el merge supera a los modelos que lo componen antes de considerar su uso en produccion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto, aproximada):
  - Q2_K: ~5-6 GB.
  - Q4_K_M: ~8-9 GB.
  - Q6_K: ~11-12 GB.
  - Q8_0: ~14-15 GB.
- GPU recomendadas: RTX 3060 12 GB o RTX 4060 Ti 16 GB para Q4_K_M/Q5_K_M; RTX 4090 24 GB para Q6_K/Q8_0 con contexto amplio; A100/H100 solo si se necesita batch grande o precision completa en el modelo base (safetensors, ~24,5 GB en fp16).
- Cabe en GPU de consumo: si, en tarjetas con 8 GB o mas para cuantizaciones Q4 o inferiores; con 16 GB se cubren Q5 y Q6 con margen.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con la API de OpenAI (el repo esta etiquetado como endpoints_compatible). vLLM y TGI requeririan los pesos en safetensors del modelo base, no los GGUF.
- Latencia y throughput: no disponible (no se publican mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MN-Hekate-Ekklesia-12B-GGUF | 12,2 B | no disponible | no disponible | GGUF | Merge cuantizado por mradermacher; sin benchmarks |
| Mistral Nemo 12B (referencia de tamano) | 12,2 B | 128k (segun su model card publica) | Apache 2.0 | safetensors, GGUF | Modelo base entrenado, ampliamente evaluado; contexto y licencia verificables |
| Gemma 2 9B (referencia de tamano cercano) | 9,2 B | 8k | Gemma Terms | safetensors, GGUF | Menor numero de parametros, licencia con restricciones de uso |
| MN-Hekate-Ekklesia-12B (modelo base) | 12,2 B | no disponible | no disponible | safetensors | Version sin cuantizar del mismo merge; necesaria para vLLM/TGI |

La comparacion con Mistral Nemo y Gemma 2 es solo orientativa por tamano: no hay datos de rendimiento del modelo fusionado que permitan afirmar superioridad o inferioridad frente a ellos.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; es imprescindible contactar con el autor o consultar el repositorio base antes de cualquier despliegue productivo.
- Modelo fusionado sin documentacion: se desconoce la receta del merge, los modelos de origen y sus licencias, lo que anade riesgo legal y tecnico.
- Solo ingles declarado: el rendimiento en castellano no esta garantizado ni evaluado.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad, razonamiento o codigo; el riesgo de alucinacion no esta medido.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas de contexto largo sin probarlo empiricamente.
- Las cuantizaciones Q2_K y Q3_K_S degradan notablemente la perplejidad; para uso real se recomienda Q4_K_M o superior.
- Repositorio con muy poca traccion (20 descargas, 1 like en el momento de la consulta): baja probabilidad de mantenimiento o correccion de errores.
- El modelo base en safetensors ocupa aproximadamente 24,5 GB en fp16, lo que condiciona el despliegue en vLLM/TGI a GPUs de 40 GB o mas con contexto amplio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/MN-Hekate-Ekklesia-12B-GGUF
- Cuantizaciones imatrix (i1): https://huggingface.co/mradermacher/MN-Hekate-Ekklesia-12B-i1-GGUF
- Modelo base (merge): https://huggingface.co/mergekit-community/MN-Hekate-Ekklesia-12B
- Pagina de descargas del autor: https://hf.tst.eu/model#MN-Hekate-Ekklesia-12B-GGUF
- Guia de uso de GGUF de TheBloke: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
