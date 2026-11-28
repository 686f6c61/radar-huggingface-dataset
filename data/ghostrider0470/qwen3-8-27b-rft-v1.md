# ghostrider0470/Qwen3.8-27B-RFT-v1

## Resumen

Qwen3.8-27B-RFT-v1 es un ajuste fino del modelo vision-lenguaje Qwen3.8-27B de Alibaba, desarrollado por Horizon Tech d.o.o. (Sarajevo, Bosnia y Herzegovina) mediante una ronda de rejection-sampling fine-tuning (RFT). El objetivo no es mejorar la precision del modelo base, sino reducir la longitud del razonamiento manteniendo la misma exactitud: en la mayoria de benchmarks las respuestas correctas requieren entre un 10 % y un 31 % menos de tokens de razonamiento con el modo "thinking" activado.

El modelo conserva la arquitectura y las capacidades del base: entrada de texto e imagenes, salida de texto, con modo de razonamiento opcional y una cabeza de prediccion multi-token (MTP) reentrenada por autodestilacion para decodificacion especulativa. Los pesos se distribuyen en bfloat16 safetensors (18 shards, 52 GB) y el autor publica tambien variantes cuantizadas NVFP4 (20 GB) y MLX 4-bit (14 GB).

Su relevancia practica es directa: al reducir los tokens de razonamiento sin degradar la precision, baja la latencia y el coste por respuesta en despliegues con thinking activado, y sirve como sustituto directo (drop-in) del modelo base en Transformers, vLLM y SGLang con la misma plantilla de chat y los mismos controles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (clase Qwen3_5ForConditionalGeneration), con cabeza MTP |
| Parametros totales | 27.781.427.952 (27,78 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (original), NVFP4 (4-bit), MLX 4-bit |
| Idiomas soportados | los del modelo base; evaluado en ingles y aleman |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bfloat16, 18 shards, 52 GB); NVFP4; MLX 4-bit |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B (revision `1d4bf0f`), un transformer vision-lenguaje de 27,78 mil millones de parametros que acepta texto e imagenes y genera texto, con modo de razonamiento opcional. El ajuste se realizo con un adaptador LoRA de rango 64 y alpha 128, durante 1,5 epocas, con tasa de aprendizaje 1e-4 y secuencias empaquetadas a 32.768 tokens. El adaptador se fusiono en los pesos base en fp32 y se almaceno en bfloat16; la torre de vision no se modifico.

El metodo RFT consistio en que el propio modelo base respondiera a los problemas de entrenamiento, programas automaticos calificaran las respuestas y el modelo se entrenara sobre sus propias respuestas correctas y mas cortas. No se uso modelo profesor ni calificacion escrita por un modelo. La perdida de validacion bajo de 0,283 a 0,234. La cabeza MTP se reentreno por autodestilacion (sin alterar los pesos principales): en 120 documentos reservados acepta 3,15 tokens redactados con 3 borradores y 4,06 con 5, frente a 3,02 y 3,63 de la cabeza copiada del base; son cifras offline, no velocidad de servicio.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" opcional (`enable_thinking=True/False` en la plantilla de chat).
- Entrada de imagenes (image-text-to-text) y salida de texto.
- Razonamiento matematico y resolucion de problemas (GSM8K, MATH-500, AIME 2025).
- Generacion de codigo (HumanEval, MBPP).
- Seguimiento de instrucciones (IFEval).
- Capacidades multilingues heredadas del base; evaluado en ingles y aleman.
- Decodificacion especulativa mediante cabeza MTP reentrenada.
- Soporte de tool calling y comportamiento de agente: no disponible en la informacion proporcionada (el autor indica que el uso y los controles son identicos a los del base, sin detallarlos).

## Casos de uso

- Sustituto directo de Qwen3.8-27B con thinking activado: mismo comportamiento y misma plantilla de chat, pero con un 10-31 % menos de tokens de razonamiento en respuestas correctas, lo que reduce latencia y coste por consulta en produccion.
- Razonamiento matematico en pipelines de evaluacion o tutoria automatica: mantiene el 97,88 % en GSM8K y el 98,40 % en MATH-500 usando 338 y 1.328 tokens de razonamiento respectivamente, adecuado para servir muchas consultas por GPU.
- Generacion y revision de codigo: 95,73 % en HumanEval con un 30 % menos de tokens de razonamiento (1.070 frente a 1.531), util en asistentes de IDE o revisiones automatizadas donde la latencia importa.
- Procesamiento de documentos con imagenes: al conservar la torre de vision intacta, sirve para extraccion y descripcion de contenido visual con razonamiento opcional.
- Atencion al cliente multilingue (ingles/aleman evaluados): el modo sin thinking ofrece respuestas directas con 96,82 % en GSM8K y 97,56 % en HumanEval, adecuado para respuestas de baja latencia.
- Punto de partida para fine-tuning adicional: se distribuye en bfloat16 safetensors compatible con Transformers, vLLM y SGLang, y el adaptador ya esta fusionado, lo que simplifica reentrenamientos posteriores.
- Despliegue en Apple silicon: la variante MLX 4-bit (14 GB, solo texto) permite inferencia local en equipos con memoria unificada limitada.

## Benchmarks y rendimiento

Comparacion pareada contra el modelo base sobre los mismos items (test de McNemar; ninguna diferencia significativa, p minimo 0,12 con thinking activado).

| Benchmark | n | Base, thinking on | RFT v1, thinking on | Base, thinking off | RFT v1, thinking off |
|---|---|---|---|---|---|
| GSM8K | 1319 | 97,95 | 97,88 | 96,59 | 96,82 |
| MMLU-Pro (subconjunto) | 200 | 86,50 | 84,00 | 65,50 | 65,50 |
| MATH-500 | 500 | 98,20 | 98,40 | 97,40 | 98,20 |
| AIME 2025 | 30 | 83,33 | 83,33 | 70,00 | 63,33 |
| HumanEval | 164 | 93,90 | 95,73 | 97,56 | 97,56 |
| MBPP | 500 | 94,20 | 93,80 | 81,00 | 80,80 |
| IFEval | 541 | 89,09 | 90,76 | 82,07 | 81,89 |
| MMLU aleman (subconjunto) | 200 | 83,50 | 86,50 | 80,00 | 81,00 |

Tokens de razonamiento por respuesta correcta, thinking activado:

| Benchmark | Base | RFT v1 | Cambio |
|---|---|---|---|
| GSM8K | 389 | 338 | −13 % |
| MMLU-Pro | 1.702 | 1.179 | −31 % |
| MATH-500 | 1.481 | 1.328 | −10 % |
| AIME 2025 | 9.018 | 8.845 | −2 % |
| HumanEval | 1.531 | 1.070 | −30 % |
| MBPP | 2.885 | 2.603 | −10 % |

El autor advierte que estas cifras provienen de su propio harness y sirven para la comparacion base-vs-RFT, no para comparar con numeros publicados en otros sitios.

## Requisitos de hardware

- VRAM estimada: aproximadamente 52-56 GB en bfloat16 para los pesos (52 GB de safetensors mas overhead de activaciones y cache KV); unos 20 GB en NVFP4; 14 GB en MLX 4-bit.
- GPU recomendadas: A100 80 GB, H100 80 GB o H200 para bfloat16; GPUs NVIDIA con soporte FP4 para la variante NVFP4.
- GPU de consumo: no cabe en RTX 4090 (24 GB) en bfloat16; la variante NVFP4 (20 GB) podria ajustarse en GPUs con soporte FP4, y la MLX 4-bit (14 GB) esta pensada para Apple silicon con memoria unificada.
- Despliegue: Transformers, vLLM (`vllm serve ghostrider0470/Qwen3.8-27B-RFT-v1`), SGLang; la variante MLX para Apple silicon.
- Latencia y throughput: no disponibles como medidas de servicio; solo hay cifras offline de aceptacion de la cabeza MTP (3,15 tokens con 3 borradores y 4,06 con 5).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen3.8-27B-RFT-v1 | 27,78 B | no disponible | Apache 2.0 | safetensors bf16, NVFP4, MLX 4-bit | RFT para acortar razonamiento; misma precision que el base |
| Qwen/Qwen3.8-27B (base) | 27,78 B | no disponible | Apache 2.0 | safetensors | Punto de partida; mas tokens de razonamiento en la mayoria de benchmarks |
| Alternativas de terceros del mismo tamano | no disponible | no disponible | no disponible | no disponible | Sin datos en la informacion proporcionada |

## Limitaciones y advertencias

- No es un modelo mas preciso que el base: varias pruebas estan cerca del techo del base y no pueden mostrar mejora; las diferencias no son estadisticamente significativas.
- Los benchmarks son del harness propio del autor; no deben compararse con cifras publicadas por terceros.
- El numero de respuestas truncadas por limite de tokens no cambio de forma consistente.
- Las cifras de la cabeza MTP son offline y no equivalen a velocidad de servicio real.
- Capacidades de tool calling, agentes y longitud de contexto no estan documentadas en la informacion disponible: verificar contra la model card del base antes de usarlas en produccion.
- Idiomas: solo se evaluaron ingles y aleman; el rendimiento en castellano no esta medido.
- Misma seguridad y mismos limites que el modelo base; no se entreno con datos de usuarios o clientes.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B.
- Sesgos y riesgo de alucinacion: no documentados especificamente; se heredan del base.

## Enlaces

- Hugging Face: https://huggingface.co/ghostrider0470/Qwen3.8-27B-RFT-v1
- Variante NVFP4: https://huggingface.co/ghostrider0470/Qwen3.8-27B-RFT-v1-NVFP4
- Variante MLX 4-bit: https://huggingface.co/ghostrider0470/Qwen3.8-27B-RFT-v1-mlx-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Horizon Tech d.o.o.: https://horizon-tech.io
- ORCID del autor: https://orcid.org/0009-0002-4078-4922
