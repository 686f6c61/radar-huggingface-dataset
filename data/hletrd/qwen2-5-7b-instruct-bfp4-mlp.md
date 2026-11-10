# hletrd/Qwen2.5-7B-Instruct-BFP4-MLP

## Resumen

Qwen2.5-7B-Instruct-BFP4-MLP es una version cuantizada del modelo Qwen2.5-7B-Instruct de Alibaba Qwen, publicada por el usuario hletrd (Xylolabs) en Hugging Face. No se trata de un modelo nuevo ni de un fine-tune: es el mismo checkpoint base con los pesos redondeados a formatos de coma flotante por bloques (bfloat4_b y bfloat8_b), pensados para inferencia en NPUs que ejecutan estos formatos de forma nativa.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-7B-Instruct, con 7.615.616.512 parametros, y mantiene las capacidades conversacionales, de razonamiento, codigo y tool calling del original. La diferencia esta en el almacenamiento de pesos: las proyecciones de atencion se guardan en bfloat8_b (8,5 bits por peso) y las proyecciones MLP en bfloat4_b (4,5 bits por peso), con embedding, LM head, normas y sesgos en bf16. El resultado es una media de 6,58 bits por peso sobre todos los pesos leidos.

La relevancia de esta publicacion es acotada pero tecnica: sirve como referencia para quienes despliegan modelos en hardware con soporte de block-float (por ejemplo, aceleradores con formatos bfloat4_b/bfloat8_b empaquetados) y quieren comparar la fidelidad respecto al modelo bf16 frente a una cuantizacion convencional como Q4_K_M de llama.cpp. Los archivos se distribuyen como bf16 (15,2 GB), de modo que cargan en transformers como el modelo base, pero empaquetados en sus formatos ocupan 6,262 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | bfloat4_b (MLP gate, up, down) y bfloat8_b (attention q, k, v, o); bf16 en embedding, LM head, normas y sesgos; media de 6,58 bits por peso |
| Idiomas soportados | no disponible en la informacion proporcionada (la calibracion uso textos en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (valores bf16 sobre la rejilla block-float) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen2.5-7B-Instruct: un transformer decoder-only denso con 28 capas, atencion multi-cabeza con query/key/value y proyeccion de salida, y un bloque MLP con proyecciones gate, up y down. No hay mezcla de expertos ni mecanismos hibridos. La innovacion de esta publicacion no esta en la arquitectura sino en el proceso de cuantizacion.

El autor aplica GPTQ (Frantar et al., 2022) por proyeccion, ordenando los canales de entrada por la diagonal decreciente del Hessiano, con bloques de 128 columnas y un damping de 0,1 de la media diagonal. Para bfloat4_b y bfloat8_b, los bloques de una columna son sus grupos de 16 canales de salida, y el exponente de cada bloque se elige a partir de la columna actualizada tal como lo hara el empaquetador. En la busqueda de exponente se prueban el exponente del valor mayor y uno inferior (este ultimo recorta los valores grandes y reduce a la mitad el paso para el resto), conservando el de menor error. Todos los valores producidos son exactamente representables en el formato. La calibracion uso 65.536 tokens de WikiText-2 (train) y articulos de Wikipedia en coreano, ejecutados a traves del modelo bf16. No se menciona RLHF, DPO ni entrenamiento adicional: es una conversion post-entrenamiento del checkpoint base.

## Capacidades

- Generacion de texto conversacional multi-turno, heredada de Qwen2.5-7B-Instruct.
- Razonamiento y matematicas de nivel medio, con modo thinking activable (el autor evalua prompts con thinking on y off).
- Generacion de codigo y soporte de tool calling / function calling del modelo base.
- Capacidades de agente y razonamiento multi-paso del modelo original.
- Capacidades multilingues del modelo base (la calibracion incluyo ingles y coreano, pero no se documenta la lista completa de idiomas).
- Ejecucion en NPUs con soporte nativo de block-float bfloat4_b/bfloat8_b, sin redondeo adicional al empaquetar.
- Carga directa en transformers como el modelo base, ya que los tensores se almacenan como bf16.

## Casos de uso

- Despliegue en NPUs con formatos block-float: el modelo esta pensado para hardware que empaqueta bfloat4_b y bfloat8_b de forma nativa; el dispositivo empaqueta los pesos sin redondeo adicional y se obtiene el mismo resultado que el modelo redondeado.
- Evaluacion de fidelidad de cuantizacion: util para comparar la degradacion respecto a bf16 (KL media 0,0470, acuerdo top-1 del 90,46 %) frente a alternativas como Q4_K_M de llama.cpp.
- Asistente conversacional en dispositivos con recursos limitados: al ocupar 6,262 GB empaquetado, permite servir un modelo de 7B en entornos donde bf16 (unos 15 GB) no cabe.
- Prototipado de pipelines de inferencia en transformers: el checkpoint carga con `AutoModelForCausalLM.from_pretrained` en bfloat16 y `device_map="auto"`, sin cambios en el codigo respecto al modelo base.
- Investigacion en tecnicas de cuantizacion post-entrenamiento: el repositorio documenta el proceso GPTQ, la busqueda de exponentes y la calibracion, lo que facilita reproducir o comparar metodologias.
- Integracion en servicios de generacion de texto con TGI: las etiquetas incluyen `text-generation-inference` y `endpoints_compatible`, lo que permite desplegarlo en infraestructura compatible con Hugging Face endpoints.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor publica metricas de fidelidad respecto al modelo bf16:

| Metrica | Este modelo | Q4_K_M (llama.cpp) |
|---|---:|---:|
| Bits por peso | 6,58 | 4,91 |
| KL media a bf16 | 0,0470 | 0,0369 |
| Acuerdo top-1 (%) | 90,46 | 91,25 |
| Respuestas perdidas (de 33 + 7) | 0 | 1 |

La KL media se calcula sobre todo el vocabulario en cada posicion evaluada (16.104 posiciones) de cuatro textos: ingles y coreano, cada uno como texto plano y como respuesta de un turno de chat en la plantilla del modelo, con thinking desactivado. El acuerdo top-1 mide la frecuencia con la que el siguiente token mas probable coincide con el de bf16. Las respuestas perdidas corresponden a 33 prompts de respuesta corta con thinking desactivado y 7 con thinking activado; en este modelo los 7 prompts con thinking no se ejecutaron y el recuento es sobre los 33. El autor fija como criterio una KL media de como maximo 1,5 veces la de Q4_K_M y como maximo una respuesta perdida mas; este modelo lo cumple (1,27 veces la KL media de Q4_K_M). Estas cifras miden cercania al modelo bf16 en los textos del autor, no rendimiento en tareas.

## Requisitos de hardware

- VRAM estimada en bf16 (formato de los archivos): aproximadamente 15,2 GB para los pesos, mas overhead de activaciones y cache KV; en la practica, 16-18 GB para contexto corto.
- VRAM estimada empaquetado en block-float: 6,262 GB de pesos, siempre que el dispositivo soporte los formatos de forma nativa.
- GPU recomendadas: no se especifican en la informacion disponible. Para cargar los archivos bf16 se necesita al menos una GPU de 24 GB (RTX 3090/4090, A10, L4) o una A100/H100 para mayor throughput.
- Cabe en GPU consumer: si, en tarjetas de 24 GB o mas cargando los pesos bf16; en el formato empaquetado depende del soporte del acelerador.
- Opciones de despliegue: transformers (documentado por el autor), text-generation-inference (etiqueta `text-generation-inference`), y endpoints compatibles. No se menciona soporte de llama.cpp, Ollama ni vLLM para estos formatos.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato / cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen2.5-7B-Instruct-BFP4-MLP (este) | 7,6 B | no disponible | bfloat4_b/bfloat8_b, media 6,58 bits | Apache 2.0 | Hugging Face |
| Qwen/Qwen2.5-7B-Instruct (base) | 7,6 B | no disponible | bf16 | Apache 2.0 | Hugging Face |
| Q4_K_M de Qwen2.5-7B-Instruct (llama.cpp) | 7,6 B | no disponible | GGUF Q4_K_M, 4,91 bits | Apache 2.0 | Generado con llama-quantize |

La comparativa se limita al modelo base y a la cuantizacion Q4_K_M usada como referencia por el autor, ya que no se aportan datos de otros modelos comparables. En fidelidad a bf16, Q4_K_M obtiene menor KL media (0,0369 frente a 0,0470) y mayor acuerdo top-1 (91,25 % frente a 90,46 %), aunque este modelo no pierde respuestas en los 33 prompts evaluados frente a una perdida de Q4_K_M.

## Limitaciones y advertencias

- No es un modelo nuevo: cualquier sesgo, alucinacion o limitacion de Qwen2.5-7B-Instruct se hereda sin cambios.
- La cuantizacion introduce degradacion: KL media de 0,0470 respecto a bf16 y acuerdo top-1 del 90,46 %, inferior a Q4_K_M en ambas metricas.
- El checkpoint almacena los pesos como bf16 (15,2 GB), por lo que no ahorra memoria al cargarlo en transformers; el ahorro solo se materializa en hardware que empaqueta block-float de forma nativa.
- No se documentan los idiomas soportados ni la longitud de contexto en la informacion proporcionada; conviene consultar la model card del modelo base.
- El rendimiento en tareas reales (razonamiento, codigo, matematicas) no se ha medido en esta publicacion; las metricas publicadas son de fidelidad, no de calidad.
- Licencia Apache 2.0 heredada del modelo base, que permite uso comercial; el autor distribuye el modelo "as is", sin garantia de ningun tipo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de la comunidad.
- No se especifican requisitos de hardware ni soporte en frameworks de inferencia distintos de transformers y TGI.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/hletrd/Qwen2.5-7B-Instruct-BFP4-MLP
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Paper de GPTQ (Frantar et al., 2022): no disponible en la informacion proporcionada
- Blog o repositorio de Xylolabs: no disponible en la informacion proporcionada
- Demo: no disponible en la informacion proporcionada
