# Jeesup/svd-safety-q32_svdllm_r20

## Resumen

`Jeesup/svd-safety-q32_svdllm_r20` es un checkpoint de investigación derivado de Qwen2.5-32B-Instruct, comprimido mediante SVD-LLM hasta conservar el 80 % de los parámetros densos originales (se elimina un 20 %). Lo publica el usuario Jeesup como parte de un estudio sobre cómo la compresión por descomposición en valores singulares degrada el comportamiento de seguridad del modelo y qué regla de selección de componentes permite repararlo mejor. No es un modelo conversacional de propósito general, sino una celda concreta dentro de una matriz de experimentos sobre presupuestos de compresión y criterios de selección.

El checkpoint se ha recuperado con la etapa 2 de SVD-LLM (LoRA secuencial sobre U y luego V, con dataset alpaca-cleaned, r=8, alpha=16, 2 épocas, lr 1e-4, batch 64, cutoff 256 y bf16). Según la model card, no se aplica ninguna selección ni reparación específica orientada a seguridad: es la línea base "plana" de SVD-LLM. Su interés radica en que permite medir empíricamente el coste en seguridad de una compresión agresiva y compararlo con las variantes reparadas de la misma matriz.

El modelo conserva la arquitectura del Qwen2.5-32B-Instruct original (transformer decoder-only denso, 32 763 876 352 parámetros reales según safetensors) y la licencia Apache 2.0. Su relevancia es metodológica: sirve como artefacto reproducible para estudiar el equilibrio entre utilidad (perplejidad en WikiText-2 de 7,3961) y robustez frente a ataques de jailbreak (ASR de 0,0000 en AdvBench y StrongREJECT según el juez HarmBench), con una tasa de sobrerrechazo macro del 22,63 % medida con WildGuard.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (Qwen2) |
| Parametros totales | 32 763 876 352 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen2.5-32B-Instruct) |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponible en la informacion proporcionada |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El checkpoint parte de Qwen2.5-32B-Instruct, un transformer decoder-only denso con normalización RMSNorm, atención con RoPE y sesgos QKV, y sin mezcla de expertos. Sobre ese modelo se aplica SVD-LLM, una técnica de compresión post-entrenamiento que descompone las matrices de pesos y trunca componentes singulares para reducir el número de parámetros efectivos. En esta celda concreta se elimina el 20 % de los parámetros (fracción resultante 0,8000), con semilla 42.

Tras la compresión se ejecuta la etapa 2 de SVD-LLM: un ajuste LoRA secuencial sobre los factores U y luego V de la descomposición, usando alpaca-cleaned como dataset de recuperación, rango 8, alpha 16, 2 épocas, learning rate 1e-4, batch 64, longitud de corte 256 y precisión bf16. No se aplica ningún filtro ni reparación específica de seguridad, de modo que el checkpoint representa la línea base frente a la cual se comparan las variantes del estudio. La model card advierte explícitamente que varias celdas de la matriz están degradadas deliberadamente en seguridad y que la compresión por sí sola eleva la tasa de éxito de ataque.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen2.5-32B-Instruct.
- Razonamiento y resolución de problemas de complejidad media, con posible degradación respecto al original por la compresión SVD.
- Generación de código y matemáticas, condicionada al efecto de la compresión sobre las capas afectadas.
- Soporte de tool calling y function calling, presumiblemente conservado del modelo base (no verificado en la información proporcionada).
- Capacidades multilingües heredadas del modelo base, aunque no se documentan idiomas concretos en esta ficha.
- Modo de razonamiento explícito: no disponible en la información proporcionada.
- Visión y audio: no soportados (el modelo base Qwen2.5-32B-Instruct es solo texto).

## Casos de uso

- Estudio empírico del impacto de la compresión SVD en la seguridad: se usa como celda de control "sin reparación" para comparar tasas de éxito de ataque (AdvBench, StrongREJECT) frente a variantes reparadas de la misma matriz.
- Investigación sobre sobrerrechazo: la métrica de sobrerrechazo macro (0,2263 con WildGuard) permite analizar si la compresión incrementa los rechazos innecesarios en consultas benignas.
- Evaluación de perplejidad como proxy de calidad: la perplejidad de 7,3961 en WikiText-2 sirve para trazar la curva utilidad-compresión en el presupuesto del 80 %.
- Reproducibilidad de experimentos: la semilla 42 y los hiperparámetros documentados permiten replicar la celda y verificar resultados en estudios de compresión.
- Análisis de reglas de selección de componentes: al ser la línea base, permite aislar el efecto de cada regla de selección comparándola con las demás celdas de la matriz.
- Docencia y formación en interpretabilidad: sirve como ejemplo práctico de cómo una técnica de compresión post-entrenamiento altera propiedades de seguridad medibles sin cambios aparentes en la arquitectura.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| AdvBench ASR (juez HarmBench) | 0,0000 |
| StrongREJECT ASR (juez HarmBench) | 0,0000 |
| Sobrerrechazo macro (WildGuard) | 0,2263 |
| Perplejidad WikiText-2 | 7,3961 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 65,5 GB de pesos, más overhead de activaciones y caché KV; se recomienda al menos 80 GB.
- VRAM estimada en cuantización de 8 bits: en torno a 33 GB; en 4 bits, en torno a 17 GB (estimaciones orientativas, no verificadas en la información proporcionada).
- GPU recomendadas: A100 80 GB, H100 80 GB, o múltiples GPU con tensor parallelism (por ejemplo, 2×A100 40 GB o 2×RTX 4090 24 GB con cuantización).
- Cabe en GPU de consumo (RTX 4090 24 GB) solo con cuantización agresiva (4 bits) y posiblemente con offloading parcial a CPU.
- Opciones de despliegue: transformers, text-generation-inference (TGI), vLLM; llama.cpp y Ollama requerirían conversión a GGUF, no documentada en la información proporcionada.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Jeesup/svd-safety-q32_svdllm_r20 | 32,76 B (80 % del original) | no disponible | Apache 2.0 | Checkpoint de investigación comprimido con SVD-LLM, sin reparación de seguridad |
| Qwen/Qwen2.5-32B-Instruct | 32,76 B | no disponible en esta ficha | Apache 2.0 | Modelo base sin comprimir, referencia de utilidad y seguridad |
| Otras celdas de la matriz SVD-LLM de Jeesup | ~32,76 B con distintos presupuestos | no disponible | Apache 2.0 | Variantes con reglas de selección y reparación de seguridad distintas |

La comparación directa con modelos de la misma categoría (por ejemplo, Llama-3.1-70B-Instruct o Mistral-Large) no está disponible en la información proporcionada, y además no sería homogénea porque este checkpoint es un artefacto experimental, no un asistente desplegable.

## Limitaciones y advertencias

- No es un modelo de propósito general: la model card lo describe explícitamente como un artefacto de investigación y no como un asistente desplegable.
- La compresión SVD por sí sola eleva la tasa de éxito de ataque según el autor; aunque las métricas reportadas muestran ASR de 0,0000 en AdvBench y StrongREJECT, deben interpretarse en el contexto del juez HarmBench y de la evaluación concreta, no como garantía general.
- Sobrerrechazo macro del 22,63 % (WildGuard): puede rechazar consultas benignas con frecuencia superior a la deseable.
- Riesgo de alucinación no cuantificado en la información proporcionada; la compresión puede acentuarlo en dominios especializados.
- Idiomas soportados no documentados en esta ficha; se heredan del modelo base, pero su comportamiento tras la compresión no está verificado.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el autor advierte que no debe tratarse como un asistente listo para producción sin evaluación propia.
- La fecha de creación indicada (2026-11-04) es la reportada por Hugging Face; verificar su coherencia antes de citarla.

## Enlaces

- Hugging Face: https://huggingface.co/Jeesup/svd-safety-q32_svdllm_r20
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-32B-Instruct
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios o demos adicionales.
