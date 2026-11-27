# litert-community/Falcon-H1R-7B

## Resumen

Falcon-H1R-7B es un modelo de razonamiento de 7.585.648.736 parámetros desarrollado por el Technology Innovation Institute (TII) de Abu Dabi, construido sobre Falcon-H1-7B-Base mediante ajuste fino supervisado con arranque en frío sobre trazas de razonamiento largas y posterior aprendizaje por refuerzo con GRPO. Su arquitectura es un decodificador causal híbrido que ejecuta en paralelo, sobre la misma entrada, una rama de atención con query agrupada (GQA) y una rama de exploración selectiva Mamba2 en cada una de sus 44 capas. El resultado es un modelo de tamaño 7B con coste de atención reducido en contextos largos, orientado específicamente a tareas que requieren cadenas de razonamiento explícitas.

La ficha que nos ocupa no documenta el checkpoint original de TII, sino la conversión realizada por la comunidad `litert-community` al formato LiteRT-LM (`.litertlm`) para el runtime LiteRT-LM de Google, pensado para ejecución en dispositivo (on-device) y en el borde. Se publican dos ficheros: uno con cuantización int8 dinámica en todas las capas lineales y otro con cuantización int4 por bloques de 32 en las lineales, con proyección de salida y embeddings en int8. La relevancia actual reside en que permite desplegar un modelo de razonamiento de 7B en hardware de consumo y en smartphones de gama alta, algo poco habitual con modelos de esta familia.

El modelo abre de forma autónoma un bloque `` antes de responder, y el runtime declara el canal de pensamiento (`thought`), de modo que la interfaz separa el razonamiento de la respuesta final y permite limitar el presupuesto de pensamiento con `--thinking-budget`. La conversión mantiene el contexto declarado en 4.096 tokens en estos ficheros, muy por debajo de los 256K del checkpoint original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decodificador causal híbrido Transformer + Mamba2 (GQA y Mamba2 en paralelo por capa) |
| Parametros totales | 7.585.648.736 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens en estos ficheros (256K en el checkpoint original de TII) |
| Tipos de cuantizacion | int8 dinámica (lineales) + int8 embeddings; int4 blockwise-32 (lineales) + int8 proyección de salida y embeddings |
| Idiomas soportados | Inglés y multilingüe según TII; lista concreta no disponible |
| Licencia | Falcon-LLM-License (ver términos en falconllm.tii.ae) |
| Formato de pesos | `.litertlm` (LiteRT-LM); int8: 7,81 GB (7.810.236.416 bytes); int4: 4,69 GB (4.689.166.336 bytes) |
| Capas | 44 |
| Tamaño oculto | 3.072 |
| Cabezas de atención | 12 cabezas, 2 cabezas KV (GQA) |
| Cabezas Mamba2 | 24, tamaño de estado 256 |
| Vocabulario | 130.048 tokens, embeddings no atados |
| Precisión de referencia | bf16 (checkpoint original) |

## Arquitectura y entrenamiento

Falcon-H1R-7B emplea una arquitectura híbrida en la que cada una de las 44 capas procesa la misma entrada a través de dos ramas paralelas: una rama de atención con query agrupada (12 cabezas de consulta, 2 cabezas de clave-valor) y una rama Mamba2 de exploración selectiva (24 cabezas, tamaño de estado 256). Esta combinación busca conservar la capacidad de modelado de dependencias de largo alcance de la atención densa mientras se reduce el coste computacional y de memoria asociado a contextos extensos, que es precisamente el cuello de botella de los modelos de razonamiento con trazas largas. El tamaño oculto es de 3.072 y el vocabulario de 130.048 tokens con embeddings no atados.

El entrenamiento, según la descripción de TII recogida en la model card, parte de Falcon-H1-7B-Base y aplica primero un ajuste fino supervisado con arranque en frío sobre trazas de razonamiento largas, seguido de aprendizaje por refuerzo con GRPO. No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases adicionales de preferencia (DPO). La conversión a LiteRT-LM se realizó con `litert-torch` (commit 115a136 con el parche específico de Falcon-H1) y se probó con `litert-lm` 0.18.0. La receta de cuantización int4 aplica bloques de 32 con escalas de bloque con suelo en 2^-14, mientras que la convolución y el escaneo de Mamba permanecen en coma flotante y las activaciones de GPU se declaran en fp32.

## Capacidades

- Generación de texto con razonamiento explícito: abre un bloque `` de forma autónoma antes de emitir la respuesta, y el runtime separa ambos canales.
- Control del presupuesto de razonamiento mediante `--thinking-budget`; con presupuestos cortos el razonamiento se trunca a mitad de frase y la respuesta se emite igualmente (con 64 tokens respondió 481 a 17 × 23).
- Razonamiento aritmético y multietapa: verificado con preguntas de multiplicación y con una prueba de ocho preguntas en la que ambas cuantizaciones obtuvieron 8/8.
- Conversación multiturno: se probó una conversación de tres turnos con memoria del nombre y cálculo aritmético, con todos los pensamientos cerrados.
- Capacidades multilingües declaradas por TII (inglés y multilingüe); el conjunto concreto de idiomas no está disponible.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes: no disponible en la información proporcionada.
- Capacidades de visión o audio: no disponibles en esta conversión (modelo de texto).

## Casos de uso

- Razonamiento matemático en dispositivo: el modelo resuelve operaciones aritméticas con traza explícita y obtuvo 96/98 sobre 100 en GSM8K con presupuesto de 2.048 tokens en las versiones int8/int4, lo que permite integrarlo en aplicaciones de cálculo asistido sin conexión.
- Asistentes locales en smartphone de gama alta: la versión int4 (4,69 GB) está pensada para ejecutarse mediante el motor GPU/CPU de LiteRT-LM en dispositivos como Galaxy S26, aunque en las pruebas el motor GPU no compiló y la ejecución se detuvo por la regla de memoria del autor.
- Aplicaciones de escritorio en hardware Apple Silicon: en un Mac Studio M4 Max la versión int4 decodifica a 39,7 tok/s en GPU y la int8 a 35,9 tok/s, adecuado para asistentes de escritorio con razonamiento visible.
- Procesamiento por lotes en CPU: la versión int8 es más rápida en CPU (29,65 s para prefill de 1.024 tokens más 256 decodificados) que la int4 (37,72 s), útil en servidores sin GPU dedicada.
- Educación y tutoría paso a paso: el canal `thought` separado permite mostrar al usuario el razonamiento y la respuesta por separado, con control del presupuesto para adaptar la profundidad al nivel del estudiante.
- Verificación y depuración de pipelines de cuantización: los informes de delegación completa de firmas (7.035 y 4.109 operaciones) y las comprobaciones de longitud de prompt sirven como referencia para validar conversiones propias a LiteRT-LM.
- Prototipado de agentes con razonamiento acotado: el parámetro `--thinking-budget` permite fijar un coste máximo de cómputo por consulta, lo que facilita presupuestar latencia en productos con SLA estrictos.

## Benchmarks y rendimiento

| Prueba | int8 | int4 | bf16 (referencia) |
|---|---|---|---|
| GSM8K, presupuesto 2.048 tokens (sobre 100) | 96 | 98 | 21/21 en las 21 primeras preguntas |
| Verificación de 8 preguntas (Mac M4 Max) | 8/8 CPU y GPU | 8/8 CPU y GPU | 8/8 |
| Comprobación de longitud de prompt (17 longitudes) | 17/17 CPU, 16/17 GPU | 16/17 CPU, 17/17 GPU | no disponible |
| Multiplicaciones (6 preguntas × 3 ejecuciones) | no disponible | no disponible | no disponible |

| Métrica de rendimiento | Mac M4 Max | Galaxy S26 | Pixel 8a |
|---|---|---|---|
| Decodificación int4 en GPU | 39,7 tok/s | motor GPU no compila | detenido por regla de memoria |
| Decodificación int8 en GPU | 35,9 tok/s | no ejecutado | no ejecutado |
| Prefill 1.024 + 256 decodificados, int4 GPU | 8,26 s | no disponible | no disponible |
| Prefill 1.024 + 256 decodificados, int8 GPU | 8,95 s | no disponible | no disponible |
| Prefill 1.024 + 256 decodificados, int8 CPU | 29,65 s | no disponible | no disponible |
| Prefill 1.024 + 256 decodificados, int4 CPU | 37,72 s | no disponible | no disponible |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, etc.) en la información disponible.

## Requisitos de hardware

- VRAM/almacenamiento: el fichero int8 ocupa 7,81 GB y el int4 4,69 GB; ambos son una única sección TFLite (7,27 GiB y 4,36 GiB respectivamente, con la tabla de embeddings incluida).
- GPU recomendadas: Apple Silicon (Mac Studio M4 Max probado, con delegación completa de las 7 firmas al delegado GPU); GPU OpenCL en Galaxy S26 (delegación completa registrada antes de la caída); no se documentan pruebas en A100, H100 ni RTX 4090.
- GPU de consumo: el modelo no cabe en GPUs de consumo con menos de 8 GB para la variante int8; la int4 requiere al menos ~5 GB libres. No hay datos de ejecución en RTX 4090 en la información disponible.
- Smartphones: la int4 se detuvo por la regla de memoria del autor en Pixel 8a y el motor GPU no compiló en Galaxy S26; en iOS no se midió porque cada fichero supera el límite de ~2 GiB por sección única. El miembro de la familia que sí cabe en iPhone es el modelo de 0,6B.
- Opciones de despliegue: runtime LiteRT-LM (versión 0.18.0 probada; 0.17.1 solo con el fichero int8 y una única ejecución), conversión mediante `litert-torch`. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: ver tabla de benchmarks; en Mac M4 Max la int4 es un 7,7 % más rápida que la int8 en GPU, mientras que en CPU la int8 es más rápida porque el prefill blockwise de la int4 rinde al 44 % del de la int8.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Falcon-H1R-7B (esta conversión) | 7,59B | 4.096 (256K en original) | `.litertlm` int8/int4 | Falcon-LLM-License | Hugging Face, 523 descargas |
| Falcon-H1-3B-Instruct (litert-community) | 3B (no confirmado) | no disponible | `.litertlm` | Falcon-LLM-License | Hugging Face |
| Falcon-H1-Tiny-R-0.6B (litert-community) | 0,6B | no disponible | `.litertlm` | Falcon-LLM-License | Hugging Face; único que cabe en iPhone |
| Ministral-3-3B-Instruct-2512 (litert-community) | 3B (no confirmado) | no disponible | `.litertlm` | no disponible | Hugging Face |

La información disponible no incluye comparativas de rendimiento frente a modelos de otros autores con el mismo tamaño o tarea; los datos de benchmarks solo cubren las variantes int8, int4 y bf16 del propio Falcon-H1R-7B.

## Limitaciones y advertencias

- Contexto efectivo limitado a 4.096 tokens en estos ficheros, frente a los 256K del checkpoint original; las tareas que requieran ventanas largas deben usar el checkpoint de TII.
- El razonamiento truncado por `--thinking-budget` no se completa: se corta a mitad de frase y la respuesta se emite igualmente, lo que puede degradar la calidad en problemas complejos.
- Se observaron fallos de robustez en la comprobación de longitud de prompt: en algunas ejecuciones el modelo cita palabras de relleno del prompt ("well well…") y repite "well" hasta el tope de 512 tokens (longitud 41 en 3 de 3 ejecuciones con int4; longitud 43 una vez con int8).
- En Galaxy S26 el motor GPU no compiló y en Pixel 8a la ejecución se detuvo por la regla de memoria del autor; el despliegue en Android de gama media no está validado.
- En iOS no es viable por el límite de ~2 GiB por sección única de TFLite; solo el modelo de 0,6B de la familia cabe en iPhone.
- La licencia Falcon-LLM-License impone términos específicos de uso comercial; deben revisarse en falconllm.tii.ae antes de producción.
- Sesgos conocidos: no documentados en la información disponible; al ser un modelo entrenado principalmente en inglés, el rendimiento en otros idiomas puede ser inferior.
- Riesgo de alucinación: no cuantificado en la información disponible; como modelo de razonamiento con trazas largas, el riesgo aumenta si el presupuesto de pensamiento es insuficiente.
- La prueba en `litert-lm` 0.17.1 se limitó a una única ejecución del fichero int8; la versión recomendada es 0.18.0.
- El repositorio ocupa 25,0 GB, muy superior a la suma de los dos ficheros, por lo que la descarga completa no es necesaria si solo se usa una variante.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/litert-community/Falcon-H1R-7B
- Modelo base original: https://huggingface.co/tiiuae/Falcon-H1R-7B
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Términos de licencia Falcon: https://falconllm.tii.ae/falcon-terms-and-conditions.html
- Script de verificación de calidad: https://github.com/john-rocky/hf-to-litertlm/blob/main/scripts/verify_quality.py
- Conversión Falcon-H1-3B-Instruct: https://huggingface.co/litert-community/Falcon-H1-3B-Instruct
- Conversión Falcon-H1-Tiny-R-0.6B: https://huggingface.co/litert-community/Falcon-H1-Tiny-R-0.6B
- Conversión Ministral-3-3B-Instruct-2512: https://huggingface.co/litert-community/Ministral-3-3B-Instruct-2512
