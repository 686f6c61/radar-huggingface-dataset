# Egzakta/Kvark-Sparkle-1.0-27B

## Resumen

Kvark-Sparkle-1.0-27B es un ajuste fino (finetune) del modelo Qwen/Qwen3.8-27B desarrollado por Egzakta, orientado a razonamiento eficiente. El modelo mantiene la arquitectura del base sin cambios, pero se ha entrenado para reducir de forma drastica la cantidad de tokens de razonamiento necesarios para alcanzar niveles de precision comparables, lo que se traduce en una latencia aproximadamente la mitad (mediana de 13,7 s frente a 28,1 s del base segun el autor). Es relevante porque demuestra que es posible recortar el coste de inferencia en modelos con modo "thinking" sin sacrificar precision de forma significativa.

El modelo tiene 27.356.728.560 parametros (27,8B en BF16), una ventana de contexto nativa de 262.144 tokens y una arquitectura hibrida con 64 capas, de las cuales 48 usan atencion lineal y 16 atencion completa. Incluye una cabeza MTP (multi-token prediction) heredada del modelo base que permite decodificacion especulativa. El pipeline declarado es image-text-to-text, con un codificador de vision de 27 capas, aunque los benchmarks publicados se centran en tareas de texto y codigo.

La licencia es Apache 2.0 y los pesos estan disponibles en BF16 (repositorio principal), FP8 para vLLM y GGUF para llama.cpp. El modelo declara soporte unicamente para ingles, lo que limita su uso directo en produccion en castellano sin evaluacion adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido (Qwen3.8-27B sin cambios): 64 capas, 48 de atencion lineal y 16 de atencion completa |
| Parametros totales | 27.356.728.560 (27,8B en BF16) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens nativos; evaluado hasta 64k |
| Tipos de cuantizacion | BF16 (52 GB), FP8 (29 GB), GGUF Q8_0 a IQ4_XS (15,3 a 29,0 GB) |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (BF16 y FP8), GGUF |

Otros datos tecnicos: atencion completa con 24 cabezas de query, 4 cabezas key-value y dimension de cabeza 256; hidden size 5.120; vocabulario de 248.320 tokens; cache KV de 64 KiB por token en BF16 y 32 KiB en FP8 (solo las 16 capas de atencion completa almacenan cache); cabeza MTP de 1 capa para decodificacion especulativa; codificador de vision de 27 capas.

## Arquitectura y entrenamiento

El modelo reutiliza integramente la arquitectura del base Qwen3.8-27B: un transformer hibrido que combina 48 capas de atencion lineal con 16 capas de atencion completa, lo que reduce el coste de cache KV y permite manejar contextos largos con menos memoria. La cabeza MTP de una capa, heredada del base, se emplea para decodificacion especulativa y acelera la generacion. El codificador de vision de 27 capas habilita la entrada de imagenes, coherente con el pipeline image-text-to-text declarado.

El ajuste fino se realizo sobre los datasets zwhe99/DeepMath-103K, allenai/IF_multi_constraints_upto5, m-a-p/SuperGPQA y livecodebench/code_generation_lite, es decir, una mezcla de matematicas, seguimiento de instrucciones con multiples restricciones, preguntas cientificas de nivel avanzado y generacion de codigo. La model card no detalla el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO; esa informacion no esta disponible. La innovacion principal declarada es el entrenamiento para "razonamiento eficiente": reducir los tokens de reasoning manteniendo la precision, con recortes de entre el 60% y el 62% en tokens de razonamiento en GPQA Diamond y AIME segun las cifras del autor.

## Capacidades

- Generacion de texto y razonamiento multi-paso con modo "thinking" activable.
- Razonamiento matematico de competicion (entrenado con DeepMath-103K y evaluado en AIME).
- Generacion de codigo, con resultados declarados en LiveCodeBench.
- Seguimiento estricto de instrucciones con multiples restricciones (IFEval, IF_multi_constraints_upto5).
- Preguntas cientificas de nivel doctorado (GPQA Diamond, SuperGPQA).
- Entrada de imagenes mediante codificador de vision de 27 capas (pipeline image-text-to-text).
- Decodificacion especulativa mediante cabeza MTP para acelerar la inferencia.
- Contexto largo de hasta 262.144 tokens nativos.
- Capacidades multilingues limitadas al ingles segun la model card.
- No se declara soporte explicito de tool calling ni de function calling en la informacion disponible.

## Casos de uso

- Razonamiento matematico asistido: el modelo puede resolver problemas de nivel competicion (AIME) con una mediana de 5.502 tokens de razonamiento, aproximadamente un 62% menos que el base, lo que abarata el coste por consulta en tutoria o verificacion de soluciones.
- Generacion de codigo en pipelines de CI/CD: con pass@1 de 82,7 en LiveCodeBench v6 y soporte de decodificacion especulativa via MTP, es adecuado para tareas de autocompletado y generacion de tests donde la latencia importa.
- Analisis de documentos cientificos: la ventana de 262k tokens permite procesar articulos completos o multiples papers en una sola pasada, y el entrenamiento en SuperGPQA y GPQA aporta capacidad de razonamiento cientifico.
- Agentes de razonamiento con presupuesto de latencia ajustado: la reduccion de tokens de reasoning (hasta un 62% en AIME) lo hace viable en flujos interactivos donde el base seria demasiado lento.
- Procesamiento de imagenes con texto asociado: gracias al codificador de vision, puede emplearse en tareas de image-text-to-text como descripcion, extraccion de informacion o respuesta a preguntas sobre documentos escaneados.
- Evaluacion automatizada de instrucciones complejas: su rendimiento en IFEval (91,3 de precision estricta a nivel de prompt) lo hace util para validar el cumplimiento de restricciones multiples en respuestas generadas.
- Despliegue en hardware de gama alta con cuantizacion: las variantes GGUF (desde 15,3 GB en IQ4_XS) permiten ejecucion local en GPUs consumer con suficiente VRAM para prototipado y pruebas.

## Benchmarks y rendimiento

Resultados declarados por el autor (FP8, thinking on, limite de 64k tokens, temperatura 1.0, top_p 0.95, top_k 20). Las diferencias son pareadas por item con intervalos bootstrap del 95%.

| Benchmark | Precision Sparkle (%) | Precision Qwen3.8-27B (%) | Diferencia | Tokens razonamiento (mediana) Sparkle | Tokens razonamiento (mediana) Qwen | Reduccion |
|---|---|---|---|---|---|---|
| GPQA Diamond (198 items x 5 seeds) | 89,3 | 89,4 | -0,1 [-1,9; +1,8] | 3.122 | 7.854 | -60% |
| AIME 2025 y 2026 (60 problemas x 5 seeds) | 93,3 | 94,0 | -0,7 [-3,3; +2,0] | 5.502 | 14.318 | -62% |
| LiveCodeBench v6 (50 problemas recientes x 3 seeds) | 82,7 | 77,3 | +5,3 | 6.664 | 19.950 | no disponible en el extracto |
| IFEval | 91,3 | 92,4 | no disponible en el extracto | 470 | 714 | no disponible en el extracto |
| MMLU-Pro (subconjunto de 980 items) | 83,3 | 84,0 | no disponible en el extracto | 429 | 727 | no disponible en el extracto |

Segun el autor, la mediana de tiempo de respuesta es de 13,7 s frente a 28,1 s del base. Los resultados no estan verificados de forma independiente (campo `verified: false` en la model-index).

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 52 GB en BF16, 29 GB en FP8 y entre 15,3 y 29,0 GB en las variantes GGUF (IQ4_XS a Q8_0), sin contar cache KV ni overhead.
- Cache KV: 64 KiB por token en BF16 y 32 KiB en FP8, almacenada solo en las 16 capas de atencion completa; a 64k tokens supone aproximadamente 4 GiB en BF16 y 2 GiB en FP8.
- GPU recomendadas: A100 80 GB o H100 para BF16 con contexto largo; A100 40 GB, L40S o RTX 6000 Ada para FP8; RTX 4090 (24 GB) viable con cuantizaciones GGUF de 4-5 bits y contexto moderado.
- Cabe en GPU consumer: si, con cuantizacion GGUF (IQ4_XS, Q4_K_M) en GPUs de 24 GB o mas; en GPUs de 16 GB requeriria cuantizaciones mas agresivas y contexto reducido.
- Opciones de despliegue: vLLM (variante FP8 publicada), llama.cpp (variantes GGUF), transformers; no se mencionan integraciones con TGI u Ollama en la informacion disponible.
- Latencia y throughput: el autor declara una mediana de 13,7 s por respuesta frente a 28,1 s del base en su configuracion de evaluacion; no se publican cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Precision GPQA Diamond | Precision LiveCodeBench | Notas |
|---|---|---|---|---|---|---|
| Kvark-Sparkle-1.0-27B | 27,8B | 262.144 | Apache 2.0 | 89,3 | 82,7 | Finetune eficiente; -60% tokens de razonamiento en GPQA |
| Qwen/Qwen3.8-27B (base) | 27,8B | 262.144 | Apache 2.0 (segun el modelo base) | 89,4 | 77,3 | Modelo base; mayor coste en tokens de razonamiento |
| Alternativas de tamano comparable | no disponible | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos en la informacion proporcionada |

La comparacion directa con el base es la mas relevante: Sparkle mantiene la precision en GPQA Diamond y AIME con una reduccion de tokens de razonamiento del 60-62%, y mejora en LiveCodeBench (+5,3 puntos) a costa de un ligero descenso en IFEval y MMLU-Pro.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card; al derivar de Qwen3.8-27B hereda los sesgos del base, no evaluados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado por el autor; los benchmarks de razonamiento no miden factualidad.
- Limitacion de idioma: solo declara soporte de ingles, lo que restringe su uso en castellano sin evaluacion previa.
- Contexto: aunque el contexto nativo es de 262.144 tokens, el autor solo evaluo hasta 64k; el rendimiento mas alla de ese limite no esta verificado.
- Resultados no verificados: todos los benchmarks tienen `verified: false` y proceden del propio autor, con configuraciones de muestreo concretas; la reproducibilidad independiente no esta confirmada.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.8-27B y de los datasets de entrenamiento.
- Capacidades multimodales: el pipeline declara image-text-to-text, pero no se publican benchmarks de vision, por lo que su rendimiento en tareas visuales es desconocido.
- Tool calling y agentes: no se documenta soporte explicito de function calling, lo que puede limitar su integracion en frameworks de agentes.
- Despliegue: las variantes FP8 y GGUF requieren herramientas especificas (vLLM, llama.cpp) y la cabeza MTP debe soportarse en el runtime para aprovechar la decodificacion especulativa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B
- Variante FP8 para vLLM: https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B-FP8
- Variante GGUF para llama.cpp: https://huggingface.co/Egzakta/Kvark-Sparkle-1.0-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Dataset DeepMath-103K: https://huggingface.co/datasets/zwhe99/DeepMath-103K
- Dataset IF_multi_constraints_upto5: https://huggingface.co/datasets/allenai/IF_multi_constraints_upto5
- Dataset SuperGPQA: https://huggingface.co/datasets/m-a-p/SuperGPQA
- Dataset LiveCodeBench: https://huggingface.co/datasets/livecodebench/code_generation_lite
