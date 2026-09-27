# MercanAI/rmala-gla-100m-3b

## Resumen

rmala-gla-100m-3b es un checkpoint de investigacion de un modelo de lenguaje base en turco, desarrollado por MercanAI y publicado tambien por Ethosoft como espejo. Se trata de un modelo causal entrenado desde cero sobre exactamente 3.000 millones de tokens objetivo, con 100.465.280 parametros (aproximadamente 100M). La variante concreta de este checkpoint es "gla", correspondiente a una arquitectura de atencion lineal gated (Gated Linear Attention). No es un modelo ajustado por instrucciones ni de chat: es un base model puro.

El modelo forma parte de una familia de cinco variantes (gla, v14_full, v14_half, full y hola) que comparten tokenizador, orden de tokens y conjuntos de validacion/test disjuntos. Todas se entrenaron con la misma semilla (41001), lo que permite comparativas controladas entre backbones. Su contexto maximo es de 2048 tokens y el vocabulario esta limitado a turco.

Su relevancia actual radica en que es un banco de pruebas abierto para estudiar variantes de atencion lineal y esquemas de memoria gated en modelos pequenos, con metricas de perplexity y bits-per-byte publicadas por variante. No incluye resultados de benchmarks de tareas (MMLU, HumanEval, etc.), y el propio autor advierte que no se reclama ningun nivel de produccion ni de "harmlessness". El checkpoint es pequeno (0,4 GB de repo) y esta pensado para experimentacion, no para despliegue directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con backbone de atencion lineal Gated Linear Attention (variante gla); la familia incluye tambien full attention, V14-LM adaptada y HoLA (GatedDeltaNet) |
| Parametros totales | 100.465.280 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible; el checkpoint se distribuye en FP32 y el modo de computo probado usa autocast BF16 con TF32 desactivado |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible (el autor no asigna nueva licencia en esta subida; consultar THIRD_PARTY_NOTICES.md) |
| Formato de pesos | safetensors (no registrado en Transformers AutoModel; requiere loader propio) |

## Arquitectura y entrenamiento

El modelo tiene 16 capas, anchura 640 y embeddings de entrada/salida atados de 32K entradas, con RMSNorm y SwiGLU. La variante "gla" usa atencion lineal Gated Linear Attention con 10 cabezas de tamano 64. Para comparar, la variante "full" emplea atencion causal estandar con SDPA y RoPE; la variante "hola" usa 5 cabezas de tamano 128, cache beta oficial, ventana 64 y chunk de 256. V14-LM es una adaptacion del gate sintetico V14 que utiliza claves contextuales, valores int8, presupuesto de banco por cabeza de 2048 bytes y limites de admision de lectura/escritura del 5%; el gate straight-through aprendido aplica un umbral duro de 0,99 en forward, con alfa de memoria aceptada de 1 o 0,5.

El entrenamiento se hizo desde cero sobre un subconjunto fijo de 3.000 millones de tokens de la coleccion pretokenizada MercanSet V11 / MercanPretraining, con validacion y test disjuntos por shard. No se realizo deduplicacion cruzada entre colecciones, por lo que el autor no reclama ausencia absoluta de contaminacion. No se menciona RLHF ni DPO: es un base model sin ajuste de instrucciones. El coste de entrenamiento se reporta como estimacion algoritmica de FLOPs (no medicion completa de hardware). El autor advierte que la mejora de V14-half sobre GLA es pequena y no establece superioridad robusta, y que V14-full no mejoro la PPL de test.

## Capacidades

- Generacion de texto causal autoregresiva en turco: el modelo es un base model, por lo que su funcion principal es modelar y completar texto, no seguir instrucciones.
- Continuacion de texto y modelado de lenguaje: adecuado para tareas de perplexity y evaluacion de backbones.
- Razonamiento y matematicas: no se declaran capacidades especificas ni resultados que las respalden.
- Generacion de codigo: no se declara ni se evalua.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor indica que los diagnosticos de recuperacion/razonamiento de largo alcance no se incluyen como resultados completos en esta entrega.
- Capacidades multilingues: limitadas al turco (idioma declarado).
- Capacidades especiales: no hay modo "thinking", vision ni audio. La unica particularidad tecnica es el uso de variantes de atencion lineal gated (GLA/V14) y memoria gated (HoLA) como sujetos de estudio.

## Casos de uso

- Investigacion sobre atencion lineal: el modelo permite comparar GLA frente a full attention y HoLA bajo condiciones controladas (mismo tokenizador, mismos tokens, misma semilla) para estudiar el impacto en perplexity.
- Ablaciones de memoria gated: el esquema V14-LM con banco de 2048 bytes por cabeza y umbral de gate fijo a 0,99 sirve para evaluar tecnicas de memoria con presupuesto acotado en modelos pequenos.
- Estudio de eficiencia de decodificacion: al ser un modelo de 100M con contexto de 2048, es util para medir latencias y compilar kernels Triton sin necesidad de hardware grande.
- Punto de partida para fine-tuning en turco: al ser un base model de ~100M, puede servir como inicializacion para tareas especificas de PLN en turco antes de escalar a modelos mayores.
- Docencia y prototipado: su tamano (0,4 GB de repositorio) permite experimentar con el pipeline completo de entrenamiento e inferencia en una sola GPU.
- Evaluacion de loader propio frente a transformers: dado que no esta registrado en AutoModel, sirve para probar integraciones alternativas y decodificacion con prefijo recomputado.

## Benchmarks y rendimiento

El model-index oficial no incluye resultados de tareas (`results: []`). El autor solo publica metricas de modelado del lenguaje por variante (PPL de test y BPB de test) sobre un conjunto de test de 11.352.596 tokens (39.843.759 bytes UTF-8 originales), con evaluacion por documentos completos en chunks de 2048 tokens. Menor es mejor.

| Variante | Test PPL | Test BPB | FLOPs algoritmicos estimados de entrenamiento |
|---|---:|---:|---:|
| gla (este checkpoint) | 25,561380 | 1,321054 | 1,866978e+18 |
| v14_full | 25,591686 | 1,321246 | 1,886712e+18 |
| v14_half | 25,482146 | 1,319796 | 1,886712e+18 |
| full | 22,187501 | 1,262025 | 2,173686e+18 |
| hola | 20,419358 | 1,228817 | 1,963008e+18 |

Notas del autor: la PPL incluye EOS terminal; la BPB usa NLL de contenido dividida por el numero de bytes UTF-8 y excluye el EOS terminal. Los FLOPs son estimaciones algoritmicas, no mediciones completas de hardware. No hay resultados de MMLU, HumanEval, GSM8K ni similares. La variante reportada aqui (gla) queda por detras de full y hola en PPL/BPB de test dentro de la propia familia.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32, aproximadamente 0,4 GB; en BF16, en torno a 0,2 GB. Cabe comodamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU NVIDIA con CUDA y soporte de Triton. Cabe en RTX 3060, RTX 4090, A100, H100; el hardware objetivo del autor es Linux NVIDIA CUDA.
- Compatibilidad consumer: si, cabe en GPU consumer de gama baja e incluso en iGPU/CPU para pruebas basicas (aunque el pipeline probado requiere Linux NVIDIA CUDA).
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni transformers AutoModel. El autor proporciona `inference.py` y `requirements.txt` propios; la primera ejecucion compila kernels Triton.
- Latencia y throughput: no disponibles. El decoder de referencia recomputa el prefijo completo en cada paso y no es un decoder optimizado con KV-cache, por lo que la latencia en generacion larga es alta y no representativa de un sistema optimizado.
- Tokenizador: binario nativo para Linux x86_64 / CPython 3.11+.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables proporcionados en la informacion. La unica comparativa disponible es interna a la familia rmala (variantes gla, v14_full, v14_half, full y hola), ya presentada en la seccion de benchmarks. Frente a otros modelos base de ~100M en turco u otros idiomas, no hay cifras publicadas en esta ficha que permitan una comparacion rigurosa, por lo que los datos son "no disponible".

| Modelo | Parametros | Contexto | PPL/BPB de test | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| rmala-gla-100m-3b | 100.465.280 | 2048 | 25,561380 / 1,321054 | no disponible | HuggingFace (repo propio, loader custom) |
| Alternativas de ~100M | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de instrucciones: es un base model, por lo que no debe esperarse seguimiento de ordenes, formato de chat ni alineacion con preferencias humanas.
- Cobertura idiomatica limitada: declarado unicamente para turco.
- Contexto corto: 2048 tokens, sin decodificacion optimizada con KV-cache en el codigo de referencia.
- Riesgo de alucinacion: inherente a un base model; no hay filtros de seguridad ni evaluacion de harmlessness.
- Sin benchmarks de tarea: no hay MMLU, HumanEval, GSM8K ni resultados de razonamiento de largo alcance; los diagnosticos de recuperacion/razonamiento no se incluyen como resultados completos.
- Contaminacion no descartada: no se hizo deduplicacion de texto entre colecciones; el autor no reclama ausencia absoluta de contaminacion.
- Licencia no asignada en esta subida: el autor remite a THIRD_PARTY_NOTICES.md; el uso comercial queda sin definir en la informacion disponible.
- Integracion tecnica: no esta registrado en Transformers AutoModel, el tokenizador nativo es especifico de Linux x86_64 / CPython 3.11+, y el decoder de referencia recompila el prefijo completo (latencia alta).
- Superacion no demostrada: el propio autor advierte que la mejora de V14-half sobre GLA es pequena y no establece superioridad robusta, y que V14-full no mejoro la PPL de test.
- Pesos parciales: solo se distribuyen los tensores finales; no se incluyen estados del optimizador, credenciales ni el texto de entrenamiento.
- El modelo no reclama ningun nivel de madurez para produccion.

## Enlaces

- HuggingFace (MercanAI): https://huggingface.co/MercanAI/rmala-gla-100m-3b
- Espejo en HuggingFace (Ethosoft): https://huggingface.co/Ethosoft/rmala-gla-100m-3b
- Archivos de referencia citados en la model card: evaluation.json, LM100_PROTOCOL.md, training_config.json, THIRD_PARTY_NOTICES.md, inference.py, requirements.txt (incluidos en el repositorio, no enlazados directamente)
- Codigo de referencia de GatedDeltaNet/cache (HoLA): citado como implementacion oficial "pinned", sin URL explicita en la informacion disponible
- Paper o blog: no disponible en la informacion proporcionada
