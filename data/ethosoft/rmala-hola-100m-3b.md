# Ethosoft/rmala-hola-100m-3b

## Resumen

rmala-hola-100m-3b es un checkpoint de investigacion de un modelo de lenguaje base en turco, desarrollado por Ethosoft (con espejo en MercanAI), entrenado desde cero sobre exactamente 3.000 millones de tokens objetivo. Se trata de un modelo denso de 100.686.864 parametros, no ajustado por instrucciones ni para chat, pensado exclusivamente como material de investigacion sobre arquitecturas de atencion lineal. La variante presentada, denominada "hola", es la de mejor perplexity de las cinco comparadas en el propio repositorio.

Arquitectonicamente es un transformer de 16 capas con anchura 640, embeddings de entrada/salida atados de 32K, RMSNorm y SwiGLU. La variante hola emplea un backbone GatedDeltaNet con atencion lineal hibrida (5 cabezas de tamano 128, cache betae oficial, ventana 64 y chunk 256), a diferencia de las variantes GLA/V14 que usan atencion lineal normalizada y de la variante full que usa atencion causal SDPA con RoPE. El contexto maximo es de 2048 tokens.

Su relevancia es fundamentalmente metodologica: el autor publica una comparacion controlada entre cinco variantes con el mismo tokenizador, los mismos tokens de entrenamiento en el mismo orden y los mismos conjuntos de validacion/test, con una unica semilla (41001). No se declara ninguna pretension de produccion, seguridad ni superioridad robusta, y no incluye diagnosticos completos de recuperacion a larga distancia. Es un artefacto de investigacion con licencia no especificada y descargas nulas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion lineal; backbone GatedDeltaNet (variante hola) |
| Parametros totales | 100.686.864 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (checkpoint FP32; modo de computo probado con autocast BF16 y TF32 desactivado) |
| Idiomas soportados | turco (tr) |
| Licencia | no disponible (la subida no asigna nueva licencia; ver THIRD_PARTY_NOTICES.md) |
| Formato de pesos | safetensors |
| Capas | 16 |
| Anchura | 640 |
| Cabezas (variante hola) | 5 cabezas de tamano 128 |
| Embeddings | 32K entrada/salida atados (tied) |
| Normalizacion / activacion | RMSNorm / SwiGLU |
| Tokens de entrenamiento | 3.000.000.000 |
| Tamano del repo | 0,4 GB |
| Semilla de entrenamiento | 41001 |

## Arquitectura y entrenamiento

El modelo sigue un diseno de transformer denso de 16 capas con anchura 640, embeddings atados de 32K, RMSNorm y SwiGLU. La variante hola utiliza el backbone GatedDeltaNet con la implementacion de cache betae oficial fijada por version, con 5 cabezas de tamano 128, ventana 64 y chunk 256. En el propio repositorio se comparan variantes con distintos mecanismos de atencion: GLA y V14 (10 cabezas de tamano 64, atencion lineal), full (atencion causal SDPA con RoPE) y hola. El autor advierte explicitamente que hola usa un backbone diferente al de GLA normalizada, por lo que la comparacion no constituye una ablacion aislada de la cache.

El entrenamiento se realizo desde cero sobre un subconjunto fijo de 3.000 millones de tokens de la coleccion pretokenizada MercanSet V11 / MercanPretraining, con validacion y test disjuntos por shard. El autor indica que no se realizo deduplicacion de texto entre colecciones y que no se reclama ausencia absoluta de contaminacion. La variante V14-LM es una adaptacion de una puerta sintetica V14 previa: claves contextuales, valores int8, presupuesto de banco por cabeza de 2048 bytes y limites de admision lectura/escritura del 5%. Se emplea una puerta aprendida straight-through con umbral forward duro de 0,99 y alfa de memoria aceptada de 1 o 0,5. El autor aclara que esto no implica una reduccion del 95% de los FLOPs de todo el modelo ni que las lecturas aceptadas sean correctas. Los estados del optimizador, credenciales y texto de entrenamiento no se distribuyen.

## Capacidades

- Generacion de texto autoregresivo en turco como modelo base (sin ajuste por instrucciones).
- Modelado de lenguaje causal; el checkpoint esta pensado para investigacion sobre atencion lineal y no para tareas de asistente.
- Capacidad de completar prefijos de texto hasta un maximo de 2048 tokens de contexto.
- No se declara soporte de tool calling ni function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades de vision, audio ni modo de razonamiento explicito (thinking mode).
- Multilingue: limitado al turco segun el tag de idioma declarado.
- No es un modelo de chat ni instruction-tuned, por lo que no se esperan capacidades de dialogo alineadas.
- El decodificador de referencia recomputa todo el prefijo y se detiene en el limite de 2048 tokens; no es un decodificador optimizado con cache KV.

## Casos de uso

- Investigacion sobre atencion lineal: el modelo permite reproducir la comparacion entre GLA, V14, atencion completa y HoLA bajo el mismo tokenizador, mismos datos y misma semilla, util para estudiar el impacto del mecanismo de atencion en la perplexity.
- Analisis de eficiencia de arquitecturas hibridas: al disponer de cinco variantes con estimaciones de FLOP de entrenamiento declaradas, sirve para estudiar compromisos entre coste algoritmico y calidad medida en PPL/BPB.
- Modelado de lenguaje en turco a escala reducida: es adecuado como linea base (baseline) de 100M parametros para comparar futuras tecnicas de entrenamiento sobre el mismo corpus MercanSet.
- Prototipado de decodificacion: el script inference.py incluido permite validar rapidamente prompts en turco y medir el comportamiento del decodificador de referencia con recomputo completo de prefijo.
- Experimentos de memoria/gating en V14-LM: el esquema de puerta straight-through con umbral 0,99 y presupuesto de banco por cabeza sirve como banco de pruebas para investigar mecanismos de memoria con admitancia limitada.
- Docencia y formacion en arquitecturas de atencion: el repositorio incluye fuentes del modelo original y dependencias fijadas (HOLA/FLA), lo que facilita usarlo como material didactico sobre atencion lineal.
- Reproducibilidad de protocolos de evaluacion: al publicar evaluation.json y LM100_PROTOCOL.md, es util para replicar metricas PPL/BPB con chunks de 2048 tokens sobre conjuntos hold-out disjuntos por shard.

## Benchmarks y rendimiento

Los unicos resultados disponibles proceden de la comparacion de variantes publicada por el autor. No hay resultados de MMLU, HumanEval, GSM8K ni similares (el array results del model-index esta vacio). Todos los valores usan la misma tokenizacion y los mismos conjuntos de validacion/test, con una unica semilla (41001). PPL incluye el EOS terminal; BPB usa NLL de contenido dividida por el recuento de bytes UTF-8 originales y excluye el EOS terminal. Evaluacion de documento completo con chunks de 2048 tokens. Test: 11.352.596 tokens / 39.843.759 bytes UTF-8 originales.

| Variante | Test PPL | Test BPB | FLOP de entrenamiento (estimacion algoritmica) |
|---|---:|---:|---:|
| gla | 25,561380 | 1,321054 | 1,866978e+18 |
| v14_full | 25,591686 | 1,321246 | 1,886712e+18 |
| v14_half | 25,482146 | 1,319796 | 1,886712e+18 |
| full | 22,187501 | 1,262025 | 2,173686e+18 |
| hola | 20,419358 | 1,228817 | 1,963008e+18 |

Advertencias del autor: la mejora de V14-half sobre GLA es pequena y no establece superioridad robusta; V14-full no mejoro la PPL de test; las estimaciones de FLOP de entrenamiento e inferencia no son mediciones completas de hardware, ya que las operaciones excluidas y la cobertura del profiler se documentan en LM100_PROTOCOL.md.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP32 el checkpoint ocupa aproximadamente 0,4 GB (coincide con el tamano del repo), por lo que alrededor de 1 GB de VRAM es suficiente; en autocast BF16 el peso baja a aproximadamente 0,2 GB.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA es suficiente por tamano; el autor documenta el uso de CUDA en Linux y la compilacion de kernels Triton en la primera ejecucion.
- Cabe en GPU de consumo: si, con amplio margen; modelos de 100M de parametros caben en GPUs de gama baja y en muchas iGPU con suficiente memoria compartida.
- Opciones de despliegue: no se menciona vLLM, llama.cpp, Ollama ni TGI. El modelo no esta registrado en Transformers AutoModel y debe cargarse con el loader incluido (inference.py). El tokenizador nativo empaquetado apunta a Linux x86_64 con CPython 3.11 o superior.
- Latencia y throughput: no disponible; no se publican mediciones.

## Comparativa con modelos similares

Los unicos comparables con datos publicados son las otras variantes del mismo repositorio, entrenadas bajo condiciones controladas (mismo tokenizador, mismos tokens en el mismo orden, misma semilla):

| Modelo | Parametros | Contexto | Test PPL | Test BPB | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| rmala-hola-100m-3b (hola) | 100.686.864 | 2048 | 20,419358 | 1,228817 | no disponible | HuggingFace (Ethosoft / MercanAI) |
| rmala variante full | no disponible | 2048 | 22,187501 | 1,262025 | no disponible | mismo repositorio |
| rmala variante v14_half | no disponible | 2048 | 25,482146 | 1,319796 | no disponible | mismo repositorio |
| rmala variante v14_full | no disponible | 2048 | 25,591686 | 1,321246 | no disponible | mismo repositorio |
| rmala variante gla | no disponible | 2048 | 25,561380 | 1,321054 | no disponible | mismo repositorio |

No se proporciona comparacion con modelos externos de tamano similar (por ejemplo otros modelos turcos de ~100M) en la informacion disponible.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones ni chat: no debe usarse como asistente sin un post-entrenamiento adicional.
- Idioma limitado al turco; no hay evidencia de capacidades multilingues.
- Contexto corto de 2048 tokens, insuficiente para tareas de contexto largo.
- El autor no reclama ausencia total de contaminacion entre colecciones: no se realizo deduplicacion de texto entre colecciones.
- Una unica semilla de entrenamiento (41001), lo que limita la significacion estadistica de las diferencias entre variantes.
- La propia model card advierte que la mejora de V14-half sobre GLA es pequena y no establece superioridad robusta, y que V14-full no mejoro la PPL de test.
- No hay diagnosticos completos de recuperacion o razonamiento a larga distancia en esta entrega.
- Riesgo de alucinacion: no evaluado ni declarado por el autor; al ser un modelo base, la generacion no esta alineada ni filtrada.
- Licencia no especificada: la subida no asigna nueva licencia y remite a THIRD_PARTY_NOTICES.md. No hay confirmacion de permiso para uso comercial, por lo que no debe asumirse.
- Restricciones de despliegue: el modelo no esta registrado en Transformers AutoModel y requiere el loader incluido; el tokenizador nativo solo apunta a Linux x86_64 / CPython 3.11+.
- No es un decodificador optimizado con cache KV: el script de referencia recomputa todo el prefijo, lo que limita su uso en produccion de baja latencia.
- El esquema de memoria V14 (puerta con umbral 0,99, admitancia del 5%) no implica que las lecturas aceptadas sean correctas ni una reduccion global de FLOPs del 95%.
- No se distribuyen estados del optimizador ni el texto de entrenamiento, lo que dificulta la reproduccion completa del entrenamiento.
- Fecha de creacion registrada como 2026-09-27, posterior a la fecha habitual de consulta; conviene verificar la vigencia del repositorio.

## Enlaces

- Modelo en HuggingFace (Ethosoft): https://huggingface.co/Ethosoft/rmala-hola-100m-3b
- Espejo en HuggingFace (MercanAI): https://huggingface.co/MercanAI/rmala-hola-100m-3b
- Documentacion del protocolo de evaluacion: LM100_PROTOCOL.md (incluido en el repositorio)
- Configuracion de entrenamiento: training_config.json (incluido en el repositorio)
- Metricas completas de validacion/test: evaluation.json (incluido en el repositorio)
- Avisos de terceros y licencias de dependencias: THIRD_PARTY_NOTICES.md (incluido en el repositorio)
