# mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-i1-GGUF

## Resumen

Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-i1-GGUF es una cuantizacion GGUF del modelo DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored, un fine-tune no censurado de la familia Qwen3. El trabajo de cuantizacion lo firma mradermacher, autor habitual de cuantizaciones GGUF en Hugging Face, y emplea el formato i1 (imatrix) para preservar la calidad en tamanos reducidos. El modelo base tiene 27.320.697.856 parametros (unos 27,3 mil millones) y se distribuye bajo licencia Apache 2.0.

El modelo base es un fine-tune orientado a eliminar restricciones de alineacion (etiquetas "heretic" y "uncensored"), entrenado por DavidAU con datasets propios como Polar-STRICT, F451-STRICT y THE-DECKARD. La model card menciona tecnicas de "Cold Fusion", "GAIN Training" y ajuste multi-etapa, aunque no se detalla su funcionamiento. El resultado es un modelo conversacional en ingles, pensado para casos de uso generalistas ("all use cases") sin los filtros habituales de los modelos alineados.

La relevancia practica de esta ficha esta en la cuantizacion: el repositorio ofrece desde i1-Q2_K (11 GB) hasta i1-Q6_K (22,5 GB), lo que permite ejecutar un modelo de 27B en hardware de consumo con suficiente VRAM o RAM. Es, por tanto, una opcion para quien necesite un modelo grande sin censura y con despliegue local, asumiendo las advertencias eticas y de calidad que implica un fine-tune de este tipo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3; detalles no disponibles) |
| Parametros totales | 27.320.697.856 (27,3 mil millones) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | i1-Q2_K, i1-Q3_K_S, i1-IQ3_S, i1-IQ3_M, i1-Q3_K_M, i1-Q3_K_L, i1-IQ4_XS, i1-Q4_0, i1-Q4_K_S, i1-Q4_K_M, i1-Q4_1, i1-Q5_K_S, i1-Q5_K_M, i1-Q6_K, mas fichero imatrix |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (cuantizaciones i1/imatrix); el modelo base en safetensors |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura interna del modelo base mas alla de su adscripcion a la familia Qwen3 (transformers). Los tags "qwen3_8" y "qwen3_6" sugieren una base Qwen3, pero no se especifica la variante exacta, el numero de capas, la dimension oculta ni el mecanismo de atencion. Tampoco se indica la longitud de contexto nativa.

Sobre el entrenamiento, la model card del modelo base menciona "Cold Fusion", "GAIN Training" y "Multi-stage tuning", asi como el uso de los datasets DavidAU/Polar-STRICT-Datasets, DavidAU/F451-STRICT-Datasets y DavidAU/THE-DECKARD-Datasets. No se aportan cifras de tokens, composicion del dataset ni si hubo RLHF o DPO. La etiqueta "heretic" indica un proceso de desalineacion deliberada (ablacion o fine-tune para eliminar rechazos), y "unsloth" apunta al uso de esa libreria en el entrenamiento. Esta cuantizacion concreta aplica cuantizacion con imatrix (i1) sobre el modelo base, sin reentrenamiento adicional.

## Capacidades

- Generacion de texto conversacional en ingles, con etiqueta "all use cases" en la model card.
- Modelo no censurado ("uncensored", "heretic"): no aplica los rechazos tipicos de los modelos alineados.
- Soporte de conversacion multi-turno (tag "conversational").
- Compatibilidad con endpoints (tag "endpoints_compatible").
- Capacidades de codigo, matematicas o razonamiento: no documentadas en la informacion disponible.
- Tool calling / function calling: no documentado.
- Soporte de agentes o razonamiento multi-paso: no documentado.
- Capacidades multimodales (vision, audio): no disponibles.
- Modo "thinking": no documentado.

## Casos de uso

- Despliegue local de un modelo de 27B en hardware de consumo: con las cuantizaciones i1-Q4_K_M (16,9 GB) o i1-Q3_K_M (13,6 GB) se puede ejecutar en una GPU de 24 GB o en configuraciones CPU+GPU con llama.cpp, manteniendo un tamano de parametros que no cabe en cuantizaciones de 8 bits.
- Generacion creativa sin filtros: escritura de ficcion, guiones o narrativa que requiera tematicas adultas o controvertidas, donde los modelos alineados rechazan la peticion; el modelo esta explicitamente disenado para no censurar.
- Investigacion sobre alineacion y seguridad: analisis de como un fine-tune "heretic" altera el comportamiento de rechazo respecto al Qwen3 original, util para estudiar taxonomias de dano y eficacia de salvaguardas.
- Prototipado de asistentes conversacionales en ingles: el tag "conversational" y la compatibilidad con endpoints permiten montar un servicio de chat con vLLM o llama.cpp server y una API compatible con OpenAI.
- Evaluacion comparativa de cuantizaciones: el repositorio ofrece 14 variantes i1 mas el fichero imatrix, lo que permite medir el impacto de la cuantizacion en perplejidad y calidad para un modelo de 27B.
- Fine-tuning posterior sobre dominio propio: al estar en Apache 2.0 y con pesos completos disponibles en el modelo base, se puede partir de el para ajustes especificos, aunque conviene valorar el riesgo reputacional de un modelo no censurado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/RAM estimada segun cuantizacion: i1-Q2_K ~11 GB; i1-IQ3_S ~12,7 GB; i1-Q3_K_M ~13,6 GB; i1-IQ4_XS ~15,4 GB; i1-Q4_K_S ~15,9 GB; i1-Q4_K_M ~16,9 GB; i1-Q5_K_M ~19,6 GB; i1-Q6_K ~22,5 GB. Hay que anadir el espacio para el contexto KV cache, que no se puede calcular sin conocer la longitud de contexto y la configuracion de atencion.
- GPU recomendadas: para Q4_K_M, una RTX 4090 (24 GB) o RTX 3090 (24 GB) es suficiente; para Q6_K conviene una A100 40 GB, H100 o una RTX 4090 con offload parcial. Para Q2_K o Q3 puede bastar una GPU de 16 GB con contexto corto.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con cuantizaciones Q3 a Q5; en GPUs de 16 GB (RTX 4080, 4060 Ti 16 GB) solo con Q2/Q3 y contexto limitado.
- Opciones de despliegue: llama.cpp, Ollama (importando el GGUF), LM Studio, y servidores compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa para este formato, por lo que para esos motores habria que usar el modelo base en safetensors.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (i1-GGUF) | 27,3B | No disponible | Apache 2.0 | GGUF i1 | Fine-tune no censurado, solo ingles |
| Modelo base DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored | 27,3B | No disponible | Apache 2.0 | safetensors | Version sin cuantizar |
| mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-GGUF | 27,3B | No disponible | Apache 2.0 | GGUF estatico | Mismo modelo, cuantizacion sin imatrix |
| Qwen3 original (familia) | No disponible | No disponible | No disponible | No disponible | Modelo de referencia alineado; variante exacta no identificada |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Modelo no censurado ("heretic", "uncensored"): puede generar contenido ofensivo, ilegal o danino sin rechazo; no es apto para aplicaciones orientadas al publico sin salvaguardas externas.
- Solo soporta ingles segun la model card; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion no cuantificado: no hay benchmarks publicados.
- La desalineacion puede degradar capacidades generales respecto al Qwen3 original; no hay datos que lo confirmen o desmientan.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el comportamiento etico o legal del modelo; la responsabilidad recae en el desplegador.
- No se documenta la longitud de contexto, lo que impide planificar el KV cache y los casos de contexto largo.
- El repositorio ocupa 218,6 GB por incluir todas las cuantizaciones; conviene descargar solo la variante necesaria.
- La model card del cuantizador remite a la del modelo base para detalles tecnicos; esta ficha se limita a lo disponible.

## Enlaces

- Hugging Face (cuantizacion i1): https://huggingface.co/mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-i1-GGUF
- Modelo base: https://huggingface.co/DavidAU/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored
- Cuantizaciones estaticas: https://huggingface.co/mradermacher/Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-GGUF
- Pagina de descargas del cuantizador: https://hf.tst.eu/model#Qwen3.8-27B-TWIN-TURBO-Fable-Cold-Fusion-709-L-Uncensored-i1-GGUF
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- FAQ y peticiones de cuantizacion: https://huggingface.co/mradermacher/model_requests
- Grafico de perplejidad por tipo de cuantizacion: https://www.nethype.de/huggingface_embed/quantpplgraph.png
- Notas de Artefact2 sobre cuantizaciones: https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
