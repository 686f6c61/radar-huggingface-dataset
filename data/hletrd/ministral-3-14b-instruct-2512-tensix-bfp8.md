# hletrd/Ministral-3-14B-Instruct-2512-Tensix-BFP8

## Resumen

Ministral-3-14B-Instruct-2512-Tensix-BFP8 es una cuantizacion del modelo de texto Ministral-3-14B-Instruct-2512-BF16 de Mistral AI, publicada por el usuario hletrd y generada con las herramientas de Xylolabs (repositorio tensix-bfp-gptq). El checkpoint adapta el modelo base para ejecutarse sobre las NPU Tensix de Tenstorrent (Wormhole y Blackhole) mediante el formato de coma flotante por bloques `ttnn.bfloat8_b` (BFP8), de modo que los pesos se empaquetan directamente en la rejilla BFP8 sin re-redondeo adicional por parte de TT-NN.

El modelo base es un transformer causal de aproximadamente 13.500 millones de parametros (13.506.073.600 segun los safetensors), orientado a generacion de texto conversacional e instrucciones, con soporte declarado para once idiomas. Esta variante conserva unicamente la torre de texto: la torre de vision y su proyector se han eliminado, y el `config.json` corresponde al `text_config` del modelo base expuesto como `Ministral3ForCausalLM`.

La relevancia de esta ficha es doble. Por un lado, documenta un caso concreto de cuantizacion orientada a hardware especifico (NPU Tensix) en lugar de a GPU, con un formato hibrido de 9,25 bits por peso de media y 15,61 GB empaquetados. Por otro, conviene subrayar que la validacion reportada por el autor se realizo sobre `ttsim`, el simulador de Blackhole de Tenstorrent, y no sobre hardware fisico, lo que limita las garantias de rendimiento en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal decoder-only (Ministral 3, clase `Ministral3ForCausalLM`); capas lineales cuantizadas a BFP8 |
| Parametros totales | 13.506.073.600 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (la model card menciona escalado de query para posiciones mas alla de 16.384, no implementado en tt-transformers) |
| Tipos de cuantizacion | BFP8 (`bfloat8_b`, 8,5 bits por peso) en q, k, v, o y gate, up, down de las 40 capas; bf16 en LM head, embeddings, normas y resto de tensores; 9,25 bits por peso de media |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores bf16 ya situados en la rejilla BFP8, listos para empaquetado TT-NN); incluye `quant4.json` y `model.safetensors.index.json` |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 40 capas perteneciente a la familia Ministral 3 de Mistral AI. Esta publicacion no entrena el modelo: parte del checkpoint BF16 de Mistral AI y aplica GPTQ para redondear las proyecciones lineales de atencion (q, k, v, o) y de la MLP (gate, up, down) a la rejilla `ttnn.bfloat8_b`, un formato de coma flotante por bloques en el que cada bloque comparte exponente. El calibrado de GPTQ se realizo sobre 65.536 tokens de WikiText-2 y de Wikipedia en coreano. Los tensores se almacenan en bf16 pero con todos sus valores ya alineados a la rejilla BFP8, de forma que el empaquetador de TT-NN no vuelve a redondear.

La innovacion tecnica principal no esta en la arquitectura del modelo sino en el pipeline de cuantizacion y despliegue: el checkpoint esta pensado para las NPU Tensix de Tenstorrent mediante tt-metal, ttnn y tt-forge. El autor documenta utilidades de verificacion (`pack_tensix.py`, `verify_grid.py`) que comprueban que ningun valor cambia al empaquetar cada matriz, y reporta pruebas con ttnn 0.81.1 sobre el simulador `ttsim`. En tt-transformers (tt-metal v0.81.1) se requiere `--use_hf_rope`; con esa configuracion, todas las proyecciones de las dos primeras capas se empaquetaron de forma exacta y un prefill de dos capas coincidio con transformers con PCC 0.9989. No se detallan en la informacion disponible los datos de preentrenamiento del modelo base (numero de tokens, composicion del dataset) ni si hubo RLHF o DPO.

## Capacidades

- Generacion de texto conversacional e instrucciones en formato chat, con plantilla aplicable mediante `apply_chat_template`.
- Razonamiento y respuesta a preguntas generales heredados del modelo base Ministral 3 14B Instruct.
- Capacidades multilingues declaradas para once idiomas: ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe.
- Generacion de codigo y matematicas: no disponible de forma explicita en la informacion proporcionada; depende de las capacidades del modelo base.
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Vision: no soportada en este checkpoint (la torre de vision y su proyector se han eliminado; es un modelo solo de texto).
- Modo thinking: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en NPU Tensix: el caso de uso principal es ejecutar inferencia de un modelo de 14B sobre aceleradores Wormhole o Blackhole de Tenstorrent, aprovechando que los pesos ya estan alineados a la rejilla BFP8 y se empaquetan sin redondeo adicional en TT-NN.
- Evaluacion de precision de cuantizacion: util para investigar la perdida de calidad de BFP8 frente a BF16 en un transformer de 14B, comparando la divergencia KL y el top-1 reportados en la seccion de evaluacion de la model card.
- Servicio de chat multilingue en ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe, con una sola instancia del modelo.
- Prototipado en simulacion: validar pipelines de tt-metal y tt-transformers sobre `ttsim` antes de disponer de hardware Blackhole, usando este checkpoint como carga de trabajo realista.
- Generacion de texto por lotes en entornos con restricciones de memoria: los 15,61 GB empaquetados y los 9,25 bits por peso de media reducen la huella frente al BF16 del modelo base.
- Integracion en pipelines de transformers: al cargarse con `AutoModelForCausalLM` en bf16, puede usarse como sustituto del modelo base en flujos existentes, con la salvedad de que los pesos ya estan cuantizados.

## Benchmarks y rendimiento

La model card incluye una seccion de evaluacion con una tabla de la que solo se conserva el encabezado en la informacion disponible (columnas: bits por peso, tamano en GB, KL medio frente a BF16, top-1 y respuestas). No se han podido recuperar los valores numericos de esa tabla, por lo que no se presentan cifras de benchmarks.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint ocupa 27,0 GB en el repositorio y 15,61 GB empaquetados en BFP8; al cargarse en transformers con `dtype="bfloat16"` la huella en memoria se aproxima a la de un modelo de 13,5B en bf16 (del orden de 27 GB de pesos mas cache de activaciones y KV).
- GPU recomendadas para la ruta transformers: no especificadas en la informacion disponible; por tamano, requiere GPU con al menos 24-32 GB de memoria para bf16, o menos si se aplica cuantizacion adicional.
- Hardware objetivo: NPU Tensix de Tenstorrent (Wormhole y Blackhole), mediante tt-metal, ttnn y tt-forge.
- Cabe en GPU consumer: no confirmado en la informacion disponible; con 13,5B parametros en bf16 no cabe en GPU de 8-16 GB sin cuantizacion adicional.
- Opciones de despliegue: transformers (`AutoModelForCausalLM`), tt-transformers (tt-metal v0.81.1, con `--use_hf_rope`), tt-forge (tt-xla, aun no probado con este checkpoint), y ttnn directamente para empaquetado de matrices. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Las pruebas se realizaron sobre el simulador `ttsim`, no sobre hardware fisico, por lo que no hay cifras reales de rendimiento.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ministral-3-14B-Instruct-2512-Tensix-BFP8 (este) | 13,5B | no disponible | BFP8 (9,25 bits/peso) | Apache 2.0 | Hugging Face, orientado a NPU Tensix |
| mistralai/Ministral-3-14B-Instruct-2512-BF16 | 13,5B | no disponible | BF16 | Apache 2.0 | Hugging Face, modelo base |
| Otros modelos de ~14B de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita al modelo base porque la informacion proporcionada no incluye datos de rendimiento ni especificaciones de alternativas equivalentes.

## Limitaciones y advertencias

- Solo texto: la torre de vision y su proyector se han eliminado, por lo que no admite entradas de imagen.
- Validacion en simulador: las pruebas de ejecucion en Tensix se hicieron con ttnn 0.81.1 sobre `ttsim` (simulador de Blackhole) y no sobre hardware fisico, segun indica el propio autor.
- Restricciones en tt-transformers: es obligatorio `--use_hf_rope`; sin esa opcion el demo permuta las filas de q y k y vuelve a redondear el QKV fusionado. Ademas, el demo empaqueta la cabeza en bfloat8_b, por lo que la cabeza bf16 de este checkpoint no es exacta en ese entorno.
- Escalado de posiciones: tt-transformers no implementa el escalado de query de Ministral 3 para posiciones mas alla de 16.384, lo que puede degradar la calidad en contextos muy largos en esa ruta.
- tt-forge: no se ha ejecutado con este checkpoint; por defecto mantiene los pesos en bf16 (exacto), y sus opciones `bfp_bf8` y `bfp_bf4` empaquetan el layout [out, in] de PyTorch y vuelven a redondear los valores.
- Riesgo de alucinacion y sesgos: no documentados en la informacion proporcionada; son los heredados del modelo base de Mistral AI.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base y de las herramientas de Xylolabs y Tenstorrent empleadas.
- Madurez: checkpoint con 0 descargas y 0 likes en el momento de la consulta, publicado el 11 de noviembre de 2026, sin evidencia de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Ministral-3-14B-Instruct-2512-Tensix-BFP8
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (rama v0.81.1): https://github.com/tenstorrent/tt-metal
- Licencia del checkpoint: https://huggingface.co/hletrd/Ministral-3-14B-Instruct-2512-Tensix-BFP8/blob/main/LICENSE
