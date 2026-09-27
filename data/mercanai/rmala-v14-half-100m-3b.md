# MercanAI/rmala-v14-half-100m-3b

## Resumen

rmala-v14-half-100m-3b es un checkpoint de investigacion de un modelo de lenguaje base en turco, desarrollado por MercanAI (con espejo en Ethosoft), entrenado desde cero sobre exactamente 3.000 millones de tokens objetivo. Se trata de un modelo causal de aproximadamente 100 millones de parametros (100.468.112 exactos), disenado explicitamente como material de investigacion y no como un modelo de instrucciones o de chat. Su interes radica en el estudio comparativo de variantes de backbone de atencion lineal dentro de la familia RMALA.

La arquitectura combina una columna vertebral de atencion lineal (GLA, Gated Linear Attention) con una adaptacion de memoria denominada V14-LM, que introduce claves contextuales, valores en int8 y un presupuesto de banco de memoria por cabeza. La variante v14_half forma parte de un conjunto de cinco variantes (gla, v14_full, v14_half, full y hola) entrenadas con el mismo tokenizador, la misma secuencia de tokens y los mismos conjuntos de validacion y test, con una unica semilla (41001), lo que permite comparaciones controladas entre backbones.

El modelo es relevante ahora como pieza de investigacion reproducible sobre mecanicas de atencion lineal y memoria asociativa en modelos de lenguaje de escala pequena y contexto de 2048 tokens. No existe ninguna afirmacion de robustez, seguridad o preparacion para produccion por parte del autor; su uso previsto es experimental y academico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal con atencion lineal GLA y adaptacion de memoria V14-LM |
| Parametros totales | 100.468.112 (aproximadamente 100 M) |
| Parametros activos | No procede (modelo denso, no es MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | No disponible; checkpoint preservado en FP32, inferencia probada con autocast BF16 y TF32 desactivado |
| Idiomas soportados | Turco (tr) |
| Licencia | No disponible (esta subida no asigna nueva licencia de pesos ni de codigo; consultar THIRD_PARTY_NOTICES.md) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo consta de 16 capas con anchura 640, embeddings de entrada y salida atados de 32K entradas, RMSNorm y SwiGLU. La columna vertebral de atencion lineal (GLA/V14) usa 10 cabezas de tamano 64; la variante de atencion completa utiliza SDPA causal y RoPE; la variante HoLA usa 5 cabezas de tamano 128 con cache oficial betae, ventana de 64 y tamano de chunk de 256. La longitud de contexto es de 2048 tokens.

V14-LM es una adaptacion de una puerta V14 sintetica anterior, con claves contextuales, valores en int8, un presupuesto de banco de memoria por cabeza de 2048 bytes y limites de admision de lectura/escritura del 5 por ciento. Se emplea una puerta learned straight-through con un umbral forward duro de 0,99 y alfa de memoria aceptada igual a 1 o 0,5. El autor advierte explicitamente que esto no implica una reduccion del 95 por ciento de FLOPs de todo el modelo ni que las lecturas aceptadas sean correctas.

Los datos de entrenamiento son un subconjunto fijo de 3.000 millones de tokens de la coleccion pretokenizada MercanSet V11 / MercanPretraining, con validacion y test disjuntos por shard. No se realizo deduplicacion de texto entre colecciones, y el autor no reclama ausencia absoluta de contaminacion. No se redistribuyen los ficheros del dataset. Se uso un unico seed de entrenamiento (41001). El checkpoint v14_half se entrenó con el objetivo estandar de modelado causal; las cifras de FLOP son estimaciones algoritmicas, no mediciones completas de hardware.

## Capacidades

- Generacion de texto causal en turco: al ser un modelo base, completa secuencias y produce texto plano sin formato conversacional.
- Modelado de lenguaje de proposito general: predice el siguiente token sobre texto turco continuo.
- Investigacion de arquitecturas: permite estudiar el comportamiento de la atencion lineal GLA y de la memoria V14-LM frente a atencion completa en condiciones controladas.
- Comparacion de variantes: al compartir tokenizador, orden de tokens y conjuntos de evaluacion con gla, v14_full, full y hola, sirve para ablaciones reproducibles.
- Soporte de tool calling / function calling: no disponible; no es un modelo de instrucciones ni soporta herramientas.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: limitadas al turco segun los metadatos de idioma declarados.
- Capacidades especiales: no dispone de modo thinking, vision ni audio.
- Decodificacion: el decodificador de referencia recalcula el prefijo completo y se detiene en el limite de contexto de 2048 tokens; no es un decodificador optimizado con cache KV.

## Casos de uso

- Investigacion academica sobre atencion lineal: el modelo permite reproducir y auditar el comportamiento de la variante v14_half frente a backbones GLA y de atencion completa usando el mismo protocolo y conjuntos de evaluacion.
- Ablaciones controladas de mecanismos de memoria: al compartir tokenizador y datos con otras variantes RMALA, sirve para aislar el efecto de la puerta V14-LM y del parametro alfa en el rendimiento del modelo.
- Base para fine-tuning en turco: puede actuar como punto de partida de bajo coste para tareas especificas en turco mediante ajuste supervisado, dado su tamano reducido.
- Experimentos de destilacion o inicializacion: su tamano de 100 M y su consumo minimo de memoria lo hacen util como inicializacion de modelos mayores o como alumno en procesos de destilacion.
- Prototipado en entornos con recursos limitados: con aproximadamente 0,4 GB de repositorio, se puede cargar en equipos modestos para pruebas de generacion y evaluacion de perplejidad.
- Estudio de eficiencia de decodificacion: permite medir el coste de recalcular el prefijo completo frente a implementaciones con cache, dado que el decodificador de referencia no usa cache KV optimizada.
- Docencia y practicas de NLP: sirve como ejemplo de pipeline nativo en PyTorch con decodificador a medida, tokenizador propio y compilacion de kernels Triton.

## Benchmarks y rendimiento

El autor publica la siguiente comparativa entre las cinco variantes de la familia, con la misma semilla, tokenizador, orden de tokens y conjuntos de validacion y test. La perplejidad (PPL) incluye el EOS terminal; el BPB usa la NLL de contenido dividida por el recuento de bytes UTF-8 originales y excluye el EOS terminal. El test consta de 11.352.596 tokens y 39.843.759 bytes UTF-8 originales. La evaluacion de documentos completos usa chunks de 2048 tokens.

| Variante | Test PPL | Test BPB | Estimacion de FLOP algoritmicos de entrenamiento |
|---|---:|---:|---:|
| gla | 25,561380 | 1,321054 | 1,866978e+18 |
| v14_full | 25,591686 | 1,321246 | 1,886712e+18 |
| v14_half | 25,482146 | 1,319796 | 1,886712e+18 |
| full | 22,187501 | 1,262025 | 2,173686e+18 |
| hola | 20,419358 | 1,228817 | 1,963008e+18 |

El autor senala que la mejora de V14-half sobre GLA es pequena y no establece una superioridad robusta, y que V14-full no mejoro la PPL de test. La variante evaluada en esta ficha es v14_half (Test PPL 25,482146; Test BPB 1,319796). No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible; el model-index del autor aparece con la lista de resultados vacia. Tampoco se incluyen diagnosticos de recuperacion o razonamiento de largo alcance como resultados completos en esta version.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 400 MB en FP32 (100 M de parametros a 4 bytes) y alrededor de 200 MB en BF16, sin contar activaciones ni memoria del tokenizador.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente por capacidad de memoria; el autor indica uso nativo en Linux NVIDIA CUDA con autocast BF16. Se puede ejecutar en RTX 3060, RTX 4090, A100 o H100 sin limitaciones de memoria por el tamano del modelo.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU de consumo con CUDA, dado el reducido tamano del checkpoint (0,4 GB de repositorio).
- Opciones de despliegue: el modelo no esta registrado en Transformers AutoModel; se debe usar el cargador incluido (inference.py) con PyTorch nativo. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, y al no haber pesos GGUF ni registro en Transformers, esos runners no estan soportados de forma directa.
- Requisitos de software: tokenizador binario nativo para Linux x86_64 y CPython 3.11 o superior; la primera ejecucion compila kernels Triton.
- Latencia y throughput estimados: no disponible. El decodificador de referencia recalcula el prefijo completo en cada paso y no usa cache KV optimizada, por lo que la latencia por token crece con la longitud del contexto.

## Comparativa con modelos similares

No se dispone de datos de benchmarks externos en la informacion proporcionada para comparar con modelos de otras familias (por ejemplo, otros modelos base en turco de tamano similar), por lo que la comparacion externa se indica como no disponible. La unica comparacion con datos verificables es la interna entre las variantes de la propia familia RMALA:

| Variante | Parametros | Contexto | Test PPL | Test BPB | Licencia |
|---|---|---|---|---|---|
| v14_half (este modelo) | 100.468.112 | 2048 | 25,482146 | 1,319796 | No disponible |
| gla | No disponible | 2048 | 25,561380 | 1,321054 | No disponible |
| v14_full | No disponible | 2048 | 25,591686 | 1,321246 | No disponible |
| full | No disponible | 2048 | 22,187501 | 1,262025 | No disponible |
| hola | No disponible | 2048 | 20,419358 | 1,228817 | No disponible |

Solo se confirma el recuento de parametros de v14_half (100.468.112); el resto de variantes comparten protocolo, pero el desglose exacto de parametros no se detalla en la informacion disponible.

## Limitaciones y advertencias

- Modelo base, no ajustado por instrucciones: no sigue ordenes ni mantiene formato conversacional; no debe usarse como asistente directo.
- Sesgos conocidos: no disponible. El autor no documenta analisis de sesgos, y no se realizo deduplicacion entre colecciones de texto.
- Riesgo de alucinacion: inherente a un modelo de lenguaje base; el autor no reclama harmlessness ni seguridad, y no se han realizado evaluaciones de toxicidad.
- Limitaciones de contexto: ventana maxima de 2048 tokens, y el decodificador de referencia recalcula el prefijo completo deteniendose en ese limite.
- Limitaciones de idioma: soporte declarado unicamente para turco.
- Contaminacion de datos: el autor advierte que no se realizo deduplicacion de texto entre colecciones y que no se reclama ausencia absoluta de contaminacion.
- Restricciones de licencia: la licencia no esta disponible; esta subida no asigna nueva licencia de pesos ni de codigo y remite a THIRD_PARTY_NOTICES.md. Antes de cualquier uso comercial es imprescindible aclarar la licencia con el autor.
- Ausencia de resultados de robustez: no se incluyen diagnosticos completos de recuperacion ni de razonamiento de largo alcance, ni afirmaciones de preparacion para produccion.
- Rendimiento modesto: la PPL de test de v14_half (25,48) es notablemente superior a la de las variantes full (22,19) y hola (20,42), lo que indica un rendimiento inferior frente a esas alternativas dentro de la misma familia.
- Reproducibilidad: se uso una sola semilla de entrenamiento, lo que limita las conclusiones sobre variabilidad entre ejecuciones.
- Dependencia de software: el cargador y el tokenizador son nativos y especificos (Linux x86_64, CPython 3.11+), lo que dificulta la portabilidad a otros entornos sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/MercanAI/rmala-v14-half-100m-3b
- Espejo Ethosoft: https://huggingface.co/Ethosoft/rmala-v14-half-100m-3b
- Espejo MercanAI: https://huggingface.co/MercanAI/rmala-v14-half-100m-3b
- Ficheros incluidos en el repositorio (referenciados en la model card): inference.py, requirements.txt, training_config.json, LM100_PROTOCOL.md, evaluation.json, THIRD_PARTY_NOTICES.md
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada.
