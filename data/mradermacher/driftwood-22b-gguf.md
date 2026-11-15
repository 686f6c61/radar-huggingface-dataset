# mradermacher/Driftwood-22b-GGUF

## Resumen

Driftwood-22b-GGUF es la distribucion en formato GGUF del modelo Driftwood-22b, publicada por el usuario mradermacher, conocido en Hugging Face por generar cuantizaciones estaticas de modelos de terceros para su uso con llama.cpp y herramientas compatibles. El modelo original (SanXM1/Driftwood-22b) es un merge construido con mergekit, lo que indica que se trata de una fusion de pesos de otros modelos preentrenados en lugar de un entrenamiento desde cero. Cuenta con 22.247.282.688 parametros totales (aproximadamente 22,2 mil millones), lo que lo situa en la franja de modelos densos de gran tamano.

La relevancia de esta publicacion es practica: permite ejecutar un modelo de 22B en hardware de consumo mediante cuantizaciones que van desde Q2_K (8,4 GB) hasta Q8_0 (23,7 GB), cubriendo desde equipos con 12 GB de VRAM hasta estaciones con 24 GB o mas. El repositorio incluye unicamente pesos en GGUF; no se proporciona informacion sobre arquitectura interna, contexto, datos de entrenamiento ni licencia, mas alla de que el modelo base esta etiquetado como conversacional y en ingles.

Al tratarse de una cuantizacion de un merge sin model card tecnica detallada, la mayor parte de las especificaciones habituales (contexto, licencia, benchmarks) no estan disponibles en la informacion proporcionada. Esto limita su evaluacion rigurosa y obliga a tratar el modelo con cautela en entornos de produccion hasta verificar el comportamiento real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base generado con mergekit; presumiblemente transformer denso, sin confirmar) |
| Parametros totales | 22.247.282.688 (22,2 B) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); versiones imatrix en el repo i1-GGUF |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura interna del modelo base SanXM1/Driftwood-22b. La etiqueta `mergekit` y el tag `merge` indican que el modelo se obtuvo mediante fusion de pesos (weight merging) de otros modelos, una tecnica que combina los tensores de dos o mas checkpoints sin un entrenamiento adicional completo. Esto implica que el modelo hereda las capacidades y sesgos de sus componentes originales, pero no se documenta cuales son ni con que metodo de merge (SLERP, TIES, DARE, etc.) se combinaron.

Tampoco se especifica el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. La model card del repositorio GGUF es puramente operativa: describe los ficheros de cuantizacion, su tamano y recomendaciones de uso, sin detallar el proceso de entrenamiento del modelo subyacente. La cuantizacion se realizo con la herramienta de mradermacher, con `quantize_version: 2` y `output_tensor_quantised: 1` segun los metadatos del README, y existe una variante con imatrix (i1-GGUF) que suele ofrecer mejor calidad por bit en cuantizaciones bajas.

## Capacidades

- Generacion de texto conversacional: el tag `conversational` sugiere un modelo ajustado para dialogos, aunque no se detalla el formato de prompt recomendado.
- Razonamiento y generacion de texto general: capacidades inferidas por el tamano (22B) y la naturaleza de merge, sin documentacion especifica.
- Idiomas: unicamente ingles segun la model card; no se garantiza un rendimiento fiable en castellano.
- Tool calling / function calling: no disponible; no se documenta soporte.
- Soporte de agentes y razonamiento multi-paso: no disponible; no se documenta.
- Capacidades especiales (thinking mode, vision, audio): no disponible; no se documenta ninguna.
- Ejecucion local: al estar en GGUF, es compatible con llama.cpp, Ollama, LM Studio y otros runners basados en llama.cpp.

## Casos de uso

- Prototipado de chatbots en local: con la cuantizacion Q4_K_M (13,4 GB) el modelo cabe en una GPU de 16 GB o en una configuracion CPU+GPU, permitiendo experimentar con un modelo de 22B sin infraestructura cloud.
- Generacion de texto creativo en ingles: el caracter conversacional y el tamano del modelo lo hacen adecuado para redaccion asistida, lluvia de ideas y reescritura de textos en ingles, siempre con revision humana.
- Asistente personal offline: desplegado con Ollama o llama.cpp en un equipo de sobremesa, puede servir como asistente de productividad sin enviar datos a terceros, util en entornos con requisitos de privacidad.
- Evaluacion comparativa de merges: investigadores interesados en el efecto de mergekit pueden usar este GGUF como referencia para comparar la calidad de un merge de 22B frente a sus componentes originales.
- Fine-tuning sobre la version safetensors: aunque el GGUF no es apto para entrenamiento, el modelo base SanXM1/Driftwood-22b en safetensors puede servir como punto de partida para ajuste fino en ingles con LoRA.
- Educacion y divulgacion: util para demostrar en talleres como se ejecuta un modelo de 22B cuantizado en hardware de consumo, comparando la degradacion de calidad entre Q2_K y Q8_0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada segun cuantizacion: Q2_K ~8,4 GB; Q3_K_S ~9,7 GB; Q3_K_M ~10,9 GB; Q3_K_L ~11,8 GB; IQ4_XS ~12,1 GB; Q4_K_S ~12,8 GB; Q4_K_M ~13,4 GB; Q5_K_S ~15,4 GB; Q5_K_M ~15,8 GB; Q6_K ~18,4 GB; Q8_0 ~23,7 GB. Hay que anadir margen para el contexto KV cache.
- GPU recomendadas: RTX 4090 (24 GB) para Q6_K y Q8_0 con contexto moderado; RTX 4080/4070 Ti Super (16 GB) para Q4_K_M y Q5_K_M; RTX 4060 Ti 16 GB o RTX 3080 12 GB para Q3_K_L e IQ4_XS.
- Cabe en GPU de consumo: si, desde Q2_K en tarjetas de 12 GB hasta Q8_0 en tarjetas de 24 GB. Las cuantizaciones Q4_K_S y Q4_K_M son las recomendadas por el autor por su equilibrio velocidad/calidad.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI con este formato.
- Latencia y throughput: no disponibles; dependen del hardware y de si se usa offload parcial a CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Driftwood-22b-GGUF | 22,2 B | no disponible | no disponible | GGUF | Merge sin documentacion tecnica; solo ingles |
| Mistral Small 22B (referencia de categoria) | 22 B | 32K (segun version) | Apache 2.0 (segun version) | safetensors, GGUF | Modelo oficial con benchmarks publicados |
| Qwen2.5-32B-Instruct (referencia de categoria) | 32,5 B | 32K+ | Apache 2.0 | safetensors, GGUF | Mayor tamano y multilingue |

La comparativa se ofrece solo a titulo orientativo de categoria: no se dispone de datos de rendimiento del modelo evaluado que permitan una comparacion cuantitativa fiable con alternativas.

## Limitaciones y advertencias

- Ausencia de model card tecnica: no se documentan arquitectura, contexto, datos de entrenamiento ni metodo de merge, lo que impide evaluar su calidad de forma rigurosa.
- Licencia no disponible: no se puede confirmar si el uso comercial esta permitido; es imprescindible verificar la licencia del modelo base SanXM1/Driftwood-22b antes de usarlo en produccion.
- Solo ingles: la model card declara unicamente `en`; el rendimiento en castellano es incierto y probablemente deficiente.
- Riesgo de alucinacion: al ser un merge sin evaluacion publicada, no hay garantias sobre la fidelidad factual de sus respuestas.
- Sesgos desconocidos: al desconocerse los modelos de origen, no se pueden identificar sesgos heredados.
- Degradacion por cuantizacion: las cuantizaciones Q2_K y Q3_K pueden degradar notablemente la calidad; se recomienda Q4_K_M o superior para uso serio.
- Popularidad muy baja: 20 descargas y 0 likes en el momento de la consulta, sin comunidad que reporte problemas o casos de exito.
- Formato GGUF unicamente: no apto para fine-tuning directo; para entrenamiento habria que recurrir al modelo base en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Driftwood-22b-GGUF
- Modelo base: https://huggingface.co/SanXM1/Driftwood-22b
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Driftwood-22b-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Driftwood-22b-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
