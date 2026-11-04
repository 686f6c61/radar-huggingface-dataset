# Jeesup/svd-safety-l2b13_svdllm_r50

## Resumen

svd-safety-l2b13_svdllm_r50 es un checkpoint de investigación derivado de meta-llama/Llama-2-13b-chat-hf, comprimido mediante SVD-LLM hasta el 50,00 % de sus parámetros densos (13.015.864.320 parámetros finales) y recuperado con la etapa 2 de SVD-LLM basada en LoRA. Lo publica el usuario Jeesup como parte de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes lo repara mejor. No es un asistente conversacional de propósito general: es una celda concreta de una malla experimental sobre reglas de selección y presupuestos de compresión.

El interés técnico reside en que cuantifica el coste de seguridad de la compresión. El autor reporta un ASR de 0,2442 en AdvBench y 0,2364 en StrongREJECT (juez HarmBench), junto con una perplexidad de 10,7173 en WikiText-2 y un macro over-refusal de 0,1364 medido con WildGuard. Estos valores permiten comparar directamente la degradación inducida por la compresión frente al modelo base sin comprimir, algo poco habitual en checkpoints publicados.

La relevancia es metodológica: sirve como línea base "plana" (sin selección ni reparación específica de seguridad) frente a la que medir variantes del mismo estudio. Cualquier uso en producción sería inadecuado por diseño, ya que el propio autor advierte que varias ramas de la malla están deliberadamente degradadas en seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Llama 2), comprimido con SVD-LLM y recuperado con LoRA de etapa 2 |
| Parametros totales | 13.015.864.320 (50,00 % de los parámetros densos del base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de Llama-2-13b-chat; no confirmada en la información) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente bf16/fp16) |
| Idiomas soportados | no disponible |
| Licencia | Llama 2 Community License |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Llama-2-13b-chat-hf, un transformer decoder-only con atención causal estándar y 13 000 millones de parámetros. Sobre él se aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone matrices de pesos mediante valores singulares y elimina el 50,00 % de los parámetros (fracción resultante 0,5000). Posteriormente se ejecuta la etapa 2 de recuperación de SVD-LLM con LoRA secuencial sobre U y luego sobre V, usando el dataset alpaca-cleaned, rango r=8, alpha=16, 2 épocas, learning rate 1e-4, batch 64, cutoff 256 y precisión bf16. La semilla empleada es 42.

No se aplica ninguna selección ni reparación específica de seguridad: esta celda es la línea base plana de SVD-LLM. No hay datos publicados sobre el volumen total de tokens de entrenamiento original de Llama 2 ni sobre la composición exacta del dataset más allá de la mención a alpaca-cleaned en la etapa LoRA. Tampoco se documentan innovaciones adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional heredada de Llama-2-13b-chat, aunque degradada por la compresión.
- Razonamiento y respuesta a instrucciones en formato chat, con calidad reducida respecto al base.
- Capacidad multilingüe no documentada explícitamente; se asume la del modelo base, sin confirmación.
- Soporte de tool calling y function calling: no documentado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Modo thinking, visión o audio: no disponible.
- Uso previsto: sujeto experimental para medir el impacto de la compresión SVD en seguridad y utilidad.

## Casos de uso

- Investigación sobre compresión de modelos: sirve como punto de referencia para cuantificar cuánto degrada SVD-LLM al 50 % la perplexidad (10,7173 en WikiText-2) y la seguridad (ASR de 0,2442 en AdvBench) frente al Llama-2-13b-chat original.
- Estudio de alineación y seguridad: permite medir el aumento de la tasa de éxito de ataques adversariales inducido únicamente por la compresión, sin selección ni reparación posterior.
- Evaluación de over-refusal: el macro over-refusal de 0,1364 con WildGuard sirve para comparar cómo la compresión afecta al equilibrio entre rechazo y utilidad.
- Reproducibilidad de experimentos: al fijar semilla 42 y documentar hiperparámetros de la etapa LoRA, permite replicar exactamente la celda en una malla de compresión.
- Benchmarking de pipelines de compresión: útil para comparar SVD-LLM con otras técnicas (poda estructurada, cuantización) en términos de coste de seguridad y perplexidad.
- Docencia y divulgación: ejemplo didáctico de cómo una técnica de compresión aparentemente neutra altera propiedades de seguridad no medidas en la pérdida de entrenamiento.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,2442 |
| StrongREJECT ASR (juez HarmBench) | 0,2364 |
| Macro over-refusal (WildGuard) | 0,1364 |
| Perplexidad WikiText-2 | 10,7173 |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni comparaciones numéricas directas con el modelo base sin comprimir.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 26 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica se recomienda al menos 32 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 13-14 GB; en 4 bits, en torno a 7-8 GB (estimaciones, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100, L40S o RTX 6000 Ada para bf16 sin cuantizar; RTX 4090 (24 GB) requiere cuantización para caber con contexto largo.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 solo con cuantización de 8 o 4 bits; en GPUs de 16 GB o menos, únicamente con cuantización agresiva y contexto reducido.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag endpoints_compatible), vLLM y llama.cpp/Ollama previa conversión a GGUF (no se distribuye GGUF en el repo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svd-safety-l2b13_svdllm_r50 | 13,0 B (50 % denso) | no disponible | Llama 2 | ASR AdvBench 0,2442; PPL WikiText-2 10,7173 |
| meta-llama/Llama-2-13b-chat-hf | 13,0 B | 4096 tokens (documentado por Meta) | Llama 2 | Modelo base sin comprimir; referencia de seguridad y utilidad |
| Otras celdas de la malla de Jeesup | variable | no disponible | Llama 2 | Variantes con distintas reglas de selección y presupuestos; no disponibles en la información |

No se dispone de datos numéricos de benchmarks de las alternativas en la información proporcionada, por lo que la comparación cuantitativa queda limitada a la perplexidad y al ASR del propio checkpoint.

## Limitaciones y advertencias

- No es un modelo desplegable: el autor lo describe explícitamente como artefacto de investigación y advierte que varias ramas de la malla están deliberadamente degradadas en seguridad.
- La compresión por sí sola eleva la tasa de éxito de ataques (ASR de 0,2442 en AdvBench y 0,2364 en StrongREJECT), por lo que es previsible un comportamiento menos seguro que el Llama-2-13b-chat original.
- Riesgo de alucinación incrementado por la pérdida de capacidad asociada a la compresión y a la perplexidad de 10,7173 en WikiText-2.
- Idiomas soportados no documentados; el comportamiento multilingüe puede diferir del base.
- Longitud de contexto no confirmada en la información; se asume la del base pero sin garantía tras la compresión.
- Licencia Llama 2 Community License: restricciones de uso comercial y obligaciones de atribución recogidas en LICENSE.txt y USE_POLICY.md del repositorio.
- Sin datos publicados de MMLU, HumanEval o GSM8K, lo que impide evaluar la degradación en tareas de razonamiento y código.
- Cero descargas y cero likes en el momento de la consulta: sin validación comunitaria ni informes de uso independientes.

## Enlaces

- HuggingFace: https://huggingface.co/Jeesup/svd-safety-l2b13_svdllm_r50
- Modelo base: https://huggingface.co/meta-llama/Llama-2-13b-chat-hf
- Licencia Llama 2: incluida en el repositorio (LICENSE.txt y USE_POLICY.md)
- Paper de SVD-LLM, paper de HarmBench, paper de StrongREJECT y paper de WildGuard: no se proporcionan enlaces en la información disponible.
