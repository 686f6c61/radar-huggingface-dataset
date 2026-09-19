# Shockem/Qwen3.8-27b-Terse-Coder

## Resumen

Qwen3.8-27b-Terse-Coder es un fine-tune completo del modelo Qwen/Qwen3.8-27B (27.781.427.952 parametros) publicado por el usuario Shockem. Su proposito es reducir de forma agresiva la longitud de la cadena de razonamiento en tareas de codigo sin degradar sustancialmente la correccion: segun la model card, el modelo gasta aproximadamente una decima parte de los tokens de razonamiento del base (unas 38 frente a unas 701 tokens por problema) manteniendo un pass@1 del 67,5% frente al 72,5% del modelo original en un conjunto de 40 problemas de codigo retenidos.

El artefacto es el resultado de fusionar (merge) en los pesos del base un adaptador DPO de la ronda 7 del estudio del autor, de modo que el comportamiento queda horneado en el checkpoint y no hay que cargar nada adicional en tiempo de ejecucion. Se distribuye como pesos fp16 en safetensors (repo de 55,6 GB) y existe una cuantizacion NVFP4 W4A16 con atencion FP8 que es la ruta de despliegue probada con vLLM 0.28, ademas de un adaptador LoRA equivalente para aplicar el mismo efecto sobre otras bases.

Es relevante ahora porque ataca un problema practico de coste en produccion: los modelos con modo "thinking" consumen gran cantidad de tokens de deliberacion en cada peticion, lo que encarece la inferencia y aumenta la latencia. Este modelo demuestra que es posible recortar ese presupuesto de deliberacion (hasta un 95% en codigo) manteniendo el rendimiento en benchmarks out-of-distribution como GSM8K (98,0%) y GPQA-Diamond (78,3%), y sin perder velocidad de decodificacion especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con modo de razonamiento (thinking) y pila MTP (multi-token prediction) para decodificacion especulativa; no se especifica si el base es MoE |
| Parametros totales | 27.781.427.952 (~27,8 mil millones) |
| Parametros activos | No disponible (no se declara arquitectura de mezcla de expertos) |
| Longitud de contexto | No disponible de forma explicita; el autor documenta servir con contexto limitado a ~200k tokens en 2 GPU de 16 GB con KV cache en FP8 |
| Tipos de cuantizacion | fp16 en el repo principal; NVFP4 W4A16 con atencion FP8 (modelopt 0.45) en la variante de despliegue; adaptador LoRA en repo separado. No se documentan GGUF ni otras cuantizaciones |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fp16, ~52 GB; repo de 55,6 GB) y checkpoint modelopt NVFP4 para vLLM |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base Qwen/Qwen3.8-27B (etiquetado en HuggingFace con los tags `qwen3` y `qwen3_5`), un transformer decoder-only con modo de razonamiento explicito. El checkpoint incluye una pila MTP completa con cabeza de borrador truncada a 40.960 identificadores de vocabulario, que se usa para decodificacion especulativa con verificacion contra el modelo objetivo (por tanto, sin perdida de calidad): el autor reporta una tasa de aceptacion medida de 0,412. El proceso de publicacion fue: fusion del adaptador DPO de la ronda 7 sobre Qwen/Qwen3.8-27B en fp32, almacenamiento en fp16 y posterior cuantizacion con receta estilo NVIDIA (modelopt 0.45 W4A16, atencion FP8, calibracion Local-Hessian ponderada en MLP y lm_head). Segun el autor, la calibracion con Hessian es lo que preserva el efecto completo del adaptador a 4 bits, mientras que la calibracion absmax lo atenua aproximadamente a la mitad.

El entrenamiento se hizo con DPO (TRL 1.13, beta 0,05, learning rate 1e-5 con decaimiento coseno, 3 epocas, batch efectivo 8), partiendo del adaptador de la ronda 6. Los datos son prompts de codigo (HumanEval + MBPP-sanitized, disjuntos del conjunto de evaluacion) con 4 trazas cada uno a temperatura 1,0 generadas por tres politicas distintas (Qwen stock, Signal y heretic-ara), filtradas por ejecucion automatica de tests; las trazas correctas se segmentaron por pasos y se podaron segun la entropia media de tokens por paso, dando lugar a 525 pares DPO del tipo (razonamiento podado, misma respuesta) frente a (razonamiento completo, misma respuesta). El objetivo es, por tanto, una preferencia por respuestas mas concisas sin cambiar la respuesta final.

## Capacidades

- Generacion de codigo: escritura y completado de funciones, con pass@1 del 67,5% en un conjunto mixto de 40 problemas tipo HumanEval/MBPP y 90,2% en HumanEval+ oficial (EvalPlus, greedy).
- Razonamiento con modo thinking: el modelo mantiene la deliberacion y la modula segun la dificultad (en GPQA-Diamond, mediana de 969 tokens de razonamiento y maximo de 16k), pero con un presupuesto mucho menor que el base.
- Matematicas: 98,0% en GSM8K (n=200), un resultado out-of-distribution porque los problemas de matematicas no formaron parte del entrenamiento.
- Comprension de codigo: 92,1% en CRUXEval-I (prediccion de entrada) y 92,9% en CRUXEval-O (prediccion de salida) con el harness oficial de Meta.
- Razonamiento cientifico de nivel experto: 78,3% en GPQA-Diamond completo (198 preguntas).
- Uso en flujos agénticos: el arnes interno de 30 tests del autor (facil/medio/dificil, 10 ejecuciones cada uno) obtuvo 100/100/100 sin truncamientos.
- Decodificacion especulativa MTP integrada: aceptacion de 0,412 y salidas verificadas contra el modelo objetivo (lossless).
- Tool calling / function calling: no documentado de forma explicita en la informacion disponible.
- Capacidades multimodales (vision, audio): no disponibles; el modelo es de texto.
- Capacidades multilingues: no disponible.

## Casos de uso

- Asistentes de codigo en IDE con coste controlado: al gastar unas 38 tokens de razonamiento por problema en lugar de ~701, el coste por sugerencia cae drasticamente y la latencia percibida mejora, manteniendo un pass@1 del 67,5% en problemas variados de HumanEval/MBPP.
- Pipelines de generacion de tests y correccion automatica: la capacidad de prediccion de salida de funciones (CRUXEval-O, 92,9%) permite usarlo para inferir resultados esperados y validar cambios en revisiones de codigo.
- Agentes de refactorizacion multi-paso: con el arnes agéntico interno puntuando 100/100/100 sin truncamientos, es adecuado para tareas encadenadas donde cada paso debe ser breve para no agotar el presupuesto de contexto.
- Servicio de razonamiento cientifico o tecnico en produccion: con 78,3% en GPQA-Diamond y un gasto medio de ~1,5k tokens de razonamiento por pregunta, resulta viable economicamente para respuestas tecnicas de nivel experto sin el coste de 10k-20k tokens tipico de otros modelos pensantes.
- Backend de alta concurrencia con vLLM: el modelo corre a velocidad de decodificacion practicamente identica al base (54,5 frente a 54,1 tok/s wall medidos en la configuracion NVFP4 del autor), lo que permite aumentar el numero de peticiones concurrentes por GPU al reducirse los tokens generados.
- Evaluacion y depuracion de razonamiento: las trazas cortas y deterministas en formato lo convierten en un buen candidato para generar explicaciones legibles en herramientas de ensenanza o de analisis de codigo.
- Sustitucion directa del base en despliegues existentes: al ser un fine-tune completo con la misma familia y licencia Apache 2.0, se puede reemplazar el checkpoint original sin cambios de integracion (salvo la recomendacion de no apilar el adaptador LoRA encima).

## Benchmarks y rendimiento

Resultados en el conjunto retenido de 40 problemas de codigo (20 HumanEval + 20 MBPP-sanitized, disjuntos del entrenamiento), con cuantizacion NVFP4 servida por vLLM 0.28, temperatura 0,6 / top_k 20 / top_p 0,95 / repetition penalty 1,05 y pass@1 medido por ejecucion de tests en contenedor aislado:

| Modelo (servido en NVFP4) | pass@1 | Tokens de razonamiento / problema | Tok/s wall |
|---|---|---|---|
| nvidia/Qwen3.8-27B-NVFP4 (base stock) | 72,5% | ~701 | 54,1 |
| Qwen3.8-27b-Terse-Coder | 67,5% | ~38 (−95%) | 54,5 |

Benchmarks independientes (cuantizacion NVFP4, vLLM 0.28, thinking activado, muestreo propio del autor):

| Benchmark | Puntuacion | Tokens de razonamiento (media / mediana) |
|---|---|---|
| GSM8K (n=200) | 98,0% | 84 / 72 |
| GPQA-Diamond (198 completas) | 78,3% | 1.485 / 969 |
| CRUXEval-I (800, prediccion de entrada) | 92,1% | 197 / 83 |
| CRUXEval-O (800, prediccion de salida) | 92,9% | 146 / 96 |
| HumanEval+ (164, EvalPlus oficial, greedy) | 90,2% (base 93,9%) | 43 / 28 |
| MBPP+ (378, EvalPlus oficial, greedy) | 78,6% (base 92,9%) | 91 / 25 |

Datos adicionales aportados por el autor: tasa de aceptacion MTP de 0,412, arnes agéntico interno de 30 tests con 100/100/100 y cero truncamientos, y advertencia de que apilar el adaptador LoRA sobre este modelo fusionado reduce el pass a 63% con fallos del tipo `no_code`.

## Requisitos de hardware

- VRAM estimada en fp16: el repo ocupa 55,6 GB y el autor indica ~52 GB de pesos, por lo que se necesita al menos una GPU de 80 GB (H100, A100 80 GB) o dos de 40-48 GB para dejar espacio a la cache KV.
- VRAM estimada en NVFP4 W4A16: alrededor de 15-16 GB de pesos, lo que permite ejecucion en GPU consumer; el autor lo probo en 2x RTX 5060 Ti de 16 GB.
- GPU recomendadas: H100 80 GB o A100 80 GB para fp16 sin cuantizar; RTX 4090/5090 (24 GB) o 2x RTX 5060 Ti 16 GB para la variante NVFP4.
- Cabe en GPU consumer: si, en la variante NVFP4, en tarjetas de 24 GB o mas sin limitaciones de contexto y en 2x16 GB con el contexto limitado a ~200k tokens y un pin de KV cache en FP8 de ~3,9 GiB.
- Opciones de despliegue: vLLM 0.28 como ruta probada, con decodificacion especulativa MTP (`--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`) y `--quantization modelopt_fp8 --kv-cache-dtype fp8`. No se documentan recetas para llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Latencia y throughput: 54,5 tok/s wall en la configuracion NVFP4 del autor (frente a 54,1 del base), con aceptacion especulativa de 0,412. No se publican cifras de time-to-first-token.
- Advertencia de configuracion: con decodificacion especulativa activa, la generation config no debe incluir `min_p`, porque vLLM 0.28 lo rechaza en ese modo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en codigo | Tokens de razonamiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27b-Terse-Coder | 27,8B | No disponible (~200k en config de 2x16 GB) | 67,5% pass@1 (40 problemas); HumanEval+ 90,2%; MBPP+ 78,6% | ~38 / problema (−95%) | Apache 2.0 | Pesos fp16 + NVFP4 + adaptador LoRA |
| Qwen/Qwen3.8-27B (base) | 27,8B | No disponible | 72,5% pass@1 (40 problemas); HumanEval+ 93,9%; MBPP+ 92,9% | ~701 / problema | Apache 2.0 (segun el modelo base) | Modelo original de Qwen |
| nvidia/Qwen3.8-27B-NVFP4 | 27,8B | No disponible | 72,5% pass@1 (40 problemas) | ~701 / problema | No disponible en la informacion proporcionada | Cuantizacion NVFP4 mantenida por NVIDIA |
| Shockem/Qwen3.8-27b-Terse-Coder-LoRA | Adaptador sobre 27,8B | El del modelo base sobre el que se apile | Mismo efecto segun el autor | Mismo efecto | Apache 2.0 | Adaptador PEFT para apilar sobre otras bases |

No se han encontrado en la informacion disponible otras alternativas de la misma categoria (fine-tunes orientados a reducir el razonamiento) con las que comparar.

## Limitaciones y advertencias

- Perdida de exactitud en codigo: el pass@1 baja del 72,5% al 67,5% en el conjunto retenido de 40 problemas, y las caidas son mas acusadas en MBPP+ (78,6% frente a 92,9% del base) y HumanEval+ (90,2% frente a 93,9%). Para tareas de codigo exigentes puede no compensar el ahorro de tokens.
- No apilar el adaptador LoRA sobre este checkpoint: el autor advierte que la preferencia ya esta aplicada en los pesos y que una doble aplicacion acorta en exceso el razonamiento, bajando el pass al 63% con fallos de tipo `no_code`.
- Riesgo de alucinacion: no se documenta ninguna evaluacion especifica de veracidad ni de tasa de alucinacion; como cualquier modelo de lenguaje, puede generar codigo o explicaciones plausibles pero incorrectas, especialmente al reducirse el presupuesto de deliberacion.
- Idiomas soportados: no disponibles. La model card solo describe evaluaciones en ingles, por lo que el comportamiento en castellano u otros idiomas no esta caracterizado.
- Longitud de contexto: no se declara de forma explicita. En configuraciones de 2 GPU de 16 GB el autor recomienda limitarla a ~200k tokens; superar ese limite requiere hardware con mas memoria.
- Sesgos: no se proporciona ninguna evaluacion de sesgos, toxicidad o justicia.
- Licencia: Apache 2.0, permisiva para uso comercial, pero al derivar de Qwen/Qwen3.8-27B conviene verificar las condiciones del modelo base antes de un despliegue en produccion.
- Madurez: el autor describe el trabajo como una investigacion activa en curso ("expect updates as the iteration continues"), con 0 descargas y 0 likes en el momento de la consulta; no es un artefacto estable ni ampliamente validado por terceros.
- Los resultados de la model card se obtuvieron con una configuracion concreta (NVFP4, vLLM 0.28, muestreo especifico y MTP activado) y pueden no reproducirse en otros entornos; ademas la model card menciona 3x RTX 5060 Ti en la seccion de resultados y 2x RTX 5060 Ti en la de serving, una inconsistencia que conviene tener en cuenta al reproducir.
- La seccion de caveats de la model card original esta vacia, por lo que no hay advertencias adicionales aportadas por el autor.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder
- Adaptador LoRA con el mismo efecto: https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-LoRA
- Variante cuantizada NVFP4 (ruta de despliegue probada): https://huggingface.co/Shockem/Qwen3.8-27b-Terse-Coder-NVFP4
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Busqueda web: no se han encontrado enlaces relevantes (los resultados devueltos corresponden a sitios no relacionados con el modelo, como organizaciones de danza y centros juveniles checos). No hay paper, blog ni demo adicional documentados en la informacion disponible.
