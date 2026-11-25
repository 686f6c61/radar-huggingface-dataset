# prithivMLmods/Qwen3.5-9B-Unloop-GGUF

## Resumen

Qwen3.5-9B-Unloop es un modelo multimodal de 9.197 millones de parametros (9.197.093.888 exactamente) desarrollado por OCC AI como un fine-tune de Qwen3.5-9B. Su proposito principal es eliminar los bucles de razonamiento repetitivo que aquejan a los modelos con modo "thinking", reduciendo el desperdicio de tokens de salida sin sacrificar precision. El ajuste se realizo mediante Direct Preference Optimization (DPO) sobre las capas de lenguaje a partir de un adaptador LoRA fusionado, guiado por una metrica propia denominada LoopScore que detecta frases recurrentes adyacentes y no adyacentes.

La version aqui descrita, Qwen3.5-9B-Unloop-GGUF, es la cuantizacion en formato GGUF publicada por prithivMLmods, que anade soporte para Multi-Token Prediction (MTP) con decodificacion especulativa integrada en los propios pesos, eliminando la necesidad de un modelo borrador separado. Conserva intactos el codificador visual, la cabeza MTP y la ventana de contexto de 262.144 tokens del modelo original, y se distribuye bajo licencia Apache 2.0.

El modelo es relevante porque aborda un problema practico y costoso en produccion: los modelos de razonamiento que entran en bucles consumen tokens y latencia de forma descontrolada. Segun la model card, Unloop reduce las respuestas en bucle un 39.5% y los cortes por limite de tokens un 71.5% en prompts de Antidoom-mix, con una reduccion media del 29.2% en tokens de salida en siete benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con cabeza Multi-Token Prediction (MTP); detalles internos de capas no disponibles |
| Parametros totales | 9.197.093.888 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | BF16, Q3_K_L, Q3_K_M, Q4_K_M, Q4_K_S, Q5_K_M, Q5_K_S, Q6_K, Q8_0; proyector multimodal mmproj-bf16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (incluye mmproj-bf16 para vision); pesos BF16 completos disponibles en el modelo base |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-9B, un transformer multimodal con codificador de vision y una cabeza de Multi-Token Prediction que permite decodificacion especulativa sin modelo borrador externo: la propia arquitectura predice varios tokens futuros en un unico forward pass. El fine-tune de OCC AI se aplico exclusivamente sobre las capas de lenguaje mediante un adaptador LoRA fusionado y entrenado con DPO. La innovacion central es LoopScore, una metrica de repeticion que detecta tanto frases recurrentes adyacentes como no adyacentes y trunca las trazas en bucle durante el entrenamiento de preferencias. El objetivo es penalizar la verbosidad ciclica sin necesidad de presence penalty en inferencia.

No se dispone de informacion sobre el volumen de tokens de entrenamiento, la composicion exacta del dataset de preferencias ni la mezcla de datos del modelo base. La model card indica que el ajuste mantiene o mejora ligeramente la precision (74.7 de media frente a 74.2 del base) en siete benchmarks, lo que sugiere que el DPO no degrada las capacidades originales. La cuantizacion GGUF fue realizada con llama.cpp por prithivMLmods.

## Capacidades

- Generacion de texto y razonamiento en modo "thinking" eficiente, con supresion de bucles repetitivos.
- Capacidades multimodales de imagen a texto (pipeline image-text-to-text) gracias al codificador visual y al proyector mmproj-bf16.
- Razonamiento matematico y cientifico (evaluado en MATH-500, AIME 2026 y GPQA Diamond).
- Seguimiento de instrucciones (IFBench) y uso de herramientas (BFCL MT).
- Razonamiento agentico multi-paso y tareas de agente (τ²-bench).
- Decodificacion especulativa integrada via MTP para acelerar la inferencia local.
- Soporte de despliegue en vLLM, Transformers, llama.cpp y Ollama.
- Capacidad multilingue limitada al ingles segun los metadatos del modelo.

## Casos de uso

- Razonamiento en produccion con control de coste: el modelo reduce un 29.2% los tokens de salida de media, lo que abarata pipelines de razonamiento largo donde cada token cuenta.
- Agentes autonomos multi-paso: su buen rendimiento en τ²-bench y BFCL MT y la supresion de bucles lo hacen adecuado para flujos de tool calling encadenados donde un bucle dispararia la latencia y el gasto.
- Asistentes con documentos e imagenes largos: la ventana de 262.144 tokens y el codificador visual permiten procesar capturas, diagramas o PDFs extensos en una sola pasada.
- Despliegue local en estaciones de trabajo: las cuantizaciones Q4_K_M (5.83 GB) y Q5_K_M (6.67 GB) caben en GPUs de consumo, con MTP acelerando la generacion.
- Analisis de datos cientificos y matematicos: evaluado en MATH-500, AIME 2026 y GPQA Diamond, util para resolver problemas paso a paso sin divagar.
- Servicio de atencion al cliente con contexto largo: conversaciones multi-turno extensas dentro de los 262.144 tokens, con menor riesgo de respuestas repetitivas.
- Evaluacion de modelos y benchmarking: como referencia de tecnica anti-bucle para comparar tecnicas de DPO frente a penalizaciones en inferencia.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los agregados de la model card. No se detallan resultados por benchmark individual.

| Metrica | Base (Qwen3.5-9B) | Unloop |
|---|---|---|
| Media en 7 benchmarks (MMLU-Pro, GPQA Diamond, MATH-500, AIME 2026, IFBench, BFCL MT, τ²-bench) | 74.2 | 74.7 |
| Reduccion de respuestas en bucle (Antidoom-mix) | referencia | -39.5% |
| Reduccion de cortes por limite de tokens (Antidoom-mix) | referencia | -71.5% |
| Reduccion media de tokens de salida | referencia | -29.2% |

No se han publicado resultados desglosados por benchmark en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: BF16 requiere aproximadamente 18.4 GB solo para pesos; Q8_0 unos 9.79 GB; Q6_K 7.56 GB; Q5_K_M 6.67 GB; Q4_K_M 5.83 GB; Q3_K_M 4.8 GB. Anadir el proyector visual mmproj-bf16 (922 MB) si se usa vision.
- GPU recomendadas: A100 o H100 para BF16 y contexto completo de 262.144 tokens; RTX 4090 (24 GB) para BF16 o Q8_0; RTX 3090/4080 (16-24 GB) para Q6_K y Q5_K_M.
- Cabe en GPU de consumo: si, en tarjetas de 8 GB o mas con cuantizaciones Q3_K_M o Q4_K_S; en 12-16 GB con Q5_K_M o Q6_K.
- Opciones de despliegue: vLLM, Transformers, llama.cpp y Ollama; la cabeza MTP acelera la inferencia en llama.cpp sin modelo borrador.
- Latencia y throughput: no disponibles; la model card solo indica aceleracion cualitativa por decodificacion especulativa MTP.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| Qwen3.5-9B-Unloop (este) | 9.197 M | 262.144 | Texto + imagen | Apache 2.0 | Anti-bucle via DPO, MTP integrado |
| Qwen3.5-9B (base) | 9.197 M | 262.144 | Texto + imagen | Apache 2.0 (segun modelo base) | Referencia de precision 74.2 vs 74.7 |
| Alternativas de ~9B | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion |

No se dispone de informacion sobre otros modelos comparables mas alla del base del que deriva.

## Limitaciones y advertencias

- Solo soporta ingles segun los metadatos; no se garantiza calidad en castellano ni otros idiomas.
- Riesgo de alucinacion inherente a los modelos de razonamiento; el ajuste anti-bucle no lo elimina.
- El entrenamiento DPO se realizo sobre prompts de Antidoom-mix; el comportamiento en dominios muy distintos puede no reflejar las mismas reducciones de bucle.
- El modelo base es un fine-tune de Qwen3.5-9B de OCC AI; hereda los sesgos y limitaciones del modelo original, no documentados en la informacion disponible.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base original de Qwen.
- Las cuantizaciones bajas (Q3_K_M) degradan la calidad; para produccion se recomienda Q4_K_M o superior.
- La decodificacion especulativa MTP depende del soporte del runtime; no todos los backends la aprovechan igual.
- No se han publicado evaluaciones independientes ni desglose por benchmark.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/prithivMLmods/Qwen3.5-9B-Unloop-GGUF
- Modelo base: https://huggingface.co/occ-ai/Qwen3.5-9B-Unloop
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Pesos BF16: https://huggingface.co/prithivMLmods/Qwen3.5-9B-Unloop-GGUF/blob/main/Qwen3.5-9B-Unloop.BF16.gguf
- Proyector multimodal: https://huggingface.co/prithivMLmods/Qwen3.5-9B-Unloop-GGUF/blob/main/Qwen3.5-9B-Unloop.mmproj-bf16.gguf
