# hletrd/Cosmos3-Nano-Text-Tensix-BFP4

## Resumen

Cosmos3-Nano-Text-Tensix-BFP4 es una cuantizacion del modelo de texto nvidia/Cosmos3-Nano, publicada por el usuario hletrd (Xylolabs) y orientada especificamente a la inferencia sobre aceleradores Tenstorrent Tensix (Wormhole y Blackhole). No se trata de un modelo nuevo entrenado desde cero, sino de un export de pesos del tower de texto del modelo base, con las capas de atencion y MLP almacenadas en formato block-floating-point bfloat4_b y el resto de tensores en bf16. El repositorio incluye tambien una variante en bfloat8_b (text-bfp8) dentro del mismo paquete, unificadas el 27 de noviembre de 2026.

El modelo base, Cosmos3-Nano, es un modelo multimodal de NVIDIA del que este export conserva unicamente la torre de generacion de texto. Quedan fuera el codificador de vision, el VAE de video y el tokenizador de audio, por lo que la ficha describe exclusivamente capacidades de generacion de texto. Los pesos suman 8.190.735.360 parametros segun el recuento real de safetensors, lo que situa al modelo en la franja de 8B clasicos.

La relevancia de este artefacto es de infraestructura mas que de modelado: demuestra un pipeline de cuantizacion GPTQ adaptado al formato de bloque BFP4/BFP8 que consumen las NPU Tensix via tt-metal y ttnn, con verificacion de round-trip y una metrica de divergencia (KL medio) frente a BF16 y frente a la referencia Q4_K_M de llama.cpp. Para desarrolladores que despliegan en hardware Tenstorrent, es una de las pocas opciones publicas de pesos ya empaquetados para esa ruta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (torre de texto de nvidia/Cosmos3-Nano); detalles internos no disponibles |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat4_b (BFP4) en atencion y MLP; bfloat8_b (BFP8) en atencion y MLP; resto en bf16; tambien existe referencia Q4_K_M de llama.cpp |
| Idiomas soportados | no disponible en la model card (la evaluacion KL cubre ingles y coreano) |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | safetensors (indexados con model.safetensors.index.json), carpetas text-bfp4/ y text-bfp8/; metadatos auxiliares quant4.json y pack_tensix.py |
| Tamano empaquetado BFP4 | 6.397 GB |
| Tamano empaquetado BFP8 | 9.870 GB |
| Tamano BF16 de referencia | 16.38 GB |
| Tamano del repo | 30.3 GB |
| Libreria declarada | transformers |
| Hardware objetivo | Tenstorrent Tensix (Wormhole, Blackhole) via tt-metal / ttnn / tt-forge |

## Arquitectura y entrenamiento

El export no aporta informacion sobre el entrenamiento del modelo base: no se detallan el numero de tokens, la composicion del dataset ni si hubo RLHF o DPO. Lo que si documenta la model card es el proceso de cuantizacion. Se aplica una cuantizacion de tipo GPTQ (repositorio tensix-bfp-gptq de Xylolabs) que transforma las matrices de atencion y MLP al formato block-floating-point nativo de Tensix: bfloat4_b para la variante BFP4 y bfloat8_b para la BFP8, manteniendo el resto de tensores en bf16. El formato block-floating-point comparte un exponente por bloque de valores, lo que encaja con la unidad de computo matricial de las NPU Tensix.

La validacion se hace con divergencia KL frente a BF16 sobre 16.272 posiciones de texto en ingles y coreano (test de WikiText-2 y Wikipedia en coreano), tanto en texto plano como aplicando la plantilla de chat. Los resultados son 0.03028 de KL medio para BFP4 y 0.00078 para BFP8, con un limite aceptado de 1,5 veces la KL de la referencia Q4_K_M (0.03370). Es decir, la variante BFP4 queda ligeramente por debajo de la perdida de Q4_K_M y la BFP8 practicamente indistinguible de BF16 en esa metrica. El repo incluye scripts pack_tensix.py y verify_grid.py para empaquetar y verificar el round-trip de los pesos contra ttnn, y se documenta la integracion con tt-transformers (tt-metal v0.81.1, flag --use_hf_rope) y con tt-forge mediante torch_xla y torch.compile con backend "tt".

## Capacidades

- Generacion de texto autoregresiva en el formato de chat del modelo base (apply_chat_template).
- Conversacion multi-turno mediante plantilla de chat, segun el ejemplo de la model card.
- Ejecucion en transformers estandar (AutoModelForCausalLM) y en la ruta Tenstorrent (ttnn, tt-transformers, tt-forge).
- Soporte de decodificacion con cache KV en BFP8 en la configuracion de precision recomendada para tt-transformers.
- Capacidades multimodales del modelo base (vision, video, audio): no disponibles en este export, que excluye codificador de vision, VAE de video y tokenizador de audio.
- Tool calling / function calling: no disponible en la informacion.
- Modo de razonamiento extendido o thinking mode: no disponible en la informacion.
- Cobertura multilingue: no declarada; la evaluacion de calidad cubre ingles y coreano.

## Casos de uso

- Despliegue en NPU Tenstorrent Wormhole o Blackhole: el caso principal. Se descarga la carpeta text-bfp4/ y se ejecuta con tt-transformers o tt-forge, aprovechando el formato block-floating-point nativo para reducir el peso en DRAM a 6,4 GB frente a 16,4 GB en BF16.
- Servicio de generacion de texto en transformers: la variante BFP4 se carga con AutoModelForCausalLM en dtype bfloat16 y device_map="auto", lo que permite usar el modelo en pipelines Python existentes sin reescribir la integracion.
- Evaluacion comparativa de precision de cuantizacion: util para medir el impacto de BFP4 frente a BFP8 y Q4_K_M con la metrica KL documentada, replicando el conjunto de 16.272 posiciones sobre WikiText-2 y Wikipedia coreana.
- Prototipado de chat conversacional: el ejemplo de la model card con apply_chat_template y max_new_tokens permite montar rapidamente un endpoint de chat de un solo turno o multi-turno sobre el tower de texto.
- Investigacion en hardware alternativo: sirve como banco de pruebas para validar kernels de atencion y MLP en tt-metal con precisiones mixtas (bfp4 en ff1_3, ff2, wqkv y wo; bfp8 en KV cache), util para optimizar configuraciones de fidelidad (hifi2, lofi, hifi4).
- Integracion en pipelines CI de cuantizacion: los scripts pack_tensix.py y verify_grid.py permiten automatizar la comprobacion de que los pesos empaquetados hacen round-trip exacto contra torch, como test de regresion al actualizar tt-metal.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. La unica metrica publicada es la divergencia KL frente a BF16:

| Variante | Formato | Tamano empaquetado (GB) | KL medio vs BF16 |
|---|---|---|---|
| text-bfp4 | bfloat4_b en atencion y MLP | 6.397 | 0.03028 |
| text-bfp8 | bfloat8_b en atencion y MLP | 9.870 | 0.00078 |
| BF16 (modelo base) | bf16 | 16.38 | 0 (referencia) |
| Q4_K_M (llama.cpp) | Q4_K_M | 5.028 | 0.03370 |

El conjunto de evaluacion son 16.272 posiciones de ingles y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat. El criterio de aceptacion es una KL media no superior a 1,5 veces la de Q4_K_M.

## Requisitos de hardware

- VRAM / memoria: 6,4 GB de pesos empaquetados en BFP4 y 9,9 GB en BFP8; en BF16 serian 16,4 GB. A esto hay que sumar cache KV (en BFP8 en la configuracion recomendada) y activaciones.
- GPU consumer: no se documenta soporte en GPU. La ruta prevista es la NPU Tensix; en GPU solo cabria via transformers con los pesos BFP4/BFP8, cuyo soporte nativo en CUDA no se detalla en la model card.
- Hardware objetivo: Tenstorrent Wormhole y Blackhole, con tt-metal v0.81.1 y el flag --use_hf_rope para tt-transformers.
- Despliegue: tt-transformers (demo simple_text_demo.py con precision_cfg y fidelity_cfg), tt-forge via pjrt-plugin-tt==1.4.0 y torch.compile con backend "tt", o transformers estandar con device_map="auto".
- Latencia y throughput: no disponibles; la model card solo menciona una prueba de rendimiento con batch-1 sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Cosmos3-Nano-Text-Tensix-BFP4 (este) | 8,19B | no disponible | BFP4 / BFP8 / bf16 | OpenMDW-1.1 | Hugging Face, 184 descargas |
| nvidia/Cosmos3-Nano (base) | no disponible en esta ficha | no disponible | bf16 | OpenMDW-1.1 | Hugging Face |
| Q4_K_M de llama.cpp (referencia del autor) | mismos pesos base | no disponible | Q4_K_M, 5,028 GB, KL 0.03370 | depende del base | referencia de comparacion en la model card |

No se dispone de datos de otros modelos de la misma categoria en la informacion proporcionada para ampliar la comparativa con cifras de rendimiento.

## Limitaciones y advertencias

- Es un export de solo texto: no incluye vision, video ni audio del modelo base, por lo que no debe presentarse como modelo multimodal.
- La licencia OpenMDW-1.1 se hereda del modelo base; el repositorio del modelo base no incluye fichero de licencia y el autor copia el texto del acuerdo en LICENSE. Conviene revisar los terminos de OpenMDW-1.1 antes de un uso comercial.
- La calidad en BFP4 se aleja de BF16 (KL 0.03028 frente a 0.00078 en BFP8); para tareas sensibles a la precision conviene usar la variante BFP8.
- La evaluacion de calidad solo cubre ingles y coreano; el comportamiento en castellano no esta medido.
- No hay datos publicados de benchmarks de tareas, sesgos, tasas de alucinacion ni rendimiento en produccion.
- La ruta de ejecucion esta atada a versiones concretas de software (tt-metal v0.81.1, pjrt-plugin-tt 1.4.0); cambios de version pueden romper la compatibilidad de los pesos empaquetados.
- El autor es un particular (hletrd) y el modelo tiene 0 likes y 184 descargas, por lo que el soporte y el mantenimiento no estan garantizados.
- La model card no declara longitud de contexto ni idiomas soportados del modelo base, lo que limita la planificacion de cargas con prompts largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Cosmos3-Nano-Text-Tensix-BFP4
- Modelo base: https://huggingface.co/nvidia/Cosmos3-Nano
- Repositorio de codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Repositorio tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal
- Licencia OpenMDW-1.1 (copia en el repo del autor): https://huggingface.co/Xylolabs/Cosmos3-Nano-Tenstorrent-Tensix/blob/main/LICENSE
