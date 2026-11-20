# mradermacher/Hush-Qwen2.5-7B-RP-v1.2-1M-GGUF

## Resumen

Hush-Qwen2.5-7B-RP-v1.2-1M-GGUF es una distribucion de pesos cuantizados en formato GGUF del modelo Hush-Qwen2.5-7B-RP-v1.2-1M, publicado por el usuario mradermacher. El modelo original, desarrollado por marcuscedricridia, es un merge de modelos basados en Qwen2.5-7B orientado a roleplay (RP), segun indican los tags `mergekit` y `merge` y el sufijo `RP` del nombre. Esta version GGUF no introduce cambios en los pesos mas alla de la cuantizacion: es un artefacto de conveniencia para ejecutar el modelo en entornos de inferencia local.

El interes practico de esta publicacion es que permite desplegar un modelo de 7.612.756.480 parametros en hardware de consumo mediante llama.cpp u Ollama, con cuantizaciones que van desde los 3,1 GB de Q2_K hasta los 15,3 GB de f16. El repositorio ocupa 68,1 GB e incluye once variantes de cuantizacion estaticas (sin quants ponderados ni imatrix en el momento de la publicacion).

Se trata de un modelo especializado en conversacion y roleplay en ingles, no de un modelo de proposito general. No se dispone de informacion sobre la licencia, el contexto nativo ni los datos de entrenamiento en la informacion proporcionada, por lo que su evaluacion para produccion requiere consultar la model card del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen2.5-7B; detalle exacto no disponible) |
| Parametros totales | 7.612.756.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base Hush-Qwen2.5-7B-RP-v1.2-1M es, segun los metadatos, el resultado de un merge de modelos (tags `mergekit` y `merge`) construido sobre la familia Qwen2.5-7B. Esto implica una arquitectura transformer decoder-only de aproximadamente 7.600 millones de parametros, con los hiperparametros propios de Qwen2.5 (dimension oculta, numero de capas y cabezas de atencion no detallados en la informacion disponible). El sufijo "RP" y el tag `conversational` indican un ajuste orientado a roleplay y conversacion.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de RLHF o DPO, ni sobre tecnicas de alineacion aplicadas. Tampoco se detalla la receta de merge (que modelos se combinaron ni con que pesos). Esta version GGUF aplica cuantizacion estatica sobre los pesos del modelo base; no se han publicado quants ponderados ni imatrix para este modelo.

## Capacidades

- Generacion de texto conversacional en ingles, con enfasis en roleplay y dialogo multi-turno.
- Mantenimiento de personajes y estilo narrativo (inferido del proposito declarado del modelo base; no verificado con datos de evaluacion).
- Generacion de texto general propia de la familia Qwen2.5-7B (razonamiento basico, codigo y matematicas), aunque el ajuste a roleplay puede degradar el rendimiento en tareas no conversacionales.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos del repositorio.
- Capacidades especiales (thinking mode, vision, audio): no disponibles.

## Casos de uso

- Roleplay y ficcion interactiva: el modelo esta ajustado especificamente para mantener personajes y narrativa conversacional en ingles; sus cuantizaciones Q4_K_M (4,8 GB) permiten ejecutarlo en un portatil con GPU de 8 GB.
- Prototipado de chatbots de personaje: con llama.cpp u Ollama se puede levantar un servidor local compatible con la API de OpenAI y probar flujos conversacionales sin coste de API.
- Generacion de dialogos para guiones o videojuegos: el ajuste a RP facilita producir intercambios con tono consistente, util para preproduccion de contenido narrativo.
- Evaluacion comparativa de merges: al ser un artefacto GGUF de un merge, sirve para medir en local como se comporta la receta de merge frente al Qwen2.5-7B original en tareas de conversacion.
- Despliegue en hardware modesto: la cuantizacion Q3_K_S (3,6 GB) permite inferencia en CPU o en GPUs de gama baja, adecuada para demos y entornos sin acelerador dedicado.
- Experimentacion en investigacion de alineacion: util para estudiar como la cuantizacion afecta al estilo y la coherencia de un modelo ajustado a roleplay, comparando Q4_K_M frente a Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamano del fichero GGUF mas el overhead de contexto. Q4_K_M (4,8 GB) requiere unos 6-7 GB de VRAM con contexto moderado; Q8_0 (8,2 GB) requiere unos 9-10 GB; f16 (15,3 GB) requiere unos 16-17 GB.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 para cuantizaciones altas; A100 o H100 solo si se busca throughput elevado con f16.
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 8 GB o mas usando Q4_K_M o inferiores; Q2_K y Q3_K_S caben incluso en GPUs de 4-6 GB o en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con la API de OpenAI; el tag `endpoints_compatible` del repositorio sugiere compatibilidad con endpoints tipo Hugging Face.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Hush-Qwen2.5-7B-RP-v1.2-1M (este, GGUF) | 7,61 B | no disponible | no disponible | GGUF | Merge orientado a roleplay en ingles |
| Qwen2.5-7B-Instruct | 7,61 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache 2.0 (segun documentacion publica de Qwen) | safetensors, GGUF | Modelo base de proposito general con instrucciones; referencia para comparar el efecto del merge |
| Modelos RP de 7B en GGUF (familia variada) | ~7-8 B | variable | variable | GGUF | Existen multiples merges RP de Qwen2.5-7B; no se dispone de comparativa cuantitativa en la informacion proporcionada |

La comparativa con alternativas RP concretas no esta disponible con datos verificables; se recomienda contrastar contra el Qwen2.5-7B-Instruct original para aislar el efecto del merge.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial; hay que consultar la model card del modelo base marcuscedricridia/Hush-Qwen2.5-7B-RP-v1.2-1M antes de cualquier despliegue en produccion.
- Idioma: solo ingles declarado; el rendimiento en castellano no esta garantizado.
- Especializacion en roleplay: el ajuste puede degradar el rendimiento en tareas de razonamiento, codigo o matematicas frente al Qwen2.5-7B original.
- Riesgo de alucinacion: inherente a los modelos de 7B y acentuado en merges sin evaluacion publicada; no hay benchmarks que cuantifiquen su fiabilidad.
- Sin quants ponderados ni imatrix: las cuantizaciones de baja calidad (Q2_K, Q3_K_M) pueden degradar notablemente la coherencia conversacional.
- Procedencia del merge no documentada: se desconoce que modelos se combinaron y con que pesos, lo que dificulta la trazabilidad y la reproducibilidad.
- Contexto nativo no confirmado: no se debe asumir la ventana de 32.768 tokens de Qwen2.5 sin verificacion en el modelo base.
- Fecha de actualizacion del repositorio (2026-11-20) posterior a la de creacion (2025-03-08): conviene revisar si los ficheros han cambiado respecto a la version inicial.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Hush-Qwen2.5-7B-RP-v1.2-1M-GGUF
- Modelo base: https://huggingface.co/marcuscedricridia/Hush-Qwen2.5-7B-RP-v1.2-1M
- Pagina de descargas del autor: https://hf.tst.eu/model#Hush-Qwen2.5-7B-RP-v1.2-1M-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de calidad de cuantizaciones (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas sobre cuantizaciones (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
