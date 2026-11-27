# noman-asif/Gemma-4-E4B-Arabic-It

## Resumen

Gemma-4-E4B-Arabic-It es un ajuste fino del modelo multimodal google/gemma-4-E4B-it, desarrollado por el usuario noman-asif, orientado a mejorar el rendimiento en arabe manteniendo las capacidades originales del modelo base. Se trata de un modelo denso de aproximadamente 8.000 millones de parametros totales, del que se activan unos 4.000 millones por token segun los datos de despliegue del autor, con soporte de entrada imagen-texto y generacion de texto. El modelo se distribuye bajo licencia Apache 2.0 y esta pensado para conversacion, generacion de texto y razonamiento en arabe e ingles.

El problema que aborda es la brecha de rendimiento entre el modelo base y las variantes ajustadas en arabe: el autor publica una comparativa con su variante MoE insignia (26B-A4B) mostrando ganancias medias de +0,22 puntos en benchmarks arabes para esta version densa. La relevancia actual radica en que ofrece una alternativa de menor huella de memoria (14,9 GB de pesos en bfloat16) capaz de servir hasta 50 usuarios concurrentes en una unica A100 de 80 GB con vLLM, segun los datos de despliegue incluidos en la model card.

El modelo se publico en noviembre de 2026 y acumula 2.024 descargas y 2 likes en Hugging Face. Incluye un aviso explicito de "Retention-Safe Release" y una puerta de control de olvido catastrofico (zero-forgetting gate) que, en esta variante E4B, aparece como FAILED con una puntuacion de 0,8430, lo que constituye una advertencia importante para su uso en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (image-text-to-text), base google/gemma-4-E4B-it |
| Parametros totales | 7.996.156.490 (aprox. 8,0 B) |
| Parametros activos | Aprox. 4,0 B por token (modelo denso; el dato de "activos" proviene de la tabla de despliegue del autor) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors; el autor reporta despliegue en bfloat16) |
| Idiomas soportados | Arabe (ar), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de google/gemma-4-E4B-it, un transformer denso multimodal con capacidad de entrada imagen-texto y salida de texto. La variante ajustada mantiene la arquitectura del base y aplica un ajuste fino supervisado sobre el dataset noman-asif/Arabic-Reasoning-Instruct-30k, seguido de un ajuste por preferencias con DPO sobre noman-asif/Arabic-Preference-DPO-6k. La model card menciona que el modelo base emplea atencion de ventana deslizante (SWA) de 1024 tokens en 25 de sus 30 capas, con 8 cabezas KV en GQA, lo que explica la baja huella de cache KV en despliegue multiusuario.

El autor publica una comparativa con la variante MoE 26B-A4B del mismo linaje, que activa 3,8 B de parametros por token. En esa comparativa se reporta que la version E4B obtiene una ganancia media en arabe de +0,22 puntos frente al base, mientras que la 26B-A4B logra +0,23. La puerta de control de olvido catastrofico (zero-forgetting gate) supera el umbral en la variante 26B-A4B (0,9940) pero falla en la E4B (0,8430), lo que indica una perdida de capacidades del modelo base mas acusada en esta version densa. No se detalla en la informacion disponible el numero total de tokens de entrenamiento ni la composicion exacta del dataset.

## Capacidades

- Generacion de texto conversacional en arabe e ingles.
- Razonamiento y respuesta a preguntas de conocimiento general y especializado (evaluado en ArabicMMLU, MadinahQA, AlGhafa, EXAMS-AR, AraTrust, MMLU-ProX-Ar, MMMLU-Ar-STEM y MMMLU-Ar-Law-Prof).
- Entrada multimodal imagen-texto, heredada del modelo base gemma-4-E4B-it.
- Modo de razonamiento extendido (thinking mode), segun los anclajes de retencion oficiales de Gemma 4 reportados por el autor.
- Generacion de codigo (evaluado en LiveCodeBench-v6).
- Razonamiento matematico de competicion (evaluado en AIME-2026).
- Razonamiento cientifico de nivel graduado (evaluado en GPQA-Diamond).
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades de audio: no disponible en la informacion proporcionada.

## Casos de uso

- Atencion al cliente en arabe: el modelo puede gestionar conversaciones multi-turno en arabe estandar con un rendimiento de 67,51 % en ArabicMMLU y 66,94 % en MadinahQA, adecuado para asistentes de soporte de dominio general. Su despliegue en vLLM permite servir hasta 50 usuarios concurrentes en una A100 de 80 GB con 81,5 tokens/s por usuario.
- Asistencia educativa y tutoria: con un 56,05 % en EXAMS-AR y 82,38 % en MMMLU-Ar-STEM, puede emplearse como generador de explicaciones y respuestas a preguntas de examen, siempre con supervision humana dada la tasa de error.
- Procesamiento de documentos e imagenes en arabe: la capacidad image-text-to-text del modelo base permite extraer y resumir informacion de capturas, formularios o diagramas acompanados de texto en arabe.
- Generacion de codigo asistida en entornos bilingues: con un 52,00 % en LiveCodeBench-v6, es util para autocompletado, explicacion de fragmentos y generacion de pruebas en proyectos con documentacion en arabe e ingles.
- Clasificacion y moderacion de contenido en arabe: su rendimiento en AraTrust (87,74 %) lo hace apto para tareas de verificacion de veracidad y filtrado, integrado en pipelines de moderacion con revision humana.
- Razonamiento cientifico y legal de apoyo: con 73,95 % en MMMLU-Ar-Law-Prof y 57,07 % en GPQA-Diamond, puede asistir en la primera pasada de analisis de textos legales o cientificos en arabe, dejando la validacion final a expertos.
- Despliegue en infraestructura limitada: con 14,9 GB de pesos en bfloat16 y 20,0 GB de VRAM total a 50 usuarios concurrentes, es viable en una unica GPU de 80 GB o en GPUs consumer de gama alta con cuantizacion, aunque el autor no publica variantes cuantizadas.

## Benchmarks y rendimiento

Resultados publicados por el autor en OALL v2 (dataset completo) y anclajes oficiales de retencion de Gemma 4 con thinking mode activado. Se comparan el modelo base y el ajustado en arabe para la variante E4B.

| Benchmark | Metrica | Shots | Base (%) | Ajustado (%) | Delta (pts) |
|---|---|---|---|---|---|
| ArabicMMLU | acc_norm | 0 | 66,87 | 67,51 | +0,64 |
| MadinahQA | acc_norm | 0 | 64,96 | 66,94 | +1,98 |
| AlGhafa | acc_norm | 0 | 74,38 | 74,44 | +0,06 |
| ACVA | acc_norm | 5 | 81,86 | 82,12 | +0,26 |
| EXAMS-AR | acc_norm | 0 | 55,68 | 56,05 | +0,37 |
| AraTrust | acc_norm | 0 | 87,11 | 87,74 | +0,63 |
| MMLU-ProX-Ar | exact_match | 5 | 64,46 | 64,46 | 0,00 |
| MMMLU-Ar-STEM | accuracy | 0 | 84,13 | 82,38 | -1,75 |
| MMMLU-Ar-Law-Prof | accuracy | 0 | 74,20 | 73,95 | -0,25 |
| MMLU-Pro | english_reasoning | 5 | 69,54 | 69,77 | +0,23 |
| GPQA-Diamond | graduate_science | 0 | 60,61 | 57,07 | -3,54 |
| AIME-2026 | competition_math | 0 | 58,33 | 49,17 | -9,16 |
| LiveCodeBench-v6 | code_generation | 0 | 53,14 | 52,00 | -1,14 |

Rendimiento de servicio con vLLM en 1x A100 80 GB PCIe (512 tokens de prompt en arabe, 256 tokens generados, bfloat16):

| Usuarios concurrentes | TTFT mediana (ms) | TTFT P95 (ms) | Velocidad por usuario (tok/s) | Throughput total (tok/s) | VRAM activa (GB) |
|---|---|---|---|---|---|
| 1 | 30,5 | 31,1 | 99,6 | 99,6 | 16,1 |
| 10 | 233,2 | 233,3 | 102,1 | 1.020,8 | 16,8 |
| 30 | 665,7 | 667,6 | 92,7 | 2.780,3 | 18,4 |
| 40 | 865,9 | 868,1 | 87,3 | 3.492,8 | 19,2 |
| 50 | 1.079,0 | 1.079,2 | 81,5 | 4.076,1 | 20,0 |

## Requisitos de hardware

- VRAM estimada para inferencia: 14,9 GB solo para pesos en bfloat16; 16,1 GB en total con 1 usuario y 1,2 GB de cache KV y runtime; 20,0 GB con 50 usuarios concurrentes (segun el autor).
- GPU recomendadas: NVIDIA A100 80 GB PCIe para el escenario multiusuario reportado (tensor_parallel_size=1). Para uso individual, cualquier GPU con al menos 16-20 GB de VRAM en bfloat16.
- Compatibilidad con GPU consumer: cabe en GPUs de 24 GB o mas (por ejemplo, RTX 3090 o RTX 4090) para un solo usuario en bfloat16; no se han publicado datos de cuantizacion para GPUs de 8-16 GB.
- Opciones de despliegue: vLLM (PagedAttention y continuous batching, segun la model card); compatible con la libreria transformers. No se mencionan llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: TTFT mediana de 30,5 ms con 1 usuario y 1.079,0 ms con 50 usuarios; throughput agregado de 99,6 tok/s a 4.076,1 tok/s segun la carga concurrente.

## Comparativa con modelos similares

| Modelo | Parametros | Activos por token | Contexto | Licencia | Rendimiento arabe (ArabicMMLU) | Notas |
|---|---|---|---|---|---|---|
| Gemma-4-E4B-Arabic-It | 8,0 B | ~4,0 B | No disponible | Apache 2.0 | 67,51 % | Ajuste fino en arabe; gate de olvido FAILED (0,8430) |
| Gemma-4-26B-A4B-Arabic-It | No disponible | 3,8 B (MoE) | No disponible | No disponible | 76,81 % | Variante MoE del mismo autor; gate de olvido PASSED (0,9940) |
| google/gemma-4-E4B-it (base) | 8,0 B | ~4,0 B | No disponible | No disponible | 66,87 % | Modelo base sin ajuste en arabe |

## Limitaciones y advertencias

- Olvido catastrofico: la puerta de control de olvido del autor falla en esta variante (0,8430), lo que indica una degradacion de capacidades del modelo base. En concreto, se observa una caida de -9,16 puntos en AIME-2026, -3,54 en GPQA-Diamond y -1,75 en MMMLU-Ar-STEM respecto al base.
- Riesgo de alucinacion: no se han publicado evaluaciones especificas de veracidad mas alla de AraTrust (87,74 %), insuficientes para garantizar fiabilidad en dominios especializados.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Limitaciones de contexto: la longitud de contexto no se especifica en la model card; el autor menciona atencion de ventana deslizante de 1024 tokens en 25 de las 30 capas del modelo base, lo que condiciona el rendimiento en contextos largos.
- Limitaciones de idioma: el ajuste esta orientado a arabe e ingles; el rendimiento en otras lenguas no esta documentado y podria haberse degradado.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero se desconoce si el modelo base google/gemma-4-E4B-it impone condiciones adicionales; conviene verificar la licencia del base.
- Caveat para produccion: el autor etiqueta la release como "Retention-Safe" pese al fallo del gate de olvido en la variante E4B; no se recomienda su sustitucion directa del modelo base en tareas de razonamiento matematico o cientifico sin evaluacion previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/noman-asif/Gemma-4-E4B-Arabic-It
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Dataset de instrucciones: https://huggingface.co/datasets/noman-asif/Arabic-Reasoning-Instruct-30k
- Dataset de preferencias DPO: https://huggingface.co/datasets/noman-asif/Arabic-Preference-DPO-6k
