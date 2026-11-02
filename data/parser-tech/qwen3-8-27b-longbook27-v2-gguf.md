# parser-tech/Qwen3.8-27B-Longbook27-v2-GGUF

## Resumen

parser-tech/Qwen3.8-27B-Longbook27-v2-GGUF es una cuantizacion GGUF experimental del modelo summerAIO/Qwen3.8-27B-Longbook27-v2, un transformer de 27.072.285.696 parametros con arquitectura custom `Qwen35GDN24ForCausalLM` basada en 64 capas Gated DeltaNet. El autor de la cuantizacion, parser-tech, publica un artefacto IQ4_XS calibrado con matrices de compuerta en Q8, orientado especificamente a procesar entradas de 128K tokens en una RTX 3090 de 24 GB. El modelo base conserva la licencia Apache 2.0 y declara soporte para ingles y japones.

La relevancia de esta ficha es doble. Por un lado, documenta una tecnica de cuantizacion mixta (IQ4_XS para la mayoria de pesos, Q5_K, Q6_K, Q8_0 y F32 para tensores sensibles) que permite mantener 128K de contexto en VRAM consumer. Por otro, y de forma igualmente importante, el autor publica de manera explicita los fallos medidos: recuperacion exacta 0/9, campos de comprension tipados 0/12 y errores factuales en todas las respuestas de comprension evaluadas. Se trata, por tanto, de un artefacto de investigacion con calidad de respuesta no validada, no de un modelo listo para produccion.

El modelo requiere un runtime parcheado (no se ha demostrado compatibilidad con llama.cpp stock ni con Ollama) y su publicacion es reciente (noviembre de 2026), con cero descargas en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con 64 capas Gated DeltaNet (clase custom `Qwen35GDN24ForCausalLM`) |
| Parametros totales | 27.072.285.696 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | 128K tokens (medido en runtime con 130.514 tokens de entrada) |
| Tipos de cuantizacion | IQ4_XS (321 tensores), Q5_K (64), Q6_K (1), Q8_0 (128, incluidas todas las proyecciones alpha/beta de GDN), F32 (385) |
| Idiomas soportados | Ingles (en), japones (ja) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (artefacto `longbook-full-calibrated-IQ4_XS-Q8-gates.gguf`, 15.313.096.128 bytes) |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura custom denominada `Qwen35GDN24ForCausalLM` con 64 capas Gated DeltaNet (GDN), un mecanismo recurrente con compuertas que sustituye la atencion tradicional en parte de la red. La conversion a GGUF exporta metadatos recurrentes `qwen35` y omite el modulo MTP (multi-token prediction) ausente en los pesos. El checkpoint cuantizado contiene 899 tensores con nombres y formas verificados, y las 128 matrices de compuerta GDN se mantienen en Q8_0 para preservar su fidelidad numerica.

La cuantizacion se realiza directamente desde BF16 con un cuantizador de llama.cpp parcheado y un buffer de origen de 256 MiB. La calibracion es un punto tecnicamente relevante: las activaciones no provienen del modelo BF16, sino de una version Q4_K_M sin calibrar con compuertas protegidas en Q8. El corpus de calibracion tiene 169.179 tokens (82 fragmentos completos de 2.048 tokens, con 1.243 tokens finales fuera de los fragmentos medidos) e incluye Wikipedia en ingles y japones y conversaciones humanas de OASST1. La cobertura de codigo se declara no establecida y el japones humano aporta solo 5.569 tokens. El autor advierte explicitamente que esta receta mixta no reproduce una receta oficial Unsloth Dynamic ni hereda sus garantias de precision. No se dispone de informacion sobre el numero total de tokens de entrenamiento del modelo base ni sobre si se aplico RLHF o DPO.

## Capacidades

- Generacion de texto conversacional en ingles y japones, con soporte de plantilla de chat (tokens de chat parseados durante la calibracion).
- Procesamiento de contexto largo: el runtime completa entradas de hasta 130.514 tokens en una RTX 3090 de 24 GB.
- Razonamiento basico y respuesta a preguntas cortas, aunque con errores factuales documentados en las pruebas controladas.
- Generacion de codigo: se han observado salidas de Python que fallaron el analisis sintactico y no se ejecutaron; la cobertura de codigo en calibracion no esta establecida.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Modo thinking: las mediciones se realizaron con thinking desactivado; no se documenta su comportamiento con thinking activo.
- Vision y audio: no disponible.

## Casos de uso

- Investigacion de cuantizacion de contexto largo: el artefacto sirve como banco de pruebas reproducible para estudiar como afecta la cuantizacion mixta IQ4_XS/Q8 a tareas de recuperacion en 128K tokens, con logs, hashes de prompts y resumenes JSON publicados por el autor.
- Experimentacion con arquitecturas Gated DeltaNet: util para equipos que quieran evaluar el comportamiento de las 64 capas GDN en inferencia cuantizada sin disponer de hardware de datacenter, dado que cabe en 24 GB de VRAM.
- Pruebas de estres de runtime: permite validar runtimes parcheados de llama.cpp frente a cargas de 128K tokens con mediciones de prefill (1.204-1.234 tokens/s) y decode (34-40 tokens/s) documentadas.
- Generacion de texto conversacional en japones e ingles de baja criticidad: para prototipos donde los errores factuales sean tolerables y se requiera un modelo de 27B con contexto amplio en una sola GPU consumer.
- Reproduccion de evaluaciones controladas: los 17 casos de runtime (nueve de aguja, tres de comprension y cinco cortos) permiten replicar el protocolo del autor y comparar variantes de cuantizacion (IQ4_XS frente a Q5_K_M).
- Docencia y formacion en cuantizacion: el desglose de tipos de tensor, la matriz de importancia con SHA-256 y los fallos documentados constituyen material didactico sobre los limites de la cuantizacion de 4 bits en tareas de retrieval.

## Benchmarks y rendimiento

El autor no publica benchmarks estandar (MMLU, HumanEval, GSM8K). Publica mediciones de runtime y resultados de sondas controladas en RTX 3090 (24.576 MiB, driver 610.88, temperatura 0, batch 128, cuatro hilos de CPU, sin warmup ni repacking).

| Caso (IQ4_XS) | Tokens de entrada | Prefill (tok/s) | Decode (tok/s) | Pico de dispositivo | Tiempo total | Resultado |
|---|---:|---:|---:|---:|---:|---|
| Recuperacion 8K, aguja al 10% | 7.757 | 1.223,9 | 38,6 | 15.421 MiB | 12,172 s | Fallo de recuperacion exacta |
| Comprension 32K | 32.198 | 1.233,6 | 39,9 | 15.444 MiB | 35,032 s | JSON tipado 0/4 |
| Comprension 128K | 130.514 | 1.204,1 | 34,0 | 15.443 MiB | 116,031 s | JSON tipado 0/4; aprobaciones y cantidades erroneas |

Resultados agregados del conjunto completo: recuperacion exacta 0/9 (casos de 8K, 32K y 128K a profundidades del 10%, 50% y 90%), campos de comprension tipados 0/12 y errores factuales en las tres respuestas de comprension. En las cinco sondas cortas, ninguna respuesta cumplio todas las condiciones solicitadas con un presupuesto de 192 tokens (por ejemplo, cinco frases en lugar de tres en la explicacion de cache en japones, o año y evento incorrectos en la pregunta de fecha faltante). El candidato Q5_K_M (19.416.387.008 bytes, pico de 19.507 MiB) obtuvo los mismos 0/9 y 0/12, por lo que mayor precision no mejoro la linea base controlada.

## Requisitos de hardware

- VRAM estimada: aproximadamente 15,4 GB de pico de dispositivo medido para el artefacto IQ4_XS de 15,3 GB en cargas de 8K a 128K tokens.
- VRAM estimada para Q5_K_M: aproximadamente 19,5 GB de pico medido.
- GPU recomendadas: RTX 3090 de 24 GB (plataforma de referencia del autor); por capacidad de memoria, tambien cabria en RTX 4090 (24 GB), A100 40/80 GB, H100 y L40S, aunque no se han publicado mediciones en estas GPU.
- Cabe en GPU consumer: si, en tarjetas de 24 GB como la RTX 3090 o la RTX 4090. No se ha verificado en tarjetas de 16 GB o menos.
- Opciones de despliegue: requiere un runtime llama.cpp parcheado; no se ha demostrado compatibilidad con llama.cpp stock ni con Ollama. No hay informacion sobre vLLM o TGI para este artefacto.
- Latencia y throughput medidos: prefill de 1.204-1.234 tokens/s y decode de 34,0-39,9 tokens/s en RTX 3090; tiempo total de 12,2 s para 8K, 35,0 s para 32K y 116,0 s para 128K, incluyendo carga.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Estado |
|---|---|---|---|---|---|
| parser-tech/Qwen3.8-27B-Longbook27-v2-GGUF (IQ4_XS) | 27,07B | 128K | IQ4_XS/Q8 mixta, 15,3 GB | Apache 2.0 | Experimental, fallos documentados |
| parser-tech/Qwen3.8-27B-Longbook27-v2-GGUF (Q5_K_M) | 27,07B | 128K | Q5_K_M, 19,4 GB | Apache 2.0 | Experimental, mismos fallos |
| summerAIO/Qwen3.8-27B-Longbook27-v2 (base) | 27,07B | no disponible | BF16 | Apache 2.0 | Modelo de origen |
| Otros modelos de ~27B con contexto largo | no disponible | no disponible | no disponible | no disponible | No se dispone de comparativa verificada en la informacion proporcionada |

No se dispone de datos de benchmarks estandar que permitan una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Calidad de respuesta no validada: recuperacion exacta 0/9, campos de comprension tipados 0/12 y errores factuales en todas las respuestas de comprension evaluadas.
- Alucinacion confirmada: en la prueba de 128K el modelo afirmo "aprobado, 10 llegaron y 1 utilizable" cuando los hechos plantados exigian "aprobacion pendiente, 5 llegaron y 3 utilizables".
- Repeticion y errores de formato: se observan respuestas repetitivas y fallos de sintaxis en la generacion de Python (no ejecutada).
- La penalizacion de repeticion recomendada por la fuente no corrigio los fallos factuales.
- Dependencia de runtime parcheado: no se ha demostrado funcionamiento con llama.cpp stock ni con Ollama, lo que complica el despliegue en produccion.
- Cobertura de calibracion limitada: el corpus es pequeno (169.179 tokens), con solo 5.569 tokens de japones humano y cobertura de codigo no establecida.
- Idiomas: solo ingles y japones declarados; el rendimiento en castellano no esta documentado.
- Las mediciones de memoria incluyen actividad de fondo del dispositivo y no aíslan el consumo exclusivo del modelo; no constituyen una comparacion de velocidad entre modelos.
- Los resultados provienen de sondas controladas disenadas por el propio autor, no de un benchmark independiente, y estan ligados a presupuestos de generacion concretos (128 tokens en comprension, 64 en recuperacion).
- Licencia Apache 2.0 permite uso comercial, pero el estado experimental y los fallos documentados desaconsejan cualquier despliegue en produccion sin evaluacion propia.

## Enlaces

- HuggingFace (artefacto cuantizado): https://huggingface.co/parser-tech/Qwen3.8-27B-Longbook27-v2-GGUF
- Modelo base: https://huggingface.co/summerAIO/Qwen3.8-27B-Longbook27-v2
- Revision del modelo base: https://huggingface.co/summerAIO/Qwen3.8-27B-Longbook27-v2/tree/46319430c16af66860b20f14986ad1032e991796
- Paper, blog, repositorio o demo adicionales: no disponible en la informacion proporcionada.
