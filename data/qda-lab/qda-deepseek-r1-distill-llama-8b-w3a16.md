# qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W3A16

## Resumen

QDA-DeepSeek-R1-Distill-Llama-8B-W3A16 es una cuantización de 3 bits de los pesos del modelo deepseek-ai/DeepSeek-R1-Distill-Llama-8B, publicada por el laboratorio qda-lab. El modelo base es un transformer denso de 8.030 millones de parámetros derivado de Llama, destilado por DeepSeek a partir de su familia R1 para tareas de razonamiento. Esta versión reduce el peso de 16,1 GB en BF16 a 4,1 GB, un factor de compresión de 4,0x, manteniendo según el autor el 86,5% de la precisión del modelo original.

La relevancia de esta ficha reside en que permite ejecutar un modelo de razonamiento con modo de pensamiento (thinking mode) en hardware mucho más modesto, a costa de una degradación medible en benchmarks de matemáticas, ciencia y código. El formato de cuantización W3A16 (pesos de 3 bits, activaciones de 16 bits) se implementa mediante compressed-tensors y solo es compatible con vLLM en el momento de publicación, no con SGLang.

La model card documenta con detalle el proceso de construcción (GPTQ sobre una copia rotada del modelo, ajuste fino de escalas por destilación) y los datos de calibración, lo que facilita la reproducibilidad. La licencia declarada es MIT, aunque los datos de calibración proceden de fuentes con licencias más restrictivas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (derivado de Llama, destilado de DeepSeek-R1) |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Llama 8B suele soportar 128K, pero no se confirma aqui) |
| Tipos de cuantizacion | W3A16: pesos int3 en grupos de 128, activaciones 16 bits; cabeza de salida int4 en grupos de 64; embeddings en BF16 |
| Idiomas soportados | no disponibles |
| Licencia | MIT |
| Formato de pesos | safetensors (compressed-tensors), compatible con transformers y vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de la familia Llama con 8.030 millones de parámetros, destilado por DeepSeek a partir de su modelo R1 para conservar capacidades de razonamiento paso a paso (thinking mode). Esta versión no modifica la arquitectura: aplica cuantización GPTQ de 3 bits sobre una copia rotada del modelo, de forma que la rotación queda plegada en los pesos y no requiere transformación en tiempo de ejecución. GPTQ pondera cada token de calibración por el cuadrado del gradiente de salida.

El proceso de construcción incluye un ajuste fino de las escalas de grupo durante 300 pasos mediante destilación desde el modelo BF16. Los datos de calibración (`calib_mix.jsonl`, 3.927 filas) combinan conversaciones del pool `qda-calibration-pools` renderizadas en la plantilla de chat del modelo, más 1.913 respuestas completas generadas por el modelo base. Los datos de destilación (`kd_mix.jsonl`, 3.616 filas) contienen esas respuestas y 1.703 adicionales generadas por un checkpoint cuantizado intermedio, con el BF16 como objetivo de destilación. Los prompts provienen de NuminaMath-CoT, code_contests, ARC, ultrachat_200k y aya_dataset.

## Capacidades

- Generación de texto y razonamiento multi-paso con modo de pensamiento explícito (thinking mode, cierre en `</think>`).
- Razonamiento matemático y científico: evaluado en AIME 2025, HMMT Feb 2026 y GPQA-Diamond.
- Generación de código: evaluado en LiveCodeBench.
- Seguimiento de instrucciones: evaluado en IFEval.
- Conocimiento general y razonamiento experto: evaluado en MMLU-Pro.
- Conversación multi-turno mediante plantilla de chat (pipeline text-generation, tag conversational).
- Compatibilidad con vLLM y text-generation-inference según los tags del repositorio (aunque la model card solo detalla el despliegue en vLLM).
- Capacidades multilingües: no confirmadas explícitamente; los datos de calibración incluyen 128 turnos de usuario multilingües, pero no se especifica qué idiomas.
- Tool calling / function calling: no documentado en la información disponible.
- Soporte de agentes: no documentado en la información disponible.

## Casos de uso

- Razonamiento matemático asistido en entornos con GPU limitada: el modelo conserva 28,9 en AIME 2025 frente a 33,6 del BF16, lo que permite usarlo para tutoría o verificación de problemas cuando no hay VRAM para la versión completa.
- Generación de código en pipelines de CI/CD: con 32,2 en LiveCodeBench, puede integrarse en revisiones automáticas o generación de tests donde el coste por token importa más que la precisión máxima.
- Despliegue en GPUs de consumo o profesionales (L40S, RTX Pro 6000): el peso de 4,1 GB permite servir el modelo en una sola GPU con margen para el KV cache, algo inviable con los 16,1 GB en BF16.
- Evaluación comparativa de cuantizaciones: sirve como referencia reproducible (receta, datos y hashes publicados) para estudiar la degradación de modelos de razonamiento al bajar a 3 bits.
- Asistente conversacional con razonamiento visible: el modo thinking permite mostrar la cadena de razonamiento al usuario en aplicaciones educativas o de depuración.
- Procesamiento por lotes de preguntas científicas (GPQA-Diamond, 42,3): adecuado para clasificación o respuesta a preguntas técnicas donde se prioriza el throughput sobre la exactitud punta.
- Investigación sobre destilación y cuantización: la model card detalla el pipeline completo (GPTQ, rotación, ajuste de escalas por destilación), útil para replicar o extender el método.

## Benchmarks y rendimiento

Resultados publicados por el autor (thinking mode, pass@1 promediado sobre 1–32 semillas, 32.768 tokens nuevos máximos, temperatura 0,6, top-p 0,95):

| Benchmark | BF16 (16,1 GB) | QDA W3A16 (4,1 GB) |
|---|---|---|
| AIME 2025 | 33,6 | 28,9 |
| HMMT Feb 2026 | 24,9 | 20,2 |
| GPQA-Diamond | 48,7 | 42,3 |
| IFEval | 63,4 | 59,0 |
| MMLU-Pro | 49,4 | 40,9 |
| LiveCodeBench | 38,3 | 32,2 |
| Media | 43,0 | 37,2 |

La mayor degradación se observa en MMLU-Pro (8,5 puntos) y la menor en IFEval (4,4 puntos). El autor indica que MMLU-Pro se extrajo con las reglas lenient oficiales porque el modelo no sigue el formato de respuesta estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,1 GB solo para pesos; hay que añadir el KV cache (no cuantizado) y overhead de vLLM, por lo que en la práctica se recomienda al menos 8–12 GB según longitud de contexto y batch.
- GPUs soportadas según el autor: NVIDIA H100, A100, L40S, RTX Pro 6000 y B200.
- Cabe en GPUs de consumo con suficiente VRAM (por ejemplo, RTX 4090 de 24 GB), aunque el autor no lo confirma explícitamente; el kernel W3A16 requiere toolchain CUDA 13 o las librerías NVIDIA del venv en `LD_LIBRARY_PATH`.
- Opciones de despliegue: vLLM exclusivamente (`VLLM_DISABLED_KERNELS=MacheteLinearKernel vllm serve ...`). SGLang no soporta aún este formato de 3 bits. No se menciona soporte de llama.cpp, Ollama ni TGI en la model card.
- Latencia y throughput: no disponibles. El autor menciona un arranque de 340 s en una GB300 sin toolkit CUDA 13 (con la variable de entorno configurada), pero no reporta métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión (media benchmarks del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| QDA-DeepSeek-R1-Distill-Llama-8B-W3A16 | 8,03 B | no disponible | 37,2 (W3A16) | MIT | Hugging Face, vLLM |
| deepseek-ai/DeepSeek-R1-Distill-Llama-8B (BF16) | 8,03 B | no disponible | 43,0 | MIT (según modelo base) | Hugging Face, amplio soporte |
| Otras cuantizaciones del mismo base (GGUF, AWQ, GPTQ) | 8,03 B | no disponible | no disponible | depende del publicador | llama.cpp, vLLM, etc. |

La comparativa directa con cuantizaciones alternativas del mismo modelo base no está disponible en la información proporcionada. El propio autor solo publica la comparación BF16 frente a W3A16.

## Limitaciones y advertencias

- Pérdida de precisión medible: 5,8 puntos de media en los benchmarks del autor, con caídas de hasta 8,5 puntos en MMLU-Pro. No es recomendable para tareas donde la exactitud punta sea crítica.
- Compatibilidad restringida: solo vLLM soporta el formato W3A16; SGLang no. Requiere CUDA 13 o configuración manual de `LD_LIBRARY_PATH` en entornos sin toolkit.
- Riesgo de alucinación: inherente a los modelos de razonamiento destilados; la cuantización puede agravarlo en dominios fuera de la distribución de calibración.
- Idiomas soportados no declarados: no se puede garantizar calidad multilingüe más allá de lo observado en calibración (128 turnos).
- Licencia MIT declarada, pero los datos de calibración (`qda-calibration-pools`) son CC BY-NC-SA 4.0, lo que puede plantear dudas sobre uso comercial de los derivados; conviene revisar la cadena de licencias antes de un despliegue en producción.
- Sin datos de benchmarks independientes: todas las cifras provienen del autor, con configuración de evaluación propia (pass@1 promediado sobre semillas, reglas lenient en MMLU-Pro).
- Longitud de contexto no confirmada en la información disponible; el rendimiento con contextos largos no está evaluado.
- Sin soporte documentado de tool calling ni de flujos de agentes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/qda-lab/QDA-DeepSeek-R1-Distill-Llama-8B-W3A16
- Modelo base: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Llama-8B
- Dataset de calibración: https://huggingface.co/datasets/qda-lab/qda-calibration-pools
- Dataset de entradas de la receta: https://huggingface.co/datasets/qda-lab/qda-recipe-inputs
- Repositorio del toolkit QDA: https://github.com/humanfia/qda
- Paper referenciado (arXiv:2611.23388): no disponible como URL verificada en la información proporcionada
