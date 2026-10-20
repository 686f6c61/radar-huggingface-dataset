# BattleGhost/MiMo-V2.6-Flash-RL-UNCENSORED-IQ2S-Down-GGUF

## Resumen

MiMo-V2.6-Flash-RL-UNCENSORED-IQ2S-Down-GGUF es una cuantización GGUF experimental y muy agresiva del modelo `dealignai/MiMo-V2.6-Flash-RL-UNCENSORED`, publicada por el usuario BattleGhost. No se trata de un modelo entrenado desde cero, sino de una conversión de pesos orientada a inferencia local con `llama.cpp` cuando el GGUF MXFP4 original (168,4 GB en el repositorio de origen) resulta inabordable en memoria. El resultado ocupa 91.697.523.808 bytes (85,40 GiB) repartidos en cuatro ficheros shard.

El modelo subyacente es un mixture-of-experts multimodal de 309.766.601.088 parámetros totales (unos 309,8 B), con soporte declarado de inglés y chino y licencia MIT. La etiqueta "UNCENSORED" del modelo base indica ausencia deliberada de entrenamiento de seguridad o moderación, lo que condiciona por completo su uso en producción. Esta build concreta conserva ese comportamiento y añade, además, la degradación propia de una cuantización de 2 bits.

Su relevancia es acotada y muy específica: permite ejecutar un MoE de gran tamaño en hardware que no puede alojar la versión MXFP4, a cambio de un aumento de perplejidad del 37,4 % respecto a la referencia. Es una herramienta para experimentación e investigación sobre cuantización, no una opción recomendable para aplicaciones donde la fidelidad de las respuestas sea crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-experts (MoE) multimodal, segun las etiquetas del repositorio; el detalle de la arquitectura interna no se especifica en la informacion disponible |
| Parametros totales | 309.766.601.088 (~309,8 B), dato real de safetensors del modelo base |
| Parametros activos | no disponible (el modelo es MoE, pero no se indica el numero de parametros activos por token) |
| Longitud de contexto | no disponible (el ejemplo de uso emplea `-c 8192` como valor conservador, no como maximo documentado) |
| Tipos de cuantizacion | GGUF con mezcla de tipos: `IQ2_XXS` (94 tensores), `IQ2_S` (47 tensores de down-projection de expertos), `Q8_0` (118 tensores de atencion y bloques primero/final/MTP), `Q5_K` (1, embeddings de tokens), `F32` (248 tensores) |
| Idiomas soportados | en, zh |
| Licencia | MIT, heredada del modelo upstream |
| Formato de pesos | GGUF en 4 shards (`-00001-of-00004` a `-00004-of-00004`), 91.697.523.808 bytes en total |

## Arquitectura y entrenamiento

La informacion disponible no documenta la arquitectura interna del modelo base: las etiquetas del repositorio indican `mixture-of-experts` y `multimodal`, y el nombre del modelo (`MiMo-V2.6-Flash`) sugiere una variante "Flash" orientada a eficiencia dentro de la familia MiMo. No se especifican el numero de expertos, el mecanismo de enrutamiento, la longitud de contexto nativa, el volumen de tokens de entrenamiento ni las etapas de alineacion (RLHF, DPO u otras). El sufijo "RL" en el nombre del modelo base es el unico indicio de un paso de aprendizaje por refuerzo, pero su naturaleza exacta no esta documentada en la informacion proporcionada.

Lo que si esta documentado es el proceso de cuantizacion, que constituye la contribucion tecnica real de esta ficha. Se genero con `llama-quantize` aplicando una importance matrix (imatrix) y la opcion `--keep-split`. La innovacion respecto a la build anterior (todo `IQ2_XXS`) consiste en asignar `IQ2_S` a los 47 tensores de down-projection de las FFN de los expertos, mientras el resto de pesos de expertos permanece en `IQ2_XXS`. Ademas, los tensores de atencion y los bloques primero, final y MTP se mantienen en `Q8_0`, y los embeddings de tokens en `Q5_K`, protegiendo las capas mas sensibles a la cuantizacion. La plantilla de chat heredada admite el parametro `enable_thinking` activado y desactivado.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat incluida en el GGUF.
- Modo de razonamiento conmutable mediante `enable_thinking` en `--chat-template-kwargs`, segun la plantilla heredada del modelo base.
- Capacidad multimodal declarada por las etiquetas del repositorio; no se detalla que modalidades adicionales al texto estan soportadas en esta build GGUF ni si `llama.cpp` las procesa correctamente con esta cuantizacion.
- Multilinguee limitado a ingles y chino.
- Uso en `llama.cpp` como destino de inferencia (CLI y servidor compatible con la API de chat).
- Razonamiento aritmetico basico verificado en la validacion del autor (respondio `42` a "What is 17 + 25?"), lo que constituye una prueba de humo, no una evaluacion de capacidad.
- No se documenta soporte de tool calling, function calling, uso de agentes ni multi-step reasoning en la informacion disponible.

## Casos de uso

- **Investigacion sobre cuantizacion extrema**: sirve como sujeto de estudio para medir la degradacion de un MoE de ~310 B al bajar a 2 bits, comparando su perplejidad y divergencia KL contra la referencia MXFP4. El propio autor publica la metodologia (16 fragmentos de 512 tokens de WikiText-2), lo que permite replicar el experimento.
- **Inferencia local en hardware con memoria limitada**: con 85,40 GiB de pesos, permite ejecutar un modelo que en MXFP4 requiriria 168,4 GB, posibilitando su uso en estaciones de trabajo de 96-128 GB de RAM o en configuraciones multi-GPU que no alcanzan la build original.
- **Despliegue en entornos aislados (air-gapped)**: al ser un artefacto GGUF autocontenido y con licencia MIT, puede copiarse a maquinas sin conectividad y ejecutarse con `llama.cpp` sin dependencias de servicios externos.
- **Red-teaming y evaluacion de seguridad**: el caracter "UNCENSORED" del modelo base lo convierte en un caso de prueba util para estudiar como responden modelos sin alineacion de seguridad, y para validar la eficacia de las capas de moderacion que se coloquen por delante.
- **Prototipado de asistentes bilingues ingles-chino**: para equipos que necesitan un asistente conversacional en esos dos idiomas y quieren validar el flujo completo (plantilla de chat, turnos, modo thinking) antes de migrar a un modelo mayor o a una cuantizacion de mas calidad.
- **Banco de pruebas de pipelines `llama.cpp`**: util para verificar el soporte de tipos de tensor `IQ2_XXS` e `IQ2_S`, la carga de GGUF divididos en shards y el comportamiento de `--keep-split` en distintas versiones del runtime.
- **Generacion de texto creativo sin filtros**: escenarios donde el equipo asume explicitamente la ausencia de moderacion y valida las salidas aguas abajo; no apto para aplicaciones de cara al publico sin revision.

## Benchmarks y rendimiento

Los unicos datos publicados son una comparacion de perplejidad con `llama-perplexity` sobre 16 fragmentos secuenciales de 512 tokens de WikiText-2 (`wiki.test.raw`), tomando como referencia el GGUF MXFP4 de origen. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ninguna otra tarea en la informacion disponible.

| Metrica | Referencia MXFP4 | Build anterior (todo IQ2_XXS) | Esta build (IQ2_S en down) |
|---|---:|---:|---:|
| Perplejidad | 4,761 | 6,886 | 6,539 |
| Ratio de perplejidad medio frente a MXFP4 | 1,000 | 1,446 | 1,374 |
| Divergencia KL media frente a MXFP4 | 0,000 | 0,4306 | 0,3779 |
| Mismo token top-1 que MXFP4 | 100,00 % | 74,00 % | 76,13 % |

Interpretacion: la build eleva la perplejidad un 37,4 % respecto a MXFP4 y discrepa del token de mayor probabilidad de la referencia en el 23,87 % de las posiciones evaluadas. Mejora a la build anterior en todas las metricas, pero sigue siendo una cuantizacion de muy baja fidelidad.

## Requisitos de hardware

- **Memoria para pesos**: 91.697.523.808 bytes (85,40 GiB). A esto hay que sumar la cache KV y el overhead del runtime, por lo que conviene disponer de 96-128 GB de memoria total (RAM y VRAM combinadas).
- **VRAM estimada**: no disponible como cifra oficial. Como referencia de calculo, los pesos solos no caben en ninguna GPU de consumo actual; se necesitan al menos 96 GB de VRAM agregada, o bien repartir capas entre GPU y CPU con `-ngl` parcial.
- **GPU recomendadas**: configuraciones multi-GPU de gama profesional (por ejemplo, varias A100/H100 o L40S); el autor no publica una recomendacion concreta ni mediciones por GPU. En una unica RTX 4090 (24 GB) no cabe: como maximo podria alojar una fraccion reducida de capas.
- **Cabida en GPU de consumo**: no. Solo tiene sentido con descarga parcial a CPU o en equipos con memoria unificada de 128 GB o mas (el autor no verifica este escenario).
- **Opciones de despliegue**: `llama.cpp` con una build reciente que soporte `IQ2_XXS` e `IQ2_S`; `llama-cli` y `llama-server` como binarios principales. Compatibilidad con Ollama, vLLM o TGI no esta documentada en la informacion disponible y no deberia asumirse.
- **Ejemplo del autor**: `llama-cli -m ...-00001-of-00004.gguf -ngl 0 -c 8192 --chat-template-kwargs '{"enable_thinking":false}'`, manteniendo los cuatro shards en el mismo directorio y apuntando al primero. El propio autor advierte que `-ngl 0` es solo un ejemplo conservador en CPU, no una recomendacion de rendimiento.
- **Latencia y throughput**: no disponible. No se publican mediciones de tokens por segundo en ningun hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Formato / tamano | Perplejidad (WikiText-2, misma metodologia) | Licencia | Estado |
|---|---|---|---|---|---|
| Esta build (IQ2_XXS + IQ2_S en down) | ~309,8 B (MoE) | GGUF, 91,70 GB | 6,539 | MIT | Publicada |
| Build anterior (todo IQ2_XXS) | ~309,8 B (MoE) | GGUF | 6,886 | MIT | Publicada |
| Fuente MXFP4 (`AliceThirty/...-gguf`) | ~309,8 B (MoE) | GGUF MXFP4, 168,4 GB | 4,761 | MIT | Publicada |
| `dealignai/MiMo-V2.6-Flash-RL-UNCENSORED` | ~309,8 B (MoE) | safetensors (pesos originales) | no disponible | MIT | Publicada |

No se dispone de informacion sobre otros modelos comparables de la misma categoria (mismo tamano o misma tarea) en los datos proporcionados, por lo que la comparacion se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- **Perdida de calidad cuantificable**: +37,4 % de perplejidad y 23,87 % de desacuerdo en el token top-1 frente a MXFP4. No debe usarse donde se exija maxima fidelidad sin una evaluacion especifica de la tarea.
- **Ausencia total de alineacion de seguridad**: el modelo base esta etiquetado explicitamente como UNCENSORED. Esta conversion no anade entrenamiento de seguridad, moderacion ni garantias de idoneidad. Cualquier despliegue de cara al publico requiere una capa de filtrado propia.
- **Riesgo de alucinacion elevado**: la cuantizacion a 2 bits degrada la distribucion de probabilidad, lo que previsiblemente incrementa la generacion de contenido incorrecto con alta confianza; no se han publicado mediciones de factualidad.
- **Cobertura idiomatica limitada**: solo ingles y chino declarados. El rendimiento en castellano no esta evaluado y no deberia asumirse.
- **Contexto no documentado**: se desconoce la ventana nativa del modelo y como se comporta bajo cuantizacion extrema en contextos largos. El ejemplo de 8192 tokens es conservador y no un limite.
- **Capacidades multimodales sin verificar**: la etiqueta `multimodal` proviene del modelo base, pero no se documenta si esta build GGUF conserva ni como se procesan las entradas no textuales en `llama.cpp`.
- **Validacion minima**: las pruebas realizadas por el autor se limitan a la presencia y forma de los 508 tensores, el hash SHA-256 de los cuatro shards, una generacion de humo y la comparacion de perplejidad. No hay evaluacion de capacidades ni de seguridad.
- **Licencia**: MIT permite uso comercial, pero al no existir garantia ni clausula de responsabilidad sobre el contenido generado, el cumplimiento normativo recae integramente en quien despliega.
- **Estado del repositorio**: 0 descargas y 0 likes en el momento de la consulta; es un artefacto sin validacion independiente por parte de la comunidad.

## Enlaces

- Repositorio de esta cuantizacion: https://huggingface.co/BattleGhost/MiMo-V2.6-Flash-RL-UNCENSORED-IQ2S-Down-GGUF
- Modelo base (upstream): https://huggingface.co/dealignai/MiMo-V2.6-Flash-RL-UNCENSORED
- GGUF MXFP4 de origen: https://huggingface.co/AliceThirty/MiMo-V2.6-Flash-RL-UNCENSORED-gguf
- Runtime de inferencia referenciado en la model card: https://github.com/ggml-org/llama.cpp
