# sairaph-official/Olmo-3-7B-Think-d247f65

## Resumen

Olmo-3-7B-Think es un modelo de razonamiento de 7.298 millones de parámetros desarrollado por el Allen Institute for AI (Ai2) como parte de la familia Olmo 3. Se trata del checkpoint final de la línea Think de 7B, obtenido tras un pipeline de preentrenamiento sobre Dolma 3, ajuste supervisado (Think-SFT), optimización directa de preferencias (Think-DPO) y aprendizaje por refuerzo con verificación (RLVR). Su rasgo distintivo es que razona siempre: el template de Ai2 abre un bloque `` y producir la respuesta.

La ficha que nos ocupa, `sairaph-official/Olmo-3-7B-Think-d247f65`, no es el modelo original en formato PyTorch, sino un espejo (mirror) de los ficheros convertidos a LiteRT-LM (`.litertlm`) por la comunidad `litert-community`, empaquetados para el runtime LiteRT-LM de Google orientado a inferencia en dispositivo (on-device y edge). El repositorio contiene únicamente el fichero `Olmo-3-7B-Think_int4_c2048.litertlm` (4,31 GB), es decir, los pesos cuantizados a int4 con una caché KV de 2.048 tokens, la variante pensada para ejecutarse en teléfonos de gama alta con 12 GB de RAM.

Es relevante ahora porque demuestra que un modelo de razonamiento de 7B con licencia Apache 2.0 puede ejecutarse localmente en hardware móvil, sin depender de la nube, manteniendo la canalización de pensamiento separada de la respuesta visible. La arquitectura es un transformer denso con atención de ventana deslizante en la mayoría de capas, contexto original de 65.536 posiciones (reducido a 2.048 en este fichero) y un vocabulario de 100.278 tokens.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (32 capas, 24 con atención de ventana deslizante de 4.096 y 8 con atención completa) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 65.536 posiciones en el modelo original; 2.048 tokens en el fichero `int4_c2048` de este repositorio |
| Tipos de cuantización | int4 blockwise-32 (OCTAV) en todas las capas lineales con tabla de embeddings int8; existe también una variante int8 de 7,43 GB no incluida en este mirror |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | LiteRT-LM (`.litertlm`) |
| Tamaño del repositorio | 4,3 GB |
| Runtime | LiteRT-LM 0.18.0 (probado); conversión con litert-torch 0.9.4 |
| Hidden size | 4.096 |
| Intermediate size | 11.008 |
| Cabezas de atención / KV | 32 / 32, de 128 dimensiones (MHA sin agrupación) |
| Vocabulario | 100.278 tokens, embeddings no atados |
| RoPE | Theta 500.000 con YaRN (factor 8 sobre 8.192 posiciones originales) en capas de atención completa |
| Fecha de corte de datos | Diciembre de 2024 |

## Arquitectura y entrenamiento

El modelo es un transformer denso de 32 capas con un patrón híbrido de atención: 24 capas usan atención de ventana deslizante con ventana de 4.096 tokens y cada cuarta capa usa atención completa. Emplea QK-norm sobre el ancho completo de la proyección, normalización post-bloque, RoPE con theta 500.000 y YaRN con factor 8 sobre las 8.192 posiciones originales en las capas de atención completa. En los ficheros LiteRT-LM, cada capa mantiene una caché KV de longitud completa de 4.096 posiciones (igual a la ventana deslizante), de modo que las capas deslizantes ven todos los tokens anteriores, replicando el comportamiento del modelo fuente para conversaciones de hasta 4.096 tokens.

El entrenamiento sigue el flujo completo publicado por Ai2: preentrenamiento sobre el dataset Dolma 3, seguido de Think-SFT, Think-DPO y finalmente RLVR (aprendizaje por refuerzo con verificación) hasta llegar a este checkpoint. La familia Olmo 3 se describe en el paper arXiv 2512.13961. El modelo está diseñado para razonar siempre: el template termina el prompt con `<|im_start|>assistant` y un `` antes de responder. No lee ninguna variable `enable_thinking`, por lo que el razonamiento no puede desactivarse. Las recomendaciones de generación de Ai2 son temperatura 0,6, top_p 0,95 y max_tokens 32.768.

## Capacidades

- Generación de texto en inglés con canalización de razonamiento explícita (canal `thought` declarado en el fichero, devuelto por separado del texto de respuesta).
- Razonamiento matemático de varios pasos, con cadenas de pensamiento largas (media de ~1.600 tokens en GSM8K).
- Razonamiento lógico y de sentido común (BBH, GPQA).
- Generación de código y resolución de problemas de programación (HumanEval+, LiveCodeBench).
- Seguimiento de instrucciones (IFEval).
- Conocimiento general y académico (MMLU).
- Ejecución en dispositivo (on-device) mediante el runtime LiteRT-LM, con soporte de GPU y CPU.
- Modo de pensamiento obligatorio: no es posible desactivarlo; un presupuesto positivo cierra el canal al alcanzarlo, pero el modelo continúa razonando en el texto visible.
- No se documentan en la información disponible capacidades de tool calling, function calling, agentes, visión, audio ni multimodalidad.

## Casos de uso

- Asistente de razonamiento local en móvil: el fichero `int4_c2048` está dimensionado para ejecutarse en un teléfono de 12 GB de clase Galaxy S26, construyendo el motor GPU y decodificando a 7,0 tok/s, lo que permite un asistente privado sin conexión para consultas matemáticas y lógicas.
- Tutoría de matemáticas paso a paso: la cadena de pensamiento separada permite mostrar al usuario el razonamiento completo antes de la respuesta final, útil en aplicaciones educativas que necesitan explicar el proceso.
- Verificación de soluciones y problemas de competición: con MATH 95,1 y AIME 2024 71,6, el modelo es adecuado para comprobar y desarrollar soluciones de problemas de nivel avanzado en entornos sin acceso a la nube.
- Asistencia a la programación en el dispositivo: con HumanEval+ 89,9 y LiveCodeBench v3 75,2, puede integrarse en editores o IDE móviles para explicar y generar fragmentos de código, aceptando la latencia de decodificación de unos 35 tok/s en un Mac Studio M4 Max.
- Procesamiento por lotes en estación de trabajo: sobre GPU de escritorio (Mac Studio M4 Max, 34,8 tok/s en el fichero int4), sirve para generar razonamientos largos y filtrar respuestas en pipelines de evaluación o anotación de datos.
- Evaluación de modelos de razonamiento en entornos edge: al ser un artefacto LiteRT-LM reproducible (hashes sha256 publicados), es útil para comparar rendimiento de runtimes y cuantizaciones en hardware móvil.
- Aplicaciones de análisis lógico offline: BBH 86,6 y GPQA 46,2 permiten su uso en herramientas de apoyo a la decisión que deban funcionar sin conectividad, siempre con revisión humana por el riesgo de alucinación.

## Benchmarks y rendimiento

Resultados publicados por Ai2 (tabla de la model card, con sus ajustes de evaluación):

| Benchmark | Olmo-3-7B-Think |
|---|---|
| MATH | 95,1 |
| AIME 2024 | 71,6 |
| AIME 2025 | 64,6 |
| BBH | 86,6 |
| HumanEval+ | 89,9 |
| LiveCodeBench v3 | 75,2 |
| IFEval | 88,2 |
| MMLU | 77,8 |
| GPQA | 46,2 |

Rendimiento de inferencia medido sobre los ficheros LiteRT-LM:

| Plataforma | Fichero | Throughput |
|---|---|---|
| Mac Studio M4 Max (GPU) | int4 | 34,8 tok/s (medido 2026-10-16) |
| Galaxy S26 12 GB (GPU) | int4_c2048 | 7,0 tok/s |
| Galaxy S26 12 GB (GPU) | int4 / int4 de 4.096 tokens | No construye el motor |

No se han publicado en la información disponible resultados comparativos con otros modelos en formato LiteRT-LM.

## Requisitos de hardware

- VRAM/RAM estimada: el fichero int4 ocupa 4,31 GB en disco y requiere al menos ese espacio en memoria más el coste de la caché KV y las activaciones; el fichero int8 ocupa 7,43 GB.
- GPU recomendadas: para el formato LiteRT-LM, GPU integradas Apple (M4 Max validado) y GPU móviles de gama alta (Galaxy S26 de 12 GB validado). Para el modelo original en bf16 se necesitarían aproximadamente 15 GB de VRAM, por lo que encajaría en RTX 4090 (24 GB), A100 (40/80 GB) y H100.
- Cabe en GPU de consumo: sí, la variante int4 en GPUs con 8 GB o más de memoria; la variante int8 requiere unos 8-10 GB.
- Opciones de despliegue: LiteRT-LM (runtime nativo del formato); el modelo original `allenai/Olmo-3-7B-Think` puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF, aunque estos formatos no se incluyen en este repositorio.
- Latencia y throughput: 34,8 tok/s en Mac Studio M4 Max (GPU) y 7,0 tok/s en Galaxy S26 (GPU) con el fichero int4_c2048. Los ficheros con caché de 4.096 tokens no construyen el motor en el móvil de 12 GB.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato edge | Notas |
|---|---|---|---|---|---|
| Olmo-3-7B-Think (este) | 7,3B denso | 65.536 (2.048 en este fichero) | Apache 2.0 | LiteRT-LM int4/int8 | Razonamiento siempre activo; pipeline completo publicado |
| Olmo-3-7B-Instruct | 7B denso | 65.536 | Apache 2.0 | No disponible en la información | Variante sin cadena de pensamiento obligatoria de la misma familia |
| Olmo-3-32B-Think | 32B denso | No disponible | Apache 2.0 | No disponible en la información | Mayor capacidad, no apto para móvil |
| Gemma 3 (variantes pequeñas) | No disponible | No disponible | No disponible | LiteRT-LM | Mismo runtime, familia distinta; sin datos comparativos en la información |

No se dispone de datos de benchmarks comparativos directos entre estos modelos en la información proporcionada.

## Limitaciones y advertencias

- Solo soporta inglés; no se documentan capacidades multilingües.
- El razonamiento no puede desactivarse: `--thinking false` y `--thinking-budget 0` producen la misma salida byte a byte, lo que incrementa latencia y consumo de tokens.
- Las cadenas de pensamiento son largas (~1.600 tokens de media en GSM8K; un tercio de las respuestas del modelo bf16 agotaron el presupuesto de 2.048 tokens), lo que puede truncar respuestas con contextos cortos.
- En este fichero, prompt, pensamiento y respuesta comparten un contexto de solo 2.048 tokens, muy inferior a los 65.536 del modelo original.
- Riesgo de alucinación inherente a los modelos de razonamiento; GPQA de 46,2 indica margen de error considerable en preguntas científicas de nivel experto.
- Sesgos: no se documentan análisis de sesgo específicos en la información disponible; al entrenarse sobre Dolma 3 y Dolci, puede reflejar sesgos de esos corpus.
- Licencia Apache 2.0 permite uso comercial, pero Ai2 la destina a investigación y uso educativo conforme a sus Responsible Use Guidelines.
- El mirror no incluye todos los ficheros que menciona la model card original (solo el int4_c2048); los ficheros int8 e int4 de 4.096 tokens no están en este repositorio.
- Los ficheros de 4.096 tokens de caché no construyen el motor en el Galaxy S26 de 12 GB validado, lo que limita el contexto útil en móvil.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/sairaph-official/Olmo-3-7B-Think-d247f65
- Repositorio upstream LiteRT-LM: https://huggingface.co/litert-community/Olmo-3-7B-Think
- Modelo base: https://huggingface.co/allenai/Olmo-3-7B-Think
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM
- Script de conversión hf-to-litertlm: https://github.com/john-rocky/hf-to-litertlm
- Paper Olmo 3: https://arxiv.org/abs/2512.13961
- Responsible Use Guidelines de Ai2: https://allenai.org/responsible-use
