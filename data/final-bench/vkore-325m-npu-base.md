# FINAL-Bench/VKORE-325M-NPU-Base

## Resumen

VKORE-325M-NPU-Base es un modelo de lenguaje base de 325,6 millones de parametros desarrollado por FINAL-Bench (equipo detras de las marcas VKORE, VKTE y Vidraft, de origen coreano). Su relevancia no reside en su tamano ni en sus capacidades linguisticas, sino en como se entreno: es un modelo preentrenado desde cero sobre una NPU comercial disenada solo para inferencia, con retropropagacion ejecutada en el propio chip, algo que hasta ahora se consideraba inviable. Es el segundo modelo de la linea de entrenamiento en NPU de VKORE, tras VKORE-46M-NPU.

El modelo se entreno durante 76.293 pasos a lo largo de unos cuatro dias sobre 5.000 millones de tokens de texto web educativo (FineWeb-Edu), y alcanzo la misma perdida de evaluacion que la misma arquitectura entrenada en una GPU NVIDIA B200 (0,8067 frente a 0,8070). La arquitectura es un transformer decoder-only con RoPE, RMSNorm, SwiGLU y GQA, con tokenizacion a nivel de byte (vocabulario de 256). Su ventana de contexto es muy corta (256 tokens), por lo que es un modelo de investigacion y demostracion tecnologica mas que un modelo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (RoPE, RMSNorm, SwiGLU, GQA) |
| Parametros totales | 325,6M (325.624.832 segun safetensors) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 256 tokens (byte-level) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Ingles (entrenado con FineWeb-Edu, corpus en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers) |

Detalles adicionales de la arquitectura: 20 capas, anchura oculta 1024, anchura FFN 3584, 8 cabezas de atencion (2 KV, dimension de cabeza 256), vocabulario de 256 tokens a nivel de byte.

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only estandar en su diseno: usa RoPE para codificacion posicional, RMSNorm como normalizacion, SwiGLU en el FFN y agrupacion de consultas (GQA) con 8 cabezas de consulta y 2 de clave-valor. La tokenizacion es a nivel de byte con vocabulario de 256, lo que elimina la necesidad de fichero de tokenizador: el identificador de token coincide con el valor del byte.

El entrenamiento es el aspecto diferencial: se preentreno desde cero (sin pesos previos) sobre 32 chips de una NPU comercial de solo inferencia, ejecutando la retropropagacion en el propio chip. Se usaron 5.000 millones de tokens del subconjunto publico `sample/10BT` de FineWeb-Edu (shards 000 y 001), durante 76.293 pasos y unos cuatro dias, con la perdida descendiendo de 5,73 a 0,80. La tecnica que permite entrenamiento largo y estable sobre una NPU de inferencia fue desarrollada internamente, esta bajo solicitud de patente y se detallara en un articulo futuro. Como referencia, se entreno el mismo modelo con la misma inicializacion, datos y planificador en una GPU B200; ambos conjuntos de pesos estan publicados para reproducir la comparacion.

## Capacidades

- Generacion de texto en ingles como modelo base (sin ajuste por instrucciones): completado de frases y continuacion de texto.
- Comprension y generacion a nivel de byte: puede teoricamente codificar cualquier secuencia UTF-8 sin vocabulario cerrado, aunque su entrenamiento se limito a texto educativo en ingles.
- No hay soporte declarado de tool calling, function calling ni agentes.
- No hay capacidades de vision, audio ni modo de razonamiento extendido.
- Al ser un modelo base de 325M con contexto de 256 tokens, sus capacidades de razonamiento, codigo y matematicas son limitadas y no se han evaluado formalmente.

## Casos de uso

- Investigacion en entrenamiento sobre aceleradores de inferencia: sirve como prueba de concepto reproducible (incluye pesos de referencia de B200 y script de evaluacion) para equipos que exploran entrenamiento en NPU, FPGA o hardware no convencional.
- Comparacion de hardware de entrenamiento: el repositorio permite replicar la comparacion NPU frente a GPU con `evaluate_unseen.py`, util para estudios de eficiencia energetica y coste.
- Experimentacion con modelos byte-level: al no requerir tokenizador, es un banco de pruebas sencillo para investigar tokenizacion a nivel de byte y su impacto en la calidad.
- Despliegue en dispositivos de borde (edge AI): con 325M de parametros y un contexto corto, es candidato para inferencia en dispositivos con recursos limitados, en linea con las etiquetas on-device y low-power del autor.
- Prototipado y educacion: su tamano reducido permite entrenamiento, fine-tuning o analisis de activaciones en hardware modesto, ideal para docencia en modelos de lenguaje.
- Base para fine-tuning en dominios estrechos de texto corto en ingles: resumenes de frases, completado de texto educativo o clasificacion generativa con ventanas de 256 tokens.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos de rendimiento publicados son de perdida (loss) en la comparacion NPU frente a GPU:

| Ejecucion | Pasos | Loss, ventanas del corpus (256) | Loss, texto no visto (1.024) | Bits por byte, no visto |
|---|---|---|---|---|
| NPU (32 chips) | 76.292 | 0,8067 | 0,7993 | 1,1531 |
| GPU B200 | 76.293 | 0,8070 | 0,7994 | 1,1533 |

La diferencia pareada sobre ventanas identicas en texto no visto es de -0,0001 (NPU menos GPU) con un error estandar de 0,0007; la ejecucion en NPU es inferior en el 50,1% de las ventanas. Las diferencias estan dentro del ruido de medicion.

## Requisitos de hardware

- VRAM estimada para inferencia: con 325,6M de parametros en fp16, unos 0,7 GB de pesos; cualquier GPU moderna con 2-4 GB de VRAM o una CPU es suficiente. No hay datos de cuantizacion publicados.
- GPU recomendadas: no requiere GPU dedicada para inferencia; para fine-tuning bastaria una RTX 3060 de 12 GB o superior. No hay cifras oficiales de VRAM.
- Cabe con holgura en GPUs de consumo (incluso portatiles) y en Raspberry Pi-class devices con suficientes recursos, dada su escala de 325M.
- Despliegue: compatible con la libreria transformers (AutoModelForCausalLM); por su arquitectura Llama y formato safetensors, deberia funcionar con llama.cpp y derivados (Ollama), aunque no hay soporte GGUF publicado ni mencion de vLLM o TGI.
- Latencia y throughput: no disponibles. El entrenamiento en NPU duro unos cuatro dias (76.293 pasos) sobre 32 chips; no se publican metricas de tokens/segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tokenizador | Licencia | Nota diferencial |
|---|---|---|---|---|---|
| VKORE-325M-NPU-Base | 325,6M | 256 | Byte-level (256) | Apache 2.0 | Preentrenado desde cero en NPU de solo inferencia |
| VKORE-46M-NPU | 45,8M | no disponible | Byte-level | no disponible | Primer modelo de la linea; entrenado con TinyStories (22,5M tokens) |
| Qwen2.5-0.5B | ~494M | 32.768 (128K con RoPE escalado) | BPE (~151K) | Qwen Research (uso comercial restringido) | Modelo SLM convencional entrenado en GPU, multilingue |
| SmolLM2-360M (HuggingFace) | ~360M | 8.192 | BPE (~49K) | Apache 2.0 | SLM de tamano comparable, entrenado en GPU con ~11T tokens |

Frente a los SLM convencionales de su rango de tamano, VKORE-325M tiene un contexto muy inferior (256 frente a 8K-32K) y mucho menos entrenamiento (5B frente a billones de tokens), pero su valor esta en la demostracion de entrenamiento en NPU y en el coste energetico, no en el rendimiento linguistico.

## Limitaciones y advertencias

- Contexto extremadamente corto: 256 tokens, insuficiente para la mayoria de tareas de produccion (documentos largos, conversaciones multi-turno, codigo).
- Modelo base sin ajuste por instrucciones: no sigue instrucciones de forma fiable; requiere fine-tuning para aplicaciones dirigidas.
- Entrenamiento limitado a 5B tokens de FineWeb-Edu en ingles: calidad de texto muy por debajo de modelos comparables en tamano; alta probabilidad de alucinaciones y texto incoherente en generaciones largas.
- Sesgos: hereda los sesgos del corpus FineWeb-Edu (contenido web educativo en ingles, predominantemente anglosajon); no hay analisis de sesgos publicado.
- Idioma: entrenado solo con texto en ingles; el rendimiento en castellano u otros idiomas no esta garantizado pese a la tokenizacion byte-level.
- Sin benchmarks estandar publicados: imposible comparar su calidad linguistica con otros modelos en terminos habituales.
- La tecnica de entrenamiento en NPU esta bajo solicitud de patente y sin articulo publicado todavia, lo que limita la verificabilidad independiente del metodo.
- Licencia Apache 2.0: sin restricciones para uso comercial.
- El propio autor lo enmarca como modelo de investigacion; no esta pensado para despliegue en produccion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/FINAL-Bench/VKORE-325M-NPU-Base
- Modelo anterior de la linea (VKORE-46M-NPU): https://huggingface.co/FINAL-Bench/VKORE-46M-NPU
- Dataset de entrenamiento (FineWeb-Edu): https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Articulo cientifico sobre el metodo de entrenamiento en NPU: no disponible (anunciado como proximo por el autor)
- Repositorio de codigo o demo adicional: no disponible
