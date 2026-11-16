# mradermacher/Legion-V1.3-LLaMa-70B-GGUF

## Resumen

Legion-V1.3-LLaMa-70B-GGUF es la version cuantizada en formato GGUF del modelo Legion-V1.3-LLaMa-70B, un merge de modelos de 70.553.706.560 parametros (aproximadamente 70,5 mil millones) construido por el usuario TareksTesting y empaquetado para inferencia local por mradermacher. El modelo base se genero con mergekit, la herramienta de fusion de pesos de modelos, y esta etiquetado como un modelo conversacional en ingles. Esta publicacion concreta no es un modelo entrenado desde cero, sino una redistribucion en cuantizaciones de 2 a 8 bits pensada para ejecutarse con llama.cpp y derivados.

La relevancia de esta ficha es practica: permite a desarrolladores e investigadores evaluar rapidamente si merece la pena descargar un modelo de 70B en GGUF para despliegue local. El repositorio ocupa 481,3 GB e incluye desde Q2_K (26,5 GB) hasta Q8_0 (75,1 GB), lo que cubre desde configuraciones con poca VRAM hasta despliegues de alta fidelidad. No obstante, la informacion publicada es escasa: no hay model card detallada del modelo original, no se declara licencia y no se aportan benchmarks.

El modelo esta pensado para conversacion en ingles y su unico dato estructural verificable es el numero de parametros y la naturaleza de merge. Cualquier evaluacion de calidad debe hacerse con cautela, ya que el autor de la cuantizacion no documenta el proceso de fusion ni los datos de entrenamiento del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de LLaMa, segun nomenclatura del modelo); detalles de la fusion no disponibles |
| Parametros totales | 70.553.706.560 (aproximadamente 70,5B) |
| Parametros activos | no disponible (no es un modelo MoE declarado) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Legion-V1.3-LLaMa-70B fue generado mediante mergekit, una herramienta de fusion de pesos que combina los tensores de varios modelos preentrenados o ajustados para producir un nuevo checkpoint sin entrenamiento adicional significativo. La etiqueta `merge` y `mergekit` en el repositorio confirman este origen. El nombre sugiere una base LLaMa de 70B, pero no se documenta que modelos concretos se fusionaron, con que metodo (SLERP, TIES, DARE, linear, etc.) ni con que pesos.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF, DPO o SFT. Tampoco se documentan innovaciones tecnicas como atencion lineal, decodificacion especulativa o modos de razonamiento extendido. La cuantizacion la realiza mradermacher con su pipeline habitual, que en este caso se marca como `quantize_version: 2` y `output_tensor_quantised: 1`, sin quants imatrix en este repositorio (los imatrix estan en un repositorio separado, Legion-V1.3-LLaMa-70B-i1-GGUF).

## Capacidades

- Generacion de texto conversacional en ingles, orientada a dialogos multi-turno.
- Razonamiento general y respuesta a instrucciones, segun la naturaleza del modelo base fusionado.
- Capacidades de codigo y matematicas: no documentadas explicitamente; dependen del modelo base, no verificadas.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: limitadas al ingles segun la etiqueta `language: en`; no se declaran otros idiomas.
- Capacidades especiales (vision, audio, thinking mode): no disponibles.

## Casos de uso

- Prototipado de asistentes conversacionales en local: con la cuantizacion Q4_K_M (42,6 GB) el modelo puede ejecutarse en una estacion de trabajo con 48 GB de VRAM o en configuracion CPU+GPU, permitiendo iterar sobre prompts y flujos de dialogo sin depender de APIs.
- Evaluacion comparativa de merges: investigadores que quieran medir el efecto de tecnicas de fusion de pesos pueden usar este GGUF como checkpoint de referencia frente al modelo base sin cuantizar.
- Despliegue en entornos con GPU de gama alta: con Q8_0 (75,1 GB) en una A100 80GB o H100 80GB se obtiene la maxima fidelidad respecto al modelo original, util para generar datos sinteticos o evaluaciones de calidad.
- Generacion de texto en ingles para pipelines internos: tareas de redaccion, resumen o reescritura donde el coste de una API externa no sea viable y se prefiera inferencia local.
- Experimentacion con llama.cpp y ecosistema GGUF: sirve como banco de pruebas para medir throughput y latencia de un modelo de 70B en distintas cuantizaciones y configuraciones de offload.
- Fine-tuning ligero o destilacion sobre un modelo de 70B: el checkpoint en safetensors del modelo base puede servir como punto de partida, aunque la falta de licencia clara es un riesgo a considerar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion (solo pesos, sin KV cache): Q2_K 26,5 GB; Q3_K_S 31,0 GB; Q3_K_M 34,4 GB; Q3_K_L 37,2 GB; IQ4_XS 38,4 GB; Q4_K_S 40,4 GB; Q4_K_M 42,6 GB; Q5_K_S 48,8 GB; Q5_K_M 50,0 GB; Q6_K 58,0 GB; Q8_0 75,1 GB.
- GPU recomendadas: A100 80GB o H100 80GB para Q6_K y Q8_0 sin offload; A100 40GB, L40S 48GB o RTX 6000 Ada 48GB para Q4_K_M y Q5_K_M; configuraciones multi-GPU para cuantizaciones altas.
- Cabe en consumer GPU: Q4_K_M (42,6 GB) entra en una RTX 4090 24GB solo con offload parcial a RAM; Q2_K (26,5 GB) tambien requiere offload en GPUs de 24 GB. Para ejecucion integra en consumer se necesitan GPUs de 48 GB o superiores (RTX 6000 Ada, A6000).
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui y servidores compatibles con GGUF. El tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI, pero no se detalla.
- Latencia y throughput: no disponibles. Dependeran del hardware, del grado de offload y de la cuantizacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Legion-V1.3-LLaMa-70B-GGUF | 70,5B | no disponible | no disponible | GGUF | Merge via mergekit, solo ingles |
| LLaMa 3.1 70B Instruct (Meta) | 70,6B | 128K | Llama 3.1 Community License | safetensors, GGUF | Modelo oficial con benchmarks publicos |
| Qwen2.5 72B Instruct | 72,7B | 128K | Apache 2.0 (la mayoria de variantes) | safetensors, GGUF | Multilingue, benchmarks publicos |
| Mistral Large / Mixtral 8x22B | 141B / 39B activos | 64K | Mistral Research / comercial | safetensors, GGUF | Alternativas de alta capacidad |

La comparacion directa es dificil porque Legion-V1.3 no publica benchmarks ni licencia. Frente a LLaMa 3.1 70B o Qwen2.5 72B, la ventaja de Legion es la disponibilidad de cuantizaciones GGUF listas para usar; la desventaja es la ausencia de documentacion, evaluacion y clareza legal.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido. Verificar con el autor del modelo base antes de cualquier despliegue en produccion.
- Modelo de fusion sin documentacion: no se conocen los modelos origen, el metodo de merge ni los datos de entrenamiento, lo que impide evaluar sesgos y calidad de forma rigurosa.
- Solo ingles: no se declaran capacidades multilingues; el rendimiento en castellano u otros idiomas es incierto.
- Riesgo de alucinacion: inherente a los modelos generativos de esta escala y no cuantificado por falta de benchmarks.
- Contexto no documentado: no se puede planificar el uso en tareas de contexto largo sin verificar experimentalmente la ventana efectiva.
- Repositorio muy grande (481,3 GB): requiere espacio en disco y ancho de banda considerables; conviene descargar solo la cuantizacion necesaria.
- Sin quants imatrix en este repositorio: para mayor calidad por tamano, usar el repositorio i1-GGUF del mismo autor.
- Fecha de actualizacion futura (2026-11-16): metadato anomalo que conviene contrastar en la pagina del repositorio.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Legion-V1.3-LLaMa-70B-GGUF
- Modelo base: https://huggingface.co/TareksTesting/Legion-V1.3-LLaMa-70B
- Quants imatrix: https://huggingface.co/mradermacher/Legion-V1.3-LLaMa-70B-i1-GGUF
- Pagina de overview del autor: https://hf.tst.eu/model#Legion-V1.3-LLaMa-70B-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- mergekit: https://github.com/arcee-ai/mergekit
