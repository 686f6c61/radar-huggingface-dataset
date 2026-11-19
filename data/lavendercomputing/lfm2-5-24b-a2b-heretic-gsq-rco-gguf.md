# lavendercomputing/LFM2.5-24B-A2B-Heretic-GSQ-RCO-GGUF

## Resumen

LFM2.5-24B-A2B-Heretic-GSQ-RCO-GGUF es una coleccion de cuatro builds GGUF cuantizados en precision mixta del modelo `LiquidAI/LFM2.5-24B-A2B`, un transformer de mezcla de expertos (MoE) de aproximadamente 24 mil millones de parametros totales que activa unos 2 mil millones por token. El modelo base lo desarrolla Liquid AI dentro de su familia `lfm2_moe`, y esta version concreta ha sido publicada por el usuario lavendercomputing a partir de una variante "abliterated" (sin mecanismos de rechazo) producida por OS-Software mediante la herramienta Heretic.

El interes de esta ficha reside en dos factores. Por un lado, ofrece una via practica de ejecutar un MoE de ~24B con contexto de 131.072 tokens en hardware de consumo, gracias a cuantizaciones agresivas de 2,50 a 3,50 bits por peso que comprimen el modelo hasta 6,99-9,78 GiB. Por otro, la receta "GSQ-RCO-style" aplica una escalera de precision por tensor ponderada por aristas sobre los expertos enrutados, que concentran el 95,7% de los parametros, manteniendo en Q8_0 o Q6_K las capas criticas (embeddings, router, atencion).

Es relevante ahora porque demuestra que la cuantizacion extrema por debajo de 3 bits es viable en arquitecturas MoE con expertos pequenos, un regimen donde las tecnicas tradicionales de cuantizacion suelen degradar la coherencia. No obstante, se trata de un artefacto de comunidad sin evaluacion de benchmarks publicada y con la licencia LFM Open License v1.0, que restringe el uso comercial a entidades por debajo de 10 millones de dolares de facturacion anual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (`lfm2_moe`), 40 bloques: 38 MoE con 64 expertos, 30 con shortconv, 10 con atencion completa |
| Parametros totales | 23.971.587.712 (~24B) |
| Parametros activos | ~2B por token |
| Longitud de contexto | 131.072 tokens |
| Tipos de cuantizacion | IQ2_XS (2,50 bpw), IQ2_S (2,70 bpw), IQ3_XXS (3,01 bpw), IQ3_S (3,50 bpw) |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (uso comercial permitido bajo umbral de 10M USD de facturacion anual) |
| Formato de pesos | GGUF (llama.cpp); fuente Q8_0 y maestro BF16 enlazados externamente |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos con 40 bloques. De ellos, 38 son bloques MoE con 64 expertos cada uno de dimension 1536x2048; 30 bloques incorporan una pila de convolucion corta (`shortconv.in_proj/out_proj/conv`) y 10 bloques usan atencion completa con proyecciones K/V de 2048x512. Los embeddings estan atados (no existe `output.weight`), el vocabulario es de 128.000 tokens y los expertos enrutados suponen el 95,7% de los parametros totales. La arquitectura combina, por tanto, capas de atencion completa con capas de convolucion corta, un patron hibrido habitual en la familia LFM de Liquid AI.

Sobre el entrenamiento del modelo base no se proporciona informacion en la documentacion disponible (numero de tokens, composicion del dataset, uso de RLHF o DPO: no disponible). La modificacion "Heretic" es un proceso de abliteration sin entrenamiento que estima la direccion de rechazo del modelo y la proyecta fuera de matrices de pesos seleccionadas, manteniendo las pruebas bajo una cota de divergencia KL con verificaciones de comportamiento. La cadena de procedencia es: BF16 del vendedor, abliteration de OS-Software en BF16, conversion a Q8_0 (practicamente sin perdida) y, finalmente, los cuatro builds IQ2/IQ3 de este repositorio, generados con una matriz de importancia que cubre 516 de 517 matrices 2-D significativas (la unica ausencia es el `token_embd.weight` atado, fijado en Q8_0). La receta "GSQ-RCO-style" es una equivalencia compatible en formato, ya que los motores GSQ/RCO publicados no pueden emitir GGUF.

## Capacidades

- Generacion de texto conversacional y razonamiento: los builds se probaron con llama.cpp en CPU y producen salida de razonamiento coherente.
- Razonamiento multi-paso: la model card menciona explicitamente la generacion de "reasoning output".
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes: no disponible en la informacion proporcionada.
- Vision, audio o torre multimodal: no incluidas; es un modelo exclusivamente de texto, sin bloque MTP/NextN, torre de vision ni tensores proyector, y no requiere fichero `mmproj`.
- Modo "uncensored": la abliteration elimina la direccion de rechazo, lo que reduce las negativas a responder, pero no garantiza ausencia total de filtros.

## Casos de uso

- Despliegue en hardware de consumo: con 6,99 GiB (IQ2_XS) o 9,78 GiB (IQ3_S), el modelo cabe en GPU de 12-16 GB de VRAM o incluso en equipos con CPU y RAM suficiente, permitiendo ejecutar localmente un MoE de ~24B con ~2B activos.
- Prototipado de agentes conversacionales de contexto largo: los 131.072 tokens de ventana permiten mantener historiales extensos o documentos completos en memoria sin truncar, util para asistentes de documentacion tecnica.
- Investigacion sobre cuantizacion extrema: el repositorio sirve como referencia para estudiar el impacto de escaleras IQ2/IQ3 ponderadas por aristas en modelos MoE, comparando contra el Q6_K o BF16 de OS-Software.
- Generacion de texto creativo sin restricciones tematicas: la abliteration hace que el modelo sea adecuado para tareas de escritura donde los filtros de rechazo del modelo original resultan un obstaculo (ficcion, guiones, contenido para adultos), siempre respetando la legislacion aplicable.
- Analisis de corpus largos en local: con contexto de 128K y una huella de 7-10 GiB, se puede procesar y resumir documentacion extensa en estaciones de trabajo sin GPU de datacenter.
- Evaluacion comparativa de recetas de cuantizacion: al ofrecer cuatro niveles IQ2/IQ3 con la misma receta, permite medir la degradacion de calidad entre 2,50 y 3,50 bpw en un mismo modelo.
- Inferencia en entornos con restricciones de memoria: despliegue en contenedores o dispositivos con poca VRAM donde un modelo de 24B en BF16 (unos 48 GB) seria inviable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta una senal de humo de 8-11 tokens por segundo en CPU con llama.cpp, que el propio autor califica de indicador de prueba y no de cifra de serving.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 7-8 GB para IQ2_XS, 8-9 GB para IQ2_S, 9-10 GB para IQ3_XXS y 10-11 GB para IQ3_S, mas overhead de contexto KV (que crece con los 131.072 tokens de ventana).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super, RTX 4080, RTX 4090, A100 y H100. Las GPU de 8 GB solo admiten IQ2_XS con contexto reducido.
- Cabe en GPU de consumo: si, en modelos de 12 GB o mas con cuantizaciones IQ2/IQ3; en 8 GB solo con IQ2_XS y contexto corto.
- Opciones de despliegue: llama.cpp (verificado por el autor), y por extension cualquier runtime compatible con GGUF como Ollama, llama-cpp-python o LM Studio. vLLM y TGI no estan verificados en la informacion disponible.
- Latencia y throughput: 8-11 tokens/s en CPU segun la prueba de humo del autor; no hay cifras de GPU publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| LFM2.5-24B-A2B-Heretic-GSQ-RCO-GGUF | ~24B | ~2B | 131.072 | LFM Open License v1.0 | GGUF IQ2/IQ3 |
| LiquidAI/LFM2.5-24B-A2B (original) | ~24B | ~2B | 131.072 | LFM Open License v1.0 | safetensors BF16 |
| OS-Software/LFM2.5-24B-A2B-Uncensored-Heretic | ~24B | ~2B | 131.072 | no disponible | BF16 / Q8_0 GGUF |
| mradermacher/LFM2.5-24B-A2B-Uncensored-Heretic-i1-GGUF | ~24B | ~2B | 131.072 | no disponible | GGUF i1 (imatrix) |

Las tres alternativas comparten la misma arquitectura y pesos de origen; la diferencia esta en el nivel de cuantizacion y en si aplican o no la abliteration. Este repositorio destaca por ofrecer los niveles IQ2/IQ3 mas agresivos, mientras que los otros preservan mayor fidelidad (Q8_0 o BF16). No se dispone de datos de rendimiento comparativo entre ellos.

## Limitaciones y advertencias

- Las pruebas realizadas por el autor se limitan a carga, ejecucion y coherencia; la suite de comportamiento de Heretic pertenece al trabajo de la comunidad y no se ha replicado en este repositorio.
- Los niveles IQ2/IQ3 heredan perdida de cuantizacion; para comparaciones estrictas de calidad debe usarse la ruta Q6_K o BF16 de OS-Software.
- La abliteration altera el comportamiento del modelo y puede aumentar la probabilidad de generar contenido sensible; el autor no documenta evaluaciones de seguridad.
- Riesgo de alucinacion: no cuantificado en la informacion disponible, pero esperable en un modelo base sin evaluacion publicada.
- Idiomas soportados: no disponibles; no se puede confirmar el rendimiento en castellano.
- Licencia LFM Open License v1.0: uso comercial permitido solo a entidades por debajo de 10 millones de USD de facturacion anual; por encima se requiere licencia adicional de Liquid AI.
- El contexto de 131.072 tokens exige memoria KV considerable; en GPU de 12 GB habra que reducir la ventana efectiva.
- La receta "GSQ-RCO-style" es una equivalencia en formato, no una implementacion oficial de los motores GSQ/RCO.
- No se incluye bloque MTP/NextN ni decodificacion especulativa, por lo que no se aprovechan aceleraciones de ese tipo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/lavendercomputing/LFM2.5-24B-A2B-Heretic-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Maestro BF16 sin censura: https://huggingface.co/OS-Software/LFM2.5-24B-A2B-Uncensored-Heretic
- Fuente Q8_0: https://huggingface.co/OS-Software/LFM2.5-24B-A2B-Uncensored-Heretic-GGUF
- Matriz de importancia: https://huggingface.co/mradermacher/LFM2.5-24B-A2B-Uncensored-Heretic-i1-GGUF
- Heretic (herramienta de abliteration): https://github.com/p-e-w/heretic
