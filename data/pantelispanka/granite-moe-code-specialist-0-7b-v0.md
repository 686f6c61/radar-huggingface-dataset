# Pantelispanka/granite-moe-code-specialist-0.7b-v0

## Resumen

Granite-MoE code specialist 0.7B (v0) es un modelo derivado de `ibm-granite/granite-3.1-1b-a400m-base` mediante una técnica de poda selectiva de expertos orientada a código Python. El autor, Pantelispanka, parte de la arquitectura MoE del modelo original de IBM (32 expertos por capa, ~400M activos) y conserva únicamente los 16 expertos por capa a los que se enrutan con mayor frecuencia los tokens de código, eliminando el resto. El resultado es un modelo de 730 millones de parámetros totales que mantiene la perplejidad en código del original de 1.33B (4.61 frente a 4.58), a costa de degradar severamente su rendimiento fuera del dominio de programación.

La relevancia del trabajo es metodológica: demuestra que el estudio de routing permite identificar expertos especializados y que la selección guiada por routing supera claramente a la selección aleatoria bajo el mismo proceso de reparación y fine-tuning (perplejidad en código de 4.61 frente a 5.95 con 16 expertos aleatorios). Se trata explícitamente de una prueba de concepto, no de un modelo listo para producción, y no está ajustado a instrucciones.

El modelo se publica bajo licencia Apache 2.0, en formato safetensors y con soporte para `transformers`, con un tamaño de repositorio de 1.5 GB. No se han publicado datos sobre idiomas soportados ni evaluación mediante pass@k.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE (granitemoe), poda selectiva de expertos |
| Parámetros totales | 730.252.288 (0.73B) |
| Parámetros activos | no disponible (el modelo base activa ~400M según su nombre; el valor exacto tras la poda no se documenta) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en bfloat16 según el ejemplo de uso) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de `granite-3.1-1b-a400m-base`, un transformer con mezcla de expertos (MoE) de IBM con 32 expertos por capa y aproximadamente 1.33B de parámetros totales. El proceso de construcción consta de cuatro fases: primero, un estudio de routing que muestra que el uso de expertos es muy estable dentro de una misma tarea (la divergencia por capa es entre 54 y 161 veces mayor entre tareas distintas que entre dos mitades de la misma tarea); segundo, la selección de los 16 expertos más usados por capa sobre datos de código de MBPP y HumanEval, eliminando el resto; tercero, una reparación en forma cerrada (mínimos cuadrados) de la `down_proj` de cada capa para reproducir la salida de la capa original en código, excluyendo del ajuste los tokens de attention sink; y cuarto, un fine-tuning por destilación del modelo original sobre código durante 400 pasos, con supervisión sobre los top-64 logits y entrenando únicamente `down_proj` y el router en una sola GPU de 8 GB.

La innovación principal es el criterio de poda guiado por routing frente a la poda aleatoria, validado empíricamente bajo idéntico protocolo de reparación y ajuste. El archivo `kept_experts.json` documenta qué expertos originales se conservaron en cada capa, lo que facilita la reproducibilidad del experimento.

## Capacidades

- Generación de código Python: el modelo está especializado en completar y generar código, evaluado mediante perplejidad sobre texto de estilo MBPP y HumanEval.
- Generación de texto autoregresiva estándar mediante `transformers` (`AutoModelForCausalLM`).
- Continuación de fragmentos de código a partir de un prefijo (por ejemplo, completar `def is_palindrome(s):`).
- No dispone de ajuste a instrucciones: no soporta diálogo instructivo ni seguimiento de instrucciones de forma fiable.
- Sin soporte documentado de tool calling, function calling ni razonamiento multi-paso.
- Sin capacidades de visión, audio ni modo de razonamiento explícito.
- Capacidades multilingües: no disponibles; el entrenamiento y la evaluación se centran en código.

## Casos de uso

- Autocompletado de código en entornos de desarrollo: el modelo puede recibir un prefijo de función o bloque Python y generar la continuación, aprovechando su especialización en código con perplejidad de 4.61 en el dominio de evaluación.
- Prototipado de pipelines de poda de modelos MoE: sirve como referencia reproducible (con `kept_experts.json`) para equipos que investiguen selección de expertos guiada por routing en arquitecturas MoE.
- Investigación sobre especialización de expertos: permite estudiar cómo se distribuye el routing de tokens de código en un MoE de IBM y qué expertos concentran la carga útil.
- Generación de fragmentos de código en tareas de benchmark: útil para experimentos controlados de evaluación de código donde se requiera un modelo pequeño (0.73B) y de bajo coste computacional.
- Docencia y experimentación en GPUs de consumo: al caber en una GPU de 8 GB en bfloat16, permite reproducir el proceso de destilación y poda en hardware asequible.
- Base para futuros fine-tunings específicos de código: al conservar la perplejidad del original en código con la mitad de parámetros, puede servir como punto de partida para ajustes posteriores en dominios concretos de programación.

## Benchmarks y rendimiento

Los únicos datos publicados son perplejidades sobre muestras reservadas (menor es mejor), sin evaluación pass@k:

| Modelo | Parámetros | Código | Matemáticas | Prosa |
|---|---|---|---|---|
| Original (granite-3.1-1b-a400m-base) | 1.33B | 4.58 | 1.97 | 10.15 |
| Este modelo (16 expertos por routing) | 0.73B | 4.61 | 10.6 | 173 |
| Misma receta, 16 expertos aleatorios | 0.73B | 5.95 | 30.3 | 610 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval pass@k, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1.5 GB en bfloat16 (0.73B parámetros), según el tamaño del repositorio; en cuantización de 8 bits o 4 bits sería inferior, aunque no se documentan artefactos GGUF.
- GPU recomendadas: cualquier GPU con al menos 8 GB de VRAM para el proceso de fine-tuning descrito por el autor; para inferencia basta con GPUs de consumo como RTX 3060, RTX 4060 o superiores.
- Cabe en GPU de consumo: sí, en bfloat16 ocupa del orden de 1.5 GB de pesos, por lo que encaja en GPUs con 4-8 GB de VRAM.
- Opciones de despliegue: `transformers` (soporte nativo, `AutoModelForCausalLM`); compatible con endpoints según los tags del repositorio. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Granite-MoE code specialist 0.7B (este modelo) | 0.73B | no disponible | MoE podado, especializado en código, sin instruction tuning | Apache 2.0 | Hugging Face |
| ibm-granite/granite-3.1-1b-a400m-base | 1.33B | no disponible | MoE base de IBM, propósito general | Apache 2.0 | Hugging Face |
| Misma receta con 16 expertos aleatorios | 0.73B | no disponible | Ablación del autor, peor perplejidad en código (5.95) | Apache 2.0 | No publicada como modelo independiente |

No se dispone de datos de benchmarks comparativos con modelos de código de tamaño similar (por ejemplo, variantes pequeñas de CodeLlama o Qwen-Coder) en la información proporcionada.

## Limitaciones y advertencias

- Prueba de concepto explícita: el autor indica que no es un modelo de producción.
- Degradación severa fuera de código: perplejidad en prosa de 173 frente a 10.15 del original, y en matemáticas de 10.6 frente a 1.97.
- No está ajustado a instrucciones, por lo que no es adecuado para diálogo ni para tareas que requieran seguir instrucciones.
- Evaluación limitada a perplejidad sobre texto de MBPP/HumanEval extraído de los mismos datasets usados en entrenamiento; no hay pass@k ni evaluación en datos externos, con riesgo de sobreajuste a la distribución de evaluación.
- Resultado de una única ejecución, sin validación cruzada ni réplicas.
- Riesgo de alucinación en generación de código no medido ni documentado.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no documentados; el foco es código, no lenguaje natural multilingüe.
- Licencia Apache 2.0, que permite uso comercial, pero la calidad del modelo en dominios ajenos al código desaconseja su uso en producción fuera de experimentación.
- Contexto máximo no documentado, lo que limita la planificación de despliegues con entradas largas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Pantelispanka/granite-moe-code-specialist-0.7b-v0
- Modelo base: https://huggingface.co/ibm-granite/granite-3.1-1b-a400m-base
