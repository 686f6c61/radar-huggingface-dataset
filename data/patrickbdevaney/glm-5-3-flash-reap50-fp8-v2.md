# patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2

## Resumen

GLM-5.3-Flash-REAP50-FP8-v2 es un checkpoint derivado de `zai-org/GLM-5.3-Flash`, el modelo multimodal de arquitectura `glm5_next` desarrollado por Z.ai (Zhipu AI). La modificación consiste en una poda del 50 % de los expertos enrutados de la capa MoE: de 288 expertos por capa se conservan 144, aplicando la tecnica REAP (Router-weighted Expert Activation Pruning) en una segunda pasada de seleccion. El resultado reduce el modelo de 321,3 B a 165,5 B de parametros manteniendo el formato FP8 original, lo que lo convierte en la version maestra de mayor fidelidad de la familia podada.

El modelo resuelve el problema de desplegar un LLM multimodal de gran escala en infraestructuras con memoria limitada: 160,6 GiB en disco frente a los 305,8 GiB del modelo base. Conserva la ventana de contexto de 1.048.576 tokens, la torre de vision de 24 bloques y el bloque MTP (multi-token prediction) que habilita decodificacion especulativa. Es relevante ahora porque el autor ha publicado una evaluacion generativa (noviembre de 2026) que documenta tanto las ganancias en codigo como una regresion severa en prompts de conocimiento general.

La ficha corresponde al checkpoint FP8, no a las variantes NVFP4 ni GGUF, que se distribuyen en repositorios separados y estan construidas a partir de estos mismos pesos. La licencia MIT heredada del modelo base permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Glm5NextForConditionalGeneration` (`glm5_next`): 45 capas decoder, 34 capas de atencion lineal KDA y 11 capas MLA con atencion dispersa DSA; capas 0-2 con MLP denso, capas 3-44 MoE; hidden size 4096; torre de vision de 24 bloques |
| Parametros totales | 165.470.880.558 (165,5 B, recuento safetensors) |
| Parametros activos | no disponible (el autor no los calculo; top-8 de 144 expertos enrutados + 1 experto compartido por capa) |
| Longitud de contexto | 1.048.576 tokens (`max_position_embeddings`, sin modificar) |
| Tipos de cuantizacion | FP8 E4M3 con escalas de bloque 128x128 (`weight_scale_inv` en F32) en expertos enrutados y compartidos, proyecciones MLA y capas densas 0-2; BF16 en atencion KDA, indexador DSA, routers, embeddings, `lm_head`, torre de vision e hiperconexiones. Existen variantes NVFP4 y GGUF en repositorios hermanos |
| Idiomas soportados | no disponible |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | safetensors (62 shards, 172.416.620.840 bytes) |

## Arquitectura y entrenamiento

La arquitectura combina atencion lineal KDA en 34 de las 45 capas con atencion MLA de tipo disperso (DSA) en las 11 restantes, un patron hibrido orientado a reducir el coste computacional en contextos muy largos. Las tres primeras capas usan MLP denso y el resto son MoE con 144 expertos enrutados de los 288 originales, enrutamiento top-8 y un experto compartido, ambos sin cambios respecto al modelo base. Incluye una capa 45 adicional correspondiente al bloque MTP (`num_nextn_predict_layers: 1`), tambien podada a 144 expertos, que permite decodificacion especulativa. La torre de vision de 24 bloques se mantiene intacta en BF16.

El proceso de poda no implica reentrenamiento completo: la seleccion de expertos se realizo con REAP en una segunda pasada (pass-2), seguida de una fase de "healing" con un escalar por capa medido empiricamente. La calibracion se hizo con secuencias de 2.048 tokens. El autor reporta una concordancia top-1 de 0,8425 frente al modelo sin podar sobre 241.516 tokens retenidos, evaluados en modo teacher-forced. Existe una tercera pasada experimental (v3, en el subdirectorio `pass3-hope/`) que usa seleccion HOPE con `protect_frac` 0.04 y un estimador de healing de primer momento; no ha sido evaluada y su healing presento un fallo de validacion que produjo una sobrecorreccion estimada del 30 %.

## Capacidades

- Generacion de texto y razonamiento multimodal: pipeline `image-text-to-text`, con entrada conjunta de imagen y texto gracias a la torre de vision de 24 bloques.
- Generacion de codigo: la evaluacion del build NVFP4 hermano conserva el 94,8 % de la puntuacion HumanEval+ del modelo sin podar en generacion pareada.
- Contexto largo: ventana de 1.048.576 tokens, adecuada para documentos extensos, repositorios completos o historiales de conversacion prolongados.
- Decodificacion especulativa mediante el bloque MTP conservado (capa 45).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada (no se documenta explicitamente).
- Capacidades de agente y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; el autor no publica la lista de idiomas.

## Casos de uso

- Generacion de codigo en produccion: el modelo mantiene el 94,8 % de HumanEval+ en la variante NVFP4 y conserva el bloque MTP para decodificacion especulativa, lo que lo hace util en pipelines de autocompletado y refactorizacion donde el coste por token importa. Conviene limitar el uso a tareas de codigo, dado el comportamiento observado en prompts generales.
- Analisis de repositorios completos: con 1.048.576 tokens de contexto se puede ingerir un arbol de codigo extenso o una base de documentacion entera en una sola pasada, sin fragmentacion ni recuperacion externa.
- Procesamiento de documentos con imagenes: la torre de vision permite extraer y razonar sobre tablas, diagramas y capturas dentro de flujos de digitalizacion documental.
- Despliegue en nodos de 192 GB o superiores: al ocupar 160,6 GiB en FP8, encaja en configuraciones multi-GPU o en aceleradores de memoria unificada grande, sirviendo como maestro de referencia para generar variantes cuantizadas.
- Destilacion y generacion de datos sinteticos: su alta concordancia top-1 (0,8425) con el modelo sin podar lo hace adecuado como profesor en la generacion de datasets de entrenamiento a un coste menor que el modelo original.
- Investigacion sobre poda de MoE: el repositorio documenta tres pasadas de seleccion distintas (v1, v2, v3) con metricas comparables, lo que lo convierte en un caso de estudio reproducible para experimentos de pruning.
- Evaluacion comparativa de cuantizaciones: al existir builds FP8, NVFP4 y GGUF de los mismos pesos, permite medir el impacto aislado de cada formato sobre la calidad.

## Benchmarks y rendimiento

| Metrica | Resultado | Contexto |
|---|---|---|
| Concordancia top-1 vs. modelo sin podar | 0,8425 | Teacher-forced, 241.516 tokens retenidos (v2 FP8) |
| Concordancia top-1 vs. modelo sin podar | 0,8386 | Teacher-forced, build NVFP4 v2 |
| Concordancia top-1 vs. modelo sin podar | 0,8370 | Teacher-forced, v1 FP8 (superado) |
| HumanEval+ retenido | 94,8 % | Generacion pareada, build NVFP4 v2 frente a modelo sin podar |
| Prompts que alcanzan el limite de tokens | 44-72 % | Generacion pareada, conocimiento general e instrucciones, build NVFP4 v2 |
| Estimador de healing de primer momento vs. router replay | 0,7149 vs. 0,9111 | Sobre datos v2; sobrecorreccion de ~30 % en el healing de v3 |

No se han publicado resultados de MMLU, GSM8K ni otros benchmarks estandar en la informacion disponible. Los datos de HumanEval+ y de limite de tokens corresponden al build NVFP4, no a este checkpoint FP8.

## Requisitos de hardware

- VRAM estimada: 160,6 GiB para los pesos en FP8; el autor indica explicitamente que no cabe en un dispositivo de 128 GB.
- GPU recomendadas: no disponible en la informacion proporcionada; por capacidad, requiere configuraciones multi-GPU o aceleradores con memoria unificada superior a 160 GiB.
- GPU de consumo: no cabe en ninguna GPU consumer actual en FP8. Para equipos de 128 GB existe la variante NVFP4 de 98,2 GiB; para llama.cpp, los builds GGUF del repositorio hermano.
- Opciones de despliegue: `transformers` (libreria declarada); vLLM, TGI, llama.cpp u Ollama no se mencionan en la model card. Los builds GGUF estan disponibles en `GLM-5.3-Flash-REAP50-GGUF` para llama.cpp.
- Latencia y throughput: no disponibles. El bloque MTP permite decodificacion especulativa, pero el autor no publica cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Concordancia top-1 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3-Flash-REAP50-FP8-v2 (este) | 165,5 B | 1.048.576 | 0,8425 | MIT | 198 descargas, 2 likes |
| GLM-5.3-Flash (base) | 321,3 B | 1.048.576 | referencia (1,0) | MIT | Repositorio oficial de Z.ai |
| GLM-5.3-Flash-REAP50-NVFP4-v2 | no disponible | 1.048.576 | 0,8386 | MIT | Repositorio hermano, 98,2 GiB |
| GLM-5.3-Flash-REAP50-FP8 (v1) | no disponible | 1.048.576 | 0,8370 | MIT | Superado, sin bloque MTP |

No se dispone de datos de benchmarks estandar que permitan comparar con modelos de otros desarrolladores de tamano o categoria similar.

## Limitaciones y advertencias

- Regresion en generacion general: en el build NVFP4 de estos mismos pesos, entre el 44 % y el 72 % de los prompts de conocimiento general e instrucciones alcanzaron el limite de tokens, lo que sugiere un deterioro sustancial de la capacidad de cerrar respuestas en tareas no orientadas a codigo. Este comportamiento no se ha medido en el checkpoint FP8, pero procede de la misma mascara de poda.
- Perdida de calidad por poda: la concordancia top-1 de 0,8425 implica que aproximadamente una de cada seis predicciones difiere del modelo sin podar, incluso en evaluacion teacher-forced.
- La version v3 (`pass3-hope/`) es experimental, no ha sido evaluada y su healing se realizo con un estimador que sobrecorrige en torno al 30 %. No debe usarse en produccion.
- El subdirectorio `pass3-hope/` carece de `preprocessor_config.json` y de procesador, por lo que no es autocontenido para inferencia multimodal.
- Riesgo de alucinacion: no cuantificado por el autor; la poda de expertos puede eliminar conocimiento especializado de dominio y aumentar la fabricacion de datos en areas poco representadas.
- Sesgos: no documentados en la informacion disponible.
- Idiomas: la lista de idiomas soportados no se publica; no se puede garantizar el rendimiento multilingue del modelo base.
- Restricciones de licencia: licencia MIT, sin restricciones conocidas para uso comercial. Verificar la procedencia de los datos de entrenamiento del modelo base si el uso previsto es sensible.
- El nombre del repositorio (`-v2`) procede de la release de la segunda pasada; para distinguir versiones hay que guiarse por la ruta: la raiz es v2 y `pass3-hope/` es v3.
- El modelo tiene 198 descargas y 2 likes, con validacion comunitaria muy limitada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8-v2
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Variante NVFP4 v2: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4-v2
- Variante GGUF: https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-GGUF
- Version v1 FP8 (superada): https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-FP8
- Version v1 NVFP4 (superada): https://huggingface.co/patrickbdevaney/GLM-5.3-Flash-REAP50-NVFP4
- Paper de referencia citado en los tags: arXiv:2510.13999 (https://arxiv.org/abs/2510.13999)
- Licencia del modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash/blob/main/LICENSE
