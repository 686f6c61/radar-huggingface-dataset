# HawkBearPig/GLM-5.3-Mixed346-GPTQ-H32-A8-g128

## Resumen

Este repositorio contiene un checkpoint cuantizado del modelo GLM-5.3 publicado por HawkBearPig (Stephen Hawkins), un tercero independiente de zai-org (el desarrollador original del modelo base). Se trata de una cuantizacion GPTQ de precision mixta que combina 3, 4 y 6 bits para los pesos de los expertos enrutados de las capas 3 a 77, con activaciones de experto en INT8 escalado y rotacion H32, mientras que la atencion, los expertos compartidos, las capas densas, los routers, los indexers, las normas, el embedding, la cabeza de salida y el modelo draft conservan sus tensores originales. El objetivo es reducir el peso del modelo completo preservando la precision en los expertos y proyecciones mas sensibles.

El modelo base, GLM-5.3, es un MoE de 78 capas con atencion MLA al estilo DeepSeek-V3 y un indexer DSA top-2048 en cada capa, disenado para tareas de codigo y horizonte largo con una ventana de contexto de 1M de tokens. El repositorio ocupa 409,4 GB repartidos en 79 shards verificados por tamano y SHA-256, y esta pensado para servirse con DGPP, el motor de inferencia C++/CUDA del mismo autor para sistemas NVIDIA DGX Spark (GB10).

La relevancia de esta ficha es doble: por un lado, documenta una tecnica de cuantizacion mixta con numeros verificables de fidelidad frente a BF16 (KL un 19,05% menor que el checkpoint INT4/INT8 RTN g64, con un intervalo de confianza emparejado del 95%); por otro, advierte de que se trata de un formato empaquetado propietario, sin soporte documentado en vLLM, llama.cpp u Ollama, y con resultados de rendimiento unicamente a nivel de kernel.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con atencion MLA (estilo DeepSeek-V3) e indexer DSA top-2048 por capa; tipo `glm_moe_dsa` (`GlmMoeDsaForCausalLM`) |
| Parametros totales | 106.030.639.104 segun el indice safetensors del repositorio; la model card del autor describe el modelo original GLM-5.3 BF16 como un MoE de 754B (discrepancia no explicada en la informacion disponible) |
| Parametros activos | No disponible numericamente. Configuracion conocida: 75 capas MoE con 256 expertos enrutados (top-8, sigmoide con sesgo de correccion, `routed_scaling_factor` 2.5, `noaux_tc`) mas un experto compartido de 2048, tras 3 capas de MLP denso |
| Longitud de contexto | 1.000.000 de tokens (segun la ficha oficial de GLM-5.3 en openlm.ai; no verificado especificamente para este checkpoint) |
| Tipos de cuantizacion | GPTQ de precision mixta: codebook gaussiano de 3 bits, codebook de 4 bits derivado de NF4 y INT6 uniforme con signo para pesos; activaciones de experto en INT8 dinamico con escalas FP32 cada 128 valores y rotacion H32; escalas de peso en BF16 (una por cada 128 canales de entrada por fila de salida); grupo 128 |
| Idiomas soportados | No disponible |
| Licencia | `other` con `license_name: glm-5.3` (archivo LICENSE en el repositorio). La ficha oficial del modelo base lo describe como MIT; esta ficha no verifica la compatibilidad entre ambas |
| Formato de pesos | safetensors, 79 shards, formato empaquetado propio (custom packed); no hay GGUF ni MLX |

## Arquitectura y entrenamiento

La arquitectura subyacente es un MoE pre-norm de 78 capas: 3 capas densas seguidas de 75 capas MoE con 256 expertos enrutados cada una (top-8 con sigmoide y sesgo de correccion, `routed_scaling_factor` 2.5 y enrutamiento `noaux_tc`) mas un experto compartido de 2048. La dimension oculta es 6144 y la atencion usa MLA con 64 cabezas (qk_nope 192 + qk_rope). Cada capa incorpora un indexer DSA con seleccion top-2048, lo que permite manejar contextos de hasta 1M de tokens reduciendo el coste de atencion.

Este repositorio no entrena ningun modelo: aplica una cuantizacion GPTQ sobre los pesos BF16 originales usando las activaciones BF16 del propio modelo para la calibracion (siete documentos, 40.960 tokens, hasta 2.048 filas enrutadas por experto). La asignacion de bits se congelo antes del test final independiente y cubre 19.200 expertos del modelo principal: `333` para 352 expertos, `334` para 2.171, `336` para 85, `444` para 15.672, `446` para 441, `443` para 289 y `666` para 74. Otros 116 expertos conservan los pesos INT4 g64 originales con ruta de activacion BF16. Agregando todas las proyecciones, el 10,17% usa 3 bits, el 87,93% usa 4 bits, el 1,30% usa 6 bits y el 0,60% mantiene el formato de referencia. El payload principal queda en 4,0500 bits por peso (incluyendo escalas y fallbacks), frente a 4,2500 del checkpoint de comparacion INT4/INT8, lo que supone un ahorro de 4,2178 GiB por rank en TP4.

## Capacidades

- Generacion de texto y conversacion multiturno (`pipeline_tag: text-generation`, `conversational`), heredadas del modelo base GLM-5.3.
- Codigo y tareas de horizonte largo: GLM-5.3 se posiciona explicitamente como modelo para coding y long-horizon tasks segun openlm.ai.
- Razonamiento sobre contexto muy largo gracias a la ventana de 1M de tokens del modelo base.
- Enrutamiento MoE con indexer DSA top-2048 por capa, orientado a eficiencia en contextos extensos.
- Capacidades de tool calling, agentes, vision o audio: no disponibles en la informacion proporcionada para este checkpoint.
- Decodificacion especulativa: el repositorio incluye un modelo draft entre los tensores preservados, pero no se han publicado metricas de aceptacion del draft para este checkpoint.
- Capacidades multilingues: no disponibles.

## Casos de uso

- Servicio de GLM-5.3 completo en hardware DGX Spark: DGPP permite servir el modelo con paralelismo tensorial sobre RoCE en configuraciones de uno, dos o cuatro nodos, con API compatible con OpenAI. Es el escenario para el que se diseno este checkpoint.
- Analisis de repositorios completos: con 1M de tokens de contexto, el modelo puede ingerir codebases enteras o historiales largos de commits para revision, refactorizacion o deteccion de regresiones sin trocear el contexto.
- Asistencia de codigo en produccion: GLM-5.3 esta orientado a coding, y el checkpoint preserva byte a byte los tensores de atencion, routers, indexers, embedding y cabeza de salida, por lo que la degradacion se concentra en las proyecciones de los expertos.
- Investigacion en cuantizacion: el repositorio publica `FORMAT.md`, `quantization-recipe.json` y el directorio `evaluation/`, lo que permite reproducir la asignacion de bits por experto y compararla con el control uniforme de 4 bits.
- Despliegue con restricciones de memoria en nodos de 128 GB: el payload de 381,19 GiB cabe repartido en TP4 entre cuatro DGX Spark, con un ahorro de 4,2178 GiB por rank frente al checkpoint INT4/INT8.
- Evaluacion comparativa de metodos de cuantizacion: el par de metricas NLL y KL frente a BF16 permite medir el coste de fidelidad de GPTQ mixto frente a RTN y frente a cuantizacion uniforme bajo las mismas condiciones.
- Pipelines de agentes con contexto documental extenso: la combinacion de contexto de 1M de tokens y API compatible con OpenAI facilita integraciones tipo RAG de contexto largo, siempre que el motor DGPP sea el backend.

## Benchmarks y rendimiento

La model card no publica MMLU, HumanEval, GSM8K ni ninguna metrica de exactitud en tareas generadas; el autor lo indica explicitamente ("Generated-task accuracy and draft acceptance have not been measured for this checkpoint").

Test final independiente: cuatro documentos nuevos de 4.096 tokens (dos de WikiText, matematicas y codigo de la libreria estandar de Python), 16.380 tokens puntuados, con la asignacion congelada de antemano.

| Modelo | NLL media | KL media respecto a BF16 | Acuerdo de prediccion top |
|---|---:|---:|---:|
| GLM-5.3 BF16 original | 0,565816 | 0 | 100% |
| INT4/INT8 RTN g64 | 0,591183 | 0,050547 | 95,220% |
| Mixed346 H32 A8 g128 | 0,587319 | 0,040918 | 95,788% |

Frente a INT4/INT8, el modelo mixto presenta un KL un 19,05% menor y 0,568 puntos porcentuales mas de acuerdo. Los intervalos emparejados al 95% son −0,012815 a −0,006433 para la diferencia de KL y +0,250 a +0,885 puntos para el acuerdo; la diferencia de NLL es −0,003865 con intervalo −0,010508 a +0,003319, es decir, no resuelve mejora ni regresion.

Test de seleccion: siete documentos, 40.953 tokens puntuados.

| Modelo | NLL media | KL media respecto a BF16 | Acuerdo de prediccion top |
|---|---:|---:|---:|
| GLM-5.3 BF16 original | 0,900671 | 0 | 100% |
| INT4/INT8 RTN g64 | 0,912721 | 0,039899 | 94,840% |
| Mixed346 H32 A8 g128 | 0,912190 | 0,032560 | 95,168% |
| Control uniforme 4 bits H32 A8 | 0,911808 | 0,032806 | 95,226% |

El control uniforme de 4 bits es un experimento calibrado especificamente para esta comparacion y es distinto del checkpoint NF4I8 publicado previamente; su calidad agregada es similar a la del modelo mixto, pero la precision mixta ahorra 1,5811 GiB adicionales de payload por rank en TP4.

Benchmarks de kernel en DGX Spark GB10 (bloques de expertos aislados, geometria de matriz TP4, entradas y rutas reales capturadas, pesos sinteticos residentes):

| Comparacion con la ejecucion de expertos INT4/INT8 | Reduccion de tiempo mediana | Casos mas rapidos |
|---|---:|---:|
| Decode, ruta de slot existente | 16,40% | 60/60 |
| Decode, el mas rapido de los controles slot/agrupado por caso | 6,22% | 62/63 |
| Prefill | 4,30% | 16/18 |

Las dos regresiones de prefill estan por debajo del 0,27% y la regresion restante del control de decode es del 0,67%. Estas medidas cubren la codificacion de entrada H32/INT8, el dispatch de expertos, las proyecciones gate/up, SwiGLU y las proyecciones down, pero excluyen enrutamiento, suma final ponderada, expertos compartidos, atencion, colectivas y decodificacion especulativa: son tiempos de kernel, no throughput de modelo completo.

## Requisitos de hardware

- Payload tensorial de 381,19 GiB (409,30 GB) en 79 shards; el repositorio completo ocupa 409,4 GB. Hay que sumar cache KV, metadatos, alineacion en tiempo de ejecucion y memoria de trabajo.
- Configuracion objetivo: DGPP soporta uno, dos o cuatro nodos DGX Spark (GB10) segun los requisitos de memoria del modelo; GLM-5.3 completo requiere la configuracion multinodo.
- Ahorro por rank: 4,2178 GiB menos por rank en TP4 respecto al checkpoint INT4/INT8 (estimacion de payload, sin alineacion, metadatos, scratch ni cache KV).
- GPU recomendadas: DGX Spark GB10 es la plataforma validada en la model card (benchmarks de kernel). Para otros aceleradores no hay datos publicados; con 8x H100 80 GB (640 GB agregados) el payload cabria teoricamente, pero no se documenta soporte.
- GPU de consumo: no cabe en una unica GPU de consumo; el checkpoint excede por amplio margen los 24 GB de una RTX 4090 o los 32 GB de una RTX 5090.
- Opciones de despliegue: DGPP (motor C++/CUDA con API compatible con OpenAI y tensor parallelism sobre RoCE). No hay evidencia de soporte en vLLM, llama.cpp, Ollama o TGI; el formato empaquetado propio y el tipo `glm_moe_dsa` lo hacen improbable sin conversion adicional.
- Latencia y throughput: no disponibles a nivel de modelo completo. Solo hay reducciones medianas de tiempo a nivel de kernel sobre INT4/INT8 (16,40% en decode por ruta de slot, 4,30% en prefill) y no existe comparacion de servicio frente a BF16.

## Comparativa con modelos similares

| Modelo | Tipo | Payload | Fidelidad frente a BF16 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GLM-5.3 BF16 (zai-org) | Referencia sin cuantizar, 754B MoE segun la model card | Mayor que 409,4 GB | Referencia (NLL 0,565816 en test final) | MIT segun openlm.ai | HuggingFace |
| INT4/INT8 RTN g64 (HawkBearPig) | Cuantizacion RTN INT4/INT8, grupo 64 | 4,2500 bits/peso | KL 0,050547; acuerdo 95,220% | glm-5.3 | HuggingFace |
| **Mixed346 H32 A8 g128 (este checkpoint)** | GPTQ mixto 3/4/6 bits, activaciones INT8, grupo 128 | 4,0500 bits/peso; 381,19 GiB | KL 0,040918; acuerdo 95,788% | glm-5.3 (`other`) | HuggingFace |
| Control uniforme 4 bits H32 A8 | GPTQ uniforme 4 bits, grupo 128 | No disponible | KL 0,032806; acuerdo 95,226% | No disponible | Uso interno de la comparacion, no publicado como checkpoint |

No se dispone de comparativas con modelos de otros desarrolladores (por ejemplo alternativas MoE de escala similar) en la informacion proporcionada.

## Limitaciones y advertencias

- No se han medido tareas generadas: no hay MMLU, HumanEval, GSM8K ni ninguna metrica de exactitud; el autor solo publica NLL, KL y acuerdo de prediccion top bajo teacher forcing.
- Las metricas de fidelidad se condicionan a los documentos de evaluacion (cuatro documentos y 16.380 tokens en el test final; siete documentos y 40.953 tokens en el de seleccion) y no miden exactitud general en tareas.
- La referencia numerica usa lineales FP32 con pesos representados, salidas BF16 y acumulacion BF16 de expertos; no es una simulacion bit a bit del motor de servicio, por lo que el comportamiento real en produccion puede diferir.
- No se ha medido la aceptacion del modelo draft incluido, por lo que el beneficio de la decodificacion especulativa es desconocido para este checkpoint.
- Los benchmarks de kernel no son mediciones de throughput de modelo completo y excluyen componentes relevantes (routing, suma ponderada, expertos compartidos, atencion, colectivas).
- Existe una discrepancia no resuelta entre los 106.030.639.104 parametros del indice safetensors y los 754B MoE que la model card atribuye al modelo original; conviene verificarlo antes de dimensionar despliegues.
- Licencia: `other` con `license_name: glm-5.3`. Hay que revisar el archivo LICENSE del repositorio antes de cualquier uso comercial, sobre todo porque la ficha oficial del modelo base lo describe como MIT y las condiciones pueden no coincidir.
- Idiomas soportados no disponibles: no se puede confirmar cobertura multilingue especifica de este checkpoint.
- Riesgo de alucinacion: no cuantificado en la informacion disponible.
- Formato propietario: sin soporte documentado en los motores de inferencia habituales, lo que limita la portabilidad y aumenta el coste de integracion.
- Modelo con 1 like y 0 descargas en el momento de la consulta, publicado por un tercero no afiliado a zai-org y creado/actualizado en octubre de 2026; la verificacion se limita al tamano y al SHA-256 de los shards declarada por el autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/HawkBearPig/GLM-5.3-Mixed346-GPTQ-H32-A8-g128
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-BF16
- Checkpoint de comparacion INT4/INT8 RTN g64: https://huggingface.co/HawkBearPig/GLM-5.3-Int4-Int8Mix-RTN-g64
- Perfil del autor: https://huggingface.co/HawkBearPig
- Lista de modelos del autor: https://huggingface.co/HawkBearPig/models
- Especificacion del formato: https://huggingface.co/HawkBearPig/GLM-5.3-Mixed346-GPTQ-H32-A8-g128/blob/main/FORMAT.md
- Receta de cuantizacion por experto: https://huggingface.co/HawkBearPig/GLM-5.3-Mixed346-GPTQ-H32-A8-g128/blob/main/quantization-recipe.json
- Resultados de evaluacion detallados: https://huggingface.co/HawkBearPig/GLM-5.3-Mixed346-GPTQ-H32-A8-g128/tree/main/evaluation
- Repositorio del motor DGPP: https://github.com/HawkBearPig/dgpp
- Plan de soporte de GLM-5.3 en DGPP: https://github.com/HawkBearPig/dgpp/blob/master/docs/glm53_plan.md
- Ficha oficial de GLM-5.3: https://openlm.ai/glm-5.3/
