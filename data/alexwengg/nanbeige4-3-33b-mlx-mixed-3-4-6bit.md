# alexwengg/Nanbeige4.3-33B-MLX-mixed-3-4-6bit

## Resumen

Nanbeige4.3-33B-MLX-mixed-3-4-6bit es una cuantización mixta (3/4/6 bits) del modelo Nanbeige4.3-33B, un LLM denso de 33.118 millones de parámetros desarrollado por el Nanbeige LLM Lab. Esta versión, publicada por el usuario alexwengg en Hugging Face, está optimizada para ejecutarse en Macs con Apple Silicon de 24 GB de memoria unificada, utilizando el framework MLX de Apple.

El modelo base es un transformer de arquitectura Llama con 52 capas, orientado a generación de texto conversacional y uso como agente, con soporte de llamadas a herramientas en formato XML y un modo de razonamiento ("thinking mode") activable mediante la plantilla de chat. El modelo original está entrenado principalmente para inglés y chino.

La relevancia de esta variante radica en que permite ejecutar un modelo de 33B con calidad razonable en hardware de consumo Apple (M5 Pro de 24 GB), alcanzando unos 16 tok/s en decodificación y hasta 25-27 tok/s con decodificación especulativa usando Nanbeige4.1-3B como draft model. Es una opción interesante para desarrolladores que necesitan un modelo agéntico local sin depender de GPUs NVIDIA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso tipo Llama (52 capas) |
| Parametros totales | 33.118.977.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mixta: 3 bits (MLP gate/up), 4 bits (atención q/k/v/o, MLP down, embeddings), 6 bits (lm_head), normas en BF16; afín con group size 64 |
| Idiomas soportados | Inglés, chino |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo base, Nanbeige4.3-33B, es un transformer denso de tipo Llama con 52 capas, sin mezcla de expertos. Esta cuantización emplea cuantización afín por grupos de 64 con una asignación de bits sensible a la tolerancia de cada componente: los proyectores gate y up del MLP (los más tolerantes a la pérdida de precisión) usan 3 bits, la atención y el down_proj del MLP junto con los embeddings usan 4 bits, y la cabeza de salida (lm_head) usa 6 bits para preservar la calidad de la distribución de tokens. Las normas se mantienen en BF16.

No hay información disponible sobre los datos de entrenamiento del modelo base (número de tokens, composición del dataset ni uso de RLHF/DPO). La cuantización se realizó directamente desde los pesos BF16 originales, convirtiendo shard a shard para no necesitar los 66 GB del checkpoint completo en disco. Una innovación destacable documentada es el soporte de decodificación especulativa con Nanbeige4.1-3B (mismo tokenizador) como draft model, con tasas de aceptación del 63-76% en código.

## Capacidades

- Generación de texto conversacional en inglés y chino
- Razonamiento con modo "thinking" activable (`enable_thinking=True` por defecto, genera razonamiento primero; `False` responde directamente), con control de preservación del razonamiento (`preserve_thinking`)
- Generación de código: 7/8 problemas estilo LeetCode superados en un smoke test (Two Sum, Merge Intervals, Longest Substring, LRU Cache, Word Ladder, Trapping Rain Water, Median of Two Sorted Arrays; falla Regex Matching sin razonamiento)
- Uso como agente: llamadas a herramientas nativas en formato XML (recomendado `tool_call_format="xml"`), verificado como agente de terminal aislado con herramienta bash, capaz de encontrar y corregir bugs en un repositorio y validar con la suite de tests
- Soporte de servidor compatible con la API de OpenAI (`mlx_lm.server`)
- Decodificación especulativa compatible con Nanbeige4.1-3B como draft model

## Casos de uso

- Agente de terminal para mantenimiento de código: puede ejecutar comandos bash, localizar bugs en un repositorio, aplicar correcciones y verificar con la suite de tests, todo en un flujo multi-paso autónomo (demostrado corrigiendo 3 bugs en unos 8 comandos)
- Programación asistida local: generación y depuración de código Python y algoritmos directamente en un Mac de 24 GB, sin enviar código propietario a la nube
- Chatbot local con razonamiento: el modo thinking permite respuestas deliberadas para tareas de lógica y matemáticas, con control fino de muestreo (temperatura 0.6 / top-p 0.95 recomendado)
- Asistente conversacional bilingüe inglés-chino para entornos sin conexión a internet
- Backend local de aplicaciones mediante servidor OpenAI-compatible: sustituye a APIs de pago en prototipos y herramientas de desarrollo
- Experimentación con decodificación especulativa en Apple Silicon: combinación con Nanbeige4.1-3B para duplicar el throughput en generación de código
- Automatización de tareas agénticas de bajo volumen con recomendación de temperatura 1.0 / top-p 0.95 según la model card del modelo base

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Solo existe un smoke test no representativo del autor de la cuantización:

| Prueba | Esta cuantización | Variante 3-bit |
|---|---|---|
| Problemas LeetCode (8 total) | 7/8 | 5/8 |
| Decodificación (tok/s, M5 Pro 24 GB) | ~15-16,5 | ~17,5 |
| Decodificación con draft 4-bit (código) | 25-27 | no disponible |
| Decodificación con draft 4-bit (prosa) | ~19 | no disponible |

Estos datos son mediciones del autor en un Apple M5 Pro con 24 GB, no benchmarks oficiales del modelo base.

## Requisitos de hardware

- VRAM/memoria: 15,7 GiB de pesos activos, con pico de unos 17 GB durante la generación; diseñado para Macs Apple Silicon de 24 GB de memoria unificada
- Con decodificación especulativa (draft model 4-bit de 3B incluido), el pico conjunto ronda los 19,3 GB, ajustado en una máquina de 24 GB
- En GPUs NVIDIA no hay versiones GGUF/AWQ documentadas en este repositorio; esta variante es específica de MLX (Apple Silicon)
- GPU recomendada: Apple M-series con al menos 24 GB de memoria unificada (medido en M5 Pro); no disponible información para configuraciones menores
- Despliegue: `mlx-lm` (CLI y Python), servidor OpenAI-compatible vía `mlx_lm.server`; no se documentan vLLM, TGI, llama.cpp u Ollama para esta variante
- Rendimiento medido: carga en 3-5 s, ~15-16,5 tok/s en decodificación de un solo flujo (limitado por ancho de banda de memoria); 25-27 tok/s en código con decodificación especulativa
- Bajo presión de memoria (navegador y otras apps abiertas) se espera swapping y menor rendimiento

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Tamaño | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nanbeige4.3-33B-MLX-mixed-3-4-6bit | 33,1B | Mixta 3/4/6-bit | 15,7 GiB | Apache-2.0 | MLX, Apple Silicon |
| Nanbeige4.3-33B-MLX-3bit (mismo autor) | 33,1B | 3-bit | 13,9 GiB | Apache-2.0 | MLX, Apple Silicon |
| Nanbeige/Nanbeige4.3-33B (base) | 33,1B | BF16 | ~66 GB | Apache-2.0 | Pesos originales, requiere hardware servidor |

Comparado con su variante 3-bit, esta cuantización mixta ofrece mejor calidad (7/8 frente a 5/8 en el smoke test de código) a costa de algo menos de velocidad (~16 frente a ~17,5 tok/s) y 1,8 GiB más de memoria. Frente al modelo base BF16, permite inferencia en hardware de consumo. No hay datos comparativos disponibles frente a otros modelos de 33B de terceros (Qwen, Llama, etc.) en la información proporcionada.

## Limitaciones y advertencias

- Los datos de rendimiento y calidad provienen de un smoke test de 8 problemas sin razonamiento a temperatura 0.6; no deben tratarse como benchmarks representativos
- Falla en problemas que requieren razonamiento profundo sin activar el modo thinking (caso de Regex Matching)
- La longitud de contexto máxima del modelo no está documentada en la información disponible
- El soporte de idiomas se limita a inglés y chino; no hay información sobre rendimiento en castellano
- La velocidad de decodificación está limitada por el ancho de banda de memoria y degrada notablemente bajo presión de memoria en Macs de 24 GB (riesgo de swapping)
- La combinación con draft model consume ~19,3 GB, muy ajustada en máquinas de 24 GB; conviene cerrar otras aplicaciones
- No hay información sobre sesgos conocidos ni tasas de alucinación del modelo base
- La licencia Apache-2.0 permite uso comercial sin restricciones destacables

## Enlaces

- Repositorio de la cuantización: https://huggingface.co/alexwengg/Nanbeige4.3-33B-MLX-mixed-3-4-6bit
- Modelo base: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Variante 3-bit del mismo autor: https://huggingface.co/alexwengg/Nanbeige4.3-33B-MLX-3bit
- Draft model para decodificación especulativa: https://huggingface.co/Nanbeige/Nanbeige4.1-3B
- Framework MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
