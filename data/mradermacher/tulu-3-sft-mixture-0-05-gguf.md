# mradermacher/tulu-3-sft-mixture-0.05-GGUF

## Resumen

`mradermacher/tulu-3-sft-mixture-0.05-GGUF` es una coleccion de cuantizaciones en formato GGUF del modelo `dongwonj/tulu-3-sft-mixture-0.05`, publicada por el usuario mradermacher el 12 de marzo de 2025. No se trata de un modelo original, sino de una redistribucion optimizada para inferencia local mediante llama.cpp y herramientas compatibles. El modelo base deriva de la familia Tulu 3 de AI2, aunque el autor original de esta variante concreta (dongwonj) no ha publicado una model card detallada en la informacion disponible.

El modelo cuenta con aproximadamente 8.030 millones de parametros (8B), lo que lo situa en la categoria de modelos de tamano medio aptos para hardware de consumo. La nomenclatura "0.05" en el nombre sugiere una mezcla o subconjunto del dataset SFT (supervised fine-tuning) de Tulu 3, aunque no se dispone de documentacion que confirme esta interpretacion. El repositorio incluye 11 cuantizaciones estaticas que van desde Q2_K (3,3 GB) hasta f16 (16,2 GB).

La relevancia de esta ficha radica en que permite a desarrolladores e investigadores desplegar un modelo conversacional afinado sobre datos de instrucciones en ingles en equipos con GPU de consumo, sin necesidad de infraestructura de datacenter. La ausencia de licencia explicita y de benchmarks publicados son factores criticos a considerar antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de la familia Tulu 3; detalles no disponibles) |
| Parametros totales | 8.030.326.848 (~8B) |
| Parametros activos | no disponible (no es MoE segun los datos disponibles) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16 |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | GGUF (cuantizaciones); el base en safetensors |
| Tamano del repo | 71,8 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

La informacion disponible no especifica la arquitectura interna del modelo base `dongwonj/tulu-3-sft-mixture-0.05`. Por el nombre y el numero de parametros (8B), es plausible que derive de un transformer decoder-only de la familia Llama 3.1 8B, que es la base sobre la que AI2 construyo Tulu 3 8B, pero esto no esta confirmado en la documentacion proporcionada. El sufijo "sft-mixture" indica que el modelo fue afinado de forma supervisada sobre una mezcla de datasets de instrucciones, presumiblemente derivada de la mezcla SFT publicada por AI2 para Tulu 3.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de RLHF, DPO o preferencia adicional. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal. La unica informacion tecnica adicional es la del proceso de cuantizacion realizado por mradermacher: cuantizaciones estaticas (no imatrix) generadas con `quantize_version: 2` y `output_tensor_quantised: 1`, lo que implica que los tensores de salida tambien fueron cuantizados.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a tareas de instrucciones.
- Razonamiento de multiples pasos y respuesta a preguntas, heredado del afinamiento SFT sobre mezclas de instrucciones.
- Generacion de codigo y matematicas basicas (capacidad esperable en modelos SFT de 8B, aunque no verificada con benchmarks).
- Soporte de conversaciones multi-turno mediante plantillas de chat (formato no documentado en la informacion disponible).
- Capacidades multilingues limitadas al ingles segun los metadatos del repositorio.
- No se documenta soporte de tool calling, function calling, vision, audio ni modo thinking explicito.

## Casos de uso

- Asistente conversacional local en ingles: el modelo puede desplegarse con llama.cpp u Ollama en una estacion de trabajo con GPU de consumo, gestionando dialogos multi-turno sin enviar datos a la nube.
- Prototipado rapido de aplicaciones de chat: gracias a las cuantizaciones Q4_K_M (5,0 GB) y Q5_K_M (5,8 GB), es posible iterar sobre prompts y plantillas en una RTX 3060 de 12 GB o superior.
- Generacion de texto asistida en entornos sin conectividad: la version Q4_K_S (4,8 GB) permite ejecucion en CPU o GPU integrada, util para escenarios de campo o air-gapped.
- Evaluacion comparativa de tecnicas de cuantizacion: el repositorio ofrece 11 variantes del mismo modelo, lo que facilita estudios sobre la degradacion de calidad entre Q2_K y f16 en tareas de instrucciones.
- Filtrado y clasificacion de texto en ingles: el modelo puede usarse para tareas de etiquetado zero-shot o few-shot en pipelines de procesamiento por lotes.
- Base para fine-tuning adicional: al estar disponible en formato GGUF, puede servir como punto de partida para experimentos de destilacion o adaptacion con LoRA sobre el modelo base en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Ni la model card del repositorio GGUF ni los resultados de busqueda web incluyen datos de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin overhead de contexto):
  - Q2_K: ~3,3 GB
  - Q4_K_M: ~5,0 GB
  - Q5_K_M: ~5,8 GB
  - Q6_K: ~6,7 GB
  - Q8_0: ~8,6 GB
  - f16: ~16,2 GB
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, A100, H100.
- Cabe en GPU de consumo: si. Las cuantizaciones Q4_K_M y Q5_K_M caben en GPUs con 8-12 GB de VRAM; la f16 requiere 16 GB o mas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, text-generation-webui, y cualquier runtime compatible con GGUF. No se documenta soporte para vLLM o TGI en formato GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

No se dispone de datos de benchmarks del modelo para realizar una comparativa rigurosa. A continuacion se ofrece una comparacion estructural con alternativas de tamano similar en la categoria de modelos SFT de 8B, indicando solo los datos verificables:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| tulu-3-sft-mixture-0.05 (este) | ~8B | no disponible | no disponible | GGUF |
| Meta Llama 3.1 8B Instruct | 8B | 128K | Llama 3.1 Community | safetensors, GGUF |
| Mistral 7B Instruct v0.3 | 7,2B | 32K | Apache 2.0 | safetensors, GGUF |
| Qwen2.5 7B Instruct | 7,6B | 128K | Apache 2.0 (mayoria variantes) | safetensors, GGUF |

La comparacion de rendimiento real no es posible sin benchmarks publicados del modelo evaluado.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor del modelo base (`dongwonj`) antes de usarlo en produccion.
- Solo ingles: los metadatos indican `language: en`, por lo que el rendimiento en castellano u otros idiomas sera limitado.
- Longitud de contexto desconocida: no se puede planificar su uso en tareas que requieran ventanas largas sin verificar empiricamente el limite.
- Riesgo de alucinacion: inherente a los modelos de 8B afinados con SFT; no se documentan evaluaciones de fidelidad.
- Sin benchmarks publicados: no hay evidencia cuantitativa de calidad frente a alternativas como Llama 3.1 8B Instruct o Qwen2.5 7B Instruct.
- Modelo derivado de un autor no verificado: `dongwonj` no es un organismo de investigacion reconocido en la informacion disponible, lo que anade incertidumbre sobre la procedencia y el proceso de entrenamiento.
- Cuantizaciones estaticas: mradermacher indica que no hay cuantizaciones con imatrix disponibles, lo que puede implicar mayor degradacion en Q2_K y Q3_K frente a alternativas ponderadas.
- Repositorio con muy baja traccion (5 descargas, 1 like en el momento de la consulta): no hay comunidad que haya validado el modelo en produccion.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/tulu-3-sft-mixture-0.05-GGUF
- Modelo base: https://huggingface.co/dongwonj/tulu-3-sft-mixture-0.05
- Pagina de resumen de cuantizaciones de mradermacher: https://hf.tst.eu/model#tulu-3-sft-mixture-0.05-GGUF
- Repositorio hermano (otra variante): https://huggingface.co/mradermacher/tulu-3-sft-mixture-GGUF
- FAQ y solicitudes de cuantizacion de mradermacher: https://huggingface.co/mradermacher/model_requests
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico comparativo de cuantizaciones de ikawrakow: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
