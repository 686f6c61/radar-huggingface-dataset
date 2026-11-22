# BigFamTLLM/ml-cpt8-anneal

## Resumen

ml-cpt8-anneal es un modelo de lenguaje de 2.115.305.088 parámetros (2,12B) desarrollado por BigFamTLLM, un proyecto de estudiantes de la asignatura IN5640 de la Universidad de Oslo (otoño de 2026). Se trata de un modelo base (no ajustado con instrucciones) construido sobre la arquitectura Qwen3 y especializado en noruego mediante un proceso de adaptación de tokenizer y preentrenamiento continuado sobre corpus noruegos. El modelo parte de ml-cpt8, el octavo checkpoint de diez de la fase de preentrenamiento continuado multilingüe, y representa la versión "annealed" de ese checkpoint.

La relevancia del modelo es fundamentalmente académica y experimental: forma parte de un estudio comparativo de 50 modelos entrenados con la misma arquitectura y presupuesto computacional que contrasta estrategias de entrenamiento desde cero frente a adaptación de modelos multilingües al noruego, y evalúa el efecto del annealing (decaimiento de la tasa de aprendizaje hasta cero sobre datos de alta calidad). El modelo ha visto 21.390 millones de tokens noruegos y emplea un tokenizer noruego de 32.000 tokens.

Con 2,12B parámetros, contexto de 4.096 tokens y pesos en safetensors, es un modelo de escala media que cabe en GPUs de consumo con cuantización. Su licencia no está declarada en la información disponible, y el propio autor advierte que son modelos de investigación entrenados sobre texto web, no destinados a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3): 36 capas, hidden size 2176, 34 cabezas de atención (17 KV heads), embeddings atados |
| Parametros totales | 2.115.305.088 (2,12B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantizacion | No disponible (pesos publicados en safetensors, presumiblemente bf16/fp32) |
| Idiomas soportados | en, da, de, sv, no, nb (bokmål), nn (nynorsk) |
| Licencia | No disponible |
| Formato de pesos | safetensors (compatible con transformers 4.x) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Qwen3 con 36 capas, dimensión oculta de 2176, 34 cabezas de atención con 17 cabezas KV (GQA) y embeddings atados. El entrenamiento se realizó con Megatron-LM sobre 8 GPUs GH200 en el clúster Olivia (Sigma2), con longitud de secuencia de 4096, batch size de 128, optimizador AdamW y tasa de aprendizaje máxima de 5e-4 con 2.000 pasos de warmup y sin decaimiento durante la fase principal (1e-4 para la etapa de solo embeddings).

El proceso de adaptación al noruego consta de varias etapas: primero se sustituye el tokenizer por uno noruego de 32.000 tokens, conservando los embeddings de los tokens compartidos entre ambos vocabularios y reinicializando los nuevos a partir de la media de las piezas del tokenizer antiguo; después se realizan 1.000 pasos de entrenamiento solo de embeddings; a continuación se ejecuta el preentrenamiento continuado sobre datos noruegos de HPLT 4.0 (mezcla del 85% bokmål y 15% nynorsk), alcanzando 21.390 millones de tokens noruegos vistos. El checkpoint 8 corresponde al paso 38.880 de 48.600. Finalmente, la fase de annealing añade 916 pasos (0,48B tokens) sobre texto bokmål y nynorsk de alta calidad con decaimiento lineal de la tasa de aprendizaje hasta cero. La conversión a formato Hugging Face se hizo con Megatron-Bridge, ajustando las configuraciones para cargar en transformers 4.x.

## Capacidades

- Generación de texto autoregresiva en noruego (bokmål y nynorsk) y, en menor medida, en inglés, danés, alemán y sueco.
- Modelo base sin ajuste por instrucciones: no soporta de forma nativa el formato de chat ni sigue instrucciones de manera fiable.
- Razonamiento y conocimiento del mundo limitados, con resultados bajos en las tareas de NorEval (ver sección de benchmarks).
- Capacidad de completar texto y mantener coherencia local dentro de la ventana de 4.096 tokens.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Multilingüismo parcial: el entrenamiento principal es noruego, con cobertura residual de las lenguas escandinavas y del inglés por herencia del modelo base multilingüe.

## Casos de uso

- Investigación académica sobre adaptación de tokenizers: el modelo sirve para estudiar el impacto del cambio de vocabulario y la reinicialización de embeddings en modelos multilingües adaptados a una lengua de bajos recursos como el noruego.
- Evaluación comparativa de estrategias de entrenamiento: permite contrastar el efecto del annealing frente al checkpoint no annealed (ml-cpt8) y frente a los modelos entrenados desde cero (no-base) en tareas de NorEval.
- Generación de texto noruego para análisis lingüístico: con 21,39B tokens noruegos vistos, es adecuado para experimentos de modelado del lenguaje y perplejidad sobre corpus bokmål y nynorsk.
- Completado de texto y prototipos de escritura asistida en noruego: dentro de su ventana de 4.096 tokens puede emplearse para autocompletar o generar borradores, siempre con revisión humana.
- Base para fine-tuning posterior: al ser un modelo base de 2,12B parámetros, es un punto de partida manejable para ajuste supervisado o DPO en tareas específicas del noruego en entornos con recursos limitados.
- Experimentos de robustez frente a ruido: el autor publica métricas de robustez (0,390 en entrada limpia, -0,045 de media bajo ruido), lo que permite reproducir y ampliar estudios sobre degradación ante perturbaciones.
- Docencia y reproducibilidad: al formar parte de una familia de 50 modelos con la misma arquitectura y presupuesto, facilita la replicación de experimentos en cursos y trabajos de investigación.

## Benchmarks y rendimiento

Resultados en NorEval 1.1 publicados por el autor:

| Grupo de tarea | Métrica | 0-shot | 1-shot |
|---|---|---|---|
| nob_language | em_first | 0,246 | 0,303 |
| nob_orthography | acc | 0,851 | 0,874 |
| nob_reading | f1 | 0,221 | 0,267 |
| nob_world | acc | 0,299 | 0,296 |
| nno_language | em_first | 0,488 | 0,582 |
| nno_world | acc | 0,313 | 0,317 |

Robustez (versiones con ruido de tres tareas de NorEval): 0,390 en entrada limpia y -0,045 de media bajo ruido. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: en bf16, aproximadamente 4,3 GB solo para pesos, más overhead de activaciones y KV cache; en fp32, unos 8,5 GB. Con cuantización de 8 bits, alrededor de 2,2 GB; con 4 bits, en torno a 1,1-1,5 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: A100, H100 o GH200 para entrenamiento o inferencia en bf16 sin cuantizar; RTX 4090, RTX 3090 o A10 para inferencia en bf16 con margen suficiente.
- Cabe en GPU de consumo: sí, en tarjetas con 8 GB o más en bf16 y en tarjetas con 4-6 GB con cuantización de 4 u 8 bits.
- Opciones de despliegue: transformers (soporte nativo, incluido transformers 4.x), text-generation-inference (tag endpoints_compatible), y previsiblemente llama.cpp/Ollama si se generan pesos GGUF (no publicados en la información disponible). vLLM y TGI son opciones razonables para servir el modelo en bf16.
- Latencia y throughput: no disponibles. Con 2,12B parámetros y contexto de 4.096 tokens, se espera un throughput alto en GPUs modernas, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| BigFamTLLM/ml-cpt8-anneal | 2,12B | 4.096 | Noruego (adaptación de multilingüe) | No disponible | Hugging Face |
| BigFamTLLM/ml-cpt8 | 2,12B | 4.096 | Noruego (checkpoint previo al annealing) | No disponible | Hugging Face |
| BigFamTLLM/no-base-anneal | 2,12B (misma arquitectura) | 4.096 | Noruego desde cero | No disponible | Hugging Face |
| BigFamTLLM/da-cpt8-anneal | 2,12B (misma arquitectura) | 4.096 | Danés adaptado a noruego | No disponible | Hugging Face |

No se dispone de datos de benchmarks comparativos frente a modelos externos a la familia en la información proporcionada. La comparación más directa es con ml-cpt8 (sin annealing) y con no-base-anneal (entrenado desde cero en noruego), ambos del mismo proyecto y con la misma arquitectura y presupuesto.

## Limitaciones y advertencias

- Modelo base sin ajuste por instrucciones: no debe usarse como asistente conversacional sin un fine-tuning previo.
- Riesgo elevado de alucinación y de generar contenido incorrecto u ofensivo: el autor advierte explícitamente que son modelos de investigación entrenados sobre texto web y no destinados a producción.
- Rendimiento bajo en tareas de conocimiento del mundo (nob_world 0,299 en 0-shot; nno_world 0,313) y de lectura (nob_reading f1 0,221), lo que limita su uso en aplicaciones que requieran comprensión factual.
- Ventana de contexto limitada a 4.096 tokens, insuficiente para documentos largos o conversaciones multi-turno extensas.
- Cobertura multilingüe desigual: el entrenamiento se centra en noruego (85% bokmål, 15% nynorsk); el resto de idiomas declarados (en, da, de, sv) tienen cobertura marginal.
- Robustez limitada ante ruido: pérdida media de 0,045 puntos en las tareas evaluadas con perturbaciones.
- Licencia no declarada: no puede confirmarse si se permite el uso comercial; debe consultarse con el autor antes de cualquier uso en producción.
- Sesgos potenciales derivados del corpus HPLT 4.0 (texto web) no documentados por el autor.
- Proyecto académico con fecha de creación en noviembre de 2026 y sin descargas ni interacciones registradas; no hay evidencia de mantenimiento ni soporte.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/BigFamTLLM/ml-cpt8-anneal
- Modelo base ml-cpt8: https://huggingface.co/BigFamTLLM/ml-cpt8
- Modelo ml-base: https://huggingface.co/BigFamTLLM/ml-base
- Modelo no-base: https://huggingface.co/BigFamTLLM/no-base
- Modelo no-base-anneal: https://huggingface.co/BigFamTLLM/no-base-anneal
- Modelo da-base: https://huggingface.co/BigFamTLLM/da-base
- Modelo da-base-anneal: https://huggingface.co/BigFamTLLM/da-base-anneal
- Modelo ml-base-anneal: https://huggingface.co/BigFamTLLM/ml-base-anneal
- Modelo ml-emb: https://huggingface.co/BigFamTLLM/ml-emb
- Modelo ml-emb-anneal: https://huggingface.co/BigFamTLLM/ml-emb-anneal
- Checkpoints ml-cpt1 a ml-cpt10: https://huggingface.co/BigFamTLLM/ml-cpt1 (y sucesivos hasta ml-cpt10)
- Checkpoints ml-cpt1-anneal a ml-cpt10-anneal: https://huggingface.co/BigFamTLLM/ml-cpt1-anneal (y sucesivos hasta ml-cpt10-anneal)
