# hletrd/gemma-4-26B-A4B-it-Tensix-BFP4

## Resumen

`hletrd/gemma-4-26B-A4B-it-Tensix-BFP4` es una cuantizacion de tipo block floating point de 4 bits (BFP4) del modelo multimodal `google/gemma-4-26B-A4B-it`, publicada por el usuario hletrd a partir de la herramienta `tensix-bfp-gptq` de Xylolabs. El objetivo no es otro que permitir la ejecucion del modelo Gemma 4 de 26B parametros totales sobre las NPU Tensix de Tenstorrent (Wormhole y Blackhole), que carecen de soporte nativo para pesos bf16 a gran escala y si disponen de un formato `ttnn.bfloat4_b` empaquetado en hardware.

El modelo conserva la arquitectura MoE del original (26.544.133.710 parametros totales, de los que aproximadamente 4B estarian activos por token segun la nomenclatura A4B) y mantiene intactas las capacidades multimodales imagen-texto, ya que el tower de vision y el proyector se conservan en bf16. Solo el modelo de lenguaje ha sido redondeado, con GPTQ y busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano.

Su relevancia es doble: por un lado demuestra que un modelo de 26B puede comprimirse a 15,27 GB empaquetados (4,84 bits por peso de media) con una perdida de calidad moderada (KL media de 0,1475 frente a bf16 y top-1 del 87,45 %), y por otro es una de las primeras piezas publicas que permite llevar Gemma 4 a aceleradores Tensix. Las pruebas se han realizado sobre `ttsim`, el simulador de Blackhole, no sobre silicio real, lo que conviene tener en cuenta antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (Gemma 4), pesos lineales en block floating point BFP4 |
| Parametros totales | 26.544.133.710 |
| Parametros activos | no disponible (la nomenclatura A4B sugiere ~4B activos) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`ttnn.bfloat4_b`, 4,5 bits por peso); media de 4,84 bits por peso; bf16 en router, embeddings, normas y vision |
| Idiomas soportados | no disponible (calibracion en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16 en disco, valores ya sobre la rejilla BFP4) |

## Arquitectura y entrenamiento

El modelo base es un transformer de tipo mezcla de expertos (MoE) con capacidad de entrada imagen-texto, disenado por Google. Esta version no altera la topologia: mantiene las 30 capas con atencion (q, k, v, o), MLP densa compartida y expertos enrutados, ademas del tower de vision y el proyector `embed_vision` en bf16 sin tocar. La unica modificacion es el redondeo de las proyecciones lineales del modelo de lenguaje al formato `bfloat4_b` de TT-NN, que emplea un exponente compartido por bloque y mantiene la mantisa en 4 bits.

El proceso de cuantizacion es GPTQ con busqueda de exponente por bloque, calibrado sobre 65.536 tokens de WikiText-2 y Wikipedia en coreano. Los expertos enrutados comparten una unica matriz Hessiana por capa para las proyecciones gate y up, mientras que cada experto calcula su propia Hessiana para down, o se redondea al vecino mas cercano si ha visto pocos tokens de calibracion. El resultado son 15,27 GB empaquetados con 4,84 bits por peso de media; el fichero `quant4.json` documenta el formato de cada proyeccion. Los pesos se almacenan en bf16 pero ya alineados a la rejilla BFP4, de modo que TT-NN los empaqueta sin redondear de nuevo; el autor verifica esta propiedad con `pack_tensix.py` y `verify_grid.py`.

## Capacidades

- Generacion de texto conversacional con plantilla de chat (`apply_chat_template`), tal como se muestra en el quickstart.
- Razonamiento y respuesta a preguntas de conocimiento general (evaluado sobre 33 preguntas, con 33 aciertos).
- Entrada multimodal imagen-texto: el pipeline declarado es `image-text-to-text` y el tower de vision se conserva en bf16.
- Capacidad multilingue limitada a lo declarado: calibracion en ingles y coreano, sin lista oficial de idiomas.
- No se documenta soporte explicito de tool calling ni de function calling en la informacion disponible.
- No se documenta modo thinking, audio ni otras capacidades especiales.
- El modelo esta pensado para ejecutarse en transformers (bf16) o en NPU Tensix via TT-NN/tt-metal; no se menciona integracion con vLLM, llama.cpp u otros servidores.

## Casos de uso

- Despliegue en hardware Tenstorrent: el caso principal es ejecutar Gemma 4 26B-A4B en Wormhole o Blackhole sin necesidad de GPUs, aprovechando el empaquetado nativo `bfloat4_b` y el reduce de memoria a 15,27 GB.
- Investigacion en cuantizacion de bajo bit: sirve como referencia reproducible de GPTQ con busqueda de exponente por bloque sobre un MoE multimodal, con scripts de verificacion (`pack_tensix.py`, `verify_grid.py`) para validar la rejilla.
- Prototipado multimodal en entornos con memoria limitada: al conservar el tower de vision en bf16 y reducir el LM a ~15 GB, permite probar tareas imagen-texto en una unica NPU o en GPUs con 24 GB usando transformers.
- Evaluacion comparativa de calidad de cuantizacion: util para medir la degradacion frente a bf16 (KL 0,1475, top-1 87,45 %) y frente a Q4_K_M de llama.cpp en pipelines de investigacion.
- Base para fine-tuning ligero o adaptadores sobre el modelo cuantizado, siempre que se respete la rejilla BFP4 y se valide el empaquetado en TT-NN.
- Integracion en demos de tt-metal: el propio autor documenta como engancharlo al demo de Gemma 4 de tt-metal v0.81.1 mediante `precision_overrides.json`, lo que facilita su uso en presentaciones y pruebas de concepto sobre QuietBox 2, LoudBox o Wormhole T3K.

## Benchmarks y rendimiento

Los datos publicados por el autor comparan la cuantizacion con el modelo base en bf16 y con Q4_K_M de llama.cpp, sobre 8.048 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano):

| Modelo | Bits por peso | Tamano (GB) | KL media vs bf16 | Top-1 (%) | Respuestas correctas | Perdidas |
|---|---:|---:|---:|---:|---:|---:|
| BF16 (google/gemma-4-26B-A4B-it) | 16 | 50,47 | 0 | 100 | 33 de 33 | - |
| Este modelo (BFP4) | 4,84 | 15,271 | 0,1475 | 87,45 | 33 de 33 | 0 |
| Q4_K_M (llama.cpp) | 5,32 | 16,796 | 0,1249 | 88,16 | 33 de 33 | 0 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. La evaluacion se limita a divergencia KL y top-1 frente a bf16, ademas de un conjunto reducido de 33 preguntas.

## Requisitos de hardware

- VRAM estimada en bf16 (transformers): en torno a 50 GB de pesos mas activaciones; el repo ocupa 53,1 GB.
- VRAM estimada empaquetado en TT-NN: 15,27 GB de pesos en BFP4, mas buffers de trabajo.
- GPU recomendadas para uso con transformers: A100 80 GB o H100 para bf16 comodo; en consumer, posible con cuantizacion adicional fuera del alcance de este repo.
- NPU objetivo: Tensix de Tenstorrent (Wormhole, Blackhole). El demo oficial de tt-metal para Gemma 4 26B-A4B requiere cuatro u ocho chips Blackhole (QuietBox 2, LoudBox) o un Wormhole T3K en paralelo de tensores; no cabe en un solo chip.
- Despliegue: transformers (`AutoModelForCausalLM`), TT-NN 0.81.1 (probado en `ttsim`, simulador de Blackhole, no en hardware), tt-metal demo de Gemma 4 v0.81.1 y tt-forge/tt-xla (no probado con Gemma 4).
- Latencia y throughput: no disponibles; no se han medido sobre silicio real.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Calidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (BFP4 Tensix) | 26,5B totales | no disponible | KL 0,1475; top-1 87,45 % | Apache 2.0 | Hugging Face, 0 descargas |
| google/gemma-4-26B-A4B-it (bf16) | 26,5B totales | no disponible | Referencia (KL 0; top-1 100 %) | Apache 2.0 | Hugging Face |
| Q4_K_M de llama.cpp | 26,5B totales | no disponible | KL 0,1249; top-1 88,16 % | Apache 2.0 (derivado) | Hugging Face |

La comparativa se limita a variantes del mismo modelo base porque no se dispone de datos de modelos alternativos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Solo se ha cuantizado y evaluado el modelo de lenguaje; el tower de vision no ha sido evaluado tras la cuantizacion.
- Las pruebas en TT-NN se han hecho sobre `ttsim` (simulador de Blackhole), no sobre hardware real; el reparto multi-chip del demo de tt-metal no se ha ejecutado.
- tt-transformers no soporta Gemma 4; el demo oficial de tt-metal no tiene opcion `bfloat4_b`, por lo que sin la entrada en `precision_overrides.json` cargara todo en bf16, que es exacto pero no aprovecha la compresion.
- tt-forge (tt-xla) no se ha probado con Gemma 4; su opcion `bfp_bf4` re-redondea los pesos con otra rejilla de bloques, lo que puede alterar los valores.
- Perdida de calidad medible: KL media de 0,1475 y top-1 del 87,45 % frente a bf16, ligeramente peor que Q4_K_M en KL (0,1249) aunque con menor tamano.
- La evaluacion se limita a 8.048 posiciones de ingles y coreano y a 33 preguntas; no hay cobertura de otros idiomas ni de tareas de codigo o matematicas.
- No se documentan sesgos, riesgos de alucinacion especificos ni restricciones adicionales de la licencia Apache 2.0 mas alla de las habituales.
- El repo tiene 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/gemma-4-26B-A4B-it-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Codigo de cuantizacion (tensix-bfp-gptq): https://github.com/XylolabsInc/tensix-bfp-gptq
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Demo de Gemma 4 en tt-metal v0.81.1: https://github.com/tenstorrent/tt-metal/tree/v0.81.1/models/demos/gemma4
- Paper de referencia citado en los tags: arxiv:2607.02770 (no verificado en la informacion disponible)
