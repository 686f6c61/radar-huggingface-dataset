# DJLougen/LFM2.5-VL-3B-DSpark-MLX-4bit

## Resumen

LFM2.5-VL-3B-DSpark-MLX-4bit es una conversion a formato MLX del drafter DSpark de Liquid AI para el modelo vision-lenguaje LFM2.5-VL-3B. No es un modelo autonomo: se trata de un modelo borrador (*draft*) de 279.468.801 parametros y cuatro capas que se emplea en un esquema de decodificacion especulativa, proponiendo tokens que el modelo objetivo (LFM2.5-VL-3B en BF16 u 8 bits) verifica despues. El autor de la conversion es DJLougen, mientras que los pesos originales proceden de LiquidAI/LFM2.5-VL-3B-DSpark.

El interes de esta ficha radica en que cuantiza unicamente las capas lineales del borrador (las cuatro capas y la proyeccion `fc`) a 4 bits afines con grupo de 64, dejando las cabezas Markov y de confianza y las normalizaciones en BF16. Con ello se reduce el tamano del checkpoint (~0,3 GB) manteniendo la compatibilidad con el runtime MLX-VLM. Es, por tanto, una pieza de infraestructura de inferencia orientada a Apple Silicon, no un modelo generativo por si mismo.

Su relevancia es practica: la decodificacion especulativa permite acelerar la generacion del VLM objetivo sin alterar la salida verificada a temperatura cero. Los datos publicados por el autor muestran una mejora de hasta 2,79x en velocidad de decodificacion con objetivo BF16 y bloque 8, aunque con objetivo de 8 bits la ganancia medida es marginal (1,08x). Todo el soporte de idiomas, contexto y capacidades generativas depende del modelo objetivo, no de este borrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer borrador de 4 capas con cabezas Markov y de confianza, integrado en decodificacion especulativa DFlash |
| Parametros totales | 279.468.801 (~280 M) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit affine con group size 64 en las lineales del borrador y la proyeccion `fc`; cabezas Markov/confianza y normalizaciones en BF16 |
| Idiomas soportados | no disponible |
| Licencia | LFM Open License v1.0 (identificador `lfm1.0`, campo `license: other`) |
| Formato de pesos | safetensors (MLX), fichero `model.safetensors` de 251.454.064 bytes, SHA-256 `431fb254296f4da77598376906e219fa105cbe2bafcf111773658c38718f6687` |

## Arquitectura y entrenamiento

El artefacto es una conversion de pesos, no un entrenamiento nuevo. El borrador original de Liquid AI consta de cuatro capas transformer y dos cabezas adicionales (Markov y de confianza) que conforman el mecanismo DFlash de propuesta de tokens. La conversion reordena los tensores desde el layout orientado a SGLang del checkpoint original hacia tensores nativos de MLX y anade metadatos de configuracion para el runtime MLX-VLM. La cuantizacion 4-bit se aplica exclusivamente a las lineales del borrador y a la proyeccion `fc`, mientras que las cabezas y las normalizaciones permanecen en BF16.

El modelo objetivo con el que trabaja, LFM2.5-VL-3B, es un VLM construido sobre el backbone de texto LFM2.5-2.6B con un codificador de vision SigLIP2 NaFlex de 400 M de parametros. El borrador se ancla a la revision `af77e9306a26e8625fde74d2a3051ab6d21bd955` de LiquidAI/LFM2.5-VL-3B-DSpark. No se dispone de informacion en las fuentes consultadas sobre el numero de tokens, la composicion del dataset ni el uso de RLHF o DPO en el entrenamiento del borrador.

El flujo de inferencia es el siguiente: el borrador propone un bloque de tokens candidatos, el modelo objetivo los verifica y se conservan los aceptados. La decodificacion especulativa en este runtime es exclusivamente greedy, por lo que debe fijarse la temperatura a cero; en ese regimen, la salida verificada del objetivo es la autoritativa y la calidad no cambia respecto a la decodificacion sin borrador.

## Capacidades

- Propuesta de tokens para decodificacion especulativa: genera bloques candidatos que el modelo objetivo LFM2.5-VL-3B valida, reduciendo el numero de pasos de decodificacion del objetivo.
- No es un modelo autonomo: no genera texto, codigo ni razonamiento por si solo; toda la capacidad generativa reside en el modelo objetivo.
- No realiza tool calling ni function calling por si mismo; esas capacidades pertenecen al VLM objetivo (que si soporta function calling, OCR, comprension de documentos y prediccion de bounding boxes).
- No soporta agentes ni razonamiento multi-paso de forma independiente.
- Capacidades multilingues: no disponibles a nivel de borrador; dependen integramente del modelo objetivo.
- Compatibilidad restringida a la familia objetivo LFM2.5-VL-3B en runtime MLX-VLM (>= 0.7.2) y solo con objetivo en BF16 u 8 bits.
- Modo de operacion greedy unicamente: la especulacion DFlash en este runtime no admite muestreo con temperatura distinta de cero.

## Casos de uso

- Aceleracion de inferencia VLM en Mac: integrado en `mlx_vlm.generate` con objetivo LFM2.5-VL-3B-MLX-8bit y bloque 4, sirve para reducir la latencia de decodificacion en equipos Apple Silicon cuando el objetivo esta en BF16.
- Descripcion de imagenes local en equipo de sobremesa: en un Mac con MLX se puede describir una imagen con prompt corto reduciendo el tiempo de decodificacion (medido de 43,6 a 121,7 tok/s con objetivo BF16).
- Procesamiento por lotes de OCR y documentos: al acelerar la generacion del objetivo, permite procesar volumenes mayores de documentos escaneados en pipelines de digitalizacion local.
- Asistentes de vision sobre dispositivo: como pieza de un asistente que responde sobre capturas de pantalla o documentos sin enviar datos a la nube, aprovechando el caracter on-device de MLX.
- Prototipado y evaluacion de decodificacion especulativa: util para investigadores que quieran medir el impacto de un borrador cuantizado a 4 bits frente a uno en 8 bits o frente a la decodificacion sin borrador.
- Anotacion de datos con VLM: en tareas de etiquetado asistido por modelo (por ejemplo, deteccion de bounding boxes en el objetivo), la aceleracion reduce el coste por muestra en lotes grandes de imagenes.
- Despliegue en entornos con memoria unificada limitada: al ocupar el borrador unos 0,3 GB, permite anadir especulacion a un objetivo de 3B en equipos de 36 GB sin comprometer el presupuesto de memoria del objetivo.

## Benchmarks y rendimiento

Los datos proceden de la model card del autor y se midieron en un Apple M3 Max con 36 GB de memoria unificada, Python 3.12, `mlx` 0.32.2, `mlx-vlm` 0.7.3 y `transformers` 5.17.0. La prueba usa tres instrucciones sobre la misma imagen, generacion greedy y dos repeticiones por prompt/configuracion, conservando la de menor tiempo total (la seleccion best-of-two puede ser optimista).

| Precision objetivo | Bloque draft | Decodificacion solo objetivo (media) | Con este drafter (media) | Ratio velocidad decodificacion | Ratio extremo a extremo | Tokens aceptados/ronda |
|---|---:|---:|---:|---:|---:|---:|
| BF16 | 8 | 43,6 tok/s | 121,7 tok/s | 2,79x | 2,31x | 4,09 |
| 8-bit | 4 | 74,9 tok/s | 79,8 tok/s | 1,08x | 1,06x | 2,92 |

El autor indica que la salida seleccionada del borrador coincidio con el texto de la decodificacion solo-objetivo en cada prompt. No se trata de un benchmark de fabricante ni de una ganancia garantizada: con objetivo de 8 bits la mejora extremo a extremo es pequena y la decodificacion sin especulacion puede ser preferible. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que el artefacto es un borrador y no un modelo evaluable de forma independiente.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con MLX y MLX-VLM; no es compatible con CUDA ni con runtimes de GPU discretas.
- Tamano del borrador: repositorio de 0,3 GB; el fichero `model.safetensors` ocupa 251 MB, por lo que el borrador anade un coste de memoria minimo sobre el objetivo.
- Memoria estimada del sistema completo: el objetivo LFM2.5-VL-3B en BF16 ronda los 6 GB (parametros mas codificador de vision SigLIP2 de 400 M) y en 8 bits alrededor de 3 GB; el borrador suma unos 0,3 GB. Estas cifras son estimaciones derivadas del recuento de parametros, no medidas publicadas.
- Equipo de referencia medido: Apple M3 Max con 36 GB de memoria unificada.
- GPU recomendadas: cualquier chip Apple Silicon con memoria unificada suficiente; no hay datos de rendimiento para M1, M2, M4 ni variantes Pro/Max/Ultra distintas del M3 Max.
- Encaje en GPU de consumo: si por consumo se entiende hardware Apple, cabe en Macs con memoria unificada amplia (se midio en 36 GB); no hay soporte para RTX 4090, A100 o H100 en este artefacto MLX.
- Opciones de despliegue: MLX-VLM (>= 0.7.2, probado con 0.7.3) mediante `python -m mlx_vlm.generate` con `--draft-model` y `--draft-block-size`. El borrador original esta orientado a SGLang, pero esta conversion no esta pensada para ese runtime; no hay soporte de vLLM, TGI, llama.cpp ni Ollama para este artefacto concreto.
- Latencia y throughput: con objetivo BF16 y bloque 8 se midieron 121,7 tok/s frente a 43,6 tok/s sin borrador; con objetivo 8 bits y bloque 4, 79,8 tok/s frente a 74,9 tok/s.

## Comparativa con modelos similares

No existen modelos directamente comparables, ya que este artefacto es un borrador de decodificacion especulativa y no un modelo generativo autonomo. La comparacion relevante es entre configuraciones de despliegue del mismo sistema.

| Configuracion | Parametros (borrador) | Precision borrador | Bloque | Velocidad medida | Licencia |
|---|---|---:|---:|---:|---:|---|
| Este drafter + objetivo 8-bit | 279 M | 4-bit affine | 4 | 79,8 tok/s | LFM Open License v1.0 |
| Este drafter + objetivo BF16 | 279 M | 4-bit affine | 8 | 121,7 tok/s | LFM Open License v1.0 |
| Borrador MLX 8-bit (referenciado en avisos) | 279 M | 8-bit | no disponible | puede superar al 4-bit en ciertos bloques | LFM Open License v1.0 |
| Objetivo solo (sin borrador) | no aplica | BF16 / 8-bit | no aplica | 43,6 / 74,9 tok/s | segun modelo objetivo |

## Limitaciones y advertencias

- No es un modelo autonomo ni de proposito general: es un borrador especifico para la familia objetivo LFM2.5-VL-3B. No debe confundirse con un modelo Qwen3 pese a la etiqueta `qwen3` del repositorio.
- La mejora de velocidad con objetivo de 8 bits es pequena (1,08x) y se midio sobre solo tres prompts cortos; no hay ganancia robusta establecida.
- El borrador 4-bit puede ser mas lento que el borrador 8-bit o que la decodificacion sin especulacion en tamanos de bloque distintos.
- El barrido de contexto largo se hizo con el borrador BF16, no con este 4-bit, y mostro que la especulacion era mas lenta que la decodificacion solo-objetivo con 32k y 64k tokens de contexto. El rendimiento de este borrador 4-bit en contexto largo no esta establecido.
- Restriccion de decodificacion: la especulacion DFlash en MLX-VLM es solo greedy; hay que fijar temperatura a cero.
- No se reclama ni se ha validado ningun resultado de benchmark con runtime SGLang para este artefacto.
- Riesgo de alucinacion y sesgos: no aplicables directamente al borrador, ya que la salida verificada del objetivo es la autoritativa a temperatura cero; cualquier sesgo del sistema final proviene del modelo objetivo.
- Licencia: los pesos se distribuyen bajo LFM Open License v1.0 (licencia `other`). Las condiciones exactas de uso comercial no se detallan en la informacion disponible y deben consultarse en el fichero LICENSE; el codigo del repositorio asociado (DJLougen/lfm25-vl-3b) se rige por Apache-2.0, licencia que no se aplica a los pesos.
- Idiomas soportados: no disponible a nivel de borrador.
- Longitud de contexto: no disponible para el borrador.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/DJLougen/LFM2.5-VL-3B-DSpark-MLX-4bit
- Modelo base (drafter original): https://huggingface.co/LiquidAI/LFM2.5-VL-3B-DSpark
- Modelo objetivo 8-bit: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-8bit
- Modelo objetivo 4-bit: https://huggingface.co/LiquidAI/LFM2.5-VL-3B-MLX-4bit
- Repositorio de codigo de conversion y benchmark: https://github.com/DJLougen/lfm25-vl-3b
- Resultados del barrido: https://github.com/DJLougen/lfm25-vl-3b/blob/main/results/sweep.json
- Blog de Liquid AI sobre LFM2.5-VL-DSpark: https://www.liquid.ai/blog/lfm2-5-vl-dspark
- Blog de Liquid AI sobre LFM2.5-DSpark (texto): https://www.liquid.ai/blog/lfm2.5-dspark
- Documentacion de LFM2.5-VL-3B: https://docs.liquid.ai/lfm/models/lfm25-vl-3b
- Cobertura externa: https://runtimewire.com/article/liquid-ai-lfm2-5-vl-dspark-vision-inference
