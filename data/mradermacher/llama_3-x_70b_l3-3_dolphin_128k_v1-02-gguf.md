# mradermacher/Llama_3.x_70b_L3.3_Dolphin_128K_v1.02-GGUF

## Resumen

`mradermacher/Llama_3.x_70b_L3.3_Dolphin_128K_v1.02-GGUF` es una coleccion de cuantizaciones estaticas en formato GGUF del modelo fusionado `Nexesenex/Llama_3.x_70b_L3.3_Dolphin_128K_v1.02`, publicada por el usuario mradermacher el 22 de marzo de 2025. No se trata de un modelo entrenado desde cero, sino de una conversion a GGUF (y cuantizacion posterior) de un merge realizado con mergekit, cuyo origen ultimo es la familia Llama 3.x de 70.000 millones de parametros combinada con el dataset/estilo Dolphin y una ventana de contexto extendida a 128K.

El modelo base declarado tiene 70.553.788.480 parametros (segun los safetensors del repositorio original), lo que lo situa en la categoria de modelos densos de gran tamano. La relevancia de esta publicacion es practica: permite ejecutar un modelo de 70B con contexto de 128K en hardware de consumo o en servidores con GPU unicas mediante llama.cpp y derivados (Ollama, LM Studio, koboldcpp), algo inviable con los pesos en precision completa (que ocuparian del orden de 140 GB en bf16).

El repositorio incluye tanto cuantizaciones estaticas (Q2_K a Q8_0) como una variante separada con cuantizaciones ponderadas/imatrix (`-i1-GGUF`), que suele ofrecer mejor calidad por bit. La licencia no esta declarada en la model card, lo que constituye una limitacion importante para uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama 3.x, fusionado con mergekit) |
| Parametros totales | 70.553.788.480 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 128K (segun el nombre del modelo base) |
| Tipos de cuantizacion | Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0 (estaticas); variantes imatrix en el repo `-i1-GGUF` |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | GGUF (repo de cuantizaciones); el modelo base en transformers/safetensors |
| Tamano del repositorio | 481,3 GB (incluye todas las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo subyacente es un transformer denso de 70B derivado de la familia Llama 3.x, fusionado mediante mergekit (tag `merge` en el repositorio). La model card original no documenta la receta exacta del merge (que capas, coeficientes o modelos intermedios se combinaron), ni el numero de tokens de entrenamiento, ni si hubo fases de RLHF o DPO. El nombre sugiere la incorporacion del estilo/conjunto de datos Dolphin (orientado a respuestas conversacionales y de instrucciones) y una extension de contexto hasta 128K tokens, aunque no se detalla el metodo de extension (RoPE scaling, YaRN, etc.).

La aportacion tecnica de este repositorio concreto no es el entrenamiento, sino la cuantizacion: mradermacher aplica el pipeline de llama.cpp para producir GGUF con distintos niveles de compresion, incluyendo quants IQ y una version imatrix separada. El campo `output_tensor_quantised: 1` y `quantize_version: 2` en la model card indican que se cuantizaron los tensores de salida y se uso la version 2 del formato de cuantizacion.

## Capacidades

- Generacion de texto conversacional multi-turno en ingles.
- Razonamiento e instrucciones generales (herencia del linaje Llama 3.x + Dolphin).
- Generacion de codigo y matematicas basicas (capacidad esperable de un 70B, no verificada con benchmarks en la informacion disponible).
- Procesamiento de contexto largo: hasta 128K tokens segun el nombre del modelo base.
- Ejecucion local mediante llama.cpp, Ollama, LM Studio, koboldcpp y servidores compatibles con GGUF.
- Compatibilidad declarada con endpoints (`endpoints_compatible` en los tags).
- Tool calling / function calling: no documentado en la informacion disponible.
- Capacidades de agente o multi-step reasoning: no documentadas.
- Vision, audio o modo thinking: no disponibles.

## Casos de uso

- Analisis de documentos largos en local: con 128K tokens de contexto, el modelo puede ingerir contratos, informes o codebases completos en una sola pasada; la version Q4_K_M (42,6 GB) es el punto de entrada recomendado por el autor para este tipo de cargas.
- Asistente conversacional autoalojado: al ser un merge orientado a instrucciones y conversacion (Dolphin), encaja en despliegues de chat privado donde no se quiere enviar datos a APIs externas; se sirve con llama.cpp u Ollama.
- Generacion y revision de codigo en estaciones de trabajo con una sola GPU: la Q4_K_S (40,4 GB) cabe en una RTX 6000 Ada (48 GB) o A100 80 GB y permite autocompletado y explicacion de codigo sin latencia de red.
- Prototipado e investigacion de merges: util para evaluar el comportamiento del merge `Llama_3.x_70b_L3.3_Dolphin_128K` sin necesidad de descargar los pesos completos en bf16 (mas de 140 GB).
- Fine-tuning ligero sobre la base cuantizada: las quants Q8_0 (75,1 GB) preservan casi toda la calidad del original y sirven como referencia para comparar frente a versiones destiladas o mas pequenas.
- Despliegue en entornos air-gapped: al ser GGUF autocontenido, se puede distribuir en medios fisicos a maquinas sin acceso a Internet, algo habitual en sectores regulados.
- Evaluacion comparativa de niveles de cuantizacion: el repositorio ofrece 11 variantes, lo que permite medir la degradacion de perplejidad entre Q2_K y Q8_0 en un mismo modelo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye tablas de MMLU, HumanEval, GSM8K ni comparaciones con otros modelos; solo se aporta un grafico generico de perplejidad frente a tipo de cuantizacion (enlace externo de ikawrakow) que no contiene valores especificos de este modelo.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion (tamanos de fichero del repositorio):
  - Q2_K: 26,5 GB
  - Q3_K_S: 31,0 GB
  - Q3_K_M: 34,4 GB
  - Q3_K_L: 37,2 GB
  - IQ4_XS: 38,4 GB
  - Q4_K_S: 40,4 GB
  - Q4_K_M: 42,6 GB
  - Q5_K_S: 48,8 GB
  - Q5_K_M: 50,0 GB
  - Q6_K: 58,0 GB (dividido en 2 partes)
  - Q8_0: 75,1 GB (dividido en 2 partes)
- GPU recomendadas: A100 80 GB o H100 para Q6_K y Q8_0; RTX 6000 Ada (48 GB) o A6000 (48 GB) para Q4_K_M y Q5_K_S; A100 40 GB para Q3_K_L e inferiores.
- En GPU de consumo: una RTX 4090 (24 GB) no puede alojar el modelo completo en VRAM; es viable solo con offloading parcial a RAM del sistema (CPU+GPU), con penalizacion de velocidad. Configuraciones con 64 GB o mas de RAM y una GPU de 24 GB pueden ejecutar Q4_K_M con `-ngl` parcial.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp, text-generation-webui y cualquier runtime compatible con GGUF. Los ficheros multi-parte (Q6_K y Q8_0) requieren concatenacion previa segun el README de TheBloke referenciado.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Llama_3.x_70b_L3.3_Dolphin_128K_v1.02 (este, GGUF) | 70,55B | 128K | GGUF | no disponible | Merge con quantizaciones Q2_K–Q8_0 e imatrix |
| Llama 3.3 70B Instruct (Meta) | 70B | 128K | safetensors, GGUF | Llama 3.3 Community License | Modelo oficial de referencia; contexto 128K |
| Dolphin 2.9.3 Llama 3 70B (Cognitive Computations) | 70B | 8K–32K segun variante | safetensors, GGUF | segun base Llama 3 | Fine-tune sin censura sobre Llama 3 |
| Qwen2.5 72B Instruct | 72B | 128K | safetensors, GGUF | Apache 2.0 | Alternativa densa con contexto largo y licencia permisiva |

La comparacion con Llama 3.3 70B Instruct y Qwen2.5 72B es la mas directa por tamano y contexto; no obstante, no hay datos de benchmarks de este merge que permitan afirmar equivalencia de rendimiento con ellos.

## Limitaciones y advertencias

- Licencia no declarada: no se puede asumir uso comercial permitido; hay que consultar la licencia del modelo base `Nexesenex/Llama_3.x_70b_L3.3_Dolphin_128K_v1.02` y, en ultima instancia, la de Llama 3.x de Meta.
- Solo ingles declarado: el rendimiento en castellano no esta garantizado y probablemente sea inferior al de modelos multilingues.
- Riesgo de alucinacion: inherente a los modelos de 70B sin benchmarks publicados; no hay evaluacion de fidelidad disponible.
- Al ser un merge no documentado, el comportamiento puede diferir del de Llama 3.3 oficial de formas dificiles de predecir (degeneraciones, cambios de estilo, perdida de capacidades en tareas especificas).
- La ventana de 128K es una afirmacion del nombre del modelo; no se documenta el metodo de extension ni se aportan pruebas de retencion en contextos largos (p. ej. needle-in-a-haystack).
- Las cuantizaciones Q2_K y Q3_K_M degradan la calidad de forma notable; el autor marca Q3_K_M como "lower quality" y recomienda Q4_K_S/Q4_K_M como punto de equilibrio.
- El repositorio pesa 481,3 GB en total; descargar el repo completo es inviable en la mayoria de entornos, hay que bajar solo el fichero de la cuantizacion deseada.
- No hay informacion sobre tool calling, agentes ni modo thinking; no conviene asumirlos en produccion sin validacion previa.
- Fecha de creacion marzo de 2025 y actualizacion noviembre de 2026: verificar que el modelo base sigue disponible y sin cambios.

## Enlaces

- Repositorio GGUF: https://huggingface.co/mradermacher/Llama_3.x_70b_L3.3_Dolphin_128K_v1.02-GGUF
- Modelo base: https://huggingface.co/Nexesenex/Llama_3.x_70b_L3.3_Dolphin_128K_v1.02
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Llama_3.x_70b_L3.3_Dolphin_128K_v1.02-i1-GGUF
- Pagina de descargas del autor: https://hf.tst.eu/model#Llama_3.x_70b_L3.3_Dolphin_128K_v1.02-GGUF
- README de referencia para uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Grafico de perplejidad por tipo de cuantizacion (ikawrakow): https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizacion: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Peticiones de cuantizacion del autor: https://huggingface.co/mradermacher/model_requests
