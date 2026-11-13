# brulee-1/Rill-51M-A25M

## Resumen

Rill-51M-A25M es un modelo de lenguaje causal de tipo decoder-only con arquitectura híbrida propia, desarrollado por el usuario brulee-1 y publicado en Hugging Face bajo licencia MIT. Se trata de un modelo de investigación de escala muy reducida (51,5 millones de parámetros totales, 24,98 millones activos por token) que combina capas de Gated DeltaNet-2 con atención por grupos (GQA) y una capa FFN de mezcla de expertos (MoE). Esta ficha corresponde a la variante Instruct, afinada a partir del modelo base Rill-51M-A25M-Base.

El modelo resuelve un problema fundamentalmente experimental: validar en hardware de consumo una arquitectura híbrida de atención lineal y MoE con entrenamiento consciente de cuantización (NVFP4 en expertos enrutados y FP8 en proyecciones de atención y KV). El preentrenamiento se realizó desde cero sobre exactamente 2.000 millones de tokens en inglés, y el ajuste de instrucciones sobre Dolly-15k y OpenAssistant oasst2. Su contexto es de 4.096 tokens y su vocabulario de 32.768 entradas.

Es relevante ahora como referencia reproducible de bajo coste: el autor documenta el entrenamiento completo en una única NVIDIA RTX 5090 en aproximadamente 5,4 horas para el preentrenamiento, con resultados de benchmarks publicados y un script de inferencia autocontenido. No obstante, sus capacidades absolutas son las propias de un modelo de 51 millones de parámetros, muy por debajo de los estándares de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Decoder-only híbrida: Gated DeltaNet-2 + GQA, FFN con mezcla de expertos |
| Parámetros totales | 51.524.854 |
| Parámetros activos | 24.982.774 por token |
| Longitud de contexto | 4.096 tokens |
| Tipos de cuantización | Entrenamiento consciente de cuantización: NVFP4 en expertos enrutados, FP8 en proyecciones de atención y KV; pesos publicados en BF16 |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (BF16) |
| Tamaño del repositorio | 0,1 GB |
| Dimensión oculta | 384 |
| Capas | 12 (patrón GDN2 ×3 → GQA, repetido 3 veces; 9 GDN2 + 3 GQA) |
| Gated DeltaNet-2 | 6 cabezas, dimensión de cabeza 64, convolución corta 4 |
| Atención GQA | 6 cabezas de consulta, 2 cabezas KV, dimensión de cabeza 64, RoPE θ=10000 |
| FFN MoE | 8 expertos SwiGLU enrutados (intermedio 320), top-2, más 1 experto compartido (intermedio 128) |
| Normalización | RMSNorm (pre-norm), RMSNorm con puerta en salidas GDN2 |
| Embedding | Factorizado y atado, rango 128 |
| Vocabulario | 32.768 |
| Tokenizador | Rill-Tokenizer-32768, BPE a nivel de byte con normalización NFKC |
| Precisión canónica | BF16 |
| Modelo base | brulee-1/Rill-51M-A25M-Base |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only híbrido que intercala bloques de Gated DeltaNet-2 (mecanismo de atención lineal con estado recurrente y convolución corta de tamaño 4) con bloques de atención GQA clásica con RoPE. El patrón es de tres bloques GDN2 seguidos de uno de GQA, repetido tres veces sobre 12 capas. La FFN es una mezcla de expertos con 8 expertos SwiGLU enrutados de dimensión intermedia 320, selección top-2 y un experto compartido adicional de dimensión 128. El embedding es factorizado y atado con rango 128, y la normalización usa RMSNorm pre-norm, con RMSNorm con puerta en las salidas de GDN2.

El preentrenamiento partió de cero y consumió exactamente 2.000 millones de tokens en 30.518 pasos de 65.536 tokens, con secuencia de 4.096 y empaquetado de documentos con reinicio de estado y atención por documento. Los datos fueron FineWeb-Edu (1.400 millones de tokens con `int_score ≥ 3`) y FineWeb `sample-10BT` (600 millones de tokens), en inglés y deduplicados, con licencia ODC-By 1.0. Se usó AdamW (β = 0,9/0,95, weight decay 0,1), LR pico de 4e-4, calentamiento de 40 millones de tokens y decaimiento coseno hasta 4e-5. El entrenamiento consciente de cuantización introdujo NVFP4 en expertos enrutados a partir de los 100 millones de tokens y FP8 en proyecciones de atención y KV a partir de los 200 millones. La entropía cruzada de validación final fue 3,426 en BF16 y 3,439 con simulación de cuantización. Todo el preentrenamiento se ejecutó en una NVIDIA RTX 5090 en unas 5,4 horas.

El ajuste de instrucciones se realizó sobre 19.350 conversaciones (14.227 de Dolly-15k y 5.123 de oasst2, hasta 3 turnos), con 3.253.450 tokens supervisados por época (solo respuestas del asistente y fin de turno), 2 épocas y 324 pasos. Se probaron LR de 2e-5, 5e-5 y 1e-4, seleccionando 1e-4 por entropía cruzada de validación, con calentamiento del 3 % y decaimiento coseno hasta 1e-5. La entropía cruzada de validación en respuestas bajó de 2,9607 a 2,6260. El entrenamiento consciente de cuantización se mantuvo activo durante el ajuste.

## Capacidades

- Generación de texto causal en inglés con formato de chat definido por tokens especiales (`<|instruction|>`, `<|context|>`, `<|response|>`, `<|endoftext|>`).
- Conversación multi-turno (hasta 3 turnos en los datos de ajuste) con contexto opcional en el primer turno.
- Razonamiento básico y respuesta a preguntas de conocimiento general, limitado por el tamaño del modelo.
- Seguimiento de instrucciones sencillas gracias al ajuste supervisado sobre Dolly-15k y oasst2.
- Capacidad de ejecución local en CUDA, Apple Silicon (MPS) y CPU mediante un script de inferencia autocontenido.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo de pensamiento.
- Capacidades multilingües: únicamente inglés.

## Casos de uso

- Investigación de arquitecturas híbridas: sirve como banco de pruebas reproducible para comparar Gated DeltaNet-2 con atención clásica en un régimen de 2.000 millones de tokens y una sola GPU de consumo, con configuración y resultados publicados.
- Validación de entrenamiento consciente de cuantización: permite estudiar el impacto de NVFP4 en expertos y FP8 en atención sobre la perplejidad final (3,426 frente a 3,439) en un entorno controlado y de bajo coste.
- Docencia y formación: su tamaño de 0,1 GB y su script `inference.py` autocontenido permiten ejecutar un LLM completo en portátiles sin dependencias de `transformers`, útil para explicar tokenización, atención y MoE.
- Pruebas de pipelines de inferencia: al no soportar `AutoModel` de transformers, es útil para validar cargadores personalizados, comprobaciones estrictas de nombre/forma/dtype y rutas de despliegue alternativas.
- Prototipado de asistentes conversacionales de dominio muy acotado: con contexto de 4.096 tokens y formato de chat definido, puede emplearse para experimentar con plantillas de conversación antes de escalar a modelos mayores.
- Evaluación comparativa de referencia: sus resultados en lm-evaluation-harness 0.4.13 (media de ocho tareas del 37,83 %) permiten fijar una línea base para modelos de menos de 100 millones de parámetros.
- Experimentos de ajuste fino de bajo coste: el modelo base y el instruct permiten reproducir recetas de SFT con 19.350 conversaciones en una sola GPU.

## Benchmarks y rendimiento

Evaluación zero-shot con lm-evaluation-harness 0.4.13, conjuntos completos de test/validación, sin plantilla de chat, pesos BF16 en CUDA. MMLU es la puntuación de grupo (57 materias ponderadas por número de preguntas).

| Tarea | Métrica | Shots | Base | Instruct | Δ |
|---|---|---:|---:|---:|---:|
| HellaSwag | acc_norm | 0 | 27,88 % | 27,97 % | +0,09 pp |
| PIQA | acc_norm | 0 | 59,85 % | 58,27 % | -1,58 pp |
| ARC-Easy | acc_norm | 0 | 37,96 % | 37,37 % | -0,59 pp |
| ARC-Challenge | acc_norm | 0 | 23,29 % | 24,32 % | +1,02 pp |
| LAMBADA OpenAI | acc | 0 | 20,20 % | 22,30 % | +2,10 pp |
| WinoGrande | acc | 0 | 50,28 % | 50,91 % | +0,63 pp |
| BoolQ | acc | 0 | 51,53 % | 58,47 % | +6,94 pp |
| MMLU (57 materias, ponderado por tamaño) | acc | 0 | 22,95 % | 23,00 % | +0,04 pp |
| Media de ocho tareas | — | 0 | 36,74 % | 37,83 % | +1,08 pp |

No se han publicado resultados de benchmarks adicionales (HumanEval, GSM8K, MT-Bench u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos BF16 y 51,5 millones de parámetros, el modelo ocupa aproximadamente 0,1 GB en disco y una fracción similar en memoria; el consumo real vendrá dominado por el estado de activaciones y el contexto, no por los pesos.
- GPU recomendadas: cualquier GPU con soporte CUDA es suficiente; el autor cita ejecución en CUDA, Apple Silicon (MPS) y CPU. El entrenamiento se realizó en una NVIDIA RTX 5090.
- Cabe holgadamente en GPU de consumo: RTX 4090, RTX 5090, RTX 3090, RTX 4060 Ti y similares, así como en Apple Silicon mediante MPS.
- Opciones de despliegue: script `inference.py` autocontenido incluido en el repositorio, con dependencias `torch`, `safetensors` y `tokenizers`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI; de hecho, la carga mediante `transformers.AutoModel` no está soportada por tratarse de una arquitectura personalizada.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo documenta el tiempo de preentrenamiento (unas 5,4 horas en una RTX 5090 para 2.000 millones de tokens).

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos comparables en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parámetros totales | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Rill-51M-A25M (Instruct) | 51,5 M | 24,98 M | 4.096 | MIT | Hugging Face, safetensors BF16 |
| Rill-51M-A25M-Base | 51,5 M | 24,98 M | 4.096 | MIT | Hugging Face, safetensors BF16 |
| Alternativas de tamaño similar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Escala muy reducida: con 51,5 millones de parámetros, la calidad de generación, el conocimiento factual y el razonamiento están muy por debajo de modelos de miles de millones de parámetros; la media de ocho tareas del 37,83 % refleja este límite.
- Riesgo elevado de alucinación: el modelo se entrenó con solo 2.000 millones de tokens y su MMLU zero-shot es del 23,00 %, por lo que no debe usarse como fuente de hechos.
- Sesgos: los datos de preentrenamiento (FineWeb-Edu y FineWeb) y de ajuste (Dolly-15k y oasst2) son en inglés y pueden contener sesgos sociales y culturales no mitigados; no se documentan procesos de alineación adicionales como RLHF o DPO.
- Idioma: solo inglés; no hay soporte documentado de castellano ni de otros idiomas.
- Contexto limitado a 4.096 tokens, insuficiente para documentos largos o conversaciones extensas.
- Restricciones de licencia: el modelo se publica bajo MIT, pero los datasets subyacentes tienen sus propias licencias (FineWeb ODC-By 1.0, Dolly-15k CC BY-SA 3.0, oasst2 Apache-2.0); conviene revisar su compatibilidad para uso comercial.
- Integración: no es compatible con `transformers.AutoModel`; requiere el script `inference.py` incluido, lo que limita su uso con frameworks estándar de despliegue.
- Formato de chat rígido: el modelo espera los tokens especiales definidos en el entrenamiento (`<|instruction|>`, `<|context|>`, `<|response|>`, `<|endoftext|>`); usarlo fuera de ese formato degrada la calidad.
- Estado de publicación: 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/brulee-1/Rill-51M-A25M
- Modelo base: https://huggingface.co/brulee-1/Rill-51M-A25M-Base
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb: https://huggingface.co/datasets/HuggingFaceFW/fineweb
- Dataset Dolly-15k: https://huggingface.co/datasets/databricks/databricks-dolly-15k
- Dataset OpenAssistant oasst2: https://huggingface.co/datasets/OpenAssistant/oasst2
