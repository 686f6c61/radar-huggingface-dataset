# JaydenTeoh/ntp-1p2b-model

## Resumen

NTP — 1p2b es un modelo de lenguaje autorregresivo de 1.174 millones de parámetros entrenado exclusivamente con predicción del siguiente token (next-token prediction, NTP), publicado por JaydenTeoh como uno de los doce checkpoints del proyecto *Multi-Token Prediction Done Right* (arXiv:2610.38331). No es un modelo pensado para uso general en producción, sino una línea base científica: sirve como punto de comparación contra variantes entrenadas con objetivos de multi-token prediction (MTP) bajo una receta de entrenamiento idéntica.

El modelo se entrenó sobre 31.500 millones de tokens del corpus FineWeb-Edu con tokenizador GPT-2 BPE, usando una combinación del optimizador Muon (para matrices 2D ocultas) y AdamW (para embeddings, cabeza de salida y normalizaciones). Su relevancia actual radica en el interés renovado por la predicción multi-token como vía para acelerar la decodificación y mejorar la eficiencia del entrenamiento; este checkpoint constituye el control experimental sin cabezas MTP.

Es un transformer decoder-only con hidden size 1536, 36 capas y 24 cabezas de atención, con una ventana de contexto de 2.048 tokens. Requiere `trust_remote_code=True` porque su arquitectura (`model_type: hf_mtp`) se define mediante archivos de modelado personalizados en el propio repositorio.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (hf_mtp, código personalizado) |
| Parámetros totales | 1.173.861.888 (1.174M) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantización | No disponible (solo pesos en bf16/fp32 originales) |
| Idiomas soportados | Inglés |
| Licencia | MIT |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only estándar de 36 capas con hidden size 1536 y 24 cabezas de atención. A diferencia de sus hermanos del mismo estudio, no incorpora cabezas de multi-token prediction (`n_mtp: 0`): es la línea base de next-token prediction puro contra la que se comparan las variantes MTP. El vocabulario del tokenizador GPT-2 (50.257 tokens) se rellena hasta 50.304 por alineación de hardware, sin que las filas extra se utilicen.

El entrenamiento usó 31.500 millones de tokens de FineWeb-Edu (60.000 pasos, batch de 256, contexto de 2.048), tokenizados con GPT-2 BPE. La receta de optimización combina Muon sobre las matrices ocultas 2D con AdamW sobre embeddings, cabeza de salida y parámetros de normalización, con LR pico de 0,001 en decayo coseno hasta 1e-05, 2.000 pasos de calentamiento, weight decay de 0,1 y precisión bf16 autocast sobre pesos maestros en fp32. Se ejecutó una única corrida con semilla 13; los doce checkpoints del estudio comparten semilla, orden de datos y planificador, de modo que las diferencias entre ellos son atribuibles al objetivo de entrenamiento.

## Capacidades

- Generación de texto en inglés mediante predicción autorregresiva del siguiente token.
- Modelo base (preentrenamiento únicamente): no ha sido ajustado con instrucciones, ni con RLHF/DPO, por lo que no sigue instrucciones de forma fiable.
- No incorpora cabezas MTP ni soporta decodificación especulativa nativa; es precisamente el baseline sin esas capacidades.
- Sin capacidades multimodales (sin visión, audio ni entradas no textuales).
- Sin soporte documentado de tool calling ni de razonamiento multi-paso agéntico.
- Pensado como objeto de estudio e investigación, no como asistente de propósito general.

## Casos de uso

- Investigación en objetivos de preentrenamiento: sirve como control experimental para medir el efecto real del multi-token prediction frente a NTP puro en condiciones idénticas de datos, semilla y planificador.
- Estudios de decodificación especulativa: al ser un modelo NTP sin cabezas MTP, permite evaluar cuánto acelera la decodificación especulativa externa (con draft models independientes) frente a la basada en cabezas MTP.
- Reproducción de recetas de optimización: útil como referencia para validar implementaciones del optimizador Muon combinado con AdamW a escala de ~1B de parámetros.
- Análisis de scaling laws y ablations: al existir doce checkpoints (3 objetivos x 4 tamaños) con receta común, facilita estudios controlados de curvas de pérdida y calidad por tamaño.
- Base para fine-tuning experimental en inglés: su licencia MIT y tamaño contenido lo hacen apto para pruebas de SFT o DPO en entornos académicos con recursos limitados.
- Docencia y divulgación técnica: ejemplo práctico y completo (código, configs y paper) para ilustrar en cursos cómo se comparan objetivos de entrenamiento de LLMs de forma rigurosa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo se evalúa en el paper asociado en términos de pérdida de validación y comparativas entre objetivos de entrenamiento, pero no se han proporcionado métricas (MMLU, HumanEval, GSM8K, etc.) en la model card.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,4 GB en fp32 o ~1,2 GB en bf16 para los pesos, más overhead de activaciones y KV cache; con contexto de 2.048 tokens, una GPU de 8 GB es más que suficiente incluso sin cuantización.
- GPU recomendadas: cualquier GPU moderna de consumo (RTX 3060, RTX 4090) o de centro de datos (A100, H100); el modelo es pequeño para los estándares actuales.
- Cabe en GPUs de consumo sin problema, incluso en las de gama media, y es viable su ejecución en CPU con razonable lentitud dada la arquitectura ligera.
- Despliegue: compatible con la librería `transformers` de Hugging Face mediante `trust_remote_code=True` (arquitectura personalizada `hf_mtp`); no hay soporte nativo documentado para vLLM, TGI, llama.cpp ni Ollama al tratarse de código remoto custom. El repositorio indica `inference: false` en la model card, por lo que la inferencia serverless de Hugging Face no está habilitada.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| JaydenTeoh/ntp-1p2b-model | 1.174M | 2.048 | NTP puro (baseline) | MIT | Pesos abiertos, código custom |
| GPT-2 (1.5B) | 1.500M | 1.024 | NTP puro | Modificada MIT (OpenAI) | Pesos abiertos, arquitectura nativa en transformers |
| Pythia-1.4B (EleutherAI) | 1.400M | 2.048 | NTP puro | Apache 2.0 | Pesos abiertos, checkpoints por step |
| OLMo-2-1B (AI2) | ~1.500M | 4.096 | NTP puro + SFT/DPO (variantes) | Apache 2.0 | Pesos, datos y receta abiertos |

Los tres comparables son modelos base decoder-only de tamaño similar orientados a investigación abierta; la diferencia distintiva de NTP — 1p2b es que forma parte de una familia de checkpoints controlados para estudiar multi-token prediction, con optimizador Muon en lugar de AdamW puro.

## Limitaciones y advertencias

- Modelo base sin alineación: no ha recibido SFT, RLHF ni DPO, por lo que genera texto continuo sin seguir instrucciones y puede producir contenido ofensivo o sesgado heredado de FineWeb-Edu.
- Riesgo de alucinación elevado, propio de un modelo de solo preentrenamiento sin ajuste por instrucciones.
- Limitado al inglés: entrenado exclusivamente con FineWeb-Edu (corpus educativo filtrado en inglés), sin capacidades multilingües.
- Contexto corto (2.048 tokens), insuficiente para tareas de documento largo o conversaciones extensas.
- Requiere `trust_remote_code=True`, lo que implica ejecutar código arbitrario del repositorio; conviene revisar los archivos de modelado antes de usarlo en entornos sensibles.
- No hay soporte nativo en `transformers` ni en runtimes optimizados (vLLM, llama.cpp), lo que limita su despliegue eficiente en producción.
- Resultados basados en una única corrida con una sola semilla, tal como indica la propia model card; las conclusiones del estudio deben interpretarse con esa limitación estadística.
- Sin resultados de benchmarks estándar publicados, lo que dificulta evaluar su calidad frente a modelos equivalentes sin ejecutar evaluaciones propias.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/JaydenTeoh/ntp-1p2b-model
- Paper: Multi-Token Prediction Done Right — https://arxiv.org/abs/2610.38331
- Código (GitHub): https://github.com/JaydenTeoh/Soft-MTP
- Dataset de entrenamiento: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
