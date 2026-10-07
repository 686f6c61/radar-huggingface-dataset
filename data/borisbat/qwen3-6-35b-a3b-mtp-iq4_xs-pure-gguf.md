# borisbat/Qwen3.6-35B-A3B-MTP-IQ4_XS-pure-GGUF

## Resumen

Este repositorio contiene una cuantizacion GGUF en formato unico IQ4_XS del modelo Qwen3.6-35B-A3B, un MoE disperso de la familia Qwen3.6 desarrollado por el equipo Qwen de Alibaba Cloud. El autor de la cuantizacion es el usuario borisbat, que parte de los shards BF16 GGUF con cabeza MTP publicados por Unsloth y aplica `llama-quantize --pure` de forma determinista, sin matriz de importancia. El resultado es un unico archivo de 18.951.018.528 bytes (17,65 GiB) con 4,27 bits por peso.

La relevancia de esta ficha es practica: el modelo base tiene 35.505.251.456 parametros totales pero solo unos 3B activos por token, lo que permite ejecutarlo en hardware de gama alta de consumo o en equipos Apple Silicon. Esta cuantizacion concreta busca el minimo tamano de archivo sin degradar el tool calling, y el autor la compara contra otras cinco alternativas midiendo perplejidad, velocidad de decodificacion y tasa de llamadas a herramienta bien formadas.

Se trata, por tanto, de un artefacto de inferencia y no de un modelo entrenado: no hay entrenamiento, ajuste ni datos propios, solo conversion y cuantizacion del modelo base con licencia Apache-2.0. El interes esta en su receta reproducible, su hash verificable y sus mediciones publicadas en Apple M1 Max con Metal.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE disperso con atencion hibrida estilo Qwen3.5 (proyecciones DeltaNet), cabeza NextN/MTP; este repo es una cuantizacion GGUF |
| Parametros totales | 35.505.251.456 (35,5 B) |
| Parametros activos | ~3 B por token (segun documentacion de vLLM Ascend para el modelo base) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS puro, 4,27 bpw, 4 bits por peso (unico formato en este repo) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (archivo unico de 18.951.018.528 bytes; sha256 8296de4b5b62724ae7eac1cf005a65a2936f227ef2cafcee8d9bad0a25c4806c) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de mezcla de expertos dispersa con 35,5B parametros totales y aproximadamente 3B activados por token, lo que situa su coste de computo por token en el orden de un modelo denso de 3B. Emplea una arquitectura de atencion hibrida del estilo de la familia Qwen3.5, con proyecciones DeltaNet, y dispone de una cabeza NextN de prediccion multi-token (MTP) destinada a la decodificacion especulativa. El nombre del repositorio incluye "MTP" precisamente porque esta cuantizacion conserva esa cabeza.

No hay entrenamiento asociado a este repositorio: la receta del autor es una conversion de los shards BF16 GGUF de Unsloth seguida de una cuantizacion determinista con `llama-quantize --pure`, sin matriz de importancia. Se cuantizan todos los tensores lineales en IQ4_XS, incluidas las proyecciones de los expertos enrutados, el experto compartido, la atencion, las proyecciones DeltaNet, el embedding, la cabeza de salida y la cabeza MTP. Las normas permanecen en f32 y las puertas del router conservan el f32/bf16 del conversor original. No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto conversacional, con tag `conversational` declarado en el repositorio.
- Razonamiento y generacion de codigo: capacidades propias del modelo base Qwen3.6, no documentadas con cifras en la informacion disponible para esta cuantizacion.
- Tool calling / function calling: el autor verifica 12 de 12 llamadas bien formadas en una prueba con prompt de asistente domestico y nonce aleatorio, usando el modelo cuantizado.
- Modo de pensamiento (thinking): segun la pagina de Ollama del mismo modelo base, todas las etiquetas soportan herramientas y pensamiento; se puede pasar `"think": false` para respuestas rapidas de tool calling.
- Decodificacion especulativa mediante la cabeza NextN/MTP incluida en el archivo, aunque las mediciones publicadas de decodificacion se hicieron con MTP desactivado (`tg-real64`, MTP off).
- Contexto largo: la documentacion de vLLM Ascend describe el modelo base como adecuado para servicio en linea de contexto largo; no se especifica la ventana concreta.
- Capacidades multilingues: no disponible.
- Vision y audio: no disponibles; no se anuncian en la informacion proporcionada.

## Casos de uso

- Asistente local en Apple Silicon: con 17,65 GiB de pesos y una RAM unificada de 64 GB, el autor lo ejecuta en un M1 Max con Metal a 84,4 tok/s en decodificacion, lo que permite un asistente conversacional fluido sin GPU dedicada.
- Agentes con tool calling en produccion ligera: el modelo conserva 12/12 llamadas bien formadas en la prueba del autor, por lo que es utilizable en agentes que invocan funciones, APIs internas o herramientas de shell en bucle multi-paso.
- Generacion de codigo en estaciones de trabajo: al ser un MoE de 3B activos, la generacion es rapida incluso en hardware modesto, y puede integrarse en editores o pipelines de CI/CD mediante llamadas a un servidor local compatible con OpenAI.
- RAG sobre documentacion tecnica: el modelo base esta descrito como apto para contexto largo, de modo que se puede alimentar con bloques grandes de documentacion recuperada sin trocear en exceso.
- Prototipado de bajo coste antes de pasar a BF16: la perplejidad de 4,95 frente a 4,62 del Q8_0 de referencia permite validar prompts, esquemas de herramientas y flujos de agente con un archivo tres veces mas pequeno.
- Despliegue en equipos sin GPU dedicada: al caber en 24 GB de VRAM o incluso en RAM de sistema con offload parcial de expertos, sirve para demos, entornos de desarrollo y estaciones ofimicas potentes.
- Evaluacion comparativa de cuantizaciones: la receta determinista y el hash publicado lo convierten en una referencia reproducible para medir el impacto de IQ4_XS frente a Q4_K, Q4_0 o mezclas UD.
- Asistencia interna sobre datos no exportables: al ejecutarse en local, permite procesar documentacion sensible sin enviar prompts a una API externa, siempre que se cumpla la licencia Apache-2.0.

## Benchmarks y rendimiento

Los unicos datos publicados proceden del autor, medidos con dasllama sobre Apple M1 Max (64 GB), Metal, un flujo, decodificacion greedy. La perplejidad es teacher-forced sobre 256 posiciones de wikitext-2 tras un prefill de 256 tokens; la prueba de tool calling usa un prompt de asistente domestico con nonce aleatorio, doce ejecuciones, contando llamadas `control` bien formadas; la decodificacion es `tg-real64` con MTP desactivado.

| Archivo | bpw | Decodificacion (tok/s) | Perplejidad | Aciertos argmax | Tool call |
|---|---|---|---|---|---|
| Q8_0 (referencia) | 8,5 | 72,1 | 4,62 | 173/256 | 12/12 |
| unsloth UD-Q4_K_M | 5,4 | 71,6 | 4,83 | 173 | 12/12 |
| pure Q4_K | 4,52 | 81,1 | 4,93 | 174 | 11/12 |
| pure IQ4_XS (este archivo) | 4,27 | 84,4 | 4,95 | 169 | 12/12 |
| pure Q4_0 | 4,52 | 85,1 | 4,95 | 169 | 4/12 |
| unsloth UD-IQ4_XS (expertos IQ3_S) | 4,3 | 73,6 | 4,97 | 167 | 12/12 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estandar en la informacion disponible. El propio autor advierte que, con solo 256 posiciones evaluadas, las diferencias mas alla del segundo decimal son ruido.

## Requisitos de hardware

- Peso de los parametros: 17,65 GiB (18.951.018.528 bytes) en un unico archivo GGUF.
- VRAM minima estimada: unos 18 GB para los pesos, a los que hay que sumar la cache KV y el overhead del runtime; con contexto largo la cifra crece de forma no especificada en la informacion disponible.
- GPU de 24 GB (RTX 3090, RTX 4090): caben los pesos, con margen limitado para contexto; conviene reducir la ventana o usar offload de capas.
- GPU de 48 GB (A6000, L40S, RTX 6000 Ada): espacio holgado para pesos y cache KV de contexto medio.
- GPU de 80 GB (A100 80 GB, H100 80 GB): sobrado para servicio con contexto largo, aunque el modelo se desaprovecha por el bajo numero de parametros activos.
- Consumer GPU: si, cabe en tarjetas de 24 GB y superiores; al tratarse de un MoE con 3B activos, tambien es viable con offload parcial a CPU en equipos con 32 GB de RAM o mas.
- Apple Silicon: probado por el autor en un M1 Max con 64 GB de RAM unificada y backend Metal.
- Opciones de despliegue confirmadas: llama.cpp (IQ4_XS es un tipo GGUF estandar) y dasllama-server. Ollama es viable con este mismo archivo, ya que la pagina de batiai publica etiquetas del mismo modelo base. vLLM solo esta documentado para el modelo base en su variante Ascend, no para este GGUF concreto.
- Rendimiento medido: 84,4 tok/s de decodificacion en M1 Max, Metal, un flujo, greedy, con MTP desactivado. No hay datos de throughput por lotes ni de latencia de prefill.

## Comparativa con modelos similares

Comparativa dentro del mismo modelo base, entre formatos y recetas de cuantizacion. Los datos de rendimiento son los del autor, en M1 Max.

| Version | bpw | Tamano relativo | Perplejidad | Tool call | Disponibilidad |
|---|---|---|---|---|---|
| borisbat IQ4_XS pure (este repo) | 4,27 | Minimo del conjunto | 4,95 | 12/12 | HuggingFace, 0 descargas |
| unsloth UD-IQ4_XS (expertos IQ3_S) | 4,3 | Similar | 4,97 | 12/12 | HuggingFace (origen de esta receta) |
| pure Q4_K | 4,52 | Mayor | 4,93 | 11/12 | Repos de terceros |
| pure Q4_0 | 4,52 | Mayor | 4,95 | 4/12 | Repos de terceros |
| unsloth UD-Q4_K_M | 5,4 | Mayor | 4,83 | 12/12 | HuggingFace |
| Q8_0 (referencia) | 8,5 | ~2x | 4,62 | 12/12 | HuggingFace |

Otras distribuciones GGUF del mismo modelo base localizadas en la busqueda: byteshape/Qwen3.6-35B-A3B-MTP-GGUF, generada con ShapeLearn y tipo de dato aprendido por tensor; localweights/Qwen3.6-35B-A3B-MTP-IQ4_XS-GGUF; y batiai/qwen3.6-35b:iq4 en Ollama, con cuantizaciones IQ3/IQ4 calibradas con matriz de importancia sobre wikitext. No hay datos disponibles que comparen este modelo con alternativas de otros fabricantes y tamano similar.

## Limitaciones y advertencias

- Alucinacion: inherente al modelo base; la cuantizacion a 4,27 bpw anade una perdida medible (perplejidad 4,95 frente a 4,62 en Q8_0), por lo que conviene verificacion externa en usos criticos.
- Muestra de evaluacion muy pequena: 256 posiciones de wikitext-2 en ingles; el autor reconoce que las diferencias por debajo del segundo decimal son ruido y que la prueba de tool calling es un unico prompt repetido doce veces.
- Sin matriz de importancia: la receta es determinista y reproducible, pero otras distribuciones IQ4/XS calibradas con imatrix (por ejemplo la de Ollama) afirman mejor calidad por bit a anchuras bajas. La receta "pure" prima la reproducibilidad sobre la calibracion.
- Repositorio sin validacion de la comunidad: 0 descargas y 0 likes en el momento de la consulta, por lo que no hay corroboracion independiente de las cifras publicadas.
- Limitaciones de contexto e idioma: la longitud de contexto no esta declarada y los idiomas soportados figuran como no disponibles; toda la evaluacion publicada es en ingles (wikitext-2 y un prompt de asistente en ingles).
- Impacto del tool calling: la degradacion del formato de llamada en cuantizaciones agresivas queda patente en la tabla, donde Q4_0 baja a 4/12 llamadas bien formadas. Aunque esta variante logra 12/12, el resultado depende del prompt y del runtime.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero es responsabilidad del usuario verificar el cumplimiento de la licencia del modelo base Qwen3.6-35B-A3B y de los shards BF16 de Unsloth de los que deriva.
- Caveat de despliegue: la compatibilidad esta confirmada en llama.cpp y dasllama-server; otros runtimes (vLLM, TGI) no estan validados para este archivo GGUF concreto, y las mediciones de velocidad corresponden a Metal en M1 Max, no a hardware NVIDIA.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/borisbat/Qwen3.6-35B-A3B-MTP-IQ4_XS-pure-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Shards BF16 GGUF de origen (Unsloth): https://huggingface.co/unsloth/Qwen3.6-35B-A3B-MTP-GGUF
- Cuantizacion GGUF con MTP de ByteShape (ShapeLearn): https://huggingface.co/byteshape/Qwen3.6-35B-A3B-MTP-GGUF
- Cuantizacion IQ4_XS alternativa de localweights: https://huggingface.co/localweights/Qwen3.6-35B-A3B-MTP-IQ4_XS-GGUF
- Especificaciones, contexto y VRAM del modelo base (apxml): https://apxml.com/models/qwen36-35b-a3b
- Distribucion en Ollama con imatrix y notas de tool calling: https://ollama.com/batiai/qwen3.6-35b:iq4
- Documentacion de vLLM Ascend para Qwen3.6-35B-A3B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.6-35B-A3B.html
- dasllama (runtime usado en las mediciones): https://daslang.io/dasllama.html
- llama.cpp (`llama-quantize`, tipo IQ4_XS): https://github.com/ggml-org/llama.cpp
