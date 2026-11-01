# sanasol2008/Qwen3.8-Flash-Next-Abliterated-Sushi-3bpw

## Resumen

Qwen3.8-Flash-Next-Abliterated-Sushi-3bpw es una cuantizacion experimental en formato Sushi de 3 bits por peso (3bpw) de un derivado "abliterated" (sin rechazo) del modelo Qwen3.8-Flash-Next. Lo publica el usuario sanasol2008 en HuggingFace y parte del checkpoint BF16 de orcarouter/Qwen3.8-Flash-Next-Uncensored, en su revision e096800. Se trata de la variante de 3 bits de un pack hermano de 2bpw, y su proposito es ofrecer una version algo mas fiel del modelo original manteniendo la posibilidad de ejecutarse en hardware de consumo con memoria unificada.

El modelo es un transformer de tipo MoE (mezcla de expertos) con capacidades multimodales de imagen a texto, segun indican los tags y el pipeline declarado. Cuenta con 28.849.143.699 parametros totales, un contexto configurado de hasta 262.144 tokens y un sidecar de n-gramas de 29,8 GiB que se apoya en disco. La cuantizacion solo afecta a los expertos enrutados (EXL3 K3, codebook MCG, ventana 15); el resto de componentes (tronco denso, torre de vision, tokenizer) es identico byte a byte al pack de 2bpw.

Su relevancia es doble: por un lado, demuestra el estado del arte de las tecnicas de cuantizacion extrema (3 bits) aplicadas a modelos MoE multimodales; por otro, su naturaleza "abliterated" y su licencia real (Qwen Community License 1.0, pese a que la model card original declare Apache 2.0) lo convierten en un caso interesante para estudiar los limites practicos de estos formatos. No obstante, el propio autor advierte que no se ha medido la calidad respecto a BF16 ni la tasa de rechazo, y que el contexto de 256k es un techo configurado, no una garantia medida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), con tronco denso, torre de vision y tronco MTP |
| Parametros totales | 28.849.143.699 |
| Parametros activos | no disponible |
| Longitud de contexto | 262.144 tokens (techo configurado, no garantizado a plena longitud) |
| Tipos de cuantizacion | Expertos enrutados en EXL3 K3 (3 bits, codebook MCG, ventana 15); tronco denso affine8; sidecar n-gramas affine4/group32; KV cache cuantizable a 8 bits |
| Idiomas soportados | no disponible (la validacion funcional incluye una instruccion en ruso) |
| Licencia | Qwen Community License 1.0 (la model card upstream declara Apache 2.0, pero el LICENSE incluido es Qwen Community License 1.0) |
| Formato de pesos | safetensors en formato Sushi (no es un checkpoint generico de Transformers ni de ExLlamaV3); libreria mlx |

## Arquitectura y entrenamiento

La arquitectura es un transformer MoE con capacidades multimodales (pipeline image-text-to-text). El pack incluye un tronco denso cuantizado en affine8, una torre de vision, un tronco MTP (multi-token prediction) y un sidecar de n-gramas en disco (ngram_table.bin, affine4/group32, 29,8 GiB). Solo los expertos enrutados, incluidos los expertos MTP, se cuantizan en EXL3 K3 con codebook MCG y ventana 15, calibrados a partir de los pesos BF16 con 64 filas x 1024 tokens. El resto de componentes es identico byte a byte al pack de 2bpw (mismo sha256).

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base. La "abliteracion" (eliminacion del comportamiento de rechazo) proviene del checkpoint upstream orcarouter/Qwen3.8-Flash-Next-Uncensored; esta conversion no anade abliteracion ni fine-tuning adicional. El conversor se basa en ExLlamaV3 (commit 151539c) con una adaptacion aislada del encoder MCG ventana 15, y su salida K2/K3 se verifico bit-exacta contra el decodificador EXL3 de Sushi v1.2.1. El autor reporta un error de calibracion relativo de Frobenius de 0,029 (SQNR 43,4 dB) en la capa 0 del decodificador, frente a 0,064 (38,0 dB) del pack de 2bpw.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, con modo "thinking" desactivable (la validacion se hizo con thinking off y temperatura 0).
- Aritmetica basica verificada funcionalmente en las pruebas del autor.
- Capacidades multimodales de imagen a texto: OCR validado con transcripcion correcta de tres campos, incluidos numeros.
- Soporte de tool calling / function calling: validado con una llamada a get_weather con city=Belgrade.
- Multilinguismo parcial: se valido una instruccion en ruso, aunque no hay lista oficial de idiomas.
- Soporte de contexto largo: hasta 262.144 tokens configurados (techo no medido a plena longitud).
- Capacidades de agente y razonamiento multi-paso: no validadas explicitamente por el autor.
- MTP (multi-token prediction) presente en el pack, aunque el autor lo desactivo (--no-mtp) en sus pruebas.

## Casos de uso

- Procesamiento de documentos con OCR: el modelo puede transcribir campos estructurados (numeros, texto) de imagenes, lo que resulta util para digitalizar facturas, formularios o tickets en pipelines automatizados. La validacion del autor confirma esta capacidad, aunque conviene verificar la precision en dominios concretos.
- Asistente conversacional sin filtros de rechazo: al estar "abliterated", es adecuado para entornos de investigacion que estudian el comportamiento de modelos sin alineamiento de seguridad, o para aplicaciones creativas donde los rechazos resultan molestos. Requiere supervision humana por el riesgo de contenido inapropiado.
- Prototipado en Mac con memoria unificada: con 48 GiB se puede ejecutar en streaming desde SSD con el motor Sushi v1.2.1; con 64 GiB o mas, gran parte del pack queda residente. Util para desarrolladores que quieren probar un MoE multimodal de ~29B en hardware Apple sin GPU dedicada.
- Experimentacion con cuantizacion extrema: sirve como banco de pruebas para comparar calidad y velocidad entre 2bpw y 3bpw en el mismo modelo base, gracias a que comparten tronco, vision y tokenizer.
- Tool calling en agentes ligeros: la llamada a funciones esta validada (get_weather), por lo que puede integrarse en flujos de agentes que consulten APIs externas, siempre que se acepte la latencia reducida del formato.
- Contexto largo para analisis de documentos extensos: con 262.144 tokens configurados, puede procesar conversaciones o documentos muy largos, aunque el autor advierte que no se ha medido el rendimiento a plena longitud.
- Investigacion sobre alineamiento y seguridad: la variante abliterated permite estudiar diferencias de comportamiento respecto al modelo original en tareas sensibles, con la cautela de que la tasa de rechazo no se ha caracterizado de forma independiente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta pruebas funcionales y una comparativa controlada de decodificacion:

| Pack | Decodificacion en frio | Decodificacion en caliente (media de ejecuciones 2-3) |
|---|---:|---:|
| Abliterated 2bpw | 18,36 tok/s | 28,91 tok/s |
| Este pack 3bpw | 11,88 tok/s | 12,88 tok/s |

Mediciones realizadas en Apple M3 Max con 48 GiB de memoria unificada, contexto de 16k, prefill chunk 512, cache de prefijo desactivada, mismo prompt de 40 tokens y 256 tokens generados. El autor advierte que son mediciones con cache de expertos en prompts cortos en una maquina que no puede mantener residentes los expertos de 3bpw, por lo que no representan el throughput en agentes de contexto largo; una maquina con mas memoria vera una ratio distinta. MTP, video y contexto largo no se validaron.

## Requisitos de hardware

- VRAM/memoria estimada: el pack completo ocupa unos 79,22 GiB en disco, incluido el sidecar de n-gramas de 29,8 GiB. En Apple Silicon con 48 GiB, los expertos se transmiten desde SSD con --ssd-budget-gb (22 GiB en las pruebas); con 64 GiB o mas, gran parte del pack queda residente.
- GPU recomendadas: no hay datos especificos para GPU dedicadas; el autor solo valida Apple M3 Max de 48 GiB. Para GPUs NVIDIA de gran memoria (A100 80 GB, H100 80 GB) no se proporcionan mediciones.
- Cabe en GPU de consumo: no confirmado; el formato Sushi y la libreria mlx apuntan a hardware Apple Silicon, no a GPUs consumer convencionales.
- Opciones de despliegue: motor Sushi v1.2.1 (comando sushi serve), con flags --vision, --ssd-budget-gb, --kv-quant 8, --ctx-size, --prefill-chunk, --prefix-cache-entries, --prefix-cache-mem, --prefix-cache-disk, --temp. No es compatible con vLLM, llama.cpp, Ollama ni TGI de forma directa, al no ser un checkpoint generico de Transformers ni de ExLlamaV3.
- Latencia y throughput: 11,88 tok/s en frio y 12,88 tok/s en caliente en M3 Max de 48 GiB con streaming desde SSD; el pack de 2bpw alcanza 18,36 y 28,91 tok/s respectivamente en las mismas condiciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-Abliterated-Sushi-3bpw (este) | 28,85B | 262.144 | EXL3 K3 (3bpw) en expertos | Qwen Community License 1.0 | HuggingFace, formato Sushi, motor Sushi |
| Qwen3.8-Flash-Next-Abliterated-Sushi-2bpw | no disponible | no disponible | EXL3 K2 (2bpw) en expertos | Qwen Community License 1.0 | HuggingFace, formato Sushi, motor Sushi |
| orcarouter/Qwen3.8-Flash-Next-Uncensored | no disponible | no disponible | BF16 | no disponible | HuggingFace (checkpoint base) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la informacion proporcionada, por lo que la comparacion se limita a parametros, cuantizacion y licencia.

## Limitaciones y advertencias

- Calidad no garantizada: el autor declara explicitamente que no se hace ninguna afirmacion de equivalencia con BF16 ni de calidad sin perdidas; no se ha medido la KLD de este pack.
- Tasa de rechazo no caracterizada: la abliteracion proviene del checkpoint upstream y no se ha medido de forma independiente el comportamiento de rechazo, lo que impide predecir su respuesta ante peticiones sensibles.
- Sesgos conocidos: no disponibles en la informacion proporcionada; al ser un derivado sin alineamiento de seguridad, es probable que herede sesgos del modelo base, pero no se documentan.
- Riesgo de alucinacion: no cuantificado; el autor solo valida funciones basicas, no la fidelidad factual.
- Limitaciones de contexto: los 256k tokens son un techo configurado, no una garantia medida a plena longitud; el rendimiento en contexto largo no se ha validado.
- Compatibilidad restringida: es un pack Sushi, no un checkpoint generico de ExLlamaV3 ni de Transformers; requiere el motor Sushi v1.2.1 y no funciona con vLLM, llama.cpp, Ollama ni TGI de forma directa.
- Licencia: el LICENSE incluido es Qwen Community License 1.0, aunque la model card upstream declare Apache 2.0; el repositorio preserva la licencia incluida en lugar de asumir Apache. Es necesario revisar los terminos de uso comercial de dicha licencia antes de usarlo en produccion.
- Rendimiento degradado en hardware limitado: en maquinas de 48 GiB, los expertos se transmiten desde SSD y la decodificacion cae a 11,88-12,88 tok/s, muy por debajo del pack de 2bpw.
- Componentes no validados: MTP, video y comportamiento en contexto largo no se validaron; el autor desactivo MTP en sus pruebas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sanasol2008/Qwen3.8-Flash-Next-Abliterated-Sushi-3bpw
- Pack hermano de 2bpw: https://huggingface.co/sanasol2008/Qwen3.8-Flash-Next-Abliterated-Sushi-2bpw
- Checkpoint base BF16: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- ExLlamaV3 (conversor base): https://github.com/turboderp-org/exllamav3
- Sushi (motor de inferencia): no se proporciona URL en la informacion disponible; el autor atribuye el formato a beamivalice.
