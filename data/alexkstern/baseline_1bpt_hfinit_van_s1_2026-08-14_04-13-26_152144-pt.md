# alexkstern/baseline_1Bpt_hfinit_van_s1_2026-08-14_04-13-26_152144-pt

## Resumen

El modelo `baseline_1Bpt_hfinit_van_s1_2026-08-14_04-13-26_152144-pt` es un modelo de lenguaje de aproximadamente 1.000 millones de parámetros, entrenado por Alex Stern (alexkstern) utilizando el framework [nanochat](https://github.com/karpathy/nanochat), una herramienta de investigación para entrenamiento de modelos GPT a escala reducida. Se trata de un checkpoint intermedio (paso 3.814) de un experimento de escalado con 1.000 millones de tokens del dataset `fineweb-nanochatbpe-20B`, diseñado para estudiar el comportamiento de la pérdida y el rendimiento en función de la dosis de tokens.

El modelo emplea una arquitectura transformer decoder-only estándar con 16 capas, 8 cabezas de atención, dimensión de embedding de 1024 y un vocabulario de 65.536 tokens. Su longitud de contexto es de 2.048 tokens. No se ha publicado ninguna evaluación de capacidades ni benchmarks, por lo que debe considerarse un artefacto de investigación, no un modelo listo para producción. Su relevancia radica en que forma parte de una serie de réplicas con semilla fija para analizar la reproducibilidad y las leyes de escalado en el régimen de 1B parámetros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (GPT-like) |
| Parametros totales | ~1.000 millones (1B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 2.048 tokens |
| Tipos de cuantizacion | no disponible (solo pesos en formato .pt) |
| Idiomas soportados | no disponible (probablemente ingles, por el dataset FineWeb) |
| Licencia | Apache-2.0 |
| Formato de pesos | PyTorch state_dict (.pt) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only convencional, sin innovaciones destacables: 16 capas, 8 cabezas de atención (todas ellas de tipo clave-valor, sin GQA ni MQA), dimensión de embedding 1024 y vocabulario de 65.536 tokens. El modelo fue entrenado con el framework nanochat, que implementa un pipeline de preentrenamiento estándar con optimizador AdamW (sin weight decay), gradiente clipping y una programación de tasa de aprendizaje trapezoidal con calentamiento nulo y descenso del 40% del total de pasos.

El entrenamiento utilizó 1.000 millones de tokens del dataset `fineweb-nanochatbpe-20B`, con un tamaño de lote de 32 secuencias de 2.048 tokens por paso y una única acumulación de gradiente. El checkpoint guardado corresponde al paso 3.814, con una pérdida de entrenamiento suavizada de 3.171 y un objetivo mínimo de 0.947. No se aplicó ninguna técnica de alineación (RLHF, DPO, etc.) ni se utilizó un modelo de pensamiento previo (PPT). El experimento está registrado en Weights & Biases con el grupo `1e9tok_vanilla`.

## Capacidades

No se ha publicado información detallada sobre las capacidades del modelo. Dado que es un modelo de lenguaje preentrenado sin ajuste fino, se espera que pueda realizar generación de texto y completar secuencias, pero no hay evidencia de capacidades específicas como razonamiento avanzado, generación de código, tool calling o soporte multilingüe. La información disponible no permite afirmar ninguna capacidad concreta más allá de la modelización del lenguaje.

## Casos de uso

Al tratarse de un modelo de investigación sin evaluación publicada, los casos de uso son principalmente académicos y experimentales:

- Estudio de leyes de escalado: el modelo sirve para analizar cómo varía la pérdida en función del número de tokens y parámetros, comparando con otras réplicas de la misma serie.
- Reproducibilidad de experimentos: al estar fijada la semilla (seed 1), permite verificar la consistencia de los resultados de entrenamiento con nanochat.
- Análisis de interpretabilidad: al ser un modelo pequeño y con arquitectura simple, puede usarse para estudiar mecanismos internos de atención y representaciones.
- Desarrollo de técnicas de entrenamiento eficiente: el checkpoint puede servir como punto de partida para probar métodos de continuación de entrenamiento, destilación o poda.
- Comparación de datasets: al entrenarse con `fineweb-nanochatbpe-20B`, puede usarse para evaluar la calidad de ese tokenizador y dataset frente a otros.
- Investigación en regularización y optimización: la configuración de LR trapezoidal y la ausencia de weight decay permiten estudiar su efecto en el entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo incluye métricas de entrenamiento (pérdida suavizada y objetivo mínimo), pero no resultados en tareas downstream como MMLU, HumanEval o GSM8K. No se dispone de datos para comparar con otros modelos.

## Requisitos de hardware

No se han publicado requisitos oficiales de hardware. Sin embargo, dado el tamaño del modelo (~1B parámetros), se puede estimar:

- VRAM estimada para inferencia: en precisión fp32, los pesos ocupan aproximadamente 4 GB; en fp16, unos 2 GB; en int8, alrededor de 1 GB. A esto hay que sumar la memoria para activaciones y KV-cache, que con contexto 2048 y 16 capas es modesta.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM puede ejecutar el modelo en fp16 (por ejemplo, RTX 3050, RTX 2060, GTX 1660 Ti). Para mayor comodidad, una RTX 3060 o superior es suficiente.
- Compatibilidad con GPU de consumo: sí, cabe en la mayoría de GPUs consumer actuales.
- Opciones de despliegue: al estar en formato .pt, se puede cargar directamente con PyTorch. Para servir en producción, habría que convertirlo a formatos como GGUF (para llama.cpp u Ollama) o usar vLLM con conversión previa. No se proporcionan archivos listos para estos frameworks.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de este modelo, por lo que no es posible realizar una comparativa cuantitativa con alternativas de la misma categoría (modelos de ~1B parámetros como TinyLlama-1.1B, Qwen1.5-1.8B o SmolLM-1.7B). La comparativa se limita a características arquitectónicas:

| Modelo | Parametros | Contexto | Licencia | Formato |
|---|---|---|---|---|
| baseline_1Bpt (este) | ~1B | 2.048 | Apache-2.0 | .pt |
| TinyLlama-1.1B | 1.1B | 2.048 | Apache-2.0 | safetensors, GGUF |
| Qwen1.5-1.8B | 1.8B | 32.768 | Apache-2.0 | safetensors, GGUF |
| SmolLM-1.7B | 1.7B | 2.048 | Apache-2.0 | safetensors, GGUF |

La principal diferencia es que los modelos comparables han sido evaluados y optimizados para uso práctico, mientras que este checkpoint es un artefacto de investigación sin evaluación pública.

## Limitaciones y advertencias

- Modelo de investigación sin ajuste fino: no ha pasado por procesos de alineación (RLHF, DPO), por lo que puede generar contenido sesgado, tóxico o incorrecto.
- Sin evaluación de sesgos: no se ha realizado ningún estudio de sesgos demográficos o culturales.
- Riesgo de alucinación: al ser un modelo de lenguaje puro, es propenso a inventar información cuando se le pide responder preguntas factuales.
- Contexto limitado: 2.048 tokens es una ventana corta para tareas que requieren contexto largo.
- Idiomas: no se especifica, pero el dataset FineWeb es predominantemente inglés, por lo que el rendimiento en otros idiomas será muy limitado.
- Formato de pesos: solo .pt, requiere conversión para usar con herramientas estándar de inferencia (llama.cpp, vLLM, etc.).
- Sin garantías de producción: al no haber benchmarks ni pruebas de estabilidad, no es recomendable su uso en aplicaciones críticas.
- Licencia Apache-2.0: permite uso comercial, pero el autor no ofrece soporte ni garantías.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/alexkstern/baseline_1Bpt_hfinit_van_s1_2026-08-14_04-13-26_152144-pt)
- [Registro de entrenamiento en W&B](https://wandb.ai/alexksternteam/token_dose_1Bpt_seed_replicas_v1/runs/b9an2rpp)
- [Repositorio nanochat](https://github.com/karpathy/nanochat)
