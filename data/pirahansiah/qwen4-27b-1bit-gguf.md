# pirahansiah/Qwen4-27B-1bit-GGUF

## Resumen

Qwen4-27B-1bit-GGUF es un repositorio de cuantizacion extrema publicado por el usuario pirahansiah en Hugging Face, destinado a alojar una version de 1 bit del modelo Qwen4-27B (dense, ~27B parametros) del equipo Qwen de Alibaba Cloud. El objetivo declarado es comprimir un modelo de 27B hasta unos 5,8-6,4 GB mediante cuantizacion IQ1_S e IQ1_M, de forma que quepa integramente en una GPU de 8 GB de VRAM sin offload a CPU. El repositorio se presenta explicitamente como un placeholder reservado: los pesos oficiales de Qwen4-27B no han sido publicados por el upstream y, por tanto, no hay archivos GGUF descargables en el momento de su creacion.

La relevancia del proyecto es conceptual: demuestra que a 1,5625-1,75 bits por peso el cuello de botella deja de ser la VRAM y pasa a ser la calidad del modelo. El autor documenta el pipeline completo (llama-imatrix, llama-quantize), los presupuestos de VRAM para distintos contextos y las variantes previstas (IQ1_S, IQ1_M, TQ1_0), pero no aporta pesos, ni validacion de perplejidad, ni resultados de benchmarks. La licencia queda pendiente de revision upstream.

Se trata, por tanto, de una ficha de un artefacto en estado embrionario: util como referencia tecnica sobre cuantizacion sub-2-bit y como destino de release, pero no como modelo ejecutable hoy.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer dense (derivado de Qwen4-27B; detalles no disponibles) |
| Parametros totales | ~27,8B (estimacion del autor para el modelo base) |
| Parametros activos | no disponible (modelo dense, no MoE) |
| Longitud de contexto | 4K-8K segun variante y KV cache cuantizada (limite practico por VRAM, no limite nativo del modelo) |
| Tipos de cuantizacion | IQ1_S (1,5625 bpw), IQ1_M (1,75 bpw), TQ1_0 (1,6875 bpw); embeddings y output head en Q4_0/Q6_K; KV cache q8_0 |
| Idiomas soportados | en, zh, multilingual (segun model card) |
| Licencia | pending-upstream-qwen4-license (no disponible; pendiente de revision) |
| Formato de pesos | GGUF (llama.cpp); pesos aun no publicados |

## Arquitectura y entrenamiento

No hay informacion disponible sobre la arquitectura interna, los datos de entrenamiento, el numero de tokens, la composicion del dataset ni las tecnicas de alineacion (RLHF/DPO) de Qwen4-27B. La model card del repositorio de cuantizacion no los describe y los pesos upstream no han sido liberados. Lo unico que se indica es que se trata de un modelo dense de ~27,8B parametros, con capacidades declaradas de razonamiento, tool calling, agentic, contexto largo y multilinguismo, y que la version mas reciente descargable de la familia es Qwen3.8-27B.

La innovacion tecnica documentada es exclusivamente la del pipeline de cuantizacion: uso de matriz de importancia (imatrix) generada con `llama-imatrix` para guiar la asignacion de bits, cuantizacion IQ1_S/IQ1_M con `llama-quantize`, y preservacion de embeddings y output head en Q4_0/Q6_K para limitar la perdida de calidad a 1 bit. El autor advierte que TQ1_0 solo es correcto para modelos entrenados en ternario (BitNet-style) y que aplicarlo a pesos ordinarios degrada la generacion respecto a IQ1_S al mismo tamano.

## Capacidades

- Generacion de texto conversacional e instruct (segun tags del repositorio).
- Razonamiento y modo chat/instruct.
- Tool calling y function calling declarados.
- Flujos agenticos y razonamiento multi-paso declarados.
- Capacidades multilingues (en, zh, multilingual) y traduccion.
- Generacion de codigo.
- Contexto largo (limitado en la practica por la VRAM a 4K-8K con KV cache q8_0).
- Capacidad de vision: solo si el release upstream es multimodal (se menciona un posible `mmproj-*.gguf`, no confirmado).
- Nota: todas estas capacidades son las declaradas para el modelo base; no hay verificacion empirica en este repositorio.

## Casos de uso

- Inferencia local en portatil con GPU de 8 GB: cargar el modelo completo con `-ngl 99` en una RTX 5060 Laptop o RTX 4060, sin offload a CPU ni trafico PCIe por token, para asistentes personales offline.
- Sustitucion de modelos 7B-13B en equipos con poca VRAM: obtener la calidad potencial de un 27B a coste de memoria de un modelo pequeno, aceptando la perdida de fidelidad de la cuantizacion a 1 bit.
- Prototipado de agentes con tool calling en entornos sin GPU de datacenter: el formato GGUF y `llama-server` permiten exponer una API compatible con OpenAI en localhost para pruebas de pipelines agenticos.
- Traduccion y procesamiento multilingue en, zh y otros idiomas: util en flujos de trabajo donde no se puede enviar texto a la nube por confidencialidad.
- Generacion de codigo asistida en IDE con LM Studio u Ollama: integracion via servidor local para autocompletado y explicacion de codigo, con la salvedad de que la calidad a 1 bit es inferior a un Q4.
- Experimentacion e investigacion en cuantizacion extrema: banco de pruebas para medir perplejidad y KL divergence de IQ1_S/IQ1_M frente a BF16 una vez existan los pesos.
- Despliegue en Apple Silicon con memoria unificada: variante para equipos con 8-16 GB de RAM unificada mediante llama.cpp.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que la validacion de perplejidad y KL frente a BF16 esta pendiente, asi que no hay datos de MMLU, HumanEval, GSM8K ni de calidad de cuantizacion.

## Requisitos de hardware

- VRAM estimada (IQ1_S, contexto 8K, KV cache q8_0): ~5,8 GB pesos + ~1,0 GB KV + ~0,4 GB buffers = ~7,2 GB de 8,0 GB.
- VRAM estimada (IQ1_M, contexto 4K): ~6,4 GB pesos + ~0,5 GB KV + ~0,4 GB buffers = ~7,3 GB.
- GPU objetivo principal: NVIDIA RTX 5060 Laptop (8 GB GDDR7) con 32 GB de RAM de sistema; tambien RTX 4060 y GPUs consumer de 8 GB.
- Cabe en GPU consumer de 8 GB; no cabe en GPUs de 6 GB con contexto util (los tags mencionan 6 GB pero los calculos del autor apuntan a 8 GB).
- Opciones de despliegue: llama.cpp (`llama-server`), LM Studio, Ollama; el repositorio esta etiquetado como `llama.cpp-ready`.
- Latencia/throughput: ~30-45 tok/s en decodificacion segun estimacion del autor (no medida); se sustituira por cifras reales en el release.
- Flags recomendados: `-ngl 99 -c 8192 --jinja -fa -ctk q8_0 -ctv q8_0`.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen4-27B-1bit-GGUF (este repo) | ~27,8B | 4K-8K practico | IQ1_S / IQ1_M | pendiente upstream | placeholder, sin pesos |
| Qwen3.8-27B (upstream mas reciente) | ~27B (dense) | no disponible | multiples (GGUF oficiales) | licencia Qwen | disponible |
| Qwen4-27B BF16 (upstream) | ~27,8B | no disponible | BF16 (~57 GB) | pendiente | no liberado |
| Modelos 7B-13B cuantizados a Q4 | 7-13B | variable | Q4_K_M | variable | disponibles |

La comparativa de rendimiento no esta disponible: no hay benchmarks publicados para este repositorio ni datos de calidad de la cuantizacion a 1 bit.

## Limitaciones y advertencias

- El repositorio no contiene pesos: es un placeholder y `llama.cpp`, LM Studio y Ollama no cargaran nada desde el.
- La cuantizacion a 1 bit es la mas lossy que sigue funcionando; el propio autor advierte que no iguala a un build de 4 bits y que puede degradar notablemente la calidad.
- TQ1_0 solo es valido para modelos entrenados en ternario; aplicarlo a pesos ordinarios produce salida peor que IQ1_S al mismo tamano.
- La licencia no esta resuelta (`pending-upstream-qwen4-license`); no hay autorizacion clara para uso comercial de pesos derivados.
- Riesgo de alucinacion elevado por la cuantizacion extrema, no cuantificado (validacion de perplejidad pendiente).
- Contexto practico limitado a 4K-8K por VRAM, muy por debajo del contexto nativo del modelo base.
- Idiomas declarados en, zh y multilingual; no hay evaluacion de calidad en castellano.
- Las cifras de throughput (~30-45 tok/s) son estimaciones del autor, no mediciones.
- Los pesos oficiales de Qwen4-27B no han sido publicados por Alibaba; el modelo base es aun "en entrenamiento" segun declaraciones del upstream.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/pirahansiah/Qwen4-27B-1bit-GGUF
- Modelo base (referencia): https://huggingface.co/Qwen
- Organizacion Qwen en Hugging Face: https://huggingface.co/Qwen
- Licencia upstream (referencia): https://huggingface.co/Qwen
- Herramientas de cuantizacion: llama.cpp (`llama-imatrix`, `llama-quantize`) — repositorio oficial de ggerganov/llama.cpp
- No se han encontrado papers, blogs, demos ni repos adicionales en la informacion proporcionada.
