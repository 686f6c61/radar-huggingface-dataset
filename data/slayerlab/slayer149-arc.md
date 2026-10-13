# SlayerLab/Slayer149-ARC

## Resumen

Slayer149-ARC es un modelo de lenguaje de 149.333.081 parametros desarrollado por SlayerLab (el sello de modelos abiertos de Fabryka AI, con sede en Varsovia). Se trata de un ajuste fino supervisado del checkpoint base Slayer149-balanced orientado a responder preguntas de eleccion multiple, en concreto el conjunto ARC-Easy, sin degradar por ello la calidad general del texto. El modelo es un transformer decoder-only compacto con atencion de consultas agrupadas (GQA), RMSNorm, MLP SwiGLU y embeddings de posicion rotatorios, con 26 capas, tamano oculto de 576 y una ventana de contexto de 2.048 tokens.

El problema que resuelve es acotado pero medible: obtener el mejor resultado publicado en ARC-Easy dentro del tablero Tiny-ML, con un 66,58 % de acierto, manteniendo ademas una perplejidad de 1,907 en WikiText-2 y un 78,38 % en BLiMP. Su relevancia actual reside en que todo el proceso es reproducible: el modelo base, el tokenizador y el protocolo de evaluacion son publicos, y la evaluacion se hizo con lm-evaluation-harness 0.4.13 sobre conjuntos de test completos.

No es un asistente instruido ni un modelo conversacional. La propia model card lo describe como una base de investigacion para QA de eleccion multiple en ingles y generacion de texto general. Se publica bajo licencia Apache 2.0, con pesos en safetensors y sin versiones cuantizadas oficiales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con GQA, RMSNorm, SwiGLU y RoPE |
| Parametros totales | 149.333.081 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (no se publican versiones cuantizadas; convertible a GGUF con herramientas externas) |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria pytorch, requiere trust_remote_code) |

Datos arquitectonicos adicionales recogidos en la model card: 26 capas, tamano oculto de 576, atencion GQA con 9 cabezas de consulta y 3 de clave/valor de 64 dimensiones, vocabulario BPE de 24.576 tokens y embeddings atados (tied). El repositorio ocupa 0,6 GB.

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only compacto de 149M de parametros. Emplea atencion de consultas agrupadas (GQA) con una relacion de 9 cabezas de consulta por 3 de clave/valor, RMSNorm en lugar de LayerNorm, bloques MLP con activacion SwiGLU y embeddings de posicion rotatorios (RoPE). El vocabulario es un BPE de 24.576 tokens y los embeddings de entrada y salida estan atados. Con 26 capas y un tamano oculto de 576, la relacion entre profundidad y anchura es inusualmente alta, una configuracion tipica de los modelos pequenos optimizados para eficiencia por parametro.

El preentrenamiento del modelo base consumio aproximadamente 31.000 millones de tokens de texto web y educativo filtrado: FineWeb-Edu, DCLM-Edu, Cosmopedia y FineMath. El ajuste fino de esta variante se realizo sobre la particion de entrenamiento limpia de ARC-Easy (2.235 ejemplos) mezclada con un flujo de replay de texto general y gramatica, de modo que el modelo aprende el formato de pregunta-respuesta sin perder calidad linguistica general. No se menciona el uso de RLHF ni DPO; el proceso descrito es un ajuste supervisado. La model card indica explicitamente que no se utilizaron datos de test ni de validacion durante el entrenamiento.

## Capacidades

- Generacion de texto general en ingles, heredada del checkpoint base Slayer149-balanced.
- Respuesta a preguntas de eleccion multiple, en especial ciencia de nivel escolar (ARC-Easy), con un 66,58 % de acierto zero-shot.
- Razonamiento gramatical y de concordancia, medido con BLiMP (78,38 % de acierto en comparacion de pares de frases por verosimilitud).
- Modelado de lenguaje con baja perplejidad a nivel de byte sobre WikiText-2 (1,907).
- Finalizacion de respuestas cortas dado un prompt con formato "Question: ... Answer:".
- No dispone de tool calling ni function calling.
- No esta disenado para uso agentico ni razonamiento multi-paso.
- No soporta vision, audio ni modo de razonamiento explicito.
- Multilinguismo limitado al ingles; no se declaran capacidades en otros idiomas.
- Al no ser un modelo instruido, no sigue instrucciones conversacionales ni mantiene dialogos multi-turno de forma fiable.

## Casos de uso

- Evaluacion academica de modelos pequenos: sirve como referencia reproducible para comparar tecnicas de ajuste fino en tareas de eleccion multiple dentro del tablero Tiny-ML, dado que el protocolo y el modelo base son publicos.
- Investigacion sobre olvido catastrofico: el uso de un flujo de replay de texto general y gramatica durante el ajuste permite estudiar como preservar capacidades generales al especializar un modelo en una tarea concreta.
- Generacion de preguntas de ciencia para material educativo: con el prompt adecuado puede completar respuestas de nivel escolar, util para generar borradores de ejercicios que luego revise un docente.
- Clasificacion por verosimilitud: gracias a su buen resultado en BLiMP, puede emplearse para puntuar pares de frases y detectar construcciones agramaticales en ingles, por ejemplo en herramientas de correccion de texto.
- Modelado de lenguaje en entornos con recursos minimos: con 149M de parametros cabe en cualquier GPU de consumo e incluso en CPU, lo que permite ejecutarlo en portatiles o dispositivos embebidos para tareas de puntuacion de texto.
- Filtrado de corpus: puede usarse como modelo de perplejidad para clasificar y filtrar texto web en ingles por calidad linguistica antes de usarlo en otros pipelines de entrenamiento.
- Experimentos de destilacion o como profesor auxiliar: por su tamano reducido y su licencia permisiva, es adecuado como componente en investigaciones de destilacion o de ensamblado de modelos pequenos.

## Benchmarks y rendimiento

Resultados publicados en la model card, medidos con lm-evaluation-harness 0.4.13, WikiText a nivel de documento, verosimilitud rodante a 1.024 tokens de contexto, ARC-Easy zero-shot y BLiMP por verosimilitud de pares de frases.

| Benchmark | Resultado |
|---|---|
| ARC-Easy | 66,58 % |
| BLiMP | 78,38 % |
| WikiText-2 (perplejidad por byte) | 1,907 |
| Raw overall (tablero Tiny-ML) | 81,51 |
| Efficiency (tablero Tiny-ML) | 81,52 |

La model card afirma que tanto la puntuacion raw como la de eficiencia son las mas altas del tablero Tiny-ML en el momento de su publicacion, y que el 66,58 % en ARC-Easy es el mejor resultado del tablero con independencia del tamano del modelo. No se han facilitado resultados de otros benchmarks habituales como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada en fp16: en torno a 0,3-0,4 GB para los pesos, mas la memoria de activaciones y cache KV; con contexto completo de 2.048 tokens el consumo se mantiene por debajo de 1 GB.
- VRAM estimada en int8: aproximadamente 0,15-0,2 GB. En int4, en torno a 0,1 GB.
- Cabe holgadamente en cualquier GPU de consumo: RTX 3060, RTX 4060, RTX 4090, e incluso en iGPU con memoria compartida.
- Tambien es viable su ejecucion en CPU para inferencia por lotes pequenos o tareas de puntuacion.
- Opciones de despliegue: transformers (requiere trust_remote_code), vLLM y TGI para servir el modelo en fp16. Para llama.cpp u Ollama seria necesaria una conversion previa a GGUF, ya que no se publican artefactos cuantizados oficiales.
- Latencia y throughput estimados: no disponible.
- El repositorio ocupa 0,6 GB, por lo que la descarga y el almacenamiento no suponen una barrera practica.

## Comparativa con modelos similares

Comparativa de especificaciones con alternativas de tamano reducido. Los datos de rendimiento no se incluyen porque los protocolos de evaluacion difieren y no son directamente comparables.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Disponibilidad |
|---|---|---|---|---|---|
| Slayer149-ARC | 149M | 2.048 | Apache 2.0 | en | HuggingFace (safetensors) |
| Slayer149-balanced | 149M | 2.048 | Apache 2.0 | en | HuggingFace (modelo base) |
| GPT-2 | 124M | 1.024 | MIT | en | HuggingFace |
| TinyLlama-1.1B | 1.100M | 2.048 | Apache 2.0 | en | HuggingFace |

GPT-2 y TinyLlama se incluyen como referencias de tamano y contexto conocidas, no como equivalentes funcionales: el primero esta descontinuado como base de investigacion y el segundo es un modelo instruido de mayor tamano. Para una comparacion de rendimiento real habria que reevaluar los tres con el mismo arnes; no se dispone de esos datos en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo instruido: la propia model card lo califica de base de investigacion para QA de eleccion multiple y texto general, no de asistente conversacional.
- Soporte exclusivo del ingles; no se han declarado capacidades en castellano ni en otros idiomas.
- Ventana de contexto de solo 2.048 tokens, insuficiente para documentos largos o conversaciones extensas.
- Riesgo de alucinacion y de respuestas factualmente incorrectas, especialmente fuera del dominio de ARC-Easy.
- Tamano pequeno, con la consiguiente menor capacidad de razonamiento y conocimiento factual que modelos de mayor escala.
- Ausencia de tool calling, function calling y capacidades agenticas.
- No se han publicado versiones cuantizadas oficiales, por lo que el despliegue en llama.cpp u Ollama requiere trabajo adicional de conversion.
- Posibles sesgos heredados del corpus de preentrenamiento (FineWeb-Edu, DCLM-Edu, Cosmopedia, FineMath), que no se documentan en la model card.
- El modelo se creo el 12 de octubre de 2026 y no registra descargas ni "likes", por lo que su validacion por parte de la comunidad es nula por el momento.
- La licencia Apache 2.0 permite uso comercial, pero al tratarse de un artefacto de investigacion conviene validar su comportamiento en el dominio concreto antes de integrarlo en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SlayerLab/Slayer149-ARC
- Modelo base: https://huggingface.co/SlayerLab/Slayer149-balanced
- Slayer149 (modelo original de la familia): https://huggingface.co/SlayerLab/Slayer149
- Ajuste fino alternativo (seed 45500): https://huggingface.co/SlayerLab/Slayer149-Balanced-ARC-E-ft-45500
- Fabryka AI: https://fabryka.ai
- Ficha en LLM Explorer: https://llm-explorer.com/model/SlayerLab%2FSlayer149,5LPgYSQS2v3mKp4j04fEGd
- Ficha en Free2AITools (Slayer149): https://free2aitools.com/model/slayerlab/slayer149
- Ficha en Free2AITools (Slayer149 Balanced ARC-E ft 45500): https://free2aitools.com/model/slayerlab/slayer149-balanced-arc-e-ft-45500
