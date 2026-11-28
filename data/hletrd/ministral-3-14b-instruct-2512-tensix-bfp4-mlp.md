# hletrd/Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP

## Resumen

Este repositorio contiene una cuantizacion del modelo Mistral AI `mistralai/Ministral-3-14B-Instruct-2512-BF16` (13.506.073.600 parametros) realizada por el usuario hletrd, orientada especificamente a las NPU Tensix de Tenstorrent (arquitecturas Wormhole y Blackhole). No se trata de un modelo nuevo, sino de un artefacto de despliegue: los pesos originales en BF16 se han reempaquetado en formatos de coma flotante por bloques (block floating point) `bfloat4_b` y `bfloat8_b` compatibles con tt-metal y ttnn, eliminando ademas la torre de vision y su proyector.

El modelo base es un transformer denso de la familia Ministral 3 (generacion 2512) con 13,5 mil millones de parametros, publicado originalmente en BF16 y con licencia Apache 2.0. La cuantizacion no modifica la arquitectura, sino la representacion numerica de las matrices de atencion y MLP, de modo que el modelo pueda ejecutarse sobre hardware Tensix con un coste de memoria significativamente menor.

La relevancia de esta ficha es practica: permite evaluar si esta variante cuantizada es adecuada para despliegues en aceleradores Tenstorrent, comparando la fidelidad respecto a BF16 (medida en divergencia KL) y el tamano empaquetado de cada carpeta. El repositorio incluye dos variantes (`text-bfp4/` y `text-bfp8/`) y scripts de empaquetado y verificacion (`pack_tensix.py`, `verify_grid.py`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Mistral Ministral 3, generacion 2512); cuantizado por bloques para NPU Tensix |
| Parametros totales | 13.506.073.600 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (MLP en bfloat4_b, atencion en bfloat8_b, resto bf16); BFP8 (atencion y MLP en bfloat8_b, resto bf16); referencia Q4_K_M de llama.cpp |
| Idiomas soportados | en, fr, es, de, it, pt, nl, zh, ja, ko, ar |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors con index (`model.safetensors.index.json`), mas `quant4.json` con metadatos de formato por capa |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `mistralai/Ministral-3-14B-Instruct-2512-BF16`: un transformer denso de 13,5 mil millones de parametros. El autor de esta variante no aporta informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO) del modelo original, por lo que esos datos deben consultarse en la model card de Mistral AI. La unica modificacion introducida aqui es la cuantizacion post-entrenamiento a formatos BFP para Tensix, con la torre de vision y su proyector eliminados del export.

La innovacion tecnica del repositorio es el uso de coma flotante por bloques (block floating point) nativo de Tensix: `bfloat4_b` para las matrices MLP y `bfloat8_b` para atencion en la variante BFP4, y `bfloat8_b` para atencion y MLP en la variante BFP8. El autor reporta la fidelidad de cada export frente a BF16 mediante divergencia KL media sobre 12.104 posiciones de texto ingles y coreano (WikiText-2 test y Wikipedia en coreano), en texto plano y con plantilla de chat: 0,01849 para BFP4, 0,00046 para BFP8 y 0,01473 para la referencia Q4_K_M de llama.cpp. El limite declarado es 1,5 veces la KL media de Q4_K_M. Se incluyen scripts `pack_tensix.py` y `verify_grid.py` para empaquetar matrices y verificar el round-trip de valores.

## Capacidades

- Generacion de texto conversacional y en formato instruct, heredada del modelo base Ministral 3 14B Instruct.
- Razonamiento y respuesta a instrucciones multi-turno mediante plantilla de chat (`apply_chat_template`).
- Capacidades multilingues declaradas para once idiomas: ingles, frances, espanol, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada para esta variante (depende del modelo base).
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada para esta variante.
- Vision: no soportada en este export, ya que la torre de vision y su proyector se han eliminado deliberadamente.
- Capacidades especiales (thinking mode, audio): no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en aceleradores Tenstorrent Wormhole o Blackhole: el modelo esta empaquetado en formatos BFP nativos de Tensix y se ejecuta mediante tt-metal v0.81.1 y tt-transformers con `--use_hf_rope`, lo que permite servir generacion de texto en hardware no GPU con 10,576 GB (BFP4) o 15,609 GB (BFP8) de pesos empaquetados.
- Evaluacion de fidelidad de cuantizacion: los valores de KL media permiten decidir entre BFP4 (0,01849) y BFP8 (0,00046) segun la tolerancia a la perdida de calidad frente a BF16, usando Q4_K_M (0,01473) como referencia.
- Generacion de texto multilingue en produccion: al cubrir once idiomas, puede emplearse en asistentes o resumenes para usuarios en espanol, frances, aleman, italiano, portugues, neerlandes, chino, japones, coreano y arabe, con la ventana de contexto que ofrezca el modelo base.
- Prototipado en entornos con memoria limitada: la variante BFP4 reduce el peso empaquetado a 10,576 GB frente a los 27,01 GB en BF16, lo que facilita pruebas en placas Tensix con DRAM ajustada.
- Validacion de pipelines de inferencia: los scripts `pack_tensix.py` y `verify_grid.py` permiten comprobar el empaquetado y el round-trip de matrices antes de integrar el modelo en un servicio, reduciendo el riesgo de errores numericos.
- Investigacion sobre cuantizacion BFP: sirve como caso de estudio reproducible para comparar BFP4 y BFP8 frente a Q4_K_M en terminos de KL, con el codigo de empaquetado disponible en GitHub.
- Integracion en pipelines de transformers: aunque el destino sea Tensix, el autor documenta carga con `AutoModelForCausalLM` y `AutoTokenizer` en bfloat16, lo que permite usarlo como referencia en CPU/GPU para comparaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta metricas de fidelidad de cuantizacion:

| Variante | Formato | Tamano empaquetado (GB) | KL media a BF16 |
|---|---|---|---|
| `text-bfp4/` | MLP bfloat4_b; atencion bfloat8_b; resto bf16 | 10,576 | 0,01849 |
| `text-bfp8/` | Atencion y MLP bfloat8_b; resto bf16 | 15,609 | 0,00046 |
| BF16 (base) | BF16 | 27,01 | 0 |
| Q4_K_M (llama.cpp) | Q4_K_M | 8,239 | 0,01473 |

La KL se mide sobre 12.104 posiciones de texto ingles y coreano (WikiText-2 test, Wikipedia en coreano), en texto plano y con plantilla de chat, con un limite de 1,5 veces la KL media de Q4_K_M.

## Requisitos de hardware

- VRAM/DRAM estimada: 10,576 GB de pesos empaquetados para BFP4 y 15,609 GB para BFP8; a ello hay que sumar cache KV y activaciones, cuyo tamano no se detalla en la informacion disponible.
- GPU: no aplica como destino principal; el modelo esta pensado para NPU Tensix de Tenstorrent (Wormhole, Blackhole). Para la carga de referencia en transformers se usa `dtype="bfloat16"` y `device_map="auto"`, sin cifras de VRAM publicadas.
- Consumer GPU: no disponible en la informacion proporcionada; el autor no documenta ejecucion en RTX 4090 ni similares.
- Opciones de despliegue: tt-metal v0.81.1 con tt-transformers y `--use_hf_rope`; scripts `pack_tensix.py` y `verify_grid.py`; carga de referencia con `transformers` (`AutoModelForCausalLM`). No se mencionan vLLM, llama.cpp, Ollama ni TGI para esta variante.
- Latencia y throughput: no disponible en la informacion proporcionada; solo se referencia un test de rendimiento `batch-1` en `simple_text_demo.py` sin cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / destino | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| hletrd/Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP (este) | 13,506 M | no disponible | BFP4/BFP8 para Tensix | apache-2.0 | Hugging Face (188 descargas) |
| mistralai/Ministral-3-14B-Instruct-2512-BF16 (base) | 13,506 M | no disponible | BF16 | apache-2.0 | Hugging Face |
| Q4_K_M de llama.cpp (referencia del autor) | 13,506 M | no disponible | Q4_K_M | apache-2.0 (heredada) | Referencia de cuantizacion |

No se dispone de datos de benchmarks de tareas para comparar el rendimiento frente a alternativas de la misma categoria; la comparacion disponible se limita a tamano empaquetado y KL frente a BF16.

## Limitaciones y advertencias

- Es una cuantizacion, no un modelo nuevo: hereda los sesgos y riesgos de alucinacion de `mistralai/Ministral-3-14B-Instruct-2512-BF16`, que no se documentan en esta ficha.
- La variante BFP4 presenta una KL media de 0,01849, superior a la referencia Q4_K_M (0,01473); puede degradar la calidad en tareas sensibles frente a BFP8 (0,00046) o BF16.
- La torre de vision y su proyector se han eliminado: el modelo no puede procesar imagenes.
- El destino principal es hardware Tensix (Wormhole, Blackhole) con tt-metal v0.81.1; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI en esta variante.
- La licencia es Apache 2.0, pero el repositorio base no incluye archivo LICENSE y el autor anade el texto estandar; la model card del modelo base restringe el uso que infrinja derechos de terceros, incluida propiedad intelectual.
- Los cambios respecto al modelo base se listan en `NOTICE`; conviene revisarlo antes de uso comercial.
- No se publican datos de contexto maximo, latencia ni throughput, lo que limita la planificacion de capacidad en produccion.
- El repositorio tiene 188 descargas y 0 likes en el momento de la consulta, lo que indica una validacion comunitaria escasa.

## Enlaces

- Hugging Face: https://huggingface.co/hletrd/Ministral-3-14B-Instruct-2512-Tensix-BFP4-MLP
- Modelo base: https://huggingface.co/mistralai/Ministral-3-14B-Instruct-2512-BF16
- Codigo de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- tt-metal (v0.81.1): https://github.com/tenstorrent/tt-metal
