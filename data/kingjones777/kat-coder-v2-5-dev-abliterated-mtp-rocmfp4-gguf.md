# kingjones777/KAT-Coder-V2.5-Dev-Abliterated-MTP-ROCmFP4-GGUF

## Resumen
KAT-Coder-V2.5-Dev-Abliterated-MTP-ROCmFP4-GGUF es una cuantizacion GGUF del checkpoint abliterado de KAT-Coder-V2.5-Dev, un modelo de codigo con arquitectura MoE de 35.505.251.456 parametros totales (variante 35B-A3B, es decir, aproximadamente 3.000 millones de parametros activos por token segun la nomenclatura del nombre). El modelo base original lo desarrolla Kwaipilot; el checkpoint abliterado (sin capas de rechazo) lo publica jakeroxs, y este repositorio de kingjones777 anade unicamente la escalera de cuantizacion ROCmFP4/ROCmFPX orientada a hardware AMD.

El interes tecnico del artefacto no esta en los pesos sino en el empaquetado: incluye un bloque de prediccion multi-token (MTP) funcional para decodificacion especulativa, emplea tipos de tensor ggml propios (100-119) que requieren un build de llama.cpp modificado (ROCmFPX), y ofrece un unico binario que alterna entre backend HIP/ROCm y Vulkan en tiempo de ejecucion mediante un flag `-dev`. Esta pensado especificamente para el Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, Strix Halo) con 128 GB de memoria unificada.

El modelo resuelve el problema de ejecutar un MoE de 35B con contexto de hasta 131.072 tokens en una APU de memoria unificada, a costa de un ecosistema de herramientas muy restringido: no carga en llama.cpp upstream ni en la mayoria de servidores de inferencia estandar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con bloque MTP (multi-token prediction) para decodificacion especulativa |
| Parametros totales | 35.505.251.456 |
| Parametros activos | no disponible (la nomenclatura del nombre indica variante A3B, sin cifra exacta confirmada) |
| Longitud de contexto | 131.072 tokens (flag `--context 131072` en el ejemplo de Super ROC) |
| Tipos de cuantizacion | Q4_0_ROCMFP4_COHERENT (ftype 102, 4,65 BPW), Q4_0_ROCMFP4_STRIX_LEAN (ftype 106, 4,39 BPW), Q6_0_ROCMFPX_AGENT (ftype 114, 7,58 BPW), Q6_0_ROCMFPX_LEAN (ftype 116, 6,61 BPW); bloque draft `blk.40` en Q8_0 en el fichero nuevo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (tipos de tensor ggml 100-119, requieren build ROCmFPX) |

## Arquitectura y entrenamiento
La arquitectura es un transformer de mezcla de expertos (MoE) con un bloque adicional de prediccion multi-token: los diez tensores `blk.40` constituyen los pesos de computo del draft que alimenta la decodificacion especulativa. El artefacto publicado es una cuantizacion, no un entrenamiento: la model card describe el proceso como `llama-quantize --output-tensor-type q6_K ... Q4_0_ROCMFP4_STRIX_LEAN 16`, sin imatrix (cuantizacion no ponderada), y en el fichero mas reciente los diez tensores del draft se injertaron en Q8_0 desde el fichero no abliterado tras verificar con una prueba de codigo mas cercano que la abliteracion no los habia modificado. Los otros 743 tensores son byte a byte identicos entre versiones.

No se dispone de informacion sobre el dataset de entrenamiento original, el numero de tokens, la composicion de datos ni las etapas de RLHF/DPO aplicadas por Kwaipilot. La innovacion tecnica destacable es el empaquetado: tipos de tensor ROCmFP4/ROCmFPX (IDs 100-119) que upstream llama.cpp rechaza porque su tabla de tipos termina en 43, y un binario dual HIP/Vulkan seleccionable en runtime. La model card reporta que MTP aporta un +6,5 % en Vulkan y un +8,9 % en ROCm en este hardware.

## Capacidades
- Generacion de codigo: el caso de uso central del modelo base, con mediciones especificas sobre seis prompts de codigo (107,3 tok/s de media, rango 102,4-111,0).
- Razonamiento y generacion de texto conversacional (pipeline `text-generation`, tag `conversational`).
- Tool calling / function calling: la model card reporta 7/7 llamadas correctas con `tool_choice` en modo `required` y 7/7 en modo `auto`.
- Decodificacion especulativa mediante bloque MTP integrado, con 927/1367 tokens draft aceptados en las pruebas de codigo.
- Modo thinking conmutables: el ejemplo de Super ROC usa `--think off`, lo que implica soporte de un modo de razonamiento explicito.
- Sin censura por construccion: el checkpoint es una version abliterated, con las capas de rechazo eliminadas.
- Capacidades multilingues: no disponible.
- Vision, audio u otras modalidades: no disponible.

## Casos de uso
- Asistencia de codigo en local sobre APU AMD: el modelo cabe en los 128 GB de memoria unificada del Ryzen AI Max+ 395 con el fichero STRIX_LEAN (17,88 GiB) y genera a 80,76 tok/s en la carga de trabajo de codigo sobre Vulkan, lo que permite un asistente tipo Copilot sin GPU dedicada.
- Pipelines de agente con tool calling: los 7/7 aciertos en `tool_choice` required y auto lo hacen apto para orquestacion de herramientas; conviene desactivar los flags de especulacion en bucles multi-turno, ya que la model card cifra el coste en un 31 % end-to-end.
- Procesamiento de repositorios largos: con 131.072 tokens de contexto y prefill de 478 tok/s en ROCm0 para prompts pesados, es viable indexar y consultar fragmentos amplios de codigo o documentacion tecnica en una sola pasada.
- RAG sobre base de codigo interna: el mismo perfil de prefill alto en backend ROCm favorece arranques en frio y prompts largos con contexto recuperado.
- Generacion de codigo por lotes en CI/CD: la decodificacion a 107,3 tok/s de media en prompts de codigo permite tareas de sintesis y refactorizacion automatizadas en un nodo unico sin GPU.
- Investigacion sobre abliteration y alineacion: al ser un checkpoint sin capas de rechazo, sirve para estudiar el efecto de la abliteracion en calidad (perplejidad 7,57917 identica antes y despues del injerto del draft) y en comportamiento.
- Evaluacion de decodificacion especulativa en hardware de memoria unificada: el par de backends y las cuatro cuantizaciones permiten medir el cruce de rendimiento entre Vulkan y ROCm por nivel de cuantizacion.

## Benchmarks y rendimiento
Mediciones de la model card sobre AMD Ryzen AI Max+ 395 (Radeon 8060S, gfx1151), 128 GB, ROCm 7.2.4, una peticion simultanea, temperatura 0 y cache de prompt en frio:

| Medicion | Resultado |
|---|---:|
| Procesamiento de prompt, 1566 tokens | 1713,1 tok/s |
| Generacion tras ese prompt (hasta 256 tokens) | 84,7 tok/s |
| Generacion de codigo, 6 prompts, hasta 256 tokens, media (rango) | 107,3 tok/s (102,4-111,0) |
| Tokens draft aceptados en esos prompts | 927/1367 |
| Tool calls correctas, `tool_choice` required / auto | 7/7 / 7/7 |
| Perplejidad, texto de evaluacion de formato largo, contexto 4096 | 7,57917 (identica antes y despues del injerto) |
| Perplejidad con build ROCmFPX de llama.cpp | 7,5845 |
| Ganancia de MTP en Vulkan | +6,5 % |
| Ganancia de MTP en ROCm | +8,9 % |
| Coste de especulacion en trabajo agentico multi-turno | -31 % end-to-end |
| Prefill de STRIX_LEAN en ROCm0 | 478 tok/s |
| Decodificacion de STRIX_LEAN en Vulkan, carga de codigo | 80,76 tok/s |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware
- VRAM/GTT estimada: 17,88 GiB para Q4_0_ROCMFP4_STRIX_LEAN, 18,93 GiB para Q4_0_ROCMFP4_COHERENT, 26,94 GiB para Q6_0_ROCMFPX_LEAN y 30,89 GiB para Q6_0_ROCMFPX_AGENT.
- Hardware de referencia: AMD Ryzen AI Max+ 395 con Radeon 8060S (gfx1151, Strix Halo) y 128 GB de memoria unificada. La model card senala que las dos variantes Q6 en ROCm consumen 7,2 GiB menos de GTT que en Vulkan.
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el artefacto esta construido y medido exclusivamente para gfx1151.
- Ajuste en GPU de consumo: los ficheros de 17,88-18,93 GiB no caben en GPUs consumer de 8-16 GB; encajan en tarjetas de 24 GB solo si el build ROCmFPX las soporta, extremo no documentado.
- Despliegue: llama.cpp con build ROCmFPX (https://github.com/charlie12345/ROCmFPX) compilado con ambos backends, o Super ROC (https://github.com/kingjones30/superroc). Un llama.cpp upstream falla con `invalid ggml type 101. should be in [0, 43)`.
- Flags de inferencia: `-dev Vulkan0` o `-dev ROCm0`, `-ngl 999`, `-fa on`, `-fit off`, `-np 1`, `--jinja`, y para uso de un solo turno `--spec-type draft-mtp --spec-draft-n-max 4 --spec-draft-p-min 0.0` (el valor por defecto de 0,75 limita el draft).
- Throughput: 1713,1 tok/s de prefill y 84,7 tok/s de generacion en el escenario de referencia; 478 tok/s de prefill con STRIX_LEAN en ROCm0.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato y hardware | Licencia |
|---|---|---|---|---|
| Este artefacto (KAT-Coder-V2.5-Dev-Abliterated-MTP-ROCmFP4) | 35.505.251.456 totales | 131.072 | GGUF ROCmFP4/ROCmFPX, gfx1151 | Apache 2.0 |
| Kwaipilot/KAT-Coder-V2.5-Dev (base) | 35.505.251.456 totales | no disponible | pesos originales, sin cuantizar para ROCmFP4 | no disponible |
| jakeroxs/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-GGUF | 35.505.251.456 totales | no disponible | GGUF estandar con MTP | no disponible |

No se dispone de datos de rendimiento de los modelos comparables ni de alternativas de otros desarrolladores en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias
- Dependencia de un fork: los tipos de tensor 100-119 no existen en llama.cpp upstream; sin el build ROCmFPX el modelo no carga en ningun backend.
- Ecosistema restringido: no hay soporte documentado para vLLM, TGI, Ollama ni llama.cpp estandar, lo que limita el despliegue en produccion convencional.
- Abliteration: la eliminacion de capas de rechazo implica ausencia de salvaguardas de contenido; inadecuado para aplicaciones orientadas al publico sin filtros externos.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; la unica metrica de calidad reportada es la perplejidad (7,57917), insuficiente para estimar fiabilidad factual.
- Idiomas: no se especifica que idiomas soporta ni su calidad fuera del ingles.
- Especulacion contraproducente en agentes: los flags MTP penalizan un 31 % el trabajo multi-turno; deben retirarse en esos flujos.
- Ficheros antiguos sin drafting: las cuantizaciones previas del repositorio llevan el bloque draft en 4 bits, que el build Super ROC rechaza al cargar; solo el fichero nuevo con `blk.40` en Q8_0 habilita la especulacion.
- ftype 105 no publicado: deja `output.weight` y los tensores `*_shexp` en 4 bits, lo que el autor considera inaceptable.
- Licencia Apache 2.0 declarada, pero la procedencia del checkpoint abliterado y las condiciones del modelo base no se detallan; conviene verificar antes de uso comercial.
- Mediciones de un solo hilo de peticion y temperatura 0: el throughput real en concurrencia no esta documentado.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/kingjones777/KAT-Coder-V2.5-Dev-Abliterated-MTP-ROCmFP4-GGUF
- Modelo base: https://huggingface.co/Kwaipilot/KAT-Coder-V2.5-Dev
- Checkpoint abliterado: https://huggingface.co/jakeroxs/KAT-Coder-V2.5-Dev-35B-A3B-MTP-ABLITERATED-GGUF
- Build ROCmFPX de llama.cpp: https://github.com/charlie12345/ROCmFPX
- Servidor Super ROC: https://github.com/kingjones30/superroc
