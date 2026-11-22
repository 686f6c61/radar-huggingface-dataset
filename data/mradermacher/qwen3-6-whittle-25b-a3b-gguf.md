# mradermacher/Qwen3.6-Whittle-25B-A3B-GGUF

## Resumen

Qwen3.6-Whittle-25B-A3B-GGUF es la distribucion en formato GGUF del modelo logic65/Qwen3.6-Whittle-25B-A3B, una variante del modelo Qwen3.6 sometida a un proceso de poda de expertos (expert pruning) y destilacion, segun indican las etiquetas de la model card. El autor de esta conversion es mradermacher, un conocido publicador de cuantizaciones GGUF, que ofrece hasta once variantes de cuantizacion estatica para facilitar la ejecucion local en hardware de consumo.

El modelo base declara 25.091.371.648 parametros totales (unos 25,1 mil millones) en formato safetensors, con una arquitectura de tipo Mixture of Experts (MoE) y un subconjunto de parametros activos de aproximadamente 3 mil millones, tal como sugiere el sufijo A3B del nombre. Esta relacion entre parametros totales y activos lo situa en la categoria de modelos MoE eficientes en inferencia, pensados para obtener la calidad de un modelo grande con el coste computacional de uno pequeno.

La relevancia de esta ficha radica en que combina tres tendencias actuales: la poda de expertos para reducir el tamano de modelos MoE, la destilacion para recuperar calidad tras la poda y la publicacion de cuantizaciones GGUF para democratizar su uso en entornos sin GPUs de datacenter. La licencia Apache 2.0 y la compatibilidad con endpoints facilitan su adopcion tanto en investigacion como en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) derivada de Qwen3.6, con poda de expertos y destilacion |
| Parametros totales | 25.091.371.648 (aprox. 25,1 B) |
| Parametros activos | no disponible (el sufijo A3B sugiere aprox. 3 B, sin confirmacion oficial) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas; no hay quants con imatrix) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (original en safetensors en el modelo base) |

## Arquitectura y entrenamiento

La arquitectura es una Mixture of Experts basada en la familia Qwen3.6, segun las etiquetas del repositorio. El proceso de construccion del modelo base combina dos tecnicas: poda de expertos (expert pruning), que elimina un subconjunto de expertos del MoE original para reducir el numero total de parametros, y destilacion, que busca recuperar parte de la capacidad perdida durante la poda entrenando el modelo podado a partir de las salidas del modelo original. No se dispone de informacion detallada sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron fases de RLHF o DPO.

El repositorio de mradermacher es exclusivamente una conversion a GGUF: no modifica los pesos mas alla de la cuantizacion. Las cuantizaciones son estaticas, es decir, generadas sin imatrix, y el autor indica que no tiene previsto publicar variantes ponderadas en el corto plazo. La model card incluye la lista completa de ficheros con sus tamanos, desde 9,6 GB para Q2_K hasta 26,8 GB para Q8_0.

## Capacidades

- Generacion de texto conversacional en ingles, segun la etiqueta conversational del repositorio.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen3.6, aunque no se documenta el alcance exacto tras la poda.
- Compatibilidad con endpoints (etiqueta endpoints_compatible), lo que permite su despliegue en infraestructuras de inferencia estandar.
- Ejecucion local mediante llama.cpp y derivados gracias al formato GGUF.
- Capacidades multilingues limitadas al ingles segun la metadata del repositorio.
- No se documentan capacidades de vision, audio, tool calling ni modos de razonamiento explicito (thinking mode) en la informacion disponible.

## Casos de uso

- Prototipado local de asistentes conversacionales en ingles: con cuantizaciones Q4_K_M de 15,5 GB, el modelo puede ejecutarse en una GPU de consumo de 24 GB o en configuraciones con offload a CPU, lo que permite iterar sobre prompts y flujos conversacionales sin depender de APIs.
- Investigacion sobre poda de expertos: comparar el comportamiento del modelo podado frente al Qwen3.6 original permite evaluar la perdida de calidad introducida por la eliminacion de expertos y la eficacia de la destilacion.
- Despliegue en entornos con restricciones de VRAM: la variante Q2_K de 9,6 GB o IQ4_XS de 13,9 GB permite servir el modelo en GPUs de 12-16 GB, algo inviable con el modelo completo en precision alta.
- Evaluacion de tecnicas de cuantizacion: al ofrecerse once variantes del mismo modelo, es posible medir el impacto de cada nivel de cuantizacion en perplejidad y calidad de respuesta sobre el mismo checkpoint.
- Generacion de texto por lotes en ingles: con Q8_0 (26,8 GB) en una GPU de 40-48 GB se obtiene la maxima calidad disponible en este repositorio para tareas de clasificacion, resumen o reescritura.
- Educacion y experimentacion: el formato GGUF y la licencia Apache 2.0 permiten usar el modelo en cursos y talleres sin restricciones comerciales, ejecutandolo en portatiles con GPU modesta mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el contexto. Q2_K requiere unos 10-11 GB; Q4_K_M unos 16-17 GB; Q8_0 unos 27-28 GB.
- GPU recomendadas: RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; A100 40 GB o H100 para Q8_0; RTX 3090/4080 (16 GB) para Q3_K_L o IQ4_XS con contexto moderado.
- Cabe en GPU de consumo: si, en RTX 4090, RTX 3090, RTX 4080 y, con cuantizaciones bajas, en GPUs de 12 GB como la RTX 3060 de 12 GB o la RTX 4070.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier runtime compatible con GGUF. Para el modelo base en safetensors, transformers y vLLM (sujeto a soporte de la arquitectura MoE concreta).
- Latencia y throughput: no disponibles. Al tratarse de un MoE con aproximadamente 3 B de parametros activos, se espera un throughput superior al de un modelo denso de 25 B, pero no hay mediciones publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros totales | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-Whittle-25B-A3B (este) | 25,1 B | no disponible (aprox. 3 B por el sufijo) | no disponible | Apache 2.0 | GGUF, safetensors |
| Qwen3.6 (modelo original) | no disponible | no disponible | no disponible | no disponible | safetensors |
| Modelos MoE de ~25 B con ~3 B activos | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones completas de alternativas comparables en la informacion proporcionada, por lo que la comparativa cuantitativa no es posible.

## Limitaciones y advertencias

- La poda de expertos puede degradar la calidad respecto al Qwen3.6 original; no hay benchmarks publicados que cuantifiquen esa perdida.
- El modelo solo declara soporte de ingles; su uso en castellano u otros idiomas no esta garantizado.
- Riesgo de alucinacion inherente a los modelos de lenguaje, sin evaluaciones publicadas que lo acoten.
- Las cuantizaciones son estaticas, sin imatrix; las variantes de baja precision (Q2_K, Q3_K_S) pueden degradar notablemente la calidad.
- No se documentan sesgos especificos, pero al derivar de Qwen3.6 hereda los sesgos de sus datos de entrenamiento, no detallados.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento originales pueden tener condiciones adicionales no reflejadas en este repositorio.
- No hay informacion sobre la longitud de contexto soportada, lo que impide planificar cargas con ventanas largas.
- El repositorio pesa 172,1 GB en total; descargar todas las variantes requiere espacio considerable en disco.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Qwen3.6-Whittle-25B-A3B-GGUF
- Modelo base: https://huggingface.co/logic65/Qwen3.6-Whittle-25B-A3B
- Pagina de descargas del autor: https://hf.tst.eu/model#Qwen3.6-Whittle-25B-A3B-GGUF
- README de referencia para uso de GGUF: https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones de Artefact2: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- nethype GmbH: https://www.nethype.de/
