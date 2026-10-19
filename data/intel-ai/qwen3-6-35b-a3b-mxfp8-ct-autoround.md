# intel-ai/Qwen3.6-35B-A3B-MXFP8-CT-AutoRound

## Resumen

Qwen3.6-35B-A3B-MXFP8-CT-AutoRound es una exportación cuantizada del checkpoint multimodal Qwen/Qwen3.6-35B-A3B, publicada por el equipo intel-ai. No es un modelo nuevo: es el mismo modelo base (arquitectura `Qwen3_5MoeForConditionalGeneration`, 35B parámetros totales y unos 3B activos, pipeline image-text-to-text) con las proyecciones de los expertos enrutados almacenadas en MXFP8, mientras el resto de componentes permanece en BF16.

El problema que resuelve es de despliegue: el checkpoint BF16 ocupa 71.903.776.776 bytes, mientras que esta exportación ocupa 40.706.972.992 bytes, una compresión de 1,77x sobre los ficheros de pesos. Según la model card, la precisión media no ponderada en cuatro tareas de evaluación de lenguaje pasa de 81,30% (BF16) a 81,14% (MXFP8), un cambio relativo de -0,19%. Es relevante ahora porque permite servir un MoE de 35B con 262.144 tokens de contexto nativo en GPUs de consumo de gama alta (la validación se hizo con 4x RTX 5090 y vLLM 0.31.0).

La cuantización se generó con Intel AutoRound usando el algoritmo RTN (`iters=0`), sin dataset de calibración, y se exportó en formato compressed-tensors. Es, por tanto, una conversión selectiva y medida, no un cuantizado integral del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5MoeForConditionalGeneration` (transformer híbrido con atención lineal y atención completa, MoE, torre de visión) |
| Parametros totales | 35B declarados en la model card; el campo de metadatos de HuggingFace derivado de safetensors indica 2.894.927.216 (discrepancia sin resolver, ver advertencias) |
| Parametros activos | Aproximadamente 3B por token (top-8 sobre 256 expertos enrutados más un experto compartido) |
| Longitud de contexto | 262.144 tokens nativos; límite de servicio validado: 131.072 tokens |
| Tipos de cuantizacion | MXFP8 W8A8 solo en proyecciones de expertos enrutados (`mlp.experts`): pesos simétricos FP8 E4M3 con escalas E8M0 por grupo de 32 y activaciones de entrada dinámicas en 8 bits. Resto en BF16. No hay esquema de cuantización de KV cache |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (hereda la del modelo base) |
| Formato de pesos | safetensors con compressed-tensors (`mxfp8-quantized` + tensores BF16), 9 shards, 63.171 claves de tensor |

## Arquitectura y entrenamiento

El modelo base es un decoder de 40 capas que combina 30 capas de atención lineal con 10 capas de atención completa, más una capa MoE con 256 expertos enrutados, enrutamiento top-8 y un experto compartido. También incorpora torre de visión y componentes MTP. La model card no detalla la composición del dataset de entrenamiento ni las etapas de alineación (RLHF/DPO) del checkpoint original; esa información corresponde al modelo base y no se incluye en la documentación proporcionada.

La aportación de esta ficha es el proceso de cuantización: AutoRound con `--scheme MXFP8 --algorithm rtn --iters 0`, es decir, round-to-nearest sin calibración ni ajuste posterior. La lista `--ignore_layers` protege explícitamente `lm_head`, `embed_tokens`, `visual`, `linear_attn`, `shared_expert`, `self_attn`, `mtp` y `mlp.gate`, de modo que solo se cuantizan los expertos enrutados. El entorno medido fue Python 3.12.14, PyTorch 2.13.0+cu132, Transformers 5.17.0 y AutoRound 0.16.0.dev193+g22d6e28c, con la cuantización ejecutada en una única RTX 5090. La exportación resultante contiene 30.720 tensores de pesos `F8_E4M3`, 30.720 tensores de escalas `U8` (E8M0) y 1.731 tensores en BF16; el autor verificó que todas las referencias del índice existen en sus shards y que los tensores protegidos siguen en BF16.

## Capacidades

- Generación de texto y razonamiento en el mismo rango que el checkpoint BF16 del que deriva, con una degradación media declarada de -0,19% relativo en cuatro tareas de lenguaje.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`, torre de visión conservada en BF16), aunque la calidad multimodal no se ha evaluado en esta exportación.
- Contexto largo: 262.144 tokens nativos, con 131.072 tokens validados en servicio.
- Capacidad de ejecución como modelo denso-eficiente: ~3B parámetros activos por token sobre 35B totales, lo que reduce el coste de cómputo por token frente a un denso equivalente.
- Compatibilidad declarada con vLLM (backend MARLIN MXFP8 MoE y FLASH_ATTN v2, sin código remoto) y con la etiqueta `endpoints_compatible` de HuggingFace.
- Soporte de tool calling, function calling y flujos de agente: no verificado en esta exportación; la model card indica explícitamente que no se han evaluado tareas agénticas.
- Capacidades multilingües: no disponible (no se declara lista de idiomas).

## Casos de uso

- Atención al cliente automatizada: servir el modelo con vLLM a 131.072 tokens permite mantener historiales multi-turno largos y adjuntar capturas o documentos escaneados en la misma conversación, con un coste de pesos de 40,7 GB por réplica repartible entre dos GPUs.
- Análisis de documentación técnica extensa con figuras: informes, planos o papers de cientos de páginas que caben en la ventana nativa de 262.144 tokens, aprovechando la entrada image-text-to-text para interpretar tablas y diagramas junto al texto.
- RAG sobre corpus internos: indexar manuales completos y pasar los fragmentos recuperados sin recortes agresivos; el contexto nativo reduce la necesidad de reordenar y comprimir pasajes, y el formato MXFP8 abarata el despliegue en clústeres pequeños.
- Generación y revisión de código en pipelines de CI/CD: el modelo puede recibir el diff completo de un repositorio mediano y devolver revisiones; conviene validar previamente el soporte real de tool calling, no evaluado en esta exportación.
- Procesamiento por lotes de informes con tablas y gráficos: clasificación, extracción y resumen de documentos corporativos heterogéneos, con la ventaja de un solo checkpoint que cubre texto e imagen y de un peso en disco de 40,7 GB frente a 71,9 GB del BF16.
- Asistentes de investigación sobre literatura científica: lectura de PDF con ecuaciones y figuras, resumen comparativo entre artículos y extracción de resultados, apoyándose en la ventana de 131.072 tokens validada en servicio.
- Evaluación de la propia cuantización en pipelines internos: al ser una receta reproducible con AutoRound y `--format llm_compressor`, sirve como referencia para comparar MXFP8 frente a BF16 en tareas propias antes de adoptarlo en producción.

## Benchmarks y rendimiento

| Metrica | BF16 (referencia) | MXFP8 (este checkpoint) | Diferencia |
|---|---|---|---|
| Media no ponderada de 4 tareas de lenguaje | 81,30% | 81,14% | -0,16 puntos porcentuales; -0,19% relativo (ratio) |

Los nombres concretos de las cuatro tareas, sus resultados individuales y el protocolo de evaluación no estan disponibles en la informacion proporcionada (la model card aparece truncada en la seccion de evaluacion). No se han publicado resultados de benchmarks multimodales, de throughput ni de tareas agenticas; el autor lo indica expresamente. No se inventan cifras adicionales.

## Requisitos de hardware

- Peso de los ficheros de pesos: 40.706.972.992 bytes (40,7 GB) en MXFP8/BF16, frente a 71.903.776.776 bytes del checkpoint BF16. El repositorio completo ocupa 40,7 GB.
- VRAM mínima: los pesos por sí solos superan los 32 GB de una RTX 5090, por lo que no cabe en una sola GPU de consumo sin offloading; se necesita reparto entre al menos dos aceleradores.
- Configuración validada: 4x NVIDIA RTX 5090 con TP=2, DP=2, expert parallelism y PP=1 en vLLM 0.31.0, es decir, dos réplicas de dos GPUs cada una, con `--max-model-len 131072` y `--dtype bfloat16`.
- KV cache en BF16 en la configuración validada; su tamaño a 131.072 tokens no se puede calcular con los datos disponibles (no se publican número de cabezas ni dimensión por cabeza).
- GPUs recomendadas: RTX 5090 (validada), y por capacidad de memoria, A100 80 GB o H100 80 GB en configuraciones TP=1 o TP=2; no hay mediciones publicadas para estas últimas.
- Opciones de despliegue: vLLM (única validada, con backend MARLIN MXFP8 MoE). No se ha validado llama.cpp, Ollama, TGI ni SGLang, y el formato compressed-tensors no es GGUF, por lo que la ruta de llama.cpp requeriría una conversión adicional no documentada.
- Latencia y throughput: no disponibles. La model card indica explícitamente que no se ha evaluado el rendimiento en producción.
- Cuantización reproducible en una sola GPU: el proceso AutoRound se ejecutó en 1x RTX 5090, con lo que generar una variante propia no requiere un nodo multi-GPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Precision de pesos | Tamano de pesos | Benchmark | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-MXFP8-CT-AutoRound | 35B totales / ~3B activos | 262.144 nativos (131.072 validados) | MXFP8 en expertos enrutados + BF16 | 40,7 GB | Media 81,14% en 4 tareas | Apache-2.0 | HuggingFace, vLLM |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales / ~3B activos | 262.144 nativos | BF16 | 71,9 GB | Media 81,30% en 4 tareas | Apache-2.0 | HuggingFace |
| Otras alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificados de terceros modelos comparables (ni de otras variantes cuantizadas del mismo base, como FP8 integral o AWQ/GPTQ) en la informacion proporcionada, por lo que no se establece comparacion numerica con ellos.

## Limitaciones y advertencias

- Solo cuatro tareas de lenguaje evaluadas, sin resultados individuales publicados; la media de 81,14% no permite inferir el comportamiento en código, matemáticas o razonamiento multilingüe.
- El límite de servicio validado es 131.072 tokens, la mitad del contexto nativo de 262.144; las tareas de evaluación no son pruebas de estrés a 128K, según advierte el propio autor.
- Calidad multimodal no evaluada: la torre de visión se conserva en BF16, pero no hay mediciones de precisión en tareas de imagen.
- Rendimiento y tareas agénticas no evaluados: no hay datos de latencia, throughput ni de uso de tool calling en esta exportación.
- Cuantización RTN sin calibración (`iters=0`): no se usó dataset de calibración, de modo que el error de cuantización no está ajustado a dominios concretos. El -0,19% relativo es una media de cuatro tareas y puede ocultar degradaciones mayores en tareas específicas.
- Solo se cuantizan los expertos enrutados; atención, atención lineal, experto compartido, router, embeddings, `lm_head`, torre de visión y MTP siguen en BF16. El ahorro de memoria es menor que el de una conversión integral y el consumo de VRAM sigue dominado por los componentes en BF16.
- KV cache en BF16: el coste de memoria de contexto largo no se reduce con esta receta.
- Discrepancia de parámetros: los metadatos de HuggingFace indican 2.894.927.216 parámetros derivados de safetensors, mientras que la model card declara 35B totales y ~3B activos. Conviene verificar el conteo real con la configuración del modelo antes de dimensionar hardware a partir del dato de HuggingFace.
- Riesgo de alucinación y sesgos: no documentados para esta exportación; son los heredados del modelo base, cuya model card no se incluye en la información proporcionada.
- Licencia Apache-2.0 heredada del base, permisiva para uso comercial; aun así, debe revisarse el LICENSE del modelo original y las condiciones de los datos de entrenamiento, no detalladas aquí.

## Enlaces

- [intel-ai/Qwen3.6-35B-A3B-MXFP8-CT-AutoRound en HuggingFace](https://huggingface.co/intel-ai/Qwen3.6-35B-A3B-MXFP8-CT-AutoRound)
- [Modelo base Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [Licencia del modelo base (Apache-2.0)](https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE)
- Papers, blogs, repositorios y demos adicionales: no disponible (la búsqueda web realizada no devolvió resultados técnicos relevantes sobre este modelo).
