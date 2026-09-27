# Compactbot/compactlm-5m

## Resumen

CompactLM-5M es un modelo de lenguaje de tipo LLaMA entrenado desde cero (from scratch) por el usuario Compactbot para dar respuesta a la petición model-requests #14 de la comunidad de HuggingFace. Se trata de un small language model (SLM) de 6.162.688 parámetros exactos, diseñado con un vocabulario BPE de 12.288 tokens y una ventana de contexto de 512 tokens. Su entrenamiento se realizó íntegramente sobre el subconjunto fineweb-edu, con aproximadamente 62 millones de tokens únicos.

El modelo se distribuye como un state dict crudo de PyTorch, no como un checkpoint cargable con la librería `transformers`, a pesar de que la ficha lleva la etiqueta `transformers` y `endpoints_compatible`. Esto implica que su uso requiere la clase `CompactLM` del script de entrenamiento original. Su relevancia es fundamentalmente didáctica y de investigación: sirve como referencia reproducible de un LM mínimo entrenado desde inicialización aleatoria sobre hardware de consumo (una RTX 5090 compartida).

La calidad del modelo es modesta y honestamente documentada por el propio autor: alcanza una perplejidad de 48,3 en un conjunto de validación reservado de fineweb-edu, produce inglés gramaticalmente intacto pero semánticamente superficial, con tendencia a la deriva temática y repetición de palabras. Es, en palabras del autor, un LM funcional a su escala, no un modelo de completado robusto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo LLaMA (RMSNorm, RoPE, SwiGLU MLP, embeddings atados) |
| Parametros totales | 6.162.688 (exacto) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | No disponible (no se ofrecen versiones cuantizadas oficiales; el checkpoint se distribuye como state dict PyTorch) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | PyTorch state dict (`.pt`), no safetensors ni GGUF |
| d_model | 256 |
| Numero de capas | 4 |
| Cabezas de atencion | 4 (MHA) |
| Dimension FFN (SwiGLU) | 640 |
| Vocabulario | 12.288 (BPE, mismo tokenizer que LDT-10M) |
| Embeddings | Atados (token embedding = LM head) |

## Arquitectura y entrenamiento

La arquitectura sigue el patron LLaMA: transformer decoder-only con normalizacion RMSNorm, codificacion posicional rotatoria (RoPE), MLP con activacion SwiGLU y embeddings de entrada y salida atados. El modelo tiene 4 capas, dimension de modelo de 256, 4 cabezas de atencion con multi-head attention estandar (MHA) y una dimension interna de FFN de 640. El vocabulario BPE cuenta con 12.288 tokens. El conteo exacto de parametros es de 6.162.688, superior a los ~5M que sugiere el nombre (el autor lo atribuye al objetivo redondeado de la peticion original).

El entrenamiento se realizo desde inicializacion aleatoria sobre el dataset HuggingFaceFW/fineweb-edu, con aproximadamente 61,7 millones de tokens unicos. El autor indica que se solicito tambien dclm-baseline-1.0, pero no fue accesible durante la ejecucion por errores de conexion, por lo que este checkpoint es exclusivamente fineweb-edu. El schedule consta de 20.000 pasos con batch de 128 y contexto de 512, lo que supone unos 1.310 millones de token-passes, es decir, aproximadamente 21 pasadas sobre los tokens unicos. Se uso el optimizador AdamW con LR pico de 3e-4, warmup de 300 pasos, decaimiento coseno hasta 0,1x, weight decay de 0,1 y grad clip de 1,0. El entrenamiento se ejecuto en una RTX 5090 de 32 GB compartida con otras cargas de trabajo. No se documenta RLHF, DPO ni ninguna fase de alineacion posterior.

## Capacidades

- Generacion de texto en ingles: completa secuencias de hasta 64 tokens de forma limpia, sin bucles de tokens ni puntuacion rota.
- Coherencia gramatical superficial: mantiene concordancia y estructura oracional correctas a nivel local.
- Continuacion de prompt (text completion): funciona como modelo de completado de contexto corto.
- No dispone de soporte documentado de tool calling ni function calling.
- No dispone de capacidades de agente ni de razonamiento multi-paso.
- No dispone de modo de razonamiento (thinking mode), vision ni audio.
- Capacidad multilingue limitada al ingles; no se documentan otros idiomas.
- Capacidad semantica limitada: deriva tematica y repeticion del termino principal en generaciones medias y largas.

## Casos de uso

- Docencia e investigacion sobre entrenamiento de LM desde cero: sirve como ejemplo reproducible y de bajo coste para estudiar el efecto del escalado de datos y parametros en un regimen extremo (6M de parametros).
- Pruebas de infraestructura de training: al ocupar tan pocos recursos, es util para validar pipelines de entrenamiento, logging y evaluacion antes de lanzar modelos mayores.
- Experimentos de tokenizacion: al compartir tokenizer con LDT-10M, permite comparar arquitecturas bajo un vocabulario identico.
- Generacion de texto de relleno o placeholder en entornos de prueba: util para testear interfaces de chat o de completado sin depender de APIs externas.
- Estudio de degeneracion y limites de escala: su tendencia documentada a la repeticion lo convierte en un caso de analisis sobre el techo de calidad de los SLM.
- Reproduccion de resultados academicos: al publicarse config, loss de validacion y muestras de generacion, permite replicar el experimento en hardware de consumo.
- Prototipado educativo en el aula: estudiantes pueden inspeccionar el state dict completo (39 tensores) y entender cada componente de un transformer LLaMA-style.

## Benchmarks y rendimiento

| Tarea | Dataset | Metrica | Valor | Verificado |
|---|---|---|---|---|
| Perplexity | fineweb-edu (held-out, 1M tokens) | Perplexity | 48,3 | No |
| Language modeling | fineweb-edu (held-out) | Val loss | 3,8775 | No |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: practicamente despreciable. Con 6,16M de parametros, el peso en fp32 ocupa unos 24,6 MB; en fp16 unos 12,3 MB. La inferencia cabe en CPU sin problema.
- GPU recomendadas: cualquier GPU, incluso integrada. Se puede ejecutar en una RTX 4090, H100, A100 o en una GPU de gama baja sin limitaciones de memoria.
- Compatibilidad con GPU de consumo: si, en cualquier GPU de consumo actual e incluso en muchas integradas. El modelo se entreno en una RTX 5090 de 32 GB, aunque uso una fraccion minima de ella.
- Opciones de despliegue: no es compatible directamente con vLLM, llama.cpp, Ollama ni TGI, ya que se distribuye como state dict PyTorch crudo y no como checkpoint de `transformers`. Requiere cargar el state dict con la clase `CompactLM` del script de entrenamiento. Una conversion a `transformers` es, segun el autor, el siguiente paso natural, pero no esta disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| compactlm-5m | 6,16M | 512 | Apache 2.0 | State dict `.pt` | Entrenado desde cero, perplejidad 48,3 en fineweb-edu |
| LDT-10M | no disponible | no disponible | no disponible | no disponible | Comparte tokenizer BPE con compactlm-5m; datos no incluidos en la informacion proporcionada |
| TinyStories-style SLM | no disponible | no disponible | no disponible | no disponible | No se dispone de datos verificables en la informacion proporcionada |

No se dispone de datos cuantitativos comparables de otros modelos en la informacion proporcionada; la comparacion queda limitada a la referencia al tokenizer compartido con LDT-10M.

## Limitaciones y advertencias

- Sesgos conocidos: el modelo se entrena unicamente sobre fineweb-edu en ingles, por lo que hereda los sesgos de ese corpus; no se documenta ninguna mitigacion.
- Riesgo de alucinacion: elevado. El autor documenta deriva tematica y repeticion del termino principal (por ejemplo, "the church ... the church ... the church"), lo que indica falta de coherencia semantica global.
- Limitaciones de contexto: ventana de solo 512 tokens, insuficiente para conversaciones multi-turno o documentos largos.
- Limitaciones de idioma: solo ingles; no se garantiza ningun comportamiento en castellano u otros idiomas.
- Restricciones de licencia: licencia Apache 2.0, permite uso comercial y modificacion, pero el modelo no es apto para produccion por su calidad.
- Caveat critico de produccion: no es un checkpoint cargable con `transformers`, pese a la etiqueta de la ficha. Cargarlo requiere la clase `CompactLM` y el codigo de entrenamiento, lo que dificulta su integracion en stacks estandar.
- Caveat de datos: no se pudo usar dclm-baseline-1.0 por errores de conexion, de modo que el entrenamiento es exclusivamente fineweb-edu.
- Perplejidad declarada por el autor sin verificacion independiente (`verified: false`).
- Modelo con 0 descargas y 0 likes en el momento del registro, sin validacion por parte de la comunidad.

## Enlaces

- HuggingFace: https://huggingface.co/Compactbot/compactlm-5m
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Peticion original (model-requests #14): https://huggingface.co/spaces/Compactbot/model-requests/discussions/14
