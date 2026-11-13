# FINAL-Bench/Darwin-35B-A3B-Opus

## Resumen

Darwin-35B-A3B-Opus es un modelo de lenguaje multimodal de tipo mixture-of-experts (MoE) publicado por FINAL-Bench, construido mediante una fusión evolutiva de dos modelos: una destilación de Claude 4.6 Opus sobre la base Qwen3.5-35B-A3B (denominada "Mother" en la documentación) y el Qwen3.5-35B-A3B oficial ("Father"). El resultado es un modelo con 35.951.822.704 parámetros totales y aproximadamente 3.000 millones activos por token, lo que sitúa su coste de inferencia en el rango de un modelo denso de 3B pese a su capacidad total.

El modelo resuelve el problema de recuperar capacidades de razonamiento avanzado (cadena de pensamiento, GPQA) en un modelo base abierto sin renunciar a las capacidades multimodales y multilingües del modelo original. La técnica empleada, denominada por el autor "Model MRI" y "MRI-Guided Merge", consiste en un perfilado a nivel de capa de los patrones de activación de expertos y de la importancia de cada capa para determinar ratios de fusión por bloque, con reactivación de expertos "muertos" (frecuencia de activación inferior al 5%).

Es relevante ahora porque combina una ventana de contexto de 262.144 tokens, soporte de imagen y vídeo, 201 idiomas declarados y licencia Apache 2.0, con resultados reportados de 90,0 % en GPQA Diamond, por encima de ambos modelos progenitores. El repositorio ocupa 71,9 GB y acumula 303 descargas y 111 likes en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (base Qwen3.5-35B-A3B), fusión evolutiva por capas |
| Parametros totales | 35.951.822.704 |
| Parametros activos | Aproximadamente 3.000 millones (3B activos, según la model card) |
| Longitud de contexto | 262.144 tokens (262K) |
| Tipos de cuantizacion | GGUF Q8 oficial; GGUF de terceros (bartowski); cuantizaciones adicionales no detalladas |
| Idiomas soportados | 201 idiomas declarados; lista explícita: en, zh, ko, ja, de, fr, es, ru, ar |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF disponible en repositorios separados |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer MoE de la familia Qwen3.5, con enrutamiento top-8 sobre 256 expertos (dato inferido de la definición de entropía de enrutamiento incluida en la model card, que cita "top-8-of-256"). El modelo no se entrena desde cero: se obtiene por fusión evolutiva de dos checkpoints con la misma arquitectura base. El progenitor "Mother" es una destilación de Claude 4.6 Opus sobre Qwen3.5-35B-A3B, con entrenamiento exclusivamente textual; el progenitor "Father" es el Qwen3.5-35B-A3B oficial, con capacidades de imagen y vídeo.

La innovación técnica declarada es el proceso "Model MRI": un perfilado con un conjunto de calibración de 1.000 muestras que mide la frecuencia de activación de cada experto, la entropía de enrutamiento (rango saludable declarado de 3,0 a 4,5 bits para top-8 de 256) y la distancia coseno de sondas por capa. A partir de estos diagnósticos se asignan ratios de fusión por bloque: las capas con más expertos muertos reciben mayor peso del donante, mientras que las capas sanas conservan el peso del receptor. Se identifica además una "golden layer" (por ejemplo, la capa L38 para razonamiento) como la de mayor importancia medida para una capacidad objetivo. Tras la fusión se ejecuta una comprobación de salud que compara la importancia por capa del hijo frente a ambos progenitores para detectar interferencias o pérdida de función. No se especifican en la información disponible el volumen de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO adicionales sobre el modelo fusionado.

## Capacidades

- Generación de texto y razonamiento avanzado con modo "thinking" y cadena de pensamiento explícita.
- Razonamiento de nivel graduado: GPQA Diamond reportado en 90,0 %.
- Capacidades multimodales de imagen y vídeo (pipeline image-text-to-text), heredadas del progenitor oficial.
- Comprensión multilingüe en 201 idiomas declarados, con soporte explícito de en, zh, ko, ja, de, fr, es, ru y ar.
- Tool calling y function calling, orientado a agentes de código ("coding-agent" en las etiquetas).
- Razonamiento multi-paso y flujos de agente.
- Contexto largo de 262.144 tokens para conversación y documentos extensos.
- Despliegue en dispositivos sin GPU mediante la familia POCKET (GGUF sobre llama.cpp estándar, incluida variante MLX para iPhone).

## Casos de uso

- Razonamiento científico y técnico asistido: el modelo puede resolver preguntas de nivel graduado con cadena de pensamiento explícita, adecuado para revisión de literatura, verificación de hipótesis y tutoría avanzada gracias a su rendimiento declarado en GPQA Diamond.
- Agente de código en producción: con soporte de tool calling y 262K de contexto, puede integrarse en pipelines de CI/CD para revisar diffs completos de repositorios, ejecutar llamadas a herramientas y encadenar pasos de corrección.
- Análisis de documentos largos multimodales: informes con gráficos, tablas e imágenes pueden procesarse en una sola ventana de 262K tokens, combinando OCR visual y razonamiento textual.
- Atención al cliente multilingüe: la cobertura declarada de 201 idiomas y el contexto largo permiten conversaciones multi-turno con historial extenso sin truncamiento.
- Procesamiento de vídeo e imagen para moderación o descripción: el pipeline image-text-to-text permite generar descripciones, resúmenes y extracción de información de material audiovisual.
- Despliegue en movilidad y edge: la variante POCKET-35B en GGUF y MLX permite ejecutar el modelo en iPhone o en CPU sin GPU con llama.cpp estándar, útil para asistentes offline con privacidad de datos.
- Investigación sobre fusión de modelos: el modelo sirve como caso de estudio reproducible de "MRI-Guided Merge" y reactivación de expertos muertos para equipos que investigan técnicas de merging en arquitecturas MoE.

## Benchmarks y rendimiento

| Benchmark | Modelo | Resultado | Multimodal | Arquitectura |
|---|---|---|---|---|
| GPQA Diamond (198 preguntas) | Darwin-35B-A3B-Opus (hijo) | 90,0 % | Imagen/vídeo | Qwen3.5-35B-A3B |
| GPQA Diamond (198 preguntas) | Mother (Jackrong Claude 4.6 Opus Distilled) | 85,0 % | Entrenamiento solo texto | Qwen3.5-35B-A3B |
| GPQA Diamond (198 preguntas) | Father (Qwen3.5-35B-A3B oficial) | 84,2 % | Imagen/vídeo | Qwen3.5-35B-A3B |
| MMMLU | Darwin-35B-A3B-Opus | 85,0 % | no disponible | Qwen3.5-35B-A3B |

Condiciones de evaluación declaradas: SGLang, contexto de 32.768 tokens, temperatura 0, decodificación greedy y formato oficial de prompt de GPQA. El rendimiento de generación declarado es de 147,8 tok/s, sin especificar el hardware empleado. No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni otros benchmarks adicionales.

## Requisitos de hardware

- Pesos completos en safetensors: 71,9 GB en el repositorio, por lo que la inferencia en precisión original requiere al menos 72 GB de VRAM o descarga a CPU.
- Al ser MoE con unos 3B parámetros activos, el coste computacional por token es bajo, pero la memoria necesaria para mantener todos los expertos residentes es la del modelo completo.
- GPU recomendadas para pesos completos: A100 80 GB, H100 80 GB o configuraciones multi-GPU. Una RTX 4090 de 24 GB no puede alojar los pesos completos en precisión original.
- Consumer GPU: viable con cuantizaciones GGUF (Q8 oficial y variantes de bartowski) en GPUs de 24 GB o superiores, dependiendo del nivel de cuantización.
- Despliegue: transformers, SGLang (usado en la evaluación), llama.cpp (incluida la familia POCKET sin fork), Ollama mediante GGUF y TGI no confirmado en la información disponible.
- Edge: variantes POCKET-35B GGUF para CPU sin GPU y POCKET-KR-MLX para iPhone.
- Throughput declarado: 147,8 tok/s, sin hardware especificado. Latencia no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | GPQA Diamond | Licencia | Multimodal |
|---|---|---|---|---|---|---|
| Darwin-35B-A3B-Opus | 35,95B | ~3B | 262K | 90,0 % | Apache 2.0 | Sí |
| Qwen3.5-35B-A3B oficial (Father) | 35B | ~3B | no disponible | 84,2 % | no disponible en la información | Sí |
| Jackrong Claude 4.6 Opus Distilled (Mother) | 35B | ~3B | no disponible | 85,0 % | no disponible en la información | No (solo texto) |

La comparación con modelos de otros fabricantes del mismo rango (por ejemplo, MoE de ~30-40B con ~3B activos) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo es el resultado de una fusión de pesos, no de un entrenamiento desde cero; los benchmarks reportados proceden del autor y no se han verificado de forma independiente en la información disponible.
- El progenitor "Mother" se entrenó solo con texto, por lo que las capacidades multimodales dependen del progenitor oficial y pueden presentar degradación tras la fusión en capas concretas.
- Riesgo de alucinación inherente a los modelos destilados de un profesor propietario (Claude 4.6 Opus) y a la fusión de comportamientos; no se documentan evaluaciones de factualidad.
- La cobertura de 201 idiomas es una declaración del autor; no se aportan métricas por idioma y el rendimiento fuera de los idiomas listados explícitamente puede ser inferior.
- El modo thinking puede incrementar la latencia y el consumo de tokens; no se documentan controles de presupuesto de razonamiento.
- Aunque la licencia es Apache 2.0, la procedencia de los datos de destilación de un modelo propietario puede plantear riesgos legales para uso comercial en algunas jurisdicciones; conviene revisar los términos del profesor original.
- La evaluación de GPQA se realizó con contexto de 32.768 tokens pese a la ventana de 262K; no hay datos de rendimiento en el extremo superior del contexto.
- No se documentan sesgos medidos, evaluaciones de seguridad ni pruebas de robustez adversarial.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/FINAL-Bench/Darwin-35B-A3B-Opus
- Demo (Space): https://huggingface.co/spaces/FINAL-Bench/Darwin-35B-A3B-Opus
- GGUF Q8 oficial: https://huggingface.co/FINAL-Bench/Darwin-35B-A3B-Opus-Q8-GGUF
- GGUF de bartowski: https://huggingface.co/bartowski/FINAL-Bench_Darwin-35B-A3B-Opus-GGUF
- Leaderboard FINAL Bench: https://huggingface.co/spaces/FINAL-Bench/Leaderboard
- Leaderboard ALL Bench: https://huggingface.co/spaces/FINAL-Bench/all-bench-leaderboard
- POCKET CPU chat: https://huggingface.co/spaces/FINAL-Bench/POCKET-35B-CPU
- POCKET-35B GGUF: https://huggingface.co/FINAL-Bench/POCKET-35B-GGUF
- POCKET-KR MLX (iPhone): https://huggingface.co/FINAL-Bench/POCKET-KR-MLX
- POCKET-EN GGUF: https://huggingface.co/FINAL-Bench/POCKET-EN-GGUF
- Colección POCKET: https://huggingface.co/collections/FINAL-Bench/pocket-models-6a618ee5d23eafb7e185a5c6
- Darwin-4B-Opus (Gen1): https://huggingface.co/FINAL-Bench/Darwin-4B-Opus
- Darwin-4B-David (Gen2): https://huggingface.co/FINAL-Bench/Darwin-4B-David
- Darwin-4B-Genesis (Gen3): https://huggingface.co/FINAL-Bench/Darwin-4B-Genesis
- Darwin-9B-Opus: https://huggingface.co/FINAL-Bench/Darwin-9B-Opus
- Darwin-31B-Opus: https://huggingface.co/FINAL-Bench/Darwin-31B-Opus
- Paper referenciado (arXiv:2605.14386): https://arxiv.org/abs/2605.14386
